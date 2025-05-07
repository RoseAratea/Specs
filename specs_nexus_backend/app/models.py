# app/models.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Table, Enum, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime

# Define an ENUM for year
year_enum = Enum('1st Year', '2nd Year', '3rd Year', '4th Year', name='year_enum')

# Association table for many-to-many relationship between users and events
event_participants = Table(
    "event_participants",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    student_number = Column(String(50), unique=True, index=True)
    full_name = Column(String(255))
    year = Column(year_enum, nullable=True)  # Updated column type
    block = Column(String(50))
    last_active = Column(DateTime, default=datetime.datetime.utcnow)  # NEW: Track last activity

    # Renamed relationship for clarity
    events_joined = relationship(
        "Event",
        secondary=event_participants,
        back_populates="participants"
    )
    clearance = relationship("Clearance", back_populates="user", uselist=False)

# Clearance Model
class Clearance(Base):
    __tablename__ = "clearances"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    requirement = Column(Enum("1st Semester Membership", "2nd Semester Membership", name="requirement_type"), nullable=False)
    status = Column(Enum("Clear", "Processing", "Not Yet Cleared", name="clearance_status"), default="Not Yet Cleared", nullable=False)
    payment_status = Column(Enum("Not Paid", "Verifying", "Paid", name="payment_status"), default="Not Paid", nullable=False)
    receipt_path = Column(String(255), nullable=True)
    amount = Column(Float)
    archived = Column(Boolean, default=False)
    payment_method = Column(String(50), nullable=True)  # NEW: Store chosen payment method
    user = relationship("User", back_populates="clearance")

class QRCode(Base):
    __tablename__ = "qr_codes"
    id = Column(Integer, primary_key=True, index=True)
    gcash = Column(String(255), nullable=True)
    paymaya = Column(String(255), nullable=True)
    

# Event Model
class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    image_url = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)  # New location field
    archived = Column(Boolean, default=False)      # For archiving events

    # Update back_populates to reference the user's events_joined
    participants = relationship("User", secondary=event_participants, back_populates="events_joined")

    @property
    def participant_count(self):
        return len(self.participants) if self.participants else 0

# Announcement Model
class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    description = Column(String(1000))  # Renamed from "content"
    image_url = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)  # New column for location
    date = Column(DateTime, nullable=True)          # New column for date/time
    archived = Column(Boolean, default=False)

# Officer Model
class Officer(Base):
    __tablename__ = "officers"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    student_number = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    year = Column(String(50))
    block = Column(String(50))
    position = Column(String(255))
    archived = Column(Boolean, default=False)
