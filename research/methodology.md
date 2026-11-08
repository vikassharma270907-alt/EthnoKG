# EthnoKG Research Methodology & Extraction Pipeline

## 1. Scientific Principles & Guardrails

EthnoKG adheres to four core methodological pillars:

1. **Taxonomic Strictness**: Two botanical species are never merged based on vernacular naming similarities. For example, *Artemisia annua L.* (Sweet Wormwood) is taxonomically separated from *Artemisia absinthium L.* (Common Wormwood) and *Artemisia vulgaris L.* (Mugwort). Each taxon receives a distinct node bound to its Kew MPNS / WFO identifier.
2. **Evidence Tier Stratification**: EthnoKG explicitly categorizes all claims into six discrete evidence tiers. A folkloric or traditional use report is never treated as equivalent to an in-vitro assay, in-vivo model, or clinical trial.
3. **Verifiable Provenance**: Every extracted relationship in the Knowledge Graph is tethered to:
   - Primary Document Title and Authors
   - Digital Object Identifier (DOI) or Archival URL
   - Exact verbatim text excerpt from which the claim was extracted
   - Section or page locator
4. **Transparent Calibration**: Extraction confidence is calculated deterministically from lexical specificity, botanical authority alignment, and syntactic extraction clarity.

---

## 2. The 12-Stage Literature Mining Pipeline

```
Raw Literature (PDF/TXT/URL)
   │
   ▼ Stage 1: Document Parsing & Text Cleaning
   │ (Hyphenation removal, Unicode normalization, section header detection)
   │
   ▼ Stage 2: Semantic Paragraph Segmentation
   │ (Detects abstract, survey tables, preparation descriptions, bioassays)
   │
   ▼ Stage 3: Scientific Named Entity Recognition (NER)
   │ (Recognizes botanical candidates, medical conditions, phytochemicals)
   │
   ▼ Stage 4: Botanical Taxon Normalization & Synonym Resolution
   │ (Resolves to canonical Kew MPNS binomial and links historical synonyms)
   │
   ▼ Stage 5: Medical Condition Normalization
   │ (Maps symptoms and ailments to MeSH / ICD categories)
   │
   ▼ Stage 6: Phytochemical & Bioactive Compound Linking
   │ (Maps active metabolites to PubChem CIDs and chemical classes)
   │
   ▼ Stage 7: Plant Anatomical Part & Preparation Parsing
   │ (Identifies specific organ: leaf/root/bark and method: decoction/infusion)
   │
   ▼ Stage 8: Relation Formulation (Subject-Predicate-Object Triples)
   │ (Formulates REPORTED_USE_FOR, CONTAINS_COMPOUND, HAS_ACTIVITY)
   │
   ▼ Stage 9: 6-Tier Evidence Classification
   │ (Traditional Report, Ethnobotanical Survey, In-Vitro, In-Vivo, Clinical, In-Silico)
   │
   ▼ Stage 10: Calibrated Confidence Estimation
   │ (Scores tuple confidence based on botanical verification and syntax clarity)
   │
   ▼ Stage 11: Provenance & Excerpt Binding
   │ (Stores exact supporting quote and section coordinates)
   │
   ▼ Stage 12: Knowledge Graph Staging & Curator Queue Insertion
```

---

## 3. Evidence Tier Classification Framework

| Tier | Category Name | Definition & Inclusion Criteria |
| :---: | :--- | :--- |
| **Tier 1** | Traditional Use Report | Historical texts, ancient medical codices, indigenous oral histories, and cultural pharmacopoeias. |
| **Tier 2** | Ethnobotanical Field Observation | Structured interviews with traditional healers, field surveys, community consensus indices (Fic / UV). |
| **Tier 3** | In-Vitro Experimental Bioassay | Laboratory cell-culture assays, enzyme inhibition (e.g., AChE, COX-2), antimicrobial disk diffusion, free-radical scavenging (DPPH). |
| **Tier 4** | In-Vivo Preclinical Model | Animal models (rodent antinociceptive tests, paw edema, pharmacokinetic ADMET profiling). |
| **Tier 5** | Clinical Human Trial | Randomized controlled trials (RCTs), open-label clinical studies, observational human cohorts. |
| **Tier 6** | In-Silico Prediction | Molecular docking, quantitative structure-activity relationship (QSAR), target-fishing algorithms. |

---

## 4. Grounded RAG Research Assistant Protocol

The EthnoKG conversational agent is strictly conditioned to prevent generative hallucination:
- It only synthesizes answers utilizing retrieved database relationships and indexed publication excerpts.
- It quotes supporting documents and attaches primary DOIs to every answer.
- If information on a plant or condition does not exist within the indexed repository, it responds:
  *"No verified records for this query are currently indexed in the EthnoKG literature base. EthnoKG does not generate speculative medical assertions."*
- Every response automatically embeds a scientific disclaimer clarifying that traditional uses are empirical cultural records rather than prescriptive medical advice.

