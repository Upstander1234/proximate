// scenarioSweep.mjs — BROAD SANITY SWEEP ACROSS EVERY SCENARIO
//
// This suite does not check that any particular number is physiologically
// correct; the other suites do that. It checks that nothing in any scenario is
// IMPOSSIBLE — NaN, a negative volume, a valve opening outside [0,1], a pH the
// patient could not be alive at, a tidal volume larger than a chest, or blood
// appearing from nowhere.
//
// It exists because of hard-won lesson #2 in this project: "your regression is
// only as good as the fields you check". A previous sweep reported "NaN: 0" for
// many batches while rr, vt and sao2 were `undefined` on the first tick of
// every scenario — they simply were not in the check list. So this suite
// asserts PRESENCE explicitly, from the very first tick, and treats an
// undefined field as a failure rather than skipping it.
//
// Run:  node src/scripts/scenarioSweep.mjs
import { physio, activePatient } from "../physiology.js";
import { SCEN } from "../data/scenarios.js";

const STEP = 2;
const DURATION = 900;          // 15 minutes of scene time per scenario

// Fields that must exist and be finite on EVERY tick, including the first.
const REQUIRED = [
  "hr", "sbp", "dbp", "map", "co", "sv", "ef", "cvp",
  "rr", "vt", "va", "sao2", "paco2", "pao2", "ph", "hco3",
  "coreTemp", "glucose", "k", "na", "hb", "lactate", "tissueLactate", "cpp",
  "totalBloodVol", "plasmaVol", "rbcVol", "airwayFluid",
  // Pleural space compression (queue item 7 — hemothorax/pleuralEffusion),
  // upper airway obstruction (croup/epiglottitis), sweat capacity and
  // ambient temperature (queue item 26 — heat stroke).
  "pleuralEffusion", "upperAirwayObstruction", "sweatCapacity", "ambientTemp",
  // Second cardiac-conditions batch (queue item 7): the PVC/PAC ectopy
  // aggregates and handles, the rhythm-instability substrate electricalStorm
  // relies on, and the AICD inappropriate-shock counter.
  "pvcFrequency", "ectopicFocus", "atrialEctopicFocus", "rhythmInstability",
  "icdShockCount",
  // Neuro/endocrine batch (queue items 7, 21, 23, 24, 27): seizure disorder
  // drive, ICP mass effect, respiratory muscle fatigue (shared with
  // GBS/myasthenia), metabolic heat/rate multiplier, general toxic-metabolic
  // encephalopathy handle, and the autonomic-neuropathy blunting factor.
  "epilepticDrive", "icpMassEffect", "respMuscleFatigue",
  "metabolicHeatMultiplier", "metabolicEncephalopathy", "strokeWeakness",
  "icp",
  // Queue item 5 dead-field sweep (this session): BUN is now a live,
  // GFR/prerenal-driven quantity (renal.js) instead of frozen at 12, and
  // 2,3-DPG (respiratory.js) is now set once from the patient's chronic
  // anemia/COPD baseline instead of frozen at 1.0 — both previously read
  // by nothing but their own constructor default, now real.
  "bun", "dpg",
  // Queue item 40 (rocuroniumOverdose, first entry in the overdose-condition
  // workstream): the Hill-equation NMJ receptor occupancy the whole
  // condition is built on.
  "neuromuscularBlock",
  // Electrolyte batch (queue item 7): ca/mg were already real, live fields
  // (calcium/magnesium drugs, acquiredLongQT, magToxicity) but had never
  // been added to this sweep — the new hypocalcemia/hypercalcemia/
  // hypomagnesemia/hypermagnesemia conditions make them central rather
  // than secondary, so they belong here now.
  "ca", "mg",
  // Second batch (queue item 7, same session): vasodilation and
  // intrinsicPain were both already real, live fields (addisonianCrisis/
  // anaphylaxis; queue item 20) but had never been added to this sweep
  // either — neurogenicShock/acuteMesentericIschemia make them central.
  "vasodilation", "intrinsicPain",
  // Third batch (queue item 7, same session): capillaryLeak was already a
  // real, live field (preeclampsia's Starling-block handle, patient.js's
  // own constructor default 0) but had never been added to this sweep —
  // acutePancreatitis makes it a second real consumer.
  "capillaryLeak",
  // Queue item 50: per-patient baseline-variability traits, seeded once at
  // construction and wired into cardiovascular.js/metabolic.js/pk.js.
  "baroreflexGain", "metabolicRate", "painSensitivity", "vascularReactivity",
  "renalReserve", "pulmonaryReserve",
  // Queue item 42 (this session): renal-local oxygen delivery/demand, now
  // the real driver of kidneyInjury accrual instead of a whole-body proxy.
  "renalDO2", "renalO2Debt",
  // Queue item 42, second slice (this session): hepatic-local oxygen
  // delivery/demand, now the real driver of liverInjury accrual instead of
  // a whole-body lactate threshold.
  "hepaticDO2", "hepaticO2Debt",
  // Queue item 45b (this session): within-encounter receptor
  // desensitization/tolerance for opioid, benzodiazepine, and beta-2
  // agonist dosing.
  "opioidDesens", "gabaDesens", "beta2Desens",
  // Queue item 42, third slice (this session): splanchnic (gut) local
  // oxygen delivery/demand and a genuinely new structural injury field.
  "gutDO2", "gutO2Debt", "gutInjury",
  // Queue item 42, fourth slice (this session): cutaneous (skin)
  // perfusion, a live diagnostic signal feeding real skin/capRefill exam
  // findings, no injury accumulator.
  "skinDO2",
  // pat.cortisol (renal.js) predates this session but was never
  // behaviorally significant until this session wired it into
  // cardiovascular.js's cortisol-permissive vascular tone term — added
  // here now that it actually matters, per lesson 2.
  "cortisol",
  // Real direct pharmacologic sedation depth (midazolam/etomidate),
  // distinct from the perfusion-based consciousness pathway.
  "sedationDepth",
  // lithiumToxicity (queue item 7, Toxicology): serum lithium (mmol/L),
  // a real physical concentration, never negative, patient.js constructor
  // default 0.8 (inside the therapeutic range for a patient with no
  // lithium condition/prescription).
  "li",
  // Carbon monoxide poisoning (queue item 7, Toxicology): the carboxyhemoglobin
  // fraction — reduces caO2 (metabolic.js), and inflates the DISPLAYED spo2
  // reading (patient.js's vitals()) since standard pulse oximetry cannot
  // distinguish COHb from O2Hb.
  "cohb",
  // Queue item 44: the strong-ion-difference acid-base model (acidbase.js).
  // cl/anionGap were already real, live fields (renal.js/metabolic.js) but
  // never added to this sweep; unmeasuredAnions/clShift/sidAdjust are the
  // three new real levers that replaced roughly a dozen direct-hco3-write
  // sites across conditions.js/pk.js.
  "cl", "anionGap", "unmeasuredAnions", "clShift", "sidAdjust",
  // Queue item 46: the shared inflammation cascade (inflammation.js) — the
  // source variable a condition declares (pathogenBurden) and the derived,
  // lagged systemic response (cytokineLoad) that drives capillaryLeak,
  // metabolicHeatMultiplier and coagulation.js's tissue-factor term. Zero
  // for every condition except pneumoniaSepsis, the first real consumer.
  "pathogenBurden", "cytokineLoad",
  // Queue items 51/52: pat.agitationBurden (condition-declared source),
  // pat.agitation (derived real-time severity, neuro.js), and
  // pat.antipsychoticEffect (olanzapine's real D2/5-HT2A pathway, pk.js —
  // sedationDepth above already covers midazolam's own GABA-A one).
  "agitationBurden", "agitation", "antipsychoticEffect",
  // accidentalHypothermia (queue item 7): coagPct already derived from
  // coagulation.js's temperature term for every patient, but had never been
  // added to this sweep before this condition made it central.
  "coagPct",
  // tricyclicOverdose (queue item 7): the three condition-owned accumulators
  // that compose alongside pk.js's own reset-and-rederive fields
  // (sodiumChannelBlock/drugInotropy/vagalBlock) rather than writing them
  // directly — measured necessary, since a condition writing those fields
  // directly is silently wiped the same tick (see conditions.js's own
  // comment). Zero for every condition except tricyclicOverdose.
  "tcaNaBlock", "tcaInotropyFactor", "tcaVagalBlock",
  // cyanidePoisoning (queue item 7): the histotoxic-hypoxia utilization
  // handle (metabolic.js's actualVO2 ceiling, cardiovascular.js's coronary
  // supply, neuro.js's brainO2 — see conditions.js's own comment), and do2
  // itself (metabolic.js — computed and thrown away before this batch;
  // published so scenarioSweep can confirm delivery stays sane while
  // energyFailure/lactate do the real work).
  "cytochromeBlock", "do2",
  // Queue item 58: isolated cutaneous urticaria/pruritus, a real, 0-1
  // histamine-driven signal (allergicReactionMild/allergicReactionModerate)
  // that also feeds a small pat.vasodilation contribution and is reduced by
  // diphenhydramine (pk.js "urticaria" fx prop).
  "urticaria",
  // Queue item 61: localized angioedema (lips/tongue/pharynx/larynx), a real
  // 0-1 severity dial (anaphylaxis) distinct from whole-body `edema`, that
  // drives pat.upperAirwayObstruction directly and is reduced by IM
  // epinephrine (pk.js "angioedema" fx prop).
  "angioedema",
  // Queue item 7 (septicShock): contractilityFactor is not new — it
  // predates this batch (pneumoniaSepsis's own hypoxic-myocardium limb) —
  // but had never been added to this sweep either (lesson 2). septicShock's
  // own cytokine-gated septic-cardiomyopathy limb makes it a second real
  // writer, closing a pre-existing gap while adding the new one.
  "contractilityFactor",
  // Queue item 66: pat.dystonia, a real, always-non-negative 0-1 severity
  // dial (acuteDystonicReaction) that also feeds actions.js's stroke-screen
  // exam directly and is reduced by diphenhydramine (pk.js "dystonia" fx
  // prop) — same idiom as urticaria/angioedema above.
  "dystonia",
  // Queue item 67 (organophosphatePoisoning): the condition-owned muscarinic
  // vagal-tone accumulator, composed alongside vagalBlock/tcaVagalBlock at
  // both of their real consumers (cardiovascular.js's hr formula and
  // updateConduction's effPara) rather than fighting the baroreflex-driven
  // pat.parasympathetic for control of it — see conditions.js's own comment
  // for the reset-trap this was built to avoid.
  "cholinergicVagalTone",
  // Queue item 56 (thermalBurn): scenario-authored TBSA fraction.
  "burnTbsaFraction",
  // Cardiac batch, valve-mechanism items (aorticStenosis/
  // mitralRegurgitationAcute/infectiveEndocarditis, physiology queue item
  // 7): these five fields (cardiovascular.js's updateValves) predate this
  // batch — built for queue item 41's regurgitation/PV-loop work — but had
  // never been added to this sweep because nothing had ever set the
  // riskFactors flags that drive them (grep-confirmed empty before this
  // batch). aorticStenosisSeverity feeds the added-Ea stenotic term;
  // mitralRegurgFrac/aorticRegurgFrac are the composite (structural +
  // ischemic + dilation) regurgitant fractions the lumped model consumes;
  // mitralRegurgStructural/aorticRegurgStructural are the structural-only
  // split the authoritative PV-loop solver consumes instead (see
  // cardiovascular.js's own comment on why that split exists).
  "aorticStenosisSeverity", "mitralRegurgFrac", "aorticRegurgFrac",
  "mitralRegurgStructural", "aorticRegurgStructural",
];

// Fields that may never go negative.
const NON_NEGATIVE = [
  "hr", "rr", "vt", "va", "co", "sv", "totalBloodVol", "plasmaVol", "rbcVol",
  "sao2", "pao2", "paco2", "glucose", "activeBleedRate", "airwayFluid",
  "tissueLactate", "cpp", "pleuralEffusion", "upperAirwayObstruction",
  "sweatCapacity", "pvcFrequency", "ectopicFocus", "atrialEctopicFocus",
  "rhythmInstability", "icdShockCount",
  "epilepticDrive", "icpMassEffect", "respMuscleFatigue",
  "metabolicHeatMultiplier", "metabolicEncephalopathy", "strokeWeakness", "icp",
  "bun", "dpg", "neuromuscularBlock", "ca", "mg", "vasodilation", "intrinsicPain",
  "capillaryLeak",
  "baroreflexGain", "metabolicRate", "painSensitivity", "vascularReactivity",
  "renalReserve", "pulmonaryReserve",
  "renalDO2", "renalO2Debt", "hepaticDO2", "hepaticO2Debt",
  "opioidDesens", "gabaDesens", "beta2Desens",
  "gutDO2", "gutO2Debt", "gutInjury",
  "skinDO2",
  "cortisol",
  // Real direct pharmacologic sedation depth (midazolam/etomidate),
  // distinct from the perfusion-based consciousness pathway.
  "sedationDepth",
  // lithiumToxicity (queue item 7, Toxicology): serum lithium (mmol/L),
  // a real physical concentration, never negative, patient.js constructor
  // default 0.8 (inside the therapeutic range for a patient with no
  // lithium condition/prescription).
  "li",
  // Queue item 44: serum chloride (real strong-cation-difference output,
  // never negative) and the pathological unmeasured-anion pool (a real
  // physical mEq/L quantity, never negative). clShift/sidAdjust are NOT
  // added here deliberately — both are signed DELTAS from baseline
  // (clShift can in principle go negative for a hypochloremic process;
  // sidAdjust already does, for an elderly patient's own baseline offset),
  // so constraining them to non-negative would be wrong, not just unused.
  "cl", "unmeasuredAnions",
  // Queue item 46: both are real, always-non-negative 0-1 quantities.
  "pathogenBurden", "cytokineLoad",
  // Queue items 51/52: all three are real, always-non-negative 0-1
  // quantities (agitationBurden/agitation/antipsychoticEffect).
  "agitationBurden", "agitation", "antipsychoticEffect",
  "coagPct",
  // tricyclicOverdose (queue item 7): all three are real, always-non-negative
  // quantities (tcaNaBlock/tcaVagalBlock are 0-1 severity dials, tcaInotropyFactor
  // is a multiplier bounded to [0.55,1] by tcaNaBlock's own [0,0.9] range,
  // well above zero).
  "tcaNaBlock", "tcaInotropyFactor", "tcaVagalBlock",
  // cyanidePoisoning (queue item 7): cytochromeBlock is a clamped 0-1 dial;
  // do2 is a physical oxygen-delivery rate (mL/min), never negative.
  "cytochromeBlock", "do2",
  // Queue item 58: real, always-non-negative 0-1 severity dial.
  "urticaria",
  // Queue item 61: real, always-non-negative 0-1 severity dial.
  "angioedema",
  // Queue item 7 (septicShock): a real multiplier, clamped to [0.55,1] by
  // every writer of it (never negative).
  "contractilityFactor",
  // Queue item 66: real, always-non-negative 0-1 severity dial.
  "dystonia",
  // Queue item 67: real, always-non-negative 0-1 severity dial (0 baseline,
  // 0.35-0.85 for organophosphatePoisoning).
  "cholinergicVagalTone",
  // Queue item 56 (thermalBurn): scenario-authored TBSA fraction
  // (patient.js constructor default 0), the real lesion magnitude a burn
  // condition/scenario declares — drives capillaryLeak above ~20% TBSA
  // (conditions.js's thermalBurn) and impaired-skin-barrier heat loss
  // (thermo.js's updateTemperature).
  "burnTbsaFraction",
  // Cardiac batch, valve-mechanism items: all five are clamped [0,0.9] (or
  // derived [0,0.95] ef) 0-1 dials in cardiovascular.js's updateValves,
  // never negative — same set added to REQUIRED above.
  "aorticStenosisSeverity", "mitralRegurgFrac", "aorticRegurgFrac",
  "mitralRegurgStructural", "aorticRegurgStructural",
];

const results = [];
let checks = 0, fail = 0;
const failures = [];

function record(scen, t, msg) {
  fail++;
  if (failures.length < 40) failures.push(`${scen} @${t}s: ${msg}`);
}

for (const scen of Object.keys(SCEN)) {
  const s = { scen, t: 0, doses: [], given: {}, activePatientId: null };
  let worst = { ph: [9, 0], vt: 0, theta: [0, 1], massDrift: 0, bvFrac: 9 };
  let firstTickChecked = false;
  let bvBaseline = null;
  let lastP = null;

  for (let T = STEP; T <= DURATION; T += STEP) {
    s.t = T;
    physio(s);
    const p = activePatient(s);
    if (!p) { record(scen, T, "no active patient"); break; }
    lastP = p;

    // --- presence and finiteness (from the FIRST tick) ---
    for (const f of REQUIRED) {
      checks++;
      const v = p[f];
      if (v === undefined) record(scen, T, `${f} is undefined`);
      else if (typeof v !== "number" || !Number.isFinite(v)) record(scen, T, `${f} is ${v}`);
    }
    firstTickChecked = true;

    // --- non-negativity ---
    for (const f of NON_NEGATIVE) {
      checks++;
      const v = p[f];
      if (typeof v === "number" && v < -1e-9) record(scen, T, `${f} negative (${v.toFixed(3)})`);
    }

    // --- valve opening states must be a fraction ---
    // _fullX indices 12-15 are thetaMV, thetaAV, thetaTV, thetaPV.
    if (Array.isArray(p._fullX)) {
      for (let i = 12; i <= 15; i++) {
        checks++;
        const th = p._fullX[i];
        if (!Number.isFinite(th)) record(scen, T, `valve state ${i} is ${th}`);
        else if (th < -1e-6 || th > 1 + 1e-6) record(scen, T, `valve state ${i} = ${th.toFixed(4)} outside [0,1]`);
        else { worst.theta[0] = Math.max(worst.theta[0], th); worst.theta[1] = Math.min(worst.theta[1], th); }
      }
    }

    // --- survivable-range checks ---
    checks++;
    if (Number.isFinite(p.ph)) {
      worst.ph[0] = Math.min(worst.ph[0], p.ph);
      worst.ph[1] = Math.max(worst.ph[1], p.ph);
      // Upper bound 7.60, not 7.55. The 7.55 originally used here is roughly the
      // top of the range seen in general practice, but acute massive pulmonary
      // embolism is a documented exception: the hyperventilation it drives
      // produces arterial pH up to about 7.58 in published series. The `pe`
      // scenario peaks at 7.56 and is the only one that approaches this bound —
      // recorded explicitly so that a SECOND scenario arriving here is treated
      // as a finding rather than as accepted behaviour.
      if (p.ph < 6.8 || p.ph > 7.60) record(scen, T, `pH ${p.ph.toFixed(3)} outside 6.80-7.60`);
    }
    checks++;
    if (Number.isFinite(p.vt)) {
      worst.vt = Math.max(worst.vt, p.vt);
      if (p.vt > 0.9) record(scen, T, `tidal volume ${p.vt.toFixed(3)} L exceeds 0.9 L`);
    }

    // --- SURVIVABLE PHYSIOLOGICAL RANGE ---
    // Everything above asks whether a value is NUMERICALLY impossible: NaN,
    // negative, outside [0,1]. That is not the same question as whether it is
    // PHYSIOLOGICALLY impossible, and the gap between the two hid a defect that
    // drained a healthy postpartum mother from 6.52 L to 2.24 L in 30 minutes
    // while every one of ~497k checks passed — the values were finite,
    // non-negative and perfectly mass-conserving the whole way down.
    //
    // Blood volume as a fraction of the patient's OWN frozen anatomical
    // baseline. A circulation cannot lose ~all of its volume: hemorrhage is
    // pressure-driven flow through a wound, so as mean arterial pressure
    // collapses the bleeding slows and exsanguination ASYMPTOTES rather than
    // running the tank to empty. (This is the same physiology that makes
    // permissive hypotension a resuscitation strategy.) Class IV hemorrhage —
    // the survivable limit — is >40% loss, so a floor at 10% of anatomical
    // volume is far below anything physiological and flags only true drainage.
    checks++;
    if (Number.isFinite(p.totalBloodVol)) {
      if (bvBaseline == null) bvBaseline = p.bodyScaleBaselineL || p.totalBloodVol;
      const frac = p.totalBloodVol / Math.max(0.1, bvBaseline);
      worst.bvFrac = Math.min(worst.bvFrac, frac);
      if (frac < 0.10) record(scen, T, `blood volume ${p.totalBloodVol.toFixed(3)} L = ${(frac * 100).toFixed(1)}% of anatomical baseline`);
    }
    // Serum sodium outside the survivable range. 100 and 175 are already beyond
    // what is compatible with life; this is a guard against a concentration
    // being driven into a clamp rail rather than a check on fine accuracy.
    checks++;
    if (Number.isFinite(p.na) && (p.na < 110 || p.na > 175)) record(scen, T, `serum sodium ${p.na.toFixed(1)} mmol/L outside survivable 110-175`);

    // --- MASS CONSERVATION: the blood compartments must add up ---
    // Red cell volume plus plasma volume IS total blood volume, by definition.
    // A drift here means some path is writing one without the others.
    checks++;
    if (Number.isFinite(p.totalBloodVol) && Number.isFinite(p.plasmaVol) && Number.isFinite(p.rbcVol)) {
      const drift = Math.abs((p.rbcVol + p.plasmaVol) - p.totalBloodVol);
      worst.massDrift = Math.max(worst.massDrift, drift);
      if (drift > 0.05) record(scen, T, `blood mass drift ${drift.toFixed(4)} L (rbc+plasma != total)`);
    }
  }
  if (!firstTickChecked) record(scen, 0, "scenario never ticked");

  // --- OBSTETRIC DELIVERY COVERAGE (queue item 8) ---
  // A scenario whose patient is actively in labor (a real contractionRate,
  // not just "pregnant and not yet in labor" like healthyPregnancy) must
  // actually REACH delivery and the postpartum period within this sweep's
  // window — otherwise the postpartum hemostasis path (obstetric.js) stays
  // invisible to every one of this suite's checks, exactly the gap that let
  // the postpartum autotransfusion/atony defects hide behind ~497k passing
  // checks before this scenario existed (lesson 10: "a passing sweep proves
  // nothing about a path it does not walk"). Checked at the FINAL tick, not
  // mid-sweep — a scenario is allowed to deliver late, just not never.
  if (lastP && lastP._pregnancy && (lastP._pregnancy.contractionRate || 0) > 0) {
    checks++;
    if (!lastP._pregnancy.delivered) {
      record(scen, DURATION, `pregnancy never delivered within ${DURATION}s — postpartum path unswept for this scenario`);
    }
  }

  results.push({ scen, worst });
}

console.log("SCENARIO SWEEP — impossible values across every scenario\n");
console.log("scenario          pH range        max vt   theta range      max mass drift   min BV frac");
console.log("-".repeat(78));
for (const r of results) {
  const w = r.worst;
  console.log(
    r.scen.padEnd(18) +
    `${w.ph[0].toFixed(2)}-${w.ph[1].toFixed(2)}`.padEnd(16) +
    `${w.vt.toFixed(3)}`.padEnd(9) +
    `${w.theta[1].toFixed(2)}-${w.theta[0].toFixed(2)}`.padEnd(17) +
    `${w.massDrift.toFixed(4)} L`.padEnd(17) +
    `${w.bvFrac === 9 ? "-" : w.bvFrac.toFixed(3)}`
  );
}
console.log("\n" + "=".repeat(78));
console.log(`${results.length} scenarios, ${checks} checks, ${fail} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log("  - " + f);
  if (fail > failures.length) console.log(`  ... and ${fail - failures.length} more`);
}
process.exitCode = fail > 0 ? 1 : 0;
