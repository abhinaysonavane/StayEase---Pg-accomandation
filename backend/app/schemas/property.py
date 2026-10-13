from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class PropertyBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    address: Optional[str] = None
    locality: Optional[str] = None
    city: str = Field(..., min_length=2, max_length=100)
    monthly_rent: float = Field(..., gt=0)
    deposit: Optional[float] = 0.0
    deposit_months: Optional[int] = 2
    notice_period_days: Optional[int] = 30
    gender_policy: Optional[str] = "unisex"
    total_beds: Optional[int] = 10
    vacant_beds: Optional[int] = 10
    is_available: Optional[bool] = True
    food_included: Optional[bool] = True
    food_type: Optional[str] = "veg_and_non_veg"
    ac_available: Optional[bool] = True
    cover_image: Optional[str] = None
    images: Optional[List[str]] = Field(default_factory=list)
    amenities: Optional[List[str]] = Field(default_factory=list)
    house_rules: Optional[List[str]] = Field(default_factory=list)

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    monthly_rent: Optional[float] = None
    deposit: Optional[float] = None
    deposit_months: Optional[int] = None
    notice_period_days: Optional[int] = None
    gender_policy: Optional[str] = None
    total_beds: Optional[int] = None
    vacant_beds: Optional[int] = None
    is_available: Optional[bool] = None
    food_included: Optional[bool] = None
    food_type: Optional[str] = None
    ac_available: Optional[bool] = None
    cover_image: Optional[str] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    house_rules: Optional[List[str]] = None

class PropertyResponse(PropertyBase):
    id: int
    owner_id: int
    rating: float
    reviews_count: int
    verified: bool
    created_at: datetime
    updated_at: datetime
    
    startingPrice: Optional[float] = None
    tagline: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
