// What a stethoscope hears, derived every time from the live physiology so the
// sound follows the patient: change the patient and the sound changes with them.
// Shared by the AuscultationMinigame (what plays) and the exam log (what a probe
// reports). The recordings are open datasets (see data/auscultationSounds.js and
// credits.js); the RATES and RHYTHM come from the engine and are exact
// (audio/retime.js), never the recording's own rate.
//
// Not covered by the recordings, so left silent or approximated and listed on the
// CLAUDE.md queue: pericardial rub. Tension pneumothorax's own breath sounds are
// played as near-silence, an attenuation, not a recording — but its real effect on
// the HEART exam (mediastinal shift moving the heart away from the affected side,
// not muffling it — muffling is cardiac tamponade's own Beck's-triad sign, already
// modeled via pericardialEffusion) is a real positional mechanism, not silence; see
// heartAt()'s mediastinalShift(). Mitral and aortic regurgitation use pediatric
// CirCor clips, a real murmur of the right timing retimed to the adult's rate.
//
// RC/LC ("beside the sternum") are two more real HLS-CMDS listening points besides
// the four classic valve areas, but heartAt() below only ever resolves a click to
// one of those four (RUSB/LUSB/LLSB/A) — there's no reason to carve out new click
// territory just to give RC/LC their own target. Instead pickHeartClip() treats an
// RUSB query as also matching an RC-tagged clip, and any left-sided query
// (LUSB/LLSB/A) as also matching an LC-tagged one, so those recordings are reachable
// as a genuine "near" match rather than only ever turning up via the base fallback.
//
// LUNG_SOUNDS["Cough"] (one clip, "USR" source) is deliberately NOT selected by
// anything below — it's a single cough sound, not a periodic breath-cycle loop,
// and the retiming pipeline (audio/retime.js) is built around a repeating cycle
// rate, not a one-shot event. Wiring it in for real would need a genuine
// cough-interjection mechanism (when to fire it, how it layers over the ongoing
// breath loop) that doesn't exist yet — left cataloged, not guessed into a wrong
// use, matching this project's own precedent for dead-but-real HEART_SOUNDS
// categories (see CLAUDE.md's queue).
//
// The other two "USR" lung clips (Normal, Diminished) were both trimmed before
// being added, not used as originally supplied: each source recording had TWO
// breaths with real dead air between them. buildBreathLoop() (audio/retime.js)
// assumes continuous breath texture throughout the source and just flattens +
// tiles it, rather than cutting one cycle the way heart clips do (its own header
// comment explains why) — a genuine silent gap survives that flattening step
// almost untouched (confirmed by measurement: samples in the gap are already
// near-zero, so normalizing by the local envelope can't manufacture signal that
// isn't there) and gets tiled at the SOURCE's own length, drifting in and out of
// phase with the imposed breath rate and occasionally landing right on an
// inhale — an audible, wrong-sounding dropout unrelated to the patient's actual
// rate. Both clips were trimmed to one continuous, silence-free stretch (~2.5s)
// before being added; verified by rebuilding a 60s loop from each and confirming
// the only remaining quiet points are the envelope's own intentional
// between-breath floor, not leftover source silence.
import { HEART_SOUNDS, LUNG_SOUNDS, AUSC_BASE } from "../data/auscultationSounds.js";

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const heartUrl = (c) => `${AUSC_BASE}/${c.dir || "heart"}/${c.id}.wav`;
const lungUrl = (c) => `${AUSC_BASE}/${c.dir || "lung"}/${c.id}.wav`;

// ── Heart ────────────────────────────────────────────────────────────────
// finding: normal | systolic | diastolic | gallop | block | irregular | muffled | silent
// pattern: how the beats are spaced. The engine models AFib, premature ventricular
// beats (pvcFrequency per minute) and premature atrial beats (atrialEctopicFocus);
// dropped-beat AV block is not simulated, so it is not sounded — but 1st-degree and
// complete (3rd-degree) block are both real, live, already-published rhythm states
// (v.ecg), so those two pick from the "AV Block" recordings for a more authentic
// texture (real S1 heard through an actual conduction-diseased heart) even though
// the dropped-beat/AV-dissociation TIMING itself isn't modeled.
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
  else if (v?.ecg === "chb" || v?.ecg === "firstDegreeBlock") { template = "AV Block"; finding = "block"; }

  // Acoustically these recordings are indistinguishable from "Normal" once retimed
  // to the engine's own rate (that's the whole point of audio/retime.js) — but a
  // clip genuinely recorded at a fast rate needs less stretching/compression to
  // reach it than one recorded at rest, so a real tachycardic patient draws from
  // the "Tachycardia" pool when nothing more specific (a murmur/gallop/block) is
  // already selected, rather than always starting from a resting recording.
  if (template === "Normal" && rateClass === "fast") template = "Tachycardia";
  // a previous item in the queue: the 4 "Atrial Fibrillation"-labeled S1/S2 clips (HLS-CMDS) were
  // dead data until this fix — checked directly (envelope/peak-timing analysis
  // of the 3 real source WAVs, not assumed) before wiring: M_AF_LC shows real,
  // non-repeating beat-to-beat intervals from 0.34s to 1.30s, and F_AF_A/
  // M_AF_RUSB show the same non-periodic spacing at lower SNR — these are
  // genuinely recorded from an irregular rhythm, not a regular clip standing in
  // for AFib tone. That is SAFE to combine with audio/retime.js's own afib
  // pattern rather than fighting it: analyzeClip()/findPeriod() only ever
  // extracts ONE representative beat cycle via autocorrelation, and it is
  // buildLoop()/intervalPattern() — entirely independent of the source clip's
  // own natural spacing — that lays that one waveform out on the engine's
  // simulated irregular timing. So the source recording's own irregularity
  // does not double up with the retiming; only the single-beat WAVEFORM is
  // reused, same as for every "regular" source clip already in this corpus.
  // Selected only when nothing more specific (an already-published murmur/
  // gallop/block finding) applies, so a real valve lesion still wins.
  if (template === "Normal" && v?.ecg === "afib") { template = "Atrial Fibrillation"; finding = "irregular"; }

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
// are skipped), preferring the exact location (plus any aliased locations — see
// `alias` below), then any clip not tied to one place, with `seed` choosing
// between equals so different spots give different recordings.
function pickVariant(list, loc, seed, alias) {
  const regular = list.filter((c) => c.q == null || c.q >= 0.3);
  const base = regular.length ? regular : list;
  const near = base.filter((c) => c.loc === loc || c.loc === "any" || (alias && alias.includes(c.loc)));
  const pool = near.length ? near : base;
  return pool[Math.abs(seed | 0) % pool.length];
}
// RC/LC are real recorded points "beside the sternum" (see the file header) that
// heartAt() never resolves a click to directly — folded in here as near-matches
// for whichever real valve area is anatomically closest, so they're reachable as
// a genuine location match instead of only via the unfiltered base fallback.
const HEART_LOC_ALIAS = { RUSB: ["RC"], LUSB: ["LC"], LLSB: ["LC"], A: ["LC"] };
export const pickHeartClip = (template, area, seed = 0) => pickVariant(HEART_SOUNDS[template] || HEART_SOUNDS.Normal, area, seed, HEART_LOC_ALIAS[area]);
export const pickLungClip = (sound, field, seed = 0) => pickVariant(LUNG_SOUNDS[sound] || LUNG_SOUNDS.Normal, field, seed);

// ── Lungs ────────────────────────────────────────────────────────────────
// Breath envelope weights per sound: wheeze is expiratory, fine crackles late-inspiratory.
const SHAPES = {
  Normal: { insp: 1, exp: 0.6 }, Wheezing: { insp: 0.6, exp: 1 }, "Fine Crackles": { insp: 1, exp: 0.15 },
  "Coarse Crackles": { insp: 1, exp: 0.6 }, Rhonchi: { insp: 1, exp: 0.9 }, "Pleural Rub": { insp: 0.9, exp: 0.9 },
  Stridor: { insp: 1, exp: 0.25 },
};

// field: side R|L + level U|M|L + A, e.g. "RLA". finding: clear | wheeze | crackles |
// rhonchi | rub | diminished | absent | dull | none (apnea)
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
  // Fluid layering over the lung (hemothorax or a plain effusion, acoustically
  // the same finding either way) prefers a genuine dull/diminished recording
  // over an attenuated-plus-lowpassed "Normal" clip when one exists; the
  // synthetic lowpass approximated muffling for the fallback case, so it's
  // dropped when the real recording is doing that work itself.
  if (effHere) {
    const hasReal = !!LUNG_SOUNDS["Diminished"];
    const sound = hasReal ? "Diminished" : "Normal";
    return { ...base, finding: "dull", sound, shape: SHAPES.Normal, gain: clamp(0.6 - eff * 0.6, 0.12, 0.5), lowpass: hasReal ? null : 350 };
  }
  const edema = v?.edema ?? 0;
  const crackleHere = edema >= 0.3 && (lvl !== "U" || edema >= 0.6);
  if (s?.aspirated && side === "R" && lvl === "L") return { ...base, finding: "crackles", sound: "Coarse Crackles", shape: SHAPES["Coarse Crackles"] };
  if (crackleHere) {
    const sound = edema < 0.55 ? "Fine Crackles" : "Coarse Crackles";
    return { ...base, finding: "crackles", sound, shape: SHAPES[sound] };
  }
  // Pulmonary embolism raises pulmonary vascular resistance directly (pe's own
  // progress()), and a real pulmonary infarct from a peripheral clot is the
  // textbook cause of a pleuritic friction rub — peripheral/basal, not apical,
  // matching where a distal embolus actually lodges. Checked ahead of
  // wheeze/rhonchi since neither of those mechanisms is otherwise engaged by PE
  // in this engine, so without this a real embolism auscultates as silently
  // "clear," which is a real, distinguishing finding this patient should have.
  if ((pat?.pulmResistFactor ?? 1) > 1.3 && lvl !== "U" && LUNG_SOUNDS["Pleural Rub"]) {
    return { ...base, finding: "rub", sound: "Pleural Rub", shape: SHAPES["Pleural Rub"] };
  }
  if (pat?.upperAirwayObstruction > 0.5 && LUNG_SOUNDS.Stridor) return { ...base, finding: "stridor", sound: "Stridor", shape: SHAPES.Stridor };
  if ((v?.bronch ?? 0) >= 0.3) return { ...base, finding: "wheeze", sound: "Wheezing", shape: SHAPES.Wheezing };
  if ((pat?.airwayFluid ?? 0) >= 0.25) return { ...base, finding: "rhonchi", sound: "Rhonchi", shape: SHAPES.Rhonchi };
  return { ...base, finding: "clear", sound: "Normal", shape: SHAPES.Normal };
}

// The most significant finding across one side's three fields (what a full exam of
// that side finds). Used by the exam log.
const RANK = { absent: 6, diminished: 5, dull: 4, stridor: 4, crackles: 3, rub: 2, wheeze: 2, rhonchi: 1, clear: 0, none: -1 };
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

// Tension pneumothorax raises intrapleural pressure enough on the affected side
// to push the mediastinum, and the heart with it, toward the opposite side — a
// real, well-described sign (alongside tracheal deviation) distinct from cardiac
// tamponade's Beck's-triad MUFFLING, which is what pericardialEffusion above
// already models. Not attempted for the "back" view below: that branch has no
// per-valve landmark set to shift, only a flat radial falloff, and inventing one
// just for this would be guessing at anatomy this file doesn't otherwise track.
function mediastinalShift(pat) {
  if (pat?.ptx !== "tptx") return 0;
  // View coordinates: from the front, the patient's right is on the player's
  // left (this file's own header comment) — a right tension ptx pushes the
  // heart toward the patient's LEFT, i.e. toward higher x in this view.
  const side = (pat?.ptxSide || "R")[0].toUpperCase();
  return side === "R" ? 14 : -14;
}

function heartAt(view, x, y, pat) {
  if (view === "back") return { area: "A", gain: clamp(0.14 * Math.exp(-(((x - 120) ** 2 + (y - 165) ** 2) / 3500)), 0, 0.14) };
  const shift = mediastinalShift(pat);
  let best = "A", bd = Infinity;
  for (const [k, p] of Object.entries(VALVES)) { const d = dist({ x, y }, { x: p.x + shift, y: p.y }); if (d < bd) { bd = d; best = k; } }
  const atValve = Math.exp(-((bd / 24) ** 2));                                   // loudest right at a valve area
  const precordium = 0.28 * Math.exp(-((dist({ x, y }, { x: HEART_CENTER.x + shift, y: HEART_CENTER.y }) / 46) ** 2));
  const transmitted = 0.1 * Math.exp(-((dist({ x, y }, { x: 150 + shift, y: 150 }) / 110) ** 2));
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
  const heart = heartAt(view, x, y, pat);
  const hs = heartSound(pat, v);
  if (hs.template && heart.gain * hs.gain > 0.005) {
    const clip = pickHeartClip(hs.template, heart.area, seed);
    layers.push({ key: `H:${clip.id}`, url: heartUrl(clip), kind: "heart", rate: hs.rate, pattern: hs.pattern, gain: heart.gain * hs.gain, lowpass: hs.lowpass });
  }
  return { layers, lung, heart, ls, hs };
}
