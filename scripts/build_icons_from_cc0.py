#!/usr/bin/env python3
"""
build_icons_from_cc0.py — replaces a subset of the flat, text-labeled
placeholder ICON_ART glyphs (public/assets/icons/) with real, single-color,
transparent-background glyphs from public/assets/cc0-library/game-icons
(Kenney's "Game Icons" pack, CC0, https://kenney.nl/assets/game-icons).

Scope, stated honestly: only 4 of the 18 ICON_ART entries have a real,
exact-concept match in this pack (`checkmark`, `locked`, `star`, `warning`)
— confirmed by listing every file in the pack and matching by name, not
guessed. The pack is a generic UI-chrome icon set (arrows, buttons, audio
toggles, navigation) — it has nothing for the game-state concepts this
project actually needs most (`fire`, `water`, `money`, `heart`, `energy`,
`reputation`, `stress`, `clock`, `experience`, `fuel`, `promotion`,
`relationship`, `badge`, `health`) and none of those were force-fit onto an
unrelated glyph, matching this project's own standing discipline against
reusing art for the wrong concept.

Per src/assets/icons/README.md, ICON_ART is meant to be single-color flat
glyphs intended for a CSS filter/mask tint, not baked-in color — the
source pack's Black/2x glyphs (solid black on transparent) are exactly
that shape already, so this is a straight copy/resize, not a composite.

Run with: python3 scripts/build_icons_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(ROOT, "cc0-library", "game-icons", "PNG", "Black", "2x")
FORCE = "--force" in sys.argv

# target icon -> source glyph filename (verified present via a real
# directory listing before writing this mapping, not assumed)
MAPPING = {
    "checkmark": "checkmark.png",
    "locked": "locked.png",
    "star": "star.png",
    "warning": "warning.png",
}

TARGET_SIZE = 128  # matches the existing placeholder canvas size

made = skipped = missing = 0
for icon, src_name in MAPPING.items():
    out_path = os.path.join(ROOT, "icons", f"{icon}.png")
    src_path = os.path.join(SRC, src_name)
    if not os.path.exists(src_path):
        print(f"MISSING source for {icon}: {src_path}")
        missing += 1
        continue
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue
    src = Image.open(src_path).convert("RGBA")
    # pad onto a transparent TARGET_SIZE square, centered, with a small
    # margin so the glyph doesn't touch the edge (matches typical icon-font
    # spacing conventions)
    margin = int(TARGET_SIZE * 0.12)
    inner = TARGET_SIZE - margin * 2
    scale = inner / max(src.size)
    new_w, new_h = int(src.width * scale), int(src.height * scale)
    resized = src.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))
    x = (TARGET_SIZE - new_w) // 2
    y = (TARGET_SIZE - new_h) // 2
    canvas.alpha_composite(resized, (x, y))
    canvas.save(out_path)
    made += 1

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
