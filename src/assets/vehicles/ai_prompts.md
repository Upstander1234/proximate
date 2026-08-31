# AI-generation prompts — VEHICLE_ART (19 files)

**Why this file exists.** Kenney's CC0 "Car Kit" has an ambulance among its
45 3D models, but it's a 3D model (.glb/.obj) — this project has no 3D
rendering pipeline available to flatten it into a 2D side-view PNG, and
every other candidate found (Pixel Vehicle Pack, Racing Pack, OpenGameArt's
"Car Kit") is either the wrong style (pixel-art top-down) or the wrong
subject (generic sedans, no emergency-service liveries). See
`public/assets/cc0-library/README.md` for the full search trace. These
prompts are for a human to run through an image generator.

**No real reference image exists for this category** — corrected this pass:
`README.md` in this folder previously claimed `motorcycle` already had
real art at `police_motorcycle.png`; checked against the tree and that
file doesn't exist anywhere in the repo (only a 3D `.glb` model and an
unbuilt art spec, `PoliceMotorcycle.md`). All 19 files, `motorcycle`
included, are genuinely still flat-color placeholder. Rely on the written
style anchor below.

**Shared style anchor — paste this before every prompt below:**

> Digital illustration, side-view (3/4 front-quarter) of an emergency
> vehicle, semi-realistic but slightly stylized (not photoreal, not
> cartoonish), clean linework, matte finish, soft ambient shading, plain
> transparent or flat-white background, no environment/road/scenery, no
> text/watermark. Consistent camera height and scale logic across the
> whole set — a fire engine should read as visibly larger than a bike.

**Save path note:** `VEHICLE_ART` keys (`engine`, `ladder`, ...) do NOT
match the actual filenames on disk — the real files already exist as flat
placeholders under real, human-readable names (e.g. `engine` ->
`public/assets/vehicles/fire_engine.png`). Each heading below gives BOTH
the `VEHICLE_ART` key and the real save filename — save to the filename,
not the key.

## `engine` -> `fire_engine.png`
> [style anchor] + A red-and-white municipal fire engine (pumper truck),
> chrome front bumper, department livery, reflective striping, hose bed
> visible, ladder rack optional on top.

## `ladder` -> `ladder_truck.png`
> [style anchor] + A red fire department aerial ladder truck, longer
> wheelbase than the engine, visible folded aerial ladder on top, rear
> tiller cab optional.

## `rescue` -> `rescue_truck.png`
> [style anchor] + A red-and-white heavy rescue squad truck, boxy
> high-clearance body with multiple equipment compartment doors along the
> side, no hose bed.

## `battalion` -> `battalion_suv.png`
> [style anchor] + A red-and-white fire department SUV/command vehicle
> with a single light bar, chief's vehicle markings, smaller and sportier
> than the engine/ladder.

## `squad` -> `medic_squad.png`
> [style anchor] + A black-and-white (or blue-and-white) police patrol
> sedan, light bar on the roof, department shield decal on the door.

## `bls` -> `bls_ambulance.png`
> [style anchor] + A white-and-orange (or white-and-blue) box-style BLS
> ambulance, EMS star-of-life decal, rear patient compartment box body on
> a van chassis.

## `als` -> `als_ambulance.png`
> [style anchor] + Same box-style ambulance silhouette as `bls`, distinct
> livery accent (e.g. red trim instead of orange) to read as a step up in
> capability, ALS star-of-life decal.

## `criticalCare` -> `critical_care_unit.png`
> [style anchor] + A larger, more heavily-equipped ambulance (bigger box
> body, extra roof-mounted equipment silhouette), navy/white CCT livery,
> reads as more advanced than `als`.

## `criticalCareChase` -> `critical_care_chase.png`
> [style anchor] + A navy-and-white SUV or sedan in matching CCT livery
> to `criticalCare`, single light bar, no patient box (a chase/support
> vehicle, not a transport unit).

## `pdcar` -> `pd_patrol_car.png`
> [style anchor] + A plain dark sedan with subtle police-issue wheels and
> a small dash light bar, minimal or no visible livery (unmarked unit).

## `sergeantCar` -> `police_sergeant_car.png`
> [style anchor] + A black-and-white police sedan matching `squad`'s
> livery, sergeant chevron decal on the door, distinct from `pdcar`.

## `shercar` -> `sheriff_patrol_car.png`
> [style anchor] + A tan-and-brown (or green-and-white) sheriff's
> department patrol sedan, star badge decal on the door, light bar.

## `bike` -> `campus_pso_bike.png`
> [style anchor] + A campus/patrol-issue electric bicycle with a small
> rear pannier case and a compact light/siren unit mounted on the
> handlebars, no rider.

## `pickup` -> `volunteer_pickup.png`
> [style anchor] + A white fire-department or EMS utility pickup truck
> with a small light bar and department decal, plain flatbed or tool
> boxes in the bed.

## `chase` -> `volunteer_chase_car.png`
> [style anchor] + A white-and-red SUV quick-response vehicle in EMS
> livery, single light bar, no patient box — a supervisor/response
> vehicle, not a transport unit.

## `golfcart` -> `campus_golf_cart.png`
> [style anchor] + A small enclosed campus-safety golf cart, amber
> beacon light on the roof, campus PD or campus EMR decal on the side.

## `suv` -> `supervisor_suv.png`
> [style anchor] + A white-and-orange (or white-and-blue) EMS supervisor
> SUV, single light bar, star-of-life decal, distinct from the police
> `pdcar`/`squad` liveries.

## `helo` -> `air_medical_helicopter.png`
> [style anchor, adapted] + Side-view digital illustration of a medical
> transport helicopter, white-and-red livery, "life flight"-style rotor
> aircraft, semi-realistic but slightly stylized, matte finish, plain
> transparent background, no environment.

## `civilian` -> `civilian_car.png`
> [style anchor] + A plain, unbranded civilian sedan or hatchback in a
> neutral color (silver, blue, or gray), no livery, no light bar — used as
> a generic background/scene vehicle, not an emergency unit.

## `motorcycle` -> `police_motorcycle.png`
> [style anchor] + A police patrol motorcycle with a solo rider, black-
> and-white police livery, small windscreen-mounted light bar, saddlebag
> cases on the rear — should read clearly lighter/faster than the
> `squad`/`pdcar` sedans at a glance. See `PoliceMotorcycle.md` (this
> folder) for the original, more detailed spec this prompt is based on.
