def test_create_join_request_success(client, tenant_token, sample_property):
    """Tests tenant can submit a join request."""
    payload = {
        "property_id": sample_property.id,
        "move_in_date": "2025-02-01",
        "room_type_preference": "single",
        "notes": "Looking for high floor with desk"
    }
    response = client.post(
        "/api/join-requests",
        json=payload,
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"
    assert data["property_id"] == sample_property.id
    assert data["move_in_date"] == "2025-02-01"

def test_create_join_request_invalid_property(client, tenant_token):
    """Tests join request for non-existent property returns 404."""
    payload = {
        "property_id": 99999,
        "move_in_date": "2025-02-01",
        "room_type_preference": "single"
    }
    response = client.post(
        "/api/join-requests",
        json=payload,
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert response.status_code == 404

def test_tenant_data_isolation(client, tenant_token, owner_token, sample_property):
    """Tests tenant can only view their own requests."""
    res1 = client.post(
        "/api/join-requests",
        json={
            "property_id": sample_property.id,
            "move_in_date": "2025-03-01",
            "room_type_preference": "double"
        },
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    req_id = res1.json()["id"]

    res_tenant = client.get(
        "/api/join-requests",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert res_tenant.status_code == 200
    tenant_req_ids = [r["id"] for r in res_tenant.json()]
    assert req_id in tenant_req_ids

    res_owner = client.get(
        "/api/join-requests",
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert res_owner.status_code == 200
    owner_req_ids = [r["id"] for r in res_owner.json()]
    assert req_id in owner_req_ids

def test_owner_approve_join_request(client, tenant_token, owner_token, sample_property):
    """Tests property owner can approve a join request and assign room/bed."""
    res = client.post(
        "/api/join-requests",
        json={
            "property_id": sample_property.id,
            "move_in_date": "2025-03-01",
            "room_type_preference": "single"
        },
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    req_id = res.json()["id"]

    res_approve = client.patch(
        f"/api/join-requests/{req_id}/status",
        json={
            "status": "approved",
            "allocated_room": "101",
            "allocated_bed": "A"
        },
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "approved"
    assert res_approve.json()["allocated_room"] == "101"

def test_tenant_cannot_approve_request(client, tenant_token, sample_property):
    """Tests tenant cannot approve requests (403)."""
    res = client.post(
        "/api/join-requests",
        json={
            "property_id": sample_property.id,
            "move_in_date": "2025-03-01",
            "room_type_preference": "single"
        },
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    req_id = res.json()["id"]

    res_fail = client.patch(
        f"/api/join-requests/{req_id}/status",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert res_fail.status_code == 403
