import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database.connection import Base, get_db
from app.main import app
from app.models.user import User
from app.models.property import Property
from app.core.security import get_password_hash, create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def seed_test_users(db_session):
    hashed_pw = get_password_hash("password123")
    
    tenant = User(
        name="Test Tenant",
        email="tenant@example.com",
        phone="+91 99999 11111",
        password_hash=hashed_pw,
        role="tenant",
        avatar="TT",
        kyc_status="verified",
        status="active"
    )
    
    owner = User(
        name="Test Owner",
        email="owner@example.com",
        phone="+91 99999 22222",
        password_hash=hashed_pw,
        role="owner",
        avatar="TO",
        kyc_status="verified",
        status="active"
    )
    
    admin = User(
        name="Test Admin",
        email="admin@example.com",
        phone="+91 99999 33333",
        password_hash=hashed_pw,
        role="admin",
        avatar="TA",
        kyc_status="verified",
        status="active"
    )
    
    super_admin = User(
        name="Test Super Admin",
        email="superadmin@example.com",
        phone="+91 99999 44444",
        password_hash=hashed_pw,
        role="super_admin",
        avatar="TSA",
        kyc_status="verified",
        status="active"
    )

    db_session.add_all([tenant, owner, admin, super_admin])
    db_session.commit()
    db_session.refresh(tenant)
    db_session.refresh(owner)
    db_session.refresh(admin)
    db_session.refresh(super_admin)
    
    return {"tenant": tenant, "owner": owner, "admin": admin, "super_admin": super_admin}

@pytest.fixture(scope="function")
def tenant_token(seed_test_users):
    return create_access_token(subject=seed_test_users["tenant"].id, role="tenant")

@pytest.fixture(scope="function")
def owner_token(seed_test_users):
    return create_access_token(subject=seed_test_users["owner"].id, role="owner")

@pytest.fixture(scope="function")
def admin_token(seed_test_users):
    return create_access_token(subject=seed_test_users["admin"].id, role="admin")

@pytest.fixture(scope="function")
def super_admin_token(seed_test_users):
    return create_access_token(subject=seed_test_users["super_admin"].id, role="super_admin")


@pytest.fixture(scope="function")
def sample_property(db_session, seed_test_users):
    owner = seed_test_users["owner"]
    prop = Property(
        owner_id=owner.id,
        name="Silicon Coliving Spaces",
        description="Luxury living near tech hub with high speed wifi",
        city="Bangalore",
        locality="Koramangala",
        address="100 Feet Rd, Koramangala",
        gender_policy="unisex",
        monthly_rent=12000.0,
        deposit=24000.0,
        deposit_months=2,
        notice_period_days=30,
        total_beds=20,
        vacant_beds=5,
        is_available=True,
        food_included=True,
        food_type="veg_and_non_veg",
        ac_available=True
    )
    prop.images = ["https://example.com/img1.jpg"]
    prop.amenities = ["Wi-Fi", "AC", "Laundry"]
    prop.house_rules = ["No smoking"]
    db_session.add(prop)
    db_session.commit()
    db_session.refresh(prop)
    return prop
