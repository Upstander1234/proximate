#!/usr/bin/env python3
"""
build_player_hat_styles2_from_cc0.py — three more styles on the existing
`hat` axis (previously just "sun", the female pack's own wide-brim sun hat).
Same standing operator instruction as every other player-layer script:
"more customization options = better, keep adding them as you come upon
them." Source this time is the OTHER sprite-creator pack,
male-character-sprite-creator's own "Accessory/Hats" folder, which turned
out to have real, general-purpose head accessories the female pack's own
Hats folder didn't (that pack had exactly one real hat — the sun hat — plus
two mislabeled entries that were actually hair ties, already documented in
build_player_hat_from_cc0.py). Confirmed by direct visual inspection of
all 9 numbered subfolders in the male pack before picking: most are either
the same mislabeled hair-tie shape (Hat 2/3, matching the female pack's own
false "hat"), swim goggles (Hat 6), a santa hat (Hat 9, seasonal/costume,
wrong register for a "who are you" college character-creation moment), or
holiday hair-berries (Hat 3) — skipped for the same reasons already on
record for this pack's other non-matches. Three were real, general,
year-round wearable items:
  - `cap`        <- Hat 8: a plain baseball cap
  - `beanie`     <- Hat 7: a plain knit beanie
  - `headphones` <- Hat 1: over-ear headphones (Front.png is the headband
                    arc, Back.png is the two ear cups — UNLIKE the female
                    pack's own Hat 1, where Back.png was an ambiguous,
                    uncolored stray shape correctly left unused, here BOTH
                    pieces are essential to reading as headphones at all,
                    so both are used, merged post-tint into one flat layer)

POSITIONING — needed its own real, measured offset, and it is NOT the
female pack's own offset (-460/-480 or -460/-600) despite looking
superficially similar in scale. This pack's own base body
(build_player_male_base_from_cc0.py) is placed via a DYNAMIC transform —
bbox of composited Body+Face+Brow+Mouth, centered horizontally in the
480-wide canvas, bottom-anchored at y=720-crop.height — not a fixed
additive constant. The correct accessory offset is therefore computed the
same way, at build time: recompute that exact same bbox/x/y (mirroring
build_player_male_base_from_cc0.py's own math line for line) against the
`medium` skin tone, then place each accessory at
(x - bbox[0], y - bbox[1] + Y_SHIFT) — a real per-style Y_SHIFT found by a
direct composite sweep (-tmp probe scripts, stripped after use) against the
shipped male_medium.png base + a real hairstyle: cap needed -120 (same
magnitude, coincidentally, as the female pack's own sun-hat correction —
both are brimmed items whose native position sits too low), beanie needed
only -20 (it hugs the head much more closely, no brim to clear), headphones
needed -120 (the band arcs high enough over the head that the native
position sat with the ear cups above ear level).

CROSS-GENDER CHECK, not assumed: confirmed directly, by compositing all
three against BOTH `male_medium.png` and `female_medium.png` (the shipped
bases), that the SAME offset (computed once, against the male pack's own
base-build transform) lands correctly on both — matching the existing
precedent that the female pack's own sun hat (built against ITS coordinate
system) already renders correctly on every gender's base. The male base's
own comment already establishes why this works: both packs' composited
head bbox is identical top/bottom (500..1200 in source space) at
SHARED_SCALE=1.0, so only shoulder width (not head position) differs
between the two base scripts.

Same luminosity-based tinting as every other player-layer script. Renders
on the same PLAYER_HAT_STYLES axis as "sun" — over hair, over everything.

Run with: python3 scripts/build_player_hat_styles2_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
MALE_SRC = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "male-character-sprite-creator",
    "extracted", "Male Character Sprite Creator",
)
FORCE = "--force" in sys.argv

CANVAS = (480, 720)

TARGET_RGB = {
    "black": (35, 35, 38),
    "gray": (120, 120, 122),
    "navy": (28, 40, 74),
    "white": (232, 232, 235),
    "red": (168, 45, 45),
    "olive": (99, 105, 58),
}


def layer(*parts):
    return Image.open(os.path.join(MALE_SRC, *parts)).convert("RGBA")


# Mirrors build_player_male_base_from_cc0.py's own transform exactly, against
# the medium skin tone (idx=3) — the reference every offset in this script's
# header comment was measured against.
_merged = Image.new("RGBA", (1400, 1200), (0, 0, 0, 0))
for _im in [
    layer("Body", "Body", "Body 3.png"),
    layer("Head", "Face", "Face 3.png"),
    layer("Head", "Brows", "Brow Type 1", "Neutro.png"),
    layer("Head", "Mouth", "Mouth Type 1", "Neutro.png"),
]:
    _merged.alpha_composite(_im)
_bbox = _merged.getbbox()
_X = (CANVAS[0] - (_bbox[2] - _bbox[0])) // 2
_Y = max(0, CANVAS[1] - (_bbox[3] - _bbox[1]))


def tint(src_crop, rgb):
    tinted = Image.new("RGBA", src_crop.size, (0, 0, 0, 0))
    src_px = src_crop.load()
    out_px = tinted.load()
    for yy in range(src_crop.height):
        for xx in range(src_crop.width):
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
    return tinted


# style -> (Y_SHIFT, [source paths]) — multiple source paths (headphones)
# are tinted independently then composited together onto one output canvas.
STYLES = {
    "cap": (-120, [os.path.join(MALE_SRC, "Accessory", "Hats", "Hat 8", "Color 1.png")]),
    "beanie": (-20, [os.path.join(MALE_SRC, "Accessory", "Hats", "Hat 7", "Color 1.png")]),
    "headphones": (-120, [
        os.path.join(MALE_SRC, "Accessory", "Hats", "Hat 1", "Back 1.png"),
        os.path.join(MALE_SRC, "Accessory", "Hats", "Hat 1", "Front 1.png"),
    ]),
}

made = skipped = missing = 0
for style, (yshift, src_paths) in STYLES.items():
    for p in src_paths:
        if not os.path.exists(p):
            print(f"MISSING source for {style}: {p}")
            missing += 1
    if any(not os.path.exists(p) for p in src_paths):
        continue

    for color_name, rgb in TARGET_RGB.items():
        out_path = os.path.join(ROOT, "characters", "player", "hats", f"{style}_{color_name}.png")
        if os.path.exists(out_path) and not FORCE:
            skipped += 1
            continue

        canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        for src_path in src_paths:
            src = Image.open(src_path).convert("RGBA")
            bbox = src.getbbox()
            crop = src.crop(bbox)
            tinted = tint(crop, rgb)
            # The shared transform places a full (uncropped) 1400x1200-space
            # image at (_X - _bbox[0], _Y - _bbox[1] + yshift). Since we
            # cropped to the accessory's own bbox first, re-add that bbox's
            # own top-left so the crop lands where the uncropped source
            # would have (this bbox is the ACCESSORY's, distinct from
            # _bbox, which is the base body's).
            canvas.alpha_composite(
                tinted,
                (_X - _bbox[0] + bbox[0], _Y - _bbox[1] + yshift + bbox[1]),
            )

        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        canvas.save(out_path)
        made += 1
        print(f"wrote {style}_{color_name}")

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
