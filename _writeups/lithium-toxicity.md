### Physiology-engine batch: `lithiumToxicity` shipped (queue item 7, Toxicology)

Confirmed unbuilt before starting (grep across `conditions.js` for
`lithium`/`pat.li`: no matches). Real mechanism: lithium has a narrow
therapeutic index (0.6-1.2 mmol/L therapeutic, >1.5 early toxic, >2.5-3.5
severe — Waring, "Management of lithium toxicity," Toxicol Rev 2006) and
toxicity is CNS-dominant — tremor progressing through hyperreflexia,
confusion, to seizures/coma as the level climbs. Framed as **acute-on-chronic**
(a stable maintenance-lithium patient who becomes dehydrated/renally
impaired — the single most common real-world toxicity mechanism, since
lithium is cleared renally and reabsorbed alongside sodium in the proximal
tubule), not a fresh massive ingestion, matching the real epidemiology.

**Wired through existing handles**, the same idiom
`organophosphatePoisoning`/`hyperammonemia`/`toxicMetabolicEncephalopathy`
already use for a graded, non-cardiac-gated toxic-CNS picture:
`pat.metabolicEncephalopathy` and `pat.epilepticDrive` (composed by MAX
with every other seizure cause in `neuro.js`) both scale directly and
continuously off a new `pat.li` field (`patient.js`, default 0.8 —
therapeutic-range, chemically inert for every patient without this
condition) — the level itself IS the severity, unlike `tricyclicOverdose`'s
QRS-gated risk.

**Field treatment, stated honestly.** No field lithium antidote exists in
this or any real formulary. Isotonic fluid resuscitation is the one real,
guideline-supported field lever — volume expansion raises GFR and reduces
proximal-tubule reabsorption, genuinely (if modestly) lowering the level.
Wired through the exact `pat.drugInstances` detection idiom `hypercalcemia`'s
own saline mechanism already established (not `s.given`, which is pure
App.jsx UI bookkeeping the physiology engine never receives — confirmed by
reading that condition's own comment before reusing the pattern).
**Hemodialysis, the real definitive treatment, is explicitly NOT
simulated** — the scenario's own `resolve()` text says so plainly.

New scenario `lithiumToxicity` (TOX-010, `src/data/scenarios.js`) — an
elderly maintenance-lithium patient dehydrated by a gastroenteritis illness.
`App.jsx`'s `SCEN_BODY_SYSTEM` map gained `lithiumToxicity:"Toxicology"`.

**MEASURED** (direct `physio()`/`activePatient()` probe, stripped before
finishing): untreated at 900s, li 3.21, metabolicEncephalopathy 0.88,
epilepticDrive 0.82 — real, severe neurotoxicity from the presenting level.
A condition-less control (`abdPain`) holds li at 0.80 (therapeutic-range
default) with zero encephalopathy/seizure drive. A single isotonic-saline
dose genuinely lowers the level (3.2133 → 3.1956, real and correctly signed,
though honestly small within a single field encounter — the level cannot be
normalized without dialysis, which this condition does not claim to do).

**Two new two-sided `mechanismWiring.mjs` assertions** (source-only, in a
new `[LITHIUM TOXICITY — queue item 7, Toxicology]` section): presence (real
graded CNS toxicity fires), specificity (a healthy control shows exactly
zero of it), and the saline-lowers-the-level assertion (the "treats the
level, not just the effect" shape, the opposite pairing from the
organophosphate/atropine "treats the effect, not the level" precedent
already on record). `snapshot()` gained `li`. `li` added to both
`scenarioSweep.mjs`'s `REQUIRED` and `NON_NEGATIVE` lists.

**Verification.** `node --check` clean on all touched files. `npx eslint
src/physio/conditions.js src/physio/patient.js src/data/scenarios.js
src/scripts/mechanismWiring.mjs src/scripts/scenarioSweep.mjs`: zero
findings. Direct-instantiation probes (not the full `mechanismWiring.mjs`/
`scenarioSweep.mjs` suites, per this session's collision-avoidance
instruction — several other agents were editing `conditions.js`/`scenarios.js`
concurrently) confirmed all new assertion logic passes and the scenario
resolves end to end with no errors. Probe scripts stripped before finishing.
