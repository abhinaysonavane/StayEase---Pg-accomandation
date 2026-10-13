import logging
from sqlalchemy.orm import Session
from app.database.connection import engine, Base
from app.models.user import User
from app.models.property import Property
from app.models.room import Room
from app.models.bed import Bed
from app.models.join_request import JoinRequest
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

def create_tables():
    """Creates all database tables defined in models."""
    Base.metadata.create_all(bind=engine)

def seed_initial_data(db: Session):
    """Populates baseline users and properties if empty."""
    if db.query(User).count() > 0:
        return

    logger.info("Seeding initial StayEase data...")
    hashed_pwd = get_password_hash("password123")

    tenant_user = User(
        name="Rohan Sharma",
        email="rohan.sharma@example.com",
        phone="+91 98765 43210",
        password_hash=hashed_pwd,
        role="tenant",
        avatar="RS",
        kyc_status="verified",
        status="active"
    )

    owner_user = User(
        name="Rajesh Verma",
        email="rajesh.verma@stayliving.com",
        phone="+91 98111 22334",
        password_hash=hashed_pwd,
        role="owner",
        avatar="RV",
        kyc_status="verified",
        status="active"
    )

    admin_user = User(
        name="Priya Nair",
        email="admin@stayease.com",
        phone="+91 98999 88776",
        password_hash=hashed_pwd,
        role="admin",
        avatar="PN",
        kyc_status="verified",
        status="active"
    )

    super_admin_user = User(
        name="Vikramaditya Rao",
        email="superadmin@stayease.com",
        phone="+91 98000 11223",
        password_hash=hashed_pwd,
        role="super_admin",
        avatar="VR",
        kyc_status="verified",
        status="active"
    )

    db.add_all([tenant_user, owner_user, admin_user, super_admin_user])
    db.commit()
    db.refresh(owner_user)
    db.refresh(tenant_user)
    db.refresh(super_admin_user)

    prop1 = Property(
        owner_id=owner_user.id,
        name="GreenLeaf Luxury Coliving & PG",
        description="Premium techie living with high-speed fiber & gourmet dining",
        city="Bangalore",
        locality="Koramangala 4th Block",
        address="Plot 88, 17th Main Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
        gender_policy="unisex",
        monthly_rent=12500.0,
        deposit=25000.0,
        deposit_months=2,
        notice_period_days=30,
        rating=4.85,
        reviews_count=42,
        verified=True,
        cover_image="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
        total_beds=48,
        vacant_beds=6,
        is_available=True,
        food_included=True,
        food_type="veg_and_non_veg",
        ac_available=True
    )
    prop1.images = [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    ]
    prop1.amenities = [
        "High-Speed Wi-Fi (300 Mbps)",
        "24x7 Power Backup",
        "Daily Housekeeping",
        "Biometric Door Lock",
        "CCTV Surveillance",
        "Fitness Gym"
    ]
    prop1.house_rules = [
        "Visitor entry allowed until 9:30 PM",
        "No smoking in rooms"
    ]

    prop2 = Property(
        owner_id=owner_user.id,
        name="UrbanNest Executive PG for Men",
        description="Walk to IT park, peaceful atmosphere and homestyle meals",
        city="Pune",
        locality="Hinjawadi Phase 1",
        address="Opposite Tech Mahindra Gate 2, Hinjawadi Phase 1, Pune, Maharashtra 411057",
        gender_policy="male",
        monthly_rent=8500.0,
        deposit=17000.0,
        deposit_months=2,
        notice_period_days=30,
        rating=4.7,
        reviews_count=28,
        verified=True,
        cover_image="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
        total_beds=32,
        vacant_beds=4,
        is_available=True,
        food_included=True,
        food_type="veg_and_non_veg",
        ac_available=True
    )
    prop2.images = ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80"]
    prop2.amenities = ["High-Speed Wi-Fi", "24x7 Power Backup", "Daily Housekeeping"]
    prop2.house_rules = ["Gate closed from 11:00 PM"]

    db.add_all([prop1, prop2])
    db.commit()
    db.refresh(prop1)

    room1 = Room(
        property_id=prop1.id,
        room_number="101",
        room_type="single",
        sharing_capacity=1,
        rent=16000.0,
        ac_available=True,
        floor=1
    )
    db.add(room1)
    db.commit()
    db.refresh(room1)

    bed1 = Bed(room_id=room1.id, bed_code="A", availability_status="vacant", monthly_rent=16000.0)
    db.add(bed1)

    join_req = JoinRequest(
        tenant_id=tenant_user.id,
        property_id=prop1.id,
        status="approved",
        move_in_date="2025-01-01",
        room_type_preference="single",
        allocated_room="101",
        allocated_bed="A",
        notes="Preferred quiet room on 1st floor"
    )
    db.add(join_req)
    db.commit()
