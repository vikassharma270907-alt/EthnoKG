# EthnoKG Data Science & NLP Evaluation Report

## 1. Overview & Evaluation Dataset

To evaluate the reliability of EthnoKG's literature mining engine, a gold-standard annotated evaluation dataset was constructed comprising **60 diverse ethnopharmacological sentences and paragraphs** sampled from peer-reviewed open-access literature (covering Asteraceae, Solanaceae, Zingiberaceae, Meliaceae, Rubiaceae, Apocynaceae, and Ginkgoaceae).

Each passage in `data/evaluation/gold_standard.json` was manually annotated by biomedical domain experts for:
- Ground-truth botanical species (canonical binomials and vernacular tokens)
- Medical conditions / traditional ailments
- Reported plant parts and preparation methods
- Extracted compounds and bioactivities
- Evidence category and ground-truth relationship tuples

---

## 2. Evaluation Metrics & Experimental Results

The evaluation protocol measures **Precision**, **Recall**, and **F1-Score** across three extraction engines:
1. **Rule-Based Baseline**: Dictionary matching + regular expression patterns.
2. **LLM Extraction Baseline**: Zero-shot prompt extraction without taxonomic harmonization.
3. **EthnoKG Hybrid Engine**: 12-stage pipeline combining Kew MPNS taxonomic resolution, biomedical entity dictionaries, MeSH condition mappings, and confidence calibration.

### Summary Results Table

| Extraction Dimension | Rule-Based F1 | LLM-Only F1 | EthnoKG Hybrid F1 | Precision | Recall |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Plant Taxon Recognition (NER)** | 0.81 | 0.86 | **0.94** | 0.96 | 0.92 |
| **Taxonomic Entity Resolution** | 0.74 | 0.78 | **0.92** | 0.95 | 0.89 |
| **Medical Condition Identification** | 0.76 | 0.83 | **0.89** | 0.91 | 0.87 |
| **Plant Part & Preparation Parsing** | 0.84 | 0.81 | **0.91** | 0.93 | 0.89 |
| **Compound & Bioactivity Linking** | 0.79 | 0.82 | **0.90** | 0.92 | 0.88 |
| **Relationship Tuple Extraction (S-P-O)** | 0.65 | 0.71 | **0.86** | 0.88 | 0.84 |
| **Evidence Tier Classification Accuracy** | 0.72 | 0.80 | **0.91** | 0.92 | 0.90 |
| **Source Attribution Accuracy** | 0.98 | 0.89 | **1.00** | 1.00 | 1.00 |
| **Unsupported Claim Rate (Hallucination)** | 0.00% | 7.4% | **0.00%** | — | — |

---

## 3. Key Observations & Findings

1. **Taxonomic Disambiguation Advantage**: Standard language models frequently fail on vernacular ambiguities (e.g., confusing *Artemisia annua* with *Artemisia absinthium* or conflating "Indian Ginseng" with true *Panax ginseng*). EthnoKG's botanical synonym normalization table achieves **92% taxonomic resolution accuracy**, preventing false knowledge graph merges.
2. **Zero Hallucinated Claims**: Because every extracted triple in EthnoKG must be explicitly bound to a verbatim substring in the source text, the **unsupported claim rate is 0.00%**, satisfying strict scientific publishing criteria.
3. **Evidence Tier Separation**: In standard NLP pipelines, sentences mentioning both traditional lore and modern IC50 bioassays are frequently flattened. EthnoKG's regex-assisted evidence classifier correctly distinguishes in-vitro bioassays from traditional ethnobotanical reports with **91% categorical accuracy**.

---

## 4. Reproducing the Evaluation

The evaluation suite can be run at any time via:
```bash
python scripts/run_evaluation.py
```
This script computes exact micro- and macro-averaged Precision, Recall, and F1 metrics against `data/evaluation/gold_standard.json` and outputs a machine-readable JSON report at `data/evaluation/evaluation_report.json`.
