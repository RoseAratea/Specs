import logging
from datetime import timedelta, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models, schemas, auth_utils
from app.auth_utils import create_access_token, get_current_user

logger = logging.getLogger("app.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint: POST /auth/login
# Description: Authenticates a user with email/student_number and password. If successful, updates the user's last active time (using Philippine Time)
# and returns a JWT access token.
@router.post("/login", response_model=dict)
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    logger.debug(f"Login attempt for user: {user_login.email_or_student_number}")
    
    # Check if login is using email or student number
    db_user = None
    if '@' in user_login.email_or_student_number:
        # Login with email
        db_user = auth_utils.get_user_by_email(db, user_login.email_or_student_number)
        logger.debug(f"Login attempt using email: {user_login.email_or_student_number}")
    else:
        # Login with student number
        db_user = auth_utils.get_user_by_student_number(db, user_login.email_or_student_number)
        logger.debug(f"Login attempt using student number: {user_login.email_or_student_number}")
    
    if not db_user or db_user.password != user_login.password:
        logger.error(f"Invalid credentials for user: {user_login.email_or_student_number}")
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    philippine_tz = timezone(timedelta(hours=8))
    db_user.last_active = datetime.now(philippine_tz)
    db.commit()
    logger.info(f"User {db_user.id} ({db_user.full_name}) logged in; last_active updated")
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=access_token_expires
    )
    logger.info(f"Access token created for user {db_user.id} ({db_user.full_name})")
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint: GET /auth/profile
# Description: Returns the profile of the currently authenticated user.
@router.get("/profile", response_model=schemas.User)
def read_user_profile(current_user: models.User = Depends(get_current_user)):
    logger.debug(f"Fetching profile for user {current_user.id} ({current_user.full_name})")
    return current_user