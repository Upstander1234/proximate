# Street prop models — Kenney "City Kit (Roads)" (CC0)

Real, low-poly GLB roadside prop models, sourced the same session as
`../vehicles/`, `../people/`, `../buildings/`, and `../nature/`. Downloaded
from `kenney.nl/assets/city-kit-roads`, version 2.0.

**License: CC0** — public domain, no attribution required (see
`LICENSE.txt`, the pack's own unmodified license file).

5 of the pack's ~70 models were kept (the pack is overwhelmingly road-tile
geometry this game doesn't use — it already has its own road system — these
are the standalone roadside props):

| file | placed as |
|---|---|
| `light-curved.glb` | streetlight (curved-arm pole) |
| `light-square.glb` | streetlight (square-head pole) |
| `construction-cone.glb` | traffic cone |
| `construction-barrier.glb` | construction barrier |
| `sign-highway.glb` | roadside highway sign |

Needs `Textures/colormap.png` externally, same shared-atlas pattern as
`../vehicles/`/`../buildings/`. No hydrants exist in ANY Kenney pack found
across two sourcing passes (this one, plus a follow-up search that also
checked City Kit Suburban, Furniture Kit, Generic Items, and Racing Kit).

## `fire-hydrant.glb` — real hydrant, closes the gap above, NOT wired yet

A genuine Quaternius CC0 model (`FBX2glTF`-generated, confirmed via the same
GLB-JSON inspection technique used elsewhere in this repo). Quaternius
releases every asset in their catalog as CC0 public domain — no separate
`LICENSE.txt` ships with this single file, so that's a source-level
guarantee rather than a per-file one, consistent with how this project has
already treated other single-file Quaternius-style finds this session.
**Self-contained despite having a real texture**: it declares one image
(`Zombie_Atlas.png` — an odd shared-atlas name left over from whatever
larger Quaternius pack it was originally cut from, harmless) referenced via
`bufferView`, not an external `uri` — the PNG is embedded directly in the
GLB's own binary chunk, so unlike `light-curved.glb`/`construction-cone.glb`
etc. in this same folder, it needs no `Textures/colormap.png` dependency to
render correctly.

**Status: present in this folder, NOT wired into `DrivingScene.jsx`.**
Placement would follow the same idiom as this folder's other cosmetic,
non-collidable props (streetlights/cones/barriers) — a spot-generation pass
along driven route segments, most naturally at intersections/curb corners
rather than mid-block. No primitive fallback exists for it today since
nothing currently spawns a hydrant placeholder to fall back from.

**Benches and a trash can WERE found** — in Kenney's
"Furniture Kit," of all places, since it's actually an interior+exterior
furnishings pack, not interior-only — see `../library/furniture/README.md`.
`bench.glb`/`benchCushion.glb`/`benchCushionLow.glb`/`trashcan.glb` are
sitting in that library folder, self-contained (no external texture, unlike
everything in this folder), but NOT yet copied here or wired into any
placement logic — still open, same as the construction-cone/barrier/sign
gap two paragraphs up.

`DrivingScene.jsx` scatters streetlights alternating sides along the
sidewalk edge of every driven route segment (same spot-generation idiom as
`../nature/`'s trees, coarser spacing), and construction cones/barriers near
the map's own construction-zone hazard markers where present. Purely
cosmetic decoration — not collidable — so, like trees, there is no
primitive fallback: a failed/slow load just leaves that spot without a prop,
not a functional regression.
