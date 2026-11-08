import time
import os
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\vikas sharma\.gemini\antigravity\brain\76540095-b0da-4692-aaed-89aab89f08f1"
BASE_URL = "https://ethnokg-platform.onrender.com"

def run():
    print(f"Connecting Playwright to live URL: {BASE_URL}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. Landing Page
        print("Capturing Landing Page...")
        page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
        time.sleep(2)
        landing_path = os.path.join(ARTIFACT_DIR, "ethnokg_live_landing_v2.png")
        page.screenshot(path=landing_path, full_page=False)
        print(f"Saved: {landing_path}")

        # 2. Plant Explorer with Taxon Resolver
        print("Navigating to Plant Explorer...")
        page.goto(f"{BASE_URL}/plants", wait_until="networkidle", timeout=30000)
        time.sleep(2)
        plant_path = os.path.join(ARTIFACT_DIR, "ethnokg_live_plant_explorer_v2.png")
        page.screenshot(path=plant_path, full_page=False)
        print(f"Saved: {plant_path}")

        # Test resolving Ashwagandha
        try:
            print("Interacting with Taxon Resolver for Ashwagandha...")
            page.fill("input[placeholder*='folk or vernacular name']", "Ashwagandha")
            page.click("button:has-text('Resolve Taxon')")
            time.sleep(2)
            resolved_path = os.path.join(ARTIFACT_DIR, "ethnokg_live_taxon_resolved.png")
            page.screenshot(path=resolved_path, full_page=False)
            print(f"Saved: {resolved_path}")
        except Exception as e:
            print(f"Resolver interaction notice: {e}")

        # 3. Knowledge Graph Page
        print("Navigating to Knowledge Graph...")
        page.goto(f"{BASE_URL}/graph", wait_until="networkidle", timeout=30000)
        time.sleep(3)
        graph_path = os.path.join(ARTIFACT_DIR, "ethnokg_live_graph_cache_v2.png")
        page.screenshot(path=graph_path, full_page=False)
        print(f"Saved: {graph_path}")

        # 4. Reverse Pharmacology Discovery Radar
        print("Navigating to Discovery Radar...")
        page.goto(f"{BASE_URL}/discovery", wait_until="networkidle", timeout=30000)
        time.sleep(3)
        radar_path = os.path.join(ARTIFACT_DIR, "ethnokg_live_discovery_radar_v2.png")
        page.screenshot(path=radar_path, full_page=False)
        print(f"Saved: {radar_path}")

        browser.close()
        print("Live screenshot capture completed successfully!")

if __name__ == "__main__":
    run()
