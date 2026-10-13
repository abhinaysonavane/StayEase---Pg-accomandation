from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class JoinRequestCreate(BaseModel):
    property_id: int
    move_in_date: str = Field(...)
    room_type_preference: str = Field(default="double")
    notes: Optional[str] = None

class JoinRequestStatusUpdate(BaseModel):
    status: str = Field(...)
    allocated_room: Optional[str] = None
    allocated_bed: Optional[str] = None

class JoinRequestResponse(BaseModel):
    id: int
    tenant_id: int
    property_id: int
    status: str
    move_in_date: str
    room_type_preference: str
    notes: Optional[str] = None
    allocated_room: Optional[str] = None
    allocated_bed: Optional[str] = None
    created_at: datetime
    
    tenant_name: Optional[str] = None
    tenant_email: Optional[str] = None
    tenant_phone: Optional[str] = None
    property_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
