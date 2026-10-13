from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.room import Room
from app.models.bed import Bed
from app.models.property import Property
from app.models.user import User
from app.schemas.room import RoomCreate, RoomResponse
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("", response_model=List[RoomResponse])
def list_rooms(
    property_id: Optional[int] = Query(None, description="Filter rooms by property ID"),
    db: Session = Depends(get_db)
):
    """Lists rooms, optionally filtered by property ID."""
    query = db.query(Room)
    if property_id:
        query = query.filter(Room.property_id == property_id)
    return query.order_by(Room.room_number.asc()).all()

@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room_in: RoomCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new room with beds for a property."""
    prop = db.query(Property).filter(Property.id == room_in.property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {room_in.property_id} was not found."
        )

    if prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to add rooms to this property."
        )

    new_room = Room(
        property_id=room_in.property_id,
        room_number=room_in.room_number,
        room_type=room_in.room_type,
        sharing_capacity=room_in.sharing_capacity,
        rent=room_in.rent,
        ac_available=room_in.ac_available if room_in.ac_available is not None else True,
        floor=room_in.floor or 1
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    beds_to_create = []
    if room_in.beds and len(room_in.beds) > 0:
        for b in room_in.beds:
            beds_to_create.append(Bed(
                room_id=new_room.id,
                bed_code=b.bed_code,
                monthly_rent=b.monthly_rent or room_in.rent,
                availability_status="vacant"
            ))
    else:
        bed_letters = ["A", "B", "C", "D", "E"]
        for i in range(room_in.sharing_capacity):
            letter = bed_letters[i] if i < len(bed_letters) else str(i + 1)
            beds_to_create.append(Bed(
                room_id=new_room.id,
                bed_code=letter,
                monthly_rent=room_in.rent,
                availability_status="vacant"
            ))

    db.add_all(beds_to_create)
    prop.total_beds = (prop.total_beds or 0) + len(beds_to_create)
    prop.vacant_beds = (prop.vacant_beds or 0) + len(beds_to_create)
    db.commit()
    db.refresh(new_room)

    return new_room
