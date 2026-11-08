from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from ..core.database import get_db
from ..models.compound import Compound
from ..models.relationship import Relationship
from ..schemas.condition_compound import CompoundBrief

router = APIRouter(prefix="/compounds", tags=["Compounds"])

@router.get("", response_model=List[CompoundBrief])
def list_compounds(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Compound)
    if query:
        q = q.filter(
            (Compound.name.ilike(f"%{query}%")) |
            (Compound.biological_class.ilike(f"%{query}%")) |
            (Compound.pubchem_cid.ilike(f"%{query}%"))
        )
    comps = q.order_by(Compound.name.asc()).offset(skip).limit(limit).all()

    output = []
    if comps:
        comp_ids = [c.id for c in comps]
        counts_map = dict(
            db.query(Relationship.compound_id, func.count(Relationship.id))
            .filter(Relationship.compound_id.in_(comp_ids))
            .group_by(Relationship.compound_id)
            .all()
        )
        for c in comps:
            output.append(CompoundBrief(
                id=c.id,
                name=c.name,
                pubchem_cid=c.pubchem_cid,
                chembl_id=c.chembl_id,
                molecular_formula=c.molecular_formula,
                smiles=c.smiles,
                biological_class=c.biological_class,
                relationships_count=counts_map.get(c.id, 0)
            ))
    return output

@router.get("/{compound_id}", response_model=Dict[str, Any])
def get_compound_detail(
    compound_id: int,
    db: Session = Depends(get_db)
):
    comp = db.query(Compound).filter(Compound.id == compound_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail=f"Compound ID {compound_id} not found.")

    relationships = (
        db.query(Relationship)
        .options(
            joinedload(Relationship.plant),
            joinedload(Relationship.condition),
            joinedload(Relationship.document)
        )
        .filter(Relationship.compound_id == comp.id)
        .all()
    )

    plants_map = {}
    conditions_map = {}
    evidence_list = []

    for r in relationships:
        if r.plant:
            plants_map[r.plant.id] = {
                "id": r.plant.id,
                "scientific_name": r.plant.scientific_name,
                "common_names": r.plant.common_names
            }
        if r.condition:
            conditions_map[r.condition.id] = {
                "id": r.condition.id,
                "name": r.condition.name,
                "category": r.condition.category
            }
        evidence_list.append({
            "relationship_id": r.id,
            "plant_name": r.plant.scientific_name if r.plant else "Unknown",
            "condition_name": r.condition.name if r.condition else "Unknown",
            "evidence_tier": r.evidence_tier,
            "evidence_statement": r.evidence_statement,
            "tradition": r.knowledge_tradition,
            "confidence": r.extraction_confidence,
            "verification_status": r.verification_status,
            "document_title": r.document.title if r.document else None,
            "doi": r.document.doi if r.document else None
        })

    pubchem_url = f"https://pubchem.ncbi.nlm.nih.gov/compound/{comp.pubchem_cid}" if comp.pubchem_cid else None
    chembl_url = f"https://www.ebi.ac.uk/chembl/compound_report_card/{comp.chembl_id}/" if comp.chembl_id else None

    plants_list = list(plants_map.values())
    conditions_list = list(conditions_map.values())

    return {
        "id": comp.id,
        "name": comp.name,
        "pubchem_cid": comp.pubchem_cid,
        "chembl_id": comp.chembl_id,
        "molecular_formula": comp.molecular_formula,
        "smiles": comp.smiles,
        "biological_class": comp.biological_class,
        "pubchem_url": pubchem_url,
        "chembl_url": chembl_url,
        "relationships_count": len(relationships),
        "associated_plants": plants_list,
        "connected_plants": plants_list,
        "plants": plants_list,
        "associated_conditions": conditions_list,
        "conditions": conditions_list,
        "evidence_records": evidence_list,
        "evidence": evidence_list
    }

