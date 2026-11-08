import json
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session, joinedload
from ..models.relationship import Relationship
from ..models.verification import VerificationLog
from ..models.plant import Plant
from ..models.condition import Condition
from ..models.compound import Compound
from ..schemas.relationship import RelationshipUpdate

class VerificationService:
    @staticmethod
    def approve_relationship(
        db: Session, 
        relationship_id: int, 
        reviewer_name: str = "Curator", 
        notes: Optional[str] = None
    ) -> Relationship:
        rel = (
            db.query(Relationship)
            .options(
                joinedload(Relationship.plant),
                joinedload(Relationship.condition),
                joinedload(Relationship.compound),
                joinedload(Relationship.document)
            )
            .filter(Relationship.id == relationship_id)
            .first()
        )
        if not rel:
            raise ValueError(f"Relationship ID {relationship_id} not found.")

        prev_status = rel.verification_status
        rel.verification_status = "approved"

        log = VerificationLog(
            relationship_id=rel.id,
            previous_status=prev_status,
            new_status="approved",
            reviewer_name=reviewer_name,
            curator_notes=notes or "Approved upon scientific source review.",
            corrections_json=None
        )
        db.add(log)
        db.commit()
        db.refresh(rel)
        return rel

    @staticmethod
    def reject_relationship(
        db: Session, 
        relationship_id: int, 
        reviewer_name: str = "Curator", 
        reason: Optional[str] = None
    ) -> Relationship:
        rel = (
            db.query(Relationship)
            .options(
                joinedload(Relationship.plant),
                joinedload(Relationship.condition),
                joinedload(Relationship.compound),
                joinedload(Relationship.document)
            )
            .filter(Relationship.id == relationship_id)
            .first()
        )
        if not rel:
            raise ValueError(f"Relationship ID {relationship_id} not found.")

        prev_status = rel.verification_status
        rel.verification_status = "rejected"

        log = VerificationLog(
            relationship_id=rel.id,
            previous_status=prev_status,
            new_status="rejected",
            reviewer_name=reviewer_name,
            curator_notes=reason or "Rejected due to extraction inaccuracy or insufficient text evidence.",
            corrections_json=None
        )
        db.add(log)
        db.commit()
        db.refresh(rel)
        return rel

    @staticmethod
    def update_relationship(
        db: Session,
        relationship_id: int,
        update_data: RelationshipUpdate
    ) -> Relationship:
        rel = (
            db.query(Relationship)
            .options(
                joinedload(Relationship.plant),
                joinedload(Relationship.condition),
                joinedload(Relationship.compound),
                joinedload(Relationship.document)
            )
            .filter(Relationship.id == relationship_id)
            .first()
        )
        if not rel:
            raise ValueError(f"Relationship ID {relationship_id} not found.")

        changes = {}

        if update_data.plant_name and (not rel.plant or update_data.plant_name != rel.plant.scientific_name):
            plant = db.query(Plant).filter(Plant.scientific_name == update_data.plant_name).first()
            if plant:
                changes["plant_id"] = {"old": rel.plant_id, "new": plant.id}
                rel.plant_id = plant.id

        if update_data.condition_name and (not rel.condition or update_data.condition_name != rel.condition.name):
            cond = db.query(Condition).filter(Condition.name == update_data.condition_name).first()
            if not cond:
                cond = Condition(name=update_data.condition_name)
                db.add(cond)
                db.commit()
                db.refresh(cond)
            changes["condition_id"] = {"old": rel.condition_id, "new": cond.id}
            rel.condition_id = cond.id

        if update_data.plant_part and update_data.plant_part != rel.plant_part:
            changes["plant_part"] = {"old": rel.plant_part, "new": update_data.plant_part}
            rel.plant_part = update_data.plant_part

        if update_data.preparation_method and update_data.preparation_method != rel.preparation_method:
            changes["preparation_method"] = {"old": rel.preparation_method, "new": update_data.preparation_method}
            rel.preparation_method = update_data.preparation_method

        if update_data.evidence_tier and update_data.evidence_tier != rel.evidence_tier:
            changes["evidence_tier"] = {"old": rel.evidence_tier, "new": update_data.evidence_tier}
            rel.evidence_tier = update_data.evidence_tier

        if update_data.evidence_statement and update_data.evidence_statement != rel.evidence_statement:
            changes["evidence_statement"] = {"old": rel.evidence_statement, "new": update_data.evidence_statement}
            rel.evidence_statement = update_data.evidence_statement

        prev_status = rel.verification_status
        rel.verification_status = "approved"

        log = VerificationLog(
            relationship_id=rel.id,
            previous_status=prev_status,
            new_status="approved",
            reviewer_name=update_data.reviewer_name or "Curator",
            curator_notes=update_data.curator_notes or "Curator corrected entity mappings and approved.",
            corrections_json=json.dumps(changes) if changes else None
        )
        db.add(log)
        db.commit()
        db.refresh(rel)
        return rel

    @staticmethod
    def get_verification_history(db: Session, relationship_id: int) -> List[VerificationLog]:
        return db.query(VerificationLog).filter(VerificationLog.relationship_id == relationship_id).order_by(VerificationLog.created_at.desc()).all()

    @staticmethod
    def get_all_verification_history(db: Session, limit: int = 50) -> List[VerificationLog]:
        return db.query(VerificationLog).order_by(VerificationLog.created_at.desc()).limit(limit).all()
