#!/usr/bin/env python3
"""
build_player_earrings_from_cc0.py — a 6th player-customization axis, following
directly on glasses: `PLAYER_EARRING_STYLES` (3 real styles + "none"), each in
all 6 PLAYER_OUTFIT_COLORS. Per the same standing operator instruction as
glasses ("more customization options = better, keep adding them as you come
upon them").

Source: female-character-sprite-creator's own "Accessory/Earring" folder —
3 numbered styles, each visually distinct (checked by directly viewing every
one):
  - `stud`  <- Earring 1: a single small stud dot, the plainest/most subtle
               option
  - `hoop`  <- Earring 2: a small stud plus two angled hoop-link shapes below
               it — reads as a small drop-hoop, not a recolor of the stud
  - `heart` <- Earring 3: a stud, a tiny connecting bead, then a heart charm
               — the most decorative of the three, and (per its own source
               folder having 12 pre-colored variants, more than any other
               accessory in this pack) evidently the artist's own "fun" pick

POSITIONING — unlike glasses, earrings use the NATIVE source-to-canvas offset
directly (canvas_x = source_x - 460, canvas_y = source_y - 480), with no
override. Confirmed by a real composite-and-view check (not assumed): unlike
the shipped eyes layer (a different, unrelated pack placed by hand-tuned
constants — see build_player_glasses_from_cc0.py's own header for that
mismatch), the base body PNG this game ships (build_player_layers_from_cc0.py)
comes from THIS SAME pack's own Body/Clothes crop, on the SAME coordinate
system as Earring/Glasses/Head — so earrings glued to their native offset
line up correctly against the jaw/cheek line with no adjustment, exactly the
same way Brows/Mouth already validated the offset formula itself.

Same luminosity-based tinting as every other player-layer script (hue of the
source pixel is discarded, only relative luminance is kept), applied to the
WHOLE cropped sprite (metal findings tint along with the charm) for a
consistent single-color read per choice, the same simplification the glasses
script already makes.

Run with: python3 scripts/build_player_earrings_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
EARRING_DIR = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Accessory", "Earring",
)
FORCE = "--force" in sys.argv

CANVAS = (480, 720)
OFFSET_X, OFFSET_Y = -460, -480  # the validated native source->canvas offset

TARGET_RGB = {
    "black": (35, 35, 38),
    "gray": (120, 120, 122),
    "navy": (28, 40, 74),
    "white": (232, 232, 235),
    "red": (168, 45, 45),
    "olive": (99, 105, 58),
}

STYLES = {
    "stud": os.path.join(EARRING_DIR, "Earring 1", "Color 1.png"),
    "hoop": os.path.join(EARRING_DIR, "Earring 2", "Color 1.png"),
    "heart": os.path.join(EARRING_DIR, "Earring 3", "Color 1.png"),
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
        out_path = os.path.join(ROOT, "characters", "player", "earrings", f"{style}_{color_name}.png")
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
