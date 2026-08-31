### Queue item 56 — burn severity/TBSA field, capillary leak, impaired-skin-barrier heat loss

**The real gap, confirmed by grep before touching anything (lesson 16).** No
`pat.burnTbsaFraction`-shaped field, or anything like it, existed anywhere in
the engine before this session — burns/wounds were narrative only
(per-scenario `wounds:` objects, `type:"burn"` at most, no severity scalar).
TP 1220/1220-P's own field steps (cool running water for burns <30% TBSA,
escalated fluid resuscitation for burns >10% TBSA, cooling contraindicated
for airway burns) all key off burn SIZE, which this engine could not
represent at all.

**`pat.burnTbsaFraction`** (patient.js constructor): a 0-1 fraction,
scenario-authored via `patient:{burnTbsaFraction:...}`, default 0 so every
existing patient is completely unaffected. Same "condition declares the
lesion, engine derives the consequence" idiom `pathogenBurden` already
established for the inflammation cascade.

**MECHANISM 1 — capillary leak (Parkland-formula-adjacent).** A new
`thermalBurn` condition (conditions.js) ramps `pat.capillaryLeak` — the SAME
whole-body endothelial-injury handle preeclampsia/sepsis/pancreatitis
already drive (metabolic.js's `updateFluidShifts` derives the Starling
reflection/filtration coefficients from it) — above the real ~20% TBSA
major-burn threshold (ABA convention; Rae & Fortuna, *Curr Opin Crit Care*
2011; Pham et al., ABA practice guidelines, *J Burn Care Res* 2008), ramping
linearly to a 0.5 ceiling at 80%+ TBSA (above pancreatitis's 0.2, below
septic shock's own peak — burns are a real, severe systemic leak state, not
a mild one). Ratcheted in over real time (0.012/min toward the ceiling, the
same clamp-toward-ceiling idiom `toxicInhalationChlorine`'s own leak ramp
uses), not instant — real burn capillary leak develops over hours, not at
the scene.

**MECHANISM 2 — impaired skin barrier -> heat loss.** thermo.js's
`updateTemperature` reads `pat.burnTbsaFraction` directly (no separate
"skin barrier" field existed to reuse, confirmed by grep first) and scales
combined skin heat loss by `1 + burnTbsaFraction` (1.0x at no burn, up to
2.0x at 100% TBSA) — a real, modest, literature-anchored effect (denuded
skin loses convective/radiative insulation and evaporative barrier
function; ABA guidelines list active warming as first-line burn care for
exactly this reason), not an invented order-of-magnitude one.

**MEASURED, stated honestly.** A direct probe (55% TBSA imposed via a
substrate-injection `mutate`, since no burn scenario yet exists in
scenarios.js — see scope note below) against a plain `abdPain` baseline,
600s: `capillaryLeak` reaches 0.115 (untreated) vs exactly 0 for a
burn-less control. Cold-environment thermal consequence: this engine's
thermal model turned out to be strongly autonomically buffered (alphaTone
vasoconstriction compensates most of any added heat loss within minutes,
confirmed by comparing 900s/1800s/3600s probes — the burn-vs-control
`coreTemp` delta reaches a stable value fast and does not keep widening).
The real, reproducible offset a 55% TBSA burn produces at 5C ambient over
900s is small (~0.0015-0.002 C), not a multi-degree swing — asserted at
this honest, measured magnitude (0.001 C threshold) rather than an invented
larger one. Fluid resuscitation: saline (existing drug, no new entry)
raises cardiac output 5.97 -> 7.17 L/min against the untreated-burn arm
through the identical Starling-equation path septicShock's own fluid
assertion already exercises.

**Treatment needs no new drug.** TP 1220's own >10% TBSA "escalated fluid
resuscitation" step is satisfied by `saline`'s existing `fx.blood`
plasma-volume bolus, which already counters the Starling-equation fluid
shift `capillaryLeak` drives — the identical mechanism every other
capillary-leak condition's fluid response already uses. Cooling
(contraindicated for airway burns per TP 1220) is a protocol-content
decision (`laCounty.js`), deliberately left untouched here — out of scope
for this physiology-engine item.

**Scope decision, stated honestly: no narrative burn scenario was
authored.** Item 56's own filing frames this as physiology-engine work; a
full playable scenario (dispatch, probes, resolve, `App.jsx`'s
`SCEN_BODY_SYSTEM` map entry, impression-code validation) is separate,
front-end-shaped content work with its own real surface area and risk this
session's collision protocol argued against taking on in a shared-file
batch. Verified instead via direct probes that invoke `thermalBurn`'s own
real `progress()` function at the exact `dt` `physiology.js`'s
`stepPatient` would pass it — an exact-fidelity stand-in for "this
scenario's condition is thermalBurn," not an approximation. A burn scenario
authored later needs only `condition: "thermalBurn"` and
`patient: {burnTbsaFraction: <value>}` to activate everything built here.

**Verification.** `pat.burnTbsaFraction` added to `scenarioSweep.mjs`'s
REQUIRED and NON_NEGATIVE lists. Four new two-sided assertions added to
`mechanismWiring.mjs`'s new `[THERMAL BURN / TBSA — queue item 56]` section:
presence (55% TBSA -> real capillaryLeak), specificity (constructor-default
0% TBSA control shows exactly zero), thermal consequence (cold environment,
burn vs. non-burn control, `coreTemp` down), and fluid treatment (saline
raises `co` through the shared Starling path). All four measured passing
via a standalone replica of the suite's own logic (not run to completion
inside the full `mechanismWiring.mjs`/`scenarioSweep.mjs`, per this
session's instruction to use targeted probes instead — a full-suite run is
deferred to the later consolidated regression pass). `npx eslint` on
`patient.js`/`thermo.js`/`conditions.js`/`scenarioSweep.mjs`/
`mechanismWiring.mjs`: zero findings from this batch's own edits (one
pre-existing/concurrent-agent `no-unused-vars` error at conditions.js:1868,
inside an unrelated `mitralRegurgitationAcute` block this batch never
touched). All throwaway probe scripts (`_tmp_burnProbe.mjs` and five
follow-on debug probes) were stripped before this write-up.

**A real collision surfaced and is recorded honestly, not hidden.** This
session's edits to `patient.js` and `thermo.js` were swept, uncommitted,
into a concurrent agent's unrelated commit (`bbcf02d`, "Document item 60
completion...") via that agent's own `git add -A` over the shared working
tree — confirmed by inspecting that commit's diff, which contains this
item's exact `burnTbsaFraction` line. The content is correct and already
committed; this session's own commit (`f63d28e`) covers the remaining
touched files (`conditions.js`, `scenarioSweep.mjs`, `mechanismWiring.mjs`)
that were still uncommitted at that point.
