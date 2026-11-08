from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    relationship_id = Column(Integer, ForeignKey("relationships.id"), nullable=False, index=True)
    previous_status = Column(String(50))
    new_status = Column(String(50))
    reviewer_name = Column(String(100), default="Curator")
    curator_notes = Column(Text, nullable=True)
    corrections_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    relationship = relationship("Relationship", back_populates="verification_logs")
