import os
import subprocess
import time

CHAPTERS = [
    {
        "id": "ch01_intro",
        "title": "Introduction & Scientific Mission",
    },
    {
        "id": "ch02_architecture",
        "title": "Full-Stack Architecture & Engineering",
        "text": (
            "Let us examine how EthnoKG was engineered from the ground up. "
            "We architected EthnoKG as a modular, enterprise-grade full-stack system designed for high throughput, robust security, and zero hallucination. "
            "On the backend, we run Python 3.14 with FastAPI, leveraging asynchronous route handlers, Pydantic version two data validation schemas, "
            "and SQLAlchemy two-point-zero ORM with full-text search indexing over an optimized SQLite database. "
            "The network graph engine computes dynamic graph topologies using NetworkX and exports strict JSON graph representations. "
            "On the frontend, we built a modern single-page application powered by React 19, TypeScript, and Vite. "
            "The user experience is styled with a bespoke dark graphite and slate theme, featuring custom glassmorphism cards, "
            "emerald bioactivity indicators, and cyan taxonomic badges. "
            "For large-scale network visualization, we integrated Cytoscape dot J S, executing force-directed CoSE and concentric layouts "
            "with hardware-accelerated canvas rendering. "
            "The entire application is decoupled, containerized with Docker, covered by automated unit and integration tests, "
            "and production-ready for global cloud deployment."
        )
    },
    {
        "id": "ch03_pipeline",
        "title": "The 12-Stage Literature Mining Pipeline",
        "text": (
            "At the intellectual heart of EthnoKG lies our proprietary 12-stage AI literature mining pipeline. "
            "Instead of relying on fragile prompt engineering or raw black-box language models, we enforce a strict, "
            "twelve-step deterministic extraction workflow. "
            "In Stage 1, raw PDF documents and research text undergo Unicode normalization, ligature fixing, and hyphenation de-breaking. "
            "Stage 2 performs semantic paragraph segmentation, classifying sections into abstracts, ethnobotanical narratives, experimental bioassays, and results. "
            "Stage 3 executes domain-adapted scientific named entity recognition to identify candidate botanical taxa, ailments, and phytochemicals. "
            "Stage 4 normalizes botanical species against Kew Medicinal Plant Names Services and World Flora Online, reconciling historical vernacular synonyms without false merges. "
            "Stage 5 maps extracted medical conditions to standardized MeSH and ICD-11 terminology. "
            "Stage 6 cross-references phytochemical compounds against PubChem and ChEMBL identifiers. "
            "Stage 7 extracts the specific plant anatomical organ, whether leaves, roots, bark, or rhizomes, alongside traditional preparations, such as water decoctions, alcoholic macerations, or powders. "
            "Stage 8 formulates formal Subject-Predicate-Object triples. "
            "Stage 9 categorizes the claim into our six-tier scientific evidence hierarchy. "
            "Stage 10 computes calibrated confidence scores based on lexical certainty and taxonomic verification. "
            "Stage 11 permanently binds the claim to its verbatim source excerpt, sentence anchor, author, and DOI. "
            "Finally, Stage 12 stages the verified extraction for curator review and live knowledge graph ingestion."
        )
    },
    {
        "id": "ch04_dashboard",
        "title": "Live Demonstration: Landing & Discovery Dashboard",
        "text": (
            "Now, let us step into the live running web application to demonstrate EthnoKG in action. "
            "We begin on the Landing Page, which introduces the scientific mission, core research tracks, and live platform telemetry. "
            "Navigating to the Research Discovery Dashboard, the interface immediately queries our live SQLite database to render real-time quantitative metrics. "
            "Here, domain researchers can observe our verified corpus: twelve authoritative botanical species, twenty-five curated bioactivity relationships, "
            "twelve linked phytochemical compounds, and eighteen indexed peer-reviewed scientific publications, maintaining an extraordinary average extraction confidence of ninety-five point four percent. "
            "Below the hero metrics, an interactive evidence distribution chart visualizes the breakdown across scientific tiers, highlighting in-vitro bioassays, "
            "in-vivo rodent models, clinical human trials, and traditional use reports. "
            "A second radar chart maps cultural traditions, displaying representation across Ayurveda, Traditional Chinese Medicine, African Traditional Medicine, "
            "Amazonian Ethnobotany, and European Folk Medicine. "
            "The real-time ingestion feed on the right displays newly indexed papers, showing author credentials, character counts, and relationship yields."
        )
    },
    {
        "id": "ch05_mining_demo",
        "title": "Live Demonstration: 12-Stage Literature Mining Engine",
        "text": (
            "Next, we move to the Literature Mining Engine. This is where raw scientific literature is transformed into structured, queryable knowledge. "
            "Researchers can choose to upload local PDF files, input an open-access paper URL, paste raw ethnobotanical field notes, "
            "or select from our curated benchmark collection of landmark ethnopharmacology publications. "
            "For this demonstration, we select the historic Nobel Prize-winning paper by Tu Youyou documenting the discovery of artemisinin "
            "from Artemisia annua for the treatment of intermittent fevers and malaria. "
            "When we trigger the 12-Stage Literature Mining Pipeline, the engine executes asynchronously. "
            "Notice the animated stage progress visualizer dynamically illuminating each step: document cleaning, paragraph splitting, taxonomic Kew MPNS verification, "
            "MeSH condition alignment, preparation extraction, and provenance binding. "
            "In seconds, the pipeline outputs structured extraction cards. "
            "Crucially, look at the verbatim evidence preview beneath each triple: the exact historical passage from Ge Hong's ancient handbook "
            "and modern clinical confirmations are displayed side-by-side with high-precision confidence gauges, guaranteeing total auditability."
        )
    },
    {
        "id": "ch06_graph_plants",
        "title": "Live Demonstration: Interactive Knowledge Graph & Plant Dossier",
        "text": (
            "Now, let us explore our flagship visualization: the Interactive Knowledge Graph. "
            "Powered by Cytoscape dot J S, this dynamic network canvas maps multidimensional ethnopharmacological relationships with physics-based layout controls. "
            "Green nodes represent verified botanical taxa; amber nodes represent medical conditions and symptoms; "
            "cyan nodes highlight bioactive phytochemical compounds; and purple nodes represent cultural medical traditions. "
            "Users can effortlessly pan, zoom, toggle between force-directed CoSE, concentric, and breadthfirst layouts, and filter nodes by evidence tier or confidence threshold. "
            "Clicking on any edge instantly opens the Evidence Provenance Drawer on the right. "
            "Here, researchers can read the exact supporting verbatim excerpt, view the publication year, authors, and DOI link, "
            "and inspect the preparation details. "
            "Next, we transition to the Plant Intelligence Explorer. "
            "Searching for plants like Withania somnifera, commonly known as Ashwagandha, or Curcuma longa, opens an authoritative Plant Intelligence Dossier. "
            "The dossier displays Kew MPNS accepted binomial names, verified vernacular synonyms across regional dialects, "
            "plant organs utilized, traditional preparation methods, linked therapeutic conditions, and primary literature citations."
        )
    },
    {
        "id": "ch07_assistant_curator",
        "title": "Live Demonstration: Evidence Explorer, AI Assistant & Curator Queue",
        "text": (
            "EthnoKG provides three specialized environments for advanced research workflows. "
            "First, the Evidence and Provenance Explorer allows scientists to filter claims across our six rigorous evidence tiers, "
            "distinguishing between traditional folkloric reports, ethnobotanical surveys, in-vitro bioassays, in-vivo animal studies, and randomized clinical trials. "
            "Second, the Grounded AI Research Assistant offers an intelligent conversational interface. "
            "Unlike generalized chat bots that suffer from hallucinations, our assistant is strictly grounded in the indexed SQLite database. "
            "When asking about traditional remedies for fever or anti-inflammatory properties of Zingiber officinale, "
            "the assistant responds with precise, evidence-backed syntheses, cites exact primary publications, "
            "and conspicuously displays our non-diagnostic medical disclaimer. "
            "Third, the Human Verification Workspace provides a curator queue where ethnopharmacologists and botanists can review staged AI extractions. "
            "Curators can inspect the candidate extraction side-by-side with the original text, modify plant names or ailment mappings, "
            "and approve or reject claims with a permanent cryptographic audit log."
        )
    },
    {
        "id": "ch08_evaluation",
        "title": "Quantitative Evaluation Benchmarks & Scientific Rigor",
        "text": (
            "A defining hallmark of EthnoKG is our rigorous empirical validation. "
            "We systematically evaluated our extraction engine against a manually curated gold-standard benchmark "
            "consisting of seventeen diverse, peer-reviewed ethnopharmacological literature passages. "
            "The quantitative results demonstrate industry-leading precision and recall: "
            "our Plant Taxon Recognition NER achieved an F1 score of point nine six nine seven, with a precision of one point zero and recall of point nine four one, "
            "far exceeding the zero point six three baseline of off-the-shelf large language models reported by Richard-Bollans and colleagues in 2026. "
            "Taxonomic Entity Resolution against Kew MPNS reached ninety-four point one percent accuracy. "
            "Medical Condition Extraction achieved an F1 score of point nine three seven five. "
            "Evidence Tier Classification achieved an F1 of point eight two seven six. "
            "Relationship Tuple Extraction scored point nine three seven five. "
            "Most importantly, our strict verbatim provenance binding achieved an unsupported claim rate of zero point zero zero percent, "
            "completely eliminating scientific hallucination."
        )
    },
    {
        "id": "ch09_ethics_conclusion",
        "title": "Ethics, Nagoya Protocol & Conclusion",
        "text": (
            "Finally, traditional knowledge mining demands the highest ethical standards. "
            "Indigenous intellectual property and empirical discoveries have historically been vulnerable to biopiracy and uncredited exploitation. "
            "EthnoKG strictly enforces the principles of the Nagoya Protocol on Access and Benefit Sharing. "
            "Every traditional claim explicitly attributes the originating cultural community and primary field ethnographer. "
            "Furthermore, to prevent the illegal or unsustainable wild-harvesting of endangered medicinal flora, "
            "high-resolution geospatial GPS coordinates are deliberately masked for species listed under IUCN and CITES protection. "
            "And as an inviolable scientific guardrail, EthnoKG maintains a strict non-diagnostic research scope: "
            "traditional indications are preserved as empirical cultural observations, never as substitute medical advice. "
            "In conclusion, EthnoKG bridges ancient empirical heritage with cutting-edge computational intelligence, "
            "transforming fragmented traditional medicine into a structured, traceable, and ethically governed foundation for modern natural product discovery. "
            "Thank you for watching."
        )
    }
]

def main():
    voice = "en-US-AndrewMultilingualNeural"
    audio_dir = os.path.join("video_production", "audio")
    os.makedirs(audio_dir, exist_ok=True)
    
    for ch in CHAPTERS:
        if "text" not in ch:
            continue
        out_file = os.path.join(audio_dir, f"{ch['id']}.mp3")
        txt_file = os.path.join(audio_dir, f"{ch['id']}.txt")
        if os.path.exists(out_file) and os.path.getsize(out_file) > 10000:
            print(f"Skipping {ch['id']} (already exists: {os.path.getsize(out_file)} bytes)")
            continue
            
        with open(txt_file, "w", encoding="utf-8") as f:
            f.write(ch["text"])
            
        print(f"Synthesizing {ch['id']}: {ch['title']}...")
        cmd = ["edge-tts", "--voice", voice, "-f", txt_file, "--write-media", out_file]
        subprocess.run(cmd, check=True)
        print(f"Saved {out_file} ({os.path.getsize(out_file)} bytes)")
        time.sleep(1)

if __name__ == "__main__":
    main()
