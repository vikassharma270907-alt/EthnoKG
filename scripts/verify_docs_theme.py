import time
import subprocess
import os
from playwright.sync_api import sync_playwright

def main():
    artifact_dir = r"C:\Users\vikas sharma\.gemini\antigravity\brain\5563155a-4601-4b4a-a804-896d16d512e1"
    os.makedirs(artifact_dir, exist_ok=True)

    import sys
    # Start local uvicorn server in a subprocess
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--host", "127.0.0.1", "--port", "8899"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    try:
        time.sleep(3) # Wait for server to boot
        docs_url = "http://127.0.0.1:8899/docs"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 960})

            print("Navigating to local /docs...")
            page.goto(docs_url, wait_until="networkidle", timeout=30000)
            time.sleep(2)

            # Take initial screenshot of Hero and Top Sections
            hero_path = os.path.join(artifact_dir, "docs_dark_hero.png")
            page.screenshot(path=hero_path)
            print(f"Saved hero screenshot: {hero_path}")

            # Scroll down to show Operations and Badges
            page.evaluate("window.scrollBy(0, 480)")
            time.sleep(1)
            operations_path = os.path.join(artifact_dir, "docs_dark_operations.png")
            page.screenshot(path=operations_path)
            print(f"Saved operations screenshot: {operations_path}")

            # Test filter: search for 'plants'
            search_input = page.locator("#endpoint-search")
            if search_input.is_visible():
                search_input.fill("plants")
                time.sleep(1)
                search_path = os.path.join(artifact_dir, "docs_dark_search_filter.png")
                page.screenshot(path=search_path)
                print(f"Saved search filter screenshot: {search_path}")

            # Test accent switcher: switch to Emerald Bio
            emerald_btn = page.locator(".accent-dot.emerald")
            if emerald_btn.is_visible():
                emerald_btn.click()
                time.sleep(1)
                emerald_path = os.path.join(artifact_dir, "docs_dark_emerald_accent.png")
                page.screenshot(path=emerald_path)
                print(f"Saved emerald accent screenshot: {emerald_path}")

            browser.close()
    finally:
        proc.terminate()
        proc.wait()
        print("Server terminated successfully.")

if __name__ == "__main__":
    main()
