import time
import subprocess
import os
import sys
from playwright.sync_api import sync_playwright

def main():
    artifact_dir = r"C:\Users\vikas sharma\.gemini\antigravity\brain\5563155a-4601-4b4a-a804-896d16d512e1"
    os.makedirs(artifact_dir, exist_ok=True)

    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--host", "127.0.0.1", "--port", "8896"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    try:
        time.sleep(3)
        docs_url = "http://127.0.0.1:8896/docs"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 960})

            page.goto(docs_url, wait_until="networkidle", timeout=30000)
            time.sleep(2)

            # Capture Hero with Live Presets
            hero_presets_path = os.path.join(artifact_dir, "docs_dark_hero_presets.png")
            page.screenshot(path=hero_presets_path)
            print(f"Saved: {hero_presets_path}")

            # Open Snippet Modal
            page.locator("button:has-text('Snippets')").click()
            time.sleep(1)
            snippet_path = os.path.join(artifact_dir, "docs_dark_code_snippets_modal.png")
            page.screenshot(path=snippet_path)
            print(f"Saved: {snippet_path}")

            # Close modal with Esc
            page.keyboard.press("Escape")
            time.sleep(0.5)

            # Click a preset: e.g. Grounded RAG Assistant
            preset_btn = page.locator("button:has-text('Grounded RAG Assistant')")
            if preset_btn.is_visible():
                preset_btn.click()
                time.sleep(1.5)
                preset_focused_path = os.path.join(artifact_dir, "docs_dark_preset_focused.png")
                page.screenshot(path=preset_focused_path)
                print(f"Saved: {preset_focused_path}")

            browser.close()
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    main()
