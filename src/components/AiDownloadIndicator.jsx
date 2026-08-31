import { useEffect, useState } from "react";
import { C, MONO } from "../theme.js";
import { getLocalAiState, subscribeLocalAiProgress } from "../dialogue/dialogueManager.js";

// F0 item 6 — "show an unobtrusive progress indicator" once the player has
// left the boot screen (via "Continue without AI" or otherwise) while the
// model may still genuinely be downloading in the background. Mounted from
// Shell.jsx, so it lives alongside the always-visible Settings gear
// (SettingsOverlay.jsx) — the one piece of persistent UI chrome this game
// already has on every screen past boot — rather than inventing new chrome
// elsewhere, per this slice's own instruction to reuse what already exists.
//
// Reads the SAME real dialogueManager plumbing the boot screen's AI panel
// already uses (getLocalAiState()/subscribeLocalAiProgress()) — no second,
// parallel status system. The LocalLLMProvider singleton itself is a
// module-level object in dialogueManager.js, not recreated per-screen, so
// any load already in flight when the player left the boot screen keeps
// reporting progress to this subscriber exactly as it did to the boot
// screen's own subscriber; see CLAUDE.md's F0 item-6 entry for the direct
// verification that this singleton (and an in-flight load promise) survives
// the boot->title phase transition.
//
// Deliberately near-invisible outside a genuinely-in-progress state: renders
// NOTHING at all for ready/unavailable/failed/idle — there is nothing
// unobtrusive about a permanent status pill nobody asked for once the
// question ("is AI available") is already answered. Only
// downloading/loading-from-cache/loading (the cache check itself still in
// flight) render a small pill, and even then it's a few words of muted text,
// not an alarming progress bar.
export default function AiDownloadIndicator() {
  const [ai, setAi] = useState(() => getLocalAiState());

  useEffect(() => {
    const unsub = subscribeLocalAiProgress((state) => setAi(state));
    return unsub;
  }, []);

  const status = ai?.status;
  const visible = status === "downloading" || status === "loading-from-cache" || status === "loading";
  if (!visible) return null;

  const pct = typeof ai?.progress?.progress === "number"
    ? Math.round(Math.max(0, Math.min(1, ai.progress.progress)) * 100)
    : null;
  const label = status === "loading-from-cache"
    ? "Local AI: loading from cache" + (pct != null ? ` (${pct}%)` : "")
    : status === "downloading"
      ? "Local AI: downloading" + (pct != null ? ` (${pct}%)` : "")
      : "Local AI: checking status";

  return (
    <div title="Local AI is loading in the background. This never blocks gameplay."
      style={{
        position: "fixed", top: 12, right: 62, zIndex: 60,
        background: "rgba(10,14,12,.85)", border: `1px solid ${C.line}`,
        borderRadius: 8, color: C.faint, fontFamily: MONO, fontSize: 10.5,
        padding: "7px 10px", backdropFilter: "blur(4px)", pointerEvents: "none",
        whiteSpace: "nowrap",
      }}>
      {label}
    </div>
  );
}
