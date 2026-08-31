#!/usr/bin/env python3
"""
build_civilian_portraits_from_cc0.py — replaces flat placeholder
civilian_female portraits (public/assets/characters/portraits/) with real
art composited from public/assets/cc0-library/vn-portraits/girl-sprites-premium
("Premium Girl Sprites", CC0, https://cucurbitapepo.itch.io/girl-sprites-for-visual-novel).

The source is a single, deeply layered PSD (one modular anime-VN girl
character: swappable hair/outfit/expression layer groups). Rather than a
flat portrait per role, this composites two DISTINCT looks off the same
character by toggling named layer groups on/off, verified against the real
layer tree read via psd-tools before writing this script (see the printed
tree in the build session — not re-derived from memory, matching the
lesson already on file for the post-apocalyptic-portraits mapping getting
it wrong twice from stale memory).

Scope, stated honestly: only civilian_female_01/_02 are touched (2 of the
24 civilian files). This is ONE character in two outfits, not two distinct
people — a real limitation of drawing both variants from a single-character
PSD. Male/nonbinary civilian variants get no new art from this pack (the
source is a single female character).

Run with: python3 scripts/build_civilian_portraits_from_cc0.py [--force]
"""
import os, sys
from PIL import Image
from psd_tools import PSDImage

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
PSD_PATH = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "girl-sprites-premium",
    "Girl Sprites Premium 1", "Premium Girl Sprites.psd",
)
FORCE = "--force" in sys.argv

# Full ancestor-name paths (tuples) of groups we force ON or OFF for each
# variant, layered on top of the PSD's own default visibility for anything
# not mentioned. Names copied verbatim (including odd trailing spaces) from
# the psd-tools tree dump.
VARIANTS = {
    "civilian_female_01": {
        # PSD's own defaults: School uniform 2 (Black), HAIR 2, tied-up back
        # hair, standard eye, open mouth big, thin/sad eyebrows. No overrides
        # needed — this IS the default composite.
        "force_on": [],
        "force_off": [],
    },
    "civilian_female_02": {
        # Swap: hoodie short instead of the school uniform, shoulder-length
        # front hair instead of "HAIR 2", closed/flat expression instead of
        # open-mouth.
        "force_on": [
            ("Combined layers", "Clothes", "Hoodie short"),
            ("Combined layers", "Front Hair", "Shoulder long"),
            ("Combined layers", "Front Hair", "Shoulder long", "HAIR LONG shoulder "),
        ],
        "force_off": [
            ("Combined layers", "Clothes", "School uniform 2  (2 colors)"),
            ("Combined layers", "Front Hair", "HAIR 2 "),
        ],
    },
    "civilian_female_03": {
        # A third, real look: PE clothes (T-shirt + bloomers — a full,
        # fully-covering outfit, unlike bare "jeans" which is legs-only with
        # no top and was rejected after a first attempt rendered a bare
        # chest, see the git history / session notes) instead of a uniform/
        # hoodie, a short-cut front hairstyle instead of the twin-tail
        # "HAIR 2", and a smiling expression instead of the open-mouth
        # default — casual, off-duty read, distinct from both 01 (school
        # uniform) and 02 (hoodie).
        "force_on": [
            ("Combined layers", "Clothes", "PE clothes"),
            ("Combined layers", "Front Hair", "short front"),
            ("Combined layers", "Face", "faces", "smile"),
        ],
        "force_off": [
            ("Combined layers", "Clothes", "School uniform 2  (2 colors)"),
            ("Combined layers", "Front Hair", "HAIR 2"),
            ("Combined layers", "Face", "faces", "open mouth big"),
        ],
    },
}


def apply_visibility(psd, force_on, force_off):
    """Group.visible is directly settable in psd-tools and correctly
    cascades during composite() — simpler and more reliable than a
    per-leaf layer_filter, which does NOT override an ancestor group's own
    hidden flag (confirmed: a filter forcing a leaf True inside a hidden
    group still composited as invisible)."""
    roots = list(psd)
    for path in force_off:
        node = find_from_roots(roots, path)
        if node is None:
            print(f"WARNING: force_off path not found: {path}")
        else:
            node.visible = False
    for path in force_on:
        node = find_from_roots(roots, path)
        if node is None:
            print(f"WARNING: force_on path not found: {path}")
        else:
            node.visible = True


def find_from_roots(roots, path):
    # Match on STRIPPED names — the PSD's own layer names are inconsistently
    # padded with trailing spaces (e.g. "Front Hair " vs "Face"), and a first
    # version of this script matched exact strings, which silently failed to
    # find "Front Hair" (no space) against the real "Front Hair " and just
    # skipped the toggle with no error — caught only by actually looking at
    # the rendered output and noticing the hair hadn't changed. Stripping
    # both sides here removes that whole failure class.
    node = None
    for r in roots:
        if r.name.strip() == path[0].strip():
            node = r
            break
    if node is None:
        return None
    for name in path[1:]:
        nxt = None
        for c in node:
            if c.name.strip() == name.strip():
                nxt = c
                break
        if nxt is None:
            return None
        node = nxt
    return node


made = skipped = 0
for target_name, cfg in VARIANTS.items():
    out_path = os.path.join(ROOT, "characters", "portraits", f"{target_name}.png")
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue
    psd = PSDImage.open(PSD_PATH)
    apply_visibility(psd, cfg["force_on"], cfg["force_off"])
    composite = psd.composite()
    composite = composite.convert("RGBA")
    w, h = composite.size  # 1821x2579
    # bust crop: top ~40% captures head+shoulders on this taller-proportioned
    # full-body sprite
    crop = composite.crop((0, 0, w, int(h * 0.40)))
    cw, ch = crop.size
    scale = 512 / cw
    crop = crop.resize((512, int(ch * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    y = max(0, (512 - crop.height) // 3)
    canvas.alpha_composite(crop, (0, y))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path)
    made += 1
    print(f"wrote {target_name} ({crop.width}x{crop.height} crop)")

print(f"made={made} skipped(existing)={skipped}")
