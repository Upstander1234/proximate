#!/usr/bin/env python3
"""
build_player_female_base_from_cc0.py — replaces the 4 flat placeholder
`characters/player/base/female_*.png` layers (solid-color rectangles) with
real bust art composited from
public/assets/cc0-library/vn-portraits/female-character-sprite-creator
("Female Character Sprite Creator" by Tainara-P, CC0,
https://tainara-p.itch.io/female-character-sprite-creator) — the exact
counterpart pack to `build_player_male_base_from_cc0.py`'s
male-character-sprite-creator, same creator, same conventions (1400x1200
canvas, Body/Face numbered 1-9 with only 1-5 realistic skin tones — 6-9 are
the identical stylized fantasy colors, re-confirmed by sampling this pack's
own pixels rather than assumed from the male pack), so this script mirrors
that one almost line for line.

ALIGNMENT FIX (this revision): the previous version of this script (and its
male counterpart) scaled each pack's crop independently to fill CANVAS[0]
width — but the two packs have different shoulder widths (male broader),
so matching WIDTH forced a DIFFERENT vertical scale factor per pack, which
is what produced visibly different output heights (728px male vs 844px
female) and looked like a real bbox/position mismatch. Measured directly,
it wasn't: the COMPOSITED (Body+Face+Brow+Mouth) bbox is (469,500,930,1200)
male vs (501,500,899,1200) female — top=500 and bottom=1200 are IDENTICAL
between packs; only bbox WIDTH differs (shoulder width, correctly). Fixed
by using one SHARED_SCALE (not a per-pack width-matched one) and centering
horizontally instead of left-aligning — both bases now land at the same
canvas Y for head/neck/shoulder-top, differing only in shoulder width,
which is the real, correct anatomical difference. This is what actually
unlocks safely building the shared `hair`/`outfit`/`eyes` layers against
either pack's own head/shoulder position — not attempted in this script,
but no longer blocked by a real alignment defect.

Run with: python3 scripts/build_player_female_base_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator",
)
FORCE = "--force" in sys.argv

SKIN_INDEX = {
    "light": 1,
    "medium": 3,
    "tan": 4,
    "dark": 5,
}

CANVAS = (480, 720)  # matches every existing player/base/*.png
# See build_player_male_base_from_cc0.py's own comment at this same constant
# for the full measurement — kept identical across both scripts on purpose.
SHARED_SCALE = 1.0


def layer(*parts):
    return Image.open(os.path.join(SRC, *parts)).convert("RGBA")


made = skipped = 0
for skin, idx in SKIN_INDEX.items():
    out_path = os.path.join(ROOT, "characters", "player", "base", f"female_{skin}.png")
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue

    merged = Image.new("RGBA", (1400, 1200), (0, 0, 0, 0))
    for im in [
        layer("Body", "Body", f"Body {idx}.png"),
        layer("Head", "Face", f"Face {idx}.png"),
        layer("Head", "Brows", "Brow Type 1", "Neutro.png"),
        layer("Head", "Mouth", "Mouth Type 1", "Neutro.png"),
    ]:
        merged.alpha_composite(im)

    bbox = merged.getbbox()
    crop = merged.crop(bbox)
    crop = crop.resize(
        (int(crop.width * SHARED_SCALE), int(crop.height * SHARED_SCALE)), Image.LANCZOS
    )

    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - crop.width) // 2  # center horizontally, not left-aligned
    y = max(0, CANVAS[1] - crop.height)  # bottom-anchor: shoulders reach the base of the frame
    canvas.alpha_composite(crop, (x, y))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path)
    made += 1
    print(f"wrote female_{skin} (source Body/Face {idx}, crop {crop.width}x{crop.height})")

print(f"made={made} skipped(existing)={skipped}")
