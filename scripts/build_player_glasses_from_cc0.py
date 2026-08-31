#!/usr/bin/env python3
"""
build_player_glasses_from_cc0.py — a genuinely NEW customization axis, not a
placeholder fill: `PLAYER_GLASSES_STYLES` (5 real styles + "none"), each in
all 6 PLAYER_OUTFIT_COLORS (reused as the glasses frame color palette rather
than inventing a separate one — a red or navy frame is a real, fun choice
consistent with this project's own "more cuteness/fun is welcome" tone note,
not just a technical convenience). Per explicit operator instruction ("more
customization options = better, keep adding them as you come upon them").

Source: female-character-sprite-creator's own "Accessory/Glasses" folder —
5 numbered styles, each visually distinct (checked by directly viewing every
one, not picked by index):
  - `oval`     <- Glasses 1: thin metal frame, horizontal oval lenses
  - `browline` <- Glasses 2: half-rim, frame only along the BOTTOM of each
                  lens (no visible top rim) — a genuinely different shape
                  from every other style here, not just a recolor
  - `round`    <- Glasses 3: thin wire frame, true circular lenses
                  (the classic "John Lennon" silhouette)
  - `square`   <- Glasses 4: thick rectangular frame
  - `safety`   <- Glasses 5: thick colored rim with a glossy lens highlight
                  — reads as sport/safety eyewear, a nice thematic fit for an
                  EMS game specifically (safety glasses are real PPE), not
                  just a 5th style for its own sake

POSITIONING, deliberately NOT this pack's own native head-relative position.
This pack's own Eyes layer (Head/Eyes/Eye Type 1/Normal.png) sits at source
y 688-761, which maps (via the same source->canvas offset the base/outfit
scripts already established: canvas_y = source_y - 480) to canvas y 208-281
— confirmed against this pack's own Brows (source y 660-685 -> canvas y
180-205, matching the visible eyebrow position in the rendered base PNG,
so the offset formula itself is right). BUT the actual `eyes/*.png` layer
this game renders comes from a completely different, already-shipped pack
(modular-character-kenney, see build_player_layers_from_cc0.py) placed by
hand-tuned constants at canvas y~150-190 — confirmed by compositing
base+eyes and viewing the result (a real check, not assumed): the rendered
eyes sit essentially ON the eyebrow line, higher than this pack's own native
eye position. Glasses have to sit over the EYES THAT ACTUALLY RENDER, not
over a different pack's idealized position, so this script deliberately
overrides the vertical placement to center on canvas y=172 (the current
shipped eye band's own center) rather than reusing the source pack's native
y offset. Horizontal centering IS reused from the native position, since
every glasses source bbox is already perfectly symmetric around source
x=700 (confirmed: 605+795, 593+807, 591+808, 584+816, 580+820 all sum to
1400 exactly), which is the same axis the base/outfit crops already center
on — so plain center-on-canvas-x=240 is correct with no override needed.

Same luminosity-based tinting as every other player-layer script (hue of
the source pixel is discarded, only relative luminance is kept) — so it
does not matter that the source PNGs are pre-colored (red, orange, blue)
rather than neutral gray; every style tints cleanly to all 6 target colors.

Run with: python3 scripts/build_player_glasses_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
GLASSES_DIR = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "female-character-sprite-creator",
    "extracted", "Female Character Sprite Creator", "Accessory", "Glasses",
)
FORCE = "--force" in sys.argv

CANVAS = (480, 720)
EYE_BAND_CENTER_Y = 172  # matches the currently-shipped eyes/*.png layer's own center

TARGET_RGB = {
    "black": (35, 35, 38),
    "gray": (120, 120, 122),
    "navy": (28, 40, 74),
    "white": (232, 232, 235),
    "red": (168, 45, 45),
    "olive": (99, 105, 58),
}

STYLES = {
    "oval": os.path.join(GLASSES_DIR, "Glasses 1", "Color 1.png"),
    "browline": os.path.join(GLASSES_DIR, "Glasses 2", "Color 1.png"),
    "round": os.path.join(GLASSES_DIR, "Glasses 3", "Color 1.png"),
    "square": os.path.join(GLASSES_DIR, "Glasses 4", "Color 1.png"),
    "safety": os.path.join(GLASSES_DIR, "Glasses 5", "Color 1.png"),
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
        out_path = os.path.join(ROOT, "characters", "player", "glasses", f"{style}_{color_name}.png")
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
        y = EYE_BAND_CENTER_Y - tinted.height // 2
        canvas.alpha_composite(tinted, (x, y))

        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        canvas.save(out_path)
        made += 1
        print(f"wrote {style}_{color_name}")

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
