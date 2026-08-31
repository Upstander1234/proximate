# Jason (ParamedicStories skit)

Covers `JASON_PERSONAS`/`jasonSpritePath()` in `src/assets.js`. A single named
one-off character, not part of the `CHARACTER_ROLES` combinatorial grid the
rest of this folder's README covers — Jason only ever appears in one scene
(`campaignLaptop`, `src/App.jsx`), so a per-character spec file is the right
shape here, the same way the player's own customization art gets its own
`CampaignCustomize.md` instead of living in the shared README.

## Purpose
The "ParamedicStories" skit the player watches in the campaign's laptop scene
(design doc §2.4, see `CampaignLaptopVideo.md`). Jason is a low-budget
EMS-meme-account creator who acts out all three parts of a short bystander
story solo — the responding firefighter, the panicking friend, the patient —
then breaks to camera as himself for the punchline setup. Four distinct looks
(`JASON_PERSONAS`), one per line-group in the skit's dialogue
(`VIDEO_LINES`/`campaignLaptop`, `App.jsx`), swapped one click at a time as
the player advances through the video the same way `VNDialogue` already
paces every other line in the game.

## Intended appearance
Framed like a cheap solo webshow, not a produced video — head-and-upper-body,
centered, plain/flat backdrop behind Jason himself (the surrounding "laptop
screen" bezel and studio-apartment background are handled by the scene, not
this art). Square crop (512×512), matching the same "portrait" footing every
other character sprite in this game uses, since `campaignLaptop` displays it
at that scale inside the video panel, not full VN height.

## Theme / style
Slightly low-fi, a little too enthusiastic — this is a low-budget skit video,
not a polished production. Each persona should read as an obvious, deliberate
costume/prop change a solo creator could actually pull off in one room, not a
believable disguise:
- **`firefighter`** — turnout jacket thrown on over a t-shirt, clearly a prop
  piece rather than full department-issue gear (he's a bystander/creator, not
  really on the job). Confident, "professional" expression — he's playing the
  responder.
- **`as_friend`** — no costume change, just a shift in body language and
  expression: wide-eyed, panicked, hands half-raised — the "I thought he was
  having a heart attack" energy.
- **`as_patient`** — sheepish, a little embarrassed, maybe clutching a knee or
  wrist — someone owning up to a dumb decision.
- **`as_himself`** — Jason's actual baseline look (whatever casual outfit he's
  "really" wearing under the bits above), a knowing half-smile straight to
  camera — the fourth-wall break.

## Important visual elements
Keep ONE consistent underlying face/build across all four so it's obviously
the same guy doing bits, not four different people — the joke depends on
recognizing him under each costume. `firefighter` is the only persona with an
actual prop/costume difference; the other three are expression/posture only.

## Notes for the artist / asset generator
Four images, not a combinatorial set — no gender/variant grid like
`CHARACTER_ROLES` below. `generate_placeholders.py` already produces a
flat-color placeholder for each of the four; this spec is for replacing those
by hand, not generating more of them.
