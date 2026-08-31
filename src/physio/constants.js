// Shared physical/physiological constants used across organ-system modules.
export const ATM = 760, PH2O = 47, RQ = 0.8;
export const NORMAL_PACO2 = 40, NORMAL_HCO3 = 24, NORMAL_PH = 7.4;
export const NORMAL_HB = 15, NORMAL_BLOOD_VOL = 6.0, HCT_NORMAL = 0.45;
export const PLASMA_VOL_NORMAL = NORMAL_BLOOD_VOL * (1 - HCT_NORMAL);
// QUEUE ITEM 44 — strong-ion-difference acid-base model (see acidbase.js).
// CL_BASELINE: resting serum chloride reference (mEq/L), a mid-normal value
// (real range ~96-106) matching patient.js's own pre-existing constructor
// default for pat.cl.
// ACID_BASE_ATOT: the weak-acid buffer pool (mostly plasma albumin +
// phosphate) that the strong-ion difference must clear before any of it
// shows up as HCO3-. NOT an invented number — back-derived so a resting
// healthy adult (na 140, k 4, cl 102, no strong-anion burden) reproduces
// this engine's own long-standing normal hco3 of 24 (NORMAL_HCO3 above):
// SID = 140+4-102 = 42, so ATOT = 42-24 = 18. Independently cross-checked,
// not fitted, against Figge/Stewart's own commonly-cited normal Atot of
// ~17-20 mEq/L for a normal albumin+phosphate pool at physiological pH —
// this engine does not track albumin/phosphate as separate strong-ion
// contributors, so ATOT stands in for both as one constant.
export const CL_BASELINE = 102;
export const ACID_BASE_ATOT = 18;
export const MAX_STEP = 0.05;
// Largest simulated interval a single update() call will advance (minutes). A
// tab left in the background, a save/resume, or a debug fast-forward can deliver
// an arbitrarily large dt; advancing that in one go drives the closed-loop ODE
// far outside its validated operating range (measured: 15 s ticks produce NaN,
// while the engine is rock stable at the 2-4 s ticks it is designed for).
// Anything larger is clamped rather than silently integrated.
export const MAX_TICK = 1.0;
// GUARDED_FIELDS (a hand-curated list of ~9 fields) used to live here as the
// substep-rollback guard's allowlist. Physiology queue item 31's "dt=15s
// ticks NaN sbp/brainInjury" report turned out to be that list itself being
// incomplete in a way that kept regenerating: fixing it for cardiovascular's
// sbp/dbp/pp/esv/ef (which can go non-finite independently of the map/co/sv/
// edv/hr that were already on the list, since systolic/diastolic are separate
// state in the same RK4 solver) immediately surfaced the SAME defect one
// layer downstream — metabolic.js's lactate/energyFailure/actualVO2 chain,
// then renal.js's k/gfr/renin/aldosterone and neuro.js's icp/cpp/brainInjury,
// all going non-finite in the identical failing substep because they're
// COMPUTED FROM a field (map, co...) that was itself corrupted but not yet
// rolled back within that same substep pass. The transitive closure of
// "everything one bad substep can leave corrupted" is not a stable,
// enumerable list — it grew every time a scenario/dt combination exercised a
// module the list didn't cover yet. Removed outright rather than left as a
// stale/unused export: Patient.update() now snapshots and restores every
// NUMERIC own field on the patient each substep, not a curated subset — see
// the comment at its rollback guard in patient.js.

export function oncoticPressureFromMass(mass, volume) {
  if (volume <= 0) return 0;
  // Landis-Pappenheimer: colloid osmotic pressure (mmHg) from protein
  // concentration in g/dL. Masses here are grams and volumes liters, so the
  // raw quotient is g/L — divide by 10 to get g/dL before applying the curve.
  // (Previously omitted, which inflated oncotic pressure ~37x and drove a
  // spurious, unbounded capillary absorption that corrupted preload.)
  const c = (mass / volume) / 10;
  return 2.1 * c + 0.16 * c * c;
}
