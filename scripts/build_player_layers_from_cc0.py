#!/usr/bin/env python3
"""
build_player_layers_from_cc0.py — replaces a SUBSET of the flat-color
placeholder player portrait layers (public/assets/characters/player/{hair,eyes})
with real CC0 art assembled from public/assets/cc0-library/modular-character-kenney
(Kenney's "Modular character pack", CC0, https://opengameart.org/content/modular-character-pack).

Scope, stated honestly: this script does HAIR (48 files: 8 styles x 6 colors)
and 4 of 6 EYE colors. It deliberately does NOT touch base/ or outfit/ —
see the README this run also updates for why (no suitable source art was
found in the downloaded packs for a full-body base or for six visually
distinct garment TYPES, only garment COLORS on one generic silhouette).

The Kenney pack's hair pieces have no style label of their own (files are
named e.g. "blackMan1.png".."blackMan8.png", "blackWoman1.png".."blackWoman6.png",
arbitrary numbering) — the STYLE->file mapping below was chosen by visually
reading a sample of each file (Read tool, Black color folder) and picking
the closest silhouette match per target style name. This is a best-effort
visual match, not a literal render of "a braid" or "a bun" — a human pass
should look at the output and re-map any entry that reads wrong.

Run with: python3 scripts/build_player_layers_from_cc0.py [--force]
Safe to re-run: skips a target file that already exists unless --force.
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(ROOT, "cc0-library", "modular-character-kenney", "PNG")
FORCE = "--force" in sys.argv

PORTRAIT_W, PORTRAIT_H = 480, 720

# style -> source hair filename stem (color folder name is prefixed separately)
HAIR_STYLE_SOURCE = {
    "short":    "Man1",
    "buzzed":   "Man3",
    "curly":    "Man4",
    "ponytail": "Woman1",
    "long":     "Woman2",
    "halfup":   "Woman3",
    "braided":  "Woman5",
    "bun":      "Woman6",
}
# target color -> (Kenney hair color folder name, filename prefix tag)
HAIR_COLOR_FOLDER = {
    "black": ("Black", "black"), "brown": ("Brown 1", "brown1"), "blonde": ("Blonde", "blonde"),
    "red": ("Red", "red"), "auburn": ("Brown 2", "brown2"), "gray": ("Grey", "grey"),
}
# target eye color -> Kenney eye source filename (only colors with a clean
# match are included; hazel/amber have no good source and are left as the
# existing flat-color placeholder)
EYE_COLOR_SOURCE = {
    "brown": "eyeBrown_large.png",
    "blue": "eyeBlue_large.png",
    "green": "eyeGreen_large.png",
    "gray": "eyeBlack_large.png",  # closest available stand-in, not exact
}

made = skipped = missing = 0

def paste_hair(style, color):
    global made, skipped, missing
    out_path = os.path.join(ROOT, "characters", "player", "hair", f"{style}_{color}.png")
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        return
    folder, color_tag = HAIR_COLOR_FOLDER[color]
    stem = HAIR_STYLE_SOURCE[style]
    src_path = os.path.join(SRC, "Hair", folder, f"{color_tag}{stem}.png")
    if not os.path.exists(src_path):
        print(f"MISSING source for hair {style}_{color}: {src_path}")
        missing += 1
        return
    src = Image.open(src_path).convert("RGBA")
    # scale to a consistent width, keep aspect ratio, anchor top-center
    target_w = 300
    scale = target_w / src.width
    target_h = int(src.height * scale)
    src = src.resize((target_w, target_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (PORTRAIT_W, PORTRAIT_H), (0, 0, 0, 0))
    x = (PORTRAIT_W - target_w) // 2
    y = 20
    canvas.alpha_composite(src, (x, y))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path)
    made += 1

def paste_eyes(color):
    global made, skipped, missing
    out_path = os.path.join(ROOT, "characters", "player", "eyes", f"{color}.png")
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        return
    src_path = os.path.join(SRC, "Face", "Eyes", EYE_COLOR_SOURCE[color])
    if not os.path.exists(src_path):
        print(f"MISSING source for eyes {color}: {src_path}")
        missing += 1
        return
    src = Image.open(src_path).convert("RGBA")
    eye_w, eye_h = 34, 26
    eye = src.resize((eye_w, eye_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (PORTRAIT_W, PORTRAIT_H), (0, 0, 0, 0))
    band_y0, band_y1 = 150, 190
    cy = band_y0 + (band_y1 - band_y0 - eye_h) // 2
    canvas.alpha_composite(eye, (170, cy))
    canvas.alpha_composite(eye, (480 - 170 - eye_w, cy))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path)
    made += 1

for style in HAIR_STYLE_SOURCE:
    for color in HAIR_COLOR_FOLDER:
        paste_hair(style, color)

for color in EYE_COLOR_SOURCE:
    paste_eyes(color)

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
