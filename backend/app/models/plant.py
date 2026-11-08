import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    scientific_name = Column(String(255), unique=True, index=True, nullable=False)
    family = Column(String(100), index=True, nullable=True)
    genus = Column(String(100), index=True, nullable=True)
    species = Column(String(100), nullable=True)
    authority = Column(String(100), nullable=True)
    common_names_json = Column(Text, default="[]")  # JSON list
    taxonomic_status = Column(String(50), default="Accepted")
    mpns_id = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    synonyms = relationship("PlantSynonym", back_populates="plant", cascade="all, delete-orphan")
    relationships = relationship("Relationship", back_populates="plant")

    @property
    def common_names(self):
        try:
            return json.loads(self.common_names_json) if self.common_names_json else []
        except Exception:
            return []

    @common_names.setter
    def common_names(self, val):
        self.common_names_json = json.dumps(val if isinstance(val, list) else [val])

class PlantSynonym(Base):
    __tablename__ = "plant_synonyms"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, index=True)
    synonym_name = Column(String(255), index=True, nullable=False)
    synonym_type = Column(String(50), default="botanical_synonym")  # botanical, vernacular_ayurveda, vernacular_tcm, etc.
    taxonomic_source = Column(String(100), default="Kew MPNS")

    plant = relationship("Plant", back_populates="synonyms")
