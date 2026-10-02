// Regenerates src/data/auscultationAuditFlags.js: a per-clip acoustic
// "suspicion score" over every recording in public/assets/audio/auscultation,
// used ONLY as a sort order for the Admin Review "Clip Audit" listening page
// (src/education/AdminReviewTab.jsx) — a human ear makes the actual call,
// this just puts the clips most worth checking first.
//
// Score: each clip's [spectral band energies, heart-band periodicity,
// breath-band periodicity, zero-crossing rate] feature vector is compared to
// the corpus-wide heart-clip centroid vs. lung-clip centroid. A clip closer
// to the OTHER category's centroid than its own gets a positive score. This
// is deliberately crude — plenty of legitimate broadband lung sounds
// (rhonchi, crackles, wheeze) score high because they resemble murmurs
// acoustically — it is a triage aid, not a classifier verdict.
//
// Run after adding/removing clips, same as genAusculManifest.mjs:
//   node src/scripts/genAusculAuditFlags.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readWav16, findPeriod } from "../audio/retime.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../public/assets/audio/auscultation");
const outFile = path.resolve(here, "../data/auscultationAuditFlags.js");

// Minimal radix-2 FFT (in place, re/im arrays of equal power-of-two length).
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curWr = 1, curWi = 0;
      for (let j = 0; j < len / 2; j++) {
        const ur = re[i + j], ui = im[i + j];
        const vr = re[i + j + len / 2] * curWr - im[i + j + len / 2] * curWi;
        const vi = re[i + j + len / 2] * curWi + im[i + j + len / 2] * curWr;
        re[i + j] = ur + vr; im[i + j] = ui + vi;
        re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi;
        const nwr = curWr * wr - curWi * wi, nwi = curWr * wi + curWi * wr;
        curWr = nwr; curWi = nwi;
      }
    }
  }
}

// Fraction of total spectral energy in each band, averaged over up to 40
// windows of the clip (4096 samples each, Hann-windowed).
function bandEnergy(x, fs) {
  const N = 4096;
  const nFrames = Math.floor(x.length / N);
  if (nFrames < 1) return null;
  const bands = { lt100: 0, b100_300: 0, b300_1000: 0, gt1000: 0, total: 0 };
  const step = fs / N;
  for (let fr = 0; fr < Math.min(nFrames, 40); fr++) {
    const re = new Float32Array(N), im = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
      re[i] = x[fr * N + i] * w;
    }
    fft(re, im);
    for (let k = 1; k < N / 2; k++) {
      const freq = k * step;
      const mag = re[k] * re[k] + im[k] * im[k];
      bands.total += mag;
      if (freq < 100) bands.lt100 += mag;
      else if (freq < 300) bands.b100_300 += mag;
      else if (freq < 1000) bands.b300_1000 += mag;
      else bands.gt1000 += mag;
    }
  }
  if (bands.total <= 0) return null;
  return {
    lt100: bands.lt100 / bands.total,
    b100_300: bands.b100_300 / bands.total,
    b300_1000: bands.b300_1000 / bands.total,
    gt1000: bands.gt1000 / bands.total,
  };
}

function zcr(x) {
  let z = 0;
  for (let i = 1; i < x.length; i++) if (x[i] >= 0 !== x[i - 1] >= 0) z++;
  return z / x.length;
}

function loadWav(p) {
  const b = fs.readFileSync(p);
  return readWav16(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}

// Six-dimensional feature vector: 4 spectral bands, heart-band periodicity
// quality (0.3-1.6s), breath-band periodicity quality (1.5-6s, capped by
// clip duration), normalised zero-crossing rate.
function featuresOf(kind, id) {
  const { fs: fsamp, x } = loadWav(path.join(root, kind, `${id}.wav`));
  const be = bandEnergy(x, fsamp);
  if (!be) return null;
  const dur = x.length / fsamp;
  findPeriod(x, fsamp, 0.3, 1.6);
  const qHeart = findPeriod.lastQuality;
  const breathMax = Math.min(6, dur > 1.6 ? dur * 0.9 : 1.6);
  let qBreath = 0;
  if (breathMax > 1.5) {
    findPeriod(x, fsamp, 1.5, breathMax);
    qBreath = findPeriod.lastQuality;
  }
  return { ...be, qHeart: Math.max(0, Math.min(1, qHeart)), qBreath: Math.max(0, Math.min(1, qBreath)), zcr: Math.min(1, zcr(x) / 0.3) };
}

const KEYS = ["lt100", "b100_300", "b300_1000", "gt1000", "qHeart", "qBreath", "zcr"];
const vec = (f) => KEYS.map((k) => f[k]);
function centroid(vecs) {
  const n = vecs.length, d = vecs[0].length;
  const c = new Array(d).fill(0);
  for (const v of vecs) for (let i = 0; i < d; i++) c[i] += v[i] / n;
  return c;
}
function dist(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

// src/data/auscultationSounds.js's own manifest is the source of truth for
// which clips exist — walk it directly so a clip skipped there (name not
// understood) is never scored here either.
const { HEART_SOUNDS, LUNG_SOUNDS } = await import("../data/auscultationSounds.js");

function collect(map, kind) {
  const out = [];
  for (const [category, entries] of Object.entries(map)) {
    for (const e of entries) {
      const dir = e.dir || kind;
      const f = featuresOf(dir, e.id);
      if (!f) { console.log(`  (skipped, no usable feature vector: ${kind}/${e.id})`); continue; }
      out.push({ kind, category, id: e.id, loc: e.loc, src: e.src, dir, f });
    }
  }
  return out;
}

console.log("Analysing heart clips...");
const heart = collect(HEART_SOUNDS, "heart");
console.log("Analysing lung clips...");
const lung = collect(LUNG_SOUNDS, "lung");

const hc = centroid(heart.map((c) => vec(c.f)));
const lc = centroid(lung.map((c) => vec(c.f)));

const all = [...heart, ...lung].map((c) => {
  const v = vec(c.f);
  const dOwn = dist(v, c.kind === "heart" ? hc : lc);
  const dOther = dist(v, c.kind === "heart" ? lc : hc);
  return {
    kind: c.kind,
    category: c.category,
    id: c.id,
    loc: c.loc,
    src: c.src,
    dir: c.dir,
    susScore: +(dOwn - dOther).toFixed(3),
  };
});
all.sort((a, b) => b.susScore - a.susScore);

const js = `// Per-clip acoustic "suspicion score" for the Admin Review Clip Audit page
// (src/education/AdminReviewTab.jsx). GENERATED by
// src/scripts/genAusculAuditFlags.mjs from the real WAV files listed in
// src/data/auscultationSounds.js; do not hand-edit.
//
// susScore is the margin, in normalised feature-space, between a clip's
// distance to its OWN category's corpus-wide centroid and its distance to
// the OTHER category's centroid. Positive means the clip's spectral/
// periodicity profile resembles the other category more than its own —
// worth listening to, not proof of a mislabel. Sorted descending: the most
// worth-checking clips come first.
export const AUDIT_FLAGS = ${JSON.stringify(all, null, 1)};
`;
fs.writeFileSync(outFile, js);
console.log(`Wrote ${all.length} clips (${heart.length} heart, ${lung.length} lung) to ${path.relative(process.cwd(), outFile)}`);
console.log(`Flagged (susScore > 0): ${all.filter((c) => c.susScore > 0).length}`);
