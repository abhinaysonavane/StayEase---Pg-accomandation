from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class BedBase(BaseModel):
    bed_code: str = Field(..., max_length=10)
    availability_status: str = Field(default="vacant")
    tenant_name: Optional[str] = None
    monthly_rent: Optional[float] = None

class BedCreate(BaseModel):
    bed_code: str
    monthly_rent: Optional[float] = None

class BedUpdate(BaseModel):
    availability_status: Optional[str] = None
    tenant_name: Optional[str] = None
    monthly_rent: Optional[float] = None

class BedResponse(BedBase):
    id: int
    room_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
