// What a stethoscope hears, derived every time from the live physiology so the
// sound follows the patient: change the patient and the sound changes with them.
// Shared by the AuscultationMinigame (what plays) and the exam log (what a probe
// reports). The recordings are open datasets (see data/auscultationSounds.js and
// credits.js); the RATES and RHYTHM come from the engine and are exact
// (audio/retime.js), never the recording's own rate.
//
// Not covered by the recordings, so left silent or approximated and listed on the
// CLAUDE.md queue: pericardial rub and tension pneumothorax (played as near-silence,
// an attenuation, not a recording). Mitral and aortic regurgitation use pediatric
// CirCor clips, a real murmur of the right timing retimed to the adult's rate.
import { HEART_SOUNDS, LUNG_SOUNDS, AUSC_BASE } from "../data/auscultationSounds.js";

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const heartUrl = (c) => `${AUSC_BASE}/${c.dir || "heart"}/${c.id}.wav`;
const lungUrl = (c) => `${AUSC_BASE}/${c.dir || "lung"}/${c.id}.wav`;

// ── Heart ────────────────────────────────────────────────────────────────
// finding: normal | systolic | diastolic | gallop | irregular | muffled | silent
// pattern: how the beats are spaced. The engine models AFib, premature ventricular
// beats (pvcFrequency per minute) and premature atrial beats (atrialEctopicFocus);
// dropped-beat AV block is not simulated, so it is not sounded.
export function heartSound(pat, v) {
  const hr = v?.hr ?? 0;
  if (!(hr > 0)) return { finding: "silent", template: null, rate: 0, pattern: { kind: "regular" }, gain: 0, lowpass: null, rateClass: "none" };
  const rateClass = hr < 60 ? "slow" : hr > 100 ? "fast" : "normal";
  let template = "Normal", finding = "normal";
  if ((pat?.aorticStenosisSeverity ?? 0) > 0.2) { template = "Mid Systolic Murmur"; finding = "systolic"; }
  else if ((pat?.mitralRegurgFrac ?? 0) > 0.15) { template = "Holosystolic Murmur"; finding = "systolic"; }
  else if ((pat?.aorticRegurgFrac ?? 0) > 0.15) { template = "Early Diastolic Murmur"; finding = "diastolic"; }
  else if ((pat?.mitralStenosisSeverity ?? 0) > 0.2) { template = "Late Diastolic Murmur"; finding = "diastolic"; }
  else if ((v?.edema ?? 0) >= 0.3) { template = "S3"; finding = "gallop"; }        // volume-overload gallop, as the exam action reads it
  else if ((pat?.hocmObstruction ?? 0) > 0.2) { template = "S4"; finding = "gallop"; }

  let pattern = { kind: "regular" };
  const pvc = pat?.pvcFrequency ?? 0, pac = pat?.atrialEctopicFocus ?? 0;
  if (v?.ecg === "afib") pattern = { kind: "afib" };
  else if (pvc >= 1) pattern = { kind: "pvc", every: clamp(Math.round(hr / pvc), 2, 12) };       // one premature beat per (hr / pvc) beats
  else if (pac >= 0.3) pattern = { kind: "pac", every: clamp(Math.round(8 - 5 * pac), 2, 8) };  // approximation: the engine gives a focus strength, not a rate
  if (pattern.kind !== "regular" && finding === "normal") finding = "irregular";

  const muffled = (pat?.pericardialEffusion ?? 0) > 0.3;
  if (muffled) finding = "muffled";
  return {
    finding, template, rate: hr, pattern, rateClass,
    gain: muffled ? clamp(0.5 - (pat.pericardialEffusion - 0.3) * 0.6, 0.12, 0.5) : 1,
    lowpass: muffled ? 220 : null,
  };
}

// A recording for a template near a location: regular recordings only (noisy ones
// are skipped), preferring the exact location, then any clip not tied to one place,
// with `seed` choosing between equals so different spots give different recordings.
function pickVariant(list, loc, seed) {
  const regular = list.filter((c) => c.q == null || c.q >= 0.3);
  const base = regular.length ? regular : list;
  const near = base.filter((c) => c.loc === loc || c.loc === "any");
  const pool = near.length ? near : base;
  return pool[Math.abs(seed | 0) % pool.length];
}
export const pickHeartClip = (template, area, seed = 0) => pickVariant(HEART_SOUNDS[template] || HEART_SOUNDS.Normal, area, seed);
export const pickLungClip = (sound, field, seed = 0) => pickVariant(LUNG_SOUNDS[sound] || LUNG_SOUNDS.Normal, field, seed);

// ── Lungs ────────────────────────────────────────────────────────────────
// Breath envelope weights per sound: wheeze is expiratory, fine crackles late-inspiratory.
const SHAPES = {
  Normal: { insp: 1, exp: 0.6 }, Wheezing: { insp: 0.6, exp: 1 }, "Fine Crackles": { insp: 1, exp: 0.15 },
  "Coarse Crackles": { insp: 1, exp: 0.6 }, Rhonchi: { insp: 1, exp: 0.9 }, "Pleural Rub": { insp: 0.9, exp: 0.9 },
  Stridor: { insp: 1, exp: 0.25 },
};

// field: side R|L + level U|M|L + A, e.g. "RLA". finding: clear | wheeze | crackles |
// rhonchi | diminished | absent | dull | none (apnea)
export function lungSound(pat, v, field, s) {
  const side = field[0], lvl = field[1];
  const rr = v?.rr ?? 0;
  const base = { rr, field, gain: 1, lowpass: null };
  if (!(rr > 0)) return { ...base, finding: "none", sound: null, shape: SHAPES.Normal, gain: 0 };
  const ptxSide = (pat?.ptxSide || "R")[0].toUpperCase();
  if ((v?.ptx === "tptx" || v?.ptx === "ptx") && side === ptxSide) {
    return v.ptx === "tptx"
      ? { ...base, finding: "absent", sound: "Normal", shape: SHAPES.Normal, gain: 0.03 }
      : { ...base, finding: "diminished", sound: "Normal", shape: SHAPES.Normal, gain: 0.3 };
  }
  const eff = pat?.pleuralEffusion ?? 0;
  const effSide = pat?.pleuralEffusionSide || "both";
  const effHere = eff > 0.2 && (effSide === "both" || effSide[0].toUpperCase() === side)
    && (lvl === "L" || (lvl === "M" && eff > 0.5));
  if (effHere) return { ...base, finding: "dull", sound: "Normal", shape: SHAPES.Normal, gain: clamp(0.6 - eff * 0.6, 0.12, 0.5), lowpass: 350 };
  const edema = v?.edema ?? 0;
  const crackleHere = edema >= 0.3 && (lvl !== "U" || edema >= 0.6);
  if (s?.aspirated && side === "R" && lvl === "L") return { ...base, finding: "crackles", sound: "Coarse Crackles", shape: SHAPES["Coarse Crackles"] };
  if (crackleHere) {
    const sound = edema < 0.55 ? "Fine Crackles" : "Coarse Crackles";
    return { ...base, finding: "crackles", sound, shape: SHAPES[sound] };
  }
  if (pat?.upperAirwayObstruction > 0.5 && LUNG_SOUNDS.Stridor) return { ...base, finding: "stridor", sound: "Stridor", shape: SHAPES.Stridor };
  if ((v?.bronch ?? 0) >= 0.3) return { ...base, finding: "wheeze", sound: "Wheezing", shape: SHAPES.Wheezing };
  if ((pat?.airwayFluid ?? 0) >= 0.25) return { ...base, finding: "rhonchi", sound: "Rhonchi", shape: SHAPES.Rhonchi };
  return { ...base, finding: "clear", sound: "Normal", shape: SHAPES.Normal };
}

// The most significant finding across one side's three fields (what a full exam of
// that side finds). Used by the exam log.
const RANK = { absent: 6, diminished: 5, dull: 4, stridor: 4, crackles: 3, wheeze: 2, rhonchi: 1, clear: 0, none: -1 };
export function sideFinding(pat, v, side, s) {
  let best = "clear";
  for (const lvl of ["U", "M", "L"]) {
    const f = lungSound(pat, v, `${side}${lvl}A`, s).finding;
    if ((RANK[f] ?? 0) > (RANK[best] ?? 0)) best = f;
  }
  return best;
}

// ── Where on the chest ───────────────────────────────────────────────────
// Body coordinates match ChestBody.jsx (viewBox 300 x 360). The view is the body
// as the player sees it: from the FRONT the patient's right is on the player's
// left; from the BACK the patient's right is on the player's right.
export const CHEST_VIEWBOX = { w: 300, h: 360 };
const LUNG_FRONT = { R: { cx: 106, cy: 150, rx: 44, ry: 84 }, L: { cx: 194, cy: 150, rx: 42, ry: 80 } };
const LUNG_BACK = { R: { cx: 194, cy: 158, rx: 46, ry: 92 }, L: { cx: 106, cy: 158, rx: 46, ry: 92 } };
const VALVES = { RUSB: { x: 134, y: 100 }, LUSB: { x: 166, y: 100 }, LLSB: { x: 160, y: 152 }, A: { x: 200, y: 186 } };
const HEART_CENTER = { x: 172, y: 158 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function lungAt(view, x, y) {
  const set = view === "back" ? LUNG_BACK : LUNG_FRONT;
  // Which lung the point is in (or nearest to).
  const side = view === "back" ? (x < 150 ? "L" : "R") : (x < 150 ? "R" : "L");
  const e = set[side];
  const d2 = ((x - e.cx) / e.rx) ** 2 + ((y - e.cy) / e.ry) ** 2;
  const top = view === "back" ? 118 : 112, mid = view === "back" ? 178 : 166;
  const level = y < top ? "U" : y < mid ? "M" : "L";
  // 1 well inside the lung, falling to near nothing outside it.
  const inside = d2 <= 0.5 ? 1 : d2 >= 1.3 ? 0.03 : 1 - ((d2 - 0.5) / 0.8) * 0.97;
  return { field: `${side}${level}A`, gain: inside };
}

function heartAt(view, x, y) {
  if (view === "back") return { area: "A", gain: clamp(0.14 * Math.exp(-(((x - 120) ** 2 + (y - 165) ** 2) / 3500)), 0, 0.14) };
  let best = "A", bd = Infinity;
  for (const [k, p] of Object.entries(VALVES)) { const d = dist({ x, y }, p); if (d < bd) { bd = d; best = k; } }
  const atValve = Math.exp(-((bd / 24) ** 2));                                   // loudest right at a valve area
  const precordium = 0.28 * Math.exp(-((dist({ x, y }, HEART_CENTER) / 46) ** 2));
  const transmitted = 0.1 * Math.exp(-((dist({ x, y }, { x: 150, y: 150 }) / 110) ** 2));
  return { area: best, gain: clamp(Math.max(atValve, precordium, transmitted), 0, 1) };
}

// Everything audible at a point: a list of layers for the player (see
// audio/auscultationPlayer.js) plus a short readout of which layers are on.
export function chestSpec(pat, v, view, x, y, s) {
  const seed = Math.floor(x / 26) * 31 + Math.floor(y / 26) * 7;
  const layers = [];
  const lung = lungAt(view, x, y);
  const ls = lungSound(pat, v, lung.field, s);
  if (ls.sound && lung.gain * ls.gain > 0.005) {
    const clip = pickLungClip(ls.sound, lung.field, seed);
    layers.push({ key: `L:${clip.id}`, url: lungUrl(clip), kind: "lung", rate: ls.rr, shape: ls.shape, gain: lung.gain * ls.gain, lowpass: ls.lowpass });
  }
  const heart = heartAt(view, x, y);
  const hs = heartSound(pat, v);
  if (hs.template && heart.gain * hs.gain > 0.005) {
    const clip = pickHeartClip(hs.template, heart.area, seed);
    layers.push({ key: `H:${clip.id}`, url: heartUrl(clip), kind: "heart", rate: hs.rate, pattern: hs.pattern, gain: heart.gain * hs.gain, lowpass: hs.lowpass });
  }
  return { layers, lung, heart, ls, hs };
}
