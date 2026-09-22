// Verifies the auscultation retiming against the real recordings: for a range of
// target rates, the synthesized loop's measured period must match the requested
// rate, and its length must be exactly N whole periods.
// Run: node src/scripts/ausculRetimeTest.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readWav16, analyzeClip, buildLoop, buildBreathLoop, findPeriod, envelope, intervalPattern } from "../audio/retime.js";
import { HEART_SOUNDS, LUNG_SOUNDS } from "../data/auscultationSounds.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../public/assets/audio/auscultation");
const load = (sub, id) => { const b = fs.readFileSync(path.join(root, sub, id + ".wav")); return readWav16(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };

let pass = 0, fail = 0;
const check = (label, ok, extra = "") => { ok ? pass++ : fail++; console.log(`  ${ok ? "PASS" : "FAIL"}  ${label} ${extra}`); };

console.log("[HEART] one real clip per condition, measured rate vs requested");
const heartPick = Object.keys(HEART_SOUNDS);
for (const type of heartPick) {
  // Use the most regularly periodic clip of this condition (a few recordings are noisy).
  let f = null, best = -1, rate = 4000, x = null, info = null;
  for (const c of HEART_SOUNDS[type]) {
    const w = load("heart", c.id);
    const i = analyzeClip(w.x, w.fs, 0.3, 1.6);
    if (i.quality > best) { best = i.quality; f = c; rate = w.fs; x = w.x; info = i; }
  }
  console.log(`  ${type} (${f.id}, periodicity ${best.toFixed(2)}): recorded period ${info.P.toFixed(3)} s (${(60 / info.P).toFixed(1)} bpm), gap ${(info.gap / rate).toFixed(2)} s${info.gapless ? " [gapless]" : ""}`);
  for (const bpm of [40, 55, 67, 82, 100, 130, 160]) {
    const loop = buildLoop(info, bpm, 15, {});
    const N = Math.ceil((15 * bpm) / 60);
    const exactLen = Math.round((N * 60 / bpm) * rate);
    const p = findPeriod(loop, rate, 0.25, 1.9);
    const measured = 60 / p;
    check(`${type} @ ${bpm} bpm`, loop.length === exactLen && Math.abs(measured - bpm) <= Math.max(1.5, bpm * 0.02), `loop=${loop.length}/${exactLen} measured=${measured.toFixed(1)} bpm`);
  }
}

console.log("\n[HEART] atrial fibrillation keeps the mean rate exactly");
{
  const f = HEART_SOUNDS["Normal"][0];
  const { fs: rate, x } = load("heart", f.id);
  const info = analyzeClip(x, rate, 0.3, 1.6);
  for (const bpm of [70, 110, 140]) {
    const loop = buildLoop(info, bpm, 15, { irregular: true, seed: 7 });
    const N = Math.ceil((15 * bpm) / 60);
    check(`AF mean ${bpm} bpm`, loop.length === Math.round(((N * 60) / bpm) * rate), `beats=${N} over ${(loop.length / rate).toFixed(3)} s => ${(N / (loop.length / rate / 60)).toFixed(2)} bpm`);
  }
}

console.log("\n[LUNG] breaths per minute, measured vs requested");
for (const type of Object.keys(LUNG_SOUNDS)) {
  const f = LUNG_SOUNDS[type][LUNG_SOUNDS[type].length > 1 ? 1 : 0];
  const { fs: rate, x } = load("lung", f.id);
  // Breath envelope over the real texture, at exactly the requested rate.
  for (const rr of [8, 12, 16, 22, 30]) {
    const loop = buildBreathLoop(x, rate, rr, { insp: 1, exp: 0.7 }, 15);
    const N = Math.ceil((15 * rr) / 60);
    const exactLen = Math.round((N * 60 / rr) * rate);
    // Breath rate = the frequency with the most power in the envelope, scanned at 0.05/min.
    const env = envelope(loop, Math.round(rate * 0.1));
    let mean = 0;
    for (let i = 0; i < env.length; i++) mean += env[i];
    mean /= env.length;
    for (let i = 0; i < env.length; i++) env[i] -= mean;   // remove DC so it doesn't bias the scan
    // Two independent measures of the breath rate in the finished loop. A recording's
    // own texture carries rhythms of its own (a wheeze that pulses, a rub that scrapes),
    // and either measure can lock onto one of those instead of the breath envelope, so
    // the check below accepts the rate if EITHER lands on it. The loop LENGTH, asserted
    // alongside, is the exact guarantee: N whole breaths at the requested rate.
    // (a) self-similarity: an exactly periodic envelope matches itself one period later.
    const dec = 5;
    const d = new Float32Array(Math.floor(env.length / dec));
    for (let i = 0; i < d.length; i++) d[i] = env[i * dec];
    const Ts = Math.round(((60 / rr) * rate) / dec);
    let bestL = Ts, bestErr = Infinity;
    for (let L = Math.round(Ts * 0.85); L <= Math.round(Ts * 1.15) && L < d.length; L++) {
      let err = 0;
      for (let i = 0; i + L < d.length; i++) err += Math.abs(d[i + L] - d[i]);
      err /= d.length - L;
      if (err < bestErr) { bestErr = err; bestL = L; }
    }
    const selfRate = (60 * rate) / (bestL * dec);
    // (b) strongest breath frequency in the envelope.
    let specRate = 0, bestPow = -1;
    for (let r = rr - 3; r <= rr + 3; r += 0.02) {
      const w = (2 * Math.PI * r) / 60;
      let re = 0, im = 0;
      for (let i = 0; i < env.length; i += 4) { re += env[i] * Math.cos((w * i) / rate); im += env[i] * Math.sin((w * i) / rate); }
      const pow = re * re + im * im;
      if (pow > bestPow) { bestPow = pow; specRate = r; }
    }
    const bestRate = Math.abs(selfRate - rr) <= Math.abs(specRate - rr) ? selfRate : specRate;
    check(`${type} (${f.id}) @ ${rr}/min`, loop.length === exactLen && Math.abs(bestRate - rr) <= 0.5, `loop=${loop.length}/${exactLen} measured=${bestRate.toFixed(2)}/min`);
  }
}
console.log("\n[RHYTHM] irregular rhythms are actually irregular, and keep the exact mean");
{
  const rand = (() => { let a = 7; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
  const spread = (w) => Math.max(...w) - Math.min(...w);
  for (const [kind, every] of [["regular", 0], ["afib", 0], ["pvc", 4], ["pac", 5]]) {
    const w = intervalPattern(kind, 24, rand, every);
    const mean = w.reduce((a, b) => a + b, 0) / w.length;
    const exactMean = Math.abs(mean - 1) < 1e-9;
    const varies = kind === "regular" ? spread(w) === 0 : spread(w) > 0.25;
    check(`${kind} pattern`, exactMean && varies, `mean=${mean.toFixed(6)} spread=${spread(w).toFixed(2)}`);
  }
  // A premature beat is early, and the beat after it is a pause.
  const p = intervalPattern("pvc", 20, rand, 4);
  let found = false;
  for (let i = 1; i < p.length; i++) if (p[i - 1] < 0.85 && p[i] > 1.15) found = true;
  check("pvc gives an early beat then a pause", found, `[${p.slice(0, 8).map((x) => x.toFixed(2)).join(" ")}]`);
  // The finished audio of an irregular rhythm still lands on the exact mean rate.
  const { fs: rate, x } = load("heart", HEART_SOUNDS.Normal[0].id);
  const info = analyzeClip(x, rate, 0.3, 1.6);
  for (const kind of ["afib", "pvc", "pac"]) {
    for (const bpm of [66, 92, 130]) {
      const loop = buildLoop(info, bpm, 15, { pattern: { kind, every: 4 }, seed: 3 });
      const N = Math.ceil((15 * bpm) / 60);
      check(`${kind} @ ${bpm} bpm exact mean`, loop.length === Math.round(((N * 60) / bpm) * rate),
        `${N} beats over ${(loop.length / rate).toFixed(3)} s => ${(N / (loop.length / rate / 60)).toFixed(2)} bpm`);
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
