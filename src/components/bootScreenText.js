// src/components/bootScreenText.js — the pure, non-component status/messaging
// logic behind BootScreen.jsx's AI panel, pulled into its own plain .js
// module (not the .jsx file itself) so it can be `export`ed for a direct
// Playwright test without tripping the same react-refresh/only-export-
// components lint rule App.jsx already carries a pre-existing exemption
// for (CLAUDE.md's baseline) — a .jsx file that exports anything besides
// its default component breaks Fast Refresh; a plain .js helper module has
// no such constraint, and is otherwise identical in behavior.

import { C } from "../theme.js";

export function aiStatusLine(ai) {
  // `ai.backend` (dialogueManager.js's getLocalAiState()) says which real
  // backend this status describes — "webgpu" | "wasm" | "none". Only "none"
  // (no WebGPU AND no WebAssembly — effectively unreachable in any browser
  // this project targets) is genuinely unsupported. A WebGPU-less device
  // with real WASM support (the common case) is NOT unsupported — it just
  // runs the broader-compatibility WASM tier instead, and used to be
  // wrongly reported as "no WebGPU" here even though dialogue works fine.
  if (!ai.supported) return { text: "UNSUPPORTED — this browser/device supports neither WebGPU nor WebAssembly", color: C.faint };
  const via = ai.backend === "wasm" ? " (via WebAssembly, broad-compatibility mode)" : "";
  switch (ai.status) {
    case "ready": return { text: `READY${via} — local AI dialogue is active`, color: C.hr };
    // F0 item 8: LocalLLMProvider.status() (dialogueProvider.js) now reports
    // a genuinely different string for each case, driven by the real
    // web-llm hasModelInCache() answer (checkCache()) rather than
    // collapsing every in-progress load into one "loading" label.
    case "loading-from-cache":
    case "downloading":
    case "loading": {
      const pct = ai.progress && typeof ai.progress.progress === "number"
        ? ` ${Math.round(ai.progress.progress * 100)}%` : "";
      const text = ai.progress?.text ? ` — ${ai.progress.text}` : "";
      const label = ai.status === "loading-from-cache" ? "LOADING FROM CACHE"
        : ai.status === "downloading" ? "DOWNLOADING"
        : "CHECKING FOR CACHED MODEL"; // brief: cache check itself in flight
      return { text: `${label}${pct}${text}`, color: C.amber };
    }
    case "failed": {
      // Reliability fix: distinguish WHY it failed when the classification
      // is confident enough to say something useful, without ever
      // implying this blocks anything — the game already works fine
      // without it (item 9's own standing "never permanently AI-gated"
      // rule), stated explicitly here so the message can't read as an
      // error the player needs to fix.
      // "device" investigation (real Windows/Edge user report, "Unable to
      // find a compatible GPU... No available adapters", alongside Chrome's
      // own "The powerPreference option is currently ignored when calling
      // requestAdapter() on Windows" console warning): checked web-llm's
      // actual source (node_modules/@mlc-ai/web-llm/lib/index.js) before
      // writing this text, not assumed. `CreateMLCEngine`'s `reload()` calls
      // the library's internal `detectGPUDevice()` with NO arguments, so it
      // always uses the hardcoded default `powerPreference: "high-performance"`
      // — there is no engine-config field (`MLCEngineConfig` is only
      // `appConfig`/`initProgressCallback`/`logitProcessorRegistry`/
      // `logLevel`, confirmed against config.d.ts) to vary that hint, and no
      // way to hand the library a pre-obtained `GPUAdapter`/`GPUDevice`
      // instead of letting it call `navigator.gpu.requestAdapter()` itself.
      // Combined with Chromium's own warning that Windows ignores the
      // requested value entirely, a retry with a different powerPreference
      // would call the exact same underlying adapter request and fail the
      // exact same way — so no retry was built for this case (see
      // CLAUDE.md's dated entry for the full trail); this hint is the
      // genuine, actionable alternative instead of a decorative retry.
      // The GPU-driver hint below only makes sense for a WebGPU failure —
      // gated on `ai.backend==="webgpu"` (not just `errorKind==="device"`)
      // since this "failed" case can now also mean the WASM fallback
      // itself failed (a genuinely rarer, different situation with no
      // GPU-driver angle to advise on).
      const isWebgpu = ai.backend === "webgpu";
      const suffix = ai.errorKind === "timeout" ? " (the model took too long to load)"
        : ai.errorKind === "network" ? " (a network problem while downloading the model)"
        : (ai.errorKind === "device" && isWebgpu) ? " (this device rejected local AI, even though it reports WebGPU support)"
        : "";
      const deviceHint = (ai.errorKind === "device" && isWebgpu)
        ? " If you want to try enabling it: check that hardware acceleration is turned on in your browser's settings, make sure your GPU drivers are up to date, and check your browser's own WebGPU status page (edge://gpu or chrome://gpu)."
        : "";
      return { text: `UNAVAILABLE. Local AI failed to load on this device${suffix}. Contextual dialogue is used instead; nothing about the medical simulation is affected.${deviceHint}`, color: C.faint };
    }
    default: return { text: `SUPPORTED${via} — not yet started`, color: C.dim };
  }
}

// F0 item 5: "once core assets are ready AND ~20% of the model has
// downloaded, offer Continue without AI." Core assets are already ready by
// construction (BootScreen.jsx's own CORE_ITEMS render instantly) and
// Continue is already always clickable (item 9) — so what this function
// adds is purely the MESSAGING tone beneath the button, keyed off the real
// `progressStage` classification (dialogueManager.getLocalAiState(), backed
// by dialogueProvider.js's pure progressStage()) rather than a second gate.
// Below ~20%, nothing meaningful has happened yet, so the honest framing is
// "don't wait." At/above ~20%, real progress exists, so the framing shifts
// to "you can start now, it'll keep going" — still never implying the
// player must wait, per item 9.
export function continueHint(ai) {
  switch (ai.progressStage) {
    case "meaningful":
      return "Local AI is still downloading, but real progress exists. Continue now, it keeps loading in the background.";
    case "early":
      return "Local AI has barely started downloading. No need to wait, continue whenever you like.";
    default:
      return "Local AI keeps loading in the background. Dialogue works normally either way.";
  }
}
