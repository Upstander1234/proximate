# CampaignLaptopVideo

## Purpose
The Zero-To-Hero campaign's "apartment laptop" beat (design doc §2.4) — the
player, alone in their new studio apartment, watches a ParamedicStories skit
("Jason" acting out a bystander/patient/firefighter exchange) and is then
asked "Are you interested in EMS?" This is the scene that plants the seed for
the whole campaign, and the one the operator specifically called out as
needing to read "one click is one line," like an actual video/comic panel
advancing rather than a wall of pre-printed dialogue.

## Intended appearance
`BACKGROUNDS.apartmentStudio` behind everything — a small studio apartment,
evening, most of the light in the room coming from the laptop screen itself
rather than an overhead fixture (this is the one Zero-To-Hero scene where the
background's own light source should visibly motivate the framing: everything
outside the laptop's glow reads slightly cooler/dimmer). The video content
itself renders inside a dark "screen" panel (see the existing `campaignLaptop`
phase in `src/App.jsx` — `#0A0A0A` background, a thin border) sitting inside
the VN dialogue box, and each line of Jason's skit is revealed one click at a
time via `VNDialogue` (`src/components/VNShell.jsx`) rather than all five
lines appearing at once — the point is that it should feel like watching
something play out, not reading a transcript.

## Theme / style
A cheap laptop webshow, not a produced video — slightly low-fi, a plain solid
background behind "Jason" rather than a set, matching the in-game dialogue's
own description of a low-budget EMS-meme-account skit. The apartment around it
stays grounded and realistic; the tonal contrast between "ordinary evening,
ordinary apartment" and "the dumb video that ends up mattering" is the point
of the scene.

## Important visual elements
- The laptop screen "frame" (bezel, subtle screen glow/vignette) around the
  video content, distinguishing it from the surrounding VN dialogue box.
- Jason himself now has real per-persona sprite art (`JASON_PERSONAS`,
  `jasonSpritePath()` in `src/assets.js` — see `src/assets/characters/Jason.md`
  for the full per-persona spec), swapped inside the screen panel as the
  player clicks through the skit's lines, rather than costume changes being
  implied by dialogue tags alone. The scene still degrades gracefully to
  text-in-a-video-frame if a given persona's art is ever missing
  (`onImgError`), so this was additive, not a hard requirement.
- The apartment's ambient details (ramen cup, single desk, window at night)
  already described in the scene's existing narration text — keep them
  present in the background art so the two agree.

## Notes for the artist / asset generator
This is the one scene in the prologue where "one click is one line" is a hard
requirement, not a style preference — confirm any interactive/animated
treatment still supports discrete, player-paced advancement rather than
auto-playing.
