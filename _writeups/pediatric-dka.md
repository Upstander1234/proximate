### Queue item 7 (pediatric batch) — Pediatric DKA, diabeticKetoacidosis's own mechanism at pediatric scaling, with an honest, gated proxy for the real cerebral-edema risk

**The real gap, confirmed by grep before starting (lesson 16).** No
`pediatricDKA` existed; `diabeticKetoacidosis` (adult) does, and is the
correct base — pediatric DKA is mechanistically the SAME anion-gap
ketoacidosis process, not a different disease, so there is no honest reason
to invent a second mechanism.

**Scaling.** Age 8 (`ageProfile.defaultWeight(8)`=30 kg, the age band where
new-onset T1DM presenting in DKA is most common), hr/rr/sbp left to
`ageProfile.js`'s own `baselineVitals()`/`baselineMAP()` age-appropriate
defaults rather than adult numbers. Identical `unmeasuredAnions` translation
`diabeticKetoacidosis` already established: at this condition's own k=5.2
(na defaults to 140), SID=42.2, so an anion pool of 14.7 reproduces a real
severe-pediatric-DKA presenting hco3=9.5, ramping at the identical
rate/ceiling `diabeticKetoacidosis` already measured and cited.

**The real, higher-stakes difference: cerebral edema.** Pediatric DKA
carries a real, disproportionate mortality risk adult DKA does not carry at
the same rate — clinically apparent cerebral edema complicates roughly
0.5-1% of pediatric DKA episodes but accounts for 60-90% of pediatric DKA
deaths (Glaser et al., *NEJM* 2001 — the historical basis for the "bolus
judiciously, correct slowly" pediatric DKA fluid guidance every EMS/PALS
protocol now carries), and the strongest modifiable risk factor identified
is the RATE of fluid/osmotic correction — large-volume, rapid crystalloid
resuscitation is specifically implicated, not fluid resuscitation itself
(which is still indicated and necessary for the real hypovolemia DKA
causes).

**Honest scope decision, exactly per this batch's own instruction.** This
engine's one real ICP-adjacent handle, `pat.icpMassEffect`
(`intracerebralHemorrhage`/`subarachnoidHemorrhage`/`increasedICP`/
`meningitis` all already write it; `cardiovascular.js`/`neuro.js` already
read it into Cushing's-triad-shape bradycardia/hypertension and
`mortality.js`'s own herniation ceiling), is a genuine, reusable, already-
wired mechanism — so a modest, real consequence IS wired, gated
SPECIFICALLY on REPEATED aggressive fluid dosing, not fluids themselves and
not a scripted vitals catastrophe. Each `saline` administration is a fixed
500 mL, already 15+ mL/kg for this patient's own 30 kg weight, so
guideline-appropriate DKA fluid management is a SINGLE such bolus for
initial resuscitation; the condition reads `s.doses` directly (the third
argument every condition's `progress()` already receives) and counts
crystalloid administrations to this patient across the call. Two or more
raises `pat.icpMassEffect` toward a small, literature-anchored ceiling
(0.18 — real and measurable on the ICP gauge, well short of a
herniation-grade mass effect).

**What is NOT separately modeled, stated plainly rather than faked.** The
true cerebral-edema mechanism is an osmotic fluid shift into brain tissue as
extracellular osmolality falls faster than intracellular osmolality can
re-equilibrate — this engine has no intracellular/extracellular osmolality
gradient model anywhere, so the `icpMassEffect` bump is an honest PROXY for
"you are correcting this patient too fast," not a simulation of the real
cellular mechanism. The primary teaching vehicle for the real risk is this
condition's own in-code dosing-rate reasoning (and would be a resolve()
guidance line if/when a scenario is authored), not an invented new
physiology term standing in for the real one.

**MEASURED (throwaway probe, stripped, since no scenario yet exists to
route through the full suites).** At t=300s with no fluids: `hco3` 11.86,
`unmeasuredAnions` 14.98 (real, still-severe ketoacidosis, matching
`diabeticKetoacidosis`'s own calibration), `icpMassEffect` 0. A single
saline bolus: `icpMassEffect` stays exactly 0 (the guideline-appropriate
case does not trigger the proxy). Four stacked saline doses over the same
window: `icpMassEffect` 0.150 — a real, bounded, measurable rise, correctly
absent for the single-bolus case and present only for the repeated-dosing
pattern the real literature actually implicates.

**mechanismWiring.mjs**, in the shared new
`[NEONATAL SEPSIS / PEDIATRIC DKA / INCARCERATED HERNIA / INTUSSUSCEPTION]`
section: tested directly against the `Patient` class with a real `s.doses`
array (the same "tested directly, not through a scenario loop" precedent
queue item 21's `coronaryStenosis` assertion already establishes), since
this mechanism specifically needs to read `s.doses` in a way `probe()`'s own
internal `s` does not expose to `mutate`. Presence (the shared anion-gap
mechanism fires); the real two-sided point (a single guideline bolus does
NOT raise `icpMassEffect`; four stacked doses DO, >=0.1). `hco3`,
`unmeasuredAnions` and `icpMassEffect` were already in `scenarioSweep.mjs`'s
REQUIRED/NON_NEGATIVE lists — no scenarioSweep.mjs changes needed.

**Verification.** `node --check` clean. `npx eslint src/physio/conditions.js
src/scripts/mechanismWiring.mjs`: zero findings. No scenario authored for
this condition — same physiology-mechanism-only scope `thermalBurn`'s own
entry sets as precedent.
