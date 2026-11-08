from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from ..core.database import get_db
from ..models.document import Document
from ..models.relationship import Relationship
from ..services.extraction_service import ExtractionEngine
from ..schemas.extraction import ExtractionRunRequest, ExtractionRunResponse
from ..schemas.relationship import RelationshipDetail

router = APIRouter(prefix="/extraction", tags=["Extraction Engine"])

@router.post("/run", response_model=ExtractionRunResponse)
def run_extraction(
    req: ExtractionRunRequest,
    db: Session = Depends(get_db)
):
    text_to_process = ""
    doc_title = "Ad-hoc Literature Extraction"
    doc_url = ""
    doc_year = 2024
    document_id = req.document_id

    if req.document_id:
        doc = db.query(Document).filter(Document.id == req.document_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {req.document_id} not found.")
        text_to_process = req.text_override or doc.raw_text
        doc_title = doc.title
        doc_url = doc.source_url or (f"https://doi.org/{doc.doi}" if doc.doi else "")
        doc_year = doc.publication_year or 2024
    elif req.text_override:
        text_to_process = req.text_override
        # Create an ad-hoc document record
        doc = Document(
            title="Manual Text Extraction Session",
            authors="Curator Input",
            publication_year=2024,
            journal="EthnoKG Extraction Workspace",
            raw_text=req.text_override,
            char_count=len(req.text_override)
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        document_id = doc.id
        doc_title = doc.title
    else:
        raise HTTPException(status_code=400, detail="Must provide either document_id or text_override.")

    records = ExtractionEngine.extract_from_text(
        text=text_to_process,
        document_title=doc_title,
        document_url=doc_url,
        document_year=doc_year
    )

    if document_id and records:
        ExtractionEngine.persist_extracted_records(db, document_id, records)

    return ExtractionRunResponse(
        extracted_count=len(records),
        document_id=document_id,
        document_title=doc_title,
        results=records
    )

@router.get("/results", response_model=List[RelationshipDetail])
def get_extraction_results(
    status: Optional[str] = Query(None, description="pending, approved, rejected"),
    plant_id: Optional[int] = None,
    document_id: Optional[int] = None,
    min_confidence: Optional[float] = None,
    evidence_tier: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    q = db.query(Relationship).options(
        joinedload(Relationship.plant),
        joinedload(Relationship.condition),
        joinedload(Relationship.compound),
        joinedload(Relationship.document)
    )
    if status:
        q = q.filter(Relationship.verification_status == status)
    if plant_id:
        q = q.filter(Relationship.plant_id == plant_id)
    if document_id:
        q = q.filter(Relationship.document_id == document_id)
    if min_confidence is not None:
        q = q.filter(Relationship.extraction_confidence >= min_confidence)
    if evidence_tier:
        q = q.filter(Relationship.evidence_tier == evidence_tier)

    relationships = q.order_by(Relationship.id.desc()).offset(skip).limit(limit).all()

    output = []
    for r in relationships:
        output.append(RelationshipDetail(
            id=r.id,
            plant_id=r.plant_id,
            plant_scientific_name=r.plant.scientific_name if r.plant else "Unknown",
            condition_id=r.condition_id,
            condition_name=r.condition.name if r.condition else None,
            compound_id=r.compound_id,
            compound_name=r.compound.name if r.compound else None,
            document_id=r.document_id,
            document_title=r.document.title if r.document else "Unknown Doc",
            document_doi=r.document.doi if r.document else None,
            document_year=r.document.publication_year if r.document else None,
            relation_type=r.relation_type,
            reported_use=r.reported_use,
            plant_part=r.plant_part,
            preparation_method=r.preparation_method,
            pharmacological_activity=r.pharmacological_activity,
            geographic_context=r.geographic_context,
            knowledge_tradition=r.knowledge_tradition,
            evidence_tier=r.evidence_tier,
            evidence_statement=r.evidence_statement,
            supporting_excerpt=r.supporting_excerpt,
            page_or_section=r.page_or_section,
            extraction_confidence=r.extraction_confidence,
            verification_status=r.verification_status,
            created_at=r.created_at,
            updated_at=r.updated_at
        ))
    return output

@router.get("/{relationship_id}", response_model=RelationshipDetail)
def get_relationship_by_id(
    relationship_id: int,
    db: Session = Depends(get_db)
):
    r = (
        db.query(Relationship)
        .options(
            joinedload(Relationship.plant),
            joinedload(Relationship.condition),
            joinedload(Relationship.compound),
            joinedload(Relationship.document)
        )
        .filter(Relationship.id == relationship_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail=f"Relationship {relationship_id} not found.")

    return RelationshipDetail(
        id=r.id,
        plant_id=r.plant_id,
        plant_scientific_name=r.plant.scientific_name if r.plant else "Unknown",
        condition_id=r.condition_id,
        condition_name=r.condition.name if r.condition else None,
        compound_id=r.compound_id,
        compound_name=r.compound.name if r.compound else None,
        document_id=r.document_id,
        document_title=r.document.title if r.document else "Unknown Doc",
        document_doi=r.document.doi if r.document else None,
        document_year=r.document.publication_year if r.document else None,
        relation_type=r.relation_type,
        reported_use=r.reported_use,
        plant_part=r.plant_part,
        preparation_method=r.preparation_method,
        pharmacological_activity=r.pharmacological_activity,
        geographic_context=r.geographic_context,
        knowledge_tradition=r.knowledge_tradition,
        evidence_tier=r.evidence_tier,
        evidence_statement=r.evidence_statement,
        supporting_excerpt=r.supporting_excerpt,
        page_or_section=r.page_or_section,
        extraction_confidence=r.extraction_confidence,
        verification_status=r.verification_status,
        created_at=r.created_at,
        updated_at=r.updated_at
    )

