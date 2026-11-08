from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..services.document_service import DocumentService
from ..schemas.document import DocumentCreate, DocumentBrief, DocumentDetail
from ..models.relationship import Relationship

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentDetail)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    authors: Optional[str] = Form(None),
    publication_year: Optional[int] = Form(None),
    journal: Optional[str] = Form(None),
    doi: Optional[str] = Form(None),
    license: Optional[str] = Form("Open Access"),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    filename = file.filename or "uploaded_document"
    doc_title = title if title else filename

    if filename.lower().endswith(".pdf"):
        raw_text = DocumentService.extract_text_from_pdf_bytes(contents)
    else:
        try:
            raw_text = contents.decode("utf-8")
        except UnicodeDecodeError:
            raw_text = contents.decode("latin-1", errors="ignore")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Document contains no readable text.")

    doc_in = DocumentCreate(
        title=doc_title,
        authors=authors,
        publication_year=publication_year,
        journal=journal,
        doi=doi,
        license=license,
        raw_text=raw_text
    )
    doc = DocumentService.create_document(db, doc_in)
    
    # Calculate relationships count
    doc_dict = {c.name: getattr(doc, c.name) for c in doc.__table__.columns}
    doc_dict["relationships_count"] = 0
    return DocumentDetail(**doc_dict)

@router.post("/ingest", response_model=DocumentDetail)
def ingest_text_document(
    doc_in: DocumentCreate,
    db: Session = Depends(get_db)
):
    if not doc_in.raw_text.strip():
        raise HTTPException(status_code=400, detail="raw_text cannot be empty.")
    doc = DocumentService.create_document(db, doc_in)
    doc_dict = {c.name: getattr(doc, c.name) for c in doc.__table__.columns}
    doc_dict["relationships_count"] = 0
    return DocumentDetail(**doc_dict)

@router.get("", response_model=List[DocumentBrief])
def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    docs, _ = DocumentService.list_documents(db, skip=skip, limit=limit, query=query)
    results = []
    if docs:
        doc_ids = [d.id for d in docs]
        counts_map = dict(
            db.query(Relationship.document_id, func.count(Relationship.id))
            .filter(Relationship.document_id.in_(doc_ids))
            .group_by(Relationship.document_id)
            .all()
        )
        for d in docs:
            d_dict = {c.name: getattr(d, c.name) for c in d.__table__.columns}
            d_dict["relationships_count"] = counts_map.get(d.id, 0)
            results.append(DocumentBrief(**d_dict))
    return results

@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    doc = DocumentService.get_document(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found.")
    d_dict = {c.name: getattr(doc, c.name) for c in doc.__table__.columns}
    d_dict["relationships_count"] = db.query(Relationship).filter(Relationship.document_id == doc.id).count()
    return DocumentDetail(**d_dict)

