from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/sources", tags=["Source Registry"])

SOURCE_REGISTRY: List[Dict[str, Any]] = [
    {
        "id": "kew_mpns",
        "name": "Kew Medicinal Plant Names Services (MPNS)",
        "organization": "Royal Botanic Gardens, Kew",
        "category": "Botanical Taxonomy & Nomenclature",
        "url": "https://mpns.science.kew.org/",
        "license": "Creative Commons Attribution 3.0 Unported (CC-BY 3.0)",
        "integration_status": "Active (Taxonomic Resolution & Synonyms)",
        "description": "Authoritative botanical checklist reconciling vernacular terms with accepted scientific binomials."
    },
    {
        "id": "wfo",
        "name": "World Flora Online (WFO)",
        "organization": "World Flora Online Consortium",
        "category": "Global Botanical Checklist",
        "url": "https://www.worldfloraonline.org/",
        "license": "Open Data / Creative Commons Attribution",
        "integration_status": "Active (Taxonomic Status Verification)",
        "description": "Comprehensive global inventory of all vascular plants and mosses."
    },
    {
        "id": "pmc_oa",
        "name": "PubMed Central Open Access Subset (PMC OA)",
        "organization": "National Library of Medicine (NLM)",
        "category": "Biomedical Scientific Literature",
        "url": "https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/",
        "license": "Creative Commons and Open Access Licenses",
        "integration_status": "Active (Full-Text Literature Mining)",
        "description": "Peer-reviewed biomedical literature covering ethnobotany, phytochemistry, and clinical phytotherapy."
    },
    {
        "id": "pubchem",
        "name": "PubChem Compound Database",
        "organization": "National Center for Biotechnology Information (NCBI)",
        "category": "Phytochemical & Molecular Structures",
        "url": "https://pubchem.ncbi.nlm.nih.gov/",
        "license": "Public Domain / Open Data",
        "integration_status": "Active (Compound SMILES, CIDs & Chemical Classes)",
        "description": "World's largest free chemical information resource."
    },
    {
        "id": "chembl",
        "name": "ChEMBL Bioactivity Database",
        "organization": "European Bioinformatics Institute (EMBL-EBI)",
        "category": "Pharmacological Assays & Target Affinities",
        "url": "https://www.ebi.ac.uk/chembl/",
        "license": "Creative Commons Attribution-ShareAlike 3.0 Unported",
        "integration_status": "Active (In-Vitro IC50 / Target Binding Assays)",
        "description": "Manually curated database of bioactive molecules with drug-like properties."
    },
    {
        "id": "gbif",
        "name": "Global Biodiversity Information Facility (GBIF)",
        "organization": "GBIF Secretariat",
        "category": "Geographic Distribution & Biodiversity",
        "url": "https://www.gbif.org/",
        "license": "CC0 / CC-BY 4.0",
        "integration_status": "Active (Geographic Provenance & Vulnerability Mapping)",
        "description": "International network and research infrastructure funded by governments providing open access to data about all types of life on Earth."
    },
    {
        "id": "bhl",
        "name": "Biodiversity Heritage Library (BHL)",
        "organization": "Smithsonian Libraries / BHL Consortium",
        "category": "Historical Botanical & Ethnomedical Literature",
        "url": "https://www.biodiversitylibrary.org/",
        "license": "Public Domain / CC-BY",
        "integration_status": "Active (Historical Pharmacopoeias & Field Surveys)",
        "description": "Digitized archives of legacy literature documenting centuries of traditional botanical knowledge."
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def list_sources():
    return SOURCE_REGISTRY
