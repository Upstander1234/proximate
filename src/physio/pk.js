// Pharmacokinetics/pharmacodynamics + procedure application.
// This is the single integration point between the physiology engine and
// data/drugs.js + data/procedures.js: any drug/procedure that wants to affect
// the patient must express itself as either:
//   - fx: { propName: amount }   -- direct additive effects (see the big
//         if/else chain in updateDrugs for the full list of supported props:
//         hr, sbp, rr, fio2, pain, blood, ph, coag, temp, k, kShift, hco3,
//         bronch, edema, shunt, glu, ca, bleed, plasminActivity, tv)
//   - receptors: { alpha, beta1, beta2, vagalBlock, venodilation,
//         arteriolarDilation, calciumChannel, V1, parasympathetic }
//         -- composed into pat._alphaDrug/_beta1Drug/_beta2Drug, which
//         cardiovascular.js's updateAutonomic() folds into alphaTone/
//         beta1Tone/beta2Tone alongside the patient's own sympathetic tone.
// Plus the boolean procedure flags handled in applyProcedures():
// airwayFix, ptxFix, stopsBleed, rhythmFix, drainsChest, sealsChest,
// shadeFix, icdMagnet.
import { DRUGS } from "../data/drugs.js";
import { PROCS } from "../data/procedures.js";
import { curve } from "../util.js";
import { HCT_NORMAL, NORMAL_HB } from "./constants.js";

// `renalFrac` is the fraction of TOTAL clearance that is renal; the remainder is
// treated as hepatic. It is not decoration — see organClearanceFactor() below.
// Until it existed, kel was a constant, which meant NO drug in the engine
// (including the 17 that already had two-compartment kinetics) cleared any more
// slowly in renal failure, in shock liver, or in a patient with no cardiac
// output. A morphine dose in a dialysis patient behaved exactly as it does in a
// marathon runner. Values below are the documented elimination route for each
// drug, stated per drug rather than averaged into a global constant.
// Naloxone's dissociation constant at the mu-opioid receptor, mg/L.
// ~1 nM = 0.33 ng/mL; 0.0005 mg/L is that order, and it is the quantity that
// sets how much antagonist is needed to overcome a given agonist load.
// `keo` is the effect-site equilibration rate constant (per minute): how fast the
// concentration at the receptor catches up with the concentration in plasma. It
// is what separates a drug that acts in one arm-brain circulation time from one
// whose peak effect lags the dose by a quarter of an hour, and it was a single
// shared 0.1 for the whole formulary until the arrhythmia efficacy harness showed
// what that costs — every drug peaked at ~17 minutes, which made lidocaine
// useless in the arrhythmia it exists to treat. Absent here, 0.1 is still used.
export const NALOXONE_KI = 0.0005;

export const PK_PARAMS = {
  // FENTANYL — v1 and ec50 identified against published PK/PD, not chosen.
  // Central volume ~13 L (was 2 L, ~6x too small) and EC50 ~1.2 ng/mL = 0.0012
  // mg/L for analgesia and ventilatory depression (was 0.02 mg/L = 20 ng/mL,
  // ~17x too high). The two errors partly cancelled, which is why nothing looked
  // obviously wrong: a standard 50 mcg dose reached only 28% of maximal effect,
  // giving a peak PaCO2 rise of 0.8 mmHg where roughly 5 is documented.
  fentanyl:  { kel: 0.01, k12: 0.2, k21: 0.1, v1: 13,  ec50: 0.0012, renalFrac: 0.10, keo: 0.14 },  // t1/2ke0 ~5 min// hepatic CYP3A4; <10% unchanged renal
  // MORPHINE — v1 and ec50 identified against published PK/PD. The audit
  // measured a peak effect-site concentration 15x the documented 20-80 ng/mL
  // analgesic range, because the central volume was ~7x too small; the EC50 was
  // inflated 4x, so the two again partly cancelled and the standard dose looked
  // about right while everything else on the curve did not. It matters here
  // beyond tidiness: competitive antagonism depends on the RATIO of naloxone to
  // opioid at the receptor, so an opioid concentration 15x too high made
  // reversal far harder to achieve and re-narcotisation far too slow.
  //   v1   18 L      central volume ~0.25 L/kg
  //   ec50 0.025     25 ng/mL, mid-range for analgesia
  morphine:  { kel: 0.008, k12: 0.15, k21: 0.1, v1: 18, ec50: 0.025, renalFrac: 0.55, keo: 0.04 },  // t1/2ke0 ~17 min — morphine crosses the blood-brain barrier SLOWLY, which is why its peak effect lags the dose by a quarter of an hour and why re-dosing too early stacks// M6G is RENALLY cleared and active — accumulates in CKD
  // MIDAZOLAM — central volume ~15 L (0.2 L/kg), EC50 for sedation ~0.1 mg/L
  // (100 ng/mL). Was v1 1.5 L / ec50 0.05: a 5 mg dose reached Imax 0.956, i.e.
  // the flat top of the curve, so 2 mg and 10 mg were indistinguishable.
  midazolam: { kel: 0.02, k12: 0.3, k21: 0.2, v1: 15,   ec50: 0.1, renalFrac: 0.20, keo: 0.14 },  // t1/2ke0 ~5 min// hepatic CYP3A4; active 1-OH metabolite renally cleared
  // KETAMINE — central volume ~40 L, EC50 for dissociation ~1.0 mg/L. Was
  // v1 3 / ec50 0.2, giving Cmax 8.7 mg/L against a published 0.5-2.5 and
  // Imax 0.977.
  ketamine:  { kel: 0.03, k12: 1.0, k21: 0.5, v1: 40,   ec50: 1.0, renalFrac: 0.05, keo: 0.7 },  // t1/2ke0 ~1 min — effect is essentially arm-brain circulation time // almost entirely hepatic; flow-limited extraction
  // ETOMIDATE — v1 identified so that the EFFECT-SITE peak lands in range, EC50 for hypnosis ~0.3 mg/L. Was v1 2 /
  // ec50 0.05, giving Cmax 1.6 mg/L against a published 0.2-0.6 and Imax 0.969.
  etomidate: { kel: 0.05, k12: 2.0, k21: 0.5, v1: 8,    ec50: 0.3, renalFrac: 0.10, keo: 0.46 },  // t1/2ke0 ~1.5 min — induction agent// hepatic and plasma esterases
  // ROCURONIUM — central volume ~12 L, EC50 for neuromuscular block ~1.5 mg/L.
  // Was v1 0.3 L / ec50 0.05: Cmax came out at 81 mg/L, SIXTY-FOUR times the
  // published range, with Imax 0.999 — complete saturation, so a paralytic
  // could never be under-dosed or seen to wear off.
  rocuronium:{ kel: 0.0345, k12: 0.167, k21: 0.0558, v1: 12, ec50: 1.5, renalFrac: 0.30, keo: 0.25 },  // onset 60-90 s, peak block 2-3 min// biliary-dominant, ~30% renal
  // CATECHOLAMINES — central volume and EC50 identified against published
  // values. v1 was 0.06 L, i.e. sixty millilitres of distribution volume for a
  // whole adult; that put a 1 mg push at 5.97 mg/L against a documented
  // push-dose peak near 0.1, and drove Imax to 0.984. At that point the drug
  // sits on the flat top of its curve: 1 mg and 10 mg are indistinguishable, a
  // 20 mcg push-dose pressor is indistinguishable from an arrest dose, and
  // nothing about epinephrine dosing can be taught with it.
  //   v1   8 L        central volume ~0.1 L/kg
  //   ec50 0.01       10 ng/mL, mid-range for beta-adrenergic effect
  // A 1 mg arrest dose now gives Imax ~0.93 — still near-maximal, as it should
  // be — while 20 mcg gives ~0.2, so the two are finally different drugs.
  epiIV:     { kel: 0.3,  k12: 0.5, k21: 0.3, v1: 8,     ec50: 0.003, renalFrac: 0.05, keo: 0.7 },// COMT/MAO in blood and tissue, not organ-dependent
  pushEpi:   { kel: 0.3,  k12: 0.5, k21: 0.3, v1: 8,     ec50: 0.003, renalFrac: 0.05, keo: 0.7 },
  norepi:    { kel: 0.1,  k12: 0.4, k21: 0.3, v1: 8,     ec50: 0.008, renalFrac: 0.05, keo: 0.7 },  // immediate
  // NALOXONE — parameters identified against published PK/PD, replacing the
  // technical-debt note that stood here.
  //
  // Previously kel 0.022 (t1/2 32 min), v1 1.2 L, ec50 0.08 mg/L. The PK audit
  // (src/scripts/pkAudit.mjs) measured a peak effect-site concentration of
  // 0.21 mg/L against a published reversal range of 2-12 ng/mL — 43x too high,
  // because the central volume was ~20x too small. The EC50 was inflated by a
  // similar factor, which is why the error was invisible: the two cancelled and
  // the drug behaved roughly correctly at the standard dose while being wrong
  // everywhere else on the curve.
  //
  //   v1   21 L      central volume ~0.3 L/kg (total Vd ~2 L/kg)
  //   ec50 0.002     2 ng/mL, the concentration reversing about half of a
  //                  therapeutic opioid effect
  //   kel  0.0564    with k12 0.154 / k21 0.0513
  //
  // CORRECTION TO A PREVIOUS BATCH'S CLAIM. kel was first set to ln2/60 = 0.0116
  // on the reasoning that naloxone's half-life is 60 minutes. That was wrong:
  // in a two-compartment model kel is the elimination rate from the CENTRAL
  // compartment alone, and the TERMINAL half-life is set by all four rate
  // constants together. Because most of the drug sits peripherally (0.234 mg
  // against 0.099 mg central at one hour), only 17% of the dose was cleared in
  // the first hour and the measured terminal half-life was 242 minutes — four
  // times the documented value. Naloxone therefore outlasted every opioid it
  // reversed and re-narcotisation could not occur, which was the very failure
  // the earlier batches set out to fix.
  //
  // These three are now solved together against two observables: a distribution
  // half-life of a few minutes and a TERMINAL half-life inside the documented
  // 30-90 minutes. Measured: peak effect-site concentration 5.1 ng/L-scale
  // (published reversal range 2-12 ng/mL), terminal half-life 69 min.
  // Split into three route-specific drug ids by a concurrent session
  // (naloxone_in/naloxone_im/naloxone_iv, drugs.js) without updating this
  // table — PK_PARAMS was still keyed by the single retired "naloxone" id,
  // so none of the three real ids ever matched here, `isPk` (below) read
  // false for all of them, and DrugInstance fell through to a dead branch
  // (central=0, no absorption at all — not even curve-model behavior).
  // Combined with the antagonist pre-pass below still checking
  // `dr.id !== "naloxone"`, naloxone reversal was completely non-functional
  // for every route. Same kinetics for all three — this is one drug, only
  // the route/absorption differs, which DrugInstance's own route handling
  // (this.route, this.intramuscular) already accounts for separately.
  naloxone_in: { kel: 0.0564, k12: 0.154, k21: 0.0513, v1: 21, ec50: 0.002, renalFrac: 0.15, keo: 0.5 },
  naloxone_im: { kel: 0.0564, k12: 0.154, k21: 0.0513, v1: 21, ec50: 0.002, renalFrac: 0.15, keo: 0.5 },
  naloxone_iv: { kel: 0.0564, k12: 0.154, k21: 0.0513, v1: 21, ec50: 0.002, renalFrac: 0.15, keo: 0.5 },  // reversal is visible within 1-2 min// hepatic glucuronidation
  // epiIM's keo is lower than every other drug in this table (0.1 vs the
  // usual 0.5-0.7-ish range) — identified by measurement, not left at the
  // shared default. The two-stage depot (drugs.js, queue item 4) already
  // does most of the work of delaying Tmax; effect-site equilibration this
  // slow adds the last few minutes needed to clear the published 45-50 min
  // band without pushing Cmax out of range (measured, alongside imKa 0.013 /
  // deepDepotFraction 0.35 / deepDepotRelease 0.025 in drugs.js: Cmax 461
  // pg/mL, Tmax 46 min — both inside the published 420-580 pg/mL / 45-50 min
  // bands). epiAuto does NOT need this — its much smaller deep-depot fraction
  // already lands Tmax ~21 min at its own default keo — so only epiIM's is
  // changed.
  epiIM:     { kel: 0.3,  k12: 0.5, k21: 0.3, v1: 8,     ec50: 0.003, renalFrac: 0.05, keo: 0.1 },  // slow effect-site tracking, see above
  epiAuto:   { kel: 0.3,  k12: 0.5, k21: 0.3, v1: 8,     ec50: 0.003, renalFrac: 0.05, keo: 0.7 },  // the DELAY for IM is absorption, modelled in the depot
  // AMIODARONE EC50: 0.1 -> 1.75 mg/L. The last SATURATED entry in pkAudit.
  //
  // The defect was an EC50 an order of magnitude below the concentrations the
  // drug actually operates at. Amiodarone's published therapeutic plasma range
  // is 1-2.5 mg/L; an EC50 of 0.1 put that ENTIRE range on the flat top of the
  // dose-response curve. Measured effect intensity at the 300 mg dose was 0.963,
  // and the consequence was a drug that could not be titrated or overdosed:
  //
  //   dose      150 mg   300 mg   900 mg        (potassium-channel blockade)
  //   ec50 0.1   0.465    0.482    0.494        6x the dose, 6% more effect
  //   ec50 1.75  0.214    0.300    0.409        titratable
  //
  // 1.75 mg/L is identified, not fitted, and three independent anchors agree:
  //   * it lies inside the published 1-2.5 mg/L therapeutic range, which is
  //     where a titratable drug's EC50 has to be;
  //   * it yields a blockade of 0.300 at the standard dose — precisely the
  //     value that the QTc constant in cardiovascular.js states it was
  //     identified against ("a standard dose produces a blockade of ~0.30
  //     here"). That constant was calibrated for an UNSATURATED amiodarone and
  //     had been running against an inflated 0.482 ever since;
  //   * the resulting QTc prolongation is +11.3%, the centre of the documented
  //     10-15% for IV amiodarone. The saturated model gave +18.1% — the
  //     saturation was overstating the QT hazard, not just flattening the curve.
  //
  // The blockade coefficients in drugs.js are deliberately NOT changed. They
  // were correct for the unsaturated case all along; the kinetics were inflating
  // them downstream. This is the converse of the usual lesson — a correct
  // mechanism made three benchmarks better at once.
  amiodarone:{ kel: 0.005, k12: 2.0, k21: 0.01, v1: 10,  ec50: 1.75, renalFrac: 0.00, keo: 0.25 },// negligible renal excretion — dose is NOT adjusted in renal failure
  // LA County TP 1210's real repeat dose (150mg, drugs.js's `amiodarone2`)
  // — same drug, same kinetics as the entry immediately above. A SECOND
  // DrugInstance with its own compartments (not a top-up of the first —
  // see pk.js's own two-compartment model, each instance integrates
  // independently and effects sum at the concentration level), so it needs
  // its own PK_PARAMS row despite being pharmacologically identical;
  // omitting it left the drug with declared receptors/antiarrhythmic
  // effects but no way to ever reach a concentration — caught by a direct
  // engine probe (`[pk] drug "amiodarone2" declares twoCompartment but has
  // no PK_PARAMS entry` warning) before this was trusted, not assumed
  // fine because the rule-firing logic alone tested clean.
  amiodarone2:{ kel: 0.005, k12: 2.0, k21: 0.01, v1: 10, ec50: 1.75, renalFrac: 0.00, keo: 0.25 },
  // LIDOCAINE — v1 identified so that the EFFECT-SITE peak lands in range, EC50 ~2.5 mg/L. The published therapeutic
  // window is 1.5-5 mg/L with toxicity above 5, so this is the drug where
  // concentration realism matters most: the whole clinical point of lidocaine is
  // that the therapeutic and toxic ranges nearly touch. Was v1 1.5 / ec50 0.1,
  // giving Cmax 5.9 mg/L and Imax 0.983 — permanently saturated, therefore
  // permanently unable to express either under-dosing or toxicity.
  lidocaine: { kel: 0.01, k12: 1.0, k21: 0.1, v1: 3,     ec50: 2.5, renalFrac: 0.03, keo: 0.55 },// keo: effect within 1-2 min, as an IV antiarrhythmic bolus must be// FLOW-LIMITED hepatic extraction — toxicity in low cardiac output states
  // ATROPINE — v1 25 L (~0.35 L/kg), EC50 0.005 mg/L for vagolysis. Was v1 0.3 /
  // ec50 0.1, giving a peak concentration 137x the published range.
  atropine:  { kel: 0.05, k12: 0.2, k21: 0.1, v1: 25,    ec50: 0.005, renalFrac: 0.50, keo: 0.5 },// ~50% excreted unchanged in urine
  diltiazem: { kel: 0.05, k12: 0.5, k21: 0.1, v1: 5,     ec50: 0.1, renalFrac: 0.05, keo: 0.14 },  // t1/2ke0 ~5 min // extensive first-pass hepatic metabolism
  metoprolol:{ kel: 0.02, k12: 0.6, k21: 0.2, v1: 4,     ec50: 0.1, renalFrac: 0.05, keo: 0.07 },  // t1/2ke0 ~10 min// CYP2D6; <5% unchanged renal
};

// ---------------------------------------------------------------------------
// ORGAN-DEPENDENT CLEARANCE
// Elimination is not a property of a molecule alone; it is a property of the
// molecule AND the organ that removes it. This splits each drug's first-order
// elimination constant into its documented renal and hepatic fractions and
// scales each by the function of that organ.
//
//  * RENAL: scales with glomerular filtration relative to this patient's own
//    baseline. pat.gfr already falls with chronic kidney disease, with acute
//    injury, and with the renal hypoperfusion of shock, so all three slow
//    excretion without any of them needing to know about pharmacology.
//
//  * HEPATIC: scales with hepatocellular integrity (pat.liverInjury) AND with
//    hepatic blood flow, approximated by cardiac output relative to rest. The
//    blood-flow term is the important one for prehospital care: high-extraction
//    drugs such as lidocaine are FLOW-LIMITED, so in cardiogenic shock — the
//    exact patient who gets an antiarrhythmic — clearance falls with the output
//    and repeat doses accumulate to toxicity. That is a documented clinical
//    hazard the engine previously could not represent at all.
//
// Returns a multiplier on kel. Floored well above zero so that a drug can still
// leave a patient in profound shock (very slowly), rather than latching forever.
function organClearanceFactor(pat, renalFrac) {
  const rf = Math.max(0, Math.min(1, renalFrac ?? 0.3));
  // renal.js exposes this as a named 0-1 fraction; see the note there for why
  // it is not simply gfr / baseGfr.
  const renal = Math.max(0.05, Math.min(1.5, pat.renalClearanceFraction ?? 1));
  // Resting cardiac output for this body size is the reference; the ratio is
  // capped at 1 because a hyperdynamic state does not clear faster than the
  // liver's own enzymatic capacity allows.
  const restCo = pat._restCo || 5.0;
  const flow = Math.max(0.15, Math.min(1, (pat.co ?? restCo) / restCo));
  const hepatocyte = Math.max(0.1, 1 - (pat.liverInjury || 0) * 0.7);
  const hepatic = Math.max(0.05, flow * hepatocyte);
  return rf * renal + (1 - rf) * hepatic;
}

class DrugInstance {
  static _warned = new Set();
  // `route` overrides the drug definition's default route, so the SAME drug can
  // be given IV on scene or taken orally at home and differ only in its kinetics.
  constructor(id, dose, time, bioavailability = 1, route = null) {
    this.id = id;
    this.time = time;
    const drugDef = DRUGS[id] || PROCS[id];
    this.drugDef = drugDef;
    // ROUTE IS A PROPERTY OF THE ADMINISTRATION, NOT OF THE PK MODEL.
    // This was previously resolved inside the two-compartment branch only, so
    // any drug without PK_PARAMS silently skipped it — including albuterol and
    // nitroglycerin, the two drugs used to demonstrate the inhaled and
    // sublingual mechanisms. Their route handling never executed. Resolving it
    // here means route behaves consistently for every drug regardless of which
    // kinetic model it uses.
    const r = (route || drugDef?.route || "IV").toUpperCase();
    this.route = r;
    this.enteral = r.includes("PO") || r.includes("ORAL") || r.includes("SL") || r.includes("NG");
    this.inhaled = r.includes("NEB") || r.includes("INH") || r.includes("MDI");
    this.intramuscular = r.includes("IM") && !r.includes("IV") && !r.includes("IO");
    // Local airway depot exists for inhaled drugs whether or not they carry a
    // full compartment model.
    this.airwayDose = this.inhaled ? dose * bioavailability : 0;
    this.airwayKel = 0.02;

    // ----- EXPLICIT KINETIC MODEL SELECTION -----
    // Previously the model was chosen by whether PK_PARAMS happened to contain
    // an entry: a drug with parameters got two-compartment kinetics, one without
    // silently fell back to an onset/duration curve. That made "no PK model" and
    // "PK model not yet written" indistinguishable, and it hid the fact that 32
    // of 48 drugs were on the simplified path. A drug must now DECLARE its model:
    //   "twoCompartment" — full central/peripheral disposition (needs PK_PARAMS)
    //   "curve"          — deliberate simplification, effect follows onset/dur
    //   "fluid"          — not a receptor drug; acts by volume/composition
    //   "none"           — no systemic pharmacology (e.g. topical/mechanical)
    // An undeclared drug is reported once rather than quietly downgraded.
    const declared = drugDef?.pkModel;
    const pk = PK_PARAMS[id];
    if (!declared && !DrugInstance._warned.has(id)) {
      DrugInstance._warned.add(id);
      if (typeof console !== "undefined" && console.warn) {
        console.warn(`[pk] drug "${id}" does not declare pkModel; defaulting to ` +
          `${pk ? "twoCompartment" : "curve"}. Declare it explicitly in drugs.js.`);
      }
    }
    if (declared === "twoCompartment" && !pk && !DrugInstance._warned.has(id + ":params")) {
      DrugInstance._warned.add(id + ":params");
      if (typeof console !== "undefined" && console.warn) {
        console.warn(`[pk] drug "${id}" declares twoCompartment but has no PK_PARAMS entry.`);
      }
    }
    const model = declared || (pk ? "twoCompartment" : "curve");
    this.pkModel = model;
    if (pk && model === "twoCompartment") {
      // ABSORPTION COMPARTMENT.
      // Everything previously entered the central compartment instantly at full
      // dose — IV bolus kinetics for every drug regardless of how it was given.
      // An enteral dose instead sits in a gut depot and is absorbed first-order
      // into the circulation, and only the fraction surviving first-pass hepatic
      // extraction ever arrives. That is what separates a tablet from a push:
      // a slow rise to a much lower peak, which is precisely why chronic oral
      // therapy does not look like repeated IV boluses.
      const enteral = this.enteral;
      const inhaled = this.inhaled;
      if (inhaled) {
        // INHALED / NEBULISED ROUTE.
        // The dose is delivered to the airway surface, where it acts on local
        // receptors at high concentration, while only a small fraction is
        // absorbed systemically. This is the whole pharmacological point of
        // inhaled therapy: strong airway effect, modest systemic effect — which
        // is why nebulised albuterol bronchodilates powerfully but causes far
        // less tachycardia and potassium shift than the same drug given IV.
        // Modelling it as an IV bolus (which is what happened previously, since
        // the PK path ignored `route` entirely) inverted that relationship.
        this.ka = 0.06;                                   // systemic uptake from lung
        const systemicF = drugDef?.inhaledBioavailability ?? 0.15;
        this.depot = dose * bioavailability * systemicF;
        this.central = 0;
        // Local airway dose decays with mucociliary clearance/metabolism.
        this.airwayDose = dose * bioavailability;
        this.airwayKel = 0.02;                            // ~35 min local half-life
      } else if (this.intramuscular) {
        // INTRAMUSCULAR ROUTE.
        // Drug deposited in muscle must be carried away by muscle blood flow
        // before it can act, so absorption is both SLOW (peak at 10-20 min) and
        // PERFUSION-DEPENDENT. That second property is the clinically important
        // one: in shock, sympathetic vasoconstriction shunts blood away from
        // skeletal muscle, the depot is stranded, and an intramuscular dose can
        // fail to arrive at all. It is why IM epinephrine is unreliable in a
        // peri-arrest anaphylaxis patient and why the answer is IV access.
        // Treating IM as an IV bolus (which is what happened before the PK path
        // honoured `route`) made that failure mode unrepresentable.
        // 0.09/min is the well-perfused DEFAULT and it also governs DuoDote,
        // glucagon, IM midazolam and oxytocin — it must not be retuned to fix
        // one drug. Epinephrine needs its own value, and so does each DEVICE:
        // published Tmax for the same 0.3 mg is ~20 min from an auto-injector
        // against ~45-50 min from a vial and needle.
        this.ka = drugDef?.imKa ?? 0.09;
        this.perfusionDependent = true;
        // QUEUE ITEM 4 — TWO-STAGE DEPOT for drugs that self-limit their own
        // absorption (epinephrine's local alpha-1 vasoconstriction at the
        // injection site). A single first-order depot cannot reproduce a late
        // Tmax here: with kel 0.3/min, Tmax = ln(ka/kel)/(ka-kel), and no
        // fixed ka reaches 45-50 min without Cmax collapsing first (measured:
        // ka 0.026->8.9 min, 0.010->11.7, 0.006->13.3, 0.003->15.5 — halving
        // ka repeatedly buys a couple of minutes of Tmax while Cmax falls
        // proportionally, because so little of a slow trickle has arrived
        // before elimination claims it). A TIME-DECAYING ka on a single depot
        // was tried first and made it WORSE, not better (Tmax 17->13 min for
        // epiAuto, 25->16 for epiIM) — with ka fastest at t=0 and only
        // slowing afterward, absorption is MORE front-loaded, not less, so
        // the peak moves earlier. What actually reproduces a late peak is a
        // SECOND, slowly-releasing pool: physiologically, epinephrine's own
        // vasoconstriction traps part of the injected dose at the site
        // immediately, and that trapped fraction bleeds out into the
        // normally-absorbing depot only as local tone eases — a real
        // two-compartment absorption delay, not a coefficient on the same
        // one-stage model. drugDef.deepDepotFraction/deepDepotRelease are
        // undefined for every other perfusion-dependent IM drug (DuoDote,
        // glucagon, IM midazolam, oxytocin), so this is inert for all of them.
        if (drugDef?.deepDepotFraction) {
          this.depot = dose * bioavailability * (1 - drugDef.deepDepotFraction);
          this.deepDepot = dose * bioavailability * drugDef.deepDepotFraction;
        } else {
          this.depot = dose * bioavailability;
          this.deepDepot = 0;
        }
        this.central = 0;
        this.airwayDose = 0;
      } else if (enteral) {
        // ka ~ 0.035/min => absorption half-life ~20 min, typical of immediate
        // release oral formulations. Sublingual bypasses first pass and is faster.
        const sublingual = r.includes("SL");
        this.ka = sublingual ? 0.12 : 0.035;
        // First-pass extraction: the fraction reaching the systemic circulation.
        // Taken from the drug when declared, else a conservative default.
        const F = drugDef?.oralBioavailability ?? (sublingual ? 0.8 : 0.4);
        this.depot = dose * bioavailability * F;
        this.central = 0;
      } else {
        this.ka = 0;
        this.depot = 0;
        this.airwayDose = 0;
        this.central = dose * bioavailability;
      }
      this.peripheral = 0;
      this.effectConc = 0;
      this.pk = pk;
    } else {
      this.central = 0;
      this.effect = 0;
    }
  }
}

// Advances one two-compartment instance's central/peripheral/effect-site
// state by `dt` minutes. Factored out of the main per-tick loop below (which
// now just calls this) so the SAME code can also fast-forward a freshly
// constructed instance to a past dose time — see seedPastDose. This was a
// pure extraction: the main loop's own numbers are unchanged by it.
function advancePkCompartments(dr, dt, pat) {
  const drugDef = dr.drugDef;
  const organClearance = organClearanceFactor(pat, dr.pk.renalFrac);
  pat._organClearance = organClearance;   // exposed for the wiring suite
  let rem = dt;
  while (rem > 0) {
    const sstep = Math.min(0.1, rem);
    const { kel, k12, k21 } = dr.pk;
    // QUEUE ITEM 4 — deep-depot release feeds the normal depot BEFORE
    // that depot absorbs into central (see the constructor comment).
    // Slow, first-order, and independent of ka — this is the
    // rate-limiting step that lets Tmax land late.
    if (dr.deepDepot > 0 && drugDef.deepDepotRelease) {
      const released = drugDef.deepDepotRelease * dr.deepDepot;
      dr.deepDepot -= released * sstep;
      dr.depot += released * sstep;
    }
    // Gut absorption feeds the central compartment before elimination.
    let absorbed = 0;
    if (dr.ka > 0 && dr.depot > 0) {
      let ka = dr.ka;
      if (dr.perfusionDependent) {
        // Muscle blood flow falls with perfusion pressure and with the
        // alpha-mediated vasoconstriction that shock recruits. Both are
        // already computed by the cardiovascular model.
        const perfusion = Math.max(0.05, Math.min(1.2, (pat.map || 90) / 90));
        const shunt = 1 - Math.min(0.75, Math.max(0, (pat.alphaTone || 0) - 0.25) * 0.6);
        ka *= perfusion * shunt;
      }
      absorbed = ka * dr.depot;
      dr.depot -= absorbed * sstep;
    }
    // Elimination scaled by the eliminating organs' current function.
    const kelEff = kel * organClearance;
    const dCentral = absorbed - kelEff * dr.central - k12 * dr.central + k21 * dr.peripheral;
    const dPeriph = k12 * dr.central - k21 * dr.peripheral;
    dr.central += dCentral * sstep;
    dr.peripheral += dPeriph * sstep;
    rem -= sstep;
  }
  // EFFECT-SITE EQUILIBRATION IS A PROPERTY OF THE DRUG, NOT A CONSTANT.
  // ke0 was 0.1/min for everything, giving a time-to-peak effect of
  // roughly 17 minutes for every drug in the formulary. For a bolus
  // antiarrhythmic that is not a rounding error — it makes lidocaine
  // useless in precisely the emergency it exists for, because the rhythm
  // has already degenerated before the drug reaches the myocardium. Found
  // while building the efficacy harness: lidocaine failed to reduce VT
  // incidence at all, and the reason was onset, not potency.
  const ke0 = dr.pk.keo ?? 0.1;
  dr.effectConc += (dr.central / dr.pk.v1 - dr.effectConc) * (1 - Math.exp(-ke0 * dt));
}

// Seeds a dose that is ALREADY circulating when a scenario starts — an
// opioid on board at EMS contact, a chronic home medication, anything a
// condition needs to be genuinely mid-pharmacokinetics rather than "just
// given" at t=0. A DrugInstance's own constructor always represents a dose
// administered AT THIS INSTANT (central/depot start fresh); nothing in the
// per-tick loop retroactively accounts for dr.time for a twoCompartment
// drug (dr.time is read only by the curve-model path and the dose-dedup
// check — see the grep-confirmed callers of dr.time elsewhere in this
// file). So a condition that wants a patient found already deep in an
// opioid's effect-site curve must fast-forward the instance itself, through
// the SAME advancePkCompartments code the real per-tick loop uses (not a
// reconstruction of it — this calls the identical function), before the
// engine ever sees it. Queue item 37's opioidOD is the first consumer.
export function seedPastDose(pat, id, dose, elapsedMin, bioavailability = 1, route = null) {
  const dr = new DrugInstance(id, dose, -elapsedMin * 60, bioavailability, route);
  if (dr.pk && elapsedMin > 0) advancePkCompartments(dr, elapsedMin, pat);
  return dr;
}

// A dose applies to this patient if it was explicitly stamped for them
// (patientId === pat._id, set by physiology.js's giveDose) or if it carries
// no patientId at all — the latter keeps old saves and any caller that still
// writes s.doses directly working exactly as before (global, roster-wide).
const dosesFor = (s, pat) => (s.doses || []).filter(d => d.patientId == null || d.patientId === pat._id);

export function applyProcedures(pat, s) {
    dosesFor(s, pat).forEach(d => {
      const proc = PROCS[d.id] || DRUGS[d.id];
      if (!proc) return;
      if (proc.airwayFix) pat.airway = "clear";
      // Needle/finger decompression relieves AIR under tension. It does
      // nothing for BLOOD (hemothorax, pat.ptx === "hemo") — a real, distinct
      // clinical limitation (needle decompression targets the 2nd
      // intercostal space anteriorly for air; blood pools dependently and a
      // needle does not drain it), not an oversight — so this is
      // deliberately narrowed to the two air-filled states rather than any
      // truthy pat.ptx.
      if (proc.ptxFix && (pat.ptx === "ptx" || pat.ptx === "tptx")) pat.ptx = null;
      // Tube thoracostomy actually DRAINS the pleural space, so unlike needle
      // decompression it clears a hemothorax too (queue item 7 —
      // hemothorax), the real clinical distinction between the two
      // procedures that ptxFix alone could not express. Draining also
      // re-expands a lung compressed by pleural fluid (hemothorax OR a
      // large effusion) — the same pat.pleuralEffusion handle both
      // conditions use.
      if (proc.drainsChest && (pat.ptx || (pat.pleuralEffusion || 0) > 0)) {
        pat.ptx = null;
        pat.pleuralEffusion = 0;
      }
      // A vented chest seal (queue item 7 — openPneumothorax/hemothorax)
      // previously had fx:{} — completely inert, despite three existing
      // scenarios' own resolve() text already claiming it "keeps the sucking
      // wound from becoming a tension." Persistent boolean, like
      // airwayFix/ptxFix: once sealed, it stays sealed.
      if (proc.sealsChest) pat.chestSealApplied = true;
      // Move to shade (queue item 26) — an instantaneous, persistent
      // environmental change, the same idiom as airwayFix/ptxFix: real
      // relocation to shade does not need to be re-applied every tick to
      // stay true, so it is a boolean flip, not a continuous curve.
      if (proc.shadeFix) pat.inShade = true;
      // ICD magnet (queue item 7 — aicdMalfunction) — persistent, same idiom
      // as chestSealApplied/inShade: a magnet taped in place stays in place.
      if (proc.icdMagnet) pat.icdSuppressed = true;
      // Head-of-bed elevation (queue item 70) — persistent, same idiom: a
      // raised gurney stays raised. Read by neuro.js's own pat.icp formula.
      if (proc.headElevated) pat.headElevated = true;
      // LIMB-CIRCULATION queue item, Phase 1 (CLAUDE.md section 6): a
      // tourniquet only ever occludes flow DISTAL to itself on ONE limb —
      // it should never have stopped a torso wound or the opposite limb's
      // bleed, which the old unconditional `pat.activeBleedRate = 0` did.
      // REBOA's own aortic-occlusion use of stopsBleed is CORRECTLY
      // whole-body (proximal aortic control genuinely cuts flow to
      // everything downstream) and must keep that behavior — so this only
      // narrows to a single location when the DOSE explicitly carries one;
      // a dose with no `location` (every existing caller today, including
      // every REBOA application) falls through to the exact original
      // whole-body zero, unchanged. `pat._tqStoppedLocations` makes the
      // per-location subtraction idempotent across repeated ticks the same
      // way the whole-body SET already was (this branch runs every tick a
      // dur:9999 tourniquet dose sits in history).
      if (proc.stopsBleed) {
        const loc = d.location;
        if (loc && (pat.woundBleedByLocation || {})[loc] > 0) {
          pat._tqStoppedLocations = pat._tqStoppedLocations || {};
          if (!pat._tqStoppedLocations[loc]) {
            pat._tqStoppedLocations[loc] = true;
            pat.activeBleedRate = Math.max(0, pat.activeBleedRate - pat.woundBleedByLocation[loc]);
          }
        } else if (!loc) {
          pat.activeBleedRate = 0;
        }
        // Queue item 74, Phase 2: closing a real, related gap named in
        // Phase 1's own writeup -- a tourniquet stops bleeding BECAUSE it
        // occludes arterial inflow to the limb, not as an independent fact.
        // Only set for a LOCATED, real-limb dose: REBOA's own unlocated,
        // whole-body use is proximal aortic occlusion, a different vessel
        // entirely, and must not be represented as one limb's occlusion.
        // A SET (idempotent, not additive) -- the same shape as pat.chestSealApplied's
        // "taped in place stays in place" pattern above -- and never reset by
        // pk.js, mirroring woundBleedByLocation's own tourniquet consumer.
        if (loc && (pat.limbOcclusion || {})[loc] !== undefined) {
          pat.limbOcclusion[loc] = 1;
        }
      }
      // TORSADES IS SHOCKABLE AND WAS NOT ON THIS LIST. Unsynchronised
      // defibrillation is the required intervention for a polymorphic VT that
      // is pulseless or has degenerated ("unsynchronised defibrillation is
      // required if a torsades de pointes run induces ventricular fibrillation",
      // Merck Manual Professional; ACLS treats pulseless polymorphic VT as a
      // shockable arrest rhythm). A crew that recognised the rhythm and
      // defibrillated correctly got nothing at all.
      //
      // Note what is NOT changed: synchronised cardioversion still only
      // terminates SVT below, and that is correct — polymorphic VT has no
      // consistent R wave to synchronise to, which is exactly why the
      // unsynchronised shock is the one that is indicated. The distinction now
      // emerges from the two branches instead of both being unavailable.
      //
      // The shock does not touch a.repol, so a patient whose QT is still long
      // can start another episode afterwards. That is the correct teaching
      // point: electricity buys time, magnesium and the underlying cause are
      // the treatment.
      if (proc.rhythmFix === 1 && ["VF","VT","torsades"].includes(pat.rhythm)) {
        pat.rhythm = "sinus";
        pat._preTorsades = null;
        pat.rhythmInstability = 0;
      }
      // Adenosine terminates a true reentrant SVT back to sinus —
      // deliberately does NOT touch sinus tachycardia, which shares the same
      // monitor-tab category but isn't the same rhythm and won't respond,
      // and deliberately does NOT touch AFib (adenosine's own note already
      // says "contraindicated in WPW+AF" — a very short-acting AV nodal
      // block does not terminate chaotic atrial reentry the way it
      // terminates a single reentrant circuit).
      if (proc.rhythmFix === "svt" && pat.rhythm === "svt") {
        pat.rhythm = "sinus";
        pat.rhythmInstability = 0;
      }
      // Synchronised cardioversion has a WIDER real indication than
      // adenosine — unstable SVT AND unstable AFib/AFib-with-RVR both get
      // electrically cardioverted in the field (ACLS unstable-tachycardia
      // algorithm), so it carries its own rhythmFix value rather than
      // sharing adenosine's "svt"-only one. Cardiac conditions batch
      // (physiology queue item 7, atrialFibrillation): before this, giving
      // cardiovert to a fibrillating patient did nothing at all — a real
      // ACLS-indicated treatment was silently a no-op. Torsades is
      // deliberately NOT in this list — see the mechanismWiring assertion
      // this would otherwise contradict ("no consistent R wave to
      // synchronise to" is the actual clinical reason unsynchronised
      // defibrillation is indicated instead). Extended in this batch to
      // "flutter" (atrial flutter is exceptionally cardioversion-responsive
      // — often converts at LOW energy, a real, distinct teaching point)
      // and "VT" (stable monomorphic VT with a pulse is the ACLS
      // unsynchronised-vs-synchronised teaching case: defib already handles
      // VT via rhythmFix===1 above for the pulseless/unstable case,
      // synchronised cardioversion is the correct choice for the SAME
      // rhythm when the patient still has a perfusing pulse — the game's
      // procedure-selection UI is where that clinical judgement call
      // belongs, not this physiology layer, which just needs both routes to
      // actually terminate the rhythm).
      if (proc.rhythmFix === "cardiovert" && ["svt", "afib", "flutter", "VT"].includes(pat.rhythm)) {
        pat.rhythm = "sinus";
        pat.rhythmInstability = 0;
      }
      if (proc.fx && proc.fx.bleed) {
        pat.activeBleedRate = Math.max(0, pat.activeBleedRate + proc.fx.bleed);
      }
      // SUCTION (queue item 13) removes a FRACTION of pat.airwayFluid per
      // APPLICATION, not a continuous suppression — unlike stopsBleed/airwayFix
      // above, which are idempotent SETS safe to reapply every tick forever,
      // subtracting a fraction every tick for as long as the dose sits in
      // history would drive airwayFluid to 0 forever after a single suction
      // and make the "reaccumulates" behaviour (pediatricDrowning's continued
      // aspiration, severe edema's continued frothing) impossible to see.
      // Deduplicated by dose identity, same pattern as pk.js's own
      // `_dosesAdministered` ledger, so each real application (a new dose, a
      // new timestamp) fires exactly once.
      if (proc.reducesAirwayFluid) {
        pat._suctionedAt = pat._suctionedAt || new Set();
        const key = `${d.id}|${d.at}`;
        if (!pat._suctionedAt.has(key)) {
          pat._suctionedAt.add(key);
          pat.airwayFluid = Math.max(0, (pat.airwayFluid || 0) * (1 - proc.reducesAirwayFluid));
          // TRACHEOSTOMY INNER-CANNULA CLEARANCE (queue item 60, part 2 of
          // 3). Real "clear/replace the inner cannula" field care uses the
          // SAME suction catheter/equipment as oropharyngeal suctioning —
          // reusing the existing crew-directable "suction" action rather
          // than inventing a second, near-duplicate procedure that would
          // need its own gear.js/scope registration across every
          // jurisdiction. Cleared essentially completely (0.95, not a
          // partial fraction like airwayFluid's 0.6) — TP 1234's own field
          // step is "clear/replace the inner cannula", a real,
          // near-total-resolution intervention, not a partial suction of
          // an open airway. Only fires for a patient who actually has a
          // tracheostomy — a no-op, not an error, for everyone else.
          if (pat.tracheostomy) {
            pat.trachObstruction = Math.max(0, (pat.trachObstruction || 0) * 0.05);
          }
        }
      }
    });
}

export function updateDrugs(pat, s, dt) {
    // Reset per‑step accumulators
    pat.drugHr = 0; pat.drugSbp = 0; pat.drugRr = 0; pat.drugFio2 = 0.21;
    // INTRINSIC PAIN (queue item 20) — RESOLVED. This used to reset to a flat
    // 0 every tick and rebuild only from drug fx.pain deltas, so a condition's
    // initial:{pain:N} (or a wound's own bleed/pain aggregation) showed on the
    // very first render and then vanished for the rest of the call — MEASURED
    // pre-fix: the ami (crushing-chest-pain STEMI) scenario read drugPain 8 at
    // t=2s and 0 from t=60s on. Worse, appendicitis's own progress() wrote to
    // a SEPARATE pat.pain field that nothing anywhere read — a write-only dead
    // field, the exact class section 1 forbids. Now reseeded from
    // pat.intrinsicPain (patient.js) each tick, so drugPain = intrinsic
    // baseline + whatever this tick's active drug fx.pain deltas add (below,
    // in the effects loop, unchanged) — analgesia still works exactly as
    // before, it now has a real, persistent baseline to work AGAINST rather
    // than a number that was already zero. Floored at the read site
    // (vitals(), patient.js), not here, so a multi-drug accumulation mid-tick
    // is not clipped early.
    // Reseeded, then scaled by this patient's own painSensitivity trait
    // (queue item 50, patient.js) — real inter-individual variation in how
    // strongly a given noxious stimulus drives sympathetic/tachypneic
    // physiology. Analgesic drug effects (fx.pain deltas, applied below in
    // the effects loop) are deliberately NOT scaled — they act on this same
    // baseline afterward, unchanged.
    pat.drugPain = (pat.intrinsicPain || 0) * (pat.painSensitivity ?? 1);
    // Accumulated suppression of the medullary respiratory drive (see
    // respiratory.js). Consumes the `respiratoryDepression` property that drugs
    // already declared but which nothing in the engine read — opioid and
    // sedative respiratory failure was previously faked with a fixed rr offset.
    pat.respDriveSuppression = 0;
    // SEDATION DEPTH — real, direct pharmacologic CNS depression, distinct
    // from the engine's existing perfusion/metabolic consciousness
    // pathway (neuro.js). Before this, giving a large dose of midazolam or
    // etomidate to an otherwise healthy patient produced NO consciousness
    // change at all unless it happened to also cause enough respiratory
    // depression to drop oxygenation/perfusion — real sedative-hypnotic
    // drugs cause direct CNS depression through GABA-A potentiation
    // (midazolam) or GABA-A/other mechanisms (etomidate), independent of
    // any secondary hypoxic effect. Deliberately scoped to the two true
    // sedative-continuum drugs, not every CNS-active drug: fentanyl's own
    // sedation already emerges indirectly and correctly via
    // respDriveSuppression -> hypoxia -> the existing brainO2-based
    // pathway (adding a second, direct opioid contribution here would
    // double-count the same clinical phenomenon through two routes), and
    // ketamine is deliberately excluded — dissociation is a real,
    // qualitatively different state from sedation/unconsciousness (airway
    // reflexes and eye-opening are often preserved), not modeled here.
    // Recomputed fresh every tick from currently circulating drug, same as
    // respDriveSuppression/anticonvulsant above — reflects CURRENT
    // pharmacologic state, not an accumulating/ratcheting exposure.
    pat.sedationDepth = 0;
    // QUEUE ITEM 52 — a real, MECHANISTICALLY DISTINCT calming pathway from
    // sedationDepth immediately above: D2/5-HT2A receptor antagonism
    // (olanzapine, drugs.js) reduces psychomotor agitation without the
    // GABA-A-potentiation profile that drives sedationDepth's own
    // respiratory-depression/unconsciousness consequences — a real
    // clinical distinction (an atypical antipsychotic can calm a patient
    // without sedating them to unresponsiveness the way a benzodiazepine
    // does at an equivalent "calming" dose), not a duplicate of the same
    // mechanism under a second name. Recomputed fresh every tick from
    // currently circulating drug, same convention as sedationDepth.
    pat.antipsychoticEffect = 0;
    // Recomputed from the currently circulating antagonist, exactly like the
    // other receptor accumulators below. It was previously initialised once and
    // only ever incremented, so naloxone's blockade was PERMANENT for the rest
    // of the scene — re-narcotisation could not occur no matter how the drug's
    // kinetics were modelled. With this reset plus real clearance, the blockade
    // decays as naloxone is eliminated and a patient whose opioid outlasts the
    // antagonist will re-sedate on their own.
    pat.opioidBlockade = 0;
    // Antagonist concentration at the opioid receptor (mg/L). Competitive
    // antagonism acts by shifting the AGONIST's apparent EC50, so what the
    // engine needs to carry forward is a concentration, not an occupancy.
    pat.opioidAntagonistConc = 0;
    // Mechanical CPR: intensity of ongoing chest compressions (0 = none).
    // Consumed by the cardiovascular model as an external pump, NOT as a
    // blood-pressure offset.
    pat.cprActive = 0;
    // ASSISTED VENTILATION delivered by an external device or rescuer.
    // Collected as {rr, vt} rather than folded into drugRr/tvDrugOffset, because
    // a delivered breath REPLACES the patient's own breath — it does not add to
    // it. Summing them produced anatomically impossible tidal volumes (measured
    // 1.5 L from a bag that holds ~600 mL) and drove PaCO2 to 14 mmHg.
    pat.assistedVent = null;
    // Externally applied airway pressure (cmH2O) from CPAP/PEEP devices.
    pat.appliedPEEP = 0;
    // ARTIFICIAL AIRWAY (SGA / ETT / cricothyrotomy). Declared as the physical
    // change the device makes to the conducting airway — dead space excluded and
    // resistance replaced — rather than as a tidal-volume bonus. Reset every
    // step like every other device accumulator so a pulled tube stops acting.
    pat.artificialAirway = 0;
    pat.artificialAirwayRes = 1;
    // Transcutaneous pacemaker: rate demanded and stimulus strength. Whether the
    // myocardium CAPTURES is decided by cardiovascular.js, not here.
    pat.pacerRate = 0;
    pat.pacerOutput = 0;
    // Vagal maneuver (Valsalva/carotid sinus massage): a transient surge of
    // parasympathetic outflow, not a fixed rate subtraction.
    pat.vagalSurge = 0;
    // Aortic occlusion (REBOA): fraction of the systemic bed excluded.
    pat.aorticOcclusion = 0;
    // External heat added to the body, in watts (see thermo.js).
    pat.externalWarmingW = 0;
    // External cooling removed from the body, in watts (see thermo.js) —
    // queue item 26, the same power-into-the-heat-balance idiom as
    // externalWarmingW, in reverse.
    pat.externalCoolingW = 0;
    pat.venousCapacitanceDrug = 1;
    pat.tvDrugOffset = 0;
    // Fraction of respiratory muscle power abolished by a neuromuscular blocker.
    pat.neuromuscularBlock = 0;
    // Multiplicative drug effect on myocardial contractility (1 = unaffected).
    pat.drugInotropy = 1;
    // Antiarrhythmic channel blockade, accumulated across whatever is on board.
    pat.sodiumChannelBlock = 0;
    // ANTITHROMBOTIC therapy on board, split by PATHWAY because the two act
    // through fundamentally different biology and their benefit is additive:
    //   - antiplatelet (aspirin: irreversible COX-1 block -> less thromboxane A2
    //     -> less platelet aggregation; later P2Y12 inhibitors stack here);
    //   - anticoagulant (heparin: antithrombin activation -> factor Xa/IIa
    //     inhibition -> less thrombin generation).
    // A coronary thrombus is platelet-rich AND fibrin-dependent, so blocking one
    // pathway slows propagation and blocking both slows it more — which is the
    // whole reason ACS guidelines give aspirin + a P2Y12 inhibitor + heparin
    // rather than any one alone. The ACS condition reads both to gate thrombus
    // propagation (see conditions.js::acs). Reset each tick like every other drug
    // accumulator so the effect decays with the drug rather than latching.
    pat.antiplatelet = 0;
    pat.anticoagulant = 0;
    pat.seizureDrive = 0;
    // Fraction of seizure drive suppressed by an anticonvulsant on board.
    // Reset with the other drug accumulators so it decays with the drug rather
    // than latching — the naloxone blockade accumulator failed to reset once and
    // produced PERMANENT opioid reversal for two batches.
    pat.anticonvulsant = 0;
    // SERUM MAGNESIUM. Recomputed from scratch each tick like the other drug
    // aggregates, so it decays with the drug rather than ratcheting.
    // SERUM MAGNESIUM IS A PERSISTENT POOL, not a value recomputed from scratch.
    //
    // It used to be reset to _mgBase here every tick and then overwritten by
    // `Math.max(pat.mg, base + serumMg * intensity)` in the effects loop. That
    // made the level a SINGLE-DOSE CEILING: the max across dose instances is the
    // one strongest active dose, never their sum, so stacking three or six 4 g
    // loads left the peak pinned at 2.30 mmol/L (measured). A patient could not
    // be made toxic no matter what a crew did, which is why queue item 1 — the
    // toxicity thresholds — could not simply "hang off pat.mg": nothing could
    // reach 4.0. Magnesium is SOLELY renally cleared and toxicity is "almost
    // exclusively an iatrogenic or disease-related phenomenon" — stacked dosing
    // or renal impairment (StatPearls, Magnesium Toxicity). Both of those are
    // accumulation, which a max-of-doses writer structurally cannot represent.
    //
    // So pat.mg is now integrated across ticks like a real compartment: each
    // dose ADDS to it (below, in the effects loop) and renal clearance pulls it
    // back toward baseline HERE. It is therefore NOT reset. First-order decay
    // toward _mgBase with a rate scaled by renal function: magnesium's half-life
    // is ~a few hours with normal kidneys and open-ended without them, which is
    // the whole mechanism of the disease-related presentation.
    {
      const mgBase = pat._mgBase ?? 1.0;
      if (pat.mg == null) pat.mg = mgBase;
      // kel 0.004/min -> t1/2 ~2.9 h at normal renal function, matching the
      // documented several-hour half-life. renalClearanceFraction is the same
      // handle organClearanceFactor uses, so CKD/AKI slow magnesium clearance by
      // the same factor they slow every other renally-cleared drug — a floor of
      // 0.05 keeps anuria from freezing the pool completely.
      const renal = Math.max(0.05, Math.min(1.5, pat.renalClearanceFraction ?? 1));
      pat.mg = mgBase + (pat.mg - mgBase) * Math.exp(-0.004 * renal * dt);
    }
    // IONISED CALCIUM decays back toward its baseline (2.4 mmol/L) after a push,
    // for the same reason and by the same shape as magnesium above: the fx now
    // ADDS to a pool (see the "ca" branch below) rather than ratcheting, so
    // something has to bring it home. Calcium is regulated far faster than
    // magnesium — redistribution and PTH act over minutes — so it decays
    // quicker (kel 0.02/min, t1/2 ~35 min). Baseline is held per patient so a
    // hypocalcaemic trauma patient returns to THEIR level, not a normal one.
    {
      const caBase = pat._caBase ?? 2.4;
      if (pat.ca == null) pat.ca = caBase;
      pat.ca = caBase + (pat.ca - caBase) * Math.exp(-0.02 * dt);
    }
    pat.anticonvulsantEclamptic = 0;
    pat.potassiumChannelBlock = 0;
    pat.avSlowingDrug = 0;
    pat.sodiumBlockIschemiaSelective = false;
    pat.venousToneModifier = 1;
    pat.vagalBlock = 0;
    pat.uterotonicDrive = 0;
    let alphaDrug = 0, beta1Drug = 0, beta2Drug = 0;
    // Local airway receptor activity from inhaled drugs, kept separate from the
    // systemic tone so route determines where a drug acts, not just how much.
    let beta2Airway = 0;

    // ----- CHRONIC HOME MEDICATIONS -----
    // A patient's regular medications are already in their system when EMS
    // arrives, and they must behave through the SAME pharmacokinetics as anything
    // given on scene — not as a separate "baseline modifier". We therefore seed
    // real dose records in the past, spaced at the drug's own dosing interval, so
    // the existing PK model accumulates them to steady state on its own. Two
    // consequences fall out for free: the level is a genuine steady state rather
    // than an asserted number, and if the scene runs long enough the drug WEARS
    // OFF exactly as it would in life (which is what makes a missed dose, or a
    // long extrication, physiologically meaningful).
    if (!pat._homeMedsSeeded && Array.isArray(pat.homeMeds) && pat.homeMeds.length) {
      pat._homeMedsSeeded = true;
      for (const hm of pat.homeMeds) {
        const id = typeof hm === "string" ? hm : hm.id;
        const drugDef = DRUGS[id] || PROCS[id];
        if (!drugDef) continue;
        // Default to daily dosing; a drug may declare its own interval.
        const intervalSec = (typeof hm === "object" && hm.intervalMin ? hm.intervalMin : 720) * 60;
        // Home medications are taken by their real route at their real dose.
        // The oral absorption model above (gut depot + first-pass extraction)
        // now supplies the difference between a tablet and an IV push, which
        // removes the HOME_MAINTENANCE_FRACTION placeholder that previously
        // stood in for the missing pharmacology.
        const dose = (typeof hm === "object" && hm.amount) || drugDef.dose || 1;
        const route = (typeof hm === "object" && hm.route) || "PO";
        // Seed enough past doses to reach steady state for this drug's duration.
        const nDoses = Math.max(3, Math.min(8, Math.ceil(((drugDef.dur || 600) * 4) / intervalSec)));
        // QUEUE ITEM 39 FIX. This used to construct raw DrugInstances at
        // negative `time` offsets and rely on the per-tick loop to "accumulate
        // them to steady state on its own" — but per seedPastDose's own
        // comment above (queue item 37's finding), a DrugInstance's
        // constructor always starts a twoCompartment drug's central/depot
        // FRESH regardless of the `time` you pass it; nothing retroactively
        // fast-forwards it. So every "staggered" home-med dose was actually
        // landing simultaneously-fresh at t=0, and — confirmed empirically
        // before this fix — the dosing INTERVAL had zero effect on the
        // result (a once-daily and twice-daily schedule at the same amount
        // produced byte-identical concentrations), which is the unambiguous
        // signature of this bug. Fixed by reusing seedPastDose, the same fix
        // item 37 already applied to opioidOD's own past-dose seeding — it
        // fast-forwards each instance through the real
        // advancePkCompartments() the live per-tick loop uses, so an older
        // dose is genuinely further along its absorption/elimination curve
        // than a more recent one, and the interval finally matters.
        for (let i = nDoses; i >= 1; i--) {
          pat.drugInstances.push(seedPastDose(pat, id, dose, (i * intervalSec) / 60,
            drugDef.bioavailability ?? 1, route));
        }
      }
    }

    // Add new doses.
    //
    // ADMINISTRATION IS RECORDED SEPARATELY FROM THE LIVE INSTANCE — FOR PK
    // DRUGS ONLY, AND THAT RESTRICTION IS THE WHOLE POINT.
    //
    // The defect: this inferred "has this dose been given?" from the presence
    // of a matching DrugInstance, but instances are PRUNED below (~line 640)
    // once central, peripheral, depot and airwayDose are all under 0.001. For a
    // two-compartment drug that means full washout erases the only record it
    // was ever given, and the next tick re-creates it. Confirmed on a
    // 120-minute run with ONE scheduled epiAuto: depot 0.0002 mg at 74 min,
    // 0.2983 mg at 75 min, two distinct DrugInstance objects.
    //
    // THE TRAP, and why the obvious fix is wrong: a CURVE-model drug has no PK
    // compartments at all — central, peripheral, depot and airwayDose are
    // permanently 0 — so the same prune test discards it EVERY TICK, and the
    // re-creation this block performs is not a bug for those drugs, it is how
    // they exist. Gating re-creation for everyone deletes them after one tick.
    // Measured when that was tried: magnesium's anticonvulsant read 0.000 for
    // an entire 25-minute eclampsia run and section 2h fell 30.33% -> 78.67%,
    // with albuterol, nitro, vasopressin and phenylephrine equally affected.
    // The scenario sweep did NOT catch it: it checks for impossible values, not
    // for a drug that has quietly stopped working.
    //
    // So the ledger applies only where instances have real kinetics to wash
    // out. Curve drugs keep the re-creating behaviour they depend on.
    if (!pat._dosesAdministered) pat._dosesAdministered = new Set();
    dosesFor(s, pat).forEach(d => {
      const def = DRUGS[d.id] || PROCS[d.id];
      const isPk = !!PK_PARAMS[d.id] && def?.pkModel !== "curve";
      const key = `${d.id}|${d.at}|${d.amount ?? ""}`;
      const exists = isPk
        ? pat._dosesAdministered.has(key)
        : pat.drugInstances.find(dr => dr.id === d.id && Math.abs(dr.time - d.at) < 0.01);
      if (!exists) {
        if (isPk) pat._dosesAdministered.add(key);
        const drugDef = DRUGS[d.id] || PROCS[d.id];
        if (drugDef) {
          const bioavailability = drugDef.bioavailability ?? 1;
          const dose = d.amount ?? drugDef.dose ?? 1; // FIX: scenario‑provided dose
          pat.drugInstances.push(new DrugInstance(d.id, dose, d.at, bioavailability));
        }
      }
    });

    // ---- ANTAGONIST PRE-PASS ------------------------------------------------
    // Receptor ANTAGONISTS must be resolved BEFORE the agonists they block are
    // applied, because the agonist's effect is scaled by (1 - blockade). The
    // main loop below walks pat.drugInstances in the order doses were given, and
    // pat.opioidBlockade is reset to 0 at the top of this function — so an
    // opioid given BEFORE naloxone had its effects computed while the blockade
    // was still 0, and naloxone reversed nothing at all. That is every
    // clinically real case: the opioid always comes first.
    //
    // Measured before the fix: three morphine doses gave respiratory drive
    // suppression 0.154; naloxone drove opioidBlockade to 0.72 and suppression
    // stayed at 0.154, unchanged, for ninety minutes.
    //
    // The wiring suite did not catch this because its assertion checked that the
    // blockade ACCUMULATOR moved, not that the blockade DID anything — the exact
    // mistake that suite exists to prevent, made inside the suite itself. A
    // reversal assertion is added alongside it.
    for (const dr of pat.drugInstances) {
      // Matches all three route-specific ids (naloxone_in/im/iv, drugs.js) —
      // was a literal `!== "naloxone"` check against an id that no longer
      // exists in DRUGS, so this never matched any route. See the PK_PARAMS
      // comment above for the full trace.
      if (!dr.id.startsWith("naloxone")) continue;
      const def = dr.drugDef;
      if (!def) continue;
      if (dr.pk) {
        // Effect-site concentration carried from the previous step, which is
        // what the antagonist concentration actually is at the start of this one.
        pat.opioidAntagonistConc += Math.max(0, dr.effectConc || 0);
      } else {
        // Curve-model fallback: express the curve as a notional concentration
        // at the antagonist's own Ki so the same competitive maths applies.
        const k = curve(s.t - dr.time, def.onset || 30, def.dur || 600);
        if (k > 0) pat.opioidAntagonistConc += k * NALOXONE_KI * 20;
      }
    }

    // TOTAL EFFECT-SITE CONCENTRATION PER DRUG, summed across every instance.
    // Repeat doses are modelled as SEPARATE DrugInstance objects, each with its
    // own compartments, so no instance ever knows what else is on board. Any
    // threshold effect — toxicity above all — has to be evaluated against the
    // total body burden, not against one bolus in isolation. Measured before
    // this: four stacked lidocaine doses reached 35 mg/L in aggregate, more than
    // twice the cardiotoxic threshold, while every individual instance sat at
    // 8.88 and nothing fired.
    //
    // KNOWN LIMITATION, NOT FIXED HERE: the same per-instance structure means
    // each instance also computes its own Emax intensity and the effects are
    // summed. For a saturating dose-response that is wrong in the other
    // direction — two half-doses produce MORE effect than one full dose, because
    // 0.5 + 0.5 exceeds what the curve gives at double the concentration. Fixing
    // that properly means computing intensity once per drug from the summed
    // concentration, which changes every drug's behaviour and needs its own
    // batch.
    const totalConcByDrug = {};
    for (const dr of pat.drugInstances) {
      if (!dr.pk) continue;
      totalConcByDrug[dr.id] = (totalConcByDrug[dr.id] || 0) + Math.max(0, dr.effectConc || 0);
    }

    // RECEPTOR DESENSITIZATION / ACUTE WITHIN-ENCOUNTER TOLERANCE (queue
    // item 45b). Real, sustained/repeated receptor agonism produces
    // measurable tolerance within a single encounter via phosphorylation/
    // internalization -- documented for benzodiazepines in status
    // epilepticus (repeated doses show genuinely diminishing seizure
    // suppression, the actual, real clinical reason guidelines escalate to
    // a second-line agent rather than a third benzo dose -- this game's own
    // anticonvulsant mechanism, above, had no way to represent that until
    // now), for opioids under sustained/repeat dosing (acute opioid
    // tolerance, well described in the anesthesia/critical-care
    // literature), and for inhaled beta-2 agonists under frequent
    // nebulized dosing (tachyphylaxis with repeated albuterol in status
    // asthmaticus). Modeled as a first-order relaxation toward a
    // class-specific ceiling while the receptor is actively occupied,
    // decaying back toward zero once dosing stops -- real receptor
    // resensitization, not a permanent change. Computed ONCE per tick here
    // (not per drug instance, so a drug's own effect isn't scaled by a
    // value it is simultaneously still updating) and only READ by the
    // per-instance loop below.
    //
    // Ceilings/taus are order-of-magnitude estimates from the general
    // tachyphylaxis literature, stated honestly rather than fitted to one
    // cited number, matching this project's own "identify a real range, do
    // not invent one" discipline. Benzo tolerance is set both faster and
    // deeper than opioid/beta2 because it is the most clinically prominent
    // of the three in this game's own status-epilepticus mechanic.
    const DESENS_PARAMS = {
      gabaDesens: { ceiling: 0.5, rate: 0.05 },     // tau ~20 min
      opioidDesens: { ceiling: 0.3, rate: 0.0222 }, // tau ~45 min
      beta2Desens: { ceiling: 0.35, rate: 0.0333 }, // tau ~30 min
    };
    const desensClassOf = (dd) =>
      dd.class === "opioid" ? "opioidDesens"
      : dd.class === "benzodiazepine" ? "gabaDesens"
      : (dd.receptors && dd.receptors.beta2) ? "beta2Desens" : null;
    const desensExposed = { opioidDesens: false, gabaDesens: false, beta2Desens: false };
    for (const dr of pat.drugInstances) {
      const dd = dr.drugDef;
      if (!dd) continue;
      const cls = desensClassOf(dd);
      if (!cls || desensExposed[cls]) continue;
      if (dr.pk) {
        // Exposure must be judged on receptor OCCUPANCY (the same
        // Emax-normalized 0-1 intensity every consumer downstream reads),
        // not raw concentration -- different drugs' concentrations live on
        // wildly different absolute scales (fentanyl's own therapeutic
        // central concentration is ~0.004 mg/L against an ec50 of 0.0012,
        // both far below a flat concentration cutoff that would work for a
        // benzodiazepine at ec50 0.1). A first version used a flat 0.01 mg/L
        // cutoff and measured, directly, that it silently never fired for
        // fentanyl at all despite real, substantial occupancy -- caught by
        // instrumenting the real engine (lesson 8) before trusting it.
        const totalC = totalConcByDrug[dr.id] ?? 0;
        const ec50 = dr.pk.ec50 ?? 0.1;
        const occ = totalC / (ec50 + totalC);
        if (occ > 0.05) desensExposed[cls] = true;
      } else if (s.t - dr.time < (dd.dur || 600)) {
        desensExposed[cls] = true;
      }
    }
    for (const cls of Object.keys(DESENS_PARAMS)) {
      const { ceiling, rate } = DESENS_PARAMS[cls];
      const target = desensExposed[cls] ? ceiling : 0;
      pat[cls] = (pat[cls] ?? 0) + (target - (pat[cls] ?? 0)) * rate * dt;
    }

    const toKeep = [];
    const effectsApplied = new Set();
    for (let dr of pat.drugInstances) {
      const drugDef = dr.drugDef;
      if (!drugDef) continue;

      let intensity = 0;

      // Local airway depot clears by mucociliary transport and local metabolism,
      // independently of whichever systemic kinetic model the drug uses.
      if (dr.airwayDose > 0) dr.airwayDose *= Math.exp(-dr.airwayKel * dt);

      if (dr.pk) {
        // PK drug: integrate compartments
        advancePkCompartments(dr, dt, pat);
        // Drug‑specific EC50
        const ec50 = dr.pk.ec50 ?? 0.1;
        // COMPETITIVE ANTAGONISM (Gaddum / Schild).
        // Naloxone does not switch an opioid off by some fraction; it competes
        // for the same receptor, which SHIFTS THE AGONIST'S DOSE-RESPONSE CURVE
        // TO THE RIGHT by a factor of (1 + [antagonist]/Ki) without lowering its
        // maximum. Modelling it as a simple (1 - blockade) multiplier could not
        // express the two facts that matter most at the roadside:
        //   * reversal depends on the RATIO at the receptor, so a large opioid
        //     load needs more naloxone than a small one — titration is real;
        //   * as naloxone is eliminated the ratio swings back and the patient
        //     RE-NARCOTISES on his own, which is why these patients are
        //     transported rather than released. Previously the blockade decayed
        //     as an independent accumulator and re-narcotisation took hours.
        let ec50Eff = ec50;
        if (drugDef.class === "opioid" && pat.opioidAntagonistConc > 0) {
          ec50Eff = ec50 * (1 + pat.opioidAntagonistConc / NALOXONE_KI);
        }
        // EMAX IS SATURATING, SO IT MUST BE COMPUTED ONCE FROM THE TOTAL
        // CONCENTRATION — NOT PER INSTANCE AND SUMMED.
        // Repeat doses are separate DrugInstance objects. Each used to compute
        // its own intensity from its own concentration, and the effects were
        // then added together, which inverts the entire point of a saturating
        // dose-response: two half-doses gave 0.5 + 0.5 = 1.0 where the curve at
        // double the concentration gives about 0.67. The model therefore
        // rewarded splitting a dose, and a stacked overdose produced an effect
        // that could exceed the drug's own maximum.
        const totalC = totalConcByDrug[dr.id] ?? dr.effectConc;
        intensity = totalC / (ec50Eff + totalC);
        if (ec50Eff !== ec50) {
          // Reported for the monitor and the wiring suite: how much of this
          // opioid's effect the antagonist is currently removing. Derived, not
          // accumulated — it cannot latch, because it is recomputed from the two
          // concentrations every step.
          const unblocked = totalC / (ec50 + totalC);
          if (unblocked > 0) {
            pat.opioidBlockade = Math.max(pat.opioidBlockade, 1 - intensity / unblocked);
          }
        }
        if (dr.central < 0.001 && dr.peripheral < 0.001 && (dr.depot || 0) < 0.001 && (dr.airwayDose || 0) < 0.001 && (dr.deepDepot || 0) < 0.001) continue;
        toKeep.push(dr);
        // The intensity above is the whole drug's, so the drug's effects are
        // applied ONCE however many instances carry it. The remaining instances
        // have already had their compartments integrated, which is the only
        // thing they are individually responsible for.
        if (effectsApplied.has(dr.id)) continue;
        effectsApplied.add(dr.id);
      } else {
        // Non‑PK drug: classic curve.
        //
        // ORGAN-DEPENDENT CLEARANCE FOR CURVE DRUGS — RESOLVED, queue item 11.
        // Curve drugs had no clearance or organ-dysfunction sensitivity at
        // all: PK-model drugs already scale kel by organClearanceFactor
        // (above), but a curve drug's `dur` was a flat constant regardless of
        // hepatic/renal function. Fixed the way the item's own note
        // prescribed — scale the declared duration by the SAME
        // organClearanceFactor() PK drugs already use, no new coefficients —
        // with the two open design questions it flagged now settled:
        //
        // (a) "normalize against resting clearance so it's genuinely unity at
        // baseline" — ALREADY TRUE of organClearanceFactor as written, not a
        // gap to close: flow = clamp(co/restCo, 0.15, 1) reads exactly 1 at
        // or above the patient's own resting output, hepatocyte reads 1 with
        // no liver injury, and renal reads exactly 1 from renal.js at a
        // healthy resting perfusion pressure — so a healthy patient at or
        // above rest gets oc=1.0 and effDur equals the declared dur exactly,
        // confirmed by direct measurement before this was wired in.
        //
        // (b) "should a drug slow its own clearance via its CO effect" — YES,
        // deliberately: reduced hepatic blood flow genuinely slows hepatic
        // drug elimination (a real, documented phenomenon, e.g. in
        // cardiogenic shock), and the feedback loop this creates (more drug
        // -> lower CO -> slower clearance -> more drug on board) is ALREADY
        // bounded by organClearanceFactor's own existing floors (flow >=0.15,
        // hepatic >=0.05, renal >=0.05) — the function was never unbounded,
        // it just had no curve-drug consumer yet. Divided here (not
        // multiplied by the floored oc directly) so a MISSING renalFrac
        // — every curve drug today — falls back to the function's own
        // built-in 0.3 default rather than requiring a newly-authored
        // per-drug coefficient, and the divisor itself carries a 0.1 floor
        // (a 10x maximum duration multiplier) as a second, explicit numerical
        // safety bound on top of organClearanceFactor's own.
        //
        // DELIBERATELY NOT extended to: the rising()-tracked blood/temp/k fx
        // props, or the glucose/calcium/magnesium delivery-timing curve
        // trackers elsewhere in this loop. Those represent DELIVERY timing
        // for a physiological pool, not pharmacologic elimination — calcium
        // and magnesium already have their own SEPARATE, real clearance
        // mechanisms (the exponential pool-decay terms above, magnesium's
        // scaled by renal function already), and fluids/glucose are not
        // hepatically/renally "cleared" the way a drug is. Extending organ
        // clearance to those would be the wrong mechanism for what they
        // represent, not an oversight.
        const oc = organClearanceFactor(pat, drugDef.renalFrac);
        pat._organClearance = oc;   // exposed for the wiring suite, same as the PK branch above
        const effDur = (drugDef.dur || 600) / Math.max(0.1, oc);
        const k = curve(s.t - dr.time, drugDef.onset || 30, effDur);
        if (k <= 0) continue;
        intensity = k;
        toKeep.push(dr);
      }

      // Apply the within-encounter receptor desensitization computed once,
      // above, for the whole tick -- a real, if modest, reduction in this
      // dose's own effect for repeated/sustained same-class dosing, not a
      // scripted penalty. Deliberately scales `intensity` itself (not one
      // downstream consumer) since real receptor desensitization reduces
      // the drug's potency at its target broadly, not one specific effect
      // of it.
      {
        const desensCls = desensClassOf(drugDef);
        if (desensCls) intensity *= (1 - (pat[desensCls] || 0));
      }

      // ----- Apply fx – with receptor model check -----
      const hasReceptorModel = !!drugDef.receptors;
      if (drugDef.fx) {
        Object.entries(drugDef.fx).forEach(([prop, val]) => {
          // Skip HR/SBP if receptor model is active (avoids double‑counting)
          if (hasReceptorModel && (prop === "hr" || prop === "sbp")) return;

          let delta = val * intensity;

          // Opioid blockade: reduce effects of opioid drugs
          // PK opioids already have the antagonist folded into their intensity
          // via the competitive EC50 shift above; multiplying again would count
          // the reversal twice. Curve-model opioids have no concentration, so
          // they keep the multiplier.
          if (drugDef.class === "opioid" && !dr.pk) {
            delta *= (1 - pat.opioidBlockade);
          }

          // FLUID/TEMP/K RATCHET — found while building pericardialTamponade
          // (physiology queue item 7), same defect shape as item 25's glucose
          // ratchet, in the same per-tick fx loop: `pat.X += delta` ran EVERY
          // TICK the dose's curve stayed active, not once. Unlike glu, this
          // one was silent for a much larger blast radius before it was
          // caught — whole blood/plasma declare `dur:9999` (~166 minutes),
          // so any transfusion given in a trauma scenario (abdGSW,
          // polytraumaFall, motorcycle...) ratcheted totalBloodVol for
          // effectively the rest of the call. MEASURED pre-fix: one 500 mL
          // saline bolus (fx.blood 0.4) during pericardialTamponade drove
          // totalBloodVol from 5.07 L to 34.87 L over three simulated
          // minutes, which flooded venous return/CVP and pushed MAP to a
          // physiologically meaningless 262 mmHg — not a tamponade defect at
          // all, a pre-existing one this new condition happened to be the
          // first to exercise a sustained post-bolus window against.
          //
          // Fixed on magnesium's pattern (`drugDef.serumMg`, below), not
          // calcium's: deliver the UNSCALED fx value once, on the curve's
          // rising edge, tracked per dose instance and per prop (a dose can
          // carry blood AND temp AND k in the same fx block, each needing
          // its own curve tracker) so two stacked doses still deliver two
          // loads. `ph`/`hco3`/`coag` are NOT included — those write through
          // a clamp at the same site (Math.min/max), so a ratchet there hits
          // its own ceiling/floor and stays, which cannot run away the way
          // an unbounded `+=` can; left alone rather than churned for no
          // behavioural change.
          const rising = (curveKey) => {
            const k = curve(s.t - dr.time, drugDef.onset || 30, drugDef.dur || 600);
            const prev = dr[curveKey] ?? 0;
            const rise = Math.max(0, k - prev);
            dr[curveKey] = Math.max(prev, k);
            return rise;
          };

          if (prop === "hr") pat.drugHr += delta;
          else if (prop === "sbp") pat.drugSbp += delta;
          else if (prop === "rr") pat.drugRr += delta;
          else if (prop === "fio2") pat.drugFio2 = Math.max(pat.drugFio2, 0.21 + (val - 0.21) * intensity);
          else if (prop === "pain") pat.drugPain += delta;
          else if (prop === "blood") {
            const bloodDelta = val * rising("_bloodCurve");
            pat.totalBloodVol += bloodDelta;
            if (drugDef.id === "blood" || drugDef.id === "wholeBlood") {
              const rbcAdded = bloodDelta * HCT_NORMAL;
              pat.rbcVol += rbcAdded;
              pat.rbcMass += rbcAdded * NORMAL_HB * 10 / HCT_NORMAL;
              pat.plasmaVol += bloodDelta - rbcAdded;
            } else {
              pat.plasmaVol += bloodDelta;
            }
            // Re‑balance unstressed/stressed volumes after fluid bolus
            pat.unstressedVol = 0.35 * pat.totalBloodVol;
            pat.stressedVol = pat.totalBloodVol - pat.unstressedVol;
          }
          else if (prop === "ph") {
            // Do NOT change pH directly, and (queue item 44) do not change
            // hco3 directly either — hco3 is now a DERIVED quantity
            // (acidbase.js). A drug's declared fx.ph is a real strong-ion
            // input this engine doesn't itemize further (whole blood/
            // plasma's own citrate-buffer chemistry, saline's own
            // hyperchloraemic effect, mostly) — the correct lever is
            // pat.sidAdjust.
            //
            // RATCHET FOUND AND FIXED (a real, currently-live, previously
            // undocumented instance of the exact defect class item 25's
            // glucose ratchet and the blood/temp/k fix above already
            // caught): the comment this replaced claimed hco3's own
            // downstream [5,50] clamp (acidbase.js) made this "cannot run
            // away any more than the original could" — that reasoning is
            // FALSE. The clamp bounds the DERIVED hco3 display value, not
            // pat.sidAdjust itself, which this line was accumulating EVERY
            // TICK the dose's curve stayed elevated (delta = val*intensity,
            // recomputed fresh each tick, not delivered once). For a
            // pkModel:"fluid"/"curve" drug, intensity is the curve()
            // function, which sits at exactly 1.0 for the drug's entire
            // declared `dur` (saline: 5400s / 90 min) — so a SINGLE 500 mL
            // saline bolus was adding sidAdjust -35/tick (delta/10, at
            // full intensity) for the next 90 minutes of sim time.
            // MEASURED, directly, before trusting this diagnosis (lesson
            // 8): sidAdjust reached -3692 within 3.5 minutes of one bolus
            // (throwaway probe, abdPain control, no bleeding, no other
            // condition), pH crashed to 6.82 within the first minute and
            // stayed there, and rhythmInstability climbed steadily toward
            // a lethal rhythm from the resulting acidemia alone — a
            // condition-less control patient given ordinary IV fluid was
            // heading for cardiac arrest. This reaches every scenario in
            // the game through the single most commonly given drug in the
            // formulary; it was invisible to both suites because
            // scenarioSweep.mjs never gives any doses at all (confirmed by
            // grep before concluding this), and no mechanismWiring.mjs
            // assertion happened to run a saline-treated probe long enough
            // (or read sidAdjust/factorII afterward) to notice.
            //
            // Fixed the same way blood/temp/k were: delivered on the
            // curve's RISING edge only, tracked per dose instance, so the
            // dose's declared value lands exactly once (over the onset
            // ramp) rather than every tick for the whole duration —
            // whole blood/plasma's positive ph value (citrate buffer,
            // real net alkalinising effect) and the thrombolytic's own
            // persistent (`dur:9999`) shunt/coag effects below all share
            // this identical "one-time quantity, not a per-tick rate" shape.
            pat.sidAdjust = (pat.sidAdjust || 0) + val * rising("_phCurve") / 10;
          }
          else if (prop === "coag") {
            // SAME RATCHET, same fix — see the "ph" case immediately above
            // for the full trace. MEASURED: pat.factorII/V/VII/X crashed
            // from ~100 to ~0 within 60 seconds of a single saline bolus
            // (coag:-6), silently annihilating clotting-factor activity
            // for the rest of any call a fluid bolus was given in — the
            // Math.min/max clamp at this site only bounds the FLOOR (0),
            // it does not stop the per-tick reapplication from reaching
            // that floor almost instantly. This directly fed
            // coagulation.js's own thrombin/clotStrength product
            // (factorII * factorV * factorX / ...), so any bleeding
            // patient given fluids saw their hemorrhage rate divided by
            // clotStrength's own 0.1 floor (a 10x acceleration) far sooner
            // and far more severely than the intended, gradual dilutional-
            // coagulopathy mechanism this file's own history already
            // documents as real but modest.
            const factorDelta = val * rising("_coagCurve");
            pat.factorII  = Math.max(0, Math.min(150, pat.factorII + factorDelta));
            pat.factorV   = Math.max(0, Math.min(150, pat.factorV + factorDelta));
            pat.factorVII = Math.max(0, Math.min(150, pat.factorVII + factorDelta));
            pat.factorX   = Math.max(0, Math.min(150, pat.factorX + factorDelta));
          }
          else if (prop === "temp") pat.coreTemp += val * rising("_tempCurve");
          else if (prop === "k") {
            // Direct K changes → store as transcellular shift (slow kinetics)
            pat.transcellularKShift += val * rising("_kShiftCurve");
          }
          else if (prop === "kShift") {
            pat.transcellularKShift += val * rising("_kShiftCurve");
          }
          else if (prop === "hco3") {
            // Queue item 44: a drug's declared fx.hco3 (sodium bicarbonate
            // treatment — see drugs.js) delivers Na+ with no matching Cl-,
            // which is functionally a strong-ion-difference input, not a
            // free hco3 write. pat.sidAdjust (acidbase.js) is the real
            // lever. SAME ratchet, same fix as "ph"/"coag" above — was
            // `delta` (recomputed every tick at full intensity for the
            // drug's whole declared duration), now delivered once on the
            // curve's rising edge, matching every other one-time-quantity
            // prop in this loop.
            pat.sidAdjust = (pat.sidAdjust || 0) + val * rising("_hco3Curve");
          }
          else if (prop === "bronch") pat.broncho = Math.max(0, Math.min(1, pat.broncho + val * rising("_bronchCurve")));
          else if (prop === "edema")  pat.edema = Math.max(0, Math.min(1, pat.edema + val * rising("_edemaCurve")));
          // Isolated urticaria/pruritus (queue item 58) — SAME rising()-curve
          // idiom bronch/edema above already use, so a diphenhydramine dose's
          // onset/offset is a real pharmacokinetic curve, not an instant step.
          else if (prop === "urticaria") pat.urticaria = Math.max(0, Math.min(1, (pat.urticaria || 0) + val * rising("_urticariaCurve")));
          // Angioedema (queue item 61) — SAME rising()-curve idiom as
          // bronch/edema/urticaria above, so IM epinephrine's reduction of
          // airway swelling is a real pharmacokinetic curve, not an instant
          // step.
          else if (prop === "angioedema") pat.angioedema = Math.max(0, Math.min(1, (pat.angioedema || 0) + val * rising("_angioedemaCurve")));
          // Acute dystonic reaction (queue item 66) — SAME rising()-curve
          // idiom as bronch/edema/urticaria/angioedema above, so diphenhydramine's
          // real anticholinergic reversal of drug-induced dystonia (and
          // metoclopramide's own capacity to precipitate/worsen it) are both
          // real pharmacokinetic curves, not instant steps.
          else if (prop === "dystonia") pat.dystonia = Math.max(0, Math.min(1, (pat.dystonia || 0) + val * rising("_dystoniaCurve")));
          // Upper airway obstruction (queue item 60's nebulized-epi slice) —
          // SAME rising()-curve idiom bronch/edema/urticaria/angioedema above
          // already use. Deliberately distinct from the angioedema branch:
          // this is nebulized epi's LOCAL alpha-1 mucosal vasoconstriction
          // acting directly on the swollen mucosa (croup/epiglottitis's own
          // structural narrowing, and any comorbid angioedema contribution),
          // not IM/auto-injector epi's SYSTEMIC route reducing angioedema
          // upstream, which only then derives upperAirwayObstruction from it.
          // No 0-1 clamp on the ceiling side — this field has no fixed upper
          // bound (epiglottitis alone ratchets it up to 2.0), unlike the
          // other rising()-curve props above, so only a floor of 0 applies.
          else if (prop === "upperAirwayObstruction") pat.upperAirwayObstruction = Math.max(0, (pat.upperAirwayObstruction || 0) + val * rising("_uaoCurve"));
          else if (prop === "shunt")  pat.shuntFraction += val * rising("_shuntCurve");
          else if (prop === "glu") {
            // GLUCOSE IS A DOSE, NOT AN INFUSION RATE — physiology queue item
            // 25. This was `pat.glucose += delta` every tick the curve was
            // active (most of the drug's declared duration, not just its
            // onset), with no ceiling and no decay: MEASURED, one d10 push
            // climbed glucose from 98 to 1078 mg/dL over 15 simulated
            // minutes. Identical ratchet shape to the `pat.ca` defect fixed
            // two cases below — found the same way, by instrumenting rather
            // than guessing.
            //
            // Fixed on magnesium's pattern (`drugDef.serumMg`, below in this
            // function), not calcium's: magnesium delivers its declared total
            // load exactly once by multiplying the UNSCALED fx value by the
            // rise in the curve (`val * rise`, summing to `val` as k goes 0
            // to 1 regardless of the curve's shape). Calcium instead
            // multiplies the already-intensity-scaled `delta` by its own
            // rise (`delta * riseCa`, i.e. `val * k * riseCa`), which
            // integrates to only `val/2` — undershooting its own declared
            // fx value. That may be worth revisiting on its own, but this
            // fix deliberately does not import it: `val` is the number
            // authored in drugs.js (d10 70, oralGlucose 40, glucagon 50) and
            // should land at that value, not half of it.
            //
            // No separate clearance term: real insulin-driven glucose
            // disposal is slower than a ~20-minute call, so a delivered dose
            // correctly holds in the pool rather than decaying away before
            // the call ends. If a future batch needs multi-hour glucose
            // behavior (a DKA/HHS condition, say), clearance belongs there,
            // named explicitly, not folded into this delivery fix.
            const kGlu = curve(s.t - dr.time, drugDef.onset || 30, drugDef.dur || 600);
            const prevGlu = dr._gluCurve ?? 0;
            const riseGlu = Math.max(0, kGlu - prevGlu);
            dr._gluCurve = Math.max(prevGlu, kGlu);
            pat.glucose = Math.max(0, pat.glucose + val * riseGlu);
          }
          else if (prop === "ca") {
            // IONISED CALCIUM IS A POOL, NOT A RATCHET. This used to be
            // `pat.ca += delta` every tick the curve was active, with no ceiling
            // and no decay, so a single 1 g push drove pat.ca to 27, then 57,
            // then unbounded (measured 177 mmol/L against a normal of 2.4). It
            // was invisible until the magnesium-toxicity limb made calcium an
            // antidote whose strength reads pat.ca — the same dead-limb class as
            // serum magnesium itself, found the same way.
            //
            // Delivered on the curve's RISING edge only, tracked per instance so
            // one dose is counted once (identical pattern to serumMg above), and
            // the pool is pulled back toward baseline by the tick decay added in
            // the reset block. A 1 g CaCl2 push (fx delta 0.5, max 2) therefore
            // raises ionised calcium by ~1 mmol/L and then clears, which is what
            // makes it a transient antidote rather than a permanent one.
            const kCa = curve(s.t - dr.time, drugDef.onset || 30, drugDef.dur || 600);
            const prevCa = dr._caCurve ?? 0;
            const riseCa = Math.max(0, kCa - prevCa);
            dr._caCurve = Math.max(prevCa, kCa);
            pat.ca = Math.max(0.5, pat.ca + delta * riseCa);
          }
          else if (prop === "bleed") {
            // No drug in the current formulary declares fx.bleed (grep-
            // confirmed; queue item 9 migrated the one former user,
            // uterineAtony's uterotonicDrive, onto a real receptor
            // mechanism) — wrapped in rising() anyway, for the same reason
            // and to the same one-time-quantity shape as every other prop
            // in this loop, so a future drug reusing this prop doesn't
            // reintroduce the per-tick ratchet class found and fixed above.
            pat.activeBleedRate = Math.max(0, pat.activeBleedRate + val * rising("_bleedCurve"));
          }
          else if (prop === "plasminActivity") {
            // NOT the same shape as ph/coag/hco3 above, despite sharing the
            // "ratchet" defect class — found and then RE-EXAMINED while
            // finishing the crashed session's own audit of this exact prop.
            // The crashed session's fix (rising()-tracked, one-time
            // delivery, identical to ph/coag/hco3) was the wrong pattern
            // for THIS field: ph/coag/hco3 represent a discrete DOSE (a
            // fluid bolus's dilution, a bicarb push's alkalinising load) —
            // a genuine one-time quantity. plasminActivity represents an
            // ONGOING PHARMACOLOGIC STATE — how strongly plasmin is
            // currently being driven — for as long as the drug remains
            // active, the same "recompute a floor/ceiling fresh from
            // current intensity" idiom `pat.drugFio2` already uses two
            // cases above (`Math.max(pat.drugFio2, ...)`), not a dose to
            // deliver once and let decay.
            //
            // MEASURED, and this is what exposed the mismatch: with the
            // one-time-delivery fix in place, mechanismWiring.mjs's own
            // "thrombolytic -> plasmin activity rises" assertion (requires
            // >=0.5 at 18 minutes post-dose) failed at 0.0523 — thrombolytic
            // fx.plasminActivity peaks near 1.0 during its 5-min onset ramp
            // then DECAYS, because coagulation.js's own endogenous
            // fibrinolysis-regulation term (updateCoagulation's
            // `plasminActivity += (plasminTarget - plasminActivity) *
            // min(1,dt*0.4)`, a real, correct mechanism for the body's OWN
            // plasmin regulation) treats a one-time delivered spike as a
            // transient perturbation and relaxes it back toward baseline
            // (~0.05 for a non-septic, non-hyperlactatemic patient) within
            // about 15-20 minutes — correctly, for an ENDOGENOUS process,
            // but wrongly here, because it cannot distinguish that from an
            // EXOGENOUS thrombolytic still pharmacologically active for its
            // whole declared `dur:9999`. Two further, real, downstream
            // consequences traced to this same root cause before trusting
            // it (lesson 8): "thrombolytic -> coronary stenosis falls" and
            // "...-> smaller infarct" both also failed, because
            // conditions.js's own reperfusion mechanism (acs's `progress()`)
            // gates entirely on `plasminActivity > 0.3` — once the spike
            // decayed below that threshold (well before this suite's own
            // 18-minute measurement point), the reperfusion term stopped
            // engaging for the rest of the window, on top of everything
            // downstream of it.
            //
            // Also matches the ALREADY-EXISTING drugs.js comment on
            // thrombolytic itself, which the crashed session's own fix
            // quoted but did not act on: "dur:9999, a deliberately
            // persistent effect" — the drug's own author intended plasmin
            // activation to persist for the length of the call, not for
            // one dose to spike-and-decay.
            //
            // Fixed as a held floor/ceiling, not an accumulator, so it
            // cannot diverge the way sidAdjust did (still no unbounded
            // `+=`): a positive val (thrombolytic, activating) floors
            // plasminActivity toward `val*intensity`, tracking intensity's
            // own onset ramp (so a fresh dose still ramps in over its
            // onset, not "clamped within a couple of ticks" — the crashed
            // session's original, correctly-motivated concern) and then
            // HOLDING there for as long as intensity stays high (the
            // drug's whole `dur`), overpowering coagulation.js's own decay
            // every tick rather than losing to it once. A negative val
            // (TXA, suppressing) is the mirror image — a ceiling toward
            // `1 + val*intensity` (TXA's own -0.5 caps plasminActivity at
            // or below 0.5 while active, rather than forcing it toward an
            // absolute zero regardless of a patient's own baseline —
            // matching how a receptor-style Emax ceiling already works for
            // every OTHER drug's declared coefficient in this file, not a
            // special case invented for this one).
            const target = Math.max(0, Math.min(1, val * intensity));
            pat.plasminActivity = val >= 0
              ? Math.max(pat.plasminActivity, target)
              : Math.min(pat.plasminActivity, Math.max(0, 1 + val * intensity));
          }
          else if (prop === "cytoBlock") {
            // Hydroxocobalamin's REAL antidote mechanism (queue item 7,
            // cyanidePoisoning): the cobalt ion in the molecule directly
            // binds/scavenges free cyanide ion, forming inert cyanocobalamin
            // (vitamin B12) that is renally excreted — a stoichiometric
            // chemical reaction consuming a bounded quantity of circulating
            // cyanide per dose, NOT an ongoing receptor-style suppression
            // (unlike hydroxo's OTHER, separate alpha-receptor pressor
            // effect above). That makes this the SAME shape as fx.bronch's
            // one-time, rising()-tracked delta (a bronchodilator dose lowers
            // airway resistance once per dose, not for as long as the drug's
            // concentration curve stays up) — not plasminActivity's
            // held-ceiling shape, which fits an ONGOING pharmacologic state.
            // pat.cytochromeBlock is condition-owned (conditions.js's
            // cyanidePoisoning SEEDS it once and thereafter only decays it,
            // and it is not a reset field pk.js zeroes elsewhere), so this
            // dose's one-time reduction is a simple additive delta on a
            // persistent pool, exactly like broncho/bronchodilator —
            // order-safe, no reset-trap. That the condition never RE-ASSERTS
            // its seeded value is what makes this reduction survive: a
            // condition holding the field at a constant every tick would
            // clobber this delta on the following tick, since progress() runs
            // before updateDrugs(). See that condition's own comment.
            pat.cytochromeBlock = Math.max(0, Math.min(1, (pat.cytochromeBlock ?? 0) + val * rising("_cytoBlockCurve")));
          }
          else if (prop === "tv") {
            // No drug in the current formulary declares fx.tv (grep-
            // confirmed; rocuronium's own comment above records that it
            // used to and was migrated onto the real neuromuscularBlock
            // Hill-equation mechanism instead) — left as a raw per-tick
            // delta deliberately, not wrapped in rising(): unlike every
            // other prop in this loop, a live paralytic's tvDrugOffset is
            // a CURRENT STATE (how paralyzed the patient is right now),
            // not an accumulating one-time quantity, so re-deriving it
            // every tick from current concentration would be the correct
            // shape if this prop is ever reused, not a bug to fix blind.
            pat.tvDrugOffset += delta; // e.g., -1 = paralysis
          }
        });
      }

      // ----- Systemic toxicity at supratherapeutic concentration -----
      // Keyed to CONCENTRATION, not to dose or to a counter of how many times a
      // button was pressed, so it arrives by any route that raises the level:
      // an over-large bolus, stacked repeat doses, or — the one that catches
      // people — an ordinary dose in a patient whose clearance has collapsed
      // with their cardiac output.
      if (drugDef.toxicity && dr.pk) {
        const C = totalConcByDrug[dr.id] ?? Math.max(0, dr.effectConc || 0);
        const tox = drugDef.toxicity;
        if (tox.seizureThreshold && C > tox.seizureThreshold) {
          // Graded, not a switch: the probability of frank seizure activity
          // climbs with the excess above threshold.
          const excess = (C - tox.seizureThreshold) / tox.seizureThreshold;
          pat.seizureDrive = Math.max(pat.seizureDrive || 0, Math.min(1, excess * 1.5));
        }
        if (tox.cardiacThreshold && C > tox.cardiacThreshold) {
          // Above the cardiac threshold sodium-channel blockade stops being
          // therapeutic and becomes myocardial depression and conduction block —
          // the same molecular action, no longer selective for diseased tissue.
          const excess = Math.min(1, (C - tox.cardiacThreshold) / tox.cardiacThreshold);
          // Coefficients raised from 0.6/0.5 after the Emax fix. Previously this
          // block ran ONCE PER INSTANCE, so a three-dose load applied the
          // depression three times and compounded it; the apparent severity was
          // an artifact of the same per-instance bug. Applied once, the original
          // coefficients left a 26 mg/L load with inotropy at 0.71, which is far
          // too gentle for a concentration that causes cardiovascular collapse.
          pat.drugInotropy = (pat.drugInotropy ?? 1) * (1 - 0.85 * excess);
          pat.avSlowingDrug = Math.min(1, (pat.avSlowingDrug || 0) + 0.8 * excess);
        }
      }

      // ----- Antiarrhythmic channel blockade -----
      if (drugDef.antiarrhythmic) {
        const aa = drugDef.antiarrhythmic;
        const eff = intensity;
        if (aa.sodiumBlock) {
          const contribution = aa.sodiumBlock * eff;
          pat.sodiumChannelBlock = Math.min(1, pat.sodiumChannelBlock + contribution);
          if (aa.ischemiaSelective) pat.sodiumBlockIschemiaSelective = true;
        }
        if (aa.potassiumBlock) {
          pat.potassiumChannelBlock = Math.min(1, pat.potassiumChannelBlock + aa.potassiumBlock * eff);
        }
        if (aa.avSlowing) {
          pat.avSlowingDrug = Math.min(1, pat.avSlowingDrug + aa.avSlowing * eff);
        }
      }

      // ----- Direct myocardial depression -----
      // Unmasked when the indirect sympathetic support is absent. Declared
      // separately from the receptor block because it is a different action on a
      // different target: a direct negative inotropic effect on the myocyte.
      if (drugDef.myocardialDepression) {
        pat.drugInotropy = (pat.drugInotropy ?? 1) *
          (1 - drugDef.myocardialDepression * intensity);
      }

      // ----- Neuromuscular blockade (steep concentration-effect) -----
      if (drugDef.neuromuscularBlock && dr.pk) {
        const nmb = drugDef.neuromuscularBlock;
        const C = Math.max(0, dr.effectConc || 0);
        const n = nmb.hill ?? 4.5;
        const e50 = nmb.ec50 ?? 1;
        const occ = Math.pow(C, n) / (Math.pow(e50, n) + Math.pow(C, n));
        pat.neuromuscularBlock = Math.max(pat.neuromuscularBlock, occ);
      }

      // ----- Respiratory drive suppression (mechanism, not a stat change) -----
      if (drugDef.respiratoryDepression) {
        // Scale by the drug's current effect intensity, and let naloxone reverse
        // it for opioids exactly as it reverses their other actions.
        let supp = drugDef.respiratoryDepression * intensity;
        if (drugDef.class === "opioid" && !dr.pk) supp *= (1 - pat.opioidBlockade);
        pat.respDriveSuppression = Math.min(0.95, pat.respDriveSuppression + supp);
      }

      // ----- Anticonvulsant action (mechanism, not a stat change) -----
      // A benzodiazepine does not "stop the seizure" as an event; it raises the
      // seizure threshold via GABA-A, so it suppresses the DRIVE and the seizure
      // stops only if the suppressed drive falls below what sustains it. That
      // distinction is the whole clinical picture of status epilepticus: midazolam
      // aborts a seizure whose cause has passed, and buys time without ending one
      // whose cause is still present. A hypoglycemic seizure recurs as the drug
      // wears off unless the glucose is actually corrected — which is exactly the
      // teaching point, and it now emerges rather than being scripted.
      // SERUM MAGNESIUM DELIVERY — additive into the persistent pool, per dose.
      //
      // Each magnesium dose delivers a fixed total load (serumMg mmol/L worth of
      // rise at an equilibrated single dose) into the pool, and the pool clears
      // renally at the top of this function. The delivery is tracked PER
      // INSTANCE so a dose is counted exactly once as its curve rises: the curve
      // climbs 0 -> 1 over the onset, and the increment in that curve since last
      // tick is the fraction of this dose's load delivered this tick. Two doses
      // therefore deliver two loads and the pool sums them, which is the whole
      // point of item 1 — the old `Math.max(pat.mg, base + serumMg*intensity)`
      // took the single strongest dose and pinned stacked loads at one dose's
      // ceiling.
      //
      // Note this runs PER INSTANCE, before the `effectsApplied` dedup below —
      // it is deliberately outside that guard, because unlike a saturating
      // receptor effect, delivered mass genuinely IS additive across instances.
      // A single 4 g load still equilibrates to base + 1.3 = ~2.3; the
      // difference is only visible when more than one dose is on board.
      if (drugDef.serumMg) {
        const k = curve(s.t - dr.time, drugDef.onset || 30, drugDef.dur || 600);
        const prev = dr._mgCurve ?? 0;
        // Only the RISING edge delivers. On the curve's tail k falls, but the
        // magnesium already in the pool does not un-deliver — it clears renally
        // instead, which is handled at the top of the function. So a decrease in
        // k contributes nothing here.
        const rise = Math.max(0, k - prev);
        dr._mgCurve = Math.max(prev, k);
        pat.mg = (pat.mg ?? (pat._mgBase ?? 1.0)) + drugDef.serumMg * rise;
      }
      if (drugDef.anticonvulsant) {
        pat.anticonvulsant = Math.min(0.98,
          pat.anticonvulsant + drugDef.anticonvulsant * intensity);
      }
      if (drugDef.sedative) {
        pat.sedationDepth = Math.min(1, pat.sedationDepth + drugDef.sedative * intensity);
      }
      // QUEUE ITEM 52. Same idiom as sedative immediately above, a separate
      // accumulator so the two calming pathways compose additively rather
      // than one silently standing in for the other (see neuro.js's
      // updateCerebral, where both feed the same agitation-lowering term).
      if (drugDef.antipsychotic) {
        pat.antipsychoticEffect = Math.min(1, pat.antipsychoticEffect + drugDef.antipsychotic * intensity);
      }
      // CAUSE-SELECTIVE suppression. Some anticonvulsants are not general: they
      // act on one mechanism of seizure and are poor or useless against others.
      // A single generic handle made every such drug a broad-spectrum
      // anticonvulsant, which is wrong in a way that teaches the wrong drug
      // choice — see the eclamptic term in neuro.js.
      if (drugDef.anticonvulsantEclamptic) {
        pat.anticonvulsantEclamptic = Math.min(0.98,
          (pat.anticonvulsantEclamptic || 0) + drugDef.anticonvulsantEclamptic * intensity);
      }

      // ----- Receptor effects (applied after fx, so no double‑counting) -----
      if (drugDef.receptors) {
        const rec = drugDef.receptors;
        // recIntensity used to branch on a `useReceptors` flag (PK vs curve
        // drug) that turned out to always resolve to the same value on both
        // sides — removed rather than left as a dead conditional (was: `const
        // recIntensity = useReceptors ? intensity : intensity`).
        const recIntensity = intensity;

        // An INDIRECT sympathomimetic acts through the patient's own stores, so
        // its adrenergic effect is proportional to what is left in them.
        const indirect = drugDef.indirectSympathomimetic
          ? Math.max(0, Math.min(1, pat.adrenalReserve ?? 1))
          : 1;
        alphaDrug  += (rec.alpha  || 0) * recIntensity * indirect;
        beta1Drug  += (rec.beta1  || 0) * recIntensity * indirect;
        beta2Drug  += (rec.beta2  || 0) * recIntensity;
        if (dr.inhaled && dr.airwayDose > 0) {
          // Airway deposition is impaired when the airway is obstructed — a
          // severely bronchospastic patient cannot get the drug to the distal
          // airways, which is exactly why nebulised therapy works less well the
          // more it is needed.
          const obstruction = Math.max(0, Math.min(1, pat.effectiveBroncho ?? pat.broncho ?? 0));
          const deposition = 1 - 0.5 * obstruction;
          beta2Airway += (rec.beta2 || 0) * (dr.airwayDose / (dr.drugDef?.dose || 1)) * deposition;
        }

        // Vagal block (atropine)
        if (rec.vagalBlock) {
          pat.vagalBlock += rec.vagalBlock * recIntensity;
        }
        // Venodilation (nitroglycerin)
        if (rec.venodilation) {
          pat.venousToneModifier -= rec.venodilation * 0.3 * recIntensity;
          // Venodilation IS an increase in venous capacitance, so it must drive
          // the same general mechanism the closed loop reads (see
          // venousCapacitanceFactor in cardiovascular.js). Previously it moved
          // only venousToneModifier, which feeds the legacy stressed-volume path
          // alone — so nitroglycerin's defining action never reached the
          // authoritative solver: measured mean systemic filling pressure did not
          // move at all after a nitro dose, and cardiac output actually ROSE
          // because only the arteriolar component was being felt. Routing it here
          // makes preload genuinely fall, and makes nitrates emergently dangerous
          // in preload-dependent states (RV infarction, tamponade, hypovolemia,
          // severe aortic stenosis) without needing a flag for each of them:
          // those patients simply have no capacitance reserve to give away.
          pat.venousCapacitanceDrug = (pat.venousCapacitanceDrug || 1) *
            (1 + rec.venodilation * 0.35 * recIntensity);
        }
        // Arteriolar dilation (nitro/nitroOwn) — direct alpha-tone-lowering vasodilation,
        // distinct from venodilation above. Was defined in drugs.js but never consumed.
        if (rec.arteriolarDilation) {
          alphaDrug -= rec.arteriolarDilation * recIntensity;
        }
        // Calcium-channel blockade (diltiazem) — negative inotrope/chronotrope + vasodilation.
        // Was defined in drugs.js but never consumed; route through beta1 (rate/contractility)
        // and alpha (vasodilation) so it composes correctly with other drugs on the same tone.
        if (rec.calciumChannel) {
          beta1Drug += rec.calciumChannel * recIntensity;
          alphaDrug += rec.calciumChannel * 0.5 * recIntensity;
        }
        // Antithrombotic pathways (aspirin -> antiplatelet, heparin ->
        // anticoagulant). Not receptors in the adrenergic sense, but declared and
        // accumulated the same way so combination therapy sums correctly and the
        // effect decays with the drug. Capped below 1 so a saturating dose cannot
        // drive the propagation multiplier in conditions.js negative.
        if (rec.antiplatelet) {
          pat.antiplatelet = Math.min(0.95, (pat.antiplatelet || 0) + rec.antiplatelet * recIntensity);
        }
        if (rec.anticoagulant) {
          pat.anticoagulant = Math.min(0.95, (pat.anticoagulant || 0) + rec.anticoagulant * recIntensity);
        }
        // V1 receptor (vasopressin) — vasoconstriction, additive to alpha tone.
        //
        // The V1 response is STATE-DEPENDENT, and modelling it as a flat constant
        // had the pharmacology backwards. Vasopressin has a comparatively modest
        // pressor effect in a normotensive subject, where an intact baroreflex
        // buffers it, and a marked one in vasodilatory shock, where endogenous
        // vasopressin is depleted and V1 receptors are correspondingly
        // hypersensitive. That differential is the entire reason the drug is used
        // in distributive shock rather than as a general-purpose pressor.
        //
        // The flat version produced +101 mmHg systolic in a HEALTHY adult and
        // drove SVR to exactly 4000 — the ceiling in cardiovascular.js
        // (Math.max(4000, baseSVR * 3.2), which evaluates to 4000 at a normal
        // baseSVR). The drug was therefore pinned against a numerical guard rail
        // rather than against physiology, and curveDrugAudit measured 0.0%
        // sensitivity to doubling its own receptor coefficient: an overdose was
        // indistinguishable from a correct dose.
        //
        // CARDIAC OUTPUT IS THE DISCRIMINATOR, NOT SVR ALONE. Scaling by vascular
        // tone by itself would have been a serious regression, because SVR is
        // HIGH in cardiac arrest, not low — measured 3512 (2.80x baseline) in the
        // respArrest scenario, against 744 (0.62x) in anaphylaxis at ten minutes.
        // Tone alone would have made vasopressin weakest in the arrest where it is
        // actually given. Vasodilatory shock is low SVR with PRESERVED output
        // (anaphylaxis measured CO 6.49 L/min); arrest is CO ~0. So the
        // attenuation applies only to a perfusing patient, and a non-perfusing one
        // keeps the full V1 effect.
        if (rec.V1) {
          const tone = pat.svr / Math.max(1, pat.baseSVR || 1200);
          const perfusing = (pat.co ?? 0) > 1.5;
          // 0.25 at normal tone (~1.04), ~0.82 at the anaphylactic tone of 0.62.
          const v1Sens = perfusing
            ? Math.max(0.25, Math.min(1.3, 1.75 - 1.5 * tone))
            : 1.0;
          alphaDrug += rec.V1 * recIntensity * v1Sens;
        }
        // For completeness, if drug has parasympathetic property (old style), handle as vagal block
        if (rec.parasympathetic) {
          pat.vagalBlock += Math.abs(rec.parasympathetic) * recIntensity;
        }
        // UTEROTONIC DRIVE (queue item 9) — oxytocin (pharmacologic, oxytocin
        // receptor) or fundal massage (mechanical, but stimulating the same
        // myometrial contraction and partly via reflex endogenous oxytocin
        // release) raising the postpartum uterus's own contractile drive.
        // Accumulates across sources exactly like vagalBlock above, so
        // massage + oxytocin genuinely compose (real combination therapy for
        // refractory atony), clamped downstream in obstetric.js. Irrelevant
        // (0 contribution, harmless) on any patient without pat._pregnancy.
        if (rec.uterotonic) {
          pat.uterotonicDrive = (pat.uterotonicDrive || 0) + rec.uterotonic * recIntensity;
        }
      }

      // ----- TXA specific: set txaEffect regardless of PK class -----
      if (dr.id === "txa") {
        pat.txaEffect = Math.max(pat.txaEffect, intensity);
      }
      // Chest compressions are a MECHANICAL intervention, not a pharmacological
      // one: they are routed through this system only because that is how
      // procedures are administered. What they hand to the physiology engine is
      // an external pump, which the cardiovascular model turns into forward flow.
      // Assisted ventilation: take the most capable device currently running
      // (they do not stack — you are either bagging or you are not).
      if (dr.drugDef?.artificialAirway && intensity > 0.05) {
        const aa = dr.drugDef.artificialAirway;
        // Devices do not stack: the most definitive airway in place is the one
        // that determines the mechanics (a tube through an SGA is still a tube).
        if ((aa.deadSpaceFraction || 0) * intensity > pat.artificialAirway) {
          pat.artificialAirway = (aa.deadSpaceFraction || 0) * intensity;
          pat.artificialAirwayRes = 1 - (1 - (aa.resistanceFactor ?? 1)) * intensity;
        }
      }
      if (dr.drugDef?.pacer && intensity > 0.05) {
        pat.pacerRate = Math.max(pat.pacerRate, dr.drugDef.pacer.rate || 70);
        pat.pacerOutput = Math.max(pat.pacerOutput, (dr.drugDef.pacer.mA || 70) * intensity);
      }
      if (dr.drugDef?.vagalManeuver) {
        pat.vagalSurge = Math.max(pat.vagalSurge, dr.drugDef.vagalManeuver * intensity);
      }
      if (dr.drugDef?.aorticOcclusion && intensity > 0.05) {
        pat.aorticOcclusion = Math.max(pat.aorticOcclusion, dr.drugDef.aorticOcclusion * intensity);
      }
      if (dr.drugDef?.warmingPower) {
        pat.externalWarmingW = Math.max(pat.externalWarmingW, dr.drugDef.warmingPower * intensity);
      }
      if (dr.drugDef?.coolingPower) {
        pat.externalCoolingW = Math.max(pat.externalCoolingW, dr.drugDef.coolingPower * intensity);
      }
      if (dr.drugDef?.peep && intensity > 0.05) {
        pat.appliedPEEP = Math.max(pat.appliedPEEP, dr.drugDef.peep * intensity);
      }
      if (dr.drugDef?.ventilation && intensity > 0.05) {
        const v = dr.drugDef.ventilation;
        // QUEUE ITEM 43 FIX. Every ventilation-bearing procedure (bvm, mouthMask,
        // mouthMouth, cpap, cric, vent) previously declared a flat, adult-sized
        // vt regardless of patient body size — a rescuer bagging a toddler with
        // a 500 mL adult bag was measured DELIVERING that full 500 mL every
        // squeeze, which for a small child is a badly over-sized breath, not a
        // "safe adult device that just doesn't reach pediatric severity."
        // bvm's own note text already states the real technique — "just enough
        // for visible CHEST RISE" — i.e. a competent rescuer titrates delivered
        // volume to THIS patient's own chest, not to the bag's full nominal
        // stroke. pat.vtBase (patient.js, from ageProfile's 7 mL/kg formula) is
        // this patient's own real resting tidal volume; a deliberate rescue
        // breath is fuller than a quiet resting one, so scale toward 1.3x that
        // — chosen so an average 70 kg adult's own vtBase (~0.49 L) times 1.3
        // exceeds every device's nominal vt in this file, meaning the device's
        // own ceiling binds and adult delivered volume is unchanged (still
        // exactly the device's declared vt). A small child's much smaller
        // vtBase now genuinely caps delivered volume well below the adult
        // nominal, instead of locking them onto an oversized adult breath the
        // instant the assisted-ventilation override engages.
        const targetVt = (pat.vtBase || 0.5) * 1.3;
        const deliveredVt = Math.min(v.vt || 0, targetVt);
        const mv = (v.rr || 0) * deliveredVt;
        const cur = pat.assistedVent;
        if (!cur || mv > (cur.rr * cur.vt)) {
          pat.assistedVent = { rr: v.rr, vt: deliveredVt, intensity };
        }
      }
      if (dr.id === "cpr" || dr.id === "lucas") {
        pat.cprActive = Math.max(pat.cprActive, intensity);
      }
      // Naloxone's blockade is accumulated in the antagonist pre-pass above, not
      // here — see the note there. Doing it here made reversal order-dependent.
    }

    pat.drugInstances = toKeep;

    // ----- MAGNESIUM TOXICITY (hypermagnesaemia) -----
    // Now that serum magnesium is a real accumulating pool (above), it can reach
    // toxic levels through stacked dosing or impaired renal clearance, and the
    // consequences must appear. Thresholds are the documented ones, in mmol/L to
    // match pat.mg (StatPearls Magnesium Sulfate / NS Health birth-unit table,
    // both consistent): therapeutic 2.0-3.5, patellar reflexes lost 4.0-5.0,
    // respiratory depression 5.0-7.5, cardiac arrest 12.5-15.0. The published
    // figures are usually quoted in mEq/L or mg/dL; the mmol/L column is used
    // here directly to avoid the 2x unit trap that the old comment flagged.
    //
    // pat.magToxicity is a 0..1 severity exposed for the monitor and the wiring
    // suite, ramping from the first sign (hyporeflexia at 4.0) to the arrest
    // threshold (12.5). It is derived from the level every tick, so it cannot
    // latch: if the pool clears, the toxicity recedes, which is the correct
    // picture — the treatment is to stop the infusion and give calcium, and
    // recovery tracks the falling level.
    {
      const mg = pat.mg ?? 1.0;

      // CALCIUM IS THE ANTIDOTE, AND IT DOES NOT TOUCH THE SERUM LEVEL.
      // This is the whole teaching point of the magnesium-toxicity limb: calcium
      // is a PHYSIOLOGICAL antagonist. It competes with magnesium at the motor
      // end-plate and in nodal tissue and reverses the clinical effects within
      // minutes, while serum magnesium stays exactly where it was until the
      // kidneys clear it ("calcium gluconate serves as the specific antidote for
      // life-threatening magnesium toxicity"; the level itself falls only with
      // renal clearance). So the antagonism is modelled as a reduction of the
      // EFFECT driven by ionised calcium above normal — NOT as a subtraction
      // from pat.mg. A crew that gives calcium sees the reflexes, the drive and
      // the conduction recover while the magnesium number on the monitor does
      // not move, which is the correct and slightly counter-intuitive picture.
      //
      // pat.ca is ionised calcium (mmol/L, normal ~2.4). The calcium drug raises
      // it via fx:{ca:0.5}. Full antagonism is approached as ca climbs ~1 mmol/L
      // above normal, which is roughly what a 1 g CaCl2 push achieves here.
      const caRelief = Math.max(0, Math.min(0.9, ((pat.ca ?? 2.4) - 2.4) / 1.0));
      // Effective toxicity after antagonism. The pool (and thus magToxicity, the
      // reported level-based severity) is unchanged; caRelief scales what that
      // level is allowed to DO.
      const effTox = (1 - caRelief);

      pat.magToxicity = Math.max(0, Math.min(1, (mg - 4.0) / (12.5 - 4.0)));

      // NEUROMUSCULAR / RESPIRATORY. The earliest sign is areflexia; the
      // dangerous one is respiratory depression, which magnesium produces BOTH
      // by depressing the central drive and by weakening the respiratory
      // muscles (a physiological neuromuscular block — it competes with calcium
      // at the motor end-plate). Both existing handles are reused rather than
      // inventing new ones: respDriveSuppression (the same gain-blunting that
      // opioids use, so it composes) and neuromuscularBlock (the same end-plate
      // weakness a paralytic produces, which respiratory.js already turns into
      // falling tidal volume). Onset is at the documented 5.0 mmol/L, reaching
      // near-complete block by the 12.5 arrest level.
      //
      // NOTE ON THE ARREST MODE, because it is not the textbook one and that is
      // deliberate. Fulminant overdose here kills via HYPOXIA (respiratory
      // failure drives SaO2 down, which trips the existing VF substrate) BEFORE
      // serum magnesium reaches the 12.5 bradyasystolic-arrest threshold. That
      // ordering is correct: respiratory paralysis is documented at 6-7.5 and
      // cardiac arrest at 12.5-15, so an unventilated patient arrests from the
      // airway first. The pure bradyasystolic magnesium arrest appears only if
      // the patient is being ventilated (removing the hypoxia path), which the
      // AV-block limb in cardiovascular.js produces on its own. Measured: 3
      // stacked loads (peak 4.85) leave the patient in sinus with diminished
      // reflexes; 5 loads (peak 6.8) give respSupp 0.29, SaO2 91, PR
      // prolongation, still alive — the clinically common pictures.
      if (mg > 5.0) {
        const respFrac = Math.max(0, Math.min(1, (mg - 5.0) / (12.5 - 5.0))) * effTox;
        // Additive with any opioid/sedative already on board, capped as those
        // are. This is why magnesium toxicity is so much more dangerous in a
        // patient who also has an opioid — the same composition the COPD
        // retainer comment describes for chronic CO2 blunting.
        pat.respDriveSuppression = Math.min(0.95, pat.respDriveSuppression + respFrac * 0.9);
        pat.neuromuscularBlock = Math.max(pat.neuromuscularBlock, respFrac * 0.95);
      }
    }

    pat._alphaDrug = alphaDrug;
    pat._beta1Drug = beta1Drug;
    pat._beta2Drug = beta2Drug;
    pat._beta2Airway = beta2Airway;
}
