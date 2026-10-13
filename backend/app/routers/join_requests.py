from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.join_request import JoinRequest
from app.models.property import Property
from app.models.user import User
from app.schemas.join_request import JoinRequestCreate, JoinRequestStatusUpdate, JoinRequestResponse
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/join-requests", tags=["Join Requests"])

def _format_join_request_response(req: JoinRequest, db: Session) -> JoinRequestResponse:
    res = JoinRequestResponse.model_validate(req)
    if req.tenant:
        res.tenant_name = req.tenant.name
        res.tenant_email = req.tenant.email
        res.tenant_phone = req.tenant.phone
    if req.property:
        res.property_name = req.property.name
    return res

@router.post("", response_model=JoinRequestResponse, status_code=status.HTTP_201_CREATED)
def create_join_request(
    req_in: JoinRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits a new tenant join request."""
    prop = db.query(Property).filter(Property.id == req_in.property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {req_in.property_id} was not found."
        )

    new_request = JoinRequest(
        tenant_id=current_user.id,
        property_id=req_in.property_id,
        status="pending",
        move_in_date=req_in.move_in_date,
        room_type_preference=req_in.room_type_preference or "double",
        notes=req_in.notes or ""
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return _format_join_request_response(new_request, db)

@router.get("", response_model=List[JoinRequestResponse])
def list_join_requests(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    property_id: Optional[int] = Query(None, description="Filter by property ID"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists join requests with role-based data isolation."""
    query = db.query(JoinRequest)

    if current_user.role == "tenant":
        query = query.filter(JoinRequest.tenant_id == current_user.id)
    elif current_user.role == "owner":
        owner_property_ids = [p.id for p in db.query(Property.id).filter(Property.owner_id == current_user.id).all()]
        query = query.filter(JoinRequest.property_id.in_(owner_property_ids))
        if property_id:
            if property_id not in owner_property_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not own this property."
                )
            query = query.filter(JoinRequest.property_id == property_id)
    elif current_user.role == "admin":
        if property_id:
            query = query.filter(JoinRequest.property_id == property_id)

    if status_filter:
        query = query.filter(JoinRequest.status == status_filter.lower())

    requests = query.order_by(JoinRequest.id.desc()).all()
    return [_format_join_request_response(r, db) for r in requests]

@router.patch("/{request_id}/status", response_model=JoinRequestResponse)
def update_join_request_status(
    request_id: int,
    status_in: JoinRequestStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve or reject join request. Owner or admin only."""
    req = db.query(JoinRequest).filter(JoinRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Join request with ID {request_id} was not found."
        )

    prop = db.query(Property).filter(Property.id == req.property_id).first()
    if not prop or (prop.owner_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to review join requests for this property."
        )

    status_val = status_in.status.lower()
    if status_val not in ["pending", "approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'pending', 'approved', or 'rejected'."
        )

    if status_val == "approved" and req.status != "approved":
        if prop.vacant_beds and prop.vacant_beds > 0:
            prop.vacant_beds -= 1

    if req.status == "approved" and status_val != "approved":
        prop.vacant_beds = min(prop.total_beds or 10, (prop.vacant_beds or 0) + 1)

    req.status = status_val
    if status_in.allocated_room:
        req.allocated_room = status_in.allocated_room
    if status_in.allocated_bed:
        req.allocated_bed = status_in.allocated_bed

    db.commit()
    db.refresh(req)
    return _format_join_request_response(req, db)
