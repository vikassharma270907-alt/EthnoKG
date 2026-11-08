from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class DocumentCreate(BaseModel):
    title: str
    authors: Optional[str] = None
    publication_year: Optional[int] = None
    journal: Optional[str] = None
    doi: Optional[str] = None
    source_url: Optional[str] = None
    license: Optional[str] = "Open Access"
    document_type: Optional[str] = "Research Article"
    raw_text: str

class DocumentBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    authors: Optional[str] = None
    publication_year: Optional[int] = None
    journal: Optional[str] = None
    doi: Optional[str] = None
    source_url: Optional[str] = None
    license: str
    document_type: str
    char_count: int
    relationships_count: Optional[int] = 0
    ingested_at: datetime

class DocumentDetail(DocumentBrief):
    raw_text: str
