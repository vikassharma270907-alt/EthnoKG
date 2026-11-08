from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractionRecord(BaseModel):
    plant_name: str
    scientific_name: str
    plant_synonyms: List[str] = Field(default_factory=list)
    reported_use: str
    medical_condition: str
    plant_part: str
    preparation_method: str
    bioactive_compounds: List[str] = Field(default_factory=list)
    pharmacological_activity: str
    geographic_context: str
    knowledge_tradition: str
    evidence_category: str
    evidence_statement: str
    source_document: str
    source_url: str = ""
    publication_year: Optional[int] = None
    page_or_section: str = ""
    supporting_excerpt: str
    extraction_confidence: float = 0.0
    verification_status: str = "pending"

class ExtractionRunRequest(BaseModel):
    document_id: Optional[int] = None
    text_override: Optional[str] = None
    engine: Optional[str] = "hybrid" # hybrid, rule_based, llm

class ExtractionRunResponse(BaseModel):
    extracted_count: int
    document_id: Optional[int] = None
    document_title: Optional[str] = None
    results: List[ExtractionRecord]
