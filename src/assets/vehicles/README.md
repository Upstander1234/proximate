# Vehicles

Covers `VEHICLE_ART` in `src/assets.js`. `PoliceMotorcycle.md` (already in
this folder, from an earlier request) is a per-item spec for a vehicle that
turned out NOT to be wired into `VEHICLE_ART` at all — see the note below,
now fixed. This README covers the rest of the category in one file, matching
the audio/README.md pattern, rather than eighteen more per-item files.

## Purpose
A side-view (or 3/4) illustration per response-vehicle type, keyed by the
same `vehicle.type`/`kind` strings `fleet.js` already uses everywhere
(dispatch rolls, the vehicle-selection screen, crew cards).

## Intended appearance
Consistent camera angle and scale logic across the whole set (a fire engine
should read as visibly larger than a PSO's bike in a side-by-side dispatch
list) — semi-realistic, not photoreal, matte livery consistent with each
vehicle's real-world agency colors (red/white for fire, blue/white or
black/white for police, white/orange or white/red for EMS).

## Assets (`VEHICLE_ART`)
`engine`, `ladder`, `rescue`, `battalion`, `squad`, `bls`, `als`,
`criticalCare`, `criticalCareChase`, `pdcar`, `sergeantCar`, `shercar`,
`bike`, `pickup`, `chase`, `golfcart`, `suv`, `helo`, `civilian`.

### A real gap found while writing this spec, now fixed
`PoliceMotorcycle.md` (this folder) specs a police motorcycle, but
`fleet.js`'s `pdMoto` unit kind uses `vehicle.type: "motorcycle"` — a key
`VEHICLE_ART` never declared, so `vehicleArt("motorcycle")` silently fell back
to the generic placeholder for every motorcycle unit that ever appeared on
scene. Added `motorcycle` to `VEHICLE_ART` (`src/assets.js`) pointing at
`vehicles/police_motorcycle.png`, matching the PNG already sitting in this
folder from the earlier per-item request. This is exactly the "written, but
the consumer never reads it" defect class the physiology side of this project
watches for — same failure mode, front-end instance.

## Notes for the artist / asset generator
`vehicleArt()` (the helper in `assets.js`) has zero call sites in `App.jsx`
today despite every vehicle type already having art declared and a generated
placeholder — wired in this batch (see the vehicle-selection and "YOUR RIG"
screens, which now render the icon next to the vehicle name).

## CC0 search, this pass — no usable match found
Kenney's CC0 "Car Kit" has an ambulance among its 45 models, but it's a 3D
model (.glb/.obj) with no rendering pipeline in this project to flatten it
into the side-view PNG this category needs. Every other candidate found
(Pixel Vehicle Pack, Racing Pack, OpenGameArt's Car Kit) is either pixel-art
top-down (style mismatch) or generic sedans with no emergency livery. **All
19 files are placeholder, including `motorcycle`** — a real, previously-
wrong claim in this document ("motorcycle already has real art at
`police_motorcycle.png`") was checked against the tree this pass and found
false: no such PNG exists anywhere in the repo, only a 3D
`models/vehicles/motorcycle.glb` and this folder's own still-unbuilt
`PoliceMotorcycle.md` spec. Corrected here rather than left standing.
AI-generation prompts for all 19 (18 plus `motorcycle`) are in
`ai_prompts.md` (this folder).
