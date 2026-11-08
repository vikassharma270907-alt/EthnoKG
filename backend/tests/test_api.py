import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import engine, Base, SessionLocal
from app.core.seeder import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_healthcheck(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_healthz_alias(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_dashboard_stats(client):
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_plants"] > 0
    assert data["total_relationships"] > 0
    assert data["indexed_publications"] > 0
    assert "evidence_distribution" in data
    assert "confidence_distribution" in data

def test_plants_api(client):
    response = client.get("/api/plants")
    assert response.status_code == 200
    plants = response.json()
    assert len(plants) > 0
    first_plant = plants[0]
    assert "scientific_name" in first_plant

    # Plant detail
    detail_res = client.get(f"/api/plants/{first_plant['id']}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "reported_conditions" in detail
    assert "relationships" in detail

def test_knowledge_graph_api(client):
    response = client.get("/api/graph?max_edges=50")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0

def test_assistant_query(client):
    response = client.post("/api/assistant/query", json={"question": "What traditional uses exist for Artemisia annua?"})
    assert response.status_code == 200
    data = response.json()
    assert "Artemisia annua" in data["answer"]
    assert len(data["cited_sources"]) > 0
    assert "medical_disclaimer" in data

def test_verification_api(client):
    # Fetch pending relations
    res = client.get("/api/extraction/results?status=pending")
    assert res.status_code == 200
    pending_list = res.json()
    if pending_list:
        rel_id = pending_list[0]["id"]
        # Approve
        app_res = client.post(f"/api/verification/{rel_id}/approve", json={"reviewer_name": "Test Curator", "notes": "Approved in unit test"})
        assert app_res.status_code == 200
        assert app_res.json()["verification_status"] == "approved"

def test_analytics_discovery_index(client):
    res = client.get("/api/analytics/discovery-index")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "discovery_score" in first
        assert "plant_name" in first
        assert "readiness_stage" in first

def test_analytics_convergence(client):
    res = client.get("/api/analytics/convergence")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "condition" in first
        assert "traditions" in first
        assert "convergence_score" in first

def test_analytics_sovereignty_certificate(client):
    plants_res = client.get("/api/plants")
    first_plant_id = plants_res.json()[0]["id"]
    res = client.get(f"/api/analytics/sovereignty-certificate/{first_plant_id}")
    assert res.status_code == 200
    cert = res.json()
    assert "certificate_id" in cert
    assert "sha256_provenance_hash" in cert
    assert len(cert["sha256_provenance_hash"]) == 64

def test_analytics_evaluation_benchmark(client):
    res = client.get("/api/analytics/evaluation-benchmark")
    assert res.status_code == 200
    bench = res.json()
    assert "summary_table" in bench
    assert len(bench["summary_table"]) > 0

