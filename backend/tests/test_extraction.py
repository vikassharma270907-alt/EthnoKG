import pytest
from app.services.extraction_service import ExtractionEngine

def test_clean_text():
    raw = "Artemisia annua L. has been used in tra-\nditional medicine for centuries.\n\n\nIt treats fever."
    cleaned = ExtractionEngine.clean_text(raw)
    assert "traditional" in cleaned
    assert "\n\n\n" not in cleaned

def test_extract_artemisia():
    text = (
        "In Traditional Chinese Medicine, aqueous infusions of the aerial parts of Artemisia annua L. "
        "were traditionally prescribed to treat intermittent fevers and malaria. "
        "Recent in vitro bioassays confirmed that artemisinin exhibits potent inhibition against Plasmodium falciparum."
    )
    records = ExtractionEngine.extract_from_text(text, document_title="Test Artemisia Paper")
    assert len(records) > 0
    rec = records[0]
    assert "Artemisia annua" in rec.scientific_name
    assert rec.medical_condition in ["Malaria", "Intermittent fever", "Fever"]
    assert "Aerial parts" in rec.plant_part or "Leaves" in rec.plant_part
    assert rec.extraction_confidence > 0.8
    assert rec.evidence_category in ["In-Vitro Experimental Bioassay", "Traditional Use Report"]

def test_extract_ashwagandha():
    text = (
        "Withania somnifera (L.) Dunal, known as Ashwagandha in Ayurveda, is traditionally prepared as "
        "root powder boiled in milk to relieve stress and debility. In vivo preclinical rodent models demonstrate adaptogenic activity."
    )
    records = ExtractionEngine.extract_from_text(text, document_title="Test Ashwagandha Paper")
    assert len(records) > 0
    rec = records[0]
    assert "Withania somnifera" in rec.scientific_name
    assert "Root" in rec.plant_part
    assert rec.knowledge_tradition == "Ayurveda"
