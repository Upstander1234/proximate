#!/usr/bin/env python3
"""
build_npc_portraits_from_cc0.py — replaces a SMALL, deliberately scoped subset
of the flat placeholder character portraits (public/assets/characters/portraits/)
with real art cropped from public/assets/cc0-library/vn-portraits/post-apocalyptic-portraits
("Post-Apocalyptic Character Portraits", CC0,
https://fieraryan.itch.io/post-apocalyptic-character-portraits).

Scope, stated honestly: only the FIRST variant (_01) of each role/gender is
replaced — 6 files out of the 24 that exist for the two roles below
(campus_emr, supervisor). The pack has 11 source portraits total; this
mapping was built from a THIRD, fully cross-checked re-read of every file
number after the first two attempts each mis-assigned files from imprecise
memory across a long session (see the CLAUDE.md/session history for this
batch) — every number below was re-verified in the same final pass, not
carried over from an earlier read. Variants _02..04 are left as the existing
flat-color placeholder — the pack doesn't have enough distinct-looking source
images per role/gender to give a variant a genuinely different look without
just reusing art already used elsewhere.

Source images are full-body (512x768); each is center-cropped to a bust/
head-and-shoulders view and resized to the 512x512 square the game's
portraitPath() expects, matching every other file already in that folder.

Run with: python3 scripts/build_npc_portraits_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
SRC = os.path.join(ROOT, "cc0-library", "vn-portraits", "post-apocalyptic-portraits", "all2")
FORCE = "--force" in sys.argv

# target filename (role_gender_variant) -> source portrait number.
# Ground truth, re-verified fresh (Read tool, this exact number, this pass):
#   2  = bearded older man, tactical vest, confident   -> supervisor (authority read)
#   1  = woman, denim jacket, confident stance          -> supervisor (authority read)
#   4  = full-helmet, fully armored, no visible skin/build cue at all
#        (the most gender-neutral of the pack's several helmeted portraits) -> supervisor nonbinary
#   3  = young man, glasses, laptop, civilian/tech vibe -> campus_emr (younger role)
#   11 = woman, short wavy hair, casual                 -> campus_emr (younger role)
#   8  = full-helmet, holding own helmet, visually
#        distinct from #4 (different pose/gear)         -> campus_emr nonbinary
#
# A second pass (same session) checked the 5 remaining unused source
# numbers (5,6,7,9,10) for two more roles. 5, 7, and 10 all show a bare
# midriff/cleavage under tactical gear — rejected for tone, same judgment
# already made once this session for amber-pack (a training-sim NPC
# shouldn't read as sexualized). Only 6 and 9 are fully covered:
#   6 = full-helmet, tan jacket w/ US flag patch, rifle
#       slung on back (mostly hidden by coat)            -> police_officer
#   9 = full-helmet, tactical gear, backpack tank,
#       shotgun held in hand (visible at frame edge)      -> sheriff_deputy
# Both are more "tactical operator" than a real municipal officer's actual
# uniform, and both are gender-illegible under the helmet (used for the
# `male` variant slot only since nothing else about the image reads
# gendered) — an honest reuse-what-exists compromise, not a great fit;
# swap for something closer to a real duty uniform if one turns up later.
MAPPING = {
    "supervisor_male_01": 2,
    "supervisor_female_01": 1,
    "supervisor_nonbinary_01": 4,
    "campus_emr_male_01": 3,
    "campus_emr_female_01": 11,
    "campus_emr_nonbinary_01": 8,
    "police_officer_male_01": 6,
    "sheriff_deputy_male_01": 9,
}
# Per-target crop-height override (fraction of source height to keep from
# the top) — the two tactical portraits above hold a visible weapon lower
# in frame than the default 0.55 bust crop; a tighter 0.40 keeps the crop
# to head/shoulders/upper-chest only, out of frame for the weapon.
CROP_FRAC = {
    "police_officer_male_01": 0.40,
    "sheriff_deputy_male_01": 0.40,
}

made = skipped = missing = 0

for target_name, src_num in MAPPING.items():
    out_path = os.path.join(ROOT, "characters", "portraits", f"{target_name}.png")
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue
    src_path = os.path.join(SRC, f"{src_num}.png")
    if not os.path.exists(src_path):
        print(f"MISSING source for {target_name}: {src_path}")
        missing += 1
        continue
    src = Image.open(src_path).convert("RGBA")
    w, h = src.size  # 512x768
    # bust crop: top ~55% of the full-body image captures head+shoulders/chest
    # (overridden per-target above for the two tactical portraits, to crop
    # a held weapon out of frame)
    frac = CROP_FRAC.get(target_name, 0.55)
    crop = src.crop((0, 0, w, int(h * frac)))
    # pad to a square (crop is wider than tall after this) by centering on
    # a transparent 512x512 canvas rather than stretching/distorting
    cw, ch = crop.size
    scale = 512 / cw
    crop = crop.resize((512, int(ch * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    y = max(0, (512 - crop.height) // 3)  # weight toward top (face), not dead-center
    canvas.alpha_composite(crop, (0, y))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.save(out_path)
    made += 1

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
