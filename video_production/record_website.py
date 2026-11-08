import os
import time
import math
from playwright.sync_api import sync_playwright

def smooth_scroll(page, target_y, duration_steps=25, step_delay=0.04):
    try:
        current_y = page.evaluate("() => window.scrollY")
        distance = target_y - current_y
        for i in range(1, duration_steps + 1):
            fraction = i / duration_steps
            t = (1 - math.cos(fraction * 3.14159265)) / 2
            y = current_y + distance * t
            page.evaluate(f"() => window.scrollTo(0, {y})")
            time.sleep(step_delay)
    except Exception as e:
        print(f"Scroll warning: {e}")

def record_demos():
    os.makedirs(os.path.join("video_production", "recordings"), exist_ok=True)
    os.makedirs(os.path.join("video_production", "screenshots"), exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
            headless=True
        )
        
        # Segment 4: Knowledge Graph & Plant Intelligence
        print("Recording Segment 4: Knowledge Graph & Plant Intelligence...")
        ctx4 = browser.new_context(
            record_video_dir="video_production/recordings",
            record_video_size={"width": 1920, "height": 1080},
            viewport={"width": 1920, "height": 1080}
        )
        page4 = ctx4.new_page()
        page4.goto("http://localhost:5173", wait_until="networkidle")
        page4.wait_for_timeout(1500)
        
        # Navigate to Knowledge Graph
        page4.click("button:has-text('Knowledge Graph')")
        page4.wait_for_timeout(4000)
        page4.screenshot(path="video_production/screenshots/04_graph_network.png")
        
        # Click on Canvas to interact with graph
        canvas = page4.query_selector("canvas, #cy, .cytoscape-container")
        if canvas:
            box = canvas.bounding_box()
            if box:
                page4.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page4.wait_for_timeout(1500)
                page4.mouse.click(box["x"] + box["width"] / 2 + 70, box["y"] + box["height"] / 2 - 40)
                page4.wait_for_timeout(2000)
                page4.screenshot(path="video_production/screenshots/04_graph_inspected.png")
                
        # Navigate to Plant Intelligence
        page4.click("button:has-text('Plant Intelligence')")
        page4.wait_for_timeout(3000)
        page4.screenshot(path="video_production/screenshots/04_plant_intelligence.png")
        
        # Search for Ashwagandha or Withania
        search_input = page4.query_selector("input[type='text'], input[placeholder*='Search']")
        if search_input:
            search_input.fill("Withania")
            page4.wait_for_timeout(1500)
            
        # Click view details / dossier if available
        dossier_btn = page4.query_selector("button:has-text('Dossier'), button:has-text('View'), button:has-text('Details'), button:has-text('Inspect')")
        if dossier_btn:
            dossier_btn.click()
            page4.wait_for_timeout(2000)
            page4.screenshot(path="video_production/screenshots/04_plant_dossier.png")
            
        smooth_scroll(page4, 400, duration_steps=20, step_delay=0.04)
        page4.wait_for_timeout(1500)
        ctx4.close()
        
        # Segment 5: Evidence, Assistant & Verification
        print("Recording Segment 5: Evidence Explorer, Assistant & Verification...")
        ctx5 = browser.new_context(
            record_video_dir="video_production/recordings",
            record_video_size={"width": 1920, "height": 1080},
            viewport={"width": 1920, "height": 1080}
        )
        page5 = ctx5.new_page()
        page5.goto("http://localhost:5173", wait_until="networkidle")
        page5.wait_for_timeout(1500)
        
        # Evidence tab
        page5.click("button:has-text('Evidence Explorer')")
        page5.wait_for_timeout(3000)
        page5.screenshot(path="video_production/screenshots/05_evidence_explorer.png")
        smooth_scroll(page5, 450, duration_steps=25, step_delay=0.04)
        page5.wait_for_timeout(2000)
        
        # Research Assistant tab
        page5.click("button:has-text('Research Assistant')")
        page5.wait_for_timeout(3000)
        page5.screenshot(path="video_production/screenshots/05_grounded_assistant.png")
        
        # Verification tab
        page5.click("button:has-text('Verification')")
        page5.wait_for_timeout(3000)
        page5.screenshot(path="video_production/screenshots/05_verification_queue.png")
        smooth_scroll(page5, 400, duration_steps=25, step_delay=0.04)
        page5.wait_for_timeout(2000)
        
        # Discovery Radar
        radar_btn = page5.query_selector("button:has-text('Discovery Radar')")
        if radar_btn:
            radar_btn.click()
            page5.wait_for_timeout(3000)
            page5.screenshot(path="video_production/screenshots/05_discovery_radar.png")
            
        ctx5.close()
        
        # Segment 6: Methodology & Sources
        print("Recording Segment 6: Methodology & Sources...")
        ctx6 = browser.new_context(
            record_video_dir="video_production/recordings",
            record_video_size={"width": 1920, "height": 1080},
            viewport={"width": 1920, "height": 1080}
        )
        page6 = ctx6.new_page()
        page6.goto("http://localhost:5173", wait_until="networkidle")
        page6.wait_for_timeout(1500)
        
        # Methodology
        page6.click("button:has-text('Methodology')")
        page6.wait_for_timeout(3000)
        page6.screenshot(path="video_production/screenshots/06_methodology.png")
        smooth_scroll(page6, 500, duration_steps=25, step_delay=0.04)
        page6.wait_for_timeout(2000)
        
        # Sources & Ethics
        page6.click("button:has-text('Sources & Ethics')")
        page6.wait_for_timeout(3000)
        page6.screenshot(path="video_production/screenshots/06_sources_ethics.png")
        smooth_scroll(page6, 500, duration_steps=25, step_delay=0.04)
        page6.wait_for_timeout(2000)
        
        ctx6.close()
        browser.close()
        print("Segments 4, 5, and 6 successfully captured!")

if __name__ == "__main__":
    record_demos()
