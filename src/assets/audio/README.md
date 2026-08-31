# Audio & background music — drop files here

This folder is where the game's audio lives. Paths are defined once in
`src/assets.js` (the single source of truth for every art/audio path) and
referenced everywhere through the `AUDIO` map, so you swap audio by replacing a
file with the exact expected filename — no code changes to the reference.

## Where to put a background-music track

1. Drop a `.wav` file in the audio assets folder using the exact filename the
   `AUDIO` map expects. The map (`src/assets.js`) currently defines these slots,
   two of which are background music:

   | key                 | file                       | purpose                    |
   |---------------------|----------------------------|----------------------------|
   | `menu_music`        | `menu_music.wav`           | **background music — menus** |
   | `station_ambience`  | `station_ambience.wav`     | **background music — station** |
   | `radio_chatter`     | `radio_chatter.wav`        | scene ambience             |
   | `truck_siren`       | `truck_siren.wav`          | (siren is also synthesised) |
   | `dispatch_tone`     | `dispatch_tone.wav`        | dispatch alert             |
   | `button_click`, `achievement`, `notification`, `fire_alarm`, `heart_monitor_beep` | `<key>.wav` | UI / SFX |

   The referenced URL is `/assets/audio/<key>.wav` (see `BASE` in `assets.js`).
   Confirm your static-serving setup resolves `/assets/...` to the file you drop
   (in a standard Vite build that means `public/assets/audio/<key>.wav`; this repo
   keeps the source folder here under `src/assets/audio/`). Keep the filename
   identical to the table above and the reference updates automatically.

2. To add a NEW background track (beyond the two slots above), add a key to the
   `AUDIO` array in `src/assets.js`, then drop the matching `.wav`.

## Playback is wired (stale note removed)

This section used to say playback wasn't hooked up. That's out of date — a
later F9 batch added a real, looping `<audio>` player (`App.jsx`, `audioRef`)
that selects `menu_music` on menu/station-adjacent screens and
`station_ambience` in the station, per the phase table there. Dropping in a
correctly-named file is genuinely enough to change what plays; no code
changes needed for a straight swap.

`menu_music.wav` is currently "Track 01 (Title Screen)" from OpenGameArt's
"CC0 Scraps" pack (CC0, https://opengameart.org/content/cc0-scraps), ~83
seconds, looped by the player above. Picked over Kenney's Music Jingles pack
(also downloaded, see `public/assets/cc0-library/music-jingles/`) because
those are all 1-4 second stings — fine as one-shot fanfares, but the game
loops the file continuously, so a multi-second track restarting every few
seconds would read as broken, not atmospheric. The original placeholder tone
is kept at
`public/assets/cc0-library/menu-music-candidate/_original_placeholder_tone.wav`
if you want to revert.
