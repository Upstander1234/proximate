#!/usr/bin/env python3
"""
build_player_hat_from_cc0.py — an 8th player-customization axis, same
standing operator instruction as glasses/earrings/necklace.

Source: female-character-sprite-creator's own "Accessory/Hats/Hat 1" folder
— a wide-brimmed sun hat with a ribbon bow, the only one of the three "Hats"
subfolders that is actually a full hat (Hat 2/Hat 3 turned out, on direct
visual inspection, to be a small symmetric two-piece accessory positioned
near the top-sides of the head — most likely a pair of hair ties/clips, not
a hat at all, despite the folder name; skipped rather than mislabeled).

Hat 1 itself has two pieces: `Back.png` (a single, uncolored brown swoosh —
almost certainly a stray hair-wisp/occlusion shape meant to peek out from
behind the crown, not part of the hat itself, and not recolored per style
in the source pack) and `Front 1.png`..`Front 9.png` (9 complete,
self-contained hats — each one recolors BOTH the crown/brim AND the ribbon
bow together, confirmed by direct visual inspection of several). Only the
Front layer is used here: it is already a complete, readable hat silhouette
on its own, and skipping Back avoids either mismatching its neutral color
against a tinted Front or guessing at what it's actually for.

Only one FRONT variant is used as the tint source (Front 1) rather than
picking a different pre-made color per output — the same "discard hue, keep
luminance, apply target color" tinting pipeline every other player-layer
script uses, so the hat's 6 colors line up with the same palette as
outfit/hair/glasses/earrings/necklace instead of an unrelated 9-color set.

POSITIONING — needs a real override, unlike earrings/necklace. Tried the
native offset first (canvas_x = source_x - 460, canvas_y = source_y - 480)
and MEASURED it wrong by direct composite check: it drops the brim down
over the eyebrows, well below where a hat actually sits. This pack's own
Hats folder is NOT on the same coordinate system as Earring/Necklace/base
body, evidently because the hat sprite was drawn against a different
reference point on the shared mega-canvas (a large sprite, 640x257 px,
wider than this game's own 480px-wide portrait canvas, whose brim is
expected to be cropped left/right by the tight headshot frame — the same
"decorative overflow is fine" reasoning a big sun hat's brim would have on
any tightly-cropped face photo). A vertical-offset sweep (-tmp probe script,
stripped after use) found -120 additional px (canvas_y = source_y - 600)
puts the brim's front edge right at/just above the eyebrows with the crown
naturally cropped off the top of the canvas — the correct, expected look
for a wide-brimmed hat on a close headshot crop, not a defect.

Rendered ON TOP of hair (like glasses) — a hat sits over hair, not under
it, the opposite of earrings' own hair relationship.

Run with: python3 scripts/build_player_hat_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
HAT_SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Accessory", "Hats",
    "Hat 1", "Front 1.png",
)
FORCE = "--force" in sys.argv

CANVAS = (480, 720)
# Y is NOT the native -480 offset — see the header comment: measured wrong,
# corrected by a real composite sweep to -600 (native -480, minus a further
# 120px so the brim clears the eyebrows instead of covering them).
OFFSET_X, OFFSET_Y = -460, -600

TARGET_RGB = {
    "black": (35, 35, 38),
    "gray": (120, 120, 122),
    "navy": (28, 40, 74),
    "white": (232, 232, 235),
    "red": (168, 45, 45),
    "olive": (99, 105, 58),
}

made = skipped = missing = 0
if not os.path.exists(HAT_SRC):
    print(f"MISSING source: {HAT_SRC}")
    missing += 1
else:
    src = Image.open(HAT_SRC).convert("RGBA")
    bbox = src.getbbox()
    crop = src.crop(bbox)

    for color_name, rgb in TARGET_RGB.items():
        out_path = os.path.join(ROOT, "characters", "player", "hats", f"sun_{color_name}.png")
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
        print(f"wrote sun_{color_name}")

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
