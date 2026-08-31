# Post-death / post-arrest physiology — design and phasing

Brief: death is an EMERGENT physiological outcome, not a boolean that stops the
model. The engine keeps running; the provider sees the whole trajectory; the
final outcome (survival, neurological status, reversibility) is revealed only at
end-of-call. Extend the EXISTING mortality/cardiovascular/metabolic/renal/neuro
systems — do NOT build a second mortality system.

## What already exists (mapped before writing anything)

- `mortality.js` — `updateMortality` runs LAST in the tick. Tracks per-mechanism
  sustained duration in `pat.lethalTimers`, sets a STICKY `pat.deathCause` +
  `pat.deathStory` once a mechanism crosses its threshold. Mechanisms:
  hyperkalemiaExtreme/Severe, acidosis, cardiacArrest, exsanguination,
  irreversibleShock, multiOrganFailure, brainDeath. Reads
  kidneyInjury/liverInjury/brainInjury from neuro.js rather than reinventing.
- `neuro.js::updateOrganInjury` — accrues kidneyInjury (from O2 debt),
  brainInjury (BINARY switch: `sao2<70 || map<30`), liverInjury (lactate>4).
  `updateCerebral` computes icp/cpp/consciousness, and a `brainO2` proxy.
- `cardiovascular.js::updateRhythm` — rhythm transitions incl. ROSC
  (`pat._rosc` accumulator, sinus at >0.25 min of adequate perfusion), K-driven
  asystole, ATP-driven asystole. HR zeroed for VF/asystole only (PEA keeps a
  rate — correct).
- `physiology.js` — exposes `dead: !!pat.deathCause` and a death report getter.
- Tick order: autonomic → venousReturn → CV → ventilation → gasExchange →
  metabolism → renalEndocrine → electrolytes → temperature → coagulation →
  organInjury → cerebral → rhythm → mortality.

## The two terminology gaps to fix

1. The current model CONFLATES cardiac arrest with irreversible death: sustained
   arrest sets a locked `deathCause`. The brief wants arrest (reversible, ROSC
   possible) SEPARATE from irreversible death (crossed injury thresholds). So
   `deathCause` should mean IRREVERSIBLE only; arrest is a rhythm/circulatory
   state that `updateRhythm` already represents and that ROSC can exit.

2. Death is currently a single alive/dead axis. The brief wants a 2-D outcome:
   circulatory (alive / arrest / irreversible death) × neurological (intact /
   mild / severe / brain-dead). A patient can be alive-but-brain-dead.

## The clamp rails (brief: "do not allow arbitrary clamp rails")

Instrumented both — they are DIFFERENT and must be treated differently:

- **lactate `Math.min(20)`** (metabolic.js:171): a TRUE rail the physiology
  reaches. In arrest, production continues (O2 debt) while clearance collapses
  (liverInjury, gfr<30), so it pins. Real post-arrest lactate is 20-30+ mmol/L.
  The rail masks that the model has no ceiling mechanism — clearance never
  overtakes production in death. FIX: raise/remove the rail and let the
  acid-base consequence (hco3 consumption, pH fall) carry through, OR add a
  mass-based ceiling. Do NOT just move the number.
- **sodium `Math.max(100)`** (renal.js:84): `naMass/ecfWater` pins at 100 when
  ecfWater is driven toward zero in the dead/exsanguinated state — a DIVISION
  ARTIFACT, not physiology. FIX: guard ecfWater against collapse, or make na
  meaningless (NaN-safe) when there is no ECF, rather than clamping to a
  round survivable-looking number that reads as real.

## Neurological model — the core of the brief

Current brainInjury is a binary hypoxia switch. Brief wants mechanistic:
cerebral O2 delivery, duration×severity of hypoperfusion, extraction limits,
cellular energy failure, cumulative ischemic injury, TEMPERATURE effects,
REPERFUSION injury after ROSC. Graded, not thresholded. Reuse `brainO2`
(already computed in updateCerebral), `cpp`, `caO2`, and temperature (thermo.js).

Outcome bands (emergent, from cumulative brainInjury): intact / mild / severe /
brain-dead. Brain death = physiological endpoint (already a mortality mechanism)
NOT a UI state.

## Phasing (one coherent, verifiable slice per batch)

- **Phase 1 (this batch): graded cerebral ischemic injury + reperfusion.**
  Replace the binary brainInjury switch with a graded rate driven by the
  cerebral O2 deficit that updateCerebral already computes, add a temperature
  modifier (cold protective, hot harmful) and a post-ROSC reperfusion term.
  Assert: rapid ROSC after brief arrest → less injury than prolonged; cold
  arrest → less injury than warm. This is self-contained, reuses existing
  variables, and is fully assertable.
- **Phase 2: lactate/sodium clamp-rail removal** with acid-base carry-through
  and ecfWater guard. Assert lactate reaches documented post-arrest range and
  sodium stops resting on 100.
- **Phase 3: separate reversible arrest from irreversible death** in mortality —
  arrest as circulatory state, deathCause reserved for crossed injury
  thresholds, ROSC able to exit arrest.
- **Phase 4: neurological outcome bands** + end-of-call report fields
  (survived / time of death / ROSC / neuro outcome / irreversible injuries /
  counterfactual). UI must NOT reveal outcome mid-scenario.
- **Phase 5: post-mortem K+ rise** (cellular membrane failure) interacting with
  renal clearance, acidosis, tissue injury, ischemia duration — NOT a standalone
  death meter.

Each phase: instrument first, reuse mechanisms, every written variable gets a
real consumer, two-sided assertions, gradual transitions. Package before the
long tier. Diff the failure SET (suite is otherwise green).
