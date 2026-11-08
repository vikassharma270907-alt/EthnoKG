from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
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
    for c in comps:
        rel_count = db.query(Relationship).filter(Relationship.compound_id == c.id).count()
        output.append(CompoundBrief(
            id=c.id,
            name=c.name,
            pubchem_cid=c.pubchem_cid,
            chembl_id=c.chembl_id,
            molecular_formula=c.molecular_formula,
            smiles=c.smiles,
            biological_class=c.biological_class,
            relationships_count=rel_count
        ))
    return output

