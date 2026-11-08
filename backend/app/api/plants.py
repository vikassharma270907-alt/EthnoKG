from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from ..core.database import get_db
from ..models.plant import Plant
from ..models.relationship import Relationship
from ..schemas.plant import PlantBrief, PlantDetail, SynonymBrief

router = APIRouter(prefix="/plants", tags=["Plants"])

@router.get("", response_model=List[PlantBrief])
def list_plants(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    query: Optional[str] = None,
    family: Optional[str] = None,
    tradition: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Plant)
    if query:
        q = q.filter(
            (Plant.scientific_name.ilike(f"%{query}%")) |
            (Plant.common_names_json.ilike(f"%{query}%")) |
            (Plant.genus.ilike(f"%{query}%")) |
            (Plant.family.ilike(f"%{query}%"))
        )
    if family:
        q = q.filter(Plant.family.ilike(f"%{family}%"))
    if tradition:
        q = q.join(Relationship, Relationship.plant_id == Plant.id).filter(
            Relationship.knowledge_tradition.ilike(f"%{tradition}%")
        ).distinct()

    plants = q.order_by(Plant.scientific_name.asc()).offset(skip).limit(limit).all()

    output = []
    if plants:
        plant_ids = [p.id for p in plants]
        count_q = db.query(
            Relationship.plant_id,
            func.count(Relationship.id)
        ).filter(Relationship.plant_id.in_(plant_ids))

        if tradition:
            count_q = count_q.filter(Relationship.knowledge_tradition.ilike(f"%{tradition}%"))

        counts_map = dict(count_q.group_by(Relationship.plant_id).all())

        for p in plants:
            output.append(PlantBrief(
                id=p.id,
                scientific_name=p.scientific_name,
                family=p.family,
                genus=p.genus,
                species=p.species,
                authority=p.authority,
                common_names=p.common_names,
                taxonomic_status=p.taxonomic_status or "Accepted",
                relationships_count=counts_map.get(p.id, 0)
            ))
    return output

@router.get("/{plant_id}", response_model=Dict[str, Any])
def get_plant_detail(
    plant_id: int,
    db: Session = Depends(get_db)
):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail=f"Plant {plant_id} not found.")

    relationships = (
        db.query(Relationship)
        .options(
            joinedload(Relationship.condition),
            joinedload(Relationship.compound),
            joinedload(Relationship.document)
        )
        .filter(Relationship.plant_id == plant.id)
        .all()
    )

    # Collect unique conditions, compounds, traditions, parts, preparations
    conditions_set = set()
    compounds_set = set()
    traditions_set = set()
    parts_set = set()
    preparations_set = set()
    evidence_breakdown = {}
    publications_set = {}

    rel_details = []
    for r in relationships:
        if r.condition:
            conditions_set.add(r.condition.name)
        if r.compound:
            compounds_set.add(r.compound.name)
        if r.knowledge_tradition:
            traditions_set.add(r.knowledge_tradition)
        if r.plant_part:
            parts_set.add(r.plant_part)
        if r.preparation_method:
            preparations_set.add(r.preparation_method)
        
        evidence_breakdown[r.evidence_tier] = evidence_breakdown.get(r.evidence_tier, 0) + 1
        
        doc = r.document
        if doc and doc.id not in publications_set:
            publications_set[doc.id] = {
                "id": doc.id,
                "title": doc.title,
                "authors": doc.authors,
                "year": doc.publication_year,
                "doi": doc.doi,
                "journal": doc.journal
            }

        rel_details.append({
            "id": r.id,
            "relation_type": r.relation_type,
            "condition": r.condition.name if r.condition else None,
            "compound": r.compound.name if r.compound else None,
            "plant_part": r.plant_part,
            "preparation_method": r.preparation_method,
            "pharmacological_activity": r.pharmacological_activity,
            "evidence_tier": r.evidence_tier,
            "supporting_excerpt": r.supporting_excerpt,
            "confidence": r.extraction_confidence,
            "verification_status": r.verification_status,
            "document_title": doc.title if doc else None,
            "document_doi": doc.doi if doc else None
        })

    synonyms = [SynonymBrief.model_validate(s) for s in plant.synonyms]

    return {
        "id": plant.id,
        "scientific_name": plant.scientific_name,
        "family": plant.family,
        "genus": plant.genus,
        "species": plant.species,
        "authority": plant.authority,
        "common_names": plant.common_names,
        "taxonomic_status": plant.taxonomic_status,
        "mpns_id": plant.mpns_id,
        "description": plant.description,
        "synonyms": synonyms,
        "relationships_count": len(relationships),
        "reported_conditions": sorted(list(conditions_set)),
        "reported_compounds": sorted(list(compounds_set)),
        "knowledge_traditions": sorted(list(traditions_set)),
        "parts_used": sorted(list(parts_set)),
        "preparation_methods": sorted(list(preparations_set)),
        "evidence_breakdown": evidence_breakdown,
        "supporting_publications": list(publications_set.values()),
        "relationships": rel_details
    }
