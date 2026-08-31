// CURVE-DRUG SATURATION AUDIT — instrument, not pass/fail.
//
// WHY THIS EXISTS. pkAudit.mjs detects the two dose-response failures that have
// caused the most damage in this project: SATURATED (the standard dose sits on
// the flat top of the curve, so it cannot be titrated and an overdose is
// indistinguishable from a correct dose) and INERT (the standard dose barely
// engages the receptor). It found amiodarone's ec50 being an order of magnitude
// below its therapeutic range, and it took the flagged count from 13 to 0.
//
// But pkAudit works from effect-site CONCENTRATION and effect intensity, so it
// can only see drugs in PK_PARAMS. The curve-model drugs have no concentration
// at all: their intensity comes from an onset/duration curve. They were
// therefore invisible to the one instrument that catches this defect class —
// which is a large part of what makes queue item 4 matter. Curve drugs lack
// clearance and organ-dysfunction sensitivity, and they also lack the detection
// that found every other dose-response defect here.
//
// HOW IT WORKS. Concentration is unavailable, so saturation is probed
// structurally instead: DOUBLE the drug's declared receptor coefficients, rerun,
// and see whether the observable moves. A drug on the slope responds; a drug on
// the flat top, or one pinned against a clamp, does not. This is the same
// question pkAudit asks via Imax, asked through the only lever a curve drug has.
//
// FIRST FINDING. vasopressin drives SVR to 4000 dyn.s.cm-5 — which is exactly
// the ceiling in cardiovascular.js:
//     pat.svr = clamp(pat.svr, 250, Math.max(4000, pat.baseSVR * 3.2));
// With baseSVR ~1247 that max() evaluates to 4000, so the drug is pinned on a
// numerical guard rail rather than on physiology. Doubling its receptor drive
// changes the result by 0.0%. Phenylephrine, by contrast, reaches ~3089 and
// still responds, which is what an unsaturated vasoconstrictor looks like.
//
// TWO HARNESSES. The vasoactive drugs are audited on a bare Patient, because a
// healthy adult has vascular tone to constrict or dilate. Albuterol is not:
// bronchodilation cannot be measured against a lung that is not obstructed, and
// auditing it on a healthy patient would report a meaningless zero. It therefore
// runs on the asthmaAttack scenario, settled until bronchoconstriction has
// developed. Measured there, albuterol takes effectiveBroncho 0.789 -> 0.274 and
// intrinsic PEEP 3.18 -> 0.20 cmH2O.
import { Patient } from "../physio/patient.js";
import { physio, activePatient } from "../physiology.js";
import { DRUGS } from "../data/drugs.js";

const STEP = 4, SETTLE = 10, OBSERVE = 20;
const S = () => ({ t: 0, doses: [], given: {}, _roster: [] });

// Each entry names the observable the drug's declared mechanism should move.
const AUDIT = [
  { id: "vasopressin",   obs: p => p.svr, unit: "dyn.s.cm-5", note: "V1 + alpha vasoconstriction" },
  { id: "phenylephrine", obs: p => p.svr, unit: "dyn.s.cm-5", note: "pure alpha vasoconstriction" },
  { id: "nitro",         obs: p => p.svr, unit: "dyn.s.cm-5", note: "veno- and arteriolar dilation" },
  { id: "nitroOwn",      obs: p => p.svr, unit: "dyn.s.cm-5", note: "patient's own GTN" },
  { id: "albuterol",     obs: p => p.effectiveBroncho ?? 0, unit: "broncho", label: "broncho",
    scen: "asthmaAttack", settle: 8, observe: 4, note: "beta2 bronchodilation" },
  // Magnesium acquired a receptor mechanism (arteriolarDilation) when its
  // forbidden `fx: { sbp: -10 }` was replaced, and this list is HARDCODED — so
  // for one batch the new coefficient was completely unaudited and the audit
  // still cheerfully reported "0 of 5 flagged". That is lesson 10 in miniature:
  // a green instrument proves nothing about a drug it does not walk. Adding a
  // receptor to a curve drug means adding it HERE in the same batch.
  //
  // The vascular effect is deliberately small (magnesium is not an
  // antihypertensive), so this entry is expected to sit near the INERT end and
  // is worth watching: the audit's job is to tell us whether "small" is
  // titratable or indistinguishable from nothing.
  { id: "magnesium",     obs: p => p.svr, unit: "dyn.s.cm-5", note: "Ca-antagonist arteriolar dilation" },
  // Aspirin and heparin acquired antithrombotic receptor mechanisms
  // (antiplatelet / anticoagulant) in the ACS batch, so per the magnesium lesson
  // above they must be audited HERE in the same batch. Their observable is the
  // physiological consequence — coronary THROMBUS propagation — which only exists
  // against the acs substrate, so they run on the acs scenario like albuterol
  // runs on asthmaAttack. The mechanism is a BRAKE: a stronger antithrombotic
  // makes coronaryStenosis climb LESS, so doubling the coefficient reducing the
  // rise is exactly the sensitivity the audit is asking for (measured x1 vs x2:
  // aspirin 0.031 -> 0.020, heparin 0.031 -> 0.018). Both clear the INERT floor
  // and the SATURATED bar — the coefficients are titratable, not pinned at the cap.
  { id: "aspirin",  obs: p => p.coronaryStenosis ?? 0, unit: "stenosis", label: "stenosis",
    scen: "acs", settle: 5, observe: 12, note: "antiplatelet thrombus brake" },
  { id: "heparin",  obs: p => p.coronaryStenosis ?? 0, unit: "stenosis", label: "stenosis",
    scen: "acs", settle: 5, observe: 12, note: "anticoagulant thrombus brake" },
];

// Scenario harness for drugs whose observable needs a substrate to act on.
function peakChangeScenario(id, scale, obs, scen, settle, observe) {
  const def = DRUGS[id];
  const orig = JSON.parse(JSON.stringify(def.receptors || {}));
  if (scale !== 1) for (const k of Object.keys(def.receptors)) def.receptors[k] = orig[k] * scale;
  try {
    const s = { scen, t: 0, doses: [], given: {}, activePatientId: null };
    for (let T = 2; T <= settle * 60; T += 2) { s.t = T; physio(s); }
    const base = obs(activePatient(s));
    s.doses.push({ id, at: settle * 60 });
    let ext = base;
    for (let T = settle * 60 + 2; T <= (settle + observe) * 60; T += 2) {
      s.t = T; physio(s);
      const v = obs(activePatient(s));
      if (Math.abs(v - base) > Math.abs(ext - base)) ext = v;
    }
    return ext - base;
  } finally {
    def.receptors = orig;
  }
}

function peakChange(id, scale, obs) {
  const def = DRUGS[id];
  const orig = JSON.parse(JSON.stringify(def.receptors || {}));
  if (scale !== 1) for (const k of Object.keys(def.receptors)) def.receptors[k] = orig[k] * scale;
  try {
    const p = new Patient({ age: 35, sex: "male", weight: 70 }, 0);
    const s = S();
    for (let T = STEP; T <= SETTLE * 60; T += STEP) { s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s); }
    const base = obs(p);
    s.doses.push({ id, at: SETTLE * 60 });
    let ext = base;
    for (let T = SETTLE * 60 + STEP; T <= (SETTLE + OBSERVE) * 60; T += STEP) {
      s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
      const v = obs(p);
      if (Math.abs(v - base) > Math.abs(ext - base)) ext = v;
    }
    return ext - base;
  } finally {
    def.receptors = orig;   // never leave a mutated drug definition behind
  }
}

console.log("CURVE-DRUG SATURATION AUDIT — does doubling receptor drive change the observable?\n");
console.log("drug            observable  effect@x1   effect@x2   sensitivity  flag");
console.log("-".repeat(78));
let flagged = 0;
for (const a of AUDIT) {
  const measure = a.scen
    ? (sc) => peakChangeScenario(a.id, sc, a.obs, a.scen, a.settle, a.observe)
    : (sc) => peakChange(a.id, sc, a.obs);
  const d1 = measure(1);
  const d2 = measure(2);
  const sens = Math.abs(d2 - d1) / Math.max(a.scen ? 0.001 : 1, Math.abs(d1)) * 100;
  let flag = "";
  // A drug whose effect is real but completely insensitive to its own declared
  // coefficients is on the flat top (or against a clamp): untitratable.
  // INERT threshold is scaled to the observable: SVR moves in hundreds, a
  // bronchoconstriction fraction moves in hundredths. A single absolute cutoff
  // would call every correctly-working bronchodilator inert.
  const inertBelow = a.scen ? 0.02 : 1;
  if (Math.abs(d1) < inertBelow) flag = "INERT";
  else if (sens < 5) flag = "SATURATED";
  if (flag) flagged++;
  console.log(`${a.id.padEnd(15)} ${(a.label || "SVR").padEnd(11)} ${(a.scen ? d1.toFixed(3) : d1.toFixed(0)).padStart(9)} ${(a.scen ? d2.toFixed(3) : d2.toFixed(0)).padStart(11)} ${(sens.toFixed(1) + "%").padStart(12)}  ${flag}`);
}
console.log("-".repeat(78));
console.log(`${flagged} of ${AUDIT.length} curve drugs flagged.`);
console.log("SATURATED = doubling the declared receptor drive moves the observable <5%;");
console.log("            the drug cannot be titrated and an overdose is indistinguishable.");
console.log("INERT     = the declared mechanism barely moves the observable at all.");
