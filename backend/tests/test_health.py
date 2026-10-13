def test_health_check_endpoint(client):
    """Tests GET /api/health returns 200 with service information."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "service" in data
    assert "database" in data

def test_root_health_check_endpoint(client):
    """Tests GET /health (unprefixed) returns 200 as required."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "service" in data
    assert "database" in data

