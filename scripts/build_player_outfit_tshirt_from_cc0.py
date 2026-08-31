#!/usr/bin/env python3
"""
build_player_outfit_tshirt_from_cc0.py — second real PLAYER_OUTFITS entry
(`tshirt`, all 6 PLAYER_OUTFIT_COLORS), sourced from
female-character-sprite-creator's "Clothes 3" (a plain crew-neck ringer
tee, short sleeves, contrast collar/cuff trim) — visually confirmed by
direct inspection to be a genuine plain t-shirt silhouette, not a fantasy/
costume garment (this pack's 83 clothing options range widely, from plain
basics like this one to bikini tops and school-sailor uniforms; picked by
eye, not assumed from the index number).

Same crop/scale/tint pipeline as build_player_outfit_hoodie_from_cc0.py —
see that script's own comments for why FEMALE_BODY_BBOX (not the garment's
own bbox) is the correct crop, and why programmatic luminosity-based
tinting is used instead of the pack's own pre-made color variants (Clothes
3 only ships 3 colors, none matching PLAYER_OUTFIT_COLORS' 6 target names).
Color 1 (white body, red collar/cuff trim) is used as the luminosity map —
the trim's own darker luminosity naturally renders as a subtly darker band
of the target color once tinted, preserving the ringer-tee contrast detail
rather than flattening it.

Run with: python3 scripts/build_player_outfit_tshirt_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Body", "Clothes", "Clothes 3",
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
    out_path = os.path.join(ROOT, "characters", "player", "outfit", f"tshirt_{color_name}.png")
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
    print(f"wrote tshirt_{color_name}")

print(f"made={made} skipped(existing)={skipped}")
