// Shared physiology-driven difficulty signal for vascular-access and
// airway procedures (IV, IO, laryngoscopy/ETT, cric, SGA). Reuses fields
// the physiology engine already computes every tick — no new physiology
// mechanism is added here, per this project's "identify numbers, do not
// invent new engine state for a front-end feature" discipline.
//
// Coefficients below are a reasoned first-pass estimate, not measured
// against a published difficulty scale the way this project's clinical
// coefficients usually are — there is no such scale to anchor against for
// "how much harder is a vasodilated IV." Stated honestly rather than
// presented as calibrated; worth revisiting once the mini-games are
// playtested and it's clear whether the bands feel right.
//
// STANDING CONSTRAINT (explicit operator instruction, "Procedure Gameplay"):
// everything here is READ-ONLY against the physiology engine. This module
// (and everything downstream of it — AccessMinigame.jsx/AirwayMinigame.jsx/
// SGAMinigame.jsx/CricMinigame.jsx's vein width, landmark tolerance, view
// window, and every other target-band size) must derive ENTIRELY from real
// `pat` fields the engine already computes, with zero independent
// randomization and zero write-back to `pat`. A vein is not "small" because
// a die roll said so — it's small because this patient is vasodilated,
// hypotensive, edematous, or a small child, and the SAME instant would
// re-derive the identical difficulty if asked twice. Do not add
// `Math.random()` (or any other non-physiology input) to a difficulty/
// target-band calculation anywhere in this file or its consumers — if a
// mini-game needs to feel less deterministic, that has to come from a real
// physiology field varying (or a genuinely new physiology mechanism), not
// from a coin flip layered on top.

// kind: "iv" | "io" | "airway"
// pat: a live Patient instance (s.patient, set by physio() as a side
// effect — see App.jsx's own note on this convention).
// opts.gauge (iv only): the catheter gauge the player picked for THIS
// attempt (14-24). Not patient state — it only perturbs the difficulty of
// the attempt being made right now, per Poiseuille's own logic: a larger
// bore is less forgiving of a fragile/small/collapsed vein. At the default
// 18g it is exactly a no-op, so every existing call site (airway/cric/sga,
// none of which pass a gauge) is unaffected.
export function accessDifficulty(kind, pat, opts = {}) {
  if (!pat) return { score: 1, band: "routine", factors: {} };
  const ap = pat.ageProfile;
  const age = ap?.age ?? 35;
  const vasodilation = pat.vasodilation || 0;        // 0-1, distributive shock (anaphylaxis/sepsis)
  const sbp = pat.sbp ?? 120;
  const edema = pat.edema || 0;                      // 0-1, obscures/distorts landmarks
  const uao = pat.upperAirwayObstruction || 0;        // 0-1, croup/epiglottitis/anaphylaxis airway swelling

  // Hypotension collapses peripheral veins — 0 at sbp>=100, ramping to 1 at sbp<=60.
  const hypotensionFactor = Math.max(0, Math.min(1, (100 - sbp) / 40));
  // Small, rolling veins in young children — ramps in below age 8, flat above.
  const pediatricFactor = age < 8 ? Math.max(0, (8 - age) / 8) : 0;

  // Obesity: derived from the patient's own existing weight/height (no new
  // patient field) — subcutaneous fat buries/flattens superficial veins.
  // BMI 25 (overweight threshold) is the zero point; BMI 40 (class III
  // obesity) is the ceiling, matching the WHO adult BMI categories.
  const heightM = (ap?.height ?? 170) / 100;
  const bmi = ap ? ap.weight / (heightM * heightM) : 24;
  const obesityFactor = Math.max(0, Math.min(1, (bmi - 25) / 15));

  // Volume deficit (dehydration OR hemorrhage — both collapse the same
  // veins the same way): fraction below the patient's own anatomical
  // baseline blood volume (pat.bodyScaleBaselineL, already computed once at
  // construction — see patient.js). A resting, unbled, hydrated patient
  // reads exactly 0.
  const volDeficit = pat.bodyScaleBaselineL > 0
    ? Math.max(0, Math.min(1, (pat.bodyScaleBaselineL - (pat.totalBloodVol ?? pat.bodyScaleBaselineL)) / pat.bodyScaleBaselineL))
    : 0;

  // Vasoconstriction: pat.alphaTone is the engine's real sympathetic/
  // adrenergic vascular-tone signal (cardiovascular.js) — distinct from
  // pat.vasodilation (the DISTRIBUTIVE, vessel-relaxing direction above).
  // A cold, compensating-hypovolemic, or catecholamine-surged patient
  // clamps down peripherally for a different reason than a septic one
  // dilates, and until now nothing here read this axis at all. Resting
  // alphaTone is ~0.225 (neuralSymp 0.25 * gain 0.9); that's the zero
  // point, ramping to 1 by alphaTone~1.5 (a severe, sustained pressor-range
  // sympathetic surge).
  const vasoconstriction = Math.max(0, Math.min(1, ((pat.alphaTone || 0) - 0.225) / 1.275));

  // Movement/combativeness: reuses pat.agitationBurden (already real,
  // already wired for pupil-diameter/VO2 effects — see conditions.js). A
  // moving target is harder to cannulate even when the vein itself is
  // perfect, so this only raises difficulty, never visibility/palpability.
  const agitation = pat.agitationBurden || 0;

  const factors = { vasodilation, hypotensionFactor, edema, pediatricFactor, uao, obesityFactor, volDeficit, vasoconstriction, agitation };
  let score = 1;

  if (kind === "iv") {
    score = 1 + vasodilation * 0.7 + hypotensionFactor * 0.6 + edema * 0.5 + pediatricFactor * 0.5
      + obesityFactor * 0.4 + volDeficit * 0.5 + vasoconstriction * 0.5 + agitation * 0.3;
    // Gauge vs. difficulty: only the excess above a routine (score 1) vein
    // is amplified, and only for a bore LARGER than the 18g default — a
    // bigger needle is less forgiving of a fragile vein, but a smaller one
    // than default is never penalized here (its own cost is the slower
    // flow rate, handled elsewhere, not cannulation difficulty).
    const gauge = opts.gauge ?? 18;
    const bigBoreFactor = Math.max(0, (18 - gauge) / 6); // 16g=0.33, 14g=0.67
    score += bigBoreFactor * Math.max(0, score - 1);
    factors.gauge = gauge;
  } else if (kind === "io") {
    // IO deliberately does NOT carry the vasodilation/hypotension/pediatric/
    // obesity/volume-deficit/vasoconstriction penalty — bypassing a
    // collapsed peripheral vein is the actual clinical reason IO is
    // preferred in pediatric/shock arrest. Edema (obscured landmarks) is
    // the one real difficulty driver this engine can express for IO; bone
    // density has no field to read (no such physiology mechanism exists).
    score = 1 + edema * 0.4;
  } else if (kind === "airway") {
    score = 1 + edema * 0.6 + uao * 0.8;
  }

  score = Math.max(0.7, Math.min(3.0, score));
  const band = score < 1.15 ? "routine" : score < 1.6 ? "moderate" : score < 2.2 ? "hard" : "severe";
  return { score, band, factors };
}

// 0..1 "how big/visible is the vein" signal for the IV mini-game's own
// visualization — the inverse of difficulty, floored so even a maximally
// hard stick still shows a real, if faint, target rather than nothing.
export function veinVisibility(pat) {
  const { score } = accessDifficulty("iv", pat);
  return Math.max(0.25, Math.min(1, 1.6 - (score - 0.7) / 1.5));
}

// 0..1 "how findable is the vein BY TOUCH" — distinct from visibility.
// Obesity and volume deficit both bury/flatten a vein far more to the EYE
// than to a palpating finger (the real clinical reason a paramedic
// palpates instead of just looking on a heavier or dehydrated patient), so
// this recomputes the score with those two terms halved rather than
// reusing accessDifficulty's own combined score directly.
export function veinPalpability(pat) {
  if (!pat) return 1;
  const { factors } = accessDifficulty("iv", pat);
  const softenedScore = 1
    + (factors.vasodilation || 0) * 0.7 + (factors.hypotensionFactor || 0) * 0.6
    + (factors.edema || 0) * 0.5 + (factors.pediatricFactor || 0) * 0.5
    + (factors.obesityFactor || 0) * 0.2 + (factors.volDeficit || 0) * 0.25
    + (factors.vasoconstriction || 0) * 0.5 + (factors.agitation || 0) * 0.3;
  return Math.max(0.35, Math.min(1, 1.6 - (softenedScore - 0.7) / 1.5));
}

// Real, cited gravity-flow ceiling per catheter gauge (Poiseuille's law:
// flow ∝ radius⁴, so a small change in bore size produces a large change
// in max flow). Reference figures are the standard published gravity-drip
// rates for peripheral IV catheters (e.g. Rosen's Emergency Medicine,
// vascular-access chapter): 14g ≈300+ mL/min, 16g ≈180 mL/min, 18g ≈105
// mL/min, 20g ≈60 mL/min, 22g ≈35 mL/min, 24g ≈20 mL/min.
const GAUGE_MAX_FLOW_ML_MIN = { 14: 300, 16: 180, 18: 105, 20: 60, 22: 35, 24: 20 };
export function gaugeMaxFlowMlMin(gauge) {
  return GAUGE_MAX_FLOW_ML_MIN[gauge] ?? GAUGE_MAX_FLOW_ML_MIN[18];
}
