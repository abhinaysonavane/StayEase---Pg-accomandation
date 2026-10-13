from datetime import datetime, timedelta, timezone
from unittest.mock import patch, AsyncMock
import pytest
from app.models.user import User
from app.core.security import hash_reset_token

def test_register_user_success(client):
    """Tests successful registration of a new user."""
    payload = {
        "name": "Kavita Patel",
        "email": "kavita.patel@example.com",
        "phone": "+91 98888 77777",
        "password": "password123",
        "role": "tenant"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "kavita.patel@example.com"
    assert data["user"]["role"] == "tenant"
    assert "access_token" in response.cookies

def test_register_pg_owner_success(client, db_session):
    """Tests successful registration of a PG Owner persona."""
    payload = {
        "name": "Sunil Mittal",
        "email": "sunil.pg@stayliving.com",
        "phone": "+91 97777 66666",
        "password": "SecurePassword999",
        "role": "owner"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "sunil.pg@stayliving.com"
    assert data["user"]["role"] == "owner"

    # Verify persistence in database session
    db_session.expire_all()
    user_in_db = db_session.query(User).filter(User.email == "sunil.pg@stayliving.com").first()
    assert user_in_db is not None
    assert user_in_db.name == "Sunil Mittal"
    assert user_in_db.role == "owner"
    assert user_in_db.password_hash is not None

def test_register_short_password(client):
    """Tests registration with password shorter than 6 characters is rejected."""
    payload = {
        "name": "Short Pass User",
        "email": "short.pass@example.com",
        "password": "123",
        "role": "tenant"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400 or response.status_code == 422


def test_register_duplicate_email(client, seed_test_users):
    """Tests duplicate email registration returns 400."""
    payload = {
        "name": "Duplicate Tenant",
        "email": "tenant@example.com",
        "phone": "+91 98888 77777",
        "password": "password123",
        "role": "tenant"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_register_admin_prevention(client):
    """Tests that registering with role 'admin' is explicitly rejected."""
    payload = {
        "name": "Malicious Admin",
        "email": "hacker@example.com",
        "password": "password123",
        "role": "admin"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Administrator" in response.json()["detail"]

def test_login_success(client, seed_test_users):
    """Tests user login with correct credentials returns JWT and cookie."""
    response = client.post("/api/auth/login", json={
        "email": "tenant@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "tenant@example.com"
    assert "access_token" in response.cookies

def test_login_invalid_password(client, seed_test_users):
    """Tests user login with invalid password returns 401."""
    response = client.post("/api/auth/login", json={
        "email": "tenant@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_logout_clears_cookie(client, seed_test_users):
    """Tests that logging out clears session cookie."""
    login_resp = client.post("/api/auth/login", json={
        "email": "tenant@example.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200

    logout_resp = client.post("/api/auth/logout")
    assert logout_resp.status_code == 200
    assert logout_resp.json()["message"] == "Successfully logged out."

def test_get_current_user_profile(client, tenant_token):
    """Tests /api/auth/me returns current user profile with valid Bearer token."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "tenant@example.com"
    assert data["role"] == "tenant"

def test_get_current_user_via_cookie(client, seed_test_users):
    """Tests /api/auth/me succeeds with session cookie without Bearer header."""
    login_resp = client.post("/api/auth/login", json={
        "email": "owner@example.com",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]
    
    # Set cookie on test client
    client.cookies.set("access_token", token)
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "owner@example.com"
    assert response.json()["role"] == "owner"

def test_get_profile_unauthorized_without_token(client):
    """Tests /api/auth/me returns 401 when token is missing."""
    client.cookies.clear()
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_forgot_password_generic_response(client, seed_test_users):
    """Tests forgot password returns generic response for both existing and non-existing emails."""
    # Non-existing email
    resp1 = client.post("/api/auth/forgot-password", json={"email": "nonexistent@example.com"})
    assert resp1.status_code == 200
    assert "If your email address is registered" in resp1.json()["message"]

    # Existing email
    resp2 = client.post("/api/auth/forgot-password", json={"email": "tenant@example.com"})
    assert resp2.status_code == 200
    assert "If your email address is registered" in resp2.json()["message"]

def test_reset_password_full_lifecycle(client, seed_test_users, db_session):
    """Tests requesting reset, verifying token hash in DB, resetting password and logging in."""
    import app.services.email as email_service
    
    # 1. Request reset
    resp = client.post("/api/auth/forgot-password", json={"email": "tenant@example.com"})
    assert resp.status_code == 200

    # 2. Check token in DB is hashed and matches sent token
    db_session.expire_all()
    user = db_session.query(User).filter(User.email == "tenant@example.com").first()
    assert user.reset_token_hash is not None
    assert user.reset_token_expires_at is not None

    raw_token = email_service.last_dispatched_email["token"]
    assert hash_reset_token(raw_token) == user.reset_token_hash

    # 3. Reset password with new password
    reset_resp = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": "brandnewpassword99"
    })
    assert reset_resp.status_code == 200
    assert "Password has been reset successfully" in reset_resp.json()["message"]

    # 4. Token must now be invalidated
    db_session.refresh(user)
    assert user.reset_token_hash is None
    assert user.reset_token_expires_at is None

    # 5. Reusing the token should fail
    reuse_resp = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": "anotherpassword"
    })
    assert reuse_resp.status_code == 400
    assert "Invalid or already used" in reuse_resp.json()["detail"]

    # 6. Login with old password fails
    old_login = client.post("/api/auth/login", json={
        "email": "tenant@example.com",
        "password": "password123"
    })
    assert old_login.status_code == 401

    # 7. Login with new password succeeds
    new_login = client.post("/api/auth/login", json={
        "email": "tenant@example.com",
        "password": "brandnewpassword99"
    })
    assert new_login.status_code == 200
    assert new_login.json()["user"]["email"] == "tenant@example.com"

def test_reset_password_expired_token(client, seed_test_users, db_session):
    """Tests that expired reset tokens are rejected."""
    import app.services.email as email_service

    client.post("/api/auth/forgot-password", json={"email": "tenant@example.com"})
    raw_token = email_service.last_dispatched_email["token"]

    # Set expiration 10 minutes in the past
    db_session.expire_all()
    user = db_session.query(User).filter(User.email == "tenant@example.com").first()
    user.reset_token_expires_at = datetime.now(timezone.utc) - timedelta(minutes=10)
    db_session.commit()

    resp = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": "newpassword123"
    })
    assert resp.status_code == 400
    assert "expired" in resp.json()["detail"]

def test_google_oauth_status_unconfigured(client):
    """Tests GET /api/auth/google/status reports configured=False when no client id."""
    with patch("app.core.config.settings.GOOGLE_CLIENT_ID", None):
        resp = client.get("/api/auth/google/status")
        assert resp.status_code == 200
        assert resp.json()["configured"] is False

def test_google_oauth_unconfigured_error(client):
    """Tests POST /api/auth/google returns 501 with instructions when unconfigured."""
    with patch("app.core.config.settings.GOOGLE_CLIENT_ID", None):
        resp = client.post("/api/auth/google", json={"id_token": "fake_id_token"})
        assert resp.status_code == 501
        assert "GOOGLE_CLIENT_ID" in resp.json()["detail"]

def test_google_oauth_verified_login(client, seed_test_users, monkeypatch):
    """Tests successful Google OAuth login and account registration when verified."""
    with patch("app.core.config.settings.GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com"):
        # Mock verify_google_id_token
        async def mock_verify(id_token: str):
            return {
                "google_id": "google-sub-12345",
                "email": "google.user@example.com",
                "name": "Google Test User",
                "picture": None
            }

        monkeypatch.setattr("app.routers.auth.verify_google_id_token", mock_verify)

        resp = client.post("/api/auth/google", json={
            "id_token": "valid_mock_token",
            "role": "tenant"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["user"]["email"] == "google.user@example.com"
        assert data["user"]["role"] == "tenant"
        assert "access_token" in data
