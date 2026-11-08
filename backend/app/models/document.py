from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from ..core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), index=True, nullable=False)
    authors = Column(String(500), nullable=True)
    publication_year = Column(Integer, index=True, nullable=True)
    journal = Column(String(255), nullable=True)
    doi = Column(String(255), index=True, nullable=True)
    source_url = Column(String(500), nullable=True)
    license = Column(String(100), default="Open Access")
    document_type = Column(String(100), default="Research Article")
    raw_text = Column(Text, nullable=False)
    char_count = Column(Integer, default=0)
    ingested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    relationships = relationship("Relationship", back_populates="document", cascade="all, delete-orphan")
