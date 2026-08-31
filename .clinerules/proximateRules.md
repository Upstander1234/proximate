PROJECT: Proximate — a browser-based prehospital-care simulator. Its entire
value is the closed-loop physiology engine (16-state cardiovascular ODE,
respiratory mechanics, renal/endocrine, metabolic, coagulation, thermo,
neuro, obstetric, plus 2-compartment PK/PD). Everything else is presentation
on top of it.

BEFORE DOING ANYTHING: read CLAUDE.md in the repo root. Read it in this
order, not top to bottom:
  1. Section 4 (how to work) and Section 7 (hard-won lessons) — stable rules.
  2. Section 2 (current verification baseline) and Section 6 (the open
     queue) — this is the AUTHORITATIVE statement of what's done/open.
     Trust these over everything else in the file.
  3. Section 3 is a historical changelog (newest entry first), kept for
     mechanism-level reasoning, NOT a status board. A later entry can
     override an earlier one's conclusion. Do not infer current project
     status from section 3 — cross-check section 6.
  4. Inside section 6, an item's OPENING LINE can be stale even when the
     rest of that same item's body is current (e.g. "IN PROGRESS" followed
     later by "RESOLVED — see below"). Read the full item, not just its
     first sentence.
  5. Section 8 is a reference backlog for the condition-library workstream
     only — not a general status source.

TRUST NOTHING IN CLAUDE.md WITHOUT CHECKING THE TREE. A claim in that file
— including a claim that something is "done," "resolved," or "fixed" — is
not the same as what the code contains. Before starting or relying on any
item, grep for the field/function it names or confirm the file exists.
Comments and handoffs have been specifically, repeatedly wrong in both
directions (claiming something broken that was already fixed, and claiming
something fixed that was never actually done).

CORE ENGINEERING RULES (non-negotiable, from the project's own doc):
- Every physiological effect must be a MECHANISM, not a stat write. Never
  write something like `fx: { sbp: +30 }`. A drug/procedure/condition
  declares a physical effect (resistance, dead space, receptor occupancy,
  heat in watts...) and the engine's own ODE/feedback loops must produce
  the resulting vitals.
- No decorative fields. If something writes `pat.someField`, some other
  code must read it. If something reads a field, some other code must
  write it. Grep both directions before trusting a mechanism is real.
- A field can be written, read, AND still be inert (i.e., never actually
  reach the observable it claims to affect). This is the most dangerous
  and hardest-to-catch defect class in this codebase. When you add a
  mechanism, measure the observable at the far end of the chain — not
  just the field you wrote.
- Never reconstruct engine formulas from memory/paraphrase in a test or
  probe script. Instrument the real engine directly (temporary
  `pat._dbgX = {...}` at the actual site, using only in-scope variables)
  and strip the instrumentation before shipping. Reconstructing formulas
  independently has caused real, published wrong conclusions in this
  project's history.
- Identify numbers, don't tune them. Every coefficient should trace to a
  documented clinical/literature anchor. State the fact, measure the model
  across candidate values, pick the one that lands, write both the fact
  and the measurement into the code comment. A number chosen just to make
  a test pass is worse than no number.
- Comments carry the reasoning: WHY a number/mechanism is what it is, and
  what was wrong before. This convention is why old defects don't get
  silently reintroduced — don't break it by skipping the comment.

FRONT-END-SPECIFIC RULES (apply on top of the above, for any React/App.jsx/
gameplay work):
- Fix existing bugs before adding new features.
- Avoid large refactors unless truly necessary — reuse existing systems
  (assets.js, the crew/task machinery, the condition-composition engine)
  rather than replacing them.
- Preserve save compatibility. If a change touches the `g` state shape,
  explicitly state whether it breaks existing saves.
- If a change spans multiple files, update every affected reference — no
  partially-migrated systems.
- There is no automated UI test regression harness by default — after any
  front-end change, re-read the surrounding code paths the change touches
  (not just the edited lines) as a substitute for a test run. If browser
  automation tooling exists in the repo (check `tools/browser/`), prefer
  using and extending it over inspection-only verification.
- If a requirement is ambiguous, stop and ask. Don't guess and ship.
- Prefer data-driven systems over hardcoded behavior for anything content-
  like (scenarios, conditions, drugs, crew configs, events).

WRITE EVERYTHING IN AMERICAN ENGLISH — code, comments, commit messages,
prose. Match existing American spelling in files you touch; don't mass-
rewrite untouched files just to normalize spelling (diff noise).

VERIFICATION IS NOT OPTIONAL. Before calling any batch of work done:
- Physiology-engine changes: run the affected suites in
  `src/scripts/` (mechanismWiring.mjs, scenarioSweep.mjs,
  physiologyValidation.mjs, etc. — check what exists and what each covers
  before assuming). Diff the FAILURE SET, not the count — a suite that was
  already green means any new failure is a regression by definition.
- Everything: `npx vite build` must stay clean; `npx eslint` must hold at
  or below its currently-documented baseline (check CLAUDE.md section 2 for
  the live number — don't trust a count quoted inside an old section 3
  entry, which reflects that entry's time, not now).
- State plainly what was implemented, what was measured, what is still
  wrong, and what was NOT verified. If a prior conclusion (yours or a past
  session's) turns out wrong, say so explicitly rather than quietly
  correcting it.

DO NOT run more than one long-running verification suite concurrently —
this environment/container effectively has one core; parallel runs starve
each other and make things look far slower than they are.

WHEN YOU DEFER SOMETHING: it must become a tracked, findable open item
(in whatever backlog/issue mechanism this project uses next) — not just a
code comment. A deferral that only lives in a comment is invisible to
future planning.

WHEN YOU FINISH SOMETHING: remove it from wherever it was tracked as
"remaining backlog" in the same pass — don't leave completed work listed
as open, and don't let it get built twice.