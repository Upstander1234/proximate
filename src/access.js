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
export function accessDifficulty(kind, pat) {
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

  const factors = { vasodilation, hypotensionFactor, edema, pediatricFactor, uao };
  let score = 1;

  if (kind === "iv") {
    score = 1 + vasodilation * 0.7 + hypotensionFactor * 0.6 + edema * 0.5 + pediatricFactor * 0.5;
  } else if (kind === "io") {
    // IO deliberately does NOT carry the vasodilation/hypotension/pediatric
    // penalty — bypassing a collapsed peripheral vein is the actual
    // clinical reason IO is preferred in pediatric/shock arrest. Edema
    // (obscured landmarks) is the one real difficulty driver this engine
    // can express for IO; bone density has no field to read (no such
    // physiology mechanism exists), so age is not otherwise penalized here.
    score = 1 + edema * 0.4;
  } else if (kind === "airway") {
    score = 1 + edema * 0.6 + uao * 0.8;
  }

  score = Math.max(0.7, Math.min(2.2, score));
  const band = score < 1.15 ? "routine" : score < 1.5 ? "moderate" : score < 1.9 ? "hard" : "severe";
  return { score, band, factors };
}

// 0..1 "how big/visible is the vein" signal for the IV mini-game's own
// visualization — the inverse of difficulty, floored so even a maximally
// hard stick still shows a real, if faint, target rather than nothing.
export function veinVisibility(pat) {
  const { score } = accessDifficulty("iv", pat);
  return Math.max(0.25, Math.min(1, 1.6 - (score - 0.7) / 1.5));
}
