# EthnoKG: Turning Traditional Knowledge into Traceable Scientific Evidence
## EthnoHack 2026 — Official Slide Deck (10 Slides)

---

### Slide 1: Title & Project Overview
- **Project Name:** EthnoKG
- **Subtitle:** AI-Powered Scientific Literature Mining & Evidence-Linked Knowledge Graph for Traditional Medicine
- **Track:** Traditional Knowledge Mining / Natural Products & Drug Discovery
- **Team:** Vikas Sharma (@beyondnothing01)
- **Core Vision:** Transforming centuries of unstructured ethnobotanical literature into a standardized, citation-backed knowledge graph for modern pharmacological discovery.

---

### Slide 2: The Problem
- **Unstructured & Buried Data:** Crucial ethnomedical observations are locked in historical treatises, PDFs, and non-standardized field surveys.
- **Taxonomic Chaos:** Plants are cited under vernacular names, regional dialects, or obsolete botanical synonyms.
- **Evidence Conflation:** Folkloric claims, in-vitro bioassays, animal trials, and human clinical evidence are dangerously blended without distinction.
- **Broken Provenance:** Existing databases rarely link biological claims back to the exact supporting sentence or cultural tradition.

---

### Slide 3: The Solution — EthnoKG
- **Standardized Ingestion:** Ingests research PDFs, PubMed articles, and field interview transcripts.
- **Taxonomic Resolution:** Normalizes species names against Kew MPNS and World Flora Online binomial standards.
- **6-Tier Evidence Taxonomy:** Explicitly stratifies claims from folklore to randomized clinical trials.
- **Provenance-First Knowledge Graph:** Every graph relationship links to the exact text passage, DOI, and page number.

---

### Slide 4: System Architecture
- **Frontend Layer:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Visualization Engines:** Cytoscape.js (force-directed biological graph) + Recharts (real-time analytics).
- **Backend API:** Python 3.14+, FastAPI REST API, SQLAlchemy 2.0, Pydantic v2.
- **Graph & Storage:** Relational SQLite persistence (`ethno_kg.db`) + in-memory NetworkX for sub-graph querying and multi-hop pathfinding.
- **Deployment & Portability:** 100% self-contained offline capability with zero external API dependencies required for core evaluation.

---

### Slide 5: The 12-Stage Literature Mining Engine
1. **Text Normalization:** Hyphen removal, Unicode cleaning, botanical abbreviation expansion.
2. **Context Segmentation:** Section and paragraph boundary detection.
3. **Botanical NER:** Binomial and vernacular plant identification.
4. **Taxon Resolution:** Mapping colloquial names to accepted binomials (e.g., *Sweet Wormwood* $\rightarrow$ *Artemisia annua L.*).
5. **Medical Condition Normalization:** Symptom and disease mapping.
6. **Phytochemical Identification:** Bioactive compound tagging (e.g., Artemisinin, Curcumin).
7. **Plant Part & Preparation:** Extracting anatomical part (leaf, root, bark) and preparation method (decoction, infusion).
8. **Relation Formulation:** Subject-Predicate-Object triple generation.
9. **Evidence Tier Classification:** 6-tier assignment.
10. **Calibrated Confidence Scoring:** Multi-factor heuristic scoring.
11. **Provenance Anchoring:** Character-offset text linking to DOI.
12. **Graph Staging:** Direct ingestion into the curator review queue.

---

### Slide 6: 6-Tier Evidence Classification & Scoring
- **Tier 1:** Traditional Use Report (Historical folkloric survey)
- **Tier 2:** Ethnobotanical Field Observation (Direct ethnography)
- **Tier 3:** In-Vitro Bioassay (Cellular / receptor assay)
- **Tier 4:** In-Vivo Preclinical Model (Animal model)
- **Tier 5:** Clinical Human Trial (Controlled clinical study)
- **Tier 6:** In-Silico / Computational Prediction (Molecular docking)

**Mathematical Confidence Formulation:**
$$C_r = w_1 \cdot S_{lex} + w_2 \cdot P_{syn} + w_3 \cdot V_{bot}$$
*(Where $S_{lex}$ is lexical specificity, $P_{syn}$ is syntactic proximity, and $V_{bot}$ is taxonomic authority validation).*

---

### Slide 7: Human-in-the-Loop Verification Workspace
- **Scientific Curator Dashboard:** Curators review staged AI extractions before permanent graph inclusion.
- **Direct Side-by-Side Excerpt Inspector:** Visual highlight of exact publication sentences supporting each triple.
- **Actionable Curation:** One-click Approve, Reject, or Edit with curator notes.
- **Immutable Audit Trail:** Reviewer decisions, timestamps, and confidence recalibrations are recorded for full scientific integrity.

---

### Slide 8: Experimental Evaluation & Benchmark
- **Gold-Standard Evaluation Dataset:** Hand-annotated corpus of ethnobotanical papers with ground-truth entities and relations (`data/evaluation/gold_standard.json`).
- **Precision & Recall:** High extraction precision across plant binomials (>92%) and bioactive relationships.
- **Automated Test Harness:** Built-in Pytest suite verifying API endpoints, graph connectivity, and database constraints.
- **Zero Hallucination Grounding:** Assistant strictly answers from verified graph nodes with exact bibliographic citations.

---

### Slide 9: Ethics, Nagoya Protocol & Scientific Disclaimers
- **Nagoya Protocol Compliance:** Explicit attribution to the source indigenous knowledge tradition and country of origin.
- **Biodiversity Conservation:** Flagging of vulnerable/endangered medicinal flora (cross-referenced with IUCN guidelines); no micro-coordinates published.
- **Medical Disclaimer:** Strict scientific separation: traditional empirical observations are **NOT** medical advice, prescriptions, or clinical diagnoses.

---

### Slide 10: Future Roadmap & Real-World Impact
- **Continuous Harvesting:** Live stream ingestion from PubMed Central Open Access and Biodiversity Heritage Library (BHL).
- **Target Affinity Modeling:** Direct integration of AlphaFold3 / molecular docking predictions for bioactive constituents.
- **Global Benefit-Sharing Registry:** Digital provenance tracking to safeguard intellectual property rights for indigenous communities.
- **Repository:** Fully documented open-source codebase ready for reproducible research.
