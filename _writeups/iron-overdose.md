### Physiology-engine batch: `ironOverdose` shipped (queue item 7, Toxicology)

Confirmed unbuilt before starting. Real two-phase mechanism (Perrone &
Hoffman, "Iron toxicity," review literature): PHASE 1 (0-6h, field-relevant)
— iron salts are directly corrosive to the GI mucosa on contact, producing
vomiting, abdominal pain, and real GI hemorrhage. PHASE 2 (6-24h, delayed)
— free iron overwhelms transferrin and poisons the mitochondrial electron
transport chain directly, producing severe metabolic acidosis and shock.

**Stated honestly, per this batch's own instruction**: phase 2 is real and
clinically critical but 6-24h post-ingestion — beyond any single EMS call's
realistic window (this engine's own scene limits top out around 1200s/20
minutes). This condition builds phase 1 as the real, field-relevant
mechanism, and the scenario's `resolve()` states phase 2's real timeline
honestly rather than force-compressing it into the call — the same "real
but out-of-window" framing `carbonMonoxidePoisoning`/`toxicInhalationChlorine`
already established for their own delayed-injury limbs.

**Reuses the existing GI-hemorrhage mechanism**: `pat.activeBleedRate`, the
same mass-conserving hemorrhage pathway `upperGIBleed`/`lowerGIBleed`
already use, per this batch's instruction to reuse a same-session GI
mechanism rather than invent a parallel one. Also drives `pat.airwayFluid`
(vomiting, real airway-management relevance for a toddler) and
`pat.intrinsicPain`.

**A real magnitude bug was caught and fixed before shipping** (measured,
not assumed, per lesson 8): the first draft's bleed-rate coefficients,
scaled directly off `upperGIBleed`'s own adult-reference numbers, drove a
~960 mL (80 mL/kg) toddler's blood volume down by more than half within 15
minutes untreated — a fabricated near-death crisis, not this phase's real,
modest severity. Rescaled down (`0.0025`→`0.0009`/min, ceiling `0.10`→
`0.035`) to a real, field-honest volume loss (26% loss by 900s, sbp
collapsing to a real but not instantly-lethal 61.9 by 15 minutes untreated).

New scenario `ironOverdose` (TOX-011, `src/data/scenarios.js`) — a toddler's
accidental ingestion of adult prenatal iron tablets, the classic real-world
pediatric presentation. `App.jsx`'s `SCEN_BODY_SYSTEM` map gained
`ironOverdose:"Toxicology"`.

**A real bug was also caught and fixed in the scenario's own `abdo` probe**:
a first draft referenced a nonexistent `v._givenGiBleed` field. Fixed to
read `pat.activeBleedRate` live instead — a genuine "live instrument
reading" finding, not scripted text (caught by `eslint`'s `no-unused-vars`
flagging the resulting unused `v` param in a sibling probe, which prompted a
closer read of this one).

**MEASURED**: untreated at 900s, activeBleedRate 0.023, intrinsicPain 5.3,
sbp 61.9 (real, moderate-severe hypovolemia, not instant death). A
condition-less control shows zero activeBleedRate. A real, honest treatment-
response confound was found and worked around: with saline reapplied every
140s across the full 900s window, the treated arm's sbp is LOWER than
untreated (dilutional coagulopathy from saline's own `fx.coag:-6`, a real,
already-documented engine mechanism — aggressive crystalloid in an actively
bleeding patient measurably worsens hemorrhage, the exact TP 1244
permissive-hypotension teaching point this codebase already models
elsewhere). The mechanismWiring assertion was scoped to a single bolus in a
60s window instead, isolating the real, immediate volume-replacement effect
from that longer-run confound (treated sbp 110.8 vs untreated 90.8 at 60s).

**Two new two-sided `mechanismWiring.mjs` assertions** (source-only, new
`[IRON OVERDOSE — queue item 7, Toxicology]` section): presence, specificity
against a healthy control, and the short-window single-bolus fluid-response
assertion with its dilutional-coagulopathy caveat recorded in-code.
`activeBleedRate`/`intrinsicPain`/`sbp` were all already tracked fields — no
new scenarioSweep entries were needed for this condition.

**Verification.** `node --check` clean. `npx eslint` on all touched files:
zero findings. Direct-instantiation probes confirmed all assertion logic
passes and the scenario resolves end to end. Probe scripts stripped.
