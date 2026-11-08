# EthnoKG Hackathon Implementation Checklist & Task Tracker

## Phase 1 — Essential MVP (Target: Complete)
- [x] Technical Architecture & System Blueprint documentation
- [x] Database Schema & Relational Models (SQLAlchemy 2.0)
- [x] Authoritative botanical and biomedical taxonomy dictionaries
- [x] Open-access research corpus curation (real PubMed/BHL DOIs and excerpts)
- [x] 12-Stage Literature Mining Engine with hybrid extraction and fallback
- [x] FastAPI REST API backend with full endpoints
- [x] In-memory NetworkX Knowledge Graph and Cytoscape JSON serialization
- [x] Grounded RAG Research Assistant with exact bibliographic provenance
- [x] Human Verification Workspace with curator approve/reject/edit workflows
- [x] React + Vite + Tailwind CSS frontend application
- [x] Interactive Cytoscape.js Knowledge Graph visualization
- [x] Recharts dynamic dashboard analytics
- [x] Evidence Explorer with 6-tier classification and excerpt inspector
- [x] Plant Intelligence Explorer with multi-attribute filtering

## Phase 2 — Verification & Scientific Rigor
- [x] Gold-standard evaluation dataset (`data/evaluation/gold_standard.json`)
- [x] Automated NLP evaluation test runner (`scripts/run_evaluation.py`)
- [x] Backend test suite with pytest covering API endpoints, extraction, and graph logic
- [x] Ethics, Limitations & Nagoya Protocol disclaimers across all views

## Phase 3 — Production Readiness & Polish
- [x] Environment variable configurations (`.env.example`)
- [x] Production build verification for frontend and backend
- [x] Comprehensive README with quick-start and demo script

