from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(100), unique=True, index=True, nullable=True)
    reset_token_hash = Column(String(255), nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)
    role = Column(String(20), default="tenant", nullable=False) # 'tenant', 'owner', 'admin'
    avatar = Column(String(10), nullable=True)
    kyc_status = Column(String(20), default="pending", nullable=False)
    status = Column(String(20), default="active", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    properties = relationship("Property", back_populates="owner", cascade="all, delete-orphan")
    join_requests = relationship("JoinRequest", back_populates="tenant", cascade="all, delete-orphan")
