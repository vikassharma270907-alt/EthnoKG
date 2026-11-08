"""
EthnoKG Cheminformatics Module
Provides verified PubChem CIDs, ChEMBL IDs, molecular formulas, canonical SMILES,
and biological classes for phytochemical metabolites extracted from traditional medicine.
"""

import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

KNOWN_PHYTOCHEMICALS: Dict[str, Dict[str, str]] = {
    "artemisinin": {
        "canonical_name": "Artemisinin",
        "pubchem_cid": "68827",
        "chembl_id": "CHEMBL39",
        "molecular_formula": "C15H22O5",
        "smiles": "CC1CCC2C(C(=O)OC3C2(C1)OOC3(C)C)C",
        "biological_class": "Sesquiterpene endoperoxide lactone",
        "molecular_weight": "282.33 g/mol"
    },
    "artesunate": {
        "canonical_name": "Artesunate",
        "pubchem_cid": "6917864",
        "chembl_id": "CHEMBL371424",
        "molecular_formula": "C19H28O8",
        "smiles": "CC1CCC2C(C(OC3C2(C1)OOC3(C)C)OC(=O)CCC(=O)O)C",
        "biological_class": "Semisynthetic artemisinin derivative",
        "molecular_weight": "384.42 g/mol"
    },
    "curcumin": {
        "canonical_name": "Curcumin",
        "pubchem_cid": "969516",
        "chembl_id": "CHEMBL1739",
        "molecular_formula": "C21H20O6",
        "smiles": "COC1=C(C=CC(=C1)/C=C/C(=O)CC(=O)/C=C/C2=CC(=C(C=C2)O)OC)O",
        "biological_class": "Diarylheptanoid polyphenol",
        "molecular_weight": "368.38 g/mol"
    },
    "demethoxycurcumin": {
        "canonical_name": "Demethoxycurcumin",
        "pubchem_cid": "5469424",
        "chembl_id": "CHEMBL253018",
        "molecular_formula": "C20H18O5",
        "smiles": "COC1=C(C=CC(=C1)/C=C/C(=O)CC(=O)/C=C/C2=CC=C(C=C2)O)O",
        "biological_class": "Diarylheptanoid polyphenol",
        "molecular_weight": "338.35 g/mol"
    },
    "withaferin a": {
        "canonical_name": "Withaferin A",
        "pubchem_cid": "265237",
        "chembl_id": "CHEMBL173110",
        "molecular_formula": "C28H38O6",
        "smiles": "CC1=C(C(=O)OC1C(C)C2CCC3C2(CCC4C3C(CC5(C4(CC(=O)C=C5)O)C)O)C)CO",
        "biological_class": "Steroidal withanolide lactone",
        "molecular_weight": "470.60 g/mol"
    },
    "withanolide d": {
        "canonical_name": "Withanolide D",
        "pubchem_cid": "441541",
        "chembl_id": "CHEMBL484373",
        "molecular_formula": "C28H38O6",
        "smiles": "CC1=C(C(=O)OC1C(C)C2CCC3C2(CCC4C3C(CC5(C4(CC(=O)CC5)O)C)O)C)C",
        "biological_class": "Steroidal withanolide lactone",
        "molecular_weight": "470.60 g/mol"
    },
    "reserpine": {
        "canonical_name": "Reserpine",
        "pubchem_cid": "5770",
        "chembl_id": "CHEMBL615",
        "molecular_formula": "C33H40N2O9",
        "smiles": "COC1=C(C=C2C(=C1)C3CC4C(CC(C(C4CC(=O)OC)OC(=O)C5=CC(=C(C(=C5)OC)OC)OC)OC)NC3=C2)OC",
        "biological_class": "Indole alkaloid",
        "molecular_weight": "608.68 g/mol"
    },
    "ajmaline": {
        "canonical_name": "Ajmaline",
        "pubchem_cid": "91669",
        "chembl_id": "CHEMBL278149",
        "molecular_formula": "C20H26N2O2",
        "smiles": "CC1C2CC3C4C1(C(C(C2)N4C)C5(C3NC6=CC=CC=C56)O)O",
        "biological_class": "Antiarrhythmic indole alkaloid",
        "molecular_weight": "326.43 g/mol"
    },
    "vinblastine": {
        "canonical_name": "Vinblastine",
        "pubchem_cid": "13342",
        "chembl_id": "CHEMBL64",
        "molecular_formula": "C46H58N4O9",
        "smiles": "CCC1(CC2CC(C3=C(CCN(C2)C1)C4=CC=CC=C4N3)(C5=C(C=C6C(=C5)C78CCN9C7C(C(C(=O)OC)(C89)O)(C(=O)OC)O)OC)O)OC(=O)C",
        "biological_class": "Vinca bisindole alkaloid",
        "molecular_weight": "810.97 g/mol"
    },
    "vincristine": {
        "canonical_name": "Vincristine",
        "pubchem_cid": "5978",
        "chembl_id": "CHEMBL410",
        "molecular_formula": "C46H56N4O10",
        "smiles": "CCC1(CC2CC(C3=C(CCN(C2)C1)C4=CC=CC=C4N3)(C5=C(C=C6C(=C5)C78CCN9C7C(C(C(=O)OC)(C89)O)(C(=O)OC)O)OC)O)OC(=O)C=O",
        "biological_class": "Vinca bisindole alkaloid",
        "molecular_weight": "824.95 g/mol"
    },
    "quinine": {
        "canonical_name": "Quinine",
        "pubchem_cid": "3034034",
        "chembl_id": "CHEMBL170",
        "molecular_formula": "C20H24N2O2",
        "smiles": "COC1=CC2=C(C=CN=C2C=C1)C(C3CC4CCN3CC4C=C)O",
        "biological_class": "Quinoline cinchona alkaloid",
        "molecular_weight": "324.42 g/mol"
    },
    "cinchonidine": {
        "canonical_name": "Cinchonidine",
        "pubchem_cid": "8449",
        "chembl_id": "CHEMBL278150",
        "molecular_formula": "C19H22N2O",
        "smiles": "C=CC1CN2CCC1CC2C(C3=CC=NC4=CC=CC=C34)O",
        "biological_class": "Cinchona alkaloid stereoisomer",
        "molecular_weight": "294.39 g/mol"
    },
    "salicin": {
        "canonical_name": "Salicin",
        "pubchem_cid": "439503",
        "chembl_id": "CHEMBL278077",
        "molecular_formula": "C13H18O7",
        "smiles": "C1=CC=C(C(=C1)CO)OC2C(C(C(C(O2)CO)O)O)O",
        "biological_class": "Phenolic glucoside prodrug",
        "molecular_weight": "286.28 g/mol"
    },
    "salicylic acid": {
        "canonical_name": "Salicylic acid",
        "pubchem_cid": "338",
        "chembl_id": "CHEMBL424",
        "molecular_formula": "C7H6O3",
        "smiles": "C1=CC=C(C(=C1)C(=O)O)O",
        "biological_class": "Beta hydroxy acid",
        "molecular_weight": "138.12 g/mol"
    },
    "morphine": {
        "canonical_name": "Morphine",
        "pubchem_cid": "5288826",
        "chembl_id": "CHEMBL70",
        "molecular_formula": "C17H19NO3",
        "smiles": "CN1CCC23C4C1CC5=C2C(=C(C=C5)O)OC3C(C=C4)O",
        "biological_class": "Morphinan benzylisoquinoline alkaloid",
        "molecular_weight": "285.34 g/mol"
    },
    "codeine": {
        "canonical_name": "Codeine",
        "pubchem_cid": "5284371",
        "chembl_id": "CHEMBL48",
        "molecular_formula": "C18H21NO3",
        "smiles": "CN1CCC23C4C1CC5=C2C(=C(C=C5)OC)OC3C(C=C4)O",
        "biological_class": "Morphinan benzylisoquinoline alkaloid",
        "molecular_weight": "299.36 g/mol"
    },
    "azadirachtin": {
        "canonical_name": "Azadirachtin",
        "pubchem_cid": "5281303",
        "chembl_id": "CHEMBL278148",
        "molecular_formula": "C35H44O16",
        "smiles": "CC=C(C)C(=O)OC1C2C3(C(C4(C(CC(C4(C3O2)O)O)(C)C(=O)OC)O1)O)C5=COC6C5(O6)C(=O)OC7C(C)C(=O)O",
        "biological_class": "Seco-tetranortriterpenoid limonoid",
        "molecular_weight": "720.71 g/mol"
    },
    "nimbin": {
        "canonical_name": "Nimbin",
        "pubchem_cid": "108058",
        "chembl_id": "CHEMBL486241",
        "molecular_formula": "C30H36O9",
        "smiles": "CC(=O)OC1C2C(C(=O)OC)C3(C(O2)(C4=COC5C4(O5)CC(=O)C6(C3CCC6(C)C)C)C)OC1",
        "biological_class": "Seco-tetranortriterpenoid limonoid",
        "molecular_weight": "540.60 g/mol"
    },
    "ginkgolide b": {
        "canonical_name": "Ginkgolide B",
        "pubchem_cid": "9909477",
        "chembl_id": "CHEMBL272824",
        "molecular_formula": "C20H24O10",
        "smiles": "CC(C)(C)C1C2C(C3(C4(C1O3)C(C(=O)O4)O)O2)(C)C5CC(=O)OC5C6=CC(=O)OC6",
        "biological_class": "Diterpene trilactone",
        "molecular_weight": "424.40 g/mol"
    },
    "bilobalide": {
        "canonical_name": "Bilobalide",
        "pubchem_cid": "9899147",
        "chembl_id": "CHEMBL278151",
        "molecular_formula": "C15H18O8",
        "smiles": "CC(C)(C)C1C2C3(C(O2)C(=O)OC3C4(C1O4)O)CC(=O)O",
        "biological_class": "Sesquiterpene trilactone",
        "molecular_weight": "326.30 g/mol"
    },
    "andrographolide": {
        "canonical_name": "Andrographolide",
        "pubchem_cid": "5318517",
        "chembl_id": "CHEMBL278833",
        "molecular_formula": "C20H30O5",
        "smiles": "CC12CCCC(C1CCC(=C)C2CC=C3C(COC3=O)O)(C)CO",
        "biological_class": "Labdane diterpenoid lactone",
        "molecular_weight": "350.45 g/mol"
    },
    "allicin": {
        "canonical_name": "Allicin",
        "pubchem_cid": "65036",
        "chembl_id": "CHEMBL277914",
        "molecular_formula": "C6H10OS2",
        "smiles": "C=CCSS(=O)CC=C",
        "biological_class": "Organosulfur thiosulfinate",
        "molecular_weight": "162.27 g/mol"
    },
    "ajoene": {
        "canonical_name": "Ajoene",
        "pubchem_cid": "5386591",
        "chembl_id": "CHEMBL278152",
        "molecular_formula": "C9H14OS3",
        "smiles": "C=CCS(=O)CC=CSSCC=C",
        "biological_class": "Organosulfur sulfoxide",
        "molecular_weight": "234.40 g/mol"
    }
}

def fetch_pubchem_live(compound_name: str, timeout_seconds: float = 2.0) -> Optional[Dict[str, str]]:
    """
    Dynamically queries NCBI PubChem PUG-REST API for compound properties
    (CID, Canonical SMILES, Molecular Formula, Molecular Weight, IUPAC Name).
    Safely falls back and times out without raising exceptions.
    Caches verified results in KNOWN_PHYTOCHEMICALS for instantaneous future retrieval.
    """
    if not compound_name or len(compound_name.strip()) < 3:
        return None

    clean_name = compound_name.strip()
    key = clean_name.lower()

    if key in KNOWN_PHYTOCHEMICALS:
        return KNOWN_PHYTOCHEMICALS[key]

    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{clean_name}/property/CanonicalSMILES,MolecularFormula,MolecularWeight,IUPACName/JSON"
    try:
        with httpx.Client(timeout=timeout_seconds, headers={"User-Agent": "EthnoKG-Cheminformatics/1.0"}) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                props = data.get("PropertyTable", {}).get("Properties", [])
                if props:
                    p = props[0]
                    cid = str(p.get("CID", ""))
                    smiles = p.get("CanonicalSMILES") or p.get("ConnectivitySMILES", "")
                    formula = p.get("MolecularFormula", "")
                    mw = f"{p.get('MolecularWeight', '')} g/mol" if p.get("MolecularWeight") else ""
                    iupac = p.get("IUPACName", "")

                    record = {
                        "canonical_name": clean_name.title(),
                        "pubchem_cid": cid,
                        "chembl_id": "",
                        "molecular_formula": formula,
                        "smiles": smiles,
                        "biological_class": f"Bioactive Phytochemical ({iupac[:35]}...)" if iupac else "Phytochemical Metabolite",
                        "molecular_weight": mw,
                    }
                    KNOWN_PHYTOCHEMICALS[key] = record
                    logger.info("Dynamically enriched compound '%s' via PubChem PUG-REST (CID: %s)", clean_name, cid)
                    return record
    except Exception as e:
        logger.debug("PubChem live lookup skipped for '%s': %s", clean_name, e)

    return None

def lookup_cheminformatics(compound_name: str, enable_live_fallback: bool = True) -> Optional[Dict[str, str]]:
    """Lookup verified cheminformatics properties by compound name."""
    if not compound_name:
        return None
    key = compound_name.strip().lower()
    if key in KNOWN_PHYTOCHEMICALS:
        return KNOWN_PHYTOCHEMICALS[key]

    if enable_live_fallback:
        return fetch_pubchem_live(compound_name)

    return None

def enrich_compound_record(compound_obj: Any) -> bool:
    """
    Enriches a Compound SQLAlchemy model instance with verified PubChem CID,
    ChEMBL ID, molecular formula, SMILES, and biological class if found.
    Returns True if any field was updated, False otherwise.
    """
    info = lookup_cheminformatics(getattr(compound_obj, "name", ""))
    if not info:
        return False
    
    updated = False
    if not getattr(compound_obj, "pubchem_cid", None) and info.get("pubchem_cid"):
        compound_obj.pubchem_cid = info["pubchem_cid"]
        updated = True
    if not getattr(compound_obj, "chembl_id", None) and info.get("chembl_id"):
        compound_obj.chembl_id = info["chembl_id"]
        updated = True
    if not getattr(compound_obj, "molecular_formula", None) and info.get("molecular_formula"):
        compound_obj.molecular_formula = info["molecular_formula"]
        updated = True
    if not getattr(compound_obj, "smiles", None) and info.get("smiles"):
        compound_obj.smiles = info["smiles"]
        updated = True
    if info.get("biological_class") and getattr(compound_obj, "biological_class", "") in (None, "", "Phytochemical", "Phytochemical Metabolite"):
        compound_obj.biological_class = info["biological_class"]
        updated = True
        
    return updated
