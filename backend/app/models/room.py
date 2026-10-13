from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    room_number = Column(String(20), nullable=False)
    room_type = Column(String(20), default="double", nullable=False)
    sharing_capacity = Column(Integer, default=2, nullable=False)
    rent = Column(Float, nullable=False)
    ac_available = Column(Boolean, default=True)
    floor = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    property = relationship("Property", back_populates="rooms")
    beds = relationship("Bed", back_populates="room", cascade="all, delete-orphan")
