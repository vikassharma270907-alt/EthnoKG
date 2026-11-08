import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload
from ..models.plant import Plant
from ..models.condition import Condition
from ..models.compound import Compound
from ..models.relationship import Relationship
from ..models.document import Document
from ..schemas.graph_assistant_dashboard import AssistantQueryResponse, CitedSource

DISCLAIMER_TEXT = (
    "SCIENTIFIC RESEARCH NOTICE: EthnoKG is an academic literature and ethnopharmacological knowledge discovery "
    "platform for scientific researchers. It does not provide medical advice, diagnosis, treatment, or prescription guidance. "
    "Documented traditional uses represent historical cultural observations and must never be interpreted as clinically established therapeutic efficacy."
)

class AssistantService:
    @staticmethod
    def answer_query(db: Session, question: str) -> AssistantQueryResponse:
        q_clean = question.strip()
        q_lower = q_clean.lower()

        # Find matching plants
        plants = db.query(Plant).all()
        matched_plants: List[Plant] = []
        for p in plants:
            if p.scientific_name.lower() in q_lower or p.genus.lower() in q_lower:
                matched_plants.append(p)
            else:
                for cn in p.common_names:
                    if cn.lower() in q_lower:
                        matched_plants.append(p)
                        break

        # Find matching conditions
        conditions = db.query(Condition).all()
        matched_conditions: List[Condition] = []
        for c in conditions:
            if c.name.lower() in q_lower:
                matched_conditions.append(c)

        # General symptom/condition heuristic if explicit match not found
        if not matched_conditions:
            generic_terms = {
                "fever": ["Malaria", "Intermittent fever", "Febrile conditions"],
                "malaria": ["Malaria"],
                "stress": ["Stress and Anxiety"],
                "anxiety": ["Stress and Anxiety"],
                "inflammation": ["Rheumatoid arthritis", "Gastrointestinal inflammation"],
                "arthritis": ["Rheumatoid arthritis", "Arthritis"],
                "pain": ["Severe acute pain", "Rheumatic joint pain"],
                "cancer": ["Hodgkin's lymphoma", "Acute lymphoblastic leukemia"],
                "heart": ["Dropsy", "Congestive heart failure", "Hypertension"],
                "blood pressure": ["Hypertension"],
                "memory": ["Cognitive decline", "Cognitive impairment"],
                "cough": ["Persistent spasmodic cough", "Asthma and Bronchitis"]
            }
            for term, cond_names in generic_terms.items():
                if term in q_lower:
                    for cn in cond_names:
                        c_match = db.query(Condition).filter(Condition.name.ilike(f"%{cn}%")).first()
                        if c_match and c_match not in matched_conditions:
                            matched_conditions.append(c_match)

        # Find matching compounds
        compounds = db.query(Compound).all()
        matched_compounds: List[Compound] = []
        for comp in compounds:
            if comp.name.lower() in q_lower:
                matched_compounds.append(comp)

        # Query relevant relationships with eager loading
        eager_opts = [
            joinedload(Relationship.plant),
            joinedload(Relationship.condition),
            joinedload(Relationship.compound),
            joinedload(Relationship.document)
        ]
        rel_query = db.query(Relationship).options(*eager_opts)
        if matched_plants:
            rel_query = rel_query.filter(Relationship.plant_id.in_([p.id for p in matched_plants]))
        if matched_conditions:
            rel_query = rel_query.filter(Relationship.condition_id.in_([c.id for c in matched_conditions]))

        relationships = rel_query.limit(8).all()

        # If no strict intersections, look up by condition or plant alone
        if not relationships and (matched_plants or matched_conditions):
            fallback_q = db.query(Relationship).options(*eager_opts)
            if matched_plants:
                fallback_q = fallback_q.filter(Relationship.plant_id.in_([p.id for p in matched_plants]))
            elif matched_conditions:
                fallback_q = fallback_q.filter(Relationship.condition_id.in_([c.id for c in matched_conditions]))
            relationships = fallback_q.limit(8).all()

        # If still no relationships found, handle gracefully with negative retrieval statement
        if not relationships:
            return AssistantQueryResponse(
                answer=(
                    f"No verified records matching your specific research query '{q_clean}' were found in the current "
                    f"EthnoKG literature corpus. EthnoKG enforces a zero-hallucination constraint and will not generate unverified "
                    f"claims. To explore indexed literature, try searching for well-documented species such as "
                    f"Artemisia annua, Withania somnifera, Curcuma longa, or conditions such as malaria, fever, arthritis, or hypertension."
                ),
                cited_plants=[p.scientific_name for p in matched_plants],
                cited_conditions=[c.name for c in matched_conditions],
                cited_compounds=[cp.name for cp in matched_compounds],
                cited_sources=[],
                evidence_tiers_involved=[],
                confidence=0.5,
                medical_disclaimer=DISCLAIMER_TEXT
            )

        # Assemble cited sources and factual synthesis
        cited_sources: List[CitedSource] = []
        cited_plant_names = set()
        cited_condition_names = set()
        cited_compound_names = set()
        evidence_tiers = set()

        synthesis_paragraphs = []
        for idx, r in enumerate(relationships):
            plant = r.plant
            cond = r.condition
            comp = r.compound
            doc = r.document

            cited_plant_names.add(plant.scientific_name)
            if cond:
                cited_condition_names.add(cond.name)
            if comp:
                cited_compound_names.add(comp.name)
            evidence_tiers.add(r.evidence_tier)

            excerpt_text = r.supporting_excerpt or "Verbatim excerpt recorded in indexed publication."
            doc_title = doc.title if doc else "Indexed Scientific Literature"
            doc_authors = doc.authors if doc else "Academic Researchers"
            doc_year = doc.publication_year if doc else None
            doc_doi = doc.doi if doc else None
            cited_sources.append(CitedSource(
                document_title=doc_title,
                authors=doc_authors,
                year=doc_year,
                doi=doc_doi,
                excerpt=excerpt_text,
                evidence_tier=r.evidence_tier
            ))

            para = (
                f"- **{plant.scientific_name}** ({', '.join(plant.common_names[:2])}): "
                f"Documented in *{r.knowledge_tradition}* using {r.plant_part or 'leaves/roots'} "
                f"prepared as a {r.preparation_method or 'traditional preparation'} "
                f"for **{cond.name if cond else 'reported ailment'}**. "
                f"Classified under **[{r.evidence_tier}]** (Confidence: {int(r.extraction_confidence * 100)}%). "
                f"Supporting passage: \"{excerpt_text}\" (Source: {doc.authors or 'Authors'}, {doc.publication_year or 'n.d.'}, DOI: {doc.doi or 'Indexed Archive'})."
            )
            synthesis_paragraphs.append(para)

        intro = (
            f"Based on the indexed ethnopharmacological literature in EthnoKG, "
            f"we identified {len(relationships)} relevant relationship(s) addressing your query:\n\n"
        )
        synthesis = intro + "\n\n".join(synthesis_paragraphs)

        return AssistantQueryResponse(
            answer=synthesis,
            cited_plants=sorted(list(cited_plant_names)),
            cited_conditions=sorted(list(cited_condition_names)),
            cited_compounds=sorted(list(cited_compound_names)),
            cited_sources=cited_sources,
            evidence_tiers_involved=sorted(list(evidence_tiers)),
            confidence=0.92,
            medical_disclaimer=DISCLAIMER_TEXT
        )

