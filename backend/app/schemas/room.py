from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.bed import BedCreate, BedResponse

class RoomBase(BaseModel):
    room_number: str = Field(..., max_length=20)
    room_type: str = Field(default="double")
    sharing_capacity: int = Field(default=2, ge=1, le=10)
    rent: float = Field(..., gt=0)
    ac_available: Optional[bool] = True
    floor: Optional[int] = 1

class RoomCreate(RoomBase):
    property_id: int
    beds: Optional[List[BedCreate]] = None

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    sharing_capacity: Optional[int] = None
    rent: Optional[float] = None
    ac_available: Optional[bool] = None
    floor: Optional[int] = None

class RoomResponse(RoomBase):
    id: int
    property_id: int
    created_at: datetime
    beds: List[BedResponse] = []

    model_config = ConfigDict(from_attributes=True)
