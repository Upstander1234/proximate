### Queue item 7 (pediatric batch) — Intussusception, a genuinely new episodic pain pattern for pat.intrinsicPain, plus a local strangulation-injury mechanism that had to clear a real, previously-undocumented opposing decay

**The real gap, confirmed by grep before starting (lesson 16).** No
`intussusception` existed anywhere in `conditions.js`.

**Age/weight.** 0.9 years (~11 months, `ageProfile.defaultWeight(0.9)`=8 kg)
— the real 6mo-3yr peak incidence for ileocolic intussusception, the most
common cause of bowel obstruction in this age group.

**The real, distinct pain PATTERN.** Classic intussusception pain is not
`bowelObstruction`'s continuous-with-oscillating-intensity colic — it is
genuinely EPISODIC: the child screams/draws the knees up for a couple of
minutes, then returns to a comfortable, even playful, baseline between
episodes. Checked before building: `bowelObstruction`'s own
`pat._boColicPhase` sine wave (oscillates 4-8, never pain-free) is the only
existing oscillating-pain precedent in this file, and it never reaches a
comfortable floor — a genuinely new pattern for `pat.intrinsicPain`. Built
as a squared, clamped sine (`spike = sin>0 ? sin*sin : 0`; `intrinsicPain =
1 + spike*8`) that spends roughly half its cycle pinned near the floor and
spikes sharply rather than smoothly riding a sine's whole range, so it reads
as discrete severe episodes against a comfortable baseline. MEASURED
(throwaway probe, stripped): a 300s trace shows both a genuine floor (1.0,
sustained for several ticks) and a genuine peak (9.0, sustained for several
ticks), asserted directly in mechanismWiring.mjs as "both a severe episode
(>=7) and a comfortable valley (<=1.5) in the same trace" — the actual
distinguishing shape, not just "pain varies."

**"Currant jelly" stool** (blood/mucus, from the telescoped segment's venous
congestion and mucosal sloughing) is a real classic finding, but is treated
as a NARRATIVE/exam finding, not a new physiologic field — the same "exam
finding, not a systemic mechanism" call this file already makes for the 6
P's of acute limb ischemia.

**Risk of ischemia/perforation if prolonged.** Reuses `pat.gutInjury` as a
direct-write LOCAL accumulator (the same idiom `incarceratedHernia`, built
in the same batch, also uses and justifies) rather than waiting on
`neuro.js`'s systemic `gutDO2` pathway — mesenteric compression at the
leading edge of the intussusceptum is a local vascular problem, not a
systemic-perfusion one, and a well-perfused patient's `gutDO2` would never
engage the real pathway at all.

**A real, previously-undiscovered engine defect found and fixed in this
same batch, not shipped broken (lesson 8).** A first version of this write
used a small accrual rate (0.001/min) and MEASURED zero net accumulation
across a real 300s probe. Traced to the cause: `neuro.js`'s own
`updateOrganInjury` runs every tick AFTER `conditions.progress()`, and for a
patient who is NOT systemically ischemic (this condition's whole point),
its own resting-recovery branch unconditionally decays `gutInjury` by
0.005/min — silently erasing the small direct write every single tick, net
negative. The identical defect was found and fixed the same way in
`incarceratedHernia` (see that write-up); both were caught by measuring
before trusting a plausible-looking write, not by inspection. Fixed by
raising the accrual rate (0.021/min) with real margin above that
resting-decay floor. MEASURED, corrected: `gutInjury` 0.030 at 300s, 0.240
at 900s (crossing the gated bleed-onset threshold along the way) — a real,
monotonic accrual instead of a silently-dead field.

**Between-episode lethargy.** A real, described clinical progression (a
child can look deceptively well between episodes early on, then becomes
genuinely lethargic as the process continues untreated) — a small, slowly-
rising floor on the general `pat.metabolicEncephalopathy` handle, the same
one every other "child looks progressively sicker" condition in this file
already uses.

**Once the bowel wall has been compromised long enough,** a real,
measurable GI blood loss begins (`pat.activeBleedRate`, gated on
`gutInjury>0.15`), the same gutInjury-gated onset idiom
`acuteMesentericIschemia`/`incarceratedHernia` both already establish, at a
low ceiling (0.005-0.04) — this is venous oozing/mucosal sloughing, not a
brisk hemorrhage. MEASURED: 0.0084 by 900s, correctly still zero at 300s
before the gate opens.

**Field treatment is supportive only, stated honestly.** No field reduction
is possible — real reduction is a radiology-guided air/contrast enema or
surgery. This condition carries no curative-intervention flag at all, the
same honest "recognize and transport, this engine has no field-reversible
fix" posture `acuteLimbIschemia` and `incarceratedHernia` both already take
for their own field-irreversible surgical emergencies.

**mechanismWiring.mjs**, in the shared new
`[NEONATAL SEPSIS / PEDIATRIC DKA / INCARCERATED HERNIA / INTUSSUSCEPTION]`
section: the episodic-pain-trace assertion described above (tested directly
against the `Patient` class since it needs the raw tick-by-tick trace, not
a before/after snapshot), plus presence (`gutInjury>0.1` by 900s via
`probe()`'s `mutate` idiom against the `abdPain` baseline, the same posture
`thermalBurn`'s own section already establishes for a condition with no
authored scenario). `gutInjury`, `intrinsicPain`, `activeBleedRate` and
`metabolicEncephalopathy` were already in `scenarioSweep.mjs`'s
REQUIRED/NON_NEGATIVE lists — no scenarioSweep.mjs changes needed.

**Verification.** `node --check` clean. `npx eslint src/physio/conditions.js
src/scripts/mechanismWiring.mjs`: zero findings. No scenario authored for
this condition — same physiology-mechanism-only scope `thermalBurn`'s own
entry sets as precedent.
