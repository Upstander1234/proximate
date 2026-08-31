#!/usr/bin/env python3
"""
build_icons_round2_from_cc0.py — a second pass at ICON_ART, using two more
Kenney CC0 packs downloaded this session: "Game Icons (Expansion)"
(public/assets/cc0-library/game-icons-expansion/, 60 assets, CC0,
https://kenney.nl/assets/game-icons-expansion) and "Board Game Icons"
(public/assets/cc0-library/board-game-icons/, 250 assets, CC0,
https://kenney.nl/assets/board-game-icons) — both fetched specifically
because the original "Game Icons" pack (already wired in, 4/18) is
UI-chrome only and has nothing for game-state concepts.

Real, exact-concept matches found by listing every file in both packs and
matching by name (not guessed, not force-fit): `coin` (game-icons-expansion)
for `money`; `fire`, `suit_hearts`, `hourglass` (board-game-icons) for
`fire`/`heart`/`clock`. `dollar` was considered for `money` too but `coin`
reads more like the game's own economy glyph shape (round token vs. a
currency symbol) — either is a defensible match; `coin` was picked as the
single best fit, `dollar` left unused rather than assigned to a second
concept.

Still no match anywhere in either pack for: `water`, `fuel`, `experience`,
`promotion`, `relationship`, `badge`, `reputation`, `health`, `stress`,
`energy` — confirmed by grepping both packs' full file lists for every
plausible synonym (drop/wave/liquid, gas/pump, xp/level/chevron, bolt/zap/
lightning/battery, handshake/people/friend, shield/ribbon/crown, cross/
pulse/plus, hourglass/timer already used for clock). These 10 are left
placeholder — see icon_prompts.md for AI-generation prompts instead.

Board Game Icons ships PNG at "Default (64px)" and "Double (128px)" — the
128px set is used here for headroom, then downscaled to TARGET_SIZE to
match the existing icon canvas.

Run with: python3 scripts/build_icons_round2_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
EXPANSION = os.path.join(ROOT, "cc0-library", "game-icons-expansion", "extracted")
BOARD = os.path.join(ROOT, "cc0-library", "board-game-icons", "extracted", "PNG", "Double (128px)")
FORCE = "--force" in sys.argv

MAPPING = {
    "money": os.path.join(EXPANSION, "PNG", "Black", "2x", "coin.png"),
    "fire": os.path.join(BOARD, "fire.png"),
    "heart": os.path.join(BOARD, "suit_hearts.png"),
    "clock": os.path.join(BOARD, "hourglass.png"),
}

TARGET_SIZE = 128

made = skipped = missing = 0
for icon, src_path in MAPPING.items():
    out_path = os.path.join(ROOT, "icons", f"{icon}.png")
    if not os.path.exists(src_path):
        print(f"MISSING source for {icon}: {src_path}")
        missing += 1
        continue
    if os.path.exists(out_path) and not FORCE:
        skipped += 1
        continue
    src = Image.open(src_path).convert("RGBA")
    bbox = src.getbbox()
    crop = src.crop(bbox)
    margin = int(TARGET_SIZE * 0.12)
    inner = TARGET_SIZE - margin * 2
    scale = inner / max(crop.size)
    new_w, new_h = int(crop.width * scale), int(crop.height * scale)
    resized = crop.resize((new_w, new_h), Image.LANCZOS)
    canvas = Image.new("RGBA", (TARGET_SIZE, TARGET_SIZE), (0, 0, 0, 0))
    x = (TARGET_SIZE - new_w) // 2
    y = (TARGET_SIZE - new_h) // 2
    canvas.alpha_composite(resized, (x, y))
    canvas.save(out_path)
    made += 1
    print(f"wrote {icon} (from {os.path.basename(src_path)})")

print(f"made={made} skipped(existing)={skipped} missing_source={missing}")
