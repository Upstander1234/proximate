// src/dialogue/neuralTts.js — real, local, neural text-to-speech via
// Kokoro-82M (kokoro-js, itself built on @huggingface/transformers, forced
// to the "wasm" device for the same broad-compatibility reasoning
// WasmLLMProvider already uses elsewhere in this project — no server, no
// API key, entirely on-device). This exists to replace the OS's own
// robotic SpeechSynthesisUtterance voices with a real, more natural-
// sounding neural voice. Callers must treat every method here as fallible
// and fall back to SpeechSynthesis on any rejection or while the model is
// still loading — this module never blocks read-aloud.

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
export const NEURAL_VOICE_DOWNLOAD_MB = 90; // q8-quantized weights, rough estimate

// Real voice ids this model ships (kokoro-js's own catalog — American and
// British English only). Picked for range: multiple distinct-sounding
// male/female voices so different characters stay distinguishable, the
// same goal App.jsx's own SpeechSynthesis-based profileFor() already had.
const VOICE_IDS = [
  "af_heart", "af_bella", "af_nicole", "af_sarah",
  "am_fenrir", "am_michael", "am_puck",
  "bf_emma", "bm_george", "bm_fable",
];

function hashKey(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic voice+speed pick per speaker key, so the SAME character
// sounds the same all call long — mirrors App.jsx's own profileFor() idiom
// for the SpeechSynthesis fallback.
export function neuralVoiceProfileFor(key) {
  const h = hashKey(key || "narrator");
  const voice = VOICE_IDS[h % VOICE_IDS.length];
  const speed = +(0.93 + ((h >> 3) % 5) * 0.035).toFixed(3); // 0.93 - 1.07
  return { voice, speed };
}

class NeuralTtsProvider {
  constructor() {
    this._tts = null;
    this._loadPromise = null;
    this._failed = false;
    this._lastError = null;
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

  async _ensureEngine() {
    if (this._tts) return this._tts;
    if (!this.isAvailable()) throw new Error("neural TTS unavailable on this device");
    if (!this._loadPromise) {
      this._loadPromise = (async () => {
        const { KokoroTTS } = await import("kokoro-js");
        const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
          dtype: "q8",
          device: "wasm",
        });
        this._tts = tts;
        return tts;
      })().catch((e) => {
        this._failed = true;
        this._lastError = e;
        this._loadPromise = null;
        console.error("NeuralTtsProvider: model load failed:", e);
        throw e;
      });
    }
    return this._loadPromise;
  }

  // Fire-and-forget: starts the real download/compile early (e.g. as soon
  // as read-aloud is turned on) without blocking or throwing into the
  // caller — the first real line of dialogue is what actually needs the
  // engine, so this just gets a head start on it.
  preload() {
    this._ensureEngine().catch(() => {});
  }

  // Returns a real Blob (audio/wav) for the given text, or throws on any
  // failure — every caller must catch and fall back to SpeechSynthesis.
  async generate(text, speakerKey) {
    const tts = await this._ensureEngine();
    const { voice, speed } = neuralVoiceProfileFor(speakerKey);
    const audio = await tts.generate(text, { voice, speed });
    return audio.toBlob();
  }
}

export const neuralTts = new NeuralTtsProvider();
