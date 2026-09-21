// src/dialogue/dialogueProvider.js — the swappable inference backends behind
// the Dialogue Manager (F0 items 1, 12). Every provider implements the same
// shape: `isAvailable()` (sync, cheap, safe to call every event) and
// `generate(event, ctx)` (returns a line synchronously for tiers 1-2, or a
// Promise for a real async backend like tier 3).
//
// TIER 1 — DeterministicProvider: fixed, always-correct acknowledgement
// lines. No variation, no personality — used when nothing richer is needed
// or available.
//
// TIER 2 — TemplateProvider: contextual templates keyed by event type, with
// several variants selected by personality/severity so two patients with the
// same event don't sound identical (F0 item 16), plus simple variable
// substitution (name, painLevel, etc).
//
// TIER 3 — LocalLLMProvider: THE REAL LOCAL-INFERENCE BACKEND (F0 items
// 2-3/11/21/27, first real slice — a following slice still owes the
// boot/loading screen, progressive/resumable download UI, and the settings
// toggle, items 4-10). Uses @mlc-ai/web-llm (WebGPU-only in-browser
// inference, MIT-licensed, actively maintained — verified against the
// installed package, v0.2.84 as of this slice) with a small, pre-quantized
// instruction model, Qwen2.5-0.5B-Instruct-q4f16_1-MLC — chosen per item 3's
// own criteria: ~0.5B params / ~370MB int4 download (small for a free web
// game, unlike a 1-2GB 7B model), runs entirely client-side with no
// server-side inference cost, and is small enough to generate a short line
// in well under a second on ordinary consumer WebGPU hardware. web-llm has
// no WASM-only CPU fallback for actual generation (it requires WebGPU to run
// the compiled compute kernels) — so `isAvailable()` below does real
// feature detection on `navigator.gpu`, and a browser without WebGPU
// correctly reports unavailable rather than attempting a slow/broken CPU
// path; this is the "broadly compatible... don't assume Chromium-only"
// requirement (item 2) satisfied by DETECTING the real constraint rather
// than papering over it with a fake WASM backend that would be too slow to
// be useful for this project's item-3 latency bar anyway.
//
// The whole model-loading/inference module is dynamically imported (see
// `_loadBackend()` below) so `@mlc-ai/web-llm` never lands in the app's main
// JS chunk — confirmed via `npx vite build`'s own per-chunk output, see
// CLAUDE.md's F0 status paragraph for the measured chunk size.
//
// isAvailable() is a cheap, synchronous, side-effect-free check — safe to
// call on every dialogue event, per this file's own header contract. Actual
// model download/compile only happens lazily, on the FIRST tier-3-eligible
// call that a caller actually awaits (dialogueManager's async
// generateDialogue() path) — never on module load, never blocking startup,
// per item 27 ("never block rendering/input/procedures/timers/physiology").
// A caller that cannot await (the tick loop's own generateDialogueSync path)
// never reaches this class at all; see dialogueManager.js's
// `requestLocalUpgrade` for how a sync caller can still get a tier-3 line,
// asynchronously, without blocking its own immediate (tier 1/2) line.

import { bucketForEmotionalState } from "./emotionalState.js";

export class DeterministicProvider {
  isAvailable() { return true; }
  generate(event) {
    const line = DETERMINISTIC_LINES[event.type];
    if (!line) return null;
    return { speaker: event.speaker || "patient", text: line, tier: "deterministic" };
  }
}

const DETERMINISTIC_LINES = {
  order_ack: "Got it.",
  order_ack_crew: "On it.",
};

// Model choice, per F0 item 3's own criteria (stated once, here, since this
// is the file that owns the choice): Qwen2.5-0.5B-Instruct, int4-quantized
// (q4f16_1), one of web-llm's smallest chat-tuned prebuilt models. ~0.5B
// params keeps first-token latency and tokens/sec usable on mid-range
// consumer GPUs (this project's own simulation is the thing that needs the
// device's real compute budget, not the dialogue layer — item 3's "the
// LLM's job is tone/personality/continuity, not reasoning about medicine").
export const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
// Exposed for UI surfaces (boot screen, settings toggle — F0 item 10's
// "showing download size") that want to state the real download size without
// duplicating the number this file's own header comment already cites.
export const MODEL_DOWNLOAD_MB = 370;

// Hard ceilings so a slow/hung device degrades to tier 2 instead of leaving
// the player waiting indefinitely (item 11). Model load (first use only,
// then cached by web-llm's own IndexedDB cache — item 8's caching
// requirement, already provided by the library, not reimplemented here) gets
// a much longer budget than a single generation call.
const LOAD_TIMEOUT_MS = 45000;
const GENERATE_TIMEOUT_MS = 12000;

function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(`LocalLLMProvider: ${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

// Reliability fix, triggered by a real report from a genuinely
// WebGPU-capable user (not one of this project's own no-adapter test
// environments): "This device reports WebGPU support but local AI failed
// to load." Before this fix the real caught error was silently swallowed
// (stored on `_lastError`, never logged, never exposed to any UI surface)
// and `_failed` latched permanently for the rest of the session with no
// retry path of any kind — so a transient failure (a network blip on one
// of the ~370MB of model shards, a momentary OOM during WASM compile, a
// slow first-time GPU shader compile racing LOAD_TIMEOUT_MS) looked
// identical, forever, to genuinely unsupported hardware. This function
// classifies the real caught error into a small set of dev-diagnosable,
// player-explainable buckets — used both for the console.error below and
// for the retry policy (`_ensureEngine`'s catch block, `retry()`).
// Investigated and rejected, stated explicitly so a future session doesn't
// re-attempt this blind: a real "device"-classified failure report
// ("Unable to find a compatible GPU... No available adapters" on Windows/
// Edge, alongside Chromium's own "The powerPreference option is currently
// ignored when calling requestAdapter() on Windows" warning) raised the
// question of whether retrying the load with a different powerPreference
// hint, or a manually-obtained GPUAdapter/GPUDevice, could recover a
// hybrid-graphics machine where one power preference finds no adapter.
// Checked against the actual installed library source
// (node_modules/@mlc-ai/web-llm/lib/index.js), not assumed: `CreateMLCEngine`
// -> `MLCEngine.reload()` calls the library's own internal
// `detectGPUDevice()` with NO arguments, so it always uses that function's
// hardcoded default `powerPreference: "high-performance"` — there is no
// public option on `MLCEngineConfig` (only `appConfig`/
// `initProgressCallback`/`logitProcessorRegistry`/`logLevel`, per
// lib/config.d.ts) to vary it, and no way to hand the engine a pre-obtained
// `GPUAdapter`/`GPUDevice` instead of letting it call
// `navigator.gpu.requestAdapter()` itself. So even setting that aside,
// Chromium's own warning says Windows ignores the requested value
// entirely — meaning a retry with a different powerPreference would issue
// the exact same underlying adapter request and fail the exact same way.
// No genuine lever exists here, so no adapter-retry was built for the
// "device" classification; `bootScreenText.js`/`SettingsOverlay.jsx` instead
// got a short, real troubleshooting hint (hardware acceleration setting,
// GPU driver update, edge://gpu / chrome://gpu) as the honest alternative.
// Auto-retry policy for a load that failed in a way that LOOKS transient
// (network reset / timeout). Hugging Face's resolve endpoint randomly resets
// roughly half of connections from some networks, which the browser reports
// as a CORS/"Failed to fetch" error, so one automatic retry is not enough.
// Completed shard files persist in the browser cache between attempts, so
// every retry resumes where the last one stopped instead of starting over.
const AUTO_RETRY_DELAYS_MS = [2000, 4000, 8000, 15000, 30000, 45000];

function classifyLoadError(e) {
  const msg = String(e?.message || e || "").toLowerCase();
  if (msg.includes("timed out")) return "timeout";
  if (msg.includes("adapter") || msg.includes("webgpu") || msg.includes("gpu") || msg.includes("device"))
    return "device";
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("err_") || msg.includes("http"))
    return "network";
  return "unknown";
}

// A short, bounded system prompt built from the SAME structured context
// dialogueContext.js already produces (items 13-15) — never the raw
// simulation state, and nothing here can write back into it (item 21: the
// LLM only ever returns display text, see dialogueManager.js's own
// generate() caller for confirmation it's used as `.text` in a UI log entry
// and nowhere else).
function buildPrompt(event, ctx) {
  const p = ctx?.patient || {};
  const personality = p.personality || {};
  const traits = Object.entries(personality)
    .map(([k, v]) => `${k} ${Math.round((v ?? 0) * 100)}%`).join(", ") || "unknown";
  const recent = (ctx?.recentEvents || []).slice(-3).join(" | ") || "(none yet)";
  const crew = (ctx?.crew || []).map((c) => c.name).filter(Boolean).join(", ") || "none on scene";
  // F0 item 17: a structured emotional state the SIMULATION already decided
  // (emotionalState.js, derived from real pain/consciousness/trend — never
  // from this prompt or its response). Stated explicitly and separately from
  // the personality traits, with an instruction that it is fixed, so the
  // model's own job is confined to EXPRESSING it, not inventing or
  // overriding it — the same one-way boundary item 21 already draws around
  // physiology, applied here to emotional state specifically.
  const emotionalState = p.emotionalState || "calm";
  // F0 item 15's knowledge-boundary rule, enforced in the PROMPT itself for
  // the bystander speaker, not just in the hand-authored Tier-2 templates: a
  // bystander only ever gets the role label (never patient vitals, never a
  // diagnosis) and is explicitly told what they may and may not know, so a
  // Tier-3 upgrade of a bystander line can't drift into clinical territory
  // the way an unconstrained "roleplay this character" prompt could.
  const bystanderRole = ctx?.bystander?.role || "bystander";
  const speakerLine = event.speaker === "crew"
    ? "You are an EMS crew member on scene reacting to what just happened. Speak as the crew member, one short sentence, plain American English, no stage directions, no emoji, no em dashes."
    : event.speaker === "bystander"
    ? `You are the patient's ${bystanderRole}, a frightened family member/bystander on scene, NOT a medical provider. You only know what you personally witnessed and how you feel — you have no medical training and no access to vitals, diagnoses, or lab results, so never state or guess any of those. Speak as this frightened, non-medical person, one short sentence (under 20 words), plain American English, panicked or pleading register, no stage directions, no emoji, no em dashes.`
    : `You are a patient in an EMS call. Age ${p.age ?? "unknown"}. Personality: ${traits}. Consciousness: ${p.consciousness}. Pain level ${p.painLevel}/10. Current emotional state (already determined by the situation, not by you — express it, do not contradict or change it): ${emotionalState}. Speak as the patient, one short sentence (under 20 words), plain American English, no stage directions, no medical jargon a layperson wouldn't use, no emoji, no em dashes.`;
  return [
    speakerLine,
    `Situation: ${ctx?.situation?.scenarioTitle || "an emergency call"}, about ${ctx?.situation?.elapsedMin ?? 0} minutes in.`,
    `Crew present: ${crew}.`,
    `Recent moments: ${recent}.`,
    `What just happened: ${event.type.replace(/_/g, " ")}.`,
    "Reply with ONLY the line of dialogue itself, nothing else.",
  ].join("\n");
}

// Strips anything that would break this project's own player-facing-content
// rules (no em dashes — CLAUDE.md section 4) or leak model chatter (quote
// wrapping, a leading "Patient:"/"Crew:" label the model sometimes adds).
//
// A real, previously-shipped bug lived here: `.replace(/["']/g, "")` blanket-
// stripped EVERY apostrophe, not just the outer quote marks wrapping the
// whole line — so a real generated "She's acting fine now; don't worry
// about it!" came out "Shes acting fine now; dont worry about it!" every
// single time a contraction appeared. That is the single most common
// "grammatical error" this project's own dialogue transcripts have on
// record, and it was self-inflicted by this sanitizer, not the model. Fixed
// by only stripping a quote mark that WRAPS the whole trimmed string (the
// model quoting its own line, which it does sometimes), never one that
// appears mid-word.
//
// A second, real, still-live leak: the buildPrompt()/buildWasmPrompt() role
// line tells the model "You are a patient..."/"You are the crew member..."
// and a small instruct model very often echoes that role word back as its
// own speaker label ("Patient: I feel dizzy.") — sometimes wrapped in
// markdown emphasis (`**Patient:**`), sometimes with a parenthetical aside
// (`Patient (in pain): ...`), and occasionally stacked twice. The original
// regex only matched a single, plain "word:" at the very start, so any of
// those variants — or a second stacked label — leaked straight to the
// player as literal spoken text, which is what "the LLM keeps saying
// Patient: for everything" actually was: not the model talking ABOUT itself
// in third person, but an un-stripped role-label prefix on every line.
// Fixed to be genuinely permissive (leading markdown/quote noise, an
// optional short parenthetical before the colon) and applied in a loop so a
// doubled label is fully removed, not just the outer one.
const ROLE_LABEL_RE = /^[\s*_>#-]*["']?\s*(?:the\s+)?(patient|crew(?:\s*member)?|bystander|you)\b[^:\n]{0,30}:[\s*_]*/i;
function sanitize(text) {
  let t = text
    .replace(/—/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  for (let i = 0; i < 3 && ROLE_LABEL_RE.test(t); i++) t = t.replace(ROLE_LABEL_RE, "").trim();
  // Strip wrapping quotes only (both ends match the same quote character),
  // never an apostrophe inside a contraction like "don't" or "she's".
  if (t.length >= 2 && /^["']/.test(t) && t[0] === t[t.length - 1]) t = t.slice(1, -1).trim();
  // A role label with no real content left after it ("Patient:" with
  // nothing following, or the model just emitting the bare role word) is
  // not a real line — treated as empty so the caller's own empty-output
  // handling (throw / fall through to Tier 2) takes over, rather than
  // showing an empty or single-word "line."
  if (/^(patient|crew(?:\s*member)?|bystander|you)\.?$/i.test(t)) t = "";
  return t.slice(0, 200);
}

// A real, previously-documented WASM-tier failure mode: with `max_new_tokens`
// capped for short dialogue, a generation can be cut off mid-sentence
// ("...she whispered into her guitar case with a sigh and then continued to
// work on it until dawn broke outside as") — a genuine grammatical defect
// (an incomplete sentence with no terminal punctuation), not a "flavor"
// choice. Rather than showing that fragment, this trims back to the last
// complete sentence the model actually finished. If NOTHING before the cutoff
// ends in real sentence-ending punctuation, the whole line is too incomplete
// to show and this returns null, letting the caller fall through to the
// existing Tier-2 safety net (the same "prefer no line over a broken one"
// posture isDegenerateWasmOutput already established for echo/repetition).
function truncateToCompleteSentence(text) {
  const m = text.match(/^.*[.!?](?=[)\]"'”’]*(?:\s|$))/s);
  if (!m) return null;
  const trimmed = m[0].trim();
  return trimmed.length ? trimmed : null;
}

// F0 item 5: "once core assets are ready AND ~20% of the model has
// downloaded, offer Continue without AI" — the boot screen's Continue
// button is ALREADY always clickable from the first paint regardless of AI
// state (item 9, shipped in the boot-screen slice), so the ~20% mark isn't
// a GATE here (nothing was ever blocking the player). What item 5 actually
// asks this slice to add is the THRESHOLD-AWARE messaging: once real
// progress crosses ~20%, the tone changes from "nothing meaningful has
// happened yet, feel free to leave" to "real progress exists, but you don't
// have to wait for the rest of it." A pure, exported, synchronous function
// (not a class method) on purpose — this environment has no working WebGPU
// adapter to ever push a real download past 0%, so this is verified with
// synthetic values fed directly to the function, not observed live; keeping
// it pure and side-effect-free is what makes that a meaningful test rather
// than a mock.
export const PROGRESS_GATE_THRESHOLD = 0.2;
export function progressStage(progressFraction) {
  if (typeof progressFraction !== "number" || !Number.isFinite(progressFraction) || progressFraction <= 0) {
    return "not-started";
  }
  if (progressFraction >= 1) return "ready";
  if (progressFraction >= PROGRESS_GATE_THRESHOLD) return "meaningful";
  return "early";
}

export class LocalLLMProvider {
  constructor() {
    this._engine = null;
    this._loadPromise = null;
    // The dedicated Worker the engine actually runs in (Worker isolation —
    // see _ensureEngine's own comment). Held only so a future explicit
    // cleanup path (none exists today; this is a session-long singleton,
    // same as before) could terminate it — never torn down automatically.
    this._worker = null;
    this._failed = false;
    this._lastError = null;
    // Reliability fix (see classifyLoadError's own comment above): a
    // dev-diagnosable classification of the last real failure
    // ("timeout"|"device"|"network"|"unknown"), and whether this session
    // has already tried one automatic recovery attempt for it — both
    // exposed through getLocalAiState() so a UI can say something more
    // specific than a flat "failed to load" and so preload() knows
    // whether it's still owed a retry.
    this._lastErrorKind = null;
    this._failCount = 0;
    this._autoRetryCount = 0; // consecutive automatic retries used; reset on success
    // Real download/compile progress (F0 item 4's "detects... download in
    // progress" — the boot screen's AI panel subscribes to this rather than
    // faking a progress bar). web-llm's own `initProgressCallback` reports
    // `{progress: 0..1, text}` during CreateMLCEngine; nothing here invents a
    // number when the library isn't actually reporting one.
    this._progress = null; // {progress, text} | null
    this._progressListeners = new Set();
    // F0 item 8 (persistent model caching): "unknown" until checkCache()
    // resolves, then "not-cached" or "cached" — a real answer from
    // web-llm's own hasModelInCache(), never guessed. Exposed so the boot
    // screen can tell "downloading" apart from "loading from cache" instead
    // of collapsing both into one "loading" status.
    this._cacheState = "unknown";
  }

  // Real cache-detection (F0 item 8), run BEFORE calling CreateMLCEngine so
  // the caller can tell the player whether this launch is about to download
  // ~370MB or load an already-downloaded model from disk. Uses web-llm's own
  // exported hasModelInCache(modelId, appConfig) — see the mechanism note in
  // this file's header for what that function actually checks (every shard
  // file named in the model's own tensor-cache.json manifest must already be
  // present in the browser's Cache API storage under web-llm's own
  // "webllm/model" scope; see CLAUDE.md's F0 item-8 entry for the full
  // citation trail). Safe to call repeatedly; never throws — any failure
  // (browser has no Cache API, model id not in the prebuilt catalog, etc.)
  // is reported as "not-cached" rather than propagated, since a caching
  // check must never be able to block or crash the boot sequence.
  async checkCache() {
    try {
      const webllm = await this._loadBackend();
      const has = await webllm.hasModelInCache(MODEL_ID);
      this._cacheState = has ? "cached" : "not-cached";
    } catch {
      // The check itself failed (no Cache API in this context, model id not
      // in the prebuilt catalog, etc.) — reported as "unknown", distinct
      // from a real "not-cached" answer, so a caller never mistakes "we
      // couldn't tell" for "confirmed absent."
      this._cacheState = "unknown";
    }
    return this._cacheState;
  }

  cacheState() {
    return this._cacheState;
  }

  // F0 item 4 plumbing: a UI (boot screen) can subscribe to real load
  // progress without importing web-llm itself or reaching into engine
  // internals. Returns an unsubscribe function. Fires immediately with the
  // current snapshot so a late subscriber doesn't have to wait for the next
  // tick to see where things stand.
  subscribeProgress(cb) {
    this._progressListeners.add(cb);
    cb(this._progress);
    return () => this._progressListeners.delete(cb);
  }

  _emitProgress(p) {
    this._progress = p;
    for (const cb of this._progressListeners) cb(p);
  }

  // Real feature detection (item 2), not a hardcoded value. web-llm's
  // compute kernels require WebGPU — there is no usable WASM/CPU fallback
  // for actual token generation in this library, so `navigator.gpu` is the
  // real, correct gate. `_failed` latches after a hard failure (e.g. model
  // compile error, out-of-memory) so a device that genuinely can't run this
  // model doesn't retry a multi-second doomed load on every single dialogue
  // event for the rest of the session — it still re-evaluates `navigator.gpu`
  // fresh every call, so a transient failure never permanently mislabels a
  // capable device.
  isAvailable() {
    return typeof navigator !== "undefined" && !!navigator.gpu && !this._failed;
  }

  // Status for a future/minimal AI-status indicator (item 26) — DialoguePanel
  // already reads isAvailable() via localAiStatus(); this finer-grained
  // status is exposed for a caller that wants to distinguish "not yet tried"
  // from "downloading/compiling" from "ready" from "failed."
  status() {
    if (!this.isAvailable() && !this._engine) return this._failed ? "failed" : "unavailable";
    if (this._engine) return "ready";
    if (this._loadPromise) {
      // F0 item 8: distinguish a genuine first-time download from loading an
      // already-downloaded model back off disk, using the real cache read
      // from checkCache() (see that method's own citation of web-llm's
      // `hasModelInCache`) rather than collapsing both into one "loading"
      // state the way this provider did before this slice.
      if (this._cacheState === "cached") return "loading-from-cache";
      if (this._cacheState === "not-cached") return "downloading";
      return "loading"; // cache check itself hasn't resolved yet
    }
    return "idle";
  }

  async _loadBackend() {
    // Dynamic import keeps @mlc-ai/web-llm (and its own further dynamic
    // fetches of the model shards/WASM kernel) out of the app's main chunk —
    // confirmed via `npx vite build`'s per-chunk output (see CLAUDE.md). Used
    // ONLY for static exports the main thread itself needs directly
    // (hasModelInCache, for checkCache() below, and CreateWebWorkerMLCEngine,
    // for _ensureEngine() below) — never for constructing an MLCEngine
    // itself, which now always happens inside the Worker (see _ensureEngine).
    const webllm = await import("@mlc-ai/web-llm");
    return webllm;
  }

  async _ensureEngine() {
    if (this._engine) return this._engine;
    if (this._loadPromise) return this._loadPromise;
    this._loadPromise = (async () => {
      const webllm = await this._loadBackend();
      // F0 item 8: check the real cache state BEFORE starting the load, so
      // the very first progress event a subscriber sees already says
      // "loading from cache" instead of a generic "downloading" that turns
      // out to be wrong for a returning player. web-llm's own CreateMLCEngine
      // does the actual cache-vs-network decision per shard file internally
      // (see checkCache()'s own header comment for the citation) — this
      // check does not change what gets fetched, it only lets the UI say
      // the true thing about what's about to happen.
      if (this._cacheState === "unknown") await this.checkCache();
      this._emitProgress({
        progress: 0,
        text: this._cacheState === "cached" ? "loading model from cache" : "downloading model",
      });
      // Worker isolation (CLAUDE.md's LocalLLMProvider-lifecycle
      // investigation): the actual MLCEngine — WASM/shader compilation,
      // model-shard fetch, Cache API reads/writes, and the generation
      // forward pass — now runs inside a dedicated module Worker
      // (localLlmWorker.js), not on the main thread, so none of that work
      // can block a React re-render or an input handler (the volume slider,
      // etc). CreateWebWorkerMLCEngine (confirmed exported by the installed
      // @mlc-ai/web-llm@0.2.84, node_modules/@mlc-ai/web-llm/lib/index.js)
      // returns a WebWorkerMLCEngine — the same public interface as
      // MLCEngine (engine.chat.completions.create(...), etc.) — so nothing
      // downstream of this function (generate(), the timeout race) needed
      // to change. This IIFE only ever runs once per provider instance (the
      // this._engine/this._loadPromise guards above), so at most one Worker
      // and one engine are ever created for the life of the singleton —
      // requestLocalUpgrade()/generate() calling in while a load is already
      // in flight share this same promise, never spawning a second Worker.
      this._worker = new Worker(new URL("./localLlmWorker.js", import.meta.url), { type: "module" });
      const engine = await webllm.CreateWebWorkerMLCEngine(this._worker, MODEL_ID, {
        logLevel: "ERROR",
        // Real download/compile progress from the library itself, relayed
        // from the Worker via postMessage and forwarded to any boot-screen/
        // status-UI subscriber (see subscribeProgress above) — not
        // fabricated here, and not changed in shape by moving to a Worker.
        initProgressCallback: (report) => this._emitProgress(report),
      });
      this._engine = engine;
      this._autoRetryCount = 0;
      this._emitProgress({ progress: 1, text: "ready" });
      return engine;
    })();
    try {
      return await withTimeout(this._loadPromise, LOAD_TIMEOUT_MS, "model load");
    } catch (e) {
      this._failed = true;
      this._lastError = e;
      this._lastErrorKind = classifyLoadError(e);
      this._failCount++;
      this._loadPromise = null;
      // A failed load's Worker (if one was created before the failure) is
      // done and unreachable — terminate it so a retry's own fresh
      // `new Worker(...)` above doesn't leave the old one running
      // indefinitely in the background. Never throws: terminate() is a
      // synchronous no-op on an already-dead worker.
      if (this._worker) {
        this._worker.terminate();
        this._worker = null;
      }
      this._emitProgress(null);
      // Dev/diagnostic-only, never player-facing (see this function's own
      // reliability-fix comment above the classifier): the real caught
      // error/message from CreateMLCEngine or the timeout race, not just a
      // generic "failed" string, so a developer or a technical user
      // checking devtools can actually tell network error apart from
      // WebGPU device-lost apart from OOM apart from a genuine timeout.
      console.error(
        `LocalLLMProvider: model load failed (attempt ${this._failCount}, classified as "${this._lastErrorKind}"):`,
        e,
      );
      throw e;
    }
  }

  // Real retry path (reliability fix, see above): clears the latch and any
  // stale in-flight promise, then genuinely re-attempts _ensureEngine() —
  // used both by the one automatic retry below (for a failure that looks
  // transient) and by a player-triggered "Retry" control (Settings' LOCAL
  // AI DIALOGUE row). Safe to call even if a load is already in flight or
  // already succeeded (returns/awaits the existing state rather than
  // starting a second, redundant load).
  retry() {
    if (this._engine) return Promise.resolve(this._engine);
    if (this._loadPromise) return this._ensureEngine();
    this._failed = false;
    this._loadPromise = null;
    return this._ensureEngine();
  }

  // Called after modelImport.js has written the model into the browser cache:
  // clears any failure state and starts a real load, which now finds every
  // file cached (checkCache() reports "cached") and never needs the network.
  afterModelImport() {
    this._cacheState = "cached";
    this._autoRetryCount = 0;
    this._failed = false;
    return this.retry().catch(() => { /* status()/subscribeProgress already reflect the failure */ });
  }

  // Fire-and-forget preload (F0 item 4/5 "download in progress" support) —
  // lets the boot screen start the real download/compile early so its
  // progress panel has something honest to show, WITHOUT ever blocking
  // boot: callers never await this, and any failure just leaves status()
  // at "failed"/"unavailable" for the existing generate() fallback to
  // handle exactly as it already does. This is still a one-shot in-memory
  // load, not the resumable/persisted download of items 5-8 — that
  // remains open.
  preload() {
    if (!this.isAvailable() || this._engine || this._loadPromise) return;
    this._ensureEngine().catch(() => this._maybeAutoRetry());
  }

  // Reliability fix: automatic retries, with backoff, for a
  // failure that LOOKS transient (the load timed out, or a network blip
  // on one of the model's shard fetches) rather than a hard compile/
  // adapter-request rejection — a genuinely capable device deserves a
  // second attempt at a blip; a device that flatly can't run this
  // (unsupported/OOM/other hard rejection, classified "device"/"unknown")
  // is not retried automatically, since hammering a doomed load a second
  // time buys nothing and only delays the honest "failed" status. This is
  // a real, defensible split, not a perfect one — stated honestly rather
  // than pretending every failure mode is cleanly distinguishable. Up to
  // AUTO_RETRY_DELAYS_MS.length automatic attempts with growing backoff; a
  // player can still trigger further manual attempts via retry() (Settings'
  // Retry control), which is unlimited.
  _maybeAutoRetry() {
    if (this._lastErrorKind !== "timeout" && this._lastErrorKind !== "network") return;
    if (this._autoRetryCount >= AUTO_RETRY_DELAYS_MS.length) return;
    const delay = AUTO_RETRY_DELAYS_MS[this._autoRetryCount++];
    setTimeout(() => {
      if (this._engine || this._loadPromise) return; // already recovered or already retrying
      this.retry().catch(() => this._maybeAutoRetry());
    }, delay);
  }

  // Real generateDialogue(context)-equivalent call for tier 3. Throws on any
  // failure (unavailable, load failure, timeout, empty output) rather than
  // returning a fake line — dialogueManager.js's caller already wraps this
  // in try/catch and falls through to tier 2/1 on ANY throw (item 11's
  // graceful-degradation hierarchy), so failure here is a normal, expected,
  // silently-recovered path, not an error state the player ever sees.
  async generate(event, ctx) {
    if (!this.isAvailable()) throw new Error("LocalLLMProvider unavailable (no WebGPU, or a prior load failed)");
    let engine;
    try {
      engine = await this._ensureEngine();
    } catch (e) {
      this._maybeAutoRetry();
      throw e;
    }
    const prompt = buildPrompt(event, ctx);
    const reply = await withTimeout(
      engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 48,
        temperature: 0.85,
      }),
      GENERATE_TIMEOUT_MS,
      "generation",
    );
    const raw = reply?.choices?.[0]?.message?.content;
    if (!raw || !raw.trim()) throw new Error("LocalLLMProvider: empty output");
    let text = sanitize(raw);
    if (!text) throw new Error("LocalLLMProvider: output sanitized to nothing");
    // Same mid-sentence-cutoff fix as WasmLLMProvider (see
    // truncateToCompleteSentence's own header) — trim to the last sentence
    // this tier actually finished. Unlike the WASM tier, a miss here (no
    // complete sentence found) falls back to the untrimmed text rather than
    // throwing: this larger model's own instruction-following is already
    // measurably more reliable (CLAUDE.md's own real A/B record), so being
    // conservative about rejecting its output is the safer default here.
    text = truncateToCompleteSentence(text) || text;
    // tier is "local-llm" — a distinct, honest tag from "template"/
    // "deterministic" (DialoguePanel/mechanismWiring-style callers can rely
    // on this to know which tier actually produced a given line).
    return { speaker: event.speaker || "patient", text, tier: "local-llm" };
  }
}

// TIER 3b — WasmLLMProvider: the broad-compatibility fallback the WebGPU
// path (LocalLLMProvider above) cannot itself provide. Real user report
// (2026-08-27, Windows/Edge, "No available adapters" — investigated and
// confirmed unfixable at the app level, see this file's classifyLoadError
// header and CLAUDE.md's F0 history) plus that same user's own architectural
// proposal: @mlc-ai/web-llm has NO WASM/CPU fallback for actual generation
// (confirmed above), but a SECOND, independent backend can — Transformers.js
// (published as `@huggingface/transformers`, the successor to the
// `@xenova/transformers` name; version installed and checked directly for
// this slice: 4.2.0, built on onnxruntime-web 1.26.0-dev), which runs ONNX
// models through onnxruntime-web's own multi-backend runtime (webgpu, webnn,
// wasm, cpu). Checked against the real installed package source
// (node_modules/@huggingface/transformers/dist/transformers.js), not
// assumed: `device: "wasm"` is a real, explicit pipeline() option
// (DEVICE_TYPES.wasm), and the library's own DEFAULT_DEVICE in a browser
// context (apis.IS_NODE_ENV false) is ALREADY "wasm", not "webgpu" — so
// forcing `device: "wasm"` here is both correct and belt-and-suspenders
// against the library ever changing its own browser default.
//
// Model choice, checked against Hugging Face's real, currently-published
// model list (not assumed): HuggingFaceTB/SmolLM2-360M-Instruct, tagged
// `transformers.js`+`onnx` on the hub, one of the two models the user's own
// proposal cited (the Transformers.js team's own in-browser demo playground
// precedent). 360M params is below the WebGPU tier's 0.5B specifically
// because WASM/CPU inference is materially slower than WebGPU compute
// kernels — item 3's "small over smart" bar applies even more here than it
// does to LocalLLMProvider.
//
// This is a genuinely separate backend, not a reimplementation of
// LocalLLMProvider: no code is shared between the two model-loading paths
// (each dynamically imports its own library), but the CLASS SHAPE is
// deliberately identical (isAvailable()/status()/generate()/checkCache()/
// subscribeProgress()/preload()) so dialogueManager.js's orchestration can
// try one, then the other, then fall to tier 2, without ever branching on
// which backend it's talking to — exactly item 12's "swap the inference
// backend without rewriting the rest of the app."
// MODEL CHOICE, RE-INVESTIGATED (2026-08-27, quality-push slice) — Qwen2.5-0.5B
// was tried and REJECTED, a real negative result, not silently skipped.
// Checked against the REAL, currently-published Hugging Face model list
// (not assumed): a real ONNX/transformers.js build of Qwen2.5-0.5B-Instruct
// does exist (`onnx-community/Qwen2.5-0.5B-Instruct`, tagged both
// `transformers.js` and `onnx`, ~12k downloads, confirmed via the live HF
// models API), and it's the SAME model this project's WebGPU tier
// (LocalLLMProvider, above) already uses — real precedent that 0.5B CAN
// work for this exact use case. It was swapped in and measured LIVE, across
// the same multiple event types (`tools/browser/verifyWasmLlm.mjs`), using
// the same tuned prompt/generation-params work below — and it was WORSE,
// not better: rambling, off-topic, completely ignoring the prompt's own
// "at most six words" / in-character instructions (e.g. for a
// `pain_unprompted` event it produced "Diligent. Patient nurse began to
// gently massage her clients back and legs..." — a third-person narrative
// about an unrelated nurse, not a first-person in-character patient line),
// materially slower (25-55s per generation vs SmolLM2's 9-11s in this same
// environment), and it failed outright (empty output, rejected before ever
// reaching sanitize) on one of the four real samples. SmolLM2-360M-Instruct,
// with the SAME new prompt/params, was measurably better on every axis in
// this real, live, same-session A/B: faster, 4/4 samples succeeded (vs
// 3/4), and — while still not fully coherent — stayed on-topic and
// in-register far more often (see this file's CLAUDE.md entry for the full
// real before/after transcript). Reverted to SmolLM2-360M-Instruct as a
// result. This is a real, honest finding stated per the task's own
// instruction to report if nothing beats SmolLM2-360M: at THIS model scale
// and with THIS pipeline's default decoding, a "smarter" base model
// (Qwen2.5) does not reliably translate into better SHORT, in-character
// output — instruction-following at 0.5B under transformers.js's own
// default chat templating was the actual bottleneck, not raw model
// quality, and Qwen2.5-0.5B's own chat template appears to need more
// context/turns than this project's single-user-turn prompt gives it to
// reliably stay terse. A future session with more budget could try
// Qwen2.5-0.5B with a proper multi-turn few-shot conversation (system +
// several user/assistant example turns, not one user turn) rather than
// ruling it out permanently — not attempted here to keep this slice's own
// scope to the five angles asked for, not an open-ended model search.
const WASM_MODEL_ID = "HuggingFaceTB/SmolLM2-360M-Instruct";
export const WASM_MODEL_DOWNLOAD_MB = 380; // fp32 ONNX weights + tokenizer; unchanged from the original figure, since the model itself is unchanged this slice.
const WASM_LOAD_TIMEOUT_MS = 60000; // unchanged — SmolLM2-360M loaded in ~15-34s in this environment's own live measurement, well inside this budget.
const WASM_GENERATE_TIMEOUT_MS = 20000; // unchanged — SmolLM2-360M generated in ~4-11s per line in this environment's own live measurement, well inside this budget.

// GENERATION PARAMETERS, tuned this slice for the documented WASM-tier
// failure mode (echoic/repetitive output at small model size — CLAUDE.md's
// prior entry). Checked what was previously passed: `max_new_tokens:48,
// temperature:0.85, do_sample:true` and NOTHING else — no repetition
// penalty, no top_p/top_k, greedy-adjacent sampling with a fairly hot
// temperature and no penalty for the model repeating itself, which is the
// textbook cause of a small instruct model degenerating into "Pain
// unprompted. Pain unprompted." style echo. `max_new_tokens` was also
// already fairly small (48) for a one-sentence dialogue line, but was
// tightened further (this is patient/crew/bystander SHORT dialogue, not
// long-form text, per the task's own framing) so a run-on generation is
// bounded even before repetition_penalty has a chance to matter.
// `repetition_penalty:1.3` and `no_repeat_ngram_size:3` are the two
// standard, well-documented HF-generation levers for exactly this failure
// mode (a moderate repetition_penalty around 1.2-1.3 is the commonly-cited
// range for small instruct models; no_repeat_ngram_size:3 hard-blocks any
// 3-gram from recurring, which directly kills the "Pain unprompted. Pain
// unprompted." class of failure). `temperature` lowered slightly (0.85 ->
// 0.7) and `top_p`/`top_k` added — at 0.85 with no nucleus/top-k limiting,
// a 0.5B model's own long, noisy tail is sampled more than is helpful for
// short, sane output; 0.7/top_p:0.9/top_k:40 is a standard "coherent but
// not deterministic" combination. Measured before/after via
// `tools/browser/verifyWasmLlm.mjs` across multiple event types (see that
// script and this file's CLAUDE.md entry for the real samples) before
// committing to these values, not chosen blind.
const WASM_MAX_NEW_TOKENS = 28;
const WASM_GENERATION_PARAMS = {
  max_new_tokens: WASM_MAX_NEW_TOKENS,
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  do_sample: true,
  repetition_penalty: 1.3,
  no_repeat_ngram_size: 3,
  return_full_text: false,
};

// PROMPT ENGINEERING FOR THE WASM TIER SPECIFICALLY. Checked before writing
// anything: `buildPrompt()` (shared with LocalLLMProvider above) uses the
// SAME prompt shape for both tiers — a multi-line instruction block with no
// worked examples. A 0.5B model, unlike a larger one, is known to follow
// FEW-SHOT examples far more reliably than pure instructions (this is a
// standard, well-documented small-model behavior, not specific to this
// project) — so this tier gets its own, more heavily-constrained variant:
// the same real, structured context `buildPrompt()` already assembles (item
// 13's context builder, reused verbatim, not rebuilt), but with the
// instruction line replaced by ONE short worked example of a good,
// in-character, correctly-short reply for the same speaker role, plus an
// explicit hard word-count ceiling stated in plain language (small models
// follow "at most six words" far more reliably than an abstract "one short
// sentence" instruction). Measured before/after (see verifyWasmLlm.mjs).
function buildWasmPrompt(event, ctx) {
  const p = ctx?.patient || {};
  const emotionalState = p.emotionalState || "calm";
  const bystanderRole = ctx?.bystander?.role || "bystander";
  const situation = ctx?.situation?.scenarioTitle || "an emergency call";
  let roleLine, example;
  if (event.speaker === "crew") {
    roleLine = "You are an EMS crew member. React to what just happened in ONE short sentence, at most six words. Plain English. No stage directions.";
    example = 'Example good reply: "He is stable, keep going."';
  } else if (event.speaker === "bystander") {
    roleLine = `You are the patient's ${bystanderRole}, scared, not a medical provider. Say ONE short, panicked sentence, at most six words. No medical terms.`;
    example = 'Example good reply: "Please, is she going to be okay?"';
  } else {
    roleLine = `You are a patient in pain during ${situation}. Feeling: ${emotionalState}. Say ONE short sentence, at most six words. Plain English. No medical terms.`;
    example = 'Example good reply: "It hurts right here, bad."';
  }
  return [
    roleLine,
    example,
    `What just happened: ${event.type.replace(/_/g, " ")}.`,
    "Now write ONE new short line of dialogue for this exact moment. Output ONLY the line, nothing else, at most six words.",
  ].join("\n");
}

// OUTPUT GUARDRAIL specific to the WASM tier's documented failure mode
// (echo/degenerate repetition). Item 11's graceful-degradation hierarchy
// already makes falling through to Tier 2 templates on a bad generation the
// existing safety net — this function is what makes a genuinely bad WASM
// generation reliably TRIGGER that fallback instead of ever reaching the
// player. Two real checks, both cheap and dependency-free: (1) the output
// is mostly a verbatim echo of the prompt's own event-type text (the
// specific failure this project's own CLAUDE.md entry documented live —
// "Pain unprompted." for a `pain_unprompted` event is exactly this); (2)
// degenerate token repetition — the same word or short phrase repeated
// enough times to indicate the model looped rather than composed a real
// sentence, a well-documented small-model failure mode distinct from (1).
function isDegenerateWasmOutput(text, event) {
  if (!text) return true;
  const norm = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  if (!norm) return true;
  // (1) echo of the event type itself (e.g. "pain unprompted" verbatim).
  const eventWords = event.type.replace(/_/g, " ").toLowerCase();
  if (norm === eventWords || norm.replace(/\s+/g, "") === eventWords.replace(/\s+/g, "")) return true;
  // (2) degenerate repetition: any single word repeated 3+ times in a row,
  // or the whole line being one word repeated over and over.
  const words = norm.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    let runLen = 1;
    for (let i = 1; i < words.length; i++) {
      runLen = words[i] === words[i - 1] ? runLen + 1 : 1;
      if (runLen >= 3) return true;
    }
    const uniq = new Set(words);
    if (uniq.size === 1 && words.length >= 3) return true;
  }
  return false;
}

export class WasmLLMProvider {
  constructor() {
    this._pipeline = null;
    this._loadPromise = null;
    this._failed = false;
    this._lastError = null;
    this._lastErrorKind = null;
    this._failCount = 0;
    this._autoRetryCount = 0; // consecutive automatic retries used; reset on success
    this._progress = null; // {progress, text} | null — derived from transformers.js's own file-level progress_callback
    this._progressListeners = new Set();
    this._cacheState = "unknown"; // transformers.js caches ONNX weights in the browser Cache API itself; no separate pre-check API like web-llm's hasModelInCache exists, so this stays "unknown" until a real load starts (honest, not guessed).
  }

  // Real feature detection: WebAssembly is present in every browser this
  // project targets (item 2's own "broadly compatible" bar) — unlike
  // LocalLLMProvider's navigator.gpu gate, there is no real hardware
  // precondition to check here beyond WebAssembly existing at all, which is
  // true for every JS engine capable of running this app.
  //
  // Real bug found and fixed: a bare `typeof WebAssembly !== "undefined"`
  // check is ALSO true in plain Node 21+ (WebAssembly is a global there
  // too), so this provider used to report itself "available" inside
  // src/scripts/verifyDialogueNonBrowser.mjs's own Node process — the exact
  // environment that script exists to prove has NO local LLM, structurally
  // (see that script's own header). `typeof window !== "undefined"` is the
  // real discriminator: this provider's own `_loadBackend()` fetches ONNX
  // weights via the browser Cache API and runs them through onnxruntime-
  // web's browser build, neither of which this project ships or supports
  // running under plain Node.
  isAvailable() {
    return typeof window !== "undefined" && typeof WebAssembly !== "undefined" && !this._failed;
  }

  status() {
    if (!this.isAvailable() && !this._pipeline) return this._failed ? "failed" : "unavailable";
    if (this._pipeline) return "ready";
    if (this._loadPromise) return "downloading";
    return "idle";
  }

  cacheState() {
    return this._cacheState;
  }

  subscribeProgress(cb) {
    this._progressListeners.add(cb);
    cb(this._progress);
    return () => this._progressListeners.delete(cb);
  }

  _emitProgress(p) {
    this._progress = p;
    for (const cb of this._progressListeners) cb(p);
  }

  // No real pre-check API exists in transformers.js (see constructor note) —
  // kept as a method anyway so this provider satisfies the exact same shape
  // as LocalLLMProvider for any caller that calls checkCache() on "whichever
  // provider is active" without branching (item 12).
  async checkCache() {
    return this._cacheState;
  }

  async _loadBackend() {
    // Dynamic import: keeps @huggingface/transformers (and its own further
    // dynamic fetch of the onnxruntime-web WASM runtime + this model's ONNX
    // weights) out of the app's main chunk, exactly like LocalLLMProvider's
    // own _loadBackend — confirmed via `npx vite build`'s per-chunk output
    // (see CLAUDE.md).
    return import("@huggingface/transformers");
  }

  async _ensurePipeline() {
    if (this._pipeline) return this._pipeline;
    if (this._loadPromise) return this._loadPromise;
    this._loadPromise = (async () => {
      const { pipeline } = await this._loadBackend();
      this._emitProgress({ progress: 0, text: "downloading model" });
      const pipe = await pipeline("text-generation", WASM_MODEL_ID, {
        device: "wasm", // forced, not left to the library's default (belt-and-suspenders — see header note)
        dtype: "q8", // quantized weights: smaller download, and this file's own item-3 "small/fast over smart" bar applies to a CPU backend more than a GPU one
        progress_callback: (p) => {
          if (p?.status === "progress" && typeof p.progress === "number") {
            this._cacheState = "not-cached";
            this._emitProgress({ progress: p.progress / 100, text: `downloading ${p.file || "model"}` });
          } else if (p?.status === "ready" || p?.status === "done") {
            this._emitProgress({ progress: 1, text: "ready" });
          }
        },
      });
      this._pipeline = pipe;
      this._autoRetryCount = 0;
      if (this._cacheState === "unknown") this._cacheState = "cached"; // no progress events fired at all — the library served it from its own cache without a network fetch
      this._emitProgress({ progress: 1, text: "ready" });
      return pipe;
    })();
    try {
      return await withTimeout(this._loadPromise, WASM_LOAD_TIMEOUT_MS, "model load");
    } catch (e) {
      this._failed = true;
      this._lastError = e;
      this._lastErrorKind = classifyLoadError(e);
      this._failCount++;
      this._loadPromise = null;
      this._emitProgress(null);
      console.error(`WasmLLMProvider: model load failed (attempt ${this._failCount}, classified as "${this._lastErrorKind}"):`, e);
      throw e;
    }
  }

  retry() {
    if (this._pipeline) return Promise.resolve(this._pipeline);
    if (this._loadPromise) return this._ensurePipeline();
    this._failed = false;
    this._loadPromise = null;
    return this._ensurePipeline();
  }

  preload() {
    if (!this.isAvailable() || this._pipeline || this._loadPromise) return;
    this._ensurePipeline().catch(() => this._maybeAutoRetry());
  }

  // Same policy as LocalLLMProvider._maybeAutoRetry (see AUTO_RETRY_DELAYS_MS).
  _maybeAutoRetry() {
    if (this._lastErrorKind !== "timeout" && this._lastErrorKind !== "network") return;
    if (this._autoRetryCount >= AUTO_RETRY_DELAYS_MS.length) return;
    const delay = AUTO_RETRY_DELAYS_MS[this._autoRetryCount++];
    setTimeout(() => {
      if (this._pipeline || this._loadPromise) return;
      this.retry().catch(() => this._maybeAutoRetry());
    }, delay);
  }

  // Same contract as LocalLLMProvider.generate(): throws on any failure,
  // never returns a fake line — dialogueManager's caller already treats any
  // throw from a tier-3 provider as "fall through" (item 11).
  async generate(event, ctx) {
    if (!this.isAvailable()) throw new Error("WasmLLMProvider unavailable (WebAssembly missing, or a prior load failed)");
    let pipe;
    try { pipe = await this._ensurePipeline(); } catch (e) { this._maybeAutoRetry(); throw e; }
    const prompt = buildWasmPrompt(event, ctx);
    const reply = await withTimeout(
      pipe([{ role: "user", content: prompt }], WASM_GENERATION_PARAMS),
      WASM_GENERATE_TIMEOUT_MS,
      "generation",
    );
    const raw = reply?.[0]?.generated_text;
    let text = sanitize(typeof raw === "string" ? raw : (Array.isArray(raw) ? raw[raw.length - 1]?.content : "") || "");
    if (!text) throw new Error("WasmLLMProvider: empty output");
    // A real, previously-shipped grammatical defect: `max_new_tokens` can
    // cut generation off mid-sentence, and that raw fragment used to reach
    // the player verbatim. Trim back to the last sentence the model
    // actually finished; if nothing before the cutoff is a complete
    // sentence, treat this exactly like a degenerate generation below and
    // fall through to Tier 2 rather than show a broken fragment.
    const complete = truncateToCompleteSentence(text);
    if (!complete) throw new Error(`WasmLLMProvider: incomplete sentence rejected ("${text}")`);
    text = complete;
    // Guardrail (this slice): a genuinely bad generation (echo of the
    // event type, or degenerate repetition) must never reach the player —
    // throw here so dialogueManager's existing try/catch falls through to
    // Tier 2 templates, per item 11's already-existing safety net.
    if (isDegenerateWasmOutput(text, event)) {
      throw new Error(`WasmLLMProvider: degenerate output rejected ("${text}")`);
    }
    return { speaker: event.speaker || "patient", text, tier: "wasm-llm" };
  }
}

export class TemplateProvider {
  isAvailable() { return true; }
  generate(event, ctx) {
    const pool = TEMPLATES[event.type];
    if (!pool) return null;
    const p = ctx?.patient?.personality || {};
    // Bucket selection, in priority order: (1) an explicit override — a
    // caller speaking as someone OTHER than the patient (a crew member
    // reacting to a clinical event, event.speaker==="crew") has no business
    // being bucketed off the PATIENT's own state, so event.bucket lets that
    // caller pick explicitly; (2) the SIMULATION-determined emotional state
    // (F0 item 17, emotionalState.js) when the context carries one — this is
    // now the primary driver, not personality alone, so the SAME event reads
    // differently for a patient who is currently frightened/agitated versus
    // one who is merely anxious-by-temperament but presently stable;
    // (3) a fallback to the original static-trait heuristic for any caller
    // that doesn't yet build a full context with emotionalState (e.g. the
    // dev panel's hand-built presets) — kept so nothing regresses.
    // F0 item 17 depth follow-up: a growing subset of the seven pools below
    // now carry a bucket keyed DIRECTLY by one of the ten emotional-state
    // names (e.g. "in pain", "frightened", "confused", "exhausted",
    // "reassured", "agitated") rather than only the original 3-way calm/
    // anxious/irritable split. When the pool for THIS event has a bucket
    // matching the state verbatim, that richer text wins; otherwise this
    // falls back to the original 3-way collapse (bucketForEmotionalState) so
    // every pool this batch didn't touch keeps behaving exactly as before.
    const state = ctx?.patient?.emotionalState;
    const bucket = event.bucket
      || (state && pool[state] ? state : null)
      || (state ? bucketForEmotionalState(state) : null)
      || (p.anxious > 0.66 ? "anxious" : p.irritable > 0.66 ? "irritable" : "calm");
    const variants = pool[bucket] || pool.calm || [];
    if (!variants.length) return null;
    const recent = ctx?.recentEvents || [];
    // Avoid repeating a line that's still in the short-term memory window.
    const fresh = variants.filter((t) => !recent.includes(fill(t, ctx)));
    const chosen = (fresh.length ? fresh : variants)[Math.floor(Math.random() * (fresh.length ? fresh.length : variants.length))];
    return { speaker: event.speaker || "patient", text: fill(chosen, ctx), tier: "template" };
  }
}

function fill(template, ctx) {
  return template
    .replace(/\{name\}/g, ctx?.patient?.name || "the patient")
    .replace(/\{pain\}/g, String(ctx?.patient?.painLevel ?? "?"));
}

// event.type -> {calm:[...], anxious:[...], irritable:[...]}. Kept small and
// hand-authored for this first batch (F0 item 3 explicitly asks for a SMALL,
// fast model over a smart one for exactly this reason — tier 2 exists so
// most ordinary moments never need inference at all).
const TEMPLATES = {
  pain_unprompted: {
    calm: ["It hurts, but I'm okay.", "Still hurts some right there."],
    anxious: ["It really hurts. Is that normal?", "I don't like this, it's not going away."],
    irritable: ["Yeah, it still hurts. I told you that.", "How many times do I have to say it hurts?"],
    // Severe, sustained pain with no trend either way (emotionalState.js's
    // own "pain >= 7, no active trend" branch) reads differently from an
    // anxious patient asking whether the pain is normal, or a merely
    // irritable one repeating himself. Someone in real, ongoing pain like
    // this is not asking questions or complaining, they are just enduring
    // it.
    "in pain": ["It really hurts. It's not letting up at all.", "It's bad right now. I just need a second."],
    // A long call with ongoing, if modest, pain (emotionalState.js's
    // fatigue branch) reads quieter and more worn down than any of the
    // above, not sharper.
    exhausted: ["It still hurts. I'm just so tired of this.", "It hurts. I don't have much left to fight it with."],
  },
  anxious_unprompted: {
    calm: ["Am I going to be okay?", "How much longer until we get there?"],
    anxious: ["Please, is this serious? Am I going to be okay?", "Can you call my family? Please."],
    irritable: ["Just tell me what's going on. Don't dance around it.", "Are you actually doing something, or just standing there?"],
    // A real worsening trend in an anxious patient (emotionalState.js's
    // "frightened" branch) is sharper, more visceral fear than a merely
    // anxious-by-temperament patient's generic worry above.
    frightened: ["Please don't leave me, I'm really scared right now.", "Something bad is happening, isn't it? Please just tell me."],
  },
  deterioration_unprompted: {
    calm: ["I don't feel right.", "Something's different. I feel worse."],
    anxious: ["Something's wrong, I can feel it getting worse.", "I feel like I can't catch my breath right."],
    irritable: ["I said I don't feel right, are you listening?", "This is getting worse, not better."],
    // A real worsening trend, split the same way emotionalState.js itself
    // splits it: an anxious-by-temperament patient reads as outright
    // frightened here, distinct from anxious_unprompted's own frightened
    // wording since this is specifically about the trajectory getting
    // worse, not general fear.
    frightened: ["Oh no, something's really wrong, isn't it? It's getting worse.", "I can feel it getting worse. Please, something's wrong."],
    // A non-anxious patient on the same worsening trend reads as agitated,
    // demanding action, not merely irritable-by-temperament (irritable
    // above is a standing trait, agitated is the situation getting away
    // from him right now).
    agitated: ["Something's wrong, you need to do something, right now.", "This isn't right. Fix it. Please, just fix it."],
    // Altered consciousness (emotionalState.js's override branch) during a
    // deterioration event reads as disoriented, not scared or demanding.
    confused: ["Wait, what's happening? I don't, okay, I don't know.", "Everything feels foggy. Something's wrong, I think."],
  },
  procedure_discomfort: {
    calm: ["Ow. That stings.", "That's uncomfortable, but go ahead."],
    anxious: ["Ow! Wait, is that supposed to hurt this much?", "Please be careful, that really hurts."],
    irritable: ["Ow! Watch it.", "That hurt. A lot."],
    // Severe, sustained baseline pain (pain >= 7 already, before the
    // procedure even starts) reads as a much rawer reaction to the same
    // poke than the calm/anxious/irritable lines above, which all assume a
    // patient whose pain wasn't already severe.
    "in pain": ["Ow, that's really bad, please, just give me a second.", "That's too much right now. Please, wait."],
  },
  treatment_improving: {
    calm: ["That actually helps.", "I think that's working, I feel a little better."],
    anxious: ["Oh, that does feel a little better. Really?", "Is it working? I think it's working."],
    irritable: ["Fine, that's a little better, I guess.", "Okay. That helped some."],
    // A real improving trend (emotionalState.js's "reassured" branch) is
    // explicit relief and gratitude, a distinct emotional beat from merely
    // "calm," which describes a patient who was never that distressed to
    // begin with.
    reassured: ["Oh, thank you, that's so much better.", "Okay. Okay, I can breathe again. Thank you."],
    // Improving, but on a long call that's already worn the patient down,
    // reads as tired relief rather than the sharper gratitude above.
    exhausted: ["That helps some. I'm just so worn out.", "Better, I think. I'm just tired, that's all."],
  },
  // F0 item 23 / F3 spec 2.7's own worked example, closing a real gap: the
  // four real procedure mini-games (AccessMinigame/AirwayMinigame/
  // CricMinigame/SGAMinigame) previously generated zero dialogue of any
  // kind — they resolve through their own components, entirely independent
  // of the tick-loop/start() dialogue sites above. Airway instrumentation on
  // an awake or inadequately obtunded patient (laryngoscope blade, ETT/SGA
  // insertion, a cric incision) provokes gagging/coughing/flinching, a
  // physically distinct reaction from a needle stick's "Ow" — a separate
  // template rather than reusing procedure_discomfort's wording for a
  // mismatched sensation.
  airway_stimulation_reaction: {
    calm: ["*gags* ...sorry.", "*coughs* Wait, hold on."],
    anxious: ["*gags* Wait, stop, I can't breathe!", "*coughs hard* Please, wait a second."],
    irritable: ["*gags* Watch it!", "*coughs* Get it out, get it out!"],
    // Airway instrumentation on a patient with already-altered consciousness
    // (drowsy/obtunded but not deep enough to be silent) reads as a
    // disoriented, half-aware reflex reaction, not a lucid protest.
    confused: ["*gags* ...wh, what... hold on...", "*coughs* ...where... what's happening..."],
  },
  // F0 item 23 / F3 coordination — the four real mini-games (AccessMinigame,
  // AirwayMinigame, CricMinigame, SGAMinigame) resolve through App.jsx's own
  // shared resolveAccessMinigame(), which is where this fires (the minigame
  // components themselves are presentational, with no access to setG/physio/
  // dialogueManager). A MISSED stick reads as real pain, not just failure —
  // reuses procedure_discomfort's own bucket/voice, deliberately not a new
  // pool, since "Ow, that hurts" (the spec's own example line) already lives
  // there.
  procedure_success_relief: {
    calm: ["Okay, that's in.", "Oh, that's better already."],
    anxious: ["Is that it? Is it actually in?", "Oh, thank god. Is that over?"],
    irritable: ["Finally.", "About time. That took long enough."],
    // A patient on a real improving trend (reassured) reads this success as
    // outright relief and gratitude, distinct from the anxious bucket's own
    // still-uncertain "is that it?" wording.
    reassured: ["Oh, thank god, thank you so much.", "Okay. Okay, that's such a relief."],
  },
  // A real, existing gameplay event, not invented for this batch: torso
  // exposure (clothing.js / App.jsx's exposureActs, the "Remove shirt" /
  // "Lift shirt" / "Cut shirt" actions) puts a conscious patient's chest
  // bare in front of the crew and any bystanders on scene. That is a
  // genuinely embarrassment-appropriate moment (clinically documented as
  // one, distinct from ordinary pain or fear) — the one real trigger this
  // codebase has for the "embarrassed" state, wired as an explicit
  // event.bucket override in App.jsx's start() rather than through the
  // general deriveEmotionalState() heuristic (see emotionalState.js's own
  // header comment on why "embarrassed" is otherwise left unreachable).
  exposure_reaction: {
    embarrassed: ["Do you, do you have to do that with everyone watching?", "Can someone, can I get a blanket or something, please?", "This is, this is kind of embarrassing, honestly."],
  },
  // Crew-voiced reactions to a real, edge-triggered clinical event (App.jsx
  // fires these from the SAME seizing/consciousness edge-detection that
  // drives the visible on-screen alert banner — a different channel with a
  // different purpose, a crew member's own voice, not a duplicate of the
  // banner's plain informational text). Always the "calm" bucket — see the
  // event.bucket override above, since bucketing crew speech off the
  // PATIENT's own personality would be meaningless.
  crew_seizure_reaction: {
    calm: ["He's seizing!", "Whoa, she's seizing, hang on.", "Full body, right now. Watch the airway."],
  },
  crew_unresponsive_reaction: {
    calm: ["He just stopped responding.", "We lost her, she's not answering me.", "Hey, hey, not responding anymore."],
  },
  // The reverse edges — App.jsx fires these off the SAME two flags going
  // false again, a genuinely separate, previously-silent transition (the old
  // code only ever checked the forward direction). A crew member's relief at
  // a seizure stopping or a patient waking back up is real, distinct content,
  // not a mirror of the onset line with the words swapped.
  crew_seizure_ended_reaction: {
    calm: ["Okay, it's stopped.", "She's not seizing anymore.", "That's it, it's over, let's reassess him."],
  },
  crew_recovery_reaction: {
    calm: ["Hey, he's coming back!", "She's responding again, good.", "There we go, stay with us."],
  },
  // F0 item 15's bystander/family slice — the SAME two real, edge-triggered
  // clinical moments crew already reacts to (App.jsx's seizing/consciousness
  // edge-detection), but voiced by a present family member/bystander instead
  // of a crew member. Deliberately a different register: crew is clinical
  // and directive ("Watch the airway"), a bystander witnessing this has no
  // training and nothing useful to DO, only fear — panicked, pleading,
  // non-clinical. Only the "calm" bucket exists (same as the crew pools
  // above) since a bystander's personality isn't modeled; event.bucket is
  // always set explicitly at the call site, same reasoning as crew's own
  // header comment. Knowledge boundary (item 15): these lines never name a
  // vital, a rhythm, or a diagnosis — only what a frightened bystander could
  // actually witness and feel.
  bystander_seizure_reaction: {
    calm: ["Oh god, what's happening to {name}?! Is that normal?!",
      "Please, do something, right now, please!",
      "Why is this happening? Please, help {name}!"],
  },
  bystander_unresponsive_reaction: {
    calm: ["Wake up! Please, {name}, wake up!",
      "Oh no. Oh no, no, no. Please, do something.",
      "They're not answering me! Why aren't they answering?!"],
  },
};
