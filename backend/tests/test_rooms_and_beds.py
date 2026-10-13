def test_create_room_with_beds(client, owner_token, sample_property):
    """Tests creating a room automatically provisions bed slots."""
    payload = {
        "property_id": sample_property.id,
        "room_number": "201",
        "room_type": "double",
        "sharing_capacity": 2,
        "rent": 14000.0,
        "ac_available": True,
        "floor": 2
    }
    response = client.post(
        "/api/rooms",
        json=payload,
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["room_number"] == "201"
    assert len(data["beds"]) == 2
    assert data["beds"][0]["bed_code"] == "A"
    assert data["beds"][1]["bed_code"] == "B"

def test_list_rooms_by_property(client, owner_token, sample_property):
    """Tests listing rooms filtered by property_id."""
    client.post(
        "/api/rooms",
        json={
            "property_id": sample_property.id,
            "room_number": "301",
            "room_type": "single",
            "sharing_capacity": 1,
            "rent": 18000.0
        },
        headers={"Authorization": f"Bearer {owner_token}"}
    )

    response = client.get(f"/api/rooms?property_id={sample_property.id}")
    assert response.status_code == 200
    rooms = response.json()
    assert len(rooms) >= 1
    assert any(r["room_number"] == "301" for r in rooms)

def test_update_bed_occupancy_syncs_property_vacant_beds(client, owner_token, sample_property):
    """Tests updating bed status to occupied decreases property vacant_beds, and vice versa."""
    # 1. Create a room with 2 beds
    create_res = client.post(
        "/api/rooms",
        json={
            "property_id": sample_property.id,
            "room_number": "105",
            "room_type": "double",
            "sharing_capacity": 2,
            "rent": 12000.0
        },
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert create_res.status_code == 201
    room_data = create_res.json()
    bed_a = room_data["beds"][0]
    bed_id = bed_a["id"]

    # Check property starting vacant beds
    prop_res = client.get(f"/api/properties/{sample_property.id}")
    initial_vacant = prop_res.json()["vacant_beds"]

    # 2. Toggle bed to occupied
    patch_res = client.patch(
        f"/api/beds/{bed_id}",
        json={
            "availability_status": "occupied",
            "tenant_name": "Rohan Sharma"
        },
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["availability_status"] == "occupied"
    assert patch_res.json()["tenant_name"] == "Rohan Sharma"

    # Property vacant beds should have decremented by 1
    prop_after_occupy = client.get(f"/api/properties/{sample_property.id}")
    assert prop_after_occupy.json()["vacant_beds"] == initial_vacant - 1

    # 3. Toggle bed back to vacant
    patch_vacant = client.patch(
        f"/api/beds/{bed_id}",
        json={"availability_status": "vacant"},
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert patch_vacant.status_code == 200
    assert patch_vacant.json()["availability_status"] == "vacant"
    assert patch_vacant.json()["tenant_name"] is None

    # Property vacant beds restored
    prop_restored = client.get(f"/api/properties/{sample_property.id}")
    assert prop_restored.json()["vacant_beds"] == initial_vacant

def test_tenant_cannot_update_bed_status(client, tenant_token, owner_token, sample_property):
    """Tests tenants cannot modify bed occupancy status (403 forbidden)."""
    create_res = client.post(
        "/api/rooms",
        json={
            "property_id": sample_property.id,
            "room_number": "106",
            "room_type": "single",
            "sharing_capacity": 1,
            "rent": 15000.0
        },
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    bed_id = create_res.json()["beds"][0]["id"]

    forbidden_res = client.patch(
        f"/api/beds/{bed_id}",
        json={"availability_status": "occupied"},
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert forbidden_res.status_code == 403
