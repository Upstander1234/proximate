## Acute Mitral Regurgitation — post-MI papillary muscle rupture (queue item 7, cardiac batch)

Same "previously deferred, mechanism turned out to already exist" story as Aortic Stenosis
(see `_writeups/aortic-stenosis.md`), but the mechanism it exercises is DIFFERENT on
purpose, per this workstream's own instruction: stenosis is a forward obstruction (added
Ea); regurgitation is a backward leak. `cardiovascular.js` already models it that way —
`pat.sv = totalEjection * (1 - pat.mitralRegurgFrac) * (1 - pat.aorticRegurgFrac * 0.6)` —
subtracting the regurgitant fraction from forward stroke volume AFTER the PV-loop computes
total ejection, not by adding ejection resistance. Built for queue item 41, never exercised
before this batch (grep-confirmed).

Acute severe MR from papillary muscle rupture (StatPearls "Papillary Muscle Rupture";
Sabatine "Pocket Medicine") — a rare but classically tested ~1% complication of AMI, most
often an inferior infarct rupturing the posteromedial papillary muscle 2-7 days post-MI —
is the acute, dramatic, single-call-teachable presentation targeted, not chronic
degenerative MR. `updateValves` already gives acute regurgitation a fast rise time constant
(1.5s worsening vs 12s recovering — "a valve does not spontaneously reseal once
stretched/perforated"), so this condition only had to declare severity.

**A real finding that changed the writeup mid-batch.** The initial hypothesis, taken
straight from the guideline literature, was that nitroglycerin should raise forward flow in
acute MR (afterload reduction preferentially unloads the low-pressure regurgitant path) —
the intended mechanistic contrast against Aortic Stenosis's nitro hazard. MEASURED
(direct-instantiation probe, stripped): co FELL with nitro (3.80 -> 2.39 L/min at the
condition's initial 0.85 severity, and again at a dialed-back 0.6 severity, 3.87 -> 2.34).
Traced, not guessed at: (1) `pat.mitralRegurgFrac` is a fixed structural target
(`updateValves`) with no pressure-gradient dependence — nothing implements the
easier-path-for-regurgitant-flow physics the guideline mechanism depends on; (2) this
formulary's "nitro" is nitroglycerin, and `pk.js`'s own comment on venodilation is explicit
that it is dominantly VENODILATING in this model (not the balanced arterial/venous
nitroprusside real acute-MR management uses) — measured EDV collapse 115->62 mL (preload
starvation) against a modest Ea drop (2.81->2.01) and near-flat SV (21.1->18.7). This is a
real, correctly-flagged limitation of the available drug model, not a bug to paper over: the
condition's own comment, the resolve() text in scenarios.js, and the mechanismWiring.mjs
assertion were all corrected to assert the TRUE measured direction (nitro does NOT rescue
forward flow here) rather than the textbook nitroprusside result this formulary cannot
demonstrate. Also dialed the condition's presenting severity down from the mechanism's own
0.9 ceiling to 0.6 — the ceiling severity combined with the original tachycardic/hypotensive
initial vitals put the patient into frank cardiogenic shock before any treatment, which is
real but not the intended "still has room for a treatment decision to matter" teaching case.

Shipped: `mitralRegurgitationAcute` condition (conditions.js), scenario CARD-049
(scenarios.js), shared valve fields in scenarioSweep.mjs (see aortic-stenosis.md), and a
two-sided assertion block in mechanismWiring.mjs ("[MITRAL REGURGITATION, ACUTE...]":
presence with co below control DESPITE higher hr, healthy-control specificity, and an
explicit "honest negative" assertion that nitro does not raise co). `npx eslint` clean.

**Resolution note:** A future batch giving `mitralRegurgFrac` real pressure-gradient
dependence (so afterload reduction could show its actual textbook mechanism, and so
nitroprusside vs nitroglycerin could be meaningfully distinguished) is filed as its own
item, not forced into this one.
