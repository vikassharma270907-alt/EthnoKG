from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..services.assistant_service import AssistantService
from ..schemas.graph_assistant_dashboard import AssistantQueryRequest, AssistantQueryResponse

router = APIRouter(prefix="/assistant", tags=["AI Research Assistant"])

@router.post("/query", response_model=AssistantQueryResponse)
def query_research_assistant(
    req: AssistantQueryRequest,
    db: Session = Depends(get_db)
):
    return AssistantService.answer_query(db=db, question=req.question)
