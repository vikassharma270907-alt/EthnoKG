from fastapi import APIRouter, Depends, HTTPException, status
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
    if not req.question or not req.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query question cannot be blank or whitespace-only."
        )
    return AssistantService.answer_query(db=db, question=req.question)

