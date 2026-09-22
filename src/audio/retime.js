// Beat and breath retiming for the auscultation sounds. A recorded clip has some
// fixed rate (say 75 beats a minute). The physiology engine says the patient is
// at 67, and the sound has to be exactly 67, with the same timbre and pitch as
// the recording. So instead of speeding the clip up or slowing it down, we cut
// ONE real cycle out of it and re-lay it end to end at exactly the engine's
// period, lengthening or shortening the quiet gap between beats (diastole for a
// heart, the pause between breaths for lungs). Only when the gap alone can't
// absorb the change is the active part time-compressed, with WSOLA, which keeps
// the pitch. Pure functions on Float32Array so it can be tested in Node.

export function readWav16(buf) {
  const dv = new DataView(buf);
  const tag = (o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
  if (tag(0) !== "RIFF" || tag(8) !== "WAVE") throw new Error("not a WAV file");
  let o = 12, fs = 0, ch = 1, bits = 16, data = null;
  while (o + 8 <= dv.byteLength) {
    const id = tag(o), size = dv.getUint32(o + 4, true);
    if (id === "fmt ") { ch = dv.getUint16(o + 10, true); fs = dv.getUint32(o + 12, true); bits = dv.getUint16(o + 22, true); }
    if (id === "data") { data = { start: o + 8, size }; break; }
    o += 8 + size + (size & 1);
  }
  if (!data || bits !== 16) throw new Error("expected 16-bit PCM");
  const n = Math.floor(data.size / 2 / ch);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = dv.getInt16(data.start + i * 2 * ch, true) / 32768;
  return { fs, x };
}

// Rectified, moving-average amplitude envelope.
export function envelope(x, win) {
  const n = x.length, e = new Float32Array(n);
  const h = Math.max(1, Math.floor(win / 2));
  let acc = 0;
  const abs = (i) => Math.abs(x[Math.min(n - 1, Math.max(0, i))]);
  for (let i = -h; i <= h; i++) acc += abs(i);
  for (let i = 0; i < n; i++) { e[i] = acc / (2 * h + 1); acc += abs(i + h + 1) - abs(i - h); }
  return e;
}

// Dominant period, in seconds, between minP and maxP, from the autocorrelation of
// the envelope (decimated to ~100 Hz).
export function findPeriod(x, fs, minP, maxP) {
  const dec = Math.max(1, Math.round(fs / 100));
  const e = envelope(x, Math.round(fs * 0.02));
  const m = Math.floor(e.length / dec);
  const d = new Float32Array(m);
  let mean = 0;
  for (let i = 0; i < m; i++) { d[i] = e[i * dec]; mean += d[i]; }
  mean /= m;
  for (let i = 0; i < m; i++) d[i] -= mean;
  const rate = fs / dec;
  const lo = Math.max(2, Math.floor(minP * rate)), hi = Math.min(m - 2, Math.ceil(maxP * rate));
  const ac = new Float32Array(hi + 2);
  for (let lag = lo - 1; lag <= hi + 1; lag++) {
    let s = 0;
    for (let i = 0; i + lag < m; i++) s += d[i] * d[i + lag];
    ac[lag] = s / (m - lag);
  }
  // Smallest lag whose correlation is close to the strongest one, so a repeating
  // cycle is not mistaken for two cycles (the autocorrelation peaks at every
  // multiple of the period, and 2P can be marginally higher than P).
  let bv = -Infinity, v0 = 0;
  for (let i = 0; i < m; i++) v0 += d[i] * d[i];
  v0 /= m || 1;
  const peaks = [];
  for (let lag = lo; lag <= hi; lag++) {
    if (ac[lag] >= ac[lag - 1] && ac[lag] >= ac[lag + 1]) { peaks.push(lag); if (ac[lag] > bv) bv = ac[lag]; }
  }
  let best = peaks.length ? peaks[0] : lo;
  for (const lag of peaks) if (ac[lag] >= 0.8 * bv) { best = lag; break; }
  // Parabolic refinement of the peak for sub-sample accuracy.
  const a = ac[best - 1], b = ac[best], c = ac[best + 1];
  const den = a - 2 * b + c;
  const frac = den !== 0 ? 0.5 * (a - c) / den : 0;
  findPeriod.lastQuality = v0 > 0 ? ac[best] / v0 : 0;   // normalised periodicity, 0 to 1
  return (best + frac) / rate;
}

// Ping-pong fill: extends a short segment to `len` samples without a click, by
// reflecting it. Used to lengthen the quiet gap with real background noise.
function pingPong(seg, len) {
  const out = new Float32Array(len);
  const n = seg.length;
  if (n === 0) return out;
  const period = Math.max(1, 2 * (n - 1));
  for (let i = 0; i < len; i++) {
    const p = i % period;
    out[i] = seg[p < n ? p : period - p];
  }
  return out;
}

// Waveform-similarity overlap-add time stretch: output length = round(len * ratio),
// pitch preserved. ratio < 1 compresses.
export function timeStretch(x, ratio) {
  const n = x.length, outLen = Math.max(1, Math.round(n * ratio));
  const W = Math.max(32, Math.min(256, Math.floor(n / 4) & ~1)), H = W / 2, tol = Math.floor(W / 4);
  const win = new Float32Array(W);
  for (let i = 0; i < W; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * (i + 0.5)) / W);
  const out = new Float32Array(outLen + W), norm = new Float32Array(outLen + W);
  let prevPos = 0;
  for (let k = 0, o = 0; o < outLen; k++, o += H) {
    const nominal = Math.round(o / ratio);
    let pos = nominal;
    if (k > 0) {
      // Best-matching input offset near nominal, against the natural continuation of the last frame.
      let bestScore = -Infinity;
      const ref = prevPos + H;
      for (let d = -tol; d <= tol; d++) {
        const p = nominal + d;
        if (p < 0 || p + W > n) continue;
        let s = 0;
        for (let i = 0; i < H; i += 2) s += x[p + i] * (ref + i < n ? x[ref + i] : 0);
        if (s > bestScore) { bestScore = s; pos = p; }
      }
    }
    pos = Math.max(0, Math.min(n - W, pos));
    for (let i = 0; i < W && o + i < out.length; i++) { out[o + i] += x[pos + i] * win[i]; norm[o + i] += win[i]; }
    prevPos = pos;
  }
  const res = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) res[i] = norm[i] > 1e-3 ? out[i] / norm[i] : 0;
  return res;
}

// Analyse a clip once: its period and one reusable cycle that begins with the
// quiet gap. Returns null if no usable regular structure is found.
export function analyzeClip(x, fs, minP, maxP) {
  const P = findPeriod(x, fs, minP, maxP);
  const quality = findPeriod.lastQuality;
  const Ps = Math.round(P * fs);
  const win = Math.max(2, Math.round(fs * 0.02));
  const e = envelope(x, win);
  const sorted = Float32Array.from(e).sort();
  const hi = sorted[Math.floor(sorted.length * 0.95)] || 1e-6;
  const thr = 0.12 * hi;
  // Longest quiet run in the clip.
  let bestS = -1, bestL = 0, s = -1;
  for (let i = 0; i <= e.length; i++) {
    const low = i < e.length && e[i] < thr;
    if (low && s < 0) s = i;
    if (!low && s >= 0) { if (i - s > bestL) { bestL = i - s; bestS = s; } s = -1; }
  }
  const minGap = Math.round(0.05 * fs);
  if (bestL < minGap || bestL > Ps * 0.9) {
    // No clean gap (or it is nearly the whole period): use a cycle from the loudest onset.
    let m = 0;
    for (let i = 0; i < e.length - Ps; i++) if (e[i] > e[m]) m = i;
    const t0 = Math.max(0, Math.min(m - Math.round(fs * 0.05), x.length - Ps));
    return { P, fs, quality, gapless: true, cycle: x.slice(t0, t0 + Ps), gap: 0 };
  }
  // Bring the gap start into the first period so a full period follows it.
  let gs = bestS;
  while (gs + Ps > x.length) gs -= Ps;
  while (gs - Ps >= 0 && gs >= Ps) gs -= Ps;
  if (gs < 0) gs = 0;
  return { P, fs, quality, gapless: false, cycle: x.slice(gs, gs + Ps), gap: bestL };
}

// Exactly `len` samples of one cycle at the requested length, built from the
// analysed cycle: the gap absorbs the change, WSOLA handles what it cannot.
export function cycleAt(info, len) {
  const { cycle, gap } = info;
  const Ps = cycle.length;
  const out = new Float32Array(len);
  if (info.gapless) {
    const r = Math.max(0.5, Math.min(2, len / Ps));
    const st = timeStretch(cycle, r);
    out.set(st.subarray(0, Math.min(len, st.length)));
    return out;
  }
  const gapSeg = cycle.subarray(0, gap), active = cycle.subarray(gap);
  const minGap = Math.max(Math.round(info.fs * 0.03), Math.round(gap * 0.2));
  let newGap = gap + (len - Ps);
  let act = active;
  if (newGap < minGap) {
    // Not enough gap to give up: compress the active part as well.
    newGap = minGap;
    const want = Math.max(8, len - newGap);
    if (want < active.length) act = timeStretch(active, Math.max(0.5, want / active.length));
  }
  let g;
  if (newGap <= gap) {
    const a = Math.floor(newGap / 2), b = newGap - a;
    g = new Float32Array(newGap);
    g.set(gapSeg.subarray(0, a), 0);
    g.set(gapSeg.subarray(gap - b), a);
  } else {
    // Keep the real ends and grow the middle by reflection.
    const keep = Math.min(Math.floor(gap / 3), Math.round(info.fs * 0.01));
    const mid = pingPong(gapSeg.subarray(keep, gap - keep), newGap - 2 * keep);
    g = new Float32Array(newGap);
    g.set(gapSeg.subarray(0, keep), 0);
    g.set(mid, keep);
    g.set(gapSeg.subarray(gap - keep), newGap - keep);
  }
  const room = len - g.length;
  out.set(g.subarray(0, Math.min(g.length, len)), 0);
  if (room > 0) out.set(act.subarray(0, Math.min(act.length, room)), g.length);
  // Short fades at the seam so consecutive cycles never click.
  const f = Math.min(24, len >> 3);
  for (let i = 0; i < f; i++) { const w = i / f; out[i] *= w; out[len - 1 - i] *= w; }
  return out;
}

// Deterministic PRNG so an irregular rhythm is stable for a given seed.
function rng(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// A seamless loop of at least `minSec` seconds whose cycles land at exactly
// `rate` per minute. N whole cycles fill an integer number of samples, so the
// loop point is on a cycle boundary and the average rate is exact across it.
// irregular=true (atrial fibrillation) varies each interval but keeps the mean.
// Beat-to-beat interval pattern, as multiples of the mean period, mean exactly 1.
//   regular  every interval equal
//   afib     irregularly irregular: no repeating pattern
//   pvc      every `every`-th beat is a premature ventricular beat: a short interval
//            before it and a compensatory pause after (the pair spans two periods)
//   pac      every `every`-th beat is a premature atrial beat: a short interval and
//            a slightly-longer-than-normal pause (not fully compensatory)
export function intervalPattern(kind, N, rand, every = 4) {
  const w = new Array(N).fill(1);
  if (kind === "afib") {
    for (let i = 0; i < N; i++) w[i] = 0.45 + rand() * 1.1;
  } else if ((kind === "pvc" || kind === "pac") && N > 2) {
    const k = Math.max(2, Math.min(N - 1, Math.round(every)));
    const [early, after] = kind === "pvc" ? [0.6, 1.4] : [0.72, 1.08];
    // Offset the first premature beat by a random amount so a loop doesn't always start on one.
    for (let j = k - 1 + Math.floor(rand() * k); j < N; j += k) {
      if (j - 1 >= 0) w[j - 1] = early;
      w[j] = after;
    }
  }
  const sum = w.reduce((a, b) => a + b, 0);
  return w.map((x) => (x * N) / sum);
}

export function buildLoop(info, rate, minSec = 15, opts = {}) {
  const fs = info.fs;
  if (!(rate > 0)) return new Float32Array(Math.round(minSec * fs));
  const T = 60 / rate;
  const N = Math.max(1, Math.ceil((minSec * rate) / 60));
  const total = Math.round(N * T * fs);
  const rand = rng(opts.seed || 1);
  // opts.pattern = { kind, every }; opts.irregular is the older spelling of afib.
  const kind = opts.pattern?.kind || (opts.irregular ? "afib" : "regular");
  const weights = intervalPattern(kind, N, rand, opts.pattern?.every);
  const irregular = kind !== "regular";
  const out = new Float32Array(total);
  const bounds = [0];
  let acc = 0;
  for (let i = 0; i < N; i++) { acc += weights[i]; bounds.push(Math.round((acc / N) * total)); }
  bounds[N] = total;
  for (let i = 0; i < N; i++) {
    const len = bounds[i + 1] - bounds[i];
    if (len <= 0) continue;
    const c = cycleAt(info, len);
    const g = irregular ? 0.8 + rand() * 0.35 : 1;
    for (let k = 0; k < len; k++) out[bounds[i] + k] = c[k] * g;
  }
  return out;
}

// Breath sound at an exact rate. Lung recordings are not periodic enough to cut a
// clean cycle from, so keep the recording's own texture (its spectrum and its
// impulsive crackles, wheezes and rubs) and re-impose a breath envelope at exactly
// `rate` breaths a minute. The clip's own loudness swell is flattened first so it
// does not fight the new envelope. `shape` weights inspiration and expiration:
// {insp, exp} gains, each 0 to 1.
export function buildBreathLoop(x, fs, rate, shape = { insp: 1, exp: 0.7 }, minSec = 15) {
  if (!(rate > 0)) return new Float32Array(Math.round(minSec * fs));
  const T = 60 / rate;
  const N = Math.max(1, Math.ceil((minSec * rate) / 60));
  const total = Math.round(N * T * fs);
  // Flatten the clip's own breath swell completely, so the only rhythm left is the
  // one imposed below. The window (0.6 s) is far shorter than a breath but longer
  // than a crackle or a wheeze onset, so those keep their character.
  const env = envelope(x, Math.round(fs * 0.6));
  const sorted = Float32Array.from(env).sort();
  const ref = sorted[Math.floor(sorted.length * 0.9)] || 1e-4;
  const flat = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) flat[i] = (x[i] * ref) / (env[i] + 0.15 * ref);
  const out = new Float32Array(total);
  const bell = (t, c, w) => { const u = Math.abs(t - c) / w; return u >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * u); };
  for (let i = 0; i < total; i++) {
    const ph = ((i / fs) % T) / T;               // 0..1 within the breath
    const g = shape.insp * bell(ph, 0.22, 0.24) + shape.exp * bell(ph, 0.6, 0.26);
    out[i] = flat[i % flat.length] * (0.04 + g);
  }
  // Seamless loop: cross-fade the tail into the head over a few ms.
  const f = Math.min(64, total >> 3);
  for (let i = 0; i < f; i++) { const w = i / f; out[i] *= w; out[total - 1 - i] *= w; }
  return out;
}
