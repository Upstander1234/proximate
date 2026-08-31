# Characters — portraits, expressions, poses

Covers `CHARACTER_ROLES`, `CHARACTER_GENDERS`, `CHARACTER_VARIANTS_PER_ROLE`,
`EXPRESSIONS`, and `POSES` in `src/assets.js`. One README for the whole
category rather than one file per file: the actual asset count here is
combinatorial (18 roles × 3 genders × 4 variants = 216 portraits, plus 10
expression overlays and 11 pose variants), so the spec is the RULE that
generates the set, not per-image briefs.

## Purpose
A stable, recognizable portrait for every crew/NPC role the game can put on
screen (`portraitFor()` in `assets.js` derives the exact file deterministically
from a person's role + gender + a hash of their name, so the same character
always renders with the same face across a session).

## Intended appearance
Head-and-shoulders portrait, uniform framing/crop across every role and
variant (same camera distance, same background treatment) so they read as one
consistent cast when mixed in a crew roster. Realistic but slightly
illustrated — not photographic, not cartoonish.

## Theme / style
Neutral, slightly desaturated studio-style lighting so portraits don't clash
with whichever panel color they sit on. Uniform/gear appropriate to the role
(see `CHARACTER_ROLES` below) — this is the one place scope-accuracy matters
visually: an EMT-tier role should not be drawn with paramedic-only gear.

## Roles (`CHARACTER_ROLES`, each × 3 genders × 4 variants)
`captain`, `chief`, `rookie`, `firefighter`, `dispatcher`, `paramedic`,
`engineer`, `mechanic`, `police_officer`, `civilian`, `reporter`,
`flight_medic`, `flight_nurse`, `cct_physician`, `cct_paramedic`,
`sheriff_deputy`, `campus_emr`, `supervisor`. Each role needs its own
distinct silhouette/uniform (fire turnout gear for `firefighter`/`captain`/
`chief`, flight suit for `flight_medic`/`flight_nurse`, patrol uniform for
`police_officer`/`sheriff_deputy`, EMR-style campus safety uniform for
`campus_emr`, business/press attire for
`reporter`, plain clothes for `civilian`). The 4 variants per role/gender exist
to avoid an identical face appearing twice in one crew roster — vary build,
skin tone, and small details (glasses, facial hair), not the uniform.

## Expressions & poses (`EXPRESSIONS`, `POSES`)
Overlay/variant sets meant to layer onto or replace the base portrait for
narrative beats (career-mode downtime events, dialogue) rather than the
in-call crew roster, which always uses the neutral base portrait.
- `EXPRESSIONS`: neutral, happy, smiling, concerned, angry, surprised,
  embarrassed, thinking, sad, laughing.
- `POSES`: idle, arms_crossed, pointing, thinking, celebrating, walking,
  holding_radio, holding_hose, holding_bag, holding_stretcher, kneeling,
  holding_clipboard, holding_coffee, demonstrating_cpr, demonstrating_aed,
  applying_tourniquet, giving_rescue_breath, holding_naloxone. holding_
  clipboard/holding_coffee exist specifically so the Zero-To-Hero campaign's
  VN dialogue (App.jsx) never has to write a physical action into a
  character's spoken line — a speaker performing a new action gets a new
  pose here instead, layered onto their sprite (VNSprite's `pose` prop,
  VNShell.jsx) rather than described in prose. The five demonstrating_*/
  applying_*/giving_*/holding_naloxone poses extend that same idea to the
  PATROL skills-lab scene (campaignSupervisorClass, App.jsx): a supervisor
  teaching CPR, the AED, bleeding control, rescue breaths, and naloxone
  needed a distinct badge per skill being demonstrated. Generic/reusable
  like every other pose, not tied to that one scene or character.

## Notes for the artist / asset generator
Rig faces/expressions so the SAME underlying head works across the expression
set (a swappable mouth/brow layer), rather than fully redrawing each — 216
portraits × 10 expressions is not a hand-painted-per-combination budget.
`generate_placeholders.py` already produces a flat-color placeholder for every
combination `portraitPath()` can request; this spec is for replacing those,
not for generating the full combinatorial set from scratch by hand.
