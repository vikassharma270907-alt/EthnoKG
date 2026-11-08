# EthnoKG REST API Documentation

Base URL: `http://localhost:8000/api`

---

## 1. Dashboard & Statistics

### `GET /api/dashboard/stats`
Returns aggregate research statistics computed live from SQLite database tables.
- **Response `200 OK`**:
```json
{
  "total_plants": 24,
  "total_relationships": 142,
  "total_compounds": 68,
  "indexed_publications": 18,
  "verified_relationships": 95,
  "pending_verifications": 42,
  "rejected_verifications": 5,
  "avg_extraction_confidence": 0.884,
  "evidence_distribution": {
    "Traditional Use Report": 48,
    "Ethnobotanical Field Observation": 26,
    "In-Vitro Experimental Bioassay": 38,
    "In-Vivo Preclinical Model": 18,
    "Clinical Human Trial": 8,
    "In-Silico Prediction": 4
  },
  "confidence_distribution": {
    "0.9-1.0": 62,
    "0.8-0.89": 45,
    "0.7-0.79": 25,
    "<0.7": 10
  },
  "traditions_distribution": {
    "Ayurveda": 42,
    "Traditional Chinese Medicine": 36,
    "African Traditional Medicine": 28,
    "Amazonian Ethnobotany": 16,
    "European Folk Medicine": 12,
    "Unani": 8
  },
  "recent_documents": [ ... ]
}
```

---

## 2. Document Ingestion & Literature

### `POST /api/documents/upload`
Uploads a document (`.pdf` or `.txt`) and extracts raw text with PyPDF / text parser.
- **Form Data**: `file` (UploadFile), `title` (string, optional), `authors` (string, optional), `year` (int, optional), `doi` (string, optional), `license` (string, optional)
- **Response `201 Created`**: Document object with ID, character count, and raw text preview.

### `POST /api/documents/ingest`
Ingests unstructured text or an open-access article URL.
- **Payload**:
```json
{
  "title": "Ethnobotanical survey of antipyretic plants in Western Ghats",
  "authors": "Nair et al.",
  "publication_year": 2024,
  "journal": "Journal of Ethnopharmacology",
  "doi": "10.1016/j.jep.2024.118000",
  "source_url": "https://doi.org/10.1016/j.jep.2024.118000",
  "text": "..."
}
```

### `GET /api/documents`
List indexed documents with pagination and filtering.
- **Query Params**: `skip` (default 0), `limit` (default 20), `query` (search term).

### `GET /api/documents/{id}`
Returns full document content and associated extracted relationships.

---

## 3. Literature Mining & Extraction Pipeline

### `POST /api/extraction/run`
Executes the 12-stage extraction pipeline on raw text or an existing document.
- **Payload**:
```json
{
  "document_id": 1,
  "text_override": null,
  "engine": "hybrid" // "hybrid" | "rule_based" | "llm"
}
```
- **Response `200 OK`**:
```json
{
  "extracted_count": 8,
  "results": [
    {
      "plant_name": "Artemisia annua",
      "scientific_name": "Artemisia annua L.",
      "plant_synonyms": ["Sweet Wormwood", "Qinghao"],
      "reported_use": "Treatment of intermittent fevers and chills",
      "medical_condition": "Malaria",
      "plant_part": "Aerial parts",
      "preparation_method": "Cold water infusion / fresh juice extract",
      "bioactive_compounds": ["Artemisinin", "Arteannuin B"],
      "pharmacological_activity": "Antiplasmodial",
      "geographic_context": "Hunan Province, China",
      "knowledge_tradition": "Traditional Chinese Medicine",
      "evidence_category": "In-Vitro Experimental Bioassay",
      "evidence_statement": "Cold aqueous extracts demonstrate potent in vitro inhibition against Plasmodium falciparum (IC50 < 10 ug/ml).",
      "source_document": "Handbook of Prescriptions for Emergency Treatments",
      "source_url": "https://doi.org/10.1016/S0140-6736(05)67567-4",
      "publication_year": 2005,
      "page_or_section": "Section 2.1, Historical Background",
      "supporting_excerpt": "A handful of qinghao steeped in two liters of water, wring out the juice and drink it all...",
      "extraction_confidence": 0.94,
      "verification_status": "pending"
    }
  ]
}
```

### `GET /api/extraction/results`
Retrieve extracted relationships across documents with filtering by status (`pending`, `approved`, `rejected`), plant ID, or confidence threshold.

---

## 4. Botanical & Chemical Intelligence

### `GET /api/plants`
Search and filter medicinal plant profiles.
- **Query Params**: `query`, `family`, `condition`, `tradition`, `skip`, `limit`.

### `GET /api/plants/{id}`
Returns complete botanical dossier: accepted binomial, synonyms, parts used, preparations, associated compounds, reported uses, evidence breakdown, and source publications.

### `GET /api/compounds`
Search phytochemicals and bioactive natural products.

### `GET /api/conditions`
Search conditions and symptoms with associated ethnobotanical remedies.

---

## 5. Knowledge Graph API

### `GET /api/graph`
Returns full or filtered network graph serialized in Cytoscape.js JSON format.
- **Query Params**:
  - `plant_id`: Center graph on a specific plant
  - `condition_id`: Center graph on a specific condition
  - `evidence_tier`: Filter by evidence level
  - `tradition`: Filter by cultural tradition
  - `max_nodes`: Limit node count (default: 150)
- **Response `200 OK`**:
```json
{
  "nodes": [
    {
      "data": {
        "id": "plant_1",
        "label": "Artemisia annua L.",
        "type": "Plant",
        "family": "Asteraceae",
        "degree": 14
      }
    },
    {
      "data": {
        "id": "condition_1",
        "label": "Malaria",
        "type": "Condition",
        "category": "Infectious"
      }
    }
  ],
  "edges": [
    {
      "data": {
        "id": "rel_1",
        "source": "plant_1",
        "target": "condition_1",
        "label": "REPORTED_USE_FOR",
        "evidence_tier": "In-Vitro Experimental Bioassay",
        "confidence": 0.94,
        "verification_status": "approved"
      }
    }
  ]
}
```

### `GET /api/graph/entity/{id}`
Returns ego-network (1-hop or 2-hop neighborhood) for any plant, compound, or condition.

---

## 6. Verification Workspace API

### `POST /api/verification/{id}/approve`
Approves an extracted relationship, updating status to `approved` and creating an audit record.
- **Payload**:
```json
{
  "reviewer_name": "Dr. Vance",
  "notes": "Verified against original 1982 survey table 4."
}
```

### `POST /api/verification/{id}/reject`
Rejects an extracted claim.
- **Payload**: `{"reviewer_name": "...", "reason": "Misidentified plant part"}`

### `PATCH /api/verification/{id}`
Allows a curator to correct plant name, condition, plant part, preparation method, or evidence tier before approving.

---

## 7. Grounded Research Assistant (RAG)

### `POST /api/assistant/query`
Conversational RAG agent that retrieves actual indexed evidence and formats a citation-grounded response.
- **Payload**:
```json
{
  "question": "What plants have documented traditional uses for fever with supporting in-vitro antiplasmodial evidence?"
}
```
- **Response `200 OK`**:
```json
{
  "answer": "Based on the indexed scientific literature in EthnoKG, two primary species have documented traditional antipyretic uses coupled with in-vitro antiplasmodial assays: 1. Artemisia annua L. (Asteraceae) traditionally prepared as cold water infusions for intermittent fevers in Traditional Chinese Medicine... 2. Azadirachta indica A. Juss. (Meliaceae) in Ayurvedic tradition...",
  "cited_plants": ["Artemisia annua L.", "Azadirachta indica A. Juss."],
  "cited_sources": [
    {
      "document_title": "Antimalarial activity of Artemisia annua extracts",
      "authors": "Tu et al.",
      "year": 2011,
      "doi": "10.1038/nm.2471",
      "excerpt": "Extracts from Artemisia annua demonstrated high inhibitory efficacy..."
    }
  ],
  "evidence_tiers_involved": ["Traditional Use Report", "In-Vitro Experimental Bioassay"],
  "medical_disclaimer": "EthnoKG is a literature discovery platform. Historical traditional uses and in-vitro findings do not constitute medical advice or clinical proof of efficacy."
}
```

---

## 8. Source Registry

### `GET /api/sources`
Lists all underlying research corpora, licenses, DOIs, and taxonomic authorities (Kew MPNS, WFO, PubChem, ChEMBL, GBIF, BHL).

