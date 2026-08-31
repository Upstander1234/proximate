# Browser-automation tooling

A real headless-Chromium test harness for this app, built because none
existed — CLAUDE.md's front-end sections had repeatedly noted "there is no
UI test harness" and several campaign-chapter batches shipped with "no
in-browser click-through happened" as a known, honest gap. This closes
that gap generally, not just for one feature.

## What's here

- **`driver.mjs`** — the reusable part. Wraps Playwright with:
  - `launch()` — headless Chromium, collects console errors/page errors.
  - `clickText(page, text)` — click the first element containing that text.
  - `setState(page, patch)` / `getState(page)` — read/write the live React
    state directly via a dev-only hook (`window.__proximateTestSetState`/
    `__proximateTestGetState`, exposed from `App.jsx`, gated on
    `import.meta.env.DEV` so it never ships in a production/itch.io build).
  - `waitForPhase(page, phase)`.
- **`campaignSmoke.mjs`** — the first real consumer. Establishes a genuine
  Zero-To-Hero character via real clicks (title → new save → name →
  Career Mode → Zero-To-Hero), then jumps `g.phase` through every Chapter
  1/2/3/7/8/9/10 screen via `setState`, checking each renders with no
  console errors and a non-empty page. `npm run smoke:campaign`.
- **`clickThroughCh1.mjs`** — a narrower, REAL click-through test (arrival
  prompt → gear-up dialogue → the actual queue-seeding logic → "station"),
  proving the button handlers themselves work, not just that a given state
  renders. Asserts the seeded queue is really 3 calls drawn from
  `CH1_CALL_POOL`.
- **`clickThroughCh1to3.mjs`** — a REAL click-through of the Chapter 1 End
  → Chapter 2 → Chapter 3 End boundary: every choice button and dialogue
  advance is a real click, including both branches of the probabilistic
  funding-cut incident (§1.6.12) if it fires. Closes the specific gap
  CLAUDE.md's F1 queue entry named as its top priority ("no in-browser
  click-through of Chapters 1-3/8-10 has happened yet") for the Ch.1-3
  half. Skips only the actual 3-call tutorial shift needed to reach
  `campaignCh1End` in the first place (a separate, already-proven surface
  — see `clickThroughCh1.mjs`) via one `setState` jump; every transition
  from there through `campaignCh4Intro` is real.
- **`clickThroughCh8to10.mjs`** — the same real click-through treatment for
  the other half of that gap: Chapter 8 (Paramedic School — application,
  entrance exam, interview, the admission letter, all 5 clinical rotations
  including the real "Attempt intubation" mini-loop, the field internship's
  real queue-seeding, the final exam) through Chapter 9 into Chapter 10
  (Advanced Roles) and back to the Chapter 9 hub. Skips Chapters 4-7 (a
  separate prerequisite chain, its own gap) via one `setState` jump to
  `campaignCh8Intro`, and skips actually playing the internship's 5 calls
  (core gameplay, not campaign phase-wiring) via a second jump straight to
  `campaignCh8InternshipReview` — every other transition is a real click.
  Both RNG-gated steps (paramedic admission chance, exam rolls) run their
  real formulas off stat-boosted state rather than being bypassed; a
  rejected admission roll (rare at the ~97% chance this script sets up) is
  the one place state is force-corrected afterward, logged when it happens.
- **`verifyCustomScenarioSave.mjs`** — closes two of F10's (Medical
  Simulation mode's custom-scenario builder) three "still open" items: a
  real in-scene wound render for a multi-condition trauma+chronic custom
  case (`abdominalGSW` + `epilepsy`), and a real save/reload round-trip of
  `g.customParams.conditions` — reload goes through a genuine fresh
  navigation plus the real `doContinue()`/`loadSave()` code path, not a
  localStorage bypass; the write side is the app's own real autosave effect
  (fires the instant `phase` becomes `"kit"`), not something this script
  fakes.
- **`verifyCustomScenarioFbaoClear.mjs`** — closes F10's third "still open"
  item: confirms `fbao` (Foreign Body Airway Obstruction) combined with a
  chronic comorbidity still clears via real chest-compression clicks in a
  live scene, exercising `App.jsx`'s `conditionHas(condition,"fbao")` branch
  against an actual array-shaped `customParams.conditions` selection.
- **`clickThroughDrivingMinigame.mjs`** — real in-browser playtest of
  `DrivingScene.jsx`, the single real 3D drive-in that now runs for every
  mode (Sandbox/Career/Master of Your Scope/Zero-To-Hero/co-op), replacing
  what used to be two separate implementations (a 2D top-down canvas
  minigame for solo play, a co-op-only 3D scene). Real clicks to a
  scenario's response phase with a vehicle (EMS Supervisor, `fleet.js` type
  `"suv"`, not `"none"`) so a drive scene exists at all, then REAL keyboard
  input (`page.keyboard.down/up`, not `setState` — this component's physics
  live entirely in refs, invisible to `__proximateTestGetState`): confirms
  the WebGL `<canvas>` (`THREE.WebGLRenderer`'s own `domElement`) renders
  the instant it mounts (unlike the old 2D minigame, there is no ready/
  countdown gate), confirms holding `w` measurably raises the HUD's live
  MPH readout, exercises D then A steering, sets CALL SPEED to 4× via the
  real Settings toggle (the same "speed up a real-time wait" idiom other
  scripts here use for busy-timers, applied to the real map-derived drive
  time instead) so the response phase's real travel time elapses quickly on
  the City map's short edges, then confirms the phase transition to
  "approach" unmounts the scene and lands `g.driveMiniDone`/`g.speedBoost`
  in global state — the real, unmount-driven finish (there is no more
  fixed-length "result" overlay/`Keep rolling →` button to click).
  Screenshots at each stage (`screenshots/drive-*.png`) confirm visually,
  not just via text match, that the scene renders correctly.
- **`clickThroughCh4to7.mjs`** — the other half of F1's "no in-browser
  click-through of Chapters 4-7" gap (clickThroughCh1to3.mjs/
  clickThroughCh8to10.mjs already closed Ch.1-3 and Ch.8-10). A REAL
  click-through of Chapter 4 (EMT School) → Chapter 5 (Employment) →
  Chapter 6 (AEMT School) → Chapter 7 (AEMT: New Responsibilities), landing
  on `shiftSummary`. Skips only Chapters 1-3 (a separate, already-proven
  surface) via one `setState` jump to `campaignCh4Intro` with a plausible
  post-Chapter-3 fixture; every transition from there is a real click,
  including both the Ch.4 funding-cut incident and all 3 rounds of Ch.6's
  schedule-conflict beat. Found and fixed a real, previously-undiscovered
  crash bug while building this — see the gotchas list below.
- **`verifyPlayerSpriteReuse.mjs`** — closes F8's one real item: confirms
  the player's own layered portrait (built at `campaignCustomize` via a real
  character-creation click-through, including real `▲ Confirm`) reappears
  via `VNSprite`'s `layers` prop in three later Zero-To-Hero VN scenes
  (`campaignHeatStrokeAftermath`, `campaignLibraryEncounter`, `offDuty`).
  Checks the rendered DOM's `<img src>` values directly rather than network
  responses — see the gotchas list below for why the network-based version
  gave a false negative. Found and fixed two real rendering bugs (a
  zero-width layer wrapper, and two sprites stacking vertically instead of
  sharing a row) neither of which a code read alone would have caught.
- **`verifyPatrolPartnerCrewSeat.mjs`** — closes F7 (CLAUDE.md queue): the
  Zero-To-Hero campaign's PATROL partner (`relationships.partner_patrol`)
  used to be a `VNSprite`-only narrative presence with no real crew seat.
  Real-clicks "Begin your PATROL" and confirms `g.roster` gets a fixed,
  free, Layperson entry built from that relationship; real-clicks through
  `campaignPreCall1`'s dialogue and `kit`'s own "Head over" button (the
  actual `beginCall()`/`ownCrew` call sites) into a live scene and confirms
  `g.crew` contains the partner; real-clicks the Crew tab and confirms a
  LAYPERSON card with real task buttons renders (screenshot-confirmed); and
  real-clicks "Compressions" on the partner's own card and confirms
  `g.cBusy` picks up a real task under their id.
- **`verifyMosPatrolFixedCrew.mjs`** — the other half of F7: a Master-of-
  Your-Scope player (not the zth campaign) manually picking `patrol`
  through the ordinary level → department → vehicle → partners wizard now
  also gets a real, generic, anonymous fixed partner (`fleet.js`'s
  `patrol` kind gained a `fixedCrew`, the same idiom flight's pilot already
  used). Real-clicks Career Mode → Master of Your Scope → Layperson →
  Campus PD → "PATROL Volunteer" and confirms `g.roster` carries a fixed,
  free, Layperson entry with a real (non-undefined) `id` and that the
  "partners" screen's fixed-crew note text is the newly-generalized
  non-pilot copy, not the old hardcoded "flies the aircraft" line.
- **`verifyCampusVehicleSpeed.mjs`** — closes the other real item under F1:
  Chapter 3's PATROL path used to narrate a "widened action set" and an
  "e-bike/golf-cart" upgrade with no mechanism behind either. The widened
  action set turned out to need no new code (it's already a direct
  consequence of `g.level` advancing to "emr" via the existing `why()` scope
  gate); the e-bike/golf-cart half needed a real, previously-missing
  vehicle-type response-time multiplier (`scope.js`'s new
  `VEH_TYPE_TRAVEL_MULT` — every non-Layperson response used the identical
  drive-time formula before this, so a campus bike and a fire engine
  "arrived" in the same time). Real-clicks Medical Education Mode → EMR →
  Campus PD and confirms all three Campus PD vehicle kinds (PATROL
  Volunteer / PSO / Campus EMR) are real, listed, clickable choices at EMR
  level (not just PATROL Volunteer); real-clicks "Public Safety Officer" and
  confirms `g.myVeh.type==="bike"` from the actual click, not injected; then
  calls the real `travelTimes()` (dynamically imported inside the page, the
  same module the app itself runs) against that committed state and
  confirms the bike's drive time is genuinely, meaningfully faster than an
  ordinary vehicle's — not just that the multiplier constant exists in
  source.
- **`verifyStationBuildings.mjs`** — verifies the department/vehicle-aware
  station batch (CLAUDE.md's map-expansion work): confirms the new station
  building types render on CityMap for all 3 regions, and confirms dispatch
  genuinely routes from a DIFFERENT station depending on the player's
  department AND specific vehicle kind (not just department) — real
  clicks through department/vehicle/mode/scope/ready/station/cat/kit into
  `response`, reading `g.locations.station.nodeId` off two separate runs and
  asserting they differ. County EMS vs. Fire Dept is the department check;
  Medic squad vs. Battalion Chief (same department, different kind) is the
  per-kind check — chosen because both are un-gated by `needsCrew` and
  authored at different city stations, unlike engine/rescue/ladder.
- **`verifyDestinationPicker.mjs`** — verifies the hospital-designation/
  capability-aware routing batch: real-clicks to a live scene (via a
  transport-capable ALS ambulance, needed for the loadOpen screen to
  resolve straight to the destination picker instead of "waiting on an
  ambulance"), opens the TRANSPORT tab and the load-the-truck screen, and
  confirms each destination button now renders the REAL resolved hospital
  name and its designation string (e.g. "→ Northwood General — Downtown ·
  Trauma Level III · Primary Stroke · STEMI"), not just the generic
  archetype tag — computed live via `chooseDestination`/`designationLabel`
  (`src/data/hospitals.js`), the same call the click itself makes. Gotcha:
  the panel tab's rendered text is uppercased by `n.toUpperCase()`
  (`App.jsx`), so click `"TRANSPORT"`, not `"Transport"` — a plain
  case-sensitive substring match on the lowercase label silently never
  matches.
- **`verifyCampusPdModeGate.mjs`** — verifies the Campus PD / non-urban
  region mismatch fix: Northwood University only exists on the city map
  (`maps.js`), so the "WHERE ARE YOU WORKING" (mode) phase now filters to
  City-only when `g.department==="Campus PD"`. Real-clicks to the mode
  phase twice — once as Campus PD (EMR level, since Campus PD's own kinds
  are only staffable Layperson/EMR, never Paramedic — `fleet.js`'s
  `KIND_LEVELS`) confirming ONLY "City" renders, once as County EMS
  (Paramedic) confirming all 3 regions still render (the regression check —
  every other department is unaffected).
- **`verifyDrivingSceneRoute.mjs`** — verifies DrivingScene.jsx's real-route
  rewrite (CLAUDE.md's map-expansion item 5): the car now follows the ACTUAL
  station->incident route (`mapGraph.js`'s `shortestPath`/`pathToWaypoints`)
  instead of an infinite synthetic corridor. Seeds a hand-picked
  station/incident pair on the city map with two real 90-degree turns
  (confirmed via a direct `mapGraph.js` probe before writing the script —
  east, then north, then east again, 480m total), forces a genuine fresh
  mount with that route (see the script's own comment on why toggling a
  real effect dependency like `code` does NOT work here — it triggers the
  same premature-`onFinish`/`driveMiniDone` issue `isDriverRef`'s own
  comment already documents, so the fix is toggling `driveMiniDone`
  itself and waiting for React to fully process the resulting unmount
  first), then drives it with real held-`w` keyboard input long enough to
  pass both turns. Screenshots alone can't prove a heading change (a
  first-person view always looks "straight ahead" by construction), so
  this uses `window.__proximateTestDriveTelemetry` — a permanent, DEV-only
  hook (stripped from a production build via `import.meta.env.DEV`, same
  gated pattern as `__proximateTestGetState`/`__proximateTestSetState`) —
  to read the camera's real world position/yaw each frame and confirm
  numerically that yaw rotates ~90° at each real turn and returns to its
  original value on the third (parallel) leg. Gotcha: this test is
  genuinely timing-sensitive (real wall-clock driving physics against a
  fixed 480m route) — a stray extra dev-server process left listening on
  the same port from an earlier session caused real, reproducible flake
  (a mid-test full page reload); killing stray `node` processes and
  running a single clean `npm run dev` fixed it.
- **`verifyCoop3DWalkRoute.mjs`** — verifies Coop3DWalk.jsx's real-route
  wiring: `TARGET`/`LAYOUT` now come from the actual incident building's
  own `offset` (real meters, the same field `CityMap.jsx` already used for
  icon placement) and nearby real buildings, reconstructed deterministically
  from the persisted dispatch seed (`pickIncidentBuilding` + `mulberry32`,
  the same idiom `g.locations.seed` already exists for), instead of a fixed
  ~130m walk every call. Connects one real co-op client (peer count 1 is a
  real, supported case — Coop3DWalk needs no second player to render),
  reaches the approach phase twice with two different dispatch seeds, and
  confirms the GPS HUD's own live distance readout genuinely differs
  between them. Requires the co-op relay running (`npm run coop-server`)
  in addition to the dev server.
- **`verifyDrivingModeToggleSkips3D.mjs`** — verifies Settings' own
  "DRIVING MODE" toggle now skips BOTH real-time WebGL scenes when off, not
  just DrivingScene — a direct user request mid-batch ("people with worse
  PCs can still play the game just without the driving part"). Turns it off
  via a real Settings click, dispatches a call, and confirms zero
  `<canvas>` elements render in the response phase (DrivingScene's own hint
  text absent too) — the plain approach/response screen with no 3D
  rendering at all.
- **`verifyCh1StationLife.mjs`** — verifies the Chapter 1 station-life
  follow-up batch (help-me-plan-out-compiled-badger.md's §9 checklist): the
  ALONE-ON-SCENE banner reads the corrected ~1-minute Chapter 1 text/cap
  (not the stale "at least five minutes"/300s text every other Layperson
  context still correctly uses), the kit screen offers exactly one bag
  ("Backpack") and no stretcher option, `patrolShiftRoster` genuinely
  rotates who's on shift (compares `patrolShiftRoster(0)` vs `(1)` via a
  real dynamic import, not a reconstruction), the six station NPCs render
  with real drawn names (never a literal `station_bikeEmr1`-style slot id —
  caught a real gap in the script itself, see gotchas below, not an app
  bug), talking to one creates a real `g.relationships` entry, and the §8
  background-dispatch state machine's gating (a `"dispatched"` unit's "Talk
  to" button reads "OUT ON A CALL" and is disabled; flipping back to
  `"atStation"` re-enables it) works as documented. Also found and fixed
  two real, unrelated "whole app crashes at module load" bugs while first
  running this against a fresh dev server — see gotchas below.
- **`verifyCh1Tutorial.mjs`** — verifies the interactive first-call tutorial
  (`TutorialCoachmark.jsx`): auto-opens the instant `benignFaint` (the real
  first tutorial call, not the heat-stroke prologue sim) reaches the scene
  phase, genuinely pauses the sim clock while open (`g.t` read before/after
  a fixed wait), steps through all 6 real coachmark stops via real clicks on
  its own Next/Skip buttons, confirms `ch1TutorialDone`/clock-resume, and
  confirms it never reappears on a later call in the same shift. Establishes
  a real character via real clicks, then `setState`-jumps to
  `campaignPreCall1` with the fixed tutorial queue and real-clicks its own
  "Head over" dialogue through to a real `SCEN.benignFaint.seed()`-backed
  `"kit"` state before the final `kit`→`scene` hop is skipped via `setState`
  (ordinary loadout/travel gameplay, not this script's own concern).
- **`verifyCh1StationRoster.mjs`** — verifies the grown Northwood PATROL
  roster: the `campus_officer`→`campus_emr` portrait-key rename actually
  resolves (a Bike EMR conversation requests a real `campus_emr_*` image,
  not the old dead key or a silent civilian fallback), the 2 new foot-patrol
  duos are real, listed, talkable roster entries with their own per-relId
  dialogue, a background-dispatched ("away") NPC's talk button is genuinely
  `disabled` (not just styled to look so), and starting a conversation with
  an NPC who then gets background-dispatched (`ch1StationTalkInterrupt`)
  produces the real "radio crackles" interrupt line and closes the overlay
  cleanly rather than leaving stale talk-target state behind.
- **`verifyOutcomeReportDebrief.mjs`** — verifies F44 (CLAUDE.md queue): the
  new "THE CHART" debrief section reads real `outcomeReport()` output
  (`physiology.js`) instead of nothing. `outcomeReport()`'s own GUARD
  requires `s.phase==="scene"||s.phase==="transport"`, so it returns `null`
  once `phase` reads `"debrief"` — the fix snapshots its result into
  `g.physioOutcome` at each debrief-transition site, BEFORE the phase flips.
  Part 1: real character (Paramedic/Suburban, avoiding the 3D station — see
  gotchas), real-selects `doa` (a patient already in asystole from t=0),
  fast-forwards on-scene time past `GRACE` (120s) via a `g.speed` patch (not
  a multi-minute real wait), real-clicks GENERAL tab → "Declare death on
  scene" → confirm, and confirms `g.physioOutcome` carries real
  `arrestOccurred`/`downtimeMin`/`reversibleFindings` data and "THE CHART"
  renders it in the DOM. Part 2 (fresh incognito-style browser context, so
  Part 1's localStorage save doesn't change the New-save click sequence):
  `benignFaint`, fast-forwarded to debrief, confirms `physioOutcome.
  arrestOccurred===false` and the section stays out of the DOM (graceful —
  no fabricated content for an uncomplicated call).
- **`verifyTesterGate.mjs`** — verifies the tester-only access gate on
  Career Mode / Co-op (Medical Simulation mode was made publicly accessible
  while those two remain tester-only during development; see App.jsx's
  `TESTER_KEY`/`isTesterUnlocked`/`goGmode`/the `testerGate` phase). Real
  clicks throughout, on fresh (cleared-localStorage) browser contexts: both
  gmodePick buttons (Career and Co-op, independently) route to `testerGate`
  when locked instead of their real destination; a wrong password shows an
  error and does not advance the phase; the correct password
  (`"proximate"`) sets the `proximate_tester_unlocked` localStorage flag and
  routes to the ORIGINAL destination the player clicked
  (`g.pendingGmode`-tracked, the same "remember where to go next" idiom
  `afterDisclaimer` already uses for the liability disclaimer); once
  unlocked, clicking Career again skips the gate entirely (browser-wide, not
  per-save); and — the actual point of this gate — Medical Education Mode
  (Sandbox) is reachable with zero password prompt on a totally fresh,
  never-unlocked browser. Run twice, PASS/PASS, zero console errors both
  times.
- **`verifyDefaultSpeed.mjs`** — verifies a brand-new save's sim clock
  defaults to 4x (`blank()`'s `speed:4`), not the old 1x, so a first-time
  public tester who never touches the TIME SCALE picker isn't stuck
  watching real-time countdowns through their whole first call. Confirms
  both the static default AND that it genuinely reaches the live tick
  effect: after a real character creation, jumps to a scene phase via
  `setState` and measures `g.t` advancing ~8 sim-seconds over a 2s
  wall-clock window (the `dt=.1*speed` per 100ms-tick math), not the ~2s a
  stuck-at-1x default would produce.
- **`verify3DGate.mjs`** — verifies the real-time 3D scenes (DrivingScene
  during response, Coop3DWalk during approach, the 3D station room) are
  tester-gated the same way Career/Co-op are (`src/testerGate.js`'s shared
  `isTesterUnlocked()`, imported by both App.jsx and SettingsOverlay.jsx to
  avoid a circular import). On a fresh, locked browser session: dropping
  into a live response phase with a real vehicle (via `setState`) shows
  ZERO `<canvas>` elements — the plain 2D fallback renders instead — and
  SettingsOverlay's DRIVING MODE row shows "TESTERS ONLY" instead of the
  real on/off toggle. After a real click-through of the tester-unlock flow
  (same as `verifyTesterGate.mjs`), the IDENTICAL response-phase setup now
  mounts a real `<canvas>` (DrivingScene), and Settings shows the real
  toggle again — confirming the gate is genuinely reactive to the unlock,
  not a permanently-disabled feature.
- **`verifyBusyParallelism.mjs`** — verifies the "Procedure Gameplay" fix:
  while the player's own busy-timer procedure is running (`g.busy`),
  ASSESS and GENERAL tab actions stay real and clickable (the player can
  keep examining the patient, asking questions, radioing for backup, etc.
  in parallel), while AIRWAY/PROCEDURES/MEDS tabs — anything needing the
  player's own hands — stay correctly blocked with the "Hands full"
  messaging, since two hands-on tasks can't really happen at once. Also
  confirms the busy-timer banner's updated copy ("you can still ask,
  listen, watch the monitor, and direct your crew") actually renders. Drops
  into a live scene via `setState` with a fabricated busy entry (a plain
  data object — the `fn` closure has to be constructed IN the page context,
  since a Node function can't cross Playwright's serialization boundary).
- **`verifyClinicalEventAlert.mjs`** — verifies the visible-emergent-event
  popup (`ClinicalEventAlert.jsx`, fed by `g.eventAlertQueue`): a scenario's
  own scripted crit-kind `events` fire (e.g. the choking scenario's
  vomiting beat) and real physiology crossing an edge (seizure onset, loss
  of responsiveness) both push a real, prominent on-screen alert instead of
  a line a player can miss in the scrolling log. Three real checks: a
  directly-queued alert renders; clicking it dismisses it immediately
  (rather than waiting the full ~6.5s auto-dismiss); and — the important
  one — forcing `s.patient.seizing=true` on the LIVE patient instance (no
  App.jsx code called directly) and letting the tick loop's own
  edge-detection notice it unassisted produces the same alert. Confirms the
  general mechanism, not just the display component in isolation.
- **`verifyMinigameVitalsStrip.mjs`** — verifies the "Procedure Gameplay"
  fix: every interactive procedure mini-game (`AccessMinigame.jsx` for
  IV/IO, `AirwayMinigame.jsx` for laryngoscopy/ETT, `CricMinigame.jsx`,
  `SGAMinigame.jsx`) previously rendered as a fully opaque black modal with
  zero patient information — while fiddling with angle/depth sliders, a
  player had no way to check whether the patient was even still stable,
  contradicting the spec's own worked example ("Monitor SpO2... Watch the
  ECG... Reassess the patient" while performing a procedure). A new shared
  `MinigameVitalsStrip.jsx` (a compact SpO2/HR/RR/LOC readout, alarm-styled
  red when a value is out of range) now renders inside all four. Confirms
  it renders for a real IV mini-game AND a real airway mini-game (proving
  it's genuinely shared, not duplicated per component).
- **`verifyProcedureAssist.mjs`** — verifies the "Procedure Gameplay" spec
  2.9 accessibility tiers (Assisted/Standard/Advanced), previously entirely
  absent for the IV/IO/airway/cric/SGA mini-games. A new
  `src/procedureAssist.js` (deliberately kept OUT of `access.js`, whose own
  standing constraint is physiology-only difficulty input) exports
  `assistToleranceMult()`, applied by all four mini-game components ON TOP
  of the real physiology-derived difficulty to widen or narrow the
  acceptance band around the (unmoved) real target. Confirms a fresh save
  defaults to Standard; a real click in Settings on "Assisted" persists
  `g.procedureAssist`; the exported multiplier function is real (imported
  directly, not reconstructed) and correctly ordered
  (`assisted > standard=1 > advanced`); and the IV mini-game renders
  cleanly with a non-standard tier active.
- **`verifyIvAngleTouchControls.mjs`** — verifies a real, previously-
  undiscovered gap against the "Procedure Gameplay" spec's own 2.14
  ("mobile/touch must work"): the IV mini-game's "insert" step only
  responded to an `ArrowLeft`/`ArrowRight` keydown listener to adjust
  insertion angle, with zero touch equivalent — on a phone there was no way
  to correct the stick angle mid-advance at all (the hold-to-advance button
  itself already had real `onTouchStart`/`onTouchEnd` handlers; only angle
  correction was keyboard-only). Fixed with plain `onClick` ◀/▶ buttons
  (`AccessMinigame.jsx`), which fire from a tap's synthesized click event on
  every mobile browser with no separate touch handling needed — the
  keyboard listener is untouched and still works too. This script drives
  the buttons with ordinary clicks (the same event path a tap uses) and
  confirms the on-screen angle actually moves by the right amount in both
  directions and clamps correctly at both the real 0°/60° bounds. Run
  twice, PASS/PASS, zero console errors both times.
- **`screenshots/`** — gitignored-worthy output from the last run (not
  checked in; regenerate by running the scripts).
- **`verifyCrewAi.mjs`** — the crew-AI batch (see the approved plan under
  that name): confirms the autonomous-direction loop assesses before it
  treats (no drug auto-directed before a real device is attached or vitals
  are taken), the monitor-device gate now actually holds for the
  auto-direction path (it used to skip the check entirely), a crew member is
  no longer locked to whatever they were last ordered — clicking a
  DIFFERENT task on their card mid-task cancels and reassigns instead of
  being a no-op — and that redirecting them inside a 60-second grace window
  costs a small Career-only reputation hit, free everywhere else (Sandbox,
  or after the grace window). Uses a real ALS ambulance crew (Paramedic
  level, one recruited partner), `laCounty` protocol, and 4x sim speed so
  the ~4s auto-direction re-evaluation cycle and ~10-25s task durations
  complete in a reasonable wall-clock window. Adds a
  `data-testid="crew-order-card"` to the crew-order panel's own card div
  (App.jsx) — needed because a completely separate, always-visible "CREW
  WORKING" status widget elsewhere on the same screen also uses
  `.p-3.rounded` and collides with a plain class selector.
- **`verifyVoiceCommandsToggle.mjs`** — the Phase 4 half of the crew-AI
  batch: confirms the new VOICE COMMANDS settings row exists, defaults off,
  a real click on "on" sets `g.voiceCommandsEnabled`, and the mic status
  badge appears/disappears with it. Deliberately does NOT (can't) verify
  actual speech recognition — headless Chromium has no real microphone/
  speech backend, so the badge realistically sits at "starting…" forever in
  this environment rather than reaching "listening"; that's expected here,
  not a bug. The matcher logic itself (`matchCrewMember`/`matchTask`,
  `src/hooks/useVoiceCommands.js`) has its own separate, no-browser
  regression check: `node src/scripts/voiceCommandMatcherTest.mjs`.
- **`verifyDialoguePanel.mjs`** — verifies the F0 dialogue-system first
  slice (`src/dialogue/`, `DialoguePanel.jsx`): a queued `g.dialogueLog`
  line renders as a real on-screen feed entry; the panel is correctly
  scoped to `scene`/`transport` phases only (stale entries don't leak onto
  an unrelated screen); and — the important one — forcing
  `s.patient.intrinsicPain=9` on the LIVE patient (not `drugPain`, which
  `pk.js` reseeds from `intrinsicPain` every tick and would silently
  overwrite a direct write) and letting the tick loop's own unprompted-
  dialogue path (personality/distress-gated, `dialogueManager.js`) pick it
  up unassisted produces a real line within a real, generously-windowed
  10 seconds. Confirms the general mechanism end to end, not just the
  display component in isolation.
- **`verifyTreatmentResponseDialogue.mjs`** — verifies F0 item 18's
  treatment-response dialogue (a real gap this batch found: `TemplateProvider`
  already declared a `treatment_improving` template with zero callers
  anywhere in the codebase). Seeds `_analgesiaCheckAt`/`_analgesiaBaselinePain`
  (the same fields `medActs`' own `run()` handler sets when a drug whose
  declared `fx.pain` is negative lands) via the setG-based setter (see the
  gotcha below — direct mutation does NOT work for these), lowers
  `intrinsicPain`, and confirms a real `treatment_improving` line fires
  only once pain has genuinely fallen; a second check confirms silence
  when pain never actually drops, using the patient's own REAL computed
  `drugPain` as the baseline (not a hardcoded guess — a fixed number would
  be trivially "below baseline" for any patient whose random
  `painSensitivity` trait, queue item 50, happens to be low).
- **`verifyCrewDialogueReaction.mjs`** — verifies F0's crew-voiced dialogue
  reaction (another real gap: `DialoguePanel` already styled a "CREW"
  speaker with nothing ever feeding it through the dialogue manager). Wired
  into the SAME seizing/consciousness edge-detection that already drives
  the on-screen `eventAlertQueue` banner. Forces a genuinely SUSTAINED
  seizure by setting `s.patient.epilepticDrive=1` AND `s.patient.seizing=true`
  together, not either alone — see the gotcha below for why a bare boolean
  flip races the engine's own reset. Reads `dialogueLog` directly for a
  `speaker==="crew"` entry rather than scraping page text for the literal
  string "CREW", since that string also appears as a generic crew-roster
  fallback role label elsewhere on the same screen (a real false-positive
  trap, caught while building this — see the gotcha below).
- **`verifyClinicalRecoveryReactions.mjs`** — verifies the REVERSE edges of
  the same seizing/consciousness edge-detection block: a seizure ending and
  consciousness returning were both previously silent on both channels (the
  on-screen `eventAlertQueue` banner and the crew-voiced dialogue line) —
  only the forward edges (onset) had ever been wired. Confirms both a real
  banner ("The seizure has stopped." / "The patient starts responding
  again.") and a real crew line fire on the actual reverse transition, and
  confirms neither fires on an ordinary steady-state tick with nothing
  changing (the negative control that matters here — a naive "poll for a
  falsy flag" implementation could spam on every idle tick instead of only
  the genuine edge).
- **`verifyLocalAiCache.mjs`** — verifies F0 item 8 (persistent model
  caching): a real boot-screen launch exercises the new
  `LocalLLMProvider.checkCache()` -> web-llm's own `hasModelInCache()`
  chain without throwing, and a genuine page reload afterward confirms the
  AI panel does NOT falsely claim a cache hit in this environment (nothing
  here ever actually finishes downloading). Also runs a direct-function
  test of `dialogueManager.checkLocalAiCache()` against a real Cache API:
  reports `"not-cached"` against an empty cache (no network needed), then
  reports `"cached"` after manually seeding a cache entry in web-llm's own
  real key format (cache name `"webllm/model"`, keys are the model's
  `tensor-cache.json` manifest URL and each shard's full download URL) —
  the documented precedent for verifying GPU-gated logic this headless
  environment can't exercise live end to end.
- **`verifyLocalAiRetry.mjs`** — verifies the local-AI reliability fix
  triggered by a real user report on genuinely WebGPU-capable hardware
  ("This device reports WebGPU support but local AI failed to load", no
  diagnostic, no retry without a full reload). Extends the
  `__proximateTestForceLocalAi` hook with `errorKind` (set the diagnostic
  classification directly) and `stubBackend` (stub `_loadBackend` so a real
  call into `retry()`/`_ensureEngine()` — e.g. a real click on Settings'
  Retry button — can genuinely succeed and reach "ready" without a working
  WebGPU adapter). Part 1 (direct-function, a fresh `LocalLLMProvider`
  instance): a real, controlled load failure is classified correctly
  (timeout/device/network/unknown), the real caught error is logged via
  `console.error` (captured and asserted on, not just eyeballed), and
  `retry()` genuinely clears the `_failed` latch and re-attempts a real
  (stubbed) engine creation, recovering to `status()==="ready"`. Part 2 (the
  real app singleton, real UI): forcing a failed, device-classified state
  shows the kind-specific status text in Settings' LOCAL AI DIALOGUE row
  ("... (device rejected local AI)") with the non-blocking promise stated
  explicitly, and a real Retry chip renders only when `status==="failed"`;
  a real click on it (backend stubbed) calls back into the real provider
  and the row genuinely updates to "ready" live, via the existing
  subscription, with no page reload. Part 3: jumps into a real live scene
  (via the same character-creation walk `verifyBroaderTrendSignal.mjs`
  uses) and confirms sim time keeps advancing and Tier 2/1 dialogue still
  fires throughout the whole retry sequence. Console-error filtering here
  intentionally also excludes the new `LocalLLMProvider: model load failed`
  diagnostic line itself — that log is the fix's own deliberate,
  dev-only-visible output, not a bug.
- **`verifyAiReadyNoticeAndToggle.mjs`** — verifies F0's last two items, 7
  (completion notification) and 10 (Local AI settings toggle). Adds a new
  DEV-only test hook, `window.__proximateTestForceLocalAi` (`dialogueManager.js`,
  mirrors `__proximateTestSetState`), to force the REAL `LocalLLMProvider`
  singleton's fields (progress/cacheState/engine/failed) since no environment
  here has a working WebGPU adapter to reach "ready" live. Confirms
  `AiReadyNotice.jsx` shows the spec's exact text only after a genuine
  downloading->ready transition (not on first paint), that dismissing it does
  NOT reload the page (session continues, never forced), and that it doesn't
  reappear. Confirms `SettingsOverlay`'s new "LOCAL AI DIALOGUE" row shows
  real status/download-size text (via the same `getLocalAiState()` every
  other AI surface uses) and that real clicks on enable/disable persist
  `g.localAiEnabled`. The important check: a DIRECT-FUNCTION test forcing a
  real, callable stub engine (only the network/GPU seam is faked) and
  confirming `requestLocalUpgrade()` genuinely resolves a real generated line
  when enabled/unset, and NEVER resolves when `localAiEnabled===false` — a
  real short-circuit on the one live Tier-3 call site, not a UI-only
  checkbox. Also found and worked around a real timing hazard: the app's own
  background `preload()` (started at boot) has a genuine pending WebGPU
  adapter request that eventually rejects asynchronously mid-test in this
  no-adapter environment and latches `_failed=true`, which would otherwise
  break every gate check AFTER that unrelated real rejection landed — fixed
  by re-asserting the forced state immediately before each attempt.
- **`verifyDialogueTier3Extension.mjs`** — supersedes an earlier same-session
  draft of this check (`verifyDialogueUpgradeAllSites.mjs`, removed — that
  version left site 3's double-fire case as an open, unconfirmed caveat
  because its click-loop could silently land clicks that never reached
  `start()` at all, burning attempts without ever exercising a real
  double-fire; see this script's own `attemptProcedureDialogue()` comment
  for the root cause and fix — a forced click plus an explicit
  `g.busy.id==="loc"` wait so every counted attempt is a confirmed real
  action-start). Verifies F0's own explicitly-
  tracked remaining depth item: extending `requestLocalUpgrade()` (the
  fire-and-forget tier-3 background-upgrade helper) from its one existing
  call site (unprompted patient dialogue) to the three other real
  synchronous dialogue-generation call sites in `App.jsx` — crew-voiced
  dialogue reaction (seizure/consciousness edge, id prefix `dlg_crew_`),
  treatment-response dialogue (`treatment_improving`, id prefix `dlg_tx_`),
  and dialogue during a procedure (`procedure_discomfort`, id prefix
  `dlg_<actionId>_`). Uses the established `window.__proximateTestForceLocalAi`
  hook with a real, callable stub engine (only the network/GPU seam faked) to
  exercise the real code path. For each of the three sites, real-triggers
  the underlying game event (a forced sustained seizure onset for the crew
  site, a seeded analgesic-dose pain drop for the treatment site, a real
  "Level of consciousness (AVPU)" click for the procedure site) and confirms:
  the immediate tier-2/1 line fires; a forced tier-3 resolution patches the
  SAME dialogueLog entry in place (matched by id, same mechanism the
  original site uses); with `g.localAiEnabled=false` the line still fires
  but is NEVER upgraded (tested per site, not assumed from the shared gate);
  and firing the event twice back to back produces no crash and no garbled
  log content. Found and fixed a real click-flake independent of the new
  dialogue wiring while building this — see the gotchas list below.
- **`verifyMinigameDialogue.mjs`** — verifies F0 item 23 / F3 spec 2.7's own
  coordination point: the four real procedure mini-games
  (`AccessMinigame.jsx` for IV/IO, `AirwayMinigame.jsx` for laryngoscopy/ETT,
  `CricMinigame.jsx`, `SGAMinigame.jsx`) now fire real dialogue at genuine
  physical trigger moments — the needle/IO stick, the incision, the blade-view
  confirmation, and the blind SGA insertion attempt — through a single new
  `App.jsx` helper, `fireMinigameDialogue`, passed to all four as the
  `onDialogue` prop. Each trigger is a real 45% roll (the same probability
  the flat busy-timer `procedure_discomfort` path already used, reused rather
  than inventing a new one) firing `generateDialogueSync` immediately (tier
  2/1, never blocking) plus `requestLocalUpgrade` fire-and-forget, the exact
  same pattern every other dialogue call site in this codebase already uses —
  no parallel system. IV/IO and the cric incision fire `procedure_discomfort`;
  laryngoscopy/ETT view-confirmation and the SGA blind seat attempt fire
  `airway_stimulation_reaction` (both pre-existing templates in
  `dialogueProvider.js`). A successful mini-game resolution
  (`resolveAccessMinigame`'s `SUCCESS` branch) also gained a real, separately
  event-gated `procedure_success_relief` line (35% chance, awake-gated) — the
  good-outcome half of item 18's "event-driven, not continuous" bar. Since
  each trigger is a real probability roll, this script retries real attempts
  (up to 15) until a dialogueLog entry with the right id prefix appears — the
  same "count only real, confirmed attempts" idiom
  `verifyDialogueTier3Extension.mjs`'s SITE3 already established. Confirms,
  per mini-game: a real attempt produces a real Tier-1/2 dialogueLog line;
  sim time keeps advancing underneath the open modal while the line fires
  (not blocked); and — for AccessMinigame/IV as the representative site —
  `requestLocalUpgrade` genuinely patches the SAME entry in place with a
  forced stub Tier-3 line when enabled, and never does when
  `g.localAiEnabled=false`. Also confirms no visual collision: a real
  bounding-box check of a live DialoguePanel line against the open minigame
  modal (DialoguePanel already carries its own `zIndex:201`/bottom-left fix
  from the earlier `MinigameVitalsStrip` batch, confirmed still correct
  here). See the gotchas list below for two real timing traps found while
  building this — a stale-log-entry false positive, and a background-preload
  WebGPU-rejection race that needed re-asserting the forced stub a second
  time, immediately before the actual trigger click rather than only once at
  the top of a multi-step retry loop.
- **`verifyEmotionalStateLive.mjs`** — verifies F0 item 17's new structured,
  SIMULATION-determined emotional state (`src/dialogue/emotionalState.js`,
  distinct from the static personality traits `personality.js` already
  shipped for item 16). `emotionalState.js` derives one of ten canonical
  states (calm/anxious/frightened/confused/agitated/angry/embarrassed/in
  pain/reassured/exhausted) from real physio fields only (consciousness,
  pain, a new pain/consciousness TREND signal tracked tick-to-tick in
  `dialogueContext.js`, and personality) and never writes back into
  physiology. `TemplateProvider`'s bucket selection now reads this first
  (falling back to the old trait heuristic for callers, like the dev panel,
  that don't build a full context), and the Tier-3 prompt states the
  emotional state explicitly with an instruction that it is fixed by the
  simulation, not the model's to invent. This script confirms, live, in a
  real page: seeding a genuine sharp pain INCREASE (worsening) versus a
  genuine sharp pain DECREASE (improving) for the same patient produces a
  genuinely different derived emotional state (frightened vs. reassured, in
  the observed run) AND genuinely different Tier-2 dialogue TEXT for the
  identical `pain_unprompted` event, and that sim time keeps advancing
  throughout. Gotcha found while building this: `getState()` returns a
  fresh top-level snapshot on every call (only `.patient` is the genuine
  live-referenced sub-object), so trend bookkeeping written onto that
  snapshot does not persist to the next `getState()` call the way it would
  inside real gameplay's own reused draft object; fixed by stashing the
  script's own context shell on `window` across `evaluate()` calls, not by
  changing production code. A separate, real, pre-existing em-dash
  violation was also found and fixed while running this script: several
  Tier-2 template strings in `dialogueProvider.js` shipped em dashes in
  player-facing dialogue text (sanitize() only strips them from Tier-3
  output, never hand-authored Tier-2 strings) — fixed on the spot per the
  standing "notice one, fix it" rule.
- **`verifyTemplateBucketsLive.mjs`** — verifies the follow-up batch that
  expanded `TemplateProvider`'s Tier-2 template pools (`dialogueProvider.js`)
  beyond the 3-way calm/anxious/irritable split `verifyEmotionalStateLive.mjs`
  above found all ten `emotionalState.js` states were collapsing onto.
  `TemplateProvider.generate()` now checks for a bucket keyed DIRECTLY by the
  emotional-state name (e.g. `pool["in pain"]`, `pool.exhausted`,
  `pool.frightened`, `pool.confused`, `pool.reassured`, `pool.agitated`)
  before falling back to `bucketForEmotionalState`'s original 3-way collapse,
  so pools this batch didn't touch keep behaving exactly as before. Also
  wires the one real, existing gameplay trigger this codebase has for
  `embarrassed` — torso exposure (`clothing.js`/App.jsx's `exposureActs`,
  the "Remove shirt"/"Lift shirt"/"Cut shirt" actions) — as an explicit
  `event.bucket:"embarrassed"` override fired from `start()`'s own action-
  completion path, independent of the generic `procedure_discomfort`
  duration heuristic. This script confirms, live: (1) two of the newly-split
  states ("in pain" and "exhausted"), both reached through REAL
  `deriveEmotionalState()` branches (stable trend + severe pain; long call +
  ongoing modest pain), produce genuinely different dialogue TEXT for the
  identical `pain_unprompted` event; (2) clicking the real "Lift shirt"
  action in a live page fires a real `exposure_reaction`/`embarrassed` line
  into `dialogueLog` through the actual `start()` action path, not a direct
  module call; (3) sim time is unaffected throughout. Gotcha found while
  building this: the "chest" scenario has a 1700s scene `limit` — jumping
  `t` past it via `setState` silently ends/changes the scene phase and the
  entire action list (including the exposure actions) disappears, which
  looks identical to a real missing-button bug until you check the
  scenario's own `limit` field; fixed by keeping injected `t` values well
  under it. A second gotcha: the exposure actions are filtered by `g.region`
  (the currently-selected body-region tab, e.g. `"torso"`), not just
  `g.tab==="procedures"` — both must be set via `setState` or the action
  never renders.
- **`verifyBystanderDialogue.mjs`** — verifies F0 item 15's bystander/family
  dialogue slice, the first real character class beyond patient/crew.
  `dialogueContext.js` gained a `bystander:{present,role}` field parsed from
  the scenario's own real, pre-existing `bystanders` free-text field
  (`data/scenarios.js`, previously read only once for the scene-arrival log
  line) via a small role-keyword matcher (husband/wife/mother/neighbor/
  etc, falling back to "bystander"); presence is simply "the scenario
  declares a non-empty bystanders string," true for the whole call (no
  scenario in this codebase models a bystander leaving/arriving mid-call).
  Two new Tier-2 template pools (`dialogueProvider.js`) —
  `bystander_seizure_reaction`/`bystander_unresponsive_reaction` — fire from
  the SAME seizing/consciousness edge-detection crew already reacts to
  (App.jsx), in a distinct panicked/pleading, non-clinical voice, scene-
  phase only (unlike crew's scene+transport — a bystander doesn't ride in
  the truck) and independent of crew presence. The Tier-3 prompt
  (`buildPrompt`) also gained an explicit bystander branch stating the
  knowledge boundary directly ("you have no medical training... never state
  or guess" vitals/diagnoses/labs), and `DialoguePanel` renders the real
  parsed role (e.g. "HUSBAND") instead of a generic "BYSTANDER" label when
  one is known. This script confirms, live, against the real "chest"
  scenario (whose bystanders text is "Her husband is in the doorway..."):
  a real sustained seizure onset (same reliable epilepticDrive=1+seizing=true
  lever `verifyCrewDialogueReaction.mjs` established) produces a real
  bystander-voiced line with NO crew present; the line contains no clinical
  terms (a real regex knowledge-boundary check, not just a read-through);
  `role` is correctly parsed as "husband" and rendered as "HUSBAND" in the
  DOM; the text is verbatim-distinct from crew/patient template lines; no
  second line fires on an ordinary steady-state tick (event-driven, not
  polling); the reverse-direction real unresponsive-onset edge also fires;
  `g.localAiEnabled=false` holds the line at tier 2/1 with NO tier-3 patch;
  flipping it back on lets a forced stub engine genuinely patch the SAME
  entry in place; and sim time keeps advancing throughout. Run twice,
  PASS/PASS, zero console errors both times. Gotcha found while building
  this (not previously documented): the F0 boot screen (`phase:"boot"`,
  item 4) is now the very first thing a fresh session sees, so any script's
  `freshCharacter()` written before that slice shipped needs a
  `clickText(page,"CONTINUE WITHOUT AI")` (or "ENTER PROXIMATE" on the rare
  chance AI reached ready) before "Go on shift" is even in the DOM — a
  plain `getByText("Go on shift")` wait silently times out at 10s with no
  other error otherwise.

- **`verifyBroaderTrendSignal.mjs`** — verifies `dialogueContext.js`'s
  `computeTrend()` now also reads hr/spo2/sbp, not just pain/consciousness
  (a real, formerly open F0 gap — CLAUDE.md's own F0 status paragraph named
  "trend signal tracks only pain/consciousness, not other vitals" directly).
  Against the same patient identity, with pain/consciousness held CONSTANT
  across both samples (so any resulting trend can only be coming from the
  new vitals signal): a real SpO2 drop (>=4 points) alone drives a
  worsening-trend emotional state (frightened/agitated) and a genuinely
  different Tier-2 dialogue line than a stable baseline; a real SpO2
  recovery off a hypoxic baseline (<94, then +4 or more) drives "reassured";
  real climbing HR while already tachycardic (>100, +15 or more) drives a
  worsening-trend state; small, sub-threshold vitals jitter does NOT
  spuriously trigger a trend (a negative control); sim time keeps advancing
  throughout. Run twice, PASS/PASS, zero real console errors.

  Gotcha found while building this (not previously documented): the same
  `window.__proximateTestGetState()`-returns-a-fresh-snapshot behavior
  `verifyEmotionalStateLive.mjs`'s own header already documents has a
  SECOND, sharper failure mode once a script seeds its own controlled
  `_emoTrendPrev` via `{...real, patient: real.patient}` — the real, live
  game tick loop can independently call `buildDialogueContext` (unprompted
  patient dialogue, etc.) against its own draft object at roughly the same
  `s.t`, and if THAT real call's own `_emoTrendPrev.t` happens to equal the
  test's `tBefore` (a real coincidence, not rare at typical tick rates),
  spreading `real` into a fresh test `s` copies that STALE, unrelated prev
  object in, and `computeTrend`'s own re-entrant-same-tick guard then
  returns the cached (wrong) trend without ever overwriting it with the
  test's own controlled `vBefore` — silently invalidating the whole seeded
  comparison with no error thrown. Symptom: a "worsening" case reads back
  as "reassured" (or vice versa) with no obvious cause. Fix: `delete
  s._emoTrendPrev` immediately after the `{...real}` spread, before seeding
  — guarantees a real, controlled "no prior sample" baseline every run,
  rather than trusting the fresh snapshot doesn't already carry one.

1. **Real clicks** (`clickText`) — the only honest way to verify a
   click-through PATH (a button handler, a multi-step form) actually
   works. Slow to write for anything deep in the app.
2. **State injection** (`setState`) — jumps `phase` (and any other field)
   directly, skipping everything in front of it. Fast, but only proves the
   target screen renders given that state — NOT that every button on the
   way there actually leads to it. Good for breadth (checking 50 screens
   don't crash); real clicks are still needed for depth (checking one path
   actually connects end to end).

`campaignSmoke.mjs` uses (1) once to get a real base character, then (2)
repeatedly for breadth. `clickThroughCh1.mjs` uses (1) throughout for one
specific path. Follow this pattern for future front-end batches: one real
click-through per NEW path you build, plus state-injection breadth checks
for every screen along the way.

## Usage

```
npm run dev                        # terminal 1 — dev server must be running;
                                    # the test hook only exists in dev builds
node tools/browser/campaignSmoke.mjs     # terminal 2
node tools/browser/clickThroughCh1.mjs
node tools/browser/clickThroughCh1to3.mjs
node tools/browser/clickThroughCh8to10.mjs
node tools/browser/verifyPlayerSpriteReuse.mjs
node tools/browser/verifyCustomScenarioSave.mjs
node tools/browser/verifyCustomScenarioFbaoClear.mjs
node tools/browser/clickThroughCh4to7.mjs
node tools/browser/clickThroughDrivingMinigame.mjs
node tools/browser/verifyPatrolPartnerCrewSeat.mjs
node tools/browser/verifyMosPatrolFixedCrew.mjs
node tools/browser/verifyCampusVehicleSpeed.mjs
node tools/browser/verifyCh1StationLife.mjs
node tools/browser/verifyCh1Tutorial.mjs
node tools/browser/verifyCh1StationRoster.mjs
node tools/browser/verifyOutcomeReportDebrief.mjs
node tools/browser/verifyDialoguePanel.mjs
node tools/browser/verifyTreatmentResponseDialogue.mjs
node tools/browser/verifyCrewDialogueReaction.mjs
node tools/browser/verifyLocalAiRetry.mjs
node tools/browser/verifyClinicalRecoveryReactions.mjs
node tools/browser/verifyLocalAiCache.mjs
node tools/browser/verifyAiReadyNoticeAndToggle.mjs
node tools/browser/verifyDialogueTier3Extension.mjs
node tools/browser/verifyMinigameDialogue.mjs
node tools/browser/verifyBystanderDialogue.mjs
```

`PROXIMATE_URL` env var overrides the default `http://localhost:5173` if
the dev server is on a different port.

## Gotchas hit while building this

- **VNDialogue advances on a click anywhere on ITS OWN text block**, not
  anywhere on screen — a blind `page.mouse.click(x, y)` at a guessed
  coordinate misses if the layout shifts even slightly. Click the stable
  `▶` advance-indicator text via a locator instead
  (`page.locator("text=/▶/").first().click()`), which VNDialogue always
  renders regardless of how many lines a scene has.
- **The "loading" phase auto-advances after a fixed ~1.4s timer**, not a
  button click — `waitForTimeout(1700)` after clicking "Start", not a
  `waitForFunction` on a button appearing.
- **The liability disclaimer appears twice** in a fresh browser profile:
  once from title → saves, and again from "+ New save" (F18: every new
  save shows it, regardless of the one-time localStorage flag).
- **A "click ▶ while visible" loop can silently race across a PHASE
  boundary, not just a line boundary.** When one phase's VNDialogue ends
  and the next phase's own VNDialogue also happens to be a single line (so
  its "▶" is visible on the very next render), a loop that only checks
  "is ▶ visible" — not "has the phase changed" — will sometimes click
  straight through TWO OR MORE phases in one call, and sometimes stop
  right at the boundary, depending on how fast the DOM repaints relative
  to the next `isVisible()` check. This produced a real, confusing
  intermittent failure while building `clickThroughCh1to3.mjs`: the exact
  same real click path passed cleanly on some runs and hung waiting for a
  phase that had already been skipped past on others, with no app-side
  change between runs. Fix: capture the phase at the START of the
  dialogue-click helper and stop as soon as it changes, in addition to
  stopping when "▶" disappears — see `clickThroughCh1to3.mjs`'s and
  `clickThroughCh8to10.mjs`'s own `clickThroughDialogue()` for the pattern.
- **A screen's own descriptive prose can shadow its real button.** The
  scope-of-practice setup screen's paragraph says "press Ready below, this
  scope is LOCKED..." — since that text renders BEFORE the actual `▲ Ready`
  button in DOM order, `clickText(page,"Ready")` matches the inert paragraph
  first and does nothing, producing a `waitForFunction` timeout with no
  error at the click site itself. When a click silently doesn't advance the
  phase, check whether the button's own visible text includes a distinctive
  prefix (`▲ `, `🎒 `, etc.) and match on that instead of the bare word.
- **A checkbox/radio glyph glued directly onto a label defeats
  `exact:true`.** The BUILD YOUR OWN condition picker's buttons render
  `{sel?"☑":"☐"}{name}` as two sibling text nodes with no space between them
  — Playwright's accessible-text computation for `exact:true` requires the
  WHOLE element's text to equal the search string, so `getByText(name,
  {exact:true})` never matches; a bare substring match is required instead.
  Same failure shape as the prose-shadow gotcha above: no error at the
  click, just a downstream timeout.
- **The Medical Simulation "kit" screen's continue button is "Roll — <code
  name>", not "Load the truck."** That text belongs to a DIFFERENT screen
  (the limited-items LOADOUT configuration screen, `phase==="loadout"`),
  reachable only via the "Limited Items" toggle Sandbox defaults off. The
  "Roll" button also stays disabled until bag selection is "ready" (a full
  bag count, or the stretcher option) — real-click "Bring the stretcher"
  first rather than picking individual bags one at a time.
- **A downstream phase can crash if it silently assumes state an earlier
  phase never set — real click-through is what catches this, state
  injection to the target phase alone would not.** `shiftSummary`'s render
  guard was `g.phase==="shiftSummary"&&g.career`, written on the assumption
  that phase is only ever reached after a real career queue completes
  (where `g.career` is always set). Several campaign-chapter batches since
  then route to `"shiftSummary"` as a generic "back to normal play"
  destination (7 call sites) without ever seeding `g.career` — real for a
  player who reaches, say, Chapter 7's end without having run an actual
  shift in between (Chapters 2/4/6/8 are classroom-only and never touch the
  career queue). With the guard false, execution fell through every
  remaining phase check to the SCENE/TRANSPORT fallback at the bottom of
  the render function, which unconditionally reads `SC.limit` — also
  unset — and crashed with "Cannot read properties of null (reading
  'limit')". Found by `clickThroughCh4to7.mjs`'s real click through
  Chapter 7's actual ending, not by jumping straight to `shiftSummary` via
  `setState` (which would have needed a `career` fixture supplied by hand,
  the same way `campaignSmoke.mjs`'s own `ch8_internshipReview_*` entries
  do — masking exactly this gap). Fixed in `App.jsx` at the `shiftSummary`
  render site: a `g.phase==="shiftSummary"&&!g.career` branch now renders a
  minimal "nothing to show yet" screen with an "Off duty →" button instead
  of falling through.
- **A button inside a component that redraws every animation frame (or
  sits under a parent re-rendering on every sim tick) can permanently fail
  Playwright's default actionability "stable" check.** The OLD 2D driving
  minigame's "Keep rolling →" result button (removed — DrivingScene.jsx,
  the real 3D drive scene now used everywhere, has no fixed-length result
  overlay to click through) never passed `clickText`'s default wait —
  Playwright kept reporting "element is not stable" for the full 10s
  timeout even though nothing about the button's own layout was visually
  changing. The likely cause: the outer app's 100ms sim tick re-renders
  `App` (and therefore this child) continuously while the result overlay is
  up, which reads as instability even without a real layout shift. Fix, if
  a future component needs it again: `page.locator(...).click({force:true})`
  instead of the shared `clickText` helper — safe once you've already
  confirmed the button's presence/text via a DOM check.
- **Don't try to resume a mid-chapter VN phase via the Saves screen.**
  `App.jsx`'s own `doContinue()` (saves phase) forces `phase` to
  `"station"`/`"shiftSummary"` once character setup is done, regardless of
  what phase was actually saved — by design, saves are only meant to
  resume "at the station," not mid-scene. Use `setState` instead of
  save/reload to jump into a specific VN phase for testing.
- **A cached image can make `page.on("response")` tracking silently under-
  report requests — check the DOM directly instead.** `verifyPlayerSpriteReuse.mjs`'s
  first version listened for network `response` events matching the 4
  player-layer image URLs and got 0 matches at every target scene, even
  though the images were genuinely rendering — the SAME 4 URLs had already
  been requested once by `campaignCustomize`'s own preview moments earlier
  in the same page session, and a browser cache hit does not reliably
  re-fire a fresh `response` event on a second request. Switched to
  `page.$$eval("img", els => els.map(e => e.getAttribute("src")))` (or
  `page.locator("img").count()`/`getAttribute("src")`) to check what's
  actually in the DOM — this is what caught two real rendering bugs the
  network-based version would have kept blaming on "nothing rendered"
  indefinitely. Prefer DOM inspection over network tracking whenever a
  script deliberately revisits the same image URLs more than once in one
  page session.
- **A substring match can collide with an unrelated WORD, not just
  unrelated prose.** `getByText("Roll")` (substring, matching the "Roll —
  <code name>" button per the gotcha above) also matches "patroller's" in
  the Backpack bag's own description text ("...a volunteer **patroll**er's
  basic kit"), which sits earlier in DOM order and wins `.first()`. Same
  failure shape as every other substring-collision gotcha here: no error at
  the click, just a downstream timeout. Match on the button's own `▲ `
  prefix instead (`"▲ Roll"`).
- **The station is now a first-person walk-to-the-whiteboard scene (WASD),
  not a button.** Scripts written before this shipped (or written against
  an older mental model) that expect `clickText(page, "▲ Get the call")` at
  `phase==="station"` will time out — that button no longer exists there.
  Jump straight past it with `setState(page, { phase: "cat" })` if the
  station walk-in itself isn't what the script is testing (a separate,
  already-covered surface — see the driving/walk-in verification scripts).
- **Two different DOM elements can both look like "the crew member's
  card."** The always-visible "CREW WORKING" status widget (shown near the
  top of the scene screen whenever `g.cBusy` is non-empty) and the actual
  Crew-panel order card both use the plain class `.p-3.rounded` — a bare
  `page.locator(".p-3.rounded").filter({hasText: name})` matches the status
  widget first if a crew member happens to be busy, and the real order
  panel's task buttons are just absent from it. The crew-order card now has
  `data-testid="crew-order-card"` (App.jsx) specifically so a script can
  target it unambiguously — use `page.getByTestId("crew-order-card")`.
- **A task button's own rendered text changes when it doubles as a
  redirect.** Once a crew member is busy, the SAME task list stays visible
  (crew-AI batch — they're no longer locked to one task) but each button's
  label gains a "↳ " prefix when it differs from their current task. Match
  task names with `{exact:false}` (substring) if the script might click a
  button while the crew member could be either free or busy, and disambiguate
  with `.first()` when one task name is a substring of another (e.g. "Compressions"
  vs. "Newborn chest compressions (3:1)").
- **Deliberately switching `g.gmode` mid-scene via `setState` (to reach a
  Career-only code path from an otherwise-Sandbox setup, rather than
  rebuilding an entire Career character) is a real, useful shortcut but not
  perfectly stable** — `verifyCrewAi.mjs` saw occasional flakiness
  immediately after this specific patch (a locator timing out, or once a
  Playwright "execution context was destroyed, most likely because of a
  navigation" error) on later re-runs, not tied to any specific assertion
  failing. Not tracked down further — the actual mechanism under test
  (assess-before-treat, the monitor-device gate, redirect-while-busy, the
  reputation grace window) passed cleanly, repeatedly, before this point in
  every run, including two full clean PASS runs end to end. Retry the whole
  script if it dies specifically around a mid-scene `gmode` patch rather
  than assuming a regression.
- **Absolutely-positioned children never contribute to their parent's
  size — a "stack N images on top of each other" wrapper with no explicit
  width silently renders at zero width.** The first version of `VNSprite`'s
  `layers` support made every stacked layer `position:absolute` inside a
  `position:relative` wrapper with no `width` set — the wrapper collapsed
  to 0px wide (nothing in normal flow to size it against) and rendered
  completely invisibly, even though all 4 `<img>` tags were present in the
  DOM with correct `src` values — a DOM-presence check alone would have
  reported success on a genuinely broken render. Only a real screenshot
  caught it. Fixed by rendering the FIRST layer in normal flow (giving the
  wrapper real dimensions from that image's own height+objectFit+intrinsic
  aspect ratio) and stacking the rest on top via `inset:0` at 100%/100% —
  safe here since every layer shares one canvas by design, but the general
  lesson is: always take a real screenshot of a new visual composite, don't
  trust "the elements exist in the DOM" as proof they're actually visible.
- **Two `VNSprite`s meant to share one row need an explicit
  `<div style={{display:"flex"}}>` wrapper — without it they stack
  vertically.** Each `VNSprite` call returns its own full-width block-level
  div; the existing two-sprite precedent (`campaignStation`'s supervisor +
  partner) wraps both calls in one flex-row div specifically so they share
  a single horizontal band instead of becoming two separate stacked "rows."
  Missing that wrapper (as an early draft of the F8 player-sprite scenes
  did) pushes earlier content above the viewport in any `VNScene` whose
  total content exceeds one screen's height, since `VNScene`'s own column
  is `justifyContent:"flex-end"` (packs from the bottom, so extra rows get
  pushed off the TOP, not clipped at the bottom where a screenshot would
  make it obvious at a glance).
- **`getByText(name)` alone matches the deepest/innermost element
  containing that text, not the whole card around it.** The in-scene crew
  panel renders several crew cards (Bystander, the named partner, any
  recruited crew) each containing the crew member's own name — a bare
  `page.getByText(partnerName)` locator matches the small `<span>` the name
  itself sits in, not the surrounding card with that person's own task
  buttons, so `.getByText(...).getByText("Compressions")` scoped off it
  finds nothing (Playwright's accessible-text match walks up from the
  match, but "Compressions" isn't a descendant of that inner span). Crew
  cards share a literal `className="p-3 rounded"` — filter that locator by
  `hasText` on the name instead (`page.locator(".p-3.rounded").filter({
  hasText: name })`) to get the whole card and everything in it.
- **Skipping `campaignCustomize` via `setState` means `g.campaignNames` is
  never seeded — every `campaignName(g, slotId)` lookup then silently falls
  back to the bare slot id (e.g. `"station_bikeEmr1"`) instead of throwing,
  which looks enough like a real name to pass an inattentive check.**
  `campaignName()`'s own fallback exists so a missing seed never renders
  `undefined` in real play (`campaignCustomize` always seeds it first there)
  — but a script that jumps straight to `campaignArrivalPrompt` to skip
  character creation (a separate, already-covered click path) bypasses that
  seeding entirely. Fix: call the real `initializeCampaignNames(CAMPAIGN_NAME_SLOTS)`
  (dynamically imported from `/src/campaign/index.js`, the same function
  `App.jsx` itself calls) and pass its result into the `setState` patch
  alongside the phase jump, rather than leaving `campaignNames` unset. Don't
  trust "the name isn't `undefined`" as proof a name-drawing mechanism
  actually ran — check it looks like a drawn name, or better, seed the real
  mechanism instead of relying on a defensive fallback to mask the gap.
- **A station screen holding more than one queued call renders a
  "DISPATCH BOARD — PICK WHAT YOU RUN NEXT" picker instead of the plain
  "▲ Get the call" button** (`App.jsx`, `upcoming.length>1`) — a script
  written against a single-call queue that blind-clicks `"▲ Get the call"`
  times out with no useful error once the queue has 2+ calls, which is the
  normal case for Chapter 1's own 3-call queue. Check for the "DISPATCH
  BOARD" text first and click the first `MEDICAL`/`TRAUMA`-labeled card
  button instead when it's present — both paths call the same
  `phase:"kit"` transition underneath.
- **A generic "click any visible ▶" loop can fire the SAME click twice on a
  VN scene's final `doneLabel` button** (e.g. `"▶ Back to the station"`),
  because the doneLabel button's text also matches a bare `/▶/` regex, so a
  loop that only checks "is a ▶ visible" can't tell "still mid-dialogue"
  apart from "already on the done button, about to click it again on a
  stale/racing DOM reference." This produced a real, intermittent failure
  (the click that should fire the scene's `onDone` sometimes silently
  missed). Fix: check for the doneLabel's own specific text first
  (`page.locator("text=/▶.*Back to the station/")`) and click that
  deliberately once found, falling back to the generic ▶ click only while
  it isn't, then `waitForFunction` on the real state change `onDone` causes
  (not just "no more ▶ visible") before trusting the scene actually
  finished.
- **A blank page with no console output can still mean a real crash — check
  the dev server's own terminal, not just Playwright's console listener.**
  `verifyCh1Tutorial.mjs` timed out waiting for the title screen's own text
  with an empty `<body>` and no `pageerror`/`console` events reaching
  Playwright at all (the crash happened at MODULE LOAD, before React ever
  mounted enough to attach listeners against). The real error was only
  visible in `npm run dev`'s own stdout: `src/data/customScenario.js`'s
  `CONDITION_META` builder (`hand.name` for every `CONDITIONS` key) crashed
  because a concurrent session's newer batch (`diltiazemOverdose`/
  `metoprololOverdose`, queue item 40) added two new condition keys with no
  matching `HAND` entry — the same recurring defect class that file's own
  comments already document 4 earlier instances of. This blocks the ENTIRE
  app, not just Sandbox's custom-scenario builder, so it silently fails
  every script in this directory the same way until fixed. If a script here
  ever times out on the very FIRST title-screen click with zero console
  output, restart the dev server fresh and read its own terminal output
  before assuming the script itself is broken.
- **Patching `g.speed` via `setState` to fast-forward sim time is a real,
  safe shortcut — patching `g.patient` is not.** `g.speed` is a plain
  top-level scalar the tick effect already multiplies its own `dt` by every
  100ms real tick, so raising it (e.g. `setState(page,{speed:40})`) is a
  clean way to advance sim time past a threshold like `GRACE` (120s,
  `scope.js`) without a multi-minute real-time wait, and costs nothing to
  undo (`setState(page,{speed:1})`). Do NOT try the equivalent trick on
  `s.patient` — it's a live `Patient` class instance with real prototype
  methods (`.vitals()`, etc.); replacing it via a plain-object `setState`
  patch would silently strip those methods and break every subsequent
  `physio()` call.
- **A responding unit (squad/engine/PD) arriving on scene sets `g.newUnit`,
  which is one of the sim-clock's own pause-guard flags** (App.jsx's tick
  effect: `if(...||g.newUnit||...) return;`) — the clock stalls silently
  (no error, `g.t` just stops advancing) until the "Acknowledge order"/"Take
  command" screen is dismissed. A fast-forward loop that only watches `g.t`
  or a target phase will hang forever once a unit arrives mid-scene, which
  is common on any region with real responding traffic (Suburban/City, not
  just Rural). Fix: poll for `g.newUnit` in the same loop and clear it via
  `setState(page,{newUnit:null})` — a plain field patch, not a click, since
  dismissing an arriving-unit notification is a separate, already-covered
  surface from whatever the script actually exists to verify.
- **"Declare death on scene" only renders on the GENERAL tab** — the scene
  screen defaults to ASSESS, and nothing about a protocol-driven crew (e.g.
  a second paramedic unit auto-running CPR/monitor tasks) changes that. A
  bare `clickText(page,"Declare death on scene")` times out with no hint
  that the button simply isn't the active tab's content; real-click
  `"GENERAL"` first.
- **`getState(page)` can transiently return `null` inside a tight polling
  loop** — page.evaluate() calls the hook via
  `window.__proximateTestGetState`, and reading it *quickly enough after*
  another `setState` in the same loop iteration can occasionally race past
  a render. Guard every loop that calls `getState` inside `for`/`while`
  with an explicit `if (!st) { await page.waitForTimeout(100); continue; }`
  rather than assuming the object is always truthy.
- **Directly mutating a PLAIN TOP-LEVEL field on `getState()`'s returned
  object does not reliably reach the tick loop's own closure — only
  fields nested inside a long-lived object carried by reference across
  ticks (like `s.patient`) survive direct mutation.** Found while building
  `verifyTreatmentResponseDialogue.mjs`: `s._analgesiaCheckAt = 5` followed
  by an immediate `getState()` readback showed the value "stuck" —
  but the very next tick-loop iteration (instrumented directly at the top
  of the `setG` callback, independent of `getState()` entirely) received a
  RAW `s` whose `_analgesiaCheckAt` was still the OLD value. `s.patient.
  intrinsicPain = 9`-style mutations, by contrast, work reliably (this is
  exactly what `verifyDialoguePanel.mjs` and every other script here
  already do) — the difference is that `patient` is one long-lived object
  threaded across every tick's `{...s,t:s.t+dt}` spread, so mutating a
  property ON it is visible to whatever tick reads it next, while a
  freshly-mutated TOP-LEVEL property can lose a race against a tick that
  was already in flight when the mutation landed. Root cause not fully
  chased to ground (React 19's own state-commit timing is the leading
  suspect, not confirmed) — the fix that matters: route any new top-level
  field through `window.__proximateTestSetState({field: value})` (the
  same official, `setG`-based path `phase`/`t`/`speed`/etc. already use),
  never through direct mutation, unless the field lives inside `s.patient`
  or another object you've already confirmed is carried by reference.
- **Forcing `pat.seizing=true` directly is NOT a reliable way to trigger a
  seizure-onset edge for a scenario with no real seizure risk factors.**
  `neuro.js`'s own sustain check (`SUSTAIN=0.15`) reads `seizureDrive`
  (derived fresh every tick from the patient's real metabolic/eclamptic/
  hyperthermic/epileptic drives) and resets `pat.seizing` back to `false`
  the moment that drive is below threshold — for a plain patient with none
  of those risk factors, the drive is genuinely 0, so a bare direct-mutated
  `true` gets reset by the very next tick's `stepPatient()` call, often
  before any edge-detection code downstream ever reads it as `true` at all
  (confirmed by direct tick-by-tick instrumentation while building
  `verifyCrewDialogueReaction.mjs`: it lost that race in every trial). Only
  setting `pat.epilepticDrive=1` (the real condition-level handle,
  persisted across ticks, that real seizure conditions use) makes onset
  merely PROBABILISTIC — `Math.random() < seizureDrive*dt*2`, with `dt` in
  MINUTES (`(s.t - pat.lastUpdate)/60`), so at speed 1 that's roughly
  0.0017 min per 100ms tick — a real coin flip, not a given, within any
  short polling window. The reliable fix: set BOTH `epilepticDrive=1` AND
  `seizing=true` in the same mutation — the drive keeps `seizureDrive`
  above `SUSTAIN`, so the very same reset check that would otherwise fight
  a bare boolean instead confirms it and leaves it alone, giving a
  deterministic, immediately-true, sustained seizure exactly like
  `activeSeizureGTC`/`statusEpilepticus` produce for real.
- **A plain page-text scrape for a short, generic string is a real
  false-positive trap once that same string also appears elsewhere on the
  page for an unrelated reason.** `verifyCrewDialogueReaction.mjs`'s first
  draft checked `/CREW/.test(await page.locator("body").innerText())` —
  which is ALSO the fallback role label App.jsx renders on the crew-roster
  panel (`(p.title||p.role||"CREW").toUpperCase()`), present on screen
  regardless of whether any dialogue-manager-driven crew line ever fires.
  This made the negative-control check (no crew present → expect silence)
  pass even when the feature under test was fully absent, since the
  crew-roster label wasn't there either — but it also meant a REAL
  regression in the dialogue path could hide behind that same string
  appearing on screen for a completely unrelated reason. Read the actual
  state field (`window.__proximateTestGetState().dialogueLog`, checking for
  a specific `speaker` value) instead of scraping rendered text whenever a
  candidate match string is short/generic enough to plausibly appear
  elsewhere in the UI.
- **A `clickText()`-driven retry loop against a probabilistic action can
  silently burn every attempt on clicks that never actually reach the
  handler, reading as "the mechanism never fires" instead of "the click
  didn't land."** Building `verifyDialogueTier3Extension.mjs`'s procedure-
  discomfort site (a real "Level of consciousness (AVPU)" click, 45% chance
  of a discomfort line per real `start()` invocation) saw 0 hits across 30
  straight attempts — astronomically unlikely under a genuine 45% draw.
  Direct instrumentation (reading `g.busy.id` immediately after each click)
  showed `start()` simply never ran on the losing attempts: the click
  "succeeded" (no Playwright timeout) without ever flipping `g.busy`. The fix
  was two-part: use `page.locator(...).click({force:true})` instead of
  `clickText` (this button's parent re-renders every 100ms sim tick, the
  same "not stable" class of flake documented elsewhere in this list), AND
  explicitly `waitForFunction(() => g.busy?.id==="theActionId")` after the
  click to confirm the click really reached the handler before counting that
  attempt toward the probabilistic sample — a silently-missed click no
  longer masquerades as a fair "loss." Also found while building the same
  site: this project's sim clock does not advance while `g.busy` is set,
  and clearing `busy` directly via the test hook (bypassing the app's own
  `cancelAction()`) does not resume it either — two attempts fired back to
  back this way can land on the exact same sim-second and therefore the same
  `dlg_<id>_<round(t*10)>` dialogueLog id, which is a property of that
  pre-existing id scheme (shared by every dialogue call site), not proof of
  a double-fire bug. Assert on log-entry CONTENT integrity (well-formed
  speaker/text/tier, no crash) for a rapid-refire check on this kind of
  site, not on id uniqueness.
- **A `waitForLogPrefix`-style "does any entry with this id prefix exist
  yet" check can match a STALE entry from an earlier section of the same
  script, not the fresh trigger the current section is trying to confirm —
  if `dialogueLog` was never reset between sections.** Building
  `verifyMinigameDialogue.mjs`'s AccessMinigame tier-3 gate check, a second
  retry loop meant to fire a FRESH `procedure_discomfort` line (with the
  stub engine forced) reported success on its very first pass, but the
  entry it found was byte-identical to the ONE line the prior section had
  already produced and left sitting in `dialogueLog` — the loop never
  actually clicked its way to a new trigger before the id-prefix match
  fired. The tier-3 patch then never landed, because
  `requestLocalUpgrade`'s callback was patching an entry the earlier
  attempt's OWN (still-pending or already-resolved) upgrade request had a
  legitimate claim to, not the one this section's assertions cared about.
  Fix: `setState(page, {dialogueLog: [], dialogueMemory: []})` immediately
  before any retry loop that re-checks a log-prefix match, even if an
  earlier section in the same script already did the same reset — don't
  assume a clean slate carries forward past a section boundary you didn't
  explicitly re-clear.
- **The `window.__proximateTestForceLocalAi` reassert-before-every-attempt
  pattern (documented above for `verifyDialogueTier3Extension.mjs`) is not
  sufficient on its own when a retry loop's OWN body contains multiple
  `await`s between the reassertion and the actual trigger event.** The same
  AccessMinigame tier-3 check above still intermittently logged
  `requestLocalUpgrade`'s own internal gate as "blocked: not available"
  (confirmed via temporary instrumentation, since reverted) even though a
  reassertion had run at the top of that same loop iteration — the app's
  real background `preload()` (a genuine pending WebGPU adapter request
  from page boot) rejected asynchronously and re-latched `_failed=true` in
  the ~300-400ms gap the loop's own uncap-click / hold / release sequence
  left between the reassertion and the actual `mouseup` that fires the
  real trigger. The fix: reassert the forced stub a SECOND time
  immediately before the specific event that actually calls
  `requestLocalUpgrade` (here, right before the `mouseup` dispatch, not
  only once at the top of the loop) — closing the gap to effectively zero
  rather than leaving several hundred milliseconds of real async race
  exposed. A script driving a real multi-step UI interaction (as opposed to
  a single `setState`/event mutation) should treat "reassert once per
  attempt" as necessary but not sufficient, and reassert again at the exact
  trigger point when in doubt.
