from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class PaymentCreate(BaseModel):
    property_id: int
    tenant_id: int
    billing_month: str
    amount: float
    rent_component: float
    maintenance_component: float = 0.0
    due_date: date
    payment_method: Optional[str] = None
    transaction_ref: Optional[str] = None

class PaymentUpdateStatus(BaseModel):
    status: str # "pending", "under_review", "paid"
    payment_method: Optional[str] = None
    transaction_ref: Optional[str] = None
    paid_date: Optional[date] = None

class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_number: str
    tenant_id: int
    property_id: int
    billing_month: str
    amount: float
    rent_component: float
    maintenance_component: float
    due_date: date
    paid_date: Optional[date] = None
    status: str
    payment_method: Optional[str] = None
    transaction_ref: Optional[str] = None
    receipt_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
