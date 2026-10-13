from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: Optional[str] = "system"
    link: Optional[str] = None

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime
