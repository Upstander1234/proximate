#!/usr/bin/env python3
"""
build_player_outfit_turtleneck_from_cc0.py — `turtleneck`, a 7th
PLAYER_OUTFITS style added on top of the original 6 (per explicit operator
instruction to keep growing the customization roster as good source
garments are found, not treat the list as closed). All 6
PLAYER_OUTFIT_COLORS.

Source: female-character-sprite-creator's "Clothes 17" — a ribbed
turtleneck collar with suspender-style straps over the body, visually
distinct from every other PLAYER_OUTFITS entry (none of the other 6 has a
turtleneck collar or straps). Picked by direct visual review, same
discipline as every other outfit in this set.

Same crop/scale/tint pipeline as the other outfit build scripts — see
build_player_outfit_hoodie_from_cc0.py for the FEMALE_BODY_BBOX crop and
luminosity-tint reasoning.

Run with: python3 scripts/build_player_outfit_turtleneck_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Body", "Clothes", "Clothes 17",
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
    out_path = os.path.join(ROOT, "characters", "player", "outfit", f"turtleneck_{color_name}.png")
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
    print(f"wrote turtleneck_{color_name}")

print(f"made={made} skipped(existing)={skipped}")
