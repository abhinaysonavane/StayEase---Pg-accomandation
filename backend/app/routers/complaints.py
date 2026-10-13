import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.complaint import Complaint
from app.models.property import Property
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.get("", response_model=List[ComplaintResponse])
def get_complaints(
    property_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Complaint)

    if current_user.role == "tenant":
        query = query.filter(Complaint.tenant_id == current_user.id)
    elif current_user.role == "owner":
        owned_props = db.query(Property.id).filter(Property.owner_id == current_user.id).scalar_subquery()
        query = query.filter(Complaint.property_id.in_(owned_props))
    elif current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if property_id:
        query = query.filter(Complaint.property_id == property_id)
    if status_filter:
        query = query.filter(Complaint.status == status_filter)

    return query.order_by(Complaint.created_at.desc()).all()

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if current_user.role == "tenant" and complaint.tenant_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "owner":
        prop = db.query(Property).filter(Property.id == complaint.property_id).first()
        if not prop or prop.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return complaint

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "tenant":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only tenants can lodge maintenance complaints")

    prop = db.query(Property).filter(Property.id == payload.property_id).first()
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    complaint_number = f"CMP-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"

    complaint = Complaint(
        complaint_number=complaint_number,
        tenant_id=current_user.id,
        property_id=payload.property_id,
        title=payload.title,
        description=payload.description,
        category=payload.category or "maintenance",
        priority=payload.priority or "medium",
        status="open"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

@router.patch("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: int,
    payload: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    prop = db.query(Property).filter(Property.id == complaint.property_id).first()

    # Only Property Owner or Admin can update status or resolution notes
    if current_user.role == "owner":
        if not prop or prop.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own the property for this complaint")
    elif current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owners and administrators can update complaints")

    if payload.status:
        complaint.status = payload.status
        if payload.status in ["resolved", "closed"] and not complaint.resolved_at:
            complaint.resolved_at = datetime.now(timezone.utc)
        elif payload.status in ["open", "in_progress"]:
            complaint.resolved_at = None

    if payload.priority:
        complaint.priority = payload.priority
    if payload.resolution_notes is not None:
        complaint.resolution_notes = payload.resolution_notes

    db.commit()
    db.refresh(complaint)
    return complaint
