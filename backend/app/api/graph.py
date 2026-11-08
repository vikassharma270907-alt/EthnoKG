from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..services.graph_service import GraphService
from ..schemas.graph_assistant_dashboard import GraphResponse

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])

@router.get("", response_model=GraphResponse)
def get_graph(
    plant_id: Optional[int] = None,
    condition_id: Optional[int] = None,
    evidence_tier: Optional[str] = None,
    tradition: Optional[str] = None,
    status_filter: Optional[str] = None,
    max_edges: int = Query(120, ge=10, le=400),
    db: Session = Depends(get_db)
):
    return GraphService.get_cytoscape_graph(
        db=db,
        plant_id=plant_id,
        condition_id=condition_id,
        evidence_tier=evidence_tier,
        tradition=tradition,
        status_filter=status_filter,
        max_edges=max_edges
    )

@router.get("/entity/{entity_id}", response_model=GraphResponse)
def get_entity_subgraph(
    entity_id: str,
    db: Session = Depends(get_db)
):
    # Parses plant_1, cond_2, etc.
    plant_id = None
    cond_id = None
    if entity_id.startswith("plant_"):
        plant_id = int(entity_id.split("_")[1])
    elif entity_id.startswith("cond_"):
        cond_id = int(entity_id.split("_")[1])

    return GraphService.get_cytoscape_graph(
        db=db,
        plant_id=plant_id,
        condition_id=cond_id,
        max_edges=60
    )

