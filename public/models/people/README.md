# Pedestrian models — Kenney "Blocky Characters" (CC0)

Real, rigged, animated GLB character models — the item-7 stretch goal
(CLAUDE.md's own priority list: "real pedestrians + animations"), sourced
the same session as `../vehicles/`. Downloaded from
`kenney.nl/assets/blocky-characters`, version 2.0.

**License: CC0** — public domain, no attribution required (see
`LICENSE.txt` in this folder, the pack's own unmodified license file).

The full pack ships 18 character variants (`character-a` through
`character-r`); 6 (`a`-`f`) were kept here to cover pedestrian variety
without a large download. Each has its own matching texture
(`Textures/texture-a.png` etc — unlike the vehicle pack, these are NOT a
shared atlas, each character is textured independently).

**Real baked animation clips**, confirmed by inspecting the GLB's own
glTF JSON chunk directly (not assumed from the pack description):
`static`, `idle`, `walk`, `sprint`, `sit`, `drive`, `die`, `pick-up`,
`emote-yes`, `emote-no`, `holding-*`, `attack-*`, `interact-*`,
`wheelchair-*`. `DrivingScene.jsx`'s spawned pedestrian obstacles play
`walk` on loop via `THREE.AnimationMixer` — a genuine walk cycle, not a
static pose. `sprint` exists and is a real, obvious future hook for "flee
the scene" behavior if a future batch wants it (not wired up this pass —
the current siren-reaction model has pedestrians calmly stepping to the
curb, not fleeing, which is the more common real reaction to an approaching
ambulance).

Loaded once at mount via `GLTFLoader`, then cloned per spawned instance
via `three/examples/jsm/utils/SkeletonUtils.js`'s `clone()` (safe for both
skinned and node-hierarchy-animated rigs — these models animate via node
transforms, not vertex skinning, confirmed by the GLB's own `skins: []`).
The original capsule mesh is kept as the fallback for any spawn that
happens before preload finishes, or if the fetch fails outright — same
"box stays as the honest fallback" pattern the vehicle models use.
