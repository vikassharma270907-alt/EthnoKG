import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from ..models.plant import Plant, PlantSynonym
from ..models.condition import Condition
from ..models.compound import Compound
from ..models.document import Document
from ..models.relationship import Relationship
from ..schemas.extraction import ExtractionRecord

# Authoritative botanical & pharmacological knowledge dictionary
BOTANICAL_TAXA_KNOWLEDGE = [
    {
        "scientific_name": "Artemisia annua L.",
        "family": "Asteraceae",
        "genus": "Artemisia",
        "species": "annua",
        "authority": "L.",
        "common_names": ["Sweet Wormwood", "Qinghao", "Annual Mugwort", "Sweet Annie"],
        "tradition": "Traditional Chinese Medicine",
        "default_parts": ["Aerial parts", "Leaves"],
        "default_preparations": ["Cold water infusion", "Fresh juice", "Hydroalcoholic extract"],
        "compounds": [
            {"name": "Artemisinin", "cid": "68827", "class": "Sesquiterpene lactone"},
            {"name": "Arteannuin B", "cid": "104107", "class": "Sesquiterpenoid"}
        ],
        "conditions": ["Malaria", "Intermittent fever", "Chills", "Systemic lupus erythematosus"],
        "activities": ["Antiplasmodial", "Antipyretic", "Anti-inflammatory"]
    },
    {
        "scientific_name": "Withania somnifera (L.) Dunal",
        "family": "Solanaceae",
        "genus": "Withania",
        "species": "somnifera",
        "authority": "(L.) Dunal",
        "common_names": ["Ashwagandha", "Indian Ginseng", "Winter Cherry", "Asgandh"],
        "tradition": "Ayurveda",
        "default_parts": ["Root", "Leaves"],
        "default_preparations": ["Ksheerapaka (Milk decoction)", "Root powder (Churna)", "Aqueous extract"],
        "compounds": [
            {"name": "Withaferin A", "cid": "265237", "class": "Steroidal lactone (Withanolide)"},
            {"name": "Withanolide D", "cid": "14236711", "class": "Withanolide"}
        ],
        "conditions": ["Stress and Anxiety", "Insomnia", "Debility", "Arthritis", "Cognitive impairment"],
        "activities": ["Adaptogenic", "Neuroprotective", "Anti-inflammatory", "GABAergic modulation"]
    },
    {
        "scientific_name": "Curcuma longa L.",
        "family": "Zingiberaceae",
        "genus": "Curcuma",
        "species": "longa",
        "authority": "L.",
        "common_names": ["Turmeric", "Haridra", "Haldi", "Yellow Ginger"],
        "tradition": "Ayurveda",
        "default_parts": ["Rhizome"],
        "default_preparations": ["Rhizome paste", "Decoction", "Warm oil infusion"],
        "compounds": [
            {"name": "Curcumin", "cid": "969516", "class": "Diarylheptanoid / Curcuminoid"},
            {"name": "Demethoxycurcumin", "cid": "5469424", "class": "Curcuminoid"}
        ],
        "conditions": ["Rheumatoid arthritis", "Wound healing", "Gastrointestinal inflammation", "Skin disorders"],
        "activities": ["COX-2 inhibition", "Anti-inflammatory", "Antioxidant", "Wound re-epithelialization"]
    },
    {
        "scientific_name": "Catharanthus roseus (L.) G.Don",
        "family": "Apocynaceae",
        "genus": "Catharanthus",
        "species": "roseus",
        "authority": "(L.) G.Don",
        "common_names": ["Madagascar Periwinkle", "Sadabahar", "Vinca rosea"],
        "tradition": "African Traditional Medicine",
        "default_parts": ["Leaves", "Whole plant"],
        "default_preparations": ["Leaf tea", "Aqueous infusion", "Alkaloid fraction"],
        "compounds": [
            {"name": "Vinblastine", "cid": "13342", "class": "Bisindole alkaloid"},
            {"name": "Vincristine", "cid": "5978", "class": "Bisindole alkaloid"}
        ],
        "conditions": ["Diabetes mellitus", "Hodgkin's lymphoma", "Acute lymphoblastic leukemia", "Hypertension"],
        "activities": ["Tubulin binding / Antimitotic", "Hypoglycemic", "Antineoplastic"]
    },
    {
        "scientific_name": "Rauvolfia serpentina (L.) Benth. ex Kurz",
        "family": "Apocynaceae",
        "genus": "Rauvolfia",
        "species": "serpentina",
        "authority": "(L.) Benth. ex Kurz",
        "common_names": ["Indian Snakeroot", "Sarpagandha", "Serpentine Root"],
        "tradition": "Ayurveda",
        "default_parts": ["Root"],
        "default_preparations": ["Root decoction", "Fine powder"],
        "compounds": [
            {"name": "Reserpine", "cid": "5770", "class": "Indole alkaloid"},
            {"name": "Ajmaline", "cid": "91757", "class": "Antiarrhythmic alkaloid"}
        ],
        "conditions": ["Hypertension", "Psychosis and Insanity", "Severe agitation", "Snakebite"],
        "activities": ["VMAT-2 inhibition", "Antihypertensive", "Sedative and tranquilizing"]
    },
    {
        "scientific_name": "Azadirachta indica A. Juss.",
        "family": "Meliaceae",
        "genus": "Azadirachta",
        "species": "indica",
        "authority": "A. Juss.",
        "common_names": ["Neem", "Nimba", "Indian Lilac", "Margosa"],
        "tradition": "Ayurveda",
        "default_parts": ["Leaves", "Bark", "Seeds", "Twigs"],
        "default_preparations": ["Leaf poultice", "Seed oil", "Bark decoction", "Chewing sticks"],
        "compounds": [
            {"name": "Azadirachtin", "cid": "5281303", "class": "Limonoid (Seco-tetranortriterpenoid)"},
            {"name": "Nimbin", "cid": "108058", "class": "Limonoid"}
        ],
        "conditions": ["Dental caries", "Dermatitis and Eczema", "Helminthiasis", "Malarial fever"],
        "activities": ["Antimicrobial", "Antiplasmodial", "Anthelmintic", "Anti-inflammatory"]
    },
    {
        "scientific_name": "Ginkgo biloba L.",
        "family": "Ginkgoaceae",
        "genus": "Ginkgo",
        "species": "biloba",
        "authority": "L.",
        "common_names": ["Maidenhair Tree", "Yinxing", "Ginkgo"],
        "tradition": "Traditional Chinese Medicine",
        "default_parts": ["Leaves", "Seeds / Kernels"],
        "default_preparations": ["Standardized dry extract (EGb 761)", "Decoction of seeds"],
        "compounds": [
            {"name": "Ginkgolide B", "cid": "99094", "class": "Terpene lactone"},
            {"name": "Bilobalide", "cid": "98276", "class": "Sesquiterpene trilactone"}
        ],
        "conditions": ["Cognitive decline", "Cerebral insufficiency", "Asthma and Bronchitis", "Tinnitus"],
        "activities": ["PAF receptor antagonism", "Neuroprotective", "Vasodilatory", "Free-radical scavenging"]
    },
    {
        "scientific_name": "Panax ginseng C.A. Mey.",
        "family": "Araliaceae",
        "genus": "Panax",
        "species": "ginseng",
        "authority": "C.A. Mey.",
        "common_names": ["Asian Ginseng", "Renshen", "Korean Ginseng"],
        "tradition": "Traditional Chinese Medicine",
        "default_parts": ["Root (White/Red)"],
        "default_preparations": ["Steamed red ginseng decoction", "Powdered root"],
        "compounds": [
            {"name": "Ginsenoside Rg1", "cid": "441923", "class": "Dammarane triterpenoid"},
            {"name": "Ginsenoside Rb1", "cid": "9898276", "class": "Protopanaxadiol saponin"}
        ],
        "conditions": ["Fatigue and Exhaustion", "Qi deficiency", "Immunosenescence", "Convalescence"],
        "activities": ["Immunomodulatory", "Adaptogenic", "Cardioprotective", "Endurance enhancement"]
    },
    {
        "scientific_name": "Cinchona officinalis L.",
        "family": "Rubiaceae",
        "genus": "Cinchona",
        "species": "officinalis",
        "authority": "L.",
        "common_names": ["Quinine Bark", "Peruvian Bark", "Jesuit's Bark", "Quina"],
        "tradition": "Amazonian Ethnobotany",
        "default_parts": ["Bark"],
        "default_preparations": ["Bark infusion", "Tincture in wine", "Aqueous decoction"],
        "compounds": [
            {"name": "Quinine", "cid": "3034034", "class": "Quinoline alkaloid"},
            {"name": "Cinchonine", "cid": "90453", "class": "Quinoline alkaloid"}
        ],
        "conditions": ["Malaria", "Tertiary and Quartan fevers", "Muscle cramps", "Neuralgia"],
        "activities": ["Heme polymerase inhibition", "Antimalarial", "Antipyretic"]
    },
    {
        "scientific_name": "Digitalis purpurea L.",
        "family": "Plantaginaceae",
        "genus": "Digitalis",
        "species": "purpurea",
        "authority": "L.",
        "common_names": ["Common Foxglove", "Purple Foxglove", "Folk's Glove"],
        "tradition": "European Folk Medicine",
        "default_parts": ["Leaves"],
        "default_preparations": ["Carefully titrated leaf powder", "Infusion"],
        "compounds": [
            {"name": "Digitoxin", "cid": "441207", "class": "Cardiac glycoside"},
            {"name": "Digoxin", "cid": "2724385", "class": "Cardiac glycoside"}
        ],
        "conditions": ["Dropsy", "Congestive heart failure", "Atrial fibrillation"],
        "activities": ["Na+/K+-ATPase inhibition", "Positive inotropic activity", "Vagal tone enhancement"]
    },
    {
        "scientific_name": "Salix alba L.",
        "family": "Salicaceae",
        "genus": "Salix",
        "species": "alba",
        "authority": "L.",
        "common_names": ["White Willow", "Willow Bark"],
        "tradition": "European Folk Medicine",
        "default_parts": ["Bark"],
        "default_preparations": ["Bark decoction", "Dried powdered bark maceration"],
        "compounds": [
            {"name": "Salicin", "cid": "439503", "class": "Phenolic glucoside"},
            {"name": "Salicylic acid", "cid": "338", "class": "Hydroxybenzoic acid"}
        ],
        "conditions": ["Rheumatic joint pain", "Febrile conditions", "Headache and myalgia"],
        "activities": ["Non-selective COX inhibition", "Analgesic", "Antipyretic", "Anti-inflammatory"]
    },
    {
        "scientific_name": "Papaver somniferum L.",
        "family": "Papaveraceae",
        "genus": "Papaver",
        "species": "somniferum",
        "authority": "L.",
        "common_names": ["Opium Poppy", "Afim", "Khashkhash"],
        "tradition": "Greco-Roman & Unani",
        "default_parts": ["Exudate / Dried Latex", "Capsules"],
        "default_preparations": ["Laudanum (Alcoholic tincture)", "Dried opium resin"],
        "compounds": [
            {"name": "Morphine", "cid": "5288826", "class": "Morphinan alkaloid"},
            {"name": "Codeine", "cid": "5284371", "class": "Morphinan alkaloid"}
        ],
        "conditions": ["Severe acute pain", "Intractable diarrhea", "Persistent spasmodic cough"],
        "activities": ["Mu-opioid receptor agonism", "Analgesic", "Central antitussive", "Antimotility"]
    }
]

# Patterns for plant parts
PLANT_PARTS_VOCAB = [
    "aerial parts", "leaves", "leaf", "root", "roots", "rhizome", "rhizomes", 
    "bark", "stem bark", "seeds", "seed", "flowers", "flower", "fruit", "fruits", 
    "whole plant", "latex", "resin", "gum", "twigs", "capsules", "bulbs", "tubers"
]

# Patterns for preparation methods
PREPARATIONS_VOCAB = [
    "decoction", "infusion", "poultice", "paste", "cold water extract", "maceration", 
    "powder", "churna", "tincture", "fresh juice", "tea", "steamed", "ethanolic extract", 
    "hydroalcoholic extract", "aqueous extract", "boiling in milk", "ksheerapaka"
]

# Patterns for evidence tiers
EVIDENCE_INDICATORS = {
    "In-Vitro Experimental Bioassay": [
        "in vitro", "ic50", "mic", "cell culture", "disk diffusion", "inhibition assay", 
        "binding affinity", "dpph", "mtt assay", "enzyme inhibition", "ec50"
    ],
    "In-Vivo Preclinical Model": [
        "in vivo", "rats", "mice", "animal model", "paw edema", "rodent", "guinea pig", 
        "injected", "oral gavage", "pharmacokinetics", "in vivo preclinical"
    ],
    "Clinical Human Trial": [
        "clinical trial", "randomized", "double-blind", "placebo-controlled", "patients", 
        "human subjects", "cohort", "rct", "phase i", "phase ii", "open-label"
    ],
    "In-Silico Prediction": [
        "molecular docking", "in silico", "qsar", "virtual screening", "binding energy", 
        "computational prediction", "pharmacophore", "docking score"
    ],
    "Ethnobotanical Field Observation": [
        "informant", "field survey", "ethnobotanical survey", "healer", "use value", 
        "informant consensus", "fidelity level", "village", "interviews"
    ],
    "Traditional Use Report": [
        "traditional", "tradition", "ancient", "pharmacopoeia", "treatise", "ayurveda", 
        "traditional chinese medicine", "folk medicine", "historical", "herbal lore"
    ]
}

class ExtractionEngine:
    @staticmethod
    def clean_text(raw_text: str) -> str:
        # Normalize whitespace, strip hyphenated line-breaks
        text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", raw_text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    @staticmethod
    def segment_paragraphs(text: str) -> List[Dict[str, Any]]:
        raw_paras = re.split(r"\n\s*\n", text)
        segments = []
        for idx, p in enumerate(raw_paras):
            cleaned = p.strip()
            if len(cleaned) < 30:
                continue
            section_guess = "General Section"
            lower_p = cleaned.lower()
            if "abstract" in lower_p[:50]:
                section_guess = "Abstract"
            elif "introduction" in lower_p[:50]:
                section_guess = "Introduction"
            elif "method" in lower_p[:50]:
                section_guess = "Materials and Methods"
            elif "result" in lower_p[:50]:
                section_guess = "Results & Discussion"
            elif "ethnobotanical" in lower_p[:80]:
                section_guess = "Ethnobotanical Survey"
            elif "conclusion" in lower_p[:50]:
                section_guess = "Conclusion"
            
            segments.append({
                "index": idx + 1,
                "section": section_guess,
                "text": cleaned
            })
        return segments

    @classmethod
    def extract_from_text(
        cls, 
        text: str, 
        document_title: str = "Research Literature", 
        document_url: str = "", 
        document_year: Optional[int] = 2024
    ) -> List[ExtractionRecord]:
        cleaned_text = cls.clean_text(text)
        segments = cls.segment_paragraphs(cleaned_text)
        
        extracted_records: List[ExtractionRecord] = []
        seen_keys = set()

        # Iterate through segments
        for seg in segments:
            seg_text = seg["text"]
            seg_lower = seg_text.lower()
            section_name = seg["section"]

            # 1. Match plant taxon candidates
            for taxon in BOTANICAL_TAXA_KNOWLEDGE:
                plant_found = False
                matched_name = taxon["scientific_name"]
                
                # Check scientific name match
                sci_match = re.search(r"\b" + re.escape(taxon["scientific_name"].split()[0]) + r"\s+" + re.escape(taxon["scientific_name"].split()[1]) + r"\b", seg_text, re.IGNORECASE)
                if sci_match:
                    plant_found = True
                    matched_name = sci_match.group(0)
                else:
                    # Check common names
                    for cn in taxon["common_names"]:
                        if re.search(r"\b" + re.escape(cn) + r"\b", seg_text, re.IGNORECASE):
                            plant_found = True
                            matched_name = cn
                            break

                if not plant_found:
                    continue

                # 2. Match condition/ailment in the same or nearby sentence
                matched_conditions = []
                for cond in taxon["conditions"]:
                    if re.search(r"\b" + re.escape(cond) + r"\b", seg_text, re.IGNORECASE):
                        matched_conditions.append(cond)
                
                # General health keywords if specific condition didn't hit
                if not matched_conditions:
                    generic_keywords = ["fever", "malaria", "pain", "swelling", "infection", "headache", "inflammation", "wound", "fatigue", "anxiety", "cough"]
                    for gw in generic_keywords:
                        if re.search(r"\b" + re.escape(gw) + r"\b", seg_text, re.IGNORECASE):
                            matched_conditions.append(gw.capitalize())

                if not matched_conditions:
                    # If plant was found, assign default traditional indication from taxon
                    matched_conditions = [taxon["conditions"][0]]

                # 3. Match plant parts
                found_parts = []
                for part in PLANT_PARTS_VOCAB:
                    if re.search(r"\b" + re.escape(part) + r"\b", seg_text, re.IGNORECASE):
                        found_parts.append(part.capitalize())
                part_str = ", ".join(found_parts) if found_parts else taxon["default_parts"][0]

                # 4. Match preparation methods
                found_preps = []
                for prep in PREPARATIONS_VOCAB:
                    if re.search(r"\b" + re.escape(prep) + r"\b", seg_text, re.IGNORECASE):
                        found_preps.append(prep.capitalize())
                prep_str = ", ".join(found_preps) if found_preps else taxon["default_preparations"][0]

                # 5. Match compounds
                matched_compounds = []
                for comp in taxon["compounds"]:
                    if re.search(r"\b" + re.escape(comp["name"]) + r"\b", seg_text, re.IGNORECASE):
                        matched_compounds.append(comp["name"])
                if not matched_compounds and len(taxon["compounds"]) > 0:
                    matched_compounds = [taxon["compounds"][0]["name"]]

                # 6. Classify Evidence Tier
                evidence_tier = "Traditional Use Report"
                for tier_name, indicators in EVIDENCE_INDICATORS.items():
                    for ind in indicators:
                        if ind in seg_lower:
                            evidence_tier = tier_name
                            break
                    if evidence_tier != "Traditional Use Report":
                        break

                # 7. Extract supporting excerpt
                # Find most relevant sentence containing the plant or condition
                sentences = re.split(r"(?<=[.!?])\s+", seg_text)
                relevant_sentence = seg_text[:280] + "..." if len(seg_text) > 280 else seg_text
                for s in sentences:
                    if any(c.lower() in s.lower() for c in matched_conditions) and (taxon["scientific_name"].split()[0].lower() in s.lower() or any(cn.lower() in s.lower() for cn in taxon["common_names"])):
                        relevant_sentence = s.strip()
                        break

                # 8. Calibrate Confidence
                confidence = 0.82
                if sci_match:
                    confidence += 0.08
                if found_parts:
                    confidence += 0.03
                if found_preps:
                    confidence += 0.03
                if evidence_tier != "Traditional Use Report":
                    confidence += 0.02
                confidence = min(0.98, round(confidence, 2))

                # Pharmacological activity
                activity = taxon["activities"][0]
                for act in taxon["activities"]:
                    if act.lower() in seg_lower:
                        activity = act
                        break

                # Build record for each matched condition
                for cond_name in matched_conditions[:2]:
                    dedup_key = f"{taxon['scientific_name']}_{cond_name}_{evidence_tier}"
                    if dedup_key in seen_keys:
                        continue
                    seen_keys.add(dedup_key)

                    record = ExtractionRecord(
                        plant_name=matched_name,
                        scientific_name=taxon["scientific_name"],
                        plant_synonyms=taxon["common_names"],
                        reported_use=f"Traditional application of {part_str.lower()} for relief of {cond_name.lower()}",
                        medical_condition=cond_name,
                        plant_part=part_str,
                        preparation_method=prep_str,
                        bioactive_compounds=matched_compounds,
                        pharmacological_activity=activity,
                        geographic_context=taxon.get("geographic_context", "Global / Indigenous Ethnosphere"),
                        knowledge_tradition=taxon["tradition"],
                        evidence_category=evidence_tier,
                        evidence_statement=f"{evidence_tier} indicates preparation of {taxon['scientific_name']} ({part_str}) correlates with {activity.lower()} properties against {cond_name.lower()}.",
                        source_document=document_title,
                        source_url=document_url,
                        publication_year=document_year,
                        page_or_section=f"{section_name} (Segment {seg['index']})",
                        supporting_excerpt=relevant_sentence,
                        extraction_confidence=confidence,
                        verification_status="pending"
                    )
                    extracted_records.append(record)

        return extracted_records

    @classmethod
    def persist_extracted_records(cls, db: Session, document_id: int, records: List[ExtractionRecord]) -> int:
        persisted_count = 0
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return 0

        try:
            for rec in records:
                # 1. Resolve or create Plant
                plant = db.query(Plant).filter(Plant.scientific_name == rec.scientific_name).first()
                if not plant:
                    # Find taxon knowledge
                    taxon_meta = next((t for t in BOTANICAL_TAXA_KNOWLEDGE if t["scientific_name"] == rec.scientific_name), None)
                    genus_val = taxon_meta["genus"] if taxon_meta else (rec.scientific_name.split()[0] if rec.scientific_name.strip() else "Unknown")
                    plant = Plant(
                        scientific_name=rec.scientific_name,
                        family=taxon_meta["family"] if taxon_meta else "Plantae",
                        genus=genus_val,
                        species=taxon_meta["species"] if taxon_meta else "sp.",
                        authority=taxon_meta["authority"] if taxon_meta else "",
                        common_names=rec.plant_synonyms,
                        taxonomic_status="Accepted",
                        description=f"Medicinal species documented in {rec.knowledge_tradition} literature."
                    )
                    db.add(plant)
                    db.flush()

                    # Add synonyms
                    for s_name in rec.plant_synonyms:
                        syn = PlantSynonym(
                            plant_id=plant.id,
                            synonym_name=s_name,
                            synonym_type="vernacular",
                            taxonomic_source="Kew MPNS / EthnoKG Lexicon"
                        )
                        db.add(syn)
                    db.flush()

                # 2. Resolve or create Condition
                condition = db.query(Condition).filter(Condition.name == rec.medical_condition).first()
                if not condition:
                    condition = Condition(
                        name=rec.medical_condition,
                        category="Medical Condition / Traditional Symptom",
                        description=f"Reported health condition treated in {rec.knowledge_tradition}."
                    )
                    db.add(condition)
                    db.flush()

                # 3. Resolve or create Compound
                compound = None
                if rec.bioactive_compounds:
                    primary_comp_name = rec.bioactive_compounds[0]
                    compound = db.query(Compound).filter(Compound.name == primary_comp_name).first()
                    if not compound:
                        compound = Compound(
                            name=primary_comp_name,
                            biological_class="Phytochemical Metabolite"
                        )
                        db.add(compound)
                        db.flush()

                # 4. Check if relationship already exists
                existing_rel = db.query(Relationship).filter(
                    Relationship.plant_id == plant.id,
                    Relationship.condition_id == condition.id,
                    Relationship.document_id == document_id,
                    Relationship.evidence_tier == rec.evidence_category
                ).first()

                if not existing_rel:
                    rel = Relationship(
                        plant_id=plant.id,
                        condition_id=condition.id,
                        compound_id=compound.id if compound else None,
                        document_id=document_id,
                        relation_type="REPORTED_USE_FOR",
                        reported_use=rec.reported_use,
                        plant_part=rec.plant_part,
                        preparation_method=rec.preparation_method,
                        pharmacological_activity=rec.pharmacological_activity,
                        geographic_context=rec.geographic_context,
                        knowledge_tradition=rec.knowledge_tradition,
                        evidence_tier=rec.evidence_category,
                        evidence_statement=rec.evidence_statement,
                        supporting_excerpt=rec.supporting_excerpt,
                        page_or_section=rec.page_or_section,
                        extraction_confidence=rec.extraction_confidence,
                        verification_status=rec.verification_status
                    )
                    db.add(rel)
                    persisted_count += 1

            db.commit()
            return persisted_count
        except Exception:
            db.rollback()
            raise

