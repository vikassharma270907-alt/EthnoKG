from typing import Optional
from pydantic import BaseModel, ConfigDict

class ConditionBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    category: str
    icd11_code: Optional[str] = None
    umls_cui: Optional[str] = None
    description: Optional[str] = None
    relationships_count: Optional[int] = 0

class CompoundBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    pubchem_cid: Optional[str] = None
    chembl_id: Optional[str] = None
    molecular_formula: Optional[str] = None
    smiles: Optional[str] = None
    biological_class: str
    relationships_count: Optional[int] = 0
