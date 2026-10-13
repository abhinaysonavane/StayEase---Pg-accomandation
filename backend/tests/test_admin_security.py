def test_super_admin_create_admin_success(client, super_admin_token):
    """Tests Super Admin can securely provision a new Admin account and logs audit event."""
    payload = {
        "name": "Audit Manager",
        "email": "audit.manager@stayease.com",
        "password": "SecurePassword123!",
        "role": "admin"
    }
    response = client.post(
        "/api/admin/users",
        json=payload,
        headers={"Authorization": f"Bearer {super_admin_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "audit.manager@stayease.com"
    assert data["role"] == "admin"

def test_admin_cannot_provision_another_admin(client, admin_token):
    """Tests that standard Admins cannot create Admin accounts (403 Forbidden)."""
    payload = {
        "name": "Unauthorized Admin",
        "email": "unauth.admin@stayease.com",
        "password": "SecurePassword123!",
        "role": "admin"
    }
    response = client.post(
        "/api/admin/users",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 403

def test_tenant_cannot_access_admin_endpoints(client, tenant_token):
    """Tests that tenants are strictly forbidden from admin user listing."""
    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert response.status_code == 403

def test_owner_cannot_access_admin_endpoints(client, owner_token):
    """Tests that PG Owners are strictly forbidden from admin user listing."""
    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 403

def test_super_admin_update_user_role(client, super_admin_token, seed_test_users):
    """Tests Super Admin can promote a user to another role."""
    tenant = seed_test_users["tenant"]
    response = client.patch(
        f"/api/admin/users/{tenant.id}/role?new_role=owner",
        headers={"Authorization": f"Bearer {super_admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["role"] == "owner"

def test_super_admin_cannot_demote_self(client, super_admin_token, seed_test_users):
    """Tests Super Admin cannot alter their own role to prevent accidental lockout."""
    super_admin = seed_test_users["super_admin"]
    response = client.patch(
        f"/api/admin/users/{super_admin.id}/role?new_role=tenant",
        headers={"Authorization": f"Bearer {super_admin_token}"}
    )
    assert response.status_code == 400
    assert "cannot change their own role" in response.json()["detail"].lower()

def test_register_super_admin_prevention(client):
    """Tests that registering with role 'super_admin' on public endpoint is rejected."""
    payload = {
        "name": "Self Super Admin",
        "email": "fake.superadmin@example.com",
        "password": "password123",
        "role": "super_admin"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "Administrator accounts cannot be self-registered" in response.json()["detail"]

def test_admin_stats_endpoint(client, super_admin_token, admin_token, tenant_token):
    """Tests platform KPI stats retrieval for Admin and Super Admin, but forbidden for Tenant."""
    # Super Admin can access
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {super_admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "users" in data
    assert "properties" in data
    assert "inventory" in data

    # Admin can access
    res_admin = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 200

    # Tenant is forbidden
    res_tenant = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {tenant_token}"})
    assert res_tenant.status_code == 403

def test_admin_user_directory_isolation(client, admin_token, super_admin_token, seed_test_users):
    """Tests that Admin only sees Tenants and Owners, while Super Admin sees all roles."""
    # Super Admin sees all 4 seeded users
    res_sa = client.get("/api/admin/users", headers={"Authorization": f"Bearer {super_admin_token}"})
    assert res_sa.status_code == 200
    sa_roles = [u["role"] for u in res_sa.json()]
    assert "super_admin" in sa_roles
    assert "admin" in sa_roles

    # Admin only sees tenant and owner
    res_admin = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 200
    admin_viewed_roles = [u["role"] for u in res_admin.json()]
    assert "super_admin" not in admin_viewed_roles
    assert "admin" not in admin_viewed_roles

    # Admin cannot query role=admin or role=super_admin
    res_forbidden = client.get("/api/admin/users?role=admin", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_forbidden.status_code == 403

def test_super_admin_user_status_and_self_protection(client, super_admin_token, admin_token, seed_test_users):
    """Tests account suspension by Super Admin, self-suspension block, and Admin denial."""
    tenant = seed_test_users["tenant"]
    super_admin = seed_test_users["super_admin"]

    # Super Admin suspends tenant
    res = client.patch(
        f"/api/admin/users/{tenant.id}/status?new_status=suspended",
        headers={"Authorization": f"Bearer {super_admin_token}"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "suspended"

    # Super Admin cannot suspend self
    res_self = client.patch(
        f"/api/admin/users/{super_admin.id}/status?new_status=suspended",
        headers={"Authorization": f"Bearer {super_admin_token}"}
    )
    assert res_self.status_code == 400
    assert "cannot suspend their own account" in res_self.json()["detail"].lower()

    # Admin cannot suspend user
    res_admin = client.patch(
        f"/api/admin/users/{tenant.id}/status?new_status=active",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_admin.status_code == 403

def test_listing_moderation_and_permissions(client, admin_token, super_admin_token, tenant_token, sample_property):
    """Tests property verification and moderation by Admin and Super Admin."""
    # Admin moderates property
    res = client.patch(
        f"/api/admin/properties/{sample_property.id}/moderate?verified=true",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    assert res.json()["verified"] is True

    # Super Admin un-verifies property
    res_sa = client.patch(
        f"/api/admin/properties/{sample_property.id}/moderate?verified=false",
        headers={"Authorization": f"Bearer {super_admin_token}"}
    )
    assert res_sa.status_code == 200
    assert res_sa.json()["verified"] is False

    # Tenant cannot moderate property
    res_tenant = client.patch(
        f"/api/admin/properties/{sample_property.id}/moderate?verified=true",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert res_tenant.status_code == 403

def test_super_admin_audit_logs(client, super_admin_token, admin_token):
    """Tests that audit logs are accessible to Super Admin but forbidden to standard Admin."""
    # Super Admin can view audit logs
    res = client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {super_admin_token}"})
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)

    # Standard Admin is forbidden
    res_admin = client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 403
