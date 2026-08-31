# UI chrome

Covers `UI_ART` in `src/assets.js` — the sixteen reusable interface-chrome
elements. Distinct from the five per-concept files already in this folder
(`AchievementButton.md`, `AchievementScreen.md`, `LearningModeSelection.md`,
`MasterOfYourScopeMode.md`, `ZeroToHeroMode.md`) — those are specs for whole
SCREENS/FEATURES; this file is for the small reusable CHROME pieces those
screens (and every other screen) are built from.

## Purpose
A consistent, reusable visual vocabulary — one dialogue box, one tooltip, one
button style — instead of every screen inventing its own borders/panels
inline (which is largely how the app looks today: hand-rolled inline styles
per screen, functional but not asset-driven).

## Intended appearance
Minimal, high-contrast, mono-labeled — matches the game's existing inline
style language (`C.panel`/`C.panelHi`/`C.line` in `theme.js`) closely enough
that swapping a hand-styled `<div>` for one of these images is a drop-in, not
a redesign.

## Theme / style
Dark, hairline-bordered, low ornamentation. No skeuomorphism (no fake leather/
paper textures) — this is a clinical simulator, not a fantasy RPG.

## Assets (`UI_ART`)
`dialogue_box`, `notification`, `loading_spinner`, `cursor_default`,
`cursor_pointer`, `portrait_frame`, `nameplate`, `speech_bubble`,
`choice_box`, `button_primary`, `button_secondary`, `panel_background`,
`tooltip`, `progress_bar`, `tab_active`, `tab_inactive`.

## Notes for the artist / asset generator
`UI_ART` has zero call sites in `App.jsx` today — every one of these concepts
is currently reproduced as inline CSS rather than an image asset. Wiring
these in for real is a larger, separate front-end pass (it would touch nearly
every screen) and is out of scope for this batch; `dialogue_box`/
`speech_bubble`/`choice_box` are the natural first candidates once the F17
downtime-event dialogue UI (which uses plain styled `<div>`s today) is judged
worth converting to asset-driven chrome.
