import logging
from datetime import datetime
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models, schemas
from app.auth_utils import get_current_user, get_current_officer  # Import both user and officer dependencies

logger = logging.getLogger("app.events")

router = APIRouter(prefix="/events", tags=["Events"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint: GET /events/
# Description: Returns a list of all active (non-archived) events.
# Update the get_events function to include is_participant flag
@router.get("/", response_model=List[schemas.EventSchema])
def get_events(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logger.debug("Fetching all active events")
    events = db.query(models.Event).filter(models.Event.archived == False).all()
    
    # Add is_participant flag to each event
    for event in events:
        # Check if current user is participating in this event
        event.is_participant = any(participant.id == current_user.id for participant in event.participants)
        
    logger.info(f"Fetched {len(events)} events")
    return events

@router.post("/join/{event_id}", response_model=schemas.MessageResponse)
def join_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logger.debug(f"User {current_user.id} ({current_user.full_name}) attempting to join event {event_id}")
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        logger.error(f"Event {event_id} not found")
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if event registration is open
    now = datetime.utcnow()
    if event.registration_start and now < event.registration_start:
        logger.error(f"Registration for event {event_id} has not started yet")
        raise HTTPException(status_code=403, detail="Registration for this event has not started yet")
    
    if event.registration_end and now > event.registration_end:
        logger.error(f"Registration for event {event_id} has ended")
        raise HTTPException(status_code=403, detail="Registration for this event has ended")
    
    user_in_session = db.merge(current_user)
    if any(user.id == user_in_session.id for user in event.participants):
        logger.info(f"User {user_in_session.id} already participating in event {event_id}")
        return {"message": "Already participating in this event"}
    event.participants.append(user_in_session)
    db.commit()
    logger.info(f"User {user_in_session.id} joined event {event_id}")
    return {"message": "Successfully joined the event"}

# Endpoint: POST /events/leave/{event_id}
# Description: Allows a user to leave an event by event_id.
@router.post("/leave/{event_id}", response_model=schemas.MessageResponse)
def leave_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    logger.debug(f"User {current_user.id} ({current_user.full_name}) attempting to leave event {event_id}")
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        logger.error(f"Event {event_id} not found")
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if event registration is still open for leaving
    now = datetime.utcnow()
    if event.registration_end and now > event.registration_end:
        logger.error(f"Registration for event {event_id} has ended, cannot leave")
        raise HTTPException(status_code=403, detail="Registration for this event has ended, cannot leave now")
    
    user_in_event = next((user for user in event.participants if user.id == current_user.id), None)
    if not user_in_event:
        logger.info(f"User {current_user.id} is not participating in event {event_id}")
        return {"message": "You are not participating in this event"}
    event.participants.remove(user_in_event)
    db.commit()
    logger.info(f"User {current_user.id} left event {event_id}")
    return {"message": "Successfully left the event"}

# Officer Endpoints (Manage Events)

# Endpoint: GET /events/officer/list
# Description: Allows an officer to fetch a list of all active (non-archived) events.
@router.get("/officer/list", response_model=List[schemas.EventSchema])
def admin_list_events(
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} ({current_officer.full_name}) fetching all active events")
    events = db.query(models.Event).filter(models.Event.archived == False).all()
    logger.info(f"Officer {current_officer.id} fetched {len(events)} events")
    return events

# Endpoint: POST /events/officer/create
# Description: Allows an officer to create a new event. An image can be optionally uploaded.
@router.post("/officer/create", response_model=schemas.EventSchema)
async def admin_create_event(
    title: str = Form(...),
    description: str = Form(...),
    date: datetime = Form(...),
    location: str = Form(""),
    registration_start: Optional[datetime] = Form(None),
    registration_end: Optional[datetime] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} ({current_officer.full_name}) creating event with title: {title}")
    image_url = None
    if image:
        os.makedirs("app/static/event_images", exist_ok=True)
        file_ext = os.path.splitext(image.filename)[1]
        unique_name = f"{datetime.now().timestamp()}{file_ext}"
        file_path = f"app/static/event_images/{unique_name}"
        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)
        image_url = f"/static/event_images/{unique_name}"
        logger.debug(f"Uploaded event image: {image_url}")
    
    # Set default registration_start if not provided
    if not registration_start:
        registration_start = datetime.utcnow()
    
    new_event = models.Event(
        title=title,
        description=description,
        date=date,
        image_url=image_url,
        location=location,
        registration_start=registration_start,
        registration_end=registration_end
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    logger.info(f"Officer {current_officer.id} created event successfully with id: {new_event.id}")
    return new_event

# Endpoint: PUT /events/officer/update/{event_id}
# Description: Allows an officer to update an existing event, including its image.
@router.put("/officer/update/{event_id}", response_model=schemas.EventSchema)
async def admin_update_event(
    event_id: int,
    title: str = Form(...),
    description: str = Form(...),
    date: datetime = Form(...),
    location: str = Form(""),
    registration_start: Optional[datetime] = Form(None),
    registration_end: Optional[datetime] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} updating event id: {event_id}")
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        logger.error(f"Event {event_id} not found for update")
        raise HTTPException(status_code=404, detail="Event not found")
    if image:
        os.makedirs("app/static/event_images", exist_ok=True)
        file_ext = os.path.splitext(image.filename)[1]
        unique_name = f"{datetime.now().timestamp()}{file_ext}"
        file_path = f"app/static/event_images/{unique_name}"
        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)
        event.image_url = f"/static/event_images/{unique_name}"
        logger.debug(f"Updated event image: {event.image_url}")
    event.title = title
    event.description = description
    event.date = date
    event.location = location
    
    # Update registration dates if provided
    if registration_start:
        event.registration_start = registration_start
    if registration_end:
        event.registration_end = registration_end
        
    db.commit()
    db.refresh(event)
    logger.info(f"Officer {current_officer.id} updated event {event_id} successfully")
    return event

# Endpoint: DELETE /events/officer/delete/{event_id}
# Description: Allows an officer to archive an event.
@router.delete("/officer/delete/{event_id}", response_model=dict)
def admin_delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_officer: models.Officer = Depends(get_current_officer)
):
    logger.debug(f"Officer {current_officer.id} attempting to archive event id: {event_id}")
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        logger.error(f"Event {event_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Event not found")
    event.archived = True
    db.commit()
    logger.info(f"Officer {current_officer.id} archived event {event_id} successfully")
    return {"detail": "Event archived successfully"}

# Endpoint: GET /events/{event_id}/participants
# Description: Returns a list of users participating in the specified event.
@router.get("/{event_id}/participants", response_model=List[schemas.User])
def get_event_participants(
    event_id: int,
    db: Session = Depends(get_db)
):
    logger.debug(f"Fetching participants for event id: {event_id}")
    event = db.query(models.Event).filter(models.Event.id == event_id, models.Event.archived == False).first()
    if not event:
        logger.error(f"Event {event_id} not found for fetching participants")
        raise HTTPException(status_code=404, detail="Event not found")
    logger.info(f"Fetched {len(event.participants)} participants for event id: {event_id}")
    return event.participants