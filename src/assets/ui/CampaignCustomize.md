# CampaignCustomize

## Purpose
The Zero-To-Hero campaign's character-creation screen (design doc §2.2) —
name, gender presentation, skin tone, hairstyle, hair color, eye color,
starting outfit, outfit color, glasses (style + color), earrings
(style + color), necklace (style + color), and hat (style + color) —
"None" is a real, explicitly-chosen option for each of the last four, not a
fallback. This is the player's first real "who am I" moment in the
campaign, immediately after the Northwood University acceptance letter, and
the first screen that needs to look like it belongs to a visual novel
rather than a settings form. The attribute list grew past the original
design doc's four (gender/skin/hair/outfit) per explicit direct operator
instruction to keep the customization roster growing whenever good source
material turns up — see assets.js's own comment on `playerBasePath`/
`playerOutfitLayerPath`/`playerHairLayerPath`/`playerEyesLayerPath`/
`playerGlassesLayerPath`/`playerEarringLayerPath`/`playerNecklaceLayerPath`/
`playerHatLayerPath`. Treat this as an open-ended list, not a fixed one —
the next good source garment/accessory found should be added the same way.

## Intended appearance
A first-year dorm room (`BACKGROUNDS.dormRoom`) fills the frame behind the UI —
boxes still half-unpacked, a bed, a desk lamp on. The character-creation panel
sits over it as a semi-transparent dialogue-box-style card anchored toward the
bottom of the screen, in front of the background rather than replacing it, the
same visual grammar as every other Zero-To-Hero scene (see `VNShell`/`VNBox` in
`src/components/VNShell.jsx`). No option is pre-highlighted when the screen
first appears — every attribute row (gender, skin tone, hairstyle, hair color,
eye color, outfit, outfit color) reads as genuinely unselected until the player
cycles it with the arrow buttons, and Confirm stays disabled until every one of
them is chosen. This matters narratively as much as mechanically: it's the
player's first real choice in the game, and a screen that already has answers
filled in undercuts that.

## Portrait system (implemented, not just planned)
A live preview DOES exist — a 480x720 portrait composited from up to EIGHT
independently-generated layers, stacked bottom to top: base body (gender x
skin tone, bald/neutral), outfit (style x color), earrings (style x color,
optional), necklace (style x color, optional), hair (style x color), eyes
(color), glasses (style x color, optional), and hat (style x color,
optional) — glasses and hat both render on top of everything (hat last of
all), earrings and necklace both render UNDER hair (a real composite check
found an earring drawn on top of a long hairstyle reads as floating on the
hair rather than worn on the ear; letting hair partially occlude it, the way
real hair does, reads correctly — necklace uses the same order for
consistency, though this pack's own hairstyles don't drape low enough for
it to matter visually yet). Each layer is a full-canvas transparent PNG
outside the pixel band that axis actually occupies, so the `<img>` elements
can be absolute-positioned directly on top of each other and the picture
updates live as any attribute changes. This replaced an earlier one-flat-
file-per-full-combination scheme specifically because it doesn't scale:
flat combinations multiply every axis together (would be in the thousands
once hair color/eye color/more styles/glasses/earrings/necklace/hat were
added), while layers only ADD across axes — glasses cost 5 styles x 6
colors = 30 files, earrings cost 3 styles x 6 colors = 18 files, necklace
costs 4 styles x 6 colors = 24 files, and hat costs 4 styles x 6 colors =
24 files, none a multiplier on any other axis. See `src/assets.js` for the
path helpers each layer resolves through (`playerBasePath`/
`playerOutfitLayerPath`/`playerHairLayerPath`/`playerEyesLayerPath`/
`playerGlassesLayerPath`/`playerEarringLayerPath`/`playerNecklaceLayerPath`/
`playerHatLayerPath`, all composed by the single `playerPortraitLayers()`
entry point) and `scripts/build_player_*_from_cc0.py` for how each layer's
real CC0 art was built (base/outfit/hair/eyes were placeholder-labeled color
bands at first; by this revision every layer is real CC0 art — see
`public/assets/cc0-library/README.md` for the full per-layer sourcing
detail, kept current there rather than duplicated here).

Base/outfit/earrings/necklace/glasses all share `female-character-sprite-
creator`'s own canvas and a real, measured source-to-canvas offset
(`canvas = source - 460, source - 480`); hair/eyes come from an unrelated
Kenney pack placed by hand-tuned constants — a genuinely different
coordinate system. Earrings and necklace both use the native pack offset
directly (confirmed correct by a real composite check against the shipped
base body, which shares that same pack/coordinate system). Glasses do NOT
use the native offset — they deliberately target the CURRENTLY RENDERED eye
position (the hand-tuned one), not the source pack's own "correct" eye
position, since gluing them to the wrong reference would look misaligned
against what the game actually shows. The hat's "sun" style ALSO needs an
override, for a third, different reason — the native offset drops the
brim down over the eyebrows; a real composite sweep found the correct
additional vertical shift (see `scripts/build_player_hat_from_cc0.py`'s
own header for the measurement). The hat axis's other three styles
(cap/beanie/headphones) come from a DIFFERENT pack entirely
(`male-character-sprite-creator`, not `female-character-sprite-creator`)
with its own dynamic, bbox-centered positioning transform rather than a
fixed offset — see `scripts/build_player_hat_styles2_from_cc0.py`'s own
header for the full transform and the per-style vertical corrections it
required, each confirmed against BOTH genders' shipped base bodies. See
`scripts/build_player_glasses_from_cc0.py`'s,
`scripts/build_player_earrings_from_cc0.py`'s,
`scripts/build_player_hat_from_cc0.py`'s, and
`scripts/build_player_hat_styles2_from_cc0.py`'s own header comments for
the full reasoning and the measurements that established each.

## Investigated and skipped this pass (documented so it isn't retried blind)
`female-character-sprite-creator`'s own `Accessory/Mask` folder was
visually inspected and skipped in full: `Mask 1` is a small adhesive
bandage/eye-covering with straps (reads as an injury marker, not a fashion
choice — wrong for a "who are you, before anything's happened to you yet"
character-creation moment), `Mask 2` is a kitsune/fox festival mask (too
costume-y/whimsical for this game's register), `Mask 3` is a small
band-aid (same injury-marker problem as Mask 1). `Hair/Bangs`,
`Hair/Extension`, and `Hair/Ahoge` were all inspected and skipped for a
different reason: they render in a crisp, flat-color cel-shaded anime
line-art style that visibly clashes with the currently-shipped hairstyles
(sourced from an unrelated Kenney pack, softer/painterly) — adding them
would mean either mixing two incompatible art styles on the same hair
layer or replacing the entire existing hair system, neither of which is
"adding an axis." The male pack's own `Accessory/Hats` folder was checked
too: `Hat 2`/`Hat 3` are the same mislabeled hair-tie shape the female
pack's own `Hat 2`/`Hat 3` already turned out to be; `Hat 3`(berries),
`Hat 6`(swim goggles), and `Hat 9`(santa hat) are all real but seasonal/
costume items, skipped for register reasons — `Hat 1`/`Hat 7`/`Hat 8` (the
three that shipped) were the only genuinely general-purpose, year-round
wearable items in either pack's Hats folder.

## Theme / style
Warm, a little messy, lived-in — the opposite of a sterile settings screen.
Match the app's existing amber/warm-neutral accent on interactive chips (see
the amber `C.amber` used throughout the campaign UI) rather than introducing a
new accent color for this one screen.

## Important visual elements
- Dorm room background, soft focus, evening light through a window.
- A grounded, human illustration style for whatever preview of the character
  eventually renders (not implemented yet — today the screen is text/chips
  only; a live character preview reacting to the chosen options is a natural
  future addition, not attempted this batch).
- The dialogue-box-style panel should feel consistent with `campaignLetter`
  and `campaignWelcome`, the two screens immediately before and after this one
  in the flow, so the transition between them doesn't feel like leaving the
  visual novel and re-entering it.

## Notes for the artist / asset generator
Keep the room recognizably a COLLEGE dorm, not a bedroom in a house — bunk-bed
proportions, cinderblock or thin-drywall walls, a mini-fridge, a corkboard —
since the game's own narration leans on "first year of college, first time
living away from home" as the emotional register for this whole scene.
