# Backgrounds, overlays & weather

Covers `BACKGROUNDS`, `OVERLAYS`, and `WEATHER` in `src/assets.js` — the
station/city scenes and the atmospheric layers composited over them. One
README for the whole category (same pattern as `src/assets/audio/README.md`),
not a file per image: these are a single cohesive visual set, not independent
pieces an artist would brief separately.

## Purpose
Set the scene for every station-based screen (station hub, office, garage,
dispatch desk, training room, breakroom) and the city-wide dispatch map, then
let weather/time-of-day overlays recolor any of them without needing a second
full painting per condition.

## Intended appearance
Grounded, contemporary American EMS/fire station — not stylized or cartoonish.
Consistent camera height and lighting logic across all `stationX` scenes so
they read as the same building. `cityMap` is a stylized top-down city
illustration (street-legible but not literal GIS data), used for dispatch/
response-area screens.

## Theme / style
Matches the app's dark, clinical-but-human tone: desaturated, slightly cool
base palette, warm practical lighting (desk lamps, garage sodium lights,
monitor glow) as the accent. No lens flares or game-y bloom.

## Assets

| Key | File | Notes |
|---|---|---|
| `BACKGROUNDS.stationMain` | `backgrounds/station_main.png` | Default hub view — bay doors, rig visible. |
| `BACKGROUNDS.stationOffice` | `backgrounds/station_office.png` | Admin/paperwork — used by career-mode desk scenes. |
| `BACKGROUNDS.stationGarage` | `backgrounds/station_garage.png` | Apparatus bay, close on the rigs. |
| `BACKGROUNDS.stationDispatch` | `backgrounds/station_dispatch.png` | Radio desk, monitors, headset on the hook. |
| `BACKGROUNDS.stationTraining` | `backgrounds/station_training.png` | Skills room — manikin, gear laid out. Also doubles as the Zero-To-Hero campaign's `campaignSupervisorClass` scene (App.jsx) — narrated there as the student health center's real skills lab (borrowed, not PATROL's own storage-room home base), which is the in-world reason a properly-equipped `stationX`-family room appears in a campaign whose own station (`patrolStation`, below) is deliberately the opposite of one. |
| `BACKGROUNDS.stationBreakroom` | `backgrounds/station_breakroom.png` | Downtime-event backdrop (F17). |
| `BACKGROUNDS.cityMap` | `backgrounds/city_map.png` | Stylized city map for dispatch/response screens. |
| `BACKGROUNDS.stationExterior` | `backgrounds/station_exterior.png` | Currently used behind the title screen. |
| `BACKGROUNDS.dormRoom` | `backgrounds/dorm_room.png` | Zero-To-Hero prologue (F31) — a first-year dorm room, boxes half-unpacked, a twin XL bed, a cheap desk. Used behind the disclaimer, acceptance letter, character-customization, and "Welcome" beats — all narrated as happening in this room before the player has moved anywhere else. |
| `BACKGROUNDS.apartmentStudio` | `backgrounds/apartment_studio.png` | Zero-To-Hero prologue — the small off-campus studio the reflection/stats-reveal/laptop-video beats are set in (the game's own narration: "looking out at the campus quad from your new studio apartment," "a cheap desk, a laptop, a half-eaten cup of ramen"). Evening light, laptop glow as the main light source for the laptop scene specifically. |
| `BACKGROUNDS.campusQuadNight` | `backgrounds/campus_quad_night.png` | Zero-To-Hero prologue — the open quad at night: sodium/LED path lighting, campus buildings silhouetted behind, mostly empty. Used for the heat-stroke incident's aftermath beat and `campaignIntro`'s "the radio on your belt just went off" moment. |
| `BACKGROUNDS.campusLibrary` | `backgrounds/campus_library.png` | Zero-To-Hero prologue — a library interior, late, a couple of study-carrel lamps still on, mostly empty. Used for the second-chance "library encounter" recruitment beat. |
| `BACKGROUNDS.patrolStation` | `backgrounds/patrol_station.png` | Zero-To-Hero prologue — Northwood PATROL's actual station per its own script: "a repurposed storage room in the student center basement. Mismatched desks, an old whiteboard with call tallies, a crooked campus map. A worn-out couch... a small locker." Deliberately NOT one of the `stationX` fire-station images above — this is a much smaller, informal, half-improvised space, the visual opposite of a real firehouse. |
| `BACKGROUNDS.campusQuadDay` | `backgrounds/campus_quad_day.png` | Zero-To-Hero prologue — the same quad as `campusQuadNight`, broad daylight ("oppressively hot; cicadas drone"). Used for the heat-stroke incident's own simulation/aftermath beats and the Scene 2.7.1 pre-call bench scene, all of which are daytime — a real background rather than the night file reused as a placeholder. |
| `BACKGROUNDS.campusMap` | `backgrounds/campus_map.png` | Zero-To-Hero prologue — a stylized top-down illustration of Northwood University, street-legible like `cityMap` but campus-scaled: the main quad, the science building, the dining hall, the library, the dorms, the student center (PATROL's station is in its basement), and Morrison Hall. Viewed via `CampusMapOverlay` (App.jsx), reachable from the PATROL station screen — the "crooked campus map" the station's own background art already shows on the wall, now a real, viewable, labeled thing rather than just set dressing. |
| `OVERLAYS.night/rain/snow/fog/smoke/dawn/dusk` | `backgrounds/overlays/*.png` | Semi-transparent full-frame layers composited OVER a background/weather image — light falloff + particulate, not a full repaint. |
| `WEATHER.rain/snow/fog/smoke/night/dawn/dusk` | `weather/*.png` | Same visual language as the overlays but keyed to Sandbox's weather/time-of-day settings (`g.weather`/`g.timeOfDay`) rather than a fixed scene. |

## Notes for the artist / asset generator
`OVERLAYS` and `WEATHER` are near-duplicates by design (two consumers, one
visual language) — a single overlay set painted once should serve both — keep
edges soft so they composite over any background without a visible seam.
