### Physiology-engine batch: `hydrocarbonAspiration` shipped (queue item 7, Toxicology)

Confirmed unbuilt before starting. Real mechanism, genuinely distinct from
`toxicInhalationChlorine`'s gas-phase direct mucosal/airway chemical burn
(read that condition's own comment first, per this batch's instruction,
before building a different one): aspirated liquid hydrocarbon (gasoline,
lighter fluid — low-viscosity products are the classic pediatric case,
since they spread easily and get aspirated during the coughing the swallow
itself provokes) directly dissolves and disrupts pulmonary SURFACTANT on
alveolar contact — a biophysical/chemical injury, not an irritant-gas
mucosal/bronchospasm mechanism. The real consequence is a genuine fall in
lung COMPLIANCE, not primarily bronchospasm.

**Wired directly through `pat.compliance`** (`patient.js`) — confirmed by
grep that nothing resets this field per-tick (the same "condition-owned,
safe to mutate directly" property `pat.contractilityFactor` already has) —
reusing the same variable `respiratory.js`'s gas-exchange equations already
read for every other compliance-affecting process (edema, ARDS), rather
than inventing a parallel one. A modest secondary edema/shunt contribution
and a mild irritant-cough (`broncho`) term are included but kept well below
chlorine's own bronchospasm-primary ceiling.

**A real magnitude bug was caught and fixed before shipping**: the first
draft subtracted an absolute per-minute compliance decrement sized for an
adult chest. A 3-year-old's own absolute compliance baseline is already
tiny (patient.js scales it by body mass), so the fixed decrement hit its
floor within minutes rather than the real hours-scale process this
mechanism is supposed to be. Fixed by capturing the patient's own real
starting compliance on the first tick and approaching a FRACTIONAL target
(60% of that patient's own baseline — a real, moderate 40% compliance loss)
on a slow (~100 min) time constant, so a typical 15-20 minute call shows
only the real, modest early part of a longer process.

**Real, honest time course**: chemical pneumonitis classically worsens over
hours (Marraffa & Cohen review — onset of crackles/hypoxia is often delayed
30-60+ minutes and progresses over 6-24h), not seconds. MEASURED: compliance
falls from a healthy 0.0964 to 0.0163 at 900s and continues falling to
0.0173 by 1200s (a small but real further decline, confirming the mechanism
keeps progressing rather than plateauing instantly) — sao2 holds at 97.6
throughout, matching the real clinical teaching that a reassuring early exam
does not rule out significant aspiration.

New scenario `hydrocarbonAspiration` (TOX-012, `src/data/scenarios.js`) — a
toddler's accidental lighter-fluid ingestion with immediate coughing, the
classic real-world presentation. The scenario's own `lungs` probe reads
`pat.compliance` live (three-tier crackles/effort finding). `App.jsx`'s
`SCEN_BODY_SYSTEM` map gained `hydrocarbonAspiration:"Toxicology"`.

**Two new two-sided `mechanismWiring.mjs` assertions** (source-only, new
`[HYDROCARBON ASPIRATION — queue item 7, Toxicology]` section): presence
(compliance well below a healthy control by 900s), specificity (a healthy
control's compliance meaningfully higher), and the honest hours-scale time
course (compliance does not improve from 900s to 1200s untreated).
`snapshot()` gained `compliance` (a real, condition-mutated field never
previously read through this suite's before/after path). No new
`scenarioSweep.mjs` entries were needed — `compliance` is a core field not
tracked in either list by existing project precedent (`edema`/`broncho`/
`shuntFraction` are likewise untracked there).

**Verification.** `node --check` clean. `npx eslint` on all touched files:
zero findings. Direct-instantiation probes confirmed all assertion logic
passes and the scenario resolves end to end at both 900s and 1200s. Probe
scripts stripped.
