from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    tenant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    billing_month = Column(String(50), nullable=False) # e.g. "October 2024"
    amount = Column(Float, nullable=False)
    rent_component = Column(Float, nullable=False)
    maintenance_component = Column(Float, default=0.0)
    due_date = Column(Date, nullable=False)
    paid_date = Column(Date, nullable=True)
    status = Column(String(20), default="pending", nullable=False, index=True) # "pending", "under_review", "paid"
    payment_method = Column(String(50), nullable=True) # e.g. "UPI", "Net Banking"
    transaction_ref = Column(String(100), nullable=True)
    receipt_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    tenant = relationship("User", foreign_keys=[tenant_id])
    property = relationship("Property", foreign_keys=[property_id])
