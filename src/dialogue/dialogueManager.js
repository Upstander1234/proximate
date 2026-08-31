// src/dialogue/dialogueManager.js — the single entry point every caller uses
// (F0 item 12: "clean interface equivalent to generateDialogue(context)").
// Nothing outside this file should import a provider directly.
//
// Tries tier 3 (local LLM, WebGPU) first, then tier 3b (WASM, the broad-
// compatibility fallback), then tier 2 (template), then tier 1
// (deterministic) — the graceful-degradation hierarchy F0 item 11 asks for.
// Both tier-3 backends are real (see dialogueProvider.js); the only
// environment where neither is ever available is a non-browser one (this
// project's own Node test scripts), where every caller correctly and
// structurally falls through to tier 2/1.

import { buildDialogueContext } from "./dialogueContext.js";
import { DeterministicProvider, TemplateProvider, LocalLLMProvider, WasmLLMProvider, progressStage, MODEL_DOWNLOAD_MB, WASM_MODEL_DOWNLOAD_MB } from "./dialogueProvider.js";

// F0 item 10: "Disabled -> deterministic/contextual fallback dialogue." A
// real on/off flag the player controls from Settings (SettingsOverlay.jsx's
// "LOCAL AI DIALOGUE" row), stored on the save the same way every other
// preference on that screen is (g.volume/g.speed/g.procedureAssist).
//
// OPT-IN BY DEFAULT (reliability fix — see CLAUDE.md's LocalLLMProvider-
// lifecycle investigation): merely launching Proximate must not
// automatically start downloading a ~370MB model or attempting a WebGPU/WASM
// load — that has to be something the player affirmatively turns on. So an
// UNSET preference (`undefined` — a save/session that has never touched this
// setting) now means DISABLED, not enabled: only `s.localAiEnabled === true`
// counts as opted in. A save that was PREVIOUSLY given an EXPLICIT value
// (true or false, e.g. by clicking Settings' Enable/Disable chip before this
// fix) keeps that exact value either way — this only changes the MEANING of
// "never touched," not of an explicit prior choice. Every tier-3 call site
// MUST route through this — checked once here rather than duplicated at each
// caller, so a future call site (crew reactions, treatment-response) gets the
// gate for free just by calling generateDialogue/requestLocalUpgrade.
export function isLocalAiEnabled(s) {
  return s?.localAiEnabled === true;
}

const deterministic = new DeterministicProvider();
const template = new TemplateProvider();
const localLLM = new LocalLLMProvider();
// Tier 3b: the broad-compatibility WASM/CPU fallback (real user proposal,
// 2026-08-27 — see dialogueProvider.js's own header on WasmLLMProvider for
// the full citation). Tried only when WebGPU is absent or its own provider
// failed, never in addition to a working WebGPU path, since WASM/CPU
// generation is materially slower and WebGPU is strictly better when it
// works.
const wasmLLM = new WasmLLMProvider();

// Cooldowns/probabilities for UNPROMPTED patient dialogue (item 19) — kept
// here, not per-caller, so every scene in the game gets the same pacing.
const UNPROMPTED_MIN_GAP_SEC = 45;
const UNPROMPTED_BASE_CHANCE_PER_TICK = 0.02; // scaled by distress below

export async function generateDialogue(event, s, v) {
  const ctx = buildDialogueContext(s, v);
  if (!ctx) return null;
  if (isLocalAiEnabled(s)) {
    if (localLLM.isAvailable()) {
      try {
        const r = await localLLM.generate(event, ctx);
        if (r) return r;
      } catch { /* fall through to WASM tier, then 2/1 — an LLM failure must never block dialogue */ }
    }
    // Tier 3b: only reached when WebGPU is genuinely absent or its own
    // provider just failed above — never raced against a working WebGPU
    // path (item 11's hierarchy gains one real rung, not a duplicate one).
    if (wasmLLM.isAvailable()) {
      try {
        const r = await wasmLLM.generate(event, ctx);
        if (r) return r;
      } catch { /* fall through to tier 2/1 */ }
    }
  }
  return template.generate(event, ctx) || deterministic.generate(event, ctx);
}

// Synchronous convenience path for callers that can't await (the App.jsx
// tick loop mutates a plain object synchronously inside setG — there is no
// render-cycle seam to suspend on). Honest today because localLLM is never
// available, so the async branch in generateDialogue() above never actually
// runs; when a real tier-3 backend lands, tick-loop callers will need to
// move to a queued/async pattern (request now, render the answer once it
// resolves) — a real, expected migration at that point, not a gap today.
export function generateDialogueSync(event, s, v) {
  const ctx = buildDialogueContext(s, v);
  if (!ctx) return null;
  return template.generate(event, ctx) || deterministic.generate(event, ctx);
}

// Reports whether ANY real dialogue backend beyond the deterministic/
// template tiers is present — the honest, always-current answer to F0 item
// 26's "AI status UI," without a caller needing to know provider internals.
// `status` is the finer-grained state (unavailable/idle/loading/ready/failed)
// for a future minimal indicator; `available` stays boolean for existing
// callers (DialoguePanel) that only need the coarse answer.
export function localAiStatus() {
  const available = localLLM.isAvailable() || wasmLLM.isAvailable();
  return {
    available,
    tier: localLLM.isAvailable() ? "local-llm" : wasmLLM.isAvailable() ? "wasm-llm" : "template",
    status: localLLM.isAvailable() ? localLLM.status() : wasmLLM.status(),
  };
}

// Which real backend a dialogue call would ACTUALLY use right now — the
// exact same precedence generateDialogue()/requestLocalUpgrade() apply
// (WebGPU first, WASM only once WebGPU is genuinely absent or has failed).
// Exists so a status UI reports the honest, currently-relevant backend
// instead of always describing WebGPU specifically, which used to read as
// "UNSUPPORTED — no WebGPU" on the (common) no-WebGPU-but-WASM-works device
// — actively wrong, since dialogue works fine there via the WASM tier.
//
// Reliability fix: `localLLM.isAvailable()`/`wasmLLM.isAvailable()` are both
// defined as "supported AND not currently failed" — so the instant WebGPU
// genuinely fails, this used to fall straight through to reporting "wasm",
// EVEN IF the WASM tier had never been touched (still sitting at its own
// untouched, technically-"available" idle state). A real WebGPU failure was
// silently reported as a generic, uninformative "not yet downloaded (via
// WebAssembly)" instead of the actual, more useful failure it was — found
// while investigating a Worker-isolation-batch test failure and confirmed,
// by testing against the pre-Worker code too, to predate that batch
// entirely (introduced whenever WasmLLMProvider/activeAiBackend were first
// added, without this exact interaction being checked). Fixed by only
// letting WASM take over the report once it has genuinely been ENGAGED
// (`status() !== "idle"` — attempted, downloading, ready, or itself
// failed), not merely because it happens to be untouched-and-available;
// short of that, a device with real WebGPU support keeps reporting WebGPU's
// own actual state (including a genuine failure), which is the more
// informative, currently-relevant answer for a status UI to show.
function activeAiBackend() {
  if (localLLM.isAvailable()) return "webgpu";
  if (wasmLLM.isAvailable() && wasmLLM.status() !== "idle") return "wasm";
  if (typeof navigator !== "undefined" && navigator.gpu) return "webgpu";
  if (wasmLLM.isAvailable()) return "wasm";
  return "none";
}

// F0 item 4 (boot screen) / item 26 (AI status UI) surface. Reports
// whichever backend `activeAiBackend()` says is actually in play, not
// always LocalLLMProvider — a real, previously-open gap (CLAUDE.md's own
// F0 status paragraph: "No boot/Settings UI surfaces which WASM-tier config
// is active"). `progress` is the real {progress,text} report from that
// backend's own load callback, or null before any load has started — never
// an invented percentage.
export function getLocalAiState() {
  const backend = activeAiBackend();
  const active = backend === "wasm" ? wasmLLM : localLLM;
  return {
    // NEW: which real backend this state describes — "webgpu" | "wasm" |
    // "none". A status UI can use this to say WHICH tier it's reporting on
    // instead of assuming WebGPU.
    backend,
    // `supported` used to mean "navigator.gpu present" specifically — that
    // reading is what made a WebGPU-less-but-WASM-capable device (the
    // common case) show "UNSUPPORTED," which was never true once the WASM
    // tier shipped. Now means "some real local-inference backend can run
    // here." `webgpuSupported` keeps the original, narrower WebGPU-only
    // answer for anything that specifically needs it.
    supported: backend !== "none",
    webgpuSupported: typeof navigator !== "undefined" && !!navigator.gpu,
    status: active.status(),
    progress: active._progress,
    // F0 item 8: "unknown" until checkCache() has resolved at least once,
    // then the real "cached"/"not-cached" answer (WebGPU tier only — the
    // WASM tier has no equivalent pre-check API, see WasmLLMProvider's own
    // constructor comment, and stays "unknown" by honest construction).
    cacheState: active.cacheState(),
    // F0 item 5: "not-started" | "early" | "meaningful" (>=~20%) | "ready"
    // — a real classification of the ACTIVE backend's own progress, never
    // a fabricated stage. See dialogueProvider.js's progressStage().
    progressStage: progressStage(active._progress?.progress),
    // F0 item 10: "showing download size" — the real, fixed size the
    // ACTIVE backend downloads (dialogueProvider.js's own MODEL_DOWNLOAD_MB/
    // WASM_MODEL_DOWNLOAD_MB), not a guess and not always the WebGPU figure.
    downloadSizeMB: backend === "wasm" ? WASM_MODEL_DOWNLOAD_MB : MODEL_DOWNLOAD_MB,
    // Reliability fix (real user report: WebGPU-capable hardware where
    // local AI failed to load with no diagnostic and no way to retry
    // without a full page reload). A dev-diagnosable classification of the
    // ACTIVE backend's last real failure ("timeout"|"device"|"network"|
    // "unknown"|null) and how many load attempts have failed this session.
    errorKind: active._lastErrorKind,
    failCount: active._failCount,
  };
}

// Reliability fix: a real, player-triggerable retry that genuinely
// re-attempts a fresh engine load — clears the `_failed` latch and any
// stale `_loadPromise` on the real singleton (not a second/mock object) and
// calls _ensureEngine()/_ensurePipeline() again for real. Exposed here so
// SettingsOverlay's "Retry" control (status==="failed") calls back into the
// real provider rather than decorating a button that does nothing. Retries
// whichever backend getLocalAiState() is currently reporting on (a failed
// WebGPU load retries WebGPU; once that backend has genuinely dropped out
// and WASM is the active one, Retry retries WASM instead) — the same
// precedence every other caller in this file already follows, not a second
// policy. Also used internally by LocalLLMProvider's own one-shot automatic
// retry for a failure that looks transient (see dialogueProvider.js's
// _maybeAutoRetry).
export function retryLocalAi() {
  return (activeAiBackend() === "wasm" ? wasmLLM : localLLM).retry();
}

// Starts the real model download/compile early so the boot screen's AI
// panel has genuine progress to show, without ever blocking boot (the boot
// screen calls this and immediately renders "Continue without AI" — see
// BootScreen.jsx). No-op if unsupported, already loading, or already
// loaded — and now ALSO a no-op if the player hasn't opted in (see
// isLocalAiEnabled's own comment: reliability fix, merely launching the game
// must not silently start a ~370MB download). `s` is the live game-state
// object (the same shape isLocalAiEnabled/generateDialogue/
// requestLocalUpgrade already take) — BootScreen.jsx passes its own `g`.
// Preloads whichever backend is REALLY going to be used: if this
// device has no WebGPU at all, WASM is the only real path, so it starts
// immediately rather than waiting for the first live dialogue event mid-
// scene to discover that and pay the download latency then. If WebGPU is
// present, it's tried first as usual — but this also subscribes to its own
// progress so that if/when it genuinely fails, the WASM fallback starts
// downloading right away too, instead of a later dialogue event having to
// wait out a fresh download on top of already having waited out the failed
// WebGPU attempt.
export function preloadLocalAi(s) {
  if (!isLocalAiEnabled(s)) return;
  if (typeof navigator !== "undefined" && navigator.gpu) {
    localLLM.preload();
    localLLM.subscribeProgress(() => {
      if (localLLM.status() === "failed") wasmLLM.preload();
    });
  } else {
    wasmLLM.preload();
  }
}

// Subscribe to real load-progress updates (F0 item 4). Returns an
// unsubscribe function. Fires once immediately with the current snapshot.
// Subscribes to BOTH backends, not just localLLM: getLocalAiState() can now
// report either one (see activeAiBackend()), so a caller only listening to
// the WebGPU provider's own progress stream would miss every update once
// WASM becomes the active backend (e.g. this device has no WebGPU, or the
// WebGPU load just failed and preloadLocalAi()'s own fallback kicked in).
export function subscribeLocalAiProgress(cb) {
  const unsubGpu = localLLM.subscribeProgress(() => cb(getLocalAiState()));
  const unsubWasm = wasmLLM.subscribeProgress(() => cb(getLocalAiState()));
  return () => { unsubGpu(); unsubWasm(); };
}

// F0 item 8: a standalone, read-only cache check that does NOT start a
// download or compile — for a caller that wants to know "is this model
// already on disk" independent of load status, and for this project's own
// direct-function cache-detection test (tools/browser/verifyLocalAiCache.mjs)
// that seeds a real Cache API entry and confirms this reports it correctly,
// since a real download can't be exercised in this headless environment.
export function checkLocalAiCache() {
  return localLLM.checkCache();
}

// A caller that CANNOT await (the tick loop's own synchronous setG(s=>...)
// reducer — see generateDialogueSync's own comment above) already renders an
// immediate tier-2/1 line via generateDialogueSync. This lets that same
// caller ALSO try a real tier-3 upgrade in the background, fire-and-forget,
// without blocking anything (item 27): if a local model is available and
// finishes generating before its own timeout, `onResolved(line)` is called
// once, later, outside the tick loop's own synchronous update — the caller
// is responsible for patching whatever UI/log entry it already rendered
// (e.g. replacing the tier-2 line's text with the tier-3 one) via its own
// state setter. If tier 3 is unavailable or fails for any reason,
// `onResolved` is simply never called — the tier-2/1 line already shown
// stands as the final answer, which is exactly item 11's graceful
// degradation: nothing about the immediate gameplay experience depends on
// this ever resolving.
export function requestLocalUpgrade(event, s, v, onResolved) {
  // F0 item 10's real gate: disabling the settings toggle must stop Tier 3
  // from ever firing, not just hide a UI element. Checked FIRST, before
  // isAvailable() even runs, so a disabled player never pays the cost of the
  // check either — the tier-2/1 line already rendered by the caller stands
  // as the final answer, same as the "unavailable" path below.
  if (!isLocalAiEnabled(s)) return;
  const provider = localLLM.isAvailable() ? localLLM : (wasmLLM.isAvailable() ? wasmLLM : null);
  if (!provider) return;
  const ctx = buildDialogueContext(s, v);
  if (!ctx) return;
  provider.generate(event, ctx)
    .then((line) => { if (line) onResolved(line); })
    .catch(() => { /* silent — the tier-2/1 line already shown is the real answer */ });
}

// Should the patient say something on their OWN, right now, with nobody
// having asked? Personality/anxiety/severity-scaled probability with a hard
// cooldown, per item 19 ("never constantly interrupting the player").
// `lastSpokeAt`/`now` are both in the scenario's own sim-time seconds (s.t).
export function shouldSpeakUnprompted(ctx, lastSpokeAt, now) {
  if (!ctx || ctx.patient.consciousness !== "awake") return false;
  if (lastSpokeAt != null && now - lastSpokeAt < UNPROMPTED_MIN_GAP_SEC) return false;
  const chance = UNPROMPTED_BASE_CHANCE_PER_TICK * (0.4 + ctx.patient.distress + ctx.patient.personality.talkative * 0.5);
  return Math.random() < chance;
}

// Picks which unprompted event type fits the patient's current state —
// pain-driven complaint vs. general anxious question vs. "something's
// wrong" as distress climbs.
export function pickUnpromptedEvent(ctx) {
  if (ctx.patient.painLevel >= 6) return { type: "pain_unprompted" };
  if (ctx.patient.distress >= 0.6) return { type: "deterioration_unprompted" };
  return { type: "anxious_unprompted" };
}

// Bounded memory helper — a short rolling window of recently-said lines
// (item 14/22), not the full call log. Callers own the array itself
// (s.dialogueMemory); this just enforces the cap in one place.
const MEMORY_CAP = 6;
export function pushDialogueMemory(memory, text) {
  return [...(memory || []), text].slice(-MEMORY_CAP);
}

// DEV-ONLY (F0 item 29): run the tier2/tier1 chain against a hand-supplied
// context instead of a real physio()-derived one, so a developer can test
// dialogue without playing a full call. Deliberately still routed through
// this module rather than importing the providers directly elsewhere — the
// "single entry point" rule (item 12) applies to test tooling too. Tier 3
// is skipped here on purpose: LocalLLMProvider always returns isAvailable()
// false, and a synthetic ctx wouldn't satisfy its real interface anyway.
export function generateDialogueFromContext(event, ctx) {
  return template.generate(event, ctx) || deterministic.generate(event, ctx);
}

// DEV-ONLY TEST HOOK — mirrors App.jsx's own established
// `__proximateTestSetState`/`__proximateTestGetState` convention (see
// tools/browser/driver.mjs), gated the same way on `import.meta.env.DEV` so
// it never ships in a production build. Exists because no environment
// available to this project has a real working WebGPU adapter (see CLAUDE.md's
// F0 status paragraph) — a verification script can never observe
// LocalLLMProvider's status() genuinely reach "ready"/"downloading" live, so
// this lets a script force the SAME real singleton's internal fields
// directly (not a mock/second object) and re-emit a real progress event
// through the SAME `_progressListeners` every real subscriber
// (AiDownloadIndicator, AiReadyNotice, SettingsOverlay's LOCAL AI DIALOGUE
// row, BootScreen) uses, so their real rendering logic runs against a real
// (forced) state transition.
if (typeof window !== "undefined" && import.meta.env.DEV) {
  window.__proximateTestForceLocalAi = (patch = {}) => {
    if ("progress" in patch) localLLM._progress = patch.progress;
    if ("cacheState" in patch) localLLM._cacheState = patch.cacheState;
    if ("failed" in patch) localLLM._failed = patch.failed;
    if ("engineReady" in patch) localLLM._engine = patch.engineReady ? { __test: true } : null;
    // A fake-but-real-shaped engine (only the `chat.completions.create` seam
    // generate() actually calls) — lets a script exercise the REAL
    // buildPrompt/sanitize/timeout code path end to end without a working
    // WebGPU adapter, distinct from `engineReady` above which only fakes
    // status() without a callable chat surface.
    if ("engineStub" in patch) {
      localLLM._engine = patch.engineStub
        ? { chat: { completions: { create: async () => ({ choices: [{ message: { content: patch.engineStubText || "Test line from stub engine." } }] }) } } }
        : null;
    }
    if ("loading" in patch) localLLM._loadPromise = patch.loading ? new Promise(() => {}) : null;
    // Reliability-fix test support: let a script set the diagnostic error
    // classification directly (so it can assert the Settings/boot UI shows
    // the right kind-specific text without waiting on a real 45s timeout),
    // and let a script stub `_loadBackend` so a REAL call into retry()/
    // _ensureEngine() (e.g. a real click on Settings' Retry button) can
    // genuinely succeed and reach "ready" without a working WebGPU adapter
    // — this is the one seam that lets the retry PATH itself (not just the
    // flag flip) be exercised end to end in this no-adapter environment.
    if ("errorKind" in patch) localLLM._lastErrorKind = patch.errorKind;
    if ("stubBackend" in patch) {
      localLLM._loadBackend = patch.stubBackend
        ? async () => ({
            hasModelInCache: async () => false,
            // Worker-isolation batch: _ensureEngine() calls
            // CreateWebWorkerMLCEngine, not CreateMLCEngine directly — stub
            // the same shape so a real click into retry()/_ensureEngine()
            // still reaches "ready" without a working WebGPU adapter or a
            // real Worker/postMessage round trip.
            CreateWebWorkerMLCEngine: async (worker, id, opts) => {
              opts?.initProgressCallback?.({ progress: 1, text: "ready" });
              return { chat: { completions: { create: async () => ({ choices: [{ message: { content: patch.stubBackendText || "Stub retry line." } }] }) } } };
            },
          })
        : LocalLLMProvider.prototype._loadBackend.bind(localLLM);
    }
    for (const cb of localLLM._progressListeners) cb(localLLM._progress);
  };
}
