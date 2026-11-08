import pytest
from app.core.cheminformatics import (
    lookup_cheminformatics,
    enrich_compound_record,
    fetch_pubchem_live,
    KNOWN_PHYTOCHEMICALS,
)
from app.models.compound import Compound
from app.core.seeder import enrich_compounds_cheminformatics

def test_lookup_cheminformatics_known():
    info = lookup_cheminformatics("Artemisinin")
    assert info is not None
    assert info["pubchem_cid"] == "68827"
    assert info["chembl_id"] == "CHEMBL39"
    assert "C15H22O5" in info["molecular_formula"]
    assert info["smiles"] != ""

def test_lookup_cheminformatics_case_insensitive():
    info1 = lookup_cheminformatics("curcumin")
    info2 = lookup_cheminformatics("CURCUMIN")
    assert info1 == info2
    assert info1 is not None
    assert info1["pubchem_cid"] == "969516"

def test_lookup_cheminformatics_unknown():
    assert lookup_cheminformatics("UnknownCompound999") is None
    assert lookup_cheminformatics("") is None

def test_enrich_compound_record():
    mock_compound = Compound(name="Withaferin A")
    updated = enrich_compound_record(mock_compound)
    assert updated is True
    assert mock_compound.pubchem_cid == "265237"
    assert mock_compound.chembl_id == "CHEMBL173110"
    assert mock_compound.molecular_formula == "C28H38O6"
    assert "Steroidal withanolide lactone" in mock_compound.biological_class

    # Calling again should not update since fields are already set
    updated_again = enrich_compound_record(mock_compound)
    assert updated_again is False

def test_enrich_compounds_cheminformatics_db(db_session):
    # Check that known compound is enriched in db
    comp = db_session.query(Compound).filter(Compound.name.ilike("reserpine%")).first()
    if not comp:
        comp = Compound(name="Reserpine_Test", biological_class="Phytochemical")
        db_session.add(comp)
        db_session.commit()

    enrich_compounds_cheminformatics(db_session)
    reloaded = db_session.query(Compound).filter(Compound.name.ilike("reserpine%")).first()
    assert reloaded is not None
    assert reloaded.pubchem_cid is not None

def test_fetch_pubchem_live_and_caching():
    # Empty or too short names return None immediately
    assert fetch_pubchem_live("") is None
    assert fetch_pubchem_live("ab") is None

    # Cached compound returns without external network call
    cached_info = fetch_pubchem_live("curcumin")
    assert cached_info is not None
    assert cached_info["pubchem_cid"] == "969516"

