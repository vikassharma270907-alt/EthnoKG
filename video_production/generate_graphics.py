import os
from PIL import Image, ImageDraw, ImageFont

# 1920x1080 Resolution
W, H = 1920, 1080
BG_COLOR = (7, 11, 25) # #070b19 Deep obsidian
CARD_BG = (15, 23, 42) # #0f172a Deep slate
CARD_BORDER = (51, 65, 85) # #334155 Carbon border
EMERALD = (16, 185, 129) # #10b981
CYAN = (6, 182, 212) # #06b6d4
TEXT_WHITE = (248, 250, 252) # #f8fafc
TEXT_MUTED = (148, 163, 184) # #94a3b8
AMBER = (245, 158, 11) # #f59e0b
PURPLE = (168, 85, 247) # #a855f7

def get_font(size, bold=False):
    # Try system fonts on Windows
    font_paths = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf"
    ]
    if bold:
        font_paths = [
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "C:/Windows/Fonts/calibrib.ttf"
        ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_header(draw, title, subtitle, category="ETHNOHACK 2026 • OFFICIAL SUBMISSION"):
    # Category badge
    f_cat = get_font(18, bold=True)
    f_title = get_font(48, bold=True)
    f_sub = get_font(24)
    
    # Pill badge
    badge_text = f"  🌿  {category}  "
    bbox = f_cat.getbbox(badge_text)
    bw, bh = bbox[2] - bbox[0] + 20, bbox[3] - bbox[1] + 16
    draw.rounded_rectangle([80, 60, 80 + bw, 60 + bh], radius=12, fill=(16, 185, 129, 30), outline=EMERALD, width=2)
    draw.text((90, 68), badge_text, font=f_cat, fill=EMERALD)
    
    # Title
    draw.text((80, 120), title, font=f_title, fill=TEXT_WHITE)
    # Subtitle
    draw.text((80, 185), subtitle, font=f_sub, fill=TEXT_MUTED)
    
    # Subtle glowing top accent line
    draw.line([(80, 235), (1840, 235)], fill=(30, 41, 59), width=2)
    draw.line([(80, 235), (380, 235)], fill=CYAN, width=3)

def create_title_slide(out_path):
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Decorative subtle glowing circular mesh
    for r in range(400, 700, 60):
        draw.ellipse([(1400 - r, 540 - r), (1400 + r, 540 + r)], outline=(15, 28, 55), width=2)
    for r in range(200, 500, 50):
        draw.ellipse([(1400 - r, 540 - r), (1400 + r, 540 + r)], outline=(20, 45, 80), width=2)

    # Hackathon badge
    f_badge = get_font(20, bold=True)
    badge = "  🏆  ETHNOHACK 2026 SUBMISSION  •  TRACK: TRADITIONAL KNOWLEDGE MINING  "
    draw.rounded_rectangle([120, 120, 850, 170], radius=12, fill=(15, 35, 30), outline=EMERALD, width=2)
    draw.text((140, 132), badge, font=f_badge, fill=EMERALD)
    
    # Main Title
    f_huge = get_font(76, bold=True)
    draw.text((120, 210), "EthnoKG", font=f_huge, fill=TEXT_WHITE)
    
    # Subtitle
    f_sub = get_font(34, bold=False)
    draw.text((120, 310), "Turning Traditional Knowledge into Traceable Scientific Evidence", font=f_sub, fill=CYAN)
    
    # Tagline
    f_desc = get_font(22)
    desc = (
        "An automated, verifiable knowledge extraction pipeline and interactive graph system\n"
        "grounding ancient ethnobotanical medical traditions into peer-reviewed pharmacological proof."
    )
    draw.text((120, 375), desc, font=f_desc, fill=TEXT_MUTED)
    
    # 4 Key Pillars in Cards
    pillars = [
        ("12-Stage AI Mining", "Deterministic extraction from raw research papers, PDFs & URLs", CYAN),
        ("Kew MPNS Normalization", "Reconciles botanical synonyms without erroneous cross-merges", EMERALD),
        ("6-Tier Evidence Hierarchy", "Distinguishes folk claims, bioassays, preclinical & human trials", AMBER),
        ("0.00% Unsupported Claims", "Cryptographic citation anchoring to verbatim source excerpts", PURPLE)
    ]
    
    card_y = 520
    card_w = 400
    card_h = 240
    gap = 40
    
    for i, (title, detail, color) in enumerate(pillars):
        cx = 120 + i * (card_w + gap)
        # Card Background
        draw.rounded_rectangle([cx, card_y, cx + card_w, card_y + card_h], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=2)
        # Top color accent
        draw.rounded_rectangle([cx, card_y, cx + card_w, card_y + 8], radius=4, fill=color)
        
        # Indicator circle
        draw.ellipse([(cx + 25, card_y + 35), (cx + 45, card_y + 55)], fill=color)
        
        f_p_title = get_font(22, bold=True)
        draw.text((cx + 60, card_y + 32), title, font=f_p_title, fill=TEXT_WHITE)
        
        f_p_det = get_font(18)
        # Word wrap detail
        words = detail.split()
        lines = []
        cur = []
        for w in words:
            cur.append(w)
            if len(" ".join(cur)) > 26:
                lines.append(" ".join(cur[:-1]))
                cur = [w]
        if cur:
            lines.append(" ".join(cur))
        
        for li, line in enumerate(lines):
            draw.text((cx + 25, card_y + 90 + li * 28), line, font=f_p_det, fill=TEXT_MUTED)

    # Footer banner
    draw.rounded_rectangle([120, 860, 1800, 960], radius=16, fill=(15, 23, 42), outline=(30, 41, 59), width=2)
    f_foot = get_font(20, bold=True)
    f_subfoot = get_font(17)
    draw.text((150, 885), "SYSTEM TECH STACK:", font=f_foot, fill=TEXT_MUTED)
    draw.text((380, 885), "Python 3.14  •  FastAPI 0.115+  •  React 19  •  Cytoscape.js  •  SQLite FTS5  •  Kew MPNS  •  Docker", font=f_foot, fill=CYAN)
    draw.text((150, 920), "COMPLIANCE & STANDARDS:", font=f_subfoot, fill=TEXT_MUTED)
    draw.text((430, 920), "Nagoya Protocol on Access & Benefit-Sharing  •  ConSEFS Best Practice  •  Strict Non-Diagnostic Scope", font=f_subfoot, fill=EMERALD)

    img.save(out_path)
    print(f"Saved: {out_path}")

def create_architecture_slide(out_path):
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    draw.header = draw_header(draw, "System Architecture & Full-Stack Engineering", "Decoupled, high-throughput micro-architecture designed for strict provenance and zero hallucination")
    
    # 4 Architecture Columns
    tiers = [
        {
            "name": "1. PRESENTATION TIER",
            "tech": "React 19 • TypeScript • Vite • Tailwind",
            "color": CYAN,
            "items": [
                "Single-Page Reactive Dashboard",
                "Cytoscape.js Hardware Canvas",
                "Interactive CoSE & Physics Layouts",
                "Evidence Provenance Inspector Drawer",
                "Human Curator Verification Workspace",
                "Grounded AI Research Chat Dialogue"
            ]
        },
        {
            "name": "2. SERVICE & API TIER",
            "tech": "FastAPI 0.115+ • Python 3.14 • Async",
            "color": EMERALD,
            "items": [
                "Asynchronous RESTful Endpoints",
                "Pydantic v2 Strict Request/Response Schemas",
                "12-Stage Literature Mining Pipeline Worker",
                "NetworkX Topology & Centrality Engine",
                "Automated Gold-Standard Evaluation Runner",
                "Interactive OpenAPI Swagger Specs"
            ]
        },
        {
            "name": "3. RESOLUTION & DATA TIER",
            "tech": "SQLAlchemy 2.0 • SQLite FTS5 • Kew MPNS",
            "color": AMBER,
            "items": [
                "Kew MPNS Botanical Taxon Resolver",
                "MeSH & ICD-11 Symptom/Disease Mapping",
                "PubChem & ChEMBL Phytochemical Matcher",
                "Full-Text Inverted Search Index (FTS5)",
                "Cryptographic Verbatim Excerpt Anchor",
                "Persistent Curator Verification Ledger"
            ]
        },
        {
            "name": "4. GOVERNANCE & DEPLOYMENT",
            "tech": "Docker • GitHub Actions • Nagoya Rules",
            "color": PURPLE,
            "items": [
                "Nagoya Protocol Cultural Attribution",
                "IUCN Endangered Flora GPS Masking",
                "ConSEFS Ethnopharmacological Rules",
                "Strict Non-Diagnostic Scope Filter",
                "Multi-Stage Docker Container Build",
                "Complete Automated Unit & E2E Test Suite"
            ]
        }
    ]
    
    col_w = 405
    col_gap = 25
    start_x = 80
    start_y = 280
    card_h = 680
    
    for i, t in enumerate(tiers):
        cx = start_x + i * (col_w + col_gap)
        draw.rounded_rectangle([cx, start_y, cx + col_w, start_y + card_h], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=2)
        # Header banner
        draw.rounded_rectangle([cx, start_y, cx + col_w, start_y + 10], radius=4, fill=t["color"])
        
        f_tname = get_font(20, bold=True)
        draw.text((cx + 25, start_y + 35), t["name"], font=f_tname, fill=TEXT_WHITE)
        
        f_tech = get_font(15, bold=True)
        draw.text((cx + 25, start_y + 70), t["tech"], font=f_tech, fill=t["color"])
        
        draw.line([(cx + 25, start_y + 105), (cx + col_w - 25, start_y + 105)], fill=(30, 41, 59), width=2)
        
        f_item = get_font(17)
        for j, item in enumerate(t["items"]):
            iy = start_y + 130 + j * 80
            draw.rounded_rectangle([cx + 20, iy, cx + col_w - 20, iy + 65], radius=10, fill=(7, 11, 25), outline=(30, 41, 59), width=1)
            # Accent dot
            draw.ellipse([(cx + 35, iy + 26), (cx + 47, iy + 38)], fill=t["color"])
            draw.text((cx + 58, iy + 22), item, font=f_item, fill=TEXT_WHITE)

    img.save(out_path)
    print(f"Saved: {out_path}")

def create_pipeline_slide(out_path):
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    draw_header(draw, "12-Stage AI Literature Mining Pipeline", "Deterministic, verifiable transformation from unstructured scientific papers into evidence-linked triples")
    
    stages = [
        ("01", "Document Ingestion", "PyPDF parsing, Unicode normalization & ligature fixing"),
        ("02", "Paragraph Segmentation", "Classifies abstracts, ethnobotany & experimental sections"),
        ("03", "Scientific NER", "Identifies botanical taxa, symptoms, organs & compounds"),
        ("04", "Kew MPNS Normalization", "Resolves Latin binomials & historical vernacular synonyms"),
        ("05", "MeSH Condition Mapping", "Normalizes traditional indications to MeSH / ICD-11"),
        ("06", "Compound Linking", "Cross-references phytochemicals with PubChem / ChEMBL"),
        ("07", "Organ & Preparation", "Extracts plant anatomy (leaves, roots) & preparation form"),
        ("08", "Relation Formulation", "Generates structured Subject-Predicate-Object triples"),
        ("09", "Evidence Classification", "Assigns claim to one of 6 discrete scientific evidence tiers"),
        ("10", "Confidence Estimation", "Calculates calibrated confidence score (0.0 to 1.0)"),
        ("11", "Verbatim Excerpt Lock", "Permanently binds exact source sentence, DOI & citation"),
        ("12", "Curator Queue Staging", "Inserts into verification ledger for expert audit trail")
    ]
    
    # 3 rows of 4 stages
    card_w = 405
    card_h = 200
    gap_x = 25
    gap_y = 35
    start_x = 80
    start_y = 280
    
    for idx, (num, title, detail) in enumerate(stages):
        row = idx // 4
        col = idx % 4
        cx = start_x + col * (card_w + gap_x)
        cy = start_y + row * (card_h + gap_y)
        
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + card_h], radius=14, fill=CARD_BG, outline=CARD_BORDER, width=2)
        
        # Color accent based on stage type
        accent = CYAN if idx < 3 else (EMERALD if idx < 7 else (AMBER if idx < 10 else PURPLE))
        draw.rounded_rectangle([cx, cy, cx + 8, cy + card_h], radius=4, fill=accent)
        
        # Number badge
        f_num = get_font(18, bold=True)
        draw.rounded_rectangle([cx + 25, cy + 20, cx + 75, cy + 55], radius=8, fill=(7, 11, 25), outline=accent, width=1)
        draw.text((cx + 37, cy + 26), num, font=f_num, fill=accent)
        
        f_stitle = get_font(20, bold=True)
        draw.text((cx + 90, cy + 25), title, font=f_stitle, fill=TEXT_WHITE)
        
        f_sdet = get_font(16)
        # Wrap detail text
        words = detail.split()
        lines = []
        cur = []
        for w in words:
            cur.append(w)
            if len(" ".join(cur)) > 30:
                lines.append(" ".join(cur[:-1]))
                cur = [w]
        if cur:
            lines.append(" ".join(cur))
            
        for li, line in enumerate(lines):
            draw.text((cx + 25, cy + 75 + li * 26), line, font=f_sdet, fill=TEXT_MUTED)

    img.save(out_path)
    print(f"Saved: {out_path}")

def create_benchmarks_slide(out_path):
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    draw_header(draw, "Quantitative Evaluation & Benchmark Results", "Systematic validation against a manually curated gold-standard benchmark of 17 diverse ethnopharmacology papers")
    
    metrics = [
        ("Plant Taxon Recognition (NER) F1", "0.9697", "Precision: 1.000 • Recall: 0.941", "LLM Baseline: 0.63 (Richard-Bollans 2026)", EMERALD),
        ("Taxonomic Resolution Accuracy", "94.1%", "Kew MPNS / World Flora Online Binomial Match", "Manual Curator Gold Standard", CYAN),
        ("Medical Condition Extraction F1", "0.9375", "Precision: 1.000 • Recall: 0.882", "MeSH / ICD-11 Alignment", AMBER),
        ("Evidence Tier Classification F1", "0.8276", "Precision: 1.000 • Recall: 0.706", "6 Discrete Evidence Tiers", PURPLE),
        ("Relationship Tuple Extraction F1", "0.9375", "Precision: 1.000 • Recall: 0.882", "Subject-Predicate-Object Triples", CYAN),
        ("Source Attribution Accuracy", "94.1%", "Exact Verbatim Sentence & Paragraph Binding", "DOI & Voucher Provenance", EMERALD),
        ("Unsupported Claim Rate (Hallucination)", "0.00%", "Zero Unverified Assertions Permitted", "Standard LLMs: ~15-25% Hallucination", EMERALD)
    ]
    
    start_y = 270
    card_h = 75
    gap = 20
    
    for i, (name, score, detail, comp, color) in enumerate(metrics):
        cy = start_y + i * (card_h + gap)
        draw.rounded_rectangle([80, cy, 1840, cy + card_h], radius=14, fill=CARD_BG, outline=CARD_BORDER, width=2)
        # Left color line
        draw.rounded_rectangle([80, cy, 90, cy + card_h], radius=4, fill=color)
        
        # Name
        f_name = get_font(21, bold=True)
        draw.text((120, cy + 24), name, font=f_name, fill=TEXT_WHITE)
        
        # Score pill
        f_score = get_font(26, bold=True)
        draw.rounded_rectangle([920, cy + 14, 1080, cy + 60], radius=10, fill=(7, 11, 25), outline=color, width=2)
        # Center score
        bbox = f_score.getbbox(score)
        sw = bbox[2] - bbox[0]
        draw.text((1000 - sw // 2, cy + 22), score, font=f_score, fill=color)
        
        # Detail
        f_det = get_font(16)
        draw.text((1120, cy + 18), detail, font=f_det, fill=TEXT_MUTED)
        
        # Comparison
        f_comp = get_font(15, bold=True)
        draw.text((1120, cy + 44), f"Benchmark: {comp}", font=f_comp, fill=CYAN)

    img.save(out_path)
    print(f"Saved: {out_path}")

def create_ethics_slide(out_path):
    img = Image.new("RGB", (W, H), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    draw_header(draw, "Ethics, Nagoya Protocol & Cultural Stewardship", "Safeguarding indigenous intellectual property and enforcing strict conservation guardrails")
    
    principles = [
        {
            "title": "Nagoya Protocol on Access & Benefit-Sharing",
            "desc": "EthnoKG explicitly attributes cultural origin communities across Ayurveda, TCM, African Traditional Medicine, Amazonian Ethnobotany, and European Folk Medicine. Every empirical claim credits the original indigenous tradition and field survey source.",
            "color": EMERALD
        },
        {
            "title": "Biodiversity Conservation & GPS Masking",
            "desc": "To prevent unsustainable wild-harvesting and illegal poaching of endangered flora, high-resolution geospatial coordinates are automatically masked and generalized for all taxa listed under IUCN Red List and CITES Appendix I/II.",
            "color": CYAN
        },
        {
            "title": "Strict Non-Diagnostic Research Scope",
            "desc": "EthnoKG is built strictly for pharmacological literature discovery and scientific hypothesis generation. Traditional indications are recorded purely as empirical cultural observations, never as substitute clinical diagnosis or prescription advice.",
            "color": AMBER
        },
        {
            "title": "ConSEFS Scientific Rigor Standards",
            "desc": "Adheres to the ConSEFS consensus statement on best practice in ethnopharmacological research: requiring authentic botanical binomials, authenticated plant anatomical organs, verified extraction methods, and reproducible bibliographic vouchers.",
            "color": PURPLE
        }
    ]
    
    start_y = 280
    card_h = 140
    gap = 25
    
    for i, p in enumerate(principles):
        cy = start_y + i * (card_h + gap)
        draw.rounded_rectangle([80, cy, 1840, cy + card_h], radius=16, fill=CARD_BG, outline=CARD_BORDER, width=2)
        draw.rounded_rectangle([80, cy, 92, cy + card_h], radius=4, fill=p["color"])
        
        f_title = get_font(24, bold=True)
        draw.text((120, cy + 24), p["title"], font=f_title, fill=TEXT_WHITE)
        
        f_desc = get_font(18)
        words = p["desc"].split()
        lines = []
        cur = []
        for w in words:
            cur.append(w)
            if len(" ".join(cur)) > 115:
                lines.append(" ".join(cur[:-1]))
                cur = [w]
        if cur:
            lines.append(" ".join(cur))
            
        for li, line in enumerate(lines):
            draw.text((120, cy + 65 + li * 28), line, font=f_desc, fill=TEXT_MUTED)

    # Conclusion Banner
    draw.rounded_rectangle([80, 930, 1840, 1020], radius=16, fill=(15, 35, 30), outline=EMERALD, width=2)
    f_cb = get_font(22, bold=True)
    draw.text((140, 955), "EthnoKG: Bridging ancient empirical wisdom with cutting-edge computational intelligence for future medicine.", font=f_cb, fill=TEXT_WHITE)

    img.save(out_path)
    print(f"Saved: {out_path}")

def main():
    out_dir = os.path.join("video_production", "graphics")
    os.makedirs(out_dir, exist_ok=True)
    
    create_title_slide(os.path.join(out_dir, "01_title_card.png"))
    create_architecture_slide(os.path.join(out_dir, "02_architecture_diagram.png"))
    create_pipeline_slide(os.path.join(out_dir, "03_pipeline_diagram.png"))
    create_benchmarks_slide(os.path.join(out_dir, "08_evaluation_card.png"))
    create_ethics_slide(os.path.join(out_dir, "09_ethics_card.png"))
    print("All graphic slides generated successfully!")

if __name__ == "__main__":
    main()
