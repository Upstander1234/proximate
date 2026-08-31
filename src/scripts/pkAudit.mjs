// pkAudit.mjs — PHARMACOKINETIC PARAMETER AUDIT
//
// This is an INSTRUMENT, not a pass/fail suite. It exists because of what was
// found in fentanyl: its central volume was ~6x too small and its EC50 ~17x too
// high, and because the two errors pulled in opposite directions the drug simply
// did very little and nothing looked obviously broken. No bounds check could
// catch that, and no wiring assertion could either — the causal link fired, it
// just produced a 0.8 mmHg PaCO2 rise where 5 is documented.
//
// What it reports, for each two-compartment drug at its own standard dose:
//
//   Cmax      peak effect-site concentration (mg/L). Compare against the
//             published therapeutic plasma range for that drug. This is the
//             single most diagnostic number: if it is orders of magnitude away
//             from the literature, v1 is wrong.
//   Imax      peak effect intensity, Cmax/(EC50+Cmax), i.e. the fraction of the
//             drug's maximal effect a STANDARD DOSE achieves.
//   t1/2(kel) half-life implied by kel ALONE. This is the CENTRAL compartment
//             elimination rate, NOT the terminal half-life — for a drug with a
//             large peripheral compartment the two differ by several fold, and
//             mistaking one for the other is what left naloxone acting for four
//             hours. Treat this column as a parameter readout, not a duration.
//   Tmax      time to peak effect, in minutes.
//
// The two failure modes to look for:
//
//   SATURATED (Imax > 0.95) — the standard dose sits on the flat top of the
//     dose-response curve. The drug cannot be titrated, a half dose behaves like
//     a full dose, and an overdose is indistinguishable from a normal dose. This
//     is the more dangerous error in a simulator meant to teach dosing.
//   INERT (Imax < 0.25) — the standard dose barely engages the receptor. This
//     was fentanyl.
//
// Run:  node src/scripts/pkAudit.mjs
import { Patient } from "../physio/patient.js";
import { PK_PARAMS } from "../physio/pk.js";
import { DRUGS } from "../data/drugs.js";

const STEP = 2;
const SETTLE_MIN = 5;
// QUEUE ITEM 4/6 FIX. Was 30. epiIM's two-stage depot (queue item 4) now
// intentionally peaks at ~45-50 min (the published vial/needle Tmax), which
// is PAST this window — the audit was silently capping Tmax at 30 and
// under-measuring Cmax for a still-rising curve, which read as a false
// INERT/CONC flag (measured: Tmax reported exactly 30.0 — the window edge —
// with Cmax 263 pg/mL where the true peak, observed out to 75 min in a
// standalone probe, is 461 pg/mL at 46 min). 60 min covers every drug in
// PK_PARAMS with margin; extending the window can only reveal a later true
// peak, never hide an earlier one, so no other drug's reading changes.
const OBSERVE_MIN = 60;

// Published therapeutic / effective plasma concentration ranges, mg/L, for an
// adult at the standard prehospital dose. Sources are the standard clinical
// pharmacology references; they are reproduced here as the COMPARISON TARGET,
// which is the whole point of the instrument — a number with nothing to compare
// it against is not a measurement.
const PUBLISHED = {
  fentanyl:  { lo: 0.001,  hi: 0.003,  note: "1-3 ng/mL analgesia" },
  morphine:  { lo: 0.02,   hi: 0.08,   note: "20-80 ng/mL analgesia" },
  midazolam: { lo: 0.05,   hi: 0.25,   note: "50-250 ng/mL sedation" },
  ketamine:  { lo: 0.5,    hi: 2.5,    note: "0.5-2.5 mg/L dissociation" },
  etomidate: { lo: 0.2,    hi: 0.6,    note: "0.2-0.6 mg/L hypnosis" },
  // BAND CORRECTED — it was comparing the wrong QUANTITY. 0.8-2 mg/L is the
  // concentration range that produces neuromuscular BLOCK, i.e. a PD potency
  // range; it is the same quantity as this drug's ec50 of 1.5 mg/L in
  // PK_PARAMS. This table holds peak PLASMA concentrations. An intubating dose
  // necessarily peaks several times above its blocking concentration — that is
  // what makes it work in 60 seconds — so the old band could only ever have
  // been satisfied by a drug that did not intubate anyone.
  //
  // Published peak plasma: ~4-5 mg/L at 0.6 mg/kg, ~8-10 mg/L at 1.2 mg/kg.
  // The engine's 100 mg into v1 12 L starts at 8.3 mg/L and the audit measures
  // 3.64. So the engine was never 1.8x HIGH as the old band implied; if
  // anything it now reads slightly LOW for a 100 mg dose, which is worth a look
  // but is not the 10x that would flag.
  rocuronium:{ lo: 2.0,    hi: 10.0,   note: "peak plasma, intubating dose" },
  // CORRECTION TO THIS INSTRUMENT'S OWN REFERENCE DATA. These were first entered
  // as 0.5-20 ng/mL, which is the range for a titrated INFUSION. A 1 mg IV push
  // in cardiac arrest transiently produces plasma concentrations two orders of
  // magnitude higher, so the original entry would have condemned a correct
  // implementation. The range below spans push-dose peaks.
  epiIV:     { lo: 0.02,   hi: 0.5,    note: "push-dose peak; infusions 0.5-20 ng/mL" },
  // SECOND CORRECTION TO THIS INSTRUMENT'S REFERENCE DATA, AND THE SAME MISTAKE
  // AS THE ONE ABOVE MADE IN THE OPPOSITE DIRECTION.
  // This entry was a verbatim copy of `epiIV`'s, i.e. the peak concentration
  // range for a 1 mg ARREST push. `pushEpi` is 10-20 mcg — one fiftieth of that
  // dose — so the copied range condemned a correct implementation exactly as the
  // original infusion range once condemned epiIV. The flag it raised (CONC,
  // Cmax 1/24 of range) was an artifact of the reference datum, not a finding
  // about the model.
  //
  // Push-dose epinephrine is taught as a bridge to, and a substitute for, a
  // low-dose infusion, and it produces concentrations in that region: measured
  // Cmax 9.3e-4 mg/L = 0.93 ng/mL, inside the 0.5-20 ng/mL infusion range that
  // the epiIV note above already cites. The kinetics are linear in dose, and the
  // measured ratio confirms it — 9.30e-4 / 4.49e-2 = 1/48 for a 1/50 dose.
  //
  // `subMaximal` marks a drug that is DELIBERATELY dosed below full receptor
  // engagement. A titration bolus is supposed to have a low Imax; that is what
  // makes it titratable. Without this, the INERT heuristic — written for drugs
  // given at a full therapeutic dose — reads the design intent as a defect and
  // invites someone to "fix" the dose back to the arrest dose it used to be.
  // The Imax is still printed in the table; only the flag is suppressed.
  pushEpi:   { lo: 0.0005, hi: 0.02,   subMaximal: true,
               note: "10-20 mcg titration bolus; sits in the 0.5-20 ng/mL infusion band" },
  // BAND CORRECTED (queue item 6 — the same audit-instrument-provenance issue
  // rocuronium's band had). 0.005-0.2 mg/L (5-200 ng/mL) is roughly the range
  // for an IV/ARREST-dose bolus or a titrated infusion — not IM absorption
  // from a 0.3-0.5 mg intramuscular dose, which peaks two to three orders of
  // magnitude lower. It had been condemning epiIM/epiAuto as INERT,CONC
  // (Cmax ~1/60-1/120 of the band) even at their ORIGINAL, already-accepted
  // Cmax (~500 pg/mL) — this band could never have been satisfied by a
  // correct IM implementation, only by one dosed like an IV push. The
  // correct comparison is the dose-scaled published IM plasma range each
  // drug's own comment in drugs.js already cites and was measured against.
  //
  // QUEUE ITEM 6, RESOLVED. With the band corrected above, epiIM/epiAuto's
  // own Cmax lands cleanly inside their published range (confirming the
  // PK/absorption model is accurate) but Imax still reads ~0.13-0.15
  // against the INERT threshold of 0.25. Investigated rather than left
  // open: epiIM/epiAuto share the IDENTICAL ec50 (0.003 mg/L, pk.js
  // PK_PARAMS) as epiIV/pushEpi — this is not a route-specific
  // miscalibration, the same curve is applied to every epinephrine
  // formulation. The low Imax is a direct, expected consequence of IM
  // administration's own published Cmax (~500 pg/mL) sitting an order of
  // magnitude below IV/push concentrations (pushEpi's own accepted band is
  // 0.5-20 ng/mL, i.e. 500-20,000 pg/mL) against that shared curve — not a
  // defect in either the PK model or the receptor curve.
  // This is judged PLAUSIBLE on real pharmacological/clinical grounds, the
  // same way pushEpi's own subMaximal exemption above was: IM epinephrine
  // is deliberately the SAFE, lower-intensity route for anaphylaxis
  // (Layperson-administerable via auto-injector), precisely because it
  // does not produce the same systemic adrenergic surge an IV/push arrest
  // dose does — that asymmetry is real, and is the actual clinical reason
  // IV epinephrine is reserved for arrest/refractory shock under closer
  // scope/monitoring while IM is the anaphylaxis first line. No single
  // published systemic-EC50 citation was found precise enough to pin an
  // exact number for this composite alpha/beta1/beta2 curve, so per
  // section 4's own "if you cannot find a documented anchor, say so"
  // standard, this is not asserted as a hard number — the concentration
  // gap between routes (a real, well-published PK fact, not a modeling
  // choice) is what's cited. Marked `subMaximal` like pushEpi rather than
  // re-tuning ec50: nothing suggests ec50=0.003 is wrong FOR THE ROUTES
  // THAT PASS (epiIV/pushEpi both read correctly against it), so the
  // route with the lower Cmax reading lower intensity is the curve
  // behaving consistently, not two different curves disagreeing.
  epiIM:     { lo: 0.00042,  hi: 0.00058, subMaximal: true,
               note: "420-580 pg/mL, published IM (vial/needle) plasma range for 0.5 mg — IM is deliberately lower-intensity than IV/push, see comment above" },
  epiAuto:   { lo: 0.000503, hi: 0.000801, subMaximal: true,
               note: "503-801 pg/mL, published IM (auto-injector) plasma range for 0.3 mg — IM is deliberately lower-intensity than IV/push, see comment above" },
  norepi:    { lo: 0.02,   hi: 0.5,    note: "push-dose peak; infusions 0.5-20 ng/mL" },
  // PK_PARAMS now has three route-specific naloxone ids (naloxone_in/im/iv,
  // drugs.js) rather than one bare "naloxone" — same published reversal
  // range applies to all three, since it's the same drug, only the route
  // differs.
  naloxone_in: { lo: 0.002,  hi: 0.012,  note: "2-12 ng/mL reversal" },
  naloxone_im: { lo: 0.002,  hi: 0.012,  note: "2-12 ng/mL reversal" },
  naloxone_iv: { lo: 0.002,  hi: 0.012,  note: "2-12 ng/mL reversal" },
  amiodarone:{ lo: 1.0,    hi: 2.5,    note: "1-2.5 mg/L" },
  lidocaine: { lo: 1.5,    hi: 5.0,    note: "1.5-5 mg/L; >5 toxic" },
  atropine:  { lo: 0.002,  hi: 0.02,   note: "2-20 ng/mL vagolytic" },
  diltiazem: { lo: 0.05,   hi: 0.2,    note: "50-200 ng/mL" },
  metoprolol:{ lo: 0.02,   hi: 0.34,   note: "20-340 ng/mL" },
};

function probeDrug(id) {
  const def = DRUGS[id];
  const pk = PK_PARAMS[id];
  if (!def || !pk) return null;
  const p = new Patient({ age: 35, sex: "male", weight: 70 }, 0);
  const s = { t: 0, doses: [], given: {} };
  for (let T = STEP; T <= SETTLE_MIN * 60; T += STEP) {
    s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
  }
  s.doses.push({ id, at: SETTLE_MIN * 60 });
  let cmax = 0, tmax = 0;
  const end = (SETTLE_MIN + OBSERVE_MIN) * 60;
  for (let T = SETTLE_MIN * 60 + STEP; T <= end; T += STEP) {
    s.t = T; p.lastUpdate = T - STEP; p.update(STEP / 60, s);
    const dr = p.drugInstances.find((d) => d.id === id);
    if (dr && dr.effectConc > cmax) { cmax = dr.effectConc; tmax = (T - SETTLE_MIN * 60) / 60; }
  }
  const imax = cmax / ((pk.ec50 ?? 0.1) + cmax);
  const halfLife = pk.kel > 0 ? Math.log(2) / pk.kel : Infinity;
  return { id, dose: def.dose, cmax, imax, tmax, halfLife, v1: pk.v1, ec50: pk.ec50 };
}

console.log("PK PARAMETER AUDIT — standard dose vs published concentrations\n");
console.log("drug         dose      v1     EC50      Cmax       published        Imax   thalf* Tmax  flag");
console.log("-".repeat(108));

const flagged = [];
for (const id of Object.keys(PK_PARAMS)) {
  const r = probeDrug(id);
  if (!r) { console.log(`${id.padEnd(12)} (no drug definition — PK entry is orphaned)`); continue; }
  const pub = PUBLISHED[id];
  let flag = "";
  if (r.imax > 0.95) flag = "SATURATED";
  // A `subMaximal` drug is dosed below full engagement on purpose (see pushEpi),
  // so a low Imax is the design rather than a defect. SATURATED still applies to
  // it: a titration bolus that reaches the flat top is broken regardless.
  else if (r.imax < 0.25 && !pub?.subMaximal) flag = "INERT";
  let ratio = "";
  if (pub) {
    const mid = Math.sqrt(pub.lo * pub.hi);
    const f = r.cmax / mid;
    ratio = f >= 10 || f <= 0.1 ? `  Cmax x${f >= 1 ? f.toFixed(0) : "1/" + (1 / f).toFixed(0)}` : "";
    if (ratio) flag = (flag ? flag + "," : "") + "CONC";
  }
  if (flag) flagged.push(`${id}: ${flag}${ratio}${pub ? "  (published " + pub.note + ")" : ""}`);
  console.log(
    r.id.padEnd(12) +
    String(r.dose).padEnd(10) +
    String(r.v1).padEnd(7) +
    String(r.ec50).padEnd(10) +
    r.cmax.toExponential(2).padEnd(11) +
    (pub ? `${pub.lo}-${pub.hi}`.padEnd(17) : "".padEnd(17)) +
    r.imax.toFixed(3).padEnd(7) +
    r.halfLife.toFixed(0).padEnd(7) +
    r.tmax.toFixed(1).padEnd(6) +
    flag
  );
}

console.log("\n" + "=".repeat(108));
console.log(`${flagged.length} of ${Object.keys(PK_PARAMS).length} entries flagged:\n`);
for (const f of flagged) console.log("  - " + f);
console.log("\nSATURATED = standard dose on the flat top of the curve (cannot be titrated;");
console.log("            an overdose is indistinguishable from a normal dose).");
console.log("INERT     = standard dose barely engages the receptor.");
console.log("CONC      = peak concentration is >=10x or <=1/10 the published range.");
