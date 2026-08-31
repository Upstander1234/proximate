#!/usr/bin/env python3
"""
build_player_necklace_from_cc0.py — a 7th player-customization axis, same
standing operator instruction as glasses/earrings ("more customization
options = better, keep adding them as you come upon them").

Source: female-character-sprite-creator's own "Accessory/Necklace" folder —
14 numbered styles exist; 4 were picked as genuinely, visually distinct and
secular (a small cross pendant, Necklace 4, was deliberately skipped to
avoid the appearance of favoring one specific religious symbol with no
equivalent representation for others; Necklace 3, a second wrapped-scarf
silhouette near-identical in shape to Necklace 2, was skipped as a
near-duplicate rather than a genuinely distinct style):
  - `heart`   <- Necklace 1: a small red heart charm on a thin chain
  - `scarf`   <- Necklace 2: a chunky wrapped/knotted scarf around the neck
                 — visually the most different of the four (not a thin
                 chain at all), included for real variety
  - `pendant` <- Necklace 5: a plain teardrop gem pendant on a thin chain
  - `shell`   <- Necklace 12: a scallop-shell pendant with two small beads

POSITIONING — same native source-to-canvas offset as earrings
(canvas_x = source_x - 460, canvas_y = source_y - 480), no override: this
pack's own Necklace folder sits on the same coordinate system as the base
body (confirmed the same way earrings/glasses were confirmed against this
pack's Body/Clothes crop).

Same luminosity-based tinting as every other player-layer script.

Run with: python3 scripts/build_player_necklace_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
NECK_DIR = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Accessory", "Necklace",
)
FORCE = "--force" in sys.argv

CANVAS = (480, 720)
OFFSET_X, OFFSET_Y = -460, -480

TARGET_RGB = {
    "black": (35, 35, 38),
    "gray": (120, 120, 122),
    "navy": (28, 40, 74),
    "white": (232, 232, 235),
    "red": (168, 45, 45),
    "olive": (99, 105, 58),
}

STYLES = {
    "heart": os.path.join(NECK_DIR, "Necklace 1", "Color 1.png"),
    "scarf": os.path.join(NECK_DIR, "Necklace 2", "Color 1.png"),
    "pendant": os.path.join(NECK_DIR, "Necklace 5", "Color 1.png"),
    "shell": os.path.join(NECK_DIR, "Necklace 12", "Color 1.png"),
}

made = skipped = missing = 0
for style, src_path in STYLES.items():
    if not os.path.exists(src_path):
        print(f"MISSING source for {style}: {src_path}")
        missing += 1
        continue

    src = Image.open(src_path).convert("RGBA")
    bbox = src.getbbox()
    crop = src.crop(bbox)

    for color_name, rgb in TARGET_RGB.items():
        out_path = os.path.join(ROOT, "characters", "player", "necklaces", f"{style}_{color_name}.png")
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
        x = bbox[0] + OFFSET_X
        y = bbox[1] + OFFSET_Y
        canvas.alpha_composite(tinted, (x, y))

        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        canvas.save(out_path)
        made += 1
        print(f"wrote {style}_{color_name}")

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
