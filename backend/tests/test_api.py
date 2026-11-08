import pytest

def test_healthcheck(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

    # Test HEAD request for Render health check
    head_res = client.head("/api/health")
    assert head_res.status_code == 200

def test_healthz_alias(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

    # Test HEAD request for Render health check
    head_res = client.head("/healthz")
    assert head_res.status_code == 200

def test_health_alias(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

    head_res = client.head("/health")
    assert head_res.status_code == 200

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

def test_assistant_empty_query_returns_400(client):
    res_empty = client.post("/api/assistant/query", json={"question": ""})
    assert res_empty.status_code == 400
    assert "blank or whitespace-only" in res_empty.json()["detail"]

    res_ws = client.post("/api/assistant/query", json={"question": "   \n\t  "})
    assert res_ws.status_code == 400
    assert "blank or whitespace-only" in res_ws.json()["detail"]

def test_verification_api(client):
    # Test GET /api/verification/pending
    pending_check = client.get("/api/verification/pending")
    assert pending_check.status_code == 200
    assert isinstance(pending_check.json(), list)

    # Fetch pending relations
    res = client.get("/api/extraction/results?status=pending")
    assert res.status_code == 200
    pending_list = res.json()
    if not pending_list:
        adhoc = client.post("/api/extraction/run", json={"text_override": "Artemisia annua treats fever in TCM."})
        assert adhoc.status_code == 200
        res = client.get("/api/extraction/results?status=pending")
        pending_list = res.json()
    assert len(pending_list) > 0, "Expected at least one pending relationship in database"
    rel_id = pending_list[0]["id"]
    # Approve
    app_res = client.post(f"/api/verification/{rel_id}/approve", json={"reviewer_name": "Test Curator", "notes": "Approved in unit test"})
    assert app_res.status_code == 200
    assert app_res.json()["verification_status"] == "approved"

def test_verification_pending_endpoint(client):
    res = client.get("/api/verification/pending?limit=10")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # Test limit validation
    res_bad = client.get("/api/verification/pending?limit=0")
    assert res_bad.status_code == 422
    res_overflow = client.get("/api/verification/pending?limit=500")
    assert res_overflow.status_code == 422

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

def test_api_info(client):
    res = client.get("/api/info")
    assert res.status_code == 200
    data = res.json()
    assert data["project"] == "EthnoKG"
    assert data["api_status"] == "operational"

def test_compounds_api(client):
    res = client.get("/api/compounds")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "name" in data[0]

    # Search with query filter and verify cheminformatics enrichment
    res_search = client.get("/api/compounds?query=Artemisinin")
    assert res_search.status_code == 200
    artemisinin_list = res_search.json()
    assert len(artemisinin_list) > 0
    artemisinin = artemisinin_list[0]
    assert artemisinin["name"] == "Artemisinin"
    assert artemisinin["pubchem_cid"] == "68827"
    assert artemisinin["molecular_formula"] == "C15H22O5"
    assert artemisinin["smiles"] == "CC1CCC2C(C(=O)OC3C2(C1)OOC3(C)C)C"

def test_conditions_api(client):
    res = client.get("/api/conditions")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "name" in data[0]

    # Search by query
    res_search = client.get("/api/conditions?query=Malaria")
    assert res_search.status_code == 200
    assert len(res_search.json()) > 0

def test_sources_registry_api(client):
    res = client.get("/api/sources")
    assert res.status_code == 200
    sources = res.json()
    assert isinstance(sources, list)
    assert len(sources) >= 5
    source_ids = [s["id"] for s in sources]
    assert "kew_mpns" in source_ids
    assert "wfo" in source_ids

def test_documents_lifecycle(client):
    # Ingest document
    payload = {
        "title": "Comprehensive Ethnobotanical Field Survey",
        "authors": "Dr. Ethnobotanist et al.",
        "publication_year": 2025,
        "journal": "Journal of Ethnopharmacology",
        "doi": "10.1016/j.jep.2025.118999",
        "raw_text": "Leaves of Artemisia annua L. are traditionally brewed as a tea for malaria and fever in East Africa."
    }
    create_res = client.post("/api/documents/ingest", json=payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["id"] > 0
    doc_id = created["id"]

    # Fetch document by id
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == payload["title"]

    # List documents
    list_res = client.get("/api/documents?limit=10")
    assert list_res.status_code == 200
    assert len(list_res.json()) > 0

def test_extraction_run_custom_text(client):
    text = (
        "In Traditional Chinese Medicine, cold aqueous extracts of Artemisia annua L. "
        "have been utilized to alleviate intermittent fevers. In-vitro assays indicate artemisinin "
        "exhibits potent antimalarial action."
    )
    res = client.post("/api/extraction/run", json={"text_override": text})
    assert res.status_code == 200
    data = res.json()
    assert data["extracted_count"] > 0
    assert len(data["results"]) > 0

def test_plants_filter_by_tradition(client):
    res = client.get("/api/plants?tradition=Ayurveda")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    plant_names = [p["scientific_name"] for p in data]
    # Verify deduplication - no duplicate plants
    assert len(plant_names) == len(set(plant_names))
    for plant in data:
        assert plant["relationships_count"] > 0

def test_verification_reject_and_patch(client):
    res = client.get("/api/extraction/results?status=pending")
    assert res.status_code == 200
    items = res.json()
    if not items:
        adhoc = client.post("/api/extraction/run", json={"text_override": "Withania somnifera relieves stress in Ayurveda."})
        assert adhoc.status_code == 200
        res = client.get("/api/extraction/results?status=pending")
        items = res.json()
    assert len(items) > 0, "Expected at least one relationship to reject and patch"
    rel_id = items[0]["id"]
    # Reject
    rej_res = client.post(f"/api/verification/{rel_id}/reject", json={"reviewer_name": "Auditor", "reason": "Test rejection"})
    assert rej_res.status_code == 200
    assert rej_res.json()["verification_status"] == "rejected"

    # Patch / update
    patch_res = client.patch(f"/api/verification/{rel_id}", json={"evidence_tier": "Clinical Human Trial", "notes": "Upgraded tier"})
    assert patch_res.status_code == 200
    assert patch_res.json()["evidence_tier"] == "Clinical Human Trial"

def test_verification_audit_history(client):
    res = client.get("/api/verification/history")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_graph_entity_subgraph(client):
    res = client.get("/api/graph/entity/plant_1")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data

    # Test condition entity
    res_cond = client.get("/api/graph/entity/cond_1")
    assert res_cond.status_code == 200

    # Test invalid entity formats
    res_err1 = client.get("/api/graph/entity/invalid_prefix")
    assert res_err1.status_code == 400

    res_err2 = client.get("/api/graph/entity/plant_notanumber")
    assert res_err2.status_code == 400

def test_404_handlers(client):
    # Non-existent plant
    plant_res = client.get("/api/plants/999999")
    assert plant_res.status_code == 404

    # Non-existent document
    doc_res = client.get("/api/documents/999999")
    assert doc_res.status_code == 404

    # Non-existent relationship
    rel_res = client.get("/api/extraction/999999")
    assert rel_res.status_code == 404

def test_spa_path_traversal_protection(client):
    res = client.get("/../../.env")
    assert res.status_code in [403, 404]

    res2 = client.get("/..%2F..%2Fbackend%2Fcore%2Fconfig.py")
    assert res2.status_code in [403, 404]

def test_document_upload_txt(client):
    import io
    file_content = b"Leaves of Withania somnifera are used for stress and anxiety in Ayurvedic traditions."
    files = {"file": ("survey.txt", io.BytesIO(file_content), "text/plain")}
    data = {
        "title": "Field Report on Withania",
        "authors": "Dr. Botanist",
        "publication_year": 2024,
        "journal": "Ethnobotany Letters"
    }
    res = client.post("/api/documents/upload", files=files, data=data)
    assert res.status_code == 200
    doc = res.json()
    assert doc["title"] == "Field Report on Withania"
    assert doc["id"] > 0

def test_verification_error_cases(client):
    res_app = client.post("/api/verification/999999/approve", json={"reviewer_name": "Tester"})
    assert res_app.status_code == 404

    res_rej = client.post("/api/verification/999999/reject", json={"reviewer_name": "Tester", "reason": "None"})
    assert res_rej.status_code == 404

    res_patch = client.patch("/api/verification/999999", json={"notes": "Update"})
    assert res_patch.status_code == 404

def test_extraction_empty_text_returns_400(client):
    # Empty string text_override
    res_empty = client.post("/api/extraction/run", json={"text_override": ""})
    assert res_empty.status_code == 400
    assert "empty document or text" in res_empty.json()["detail"].lower()

    # Whitespace-only text_override
    res_ws = client.post("/api/extraction/run", json={"text_override": "   \n\t  "})
    assert res_ws.status_code == 400
    assert "empty document or text" in res_ws.json()["detail"].lower()

    # Neither document_id nor text_override
    res_none = client.post("/api/extraction/run", json={})
    assert res_none.status_code == 400

def test_upload_unsupported_extension_returns_400(client):
    import io
    bad_file = {"file": ("malicious.exe", io.BytesIO(b"MZ..."), "application/octet-stream")}
    data = {"title": "Executable File"}
    res = client.post("/api/documents/upload", files=bad_file, data=data)
    assert res.status_code == 400
    assert "unsupported file format" in res.json()["detail"].lower()

def test_verification_history_pagination_guard(client):
    # Invalid limit (less than 1)
    res_low = client.get("/api/verification/history?limit=0")
    assert res_low.status_code == 422  # FastAPI validation error

    # Invalid limit (exceeds max 200)
    res_high = client.get("/api/verification/history?limit=250")
    assert res_high.status_code == 422

def test_resolve_botanical_taxon(client):
    # Test valid scientific binomial
    res = client.get("/api/plants/resolve-taxon?name=Artemisia annua")
    assert res.status_code == 200
    data = res.json()
    assert data["matched"] is True
    assert "Artemisia annua" in data["scientific_name"]
    assert data["genus"] == "Artemisia"
    assert data["family"] == "Asteraceae"
    assert "POWO" in data["kew_status"]

    # Test vernacular synonym
    res_common = client.get("/api/plants/resolve-taxon?name=sweet wormwood")
    assert res_common.status_code == 200
    assert res_common.json()["matched"] is True
    assert "Artemisia annua" in res_common.json()["scientific_name"]

    # Test unmatched query
    res_unknown = client.get("/api/plants/resolve-taxon?name=Fictionalis Plantus")
    assert res_unknown.status_code == 200
    assert res_unknown.json()["matched"] is False

def test_graph_cache_endpoints(client):
    # Test get cache stats
    res_stats = client.get("/api/graph/cache/stats")
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert "cached_queries" in stats
    assert "ttl_seconds" in stats

    # Query graph to populate cache
    res_graph = client.get("/api/graph")
    assert res_graph.status_code == 200

    # Test clear cache
    res_clear = client.post("/api/graph/cache/clear")
    assert res_clear.status_code == 200
    assert res_clear.json()["status"] == "cache_flushed"





