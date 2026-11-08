import time
import os
from playwright.sync_api import sync_playwright

artifact_dir = r"C:\Users\vikas sharma\.gemini\antigravity\brain\76540095-b0da-4692-aaed-89aab89f08f1"

def main():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        page = b.new_page(viewport={"width": 1440, "height": 900})
        page.goto("https://ethnokg-platform.onrender.com", wait_until="networkidle")
        time.sleep(2)

        # 1. Click Plant Intelligence
        print("Navigating to Plant Intelligence...")
        page.locator("button", has_text="Plant Intelligence").first.click()
        time.sleep(3)
        p1 = os.path.join(artifact_dir, "ethnokg_live_plant_explorer_interactive.png")
        page.screenshot(path=p1)
        print("Saved:", p1)

        # 2. Click Knowledge Graph
        print("Navigating to Knowledge Graph...")
        page.locator("button", has_text="Knowledge Graph").first.click()
        time.sleep(4)
        p2 = os.path.join(artifact_dir, "ethnokg_live_graph_interactive.png")
        page.screenshot(path=p2)
        print("Saved:", p2)

        # 3. Click Discovery Radar
        print("Navigating to Discovery Radar...")
        page.locator("button", has_text="Discovery Radar").first.click()
        time.sleep(3)
        p3 = os.path.join(artifact_dir, "ethnokg_live_radar_interactive.png")
        page.screenshot(path=p3)
        print("Saved:", p3)

        b.close()
        print("All interactive tab screenshots captured successfully!")

if __name__ == "__main__":
    main()
