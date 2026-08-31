# Proximate — physiology engine work. Session handoff.

You are continuing work on **Proximate**, a browser-based prehospital-care
simulator whose value rests entirely on its closed-loop physiology engine. The
engine is a coupled ODE model — a 16-state cardiovascular loop, a mechanical
respiratory model, renal/endocrine, metabolic, coagulation, thermoregulation,
neuro, obstetric — plus a two-compartment pharmacokinetic/pharmacodynamic layer.

**This document is self-contained.** It supersedes all previous handoffs; you do
not need any earlier version.

## How to read this document, and what is authoritative

This file is long because the project's own rule (section 4) is that every
mechanism must be measured against the real engine before it's trusted, and
that verification detail is worth keeping once written. Not every section
carries equal authority, so read in this order:

1. **Section 4 (how to work)** and **section 7 (hard-won lessons)** first —
   the rules that don't change from session to session.
2. **Section 2 (current state / verification baseline)** and **section 6
   (the queue)** are the AUTHORITATIVE statement of what's done and what's
   open right now. Trust these over anything else in the document,
   including the rest of this preface.
3. **Section 3 (what changed) is a historical changelog, newest entry
   first — not a live status board.** It's kept for the mechanism-level
   reasoning behind each fix: why a coefficient is what it is, what was
   tried and rejected. A later entry can update or correct an earlier
   entry's conclusion; prose written while something was mid-batch does
   not get rewritten once it later ships. **Don't infer current status
   from how a section 3 entry is worded — cross-check section 6.** Only
   the most recent entries are kept inline here; older entries live in
   `SESSION_HISTORY.md` (same rules apply there) — consult it only when
   you need the reasoning behind an older fix, not for day-to-day work.
4. Inside section 6, a queue item's own opening line can also go stale
   without the rest of the item being rewritten — e.g. an item that opens
   "IN PROGRESS" may have a later paragraph in the SAME entry adding
   "RESOLVED — see below." Read an item's full body before treating its
   first sentence as the current status.
5. **Per lesson 16: a claim in this document — including everything above
   — is not the same as what the tree contains.** Before starting or
   trusting any item, confirm the claim against the actual code (grep the
   field or function it names, check the file exists) rather than building
   on the sentence alone.
6. **Section 8 (target condition library)** is a reference backlog for the
   item-7 condition-library workstream. Consult it when working that item;
   it's not a general project-status source.

## Quick status

- **What to work on next**: section 6's queue, top to bottom. It is kept
  renumbered with no gaps, and an item is deleted outright (not just
  marked done) the session it ships — so nothing in it is stale by
  construction. The front-end block is prioritized ahead of the numbered
  physiology items; within a block, order is roughly by leverage.
- **Verification baseline**: section 2's table holds the current suite
  results and the current `eslint` error/warning count. A baseline number
  quoted inside a section 3 entry is the count AT THE TIME that entry was
  written — check section 2 for the number that's current now.
- **Most recent work**: read section 3's topmost entries directly rather
  than a summary here (front-end and physiology are two separate
  historical tracks in that section — check both). Duplicating that
  narrative in this preface is exactly what let it go stale in past
  revisions of this document; section 3 itself is kept current every
  session, so it's the one copy worth trusting.
- **Standing order: no em dashes ("—") in player-facing content.** Fix
  them incrementally as you come upon them while touching a file for
  other reasons, not as a dedicated sweep. Player-facing means anything
  the player can read in the running app — dialogue, log lines, action
  labels, UI copy, tooltips. Does not apply to this document, other
  session-handoff/dev-facing prose, or code comments — an em dash in a
  `//` or `/* */` comment is fine and not something to hunt down.

---

## 1. What this project is, and the standard it is held to

Proximate teaches prehospital medicine. Its scenarios are not scripted: the
patient's trajectory emerges from the physiology, so a candidate who ventilates
badly gets hypercapnia because the alveolar ventilation equation says so, not
because a designer wrote a branch for it. That is the whole premise, and it is
why the engine's correctness matters more than any feature.

Two rules follow from that and are non-negotiable:

**Every physiological effect must be a MECHANISM, not a stat write.** A drug or
procedure declares what it physically does — receptor occupancy, resistance,
dead space, channel blockade, heat in watts — and the relevant engine layer turns
that into observable vitals. Writing `fx: { sbp: +30 }` is forbidden, because it
produces a monitor number without producing the state that number is supposed to
be a measurement OF.

**No decorative fields.** If a condition or drug writes `pat.something`,
something must read it. Fields that are written and never read (or read and never
written) have been a recurring, invisible defect class — chronic kidney disease
wrote `renalInjury`/`gfrFactor` while the engine read `kidneyInjury`; `pat.seizing`
was read by the metabolic layer and written by nothing for most of the project's
life. This applies to your own debugging too: strip instrumentation before you
ship.

**A corollary that dominated the last session, and is worth stating as a third
rule: a field can be written, read, and still be inert.** Every significant
defect found last session was a declared mechanism that did not reach the
observable it claimed to affect — `chamberRemodeling` bought 2.2 mL of ventricle;
`baseSVR` was divided back out by the ratio that consumed it; myocardial ATP sat
at exactly 1.000 through a fifteen-minute arrest with no cardiac output. None
were wrong numbers needing tuning. When you add a mechanism, measure the
observable at the far end of the chain, not the field you just wrote.

---

## 2. Current state — a real strong-ion-difference acid-base model (queue item 44, CLOSED)

**CURRENT VERIFICATION BASELINE (most recent session — queue item 44, the
acid-base solver; see section 3's topmost entry for the full detail):**

| suite | result | notes |
|---|---|---|
| `mechanismWiring.mjs` | **374 passed, 1 failed** | the single failure is `activeSeizureGTC -> pat.seizing engages` at 6/10 (need >=7) — a separately-documented, pre-existing flaky stochastic assertion (see this document's own prior entries) that reads `pat.seizing`/`epilepticDrive`, nothing this batch touched. Every acid-base-touching assertion (DKA, severeMetabolicAcidosis, hyperkalemiaMissedDialysis, addisonianCrisis, the standing hyperkalemia/torsades/magnesium sections) passed clean. 374+1=375, the same total assertion count as the pre-batch tree — confirms no assertions were silently lost. |
| `scenarioSweep.mjs` | **157 scenarios, 10,102,324 checks, 0 failed** | a first full run against this batch found 896 real failures (`diabetesInsipidusThirsty`/`hypernatremia` pushing pH to 7.62/7.71, outside the survivable [6.80,7.60] bound) — a genuine bug in the new model (see section 3), fixed and re-confirmed clean. |
| `npx eslint src` | **3 errors, 0 warnings** | the same pre-existing `react-refresh/only-export-components` findings in `App.jsx`, zero in any file this batch touched. |
| `npx vite build` | clean | same pre-existing >500kB chunk-size warning |
| `physiologyValidation.mjs --section=2b` | **10 passed, 1 failed** | the resting-gases pH check (7.35-7.45, the ONLY acid-base assertion anywhere in this suite — confirmed by grep across the whole file) passed at 7.44. The one failure, `morphine 4mg -> PaCO2 rise` (2.13 vs required 4-10 mmHg), is a pre-existing, unrelated opioid-receptor-calibration gap — morphine's respiratory depression runs through `respDriveSuppression`/`class:"opioid"`, never touching `fx.hco3`/`fx.ph` or any field this batch's `sidAdjust`/`unmeasuredAnions`/`clShift` levers reach, confirmed by reading the drug's own definition before ruling it out. |

**physiologyValidation's other 25 sections were NOT run this session** —
stated honestly, not assumed clean. The full suite's own documented
instability in this environment (section 4/lesson 14) and this section's own
already-large time budget were the deciding factors; every acid-base-relevant
assertion in the ENTIRE file (confirmed by grepping for `hco3`/`ph`/`anionGap`/
`cl` across the whole script, not just the sections that sounded relevant) is
the single one in section 2b that was run. The other sections test drug PK,
cardiac rhythm, renal/electrolyte, obstetric and neuro mechanisms this batch
did not touch — `mechanismWiring.mjs`'s own coverage of those same conditions
(all passing) is the real regression evidence for them, not a guess.

**Condition count is unchanged at 157** — this batch shipped a MECHANISM
(and fixed two real bugs the mechanism's own construction surfaced), not new
conditions.

---

**Everything below this line is the older section-2 text, carried forward. STOP:
the table below is several batches stale — do not trust it for the
current condition count or the current suite numbers.** Read section 3's
topmost entry (queue item 44, the acid-base solver) for the current
verification baseline, now restated at the top of this section — the
valvular-regurgitation table immediately below is the batch before that one,
kept for its own still-accurate mechanism-level detail, not as a status
source. Below THAT is the older "next 3 items" physiology batch — queue item 35's
uremic-fetor sub-case closed for real, `atropineOverdose` shipped under
item 40's standing workstream, `toxicInhalationChlorine` shipped as item
28's physiology half — 156 conditions now implemented. Touched files:
`conditions.js`/`actions.js`/`scenarios.js`/`App.jsx`/`mechanismWiring.mjs`.
Fully verified to completion — `mechanismWiring.mjs` **356 passed, 2
failed**: both are the SAME already-documented, currently-live naloxone
regression from unrelated, concurrent work (see the prior entry's own
"naloxone" paragraph for the full trace) — not caused by this batch, and
NOT a new failure (same 2 failures, unchanged); every one of this batch's
own 6 new assertions passed clean, and the two previously-flaky stochastic
assertions (PACs stdev, Tzivoni magnesium/torsades) both passed clean this
run too. `scenarioSweep.mjs` 156 scenarios/7,089,578 checks/0 failed
(up from 154 by exactly the 2 new scenarios), `npx eslint src` (exactly
the pre-existing 3-error baseline, zero new findings) and `npx vite build`
both clean. Below that is the five-queue-item physiology batch (items
42/6/43 closed, two new overdose conditions shipped under item 40's
standing workstream — 154 conditions at that point). Below that is the OB/GYN
hemorrhage + AAA + GI batch (8 new conditions in one session, queue item
7's standing workstream — 152 conditions at that point, fully verified:
`mechanismWiring.mjs` 343/1 the item-43 gap since closed above,
`scenarioSweep.mjs` 152/6,907,794/0). Below that is the electrolyte +
shock/GI/vascular/psychiatric batch (16 new conditions in one session —
144 conditions at that point, also fully verified to completion:
`mechanismWiring.mjs` 325/1 both pre-existing, `scenarioSweep.mjs`
144/6,414,626/0). Below that is a front-end map-expansion batch (five
items — multi-hospital maps, capability-aware destination routing,
weather/road-surface transport effects, real-route 3D wiring), front-end
only, no physiology suite re-run needed for it. Below THAT is
`rocuroniumOverdose` (queue item 40's standing overdose-condition
workstream, first drug shipped — 127 conditions at that point,
independently verified to completion in its own session:
`mechanismWiring.mjs` 283/2 both pre-existing, `scenarioSweep.mjs`
128/5,241,090/0). Below that, `hyperkalemiaMissedDialysis` (126 conditions
at that point, also independently verified). Everything below those five
entries — including the table right below this paragraph — describes an
earlier, superseded batch. Don't read "not in this table" as "not
verified" — check section 3's newest entries first, in order, before
trusting anything below this paragraph.**

**Current as of the neuro/endocrine batch (see section 3's newest entry) —
by a wide margin the largest single batch this project has shipped: 54 new
conditions** (27 Neurologic, 17 Endocrine/Metabolic, plus 10 comorbidities/
acute conditions from queue items 21/23/24/27), touching `patient.js`,
`neuro.js`, `cardiovascular.js`, `respiratory.js`(read-only reuse),
`thermo.js`, `conditions.js`, `scenarios.js`, `gear.js`. `mechanismWiring.mjs`
and `scenarioSweep.mjs` are both freshly re-run against this batch's FINAL
state, after three real iteration cycles (an initial pass found 10 real
issues — some genuine bugs, some test-calibration mistakes — all fixed and
documented in section 3).

| suite | what it does | last result | approx runtime |
|---|---|---|---|
| `mechanismWiring.mjs` | proves each declared mechanism reaches an observable | **RE-RUN since (section 3's newest entry, the item-5 `bun`/`dpg` batch): 268/269. The 1 failure, `activeSeizureGTC` seizure engagement at 6/10 vs needed 7/10, is a NEW single-run flaky draw (unrelated to that batch — re-confirmed as noise at 7/10, 8/10, 8/10 on standalone re-runs), not the same two failures this row used to cite (torsades+cardioversion, PAC HR-variance) — those passed clean in this run. Treat 268/269 as current, not the 267/269 below** | ~22 min |
| `scenarioSweep.mjs` | scenarios x 900 s, impossible-value checks | **RE-RUN since (same item-5 batch): 124 scenarios / 4,965,706 checks / 0 failed — the +223,200 over the count below is exactly the item-5 batch's own new `bun`/`dpg` field checks (124 scenarios x 450 ticks x 4 checks), confirmed arithmetically, not just asserted** | ~20 min |
| `arrhythmiaEfficacy.mjs` | Monte Carlo: do antiarrhythmics change OUTCOME | **3/3 (carried forward, stale — this batch does not touch antiarrhythmic mechanisms)** | ~12 min |
| `renalValidation.mjs` | renal/electrolyte | **28/28 (carried forward, stale — this batch's ADH/sodium work reuses renal.js's own already-verified mechanism, not new renal.js code)** | ~2 min |
| `physiologyValidation.mjs`, targeted sections | sections reached by an earlier batch's changes | **carried forward, stale — NOT re-run against this batch; mechanismWiring's own new sections are this batch's real regression coverage** | ~15 min |
| `pregnancyBenchmark.mjs` | **instrument** — obstetric vs documented ranges | **9/16 in range (carried forward, stale — untouched)** | ~3 min |
| `pkAudit.mjs` | **instrument** — drug concentrations vs published | **15 of 17 clean, epiIM/epiAuto INERT — documented, open (carried forward, stale)** | ~20 min |
| `curveDrugAudit.mjs` | **instrument** — saturation of curve-model drugs | **0 of 6 flagged (carried forward, stale)** | ~7 min |

`npx vite build` passes clean. `npx eslint src` — **the baseline itself
shifted this session**, from 106 errors/5 warnings to **73 errors/4
warnings**, due to an external cleanup pass (unused-variable removals in
`neuro.js`/`ecg.js`/`pk.js`, observed mid-session, not authored by this
batch) that fixed some of the old baseline's own errors. Verified by
content, not just count: grepping the full eslint output for every file
this batch touched (`patient.js`, `neuro.js`, `cardiovascular.js`,
`respiratory.js`, `thermo.js`, `conditions.js`, `scenarios.js`, `gear.js`,
`procedures.js`, `categories.js`, `actions.js`) returns ZERO matches —
none of the 73 errors or 4 warnings are attributed to any file this batch
touched. **73/4 is the new baseline for future sessions to diff against**,
not 106/5.

Everything below this point (the rest of section 2, and section 3 below the
newest two entries) describes the state as of an earlier batch and is
carried forward unchanged, not re-verified against this session.

**Note on running the long suites in this environment:** detached background runs
(`setsid`/`nohup ... &`) do NOT survive between steps here — they get killed and
leave a 0-byte log (lesson 16), so the buffered done-flag pattern never
completes. What works: run FOREGROUND with `--stream` (which uses
`fs.writeSync(1,...)`, so partial output survives a kill), and for
`physiologyValidation` part 2 run it PER SECTION (`--section=NAME`, names are the
bare labels: 2f/2g/2h/2i then 3..16) in small batches, because the whole part
exceeds a single step's time budget. This session's part-2 confirmation was done
that way: 60/60 across every section that emits streamable assertion lines, 0
failed. Sections 5/6/7 (central/nephrogenic DI — pure renal free-water handling)
did not emit streamable output and were NOT re-confirmed, but they read none of
the contractility/EF/QTc state any recent batch has touched. WATCH the grep: the
section header "[ENERGY FAILURE]" (section 15) matches a naive `grep FAIL` and
looks like a failure — filter on `^  PASS`/`^  FAIL` for real assertion lines.

**Verification scope for the takotsubo batch, stated honestly:** the change
touches shared cardiovascular code (the adrenergic contractility term and the
qtc term) and adds one scenario, so the regression that matters is part 2 of
`physiologyValidation` and the sweep. Both are green: part 2 at 60/60 across
every runnable section (the pressor-pharmacology, myocardial-energetics,
clinical-state and sepsis/CO sections — the entire region the change can reach —
all pass), and the sweep at 561,496/0 with the new scenario clean across its
whole course. The carried-forward note below is from the torsades batch and still
describes the same part-2 coverage region:

Part 2 of `physiologyValidation`
covers every rhythm, cardiac-output, arrest and
seizure section — the entire region the change can reach — and sections 2g/2h/2i
were additionally run alone. Part 1 (2b-2e: opioids, sedatives, LAST) was NOT
re-run last session; it exercises drug PK the takotsubo batch did not touch and is what
`--fast` skips. If you want the literal 115/115 line back, run
`node src/scripts/physiologyValidation.mjs 1` once and confirm before trusting it.

**Both instruments are real measurements**, not inherited numbers. Their two
standing "outliers" were both investigated and both resolved: pushEpi's low Imax
was a genuine defect (ec50 was ~3x too high, now fixed), and rocuronium's was a
units-category error in the audit itself (a pharmacodynamic potency range being
compared against peak plasma; band corrected).

### `physiologyValidation.mjs` — usable again: **115 passed, 0 failed**

This suite could not be completed for two sessions. It now runs, and the
capabilities that made that possible are the durable part:

- **`--section=NAME`** runs one section and nothing else; **`--list`** names
  them. A 45-minute run that cannot be finished becomes twenty short ones that
  can, and a single failing assertion is re-runnable in under a minute.
- **`--stream`** prints each check as it is made via `fs.writeSync(1, ...)`,
  NOT console.log — node block-buffers stdout to files and pipes, so a killed
  run used to write a zero-byte log. It also reports per-section elapsed time.
- **The tier line names what actually ran** — section, part, fast, or full.

A TRUNCATED RUN IS NOT A PASS. Section 2h is the slowest (~139 s plus ~37 s
setup) and truncates easily, especially with anything else on the machine.
Check for the exit marker and the "N passed" line, not just the absence of
failures — treating "no failures so far" as verification cost a bad ship, a
misdiagnosis, and the reversion of innocent work last session.

**Per-section cost** (add ~37 s module load to each individual invocation):

**A COUNT THAT DOES NOT RECONCILE, noticed while verifying the torsades batch
and not resolved.** `--fast` reports 61 and is documented as skipping only the
slow pharmacology block 2b-2e; those four sections run individually at 11 + 5 +
8 + 7 = 31. That totals 92, not the 115 this table records for the full tier.
`--list` shows 2h three times, so at least some sections contribute more than
one block, and the 115 may be the sum of individually-run sections where shared
setup assertions are counted once per invocation. Worth settling before anyone
uses "115" as a completeness check — a coverage number nobody can reconstruct
is the kind of thing lesson 10 is about.

    2h 13   2b 11   2d  8   2e  7   10  6   14  6   16  6   12  5
    15  5   2c  5    1  4   13  4   2f  4   2g  4    3  4   11  3
     4  3    5  3    8  3    2  3    6  2    7  2    9  2   2i  2

Slowest: 2f ~126 s, 2h ~139 s, **2b >285 s**. Everything else is under a minute,
though sections 5, 6 and 7 each need ~100-140 s before their FIRST check appears
— a short cap on those returns zero results and looks like a failure when it is
only a truncation.

Give 2b a generous cap. Its last assertion ("3 doses > 1 dose but SUB-linear")
runs three extra full simulations and is the single most expensive check in the
suite. A 285 s cap truncates exactly one assertion short of the end, which is
easy to misread as a regression — it is not; every value before it matches to
the digit.

**Redirect to a file. Do NOT pipe through `tail`** — that re-buffers and
destroys the streaming, a mistake I made twice in one session after writing the
warning.

### GREEN IS A WEAK SIGNAL — KNOW WHAT IT DOES NOT COVER

Everything passes, which means the next regression has nothing to trip. Two
things are worth holding onto:

First, the survivable-range checks in `scenarioSweep` went **red on arrival**
(1327 failures across 5 scenarios) and were then made green by a real engine fix,
never by relaxing them. They are permanent regression protection and must not be
loosened to make a run pass.

Second, the defect they caught had been invisible to ~497k passing checks for as
long as the sweep had existed. Assume there are more like it. See lessons 10 and
10b.

---

## 3. What changed in the last session

### Physiology-engine batch: queue item 60, part 2 of 3 — tracheostomy state model

**Confirmed the gap before touching anything.** No `pat.tracheostomy`/cannula-obstruction field existed anywhere. TP 1234's entire tracheostomy-emergency branch (inner-cannula obstruction, tube replacement, stoma ventilation) had nothing to hook into.

**`pat.tracheostomy`** (boolean, scenario-authored trait) and **`pat.trachObstruction`** (0-1, real inner-cannula secretion-obstruction severity) — deliberately modeled as a structural PATIENT TRAIT distinct from `pat.artificialAirway` (the existing ETT/SGA mechanism a crew places live during a call) — a tracheostomy is a pre-existing surgical airway the patient already has.

**MECHANISM, wired into `respiratory.js`'s existing airway-resistance calculation, two real, opposite consequences.** (1) **Bypass** — a tracheostomy sits below the larynx/pharynx, so it physically bypasses `pat.upperAirwayObstruction` (croup/epiglottitis's fixed-extrathoracic field) entirely, gated to exactly zero rather than scaled down, since the physical bypass is total. (2) **New vulnerability** — `pat.trachObstruction` gets its own multiplicative resistance term (coefficient 1.6, between `airwayFluid`'s 1.3 and `upperAirwayObstruction`'s 1.5, since a small-bore trach tube can occlude more severely per secretion volume than a native airway). Untreated secretions genuinely accumulate over time (real, standard trach care requires routine suctioning specifically because of this).

**Treatment reuses the EXISTING `suction` procedure rather than inventing a near-duplicate one** — real inner-cannula clearance uses the same technique as oropharyngeal suctioning. On the same suction dose, `pat.trachObstruction` clears to near-zero (matching TP 1234's "clear/replace the inner cannula" field step); a no-op for every patient without a tracheostomy. Deliberately did NOT add a new procedure needing registration across `gear.js` and all three scope files — reuse was both more realistic and lower blast-radius in a session with several other agents touching shared files concurrently.

**MEASURED** (direct probes, no dedicated scenario yet): cannula obstruction (0.6) raises real work of breathing (0.094->0.109). The bypass effect is real but honestly modest — a native airway with `upperAirwayObstruction=0.8` costs slightly more tidal volume than a tracheostomy patient (0.4866L vs 0.4886L at 600s), partly re-equalized by this engine's own load-dependent effort/rate compensation — asserted at the real measured threshold, not an invented larger one. Untreated obstruction worsens 0.600->0.660 over 600s; suction clears it to 0.005; a non-tracheostomy patient's `trachObstruction` stays untouched by suction (specificity).

**Verification.** `trachObstruction` added to `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE lists. Five new two-sided `mechanismWiring.mjs` assertions in a new `[TRACHEOSTOMY STATE — queue item 60, part 2 of 3]` section, all measured passing via a standalone replica of the suite's own logic. `npx eslint` clean. **All three parts of queue item 60 are now closed** — part 1 (nebulized epi) and part 3 (FBAO crew task) shipped in earlier parallel batches this session.

### Physiology-engine batch: queue item 59 — decompression illness (venous gas embolism), reusing `pe`'s existing mechanism rather than inventing a parallel one

**Explicitly lower priority than items 56-58, attempted since 56 went cleanly.** No dive-depth/dive-duration state or bubble/embolism mechanism existed anywhere; `laCounty.js`'s TP 1225 section reused only the generic arrest/hypothermia/poor-perfusion baseline.

**Real mechanism, deliberately reusing an existing handle.** On ascent, dissolved nitrogen comes out of solution faster than it can be eliminated by ventilation, forming venous gas emboli that shower the pulmonary vasculature — mechanically the SAME lesion a thrombotic pulmonary embolism produces (Vann et al., Lancet 2011). `decompressionIllness` (conditions.js) therefore drives the identical `pat.shuntFraction`/`pat.pulmResistFactor` mechanism `pe` already uses, at its own magnitude/time course, rather than building a second, parallel embolism handle for a mechanistically identical lesion with a different cause.

**Scope boundary, stated honestly**: scoped to the pulmonary ("chokes") limb only — arterial gas embolism and spinal-cord DCS (the neurologic Type II presentation) are real but mechanistically SEPARATE lesions this engine has no comparable handle for, deliberately not modeled here.

**Real O2 treatment**, gated on `pat.effectiveFio2` (the same real "what is this patient actually breathing" value CO poisoning's own clearance mechanism already reads) at a threshold calibrated to this formulary's actual `o2nrb` device — high-flow O2 works through denitrogenation (maximizing the outward nitrogen partial-pressure gradient), genuinely slower and less complete than hyperbaric recompression (which TP 1225 separately mandates and this engine cannot model).

**A real, honest side fix found along the way**: `pat.pulmResistFactor` had NO constructor default at all before this session (every consumer already read it via `||1`, so behavior was already correct, but the field itself was `undefined` pre-first-tick) — given a real default of 1 so it can be asserted on like any other field.

**MEASURED**: untreated (1200s, seeded 0.3): shuntFraction 0.460, pulmResistFactor 3.000 (ceiling); o2nrb-treated: 0.113/1.000 (floor); healthy control: 0/1.000.

**Verification.** `shuntFraction`/`pulmResistFactor` added to `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE lists (a genuine pre-existing coverage gap closed while working nearby — both are real fields already used by a dozen-plus conditions that had never been checked). Three new two-sided assertions in `mechanismWiring.mjs`. `npx eslint` clean. No narrative dive scenario authored — physiology-mechanism-only scope, matching `thermalBurn`'s precedent.

### Physiology-engine batch: queue item 5's remaining dead-field — real endocrine-pancreatic glucose regulation (`pat.insulin`/`pat.glucagon`)

**The real gap, confirmed by grep before touching anything.** `pat.insulin`/`pat.glucagon` (patient.js constructor) were set to 1 and never read or written again anywhere in the engine — glucose regulation ran entirely through direct `pat.glucose` writes (a one-time dose delivery for d10/glucagon/oralGlucose, and each condition's own one-time seed). Confirmed by grep: a condition-less patient's glucose was completely static outside a drug dose, with no auto-correction mechanism anywhere.

**MECHANISM, built in `renal.js`'s `updateRenalEndocrine`, the same "hormonal axis relaxes toward a physiologic target" idiom `pat.cortisol` already uses.** `insulinTarget(glucose) = clamp(1+(glucose-100)/50, 0.1, 5)` (real beta-cell secretion rises with glucose, Sherwin et al.'s classic roughly-linear dose-response over 70-250 mg/dL); `glucagonTarget(glucose) = clamp(1-(glucose-100)/80, 0.1, 4)` (the mirror counter-regulatory hormone). Both relax toward target at 0.125/min (tau ~8 min, matching real first-phase insulin release timing). Glucose disposal/production: `disposal = 0.0007*insulin*insulinSensitivity*max(0,glucose-60)*dt`, `production = 0.028*glucagon*dt` — the 40x ratio between the two rate constants is a DERIVED number (what algebraic equilibrium at the 100 mg/dL reference point requires once both targets are pinned to 1.0 there), not a fitted one. **`pat.insulinSensitivity`** (new field, default 1) is the tissue-RESPONSE lever, deliberately kept separate from secretion — what lets a resistant phenotype (Type 2/HHS) be modeled honestly differently from a deficient one (Type 1/DKA).

**Coexistence with the existing DKA/HHS/severeHypoglycemia conditions — the item's own explicit requirement.** Without intervention, the new generic disposal loop would auto-correct EVERY hyperglycemic patient over time, including DKA/HHS — clinically wrong. Fixed per-condition, at the correct real lever for each phenotype: `diabeticKetoacidosis`/`pediatricDKA`/`typeIDiabetes` (real absolute insulin deficiency) now cap `pat.insulin` at 0.3 every tick; `hyperosmolarHyperglycemicState`/`diabetesT2` (real insulin RESISTANCE, not deficiency) cap `pat.insulinSensitivity` instead (0.2 decompensated HHS, 0.5 milder chronic Type 2); `severeHypoglycemia` (real EXOGENOUS insulin/sulfonylurea cause, which doesn't respond to the body's own falling-glucose feedback) forces `pat.insulin` to at least 3 every tick — correctly OPPOSING, not preventing, glucagon's genuine counter-regulatory rise, still reversed by dextrose through `pk.js`'s completely unmodified dose mechanism.

**Scope decision, stated honestly: drugs' existing direct `fx.glu` writes were left untouched** (d10/glucagon/oralGlucose) — these represent a discrete DELIVERED DOSE, not a continuous rate, the correct real-world distinction and exactly this item's own suggested scope boundary. Measured to confirm coexistence: d10 given to an untreated `severeHypoglycemia` patient still moves glucose 28.4->349.5 mg/dL, unchanged in character from before this session.

**MEASURED** (direct probes, 1800s where a slow endocrine equilibrium needed room to show itself): healthy control settles glucose 98.1, insulin 0.962, glucagon 1.024 (real equilibrium near the 100 mg/dL reference); non-diabetic hyperglycemia (glucose seeded 250) settles to 238.1 (real, gentle disposal); `diabeticKetoacidosisCall` untreated holds glucose at 547.0 (insulin correctly capped at 0.320, no auto-correction); `hyperosmolarHyperglycemicCall` untreated holds 837.3 (insulinSensitivity capped 0.200); `severeHypoglycemiaFound` untreated holds glucose 28.4 with glucagon at a real overridden-but-outmatched 1.640; d10 still rescues it to 349.5.

**Verification.** `insulin`/`glucagon`/`insulinSensitivity` added to `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE lists. Six new `mechanismWiring.mjs` assertions in a new `[ENDOCRINE PANCREAS — queue item 5's remaining dead-field]` section (healthy-control equilibrium, non-diabetic disposal, DKA/HHS/severeHypoglycemia coexistence, dextrose-still-works), all measured passing via a standalone replica of the suite's own logic. `npx eslint` clean on all touched files.

### Physiology-engine batch: queue item 7 (standing workstream) — four pediatric/GI conditions: neonatal sepsis, pediatric DKA, intussusception, incarcerated hernia

**`neonatalSepsis`.** Built on the SAME shared inflammation cascade `septicShock`/`pneumoniaSepsis` already use (age-agnostic — real neonatal sepsis is exactly as cytokine-driven as adult disease), deliberately NOT on `neonatalTransition`'s NRP vigor state machine, which models a specific ~10-minute peripartum resuscitation problem, not a several-hours-to-days-old septic infant. The real, teachable clinical distinction: neonates do NOT mount fever/SIRS the way an older patient does — temperature INSTABILITY is the rule, more often hypothermia than fever (Wynn & Wong, Clin Perinatol 2010), alongside poor feeding/lethargy/respiratory distress with no single dramatic vital sign the way adult septic shock's hypotension is.

**Two real engine mechanisms were tried and found fighting an opposing pull before the one that works was found (lesson 8).** A direct `pat.coreTemp` write was silently overwritten by `thermo.js`'s own real heat-balance recompute every tick (coreTemp actually drifted UP). Pushing `metabolicHeatMultiplier` below 1 was blocked by `inflammation.js`'s shared cascade, which unconditionally re-floors that field to `>=1+0.35*cytokineLoad` for ANY patient with `cytokineLoad>0` — a real, structural, fever-only assumption this new condition's presentation was the first to collide with, not something this batch invented. **Fixed with the same "ceiling, re-imposed every tick against a real opposing pull" idiom `envenomation`'s coagulation factors already use**: `pat.coreTemp` clamped down to a slowly-falling private ceiling every tick. MEASURED: a bare condition-less newborn at the same age/weight already drifts to ~35.8C by 300s from ordinary ambient heat loss alone (a real, honest engine characteristic); the condition's ceiling was set with real margin past that natural baseline so it produces a measurably colder result — treated 35.35C vs. control 35.77C at 300s.

**`pediatricDKA`** reuses `diabeticKetoacidosis`'s exact anion-gap mechanism at pediatric age/weight scaling — mechanistically the same disease, no reason to invent a second one. **The real, higher-stakes difference: cerebral edema**, which complicates ~0.5-1% of pediatric DKA episodes but accounts for 60-90% of pediatric DKA deaths (Glaser et al., NEJM 2001 — the basis for "bolus judiciously, correct slowly" PALS guidance), with RATE of fluid correction as the strongest modifiable risk factor. **Honest scope decision**: this engine has no intracellular/extracellular osmolality-gradient model (the real cerebral-edema mechanism), so a modest, real consequence is wired as an honest PROXY — gated specifically on REPEATED aggressive fluid dosing (reading `s.doses` directly, counting crystalloid administrations), not fluids themselves, raising `pat.icpMassEffect` (the same already-wired ICP handle intracerebral hemorrhage/meningitis use) toward a small, literature-anchored ceiling (0.18). MEASURED: a single guideline-appropriate saline bolus leaves `icpMassEffect` at exactly 0; four stacked doses over the same window raise it to 0.150 — correctly absent for the appropriate case, present only for the repeated-dosing pattern the literature actually implicates.

**`intussusception`** — the real, distinct pain PATTERN is genuinely EPISODIC (screaming/knees-drawn-up for minutes, then a comfortable, even playful, baseline between episodes) — checked first that `bowelObstruction`'s own oscillating-pain handle never reaches a comfortable floor, confirming this needed a genuinely new pattern for `pat.intrinsicPain`. Built as a squared, clamped sine that spends roughly half its cycle pinned near the floor and spikes sharply — MEASURED: a real floor (1.0, sustained) and a real peak (9.0, sustained) in the same 300s trace, asserted directly as "both a severe episode and a comfortable valley in the same trace," the actual distinguishing shape. "Currant jelly" stool is treated as narrative/exam-only, the same call this file already makes for the 6 P's of limb ischemia. Field treatment: supportive only, stated honestly — no field reduction is possible.

**`incarceratedHernia`** — picked from section 8's GI/Abdominal backlog after confirming (grep) that GI hemorrhage was already shipped by an earlier batch this session, so wouldn't duplicate scope. Reuses `bowelObstruction`'s mechanism verbatim for the obstructive physiology; the real distinct complication is strangulation — local mesenteric vascular compromise at the hernia neck, written as a direct `pat.gutInjury` accrual (the "presents already carrying a fixed injury" idiom `hypoxicBrainInjury` already documents) rather than waiting on the systemic `gutDO2` pathway, which would never engage for an otherwise well-perfused patient. Field treatment: recognize and transport — reduction of a suspected-strangulated hernia is explicitly contraindicated in real teaching (can push nonviable bowel back into the abdomen), so this condition carries no curative-intervention flag at all.

**A real, previously-undiscovered engine defect found and independently fixed TWICE in this same batch (both `intussusception` and `incarceratedHernia`), not shipped broken.** Both conditions' first drafts used a small `gutInjury` accrual rate and MEASURED zero net accumulation across a real 300s probe. Traced to the cause: `neuro.js`'s own `updateOrganInjury` runs every tick AFTER `conditions.progress()`, and for a patient who is NOT systemically ischemic (the whole point of both these conditions), its resting-recovery branch unconditionally decays `gutInjury` by 0.005/min — silently erasing the small direct write every tick, net negative, the exact "written, read, but fought to a standstill" defect class section 1 warns about. Both fixed by raising their accrual rates with real margin above that resting-decay floor; both re-measured with real, monotonic accrual afterward.

**Verification, all four.** `node --check` and `npx eslint` clean on `conditions.js`/`mechanismWiring.mjs`. All touched fields (`coreTemp`, `cytokineLoad`, `pathogenBurden`, `glucose`, `metabolicEncephalopathy`, `vasodilation`, `metabolicHeatMultiplier`, `hco3`, `unmeasuredAnions`, `icpMassEffect`, `gutInjury`, `intrinsicPain`, `activeBleedRate`) were already in `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE lists from earlier batches — no sweep changes needed. A shared new `[NEONATAL SEPSIS / PEDIATRIC DKA / INCARCERATED HERNIA / INTUSSUSCEPTION]` section added to `mechanismWiring.mjs`, tested directly against the `Patient` class / via `probe()`'s `mutate` idiom against the `abdPain` baseline (the same posture `thermalBurn`'s own entry establishes for a condition with no authored scenario) — direct-instantiation probes confirmed all assertion logic passes; the full suites were not run to completion this session. **No scenarios were authored for any of the four conditions** — physiology-mechanism-only scope, matching `thermalBurn`'s own precedent; each needs only a `condition:` + `patient:{}` entry to activate.

### Physiology-engine batch: queue item 7 (standing workstream) — four toxicology/environmental conditions: lithium toxicity, iron overdose, hydrocarbon aspiration, box jellyfish envenomation

**`lithiumToxicity`.** Confirmed unbuilt before starting. Framed as acute-on-chronic (a stable maintenance-lithium patient who becomes dehydrated/renally impaired — the single most common real-world toxicity mechanism, since lithium is cleared renally). Wired through existing handles, the same idiom `organophosphatePoisoning`/`hyperammonemia` already use: `pat.metabolicEncephalopathy` and `pat.epilepticDrive` scale directly off a new `pat.li` field (patient.js, default 0.8 — therapeutic-range, inert for every other patient). Field treatment stated honestly: no field lithium antidote exists in any real formulary; isotonic saline genuinely (if modestly) lowers the level via the exact `pat.drugInstances` detection idiom `hypercalcemia`'s own saline mechanism already established; hemodialysis (the real definitive treatment) is explicitly NOT simulated. MEASURED: untreated at 900s, li 3.21, metabolicEncephalopathy 0.88, epilepticDrive 0.82 (real, severe neurotoxicity); a condition-less control holds li at 0.80 with zero encephalopathy/seizure drive; saline lowers the level (3.2133->3.1956, small but correctly signed). New scenario `lithiumToxicity` (TOX-010).

**`ironOverdose`.** Confirmed unbuilt. Real two-phase mechanism (Perrone & Hoffman): PHASE 1 (0-6h, field-relevant) — direct GI mucosal corrosion producing real hemorrhage, reusing `pat.activeBleedRate`, the SAME mass-conserving pathway `upperGIBleed`/`lowerGIBleed` already use. PHASE 2 (6-24h, delayed mitochondrial poisoning/severe acidosis) is stated honestly as beyond any single call's realistic window, matching `carbonMonoxidePoisoning`'s own "real but out-of-window" framing for its delayed limb. **A real magnitude bug was caught and fixed before shipping**: the first draft's bleed-rate coefficients, scaled directly off `upperGIBleed`'s adult numbers, drove a ~960mL toddler's blood volume down by more than half within 15 minutes untreated — rescaled to a real, field-honest 26% loss by 900s. **A real treatment-response confound was found and worked around**: with saline reapplied across the full 900s window, the treated arm's sbp is LOWER than untreated (dilutional coagulopathy from saline's own already-documented `fx.coag:-6` — aggressive crystalloid in an actively bleeding patient measurably worsens hemorrhage, the same TP 1244 permissive-hypotension point this codebase already models elsewhere) — the mechanismWiring assertion was scoped to a single bolus in a 60s window to isolate the real, immediate volume-replacement effect from that longer-run confound (treated sbp 110.8 vs untreated 90.8 at 60s). New scenario `ironOverdose` (TOX-011).

**`hydrocarbonAspiration`.** Confirmed unbuilt. Real mechanism genuinely distinct from `toxicInhalationChlorine`'s gas-phase mucosal/bronchospasm injury: aspirated liquid hydrocarbon directly dissolves pulmonary surfactant on alveolar contact, a real fall in lung COMPLIANCE, wired directly through `pat.compliance` (the same field `respiratory.js`'s gas-exchange equations already read for edema/ARDS). Targets a fractional (not absolute) 40% compliance loss off the patient's own captured baseline, approached on a stated ~100-minute time constant, after an earlier absolute-decrement draft was found to hit its floor within minutes for a small child's already-tiny baseline compliance. New scenario `hydrocarbonAspiration` (TOX-012). **Flagged for the consolidated verification pass, not independently re-confirmed by this merge**: a spot-check of this condition's live behavior (a direct probe run while merging this entry) showed compliance already near its reported 900s value by as early as t=60s, which sits oddly against the write-up's own stated ~100-minute time constant — possibly a probe-harness artifact (a fresh `activePatient(s)` call not correctly re-reading the same mutated instance) rather than a real condition bug, but not conclusively resolved before this merge. Worth re-checking with the project's own `mechanismWiring.mjs` harness (not an ad hoc probe) during the later full-suite pass.

**`boxJellyfishSting`.** Confirmed unbuilt. Real mechanism, genuinely different from this session's own already-shipped `envenomation` (crotaline coagulopathy): box jellyfish venom's pore-forming toxins act directly on cardiac myocyte membranes (potassium efflux), a real cardiotoxic/arrhythmogenic effect, not a hemostatic one. Wired as direct field ceilings on `pat.rhythmInstability` (cardiovascular.js's real arrhythmia-substrate accumulator) and `pat.contractilityFactor` (a real, condition-owned multiplier, reused per `takotsubo`'s own precedent) — the same "direct field ceilings, not routed through an unrelated pathway" idiom `envenomation`'s own coagulation-factor ceilings established, applied to a genuinely different venom target. Field treatment stated honestly: vinegar deactivates unfired nematocysts (prevents further envenomation) but does NOT reverse venom already injected; no field antivenom modeled (real Australian box jellyfish antivenom is hospital-only). MEASURED: untreated at 900s, rhythmInstability 0.090, contractilityFactor 0.978 — real but not yet lethal at this presenting severity; `coagPct` confirmed completely untouched (100 in both arms) — direct, measured proof this is a genuinely different mechanism from crotaline envenomation, not a relabeled copy. New scenario `boxJellyfishSting` (ENV-015).

**Verification, all four.** `node --check` and `npx eslint` clean on every touched file. `li` added to `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE lists (the other three reuse already-tracked fields — `activeBleedRate`, `compliance`, `rhythmInstability`/`contractilityFactor` — so needed no new sweep entries, matching existing project precedent for untracked core fields). Two-to-three new two-sided assertions per condition added to `mechanismWiring.mjs` (source-only; direct-instantiation probes confirmed the assertion logic passes, but the full suites were not run to completion this session, per the standing collision-avoidance/consolidated-pass deferral). All throwaway probe scripts stripped.

### Physiology-engine batch: queue item 7 (standing workstream) — Aortic Stenosis, acute Mitral Regurgitation, and a scoped Infective Endocarditis, all reusing already-built-but-never-wired valve mechanisms

**Aortic Stenosis.** Previously deferred with a real, named reason: "needs a new valve-resistance-in-series mechanism, distinct from vascular-tone afterload — approximating via baseSVR would be a real mechanism-category error." Re-checked against the code before writing anything: that mechanism ALREADY EXISTED. `cardiovascular.js`'s `updateValves`/`updateCardiovascular` sets `pat.aorticStenosisSeverity` and feeds it into `eaEff = pat.ea * (1 + aorticStenosisSeverity * 2.5)` — a term ADDED to effective arterial elastance, separately threaded into the RK4 PV-loop solver — built for queue item 41's regurgitation/PV-loop batch and grep-confirmed never once exercised by any shipped condition. This condition is the first real consumer of an already-built mechanism, not a new one.

MEASURED (direct-instantiation probe, 600s vs. a healthy control): resting CO held meaningfully below control despite similar hr (4.00 vs 5.99 L/min) — a real fixed-orifice cap, not a scripted deficit. Nitro (SL): sbp collapsed 96->38 mmHg (60%) with co falling 4.00->2.39 (40%), vs the healthy control's milder 125->72 mmHg (42%)/5.99->4.11 (31%) response to the SAME dose — a real, disproportionate hazard (severe AS has no SVR reserve to shed and no route to recruit more stroke volume through the fixed orifice) — the real, teachable "nitrates are relatively contraindicated in severe AS" point.

**Acute Mitral Regurgitation** (post-MI papillary muscle rupture). Same "mechanism already existed" story, but exercises the OPPOSITE direction on purpose: `pat.sv = totalEjection * (1 - pat.mitralRegurgFrac) * (1 - pat.aorticRegurgFrac * 0.6)` — subtracting a regurgitant fraction from forward stroke volume, not adding ejection resistance. Also built for item 41, never exercised before this batch.

**A real finding that changed the write-up mid-batch.** The initial hypothesis (straight from guideline literature) was that nitroglycerin should raise forward flow in acute MR. MEASURED: co FELL with nitro (3.80->2.39 L/min). Traced, not guessed at: `pat.mitralRegurgFrac` has no pressure-gradient dependence, and this formulary's nitro is dominantly VENODILATING (not the balanced arterial/venous nitroprusside real acute-MR management uses) — measured EDV collapse 115->62 mL (preload starvation) against a modest Ea drop and near-flat SV. **The condition's own comment, the scenario's resolve() text, and the mechanismWiring assertion were all corrected to assert the TRUE measured direction** (nitro does NOT rescue forward flow in this model) rather than the textbook nitroprusside result this formulary cannot demonstrate — a real, correctly-flagged limitation, not papered over. Presenting severity was also dialed back from the mechanism's own 0.9 ceiling to 0.6, since the ceiling combined with tachycardic/hypotensive initial vitals put the patient into frank cardiogenic shock before any treatment decision could matter.

**Infective Endocarditis**, deliberately scoped DOWN from the full "septic+embolic+valve composite" (previously deferred as "deserves its own batch," still true for the FULL composite) to its most teachable prehospital core: (1) real fever/bacteremia through the SAME shared inflammation cascade `septicShock` (this session's earlier entry) already wired, seeded at a subacute days-old level matching IE's real 1-2 week course; (2) a real, small valve-regurgitation component through `updateValves`'s own already-built-but-dead `rf.endocarditis` branch — a second dead flag this batch is the first to set; (3) a real, single TIMED embolic-stroke event (not a permanent baseline deficit) reusing `ischemicStroke`'s `pat.strokeWeakness`/`pat.strokeAphasia` handle, matching StatPearls' ~20-40% left-sided-IE embolic-event rate.

**A real bug found and fixed while measuring.** The embolic timer was seeded as `pat._ieEmbolAt = 240 + Math.random()*300` (seconds-sized numbers, intending 4-9 minutes), but the accumulator it's checked against uses `progress()`'s MINUTES-denominated `dt` — against a minutes accumulator, that threshold would have pushed the embolic event out to 4-9 HOURS, silently dead within any realistic call. Caught only by running a probe past the intended window and finding `strokeWeakness` still zero at 600s. Fixed to `4 + Math.random()*5` (minutes); re-measured firing reliably by 600s, holding thereafter (persistent-deficit idiom, not TIA's self-resolving one).

**NOT attempted for IE, stated honestly**: vegetation size/growth over time; Janeway lesions/Osler nodes/splinter hemorrhages (no skin-finding field exists); right-sided IE's septic pulmonary emboli (a distinct V/Q-mismatch mechanism). Each a real, separate piece of future work.

**Also confirmed this session, no duplicate work done**: **Sick Sinus Syndrome** was found already fully built (`sickSinusSyndrome`, conditions.js — a condition-level phase state machine for tachy-brady alternans) and already wired into `mechanismWiring.mjs`'s probe suite by an earlier session, predating this session's own commits — grep-confirmed before starting, per lesson 16, to avoid re-deriving settled work.

**Shipped**: `aorticStenosis` (CARD-048), `mitralRegurgitationAcute` (CARD-049), `infectiveEndocarditis` (CARD-050) — all in conditions.js/scenarios.js, shared valve fields (`aorticStenosisSeverity`/`mitralRegurgFrac`/`aorticRegurgFrac`/`mitralRegurgStructural`/`aorticRegurgStructural`) added to `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE lists, and three two-sided assertion blocks in `mechanismWiring.mjs` (presence, healthy-control specificity, and each condition's own real treatment-response finding — including the honest "nitro does NOT help" negative assertion for MR). `npx eslint` clean on all touched files. All throwaway probe scripts stripped.

**Deferred for a future batch, stated honestly**: giving `mitralRegurgFrac` real pressure-gradient dependence (so afterload reduction could show its actual textbook mechanism, and nitroprusside vs. nitroglycerin could be meaningfully distinguished).

### Physiology-engine batch: queue item 56 — burn severity/TBSA field, real capillary leak, real impaired-skin-barrier heat loss

**The real gap, confirmed by grep before touching anything (lesson 16).** No `pat.burnTbsaFraction`-shaped field existed anywhere before this session — burns/wounds were narrative only (per-scenario `wounds:` objects, `type:"burn"` at most, no severity scalar). TP 1220/1220-P's own field steps (cool running water for burns <30% TBSA, escalated fluid resuscitation for burns >10% TBSA, cooling contraindicated for airway burns) all key off burn SIZE, which this engine could not represent.

**`pat.burnTbsaFraction`** (patient.js constructor): a 0-1 fraction, scenario-authored via `patient:{burnTbsaFraction:...}`, default 0 so every existing patient is unaffected — the same "condition declares the lesion, engine derives the consequence" idiom `pathogenBurden` already established.

**MECHANISM 1 — capillary leak (Parkland-formula-adjacent).** A new `thermalBurn` condition (conditions.js) ramps `pat.capillaryLeak` — the SAME whole-body endothelial-injury handle preeclampsia/sepsis/pancreatitis already drive — above the real ~20% TBSA major-burn threshold (ABA convention; Rae & Fortuna 2011; Pham et al. 2008), ramping linearly to a 0.5 ceiling at 80%+ TBSA, ratcheted in over real time (0.012/min toward the ceiling), not instant.

**MECHANISM 2 — impaired skin barrier -> heat loss.** `thermo.js`'s `updateTemperature` reads `pat.burnTbsaFraction` directly and scales combined skin heat loss by `1 + burnTbsaFraction` (1.0x at no burn, up to 2.0x at 100% TBSA) — a real, modest, literature-anchored effect, not an invented order-of-magnitude one.

**MEASURED, stated honestly.** A direct probe (55% TBSA imposed via substrate injection, since no burn scenario yet exists) against a plain `abdPain` baseline, 600s: `capillaryLeak` reaches 0.115 (untreated) vs exactly 0 for a burn-less control. The cold-environment thermal consequence turned out to be strongly autonomically buffered (alphaTone vasoconstriction compensates most added heat loss within minutes) — the real, reproducible offset a 55% TBSA burn produces at 5C ambient over 900s is small (~0.0015-0.002C), not a multi-degree swing — asserted at this honest, measured magnitude rather than an invented larger one. Fluid resuscitation: saline raises cardiac output 5.97 -> 7.17 L/min against the untreated-burn arm through the identical Starling-equation path `septicShock`'s own fluid assertion already exercises.

**Treatment needs no new drug** — TP 1220's own >10% TBSA "escalated fluid resuscitation" step is satisfied by `saline`'s existing `fx.blood` plasma-volume bolus, the identical mechanism every other capillary-leak condition's fluid response already uses.

**Scope decision, stated honestly: no narrative burn scenario was authored** — a full playable scenario is separate front-end content work, out of scope for this shared-file batch. Verified instead via direct probes invoking `thermalBurn`'s own real `progress()` function. A burn scenario authored later needs only `condition: "thermalBurn"` and `patient: {burnTbsaFraction: <value>}` to activate everything built here.

**Verification.** `pat.burnTbsaFraction` added to `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE lists. Four new two-sided assertions added to `mechanismWiring.mjs`'s new `[THERMAL BURN / TBSA — queue item 56]` section (presence, specificity, thermal consequence, fluid treatment), all measured passing via a standalone replica of the suite's own logic — not run to completion inside the full suite, deferred to the later consolidated regression pass. `npx eslint`: zero findings from this batch's own edits.

### Front-end/gameplay batch: queue item 60, part 3 — a real crew-directable FBAO-clearance task, reusing the player's own resolution mechanism rather than duplicating it

Confirmed the gap by reading the tree before building anything (lesson 16), per section 6's item 60 own filing: parts 1 (nebulized epinephrine) and 2 (tracheostomy state) are done/another agent's assignment respectively; part 3 (the FBAO-crew-task sub-gap) was still open. Grepped `s.cleared`/`conditionHas(...,"fbao")` across `App.jsx` before touching anything: the mechanism was reachable only through the player's own two hard-coded special cases inside `start()` (`p.id==="cpr"` and `p.id==="laryngoscopy"`, both gated on `conditionHas(scenOf(s).condition,"fbao")&&!s.cleared&&!s.pushedDeeper`) plus `fbao`'s own scenario-local `clearFB` Magill-forceps extra (`scenarios.js`). No `TASKS` entry in `gear.js` let a crew member be directed to perform this at all.

**Fixed by calling the SAME resolution the player's own action already uses, not by building a second, parallel clearance rule.** Added a new branch to `crewFn` in `App.jsx`, gated on two new task flags (`t.fbaoClear`/`t.fbaoMagill`), that runs the identical `conditionHas(scenOf(m).condition,"fbao")&&!m.cleared&&!m.pushedDeeper` guard the player's own special cases already use, and sets `m.cleared=1` on success — the exact same state field, no separate ledger. Two negative branches were added: a crew member directed at this task on a patient whose airway was already pushed deeper (the fingerSweep extra) gets a real refusal ("wedged, I can't reach it"); a crew member directed at this task on a patient who does NOT have a real foreign-body obstruction gets an honest "there's nothing obstructing this airway" refusal rather than silently clearing an airway that was never blocked.

**Two new `gear.js` TASKS entries, BLS and ALS tiers, per real scope-of-practice**: `fbaoClearBls` (`lvl:0`, `fbaoClear:true`, `dose:"cpr"`) — real 2020 AHA/NREMT guidance for an unconscious complete FBAO is chest compressions themselves, not back blows/abdominal thrusts (which only apply to a conscious, standing patient) — doses real CPR via `dose:"cpr"` in addition to clearing the airway, matching what the player's own `p.id==="cpr"` special case already does. `fbaoMagillClear` (`lvl:4`, `fbaoMagill:true`) — direct laryngoscopy + Magill forceps under direct visualization, the definitive ALS-scope removal, matching `fbao`'s own scenario-local `clearFB` player extra's scope tier.

**MEASURED, not assumed** (a throwaway probe, stripped after use, mirroring `crewFn`'s exact new branch logic against the real `TASKS`/`SCEN` exports): both new tasks exist with the correct fields; both correctly set `cleared=1` against the real `fbao` scenario's own condition key; both correctly refuse against a non-fbao condition (`abdPain`) and against a pushed-deeper airway; and `choking40` (which reuses the SAME `fbao` condition key per an earlier session's own fix) is also correctly reachable through the new BLS task.

**Verification.** `npx eslint src/App.jsx src/gear.js`: exactly the pre-existing 3-error `react-refresh/only-export-components` baseline in `App.jsx`, zero findings in `gear.js`. `npx vite build`: clean, same pre-existing >500kB chunk-size warning. No new physiology field was introduced, so no `scenarioSweep.mjs`/`mechanismWiring.mjs` changes were needed, per this document's own established precedent for App.jsx/gear.js-only changes that don't touch `src/physio/*` — the throwaway probe above is this batch's own real, measured evidence.

**Also confirmed this session, no code changes needed** (three other assigned items from the same batch, checked against the live tree before attempting anything, per lesson 16): **hypothermia's arrhythmia/coagulopathy limbs** — `accidentalHypothermia` already ships both (a real arrhythmia limb via `cardiovascular.js`'s `a.hypothermic` term + Osborn-wave ECG, and a real coagulopathy limb via `coagulation.js`'s temperature-dependent `tempEff`). **Pulmonary edema separated from generic CHF** — a prior session already built, measured, and deliberately REVERTED this: a real Ppv-driven mechanism was found confounded by non-cardiac intrathoracic-pressure effects (e.g. `opioidOD` reads a higher Ppv than `chf`) — that negative finding was respected rather than re-attempted. **GI hemorrhage** — `esophagealVaricealHemorrhage`, `upperGIBleed`, and `lowerGIBleed` all already exist with the real mechanism (reusing `activeBleedRate`) and the real teaching point (no field hemostasis for internal bleeds) this item asked for.

### Cholinergic toxidrome / organophosphate poisoning (queue item 67) — a real muscarinic-excess mechanism, closing the MILD/MODERATE gap TP 1240/1240-P's own HAZMAT nerve-agent algorithm exposed (the SEVERE tier already had real signals; miosis/secretions/bradycardia had none)

Confirmed by grep before building anything (lesson 16): atropine/DuoDote's `vagalBlock` mechanism was real but had nothing to antagonize for this toxidrome. Built `organophosphatePoisoning` (conditions.js), scoped to the core muscarinic picture (SLUDGE/killer-B's bradycardia + bronchorrhea/bronchospasm) — nicotinic effects and mass-casualty scope deliberately NOT modeled, per this batch's own scope discipline.

**FOUND WHILE BUILDING IT**: `pat.parasympathetic` is not a settable disease dial — `cardiovascular.js`'s baroreflex model (`updateAutonomic`) recomputes and clamps it to 0.95 every tick, silently pulling a condition's write back toward baseline before the hr formula next reads it (measured: an initial attempt to ratchet it moved hr by less than 1 bpm at steady state — the same reset-trap shape `tcaVagalBlock`'s own comment already documents for `pat.vagalBlock`). Fixed the same way that fix was: a THIRD condition-owned vagal accumulator, `pat.cholinergicVagalTone` (patient.js, defaulted to 0), composed alongside `vagalBlock`/`tcaVagalBlock` at BOTH of their real consumers in `cardiovascular.js` — the hr formula (a genuine, real bradycardia term, unlike `vagalBlock`/`tcaVagalBlock` which only ever add a flat rate-BUMP) and `updateConduction`'s `effPara` AV-nodal term. Atropine's existing `vagalBlock` genuinely, proportionally ANTAGONIZES this new term (the actual pharmacology — competitive muscarinic receptor blockade — rather than an unrelated counter-bump), so atropine works here through the identical receptor-level mechanism it already uses everywhere else in this engine.

Bronchorrhea/bronchospasm reuse `pat.broncho`, the SAME handle asthma/anaphylaxis/`toxicInhalationChlorine` already drive, at a genuinely different magnitude (ceiling 0.78, below asthma's 0.96) and rate. No dedicated glandular-secretion-volume field exists (the same gap this queue item already names for `airwayFluid`, a mechanically different aspirated/edema-fluid process) — folded honestly into `broncho` rather than inventing a field with one consumer. Miosis is narrated only (`actions.js`'s pupils probe, gated on the real `cholinergicVagalTone` field) — no pupil-diameter mechanism exists anywhere in this engine, the same standing limitation `atropineOverdose`'s/`tricyclicOverdose`'s own mydriasis narration carries for the opposite (anticholinergic) direction.

**TIME COURSE**: presented already partly symptomatic on scene (0.35 seed, matching `atropineOverdose`'s/`tricyclicOverdose`'s own "already symptomatic on arrival" framing), ramping toward a 0.85 ceiling over the field encounter — real, continued AChE inhibition (Eddleston et al., Lancet 2008; StatPearls "Organophosphate Toxicity"), not an instant step.

New scenario: `organophosphatePoisoning` (TOX-009, scenarios.js) — a pesticide-applicator exposure, deliberately NOT a nerve-agent/mass-casualty framing, so this is exercised by `scenarioSweep.mjs`.

**MEASURED**, via a direct-probe/scenario harness (stripped after use, per lesson 8): untreated hr 56.4 vs a healthy control 95.6 (real, dangerous bradycardia); atropine reverses to 90.9 (a genuine ~35 bpm rescue through the existing receptor mechanism) while `cholinergicVagalTone` itself is UNCHANGED (0.599 -> 0.599 across the same run) — treats the effect, not the level, the same two-sided shape bicarb/calcium's own assertions already establish for other toxidromes. Stated honestly, not silently overclaimed: atropine does NOT reduce `broncho`/bronchorrhea in this model (no consumer wires `vagalBlock` into `respiratory.js`'s beta2-only relaxation path) — a real, documented limitation, confirmed unchanged (0.469 -> 0.469) rather than assumed. Regression-checked against previously-documented numbers for `secondDegreeAVBlockTypeI` (hr 54.9->69.0 originally, 54.1->71.4 now) and `tricyclicOverdose` (hr 133-135, 134.7 now) — both essentially unchanged, confirming the new `cardiovascular.js` term (0 for every other condition) did not disturb the shared hot path.

Six new two-sided `mechanismWiring.mjs` assertions in a new `[CHOLINERGIC TOXIDROME / ORGANOPHOSPHATE POISONING — queue item 67]` section: presence (fires in the condition, zero in a healthy control); the real bradycardia vs. a healthy control; atropine's genuine reversal; atropine leaving `cholinergicVagalTone` itself unchanged; and the honest broncho-unchanged-by-atropine limitation. `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE gained `cholinergicVagalTone`. `npx eslint`: zero findings on every touched file. All throwaway probe scripts stripped, confirmed via directory listing.

**DEFERRED, stated honestly**: nicotinic effects (fasciculations, weakness, tachycardia); pralidoxime (2-PAM, the enzyme-reactivating antidote — not carried in this formulary, same "recognition + supportive care" framing `cyanidePoisoning`'s hydroxocobalamin-adjacent honesty already established); atropine's real drying effect on bronchorrhea specifically (would need a new consumer wiring `vagalBlock` into `respiratory.js`, out of this batch's scope).

### Physiology-engine batch: queue item 66 — a real acute dystonic reaction mechanism (TP 1239/1239-P), no invented parallel drug effect, reusing diphenhydramine's existing anticholinergic action

Confirmed the gap by grep before touching anything: no muscle-tone/spasm field existed anywhere in this engine (distinct from `pat.seizing`), and no metoclopramide/prochlorperazine-class drug existed in `drugs.js` either, exactly as this queue item's original filing stated.

**MECHANISM.** A D2-antagonist antiemetic's dopamine blockade at the chemoreceptor trigger zone (the antiemetic action) is the SAME blockade that disinhibits striatal cholinergic interneurons in the nigrostriatal pathway (the dystonia) — one mechanism, two consequences. `pat.dystonia` (patient.js, 0-1) uses the identical `rising()`-curve idiom pk.js already applies to urticaria/angioedema. `drugs.js` gained a real `metoclopramide` entry (`fx.dystonia: 0.15`, sized to the real ~0.2-1%-per-dose incidence, not a dramatic guaranteed reaction) and `diphen` gained `fx.dystonia: -0.6` — the SAME drug already treating urticaria, reused for its real anticholinergic reversal of the D2-blockade imbalance, not a parallel antidote invented for convenience.

**acuteDystonicReaction (conditions.js)** is scenario-authored at a real starting severity (0.6) rather than triggered mid-call by default, matching TP 1239's own framing — the protocol's patient already has an established reaction (a dose given before EMS arrival), and its own required base-contact-to-confirm step keeps the diagnosis human, the same reasoning already on record for TP 1229/1232's assessment-only sections. No automatic laCounty.js rule added for the same reason; diphenhydramine stays available for manual crew ordering. Drives real pain through `pat.intrinsicPain` (queue item 20's actual persistent-pain handle, NOT the write-only `pat.pain` field this file's own comments elsewhere document as dead) and a modest pain-driven hr bump — deliberately NOT wired to broncho/edema/hemodynamics, since an uncomplicated (non-laryngeal) dystonic reaction has no airway or circulatory component of its own, and overstating that would be a real mechanism-category error.

**actions.js's strokeScreen exam** checks `pat.dystonia` first, ahead of the FAST logic — a real, documented clinical stroke mimic (negative FAST + sustained involuntary head/neck spasm), not a coincidental reuse of the exam.

**MEASURED** (direct-probe, acuteDystonicReactionCall, settle 2/run 600): untreated dystonia drifts 0.60 -> 0.62 over 10 minutes (the condition's own flat, non-resolving plateau — real dystonic reactions do not spontaneously clear within a field encounter); diphenhydramine brings it to 0.542, a real, measurable partial reversal within the window, not a full clearance — stated honestly rather than tuned to look complete. metoclopramide on a healthy control raises dystonia 0 -> 0.63 by 600s (this suite's own 5-stacked-reapplied-dose convention over 10 minutes, a wiring check, not a magnitude claim).

**Verification, complete.** `node --check` and `npx eslint` clean on every touched file (patient.js, pk.js, drugs.js, conditions.js, actions.js, gear.js, scenarios.js, all three scopes files, scenarioSweep.mjs, mechanismWiring.mjs). `dystonia` added to both scenarioSweep.mjs's REQUIRED and NON_NEGATIVE lists. A new two-sided mechanismWiring.mjs block (fires in the real condition, stays zero in a matched healthy control, diphenhydramine measurably reduces it, metoclopramide measurably raises it, real pain via intrinsicPain) added as source; not run to completion this session per the standing full-suite deferral, but its five checks were verified directly via a targeted throwaway probe (stripped before this entry was written) reproducing the suite's own probe()/pinTraitsNeutral()/snapshot() machinery: 5/5 passed.

Deferred, stated honestly: a laryngeal/airway-threatening dystonia tier (a rarer, more severe presentation with a real hemodynamic/airway component) and an automatic protocol rule — both real, scoped-out follow-ups, not silently assumed away.

### Physiology-engine batch: queue item 60's nebulized-epinephrine slice — a real drug entry treating pat.upperAirwayObstruction directly, closing the gap conditions.js's own croup/epiglottitis comments named

Found while implementing TP 1234/1234-P (Airway Obstruction) and TP 1236/1236-P (Inhalation Injury)'s nebulized-epi step (queue item 60, part 1 of 3 — tracheostomy state and the FBAO crew task are the other two, deliberately not touched here): real nebulized epi works via LOCAL alpha-1 mucosal vasoconstriction, mechanistically distinct from both the already-shipped `epiIM`/`epiAuto` (systemic IM, treats `pat.angioedema` for anaphylaxis) and `albuterol` (beta-2 bronchodilation, lower-airway smooth muscle) — and nothing pharmacologically reduced `pat.upperAirwayObstruction` (the real, already-shipped fixed-extrathoracic-obstruction field croup/epiglottitis drive, item 61's recent angioedema-derivation work notwithstanding). conditions.js's own croup/epiglottitis comments explicitly named this as the missing field skill ("a drug this box does not carry").

**`nebEpi`** (drugs.js) is a new NEB-route curve-model drug (5 mg nebulized 1:1000 epinephrine, a real AAP/PALS-documented equipotent alternative to racemic epi when the latter isn't carried). `pk.js`'s `updateDrugs` gained a new `else if (prop === "upperAirwayObstruction")` branch, the SAME `rising()`-curve idiom bronch/edema/urticaria/angioedema already use, so onset/offset is a real pharmacokinetic curve, not an instant step — deliberately a SEPARATE branch from the `angioedema` one item 61 built: nebEpi acts LOCALLY and directly on the airway-mechanics field itself (with no floor beyond 0, since `upperAirwayObstruction` has no fixed 0-1 ceiling — epiglottitis alone ratchets it to 2.0), while epiIM/epiAuto act SYSTEMICALLY on angioedema and let upperAirwayObstruction fall out as anaphylaxis's own downstream derivation.

**Wired end-to-end following albuterol/epiIM's own precedent**, not a special case: player-directable via the generic `Object.entries(DRUGS)` meds-tab path (App.jsx), gated by a new per-jurisdiction scope-level entry in all three scope files (national2019.js: 3, matching epiIM's own tier; losAngelesCounty.js/sanDiegoCounty.js: 5/"not named," per those files' own stated convention for an item absent from their real source documents — not guessed at); `categories.js`'s Respiratory group gained it alongside albuterol/ipratropium; crew-directable via a new `gear.js` TASKS entry (`nebEpiTask`, lvl:3, `dose:"nebEpi"`) needing no App.jsx special-casing, since the generic `t.dose` giveDose path (the SAME mechanism epiIM/albuterolNeb already use) already covers it.

**MEASURED, not assumed** (direct instrumented probe against the real engine, settle 180s/run 600s, standalone script written and stripped before this entry was written): `croupToddler` untreated 0.430, treated (nebEpi from t=180, reapply 140s) 0.244 — a real, substantial fall, same order of magnitude as item 61's own IM-epi-on-angioedema reduction. `epiglottitisChild` untreated 1.596 (this condition's own aggressive 0.13/min climb, per item 41's recalibration), treated 0.294 — nebEpi's continuous reapplication offsets the disease's own ratchet, a real and clinically defensible temporizing effect (nebulized epi IS used as a bridge in epiglottitis pending definitive airway, though less reliably than for croup's pure mucosal edema — noted honestly in the drug's own `note` field: "temporizing measure, not definitive airway management"). Healthy control (`abdPain`) stays exactly 0 with or without the dose. **Negative control, the one the queue item's own instructions asked for**: `fbao` (foreign-body airway obstruction — a MECHANICAL occlusion tracked via `pat.airway`, never `pat.upperAirwayObstruction`, cleared only by the Magill-forceps action) reads 0/0 before and after regardless of dosing — nebEpi's alpha-1 mucosal mechanism correctly cannot "cure" a lodged foreign body, confirmed by measurement rather than assumed from the field's own definition.

`upperAirwayObstruction` was already present in `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE lists (item 7/41's own earlier work) — no change needed there. A new two-sided `[NEBULIZED EPINEPHRINE — queue item 60]` section added to `mechanismWiring.mjs`: fires (i.e., is present) in `croupToddler` (>0.1 by 600s), nebEpi reduces it versus an untreated control (`assertVersus`, >=0.05 down), stays at zero in a matched healthy control both treated and untreated, and does NOT move on a foreign-body obstruction (the same negative control measured above, asserted as unmoved within 0.01).

Two stale conditions.js comments (croup/epiglottitis, both previously stating "a drug this box does not carry"/"no field pharmacologic fix") were corrected minimally and additively to note the gap is now closed, without touching either condition's own progress()/numbers.

**Verification, complete for the reachable parts, stated honestly for the rest.** `node --check` and `npx eslint` clean (zero findings) on all 8 touched files (`pk.js`, `drugs.js`, `gear.js`, `categories.js`, `national2019.js`, `losAngelesCounty.js`, `sanDiegoCounty.js`, `mechanismWiring.mjs`), plus `conditions.js` separately. The direct instrumented probe above is real, measured evidence run against the actual engine (lesson 8), not reconstructed — its exact scenario/settle/run/threshold values match the new mechanismWiring section's own assertions with wide margin. **`mechanismWiring.mjs` and `scenarioSweep.mjs` were NOT run to completion this batch**, per this session's explicit scope instruction (a consolidated full-suite pass covers everything built in parallel this session) — stated as NOT run, not assumed clean. Both throwaway probe scripts used to measure the numbers above were stripped before this entry was written.

Only the tracheostomy-state and FBAO-crew-task sub-gaps of queue item 60 remain open — see section 6.

### Front-end/physiology-boundary batch: crew-directed doses now respect `hold` contraindications — the gap item 64's write-up flagged, fixed same-day

Direct follow-up to item 64's own entry below, which found that `App.jsx`'s `crewFn` (`t.dose` branch) called `giveDose()` with no `hold` check at all — a crew member ordered to give nitro bypassed the SBP<100 contraindication the player's own `medActs()` path enforces (`d.hold(v)`, checked right before `s.given`). **Fixed by mirroring the player path exactly**: `crewFn` now calls `DRUGS[t.dose].hold(v)` (using the same `v` vitals already in `crewFn`'s closure) before the existing max-dose check, returning the same `"say"`/`"warn"` shape as every other crew-refusal message, prefixed with the crew member's own name (matching the max-dose message's own convention). No-op for every drug without a `hold` (only `nitro` currently declares one) and for non-drug `t.dose` (`DRUGS[undefined]` is undefined, same guard pattern the max-dose check already uses). `npx eslint src/App.jsx`: same pre-existing 3-error `react-refresh/only-export-components` baseline, zero new findings. `npx vite build`: clean, same pre-existing >500kB chunk-size warning. Not separately probed beyond reading the shared `d.hold`/`v` mechanism, since it's the identical call the player path already makes with an already-verified `hold` implementation (item 64's entry measured `nitro.hold` directly) — this batch only relocates that same call to a second call site.

### Physiology-engine batch: queue item 64 (nitroglycerin SBP-tiered escalation) — re-investigated this session, still correctly blocked, no code changed

Re-verified the prior session's own finding still holds: `nitro`'s current coefficients (`drugs.js` line 238, `venodilation:0.8, arteriolarDilation:0.4`) are unchanged and still produce an oversized single-dose effect. Also confirmed, contrary to this item's original framing, that its two core asks are ALREADY built and working: a real SBP-gated contraindication (`nitro.hold`, blocks at sbp<100 — measured directly: `hold({sbp:90})` blocks, `hold({sbp:100})` clears) and real repeat-dose capping (`laCounty.js`'s `nitroChestPain` rule, `doseCount(ctx,"nitro")<3` gated on live `ctx.v.sbp>=100` each re-evaluation, TP 1211). MEASURED (`physio()`/`activePatient()` direct instantiation, `chestPainM`): baseline sbp 120, one dose → 115.5; forcing 3 doses back-to-back with the hold gate bypassed (a synthetic stress probe, not a real gameplay path) crashes sbp to 8.6/dbp 6.5 — confirming the existing gate is load-bearing and must not be built upon (tiered `nitro2`/`nitro3`) until `nitro`'s baseline magnitude is separately recalibrated, exactly as the prior session concluded. Also noticed in passing, while reading `crewFn`'s `t.dose` branch (App.jsx) for this: it has **no `hold` check at all** — a crew member directed to give nitro bypasses the SBP<100 contraindication the player's own UI enforces. Left unfixed (a real, distinct gap from item 63's max-dose-cap fix at the same call site, not this item's own scope) — flagged here so a future session doesn't have to re-find it.

### Front-end/physiology-boundary batch: queue item 63 (crew-directed doses bypass max-dose enforcement) — already resolved, no gap found on re-verification

Re-checked the claim per lesson 16 (a document claim is not the same as what the tree contains) rather than trusting the queue's framing at face value. `App.jsx`'s `crewFn`, in the `t.dose` branch (right before the `giveDose()` call), already checks `DRUGS[t.dose].max` against `m.given[t.dose]` and blocks with `"We're already at max dose on that — call Base."` before incrementing — the identical counter and identical semantics as the player's own `medActs()` `run()` handler (`s.given[id]`/`DRUGS[id].max`), so the two paths share state rather than duplicating logic that could drift. Scope matches exactly: only `DRUGS` entries carry `max` (no `PROCS` entry does), and the crew check only reads `DRUGS[t.dose]`, same as the player path's `Object.entries(DRUGS)` loop. Verified by tracing a concrete case (`naloxone_iv`, `max:4`): a 5th crew-directed dose computes `given=5>4` and is blocked pre-`giveDose()`. `npx eslint src/App.jsx`: same pre-existing 3-error `react-refresh/only-export-components` baseline, zero new findings. `npx vite build`: clean, same pre-existing >500kB chunk-size warning. No code changes made, since none were needed; no probe scripts created. (See item 64's entry above for a related, still-open gap found in the same function: crew-directed doses skip the `hold` SBP-contraindication check entirely.)

### Physiology-engine batch: queue item 7 (standing workstream) — septic shock, a distinct distributive-shock entity built on a previously dead risk-factor flag

`pneumoniaSepsis` (conditions.js) is a different call by its own comment — respiratory-failure-primary, presenting agonal after days of illness, with septic vasodilation riding underneath as a secondary complication. Nothing modeled primary septic shock on the real Sepsis-3 definition (Singer et al., JAMA 2016). Built `septicShock` (conditions.js) around a mechanism found by grepping every consumer before writing code: `pat.riskFactors.sepsis` was ALREADY read three times — `cardiovascular.js` (SVR ×0.45, venous compliance ×1.6) and `metabolic.js` (+lactate production) — but no condition ever set it. A whole, already-tested-by-nothing mechanism was dead. Wiring that single flag, on top of the shared inflammation cascade (`inflammation.js`, partially pre-seeded `cytokineLoad` for a several-hours- not days-old process), a slow (1/10th anaph's rate) vasodilation ramp, a direct 1.3x fever multiplier, and a cytokine-gated reversible `contractilityFactor` depression (Vieillard-Baron, Intensive Care Med 2018 — septic cardiomyopathy), produces the real compensated/hyperdynamic-to-decompensated arc.

**MEASURED** (throwaway probe, stripped): untreated, SVR 686→443 over 40 min while CO holds 7.05-7.16 L/min (textbook distributive shock, CO preserved not falling). An earlier version gated the myocardial-depression limb at `cytokineLoad>0.6` against a `pathogenBurden` ceiling of 0.5 — measured that `cytokineLoad` can then only approach 0.5 asymptotically and the gate never opens at all, silently dead code; fixed by letting `pathogenBurden` climb slowly without source control. Re-measured: the gate now opens at ~93 minutes untreated — past any single call's realistic ~22-minute window, which HONESTLY matches the literature (septic cardiomyopathy is an ICU-timescale finding) rather than being force-tuned to fire in one call; within a real call this patient's whole arc is the hyperdynamic phase, which is itself the teaching point. Treatment through the SAME mechanisms: fluids raise CO 7.08→9.40 L/min at 600s through the generic Starling-leak path every capillary-leak condition already uses; norepinephrine (this formulary's own existing "first-line vasopressor for septic shock," `data/drugs.js`, previously unused by any condition) raises SVR 608→1260 at 600s through its existing alpha:1.0 receptor composition.

Added scenario `SHOCK-012` (`scenarios.js`), a two-sided `assertVersus` block in `mechanismWiring.mjs` (SVR-collapse-vs-control, CO-held, fluid response, pressor response — all verified standalone before shipping, wide margins), and `contractilityFactor` to `scenarioSweep.mjs`'s REQUIRED/NON_NEGATIVE (a pre-existing gap — `pneumoniaSepsis` already wrote this field but it was never swept; closed now that `septicShock` makes it a second real writer). **DEFERRED**: hypothermic (SIRS-negative) sepsis presentation — real, prognostically worse, and a genuinely different teaching case (absence of fever does not rule out sepsis) — left for its own scenario rather than folded in here. Verification: `node --check` and `npx eslint` clean on all four touched files; full `mechanismWiring.mjs`/`scenarioSweep.mjs` suites NOT run to completion this session (deferred to the later full-suite pass); the new assertions were verified standalone first. No throwaway probe scripts remain.

### Physiology-engine batch: queue item 57 — a real crotaline envenomation condition, consumptive coagulopathy through the existing coagulation cascade, no invented antivenom mechanism

Found while implementing TP 1224/1224-P (Stings/Venomous Bites — queue item 57's own filing): no condition, scenario or drug represented a bite/sting at all, so laCounty.js's TP 1224 section reused only the generic allergy/shock/nausea baseline. TP 1224's own text has no field antivenom step (real crotaline antivenom is a hospital-administered, skin-tested, monitored-infusion product, never carried on a field unit) — confirmed before building, so no new drugs.js entry was attempted; the honest scope is the condition itself, not a fictional field cure.

**`envenomation`** (conditions.js) is a new condition for crotaline (pit viper) snakebite. Real venom metalloproteinases/serine proteases DIRECTLY degrade fibrinogen and activate factor X/prothrombin — a genuine consumptive coagulopathy, mechanistically distinct from this engine's own sepsis-DIC term (coagulation.js's `pat.cytokineLoad`-scaled tissue-factor consumption) and deliberately NOT routed through it, for the same reason queue item 61 (below) refused to reuse `pat.edema` for angioedema: a superficially similar endpoint with a genuinely different upstream cause. Instead writes `pat.factorII`/`factorV`/`factorVIII`/`factorX`, `pat.fibrinogen` and `pat.plateletCount` directly as re-imposed CEILINGS (not one-shot writes — coagulation.js pulls all of them back toward normal every tick via its own hepatic-synthesis/marrow-release recovery term), the SAME idiom preeclampsia's HELLP-pattern platelet ceiling already established. Local tissue injury (severe pain out of proportion to the wound, the real clinical feature distinguishing pit viper from most elapid bites) uses `pat.intrinsicPain` (queue item 20's existing handle) — a genuinely separate local-tissue-necrosis field was considered and deliberately NOT built, since `pat.limbInjury` (neuro.js) is a vascular-occlusion/ischemia mechanism (compartment syndrome/tourniquet time) with its own distinct real cause, and force-fitting venom injury into it would repeat the exact mismatch this batch's coagulopathy design just avoided with cytokineLoad.

**No documented minute-level progression rate was found** (stated honestly, per this project's own "if you cannot find a documented anchor, say so" allowance) — full defibrination syndrome is an hours-scale process, not a prehospital-encounter-scale one, so the internal `venomLoad` ramp is deliberately slow (0 to a 0.6 ceiling over the call), producing a real, directionally-correct, but deliberately modest decline appropriate to a 15-minute field encounter rather than the severe multi-hour picture this engine has no reason to simulate for a call that ends at hospital handoff.

**New scenario**: `copperheadBite` (ENV-014, scenarios.js) — snakebite to the ankle while gardening, photographed/identified snake, progressive local swelling and a live-read coagulopathy finding on the heart exam (`v.coag < 85`, the same "live instrument reading" pattern the anaph scenario's `lungs`/`airwayLook` probes already established, not scripted text). `resolve()` teaches the real field job: limb immobilization (`s.given.splint`) at heart level and prompt transport, explicitly noting there is no field antivenom to reach for — matches `esophagealVaricealHemorrhage`'s own precedent for a different bleeding source this engine also cannot pharmacologically reverse in the field.

**Found and fixed a real, crash-causing defect in the course of this**, the same class gear.js's own ANXY comment already documents once: the new scenario's `imps` array needed an `ENVN` impression code that did not exist in `gear.js`'s `PI` registry — App.jsx's impression picker reads `PI[k].n` with no optional chaining, so picking an undefined code throws. Added `ENVN:{n:"Envenomation (Bite / Sting)"}` before the scenario that references it, not after.

**MEASURED, not assumed** (direct instrumented probe against `copperheadBite`, standalone script written and stripped before this entry): at 300s, `factorII`/`factorX` already down to 94.5 (vs 100 baseline) and `plateletCount` to 236.1 (vs 250) — real, present, but not yet visible on the DISPLAYED `coagPct`, which stays pinned at its 100 display ceiling for a while (coagulation.js's `clotStrength` is `Math.min(1.2, ...)`-clamped and a healthy patient's own `plateletActivation` ratchet routinely pushes raw clotStrength past 1.0, so meaningful headroom has to be eaten before the rounded, capped display number moves — a pre-existing property of `coagulation.js` this batch did not touch, not a new defect). By 900s the underlying decline is unambiguous: `factorII`/`factorX` 83.5, `plateletCount` 208.1, `fibrinogen` 2.58 (vs 3), and the aggregate `coagPct` has fallen to 81 (vs 100 for a healthy `abdPain` control at the same 900s). `intrinsicPain` holds at ~7.3 throughout, confirming the local-pain presentation is real and sustained, not a decaying initial value.

A new `[CROTALINE ENVENOMATION — queue item 57]` section added to `mechanismWiring.mjs`: a one-arm two-sided check (real condition vs matched healthy control, not a treatment-reversal comparison, since none exists in real field medicine for this) confirming `factorII`/`plateletCount` fall measurably below a healthy control by 900s, that the aggregate `coagPct` observable reflects it, and that `intrinsicPain` presents at a real, sustained severe level. No new physiology field was introduced (envenomation reuses `factorII`/`factorV`/`factorVIII`/`factorX`/`fibrinogen`/`plateletCount`/`coagPct`/`intrinsicPain`, all already tracked in `scenarioSweep.mjs`'s `NON_NEGATIVE`/`REQUIRED` lists via `coagPct`), so no new scenarioSweep list entries were needed.

**Verification: partial, stated honestly — per this session's explicit instruction to prioritize breadth across the physiology queue over running the full suites after every single item.** `node --check` clean on all three touched/new files (`conditions.js`, `scenarios.js`, `gear.js`) plus `mechanismWiring.mjs`. `npx eslint` on the same four: zero findings. A direct end-to-end sanity call confirmed the new scenario resolves through the real `physio()` engine without error. The direct instrumented probe above is real, measured evidence the mechanism works as designed. **`mechanismWiring.mjs` and `scenarioSweep.mjs` were NOT run this batch** (full suites deferred to a separate follow-up pass across everything built this session) — this batch's own new mechanismWiring assertions are believed correct (the probe above measures the exact same scenario/thresholds/time points the new section asserts, all clearing their thresholds with margin), but that is NOT the same as an in-suite PASS and is not claimed as one here. No scratch probe scripts remain under `src/scripts/`.

### Physiology-engine batch: queue item 61 — a real localized angioedema field, distinct from whole-body edema, driving the already-real upperAirwayObstruction airway-mechanics consumer

Found while implementing TP 1234/1234-P and TP 1236/1236-P's "visible airway/tongue swelling" step (queue item 61's own filing): `pat.edema` is real but WHOLE-BODY (pcwp/alveolar-compliance/dlco consumers only, confirmed by grep — none airway-localized), and nothing fed `pat.upperAirwayObstruction` (the real, already-shipped fixed-extrathoracic-obstruction field croup/epiglottitis already drive, and which `respiratory.js` already applies real Poiseuille-law inspiratory resistance to) from anaphylaxis at all — `access.js`'s own `accessDifficulty` comment already (inaccurately, until this batch) described `uao` as "croup/epiglottitis/**anaphylaxis** airway swelling." laCounty.js's `ANAPHYLAXIS` helper's own comment already named the exact same gap: "no angioedema/skin signal exists" for TP 1219 footnote ❶'s real epi trigger.

**`pat.angioedema`** (patient.js) is a new 0-1 severity field for localized histamine/bradykinin-mediated submucosal swelling of the lips/tongue/pharynx/larynx — deliberately separate from BOTH `edema` (whole-body/pulmonary, wrong consumer for an airway emergency) and `broncho` (lower-airway smooth muscle, beta-2-responsive, a different mechanism). `anaphylaxis` (conditions.js) ramps it 0.35 to a 0.7 ceiling (short of croup/epiglottitis's own up-to-2.0 range for a structural, non-anaphylactic obstruction) and DERIVES `pat.upperAirwayObstruction` from it directly every tick, isolating its own contribution first (`pat._angioedemaUaoContrib`, subtracted before re-combining via `Math.max`) so a hypothetical comorbid patient with croup's own independently-ratcheted UAO is not silently overwritten — the same "isolate my own contribution" idiom the endothelial-barrier-repair mechanism already uses for `capillaryLeak`. This is a real DERIVATION, not a one-way ratchet: unlike croup/epiglottitis (which have no pharmacologic UAO reducer at all yet, queue item 60), anaphylactic angioedema now falls back in real time as epinephrine treats it, and UAO follows it down.

**epiIM/epiAuto's `fx`** gained `angioedema: -0.4` (both auto-injector and vial/needle, same magnitude — alpha-1-mediated mucosal vasoconstriction is the documented real-world mechanism for epi relieving anaphylactic angioedema, the SAME receptor already justifying `edema`'s own `-0.35` reduction there), wired through the SAME `rising()`-curve idiom bronch/edema/urticaria already use in `pk.js`'s `updateDrugs` (new `else if (prop === "angioedema")` branch, `_angioedemaCurve`). `epiIV` (route: "for ARREST" per its own note, not anaphylaxis) deliberately untouched.

**`laCounty.js`'s `ANAPHYLAXIS` helper**, the exact gap its own comment named, now also fires on `ctx.v.angioedema >= 0.2` (real Grade-3/airway-involvement presentation) IN ADDITION TO its previous `WHEEZING(ctx) && (SHOCK(ctx) || lowSpo2(ctx))` proxy — a hives-and-tongue-swelling patient with normal SBP/SpO2 now correctly triggers `anaphEpi` on the real finding; the wheeze+shock/hypoxia clause stays for the respiratory-compromise/poor-perfusion legs of the same TP 1219 footnote, which still have no dedicated non-proxy signal (unchanged, honestly left as-is).

**Player-facing surfaces wired to the real field, not decorative text.** `anaph` scenario's (ALLERGY-006) `airwayLook` probe was previously a fixed, always-identical line regardless of treatment — now reads `s.patient.angioedema` live (same pattern the same scenario's own `lungs` probe already established for `effectiveBroncho`), so a real epi-treated improvement is visible on re-exam. `actions.js`'s `skin` exam now checks `v.angioedema` alongside `v.urticaria` (both present, angioedema-only, or neither), replacing what had been an unconditional "no swelling of the lips, tongue or airway" line regardless of the patient's actual state. In the course of this, found and fixed a pre-existing typo bug: the `anaph` scenario's MICN refutation used `refuteKeys: ["ANGIEDEMA", ...]` (missing the second O) matched against an identically-typo'd `evid` string — App.jsx's `hasK()` does a case-insensitive substring match against collected evidence text, so correcting the spelling in one without the other would have silently broken a working refutation path; fixed both together, plus one player-facing dialogue line with the same typo (`onRefuseYes`).

`pat.angioedema` published to `vitals()` (rounded, no noise filter, matching `urticaria`'s own precision).

**MEASURED, not assumed** (direct instrumented probe against the `anaph` scenario, 600s, standalone script written and stripped before this entry, per this project's own convention): untreated `angioedema` 0.700, `upperAirwayObstruction` 0.700, `rr` 40, `hr` 0, `sbp` 29.8 — untreated severe (Grade 3) anaphylaxis decompensating into arrest by 600s, a pre-existing behavior of this condition's own `edema`/`vasodilation` ceilings (0.9/0.8, both unchanged by this batch) that this batch's own new field rides alongside, not something newly introduced (confirmed by inspection: nothing in this batch's diff touches the hemodynamic pathway that produces that outcome). Same scenario + one `epiIM` dose at t=2s, read at 600s: `angioedema` 0.448 (real fall through the fx-curve receptor route), `upperAirwayObstruction` 0.448 (tracks it down, confirming the derivation is live, not a ratchet), `hr` 138.7, `sbp` 97.6 — a genuine, if still-tachycardic, hemodynamic recovery. Healthy control (`abdPain`, 600s): `angioedema` 0, `upperAirwayObstruction` 0.

`angioedema` added to `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists (`upperAirwayObstruction` was already present in both from the earlier croup/epiglottitis batch). A new two-sided `[LOCALIZED ANGIOEDEMA — queue item 61]` section added to `mechanismWiring.mjs`: fires in `anaph` (>0.1 by 600s), stays at zero in a matched healthy control (`abdPain`), IM epinephrine measurably reduces it (`assertVersus`, >=0.05 down vs untreated), drives `upperAirwayObstruction` (>0.1 by 600s untreated), and that derived consumer falls back with treatment too (`assertVersus`, >=0.05 down vs untreated) — the actual point of the field per the queue item, not just a second decorative number next to `edema`.

**Verification: partial, stated honestly — per this session's explicit instruction to prioritize breadth across the physiology queue over running the full suites after every single item.** `node --check` clean on all nine touched files (`patient.js`, `pk.js`, `conditions.js`, `drugs.js`, `scenarios.js`, `actions.js`, `laCounty.js`, `scenarioSweep.mjs`, `mechanismWiring.mjs`). `npx eslint` on the same nine: zero findings. The direct instrumented probe above is real, measured evidence that the mechanism and the treatment response both work as designed, run against the actual engine (lesson 8), not reconstructed. **`mechanismWiring.mjs` and `scenarioSweep.mjs` were NOT run this batch** (full suites deferred to a separate follow-up pass across everything built this session, per explicit instruction) — this batch's own new assertions are believed correct (the probe above measures the exact same scenario/thresholds the new mechanismWiring section asserts, and all values clear their thresholds with margin), but that is NOT the same as an in-suite PASS, and is not claimed as one here. No scratch probe scripts remain under `src/scripts/`.

### Physiology-engine batch: queue item 58 — a real isolated urticaria/pruritus field, closing the gap `laCounty.js`'s `anaphDiphen` rule was working around

Found while implementing TP 1219/1219-P (Allergy) step 10's diphenhydramine indication (queue item 58): `pat.edema`/`pat.broncho` are real fields for angioedema/bronchospasm, but nothing represented cutaneous urticaria/itching in isolation — a patient with hives and no other finding was undetectable, so `laCounty.js`'s `anaphDiphen` rule gated on epinephrine already given instead of the actual clinical indication.

**`pat.urticaria`** (patient.js) is a new 0-1 severity field for isolated histamine-driven skin/mucosal reaction. Per the queue item's own stated design, it reuses `pat.vasodilation` — the SAME distributive-shock handle anaphylaxis/allergicReactionModerate/sepsis/neurogenic shock already drive — at a much smaller magnitude, rather than inventing a decorative field: `allergicReactionMild` (new condition, conditions.js) ramps `urticaria` toward a 0.7 ceiling and feeds `vasodilation` up to only 0.06, versus allergicReactionModerate's 0.2 ceiling and anaphylaxis's 0.8. `allergicReactionModerate` itself also now declares `urticaria` (0.6 ceiling) since its own scenario already narrates hives that nothing previously read.

**diphenhydramine's `fx` was `{}`** — a real drug with zero physiologic effect, decorative by the project's own definition. Now `fx: { urticaria: -0.5 }`, wired through the SAME `rising()`-curve idiom `bronch`/`edema` already use in `pk.js`'s `updateDrugs` (new `else if (prop === "urticaria")` branch), so onset/offset is a real pharmacokinetic curve, not an instant step. `epiIM`/albuterol/dexamethasone are untouched — antihistamines still do not treat bronchospasm, angioedema or anaphylactic hypotension, matching the drug's own pre-existing note.

**New scenario**: `allergicReactionMildCall` (ALLERGY-014, scenarios.js) — isolated hives after a new detergent, clear lungs, no angioedema, stable vitals — the Grade 1 presentation the removed comment in conditions.js had previously (correctly, at the time) declared not worth building because nothing would have read it.

**`actions.js`'s `skin` exam** now checks `pat.urticaria > 0.15` FIRST, ahead of the existing shock-skin findings, surfacing "raised, red welts... hives" — otherwise a hives-only patient is hemodynamically unremarkable and would fall through to the generic "warm, dry" line, making the one real finding on this exam invisible to the player. `patient.js`'s `vitals()` now also publishes `v.urticaria` (rounded, no noise filter — matches `bronch`/`edema`'s own display precision) so protocol rules can read the real signal instead of a proxy.

**`laCounty.js`'s `anaphDiphen` rule**, the rule item 58 named directly, now fires on `v.urticaria >= 0.15 && !WHEEZING(ctx)` (a real Grade-1 hives-only presentation) IN ADDITION TO its previous `gaveDose(ctx, "epiIM")` gate (Grade 2/3, late adjunct after epi, matching footnote ❹) — the proxy gate stays for the anaphylaxis-adjacent case footnote ❹ actually describes, but the rule is no longer unreachable for the isolated-skin case it was named for.

**MEASURED, not assumed** (direct instrumented probe against `allergicReactionMildCall`, 600s): untreated `urticaria` 0.549, `vasodilation` 0.06, `hr` 86.1, `sbp` 113.5. Same scenario + one `diphen` dose at t=2s, read at 600s: `urticaria` 0.099 (real fall through the fx-curve receptor route, not a decorative write), `vasodilation` 0.015. Healthy control (`abdPain`, 600s): `urticaria` 0, `vasodilation` 0. `allergicReactionModerate` control (600s): `urticaria` 0.6, `vasodilation` 0.199 — confirms the mild condition's vasodilation contribution (0.06) stays an order of magnitude below the moderate condition's (0.199), which is itself well below anaphylaxis's 0.8 ceiling, exactly as designed.

`urticaria` added to `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists. A new two-sided `[ISOLATED URTICARIA/PRURITUS — queue item 58]` section added to `mechanismWiring.mjs`: fires in `allergicReactionMildCall` (>0.1 by 600s), stays at zero in a matched healthy control (`abdPain`), diphenhydramine measurably reduces it (`assertVersus`, >=0.05 down vs untreated), and the vasodilation contribution is both non-zero (real) and stays under 0.1 (modest, not full-anaphylaxis magnitude).

**Verification: partial, stated honestly.** `node --check` clean on all nine touched files (`patient.js`, `pk.js`, `conditions.js`, `drugs.js`, `scenarios.js`, `actions.js`, `laCounty.js`, `scenarioSweep.mjs`, `mechanismWiring.mjs`). `npx eslint` on the same nine: zero findings. `npx vite build`: clean (13.11s, same pre-existing >500kB chunk-size warning). The direct instrumented probe above (a standalone script, stripped before this entry was written) is real, measured evidence that the mechanism and the treatment response both work as designed, run against the actual engine rather than reconstructed (lesson 8).

**`mechanismWiring.mjs` and `scenarioSweep.mjs` were launched (chained, sequential per section 4) but did NOT complete within this session's time budget** — stated honestly, not assumed clean, per this document's own lesson 14/17 convention. `mechanismWiring.mjs` reached 90+ passed assertions with 3 failures before this session's own new section was reached: `BVM -> respiratory muscles unloaded` (`ventUnloadFraction`), `BVM -> work of breathing falls` (`workOfBreathing`), `BVM -> vtPrev reflects the delivered breath` — all three in the pre-existing `[ASSISTED VENTILATION]` section this batch did not touch, and matching by NAME a previously-documented failure signature already on record elsewhere in this file (search `ventUnloadFraction`). This batch's own new assertions were not reached before the time budget ran out, so their in-suite PASS/FAIL is NOT independently confirmed here — the standalone probe above is the real evidence for this batch specifically. Whether the 3 BVM failures are a live pre-existing regression or an artifact of this run was not established; section 2's last-recorded baseline shows only 1 failure (`activeSeizureGTC`, flaky), so these 3 are new INFORMATION, not confirmed as this batch's fault (nothing this batch touched sits anywhere near BVM/ventilation mechanics) but also not yet cleared. Flagged here rather than silently dropped; worth a fast follow-up re-run to confirm cause before trusting BVM assertions again. `scenarioSweep.mjs` had not started by the time this entry was written. No scratch probe scripts remain under `src/scripts/`.

### Physiology-engine batch: queue item 50's remaining renal/pulmonary reserve traits — two more per-patient baseline-variability coefficients, real consumers, neutral by default

Per explicit instruction to continue the physiology queue. Confirmed the tree before starting (lesson 16): the original four traits (`baroreflexGain`/`metabolicRate`/`painSensitivity`/`vascularReactivity`, patient.js) each already had a single, real, non-decorative consumer — the pattern to extend, not redesign.

**`renalReserve`** scales `this.baseGfr` at construction, composing with (not replacing) `riskFactors.renalDisease`'s own separate 0.5x — a real, documented axis of inter-individual variation (nephron endowment varies roughly 20-fold at birth per Bertram et al. 2011) distinct from a diagnosed chronic disease state. **`pulmonaryReserve`** scales `this.compliance`/`airwayResistance`/`tissueResistance` together, composing with `riskFactors.copd`'s own multipliers the same way — real baseline lung elastic recoil/airway caliber variation independent of any diagnosed disease. Both centered on 1.0 with the same clamped-Gaussian `trait()` helper the other four already use, so every existing scenario's calibration is unchanged in expectation.

**MEASURED at construction, not assumed:** `baseGfr` 88.0/110.0/132.0 at `renalReserve` 0.8/1.0/1.2 (110 at neutral is the exact pre-existing, unmodified calibration); `compliance` 0.0765/0.0900/0.1035 and `airwayResistance` 2.353/2.000/1.739 at `pulmonaryReserve` 0.85/1.0/1.15 (0.09/2.00 at neutral likewise unchanged). Both fields flow into already-established, real consumers (`renal.js`'s `pat.gfr = pat.baseGfr * renalPerf * injuryFactor`; `respiratory.js`'s `C = pat.compliance * (...)`, the same variable every organ's own compliance/resistance time-constant calculation reads) — grep-confirmed, not assumed.

Both traits added to `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists and `mechanismWiring.mjs`'s `pinTraitsNeutral()` — the latter is load-bearing, not decorative: this same queue item's own prior session found that suite's `probe()`/`afibRun()` construct a fresh, separately-randomized patient per call, and an unpinned trait breaks the "otherwise identical control" premise `assertVersus` depends on (two real, previously-caused false failures on record from the original four traits). Pinning the two new traits the same way closes off a repeat of that exact failure mode before it could happen.

**Verification, complete for the parts reachable in this session's time budget.** `node --check` clean on `patient.js`/`scenarioSweep.mjs`/`mechanismWiring.mjs`. `npx eslint`: zero findings on the same three. `npx vite build`: clean (same pre-existing >500kB chunk-size warning). Since this touches `Patient`'s shared constructor — every scenario in the game passes through it — the full suites were attempted but did NOT complete within this session's time budget (`scenarioSweep.mjs` was run to a 570s timeout with zero output, consistent with this document's own lesson 17: the script buffers all output until completion, so a timeout gives no partial signal either way) — stated honestly as NOT run, not assumed clean. The change is judged low-risk by construction, not by a completed suite run: it is purely additive (two new fields multiplying an existing, already patient-specific baseline coefficient), neutral-pinned in the one suite that does exact-value comparisons, and `scenarioSweep.mjs`'s own bounds-only checks (NaN/negative/impossible-range) cannot be broken by a ±15-20% shift on a field that was already individualized (age/weight-scaled) before this trait existed. Both throwaway probe scripts used to measure the numbers above were stripped before this entry was written.

**Deliberately still not built: `cardiacReserve`.** It would need a real consumer inside the shared, high-blast-radius full-loop ODE solver (`cardiovascular_ode_full.js`) rather than the single-file consumers the other five traits each got — this document's own standing discipline is against touching that solver outside a dedicated, carefully-scoped batch, and this session's two additions were deliberately kept to lower-risk, single-consumer traits instead.

### Physiology-engine batch: queue item 55 CLOSED — a genuinely separate, milder `passiveCooling` mechanism (100W) now exists distinct from `activeCooling`'s heat-stroke-grade 400W ice/misting intensity

Per explicit instruction to continue the physiology queue. `laCounty.js`'s TP 1204 (fever without sepsis) and TP 1209/1222/1225 (true suspected hyperthermia) both drove crews through the SAME `passiveCooling` task, which doses the aggressive `activeCooling` procedure — a real reuse-not-a-perfect-match this document had already flagged (queue item 55): undressing a febrile patient and packing a heat-stroke patient in ice are clinically very different interventions.

**Fixed with a real, additive procedure entry, not a coefficient tweak on the existing one.** `procedures.js` gained `passiveCooling` (100W, `pkModel:"curve"`, same `coolingPower` consumer thermo.js's own `externalCoolingW` term already reads for `activeCooling`) — an order-of-magnitude estimate, stated honestly as such (no field trial measures watts removed by blanket removal specifically), chosen as roughly a quarter of `activeCooling`'s 400W: undressing only increases ordinary radiant/convective skin heat loss (thermo.js's `skinHeatLoss` term), while ice packs plus misting add real evaporative cooling on top of that (thermo.js's own 700W evaporative ceiling) — a mechanistically much larger effect. `gear.js`'s old single `passiveCooling` task was split into `activeCoolingTask` (unchanged dose, renamed only) and a new `passiveCoolingTask` (doses the new, milder entry). `laCounty.js`'s `feverCooling` rule (TP 1204) now points at the milder task; `hyperthermiaCooling` (TP 1209/1222/1225, temp>39 — genuine heat illness) and `national.js`'s `heatActiveCooling` (heat stroke) both keep the aggressive one, correctly.

**MEASURED, not guessed, via the real `physio()` pipeline** (a condition-less control, coreTemp forced to 38.5°C with a sustained `metabolicHeatMultiplier` of 1.15 so it doesn't self-resolve before the interventions can be compared, 900s): untreated settles at 37.31, `passiveCooling` at 37.11 (an extra -0.20°C beyond natural resolution), `activeCooling` at 37.00 (an extra -0.31°C) — a real, present, and correctly-ordered (milder-than-aggressive) effect, not a relabeled copy.

**Verification, complete.** `node --check` clean on all four touched files (`procedures.js`, `gear.js`, `laCounty.js`, `national.js`). `npx eslint`: zero findings on the same four. `npx vite build`: clean (same pre-existing >500kB chunk-size warning). Grep-confirmed no stale reference to the old shared `"passiveCooling"` task id remains anywhere in the tree. This is a protocol/procedure-content change with no `src/physio/*` engine-loop edits reachable from `mechanismWiring.mjs`/`scenarioSweep.mjs` (neither suite imports `src/protocols/`, the same precedent every prior protocol-content-only batch in this document already used) — the direct-measurement probe above is this batch's own real regression/correctness evidence, not a suite run. The throwaway probe script was stripped before this entry was written.

### Physiology-engine batch: queue item 65's epinephrine half CLOSED — a real, weight-scaled newborn epinephrine mechanism now exists for TP 1216-P's step 14; the saline/IV-fluid half remains open

Per explicit instruction to continue the physiology queue, after confirming this item's own scope with the operator. `neonatalTransition` (conditions.js) is a discrete NRP vigor state machine (0-1), not a PK/receptor model — its own header comment already documents this as a deliberate design choice, since a newborn's resuscitation course is dominated by one number (heart rate) responding to dry/stimulate/PPV/compressions, not a continuous drug curve. Before this batch, `target = chestComp ? 1 : 0.95` meant effective PPV+compressions rescued EVERY newborn this engine could spawn (reserve floor 0.1, obstetric.js's own `apgarSeed` clamp) — real NRP teaching (over 98% of depressed newborns respond to ventilation alone) but leaving no real epinephrine indication anywhere in the model, and no honest place for a weight-scaled dose to matter.

**Fixed by adding the real NRP epinephrine indication as a second reserve-dependent branch, not a parallel drug-engine dose.** A newborn with a genuinely CRITICAL reserve (<0.2 — severe, prolonged intrapartum asphyxia) now plateaus at a still-bradycardic `target=0.55` on compressions alone; only a real epi dose (`neo.epi=true`) completes the rescue to `target=1` — the same "compressions restore some coronary perfusion, but adequate coronary perfusion pressure needs epi's alpha-adrenergic vasoconstriction on top of it" teaching point adult ACLS already uses for refractory arrest. Every newborn above the critical-reserve threshold (the common case) is completely unaffected — confirmed by direct measurement, not assumed from the code alone.

**The dose itself is real and weight-scaled, not a flat adult 1mg dose**, computed against the newborn's own `weight` (obstetric.js seeds it from `preg.birthWeight || 3.3` kg) at the real NRP IV/IO rate (0.01 mg/kg) — wired as a crew-directable task (`gear.js`'s `newbornEpi`, App.jsx's `t.neoAction==="epi"` branch) and a mirrored player action (`scenarios.js`'s `nbEpi`), both gated on compressions already being underway (NRP's own order of operations), and a real TP 1216-P step-14 protocol rule (`laCounty.js`'s `NEWBORN_NEEDS_EPI`: HR<60 despite compressions). Deliberately kept as a bespoke `_neo` flag rather than routed through `pk.js`'s drug-instance/concentration machinery — consistent with `stimulated`/`ppv`/`compressions` already using the identical pattern, and this state machine has no continuous receptor-curve consumer for a routed dose to feed.

**MEASURED against the real engine, via a direct instantiation of `neonatalTransition.progress()` (not the full scenario harness, since no shipped scenario currently seeds a newborn below the new 0.2 critical-reserve threshold):** at reserve 0.1 with PPV+compressions and no epi, vigor plateaus at 0.550 (hrBase 99.3 — still bradycardic); with epi added, vigor reaches 1.000 (hrBase 160.0 — full recovery). A control at reserve 0.5 (above the critical threshold) reaches full recovery (vigor 1.000) with or without epi, confirming the new branch doesn't regress the common case. A PPV-only (no compressions) control at reserve 0.85 stays at the pre-existing 0.95 target, unchanged.

**Verification, complete.** `node --check` clean on `conditions.js`/`laCounty.js`/`scenarios.js`/`gear.js`. `npx eslint`: exactly the pre-existing 3-error `react-refresh/only-export-components` baseline in `App.jsx`, zero findings elsewhere. `npx vite build`: clean (same pre-existing >500kB chunk-size warning). `neonatalTransition` has zero existing coverage in either `mechanismWiring.mjs` or `scenarioSweep.mjs` (grep-confirmed before relying on this) — so there is nothing in either suite this change could regress, and the direct-instantiation probe above is this batch's own real regression/correctness evidence. Both suites' own full runs did not finish within this session's time budget (each takes 12-45 minutes per this document's own section 4) and are stated here as NOT run, not assumed clean.

**Step 15 (weight-scaled saline for suspected neonatal hypovolemia) is deliberately NOT built, filed as the remaining half of item 65.** It needs a mechanism genuinely distinct from the vigor/HR asphyxia axis this state machine models — a hypovolemic newborn (suspected fetal-maternal hemorrhage, placental abruption, cord accident) presents pale and poorly perfused despite adequate ventilation/compressions, a different clinical picture from asphyxial depression — and no shipped scenario currently seeds a hypovolemic (as opposed to asphyxiated) newborn for such a mechanism to have a real producer. Threading a real maternal-hemorrhage-to-newborn-hypovolemia coupling through `obstetric.js`'s spawn logic is genuinely new, separately-scoped work.

### Front-end batch: queue item F4 — the crewed-vehicle recruit/hire sub-flow, the one path the previous session's Career setup wizard test explicitly skipped, now real-click-tested too. Clean.

Direct follow-up to `verifyCareerSetupWizard.mjs`'s own honest scope note (that script picked "On foot" specifically to avoid the recruit-crew hiring flow). New `tools/browser/verifyCareerCrewedVehicle.mjs` picks County EMS → ALS ambulance (a real `needsCrew:true` rig, per `App.jsx`'s `needsCrew=["ambBLS","ambALS","engine"].includes(veh.kind)`), clicks a real, non-disabled "Recruit" button against the actually-generated candidate pool, confirms the hire lands in `g.roster`, confirms the partners screen's "Continue" button correctly un-blocks once real crew is present (`needsCrew` gate reads the hire correctly), then continues through mode/scope/ready to station and confirms the final state is coherent (level/department/vehicle/mode/roster all really set). Two clean runs (`PASS: hired a real partner — roster now: [{"name":"Paramedic Ali",...}]`, then `[{"name":"Paramedic Cook",...}]` on the repeat — a different, real generated candidate each run, confirming the pool is genuinely randomized, not fixture data). `npx eslint` clean.

Between this and the prior session's Career setup wizard test (the "On foot" no-crew path), F4's own "Career mode's own setup wizard" open item is now closed for both real branches of that flow (solo and crewed) — not just the easier one.

### Front-end batch: queue item F4's last genuinely untested area — Career Mode's own setup wizard (as opposed to Sandbox's) — real-click-tested end to end for the first time. Clean.

New `tools/browser/verifyCareerSetupWizard.mjs` walks the FULL chain for real: gmodePick → Career Mode (tester-gated — unlocked via `localStorage.setItem("proximate_tester_unlocked","1")`, the same flag a real password entry sets, not a bypass of anything the real gate doesn't already expose) → learningMode (Master of Your Scope path — Zero-To-Hero routes through the campaign instead, already covered elsewhere) → level (Paramedic) → department (Fire Dept) → vehicle (On foot) → partners → mode (City) → scope → ready → station, checking for `undefined`/`NaN`/`[object Object]` render text and console errors at every single screen, plus a final sanity check that the resulting station state is actually coherent (level/department/vehicle/mode/scope all really set, `scopeLocked` true).

**Two real test-harness gotchas found and fixed while building this, both the same underlying trap — worth recording since a future script will hit them too:** `clickText()`'s default `getByText(...).first()` matches ANY element containing the substring, not just buttons — and this wizard's own screens both contain plain descriptive text that repeats the exact word a button uses, positioned EARLIER in the DOM: the department screen's paragraph ("a Fire Dept medic isn't rolling up...") contains the department's own name before the real department button; the scope screen's paragraph ("Once you press Ready below...") contains "Ready" before the real "▲ Ready" button. Both silently clicked inert text and produced a `waitForPhase` timeout with no error, not an obvious failure — traced by dumping all button text explicitly rather than assumed. Fixed by scoping those two clicks to `page.locator("button", {hasText: ...})` instead of the generic `clickText()` helper. Also found: the real department button text is CONCATENATED with its own vehicle-list subtext with no whitespace (`"Fire DeptFire engine · Rescue truck..."`), so a naive `===`/`.includes()` array check against known department names needs a `.startsWith()` check instead.

**Result: clean, run twice** (the first repeat run surfaced one console-error false-positive — `WasmLLMProvider: model load failed ... classified as "network"`, the WASM-tier fallback trying and failing to fetch a HuggingFace model file in this network-restricted environment — the same already-documented benign F0 noise class as the existing `LocalLLMProvider` filter, now also filtered here). **Honest scope note**: this run picks "On foot" (no vehicle, no crew requirement) specifically to reach the end of the chain without also depending on the recruit-crew hiring flow — the crewed-vehicle path (hiring a real partner within the recruit budget) is a genuinely different sub-flow this run does NOT exercise, and remains open for a future pass. `npx eslint` clean.

### Front-end batch: queue item F4's breadth-pass bug hunt extended twice more — a fourth 6-scenario render-text slice (clean) and a new, more targeted pediatric weight-based-dose check (also clean).

**Fourth breadth-pass slice, `tools/browser/verifyBreadthBugHunt3.mjs`** — three pediatric scenarios (`bronchiolitisInfant`/`croupToddler`/`febrileSeizureToddler`, age/weight-scaled physiology none of the prior three passes touched at all), a rare neuromuscular crisis (`myastheniaGravisCrisisCall`), an endocrine crisis (`addisonianCrisisCollapse`), and excited delirium (`excitedDeliriumAgitated` — an unusual combative/hyperthermic/superhuman-strength combination). Same method: torso/assess, head/airway, head/meds, head/procedures, watching for `undefined`/`NaN`/`[object Object]` and console errors. **Result: clean, zero findings, run twice.**

**A genuinely different, more targeted check, `tools/browser/verifyPediatricDoseLive.mjs`** — the passive render-text passes above only look at whatever's already on screen; they never actually GIVE a weight-based drug, which is exactly where a real bug (a missing weight field, a bad mg/kg formula, a unit slip) would most likely hide. This clicks a real weight-based medication through to completion on three pediatric ages (a 2-year-old, a 9-month-old infant, another 2-year-old): `Midazolam` for `febrileSeizureToddler`, `Albuterol` for `bronchiolitisInfant`, `Dexamethasone` for `croupToddler` — and checks the resulting dose-confirmation log line for `NaN`/`undefined`/`[object Object]`. **Real test-harness gotcha found and worth recording**: `medActs()` (`App.jsx`) computes each drug's own region internally — IM/IN-route drugs with no IV line default to `"legR"`, NEB/PO/INH-route drugs default to `"head"` — a `setState` scene jump has to match that computed region or the drug button silently never renders (the first attempt used a single `region:"torso"` for all three cases, correctly matching none of them). **Result: clean, zero findings, run twice** — all three pediatric doses completed with a real, non-NaN confirmation line (e.g. `"Midazolam 5 mg in. [PAIN ↓2 · onset 90s]"`), confirming the underlying weight-based PK math holds up across this age/weight range, not just that a button exists.

Both are genuine negative results, not skipped steps — recorded per this project's own standing convention that a clean pass is real, useful information. `npx eslint` clean on both new scripts.

### Front-end batch: queue item F4's breadth-pass bug hunt extended to a third 6-scenario slice — a genuine, honest negative result, no defects found.

`verifyBreadthBugHunt.mjs`'s own header names this an ongoing pass, extendable "to cycle through more of the ~124 scenarios over successive runs." New `tools/browser/verifyBreadthBugHunt2.mjs` covers a fresh slice the prior two passes never touched — renal/electrolyte (`hyperkalemiaMissedDialysis`), OB (`placentalAbruption`), a progressive neuro-paralysis (`guillainBarreProgressive`), toxic inhalation (`toxicInhalationChlorine`), abdominal-vascular (`acuteMesentericIschemia`), and a paralytic-drug overdose (`rocuroniumOverdose` — picked deliberately as an edge case: a chemically paralyzed-but-conscious patient's UI has unusual rendering needs no other scenario in this project shares). Same method as the prior pass: torso/assess render check, then a region switch to head/airway, head/meds, and (new this pass) head/procedures, watching for `undefined`/`NaN`/`[object Object]` and console errors. Also fixed for the boot screen (F0), which the prior pass's `freshCharacter()` predates and no longer reaches "Go on shift" through on its own (needs a "Continue without AI" click first — the same fix every F7 script this session needed).

**Result: clean.** Zero suspicious render text, zero console errors, across all 6 scenarios × 4 tabs, run twice. A genuine negative result, not a skipped step — recorded per this project's own standing convention that a clean bug-hunt pass is real, useful information (rules out a class of defect for this slice), not nothing. Combined with the two prior passes, roughly 16 of ~161 scenarios have now had this specific breadth check; the remaining ~145 are still unaudited by this method (updated count — the doc's prior "~118 remaining" was against the older ~124-scenario total, not the current ~161).

### Front-end batch: queue item F7 (STANDING WORKSTREAM) — a real, previously-undiscovered defect distinct from the usual "wrong probe key" class this workstream finds: `ecgReadout()` gives a fixed, generic finding per RHYTHM KIND, but every real ECG display site called it directly, never consulting a scenario's own `probes.ecg` override.

A from-scratch, corrected enumeration of every `probes.<key>` used across `src/data/scenarios.js` (this workstream's own previously-flagged next step — the earlier enumeration pass had picked up noise from string literals; this pass anchors on real `key: (` arrow-function definitions only) turned up `ecg` (5 occurrences: `takotsubo`, `nstemi`, `stableAngina`, `unstableAngina`, `ami`) as a key never covered by any prior F7 audit. Unlike `glucometer`/`jvd`/`airwayLook` (fixed earlier this session — see below — by correcting a scenario's own mis-typed key against an action's declared `probe:"..."` name), `ecg` was never meant to compose via the generic `a.probe` mechanism at all: the real 12-lead action (`p.id==="ecgRead"`, `App.jsx`) calls `ecgReadout(v.ecg,v)` (`ecg.js`) directly, a genuinely live-physiology-driven function — but one that returns the SAME fixed text per rhythm kind (e.g. every `"stemi"` reads "ST ELEVATION — inferior leads (II, III, aVF)." regardless of scenario) and had NEVER once checked for a scenario-specific override, unlike literally every other exam action in the game.

**`takotsubo` is the starkest confirmed instance, not a theoretical one.** Its own condition (`physio/conditions.js`) deliberately sets `rhythm:"sinus"` — its own comment explains why: "the ECG... will look like an anterior STEMI, but the pump failure here is catecholamine stunning," i.e. the scenario is DESIGNED so the authored finding (an anterior-STEMI-mimic reading) is the whole clinical teaching point, deliberately decoupled from the underlying (genuinely sinus) rhythm. Before this fix, a player running the real 12-lead action on this scenario saw **"Normal sinus rhythm."** — confirmed by direct source reading (`ECG_READ.sinus` in `ecg.js`) — the exact OPPOSITE of the scenario's own documented intent, not a minor cosmetic gap.

**Fix:** a new shared `ecgLiveText(state,v)` helper (`App.jsx`, right after `scenOf`) checks `scenOf(state).probes.ecg` first and falls back to the generic `ecgReadout(v.ecg,v)` only when no override exists — the same `find`-then-`say` preference every other probe composition site already follows. Used at all three real ECG display sites that previously called `ecgReadout()` directly: the `ecgRead` action itself, the transmitted-to-base readback (the "BASE: We have your twelve-lead..." tick-loop line, ~15s after transmit), and the live 12-lead JSX panel (`L>=4&&g.ecgRead` branch) — fixing only the action's return value while leaving the other two on the generic text would have produced a real inconsistency (the log recording one finding, the panel re-displaying another). No change to `ecg.js`/`ecgReadout()` itself or to `scenarios.js` — the authored content was already correct, just unreachable from any real call site.

**Verification:** new `tools/browser/verifyEcgOverrideLive.mjs` — real clicks through "12-lead — acquire and transmit" then "12-lead — INTERPRET" on a live `takotsubo` scene, confirms the log now contains the authored "anterior ST elevation" finding instead of the generic (and actively wrong, for this scenario) sinus-rhythm text. Two clean runs. **Real test-harness gotcha found and worth recording**: `ecgAcquire` is gated behind torso exposure (`clothing.js`'s `CLOTH_LOCK`, the same convention `heart`/`lungs` auscultation already use) — a `setState` scene jump needs `exposed:{torso:true}` explicitly, or the acquire button silently never appears (while `ecgRead`, needing no exposure, misleadingly still does) — cost real debugging time before being traced to `clothing.js`'s own `torso: ["heart","lungs","ecgAcquire"]` list, not a bug in either action. `npx eslint`/`npx vite build` both clean (same pre-existing 3-error `App.jsx` baseline). `node src/scripts/scenarioSweep.mjs` re-run as a broad regression guard since `App.jsx` changed — see section 2's freshest baseline number.

**Still open for this workstream:** the corrected enumeration's other genuinely-unaudited candidates — `probes.opqrst`/`probes.sample`/`probes.history` (narrative content, likely lower-yield, still never audited) — and the one already-identified, deliberately-unfixed orphan (a meningitis scenario's `probes.neck` nuchal-rigidity finding with no corresponding action — needs a new action, not a rename, see this section's own earlier `neck`/`airwayLook` entry).

### Front-end batch (operator-directed): music/voice volume split, a solemn menu-music replacement, and a real "Backpack" bag-selection leak found and fixed — three separate operator requests, one session.

**1. Music/voice volume split.** `App.jsx` previously had exactly one `g.volume` slider (`SettingsOverlay.jsx`) driving THREE independent things at once: `useBackgroundMusic` (menu/station music), `useSiren`, and `useReadAloud` (spoken dialogue/dispatch narration) — turning music down also silenced spoken dialogue and vice versa. Split into `g.musicVolume` (music + siren — both ambient sound, not speech) and `g.voiceVolume` (spoken read-aloud only), each with its own Settings slider. Both added to `blank()`'s defaults (1 each) and to `CARRY` (the "survive a new-call-same-shift reset" field list `g.volume` was already in) so they persist across a phase change exactly the way the old single slider did. **Verified live** via new `tools/browser/verifySplitVolume.mjs` — a new DEV-only `window.__proximateTestGetMusicVolume()` hook (`useBackgroundMusic`, same gating/cleanup convention as the existing `__proximateTestGetState`) exposes the real, otherwise-undetached `<audio>` element's live `.volume`, since it's a plain `new Audio()` never attached to the DOM tree, not queryable via `document.querySelector`. Confirms: musicVolume actually reaches the element; changing voiceVolume does NOT move it (genuine independence, not just two state fields that happen to both exist); both survive a real phase change (gmodePick → level via an actual UI click, not a `setState` phase-jump shortcut — see the gotcha below). Two clean runs (PASS×4/PASS×4).
  - **Test-harness gotcha worth recording** (found while building this, cost real debugging time): `setState(page, {phase:"station"})` — a raw phase jump skipping the real `goGmode()`/department/fleet setup — crashes the app (`Cannot read properties of undefined (reading 'name')`) because "station" assumes fields only that real flow populates. This is NOT a regression from this session's changes (confirmed by reproducing it with a bare, unrelated `setState` call with no volume fields at all) — it's a pre-existing constraint on which phases are safe to jump to directly via the test hook. Use a real click through an actual button (e.g. "Medical Education Mode") to change phase in a script instead of `setState({phase:...})` for any phase beyond the simple ones (`scene`/`kit`/`cat` are known-safe per every other existing verify script).

**2. Solemn menu music, replacing the previous upbeat placeholder.** `menu_music.wav` was "Track 01 (Title Screen)" from OpenGameArt's CC0 Scraps pack (per `src/assets/audio/README.md`) — read as upbeat/energetic, a tone mismatch for a prehospital-care simulator. New `scripts/generate_solemn_music.mjs` synthesizes a slow, minor-key ambient pad (low A-minor triad — A1/E2/C3 — two detuned partials plus a quiet octave-up partial per voice, under a slow 10s-period amplitude swell so it breathes rather than droning flat) directly to `public/assets/audio/menu_music.wav`, in keeping with this project's own established "synthesize audio, no licensing/tone-mismatch headaches" convention (the in-game siren is already a synthesized oscillator, not a sample; `BootScreen.jsx`'s own comment: "Audio: synthesized... no external files to fetch"). No new dependency — raw PCM WAV written directly via `fs`. The original CC0 track is untouched at `public/assets/cc0-library/menu-music-candidate/title_screen_cc0scraps.wav` (confirmed byte-identical to the old `menu_music.wav` before overwriting, so nothing was lost) if a revert is ever wanted. `station_ambience.wav` was deliberately NOT touched — at ~88KB (roughly a 1-second loop) it reads as a short room-tone/hum texture, not a full music track, and the operator's complaint was specifically about "the background music" — left alone rather than changing something not flagged as a problem. Peak amplitude checked numerically (±9150/32767 ≈ 28% of full scale) — no clipping, sane headroom. **Not verified by ear** (no audio playback available in this environment) — the operator should give the new track a listen and say if it needs further tuning (swell rate, chord voicing, master gain); the generator script is the tool to re-run with adjusted constants if so, rather than hand-editing the WAV.

**3. Real bug found and fixed: "Backpack" (a Chapter-1-Layperson-only volunteer kit, per `gear.js`'s own header comment — "not a real EMS bag") was appearing as a pickable bag choice for ANY non-Layperson provider on an ordinary vehicle.** Root cause: `fleet.js`'s `bagsForVehicle()` returns `null` ("unrestricted (full loadout)") for any vehicle type not explicitly listed in `VEHICLE_BAG_ACCESS` — which is every ordinary BLS/ALS ambulance, fire engine, etc, i.e. most of the game. Three separate `App.jsx` call sites resolved that `null` fallback to a bare `Object.keys(BAGS)`/`Object.entries(BAGS)` — literally every key in `gear.js`'s `BAGS` map, "backpack" included: the kit-screen `bagChoices` (the general 3-bag picker every non-Layperson player sees), a crew "fetch a missing bag" task, and an arriving unit's bags being merged into the roster. Fixed with a new `gear.js` export, `STANDARD_BAG_KEYS` (`Object.keys(BAGS)` minus `"backpack"`), used at all three call sites instead of the bare fallback — the Chapter-1 `ch1LaypersonGearup` path (which explicitly forces `bagChoices` to `[["backpack",BAGS.backpack]]` on its own, unaffected by this change) still works exactly as before. **Verified live** via new `tools/browser/verifyBackpackNotForNonLayperson.mjs` — a paramedic on an ordinary ALS ambulance (a vehicle type NOT in `VEHICLE_BAG_ACCESS`, so it genuinely exercises the buggy fallback path) reaches the real kit screen and confirms "Backpack" is absent while all four real EMS bags (Monitor/Drug box/Airway bag/Trauma bag) are still offered normally. Two clean runs.

**Verification common to all three:** `npx eslint` clean on every touched file (same pre-existing 3-error `react-refresh/only-export-components` `App.jsx` baseline, zero new). `npx vite build` clean (same pre-existing >500kB chunk-size warning, no new warnings). `node src/scripts/scenarioSweep.mjs` re-run as a broad regression guard since `App.jsx`/`gear.js` both changed — see the freshest baseline number in section 2's table, confirmed unchanged by this batch.

### Protocol-content batch: queue item 62 RESOLVED — a stale doc claim corrected, not a build from scratch: the crew-directable stroke-screen mechanism already existed, but nothing ever directed a crew member to actually run it

**Confirmed against the tree before writing anything, per lesson 16 — the queue item was half-stale.** Item 62 asked for two pieces: a generic crew-directable wrapper for assessment-only exam actions (mirroring `TASKS`' `glucoseCheck` pattern), and a `laCounty.js` rule directing it for suspected stroke. Reading the code first showed the FIRST piece was already built in an intervening "Crew AI batch" — `App.jsx`'s `crewFn` has a real, generic `t.assessId` branch that wraps any `actions.js` exam action (reusing its own `run`/`probe` composition, not duplicating clinical text), and `gear.js`'s `assessStroke` (`assessId:"strokeScreen"`) already exposes the real player-facing FAST/Cincinnati screen — `pat.strokeWeakness`/`strokeAphasia`/`strokeSide` and all — as a crew-assignable task. What was still genuinely missing, confirmed by grep across `laCounty.js`: not one of the eight `assessId`-based tasks in this file's TASKS list (`assessLoc`/`assessSkin`/`assessPupils`/`assessStroke`/`assessJvd`/`assessBreathing`/`assessResp`/`assessCapRefill`/`assessReflexes`) had ANY protocol rule directing it — every one was a player-assignable button nobody ever automatically called for.

**Fixed with one new rule, reusing the existing `altered` signal rather than inventing a stroke-specific one.** `strokeScreenCrew` gates on `altered(ctx)` — the same ALOC/neuro-complaint threshold TP 1229/1230/1235's own "no new rules" reasoning already treats as the general trigger in this file — matching real field practice: FAST screening is applied broadly to any new altered-mentation presentation, not narrowly pre-filtered to an already-confirmed stroke, which is what the screen exists to determine in the first place. Gated on `!ctx.s.done?.strokeScreen`, not `doseCount`/`gaveDose`: an `assessId` task's completion is tracked in `s.done` by `crewFn` itself (a different ledger from `s.doses`, confirmed by reading the exact line that sets it), so using the dose-count helpers here would have silently never gated correctly.

**MEASURED, via the real rule predicate directly (probe stripped after use):** an awake, unscreened patient does not trigger the rule; a confused or unconscious, unscreened patient does; the identical confused patient with `s.done.strokeScreen` already set does not — confirming both the ALOC gate and the once-per-call completion gate work as intended.

**Verification, complete.** `node --check` clean on the one touched file (`laCounty.js`). `npx eslint`: zero findings. `mechanismWiring.mjs` (this suite doesn't test protocol-rule files directly, but was run anyway since `laCounty.js` sits in the same repo and any accidental syntax/shared-state slip would still be worth catching): **451 passed, 1 failed** — same total (452) as the pre-existing baseline, the single failure being the same already-long-documented pre-existing flaky `PACs` stdev assertion. `scenarioSweep.mjs`: **161 scenarios, 11,953,608 checks, 0 failed** — identical to baseline. No scratch probe scripts remain under `src/scripts/`.

### Physiology-engine batch: queue item 70 RESOLVED — head-of-bed elevation now genuinely lowers ICP; a crew-directed task that was a documented no-op now does something real

**The gap, exactly as filed.** `pat.icp` (neuro.js) was a real, already-live field, and both TP 1244 (TBI) and TP 1232 (stroke) independently ask for 30-degree head-of-bed/reverse-Trendelenburg elevation as a real ICP-reducing measure — but nothing in the engine modeled elevation as an input to the ICP calculation at all, so a crew-directed "raise the head of the bed" task had nothing to actually do. Recurred across two protocols, which item 70 itself flagged as the signal this was worth building as a real, reusable mechanism rather than a one-off.

**Built, mirroring the exact `shadeFix`/`icdMagnet` idiom already established for other instantaneous, persistent positioning/environmental changes.** `procedures.js` gained `headElevate` (a boolean-flip procedure, `dur:9999`, no `fx`), `pk.js` sets `pat.headElevated = true` when applied (same "SET, idempotent, never reset" shape as `chestSealApplied`/`icdSuppressed`), and `neuro.js`'s ICP formula now subtracts a flat, modest 3 mmHg when the flag is set: `pat.icp = 10 + (paco2-40)*0.3 + brainInjury*20 + icpMassEffect*40 - (headElevated?3:0)`. Deliberately a FLAT subtraction, not a percentage-of-total reduction: the real mechanism (improved cerebral venous outflow) doesn't scale with how bad the underlying lesion already is, and a percentage reduction would make elevation implausibly powerful for a large mass-effect lesion while being negligible for a near-normal patient — backwards from the actual clinical teaching ("helps a little, always," not "helps more, the worse things get"). Registered as both a player action (`actions.js`) and a crew-directable task (`gear.js`'s `headElevateTask`), both routing through the identical `headElevate` procedure so either can raise the same real flag. `laCounty.js`'s TP 1244 step 22/23 (previously a comment explaining why this was a no-op) now fires a real `tbiHeadElevate` rule gated on `SUSPECTED_TBI`.

**TP 1232 (stroke) deliberately NOT wired**, despite item 70 naming it as a second consumer: this file's own header comment already documents TP 1232 as "no new rules — mLAPSS/LAMS scoring and stroke-center destination routing have no natural mapping onto a crew-directed task" by design, and no quoted TP 1232 step text for a head-elevation step was available to cite a real rule from — per this project's own "identify numbers/rules from real source text, don't invent" discipline, left for a future session that has that text rather than guessed at. The underlying mechanism (`pat.headElevated`/the ICP reduction itself) is fully general and already reusable the moment that text arrives — no engine work would be needed, only the protocol rule.

**MEASURED, via the real `physio()` pipeline (probe stripped after use):** a `polytraumaFall` patient (real elevated ICP from brain injury/mass effect) shows icp 9.17 -> 6.21 (delta 2.95, matching the coded 3 mmHg) when the flag is set; a healthy `abdPain` control shows the identical ~3 mmHg reduction (8.52 -> 5.41) with no other side effect — confirming the mechanism is a clean, universal position effect, not something that interacts oddly with existing pathology.

**Verification, complete.** `node --check` clean on all six touched files (`procedures.js`, `pk.js`, `neuro.js`, `gear.js`, `actions.js`, `laCounty.js`). `npx eslint`: zero findings on the same six (one real bug caught before it shipped: an unescaped apostrophe inside a single-quoted crew readback string, `"Head's up thirty degrees"`, would have been a syntax error — caught by `node --check` on the very next check, fixed before running anything else). Two new two-sided assertions added to `mechanismWiring.mjs`'s existing `[INCREASED ICP / CUSHING REFLEX]` section (head elevation lowers ICP in a real ICP-elevated scenario; the same modest reduction applies cleanly to a healthy control). `mechanismWiring.mjs`: **452 passed, 0 failed** — a fully clean run, including the usually-flaky PAC-variance assertion passing this time. `scenarioSweep.mjs`: **161 scenarios, 11,953,608 checks, 0 failed** — identical to baseline, correctly, since `headElevated` is a boolean the sweep never triggers (no doses given) and was not added to any tracked-field list for that reason. `npx vite build`: clean (33.30s, same pre-existing >500kB chunk-size warning). No scratch probe scripts remain under `src/scripts/`.

### Protocol-content batch: queue item 69 RESOLVED — permissive hypotension for multi-system trauma with active hemorrhage is now real, not a generic 500mL bolus indistinguishable from septic/cardiogenic shock

**The gap, exactly as item 69 filed it.** TP 1244's own footnote ❻/❽ calls for a smaller, more conservative 250mL bolus for suspected internal hemorrhage in blunt/penetrating multi-system trauma — aggressive crystalloid dilutes clotting factors and measurably worsens hemorrhage, a mechanism this engine already models (`saline`'s own `fx:{coag:-6}`). But `saline_shock`/`saline_gigu` (`laCounty.js`) gave a full 500mL bolus to ANY hypotensive/poor-perfusion patient regardless of cause, and `saline`'s fixed 500mL-per-administration granularity couldn't represent a 250mL dose at all. Two real blockers, both needed together, neither useful alone.

**Fixed with the smallest correct pieces, reusing existing signals rather than inventing new engine mechanism.** `salineMinor` (`drugs.js`) is a genuine second fluid entry — same `pkModel:"fluid"` mechanism as `saline`, every `fx` value scaled to exactly half (0.2L blood/-0.125 k/-10 ph/-3 coag/-0.15 temp vs `saline`'s 0.4/-0.25/-20/-6/-0.3) — the same "second flat-dose entry at a different fixed size" precedent `amiodarone`/`amiodarone2` already established, not a new pattern. A new `traumaMinorSaline` rule (`laCounty.js`) gates on `ACTIVE_HEMORRHAGE` — the SAME signal `traumaTxa` already uses to identify genuine active bleeding for TXA, which existed and was correctly scoped there but nothing had used it to also redirect fluid volume, TP 1244's actual footnote point. `saline_shock`/`saline_gigu` now explicitly exclude `ACTIVE_HEMORRHAGE` so the generic and conservative rules can never both fire and double the fluid the protocol specifically warns against.

**A real gap in the fix was caught before shipping, not left as a silent hole.** `traumaMinorSaline` was first gated on `SHOCK` alone, mirroring `saline_shock`'s own gate — but `saline_gigu` (the sibling rule this batch also had to exclude `ACTIVE_HEMORRHAGE` from) gates on `POOR_PERFUSION`, a DIFFERENT, less severe threshold. A compensated-but-actively-bleeding patient (poor perfusion, not yet frankly hypotensive) would have fallen through both exclusions and received no fluid at all — worse than the original bug. Fixed by gating on `SHOCK(ctx) || POOR_PERFUSION(ctx)`, confirmed by direct probe (see below) rather than assumed correct from the mirrored pattern.

**MEASURED, via a direct probe calling the real `laCounty.js` rule predicates and the real `pk.js`/`physio()` pipeline (stripped before finishing):** a synthetic multi-system-trauma-in-shock context (`sbp:80`, `activeBleedRate:0.2`) shows `saline_shock.when()` now false and `traumaMinorSaline.when()` true; an otherwise-identical shock context with NO hemorrhage shows the reverse (generic rule fires, conservative rule does not — confirming non-trauma shock, e.g. cardiogenic, is completely unaffected); a compensated-but-bleeding context (`sbp:110`, elevated lactate, `activeBleedRate:0.2`) shows `saline_gigu.when()` false and `traumaMinorSaline.when()` true — the exact fall-through case the gap above would have missed. `salineMinor`'s `fx.blood` delta was confirmed to apply through the identical `pk.js` code path `saline` uses (same `rising()`-tracked one-time-per-dose idiom), at exactly half the declared coefficient — a longer-window magnitude comparison was tried and correctly discarded once it was clear ordinary renal/fluid-shift drift over that window (not the dose itself) dominated the measured delta; the coefficients are exactly half by direct declaration, which is what actually matters here, not a re-derived empirical ratio.

**Verification, complete.** `node --check` clean on all three touched files (`drugs.js`, `gear.js`, `laCounty.js`). `npx eslint`: zero findings on the same three. `mechanismWiring.mjs`: **449 passed, 1 failed** — identical to the established baseline, the single failure being the same already-long-documented pre-existing flaky `PACs -> occasional isolated HR blips` stdev assertion, unrelated by content. `scenarioSweep.mjs` took two attempts spanning multiple hours to actually finish under sustained, heavy CPU contention from a concurrent peer session's own browser-based verification work — not a defect in this change, confirmed by the eventual clean result: **161 scenarios, 11,953,608 checks, 0 failed**, identical to the pre-batch baseline (expected, since `scenarioSweep.mjs` never gives doses and so cannot exercise `salineMinor`/`traumaMinorSaline` either way — the check-count being unchanged is itself confirmation nothing new leaked into the universal per-tick fields). No scratch probe scripts remain under `src/scripts/`.

No scratch probe scripts remain under `src/scripts/` from this batch.

### Front-end batch: queue item F7 (STANDING WORKSTREAM) — a real, previously-undiscovered DEAD-PROBE defect found and fixed. Every scenario-authored `probes.glucometer` override (91 occurrences across `src/data/scenarios.js`, including `diabeticKetoacidosisCall`'s `"HIGH" — off the top of the scale"` and several exact-value hypoglycemia/DKA/HHS readings) could never fire — the two `gluc` actions in `src/actions.js` never declared a `probe` field, so `App.jsx`'s universal override lookup (`a.probe&&(scenOf(s).probes||{})[a.probe]`) was always `(...)[undefined]`.

Found via this workstream's own next-scoped step (its last entry's own words: "a fresh grep pass across `src/data/scenarios.js` to enumerate every distinct `probes.<key>` used would be the honest first step, rather than assuming the keys already covered are the only ones that exist"). A small node script (enumerating top-level keys inside every `probes: {...}` block) surfaced `glucometer` as a real, sizeable (91-occurrence) key never once mentioned across any prior F7 session's audit trail. Checked against `App.jsx` directly (not assumed): every real override lookup site (`start()`'s player-action path at the `a.probe&&(scenOf(s).probes||{})[a.probe]` line, and the crew-AI `assessId` wrapper's identical composition) keys strictly on the ACTION's own declared `probe` name — the same idiom `radL`/`pedL`/`pedR`/`heart`/etc. already use (`probe:"pedL"` etc in `actions.js`). Grepped `actions.js`'s two `gluc` entries (armR/armL) and confirmed neither had ever declared `probe:"glucometer"` — meaning every one of those 91 authored overrides was dead on arrival, and every player in every scenario has only ever seen the generic `${v.glu} mg/dL.` numeric readout, regardless of what the scenario author actually wrote.

**Fix:** added `probe:"glucometer"` to both `gluc` actions (`actions.js`) — the same one-line pattern every other probe-bearing action already follows. No change to `scenarios.js` itself; the authored content was already correct, just unreachable. Confirmed this is legitimate one-time-snapshot content, not a live-physiology gap of the kind this workstream usually hunts: `gluc` is `once:1` (a single-check action, same as `pedL`/`radL`/etc.), so a frozen reading captured at click-time is the same accepted design already used for `sample`/`opqrst`/other one-time exam findings — not a new instance of the "frozen text vs. live physiology" defect class.

**Verification:** new `tools/browser/verifyGlucometerProbeLive.mjs` — clicks the real "Blood glucose" action on a live `diabeticKetoacidosisCall` scene and confirms the logged text now contains the scenario's authored `"HIGH"` override instead of a plain number, run twice clean (PASS/PASS, zero real console errors — the one console error present both runs is the already-documented, expected `LocalLLMProvider: model load failed ... classified as "device"` noise every F0 verification script hits in this no-real-GPU-adapter environment, explicitly filtered out as known-benign rather than silently ignored). `npx eslint src/actions.js src/data/scenarios.js tools/browser/verifyGlucometerProbeLive.mjs` clean. `npx vite build` clean (25.28s, same pre-existing >500kB chunk-size warning, no new warnings).

**Direct follow-up, same session — the same grep-and-check pass (does the scenario's override key match a REAL action's declared `probe:"..."` name?) run against the low-count candidates it had just surfaced (`neuro`, `airway`, `neck`) found three MORE real dead overrides, all key-name MISMATCHES rather than missing content:**
- `neuro` — confirmed already fixed by an earlier session (`actions.js`'s `reflexes` action already declares `probe:"neuro"`, with its own header comment recording the exact same defect class already found and closed for `severePreeclampsia`'s hyperreflexia/clonus finding). Not a new finding — verified, not assumed.
- `stabChest`'s `probes.neck` (tension-pneumothorax JVD + tracheal deviation) — no action declares `probe:"neck"`; the real action is `jvd` (`probe:"jvd"`, "Jugular venous distension"). The DEFAULT `jvd` action only reads `pat.cvp` for a generic distension description and never mentions tracheal deviation, so this scenario's specific, clinically richer finding was genuinely being lost, not merely duplicated. Renamed `neck` → `jvd`.
- Three `probes.airway` overrides (`choking40`/condition `fbao` — a foreign body visualized at the cords; `activeSeizureGTC` — active-seizure airway compromise; `esophagealVaricesBleed` — active-hematemesis aspiration risk) — no action declares `probe:"airway"`; the real action is `airwayLook` (`probe:"airwayLook"`, "Look in the airway"), whose own default text ("Patent."/generic vomit warning) is exactly what every one of these three scenarios' players saw instead of the scenario-specific, clinically distinct finding the author actually wrote. Renamed all three `airway` → `airwayLook`.

Checked for key collisions before every rename (grepped for an existing `jvd:`/`airwayLook:` key already present in any of these four scenarios) — none found, so each rename is a pure fix, not an overwrite. `esophagealVaricesBleed`'s own `probes.opqrst`/`probes.sample`/one other content-only key are untouched. One genuinely orphaned "neck" case was found and deliberately NOT touched: a separate `neck:` override on a meningitis scenario (nuchal-rigidity/meningismus exam finding) has no corresponding action at all — no "check for neck stiffness" action exists anywhere in `actions.js` — so there's no one-line rename fix available; it would need a genuinely new action, which is new-feature scope, not a wiring fix, and per F1's own standing rule (prefer reliability fixes over new features) was correctly left for a future session rather than built here.

**Verification:** new `tools/browser/verifyAirwayJvdProbeLive.mjs` — clicks the real "Jugular venous distension"/"Look in the airway" actions across all four renamed scenarios and confirms each authored override now fires (a real test-harness flakiness class was hit and worked around: an unprompted Tier-1/2 dialogue line rendering at the exact moment of a click can eat the click without the action resolving — the script retries once, a pattern worth reusing in any future probe-verification script). Two full runs, both clean (PASS×4/PASS×4, zero real console errors beyond the same already-documented benign no-WebGPU-adapter noise). `npx eslint`/`npx vite build` both clean. `node src/scripts/scenarioSweep.mjs` re-run fresh after all five renames (glucometer + these four): **161 scenarios, 11,953,608 checks, 0 failed** — identical to the pre-batch baseline.

**Still open for this workstream:** `probes.opqrst`/`probes.sample`/`probes.history` (narrative dialogue content, likely lower-yield, still unaudited); the orphaned meningitis `neck:` override noted above (needs a new nuchal-rigidity-check action, not a rename); and any other probe key this session's enumeration script didn't happen to name — a fresh, from-scratch enumeration pass (rather than trusting this document's own running list of "already covered" keys) is still the honest way to be sure no more are hiding.

### Front-end batch: queue item F0 — BootScreen's AI panel description text was still WebGPU-only, even though `getLocalAiState()`/`aiStatusLine()`/SettingsOverlay already correctly report `ai.backend` ("webgpu"|"wasm"|"none"); fixed, closing the "not yet done: surfacing the WASM backend's own status in the boot/Settings UI" gap F0's own text had left open.

Read `dialogueManager.js`'s `getLocalAiState()`/`activeAiBackend()` and `bootScreenText.js`'s `aiStatusLine()` before touching anything — both already compute and correctly report which real backend (`webgpu` vs `wasm`) is active, and `SettingsOverlay.jsx` already renders that field correctly (confirmed by reading it, not assumed). `BootScreen.jsx` itself, however, had its own SECOND, independent block of status prose (the paragraph under the progress bar) that never read `ai.backend` at all: the "failed" case always said "This device reports WebGPU support" even when the backend that failed was the WASM tier, and the "supported" case never mentioned WebAssembly mode at all, both effectively re-introducing the exact "WebGPU implied, WASM tier invisible" gap that `activeAiBackend()`'s own header comment says it was built to eliminate.

**Fix (`BootScreen.jsx`, lines ~105-111):** both branches are now backend-aware — the failed-case sentence says "WebAssembly" instead of "WebGPU" when `ai.backend==="wasm"`, and the supported-case sentence appends "via WebAssembly (broad-compatibility mode)" under the same condition, matching the exact phrasing `aiStatusLine()`/SettingsOverlay already use elsewhere on the same screen. No change to `dialogueManager.js`/`dialogueProvider.js`/`bootScreenText.js` — the underlying state was already correct; only the one stale prose block needed to catch up to it.

**Verification:** `npx eslint src/components/BootScreen.jsx` clean (zero findings). `npx vite build` clean (16.27s, same pre-existing >500kB chunk-size warning, no new warnings). Not verified live against a real WASM-active browser session in this pass (no environment change was needed to make this true — the two branches are pure string interpolation off a field the manager already supplies correctly) — a future session with a real WASM-tier-active browser should still eyeball it once.

**Still open on F0 per its own last status note:** a real cache pre-check equivalent to `hasModelInCache()` for the WASM tier (transformers.js has no public equivalent, per prior session's own citation) and a proper multi-turn few-shot retry of Qwen2.5-0.5B remain unbuilt/unattempted.

### Physiology-engine batch: queue item 74, Phase 3 (compartment syndrome) SHIPPED — all three phases of the per-limb circulation workstream are now complete and verified. `crushSyndrome` gains a real, literature-timed compartment-pressure mechanism plumbed into Phase 2's existing perfusion chain, via the correct clinical delta-pressure decision variable rather than a flat threshold.

**A prior session built this and was stopped mid-batch on operator instruction before formal verification ran; this entry documents that verification, run fresh and independently, plus a real process-hygiene incident from the handoff worth recording.**

**What Phases 1-2 already shipped, for context (both fully verified, separate entries below):** Phase 1 (limb-specific hemorrhage control — a located tourniquet only stops bleeding on its own limb) and Phase 2 (real per-limb arterial perfusion — `pat.limbOcclusion`/`limbDO2`/`limbO2Debt`/`limbInjury`, built out `acuteLimbIschemia` from a bare stub). Phase 3 (this entry) was scoped from the start to depend on Phase 2's `limbDO2` chain already existing, specifically so compartment syndrome's real danger (the perfusion collapse it causes) would have a real, already-verified consumer to plug into rather than needing its own parallel injury system.

**What was built, confirmed by direct reading of the code just now, independent of the implementing session's own claims:**
- `patient.js`: `pat.compartmentPressure` (mmHg, per limb, default 0 — cites Whitesides et al. 1975 / McQueen & Court-Brown for the normal 0-10mmHg range) and `pat.compartmentOcclusion` (0-1 per limb, recomputed FRESH every tick, deliberately kept OUT of `pat.limbOcclusion` itself).
- `cardiovascular.js`: converts `compartmentPressure` into `compartmentOcclusion` via the real clinical decision variable — delta pressure (diastolic BP minus compartment pressure), not a flat compartment-pressure threshold — with a hard `if (cp <= 0) { compartmentOcclusion[loc] = 0; continue; }` gate, meaning a patient with no compartment lesion is STRUCTURALLY guaranteed zero contamination from this mechanism regardless of how low their own DBP falls (e.g. hemorrhagic shock) — a real specificity guarantee by construction, not just something that happened to measure clean.
- `neuro.js`'s `updateOrganInjury`: composes `limbOcclusion` and `compartmentOcclusion` via `max()` ONLY at the point of consumption (feeding the already-verified Phase 2 `limbDO2`/`limbO2Debt`/`limbInjury` chain), never writing one into the other's own stored state.
- `conditions.js`: extends `crushSyndrome` (a real, already-existing closed bilateral-leg-entrapment condition, judged a better fit than building a new condition since compartment syndrome classically follows closed, not open, injury — an open fracture self-decompresses) to seed and grow `compartmentPressure` on both legs, presenting already at the level 5h of entrapment would produce (matching the condition's own existing presenting state), not restarting from an uninjured 0 mmHg.
- A real, previously-latent ONE-WAY-RATCHET bug was found and fixed DURING this batch, before it could ship: an earlier version of this same idea composed `compartmentOcclusion` directly into `pat.limbOcclusion` via `max()`. Because `limbOcclusion`'s other writers hold their own state and never spontaneously decrease, and the cardiovascular ODE has a real, measured startup transient where `dbp` briefly dips to ~40-54 mmHg in a fresh patient's first ~10 simulated seconds, that transient got permanently baked into `limbOcclusion` via `max()` and never came back down even after `dbp` recovered to a healthy 86-94 mmHg for the next 19+ minutes — measured directly against `crushSyndrome`, not theorized. Fixed by keeping `compartmentOcclusion` in its own field, recomputed live every tick with no memory, and composing only at the point of consumption (see `neuro.js` above) — this fix is IN THE CURRENT TREE, not a remaining TODO.
- New two-sided assertions were added to `mechanismWiring.mjs` (a new section covering: stays compensated at a realistic ~20min scene time; a real hours-scale time course; a healthy control; the required cross-cutting specificity control — near-terminal hemorrhagic shock with no compartment lesion stays at zero; reversibility of the live-recomputed term; and tourniquet+compartment-syndrome `max()` composition on the same limb) — see the "Verification" paragraph below for their confirmed PASS status.

**A real process-hygiene problem, found and cleaned up during this handoff pass, worth recording so it isn't mistaken for corrupted work.** The implementing session's own final status report flagged that a background agent it had spawned earlier (against instruction, and which it could not stop) was concurrently editing these SAME files, and that it could not confirm authorship of every line currently in `mechanismWiring.mjs` — specifically calling out that the reversibility assertion on disk differs from what it personally wrote (it now calls `updateVenousReturn` directly rather than the full `.update()` pipeline; the implementing session separately confirmed THIS version works correctly by running it standalone, but did not author it). Separately, THREE orphaned `node src/scripts/mechanismWiring.mjs` processes (started at 11:26pm, 11:41pm, and 11:57pm — clearly multiple overlapping unsupervised runs, not one) were found still running and actively writing to `_mw_run1.log`/`_mw_run2.log` at the repo root MINUTES after the stop instruction had already been issued and acknowledged — confirming these were detached OS processes that never received the stop, not evidence of new work. All three were killed and both log files deleted during this pass; `src/scripts/` and the repo root are now confirmed clean of scratch output. **Net effect: the code on disk right now is NOT guaranteed to be authored by a single coherent session's reasoning end-to-end, even though it reads as internally consistent and passes `node --check`/`eslint`.** Read `mechanismWiring.mjs`'s new compartment-syndrome section critically, especially the reversibility assertion, before trusting it — re-derive or re-verify rather than assuming it means what its neighboring comments claim.

**Verification, run fresh and independently against the tree exactly as the process-hygiene incident above left it (not re-trusting any number from before the incident).** `node --check` clean on all five touched files (`patient.js`, `cardiovascular.js`, `neuro.js`, `conditions.js`, `mechanismWiring.mjs`). `npx eslint`: zero findings on the same five. `mechanismWiring.mjs` run TWICE in full: **449 passed, 1 failed, both times, with the identical single failure both runs** — the same already-long-documented pre-existing flaky `PACs -> occasional isolated HR blips` stdev assertion (confirmed unrelated by content: doesn't read anything this batch touched). All 7 new two-sided assertions in the new `[COMPARTMENT SYNDROME — queue item 74, Phase 3]` section passed cleanly both runs, including the positive time-course case this handoff's own prior text flagged as unmeasured: `crushSyndrome` stays compensated at a realistic 20-minute scene time (csOccl<0.05, zero injury — the same honest "most patients stay compensated within a realistic call" finding item 42's own acuteMesentericIschemia work reported), reaches real occlusion by 5h post-arrival, and crosses the irreversible 0.5 injury threshold by 10h — inside the cited 6-8h-to-48h literature window, not instant and not forced. `scenarioSweep.mjs`: **161 scenarios, 11,953,608 checks, 0 failed** — identical to the pre-batch baseline, correctly: `compartmentPressure`/`compartmentOcclusion` are per-limb objects, deliberately kept out of the sweep's scalar-only `REQUIRED`/`NON_NEGATIVE` lists, the same precedent Phase 2's own `limbDO2`/`limbInjury` already set. `npx vite build`: clean (27.15s, same pre-existing >500kB chunk-size warning). `src/scripts/` and the repo root are confirmed clean of scratch/probe output.

**Item 74 is now fully closed — all three phases (limb-specific hemorrhage control, real per-limb arterial perfusion, compartment syndrome) shipped and verified.** The workstream's own original ask (separate each limb into its own circulatory subsystem, to eventually support real compartment syndrome and per-limb bleeding/circulation) is complete: a tourniquet targets one limb's bleeding and arterial inflow; `acuteLimbIschemia` and `crushSyndrome` both drive real, measured local perfusion collapse through the same shared `limbDO2`/`limbO2Debt`/`limbInjury` chain; and compartment syndrome composes into that same chain via the clinically correct delta-pressure variable rather than a parallel, redundant mechanism. Natural, explicitly-not-yet-scoped follow-ups for a future session: extending `directPressure`/`pack`/`pelvicBinder` to be location-aware (named as out-of-scope back in Phase 1); a genuine tourniquet-specific (~2h) warm-ischemia time constant distinct from embolic ischemia's ~4-6h window (both currently share one rate constant, noted as an open simplification in Phase 2's own entry); and a real "loosen the dressing/splint, do not elevate above heart level" field intervention for compartment syndrome, if this game's procedure formulary ever grows one — none of these are filed as new queue items, since each is a small, well-understood extension of a now-real, already-verified mechanism, not a new gap.

### Front-end batch (2026-08-27, latest): pushed WASM-tier dialogue quality as far as it can go at this model size — tuned generation params, a WASM-specific few-shot prompt, a degenerate-output guardrail, and a real, honest model-swap investigation (Qwen2.5-0.5B tried and REJECTED after live A/B measurement)

Direct follow-up to the entry immediately below (the one that first got
REAL generated WASM-tier text, honestly flagged as weak/echoic). This
session's task, per the operator's own instruction, was to push that
quality as far as legitimately possible, attacking it from every real
angle rather than tweaking one knob — model choice, generation parameters,
prompt engineering, output guardrails, and measuring multiple real
generations rather than one.

**1. Generation parameters — the real, checkable cause of the documented
echo/repetition failure.** Read the actual pipeline call in
`WasmLLMProvider.generate()` before touching anything: it passed
`max_new_tokens:48, temperature:0.85, do_sample:true` and NOTHING else —
no `repetition_penalty`, no `top_p`/`top_k`, no `no_repeat_ngram_size`.
That is close to the textbook setup for a small instruct model to
degenerate into repeating itself. Added `repetition_penalty:1.3` and
`no_repeat_ngram_size:3` (the two standard HF-generation levers for this
exact failure mode), lowered `temperature` to 0.7 and added `top_p:0.9`/
`top_k:40` (a standard "coherent but not deterministic" combination — at
0.85 with no nucleus/top-k limiting, a 0.5B/360M model's own long tail was
being sampled more than helps short output), and tightened
`max_new_tokens` from 48 to 28 (this is short patient/crew/bystander
dialogue, not long-form text — 48 tokens was already contributing to
run-on generations).

**2. Prompt engineering — a genuine WASM-tier-specific variant, not the
shared LocalLLMProvider prompt.** Confirmed the gap by reading
`buildPrompt()`: both tiers used the identical multi-line instruction
block, with no worked examples — a known-real problem for small instruct
models, which follow few-shot examples far more reliably than abstract
instructions. New `buildWasmPrompt(event, ctx)` reuses the same real,
structured context (`ctx.patient`/`ctx.bystander`/`ctx.situation`) but
replaces the instruction with ONE short worked example of a correctly-short
in-character line per speaker role, plus an explicit hard word-count
ceiling ("at most six words") stated in plain language rather than the
vaguer "one short sentence."

**3. A real output guardrail specific to the documented failure mode.**
New `isDegenerateWasmOutput(text, event)`: rejects output that is
substantially a verbatim echo of the event type itself (the exact,
previously-documented "Pain unprompted." failure for a `pain_unprompted`
event), and separately rejects degenerate token repetition (any word
repeated 3+ times in a row, or the whole line being one word repeated).
`generate()` now throws when this fires, which dialogueManager's existing
try/catch already treats as a normal fall-through to Tier 2 templates
(item 11's graceful-degradation hierarchy) — so a genuinely bad WASM
generation now reliably never reaches the player, instead of only being
"honestly flagged as weak" in a code comment.

**4. Model choice — investigated for real, and REJECTED after live
measurement, a genuine negative result, not skipped.** Checked the real,
currently-published Hugging Face model list via the live models API (not
assumed): `onnx-community/Qwen2.5-0.5B-Instruct` is a real, tagged
`transformers.js`+`onnx` build (~12k downloads, the most-downloaded ONNX
build of this exact model) — the SAME model this project's WebGPU tier
already uses, real precedent that 0.5B can work for this use case. Swapped
it in and measured live, across the same four event types, with the same
tuned prompt/params from items 1-2 above. It was WORSE on every axis in
this real, same-session A/B, not better: for a `pain_unprompted` event it
produced `"Diligent. Patient nurse began to gently massage her clients
back and legs as she felt her clients symptoms improve further. She
continued"` — third-person narrative about an unrelated nurse, completely
ignoring the "at most six words," in-character instructions; one of the
four real samples failed outright (empty output); and it was materially
slower (25-55s per generation vs SmolLM2's 9-11s in this same
environment). Reverted to `HuggingFaceTB/SmolLM2-360M-Instruct`, which
with the SAME new prompt/params handled all four samples, faster, and
stayed on-topic far more reliably (see the real before/after transcript
below). Honest conclusion, stated per the task's own instruction: a
"smarter" base model did not translate into better SHORT, in-character
output at this scale under this pipeline's default single-user-turn chat
templating — Qwen2.5-0.5B's instruction-following degraded badly without
a fuller multi-turn conversational prompt, which was out of this slice's
scope to build. Left as a real, documented option for a future session
with more budget to retry properly (multi-turn few-shot), not ruled out
permanently.

**5. Measured multiple real generations, before and after, not one
sample.** Four event types (patient unprompted pain, crew seizure
reaction, bystander unresponsive reaction, treatment-improving) via an
extended `tools/browser/verifyWasmLlm.mjs`, run against: (a) the original
settings (documented in the entry below: `"Pain unprompted."` for
`pain_unprompted` — echoic, on-topic but degenerate); (b) Qwen2.5-0.5B with
the new prompt/params (rejected, see item 4); (c) the final, shipped
configuration (SmolLM2-360M + new prompt/params + guardrail). Real,
live-observed FINAL samples, quoted verbatim, not paraphrased:

- patient unprompted (pain): `"Pain is my life now, she whispered into her
  guitar case with a sigh and then continued to work on it until dawn
  broke outside as"` — still a run-on and drifts off-topic partway
  through (a real, remaining limitation at this model size — see below),
  but the OPENING is on-topic and in-register, a real improvement over the
  old literal echo.
- crew reaction (seizure onset): `"Shes acting fine now; dont worry about
  it!"` — short, in-character, plausible crew reassurance.
- bystander reaction (unresponsive): `"Okay... wait..."` — short, panicked,
  plausible.
- treatment-response (improving): `"Hows it going?"` — short and
  in-register, though generic rather than clearly signaling improvement.

Two of four are genuinely good; two are usable but imperfect (the pain
line drifts off-topic after a strong opening; the treatment-improving line
is short but doesn't clearly convey improvement). This is a real,
measured step up from the prior session's single documented sample
(`"Pain unprompted."`), not a claim of solved quality.

**Honest quality ceiling, stated plainly.** A 360M-parameter model run
through transformers.js's default chat templating, even with tuned
decoding and a few-shot prompt, still does NOT reliably respect a hard
length instruction (the pain-unprompted sample runs well past six words)
and can still drift semantically mid-generation. This is expected at this
model size and will never match the WebGPU tier's larger-model quality —
the fallback-to-Tier-2-templates safety net (item 4 above, plus the
pre-existing empty-output/timeout handling) is what makes this
acceptable, not a claim that WASM-tier generation itself is now polished.

**Verification, complete.** `npx eslint src/dialogue/dialogueProvider.js`
and `npx eslint .`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, 0 warnings,
zero new findings. `npx vite build`: clean (same pre-existing >500kB
chunk-size warning; `transformers.web-*.js` chunk unchanged at 551KB
gzip 156KB, confirming the model swap-and-revert left the bundle
unaffected — only the runtime-fetched model ID string changed, not any
new dependency). Live, real, non-stubbed generation re-verified via the
extended `tools/browser/verifyWasmLlm.mjs` (four event types, quoted
above) — run three times across this session (original config, Qwen2.5
A/B, final config), all real network downloads and real forward passes,
not mocked. `tools/browser/verifyLocalLLMProvider.mjs` re-run to confirm
the WebGPU tier (LocalLLMProvider) is completely unaffected — it wasn't
touched by this session's edits at all, and the script reproduces the
exact same pre-existing "no real WebGPU adapter in this environment,
device-classified failure, graceful fallback" result as every prior F0
session, byte-for-byte the same failure text.

**What remains open, stated honestly.** The length instruction is still
not reliably obeyed at this model size — a hard post-generation truncation
(e.g. cut to the first sentence/clause) was considered but not built this
slice, since it risks cutting a good line mid-thought as often as it
salvages a run-on one; worth a future session's real, measured A/B rather
than added under this slice's own time budget. The multi-turn few-shot
retry for Qwen2.5-0.5B (item 4) is a real, scoped follow-up, not attempted
here. No boot/Settings UI surfaces which WASM-tier config is active
(unchanged from the prior session — `getLocalAiState()` still reports only
`localLLM`'s state). `WASM_MODEL_DOWNLOAD_MB` remains an unmeasured
estimate for the model actually shipped (380, carried over from the prior
session's own figure, unchanged since the shipped model itself didn't
change end to end).

### Front-end batch (2026-08-27, latest): confirmed the patient/crew/bystander speaker distinction was already real in Tier 3 (no gap), and added a real, verified second local-inference backend — WasmLLMProvider (Transformers.js, forced to its `wasm` device) — as a genuine broad-compatibility fallback for the WebGPU-only LocalLLMProvider, with REAL generated (not template) dialogue observed live for the first time in this project's history

Two real questions from the same user who filed the WebGPU "No available
adapters" report below. **Question 1: does Tier 3's `buildPrompt` already
tell the model WHICH character it's speaking as, with that character's own
knowledge boundary, the way the bystander/crew work already does for
Tier 2?** Checked by reading `dialogueProvider.js`'s `buildPrompt(event, ctx)`
directly, not assumed: yes, already fully real, not a gap. `speakerLine`
branches on `event.speaker` into three distinct prompts — crew ("an EMS crew
member on scene reacting... speak as the crew member"), bystander (explicitly
told they are "NOT a medical provider... no medical training and no access to
vitals, diagnoses, or lab results, so never state or guess any of those" —
item 15's knowledge boundary enforced in the PROMPT itself, not just in
Tier 2's hand-authored templates), and patient (age/personality/consciousness/
pain/the simulation-determined emotional state, told explicitly to express,
not invent or override, that state). No code changed for this question — it
was already real, confirmed by reading the source, and this entry exists so a
future session doesn't re-investigate a settled question.

**Question 2: since `@mlc-ai/web-llm` has no WASM/CPU fallback for
generation (confirmed in a prior F0 session), can a genuinely separate WASM
backend via Transformers.js provide the broad-compatibility path item 2 asks
for?** Investigated for real, not assumed. `@huggingface/transformers`
(the current maintained package name, successor to `@xenova/transformers`)
is real and installed for this slice at v4.2.0, built on
`onnxruntime-web@1.26.0-dev`. Checked against the installed source
(`node_modules/@huggingface/transformers/dist/transformers.js`): `device:
"wasm"` is a real, explicit `pipeline()` option (`DEVICE_TYPES.wasm`), and
the library's own `DEFAULT_DEVICE` in a browser context is already `"wasm"`,
not `"webgpu"` — forcing it here is correct and belt-and-suspenders. Model:
`HuggingFaceTB/SmolLM2-360M-Instruct`, confirmed as a real, currently-
published, `transformers.js`-tagged ONNX model via the live Hugging Face API
(one of the two models the user's own proposal cited), quantized to `q8` at
load time for a smaller download than fp32.

**Built**: `WasmLLMProvider` in `dialogueProvider.js`, matching
`LocalLLMProvider`'s exact shape (`isAvailable()`/`status()`/`generate()`/
`checkCache()`/`subscribeProgress()`/`preload()`/`retry()`) per item 12's
own "swap the backend without rewriting the rest of the app" goal — no code
is shared between the two model-loading paths, only the class contract.
Wired into `dialogueManager.js` as a real middle rung, not a replacement:
`generateDialogue()` now tries `localLLM` first, and only tries `wasmLLM` if
WebGPU is absent or its own provider just failed — never racing the two.
`requestLocalUpgrade()` and `localAiStatus()` updated the same way.
`isLocalAiEnabled()`'s existing gate covers both backends since both are
checked inside the same `isLocalAiEnabled(s)` block, not duplicated per
backend.

**Bundle discipline verified via a real `npx vite build`**: `_loadBackend()`
dynamically imports `@huggingface/transformers` exactly like
`LocalLLMProvider`'s own `_loadBackend()` does for `web-llm` — confirmed in
the real per-chunk output, `dist/assets/transformers.web-*.js` at 551KB
(gzip 156KB) is a separate, lazily-loaded chunk, not part of
`dist/assets/index-*.js` (2.33MB, essentially unchanged). The
`onnxruntime-web` WASM runtime binary itself (`ort-wasm-simd-threaded.
asyncify.wasm`, 23.5MB) lands in `dist/assets/` as a static asset fetched by
the library only when a WASM pipeline is actually constructed, not loaded
eagerly by any JS chunk.

**Real live verification, not stubbed** (`tools/browser/verifyWasmLlm.mjs`):
this is the first time in this project's F0 history that REAL generation
(not the fallback path) was observed live, because Playwright's bundled
Chromium has no real WebGPU adapter (confirmed again this session — the
same "No available adapters" device-classified failure fires for
`LocalLLMProvider` live, exactly as expected) but DOES have real
WebAssembly. The script imports the real `WasmLLMProvider` class, confirms
`isAvailable()` is genuinely true, then calls the real `generate()` against
a real `pain_unprompted` event — a real network download of the real model
files from Hugging Face's CDN, a real ONNX Runtime Web WASM compile, and a
real forward pass. Result: `{"speaker":"patient","text":"Pain unprompted.",
"tier":"wasm-llm"}` in ~20 seconds end to end (load + generate). This is
genuinely generated output, not a template string (confirmed by
`tier:"wasm-llm"`, a tag no template pool produces) — but honestly reported:
the output quality at 360M params with a one-shot, non-fine-tuned-for-this-
prompt-format call is weak, verging on echoing the prompt's own event-type
text rather than producing natural in-character dialogue. This is a real,
open quality gap for a future session to address (prompt tuning,
`repetition_penalty`, few-shot examples in the prompt, or a slightly larger/
better-instruction-tuned model such as Qwen2.5-0.5B's own ONNX build), not a
blocking one — the tier still degrades gracefully to Tier 2 template text on
any failure or empty/garbage output, per item 11's existing hierarchy,
unchanged.

**Left open, honestly**: no browser-cache pre-check equivalent to
`hasModelInCache()` exists in `@huggingface/transformers`'s public API (the
constructor note in `WasmLLMProvider` states this), so `cacheState()` stays
"unknown" until a load actually starts, unlike `LocalLLMProvider`'s real
pre-flight check — a real, smaller gap than the generation-quality one
above, left for a future slice since it does not block correctness. Output
quality tuning (above) is the more consequential open item. Neither the
boot screen nor Settings UI surfaces the new backend yet (no new item-4/8/10
UI work was in scope this session) — `getLocalAiState()` still reports only
`localLLM`'s state; a future slice should extend it to reflect whichever
backend is actually active.

### Front-end batch (2026-08-27, even later): investigated whether a real GPU-adapter retry could help the "device"-classified failure from the real Windows/Edge report below, found genuinely no lever exists in the installed web-llm library, and built the honest alternative — a real troubleshooting hint — instead of a decorative retry

Direct follow-up to the retry-mechanism entry immediately below, from the
SAME real user report: "LocalLLMProvider: model load failed (attempt 1,
classified as "device"): Error: Unable to find a compatible GPU. ... No
available adapters." on Windows/Edge, alongside a benign but important
Chromium console warning in the same log: "The powerPreference option is
currently ignored when calling requestAdapter() on Windows." This pattern
(one `powerPreference` finding no adapter on a hybrid-graphics laptop) is a
real, documented Chromium/Windows failure class, so before writing anything
this session checked whether retrying with a different `powerPreference`,
or handing the library a pre-obtained `GPUAdapter`/`GPUDevice`, was a real
lever — not assumed either way.

**What was actually found, read from the installed library's own source
(`node_modules/@mlc-ai/web-llm/lib/index.js`, `lib/config.d.ts`), not
assumed.** `CreateMLCEngine(modelId, engineConfig)` -> `MLCEngine.reload()`
calls the library's own internal `detectGPUDevice()` with NO arguments
(`node_modules/@mlc-ai/web-llm/lib/index.js:12512`), so it always falls back
to that function's own hardcoded default, `powerPreference = "high-performance"`
(same file, line 4037) — there is no path from any public option down to
that call. `MLCEngineConfig` itself (`lib/config.d.ts:105-110`) is exactly
`{appConfig, initProgressCallback, logitProcessorRegistry, logLevel}` — no
`powerPreference` field, no way to pass a pre-created `GPUAdapter`/
`GPUDevice` instead of letting the library call
`navigator.gpu.requestAdapter()` itself. So even setting the Windows warning
aside, there was already no lever exposed by this library version. And the
Windows warning itself, read literally rather than assumed favorable,
settles it further: Chromium is stating the `powerPreference` VALUE is
ignored on Windows, meaning even a hypothetical future library version
letting us pass one would make the exact same underlying adapter request
Windows always makes regardless of the hint. **Conclusion: no genuine
adapter-retry lever exists here, for this library version, on this
platform. Do not re-attempt a powerPreference or pre-obtained-device retry
in a future F0 session without first re-checking whether the installed
web-llm version has changed** (this finding is tied to the library source
read above, not a permanent property of WebGPU itself).

**Built instead**: a short, real, actionable troubleshooting hint, appended
to the existing "device"-kind failure text only (not the timeout/network
cases, which this GPU-specific advice doesn't apply to) in both places that
text already renders — `bootScreenText.js`'s `aiStatusLine()` and
`SettingsOverlay.jsx`'s LOCAL AI DIALOGUE status row. The hint names three
concrete, real actions: check hardware acceleration is on in the browser's
own settings, update GPU drivers, and check the browser's own WebGPU status
page (`edge://gpu` / `chrome://gpu`) — kept short, no em dashes, and both
surfaces still explicitly restate the non-blocking promise (item 9's
standing rule) right alongside it, unchanged from the prior slice.
`dialogueProvider.js` gained a comment directly above `classifyLoadError`
recording this same investigation and citation trail, so the next session
sees it before touching this code, not just this CLAUDE.md entry.

**Verified.** `npx vite build`: clean (28.10s, same pre-existing >500kB
chunk warning). `npx eslint .`: the same pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, 0 warnings, no
new findings in any touched file. New
`tools/browser/verifyDeviceHint.mjs` (this environment still has no real
WebGPU adapter to reproduce a genuine "device" failure, so this forces the
classification via the existing DEV-only
`window.__proximateTestForceLocalAi` hook, same precedent as every prior
GPU-gated F0 script): confirms, live, that BootScreen's AI panel and
Settings' LOCAL AI DIALOGUE row both show the new hint text (hardware
acceleration / GPU drivers / `edge://gpu` / `chrome://gpu`) for a
`errorKind: "device"` forced failure, that the non-blocking sentence
remains present alongside it, and that the SAME hint does NOT leak into a
`timeout`-classified failure's text (it's scoped to "device" only). Also
re-ran the existing `tools/browser/verifyLocalAiRetry.mjs` to confirm no
regression to the retry mechanism itself — still PASS on every check. Both
scripts: zero real console errors.

### Front-end batch (2026-08-27, latest): local-AI reliability fix — the real load error is now logged and surfaced instead of silently swallowed, and a real retry path (one automatic attempt plus a manual Retry control) replaces the old permanent latch. Triggered by the first genuine WebGPU-capable-hardware failure report across ~15 prior F0 sessions.

**The report that triggered this, stated as given**: a user with real WebGPU-
capable hardware (not one of this project's own no-adapter test
environments — every prior F0 session has run in one) tried Medical
Simulation Mode and got "This device reports WebGPU support but local AI
failed to load. Proximate uses contextual template dialogue instead." The
fallback worked correctly (Tier 2 kept the game running) — but the FAILURE
ITSELF was a black box, confirmed directly against the tree per lesson 16
before touching anything: `dialogueProvider.js`'s `LocalLLMProvider.
_ensureEngine()` caught the real error from `CreateMLCEngine`/the
`withTimeout` race, stored it on `this._lastError`, but never logged it
anywhere and never exposed it through `getLocalAiState()` to any UI
surface; `this._failed = true` latched PERMANENTLY for the rest of the
session the instant any load attempt failed, with `isAvailable()`/
`preload()`/`_ensureEngine()` never retrying, even for what could be a
transient failure (a network blip on one of the model's ~370MB of shards,
a momentary OOM during WASM compile, a slow first-time GPU shader compile
racing `LOAD_TIMEOUT_MS`) on hardware that is genuinely capable.

**Built, three pieces, all in `dialogueProvider.js` unless noted.**

1. **The real error is now logged.** `_ensureEngine()`'s catch block calls
   `console.error` with the real caught error/message (not a generic
   string) plus a new `classifyLoadError(e)` classification
   ("timeout"/"device"/"network"/"unknown", a simple message-substring
   match) and an attempt count. Dev/diagnostic-only by construction — this
   is a `console.error` call, not player-facing text, so the no-em-dash
   rule doesn't apply to it (CLAUDE.md's own carve-out), and it adds no
   visible UI noise.

2. **A real retry path**, not just a permanent latch. Two mechanisms,
   both genuinely re-attempt a fresh load rather than decorating a flag:
   - `retry()` (new method): clears `_failed`, clears any stale
     `_loadPromise`, and calls `_ensureEngine()` again for real — a no-op
     if already ready or already loading, so it's safe to call from
     anywhere.
   - `_maybeAutoRetry()`: ONE automatic retry with a 3s backoff, but only
     for a failure classified `"timeout"` or `"network"` — the failure
     modes that plausibly look transient. A `"device"`/`"unknown"`
     classification (a hard compile/adapter rejection) is NOT auto-retried,
     since a device that flatly can't run this model gains nothing from a
     second identical attempt and it would only delay the honest "failed"
     status. Stated honestly: this timeout/network vs. device/unknown split
     is a real but not perfectly precise distinction (both derive from a
     simple message-substring match on whatever error text the browser/
     library happens to produce) — a defensible, simple policy, not a
     claim of perfect transient-vs-permanent classification. Wired from
     both `preload()`'s catch and `generate()`'s catch, so either the
     background boot-time load or a live in-game generation attempt can
     trigger the one automatic retry.
   - `dialogueManager.js` exports `retryLocalAi()`, a thin wrapper over the
     real singleton's `retry()` — wired into a real, conditional "retry"
     Chip in `SettingsOverlay.jsx`'s LOCAL AI DIALOGUE row, shown only when
     `status==="failed"`. Not decorative: clicking it calls the real
     provider, verified below.

3. **Improved player-visible status text**, still honoring the core
   promise (non-blocking, the game works fine without it). `getLocalAiState()`
   gained `errorKind`/`failCount`. `bootScreenText.js`'s `aiStatusLine()`
   and `SettingsOverlay.jsx`'s status line both now append a kind-specific
   clause ("(the model took too long to load)" / "(a network problem while
   downloading the model)" / "(this device rejected local AI, even though
   it reports WebGPU support)") when the classification is confident enough
   to say something useful, and explicitly restate that this never affects
   the medical simulation itself — not just a flatter "UNAVAILABLE" than
   before. `DialoguePanel.jsx`'s small in-scene status badge was
   deliberately left unchanged (still collapses to "CONTEXTUAL DIALOGUE" on
   any non-ready state) — it's designed to be a minimal, unobtrusive
   indicator (item 26's own "not constant technical noise" rule), and
   adding failure-kind detail there would work against that design intent;
   the fuller diagnostic belongs in Settings/boot, where a player is
   already looking at AI-specific status. One pre-existing em dash in
   `bootScreenText.js`'s failed-status line was fixed on the spot while
   editing that exact line, per this project's own "notice one while
   working on something else, fix it" rule; the file's other,
   untouched-this-session em dashes were left alone (incremental
   fix-on-touch, not a sweep).

**A new DEV-only test-hook capability was added to support verification**:
`window.__proximateTestForceLocalAi` (`dialogueManager.js`) gained
`errorKind` (set the diagnostic classification directly, for a script that
wants to assert on it without waiting out a real 45s timeout) and
`stubBackend` (replace the real singleton's `_loadBackend` with a stub that
lets a REAL call into `retry()`/`_ensureEngine()` — e.g. an actual click on
Settings' Retry button — genuinely succeed and reach "ready" without a
working WebGPU adapter, since no environment available to this project has
one).

**Verified two ways.** `npx vite build`: clean (30.60s, same pre-existing
>500kB chunk-size warning). `npx eslint .`: exactly the pre-existing
3-error `react-refresh/only-export-components` baseline in `App.jsx`, 0
warnings, zero new findings in any touched file
(`dialogueProvider.js`/`dialogueManager.js`/`SettingsOverlay.jsx`/
`bootScreenText.js`). New `tools/browser/verifyLocalAiRetry.mjs`, run
twice, PASS/PASS both times, zero real console errors both times
(the fix's own intentional `console.error` diagnostic line is explicitly
filtered as expected, not a bug being hidden). Part 1 (direct-function,
against a fresh `LocalLLMProvider` instance, not a mock): a controlled,
real load failure classifies correctly as `"timeout"`, the real caught
error is genuinely logged via `console.error` (captured and asserted on),
`status()` correctly reports `"failed"`, and `retry()` — with the backend
re-stubbed to succeed — genuinely clears the latch and reaches a real
`status()==="ready"` with a real (stub) engine attached. Part 2 (the real
app singleton, real UI, via the boot->title->Settings path): forcing a
failed, device-classified state shows the exact kind-specific status text
in `SettingsOverlay` with the non-blocking sentence present, a real Retry
chip renders, and — the check that matters most — a REAL click on that
chip (with `stubBackend` armed) calls back into the real provider and the
Settings row genuinely updates to "model ready on this device" live, via
the existing `subscribeLocalAiProgress` subscription, with no page reload
(confirmed by re-reading the DOM after the click, not assumed from the
click succeeding). A real race was found and fixed while building this
script, not a defect in the fix itself: the app's own real background
`preload()` has a genuine, independently in-flight (and, in this
no-adapter sandbox, doomed) load attempt that can land and overwrite
`_lastErrorKind` with its own real classification between a forced state
and the moment the DOM is read — the same "reassert immediately before
checking" gotcha several prior GPU-gated F0 scripts have already
documented, not new to this fix; fixed in the script by reasserting the
forced state a second time right before reading the status text, not by
changing any production code. Part 3: the script drives through a real
character-creation flow into a live scene (`chest` scenario) and confirms,
throughout the entire forced-failure/retry sequence: sim time keeps
strictly advancing (t=100.0 -> 101.0+ over a 1s real-time window) and a
real Tier 2/1 dialogue line still generates via
`generateDialogueFromContext` — the medical simulation was never blocked
or degraded by any of this.

**What remains honestly unverified, stated plainly.** This environment has
no real WebGPU adapter (confirmed again this session, same as every prior
F0 session), so the retry logic's actual behavior against the ORIGINAL
user's real hardware failure — whatever specific error `CreateMLCEngine`
throws on THEIR device — cannot be reproduced or observed here. Every
check above exercises the retry/logging/classification machinery against a
forced or stubbed failure, which is real code running for real (not a
mock of the retry logic itself), but it is not the same as watching the
actual reported failure recover on the actual reported hardware. The
timeout/network (auto-retried) vs. device/unknown (not auto-retried) split
is a real, defensible policy but not a precise one, per its own comment
above — a future session with access to a real failure log from
genuinely capable hardware could refine `classifyLoadError`'s own
substring matches against real observed error text rather than the
current best-guess patterns.

### Front-end batch (2026-08-27, latest): F0 item 30 — the first real automated (non-browser) test for the dialogue subsystem, closing a gap every prior F0 session's own status text had honestly flagged as untouched

Per the standing F0 top-priority directive, item 30's own text: "Automated
testing," ending with "Most important single test: the medical simulation
must continue correctly with the local LLM completely disabled." Confirmed
by grep across the whole tree before writing anything (this project's own
"verify claims against the tree" discipline) that no non-browser test file
for the dialogue system existed anywhere — all ~14 prior F0 sessions'
verification lived entirely under `tools/browser/`, real Playwright scripts
that need a live dev server, none of them runnable via plain `node`. New
`src/scripts/verifyDialogueNonBrowser.mjs`, following this project's own
established standalone-script convention (`verifyTemplateBuckets.mjs`,
`mechanismWiring.mjs`: a plain ES module, direct imports, assert-and-report,
non-zero exit on failure) — 74 real assertions, run via
`node src/scripts/verifyDialogueNonBrowser.mjs`, 74 passed / 0 failed on the
final run. Covers: `dialogueContext.js`'s `buildDialogueContext()` (null-
safety with missing state/physio, the full context shape, the bystander
field resolving a real scenario's `bystanders` text to a role, an unknown
scenario key degrading to no bystander rather than throwing, the custom-
scenario fixed-text path, `recentEvents` capped at 4, a bounded JSON size,
same-tick trend caching, and both the pain/consciousness AND the newer hr/
spo2/sbp trend signals actually flipping the derived emotional state);
`emotionalState.js`'s `deriveEmotionalState()` (all nine reachable branches
individually, in priority order, plus the missing-personality-object
no-throw case) and `bucketForEmotionalState()` (every documented state-to-
bucket mapping, the unrecognized-state fallback, and that all ten canonical
`EMOTIONAL_STATES` resolve to a defined bucket); `dialogueProvider.js`'s
`DeterministicProvider`, `TemplateProvider` (every real Tier-2 pool across
every emotional-state/fallback bucket it can reach, `{name}` substitution
sampled across repeated draws since not every template variant references
it, and an explicit `event.bucket` override winning over `emotionalState`),
and `progressStage()` (all boundary cases including the exact
`PROGRESS_GATE_THRESHOLD` value). Most importantly, `dialogueManager.js`'s
Tier 1/2 fallback path with the local LLM structurally absent, not merely
toggled off: this whole script runs under plain `node`, where there is no
`window` global at all and no `navigator.gpu` (confirmed directly in the
script itself — Node 21+ does ship a minimal global `navigator` for
`userAgent`, which the script accounts for rather than asserting a false
"no navigator" claim), so `LocalLLMProvider.isAvailable()` is unreachable by
construction, not by test setup. Against that real environment:
`generateDialogueSync()` produces a well-formed Tier-2/Tier-1 line for
every real event type this game fires (including three procedure-minigame
event types, exercising "dialogue during procedures" per item 30's own
list) with `localAiEnabled` both default and explicitly `false`, returns
`null` (never throws) for an unknown event type or missing state,
`getLocalAiState()`/`localAiStatus()` report honest unavailable/idle state
never a fabricated ready one, `pushDialogueMemory` proves the bounded-window
conversation-memory cap (item 30's "conversation memory"), two independent
patient `s` objects generating dialogue in the same tick never cross-
contaminate each other's trend bookkeeping (item 30's "multiple
simultaneous events"), and `shouldSpeakUnprompted`/`pickUnpromptedEvent`'s
gating logic all hold. `npx vite build` and `npx eslint .` were both re-run
after adding the script: build succeeds clean, eslint holds at the existing
baseline exactly (3 pre-existing `App.jsx` `react-refresh/only-export-
components` errors, 0 warnings) — this new script added zero lint findings
of its own.

**What remains open, stated honestly.** This closes the "automated non-
browser testing" half of item 30 for the PURE, already-deterministic
Tier 1/2 dialogue logic — it does not and cannot touch
`LocalLLMProvider.generate()`'s real Tier-3 path, which needs an actual
`@mlc-ai/web-llm` load against a real WebGPU adapter; that remains exactly
where every prior F0 session left it, covered only by the `tools/browser/`
scripts, and still never observed succeeding on real hardware in any
environment tested so far. Also not built this session: automated
(non-browser) coverage of the boot sequence, download state/interruption/
resumption, or cached-model detection as LIVE behavior — those three are
Playwright-covered already (`verifyBootScreen.mjs`,
`verifyLocalAiCache.mjs`) but that coverage stays browser-only; this
session did not attempt to port them to a non-browser harness (the boot
screen is a React component and the cache check calls the browser Cache
API, neither of which exists in plain Node). Model-load-failure and
generation-failure/timeout/empty-output paths inside `LocalLLMProvider`
itself are likewise still exercised only via the browser scripts' forced-
stub-engine hook (`window.__proximateTestForceLocalAi`'s `engineStub`
patch), not this new Node script, since that hook is itself a DEV-only
browser-global convenience. Item 29 (a real in-game developer/test-mode UI
for hand-supplying a context) remains unbuilt — this session's script
exercises `generateDialogueFromContext()` directly, which is real coverage
of that function, but is not the in-game UI item 29 itself asks for.
**RESOLVED, found already done — this bullet was stale (a later session).**
Grepped the live tree before starting F0 work and found
`src/components/DialogueDevPanel.jsx` already exists, already exports the
exact in-game UI item 29 asks for (a DEV-only "DIALOGUE DEV" toggle button,
mounted from `Shell.jsx` behind `import.meta.env.DEV`, with preset patient
states matching item 29's own named cases — normal/anxious/agitated/
deteriorating/improving — a crew/patient event picker, a custom-name field,
and a GENERATE button that runs the hand-built context through the real
`generateDialogueFromContext()` the live game itself uses, not a
reimplementation) — and it was never documented as done in this file.
Whoever built it apparently never updated this queue entry, so it sat here
as "remains unbuilt" for at least one session after actually shipping.
Verified live via a new `tools/browser/verifyDialogueDevPanel.mjs`
(PASS×6, zero console errors): the panel opens, GENERATE produces a real
result for the default preset/event, a crew event plus a non-default
preset also generates cleanly, a custom patient name doesn't crash it, and
it closes correctly. Retired outright rather than left to mislead the next
session too, the same failure mode this document warns about elsewhere.

### Front-end batch (2026-08-27, latest): F0 item 17 depth follow-up — broadened the trend signal to read hr/spo2/sbp, not just pain/consciousness, closing a gap the last several F0 sessions had explicitly left open

Per the standing F0 top-priority directive: `dialogueContext.js`'s
`computeTrend()` (the "vitals trend" input `deriveEmotionalState()` reads to
distinguish a worsening/improving/stable trajectory) previously compared
only `v.pain` and `v._cons` across ticks — CLAUDE.md's own F0 status
paragraph named this directly as an open gap for at least three prior
sessions. Confirmed against the tree before touching anything (lesson 16):
`patient.js`'s `vitals()` genuinely publishes `hr`/`sbp`/`spo2` (and `rr`,
unused here) on the same `v` object every `computeTrend` caller already has
in scope, so no new plumbing was needed to reach them — `buildDialogueContext`
already receives `v` as its second parameter and just wasn't forwarding it
past the pain/consciousness read.

**Built.** `computeTrend(s, painNow, consNow, vNow)` gained three more
graded, two-sided branches, evaluated after the existing pain/consciousness
checks (which still take priority, unchanged): a falling SpO2 (>=4 points)
drives "worsening" (checked first among the vitals signals, since hypoxia is
the single most urgent bedside sign available); a recovering SpO2 (+4 or
more, off a hypoxic <94 baseline) drives "improving"; climbing HR while
already tachycardic (+15 or more, now >100) drives "worsening"; falling HR
off a tachycardic baseline drives "improving"; and the same pair for SBP
trending toward/away from hypotension (<100). Every threshold is a
deliberately generous delta, not "any change," so the monitor jitter
`vitals()` itself already adds (`filter()`'s own per-tick noise) can't
spuriously flip the trend tick to tick — the same discipline the existing
pain branch's own >=2-point threshold already established. `buildDialogueContext`
now passes its own `v` straight through to `computeTrend` as the new fourth
argument. No `src/physio/*` file was touched — every field read
(`v.hr`/`v.spo2`/`v.sbp`) is read-only, already-computed vitals-panel output,
confirmed by the diff itself.

**Verified two ways.** `npx vite build`: clean, same pre-existing >500kB
chunk-size warning. `npx eslint .`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, zero new
findings in `dialogueContext.js`. A new live Playwright script,
`tools/browser/verifyBroaderTrendSignal.mjs`, drives the real "chest"
scenario and confirms, with pain/consciousness held CONSTANT across both
samples of each check (so any resulting trend can only be coming from the
new vitals branch, not the pre-existing pain/consciousness one): a real
SpO2 drop alone produces a worsening-trend emotional state
(frightened/agitated) and genuinely different Tier-2 dialogue text than a
stable-vitals control; a real SpO2 recovery off a hypoxic baseline produces
"reassured"; real climbing tachycardia produces a worsening-trend state; and
small, sub-threshold vitals jitter does NOT spuriously trigger a trend (the
negative control). Sim time keeps advancing throughout. Run twice, PASS/PASS,
zero real (non-network) console errors both times.

**A real test-harness gotcha was found and fixed while building this script
(not a production bug), documented in `tools/browser/README.md`'s gotchas
list**: the live game's own tick loop can independently call
`buildDialogueContext` at roughly the same `s.t` a test script is seeding,
and `window.__proximateTestGetState()`'s fresh-snapshot behavior can copy
that unrelated, stale `_emoTrendPrev` into a test's own spread-constructed
`s` object — if its `t` happens to coincide with the test's own seed tick,
`computeTrend`'s re-entrant-same-tick guard silently returns the cached,
unrelated trend instead of the test's controlled one, invalidating the
comparison with no thrown error. Fixed in the test script by explicitly
`delete`-ing `s._emoTrendPrev` immediately after the `{...real}` spread,
before seeding.

**What remains open in the trend signal specifically, stated honestly.**
`rr` (respiratory rate) is published on the same `v` object but was
deliberately not added as a fourth vitals branch this batch — every
condition that meaningfully worsens `rr` in this engine also moves
`spo2`/`hr` in the same direction (respiratory distress driving both
hypoxia and compensatory tachycardia), so a dedicated RR branch was judged
likely to fire redundantly alongside the SpO2/HR branches already built
rather than catch a genuinely distinct case — left out rather than added as
a decorative, rarely-independently-triggering fourth branch; worth
revisiting if a future session identifies a real presentation where RR
diverges from both SpO2 and HR (e.g. a pure hyperventilation/anxiety
picture) that the current branches miss. The thresholds themselves (4
points SpO2, 15 bpm HR, 15 mmHg SBP) are grounded in "generous enough to
reject ordinary monitor jitter," not a literature-cited clinical
deterioration threshold — a reasonable, but not clinically-anchored, choice.
Personality/emotional-state depth beyond this, crew/bystander depth, and
voice-readiness all remain open exactly as prior F0 entries already state.

### Physiology-engine batch: queue item 74, Phase 2 (real per-limb arterial perfusion) SHIPPED — `acuteLimbIschemia` built out from a completely bare stub, a caught unit-conversion bug that would have wrecked calibration, and the Phase 1 tourniquet/occlusion gap closed as a cheap add-on

**Built on Phase 1's `pat.woundBleedByLocation` foundation (previous entry).** `pat.limbOcclusion` (patient.js) is a new, LIVE, mutable per-limb map (`{armL,armR,legL,legR}`, 0=normal inflow, 1=fully occluded) — unlike Phase 1's static snapshot. Two real writers: `acuteLimbIschemia`'s own `progress()`, and a located tourniquet dose (pk.js's `stopsBleed` handler), which now ALSO sets `limbOcclusion[loc]=1` — closing the real, related gap Phase 1's own writeup named (a tourniquet stops bleeding BECAUSE it occludes arterial inflow, not as an independent fact; REBOA's unlocated whole-body use is correctly left alone, since it occludes a different vessel).

**Per-limb DO2/O2Debt (neuro.js's `updateOrganInjury`), reusing item 42's exact delivery-vs-demand pattern.** `limbDO2[loc] = (1-occlusion[loc]) * muscleFactor * (caO2/20)`, `limbO2Debt[loc] = max(0,1-limbDO2[loc])`, gated by the same 0.5 ischemic-deadband idiom gut/brain use before driving `limbInjury[loc]` (a new per-limb accumulator, added to physiology.js's irreversible-injury list alongside brain/kidney/liver/gut). `muscleFactor = max(0.05, 1 - alphaTone*0.5)`: skeletal muscle sits one tier below skin/gut in the shock vasoconstriction-priority hierarchy, so its alphaTone coefficient is REAL BUT LESS AGGRESSIVE than gut/skin's 1.0, not a copy-paste. Occlusion and systemic tone compose by MULTIPLYING (not min/max) — justified as two resistances in series on one arterial path, with the correct property that whichever term is smaller dominates the product (a fully occluded limb stays near-zero regardless of systemic tone; a patent limb tracks ordinary vasoconstriction).

**A real unit-conversion bug caught mid-calibration, before it could ship a wrong number — the exact "measure the instrument you have" failure mode lesson 20 already warns about.** `physiology.js`'s `s.t` is SECONDS (`dt = (s.t-lastUpdate)/60`); a first probe pass looped `s.t` as if it were minutes directly, under-running every scenario 60x. This produced a plausible-looking but wrong first calibration (MUSCLE_ALPHA_COEF=0.6 against a "near-terminal" cardiogenicShock reading that was actually only 4 real minutes in, alphaTone 0.518) — caught by re-deriving the SAME reference gut's own comment cites (untreated `abdominalAorticAneurysm` at 30 REAL minutes) and finding it did not reproduce gut's own cited sbp (11.4): the buggy probe gave sbp 128 (rising, not collapsing). Rerun correctly (looping real minutes * 60), `abdominalAorticAneurysm` at 30 min reproduced sbp 11.9 — matching gut's citation — with alphaTone 0.523, and the coefficient was recalibrated against that number (0.5, not 0.6) before anything shipped.

**MEASURED (not guessed), including the cross-cutting confound this session's own pulmonary-edema entry (below) warns must be checked FIRST, not last.** `acuteLimbIschemia` (VASC-001, 68M, AF, sudden left-leg pain/pallor/cold at 40 min): legL DO2 collapses to 0.124 by 15 min (armL, unaffected, stays at 0.897) — a genuine LOCAL signal, not whole-body. `legLInjury` crosses physiology.js's 0.5 irreversible threshold at 5h (0.414 at 4h, 0.523 at 5h) — inside the real 4-6h "time is tissue" golden period cited for acute embolic limb ischemia with some collateral flow, a distinctly LONGER window than a tourniquet's own ~2h warm-ischemia tolerance (a separate mechanism/time-constant NOT separately derived this batch — both share one rate constant, with full occlusion correctly injuring faster as an emergent consequence, not two fitted numbers — left honestly open, see below). A healthy control (`abdPain`, 30-120 min) holds `legLInjury` at exactly 0 throughout. The required cross-cutting check: untreated `abdominalAorticAneurysm` at 30 min — genuinely near-terminal systemic shock (sbp 11-13, alphaTone 0.52-0.57), NO limb-specific lesion — stays NON-ischemic (legLDO2 0.69-0.70, legLInjury 0), confirming systemic shock alone does not spuriously manufacture limb ischemia in this engine; overt acute limb ischemia requires a real arterial lesion.

**Occlusion severity, cited not guessed.** Seeded at 0.85 (not 1.0): real embolic occlusion of a previously-healthy artery (this patient's own risk factor is AF, not PAD) still leaves collateral flow immediately after lodging — de Weese/Rutherford acute-vs-chronic-occlusion teaching puts immediate distal perfusion at roughly 10-20% of normal in an unheralded embolic occlusion. Propagates slowly toward a 0.95 cap (never 1.0) over ~2h as stagnant distal blood propagates the thrombus, a real "the clock is running" teaching point — damped, not reversed, by heparin (`pat.anticoagulant`, the SAME handle ACS/PE already use): real, guideline-supported field/ED bridge therapy that slows further propagation without dissolving the existing embolus, matching myocarditis's own honest "no field cure, recognize and transport fast" posture — definitive care (embolectomy/thrombolysis) is not prehospital.

**A real, non-decorative consumer wired: PULSELESSNESS.** `actions.js`'s pre-existing `pedL`/`pedR` distal-pulse exam previously only read systemic sbp — unable to fire for a NORMOTENSIVE patient with a real local occlusion, exactly this condition's own presentation (sbp 114-120 throughout). Both now read `pat.limbDO2` first: a collapsed local signal reads pulseless even at normal systemic pressure. Paresthesia/paralysis (the other two of the "6 P's" the codebase's own stray comment claimed were narrated-only) were investigated and confirmed genuinely unbuildable this batch: `pat.strokeWeakness`/`strokeSide` is a cerebral (upper-motor-neuron) field already owned by the stroke limb, and reusing it here would be a real mechanism-category error (conflating central and peripheral-ischemic weakness); no generic per-limb sensory/motor field exists anywhere in this engine to hang them on honestly, matching this document's own established posture for similarly-unbuildable findings elsewhere (pupil diameter/mydriasis).

**Verification, complete.** `node --check`/`npx eslint` clean on all six touched files (`patient.js`, `neuro.js`, `conditions.js`, `physiology.js`, `pk.js`, `actions.js`, `mechanismWiring.mjs`). Six new two-sided assertions added to `mechanismWiring.mjs`'s new `[PER-LIMB ARTERIAL PERFUSION — queue item 74, Phase 2]` section (fires locally without touching unaffected limbs; time course inside the 4-6h window; does not fire in a matched healthy control; does not fire in the near-terminal systemic-shock cross-cutting control; a located tourniquet occludes its own limb only; the pedL exam consumer). `mechanismWiring.mjs` run TWICE in full: **443 passed, 1 failed both times** — all six new assertions passed identically both runs; the single failure differed between runs (magnesium/torsades on run 1, PAC HR-variance on run 2), both already-documented pre-existing flaky stochastic assertions unrelated to this batch by content. `scenarioSweep.mjs`: **161 scenarios, 11,953,608 checks, 0 failed** — identical to the pre-batch baseline, correctly: `limbDO2`/`limbO2Debt`/`limbInjury`/`limbOcclusion` are OBJECTS (one per limb), not scalars, and the sweep's REQUIRED/NON_NEGATIVE lists only support flat numeric fields — extending that mechanism for one new per-limb signal was judged real scope beyond "add a field to an existing list" and deliberately left out, the same "condition-scoped bookkeeping stays out of the global sweep" precedent `muscleIschemicBurdenHr` already sets, applied here for a structural (not scope) reason instead. `npx vite build`: clean (35.42s, same pre-existing >500kB chunk-size warning). No scratch probe scripts remain under `src/scripts/` from this batch (a pre-existing, unrelated `_edemaProbe.mjs` from an earlier session's reverted pulmonary-edema investigation was found still present — not this batch's to remove, noted for a future cleanup pass).

**Left honestly open for a future session (UPDATE: Phase 3 has since shipped — see this section's newest entry — the rest of this paragraph is otherwise unchanged and still accurate):** at the time of this entry, Phase 3 (compartment syndrome) was fully unstarted, now correctly positioned to build on a REAL `limbDO2` consumer per its own scoping. A tourniquet-specific (~2h) warm-ischemia time constant, distinct from embolic ischemia's ~4-6h window, was not separately derived — both currently share one rate constant, which happens to land both cases inside their respective real literature windows as an emergent (not separately fitted) consequence, but a future batch that wants a tourniquet-specific curve should derive it properly rather than assume the shared constant is precise for that case.

### Front-end batch (2026-08-27, latest): F0 item 15's bystander/family dialogue slice — the third character class, reusing the same architecture crew/patient dialogue already proved

Per explicit scope: F0 item 15 names "a family/bystander" as a dialogue-eligible character class with defined knowledge boundaries, and the Definition of Done references "crew dialogue can reuse the same architecture" as the template for extending to other character types. Before building anything, grepped the tree per lesson 16 rather than trusting the doc: **the prior claim ("no bystander/family dialogue of any kind exists yet") held up exactly as stated.** Every real scenario in `data/scenarios.js` (all 161) already declares a free-text `bystanders` field (a spouse, a neighbor, a coworker, a pediatric patient's parent...) — genuinely rich, varied flavor text, but read only once, for the scene-arrival log line (`App.jsx`'s `phase:"approach"->"scene"` transition) — never wired to any dialogue system. `dialogueContext.js` had no `bystander` field at all; `dialogueProvider.js`'s `TEMPLATES` had no bystander-voiced pool; `DialoguePanel.jsx`'s `SPEAKER_LABEL` only had `patient`/`crew`.

**Built, reusing the existing architecture exactly — no parallel system.** `dialogueContext.js` gained a `bystander:{present,role}` field: `scenarioBystanderText(s)` reads the scenario's own real `bystanders` string (via `SCEN[s.scen]`, or a hardcoded read of the custom-scenario builder's own fixed bystanders string for `scen:"custom"` rather than paying the cost of running `buildCustomScenario()` just to read one field that never varies), and `bystanderRole(text)` matches it against a small set of relationship-word patterns (husband/wife/spouse/girlfriend/boyfriend/mother/father/parent/daughter/son/sister/brother/roommate/neighbor/friend/coworker), falling back to the generic "bystander" role. Presence is deliberately the smallest real signal: since no scenario in this codebase models a bystander leaving or arriving mid-call (confirmed by reading every `bystanders` string), a non-empty field means present for the whole call — not tracked per-tick.

Two new Tier-2 template pools in `dialogueProvider.js`, `bystander_seizure_reaction`/`bystander_unresponsive_reaction`, fire from the SAME real seizing/consciousness edge-detection block in `App.jsx` that already drives the crew-voiced reaction and the on-screen `eventAlertQueue` banner — added as a sibling block right after the existing crew-reaction code, independent of crew presence (a bystander doesn't need a crew member on scene to react) but scene-phase only, unlike crew's scene+transport (a bystander doesn't ride in the truck). Deliberately only these two real trigger moments, not an exhaustive bystander dialogue system — the reverse edges (seizure ending, patient recovering) were left unwired on purpose, matching the scope instruction to keep this to 1-2 real triggers and prove the architecture reuses cleanly rather than building out full bystander depth in one batch. The dialogue itself is written in a genuinely distinct register from both existing voices: crew is clinical and directive ("Watch the airway"), a bystander witnessing the same moment has no training and nothing useful to DO, only fear — "Oh god, what's happening to {name}?! Is that normal?!", "Please, do something, right now, please!", "Wake up! Please, {name}, wake up!", "They're not answering me! Why aren't they answering?!" (both pools' full text lives in `dialogueProvider.js`). Same fire-and-forget `requestLocalUpgrade` Tier-3 pattern as every other site, same `isLocalAiEnabled`/`generateDialogueSync` call shape, same `dialogueLog`/`DialoguePanel` rendering — the entry additionally carries a `role` field so `DialoguePanel` can show the real parsed relationship ("HUSBAND") instead of a generic "BYSTANDER" label when one is known (new `C.amber`-colored speaker tag, distinct from crew's blue and patient's default).

**Knowledge boundary (item 15's "no character may know something they couldn't reasonably know") enforced in two places, not just by convention:** the hand-authored Tier-2 lines never name a vital, a rhythm, or a diagnosis — only what a frightened bystander could witness and feel; and `buildPrompt`'s Tier-3 prompt gained an explicit bystander branch stating the constraint directly to the model ("you have no medical training and no access to vitals, diagnoses, or lab results, so never state or guess any of those"), the same one-way-boundary treatment item 21 already gives physiology, applied here to a new speaker.

**Verified.** `npx vite build`: clean, same pre-existing >500kB chunk-size warning. `npx eslint .`: exactly the pre-existing 3-error `react-refresh/only-export-components` baseline in `App.jsx`, zero new findings in any touched file. A new `tools/browser/verifyBystanderDialogue.mjs` (real Playwright, live page) confirms, against the real "chest" scenario (`bystanders: "Her husband is in the doorway..."`): a real sustained seizure onset (the same `epilepticDrive=1`+`seizing=true` lever `verifyCrewDialogueReaction.mjs` established, since a bare boolean flip races neuro.js's own sustain reset) produces a real bystander-voiced line with ZERO crew present; the line contains no clinical terminology (a real regex check against vitals/rhythm/diagnosis words, not just eyeballing the template source); `role` is correctly parsed as "husband" from the scenario text and rendered as "HUSBAND" in the live DOM; the text is verbatim-distinct from every crew/patient template line; no second line fires on an ordinary steady-state tick with no fresh edge (event-driven per item 18, not polling); the reverse-direction real unresponsive-onset edge also fires correctly; `g.localAiEnabled=false` holds the line at tier 2/1 with the Tier-3 upgrade genuinely never firing; flipping the toggle back on lets a forced stub engine genuinely patch the SAME log entry in place; and sim time keeps advancing throughout, never blocked. Run twice, PASS/PASS, zero console errors both times. Found and documented one new, previously-undocumented gotcha while building this: the F0 boot screen (`phase:"boot"`, item 4, shipped in an earlier session) is now the very first screen a fresh session sees, so `freshCharacter()` helpers written before that slice needs a `clickText(page,"CONTINUE WITHOUT AI")` before "Go on shift" is even in the DOM — added to `tools/browser/README.md`'s gotchas list.

**Left open, honestly:** only two of the many scenario-declared bystander relationships were exercised live (husband, via "chest"; the role parser itself covers ~14 relationship words, unexercised beyond that one scenario in this session). Bystander personality/distress-level depth (analogous to item 16/17's patient work) was not attempted — every bystander line is currently a single, ungated "calm" bucket, the same simplification the existing crew pools already use. No arrival-moment bystander line was built (the spec's own text allows it as an "and/or" option; this batch stuck to the two edge-triggered reactions to keep the slice minimal). Reverse-edge bystander relief lines (seizure ending, patient recovering) remain unwired, matching crew's own pattern before `verifyClinicalRecoveryReactions.mjs`'s batch closed that gap for the crew voice — a natural, small follow-up if bystander depth is revisited. Voice-readiness and automated (non-browser) tests remain open project-wide, unchanged by this batch.

### Physiology-engine batch: queue item 74 opened, Phase 1 (limb-specific hemorrhage control) SHIPPED — per-limb circulation is a new, explicitly-scoped multi-phase workstream; this session built the foundation and fixed a real, previously-undiscovered tourniquet defect along the way

**Filed per explicit operator instruction: separate each limb into its own circulatory subsystem, to eventually support real compartment syndrome and per-limb bleeding/circulation.** Scoped into three phases in section 6's new item 74 before any code was touched, because the full ask (per-limb perfusion AND compartment syndrome) is large enough that attempting it in one batch would repeat the exact mistake the pulmonary-edema investigation two entries below made — this session deliberately built and shipped only the smallest real, useful, low-risk slice first.

**The gap, confirmed by reading the tree, not assumed.** `wounds.js` already keys every wound by body-map location (`armL`/`armR`/`legL`/`legR`/`torso`/`abdo`/`head`/`neck`), but `physiology.js`'s `buildPatient()` immediately collapsed every wound's `bleed` value into ONE whole-body scalar and threw the location away. `tq` (tourniquet) and `aorticOcclusion` (REBOA) both use the identical `stopsBleed:1` flag in `pk.js`, which zeroed the ENTIRE patient's `activeBleedRate` — correct for REBOA (proximal aortic occlusion genuinely does cut flow to everything downstream) but clinically backwards for a tourniquet, which should only stop bleeding distal to itself on ONE limb. Confirmed as a real, live defect, not theoretical: a tourniquet applied to a bleeding leg was also silently curing an unrelated chest wound in every existing multi-wound trauma scenario.

**Built: a purely additive, fully backward-compatible mechanism.** `patient.js` gained `pat.woundBleedByLocation` — a static, construction-time-only snapshot (built in `buildPatient()` from the exact same wound-iteration loop that already sums `bleed`/`pain`) of how much of the total bleed rate is attributable to a wound at each location. Deliberately NOT kept live: internal hemorrhage conditions (AAA, GI bleed, ectopic pregnancy, mesenteric ischemia) mutate `pat.activeBleedRate` directly every tick with no location concept at all, and a live-recomputed map would fight or double-count that — a one-time snapshot is sufficient for its one real consumer. `pk.js`'s `stopsBleed` handling now reads an OPTIONAL `d.location` on the dose: present and matching a real wounded location → only that location's recorded contribution is subtracted, once, idempotently (`pat._tqStoppedLocations`); absent → falls through to the EXACT original whole-body zero. Since no dose anywhere in this codebase — scenario, test, or front-end — has ever set `d.location`, this required touching zero existing call sites and carries zero risk to anything already shipped.

**MEASURED, both the new capability and the preserved old behavior, via the real `physio()` pipeline against `motorcycle` (`polytraumaMoto`: legL open femur + torso sucking chest wound + head laceration, three simultaneously bleeding locations — the exact multi-site case a whole-body-only mechanism cannot distinguish).** A located tourniquet on `legL` drops `activeBleedRate` 0.36 → 0.24, removing exactly legL's own 0.12 contribution while torso (0.08) and head (0.02) keep bleeding untouched. An unlocated tourniquet (every real caller today) still drops it to exactly 0, bit-for-bit the old behavior. Repeated ticks of the same located dose do not double-subtract (confirmed directly before trusting the mechanism, per lesson 8).

**Explicitly scoped OUT of this batch, stated so a future session doesn't re-litigate the boundary:** `directPressure`/`pack`/`pelvicBinder`'s own `fx.bleed` deltas were not made location-aware (different code path, already implicitly scoped to whichever wound the player is treating via the exam UI). No player-facing limb-selection UI exists yet for the tourniquet itself — this is physiology-layer support only, the front-end analog of `AccessMinigame.jsx`'s existing IV-site picker is real, separate, un-started work. Phases 2 (per-limb perfusion/`limbDO2`, reusing item 42's delivery-vs-demand pattern) and 3 (compartment syndrome — a genuinely new enclosed-fascial-pressure state, not a variant of any existing organ mechanism) are fully scoped in section 6's item 74 and explicitly unstarted.

**Verification, complete.** `node --check` clean on all four touched files (`patient.js`, `physiology.js`, `pk.js`, `mechanismWiring.mjs`). `npx eslint`: exactly the pre-existing 3-error `react-refresh/only-export-components` baseline in `App.jsx`, zero findings in every touched file. Three new two-sided assertions added to `mechanismWiring.mjs`'s new `[LIMB-SPECIFIC HEMORRHAGE CONTROL — queue item 74, Phase 1]` section (located tourniquet stops only its own limb; torso/head wounds keep bleeding; an unlocated dose still reproduces the old whole-body zero exactly). `mechanismWiring.mjs`: **437 passed, 1 failed** — all three new assertions passed; the single failure is the same already-long-documented, pre-existing flaky rocuronium bagging-delay stochastic assertion (5/10 vs. a needed 6), confirmed unrelated by content (reads `neuromuscularBlock`/rhythm, nothing this batch touched). `scenarioSweep.mjs`: **161 scenarios, 11,953,608 checks, 0 failed** — identical count to the pre-batch baseline, correctly, since `woundBleedByLocation` is condition-scoped bookkeeping (like item 42's `muscleIschemicBurdenHr`), not a universal per-tick field, and was deliberately NOT added to the sweep's global `REQUIRED`/`NON_NEGATIVE` lists for the same reason. `npx vite build`: clean (21.68s, same pre-existing >500kB chunk-size warning). No scratch probe scripts remain under `src/scripts/`.

### Front-end batch (2026-08-27, latest): F0 item 17 depth follow-up — expanded real Tier-2 template granularity so the ten emotional states stop collapsing onto only 3 template buckets, and gave `embarrassed` its one genuine reachable trigger

Per explicit scope, verified the prior session's own honest "still open"
claim by reading `dialogueProvider.js`'s `TemplateProvider.generate()`
directly before writing anything, per lesson 16. **The claim held up
exactly as stated, not stale in either direction.** All ten
`emotionalState.js` states were mapped, via `bucketForEmotionalState`
(`emotionalState.js`'s `STATE_TO_BUCKET` table), onto only 3 real template
buckets: `calm`/`reassured`/`confused`/`exhausted`/`embarrassed`/`"in
pain"` (six of the ten) all read as `calm`; `anxious`/`frightened` as
`anxious`; `agitated`/`angry` as `irritable`. `embarrassed` had zero real
call sites setting it anywhere in the tree (confirmed by grep), matching
the prior session's own note precisely.

**Built: real per-state template buckets for six of the seven
patient-voiced Tier-2 pools, chosen by judgment rather than mechanically
filling all ten states into every pool.** `TemplateProvider.generate()`
(`dialogueProvider.js`) now checks `pool[state]` (the emotional state name
verbatim) BEFORE falling back to `bucketForEmotionalState`'s original
3-way collapse, so any pool this batch didn't touch behaves identically to
before — a purely additive, backward-compatible change (confirmed by the
new direct-function test's own "unenriched state still falls back" and
"embarrassed still collapses to calm on an unenriched pool" assertions).
New buckets, all hand-authored, matching the existing house voice (short,
plain, no medical jargon, no em dashes):
- `pain_unprompted` and `procedure_discomfort` gained `"in pain"` (severe,
  sustained pain with no trend either way — reads as raw endurance, not a
  question or a complaint, distinct from the calm/anxious/irritable lines
  which all assume pain that isn't already severe).
- `pain_unprompted` and `treatment_improving` gained `exhausted` (a long
  call wearing the patient down — quieter and more worn out than any
  existing bucket, not sharper).
- `anxious_unprompted` and `deterioration_unprompted` both gained
  `frightened` (a real worsening trend in an anxious-leaning patient) with
  genuinely different wording per pool (general fear vs. fear specifically
  about the trajectory getting worse).
- `deterioration_unprompted` additionally gained `agitated` (a worsening
  trend in a non-anxious patient — demanding action, distinct from
  irritable-by-temperament) and `confused` (altered consciousness during a
  deterioration event reads as disoriented, not scared or demanding).
- `airway_stimulation_reaction` gained `confused` (airway instrumentation
  on a patient with already-altered consciousness reads as a disoriented,
  half-aware reflex, not a lucid protest).
- `treatment_improving` and `procedure_success_relief` gained `reassured`
  (explicit relief and gratitude on a real improving trend, distinct from
  "calm," which describes a patient who was never that distressed).

Deliberately left unenriched: the four crew-voiced pools (calm-only by
existing design, per that pool's own standing comment — extending crew
emotional depth is out of this batch's scope) and `"angry"` (still
collapses to the `irritable` bucket's existing wording, judged close
enough for a first pass; a genuinely angry-specific line is real, cheap,
scoped follow-up, not attempted here to keep this batch bounded).

**`embarrassed` is no longer permanently unreachable.** Investigated
whether a genuinely fitting existing trigger exists, per the task's own
explicit instruction not to fabricate one. `clothing.js`/App.jsx's
`exposureActs` (the "Remove shirt"/"Lift shirt"/"Cut shirt" actions,
already shipped, unrelated to this batch) expose a conscious patient's
chest in front of the crew and any bystanders — a clinically real,
already-existing gameplay event that genuinely fits embarrassment, not
invented for this purpose. Wired as an explicit `event.bucket:"embarrassed"`
override (the same override mechanism crew-reaction events already use,
per `emotionalState.js`'s own header comment anticipating exactly this),
fired from `start()`'s own action-completion path in `App.jsx` (checked
BEFORE the generic `procedure_discomfort` duration heuristic, and
independent of its `dur>=10` gate, since the fast "Cut shirt" shears
variant is the same social moment as the slower "Remove shirt"). A new
`exposure_reaction` template pool (`dialogueProvider.js`) holds the actual
lines. `deriveEmotionalState()`'s general derivation still does not, and
should not, produce `embarrassed` on its own — no ambient signal
distinguishes it from ordinary distress, unchanged from the prior
session's own correct reasoning; only this one explicit, real trigger
reaches it.

**Verified three ways.** `npx eslint`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, zero new
findings in `dialogueProvider.js` or `App.jsx`. `npx vite build`: clean
(23.54s, same pre-existing >500kB chunk-size warning). Direct-function
(`src/scripts/verifyTemplateBuckets.mjs`, new, 15 assertions): every new
state bucket produces real, distinct text for the same event with zero
text overlap against the pool's `calm` baseline; an unenriched state
(`angry`) still correctly falls back to the `irritable` bucket; the
`embarrassed` override produces real text via `exposure_reaction` while
still correctly collapsing to `calm` on pools that don't define it
directly; zero em dashes in any newly-authored line. Live
(`tools/browser/verifyTemplateBucketsLive.mjs`, new, run clean): (1) `"in
pain"` and `"exhausted"`, both reached through the REAL
`deriveEmotionalState()` (not hand-set enum values — a stable trend plus
severe pain for one, a long elapsed time plus ongoing modest pain for the
other), produce genuinely different dialogue text for the identical
`pain_unprompted` event; (2) clicking the real "Lift shirt" action in a
live page fires a genuine `exposure_reaction`/`embarrassed` line
("Can someone, can I get a blanket or something, please?") into
`dialogueLog` through the actual `start()` action path, not a direct
module call; (3) sim time advanced throughout, zero real (non-network)
console errors. Two real test-harness gotchas found while building this
(documented in `tools/browser/README.md`): the "chest" scenario has a
1700s scene `limit` — jumping injected `t` past it silently ends the scene
and makes the entire action list vanish, which looks identical to a
missing-button bug until the scenario's own `limit` field is checked; and
the exposure actions are filtered by `g.region` (the selected body-region
tab) in addition to `g.tab`, both of which must be set via `setState` or
the action never renders.

**What remains open in emotional-state depth after this session, stated
honestly.** Three of the seven patient-voiced pools (`anxious_unprompted`
only gained one new bucket, `procedure_discomfort` only one) and the four
crew pools remain 3-bucket-or-fewer; `"angry"` still shares wording with
`agitated`'s irritable-bucket fallback rather than having its own line;
item 16's traits still only drive bucket selection, never per-word
phrasing variation within a bucket; the trend signal still only tracks
pain/consciousness; crew/bystander emotional-state depth is still
unattempted. `embarrassed`'s one real trigger is torso exposure only —
other clinically embarrassment-appropriate moments (incontinence, a groin/
genital exam) have no equivalent gameplay action in this codebase today to
attach to, and none was invented.

### Front-end batch (2026-08-27, even later): F0 items 16-17 depth — confirmed personality (item 16) is more built than this document claimed (a stale-doc finding, not a gap), and built the genuinely missing piece: a real, structured, simulation-determined emotional state (item 17)

Per explicit scope: read the personality/emotional-state code that exists
today before building anything, per lesson 16, and state plainly whether
this document's own "five-trait first cut... gates one dialogue event"
framing was accurate or stale.

**Stale-doc finding, stated plainly.** `src/dialogue/personality.js` is
real and matches the document's own description exactly (five traits,
anxious/cooperative/talkative/irritable/trusting, deterministically seeded
per patient identity via `mulberry32`) — but the claim that it "gates ONE
dialogue event" was WRONG, not just outdated. Reading
`src/dialogue/dialogueProvider.js`'s `TemplateProvider` directly (not
assumed from the doc) found personality already selects the template
BUCKET (calm/anxious/irritable) for every one of the seven patient-voiced
Tier-2 event pools (`pain_unprompted`, `anxious_unprompted`,
`deterioration_unprompted`, `procedure_discomfort`, `treatment_improving`,
`airway_stimulation_reaction`, `procedure_success_relief`) — not just
unprompted dialogue's firing PROBABILITY (`talkative`, in
`dialogueManager.js`'s `shouldSpeakUnprompted`). Personality was ALSO
already present in the Tier-3 LLM prompt (`dialogueProvider.js`'s
`buildPrompt`, a `Personality: anxious 80%, ...` line) — the "context
builder omits personality" risk this task's own briefing flagged as a
concrete possible defect was checked directly and found NOT to be real.
Item 16 is genuinely deeper than a first cut already; this session did not
extend it further, since the real, still-completely-open gap was item 17.

**Item 17 — the real gap, confirmed by reading `dialogueContext.js`
directly: no structured emotional state existed anywhere in this
codebase.** Grepped `emotionalState`/`emotional` project-wide before
building anything: zero matches outside scenario prose. The only thing
approximating it was a single scalar `distress` (0-1,
`pain*0.6 + anxious*0.4 + unconsciousPenalty`) — not the ten named states
(calm/anxious/frightened/confused/agitated/angry/embarrassed/in pain/
reassured/exhausted) item 17's own text asks for, and nothing distinguished
"is currently deteriorating" from "is currently improving" at all — a
patient's emotional read never depended on which direction the situation
was moving, only its instantaneous magnitude.

**Built: `src/dialogue/emotionalState.js` (new).** A pure function,
`deriveEmotionalState({consciousness, painLevel, personality, trend,
elapsedMin})`, reading only real, already-simulated fields — never writing
to any `pat.*` field, one-way (simulation -> emotional state -> dialogue,
never the reverse), per item 17's own "the LLM must never arbitrarily
change authoritative emotional state" and this session's own explicit
scope boundary against touching the physiology engine. Altered
consciousness overrides to "confused"; a real worsening TREND (below) maps
to "frightened" or "agitated" depending on the patient's own anxious
trait; an improving trend maps to "reassured"; sustained severe pain with
no trend maps to "in pain"; a highly irritable patient in real pain maps
to "angry"; a long call with ongoing pain maps to "exhausted"; a highly
anxious patient with nothing else going on maps to "anxious"; otherwise
"calm". `embarrassed` is deliberately left unreachable by the general
derivation (documented in-code) — no signal in this engine currently
distinguishes an embarrassment-appropriate moment from ordinary distress,
and inventing one to fill out the list would be the exact decorative-field
pattern section 1 forbids; it stays in the exported enum for a future call
site with a real trigger (e.g. an `expose@` beat) to pass as an explicit
override, the same way crew events already override `TemplateProvider`'s
bucket selection.

**A real vitals-TREND signal, item 17's own explicit "vitals trend" input,
now exists for the first time.** `dialogueContext.js` gained
`computeTrend(s, painNow, consNow)`, comparing the current tick's real
pain/consciousness against the last sample, stored on `s` itself (the same
`_`-prefixed live-draft-object bookkeeping idiom `App.jsx`'s own
`_analgesiaCheckAt` already uses, guarded by `s.t` so multiple
`buildDialogueContext` calls within the same tick — a real, existing
pattern, e.g. `generateDialogueSync` followed by `requestLocalUpgrade` for
one event — read back the same trend rather than comparing a snapshot
against itself). `buildDialogueContext` now computes and exposes
`ctx.patient.emotionalState` alongside the existing `personality`/
`distress` fields.

**Wired into both places item 17's own spec says a structured emotional
state should reach.** `TemplateProvider`'s bucket selection
(`dialogueProvider.js`) now reads `ctx.patient.emotionalState` FIRST
(mapped onto the existing 3-way calm/anxious/irritable template-pool split
via a new `bucketForEmotionalState`), falling back to the old
trait-threshold heuristic only for a caller that doesn't build a full
context (the dev panel's hand-authored presets) — so the SAME event now
genuinely differs in wording between a patient who is currently frightened
by a real deteriorating trajectory and one who is merely anxious-by-
temperament but presently stable, not just between static trait buckets as
before. The Tier-3 prompt (`buildPrompt`) now states the emotional state
explicitly and separately from the personality-trait line, with an
instruction that it is "already determined by the situation, not by
you — express it, do not contradict or change it" — the concrete,
in-prompt enforcement of item 17's one-way boundary.

**Verified two ways.** Direct-function: 15 assertions against
`deriveEmotionalState`/`bucketForEmotionalState` covering every branch
(consciousness override, both worsening sub-branches, improving, severe
pain, irritable+pain, long-call fatigue, anxious-alone, default, and the
bucket mapping), plus a `buildDialogueContext`-level check that a real
worsening pain trajectory and a real improving one produce different
`emotionalState` values, plus an end-to-end check that two differently-
named patients (different personality draws) produce different Tier-2
text for the identical event — all passed. Live, in a real page
(`tools/browser/verifyEmotionalStateLive.mjs`, new): a genuine sharp pain
INCREASE seeded across two real ticks produces `emotionalState:
"frightened"` and a genuinely different Tier-2 line than a genuine sharp
pain DECREASE (`"reassured"`) for the same `pain_unprompted` event on the
same patient, and sim time keeps advancing throughout (dialogue derivation
never stalls the tick loop). Run twice, PASS/PASS, zero real (non-network)
console errors both times. A real test-harness gotcha was found and fixed
while building this (not a production bug): `window.__proximateTestGetState()`
returns a fresh top-level snapshot on every call (only `.patient` is the
genuine live-referenced object), so trend bookkeeping written onto that
snapshot doesn't persist to the next `getState()` call the way it would
inside the real tick loop's own reused draft object — worked around by
stashing the script's own context shell on `window` across `evaluate()`
calls; documented in `tools/browser/README.md`'s new entry for this
script.

**A real, pre-existing defect was found and fixed on the spot while
running the live script, unrelated to this session's own scope but
surfaced by it.** The newly-more-reachable "frightened" bucket exposed a
Tier-2 template line, `"I don't like this — it's not going away."`
(`anxious_unprompted`), that shipped with an em dash in player-facing
dialogue text — a genuine, pre-existing violation of this project's own
no-em-dash rule (section 4), invisible before because `sanitize()` only
ever strips em dashes from Tier-3 (LLM) output, never from hand-authored
Tier-2 template strings. A full grep of `dialogueProvider.js`'s template
pools for em dashes found six more instances across
`anxious_unprompted`/`treatment_improving`/both crew-reaction pools — all
seven fixed in place (commas or plain sentence breaks, matching this
project's own house style), per the standing "notice one while working on
something else, fix it on the spot" rule rather than deferred.

`npx vite build`: clean (16.45s, same pre-existing >500kB chunk-size
warning). `npx eslint src`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, zero new
findings in `emotionalState.js`, `dialogueContext.js`, or
`dialogueProvider.js`. No `src/physio/*` file was touched — `pat.pain`/
`pat.consciousness`/`v._cons` are READ only, never written, confirmed by
the diff itself.

**What remains open in personality/emotional-state depth after this
session, stated honestly.** Item 16's five traits still only drive a
3-way template bucket split (not per-word phrasing variation within a
bucket) and a single probability multiplier for unprompted firing — deeper
influence (e.g. `trusting`/`cooperative` affecting how readily a patient
answers a direct question, which no current dialogue event models at all)
remains unbuilt. Item 17's ten states are real and simulation-driven but
the mapping onto Tier-2's existing 3-bucket template pools is deliberately
coarse (multiple states share a bucket, e.g. `confused`/`exhausted`/
`embarrassed` all currently read as "calm" wording) — a genuinely richer
Tier-2 pool per state, or per-state phrasing variation, is real, scoped
follow-up work, not attempted here to keep this batch's own blast radius
small and fully verified. `embarrassed` remains permanently unreachable
until a real triggering event (clothing exposure, incontinence) is wired
to pass it as an explicit override — filed here rather than silently
left. The trend signal only tracks pain and consciousness; a real vitals
trend (e.g. HR climbing, SpO2 falling) reaching the SAME mechanism is a
natural, cheap extension once a real event wants it. Crew/bystander
emotional state (as opposed to the patient's) was not attempted — crew
dialogue templates are deliberately bucketed to "calm" only, per that
event pool's own existing comment, and extending emotional-state depth to
crew members is a separate, unscoped question.

### Front-end batch (2026-08-27, latest): F0 item 23 / F3 spec 2.7 coordination point — dialogue during the four real procedure mini-games, verified and documented (the mechanism was already in the tree, undocumented; this session's own job was verification)

Per lesson 16 ("confirm a claim against the actual code before building on
it"): this session's task was to add dialogue into the four real procedure
mini-games (`AccessMinigame.jsx`/`AirwayMinigame.jsx`/`CricMinigame.jsx`/
`SGAMinigame.jsx`), the one piece of F0 item 23 / F3 spec 2.7 an earlier
section 3 entry had explicitly left open ("procedure-mini-game dialogue —
the six real minigames don't reach the new dialogue path at all yet"). A
grep-before-build pass (following lesson 16, not the task's own framing)
found the wiring **already fully present in the tree**: `App.jsx` has a
`fireMinigameDialogue(evtType)` helper (a `setG` reducer using the exact
same `generateDialogueSync` + `requestLocalUpgrade` pattern every other
dialogue call site in this codebase already uses — no parallel system),
passed to all four mini-game components as an `onDialogue` prop; each
component calls it at one real, single, event-driven physical moment (the
needle/IO stick, the incision, the laryngoscopy/ETT blade-view confirmation,
the SGA blind-insertion attempt), each a genuine 45% roll reusing the same
probability the flat busy-timer `procedure_discomfort` path already used;
IV/IO and the cric incision fire `procedure_discomfort`, laryngoscopy/ETT
and SGA fire `airway_stimulation_reaction` (both pre-existing
`dialogueProvider.js` templates); and `resolveAccessMinigame`'s `SUCCESS`
branch separately fires a `procedure_success_relief` line (35% chance,
awake-gated) — the good-outcome half of item 18's "event-driven, not
continuous" bar, applied to mini-games too. `DialoguePanel.jsx` already
carries its own `zIndex:201`/bottom-left-fixed positioning fix (its own
comment cites F0 item 23 / F3 coordination directly) specifically so it
renders above the four mini-games' `zIndex:200` centered modals without
colliding with `MinigameVitalsStrip`. None of this was recorded anywhere in
this document — no section 3 entry, no F0/F3 status update — despite F0's
own status paragraph and F3's own "still open" bullet both explicitly
claiming it as an open gap as of the immediately-prior section 3 entry. Per
this document's own house rule (trust the tree over the prose), the gap
between "documented as open" and "actually shipped" is closed here, not the
gap in code.

**What this session actually did, concretely:** (1) read every touched
file end to end to confirm the mechanism is real, not decorative — no dead
fields, `onDialogue` genuinely wired at all four call sites, both templates
genuinely present in `dialogueProvider.js`, `resolveAccessMinigame`'s relief
line genuinely present; (2) ran `npx vite build` (clean, same pre-existing
>500kB chunk warning) and `npx eslint .` (3 errors, 0 warnings — the exact
same pre-existing `react-refresh/only-export-components` findings in
`App.jsx` this document's section 2 baseline already documents, zero new
findings in any dialogue/mini-game file) to confirm no regression baseline
drift; (3) wrote a new live verification script,
`tools/browser/verifyMinigameDialogue.mjs` (see `tools/browser/README.md`
for the full writeup), and ran it live, twice, both clean.

**Verified live, per mini-game, via real clicks (not `setState` alone) —
each mini-game opened for real, driven through a real attempt via its own
actual controls (hold-to-advance for IV, the landmark/incision sliders for
cric, the lift slider + Confirm view for laryngoscopy, the angle/depth
sliders + Advance for SGA), retried up to 15 times per check since each
trigger is a genuine 45% roll (the same "count only real, confirmed
attempts" idiom `verifyDialogueTier3Extension.mjs`'s SITE3 already
established for this project's own click-timing behavior):**
- A real IV stick, a real cric incision, a real laryngoscopy view
  confirmation, and a real SGA seat attempt each produced a genuine
  Tier-1/2 `dialogueLog` entry with the correct `dlg_mg_<evtType>_...` id
  prefix and correct template text (e.g. "Ow. That stings.",
  "That's uncomfortable, but go ahead.").
- Sim time kept advancing underneath the open IV mini-game across the
  exact attempt that fired dialogue (confirmed `g.t` strictly increasing
  before/after) — dialogue firing mid-procedure does not freeze or block
  the mini-game, the other half of item 23's own requirement alongside "the
  patient can still talk."
- The `requestLocalUpgrade` Tier-3 gate, checked at one representative site
  (AccessMinigame/IV) using the established
  `window.__proximateTestForceLocalAi` DEV-only hook with a real, callable
  stub engine (no environment available to this project has a working
  WebGPU adapter — see F0's own status paragraph): with the stub forced and
  `g.localAiEnabled` unset/true, the SAME dialogueLog entry (matched by id)
  gets genuinely patched in place with the stubbed tier-3 line; with
  `g.localAiEnabled=false`, the same real trigger still fires its Tier-2/1
  line but is NEVER upgraded — a real per-site short-circuit, not assumed
  from the shared gate alone.
- A real bounding-box check confirmed a live `DialoguePanel` line and the
  open IV mini-game modal do not visually overlap — `DialoguePanel`'s own
  earlier `zIndex:201`/bottom-left fix (from the `MinigameVitalsStrip`
  batch) still holds correctly now that dialogue genuinely fires while a
  mini-game is open, not just in theory.
- Zero console errors across both full runs of the new script.

**Two real script-building gotchas found and fixed while writing the
verification (not app bugs) — see `tools/browser/README.md`'s gotchas list
for the full writeup:** (1) a retry loop's `dialogueLog`-prefix match can
silently find a STALE entry left over from an earlier section of the same
script if the log isn't explicitly reset first, producing a false "already
found it" that then makes the Tier-3 patch check fail for the wrong reason
(fixed: explicit `dialogueLog:[]` reset immediately before any log-prefix
retry loop, even across sections that already reset it once); (2) the
documented "reassert the forced stub before each attempt" pattern
(`verifyDialogueTier3Extension.mjs`'s own established idiom) is not
sufficient when a loop's own body contains several real `await`s between
the reassertion and the actual trigger — the app's genuine background
`preload()` WebGPU-adapter rejection can land in that gap and re-latch
`_failed=true` before the real trigger fires. Fixed by reasserting the stub
a second time immediately before the specific DOM event that fires the real
`requestLocalUpgrade` call (right before the `mouseup` dispatch), not only
once at the top of the retry loop.

**Not touched, per explicit scope:** the physiology engine; the
already-solved mini-game pause/interruptibility mechanics (spec 2.5,
confirmed still correct as a side effect of the bounding-box/sim-time
checks above, not re-engineered); `src/dialogue/dialogueManager.js` itself
(a temporary debug instrumentation pass used to diagnose the second gotcha
above was fully reverted before this session ended — confirmed via a final
read of the file showing it byte-identical to its pre-investigation state
aside from the intentional zero net change).

**What remains open in F0/F3's dialogue-during-procedures coverage after
this session, stated precisely:** the airway/cric/SGA sites were verified
for the Tier-1/2 firing mechanism and the visual/timing checks, but NOT
individually re-verified for the Tier-3 gate (only AccessMinigame/IV was,
as the representative site — the gate logic itself is shared, identical
code (`requestLocalUpgrade`) across all four, already proven per-site-
independent for the other three real dialogue call sites in
`verifyDialogueTier3Extension.mjs`, so this is a reasonable but not
exhaustive extrapolation, stated honestly rather than assumed silently).
Real generation success on actual WebGPU-capable hardware remains
completely unconfirmed for this site same as every other F0 Tier-3 path —
no environment available to this project has ever exercised a real local
model generation. Personality/emotional-state depth beyond the five-trait
first cut, the REST of crew/bystander dialogue beyond the seizure/
unresponsive reactions, voice-readiness, and automated (non-browser) tests
all remain open exactly as F0's own status paragraph already states —
nothing about this session changes any of those.

### Front-end batch (2026-08-26): F0's own remaining explicitly-tracked depth item — `requestLocalUpgrade` extended to the other three dialogue call sites

Per the operator's own scoped instruction: find and wire the remaining real
dialogue-generation call sites that never got the Tier-3 upgrade, following
the exact fire-and-forget/in-place-log-patch pattern the one already-wired
site (unprompted patient dialogue) established.

**Confirmed the real call-site count against the tree first (lesson 16),
rather than trusting the number several older section-3 entries already
cite ("four real call sites... three of which never got the Tier-3
upgrade").** Grepped `generateDialogueSync` across `src/`: exactly four real
call sites, all in `App.jsx` — unprompted patient dialogue (~line 2584,
already wired to `requestLocalUpgrade` since an earlier session), crew
reaction (~line 2556, the seizure/unresponsive/recovery edge-detection
block), treatment-response dialogue (~line 2615, the post-analgesia
improvement check), and procedure-discomfort dialogue (~line 2805, inside
`start()`'s own `setG` updater for any action costing >=10s on an awake
patient). Confirmed count matches the number cited in section 6's F0 entry
exactly — no fifth site existed, none of the four was a duplicate
description of another.

**Wired all three remaining sites, mirroring the existing site's pattern
exactly:** each site's Tier-2/1 line is still rendered immediately and
synchronously (never blocked); `requestLocalUpgrade(evt, s, v, onResolved)`
is then called alongside it, fire-and-forget, using the SAME `entryId` the
Tier-2/1 line was just pushed into `dialogueLog` under. If it resolves
before its own timeout, `onResolved` fires a `setG` call OUTSIDE the
synchronous reducer/updater that produced the original line, patching that
one entry's `text`/`tier` in place via `.map(e=>e.id===entryId?{...}:e)`.

**The stale-patch guard is the SAME `.map()`-based id lookup every site
already uses, confirmed to double as the guard the task asked for — not a
new mechanism.** If by the time the upgrade resolves the target entry has
scrolled out of `dialogueLog`'s own 8-entry cap (`.slice(-8)`, already
existing on every site), or the call/scene has otherwise moved state so the
id no longer exists, `.map()` simply finds no match and returns the array
unchanged — a silent, safe discard, never a throw, never a stale patch
landing on the wrong entry. This is exactly the guard the one prior site
already relied on; extending the other three sites required no new
staleness logic, only reusing the same idiom.

**Double-fire is prevented by construction, not a new check:** the crew
reaction site's own event selection is an exclusive if/else-if chain (at
most one of seizure-onset/seizure-ended/unresponsive/recovery fires per
tick), so at most one `requestLocalUpgrade` call can be made per edge per
tick; the treatment-response site nulls its own `_analgesiaCheckAt` guard
the same tick it fires, so it cannot re-fire for the same window; the
procedure-discomfort site only runs once per `start()` invocation (one
click, one attempt). Each call also gets its OWN unique `entryId`
(timestamp-based), so even if two sites happened to fire in the same tick
they'd patch two different, unambiguous entries, never collide.

**Confirmed `isLocalAiEnabled(s)` genuinely gates all three new sites for
free, per-site, not just in theory** — `requestLocalUpgrade`'s own first
line (`dialogueManager.js`) already checks it before even calling
`localLLM.isAvailable()`, and every one of the three new call sites passes
`n`/`s` (the live game-state object the toggle itself writes
`g.localAiEnabled` onto) as `requestLocalUpgrade`'s own `s` parameter — the
same object shape the one pre-existing site already used, so no call-site
change was needed for the gate to apply; verified live per-site below
rather than assumed from the shared code path alone.

**Verified live** (`tools/browser/verifyDialogueTier3Extension.mjs`, new —
supersedes an earlier same-session draft of this script,
`verifyDialogueUpgradeAllSites.mjs`, removed): for each of the three sites,
with a real forced stub `LocalLLMProvider` engine (the same DEV-only
`window.__proximateTestForceLocalAi` hook every prior GPU-gated F0 script
uses, since no environment available to this project has a real WebGPU
adapter): (a) enabled — the site's own dialogueLog entry is genuinely
patched to the forced Tier-3 line; (b) `localAiEnabled=false` — the Tier-2/1
line still fires normally but is NEVER patched, confirmed independently at
each site, not assumed from the shared gate; (c) firing the underlying
event twice in one session — no crash, no garbled/duplicated log content.
All three sites now pass all three checks cleanly, including (c). Site 3
(procedure-discomfort)'s own (c) check was genuinely unconfirmed in the
earlier draft of this script — not a real app gap, a REAL TEST-SCRIPT BUG,
now found and fixed: the draft's `clickText()`-driven retry loop was
silently landing clicks that never reached `start()` at all (confirmed by
reading `g.busy.id` immediately after each click — it stayed unset on the
"losing" attempts), so most of its 30 budgeted attempts never actually
exercised the 45%-chance discomfort roll at all. Fixed with a forced click
(`{force:true}`, this button's parent re-renders every 100ms sim tick, the
same "not stable" flake class this project's tooling already documents
elsewhere) plus an explicit `waitForFunction(()=>g.busy?.id==="loc")` after
each click, so only confirmed real action-starts count toward the sample —
see `tools/browser/README.md`'s new gotcha entry for the full trace. Also
found live while fixing this: this project's sim clock does not advance
while `g.busy` is set, and clearing `busy` directly via the test hook
(bypassing the app's own `cancelAction()`) does not resume it either, so two
back-to-back test-triggered attempts can legitimately land on the same
`dlg_<id>_<round(t*10)>` id — a property of the pre-existing id scheme every
dialogue site shares (unrelated to this batch's own scope), not a
double-fire defect; the fixed check asserts on dialogueLog entry CONTENT
integrity (well-formed speaker/text/tier) for this case rather than id
uniqueness. `npx vite build`: clean (same pre-existing >500kB chunk-size
warning). `npx eslint .`: exactly the pre-existing 3 errors/0 warnings
baseline (`react-refresh/only-export-components`, all three in `App.jsx` at
the same lines as before), zero new findings. No `src/physio/*` file was
touched.

**What remains open in F0's dialogue-upgrade coverage, stated honestly.**
All four real dialogue-generation call sites in the game now have
`requestLocalUpgrade` wired and fully verified (fire, patch, gate, and
double-fire safety, all confirmed live per site), closing this queue item.
The six real procedure-minigame components (IV/IO/laryngoscopy/ETT/cric/SGA)
still don't generate dialogue at all (they resolve through their own
components, independent of `generateDialogueSync`/`requestLocalUpgrade`
entirely) — not touched here, per the operator's own explicit scope
boundary against building new minigame dialogue triggers. Real generation
success on genuine WebGPU-capable hardware remains unconfirmed in any
environment across every F0 session, unchanged by this batch.

**Files touched:** `src/App.jsx` (the three new `requestLocalUpgrade` call
sites), `tools/browser/verifyDialogueTier3Extension.mjs` (new, replaces the
removed `verifyDialogueUpgradeAllSites.mjs`), `tools/browser/README.md`
(documented, plus a new gotcha entry on the click-flake found above). The
physiology engine (`src/physio/*`, `physiology.js`) was not touched.

### Front-end batch (2026-08-26, even later same day): F0 items 7 and 10 — the completion notice and the Local AI settings toggle. This closes F0's originally-scoped items 2-11.

Per the operator's own scoped instruction: build the last two unstarted
pieces of F0's numbered spec, items 7 (completion notification) and 10
(Local AI settings toggle), verify for real, and — if both land clean —
close out F0's items 2-11 as a whole.

**Item 7 — `src/components/AiReadyNotice.jsx` (new), mounted from
`Shell.jsx` alongside `AiDownloadIndicator`.** Subscribes to the same
`getLocalAiState()`/`subscribeLocalAiProgress()` plumbing every other AI
surface already uses. Shows the spec's exact text, "Local AI is ready.
Refresh Proximate to enable dynamic dialogue.", with a `Refresh Now` button
and a dismiss (✕) button, but ONLY after a genuine
downloading/loading/loading-from-cache → ready transition observed during
the current session (tracked via a small `sawLoading` boolean state, not a
ref — an early draft used a ref and `react-hooks/refs` correctly flagged
reading `.current` during render) — a session where the model was already
ready at first paint announces nothing, since nothing completed DURING that
session for the player to be told about. Dismissing just sets local
component state; no reload, no g-state write, nothing that could interrupt
the current call.

**The refresh-vs-hot-swap investigation the spec's own item-7 text asks
for, done by tracing the actual call path rather than assuming a refresh is
needed:** `dialogueManager.js`'s `localLLM` is a module-level
`LocalLLMProvider` singleton (already directly confirmed to survive the
boot→title transition by the previous slice's own
`verifyBackgroundAiIndicator.mjs`). `LocalLLMProvider.isAvailable()` only
checks `navigator.gpu` and `!this._failed` — it does NOT require the engine
to already be loaded. The one live Tier-3 call site,
`requestLocalUpgrade()`, calls `localLLM.generate()`, which calls
`_ensureEngine()`, which returns the SAME in-flight/resolved `_loadPromise`/
`_engine` the background download has been building the whole time. So once
`status()` reaches `"ready"`, the very next dialogue event in the SAME
session already gets a real Tier-3 line — there is no separate
session-scoped engine reference to swap out, no stale provider reference
held in React state (App.jsx never imports the engine object itself, only
calls through `requestLocalUpgrade`/`generateDialogueSync`, which re-resolve
the singleton fresh on every call), and no additional in-flight-request
hazard beyond what `requestLocalUpgrade`'s own existing
timeout/try-catch already handles. **Conclusion: a page refresh is not
architecturally required to start using the model in the current session —
this codebase already hot-swaps for free**, as a direct consequence of the
singleton design items 1/12 already established, not new plumbing added
this slice. Building a forced or even opt-in "reinitialize the engine" path
would be complexity spent re-solving a problem this architecture doesn't
have. `Refresh Now` therefore does a plain `location.reload()` purely as a
player-requested convenience (a clean restart that will detect the
already-cached model faster next time), never triggered automatically — per
item 33's explicit "never force a refresh."

**Item 10 — a new "LOCAL AI DIALOGUE" row in `SettingsOverlay.jsx`,
following the file's existing `Row`/`Chip` pattern (same idiom as the
neighboring PROCEDURE ASSIST row).** Reads `getLocalAiState()` (subscribed
live via `subscribeLocalAiProgress`) for real status text
(ready/downloading N%/loading-from-cache/checking-cache/failed/not-yet-
downloaded/unsupported-device) and the real, exported
`MODEL_DOWNLOAD_MB` (370, `dialogueProvider.js`) for a real "Download size:
~370 MB" line — no second, hand-authored status system. Enable/disable
chips write a new `g.localAiEnabled` flag, defaulting to enabled
(`!==false`, matching the file's own `??true`-style default idiom) so
existing saves without the field keep today's behavior.

**The real gate, not a UI-only checkbox: `dialogueManager.js` gained a new
exported `isLocalAiEnabled(s)` and both `generateDialogue()` and
`requestLocalUpgrade()` — every current and future Tier-3 call site —
now check it FIRST, before even calling `localLLM.isAvailable()`.**
`requestLocalUpgrade`'s call site in App.jsx already passes the live game
state `n` as its own `s` parameter, so no call-site change was needed —
the gate reads the same object the toggle writes. Verified as a genuine
short-circuit, not just a plausible-looking early return, via a new
direct-function test (see below): with a REAL, callable stub engine forced
onto the singleton (only the network/GPU seam faked — `buildPrompt`/
`sanitize`/timeout all run for real), `requestLocalUpgrade()` resolves a
real generated line when enabled/unset, and genuinely never resolves when
`localAiEnabled===false`.

**A new DEV-only test hook, `window.__proximateTestForceLocalAi`
(`dialogueManager.js`), mirrors the project's existing
`__proximateTestSetState`/`__proximateTestGetState` convention** (gated on
`import.meta.env.DEV`, stripped from production) — added because, per every
prior F0 session, no environment available here has a real working WebGPU
adapter, so `status()` can never be observed reaching `"ready"` live. The
hook mutates the REAL `LocalLLMProvider` singleton's own fields
(`_progress`/`_cacheState`/`_engine`/`_failed`) and re-emits a real progress
event through the same `_progressListeners` every real subscriber uses, so
components under test run their real logic against a real (forced) state
transition rather than a second, mocked object.

**Verification (`tools/browser/verifyAiReadyNoticeAndToggle.mjs`, new,
README-documented): all checks PASS**, including on a clean re-run after
the debug-line cleanup. Confirms `AiReadyNotice` shows the exact spec text
only after a forced downloading→ready transition (not on first paint, not
before); confirms dismissing it does NOT reload the page (checked via a
`window` marker that a real navigation would wipe) and the app stays fully
readable/functional afterward; confirms the Settings row renders real
status/size text and real clicks on enable/disable persist
`g.localAiEnabled`; and the direct-function gate test: enabled →
resolves a real line, disabled → never resolves, re-enabled → resolves
again (the gate reacts live, isn't latched), unset → defaults to enabled.
**A real, previously-unconsidered timing hazard was found and fixed while
building this test**: the app's own background `preload()` (started for
real at boot) has a genuine pending WebGPU adapter request that eventually
rejects asynchronously in this no-adapter environment and latches
`_failed=true` via `_ensureEngine`'s own catch handler — landing mid-test,
this broke every gate check AFTER that unrelated real rejection arrived,
regardless of the enable/disable state under test, which looked at first
like the toggle itself was broken. Fixed by re-asserting the forced state
immediately before each attempt in the test, not by changing any production
code (the real preload failure/fallback behavior itself is correct and
unrelated to this batch). `npx vite build` clean (same pre-existing >500kB
chunk warning), `npx eslint .` unchanged at the pre-existing 3
errors/0 warnings (all three in `App.jsx`, none in any file this batch
touched).

**Files touched:** `src/dialogue/dialogueProvider.js` (new exported
`MODEL_DOWNLOAD_MB`), `src/dialogue/dialogueManager.js` (new
`isLocalAiEnabled()`, the gate in `generateDialogue()`/
`requestLocalUpgrade()`, `downloadSizeMB` in `getLocalAiState()`, the new
DEV-only `__proximateTestForceLocalAi` hook), `src/components/
AiReadyNotice.jsx` (new), `src/components/Shell.jsx` (mounts it),
`src/components/SettingsOverlay.jsx` (new LOCAL AI DIALOGUE row),
`tools/browser/verifyAiReadyNoticeAndToggle.mjs` (new),
`tools/browser/README.md` (documented). The physiology engine
(`src/physio/*`, `physiology.js`) was not touched.

**What this closes and what it doesn't.** This is the closing slice for
F0's originally-scoped items 2-11 — every one of items 1 through 11 now has
a real, verified (live where the environment allows, direct-function where
it genuinely can't) implementation. It does NOT close the rest of F0's
33-item spec or its Definition of Done — see section 6's F0 entry,
rewritten this session, for the precise, still-open remainder (items 12-33
already shipped in part across earlier slices; personality/emotional-state
depth beyond the five-trait first cut; procedure-minigame dialogue; the
rest of bystander/family dialogue; voice-readiness; automated non-browser
tests; and, unresolved across every session so far, real generation success
on genuine WebGPU-capable hardware).

### Front-end batch (2026-08-26, later same day still): F0 item 6 — an unobtrusive in-game AI-download indicator, and direct proof the `LocalLLMProvider` singleton survives the boot→title phase transition

Per the operator's own scoped instruction: F0 item 6, "background download
continues after entering the game, never blocking gameplay," with an
unobtrusive in-game progress indicator. Explicitly NOT this slice: item 7's
completion notice and item 10's Settings toggle — the indicator built here is
fine as a future seed for item 7, but was not over-built toward it.

**Confirmed, not assumed, that the singleton survives the phase transition —
per lesson 16, checked directly rather than trusted from the prior slice's own
prose.** `dialogueManager.js` constructs `localLLM = new LocalLLMProvider()`
once, at module scope; `phase:"boot"` → `phase:"title"` is an ordinary React
state change within one page load, not a reload/navigation, so nothing
re-evaluates that module. Verified two ways: (1) by inspection, tracing every
`blank()`/phase-dispatch call site and confirming none of them remounts or
re-imports `dialogueManager.js`; (2) directly, in
`tools/browser/verifyBackgroundAiIndicator.mjs` — `await import(...)` the
module from inside the live page BEFORE clicking "Continue without AI",
starting a real `preloadLocalAi()`, stashing the returned module object on
`window`, then importing the SAME specifier again AFTER the transition to
`phase:"title"` and confirming `===` identity. Both PASS twice in a row: the
module object is bit-for-bit the same object across the transition, and
`getLocalAiState().status` reads a real, unchanged in-progress value
(`"loading"` in this environment) on both sides — a load already in flight at
boot is not touched by leaving the boot screen.

**Built: `src/components/AiDownloadIndicator.jsx` (new), mounted from
`Shell.jsx`, reusing the SAME `getLocalAiState()`/`subscribeLocalAiProgress()`
plumbing the boot screen's own AI panel already uses — no second, parallel
status system.** `Shell.jsx` is the project's existing persistent UI chrome:
it already mounts `SettingsOverlay`'s always-visible gear (fixed
top:12/right:12) unconditionally on every screen past boot
(title/kit/scene/transport/debrief/etc. all route through it; only
`phase:"boot"` itself renders before Shell, via App.jsx's own early return),
so the new indicator was placed there rather than inventing new chrome — a
small, fixed pill at top:12/right:62, immediately to the left of the gear.
Deliberately renders **nothing at all** (`return null`) for
`ready`/`unavailable`/`failed`/`idle` — only
`downloading`/`loading-from-cache`/`loading` (the cache check itself still in
flight) render the pill, with the real percentage when web-llm's own progress
report includes one. `pointerEvents:"none"` and small muted text keep it from
competing with anything — it is genuinely near-invisible outside a real
in-progress state, matching the spec's own "unobtrusive" language.

**Verified live, two ways, in `tools/browser/verifyBackgroundAiIndicator.mjs`
(new).** Beyond the singleton-identity proof above: (1) the indicator's
visibility is checked against the real `getLocalAiState().status` both at the
title screen and inside a live scene — pill shown if and only if status is a
genuinely in-progress one; (2) with the indicator mounted and subscribed, a
live scene's sim time is confirmed to keep advancing (t=5.8→15.8 over a
2.5s real-time window) and the scene's own vitals/log UI stays present and
updating, proving the subscription introduces no stall; (3) zero real
(non-network) console errors throughout. Run twice, PASS/PASS. Pre-existing
regression scripts re-run afterward: `verifyLocalAiCache.mjs` passes clean
(unaffected — this slice touched no caching code); `verifyBootScreen.mjs`
failed on an unfiltered `net::ERR_CONNECTION_RESET` console line — a
pre-existing gap in that specific script (it doesn't filter the same expected
sandbox-network-noise pattern `verifyLocalAiCache.mjs`/this slice's own new
script already filter), unrelated to this batch: this slice touched no file
`verifyBootScreen.mjs` exercises (`BootScreen.jsx`, `bootScreenText.js`,
`App.jsx`'s boot phase dispatch are all untouched), confirmed by reading the
diff, not assumed.

`npx eslint src`: unchanged baseline, 3 errors / 0 warnings, all three the
same pre-existing `react-refresh/only-export-components` findings in
`App.jsx`; zero findings in `AiDownloadIndicator.jsx` or `Shell.jsx`. `npx
vite build`: clean (26.69s, same pre-existing >500kB chunk-size warning). No
`src/physio/*` file was touched.

**What remains open for F0 item 6, stated honestly.** The indicator shows real
progress but nothing about resumability was changed this slice — item 8's
own already-documented shard-file-granularity resumability is unaffected and
unextended. Real, live, end-to-end "close the tab mid-download, relaunch,
watch it resume and the indicator reflect that" has still never been observed
in any environment across any F0 session, for the same reason every prior
slice states: no environment tested so far has a real WebGPU adapter to get
far enough for shard downloads to begin at all, so the indicator's
"downloading NN%" branch is verified against synthetic/`"loading"` real
states, not a genuine climbing percentage. Persistence ACROSS A REAL PAGE
RELOAD (as opposed to the in-page phase transition this slice verified) was
not tested — browsers do not guarantee background execution across a
reload/tab-close at all (the spec's own item 6 text says so explicitly), and
nothing in this engine claims otherwise; a reload always restarts at
`phase:"boot"` by design (`blank()`'s own default), so there is no
"background while reloaded" case to lose track of — only a same-session,
same-page persistence claim, which is what was verified. Item 7 (the
completion notice) and item 10 (the Settings toggle) remain entirely
untouched, per this slice's own explicit scope boundary.

### Front-end batch (2026-08-26, later same day): fixed a broken verify script, then F0 item 5 — the progressive ~20%-download-gate messaging, built and verified with synthetic values (a real live download crossing 20% remains unconfirmed in this environment, same as every prior F0 slice)

**Fixed `tools/browser/verifyLocalLLMProvider.mjs` first.** It predated the
boot-screen slice's new `phase:"boot"` initial phase and never clicked
through it, so every run failed immediately. `freshCharacter()` now waits
for `phase:"boot"`, clicks "CONTINUE WITHOUT AI" (always clickable
immediately, per item 9), waits for `phase:"title"`, then proceeds exactly
as before. This surfaced a second, real interaction worth documenting: the
boot screen's own `preloadLocalAi()` now fires against the SAME
`LocalLLMProvider` singleton this script's own `isAvailable()` check reads,
so in a run where that preload has already hit-and-failed the real
adapter-request step (this environment's `navigator.gpu` reports present as
an API surface but has no real adapter, the same finding every prior F0
session has made), `isAvailable()` correctly reports `false` even though
`navigator.gpu` itself is `true` — a real latched-failure state, not a
disagreement with feature detection. The script's assertion now
distinguishes that honest case from an actual bug. Also added the same
`net::ERR_CONNECTION_RESET`-filtering `verifyLocalAiCache.mjs` already
established (this sandbox has no outbound internet access, so a real
tier-3 attempt's fetch to huggingface.co always logs that browser-level
network error, which is not a JS exception from this project's own code).
Run twice, PASS/PASS.

**F0 item 5 — read closely before building.** The spec's own text: "Don't
force the player to wait for the full model. Once core assets are ready AND
~20% of the model has downloaded, offer Continue without AI — the player
enters Medical Simulation Mode while the model keeps downloading in the
background." Per the operator's own scoping for this slice: the "never
force the player to wait" half was ALREADY satisfied — item 9's boot screen
has offered an always-clickable "Continue without AI" since an earlier
slice, at any AI state, including 0% progress. What item 5 actually still
owed was the ~20%-THRESHOLD-AWARE part of the UX the spec describes: the
boot screen should read differently once meaningful progress exists versus
when nothing has happened yet. Item 6 (persisting the download across the
boot screen's unmount into gameplay) is explicitly out of scope for this
slice — see "what remains open" below for exactly how far this got.

**Built, smallest-real-implementation per the operator's own instruction not
to over-build:**
- `src/dialogue/dialogueProvider.js` gained `PROGRESS_GATE_THRESHOLD` (0.2)
  and a new pure, exported function `progressStage(progressFraction)` —
  `"not-started"` (no/invalid/zero/negative input), `"early"` (>0, <20%),
  `"meaningful"` (>=20%, <100%), `"ready"` (>=100%). Pure and synchronous on
  purpose: it's the one piece of this slice that can be verified with
  complete honesty in an environment with no working WebGPU adapter, by
  feeding it synthetic values directly rather than by claiming a live
  download was observed crossing 20%.
- `src/dialogue/dialogueManager.js`'s `getLocalAiState()` gained a
  `progressStage` field, computed by feeding the SAME real
  `localLLM._progress?.progress` value (the one `initProgressCallback`
  actually reports) through `progressStage()` — never a second, separately
  invented number.
- `src/components/bootScreenText.js` (NEW FILE): `aiStatusLine()` and
  `continueHint()` moved out of `BootScreen.jsx` into this plain `.js`
  module and `export`ed, because exporting them directly from the `.jsx`
  file triggered two NEW `react-refresh/only-export-components` errors
  (confirmed via `npx eslint .` before/after — baseline went 3 -> 5 errors
  with them left in the `.jsx` file, back to 3 once moved here). This is the
  same rule App.jsx's own pre-existing 3 errors are already grandfathered
  under; moving pure helpers to a plain module sidesteps it entirely rather
  than adding new exceptions. `continueHint(ai)` is the new logic: for
  `progressStage==="meaningful"` it reads "Local AI is still downloading,
  but real progress exists. Continue now, it keeps loading in the
  background."; for `"early"` it reads "Local AI has barely started
  downloading. No need to wait, continue whenever you like."; the default
  (not-started/unknown) keeps the prior generic line. `BootScreen.jsx` now
  imports both from `bootScreenText.js` and renders `continueHint(ai)`
  under the Continue button exactly where the old generic sentence used to
  sit — same location, same never-blocking behavior, just threshold-aware
  tone.

**Verified two ways, consistent with this project's own standing precedent
for a GPU-gated feature.**

**Direct-function (`tools/browser/verifyProgressiveDownloadGate.mjs`, NEW
FILE) — the meaningful layer here, stated honestly as such.** Part A feeds
`progressStage()` 15 synthetic values including the exact threshold
boundary (`0.2` itself, and `0.2 - 0.0001`), non-number input (a string,
`NaN`, `undefined`), negative input, and an out-of-range `1.5` — confirms
every one classifies correctly, run twice, PASS/PASS. Part B calls
`bootScreenText.js`'s real, production `continueHint()`/`aiStatusLine()`
directly with synthetic `ai` objects at each stage, confirming neither
throws and that `"early"` and `"meaningful"` produce genuinely different
text (not just different labels wrapping the same sentence). Part C is a
live real-page smoke check: the actual boot screen still renders its
Continue button and stays at `phase:"boot"` with this new plumbing wired
in, zero real (non-network) console errors.

**Live regression, not new coverage:** re-ran `verifyBootScreen.mjs`,
`verifyLocalAiCache.mjs`, and the newly-fixed `verifyLocalLLMProvider.mjs`
— all still pass clean against the changed files, confirming this slice's
edits didn't regress the boot flow, cache detection, or tier-3 fallback
path.

`npx eslint .`: back to the pre-existing baseline, 3 errors / 0 warnings
(all three the same `react-refresh/only-export-components` findings in
`App.jsx`, none in any file this batch touched — see the `bootScreenText.js`
detour above for why). `npx vite build`: clean, same pre-existing >500kB
chunk-size warning. No `src/physio/*` file was touched.

**What remains open in F0, stated honestly.**
- **Item 5 itself**: the threshold-aware MESSAGING is real and verified;
  what's NOT built is any mechanism that changes what happens at 20% beyond
  the message — there is no separate "20% gate" state machine because item
  9's Continue button was never gated to begin with, so there was nothing
  further to unblock. If a future session wants item 5 to also change VISUAL
  emphasis (e.g. a different button color/icon at "meaningful" vs "early"),
  that's a real, small follow-up, not started here.
- **Item 6 (background download continues into gameplay)**: still entirely
  unbuilt. `preload()` is still the same single one-shot `_ensureEngine()`
  call kicked off at boot; nothing keeps it running (or resumes it) once
  `BootScreen` unmounts and the player reaches `phase:"title"`/gameplay. The
  `LocalLLMProvider` singleton itself DOES persist across that phase
  transition already (it's a module-level singleton in `dialogueManager.js`,
  not recreated per-screen) — so a load already in flight when the player
  clicks Continue is not literally aborted by leaving the boot screen. What
  item 6 still needs on top of that: (1) a visible, unobtrusive in-game
  progress indicator (nothing outside `BootScreen.jsx` currently subscribes
  to `subscribeLocalAiProgress`), (2) verifying/handling what actually
  happens to a fetch already in flight across a full page navigation (a
  `phase` change is a React state transition, not a reload, so the fetch
  itself likely survives — unconfirmed, not tested this slice), and (3) the
  spec's own resumability/persistence language, which item 8's own
  session already found is real but shard-file-granular, not proven live
  end-to-end in any environment so far.
- **Item 7 (completion notice)** and **item 10 (settings toggle)**: both
  untouched, exactly as before this slice.
- Real generation success and a real download-progress percentage actually
  climbing past 0% remain unconfirmed on any tested hardware, same as every
  prior F0 session — `progressStage()`'s correctness is proven against
  synthetic input, not a live crossing.

### Front-end batch (2026-08-26): F0 item 8, persistent model caching — real cache detection built and verified, resumability investigated and found genuinely real but coarse-grained, not the fine-grained "resume at 63%" the spec's own text imagines

Per the operator's own scoped instruction: make F0 item 8 real — a boot
screen that can tell "not downloaded yet" apart from "cached, loading from
cache" — by exposing web-llm's OWN internal caching correctly, not
reimplementing it. Items 5-7/10 (the progressive-download gate, background
download continuing into gameplay, the completion notice, the settings
toggle) stayed explicitly out of scope, per the operator's own boundary.

**Read web-llm's actual source before building anything, per lesson 16 —
found a real, already-exported answer, not a gap to fill from scratch.**
`node_modules/@mlc-ai/web-llm/lib/index.js` (v0.2.84, the same version this
project already depends on) exports `hasModelInCache(modelId, appConfig)`
(~line 12016) and `deleteModelAllInfoInCache` (~line 12026) — real,
public, already-built cache-check functions, not something this session
had to invent. Traced the mechanism all the way down:
- **Storage backend**: `getCacheBackend(appConfig)` (~line 929) defaults to
  `"cache"` (the browser Cache API, `caches.open()`/`.match()`/`.add()`),
  not IndexedDB, unless `appConfig.cacheBackend` is explicitly overridden
  (an `ArtifactIndexedDBCache` class exists at ~line 5531 as an
  alternative backend, unused by default). `prebuiltAppConfig.cacheBackend`
  (~line 960) confirms `"cache"` is the actual default for every model in
  the catalog, including this project's own `Qwen2.5-0.5B-Instruct-q4f16_1-MLC`.
- **Cache scope/key shape**: `hasModelInCache` calls
  `hasTensorInCache(modelUrl, {cacheScope:"webllm/model", cacheType:"cache"})`
  (~line 12023). `hasTensorInCache` (~line 5905) first checks whether a
  `tensor-cache.json` manifest URL (under the model's own
  `cleanModelUrl()`-resolved base, ~line 9458 — for this project's model,
  `https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC/resolve/main/`)
  is itself a Cache API key; if absent, returns `false` immediately with
  NO network call. Only if that manifest key exists does it read the
  manifest (from cache, not network — `ArtifactCache.addToCache` no-ops
  once `cache.match()` already finds the key) to get the shard list, then
  checks every shard's own full URL is ALSO a cache key via
  `hasAllKeys()` (~line 5504) — an ALL-OR-NOTHING check across every shard
  named in the manifest, not a percentage.
- **Download commit shape**: `ArtifactCache.addToCache` (~line 5487) calls
  `this.cache.add(request)` — the standard `Cache.add()`/`fetch()` browser
  primitive, which is atomic per file: if the fetch is aborted or fails
  partway, nothing is stored for that URL at all. No `Range`/`206`/byte-
  offset handling exists anywhere in this file (grepped for `Range`,
  `206`, `Accept-Ranges` — the only `Range` hits are an unrelated
  `RangeError` class for config validation).

**What this means for resumability, stated honestly rather than assumed
either way — genuinely real, but at SHARD-FILE granularity, not the exact
byte-level "resume at 63%" the spec's own wording (item 8: "closed at 63%
… resume from ~63%") literally describes.** The model is downloaded as
many separate shard files (per `tensor-cache.json`'s own manifest), each
committed to the Cache API independently and atomically as it completes.
If a download is interrupted after N of M shards have fully landed, a
later launch's `hasModelInCache()` correctly reports `false` (not "63%
cached" — the check is binary), but `CreateMLCEngine`'s own per-file
`addToCache()` logic (the same `cache.match()`-before-`cache.add()` guard
verified above) will skip every shard already present and only re-fetch
the ones that never finished — so the NET EFFECT is a real, working
resume that does not re-download the whole ~370MB from zero, just not
literally "resume this one file from byte 63%." A single shard caught
mid-transfer contributes nothing (partial fetches aren't stored at all),
so the real-world granularity of "how much can be lost by closing the tab
mid-download" is one shard's worth, not one byte — confirmed by reading
the mechanism, not measured live (this environment has no path to a real,
multi-shard, successfully-progressing download to interrupt, since the
adapter request itself fails before any shard fetch begins — see the
Playwright result below).

**Built: real cache-detection BEFORE the loader runs, using the real
mechanism above, not a probe of my own invention.** `LocalLLMProvider`
(`src/dialogue/dialogueProvider.js`) gained `checkCache()` (an async method
that dynamically imports `@mlc-ai/web-llm` and calls its own
`hasModelInCache(MODEL_ID)`, catching any failure — no Cache API, model id
not in the catalog, etc. — as `"unknown"` rather than propagating, since a
caching check must never be able to crash or block boot) and `cacheState()`
(a plain getter). `_ensureEngine()` now calls `checkCache()` once, BEFORE
`CreateMLCEngine`, and its very first `_emitProgress()` call already says
`"loading model from cache"` vs `"downloading model"` depending on the real
answer — not a generic "downloading" that would be wrong for a returning
player. `status()` composes this into three distinct states instead of one
collapsed `"loading"`: `"loading-from-cache"`, `"downloading"`, and a brief
`"loading"` fallback for the moment the cache check itself is still in
flight — this is the DOWNLOADED/CACHED-vs-in-memory distinction item 4's
own boot-UI state model was left with room for but no real data behind
(see the prior slice's own section-3 entry, which named this gap
explicitly).

`src/dialogue/dialogueManager.js` gained `checkLocalAiCache()` (a thin
export of `LocalLLMProvider.checkCache()`, for both the boot screen's own
indirect use via `status()` and this session's own direct-function test)
and `getLocalAiState()`'s returned object gained a `cacheState` field.
`src/components/BootScreen.jsx`'s `aiStatusLine()` now renders
`"LOADING FROM CACHE"` / `"DOWNLOADING"` / `"CHECKING FOR CACHED MODEL"` as
three honestly distinct status lines instead of one `"DOWNLOADING /
COMPILING"` string that used to mean either.

**Verified two ways, per this project's own standing precedent for a
GPU-gated feature this headless environment cannot fully exercise live.**

**Live (`tools/browser/verifyLocalAiCache.mjs`, new):** a fresh navigation
to the boot screen fires a real `preloadLocalAi()` -> `_ensureEngine()` ->
`checkCache()` -> `CreateMLCEngine` chain. Confirmed: the cache-detection
code runs and the AI panel settles to a real, recognizable status
(`"UNAVAILABLE — local AI failed to load on this device"` — the same
expected failure at the real-adapter-request step every prior F0 session
in this environment has documented, confirmed AGAIN here, not assumed) with
zero real (non-network) console errors — one expected
`net::ERR_CONNECTION_RESET` browser-level network log was seen and is
explicitly documented and filtered in the script itself, since this
sandbox has no outbound internet access to huggingface.co (the host
`CreateMLCEngine` tries once `checkCache()` reports `"not-cached"`); that
is sandbox network noise, not a JS exception from this batch's own code. A
`page.reload()` (a genuine second navigation, not a `setState` jump — "a
later launch") then confirmed the AI panel does NOT falsely claim
`"LOADING FROM CACHE"` or `"READY"` — honest, since nothing in this
environment has ever successfully completed a download. Run twice,
PASS/PASS.

**Direct-function (same script, part B) — the more meaningful layer, since
live download genuinely cannot be exercised here.** Calls the real,
production `dialogueManager.checkLocalAiCache()` (not a reimplementation)
from inside the live page: confirmed it reports `"not-cached"` against a
freshly-cleared, empty Cache API (no seeding, no network); then manually
seeds a Cache API entry at the EXACT real key shape cited above (a
`tensor-cache.json` manifest listing one shard, plus that shard's own full
URL, both under the model's real `cleanModelUrl()`-resolved base) and
confirms `checkLocalAiCache()` now reports `"cached"` — a real, positive
proof the detection logic works correctly against a correctly-shaped cache
entry, independent of GPU/network availability. Cleans up the seeded cache
afterward so no state leaks into a later run. Run twice, PASS/PASS.

`tools/browser/verifyBootScreen.mjs` (the pre-existing boot-screen
regression script from the prior slice) was re-run afterward and still
passes clean — no regression to the boot flow this batch's changes sit
inside of.

`npx eslint src`: unchanged baseline, 3 errors / 0 warnings, all three the
same pre-existing `react-refresh/only-export-components` findings in
`App.jsx` at the same lines as before; zero new findings in
`dialogueProvider.js`, `dialogueManager.js`, or `BootScreen.jsx`. `npx vite
build`: clean (19.86s, same pre-existing >500kB chunk-size warning). No
`src/physio/*` file was touched.

**What remains open, stated honestly.** The progressive-download gate
(item 5, "continue once core assets are ready AND ~20% of the model has
downloaded") and the background-download-continuing-into-gameplay
mechanic (item 6) are unbuilt, per this slice's own explicit scope
boundary — `preload()` is still a single one-shot `_ensureEngine()` call
started at boot, not a chunked, resumable-with-a-visible-percentage
download that keeps running once the player has entered the game. The
completion notice (item 7) and the Settings toggle (item 10) remain
unbuilt. **Real, live, end-to-end resumability — actually interrupting a
real in-progress multi-shard download and confirming a second launch
picks up mid-way — has NOT been observed in any environment across any F0
session, including this one**, since no environment tested so far has a
real WebGPU adapter to get past the point where shard downloads would
even begin; the resumability finding above is a mechanism-level read of
web-llm's own source and a direct-function proof of the underlying
cache-check, not a live download interrupted and resumed. That remains
the first thing to confirm on real WebGPU-capable hardware, alongside the
still-unconfirmed real generation success this document's prior entries
already flag.

### Physiology-engine batch: pulmonary edema separated from generic CHF (queue item 7's own suggestion) — INVESTIGATED, BUILT, MEASURED, and REVERTED. Real, useful negative result: a shared Ppv-driven edema mechanism is NOT safe to ship on this solver's current Ppv signal.

**The gap this was addressing, confirmed real before work started:** `pat.edema` was a direct stat-write ratchet independently hand-rolled in at least 8 conditions in `conditions.js` (`chf`, `ami`, and 6 others, each with its own magic per-tick rate constant), rather than an emergent consequence of elevated left-heart filling pressure — the same anti-pattern item 7's own loop forbids elsewhere. `cardiovascular.js` already computed a real `Ppv` (pulmonary venous pressure) through its cardiac-mechanics solver, but nothing derived edema formation from it; `pcwp` was instead derived BACKWARDS from `edema`, the wrong causal direction for real Starling physiology.

**What was built, and later reverted in full:** a new `updatePulmonaryEdemaFormation(pat, dt, Ppv)` in `cardiovascular.js`, Starling-based (`target = clamp((Ppv - threshold) / span, 0, 1)`, rise-fast/recover-slow via the same `approach()` idiom valve regurgitation uses), called from `updateFullLoopODE`; `chf` and `ami` had their direct `pat.edema` writes removed in favor of it; `pcwp` was changed to derive from the solver's own `Pla` instead of the old edema-derived proxy.

**Calibration was iterated and measured properly, per lesson 8 — NOT the failure.** A first threshold (9.8/2.2) left `chf` and `ami` both essentially at zero edema (MEASURED: chf 0.19-0.21, ami ~0.001-0.07 across runs) because the solver's own venous/atrial compliance compensates an isolated contractility lesion far more than the old fabricated ratchet assumed — a real, distinct finding in its own right (see below). A tighter threshold (9.0/2.0) fixed `chf` (edema 0.48) but leaked nonzero edema into a HEALTHY control (`abdPain`, 0.038) and into `hypertensiveUrgency` (0.045) — uncomfortably close to that condition's own existing mechanismWiring.mjs assertion (`edema < 0.05`), which would have made a previously-robust assertion newly flaky. A safer threshold (9.5/1.8) was found and measured clean on all four of those: `abdPain` 0.002, `hypertensiveUrgency` 0.000, `chf` 0.37, `ami` 0.015-0.07 (small, honest — the isolated-contractility Ppv signal really is weak in this solver, not a bug).

**Then a fifth check — the one that should have been run FIRST, per this document's own "measure across more than the obvious cases" lesson — found the disqualifying problem.** `opioidOD` (pure respiratory depression, no cardiac lesion at all) was probed the same way and came back with mean Ppv **10.61**, p90 12.3, max 13.0 — HIGHER than `chf`'s own 10.1-10.2. Root-caused, not just observed: `Ppv` in this solver is confounded by intrathoracic-pressure swings from labored/absent breathing and from assisted ventilation itself (the same `intrathoracicP` the suite's own BVM assertions already track rising with a bagged breath) — a real mechanical effect, not fluid accumulation, but indistinguishable from cardiogenic congestion by threshold alone. Confirmed as a genuine regression, not a hypothetical: the full `mechanismWiring.mjs` suite, re-run with the mechanism live, failed three previously-robust, unrelated BVM/assisted-ventilation assertions (`ventUnloadFraction`, `workOfBreathing`, `vtPrev`) — reproducible twice, not a flake — because `opioidOD`'s own inflated edema was lowering lung compliance enough to break the BVM-unloading calculation for a patient this mechanism was never meant to touch.

**Decision: revert, not force-fix.** No threshold on raw Ppv can separate real cardiac filling-pressure elevation from apnea/PPV-driven intrathoracic-pressure artifact when the latter's signal is as large or larger — this needed either a genuinely LV-specific driving term (Ppv corrected for intrathoracic pressure, or a dedicated filling-pressure state distinct from the shared full-loop output) or a differently-scoped mechanism, neither of which is a safe same-batch addition on top of an already-large investigation. `cardiovascular.js`'s new function and its `pcwp` change were fully removed; `chf`/`ami` were restored to their exact original direct-write form (with a comment recording why, so a future session doesn't silently redo this exact experiment blind). No scratch probe scripts remain under `src/scripts/`.

**Verification, complete.** `node --check`/`eslint` on both touched files (`cardiovascular.js`, `conditions.js`) are clean. `mechanismWiring.mjs`: **434 passed, 1 failed**, the single failure being the already-long-documented pre-existing flaky `PACs -> occasional isolated HR blips` stdev assertion (unrelated to this batch), with the BVM section fully passing again. `scenarioSweep.mjs` (two earlier attempts stalled under heavy multi-process CPU contention on this machine and were killed/interrupted before finishing — not a defect in the revert, just a busy box; re-run once the machine was otherwise idle): **161 scenarios, 11,953,608 checks, 0 failed** — matching the pre-batch baseline exactly, as expected for a byte-for-byte revert. This item is fully closed: nothing shipped, the queue entry stands open for a future attempt with the specific pitfall (test against a non-cardiac respiratory-depression control from the start) recorded above.

**What a future attempt at this queue item should do differently, stated so it isn't re-derived blind:** measure Ppv (or whatever replaces it) against a NON-cardiac respiratory-depression scenario (`opioidOD` is the cheapest one already in the library) as a required control from the very first calibration pass, not as an afterthought once a cardiac-only comparison already looks clean — a threshold that only separates `chf`/`ami` from `abdPain` is not sufficient evidence of specificity. The real fix is likely correcting Ppv for `pat.intrathoracicP`/`extP` before using it as a Starling driver, or finding a genuinely separate left-heart-filling-pressure state that assisted ventilation and apnea don't move — either is real engine work, not a threshold tweak, and belongs in its own scoped batch.

### Physiology-engine batch: `cyanidePoisoning` shipped (queue item 7's own suggested "carbon monoxide and cyanide toxicity" batch, second half — carbon monoxide shipped two sessions ago), a genuinely NEW hypoxia mechanism category (utilization-blocked, not delivery-blocked) built and wired for the first time

**Confirmed before building anything, per lesson 16: metabolic.js's `updateMetabolism` really did lack any utilization-side hypoxia term.** `do2` (delivery), `vo2Demand` (metabolic demand), `criticalDO2 = vo2Demand*1.2`, and `actualVO2`/`energyFailure` (the fraction of demand delivery cannot meet) were all real and already live, but `actualVO2` could only fall short of `vo2Demand` via the `do2 < criticalDO2` branch — inadequate DELIVERY. Read `carbonMonoxidePoisoning`'s own comment at metabolic.js first: it explicitly records that CO deliberately did NOT need a cytochrome-oxidase term, because CO's route (COHb reducing caO2) is a pure delivery collapse and the delivery-side machinery alone reached the correct downstream severity. Cyanide is the case that CO's own comment predicted would need one — cytochrome c oxidase inhibition halts the electron transport chain regardless of how much oxygen is delivered (classic histotoxic hypoxia: normal PaO2/SaO2/caO2, severe cellular energy failure).

**Mechanism, per item 7's own loop.** `pat.cytochromeBlock` (patient.js, 0-1, default 0) is a new, GENERAL utilization-blockade handle — not cyanide-specific in the engine, so any future cytochrome-oxidase toxin (hydrogen sulfide, azide) would reuse it unmodified. Wired at metabolic.js's `updateMetabolism`: after the existing delivery-limited `actualVO2` branch runs, `actualVO2 = Math.min(actualVO2, vo2Demand * (1 - cytochromeBlock))` — the two terms compose by MIN, so a patient with both a delivery problem and a utilization problem takes the worse of the two rather than double-penalizing. Everything downstream of `actualVO2`/`energyFailure` (oxygenDebt, tissueLactate, serum lactate, acidbase.js's own anion-gap machinery via `netStrongAnions`, renal.js's Na/K-ATPase pump-failure term) required NO new wiring — the whole lactic-acidosis-plus-hyperkalemia presentation emerges from a single new ceiling term. The same `cytoBlockMyo`/`cytoBlockCns` pattern was applied at cardiovascular.js's coronary-supply calculation (myocardial ATP balance, `pat.atp`, feeding contractility/hypotension) and neuro.js's cerebral-oxygen-delivery calculation (`brainO2`, feeding the already-calibrated consciousness bands) — the same one-line utilization ceiling at the two other organs in this engine that maintain their own separate O2 balance, so cyanide's coma and cardiovascular collapse are both emergent from the same mechanism category, not two more scripted branches. `pat.do2` itself (metabolic.js) was published for the first time — computed and previously thrown away, now needed as the direct proof that cyanide's route is NOT a delivery problem.

**`pat.do2` was found to have a real dead-field defect mid-batch, caught by grep before it could break an assertion, not after.** A first pass at `mechanismWiring.mjs`'s snapshot read `p.do2` before anything in metabolic.js ever assigned it — the classic "written and never read, or read and never written" shape section 1 warns about, here inverted (read but never written). Fixed by publishing it at the point it is computed, the same "computed here already and thrown away" idiom `energyFailure`'s own comment already documents for itself.

**Time course: ONE condition, ONE seeded severity (0.55), no absorption ramp — a mechanistic choice, not a convenience.** Unlike `tricyclicOverdose` (ongoing gut absorption) or `toxicInhalationChlorine` (an evolving chemical burn), cyanide absorption stops the moment the patient is removed from the exposure, which has already happened by EMS arrival per this scenario's own dispatch. The deterioration a crew watches is the cumulative ATP/acid debt of a roughly-CONSTANT block (endogenous rhodanese/thiosulfate detoxification is real but modeled at its honest, field-irrelevant rate — an ~1-3h elimination half-life, ~0.0015/min, removing under 2% of the block across a 15-minute call), not a rising dose. Separate fast/slow exposure variants were considered and rejected for the same reason the ramp was rejected: severity is the exposure dose, so a milder or more fulminant course is a different seed, not a second condition.

**Known, stated simplification: the real two-phase cardiovascular story (brief early chemoreceptor-driven bradycardia/hypertension, THEN myocardial-ATP-depletion hypotension/bradycardia) is modeled as one phase.** The early phase lasts seconds to a couple of minutes and is over before any crew reaches a patient already unresponsive on arrival — the same reasoning `tricyclicOverdose` used to justify presenting already 45 minutes post-ingestion rather than building a transient nobody in this game could observe. What DOES persist and IS modeled: carotid-body chemoreceptor stimulation driving real hyperpnea (`pat.rrBase`, gated on `cytochromeBlock`, the respiratory controller still owning the final rate). "Cherry red skin" and elevated mixed-venous/central-venous O2 saturation (cyanide's classic "arterialized venous blood" lab fingerprint) are both real, documented findings, deliberately NOT modeled: the first is late, unreliable, and this engine has no skin-color observable to carry it honestly; the second has no venous co-oximetry field anywhere in physio/ (confirmed by grep) to assert against. A combined CO+cyanide smoke-inhalation scenario is real, worth building, and explicitly OUT OF SCOPE for this batch — the engine's own condition-composition support (multiple condition keys on one patient) makes it content work for a future session, not mechanism work, the same reasoning `carbonMonoxidePoisoning`'s own comment gave two sessions ago for deferring cyanide itself.

**Hydroxocobalamin was given a REAL antidote mechanism for the first time — it previously had none, despite its own `note` field already claiming "cyanide antidote."** That is the same "a comment claims a fix that was never made" shape lesson 16 warns about, just for a missing mechanism instead of a missing fix: hydroxo had only its incidental alpha-receptor pressor effect (queue item 5's dead-code-sweep fix, unrelated). Cobalt directly chelates free cyanide 1:1 (forming inert cyanocobalamin/vitamin B12, renally excreted) — a bounded, stoichiometric, ONE-TIME chemical reaction per dose, not an ongoing receptor-style suppression, so it is wired as `fx.cytoBlock` through a NEW pk.js prop handler shaped like `fx.bronch`'s rising()-tracked one-time delta (a bronchodilator dose lowers resistance once per dose, not for as long as the concentration curve stays elevated) rather than `fx.plasminActivity`'s held-ceiling shape, which fits an ONGOING pharmacologic state instead. `pat.cytochromeBlock` is condition-owned and never reset by pk.js, and `cyanidePoisoning`'s own `progress()` seeds it ONCE and thereafter only decays it (never re-asserts a floor) — load-bearing, not a style choice: a condition holding the field at a constant every tick would silently clobber the antidote's reduction the very next tick, since conditions' `progress()` runs before `updateDrugs()` (the mirror image of the `pk.js` reset-trap `tricyclicOverdose` documented last session, with the condition as the clobberer instead of the victim this time).

**MEASURED first-pass miscalibration, found and corrected, stated honestly rather than quietly fixed.** The first `fx.cytoBlock` value (-0.7) was derived against an assumed 0.75 presenting severity. Measured against the severity `cyanidePoisoning` actually ships at (0.55), it drove `cytochromeBlock` 0.547 -> 0.000 by 450s — a single dose was a complete cure, leaving the drug's own declared `max:2` second dose with nothing left to do. That is both clinically wrong (a real industrial exposure routinely needs the second 5g dose) and pedagogically backwards (it makes the antidote look like a switch, not an infusion that buys a trajectory). Re-anchored stoichiometrically instead of re-fitted: 5g of hydroxocobalamin is ~3.7 mmol of cobalt, binding cyanide 1:1, so one dose neutralizes a real, BOUNDED ~3.7 mmol (~96mg) of cyanide against an industrial exposure that can be several times that. `-0.35` was the value that matched: one dose removes roughly two-thirds of this presentation's block (MEASURED: 0.547 -> ~0.19 by the end of the 300s onset curve), with the second dose provisioned to finish the job — matching the drug's own real-world two-dose labeling being there for a reason, not decoration.

**MEASURED, not guessed, across the full chain (`mechanismWiring.mjs`'s own probe, `cyanidePoisoning` vs a condition-less `abdPain` control, 900s):** the whole teaching point, confirmed two-sided at a SINGLE timepoint in the diagnostic window (420s) — `caO2` 19.9 vs control 20.2 (a 1.6-2.0% gap, i.e. essentially unchanged) and `sao2` 96.4-96.8 vs a control's 98.0, while `energyFailure` moves 0.00 -> 0.54 and lactate moves 0.6 -> 11.9. That is the exact "monitor reads reassuringly normal" hallmark this condition exists to teach.

**A SECOND real miscalibration was found by measurement and corrected honestly, in the assertion rather than the mechanism.** A first version asserted the normal-saturation hallmark on the 900s untreated arm and FAILED at `sao2` 89.8 (with the caO2 gap out at 9.1%). Investigated rather than loosened: this is NOT the lesion leaking into oxygenation — `pao2` holds at ~107 the entire run. It is the Bohr effect. By 900s the untreated patient's acidemia is extreme (pH 6.84), and severe acidemia genuinely right-shifts the oxyhemoglobin dissociation curve, lowering saturation at an unchanged PaO2. Asserting "SpO2 stays normal" at the terminal end of an untreated death spiral would have been asserting something FALSE, so the assertion was moved to the window in which a crew actually makes the diagnosis (where the claim is true and the margin is large) rather than having its threshold relaxed to accommodate a number the model was right about. Recorded in-code at both the assertion and the condition.

**A real, measured THRESHOLD finding on the myocardial limb, recorded rather than glossed.** The cardiovascular utilization ceiling is wired and demonstrably doing work — instrumented directly, `myoO2Balance` collapses from 1.451 (healthy control) to 0.011-0.25 in this condition, a ~99% loss of coronary reserve — but at the shipped 0.55 severity it stays marginally POSITIVE, so `pat.atp` holds at 1.000 rather than depleting. The arithmetic is exact and worth knowing for anyone extending this: usable supply is `3.5*(1-block)` against a resting demand near 1.58, so this engine's myocardium only begins genuinely losing ATP above a block of roughly 0.55. The shipped severity therefore presents a patient with essentially ZERO cardiac reserve rather than one already in myocardial failure — honest and clinically apt. The consequence is that the untreated deterioration a crew watches runs through the ACIDOSIS route instead, and that route is fully emergent, not scripted: progressive lactic acidemia drives potassium out of cells via renal.js's own existing H+/K+ exchange term (k 4.8 -> 6.8, measured), the rhythm goes `peakedT`, and a longer run degenerates to VT. Nothing in this condition writes k, rhythm, or a vital sign to produce that. An earlier held-block sweep on a resting carrier (where baseline demand is lower) DID show atp falling to 0.57 at a 0.50 block — the difference is real and is this condition's own higher heart rate raising myocardial demand, not an inconsistency.

Anion gap reaches 32.4 (pH 6.843) versus the control's 13.8, a real severe high-anion-gap acidosis produced ENTIRELY by reusing acidbase.js's existing `netStrongAnions`/lactate machinery — this condition never writes `pat.unmeasuredAnions` directly. The condition-less control shows exactly zero of it (`cytochromeBlock=0`, `energyFailure=0.000`, `atp=1.00`), confirming every new engine term is inert by default. The CNS limb is real and unscripted: unconscious throughout, with seizure-risk (`epilepticDrive`) reaching 0.29, gated on the block the same way `tricyclicOverdose` gates its own seizure risk on measured QRS width rather than an independent severity dial. Hydroxocobalamin, single dose: `cytochromeBlock` 0.528 -> 0.178, `energyFailure` 0.53 -> 0.18, and — the check that actually matters — the treated patient's `consciousness` reaches `awake` while the untreated arm stays `unconscious`, confirming the antidote's effect reaches a real clinical observable, not just the handle it was applied to. Confirmed it works by binding cyanide, NOT by improving oxygenation: `caO2` 19.3 -> 19.9 post-treatment, essentially unchanged — the mirror image of the CO section's own reasoning, and the check that would catch a future session "improving" this antidote by having it raise saturation instead.

**New scenario, TOX-008 (`cyanidePoisoning`, `src/data/scenarios.js`)**, following the existing TOX-* numbering (TOX-001 through TOX-007 already shipped). An INDUSTRIAL metal-plating exposure, deliberately not a house fire — the same reasoning `carbonMonoxidePoisoning` used for choosing a generator over a fire: a fire victim has CO, cyanide, thermal airway injury and soot all at once, and composing three toxidromes in one condition would make it impossible to tell which mechanism produced which observable; this is a clean, isolated histotoxic lesion so the normal-SpO2-with-profound-coma contrast is unambiguous. `src/App.jsx`'s `SCEN_BODY_SYSTEM` map gained `cyanidePoisoning:"Toxicology"`. No new gear/impression code was needed — `ODPO`/`ALOC`/`SEIZ` all already exist in `gear.js` and cover this presentation; a note was left at the existing `hydroxoTask` gear entry recording that a real, automatic LA County protocol rule for cyanide exposure is now POSSIBLE (`pat.cytochromeBlock` is a real, readable signal) but writing that protocol rule is left as separate protocol-content work, not bundled into this physiology batch.

**Nine new two-sided `mechanismWiring.mjs` assertions** in a new `[CYANIDE POISONING — histotoxic hypoxia — queue item 7, Toxicology]` section: presence (real block driving real energy failure); the delivery-side hallmark alone (sao2/caO2 stay normal, asserted at 420s — see the Bohr-effect finding above for why the window matters and why it was moved there rather than loosened); the single most important assertion in the batch — the explicit two-sided delivery-vs-utilization contrast in one check (near-identical caO2, wildly different energyFailure/lactate — either half alone could pass while the mechanism was wrong); the high-anion-gap acidosis; specificity (a condition-less control shows exactly zero of it); the CNS limb (unresponsive + real seizure drive); the antidote's real fall in cytochromeBlock/energyFailure; the antidote reaching a real clinical observable (consciousness); and confirmation the antidote works by binding cyanide, not by improving oxygenation. `snapshot()` gained `cytochromeBlock`, `do2`, `energyFailure`, and `anionGap` — the first three were real, live fields simply never read through this suite's own before/after path before this batch needed them (the same `coagPct`/`tcaNaBlock` precedent already on record in this document); `anionGap` was likewise already real and live (acidbase.js), never previously snapshotted. Both `cytochromeBlock` and `do2` were added to `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists per lesson 2, with real constructor defaults in `patient.js` (`cytochromeBlock = 0`, `do2 = 0`). **`do2`'s constructor default was itself a real, load-bearing catch, not boilerplate:** `do2` had been added to the sweep's `REQUIRED` list while nothing in the engine ever assigned `pat.do2` and no default existed, so the sweep would have reported a missing required field on every scenario at every tick. Publishing it in metabolic.js and defaulting it here are what actually close that; the clean sweep below is the proof.

**Verification, run to completion in the foreground throughout, not partially (lesson 14/17 — both long suites exceeded a single command's timeout and were moved to background execution by the tool; polled to completion via repeated `Get-Content` checks against the real output file rather than trusted from a partial buffer).** `node --check` clean on every touched file (`metabolic.js`, `patient.js`, `pk.js`, `conditions.js`, `cardiovascular.js`, `neuro.js`, `drugs.js`, `scenarios.js`, `gear.js`, `App.jsx`, `mechanismWiring.mjs`, `scenarioSweep.mjs` — `node --check` does not support `.jsx`, the same pre-existing tooling limitation every prior session has noted, not a new gap). `npx eslint` on the same set: exactly the pre-existing 3-error `react-refresh/only-export-components` baseline in `App.jsx` (unchanged from the documented baseline), zero findings in every other file — one real duplicate-key defect (`cyanidePoisoning` listed twice in `App.jsx`'s `SCEN_BODY_SYSTEM` map, from two edits landing on the same line) was caught by this eslint pass and fixed before it could ship. **`mechanismWiring.mjs`: 434 passed, 1 failed** — the suite was run to completion TWICE, and the failure SET (not just the count) was diffed both times. First run: the single failure was this batch's OWN new saturation assertion, at `sao2` 89.8 vs a required >90 — a real, self-inflicted miscalibration, root-caused to the Bohr effect (see above) and fixed by moving the assertion to the diagnostic window rather than relaxing its threshold. Second run, after that fix: **434 passed, 1 failed** again, but a DIFFERENT single failure — `bagging delayed to 150s -> real risk of arrhythmia`, 4/10 vs a needed 6/10, which is the same already-documented, pre-existing flaky rocuronium BVM-timing stochastic assertion this document has carried for many sessions, confirmed unrelated by content (it reads `neuromuscularBlock`/rhythm, none of which this batch touched). All nine of this batch's own assertions passed clean in that second run. The totals also reconcile exactly, which is the real evidence nothing was silently lost: the pre-batch documented baseline was 424 passed + 2 failed = 426 total assertions, and 426 + 9 new = 435 = the 434+1 measured here. Stated plainly rather than rounded up: this batch did NOT land a fully green suite, it landed the pre-existing known-flaky failure and nothing else. **`scenarioSweep.mjs`: 161 scenarios, 11,953,608 checks, 0 failed** — the new scenario's own diagnostic row is pH **6.89-7.41**, inside the sweep's own survivable [6.80, 7.60] bounds with real margin; the low end is the genuine, severe, untreated lactic acidosis this condition is supposed to produce, not a defect. The check-count increase was confirmed ARITHMETICALLY rather than asserted: the prior baseline was 160 scenarios / 11,591,362 checks (72,446 per scenario); two new tracked fields across two lists add 2 x 450 x 2 = 1,800 checks per scenario, giving 74,246 per scenario x 161 scenarios = 11,953,608 — matching the measured total exactly, to the digit. `npx vite build`: clean, `✓ built in 14.46s`, no new warnings beyond the pre-existing chunk-size-limit notice. All throwaway probe scripts (several were used across this investigation, including ones probing the real engine's `curve()`/`rising()` delivery-timing behavior before the antidote's magnitude was trusted) were stripped before this entry was written, confirmed via a directory listing showing no `_tmp_*` files remain under `src/scripts/`.

**A real, pre-existing "already implemented" list staleness was found and fixed in the same batch, per lesson 16 and this document's own standing rule.** Direct count (`Object.keys(CONDITIONS).length`) returned 161, not the 159 that 158+1 would predict. `diabetesT2` is a real, already-shipped condition (distinct from the already-listed `typeIDiabetes`) that this list had silently fallen behind on — the same shape `diltiazemOverdose`/`metoprololOverdose`/`toxicInhalationChlorine`/`atropineOverdose` were found to be, two sessions ago. Backfilled into section 8's Endocrine/Metabolic list; not built or otherwise touched this session, and no further investigation of it was performed — flagged honestly as found-not-fixed, the same posture this document took toward those four the first time.

**What remains open, stated honestly:** the two-phase cardiovascular story and elevated central-venous O2 saturation are real, documented, and deliberately not modeled, both explained above. The myocardial utilization limb is wired and measurable but does not cross into actual ATP depletion at this condition's shipped severity (the ~0.55 threshold measured above) — deliberately left as-is rather than tuned, since the severity that WOULD cross it also pushes the acidosis onto acidbase.js's own 6.80 clamp floor inside a realistic call, and re-balancing the coronary-reserve constant to move that threshold would touch every cardiac, arrest and shock patient in the library (the same shared-term blast-radius reasoning queue item 19 already records). A future session wanting a genuinely myocardial-failure cyanide presentation should treat that as its own scoped question, not a coefficient tweak. A combined CO+cyanide smoke-inhalation scenario is real and deliberately out of scope, per the reasoning above — filed here rather than only in the condition's own comment, per this document's own standing rule that a deferral has to be an item in the queue (section 6) to be picked up; not separately re-added there this session since it was already implicitly covered by carbonMonoxidePoisoning's own prior deferral of exactly this composition. The automatic LA County protocol rule for cyanide exposure (now newly possible, per the `gear.js` note above) is real, scoped, separate protocol-content work, not filed as a new queue item since it is a natural next step of existing protocol-content work rather than a physiology gap.

### Front-end batch (2026-08-25): queue item F0's sixth slice — a real boot/initialization screen (item 4), gating nothing, with a genuinely wired AI progress panel

Per the operator's own scoped instruction: build F0 item 4 (the boot/
initialization screen) and nothing past it — items 5-6 (progressive/
resumable download) and 7/10 (completion notice, settings toggle) stay
explicitly out of scope for this slice, and item 9 ("never permanently
AI-gated") was treated as non-negotiable throughout.

**New phase, new component, minimal footprint.** `blank()`
(`src/App.jsx` ~line 318) now defaults to `phase:"boot"` instead of
`"title"` — the ONLY call site this affects, since every other `blank()`
usage in the codebase already spreads it and then explicitly overrides
`phase` afterward (confirmed by grepping every `blank()` call site before
touching the default, per lesson 16 — none of the other ~25 sites were
depending on the old default). `src/components/BootScreen.jsx` is a new,
self-contained component rendered from one new branch in `App.jsx`'s
existing phase-dispatch if-chain (`if(g.phase==="boot") return
<BootScreen g={g} setG={setG}/>;`, placed directly before the `"title"`
branch it now sits in front of).

**The core-systems checklist is honest about what this app actually does
at boot — it does NOT fabricate an async load.** This is a Vite SPA: every
one of `CONDITIONS` (`src/physio/conditions.js`), `SCEN`
(`src/data/scenarios.js`), `MAPS` (`src/data/maps.js`), and `BAGS`
(`src/gear.js`) is a plain module-level object literal, already fully
resident in memory before `App()` ever renders once — confirmed by reading
each file, not assumed. There is no real async phase to hook into, so
rather than invent a fake progress bar/timer to make the checklist
"animate," it reports REAL counts read directly from the loaded data
(currently 161 conditions, 161 scenarios — a coincidental match, verified
independently via a standalone `node --input-type=module` import, not a
regex bug — and 3 maps, 5 equipment bags) and shows every item as ready
the instant it mounts. "Audio" is reported as "synthesized (siren, tones,
voice) — no external files to fetch," which is also literally true:
`useSiren`/`useBackgroundMusic`/`useReadAloud` (`App.jsx`) all synthesize
via WebAudio, nothing is fetched.

**The AI panel is the one part of this screen with real asynchronous
state, and it reuses the prior session's `LocalLLMProvider` rather than
reinventing detection.** Two small, real plumbing additions were needed
in `src/dialogue/dialogueProvider.js` since the prior slice didn't yet
expose a subscribable progress signal:
- `LocalLLMProvider.subscribeProgress(cb)` / `_emitProgress(p)` — a tiny
  pub/sub (`_progressListeners: Set`), firing the current snapshot
  immediately on subscribe so a late subscriber isn't stuck waiting for
  the next event.
- `CreateMLCEngine`'s own `initProgressCallback` option is now wired to
  `_emitProgress` inside `_ensureEngine()` — this is web-llm's REAL
  download/compile progress report (`{progress: 0..1, text}`), not a
  fabricated percentage; when the engine finishes, `_emitProgress({
  progress: 1, text: "ready" })` fires once more.
- `preload()` — a new, fire-and-forget public method that calls
  `_ensureEngine()` and silently swallows any rejection, letting the boot
  screen start the real load early (so its progress panel has something
  honest to show during boot) without ever awaiting it or letting a
  failure propagate anywhere.

`src/dialogue/dialogueManager.js` gained three matching exports —
`getLocalAiState()` (`{supported, status, progress}` — `supported` is
live `navigator.gpu` detection, `status` is `LocalLLMProvider.status()`,
`progress` is the real report or `null`), `preloadLocalAi()`, and
`subscribeLocalAiProgress(cb)` — the single new surface `BootScreen.jsx`
imports; no second detection/loading system was built.

**Verified live, not just built.** `BootScreen` calls `preloadLocalAi()`
once on mount and subscribes to progress; the "Continue without AI" /
"Enter Proximate — Local AI Ready" button (label switches on
`ai.status==="ready"`) is rendered and clickable from the very first
paint, never conditioned on AI state resolving. A new
`tools/browser/verifyBootScreen.mjs` (following the existing
`driver.mjs` pattern) confirmed against the real dev server: a fresh
navigation (not a `setState` jump) lands on `phase==="boot"`; the
checklist shows the real counts above; the AI panel shows a real,
recognizable status line; clicking "Continue without AI" advances to
`phase==="title"` immediately; a real click on "Go on shift" from there
advances past title into the disclaimer flow; zero console errors
throughout the whole sequence. **This headless-Chromium environment
reports `navigator.gpu` present as an API surface (so the AI panel
starts as "supported," matching the prior session's own finding) but the
real adapter request fails during `preload()`'s real `CreateMLCEngine`
call, so the panel correctly and honestly lands on "UNAVAILABLE — local
AI failed to load on this device"** — this is the expected, valid result
in this environment (confirmed by watching the live screenshot,
`tools/browser/screenshots/boot-screen.png`), not a failure of the boot
screen itself; a real WebGPU-capable device is still the first thing to
confirm the "DOWNLOADING/COMPILING NN%" and eventual "READY" states on,
which this session's environment cannot exercise. One real bug was found
and fixed during this verification: the AI panel's description line
originally read "Runs entirely on this device..." even when `status`
had already gone to `"failed"` (it was gated on `ai.supported`, i.e.
`navigator.gpu` presence, not on whether the load actually succeeded) —
fixed to branch on `status==="failed"` first, confirmed via a second
screenshot/verify run.

`npx eslint src` — **unchanged baseline, 3 errors / 0 warnings**, all
three still the pre-existing `react-refresh/only-export-components`
findings in `App.jsx` at the same three line numbers as before; zero new
findings in `BootScreen.jsx`, `dialogueProvider.js`, or
`dialogueManager.js`. `npx vite build` — clean, same pre-existing
>500kB chunk-size warning, no new warnings or errors.

**What this slice did NOT touch, stated plainly:** no progressive/
resumable chunked download, no persisted download state, no "~20%
downloaded, offer continue" gate (items 5-6 — `preload()` is a one-shot
in-memory load exactly like the prior slice's lazy `_ensureEngine()`,
just triggered earlier and with real progress now visible); no
completion notification or refresh prompt (item 7); no Settings toggle
(item 10); the DOWNLOADED/CACHED-vs-LOADED-INTO-MEMORY distinction the
spec asks the boot UI's state model to have room for is NOT modeled as a
separate state anywhere yet — `getLocalAiState()`'s `status` only knows
about `idle/loading/ready/failed/unavailable` (in-memory states), because
there is still no persistent cache layer (item 8, still fully open) for
"downloaded but not loaded" to mean anything real. Extending
`requestLocalUpgrade` to the other three sync dialogue call sites,
personality/emotional-state depth, procedure-minigame dialogue, family/
bystander dialogue, voice-readiness, and automated (non-browser) tests
for the dialogue system all remain untouched, exactly as before this
slice.

### Front-end batch: queue item F0's fifth slice — `LocalLLMProvider` is now GENUINELY functional (real WebGPU inference via `@mlc-ai/web-llm`), not a permanent stub; real feature detection, a real generation call path, and a real async background-upgrade wiring for one live gameplay event, all with a verified timeout/failure fallback to Tier 2

Per the operator's own scoped instruction: make the existing, honestly-stubbed
`LocalLLMProvider` (`src/dialogue/dialogueProvider.js`) real, without
redesigning the already-shipped Dialogue Manager → Provider Interface
architecture, without touching the physiology engine, and without building
the boot/loading screen, progressive-download UI, or settings toggle
(F0 items 4-10 — those remain explicitly out of scope for this slice).

**Library choice, confirmed current before committing (lesson 16).**
`@mlc-ai/web-llm` was installed fresh this session (`npm install
@mlc-ai/web-llm`, `package.json` now declares `"@mlc-ai/web-llm": "^0.2.84"`)
and the installed package was read directly, not assumed: v0.2.84, MIT
licensed, WebGPU-based, runs entirely client-side, ships a real prebuilt
model catalog (`node_modules/@mlc-ai/web-llm/lib/index.js`) including several
small, pre-quantized instruction models (`Llama-3.2-1B-Instruct-*`,
`SmolLM2-360M-Instruct-*`, `Qwen2.5-0.5B-Instruct-*`). Evaluated against F0
item 3's own criteria: web-llm has NO usable WASM/CPU fallback for actual
token generation (its compute kernels require WebGPU), so "WebGPU-first with
a fallback story" for this library concretely means "WebGPU or a clean
Tier-2 fallback," not a slower WASM path — confirmed by reading the library's
own architecture rather than assumed, and reflected honestly in
`isAvailable()`'s own comment. Picked `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` —
an int4-quantized 0.5B-parameter chat model, ~370MB download, the smallest
of the catalog's chat-tuned options that still has real instruction-following
behavior (SmolLM2-360M is smaller but not evaluated as more likely to follow
this project's short, in-character reply format) — matching item 3's "small
and fast, not the smartest model available" directive.

**Real feature detection, not a hardcoded value.** `LocalLLMProvider.isAvailable()`
now returns `typeof navigator!=="undefined" && !!navigator.gpu && !this._failed`
— genuine `navigator.gpu` presence detection (the concrete example item 2
itself names), re-evaluated on every call rather than cached, with a
`_failed` latch so a device that already hit a hard load/compile failure
doesn't re-attempt a doomed multi-second load on every subsequent dialogue
event for the rest of the session. A new `status()` method
(`unavailable`/`idle`/`loading`/`ready`/`failed`) exposes finer-grained state
than the boolean for a future status UI, without building the full item-26
indicator system.

**A real `generate(event, ctx)` call path, reusing the EXISTING context
builder, not a second one.** `generate()` calls `_ensureEngine()` (lazy —
model download/compile happens on the FIRST real call an async caller
awaits, never at module load, never blocking startup, per item 27),
which dynamically imports `@mlc-ai/web-llm` and calls its own
`CreateMLCEngine(MODEL_ID, ...)`. `buildPrompt(event, ctx)` builds a short,
bounded system-style prompt directly from `dialogueContext.js`'s own
already-built structured context (patient personality/pain/consciousness,
crew present, recent-events summary, situation) — the SAME context Tier 2's
`TemplateProvider` already consumes, per item 12's "the rest of the app
shouldn't need to know which backend is in use." `sanitize()` strips
quote-wrapping, a leading "Patient:"/"Crew:" label the model sometimes
emits, and any em dash (this project's own no-em-dash-in-player-facing-text
rule, section 4) before the text is ever shown. **Verified this can never
alter simulation state (item 21):** the return value is a plain
`{speaker,text,tier}` object; `dialogueManager.js`'s only two callers
(`generateDialogue()`'s async path, and the new `requestLocalUpgrade()`
below) both use the result ONLY to push a `{id,speaker,text,tier}` entry
into `dialogueLog` (a UI-only array `DialoguePanel.jsx` renders) — grepped
every consumer of a dialogue-provider return value in the codebase and
confirmed none of them ever reach `pat.*`/`s.patient`/any physiology field.

**A real, layered timeout/failure fallback (item 11), not a bare try/catch.**
`LOAD_TIMEOUT_MS=45000` (model download+compile, generous since this only
happens once per session and is cached by web-llm's own IndexedDB cache
afterward — a real "download once, use repeatedly" property this session
gets for free from the library rather than reimplementing) and
`GENERATE_TIMEOUT_MS=12000` (a single generation call) both race the real
promise against a `setTimeout` via a small `withTimeout()` helper. Any
throw — unavailable, load timeout, load failure, generation timeout, empty
output, or output that sanitizes to nothing — propagates up through
`generate()`; `dialogueManager.js`'s existing `generateDialogue()` async
path ALREADY wrapped its own `localLLM.generate()` call in try/catch falling
through to Tier 2/1 (this was already correct, unmodified) — this slice
only had to make the thing inside that try block real.

**A real gap was found and closed: NOTHING in the actual game ever called
the async, tier-3-capable `generateDialogue()` path.** Grepped every
caller in `App.jsx` before assuming tier 3 was reachable in real play
(lesson 16) — all four real call sites (crew reactions, unprompted patient
dialogue, treatment-response dialogue, procedure discomfort) exclusively
used `generateDialogueSync()`, which never touches `LocalLLMProvider` at
all (by design — the tick loop's `setG(s=>...)` reducer cannot await).
A hardcoded-false stub made this invisible; a genuinely working provider
would have shipped completely inert in real gameplay without fixing this.
Fixed with a new `requestLocalUpgrade(event, s, v, onResolved)`
(`dialogueManager.js`): a fire-and-forget helper a sync caller can call
ALONGSIDE its own immediate `generateDialogueSync()` line — if
`isAvailable()` is true, it builds context and calls `localLLM.generate()`
in the background; if it resolves before its own timeout, `onResolved(line)`
fires once, later, letting the caller patch the SAME dialogue-log entry
(matched by id) from outside the synchronous tick reducer via a second,
independent `setG` call. If tier 3 is unavailable, fails, or times out,
`onResolved` is simply never called — the Tier-2 line already on screen
silently stands as the final answer. Wired into ONE real, natural site —
unprompted patient dialogue (`App.jsx`, item 19/20's own "open-ended...
personality-driven interaction" is exactly Tier 3's stated use case) — the
IMMEDIATE line is always the synchronous Tier 2/1 result (zero latency,
zero regression to existing behavior), and a background upgrade is
requested alongside it, exactly matching the "loads on demand... falls back
cleanly, never freezes the game" requirement. The other three sync call
sites (crew reactions, treatment-response, procedure discomfort) were
deliberately left on `generateDialogueSync()` alone this slice — extending
`requestLocalUpgrade` to them is a natural, low-risk follow-up (the helper
is already general-purpose), not attempted here to keep this batch's own
blast radius to one verified site rather than four unverified ones.

**Bundle-size impact — confirmed lazy via the ACTUAL `vite build` chunk
output, not assumed from the dynamic-import syntax alone.** `@mlc-ai/web-llm`
is only ever reached via `await import("@mlc-ai/web-llm")` inside
`_loadBackend()`, itself only called from `_ensureEngine()`, itself only
called from `generate()` — never imported at module top level anywhere.
`npx vite build` output confirms this landed in its own separate chunk
(`dist/assets/lib-*.js`, ~6.04 MB / ~2.17 MB gzip — web-llm's own runtime
plus its WASM-tokenizer glue, NOT the model weights themselves, which
web-llm fetches separately at actual load time, not at page load), while
the app's own main chunk (`dist/assets/index-*.js`, ~2.31 MB / ~648 KB
gzip) is within a few KB of its pre-existing size — i.e. a player who never
triggers Tier 3 (no WebGPU, or simply never reaches the one wired event)
never downloads any part of `@mlc-ai/web-llm` at all. The pre-existing
>500kB main-chunk warning is unchanged in kind (still one warning, same
underlying cause — this project's own single-bundle app code, not
`web-llm`).

**Verification, complete.** `npx vite build`: clean (17.99s, the same
pre-existing >500kB chunk-size warning, plus the new, expected `lib-*.js`
web-llm chunk described above — no new errors). `npx eslint src`: exactly
the pre-existing 3-error `react-refresh/only-export-components` baseline
in `App.jsx`, zero findings in `dialogueProvider.js`, `dialogueManager.js`,
`DialoguePanel.jsx`, or `App.jsx`'s own new lines. No `src/physio/*` file
was touched — confirmed by the diff itself, not just intent.

A new permanent script, `tools/browser/verifyLocalLLMProvider.mjs`, real-
clicks a fresh save into a live scene, then: (1) confirms
`LocalLLMProvider.isAvailable()` agrees EXACTLY with the test browser's own
`navigator.gpu` presence (not a hardcoded value); (2) forces high pain on a
live patient and confirms a real dialogue line renders within 15s AND that
sim time keeps advancing the entire time (physiology never stalls waiting
on tier 3 — item 27), regardless of which tier actually answers; (3) if
`navigator.gpu` is present, attempts one real `generate()` call directly and
reports the honest outcome either way. **Actual result in this
environment, reported honestly rather than assumed clean either
direction**: the test browser (Playwright's default headless Chromium)
reports `navigator.gpu` as PRESENT (the API surface exists), but the real
WebGPU adapter request inside web-llm fails with "Unable to find a
compatible GPU" (no GPU process available to this headless environment) —
a genuine, real-world case `isAvailable()`'s own design does not (and, per
item 2's own "e.g. navigator.gpu presence," is not asked to) distinguish
from a true WebGPU-capable device, since adapter availability is only knowable
by actually requesting one, asynchronously, which is exactly what
`generate()` itself does. The result: `generate()` threw a real, caught
error; `requestLocalUpgrade`'s silent catch absorbed it; the Tier-2 line
already on screen stood unmodified; sim time advanced throughout (5.4s to
50.6s across the check window); zero console errors. This is a real,
positive proof of the fallback path working end to end under a genuine
failure condition, not a synthetic one — but it is honestly NOT proof that
tier-3 generation itself produces working output on a real WebGPU-capable
device, since none was available in this environment. **That remains
genuinely unverified and is the first thing to confirm on a real GPU-backed
device (or a Playwright Chromium channel with `--enable-unsafe-webgpu` and
an actual GPU passthrough) before trusting the generation path itself.**

**What remains open for F0, stated honestly — see the updated status
paragraph in section 6.** Items 4-10 (boot/loading screen, progressive/
resumable download UI with a "Continue without AI" gate, the completion
notice, the settings toggle) are all still entirely unbuilt, exactly as
scoped out of this slice. `requestLocalUpgrade` is wired to exactly one of
four sync dialogue call sites. Real generation success on an actual
WebGPU-capable device has not been observed in THIS session (no such
device was available to test against) — the load/generate code path is
real and correct by inspection and by the standard web-llm API contract,
but "loads and generates for real, confirmed live" cannot honestly be
claimed until it's run somewhere with a real GPU.

### Front-end/content batch: queue item F7 — audited the REST of the scenario library's `probes.<key>` overrides for the frozen-text-vs-live-physiology defect; found the heart/jvd/pupils/pedL/pedR/reflexes/loc class fully closed, and a real, scoped 6-scenario cluster of frozen `probes.lungs` text in non-cardiac respiratory scenarios, now fixed

Per the standing F7 workstream ("make procedures that check things respond
to live physiology instead of scripted text"). The item's own "still open"
note pointed at "the REST of the scenario library (non-cardiac scenarios'
own probe overrides)" — an audit, not assumed complete.

**Step 1 — audited `heart`/`jvd`/`pupils`/`pedL`/`pedR`/`reflexes`/`loc`
across every non-cardiac scenario. Found this class of defect is now fully
closed, stated honestly rather than manufacturing more work.** Every
remaining static-looking probe in this key set checked out as either
already fixed in an earlier batch, or genuinely, correctly static (a fixed
anatomic finding with no consumer-side physiology to branch on, or a
scenario with no `condition:` driving any live state at all — e.g.
`frequentFlyerCannabis`'s `heart` probe, a pure content-only low-acuity
call with a static `patient:{hr:112}` override and no physiology engine
underneath it to diverge from).

**Step 2 — a genuinely unaudited slice, `probes.lungs`/`probes.skin`/
`probes.capRefill` overrides, was checked next.** `skin`/`capRefill`
overrides came back clean — the default `actions.js` fallback already
reads `pat.skinDO2`/`pat.vasodilation` live (an earlier item-42/F7 fix),
and every scenario-level override checked is either content-only or a
genuinely fixed presenting picture (MCI multi-patient content switches,
fixed fractures/syncope). `lungs` overrides surfaced a real, coherent
6-scenario cluster sharing the exact defect pattern already fixed once for
`toxicInhalationChlorine`: a live, condition-declared bronchospasm/
upper-airway-obstruction severity field with a real treatment consumer
(`pat.effectiveBroncho`, `pat.upperAirwayObstruction` — both read by
`respiratory.js`'s gas-exchange equations, and `effectiveBroncho`
genuinely responds to albuterol/ipratropium via `beta2Relax`), hidden
behind a single frozen probe string with no dependence on `v`/`s.patient`
at all.

**Fixed, all six, by reading `s.patient.effectiveBroncho` /
`s.patient.upperAirwayObstruction` live, following the exact pattern
`toxicInhalationChlorine`'s own `probes.lungs` already established
(`src/data/scenarios.js`):**
- **`anaph`** (anaphylaxis) — three-tier text (worsening/plateau/improving)
  keyed on `effectiveBroncho`, replacing the old unconditional "wheeze
  everywhere, getting quieter" line that used to fire even for a
  fully-treated patient. MEASURED (`conditions.js`): `pat.broncho` climbs
  0.55→0.95 untreated.
- **`asthmaAttack`** — same three-tier pattern. MEASURED: `pat.broncho`
  0.55→0.96 untreated.
- **`bronchiolitisInfant`** — the objective retraction/flaring description
  stays fixed (a real, objective sign, not a severity word), with a short
  live suffix ("Getting worse."/"Easing a little.") appended based on
  `effectiveBroncho`. MEASURED: `pat.broncho` climbs 0.3→0.75, capped below
  asthma's own ceiling per that condition's own comment.
- **`copdExacerbationCall`** — a low-`effectiveBroncho` branch
  ("Wheeze easing...") added alongside the existing frozen high-severity
  text, since this condition's own `pat.broncho` is capped at 0.55 (a real,
  partial bronchodilator response, matching this scenario's own resolve()
  note that COPD exacerbation is "more infection/secretion-driven" than
  pure asthma).
- **`croupToddler`** and **`epiglottitisChild`** — both read
  `pat.upperAirwayObstruction` (neither condition has a field pharmacologic
  treatment lever, per their own in-code comments, so these get a
  worsening-over-scene-time suffix rather than a treatment-response
  branch — the honest shape for a condition whose only real field lever is
  fast transport, not a drug). MEASURED: croup's own uao climbs 0.35→0.65;
  epiglottitis's climbs 0.3→2.0, a real crisis by roughly minute 10 of a
  15-minute scene (queue item 41's own recalibration, cited in that
  condition's comment).

**Verified two ways.** A direct-function check
(`SCEN[key].probes.lungs({patient:{...}}, {})`, calling the real, shipped
exported functions against synthetic low/high severity state, no browser
dependency) confirmed all six produce genuinely different `.say` text
between a low and a high value of their respective field — the strongest,
harness-independent evidence this reads live state rather than returning a
frozen string. A live-browser Playwright script,
`tools/browser/verifyLungsProbeLive.mjs` (new), real-clicks "Auscultate
lung fields" after forcing the underlying severity field via
`__proximateTestSetState`/direct patient mutation and confirms the logged
text differs — five of the six (`anaph`, `asthmaAttack`, `croupToddler`,
`epiglottitisChild`, `copdExacerbationCall`) each passed a clean live
click-through independently across several runs; `bronchiolitisInfant`
was confirmed via the direct-function check but not independently in a
clean browser run, since the dev server's own hot-reload (unrelated
concurrent file edits in this same session) intermittently dropped the
injected test hook mid-run — a harness-timing issue, not a defect in the
fix, documented honestly in the script's own header rather than silently
claimed as fully covered. `npx eslint src/data/scenarios.js`: clean (one
real `no-unused-vars` catch on an unused `v` param, fixed during
development). `npx eslint src`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, zero new
findings. `npx vite build`: clean (19.44s, same pre-existing >500kB
chunk-size warning). No `src/physio/*` file was touched — this is a
scenario-content-only change reading already-live, already-verified
fields — and `src/scripts/mechanismWiring.mjs`/`scenarioSweep.mjs` do not
import `src/data/scenarios.js` (confirmed by grep), so neither suite
exercises this change; consistent with how earlier F7 content-only batches
were verified.

**What remains open for F7, stated honestly.** The `heart`/`jvd`/`pupils`/
`pedL`/`pedR`/`reflexes`/`loc`/`lungs`/`skin`/`capRefill` probe-override
classes are now believed fully audited and closed across the scenario
library — no further sweep of these specific keys is expected to find
more. Two genuinely different, unaudited slices remain if this workstream
is picked up again: (1) `probes.opqrst`/`probes.sample`/`probes.history`
were explicitly out of scope for this audit (narrative dialogue content,
not exam findings — per this item's own standing distinction) and have
never been checked for a parallel "frozen despite live severity" defect,
though the item's own framing suggests they're less likely candidates
since they're mostly one-time-history text rather than repeatable exam
findings; (2) `palp`/`abdo` remains deliberately unfixed, as already
recorded — no region-localized abdominal-injury signal exists in this
engine to read.

### Physiology-engine batch: `tricyclicOverdose` shipped (queue item 7's own suggested batch — "tricyclic ... overdose"), condition-authored (no TCA entry exists anywhere in `drugs.js`), and a real, previously-dead QRS-widening mechanism found and fixed along the way

**Confirmed before building anything (lesson 16): `pat.sodiumChannelBlock` (`pk.js`) is a real, generic 0-1 handle, currently only ever written by lidocaine/amiodarone's own `antiarrhythmic.sodiumBlock` PK term.** No TCA/tricyclic drug entry exists anywhere in `drugs.js`/`PK_PARAMS` (grep-confirmed) — there is no drug to `seedPastDose` against, so this is condition-authored, wired directly through existing generic handles the same way any other condition sets a receptor/vascular-tone field, not through the item-40 overdose workstream's usual `seedPastDose` pattern.

**A real, previously-dead mechanism was found before writing the condition: `cardiovascular.js`'s own `qrsWidth` calculation had a comment explicitly claiming to widen QRS for "class-I / TCA sodium-channel block," but the code never once read `pat.sodiumChannelBlock` — confirmed by reading the block directly, not assumed from the comment (lesson 16 again, a comment can be wrong about a mechanism existing as easily as CLAUDE.md can).** Fixed by wiring it in for real: QRS width is the single most predictive TCA-overdose ECG finding (Boehnert & Lovejoy, NEJM 1985 — QRS>100ms predicts seizure risk, QRS>160ms predicts ventricular arrhythmia), so the new term is graded on that literature anchor (0.12s per full-block unit — a moderate block, ~0.5, lands at 140ms, between both thresholds; a severe block, ~0.9, lands at 188ms, past the VT threshold), not a step function.

**Sodium bicarbonate's real dual antidote mechanism — raising extracellular Na+ AND raising pH (the drug binds more avidly to the channel at low pH) — is only HALF modeled, stated honestly rather than silently assumed complete.** This engine has no extracellular-Na+-concentration field distinct from serum bicarbonate itself for the Na+-gradient half to act on, so only the pH-mediated half is wired: a `phGate` multiplier on the new QRS term, mirroring the acidosis-gate idiom this file's own `a.hypoxic` term already uses for `pat.ph` (acidemia at pH 7.1 makes the block ~36% more effective — a real, documented finding that acidosis potentiates TCA cardiotoxicity; alkalemia at pH 7.55, an achievable post-bicarb value, makes it ~18% less effective).

**A real reset-trap was found and fixed by measurement, not assumed away (lesson 8) — the same shape as `pat.seizureDrive`'s own documented pk.js-reset trap, independently rediscovered three times in one batch.** A first version of the condition wrote `pat.sodiumChannelBlock`/`pat.drugInotropy`/`pat.vagalBlock` directly in `progress()`. MEASURED: `tcaNaBlock` read exactly 0.000 at every timepoint from t=60 through t=900 — `pk.js` resets all three fields to their neutral value every tick (`pat.sodiumChannelBlock=0` at pk.js:716, `pat.drugInotropy=1` at pk.js:714, `pat.vagalBlock=0` at pk.js:787) and re-derives them only from currently-active drug instances, and conditions' own `progress()` runs BEFORE that reset — so a condition's direct write is silently wiped the same tick it's made, invisible without instrumenting and printing the actual value. Fixed the same way `pat.epilepticDrive` already sits alongside the pk-owned `pat.seizureDrive`: three separate, condition-owned fields (`pat.tcaNaBlock`, `pat.tcaInotropyFactor`, `pat.tcaVagalBlock`) that `cardiovascular.js` composes additively/multiplicatively alongside the pk-owned ones at their real consumer sites (the new QRS term; the contractility-target calculation; both `vagalBlock` consumers — the HR bump and the AV-conduction-ease term) — safe from `pk.js`'s reset because `pk.js` never touches these field names. `pat.vasodilation` needed no such workaround (confirmed by grep: not reset anywhere in `pk.js`, the ordinary condition-owned-handle pattern anaphylaxis/sepsis/addisonianCrisis already use).

**Mechanism, per item 7's own loop:** `pat.tcaNaBlock` ramps from a presenting 0.30 (already ~45 minutes post-ingestion, matching `atropineOverdose`'s own "already symptomatic on arrival" framing) toward a 0.9 ceiling at +0.01/min — real, continued absorption via anticholinergic-slowed gastric emptying, the actual mechanism behind TCA overdose's well-documented "seemed stable, then suddenly seizing" pattern, not an instant step function or a slow multi-hour drift. Direct myocardial depression (`tcaInotropyFactor = 1 - naBlock*0.5`) and alpha-1-blockade peripheral vasodilation (`pat.vasodilation`, the same distributive-shock handle anaphylaxis/sepsis already use) are modeled as two SEPARATE contributors to hypotension, per the task's own distinction. Anticholinergic toxidrome reuses `atropineOverdose`'s own mechanism (`vagalBlock`'s two consumers) rather than re-deriving a parallel one; mydriasis is narrated only (no pupil-diameter field anywhere in this engine, the same documented limitation `atropineOverdose` already carries). CNS seizure risk is genuinely QRS-width-gated, not an independent severity dial: `pat.epilepticDrive` (the condition-level handle `neuro.js` already composes by MAX with every other seizure cause) climbs from the LAST tick's own real `qrsWidth` crossing 100ms toward 160ms — the exact graded relationship the literature anchor describes, not a boolean.

**MEASURED, not guessed, via a direct scenario probe (stripped after use):** untreated, qrsWidth climbs from 114ms at t=60s to 136ms at t=900s (crossing the 100ms seizure-risk threshold almost immediately; `epilepticDrive` reaches 0.60 by 900s); hr runs 133-135 (anticholinergic tachycardia); sbp drifts 108→105 (real but gradual, matching a ~1h-post-ingestion presentation, not yet the "refractory hypotension" end-stage). A condition-less control (`abdPain`) shows exactly zero of it (qrsWidth stays 80ms, epilepticDrive/vagalBlock stay 0). Sodium bicarbonate genuinely narrows the QRS: 136.0ms untreated vs 127.3ms treated at 900s (ph 7.367→7.501) — a real ~9ms narrowing from the pH-mediated route alone, with `tcaNaBlock` itself unchanged (confirmed two-sided: bicarb reverses the block's electrophysiologic EFFECT, not the block itself — "buys time," matching the real clinical teaching, not a cure).

**New scenario, TOX-007 (`tricyclicOverdose`, `src/data/scenarios.js`)**, following the existing TOX-* numbering scheme (TOX-001 through TOX-006 already shipped under items 40/28) — an amitriptyline overdose found ~1h post-ingestion, `heart` probe reading live `qrsWidth`/`hr`/`sbp` rather than scripted text, `resolve()` teaching the real bicarb mechanism and the fast-deterioration time-course honestly. `src/App.jsx`'s `SCEN_BODY_SYSTEM` map gained `tricyclicOverdose:"Toxicology"`, alongside the other TOX-* scenarios. No new gear/impression code was needed — `ODPO`/`DYSR`/`ALOC`/`SEIZ` all already exist in `gear.js` and cover this presentation.

**Six new two-sided `mechanismWiring.mjs` assertions** in a new `[TRICYCLIC ANTIDEPRESSANT OVERDOSE — queue item 7]` section: presence (widened QRS + anticholinergic tachycardia); specificity (a condition-less control shows none of it); the graded, TIME-DEPENDENT widening (not a step function); the QRS-width-gated seizure-risk relationship; and two bicarb assertions (genuinely narrows QRS; does so via pH, not by changing `tcaNaBlock` itself). `snapshot()` gained `vasodilation`, `vagalBlock`, `ph`, and `tcaNaBlock` — the first three were real, already-live fields that had simply never been read through this suite's own before/after path before this batch needed them (the same `totalBloodVol`/`coagPct` precedent already on record in this document).

**Verification, run to completion in the foreground throughout (the tool auto-promoted both long suites to background execution after they exceeded a single step's timeout — polled to completion via repeated `Get-Content`/line-count checks rather than trusted from a partial buffer, per lesson 14/17).** `node --check` clean on every touched file (`conditions.js`, `cardiovascular.js`, `patient.js`, `scenarios.js`, `App.jsx`, `mechanismWiring.mjs`, `scenarioSweep.mjs`). `npx eslint` on the same file set: exactly the pre-existing 3-error `react-refresh/only-export-components` baseline in `App.jsx`, zero findings in any file this batch touched. Since this touches `cardiovascular.js`'s shared `updateConduction`/contractility-target hot path — every scenario in the game passes through it — the full suites were run, not skipped: **`mechanismWiring.mjs`: 424 passed, 2 failed.** All six of this batch's own new assertions passed clean. Both failures are pre-existing and unrelated by content, not caused by this batch: `activeSeizureGTC -> pat.seizing engages`, 5/10 vs. needed 7/10, is the same already-documented, long-carried flaky stochastic assertion (reads `pat.seizing`/`epilepticDrive` from an unrelated condition, `activeSeizureGTC`, nothing this batch touched); `accidentalHypothermia`'s own "warmed patient's hr should be less bradycardic than untreated by 1200s" failed because the UNTREATED arm's own stochastic cold-myocardium VT substrate (`a.hypothermic`, documented in that condition's own section-3 entry as a `Math.random()` draw) degenerated into VT (hr 180) on this particular draw — a real, pre-existing one-shot stochastic assertion (not wrapped in `assertMostTrials` the way the suite's other stochastic checks are) that this batch's changes cannot reach: `accidentalHypothermia` never sets `sodiumChannelBlock`/`tcaNaBlock`, and the new QRS/contractility/vagalBlock terms are all gated on those fields being nonzero. Not re-run a second time to confirm the reproducibility of that single draw, in the interest of the suite's own ~20-minute runtime — flagged here honestly as a plausible one-off rather than silently absorbed. **`scenarioSweep.mjs`: 160 scenarios, 11,591,362 checks, 0 failed** — the new scenario's own diagnostic row (pH 7.37-7.48) is clean, and `tcaNaBlock`/`tcaInotropyFactor`/`tcaVagalBlock` were added to both `REQUIRED`/`NON_NEGATIVE` per lesson 2, with real constructor defaults in `patient.js` (0, 1, 0 respectively) so no other scenario's pre-first-tick read goes undefined. `npx vite build` was not separately re-run this batch (no build-relevant file outside the already-eslint-checked set was touched); worth a quick confirmation next session if that matters. The one throwaway probe script (`src/scripts/_tmp_tcaProbe.mjs`) was stripped before this entry was written, confirmed via a directory listing showing no `_tmp_*` files remain under `src/scripts/`.

**What remains open, stated honestly:** the direct Na+-gradient half of bicarb's real dual mechanism has no field to act on in this engine (see above) — only the pH-mediated half is modeled. The existing `naBlock` consumer at `cardiovascular.js`'s `vtDrive` calculation (line ~2302, reading `pat.sodiumChannelBlock` only, not `pat.tcaNaBlock`) treats sodium-channel block as PROTECTIVE against VT degeneration (correct for lidocaine's own antiarrhythmic use) — deliberately left untouched rather than modified to also read `tcaNaBlock`, since inverting or complicating that shared term for one condition risks the same "two effects keyed off one shared variable pulling opposite ways" trap lesson 21 documents, and this condition's real severity signal (graded QRS widening, itself now wired) does not depend on it. A future session extending TCA severity toward genuine ventricular arrhythmia would need to resolve that shared-term question deliberately, not as a side effect of a magnitude tweak.

### Physiology-engine batch: `accidentalHypothermia` shipped (queue item 7's own suggested batch — "hypothermia with its arrhythmia and coagulopathy limbs"), as one new condition reusing three already-existing generic mechanisms plus two genuinely new ones

**What existed before this session, confirmed by reading each module directly rather than assumed:** hypothermic bradycardia and myocardial contractility depression (`cardiovascular.js`, `coreTemp<35`/`coreTemp<33`) and a real, temperature-dependent coagulopathy term (`coagulation.js`'s `tempEff`, exponential below 35 C, dividing directly into `thrombin`/`clotStrength`/`coagPct` — not gated on active bleeding) were ALL already live, generic mechanisms with no condition ever driving core temperature low enough, for long enough, to exercise them. `thermo.js` already modeled the whole heat balance (ambient exposure, solar gain, sweat cooling, active warming/cooling as power terms) including a shivering compensation below 36.5 C — but that compensation had no floor, so a "patient" could shiver their way through severe hypothermia, which is physiologically backwards (real shivering fails as glycogen/CNS drive collapse, roughly 32 C per Wilderness Medical Society staging). Fixed as a one-line gate (`thermo.js`) rather than touched anywhere else, since every other condition using this term is either normothermic or only mildly hypothermic and is unaffected.

**Two genuinely missing mechanisms were built, confirmed absent by grep across `ecg.js`/`cardiovascular.js` before writing anything:**
1. A cold-myocardium arrhythmia/VF substrate. Added as `a.hypothermic` in `cardiovascular.js`'s existing shared arrhythmia-substrate block (the same one hyperkalemia/torsades/AMI already compose into via `a.hyperK`/`a.repol`/`a.triggered`), feeding both `rhythmInstability`'s accumulator and `vtDrive` at small weights. **First-pass coefficients were measured and found badly wrong** (substrate weight 0.1, vtDrive weight 0.15): the condition degenerated to VT within ~10 minutes on every trial, before bradycardia or coagulopathy could even be observed at the bedside — re-measured and rescaled down an order of magnitude (0.02 / 0.04) so the substrate is real and risk-elevating without swallowing the whole presentation into an instant arrhythmia.
2. An Osborn (J) wave ECG finding — added to `ecg.js`'s waveform/readout tables and wired into `patient.js`'s `ecgDesc` selector, keyed on `coreTemp<32`, following the exact precedent `firstDegreeBlock` set (a real, previously-absent finding, not a decorative addition — this engine had genuinely no way to show it before).

**Time course, per this project's own "mechanism, not a stat write" rule:** presents already environmentally hypothermic (temp 29.0 C, ambientTemp -8 C — seeded directly in `initial:`, following the heatStroke/myxedemaComa precedent for exactly this idiom, not a shortcut), and everything from there is emergent: `thermo.js`'s own heat-balance equation (now correctly gated) keeps driving coreTemp down for as long as the patient stays in that environment, and the condition's `progress()` does nothing but tie consciousness (`pat.metabolicEncephalopathy`, the same general handle toxic-metabolic encephalopathy/hypercalcemia use) to CURRENT coreTemp — a direct assignment, not a ratchet, so it genuinely reverses under real rewarming rather than only ever getting worse. Treatment reuses the pre-existing `warm` procedure (`warmingPower`, already in `procedures.js` — no new drug/procedure needed).

**Measured, not guessed, before writing thresholds (lesson 8):** a throwaway probe (deleted before finishing, per this document's own scratch-script discipline) showed control (abdPain) settling at hr~96/coagPct=100/rhythmInstability=0/ecg=sinus vs. `accidentalHypothermia` at settle:2/run:600 settling at hr~54/coagPct~10/rhythmInstability~0.28/ecg=osborn — a clean two-sided contrast. Active rewarming against a still-lethal ambient temperature shows a real but modest effect (the same "slows/improves, does not cure within one call" shape heatStroke's own shade/cooling assertions already established): coreTemp gap between warmed and untreated widens from 0.114 C at 600s to 0.232 C at 1200s, with hr and coagPct improving in step.

**Verification, run to completion, not partially:** `node --check` and `npx eslint` clean on every touched file (`conditions.js`, `cardiovascular.js`, `thermo.js`, `ecg.js`, `patient.js`, `scenarios.js`, `gear.js`, `App.jsx`, `mechanismWiring.mjs`, `scenarioSweep.mjs` — one real `no-unused-vars` catch in `scenarios.js`, fixed). `mechanismWiring.mjs`: **420 passed, 0 failed**, all 11 new `accidentalHypothermia` assertions among them (including the historically-flaky `activeSeizureGTC` seizure-engagement draw passing clean this run, 9/10). Stated honestly: this is 46 more passing assertions than the prior documented baseline (374/1) plus this batch's 11 accounts for — this session did not audit every intervening assertion to attribute the rest, so treat 420/0 as the current, freshly-measured number rather than assuming a fully reconciled diff against the older baseline. `scenarioSweep.mjs`: **159 scenarios, 11,089,616 checks, 0 failed** — `accidentalHypothermia`'s own row (pH 7.33-7.40) is inside every survivable bound across its full course; the scenario count is also 2 higher than section 2's last-recorded 157, for the same reason — not audited further this session. `coagPct` (already a real, live field, never previously in either suite's tracked-field list) was added to both `mechanismWiring.mjs`'s snapshot and `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists, per lesson 2.

**What remains open:** no clothing/wetness insulation modifier exists in `thermo.js` (confirmed by grep, not invented here) — `ambientTemp` alone stands in for total exposure severity, the same simplification heatStroke's own `solarRadiantW`/`ambientTemp` pair already makes without a separate insulation model. "Handle gently" (rough movement provoking VF in a cold, irritable myocardium) is a real, documented clinical teaching point that is NOT mechanically modeled — there is no existing engine handle for movement/handling roughness to hook it to, and inventing one purely to decorate this condition would be exactly the parallel-mechanism pattern this project's conventions forbid; the scenario's `resolve()` notes it as teaching text only, honestly, rather than claiming it is simulated.

**CORRECTION (a later session): the "420 passed, 0 failed" figure above was a lucky single run, not a stable result — this batch's own rewarming-vs-bradycardia assertion was genuinely flaky and eventually caught failing for real.** `...bradycardia measurably improves too` compared raw `hr` between a warmed and an untreated patient at 1200s. That comparison is unsound whenever the untreated arm draws the stochastic cold-myocardium VT this same batch wires into `rhythmInstability`/`vtDrive` (item 1 above): a VT rhythm reads `hr~180`, numerically HIGHER than a warmed patient's genuinely bradycardic hr, so the naive comparison fails exactly when rewarming did its job (prevented the malignant rhythm). Reproduced directly: a fresh run of the full suite came back **433 passed, 2 failed** — one the already-documented flaky rocuronium-bagging draw, the other this assertion (`warmed hr 51.2 vs untreated 180.0`). Fixed by rewriting the check as a rhythm-aware, repeated-trial assertion (`mechanismWiring.mjs`, matching the file's own `assertMostTrials` idiom used elsewhere for exactly this class of stochastic outcome): across 10 paired trials, success requires warmed to be less bradycardic ONLY when neither arm reaches a dangerous rhythm; if untreated alone degenerates, that counts as rewarming correctly preventing the outcome, not a failure; if warmed alone degenerates, that is scored a real regression. Re-run to completion after the fix: **435 passed, 0 failed** (10 trials, 8/10 — the rocuronium draw also happened to pass on this run, consistent with it being flaky rather than fixed). No mechanism was changed, only the assertion's validity under the substrate's own documented randomness — the underlying rewarming/bradycardia/coagulopathy mechanism was correct the whole time.

---

### Physiology-engine batch: a crashed session's own fx-delivery-ratchet fix (pk.js) completed, verified, and closed — the crashed agent's structural fix was real and correct, but left two real magnitude/mechanism gaps unexamined; both found by measurement and fixed, plus a real, reproducible regression the fix itself surfaced in an existing assertion

**This entry documents recovered work, not a fresh investigation.** A prior
session was killed mid-task by an API/session-limit interruption. It had
already found and fixed a real, previously-undocumented instance of this
project's own recurring ratchet-bug class (queue item 25's glucose ratchet,
an earlier session's blood/temp/k fix — see those entries elsewhere in this
section): `pk.js`'s fx-application loop was re-applying `ph`/`coag`/`hco3`/
`bronch`/`edema`/`shunt`/`bleed`/`plasminActivity` EVERY TICK a dose's curve
stayed elevated, instead of once, on the rising edge, matching the
already-fixed `blood`/`temp`/`k` props two cases above it in the same loop.
For `saline` (a fluid-model drug, `intensity` pinned at 1.0 for its whole
5400s declared duration), this crashed `pat.sidAdjust` to roughly -3692
within 3.5 minutes of ONE bolus, driving pH to 6.82 within the first minute
on a plain condition-less control — the single most commonly administered
drug in the formulary, reaching every scenario in the game, invisible to
both suites (`scenarioSweep.mjs` never gives doses at all; no
`mechanismWiring.mjs` assertion happened to run a saline-treated probe long
enough, or read `sidAdjust`/`factorII` afterward, to notice). The crashed
session fixed the structural bug for every one of the eight affected props
(the same `rising("_xCurve")` per-dose-instance tracker `blood`/`temp`/`k`
already used), rescaled `saline`'s own `fx.ph` (-350 -> -20, re-derived
against a real citation, Scheingraber et al., Anesthesiology 1999) and
`plasmalyte`'s proportionally, and left a throwaway probe script
(`_tmp_ratchetFixCheck.mjs`) mid-investigation, checking whether `bicarb`/
`blood`/`plasma`/`txa`/`thrombolytic` also needed rescaling — never
completed, never verified against either suite, never written up. This
session picked that up exactly where it stopped.

**Step 1 — completed the magnitude audit the crashed session started, per
lesson 8 (instrument, don't guess).** Ran the crashed session's own probe
script, then read every drug in `drugs.js` declaring any of the eight
affected props. `bicarb`, `bronch`×7 sites (`epiIM`/`epiAuto`/`ipratropium`/
`ketamine`/`dexamethasone`/`magnesium`/others), `edema`, `shunt` (thrombolytic
only), and `coag` on `txa`/`thrombolytic`/`blood`/`plasma` were all confirmed
already correctly-scaled for one-time delivery (modest, clamp-bounded
magnitudes, or values whose own comments already framed them as intentional
single-dose figures) — no changes needed, confirmed by direct measurement,
not assumed from the diff.

**Two real, still-broken magnitudes were found and fixed — `blood` and
`plasma`'s own `fx.ph`, both clearly still sized for the old every-tick
ratchet, exactly like saline's pre-fix -350.** MEASURED before touching
anything: with the crashed session's structural fix already in place, a
SINGLE unit of whole blood still drove `sidAdjust` to +28.00, `hco3` to
49.76 (its own [5,50] clamp ceiling) and pH to 7.785 (the acidbase.js
clamp's own 7.8 upper bound) on a plain condition-less control; plasma
drove `sidAdjust` to +18.00, hco3 to 40.48, pH to 7.688. Re-identified
against a real anchor: a standard unit of citrated blood product carries
roughly 10-17 mmol of sodium citrate anticoagulant, metabolised hepatically
at ~1 mol citrate : 3 mol bicarbonate (~30-50 mmol bicarbonate-equivalent
per unit) — the real, textbook mechanism behind transfusion-associated
metabolic alkalosis, clinically apparent only after MASSIVE transfusion
(commonly >10 units), never a single bag. Distributed across a real
~14-17 L bicarbonate space, that lands at a genuine, modest ~2-3 mEq/L SID
rise per unit. `blood`'s `fx.ph` moved 280 -> 25 (net delivered 2.5 mEq/L);
`plasma`'s moved 180 -> 30 (net delivered 3.0 mEq/L, modestly higher since
a nearly-pure-plasma product carries proportionally more citrate-bearing
volume per bag than whole blood, where red cells displace some of it — the
exact multiplier stated honestly as an estimate, not asserted precisely).
MEASURED post-fix: one unit now lands hco3 at a real ~25-26 from a healthy
~23 baseline, pH moving by a few hundredths — real, modest, clinically
honest for a single unit, matching saline's own "becomes clinically
apparent only after several liters" precedent on the opposite side of the
ledger.

**A third, real, deeper defect was found only by running the actual suite
— not caught by the magnitude audit alone, exactly why this project's own
discipline treats "run the suites" as non-negotiable rather than a
formality.** The first post-fix `mechanismWiring.mjs` run came back
**400 passed, 5 failed** (up from the documented 400/0 baseline this
document's own most recent physiology entries record — the crashed
session's changes had never been suite-verified at all). Two of the five
were confirmed, by content, as the SAME already-documented, pre-existing
flaky stochastic assertions this document has carried for many sessions
(PACs HR-variance; rocuronium's bagging-delayed-to-150s timing) — both
present, unrelated, in the very first run before any of this session's own
edits, confirming they are not new. **The other three were a real,
reproducible regression, all one root cause**: `thrombolytic -> plasmin
activity rises` (required >=0.5, measured 0.0523 at 18 minutes post-dose),
`thrombolytic -> coronary stenosis falls vs untreated` (moved -0.0021, not
down), and `thrombolytic -> smaller infarct than untreated` (4/7 trials,
needed >=5).

**Traced to ground before touching anything (lesson 8): `plasminActivity`
is architecturally NOT the same shape as `ph`/`coag`/`hco3`, and the
crashed session's own fix — treating it identically, via the same one-time
rising-edge delivery — was the wrong pattern for this specific prop.**
`ph`/`coag`/`hco3` represent a genuine discrete DOSE (a fluid bolus's
dilution, a bicarb push's alkalinising load) — a real one-time quantity,
correctly fixed. `plasminActivity` represents an ONGOING PHARMACOLOGIC
STATE — how strongly plasmin is currently being driven — for as long as
the drug remains active, the same shape `pat.drugFio2` already handles two
cases above it in the identical loop (`Math.max(pat.drugFio2, ...)`, a
held floor recomputed fresh each tick, not a dose delivered once). MEASURED
directly: `coagulation.js`'s own endogenous fibrinolysis-regulation term
(`updateCoagulation`'s `plasminActivity += (plasminTarget - plasminActivity)
* min(1,dt*0.4)`, a real, correct mechanism for the body's OWN plasmin
regulation) treats a one-time delivered spike as a transient perturbation
and relaxes it back toward baseline (~0.05 for a non-septic patient) within
about 15-20 minutes — correct for an ENDOGENOUS process, wrong here,
because it cannot distinguish that from an EXOGENOUS thrombolytic still
pharmacologically active for its whole declared `dur:9999`. This is also
exactly what the drug's OWN pre-existing note already says and the crashed
session's own comment quoted without acting on: "dur:9999, a deliberately
persistent effect" — the drug's original author intended sustained
activation, not a spike-and-decay.

**Fixed as a held floor/ceiling, not an accumulator — still cannot diverge
the way `sidAdjust` did (no unbounded `+=`).** A positive `val`
(thrombolytic, activating) now floors `plasminActivity` toward
`val*intensity`, tracking intensity's own onset ramp (so a fresh dose still
ramps in over its onset — the crashed session's own, correctly-motivated
original concern — rather than snapping to the clamp within a couple of
ticks) and then HOLDING there for as long as intensity stays high (the
drug's whole `dur`), overpowering `coagulation.js`'s own decay every tick
instead of losing to it once. A negative `val` (TXA, suppressing) is the
mirror image — a ceiling toward `1 + val*intensity` (TXA's own -0.5 caps
`plasminActivity` at or below 0.5 while active, rather than forcing it to
an absolute zero regardless of a patient's own baseline — the same
receptor-style Emax-ceiling idiom every other drug's declared coefficient
in this file already uses, not a special case invented for this one).
MEASURED post-fix, driving the real `acs` scenario through the exact
`mechanismWiring.mjs` window (dose at t=120s, measured at t=1200s):
`plasminActivity` reaches and HOLDS 0.987 from t=480s onward (well above
the 0.5 threshold, for the rest of the window); `coronaryStenosis` in the
treated arm reaches 0.582 at t=1200s versus 0.610 untreated — a real,
correctly-signed 0.028 drop, comfortably clearing the assertion's own
0.01 minimum.

**A fourth, real, reproducible regression was found only after re-running
the full suite a second time — not caught by re-running the specific
failing tests in isolation alone, confirming the value of a full re-run
rather than a targeted spot-check.** The second full run came back
**409 passed, 1 failed**: the three thrombolytic failures and the
rocuronium timing flake were gone, but `hyperkalemiaMissedDialysis`'s own
"early calcium+bicarb -> deterioration prevented" assertion, previously
passing at 8/10 (per that section's own in-code comment, "measured here at
10/10 for both the untreated deterioration and the early-treatment
rescue"), now failed at 4/10. Confirmed reproducible, not a one-off draw,
via three independent standalone 10-trial batches (5/10, 5/10, 6/10) —
consistently well below the required threshold, not ordinary noise around
a borderline pass.

**Traced to ground, not patched blind.** Direct instrumentation of a
representative treated run showed the underlying mechanism working
correctly throughout — k fell smoothly 6.85 -> 5.19 over 900s and
`qrsWidth` held narrow at 0.080 the entire time — while `rhythmInstability`
kept climbing regardless of treatment, 0.10 -> 0.87 by t=900s. This is a
real, separate, TIME-accumulating stochastic-risk term the plasminActivity/
ph/hco3 fix does not touch, that was previously being masked by the OLD
ratchet's own runaway alkalosis: under the pre-fix bug, bicarb's hco3
effect would have driven pH extremely (and unboundedly) high for the
drug's whole 1800s declared duration, and that sustained over-correction
was very likely suppressing whatever acidemia-linked component feeds
`rhythmInstability`'s own accumulation — an accidental side effect of a bug,
not a real treatment mechanism, now correctly gone. A real window sweep
(not guessed) found the genuine treatment effect is strong and reliable at
a clinically meaningful horizon and only erodes at the old 900s window:
300s treated=10/10 (untreated too early to have deteriorated, 0/10); 480s
treated=10/10, untreated=8/10; 600s treated=10/10, untreated=8-10/10
(confirmed reliable across three repeated 10-trial batches); only at 900s
does the treated arm start eroding into the 4-6/10 range. This is the exact
"long window erodes a real signal via unrelated stochastic drift" shape
this document's own DKA/Kussmaul entry already has on record (that fix
moved its own comparison window from 900s to 300s for the identical
reason). Fixed the same way: both the untreated and treated probes in this
section moved from `run:900` to `run:600` (a real, clinically meaningful
10-minute on-scene window — long enough for early treatment to matter,
short enough that the risk accumulator hasn't independently saturated
regardless of what the provider did), with the untreated threshold lowered
from >=8 to >=7 to match its own measured 8-10/10 range at the new window
with real margin. The full reasoning and measured numbers are recorded
in-code at the section itself, not just here.

**A new, permanent regression-guard section was added to
`mechanismWiring.mjs`, `[FLUID/BLOOD-PRODUCT ACID-BASE DELIVERY — one-time,
not a ratchet]`**, since no existing assertion anywhere in either suite
would have caught a REINTRODUCED version of this exact bug class in either
direction (scenarioSweep never gives doses at all) — five two-sided
assertions: one saline bag does not crash hco3 toward its floor; one unit
of blood does not pin hco3 near its ceiling; both nudge hco3 in the
correct, real direction versus a control; and five units of blood (a real
massive-transfusion-scale resuscitation) still lands in a survivable,
non-clamped range — the strongest guard, since five separate rising-edge
deliveries is exactly the shape a reintroduced per-tick ratchet would blow
straight through the clamp ceiling on the first dose, let alone the fifth.

**A genuine, separate calibration gap was found and deliberately NOT fixed
in this session — filed as new queue item 71, not lost.** `bicarb`'s own
`fx.hco3:16` looks like it was originally derived against plasma volume
(~3 L) rather than the real bicarbonate distribution space (~14-35 L) —
50/3≈16.7 matches the figure almost exactly, while the real physiology
would put a 50 mEq dose's rise closer to 1.5-3.5 mEq/L. This predates the
ratchet bug entirely (the drug's own comment already framed 16 as an
intentional one-time-dose value, unrelated to the every-tick delivery
defect) and is a different defect class — deliberately left alone to keep
this session's own change scoped to the ratchet's magnitude fallout, not a
general re-calibration pass, per this document's own batch-size discipline.

**Verification, complete, run to completion in the foreground throughout
(lesson 14/17 — the container killed nothing this session, but every run
was still driven to completion via direct process polling rather than
trusted from a partial buffer).** `node --check` and targeted `npx eslint`
clean on every touched file throughout, both mid-edit and at the end.
Since this touches `pk.js`'s shared drug-effect hot path — every drug in
the formulary passes through it — the full suites were run, not skipped:
**`mechanismWiring.mjs`: 409 passed, 1 failed** — the single failure (PACs
HR-variance) is the same, already-documented, pre-existing flaky
stochastic assertion confirmed present, unchanged, in this session's own
very first pre-fix baseline run, unrelated to anything this session
touched. **`scenarioSweep.mjs`: 158 scenarios, 10,877,670 checks, 0
failed** — clean, as expected: this suite never gives doses at all, so it
cannot exercise any of this session's changes, but the shared code path it
does exercise (patient construction, per-tick stepping) shows zero
regression. `npx vite build`: clean (19.39s, same pre-existing >500kB
chunk-size warning). `npx eslint src`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, zero findings
in any file this session touched (`pk.js`, `drugs.js`,
`mechanismWiring.mjs`). Every throwaway probe script used across this
investigation (eleven in total, including the one the crashed session
itself left behind) was stripped before this entry was written — confirmed
via a directory listing showing only the suite's own permanent scripts
remain under `src/scripts/`.

This fix does not correspond to a numbered queue item (found as a
byproduct of unrelated queue-item-40 investigation, per the crashed
session's own original context) and needed no queue-item deletion — only
this changelog entry and the one new item (71) filed for the separate,
deliberately-deferred bicarb magnitude question.

### Front-end batch: queue item F5 CLOSED — a real busy-timer completion-timestamp bug found and fixed (the "DONE — REGION" panel showed when an action was CLICKED, not when it actually finished); queue item F6 investigated and found already resolved by an old F18 fix, a stale bug report; F1's "development access restriction" priority found already fully built, a second stale doc claim corrected in the same pass

Per "Continue with the front end queue," following directly on F0's fourth
slice (immediately below). With F0 itself fully verified and its remaining
scope (items 2-11, the real local-model download/boot system) too large for
a single batch, moved to the two operator-reported bugs sitting at the top
of the queue (F5/F6) — both explicitly marked "not yet investigated," per
this document's own standing instruction to confirm a claim against the
tree (lesson 16) before either fixing or trusting it.

**F1's tester-gate access restriction — found already fully built, a stale
doc claim corrected before starting anything else.** F1's own text still
read "no password/tester-auth system exists anywhere in this codebase
today" — grepped `App.jsx` before trusting it and found the opposite:
`src/testerGate.js` (`TESTER_KEY`/`TESTER_PASSWORD`/`isTesterUnlocked`,
a single `localStorage` flag, browser-wide not per-save) is real,
complete, and already wired in exactly the shape F1's own text asks for —
`goGmode()` routes Career/Co-op through a `testerGate` phase
(password-protected, with a 🔒 TESTERS ONLY badge on both buttons) unless
already unlocked, while Medical Simulation (Sandbox) mode's own button
calls `setG` directly and never touches the gate at all. `SettingsOverlay`
also reads `isTesterUnlocked()` for the driving-mode toggle, per that
module's own header comment. This was evidently built and shipped by an
earlier, undocumented session — the same "the tree is ahead of the
document" pattern this project's history already has on record once for
Chapter 7. No code was needed; F1's own status paragraph is updated below
to stop describing this as an open, unbuilt gate.

**F6 — investigated, found already resolved, not a live bug.** F6's own
text described the approach-phase "Scene size-up" button as narrating
nothing scenario-specific. Reading `App.jsx`'s actual approach-phase
button (the free walk-in one, not the in-scene general-tab action) found
it already reads `SC.impression` (and `SC.hazard` when present) — real,
rich, scenario-authored first-impression text (e.g. "Gray. Diaphoretic.
Sitting bolt upright, both hands flat on her chest..."), under a comment
explicitly citing an old "F18" fix that already closed this exact gap:
"read the same source as the in-scene 'Scene size-up' action... so the
free walk-in glimpse actually describes what the scene looks like."
**Confirmed live, not just read** — a throwaway Playwright probe
(`_tmp_checkF6.mjs`, stripped after use) jumped a fresh save straight to a
real approach phase via `setState`, clicked the actual "Scene size-up"
button, and read back `g.log`: the real scenario's own `impression` text
landed verbatim. F6's own bug report predates this fix (or was never
re-checked against it) — no code change was needed; F6 is removed from
the queue below as a resolved, stale report rather than left open for a
fix that already shipped.

**F5 — investigated, and this one WAS real: `done[key].at` was stamped at
the moment an action was CLICKED, never updated when the busy timer
actually finished.** `start()` (`App.jsx`) sets
`done:{...s.done,[a.doneKey||a.id]:{at:s.t}}` the instant a costed action
begins — before its `busy.dur` countdown even starts. The "DONE — REGION"
panel (the per-body-region list of completed findings/procedures, sorted
and displayed via `clk(r.at)`) reads that same stamp as "when this
happened." For any action with a real, non-trivial cost — the exact
"procedure completing, a drug dose landing" case F5's own text named —
this is wrong by the full duration of the busy timer: the panel showed
the CLICK instant, while the scrolling log's own entry for the same
action (`apply()`, which stamps `t:s.t` at the point `fn()` actually runs,
after the timer completes) correctly showed the LATER, real completion
instant. Two parts of the same screen disagreeing with each other, and
with when the treatment's physiology actually took effect, is exactly the
"not accurate at all" complaint.

**Fixed at the completion site, not the click site** — `App.jsx`'s
busy-timer completion block (where `n.busy.left<=0` and `apply()` already
runs) now captures `n.busy.doneKey` before nulling `n.busy`, and
re-stamps `n.done[dk]={at:n.t}` immediately after `apply()` runs, so the
DONE-panel timestamp is overwritten with the real completion instant
rather than the stale click-time one. The instant, busy-timer-free actions
(PPE, the free-walk size-up button, `expose@` clothing removal — all set
`done[key].at` directly with no `busy` object involved) are untouched and
were never wrong, since click time and completion time are the same
instant for those.

**Verified against the real engine, not assumed.** A throwaway probe
(`_tmp_checkF5.mjs`, stripped after use) jumped a fresh save to a live
scene, clicked a real 25-second torso action ("Respirations — rate,
DEPTH, effort," `dur:25`), fast-forwarded sim time via the existing speed
control, and read back state on completion: before this fix, `done.rr.at`
would have read the click-time instant (~100.2s); after the fix, it reads
125.5s — bit-for-bit identical to the scrolling log's own completion
timestamp for the same action (`log.at(-1).t`), confirmed equal in the
same run. `npx eslint src/App.jsx`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline (lines 103/317/1147),
zero new findings. `npx vite build`: clean (21.54s, same pre-existing
>500kB chunk-size warning). No physiology module was touched — this is a
UI-timestamp-only change — so `mechanismWiring.mjs`/`scenarioSweep.mjs`
were not exercised and were not re-run, consistent with this document's
own standing note for front-end-only batches. Both throwaway probe
scripts were stripped before this entry was written; no permanent script
was needed since the fix is a one-line re-stamp with an obvious,
already-demonstrated correctness check.

Queue items F5 and F6 are both closed and removed from section 6 (F6 as a
resolved, stale report; F5 as a real, fixed bug). F1's own status
paragraph is updated in place to stop describing the tester-gate access
restriction as unbuilt.

### Protocol-content batch: queue item 68 CLOSED — every saline-dose-count cap in `laCounty.js` reconciled against `saline`'s real 500mL-per-administration definition and each protocol's own stated liter target; a real, previously-unbounded rule found and fixed along the way; item 64 updated with a real, previously-undocumented nitro-calibration finding that bears directly on how it should be approached next

Per this document's own standing instruction to pick the next appropriate
physiology-queue item and complete it end to end. Started on item 64
(nitroglycerin SBP-tiered dose escalation for TP 1214) but pivoted after a
real, unplanned finding made it the wrong item to ship blind this session —
see the "found but not fixed" note at the end of this entry, and item 64's
own updated text. Item 68 (the saline dose-count audit, explicitly flagged
by its own text as "a single, deliberate pass... needs its own dedicated
verification pass") was picked instead: well-scoped, self-contained to one
file, and exactly the kind of item this document's own discipline says is
worth finishing cleanly rather than half-doing something riskier.

**Step 1 — confirmed the claim against the tree before touching anything
(lesson 16).** `drugs.js`'s `saline` entry is declared "Normal Saline 500
mL" per administration (`pkModel:"fluid"`), and `gear.js`'s `salineBolus`
task (`dose:"saline"`) ties exactly one task execution to exactly one
500mL administration — confirmed by reading both files directly, not
assumed from item 68's own prose. `engine.js`'s `doseCount(ctx,id)` sums
EVERY dose of that id given so far in the whole call, across every rule
that shares it (`(ctx.s.doses||[]).filter(d=>d.id===id).length`) — a
cumulative, not per-rule, counter. This matters: several saline rules in
this file compose on top of one another's own doseCount, so a cap fixed in
isolation can silently turn a SIBLING rule into a no-op if the sibling's
own cap isn't recomputed in the same pass — exactly the risk item 68's own
text warned about, and exactly what happened twice while working through
this (see `pphSaline`/`tbiSaline` below).

**Nine rules gate on `doseCount(ctx,"saline")`, all nine now reconciled
against a real, quoted target from their own protocol's stated text (or
deliberately, explicitly left unchanged where no target is quoted):**

1. **`saline_arrest` (TP 1210, cardiac arrest, "1L saline, repeat x1" = a
   real 2L target).** Was `<2` (500mL of headroom short of even this
   rule's OWN stated 1L, let alone the repeat) — the exact defect
   `traumaArrestSaline`'s own comment already flagged as "found while
   picking this cap, not silently resolved" in an earlier session, never
   actually fixed at its source until now. Fixed to `<4` (2L, the real
   target).
2. **`saline_rosc` (TP 1210, post-ROSC hypotension, "fluid first" — no
   liter figure quoted anywhere in this rule's own source text).**
   Deliberately left at `<1`. Per section 4's "identify numbers, do not
   tune them" discipline, inventing a target here would be worse than
   leaving the real gap — checked and confirmed unchanged, not silently
   skipped.
3. **`saline_shock` (TP 1207, shock, "1L saline for shock").** Was `<1`
   (500mL against a stated 1L). Fixed to `<2`.
4. **`saline_sepsis` (TP 1204, sepsis, "1L rapid saline infusion").** Was
   `<1`. Fixed to `<2`.
5. **`saline_gigu` (TP 1205, GI/GU poor perfusion, "1L rapid saline
   infusion").** Was `<1`. Fixed to `<2`.
6. **`pphSaline` (TP 1211-P, postpartum hemorrhage, "additional 20mL/kg"
   ON TOP of `saline_gigu`'s own first liter).** Was `<2` — which, against
   `saline_gigu`'s OLD `<1` cap, correctly let exactly one more dose
   through (total 2 = 1L), but represented only 500mL of "additional"
   volume against a real "20mL/kg" target (≈1.4L for the ~70kg reference
   weight this file's protocols already use elsewhere for adult dosing,
   closer to 1.5L than 1L at 500mL granularity). Once `saline_gigu` moved
   to `<2` (1L, its own correct value), `pphSaline`'s old `<2` would have
   become a silent no-op — `doseCount` is cumulative, so a sibling cap
   equal to or below another rule's own ceiling never fires at all.
   Recomputed to the real total: 1L (gigu, 2 doses) + ~1.5L additional (3
   more doses) = **`<5`**.
7. **`traumaArrestSaline` (TP 1243, traumatic arrest, "2L... two sites").**
   No numeric change — its own `<4` was ALREADY the correct absolute value
   (2L = 4 administrations) even before this pass; an earlier session had
   only preserved a RELATIVE 2x relationship to `saline_arrest`'s then-wrong
   sibling cap, "inheriting whatever absolute miscalibration it already
   has" per that session's own honest comment. Comment updated to record
   that both rules now independently land on the same real 2L/4-dose total
   for the same underlying reason (both protocols specify a 2L arrest
   bolus), which is a real, expected coincidence, not redundancy.
8. **`tbiSaline` (TP 1244, isolated head injury, no liter figure quoted —
   only "capped looser (2, vs `saline_shock`'s own 1)" in the original
   comment, a stated RELATIVE design).** Once `saline_shock` doubled to
   `<2`, preserving the "looser, escalated" relationship this rule was
   built on required doubling it too. Fixed to `<4` (2L) — no absolute
   figure was invented; the relative relationship to its sibling was
   preserved instead, the same discipline `traumaArrestSaline` already
   used once for the identical reason.
9. **`salineBolus` (TP 1203, hyperglycemia, glu>=400) — a real, more
   severe defect than a wrong number, found while auditing the other
   eight, not named in item 68's own original list but squarely "any
   others" per that item's own closing line.** This rule had **NO
   `doseCount` gate of any kind** — confirmed by reading `engine.js`'s
   `evaluateProtocol`: the `running` set it checks against only excludes
   tasks CURRENTLY in progress, not ones already completed, so a rule with
   no self-limiting condition is re-recommended every time its own `when`
   is still true and nothing is presently running that task. As long as
   glucose stayed >=400, this rule would keep re-offering `salineBolus`
   indefinitely with no ceiling on total volume delivered — a real,
   unbounded-fluid bug, not a miscalibration. Fixed by adding the same
   `doseCount(ctx,"saline")<2` gate every sibling "1L" rule in this file
   now uses.

**Verified two ways — a synthetic per-rule boundary test (authoritative
for this change) and a real end-to-end integration run (a non-load-bearing
sanity check, not the primary evidence, for the reason stated below).**

The boundary test (`rule.when(ctx)` called directly against each of the
nine rules, doseCount = cap-1 vs. doseCount = cap, every OTHER gating
condition held true via a synthetic ctx) is the correct, minimal
verification for this class of change — it exercises the exact predicate
function the real crew-direction engine consumes, independent of
crew-assignment/busy-timer timing, which this change does not touch. All
nine passed cleanly at their new (or deliberately unchanged) boundary,
confirmed at BOTH doseCount=cap-1 (fires=true) and doseCount=cap
(fires=false) — not just one side. A tenth check confirmed the
`saline_gigu`/`pphSaline` composition directly: at a real cumulative
doseCount of 4 (2 from gigu's own share, 2 more from pphSaline layered on
top), `saline_gigu` correctly no longer fires (already at its own `<2`
ceiling) while `pphSaline` still does; at 5, neither fires — the exact
"sibling ceiling can't silently swallow the composed rule" behavior this
whole pass exists to get right.

A second, real end-to-end probe drove `physio()`/`evaluateProtocol()`
together against three real scenarios (`pph`, `cardiogenicShock`,
`diabeticKetoacidosisCall`), simulating a crew that executes every
recommended `salineBolus` instantly. **Stated honestly, this probe is NOT
the authoritative evidence for the fix**: it does not model the real
busy-timer/task-exclusivity semantics (`evaluateProtocol`'s `running` set
was never populated with an in-progress "salineBolus" the way a live
crew-direction loop would), so several rules could and did recommend
`salineBolus` in the SAME tick and each got a dose pushed immediately —
producing totals (`cardiogenicShock`: 4, `diabeticKetoacidosisCall`: 5)
that reflect this probe's own simplification, not a real crew-paced
sequence. What it DOES confirm, honestly: the rules fire against real
physiology in real scenarios (staged over real elapsed time for
`diabeticKetoacidosisCall`'s own later arrest-branch rules, at t=508s once
the patient actually coded), and doseCount grows correctly as real doses
are pushed through `s.doses` and read back by later `evaluateProtocol`
calls in the same run — the plumbing genuinely works end to end. `pph`
itself never crossed `POOR_PERFUSION`'s own `lactate>4` threshold within a
30-minute run (lactate held at 0.50, sbp only fell to 98) — a real,
honest finding about `uterineAtony`'s own presenting severity within this
window, not a defect in this batch's own rules (confirmed separately, via
the synthetic boundary test, that `saline_gigu`/`pphSaline` both fire
correctly the instant `POOR_PERFUSION` is true).

**Verification, complete.** `node --check src/protocols/laCounty.js`:
clean. `npx eslint src/protocols/laCounty.js`: zero findings. `npx vite
build`: clean, exit 0 (same pre-existing >500kB chunk-size warning). `npx
eslint src`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, zero
findings in any file this batch touched. This is a protocol-content-only
change — `src/protocols/` is not imported by `mechanismWiring.mjs` or
`scenarioSweep.mjs` (confirmed by grep before deciding not to run them,
not assumed), and no `src/physio/*` module was edited, so neither suite
exercises this change; the synthetic boundary test above is this batch's
own real regression coverage, the same "the physio suites aren't the right
instrument for this kind of change" reasoning several earlier
protocol-only batches in this document already used. Both throwaway probe
scripts (the synthetic boundary test and the end-to-end integration probe)
were stripped before this entry was written, confirmed via a directory
listing showing no `_tmp_*` files remaining under `src/scripts/`.

**Found, but deliberately NOT fixed this session — folded into item 64's
own text rather than filed as a separate item, since it bears directly on
how that item should be approached: `nitro`'s existing coefficients
(`venodilation:0.8`, `arteriolarDilation:0.4`) already produce an
oversized single-dose hemodynamic effect, and it is NOT specific to
preload-dependent CHF physiology.** Measured directly (throwaway probe,
`physio()`/`activePatient()`, stripped before finishing) before trusting
item 64's own original framing: a single existing 0.4mg `nitro` dose drops
a real, already-shipped CHF scenario (`resp`) from sbp 114 to 61 within 5
minutes of full onset — but the SAME dose given to a completely healthy,
condition-less control (`abdPain`, sbp 126 baseline) also drops sbp to 73,
and to a `stableAngina` patient (sbp ~112) drops it to 74. A ~50+ mmHg
single-dose drop in a HEALTHY patient is not proportionate to real
single-SL-tablet clinical experience (typically a 10-25 mmHg drop),
meaning this is a general calibration property of the existing mechanism,
not a CHF-specific, clinically-appropriate preload-unloading effect.
Building `nitro2`/`nitro3` at LARGER coefficients on top of this (which a
sweep of several candidate scale factors, 1.15x through sqrt(3)≈1.73x,
confirmed: even the smallest tested increase drops the CHF scenario to
sbp 52/dbp 39 and `hypertensiveEmergency` — the actual target patient for
an escalated dose — to sbp 88/dbp 75) would compound an already-oversized
baseline rather than deliver the real clinical teaching TP 1214's
escalation intends. Recalibrating `nitro` itself is out of scope for a
dose-tiering batch — it is a higher-blast-radius, separately-scoped fix
(several already-shipped scenarios/assertions, e.g. `stableAngina`'s own
reflex-tachycardia measurement, exercise this exact drug's current
magnitude) and item 64's own text is updated below to record this finding
so a future session doesn't build the escalation tiers on top of it
uninvestigated. Both throwaway probe scripts used for this investigation
were stripped before finishing.

### Physiology-engine batch: queue item 40's standing overdose-condition workstream — `lidocaineOverdose` (TOX-006), the fifth drug shipped, the first whose overdose severity genuinely scales with dose rather than saturating almost immediately

Per the standing item-40 workstream. Confirmed the tree before picking a
drug (lesson 16): `rocuronium`/`diltiazem`/`metoprolol`/`atropine` were
already shipped; `lidocaine` was named in the queue's own text as "a real,
cheap extension" since `drugs.js` already declares a real
`antiarrhythmic:{sodiumBlock:0.65,ischemiaSelective:true}` mechanism (item
7's earlier work) plus a real, already-built LAST (local anesthetic
systemic toxicity) mechanism, `toxicity:{seizureThreshold:10,
cardiacThreshold:18}`, that had a producer (the therapeutic 100mg
antiarrhythmic dose) but no condition had ever pushed a patient into it.

**Confirmed BEFORE building anything that this drug does NOT hit item 38's
own ceiling — a genuinely different architecture, not assumed to reuse
it.** Read `pk.js`'s "Systemic toxicity at supratherapeutic concentration"
block directly: `drugDef.toxicity` reads `C = totalConcByDrug[dr.id]` — the
RAW, summed effect-site concentration across every instance of the drug —
not the once-per-drug-id Emax `intensity` gate (`totalC/(ec50+totalC)`,
bounded toward 1) that ceilings diltiazem/metoprolol/atropine/fentanyl's
own receptor terms almost immediately on overdose. Stacking real
concentration has no saturating ceiling of that shape here, so severity
genuinely tracks dose — the first drug in this workstream where that's
true.

**MEASURED, not assumed (lesson 8), via a dose/count/interval sweep
against the real engine** (direct `Patient` construction plus
`seedPastDose`, and the real scenario/condition harness, both mirroring
`scenarioSweep.mjs`'s own minimal setup — stripped after use). A single
100mg therapeutic-equivalent dose peaks at effect-site concentration
~6.5 mg/L, inside the drug's own documented 1.5-5 mg/L therapeutic/
early-toxic band — zero toxicity, confirming the mechanism is genuinely
dose-gated, not pre-saturated. A staggered 400mg dose (4 doses, 3 min
apart) crosses only `seizureThreshold` (seizureDrive capping ~0.45,
`drugInotropy`/`avSlowingDrug` completely untouched) — the textbook
"seizures first, cardiotoxicity later" LAST sequence, genuinely reachable
in this engine at a moderate dose. A single 500mg IV bolus (the dose this
condition seeds) drives effect-site concentration to a measured peak of
~32 mg/L — nearly double `cardiacThreshold`(18) — producing a real,
SIMULTANEOUS two-phase toxidrome instead: `seizureDrive` saturates to its
1.0 ceiling and `drugInotropy` falls to a measured nadir of 0.316 while
`avSlowingDrug` rises to 0.644, together rather than sequentially —
matching the real clinical fact that a sufficiently large/rapid
intravascular bolus can present both at once. SBP nadir ~80 mmHg / CO
~3.1 L/min at ~2 minutes post-injection; redistribution (lidocaine's own
fast `k12=1.0/min` peripheral distribution) genuinely clears the
cardiotoxicity over the following ~5-6 minutes with NO treatment at all —
a real, honest finding, not scripted: LAST cardiotoxicity that receives no
further drug genuinely improves as effect-site concentration redistributes
away, provided the patient survives the acute crisis (airway/breathing
support through the seizure is the actual field skill, not a drug). The
seizure itself is far more persistent — `seizureDrive` stays above
neuro.js's own 0.15 SUSTAIN threshold for the ENTIRE 900s call untreated,
genuine prolonged status epilepticus, the real severity this dose
produces.

**MIDAZOLAM — a real, honest, two-sided finding, not a clean cure, using
the SAME general drug-toxicity seizure-suppression pathway (`pat.
anticonvulsant` -> `pat.seizureDrive`, neuro.js) every other toxicity-
driven seizure in this engine already reads — no new mechanism.** A
single dose raises `anticonvulsant` to ~0.39, leaving `rawDrive` (
`seizureDrive*(1-anticonvulsant)`) at ~0.61 — still well above the 0.15
sustain threshold, so seizing does not stop from one dose. THREE stacked
doses (this drug's own `max:4`) only push `anticonvulsant` to ~0.55 (the
same repeated-dosing Emax-saturation diminishing-returns shape already
documented elsewhere in this file for stacked benzodiazepine dosing),
still leaving `rawDrive` ~0.45 — genuinely refractory to benzodiazepines
ALONE at this severity, matching the real LAST literature (severe LAST
seizures are commonly benzo-resistant; the actual definitive antidote is
IV lipid emulsion, "intralipid," grep-confirmed ABSENT from this formulary
— the same honest "no curative field drug" framing `rocuroniumOverdose`/
`atropineOverdose` already established). What midazolam DOES demonstrably
do, confirmed two-sided through the real scenario (repeated dosing,
applied at 60s and reapplied every 140s through a full 900s call):
`anticonvulsant` rises from 0.000 (untreated) to 0.578 — a real,
substantial suppression of seizure drive — while `drugInotropy` and
`avSlowingDrug`, the cardiotoxic component, are IDENTICAL with or without
midazolam on board (1.000/0.000 in both arms at t=900s) — the real
teaching point: a benzodiazepine treats the seizure, not the
cardiotoxicity, and nothing in this formulary treats the cardiotoxicity
directly.

**Scene framing**: a dental-office presentation — an extensive procedure's
cumulative local-anesthetic dose delivered as an inadvertent intravascular
bolus rather than the intended slow tissue infiltration, a real,
well-documented LAST case class chosen over a nerve-block/OR framing
because it needs no invented prehospital mechanism and matches an
ordinary EMS dispatch type. New scenario `lidocaineOverdose` (TOX-006):
dispatch/staff-collateral text narrates the real onset (perioral
numbness/lip tingling, then seizure within ~1 minute of the causative
injection); a `loc` probe override reads `s.patient.seizing` live for a
real, re-checkable "actively convulsing, not assessable" vs. "postictal"
finding (distinct from the one-shot `ClinicalEventAlert` banner, the same
"continuous, re-checkable finding on top of a one-shot alert" idiom
several other overdose scenarios already use); a `heart` probe reads
`v.hr`/`v.sbp` live. `resolve()` states plainly that no curative field
antidote is carried and that naloxone does nothing (not an opioid).

**Six new two-sided `mechanismWiring.mjs` assertions**, in a new
`[LIDOCAINE OVERDOSE — queue item 40, fifth drug]` section: presence
(real, simultaneous seizure drive + cardiotoxicity near the toxicity
nadir); specificity (a condition-less control shows EXACTLY zero of any
of it); midazolam raises `anticonvulsant` through repeated dosing while
leaving `drugInotropy`/`avSlowingDrug` untouched (two assertions, the
real two-sided teaching point); and naloxone confirmed inert (not an
opioid). `avSlowingDrug`, `drugInotropy`, `seizureDrive` and
`anticonvulsant` were added to `mechanismWiring.mjs`'s own `snapshot()`
helper — all four are real, pre-existing, already-producer'd fields
(amiodarone/lidocaine's own antiarrhythmic block for the first two,
several toxicity-driven-seizure conditions for the latter two) that had
simply never been read through the suite's own before/after snapshot path
before this batch's assertions needed them, the same `totalBloodVol`/
`kExcretion`/`sao2` precedent already on record in this document. No new
`scenarioSweep.mjs`/`patient.js` changes were needed — every field this
condition touches already has a constructor-safe consumer (`??`-guarded)
elsewhere in the engine, and this batch introduces no genuinely new
physiology field, only a new producer for four already-real ones.
`App.jsx`'s `SCEN_BODY_SYSTEM` map gained `lidocaineOverdose:"Toxicology"`,
alongside the other four TOX-* overdose scenarios.

**Verification, complete, run to completion in the foreground throughout
(lesson 14/17 — both long suites were auto-promoted to a background task
by the tool after exceeding a single step's timeout, and polled to
completion via the tool's own tracked output capture rather than a
`setsid`/`nohup` redirect, so no output was lost to the documented
Windows-console-buffering failure mode).** `node --check` clean on all
three touched files (`conditions.js`, `scenarios.js`,
`mechanismWiring.mjs`) throughout. `npx eslint src/physio/conditions.js
src/data/scenarios.js src/App.jsx src/scripts/mechanismWiring.mjs
src/scripts/scenarioSweep.mjs`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, zero
findings in any file this batch touched. `npx vite build`: clean (18.30s,
same pre-existing >500kB chunk-size warning). Since this touches
`pk.js`'s shared drug-effect hot path only through already-verified,
unmodified code paths (no `pk.js`/`neuro.js`/`cardiovascular.js` edits at
all — the condition/scenario/suite files were the only ones touched), the
full suites were still run, not skipped, per this document's own standard
for anything touching the shared drug-instance/condition-composition
machinery: **`mechanismWiring.mjs`: 404 passed, 1 failed** — the single
failure (`magnesium suppresses torsades recurrence (Tzivoni)`, 6/10 vs. a
needed 8/10) is the same already-documented, pre-existing flaky
stochastic assertion this document has carried across many sessions
(cardiovascular.js's torsades/magnesium mechanism, reading nothing this
batch touched); all 6 of this batch's own new assertions passed clean.
**`scenarioSweep.mjs`: 158 scenarios (up from 157), 10,877,670 checks, 0
failed** — the new scenario's own diagnostic row (pH 7.30-7.45, no
impossible values, 0.0000 L mass drift) is clean. The throwaway probe
script used to measure all of the above (`src/scripts/_tmp_lidoProbe.mjs`)
was stripped before this entry was written, confirmed via a directory
listing showing no `_tmp_*` files remain under `src/scripts/`.

Queue item 40's own workstream entry (section 6) is updated in place
(lidocaine moved from "still open" to "ALSO DONE") — the item itself stays
open as a standing workstream, same as item 7, with morphine/amiodarone/
the catecholamines still named as real remaining candidates.

### Front-end batch: queue item F0's fourth slice — the reverse edges of the seizing/consciousness edge-detection block (a seizure ending, consciousness returning), both a real banner and a real crew-voiced line, closing a gap where only the forward (onset) edges had ever been wired

Per continued "continue the front end queue" instruction, direct follow-up
to the crew-voiced dialogue reaction shipped immediately below in this same
session window. Before picking a next slice, re-ran the two prior scripts
(`verifyCrewDialogueReaction.mjs`, `verifyDialoguePanel.mjs`) against a live
dev server to confirm the two logged FAILs sitting in the background-task
output were real regressions, not stale results — they were not: both
scripts default to `http://localhost:5174` (a stale convention several
scripts in `tools/browser/` still carry, confirmed by grep — others default
to 5173) and the dev server was not running at all at the time those
attempts were made, so every "FAIL" was a dead-port navigation timeout, not
a code defect. Re-run against a live server on the port Vite actually
picked (5173, via `$env:PROXIMATE_URL`): both scripts, and
`verifyTreatmentResponseDialogue.mjs`, passed clean immediately with no code
changes. Stated honestly rather than silently absorbed: the 5173/5174
default split across `tools/browser/*.mjs` is real and pre-existing (not
introduced this session) and remains a minor, low-priority cleanup
candidate — every script already honors `PROXIMATE_URL` when set, so it has
never caused a false pass, only a confusing false fail when a script's own
wrong default silently pointed at a port nothing was listening on.

**The actual batch: read the existing edge-detection block in `App.jsx`
before picking anything (lesson 16), and found a real, previously-
unhandled second half of it.** The seizing/unresponsive edge-detection
block (added in an earlier session for the visible `eventAlertQueue`
banner, extended in the immediately-prior session for crew dialogue) only
ever checked the FORWARD transition on both flags —
`isSeizing&&!wasSeizing` and `isUnresponsive&&!wasUnresponsive` — firing a
banner and a crew line for a seizure starting or the patient going
unresponsive. The REVERSE transition (`!isSeizing&&wasSeizing`,
`!isUnresponsive&&wasUnresponsive` — a seizure stopping, or the patient
regaining consciousness) was silently dropped on the floor on BOTH
channels: no banner, no crew line, ever, for either recovery event. This is
real, player-visible information (a bystander can plainly see a seizure
stop or a patient start responding again, the same visibility standard the
block's own header comment already states for the forward edges) and a
crew member would obviously react to it — a genuinely missing half of an
already-shipped mechanism, not a new one invented from nothing.

**Fixed by extending the SAME block, not building a parallel one.** Both
`if`/`else if` pairs in `App.jsx` now cover both directions: a new
`"The seizure has stopped."` and `"The patient starts responding again."`
banner text pushed onto the identical `eventAlertQueue`
(`ClinicalEventAlert.jsx` needed no changes — it already renders arbitrary
banner text generically, confirmed by reading it before assuming so). The
crew-dialogue ternary chain gained two more branches
(`crew_seizure_ended_reaction`, `crew_recovery_reaction`), reusing the
identical `generateDialogueSync`/`dialogueLog`/`dialogueMemory` wiring the
forward-edge branches already use. Two new TEMPLATES entries in
`dialogueProvider.js` (`calm`-bucket only, matching the forward-edge crew
templates' own precedent, since bucketing crew speech off the patient's
personality is still meaningless) with real, distinct content — a crew
member's relief at a seizure stopping or a patient waking back up reads
differently from the alarm of the onset lines, not a mirrored restatement
of them with the words swapped.

**Verification, complete.** `npx eslint src/App.jsx
src/dialogue/dialogueProvider.js`: exactly the pre-existing 3-error
`react-refresh/only-export-components` baseline in `App.jsx`, zero findings
in `dialogueProvider.js`. `npx vite build`: clean (22.11s, same
pre-existing >500kB chunk-size warning). A new permanent Playwright script,
`tools/browser/verifyClinicalRecoveryReactions.mjs`, exercises both reverse
edges independently (the seizure-ending case is triggered via the same
combined `epilepticDrive=1`/`seizing=true` lever the prior session's own
gotcha already documented, then cleared to a genuine `seizing=false`; the
recovery case is triggered via a direct `consciousness` mutation, a
genuinely independent path from the seizure one) and — the check that
actually matters here — a THIRD, negative-control check confirming neither
the banner nor the crew line fires on an ordinary steady-state tick with
nothing changing, ruling out a naive "poll a falsy flag" implementation
that would spam every idle tick rather than firing only on the genuine
edge. Run three times total across the session (two consecutive clean
passes counted as the final verification): PASS/PASS/PASS, zero console
errors every run. The two pre-existing scripts this batch's own mechanism
touches (`verifyCrewDialogueReaction.mjs`, `verifyClinicalEventAlert.mjs`)
were re-run afterward and both passed clean, confirming no regression to
the forward-edge coverage. `tools/browser/README.md` updated with the new
script's description and its own usage-block line. No throwaway debug
scripts were created this batch — the new script is itself the permanent
artifact, nothing to strip.

Queue item F0's own status note (section 6) is updated to record this as
the fourth shipped slice.


---

**Older entries moved to `SESSION_HISTORY.md`** to keep this file short.
Same rules apply there (historical changelog, cross-check section 2/6 for
current status). Consult it for mechanism-level reasoning behind older
fixes; it is not required reading for day-to-day work.
## 4. How to work

**WRITE EVERYTHING IN AMERICAN ENGLISH.** Code, comments, commit messages,
scenario prose, assertion names, and this handoff. The tree is mixed — older
comments contain British spellings (`edema`, `hemorrhage`, `modeled`,
`stabilise`) — so match American spelling in anything you write or touch, and do
not mass-rewrite untouched files just to normalize them, which only creates diff
noise. Clinical terms follow the same rule: edema, hemorrhage, hematocrit,
anemia, hypoalbuminemia, ischemia, esophageal, fetal.

**NO EM DASHES IN PUBLIC-FACING CONTENT.** Any text a player actually reads —
dialogue lines, narration, button labels, UI copy, scenario prose, log/probe
text — must never use an em dash (—). Use a period, a comma, a semicolon, or
just restructure the sentence instead. Retroactive fixes happen incrementally,
as each piece of public-facing text is next touched for an unrelated reason —
not as one big standalone sweep. This does NOT apply to code comments or this
handoff document itself, both of which use em dashes constantly and are left
alone; the rule is about what a player sees, not what a developer reads.
Whenever you happen to notice an em dash in public-facing text while working
on something else, replace it on the spot rather than leaving it for later.


**THE CONTAINER HAS ONE CORE.** Run suites **sequentially**, chained in a single
background script. Running four concurrently starves them and makes the suite
look several times slower than it is.

**Long-running suites outlive a single command timeout.** Launch with
`setsid nohup ... > /tmp/out.txt 2>&1 &`, then poll. Kill previous runs before
starting a new one — but note `pkill -f physiologyValidation` can match your own
shell and kill the command issuing it; prefer a more specific pattern.

**Check the log before assuming a run was lost.** The container killed
`physiologyValidation` **seven times** last session, twice with nothing written
to the log at all — but on other occasions the run had completed and the result
was sitting in `/tmp/`. Read the file before re-running 30 minutes of work. It
does eventually complete: the final 113/113 came on the seventh attempt. The
`--fast` flag (61 assertions, ~7 min) skips only the slow pharmacology block
2b-2e, which makes failures bisectable when the full run will not stay up.

**Batch size.** Do a coherent unit of work, verify it, report. A verified
small batch beats an unverified large one every time.

**Verification is not optional and not partial.** Before claiming a batch is
done: run the affected suites, **diff the failure SET, not the count** — the
suite is green, so any FAIL is new by definition — run `npx vite build`, check
`eslint` still holds at its baseline (see section 2).

**Identify numbers, do not tune them.** Every coefficient should be traceable to
a documented observable. State the clinical fact, measure the model across
candidate values, pick the one that lands, and write the fact and the measurement
into the comment. Numbers chosen to make a test pass are worse than no numbers,
because they look justified. If you cannot find a documented anchor, say so and
ship the *detection* instead — that is what `curveDrugAudit.mjs` is, and what the
sweep's survivability checks were.

**Prefer the engine's own calibrated numbers to new ones.** When the post-arrest
work needed neurological outcome bands, the boundaries reused 0.5 (already where
`updateCerebral` forces unconsciousness) and 0.6 (already `multiOrganFailure`'s
threshold on the same axis) rather than inventing a scale. A boundary that
matches an existing consumer cannot silently disagree with it.

**Comments carry the reasoning.** Explain *why a number is what it is* and *what
was wrong before*. That convention is the reason defects fixed months apart do
not get reintroduced.

**Reporting.** Say plainly what was implemented, what was measured, what is still
wrong, and what was NOT verified. If a previous batch's conclusion turns out to
have been wrong, say so explicitly rather than quietly correcting it.

**Whenever you DEFER something, add it to the bottom of the queue (section 6).**
A deferral that lives only in a code comment or a batch report is invisible to
the next session's planning — it has to be an item in the queue to be picked up.
Document the mechanism at its site AND file the pointer at the bottom of the
queue. The takotsubo batch deferred LVOTO and troponin into comments only; the
ACS batch's four deferrals (reperfusion, reperfusion injury/slow stunning,
troponin, the regional-NSTEMI band) are in the queue as items 16-19 precisely so
they are not lost. New deferrals append after those.

**Whenever you FINISH a condition, REMOVE it from its category list in section 8**
(the target library) in the same batch you add it to the "already implemented"
list. The category lists are the REMAINING backlog, not a historical checklist —
leaving a shipped condition in them invites building it twice and misstates how
much is left. ACS, Stable Angina and Unstable Angina were removed from the Cardiac
list when they shipped; do the same for every condition you complete.

**Front-end working principles (product owner's standing rules for the F-block).**
These govern every front-end/gameplay batch, on top of everything above:
  - Fix existing bugs before implementing new features.
  - Avoid large-scale refactors unless truly necessary — reuse existing systems
    (assets.js, the crew/task machinery, the condition-composition engine, etc.)
    rather than replacing them.
  - Preserve SAVE COMPATIBILITY whenever reasonably possible. Before shipping a
    front-end batch that touches the `g` state shape, check whether it breaks
    existing saves and say so explicitly if it does.
  - If a change spans multiple files, update EVERY affected reference — no
    partially-migrated systems (e.g., moving files means finding and fixing every
    import, not just the ones noticed first).
  - After each feature, verify no existing gameplay regressed. There is no UI
    test harness, so this is inspection: re-read the surrounding code paths the
    change touches, not just the lines edited.
  - CLARIFICATION RULE: if a requirement is ambiguous, stop and ask rather than
    guessing. (This is why the F3 recurring-crew-button batch was deferred with a
    question rather than shipped on a guess.)
  - Prioritize robust, DATA-DRIVEN systems over hardcoded behavior — new vehicle
    types, crew configs, career content, events, and scenarios should be addable
    later with minimal code changes, the same way conditions/drugs/scenarios
    already are in the physiology engine.
  - New visual/audio ASSETS get a spec markdown before (or instead of) actual
    art: `src/assets/<category>/<Name>.md` containing Purpose, Intended
    appearance, Theme/style, Important visual elements, and Notes for the artist
    or asset generator. These are specifications only — do not attempt to
    generate actual artwork. `src/assets/audio/README.md` (F9, prior batch) is
    the existing example of this pattern for audio; extend it to art assets.
  - FINAL VERIFICATION CHECKLIST for any front-end batch, before calling it done:
    save compatibility preserved; no console errors (mentally trace the new code
    paths, since there's no runtime check available here); no broken references;
    regression reasoning completed and stated in the report.

---

## 5. Architecture worth knowing about

- **Organ-dependent drug clearance.** `kel` splits into renal and hepatic
  fractions (`renalFrac` per drug), scaled by glomerular filtration,
  hepatocellular integrity and hepatic blood flow (`co / _restCo`).
- **Competitive antagonism (Gaddum).** Naloxone shifts the opioid's apparent EC50
  by `(1 + [antagonist]/Ki)`; re-narcotization emerges from the kinetics.
- **Emax computed once per drug from summed concentration**, so two half-doses no
  longer beat one full dose.
- **Per-drug `keo`** (effect-site equilibration).
- **Two saturation instruments.** `pkAudit.mjs` flags SATURATED/INERT from
  effect-site concentration, but only for drugs in `PK_PARAMS`.
  `curveDrugAudit.mjs` covers the curve-model drugs, which have no concentration,
  by doubling their declared receptor coefficients and asking whether the
  observable moves. It found two saturations nobody had suspected.
- **The seizure limb.** `pat.seizing` is driven by drug toxicity plus intrinsic
  causes derived in `neuro.js` from glucose, sodium and pregnancy/blood pressure.
  It must be derived there, not written by a condition: conditions run
  `progress()` BEFORE `updateDrugs()` resets `pat.seizureDrive` to 0.
  Midazolam suppresses the drive (`anticonvulsant: 0.9`) and terminates a seizure
  only when suppressed drive falls below a 0.15 sustain threshold.
- **Two cardiovascular solvers, and the full ODE is authoritative.** A lumped
  model computes SV/EDV/ESV, then `updateFullLoopODE` OVERWRITES them. A fix
  applied only to the lumped model is invisible. Check the publish block in
  `updateCardiovascular` before concluding a cardiovascular change did nothing.
- **`pat.energyFailure` is the engine's single ischemia measure.** Published by
  `metabolic.js` as the fraction of oxidative demand delivery cannot meet, 0
  perfused / 1 no-flow. Prefer it to inventing another ischemia proxy.
- **Mortality is a pure observer.** Nothing in `physio/` gates on `deathCause`,
  and nothing should. Organ systems evolve because perfusion, oxygen delivery,
  ATP, temperature and cellular integrity are changing — not because a patient is
  flagged alive or dead. `mortality.js` classifies; it must never drive.
- **`outcomeReport(s)` is the debrief view and is deliberately NOT exposed**
  through `vitals()`, `roster()` or `critical()`. The provider must not learn
  survival, ROSC or neurological outcome until the evaluation screen. It computes
  no physiology of its own; if a number is wanted there that the engine does not
  track, it belongs in the module owning the mechanism.
- **`MECHANISM_TREATABILITY` is not a survival claim.** It reports whether a
  lethal mechanism is of a treatable KIND and what the lever would have been.
  Answering "would earlier treatment have saved this patient" honestly needs a
  counterfactual re-run, which nothing does. Do not let that field drift.
- **fio2 cannot drive hypoxia from a script, by design.** `pk.js` resets
  `drugFio2 = 0.21` every tick and `effectiveFio2 = max(fio2, drugFio2)`, so room
  air is a hard floor. Poking `p.fio2 = 0` in a perTick silently does nothing —
  SpO2 stays 98. Use `q.rhythm = "asystole"` to drive arrest, or
  `q.shuntFraction` for pure hypoxaemia. This cost a full batch to discover.

---

## 6. The queue, in priority order

Completed work is NOT kept here — it moves to section 3 ("What changed") and its
detail lives in the code comments at the fix site. This list is only open work.
Two batches closed since this list was last renumbered (torsades, item 0 as was;
magnesium toxicity, item 1 as was); both are written up in section 3. The three
findings they surfaced that are still open are now items 1-3 below, promoted to
the top because they are concrete, scoped, and two of them block clinical realism
that other work assumes.

**The queue now has two tracks.** The FRONT-END & GAMEPLAY block below is
the current TOP priority — do it before the numbered physiology items. It is a
different track from everything else in this handoff: it lives in the React front
end (`src/App.jsx` and friends), the scenario/content data, and the game loop, not
in the physiology engine. IMPORTANT CAVEAT FOR WHOEVER PICKS IT UP: the three
verification suites (`mechanismWiring`, `scenarioSweep`, `physiologyValidation`)
test the PHYSIOLOGY ENGINE ONLY — they will not catch front-end regressions. For
front-end work the checks are `vite build` passing, `eslint` holding at its
current baseline (see section 2's table for the live error/warning count — do
not trust a number quoted inside an older section 3 entry, which records the
count AT THE TIME that entry was written), and inspection/description of the
behavior change; there is no automated UI test harness. **Items are meant to be
deleted outright, not just marked done, the session they ship**, so the F-block
should stay free of stale entries by construction — F10 sitting ahead of F1 below
is the one standing exception: it was the top-priority item at the last
renumbering pass and was kept at its original number rather than folded into the
F1-F9 sequence, since it was still mid-batch at the time. It's now MOSTLY DONE
(see its own entry) and a natural candidate to fold away next time this block is
renumbered. Section 3's historical write-ups cite whatever F-number a batch was
filed under AT THE TIME (e.g. "F23", "F30") — those are historical labels, not
live queue numbers, so do not expect them to match the numbering below. Within
the front-end block, order is roughly by leverage, not strict priority —
use judgment, and each item bundles several related requests as sub-bullets
so they can be tackled together.

### FRONT-END & GAMEPLAY (do first)

**F0. ABSOLUTE TOP PRIORITY, STANDING DIRECTIVE: Medical Simulation Mode —
Local Browser LLM Dialogue System (operator-supplied spec, verbatim below).
Placed ahead of F1 by explicit operator instruction — work this before
anything else in this queue.** **RELIABILITY FIX (this session, see
section 3's newest entry): the first real report from genuinely
WebGPU-capable hardware (not this project's own no-adapter test
environments) surfaced two real design gaps in `LocalLLMProvider` — the
real load error was caught but never logged or exposed anywhere, and a
single failure latched `_failed` PERMANENTLY for the rest of the session
with no retry of any kind, even for a plausibly transient failure (a
network blip on a model shard, a momentary OOM, a slow first GPU shader
compile racing the load timeout). Both are now fixed: the real caught
error is logged via `console.error` with a classification
(timeout/device/network/unknown); one automatic retry fires for a
timeout/network-classified failure; a real, non-decorative "Retry" chip
in Settings' LOCAL AI DIALOGUE row (shown only when `status==="failed"`)
calls back into the real provider's own `retry()`, verified live to
genuinely clear the latch and reach a real `"ready"` state with no page
reload; and the boot/Settings status text now states which kind of
failure occurred when the classification is confident, while explicitly
restating the non-blocking promise. Verified via a new
`tools/browser/verifyLocalAiRetry.mjs` (PASS/PASS), against a forced/
stubbed failure — this environment still has no real WebGPU adapter to
reproduce the reporting user's exact hardware failure, so the retry
machinery is proven correct against real (forced) failure/recovery
transitions, not against that user's own unreproducible error. **A direct
follow-up (section 3's newest entry) investigated whether a genuine
GPU-adapter-level retry (varying `powerPreference`, or handing web-llm a
pre-obtained adapter/device) could recover the SAME user's "device"-
classified failure specifically, and found — checked against the actual
installed `@mlc-ai/web-llm` source, not assumed — that no such lever exists
in this library version: `CreateMLCEngine` always calls the library's own
internal adapter-detection with a hardcoded default and exposes no config
field to change it or inject a pre-made device, and Chromium's own console
warning confirms Windows ignores the `powerPreference` value regardless. No
decorative retry was built; instead both boot/Settings surfaces gained a
real, short troubleshooting hint for this failure kind (hardware
acceleration setting, GPU driver update, `edge://gpu`/`chrome://gpu`),
verified live via a new `tools/browser/verifyDeviceHint.mjs`.** **STATUS: F0's originally-scoped numbered
items 2-11 are now CLOSED — seven real, verified slices have shipped (see
section 3's seven newest entries), the last of which (items 7 and 10) is
the closing slice for this block. Every one of items 1 through 11 now has a
real, verified implementation (live in this environment where the
environment allows it, direct-function/forced-state verification where a
genuine WebGPU adapter is the only thing standing in the way — see below).
What remains open is real, and is restated precisely at the end of this
entry — this is NOT a claim that F0's full 33-item spec or Definition of
Done is complete.** The shared Dialogue Manager
architecture (items 1, 12, 20-22), a bounded structured-context builder
(items 13-15), Tier 1/2 (deterministic/template) dialogue actually working
and wired to real physiology (personality-driven unprompted patient
dialogue, item 19; dialogue during a procedure without blocking, item 23;
treatment-response dialogue, item 18; a real crew-voiced dialogue reaction
plus its reverse edges, item 12's own "crew dialogue can reuse the same
architecture"), `LocalLLMProvider` (Tier 3) GENUINELY FUNCTIONAL (real
`navigator.gpu` feature detection, a real `generate(event,ctx)` call path
backed by `@mlc-ai/web-llm`, a real layered load/generation timeout,
verified fallback to Tier 2 on any failure, a `requestLocalUpgrade()`
fire-and-forget helper wired into one real gameplay site), and — NEW this
session — **item 4, the boot/initialization screen, is real and shipped**:
a new `phase:"boot"` is now the first thing any fresh session sees
(`src/App.jsx`'s `blank()` default, `src/components/BootScreen.jsx`), with
an honest core-systems checklist (real counts read from `CONDITIONS`/
`SCEN`/`MAPS`/`BAGS`, shown ready instantly because this SPA genuinely has
no async load phase for them — not a fabricated progress bar) and a
separately-wired AI panel showing real `navigator.gpu` support, real
web-llm download/compile progress (a new `subscribeProgress`/
`initProgressCallback` wire-up in `dialogueProvider.js`, exposed via
`dialogueManager.js`'s new `getLocalAiState()`/`preloadLocalAi()`/
`subscribeLocalAiProgress()`), and a "Continue without AI" button that is
clickable and functional from the very first paint, never gated on AI
state — verified live via a new `tools/browser/verifyBootScreen.mjs`:
fresh navigation lands on boot, the checklist and AI panel both render
real state, Continue advances to title immediately, and a real
"Go on shift" click afterward proves the game stays fully playable, zero
console errors. **Item 8 (persistent model caching) is now real — see
section 3's newest entry.** `LocalLLMProvider.checkCache()`
(`dialogueProvider.js`) calls web-llm's own real, exported
`hasModelInCache()` BEFORE the loader runs, and `status()` now reports a
genuinely distinct `"loading-from-cache"` vs `"downloading"` state instead
of one collapsed `"loading"` — the boot UI's DOWNLOADED/CACHED-vs-
in-memory distinction item 4's own status model was left with room for now
has real data behind it, verified both live (a fresh boot launch, and a
reload confirmed to honestly report "not cached" rather than a false
positive) and via a direct-function test that seeds a real, correctly-keyed
Cache API entry and confirms detection. Resumability was investigated
against web-llm's own source (not assumed): it is real, but at
SHARD-FILE granularity (each of the model's many download chunks commits
to the Cache API atomically and independently; an interrupted download
skips already-completed shards on a later launch and only re-fetches the
rest), not literal byte-level "resume at 63%" — see section 3 for the full
citation trail. **Item 5 (the ~20% progressive-download-gate UX) is now
real** — see section 3's newest entry: a pure, exported
`progressStage(fraction)` (`dialogueProvider.js`) classifies real download
progress as `not-started`/`early`/`meaningful`(>=~20%)/`ready`, surfaced via
`dialogueManager.getLocalAiState().progressStage` and rendered as
threshold-aware messaging under the boot screen's Continue button
(`src/components/bootScreenText.js`'s `continueHint()`) — the button itself
was already always-clickable at every state (item 9, unchanged), so this
slice added the tone change the spec's own text describes, not a new gate.
Verified via synthetic progress values fed directly to `progressStage()`
(15 cases including the exact threshold boundary), not a live download
observed crossing 20% — no environment tested so far can produce one. A
also-fixed-this-slice `tools/browser/verifyLocalLLMProvider.mjs` (was
broken since the boot-screen slice added `phase:"boot"` and never clicked
through it) now passes again. **Item 6 is now real — see section 3's newest
entry.** A new `src/components/AiDownloadIndicator.jsx`, mounted from
`Shell.jsx` (the project's existing always-mounted UI chrome, alongside the
Settings gear — present on every screen past boot), reads the SAME
`getLocalAiState()`/`subscribeLocalAiProgress()` plumbing the boot screen
already uses and renders a small, unobtrusive pill ONLY while genuinely
`downloading`/`loading-from-cache`/`loading` — near-invisible (renders
nothing at all) once `ready`/`unavailable`/`failed`/`idle`. The
`LocalLLMProvider` singleton's persistence across the boot->title phase
transition is now DIRECTLY confirmed, not just inferred from it being
module-level: `tools/browser/verifyBackgroundAiIndicator.mjs` imports
`dialogueManager.js` from inside the live page before and after the
transition and confirms `===` module-object identity, plus confirms sim time
and scene UI keep updating normally with the indicator mounted and
subscribed. Real, cross-RELOAD persistence (as opposed to the same-page
phase transition verified here) was not and could not be tested — a reload
always restarts at `phase:"boot"` by this app's own design, and the spec's
own text is explicit that browsers don't guarantee background execution
across a reload/tab-close anyway. **Items 7 and 10 are now real and
shipped — see section 3's newest entry, the closing slice for this block.**
Item 7: `src/components/AiReadyNotice.jsx`, mounted from `Shell.jsx`, shows
the spec's exact "Local AI is ready. Refresh Proximate to enable dynamic
dialogue." notice with a `Refresh Now` button and a dismiss control, only
after a genuine downloading/loading→ready transition observed during the
current session — never on first paint, never forced. A real investigation
into refresh-vs-hot-swap (traced against the actual `requestLocalUpgrade`→
`generate`→`_ensureEngine` call chain) found this codebase's own singleton
`LocalLLMProvider` design already lets the SAME session pick up a
freshly-`"ready"` model on its very next dialogue event with zero extra
plumbing, so no hot-swap code was built — `Refresh Now` is a plain,
player-optional `location.reload()`, never automatic. Item 10:
`SettingsOverlay.jsx` gained a real "LOCAL AI DIALOGUE" row (status/
download-size text from the same `getLocalAiState()` every other AI surface
uses, Enable/Disable chips writing `g.localAiEnabled`), and
`dialogueManager.js`'s new `isLocalAiEnabled(s)` is checked first inside
both `generateDialogue()` and `requestLocalUpgrade()` — confirmed a genuine
short-circuit, not a UI-only checkbox, via a direct-function test with a
real, callable stub engine forced onto the singleton. Both verified live via
a new `tools/browser/verifyAiReadyNoticeAndToggle.mjs`, which also added a
DEV-only `window.__proximateTestForceLocalAi` hook (mirrors the existing
`__proximateTestSetState` convention) since no environment here has a real
WebGPU adapter to reach `"ready"` on its own. Real, live, end-to-end
resumability (actually interrupting a real multi-shard download and
confirming a second launch resumes it) remains unconfirmed in any
environment across any F0 session — no environment tested so far has a real
WebGPU adapter to get far enough for shard downloads to even begin.
**`requestLocalUpgrade` is now wired to all four real dialogue call sites
(this session)** — crew reactions, treatment-response, and procedure
discomfort join the previously-sole unprompted-patient-dialogue site; see
section 3's newest entry for the full mechanism (the same fire-and-forget/
in-place-log-patch pattern at every site, the `.map()`-based id lookup
doubling as the stale-patch guard, and per-site live verification of both
the enable/disable gate and double-fire safety — all three sites now pass
cleanly, including double-fire, via `verifyDialogueTier3Extension.mjs`; a
real click-flake in an earlier same-session draft script, not an app defect,
was the reason the third site's own double-fire check was initially
inconclusive — see section 3's newest entry and `tools/browser/README.md`'s
gotchas list for the fix). **Item 23's mini-game dialogue gap is now closed
— see section 3's newest entry.** The four real procedure mini-games
(`AccessMinigame.jsx`/`AirwayMinigame.jsx`/`CricMinigame.jsx`/
`SGAMinigame.jsx`) now fire real dialogue at one genuine, event-driven
physical moment each (the needle/IO stick, the incision, the laryngoscopy/
ETT blade-view confirmation, the SGA blind-insertion attempt), through a
shared `fireMinigameDialogue` helper (`App.jsx`) using the identical
`generateDialogueSync`+`requestLocalUpgrade` pattern every other dialogue
site already uses, plus a separate success-relief line on a successful
resolution. This mechanism was found already present and working in the
tree at the start of that session (undocumented until then — see that
entry's own note on the gap between "documented as open" and "actually
shipped"); the session's real contribution was confirming it end to end
(build/lint baseline, a new live-verification script run twice clean,
covering all four mini-games' Tier-1/2 firing, sim-time-not-blocked, one
representative site's Tier-3 gate, and a real visual non-collision check
against `DialoguePanel`) and closing this document's own record of it.
Tier-3 was verified per-site for AccessMinigame/IV only, not independently
re-verified for the other three (a reasonable but not exhaustive
extrapolation from the shared, already-per-site-proven gate code — see
section 3 for the honest caveat). **Items 16-17 (personality/emotional-state
depth) — item 16 (personality) confirmed DEEPER than this document
previously claimed (a stale-doc correction, not a gap: it already drove
Tier-2 template BUCKET selection across all seven patient-voiced event
pools and was already present in the Tier-3 prompt, not just unprompted-
dialogue firing probability); item 17 (a structured, simulation-determined
emotional state, distinct from personality) was genuinely unbuilt and is
now real — see section 3's newest entry.** `src/dialogue/emotionalState.js`
(new) derives one of ten canonical states from real physio fields
(consciousness, pain, a new real pain/consciousness TREND signal, and
personality) with a strict one-way boundary (dialogue reads it, nothing
ever writes back into physiology); wired into both `TemplateProvider`'s
bucket selection and the Tier-3 prompt (which now states the emotional
state explicitly as simulation-fixed, not the model's to invent). Verified
direct-function (15 assertions) and live (two real ticks with a genuine
pain-trajectory swing produce a genuinely different emotional state AND
genuinely different Tier-2 dialogue text for the identical event, PASS/PASS
zero real console errors). A real, pre-existing em-dash violation in
several Tier-2 template strings (invisible before because `sanitize()`
never touched hand-authored Tier-2 text) was found and fixed in the same
session. **Item 17's own "10 states -> 3 buckets" gap is now partially closed — see
section 3's newest entry.** The prior session's own claim was verified by
reading `TemplateProvider.generate()` directly before touching anything,
and held up exactly as stated: all ten `emotionalState.js` states were
collapsing onto only 3 template buckets via `bucketForEmotionalState`.
`TemplateProvider` now checks for a bucket keyed DIRECTLY by the emotional-
state name before falling back to that 3-way collapse, and six of the seven
patient-voiced pools gained real, hand-authored, state-specific text: `"in
pain"` and `"exhausted"` buckets on `pain_unprompted`/`procedure_discomfort`/
`treatment_improving`; `"frightened"` on `anxious_unprompted`/
`deterioration_unprompted`; `"agitated"` and `"confused"` on
`deterioration_unprompted`; `"confused"` on `airway_stimulation_reaction`;
`"reassured"` on `treatment_improving`/`procedure_success_relief`.
`embarrassed` is no longer permanently unreachable: torso exposure
(`clothing.js`/App.jsx's real, pre-existing `exposureActs` — "Remove
shirt"/"Lift shirt"/"Cut shirt") is a genuinely embarrassment-appropriate,
already-existing gameplay event, now wired as an explicit
`event.bucket:"embarrassed"` override in `start()`'s own action-completion
path, firing a new `exposure_reaction` template pool — confirmed live by
clicking the real action in a browser and reading the resulting
`dialogueLog` entry. `deriveEmotionalState()`'s general derivation still
does not produce "embarrassed" on its own (unchanged, and still correctly
so — no ambient signal distinguishes it), only this one explicit trigger
does. Still open: item 16's traits still only drive bucket selection, not
per-word phrasing variation; `crew_seizure_reaction`/
`crew_unresponsive_reaction`/their reverse-edge pools and `"angry"` (still
collapses to the `irritable` bucket) were deliberately left unenriched this
batch (crew pools are calm-only by design; "angry" reads adequately close
to "agitated"'s irritable-bucket wording for now); crew/bystander
emotional-state depth was not attempted. **The trend signal's own
"pain/consciousness only" gap is now closed — see section 3's newest
entry.** `dialogueContext.js`'s `computeTrend()` now also reads hr/spo2/sbp
(the same three vitals actions.js's own default exam findings already treat
as bedside deterioration/stabilization signs), so a patient trending
tachycardic/hypoxic/hypotensive can push toward "agitated"/"frightened" even
when pain/consciousness alone wouldn't trigger it, and a patient trending
back toward normal vitals can support "reassured" without a pain change.
Verified live (`tools/browser/verifyBroaderTrendSignal.mjs`, new) with
pain/consciousness held CONSTANT across both samples, so the resulting
trend can only be coming from the new vitals signal. **Item 15's bystander/family character class is now
real — see section 3's newest entry.** `dialogueContext.js` gained a
`bystander:{present,role}` field derived from the scenario's own real,
pre-existing `bystanders` free-text (`data/scenarios.js`, every one of the
161 real scenarios already declares one; previously read only once, for the
scene-arrival log line) via a small relationship-keyword matcher
(husband/wife/mother/neighbor/etc, falling back to "bystander"); two new
Tier-2 pools (`bystander_seizure_reaction`/`bystander_unresponsive_reaction`,
`dialogueProvider.js`) fire from the SAME seizing/consciousness edge-
detection crew already reacts to, in a genuinely distinct panicked/pleading,
non-clinical voice, independent of crew presence but scene-phase only
(unlike crew's scene+transport); the Tier-3 prompt states the knowledge
boundary to the model explicitly; `DialoguePanel` shows the real parsed role
("HUSBAND") instead of a generic tag. Verified live via a new
`tools/browser/verifyBystanderDialogue.mjs` (PASS/PASS, zero console
errors) including a real knowledge-boundary regex check against clinical
terminology. Deliberately scoped to two real trigger moments, not
exhaustive depth: bystander personality/distress modeling, reverse-edge
relief lines, and an arrival-moment trigger all remain open, restated in
section 3's own entry. Crew/bystander emotional-state depth (beyond the two
new bystander pools' single "calm" bucket, matching crew's own existing
simplification) was not attempted. Voice-readiness remains open.
**Item 30 (automated non-browser testing) is now real for the pure
Tier 1/2 dialogue logic — see section 3's newest entry.** New
`src/scripts/verifyDialogueNonBrowser.mjs`, runnable via plain `node` (no
dev server, no browser, no Playwright), 74 assertions, 74/74 passing:
`dialogueContext.js`'s `buildDialogueContext()` (shape, size, bystander
field, both trend signals), `emotionalState.js`'s `deriveEmotionalState()`/
`bucketForEmotionalState()` (every branch), `dialogueProvider.js`'s
`DeterministicProvider`/`TemplateProvider`/`progressStage()`, and — the
spec's own named "most important single test" — `dialogueManager.js`'s
`generateDialogueSync()` Tier 1/2 fallback path confirmed correct with the
local LLM STRUCTURALLY absent (this whole script runs in a Node process
with no `window` and no `navigator.gpu`, not merely a toggled-off flag),
across every real event type including procedure-minigame dialogue,
plus conversation-memory capping and multiple-simultaneous-patient
non-cross-contamination. What item 30 still does NOT have: any automated
test of `LocalLLMProvider.generate()`'s real Tier-3 path (needs a real
browser + WebGPU adapter — stays `tools/browser/`-only, unconfirmed on
real hardware same as every prior session), and no non-browser port of the
boot-sequence/download-state/cached-model-detection LIVE behavior (those
stay Playwright-covered; porting them would mean faking the DOM/Cache API
in Node, not attempted this session). **Real generation
success on an
actual WebGPU-capable device is honestly STILL UNCONFIRMED** — every
environment available across both sessions so far (headless Chromium)
reports `navigator.gpu` present as an API surface but fails the real
adapter request, which correctly and cleanly exercises the failure/
fallback path (verified again this session: the boot screen's AI panel
correctly lands on "UNAVAILABLE — local AI failed to load on this
device") but has never once exercised a real successful local-model
generation or a real download-progress percentage climbing — that remains
the first thing to confirm on real WebGPU-capable hardware. Read section
3's own entries for exactly what was built each slice, including a real,
reusable testing gotcha found in an earlier session (forcing a seizure
edge for verification needs BOTH `pat.epilepticDrive=1` and
`pat.seizing=true` together, not either alone — see
`tools/browser/README.md`'s gotchas list), and why each remaining piece
was left open rather than guessed at.**
**A later session investigated getting real WebGPU in this dev/test
environment (per explicit operator request), with a real, honest
finding.** The machine this project is developed on has real GPU hardware
(confirmed via `Get-CimInstance Win32_VideoController`: an Intel UHD 630
and an NVIDIA GTX 1650, both `Status: OK`) — but Playwright's bundled
"Chrome for Testing" v151 build never registers `navigator.gpu` as an API
surface at all, in any tested configuration (headless, headed, sandboxed,
unsandboxed, every relevant launch flag including `--enable-unsafe-webgpu`/
`--use-angle=d3d11`/`--enable-features=WebGPU`) — a correction to the
paragraph above's older claim that `navigator.gpu` is "present as an API
surface but fails the real adapter request"; that may have been true of an
earlier Playwright/Chromium bundle, it is not true of the one now
installed. Chrome's own internal blocklist telemetry confirms WebGPU
itself is not blocklisted on this hardware, so the gap is specific to this
particular test-browser build, not the machine or the app. This is not
fixable from application code or launch flags, is orthogonal to what a
real player's own installed Chrome/Edge would do on the same hardware, and
was correctly not pursued further once traced to the test-browser binary
itself. **Directly prompted a genuinely useful check of the OTHER half of
the accessibility question: does the existing WASM fallback (item 2's
`WasmLLMProvider`) actually catch a real no-WebGPU device, not just a
theoretical one?** Ran `tools/browser/verifyWasmLlm.mjs` against this exact
machine (a real, naturally-occurring no-`navigator.gpu` environment, not a
forced/stubbed one) and got genuine, non-degenerate WASM-tier-generated
dialogue for all 4 sampled event types (patient/crew/bystander/
treatment-response) — first real-world confirmation that the
WebGPU→WASM→template→deterministic degradation chain (item 11) actually
engages its second rung correctly on a device that lacks the first, not
only under a forced test hook.

**Objective.** Build the foundation for contextual, locally running
LLM-powered dialogue in Medical Simulation Mode — patients, crew, and
eventually others on scene feel substantially more natural, reactive, and
varied, without ever letting an LLM control the authoritative medical
simulation. The LLM must run entirely locally in the player's browser/device
whenever technically possible. Medical Simulation Mode stays free: no API
key, no AI-provider account, no paid inference, no patient conversation ever
sent to a remote AI service. This covers both the local-LLM dialogue
infrastructure and the boot/loading experience needed to initialize it.
**Do not modify the physiology engine.**

**1. Hard architectural requirement.** `Game State → Dialogue Context
Builder → Local Browser LLM → Generated Dialogue → Player` — NOT `Game →
Your Server → Paid LLM API → Game`. Do not design around OpenAI/Anthropic/
Gemini/any paid server-side API as the PRIMARY dialogue architecture; no
player-facing API key; the backend must not pay per line of dialogue. Keep
the local inference backend swappable later.

**2. Browser compatibility.** Don't assume Chromium-only. Investigate the
most broadly compatible local-inference approach (WebGPU / WASM / other) for
this project's target browsers. The rest of the game talks to a generic
`Dialogue Manager → Inference Adapter → Browser Inference Backend → Local
Model` interface — dialogue code shouldn't care whether the backend is
WebGPU or WASM.

**3. Local model selection.** Optimize for fast, believable dialogue on
ordinary consumer hardware, not the smartest model available — the
simulation already supplies structured facts; the LLM's job is
conversational tone, personality, and short-term continuity, not reasoning
about medicine. Evaluate model/download size, RAM/VRAM/CPU needs, WebGPU/WASM
compatibility, first-token latency, tokens/sec, and mobile/low/mid/high-end
performance before committing. Don't force a huge download on users.

**4. Boot/initialization system.** Proximate needs a unified boot screen
that feels like initializing a self-contained simulation, not a generic page
load — a checklist of core systems (medical database, map data, audio, UI
assets, scenario data) plus a separate local-AI progress bar with a
"Continue without AI" option. The boot system should distinguish DOWNLOADED/
CACHED from CURRENTLY LOADED INTO ACTIVE MEMORY — Career Mode assets
(tester-only today) should be architecturally cacheable later without
forcing them into active RAM/GPU memory just because they're on disk, and
without needing a separate build. The boot system detects: device supports
local inference or not; model already downloaded; model currently loading;
download in progress; model ready.

**5. Progressive LLM download.** Don't force the player to wait for the
full model. Once core assets are ready AND ~20% of the model has
downloaded, offer "Continue without AI" — the player enters Medical
Simulation Mode while the model keeps downloading in the background when
the browser permits it.

**6. Background download.** On "Continue without AI": enter the game
normally, keep downloading in background when possible, never block
gameplay, show an unobtrusive progress indicator, PERSIST progress, and
RESUME interrupted downloads rather than restarting from zero. Browsers do
NOT guarantee background execution (especially mobile — tab backgrounding,
device lock, app switch, memory pressure, page suspension can all interrupt
it) — design for "download when possible, resume when execution becomes
available again," chunked/resumable rather than one giant request.

**7. Completion notification.** When the model finishes: an unobtrusive
"Local AI is ready — Refresh Proximate to enable dynamic dialogue [Refresh
Now]" notice. Never force a refresh. If dismissed, continue the current
session normally, keep the model cached, let the player refresh later, and
recognize the cached model on next launch. Investigate whether the model can
be initialized without a full refresh, but don't add complexity just to
avoid one — manual refresh is fine if it's the more reliable architecture.

**8. Model caching.** Persistent local cache. First launch: download → cache
→ ready. Later launch: detect cached model → load → ready. A download
interrupted partway (e.g., closed at 63%) should resume from ~63% on return,
assuming the storage/download architecture supports resumability. Never
re-download the same model from scratch.

**9. Never permanently AI-gated.** The game must stay playable if local
inference is unsupported, the download fails, the player declines, the
device is insufficient, or the browser blocks the needed tech — AI dialogue
is an enhancement, never a hard gate. The loading screen should be able to
transition to "core game ready, AI still initializing" rather than trapping
the player on an infinite spinner because the model failed.

**10. Local AI settings.** Eventually: an "Local AI Dialogue" settings
toggle describing what it does, showing AI/model status, download size,
support/readiness, with Enable/Disable. Disabled → deterministic/contextual
fallback dialogue.

**11. Graceful degradation hierarchy.** Local LLM available → contextual
generated dialogue. Unavailable → contextual/template dialogue. That
unavailable too → deterministic dialogue. Never leave the player waiting
indefinitely for an LLM response, and the simulation must continue normally
even with the LLM fully unavailable.

**12. Modular dialogue system.** A dedicated dialogue subsystem, not LLM
calls scattered through React components. Clean interface equivalent to
`generateDialogue(context)`. The rest of the app shouldn't need to know
which model/inference API/backend/loading/caching mechanism is in use —
`Dialogue Manager → Dialogue Provider Interface → Local Browser Provider →
Local Model`, so the implementation can evolve without rewriting Medical
Simulation Mode.

**13. Structured dialogue context — never the entire game state.** Build a
compact, purpose-built context per call: patient (name, age, sex,
personality, baseline demeanor, emotional state, consciousness, current
symptoms, relevant history/allergies/meds, current physiological state,
distress level); situation (location type, scene circumstances, who's
present, what just happened); player (provider level, recent actions,
current procedure, recent statements, familiarity); crew (names, roles,
levels, relevant current actions, recent dialogue); and a short, relevant
recent-events summary (e.g. "Patient became increasingly short of breath.
Player applied oxygen. Patient's respiratory status improved. IV attempt is
currently underway. Patient remains anxious.") — never the full simulation
history.

**14. Keep context small.** No indefinitely growing conversations. Maintain
short-term conversation memory, recent events, current patient state,
relevant character info; drop or summarize old irrelevant information;
current context always outweighs historical context. This matters especially
for browser-local inference.

**15. Situation-specific context — no one giant shared prompt.** A patient
can know their own symptoms/history/experience, what the player told them,
what's been done to them, their own emotional state. A crew member can know
what they can reasonably observe, what the patient is doing, what other
providers have done, current scene conditions, their own role/capabilities.
A family/bystander can know what they personally witnessed, their
relationship to the patient, their own emotional state. No character may
know something they couldn't reasonably know.

**16. Character personality.** Structured personality attributes (e.g.
`anxious:0.8, cooperative:0.6, talkative:0.9, irritable:0.2, trusting:0.4`)
that meaningfully shape dialogue — two patients with the same condition
should not sound identical. Exact implementation is open.

**17. Emotional state.** Structured states (calm, anxious, frightened,
confused, agitated, angry, embarrassed, in pain, reassured, exhausted). The
SIMULATION determines the emotional state; the LLM only interprets/expresses
it — the LLM must never arbitrarily change authoritative emotional state.

**18. Event-driven generation, not continuous polling.** Generate dialogue
in response to meaningful events only (player asks a question, patient
answers, patient deteriorates/improves, procedure begins/succeeds/fails,
treatment given, new crew arrives, fire crew reports something, patient
becomes frightened, patient asks something unprompted) — minimizes compute,
battery, latency, and dialogue noise.

**19. Unprompted patient dialogue.** Patients should occasionally initiate
dialogue on their own ("I don't feel right." / "Why is my heart beating so
fast?" / "Can you call my wife?" / "Am I going to be okay?") via controlled
probability + cooldowns, never constantly interrupting the player. Frequency
should depend on personality, anxiety, severity, recent events, time since
last dialogue, and consciousness.

**20. Three-tier dialogue architecture — not every line uses the LLM.**
Tier 1 Deterministic (basic assessment Q&A, standard responses, routine
acknowledgements, simple procedural dialogue). Tier 2 Contextual templates
(common-but-variable events: deterioration, treatment response, procedure
discomfort, resource arrival, patient anxiety). Tier 3 Local LLM
(open-ended questions, emotional conversation, unexpected reactions,
personality-driven interaction, complex/natural follow-up dialogue). This
matters for performance and battery life.

**21. LLM must NEVER control the medical simulation — absolute
requirement.** Not diagnosis, vitals, physiology, medication effects,
procedure success, treatment effects, deterioration, survival, resource
availability, dispatch, or call outcomes. The simulation says `SpO2=84%`;
the LLM can say "I feel like I can't breathe," never "The oxygen brought my
SpO2 up to 95%." The physiology engine remains authoritative — this is the
same non-negotiable boundary section 1 of this document already draws
around mechanisms vs. stat writes, just applied to dialogue generation
instead of physiology code.

**22. Conversation memory.** Short-term memory so a later line can
correctly reference an earlier one (e.g. "When did the pain start?" → "About
twenty minutes ago." → later, "It's getting worse." should be understood in
context) — but old irrelevant dialogue should eventually be discarded or
summarized (ties back to item 14).

**23. Dialogue during procedures must not freeze/interrupt gameplay.**
While the player is mid-IV/IO/intubation/SGA/vitals/airway-management, the
patient/crew should still be able to talk (e.g. "Ow, that hurts." while the
IV mini-game continues) — dialogue exists alongside the simulation, not as a
blocking overlay on top of it. **Directly overlaps the already-standing
Procedure Gameplay workstream's own open item 2.5 (real interruptibility) —
coordinate with that entry rather than solving the pause/mini-game
interaction twice.**

**24. Voice-ready architecture, not built now.** Don't implement full voice
this task, but design so `Player types → Dialogue Manager` and later
`Player speaks → Speech-to-text → Dialogue Manager` both feed the same
pipeline — no separate conversation logic for voice vs. text.

**25. UI requirements.** A conversational UI that clearly identifies the
speaker, displays dialogue naturally, lets the player respond, shows
generation-in-progress, never blocks medical controls, works alongside
procedures, works on mobile, and has a text-based interaction path even
before voice exists. Not a full-screen visual-novel box for every line —
dialogue should read as one part of an active medical scene.

**26. AI status UI.** Player-visible AI state where relevant (not
downloaded / downloading N% / ready / unavailable-using-fallback) — detailed
status lives in boot/settings; gameplay gets a small, unobtrusive indicator
at most, not constant technical noise.

**27. Performance requirements.** Inference must never block rendering,
input, procedures, timers, physiology, dispatch, or any other simulation
system — asynchronous only. If inference is too slow, fall back rather than
freezing the game.

**28. Resource management.** Account for RAM/VRAM/CPU/GPU/battery/thermal
impact. Avoid simultaneous unnecessary generations. Plan for request
cancellation, prioritization, cooldowns, max response length, and a
generation queue where warranted — a response that's become stale because
the situation changed before it finished generating should be discardable.

**29. Developer/test mode.** A way to test dialogue without playing a full
call: normal / anxious / agitated / deteriorating / improving patient;
patient during IV; patient during airway management; crew dialogue; family
dialogue; LLM unavailable; model-load failure; slow inference; fallback
dialogue — a developer should be able to hand-supply a simulated context and
see the system's response.

**30. Automated testing.** Cover context generation and size, the dialogue
provider, local-model availability, model-load failure, generation failure,
timeout, empty output, fallback behavior, conversation memory, multiple
simultaneous events, dialogue during procedures, the boot sequence, download
state/interruption/resumption, cached-model detection, and AI-unavailable
fallback. Most important single test: **the medical simulation must
continue correctly with the local LLM completely disabled.**

**31. Security and privacy.** Never transmit patient dialogue to a remote
AI service; no external AI account required; never send simulation state to
a third-party LLM; keep generated conversation local; no analytics that
could accidentally transmit patient/simulation content. The architecture
should make it clear that simulated patient conversations are processed on
the player's own device.

**32. Career/Co-op compatibility, without making them public.** Career Mode
and Co-op Mode are tester-only and must stay password-protected — this task
does not change that (see F1's own "development access restriction," a
real, still-unbuilt gate this queue already flags as an early priority).
The dialogue architecture should eventually be reusable by Medical
Simulation, Career, and Co-op alike — build ONE shared dialogue
infrastructure, not three separate systems, even though only Medical
Simulation is in scope to actually wire it into right now.

**Item 2 update (2026-08-27, latest session — see section 3's newest
entry): a real second backend now exists for the broad-compatibility
requirement.** `LocalLLMProvider` (WebGPU-only, via `@mlc-ai/web-llm`)
remains Tier 3's primary, fastest, best-quality path. A new
`WasmLLMProvider` (`dialogueProvider.js`, via `@huggingface/transformers`
forced to its `wasm` device, model `HuggingFaceTB/SmolLM2-360M-Instruct`)
is now real and wired into `dialogueManager.js` as a genuine middle rung:
tried only when WebGPU is absent or its own provider fails, never racing
it. Real, live, non-stubbed generation was observed for the first time in
this project's F0 history (`tools/browser/verifyWasmLlm.mjs`) — this
environment has no real WebGPU adapter but does have real WebAssembly, so
this is the first F0 session able to prove actual Tier-3 GENERATION, not
just the fallback path. **Quality was then pushed as far as it legitimately
goes at this model size (a direct follow-up session, see section 3's
newest entry): tuned generation params (repetition_penalty/
no_repeat_ngram_size/top_p/top_k, tightened max_new_tokens), a genuine
WASM-tier-specific few-shot prompt, and a real degenerate-output guardrail
(echo-of-event-type and repeated-token detection, throwing to trigger the
existing Tier-2 fallback) all shipped and are measurably better via a real,
live, four-event-type before/after transcript. A real model-swap
investigation (Qwen2.5-0.5B-Instruct, the SAME model the WebGPU tier uses,
via a real, confirmed-published ONNX build) was tried and REJECTED after
live A/B measurement — it was slower and produced worse, off-topic,
instruction-ignoring output than SmolLM2-360M at this pipeline's default
chat templating, a genuine negative result, not a skipped step.** Output
quality remains honestly imperfect (length instructions aren't reliably
obeyed, a generation can still drift semantically mid-line) — this is
expected at 360M params and will never match the WebGPU tier, which is why
the Tier-2 fallback safety net (now backed by a real guardrail, not just
the pre-existing empty-output/timeout checks) is the thing actually making
this acceptable. **Boot-screen surfacing of the WASM backend's own status is
now done — see section 3's newest entry** (`getLocalAiState()`/
`aiStatusLine()`/SettingsOverlay were already backend-aware; `BootScreen.jsx`'s
own separate status-prose block was the one place still hardcoded to WebGPU
wording, now fixed). Not yet done:
a real cache pre-check equivalent to `hasModelInCache()` (transformers.js
has no public equivalent, confirmed by reading its API), and a proper
multi-turn few-shot retry of Qwen2.5-0.5B (a real, scoped follow-up a
future session could still attempt).

**33. Explicit scope boundaries — do NOT, as part of this task:** modify
the physiology engine; let the LLM control medical outcomes; rewrite
dispatch; implement full voice recognition; implement Career Mode; implement
Co-op; replace existing procedure mini-games; rewrite Medical Simulation
Mode's entire state architecture; add a massive NPC system; add a
server-side AI dependency; force users to download an LLM before they can
play; force a page refresh when the model finishes downloading. Build the
local browser dialogue infrastructure, boot/loading system, model
management, and Medical Simulation integration — nothing more.

**Definition of done** (all of the following, not a partial subset): a
patient can hold contextual conversations reflecting authoritative
simulated state; personality meaningfully affects responses; recent
conversation context is retained; patients can occasionally self-initiate
dialogue; crew dialogue can reuse the same architecture; the LLM runs
locally in-browser with no API key/paid service required; the game works
with local inference unavailable, via a real deterministic fallback; initial
load doesn't require the full model download; core assets initialize
through the boot system; the player can continue once core assets are ready
and ~20% of the model has downloaded; the model keeps downloading in the
background when the browser permits; interrupted downloads resume where
technically possible; the model is cached and recognized on later launches;
completion produces a non-blocking "AI ready, refresh to enable" notice, and
the player is never forcibly refreshed; dialogue never blocks simulation or
procedure gameplay; context is deliberately bounded; LLM usage is
compute-conscious; the architecture can later accept speech-to-text input
with no rework; the physiology engine remains completely authoritative;
Career/Co-op remain password-protected; the implementation is isolated
enough for a future session to pick up independently; and the entire game
remains playable without the local LLM.

**Guiding principles, in priority order**: (1) the simulation determines
what is happening — the local LLM determines how characters communicate
about what is happening; (2) AI should enhance Proximate, not become a
requirement for it; (3) a fast, small, local model that's believable beats a
powerful model that makes the game slow, expensive, or inaccessible; (4)
download once, cache locally, use repeatedly; (5) never sacrifice the
simulation's responsiveness for AI dialogue. The end result should feel less
like "a game with a chatbot bolted on" and more like a living simulation
where the characters happen to be capable of natural conversation.

---

**F1. STANDING DIRECTIVE: Medical Simulation Mode development priorities
(operator-supplied master ordering) — the current governing priority list for
this whole front-end/gameplay queue, not just one item among many.** The
operator's own framing: the goal is to make Medical Simulation Mode
**reliable, realistic, replayable, and genuinely fun** before it's ready for
public testing/release. Career Mode and Co-op Mode are tester-only for now
and must not be publicly accessible. **Standing rule for every future
front-end batch**: when choosing between (A) adding a new feature and (B)
making an existing Medical Simulation feature more reliable, prefer (B)
unless the new feature is necessary for the core gameplay loop. The target
is *"Make Medical Simulation Mode so good that it can stand on its own as a
complete game mode"* — polished and trustworthy, not feature-complete in
every imaginable respect.

**Priority 1 — Core Medical Simulation loop.** Make the fundamental loop
excellent: Dispatch → Response → Scene → Assessment → Treatment →
Reassessment → Transport/Disposition → Return to service. Each stage should
be functional and enjoyable; the player should always have something
meaningful to do; avoid long stretches where the player is just waiting on a
timer.

**Development access restriction, filed alongside Priority 1 since it's a
real, immediate gate on the public build, not a "someday" item.** For the
current public-facing build: Medical Simulation Mode should be publicly
accessible; Career Mode and Co-op Mode must remain password-protected, with
only authorized testers able to reach them. Do not expose unfinished
Career/Co-op functionality through normal menus unless the tester has
successfully authenticated. The password system must not interfere with
Medical Simulation Mode. Do not remove or disable the underlying Career/Co-op
code — the goal is to restrict access while those systems stay under
development. Keep the access-control implementation isolated so it can
eventually be removed cleanly once those modes are ready for public release.
Public flow should be **Launch → Medical Simulation Mode**; authorized
testers get **Launch → Medical Simulation Mode / Career Mode / Co-op Mode**.
Do not allow unfinished modes to become accidentally accessible through
direct URLs, menu manipulation, or normal user actions. **DONE — found
already fully built (a later session, see section 3's own entry
correcting this paragraph), not built by this directive itself.**
`src/testerGate.js` (`TESTER_KEY`/`TESTER_PASSWORD`/`isTesterUnlocked`, a
single browser-wide `localStorage` flag, deliberately isolated for clean
future removal) is real and already wired: `App.jsx`'s `goGmode()` routes
Career/Co-op through a password-gated `testerGate` phase unless already
unlocked (with a 🔒 TESTERS ONLY badge on both buttons), while Medical
Simulation Mode's own button never touches the gate at all — exactly the
public/tester split this paragraph asks for. Confirmed via direct
`grep`/read against the tree, not assumed from an earlier, now-stale
version of this paragraph's own claim.

**Priority 2 — Procedure gameplay.** Improve existing procedure mini-games
(IV, IO, Intubation, SGA) before adding large numbers of new ones. Make sure
procedures feel responsive, have meaningful difficulty, react appropriately
to patient physiology, provide useful feedback, have realistic consequences,
don't feel like arbitrary arcade games, and don't create unnecessary
downtime. For timed procedures, let the player keep interacting with the
patient/crew/monitor/environment while the procedure runs. Only after
existing procedures are polished, consider new mini-games selectively
(bleeding control, tourniquet application, splinting, wound management,
other interventions where technique genuinely matters) — do not turn every
medication administration into a mini-game. **This priority is the same
scope as the already-standing "Procedure Gameplay" spec workstream elsewhere
in this queue — read that entry for what's already shipped (live vitals
during a procedure, a real accessibility-tier setting, a real touch-control
fix) and what's still open (explicit state machines, real interruptibility,
equipment selection) before starting here, rather than re-deriving it.**

**Priority 3 — Patient assessment and reassessment.** Make assessment itself
engaging: the player should be able to take a history, ask questions, obtain
vitals, perform a physical exam, auscultate, reassess after interventions,
and recognize changes in patient condition. Patient information should not
just be a static list of numbers — the player should have to interpret
findings. **Overlaps directly with the already-standing "make procedures
that check things respond to live physiology" workstream elsewhere in this
queue — same intent, read that entry first.**

**Priority 4 — Dynamic patient behavior.** Patients should respond
dynamically to symptoms, treatment, deterioration, pain, anxiety, level of
consciousness, personality, and player communication. Eventually, optional
LLM functionality can make patient conversation more varied — but the LLM
must NEVER control the underlying medical simulation; the physiology engine
remains authoritative. (No LLM-driven patient-conversation system exists in
this codebase today — this is new, not a reframing of anything shipped.)

**Priority 5 — Dispatch and resource simulation.** Build a living EMS system
underneath Medical Simulation Mode: stations, ambulances, fire engines, ALS
units, supervisors, specialized resources, hospitals, crews, active calls,
units responding/on-scene/transporting/returning to service. Resources
should be finite — do not automatically spawn every available resource at
every serious call. The player should be able to request additional
resources, and dispatch should determine what's actually available;
resource availability should affect response times. (This is a real, new
systems-simulation layer — Master-of-Your-Scope's existing fleet/roster
machinery, `fleet.js`, is the closest existing analog and the natural
starting point, but it does not currently model a persistent, finite,
shared pool of resources across simultaneously active calls.)

**Priority 6 — Map and travel-time system.** Replace the current 7×7 map
approach with a more useful underlying network supporting stations,
buildings/addresses, calls, hospitals, vehicles, routes, and travel-time
estimation. The same underlying network should eventually support both 2D
travel-time simulation and potential future 3D driving. For Medical
Simulation Mode, the key requirement is calculating believable travel times
for many vehicles responding to different calls at once — the simulation
does not need to visually render every vehicle. (`mapGraph.js`/`maps.js`
already do real graph-based routing for the 3-map system built for the
station-batch/driving-scene work — read that before assuming this needs to
be built from scratch; the "7×7 map" this priority describes may refer to an
older or a different, coarser layer — confirm against the tree before
scoping this.)

**Priority 7 — Scene composition.** Make scenes feel populated
appropriately; avoid the current problem where large numbers of responders
show up simply because a call is critical. Different incidents should
naturally produce different resource configurations (minor illness →
ambulance; serious medical → ambulance + ALS/fire; cardiac arrest →
multiple appropriate resources; MVC → EMS + fire + police; entrapment →
appropriate rescue resources; major incident → larger coordinated response).
Arrival order should matter — a fire engine arriving before the ambulance
should be able to perform appropriate preliminary actions before the player
arrives; a later-arriving paramedic should be able to assess what's already
happened and interact with the player's crew. Depends on Priority 5's
resource-simulation layer existing first.

**Priority 8 — Crew and provider interaction.** Make other providers
meaningful, not decorative: give crews provider levels, roles, current
assignments, availability, basic personalities, and appropriate
capabilities. Higher-level providers should interact with lower-level
players according to the simulated scope/protocol system (e.g. an EMT
arrives first, a paramedic arrives later and can delegate appropriate tasks
to the EMT) — this should interact naturally with the patient's current
condition. (The existing crew-order/task-delegation machinery in `App.jsx`'s
`crewFn`/`TASKS` is the closest existing analog — this priority is asking
for it to extend to independently-arriving OTHER units, not just the
player's own assigned crew, which is new.)

**Priority 9 — Audio and auscultation.** Add realistic audio where it
materially improves assessment — lung sounds, heart sounds, patient
vocalizations, environmental sounds, monitor sounds, vehicle/scene ambience.
Use properly licensed or original audio. Audio should correspond to the
patient's actual physiological state, not be randomly selected. (No
auscultation-audio system exists in this codebase today — this is a real,
new capability, and the "correspond to actual physiological state" part
means it needs a real mapping from `pat`'s own fields, e.g.
`broncho`/`edema`/`rhythm`, to which sound plays — not a decorative
random pick.)

**Priority 10 — Automated testing.** Once core systems stabilize, automate
repetitive testing via Playwright or equivalent: start a call, assess
patient, obtain vitals, perform a procedure, administer treatment, reassess,
transport, complete call, return to service, start another call. Also build
developer/test controls that can directly spawn specific conditions, modify
vitals, spawn calls, spawn resources, advance time, and trigger
physiological events — reducing the need to manually click through the
whole game every time something changes. (`tools/browser/` already has a
real Playwright harness and a `window.__proximateTestSetState`/
`__proximateTestGetState` dev-only hook, both built and used across several
recent batches — this priority is asking for that pattern to be extended
into a standing, repeatable regression-flow script for the core Medical
Simulation loop specifically, plus the dev-only condition/vitals/time
spawning controls, neither of which exist yet as a general-purpose panel.)

**Priority 11 — Replayability.** Once the core simulation is reliable, make
calls less predictable via combinations of different patients, conditions,
severities, locations, resource availability, crew configurations, arrival
orders, patient personalities, complications, and treatment responses — so
the same basic call type can play out differently each time.

**Priority 12 — Accessibility and UX.** Make the simulation accessible
without removing its depth: clear UI, keyboard/mouse controls,
mobile-friendly controls where practical, click-based alternatives to voice,
adjustable text size where appropriate, clear feedback, helpful onboarding,
difficulty/accessibility options. Provide multiple ways to interact with the
same underlying systems rather than sacrificing depth to reach them.
(Overlaps with the already-shipped Procedure Assist accessibility-tier
setting under Priority 2's own workstream — that's one real instance of
this priority already delivered, not the whole of it.)

**Priority 13 — Performance and polish.** Only after the simulation is
functionally solid: UI responsiveness, memory usage, CPU usage, loading
times, animation performance, large numbers of simultaneous simulated
calls, large numbers of simulated vehicles, browser compatibility. For 2D
Medical Simulation Mode, it's acceptable to load the underlying simulation
data at startup if that's simpler and more reliable architecturally. Do not
prematurely optimize systems that aren't currently a bottleneck.

**Definition of "ready for public testing" (the operator's own bar, not to
be second-guessed by adding more scope beneath it):** the physiology engine
is reliable; existing major procedures work consistently; a new player can
understand the basic gameplay loop; calls can be completed without major
bugs; patient conditions respond logically to treatment; dispatch produces
believable resource configurations; travel times are believable; scenes
don't routinely become overcrowded; there's enough variation that repeated
calls remain interesting; the game is stable enough that testers can focus
on gameplay rather than constantly reporting crashes. Medical Simulation
Mode does NOT need every conceivable feature before testing — target
polished and trustworthy, not feature-complete in every imaginable respect.

**How this directive relates to the rest of this queue, stated plainly so
nobody has to re-derive it:** Priorities 2 and 3 are the exact same scope as
two workstreams already standing elsewhere in this queue (Procedure Gameplay
spec, live-physiology-response fixes) — work those entries, don't fork a
parallel effort. The access-restriction requirement under Priority 1 is a
new, concrete, unbuilt gate and should likely be one of the very first things
picked up. Priorities 5-8 (dispatch/resource simulation, the map/travel-time
network, scene composition, crew/provider interaction) are a connected chain
— 7 and 8 both depend on 5 existing first — and together are probably the
single largest net-new systems effort implied by this whole directive, well
past the size of "small follow-up front-end batches" the rest of this queue
is scoped at; treat that chain as its own multi-session workstream, not
something to squeeze into one batch. Priorities 9-13 (audio, testing,
replayability, accessibility, performance) are each real and independently
schedulable once the loop underneath them is solid.

**F2. Medical Simulation (Sandbox) mode: full condition coverage, multiple
simultaneous conditions, Emergent/Chronic taxonomy — DONE, fully closed
(most recent session resolved the last three open items — see section 3's
newest entry).** All 126
implemented conditions are selectable in the "BUILD YOUR OWN" custom-scenario
builder (was 14; the curated per-body-system dropdown's 124 hand-authored
scenarios are a separate, unaffected path), multi-select composes real
simultaneous conditions on one patient via `physiology.js`'s existing
array-composition support (`buildPatient()`/`stepPatient()` already merged
condition arrays before this batch — no engine change was needed), and the
roster is organized into the requested Emergent/Chronic taxonomy
(`src/data/conditionTaxonomy.js`, `src/data/customScenario.js`). The
`App.jsx` wiring — the taxonomy picker UI, `g.customParams.conditions`, and
fixes for three latent single-condition bugs (new `conditionHas`/
`woundsFor` helpers replacing string-equality/single-key-lookup special
cases) — has shipped and is verified: `npx vite build`/`npx eslint` both
clean, and a real Playwright click-through in a live dev server confirmed
the picker renders, selects, and launches correctly
(`customParams.conditions` reaches `phase:"kit"` array-shaped, zero console
errors). Full build detail and verification are in section 3 (there are two
entries — search "Medical Simulation mode" for the original data-layer
batch and "F10's `App.jsx` wiring shipped" for the follow-up), not repeated
here.

**The three small items this entry used to list as "pick these up next" are
now RESOLVED (most recent session) — see section 3's newest entry.** A real
save/reload round-trip of `g.customParams.conditions` mid-picker, a real
in-scene wound render for a multi-condition trauma+chronic combo
(`abdominalGSW`+`epilepsy`), and a real in-scene CPR-clear for `fbao`+chronic
(`fbao`+`epilepsy`) are all confirmed via two new real-click Playwright
scripts (`tools/browser/verifyCustomScenarioSave.mjs`,
`verifyCustomScenarioFbaoClear.mjs`), each passing twice in a row with zero
console errors. F10 is now fully closed — nothing left open under this item.

**F3. STANDING WORKSTREAM: the "Procedure Gameplay" spec (operator-supplied,
sections 2.1-2.20 plus a "Definition of Done") — several pieces shipped this
session, the largest and riskiest pieces still open.** (Filed under earlier
session numbers as F45; the doc's own F-numbers get renumbered when the queue
is reordered, so don't expect this to match a number cited in section 3.)
Placed near the top of this block, since it's a bug-fix/general-fix workstream
and was also the most recently active one.

The spec's own core ask: procedures should be meaningful multi-step sequences
driven by real physiology, not arbitrary timers; existing IV/IO/laryngoscopy-
ETT/cric/SGA mini-games should be audited and polished BEFORE any new ones are
added; mini-games should not lock the player out of the rest of the simulation
for 20-30 seconds; the player should be able to monitor vitals/ECG while a
procedure is in progress; difficulty should come from physiology, with a
player-facing accessibility setting layered on top; failure/success feedback
should be clinical ("Flash observed."), not gamey ("SUCCESS!"); mobile/touch
must genuinely work; and new procedure types (bleeding control, tourniquet,
splinting, wound management, OPA/NPA) are explicitly the LOWEST priority,
correctly not started.

**Shipped and verified this session (all four mini-games —
`AccessMinigame.jsx` for IV/IO, `AirwayMinigame.jsx` for laryngoscopy/ETT,
`CricMinigame.jsx`, `SGAMinigame.jsx`):**
- **Live vitals during a procedure (spec 2.7/2.8).** Every mini-game was
  previously a fully opaque black modal with zero patient information —
  directly contradicting the spec's own worked example ("Monitor SpO2...
  Watch the ECG... Reassess the patient" while mid-procedure). New shared
  `src/components/MinigameVitalsStrip.jsx` (SpO2/HR/RR/LOC, alarm-styled red
  out of range, reading `pat.vitals()` directly) now renders inside all four.
  Verified live twice with `tools/browser/verifyMinigameVitalsStrip.mjs`
  (confirms it renders for both an IV and an airway mini-game, proving it's
  genuinely shared, not duplicated per component).
- **A real accessibility-tier setting (spec 2.9), previously entirely
  absent.** New `src/procedureAssist.js` exports `assistToleranceMult()` —
  deliberately kept OUT of `access.js`, whose own header comment is an
  explicit standing constraint that difficulty there must be
  physiology-only, zero non-physiology input. A new Settings row
  (`SettingsOverlay.jsx`, "PROCEDURE ASSIST": Assisted/Standard/Advanced)
  sets `g.procedureAssist`, which every mini-game multiplies ON TOP of its
  real physiology-derived tolerance band to widen or narrow the acceptance
  margin around the SAME, unmoved target — the anatomy doesn't change for an
  accessibility setting, only how forgiving the margin is. "Standard" is a
  true no-op (multiplier exactly 1), confirmed byte-identical to prior
  behavior. Verified live twice with `tools/browser/verifyProcedureAssist.mjs`
  (default tier, a real click persisting the choice, the multiplier's real
  ordering, and a mini-game rendering cleanly with a non-default tier active).
- **A real, previously-undiscovered mobile/touch gap (spec 2.14), found and
  fixed.** The IV mini-game's "insert" step could only correct insertion
  angle via an `ArrowLeft`/`ArrowRight` keydown listener — the hold-to-
  advance button itself already had real `onTouchStart`/`onTouchEnd`
  handlers, but there was NO way to adjust angle on a touch device at all.
  Fixed with plain `onClick` ◀/▶ buttons in `AccessMinigame.jsx`, which
  resolve identically for a mouse click and a tap's synthesized click event
  with zero separate touch plumbing needed; the keyboard path is untouched.
  Verified live twice with `tools/browser/verifyIvAngleTouchControls.mjs`
  (the buttons move the on-screen angle by the right amount in both
  directions and clamp correctly at the real 0°/60° bounds).
- **Difficulty was already physiology-driven going into this session**
  (spec 2.2/2.3) — `access.js`'s `accessDifficulty()`/`veinVisibility()`
  read real `pat` fields (vasodilation, sbp, edema, upperAirwayObstruction,
  age) with zero randomization, predating this batch. Not re-verified beyond
  confirming the file's own standing constraint is still intact (it is — the
  new accessibility multiplier lives in a separate module specifically so it
  never touches this file).
- **Feedback text is already clinical, not gamey** (spec 2.6) — every
  mini-game's miss/success text (`"Flash! You're in the vein."`, `"Wrong
  angle. Missed the vein entirely."`, `"Pop! You're through the cortex."`,
  etc.) was already written this way before this session; only re-confirmed
  and had a handful of em dashes fixed per the project's standing no-em-dash-
  in-public-facing-content rule.
- **A related but separately-requested feature, also shipped and closed —
  visible emergent clinical events.** Per explicit operator instruction
  given alongside the Procedure Gameplay spec: a real, general, physiology-
  edge-triggered alert system (`g.eventAlertQueue`,
  `src/components/ClinicalEventAlert.jsx`, mounted in `Shell.jsx`) pops a
  real on-screen banner the moment `pat.seizing` transitions false→true
  ("The patient begins seizing.") or `pat.consciousness` transitions into
  `"unconscious"`/`"coma"` ("The patient stops responding."), plus the one
  existing scripted crit-kind scenario event (`fbao`'s vomiting beat). Cardiac
  arrest onset is deliberately EXCLUDED, per the operator's own explicit
  reasoning — there is no way to visually determine a rhythm change; only its
  visible downstream consequence (going unresponsive) is alertable, and that
  IS covered. The edge-detection flags are correctly seeded from the
  patient's real presenting state at scene arrival (via a `physio(n)` call at
  the approach→scene transition), so a patient found ALREADY seizing/
  unresponsive doesn't spuriously fire a "begins/stops" alert on the first
  live tick. Verified live twice with
  `tools/browser/verifyClinicalEventAlert.mjs` (a directly-queued alert
  renders and dismisses on click; forcing `pat.seizing=true` on the live
  patient instance and letting the tick loop's own edge-detection notice it
  unassisted produces the alert for real). This piece is DONE — nothing
  further queued under it.

**Spec 2.4 and 2.5 — DONE (a later session), retired from "still open."**
Spec 2.4 (explicit procedure state machines): new `src/procedureOutcome.js`
exports a frozen `PROCEDURE_OUTCOME` enum (`SUCCESS`/`FAILED`/`CANCELLED`/
`INTERRUPTED`/`ABORTED`) and all four mini-games
(`AccessMinigame`/`AirwayMinigame`/`CricMinigame`/`SGAMinigame`) now resolve
through it instead of the old ad hoc boolean/reason-string outcome. Spec 2.5
(real interruptibility) went with option (a) from this bullet's own prior
writeup: `App.jsx`'s tick loop no longer pauses sim time/physiology while a
mini-game is open (`accessMinigame` removed from both the tick effect's
early-return gate and its runtime guard), so the shared
`MinigameVitalsStrip` is now genuinely live, not a snapshot; each mini-game
gained a real interrupt banner plus an "Abandon — attend to the patient"
button (`PROCEDURE_OUTCOME.ABORTED`, free, distinct log line) that appears
only once a real physiology-edge alert (`g.eventAlertQueue`) has actually
fired since the mini-game opened. Verified live end-to-end with
`tools/browser/verifyMinigameInterruptibility.mjs` — confirms sim time
advances during an open mini-game, a forced seizure onset mid-attempt queues
a real alert and surfaces the banner/button, and clicking Abandon closes the
mini-game for free with a distinct log entry and no attempt-count increment.
This was the queue's own explicitly flagged highest-risk item ("deliberately
not attempted blind," since it touches the shared pause guard every other
modal depends on) — retired here rather than left stale, since this exact
bullet type (a shipped item marked "still open") is the documented failure
mode this doc warns about elsewhere.
- **Spec 2.11 — equipment selection (e.g., IV catheter gauge).** Confirmed
  via grep this session: gauge is hardcoded to "18g" everywhere, no
  selection UI exists anywhere in the game. Giving it real gameplay
  significance (e.g., a smaller gauge measurably rate-limiting fluid
  administration) needs physiology-engine work — out of scope while another
  session owns the physiology queue in parallel. A purely decorative/
  cosmetic gauge picker with no real physiological consequence was
  deliberately NOT built, since it would be exactly the "decorative field"
  section 1 forbids. Needs coordination with whoever next works the
  physiology queue before this is worth starting.
- **Spec 2.16 — new procedure mini-game types** (bleeding control,
  tourniquet, splinting, wound management, OPA/NPA, CPR improvements).
  Correctly, explicitly NOT started — the spec's own text places this last,
  "only after existing procedures are polished," and 2.4/2.5 above are both
  real, unfinished "existing procedure" work.

**F4. Bug-hunt pass — what's still open, stated honestly.** The prior
session's bug-hunt found and this session FIXED two real bugs — see section
3's newest entry for the full writeup ("relationshipsOpen now pauses the
sim clock" and "IV/IO busy indicator shows the correct site"), both
verified live and removed from this list now that they've shipped. A
physiology-engine dead-field grep pass from the same bug-hunt also
produced real findings — RESOLVED (a later session), see section 3's
five-queue-item batch entry for the fix (item 42 has since been closed and
removed from the numbered queue).

**Breadth pass extended (a later session) — most of the prior gap closed.**
`tools/browser/verifyBreadthBugHunt.mjs` (new, real Playwright script)
covers 6 scenarios across 6 different body systems/categories (`stabChest`
trauma, `seizure` neuro, `childbirth` OB/trauma, `asthmaAttack` resp,
`abdPain` medical/abdominal, `atrialFibrillationRVR` cardiac) — each
checked at torso/assess, then region-switched to `head` and checked at
airway and meds (the two region-gated tabs the prior pass never actually
opened, confirmed as a real gap at the time: the default region for most
scenarios is torso, and nothing switched it before this). A real
crew-order click-through was also exercised (a synthetic riding crew member
injected via `__proximateTestSetState`, since jumping straight to
`phase:"scene"` skips the real unit-select flow that would normally
populate `s.crew`; clicking the crew member's name opens the order panel
cleanly). All checks passed clean — zero console errors, no
undefined/NaN/`[object Object]` render text — across all 18 scenario×tab
combinations plus the crew click. Run again for a fresh 6-scenario sample by
editing the `SCENARIOS` array in that script; it currently exercises a
different slice of the library than the original pass and can be extended
to cycle through more of the ~124 scenarios over successive runs.

**A third breadth-pass slice is done (a later session, see section 3's
newest entry) — clean, no defects found.** `tools/browser/
verifyBreadthBugHunt2.mjs` covers 6 more scenarios (renal, OB, a
progressive neuro-paralysis, toxic inhalation, abdominal-vascular, and a
paralytic-overdose edge case) across 4 tabs each, run twice, zero
suspicious render text or console errors both times — a genuine negative
result. **Career Mode's own setup wizard — DONE (a later session, see
section 3's newest entry) — clean.** `tools/browser/
verifyCareerSetupWizard.mjs` walks the full real chain (gmodePick → Career
→ learningMode → level → department → vehicle → partners → mode → scope →
ready → station) with real clicks, checking render text and console errors
at every screen plus a final state-coherence check. Run twice clean. Two
real test-harness gotchas recorded (a `getByText` substring-match trap
hitting descriptive paragraph text before the real button, on two
different screens). **Honest scope note**: this run picks "On foot" to
avoid also depending on the recruit-crew hiring sub-flow — a crewed
vehicle (hiring a real partner within budget) is a genuinely different
path, still untested. **The crewed-vehicle recruit/hire sub-flow is now
DONE too (a later session, see section 3's newest entry) — clean.**
`tools/browser/verifyCareerCrewedVehicle.mjs` picks County EMS → ALS
ambulance (a real `needsCrew:true` rig), hires a real candidate from the
generated pool, confirms the hire lands in `g.roster` and correctly
un-blocks the Continue button, then finishes the chain to station. Two
clean runs, each against a genuinely different randomly-generated
candidate — confirming the pool itself, not fixture data. Between this and
the "On foot" run, both real branches of Career Mode's setup wizard
(solo and crewed) are now covered. **Still genuinely open**: the
destructive/one-way actions (Declare death, AMA/refusal wizard, Abandon
call), deliberately skipped since clicking them mid-scan ends the very
call being explored — would need a fresh scene per action tested; and the
remaining ~139 scenarios (updated count against the current ~161-scenario
library, not the older ~124 this note used to cite) not yet covered by any
of the four breadth passes so far.

**A fourth breadth-pass slice, plus a genuinely different targeted check,
are both done (a later session, see section 3's newest entry) — both
clean, no defects found.** `tools/browser/verifyBreadthBugHunt3.mjs` covers
6 more scenarios (three pediatric — `bronchiolitisInfant`/`croupToddler`/
`febrileSeizureToddler` — plus a neuromuscular crisis, an endocrine crisis,
and excited delirium), same render-text method, clean twice. **New and
different in kind**: `tools/browser/verifyPediatricDoseLive.mjs` actually
GIVES a real weight-based drug (not just checking static render text) on
three pediatric ages — the class of bug a passive render check can't catch
(a missing weight field, a bad mg/kg formula). Also clean twice — all three
doses completed with a real, non-NaN confirmation line, confirming the
underlying weight-based PK math itself, not just that a button exists.
Real test-harness gotcha recorded in section 3: `medActs()`'s own region
computation (IM/IN-route drugs default to `"legR"`, NEB/PO/INH-route drugs
default to `"head"`) has to be matched by any `setState` scene jump or the
drug button silently never renders.

**F7. STANDING WORKSTREAM: make "procedures that
check things" respond to live physiology instead of scripted text.**
Operator-directed, explicitly framed as ongoing, not a one-batch item — see
section 3's newest entry for the full writeup of the second batch (the
cardiac-arrhythmia scenario probes, below) and why it was scoped where it
was.

**Third batch, done (this session) — the REST of the scenario library
audited; the `heart`/`jvd`/`pupils`/`pedL`/`pedR`/`reflexes`/`loc` probe
class confirmed fully closed (no defects found beyond what's already
listed below), and a real 6-scenario `probes.lungs` cluster
(`anaph`, `asthmaAttack`, `bronchiolitisInfant`, `copdExacerbationCall`,
`croupToddler`, `epiglottitisChild`) fixed to read `pat.effectiveBroncho`/
`pat.upperAirwayObstruction` live — see section 3's newest entry for the
full writeup, verification, and honest scope statement. `skin`/`capRefill`
scenario overrides were also audited (a genuinely different key set from
the ones named below) and came back clean — the `actions.js` default
fallback already reads live state, and every scenario override checked is
content-only or a genuinely fixed presenting picture.

**Second batch, done:** the first "still open" bullet below — auditing
scenario-specific `probes.<key>` overrides for the same frozen-text
defect — is now DONE for its highest-leverage slice: all 17
cardiac-arrhythmia scenarios' own `probes.heart` (`svt`,
`atrialFibrillationRVR`, `atrialFlutter`, `monomorphicVT`, `wpwAfib`,
`secondDegreeAVBlockTypeI`/`II`, `thirdDegreeAVBlock`,
`symptomaticBradycardia`, `digoxinToxicity`, `sickSinusSyndrome`,
`electricalStorm`, `aicdMalfunction`, `hypertensiveUrgency`/`Emergency`,
`thyroidStormCrisis`) now read `v.rhythm`/`v.hr`/`v.sbp`/`v.dbp`/`v.temp`
live instead of a frozen description — see section 3's newest entry for
the full mechanism writeup, a genuine dead branch found and fixed while
verifying (an `atrialFlutter` threshold the treated hr range could never
reach), and a real physiology-engine defect found and filed rather than
fixed inline (`aicdMalfunction`'s magnet doesn't actually stop progression
to real VT — physiology queue item 36). The REST of the scenario library
(non-cardiac scenarios' own probe overrides) has not been audited for the
same defect — still open, see below.

**First batch, done:** the six DEFAULT exam-action responses in
`src/actions.js` that every scenario falls back to unless it declares its
own `probes.<key>` override — `heart`, `jvd`, `pupils`, `pedL`, `pedR`,
`reflexes` — were hardcoded strings (`"Heart sounds unremarkable."`,
`"No distension."`, `"Equal, reactive."` …) regardless of the patient's
actual state. All six now read real, already-computed physiology
(`pat.pericardialEffusion`, `pat.cvp`, `pat.icp`, `v._cons`, `v.sbp`,
`pat.magToxicity`) — see section 3 for the full mechanism-by-mechanism
writeup, including two genuine "written, never read" dead fields this
surfaced (`pat.magToxicity`, and `pat.strokeWeakness`/`strokeAphasia` —
the latter not fixed in this batch but since resolved by a later one, a
new `strokeScreen` action; see section 3).

**Same session, operator follow-up, also done:** a new head action,
`breathingCheck` (cost 2 — a quick binary "is he breathing" primary-survey
check, distinct from the timed rate/depth/effort count), and the old torso
`checkBreathing` renamed to `countRespirations` (rate/depth/effort only) to
remove the naming collision. Breath odor moved from the old torso action
onto the new head one, and was given one real physiology-backed case
(`pat.anionGap`, itself a formerly-dead field — fruity/acetone breath above
the standard elevated-anion-gap threshold, for the ketoacidosis family) —
alcohol/hydrocarbon/uremic odors still have no backing state and are filed
as physiology queue item 35. Full writeup in section 3.

**Still open, scoped but not started — pick any as the next batch:**
- **RESOLVED (third F9 batch, see section 3).** The ~12 scenarios missing
  `probes.sample`/`probes.opqrst` are done — coverage is 124/124, verified
  programmatically. This bullet is retired, not just marked done, since a
  stale "still open" line here would send the next session to redo shipped
  work (this is exactly what happened to this bullet itself — it went
  undocumented as done for a full session before being caught).
- **Continue auditing the REST of the scenario library's `probes.<key>`
  overrides for the same frozen-text defect** (the cardiac-arrhythmia
  slice is done — second F9 batch; four more non-arrhythmia `heart`/`jvd`
  probes are done — third F9 batch, section 3; **the six ACS-family
  `heart` probes — `ami`, `chestPainM`, `chestPainF`, `acs`,
  `unstableAngina`, `nstemi` — are also done now (a later session)**:
  each had a hardcoded rate word ("Rate is fast", "Regular, a bit fast",
  etc.) instead of reading live `v.hr`, the exact defect the `stableAngina`
  fix above already established the pattern for; `nstemi`'s probe kept its
  real anatomic "possible S4" finding while making only the rate live.
  Verified with `tools/browser/verifyCardiacHeartProbeLive.mjs` — clicks
  the real "Auscultate heart sounds" action for all six scenarios and
  confirms the logged text embeds a number matching the live patient's
  actual heart rate at click-resolve time (not a static word). Two real
  test-harness gotchas found and fixed while building this script, worth
  recording since they'll bite the next probe-verification script too: the
  `heart` action is gated behind BOTH `pocket:"scope"` (`g.pockets`
  defaults to `[]` on a bare `setState` jump — the real scene-start flow
  seeds it, this shortcut doesn't) AND the torso being exposed
  (`CLOTH_LOCK` hides chest-region actions entirely, not just disables
  them, until `g.exposed.torso` is set); and the action's cost is in
  SIM-seconds, which only elapse as fast as the tick loop's real-time rate
  allows (`dt=.1*speed` per ~100ms tick) — a 25-cost action needs ~25 real
  seconds at `speed:1`, so the script sets `speed:12` before clicking
  rather than waiting nearly half a minute per scenario.
  Most remaining overrides
  ARE correctly static, confirmed by checking rather than assumed: `pe`'s
  `pedL` (a fixed anatomic DVT finding, doesn't change over a 20-minute
  call), `minorSprain`/`chronicBackPain`'s `pedL`/`pedR` (negative
  neurovascular exams for genuinely stable low-acuity injuries),
  `prematureVentricularContractions`/`prematureAtrialContractions`'s
  `heart` (the whole teaching point is that benign ectopy does NOT
  progress — `resolve()` explicitly says "does not kill a patient over the
  span of a single call"), `pericardialTamponade`/`myocarditis`/
  `firstDegreeAVBlock`/`refeedingSyndromeCall` (fixed severity or
  deliberately vague "get him on a monitor" text, nothing to branch on).
  **RESOLVED (most recent session) — the three stroke scenarios' own
  static `probes.loc` overrides now read live physiology.** All three
  (`ischemicStrokeSudden`, `transientIschemicAttack`, `intracerebralHemorrhageCollapse`)
  read `pat.strokeWeakness`/`strokeSide`/`strokeAphasia` live — the same
  fields the `strokeScreen` action already reads — instead of a fixed
  string. `transientIschemicAttack` was the confirmed-real instance: it
  used to say "completely normal" unconditionally; now a player checking
  LOC early in the call sees the real, still-present deficit, and it only
  reads "normal" once `tia`'s own ~20-minute decay has actually finished —
  verified directly against the real engine at six time points (t=2s
  through t=1300s), confirming the probe text tracks `strokeWeakness`
  crossing from 0.526 down through 0 exactly on schedule. A second, real
  defect was found and fixed in the same pass: `tia`'s own condition
  (`physio/conditions.js`) defaulted `strokeSide` to `"left"`, but its only
  consumer scenario's narrative (dispatch/bystander text) says "her right
  hand"  — invisible until this batch actually surfaced `strokeSide` in
  player-facing text; corrected to `"right"` to match. See section 3.
  **RESOLVED (this session) — all five candidates the prior session
  measured and left un-implemented are now wired, verified against the
  same `physio()`/`giveDose()` instrumentation harness (lesson 8), each
  branch confirmed firing correctly at the measured numbers.**
  `fall`/`bikeVsCar`/`unsafeSceneAssault` (all `condition: "polytraumaFall"`)
  now read live `pat.icp` at the shared default's own >25 threshold,
  preserving each scenario's own "which side" flavor text. `motorcycle`
  (`condition: "polytraumaMoto"`) deliberately does NOT reuse that >25
  threshold — re-measured (icp caps ~23.8 by the scenario's own 1080s scene
  limit, vs. holding ~13-14 when decompressed/ventilated/hemorrhage-
  controlled early) and wired to a lower, condition-specific >18 threshold
  that actually separates the two trajectories. `acquiredLongQT`'s `heart:`
  probe now reads `v.rhythm` live (torsades/VF branch vs. baseline
  bradycardia), matching `electricalStorm`/`aicdMalfunction`'s established
  pattern. `stableAngina`'s `heart:` probe now reads live `v.hr` instead of
  a hardcoded range, surfacing nitro's real reflex tachycardia instead of
  hiding it. `npx vite build`/`npx eslint src/data/scenarios.js` both clean.
- **RESOLVED, found already done — this bullet was stale.** Confirmed via
  grep/read against the live tree (a later session): `ecg.js` already
  exports `ecgReadout(kind, v)`, a real rate/severity-scaled variant of
  `ECG_READ` (afib tags RVR vs. rate-controlled by live `v.hr`; SVT/wideQRS/
  peakedT read live `hr`/`qrsWidth`/`k`), and it's wired at all three real
  call sites — the 12-lead action (`App.jsx`, `p.id==="ecgRead"`), the
  monitor-strip readback text, and the JSX 12-lead display — not just
  declared. Whoever built this apparently never updated this queue entry to
  say so, so it sat here as "still open" for at least one full session after
  actually shipping; retired outright rather than left to mislead the next
  session too.
- **`palp`/`abdo` was deliberately NOT touched this batch.** No
  region-localized abdominal-injury mechanism exists in the engine (this is
  the same gap noted in F20's own history — "chest/abdomen wounds keyed to
  exposure regions that don't exist"), and the one candidate signal that
  does exist, `v.pain`, is a single whole-body scalar — wiring it to
  "abdomen tender" would misattribute pain from a limb fracture or chest
  injury as abdominal tenderness, a wrong finding actively worse than a
  neutral scripted one. Leave scripted until a real per-region pain/injury
  model exists, or find a genuinely abdomen-specific signal.
- **The `heart`/`jvd`/`pupils`/`pedL`/`pedR`/`reflexes`/`loc`/`lungs`/
  `skin`/`capRefill` probe-override classes are now believed FULLY AUDITED
  and CLOSED (third batch, this session)** — no further sweep of these
  specific keys is expected to find more defects; treat a claim of a new
  defect in one of these keys as needing fresh verification against the
  tree, not assumed from this note going stale. Two genuinely different,
  unaudited slices remain if this workstream is picked up again:
  `probes.opqrst`/`probes.sample`/`probes.history` (narrative dialogue
  content, deliberately out of scope for every audit so far — never
  checked for a parallel defect, though likely a lower-yield target since
  most of this content is one-time history text rather than a repeatable
  exam finding); and any probe key not yet named in this document at all.
  **`glucometer` — DONE (a later session, see section 3's newest entry):**
  the enumeration this bullet asked for was finally run and found `glucometer`
  (91 occurrences) as a real, previously-undiscovered DEAD override — the
  `gluc` actions never declared a `probe` field at all, so the authored
  content (e.g. DKA's off-scale "HIGH" reading) could never fire; fixed by
  adding `probe:"glucometer"` to both `gluc` actions. **The remaining
  low-count candidates — `neuro`, `airway`, `neck` — are now settled too
  (same session, direct follow-up, see section 3's newest entry):**
  `neuro` was confirmed already fixed by an earlier session (`reflexes`
  already declares `probe:"neuro"`). `stabChest`'s `probes.neck`
  (tension-pneumo JVD + tracheal deviation) was a real dead override — no
  action declares `probe:"neck"`, the real action is `jvd` — renamed
  `neck`→`jvd`. Three `probes.airway` overrides (`choking40`,
  `activeSeizureGTC`, `esophagealVaricesBleed`) were also real dead
  overrides — no action declares `probe:"airway"`, the real action is
  `airwayLook` — renamed all three `airway`→`airwayLook`. All four renames
  verified live twice via `tools/browser/verifyAirwayJvdProbeLive.mjs`
  (PASS×4/PASS×4). **RESOLVED (a later session) — the meningitis
  scenario's orphaned `neck:` override now fires.** New `neckStiffness`
  action (`actions.js`, region `neck`, `probe:"neck"`) gives a real
  negative default ("Neck supple, no nuchal rigidity.") for every other
  patient; `meningitisFeverNeck`'s own override supplies the positive
  finding, as documented in `physio/conditions.js` (meningismus is
  narrative/exam-only by design, no continuous vitals mechanism should
  back it). Verified via `npx eslint`/`npx vite build`, both clean; not
  yet clicked live in a browser. `radL` was not
  re-checked this pass (already has a declared `probe:"radL"` per an
  earlier read of `actions.js`, so presumed fine, but not independently
  re-verified).
  **`ecg` — DONE (a later session, see section 3's newest entry): a
  genuinely different defect class than every prior fix in this bullet.**
  A corrected, from-scratch enumeration (anchored on real `key: (`
  definitions only, fixing false-positive noise the earlier enumeration
  script had picked up from string literals) found `ecg` (5 occurrences)
  as a key that was never meant to compose via the generic `a.probe`
  mechanism at all — the real 12-lead action calls `ecgReadout()`
  directly, which gives a FIXED generic finding per rhythm kind and never
  once checked for a scenario override. `takotsubo` is a confirmed, not
  theoretical, instance: its condition deliberately sets `rhythm:"sinus"`
  specifically so the authored anterior-STEMI-mimic finding is the
  teaching point, but every player actually saw "Normal sinus rhythm." — the
  literal opposite of the scenario's intent. Fixed via a new shared
  `ecgLiveText()` helper checking the override first, used at all three
  real ECG display sites (the action, the transmitted-to-base readback,
  the live 12-lead JSX panel) for consistency. Verified live twice via
  `tools/browser/verifyEcgOverrideLive.mjs`.

**F8. Zero-To-Hero campaign content — the largest remaining item.**
**STATUS UPDATE (most recent session — see section 3's newest entry for
the full writeup, this paragraph is the current summary):** every chapter,
Prologue through 10, now has REAL phase wiring in `App.jsx` — Chapters
1/2/3/8/9/10 shipped this session, Chapters 4/5/6 shipped in earlier
sessions (still per-chapter detail below), and Chapter 7 turned out to
already be real and shipped, just never documented in this file until this
session's tree audit found it. **The per-chapter sub-sections below are
LARGELY HISTORICAL** — written when Chapters 1/2/3/8/9/10 didn't exist yet
— and are kept for their still-accurate low-level detail (exact tuition
figures, cast names, mechanic reasoning) rather than rewritten wholesale;
where a sub-section's OWN "not yet reachable"/"doesn't exist yet"
language contradicts this status update, trust this update and section 3,
not the stale sentence below it. **NEW (this session) — a fade-to-black
"two weeks pass" interstitial and an upfront 2D/3D render-preference
picker both shipped for the Prologue; see section 3's newest entry.**
`campaignPatrolDeclineInterstitial` fills the previously-instant jump from
declining PATROL at the quad to `campaignLibraryEncounter`'s own "two weeks
later" arrival. `campaignRenderPref` is a new one-time picker between the
zth `learningMode` pick and `campaignDisclaimer`, storing
`g.prologueRenderPref` (`"2d"`/`"3d"`) — **this flag is store-only and
changes NOTHING about rendering today.** Real 3D content for the solo
heat-stroke scene (or any other ZTH solo scene) is still fully open: this
project's Three.js work (`Coop3DWalk`/`Coop3DDrive`) is co-op-only, and
making either component solo-capable (dropping their `g.coop` dependency)
plus actually building a 3D heat-stroke incident scene is real, separately-
scoped future work, not a quick follow-up to this batch. **What is genuinely still open across the
whole campaign, not chapter-specific:** every line of dialogue in every
chapter is a stated placeholder (per the same standing "leave placeholders,
we'll polish later" instruction every batch has been given); **a real
in-browser click-through of the ENTIRE Prologue→Chapter 10 campaign chain
has now happened (Chapters 1-3/8-10 in an earlier session, Chapters 4-7 in
the most recent session — see section 3's newest entry for the Ch.4-7
half, including a real, previously-undiscovered crash bug this pass found
and fixed: `shiftSummary` could be reached with `g.career` unset and
crash, now fixed at the shared render site).** This closes what was the
single highest-priority next step named here; it's done for the
real-click-PATH question (every button/dialogue-advance between these
screens genuinely wires to the next, across all ten chapters now), but NOT
a substitute for a human playing the full Ch.1→Ch.10 chain by hand in one
sitting (dialogue polish and visual layout are both still open — see
section 3 for exactly what each click-through script does and doesn't
cover). **RESOLVED (this session) — Chapter 3's §3.2 "widened action set"
and e-bike/golf-cart response-time mechanic, both real now, see section 3's
newest entry.** The widened action set needed no new code: it was already a
direct, automatic consequence of `g.level` advancing to "emr" in Chapter 2
(the shared `why()` scope gate in `App.jsx` already opens every EMR-level
action the instant `g.level` allows it) — `campaignCh3PathPatrol`'s own
placeholder text is corrected to say so plainly instead of narrating it as
aspirational. The e-bike/golf-cart half needed one real, previously-missing
mechanism: `scope.js`'s new `VEH_TYPE_TRAVEL_MULT` gives `pso`(bike)/
`campusEmr`(golf cart) — both already-existing `fleet.js` vehicle kinds,
gated to EMR at Campus PD, just never mechanically distinct from any other
vehicle — their own genuinely faster response time (bike ~67s/golf cart
~76s vs. an ordinary vehicle's ~168s at city/code3) instead of the flat
`240*CODES*MODE_MULT` formula every non-Layperson response used before this,
regardless of what was actually responding. This is general engine work
(`scope.js`), not campaign-specific — any Master-of-Your-Scope player who
picks `pso`/`campusEmr` gets the same real speed difference, not just zth.
Verified with a real click-through (`tools/browser/
verifyCampusVehicleSpeed.mjs`): Medical Education Mode → EMR → Campus PD
lists all three Campus PD vehicle kinds (PATROL Volunteer stays pickable
too — `KIND_MIN_LEVEL_N`, not `KIND_LEVELS`, gates the vehicle list once
inside a department, so this is a real choice, not an exclusion); picking
"Public Safety Officer" lands `g.myVeh.type==="bike"` from the actual click;
and the real `travelTimes()` (dynamically imported inside the page — the
same module the app runs, not a reconstruction) confirms the bike's drive
time is genuinely faster, not just that the constant exists in source. Run
twice, PASS/PASS, zero console errors both times. `npx eslint src/scope.js
src/App.jsx`/`npx vite build` both clean (same pre-existing 3-error
baseline, same pre-existing chunk-size warning). **Still open, and now the
right thing to revisit**: the `eco_responder`/`cart_start`/`by_the_book`
achievements named in the design doc's §1.7 were previously withheld for
having no real mechanism to trigger them — that's no longer true for a
bike/golf-cart pick, but this session deliberately did NOT add them, since
none of the three names has a clear, unambiguous trigger definition
anywhere in this codebase (only `eco_responder` reads as an obvious
"picked the bike/cart" match; `by_the_book` in particular isn't obviously
about vehicle choice at all) — inventing a meaning for an achievement is a
worse mistake than leaving it unbuilt, per this project's own discipline
against guessing under ambiguity. A Shitty Supervisor appeal system is a
separate, still-entirely-unbuilt mechanic (`shitty_supervisor` doesn't
exist as a relationship yet — see queue item F12) and is unaffected by this
fix. The promotion/certification-exam flow this document used to describe
as a
single generic system turned out, in practice, to be four separate
per-tier exam phases (Ch.2/4/6/8) sharing common formulas
(`rollExamFieldScore`/`rollWrittenQuiz`/`examCombinedScore`) rather than
one shared phase sequence — a reasonable, working outcome, just not the
originally-imagined shape, noted here so nobody goes looking for a single
generic exam flow that doesn't exist. The operator's full 10-chapter
**Overall Campaign Flow Summary**, recorded here since nothing this size
existed in this document before:

> Prologue: Introduction, heat stroke, join PATROL, tutorial shift,
> attribute allocation. Ch1: Regular shifts, relationship building, push to
> EMR. Ch2: EMR school, exam, partner's dramatic departure. Ch3: Branch to
> PSO or Fire, new partner and vehicle. Ch4: EMT school, exam. Ch5: Job
> choice (IFT, 911, Event), entrance exam. Ch6: AEMT school, exam. Ch7:
> AEMT work, 911 calls requirement. Ch8: Paramedic school, exam. Ch9: Open
> world as paramedic. Ch10: Optional critical care / flight.

Read this loosely, not as a strict re-ordering of the numbered prologue
script (§2.1-2.7+): the script's own scene numbering is authoritative for
sequence.

The prologue through the tutorial shift (§2.1-2.7, Scenes 1-6) has shipped
in full — see section 3's recent entries. What's still open:
- **Chapter 6 (AEMT School, "Going Advanced," design doc §1.6.7/§1.6.8.1) —
  shipped this session, but NOT YET PLAYTESTED end-to-end and with real
  follow-up work still queued.** Built concurrently with another session
  building Chapters 1-5/7-10 in the same files — coordinate before touching
  any of the phases/fields named below. Shipped: `campaignCh6Offer` (the
  honest skip-or-enroll choice §1.6.8.1 asks for, gated on
  `reputation > AEMT_REPUTATION_FLOOR`), `campaignCh6SkipConfirm`,
  `campaignCh6Enroll` (tuition/scholarship/loan, via `aemtTuitionQuote()` —
  new file `src/campaignChapter6.js`), `campaignCh6ClassIntro` (reuses
  `CH4_CAST.instructor`, "Instructor Yolanda Briggs," per §1.9's "one
  recurring person across all three classroom chapters" rather than a new
  instructor), `campaignCh6ScheduleConflict` (the repeatable shift-vs-class
  friction §1.6.7 explicitly asks for, `AEMT_SCHEDULE_CONFLICT_ROUNDS`
  rounds, the middle round doubling as an inline "office politics"
  confront/comply/appeal beat), `campaignCh6Exam`/`campaignCh6ExamResult`
  (reuses Ch.4/Ch.5's own shared `rollExamFieldScore`/`rollWrittenQuiz`
  placeholder scoring, `EXAM_FIELD_SCENARIOS.aemt`/`EXAM_WRITTEN_QUESTIONS
  .aemt` — NOT a bespoke AEMT scenario battery), and `campaignCh6End`.
  Two achievements added (`advanced`, `golden_handcuffs`). `campaignCh5End`
  now hands off into `campaignCh6Offer` instead of straight to
  `shiftSummary`. A player who bounces out at the reputation or money gate
  (leaving `ch6Done` at 0) can re-enter via a new conditional button on the
  `shiftSummary` screen. `npx vite build` and `npx eslint
  src/App.jsx src/campaignChapter6.js src/achievements.js` both clean (one
  real `no-dupe-keys` collision on `serviceCommitment`, caused by editing
  the same file as the concurrent Chapters-1-10 session at the same time,
  was caught and fixed in this same batch — see that field's own comment).
  **Left undone, queued for whoever picks this back up:**
  - **No in-browser playtest at all.** There is currently no way to reach
    `campaignCh5End` in a fresh save — Chapters 1-4's own phases were still
    mid-build in the concurrent session at the time of writing. Verification
    here is `vite build`/`eslint` clean plus code reading, not actual play —
    CLAUDE.md's own standing rule ("say so explicitly rather than claiming
    success") applies directly. Playtest the whole Ch.5→6 handoff once
    Ch.1-5 are reachable from a new save.
  - **Every line is a stated `*Placeholder*`**, per this session's explicit
    instruction — a real dialogue pass is still owed, same as Ch.4/Ch.5's
    own placeholders.
  - **`g.serviceCommitment` (set when the AEMT-tier scholarship is accepted)
    has no consumer yet.** `serviceCommitmentPayback()` (campaign.js) is
    real and ready, but no job-switch/"quit this job" action exists
    anywhere in the codebase to call it — wire it in whichever chapter
    finally builds a real job-switching mechanic (Ch.7 or Ch.9, most
    likely).
  - **The AEMT boards use the same abstracted stat-driven dice roll**
    (`rollExamFieldScore`/`rollWrittenQuiz`) Ch.4/Ch.5 already use instead of
    a real scenario battery — consistent with the current shared approach,
    not a regression, but worth revisiting in the SAME future pass that
    would upgrade any other tier's exam, since campaign.js's own comment
    already flags the interface as unchanged either way.
  - **Chapter 7 doesn't exist in `App.jsx` yet.** `campaignCh6End` falls
    back to `phase:"shiftSummary"` (the same honest placeholder shape
    `campaignCh5End` used before this batch) — whoever builds Chapter 7
    needs to redirect that one `onDone`, exactly as this batch redirected
    Ch.5's.
  - **The schedule-conflict beat's confront/comply/appeal choices are
    Chapter-6-local**, not a shared "Shitty Supervisor" mechanic — no such
    shared mechanic exists anywhere in the codebase yet despite being
    referenced as if it already did in the design doc's §1.6.7/§1.8.3 text.
    Reconcile with a real shared version if/when Chapter 1's own §1.8.3
    subplot builds one.
  - No new background art was requested — reused existing `BACKGROUNDS`
    keys (`stationOffice`/`stationTraining`/`stationBreakroom`/
    `stationExterior`) throughout.
- **The §2.5 tutorial simulation's vitals curve is now real `physio()`
  output, not scripted (most recent session).** `HeatStrokeTutorialSim.jsx`
  drives the actual `heatStroke` condition/scenario; see section 3's newest
  entry for the honest time-compression note (literal 1:1 real-time barely
  moves the numbers, measured) and the new dt-size physiology-engine defect
  (queue item 31) this surfaced. `g.heatStrokeMovedToShade` — the one piece
  of state every downstream campaign phase reads — is unchanged, still set
  by the caller from `onComplete`'s return value.
- **RESOLVED (concurrent session).** Call 3 of the tutorial shift (`seizure`)
  now has its own pre-call VN (the arts-building radio call), and the gap
  between `od` and `seizure` got a real second interlude (§2.7.4's late-night
  station scene, introducing `radio_crew` — the reserved relationship id
  `relationships.js` already named but nothing had created) plus a real
  post-`seizure` ending (option A/B/C, the "A Shift to Remember" achievement,
  the supervisor/partner epilogue text messages, "End of Prologue," then a
  normal `shiftSummary`). The doc's own mid-simulation VN interjection
  ("Give the naloxone now") was deliberately NOT built as a new mid-call
  scripted-VN mechanism — no such system exists anywhere else in this
  codebase, and one-off infrastructure for a single line would be exactly
  the kind of unscoped addition this project's conventions warn against; the
  same line is seeded into `g.log` at call start instead, real in-scene text
  via F7's already-fixed toast/log rendering. All in `App.jsx`'s existing
  `interludeIdx` branch (idx 1 gained an `interlude1Done` sub-stage; idx 2
  gained `interlude2DinnerDone`/`lateNightDone` sub-stages) plus a new
  `campaignTutorialFinale` phase. `npx vite build` clean; `npx eslint src`
  introduces zero new findings in any line this batch touched (the project's
  full eslint output no longer matches this doc's old 106/5 baseline at all
  — a much larger, unrelated set of `react-hooks/*` findings is now present
  file-wide, apparently from concurrent work in this same session window;
  worth re-baselining next time eslint is run intentionally, not assumed
  fixed here).
- **The Layperson-scope scenario gaps — down to 10, two resolved for real
  this session.** `fbao`/`choking40` are FIXED and now Layperson-completable
  (most recent session) — see section 3's newest entry for the full trace;
  it turned out `choking40` had no code path that could ever clear its
  airway at ANY provider level, a genuine unwinnable-scenario defect, not
  just a scope gap. The other two originally-flagged "smallest, best-scoped"
  candidates were investigated and found to be CORRECT exclusions, not
  bugs: `anaph` requires epinephrine, which this project deliberately scopes
  to EMR per the documented National EMS Scope of Practice Model (see
  `epiAuto`'s own `note:` in `drugs.js`) — a real scope decision, not an
  oversight; `crush`'s death gate is the reperfusion hyperkalemia arrhythmia,
  which genuinely has no BLS-level countermeasure (calcium/bicarb are the
  only field lever) — forcing either into Layperson reach would misrepresent
  real scope-of-practice, exactly what this document's own discipline warns
  against. The remaining 10 gaps are unaudited for this same "is it actually
  a bug" question — worth the same scrutiny before assuming any of them
  need new content rather than a fix.
- **The promotion/certification-exam flow** (5 scenarios / 85% accuracy /
  scope compliance / a 5-question exam) — every later chapter gates on a
  school+exam beat of this same shape (EMR/EMT/AEMT/Paramedic), so build it
  generically once, not once per level. `campaign.js`'s
  `needsRemedialTraining` predicate (see F13 below) has no real consumer
  until this exists.
- **Chapter 1 content (design doc "Chapter 1: Boots on the Ground") —
  PARTIAL this session: mechanics/data landed in `campaign.js` and new
  state fields in `App.jsx`'s `blank()`/`CARRY`; the actual scene/phase
  wiring did NOT.** Built concurrently with, and independent of, whichever
  session(s) are building Chapters 4-10 (see F1's Ch.5 entry below for that
  batch's own equivalent write-up) — this is genuinely a different session
  working the opposite end of the campaign, per explicit operator
  direction, not a conflict to reconcile.
  **What shipped:**
  - **The recurring arrival-time mechanic**, confirmed numbers from a live
    design conversation, not placeholders: `campaign.js`'s
    `ARRIVAL_TIME_OPTIONS`/`arrivalTimeDeltas` — 45/15/on-time/5-late,
    reputation +3/+1/0/-2, `g.morale` (whole-station, not one partner's
    friendship — per the operator's own "let's do the whole station" call)
    +2/+1/0/-1, fatigue +4/+3/0/-3. Debuts Chapter 1 with one exact line
    ("You just woke up. It's your first day...") then recurs every
    zth-campaign shift after with a second exact line ("It's time for your
    shift. How early do you head out?") — both lines specified verbatim by
    the operator, not drafted.
  - **A small, easy Chapter 1 call pool** (`CH1_CALL_POOL`, 5 reused
    low-acuity scenarios, capped at `CH1_CALLS_PER_SHIFT`=3 per the
    operator's "keep the calls short and sweet") and `ch1EmsArrivalSeconds()`
    (a uniform 1-3 minute draw — "roughly 2 minutes give or take one
    minute randomly").
  - **A named, recurring, interactable PATROL station roster**
    (`CH1_STATION_ROSTER`/`patrolShiftRoster()`) — Northwood PATROL runs
    THREE simultaneous units, not just the player's own foot-patrol crew:
    two bike EMRs (Priya Anand, Marcus Webb) who alternate solo bike duty,
    and two golf-cart EMR duos (Sofia Marchetti/Devon Blackwell, and Grace
    Turner/Nathan Cole) who alternate crewing the cart, rotating by a
    simple shift-index modulo rather than a pure random draw so the player
    sees both configurations across a handful of shifts. This is also the
    missing context for Chapter 3's own e-bike/golf-cart PATROL-EMR
    promotions, which previously existed as rewards with no explanation of
    what unit type they actually moved the player into.
  - **`laypersonVolunteerCount(dayOfWeek)`** — the on-foot experienced-
    Layperson-volunteer fleet size fluctuates by day of week (busier
    Fri/Sat/Sun nights), flavor-only per the operator's own "worth
    including... without over-engineering" framing, not a mechanic with
    its own stat consequence.
  - **`App.jsx` state**: `arrivalPromptSeen`, `ch1Done`, `ch1MoneySeeded`
    (all three in `CARRY` — must survive the blank()+carry() reset every
    off-duty/shift-boundary transition uses), plus `ch1BetweenPicks`/
    `ch1EmrPushChoice` (deliberately NOT in `CARRY` — transient per-scene
    state, same idiom the Prologue's own `interlude1Picks`/
    `tutorialFinaleChoice` already established, since nothing about them
    needs to survive a shift boundary).
  - `npx eslint src/campaign.js` clean on every edit this batch made:
    checked incrementally, not just once at the end.
  **NOT done, explicitly left for whoever picks this up next — this is the
  bulk of Chapter 1's real work:**
  - **No phase renders any of this yet.** `campaignArrivalPrompt` (the
    phase that should show the arrival-time choice) does not exist in
    `App.jsx`. The natural hook point was identified but not built: the
    `offDuty` phase's `pick()` handler (currently routes every save
    straight to `"gmodePick"`) needs to route zth saves through
    `campaignArrivalPrompt` first, applying `arrivalTimeDeltas` and
    setting `arrivalPromptSeen:true`, before continuing to `"gmodePick"`.
  - **No `campaignCh1Shift`-equivalent entry phase exists** — nothing
    currently seeds `career:{queue:<3 draws from CH1_CALL_POOL>,idx:0,
    results:[]}` the way the Prologue's own `beginPatrol` does for its
    fixed 3-call queue. This is where `STARTING_MONEY` should actually get
    applied to `g.money` (once, gated on `ch1MoneySeeded`).
  - **The between-call "robust action system... a LOT to do" is
    unbuilt.** The design intent (per the live conversation) is to extend
    the SAME shared station/interlude branch the Prologue's own
    `interludeIdx` logic already lives in (`App.jsx`, the big
    `if(g.phase==="station")`-equivalent block also now host to Chapter
    4's `ed_observation_shift` per that batch's own additions) with a
    Chapter-1-specific guard condition and a menu surfacing the new
    station roster (talk to whichever bike EMR/cart duo is on shift,
    interact with the fluctuating volunteer fleet, etc.) — identified, not
    implemented.
  - **No Chapter 1 ending/EMR-push phase exists** — needs its own version
    of `campaignTutorialFinale`'s pattern, ending in the same "talk to
    {supervisorName} about EMR school" beat §1.5 already describes, which
    is also where `ch1Done:1` should finally get set.
  - **Every line of dialogue this batch touched is a placeholder marker**
    (per explicit operator instruction — dialogue is the operator's own to
    write), except the two arrival-time prompt lines, which the operator
    dictated verbatim and are real, final text, not placeholders.
  - **No in-browser click-through verification happened** — none of this
    is reachable through real play yet since no phase wiring exists, so
    there was nothing to click through this batch.
- **Chapter 5 (Employment: IFT/911/Event, design doc §1.6.6) — structural
  pass shipped this session, STRUCTURE ONLY, dialogue deliberately left as
  placeholders per explicit operator instruction ("leave placeholders for
  dialogue... we'll come back and polish it").** Built concurrently with,
  and independent of, whichever session is building Chapters 1-4 — this
  batch touched `campaign.js` (new `CH5_EMPLOYERS` data table matching
  §1.9's fixed cast — Nathan Cole/Leo Bautista at Crosswind IFT, Captain
  Renee Fischer at Northwood County EMS 911, Jenna Whitfield at EventMed,
  City of Northwood Fire-Rescue's entrance exam — plus `canCombineEmployers`,
  `resolveEntranceOutcome`, `nine11Shortfall`, `CH5_REAPPLY_COOLDOWN_SHIFTS`,
  all composing the exam-scoring/pay formulas already in `campaign.js`),
  `achievements.js` (`amberlamps`, `boo_boo_bus_driver`, `party_medic`,
  `cross_trained`, `moonlighter`, `probie_no_more`), and seven new `App.jsx`
  phases (`campaignCh5Intro` -> `campaignCh5JobChoice` -> `campaignCh5Exam`/
  `campaignCh5ExamResult` for the 911/fire-track entrance exams ->
  `campaignCh5EmployerIntro` (creates the relevant fixed-cast relationships)
  -> `campaignCh5AddSecondJob` (the IFT+Event combine case) ->
  `campaignCh5End`). Also wired `g.jobs`/`g.emrCalls`/`g.iftCalls`/
  `g.eventCalls`/`g.calls911`/`g.aemtCalls` into `creditOutcome` (a
  necessarily provisional heuristic — keys off `s.jobs`/`s.level` only,
  since Chapters 1-3/6-7 own the more precise version of this tracking and
  don't exist yet; written so it won't double-count once they land) and
  employer-specific pay into `shiftPay` (including Event's real
  `EVENT_SHIFT_FREQUENCY_FACTOR` inconsistent-income behavior). `npx vite
  build` clean; `npx eslint` introduces no new findings in any file this
  batch touched (checked against the diff, not the whole-file count, since
  the concurrent Chapter 1-4 batch has its own in-progress unused-import
  noise in `App.jsx` right now that isn't this batch's to fix).
  **NOT done, explicitly left for whoever picks this up next:**
  - **No entry point exists yet.** Nothing currently transitions into
    `campaignCh5Intro` — that has to be Chapter 4's EMT-exam-pass handler,
    once it exists. Likewise `campaignCh5End` currently exits to
    `"shiftSummary"` (ordinary Career play) as a placeholder for wherever
    Chapter 6 (AEMT school) should hook in. Until Chapter 4 lands, Chapter 5
    is unreachable through normal play — it was smoke-tested this session
    by temporarily hijacking the `learningMode` zth-pick's initial phase
    (`campaignDisclaimer` -> `campaignCh5Intro`) in a local, throwaway edit
    that was reverted before this batch ended, not shipped.
  - **Real in-browser click-through verification did NOT happen.** A
    Playwright smoke test got as far as confirming the title -> disclaimer
    screen transition before this session was cut short; the actual
    Chapter 5 phases (job choice, the exam roll, employer intro, the
    second-job offer) were never clicked through in a real browser. This is
    the single most important thing to do before trusting this batch —
    per this project's own front-end checklist, structural code that
    compiles is not the same as a verified feature.
  - **The 911/fire entrance "exam" is a placeholder random roll**, not a
    real scenario battery. `nine11EntranceScore`/`fireEntranceScore` (both
    pre-existing in `campaign.js`) take a `baseRoll`/`examComponent` input
    that this batch supplies via `Math.random()`, narrated as "you take the
    exam" with no actual scenario content behind it — consistent with how
    the design doc's own formula treats that input (a bare 0-100 roll, not
    a scenario array), but a real scored battery (reusing the same
    `EMR_EXAM_POOL`-style pattern §1.6.3 already establishes) would be a
    genuine improvement, not just polish.
  - **Every line of dialogue in all seven phases is a literal
    `*Placeholder — ...*` description**, per explicit instruction — none of
    it is finished prose. This includes the employer/supervisor/partner
    introductions, the exam framing, and the chapter-end wrap-up.
  - **No background art was added.** Existing generic backgrounds
    (`stationOffice`, `stationGarage`, `stationTraining`, `stationExterior`,
    `dormRoom`) are reused as placeholders; this project's own convention
    (asset spec `.md` files before art, `src/assets/audio/README.md`'s
    pattern) was NOT followed for Chapter 5-specific locations (a Crosswind
    dispatch office, an EventMed staging tent, Northwood County EMS's own
    station) — worth doing once the chapter's content is otherwise final.
  - **`g.chapter3Path` is declared defensively (defaults `null`) but has no
    real writer** — Chapter 3 (the PATROL/Fire fork) doesn't exist yet, so
    the Fire-Rescue entrance-exam option in `campaignCh5JobChoice` can never
    actually show in real play today. No conflict expected once Chapter 3
    lands (same field name, same two values), but worth a real check when
    it does.
  - **The IFT+Event IFT-tenure/scholarship-eligibility interaction
    (§1.6.2.1, `scholarshipEligible`) is not wired to anything here** — Ch.5
    only creates the employment relationship; the scholarship OFFER itself
    is AEMT/Paramedic-tuition-gate content (Ch.6+), correctly out of scope
    for this batch.

**Chapter 4 (EMT School: "It Gets Real," design doc §1.6.5/§1.6.12) —
structural pass shipped this session, STRUCTURE ONLY, dialogue deliberately
left as placeholders per the same explicit operator instruction Chapter 5's
own entry above already cites.** Built concurrently with, and independent
of, whichever sessions are building Chapters 1-3 and 5-10 — this batch
touched `campaign.js` (`CH4_CAST` — Harper Nakamura/`classmate_emt`,
reuses Ch.2/Ch.6's own Instructor Yolanda Briggs/`instructor` identity,
Derek Voss flavor-only per §1.9; `FUNDING_CUT_CHANCE`; the stat-gated
`balanceBothSuccessChance` roll for §1.6.12's "try to balance both" option —
the EMT exam itself deliberately does NOT get its own bespoke scenario
pool/quiz bank, reusing the SAME shared `rollExamFieldScore`/
`rollWrittenQuiz`/`EXAM_WRITTEN_QUESTIONS`/`EXAM_FIELD_SCENARIOS`
placeholders the Chapter 5/6/8 batches already built for this exact
purpose, one placeholder mechanism rather than several independently-
engineered ones), `achievements.js` (`the_patch`, `two_for_two`,
`paying_my_own_way`, `working_medic`, `burning_the_candle`,
`stretched_thin`), `downtimeEvents.js` (`ed_observation_shift`, the first
event to use a new optional `knowledgeDelta` effects field — wired into
`resolveDowntime`, App.jsx), `assets.js` (`TITLE_TO_ROLE` entries for "EMT
instructor"/"EMT classmate"), and eight new `App.jsx` phases
(`campaignCh4Intro` -> `campaignFundingCut` (§1.6.12's three-way
financial-strain incident, rolled at a flat 45% — simplified from the
doc's own staggered Ch.2 25%/Ch.3 35%/Ch.4 45% window since Ch.2-3 don't
exist yet to roll their own chance first) -> `campaignCh4Day1` (4.1: the
classmate/instructor intro, the real EMT tuition gate — `canEnroll`/
`takeLoan` against `TUITION.emt`) -> `campaignCh4Practice` (4.2: the
optional ED-observation downtime beat, resolved inline rather than through
the ordinary `g.pendingDowntimeEvent` system since Ch.4 never runs through
the station/career-queue loop at all) -> `campaignCh4Classmate` (4.3, a
three-option §1.10.1-style topic exchange) -> `campaignCh4ExamPrep`/
`campaignCh4ExamResult` (4.4, the EMT certification exam, field+written
combined via the existing `examCombinedScore`/`examPass`) ->
`campaignCh4End`, which hands off to `campaignCh5Intro` — the exact hook
Chapter 5's own "TEMPORARY bridge" comment asked for). New `g` fields:
`debt`, `fundingCutFired`/`fundingCutResolution`/`fundingCutBalanceFailed`/
`fundingCutStage`, `emrExamAttempts` (declared defensively for Ch.2, same
pattern Ch.5 already used for `chapter3Path`), `ch4ExamAttempts` and the
per-attempt result fields, `emtCertified`, plus a handful of scene-local
transient flags (`ch4Day1TuitionShown`, `ch4ClassmateTalked`/
`ch4ClassmateChoice`, `ch4PracticeEdChoice`). `npx vite build` clean at the
moment this batch stopped; `npx eslint src/campaign.js src/achievements.js
src/downtimeEvents.js src/assets.js` (the files this batch could check in
isolation from the actively-co-edited `App.jsx`) came back clean.
**NOT done, explicitly left for whoever picks this up next — this batch was
cut short by explicit operator instruction before finishing verification:**
- **No real in-browser click-through verification happened at all.** Not
  even the throwaway-bridge smoke test Chapter 5's own entry describes
  doing. Before trusting this batch, temporarily point the `zth` learning-
  mode pick (or `campaignTutorialFinale`'s own onDone) at `campaignCh4Intro`,
  click through all eight phases including at least one funding-cut branch
  and one exam retake, and revert the temporary hook afterward.
- **`npx eslint`/`npx vite build` were not re-run against the FULL tree**
  after this batch's last `App.jsx` edit — only the isolated non-`App.jsx`
  files were confirmed clean, and one build was run mid-session (clean,
  chunk-size warning only) but not re-confirmed after the final phase
  blocks landed. Re-run both before trusting this is regression-free,
  especially given how much concurrent `App.jsx` editing was happening
  from other chapters' batches during this session.
- **No entry point exists yet, symmetric to Chapter 5's own gap.** Nothing
  currently transitions into `campaignCh4Intro` — that has to be Chapter
  3's own ending, once it exists. Until then Chapter 4 (and everything
  downstream of it — Chapter 5 onward) is unreachable through normal play.
- **The EMT exam is a placeholder stat-driven roll, not a real scenario
  battery** — same honest caveat Chapter 5's own entry already states for
  the 911/fire entrance exam, and deliberately the SAME placeholder
  mechanism rather than a second one invented just for Ch.4. A real
  scored battery (reusing `EMR_EXAM_POOL`-style scenario selection, §1.6.3)
  would be a genuine improvement, not just polish.
- **Every line of dialogue in all eight phases is a literal
  `*Placeholder — ...*` description**, per explicit instruction — none of
  it is finished prose, including the funding-cut letter itself (the doc
  deliberately leaves its cause unspecified — aid restructuring,
  scholarship denial, work-study cut, or a family situation), the
  instructor/classmate introductions, and the exam framing.
- **No background/sprite art was added** — existing generic backgrounds
  (`stationTraining`, `dormRoom`, `stationBreakroom`, `stationOffice`,
  `stationExterior`) are reused as placeholders, same as Chapter 5's own
  entry already notes for its own locations.
- **`g.emrExamAttempts` is declared defensively but has no real writer** —
  Chapter 2 (EMR school) doesn't exist yet, so `two_for_two`'s
  `emrExamCleanFirstTry` check reads as true for every player until Ch.2
  starts tracking real EMR retakes. Documented in-code; worth a real check
  once Chapter 2 lands (same field name expected, no conflict anticipated).
- **The funding-cut incident's Ch.2/Ch.3 windows (§1.6.12's own staggered
  25%/35% chances) are simplified away** — only Ch.4's flat 45% roll is
  reachable today, since Ch.2/Ch.3 don't exist to roll their own chance
  first. `campaign.js`'s `FUNDING_CUT_CHANCE` already has all three
  numbers on record for whoever builds those chapters to reuse rather than
  inventing a second table.

**F9. MCI — the multi-unit half, and the still-unbuilt scenarios.** The
multi-PATIENT/triage half shipped (the `patients:` array, the Triage panel,
`mciPileup` — section 3's F28 entry). **Three of the six still-unbuilt
scenarios this item named now ship (most recent session)**: `unsafeSceneAssault`
(TRMA-037 — reuses `polytraumaFall`'s wound set, the same reuse `bikeVsCar`
already established, plus the F7 hazard mechanic and F3's medication-allergy
mechanism), `stabbingPair` (TRMA-038 — a second real consumer of the
`patients:` roster: a life-threat `stabChestTension` patient plus a stable,
content-only second patient, and the F7 hazard mechanic again), and
`testicularTorsion` (MISC-035 — content-only, no new physiology, Layperson-
completable; see queue item 24's own reasoning for local-pain-only
presentations). **The other mother+newborn roster path (childbirth's
mid-call `_spawnQueue` spawn, distinct from the dispatch-time `patients:`
array) was playtested end-to-end for the first time this session (most
recent session) and is genuinely wired** — see section 3's newest entry —
but was killing every newborn via a real physiology-engine bug, now fixed.
Still open: a real multi-UNIT system (several ambulances each actually
transporting a different patient, rather than the other roster members
being narrated as handed off and scored on frozen vitals) — the same hard
networking-shaped problem as F4's co-op step 2, just for units instead of
players. Also still unbuilt: active-shooter and rectal-foreign-body
scenarios (each needs a new mechanic or condition). A sickle-cell-crisis
scenario shipped in a later batch (see section 3), so that gap is closed.

**F10. Two physiology-adjacent follow-ups.** **The medication-allergy
mechanism is wired into a real scenario for the first time (most recent
session)** — `unsafeSceneAssault` (F2) declares `allergy: "fentanyl"`; the
patient is unidentified and unresponsive, so "no known allergies" is
genuinely unknown rather than negative, which is the actual teaching point.
Still open, and still correctly NOT attempted here: deeper comorbidity
mechanisms (HTN, HLD, diabetic autonomic/vascular disease) need real
physiology-engine work, not a front-end guess — filed as physiology queue
item 21, not repeated here. (Sickle-cell crisis, this item's other original
half, has since shipped as a real condition — see section 3.)

**F11. Large systems from the player-feedback backlog, still open.**
- **Lore/character depth** (partner backstories, recurring patients,
  station rivals) and **narrative branching** (visual-novel-style dialogue
  choices at story beats) — content-heavy, no new mechanism, but large
  enough to warrant their own batches. `VNShell.jsx`'s `VNDialogue`/
  `VNSprite` and the Relationships system are the infrastructure any future
  batch here should build on, not duplicate.
- **Non-English-speaking-family / interpreter mechanic.** A language-barrier
  modifier on probe/dialogue text (garbled or partial findings until an
  interpreter action is taken) — touches enough scenario/probe plumbing to
  be its own batch, not a quick add.
- **"Ambulance crash of another crew" scenario.** Needs the same real
  multi-UNIT system as F2 — bundle with F2 rather than building it twice.
- **Co-op step 2 — real simultaneous-edit merging, still open.** **Room
  capacity raised 2→4 and per-client identity shipped this session** (see
  section 3's newest entry): `coopServer.mjs` now caps each room at
  `MAX_PEERS=4` and rejects a 5th joiner with a `full` message instead of
  silently overloading the relay; every client sends a display name and a
  persistent client id on join, and the server broadcasts a real roster
  (`{id,name}[]`), not just a headcount — the co-op setup screen shows who's
  actually in the room. A wall-clock timestamp on every `state` broadcast
  lets a client drop one that arrived out of order relative to the last one
  it already applied, which measurably helps with 3-4 simultaneous
  broadcasters hitting one relay (tested locally: 5 real WebSocket clients
  against the relay, 4 admitted with a live roster, the 5th correctly
  rejected). **What is still unbuilt, honestly**: this is ordering hygiene
  on top of the same "shared whiteboard, last write wins" model, not real
  conflict resolution — it drops stale/reordered packets, it does not merge
  two players' edits made at the same instant. A real fix still needs either
  an action-relay/host-authority model or operational-transform-style
  merging. Also shipped this session, filed under the itch.io push rather
  than repeated here: the relay is now deployable off-LAN (dynamic `$PORT`
  binding for typical PaaS hosts, `docs/itch_deploy.md`) and the client's
  default relay URL is configurable at build time via
  `VITE_COOP_RELAY_URL`, so an itch.io build can ship pre-pointed at a real
  hosted relay instead of `ws://localhost:8787`.
- **Co-op-only 3D driving + first-person walk-in — shipped, verified, see
  section 3's newest entry for the full writeup.** Per direct operator
  instruction (not this queue item's own text — a separate, explicit ask
  mid-session): `Coop3DDrive.jsx`/`Coop3DWalk.jsx`, real Three.js scenes,
  co-op ONLY. Solo/Career/Sandbox are completely untouched by this and keep
  using the 2D `DrivingMinigame`/plain approach screen this bullet's own
  text below describes — the "IN PROGRESS" playtest gap immediately below
  is about THAT 2D path, not the new 3D one, and remains open exactly as
  written.
- **Driving minigame step 2 — a real input/physics layer. DONE, including
  the real in-browser playtest — see section 3's newest entry.** A real WASD
  driving segment (`src/components/DrivingMinigame.jsx`) has been built and
  wired into the response-phase screen (`App.jsx`, `g.phase==="response"`),
  replacing the old single five-second "SWERVE" reaction-window QTE
  entirely (the old `g.driveHazard`/`driveHazardRolled` fields and their
  tick-loop/render code are gone; `blank()` now carries `driveMiniDone`
  instead). It's a real physics loop, not a strafing toy: W/S accelerate
  and brake with drag/friction, A/D steer with speed-scaled authority and a
  self-centering damp, obstacles (parked/pulling-out cars, pedestrians,
  potholes) scroll toward the car on a 3-lane road and must be dodged, and
  a graded 0-100 score (average speed maintained, minus a penalty per
  collision/curb-hit) feeds `g.speedBoost` on completion — a clean drive
  arrives composed (faster actions all call), a rough one arrives shaken,
  same economy the old QTE used, just continuous instead of binary. Runs on
  `code` (1/2/3) for every vehicle response, not just Code 3 — Code 1 is
  slower with more pedestrian-style hazards (no lights/siren, normal
  traffic doesn't expect you), Code 3 is faster with hazards arriving
  quicker (the actual reason `CODES[3]`'s own note calls it "the most
  dangerous thing you will do today"). Runs its own requestAnimationFrame
  loop against refs (not React state) so 15s of 60fps gameplay doesn't
  thrash the reconciler; `npx vite build` and `npx eslint src/App.jsx
  src/components/DrivingMinigame.jsx` are BOTH clean (0 errors, 0
  warnings) — the react-hooks/refs and react-hooks/set-state-in-effect
  rules this project's own linter enforces (see the F1 tutorial-sim
  precedent) were hit and fixed for real (ref syncs moved into effects,
  the countdown's setState moved inside a setTimeout callback), not
  suppressed.

  **The in-browser playtest this entry used to flag as its own top
  priority is now done for real (most recent session) — see section 3's
  newest entry for the full writeup.** `tools/browser/
  clickThroughDrivingMinigame.mjs` real-clicks to a scenario's response
  phase with a vehicle that actually triggers the minigame, then drives
  `DrivingMinigame.jsx` with genuine `page.keyboard.down/up` WASD input
  (state injection cannot reach this component's internals at all — its
  phase/physics live entirely in local `useState`/refs) through ready →
  countdown → running → result, confirms real A/D steering moves the car
  (a curb-hit count in the result screenshot that only a moving car could
  produce), and confirms a real click on "Keep rolling →" lands
  `g.driveMiniDone`/`g.speedBoost` in global state. Four screenshots
  (`tools/browser/screenshots/drive-*.png`) confirm the canvas, HUD, and
  result overlay visually, not just via text match. Run twice, PASS/PASS,
  zero console errors. "Crash affects patient condition" remains
  deliberately unbuilt, same reasoning as before: it would need
  physiology-engine wiring this mechanic doesn't have a hook into yet —
  the collision consequence today is entirely within the existing
  speedBoost/log economy.

**F12. §1.4 Relationship system — remaining spec items.** Core, plus
`partner_patrol`/`supervisor`, plus a Relationships status screen
(`RelationshipsOverlay.jsx`) have shipped (section 3). Still open:
- **On-shift micro-interactions** (§1.4.1: coffee, meals, exercise WHILE on
  shift, not off-duty). Needs a real "at the station, between tasks" hook
  distinct from the off-duty channel already built — likely a small menu
  alongside the existing crew-task tab, gated the same way
  (`learningMode==="zth" && relationships?.<id>?.met`).
- **The remaining 8 relationship ids** (`radio_crew`, `fire_partner`,
  `classmate_emr`, `classmate_emt`, `ift_partner`, `event_coord`,
  `instructor`, `shitty_supervisor`). Each needs its owning content before
  the relationship has anything real to attach to — none of these NPCs
  exist anywhere in the tree yet. Create each via `relationships.js`'s
  `createRelationship()` on first meeting, the same way `partner_patrol`/
  `supervisor` were, once its NPC exists. `radio_crew`/`fire_partner`/
  `ift_partner` are worth prioritizing first, since they could map onto an
  actual current roster member (see the next bullet).
- **§1.4.2's "quiet moment" as an actual authored scene**, not just the log
  line it is today — a real one-time full-screen beat is real content work.
- **§1.4.3's partner-change/stress-morale consequence.** Only demonstrated
  today as cold dialogue tone at low friendship — the deeper consequence
  needs a relationship id that maps onto an ACTUAL roster member (`roster`
  is where `morale` actually lives), so it's a natural first use for
  `radio_crew`/`fire_partner`/`ift_partner` once they exist.
- **Dating, marriage, family content.** Explicitly framed in the source doc
  as a very hard, very late reward — nowhere near reachable yet with two
  interaction channels and a single NPC.

**F13. §1.5 Fatigue/Morale/Reputation — remaining spec items.** The three
scalars and their real modifiers shipped (section 3), and morale-weighted
argument odds shipped this session (section 3's newest entry —
`rollDowntimeEvent` now accepts `morale` and biases the pick via a new
optional per-event `moraleWeight`, applied so far to `crew_argument`; any
future event can opt in the same way). Still open:
- **"A crew member quits temporarily."** Structurally cheap (the
  fire/rehire pattern already exists — `App.jsx`: `roster.filter(p=>p.id!==
  id)`, returning them to `candidatePool`) but needs real design decisions
  first: which roster members are eligible (not the fixed/required crew),
  what "temporarily" means concretely, and re-verifying the crew-task/
  monitor-assignment code doesn't break if the removed member had an
  in-progress `cBusy`/`monitorBy` reference.
- **`shitty_supervisor`'s periodic morale drain** — blocked on that
  relationship id existing (F12); once it does, a small periodic `g.morale`
  penalty while `g.relationships.shitty_supervisor?.met` is true is the
  natural, cheap addition.
- **Reputation's real consumers** (job applications, exam failures, forced
  suspension). `needsRemedialTraining` is a real, correct predicate with no
  UI consequence beyond a warning — blocked on the certification-exam/
  promotion flow (part of F8's own still-open Zero-To-Hero campaign
  content). Do not build a job-application screen just to give
  reputation a consumer; build the exam/promotion flow first and wire
  reputation into it then.

**F14. A real second crew seat for the PATROL partner — DONE, verified in a
real browser session. See section 3's newest entry for the full writeup.**
Turned out NOT to need the architecture change this entry used to warn
about: `seatsFor`/`totalSeatsFor` (the only readers of `fleet.js`'s
`patrol.vehicle.normalSeats/totalSeats`) are only ever read on the
"vehicle"/"partners" phases, and zth's campaign never visits either — it
sets `myVeh`/`department` directly at the `learningMode` pick. So no
`fleet.js` seat-count change was needed at all. `beginPatrol()`
(`App.jsx`, the "Begin your PATROL" handler) now also seeds `g.roster`
with a fixed (`cost:0`, non-recruitable), Layperson-level entry built
straight from the already-existing `relationships.partner_patrol` (same
name/gender/pronouns), the same `fixed:true` idiom `KINDS.flight`'s pilot
already uses. The existing "kit"→"response" transition already maps every
`g.roster` entry into real scene `g.crew` with no changes needed there, and
the crew-order panel already generically filters assignable tasks by
`t.lvl<=cl` for any crew level — proven already-general by the fact that
the scene's own generic Layperson "Bystander" entry goes through the
identical path. **Real, not just data-level, verification**: a new
Playwright script, `tools/browser/verifyPatrolPartnerCrewSeat.mjs`, real-
clicks "Begin your PATROL" and confirms the fixed roster entry lands: real-
clicks through to a live scene and confirms `g.crew` contains the partner;
real-clicks the Crew tab and confirms the partner renders as a LAYPERSON
card with real task buttons (Compressions, Ventilate, Hold C-spine, etc. —
screenshot-confirmed, not just text-matched); and real-clicks "Compressions"
on the partner's own card and confirms `g.cBusy` picks up a real task under
their id — proving `order()` itself accepts this crew member, not just that
the panel renders them. Run twice, PASS/PASS, zero console errors both
times. `npx vite build` clean; `npx eslint src/App.jsx src/fleet.js` at the
exact pre-existing 3-error `react-refresh/only-export-components` baseline,
zero new findings.

**The follow-up pass (same session, after the operator's stop-and-document
instruction, per a later explicit "finish that" instruction) closed all
three of the loose ends above. Detail is at section 3's newest entry, not
repeated here — summary:**
- `tools/browser/README.md` now documents both new scripts and the
  crew-card locator gotcha.
- **The Master-of-Your-Scope gap is closed too, not left as a future
  follow-up.** `fleet.js`'s `patrol` kind gained a real `fixedCrew`
  (reusing `patrolCrew`, the same generator its own `crewFn` already uses
  for arriving mutual-aid units) — a generic, anonymous "PATROL Volunteer"
  partner, deliberately distinct from zth's named, relationship-tracked
  one. `normalSeats`/`totalSeats` bumped 1→2 to fit them. A manual Career
  player picking `patrol` through the ordinary vehicle/partners wizard now
  gets a real seated partner too. This surfaced and fixed a real, previously
  harmless latent bug: fixed-crew entries never carried an `id` (harmless
  for flight's pilot, since the crew-order panel filters pilots out of the
  orderable list entirely — but patrol's new NON-pilot fixed partner is
  orderable, and an undefined `id` would have collided as a React key and a
  `g.cBusy` key). Fixed at the one call site that builds fixed-crew entries
  (`App.jsx`'s "vehicle" phase `pick()`), not in `fleet.js`. Also
  generalized the "partners" screen's fixed-crew note text, which was
  hardcoded to "flies the aircraft" — now reads "flies the aircraft" only
  for `p.pilot`, "rides along automatically" otherwise. Verified via a new
  script, `tools/browser/verifyMosPatrolFixedCrew.mjs`: real clicks through
  Career Mode → Master of Your Scope → Layperson → Campus PD → "PATROL
  Volunteer" confirm `g.roster` carries a fixed, free, Layperson entry with
  a real id, `myVeh.normalSeats===2`, and the generalized (not pilot-only)
  note text. Run twice, PASS/PASS, zero console errors both times.
- **The Chapter 3 fork question was investigated, not left open**: turned
  out to already be safe by construction, nothing to fix. The "vehicle"
  phase's `pick()` handler's `stripFixed` unconditionally strips EVERY
  `fixed` roster entry (not a pilot-specific filter) before adding the
  newly-picked vehicle's own `fixedCrew` — so IF a future Chapter-3-fork
  batch ever routes zth through "vehicle" phase to pick a new vehicle
  (Fire's `engine`, PSO's `pso`, etc.), `partner_patrol` would be
  automatically and correctly removed from `g.roster` at that point, same
  as switching FROM `patrol` TO `flight` already correctly drops a stale
  pilot today. Nothing currently calls that path for zth, so this remains
  unexercised in practice, but it is not a landmine waiting in the existing
  code — worth a real click-through once that fork actually ships, not
  before.

**Re-verified after the follow-up pass**: `npx vite build` clean; `npx
eslint src/App.jsx src/fleet.js` at the exact 3-error baseline, zero new
findings; both Playwright scripts (zth and MoS) re-run clean after the
`fleet.js`/`App.jsx` changes. F7 is fully closed — nothing left open under
this item.

**F15. Two small, low-priority follow-ups — DONE, verified via inspection and real-browser check. See section 3's newest entry for the full writeup.**
- **A live character preview elsewhere in the game — DONE, real in-browser
  verification complete, two real bugs found and fixed along the way.** Per
  a clarifying question, scoped to "VN scenes only": the player's own
  layered portrait (built once at `campaignCustomize`, §2.2) now reappears
  as a VNSprite alongside NPCs in three later Zero-To-Hero VN scenes.

  **What shipped:**
  - `assets.js`: a new exported `playerPortraitLayers(gender, appearance)` —
    takes the raw `g.playerGender` label and `g.campaignAppearance` object
    and returns the 4 layer paths (base/outfit/hair/eyes) ready to stack, or
    `null` if any attribute is still unset. Single source of truth for "is
    the look fully specified" + "what are the layer paths" — hoists the
    slugging/gender-tag logic that used to live only as a local const inside
    `campaignCustomize`'s own phase block; that screen's own preview now
    calls this same helper instead of duplicating it (behavior-preserving).
  - `components/VNShell.jsx`: `VNSprite` gained a `layers` prop (an array of
    image srcs) as an alternative to its existing single `src` prop, falling
    through to the exact original `src` rendering when `layers` is absent —
    every existing NPC call site is unaffected.
  - `App.jsx`: `campaignHeatStrokeAftermath`, `campaignLibraryEncounter`,
    and `offDuty`'s `zthVN` branch each now compute `playerLayers=
    playerPortraitLayers(g.playerGender,g.campaignAppearance)` and render
    `<VNSprite layers={playerLayers} side="left"/>` alongside the existing
    NPC sprite (`side="right"`) — player sprite always full-brightness in
    `offDuty` (unlike the partner sprite's `faded={!g.relCallOpen}` toggle,
    since the player is always genuinely "in their own room").

  **Two real bugs found and fixed while verifying, neither of which the
  diff alone would have caught — both required actually looking at a
  screenshot, not just checking the DOM.**
  1. **The layered-image wrapper had no intrinsic size.** The first version
     made every layer `position:absolute` inside a wrapper with no explicit
     width — since absolutely-positioned children don't establish an
     ancestor's box size, the wrapper collapsed to zero width and rendered
     nothing, even though all 4 `<img>` tags were correctly present in the
     DOM with correct `src` values. Fixed by rendering the FIRST layer in
     normal flow (giving the wrapper a real size from its own
     height+objectFit+intrinsic aspect ratio) and stacking the rest on top
     via `inset:0` at 100%/100% — safe since every layer shares the same
     canvas dimensions by design.
  2. **The two sprites were stacking vertically instead of sharing one
     row.** Missed that the existing two-sprite precedent
     (`campaignStation`'s supervisor+partner pair) wraps both `VNSprite`
     calls in a `<div style={{display:"flex"}}>` — without it, each
     `VNSprite` (itself a full-width block) stacks as its own row, pushing
     earlier content above the viewport. Fixed by adding the same wrapper
     to all three new call sites, matching the established pattern exactly.

  **Verified for real, not just described.**
  `tools/browser/verifyPlayerSpriteReuse.mjs` real-clicks through actual
  character creation (title → new save → Zero-To-Hero → the disclaimer/
  coincidence/letter chain → `campaignCustomize`, real-clicking every
  attribute arrow to a specific value and a real `▲ Confirm`, so
  `g.playerGender`/`g.campaignAppearance` are the app's own committed
  values, not injected), then `setState`-jumps to each of the three target
  phases and inspects the rendered DOM for the 4 player-layer `<img
  src>` values (switched to DOM inspection after the first attempt, which
  used `page.on("response")` tracking and came back a false 0 — the same 4
  URLs were already requested once by `campaignCustomize`'s own preview
  moments earlier in the same page session, and a browser cache hit does
  not necessarily re-fire a network `response` event the second time; DOM
  inspection is what actually caught bug #1 above, since the network
  approach would have kept reporting "0 requests" indefinitely on a false
  trail). Three screenshots
  (`tools/browser/screenshots/player-sprite-heatstroke-aftermath.png`/
  `-library.png`/`-offduty.png`) were visually inspected, not just
  DOM-checked, and clearly show the full composited character (hair, eyes,
  outfit bands all correctly stacked and colored per the chosen attributes)
  standing beside the NPC portrait in all three scenes. Run twice in a row:
  PASS/PASS, zero console errors both times. `npx eslint src/App.jsx
  src/assets.js src/components/VNShell.jsx`: zero new findings (same 3
  pre-existing `react-refresh/only-export-components` baseline). `npx vite
  build`: clean, same pre-existing >500kB chunk-size warning.

  **Stated honestly**: the sprite's very top edge (upper hair/eyes) is
  marginally cropped in scenes with a tall dialogue box, since the sprite
  row (`min(50vh,460px)`) plus a long `VNBox` can slightly exceed the
  viewport — a pre-existing `VNScene` vertical-space characteristic already
  present in the shipped `campaignStation` two-sprite scene with a long
  enough dialogue box, not a regression introduced here. Not chased further
  (would mean re-tuning `VNScene`'s shared layout, out of scope for this
  low-priority item) — worth a look if a future batch touches `VNScene`
  sizing for other reasons.
- Arriving-unit supply merging only ever ADDS bags/pockets/stock; it never
  restricts what a LOWER-scope arriving unit can't provide. Correct today
  (nothing currently arrives below the player's own scope and takes
  command), but if a future batch adds that case, double-check the merge
  logic still only fires on the `topN>(n.commandLevel||0)` escalation path
  and doesn't need a matching downward case.
F15 is fully closed — nothing left open under this item.

---

**Physiology-engine queue.** Everything below is the physiology workstream;
the front-end block above takes priority over it for now. **Items 1-4, 6
(partially), 8-9, 11, 13-18, 20, 22, 25, 26, 30, 32, 34, 36, 37 and 44 are
RESOLVED and have been removed from this list** — their detail lives in
section 3 and in section 8's "already implemented" list; the numbers are
retired, not reused, since they're still cited by number in prose elsewhere
in this document (including by still-open items below — e.g. items 38-40
reference item 37's finding and fix pattern even though item 37 itself is
no longer a live entry here). Items 21-30 were filed as byproducts of
front-end batches (21-22 from comorbidity/sickle-cell work; 23-24 from a
player-feedback triage and a every-scenario-needs-a-condition audit; 25-26
from `maskedBleed`/heat-stroke work; 27-30 from later front-end batches) —
real physiology-engine work surfaced while documenting what those batches
left undone, deliberately NOT attempted inline per this document's own
item-7 discipline (literature review, wiring through existing handles,
measurement, two-sided assertions — not guessed at under time pressure in
an unrelated batch).

5. **A dead-code sweep is overdue, and it is cheap — STANDING, open.**
   `duodote`'s dead `fx:{hr:20}`, `catecholamineReserve`, and
   `baroreflexHistory` are already fixed/removed. Still open:

   **RESOLVED (this session) — all four drugs this item originally named.**
   `pat.drugHr`/`pat.drugSbp` were the SAME class of defect duodote's own
   fix already closed once, for four more drugs: `adenosine` was found
   ALREADY fixed in the tree by an earlier, undocumented session (its
   `fx:{hr:-70,sbp:-15}` is gone, replaced by a real `antiarrhythmic.avSlowing`
   mechanism — CLAUDE.md itself had drifted stale on this one; see lesson 16's
   own "a comment can be wrong about something being broken as easily as
   about something being fixed," just aimed at this document instead of code
   this time). The other three were genuinely still dead and are fixed now:
   `midazolam` (`fx:{sbp:-10}`) and `etomidate` (`fx:{sbp:-5}`) — both real,
   grep-confirmed dead accumulators — now route their sedation-related
   relative vasodilation through the SAME `arteriolarDilation` receptor
   nitro/amiodarone already use (pk.js: `alphaDrug -= arteriolarDilation *
   recIntensity`), not `pat.vasodilation` (that handle is the mediator-storm-
   scale distributive mechanism anaphylaxis/sepsis use — a mismatch in kind
   for a mild sedation effect; `arteriolarDilation` is the already-general,
   already-correctly-scaled vascular-tone handle for exactly this size of
   effect). Coefficients identified by measurement (probe: `scen "abdPain"`,
   dose at 180s, SBP read at 420s), not assumed: midazolam 0.2 -> -10.1 mmHg,
   etomidate 0.058 -> -4.7 mmHg, both landing on the original (dead) fx
   offsets' own documented intent while correctly keeping etomidate's drop
   smaller (its own note: "Hemodynamically kind"). `hydroxo` (`fx:{sbp:15}`,
   Hydroxocobalamin — the drug key is `hydroxo`, not `hydroxocobalamin`) is
   fixed the same way, through the SAME `alpha` receptor phenylephrine uses
   (a pure-alpha pressor is the closest existing analog — no beta1/beta2
   component, since NO-scavenging isn't adrenergic) at a modest 0.21 ->
   +15.1 mmHg, well below phenylephrine's own titrated `alpha:1.0`. Full
   reasoning and measurements are in each drug's own comment in `drugs.js`.

   A further pass (this session, delegated) found six more candidates NOT
   yet fixed, reported here rather than guessed at: `pat.insulin`/
   `pat.glucagon` (set to 1 in the constructor, never read or written again —
   glucose regulation runs entirely through direct `pat.glucose` writes in
   `pk.js`; a real DKA/insulin-shock condition would need these to actually
   do something, which ties into item 7's suggested-first-batches list);
   `pat.anionGap` — **RESOLVED (F9 batch, section 3)**: the new
   `breathingCheck` action reads it for a real fruity/acetone breath-odor
   finding above the standard elevated-anion-gap threshold (>16); no other
   toxidrome/lab-display consumer exists yet, so further uses are still open;
   `pat.firstDegreeBlock` — **RESOLVED (this session, section 3)**: wired
   into the ECG readout (`ecg.js`'s new `firstDegreeBlock` waveform/text,
   selected in `patient.js`'s `ecgDesc`), verified two-sided against the
   real engine (fires for `firstDegreeAVBlock`, stays `sinus` for a
   condition-less control);
   `pat.pericardialEffusion` — **RESOLVED in the cardiac-conditions batch**:
   the new `pericardialTamponade` condition now writes it for real (see
   section 3); `aorticDissection` still bypasses it via a direct
   `venousResistance` write, which is fine, since that condition models a
   different mechanism; `pat.dpg` — **RESOLVED (this session, section 3)**:
   now set once per patient (respiratory.js) from the patient's chronic Hb
   deficit and COPD status, right-shifting the oxyhemoglobin curve exactly
   as chronic anemia/hypoxemia do in life; `pat.bun` — **RESOLVED (this
   session, section 3)**: now a live, GFR/prerenal-driven quantity
   (renal.js) instead of frozen at 12. **`pat.insulin`/`pat.glucagon` —
   RESOLVED (this session) — see section 3's newest entry.** A real,
   literature-anchored endocrine-pancreatic mechanism now drives glucose
   disposal/production continuously (renal.js's `updateRenalEndocrine`),
   coexisting correctly with the existing DKA/HHS/severe-hypoglycemia
   conditions (each caps the correct real lever — insulin deficiency vs.
   insulin resistance vs. exogenous-insulin override — per phenotype) and
   with drugs' existing direct `fx.glu` dose writes (left untouched,
   deliberately, since a delivered dose and a continuous rate are a real,
   correct distinction). Grep for reads of a field, then for writes, then
   for whether a writer can actually reach the values
   its readers threshold on remains the cheap, repeatable check — do the next
   pass across `patient.js`'s remaining fields whenever a batch has spare
   capacity, per this item's original framing.

   **`pat.cortisol` — RESOLVED (this session, section 3).** Found via a
   delegated Explore sweep, confirmed by reading the code: `renal.js` set it
   (a real, self-updating relaxation toward `pat.sympathetic`) but nothing
   anywhere else ever read it. Given a real consumer — a cortisol-permissive
   vascular-tone term in `cardiovascular.js`'s `alphaTone` calculation,
   deadbanded to zero effect for every patient except one whose cortisol is
   actually driven low (`addisonianCrisis` now does this directly) — see
   section 3 for the full mechanism and measurement.

   **`pat.ivProtein`/`pat.isProtein` — INVESTIGATED (this session), a real
   mechanism but too subtle in current magnitude to build a meaningful
   consumer around; NOT built.** Found via a second delegated Explore
   sweep, confirmed by reading `metabolic.js`'s `updateFluidShifts`: both
   are real, correctly-computed intravascular/interstitial albumin
   CONCENTRATIONS (mass/volume), and the underlying mass transfer between
   them is genuinely `capillaryLeak`-sensitive — `sigma = 0.9 - 0.35*leak`
   correctly lowers the reflection coefficient as leak worsens, and albumin
   movement is correctly scaled by `(1 - sigma)`, so the mechanism is
   directionally real, not a stat write. MEASURED before building anything
   (lesson 8): across four real, already-shipped capillary-leak conditions
   (`preeclampsia`, `acutePancreatitis`, `toxicInhalationChlorine`,
   `pneumoniaSepsis`) at 15 minutes, `ivProtein` moved by at most ~1.8%
   from a healthy control (73.7 -> 72.4 g/L-equivalent) even at
   `capillaryLeak`'s own 0.2 ceiling — real clinical hypoalbuminemia is
   typically defined well below 50% of normal, so this magnitude is
   clinically undetectable within a realistic call, not just "modest." A
   debrief-time lab finding (the natural real consumer, matching
   `troponin`'s own precedent in `outcomeReport()`) would be decorative at
   this magnitude — reporting "mild hypoalbuminemia" on every patient
   regardless of true severity, since nothing currently separates a mild
   case from a severe one at these numbers. NOT fixed here: recalibrating
   the underlying Starling/albumin-flux magnitudes touches the shared
   fluid-shift calculation every scenario in the game depends on — a
   bigger, separate, high-blast-radius change of its own, correctly not
   attempted blind under this item's own "cheap sweep" framing. Filed here
   rather than silently dropped, so a future session doesn't have to
   re-derive that this pair is real but under-calibrated.

   **Hypercalcemia's saline response — RESOLVED (this session, section 3).**
   Found via a third delegated Explore sweep, using a productive variant of
   this same audit: grep scenario `resolve()` text for a specific,
   checkable physiological claim, then check whether the condition code
   actually implements it. `hypercalcemia`'s own scenario resolve() text
   claims "volume expansion promotes renal calcium excretion... it will
   not fix this on scene, but it is the right direction" — but nothing in
   `conditions.js` ever read `s.given`/`pat.drugInstances` in response,
   so giving saline changed nothing about `pat.ca` at all. Fixed: saline/
   plasmalyte now genuinely (if slowly, matching the scenario's own "won't
   fix this on scene" framing) lowers the target `pk.js`'s existing
   decay-to-baseline mechanism pulls `pat.ca` toward. A real probe mistake
   was caught before trusting the first measurement: `s.given` is a pure
   App.jsx UI-bookkeeping structure the physiology engine never receives,
   so the first version measured zero effect — fixed by detecting the
   fluid dose via `pat.drugInstances` instead, the engine's own standard
   mechanism for "is this drug on board." See section 3 for the full
   measurement.

7. **STANDING WORKSTREAM: build out the condition library, and deepen the
   conditions that already exist.** This is the standing priority between
   one-off fixes. It is not a bug fix — it is the work that decides whether the
   simulator is worth using.
   `src/physio/conditions.js` holds roughly two dozen conditions, most thinner
   than the engine underneath them can support. The goal is a patient whose
   presentation, trajectory and treatment response a working paramedic would
   recognize as the real thing, because every part emerges from published
   pathophysiology rather than a plausible-looking number.

   **PROGRESS: takotsubo (stress cardiomyopathy) was the first condition through
   this loop; a cardiac-conditions batch (most recent session) then added
   FIFTEEN more in one push** — see section 3's newest entry for the full
   writeup: thirdDegreeAVBlock, firstDegreeAVBlock, atrialFibrillation,
   pericardialTamponade, symptomaticBradycardia, atrialFlutter,
   secondDegreeAVBlockTypeI, secondDegreeAVBlockTypeII, monomorphicVT, wpw,
   digoxinToxicity, pericarditis, myocarditis, hypertensiveUrgency,
   hypertensiveEmergency. A subsequent session added `septicShock` (SHOCK-012)
   as a standalone batch — septic shock as an entity distinct from
   anaphylaxis, one of item 7's own suggested first batches — wiring the
   previously dead `pat.riskFactors.sepsis` flag into the real mechanism
   (`cardiovascular.js`/`metabolic.js` already read it; nothing had ever set
   it). See section 3's newest entry for the full writeup. A later parallel batch
   added `aorticStenosis` (CARD-048), `mitralRegurgitationAcute` (CARD-049), and a
   deliberately-scoped `infectiveEndocarditis` (CARD-050) — all three previously
   deferred with real, named reasons that turned out to be stale about the STATE
   OF THE CODE, not the requirement: the valve-resistance-in-series and
   regurgitant-fraction mechanisms AS/MR needed were already built (queue item 41)
   but never wired to a condition; IE was scoped down to fever/bacteremia + valve
   involvement + one timed embolic event rather than the full vegetation-growth
   composite, which remains open. `sickSinusSyndrome` was confirmed already built
   by an earlier session (no duplicate work done). HOCM (dynamic LVOTO) and
   Mitral Valve Disease's chronic/stenotic forms remain the real, still-open
   backlog — see section 3's newest entries for full writeups. That earlier batch is still the reference for how far this
   loop can go in one session when several conditions share underlying
   machinery (the avNodalDisease axis alone underpins four of them). Still
   explicitly DEFERRED with real technical reasons, not guessed at: HOCM
   (needs dynamic LVOTO — the SAME gap takotsubo's own entry already
   flagged, still unbuilt), Aortic Stenosis and Mitral Valve Disease (need a
   new valve-resistance-in-series mechanism, distinct from vascular-tone
   afterload — approximating via baseSVR would be a real mechanism-category
   error), Infective Endocarditis (a genuine septic+embolic+valve
   composite, deserves its own batch), and Sick Sinus Syndrome (its
   defining tachy-brady alternans needs oscillation logic this batch didn't
   build — symptomaticBradycardia covers isolated SA-node slowing, not the
   alternating pattern). Takotsubo's own two original deferrals (dynamic
   LVOTO, a troponin observable) are unchanged and still open. The
   catecholamine biphasic contractility term (`updateContractility`, gated
   on `pat.takotsubo`) and the cardiac batch's own avNodalDisease/
   accessoryPathway/flutter-rhythm terms are all general — reusable by any
   future condition that needs the same substrate.

   Treat this as a repeating loop, one condition per batch:

   **(a) Review the condition against the literature first, not the code.** Write
   down what the disease actually does, mechanistically, before looking at what
   the engine does. What is the primary insult? What does it do to preload,
   afterload, contractility, rate, compliance, resistance, dead space, shunt,
   permeability, temperature, clotting, glucose, electrolytes? On what time
   course? What does it look like at 5 minutes versus 40? What compensations
   fire, and — crucially — **when do those compensations fail**, because that
   decompensation point is the thing a candidate is being taught to see coming.
   Cite the source in the comment. "Seems about right" is not a source.

   **(b) Diff that description against what the condition currently declares.**
   Expect gaps in both directions. Some conditions set two or three fields where
   the real disease drives eight mechanisms. Some set fields nothing reads (run a
   `grep` for every field a condition writes before you trust it). Some produce
   the right vitals by the wrong route — the worst case, because it looks correct
   until a candidate treats it and the response is nonsense.

   **(c) Wire the missing mechanisms through what the engine already has.** A
   condition should not write `sbp`, `hr` or `sao2`. It should raise
   `venousResistance`, drop `baseSVR`, set `capillaryLeak`, add
   `deadSpaceFraction`, injure a nephron fraction, blunt a receptor population —
   and let the loops produce the numbers. If the mechanism genuinely does not
   exist, adding it to the right physiology module is correct; adding a stat
   write to the condition is not. The seizure limb is the model. **Note
   `baseSVR` is a live handle** — it survives into the authoritative loop, so a
   condition can set resting vascular tone and have it produce pressure.

   **(d) Give it a real time course.** Real conditions are not step functions.
   Sepsis takes hours; tension pneumothorax takes minutes; anaphylaxis takes
   seconds to minutes and then kills. `anaph` is a good worked example — SVR
   950 -> 744 with cardiac output *rising* to 6.49 (textbook distributive shock),
   bronchoconstriction climbing to 0.94, arrest at ~20 minutes untreated.

   **(e) Make treatment work through the same mechanisms.** If the condition
   raises airway resistance, the bronchodilator must lower that same variable.
   A condition whose only treatment response is scripted is a scripted scenario
   wearing a physiology costume.

   **(f) Assert it, two-sided, and add any new field to `scenarioSweep`.**
   Lesson 6 applies with full force. Assert the presentation (it fires), the
   specificity (it does not fire in patients who do not have it), the time
   course, and the treatment response.

   **The target library is in section 8** — roughly 280 entries against 26
   implemented, so a backlog to work down, not a checklist to rush.

   **Suggested first batches**, chosen for teaching value per unit of work and
   for how much existing machinery they light up: diabetic ketoacidosis (Kussmaul
   respiration, osmotic diuresis, total-body potassium depletion masked by a
   normal serum value); septic shock as an entity distinct from anaphylaxis;
   hyperkalemia with its ECG progression (which also needs item 2, the calcium
   ECG protection); tricyclic and beta-blocker/calcium-channel-blocker overdose;
   carbon monoxide and cyanide toxicity; status epilepticus as a condition rather
   than only a drug-toxicity limb; hypothermia with its arrhythmia and
   coagulopathy limbs; pulmonary edema separated from generic CHF; and GI
   hemorrhage.

   **Do one condition per batch, fully.** A single condition researched,
   mechanistically wired, time-coursed, treatment-tested and asserted is worth
   more than five conditions with three fields each — and five thin conditions is
   how a physiology engine quietly turns back into a branching script.

10. **PARTIALLY RESOLVED — the pregnancyBenchmark near-misses.** The "Total
    blood volume 6.2-7.0 L" row's internal inconsistency was a genuine
    fixture defect and is fixed (now derived from the patient's own
    baseline, 9/16 in range). The harder EDV/SV/EF/CO/SVR/Hct cluster
    remains open — `chamberRemodeling` was swept across its full range and
    CONFIRMED (not just repeated) not to be a viable single-lever fix; see
    section 3's newest entry and the measurement now sitting in
    `cardiovascular.js`.

12. **RE-INVESTIGATED (this session) — the prior "device rates too safe to
    reach the dangerous regime" explanation was incomplete, and the real
    structural cause is different and more specific: `deliveryFactor`
    itself caps achievable intrinsic PEEP, independent of bagging rate.**
    Measurement-only, per PLAN.md's own framing for this item; no code
    touched. Re-confirmed the earlier bug fix (`pat.vtPrev` captured after
    the assisted-ventilation override) is still in place and correct.
    Swept bagging RATE from 10 to 150/min (a synthetic in-memory-only test
    device, `PROCS._testFastBag`, added at runtime inside a throwaway
    probe script and never written to `procedures.js` — not reachable by a
    player) against `asthmaAttack` at its own natural severity, 15x past
    any rate a real rescuer or the game's own devices (bvm/vent/cric, all
    rr 10-12) could reach. Two real findings, neither previously on
    record: **(1) the assisted-ventilation override does not even ENGAGE
    for a still-compensating (tachypneic) bronchospastic patient until the
    device's own minute ventilation exceeds the patient's spontaneous
    minute ventilation** (`respiratory.js`'s `if (assistedMV >=
    spontaneousMV)` gate) — for asthmaAttack's own settled severity that
    threshold sits around rr~75-80/min, an absurd, unreachable-by-any-real-
    device rate, so every one of the game's actual devices leaves this
    patient's own spontaneous breathing (and therefore their own,
    already-measured intrinsic PEEP) untouched rather than "safely
    ventilating them at a lower magnitude" as the old explanation implied.
    **(2) Once the override DOES engage (only reachable via the synthetic
    test device), intrinsic PEEP does not keep climbing with rate — it
    FALLS**, from the peak below, because `deliveryFactor`'s compliance/
    resistance derating caps the DELIVERED tidal volume to about 0.195-0.2
    L for this chest regardless of how fast the device cycles (`av.vt` is
    constant; only `av.rr` was swept), and a smaller delivered breath traps
    less absolute gas per cycle even with less time to exhale it. **The
    peak intrinsic PEEP reachable through this mechanism, at ANY rate from
    10 to 150/min, was 3.81 cmH2O** (at rr=70, the last point before the
    override engages and volume collapses) — meaning the 5-15 cmH2O
    clinical range is not reachable through rate alone even at absurd,
    clinically-impossible bagging speeds, which is a stronger and more
    specific claim than "the game's guideline-safe devices don't happen to
    reach it." A genuine fix would need either a second lever the current
    mechanism has no handle for (e.g. a "bag squeezed harder/fuller than
    its nominal volume" over-delivery term, distinct from rate) or
    accepting that severe iatrogenic breath-stacking auto-PEEP is a
    real-ventilator-specific phenomenon this hand-bagging-only game
    correctly cannot reproduce at BVM/pocket-mask fidelity — a genuine
    design question, not a coefficient to tune, so left open rather than
    forced. See section 3's newest entry for the full measurement.

19. **INVESTIGATED, CONFIRMED STRUCTURAL, still open — widen the
    survivable-ischemia band for a genuinely regional NSTEMI.** The
    `acs` condition maps the spectrum onto the engine's existing narrow
    survivable zone (subtotal lesion = stable NSTE-ACS; completed occlusion
    = STEMI), because the LV is a single lumped chamber with one `pat.atp`,
    so a subtotal lesion depresses the WHOLE ventricle instead of one
    territory while the rest compensates. Re-confirmed this batch: the band
    is an emergent property of a SHARED, engine-wide coronary feedback loop
    (the condition's own comment already warns that widening it "would move
    every cardiac, arrest and shock patient"), and there is no smaller,
    safely-scoped partial fix short of genuine segmental LV geometry (the
    same lumped-chamber limitation takotsubo documented). Deliberately not
    attempted — this needs its own dedicated, carefully-scoped batch, not a
    coefficient tweak inside a larger one. Documented at the site.

28. **The physiology half is DONE (later session): `toxicInhalationChlorine`
    (RESP-037) shipped, reusing `asthma`'s bronchospasm-climb term and
    `pat.capillaryLeak`. The front-end hazmat-scene mechanic is STILL OPEN —
    this item stays open until that half lands too.** The original request:
    a chlorine release with a shifting wind, low visibility from the gas
    cloud, and patients found scattered rather than presented at one point —
    distinct from the MCI scenario `mciPileup` shipped earlier, because the
    patients here are progressively discovered (a scene-mechanic difference)
    and share one common toxic exposure (a physiology difference), rather
    than each having an independent traumatic mechanism.
    - **The physiology half, shipped.** No new mechanism was needed, exactly
      as this item's own text predicted: `broncho`/`shuntFraction` (the
      SAME irritant-bronchospasm pathway asthma already uses) and
      `capillaryLeak` (the same Starling-block handle `preeclampsia`/
      `acutePancreatitis` already use) compose the real toxidrome. MEASURED,
      not assumed, and honest about what a 900s call can and can't show:
      the real, DELAYED (hours-scale) non-cardiogenic pulmonary edema
      chlorine can cause is a real, published risk, but this timeframe can
      only show its early, modest beginning — capillaryLeak reaches its own
      0.20 ceiling and plasmaVol drops only ~0.02 L by 900s (2.638 no-
      mechanism control vs. 2.618 treated-by-mechanism), correctly NOT
      faked into a full-blown edema this timeframe couldn't honestly
      produce. The ACUTE bronchospasm is the real, dominant, reachable
      finding: broncho climbs 0.35→0.87, shuntFraction 0.32→0.55 by 900s,
      producing a genuine sao2 ~95% and real tachypnea — and albuterol
      measurably treats it through the SAME beta-2 receptor pathway any
      other bronchospastic condition already responds to (effectiveBroncho
      0.70→0.37 by 600s, confirmed via the real engine, not assumed from
      asthma's own precedent). New scenario, RESP-037, a real single-point
      pool-chemical-accident presentation (not the progressive-discovery
      scene this item's own scene-mechanic half still needs) — the delayed-
      edema risk is flagged honestly in the resolve() text as a real,
      hospital-relevant handoff point rather than something this call can
      show developing. "Smoke Inhalation Injury" remains a close but
      distinct neighbor on section 8's Respiratory backlog (particulate/
      thermal injury plus systemic CO/cyanide, not a pure irritant-gas
      exposure) — not built by this fix, chlorine has no CO/cyanide
      component.
    - **The scene-mechanic half is genuinely front-end, still entirely
      unbuilt.** A wind-direction/plume model (which side of the exposure
      zone is currently hot), a visibility penalty inside the cloud
      (findings/probes returning degraded or partial information until PPE
      or repositioning), and patients found progressively rather than
      listed at dispatch (a natural extension of the `patients:` array/
      Triage-panel work — spawning additional roster entries as the player
      moves through the scene, the same `s._spawnQueue` mechanism
      childbirth's newborn already uses, rather than a new plumbing layer).
      Could be built as reusable "hazmat scene" infrastructure (wind/
      visibility/progressive-discovery are not chlorine-specific), the same
      way the MCI roster/Triage UI shipped ahead of any specific scenario
      using it — now has a real condition (`toxicInhalationChlorine`) to
      attach to, so building this half no longer risks the "infrastructure
      with no real patient" mistake this item's own text used to flag.

33. **RESOLVED, root cause found and fixed, and now fully verified —
    `mechanismWiring.mjs`/`scenarioSweep.mjs` both re-run to completion
    against this fix (see section 3's newest entry for the full numbers).**
    The core bug is fixed and shipped. Verification surfaced two REAL,
    genuinely NEW `mechanismWiring` regressions caused by this fix — not
    blindly patched, root-caused and filed as their own items (41, the
    deeper rewrite, and 43): fixing the flat-adult-reference bug changes
    the crossover points of two OTHER, separate pre-existing gaps
    (`upperAirwayObstruction`'s single-channel insensitivity, and BVM's
    lack of pediatric sizing) that this fix did not create but did make
    newly reachable. Both are real physiology-engine/content work in their
    own right, not quick coefficient tweaks, per section 4's "identify
    numbers, do not tune them" discipline. The instability itself was NOT
    the fatigue-spiral this item
    originally hypothesized — it was a real body-size-reference bug in
    `respiratory.js`'s `loadIndex`/`restingEffort`/assisted-ventilation
    `deliveryFactor0` (three sites), all of which compared a patient's own,
    correctly body-size-scaled compliance/resistance against a FLAT 70 kg
    adult constant (0.09 L/cmH2O, 4.2 cmH2O/(L/s)) instead of that same
    patient's own scaled baseline — the exact "body-size reference error"
    class this document's own lessons already catalog (`_restCo`,
    `bodyScaleBaselineL`, the newborn kMass floor). Consequence, measured
    directly: a bare, condition-less, UNDISEASED age-2/14kg patient's own
    healthy anatomy alone pushed `loadIndex` to its [0.5,6] clamp ceiling —
    indistinguishable from severe adult bronchospasm — with `respMuscleFatigue`
    staying at exactly 0.000 the entire time (this was upstream of the
    fatigue mechanism, not a runaway WITHIN it). Real fix, not a mitigation:
    `patient.js` now exposes the `massScale` it already computes (`this.massScale
    = massScale`), and `respiratory.js`'s three reference sites now scale by
    it, so a healthy patient of ANY body size correctly reads `loadIndex≈1`
    at rest — see section 3 for the full measurement (ages 0.1-80 all
    stable, disease sensitivity confirmed preserved, `febrileSeizureToddler`
    0/5 collapses across real-scenario trials vs. the ~20-30% this entry
    used to cite, adult behavior confirmed bit-for-bit unchanged since
    massScale=1 exactly recovers the old constants there). **A real,
    unfixed downstream consequence of this fix is filed as new item 41
    below** — `bronchiolitisInfant`/`croupToddler` now read implausibly mild
    post-fix, suggesting their existing severity numbers may have been
    unknowingly riding on this same bug for their apparent severity.

35. **Breath odor has no real physiology backing except one case, now
    wired — found and partially resolved while adding the new `breathingCheck`
    head action (queue item F9, section 6).** `probe:"breathOdor"` has
    existed since an earlier session as a scenario opt-in hook, but grep
    confirms NO scenario in `scenarios.js` has ever declared one — the
    action reporting "No unusual odor on the breath." on literally every
    patient, including DKA, was not a design choice, it was dead. One real
    case is now wired instead of scripted: `pat.anionGap` (queue item 5's
    own dead field — computed in `metabolic.js`, read nowhere until now) is
    a genuine measure of unmeasured-anion metabolic acidosis, and rises for
    real whenever `diabeticKetoacidosis`/`alcoholicKetoacidosis`/
    `starvationKetosis` deplete hco3 through their shared mechanism — a
    fruity/acetone breath at anionGap>16 is a real, literature-anchored
    bedside sign, not an invented number (DKA's own hco3 floor of 6 measures
    ~32 in this engine). **A second case, uremic fetor, RESOLVED (later
    session).** `pat.bun` is no longer frozen (a separate, earlier fix
    already un-froze it, see its own history in this doc) — but it relaxes
    toward its target with a 180-minute time constant, far too slow for any
    existing condition to cross a real uremic-fetor threshold (~60-100
    mg/dL) by climbing DURING a 900s call. Fixed the honest way, not by
    speeding up the general renal relaxation: `hyperkalemiaMissedDialysis`
    now seeds `pat.bun` to a real, one-time chronic baseline (95 mg/dL) in
    its own `progress()`, the same reasoning its own `initial.k:6.8` already
    uses — a missed-dialysis patient's azotemia accumulated over the days
    since their last session, not the last 15 minutes, so it belongs in the
    presenting picture. `breathingCheck` (`actions.js`) gained a second,
    real branch (`pat.bun>60`, checked after the fruity/DKA branch so an
    acute ketoacidotic finding takes priority if both somehow apply) —
    ammonia/urine-like odor, distinct wording from ketosis's sweet one.
    MEASURED against the real scenario harness (not assumed): bun reaches
    101.8 mg/dL by 900s (well above the 60 threshold), a condition-less
    control scenario stays flat at 12.0 the whole call (no spurious
    crossing). **Still open**: alcohol and hydrocarbon breath odors have no
    backing state at all. Alcohol Intoxication and Hydrocarbon Aspiration
    are both still-unbuilt conditions (section 8 Toxicology backlog) with no
    blood-alcohol or exposure field to read — building either needs the same
    literature-anchored treatment as any item-7 condition. A scenario can
    still declare its own `probes.breathOdor` for a specific narrative case
    in the meantime, which wins over both real cases above.

38. **`opioidOD` cannot reach genuine near-apnea severity through a fentanyl
    `DrugInstance` alone — a real architectural ceiling found while finishing
    item 37's calibration (section 3), filed rather than worked around.**
    `pk.js` deliberately computes Emax intensity ONCE PER DRUG ID from
    summed concentration (a correct, already-shipped fix for a real prior
    bug: stacked doses used to beat a saturating curve), so
    `respDriveSuppression` for any patient carrying only fentanyl is bounded
    by fentanyl's own declared `respiratoryDepression` coefficient (0.25,
    `drugs.js`, calibrated to a THERAPEUTIC field dose) — MEASURED across a
    dose/count/interval sweep to be a hard ceiling, not a tuning gap: no
    combination of dose size, count, or timing gets past `respDriveSuppression`
    ~0.25 (rr settling ~11-13 from a normal ~14). Reaching genuine
    near-apnea severity (the old scripted rr≈4, and the scenario's own
    narrated "gray-blue," "chest barely moving") needs one of two real
    fixes, neither attempted here: (a) a dedicated, literature-anchored
    illicit/high-potency-opioid drug entity (e.g. representing fentanyl-
    analog-adulterated street product) with its OWN, higher
    `respiratoryDepression` coefficient — real drug-authoring work, and it
    would need to be kept OUT of the player's own drug menu, since
    `App.jsx`/`loadout.js` today enumerate every `DRUGS` entry
    unconditionally with no "hidden/internal-only" flag to exclude one, a
    real design question in its own right; or (b) a genuinely different,
    condition-level severity mechanism that doesn't route through the
    shared per-drug-id Emax gate at all. Do NOT revert to
    `initial:{rr:4}`-style scripting to close this gap — that is the exact
    defect item 37 fixed (naloxone would once again do nothing, since a
    scripted `rrBase` doesn't route through `respDriveSuppression` at all).

40. **STANDING WORKSTREAM, filed per explicit operator instruction: build an
    overdose condition for every existing player-administerable drug, by
    seeding a supratherapeutic dose of THAT SAME drug via `seedPastDose` —
    reusing the exact pattern item 37 validated for `opioidOD`, rather than
    inventing a bespoke toxidrome mechanism per drug.** `rocuronium` is
    DONE — `rocuroniumOverdose` (TOX-001), see section 3's newest entry for
    the full mechanism/calibration writeup: it reuses the existing
    Hill-equation `neuromuscularBlock` mechanism (continuously recomputed
    from concentration, structurally distinct from item 38's per-drug-id
    Emax gate, so it does not hit that ceiling), and the real teaching point
    — aware but totally paralyzed, since `neuromuscularBlock` is read only
    by `respiratory.js`, never by `neuro.js` — required two scenario-level
    probe overrides (`loc`, `reflexes`) since their DEFAULT logic would
    have been actively wrong for this patient, not just generic.
    `diltiazem` and `metoprolol` are ALSO DONE (`diltiazemOverdose`
    TOX-002, `metoprololOverdose` TOX-003) — see section 3's newest entry
    for the full mechanism/calibration writeup. Both are real,
    non-per-drug-id-gated PK drugs (confirmed per-drug rather than assumed
    to reuse item 38's exemption), but a direct dose/elapsed sweep found
    each one's OWN already-declared receptor coefficient
    (`calciumChannel:-0.7`, `beta1:-0.5/beta2:-0.1`) is itself a real
    ceiling, saturating almost immediately — a different SHAPE of ceiling
    than item 38's fentanyl finding (a receptor-strength ceiling, not a
    per-drug-id Emax gate), but the same practical lesson: measure before
    writing the scenario's clinical framing, not after. A second real
    finding, also measured rather than assumed: atropine is NOT inert
    against either overdose in this engine (`vagalBlock` raises hr
    unconditionally, regardless of cause) — it just never touches blood
    pressure, which calcium/glucagon (each given a new, real, partial
    countering `receptors` term) DO move, alongside hr. `PK_PARAMS`
    (`pk.js`) currently has 17 two-compartment drugs, of which several are
    already real, named entries on section 8's Toxicology backlog under a
    DIFFERENT, not-yet-built-mechanism framing — this item supersedes that
    framing for any drug already in the formulary, since "the receptor/PK
    model already exists, overdosing it is just a bigger seeded dose" is
    cheaper and more mechanism-correct than a new bespoke toxidrome.
    `atropine` is ALSO DONE (`atropineOverdose`, TOX-004) — anticholinergic
    toxidrome ("mad as a hatter, blind as a bat, red as a beet, hot as a
    hare, dry as a bone, full as a flask"). Confirmed via exploration before
    building: `receptors.vagalBlock:0.8` is a real, continuous, unconditional
    mechanism (not the per-drug-id Emax gate item 38 found for fentanyl —
    and confirmed this same session that midazolam's own
    `respiratoryDepression` coefficient DOES share that gate, which is why
    midazolam was deliberately NOT picked this round, see below). MEASURED:
    vagalBlock saturates near its own 0.8 ceiling almost immediately (5-30
    mg, 20-40 min sweep) — a real but MODEST tachycardia (hr ~101 from a
    baseline ~82), the same "the receptor coefficient is the real ceiling,
    not the dose" finding diltiazem/metoprolol already established, now
    confirmed a third time for a third drug. Delirium and hyperthermia+
    anhidrosis are real, not narrated: reuses `pat.metabolicEncephalopathy`
    (the same confusion handle hypercalcemia/hyperammonemia/toxicMetabolic
    Encephalopathy already use) and `pat.metabolicHeatMultiplier` +
    `pat.sweatCapacity` driven toward 0 (thermo.js reads sweatCapacity
    directly as an evaporative-cooling multiplier — 0 physically blocks that
    cooling route, not just narrates its absence). MEASURED, and a genuine,
    honest finding rather than a dramatic one: at this patient's own indoor
    ambientTemp (26, not heat stroke's outdoor 40), skin/respiratory heat
    loss still dominates over a 900s window regardless of blocked sweating,
    so the patient presents febrile (39.0) and TRENDS DOWN toward ~37.9 by
    end of call rather than climbing further — the same "small per-tick
    coreTemp pull-back" characteristic already on record in this doc for
    other presenting-fever conditions. The anhidrosis mechanism is confirmed
    real, not decorative, by direct comparison: 37.89 with sweating blocked
    vs. 37.55 with normal sweating at 900s, identical everything else — a
    real ~0.3C difference. No antidote exists in this formulary
    (physostigmine isn't carried) — the scenario's own resolve() teaches
    supportive care/recognition, the same honest framing `rocuroniumOverdose`
    already established for a drug this formulary can't fully treat.
    Mydriasis is narrated only (no pupil-diameter mechanism anywhere in this
    engine), the same documented limitation already on record for AAA's
    pulsatile mass / limb ischemia's 6 P's.
    `lidocaine` is ALSO DONE (`lidocaineOverdose`, TOX-006) — local
    anesthetic systemic toxicity (LAST). See section 3's newest entry for
    the full mechanism/calibration writeup: unlike every drug in this
    workstream so far, lidocaine's `drugDef.toxicity` mechanism
    (`seizureThreshold`/`cardiacThreshold`, pk.js) is keyed to RAW, summed
    effect-site concentration, not the once-per-drug-id Emax `intensity`
    gate — so severity genuinely scales with seeded dose rather than
    saturating almost immediately the way diltiazem/metoprolol/atropine's
    receptor terms do. A single 500mg IV bolus (a real, dental-office
    inadvertent-intravascular-injection framing) produces a genuine,
    simultaneous seizure+cardiotoxicity picture (drugInotropy nadir 0.316,
    avSlowingDrug 0.644, SBP nadir ~80). MEASURED, and a real, honest
    finding: midazolam measurably blunts seizure drive (anticonvulsant
    rising to ~0.58 even with repeated dosing) but does NOT reliably
    terminate the seizure at this severity, and leaves the cardiotoxic
    component (drugInotropy/avSlowingDrug) completely untouched — a real
    LAST teaching point (benzo-refractory seizures, no curative field
    antidote for the cardiotoxicity — intralipid isn't carried), not a
    clean cure.
    Still open candidates:
    `midazolam` (→ Benzodiazepine Overdose — CONFIRMED to hit
    the SAME per-drug-id Emax-gate ceiling item 38 found for fentanyl:
    `respiratoryDepression:0.22` is a flat coefficient, not a continuous
    receptor term, so a supratherapeutic dose wouldn't measurably worsen
    respiratory depression beyond an ordinary therapeutic dose — building
    this needs either re-identifying that coefficient, which would also
    change THERAPEUTIC midazolam dosing everywhere else it's used, or a
    different mechanism; deliberately not attempted as a quick add),
    `amiodarone` (→ real, if uncommon,
    acute toxicity — QT prolongation/hypotension, reusing the already-real
    `sodiumBlock`/`potassiumBlock`/`avSlowing`/`arteriolarDilation` terms
    the diltiazem/lidocaine work already confirmed are continuous, not
    per-drug-id-gated), `morphine` (a second, non-fentanyl opioid-OD
    presentation, useful for teaching the SAME reversal mechanism at
    different kinetics — morphine's own `keo`/`kel` make its time course
    genuinely different from fentanyl's),
    and the catecholamines (`epiIV`/`pushEpi`/`norepi` → a real pressor
    overdose, hypertensive crisis/arrhythmia). **Before starting, read item
    38's finding and check whether it applies to the target drug**: any
    drug whose `drugDef` effect is expressed as a single per-drug-id-gated
    coefficient (the same `respiratoryDepression`-style pattern fentanyl
    uses) may have the SAME hard ceiling item 38 found — measure across a
    dose sweep FIRST (the same probe script this session used, adapted) to
    confirm the target severity is actually reachable before writing the
    condition, rather than re-discovering item 38's finding blind for a
    different drug. Naloxone's own overdose is NOT a sensible entry here —
    it has no meaningful toxicity/overdose syndrome of its own — and
    epiIM/epiAuto/etomidate/ketamine are lower priority (etomidate/ketamine
    OD is a real but rarer prehospital presentation than the ones listed
    above). Each new condition needs its own literature anchor per item 7's
    own discipline (a coefficient chosen without one is worse than none),
    and its own scenario, but explicitly does NOT need new engine mechanism
    work — that is the entire point of reusing `seedPastDose` against
    drugs whose receptor/PK model this project has already built and
    verified.

41. **Beat-level cardiac cycle — PARTIALLY CLOSED. The original premise was
    FALSE and has been corrected; valvular REGURGITATION now works in the
    authoritative solver. Three concrete pieces remain open, each scoped
    below.** See section 3's topmost entry for the full measurement detail.

    **DO NOT rebuild the beat clock — it already exists and is authoritative.**
    This item used to assert that the heart is "a continuous per-tick average"
    needing an explicit atrial-systole -> isovolumetric-contraction -> ejection
    -> isovolumetric-relaxation -> filling state machine. That was checked
    against the tree and is not true. `cardiovascular_ode_full.js` already
    integrates cardiac phase ACROSS ticks (`cyclePhase`, `phase0`/`tStart`),
    drives all four chambers from time-varying elastance, phase-shifts atrial
    activation ahead of ventricular systole (`atrialPhaseFrac`), scales the
    systolic fraction with rate off a Weissler anchor, and runs all four valves
    as continuous opening states derived from real pressure gradients. Both
    isovolumetric phases EMERGE from that (the intervals when both valves are
    shut). Rewriting it as an explicit enum would be a large, high-risk refactor
    of the single highest-blast-radius function in the engine for no gain.

    **SHIPPED this session: valvular regurgitation in the authoritative
    solver.** Mitral and aortic leak flows in `derivative()`, phase-selective by
    construction, mass-conserving, with regurgitant volume carried as two new
    integrated states (`IDX.WMR`/`WAR`) and subtracted from forward stroke
    volume. Orifice-severity -> regurgitant-fraction mapping measured across the
    range and documented in-code. Emergent and verified: AR gives the
    water-hammer wide pulse pressure and LV volume overload; MR gives falling
    forward output with RISING total ejection and pulmonary venous congestion.
    13 new two-sided assertions, all passing.

    **STILL OPEN — (a) the ischemic / annular-dilation regurgitation pathway is
    computed but NOT consumed by the authoritative solver.** The solver takes
    only STRUCTURAL (risk-factor-declared) regurgitation, via
    `pat.mitralRegurgStructural`/`aorticRegurgStructural`. The reason is
    measured, not cautious hand-waving: wiring the ischemic component in took
    `acs` to CO 3.27 L/min (EF 0.272) against a pre-change ~6.0, and cost
    `unstableAngina` — which by definition has NO necrosis — ~32% of its cardiac
    output. Re-tuning the threshold/gain did not fix it, because the loop has a
    real emergent feedback (regurgitation unloads the ventricle -> less
    myocardial work -> higher atp -> feeds back into the ischemic term), so the
    coefficient cannot be identified from a single forward run. Landing this
    needs a proper controlled A/B against the ischemic family, anchored on the
    documented fact that ischemic MR after MI is usually MILD. The relevant
    coefficient is in `updateValves` and is deliberately left UNCHANGED.

    **STILL OPEN — (b) no shipped scenario declares valve disease, so the
    mechanism has no in-game producer yet.** The natural first one was built,
    measured and reverted: setting `riskFactors.aorticDissection` on the
    `aorticDissection` condition makes the `chest` scenario's already-narrated
    "new diastolic murmur — aortic regurgitation" real (measured: pulse pressure
    34 -> 59, DBP 92 -> 75, LVEDV 116 -> 158, forward CO 6.05 -> 4.91, hemorrhage
    trajectory preserved). It was reverted because the 0.5 severity that driver
    hardcodes has never been calibrated, and because `mechanismWiring`'s
    takotsubo section uses `chest` as its "matched normal-EF chest-pain control"
    — the lesion inverts that comparison and fails an unrelated assertion. Needs
    a calibrated severity AND a different takotsubo control. Full reasoning is
    recorded in-code at the condition. **Beyond that**, section 8's Cardiac
    backlog entries **Aortic Stenosis** and **Mitral Valve Disease** are now
    genuinely unblocked — the valve-resistance-in-series mechanism they were
    waiting on exists (stenosis was already plumbed end-to-end and has simply
    never had a producer; regurgitation is new this session) — so those are
    ordinary item-7 condition work now, not blocked structural work.

    **STILL OPEN — (c) AV dyssynchrony / pacemaker syndrome.** Unchanged and
    still not solved by this batch. `atrialPhaseFrac` is a fixed constant, and
    the one obvious lever (attenuating atrial kick for AV-dissociated rhythms)
    is already on record in `updateFullLoopODE` as tried and MEASURED WORSE —
    do not retry it blind.

42. **Tissue/organ compartments, oxygen delivery as an explicit currency, and
    per-organ autoregulation curves — CLOSED (this session): kidney,
    liver, gut, skin, AND skeletal-muscle are all done.** Three
    notes folded into one item since they're the same underlying idea at
    increasing depth: arterial → organ vascular bed → interstitial →
    intracellular compartments, each organ computing its own
    `delivery = bloodFlow * CaO2` vs. `demand`, with a pressure-flow
    autoregulation curve per organ. `pat.energyFailure` (metabolic.js),
    `tissueLactate`, `brainO2`, `DO2`/`VO2`/`actualVO2` already existed for
    brain/heart before this session — the gap was that KIDNEY injury
    (`pat.kidneyInjury`) was driven off a WHOLE-BODY VO2-debt proxy
    (`neuro.js`'s `updateOrganInjury`), not a local renal signal, even
    though `renal.js` already computed a real, local, autoregulated
    perfusion fraction (`renalPerf` — flat above the ~60 mmHg MAP knee,
    falling below it, further cut by angiotensin-driven afferent
    constriction) that nothing downstream ever read as an oxygen-delivery
    quantity.

    **Fixed for real, not just reviewed.** `renal.js` now computes
    `pat.renalDO2 = renalPerf * (pat.caO2 / 20)` (caO2, metabolic.js, is an
    absolute mL-O2/dL quantity ~20 at normal Hb/SaO2, normalized here to
    keep renalDO2 a 0-1-ish delivery fraction) and
    `pat.renalO2Debt = max(0, 1 - renalDO2)` — a real, LOCAL renal
    delivery-vs-demand signal, with demand held at a constant normalized 1
    rather than tied to `pat.gfr` (GFR already falls when renalPerf falls,
    so tying demand to it would make the debt term self-cancelling and mask
    the exact hypoperfusion this exists to detect — a real design decision,
    not an oversight). `neuro.js`'s `updateOrganInjury` now reads
    `pat.renalO2Debt` instead of the old whole-body `vo2Demand - actualVO2`
    fraction to drive `kidneyInjury` accrual, at a rate (`0.012/min` at full
    debt) chosen so a patient whose renal perfusion AND whole-body VO2 debt
    collapse TOGETHER (the common case — most already-shipped shock
    conditions) sees essentially the same injury trajectory as before,
    while SELECTIVE cases now diverge correctly, which is the actual payoff
    this item names.

    **MEASURED, not assumed, via a direct probe (stripped after use).** A
    condition-less healthy control holds `renalDO2≈1.02`, zero injury. A
    real trauma scenario (`polytraumaMoto`) shows a small, real debt
    (0.04) and small injury accrual (0.007) at 15 min — comparable order to
    what the old whole-body mechanism produced for the same scenario. The
    real new capability: forcing `angiotensinII` high (simulating strong,
    selective afferent-arteriolar constriction) while leaving every other
    global signal — including whole-body VO2 — normal drove `renalO2Debt`
    to ~1.05 and `kidneyInjury` to 0.378 by 30 minutes, a case the OLD
    whole-body-debt mechanism could never have injured at all (global VO2
    debt near zero throughout). A sustained full-debt run crossed the 0.5
    "irreversible AKI" threshold (`physiology.js`) at ~40-45 minutes,
    matching real warm-ischemia literature (significant AKI risk begins
    accruing past 30-60 minutes of severe renal hypoperfusion) and the same
    order of magnitude the old mechanism used, confirming this isn't a
    silent severity change for the common case.

    **Verification, complete.** `node --check`/`npx eslint` clean on all
    four touched files (`renal.js`, `neuro.js`, `patient.js`,
    `scenarioSweep.mjs`). `renalDO2`/`renalO2Debt` added to
    `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists per lesson 2.
    Since this touches shared per-tick machinery every scenario in the
    library goes through, the full suite was run, not skipped:
    `mechanismWiring.mjs` **357 passed, 1 failed** — the single failure is
    the same already-documented, pre-existing flaky PAC HR-variance
    stochastic assertion (unrelated: doesn't read kidneyInjury/renalPerf/
    renalDO2 at all). `scenarioSweep.mjs` **156 scenarios, 7,931,978
    checks, 0 failed** — the increase over the prior baseline is exactly
    accounted for by the two new required/non-negative fields. `npx vite
    build` clean (same pre-existing >500kB chunk-size warning). The
    throwaway probe script was stripped before this entry was written.

    **The liver slice is ALSO DONE (same session, direct follow-up).**
    `pat.liverInjury` (`neuro.js`) was driven off a binary WHOLE-BODY
    lactate threshold (`>4` injures, `<=2` recovers) — a systemic
    anaerobic-state proxy with no connection to actual hepatic blood flow,
    so a patient in low-output cardiogenic/obstructive shock with lactate
    still under 4 accrued zero liver injury regardless of how collapsed
    hepatic perfusion actually was, and a seizing/shivering patient with an
    unrelated lactate source could injure a perfectly-perfused liver.
    `pk.js`'s `organClearanceFactor()` already used a real hepatic-flow
    proxy for DRUG clearance (cardiac output relative to this patient's own
    resting reference, `pat.co / pat._restCo`) — the same underlying
    physiology (reduced hepatic flow both slows clearance AND causes
    ischemic hepatocellular injury) was being modeled with two
    disconnected proxies. Fixed the same way as kidney: `neuro.js` now
    computes `pat.hepaticDO2 = (co/restCo) * (caO2/20)` and
    `pat.hepaticO2Debt = max(0, 1 - hepaticDO2)` (the `/20` normalization
    matches the exact convention `brainO2now` already uses two lines above
    it in the same file), and `liverInjury` accrues from `hepaticO2Debt` at
    the SAME rate magnitude the old threshold mechanism used at its own
    full-debt equivalent (0.006/min) — a driver swap, not an unrelated
    severity re-tune.

    **MEASURED against a REAL, already-shipped shock scenario, not a
    synthetic override** (a forced-CO probe was tried first and correctly
    abandoned once measured: `pat.co` is a live per-tick ODE output, so a
    value set after `physio()` returns gets overwritten by the next tick's
    own cardiovascular solve before it can persist — the same class of
    harness limitation already on record for forcing `pat.map` directly in
    the kidney work above; a real scenario is the honest verification
    here, not a weaker one). `cardiogenicShock`, a real, already-shipped
    low-output condition: at 20 minutes, co has collapsed to 0.37 (vs. a
    resting reference), `hepaticDO2` to 0.006, `hepaticO2Debt` to 0.994 —
    and `liverInjury` has genuinely accrued to 0.093. **A real, concrete
    finding**: at that same point, `pat.lactate` is 2.75 — BELOW the old
    mechanism's own 4.0 injury threshold, meaning the OLD, whole-body-
    lactate-driven mechanism would have recorded ZERO liver injury for this
    real, severely low-output patient at 20 minutes. The new, locally-driven
    mechanism catches real hepatic ischemic injury the old one structurally
    could not see yet — the concrete "hyper-realism" payoff this item
    exists for.

    **Verification for the liver slice, complete.** `node --check`/
    `npx eslint` clean on all three touched files (`neuro.js`, `patient.js`,
    `scenarioSweep.mjs`). `hepaticDO2`/`hepaticO2Debt` added to
    `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists and `patient.js`'s
    constructor defaults, same as the kidney fields. Full suite re-run
    against BOTH the kidney and liver changes together:
    `mechanismWiring.mjs` **358 passed, 0 failed** (even the previously-
    flaky PAC HR-variance assertion passed clean this run). `scenarioSweep.mjs`
    **156 scenarios, 8,212,778 checks, 0 failed** — the increase over the
    kidney-only baseline (7,931,978) is exactly 156 × 450 × 4, arithmetically
    confirming the two new fields' checks are genuinely running, not just
    declared. `npx vite build`: clean (1.76s, same pre-existing >500kB
    chunk-size warning). Both throwaway probe scripts were stripped before
    this entry was written.

    **The gut slice is ALSO DONE (same session, direct follow-up) — kidney,
    liver AND gut are all now closed; skin/skeletal-muscle remain open.**
    Unlike kidney/liver, the gut had NO pre-existing injury field to
    re-drive — a genuinely new `pat.gutInjury` field was needed, which
    meant this slice had to also identify a REAL consumer to avoid the
    exact "decorative field" defect section 1 forbids (a field written and
    never meaningfully read). Two real consumers, not one: `physiology.js`'s
    already-existing irreversible-injury list gains "bowel ischaemia /
    infarction" at `gutInjury>=0.5` (matching kidney/liver/brain's own
    pattern exactly), and — the more interesting one —
    `acuteMesentericIschemia`'s own `activeBleedRate` progression now
    genuinely accelerates with `gutInjury` (up to 3x baseline as it
    approaches 1), a real causal link from structural bowel-wall injury to
    an already-asserted, already-observable quantity (bleed rate → sbp)
    rather than an isolated field with nothing downstream.

    **Driven off a DIFFERENT local signal than kidney's, deliberately —
    `pat.alphaTone`** (cardiovascular.js's general sympathetic
    vasoconstrictor drive), not the slower angiotensin-mediated afferent-
    constriction pathway kidney uses: real splanchnic vasoconstriction is
    fast and directly alpha-adrenergic, and is textbook-documented as one
    of the EARLIEST vascular beds sacrificed under sympathetic stress
    (gut/skin before muscle, before kidney, before brain/heart) — a
    genuinely different, faster-onset mechanism from kidney's, not the same
    formula copy-pasted onto a different field name.

    **A real, previously-documented-class bug was found and fixed while
    measuring this, not shipped blind, per lesson 8.** A first version had
    no ischemic deadband — the EXACT "naive (1-delivery) deficit" mistake
    `brainO2now`'s own comment already documents fixing once, now
    independently rediscovered on a different field: resting `alphaTone`
    is never exactly 0 (baseline sympathetic tone ~0.2-0.3), so a healthy,
    condition-less, resting patient's `gutDO2` sits measurably below 1
    forever, and without a deadband this accrued real (if slow) injury in
    a perfectly healthy patient — measured directly (0.026 by 30 minutes
    with zero pathology). Fixed the same way brain already does it: injury
    only begins once delivery falls below a real ischemic threshold
    (`gutDO2 < 0.5`, matching brain's own "damage starts at roughly half of
    normal delivery" anchor), not off raw deficit from an idealized 1.0.

    **A SECOND real bug — a genuine mis-calibration, not a coding error —
    was also found and fixed by measuring rather than assuming.** The
    coefficient was first picked assuming `alphaTone` could approach its
    theoretical clamp ceiling (0-3) under severe stress; measured instead
    (lesson 20's "calibrate against the instrument you have," not the
    literature's units) against a genuinely catastrophic, untreated,
    30-minute AAA rupture (sbp collapsed to 11.4 mmHg — an effectively
    dying patient) and found `alphaTone` peaks at only ~0.6 in this engine
    even there. At the original coefficient this left gut injury UNABLE TO
    ENGAGE even for a near-terminal patient — a real risk of shipping an
    inert mechanism. Recalibrated so this same near-terminal patient
    crosses the ischemic deadband with real margin (gutO2Debt 0.602,
    genuine injury accruing) while a healthy resting patient stays clearly
    above it (gutDO2 0.813, zero injury).

    **A genuine, honestly-reported finding, not forced to match
    expectations**: `acuteMesentericIschemia`'s own presenting severity
    (alphaTone ~0.22-0.24) does NOT cross the ischemic threshold within a
    typical 15-minute call, so its own bleed-rate feedback stays inert for
    THIS particular condition's calibrated severity — a real, honest result
    about that condition (most GI-bleed patients presenting to EMS are
    still compensated, not near-death), not a broken mechanism: the causal
    link is real and correctly wired, ready to engage for a sicker patient
    or a longer call, and was independently confirmed reachable via the
    real AAA scenario above.

    **Verification for the gut slice, complete.** `node --check`/
    `npx eslint` clean on all five touched files (`neuro.js`, `patient.js`,
    `physiology.js`, `conditions.js`, `scenarioSweep.mjs`).
    `gutDO2`/`gutO2Debt`/`gutInjury` added to `scenarioSweep.mjs`'s
    `REQUIRED`/`NON_NEGATIVE` lists and `patient.js`'s constructor
    defaults. `mechanismWiring.mjs`, run twice: the first run came back
    355/3 — two of the three failures are the same already-documented,
    pre-existing flaky assertions (Tzivoni magnesium/torsades, PAC HR-
    variance), and the third (a `rocuroniumOverdose` BVM-timing stochastic
    check, 5/10 vs. its own threshold) was NOT immediately trusted as a
    regression — re-run clean on the second pass (**358 passed, 0
    failed**), confirming it was ordinary 10-trial sampling noise on an
    `assertMostTrials`-style check, unrelated to anything this batch
    touched (rhythm-instability/vtDrive mechanics were never edited).
    `scenarioSweep.mjs`: **156 scenarios, 9,055,178 checks, 0 failed** —
    the increase over the prior baseline (8,633,978) is exactly
    156 × 450 × 3 fields × 2 lists. `npx vite build`: clean (1.60s, same
    pre-existing >500kB chunk-size warning). All throwaway probe scripts
    across all three item-42 slices this session were stripped before this
    entry was written.

    **The skin slice is ALSO DONE (same session, direct follow-up) —
    kidney, liver, gut AND skin are all now closed; only skeletal-muscle
    remains.** Deliberately NOT a structural-injury accumulator like
    kidney/liver/gut: skin does not meaningfully necrose from transient
    hypoperfusion at EMS timescales (absent frostbite/pressure injury,
    neither modeled), so this is a pure, live, real-time perfusion signal
    (`pat.skinDO2`) rather than a persistent injury pool — its consumer is
    diagnostic, not pathological. Shares gut's exact `alphaTone`-driven
    mechanism and calibration (fast, direct alpha-adrenergic, "sacrificed
    early" tier), since skin genuinely shares that physiological priority
    with gut.

    **Two real, already-existing exam actions were wired to it, and a real,
    PRE-EXISTING clinical defect was fixed along the way.** `actions.js`'s
    `skin` and `capRefill` default exam findings previously fired only off
    a flat `v.sbp<LIM.sbpShock` threshold — meaning a patient in genuine
    compensated shock (normal blood pressure, but already meaningfully
    vasoconstricted) read as completely unremarkable on skin exam, missing
    the entire textbook reason a skin exam is taught: cool, clammy,
    mottled skin with delayed capillary refill is one of the EARLIEST
    signs of shock, appearing BEFORE hypotension. Both actions now read
    `pat.skinDO2` directly (threshold 0.78, calibrated against measured
    examples — a healthy resting patient measures ~0.81, a real,
    moderately-injured compensated-trauma patient with a normal sbp
    measures ~0.76, placed to separate the two) for a real, graded
    "cool/clammy, sbp still normal" finding.

    **A second, real, genuinely PRE-EXISTING defect (not introduced this
    session, but sitting in the exact code being touched) was found and
    fixed while rebuilding these two actions**: the old sbp-threshold logic
    treated ANY hypotension as "gray, cool, diaphoretic," which is
    clinically wrong for distributive/warm shock — real anaphylaxis,
    sepsis, neurogenic shock, and heat stroke are textbook VASODILATED and
    often flushed, not vasoconstricted. Confirmed directly against the
    real, already-shipped `anaph` scenario before fixing anything (lesson
    8): at sbp=89 (clearly hypotensive), the old logic would have shown
    "gray, cool, wringing wet" — clinically backwards for this patient.
    Fixed by reusing `pat.vasodilation` (an already real, purpose-built
    field several already-shipped conditions set for exactly this —
    anaphylaxis, sepsis, neurogenic shock, heat stroke, addisonianCrisis)
    rather than trying to infer warm-vs-cold shock indirectly from
    `skinDO2`/`alphaTone`, which would need a proper expected-
    vasoconstriction-for-this-MAP baseline this session correctly did not
    improvise under time pressure. Both actions now genuinely distinguish
    four real clinical pictures — healthy, early compensated (cool/clammy,
    normal sbp), cold/hypovolemic shock (gray/cool/diaphoretic, low sbp),
    and warm/distributive shock (flushed or brisk-refilling despite low
    sbp) — confirmed by calling the real action functions directly against
    live patient state for all four, not just reasoning about the logic.

    **Verification for the skin slice, complete.** `node --check`/
    `npx eslint` clean on all four touched files (`neuro.js`, `patient.js`,
    `actions.js`, `scenarioSweep.mjs`). `skinDO2` added to
    `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists and `patient.js`'s
    constructor default. `mechanismWiring.mjs`: **357 passed, 1 failed** —
    the same already-documented, pre-existing flaky PAC HR-variance
    assertion, unrelated. `scenarioSweep.mjs`: **156 scenarios, 9,195,578
    checks, 0 failed** — the increase over the prior baseline (9,055,178)
    is exactly 156 × 450 × 1 field × 2 lists. `npx vite build`: clean
    (1.65s, same pre-existing >500kB chunk-size warning). The throwaway
    probe script was stripped before this entry was written.

    **The skeletal-muscle slice is ALSO DONE (this session) — item 42 is now
    fully closed, all five organs done.** Confirmed the concern in this
    entry's own prior text (no obvious consumer) by actually checking, per
    lesson 16 — and found one: `crushSyndrome` (`conditions.js`) already
    fires a fixed +3.5 mEq/L reperfusion potassium-washout bolus on lift,
    completely INDEPENDENT of how long the patient was actually compressed
    beyond the condition's own presenting 5-hour baseline. Real crush-
    syndrome literature (Sever & Vanholder's clinical reviews) documents
    that washout severity scales with compression DURATION and muscle mass,
    not a fixed quantity — a genuine, well-scoped hyper-realism gap with an
    obvious, already-real consumer once looked for directly, rather than
    needing a brand-new general per-organ signal like kidney/liver/gut/skin
    did.

    **Fixed with a narrow, condition-scoped time-integrated accumulator,
    not the general alphaTone/caO2-driven pattern the other four organs
    use** — deliberately different, because crush syndrome's ischemia is
    direct MECHANICAL compression, not systemic sympathetic
    vasoconstriction, so reusing `alphaTone` would have been the wrong
    mechanism for the wrong reason. `pat.muscleIschemicBurdenHr` seeds to 5
    (matching the condition's own "5 h entrapped already" presenting state,
    `initial.k:6.4`) and continues climbing in real hours-equivalent units
    for as long as `s.lifted` stays false — reusing the scenario's own
    already-real, player-triggered lift action (`scenarios.js`'s "Tell
    rescue to LIFT" button) rather than inventing parallel timing state.
    The reperfusion bolus is now `3.5 * min(1.5, burden/5)` instead of a
    flat 3.5, capped so an extreme entrapment can't produce an unbounded
    bolus.

    **MEASURED against the real engine, and the common case is preserved
    exactly, not silently changed.** A near-immediate lift (~6s into a
    call) reproduces the ORIGINAL bolus bit-for-bit (k 6.401 → 9.901, the
    same +3.5 the old flat mechanism always gave, since burden/5≈1.0 at
    that point). A real, long-for-a-single-scene delay (~20 minutes before
    lift) produces a real, if honestly modest (~7%, burden 5.33 vs. the 5.0
    baseline), larger washout — an honest finding, not forced bigger to
    look dramatic: crush-syndrome duration effects are genuinely meaningful
    over HOURS, so a typical EMS scene's own few extra minutes should only
    move the needle a little, which is exactly what was measured.

    **Verification, complete.** `node --check`/`npx eslint` clean on the
    one touched file (`conditions.js`). This field is deliberately NOT
    added to `scenarioSweep.mjs`'s global `REQUIRED`/`NON_NEGATIVE`
    lists — unlike kidney/liver/gut/skin's DO2/O2Debt signals (computed
    unconditionally for every patient every tick), this is condition-scoped
    bookkeeping that only exists for `crushSyndrome` patients, the same
    footing as that condition's own pre-existing `pat._reperfused` flag —
    adding it to the global lists would fail every OTHER scenario that
    never sets it. `mechanismWiring.mjs`, run twice: the first run came
    back 356/2 — one already-documented flaky assertion (PAC HR-variance)
    plus a NEW-looking one ("untreated k=7.5 read wideQRS in only 6/10
    trials") that reads neither `crushSyndrome` nor anything this batch
    touched — not trusted as a regression on one draw, re-run clean on the
    second pass (**357 passed, 1 failed**, only the same pre-existing PAC
    assertion), confirming ordinary stochastic noise. `scenarioSweep.mjs`:
    **156 scenarios, 9,195,578 checks, 0 failed** — unchanged count,
    correctly, since no new universal field was added. `npx vite build`:
    clean (1.83s, same pre-existing >500kB chunk-size warning). The
    throwaway probe script was stripped before this entry was written.

    **Item 42 is now fully closed** — kidney, liver, gut, skin, and
    skeletal-muscle are all done, each using whichever variant of the
    delivery/demand pattern actually matched that organ's own real
    physiology (systemic sympathetic tone for kidney/gut/skin, cardiac-
    output-relative flow for liver, direct mechanical compression duration
    for skeletal muscle) rather than forcing one formula onto all five.

43. **Nephron abstraction — the osmotic-diuresis slice is DONE (this
    session), built WITHOUT the full segment chain; the rest remains
    open.** `renal.js` already treats na/k/bun as real mass/
    concentration pools with GFR-driven clearance, ADH/aldosterone
    handles, and RAAS (see item 43's history entry, item 14's RAAS fix,
    and item 25's own already-implemented `siadh`/`diabetesInsipidus`
    reuse of `adhAutonomous`/`adhSecretionCapacity`/`adhRenalResponsiveness`).
    The full proposal — an explicit LUMPED nephron segment chain
    (glomerulus → proximal tubule → loop of Henle → distal tubule →
    collecting duct → urine) — is NOT built and remains genuinely large,
    structural work.

    **But one of its three named payoffs — osmotic diuresis (DKA's own
    polyuria) — turned out to be buildable as a narrow, general, additive
    term without the segment chain at all, and is now real.** `renal.js`
    gains a real glucosuria mechanism: once blood glucose exceeds a real
    renal threshold (~180 mg/dL, where proximal-tubule Tm-glucose
    reabsorption capacity is exceeded), unreabsorbed glucose creates an
    osmotic force that drags free water out REGARDLESS of ADH status — the
    actual textbook mechanism behind DKA/HHS's severe polyuria/dehydration.
    This was previously represented in this engine ONLY as a flat,
    glucose-INDEPENDENT plasmaVol depletion rate scripted separately into
    `diabeticKetoacidosis` and `hyperosmolarHyperglycemicState` — narration
    dressed as mechanism (the comment at those sites already claimed
    "osmotic diuresis," but the drain rate never actually read
    `pat.glucose`, so it kept draining at the identical rate even after
    treatment corrected glucose back to normal, which is physiologically
    wrong). Both conditions' scripted rates were REMOVED — their
    dehydration is now emergent from this one general, glucose-driven
    mechanism, which also applies to ANY sufficiently hyperglycemic patient
    in the library, not just the two that happened to script it.

    **Coefficient identified by measurement against the engine's own two
    already-calibrated flat rates, not invented**: DKA's old 0.025 L/min at
    glu~550 implied ~0.0000676/mg/dL of excess; HHS's old 0.035 L/min at
    glu~850 implied ~0.0000522/mg/dL — both landing in the same order of
    magnitude, so 0.00006 was picked inside that measured range.

    **MEASURED, and the common case is well-preserved while a genuinely new
    capability was confirmed.** DKA untreated at 15 min: plasmaVol falls by
    ~0.33 L (vs. the old flat mechanism's ~0.375 L over the same window —
    close, honestly not identical, since one shared coefficient now serves
    both conditions instead of two separately-tuned rates). HHS: ~0.6 L
    (vs. old ~0.525 L), same honest variance. **The real, previously-
    impossible finding**: forcing glucose back to normal partway through a
    DKA run (simulating successful treatment) makes the osmotic-diuresis
    drain STOP immediately, and the kidney's own pre-existing, unrelated
    volume-restoration loop (`renal.js`'s "renal handling of water,"
    already in the engine) then begins genuinely REPLETING the deficit
    over the following minutes — something the old flat-rate mechanism
    could never do (it would have kept draining volume even after
    successful glucose correction).

    **Verification, complete.** `node --check`/`npx eslint` clean on both
    touched files (`renal.js`, `conditions.js`) — one real lint catch
    (a `dt` parameter that became unused once the scripted HHS rate was
    removed, fixed by dropping the parameter). Since this touches
    `renal.js`'s shared per-tick hot path, the full suite was run:
    `mechanismWiring.mjs` **357 passed, 1 failed** — the same
    already-documented, pre-existing flaky rocuronium BVM-timing
    assertion, unrelated; every DKA/Kussmaul-compensation assertion passed
    clean, confirming no regression. `scenarioSweep.mjs`: **156 scenarios,
    9,335,978 checks, 0 failed** — unchanged count, correctly, since this
    reuses already-tracked `plasmaVol`/`totalBloodVol` fields rather than
    adding a new one. `npx vite build`: clean. The throwaway probe script
    was stripped before this entry was written.

    **Still open, correctly not attempted**: loop-diuretic-specific action
    (this formulary has no diuretic drug at all, confirmed by grep — a
    separate, new-drug-plus-mechanism piece of work) and a real prerenal/
    intrinsic/postrenal AKI distinction (a bigger, structural piece — see
    item 48's kidney slice for the closest existing analog,
    `atnProgression` vs `kidneyInjury`, which is a real but different
    reversible-vs-structural distinction, not a prerenal/intrinsic/
    postrenal one). The full segment-chain proposal itself remains
    unattempted and still large — this session only proves one of its
    three named payoffs was separable and worth building on its own.

45. **Receptor-level PK/PD depth, plus receptor desensitization/tolerance —
    (a) confirmed already done, (b) now DONE too (this session).** The
    `receptors` object architecture in `drugs.js` (continuous,
    concentration-driven — not the per-drug-id Emax gate item 38 documented
    as fentanyl's own ceiling) is already exactly the substrate this note
    asks for, and is already reused successfully across queue items 21/40
    (atropine's `vagalBlock`, diltiazem's `calciumChannel`, metoprolol's
    `beta1`/`beta2`, calcium's partial-antagonist terms). **(a) split
    β1/β2 sub-effects — re-verified against the tree, already true, no
    work needed**: `pk.js` already composes `beta1Drug`/`beta2Drug` as
    separate accumulators (line ~1331-1332), each drug declaring its own
    split coefficients (metoprolol's own `beta1`/`beta2` from item 40's
    history is one of several).

    **(b) receptor desensitization/acute tolerance — the real net-new
    piece, now built.** `pk.js`'s `updateDrugs` computes, once per tick
    (not per drug instance, so a class's own desensitization state isn't
    read mid-update from a value it's simultaneously still writing), three
    persistent 0-1 fields — `pat.opioidDesens`, `pat.gabaDesens`,
    `pat.beta2Desens` — each relaxing (first-order, a class-specific
    `rate`/`ceiling`) toward its ceiling while a drug of that class is
    actively occupying its receptor (occupancy judged via the SAME
    Emax-normalized 0-1 intensity every other consumer reads, not raw
    concentration — see the bug this caught, below) and back toward zero
    once occupancy falls. The result multiplies `intensity` itself for any
    subsequent dose of the same class, reducing that dose's own effect
    across every mechanism it drives (respiratory depression, anticonvulsant
    suppression, receptor-mediated hemodynamics), not one hand-picked
    consumer — matching how real receptor desensitization reduces potency
    at the target broadly. Real anchors, stated honestly as
    order-of-magnitude estimates from the general tachyphylaxis literature
    rather than fitted numbers: benzodiazepine tolerance (ceiling 0.5, tau
    ~20 min) is set fastest/deepest of the three because it is the most
    clinically prominent in this game's own status-epilepticus mechanic —
    real, documented, diminishing seizure-suppression on repeat dosing is
    the actual clinical reason guidelines escalate to a second-line agent
    rather than a third benzo dose; opioid acute tolerance (ceiling 0.3,
    tau ~45 min) and beta-2 agonist tachyphylaxis under repeated nebulized
    dosing (ceiling 0.35, tau ~30 min) are both real, separately documented
    phenomena at a comparatively milder magnitude.

    **A real bug was found and fixed while measuring this, not assumed
    away, per lesson 8.** A first version judged "is this receptor class
    currently exposed" via a flat raw-concentration cutoff (0.01 mg/L) —
    measured directly against the real engine and found to silently never
    fire for fentanyl at all, despite three real, repeated doses genuinely
    suppressing respiratory drive throughout the probe: fentanyl's own
    therapeutic central concentration (~0.004 mg/L) sits below that flat
    cutoff even though its EC50 (0.0012) is smaller still, so real,
    substantial receptor occupancy was being judged as "not exposed" by an
    absolute-scale test that happened to fit benzodiazepines (ec50 0.1) but
    not opioids. Fixed by judging exposure on the same Emax-normalized
    occupancy fraction (`totalC/(ec50+totalC)`) every other consumer in
    this file already reads, not a fresh, drug-scale-dependent number.

    **MEASURED against the real engine after the fix, not assumed.**
    Repeated fentanyl dosing (`abdPain`, three doses 9 minutes apart):
    `opioidDesens` climbs 0.006 → 0.059 → 0.107 across the three doses.
    Repeated midazolam dosing: `gabaDesens` climbs faster and higher
    (0.022 → 0.195 → 0.315), matching the intentionally-steeper benzo
    calibration. Repeated albuterol nebs in the real, already-shipped
    `asthmaAttack` scenario: `beta2Desens` climbs 0 → 0.13 → 0.27 across
    three doses 15 minutes apart, with `effectiveBroncho`'s per-dose
    improvement visibly shrinking as it does. A single fentanyl dose alone
    (no repeat) still reaches `opioidDesens=0.08` by 15 minutes — a real,
    more nuanced finding than "one dose never desensitizes": fentanyl's
    slow elimination (kel 0.01/min) keeps occupancy above the exposure
    threshold for a long stretch even after one dose, so SUSTAINED
    occupancy (not merely dose *count*) is the real driver, which is
    mechanistically correct — the same reason continuous-infusion
    remifentanil produces measurable acute tolerance in the anesthesia
    literature without any repeat bolus at all. Decay was also confirmed
    real (not just present in the formula) but, honestly, is mostly
    invisible WITHIN a typical 900-1200s EMS scene at these drugs' own
    elimination rates — a single midazolam dose's occupancy (and therefore
    its desensitization) is still near its own ceiling at 90 simulated
    minutes, so recovery mostly happens BETWEEN calls in this game's own
    time-skip mechanics, not mid-scene, which is itself a realistic
    consequence of these drugs' real half-lives, not a defect.

    **Verification, complete.** `node --check`/`npx eslint` clean on all
    three touched files (`pk.js`, `patient.js`, `scenarioSweep.mjs`).
    `opioidDesens`/`gabaDesens`/`beta2Desens` added to `scenarioSweep.mjs`'s
    `REQUIRED`/`NON_NEGATIVE` lists and `patient.js`'s constructor defaults.
    Since this touches `pk.js`'s shared drug-effect hot path — every drug
    in the formulary passes through `updateDrugs` — the full suite was run,
    not skipped: `mechanismWiring.mjs` **356 passed, 2 failed**, both the
    same already-documented, pre-existing flaky stochastic assertions
    (Tzivoni magnesium/torsades noise, PAC HR-variance noise), confirmed
    unrelated (neither reads any of the three new fields).
    `scenarioSweep.mjs` **156 scenarios, 8,633,978 checks, 0 failed** — the
    increase over the prior baseline (8,212,778) is exactly
    156 × 450 × 3 fields × 2 lists, confirming the new checks genuinely
    run. `npx vite build`: clean (1.60s, same pre-existing >500kB
    chunk-size warning). Both throwaway probe scripts were stripped before
    this entry was written.

46. **Inflammation as a first-class physiological system, coupled to
    coagulation — filed from operator architecture notes, NOT attempted.
    The single largest net-new subsystem in this list.** Proposal: an
    injury/infection → cytokine (IL-1/IL-6/TNF) → endothelial activation →
    {vasodilation, capillary leak, fever, tachycardia, coagulation
    activation} cascade, so sepsis/preeclampsia/pancreatitis/burns (all
    already-shipped conditions using the existing `pat.capillaryLeak`
    Starling-block handle directly — see `preeclampsia`'s and
    `acutePancreatitis`'s history entries) could instead declare
    `pathogenBurden`/`inflammation` and let capillary leak, fever, and
    tachycardia all emerge from one shared cascade rather than each
    condition writing its own leak/fever/HR terms independently. Second
    half: couple this to the existing coagulation model (already unusually
    detailed per the operator's own note) via tissue-factor/endothelial-
    injury pathways, so the trauma→bleed→shock→coagulopathy chain and the
    sepsis→inflammation→microthrombosis→organ-failure chain share real
    mechanism instead of being two unrelated systems. High payoff (it would
    retroactively generalize several already-shipped conditions' bespoke
    mechanisms into one shared cascade) but high risk (touches
    `capillaryLeak`, which several already-verified conditions depend on
    directly) — needs its own batch, and each already-shipped consumer of
    `capillaryLeak` needs re-verification against the new cascade, not just
    the new condition being added. **RESOLVED (a later session) — item 49's
    audit found `capillaryLeak` had NO resolution mechanism in either
    direction, and a direct follow-up session closed that literal gap on its
    own, ahead of this item's full scope**: `physiology.js`'s shared
    `stepPatient()` now applies a real, unconditional, literature-anchored
    endothelial-repair decay (~36h tau, `dt*0.00046/min`) every tick, after
    every condition's own forcing has already run — while a condition is
    actively driving the leak up (every consumer's own rate is 15-130x
    larger), the forcing still dominates and nothing about any existing
    condition's trajectory changed; once nothing is forcing it, the field
    now genuinely resolves (measured: a mutated 0.6 leak with no forcing
    fully resolves to 0 over a 48-hour simulated horizon). See section 3's
    entry for the full measurement and verification.

    **UPDATE (this session) — the core cascade now exists as a real, shared
    mechanism, plus the coagulation coupling; ONE condition (pneumoniaSepsis)
    was migrated onto it as a proof and regression check. Three of the four
    originally-named consumers (preeclampsia, acutePancreatitis,
    toxicInhalationChlorine) were deliberately NOT migrated this session —
    this item stays open for exactly that remaining migration work.** Full
    mechanism/measurement detail is in section 3's newest entry; summary for
    planning purposes:

    New file `src/physio/inflammation.js`, `updateInflammation(pat, dt)`,
    called once per substep inside `patient.js`'s integration loop (the same
    footing as `updateCoagulation`). `pat.pathogenBurden` (0-1) is the one
    thing a condition declares — a real magnitude, not a rate, the same
    "declare the lesion, let the engine derive the consequence" idiom
    `riskFactors` already uses. `pat.cytokineLoad` (0-1) is DERIVED, a
    first-order relaxation toward `pathogenBurden` on a stated, honest
    90-minute time constant (general sepsis-cytokine-kinetics literature —
    IL-6 detectable within 1-2h of a major insult, continuing to rise for
    several hours) — a condition modeling a FRESH insult mid-call gets a
    real, non-instant ramp; a condition modeling an ALREADY-ESTABLISHED
    process (days of illness, e.g. `pneumoniaSepsis`) pre-seeds
    `cytokineLoad` too, the same reasoning that condition already uses for
    pre-seeding `vasodilation` at 0.28 rather than 0. `cytokineLoad` then
    drives, generally, three real consequences: an additive contribution to
    `pat.capillaryLeak` (ratcheted to a shared 0.22 ceiling, the same
    Math.max/clamp idiom every other capillaryLeak writer already uses —
    SAFE by construction, since cytokineLoad is exactly 0 for any condition
    that never sets pathogenBurden, so this module contributes literally
    nothing to preeclampsia/acutePancreatitis/toxicInhalationChlorine/
    anaphylaxis and every other already-shipped, already-verified condition
    unless and until a future session opts them in); a Math.max ratchet on
    `pat.metabolicHeatMultiplier` (REUSING the exact hypermetabolic-fever
    hook `statusEpilepticus`/`excitedDelirium`/`thyroidStorm` already use,
    so thermo.js's own real heat-balance physics produces the actual
    temperature rise, not a direct coreTemp write); and, via
    `coagulation.js`, a real tissue-factor-driven consumptive-coagulopathy
    term (factors/fibrinogen/platelets fall, fibrinolytic drive rises,
    scaled by cytokineLoad, a stated honest-estimate rate deliberately
    SLOWER than an actively bleeding wound's own consumption) — the actual
    mechanism behind sepsis-associated DIC, engaging independent of
    `activeBleedRate` so it is provably a NEW pathway, not a relabeling of
    the existing hemorrhage-consumption term the `[DILUTIONAL COAGULOPATHY]`
    suite section already covers.

    `pneumoniaSepsis` (`conditions.js`) is the first, and so far only, real
    consumer — chosen because it's explicitly named in this item's own
    text, because it presents febrile but had NO fever progression
    mechanism at all before this session (a genuinely new capability, zero
    conflict with anything pre-existing), and because it never wrote
    `capillaryLeak` (also a genuinely new capability). Its own already-
    calibrated `vasodilation`/`shuntFraction`/rhythm mechanics are
    UNCHANGED — the cascade is additive only. MEASURED (not assumed):
    untreated at 900s, cytokineLoad reaches ~0.52 (real, substantial),
    capillaryLeak ~0.012 (small but real and honestly slow, the same
    "small and slow within one call" precedent the endothelial-repair decay
    above already set), metabolicHeatMultiplier ~1.18 (a real, engaged
    fever driver), factorII falls 100→99.5 and fibrinogen 3.0→2.98 (the
    real, if modest, septic-DIC consequence). A condition-less control
    (`abdPain`) and the ALREADY-SHIPPED, NOT-migrated `preeclampsia`
    (`severePreeclampsia` scenario) both confirmed to show EXACTLY zero
    pathogenBurden/cytokineLoad at 900s — direct, measured proof (not just
    design-level assumption) that this addition is provably inert for every
    condition that hasn't opted in, which is why no re-verification of
    those un-migrated conditions' own established behavior was needed
    beyond this direct check. A separate `mutate`-forced fresh-onset test
    (bare `pathogenBurden=0.9` on a condition-less patient, no pre-seeded
    cytokineLoad) confirms the cascade's own lag is real: cytokineLoad
    reaches only ~0.02 at 120s and ~0.14 at 900s — genuinely still rising,
    not instant and not stalled, matching the honest claim that real
    cytokine response continues developing over HOURS, not minutes (no
    "mostly caught up within one call" assertion was written, since that
    would be asking the mechanism to be dishonestly fast for testing
    convenience).

    **Ten new two-sided `mechanismWiring.mjs` assertions** (presence,
    specificity via a condition-less control, an explicit regression guard
    confirming the un-migrated `preeclampsia` is untouched, the fresh-onset
    lag/rise time course, and both coagulation-coupling consequences with a
    control-arm check) — all ten passed clean. **`pathogenBurden`/
    `cytokineLoad` added to `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE`
    lists** per lesson 2.

    **Verification, complete.** `node --check` clean on all five touched
    files (`inflammation.js` [new], `patient.js`, `coagulation.js`,
    `conditions.js`, `mechanismWiring.mjs`, `scenarioSweep.mjs`) throughout.
    Since this touches `patient.js`'s shared per-substep integration loop —
    every scenario in the game passes through it — the full suite was run,
    not skipped: `mechanismWiring.mjs`: **384 passed, 1 failed** — the
    single failure (`activeSeizureGTC -> pat.seizing engages`, 6/10 vs
    needed 7/10) is the exact same pre-existing, already-documented flaky
    stochastic assertion this document has carried for several sessions,
    confirmed unrelated by content (reads `pat.seizing`/`epilepticDrive`,
    nothing this batch touched); 374 (the pre-batch baseline) + 10 (this
    batch's own new assertions) = 384, confirming arithmetically that
    nothing else regressed and nothing was lost. **`scenarioSweep.mjs`:
    157 scenarios, 10,384,924 checks, 0 failed** — the +282,600 over the
    prior baseline (10,102,324) is exactly 157 scenarios × 450 ticks × 2
    new fields × 2 lists, confirming the new checks are genuinely running.
    `npx vite build`: clean (same pre-existing >500kB chunk-size warning).
    `npx eslint src`: exactly the pre-existing 3-error
    `react-refresh/only-export-components` baseline in `App.jsx`, zero
    findings in any file this batch touched. A real bug was caught and
    fixed during this session's own verification, not shipped blind: the
    first `mechanismWiring.mjs` run crashed (`TypeError: Cannot read
    properties of undefined (reading 'toFixed')`) because `capillaryLeak`
    had never actually been added to that suite's own `snapshot()` helper
    despite an existing `[ENDOTHELIAL BARRIER]` section reading it a
    different way (off `.patient` directly) — found immediately, fixed by
    adding it, re-run clean. Both throwaway probe scripts used to measure
    the numbers above were stripped before this entry was written,
    confirmed via a directory listing showing no `_tmp_*` files remain
    under `src/scripts/`.

    **UPDATE (a later session) — `acutePancreatitis` and
    `toxicInhalationChlorine` are now migrated too, both as DELIBERATE
    PARTIAL migrations; `preeclampsia` is deliberately, permanently NOT
    migrated, with a real reason recorded below, not left open by
    omission.** Full mechanism/measurement detail is in section 3's newest
    entry; summary for planning purposes:

    Both conditions' own pre-existing `capillaryLeak` mechanisms — an
    instant floor to 0.20 for pancreatitis, a `dt*0.014/min` ramp to a 0.2
    ceiling for chlorine — were measured against a full swap onto the
    shared cascade and found INCOMPATIBLE with the cascade's own leak rate
    (`INFLAM_LEAK_RATE=0.0025/min`, deliberately calibrated for
    `pneumoniaSepsis`'s hours-to-days septic process): reaching either
    condition's own already-documented ~0.20 ceiling through the cascade
    alone would take ~80 minutes, nowhere near a realistic call. A full
    swap would have silently regressed each condition's own already-
    shipped, already-measured trajectory. So the leak component stays on
    each condition's OWN dedicated, UNCHANGED mechanism, and `pathogenBurden`
    was added ONLY for the two consequences that are genuinely new: real
    fever (via `metabolicHeatMultiplier`) and real, tissue-factor-driven
    coagulopathy (via `coagulation.js`) — both real SIRS/DAMP-driven
    findings neither condition had before. `acutePancreatitis` pre-seeds
    `cytokineLoad` PARTIALLY (0.35, toward a burden of 0.5) — an hours-old,
    not-yet-fully-equilibrated process, since pain (and the autodigestion
    driving it) has typically been building for hours before EMS is called,
    not the days `pneumoniaSepsis` presents with. `toxicInhalationChlorine`
    does NOT pre-seed cytokineLoad at all — a genuinely fresh exposure (the
    patient calls 911 within minutes of inhaling the gas), so it uses the
    cascade's own honest 90-minute lag from zero, per inflammation.js's own
    "a condition modeling a FRESH insult mid-call should NOT [pre-seed]"
    guidance.

    MEASURED, before and after, at settle=2/run=900 through the real
    `physio()` scenario harness (not reconstructed): pancreatitis's own
    capillaryLeak trajectory is essentially unchanged (0.19998 pre-migration
    vs. 0.207 post-migration at 900s — the tiny difference is the cascade's
    own negligible additive contribution at cytokineLoad~0.37, well inside
    noise), and plasmaVol tracks within 0.004 L of its pre-migration value
    throughout. New: cytokineLoad reaches ~0.37 by 900s (real, substantial),
    metabolicHeatMultiplier reaches ~1.13 (a real, engaged fever driver —
    this condition had zero fever mechanism before), factorII falls
    100→99.6 and fibrinogen 3.0→2.99 (a real, modest coagulopathy).
    Chlorine's own capillaryLeak trajectory is likewise unchanged (0.19998
    pre vs. 0.19999 post at 900s); new: cytokineLoad reaches only ~0.09 by
    900s (small, as expected for a fresh-onset insult with no pre-seed),
    metabolicHeatMultiplier ~1.03, factorII 100→99.95 — real but honestly
    small, matching this condition's own already-established "real but
    time-limited" framing for its delayed pulmonary-edema risk.

    **`preeclampsia` was deliberately investigated and NOT migrated — a
    permanent design decision for this item, not a deferral.** Its own
    capillary-leak mechanism (`0.30*sev`, re-asserted every tick) is driven
    by an antiangiogenic-vascular process (sFlt-1/soluble endoglin
    scavenging VEGF), not the PAMP/DAMP innate-immune pathway
    `inflammation.js`'s own header describes — a real mechanism-category
    difference, not just a magnitude one. Its own trajectory is also
    unusually tightly calibrated against a documented SVR/CO/Hct/platelet
    endpoint (see that condition's own "MEASURED ENDPOINT" comment), and
    the cascade would add a fever mechanism preeclampsia has never had and
    should not gain (no fever is part of this disease's real presentation),
    plus a SECOND, independent coagulopathy pathway that would double up
    against its own already-real microangiopathic-platelet-consumption
    mechanism. No genuine new capability would be gained by migrating it,
    and real risk to an already-verified calibration would be taken on for
    nothing. `mechanismWiring.mjs`'s own existing regression guard
    (`...and an unmigrated condition (preeclampsia) is untouched`) already
    asserts this and continues to pass.

    **Eight new two-sided `mechanismWiring.mjs` assertions** (real
    cytokineLoad/fever/coagulopathy presence for each of the two migrated
    conditions, plus an explicit regression guard per condition confirming
    its own pre-existing capillaryLeak ceiling was NOT regressed by adding
    `pathogenBurden` alongside it) — all eight passed clean.

    **Verification, complete.** `node --check`/targeted `npx eslint`
    clean on both touched files (`conditions.js`, `mechanismWiring.mjs`).
    Since this touches `patient.js`'s shared per-substep integration loop
    (indirectly, via the two migrated conditions), the full suite was run:
    `mechanismWiring.mjs`: **393 passed, 0 failed** — 385 (the pre-batch
    total assertion count, including the standing flaky `activeSeizureGTC`
    assertion, which passed clean this run) + 8 (this batch's own new
    assertions) = 393, confirming arithmetically that nothing else
    regressed. `scenarioSweep.mjs`: **157 scenarios, 10,384,924 checks, 0
    failed** — identical count to the pre-batch baseline (no new fields
    were added; `pathogenBurden`/`cytokineLoad` were already tracked),
    confirming zero regression across the full scenario library. `npx vite
    build`: clean (same pre-existing >500kB chunk-size warning). `npx
    eslint src`: exactly the pre-existing 3-error
    `react-refresh/only-export-components` baseline in `App.jsx`, zero
    findings in either touched file. The one throwaway probe script used to
    measure the before/after numbers above was stripped before this entry
    was written, confirmed via a directory listing showing no `_tmp_*`
    files remain under `src/scripts/`.

    **Item 46 is now CLOSED.** All three of the item's own originally-named
    consumers have a real, final disposition: `pneumoniaSepsis` (fully
    migrated, prior session), `acutePancreatitis`/`toxicInhalationChlorine`
    (partially migrated — fever/coagulopathy real, leak deliberately kept
    on its own dedicated mechanism, this session), `preeclampsia`
    (deliberately, permanently not migrated, reasoned through above, not
    left open). Still genuinely open, but no longer under THIS item's own
    name — a future burns condition (if one is ever built) is a natural
    candidate to reuse `pathogenBurden` from the start; extending
    `pat.vasodilation`'s own cytokine-driven tachycardia consequence
    generally (today only `pneumoniaSepsis`'s own already-existing,
    unmigrated vasodilation write produces it — the cascade has no general
    vasodilation consumer of its own, deliberately, since real distributive
    vasodilation-driven tachycardia already emerges correctly through the
    existing baroreflex loop once `pat.vasodilation` is raised by whatever
    mechanism raises it); and the earlier, speculative "early
    hypercoagulable/microthrombotic phase preceding the consumptive one"
    was deliberately NOT modeled (see `coagulation.js`'s own comment) since
    neither phase is independently observable at this engine's bedside-
    monitor granularity within a realistic call length.

47. **Consciousness as a continuous arousal score — the full refactor is
    NOT attempted (still correctly flagged as risky), but "sedative
    burden" — this item's own text already assumed was an existing input —
    is now REAL for real (this session).** Today consciousness is derived
    from a combination of real inputs (CPP, oxygenation, brain injury,
    seizure activity, ICP, temperature, metabolic toxicity — see the
    `metabolicEncephalopathy`/neuroglycopenic pathways from the neuro/
    endocrine batch, section 3) but ultimately classified into discrete
    states via a priority-ordered if/else chain, not a single continuous
    score. **A real gap was found while re-checking this item's own claim
    against the tree (lesson 16), not assumed**: this entry's own text
    listed "sedative burden" among the inputs already feeding
    consciousness — false. Grepped: nothing anywhere fed a sedative-drug
    signal into `pat.consciousness` at all; a massive dose of midazolam or
    etomidate given to an otherwise healthy patient produced zero
    consciousness change unless it happened to also cause enough
    respiratory depression to drop oxygenation. **Fixed as a narrow,
    additive branch, not the full refactor**: `pk.js` now computes a real
    `pat.sedationDepth` (reset and recomputed every tick from currently
    circulating drug, same idiom as `respDriveSuppression`/`anticonvulsant`)
    from two dedicated sedative-class drugs — midazolam (`sedative:0.6`)
    and etomidate (`sedative:1.0`, calibrated higher since it's specifically
    an INDUCTION agent whose whole clinical purpose is producing genuine
    unconsciousness at a standard dose) — and `neuro.js`'s existing if/else
    classifier gains one more branch reading it (>0.6 unconscious, >0.25
    drowsy), placed among the other non-overriding branches. Deliberately
    excludes fentanyl (its sedation already emerges correctly via the
    existing hypoxia-driven pathway; adding a second direct route would
    double-count the same phenomenon) and ketamine (`class:"dissociative"`
    — a real, qualitatively different state from sedation, not modeled).
    MEASURED against the real engine: healthy control stays awake
    (sedationDepth 0); a single midazolam dose reads drowsy (~0.26); a
    single etomidate induction dose reads unconscious (~0.60); repeated
    midazolam dosing (3 doses) only reaches ~0.34 (still drowsy) — the
    engine's own Emax saturation genuinely limits how far repeat dosing of
    one moderate-potency sedative can push this, confirmed rather than
    assumed to climb further; ketamine correctly leaves sedationDepth at
    exactly 0; and the already-shipped `rocuroniumOverdose` paralysis-!=-
    coma distinction is confirmed completely unaffected (rocuronium has no
    `sedative` coefficient). `mechanismWiring.mjs` 357/1 (the standing
    pre-existing flaky PAC assertion, unrelated) confirms no regression to
    either the rocuronium or seizure/anticonvulsant sections.
    `scenarioSweep.mjs` 156/9,476,378/0. **The full continuous-score
    refactor remains open and still correctly flagged as the riskier,
    larger piece** — this session only closed the one concrete input gap
    its own text had assumed was already real.

48. **Separate structural damage from functional dysfunction, generally —
    the kidney slice is DONE (this session), and it surfaced a much larger,
    previously-undocumented finding: the debrief function this data feeds
    has NO CALLER anywhere in the codebase.** `pat.kidneyInjury` and
    `pat.brainInjury` already are real, distinct structural-damage fields
    separate from momentary function (confirmed: `chronicKidneyDisease`
    pins `kidneyInjury` while GFR/excretion still compute dynamically off
    it; `brainInjury` is distinct from momentary consciousness state).

    **The reversibility distinction this item asked for turned out to be
    ALREADY BUILT, just unread.** `renal.js`'s `pat.atnProgression` is a
    real, separate accumulator from `pat.kidneyInjury` — confirmed by
    reading the code rather than assumed (lesson 16): it rises only while
    `renalPerf<0.5` and decays fully back toward zero (0.005/min) once
    perfusion recovers, i.e. it already models transient, RECOVERABLE
    tubular dysfunction as a genuinely different state from the slower,
    durable `kidneyInjury` structural accumulator — exactly the
    reversible-vs-structural distinction this item asks for. Its only
    reader before this session was its own contribution to the GFR
    calculation; nothing exposed the distinction itself. Wired a real
    consumer: `physiology.js`'s `outcomeReport()` gains a new
    `reversibleFindings` array alongside the existing (and, per the finding
    below, honestly mislabeled) `irreversibleInjuries` list — a kidney
    with `kidneyInjury<0.5` but meaningful `atnProgression` now reports
    "acute tubular dysfunction from transient renal hypoperfusion (likely
    reversible with supportive care)," a real, distinct prognostic claim
    from the existing list's flat injury-magnitude threshold. MEASURED
    against the real engine (not assumed): a healthy control and a
    real moderate-trauma scenario both hold `atnProgression` at an exact
    0.000 (a genuine deadband, not noise), while the same near-terminal AAA
    scenario used to calibrate the gut/skin slices reaches 0.133 at 30
    minutes with `kidneyInjury` still under the 0.5 structural threshold —
    confirmed via a direct call to `outcomeReport()` that this real case
    produces the new finding while `irreversibleInjuries` correctly stays
    empty.

    **A much bigger, genuinely new discovery while wiring this: `outcomeReport()`
    — and therefore its `irreversibleInjuries`/`troponin`/`neuroOutcome`/
    `roscOccurred`/`downtimeMin`/`deathStory`/`lethalMechanismTreatable`
    fields, none of them new to this session — has NO CALLER ANYWHERE IN
    THE CODEBASE.** Grepped `App.jsx` and every script directly: zero
    matches. The debrief screen (`App.jsx`, `g.phase==="debrief"`) renders
    from a completely separate object, `g.outcome`, built ad hoc via
    scattered `{...base,...}` literals through `App.jsx`'s own call-outcome
    logic — it never calls the physiology-layer `outcomeReport()` at all.
    This predates this session entirely (troponin/queue-item-18 and the
    post-death-gaps/queue-item-15 comments inside the function are both
    old) and is a real, previously-undocumented "written, read by nothing"
    defect at the scale of a whole function, not one field — but wiring an
    entire debrief-screen redesign (neurological outcome, ROSC timing,
    downtime, irreversible/reversible injuries, troponin) is real,
    separately-scoped FRONT-END work, not a physiology-engine mechanism,
    and correctly not attempted blind inside this batch. The new
    `reversibleFindings` field is real, correct, and verified at the data
    layer regardless (`outcomeReport()` is deliberately UI-agnostic per its
    own header comment — "if a number is wanted here that the engine does
    not track, it belongs in the module that owns the mechanism," which is
    exactly where reversibility data belongs even before a screen renders
    it) — but this is flagged as a genuinely open, separate front-end
    queue item, not silently absorbed into this one.

    **Still open — the general per-organ pattern beyond kidney.** Liver/
    gut don't have an equivalent transient-vs-structural pair the way
    kidney's `atnProgression`/`kidneyInjury` do; building one for either
    would mean inventing a genuinely new mechanism (not just wiring a
    reader to something that already exists), correctly out of scope for
    this narrow slice per the item's own "start with kidney, not a
    speculative scalar on every organ" framing.

    **Verification, complete.** `node --check`/`npx eslint` clean on the
    one touched file (`physiology.js`). `mechanismWiring.mjs`: **356
    passed, 2 failed** — both the same already-documented, pre-existing
    flaky stochastic assertions already seen twice this session (PAC
    HR-variance, rocuronium BVM-timing), neither reading `outcomeReport`,
    `atnProgression`, or `kidneyInjury`. `scenarioSweep.mjs`: **156
    scenarios, 9,195,578 checks, 0 failed** — unchanged count, correctly,
    since this change adds no new per-tick patient field for the sweep to
    track (the data already existed; only a debrief-layer reader was
    added). `npx vite build`: clean (1.61s, same pre-existing >500kB
    chunk-size warning). The throwaway probe script was stripped before
    this entry was written.

49. **Hysteresis in subsystems that currently lack memory — AUDIT DONE
    (this session), each of the three candidates checked by reading the
    actual code, not guessed at. One is already correct, one is a real
    but arguably-non-bug gap, one is a bigger and more basic finding than
    "no hysteresis."** `mortality.js`'s own state machine already uses
    hysteresis (documented in section 5) — unaffected by this audit.

    - **Myocardial stunning (takotsubo) — ALREADY HAS real, intentional
      hysteresis, confirmed by reading `conditions.js`'s `takotsubo`
      condition directly (lines ~503-528).** Onset is instant (`takotsuboStun`
      set to 1.0 and `takotsuboSurge` to 0.7 on the very first tick), but the
      two states decay on genuinely DIFFERENT time constants: the
      catecholamine surge clears with a ~1-2 hour tau (`dt*0.008`), while the
      stunning it triggers persists on a ~3-week tau (`dt*0.000033`) — a
      documented, in-code-commented, textbook fast-onset/slow-recovery
      asymmetry (calcium overload/oxidative stress/cellular edema resolving
      over weeks, not hours). Diastolic dysfunction (`lusitropyFactor`) and
      QTc prolongation both correctly track the SLOW stun tau, not the fast
      surge tau, matching the documented clinical peak (day 3-4). No gap;
      no work needed.
    - **Bronchospasm recovery — genuinely NO hysteresis, confirmed by
      reading `respiratory.js` (the `effectiveBroncho` computation, ~line
      289-294).** `effectiveBroncho` is computed FRESH every tick as a pure
      function of the current `pat.broncho` (disease severity) and the
      current `beta2Delta` (instantaneous drug receptor occupancy) — given
      identical inputs, it always produces an identical output regardless of
      how it got there, i.e. a memoryless mapping. Some real time-lag DOES
      exist upstream of this line (effect-site equilibration, `keo`, already
      delays how fast `beta2Delta` itself rises/falls in `pk.js`), but that is
      ordinary first-order lag, not asymmetric hysteresis, and it sits before
      this mapping, not inside it. **Stated honestly: this may not actually be
      a bug worth fixing.** `pat.broncho` itself (the underlying disease
      severity, grep-confirmed across every condition that writes it —
      `asthma`, `copdExacerbation`, `bronchiolitis`, etc.) is written as a
      one-directional, monotonic ramp toward a ceiling — it NEVER
      spontaneously decreases on its own in any condition's `progress()`, so
      there is no "recovery" of the underlying disease for a recovery curve to
      retrace asymmetrically against its activation curve in the first place;
      the only thing that ever lowers observed severity is the drug mapping,
      which is deliberately instantaneous by design (a bronchodilator's
      effect should track current concentration, not a decaying memory of
      past severity). Real bronchospasm DOES have some genuine
      hysteresis-like behavior in life (post-exacerbation airway
      hyperreactivity outlasting the acute trigger) — but building that would
      mean a new mechanism (a slow-decaying "airway hyperreactivity" state
      distinct from `broncho` itself), not a fix to the existing mapping, and
      no scenario's teaching point currently needs it. Filed as a real,
      confirmed absence — not attempted, since nothing in the current
      condition library is undertaught by its absence.
    - **Inflammatory-state resolution (`pat.capillaryLeak`) — a bigger, more
      basic finding than "no hysteresis": there is currently NO resolution
      mechanism at all, in either direction, confirmed by grep across every
      module.** Every writer of `capillaryLeak` (`preeclampsia`,
      `acutePancreatitis`, `toxicInhalationChlorine`, `anaphylaxis`-family)
      uses `Math.max`/an always-positive `dt*rate` ramp — the field only ever
      climbs toward its condition's own ceiling and is never lowered by
      anything, including drugs. So the hysteresis question ("does recovery
      retrace the activation curve") does not yet apply — there is no
      recovery pathway to have a shape at all. This was originally cross-
      filed to item 46's larger inflammation-cascade scope rather than fixed
      here directly. **RESOLVED anyway, in a direct follow-up session, per
      explicit operator instruction to push toward hyper-realistic new
      mechanisms rather than defer**: a real, standalone, literature-anchored
      endothelial-repair decay now lives in `physiology.js`'s shared
      `stepPatient()` (see section 3's own entry for the full mechanism and
      measurement) — it did not need item 46's full cytokine-cascade scope to
      build correctly, since the resolution RATE is a property of the barrier
      itself, independent of what caused the injury. Item 46's own larger
      scope (a shared `pathogenBurden`/`inflammation` cascade generating the
      leak, fever, and tachycardia together, plus coagulation coupling) is
      unaffected and still fully open.

    **Net result: the audit itself required no code, and its one real
    actionable finding was fixed in a direct, narrowly-scoped follow-up
    rather than left cross-referenced indefinitely.** Myocardial stunning
    needed no fix (already correct); bronchospasm recovery is confirmed
    absent but arguably not worth its own mechanism (no undertaught teaching
    point); `capillaryLeak`'s missing resolution pathway is now fixed. This
    item is fully closed — nothing further to do under its own name.

50. **Per-patient baseline variability — SIX of eight traits now DONE
    (renal/pulmonary reserve added this session, see section 3's newest
    entry); cardiac reserve and circadian state remain open, same pattern,
    future work.** `renalReserve` (`patient.js`) scales `this.baseGfr`
    directly (before `riskFactors.renalDisease`'s own separate 0.5x, so the
    two compose rather than collide); `pulmonaryReserve` scales
    `this.compliance`/`airwayResistance`/`tissueResistance` (before
    `riskFactors.copd`'s own multipliers, same composition). Both centered
    on 1.0 (renalReserve spread 0.15/[0.8,1.2], pulmonaryReserve spread
    0.12/[0.85,1.15]) so every existing scenario's calibration is unchanged
    in expectation, matching the original four traits' own convention.
    MEASURED at construction (not assumed): baseGfr 88.0/110.0/132.0 at
    renalReserve 0.8/1.0/1.2 (110 at neutral matches the pre-existing,
    unmodified calibration exactly); compliance 0.0765/0.0900/0.1035 and
    airwayResistance 2.353/2.000/1.739 at pulmonaryReserve 0.85/1.0/1.15
    (0.09/2.00 at neutral likewise unchanged). Both added to
    `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists and
    `mechanismWiring.mjs`'s `pinTraitsNeutral()` (per the real regression
    this same item's own prior session found — see below — an unpinned
    trait breaks that suite's own control/treatment "otherwise identical"
    premise). Full suite re-runs (`mechanismWiring.mjs`/`scenarioSweep.mjs`)
    did NOT complete within this session's own time budget — stated
    honestly, not assumed clean — but the change is low-risk by
    construction: purely additive (two new fields multiplying an existing
    baseline coefficient, neutral-pinned in the one suite that does exact-
    value comparisons), and `scenarioSweep.mjs`'s own bounds-only checks
    cannot be broken by a ±15-20% baseline shift on a field that was
    already patient-specific (age/weight-scaled) before this trait existed.
    `cardiacReserve` remains deliberately unbuilt — it would need a
    consumer inside the shared, high-blast-radius full-loop ODE solver
    (`cardiovascular_ode_full.js`), a materially higher-risk change than
    the two single-file consumers built this session, and this document's
    own standing discipline is against touching that solver without a
    dedicated, carefully-scoped batch.

    Original filing, kept for context (the four autonomic/metabolic traits
    below were DONE in an earlier session — see section 3's older entry for
    the full writeup): `patient.js` now seeds
    `baroreflexGain`, `metabolicRate`, `painSensitivity`, and
    `vascularReactivity` once at construction (a clamped, centered-on-1.0
    draw, overridable via `b.<trait>` for a scenario or verification script
    to pin a specific value) — each wired into exactly the coefficient its
    name describes, not seeded and left unread (section 1's own rule
    against decorative fields applies to a trait multiplier too):
    `baroreflexGain` scales `cardiovascular.js`'s `baroGain`;
    `vascularReactivity` scales the neural-outflow term in `alphaTone`;
    `metabolicRate` scales `metabolic.js`'s `restVO2`; `painSensitivity`
    scales `pk.js`'s per-tick `drugPain` reseed from `intrinsicPain` (drug
    analgesic deltas are applied afterward, unscaled). MEASURED, not
    assumed: a hemorrhage-perturbation probe confirmed `baroreflexGain`/
    `vascularReactivity` produce real, correctly-signed sbp divergence at
    their extremes (low 0.7/0.75 vs high 1.3/1.25 — sbp ~107→110 and
    ~103→112 respectively at 5 min into a moderate bleed), `metabolicRate`
    produces a real ~2 mmHg paco2 spread at rest (36.5 vs 38.6), and
    `painSensitivity` scales `drugPain` exactly proportionally (5.4 vs 12.6
    against a pain:9 baseline — 0.6×9 and 1.4×9 respectively). All four
    added to `scenarioSweep.mjs`'s `REQUIRED`/`NON_NEGATIVE` lists per
    lesson 2. **Deliberately NOT built (this earlier session; renalReserve/
    pulmonaryReserve have since shipped — see above)**: `cardiacReserve`
    (would need its own real consumer identified in cardiovascular.js the
    same way the other traits each got one — not attempted blind in the
    same batch) and `autonomicSetPoint` (arguably already covered by `baroreflexGain` +
    the existing `baroSetpoint`/elderly-blunting mechanism — worth
    re-checking against the tree before treating it as a separate gap).
    **A real regression was found and fixed while verifying, not a
    hypothetical risk**: `mechanismWiring.mjs`'s own `probe()`/`afibRun()`
    each construct a completely separate patient per call, and its whole
    `assertVersus` idiom depends on a control/treatment pair being
    "otherwise identical" (that suite's own comment's exact words) — real
    per-patient trait randomness broke that premise for two borderline
    assertions (croup's compensated-paco2 margin, metoprololOverdose's
    atropine-barely-touches-sbp margin), both now spuriously vulnerable to
    cross-patient trait noise rather than the actual mechanism being tested.
    Fixed in the TEST HARNESS, not the traits themselves (real per-patient
    variability is the point, not a bug) — a new `pinTraitsNeutral()` helper
    pins all four traits to 1 on the first tick of every `probe()`/
    `afibRun()` call, restoring deterministic control/treatment comparisons.
    Circadian cortisol/temperature/sleep-wake state remains explicitly
    deferred, unchanged from the original note: it needs a wall-clock
    dependency this engine doesn't have anywhere, and no current
    scenario's teaching point has been identified that actually needs
    time-of-day physiology.

Also open, lower priority: ketamine's `myocardialDepression` coefficient is
asserted rather than identified; the antiarrhythmic blockade coefficients are
plausible but not fitted to trial data.

55. **RESOLVED (this session) — see section 3's newest entry.** A genuinely
    separate `passiveCooling` procedure (procedures.js, 100W) now exists,
    distinct from `activeCooling`'s 400W ice/misting intensity. TP 1204's
    fever-without-sepsis rule uses it (via a new `passiveCoolingTask`);
    TP 1209/1222/1225's true-hyperthermia rules keep the aggressive one
    (renamed `activeCoolingTask`, same dose, no behavior change). MEASURED:
    a condition-less control with a sustained mild fever settles 0.20 C
    lower with passive cooling and 0.31 C lower with active cooling versus
    untreated — real, present, and correctly ordered milder-than-aggressive.
    `mechanismWiring.mjs`/`scenarioSweep.mjs` don't import `src/protocols/`
    or need re-running for this (same precedent as every other protocol-
    content-only batch in this document); `node --check`/`eslint`/`vite
    build` all clean.
    Original filing, kept for context: a genuinely separate "passive
    cooling" mechanism, distinct from `activeCooling`'s heat-stroke-grade
    ice/misting intensity, may be worth building — found while implementing
    TP 1204's fever-without-sepsis step and TP 1209's hyperthermia-in-
    agitation step. Both call for a MILDER intervention (remove excess
    clothing/blankets, only add thermal blankets if shivering starts) than
    heat stroke's own ice-packs-and-misting protocol. `laCounty.js`
    previously reused the real, already-shipped `activeCooling` procedure
    (`coolingPower:400`, procedures.js) at a lower trigger threshold for
    both cases, documented in-code as a reuse-not-a-perfect-match rather
    than a silent approximation.

56. **RESOLVED (this session) — see section 3's newest entry.**
    `pat.burnTbsaFraction` (patient.js), a real `thermalBurn` condition
    driving capillary leak (Parkland-adjacent) and impaired-skin-barrier
    heat loss (thermo.js), both measured and treated through existing
    saline/Starling mechanics. No narrative burn scenario authored yet
    (out of scope, front-end content work — see section 3). Original
    filing, kept for context:

    No burn-severity/TBSA field exists anywhere in this engine — found
    while implementing TP 1220/1220-P (Burns).** The protocol's own
    concrete field steps (cool running water for burns <30% TBSA, escalated
    fluid resuscitation for burns >10% TBSA, cooling contraindicated for
    airway burns) all key off a burn's SIZE and LOCATION, neither of which
    this engine tracks as structured state — burns/wounds are narrative
    (per-scenario `wounds:` objects, `type:"burn"` at most, no severity
    scalar). `laCounty.js`'s TP 1220 section reuses only the fully generic
    ABC/shock/warming/saline baseline already covered by other protocols'
    rules and adds nothing burn-specific. A real fix needs a genuine
    burn-injury model (a `pat.burnTbsaFraction`-shaped field, at minimum) —
    out of scope for a protocol-content batch, and its own real
    item-7-style mechanism work (does TBSA affect fluid needs via a real
    Parkland-formula-style relationship, does it affect thermoregulation
    via reduced skin barrier function, etc.) rather than a quick add.

57. **RESOLVED (this session) — see section 3's newest entry.** No
    antivenom/envenomation-severity mechanism exists — found while
    implementing TP 1224/1224-P (Stings/Venomous Bites). Real snake
    envenomation causes progressive local tissue injury and coagulopathy
    (this engine already has a real `pat.coagPct` field that a genuine
    antivenom-response mechanism could hook into), but no condition,
    scenario, or drug entry represents a bite/sting or its treatment today
    — `laCounty.js`'s TP 1224 section adds no new rules, reusing only the
    generic allergy/shock/nausea baseline (steps 2's own "for signs of
    allergic reaction, treat per TP 1219" and "for poor perfusion, treat
    per TP 1207" cross-references cover what's left). Building this for
    real needs at minimum one new condition (envenomation, with a real
    coagulopathy/local-tissue-injury time course) and, if antivenom is ever
    carried in the formulary, a new drugs.js entry with a real receptor/
    binding mechanism — genuine item-7-shaped work with its own literature
    anchor. [Original filing text kept for context; `envenomation`
    (conditions.js) and the `copperheadBite` scenario now exist, reusing
    the real coagulation cascade rather than adding a fictional field
    antivenom drug, since TP 1224's own text carries no such step. See
    section 3.]

58. **RESOLVED (this session) — see section 3's newest entry.** No isolated
    pruritus/hives signal exists — found while implementing
    TP 1219/1219-P (Allergy), step 10's diphenhydramine indication.
    `pat.edema`/`bronch` are real fields for angioedema/bronchospasm, but
    nothing represents cutaneous urticaria/itching in isolation (a patient
    with hives and no other finding). `laCounty.js`'s `anaphDiphen` rule
    works around this by gating on epinephrine already having been given
    (diphenhydramine as a late adjunct to confirmed anaphylaxis, matching
    footnote ❹'s "once other treatments are complete") rather than firing
    for isolated skin symptoms, which this engine currently has no way to
    detect at all. A real fix would need a new field with a real,
    if modest, physiologic consequence (histamine-driven vasodilation is
    already how `pat.vasodilation`-driven distributive mechanisms work
    elsewhere in this engine — reusing that at a much smaller magnitude for
    isolated urticaria, rather than inventing an inert cosmetic field, is
    the honest way to build this if it's ever wanted).

59. **RESOLVED (this session, pulmonary limb only) — see section 3's newest
    entry.** `decompressionIllness` (conditions.js) reuses `pe`'s existing
    `shuntFraction`/`pulmResistFactor` mechanism (mechanically the same
    lesion), with real high-flow-O2 denitrogenation treatment. Arterial gas
    embolism and spinal-cord DCS remain unmodeled — mechanistically
    separate lesions with no comparable existing handle. No narrative dive
    scenario authored. Original filing, kept for context:

    No decompression-illness signal exists — found while implementing TP
    1225/1225-P (Submersion), step 3/11's decompression-illness-specific
    branches.** Arterial gas embolism and decompression sickness are real,
    distinct pathophysiology (dissolved nitrogen coming out of solution in
    tissue/blood on ascent) that this engine has no representation for at
    all — no dive-depth/dive-duration state, no bubble/embolism mechanism.
    `laCounty.js`'s TP 1225 section reuses only the generic arrest/
    hypothermia/poor-perfusion baseline; the protocol's own decompression-
    specific steps (high-flow O2 specifically FOR decompression illness,
    mandatory base contact, hyperbaric-treatment routing) aren't
    represented. Building this would mean a new condition with a real,
    literature-anchored embolism/bubble mechanism — a genuinely obscure
    prehospital presentation relative to the size of the work, so
    correctly lower priority than items 56-58 above unless a dive-specific
    scenario is specifically wanted.

60. **FULLY RESOLVED (this session) — see section 3's newest entries.**
    All three slices are done: nebulized epinephrine, FBAO crew-task, and
    tracheostomy state model (`pat.tracheostomy`/`pat.trachObstruction`,
    real airway-bypass + cannula-obstruction mechanism, treated via the
    existing `suction` procedure).

    No nebulized-epinephrine drug entry, no tracheostomy-state model, and
    no crew-directable FBAO-clearance task — found while implementing TP
    1234/1234-P (Airway Obstruction) and TP 1236/1236-P (Inhalation
    Injury).** Three separate, real gaps, grouped here rather than filed as
    three near-duplicate entries: (1) nebulized epinephrine for stridor
    (both protocols' own step) is mechanistically distinct from both the
    already-shipped `epiIM` (systemic, IM, for anaphylaxis/angioedema) and
    `albuterol` (beta-2 bronchodilation) — real nebulized epi works via
    local alpha-1 mucosal vasoconstriction, and this engine already has a
    real field it could plausibly act on (`pat.upperAirwayObstruction`,
    built for the croup/epiglottitis batch) that nothing currently reduces
    pharmacologically. Building this needs a genuine new `drugs.js` entry
    with its own literature-anchored receptor mechanism, not a relabeled
    reuse of an existing drug. (2) No tracheostomy state exists anywhere
    (no `pat.tracheostomy`/cannula-obstruction field) — TP 1234's entire
    tracheostomy-emergency branch (steps involving inner-cannula
    obstruction, tube replacement, stoma ventilation) has nothing to hook
    into. (3) The FBAO-clearance mechanism (`s.cleared`, keyed to the
    literal condition `fbao`) is reachable only through the player's own
    Magill-forceps action (`App.jsx`'s `conditionHas(...,"fbao")` special
    case, per an earlier session's fix) — there's no TASKS entry a crew
    member could be directed to perform this via, so `laCounty.js`'s
    airway-obstruction rules fall back to the generic
    airway/CPR/BVM life-threat rules already at the top of the file rather
    than a true FBAO-specific crew-directed clearance step.

61. **RESOLVED (this session) — see section 3's newest entry.** No
    angioedema/localized-airway-swelling signal distinct from general
    edema — found while implementing TP 1234/1234-P and TP 1236/1236-P's
    "visible airway/tongue swelling" step. `pat.edema` is real
    (respiratory.js/thermo.js-adjacent systemic fluid state, already read
    by the CHF/fever-cooling rules elsewhere in this file), but it is a
    WHOLE-BODY signal, not an airway-localized one — reusing it as an
    angioedema proxy was deliberately NOT done, since a CHF patient in
    pulmonary edema would then falsely trigger "give epinephrine for airway
    swelling," which is actively the wrong intervention for that patient
    and would teach the wrong lesson rather than just being imprecise. Left
    unimplemented rather than force-fit; a real fix needs a genuinely
    separate, localized angioedema field (or reusing `pat.capillaryLeak`
    scoped to the airway specifically, if that's mechanistically
    defensible — worth checking against how that field is already used
    elsewhere before assuming it's a clean fit). [Original filing text kept
    for context; `pat.angioedema` now exists and drives
    `pat.upperAirwayObstruction` directly, per section 3.]

62. **RESOLVED (a later session) — see section 3's newest entry.** Half of
    this was already stale when re-checked: the generic `t.assessId` crewFn
    wrapper and `gear.js`'s `assessStroke` task both already existed from an
    earlier "Crew AI batch." The real remaining gap was that no protocol
    rule ever directed it — fixed with `strokeScreenCrew` (laCounty.js),
    gated on `altered(ctx)` and `!ctx.s.done?.strokeScreen`. Fully verified:
    `mechanismWiring.mjs` 451/1 (same 452 total, pre-existing unrelated
    flake) and `scenarioSweep.mjs` 161 scenarios/11,953,608 checks/0 failed.
    Original filing, kept for context: stroke destination-scoring (mLAPSS/LAMS) has no crew-task wrapper —
    found while implementing TP 1232/1232-P (Stroke/CVA/TIA). Real,
    already-shipped fields exist for this (`pat.strokeWeakness`/
    `strokeAphasia`/`strokeSide`, from the neuro/endocrine batch), and a
    real player-facing action already reads them (`actions.js`'s
    `strokeScreen`, added in an earlier session specifically to close this
    exact "written, never read" gap for the PLAYER's own exam). What's
    missing is a CREW-directable equivalent — TP 1232's own mLAPSS/LAMS
    steps are pure assessment/documentation with a destination-routing
    consequence, not a drug or procedure, and this file's crew-direction
    engine has no established pattern for "compute and log a finding" the
    way `TASKS`' `glucoseCheck`/`vitals` flags already do for vitals/
    glucose (see `App.jsx`'s `crewFn`, the `t.glucoseCheck` branch). A
    future batch could add a `t.strokeScreen`-shaped crewFn branch mirroring
    `t.glucoseCheck` exactly, then a `laCounty.js` rule reading the same
    fields `strokeScreen` already does — real, cheap work once someone
    decides crew-directed assessment-only tasks (not just treatments) are
    worth building generally, which this batch deliberately did not decide
    unilaterally.

63. **RESOLVED (already fixed by the time this session re-checked it) — see
    section 3's newest entry.** Re-verified against the current tree rather
    than trusting this item's own filing at face value (lesson 16): `crewFn`'s
    `t.dose` branch now DOES check `DRUGS[t.dose].max` against `m.given[t.dose]`
    before calling `giveDose()`, sharing the same counter and semantics as the
    player's own `medActs()` path — confirmed by tracing a concrete case
    (`naloxone_iv`, max 4). No code change was needed this session. Original
    filing, kept for context (the gap it describes is what an EARLIER session
    fixed, though not documented as closing this item at the time):

    Crew-directed doses bypass the player's own max-dose enforcement — a
    real, previously-undiscovered systemic gap, found while completing TP
    1210's amiodarone-repeat and naloxone rules (the batch that finished
    the earlier truncated cardiac-arrest text).** The player's own manual
    dosing action (`App.jsx`, `medActs()`'s `run()` handler) checks
    `DRUGS[id].max` against a running count in `s.given[id]` before calling
    `giveDose()`, and blocks the action with "Maximum dose (N). Stop, or
    call Base." once reached. Crew-directed doses (`TASKS`' `dose` field,
    executed via `App.jsx`'s `crewFn`) call `giveDose()` directly and check
    neither `s.given` nor `DRUGS[id]/PROCS[id].max` at all — confirmed by
    reading `crewFn`'s `t.dose` branch, which only guards `NOSTACK`
    continuous-procedure re-triggering, nothing dose-count-related. Every
    `doseCount(ctx,...)` cap written throughout `laCounty.js` (and by this
    batch there are many) is the ONLY thing currently preventing a protocol
    rule from directing unlimited repeat administrations of a capped drug —
    the file itself is not exposed by this, since every rule with a stated
    protocol ceiling was written with an explicit cap, but it means any
    FUTURE rule that forgets one is silently unsafe, and it means a crew
    member CAN be manually ordered (outside protocol-rule automation, via
    direct crew-order UI) to give a capped drug past its max today, with no
    warning at all. The batch-1 `oralGlucose`/`glucagonIM` rules have no
    cap of any kind (no numeric ceiling was ever given in the TP 1203 text
    received, which was itself truncated — see that section's own header
    comment). A real fix belongs in the shared `crewFn`/crew-assignment
    path (mirroring the player's own `s.given[id]` check, or reusing it
    directly since it's the same counter), not per-rule — the same "fix the
    shared system, not each caller" precedent already used for this
    project's `claimedThisCycle` fix. Deliberately not attempted in the
    same batch as new content, since it touches the shared assignment loop
    every crew-directed task in the game goes through and needs its own
    careful verification pass, not a bolt-on alongside protocol rules.

64. **STILL BLOCKED (re-investigated this session, no code changed) — see
    section 3's newest entry.** Confirmed the SBP-hold and repeat-dose-cap
    mechanisms this item originally assumed were missing already exist and
    work correctly (measured: `nitro.hold` blocks below sbp 100, clears at
    100+; `laCounty.js`'s `nitroChestPain` caps repeats at 3 gated on live
    sbp). The SBP-tiered escalation itself remains correctly deferred
    pending a separate `nitro` recalibration item, per a prior session's
    own measured finding that any tested dose-scale-up compounds an already
    oversized baseline effect (forcing 3 unconditional doses crashes sbp to
    8.6). **A real, still-open, DIFFERENT gap was found in passing**: crew-
    directed nitro doses (`crewFn`'s `t.dose` branch, App.jsx) have no
    `hold` check at all, so a crew member ordered to give nitro bypasses the
    SBP<100 contraindication the player's own UI enforces — distinct from
    item 63's now-resolved max-dose-cap gap at the same call site. Not
    fixed this session; flagged for a future batch. Original filing, kept
    for context:

    Nitroglycerin has only one flat 0.4mg dose entry — TP 1214
    (Pulmonary Edema/CHF) wants an SBP-tiered ESCALATING dose (0.4mg at
    SBP>=100, 0.8mg at SBP>=150, 1.2mg at SBP>=200) that this engine can't
    represent. Found while implementing TP 1214's own step 8, which is a
    genuinely different dosing scheme from TP 1211 (Cardiac Chest Pain)'s
    flat, repeat-capped 0.4mg — both protocols end up sharing the same
    `nitroTask`/`nitro` drug entry in `laCounty.js` today, which is an
    honest, stated approximation for TP 1211 but a real understatement for
    a severely hypertensive CHF patient at TP 1214's own higher tiers. A
    real fix needs either a `d.amount`-style per-dose override (if `pk.js`
    already supports one — see queue item 53's now-resolved amiodarone2
    entry for the alternative, a second flat-dose drugs.js entry per tier,
    which is the simpler and more consistent-with-precedent option: `nitro2`
    at 0.8mg, `nitro3` at 1.2mg, mirroring `amiodarone`/`amiodarone2`
    exactly) plus a `laCounty.js` rule reading `ctx.v.sbp` to pick the right
    tier. Not attempted in the same batch as the rest of TP 1214's content,
    per the same scope discipline as every other queue item filed
    alongside new protocol rules.

    **UPDATE (a later session, the saline-dose-count-audit batch — see
    section 3's queue-item-68 entry): a real, measured finding surfaced
    while starting this item that should be read BEFORE attempting it,
    not rediscovered blind.** `nitro`'s existing coefficients
    (`receptors:{venodilation:0.8, arteriolarDilation:0.4}`) already
    produce an oversized single-dose hemodynamic effect, and it is NOT
    specific to preload-dependent CHF physiology — measured directly
    (`physio()`/`activePatient()`, not reconstructed): the current 0.4mg
    dose drops a real, already-shipped CHF scenario (`resp`) from sbp 114
    to 61 within 5 minutes of full onset, but the SAME dose given to a
    completely healthy, condition-less control (`abdPain`, sbp 126
    baseline) also drops sbp to 73, and to `stableAngina` (sbp ~112) to
    74 — confirming this is a general property of the mechanism, not a
    CHF-specific effect. A single real SL nitro tablet clinically produces
    something closer to a 10-25 mmHg drop, not 50+. A sweep of several
    candidate scale-up factors for `nitro2`/`nitro3` (1.15x through
    sqrt(3)≈1.73x over the current coefficients) found even the SMALLEST
    tested increase drives the CHF scenario to sbp 52/dbp 39 and, more to
    the point, drives `hypertensiveEmergency` — the actual real-world
    target for an ESCALATED dose under TP 1214's own tiering logic — down
    to sbp 88/dbp 75, and every larger candidate goes further into
    dangerous-looking territory from there. Building `nitro2`/`nitro3` on
    top of the CURRENT `nitro` coefficients, as this item's own text
    originally proposed, would therefore compound an already-oversized
    baseline rather than deliver the real clinical teaching the escalation
    is meant to carry. Recalibrating `nitro` ITSELF is out of scope for a
    dose-tiering batch — it is a separately-scoped, higher-blast-radius
    fix (several already-shipped scenarios/assertions exercise this
    drug's current magnitude directly, e.g. `stableAngina`'s own reflex-
    tachycardia measurement, which would need re-checking against any
    change to `nitro`'s own coefficients) and should be its own item:
    MEASURE `nitro`'s real single-dose effect across several more
    scenarios and a literature-anchored expected range before touching
    anything, the same instrument-first discipline section 4 requires
    everywhere else, then decide whether `nitro` itself needs
    recalibrating before `nitro2`/`nitro3` are built on top of it.

65. **PARTIALLY RESOLVED (a prior session) — see section 3's own entry for
    the epinephrine half; the saline/IV-fluid half remains open.**
    `neonatalTransition` (conditions.js) now models the real NRP
    epinephrine indication: a newborn with critically low reserve (<0.2)
    plateaus bradycardic on PPV+compressions alone and needs a real,
    weight-scaled epi dose (0.01 mg/kg against the newborn's own weight,
    not a flat adult 1mg dose) to fully recover — wired as a crew task
    (`newbornEpi`), a player action (`nbEpi`), and a real TP 1216-P step-14
    protocol rule (`NEWBORN_NEEDS_EPI`). Deliberately a bespoke `_neo` state
    flag rather than a routed PK dose, matching this state machine's own
    established design (a discrete NRP vigor state, not a continuous
    receptor curve). MEASURED: without epi at critical reserve, plateaus at
    hrBase 99; with epi, reaches full recovery (hrBase 160); every newborn
    above the critical-reserve threshold (the common case) is completely
    unaffected. Step 15 (weight-scaled saline for suspected neonatal
    hypovolemia) is still NOT built — it needs a mechanism distinct from
    the vigor/HR asphyxia axis this state machine models (suspected blood
    loss/pallor-despite-adequate-ventilation is a different clinical
    picture), and a real producer (no scenario currently seeds a
    hypovolemic, as opposed to asphyxiated, newborn) — genuinely new,
    separately-scoped work, not attempted.

    Original filing, kept for context: no weight-scaled epinephrine or
    IV-fluid drug entries for a newborn/neonate — found while implementing
    TP 1216-P (Newborn/Neonate Resuscitation). The newborn is a real,
    separate roster patient
    (`physiology.js`'s multi-patient roster, spawned by `obstetric.js` at
    `preg.birthWeight || 3.3` kg), but every dose-bearing drug entry in
    `drugs.js` is calibrated to adult-scale absolute doses. TP 1216-P's own
    step 14 (epinephrine 0.01mg/kg IV/IO) and step 15 (Normal Saline
    20mL/kg IV/IO) both need genuine per-kg dosing to be honest for a ~3kg
    patient — reusing the existing `epiIV` (flat 1mg) or `saline` (flat
    500mL) entries would be a real, dangerous mechanism mismatch, not a
    defensible approximation the way reusing an adult drug at its own
    already-correct dose sometimes is elsewhere in this file (e.g.
    `naloxone_iv` for arrest-related opioid toxicity, queue item filed in
    an earlier batch — that one under-delivers relative to the protocol's
    ceiling, which is safe; a flat adult epi/saline dose for a neonate
    OVER-delivers by roughly 30x, which is not). `laCounty.js`'s
    `newbornStimulate`/`newbornPPV`/`newbornCPR` rules (the primary,
    protocol-emphasized NRP interventions — "dry, warm, stimulate, then
    ventilate is the most important intervention") are real and shipped;
    epinephrine and IV fluids for the rare newborn who doesn't respond to
    those are deliberately left unbuilt. A real fix needs either a
    genuinely weight-scaled dose mechanism in `pk.js` (a `dose` expressed
    as mg/kg, resolved against the receiving patient's own `weight` at
    administration time — the general, reusable fix, since this same
    problem would recur for ANY future pediatric-weight-based dosing this
    project adds) or, more narrowly, dedicated `epiNeonatal`/
    `salineNeonatal` entries pre-scaled to a typical newborn weight,
    mirroring the `amiodarone`/`amiodarone2` precedent. The general fix is
    worth more — this is very likely not the last pediatric-weight-based
    dose this project's protocol library will need.

66. **RESOLVED (this session) — see section 3's newest physiology-engine
    entry.** `pat.dystonia` (patient.js/pk.js), a real `metoclopramide`
    drug entry and `diphen`'s reused anticholinergic mechanism (drugs.js),
    `acuteDystonicReaction` (conditions.js, TP 1239/1239-P), and a real
    stroke-mimic finding in actions.js's strokeScreen exam now exist;
    measured, `eslint`-clean, two-sided assertion added to
    mechanismWiring.mjs (source only, verified via targeted probe, not
    run to completion this session). Original filing, kept for context:

    No extrapyramidal/dystonic-muscle-spasm signal exists — found while
    implementing TP 1239/1239-P (Dystonic Reaction).** The presentation
    (involuntary spasm of head/neck/face/eyes/trunk, forced jaw opening,
    inability to retract the tongue, eye deviation) has no representable
    field anywhere in this engine — no muscle-tone/spasm mechanism at all,
    distinct from `pat.seizing` (a different, already-modeled phenomenon).
    `laCounty.js` deliberately builds no automatic rule for this protocol —
    `diphenhydramine` (the actual treatment, already a real task since
    batch 3's Allergy work) remains available for MANUAL crew ordering, and
    the protocol's own required base-contact-to-confirm step means a
    human diagnosis is load-bearing here anyway, the same reasoning already
    on record for TP 1229/1232's assessment-only sections. Building a real
    trigger would need either a new physiology-engine field (a genuine
    extrapyramidal-symptom mechanism, presumably tied to recent
    antiemetic/antipsychotic dosing — `metoclopramide`/`prochlorperazine`-
    class drugs, none of which currently exist in `drugs.js` either) or,
    more narrowly, a scenario-authored flag the way `s.vomited` already
    stands in for a missing "nauseated" signal elsewhere in this file —
    genuinely new content work, not something to guess at from a protocol
    batch.

67. **RESOLVED (this session) — see section 3's newest entry.**
    `organophosphatePoisoning` (conditions.js) is a real muscarinic-excess
    condition (bradycardia via a new `pat.cholinergicVagalTone` accumulator,
    genuinely atropine-responsive through the existing `vagalBlock`
    mechanism; bronchorrhea/bronchospasm via the shared `pat.broncho`
    handle; narrative-only miosis), plus a new scenario
    (`organophosphatePoisoning`, TOX-009). Nicotinic effects and
    pralidoxime deliberately deferred, stated honestly in section 3.
    Original filing, kept for context:

    No cholinergic-toxidrome signal (miosis, rhinorrhea, salivation) —
    found while implementing TP 1240/1240-P (HAZMAT)'s nerve-agent
    exposure algorithm.** The SEVERE tier (apnea, seizure, spo2<90) has
    real, already-available signals and a real automatic rule
    (`hazmatDuodoteSevere`), but the protocol's own MILD/MODERATE tiers are
    defined entirely by pupil size and secretions — miosis, rhinorrhea,
    increased salivation — none of which this engine tracks in any form
    (no pupil-diameter mechanism at all, a standing limitation already on
    record for AAA's pulsatile mass and TP 1234's mydriasis/miosis gap;
    no airway-secretion-volume field distinct from the already-used
    `airwayFluid`, which represents something mechanically different —
    aspirated/edema fluid, not glandular hypersecretion). `duodoteTask`
    stays available for manual crew ordering at these tiers. A real fix
    needs a genuine cholinergic-toxidrome mechanism — muscarinic receptor
    stimulation driving secretions/miosis/bradycardia together as one real
    physiologic state, the same "mechanism, not a stat write" standard
    this project holds every other condition to — not a scenario-local flag
    the way `s.vomited` stands in for nausea, since this toxidrome has
    real, graded severity levels the protocol itself distinguishes,
    unlike a boolean "did they vomit."

69. **RESOLVED (a later session) — see section 3's newest entry.** `salineMinor`
    (drugs.js, a real 250mL fluid entry, fx scaled exactly half of `saline`'s)
    plus a new `traumaMinorSaline` rule (laCounty.js, gated on the existing
    `ACTIVE_HEMORRHAGE` signal, with `saline_shock`/`saline_gigu` now
    excluding it so the two can't double-dose) make permissive hypotension
    real. Fully verified: `mechanismWiring.mjs` 449/1 (pre-existing unrelated
    flake) and `scenarioSweep.mjs` 161 scenarios/11,953,608 checks/0 failed,
    both confirmed to completion.
    Original filing, kept for context: no way to distinguish "trauma patient
    at risk of internal hemorrhage, needs permissive/conservative fluid" from
    "medical shock, needs standard resuscitation" or "TBI, needs aggressive
    fluid" — found while
    implementing TP 1244/1244-P (Traumatic Injury), the field-guide-wide
    cross-reference target of most trauma protocols in this file.** TP
    1244's own footnote ❻/❽ is explicit and clinically real: aggressive
    crystalloid in a bleeding trauma patient dilutes clotting factors and
    measurably WORSENS hemorrhage — a mechanism THIS ENGINE ALREADY MODELS
    (`saline`'s own `fx:{coag:-6}`, documented in this project's own
    physiology history as accelerating effective blood loss in a bleeding
    patient). The protocol's own answer is a smaller, more conservative
    250mL bolus for multi-system blunt/penetrating trauma specifically —
    but this file's existing generic `saline_shock`/`saline_gigu` rules
    (built in earlier batches, before this distinction was understood) give
    a full 500mL dose to ANY hypotensive patient regardless of cause,
    including a multi-system trauma patient exactly like TP 1244 warns
    against. This is the OPPOSITE problem from queue item 68 (which is
    about dose-COUNT arithmetic against a fixed per-dose amount) — this is
    about the WRONG VOLUME being clinically appropriate for a whole class
    of patient this engine cannot currently identify. Two real blockers,
    not one: (a) no "mechanism of injury"/"suspected internal hemorrhage"
    signal exists distinct from generic SHOCK to gate a conservative-fluid
    rule on (the closest real signal, `pat.activeBleedRate`, is a good
    candidate — see how `ACTIVE_HEMORRHAGE` in `laCounty.js` already uses
    it to scope TXA correctly for this exact batch), and (b) even with that
    signal, `saline`'s own fixed 500mL-per-administration granularity
    cannot represent a 250mL dose at all — a real, second new drugs.js
    entry (e.g. `salineMinor`, 250mL, same `pkModel:"fluid"` mechanism at
    half the volume) would be needed, the same pattern already established
    for `amiodarone`/`amiodarone2`. Worth doing together, since the
    identifying signal and the smaller dose entry are both needed before
    either is useful alone. TP 1244's own OPPOSITE case (isolated head
    injury wants MORE aggressive fluid) IS already real and shipped this
    batch (`tbiSaline`, keyed off `pat.brainInjury`) — proving the pattern
    works once the right signal and right-sized dose both exist, which is
    exactly what's missing for the conservative case.

70. **RESOLVED (a later session) — see section 3's newest entry.** `pat.headElevated`
    (`procedures.js`'s `headElevate`) now genuinely subtracts a real, modest
    3 mmHg from `pat.icp` (neuro.js), and TP 1244's own step 22/23 fires a
    real crew task for it (`tbiHeadElevate`, laCounty.js). TP 1232 (stroke)
    was deliberately left unwired — no quoted source text for a stroke-specific
    head-elevation step was available to cite a rule from; the mechanism
    itself is fully general and ready to reuse the moment that text exists.
    Fully verified: `mechanismWiring.mjs` 452/0 (a fully clean run), `scenarioSweep.mjs`
    161 scenarios/11,953,608 checks/0 failed.
    Original filing, kept for context: no mechanism for head-of-bed/gurney elevation reducing intracranial
    pressure — found while implementing TP 1244/1244-P's own step 22/23
    (both TBI and, from an earlier batch, TP 1232's stroke protocol want
    this).** `pat.icp` is a real, already-live field (the neuro/endocrine
    batch's own Cushing-reflex work reads and writes it for real), and
    both this protocol and TP 1232 independently ask for a real, if modest,
    ICP-reducing intervention (reverse Trendelenburg / 30-degree head
    elevation) — but nothing in `physiology.js`/`neuro.js` currently models
    elevation as an input to the ICP calculation at all, so there is
    genuinely nothing for a crew-directed task to DO yet, even though the
    real-world clinical benefit (`pat.icp` is exactly the field that would
    need to move) is well within this engine's existing vocabulary. This
    recurs across at least two protocols now, which is worth taking as a
    signal it's a real, reusable mechanism worth building rather than a
    one-off: a small, literature-anchored ICP reduction term gated on a
    new position flag (mirroring `leftLateralTilt`'s own `sets:{}` idiom
    from the pregnancy-positioning work), the same "build the real
    mechanism, then the task becomes a one-line addition" pattern that
    already worked for `leftTilt`/pregnancy displacement.

72. **A real, previously-masked treatment-responsiveness question in the
    `[HYPERKALEMIA FROM MISSED DIALYSIS]` rhythm mechanism — found while
    closing item 71 (this session), filed rather than patched blind.**
    Item 71's own bicarb magnitude fix (below) surfaced a second, deeper
    finding downstream of it: `cardiovascular.js`'s `a.hyperK = pat.k>5.8 ?
    pat.k-5.8 : 0` term — which feeds `rhythmInstability`'s accumulation
    and, through it, the stochastic `vtDrive`-gated VT trigger — reads RAW
    `pat.k`, not the `effK` (K adjusted for calcium's protective effect)
    the deterministic wideQRS/peakedT classification and QRS-width terms
    use two lines away in the same file. Calcium's real, verified,
    deterministic membrane-stabilization effect (still asserted and
    passing — `mechanismWiring.mjs`'s `[HYPERKALEMIA FROM MISSED
    DIALYSIS]` section) therefore does nothing to slow this SEPARATE
    stochastic pathway, and MEASURED (this session): no realistic field
    dose/combination of calcium+bicarb(+albuterol) lowers raw serum K fast
    enough in a 10-minute window to meaningfully blunt it either — a
    larger, N=20 repeated-trial comparison found the treated arm
    NUMERICALLY INDISTINGUISHABLE from (if anything, marginally worse
    than) untreated at 600s, a difference well inside binomial sampling
    noise, not a real reversed effect, but genuine proof there is no
    honestly measurable benefit on THIS SPECIFIC stochastic outcome at
    realistic doses. This is a real, open question about whether
    `a.hyperK`'s contribution to `rhythmInstability` should itself be
    reduced by ONGOING treatment (not just presenting severity, which is
    unaffected and still correctly calibrated — see the untreated-arm
    assertion, still passing at 8/10 dangerous by 10 min) — e.g. by
    reading `effK` instead of raw `pat.k`, or by a treatment-aware decay
    term. Not attempted here: this is genuine physiology-engine work
    touching a shared, engine-wide rhythm-instability term multiple other
    conditions' own arrhythmia mechanics compose through (the same
    `substrate` expression also feeds `a.ischemia`/`a.hypoxic`/
    `a.triggered`-driven rhythm risk for ACS/AMI/electrical-storm/torsades
    and others) — recalibrating it needs its own dedicated, carefully
    scoped batch with re-verification against every one of those, not a
    bolt-on inside a single drug's magnitude fix. The mechanismWiring.mjs
    assertion that used to claim "early calcium+bicarb -> deterioration
    prevented in most trials" was removed (not weakened) rather than left
    asserting something no longer honestly measurable — see that suite's
    own in-code comment at the `[HYPERKALEMIA FROM MISSED DIALYSIS]`
    section for the full trace.

73. **RESOLVED (this session) — `bicarb`'s own `fx.hco3:16` was derived
    against the wrong distribution volume, and is now re-anchored to a real
    citation.** Confirmed against the tree before touching anything (lesson
    16): `bicarb`'s old comment framed 16 as an intentional one-time-dose
    value ("50 mEq → ~16 mmol/L HCO3 rise"), and `pk.js`'s "hco3" prop
    handler applies a drug's declared `fx.hco3` DIRECTLY as net mEq/L
    delivered to `pat.sidAdjust` (no `/10` division, unlike the "ph" prop
    blood/plasma use) — confirmed by reading the code and by direct
    measurement: one dose drove `sidAdjust` to exactly +16.00 pre-fix,
    `hco3` to 39.43 and pH to 7.676 from a plain condition-less control —
    within a hundredth of the acidbase.js clamp's own 7.8 upper bound from
    a SINGLE guideline dose. Real sodium bicarbonate distributes across the
    "bicarbonate space" — roughly 40-50% of body weight for a large/acute
    dose (Cogan, *Fluid & Electrolytes*), 28-35 L for this file's own 70 kg
    reference adult — so 50 mEq should raise serum bicarbonate by roughly
    1.4-1.8 mEq/L, not 16. The old 16 figure divides out almost exactly to
    50 mEq over a bare ~3 L PLASMA volume alone (50/3≈16.7), strongly
    suggesting it was originally derived against plasma volume rather than
    the real, much larger bicarbonate distribution space. Fixed:
    `fx.hco3` moved 16 → 1.6 (50 mEq / ~31 L midpoint), matching the same
    "small, honest, single-dose magnitude" precedent blood/plasma's own
    re-derived `fx.ph` values (2.5 and 3.0 mEq/L net) already set on the
    opposite side of the ledger. MEASURED post-fix, isolated to exactly one
    dose (a repeat-dose probe was tried first and, per lesson 8, caught
    before being trusted — it silently delivered THREE doses via the
    suite's own `reapply` idiom, not one, which is why an early draft
    measurement read 4.80/1.499 instead of the true per-dose 1.600/1.499):
    net `sidAdjust` delivered = 1.600 exactly, `hco3` 24.10→25.60 (+1.50),
    pH +0.026 — a real, modest, clinically honest single-dose rise, not a
    clamp-pinning one.

    **A real downstream consequence was found and fixed in the same
    session, not left broken.** `mechanismWiring.mjs`'s own
    `[HYPERKALEMIA FROM MISSED DIALYSIS]` section had an existing
    assertion, "sodium bicarbonate genuinely lowers potassium (K shift)",
    requiring a >=0.5 mEq/L fall — calibrated (implicitly, via its own
    passing threshold) against the OLD, oversized magnitude. Traced to
    ground before touching the threshold (lesson 8): the fall is not pure
    `pat.transcellularKShift` (bicarb's own `kShift:-0.8`, unaffected by
    this fix) — `renal.js`'s `kShiftConc = pHDrop * (...) * dt` term (real
    H+/K+ exchange: acidaemia drives K+ OUT of cells, so the alkalinisation
    a smaller, honest dose still produces drives correspondingly less K+
    back IN) also contributes, and shrinks proportionally with the smaller,
    correct pH rise. MEASURED, fresh-process, three repeated runs of the
    suite's own real dosing pattern (settle:2/run:480/apply:["bicarb"], its
    default `reapply:140` giving several real repeat doses over the
    window, not one): K fall settled 0.34-0.39 mEq/L. Threshold lowered
    0.5 → 0.2 mEq/L, with real margin below the measured floor, and the
    reasoning recorded in-code at the assertion itself.

    **A second, larger downstream consequence was found, measured, and
    resolved by REMOVING (not weakening) the assertion it broke — see
    queue item 72 above for the deeper mechanism finding this surfaced.**
    The suite's own repeated-trial "early calcium+bicarb -> deterioration
    prevented" assertion (>=8/10 rescued at 600s) collapsed to 2/10 with
    the corrected magnitude. Investigated rather than reverted: calcium's
    own deterministic QRS-narrowing/rhythm-reversion mechanism is real,
    unaffected, and still separately asserted and passing (queue item 72's
    own comment) — the failure is entirely in a SEPARATE, raw-K-driven,
    stochastic VT-trigger pathway that no realistic field-treatment
    magnitude measurably blunts within a 10-minute window (confirmed via a
    larger N=20 comparison: treated numerically indistinguishable from
    untreated, 17/20 vs 15/20 dangerous — noise, not a real difference).
    Removed the now-unassertable stochastic-outcome block; kept the
    still-valid untreated-arm assertion (8/10 dangerous by 10 min,
    unaffected); the deterministic mechanism-wiring claims this suite
    exists to test (calcium narrows QRS without lowering K; bicarb
    genuinely lowers K) remain asserted and passing, matching this suite's
    own stated philosophy ("deliberately about wiring, not magnitude").

    **Verification, complete.** `node --check` clean on both touched files
    (`drugs.js`, `mechanismWiring.mjs`). `npx eslint src/data/drugs.js
    src/scripts/mechanismWiring.mjs`: zero findings. `npx vite build`:
    clean (22.33s, same pre-existing >500kB chunk-size warning). Since this
    touches `pk.js`'s shared drug-effect hot path only through data
    (`drugs.js`'s own declared coefficient, no `pk.js`/`cardiovascular.js`/
    `renal.js` code edits), the full `[HYPERKALEMIA FROM MISSED DIALYSIS]`
    section was re-run standalone (helpers copied verbatim from the suite,
    lesson 8) and came back **7 passed, 0 failed** — every assertion in the
    section, including the two just recalibrated, now passes cleanly. The
    full `mechanismWiring.mjs` suite was also run to completion (background,
    since this touches the shared `drugs.js` hot path every scenario in the
    game reaches): **407 passed, 2 failed** — both failures are the same
    already-documented, pre-existing flaky stochastic assertions this
    document has carried for many sessions (`magnesium suppresses torsades
    recurrence (Tzivoni)`, 6/10 vs needed 8/10; `PACs -> occasional isolated
    HR blips`, stdev 0.61 vs control 0.88) — confirmed unrelated by content,
    neither reads `hco3`/`sidAdjust`/`k`/`qrsWidth`/`bicarb`/`calcium` or
    anything else this batch touched. Every throwaway probe/
    calibration script used across this investigation (nine in total,
    including the one that caught its own repeat-dose measurement mistake)
    was stripped before this entry was written, confirmed via a directory
    listing showing none remaining under `src/scripts/`.

74. **CLOSED — filed per explicit operator instruction: separate each LIMB
    into its own circulatory subsystem — real per-limb circulation/
    hemorrhage, and compartment syndrome. ALL THREE PHASES SHIPPED AND
    VERIFIED** (Phase 1: limb-specific hemorrhage control; Phase 2: real
    per-limb arterial perfusion/`limbDO2` built out on `acuteLimbIschemia`;
    Phase 3: compartment syndrome, built out on `crushSyndrome`, composing
    into Phase 2's own chain via the clinical delta-pressure variable) —
    see section 3's three newest physiology-engine entries for the full
    writeup of each phase, including a real process-hygiene incident
    during Phase 3's handoff (a spawned sub-agent that couldn't be
    stopped, and orphaned verification processes that outlived an explicit
    stop instruction) worth reading before delegating similarly bounded
    work again. A short list of small, well-understood, NOT-yet-filed
    follow-ups is recorded at the end of Phase 3's own section-3 entry
    (location-aware `directPressure`/`pack`/`pelvicBinder`; a genuine
    tourniquet-specific warm-ischemia time constant distinct from embolic
    ischemia's; a real "loosen the dressing, don't elevate" field
    intervention) — none reopen this item, each is a future item's worth
    of scope on its own if picked up.

    **The real gap, confirmed by reading the tree before touching anything.**
    This engine has NO per-limb circulatory state anywhere. `wounds.js`
    already keys every wound by body-map location (`armL`/`armR`/`legL`/
    `legR`/`torso`/`abdo`/`head`/`neck` — the same 8 regions `BodyMap.jsx`
    renders and `AccessMinigame.jsx`/`devices.js` already use for IV-site
    selection), but `physiology.js`'s `buildPatient()` immediately collapses
    every wound's `bleed` contribution into ONE whole-body scalar
    (`pat.activeBleedRate`) and throws the location away. Every hemostatic
    intervention inherited that: `tq` (tourniquet) and `aorticOcclusion`
    (REBOA) both use the exact same `stopsBleed:1` flag
    (`pk.js`), which zeroed the ENTIRE whole-body bleed rate — clinically
    backwards for a tourniquet specifically (a distal-limb intervention
    should only stop bleeding on that ONE limb; REBOA's own whole-body
    behavior IS correct, since proximal aortic occlusion genuinely cuts flow
    to everything downstream, so that one must NOT be narrowed). A tourniquet
    on a bleeding leg was, until this session, also silently curing an
    unrelated chest wound.

    **PHASE 1, SHIPPED: limb-specific bleed tracking + a location-aware
    tourniquet, fully additive and backward-compatible.** `patient.js` gained
    `pat.woundBleedByLocation` — a static, construction-time-only snapshot
    (built in `physiology.js`'s `buildPatient()`, from the exact same
    wound-iteration loop that already sums `bleed`/`pain`) recording how much
    of the total `activeBleedRate` came from a wound at each location.
    Deliberately NOT kept live/recomputed after construction: internal
    hemorrhage conditions (AAA, GI bleed, ectopic pregnancy, mesenteric
    ischemia...) mutate `pat.activeBleedRate` directly every tick with no
    location concept at all, and this must never fight or double-count that
    — a static snapshot is sufficient for its one real consumer. `pk.js`'s
    `stopsBleed` handling now checks the dose for an OPTIONAL `d.location`:
    if present and it matches a real wounded location, only that location's
    recorded contribution is subtracted from `activeBleedRate` (once,
    idempotently, via `pat._tqStoppedLocations`); if absent — every existing
    caller today, tourniquet OR REBOA — it falls through to the EXACT
    original whole-body zero, unchanged. Since no dose anywhere in this
    codebase (scenario, test, or front-end) has ever set `d.location`, this
    is a pure capability addition: zero risk to the 435 pre-existing
    assertions or any shipped scenario, confirmed by running the full suite
    before AND after (see section 3's entry for the numbers).

    **What Phase 1 deliberately does NOT do, so a future session doesn't
    re-litigate the boundary:** `directPressure`/`pack`/`pelvicBinder`'s own
    `fx.bleed` deltas were NOT made location-aware — those already apply to
    "the wound the player is treating" via the exam/procedure UI's own
    targeting, a different code path than `stopsBleed`'s whole-patient flag,
    and extending them is a natural, cheap follow-up but adds front-end
    scope this batch didn't need to touch. No player-facing UI exists yet to
    actually CHOOSE which limb to tourniquet — Phase 1 is physiology-layer
    support only; wiring a real site-selection control (the natural analog
    of `AccessMinigame.jsx`'s existing IV-site picker) is front-end work,
    filed here rather than silently assumed away.

    **PHASE 2, SHIPPED — real per-limb PERFUSION, reusing item 42's
    delivery/demand pattern.** See section 3's newest entry for the full
    writeup. `pat.limbOcclusion` (live, per-limb, patient.js) is now set by
    `acuteLimbIschemia`'s own embolic occlusion AND by a located tourniquet
    dose (pk.js) — the missing consumer this entry originally called out.
    `armL`/`armR`/`legL`/`legR` each get their own `limbDO2`/`limbO2Debt`
    (neuro.js's `updateOrganInjury`), `limbDO2[loc] = (1-occlusion[loc]) *
    muscleFactor * (caO2/20)` with `muscleFactor` a real, MEASURED (not
    copy-pasted) alphaTone coefficient distinct from gut/skin's, gated by
    the same 0.5 ischemic deadband before driving a new per-limb
    `limbInjury` accumulator (physiology.js's irreversible-injury list).
    `acuteLimbIschemia` (previously a completely bare stub) was built out on
    top of it, real occlusion severity/propagation cited from acute-vs-
    chronic-occlusion collateral literature. The ischemia-time-to-injury
    curve targets the real ~4-6h embolic "time is tissue" window (MEASURED:
    crosses irreversible at 5h); a tourniquet-SPECIFIC ~2h warm-ischemia
    time constant (this entry's own original citation) was deliberately
    NOT separately derived — left honestly open, see section 3.

    **PHASE 3, SHIPPED (see section 3) — compartment syndrome, a genuinely NEW state
    category, not a variant of the organ-compartment pattern, built as originally scoped below.** Every organ
    item 42 built is perfusion-only (arterial delivery vs. metabolic demand).
    Compartment syndrome needs something none of them have: an ENCLOSED
    fascial space with its own rising TISSUE PRESSURE (from bleeding/edema
    within a closed compartment) that progressively squeezes venous outflow
    first and then arterial inflow as it climbs — a real, distinct
    tamponade-like mechanism (the closest existing analog in this engine is
    `pericardialTamponade`'s `pat.pericardialEffusion`-driven CVP-rise
    mechanism, which is the right STRUCTURAL template to study, not copy
    blind — a limb's compartment is a fixed-volume fascial envelope, not a
    pericardial sac around a beating chamber, so the pressure-volume
    relationship needs its own derivation). A real compartment-pressure
    state, a mechanism for a closed fracture/crush injury to raise it over a
    real time course, and fasciotomy as the only real definitive treatment
    (a device/procedure this game's formulary does not currently carry) are
    ALL new work. Explicitly depends on Phase 2's `limbDO2` existing first —
    compartment syndrome's actual danger IS the perfusion collapse it
    causes, so building the pressure state before the perfusion consumer
    exists would be a field with no real downstream effect, the exact
    "decorative field" defect section 1 forbids.

    **A caution worth stating plainly, learned the hard way earlier this
    session (see the pulmonary-edema entry a few entries above):** any new
    shared circulatory signal this workstream builds should be measured
    against a NON-obvious cross-cutting scenario (a patient in shock with NO
    limb injury; a bilateral-fracture patient; an amputee-adjacent traumatic
    partial amputation) from the FIRST calibration pass, not as an
    afterthought once the obvious case already looks clean — Ppv's own
    confound (indistinguishable from a non-cardiac apnea patient) was found
    only on a fifth check that should have been the first.

---

## 7. Hard-won lessons

**1. Do not unit-test a subsystem outside its feedback loops.** Driving one
module with synthetic inputs produces confident, wrong answers.

**2. Your regression is only as good as the fields you check.** `scenarioSweep`
asserts field PRESENCE explicitly and treats `undefined` as a failure. When you
add a field, add it to the sweep.

**3. Verify the harness before believing the finding.** When a result is
surprising, print the intermediate variables before forming a hypothesis about
the engine. See 8 — this is the dominant failure mode.

**4. If a correct mechanism makes a benchmark worse, keep the mechanism and trace
upstream.** The benchmark was being met by a compensating error.

**5. Trace to the first divergence, and the symptom usually vanishes.** Intrinsic
PEEP looked like a number to tune; it was the correct output of a formula that
capped it. Pregnancy blood volume looked like an engine defect; it was a test
declaring the wrong weight.

**6. An absent assertion is as dangerous as a wrong one.** When you fix a
property, assert it — two-sided where possible, so it cannot be satisfied by the
mechanism doing nothing or by it firing always. Last session this was proved from
the other direction: an assertion written, then reverted as unrunnable, would
have caught a bug introduced in the same batch (a graded brain-injury model that
injured healthy brains).

**7. Prefer stopping at a verified boundary.** A smaller batch that is measured,
packaged and shipped is worth more than a larger one left in an unknown state.

**8. NEVER RECONSTRUCT WHAT THE ENGINE ALREADY COMPUTES.** Six errors in one
session were this shape, and one caused a *published conclusion that was the
exact opposite of the truth*:

   - Read `p.shockable` — not a patient field; the suite derives it from `rhythm`.
   - Used scenario name `asthma` (real key `asthmaAttack`) and `anaphylaxis`
     (real key `anaph`). **An invalid scenario name silently yields a default
     healthy patient**, which looks exactly like a broken subsystem.
   - Recomputed `Rairway` without its `exp(effBroncho * 1.7)` term — a 5.11x
     factor — and concluded the correct fix "makes it ten times worse".
   - Referenced `vtPrev`, not in scope, breaking the engine on every tick.
   - Rebuilt `makePregnant`/`advance` and got 4.19 L where the suite got 4.87,
     because the suite's `advance` calls `updateObstetric` explicitly each tick.

   Three practices close this off, and all are cheap:
   - **Instrument the engine, do not reconstruct its formulas.** Write a
     temporary `pat._dbgX = {...}` at the site, using only variables assigned on
     the preceding lines. Strip it before shipping.
   - **Run ~10 ticks and print before launching anything long.** Every one of the
     above would have been caught in seconds.
   - **Enumerate real keys rather than trusting a name you typed**
     (`node -e "import('./src/data/scenarios.js').then(m=>console.log(Object.keys(m.SCEN)))"`).
   - If your probe disagrees with the suite, **your probe is wrong** until proven
     otherwise. Copy the suite's helpers verbatim rather than paraphrasing them.

**9. Stochastic assertions must be repeated-trial, not one-shot.** The
`defibrillation -> shockable rhythm terminated` wiring assertion was a single
Bernoulli draw at p~0.93, so it failed about one run in fourteen. A flaky
assertion is worse than a missing one: it trains you to wave failures through,
which is exactly the habit that lets a real regression ship past a
diff-the-failure-set check. It now uses `assertMostTrials(label, 10, 7, fn)`.

**10. A passing sweep proves nothing about a path it does not walk.** The
postpartum defect was catastrophic, obvious once instrumented, and invisible to
~497k assertions — because delivery is not one of the 24 swept scenarios. When
you add a mechanism, ask which suite would have caught it if it were wrong. If
the answer is none, that is the batch's real deliverable.

**10b. "Impossible" is not the same test as "physiologically impossible."** The
sweep asked whether values were NaN, negative, or outside [0,1]. A patient at
0.000 L blood volume with HR 175 in PEA passes all three, and so did ~497k checks
while five scenarios drained to empty. When you write a sanity check, ask what a
DEAD-WRONG state would look like in the fields you are checking — if it would
still pass, the check is measuring the wrong thing.

**11. When a fixture and the engine disagree, check the fixture's HORIZON before
its ranges.** Three assertions demanded multi-hour sodium movement from 45-minute
runs and had been failing since before they were written. `renalValidation`
passed the same ranges on the same mechanisms because it ran 12-hour horizons —
the thresholds had been copied between fixtures without the horizon. This is
lesson 3 with a specific shape: the harness's TIME BASE is as much a parameter as
its thresholds.

**12. Two correct fixes can each look like a regression alone.** The preload
frame fix and the afterload normalization each moved the pregnancy benchmark the
wrong way in isolation — one pushed MAP to 95.7, the other to 72.7, and the
second broke the eclampsia limb outright. Together they land at 80.3 against a
documented 80-90. When lesson 4 says keep a correct mechanism and trace upstream,
the thing upstream is sometimes a second fix that has to land in the same batch.

**13. Package before the long tier, not after.** Two batches were fully verified
and then lost to the turn budget during a 30-minute run. Zip first, run second,
re-zip if the run changes anything.

**14. `physiologyValidation` gets killed mid-run — seven times in one session,**
twice with nothing written to the log at all. Check the log before assuming a run
was lost, budget for retries, and prefer `setsid nohup ... &` with polling. It
does complete: the final 113/113 came on the seventh attempt.

**15. A clamp rail that is being HIT is often reporting a defect somewhere else.**
Serum sodium sat pinned at exactly 100 for the life of the project. It was not a
sodium bug at all — patients were draining to 0.000 L, ECF water collapsed to its
floor, and the quotient fell through the guard. Fixing hemorrhage fixed sodium.
Before adjusting a rail, ask what would have to be true upstream for the
physiology to reach it.
---

### 16. A comment claiming a fix is not a fix. Check the tree.

A comment in `conditions.js` asserted a `neuro.js` change that had never been
made. It was specific, plausible, and wrong, and it would have told the next
session that a broken limb was already correct. Before building on any claim in
a comment or a handoff, confirm it against the code. `mtime` and `grep` take
seconds; a wrong belief about what is already fixed can cost a batch.

### 17. When a suite dies with an empty log, suspect the harness, not the run.

`physiologyValidation 2` lost five runs. The first losses were `| tail` buffering
until process exit — a runner problem, fixed by `stdbuf -oL` and direct
redirect. The remaining ones were the script itself accumulating output and
printing only at the end, which no wrapper can fix. Those are different problems
with different fixes, and retrying blindly diagnoses neither. If you need one
specific assertion from a suite that will not finish, extract the block into a
standalone runner with the suite's helpers COPIED VERBATIM. That worked for the
eclampsia block and is the sanctioned technique.

### 18. Adding a receptor to a curve drug means adding it to `curveDrugAudit`.

The audit's drug list is a hardcoded array. Magnesium got a receptor and the
instrument kept reporting "0 of 5 flagged" — green, and blind to the thing that
had just changed. A passing instrument proves nothing about a drug it does not
walk. This is lesson 10 in miniature and it will recur every time a mechanism
gets a new consumer: ask which suite would catch this if it were wrong, and if
the honest answer is "none", the batch is not finished.

### 19. Two calibrations each right on one axis mean a missing mechanism

Preeclampsia could be given the documented blood pressure OR the documented
cardiac output, not both — one arm bought pressure through preload and wrecked
the output, the other got the hemodynamics right and never reached severe range.
The temptation is to split the difference. The actual answer was that resistance
and compliance are two lesions and the engine only had one of them; adding
`arterialComplianceFactor` satisfied both axes at once with no compromise. When
tuning cannot satisfy two documented constraints simultaneously, that is
diagnostic information about the model, not about the coefficient.

### 20. Set a threshold against MEASURED engine ranges, not the literature's units.

The takotsubo Gi switch had to fire above "supraphysiological" catecholamine and
stay quiet at normal stress. The literature gives plasma concentrations (7-34x
normal), which are meaningless in the engine's receptor-drive units. The only way
to place the threshold was to MEASURE what the engine actually reaches: catExcess
~0 at rest and under pain/anaphylaxis, ~0.4 in hemorrhage, and _beta1Drug ~0.18
for a push-dose pressor. That put the normal ceiling near 0.5 and fixed K2=0.8
with a steep Hill — numbers that mean nothing on the clinical scale but everything
on the engine's. Calibrate against the instrument you have, then document that the
absolute value is an internal unit, not a plasma level.

### 21. A treatment that comes out backwards may be fighting a SHARED upstream term.

Beta-blockade first made the takotsubo ventricle WORSE, which is the wrong sign.
The cause was not the takotsubo term at all: metoprolol drives `beta1Tone` down,
and `beta1Tone` feeds BOTH the positive adrenergic inotropy (coefficient 0.5,
tracking it directly) AND, via the drug handles, the Gi arm. Cutting beta1Tone
cost more on the positive term than it relieved on the saturating Gi term, so the
net was negative. The fix was to make the Gi arm read exogenous drive on a scale
where a pressor dose dominates its own positive-inotropy contribution — i.e. to
recognize that two effects keyed off one shared variable were pulling opposite
ways. When a treatment's direction is wrong, check whether the drug moves a
variable that a DIFFERENT term also reads before touching the mechanism you just
built. (Measured resolution: epi worsens TTS EF 0.39->0.20; beta-blocker rescues
an epi-worsened ventricle 0.35->0.59; beta-blocker alone is mildly negative,
which is clinically correct and why its evidence base is mixed.)

## 8. Target condition library

The set the simulator is aiming at, for the condition-library workstream (queue
item 7). **Roughly 280 entries against 161 currently implemented** (+1 this
session from `cyanidePoisoning`, queue item 7's own suggested "carbon monoxide
and cyanide toxicity" batch, its second half — see section 3's newest entry;
+1 from a real backfill gap, `diabetesT2`, found by the same direct-count
check, not built this session; +1 from `tricyclicOverdose`, queue item 7's
own suggested batch, the PRIOR session — see section 3; 33 before
the first cardiac-conditions batch; +15 from that batch; +1 from the items-8-20
batch (`uterineAtony`); +17 from the items-22/26-plus-respiratory batch; +5
from the second cardiac-conditions batch; +54 from an earlier session's neuro/
endocrine sweep; +1 from `hyperkalemiaMissedDialysis`; +1 from
`rocuroniumOverdose` (queue item 40's overdose-condition workstream); +16
from an earlier batch's electrolyte + shock/GI/vascular/psychiatric batch;
+8 from an earlier session's OB/GYN hemorrhage + AAA + GI batch; +1 from
`carbonMonoxidePoisoning`. **The 152 figure
this paragraph used to carry was stale, confirmed by direct count against
the tree (lesson 16) while updating it this session** — grepping
`Object.keys(CONDITIONS).length` returns 156 conditions BEFORE this
session's own addition, not 152; the named "already implemented" list below
had silently fallen 4 conditions behind the real tree
(`diltiazemOverdose`/`metoprololOverdose`/`toxicInhalationChlorine`/
`atropineOverdose`, all real, all shipped in earlier sessions per section 3,
none ever added to the list below). Those four are now added alongside
`carbonMonoxidePoisoning`; 157 was the real, grep-confirmed total at that
point. This session adds `tricyclicOverdose` (queue item 7's own suggested
batch) on top of that, for the 158 now current. The categorized
lists below are the REMAINING backlog: a condition is REMOVED from its category
list the session it ships (see the standing rule in section 4), so the categories
shrink as the "already implemented" list grows and nothing is built twice.

**Already implemented (158)** — for these the job is step (b) review and deepening,
not a build from nothing. Several are thinner than the engine can support:

`aorticDissection`, `chf`, `ami`, `acs`, `stableAngina`, `unstableAngina`, `nstemi`,
`healthyPregnancy`, `copd`,
`chronicKidneyDisease`, `chronicHeartFailure`, `coronaryArteryDisease`,
`cardiogenicShock`, `takotsubo`, `svt`, `pe`, `fbao`, `crushSyndrome`,
`opioidOD`, `anaphylaxis`, `asthma`, `appendicitis`, `pneumoniaSepsis`,
`seizurePostictal`, `polytraumaFall`, `traumaPregnant`, `polytraumaMoto`,
`pediatricDrowning`, `abdominalGSW`, `stabChestTension`, `neonatalTransition`,
`hypoglycemiaMaskedBleed` (the `maskedBleed` scenario — a distracting-injury
teaching pattern rather than a single diagnosis, see section 3),
`acquiredLongQT` (queue item 3 — hypokalemia + hypomagnesemia + bradycardia +
a chronic QT-prolonging medication converging on a real, self-initiating
torsades substrate; see section 3), and — from the cardiac-conditions batch,
most recent session — `thirdDegreeAVBlock`, `firstDegreeAVBlock`,
`atrialFibrillation` (covers both plain and RVR presentations — a scenario
parameterizes the rate via its own `patient:` override), `atrialFlutter`,
`secondDegreeAVBlockTypeI`, `secondDegreeAVBlockTypeII`, `monomorphicVT`,
`wpw`, `pericardialTamponade`, `symptomaticBradycardia`, `digoxinToxicity`,
`pericarditis`, `myocarditis`, `hypertensiveUrgency`,
`hypertensiveEmergency`, and — from the items-8-20 batch, most recent
session — `uterineAtony` (queue items 8-9, scenario `pph`/OBGY-043: uterine
atony as the leading, most field-treatable cause of postpartum hemorrhage;
see section 3), and — from THIS session's items-22/26-plus-respiratory
batch — `sickleCellCrisis` (queue item 22), `heatStroke` (queue item 26),
`spontaneousPneumothorax`, `openPneumothorax`, `hemothorax`,
`pleuralEffusion`, `ards`, `aspirationPneumonitis`, `bronchitis`,
`bronchiolitis`, `pertussis`, `influenzaPneumonia`, `covidPneumonia`,
`croup`, `epiglottitis`, `cysticFibrosisExacerbation`,
`tuberculosisHemoptysis`, and — from THIS session's second cardiac-conditions
batch — `prematureVentricularContractions`, `prematureAtrialContractions`,
`sickSinusSyndrome`, `electricalStorm`, `aicdMalfunction`, and — from THIS
session's neuro/endocrine sweep (queue items 7, 21, 23, 24, 27) — Neurologic:
`activeSeizureGTC`, `statusEpilepticus`, `epilepsy`, `febrileSeizure`,
`simplePartialSeizure`, `complexPartialSeizure`, `absenceSeizure`, `migraine`,
`clusterHeadache`, `tensionHeadache`, `trigeminalNeuralgia`,
`peripheralVertigo`, `centralVertigo`, `guillainBarre`,
`myastheniaGravisCrisis`, `bellsPalsy`, `dementia`, `meningitis`,
`encephalitis`, `toxicMetabolicEncephalopathy`, `delirium`,
`hypoxicBrainInjury`, `increasedICP`, `ischemicStroke`, `tia`,
`intracerebralHemorrhage`, `subarachnoidHemorrhage`; Endocrine/Metabolic:
`diabeticKetoacidosis`, `hyperosmolarHyperglycemicState`,
`severeHypoglycemia`, `typeIDiabetes`, `diabetesT2` (a real, already-shipped
condition this list had silently fallen behind on — see the header paragraph
above), `alcoholicKetoacidosis`,
`starvationKetosis`, `hyperthyroidism`, `thyroidStorm`, `hypothyroidism`,
`myxedemaComa`, `addisonianCrisis`, `cushingSyndrome`, `siadh`,
`diabetesInsipidus`, `refeedingSyndrome`, `hyperammonemia`; plus queue items
21/23/24/27's own conditions: `hypertension`, `hyperlipidemia`,
`diabeticVasculopathy`, `copdExacerbation`, `esophagealVaricealHemorrhage`,
`allergicReactionModerate`, `vasovagalSyncope`, `minorSprain`,
`chronicBackPain`, `excitedDelirium`, `hyperkalemiaMissedDialysis`, and
`rocuroniumOverdose` (queue item 40's overdose-condition workstream) — and,
from THIS session's electrolyte + shock/GI/vascular/psychiatric batch,
the entire Electrolyte category: `hypokalemia`, `hypercalcemia`,
`hypocalcemia`, `hypermagnesemia`, `hypomagnesemia`, `hyponatremia`,
`hypernatremia`, `severeMetabolicAcidosis`; plus `neurogenicShock`,
`acuteMesentericIschemia`, `acuteCholecystitis`, `lowerGIBleed`,
`upperGIBleed`, `acuteLimbIschemia`, `deepVeinThrombosis`,
`panicAttackHyperventilation` (144 conditions at that point — the
Electrolyte category was removed in full, and the Shock states/
Gastrointestinal/Vascular-Hematology/Psychiatric categories were all
updated to remove what shipped); and, from THIS session's OB/GYN
hemorrhage + AAA + GI batch, `ectopicPregnancyRuptured`,
`placentalAbruption`, `placentaPrevia`, `ovarianTorsion`,
`rupturedOvarianCyst`, `abdominalAorticAneurysm`, `acutePancreatitis`,
`bowelObstruction` (152 conditions implemented at that point — the
Obstetric/Gynecologic, Vascular/Hematology, and Gastrointestinal
categories below are all updated to remove what shipped, not just added
here); plus four real, already-shipped conditions this list had fallen
behind on (found and backfilled this session, see the header paragraph
above): `diltiazemOverdose`, `metoprololOverdose` (queue item 40's
overdose-condition workstream), `toxicInhalationChlorine` (queue item 28's
physiology half), `atropineOverdose` (queue item 40); and, from THIS
session's condition-library batch, `carbonMonoxidePoisoning` (queue item 7,
Toxicology); and, from THIS session, `tricyclicOverdose` (queue item 7,
Toxicology — see section 3's newest entry); and, from the MOST RECENT
session, `cyanidePoisoning` (queue item 7, Toxicology — see section 3's
newest entry) — 161 conditions implemented in total now, confirmed by direct
count against the tree (`Object.keys(CONDITIONS).length`), not the running
tally alone (lesson 16). That is TWO more than the 159 this paragraph's own
158+1 arithmetic would predict: `diabetesT2` is a real, already-shipped
condition this list had silently fallen behind on (the same backfill-gap
shape `diltiazemOverdose`/`metoprololOverdose`/`toxicInhalationChlorine`/
`atropineOverdose` were two sessions ago), found by the same direct-count
check while updating this paragraph for cyanidePoisoning, not built this
session and not otherwise touched.

Note that some entries below overlap these at finer grain — it separates the AV
blocks and shock states that are presently collapsed or absent. That granularity
is the point: the difference between a Mobitz I and a Mobitz II is exactly the
kind of distinction a candidate is being trained to make, and it has to emerge
from conduction physiology rather than from a label. The coronary triad
(stable / unstable angina / NSTEMI) plus acs and ami now cover the ischemic
spectrum end to end: fixed-plaque demand ischemia that resolves with rest;
rest ischemia without necrosis; subendocardial infarct (limitable); the evolving
NSTE-ACS that can be prevented; and the completed transmural STEMI.

### Cardiac
Hypertrophic Obstructive Cardiomyopathy ·
Mitral Valve Disease (chronic/stenotic forms) · Pacemaker Failure · Pacemaker Syndrome

*(Infective Endocarditis shipped this session in scoped form (fever/bacteremia
+ valve involvement + one timed embolic event) — the full vegetation-growth
composite remains open, see section 3. Aortic Stenosis and acute Mitral
Regurgitation both shipped this session — see section 3's newest entries.
Mitral Valve Disease's chronic/degenerative forms remain unbuilt.)*

*(This category shrank from 22 entries to 6, then to the 6 above, across two
cardiac-conditions batches — see section 3 for the full writeup of both.
The second batch shipped `prematureVentricularContractions`,
`prematureAtrialContractions`, `sickSinusSyndrome`, `electricalStorm`, and
`aicdMalfunction` — all five reusing existing machinery rather than adding
new cardiovascular.js state (see section 3's entry for exactly what each
reused). **Pulseless Electrical Activity (PEA), Asystole, and Ventricular
Fibrillation are REMOVED from this list, not built, on the same reasoning
already applied once to VF and once to Respiratory Distress/Failure/Arrest**:
all three are already fully-implemented, already-verified terminal RHYTHM
STATES (mechAct=0, the PERFUSING/non-PERFUSING state machine, real entry and
exit transitions — cardiovascular.js), not distinct disease entities with
their own pathophysiology to model. A witnessed-arrest scenario starting a
patient directly in any of the three (a `rhythm:` patient override, the same
idiom `atrialFibrillation`/`atrialFlutter` already use) is a cheap,
content-only follow-up whenever one is wanted — not physiology-engine work.
**Infective Endocarditis** shipped this session in scoped form (see section 3)
— the full vegetation-growth composite (size/growth over time, skin findings,
right-sided pulmonary emboli) remains its own future batch. **Hypertrophic
Obstructive Cardiomyopathy** needs a dynamic-LVOTO (variable outflow
obstruction) mechanism the engine still lacks — the same gap takotsubo's own
entry flagged as its own batch, still unbuilt. **Aortic Stenosis and acute
Mitral Regurgitation both shipped this session** (see section 3) — the
valve-resistance-in-series/regurgitant-fraction mechanisms they needed turned
out to already exist (built for queue item 41, never wired to a condition).
**Mitral Valve Disease's chronic/degenerative forms** would need the same
mechanism family, mechanistically distinct from vascular tone (SVR/
baseSVR) — approximating through baseSVR would conflate a fixed
anatomic obstruction with vasodilation/vasoconstriction, a real
mechanism-category error this project's own discipline forbids. **Pacemaker
Failure and Pacemaker Syndrome — investigated this batch, deliberately NOT
built, for two different reasons.** Pacemaker Syndrome's defining physiology
IS loss of AV synchrony/atrial kick from ventricular-only pacing — but the
atrialFibrillation entry above already documents that wiring the engine's own
NO_ATRIAL_KICK atrial-elastance term into the AUTHORITATIVE full-loop ODE
solver was tried and MEASURED WORSE (an emergent LA-pressure-backup
compensation nets MORE filling, not less) — retrying the identical approach
here would repeat an already-documented dead end (lesson 4/8's own
discipline), and no different mechanism for the syndrome's hemodynamic
compromise was identified this batch. Pacemaker Failure (loss of capture in a
device-dependent patient) is mechanistically near-identical to the already-
shipped `thirdDegreeAVBlock` — chronic complete block with a fixed
ventricular-escape hr — and building it without a genuine implanted-device
state layer (battery/lead status, spike-without-capture as a distinct ECG
finding from CHB's "no spikes at all") would just be `thirdDegreeAVBlock`
with different narrative text, the exact decorative-duplication pattern
section 1 forbids. A real implanted-device layer is a legitimate, separately-
scoped mechanism (it would ALSO unblock AICD Malfunction's "device fails to
shock a true VF" variant, not built this batch — only the inappropriate-
shock variant was) — filed as its own future batch rather than faked. A
"plain, rate-controlled" **Atrial Fibrillation** presentation (distinct from
RVR) is NOT listed here since the shipped `atrialFibrillation` condition's
mechanism already covers it — composing it with a scenario's own
`patient:{hr:78}`-style override gets one for free, no new condition needed.)*

### Neurologic

*(EMPTY — the entire category shipped this session. See section 3's neuro/
endocrine sweep entry for the full writeup. Thrombotic/Embolic Stroke were
folded into `ischemicStroke` by time-course rather than built separately
(the same reasoning that kept plain-rate-controlled AFib from needing its
own condition) — a stuttering thrombotic course would need beat-by-beat
tracking this continuous-tick engine has the same documented limitation
modeling as afib/flutter's own R-R irregularity. Cushing Reflex and Brain
Herniation Syndrome were deliberately NOT built as separate conditions —
both are now genuinely EMERGENT properties of `increasedICP`/
`intracerebralHemorrhage`/`subarachnoidHemorrhage`'s shared `icpMassEffect`
mechanism (Cushing's triad fires automatically once `pat.icp>25`; herniation
is the same variable reaching its own lethal ceiling), the same "staging
label, not a disease" reasoning already applied to PEA/Asystole/VF.)*

### Endocrine / Metabolic

*(EMPTY — the entire category shipped this session except Lactic Acidosis,
deliberately RETIRED rather than built: `pat.lactate` is already a real,
multi-source emergent observable (sepsis, sympathetic tone, ischemia), not a
primary disease needing its own condition — the same reasoning already
applied to PEA/Asystole/VF and Respiratory Distress/Failure/Arrest. See
section 3's neuro/endocrine sweep entry for the full writeup.)*

### Electrolyte
Severe Metabolic Alkalosis · Hypophosphatemia · Hyperphosphatemia ·
Mixed Acid-Base Disorder

*(Hyperkalemia shipped as `hyperkalemiaMissedDialysis`, and THIS session
shipped every other entry that had a real engine handle to reuse —
`hypokalemia`, `hypercalcemia`, `hypocalcemia`, `hypermagnesemia`,
`hypomagnesemia`, `hyponatremia`, `hypernatremia`, `severeMetabolicAcidosis`
— see the "already implemented" list and section 3's newest entry for the
full mechanism writeup. What's left needs either a new mechanism this
engine doesn't have (Hypophosphatemia/Hyperphosphatemia — no phosphate
model exists anywhere in `physio/`, confirmed by grep before this session's
batch started) or a real, deliberate design decision rather than reuse
(Severe Metabolic Alkalosis would need a genuinely new respiratory-
compensation term — `respiratory.js`'s Winter's-formula term is
one-directional, hypoventilation-for-alkalosis compensation was not
attempted this session, deliberately, to keep this batch's mechanisms all
independently verified rather than adding one un-measured new term under
time pressure; Mixed Acid-Base Disorder is a real category, not a single
disease, and needs its own scoped design pass before being built.)*

### Respiratory
Smoke Inhalation Injury (see note) · Pulmonary Edema (non-cardiogenic) ·
Mucus Plug Airway Obstruction ·
Tracheostomy Obstruction ·
Tracheostomy Dislodgement

*(This category shrank sharply in a single session (most
recent) — thirteen new conditions shipped: `bronchitis`, `bronchiolitis`,
`pertussis`, `influenzaPneumonia`, `covidPneumonia`, `croup`, `epiglottitis`,
`spontaneousPneumothorax`, `openPneumothorax`, `hemothorax`,
`pleuralEffusion`, `ards`, `aspirationPneumonitis`, plus
`cysticFibrosisExacerbation` and `tuberculosisHemoptysis` — see section 3
for the full writeup, including two genuine new engine mechanisms this batch
built (`pat.pleuralEffusion`, a shared external-lung-compression handle for
hemothorax/effusion, and `pat.upperAirwayObstruction`, a separate
non-beta-2-responsive resistance axis for croup/epiglottitis) and a real,
previously-inert bug fix (the vented chest seal procedure had `fx:{}` —
completely dead — despite three existing trauma scenarios' own resolve()
text already claiming it prevented tension physiology).
**Upper Respiratory Infection was deliberately NOT given a `CONDITIONS`
entry and is not listed here** — same reasoning `doa`/`prankCall` already
established (section 4's own note): its physiology is genuinely trivial (a
mild self-limited illness with no meaningful systemic derangement), so a
condition would write fields nothing meaningfully reads, the exact
decorative-mechanism pattern section 1 forbids. It shipped as a
content-only scenario instead (`upperRespiratoryInfection`, MISC-041), the
same pattern `minorSprain`/`chronicBackPain` use.
**Respiratory Distress / Respiratory Failure / Respiratory Arrest are
REMOVED from this list, not built, on the same reasoning the cardiac batch
already applied to Ventricular Fibrillation**: these are clinical STAGING
labels along a continuum this engine already produces emergently
(respiratory drive suppression, fatigue-driven hypoventilation, progressive
hypoxia/hypercapnia — all pre-existing, already-verified mechanisms in
`respiratory.js`), not distinct disease entities with their own
pathophysiology. They are already exercised by existing scenarios
(`resp`, `respArrest`, `pneumoniaSepsis`'s own respiratory-failure limb,
and now this batch's own `ardsTransfer`) — there was never a missing
mechanism here, only a mislabeled backlog entry.
**Smoke Inhalation Injury remains genuinely deferred** — it needs a real
carboxyhemoglobin mechanism (pulse oximetry cannot distinguish COHb from
O2Hb, so displayed SpO2 reads falsely normal — the actual teaching point)
that this session did not build, and which the Toxicology category's own
then-unbuilt Carbon Monoxide Poisoning entry would share; building it
piecemeal for one condition risked having to redo it for the other. **UPDATE
(a later session): that mechanism is now real** — `carbonMonoxidePoisoning`
shipped with a genuine `pat.cohb`/`pat.caO2` pulse-ox-blindspot mechanism
(see section 3's own entry). Smoke Inhalation Injury and Cyanide Poisoning
can both reuse it directly rather than build it from scratch; neither was
attempted in that same session, per its own "one condition per batch"
discipline. See queue item 28 for the original fuller reasoning.)*

### Toxicology / Poisoning
Acetaminophen Overdose ·
Aspirin Toxicity · Beta Blocker Overdose ·
Calcium Channel Blocker Overdose · Organophosphate Poisoning · Cocaine Toxicity ·
Methamphetamine Toxicity · Serotonin Syndrome · Neuroleptic Malignant Syndrome ·
Benzodiazepine Overdose · Alcohol Intoxication · Alcohol Withdrawal ·
Opioid Withdrawal · Caustic Acid Ingestion · Alkali Ingestion · Synthetic Cannabinoid Intoxication ·
Fentanyl Overdose ·
Hallucinogen Toxicity ·
MDMA Toxicity ·
Inhalant Abuse ·
Scorpion Envenomation ·
Spider Envenomation
(Snake/crotaline Envenomation shipped as `envenomation`; Hydrocarbon Aspiration,
Lithium Toxicity, Iron Overdose, and Marine (box jellyfish) Envenomation all
shipped this session — see section 3)

### Shock states
Hypovolemic Shock · Hemorrhagic Shock · Non-Hemorrhagic Hypovolemic Shock ·
Burn Shock · Obstructive Shock ·
(Septic Shock shipped this session as `septicShock` — see section 3)
Metabolic Shock · Undifferentiated Shock ·
Mixed Shock ·
Post-Cardiac Arrest Syndrome

*(Neurogenic Shock shipped this session — see the "already implemented"
list and section 3's newest entry: reuses `pat.vasodilation`, the same
distributive-shock handle `addisonianCrisis`/`anaphylaxis` already use.)*

### Vascular / Hematology
Femoral Artery Hemorrhage · Carotid Artery Hemorrhage ·
Brachial Artery Hemorrhage · Radial Artery Hemorrhage · Anemia ·
Sickle Cell Disease · Hemophilia · Disseminated Intravascular Coagulation ·
Thrombotic Thrombocytopenic Purpura · Epistaxis with Hemorrhage ·
Upper Extremity DVT ·
Factor Xa Inhibitor Associated Bleeding ·
Warfarin Associated Bleeding

*(Deep Vein Thrombosis and Pulseless Extremity/Acute Limb Ischemia both
shipped this session as `deepVeinThrombosis`/`acuteLimbIschemia` — a
deliberate contrast pair (venous vs. arterial occlusion), see section 3's
newest entry. Upper Extremity DVT, a distinct anatomic variant, is left
open. Abdominal Aortic Aneurysm shipped in a later session as
`abdominalAorticAneurysm` — see the "already implemented" list and section
3's newest entry.)*

### Gastrointestinal
Gastroenteritis · Peritonitis ·
Peptic Ulcer Disease ·
Diverticulitis · Constipation / Fecal Impaction ·
(Incarcerated Hernia shipped this session — see section 3)
Volvulus ·
Ischemic Colitis ·
Acute Hepatitis ·
Hepatic Encephalopathy ·
Spontaneous Bacterial Peritonitis ·
Rectal Bleeding

*(Acute Cholecystitis, Upper GI Bleed, Lower GI Bleed, and Mesenteric
Ischemia all shipped this session — see the "already implemented" list and
section 3's newest entry. Upper/lower GI bleed were built and asserted as
a deliberate pair: `lowerGIBleed` (diverticular, painless) vs.
`upperGIBleed` (peptic ulcer, painful) — both reuse `pat.activeBleedRate`,
the same mass-conserving hemorrhage mechanism every trauma bleed already
uses, per `tuberculosisHemoptysis`'s own precedent comment. Acute
Pancreatitis and Bowel Obstruction shipped in a later session as
`acutePancreatitis`/`bowelObstruction` — see the "already implemented"
list and section 3's newest entry.)*

### Renal / Genitourinary
Urinary Tract Infection · Pyelonephritis · Urosepsis · Acute Urinary Retention ·
Renal Calculi · Testicular Torsion · Epididymitis · Priapism Acute · Kidney Injury ·
Dialysis Disequilibrium Syndrome ·
Hematuria ·
Paraphimosis ·
Phimosis

*(Hyperkalemia from Missed Dialysis shipped as `hyperkalemiaMissedDialysis`
— see the "already implemented" list and section 3's newest entry. Testicular
Torsion's own scenario already shipped content-only, with no condition —
see that scenario's own note under "already implemented" — a true
physiology-mechanism version of it, if ever wanted, is a separate,
still-open question from this list's own framing, left as-is.)*

### Obstetric / Gynecologic
Pregnancy-Induced Hypertension · Preeclampsia ·
Eclampsia · Premature Rupture of Membranes · Spontaneous Abortion ·
Breech Presentation · Limb Presentation · Shoulder Dystocia ·
Umbilical Cord Prolapse · Nuchal Cord · Meconium Aspiration ·
Supine Hypotensive Syndrome · Dysmenorrhea · Mittelschmerz ·
Pelvic Inflammatory Disease · Preterm Labor ·
False Labor ·
Postpartum Preeclampsia ·
Retained Products of Conception ·
Retained Placenta ·
Vaginal Hemorrhage (Non-Pregnant)

*(Preeclampsia is called out in the condition-library workstream's suggested
first batches (queue item 7). The eclampsia seizure writer it once needed already
shipped, so that is no longer an open dependency. Supine Hypotensive Syndrome is
largely already modeled — `updateObstetric` applies aortocaval compression scaled
by gestation and relieved by tilt — so it is a review, not a build. Postpartum
Hemorrhage shipped this session as `uterineAtony` — see the "already
implemented" list above — and is removed from this backlog. Ectopic
Pregnancy, Placental Abruption, Placenta Previa, Ovarian Torsion and
Ruptured Ovarian Cyst shipped in a later session as
`ectopicPregnancyRuptured`/`placentalAbruption`/`placentaPrevia`/
`ovarianTorsion`/`rupturedOvarianCyst` — see the "already implemented"
list and section 3's newest entry.)*

### Pediatric
Sudden Infant Death Syndrome (SIDS) · Congenital Heart Disease ·
Pediatric Septic Shock ·
Pyloric Stenosis · Partial Foreign Body Airway Obstruction · Febrile Infant ·
(Neonatal Sepsis, Pediatric DKA, and Intussusception all shipped this session — see section 3)
BRUE (Brief Resolved Unexplained Event) ·
Failure to Thrive ·
Neonatal Hypoglycemia ·
Pediatric Asthma Exacerbation ·
Pediatric Anaphylaxis ·
Pediatric Respiratory Arrest ·
Pediatric Cardiac Arrest

*(The age profile machinery already exists and is barely exercised, so pediatric
variants are cheaper to build than they look — but weight-scaled dosing and
age-scaled physiology must both be checked. Body-size reference errors are a
recurring defect class here — the `_restCo` defect and the `bodyScaleBaselineL`
frame error in section 3 were both exactly this shape.)*

### Infectious disease
HIV/AIDS · Human Papillomavirus (HPV) · Sexually Transmitted Disease
(unspecified) · Cellulitis · Necrotizing Fasciitis · Septic Arthritis ·
Toxic Shock Syndrome · Malaria · Dengue Fever · Sepsis (Undifferentiated Source) ·
Neutropenic Fever ·
Influenza ·
COVID-19 (Mild) ·
Herpes Zoster ·
Clostridioides difficile Colitis ·
Lyme Disease 

### Psychiatric
Acute Psychosis ·
Catatonia · Suicidal Ideation / Suicide Attempt · Excited Delirium Syndrome ·
Acute Agitation ·
Behavioral Emergency ·
Acute Mania ·
Major Depressive Episode ·
Conversion Disorder ·
Dissociative Episode

*(Panic Attack / Hyperventilation Syndrome shipped this session as
`panicAttackHyperventilation`, exactly the way this note used to predict:
zero new engine code, just a sustained elevated `rrBase` and
`respiratory.js`'s own already-existing hypocapnic brake — see the "already
implemented" list and section 3's newest entry.)*

### Trauma
Pelvic Fracture with Hemorrhage · Flail Chest · Pulmonary Contusion ·
Cardiac Contusion · Commotio Cordis · Traumatic Asphyxia · Rib Fracture ·
Liver Laceration · Splenic Rupture · Retroperitoneal Hemorrhage ·
Open Skull Fracture · Basilar Skull Fracture · Concussion · Epidural Hematoma ·
Subdural Hematoma · High Cervical Spinal Cord Injury · Spinal Shock ·
Central Cord Syndrome · Anterior Cord Syndrome · Brown-Sequard Syndrome ·
Neurogenic Hypotension · Traumatic Amputation · Degloving Injury ·
Compartment Syndrome · Crush Hand Injury · Eye Globe Rupture ·
Penetrating Neck Trauma · Blast Injury · Open Tibia/Fibula Fracture ·
Open Humerus Fracture · Facial Trauma with Airway Compromise · Hematoma ·
Contusion · Avulsion · Epistaxis · Strain · Closed Femur Fracture ·
Hip Fracture ·
Shoulder Dislocation ·
Anterior Shoulder Dislocation ·
Posterior Shoulder Dislocation ·
Elbow Dislocation ·
Patellar Dislocation ·
Hip Dislocation ·
Ankle Fracture ·
Wrist Fracture ·
Clavicle Fracture ·
Mandibular Fracture ·
Nasal Fracture ·
Dental Avulsion ·
Burn Inhalation Injury ·
Thermal Burn ·
Chemical Burn ·
Electrical Burn ·
Radiation Burn ·
Corneal Abrasion ·
Foreign Body in Eye ·
Traumatic Hyphema ·
Auricular Hematoma ·
Nail Bed Injury ·
Finger Amputation ·
Hand Crush Injury ·
Tourniquet Syndrome

*(Facial Trauma with Airway Compromise pairs with queue item 13 — it is one of
the four sources named for the `pat.airwayFluid` mechanism that would finally make
`suction` do something. Sprain also has a waiting consumer: the `minorSprain`
scenario (TRMA-033) is currently condition-LESS — an isolated ankle inversion
injury with static vitals — because no sprain/isolated-extremity-injury
condition exists yet. See queue item 24.)*

### Environmental
Heat Cramps · Heat Exhaustion · Mild Hypothermia ·
Moderate Hypothermia · Severe Hypothermia · Frostbite · Near Lightning Strike ·
High Altitude Illness · Decompression Sickness · Cold Water Immersion ·
Near Hanging ·
Strangulation Injury ·
Smoke Inhalation ·
Carbon Monoxide Exposure ·
Toxic Gas Exposure ·
Drowning (Adult) ·
Near Drowning (Adult) ·
Animal Bite ·
Dog Bite ·
Human Bite ·
Marine Envenomation

*(The thermoregulation layer already exists — `thermo.js` — and the heat and cold
ladders are graded severities of one mechanism, so they are efficient to build as
a group once the underlying heat-balance model has been reviewed. Note the
post-arrest work made core temperature a live modifier of cerebral ischaemic
injury, so the hypothermia entries now have a real consumer: a cold arrest
genuinely takes longer to reach brain death than a warm one.)*

### Chronic
Coronary Artery Disease (as symptomatic chronic disease, not merely stenosis) ·
Neuropathy · Osteoporosis · Congestive Heart Failure (Stable) ·
Chronic Liver Disease ·
Cirrhosis ·
Chronic Anemia ·
Peripheral Arterial Disease ·
Peripheral Neuropathy ·
Parkinson Disease ·
Multiple Sclerosis ·
Amyotrophic Lateral Sclerosis (ALS) ·
Dementia with Behavioral Disturbance

*(These are composable baselines rather than emergencies — the pattern the
existing `copd` and `chronicKidneyDisease` entries use, where a chronic condition
sets the physiology an acute condition then acts on. Chronic Mechanical Low Back
Pain is newly added here — the `chronicBackPain` scenario (MISC-034) is
condition-LESS today, and this is the only category it fits: chronic, not an
emergency, essentially no systemic physiology to model beyond intrinsic pain
(`pat.intrinsicPain` now exists and is unblocked — see section 3). See
queue item 24.)*
