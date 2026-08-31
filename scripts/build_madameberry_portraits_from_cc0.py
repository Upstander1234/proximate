#!/usr/bin/env python3
"""
build_madameberry_portraits_from_cc0.py — replaces two more flat placeholder
NPC portraits with real art composited from
public/assets/cc0-library/vn-portraits/og-visual-novel-style-characters
("Visual Novel Style Characters" by Madameberry, CC0,
https://opengameart.org/content/visual-novel-style-characters).

The source PSD (`Set1.psd`) has 5 selectable body shapes, 6 skin tones per
body, 9 face variants, and 4 hairstyles — a genuine modular character
creator, not a single fixed illustration. Only "Body 2" was used: it's the
only one of the 5 bodies whose clothes/torso/shadow sub-layers are ALL
already visible by default — the other four bodies (1, 3, 4, 5) need each
of their own nested clothes/shadow/base sub-layers individually enabled
(their outer group being visible is not enough, confirmed directly: Body 1
with only its group toggled on rendered as a floating head and hands, no
torso), which is real further work not attempted in this pass.

Body 2's own outfit (a sleeveless crop top + high-waisted trousers) shows
a bare midriff — checked against this project's own tone standard (the
amber-pack rejection, this session) and judged acceptable: shoulders/chest/
back are all covered, it reads as ordinary contemporary streetwear, not
underwear/swimwear-adjacent — a real, if closer, call than the very
comfortably-modest supervisor/campus_emr art, stated honestly rather than
silently decided.

Run with: python3 scripts/build_madameberry_portraits_from_cc0.py [--force]
"""
import os, sys
from PIL import Image
from psd_tools import PSDImage

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
PSD_PATH = os.path.join(
    ROOT, "cc0-library", "vn-portraits", "og-visual-novel-style-characters",
    "extracted", "Set1.psd",
)
FORCE = "--force" in sys.argv

VARIANTS = {
    "civilian_female_04": {
        # PSD's own default state entirely (Body 2, its own default skin
        # tone/clothes, face 3, Hair 3) — no overrides needed.
        "force_on": [],
        "force_off": [],
    },
    "civilian_nonbinary_01": {
        # A different skin tone, face, and hairstyle off the same body —
        # the face/hair combination reads gender-ambiguous enough (short
        # textured Hair 1, a more neutral face 7) to stand in for this
        # role, which otherwise has zero real art anywhere in this
        # project.
        "force_on": [
            ("Bodies", "Body 2", "Body 2 skin", "Layer 2 copy 4"),
            ("All faces", "face 7"),
            ("Hair", "Hair 1"),
        ],
        "force_off": [
            ("Bodies", "Body 2", "Body 2 skin", "Layer 2 copy"),
            ("All faces", "face 3"),
            ("Hair", "Hair 3"),
        ],
    },
}


def find_from_roots(roots, path):
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


def apply_visibility(psd, force_on, force_off):
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


made = skipped = 0
for target_name, cfg in VARIANTS.items():
    out_path = os.path.join(ROOT, "characters", "portraits", f"{target_name}.png")
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue
    psd = PSDImage.open(PSD_PATH)
    apply_visibility(psd, cfg["force_on"], cfg["force_off"])
    composite = psd.composite().convert("RGBA")
    w, h = composite.size  # 1078x2559
    # bust crop: top ~22% captures head+shoulders on this very tall
    # full-body illustration
    crop = composite.crop((0, 0, w, int(h * 0.22)))
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
