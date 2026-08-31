# Building models — Kenney "City Kit (Commercial)" (CC0)

Real, low-poly GLB building models sourced the same session as
`../vehicles/`/`../people/`, continuing the item-7 stretch goal past
vehicles/pedestrians into the scene's other biggest remaining primitive:
map buildings, which were flat colored boxes. Downloaded from
`kenney.nl/assets/city-kit-commercial`, version 2.1.

**License: CC0** — public domain, no attribution required (see
`LICENSE.txt`, the pack's own unmodified license file).

7 of the pack's 40 models were kept, one per `map.buildings` entry `type`
this game already uses (`hospital`/`clinic`/`school`/`business`/`house`/
`default`), plus a spare skyscraper variant — **the spare is no longer
unused, see below**:

| file | used for (`map.buildings[].type`) |
|---|---|
| `building-skyscraper-a.glb` | `hospital` |
| `building-c.glb` | `clinic` |
| `building-e.glb` | `school` |
| `building-b.glb` | `business`, `cityHall` |
| `building-d.glb` | `house` |
| `building-a.glb` | any other/`default` |
| `building-skyscraper-c.glb` | `skyscraper` |

None of these are a literal match for "hospital" or "school" — the pack has
no medical/civic-specific models — chosen for rough massing/silhouette
variety instead. `Textures/colormap.png` is a shared texture atlas all 7
GLBs reference externally (same pattern as `../vehicles/Textures/`).

Loaded via `GLTFLoader` in `src/components/DrivingScene.jsx`, scaled
per-axis to the exact `w`/`h`/`d` box size each building `type` already
used, so the real mesh occupies the identical footprint the old flat box
did. The box itself is kept as the fallback — hidden only on a successful
load, per this project's established "honest fallback" pattern — so a
slow/failed fetch degrades to the box rather than leaving a gap.

## `cityHall` and `skyscraper` — two new building types (map-expansion content pass)

Added when `CITY_MAP` (`src/data/maps.js`) grew from a 5x5 to a 7x7 grid and
picked up real civic/downtown content for the first time: a City Hall
building, and two `skyscraper`-type businesses ("Northwood Tower",
"Northwood Grand Hotel") — the real answer to "does the city have
skyscrapers," previously only true of the trauma-center hospital's own
model. Both reuse already-downloaded meshes rather than sourcing anything
new: `cityHall` shares `business`'s own `building-b.glb` (no dedicated
civic/government model exists in this pack) at a taller size
(`w:26,h:14,d:20`, vs. business's `w:12,h:10,d:10`); `skyscraper` is the
first real consumer of the previously-unused spare `building-skyscraper-c.glb`,
at `w:22,h:26,d:22` — the tallest building type in the game, taller even
than the trauma-center hospital's own `-a` skyscraper. Both types are
`city`-map-only in practice today (no `cityHall`/`skyscraper` building
exists on `SUBURBAN_MAP`/`RURAL_MAP`), matching this project's own
"downtown density belongs to the urban map" precedent (the university is
the same kind of urban-only exception). `src/data/buildingStyles.js` (the
CityMap.jsx icon/color registry) and the `sizeFor`/`bMats` tables in
`DrivingScene.jsx` both have real entries for these two types now — neither
falls through to a generic default.
