from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Table, Enum, Boolean
from sqlalchemy.orm import relationship
from .database import Base
import datetime

year_enum = Enum('1st Year', '2nd Year', '3rd Year', '4th Year', name='year_enum')

event_participants = Table(
    "event_participants",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    student_number = Column(String(50), unique=True, index=True)
    full_name = Column(String(255))
    year = Column(year_enum, nullable=True)
    block = Column(String(50))
    last_active = Column(DateTime, default=datetime.datetime.utcnow)
    
    events_joined = relationship("Event", secondary=event_participants, back_populates="participants")
    clearance = relationship("Clearance", back_populates="user", uselist=False)

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
    payment_method = Column(String(50), nullable=True)
    user = relationship("User", back_populates="clearance")

class QRCode(Base):
    __tablename__ = "qr_codes"

    id = Column(Integer, primary_key=True, index=True)
    gcash = Column(String(255), nullable=True)
    paymaya = Column(String(255), nullable=True)

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    image_url = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    archived = Column(Boolean, default=False)
    registration_start = Column(DateTime, default=datetime.datetime.utcnow)
    registration_end = Column(DateTime, nullable=True)
    
    participants = relationship("User", secondary=event_participants, back_populates="events_joined")
    
    @property
    def participant_count(self):
        return len(self.participants) if self.participants else 0
    
    @property
    def registration_open(self):
        """Check if registration is currently open"""
        now = datetime.datetime.utcnow()
        if self.registration_start and now < self.registration_start:
            return False
        if self.registration_end and now > self.registration_end:
            return False
        return True
    
    @property
    def registration_status(self):
        """Return the status of registration"""
        now = datetime.datetime.utcnow()
        if self.registration_start and now < self.registration_start:
            return "not_started"
        if self.registration_end and now > self.registration_end:
            return "closed"
        return "open"

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    description = Column(String(1000))
    image_url = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    date = Column(DateTime, nullable=True)
    archived = Column(Boolean, default=False)

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