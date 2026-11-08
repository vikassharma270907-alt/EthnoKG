from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class RelationshipDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    plant_id: int
    plant_scientific_name: str
    condition_id: Optional[int] = None
    condition_name: Optional[str] = None
    compound_id: Optional[int] = None
    compound_name: Optional[str] = None
    document_id: int
    document_title: str
    document_doi: Optional[str] = None
    document_year: Optional[int] = None
    relation_type: str
    reported_use: Optional[str] = None
    plant_part: Optional[str] = None
    preparation_method: Optional[str] = None
    pharmacological_activity: Optional[str] = None
    geographic_context: Optional[str] = None
    knowledge_tradition: str
    evidence_tier: str
    evidence_statement: Optional[str] = None
    supporting_excerpt: Optional[str] = None
    page_or_section: Optional[str] = None
    extraction_confidence: float
    verification_status: str
    created_at: datetime
    updated_at: datetime

class RelationshipUpdate(BaseModel):
    plant_name: Optional[str] = None
    condition_name: Optional[str] = None
    compound_name: Optional[str] = None
    reported_use: Optional[str] = None
    plant_part: Optional[str] = None
    preparation_method: Optional[str] = None
    pharmacological_activity: Optional[str] = None
    geographic_context: Optional[str] = None
    knowledge_tradition: Optional[str] = None
    evidence_tier: Optional[str] = None
    evidence_statement: Optional[str] = None
    reviewer_name: Optional[str] = "Curator"
    curator_notes: Optional[str] = None

class VerificationActionRequest(BaseModel):
    reviewer_name: str = "Expert Curator"
    notes: Optional[str] = None
    reason: Optional[str] = None
