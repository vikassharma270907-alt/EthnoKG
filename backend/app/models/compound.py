from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..core.database import Base

class Compound(Base):
    __tablename__ = "compounds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    pubchem_cid = Column(String(50), nullable=True)
    chembl_id = Column(String(50), nullable=True)
    molecular_formula = Column(String(100), nullable=True)
    smiles = Column(String(255), nullable=True)
    biological_class = Column(String(100), default="Phytochemical")

    relationships = relationship("Relationship", back_populates="compound")

