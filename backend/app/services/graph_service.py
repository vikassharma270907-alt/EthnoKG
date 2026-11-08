import networkx as nx
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from ..models.plant import Plant
from ..models.condition import Condition
from ..models.compound import Compound
from ..models.relationship import Relationship
from ..schemas.graph_assistant_dashboard import GraphResponse, CytoscapeElement

class GraphService:
    @staticmethod
    def build_networkx_graph(
        db: Session,
        plant_id: Optional[int] = None,
        condition_id: Optional[int] = None,
        evidence_tier: Optional[str] = None,
        tradition: Optional[str] = None,
        status_filter: Optional[str] = None,
        max_edges: int = 150
    ) -> nx.MultiDiGraph:
        G = nx.MultiDiGraph()

        # Query relationships
        q = db.query(Relationship)
        if plant_id:
            q = q.filter(Relationship.plant_id == plant_id)
        if condition_id:
            q = q.filter(Relationship.condition_id == condition_id)
        if evidence_tier:
            q = q.filter(Relationship.evidence_tier == evidence_tier)
        if tradition:
            q = q.filter(Relationship.knowledge_tradition == tradition)
        if status_filter:
            q = q.filter(Relationship.verification_status == status_filter)

        relationships = q.limit(max_edges).all()

        for r in relationships:
            plant = r.plant
            cond = r.condition
            comp = r.compound
            doc = r.document

            p_node_id = f"plant_{plant.id}"
            if not G.has_node(p_node_id):
                G.add_node(
                    p_node_id,
                    id=p_node_id,
                    label=plant.scientific_name,
                    type="Plant",
                    family=plant.family or "Unknown",
                    common_names=", ".join(plant.common_names[:3]),
                    db_id=plant.id
                )

            if cond:
                c_node_id = f"cond_{cond.id}"
                if not G.has_node(c_node_id):
                    G.add_node(
                        c_node_id,
                        id=c_node_id,
                        label=cond.name,
                        type="Condition",
                        category=cond.category or "General",
                        db_id=cond.id
                    )

                edge_id = f"rel_{r.id}"
                G.add_edge(
                    p_node_id,
                    c_node_id,
                    key=edge_id,
                    id=edge_id,
                    source=p_node_id,
                    target=c_node_id,
                    label=r.relation_type,
                    reported_use=r.reported_use,
                    evidence_tier=r.evidence_tier,
                    tradition=r.knowledge_tradition,
                    confidence=r.extraction_confidence,
                    verification_status=r.verification_status,
                    plant_part=r.plant_part,
                    preparation_method=r.preparation_method,
                    excerpt=r.supporting_excerpt,
                    document_title=doc.title if doc else "Scientific Paper",
                    document_year=doc.publication_year if doc else None,
                    doi=doc.doi if doc else None
                )

            if comp:
                comp_node_id = f"comp_{comp.id}"
                if not G.has_node(comp_node_id):
                    G.add_node(
                        comp_node_id,
                        id=comp_node_id,
                        label=comp.name,
                        type="Compound",
                        biological_class=comp.biological_class or "Phytochemical",
                        pubchem_cid=comp.pubchem_cid,
                        db_id=comp.id
                    )

                comp_edge_id = f"comp_edge_{r.id}"
                G.add_edge(
                    p_node_id,
                    comp_node_id,
                    key=comp_edge_id,
                    id=comp_edge_id,
                    source=p_node_id,
                    target=comp_node_id,
                    label="CONTAINS_COMPOUND",
                    evidence_tier=r.evidence_tier,
                    tradition=r.knowledge_tradition,
                    confidence=r.extraction_confidence,
                    verification_status=r.verification_status,
                    plant_part=r.plant_part,
                    preparation_method=r.preparation_method,
                    excerpt=r.supporting_excerpt,
                    document_title=doc.title if doc else "Phytochemical Study",
                    document_year=doc.publication_year if doc else None,
                    doi=doc.doi if doc else None
                )

        return G

    @classmethod
    def get_cytoscape_graph(
        cls,
        db: Session,
        plant_id: Optional[int] = None,
        condition_id: Optional[int] = None,
        evidence_tier: Optional[str] = None,
        tradition: Optional[str] = None,
        status_filter: Optional[str] = None,
        max_edges: int = 150
    ) -> GraphResponse:
        G = cls.build_networkx_graph(
            db=db,
            plant_id=plant_id,
            condition_id=condition_id,
            evidence_tier=evidence_tier,
            tradition=tradition,
            status_filter=status_filter,
            max_edges=max_edges
        )

        nodes_list: List[CytoscapeElement] = []
        for node_id, data in G.nodes(data=True):
            degree = G.degree(node_id)
            node_payload = dict(data)
            node_payload["degree"] = degree
            nodes_list.append(CytoscapeElement(data=node_payload))

        edges_list: List[CytoscapeElement] = []
        for u, v, k, data in G.edges(data=True, keys=True):
            edges_list.append(CytoscapeElement(data=data))

        meta = {
            "total_nodes": len(nodes_list),
            "total_edges": len(edges_list),
            "filter_plant_id": plant_id,
            "filter_condition_id": condition_id,
            "filter_evidence_tier": evidence_tier,
            "filter_tradition": tradition
        }

        return GraphResponse(nodes=nodes_list, edges=edges_list, meta=meta)

