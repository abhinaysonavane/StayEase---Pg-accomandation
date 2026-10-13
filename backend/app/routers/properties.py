from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.connection import get_db
from app.models.property import Property
from app.models.user import User
from app.schemas.property import (
    PropertyCreate, PropertyUpdate, PropertyResponse, PropertyListResponse
)
from app.dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/properties", tags=["Properties"])

def _format_property_response(prop: Property) -> PropertyResponse:
    data = PropertyResponse.model_validate(prop)
    data.startingPrice = prop.monthly_rent
    data.tagline = prop.description
    return data

@router.get("", response_model=PropertyListResponse)
def list_properties(
    city: Optional[str] = Query(None, description="Filter by city"),
    min_rent: Optional[float] = Query(None, ge=0, description="Minimum monthly rent"),
    max_rent: Optional[float] = Query(None, ge=0, description="Maximum monthly rent"),
    gender_policy: Optional[str] = Query(None, description="'unisex', 'male', 'female'"),
    keyword: Optional[str] = Query(None, description="Search keyword"),
    only_vacant: Optional[bool] = Query(False, description="Filter properties with vacant beds"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Lists properties with search filtering and pagination."""
    query = db.query(Property)

    if city and city.strip():
        query = query.filter(Property.city.ilike(f"%{city.strip()}%"))

    if min_rent is not None:
        query = query.filter(Property.monthly_rent >= min_rent)
    if max_rent is not None:
        query = query.filter(Property.monthly_rent <= max_rent)

    if gender_policy and gender_policy.lower() != "all":
        query = query.filter(Property.gender_policy.ilike(gender_policy.strip()))

    if only_vacant:
        query = query.filter(Property.vacant_beds > 0)

    if keyword and keyword.strip():
        term = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                Property.name.ilike(term),
                Property.locality.ilike(term),
                Property.address.ilike(term),
                Property.description.ilike(term)
            )
        )

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    properties = query.order_by(Property.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    items = [_format_property_response(p) for p in properties]

    return PropertyListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property_detail(property_id: int, db: Session = Depends(get_db)):
    """Retrieves single property details."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} was not found."
        )
    return _format_property_response(prop)

@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    prop_in: PropertyCreate,
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db)
):
    """Creates a new property listing (Owner or Admin role required)."""
    new_prop = Property(
        owner_id=current_user.id,
        name=prop_in.name,
        description=prop_in.description or f"Modern coliving & PG in {prop_in.city}",
        address=prop_in.address or f"{prop_in.locality or ''}, {prop_in.city}",
        locality=prop_in.locality or "",
        city=prop_in.city,
        monthly_rent=prop_in.monthly_rent,
        deposit=prop_in.deposit or (prop_in.monthly_rent * 2),
        deposit_months=prop_in.deposit_months or 2,
        notice_period_days=prop_in.notice_period_days or 30,
        gender_policy=prop_in.gender_policy or "unisex",
        total_beds=prop_in.total_beds or 10,
        vacant_beds=prop_in.vacant_beds if prop_in.vacant_beds is not None else (prop_in.total_beds or 10),
        is_available=prop_in.is_available if prop_in.is_available is not None else True,
        food_included=prop_in.food_included if prop_in.food_included is not None else True,
        food_type=prop_in.food_type or "veg_and_non_veg",
        ac_available=prop_in.ac_available if prop_in.ac_available is not None else True,
        cover_image=prop_in.cover_image or "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    )
    new_prop.images = prop_in.images or [new_prop.cover_image]
    new_prop.amenities = prop_in.amenities or ["High-Speed Wi-Fi", "24x7 Power Backup", "Daily Housekeeping"]
    new_prop.houseRules = prop_in.house_rules or ["Curfew 11:00 PM"]

    db.add(new_prop)
    db.commit()
    db.refresh(new_prop)

    return _format_property_response(new_prop)

@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    prop_in: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates property. Owner of the property or Admin only."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} was not found."
        )

    if prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this property listing."
        )

    update_data = prop_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "images" and value is not None:
            prop.images = value
        elif field == "amenities" and value is not None:
            prop.amenities = value
        elif field == "house_rules" and value is not None:
            prop.house_rules = value
        elif hasattr(prop, field) and value is not None:
            setattr(prop, field, value)

    db.commit()
    db.refresh(prop)
    return _format_property_response(prop)

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes property. Owner of the property or Admin only."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} was not found."
        )

    if prop.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this property listing."
        )

    db.delete(prop)
    db.commit()
    return None
