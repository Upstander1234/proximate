# Vehicle models — Kenney "Car Kit" (CC0)

Real, low-poly GLB vehicle models, sourced this session as the "stretch goal"
half of the visual-realism pass (CLAUDE.md's item-1 priority: replace the
primitive box-geometry vehicle exteriors with actual meshes). Downloaded
directly from `kenney.nl/assets/car-kit`, version 3.1.

**License: CC0 (Creative Commons Zero)** — public domain, no attribution
required (see `LICENSE.txt` in this folder, the pack's own unmodified
license file). Kenney's own site states these may be used for personal,
educational, and commercial purposes with no restrictions; crediting
"Kenney" or "www.kenney.nl" is appreciated but explicitly not required.

Six of the pack's ~45 models were kept (the rest — karts, tractors, generic
debris props — aren't used by anything in this game and were left out to
keep the download small):

| file | used for (`VEHICLE_PROFILES` cockpit / vehType) |
|---|---|
| `ambulance.glb` | `als`, `bls` |
| `firetruck.glb` | `engine` |
| `police.glb` | `pdcar` |
| `suv.glb` | `suv` |
| `sedan.glb` | (fallback sedan-cockpit vehType) |
| `truck.glb` | `pickup` |

No motorcycle, bike, or golf-cart model exists in this pack (its own
"kart" models are go-karts, not a real match) — those vehTypes used to keep
primitive-geometry exteriors; `bike`/`motorcycle` are now filled from other
sources (below), `golfcart` is still open.

Loaded via `three/examples/jsm/loaders/GLTFLoader.js` in
`src/components/DrivingScene.jsx`, replacing the flat colored box that
used to stand in for the parked/boarding-stage vehicle exterior.

## `bicycle.glb` — a real bicycle, sourced but NOT wired (superseded by `ebike.glb`)

Sourced separately, later session, per the standing "keep searching for a
motorcycle/bike/golf-cart model" request — a genuine bicycle (pedal, no
motor). **CC0, but from a different source and pipeline than everything
else in this folder** — OpenGameArt.org's "3D Vehicles Pack" by an
OpenGameArt contributor (not Kenney), released under CC0
(`creativecommons.org/publicdomain/zero/1.0`), originally shipped only as
`.blend`/`.fbx`/`.obj+.mtl` — no `.glb` in the original pack. Converted to
`.glb` locally via `obj2gltf` (`npx obj2gltf -i bicycle.obj -o bicycle.glb
--binary`), a lossless format conversion, not a re-model — the source
`.obj`/`.mtl` were discarded after conversion, only the resulting `.glb` is
kept in the repo.

**Self-contained, no shared `colormap.png` dependency** (unlike every other
file in this folder) — the source `.mtl` declares one flat, untextured
gray material (`Kd 0.8 0.8 0.8`, no texture map), confirmed by reading the
`.mtl` before conversion, so the model needs nothing external to render; it
will just render plain gray rather than picking up this pack's shared
livery atlas.

**Status: present in this folder, NOT wired.** Once a real e-bike
(`ebike.glb`, below) was sourced, it became the better match for `pso`/
Campus PD's `bike` vehType — a police e-bike patrol is literally an
electric bike, not a plain pedal one — so `bicycle.glb` was passed over
rather than wired. Kept in the folder as a real, valid, unused alternative
in case a future decision prefers the plain-bicycle look.

## `scooter.glb` — a real motor-scooter model, NOT confirmed electric, NOT wired

Sourced from `poki3d.itch.io/low-poly-vespa` ("Low Poly Vespa," CC0 — the
creator's own page states "Feel free to use it for anything (CC0)"), ships
with a real `.glb` directly (no conversion needed, unlike `bicycle.glb`
above). **Downloaded via a scripted itch.io "name your own price, $0"
checkout flow** — confirmed itch.io does NOT run the same Cloudflare
bot-challenge poly.pizza does, so a Playwright script driving the real
"Download Now" → "No thanks, just take me to the downloads" → per-file
"Download" button sequence works end to end; the resulting file is the
site's own real asset, not reconstructed or guessed at.

**Honesty check against the actual ask, since the operator specifically
asked for an e-bike, not any two-wheeler**: this is a classic Vespa-style
motor scooter — the source page and model itself never specify an electric
drivetrain (historically Vespas are gas-powered; nothing about this
model's geometry or metadata confirms an "electric" variant specifically).
It is visually the closest real, CC0, GLB-ready powered two-wheeler found
across every source checked this session (Kenney x5 packs, poly.pizza,
Quaternius/itch.io, OpenGameArt, and a wider itch.io tag sweep covering
~30 bike/motorcycle/moped-tagged listings — most paid, several 2D sprites,
this one the best real 3D CC0 match) — but it is not verified to literally
BE an e-bike, and is presented here as the closest available stand-in, not
a confirmed match. **Self-contained** (confirmed via the same GLB-JSON
inspection technique as `bicycle.glb`: `images: []`, 11 flat-colored
materials, 9 meshes) — renders in its own real light-blue/tan/silver
livery, unlike `bicycle.glb`'s flat gray. **Status: present in this
folder, NOT wired** — a real, confirmed motorcycle (`motorcycle.glb`,
below) was later found and wired to the `motorcycle` vehType instead, so
this scooter stays unused rather than being force-fit anywhere. Kept as a
real, valid alternative for `motorcycle` if the scooter look is ever
preferred over the below.

## `ebike.glb` — a real e-bike, wired to the `bike` vehType

Operator-sourced (found and dropped into this folder directly, not via an
automated pipeline this session) — a genuine electric bicycle, the literal
match for `pso`/Campus PD's `bike` vehType this project had been searching
for since `bicycle.glb`/`scooter.glb` were each found to be an imperfect
stand-in (plain pedal bike; not-confirmed-electric scooter, respectively).
**Wired**: `VEHICLE_MODEL_URL.bike = "ebike.glb"` (`DrivingScene.jsx`).
Larger file (2.5 MB, vs. `bicycle.glb`'s 86 KB and most Car Kit models'
~150-250 KB) — not yet investigated further (texture resolution, mesh
density) since it renders correctly; worth a look if load time on this
model specifically ever becomes a concern.

## `motorcycle.glb` — a real CC0 motorcycle, wired to the `motorcycle` vehType

Sourced from OpenGameArt's "Fancy Motorcycle" (`opengameart.org/content/
fancy-motorcycle`) — **CC0**, confirmed via the page's own license field
("public domain zero"), direct download with no login/signup gate (unlike
Meshy/Sketchfab, both dead ends across earlier sessions for this exact
search). Shipped only as `.blend`/`.obj` (no `.mtl` — genuinely untextured,
10,000 triangles per the source page) — converted locally via `obj2gltf`
(`npx obj2gltf -i bike.obj -o motorcycle.glb --binary`), the same
lossless-conversion idiom `bicycle.glb` already established; the source
`.obj` was discarded after conversion. Confirmed self-contained (`images:
0`) via the same GLB-JSON inspection technique used throughout this
project.

**Wired**: `VEHICLE_MODEL_URL.motorcycle = "motorcycle.glb"`
(`DrivingScene.jsx`), plus a new `moto` case added to that file's
`vehExtSize` cockpit-box table (`{w:0.6, h:1.1, d:2.0}` — narrower/lower
than the bike box, longer for the engine/wheelbase) since no such case
existed before this — `VEHICLE_PROFILES.motorcycle.cockpit` is `"moto"`,
and without a matching box case it would have scaled the real mesh against
the much larger default sedan/ambulance box.

## The RgsDev "Free Low Poly Vehicles Pack" — 8 models converted, giving `engine`/`rescue`/`ladder` and `pdcar`/`shercar`/`chase` real distinct meshes for the first time

Full pack downloaded from its OpenGameArt mirror
(`opengameart.org/content/free-low-poly-vehicles-pack`,
`free_low_poly_vehicles_pack_by_rgsdev.zip`, direct link, no login) —
**CC0**, confirmed via the pack's own `LICENSE.txt` (kept in this folder as
`LICENSE-rgsdev.txt`): "This asset is under CC0 License. Public domain and
free to use on any project, even commercial. Credit is not required." 21
vehicles total, shipped as one `.fbx` per vehicle (no `.glb` in the
original pack). Converted locally via the `fbx2gltf` npm package (a Node
wrapper around Facebook's `FBX2glTF` tool — installed with `npm install
--no-save fbx2gltf`, invoked as `FBX2glTF.exe --binary -i <in>.fbx -o
<out>.glb`), a new conversion pipeline for this repo (every prior
FBX-sourced conversion, e.g. the fire hydrant, arrived pre-converted by its
original creator — this is the first time this project converted FBX
itself). All confirmed self-contained after conversion (`images: 0` on
every file — flat/vertex-colored materials, no texture dependency, the
same "no textures" style the pack's own listing describes).

Eight of the 21 were kept and wired — chosen specifically to break
`engine`/`rescue`/`ladder` and `pdcar`/`shercar`/`chase` out of each
sharing one single model (their pre-existing state):

| file | source vehicle | used for |
|---|---|---|
| `firetruck-ladder.glb` | "Truck with trailer" | `ladder` (the visually "biggest" of the three fire vehTypes) |
| `rescue-van.glb` | "Van" | `rescue` (a heavy-rescue squad is commonly a walk-in box van, not a pumper) |
| `police-suv.glb` | "Police SUV" | `shercar` (Sheriff) |
| `police-chase.glb` | "Police Muscle" | `chase` (pursuit-rated) |

`engine`/`pdcar` keep their original Kenney models (`firetruck.glb`/
`police.glb`) — no change needed there, they already had a distinct,
correct-looking mesh.

**Four more were converted but are NOT wired to anything** — kept as real,
valid, sourced variety for a future differentiation pass, not because
anything is wrong with them: `ambulance2.glb` (a second ambulance look, if
`als`/`bls` are ever split visually), `police-sedan2.glb` (a second sedan
look, alternative to the current Kenney `police.glb`), `suv2.glb`
(alternative to the current Kenney `suv.glb`). The pack's remaining 13
models (Hatchback, Limousine, Monster Truck, Muscle, Muscle 2, Pickup,
Police Sports, Roadster, Sedan, Sports, Taxi, Bus, Truck) were not
converted — no vehType in this project currently needs any of them; the
full original pack (`.fbx`, unconverted) was not kept in the repo, only
the 8 already-useful conversions above, per this project's own "download
what's useful, not everything blind" judgment call for a pack this size
(unlike the Furniture/Racing Kenney kits, which were kept in full because
they were small and the "keep everything" call was made deliberately for
those).

## `golfcart.glb` — a real golf cart, wired to the `golfcart` vehType

Operator-sourced (found and dropped into this folder directly, same
pipeline as `ebike.glb` above) — closes the last of the three vehTypes
(`bike`/`motorcycle`/`golfcart`) that used to fall through to the flat-box
fallback. Confirmed self-contained via the same GLB-JSON inspection
technique used throughout this project (25 meshes, 1 material, 0 images —
vertex/flat-colored, no external texture dependency). **Wired**:
`VEHICLE_MODEL_URL.golfcart = "golfcart.glb"` (`DrivingScene.jsx`) — no new
`vehExtSize`/cockpit-box case was needed, since `golfcart`'s cockpit
(`"cart"`, `{w:1.5,h:1.7,d:2.6}`) already existed from before any real cart
model was found.

This closes the search documented above: an extensive check (Kenney,
Quaternius's full 83-pack catalog, five separate OpenGameArt CC0 vehicle
collections, itch.io's CC0-tagged collections, and poly.pizza — poly.pizza
had two models literally titled "Golf cart," both confirmed CC-BY, not
CC0, disqualified under this project's licensing standard) never found one;
the operator sourced this one independently.
