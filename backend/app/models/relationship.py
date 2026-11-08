from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False, index=True)
    condition_id = Column(Integer, ForeignKey("conditions.id"), nullable=True, index=True)
    compound_id = Column(Integer, ForeignKey("compounds.id"), nullable=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)

    relation_type = Column(String(100), default="REPORTED_USE_FOR") # REPORTED_USE_FOR, CONTAINS_COMPOUND, HAS_ACTIVITY
    reported_use = Column(String(500), nullable=True)
    plant_part = Column(String(100), nullable=True) # Leaf, Root, Bark, Aerial parts, Rhizome, etc.
    preparation_method = Column(String(255), nullable=True) # Decoction, Infusion, Poultice, Maceration, Powder
    pharmacological_activity = Column(String(255), nullable=True) # Antiplasmodial, Anti-inflammatory, Adaptogenic, etc.
    geographic_context = Column(String(255), nullable=True) # Region / Country
    knowledge_tradition = Column(String(100), default="Traditional Medicine") # Ayurveda, TCM, African Folk, etc.
    evidence_tier = Column(String(100), default="Traditional Use Report") # One of 6 tiers
    evidence_statement = Column(Text, nullable=True)
    supporting_excerpt = Column(Text, nullable=True)
    page_or_section = Column(String(255), nullable=True)
    extraction_confidence = Column(Float, default=0.85)
    verification_status = Column(String(50), default="pending") # pending, approved, rejected

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    plant = relationship("Plant", back_populates="relationships")
    condition = relationship("Condition", back_populates="relationships")
    compound = relationship("Compound", back_populates="relationships")
    document = relationship("Document", back_populates="relationships")
    verification_logs = relationship("VerificationLog", back_populates="relationship", cascade="all, delete-orphan")
