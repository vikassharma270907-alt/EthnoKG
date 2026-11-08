# EthnoKG: Turning Traditional Knowledge into Traceable Scientific Evidence
## Project Blueprint — EthnoHack 2026

**Category:** Ethnopharmacology / Artificial Intelligence / Biomedical NLP / Knowledge Graphs  
**Primary Track:** Traditional Knowledge Mining  
**Secondary Track:** Natural Products & Drug Discovery  

---

### 1. Executive Summary & Vision

For millennia, indigenous and local communities worldwide have accumulated vast empirical knowledge of medicinal plants, preparations, and health applications. Today, this traditional medicine knowledge remains fragmented across ancient treatises, historical botanical surveys, ethnobotanical field interviews, and modern scientific literature. 

Researchers in natural products, pharmacology, and global health face fundamental obstacles:
1. **Unstructured & Buried Data:** Critical ethnomedical claims are locked in non-standardized text formats and narrative literature.
2. **Taxonomic Ambiguity:** Plants are cited under vernacular names, historical synonyms, or misspelled binomials across cultural traditions.
3. **Evidence Conflation:** Folkloric accounts, in-vitro bioassays, animal models, and clinical trials are frequently mixed without distinction.
4. **Lack of Provenance & Traceability:** Citations are lost or misattributed, making it difficult to trace a claim back to the original botanical specimen, cultural community, or research paper.

**EthnoKG** solves these challenges through an open, transparent, and reproducible computational pipeline. It transforms unstructured ethnobotanical text into a standardized, evidence-linked Knowledge Graph where every entity, relationship, and bioactivity claim is bound directly to its supporting excerpt, taxonomic authority, and publication source.

> **CRITICAL SCIENTIFIC PRINCIPLE:**  
> EthnoKG is an objective **scientific literature-mining and knowledge-discovery platform**. It is **NOT** a clinical diagnosis system, treatment recommender, or prescription generator. Traditional use records are preserved as empirical historical observations and are never conflated with established clinical efficacy.

---

### 2. User Personas & Real-World Use Cases

| Persona | Role / Domain | Core Need in EthnoKG | Key Workflow |
| :--- | :--- | :--- | :--- |
| **Dr. Elena Rostova** | Ethnopharmacologist & Phytochemist | Identify plant candidates for malaria & antipyretic assays with strong ethnobotanical backing. | Queries antipyretic conditions, examines plant parts/preparations, reviews in-vitro bioassay evidence, exports candidates. |
| **Prof. Kenji Takahashi** | Natural Product Medicinal Chemist | Discover novel bioactive scaffolds isolated from traditional medicinal plants. | Explores Plant-Compound-Target graph links, checks ChEMBL/PubChem IDs, filters by evidence category. |
| **Dr. Priya Nair** | Biodiversity & Conservation Analyst | Assess conservation vulnerability and geographic distribution of over-harvested medicinal species. | Tracks geographic context, checks endangered species references (GBIF/IUCN), verifies botanical identity. |
| **Marcus Vance** | Biomedical Curator / Literature Reviewer | Validate AI-extracted ethnobotanical claims against source publications. | Uses the Human Verification Workspace to approve/reject relations, correct botanical binomials, and append curator notes. |

---

### 3. Core Product Modules (Hackathon Scope)

#### Module A: Research Discovery Dashboard
- Real-time quantitative overview calculated directly from database records.
- Metrics: Total Plants, Medicinal Use Relationships, Identified Bioactive Compounds, Indexed Publications, Verified Relations Count.
- Interactive charts: Evidence Category Distribution, Model Confidence Distribution, Knowledge Traditions Breakdown.
- Live feed of recently ingested documents and extraction logs.

#### Module B: AI Literature Mining Engine
- Multi-channel ingestion: File upload (PDF/TXT), PubMed/Open-Access URL submission, direct text input, or pre-indexed literature selector.
- 12-stage extraction pipeline:
  `Ingestion` → `Text Cleaning & Normalization` → `Paragraph Segmentation` → `Biomedical Entity Recognition` → `Botanical Taxon Resolution` → `Medical Condition Mapping` → `Relationship Extraction` → `Evidence Tier Classification` → `Calibrated Confidence Scoring` → `Provenance Linking` → `Human Verification Staging` → `Knowledge Graph Insertion`.
- Strict structured output validation adhering to the EthnoKG Unified Schema.

#### Module C: Plant Intelligence Explorer
- High-performance search, filtering (by tradition, plant part, condition, evidence tier), and sorting.
- Comprehensive species profile: Binomial, common vernacular names, taxonomic synonyms (MPNS/WFO standards), parts used, preparation forms, reported compounds, and supporting publications.

#### Module D: Interactive Knowledge Graph
- Dynamic multi-entity graph explorer powered by Cytoscape.js.
- Node types: `Plant`, `Condition`, `Compound`, `Publication`, `Region`, `Tradition`, `Preparation`.
- Edge types: `REPORTED_USE_FOR`, `CONTAINS_COMPOUND`, `HAS_ACTIVITY`, `MENTIONED_IN`, `OBSERVED_IN`, `USES_PLANT_PART`.
- Graph features: Degree-based sizing, category coloring, node expansion/collapsing, edge provenance sidebar, zoom/pan/focus controls.

#### Module E: Evidence Explorer & Provenance Inspector
- 6-tier evidence taxonomy:
  1. *Traditional Use Report*
  2. *Ethnobotanical Field Observation*
  3. *In-Vitro Experimental Bioassay*
  4. *In-Vivo Preclinical Model*
  5. *Clinical Human Trial*
  6. *In-Silico / Computational Prediction*
- Direct side-by-side inspection of the original text passage and publication metadata.

#### Module F: AI Research Assistant (Grounded RAG)
- Conversational research query engine with strict retrieval grounding.
- Answers complex ethnopharmacological questions with exact bibliographic citations.
- Explicit uncertainty communication and negative constraints (never hallucinates medical advice or unsupported claims).

#### Module G: Human-in-the-Loop Verification Workspace
- Scientific curator interface: review pending extractions, inspect highlighted source text, approve, edit, or reject claims.
- Audit trail logging reviewer decisions, timestamps, and confidence adjustments.

---

### 4. Technical Architecture Summary

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Cytoscape.js, Recharts.
- **Backend:** Python 3.14+, FastAPI, SQLAlchemy, Pydantic v2, NetworkX.
- **Data Persistence:** SQLite database (`ethno_kg.db`) with normalized relational schema + in-memory NetworkX graph representation for sub-graph queries.
- **NLP / Extraction Pipeline:** Dual-engine architecture:
  1. *Authoritative Local Extraction Engine:* High-precision biomedical and botanical dictionary matching, regex syntax parsing, and pattern extraction (guaranteed zero API dependencies for 100% offline hackathon evaluation).
  2. *LLM Extraction Engine:* Modular plug-in for Gemini / OpenAI / Open-weight models for unstructured extraction when API credentials are provided.

---

### 5. Ethical & Intellectual Property Guardrails

1. **Nagoya Protocol & Traditional Knowledge Sovereignty:** All records maintain explicit attribution of the originating culture/tradition and primary scientific literature.
2. **Biodiversity Protection:** Endangered species are flagged; exact micro-coordinates are not published to prevent illegal wild-harvesting.
3. **Medical Disclaimer:** Unambiguous warnings across all interfaces declaring that historical traditional uses do not constitute validated medical advice.
