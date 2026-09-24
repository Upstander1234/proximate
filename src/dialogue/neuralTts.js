// src/dialogue/neuralTts.js — real, local, neural text-to-speech via
// Kokoro-82M (kokoro-js, itself built on @huggingface/transformers, forced
// to the "wasm" device for the same broad-compatibility reasoning
// WasmLLMProvider already uses elsewhere in this project — no server, no
// API key, entirely on-device). This is the ONLY voice Proximate speaks
// dialogue with — per explicit product direction, there is deliberately no
// fallback to the browser's own robotic built-in SpeechSynthesis voice; a
// line that can't be spoken with this real voice is simply not spoken
// (App.jsx's useReadAloud queues and waits, then drops a stale line, rather
// than degrading to a worse-sounding voice). Callers must treat every
// method here as fallible and never assume it will resolve.
//
// Reliability fix: this used to have NO timeout, NO retry, and NO error
// classification at all — a single failed or hung load latched _failed
// (or just sat in "loading" forever) for the rest of the session, with
// nothing to recover it, meaning it simply stopped speaking for good.
// dialogueProvider.js's LocalLLMProvider already documents the real cause
// of exactly this failure shape for a sibling on-device model (Hugging
// Face's own resolve endpoint randomly resets connections for some
// players/networks) and already has a proven fix (a load timeout +
// classified auto-retry with backoff + a manual retry() a Settings control
// can call) — this file now uses the SAME policy for the SAME reason: a
// transient network blip on this model's own ~90MB of Hugging Face-hosted
// weights must not permanently strand a player with no voice at all for
// the rest of their session.

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const NEURAL_VOICE_DOWNLOAD_MB = 90; // q8-quantized weights, rough estimate

// Real voice ids this model ships, filtered to Kokoro's OWN published
// quality grades (kokoro-js's `voices` catalog — each entry carries a real
// `overallGrade`, A through F+ — read directly from the installed package,
// not guessed). Kept at C+ or better only: every voice below that (D, D+,
// D-, F+ — roughly two-thirds of the full ~28-voice English catalog) is a
// noticeably rougher, more robotic-sounding synthesis even within this same
// model, so including one in the pool would recreate the exact "doesn't
// sound very good" complaint this curation exists to fix, just with a
// nicer-sounding NAME on it. Split by gender (Kokoro's own catalog field)
// so a speaker can be voiced by a same-gender voice when the caller knows
// one (see neuralVoiceProfileFor's `gender` param) — American and British
// English only, this model ships nothing else.
const FEMALE_VOICE_IDS = [
  "af_heart",  // A  — best in the whole catalog
  "af_bella",  // A-
  "af_nicole", // B-
  "bf_emma",   // B-
  "af_kore",   // C+
  "af_sarah",  // C+
  "af_aoede",  // C+
];
const MALE_VOICE_IDS = [
  "am_fenrir", // C+ — the best-graded male voice this model has; nothing
  "am_michael",// C+   grades higher for a male American/British voice in
  "am_puck",   // C+   Kokoro-82M's own published benchmark, stated
];                     // honestly rather than padded with a lower-graded one.
const VOICE_IDS = [...FEMALE_VOICE_IDS, ...MALE_VOICE_IDS];

function hashKey(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic voice+speed pick per speaker key, so the SAME character
// sounds the same all call long. `gender` ("male"|"female"), when a
// caller has a real one (e.g. the patient's own `pat.sex`), narrows the
// pool to same-gender voices before hashing, instead of letting a purely
// text-derived hash occasionally land a female patient on a male voice or
// vice versa — a real, previously-uncontrolled mismatch that's as
// immersion-breaking as raw audio quality, and free to fix once the caller
// already knows the gender (App.jsx's useReadAloud does, for the patient).
// Unknown/absent gender (crew names, bystander role, dispatch, narrator)
// falls back to the full pool exactly as before.
export function neuralVoiceProfileFor(key, gender) {
  const pool = gender === "female" ? FEMALE_VOICE_IDS : gender === "male" ? MALE_VOICE_IDS : VOICE_IDS;
  const h = hashKey(key || "narrator");
  const voice = pool[h % pool.length];
  const speed = +(0.93 + ((h >> 3) % 5) * 0.035).toFixed(3); // 0.93 - 1.07
  return { voice, speed };
}

const LOAD_TIMEOUT_MS = 90000; // ~90MB q8 model — generous but bounded, same reasoning as LocalLLMProvider's own budget, scaled down for this model's much smaller size.
// Same policy and constants as dialogueProvider.js's AUTO_RETRY_DELAYS_MS,
// for the identical reason (a Hugging Face connection reset looks
// transient and deserves more than one automatic attempt) — duplicated
// rather than imported, since neuralTts.js is deliberately a small,
// standalone module with no dependency on the dialogue-LLM provider file.
const AUTO_RETRY_DELAYS_MS = [2000, 4000, 8000, 15000, 30000];

function withTimeout(promise, ms, label) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(`NeuralTtsProvider: ${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

function classifyLoadError(e) {
  const msg = String(e?.message || e || "").toLowerCase();
  if (msg.includes("timed out")) return "timeout";
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("err_") || msg.includes("http"))
    return "network";
  return "unknown";
}

class NeuralTtsProvider {
  constructor() {
    this._tts = null;
    this._loadPromise = null;
    this._failed = false;
    this._lastError = null;
    this._lastErrorKind = null;
    this._failCount = 0;
    this._autoRetryCount = 0;
    this._progress = null; // {progress, text} in the same shape web-llm's own initProgressCallback uses
    this._progressListeners = new Set();
  }

  isAvailable() {
    return typeof window !== "undefined" && typeof Audio !== "undefined" && !this._failed;
  }

  status() {
    if (this._failed) return "failed";
    if (this._tts) return "ready";
    if (this._loadPromise) return "loading";
    return "idle";
  }

  // Real caught error/classification for a status UI (mirrors
  // LocalLLMProvider.getLocalAiState() shape closely enough that a
  // Settings row can reuse the same rendering logic).
  getState() {
    return { status: this.status(), errorKind: this._lastErrorKind, progress: this._progress, failCount: this._failCount };
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

  async _ensureEngine() {
    if (this._tts) return this._tts;
    if (this._loadPromise) return this._loadPromise;
    this._loadPromise = (async () => {
      if (!this.isAvailable()) throw new Error("neural TTS unavailable on this device");
      const { KokoroTTS } = await import("kokoro-js");
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "wasm",
        // Real download/compile progress from the library itself (kokoro-js
        // forwards this straight to @huggingface/transformers' own
        // reporter) — not fabricated, so a status UI can show genuine
        // percentage rather than an indeterminate spinner the whole time.
        progress_callback: (report) => this._emitProgress(report),
      });
      this._tts = tts;
      this._autoRetryCount = 0;
      this._emitProgress({ progress: 1, status: "ready" });
      return tts;
    })();
    try {
      return await withTimeout(this._loadPromise, LOAD_TIMEOUT_MS, "model load");
    } catch (e) {
      this._failed = true;
      this._lastError = e;
      this._lastErrorKind = classifyLoadError(e);
      this._failCount++;
      this._loadPromise = null;
      this._emitProgress(null);
      console.error(`NeuralTtsProvider: model load failed (attempt ${this._failCount}, classified as "${this._lastErrorKind}"):`, e);
      throw e;
    }
  }

  // Real retry path (same shape as LocalLLMProvider.retry()): clears the
  // latch and any stale in-flight promise, then genuinely re-attempts a
  // load. Safe to call even mid-load or after success. Partial fetches the
  // underlying @huggingface/transformers loader already wrote into its own
  // Cache API entries persist between attempts (the library's own file
  // cache, same mechanism as WasmLLMProvider's model), so a retry after a
  // partial download doesn't necessarily restart from zero.
  retry() {
    if (this._tts) return Promise.resolve(this._tts);
    if (this._loadPromise) return this._ensureEngine();
    this._failed = false;
    this._loadPromise = null;
    return this._ensureEngine();
  }

  // Same policy as LocalLLMProvider._maybeAutoRetry: only for a failure
  // that looks transient (timeout/network), with growing backoff, capped —
  // a device that genuinely can't run this (no WASM, no Audio, etc.) is
  // not retried, since hammering a doomed load only delays the honest
  // "failed" status a caller (or the Settings retry chip) can act on.
  _maybeAutoRetry() {
    if (this._lastErrorKind !== "timeout" && this._lastErrorKind !== "network") return;
    if (this._autoRetryCount >= AUTO_RETRY_DELAYS_MS.length) return;
    const delay = AUTO_RETRY_DELAYS_MS[this._autoRetryCount++];
    setTimeout(() => {
      if (this._tts || this._loadPromise) return; // already recovered or already retrying
      this.retry().catch(() => this._maybeAutoRetry());
    }, delay);
  }

  // Fire-and-forget: starts the real download/compile early (e.g. as soon
  // as read-aloud is turned on) without blocking or throwing into the
  // caller — the first real line of dialogue is what actually needs the
  // engine, so this just gets a head start on it. Now also arms the
  // reliability fix's auto-retry on failure, instead of leaving a
  // transient failure permanently stuck.
  preload() {
    if (this._tts || this._loadPromise) return;
    this._ensureEngine().catch(() => this._maybeAutoRetry());
  }

  // Returns a real Blob (audio/wav) for the given text, or throws on any
  // failure — every caller must catch (there is no fallback voice; see
  // this file's own header). `gender` ("male"|"female"), when known,
  // narrows voice selection to a same-gender voice — see
  // neuralVoiceProfileFor's own comment.
  async generate(text, speakerKey, gender) {
    const tts = await this._ensureEngine();
    const { voice, speed } = neuralVoiceProfileFor(speakerKey, gender);
    const audio = await tts.generate(text, { voice, speed });
    return audio.toBlob();
  }
}

export const neuralTts = new NeuralTtsProvider();
