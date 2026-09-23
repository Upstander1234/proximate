// 12-lead ECG synthesis for the printable tracing (TwelveLeadPrint.jsx). ecg.js
// draws the single-lead MONITOR strip; this builds all twelve leads plus a
// rhythm strip from the same live physiology snapshot: rate, rhythm kind
// (v.ecg), QRS width, PR, potassium, and infarct territory.
//
// Each beat is a sum of Gaussians (P, Q, R, S, ST plateau, T) whose amplitude
// per lead follows a normal-axis (~60 degree) table, then modified by the
// rhythm and by the territory of any ST elevation. It is a teaching
// approximation: there is no vector-cardiogram model behind it, so axis
// deviation, bundle branch block morphology and QT dispersion are not drawn.

export const LEAD_NAMES = ["I", "aVR", "V1", "V4", "II", "aVL", "V2", "V5", "III", "aVF", "V3", "V6"]; // 3 rows x 4 cols, standard layout

// [P, R, S, T] amplitude in mV for a normal-axis adult.
const BASE = {
  I: [0.10, 0.70, 0.10, 0.25], II: [0.15, 1.10, 0.10, 0.35], III: [0.05, 0.50, 0.15, 0.15],
  aVR: [-0.10, 0.10, 0.80, -0.30], aVL: [0.04, 0.40, 0.10, 0.10], aVF: [0.10, 0.80, 0.10, 0.25],
  V1: [0.08, 0.20, 1.00, -0.05], V2: [0.07, 0.40, 1.10, 0.40], V3: [0.07, 0.70, 0.70, 0.35],
  V4: [0.07, 1.20, 0.40, 0.40], V5: [0.07, 1.20, 0.20, 0.35], V6: [0.06, 1.00, 0.10, 0.30],
};

// Leads that show ST elevation for each territory, and the leads that show
// reciprocal depression.
export const TERRITORIES = {
  inferior: { up: ["II", "III", "aVF"], down: ["I", "aVL"] },
  anterior: { up: ["V1", "V2", "V3", "V4"], down: ["II", "III", "aVF"] },
  septal: { up: ["V1", "V2"], down: [] },
  lateral: { up: ["I", "aVL", "V5", "V6"], down: ["III", "aVF"] },
  anterolateral: { up: ["V3", "V4", "V5", "V6", "I", "aVL"], down: ["III", "aVF"] },
  // Posterior MI reads as ST DEPRESSION with tall R waves in V1-V3.
  posterior: { up: [], down: ["V1", "V2", "V3"] },
};

const gauss = (t, c, a, w) => a * Math.exp(-((t - c) * (t - c)) / (2 * w * w));
const smooth = (x) => 1 / (1 + Math.exp(-x));

// mulberry32, so a printed tracing is stable for a given seed.
function rng(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// One beat's voltage at time t (seconds, R peak at 0) for a lead.
function beat(t, lead, o) {
  const [p, r, s, tw] = BASE[lead];
  const q = o.qrs;
  let v = 0;
  if (o.hasP) v += gauss(t, -(o.pr - 0.05), p * o.pAmp, 0.022);
  v += gauss(t, -q * 0.32, -Math.abs(r) * 0.08, q * 0.14);        // q
  v += gauss(t, 0, r * o.rAmp, q * 0.16);                          // R
  v += gauss(t, q * 0.35, -s * o.rAmp, q * 0.16);                  // S
  if (o.terminalRInAvr && lead === "aVR") v += gauss(t, q * 0.6, 0.5, q * 0.14);
  const j = q * 0.5, tEnd = o.qt * 0.7;
  const st = o.st[lead] || 0;
  if (st) v += st * smooth((t - j) / 0.012) * (1 - smooth((t - tEnd) / 0.02));
  if (o.osborn) v += gauss(t, j + 0.03, 0.35 * Math.abs(BASE[lead][1]) + 0.1, 0.02);
  v += gauss(t, o.qt * 0.55, tw * o.tAmp + (st > 0 ? st * 0.3 : 0), o.tWidth);
  return v * o.scale;
}

function paramsFor(snap) {
  const hr = Math.max(20, Math.min(260, snap.hr || 72));
  const kind = snap.ecg || "sinus";
  const rr = 60 / hr;
  const o = {
    qrs: Math.max(0.07, Math.min(0.24, snap.qrsWidth || 0.09)), pr: snap.pr || 0.16,
    qt: 0.4 * Math.sqrt(rr), hasP: true, pAmp: 1, rAmp: 1, tAmp: 1, tWidth: 0.05, scale: 1,
    st: {}, osborn: false, terminalRInAvr: false,
  };
  if (["afib", "svt", "junctional"].includes(kind)) o.hasP = false;
  if (kind === "firstDegreeBlock") o.pr = Math.max(o.pr, 0.26);
  if (kind === "wideQRS" || kind === "chb") { o.qrs = Math.max(o.qrs, 0.16); o.terminalRInAvr = kind === "wideQRS"; }
  if (kind === "PEA") { o.rAmp = 0.35; o.qrs = Math.max(o.qrs, 0.14); o.pAmp = 0.5; }
  if (kind === "peakedT") { o.tAmp = 2.6; o.tWidth = 0.035; o.qrs = Math.max(o.qrs, 0.12); o.pAmp = 0.3; }
  if (kind === "osborn") o.osborn = true;
  if (kind === "svt") { for (const l of Object.keys(BASE)) o.st[l] = -0.08; }
  if (kind === "stemi") {
    const terr = TERRITORIES[snap.infarctTerritory || "inferior"] || TERRITORIES.inferior;
    for (const l of terr.up) o.st[l] = 0.45;
    for (const l of terr.down) o.st[l] = -0.2;
    if (snap.infarctTerritory === "posterior") { o.st.V1 = -0.2; o.st.V2 = -0.22; o.st.V3 = -0.15; }
  }
  return o;
}

// Beat times (R peaks) over `dur` seconds for the rhythm, with a per-beat flag
// for ectopic (wide) beats.
function schedule(snap, dur, rand) {
  const hr = Math.max(20, Math.min(260, snap.hr || 72));
  const kind = snap.ecg || "sinus";
  const rr = 60 / hr;
  const out = [];
  let t = 0.25 + rand() * 0.2, n = 0;
  while (t < dur + 0.5) {
    let gap = rr, ect = false;
    if (kind === "afib") gap = rr * (0.7 + rand() * 0.6);
    if (kind === "sinusPVC" && n % 4 === 3) { out.push({ t: t - rr * 0.32, ect: true }); t += rr * 0.68; n++; continue; }
    if (kind === "sinusPAC" && n % 5 === 3) gap = rr * 0.72;
    out.push({ t, ect });
    t += gap; n++;
  }
  return out;
}

// Voltage of one lead over [t0, t0+dur) sampled at `fs` Hz, as [t, mV] pairs.
function leadTrace(lead, snap, t0, dur, fs, rand, o, beats) {
  const kind = snap.ecg || "sinus";
  const pts = [];
  const sgn = BASE[lead][1] >= BASE[lead][2] ? 1 : -1;
  const hr = Math.max(20, Math.min(260, snap.hr || 72));
  const seeds = Array.from({ length: 6 }, () => [rand() * 6.28, 3 + rand() * 6, 0.1 + rand() * 0.25]);
  for (let i = 0; i < dur * fs; i++) {
    const t = t0 + i / fs;
    let v = 0;
    if (kind === "asystole") v = (rand() - 0.5) * 0.03;
    else if (kind === "VF") v = seeds.reduce((s, [ph, f, a]) => s + a * Math.sin(6.28 * f * t + ph), 0) * (sgn > 0 ? 1 : -1);
    else if (kind === "VT") v = sgn * 1.4 * Math.sin(6.28 * (hr / 60) * t) + 0.3 * Math.sin(6.28 * 2 * (hr / 60) * t);
    else if (kind === "torsades") v = sgn * 1.6 * Math.sin(6.28 * (hr / 60) * t) * Math.sin(6.28 * 0.45 * t + 0.5);
    else {
      // Contribute from the SINGLE nearest beat only, not every beat within
      // a fixed +-0.5/0.6s window. That window is wider than one QRST
      // complex's own real duration, so whenever two beats land closer
      // together than it — a fast baseline rate, or afib's randomized RR
      // jitter putting two beats back-to-back by chance — their tails used
      // to sum together and garble the trace into a distorted, "gappy"
      // patch wherever that happened, which tracked the RNG and so looked
      // "random." Picking only the nearest beat means every sample reflects
      // exactly one complex, however tightly packed the rhythm gets.
      let nearest = null, nearestAbs = Infinity, nearestIdx = -1;
      for (let bi = 0; bi < beats.length; bi++) {
        const a = Math.abs(t - beats[bi].t);
        if (a < nearestAbs) { nearestAbs = a; nearest = beats[bi]; nearestIdx = bi; }
      }
      if (nearest) {
        // The contribution window is clamped to the actual gap to the
        // neighboring beats (never wider than the complex itself needs, at
        // least +-0.5/0.6s). Without this, a slow rhythm's long flat TP
        // segment is correct, but afib's randomized RR jitter or a
        // bradycardic rr could make one beat's window reach past the
        // midpoint to its neighbor, which (before the nearest-beat fix
        // above) used to visibly distort the trace; this keeps the window
        // itself proportionate to the real beat-to-beat spacing too.
        const prevGap = nearestIdx > 0 ? nearest.t - beats[nearestIdx - 1].t : Infinity;
        const nextGap = nearestIdx < beats.length - 1 ? beats[nearestIdx + 1].t - nearest.t : Infinity;
        const lo = -Math.min(0.5, prevGap / 2), hi = Math.min(0.6, nextGap / 2);
        const dt = t - nearest.t;
        if (dt >= lo && dt <= hi) {
          v += nearest.ect ? gauss(dt, 0, sgn * -1.3, 0.055) + gauss(dt, 0.14, sgn * 0.6, 0.07) : beat(dt, lead, o);
        }
      }
      if (kind === "afib") v += 0.05 * Math.sin(6.28 * 6.5 * t + seeds[0][0]) + (rand() - 0.5) * 0.03;
      if (kind === "chb") v += gauss(((t % 0.8) + 0.8) % 0.8, 0.4, BASE[lead][0] * 1.4, 0.022);
    }
    v += (rand() - 0.5) * 0.012; // trace noise
    pts.push([t - t0, v]);
  }
  return pts;
}

// Whole tracing: {leads: {name: [t,mV][]}, rhythm: [t,mV][], meta}. Layout is
// 4 columns x 3 rows of 2.5 s each (a standard 10 s ECG), plus a 10 s lead II
// rhythm strip.
export function twelveLead(snap) {
  const rand = rng(snap.seed || 1);
  const o = paramsFor(snap);
  const fs = 250;
  const beats = schedule(snap, 10.5, rand);
  const cols = [0, 2.5, 5, 7.5];
  const leads = {};
  LEAD_NAMES.forEach((name, i) => {
    leads[name] = leadTrace(name, snap, cols[i % 4], 2.5, fs, rand, o, beats);
  });
  const rhythm = leadTrace("II", snap, 0, 10, fs, rand, o, beats);
  const hr = Math.round(snap.hr || 72);
  // No measurable intervals on a chaotic or absent rhythm.
  const chaotic = ["VF", "asystole", "VT", "torsades"].includes(snap.ecg);
  const meta = {
    rate: ["VF", "asystole"].includes(snap.ecg) ? "-" : hr,
    pr: o.hasP && !chaotic ? Math.round(o.pr * 1000) : "-",
    qrs: chaotic ? "-" : Math.round(o.qrs * 1000),
    qt: chaotic ? "-" : Math.round(o.qt * 1000),
    // Bazett-corrected QT (QT / sqrt(RR)); axes are drawn normal, see header.
    qtc: chaotic ? "-" : Math.round((o.qt / Math.sqrt(60 / Math.max(20, Math.min(260, snap.hr || 72)))) * 1000),
    axes: chaotic ? "- / - / -" : "50 / 60 / 40",
  };
  return { leads, rhythm, meta };
}
