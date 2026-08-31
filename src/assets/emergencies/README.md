# Emergency-type illustrations

Covers `EMERGENCY_ART` in `src/assets.js` — a scene-level illustration per
broad emergency TYPE, distinct from `EVENT_ART` (career-mode downtime/story
beats) and from the physiology engine's per-scenario content in
`src/data/scenarios.js`.

## Purpose
Give the dispatch/call-selection screens (Sandbox's "cat" phase category
cards, and a future career-mode dispatch board) a representative illustration
per broad call type, rather than only the current plain-text category cards.

## Intended appearance
Wide-format establishing illustrations (a scene, not an icon) — think the key
art you'd see on a dispatch card or loading screen. Dramatic but not
gratuitous; this game's tone treats patients seriously.

## Theme / style
Matches `BACKGROUNDS`' grounded, contemporary-American-EMS look. Consistent
lighting logic (mostly overcast/dusk/night — high-acuity calls skew toward
worse conditions) so the set reads as one continuity of "calls," not random
stock art.

## Assets (`EMERGENCY_ART`)
`structure_fire`, `vehicle_collision`, `medical_emergency`, `hazmat_spill`,
`water_rescue`, `cardiac_arrest`, `trench_rescue`, `wildland_fire`,
`mass_casualty`. `mass_casualty` pairs with queue item F8b's MCI scenarios,
which don't exist yet — this art can ship ahead of that content.

## Notes for the artist / asset generator
Not yet wired into any component (`EMERGENCY_ART` has zero call sites in
`App.jsx` today). The natural first integration is Sandbox's category picker
("medical"/"trauma"/"random" cards in the `cat` phase) — one illustration per
card instead of the current plain text block.
