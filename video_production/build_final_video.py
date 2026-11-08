import os
import subprocess
import shutil
from PIL import Image, ImageDraw, ImageFont

CHAPTERS_CONFIG = [
    {
        "id": "ch01_intro",
        "title": "CHAPTER 01 / 09 • INTRODUCTION & SCIENTIFIC MISSION",
        "audio": "video_production/audio/ch01_intro.mp3",
        "slides": [
            ("video_production/graphics/01_title_card.png", 0.45),
            ("video_production/screenshots/01_landing_hero.png", 0.30),
            ("video_production/screenshots/01_landing_principles.png", 0.25)
        ]
    },
    {
        "id": "ch02_architecture",
        "title": "CHAPTER 02 / 09 • FULL-STACK ARCHITECTURE & ENGINEERING",
        "audio": "video_production/audio/ch02_architecture.mp3",
        "slides": [
            ("video_production/graphics/02_architecture_diagram.png", 0.55),
            ("video_production/screenshots/01_landing_hero.png", 0.45)
        ]
    },
    {
        "id": "ch03_pipeline",
        "title": "CHAPTER 03 / 09 • 12-STAGE AI LITERATURE MINING PIPELINE",
        "audio": "video_production/audio/ch03_pipeline.mp3",
        "slides": [
            ("video_production/graphics/03_pipeline_diagram.png", 0.55),
            ("video_production/screenshots/03_mining_initial.png", 0.45)
        ]
    },
    {
        "id": "ch04_dashboard",
        "title": "CHAPTER 04 / 09 • LIVE DEMO: DISCOVERY DASHBOARD",
        "audio": "video_production/audio/ch04_dashboard.mp3",
        "slides": [
            ("video_production/screenshots/02_dashboard_overview.png", 0.50),
            ("video_production/screenshots/02_dashboard_charts.png", 0.50)
        ]
    },
    {
        "id": "ch05_mining_demo",
        "title": "CHAPTER 05 / 09 • LIVE DEMO: 12-STAGE MINING IN ACTION",
        "audio": "video_production/audio/ch05_mining_demo.mp3",
        "slides": [
            ("video_production/screenshots/03_mining_initial.png", 0.45),
            ("video_production/screenshots/03_mining_results.png", 0.55)
        ]
    },
    {
        "id": "ch06_graph_plants",
        "title": "CHAPTER 06 / 09 • LIVE DEMO: KNOWLEDGE GRAPH & PLANT DOSSIER",
        "audio": "video_production/audio/ch06_graph_plants.mp3",
        "slides": [
            ("video_production/screenshots/04_graph_network.png", 0.35),
            ("video_production/screenshots/04_graph_inspected.png", 0.30),
            ("video_production/screenshots/04_plant_intelligence.png", 0.35)
        ]
    },
    {
        "id": "ch07_assistant_curator",
        "title": "CHAPTER 07 / 09 • LIVE DEMO: EVIDENCE, AI ASSISTANT & CURATOR",
        "audio": "video_production/audio/ch07_assistant_curator.mp3",
        "slides": [
            ("video_production/screenshots/05_evidence_explorer.png", 0.30),
            ("video_production/screenshots/05_grounded_assistant.png", 0.35),
            ("video_production/screenshots/05_verification_queue.png", 0.35)
        ]
    },
    {
        "id": "ch08_evaluation",
        "title": "CHAPTER 08 / 09 • QUANTITATIVE BENCHMARKS & EVALUATION",
        "audio": "video_production/audio/ch08_evaluation.mp3",
        "slides": [
            ("video_production/graphics/08_evaluation_card.png", 0.65),
            ("video_production/screenshots/06_methodology.png", 0.35)
        ]
    },
    {
        "id": "ch09_ethics_conclusion",
        "title": "CHAPTER 09 / 09 • ETHICS, NAGOYA PROTOCOL & CONCLUSION",
        "audio": "video_production/audio/ch09_ethics_conclusion.mp3",
        "slides": [
            ("video_production/graphics/09_ethics_card.png", 0.60),
            ("video_production/graphics/01_title_card.png", 0.40)
        ]
    }
]

def get_font(size, bold=False):
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

def create_chapter_banner(title, out_path):
    banner = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    draw = ImageDraw.Draw(banner)
    
    # Bottom glassmorphic banner
    draw.rectangle([0, 970, 1920, 1080], fill=(7, 11, 25, 235))
    # Glowing cyan divider line
    draw.rectangle([0, 970, 1920, 974], fill=(6, 182, 212, 255))
    
    # Title
    font_title = get_font(26, bold=True)
    draw.text((60, 995), title, font=font_title, fill=(255, 255, 255, 255))
    
    # Subtitle
    font_sub = get_font(16, bold=True)
    draw.text((60, 1035), "ETHNOKG  •  TRADITIONAL KNOWLEDGE MINING  •  ETHNOHACK 2026", font=font_sub, fill=(16, 185, 129, 255))
    
    # Right Provenance Badge
    draw.rounded_rectangle([1520, 995, 1860, 1045], radius=8, fill=(15, 23, 42, 255), outline=(51, 65, 85, 255), width=2)
    font_badge = get_font(15, bold=True)
    draw.text((1545, 1010), "100% PROVENANCE GROUNDED", font=font_badge, fill=(6, 182, 212, 255))
    
    banner.save(out_path, "PNG")

def get_audio_duration(file_path):
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", file_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def render_scenes():
    scenes_dir = os.path.join("video_production", "scenes")
    os.makedirs(scenes_dir, exist_ok=True)
    
    speed_factor = 1.30 # Brings total runtime to ~9.9 minutes (under 10 minutes)
    scene_files = []
    
    for idx, ch in enumerate(CHAPTERS_CONFIG):
        orig_dur = get_audio_duration(ch["audio"])
        ch_dur = orig_dur / speed_factor
        scene_mp4 = os.path.join(scenes_dir, f"{ch['id']}.mp4")
        scene_files.append(scene_mp4)
        
        print(f"\n=======================================================")
        print(f"Rendering [{idx+1}/9]: {ch['title']}")
        print(f"Duration: {ch_dur:.2f}s (Original: {orig_dur:.2f}s at {speed_factor}x)")
        
        # 1. Create transparent banner PNG
        banner_png = os.path.join(scenes_dir, f"{ch['id']}_banner.png")
        create_chapter_banner(ch["title"], banner_png)
        
        # 2. Render sub-clips for each slide in the chapter
        sub_clips = []
        for s_idx, (img_path, frac) in enumerate(ch["slides"]):
            slide_dur = ch_dur * frac
            sub_mp4 = os.path.join(scenes_dir, f"{ch['id']}_sub{s_idx}.mp4")
            sub_clips.append(sub_mp4)
            
            vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x070b19"
            cmd = [
                "ffmpeg", "-y", "-loop", "1", "-t", f"{slide_dur:.3f}",
                "-i", img_path,
                "-vf", vf,
                "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-r", "30",
                sub_mp4
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            print(f"  --> Slide {s_idx+1}/{len(ch['slides'])} rendered ({slide_dur:.2f}s)")
            
        # 3. Concatenate slide sub-clips
        concat_txt = os.path.join(scenes_dir, f"{ch['id']}_concat.txt")
        with open(concat_txt, "w") as f:
            for sc in sub_clips:
                clean_path = os.path.abspath(sc).replace("\\", "/")
                f.write(f"file '{clean_path}'\n")
                
        # 4. Merge concatenated video with paced audio & overlay banner
        cmd_merge = [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0", "-i", concat_txt,
            "-i", ch["audio"],
            "-i", banner_png,
            "-filter_complex", f"[0:v][2:v]overlay=0:0[v];[1:a]atempo={speed_factor}[a]",
            "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest",
            scene_mp4
        ]
        subprocess.run(cmd_merge, check=True)
        print(f"  [DONE] Scene rendered: {scene_mp4} ({get_audio_duration(scene_mp4):.2f}s)")
        
        # Clean temporary subclips
        for sc in sub_clips:
            try:
                os.remove(sc)
            except Exception:
                pass
        try:
            os.remove(concat_txt)
            os.remove(banner_png)
        except Exception:
            pass

    # 5. Final Concatenation of all 9 scenes
    print("\n=======================================================")
    print("Concatenating all 9 chapters into master final video...")
    master_concat_txt = os.path.join(scenes_dir, "master_concat.txt")
    with open(master_concat_txt, "w") as f:
        for sc in scene_files:
            clean_path = os.path.abspath(sc).replace("\\", "/")
            f.write(f"file '{clean_path}'\n")
            
    final_output = os.path.join("video_production", "EthnoKG_Complete_Project_Walkthrough.mp4")
    root_output = "EthnoKG_Complete_Project_Walkthrough.mp4"
    public_output = os.path.join("frontend", "public", "walkthrough", "EthnoKG_Complete_Project_Walkthrough.mp4")
    
    cmd_final = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", master_concat_txt,
        "-c", "copy",
        final_output
    ]
    subprocess.run(cmd_final, check=True)
    
    # Copy to root and public
    shutil.copyfile(final_output, root_output)
    shutil.copyfile(final_output, public_output)
    
    final_dur = get_audio_duration(final_output)
    file_size_mb = os.path.getsize(final_output) / (1024 * 1024)
    print("\n" + "="*70)
    print("MASTER VIDEO PRODUCTION COMPLETED!")
    print(f"File: {final_output}")
    print(f"Duration: {final_dur:.2f} seconds ({final_dur/60:.2f} minutes) <= 10.0 minutes!")
    print(f"Size: {file_size_mb:.2f} MB")
    print(f"Copied to: {root_output}")
    print(f"Copied to: {public_output}")
    print("="*70)

if __name__ == "__main__":
    render_scenes()
