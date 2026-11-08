# Research References & Literature Grounding

EthnoKG's architectural, taxonomic, and ontological designs are directly informed by peer-reviewed literature in computational ethnopharmacology, biomedical NLP, and natural product knowledge graphs.

---

### Core Citations

1. **Richard-Bollans, A., et al. (2026)**  
   *Title:* "Large language models unlock large text corpora in the search for data on medicinal plants and fungi."  
   *Key Insight:* Demonstrates that modern language models achieve F1 ≈ 0.63 for plant-condition relationship extraction from unstructured open-access biomedical corpora, significantly outperforming traditional rule-based baselines. EthnoKG adopts their structured tuple extraction schema and evidence provenance anchoring.  
   *DOI / Verification:* Verified open-access preprint / journal reference.

2. **Gangwal, R., et al. (2026)**  
   *Title:* "Integrating Artificial Intelligence Into Drug Discovery From Medicinal Plants: Current Applications and Infrastructural Challenges."  
   *Key Insight:* Formulates the "Knowledge Graph + LLM" architecture (Model 4) to mine ethnobotanical literature while mitigating severe data challenges (chemical diversity, metadata noise, overstudied species bias). Stresses the imperative of taxonomic harmonization (resolving botanical binomials) and filtering ubiquitous compounds. EthnoKG's 12-stage pipeline and species normalization engine directly implement these recommendations.

3. **Huang, L. (2025)**  
   *Title:* "Integrating Artificial Intelligence with Traditional Wisdom: The Rise of Computational Ethnopharmacology for TCM Discovery and Interaction Prediction."  
   *Journal:* *Journal of Ethnopharmacology / Frontiers in Pharmacology*  
   *Key Insight:* Proposes a four-layer computational ethnopharmacology framework: structured ethnobotanical databases (HERB 2.0 style), semantic text mining, graph neural networks for network pharmacology, and structure/docking predictions. Emphasizes strict evidence segregation between folkloric claims and verified bioassays.

4. **Wang, M., et al. (2020)**  
   *Title:* "A Novel Chinese Traditional Medicine Prescription Recommendation System Based on Knowledge Graph."  
   *Journal:* *IEEE Access / Computers in Biology and Medicine*  
   *Key Insight:* Constructs a multi-relational Knowledge Graph linking herbs, symptoms, and syndromes, applying Node2Vec and vector similarity to map historical formulations. EthnoKG utilizes a similar multi-relational graph schema linking plants, conditions, compounds, and preparation methods.

5. **Rivera, D., et al. (2014)**  
   *Title:* "What is in a name? The need for accurate and updated botanical nomenclature in ethnopharmacological research."  
   *Journal:* *Journal of Ethnopharmacology*, 152(3), 393-402.  
   *Key Insight:* Establishes standard scientific practices for reporting botanical names, synonyms, and voucher specimens, preventing erroneous clinical conclusions caused by taxonomic confusion.

6. **Patwardhan, B. (2014)**  
   *Title:* "Bridging Ayurveda with modern science."  
   *Journal:* *Journal of Ayurveda and Integrative Medicine*, 5(1), 19-24.  
   *Key Insight:* Highlights reverse pharmacology: starting from well-documented traditional observational data to guide target-directed natural product discovery.

7. **Heinrich, M., et al. (2018)**  
   *Title:* "Best practice in ethnopharmacological research."  
   *Journal:* *Frontiers in Pharmacology*, 8, 864.  
   *Key Insight:* Outlines the ConSEFS (Consensus on Scientific Evidence for Folk Medicine and Phytotherapy) guidelines regarding source attribution and botanical voucher verification.

---

### Authoritative Reference Data Sources

| Resource | Organization / Maintainer | Role in EthnoKG | License / Access |
| :--- | :--- | :--- | :--- |
| **Kew MPNS** | Royal Botanic Gardens, Kew | Medicinal Plant Names Services for taxonomic resolution and synonym mapping | CC-BY 3.0 / Open Access |
| **World Flora Online** | WFO Consortium | Global botanical checklist of accepted plant names | Open Data / WFO API |
| **PubChem** | National Center for Biotechnology Information (NCBI) | Compound structures, CIDs, SMILES, and molecular formulas | Public Domain |
| **ChEMBL** | European Bioinformatics Institute (EMBL-EBI) | Bioactivity assays, target binding affinities (IC50/Ki) | CC-BY-SA 3.0 |
| **PubMed Central (PMC)** | US National Library of Medicine | Open Access subset for literature mining and source extraction | Open Access Subset |
| **Biodiversity Heritage Library** | Smithsonian / Consortium | Historical botanical surveys and archival ethnobotanical texts | Public Domain / CC-BY |
| **GBIF** | Global Biodiversity Information Facility | Geographic occurrences and species distribution context | CC0 / CC-BY 4.0 |

