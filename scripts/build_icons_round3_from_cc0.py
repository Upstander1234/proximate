#!/usr/bin/env python3
"""
build_icons_round3_from_cc0.py — a third pass at ICON_ART. Round 2's own
docstring claimed "no match anywhere" for the remaining 10 icons after
grepping both new packs for plausible synonyms — that search missed three
real, exact-concept matches that were sitting in the SAME two packs the
whole time, found this pass by listing every file rather than trusting the
prior grep pass:

- `badge` -> `medal1.png` (public/assets/cc0-library/game-icons/, the
  ORIGINAL "Game Icons" pack already used for checkmark/locked/star/
  warning — a literal medal/badge shape, missed because round 2 only
  re-checked the two NEW packs, not the original one already in the
  library).
- `promotion` -> `award.png` (board-game-icons) — a ribbon/rosette award
  glyph, a real "recognition of advancement" reading distinct from
  `badge`'s medal shape so the two don't share one visual motif.
- `reputation` -> `leaderboardsSimple.png` (game-icons, same original pack
  as `badge` above) — a standing/ranking glyph, the honest reading of
  "reputation" as a game-state concept (how you're ranked/regarded), not
  forced onto an unrelated shape.

Still no match for: `water`, `fuel`, `experience`, `relationship`,
`health`, `stress`, `energy` — none of the three packs now in this
library (game-icons, game-icons-expansion, board-game-icons) has a drop/
liquid glyph, a gas-pump/fuel glyph, an xp/level-chevron glyph, a people/
handshake glyph, a medical-cross glyph, or a lightning-bolt/battery glyph
— all three are board-game/video-game UI packs, not medical or utility
icon sets, so this absence is a real category gap in the library, not a
missed grep. These 7 remain placeholder; see ai_prompts.md.

Run with: python3 scripts/build_icons_round3_from_cc0.py [--force]
"""
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
GAME_ICONS = os.path.join(ROOT, "cc0-library", "game-icons", "PNG", "Black", "2x")
BOARD = os.path.join(ROOT, "cc0-library", "board-game-icons", "extracted", "PNG", "Double (128px)")
FORCE = "--force" in sys.argv

MAPPING = {
    "badge": os.path.join(GAME_ICONS, "medal1.png"),
    "promotion": os.path.join(BOARD, "award.png"),
    "reputation": os.path.join(GAME_ICONS, "leaderboardsSimple.png"),
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
