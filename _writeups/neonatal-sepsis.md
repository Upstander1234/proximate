### Queue item 7 (pediatric batch) — Neonatal Sepsis, a genuinely non-adult presentation built on the shared inflammation cascade, not neonatalTransition's NRP state machine

**The real gap, confirmed by grep before starting (lesson 16).** No
`neonatalSepsis` (or anything shaped like it) existed anywhere in
`conditions.js`. `neonatalTransition` (the NRP vigor state machine) and
`septicShock` (this session's own adult distributive-shock entry) both
exist, but neither is this condition.

**Substrate decision, stated explicitly per this batch's own instruction.**
Built on the SAME shared inflammation cascade `septicShock`/`pneumoniaSepsis`
already use (`inflammation.js`'s `pathogenBurden -> cytokineLoad` path is
age-agnostic — real neonatal sepsis is exactly as cytokine-driven as the
adult disease), NOT on `neonatalTransition`'s vigor machine. Reasoning:
`neonatalTransition` models a specific ~10-minute peripartum resuscitation
problem (a newborn's own transition from fetal to postnatal circulation,
driven by a discrete PPV/compressions/epi NRP algorithm) — a several-hours-
to-days-old infant presenting septic is not "still transitioning" in that
sense, is well past the delivery-room window that condition presents in, and
the vigor machine has no cytokine/pathogen concept to hang a genuine
infectious process on.

**The real, teachable clinical distinction this condition exists to make.**
Neonates do NOT mount fever/SIRS the way an older child or adult does — a
neonate's immature hypothalamic thermoregulatory response plus a large
surface-area-to-mass ratio (`ageProfile.js`) mean TEMPERATURE INSTABILITY is
the rule, and it is more often HYPOTHERMIA than fever (Wynn & Wong, *Clin
Perinatol* 2010). The other classic findings — poor feeding, lethargy,
respiratory distress — are equally nonspecific; there is no single dramatic
vital sign the way adult septic shock's hypotension is. `neonatalSepsis`:
age 0.08 (~1 month, `ageProfile.defaultWeight` 3.5 kg), presenting
hypothermic (36.1) with hypoglycemia (glu 46).

**Two real engine mechanisms were tried and measured to be fighting an
opposing pull before the one that actually works was found (lesson 8).**
1. A direct `pat.coreTemp` decrement (the same "write coreTemp directly"
   idiom `acuteCholecystitis`'s fever-trend comment uses) — MEASURED:
   thermo.js's own real heat-balance recompute runs every tick and simply
   overwrote it; coreTemp actually drifted UP, not down.
2. `metabolicHeatMultiplier` pushed below 1 (the mirror image of
   `septicShock`'s fever term on the identical handle) — MEASURED:
   `inflammation.js`'s shared cascade (`updateInflammation`, called every
   tick for ANY patient with `cytokineLoad>0`) unconditionally re-floors
   `metabolicHeatMultiplier` to `>= 1+0.35*cytokineLoad` every tick — a real,
   structural, fever-only assumption baked into the exact cascade this
   condition also needs for its own `cytokineLoad`, so this lever cannot go
   below 1 for as long as the condition keeps `cytokineLoad` alive.

Both are genuine, previously-undiscovered "written, read, but fought to a
standstill" defects of the shape section 1 warns about, not something this
batch invented — they are pre-existing engine behaviors this new condition's
own presentation happened to be the first to collide with.

**Fixed with the SAME "ceiling, re-imposed every tick against a real
opposing pull" idiom the crotaline envenomation section's own comment
already documents for coagulation factors.** `pat.coreTemp` is clamped down
to a slowly-falling private ceiling (`pat._neoTempCeiling`, 36.1 -> floor
35.0 at 0.15/min) every single tick, so whatever thermo.js's equilibrium
recompute pushed it to gets capped again before the next tick's read.
MEASURED (throwaway probe, stripped): a bare, condition-less newborn at the
identical age/weight already drifts to ~35.8C by 300s from ordinary ambient
heat loss alone (a real, honest, unscripted engine characteristic — a large
SA:mass newborn genuinely runs cool at room-air ambient even without
sepsis). The ceiling's rate was set with real margin past that natural
baseline specifically so the condition produces a MEASURABLY colder result
than a healthy cold newborn, not one indistinguishable from it: treated
35.35C vs. control 35.77C at 300s, a real 0.4C delta.

**Other findings, reused verbatim rather than invented:** lethargy via the
general `pat.metabolicEncephalopathy` handle every other "confused/obtunded
from a systemic metabolic process" condition in this file already uses;
respiratory distress via a modest, bounded `rrBase` climb; hypoglycemia via
a slow, bounded `pat.glucose` drift (a neonate's minimal glycogen reserve is
rapidly exhausted by infectious stress, unlike an older child/adult who can
mobilize substantially larger stores — this is why point-of-care glucose is
part of the real neonatal sepsis workup); a modest, cytokine-gated
`vasodilation` term at a lower ceiling than adult `septicShock` (a neonate's
proportionally smaller stroke-volume reserve means overt hypotension is a
LATE, pre-arrest sign in this age group — compensated shock looks "just"
tachycardic and poorly perfused for far longer than in an adult).

**mechanismWiring.mjs**, new `[NEONATAL SEPSIS / PEDIATRIC DKA /
INCARCERATED HERNIA / INTUSSUSCEPTION]` section (no dedicated scenario
exists yet — condition-only, per this batch's scope, tested via `mutate`
against the existing `abdPain` baseline scenario, the exact idiom
`thermalBurn`'s own section already established and justifies for a
condition with no authored call): presence (coreTemp drifts down vs. a
matched control, cytokineLoad engages through the shared cascade),
specificity (a condition-less control shows exactly zero
pathogenBurden/cytokineLoad), and the two-sided glucose-drift assertion. All
fields this condition touches (`coreTemp`, `cytokineLoad`, `pathogenBurden`,
`glucose`, `metabolicEncephalopathy`, `vasodilation`,
`metabolicHeatMultiplier`) were already in `scenarioSweep.mjs`'s
REQUIRED/NON_NEGATIVE lists from earlier batches — no scenarioSweep.mjs
changes needed.

**Verification.** `node --check` clean on `conditions.js` and
`mechanismWiring.mjs`. `npx eslint src/physio/conditions.js
src/scripts/mechanismWiring.mjs`: zero findings. Measured directly via a
throwaway probe script (stripped before this entry was written, confirmed
via directory listing) since no scenario exists yet to route through the
full suites: t=300s, treated coreTemp 35.35C vs. control 35.77C (real
delta); glucose drifting from 46.0 toward the floor; cytokineLoad/
pathogenBurden engaging from their seeded starting values.

No scenario was authored for this condition — same "physiology-mechanism
batch, not a full narrative call" scope `thermalBurn`'s own entry already
sets as precedent.
