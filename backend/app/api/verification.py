from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..services.verification_service import VerificationService
from ..schemas.relationship import RelationshipDetail, RelationshipUpdate, VerificationActionRequest

router = APIRouter(prefix="/verification", tags=["Human Verification Workspace"])

@router.post("/{relationship_id}/approve", response_model=RelationshipDetail)
def approve_relationship(
    relationship_id: int,
    action: VerificationActionRequest,
    db: Session = Depends(get_db)
):
    try:
        r = VerificationService.approve_relationship(
            db=db,
            relationship_id=relationship_id,
            reviewer_name=action.reviewer_name,
            notes=action.notes
        )
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
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{relationship_id}/reject", response_model=RelationshipDetail)
def reject_relationship(
    relationship_id: int,
    action: VerificationActionRequest,
    db: Session = Depends(get_db)
):
    try:
        r = VerificationService.reject_relationship(
            db=db,
            relationship_id=relationship_id,
            reviewer_name=action.reviewer_name,
            reason=action.reason or action.notes
        )
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
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{relationship_id}", response_model=RelationshipDetail)
def update_and_approve_relationship(
    relationship_id: int,
    update_data: RelationshipUpdate,
    db: Session = Depends(get_db)
):
    try:
        r = VerificationService.update_relationship(
            db=db,
            relationship_id=relationship_id,
            update_data=update_data
        )
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
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/history", response_model=List[Dict[str, Any]])
def get_all_audit_history(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    logs = VerificationService.get_all_verification_history(db, limit=limit)
    return [
        {
            "id": l.id,
            "relationship_id": l.relationship_id,
            "previous_status": l.previous_status,
            "new_status": l.new_status,
            "reviewer_name": l.reviewer_name,
            "curator_notes": l.curator_notes,
            "corrections_json": l.corrections_json,
            "created_at": l.created_at
        }
        for l in logs
    ]

@router.get("/history/{relationship_id}", response_model=List[Dict[str, Any]])
def get_audit_history(
    relationship_id: int,
    db: Session = Depends(get_db)
):
    logs = VerificationService.get_verification_history(db, relationship_id)
    return [
        {
            "id": l.id,
            "relationship_id": l.relationship_id,
            "previous_status": l.previous_status,
            "new_status": l.new_status,
            "reviewer_name": l.reviewer_name,
            "curator_notes": l.curator_notes,
            "corrections_json": l.corrections_json,
            "created_at": l.created_at
        }
        for l in logs
    ]
