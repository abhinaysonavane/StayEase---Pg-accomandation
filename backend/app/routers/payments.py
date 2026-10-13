import uuid
from datetime import datetime, timezone, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.payment import Payment
from app.models.property import Property
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentUpdateStatus, PaymentResponse
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("", response_model=List[PaymentResponse])
def get_payments(
    property_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Payment)

    if current_user.role == "tenant":
        query = query.filter(Payment.tenant_id == current_user.id)
    elif current_user.role == "owner":
        # Only show payments for properties owned by this owner
        owned_props = db.query(Property.id).filter(Property.owner_id == current_user.id).scalar_subquery()
        query = query.filter(Payment.property_id.in_(owned_props))
    elif current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if property_id:
        query = query.filter(Payment.property_id == property_id)
    if status_filter:
        query = query.filter(Payment.status == status_filter)

    return query.order_by(Payment.created_at.desc()).all()

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")

    # Access control
    if current_user.role == "tenant" and payment.tenant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "owner":
        prop = db.query(Property).filter(Property.id == payment.property_id).first()
        if not prop or prop.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return payment

@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment_invoice(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only Owner or Admin can generate an invoice/payment record
    if current_user.role not in ["owner", "admin", "super_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners and admins can create payment records")

    prop = db.query(Property).filter(Property.id == payload.property_id).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    if current_user.role == "owner" and prop.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this property")

    tenant = db.query(User).filter(User.id == payload.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    invoice_number = f"INV-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"

    payment = Payment(
        invoice_number=invoice_number,
        tenant_id=payload.tenant_id,
        property_id=payload.property_id,
        billing_month=payload.billing_month,
        amount=payload.amount,
        rent_component=payload.rent_component,
        maintenance_component=payload.maintenance_component,
        due_date=payload.due_date,
        payment_method=payload.payment_method,
        transaction_ref=payload.transaction_ref,
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

@router.patch("/{payment_id}/status", response_model=PaymentResponse)
def update_payment_status(
    payment_id: int,
    payload: PaymentUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")

    prop = db.query(Property).filter(Property.id == payment.property_id).first()

    # Tenant flow: Can submit reference and put into "under_review"
    if current_user.role == "tenant":
        if payment.tenant_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        if payload.status not in ["under_review", "pending"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenants can submit payments for review with transaction reference, but cannot mark them 'paid' directly"
            )
        payment.status = payload.status
        if payload.transaction_ref:
            payment.transaction_ref = payload.transaction_ref
        if payload.payment_method:
            payment.payment_method = payload.payment_method

    # Owner / Admin flow: Can confirm payment as "paid", "pending", etc.
    elif current_user.role in ["owner", "admin", "super_admin"]:
        if current_user.role == "owner" and (not prop or prop.owner_id != current_user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this property")

        payment.status = payload.status
        if payload.payment_method:
            payment.payment_method = payload.payment_method
        if payload.transaction_ref:
            payment.transaction_ref = payload.transaction_ref

        if payload.status == "paid":
            payment.paid_date = payload.paid_date or date.today()
            if not payment.receipt_id:
                payment.receipt_id = f"RCP-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"
        elif payload.status != "paid":
            payment.paid_date = None
            payment.receipt_id = None
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db.commit()
    db.refresh(payment)
    return payment
