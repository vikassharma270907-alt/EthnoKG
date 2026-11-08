from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class GraphNodeData(BaseModel):
    id: str
    label: str
    type: str # Plant, Condition, Compound, Tradition, Document
    subType: Optional[str] = None
    degree: int = 1
    family: Optional[str] = None
    category: Optional[str] = None
    pubchem_cid: Optional[str] = None
    evidence_count: int = 1

class GraphEdgeData(BaseModel):
    id: str
    source: str
    target: str
    label: str
    evidence_tier: str
    tradition: Optional[str] = None
    confidence: float
    verification_status: str
    plant_part: Optional[str] = None
    preparation_method: Optional[str] = None
    excerpt: Optional[str] = None
    document_title: Optional[str] = None
    document_year: Optional[int] = None

class CytoscapeElement(BaseModel):
    data: Dict[str, Any]

class GraphResponse(BaseModel):
    nodes: List[CytoscapeElement]
    edges: List[CytoscapeElement]
    meta: Dict[str, Any]

class AssistantQueryRequest(BaseModel):
    question: str

class CitedSource(BaseModel):
    document_title: str
    authors: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    excerpt: str
    evidence_tier: str

class AssistantQueryResponse(BaseModel):
    answer: str
    cited_plants: List[str]
    cited_conditions: List[str]
    cited_compounds: List[str]
    cited_sources: List[CitedSource]
    evidence_tiers_involved: List[str]
    confidence: float
    medical_disclaimer: str

class DashboardStatsResponse(BaseModel):
    total_plants: int
    total_relationships: int
    total_compounds: int
    indexed_publications: int
    verified_relationships: int
    pending_verifications: int
    rejected_verifications: int
    avg_extraction_confidence: float
    evidence_distribution: Dict[str, int]
    confidence_distribution: Dict[str, int]
    traditions_distribution: Dict[str, int]
    recent_documents: List[Dict[str, Any]]

