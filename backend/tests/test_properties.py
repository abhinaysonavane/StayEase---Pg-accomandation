def test_list_properties(client, sample_property):
    """Tests GET /api/properties returns paginated listings."""
    response = client.get("/api/properties")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 1
    assert data["items"][0]["name"] == "Silicon Coliving Spaces"

def test_filter_properties_by_city(client, sample_property):
    """Tests city filtering returns matching properties."""
    res_bangalore = client.get("/api/properties?city=Bangalore")
    assert res_bangalore.status_code == 200
    assert len(res_bangalore.json()["items"]) == 1

    res_delhi = client.get("/api/properties?city=Delhi")
    assert res_delhi.status_code == 200
    assert len(res_delhi.json()["items"]) == 0

def test_filter_properties_by_rent_range(client, sample_property):
    """Tests rent range filtering."""
    res_in_range = client.get("/api/properties?min_rent=10000&max_rent=15000")
    assert res_in_range.status_code == 200
    assert len(res_in_range.json()["items"]) == 1

    res_out_of_range = client.get("/api/properties?min_rent=15000&max_rent=20000")
    assert res_out_of_range.status_code == 200
    assert len(res_out_of_range.json()["items"]) == 0

def test_get_property_detail_success(client, sample_property):
    """Tests GET /api/properties/{id} returns details for existing property."""
    response = client.get(f"/api/properties/{sample_property.id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Silicon Coliving Spaces"

def test_get_property_detail_not_found(client):
    """Tests GET /api/properties/99999 returns 404."""
    response = client.get("/api/properties/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_create_property_owner_success(client, owner_token):
    """Tests property creation is permitted for Owner persona."""
    payload = {
        "name": "Highland PG for Men",
        "city": "Pune",
        "locality": "Hinjawadi",
        "monthly_rent": 9000.0,
        "total_beds": 20,
        "gender_policy": "male"
    }
    response = client.post(
        "/api/properties",
        json=payload,
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Highland PG for Men"
    assert response.json()["city"] == "Pune"

def test_create_property_tenant_forbidden(client, tenant_token):
    """Tests property creation is forbidden for Tenant persona (403)."""
    payload = {
        "name": "Unauthorized PG",
        "city": "Pune",
        "monthly_rent": 8000.0
    }
    response = client.post(
        "/api/properties",
        json=payload,
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert response.status_code == 403

def test_update_property_owner_success(client, owner_token, sample_property):
    """Tests property update is allowed for the property owner."""
    response = client.put(
        f"/api/properties/{sample_property.id}",
        json={"monthly_rent": 13500.0, "total_beds": 25},
        headers={"Authorization": f"Bearer {owner_token}"}
    )
    assert response.status_code == 200
    assert response.json()["monthly_rent"] == 13500.0

def test_delete_property_tenant_forbidden(client, tenant_token, sample_property):
    """Tests tenants cannot delete properties (403)."""
    response = client.delete(
        f"/api/properties/{sample_property.id}",
        headers={"Authorization": f"Bearer {tenant_token}"}
    )
    assert response.status_code == 403
