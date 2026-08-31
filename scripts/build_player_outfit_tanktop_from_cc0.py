#!/usr/bin/env python3
"""
build_player_outfit_tanktop_from_cc0.py — `tanktop` PLAYER_OUTFITS style,
all 6 PLAYER_OUTFIT_COLORS, sourced from female-character-sprite-creator's
"Clothes 6" (thin straps, clean scoop neckline, simple sleeveless body) —
picked by directly viewing the pack's clothing options, not by index
number.

Same crop/scale/tint pipeline as build_player_outfit_hoodie_from_cc0.py /
build_player_outfit_tshirt_from_cc0.py — see those scripts' own comments
for the FEMALE_BODY_BBOX crop and luminosity-tint reasoning.

Run with: python3 scripts/build_player_outfit_tanktop_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Body", "Clothes", "Clothes 6",
    "Color 1.png",
)
FORCE = "--force" in sys.argv

CANVAS = (480, 720)
SHARED_SCALE = 1.0
FEMALE_BODY_BBOX = (501, 500, 899, 1200)

TARGET_RGB = {
    "black": (35, 35, 38),
    "gray": (120, 120, 122),
    "navy": (28, 40, 74),
    "white": (232, 232, 235),
    "red": (168, 45, 45),
    "olive": (99, 105, 58),
}

src = Image.open(SRC).convert("RGBA")
crop = src.crop(FEMALE_BODY_BBOX)
crop = crop.resize(
    (int(crop.width * SHARED_SCALE), int(crop.height * SHARED_SCALE)), Image.LANCZOS
)

made = skipped = 0
for color_name, rgb in TARGET_RGB.items():
    out_path = os.path.join(ROOT, "characters", "player", "outfit", f"tanktop_{color_name}.png")
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue

    tinted = Image.new("RGBA", crop.size, (0, 0, 0, 0))
    src_px = crop.load()
    out_px = tinted.load()
    for yy in range(crop.height):
        for xx in range(crop.width):
            r, g, b, a = src_px[xx, yy]
            if a == 0:
                continue
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            lum = 0.35 + lum * 0.65
            out_px[xx, yy] = (
                min(255, int(rgb[0] * lum)),
                min(255, int(rgb[1] * lum)),
                min(255, int(rgb[2] * lum)),
                a,
            )

    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - tinted.width) // 2
    y = max(0, CANVAS[1] - tinted.height)
    canvas.alpha_composite(tinted, (x, y))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path)
    made += 1
    print(f"wrote tanktop_{color_name}")

print(f"made={made} skipped(existing)={skipped}")
