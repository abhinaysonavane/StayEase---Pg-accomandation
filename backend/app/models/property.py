from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    address = Column(String(300), nullable=True)
    locality = Column(String(100), nullable=True, index=True)
    city = Column(String(100), nullable=False, index=True)
    monthly_rent = Column(Float, nullable=False, index=True)
    deposit = Column(Float, default=0.0)
    deposit_months = Column(Integer, default=2)
    notice_period_days = Column(Integer, default=30)
    gender_policy = Column(String(20), default="unisex", index=True)
    total_beds = Column(Integer, default=10)
    vacant_beds = Column(Integer, default=10)
    is_available = Column(Boolean, default=True, index=True)
    food_included = Column(Boolean, default=True)
    food_type = Column(String(50), default="veg_and_non_veg")
    ac_available = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    reviews_count = Column(Integer, default=1)
    verified = Column(Boolean, default=True)
    cover_image = Column(String(600), nullable=True)
    images_json = Column(Text, default="[]")
    amenities_json = Column(Text, default="[]")
    house_rules_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="properties")
    rooms = relationship("Room", back_populates="property", cascade="all, delete-orphan")
    join_requests = relationship("JoinRequest", back_populates="property", cascade="all, delete-orphan")

    @property
    def images(self):
        try:
            return json.loads(self.images_json or "[]")
        except Exception:
            return []

    @images.setter
    def images(self, value):
        self.images_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def amenities(self):
        try:
            return json.loads(self.amenities_json or "[]")
        except Exception:
            return []

    @amenities.setter
    def amenities(self, value):
        self.amenities_json = json.dumps(value if isinstance(value, list) else [])

    @property
    def house_rules(self):
        try:
            return json.loads(self.house_rules_json or "[]")
        except Exception:
            return []

    @house_rules.setter
    def house_rules(self, value):
        self.house_rules_json = json.dumps(value if isinstance(value, list) else [])
