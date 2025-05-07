import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
import os, shutil
from typing import List

from app.database import SessionLocal
from app import models, schemas
from app.auth_utils import get_current_user, get_current_officer

logger = logging.getLogger("app.announcements")

router = APIRouter(prefix="/announcements", tags=["Announcements"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Endpoint: GET /announcements/
# Description: Returns a list of non-archived announcements for a logged-in user.
@router.get("/", response_model=List[schemas.AnnouncementSchema])
def get_announcements(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logger.debug(f"User {current_user.id} ({current_user.full_name}) fetching non-archived announcements")
    announcements = db.query(models.Announcement).filter(models.Announcement.archived == False).all()
    logger.info(f"User {current_user.id} fetched {len(announcements)} announcements")
    return announcements


# Officer Endpoints for Announcements

# Endpoint: POST /announcements/officer/create
# Description: Allows an officer to create a new announcement. An image can be optionally uploaded.
@router.post("/officer/create", response_model=schemas.AnnouncementSchema)
async def admin_create_announcement(
    title: str = Form(...),
    description: str = Form(...),
    date: datetime = Form(...),
    location: str = Form(""),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} ({current_officer.full_name}) creating announcement with title: {title}")
    image_url = None
    if image:
        os.makedirs("app/static/announcement_images", exist_ok=True)
        file_ext = os.path.splitext(image.filename)[1]
        unique_name = f"{datetime.now().timestamp()}{file_ext}"
        file_path = f"app/static/announcement_images/{unique_name}"
        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)
        image_url = f"/static/announcement_images/{unique_name}"
        logger.debug(f"Uploaded announcement image: {image_url}")
    new_announcement = models.Announcement(
        title=title,
        description=description,
        date=date,
        location=location,
        image_url=image_url,
        archived=False
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)
    logger.info(f"Officer {current_officer.id} created announcement successfully with id: {new_announcement.id}")
    return new_announcement

# Endpoint: PUT /announcements/officer/update/{announcement_id}
# Description: Allows an officer to update an existing announcement, including its image.
@router.put("/officer/update/{announcement_id}", response_model=schemas.AnnouncementSchema)
async def admin_update_announcement(
    announcement_id: int,
    title: str = Form(...),
    description: str = Form(...),
    date: datetime = Form(...),
    location: str = Form(""),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} updating announcement id: {announcement_id}")
    announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not announcement:
        logger.error(f"Announcement {announcement_id} not found for update")
        raise HTTPException(status_code=404, detail="Announcement not found")
    if image:
        os.makedirs("app/static/announcement_images", exist_ok=True)
        file_ext = os.path.splitext(image.filename)[1]
        unique_name = f"{datetime.now().timestamp()}{file_ext}"
        file_path = f"app/static/announcement_images/{unique_name}"
        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)
        announcement.image_url = f"/static/announcement_images/{unique_name}"
        logger.debug(f"Updated announcement image: {announcement.image_url}")
    announcement.title = title
    announcement.description = description
    announcement.date = date
    announcement.location = location
    db.commit()
    db.refresh(announcement)
    logger.info(f"Announcement {announcement_id} updated successfully by Officer {current_officer.id}")
    return announcement

# Endpoint: DELETE /announcements/officer/delete/{announcement_id}
# Description: Allows an officer to archive (delete) an announcement.
@router.delete("/officer/delete/{announcement_id}", response_model=dict)
def admin_delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} attempting to archive announcement id: {announcement_id}")
    announcement = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not announcement:
        logger.error(f"Announcement {announcement_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Announcement not found")
    announcement.archived = True
    db.commit()
    logger.info(f"Announcement {announcement_id} archived successfully by Officer {current_officer.id}")
    return {"detail": "Announcement archived successfully"}
