# Gameplay icons

Covers `ICON_ART` in `src/assets.js` — small glyphs for game-state concepts
(money, reputation, stress...), distinct from `EQUIPMENT_ART` (physical gear)
and from the per-achievement badges in `ACHIEVEMENT_ART`.

## Purpose
Give the growing set of career-mode stat displays (money — F4's economy,
morale/fatigue on crew cards, the achievements progress count) a small glyph
instead of (or alongside) the current plain `$`/text labels.

## Intended appearance
Single-color (or two-tone accent) flat glyphs, legible at ~14-16px inline
with text — these sit NEXT TO numbers in tight UI, not as standalone art.

## Theme / style
One consistent stroke weight and corner radius across the whole set so they
read as a single icon font even though they're individual files. Use the
game's existing accent palette (`C.amber`, `C.hr`, `C.spo2`, etc. in
`theme.js`) as the icon's tint, not fixed colors baked into the art, so a
single icon file can be recolored per context (CSS filter/mask) rather than
needing a colored variant per accent.

## Assets (`ICON_ART`)
`fire`, `water`, `fuel`, `experience`, `promotion`, `relationship`, `heart`,
`badge`, `money`, `reputation`, `health`, `stress`, `energy`, `clock`, `star`,
`warning`, `checkmark`, `locked`. `money` pairs directly with F4's `g.money`
economy display (station screen, shift summary); `star` pairs with F15's
five-star-review achievement; `locked` pairs with the achievements screen's
locked-entry state (currently a text "LOCKED" label, not a glyph).

## Notes for the artist / asset generator
Recommended as a mask/SVG approach (or a monochrome PNG intended for a CSS
`filter` tint) specifically BECAUSE of the multi-accent-color requirement
above — a flat baked-in-color PNG per icon would need one file per accent
color instead of one file total.

**6 of the 11 real icons are now actually wired into the UI, not just sitting
unused (they had zero call sites before this pass).** `money` — the station
header's `$` display (`App.jsx`, career mode). `reputation` — the crew-stats
panel's Reputation row. `star` — the Sandbox call-rating card's "Overall"
value, shown only when the grade is `"A"` (the same five-star threshold
`creditOutcome`'s own `isFiveStar` already checks for the `five_star_review`
achievement, not a new one). `badge` — the achievements screen's own
"N/M unlocked" progress line. `locked`/`checkmark` — the achievements
screen's per-entry status tag (replacing a bare "?" placeholder box and
plain "LOCKED"/"UNLOCKED" text with the real glyphs). `fire`/`heart`/`clock`/
`warning` are real but deliberately left unwired this pass — no existing UI
element was a genuine fit for any of them without inventing a display
element just to use the icon, which would be exactly the kind of decorative
addition this project's own discipline warns against; wire them once a real
consumer (a fire-related event indicator, a countdown timer, etc.) exists.

**11 of the 18 are now real art**, not placeholder: `checkmark`, `locked`,
`star`, `warning` (Kenney's CC0 "Game Icons" pack,
`scripts/build_icons_from_cc0.py`); `money`, `fire`, `heart`, `clock`
(`scripts/build_icons_round2_from_cc0.py` — `money` from Kenney's CC0
"Game Icons (Expansion)" `coin.png`, the other three from Kenney's CC0
"Board Game Icons" `fire.png`/`suit_hearts.png`/`hourglass.png`); and
`badge`, `promotion`, `reputation` (`scripts/build_icons_round3_from_cc0.py`
— `badge` from the ORIGINAL "Game Icons" pack's `medal1.png`, missed in
round 2 because that pass only re-checked the two NEW packs rather than
re-listing the pack already in the library; `promotion` from Board Game
Icons' `award.png`; `reputation` from the original pack's own
`leaderboardsSimple.png`) — all solid-black-on-transparent glyphs matching
the mask/tint shape described above. The remaining 7 (`water`, `fuel`,
`experience`, `relationship`, `health`, `stress`, `energy`) genuinely have
no match in any of the three Kenney packs now in this library — none of
the three is a medical or utility icon set (they're board-game/video-game
UI packs), so there is no drop/liquid, gas-pump, xp-chevron, handshake,
medical-cross, or lightning-bolt glyph anywhere to find. Checked by listing
every file in all three packs, not just grepping synonyms against a partial
listing (the mistake that missed `badge`/`promotion`/`reputation` the first
time). AI-generation prompts for these 7 are in `ai_prompts.md` (this
folder).
