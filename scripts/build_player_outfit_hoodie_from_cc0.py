#!/usr/bin/env python3
"""
build_player_outfit_hoodie_from_cc0.py — first real PLAYER_OUTFITS entry
(`hoodie`, all 6 PLAYER_OUTFIT_COLORS), sourced from
female-character-sprite-creator's "Clothes 15" (a plain pull-over hoodie,
already confirmed a clean, gender-neutral-reading garment in
build_female_pack_npc_portraits_from_cc0.py's civilian_nonbinary_02 use).

Uses the SAME fixed source-canvas crop/scale as the (now-aligned) base-body
scripts (see build_player_male_base_from_cc0.py's SHARED_SCALE comment) so
this outfit layer lands at the identical canvas position as either base —
that alignment fix is what makes a shared, gender-agnostic outfit layer
safe to build at all.

Color, NOT via the pack's own built-in color variants — sampled, and none
of Clothes 15's 17 pre-made colors is a clean navy or olive (closest are a
bright medium-blue and a green, not the muted target tones). Instead this
recolors programmatically: Clothes 15's "Color 2.png" (a near-white/light
gray variant, RGB ~232,232,237) is used as a lightness/shading MAP — each
pixel's luminosity is multiplied against a fixed target RGB per
PLAYER_OUTFIT_COLORS name, preserving the source alpha and the original
shading/fold detail. This gives an exact, predictable match to each color
NAME rather than an approximate pick from whatever the pack happened to
include.

Scope, stated honestly: only ONE of the 6 PLAYER_OUTFITS styles (`hoodie`)
is built this pass — `tshirt`/`lightjacket`/`dress`/`sweater`/`tanktop`
remain placeholder. The tinting technique here is reusable for any of
them once a plain, gender-neutral-reading source garment is picked for
each (same visual-check discipline as this one).

Run with: python3 scripts/build_player_outfit_hoodie_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Body", "Clothes", "Clothes 15",
    "Color 2.png",
)
FORCE = "--force" in sys.argv

CANVAS = (480, 720)
SHARED_SCALE = 1.0  # see build_player_male_base_from_cc0.py's own comment
# The female base's OWN composited bbox (measured directly when building
# female_*.png — see build_player_female_base_from_cc0.py), used here
# INSTEAD OF the garment's own tighter bbox: cropping to the body's bbox,
# not the garment's, is what keeps the garment positioned exactly where it
# sits relative to that body in source-canvas space, so it lands aligned
# once both are placed on CANVAS via the same scale/center/bottom-anchor
# rule. (Both packs' bbox X-centers are ~699.5-700 despite differing
# widths, so this also lands correctly centered against the broader male
# base — confirmed by the shared centering logic below, not assumed.)
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
    out_path = os.path.join(ROOT, "characters", "player", "outfit", f"hoodie_{color_name}.png")
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
            # keep a floor so shadows don't crush to pure black, a ceiling so
            # highlights don't blow out past the target color
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
    print(f"wrote hoodie_{color_name}")

print(f"made={made} skipped(existing)={skipped}")
