from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..core.database import get_db
from ..models.plant import Plant
from ..models.condition import Condition
from ..models.compound import Compound
from ..models.document import Document
from ..models.relationship import Relationship
from ..schemas.graph_assistant_dashboard import DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_plants = db.query(Plant).count()
    total_relationships = db.query(Relationship).count()
    total_compounds = db.query(Compound).count()
    indexed_publications = db.query(Document).count()

    verified_count = db.query(Relationship).filter(Relationship.verification_status == "approved").count()
    pending_count = db.query(Relationship).filter(Relationship.verification_status == "pending").count()
    rejected_count = db.query(Relationship).filter(Relationship.verification_status == "rejected").count()

    avg_conf_row = db.query(func.avg(Relationship.extraction_confidence)).scalar()
    avg_conf = float(avg_conf_row) if avg_conf_row is not None else 0.85

    # Evidence distribution
    evidence_rows = db.query(Relationship.evidence_tier, func.count(Relationship.id)).group_by(Relationship.evidence_tier).all()
    evidence_dist = {tier or "Unclassified": count for tier, count in evidence_rows}

    # Ensure all 6 standard tiers have a key for consistent charting
    for standard_tier in [
        "Traditional Use Report", 
        "Ethnobotanical Field Observation", 
        "In-Vitro Experimental Bioassay", 
        "In-Vivo Preclinical Model", 
        "Clinical Human Trial", 
        "In-Silico Prediction"
    ]:
        if standard_tier not in evidence_dist:
            evidence_dist[standard_tier] = 0

    # Confidence distribution
    all_confs = db.query(Relationship.extraction_confidence).all()
    conf_dist = {
        "0.90-1.00": 0,
        "0.80-0.89": 0,
        "0.70-0.79": 0,
        "<0.70": 0
    }
    for (c,) in all_confs:
        if c is None:
            continue
        if c >= 0.90:
            conf_dist["0.90-1.00"] += 1
        elif c >= 0.80:
            conf_dist["0.80-0.89"] += 1
        elif c >= 0.70:
            conf_dist["0.70-0.79"] += 1
        else:
            conf_dist["<0.70"] += 1

    # Traditions distribution
    trad_rows = db.query(Relationship.knowledge_tradition, func.count(Relationship.id)).group_by(Relationship.knowledge_tradition).all()
    trad_dist = {trad or "Folk Medicine": count for trad, count in trad_rows}

    # Recent documents
    recent_docs = db.query(Document).order_by(Document.ingested_at.desc()).limit(5).all()
    recent_docs_list = [
        {
            "id": d.id,
            "title": d.title,
            "authors": d.authors,
            "year": d.publication_year,
            "journal": d.journal,
            "char_count": d.char_count,
            "relationships_count": db.query(Relationship).filter(Relationship.document_id == d.id).count(),
            "ingested_at": d.ingested_at.isoformat()
        }
        for d in recent_docs
    ]

    return DashboardStatsResponse(
        total_plants=total_plants,
        total_relationships=total_relationships,
        total_compounds=total_compounds,
        indexed_publications=indexed_publications,
        verified_relationships=verified_count,
        pending_verifications=pending_count,
        rejected_verifications=rejected_count,
        avg_extraction_confidence=round(avg_conf, 3),
        evidence_distribution=evidence_dist,
        confidence_distribution=conf_dist,
        traditions_distribution=trad_dist,
        recent_documents=recent_docs_list
    )

