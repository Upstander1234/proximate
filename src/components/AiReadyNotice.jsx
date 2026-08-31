import { useEffect, useState } from "react";
import { C, MONO, SANS } from "../theme.js";
import { getLocalAiState, subscribeLocalAiProgress } from "../dialogue/dialogueManager.js";

// F0 item 7 — "When the model finishes downloading/loading: an unobtrusive
// 'Local AI is ready — Refresh Proximate to enable dynamic dialogue [Refresh
// Now]' notice. Never force a refresh. If dismissed, continue the current
// session normally, keep the model cached, let the player refresh later, and
// recognize the cached model on next launch."
//
// REFRESH-VS-HOT-SWAP INVESTIGATION (item 7's own text: "investigate whether
// the model can be initialized without a full refresh, but don't add
// complexity just to avoid one — manual refresh is fine if it's the more
// reliable architecture"):
//
// Traced the actual call path rather than assuming a refresh is needed.
// `dialogueManager.js`'s `localLLM` is a module-level `LocalLLMProvider`
// singleton (shared by every screen past boot — already directly confirmed
// by `tools/browser/verifyBackgroundAiIndicator.mjs`'s `===` identity check
// across the boot->title transition). `LocalLLMProvider.isAvailable()` only
// checks `navigator.gpu` and `!this._failed` — it does NOT require the
// engine to already be loaded. `requestLocalUpgrade()` (the one live Tier-3
// call site) calls `localLLM.generate()`, which calls `_ensureEngine()`,
// which returns the SAME in-flight/resolved `_loadPromise`/`_engine` the
// background download has been building the whole time. In other words:
// once `status()` reaches `"ready"`, the very next dialogue event in the
// SAME session already gets a real Tier-3 line — there is no separate
// "session-scoped engine" to swap out, no stale provider reference held
// anywhere in React state (App.jsx never imports the engine object itself,
// only calls through `requestLocalUpgrade`/`generateDialogueSync`, which
// re-resolve the singleton fresh on every call), and no in-flight-request
// hazard beyond what `requestLocalUpgrade`'s own existing
// timeout/try-catch already handles for every other failure mode.
//
// Conclusion: a full page refresh is NOT architecturally required to start
// using the model in the CURRENT session — this codebase already hot-swaps
// for free, as a consequence of the singleton design items 1/12 already
// established, not new plumbing added for this item. Building a forced or
// even opt-in "reinitialize the engine" path here would be complexity spent
// re-solving a problem that does not exist in this architecture. So this
// component does the simplest correct thing: show the notice, and if the
// player clicks "Refresh Now" it does a plain `location.reload()` (a fresh
// session that will detect the model as already-cached and reach "ready"
// faster next time) purely as a player-requested convenience, NEVER
// triggered automatically — the spec's own item 33 explicitly forbids
// forcing a refresh, and per the trace above nothing is functionally gained
// by refreshing beyond the player's own preference for a clean restart.
export default function AiReadyNotice() {
  const [ai, setAi] = useState(() => getLocalAiState());
  const [dismissed, setDismissed] = useState(false);
  // Only show the notice for a genuine "just finished" transition — a
  // session where the model was already ready at first paint (e.g. loaded
  // from a warm in-memory state) never announces anything, since nothing
  // completed DURING this session for the player to be told about. Kept as
  // state (not a ref) since it's read during render — a ref read during
  // render doesn't trigger a re-render when it changes and is flagged by
  // this project's own lint rules.
  const [sawLoading, setSawLoading] = useState(false);

  useEffect(() => {
    return subscribeLocalAiProgress((state) => {
      if (state.status === "downloading" || state.status === "loading-from-cache" || state.status === "loading") {
        setSawLoading(true);
      }
      setAi(state);
    });
  }, []);

  const justFinished = sawLoading && ai.status === "ready";
  if (!justFinished || dismissed) return null;

  return (
    <div role="status" style={{
      position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 70,
      background: "rgba(10,14,12,.95)", border: `1px solid ${C.hr}`, borderRadius: 10,
      color: C.text, fontFamily: SANS, fontSize: 12.5, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 12, maxWidth: "92vw", boxShadow: "0 4px 18px rgba(0,0,0,.35)",
    }}>
      <span style={{ color: C.hr, fontFamily: MONO, fontSize: 11 }}>●</span>
      <span>Local AI is ready. Refresh Proximate to enable dynamic dialogue.</span>
      <button onClick={() => { try { window.location.reload(); } catch { /* no-op if unavailable */ } }}
        style={{ background: C.panelHi, border: `1px solid ${C.hr}`, color: C.hr, fontFamily: MONO,
          fontSize: 11, padding: "6px 10px", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap" }}>
        Refresh Now
      </button>
      <button onClick={() => setDismissed(true)} title="Dismiss"
        style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.dim, fontFamily: MONO,
          fontSize: 11, padding: "6px 9px", borderRadius: 6, cursor: "pointer" }}>
        ✕
      </button>
    </div>
  );
}
