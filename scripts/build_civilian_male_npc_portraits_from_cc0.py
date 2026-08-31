#!/usr/bin/env python3
"""
build_civilian_male_npc_portraits_from_cc0.py — fills the two remaining
flat-placeholder civilian_male portrait slots (civilian_male_03,
civilian_male_04, public/assets/characters/portraits/) using the same
source pack build_player_male_base_from_cc0.py used for the player's own
base body layer: public/assets/cc0-library/vn-portraits/
male-character-sprite-creator ("Male Character Sprite Creator" by
Tainara-P, CC0, https://tainara-p.itch.io/male-character-sprite-creator).

Distinct from the player-base script: these are full, DRESSED, styled NPC
portraits (skin + face + eyes + hair + clothes), not a bald/neutral base —
this pack's own separated layers make a fully assembled, non-reused look
cheap here, unlike the earlier flattened-illustration sources (vn-
characters-cabbit) that only had 2 usable male poses total. Two distinct
combinations (different skin tone, hairstyle, clothes, and eye color) so
civilian_male_03/_04 read as different people, not palette swaps of _01/_02.

Run with: python3 scripts/build_civilian_male_npc_portraits_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "male-character-sprite-creator",
    "extracted", "Male Character Sprite Creator",
)
FORCE = "--force" in sys.argv


def layer(*parts):
    return Image.open(os.path.join(SRC, *parts)).convert("RGBA")


NPCS = {
    "civilian_male_03": {
        "skin": 2,
        "mouth": ("Mouth Type 1", "Neutro.png"),
        "brow": ("Brow Type 1", "Neutro.png"),
        "eye_sclera": ("Sclera", "Normal", "Sclera 1.png"),
        "eye_shadow": ("Shadow", "Normal", "Shadow 1.png"),
        "iris": ("Type 1", "Iris 1.png"),  # brown-ish default
        "hair": ("Bangs", "Bangs 1", "Color 1.png"),
        "clothes": ("Clothes 1", "Color 1.png"),  # dark collared jacket
    },
    "civilian_male_04": {
        "skin": 4,
        "mouth": ("Mouth Type 1", "Smile.png"),
        "brow": ("Brow Type 1", "Neutro.png"),
        "eye_sclera": ("Sclera", "Normal", "Sclera 1.png"),
        "eye_shadow": ("Shadow", "Normal", "Shadow 1.png"),
        "iris": ("Type 1", "Iris 5.png"),
        "hair": ("Bangs", "Bangs 6", "Color 3.png"),
        "clothes": ("Clothes 10", "Color 3.png"),  # orange casual jacket
    },
}

CANVAS = (512, 512)

made = skipped = 0
for target_name, cfg in NPCS.items():
    out_path = os.path.join(ROOT, "characters", "portraits", f"{target_name}.png")
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue

    merged = Image.new("RGBA", (1400, 1200), (0, 0, 0, 0))
    stack = [
        layer("Body", "Body", f"Body {cfg['skin']}.png"),
        layer("Head", "Face", f"Face {cfg['skin']}.png"),
        layer("Head", "Eyes", "Eye Type 1", *cfg["eye_shadow"]),
        layer("Head", "Eyes", "Eye Type 1", *cfg["eye_sclera"]),
        layer("Head", "Eyes", "Iris", *cfg["iris"]),
        layer("Head", "Eyes", "Eye Type 1", "Normal.png"),
        layer("Head", "Brows", *cfg["brow"]),
        layer("Head", "Mouth", *cfg["mouth"]),
        layer("Body", "Clothes", *cfg["clothes"]),
        layer("Hair", *cfg["hair"]),
    ]
    for im in stack:
        merged.alpha_composite(im)

    bbox = merged.getbbox()
    crop = merged.crop(bbox)
    scale = CANVAS[0] / crop.width
    new_h = int(crop.height * scale)
    crop = crop.resize((CANVAS[0], new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    y = max(0, (CANVAS[1] - crop.height) // 3)
    canvas.alpha_composite(crop, (0, y))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path)
    made += 1
    print(f"wrote {target_name} ({crop.width}x{crop.height} crop)")

print(f"made={made} skipped(existing)={skipped}")
