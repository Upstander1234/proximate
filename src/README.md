# Proximate — modular source

Drop these into your Vite project's `src/` folder (replacing the current
single-file version). No logic changed — this is purely the same working
build split into ES modules.

## File tree
```
src/
  main.jsx              entry — ReactDOM.createRoot
  App.jsx               the App component + game loop, screens, helpers
  theme.js              C (palette), MONO, SANS
  util.js               clk, T, curve, sat, cyan   (pure helpers)
  scope.js              LEVELS, LNAME, CODES, LIM, GRACE, STALE, FETCH, travelTimes
  gear.js               PI, POCKETS, BAGS, RN, TASKS
  ecg.js                BEATS, ECG_READ, ecgPoints
  physiology.js         physio(), critical() -- public interface, delegates to physio/
  physio/
    constants.js         shared constants (ATM, HCT_NORMAL, MAX_STEP, oncoticPressureFromMass)
    ageProfile.js         AgeProfile — age/weight-derived baselines
    pk.js                 PK_PARAMS, DrugInstance, applyProcedures(), updateDrugs()
                           -- THE integration point for data/drugs.js + data/procedures.js
    respiratory.js         ventilation mechanics + gas exchange
    cardiovascular.js      autonomic tone, venous return, pump, rhythm
    renal.js                GFR, RAAS/ADH, electrolytes
    metabolic.js            hemorrhage, capillary fluid shifts, lactate/acid-base
    coagulation.js          clotting factors, platelets, fibrinolysis, TXA
    neuro.js                 organ injury accrual, cerebral perfusion/consciousness
    thermo.js                 core temperature
    mortality.js               sustained-duration death criteria (reads pat, sets deathCause)
    patient.js                Patient class — holds all state, calls each updateX(pat, dt)
                               in physiological order every 50ms sub-step
  actions.js            LIB, PROC_ACTS (action library)
  saves.js              localStorage save slots — list/load/write/delete + JSON export/import
  data/
    drugs.js            DRUGS
    procedures.js       PROCS
    scenarios.js        SCEN
    customScenario.js   CONDITION_LIST/CONDITION_META, buildCustomScenario() — Sandbox's
                          "build your own" case, generated from a condition + age + gender
  components/
    Shell.jsx           page frame (viewport fill + full-width mode)
    BodyMap.jsx         clickable body diagram
  index.css             @import "tailwindcss";
```

## Dependency direction (no cycles)
util, scope, gear, ecg, data/* are leaves.
scenarios -> util.  physiology -> util, scope, data/*, physio/patient.js.
actions -> scope, util, data/procedures.  components -> theme.  App -> everything.

Inside physio/: constants and ageProfile are leaves. pk.js -> data/drugs.js,
data/procedures.js, util.js, constants.js (this is the only file that reads
DRUGS/PROCS). Each organ module (respiratory, cardiovascular, renal,
metabolic, coagulation, neuro, thermo) only imports constants.js — organ
systems don't import each other directly. patient.js imports all of them and
calls each updateX(pat, dt) with the same Patient instance every sub-step, so
systems still interact (e.g. cardiovascular reads pao2 written by
respiratory) purely through shared state on `pat`, not through direct calls.

## Making a drug or procedure affect the patient
Every entry in data/drugs.js / data/procedures.js is read exclusively by
physio/pk.js. To make a new drug/procedure do something physiological, add:
- `fx: { prop: amount }` for a direct additive effect — supported props:
  hr, sbp, rr, fio2, pain, blood, ph, coag, temp, k, kShift, hco3, bronch,
  edema, shunt, glu, ca, bleed, plasminActivity, tv.
- `receptors: { alpha, beta1, beta2, vagalBlock, venodilation,
  arteriolarDilation, calciumChannel, V1, parasympathetic }` for anything
  that should compose with the patient's own autonomic tone (so it doesn't
  double-stack with other vasoactive drugs the way raw hr/sbp fx would).
- Boolean flags `airwayFix`, `ptxFix`, `stopsBleed`, `rhythmFix`, `shadeFix`
  for procedures that resolve a state rather than nudge a number.
- `warmingPower`/`coolingPower` (watts) for active external temperature
  interventions — added as POWER into thermo.js's own heat balance, not a
  direct temp delta, so the effect scales with the patient's actual thermal
  state rather than a flat number applied to anybody.
No other file needs to change — pk.js is the only place that knows about the
shape of DRUGS/PROCS entries.

## Saves & modes
Title → "Go on shift" now opens a save-slot screen (`saves.js`, localStorage-backed,
with JSON export/import for backup or moving between browsers). Picking or
creating a save carries a `saveId` through the rest of the app; the game
autosaves to that slot on entering `kit` (right before a case starts) and
`debrief`/`shiftSummary` (right after one ends).

After scope setup, the player picks a shift type (`phase:"gmode"`):
- **Career Mode** — five calls drawn at random from `SCEN`, played back to
  back with no picking; ends on a `shiftSummary` screen scoring the shift
  against the player's own scope of practice (survival, correct-impression
  rate, "lucky" saves, evidence gathered, base-contact use).
- **Sandbox** — the old `cat` screen, now also offering every named
  scenario directly and a "build your own" form (condition + age + gender)
  that runs through `buildCustomScenario()`. No fixed length; "End shift"
  returns to the saves screen any time.

## To run
1. Put every file above under `src/` (keep the `data/` and `components/`
   subfolders).
2. Make sure Tailwind v4 is wired into Vite (plugin in vite.config.js +
   `@import "tailwindcss";` in index.css — already provided here).
3. `npm run dev`.

If Vite reports an unresolved import, it's almost always a path/case typo in
one `import` line — send me the exact message and it's a one-line fix.

---

## Cardiovascular rewrite — closed-loop emergent hemodynamics

`physio/cardiovascular.js` has been rebuilt from a set of independent scripted
equations into a **true closed-loop controller**: blood pressure and cardiac
output are no longer set directly, they *emerge* from the interaction of
autonomic tone, venous return, a coupled ventricle, and metabolic feedback.
Every sub-step the loop resolves itself, so shock states and disease
trajectories develop on their own rather than being hand-scripted.

**What is now modelled**
- **Split catecholamines** — fast neural sympathetic tone vs. slower adrenal
  output feeding a circulating catecholamine pool drawn from a depletable
  reserve (each with its own time constant).
- **Baroreflex as a controller** — proportional control on an *adapting*
  setpoint (baroreceptor resetting), plus chemoreflex/pain/acidosis drive on a
  low-pass-filtered gas signal.
- **Dynamic venous system** — pressure-dependent venous compliance, mean
  systemic filling pressure from stressed volume, intrathoracic-pressure
  coupling, and vascular capacitances that scale with body size.
- **Ventricular–arterial coupling** — nonlinear (saturating) Frank–Starling
  preload recruitment, HR-dependent diastolic filling time, atrial kick, and
  SV from `Ees(EDV−V0)/(Ees+Ea)` with a descending limb.
- **Myocardial energetics** — coronary supply (diastolic perfusion pressure ×
  CaO2 × autoregulation, capped by any stenosis reserve) vs. demand
  (rate-pressure product), integrated into an ATP state that feeds back onto
  contractility; ischemia therefore *emerges* from hypotension, tachycardia,
  or stenosis.
- **Mechanistic rhythm** — a conduction layer (SA/AV, QRS widening, blocks) and
  a multi-substrate arrhythmia generator (ischemia, repolarization, hyper/
  hypokalaemia, hypoxia, scar) that produce PVCs, VT/VF, torsades, junctional
  and complete-heart-block rhythms (new ECG traces added in `ecg.js`).

Disease modules now express themselves purely through physiological *levers*
(contractility, preload, afterload/`vasodilation`, bleed rate, K⁺, stenosis);
e.g. anaphylaxis drops arteriolar tone and the compensatory tachycardia +
hypotension follow on their own, and an aortic-dissection bleed produces a full
compensated→decompensated hemorrhagic-shock spiral to PEA without scripting.

**Supporting correctness fixes** (needed because the closed loop couples to
these systems, which had latent unit/scaling bugs that were previously masked):
- `constants.js` — plasma oncotic pressure was ~37× too high (g/L used where
  g/dL was expected), driving spurious unbounded capillary absorption that
  corrupted preload. Now uses g/dL.
- `coagulation.js` — thrombin multiplied three ~100-valued factors raw, making
  `clotStrength` ~10⁶ so bleeding was fully suppressed. Factors are now
  normalized, so hemorrhage and coagulopathy work.
- `renal.js` — the acid-base transcellular K⁺ shift was applied once per
  sub-step without `dt` scaling, so any small sustained pH offset integrated
  into lethal hyperkalaemia within minutes. Now rate-scaled.
- `patient.js`/`metabolic.js`/`pk.js` — hemoglobin came out as `15 × Hct`
  (≈6.75) because `rbcMass` omitted the packed-cell concentration factor;
  fixed so Hb ≈ 15 and CaO2/O2 delivery are correct.
- `respiratory.js` — arterial PaCO2 now tracks alveolar ventilation with a
  physiologic time constant instead of snapping each tick, removing a
  ventilation/gas-exchange limit cycle; resting lung compliance retuned so a
  normal adult clears CO2 to ~40 mmHg (pH 7.4).

**Known limitation** — pediatric/neonatal hemodynamics are only approximate.
The ventricular and venous capacitances now scale with body size, but the
`ageProfile` resistance/arterial-compliance constants for patients under ~12y
were tuned for the previous direct-BP model and still need their own
recalibration; all shipped scenarios are adults (ages 22–75).
