## Aortic Stenosis (queue item 7, cardiac batch)

Previously deferred with a real, named reason: "needs a new valve-resistance-in-series
mechanism, distinct from vascular-tone afterload — approximating via baseSVR would be a
real mechanism-category error." Re-checked against the code (per this workstream's own
rule (a), review before touching anything) before writing a single line: that mechanism
already existed. `cardiovascular.js`'s `updateValves`/`updateCardiovascular` sets
`pat.aorticStenosisSeverity = rf.aorticStenosis ? clamp(rf.aorticStenosisSeverity ?? 0.5, 0, 0.9) : 0`
and feeds it into `eaEff = pat.ea * (1 + aorticStenosisSeverity * 2.5)` — a term ADDED to
effective arterial elastance on top of, not blended into, the SVR-derived Ea, and separately
threaded into the RK4 PV-loop solver (`solveBeat`'s own `aorticStenosisSeverity` param,
`cardiovascular_ode.js`'s `stenosisR`). This was built for a different original purpose
(queue item 41, the regurgitation/PV-loop batch) and grep-confirmed never once exercised —
no shipped condition had ever set `riskFactors.aorticStenosis`. This condition is the first
real consumer of an already-built mechanism, not a new one.

Pathophysiology (StatPearls "Aortic Stenosis"; ACC/AHA 2020 valve guideline): degenerative
calcific AS narrows the aortic orifice, forcing the LV to generate much higher pressure for
the same forward flow. Severe AS (valve area <1.0 cm^2) produces the classic
angina/syncope/heart-failure triad. The teaching point: unlike ordinary vasotone afterload,
this gradient does NOT move with a vasodilator — nitrates are relatively contraindicated in
severe symptomatic AS.

MEASURED (direct-instantiation probe, stripped, 600s settle vs abdPain healthy control,
same age): resting co held meaningfully below control despite similar hr (4.00 vs 5.99
L/min, hr 83 vs 95) — a real fixed-orifice cap, not a scripted deficit. Pulse pressure
narrower but modestly (31 vs 34 mmHg) — kept as the honest measured number rather than
tuned toward the dramatic textbook figure. Nitro (SL, one dose): sbp collapsed 96->38 mmHg
(60%) with co falling 4.00->2.39 (40%), vs the healthy control's milder 125->72 mmHg (42%)
and 5.99->4.11 (31%) response to the SAME dose — a real, disproportionate hazard, MORE
severe than the initial "co essentially unchanged" hypothesis, traced to the AS patient
having no SVR reserve to shed (resting svr already 1395, baroreflex-elevated) and no route
to recruit more stroke volume through the fixed orifice.

Shipped: `aorticStenosis` condition (conditions.js), scenario CARD-048 (scenarios.js),
fields added to scenarioSweep.mjs REQUIRED/NON_NEGATIVE
(`aorticStenosisSeverity`/`mitralRegurgFrac`/`aorticRegurgFrac`/`mitralRegurgStructural`/
`aorticRegurgStructural` — shared with mitral regurgitation below), and a two-sided
assertion block in mechanismWiring.mjs ("[AORTIC STENOSIS — queue item 7...]": presence,
healthy-control specificity, disproportionate-nitro-hazard). `npx eslint` clean. Probe
scripts were throwaway and stripped before commit.

**Resolution note (section 6 style):** CLAUDE.md section 7 item 7's stated deferral reason
for Aortic Stenosis ("needs a new valve-resistance-in-series mechanism... distinct from
vascular-tone afterload") was accurate about the REQUIREMENT but stale about the STATE OF
THE CODE — that mechanism was already built (queue item 41) by the time this batch ran, just
never wired to a condition. Resolved by being the first consumer, not by building the
mechanism from scratch.
