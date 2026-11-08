import time
import os
from playwright.sync_api import sync_playwright

artifact_dir = r"C:\Users\vikas sharma\.gemini\antigravity\brain\c08a3053-09d9-4e5f-9deb-234f94a4afd4"
base_url = "https://ethnokg-platform.onrender.com"

def main():
    print(f"Connecting to live production URL: {base_url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        # 1. Plants Slide Carousel Mode
        print("1. Capturing Plant Explorer in Slide Mode...")
        page.goto(f"{base_url}/plants", wait_until="networkidle")
        time.sleep(2)
        try:
            plant_slide = page.locator('main button[role="radio"]:has-text("Slide")')
            if plant_slide.is_visible():
                plant_slide.click()
                time.sleep(1.5)
            page.screenshot(path=os.path.join(artifact_dir, "verified_plants_slide.png"))
        except Exception as e:
            print("Plants slide error:", e)

        # 2. Evidence Explorer in Slide Deck Mode
        print("2. Capturing Evidence Explorer in Slide Mode...")
        page.goto(f"{base_url}/evidence", wait_until="networkidle")
        time.sleep(2)
        try:
            ev_slide = page.locator('main button[role="radio"]:has-text("Slide")')
            if ev_slide.is_visible():
                ev_slide.click()
                time.sleep(1.5)
            page.screenshot(path=os.path.join(artifact_dir, "verified_evidence_slide.png"))
        except Exception as e:
            print("Evidence slide error:", e)

        # 3. Evidence Explorer in Table Mode
        print("3. Capturing Evidence Explorer in Table Mode...")
        try:
            ev_table = page.locator('main button[role="radio"]:has-text("Table")')
            if ev_table.is_visible():
                ev_table.click()
                time.sleep(1.5)
            page.screenshot(path=os.path.join(artifact_dir, "verified_evidence_table.png"))
        except Exception as e:
            print("Evidence table error:", e)

        # 4. Verification in Curator Deck Mode
        print("4. Capturing Verification Workspace in Deck Mode...")
        page.goto(f"{base_url}/verification", wait_until="networkidle")
        time.sleep(2)
        try:
            ver_deck = page.locator('main button[role="radio"]:has-text("Deck")')
            if ver_deck.is_visible():
                ver_deck.click()
                time.sleep(1.5)
            page.screenshot(path=os.path.join(artifact_dir, "verified_verification_deck.png"))
        except Exception as e:
            print("Verification deck error:", e)

        browser.close()
        print("All visual verification captures saved successfully!")

if __name__ == "__main__":
    main()
