# Equipment icons

Covers `EQUIPMENT_ART` in `src/assets.js` — small iconographic renders of
individual pieces of gear, distinct from the `ICON_ART` gameplay-stat glyphs
and from the `BAGS`/`POCKETS` gear the in-call action grid already uses
(those are plain-text buttons today; this category is for the equipment
ARTWORK that would illustrate them, e.g. in a loadout/kit-selection screen).

## Purpose
Give the kit-selection and crew/loadout screens (currently plain text lists —
see F2's vehicle bag loadouts and the "kit" phase bag picker) a recognizable
icon per item instead of a name alone.

## Intended appearance
Clean, flat-shaded icon-style renders (not photoreal) — think a modern
first-aid/EMS pictogram set. Consistent 1:1 icon framing, single item
centered, transparent background so it can sit on any panel color.

## Theme / style
Same restrained, slightly technical illustration style across the whole set —
thin consistent linework, a small accent-color highlight (the game's hr/amber/
spo2 palette) rather than full-color realism, so a whole loadout screen of
these icons reads as one system rather than clip art from different sources.

## Assets (`EQUIPMENT_ART`)
`defibrillator`, `iv_bag`, `o2_tank`, `stretcher`, `bvm`, `cardiac_monitor`,
`drug_bag`, `airway_bag`, `trauma_bag`, `handheld_radio`, `shears`, `penlight`,
`stethoscope`, `glucometer`, `pulse_oximeter`, `backboard`, `splint`,
`tourniquet`. Note `drug_bag`/`airway_bag`/`trauma_bag` map directly onto the
`BAGS` keys in `gear.js` (`drug`, `airway`, `trauma` — `monitor` isn't listed
here yet and should probably be added as a fourth bag icon to match).

## Notes for the artist / asset generator
Not yet wired into any component (`EQUIPMENT_ART` has zero call sites in
`App.jsx` today) — the natural first integration is the "kit" phase's bag
picker and the crew tab's device-attach buttons, both currently text-only.

**Correction, this pass: the 3 previously counted as "real" are actually
NOT good enough, and are being treated as placeholder again.** A direct
visual review (not just "a genuine non-forced match" on paper) found
`trauma_bag` reads unambiguously as a wheeled travel SUITCASE (a rolling
handle and a caster wheel — nothing about it says "medical"), and
`airway_bag` reads as a plain dark briefcase indistinguishable from a
laptop case — neither would communicate its intended meaning to a player
even in context. Only `drug_bag` (an orange box with a blue medical cross)
is genuinely legible as first-aid-adjacent, and even that is a generic
household first-aid-kit icon, not a real EMS drug bag with vials/ampoules.
**All 18 equipment icons are now correctly treated as placeholder.**
Confirmed (again) that no purpose-built flat medical-icon CC0 pack exists
anywhere in this project's downloaded library or in a fresh search
(Flaticon-style results are CC-BY/paid, not CC0; Kenney's own catalog has
no medical-icon pack) — this category genuinely needs AI generation, not
a missed CC0 match. AI-generation prompts for all 18 (including
`drug_bag`/`trauma_bag`/`airway_bag`, previously skipped as "already
done") are in `ai_prompts.md` (this folder). The old Kenney "Generic
Items #1" files are left on disk at their existing paths — harmless, since
`EQUIPMENT_ART` has zero call sites in `App.jsx` today — but should be
overwritten once real art lands, not treated as a baseline to match.
