import pytest
from datetime import date
from app.models.payment import Payment
from app.models.complaint import Complaint
from app.models.notification import Notification

def test_payment_creation_and_authorization(client, seed_test_users, sample_property, tenant_token, owner_token):
    tenant = seed_test_users["tenant"]
    owner = seed_test_users["owner"]

    # 1. Tenant tries to create invoice -> 403 Forbidden
    res = client.post(
        "/api/payments",
        headers={"Authorization": f"Bearer {tenant_token}"},
        json={
            "property_id": sample_property.id,
            "tenant_id": tenant.id,
            "billing_month": "October 2024",
            "amount": 12000.0,
            "rent_component": 11000.0,
            "maintenance_component": 1000.0,
            "due_date": str(date.today()),
        }
    )
    assert res.status_code == 403

    # 2. Owner creates invoice -> 201 Created
    res = client.post(
        "/api/payments",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={
            "property_id": sample_property.id,
            "tenant_id": tenant.id,
            "billing_month": "October 2024",
            "amount": 12000.0,
            "rent_component": 11000.0,
            "maintenance_component": 1000.0,
            "due_date": str(date.today()),
        }
    )
    assert res.status_code == 201
    payment_data = res.json()
    assert payment_data["invoice_number"].startswith("INV-")
    assert payment_data["status"] == "pending"
    payment_id = payment_data["id"]

    # 3. Tenant views payments
    res = client.get("/api/payments", headers={"Authorization": f"Bearer {tenant_token}"})
    assert res.status_code == 200
    assert len(res.json()) == 1

    # 4. Tenant tries to self-mark as "paid" directly -> 400 Bad Request
    res = client.patch(
        f"/api/payments/{payment_id}/status",
        headers={"Authorization": f"Bearer {tenant_token}"},
        json={"status": "paid"}
    )
    assert res.status_code == 400

    # 5. Tenant submits payment under review with transaction reference -> 200 OK
    res = client.patch(
        f"/api/payments/{payment_id}/status",
        headers={"Authorization": f"Bearer {tenant_token}"},
        json={
            "status": "under_review",
            "payment_method": "UPI",
            "transaction_ref": "UPI/123456789"
        }
    )
    assert res.status_code == 200
    assert res.json()["status"] == "under_review"
    assert res.json()["transaction_ref"] == "UPI/123456789"

    # 6. Owner verifies and marks as "paid" -> 200 OK with receipt_id
    res = client.patch(
        f"/api/payments/{payment_id}/status",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"status": "paid"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "paid"
    assert res.json()["receipt_id"].startswith("RCP-")
    assert res.json()["paid_date"] is not None


def test_complaint_workflow_and_rbac(client, seed_test_users, sample_property, tenant_token, owner_token):
    # 1. Owner tries to lodge complaint -> 403 Forbidden
    res = client.post(
        "/api/complaints",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={
            "property_id": sample_property.id,
            "title": "Broken Geyser",
            "description": "Hot water not working in bathroom",
            "category": "plumbing",
            "priority": "high"
        }
    )
    assert res.status_code == 403

    # 2. Tenant creates complaint -> 201 Created
    res = client.post(
        "/api/complaints",
        headers={"Authorization": f"Bearer {tenant_token}"},
        json={
            "property_id": sample_property.id,
            "title": "Broken Geyser",
            "description": "Hot water not working in bathroom",
            "category": "plumbing",
            "priority": "high"
        }
    )
    assert res.status_code == 201
    complaint_data = res.json()
    assert complaint_data["complaint_number"].startswith("CMP-")
    assert complaint_data["status"] == "open"
    complaint_id = complaint_data["id"]

    # 3. Owner views complaints for their property -> 200 OK
    res = client.get("/api/complaints", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 200
    assert len(res.json()) == 1

    # 4. Owner updates complaint to in_progress then resolved -> 200 OK
    res = client.patch(
        f"/api/complaints/{complaint_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={
            "status": "resolved",
            "resolution_notes": "Replaced thermostat in geyser unit"
        }
    )
    assert res.status_code == 200
    assert res.json()["status"] == "resolved"
    assert res.json()["resolved_at"] is not None
    assert "Replaced thermostat" in res.json()["resolution_notes"]


def test_notifications_workflow(client, seed_test_users, tenant_token, admin_token, db_session):
    tenant = seed_test_users["tenant"]

    # 1. Seed notification
    notif = Notification(
        user_id=tenant.id,
        title="Payment Due Reminder",
        message="Your October rent invoice is due in 3 days",
        type="payment",
        is_read=False
    )
    db_session.add(notif)
    db_session.commit()
    db_session.refresh(notif)

    # 2. Tenant fetches notifications
    res = client.get("/api/notifications", headers={"Authorization": f"Bearer {tenant_token}"})
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) >= 1
    assert notifs[0]["is_read"] is False

    # 3. Mark single notification as read
    res = client.patch(f"/api/notifications/{notif.id}/read", headers={"Authorization": f"Bearer {tenant_token}"})
    assert res.status_code == 200
    assert res.json()["is_read"] is True

    # 4. Mark all as read
    res = client.post("/api/notifications/read-all", headers={"Authorization": f"Bearer {tenant_token}"})
    assert res.status_code == 200
    assert "marked as read" in res.json()["message"]
