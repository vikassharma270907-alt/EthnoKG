import time
import subprocess
import os
import sys
from playwright.sync_api import sync_playwright

def main():
    artifact_dir = r"C:\Users\vikas sharma\.gemini\antigravity\brain\5563155a-4601-4b4a-a804-896d16d512e1"
    os.makedirs(artifact_dir, exist_ok=True)

    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--host", "127.0.0.1", "--port", "8898"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    try:
        time.sleep(3)
        docs_url = "http://127.0.0.1:8898/docs"

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1440, "height": 960})

            page.goto(docs_url, wait_until="networkidle", timeout=30000)
            time.sleep(2)

            # Click on the first endpoint (/api/dashboard/stats) to expand it
            op = page.locator(".swagger-ui .opblock-summary").first
            op.click()
            time.sleep(1)

            # Click Try it out
            try_btn = page.locator(".swagger-ui .btn.try-out__btn").first
            if try_btn.is_visible():
                try_btn.click()
                time.sleep(0.5)

            # Click Execute
            exec_btn = page.locator(".swagger-ui .btn.execute").first
            if exec_btn.is_visible():
                exec_btn.click()
                time.sleep(1.5)

            expanded_path = os.path.join(artifact_dir, "docs_dark_expanded_execute.png")
            page.screenshot(path=expanded_path)
            print(f"Saved expanded execute screenshot: {expanded_path}")

            browser.close()
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    main()
