// Browser playback for the auscultation sounds. Layers (a lung sound and a heart
// sound) are retimed to the physiology engine's exact rate and rhythm
// (audio/retime.js) and looped through Web Audio. setMix() takes the layers that
// should be audible RIGHT NOW: a layer already playing only has its gain glided,
// so dragging the stethoscope across the chest blends smoothly between sounds
// without restarting them, and a layer is rebuilt only when its rate, rhythm or
// recording actually changes.
import { readWav16, analyzeClip, buildLoop, buildBreathLoop } from "./retime.js";

const TARGET_RMS = 0.2;
const sigOf = (L) => [L.key, L.rate, L.pattern?.kind || "", L.pattern?.every || "", L.shape?.insp ?? "", L.shape?.exp ?? "", L.lowpass || ""].join("|");

export class AuscultationPlayer {
  constructor() { this.ctx = null; this.cache = new Map(); this.live = new Map(); this.desired = new Map(); this.building = new Set(); }

  async _clip(url) {
    if (!this.cache.has(url)) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`could not load ${url}`);
      this.cache.set(url, { ...readWav16(await r.arrayBuffer()), heartInfo: null });
    }
    return this.cache.get(url);
  }

  _ensureCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  async _add(sig, L) {
    if (this.live.has(sig) || this.building.has(sig)) return;
    this.building.add(sig);
    try {
      const clip = await this._clip(L.url);
      let loop;
      if (L.kind === "heart") {
        if (!clip.heartInfo) clip.heartInfo = analyzeClip(clip.x, clip.fs, 0.3, 1.6);
        loop = buildLoop(clip.heartInfo, L.rate, 15, { pattern: L.pattern, seed: 11 });
      } else {
        loop = buildBreathLoop(clip.x, clip.fs, L.rate, L.shape, 15);
      }
      // Normalise loudness per sound so relative gains (a muffled or absent sound) are
      // relative to a normal one, whatever level the recording was made at.
      let e = 0;
      for (let i = 0; i < loop.length; i++) e += loop[i] * loop[i];
      const scale = Math.min(30, TARGET_RMS / (Math.sqrt(e / loop.length) || 1e-4));
      // The layer may no longer be wanted by the time it has been built.
      if (!this.desired.has(sig) || !this.ctx) return;
      const ctx = this.ctx;
      const buf = ctx.createBuffer(1, loop.length, clip.fs);
      buf.copyToChannel(loop, 0);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = L.lowpass || 20000;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(ctx.destination);
      src.start();
      this.live.set(sig, { src, f, g, scale });
      const want = this.desired.get(sig);
      g.gain.setTargetAtTime(want.gain * scale, ctx.currentTime, 0.04);
    } finally { this.building.delete(sig); }
  }

  // layers: [{ key, url, kind: "heart" | "lung", rate, pattern, shape, gain, lowpass }]
  async setMix(layers) {
    const ctx = this._ensureCtx();
    this.desired = new Map();
    for (const L of layers || []) if (L && L.gain > 0 && L.rate > 0) this.desired.set(sigOf(L), L);
    // Fade out and drop what is no longer wanted.
    for (const [sig, node] of this.live) {
      if (this.desired.has(sig)) continue;
      node.g.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
      this.live.delete(sig);
      setTimeout(() => { try { node.src.stop(); node.src.disconnect(); node.f.disconnect(); node.g.disconnect(); } catch { /* already stopped */ } }, 300);
    }
    // Glide gains of layers that stay, and build the new ones.
    const adds = [];
    for (const [sig, L] of this.desired) {
      const node = this.live.get(sig);
      if (node) node.g.gain.setTargetAtTime(L.gain * node.scale, ctx.currentTime, 0.04);
      else adds.push(this._add(sig, L));
    }
    await Promise.all(adds);
  }

  stop() { return this.setMix([]); }

  close() {
    for (const node of this.live.values()) { try { node.src.stop(); node.src.disconnect(); } catch { /* already stopped */ } }
    this.live.clear(); this.desired = new Map();
    if (this.ctx) { try { this.ctx.close(); } catch { /* already closed */ } this.ctx = null; }
  }
}
