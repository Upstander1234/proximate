#!/usr/bin/env python3
"""
build_player_male_base_from_cc0.py — replaces the 4 flat placeholder
`characters/player/base/male_*.png` layers (solid-color rectangles) with
real bust art composited from
public/assets/cc0-library/vn-portraits/male-character-sprite-creator
("Male Character Sprite Creator" by Tainara-P, CC0,
https://tainara-p.itch.io/male-character-sprite-creator).

Scope, stated honestly: ONLY the male base-body layer is touched this pass.
`playerHairLayerPath`/`playerOutfitLayerPath`/`playerEyesLayerPath` (see
assets.js) are SHARED files — the same hair/outfit/eyes PNG renders on top
of whichever base the player picked, male/female/nonbinary alike, at a
fixed canvas position. Building hair/outfit/eyes art positioned against
THIS pack's own male head shape and shipping it into those shared paths
would silently misalign the instant a player picks female or nonbinary
(whose base layers are still solid-color placeholder rectangles with no
real head position to align against) — a real regression, not a neutral
placeholder-for-placeholder swap. So this pass is deliberately narrow:
male base only, hair/outfit/eyes left exactly as they were. Filling in a
matching female/nonbinary base (from a different pack) is what would
unblock touching the shared layers safely.

This pack IS a genuine modular character creator (separated Body/Head/
Hair/Clothes/Accessory PNGs, not a single flattened illustration) — the
first one found for a male character in this project. The Body layer is
already bare-shoulders/bust framing (bbox starts well below the neck, no
baked-in clothing), matching CampaignCustomize.md's own "base body...
bald, neutral" spec exactly with no cropping-out-the-shirt step needed,
unlike every prior bust-crop script in this session.

Body/Face are numbered 1-9, but only 1-5 are realistic human skin tones —
6-9 are stylized fantasy colors (green/blue/pink/red), confirmed by
sampling average pixel color before picking indices. Body/Face indices are
verified to be a consistent skin-tone match at the same index (index i's
Body and Face average colors track each other closely).

Neutral expression: Brow Type 1's own "Neutro.png" needs no separate color
choice (unlike Brow Type 2+, which have per-color subfolders), and Mouth
Type 1's own "Neutro.png" is the matching neutral mouth shape. Eyes are
deliberately NOT included — eyes are Proximate's own separate customizable
layer (`playerEyesLayerPath`), so the base stays eye-socket-transparent,
same as every other base layer in this project already is.

All source layers share one 1400x1200 canvas with consistent content
placement, confirmed by checking each layer's own bbox before compositing
— no manual per-layer offset math needed, unlike the tall single-illustration
sources earlier scripts in this session had to bust-crop by hand.

Run with: python3 scripts/build_player_male_base_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "male-character-sprite-creator",
    "extracted", "Male Character Sprite Creator",
)
FORCE = "--force" in sys.argv

# skin tone name -> source pack index (1-5 are realistic tones; 6-9 are
# stylized fantasy colors, confirmed by sampling and excluded)
SKIN_INDEX = {
    "light": 1,
    "medium": 3,
    "tan": 4,
    "dark": 5,
}

CANVAS = (480, 720)  # matches every existing player/base/*.png
# Both packs' composited (Body+Face+Brow+Mouth) bbox height is 700px in source
# space (measured directly: male (469,500,930,1200), female (501,500,899,1200)
# — identical top=500/bottom=1200, only width differs). 700 already fits inside
# CANVAS[1]=720 at 1:1, so SHARED_SCALE=1.0 needs no resampling loss. Fixed
# and shared across both base scripts on purpose — see the resize call below.
SHARED_SCALE = 1.0


def layer(*parts):
    return Image.open(os.path.join(SRC, *parts)).convert("RGBA")


made = skipped = 0
for skin, idx in SKIN_INDEX.items():
    out_path = os.path.join(ROOT, "characters", "player", "base", f"male_{skin}.png")
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
    # SHARED_SCALE (not crop.width-based): see build_player_female_base_from_cc0.py's
    # docstring for why. Composited bbox top/bottom are IDENTICAL between the
    # male and female packs (both 500..1200 in source space, confirmed by
    # direct measurement) — only bbox WIDTH differs (shoulder width). Scaling
    # each pack independently to fill CANVAS[0] width applies a DIFFERENT
    # vertical scale factor per pack, which is what silently broke alignment
    # before this fix. A single shared scale keeps both packs' heads/necks/
    # shoulder-tops at the same canvas Y, differing only in shoulder width,
    # which is the correct, expected difference.
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
    print(f"wrote male_{skin} (source Body/Face {idx}, crop {crop.width}x{crop.height})")

print(f"made={made} skipped(existing)={skipped}")
