import logging
from datetime import timedelta
from typing import List

from fastapi import APIRouter, HTTPException, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models, schemas
from app.auth_utils import admin_required, create_access_token

logger = logging.getLogger("app.officers")

router = APIRouter(prefix="/officers", tags=["Officers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Officer Authentication Endpoints

# Endpoint: POST /officers/login
# Description: Authenticates an officer using email and password, and returns a JWT token along with officer details.
@router.post("/login", response_model=schemas.TokenResponse)
def officer_login(officer: schemas.OfficerLoginSchema, db: Session = Depends(get_db)):
    logger.debug(f"Officer login attempt for email: {officer.email}")
    db_officer = db.query(models.Officer).filter(models.Officer.email == officer.email).first()
    if not db_officer:
        logger.error("Incorrect email provided for officer login")
        raise HTTPException(status_code=400, detail="Incorrect email")
    
    if officer.password != db_officer.password:
        logger.error("Incorrect password for officer login")
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    if db_officer.archived:
        logger.error(f"Archived officer {db_officer.id} attempted to log in")
        raise HTTPException(status_code=403, detail="Officer account is archived and cannot log in.")
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(data={"sub": str(db_officer.id)}, expires_delta=access_token_expires)
    logger.info(f"Officer {db_officer.id} ({db_officer.full_name}) logged in successfully")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "officer": db_officer
    }

# Endpoint: GET /officers/
# Description: Returns a list of all active officers for a logged-in officer.
@router.get("/", response_model=List[schemas.OfficerSchema])
def get_officers(db: Session = Depends(get_db), current_officer: models.Officer = Depends(admin_required)):

    logger.debug(f"get_officers called by Officer {current_officer.id} ({current_officer.full_name})")
    officers = db.query(models.Officer).filter(models.Officer.archived == False).all()
    logger.info(f"Officer {current_officer.id} fetched {len(officers)} officers")
    return officers

# Endpoint: GET /officers/ (Admin)
# Description: Allows an admin to fetch all active officers.
@router.get("/", response_model=List[schemas.OfficerSchema], dependencies=[Depends(admin_required)])
def get_officers_admin(db: Session = Depends(get_db)):
    logger.debug("Admin fetching all active officers")
    officers = db.query(models.Officer).filter(models.Officer.archived == False).all()
    logger.info(f"Admin fetched {len(officers)} officers")
    return officers

# Endpoint: POST /officers/
# Description: Allows an admin to create a new officer account.
@router.post("/", response_model=schemas.OfficerSchema, dependencies=[Depends(admin_required)])
def create_officer(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    student_number: str = Form(...),
    year: str = Form(...),
    block: str = Form(...),
    position: str = Form(...),
    db: Session = Depends(get_db)
):
    logger.debug(f"Admin creating officer with email: {email}")
    existing = db.query(models.Officer).filter(
        (models.Officer.email == email) | (models.Officer.student_number == student_number)
    ).first()
    if existing:
        logger.error("Officer with this email or student number already exists")
        raise HTTPException(status_code=400, detail="Officer with this email or student number already exists")
    
    officer = models.Officer(
        full_name=full_name,
        email=email,
        password=password,
        student_number=student_number,
        year=year,
        block=block,
        position=position,
        archived=False
    )
    db.add(officer)
    db.commit()
    db.refresh(officer)
    logger.info(f"Officer created successfully with id: {officer.id}")
    return officer

# Endpoint: PUT /officers/{officer_id}
# Description: Allows an admin to update an existing officer's details.
@router.put("/{officer_id}", response_model=schemas.OfficerSchema, dependencies=[Depends(admin_required)])
def update_officer(
    officer_id: int,
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    student_number: str = Form(...),
    year: str = Form(...),
    block: str = Form(...),
    position: str = Form(...),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(admin_required)
):
    logger.debug(f"Officer {current_officer.id} ({current_officer.full_name}) updating officer id: {officer_id}")
    officer = db.query(models.Officer).filter(models.Officer.id == officer_id, models.Officer.archived == False).first()
    if not officer:
        logger.error("Officer not found for update")
        raise HTTPException(status_code=404, detail="Officer not found")
    officer.full_name = full_name
    officer.email = email
    officer.password = password
    officer.student_number = student_number
    officer.year = year
    officer.block = block
    officer.position = position
    db.commit()
    db.refresh(officer)
    logger.info(f"Officer {officer_id} updated successfully by Officer {current_officer.id}")
    return officer

# Endpoint: DELETE /officers/{officer_id}
# Description: Archives an officer account.
@router.delete("/{officer_id}", response_model=dict, dependencies=[Depends(admin_required)])
def delete_officer(officer_id: int, db: Session = Depends(get_db), current_officer: models.Officer = Depends(admin_required)):
    logger.debug(f"Officer {current_officer.id} ({current_officer.full_name}) deleting officer id: {officer_id}")
    officer = db.query(models.Officer).filter(models.Officer.id == officer_id, models.Officer.archived == False).first()
    if not officer:
        logger.error("Officer not found for deletion")
        raise HTTPException(status_code=404, detail="Officer not found")
    officer.archived = True
    db.commit()
    logger.info(f"Officer {officer_id} archived successfully by Officer {current_officer.id}")
    return {"detail": "Officer archived successfully"}

# Endpoint: POST /officers/import
# Description: Allows an admin to import officer records from an Excel file.
@router.post("/import", response_model=dict, dependencies=[Depends(admin_required)])
async def import_officers(file: UploadFile = File(...), db: Session = Depends(get_db)):
    logger.debug(f"Admin importing officers from file: {file.filename}")
    if not file.filename.endswith(('.xls', '.xlsx')):
        logger.error("Invalid file type for import")
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel file.")

    try:
        contents = await file.read()
        import pandas as pd
        df = pd.read_excel(contents)
    except Exception as e:
        logger.error("Error reading Excel file", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")

    created_officers = 0
    for index, row in df.iterrows():
        if pd.isna(row.get("email")) or pd.isna(row.get("student_number")):
            continue
        existing = db.query(models.Officer).filter(
            (models.Officer.email == row["email"]) | 
            (models.Officer.student_number == row["student_number"])
        ).first()
        if existing:
            continue
        officer = models.Officer(
            full_name=row.get("full_name", ""),
            email=row["email"],
            password=row.get("password", ""),
            student_number=row["student_number"],
            year=row.get("year", ""),
            block=row.get("block", ""),
            position=row.get("position", ""),
            archived=False
        )
        db.add(officer)
        db.commit()
        db.refresh(officer)
        created_officers += 1

    logger.info(f"Imported {created_officers} officers successfully")
    return {"detail": f"Imported {created_officers} officer(s) successfully."}
