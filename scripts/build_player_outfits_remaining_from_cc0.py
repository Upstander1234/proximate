#!/usr/bin/env python3
"""
build_player_outfits_remaining_from_cc0.py — the last 3 PLAYER_OUTFITS
styles (`lightjacket`, `dress`, `sweater`; `tanktop` was built earlier the
same session as this file, see build_player_outfit_tanktop_from_cc0.py),
all 6 PLAYER_OUTFIT_COLORS each, completing the set at 6/6 styles real.

Sources, picked by directly viewing candidate garments (not by index
number — this pack's 83 clothing options range from plain basics to
bikini tops and school uniforms, so the index tells you nothing):

- `lightjacket` <- Clothes 5: a fitted zip-front top, long sleeves, high
  mock-neck collar with a visible center zipper line — reads as a light
  zip-up jacket/track jacket, not a heavy winter coat.
- `dress` <- Clothes 12: a camisole/slip-bodice layered over a visible
  white tee, sweetheart neckline, thin straps — a real "cute sundress
  over a tee" silhouette (matches the operator's own note that ZTH should
  have room for a sundress-style civilian/off-duty look, not just somber
  outfits).
- `sweater` <- Clothes 16: a knit argyle sweater vest layered over a
  collared shirt (visible collar points, diamond knit texture) — a much
  stronger "sweater" read than the first candidate tried (Clothes 10,
  which was really just a looser t-shirt with no knit texture and short
  sleeves — replaced before shipping once viewed side by side).

Same crop/scale/tint pipeline as build_player_outfit_hoodie_from_cc0.py /
build_player_outfit_tshirt_from_cc0.py — see those scripts' own comments
for why FEMALE_BODY_BBOX (not each garment's own bbox) is the correct
crop, and why programmatic luminosity-based tinting is used instead of
each garment's own pre-made color variants (none has all 6
PLAYER_OUTFIT_COLORS as clean matches).

Run with: python3 scripts/build_player_outfits_remaining_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
CLOTHES_DIR = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Body", "Clothes",
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

STYLES = {
    "lightjacket": os.path.join(CLOTHES_DIR, "Clothes 5", "Color 1.png"),
    "dress": os.path.join(CLOTHES_DIR, "Clothes 12", "Color 1.png"),
    "sweater": os.path.join(CLOTHES_DIR, "Clothes 16", "Color 1.png"),
}

made = skipped = missing = 0
for style, src_path in STYLES.items():
    if not os.path.exists(src_path):
        print(f"MISSING source for {style}: {src_path}")
        missing += 1
        continue

    src = Image.open(src_path).convert("RGBA")
    crop = src.crop(FEMALE_BODY_BBOX)
    crop = crop.resize(
        (int(crop.width * SHARED_SCALE), int(crop.height * SHARED_SCALE)), Image.LANCZOS
    )

    for color_name, rgb in TARGET_RGB.items():
        out_path = os.path.join(ROOT, "characters", "player", "outfit", f"{style}_{color_name}.png")
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
        print(f"wrote {style}_{color_name}")

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
