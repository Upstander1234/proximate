#!/usr/bin/env python3
"""
build_female_pack_npc_portraits_from_cc0.py — adds a second real
civilian_nonbinary portrait (civilian_nonbinary_02), using
public/assets/cc0-library/vn-portraits/female-character-sprite-creator
(same creator/CC0/convention as the already-integrated male pack — see
build_player_female_base_from_cc0.py's own docstring).

civilian_nonbinary was the thinnest NPC role in this project (1/4 variant
slots filled, via build_madameberry_portraits_from_cc0.py). This adds a
second, genuinely distinct look: a different skin tone/face, a short
androgynous hairstyle (Bangs 1 — checked directly, reads gender-neutral,
not styled long/decorated), and a black hoodie (Clothes 15 — checked
directly against several alternatives first; Clothes 1 is a sailor-style
school uniform that reads clearly feminine, Clothes 20 is a bikini top
rejected outright for tone, matching this project's standing discipline
against sexualized/revealing outfits established for amber-pack).

civilian_nonbinary_03/_04 are deliberately NOT filled this pass — one
well-checked new variant beats rushing three. The pack has plenty of
remaining hair/clothes headroom for whoever picks this back up.

Run with: python3 scripts/build_female_pack_npc_portraits_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator",
)
FORCE = "--force" in sys.argv


def layer(*parts):
    return Image.open(os.path.join(SRC, *parts)).convert("RGBA")


NPCS = {
    "civilian_nonbinary_02": {
        "skin": 2,
        "mouth": ("Mouth Type 1", "Neutro.png"),
        "brow": ("Brow Type 1", "Neutro.png"),
        "eye_sclera": ("Sclera", "Normal", "Sclera 1.png"),
        "eye_shadow": ("Shadow", "Normal", "Shadow 1.png"),
        "iris": ("Type 1", "Iris 3.png"),
        "hair": ("Bangs", "Bangs 1", "Color 1.png"),
        "clothes": ("Clothes 15", "Color 1.png"),  # black hoodie, gender-neutral
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
