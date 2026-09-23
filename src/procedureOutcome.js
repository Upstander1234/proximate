// Named, first-class outcomes for a procedure mini-game attempt (Procedure
// Gameplay spec 2.4 — "explicit procedure state machines... FAILED/
// CANCELLED/INTERRUPTED/ABORTED as first-class, distinguishable states
// rather than one shared outcome bucket"). Previously every mini-game
// resolved through an implicit boolean (`onResolve(true)` / `onResolve(false,
// reason)`) with cancellation handled entirely separately via a second
// `onCancel` prop that skipped App.jsx's resolver, logging, and attempt
// bookkeeping altogether — a real cancel was invisible to the rest of the
// game. All four mini-games now resolve through this single named-outcome
// contract instead: `onResolve(outcome, detail)`.
//
// INTERRUPTED/ABORTED are declared here for the same shared vocabulary but
// have no producer yet — they belong to spec 2.5 (real interruptibility),
// which is a separate, not-yet-decided architectural change (see the F3
// queue entry). Declaring them now costs nothing and means 2.5 won't need to
// invent its own parallel enum later.
export const PROCEDURE_OUTCOME = Object.freeze({
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
  INTERRUPTED: "interrupted",
  ABORTED: "aborted",
});

// A successful mini-game attempt already WAS the real time cost (however
// long the player took playing it) — charging the procedure's full abstract
// `cost` on top of that would double-count it. This is a short, fixed
// confirmation window after a SUCCESS, not the original flat cost. Kept as
// one named constant (App.jsx re-enters `start()` with this at every
// SUCCESS site) rather than a repeated literal.
export const POST_MINIGAME_CONFIRM_S = 3;
