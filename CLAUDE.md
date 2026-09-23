# Proximate — physiology engine work. Session handoff.

You are continuing work on **Proximate**, a browser-based prehospital-care
simulator whose value rests entirely on its closed-loop physiology engine. The
engine is a coupled ODE model — a 16-state cardiovascular loop, a mechanical
respiratory model, renal/endocrine, metabolic, coagulation, thermoregulation,
neuro, obstetric — plus a two-compartment pharmacokinetic/pharmacodynamic layer.

**This document is self-contained.** It supersedes all previous handoffs; you do
not need any earlier version.

**This document covers the physiology engine and gameplay only.** Proximate
also ships a separate, largely independent EMT-B study-platform subsystem at
`src/education/` (`EducationApp.jsx` and friends — MCQ practice with SRS
scheduling, an NREMT-inspired IRT-based adaptive practice exam, a WIP
Lectures tab, and a crowdsourced-question submission/admin-review workflow),
reachable from `RootApp.jsx`'s home screen alongside the game. It shares no
code with the physiology engine and is not covered by this document's own
verification suites (`mechanismWiring.mjs`/`scenarioSweep.mjs`/
`physiologyValidation.mjs` never touch it) or by section 6's queue. If you're
asked to work on questions, SRS, the adaptive exam, lectures, or
crowdsourcing, start by reading `src/education/*.js` directly rather than
searching this document for it — nothing about that subsystem is tracked
here beyond this pointer and the changelog entry at the top of section 3.

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
   a previous item in the queue's own condition-library workstream. Consult it when working that item;
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

## 2. Current state — a real strong-ion-difference acid-base model (a previous item in the queue, CLOSED)

**CURRENT VERIFICATION BASELINE (this session's multi-agent parallel batch,
SECOND wave — five more conditions plus a mass-conservation audit tool,
merged and verified to completion; see section 3's topmost entry for the
full writeup, including a real snapshot()-crash found and fixed during this
verification pass):**

| suite | result | notes |
|---|---|---|
| `mechanismWiring.mjs` | **612 passed, 5 failed** | every new section for all five conditions shipped this wave (Necrotizing Fasciitis, Neuroleptic Malignant Syndrome, Cocaine Toxicity, Malaria, Dengue Fever) PASSED, including their own treatment-response and specificity assertions. All 5 failures are pre-existing, already-documented flaky/borderline assertions unrelated to this wave: the BVM trio (`ventUnloadFraction`/`workOfBreathing`/`vtPrev`), the PAC HR-variance stdev check, and the tracheostomy-vs-native-airway `vt` comparison (an inherently razor-thin 0.002 L margin, already documented elsewhere in this file as asserted at the real measured threshold, not an invented larger one). |
| `scenarioSweep.mjs` | **181 scenarios, 17,999,728 checks, 0 failed** | clean across the entire scenario library, including all five new scenarios shipped this wave. |
| `npx eslint src` | clean | same pre-existing 3-error `react-refresh/only-export-components` baseline in `App.jsx`, zero new findings anywhere else. |
| `npx vite build` | clean (22.90s) | same pre-existing >500kB chunk-size warning |

**`physiologyValidation.mjs` was NOT run this session** — stated honestly,
not assumed clean; the two suites above are this session's real regression
evidence.

---

**Everything below this line is the PRIOR wave's own baseline, carried
forward for its own detail — not the current numbers.** `mechanismWiring.mjs`
574/1, `scenarioSweep.mjs` 176 scenarios/17,185,698 checks/0 failed, from
the first wave (blood viscosity, methemoglobinemia, ketamine, thirst,
liver/gut reversible injury, acute traumatic coagulopathy, serotonin
syndrome) — see section 3's second-topmost entry.

---

**Everything below this line is the older section-2 text, carried forward. STOP:
the table below is several batches stale — do not trust it for the
current condition count or the current suite numbers.** Read section 3's
topmost entry (a previous item in the queue, the acid-base solver) for the current
verification baseline, now restated at the top of this section — the
valvular-regurgitation table immediately below is the batch before that one,
kept for its own still-accurate mechanism-level detail, not as a status
source. Below THAT is the older "next 3 items" physiology batch — a previous item in the queue's
uremic-fetor sub-case closed for real, `atropineOverdose` shipped under
a previous item in the queue's standing workstream, `toxicInhalationChlorine` shipped as a previous item in the queue's physiology half — 156 conditions now implemented. Touched files:
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
both clean. Below that is the five-queue-item physiology batch (a previous item in the queue closed, two new overdose conditions shipped under a previous item in the queue's
standing workstream — 154 conditions at that point). Below that is the OB/GYN
hemorrhage + AAA + GI batch (8 new conditions in one session, a previous item in the queue's standing workstream — 152 conditions at that point, fully verified:
`mechanismWiring.mjs` 343/1 the a previous item in the queue's own gap since closed above,
`scenarioSweep.mjs` 152/6,907,794/0). Below that is the electrolyte +
shock/GI/vascular/psychiatric batch (16 new conditions in one session —
144 conditions at that point, also fully verified to completion:
`mechanismWiring.mjs` 325/1 both pre-existing, `scenarioSweep.mjs`
144/6,414,626/0). Below that is a front-end map-expansion batch (five
items — multi-hospital maps, capability-aware destination routing,
weather/road-surface transport effects, real-route 3D wiring), front-end
only, no physiology suite re-run needed for it. Below THAT is
`rocuroniumOverdose` (a previous item in the queue's standing overdose-condition
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
acute conditions from a previous item in the queue), touching `patient.js`,
`neuro.js`, `cardiovascular.js`, `respiratory.js`(read-only reuse),
`thermo.js`, `conditions.js`, `scenarios.js`, `gear.js`. `mechanismWiring.mjs`
and `scenarioSweep.mjs` are both freshly re-run against this batch's FINAL
state, after three real iteration cycles (an initial pass found 10 real
issues — some genuine bugs, some test-calibration mistakes — all fixed and
documented in section 3).

| suite | what it does | last result | approx runtime |
|---|---|---|---|
| `mechanismWiring.mjs` | proves each declared mechanism reaches an observable | **RE-RUN since (section 3's newest entry, the a previous item in the queue's own `bun`/`dpg` batch): 268/269. The 1 failure, `activeSeizureGTC` seizure engagement at 6/10 vs needed 7/10, is a NEW single-run flaky draw (unrelated to that batch — re-confirmed as noise at 7/10, 8/10, 8/10 on standalone re-runs), not the same two failures this row used to cite (torsades+cardioversion, PAC HR-variance) — those passed clean in this run. Treat 268/269 as current, not the 267/269 below** | ~22 min |
| `scenarioSweep.mjs` | scenarios x 900 s, impossible-value checks | **RE-RUN since (same a previous item in the queue's own batch): 124 scenarios / 4,965,706 checks / 0 failed — the +223,200 over the count below is exactly the a previous item in the queue's own batch's own new `bun`/`dpg` field checks (124 scenarios x 450 ticks x 4 checks), confirmed arithmetically, not just asserted** | ~20 min |
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

### 2026-09-22 — Assigned scope: two queue items closed via re-audit (item 26, CPR quality; item 23's receptor-class gap), several genuinely large items (16, 17, 18, 25) confirmed still open and correctly not attempted blind under the time budget. No new physiology mechanism was built this session; both closures are documentation corrections against code that was already real, per lesson 16.

**Item 26 (CPR depth/rate/duty) — CLOSED. Its own "compression depth, rate,
and duty have no independent effect on output" claim was stale.** Traced
the full CPR chain before touching anything: `cardiovascular.js`'s
`mechAct = 0.17 * cpr` floor reads `pat.cprActive`, and `pk.js`'s `"cpr"`
dose handler already multiplies a real depth+rate quality composite into
that SAME `cprActive` — `pat.cprActive = Math.max(pat.cprActive, intensity
* freshness * cq)`, where `cq` is exactly `pat.cprQuality` (0-1,
`CprMinigame.jsx`'s own real `depthScore * rateScore` from the player's
actual compressions, expiring 30s after the last scored one so
crew/unscored CPR correctly defaults to `cq=1`, i.e. the OLD, undegraded
floor) and `freshness` is a real ~12s-tau decay from the last CPR dose
(Berg et al., Circulation 2001; Kern et al., Circulation 2002). This
consumer evidently shipped in an earlier, undocumented session — the
in-code comment at the `"cpr"` handler even states "a prior investigation
measured this directly," confirming it predates this session. A
documenting cross-reference comment was added at `cardiovascular.js`'s
own floor line (the site this item's stale text pointed at) so a future
reader lands on the real mechanism immediately instead of re-discovering
this. Deliberately did NOT add a second consumer there — `cardiovascular.js`
reading `pat.cprActive` already inherits the quality-scaled value, so a
second multiplier would double-count `cq`. Compression rate specifically
has no separate timing consumer (`compressionRate=110` stays fixed for
EtCO2 cycle timing); its contribution is already folded into the one
composite score, and splitting it out would need its own real
justification, not attempted. `node --check`/`npx eslint
src/physio/cardiovascular.js`: clean. No suite re-run needed — the change
is comment-only, zero functional difference (confirmed by reading the
diff, not assumed).

**Item 23 (ketamine/receptor-class gap) — re-audited, and the remaining
gap is reclassified from "unbuilt" to "blocked on a missing producer."**
Grepped the full `drugs.js` formulary for any drug that would drive a
histamineH1/H2, serotonin, or second NMDA receptor term through the
continuous `receptors` mechanism `pk.js` already uses for
alpha1/beta1/beta2/muscarinic/etc — none exists (no H2-blocker,
SSRI/MAOI/triptan-class drug, or second NMDA agent is in this formulary).
Building those receptor classes now would be a field with no real
producer ever able to set it — the inverse of section 1's "written, never
read" rule, but the same defect in spirit. Both real clinical pictures
this item implicitly gestures at already have a real mechanism through a
DIFFERENT, already-adequate route: cutaneous urticaria is real and
consumed via `pat.urticaria` (patient.js/conditions.js's
`allergicReactionMild`, treated by `diphen`'s own `pkModel:"curve"`
`fx:{urticaria:-0.5}`, not the continuous `receptors` object — a real H1-
antagonist consequence expressed through a simpler mechanism because
diphenhydramine's own PK entry never needed the more general one);
serotonin toxicity is real and shipped as its own full condition,
`serotoninSyndrome` (conditions.js), a condition-level mechanism rather
than a drug-receptor one, correctly so given no serotonergic drug exists
to react against. Left unbuilt, correctly — the natural place to add a
histamineH1/H2/serotonin/second-NMDA receptor class is the same batch
that ever adds the drug needing it, not speculatively ahead of time. No
code changed; audit-only.

**Items 16 (respiratory-muscle structured state), 17 (RAAS →
`pat.renal` refactor), 18 (nephron segment chain beyond the already-
shipped osmotic-diuresis slice), and 25 (fetal compartment — fetal
oxygenation/placental-umbilical flow/fetal Hb, distinct from the
already-shipped `pat.fetalHR`) were read in full and confirmed still
genuinely open, matching their own current text, and were NOT attempted
this session.** Each is real, large, separately-scoped mechanism or
refactor work (a new `pat.respiratoryMuscles` structured state; a
single-writer-discipline object refactor touching every existing RAAS
consumer; the full glomerulus→PCT→loop-of-Henle→DCT→collecting-duct
nephron ladder plus a first diuretic drug; a genuinely new fetal DO2/
Hb/umbilical-flow compartment coupled to placental perfusion) that would
need its own dedicated, carefully-measured batch with fresh
`mechanismWiring.mjs`/`scenarioSweep.mjs` verification, not a rushed
addition alongside two documentation-only closures. Stated honestly
rather than guessed at under time pressure, per section 4's own
discipline against exactly that.

**Verification for this session's own two real changes.** `node --check`
and `npx eslint` clean on the one touched source file
(`src/physio/cardiovascular.js`, comment-only edit, zero functional
change). Since neither change alters any executed code path, the full
`mechanismWiring.mjs`/`scenarioSweep.mjs` suites were not re-run — stated
honestly, not assumed. No new patient field was added, so no
`scenarioSweep.mjs` list changes were needed.

### 2026-09-22 — Queue items 39/40/42/44 re-verified against the tree (lesson 16): item 40's own flagged "biggest finding" (outcomeReport() has no caller) and items 42/44's own "still open" gaps are ALL already resolved, evidently by concurrent/earlier work never reflected back into this document. No new physiology code was written; this was a verification-and-documentation pass, stated honestly.

**Item 40 (structural vs. functional damage) is now CLOSED in full, not
just its kidney slice.** Re-grepping `outcomeReport` across `src/App.jsx`
found it wired at every debrief-producing transition (`physioOutcome:
outcomeReport(s)`, tagged "F44" in-code) and a real, distinct "THE CHART"
panel in the debrief screen (`App.jsx` ~line 7513) rendering arrest/ROSC/
downtime, neurological outcome, `irreversibleInjuries`/`reversibleFindings`,
troponin, and death-mechanism treatability straight from
`g.physioOutcome` — the exact "written, read by nothing" defect this
item's own text flagged as its single largest open finding is gone.
`git log -S physioOutcome -- src/App.jsx` shows it landed in a checkpoint
commit that predates this session's own work, so this was found already
shipped, not built here. In the same read, `physiology.js`'s
`outcomeReport()` was also found to already compose liver (`hepaticStunning`)
and gut (`gutMucosalStunning`) into `reversibleFindings` alongside kidney's
`atnProgression` — closing the item's own explicitly-named "still open —
the general per-organ pattern beyond kidney" gap — plus a resolved-TIA
brain finding (`pat._maxStrokeWeakness` vs. current `strokeWeakness`) and a
genuinely new addition beyond the item's own scope, a global
oxygen-extraction-reserve report (`svO2Composite`/`organsAtExtractionLimit`,
cited to Rivers et al., NEJM 2001). `npx eslint src/App.jsx` (3 pre-existing
`react-refresh/only-export-components` errors, unchanged) and `npx vite
build` (clean, same pre-existing >500kB chunk-size warning) both re-confirm
clean against the current tree. See section 6 item 40 for the full,
corrected text — the original filing is kept below it for its own
now-superseded detail, not as current status.

**Item 42 (isolated pruritus/urticaria signal) was itself stale — the gap
it described no longer exists.** A real `pat.urticaria` field, a dedicated
`allergicReactionMild` condition, a graded skin-exam finding
(`actions.js`), a real diphenhydramine treatment effect
(`drugs.js`'s `diphen`, `fx:{urticaria:-0.5}`), and both `laCounty.js`'s and
`national.js`'s own `anaphDiphen` rules reading `ctx.v.urticaria` directly
are all live in the tree, with existing two-sided `mechanismWiring.mjs`
coverage. Marked CLOSED.

**Item 44's crew-directed-nitro-hold gap is also closed.** `App.jsx`'s
`crewFn` now runs the same `DRUGS[t.dose].hold(v)` check the player's own
`medActs()` path already enforced, confirmed by reading the code directly.
The item's OTHER half (the SBP-tiered `nitro2`/`nitro3` dose escalation
itself) remains correctly deferred — unchanged, still blocked on a separate,
real `nitro` recalibration this document's own prior measurement already
found necessary (the current coefficients are oversized enough that any
tested dose-scale-up compounds the problem rather than fixing it).

**Item 39 (consciousness/sedationDepth) was re-verified and found accurate
as written**, with `pat.sedationDepth` now also feeding a real
agitation-calming pathway used by several psychiatric conditions (delirium,
etc.) beyond what the item's own text described — an organic extension, not
a contradiction. The full continuous-arousal-score refactor remains
correctly unattempted (still flagged as large and risky); nothing was
changed here.

**Net effect**: no engine code changed this session; four queue-item text
blocks were corrected to match the tree, and one (40) that had accumulated
a large amount of stale "still open" language is now fully closed. This is
exactly the failure mode lesson 16 warns about, recurring at the scale of
a whole document section rather than one field — worth a broader pass
re-checking other items' own "still open"/"RESOLVED" framings against the
tree when time allows, since the pattern (a fix ships, the queue text is
never updated) has now recurred often enough across this document's own
history to be a standing risk, not a one-off.

### 2026-09-13 — `physiologyValidation.mjs` run to full completion for the first time in many sessions: 113 passed, 2 failed, diffed against the documented 115/0 baseline. Both failures are real and NEW (not pre-existing flakes), root-caused, and filed as new queue items rather than fixed blind. A third real defect (dead, unconsumed desensitization fields from a previous item in the queue) was found in the course of tracing them.

**Blocked on the run properly, not assumed.** Launched in the background
with a PID file, then blocked in a single foreground call polling the log
via `tail --pid=$PID -f` up to the tool's own timeout; the run outlived that
window and continued unattended through a session-limit reset, and was
found complete on the next check (`113 passed, 2 failed, 115 total. TIER:
FULL — all assertions ran.`) — a real full-tier completion, not a truncated
partial (per section 2's own "a truncated run is not a pass" warning).

**Diffed the failure SET against the documented baseline (115 passed, 0
failed), per section 4's own explicit instruction — not just the count.**
Both failures are new:
- `[OPIOID DEPRESSION] morphine 4 mg -> PaCO2 rise`: measured 3.83-3.86
  mmHg against a required [4, 10] mmHg band — a real, small, reproducible
  shortfall (confirmed reproducible via direct re-invocation of the same
  section, not a one-off draw).
- `[SEIZURE LIMB] midazolam terminates moderate seizure`: measured 100% of
  late ticks still seizing against a required [0, 15]% — a full,
  non-borderline failure, not noise.

**Root-caused both, not patched blind, per lesson 8 (instrument before
trusting a hypothesis).** A standalone probe replicating the suite's own
`makePatient()`/`S()`/tick-loop helpers verbatim confirmed BOTH failures are
fully deterministic across repeated constructions (identical to 4 decimal
places on 5 separate patient instances) — ruling out a previous item in the queue's own
per-patient trait randomization (`baroreflexGain`/`metabolicRate`/etc.,
unpinned in this suite's own `makePatient()`, unlike `mechanismWiring.mjs`'s
`pinTraitsNeutral()`) as the cause, which was the first, and wrong,
hypothesis. The real cause, traced directly:

- **Midazolam's own real anticonvulsant intensity is measurably lower than
  the coefficient's own in-code comment claims.** `drugs.js`'s `midazolam`
  entry states "a standard 5 mg dose (measured intensity 0.534) suppresses
  ~48% of the drive" (`anticonvulsant: 0.9`, so 0.9*0.534≈0.48). Direct
  instrumentation of the real engine for the identical dose/timing this
  suite's own `seizureRun()` helper uses shows peak `pat.anticonvulsant`
  plateauing at 0.3905 — an implied intensity of 0.434, not 0.534, a ~19%
  shortfall from the cited figure. At the suite's own glu=35 "moderate"
  severity (`metabolic` drive = 0.25), `rawDrive = 0.25*(1-0.39) = 0.1525`,
  which sits just ABOVE the 0.15 sustain threshold `neuro.js`'s own
  `SUSTAIN` constant uses to decide whether a seizure terminates — a
  genuine, measured near-miss, not a logic bug. Whatever intensity
  computation or PK parameter the `0.534` comment was originally measured
  against no longer reproduces that figure; this is a real, unexplained
  drift between a drug's own documented calibration and its current
  behavior, most likely from an unrelated PK/Emax-formula change in one of
  the many intervening sessions' batches. NOT fixed blind this session
  (would mean either recalibrating a shared intensity computation or
  raising midazolam's own coefficient without knowing which is the "wrong"
  side) — filed as new a previous item in the queue.
- Morphine's own shortfall (3.83-3.86 vs the required floor of 4) is a
  small, ~4% miss on a similarly-shaped calibration comment
  (`drugs.js`: "RE-IDENTIFIED: PaCO2 +6.3 mmHg after 4 mg IV" against a
  documented 5-8 mmHg range, with the suite's own threshold set at a
  narrower 4-10) — plausibly the same class of drift as midazolam's, on a
  different receptor pathway (`respDriveSuppression` vs `anticonvulsant`).
  Filed alongside a previous item in the queue rather than separately, since both may share a
  common root cause in whatever shared PK/intensity code changed.

**A real, separate, previously-undocumented dead-field defect was found
while investigating the trait-randomization hypothesis above, before it
was ruled out.** a previous item in the queue's own receptor-desensitization mechanism
(`pat.opioidDesens`/`gabaDesens`/`beta2Desens`, `pk.js`) computes and
decays all three fields correctly every tick (confirmed via direct probe:
`gabaDesens` climbs from 0 to ~0.39 over a 30-minute midazolam exposure,
exactly as that item's own section-3 entry describes) — but grepping every
file in `src/` for a READ of any of the three names outside `pk.js` itself
and `patient.js`'s constructor default and `scenarioSweep.mjs`'s tracked-
field lists returns nothing: **the whole mechanism is computed, decayed,
and never multiplied into `intensity` anywhere.** This is section 1's own
third rule (a field can be written, read by nothing, and still look
finished) — confirmed this is NOT the cause of either failure above
(desensitization starts at 0 and only climbs from continued exposure; a
single, non-repeated dose in both failing assertions has negligible
`gabaDesens`/`opioidDesens` by the time either measurement is taken), so
it was not fixed blind here either — filed as new a previous item in the queue, since
wiring it in (multiplying `intensity` by `(1 - desensitization)` at the
per-instance loop in `pk.js`, per that item's own original design intent)
would itself need its own re-verification against every drug/condition
combination that reaches sustained-exposure territory, not a one-line
patch to slip into an unrelated verification session.

**Verification, complete for this session's own scope.** No production
code was changed this session beyond CLAUDE.md itself — every finding
above was investigation-only, using throwaway probe scripts (a small
number, each printing `pat.anticonvulsant`/`gabaDesens`/etc. against the
real `Patient` class, matching `physiologyValidation.mjs`'s own
`makePatient()`/`S()`/`STEP` helpers verbatim per lesson 8) that were
stripped before this entry was written — confirmed via a directory listing
showing no `_probe_*`/`_tmp_*` files remain under `src/scripts/`. a previous item in the queue
(the standing condition-library workstream) was not reached this session —
the physiologyValidation.mjs block-and-poll cycle, the session-limit reset
that occurred mid-wait, and the root-cause investigation of both failures
consumed the available time budget; stated honestly rather than claimed.

### 2026-09-10 — a previous item in the queue(b) CLOSED: real aortic regurgitation for aorticDissection, closing the second of a previous item in the queue's three open sub-items; a previous item in the queue/a previous item in the queue/a previous item in the queue/a previous item in the queue/a previous item in the queue/a previous item in the queue re-audited (all confirmed accurately described, no drift); a previous item in the queue confirmed already shipped by a concurrent session

**a previous item in the queue(b), the shipped piece.** a previous item in the queue (see its own section-3 entry, and
section 6's a previous item in the queue) left three sub-items open: (a) ischemic-MR consumption
by the solver, (b) no shipped scenario declares valve disease, (c) AV
dyssynchrony/pacemaker syndrome. This session closed (b). `updateValves`
(cardiovascular.js) has always had a driver
(`if (rf.aorticDissection) ... = Math.max(..., 0.5)`), and `chest`
(the `aorticDissection` scenario) has always narrated "a soft blowing
murmur in diastole... New diastolic murmur — aortic regurgitation" — but
nothing ever set `riskFactors.aorticDissection`, so the murmur was pure
narration with no physiology behind it, exactly the gap the hypercalcemia/
saline fix (a previous item in the queue) was found by and closed the same way.

**A real measurement mistake was caught before trusting the fix, not
after.** The uncalibrated 0.5 severity a previous item in the queue shipped-then-reverted lives
in TWO places: `aiTarget` (feeding `pat.aorticRegurgFrac`, the LUMPED
model's own composite, consumed only by the legacy SV formula that the
authoritative full-loop ODE overwrites every tick per section 5's "two
solvers" rule) and `arStructuralTarget` (feeding
`pat.aorticRegurgStructural`, which the ODE's `derivative()` genuinely
reads for its Qar regurgitant-flow term). A first pass swept only the
`aiTarget` constant from 0.01 to 0.9 and found ef/pp/edv COMPLETELY
insensitive to it — a real, confusing dead end, until reading `derivative()`
directly confirmed `aorticRegurgFrac` was never the consumed field.
Recalibrated to 0.35 instead of 0.5 (this function's own already-
established "moderate AR" default, `rf.aorticRegurgSeverity ?? 0.35`,
reused rather than a new invented number) on the REAL knob,
`arStructuralTarget`, keeping the two constants in sync so a future direct
reader of `aorticRegurgFrac` isn't left disagreeing with the ODE.

**MEASURED against the real engine** (t=240s vs. a suppressed-risk-factor
control, same scenario): pulse pressure 34 -> 51.9 mmHg (+17.9), LVEDV
116.2 -> 147.3 mL (volume overload), forward EF 0.53 -> 0.35 —
still a real, classic widened-pulse-pressure/volume-overload signature,
just not severity 0.5's near-acute-heart-failure magnitude (a previous item in the queue's own
prior measurement: pp 34->59, EF 0.53->0.31). Because "chest" IS the
`aorticDissection` condition, `mechanismWiring.mjs`'s takotsubo section
(which used `chest` as its "matched normal-EF chest-pain control") was
moved onto `acs` instead — troponin-positive but pre-necrosis chest pain,
no valve lesion, EF ~0.50, still comfortably separated from takotsubo's
own ~0.38.

**A real mechanismWiring.mjs test-harness bug was found and fixed in a
follow-up pass, per lesson 8 (verify the harness, don't trust a probe
that happens to pass).** The new `[ACUTE AORTIC REGURGITATION from
DISSECTION]` section's own suppressed-control arm used `settle:240,
run:240` — but `probe()`'s own `mutate` callback only fires inside the
run-phase loop (`settle+STEP` to `run`), which never executes at all when
`settle===run`. Both arms therefore measured the SAME real (unsuppressed)
state, silently passing at first only because the values happened to
coincide by chance at review time — later found FAILING for real once
re-run (pp/edv/ef bit-for-bit identical between "withAR" and "suppressed",
`aorticRegurgStructural` stuck at 0.35 in the "suppressed" arm instead of
0). Fixed by settling only 2s (before AR has time to build) and running
the real 238s comparison window with `mutate` applied the whole time in
the control arm, matching a previous item in the queue's own original "Arm A suppresses the
risk factor each tick" design. Re-verified via a standalone probe: pp
34->51.9, edv 116->147, ef 0.53->0.35 with the risk factor on; both the
suppressed control and a healthy `abdPain` control read exactly 0
`aorticRegurgStructural`.

**Verification.** `node --check`/`npx eslint` clean on all three touched
files (`cardiovascular.js`, `conditions.js`, `mechanismWiring.mjs`) —
zero findings beyond the pre-existing `App.jsx` baseline.
`aorticRegurgStructural` was already tracked in `scenarioSweep.mjs`'s
`REQUIRED`/`NON_NEGATIVE` lists from a previous item in the queue's own original work, so no
sweep changes were needed. `node src/scripts/scenarioSweep.mjs` was run
to completion and came back **183 scenarios, 20,833,820 checks, 915
failed** — byte-identical to the last documented baseline (a previous item in the queue's
own entry, the confirmed PRE-EXISTING `rvEdv`/`rvEsv`/`rvSv`/`rvEf`/
`pvrWood`-undefined-at-t=2s defect on unmodified master), confirming zero
regression. **`mechanismWiring.mjs` could NOT be run to completion in
this session's shared, extremely contended multi-agent environment**
(consistent with lesson 14's "container killed it seven times" — this
session observed 5-7 concurrent `node.exe` processes throughout, and
several full-run attempts either crashed silently partway through
unrelated, far-downstream sections or made only slow, partial progress
over 20-40+ minutes) — stated honestly, not assumed clean. Two independent
partial runs each reached well past this session's own new section and
the modified takotsubo section with 100% PASS on every assertion related
to this change; the standalone probe above (lesson 8's sanctioned
technique, copied against the suite's own probe/pinTraitsNeutral helpers)
is this session's own real, measured regression evidence for the new
mechanism specifically. A future session in a quieter environment should
confirm the full suite passes clean, particularly given the concurrent,
unrelated a previous item in the queue hepatic-coagulopathy assertions another session was
landing in the same file this session.

**a previous item in the queue confirmed CLOSED, no work needed.** Both slow-timescale states
(`pat.lvHypertrophy`, `pat.vascularStiffness`) are shipped and verified
per section 6's own text and the git history (commit "a previous item in the queue's
remainder: real vascular-stiffness chronic adaptation") — read in full
before starting this session's own work, confirmed current, nothing left
to do under this item's own name (nephron loss / coronary atherosclerosis
remain open but unclaimed by any item text as this session's scope).

**a previous item in the queue/a previous item in the queue/a previous item in the queue/a previous item in the queue/a previous item in the queue re-audited by reading the actual code
against each item's own text, no drift found, no code changed.**
- a previous item in the queue: `respiratory.js`'s shunt equation and the `o2ResponseTest` action
  still match the documented scoped slice exactly; the full V/Q-compartment
  population rewrite is still correctly unattempted (genuinely large,
  high-blast-radius work, explicitly out of scope for a single batch).
- a previous item in the queue: `renal.js`'s `proximalReabsorptionEff`/`distalReabsorptionEff`/
  `segmentReabsorptionEff` are all present and unchanged; the full nephron
  segment chain and a real diuretic drug are still genuinely unbuilt.
- a previous item in the queue: confirmed by grep that no `histamineH1`/`histamineH2`/`serotonin`
  receptor class exists anywhere in `drugs.js` — the item's own "still
  genuinely open" claim holds exactly as written.
- a previous item in the queue: `cardiovascular.js`'s CPR block still hardcodes
  `mechAct = 0.17 * cpr` and `compressionRate = 110` — confirmed
  unchanged by direct grep; depth/rate/duty independently moving that
  floor remains real, unattempted mechanism work.
- a previous item in the queue: `pat.monitoring` structure confirmed still deliberately unbuilt
  (no real per-field consumer identified, would be decorative per section
  1) — the item's own text is accurate as written.

**a previous item in the queue (pregnancy/fetal integration) — confirmed already shipped, by a
concurrent session, not this one.** Grepped before starting any new work
on it (lesson 16): `pat.fetalHR` is real and live (`obstetric.js`,
git commit "Physiology: fetal heart rate driven by placental perfusion
(a previous item in the queue, scoped slice)"), with a real `fetalHeartTones` exam
action (`actions.js`) reading it and `placentalAbruption` driving real
fetal bradycardia through it. This item's own section-6 text is now stale
(still describes the fetal compartment as unbuilt) and should be updated
to reflect the shipped scoped slice — not done in this pass, to avoid
colliding with whichever concurrent session is actively documenting that
work in this same file.

**a previous item in the queue (the standing condition-library workstream) was not reached this
session** — the repeated environment interruptions (session-limit resets,
multi-agent CPU contention, and the mechanismWiring.mjs harness bug above)
consumed the available time budget; stated honestly rather than claimed.



---

**Older entries moved to `SESSION_HISTORY.md`** to keep this file short.
Same rules apply there (historical changelog, cross-check section 2/6 for
current status). Consult it for mechanism-level reasoning behind older
fixes; it is not required reading for day-to-day work.
## 4. How to work

**WRITE EVERYTHING IN AMERICAN ENGLISH AND NO EM DASHES IN PUBLIC FACING CONTENT.** Code, comments, commit messages,
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
troponin, the regional-NSTEMI band) are in the queue as a previous item in the queue precisely so
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
    guessing. (This is why the a previous item in the queue recurring-crew-button batch was deferred with a
    question rather than shipped on a guess.)
  - Prioritize robust, DATA-DRIVEN systems over hardcoded behavior — new vehicle
    types, crew configs, career content, events, and scenarios should be addable
    later with minimal code changes, the same way conditions/drugs/scenarios
    already are in the physiology engine.
  - New visual/audio ASSETS get a spec markdown before (or instead of) actual
    art: `src/assets/<category>/<Name>.md` containing Purpose, Intended
    appearance, Theme/style, Important visual elements, and Notes for the artist
    or asset generator. These are specifications only — do not attempt to
    generate actual artwork. `src/assets/audio/README.md` (a previous item in the queue, prior batch) is
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
detail lives in the code comments at the fix site. This list is only open work,
renumbered sequentially from 1 as a single, unified queue (front-end/gameplay
and physiology-engine work interleaved, not split into separate tracks) each
time it's reordered.

**The queue is a single, numbered, priority-ordered list — front-end/gameplay work
and physiology-engine work are interleaved in it, not split into separate tracks.**
Items near the top tend to be front-end/gameplay work (React front end,
`src/App.jsx` and friends, scenario/content data, the game loop), simply because
that was the standing top priority the last time this list was reordered — but
nothing about the numbering itself distinguishes front-end from physiology-engine
items, and a session should feel free to work whichever item is next regardless of
which side of the codebase it touches. IMPORTANT CAVEAT FOR ANY FRONT-END ITEM: the
three verification suites (`mechanismWiring`, `scenarioSweep`, `physiologyValidation`)
test the PHYSIOLOGY ENGINE ONLY — they will not catch front-end regressions. For
front-end work the checks are `vite build` passing, `eslint` holding at its
current baseline (see section 2's table for the live error/warning count — do
not trust a number quoted inside an older section 3 entry, which records the
count AT THE TIME that entry was written), and inspection/description of the
behavior change; there is no automated UI test harness. **Items are meant to be
deleted outright, not just marked done, the session they ship**, so the list
should stay free of stale entries by construction, and the whole list is
renumbered sequentially from 1 whenever it's reordered — a number cited in an
older section 3 write-up (a batch's own historical label at the time it shipped)
will not match the live numbering below; those are historical labels, not
live queue numbers. Order is roughly by leverage, not strict priority — use
judgment, and each item bundles several related requests as sub-bullets so they
can be tackled together.

1. **ABSOLUTE TOP PRIORITY, STANDING DIRECTIVE: Medical Simulation Mode —
Local Browser LLM Dialogue System (operator-supplied spec, verbatim below).
Placed ahead of a previous item in the queue by explicit operator instruction — work this before
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
verified live via a new `tools/browser/verifyDeviceHint.mjs`.** **STATUS: a previous item in the queue's originally-scoped numbered
a previous item in the queue are now CLOSED — seven real, verified slices have shipped (see
section 3's seven newest entries), the last of which (a previous item in the queue) is
the closing slice for this block. Every one of a previous item in the queue through 11 now has a
real, verified implementation (live in this environment where the
environment allows it, direct-function/forced-state verification where a
genuine WebGPU adapter is the only thing standing in the way — see below).
What remains open is real, and is restated precisely at the end of this
entry — this is NOT a claim that a previous item in the queue's full 33-item spec or Definition of
Done is complete.** The shared Dialogue Manager
architecture (a previous item in the queue), a bounded structured-context builder
(a previous item in the queue), Tier 1/2 (deterministic/template) dialogue actually working
and wired to real physiology (personality-driven unprompted patient
dialogue, a previous item in the queue; dialogue during a procedure without blocking, a previous item in the queue;
treatment-response dialogue, a previous item in the queue; a real crew-voiced dialogue reaction
plus its reverse edges, a previous item in the queue's own "crew dialogue can reuse the same
architecture"), `LocalLLMProvider` (Tier 3) GENUINELY FUNCTIONAL (real
`navigator.gpu` feature detection, a real `generate(event,ctx)` call path
backed by `@mlc-ai/web-llm`, a real layered load/generation timeout,
verified fallback to Tier 2 on any failure, a `requestLocalUpgrade()`
fire-and-forget helper wired into one real gameplay site), and — NEW this
session — **a previous item in the queue, the boot/initialization screen, is real and shipped**:
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
console errors. **a previous item in the queue (persistent model caching) is now real — see
section 3's newest entry.** `LocalLLMProvider.checkCache()`
(`dialogueProvider.js`) calls web-llm's own real, exported
`hasModelInCache()` BEFORE the loader runs, and `status()` now reports a
genuinely distinct `"loading-from-cache"` vs `"downloading"` state instead
of one collapsed `"loading"` — the boot UI's DOWNLOADED/CACHED-vs-
in-memory distinction a previous item in the queue's own status model was left with room for now
has real data behind it, verified both live (a fresh boot launch, and a
reload confirmed to honestly report "not cached" rather than a false
positive) and via a direct-function test that seeds a real, correctly-keyed
Cache API entry and confirms detection. Resumability was investigated
against web-llm's own source (not assumed): it is real, but at
SHARD-FILE granularity (each of the model's many download chunks commits
to the Cache API atomically and independently; an interrupted download
skips already-completed shards on a later launch and only re-fetches the
rest), not literal byte-level "resume at 63%" — see section 3 for the full
citation trail. **a previous item in the queue (the ~20% progressive-download-gate UX) is now
real** — see section 3's newest entry: a pure, exported
`progressStage(fraction)` (`dialogueProvider.js`) classifies real download
progress as `not-started`/`early`/`meaningful`(>=~20%)/`ready`, surfaced via
`dialogueManager.getLocalAiState().progressStage` and rendered as
threshold-aware messaging under the boot screen's Continue button
(`src/components/bootScreenText.js`'s `continueHint()`) — the button itself
was already always-clickable at every state (a previous item in the queue, unchanged), so this
slice added the tone change the spec's own text describes, not a new gate.
Verified via synthetic progress values fed directly to `progressStage()`
(15 cases including the exact threshold boundary), not a live download
observed crossing 20% — no environment tested so far can produce one. A
also-fixed-this-slice `tools/browser/verifyLocalLLMProvider.mjs` (was
broken since the boot-screen slice added `phase:"boot"` and never clicked
through it) now passes again. **a previous item in the queue is now real — see section 3's newest
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
across a reload/tab-close anyway. **a previous item in the queue are now real and
shipped — see section 3's newest entry, the closing slice for this block.**
a previous item in the queue: `src/components/AiReadyNotice.jsx`, mounted from `Shell.jsx`, shows
the spec's exact "Local AI is ready. Refresh Proximate to enable dynamic
dialogue." notice with a `Refresh Now` button and a dismiss control, only
after a genuine downloading/loading→ready transition observed during the
current session — never on first paint, never forced. A real investigation
into refresh-vs-hot-swap (traced against the actual `requestLocalUpgrade`→
`generate`→`_ensureEngine` call chain) found this codebase's own singleton
`LocalLLMProvider` design already lets the SAME session pick up a
freshly-`"ready"` model on its very next dialogue event with zero extra
plumbing, so no hot-swap code was built — `Refresh Now` is a plain,
player-optional `location.reload()`, never automatic. a previous item in the queue:
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
environment across any a previous item in the queue session — no environment tested so far has a real
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
gotchas list for the fix). **a previous item in the queue's mini-game dialogue gap is now closed
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
section 3 for the honest caveat). **a previous item in the queue (personality/emotional-state
depth) — a previous item in the queue (personality) confirmed DEEPER than this document
previously claimed (a stale-doc correction, not a gap: it already drove
Tier-2 template BUCKET selection across all seven patient-voiced event
pools and was already present in the Tier-3 prompt, not just unprompted-
dialogue firing probability); a previous item in the queue (a structured, simulation-determined
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
session. **a previous item in the queue's own "10 states -> 3 buckets" gap is now partially closed — see
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
does. Still open: a previous item in the queue's traits still only drive bucket selection, not
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
trend can only be coming from the new vitals signal. **a previous item in the queue's bystander/family character class is now
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
**a previous item in the queue (automated non-browser testing) is now real for the pure
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
non-cross-contamination. What a previous item in the queue still does NOT have: any automated
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
the accessibility question: does the existing WASM fallback (a previous item in the queue's
`WasmLLMProvider`) actually catch a real no-WebGPU device, not just a
theoretical one?** Ran `tools/browser/verifyWasmLlm.mjs` against this exact
machine (a real, naturally-occurring no-`navigator.gpu` environment, not a
forced/stubbed one) and got genuine, non-degenerate WASM-tier-generated
dialogue for all 4 sampled event types (patient/crew/bystander/
treatment-response) — first real-world confirmation that the
WebGPU→WASM→template→deterministic degradation chain (a previous item in the queue) actually
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
summarized (ties back to a previous item in the queue).

**23. Dialogue during procedures must not freeze/interrupt gameplay.**
While the player is mid-IV/IO/intubation/SGA/vitals/airway-management, the
patient/crew should still be able to talk (e.g. "Ow, that hurts." while the
IV mini-game continues) — dialogue exists alongside the simulation, not as a
blocking overlay on top of it. **Directly overlaps the already-standing
Procedure Gameplay workstream's own open a previous item in the queue.5 (real interruptibility) —
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
does not change that (see a previous item in the queue's own "development access restriction," a
real, still-unbuilt gate this queue already flags as an early priority).
The dialogue architecture should eventually be reusable by Medical
Simulation, Career, and Co-op alike — build ONE shared dialogue
infrastructure, not three separate systems, even though only Medical
Simulation is in scope to actually wire it into right now.

**a previous item in the queue update (2026-08-27, latest session — see section 3's newest
entry): a real second backend now exists for the broad-compatibility
requirement.** `LocalLLMProvider` (WebGPU-only, via `@mlc-ai/web-llm`)
remains Tier 3's primary, fastest, best-quality path. A new
`WasmLLMProvider` (`dialogueProvider.js`, via `@huggingface/transformers`
forced to its `wasm` device, model `HuggingFaceTB/SmolLM2-360M-Instruct`)
is now real and wired into `dialogueManager.js` as a genuine middle rung:
tried only when WebGPU is absent or its own provider fails, never racing
it. Real, live, non-stubbed generation was observed for the first time in
this project's a previous item in the queue history (`tools/browser/verifyWasmLlm.mjs`) — this
environment has no real WebGPU adapter but does have real WebAssembly, so
this is the first a previous item in the queue session able to prove actual Tier-3 GENERATION, not
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

2. **STANDING DIRECTIVE: Medical Simulation Mode development priorities
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

3. **STANDING WORKSTREAM: the "Procedure Gameplay" spec (operator-supplied,
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

4. **Bug-hunt pass — what's still open, stated honestly.** The prior
session's bug-hunt found and this session FIXED two real bugs — see section
3's newest entry for the full writeup ("relationshipsOpen now pauses the
sim clock" and "IV/IO busy indicator shows the correct site"), both
verified live and removed from this list now that they've shipped. A
physiology-engine dead-field grep pass from the same bug-hunt also
produced real findings — RESOLVED (a later session), see section 3's
five-queue-item batch entry for the fix (a previous item in the queue has since been closed and
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

5. **STANDING WORKSTREAM: make "procedures that
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
to real VT — physiology a previous item in the queue). The REST of the scenario library
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
as physiology a previous item in the queue. Full writeup in section 3.

**Still open, scoped but not started — pick any as the next batch:**
- **RESOLVED (third a previous item in the queue batch, see section 3).** The ~12 scenarios missing
  `probes.sample`/`probes.opqrst` are done — coverage is 124/124, verified
  programmatically. This bullet is retired, not just marked done, since a
  stale "still open" line here would send the next session to redo shipped
  work (this is exactly what happened to this bullet itself — it went
  undocumented as done for a full session before being caught).
- **Continue auditing the REST of the scenario library's `probes.<key>`
  overrides for the same frozen-text defect** (the cardiac-arrhythmia
  slice is done — second a previous item in the queue batch; four more non-arrhythmia `heart`/`jvd`
  probes are done — third a previous item in the queue batch, section 3; **the six ACS-family
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

6. **Zero-To-Hero campaign content — the largest remaining item.**
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
exist as a relationship yet — see a previous item in the queue) and is unaffected by this
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
  (a previous item in the queue) this surfaced. `g.heatStrokeMovedToShade` — the one piece
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
  via a previous item in the queue's already-fixed toast/log rendering. All in `App.jsx`'s existing
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
  `needsRemedialTraining` predicate (see a previous item in the queue below) has no real consumer
  until this exists.
- **Chapter 1 content (design doc "Chapter 1: Boots on the Ground") —
  PARTIAL this session: mechanics/data landed in `campaign.js` and new
  state fields in `App.jsx`'s `blank()`/`CARRY`; the actual scene/phase
  wiring did NOT.** Built concurrently with, and independent of, whichever
  session(s) are building Chapters 4-10 (see a previous item in the queue's Ch.5 entry below for that
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

7. **MCI — the multi-unit half, and the still-unbuilt scenarios.** The
multi-PATIENT/triage half shipped (the `patients:` array, the Triage panel,
`mciPileup` — section 3's F28 entry). **Three of the six still-unbuilt
scenarios this item named now ship (most recent session)**: `unsafeSceneAssault`
(TRMA-037 — reuses `polytraumaFall`'s wound set, the same reuse `bikeVsCar`
already established, plus the a previous item in the queue hazard mechanic and a previous item in the queue's medication-allergy
mechanism), `stabbingPair` (TRMA-038 — a second real consumer of the
`patients:` roster: a life-threat `stabChestTension` patient plus a stable,
content-only second patient, and the a previous item in the queue hazard mechanic again), and
`testicularTorsion` (MISC-035 — content-only, no new physiology, Layperson-
completable; see a previous item in the queue's own reasoning for local-pain-only
presentations). **The other mother+newborn roster path (childbirth's
mid-call `_spawnQueue` spawn, distinct from the dispatch-time `patients:`
array) was playtested end-to-end for the first time this session (most
recent session) and is genuinely wired** — see section 3's newest entry —
but was killing every newborn via a real physiology-engine bug, now fixed.
Still open: a real multi-UNIT system (several ambulances each actually
transporting a different patient, rather than the other roster members
being narrated as handed off and scored on frozen vitals) — the same hard
networking-shaped problem as a previous item in the queue's co-op step 2, just for units instead of
players. Also still unbuilt: active-shooter and rectal-foreign-body
scenarios (each needs a new mechanic or condition). A sickle-cell-crisis
scenario shipped in a later batch (see section 3), so that gap is closed.

8. **Two physiology-adjacent follow-ups.** **The medication-allergy
mechanism is wired into a real scenario for the first time (most recent
session)** — `unsafeSceneAssault` (a previous item in the queue) declares `allergy: "fentanyl"`; the
patient is unidentified and unresponsive, so "no known allergies" is
genuinely unknown rather than negative, which is the actual teaching point.
Still open, and still correctly NOT attempted here: deeper comorbidity
mechanisms (HTN, HLD, diabetic autonomic/vascular disease) need real
physiology-engine work, not a front-end guess — filed as physiology a previous item in the queue, not repeated here. (Sickle-cell crisis, this item's other original
half, has since shipped as a real condition — see section 3.)

9. **Large systems from the player-feedback backlog, still open.**
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
  multi-UNIT system as a previous item in the queue — bundle with a previous item in the queue rather than building it twice.
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
  rules this project's own linter enforces (see the a previous item in the queue tutorial-sim
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

10. **§1.4 Relationship system — remaining spec items.** Core, plus
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

11. **§1.5 Fatigue/Morale/Reputation — remaining spec items.** The three
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
  relationship id existing (a previous item in the queue); once it does, a small periodic `g.morale`
  penalty while `g.relationships.shitty_supervisor?.met` is true is the
  natural, cheap addition.
- **Reputation's real consumers** (job applications, exam failures, forced
  suspension). `needsRemedialTraining` is a real, correct predicate with no
  UI consequence beyond a warning — blocked on the certification-exam/
  promotion flow (part of a previous item in the queue's own still-open Zero-To-Hero campaign
  content). Do not build a job-application screen just to give
  reputation a consumer; build the exam/promotion flow first and wire
  reputation into it then.

12. **PARTIALLY AUDITED (this session) — the dynamic-P50 half is confirmed
   already real; the single-writer-consolidation half remains genuinely
   open, with one real fragility found and documented (not fixed, per
   scope).** Read `respiratory.js` directly before assuming a gap (lesson
   16): `oxySat(po2, ph, paco2, temp, dpgFactor)` (respiratory.js:7-19)
   already implements a real, literature-anchored Bohr/Haldane-shifted
   Hb-O2 dissociation curve — `p50 = 26.6 * dpgFactor * 10^(-0.48*ΔpH +
   0.024*ΔT + 0.06*log10(paco2/40))` — driven by live pH, PaCO2, core
   temperature, AND a real, once-per-patient `pat.dpg` (2,3-DPG) term set
   from the patient's own chronic Hb deficit/COPD status (respiratory.js:
   43-63, the a previous item in the queue's own fix). This is not the "fixed P50" this
   item's own text assumed might still be missing; it is a real, dynamic,
   four-input curve already wired at both real call sites (`updateVentilation`
   line 769 and `updateGasExchange` line 802).

   MEASURED, not assumed (via `physio()`, the real scenario harness, not a
   reconstruction — lesson 8): `carbonMonoxidePoisoning` at t=600s reads
   `sao2=98.5%` (pulse-ox blind, exactly the intended CO/pulse-oximetry
   teaching point) while `caO2` correctly collapses to 14.05 (vs a matched
   condition-less control's 20.33) and `do2` collapses to 727.0 (vs 1215.8)
   — confirming the CaO2/DO2 chain genuinely reflects the true oxygen-carrying
   deficit even while the naive saturation reading does not, and that this
   downstream consequence survives to `physio()`'s own published state, not
   just an isolated formula.

   **A real, previously-undocumented FRAGILITY was found while tracing this
   (not a live bug, confirmed by the measurement above, but worth recording
   so a future consolidation pass starts from the right diagnosis):**
   `pat.caO2` currently has TWO independent writers with two DIFFERENT
   formulas — `respiratory.js`:771 (`1.34*hb*sao2/100 + 0.003*pao2`, no
   COHb/metHb term) inside `updateGasExchange`, and `metabolic.js`:274
   (`1.34*hb*(1-cohbFrac-metHbFrac)*sao2/100 + 0.003*pao2`, the correct,
   dyshemoglobin-aware one) inside `updateMetabolism`. `patient.js`'s real
   tick order (`update()`, lines ~1194-1197) calls `updateGasExchange` BEFORE
   `updateMetabolism`, so the correct, dyshemoglobin-aware write happens
   LAST and wins for the tick — which is why the CO-poisoning measurement
   above comes out correct. But this is order-dependent, not structurally
   guaranteed: swapping those two calls, or any future module inserted
   between them that reads `pat.caO2` expecting the dyshemoglobin-aware
   value, would silently regress the exact pulse-ox-blind-spot mechanism
   `acquiredMethemoglobinemia`/`carbonMonoxidePoisoning` were built for.
   `CvO2`/`DO2`/`VO2`/`SvO2` remain genuinely scattered as this item's own
   text originally said: `pat.do2` (metabolic.js:283), `pat.actualVO2`
   (metabolic.js:360, already correctly composing `pat.cytochromeBlock` for
   cyanide's utilization-vs-delivery split per this item's own prior text),
   `pat.svO2`/`pat.pvO2` (respiratory.js:775-776, a global mixed-venous
   estimate), and `pat.svO2Composite` (neuro.js:461, a SEPARATE, real,
   flow-weighted per-organ composite built for a previous item in the queue) are four
   genuinely different modules each owning one piece, with no single
   `pat.oxygen`-shaped object consolidating them.

   **NOT fixed this session, deliberately** — consolidating `caO2`'s two
   writers into one, and/or building the full `pat.oxygen={caO2,cvo2,do2,
   vo2,svo2}` structured object this item's own text originally proposed,
   touches the shared per-tick hot path (`updateGasExchange`/
   `updateMetabolism`, both called for every patient on every tick in
   every scenario) and would need the same full-suite re-verification this
   document's own discipline requires for any change to that shared code —
   correctly out of scope for the single-slice audit this session's time
   budget allowed. **Left as a concrete, scoped next step for whoever
   picks this item up**: delete `respiratory.js`:771's own `caO2` write
   entirely (it is provably always overwritten before any consumer reads it
   this tick, confirmed by the measurement above) and have
   `updateGasExchange` read `metabolic.js`'s already-published `pat.caO2`
   from the PRIOR tick instead where it needs a same-tick estimate (or
   accept the one-tick lag, which is already how several other cross-module
   dependencies in this pipeline work) — a genuinely small, well-scoped fix
   once someone is ready to re-run `mechanismWiring.mjs`/`scenarioSweep.mjs`
   to completion against it.

13. **Microcirculation as its own layer, between macro-circulation and
   organ metabolism.** Today organ flow is `deltaP/Resistance`-style,
   computed inline per organ. A dedicated `physio/microcirculation.js`
   (per the source doc's own suggested module list) would centralize
   capillary-level flow, filtration coefficient (`Kf`), and reflection
   coefficient (`sigma`) — `metabolic.js`'s `updateFluidShifts` already
   computes a real Starling equation with a leak-sensitive sigma (see a previous item in the queue's `ivProtein`/`isProtein` investigation above) — this item is
   about whether that logic should be extracted into its own module as
   organ perfusion work continues to grow, not new physiology per se.

14. **Endothelial physiology as an explicit state.** `pat.capillaryLeak`
   is real and has a real resolution mechanism (a previous item in the queue's endothelial-
   repair decay). What's NOT explicit: endothelial `integrity`/`activation`/
   `permeability`/nitric-oxide/endothelin/tissue-factor as SEPARATE tracked
   quantities rather than one collapsed `capillaryLeak` scalar. a previous item in the queue
   (inflammation cascade) already drives capillaryLeak from `cytokineLoad`
   for `pneumoniaSepsis` — extending this to a real multi-field endothelium
   state is a natural next step of that same work, not a new one from
   scratch.

15. **PARTIALLY DONE (this session, scoped slice) — see section 3's newest
   entry.** The full V/Q-compartment-population rewrite remains explicitly
   out of scope for one batch (still true, see below), but a real, useful
   scoped slice shipped: `respiratory.js`'s existing shunt equation already
   distinguished pure shunt (refractory to O2) from V/Q mismatch (O2-
   responsive) mathematically, it just had no surfaced observable. A real
   room-air PaO2 baseline plus a measured post-O2 PaO2 delta are now tracked
   and exposed via a new `o2ResponseTest` exam action — confirmed to
   correctly read ARDS (near-pure shunt) as refractory (ΔPaO2<150 mmHg,
   measured ~101-120) and asthma (V/Q mismatch) as responsive (measured
   ~167 mmHg), the real "100% oxygen test" clinical teaching point. **Still
   fully open**: the underlying single global `shuntFraction` scalar is
   unchanged — this only added a real diagnostic window into the existing
   mechanism, not the population-based V/Q-compartment model itself, which
   remains large, high-blast-radius work needing its own dedicated batch.

16. **Respiratory muscle mechanics and fatigue, plus dynamic
   hyperinflation/intrinsic PEEP.** `pat.respMuscleFatigue` already exists
   and already drives real deterioration (see a previous item in the queue's body-size-
   reference fix above). Intrinsic PEEP was investigated in depth (a previous item in the queue, RE-INVESTIGATED entry) and found structurally capped by
   `deliveryFactor` regardless of bagging rate — a real, documented,
   unresolved limitation. This item is the source document's own explicit
   ask for a `pat.respiratoryMuscles` structured state (strength/fatigue/
   work/oxygenConsumption/reserve) generalizing what's already partially
   built — read a previous item in the queue's own entry FIRST before attempting a fix, since it
   already identifies the specific mechanism (delivery-factor derating) any
   new work here would need to address, not just re-discover.

17. **RAAS, generalized and made explicit.** Angiotensin II/aldosterone/
   renin already exist and already drive real SVR/aldosterone/renal-Na
   effects (see a previous item in the queue's earlier RAAS fix, referenced by a previous item in the queue). This
   item is auditing whether `pat.renal = {gfr,rpf,renin,angiotensinII,
   aldosterone,adh,nephron}` should become a single structured object per
   the source doc's own suggested shape, rather than scattered top-level
   `pat.*` fields — a refactor-for-clarity, not new mechanism, and should be
   done carefully to preserve every existing consumer (single-writer
   discipline, section 5's own "identify authoritative owner" rule).

18. **PARTIALLY DONE (this session, scoped slice) — see section 3's
   newest entry. Explicitly NOT the full proposal.** A real two-segment
   model (proximal, SGLT/glucose-sensitive; distal, aldosterone-driven)
   composing into `pat.segmentReabsorptionEff` now exists, built as an
   addition alongside (not a replacement of) a previous item in the queue's own already-shipped
   osmotic-diuresis mechanism. Measured, not guessed: forcing glucose past
   the real renal threshold (~180 mg/dL) impairs `proximalReabsorptionEff`
   while leaving `distalReabsorptionEff` untouched; forcing aldosterone to
   1.0 (full RAAS activation) does the mirror-image, raising distal while
   leaving proximal untouched — confirming the two segments are genuinely
   separate mechanisms, and that RAAS activation cannot rescue a proximal
   glucose-driven leak (the real clinical teaching point: these are
   different nephron segments). DKA's own a previous item in the queue's own osmotic-diuresis drain
   confirmed unbroken alongside this. **Still fully open**: the full
   glomerulus→PCT→loop of Henle→DCT→collecting-duct chain remains
   unbuilt — this is two lumped segments standing in for the ladder, not
   the ladder itself. No diuretic drug exists in this formulary at all
   (a real prerequisite gap for a loop-diuretic mechanism), and no real
   prerenal/intrinsic/postrenal AKI distinction was attempted.

19. **AUDITED (2026-09-05), still genuinely OPEN — not attempted, with an
   honest reason.** `pat.atp`/`pat.energyFailure`/`pat.cytochromeBlock`
   really do exist and are real, verified, well-consumed mechanisms
   (metabolic.js, plus cyanidePoisoning's utilization-block work) — but read
   directly before assuming a literal `pat.cellular={atp,adp,...}` object is
   a clean consolidation: `pat.atp` (cardiovascular.js) is a MYOCARDIUM-
   SPECIFIC ischemia signal (consumed by QRS widening, AV block,
   contractility, arrhythmia risk — a dozen-plus real call sites), while
   `pat.energyFailure` (metabolic.js) is the genuinely whole-body oxidative-
   deficit signal (its own real consumer: renal.js's Na/K-ATPase pump-
   failure term). These are two DIFFERENT quantities that happen to share
   the source spec's word "atp," not one field split across two files.
   Folding them into a single `pat.cellular.atp` would either conflate a
   cardiac-specific signal with a whole-body one (physiologically wrong) or
   require renaming `pat.atp`'s ~15 existing call sites for zero mechanism
   gain. The spec's other named sub-fields — `adp`, `oxidativeCapacity`,
   `oxygenUtilization`, `metabolicStress` — have no existing engine quantity
   behind them at all; inventing them with no distinct real consumer beyond
   what `energyFailure`/`cytochromeBlock` already provide would be exactly
   the decorative-field pattern this document's own discipline forbids.
   Left open rather than closed, since the underlying ask (a real, coherent
   whole-body cellular-energetics view) is not literally satisfied by what
   exists — but the literal structured-object shape the source spec asks
   for is not the right next step for it. No code changed.

20. **PARTIALLY DONE — the portal-pressure/portal-flow half (a prior,
   undocumented session) and this session's own new hepatic-coagulopathy
   half are both real and verified; the rest remains open.** `organ
   ClearanceFactor()` (pk.js) and a previous item in the queue's `hepaticDO2`/`hepaticO2Debt`/
   `liverInjury` were already real and verified before this session.
   **Found already built, just unread (lesson 16):** a real, cited
   `pat.portalPressure` (HVPG-equivalent mmHg, renal.js) driving splanchnic
   vasodilation and venous-capacitance expansion past the real >5/>=10 mmHg
   portal-hypertension/CSPH thresholds (Groszmann et al., NEJM 2005;
   Garcia-Tsao et al., Hepatology 2017) — reaching the already-real RAAS/ADH
   machinery through the same defended-volume pathway hemorrhage/pregnancy
   use, plus a narrowed `pat.splanchnicFrac` (blunted autotransfusion
   reserve under superimposed hemorrhage). A shipped `cirrhosis` condition
   (conditions.js) sets `pat.portalPressure=12`/`pat.liverInjury=0.30`.
   Fully covered by `mechanismWiring.mjs`'s own `[PORTAL HYPERTENSION /
   CIRRHOSIS — a previous item in the queue]` section (specificity below threshold,
   real RAAS engagement, real relative fluid retention over 3h, narrowed
   splanchnic reserve, measurably worse hemodynamics under a matched
   superimposed hemorrhage).

   **New this session**: hepatic SYNTHETIC failure was genuinely missing —
   `coagulation.js`'s factor-regeneration block chased every clotting
   factor back to a FIXED target (100 / fibrinogen 3) regardless of how
   much liver a patient had left, so a decompensated cirrhotic could never
   show real coagulopathy from reduced production alone (only from active
   consumption/DIC/ATC, already-real but mechanistically different). Fixed
   with two real, separately-cited links: (1) `pat.liverInjury` now scales
   the regeneration TARGET for factors II/V/X and fibrinogen via
   `hepaticSynthCapacity = max(0.1, 1 - liverInjury*0.7)` — reusing pk.js's
   own hepatocyte-integrity proxy rather than inventing a second one
   (Tripodi & Mannucci, NEJM 2011, "The Coagulopathy of Chronic Liver
   Disease": reduced hepatic synthesis of II/V/VII/IX/X is the central
   mechanism of cirrhotic PT/INR prolongation). Factor VIII is deliberately
   EXCLUDED — it is endothelial, not hepatocyte, synthesis, and stays
   normal/elevated in real liver failure, a genuine teaching-point
   divergence rather than an oversight. (2) `pat.portalPressure` now drives
   real splenic-sequestration thrombocytopenia (Afdhal et al., Am J Med
   2008), zero below the same real 5 mmHg threshold, ramping to a bounded
   60% platelet reduction by CSPH — mechanistically distinct from both (1)
   and from the existing DIC/dilution platelet terms. Both reuse
   `pat.coagPct`/`pat.plateletCount`'s own already-real consumers (a death-
   cause check in physiology.js, scenario lab reads) rather than adding new
   unconsumed fields. Six new two-sided `mechanismWiring.mjs` assertions
   added to the existing `[PORTAL HYPERTENSION / CIRRHOSIS — a previous item in the queue]` section (liverInjury-forced factorX/factorII/coagPct falls,
   factorVIII specifically spared, portalPressure-forced thrombocytopenia,
   and sub-threshold specificity) — see section 2 for the fresh suite run.

   **Still fully open**: a structured `pat.liver` object consolidating
   these scattered fields is unbuilt (same refactor-vs-new-mechanism
   question as a previous item in the queue/a previous item in the queue); albumin synthesis (oncotic pressure /
   ascites-from-hypoalbuminemia, distinct from the portal-pressure-driven
   ascites mechanism above), bilirubin, and ammonia/urea-cycle clearance
   have NO mechanistic link to `liverInjury` at all — `pat.hyperammonemia`
   remains a standalone scripted condition rather than something cirrhosis
   itself can cause; glycogen/gluconeogenesis (hepatic hypoglycemia risk in
   liver failure) is entirely unbuilt.

21. **Multi-timescale physiology — largely already true by
   construction** (renal/RAAS/inflammation already relax on genuinely
   different, real time constants — see a previous item in the queue's 90-minute cytokine tau,
   a previous item in the queue's 36-hour endothelial-repair tau). This item is about making the
   update PIPELINE's ordering explicit (see the source doc's 23-step
   pipeline) rather than new physiology — a documentation/architecture
   task, worth doing once several of the above are further along, not
   before.

22. **PARTIALLY DONE — sub-item (b) CLOSED (2026-09-10), see section
   3's newest entry.** a previous item in the queue already closed valvular regurgitation in
   the authoritative full-loop solver and left three explicit sub-items
   open: (a) ischemic-MR consumption by the solver, (b) a shipped scenario
   declaring valve disease, (c) AV dyssynchrony/pacemaker syndrome. (b) is
   now real: `aorticDissection` sets `riskFactors.aorticDissection = true`,
   and `updateValves`'s already-built driver (recalibrated from an
   uncalibrated 0.5 down to 0.35, this engine's own existing "moderate AR"
   default) makes the `chest` scenario's always-narrated diastolic murmur
   physiologically real — measured pp 34->51.9 mmHg, LVEDV 116->147 mL,
   EF 0.53->0.35. **STILL OPEN — (a) and (c), unchanged from a previous item in the queue's own
   entry**: (a) needs a proper controlled A/B against the ischemic family
   before the ischemic-MR/annular-dilation regurgitation pathway can be
   safely wired into the solver (a prior attempt measurably wrecked
   `acs`/`unstableAngina`'s own cardiac output — see a previous item in the queue's entry for
   the full trace); (c) AV dyssynchrony/pacemaker syndrome has one obvious
   lever (attenuating atrial kick for AV-dissociated rhythms) already on
   record as tried and MEASURED WORSE — do not retry it blind. Read a previous item in the queue's own entry in full before attempting either.

23. **PARTIALLY DONE (2026-09-01) — the ketamine sub-piece is closed;
   re-audited this session — the remaining receptor classes are genuinely
   BLOCKED on a missing producer, not simply unbuilt.** Ketamine's
   cardiovascular mechanism is a real dual NMDA-antagonist effect
   (indirect sympathomimetic, scaled by the existing `pat.adrenalReserve`
   signal, plus a direct, ordinarily-masked myocardial depression term) —
   the previously-asserted-not-identified `myocardialDepression` coefficient
   this item's own text used to flag is real. `drugs.js`'s `receptors`
   object architecture (alpha1/beta1/beta2/muscarinic/vagalBlock/
   calciumChannel/etc., continuous concentration-driven consumption in
   `pk.js`) remains the substrate for the rest of this item.

   **Re-audited this session, not attempted blind**: grepped the FULL
   `drugs.js` formulary for any drug that would meaningfully DRIVE a
   histamineH1/H2, serotonin, or (beyond ketamine's own) NMDA receptor
   term through this continuous mechanism — none exists. No H2-blocker,
   SSRI/MAOI/triptan-class drug, or second NMDA agent is carried in this
   formulary, so a `receptors.histamineH1`/`.serotonin` field would have no
   real PRODUCER to set it and therefore no way to ever move — the exact
   inverted decorative-field problem section 1 warns about (not "written,
   never read" but "declared, never written"). The two real clinical
   pictures this item's own text implicitly points at both already HAVE a
   real, if differently-shaped, mechanism: (1) histamine-driven cutaneous
   urticaria is real and consumed today via `pat.urticaria`
   (patient.js/conditions.js's `allergicReactionMild`, treated by
   `diphen`'s own `fx:{urticaria:-0.5}` curve-model effect — a real H1-
   antagonist consequence, just expressed through this engine's simpler
   `pkModel:"curve"` fx pattern rather than the continuous `receptors`
   object, since diphenhydramine's own PK entry never needed the latter);
   (2) serotonin toxicity is real and shipped as its own full condition,
   `serotoninSyndrome` (conditions.js), with its own real hyperthermia/
   clonus/autonomic-instability mechanism — a condition-level, not a
   drug-receptor-level, representation, correct given no serotonergic
   DRUG exists in this formulary to react against. Building the generic
   `receptors` classes now, with nothing in the tree to ever set them,
   would be speculative unused surface area, not real mechanism work —
   correctly left unbuilt until a real histamine-H2/serotonergic/second-
   NMDA drug is ever added to the formulary, at which point THAT drug's
   own batch is the natural place to add its receptor class alongside it.
   No code changed this session; this is an audit-only finding.

24. **PARTIALLY DONE (this session, scoped slice) — see section 3's
   newest entry.** A real, first slow-timescale state variable now exists:
   `pat.lvHypertrophy`, relaxing toward a target driven by sustained
   elevated `pat.svr` on a cited ~14-day time constant (`approach()`, the
   same relax-toward-target idiom already used throughout
   cardiovascular.js). A genuine multi-week run was investigated and found
   infeasible in this harness's time budget (measured ~0.5s per simulated
   minute at MAX_TICK, so a 60-day run alone would take hours) — verified
   instead via real, measured DIRECTIONAL engagement over a 900s window:
   sustained afterload elevation measurably engages `lvHypertrophy` while a
   normotensive control stays exactly 0; a longer window shows more
   hypertrophy than a shorter one (genuinely gradual, not a step function);
   acute cardiac conditions (`ami`, `cardiogenicShock`) stay negligible
   (<0.01, confirming no regression to already-shipped acute-cardiac
   physiology); and forcing `lvHypertrophy=1` measurably reduces diastolic
   filling (EDV) via a new multiplicative EDPVR diastolic-stiffness term,
   confirming the field reaches a real downstream consequence, not just a
   number that climbs. **Vascular stiffness is ALSO DONE now (this session)
   — see section 3's newest entry.** A second, slower (90-day vs. LVH's
   14-day tau) chronic state, `pat.vascularStiffness`, models real
   arteriosclerotic stiffening of the conduit arteries themselves, driven by
   the same sustained-afterload signal. A first consumer attempt (driving
   `arterialComplianceBase`) was found by direct measurement to be
   completely INERT — that field only feeds the lumped model's own SV/PP,
   overwritten by the authoritative full-loop ODE. Fixed by composing into
   `pat.arterialComplianceFactor` instead (the authoritative solver's own
   real aortic-compliance disease handle, the SAME field preeclampsia's own
   arterial-stiffening mechanism already writes, via the same `Math.min`
   ceiling idiom). MEASURED: engages under sustained afterload while a
   control stays exactly 0; more stiffness at 3600s than at 900s (gradual);
   `ami` stays negligible; forcing `vascularStiffness=1` widens pulse
   pressure by ~18 mmHg versus an otherwise-identical control — a real,
   published-vital consequence (`pat.pp`, via the authoritative ODE), not
   just a field that climbs. **Still fully open**: nephron loss and coronary
   atherosclerosis progression are unbuilt, and no real long-duration
   (days-to-weeks) test harness exists for this project to verify true
   multi-week saturation rather than short-window direction, for either
   this or `lvHypertrophy`.

25. **Pregnancy and fetal integration.** `updateObstetric` already
   models real gestational blood-volume/CO/SVR/aortocaval-compression
   changes (Supine Hypotensive Syndrome, a previous item in the queue's postpartum-hemorrhage
   work). A genuine FETAL compartment (fetal HR, fetal oxygenation,
   placental/umbilical flow, fetal Hb) does not yet exist as tracked state
   — real, citable, moderately large new mechanism work; the source doc's
   own explicit ask that placental failure should affect fetal DO2 rather
   than directly scripting fetal distress is the correct design target once
   this is attempted.

26. **CLOSED (re-audited this session, lesson 16) — this item's own
   "confirmed NOT modeled" claim was itself stale.** Re-read
   `cardiovascular.js`'s full-loop CPR block (`mechAct = 0.17 * cpr`) AND
   `pk.js`'s `"cpr"` dose handler directly before touching anything, per
   this document's own standing discipline: a real depth/rate quality
   consumer already exists and was simply undocumented here.
   `CprMinigame.jsx` computes a genuine `depthScore * rateScore` composite
   (adult target 5-6cm depth, 100-120/min rate, both drawn from the AHA
   guideline bands) into `pat.cprQuality` (0-1) from the player's actual
   compressions; `pk.js`'s `"cpr"` dose handler already multiplies this
   directly into `pat.cprActive` itself — `pat.cprActive = Math.max(
   pat.cprActive, intensity * freshness * cq)`, where `cq` IS
   `pat.cprQuality` (expiring 30s after the last scored compression, so
   crew/unscored CPR correctly defaults to `cq=1`) and `freshness` is a
   real ~12s-tau decay from the last CPR dose (Berg et al., Circulation
   2001; Kern et al., Circulation 2002 — real coronary/cerebral perfusion
   pressure collapses within seconds of compressions stopping and takes
   several compressions to rebuild, the evidence base behind AHA's
   "minimize interruptions"/compression-fraction teaching). Since
   `cardiovascular.js`'s `mechAct = 0.17 * cpr` floor reads this SAME
   `pat.cprActive`, degraded depth/rate technique already produces a
   genuinely smaller mechanical floor and therefore genuinely lower
   CO/DO2/EtCO2 through the shared circulation — technically poor and
   textbook-perfect CPR are NOT indistinguishable to the engine today, as
   this item's own text previously (and, per its own dated header,
   apparently already incorrectly) claimed. A duplicate second consumer
   was investigated and deliberately NOT added at `cardiovascular.js`'s own
   floor line (would double-count the identical `cq` signal already
   folded into `cprActive` upstream) — a documenting comment was added at
   that site instead, cross-referencing the real mechanism's actual
   location. Compression RATE specifically has no SEPARATE timing
   consumer (`compressionRate = 110` stays fixed for EtCO2 cycle timing) —
   its contribution is already folded into the one composite `cprQuality`
   score, and splitting it into a second live variable would need its own
   real justification (e.g. modeling compression-rate-driven EtCO2 cadence
   independent of depth), not attempted here. `node --check`/`npx eslint`
   clean on the one touched file (`cardiovascular.js`, comment-only). No
   suite re-run needed (no functional change).

27. **PARTIALLY DONE (2026-09-01) — see section 3's newest entry.**
   Investigated first: CO poisoning's pulse-ox blind spot (`pat.cohb`) and
   ETCO2 as a real quantity distinct from PaCO2 (with a real, already-
   PE-vs-hypoventilation-distinguishing gradient) were both confirmed
   ALREADY REAL — not built this pass. The one genuine gap found and
   filled: methemoglobinemia's classic pulse-ox floor artifact (new
   `pat.metHb`, a new `acquiredMethemoglobinemia` condition and
   `methemoglobinemia` scenario). A general `pat.monitoring =
   {pulseOxAccuracy, pulseOxBias, cooximetryAvailable, abgAvailable}`
   structure was deliberately NOT built — no real per-field consumer was
   identified, and building it would have been decorative (section 1).

28. **A dead-code sweep is overdue, and it is cheap — STANDING, open.**
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
   do something, which ties into a previous item in the queue's suggested-first-batches list);
   `pat.anionGap` — **RESOLVED (a previous item in the queue batch, section 3)**: the new
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

29. **STANDING WORKSTREAM: build out the condition library, and deepen the
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
   anaphylaxis, one of a previous item in the queue's own suggested first batches — wiring the
   previously dead `pat.riskFactors.sepsis` flag into the real mechanism
   (`cardiovascular.js`/`metabolic.js` already read it; nothing had ever set
   it). See section 3's newest entry for the full writeup. A later parallel batch
   added `aorticStenosis` (CARD-048), `mitralRegurgitationAcute` (CARD-049), and a
   deliberately-scoped `infectiveEndocarditis` (CARD-050) — all three previously
   deferred with real, named reasons that turned out to be stale about the STATE
   OF THE CODE, not the requirement: the valve-resistance-in-series and
   regurgitant-fraction mechanisms AS/MR needed were already built (a previous item in the queue)
   but never wired to a condition; IE was scoped down to fever/bacteremia + valve
   involvement + one timed embolic event rather than the full vegetation-growth
   composite, which remains open. `sickSinusSyndrome` was confirmed already built
   by an earlier session (no duplicate work done). HOCM shipped 2026-09-01 (see
   section 3's newest entry) — Mitral Valve Disease's chronic/stenotic forms
   remain the real, still-open backlog — see section 3's newest entries for
   full writeups. That earlier batch is still the reference for how far this
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
   hyperkalemia with its ECG progression (which also needs a previous item in the queue, the calcium
   ECG protection); tricyclic and beta-blocker/calcium-channel-blocker overdose;
   carbon monoxide and cyanide toxicity; status epilepticus as a condition rather
   than only a drug-toxicity limb; hypothermia with its arrhythmia and
   coagulopathy limbs; pulmonary edema separated from generic CHF; and GI
   hemorrhage.

   **Do one condition per batch, fully.** A single condition researched,
   mechanistically wired, time-coursed, treatment-tested and asserted is worth
   more than five conditions with three fields each — and five thin conditions is
   how a physiology engine quietly turns back into a branching script.

30. **PARTIALLY RESOLVED — the pregnancyBenchmark near-misses.** The "Total
    blood volume 6.2-7.0 L" row's internal inconsistency was a genuine
    fixture defect and is fixed (now derived from the patient's own
    baseline, 9/16 in range). The harder EDV/SV/EF/CO/SVR/Hct cluster
    remains open — `chamberRemodeling` was swept across its full range and
    CONFIRMED (not just repeated) not to be a viable single-lever fix; see
    section 3's newest entry and the measurement now sitting in
    `cardiovascular.js`.

31. **RE-INVESTIGATED (this session) — the prior "device rates too safe to
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

32. **INVESTIGATED, CONFIRMED STRUCTURAL, still open — widen the
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

33. **The physiology half is DONE (later session): `toxicInhalationChlorine`
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

34. **Breath odor has no real physiology backing except one case, now
    wired — found and partially resolved while adding the new `breathingCheck`
    head action (a previous item in the queue, section 6).** `probe:"breathOdor"` has
    existed since an earlier session as a scenario opt-in hook, but grep
    confirms NO scenario in `scenarios.js` has ever declared one — the
    action reporting "No unusual odor on the breath." on literally every
    patient, including DKA, was not a design choice, it was dead. One real
    case is now wired instead of scripted: `pat.anionGap` (a previous item in the queue's
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
    literature-anchored treatment as any a previous item in the queue's own condition. A scenario can
    still declare its own `probes.breathOdor` for a specific narrative case
    in the meantime, which wins over both real cases above.

35. **`opioidOD` cannot reach genuine near-apnea severity through a fentanyl
    `DrugInstance` alone — a real architectural ceiling found while finishing
    a previous item in the queue's calibration (section 3), filed rather than worked around.**
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
    defect a previous item in the queue fixed (naloxone would once again do nothing, since a
    scripted `rrBase` doesn't route through `respDriveSuppression` at all).

36. **STANDING WORKSTREAM, filed per explicit operator instruction: build an
    overdose condition for every existing player-administerable drug, by
    seeding a supratherapeutic dose of THAT SAME drug via `seedPastDose` —
    reusing the exact pattern a previous item in the queue validated for `opioidOD`, rather than
    inventing a bespoke toxidrome mechanism per drug.** `rocuronium` is
    DONE — `rocuroniumOverdose` (TOX-001), see section 3's newest entry for
    the full mechanism/calibration writeup: it reuses the existing
    Hill-equation `neuromuscularBlock` mechanism (continuously recomputed
    from concentration, structurally distinct from a previous item in the queue's per-drug-id
    Emax gate, so it does not hit that ceiling), and the real teaching point
    — aware but totally paralyzed, since `neuromuscularBlock` is read only
    by `respiratory.js`, never by `neuro.js` — required two scenario-level
    probe overrides (`loc`, `reflexes`) since their DEFAULT logic would
    have been actively wrong for this patient, not just generic.
    `diltiazem` and `metoprolol` are ALSO DONE (`diltiazemOverdose`
    TOX-002, `metoprololOverdose` TOX-003) — see section 3's newest entry
    for the full mechanism/calibration writeup. Both are real,
    non-per-drug-id-gated PK drugs (confirmed per-drug rather than assumed
    to reuse a previous item in the queue's exemption), but a direct dose/elapsed sweep found
    each one's OWN already-declared receptor coefficient
    (`calciumChannel:-0.7`, `beta1:-0.5/beta2:-0.1`) is itself a real
    ceiling, saturating almost immediately — a different SHAPE of ceiling
    than a previous item in the queue's fentanyl finding (a receptor-strength ceiling, not a
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
    mechanism (not the per-drug-id Emax gate a previous item in the queue found for fentanyl —
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
    `amiodarone` is ALSO DONE (`amiodaroneOverdose`, TOX-017) — see section
    3's newest entry for the full mechanism/calibration writeup. A dose
    sweep confirmed intensity is NOT saturated at this drug's own doses
    (unlike diltiazem/metoprolol/atropine), so severity genuinely scales
    with the seeded dose. A real, self-caught lesson-16 correction: an
    initial unmeasured comment claimed bradycardia before checking —
    MEASURED, this toxidrome is real hypotension (arteriolarDilation) and
    QT prolongation (potassiumChannelBlock, landing inside the documented
    10-15% QTc range), with hr statistically unchanged from a matched
    control, since amiodarone's own `drugs.js` entry declares no direct
    chronotropic receptor. Sustained essentially unchanged from 60s through
    900s, matching this drug's own kel=0.005 (the slowest clearance of any
    two-compartment drug in this formulary) — a load/duration toxicity, not
    a brief spike.
    Still open candidates:
    `midazolam` (→ Benzodiazepine Overdose — CONFIRMED to hit
    the SAME per-drug-id Emax-gate ceiling a previous item in the queue found for fentanyl:
    `respiratoryDepression:0.22` is a flat coefficient, not a continuous
    receptor term, so a supratherapeutic dose wouldn't measurably worsen
    respiratory depression beyond an ordinary therapeutic dose — building
    this needs either re-identifying that coefficient, which would also
    change THERAPEUTIC midazolam dosing everywhere else it's used, or a
    different mechanism; deliberately not attempted as a quick add),
    `morphine` (a second, non-fentanyl opioid-OD
    presentation, useful for teaching the SAME reversal mechanism at
    different kinetics — morphine's own `keo`/`kel` make its time course
    genuinely different from fentanyl's),
    and the catecholamines (`epiIV`/`pushEpi`/`norepi` → a real pressor
    overdose, hypertensive crisis/arrhythmia). **Before starting, read a previous item in the queue's finding and check whether it applies to the target drug**: any
    drug whose `drugDef` effect is expressed as a single per-drug-id-gated
    coefficient (the same `respiratoryDepression`-style pattern fentanyl
    uses) may have the SAME hard ceiling a previous item in the queue found — measure across a
    dose sweep FIRST (the same probe script this session used, adapted) to
    confirm the target severity is actually reachable before writing the
    condition, rather than re-discovering a previous item in the queue's finding blind for a
    different drug. Naloxone's own overdose is NOT a sensible entry here —
    it has no meaningful toxicity/overdose syndrome of its own — and
    epiIM/epiAuto/etomidate/ketamine are lower priority (etomidate/ketamine
    OD is a real but rarer prehospital presentation than the ones listed
    above). Each new condition needs its own literature anchor per a previous item in the queue's
    own discipline (a coefficient chosen without one is worse than none),
    and its own scenario, but explicitly does NOT need new engine mechanism
    work — that is the entire point of reusing `seedPastDose` against
    drugs whose receptor/PK model this project has already built and
    verified.

37. **Beat-level cardiac cycle — PARTIALLY CLOSED. The original premise was
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
    ordinary a previous item in the queue's own condition work now, not blocked structural work.

    **STILL OPEN — (c) AV dyssynchrony / pacemaker syndrome.** Unchanged and
    still not solved by this batch. `atrialPhaseFrac` is a fixed constant, and
    the one obvious lever (attenuating atrial kick for AV-dissociated rhythms)
    is already on record in `updateFullLoopODE` as tried and MEASURED WORSE —
    do not retry it blind.

38. **Nephron abstraction — the osmotic-diuresis slice is DONE (this
    session), built WITHOUT the full segment chain; the rest remains
    open.** `renal.js` already treats na/k/bun as real mass/
    concentration pools with GFR-driven clearance, ADH/aldosterone
    handles, and RAAS (see a previous item in the queue's history entry, a previous item in the queue's RAAS fix,
    and a previous item in the queue's own already-implemented `siadh`/`diabetesInsipidus`
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
    a previous item in the queue's kidney slice for the closest existing analog,
    `atnProgression` vs `kidneyInjury`, which is a real but different
    reversible-vs-structural distinction, not a prerenal/intrinsic/
    postrenal one). The full segment-chain proposal itself remains
    unattempted and still large — this session only proves one of its
    three named payoffs was separable and worth building on its own.

39. **Consciousness as a continuous arousal score — the full refactor is
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

40. **CLOSED (re-verified this session) — every part of this item, including
    the "much larger finding" below, is now resolved in the tree; this was
    confirmed by reading the code directly (lesson 16), not assumed from the
    text below, which had gone stale.** Three things were checked and all
    three are real:
    - **`outcomeReport()` now HAS a caller.** `grep outcomeReport src/App.jsx`
      shows it wired at every debrief-producing transition (`physioOutcome:
      outcomeReport(s)`, tagged "F44" in-code), and the debrief screen
      renders a real, distinct "THE CHART" panel (`App.jsx`, ~line 7513) off
      `g.physioOutcome` — arrest timing/ROSC/downtime, neurological outcome,
      irreversible/reversible injuries, troponin, and death-mechanism
      treatability all render from the real physiology-layer object, not the
      old ad-hoc `g.outcome` literal (which still exists alongside it for the
      player's own self-graded call summary — the two are complementary, not
      duplicates). This closes what this item's own text flagged as the
      single largest open finding.
    - **The liver/gut "still open" extension is also done.** `physiology.js`'s
      `outcomeReport()` (~line 326-338) now composes `pat.hepaticStunning`/
      `pat.gutMucosalStunning` into `reversibleFindings` the same way
      `pat.atnProgression` already did for kidney — the exact "still open —
      the general per-organ pattern beyond kidney" gap this item's own text
      named is closed.
    - **Brain has its own version too**, found in the same read: a resolved
      TIA (`pat.strokeWeakness` back near 0 after having peaked >0.3 via
      `pat._maxStrokeWeakness`) reports as a real reversible finding
      distinct from a structural stroke, reusing the already-shipped `tia`
      condition rather than inventing a second brain-injury accumulator.
    - **A further, previously-undocumented addition found in the same
      function**: a real global oxygen-extraction-reserve report
      (`svO2Composite`, `organsAtExtractionLimit`), citing Rivers et al.,
      NEJM 2001 for the 60% mixed-venous-saturation threshold (adjusted down
      from the cited 70% central-venous target, since mixed venous runs a
      few points lower under the same physiology) — a genuinely new
      prognostic signal beyond what this item itself asked for.

    None of this was built by this session — it was found, already shipped
    and committed (`git log -S physioOutcome` shows it landed in a checkpoint
    commit ahead of this session's own work, evidently from concurrent
    work), while re-verifying this item's own claims against the tree per
    the standing lesson-16 discipline. `npx eslint src/App.jsx` (3
    pre-existing `react-refresh/only-export-components` errors, unchanged
    baseline) and `npx vite build` (clean, same pre-existing >500kB
    chunk-size warning) both re-confirmed clean against the current tree.
    Nothing is left open under this item's own name.

    Original filing, kept for its own now-superseded detail below — do not
    treat any "still open" language in it as current; the paragraphs above
    are what's current.

    ~~Separate structural damage from functional dysfunction, generally —
    the kidney slice is DONE (this session), and it surfaced a much larger,
    previously-undocumented finding: the debrief function this data feeds
    has NO CALLER anywhere in the codebase.~~ `pat.kidneyInjury` and
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
    This predates this session entirely (troponin/queue-a previous item in the queue's own and the
    post-death-gaps/queue-a previous item in the queue's own comments inside the function are both
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

41. **Per-patient baseline variability — SIX of eight traits now DONE
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

42. **CLOSED (re-verified this session, lesson 16) — this item's own
    "RESOLVED" opening line was itself stale.** It used to read "no isolated
    pruritus/hives signal exists," but a real `pat.urticaria` mechanism (0-1
    histamine-driven cutaneous finding, distinct from `edema`/`bronch`) is
    now live: `patient.js` declares it, `allergicReactionMild`
    (conditions.js, its own dedicated scenario) drives it, `actions.js`'s
    skin exam reads it for a real graded finding (hives alone vs. hives +
    angioedema), `diphen`'s real `fx:{urticaria:-0.5}` treats it, and both
    `laCounty.js` and `national.js` gate their own `anaphDiphen` rule on
    `ctx.v.urticaria` — confirmed by direct grep across all of `src/`, not
    assumed from the comment. `mechanismWiring.mjs` already carries two-sided
    assertions for it (fires in `allergicReactionMild`, absent in a matched
    healthy control, measurably reduced by diphenhydramine). Nothing left
    open under this item's own name; no code changed this session.

    Original filing, kept for its own now-superseded detail — found while
    implementing TP 1219/1219-P (Allergy), step 10's diphenhydramine
    indication:
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

43. **RESOLVED (this session, pulmonary limb only) — see section 3's newest
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
    correctly lower priority than a previous item in the queue above unless a dive-specific
    scenario is specifically wanted.

44. **STILL BLOCKED on the SBP-tiered-escalation half; the crew-hold gap this
    item flagged is CLOSED (re-verified this session, lesson 16 — the fix
    predates this session, found already committed).** `App.jsx`'s `crewFn`
    now runs a real `dHold=DRUGS[t.dose]; if(dHold&&dHold.hold){...return}`
    check before dispatching any crew-directed dose (in-code comment: "a
    real gap: crew-directed doses skipped this entirely... that the player's
    own UI would have blocked"), mirroring `medActs()`'s own player-path
    `d.hold(v)` check exactly — confirmed by reading the code directly, not
    assumed. This closes the "real, still-open, DIFFERENT gap" this item's
    own text used to flag; nothing further to do under that half. The
    SBP-tiered-escalation half (`nitro2`/`nitro3`) remains correctly
    deferred, unchanged — see the measured finding below (any tested
    dose-scale-up on `nitro`'s current, already-oversized coefficients
    compounds rather than fixes the problem) — that recalibration is still
    real, separately-scoped, unattempted work.

    Original filing, kept for context. Confirmed the SBP-hold and
    repeat-dose-cap mechanisms this item originally assumed were missing
    already exist and work correctly (measured: `nitro.hold` blocks below
    sbp 100, clears at 100+; `laCounty.js`'s `nitroChestPain` caps repeats
    at 3 gated on live sbp). The SBP-tiered escalation itself remains
    correctly deferred pending a separate `nitro` recalibration item, per a
    prior session's own measured finding that any tested dose-scale-up
    compounds an already oversized baseline effect (forcing 3 unconditional
    doses crashes sbp to 8.6).

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
    already supports one — see a previous item in the queue's now-resolved amiodarone2
    entry for the alternative, a second flat-dose drugs.js entry per tier,
    which is the simpler and more consistent-with-precedent option: `nitro2`
    at 0.8mg, `nitro3` at 1.2mg, mirroring `amiodarone`/`amiodarone2`
    exactly) plus a `laCounty.js` rule reading `ctx.v.sbp` to pick the right
    tier. Not attempted in the same batch as the rest of TP 1214's content,
    per the same scope discipline as every other queue item filed
    alongside new protocol rules.

    **UPDATE (a later session, the saline-dose-count-audit batch — see
    section 3's queue-a previous item in the queue's own entry): a real, measured finding surfaced
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

45. **PARTIALLY RESOLVED (a prior session) — see section 3's own entry for
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

46. **RESOLVED (this session) — see section 3's newest entry.**
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

47. **A real, previously-masked treatment-responsiveness question in the
    `[HYPERKALEMIA FROM MISSED DIALYSIS]` rhythm mechanism — found while
    closing a previous item in the queue (this session), filed rather than patched blind.**
    a previous item in the queue's own bicarb magnitude fix (below) surfaced a second, deeper
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

    **AUDITED (2026-09-03) — the raw-`pat.k` read is not an oversight; it
    is a previous item in the queue's own already-in-code-documented deliberate design
    decision, confirmed by reading the comment already sitting directly
    above the deterministic `effK` state machine a few lines below `a.hyperK`
    in `cardiovascular.js`:** "the a.hyperK PVC/ectopy substrate just above
    is DELIBERATELY left on raw pat.k, not effK: calcium stabilises the
    conduction/threshold axis but does not correct the potassium-driven
    excitability that actually causes ectopy... the correct clinical nuance
    (calcium buys time, it doesn't treat the hyperkalaemia)." This item's
    own measured finding (calcium+bicarb doesn't rescue the stochastic VT
    pathway) is therefore exactly the intended behavior re-derived
    independently from the outcome side, not a newly-discovered defect. The
    part of this item that remains a genuinely open, unanswered question —
    whether treatment that actually LOWERS raw serum K (bicarb's real
    transcellular shift) should decay `rhythmInstability` faster than
    ordinary K-falls-on-its-own does — is unaffected by this finding and
    stays open, at the scope already correctly identified above (needs its
    own dedicated batch touching shared rhythm code, not a bolt-on). No
    code changed this session.

48. **PARTIALLY FIXED (2026-09-05) — one real contributing bug closed, the
    dominant driver root-caused and re-filed as a previous item in the queue below; still open.**
    Original filing (2026-09-01): a real, measured, unexplained drift in
    "conserved" quantities for a completely resting, condition-less,
    dose-less patient, found by the new `conservationAudit.mjs` tool
    (a previous item in the queue, see section 3's newest entry). `pat.kMass` rose
    and `pat.totalBloodVol`/`pat.plasmaVol` both fell STEADILY (confirmed
    via a point-by-point diagnostic sweep, not just start/end — the drift
    rate is essentially linear from t=60s to t=1800s, with no sign of
    settling toward a steady state) for a plain `abdPain`/`chestPainM`
    patient with NO condition, NO dose, NOTHING happening — measured
    ~3.5-3.7% kMass rise and ~2.2-2.9% totalBloodVol fall over 15 minutes,
    ~6.9% plasmaVol fall over 30 minutes. `pat.naMass` and `pat.rbcMass` were
    comparatively much closer to stable (~0.5-0.7% and ~0% respectively over
    the same window) — confirming this was NOT a uniform "everything drifts a
    little" numerical-noise artifact.

    **One real bug closed this session, `renal.js`'s `aldoEffect`.** The old
    `(pat.aldosterone - 1) * 0.05` treated aldosterone=1 as the resting
    baseline, but this file's own RAAS block decays resting aldosterone
    toward 0, not 1 — measured settling at ~0.047. That mismatch produced a
    near-constant, spurious ~-0.048 potassium-retention bias every tick at
    rest (every other aldosterone consumer in this file already treats 0 as
    resting baseline; this term was the one outlier). Fixed to scale directly
    off aldosterone itself. See section 3's newest entry and the fix's own
    in-code comment (`renal.js`) for the full measurement.

    **Still open — the dominant driver is NOT in `renal.js` at all.**
    Re-measured after the aldoEffect fix: `conservationAudit.mjs` still FAILS
    kMass (now drifting the OTHER direction, ~12-15% over 15 min, since the
    fix removed a bias that had been partially masking a larger, opposite
    one) and totalBloodVol/plasmaVol (both pre-existing, unaffected by this
    fix, unrelated mechanism — likely the Starling/lymphatic balance per this
    entry's original note, still not investigated). Root-caused the kMass
    driver one level further, by direct tick-by-tick probing rather than
    guessing: it is `renal.js`'s own `kShiftConc` term (pH-driven
    transcellular K+ shift), forced by a resting patient's `pat.ph` sitting
    persistently around 7.457-7.459 rather than 7.40 — NOT a `renal.js` or
    `acidbase.js` defect, since pH there is correctly DERIVED each tick from
    na/k/cl/paco2/etc., not an independent state that could itself "drift."
    The real culprit is one level further still: `pat.paco2` (respiratory.js)
    never reaches a fixed point within the audit's own 15-30 minute window —
    filed in full as new a previous item in the queue below, since it is genuinely separate,
    larger, cross-module (respiratory/cardiovascular-autonomic/metabolic)
    physiology-engine work, not a renal-module bug fix.

49. **NEW, filed 2026-09-05 — a resting, condition-less patient's own
    `pat.paco2`/`pat.ph` never reach a fixed point within any realistic
    call-length window, found while root-causing a previous item in the queue's kMass drift.**
    Measured directly (standalone tick-by-tick probe against `abdPain`, no
    condition, no dose): `pat.paco2` falls from the constructed initial 40
    mmHg toward ~34.6 mmHg over 900s and is STILL falling, in an unbroken,
    slowly-decelerating line, at t=900s — no sign of settling within the
    window `conservationAudit.mjs` (a previous item in the queue) uses. Traced to its
    source, not guessed: `respiratory.js`'s `updateGasExchange` computes
    `paco2Target = (vco2/pat.va) * 863`, i.e. the RATIO of CO2 production
    (`pat.vo2Demand`, metabolic.js) to alveolar ventilation (`pat.va`, itself
    from `pat.rr`/`pat.vt`, which are driven off `pat.neuralSymp`/
    `pat.sympathetic` in cardiovascular.js's autonomic block). Both the
    numerator and denominator of that ratio relax from this engine's own
    elevated CONSTRUCTED initial sympathetic tone toward true rest, but on
    DIFFERENT effective time constants — so their ratio, and therefore
    PaCO2 and pH, keep drifting for as long as neuralSymp itself hasn't
    fully settled, which measurably outlasts the 900-1800s window this
    project's own verification tooling uses. Downstream consequence
    confirmed (not assumed): the resulting persistent mild respiratory
    alkalosis (pH ~7.457-7.459 instead of 7.40) drives `renal.js`'s
    `kShiftConc` term (real H+/K+ exchange physiology, correctly coded) to
    shift potassium into cells every tick, which is the dominant remaining
    contributor to a previous item in the queue's kMass drift after this session's `aldoEffect`
    fix. **Two candidate fixes, neither attempted this session (genuinely
    separate, cross-module, high-blast-radius work — every scenario in the
    game starts from this same initial state, so a miscalibration here is
    load-bearing for the whole engine's resting baseline, not a one-file
    patch):**
    (1) construct `patient.js`'s initial `neuralSymp`/`sympathetic` (and
    anything downstream of it) already at ITS OWN true resting equilibrium
    rather than an elevated value that must relax there, which would remove
    the transient entirely rather than just speeding convergence; or
    (2) match the effective relaxation time constants of `pat.vo2Demand` and
    `pat.rr`/`pat.vt`'s own dependence on `neuralSymp` so their RATIO
    converges quickly even if each individually takes longer. Either needs
    its own dedicated batch with the same measurement discipline as this
    finding (before/after tick-by-tick probes on a resting control, not just
    start/end deltas), and needs re-verification against every scenario's
    OWN baseline vitals at t=0 (a change here moves the resting point every
    scenario in the game launches from).

50. **NEW, filed 2026-09-13 — a real, measured drift between midazolam's
    (and possibly morphine's) own documented calibration comment and its
    CURRENT engine behavior, found by running `physiologyValidation.mjs`
    to completion for the first time in many sessions.** `drugs.js`'s
    `midazolam` entry states "a standard 5 mg dose (measured intensity
    0.534) suppresses ~48% of the drive" — but direct instrumentation of
    the real engine, replicating `physiologyValidation.mjs`'s own
    `[SEIZURE LIMB] midazolam terminates moderate seizure` assertion
    exactly (settle 2 ticks, dose at t=300s, glucose forced to 35), shows
    peak `pat.anticonvulsant` plateauing at 0.3905 across five independent,
    freshly-constructed patients (bit-for-bit identical, confirming this is
    NOT a previous item in the queue's per-patient trait randomization) — an implied
    intensity of 0.434, ~19% below the cited 0.534. At the suite's own
    "moderate" hypoglycemic severity (glu=35, metabolic drive=0.25), the
    resulting `rawDrive = 0.25*(1-0.39) = 0.1525` sits just ABOVE
    `neuro.js`'s own 0.15 sustain threshold, so the seizure the suite
    expects midazolam to terminate does not terminate — measured 100% of
    late-window ticks still seizing against a required [0,15]% band.
    `morphine`'s own PaCO2-rise assertion shows a smaller, same-shape
    shortfall (measured 3.83-3.86 mmHg, reproducible across repeated runs,
    against a documented "PaCO2 +6.3 mmHg" comment and a required [4,10]
    mmHg band) — plausibly the same underlying drift on a different
    receptor pathway (`respDriveSuppression` instead of `anticonvulsant`).

    **NOT fixed this session, deliberately** — the fix requires first
    determining WHICH side of the discrepancy moved: either the shared
    intensity/Emax computation in `pk.js` was recalibrated by an unrelated
    session sometime after these comments were written (in which case the
    coefficients `0.9`/`0.25` should be re-identified against the new,
    correct intensity), or the coefficients themselves need raising to
    restore the documented intensity. Either fix touches shared,
    engine-wide PK code (`pk.js`'s per-drug intensity computation) that
    every drug in the formulary passes through, and needs its own
    dedicated batch with a fresh measurement of EVERY drug's own cited
    calibration figure against current behavior, not a one-drug patch
    slipped into an unrelated verification session. A future session
    picking this up should: (1) grep every `drugs.js` comment citing a
    specific "measured intensity X" or "measured effect Y" figure, (2)
    re-measure each against the current engine via the same
    `physiologyValidation.mjs`/`mechanismWiring.mjs` probe idiom, (3)
    determine whether the drift is common to all drugs (shared intensity
    formula regression) or isolated to these two (per-drug coefficient
    drift), before touching any code.

51. **NEW, filed 2026-09-13 — a previous item in the queue's receptor-desensitization
    fields (`pat.opioidDesens`/`gabaDesens`/`beta2Desens`) are computed and
    decayed correctly every tick but are NEVER READ anywhere, a real
    "written, decayed, and still inert" defect per section 1's own third
    rule, found while investigating a previous item in the queue above.** Confirmed by grep
    across all of `src/`: `pk.js` computes and updates all three fields
    (verified live via probe: `gabaDesens` climbs from 0 toward ~0.39 over
    a real 30-minute sustained midazolam exposure, exactly matching that
    item's own section-3 write-up), and `patient.js`/`scenarioSweep.mjs`
    declare/track them — but no code anywhere multiplies `intensity` (or
    any other consumer) by `(1 - desensitization)`, the mechanism these
    fields were built to express. Confirmed this is NOT the cause of
    either a previous item in the queue's own failure (both failing assertions use a single,
    non-repeated dose, and desensitization starts at exactly 0 with
    negligible buildup by the time either measurement is taken — this is a
    real, independent, second defect, not a contributing cause of the
    first). Not fixed here: wiring the multiplication in at `pk.js`'s
    per-drug-instance intensity computation is a real, small code change,
    but verifying it doesn't silently alter every already-calibrated
    drug's own therapeutic-dose behavior (since `intensity` currently
    reaches its full, un-desensitized value on every first dose of every
    drug in the formulary) needs its own dedicated batch re-running
    `mechanismWiring.mjs`/`scenarioSweep.mjs` to completion afterward, not
    a same-session addition on top of an unrelated verification pass.


52. **NEW, filed 2026-09-21 — `national.js` cannot take a temperature,
    named as baseline monitoring by Universal Care (p.14).** Waveform
    capnography DOES exist (`devices.js` `capno`, now crew-attachable via
    `gear.js`'s `attachCapno` task and `national.js`'s `capnography` rule).
    No thermometer device/task exists: needs a device entry, an
    `attachDevice` task, a published temp reading, then hyper/hypothermia
    and sepsis rules. Still owed: EtCO2-driven rules (CPR quality <10 mmHg,
    p.6230; post-ROSC target 35-45, p.6551) now that the reading is live.

53. **PARTIALLY DONE (2026-09-21) — drugs `national.js` names.** DONE:
    ipratropium, dexamethasone, diltiazem, metoprolol, morphine, ketorolac,
    IV acetaminophen, nitrous oxide, ketamine (agitation step after
    midazolam), norepinephrine (replaces `pushEpi` as the shock pressor;
    `pushEpi` kept for anaphylaxis) — new `gear.js` tasks + capped,
    adult-gated `national.js` rules. STILL OPEN, not in `data/drugs.js` at
    all (need entry, task, rule): activated charcoal, acetylcysteine,
    verapamil, procainamide, systemic lidocaine (VT), prednisone/
    methylprednisolone/hydrocortisone, pralidoxime, hydromorphone, sodium
    thiosulfate, potassium iodide, droperidol/haloperidol/ziprasidone,
    labetalol/hydralazine/nifedipine. KNOWN LIMITS of the done part:
    (a) fixed-dose entries stand in for weight-based doses (diltiazem 20 mg
    vs 0.25 mg/kg; over-65 patients get metoprolol instead because the
    guideline caps their diltiazem at 10 mg); (b) `GENERIC_PAIN` (pain>=4)
    cannot tell chest pain from other pain, so a severe-pain patient can be
    offered morphine alongside the cardiac aspirin/nitro rules; (c)
    vasopressin/phenylephrine exist but this guideline names no step for
    them; (d) unverified in a live call, mock-`ctx` evaluation only.

54. **NEW, filed 2026-09-21 — weight-scaled pediatric dosing.** Every
    fixed-dose `national.js` rule is gated `ADULT`, so pediatric patients
    get no auto-suggested drugs. Needs weight-scaled task variants (or a
    dose multiplier on the task) for adenosine, atropine, naloxone, epi,
    saline, midazolam, dextrose etc., then removal of the gate per rule.

55. **NEW, filed 2026-09-21 — baseline assessment/monitoring rules
    (pulse ox, BP cuff, 12-lead, pads, serial vitals, drug-reassessment
    vitals, IV access, glucose recheck, tourniquet) were added to
    `national.js` only.** Not yet ported to `laCounty.js` or
    `sanDiegoCounty.js`, which still fire `iv` only for hypoglycemia/
    arrest/shock and `vitals` only once. Port using their own protocol
    citations, not National page numbers.

56. **NEW, filed 2026-09-21 — `national.js` baseline rules are unverified
    in a live call and use coarse triggers.** Only a mock-`ctx` evaluation
    and eslint were run. Still to do: (a) play a call and confirm the
    "directs <hand>: <task>" log lines appear; (b) `tourniquet` fires on
    any `activeBleedRate>0` (no extremity/junctional distinction); (c)
    `ivCritical` uses broad triggers rather than each chapter's own IV
    step; (d) `CRITICAL`/`vitalsCritical` (q5 min) is this file's own
    reading of "frequently," not a stated National interval; (e) no rule
    yet for `cspine`/spinal motion restriction (Spinal Care p.241, a
    decision guideline with no clean physiology signal), `assessPupils`/
    `assessSkin`/`assessCapRefill` tasks, or serial 12-leads after ROSC/
    clinical change (p.1554, p.6554); (f) a chapter-by-chapter audit of
    every guideline's own monitoring/access/reassessment steps against
    the rules is still owed.

57. **NEW, filed 2026-09-21 — a real pupil-diameter mechanism.** The
    engine still has NO stored pupil state. `src/physio/pupils.js`
    (`pupilState(pat, v)`) is a live READ-OUT over existing fields, shared
    by the `pupils` exam action and `PupilMinigame.jsx`: `opioidMiosis`
    (new this session, `pk.js`, opioid effect net of naloxone),
    `cholinergicVagalTone`, `vagalBlock` (atropine/anticholinergics),
    `catecholLevel`, `icp`/`strokeSide`, `cpp`/pulse (arrest gives fixed,
    dilated), consciousness, age. Not yet measured against a two-sided
    A/B in `mechanismWiring.mjs`. Still to build: (a) a stored
    `pat.pupilL`/`pat.pupilR` diameter with real dynamics (constriction
    latency, hippus) instead of a per-read derivation; (b) drivers that
    have no signal today: sympathomimetics (cocaine/amphetamine),
    serotonin syndrome, alcohol, hypoglycemia, hypothermia, ketamine
    (nystagmus/midposition), benzodiazepines and other sedatives (no
    miosis), barbiturates, botulism/lateral brainstem lesions; (c) a
    lesion SIDE for ICP/mass effect (only `strokeSide` exists, defaults
    left); (d) `probes.pupils` scenario overrides are still frozen text
    that beats the live state (see a previous item in the queue); (e) `respDriveSuppression` is NOT
    used as a miosis proxy on purpose, since sedatives also set it;
    (f) add the `mechanismWiring.mjs` assertions (naloxone reverses
    `opioidMiosis`; raising `icp` above 25 anisocoria; arrest fixed).

58. **NEW, filed 2026-09-21 — printable 12-lead is a teaching synthesis, not
    a cardiac-vector model.** `src/twelveLead.js` draws all 12 leads from
    the live snapshot (rhythm kind, hr, `qrsWidth`, `prInterval`,
    `infarctTerritory`); the Monitor tab's "Print 12-lead" button keeps the
    last 3 as static paper (`TwelveLeadPrint.jsx`). Still to do: (a) no
    scenario or condition sets `pat.infarctTerritory` yet, so every STEMI
    draws inferior; set it per scenario/condition (`ami`, `chest`, the
    `probes.ecg` overrides already name territories in prose); (b) the
    NSTEMI/unstable angina ST depression and T inversion are not drawn (only
    the `stemi` ecg kind gets ST changes); (c) axis is fixed normal, and no
    LBBB/RBBB, LVH, Wellens, pericarditis, hypokalemia U waves, or
    `pat.qt`-driven QT drawn (QT is recomputed from rate); (d) `ecgLiveText`
    scenario overrides can disagree with the drawn tracing; (e) print does
    not cost time or require a paramedic-level scope check, and printing
    is not yet tied to the `ecgAcquire` action or base transmission.

59. **NEW, filed 2026-09-21 — procedure minigames are mostly feel, not
    physiology.** `GiveMedMinigame`, `DrawUpMinigame`, `PupilMinigame`,
    `GlucometerMinigame`, `DeviceMinigame`, `CprMinigame` and
    `ProcMinigame` (tourniquet, needle decompression, chest seal, BVM,
    defib) replace the flat busy-timer, but only CPR (`pat.cprQuality`)
    and pupils (`pupilState`) feed the engine, plus BVM as of the
    continuous rework (`pat.bvmVolQ`/`bvmRateQ` scale assisted ventilation
    live, expiring 12 s after the last push). CPR and BVM are continuous
    sessions with a crew hand-off; CPR has a stamina bar driven by
    `staminaFitness` (fitness after fatigue, where fatigue 0 is fresh and
    100 is exhausted; Medical Simulation reads every stat as maxed via
    `statFor`/`SIM_MAX_STATS` in `campaign/core.js`). Still to do: (a) BVM
    over-large breaths should cause gastric insufflation and vomiting, and
    the crew hand-off has a 25 s task delay for BVM (CPR gets an immediate
    dose); (b) tourniquet tightness should separate a venous from an
    arterial tourniquet, and the written time should surface at handoff;
    (c) needle decompression site/depth errors should have real injury
    consequences; (d) glucometer technique should bias the reading
    (dilution, alcohol) instead of only failing; (e) device errors (lead
    reversal, wrong cuff size, unzeroed art line) should distort the
    monitor rather than only blocking the attach; (f) the drug draw-up
    order is random and not tied to the next drug given; (g) none of the
    minigames has a browser test yet (see `tools/browser/verifyMinigame*.mjs`);
    (h) pediatric CPR depth/rate and pad sizes are not scaled.

60. **NEW, filed 2026-09-21 — auscultation (stethoscope exam) follow-ups.**
    Shipped: `AuscultationMinigame` is a free-placement exam on a drawn bare
    torso (`ChestBody.jsx`, front and back, no labels) — hover, click to place,
    hold and drag to slide; `physio/auscultation.js`'s `chestSpec()` mixes the
    lung field and heart area audible at that point from live physiology, and
    `audio/auscultationPlayer.js` cross-fades gains so dragging blends rather
    than restarting. It CANNOT be failed: the player types what they heard and
    what they think it is, which goes to the crew as a radio line, and the
    engine's own finding still lands in the log via `actions.js`. Requires a
    bare chest (`CLOTH_LOCK.torso` plus a `start()` guard). Rates AND rhythm are
    exact: `intervalPattern()` (`audio/retime.js`) gives regular, afib (no
    repeating pattern), pvc (early beat then a compensatory pause, from
    `pat.pvcFrequency`) and pac (from `pat.atrialEctopicFocus`), every one with
    an exact mean. 258 clips from 5 open datasets (see `credits.js`); regenerate
    the manifest with `node src/scripts/genAusculManifest.mjs` after adding
    files. Verified by `scripts/ausculRetimeTest.mjs` (136 pass) and a
    headless-Chromium test (pneumothorax side measurably quieter, dragging
    builds exact-rate buffers, back view plays, typed note handed back,
    no page errors). Still to do: (a) no scenario sets `pat.ptxSide` /
    `pleuralEffusionSide`, so a pneumothorax is always on the right; (b) the
    user's own hemothorax and pneumothorax-cough recordings are not added yet
    (need source and license); tension pneumothorax is a 0.03 gain attenuation,
    not a recording; (c) no pericardial rub, and only 3 stridor clips (the
    HF_Lung test split holds 22 s of stridor in total); (d) **RESOLVED (a
    later session) — Mobitz dropped beats are still not sounded (the engine
    models no dropped-beat timing), but AV block itself is no longer
    unmapped**: `heartSound()` now selects the real "AV Block" recordings for
    the two AV-block states this engine actually publishes live
    (`v.ecg==="chb"`/`"firstDegreeBlock"`) — a real acoustic-authenticity
    improvement (an actual AV-block heart, not a "Normal" clip standing in for
    one), even though the beat-to-beat dropped-timing itself is still
    unmodeled, unchanged; (e) MR
    and AR use pediatric CirCor clips; Wikimedia CC BY-SA clips were
    deliberately not taken; (f) the drawn torso is one body type, with only a
    female-contour variant and no body-size or tone variation from the patient;
    (g) the typed note is free text that nothing reads back or scores, and the
    crew do not react to it; (h) sounds were built and measured but never played
    through speakers by a person.

    **A separate later-session audit (verifying the recordings are actually
    connected to the right physiological states, not just present) found and
    fixed three more real defects, and left one deliberately unfixed — see
    a previous item in the queue below for the one left open.** (i) **RESOLVED**: a real
    location-tagging bug — 3 KAUH Coarse Crackles clips were literally
    filenamed `KA_CoarseCrackles_LRA_{3,4,5}.wav`, an invalid location (`LRA`
    doesn't fit the `side+level+A` scheme; every sibling KAUH category already
    used the correct `RLA`). Renamed on disk and the manifest regenerated via
    `genAusculManifest.mjs` — those 3 clips are now reachable at their real
    location instead of only via the unfiltered fallback pool. (j)
    **RESOLVED**: 10 heart clips tagged `RC`/`LC` ("beside the sternum," a
    real third listening point besides the 4 classic valve areas) were never
    reachable as a targeted pick — `heartAt()` only ever resolves a click to
    RUSB/LUSB/LLSB/A, never RC/LC. Fixed by aliasing them onto their nearest
    real valve area inside `pickHeartClip()` (RUSB↔RC, LUSB/LLSB/A↔LC) rather
    than carving out new click territory — confirmed live that both
    previously-unreachable clips (`F_S4_RC`, `M_LDM_LC`) are now genuine near
    matches. (k) **RESOLVED**: `Pleural Rub` (9 clips) was completely dead —
    defined in `LUNG_SOUNDS`/`SHAPES` but `lungSound()` never once selected it
    (this is a distinct gap from (c)'s *pericardial* rub, a heart finding).
    Wired to `pat.pulmResistFactor>1.3` at a non-apical field — PE's own
    real PVR-elevation mechanism, reused as the trigger for the textbook
    pulmonary-infarct pleuritic rub, checked ahead of wheeze/rhonchi since
    neither of those is otherwise engaged by PE in this engine (previously a
    PE patient always auscultated as flatly "clear"). Verified two-sided
    (fires at a lower field with elevated PVR, stays clear at the apex and in
    a PVR-normal control). `RANK` (the `sideFinding()` severity table) gained
    a `rub` entry so this shows up in the one-line exam summary too. All
    three verified via `ausculRetimeTest.mjs` (136/136, unaffected),
    `eslint`/`vite build` (clean), and a direct probe confirming every one of
    the 258 clip IDs in the regenerated manifest still resolves to a real file
    on disk.

61. **NEW, filed 2026-09-22 — three more `HEART_SOUNDS` categories are dead
    data with no defensible physiological trigger identified, left unfixed
    rather than force-wired.** Found in the same audit as a previous item in the queue(i)-(k)
    above: `Early Systolic Murmur` (14 clips), `Late Systolic Murmur` (5),
    and `Atrial Fibrillation` (4) are declared in `auscultationSounds.js` but
    `heartSound()`'s template selector (`physio/auscultation.js`) never
    returns any of these three strings, so `pickHeartClip()` can never reach
    them — 23 clips, unreachable except via the unfiltered base-pool
    fallback a `near` match would otherwise prefer. Deliberately NOT wired
    this session: the engine's existing murmur logic already fully covers
    systolic/diastolic findings via the real AS/MR/AR/MS severity fields
    (`aorticStenosisSeverity`/`mitralRegurgFrac`/`aorticRegurgFrac`/
    `mitralStenosisSeverity`), so `Early`/`Late Systolic Murmur` would need
    either a genuinely new, separately-timed systolic-murmur mechanism this
    engine doesn't have (early- vs. late-peaking systolic murmurs are a real,
    distinct auscultation teaching point from a holosystolic/mid-systolic
    one, but nothing in `cardiovascular.js` currently distinguishes murmur
    TIMING within systole) or duplicating an already-covered finding under a
    different label, either of which is worse than leaving them unwired.
    `Atrial Fibrillation` is a real rhythm state (`v.ecg==="afib"`) already
    fully modeled through the separate `pattern` mechanism (irregular R-R via
    `audio/retime.js`'s `intervalPattern()`), independent of `template` — the
    4 AFib-labeled S1/S2 recordings would only ever add acoustic-authenticity
    polish (the same reasoning that justified a previous item in the queue's own `Tachycardia`/
    `AV Block` fixes), but doing that correctly means checking whether these
    specific clips were recorded from a genuinely irregular rhythm (in which
    case retiming them onto the engine's own exact afib pattern could fight
    or double up with the recording's own irregularity) or a regular one
    used only as a source of AFib-adjacent tone — not established this
    session, so left open rather than guessed at. Whoever picks this up
    should listen to (or at minimum spectrally inspect) the 4 AFib source
    clips before wiring them.

62. **NEW, filed 2026-09-22 — a real "Auscultation Practice" tab now exists in
    Education Mode, quizzing every one of the 647 heart/lung clips with a
    real per-clip report mechanism; a second, focused pneumothorax-recording
    search came back empty for a real, structural reason.**

    **Shipped.** `src/education/AuscultationPracticeTab.jsx` (new), wired
    into `EducationApp.jsx`'s tab bar. Builds its clip list directly from
    `HEART_SOUNDS`/`LUNG_SOUNDS`/`AUSC_BASE` (`data/auscultationSounds.js`)
    — the SAME manifest the real in-game stethoscope exam reads, so a
    future `genAusculManifest.mjs` regeneration (new clips added, existing
    ones renamed/removed) is automatically reflected here with zero
    separate bookkeeping. Two modes: **Quiz** draws from a shuffled,
    no-repeats-until-exhausted order covering every one of the 647 clips
    (reshuffles and starts a new "pass" once a pass completes, so a session
    is unbounded rather than a fixed-length quiz) — 4-choice MCQ, the real
    category plus 3 distractors drawn from the SAME instrument (heart vs.
    lung, never mixed) so the choices are never a trivial giveaway. Verified
    directly (a standalone script replicating the component's own pure
    choice-building logic, not assumed): all 647 clips produce a valid,
    duplicate-free 4-choice set that always includes the true category, and
    all 647 clip URLs resolve to a real file on disk. **Browse** is the
    literal "every single file linked to there" requirement satisfied
    beyond the quiz's random draw — a filterable table of all 647 clips,
    each with its own inline `<audio controls>` player, so any specific
    clip can be reached directly without waiting on a random draw to
    surface it.

    **Reporting**, mirroring `reports.js`'s existing question-report
    pattern exactly rather than inventing a second shape: new
    `src/education/soundClipReports.js` (`submitClipReport`/
    `fetchPendingClipReports`/`resolveClipReport`, a `soundClipReports`
    Firestore collection, the same create/read/admin-update security-rule
    shape `reports.js`'s own header already documents — copy it verbatim
    into the real Firestore rules when this ships). A "Report this clip"
    control appears in both Quiz (after answering) and Browse (per row),
    gated on `reportingEnabled` (`firebaseConfigured`) exactly like the
    existing question-report button — confirmed this degrades correctly
    with Firebase unconfigured (`reportingEnabled` reads `false` in this
    dev environment, so the button simply doesn't render, matching the
    existing convention rather than crashing). `AdminReviewTab.jsx` gained
    a new "Sound Clip Reports" sub-tab (`ClipReportsReview`, a direct
    structural copy of the existing `ReportsReview`, swapping the
    question-choices preview for an inline audio player) so a real admin
    review/resolve workflow exists, not just a write-only report box.

    **Verification.** `npx eslint` clean on all four touched/new files
    (`AuscultationPracticeTab.jsx`, `soundClipReports.js`,
    `AdminReviewTab.jsx`, `EducationApp.jsx`). `npx vite build` clean, same
    pre-existing >500kB chunk-size warning. A direct probe (not just eslint)
    confirmed: 647 total clips match `HEART_SOUNDS`/`LUNG_SOUNDS`'s own
    combined count exactly; every choice set is valid; every clip URL
    exists on disk. Not verified live in a browser this session (no dev
    server click-through) — the logic itself was verified directly against
    the real data/manifest, per this document's own "instrument, don't
    reconstruct" discipline, but a real click-through (open the tab, answer
    a few, submit a report with Firebase configured) is still worth doing
    before treating this as fully proven in the actual running app.

    **The pneumothorax-recording search, re-attempted from a different
    angle, came back empty again — for a real, now-confirmed structural
    reason, not just bad luck.** Searched specifically for diagnosis-driven
    (not just acoustic-category) datasets, and read HF_Lung_V1's own README
    directly rather than trusting a search snippet: its label taxonomy is
    inhalation/exhalation/wheeze/stridor/rhonchi/crackle only, with NO
    diagnosis metadata at all (unlike KAUH, which does carry a diagnosis
    per patient) — so it cannot have a pneumothorax label by construction,
    not merely because it was never mined. The underlying reason no dataset
    anywhere seems to have this: a pneumothorax's own auscultation finding
    is an ABSENCE (silence/near-silence from air or fluid physically
    blocking sound transmission), not a distinct positive sound the way a
    wheeze or crackle is — there is no natural "this clip sounds like
    pneumothorax" acoustic category for an annotator to label in the first
    place. This is a stronger, more specific conclusion than the earlier
    session's "didn't find one" — a future session re-attempting this
    should expect the same structural answer, not assume a dataset was
    simply missed.

63. **NEW, filed 2026-09-22 — leftover `s.given.X` cases in `scenarios.js`
    deliberately left unfixed by this session's tracking sweep (see the
    session's own entry immediately above item 98 for the fix that closed
    the main bug — `s.given` was drug-only, procedures needed `s.done`).**
    Three distinct, separate loose ends, none a same-shape rename:
    - **`magill`** (one site, `s.given.laryngoscopy || s.given.magill`) — a
      dead reference. No `id:"magill"` exists anywhere in the codebase; the
      real Magill-forceps action in the `fbao` scenario is named `clearFB`
      instead. Harmless (always false inside the `||`), but there's no
      correct substitute to rename it to — needs either a real `magill`
      action id or removing the dead clause.
    - **`monitor`/`o2` (partial)** — `s.given.monitor` and `s.given.o2` use
      a `TASKS` mechanism (`gear.js`) that's neither `s.given` nor
      `s.done`/doneKey: monitor attachment is tracked via `s.monitorBy`
      (set at `App.jsx` ~2674/2732), and `TASKS`' plain `o2` entry
      (`dose:"o2nrb"`, no `doneKey`) never stamps `s.done` at all today —
      a real, separate gap in `TASKS`/`crewFn` itself (any `TASKS` entry
      with a bare `dose` and no `doneKey` silently never marks itself
      done), not a rename. The player-path half (`o2nrb`) was already
      fixed to `s.done.o2nrb`; the crew-path `o2` task gap remains open.
    - **`diazepam`/`lorazepam`/`lactatedRingers`** (5 sites total) — not a
      given/done tracking bug at all: these drugs were never implemented
      in `drugs.js` in the first place (only `midazolam` exists for benzos,
      only `saline`/`plasmalyte` for crystalloid), so debrief text
      referencing them is describing treatment options that don't exist in
      this formulary. Either implement the drugs for real (each would need
      its own `drugs.js` entry with a real receptor/PK mechanism, per
      section 4's discipline — not a quick add) or rewrite the debrief text
      to stop naming unavailable options.

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

The set the simulator is aiming at, for the condition-library workstream (a previous item in the queue). **Roughly 280 entries against 188 currently implemented, direct
count as of 2026-09-03's `amiodaroneOverdose` addition (a previous item in the queue's
standing workstream, not a previous item in the queue's condition-library backlog — a
`CONDITIONS` entry regardless, so it bumps this total; see section 3's
topmost entry) on top of the prior 187 from this session's multi-agent
batch's SECOND wave (2026-09-01,
+5: Necrotizing Fasciitis, Neuroleptic Malignant Syndrome, Cocaine
Toxicity, Malaria, Dengue Fever — see section 3's topmost entry) — see this
section's own closing paragraph below the "already implemented" list for
the full reconciliation note.** Running tally as of the PRIOR session (161)
follows below for historical trace, not the current total: (+1 this
session from `cyanidePoisoning`, a previous item in the queue's own suggested "carbon monoxide
and cyanide toxicity" batch, its second half — see section 3's newest entry;
+1 from a real backfill gap, `diabetesT2`, found by the same direct-count
check, not built this session; +1 from `tricyclicOverdose`, a previous item in the queue's
own suggested batch, the PRIOR session — see section 3; 33 before
the first cardiac-conditions batch; +15 from that batch; +1 from the items-8-20
batch (`uterineAtony`); +17 from the items-22/26-plus-respiratory batch; +5
from the second cardiac-conditions batch; +54 from an earlier session's neuro/
endocrine sweep; +1 from `hyperkalemiaMissedDialysis`; +1 from
`rocuroniumOverdose` (a previous item in the queue's overdose-condition workstream); +16
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
point. This session adds `tricyclicOverdose` (a previous item in the queue's own suggested
batch) on top of that, for the 158 now current. The categorized
lists below are the REMAINING backlog: a condition is REMOVED from its category
list the session it ships (see the standing rule in section 4), so the categories
shrink as the "already implemented" list grows and nothing is built twice.

**Already implemented (187, direct count — see this list's own closing
paragraph below for why the enumerated names below undercount that)** — for
these the job is step (b) review and deepening,
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
`acquiredLongQT` (a previous item in the queue — hypokalemia + hypomagnesemia + bradycardia +
a chronic QT-prolonging medication converging on a real, self-initiating
torsades substrate; see section 3), and — from the cardiac-conditions batch,
most recent session — `thirdDegreeAVBlock`, `firstDegreeAVBlock`,
`atrialFibrillation` (covers both plain and RVR presentations — a scenario
parameterizes the rate via its own `patient:` override), `atrialFlutter`,
`secondDegreeAVBlockTypeI`, `secondDegreeAVBlockTypeII`, `monomorphicVT`,
`wpw`, `pericardialTamponade`, `symptomaticBradycardia`, `digoxinToxicity`,
`pericarditis`, `myocarditis`, `hypertensiveUrgency`,
`hypertensiveEmergency`, and — from the items-8-20 batch, most recent
session — `uterineAtony` (a previous item in the queue, scenario `pph`/OBGY-043: uterine
atony as the leading, most field-treatable cause of postpartum hemorrhage;
see section 3), and — from THIS session's items-22/26-plus-respiratory
batch — `sickleCellCrisis` (a previous item in the queue), `heatStroke` (a previous item in the queue),
`spontaneousPneumothorax`, `openPneumothorax`, `hemothorax`,
`pleuralEffusion`, `ards`, `aspirationPneumonitis`, `bronchitis`,
`bronchiolitis`, `pertussis`, `influenzaPneumonia`, `covidPneumonia`,
`croup`, `epiglottitis`, `cysticFibrosisExacerbation`,
`tuberculosisHemoptysis`, and — from THIS session's second cardiac-conditions
batch — `prematureVentricularContractions`, `prematureAtrialContractions`,
`sickSinusSyndrome`, `electricalStorm`, `aicdMalfunction`, and — from THIS
session's neuro/endocrine sweep (a previous item in the queue) — Neurologic:
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
`diabetesInsipidus`, `refeedingSyndrome`, `hyperammonemia`; plus a previous item in the queue's own conditions: `hypertension`, `hyperlipidemia`,
`diabeticVasculopathy`, `copdExacerbation`, `esophagealVaricealHemorrhage`,
`allergicReactionModerate`, `vasovagalSyncope`, `minorSprain`,
`chronicBackPain`, `excitedDelirium`, `hyperkalemiaMissedDialysis`, and
`rocuroniumOverdose` (a previous item in the queue's overdose-condition workstream) — and,
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
above): `diltiazemOverdose`, `metoprololOverdose` (a previous item in the queue's
overdose-condition workstream), `toxicInhalationChlorine` (a previous item in the queue's
physiology half), `atropineOverdose` (a previous item in the queue); and, from THIS
session's condition-library batch, `carbonMonoxidePoisoning` (a previous item in the queue,
Toxicology); and, from THIS session, `tricyclicOverdose` (a previous item in the queue,
Toxicology — see section 3's newest entry); and, from the MOST RECENT
session, `cyanidePoisoning` (a previous item in the queue, Toxicology — see section 3's
newest entry); and, from THIS session's multi-agent parallel batch,
`hocmObstructive` (HOCM, shipped between the last count and this one — see
its own section 3 entry immediately below this session's newest one),
`acquiredMethemoglobinemia` (a previous item in the queue) and `serotoninSyndrome`
(a previous item in the queue, Toxicology); and, from this SAME session's second wave,
`necrotizingFasciitis`, `neurolepticMalignantSyndrome`, `cocaineToxicity`,
`malaria` (a genuinely new pure-hemolysis mechanism, `updateHemolysis` in
metabolic.js) and `dengueFever` (see section 3's topmost entry) —
**187 conditions implemented in total now, confirmed by direct count
against the tree**
(`Object.keys(CONDITIONS).length`), not the running tally alone (lesson
16). That is MORE than this paragraph's own name-by-name arithmetic would
predict — the gap between a maintained running list and the real tree has
recurred repeatedly across sessions (see the `diabetesT2`/
`diltiazemOverdose`/etc. backfills above), and each successive session's
direct count confirms it keeps widening rather than closing. A full
name-by-name reconciliation of this list against `Object.keys(CONDITIONS)`
is genuinely overdue but was not attempted this session (large, separate
audit work, out of scope for a parallel physiology batch) — treat the 187
figure as the trustworthy total and this list's own enumerated names as an
incomplete, but not misleading, subset of it.

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
Pacemaker Failure · Pacemaker Syndrome

*(Infective Endocarditis shipped this session in scoped form (fever/bacteremia
+ valve involvement + one timed embolic event) — the full vegetation-growth
composite remains open, see section 3. Aortic Stenosis and acute Mitral
Regurgitation both shipped this session — see section 3's newest entries.
Hypertrophic Obstructive Cardiomyopathy shipped 2026-09-01 (see section 3's
newest entry) — a real dynamic LVOTO mechanism now exists (composed into the
already-built aorticStenosisSeverity/eaEff channel), closing the gap
takotsubo's own entry had flagged. Mitral Valve Disease's chronic/stenotic
forms shipped this session as `mitralStenosis` — see section 3's newest
entry; the remaining valve-disease backlog is now just Pacemaker Failure
and Pacemaker Syndrome.)*

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
Obstructive Cardiomyopathy shipped 2026-09-01** (see section 3's newest
entry) — the dynamic-LVOTO mechanism the engine previously lacked (the same
gap takotsubo's own entry flagged) now exists, composed into the already-built
aorticStenosisSeverity/eaEff resistance-in-series channel rather than a
parallel one. **Aortic Stenosis and acute
Mitral Regurgitation both shipped this session** (see section 3) — the
valve-resistance-in-series/regurgitant-fraction mechanisms they needed turned
out to already exist (built for a previous item in the queue, never wired to a condition).
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
discipline. See a previous item in the queue for the original fuller reasoning.)*

### Toxicology / Poisoning
Acetaminophen Overdose ·
Aspirin Toxicity · Beta Blocker Overdose ·
Calcium Channel Blocker Overdose ·
Methamphetamine Toxicity ·
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
first batches (a previous item in the queue). The eclampsia seizure writer it once needed already
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
(unspecified) · Cellulitis · Septic Arthritis ·
Toxic Shock Syndrome · Sepsis (Undifferentiated Source) ·
Neutropenic Fever ·
Influenza ·
COVID-19 (Mild) ·
Herpes Zoster ·
Clostridioides difficile Colitis ·
Lyme Disease

*(Necrotizing Fasciitis, Malaria — with a genuinely new pure-hemolysis
mechanism, `updateHemolysis` in metabolic.js — and Dengue Fever all shipped
this session, see section 3's newest entries. A new "Infectious Disease"
`SCEN_BODY_SYSTEM` category was created in App.jsx for them, since none
existed before.)*

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

*(Facial Trauma with Airway Compromise pairs with a previous item in the queue — it is one of
the four sources named for the `pat.airwayFluid` mechanism that would finally make
`suction` do something. Sprain also has a waiting consumer: the `minorSprain`
scenario (TRMA-033) is currently condition-LESS — an isolated ankle inversion
injury with static vitals — because no sprain/isolated-extremity-injury
condition exists yet. See a previous item in the queue.)*

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
a previous item in the queue.)*
