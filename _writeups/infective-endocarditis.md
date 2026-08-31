## Infective Endocarditis (queue item 7, cardiac batch — deliberately scoped composite)

Previously deferred with a real, named reason: "a genuine septic+embolic+valve composite,
deserves its own batch." Full vegetation-growth dynamics (a real, StatPearls-documented
process of a platelet-fibrin thrombus colonized by bacteremia, growing over days to weeks,
intermittently showering septic emboli) is genuinely out of scope for one condition in one
session, so this was deliberately scoped DOWN to its most teachable prehospital core rather
than attempted in full:

1. **Real fever/bacteremia** through the SAME shared inflammation cascade `septicShock`
   (this session's earlier entry) already wired — `pat.pathogenBurden`/`pat.cytokineLoad`
   (`inflammation.js`) — not a decorative `coreTemp` write. Seeded at a subacute (days-old,
   not hours-old) level between `septicShock`'s several-hours-old start and
   `pneumoniaSepsis`'s fully-equilibrated one, matching IE's real 1-2 week subacute course
   (Duke criteria / StatPearls) for the common viridans-strep/enterococcal picture.
2. **A real, small valve-regurgitation component** through `updateValves`'s own
   ALREADY-BUILT `rf.endocarditis` branch (`cardiovascular.js`: `if (rf.endocarditis)
   aiTarget = Math.max(aiTarget, (pat._infectionSeverity ?? 0.5) * 0.6)`) — a second dead-
   but-built flag this batch is the first to set, same discipline as the aorticStenosis/
   mitralRegurgitationAcute entries in this same batch.
3. **A real embolic phenomenon** — this engine's only reusable focal-deficit mechanism is
   `ischemicStroke`'s own `pat.strokeWeakness`/`pat.strokeAphasia` handle (grep-confirmed:
   `acuteMesentericIschemia`'s gut-embolism limb writes `gutDO2`/`gutInjury`, a DIFFERENT
   organ-local pathway, not reusable for a focal neuro deficit). Composed as a single, timed
   embolic-stroke event partway through the call (StatPearls: ~20-40% of left-sided IE has a
   clinically apparent embolic event, most commonly cerebral), not a permanent baseline
   deficit.

**NOT attempted, stated honestly:** vegetation size/growth over time; Janeway
lesions/Osler nodes/splinter hemorrhages (no skin-finding field exists for any of these);
right-sided IE's septic PULMONARY emboli (would need a distinct V/Q-mismatch mechanism from
the left-sided systemic embolism modeled here). Each a real, separate piece of work for a
future batch.

**A real bug found and fixed while measuring.** The embolic timer was originally seeded as
`pat._ieEmbolAt = 240 + Math.random() * 300` (seconds-sized numbers, intending 4-9 minutes),
but `pat._ieT` accumulates using `progress()`'s own `dt`, which is `stepPatient`'s
MINUTES-denominated elapsed time (the same unit `sickSinusSyndrome`'s `_sssDwell` and
`delirium`'s `_deliriumDwell` use). Against a minutes accumulator, that threshold would have
pushed the embolic event out to 4-9 HOURS of simulated time — silently dead within any
realistic call length. Caught only by actually running a probe past the intended window and
finding `strokeWeakness` still zero at 600s. Fixed to `4 + Math.random() * 5` (minutes).
Re-measured: fires reliably by 600s, holds (persistent-deficit idiom, not TIA's
self-resolving one), does not fire before 200s.

Shipped: `infectiveEndocarditis` condition (conditions.js), scenario CARD-050
(scenarios.js), `aorticRegurgFrac`/`aorticRegurgStructural` etc. added to
scenarioSweep.mjs's REQUIRED/NON_NEGATIVE (shared with the valve batch above; `pathogenBurden`/
`cytokineLoad` were already present from `septicShock`), and a two-sided assertion block in
mechanismWiring.mjs ("[INFECTIVE ENDOCARDITIS — queue item 7, scoped composite]": fever/
cytokine presence, healthy-control specificity, valve-branch activation, and timed —not
presenting— embolic stroke). `npx eslint` clean.

**Resolution note:** the deferral's "deserves its own batch" framing is still correct for
the FULL composite; this entry resolves the scoped-down, prehospital-relevant core of it
(bacteremia + valve involvement + one embolic event) while explicitly leaving
vegetation-growth dynamics and right-sided/pulmonary embolism open for a future batch, per
the same honesty this workstream applies to every other deliberate scope cut.
