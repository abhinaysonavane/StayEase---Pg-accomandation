from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ComplaintCreate(BaseModel):
    property_id: int
    title: str
    description: str
    category: Optional[str] = "maintenance"
    priority: Optional[str] = "medium"

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None # "open", "in_progress", "resolved", "closed"
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None

class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    complaint_number: str
    tenant_id: int
    property_id: int
    title: str
    description: str
    category: str
    priority: str
    status: str
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
