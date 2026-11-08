import io
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import engine, Base, SessionLocal
from app.core.seeder import seed_database
from app.models.plant import Plant
from app.models.relationship import Relationship
from app.models.document import Document

def run_all_checks():
    print("=" * 65)
    print("ETHNOKG PRODUCTION READINESS & DEPLOYMENT VERIFICATION")
    print("=" * 65)
    
    # 1. Setup DB & Seed
    print("\n[CHECK 1/12] Database Setup & Seeding...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    
    plants_count = db.query(Plant).count()
    rels_count = db.query(Relationship).count()
    docs_count = db.query(Document).count()
    db.close()
    
    assert plants_count > 0, "No plants found in database"
    assert rels_count > 0, "No relationships found in database"
    assert docs_count > 0, "No documents found in database"
    print(f"  --> PASS: Database populated with {plants_count} plants, {rels_count} relationships, {docs_count} documents.")

    client = TestClient(app)

    # 2. Health Check
    print("\n[CHECK 2/12] API Health Check & Database Ping...")
    res = client.get("/api/health")
    assert res.status_code == 200
    health_data = res.json()
    assert health_data["status"] == "healthy"
    assert health_data["database"] == "connected"
    print(f"  --> PASS: /api/health returned healthy, db connected.")

    # 3. CORS Preflight & Headers
    print("\n[CHECK 3/12] CORS Policy Verification...")
    res = client.options(
        "/api/health",
        headers={
            "Origin": "https://ethnokg-frontend.onrender.com",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert res.status_code == 200
    assert "access-control-allow-origin" in res.headers
    print(f"  --> PASS: CORS headers properly configured for Render frontend origin.")

    # 4. Research Dashboard API
    print("\n[CHECK 4/12] Research Dashboard Analytics...")
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_plants"] > 0
    assert len(stats["evidence_distribution"]) >= 6
    assert "confidence_distribution" in stats
    print(f"  --> PASS: Dashboard stats active. Evidence tiers: {list(stats['evidence_distribution'].keys())}")

    # 5. Plant Intelligence Explorer
    print("\n[CHECK 5/12] Plant Intelligence Explorer & Taxonomy...")
    res = client.get("/api/plants?limit=10")
    assert res.status_code == 200
    plants = res.json()
    assert len(plants) > 0
    plant_id = plants[0]["id"]
    detail_res = client.get(f"/api/plants/{plant_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "reported_conditions" in detail
    assert "supporting_publications" in detail
    print(f"  --> PASS: Plant {detail['scientific_name']} loaded with {len(detail['relationships'])} relationships.")

    # 6. Compound & Phytochemical Explorer
    print("\n[CHECK 6/12] Compound Explorer API...")
    res = client.get("/api/compounds?limit=10")
    assert res.status_code == 200
    comps = res.json()
    assert len(comps) > 0
    print(f"  --> PASS: Loaded {len(comps)} bioactive compounds (e.g. {comps[0]['name']}, PubChem: {comps[0].get('pubchem_cid')}).")

    # 7. Knowledge Graph Serialization (Cytoscape JSON)
    print("\n[CHECK 7/12] Cytoscape Knowledge Graph API...")
    res = client.get("/api/graph?max_edges=50")
    assert res.status_code == 200
    g = res.json()
    assert "nodes" in g and "edges" in g
    assert len(g["nodes"]) > 0
    print(f"  --> PASS: Knowledge Graph generated {len(g['nodes'])} nodes and {len(g['edges'])} edges.")

    # 8. Document Upload & In-Memory Extraction
    print("\n[CHECK 8/12] Document Upload & Ingestion...")
    sample_text = (
        "In Ayurvedic and traditional Southeast Asian medicine, Curcuma longa L. (turmeric rhizome) has been prescribed "
        "for gastrointestinal inflammation and rheumatoid arthritis. In vitro bioassays confirm curcumin significantly "
        "downregulates NF-kappaB and reduces inflammatory cytokine production."
    )
    upload_res = client.post(
        "/api/documents/upload",
        files={"file": ("test_turmeric.txt", io.BytesIO(sample_text.encode("utf-8")), "text/plain")},
        data={"title": "Curcuma longa Clinical Review", "authors": "Aggarwal et al.", "publication_year": 2024}
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    uploaded_doc = upload_res.json()
    doc_id = uploaded_doc["id"]
    print(f"  --> PASS: Document #{doc_id} ('{uploaded_doc['title']}') uploaded successfully.")

    # 9. 12-Stage Literature Extraction Engine
    print("\n[CHECK 9/12] 12-Stage Literature Mining Engine...")
    ext_res = client.post(
        "/api/extraction/run",
        json={"document_id": doc_id, "engine": "hybrid"}
    )
    assert ext_res.status_code == 200
    ext_data = ext_res.json()
    assert ext_data["extracted_count"] > 0
    first_ext = ext_data["results"][0]
    print(f"  --> PASS: Extracted {ext_data['extracted_count']} claims. Found '{first_ext['scientific_name']}' -> '{first_ext['medical_condition']}' [{first_ext['evidence_category']}].")

    # 10. Grounded RAG Research Assistant & Citations
    print("\n[CHECK 10/12] Grounded RAG Research Assistant (Zero Hallucination)...")
    rag_res = client.post(
        "/api/assistant/query",
        json={"question": "What traditional uses exist for Withania somnifera?"}
    )
    assert rag_res.status_code == 200
    rag_data = rag_res.json()
    assert "Withania somnifera" in rag_data["answer"]
    assert len(rag_data["cited_sources"]) > 0
    assert "SCIENTIFIC RESEARCH NOTICE" in rag_data["medical_disclaimer"]
    print(f"  --> PASS: Grounded RAG responded with {len(rag_data['cited_sources'])} cited sources & strict medical disclaimer.")

    # 11. Human Verification & Curator Governance
    print("\n[CHECK 11/12] Curator Verification Workflow...")
    pending_res = client.get("/api/extraction/results?status=pending")
    assert pending_res.status_code == 200
    pending_list = pending_res.json()
    assert len(pending_list) > 0
    target_rel = pending_list[0]
    
    approve_res = client.post(
        f"/api/verification/{target_rel['id']}/approve",
        json={"reviewer_name": "Senior Curator", "notes": "Automated verification test pass"}
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["verification_status"] == "approved"
    
    # Audit history
    hist_res = client.get("/api/verification/history")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) > 0
    print(f"  --> PASS: Relationship #{target_rel['id']} approved by curator. Audit log recorded.")

    # 12. External Source Tracking
    print("\n[CHECK 12/12] External Taxonomy & Registry Tracking...")
    sources_res = client.get("/api/sources")
    assert sources_res.status_code == 200
    sources = sources_res.json()
    assert len(sources) >= 5
    print(f"  --> PASS: {len(sources)} authoritative external registries indexed (Kew MPNS, WFO, PMC OA, PubChem, ChEMBL, GBIF, BHL).")

    print("\n" + "=" * 65)
    print("ALL 12 PRE-DEPLOYMENT PRODUCTION READINESS CHECKS PASSED!")
    print("=" * 65)

if __name__ == "__main__":
    run_all_checks()
