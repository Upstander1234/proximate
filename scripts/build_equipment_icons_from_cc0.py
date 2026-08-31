#!/usr/bin/env python3
"""
build_equipment_icons_from_cc0.py — replaces a SMALL, deliberately scoped
subset of the flat, text-labeled placeholder EQUIPMENT_ART icons
(public/assets/equipment/) with real art from
public/assets/library/generic-items (Kenney's "Generic Items #1", CC0,
already in this repo, previously sourced but never wired into any UI —
see that pack's own README.md).

Scope, stated honestly: only 3 of the 18 EQUIPMENT_ART entries have a real,
non-forced visual match in this pack — it's a generic "everyday objects/
tools/household items" set, not a medical-equipment set, so most of the
list (defibrillator, iv_bag, o2_tank, stretcher, bvm, cardiac_monitor,
handheld_radio, shears, penlight, stethoscope, glucometer, pulse_oximeter,
backboard, splint, tourniquet) has nothing honest to reuse and was
deliberately left as placeholder rather than force-fit onto an unrelated
icon (same discipline already applied to ICON_ART's own 14 unmatched
entries — see build_icons_from_cc0.py). The 3 real matches, found by
building a labeled contact-sheet montage of all 163 icons and checking
each candidate directly rather than guessing from a thumbnail:
  - drug_bag    -> genericItem_color_102.png (an actual first-aid kit box,
                   orange with a blue cross — the one icon in this pack
                   that IS medical, not just bag-shaped)
  - trauma_bag  -> genericItem_color_142.png (a rolling case — a real,
                   plausible visual stand-in for a wheeled trauma bag)
  - airway_bag  -> genericItem_color_145.png (a hard-shell briefcase —
                   a real, plausible stand-in for a rigid equipment case)

Run with: python3 scripts/build_equipment_icons_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(ROOT, "library", "generic-items", "PNG", "Colored")
FORCE = "--force" in sys.argv

MAPPING = {
    "drug_bag": "genericItem_color_102.png",
    "trauma_bag": "genericItem_color_142.png",
    "airway_bag": "genericItem_color_145.png",
}

TARGET_SIZE = 256

made = skipped = missing = 0
for equip, src_name in MAPPING.items():
    out_path = os.path.join(ROOT, "equipment", f"{equip}.png")
    src_path = os.path.join(SRC, src_name)
    if not os.path.exists(src_path):
        print(f"MISSING source for {equip}: {src_path}")
        missing += 1
        continue
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue
    src = Image.open(src_path).convert("RGBA")
    margin = int(TARGET_SIZE * 0.12)
    inner = TARGET_SIZE - margin * 2
    scale = inner / max(src.size)
    new_w, new_h = int(src.width * scale), int(src.height * scale)
    resized = src.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (255, 255, 255, 0))
    x = (TARGET_SIZE - new_w) // 2
    y = (TARGET_SIZE - new_h) // 2
    canvas.alpha_composite(resized, (x, y))
    canvas.save(out_path)
    made += 1
    print(f"wrote {equip} (from {src_name})")

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
