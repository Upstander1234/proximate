# Proximate — Parallel Session Contract

Two sessions run concurrently against the same repo (`c:/Users/trana/proximate`).
- **Session 1 (front-end):** React/gameplay/UI queue.
- **Session 2 (backend):** physiology engine + co-op server.

They share one disk. There is no built-in file locking. This document is the ONLY
guard against two sessions editing the same file. Read it before touching anything.

## 1. Absolute file ownership (single-writer, no overlap)

### Session 1 owns (may EDIT)
- src/App.jsx
- src/campaign.js
- src/components/RelationshipsOverlay.jsx
- src/components/Shell.jsx
- src/ecg.js
- ECG components
- src/relationships.js
- crew machinery
- src/downtimeEvents.js
- browser scripts (tools/browser/) and tools/browser/README.md
- sessions/session1-delta.md, sessions/state-fields.md (own entries)

### Session 2 owns (may EDIT)
- src/physio/*.js (all modules)
- src/conditions.js
- src/cardiovascular.js (if that is a physio submodule, else its physio home)
- src/pk.js (if physio submodule)
- src/coop.js
- server/coopServer.mjs
- any new condition-library files
- sessions/session2-delta.md, sessions/state-fields.md (own entries)

### Read-only for BOTH (never edit)
- CLAUDE.md (single-writer: the merging session)
- Any file not in either ownership list — treat as read-only unless a session
  claims it and updates this table.

## 2. Heavy-tool lock (one core)

The container has ONE core. Only one session runs a heavy tool at a time:
Playwright, a verification suite, or `npx vite build`.

Protocol:
1. Before running anything heavy, check for `sessions/LOCK`.
2. If `sessions/LOCK` exists, wait (poll) until it is gone.
3. Create `sessions/LOCK` (touch it).
4. Run the heavy tool to completion.
5. Delete `sessions/LOCK`.

Editing is parallel and light. Verification is serial. Never leave LOCK behind.

## 3. CLAUDE.md single-writer

Do NOT edit CLAUDE.md. Each session appends its §3/§6 delta to
`sessions/session1-delta.md` / `sessions/session2-delta.md`:
- what shipped (with measured numbers)
- what is still open
- what is explicitly NOT verified
- new deferred items (tracked, findable)

The merging session consolidates both deltas into CLAUDE.md at the end.

## 4. Save-compat registry

If a session touches the `g` state shape, it declares new fields in
`sessions/state-fields.md` so the two never add colliding fields, and states
explicitly whether existing saves break.

## 5. Final gate

Runs ONCE, after Session 2 lands (it owns the engine):
`mechanismWiring.mjs` -> `scenarioSweep.mjs` -> `npx vite build` -> `npx eslint`,
sequentially.

Session 1 verifies with `npx vite build` + `npx eslint` + Playwright only (it
does not touch the engine). Each session also runs a short targeted check for
each of its own changes BEFORE landing, so the final gate's failure set stays
attributable.

## 6. Verified boundaries

Each session ends with its own report (shipped/measured/still-open/NOT-verified)
and its own condense handoff. Never leave a batch unverified.

## 7. Compaction convention

Condense at ~300k context. At each condense hand off: what shipped (batch
results with numbers), the exact delta-file entries, the next planned batch,
and current verification state. Nothing survives only in a truncated transcript.

---

# SESSION 1 BRIEFING — Front-end (React/gameplay/UI)

You are Session 1 of two parallel sessions on Proximate. You own the front-end
queue. A parallel session owns the backend — you never touch physiology engine
files or the co-op server.

## Read before anything
- CLAUDE.md: §4 (how to work) + §7 (hard-won lessons) first (stable rules),
  then §2 (verification baseline) + §6 (open queue) — AUTHORITATIVE status.
  §3 is historical changelog, NOT a status board. Read each §6 item's FULL
  body, not just its opening line.
- `.clinerules/proximateRules.md` and `.clinerules/workflows/proximateWorkflow.md`
  (binding).
- This file: `sessions/PLAN.md` (the contract above).

## Trust nothing in CLAUDE.md without checking the tree
A claim something is "done/fixed/resolved" is not what the code contains. Grep
before relying on any item. Comments/handoffs have been wrong in both directions.

## Your backlog (priority order)
1. **F41** — `relationshipsOpen` pause-guard gap. Six sites:
   App.jsx:1623 (`if(!live.includes(g.phase)||g.micnOpen||g.newUnit||g.loadOpen||
   g.settingsOpen||g.confirmDeath||g.achievementsOpen) return;`), interval body
   App.jsx:1628, and `paused={...}` props at App.jsx:4847, 4862, 4880. Add
   `||g.relationshipsOpen` (and `||s.relationshipsOpen` in the interval body)
   to all six. Same bug class fixed twice before (F13 `confirmDeath`,
   `settingsOpen`). Confirm live in a browser with Playwright afterward.
2. **F42** — bug-hunt. Already-written Sandbox setup-wizard Playwright script
   (level->department->vehicle->partners->mode->scope->ready->station) has
   NEVER been click-tested. Launch curated scenarios from >=6 body systems from
   the `cat` phase clicking exam/procedure/medication actions watching for
   console errors. Open/close Settings + Achievements overlays. Dead-field grep
   of `src/physio/*.js` (READ-ONLY — report findings, do not edit; this found
   magToxicity, strokeWeakness, pvcFrequency, bun, dpg, homeMeds historically).
3. **F7 loose end** — `tools/browser/README.md` not updated with
   `verifyPatrolPartnerCrewSeat.mjs` + its locator gotcha (`getByText(name)`
   matches innermost/deepest element; `.p-3.rounded` filtered by `hasText`
   needed since crew cards share that className).
4. **F1 Chapter 1** — `campaignArrivalPrompt` phase (doesn't exist; `offDuty`
   phase's `pick()` handler currently routes every save straight to
   `"gmodePick"` — route zth saves through `campaignArrivalPrompt` first,
   applying `arrivalTimeDeltas` (45/15/on-time/5-late; reputation +3/+1/0/-2;
   `g.morale` +2/+1/0/-1; fatigue +4/+3/0/-3), set `arrivalPromptSeen:true`,
   then continue to `"gmodePick"`). `campaignCh1Shift` entry phase (seed
   `career:{queue:<3 draws from CH1_CALL_POOL>,idx:0,results:[]}` the way
   Prologue's `beginPatrol` does; `STARTING_MONEY` applied once gated on
   `ch1MoneySeeded`). Ch.1 ending/EMR-push phase -> sets `ch1Done:1`.
   Placeholder dialogue per the standing instruction. Honest note: reachability
   playtest not possible until Ch.2-5 hooks land.
5. **F9** — ECG/12-lead static per-category readout. Two call sites: `ecg.js`
   + monitor strip App.jsx:945-947.
6. **F5** — 8 relationship ids uncreated; on-shift micro-interactions;
   quiet-moment scene; partner-change consequence.
7. **F6** — crew member quits temporarily (needs design decisions);
   `shitty_supervisor` morale drain (blocked on F5); reputation consumers
   (blocked on exam/promotion flow).

## Rules (binding)
- Fix existing bugs before new features. Avoid large refactors — reuse existing
  systems (assets.js, crew/task machinery, condition-composition engine).
- Preserve save compatibility: touch to `g` state shape -> declare fields in
  sessions/state-fields.md and state whether saves break.
- No decorative fields: if you write `pat.someField`/`g.someField`, something
  must read it; if you read, something writes it. Grep both directions.
- Every physiological effect is a MECHANISM, not a stat write — but as the
  front-end session you mostly consume the engine, not write to it.
- Update every affected reference across files — no partially-migrated systems.
- No automated UI regression harness by default — re-read the surrounding code
  paths after each change as a substitute. Prefer `tools/browser/` Playwright
  scripts where they exist.
- If a requirement is ambiguous, STOP and ask. Don't guess and ship.
- Prefer data-driven systems over hardcoded content.
- American English throughout.
- Comments carry the WHY and what was wrong before.

## Verification (Session 1)
- `npx vite build` clean; `npx eslint` at or below the live baseline (check §2
  for the number — was 73 errors/4 warnings; verify, don't trust a stale count).
- Playwright for the front-end-specific fixes (F41 live check, F42
  click-throughs).
- Respect the LOCK file for heavy tools (section 2 above).
- Write your §3/§6 delta to `sessions/session1-delta.md`; do NOT edit CLAUDE.md.
- Deferred work -> tracked queue item in your delta, not just a code comment.
- Finished work removed from backlog in the same pass.

## Stop rules
- Ambiguity -> ask. Ballooning scope -> stop at a verified boundary, leave the
  remainder tracked. Each batch is one coherent, fully-verified unit before the
  next begins.