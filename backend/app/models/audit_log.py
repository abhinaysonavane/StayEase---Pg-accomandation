from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_name = Column(String(100), nullable=True)
    actor_role = Column(String(20), nullable=True)
    action = Column(String(100), nullable=False, index=True) # e.g. CREATE_ADMIN, UPDATE_ROLE, SUSPEND_USER, MODERATE_PROPERTY
    target_type = Column(String(50), nullable=False) # e.g. user, property, complaint, payment
    target_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    actor = relationship("User", foreign_keys=[actor_id])
