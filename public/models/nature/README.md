# Tree models — Kenney "Nature Kit" (CC0)

Real, low-poly GLB tree models sourced the same session as `../vehicles/`,
`../people/`, and `../buildings/`. Downloaded from `kenney.nl/assets/nature-kit`,
version 1.0.

**License: CC0** — public domain, no attribution required (see
`LICENSE.txt`, the pack's own unmodified license file).

4 of the pack's 330 models were kept, for roadside variety:

| file |
|---|
| `tree_default.glb` |
| `tree_oak.glb` |
| `tree_pineTallA.glb` |
| `tree_thin.glb` |

Self-contained (vertex-colored, no external texture file needed — confirmed
by inspecting each GLB's own glTF JSON chunk directly: `images: []`),
unlike the vehicle/building packs.

`DrivingScene.jsx` scatters these along the sidewalk/shoulder area of every
driven route segment (roughly one spot per 14m of segment, per side),
alternating through all 4 varieties. This is purely cosmetic decoration —
not collidable, not part of the obstacle system — so there is no primitive
fallback: a failed/slow load for one variety just means that variety's
spots stay empty, not a functional regression.
