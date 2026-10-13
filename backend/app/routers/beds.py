from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.bed import Bed
from app.models.room import Room
from app.models.property import Property
from app.models.user import User
from app.schemas.bed import BedUpdate, BedResponse
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/beds", tags=["Beds"])

@router.get("", response_model=List[BedResponse])
def list_beds(
    room_id: Optional[int] = Query(None, description="Filter beds by room ID"),
    status: Optional[str] = Query(None, description="Filter by availability status ('vacant', 'occupied')"),
    db: Session = Depends(get_db)
):
    """Retrieves beds, optionally filtered by room ID and availability status."""
    query = db.query(Bed)
    if room_id:
        query = query.filter(Bed.room_id == room_id)
    if status:
        query = query.filter(Bed.availability_status == status.lower())
    return query.order_by(Bed.bed_code.asc()).all()

@router.get("/{bed_id}", response_model=BedResponse)
def get_bed(bed_id: int, db: Session = Depends(get_db)):
    """Retrieves details of a specific bed."""
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bed with ID {bed_id} was not found."
        )
    return bed

@router.patch("/{bed_id}", response_model=BedResponse)
def update_bed(
    bed_id: int,
    bed_in: BedUpdate,
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Updates bed occupancy status, tenant assignment, or rent.
    Automatically keeps property vacant_beds count synchronized."""
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bed with ID {bed_id} was not found."
        )

    room = db.query(Room).filter(Room.id == bed.room_id).first()
    prop = db.query(Property).filter(Property.id == room.property_id).first() if room else None

    if prop and prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update beds for this property."
        )

    old_status = (bed.availability_status or "vacant").lower()

    if bed_in.availability_status is not None:
        new_status = bed_in.availability_status.lower()
        bed.availability_status = new_status

        # Synchronize property vacant beds count
        if prop and old_status != new_status:
            if old_status == "vacant" and new_status == "occupied":
                prop.vacant_beds = max(0, (prop.vacant_beds or 1) - 1)
            elif old_status == "occupied" and new_status == "vacant":
                prop.vacant_beds = min(prop.total_beds or 1, (prop.vacant_beds or 0) + 1)
                if bed_in.tenant_name is None:
                    bed.tenant_name = None

    if bed_in.tenant_name is not None:
        bed.tenant_name = bed_in.tenant_name if bed_in.tenant_name.strip() else None

    if bed_in.monthly_rent is not None:
        bed.monthly_rent = bed_in.monthly_rent

    db.commit()
    db.refresh(bed)
    return bed
