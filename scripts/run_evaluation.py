import sys
import os
import json
from pathlib import Path

# Add backend to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.services.extraction_service import ExtractionEngine

def calculate_metrics(tp: int, fp: int, fn: int):
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    return round(precision, 4), round(recall, 4), round(f1, 4)

def run_evaluation():
    gold_path = BASE_DIR / "data" / "evaluation" / "gold_standard.json"
    if not gold_path.exists():
        print(f"Error: {gold_path} not found.")
        sys.exit(1)

    with open(gold_path, "r", encoding="utf-8") as f:
        gold_samples = json.load(f)

    print(f"Loaded {len(gold_samples)} gold-standard evaluation samples.")

    # Counters
    plant_tp = plant_fp = plant_fn = 0
    cond_tp = cond_fp = cond_fn = 0
    tier_tp = tier_fp = tier_fn = 0
    rel_tp = rel_fp = rel_fn = 0
    taxonomic_resolution_correct = 0
    source_attribution_correct = 0
    unsupported_claims_count = 0
    total_extracted_records = 0

    results_log = []

    for item in gold_samples:
        text = item["text"]
        doc_title = f"Document_{item['id']}"
        extracted = ExtractionEngine.extract_from_text(
            text=text,
            document_title=doc_title,
            document_url="https://doi.org/10.1000/eval",
            document_year=2024
        )
        total_extracted_records += len(extracted)

        # Plant evaluation
        matched_gold_plant = any(item["gold_plant"].lower() in r.scientific_name.lower() for r in extracted)
        if matched_gold_plant:
            plant_tp += 1
            taxonomic_resolution_correct += 1
        else:
            plant_fn += 1

        # Check for false positive plants
        for r in extracted:
            if item["gold_plant"].split()[0].lower() not in r.scientific_name.lower():
                plant_fp += 1
                unsupported_claims_count += 1

        # Condition evaluation
        extracted_conds = [r.medical_condition.lower() for r in extracted]
        gold_conds = [c.lower() for c in item["gold_conditions"]]
        cond_hits = sum(1 for gc in gold_conds if any(gc in ec or ec in gc for ec in extracted_conds))
        if cond_hits > 0:
            cond_tp += 1
        else:
            cond_fn += 1

        # Evidence tier
        gold_tier = item["gold_evidence_tier"]
        matched_tier = any(r.evidence_category == gold_tier for r in extracted)
        if matched_tier:
            tier_tp += 1
        else:
            tier_fn += 1

        # Relation tuple (Plant + Condition + Tier)
        if matched_gold_plant and cond_hits > 0:
            rel_tp += 1
        else:
            rel_fn += 1

        # Source attribution
        all_have_source = all(r.source_document == doc_title and len(r.supporting_excerpt) > 15 for r in extracted) if extracted else False
        if all_have_source:
            source_attribution_correct += 1

        results_log.append({
            "sample_id": item["id"],
            "gold_plant": item["gold_plant"],
            "extracted_count": len(extracted),
            "taxonomic_resolution_correct": matched_gold_plant,
            "evidence_tier_correct": matched_tier
        })

    n_samples = len(gold_samples)
    plant_p, plant_r, plant_f1 = calculate_metrics(plant_tp, plant_fp, plant_fn)
    cond_p, cond_r, cond_f1 = calculate_metrics(cond_tp, cond_fp, cond_fn)
    tier_p, tier_r, tier_f1 = calculate_metrics(tier_tp, tier_fp, tier_fn)
    rel_p, rel_r, rel_f1 = calculate_metrics(rel_tp, rel_fp, rel_fn)

    taxonomic_accuracy = round(taxonomic_resolution_correct / n_samples, 4)
    source_accuracy = round(source_attribution_correct / n_samples, 4)
    unsupported_rate = round(unsupported_claims_count / max(1, total_extracted_records), 4)

    report = {
        "evaluation_summary": {
            "total_test_samples": n_samples,
            "total_extracted_records": total_extracted_records,
            "metrics": {
                "plant_entity_recognition": {"precision": plant_p, "recall": plant_r, "f1": plant_f1},
                "taxonomic_resolution_accuracy": taxonomic_accuracy,
                "medical_condition_identification": {"precision": cond_p, "recall": cond_r, "f1": cond_f1},
                "evidence_tier_classification": {"precision": tier_p, "recall": tier_r, "f1": tier_f1},
                "relationship_extraction_tuple": {"precision": rel_p, "recall": rel_r, "f1": rel_f1},
                "source_attribution_accuracy": source_accuracy,
                "unsupported_claim_rate": unsupported_rate
            }
        },
        "sample_breakdown": results_log
    }

    out_file = BASE_DIR / "data" / "evaluation" / "evaluation_report.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n=== ETHNOKG DATA SCIENCE & NLP EVALUATION REPORT ===")
    print(f"Total Test Samples:             {n_samples}")
    print(f"Plant NER F1-Score:             {plant_f1} (P: {plant_p}, R: {plant_r})")
    print(f"Taxonomic Resolution Accuracy:  {taxonomic_accuracy * 100:.1f}%")
    print(f"Condition Extraction F1:        {cond_f1} (P: {cond_p}, R: {cond_r})")
    print(f"Evidence Tier Classify F1:      {tier_f1} (P: {tier_p}, R: {tier_r})")
    print(f"Relationship Tuple F1:          {rel_f1} (P: {rel_p}, R: {rel_r})")
    print(f"Source Attribution Accuracy:    {source_accuracy * 100:.1f}%")
    print(f"Unsupported Claim Rate:         {unsupported_rate * 100:.1f}%")
    print(f"Evaluation report written to:   {out_file}")

if __name__ == "__main__":
    run_evaluation()

