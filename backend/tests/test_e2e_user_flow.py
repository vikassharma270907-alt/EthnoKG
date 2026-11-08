import pytest

def test_complete_end_to_end_researcher_workflow(client):
    """
    End-to-End Smoke Test of the Primary EthnoKG Researcher & Curator Flow:
    1. Verify system health & DB readiness (/healthz)
    2. Inspect platform dashboard statistics
    3. Query taxonomic plant intelligence for Artemisia annua
    4. Ingest and extract a novel literature passage via the 12-stage engine
    5. Curate the extracted assertion via the human verification workspace
    6. Verify audit history contains the signed curator event
    7. Execute a RAG query to verify grounded literature citation
    8. Generate a Nagoya Protocol Sovereignty Certificate
    9. Fetch Cytoscape knowledge graph and verify edge connectivity
    """
    # 1. Healthcheck & DB readiness
    health = client.get("/healthz")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"
    assert health.json()["database"] == "connected"

    # 2. Inspect platform dashboard statistics
    stats_res = client.get("/api/dashboard/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_plants"] >= 10
    assert stats["total_relationships"] > 0
    assert "evidence_distribution" in stats

    # 3. Query plant intelligence for Artemisia annua
    plant_search = client.get("/api/plants?query=Artemisia")
    assert plant_search.status_code == 200
    plants = plant_search.json()
    assert len(plants) > 0
    artemisia = next((p for p in plants if "Artemisia annua" in p["scientific_name"]), None)
    assert artemisia is not None, "Artemisia annua should be indexed in seed dataset"

    plant_detail = client.get(f"/api/plants/{artemisia['id']}")
    assert plant_detail.status_code == 200
    detail_data = plant_detail.json()
    assert detail_data["scientific_name"] == "Artemisia annua L."
    assert len(detail_data["reported_conditions"]) > 0
    assert len(detail_data["relationships"]) > 0

    # 4. Ingest and extract a novel literature passage via 12-stage engine
    test_literature = (
        "In Traditional Chinese Medicine, aqueous preparations of the aerial parts of Artemisia annua L. "
        "have been utilized for millennia to treat intermittent fever. Modern in vitro bioassays confirm "
        "artemisinin exhibits potent inhibition against Plasmodium falciparum parasites."
    )
    extract_res = client.post("/api/extraction/run", json={"text_override": test_literature})
    assert extract_res.status_code == 200
    extraction_output = extract_res.json()
    assert extraction_output["extracted_count"] >= 1
    new_record = extraction_output["results"][0]
    assert "Artemisia annua" in new_record["scientific_name"]
    assert new_record["evidence_category"] in ["In-Vitro Experimental Bioassay", "Traditional Use Report"]
    assert new_record["extraction_confidence"] >= 0.75

    # 5. Curate the extracted assertion via verification workspace
    pending_res = client.get("/api/extraction/results?status=pending")
    assert pending_res.status_code == 200
    pending_items = pending_res.json()
    assert len(pending_items) > 0

    target_rel_id = pending_items[0]["id"]
    approval_res = client.post(
        f"/api/verification/{target_rel_id}/approve",
        json={"reviewer_name": "Dr. E2E Lead Curator", "notes": "Verified against WHO monograph."}
    )
    assert approval_res.status_code == 200
    approved_item = approval_res.json()
    assert approved_item["verification_status"] == "approved"

    # 6. Verify audit history contains the signed curator event
    history_res = client.get("/api/verification/history?limit=10")
    assert history_res.status_code == 200
    history_logs = history_res.json()
    assert len(history_logs) > 0
    curator_log = next((l for l in history_logs if l["relationship_id"] == target_rel_id), None)
    assert curator_log is not None
    assert curator_log["reviewer_name"] == "Dr. E2E Lead Curator"

    # 7. Execute a Grounded RAG query to verify literature citation
    assistant_res = client.post(
        "/api/assistant/query",
        json={"question": "What evidence supports Artemisia annua for fever?"}
    )
    assert assistant_res.status_code == 200
    ans_data = assistant_res.json()
    assert len(ans_data["cited_sources"]) > 0
    assert "Artemisia annua" in ans_data["answer"]
    assert "SCIENTIFIC RESEARCH NOTICE" in ans_data["medical_disclaimer"]

    # 8. Generate a Nagoya Protocol Sovereignty Certificate
    cert_res = client.get(f"/api/analytics/sovereignty-certificate/{artemisia['id']}")
    assert cert_res.status_code == 200
    cert = cert_res.json()
    assert cert["scientific_name"] == "Artemisia annua L."
    assert len(cert["sha256_provenance_hash"]) == 64  # Valid SHA-256 hash
    assert "Nagoya" in cert["certificate"]["certificate_authority"]

    # 9. Fetch Cytoscape knowledge graph and verify edge connectivity
    graph_res = client.get(f"/api/graph?plant_id={artemisia['id']}&max_edges=50")
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert "nodes" in graph_data
    assert "edges" in graph_data
    assert len(graph_data["nodes"]) >= 2
    assert len(graph_data["edges"]) >= 1
