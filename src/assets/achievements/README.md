# Achievement badges

Covers `ACHIEVEMENT_ART` in `src/assets.js`. Unlike most other categories,
this one IS already wired in — `AchievementsOverlay.jsx` (F15) renders
`ACHIEVEMENT_ART[id]` for every entry in `src/achievements.js`, with a
grayscale filter applied while locked. This README is the outstanding piece:
the actual per-badge ART BRIEF, since the code integration is done.

## Purpose
A distinct, recognizable badge icon per achievement, shown at full color when
unlocked and desaturated (grayscale, applied in CSS) while locked.

## Intended appearance
Classic circular/shield "badge" silhouette, consistent across the set, with a
unique central glyph per achievement. Should read clearly at the 36×36 size
the achievements screen renders them at.

## Theme / style
Warm metallic/enamel-pin feel for the badge shape itself; the central glyph
should hint at the achievement's meaning at a glance (see the per-badge notes
below) without needing the title text to be legible.

## Assets (`ACHIEVEMENT_ART`, matching `src/achievements.js`'s `ACHIEVEMENTS` ids)
| Id | Suggested glyph |
|---|---|
| `first_save` | A single checkmark or "1" on the badge. |
| `first_rescue` | A heartbeat/pulse line. |
| `heroic_action` | A star or laurel. |
| `no_losses_streak` | A chain/streak-count motif (e.g. 5 linked links). |
| `five_star_review` | Five stars. |
| `calls_completed_100` | "100" or a milestone flag. |
| `perfect_shift` | A checked clipboard. |
| `became_captain` | A captain's bar/insignia — **locked, no unlock path yet** (needs F17's rank-progression system; see physiology-queue-adjacent note in CLAUDE.md item 21/F17). Fine to art ahead of the system. |
| `became_chief` | A chief's helmet/insignia — same locked status as above. |
| `ems_wannabe` | A curious/lightbulb motif (ZTH prologue: got interested in EMS after a video). |
| `not_so_ems` | A crossed-out or "closed door" motif (ZTH prologue: decided EMS wasn't for them). |
| `declined_patrol_first` | A "no" hand/stop-sign motif (ZTH prologue: turned down PATROL the first time). |
| `declined_patrol_twice` | Same motif as `declined_patrol_first` but doubled/repeated (turned PATROL down a second time) — should read as a clear escalation of the same glyph, not a new concept. |
| `gassy_food` | A comedic food-item motif (a burrito or hot-dog silhouette) — this is a joke achievement, can be slightly more playful than the rest of the set while keeping the same badge frame. |

**Note: this table was originally missing 5 of the 14 real `ACHIEVEMENT_ART`
entries** (`ems_wannabe`/`not_so_ems`/`declined_patrol_first`/
`declined_patrol_twice`/`gassy_food` — all real Zero-To-Hero campaign
achievements, `src/achievements.js`). Found and added this pass by reading
`ACHIEVEMENT_ART`'s actual key list in `src/assets.js` against this table,
rather than trusting the table was complete.

## Notes for the artist / asset generator
Keep the badge SHAPE identical across all nine so only the central glyph
changes — this is what makes the locked/grayscale treatment (a single CSS
filter, not a second art pass) work cleanly.

## CC0 search, this pass — no usable match found
No CC0 pack in this library has a circular badge-frame achievement-icon
set (Kenney's icon packs are flat UI glyphs with no badge frame; a search
for a CC0 badge/medal set turned up only CC-BY/paid results). All 9 remain
placeholder. AI-generation prompts for all 9 are in `ai_prompts.md` (this
folder).
