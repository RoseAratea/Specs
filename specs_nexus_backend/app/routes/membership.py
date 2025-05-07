import logging
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel

from app.database import SessionLocal
from app import models, schemas
from app.auth_utils import get_current_user, get_current_officer

logger = logging.getLogger("app.membership")

router = APIRouter(prefix="/membership", tags=["Membership"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# QR Code Endpoints


# Endpoint: GET /membership/qrcode
# Description: Returns the QR code URL for the specified payment type ("gcash" or "paymaya")
@router.get("/qrcode", response_model=dict)
def get_qrcode(payment_type: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logger.debug(f"User {current_user.id} ({current_user.full_name}) fetching QR code for payment type: {payment_type}")
    if payment_type not in ["gcash", "paymaya"]:
        logger.error(f"User {current_user.id} provided invalid payment type: {payment_type}")
        raise HTTPException(status_code=400, detail="Payment type must be 'gcash' or 'paymaya'")
    qr_record = db.query(models.QRCode).first()
    if not qr_record:
        logger.error("QR code record not found")
        raise HTTPException(status_code=404, detail="QR code not found")
    url = qr_record.gcash if payment_type == "gcash" else qr_record.paymaya
    if url and not url.startswith("http"):
        url = f"http://localhost:8000{url if url.startswith('/') else '/' + url}"
    logger.info(f"User {current_user.id} fetched QR code URL: {url}")
    return {"qr_code_url": url}

# Endpoint: POST /membership/officer/requirement/upload_qrcode
# Description: Allows an officer to upload a QR code image for a specific membership requirement and payment type.
@router.post("/officer/requirement/upload_qrcode", response_model=schemas.MembershipSchema)
async def upload_officer_requirement_qrcode(
    requirement: str,
    payment_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} ({current_officer.full_name}) uploading QR code for requirement: {requirement} and payment type: {payment_type}")
    if payment_type not in ["gcash", "paymaya"]:
        logger.error(f"Officer {current_officer.id} provided invalid payment type: {payment_type}")
        raise HTTPException(status_code=400, detail="Payment type must be 'gcash' or 'paymaya'")
    
    qrcode_dir = "static/qrcodes"
    os.makedirs(qrcode_dir, exist_ok=True)
    
    file_path = os.path.join(qrcode_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    qr_record = db.query(models.QRCode).first()
    if not qr_record:
        qr_record = models.QRCode()
        db.add(qr_record)
        db.commit()
        db.refresh(qr_record)
    
    if payment_type == "gcash":
        qr_record.gcash = file_path
    else:
        qr_record.paymaya = file_path
    
    db.commit()
    db.refresh(qr_record)
    logger.info(f"Officer {current_officer.id} uploaded QR code successfully for {payment_type}")
    # Return a dummy membership schema for display purposes.
    return {
        "id": 0,
        "receipt_path": None,
        "status": "N/A",
        "payment_status": "N/A",
        "requirement": requirement,
        "amount": None,
        "qr_code_url": qr_record.gcash if payment_type == "gcash" else qr_record.paymaya,
        "archived": False,
        "user": None
    }

# ----------------------
# User Endpoints
# ----------------------

# Endpoint: GET /membership/memberships/{user_id}
# Description: Returns a list of membership records (clearances) for the specified user.
@router.get("/memberships/{user_id}", response_model=List[schemas.MembershipSchema])
def get_memberships(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    logger.debug(f"User {current_user.id} ({current_user.full_name}) fetching memberships for user_id: {user_id}")
    memberships = db.query(models.Clearance)\
        .options(joinedload(models.Clearance.user))\
        .filter(models.Clearance.user_id == user_id, models.Clearance.archived == False)\
        .all()
    logger.info(f"User {current_user.id} fetched {len(memberships)} membership records for user_id: {user_id}")
    return memberships

# Endpoint: POST /membership/upload_receipt_file
# Description: Allows a user to upload a receipt file. Returns the file path after saving.
@router.post("/upload_receipt_file", response_model=dict)
async def upload_receipt_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    logger.debug(f"User {current_user.id} ({current_user.full_name}) uploading a receipt file")
    receipt_dir = "app/static/receipts"
    os.makedirs(receipt_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(receipt_dir, unique_filename)
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        logger.error(f"Error saving receipt file for user {current_user.id}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error saving receipt file")
    
    logger.info(f"User {current_user.id} saved receipt file: {file_path}")
    return {"file_path": file_path}

class UpdateReceiptPayload(BaseModel):
    membership_id: int
    payment_type: str  # Expect "gcash" or "paymaya"
    receipt_path: str

# Endpoint: PUT /membership/update_receipt
# Description: Updates the receipt information for a membership record.
@router.put("/update_receipt", response_model=schemas.MembershipSchema)
def update_receipt(
    payload: UpdateReceiptPayload, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logger.debug(f"User {current_user.id} ({current_user.full_name}) updating receipt for membership_id: {payload.membership_id}")
    payment_type = payload.payment_type.lower().strip()
    if payment_type not in ["gcash", "paymaya"]:
        logger.error(f"User {current_user.id} provided invalid payment_type: {payment_type}")
        raise HTTPException(status_code=400, detail="Invalid payment_type")
    
    membership = db.query(models.Clearance)\
                   .filter(models.Clearance.id == payload.membership_id,
                           models.Clearance.archived == False)\
                   .first()
    if not membership:
        logger.error(f"Membership record not found for id: {payload.membership_id} (User {current_user.id})")
        raise HTTPException(status_code=404, detail="Membership not found")
    
    membership.receipt_path = payload.receipt_path
    membership.payment_status = "Verifying"
    membership.status = "Processing"
    membership.payment_method = payment_type

    db.commit()
    db.refresh(membership)
    logger.info(f"User {current_user.id} updated receipt for membership_id: {payload.membership_id}")
    return membership

# ----------------------
# Officer Endpoints (Membership Management)
# ----------------------

# Endpoint: GET /membership/officer/list
# Description: Allows an officer to fetch all active membership records.
@router.get("/officer/list", response_model=List[schemas.MembershipSchema])
def officer_list_membership(
    db: Session = Depends(get_db), 
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} ({current_officer.full_name}) fetching membership records")
    memberships = db.query(models.Clearance)\
        .options(joinedload(models.Clearance.user))\
        .filter(models.Clearance.archived == False)\
        .all()
    logger.info(f"Officer {current_officer.id} fetched {len(memberships)} membership records")
    return memberships

# Endpoint: POST /membership/officer/create
# Description: Allows an officer to create a new membership record for a user.
@router.post("/officer/create", response_model=schemas.MembershipSchema)
def officer_create_membership(
    user_id: int = Form(...),
    amount: float = Form(...),
    payment_status: str = Form(...),
    requirement: str = Form(...),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} creating membership record for user_id: {user_id}")
    new_record = models.Clearance(
        user_id=user_id,
        amount=amount,
        payment_status=payment_status,
        requirement=requirement,
        status="Not Yet Cleared",
        receipt_path="",
        archived=False
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    logger.info(f"Membership record {new_record.id} created for user_id: {user_id} by officer {current_officer.id}")
    return new_record

# Endpoint: PUT /membership/officer/verify/{membership_id}
# Description: Allows an officer to verify (approve or deny) a membership record.
@router.put("/officer/verify/{membership_id}", response_model=schemas.MembershipSchema)
def officer_verify_membership(
    membership_id: int,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} verifying membership record id: {membership_id}")
    action = payload.get("action")
    if action not in ["approve", "deny"]:
        logger.error(f"Officer {current_officer.id} provided invalid action: {action} for membership_id: {membership_id}")
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'deny'.")
    
    membership = db.query(models.Clearance)\
        .filter(models.Clearance.id == membership_id, models.Clearance.archived == False)\
        .first()
    if not membership:
        logger.error(f"Membership record {membership_id} not found (Officer {current_officer.id})")
        raise HTTPException(status_code=404, detail="Membership record not found")
    
    if action == "approve":
        membership.payment_status = "Paid"
        membership.status = "Clear"
    elif action == "deny":
        membership.payment_status = "Not Paid"
        membership.status = "Not Yet Cleared"
        membership.receipt_path = None
        membership.payment_method = None  # Reset payment_method when denied.
    
    db.commit()
    db.refresh(membership)
    logger.info(f"Officer {current_officer.id} updated membership record {membership_id} with action {action}")
    return membership

# Endpoint: GET /membership/officer/requirements
# Description: Returns a list of distinct membership requirements from active records.
@router.get("/officer/requirements", response_model=List[schemas.MembershipSchema])
def get_officer_requirements(
    db: Session = Depends(get_db), 
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} fetching membership requirements")
    clearances = db.query(models.Clearance).filter(models.Clearance.archived == False).all()
    grouped = {}
    for c in clearances:
        if c.requirement not in grouped:
            grouped[c.requirement] = c
    result = list(grouped.values())
    logger.info(f"Officer {current_officer.id} fetched {len(result)} distinct membership requirements")
    return result

# Endpoint: PUT /membership/officer/requirements/{requirement}
# Description: Allows an officer to update membership requirement details (like amount) for all records with that requirement.
@router.put("/officer/requirements/{requirement}", response_model=schemas.MembershipSchema)
def update_officer_requirement(
    requirement: str, 
    payload: dict = Body(...), 
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} updating membership requirement: {requirement}")
    records = db.query(models.Clearance).filter(models.Clearance.requirement == requirement, models.Clearance.archived == False).all()
    if not records:
        logger.error(f"Requirement {requirement} not found for update (Officer {current_officer.id})")
        raise HTTPException(status_code=404, detail="Requirement not found")
    for r in records:
        if "amount" in payload:
            r.amount = payload["amount"]
    db.commit()
    logger.info(f"Officer {current_officer.id} updated requirement {requirement} successfully")
    return records[0]

# Endpoint: DELETE /membership/officer/requirements/{requirement}
# Description: Allows an officer to archive all membership records for a given requirement.
@router.delete("/officer/requirements/{requirement}", response_model=schemas.MessageResponse)
def delete_officer_requirement(
    requirement: str, 
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} archiving membership requirement: {requirement}")
    records = db.query(models.Clearance).filter(models.Clearance.requirement == requirement, models.Clearance.archived == False).all()
    if not records:
        logger.error(f"Requirement {requirement} not found for archiving (Officer {current_officer.id})")
        raise HTTPException(status_code=404, detail="Requirement not found")
    for r in records:
        r.archived = True
    db.commit()
    logger.info(f"Officer {current_officer.id} archived requirement {requirement} successfully")
    return {"message": "Requirement archived successfully"}

# Endpoint: POST /membership/officer/requirement/create
# Description: Allows an officer to create a new membership requirement for all users that don't already have it.
@router.post("/officer/requirement/create", response_model=schemas.MembershipSchema)
def create_officer_requirement(
    requirement: str = Form(...),
    amount: float = Form(...),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} creating new membership requirement: {requirement} with amount: {amount}")
    users = db.query(models.User).all()
    created_records = []
    for user in users:
        existing = db.query(models.Clearance).filter(
            models.Clearance.user_id == user.id,
            models.Clearance.requirement == requirement,
            models.Clearance.archived == False
        ).first()
        if not existing:
            new_clearance = models.Clearance(
                user_id=user.id,
                requirement=requirement,
                amount=amount,
                payment_status="Not Paid",
                status="Not Yet Cleared",
                receipt_path="",
                archived=False
            )
            db.add(new_clearance)
            created_records.append(new_clearance)
    db.commit()
    if created_records:
        db.refresh(created_records[0])
        logger.info(f"Officer {current_officer.id} created membership requirement '{requirement}' for {len(created_records)} users")
        return created_records[0]
    else:
        logger.error(f"Membership requirement '{requirement}' already exists for all users (Officer {current_officer.id})")
        raise HTTPException(status_code=400, detail="Requirement already exists for all users")
