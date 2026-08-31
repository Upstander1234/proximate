// arrhythmiaEfficacy.mjs — DOES THE ANTIARRHYTHMIC ACTUALLY PREVENT ARRHYTHMIA?
//
// The wiring suite proves lidocaine moves `sodiumChannelBlock` and amiodarone
// moves `potassiumChannelBlock`, `avConduction` and the QT. It cannot prove that
// any of that CHANGES THE OUTCOME — and "the mechanism is declared and wired but
// achieves nothing" has been the single most common defect in this project.
//
// Degeneration into VT is probabilistic (see updateRhythm), so the outcome is an
// INCIDENCE, not a value, and it needs repeated trials. That is what this is.
//
// Method: impose a fixed ischemic substrate on an otherwise healthy patient by
// holding ATP down — the same substrate the engine builds during a real infarct,
// imposed directly so that every arm sees an identical challenge. Run each arm N
// times and count the fraction of runs that degenerate.
//
// What it should show:
//   * both drugs reduce VT incidence against control;
//   * LIDOCAINE is at least as good as amiodarone against a purely ISCHEMIC
//     substrate, because Class Ib binds preferentially in depolarised tissue;
//   * neither abolishes it — a large enough substrate breaks through, which is
//     why these drugs reduce incidence rather than guaranteeing rhythm.
//
// Run:  node src/scripts/arrhythmiaEfficacy.mjs [trials]
import { Patient } from "../physio/patient.js";

const STEP = 2;
const SETTLE_S = 240;
// 300 s, not 900. Under a HELD substrate rhythmInstability accumulates without
// bound, so the challenge escalates until every arm degenerates and no drug
// effect is visible however good the drug is. A shorter window keeps the drive
// in the sensitive region around the 0.4 threshold. (Second harness design error
// in this project caught by looking at the intermediate variables rather than
// the outcome — the first was measuring rocuronium on an unventilated patient.)
const OBSERVE_S = 300;
// Substrate strength calibrated so that the CONTROL arm degenerates most of the
// time but not always: an arm that never degenerates cannot show a drug effect,
// and one that always does cannot either. ATP 0.20 with a 0.30 scar burden puts
// the untreated vtDrive just above the 0.4 threshold, which is the sensitive
// region where a real antiarrhythmic effect is visible.
const ATP_HOLD = 0.20;
const SCAR_HOLD = 0.30;
const TRIALS = Number(process.argv[2] || 24);

function trial(drugId) {
  const p = new Patient({ age: 62, sex: "male", weight: 82 }, 0);
  const s = { t: 0, doses: [], given: {} };
  for (let T = STEP; T <= SETTLE_S; T += STEP) {
    s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
  }
  if (drugId) s.doses.push({ id: drugId, at: SETTLE_S });
  let degenerated = false;
  for (let T = SETTLE_S + STEP; T <= SETTLE_S + OBSERVE_S; T += STEP) {
    s.t = T;
    // Hold the ischemic substrate. Imposed every tick so the engine's own
    // recovery cannot quietly remove the challenge mid-trial, which would make
    // the arms incomparable.
    p.atp = Math.min(p.atp, ATP_HOLD);
    p.scarBurden = Math.max(p.scarBurden || 0, SCAR_HOLD);
    p.lastUpdate = T - STEP;
    p.update(STEP / 60, s);
    if (["VT", "VF", "torsades"].includes(p.rhythm)) { degenerated = true; break; }
  }
  return degenerated;
}

function arm(label, drugId) {
  let n = 0;
  for (let i = 0; i < TRIALS; i++) if (trial(drugId)) n++;
  const pct = (100 * n) / TRIALS;
  console.log(`  ${label.padEnd(14)} ${String(n).padStart(3)}/${TRIALS} degenerated   ${pct.toFixed(0)}%`);
  return pct;
}

console.log(`ANTIARRHYTHMIC EFFICACY — ${TRIALS} trials per arm, sustained ischemic substrate\n`);
const control = arm("control", null);
const lido = arm("lidocaine", "lidocaine");
const amio = arm("amiodarone", "amiodarone");

console.log("\n" + "=".repeat(70));
let pass = 0, fail = 0;
const results = [];
function assertLower(label, value, reference, minDrop) {
  const drop = reference - value;
  const ok = drop >= minDrop;
  ok ? pass++ : fail++;
  results.push(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(48)} ${value.toFixed(0)}% vs ${reference.toFixed(0)}%`);
}
assertLower("lidocaine reduces VT incidence", lido, control, 10);
assertLower("amiodarone reduces VT incidence", amio, control, 10);
// Class Ib selectivity: against a purely ischemic substrate lidocaine should not
// be the weaker agent, even though amiodarone blocks more channel types.
const okSel = lido <= amio + 5;
okSel ? pass++ : fail++;
results.push(`  ${okSel ? "PASS" : "FAIL"}  ${"lidocaine >= amiodarone on ISCHEMIC substrate".padEnd(48)} ${lido.toFixed(0)}% vs ${amio.toFixed(0)}%`);

for (const r of results) console.log(r);
console.log(`\n${pass} passed, ${fail} failed`);
console.log("\nIncidence, not a value: these are stochastic outcomes and small");
console.log("trial counts are noisy. Raise the trial count before believing a");
console.log("marginal result.");
process.exitCode = fail > 0 ? 1 : 0;
