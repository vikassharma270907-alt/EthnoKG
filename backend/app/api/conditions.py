from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.condition import Condition
from ..models.relationship import Relationship
from ..schemas.condition_compound import ConditionBrief

router = APIRouter(prefix="/conditions", tags=["Conditions"])

@router.get("", response_model=List[ConditionBrief])
def list_conditions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    query: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Condition)
    if query:
        q = q.filter(
            (Condition.name.ilike(f"%{query}%")) |
            (Condition.category.ilike(f"%{query}%"))
        )
    if category:
        q = q.filter(Condition.category.ilike(f"%{category}%"))

    conds = q.order_by(Condition.name.asc()).offset(skip).limit(limit).all()

    output = []
    if conds:
        cond_ids = [c.id for c in conds]
        counts_map = dict(
            db.query(Relationship.condition_id, func.count(Relationship.id))
            .filter(Relationship.condition_id.in_(cond_ids))
            .group_by(Relationship.condition_id)
            .all()
        )
        for c in conds:
            output.append(ConditionBrief(
                id=c.id,
                name=c.name,
                category=c.category,
                icd11_code=c.icd11_code,
                umls_cui=c.umls_cui,
                description=c.description,
                relationships_count=counts_map.get(c.id, 0)
            ))
    return output

