### Queue item 7 (GI/abdominal batch) — Incarcerated Hernia with strangulation risk, bowelObstruction's mechanism plus a local vascular-compromise mechanism that had to clear a real, previously-undocumented opposing decay

**Picked from section 8's GI/Abdominal backlog after checking scope, per
this batch's own instruction.** `grep -i -n "GI hemorrhage\|hematemesis\|
melena"` against `conditions.js` first, per the collision-avoidance
instruction — confirmed `upperGIBleed`/`lowerGIBleed`/
`esophagealVaricealHemorrhage` already cover that ground (shipped earlier
sessions), so a GI-hemorrhage pick would have been duplicate scope. Checked
`grep -i -n "hernia"` next — zero hits anywhere in `conditions.js` before
this batch, confirming Incarcerated Hernia was genuinely unbuilt.

**Mechanism reuse, not reinvention.** The obstructive physiology
(mechanical halt of forward GI transit, colicky pain, isotonic
third-spacing into the trapped loop) is IDENTICAL to `bowelObstruction`'s
own mechanism — same oscillating-pain handle, same `plasmaVol`/
`interstitialVol`/`totalBloodVol` third-spacing writes, reused verbatim
rather than building a parallel obstruction model for what is
mechanistically the same process.

**The real, distinct complication: strangulation.** An incarcerated
(non-reducible) hernia compresses the mesenteric vessels supplying the
trapped bowel loop at the hernia neck — a real, LOCAL vascular compromise,
not a systemic-perfusion-driven one. This is why `pat.gutInjury` is written
DIRECTLY here (the same "this condition presents already carrying a fixed
injury, seeded and advanced rather than derived from systemic perfusion"
idiom `hypoxicBrainInjury`'s own comment documents for `brainInjury`)
instead of waiting for `neuro.js`'s systemic `gutDO2` pathway, which would
never engage for an otherwise well-perfused patient whose only problem is
one strangulated loop.

**A real, previously-undiscovered engine defect found and fixed in this
same batch, not shipped broken (lesson 8).** A first version used a small
accrual rate (0.0015/min) and MEASURED zero net accumulation across a real
300s probe — `gutInjury` never once left 0. Traced to the cause:
`neuro.js`'s own `updateOrganInjury` runs every tick AFTER
`conditions.progress()`, and for a patient who is NOT systemically ischemic
(this condition's whole point), its own resting-recovery branch
unconditionally decays `gutInjury` by 0.005/min every tick — silently
erasing the small direct write, net negative, the exact "written, read, but
fought to a standstill" defect class section 1 warns about. The identical
defect was independently found and fixed the same way in `intussusception`
(built in the same batch — see that write-up), both caught by measuring
before trusting a plausible-looking write rather than by inspection. Fixed
by raising the accrual rate (0.026/min) with real margin above that
resting-decay floor. MEASURED, corrected: `gutInjury` 0.045 at 300s, 0.315
at 900s.

**Field treatment: recognize and transport, stated honestly.** Reduction of
a hernia with suspected strangulation is explicitly contraindicated in real
teaching — it can push nonviable, soon-to-perforate bowel back into the
abdomen. This condition carries no curative-intervention flag at all, the
same honest posture `acuteLimbIschemia`'s own comment already takes for a
field-irreversible vascular occlusion.

**Once the strangulated segment has been compromised long enough to start
breaking down,** a real, modest GI bleed/mucosal-slough component begins
(`pat.activeBleedRate`, gated on `gutInjury>0.2`), the same gutInjury-gated
onset idiom `acuteMesentericIschemia`'s own comment already establishes for
"the bowel wall is physically failing, not an abstract clock" — ceilinged
far below `acuteMesentericIschemia`'s own systemic-ischemia bleed rate
(0.01-0.06) since this is one localized loop, not a whole vascular
territory. MEASURED: still correctly zero at 300s (below the gate), 0.0144
by 900s once the gate has opened.

**mechanismWiring.mjs**, in the shared new
`[NEONATAL SEPSIS / PEDIATRIC DKA / INCARCERATED HERNIA / INTUSSUSCEPTION]`
section (`probe()`'s own `mutate` idiom against the `abdPain` baseline
scenario, the same posture `thermalBurn`'s own section already establishes
for a condition with no authored call): presence (`gutInjury>0.15` by
900s), specificity (a condition-less control shows exactly zero
`gutInjury`), and the gated-bleed-onset two-sided assertion. `gutInjury`,
`intrinsicPain` and `activeBleedRate` were already in `scenarioSweep.mjs`'s
REQUIRED/NON_NEGATIVE lists — no scenarioSweep.mjs changes needed.

**Verification.** `node --check` clean. `npx eslint src/physio/conditions.js
src/scripts/mechanismWiring.mjs`: zero findings. No scenario authored for
this condition — same physiology-mechanism-only scope `thermalBurn`'s own
entry sets as precedent.
