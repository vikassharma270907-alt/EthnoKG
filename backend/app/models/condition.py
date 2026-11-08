from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from ..core.database import Base

class Condition(Base):
    __tablename__ = "conditions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    icd11_code = Column(String(50), nullable=True)
    umls_cui = Column(String(50), nullable=True)
    category = Column(String(100), index=True, default="General")
    description = Column(Text, nullable=True)

    relationships = relationship("Relationship", back_populates="condition")

