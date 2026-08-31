#!/usr/bin/env python3
"""
build_civilian_male_portraits_from_cc0.py — replaces the flat placeholder
civilian_male portraits (public/assets/characters/portraits/) with real art
bust-cropped from public/assets/cc0-library/vn-portraits/vn-characters-cabbit
("VN Characters" by cabbit KusSv, CC0,
https://opengameart.org/content/vn-characters).

civilian_male had ZERO real art anywhere in this project before this —
every VN-style pack pulled in up to this point (girl-sprites-premium,
og-visual-novel-style-characters, post-apocalyptic-portraits) was either
female-only or full-helmet gender-neutral. This pack's "Visiter_C" (a
male-presenting character, tank top + trousers, fully covered) and
"Student--Wide_Smile" (a second male-presenting character, T-shirt +
overalls, fully covered) are both real, distinct, already-flattened PNGs —
no PSD compositing needed.

Run with: python3 scripts/build_civilian_male_portraits_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "vn-characters-cabbit", "extracted",
    "VN Characters (by cabbit KusSv)",
)
FORCE = "--force" in sys.argv

MAPPING = {
    "civilian_male_01": "VN_Visiter_C.png",
    "civilian_male_02": "VN_Student--Wide_Smile.png",
}

made = skipped = missing = 0
for target_name, src_name in MAPPING.items():
    out_path = os.path.join(ROOT, "characters", "portraits", f"{target_name}.png")
    src_path = os.path.join(SRC, src_name)
    if not os.path.exists(src_path):
        print(f"MISSING source for {target_name}: {src_path}")
        missing += 1
        continue
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue
    src = Image.open(src_path).convert("RGBA")
    w, h = src.size
    # bust crop: top ~22% captures head+shoulders on these tall full-body
    # illustrations (same fraction as the madameberry pack, similar
    # proportions)
    crop = src.crop((0, 0, w, int(h * 0.22)))
    cw, ch = crop.size
    scale = 512 / cw
    crop = crop.resize((512, int(ch * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    y = max(0, (512 - crop.height) // 3)
    canvas.alpha_composite(crop, (0, y))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path)
    made += 1
    print(f"wrote {target_name} ({crop.width}x{crop.height} crop)")

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
