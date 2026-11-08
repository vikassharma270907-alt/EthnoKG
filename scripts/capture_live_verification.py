import time
import os
from playwright.sync_api import sync_playwright

artifact_dir = r"C:\Users\vikas sharma\.gemini\antigravity\brain\7dd7b11b-d960-4cbb-966e-75e27db8aab8"
docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots"))
base_url = "https://ethnokg-platform.onrender.com"

def save_both(page, filename):
    os.makedirs(artifact_dir, exist_ok=True)
    os.makedirs(docs_dir, exist_ok=True)
    page.screenshot(path=os.path.join(artifact_dir, filename))
    page.screenshot(path=os.path.join(docs_dir, filename))

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        # 1. Landing Header Slide Mode
        print("1. Capturing Landing in Slide Mode...")
        page.goto(base_url, wait_until="networkidle")
        time.sleep(2)
        save_both(page, "live_landing_slide.png")

        # 2. Switch to List Mode and open Mega Menu
        print("2. Capturing Mega Menu in List Mode...")
        try:
            list_btn = page.locator('nav button[role="radio"]', has_text="List")
            list_btn.click()
            time.sleep(1)
            page.locator("#mega-menu-trigger").click()
            time.sleep(1.5)
            save_both(page, "live_mega_menu_open.png")
        except Exception as e:
            print("Mega menu note:", e)

        # 3. Open Command Palette via search trigger
        print("3. Capturing Command Palette...")
        try:
            page.keyboard.press("Escape")
            time.sleep(0.5)
            page.locator("button", has_text="Search...").click()
            time.sleep(1)
            save_both(page, "live_command_palette.png")
            page.keyboard.press("Escape")
            time.sleep(0.5)
        except Exception as e:
            print("Command palette note:", e)

        # 4. Navigate to Plants page
        print("4. Capturing Plant Explorer Grid Mode...")
        page.goto(f"{base_url}/plants", wait_until="networkidle")
        time.sleep(2)
        save_both(page, "live_plants_grid.png")

        # 5. Switch to Slide Carousel Mode in Plant Explorer
        print("5. Capturing Plant Explorer in Slide Carousel Mode...")
        try:
            # Look specifically inside main content for the Plant display mode radiogroup
            plant_slide_btn = page.locator('main button[role="radio"]:has-text("Slide")')
            if plant_slide_btn.is_visible():
                plant_slide_btn.click()
                time.sleep(1.5)
                save_both(page, "live_plants_slide_carousel.png")
            else:
                print("Plant slide button not visible")
        except Exception as e:
            print("Slide mode note:", e)

        # 6. Switch to Table Mode in Plant Explorer
        print("6. Capturing Plant Explorer in Table Mode...")
        try:
            plant_table_btn = page.locator('main button[role="radio"]:has-text("Table")')
            if plant_table_btn.is_visible():
                plant_table_btn.click()
                time.sleep(1.5)
                save_both(page, "live_plants_table_mode.png")
            else:
                print("Plant table button not visible")
        except Exception as e:
            print("Table mode note:", e)

        # 7. Knowledge Graph Page
        print("7. Capturing Knowledge Graph...")
        try:
            page.goto(f"{base_url}/graph", wait_until="networkidle")
            time.sleep(2.5)
            save_both(page, "live_knowledge_graph.png")
        except Exception as e:
            print("Graph capture note:", e)

        # 8. Discovery Radar & Nagoya Protocol Ledger
        print("8. Capturing Discovery Radar...")
        try:
            page.goto(f"{base_url}/discovery", wait_until="networkidle")
            time.sleep(2)
            save_both(page, "live_discovery_radar.png")
        except Exception as e:
            print("Discovery capture note:", e)

        # 9. Research Assistant Page
        print("9. Capturing Research Assistant...")
        try:
            page.goto(f"{base_url}/assistant", wait_until="networkidle")
            time.sleep(2)
            save_both(page, "live_research_assistant.png")
        except Exception as e:
            print("Assistant capture note:", e)

        browser.close()
        print("All captures successfully saved!")

if __name__ == "__main__":
    main()
