from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class SynonymBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    synonym_name: str
    synonym_type: str
    taxonomic_source: str

class PlantBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    scientific_name: str
    family: Optional[str] = None
    genus: Optional[str] = None
    species: Optional[str] = None
    authority: Optional[str] = None
    common_names: List[str] = []
    taxonomic_status: str
    relationships_count: Optional[int] = 0

class PlantDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    scientific_name: str
    family: Optional[str] = None
    genus: Optional[str] = None
    species: Optional[str] = None
    authority: Optional[str] = None
    common_names: List[str] = []
    taxonomic_status: str
    mpns_id: Optional[str] = None
    description: Optional[str] = None
    synonyms: List[SynonymBrief] = []
    created_at: datetime
