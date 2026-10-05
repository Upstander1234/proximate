// mechanismWiring.mjs — MECHANISM WIRING REGRESSION SUITE
//
// The other suites verify that OUTPUTS stay within physiological bounds. That
// cannot detect a mechanism which quietly stops firing: the patient still looks
// plausible, the vitals stay in range, and nothing fails. Three defects in this
// codebase were exactly that shape —
//
//   * the inhaled-route local airway term never executed for albuterol, because
//     route was resolved inside a branch that curve-model drugs skip;
//   * assisted ventilation silently lost its haemodynamic effect for two batches,
//     because intrathoracic pressure keyed off a variable that stopped being set;
//   * naloxone's opioid blockade latched permanently, because the accumulator was
//     never reset.
//
// Each of those passed every bounds check while being wrong. This suite asserts
// the CAUSAL LINK instead: that applying an intervention moves the specific
// intermediate variable it is supposed to act through. It is deliberately about
// wiring, not magnitude — magnitude belongs in the physiological validation
// suites.
//
// Run:  node src/scripts/mechanismWiring.mjs
import { physio, activePatient, outcomeReport } from "../physiology.js";
import { seedPastDose, hillOcc, updateDrugs, infusionRateMgPerMin, PK_PARAMS, weightPkScale, resolveDoseMg } from "../physio/pk.js";
import { Patient } from "../physio/patient.js";
import { updateVenousReturn, updateRhythm } from "../physio/cardiovascular.js";
import { LIB as ACTIONS } from "../actions.js";
import { LIM } from "../scope.js";
import { DRUG_UNITS, drawVolumeMl, amountFromDraw, infusionAmountPerMin } from "../data/drugUnits.js";
import { DRUGS as DRUG_DEFS } from "../data/drugs.js";
import { CONDITIONS } from "../physio/conditions.js";
import { establishPregnancy, updateObstetric } from "../physio/obstetric.js";
import { updateFluidShifts } from "../physio/metabolic.js";
import { pupilState } from "../physio/pupils.js";
import { updateSensitization } from "../physio/pain.js";

const STEP = 2;

// Queue item 50 (per-patient baseline-variability traits) seeds four
// coefficients randomly once at construction. This suite's probe()/afibRun()
// each construct a fresh, separate patient per call, so an assertVersus
// control/treatment pair are now two DIFFERENT random draws unless pinned —
// see probe()'s own comment for the two real failures this caused and the
// fix's reasoning.
function pinTraitsNeutral(p) {
  if (!p) return;
  p.baroreflexGain = 1; p.metabolicRate = 1; p.painSensitivity = 1; p.vascularReactivity = 1;
  // Queue item 50's remaining two traits (renalReserve/pulmonaryReserve,
  // this session) — pinned for the same reason as the original four: this
  // suite's probe()/afibRun() construct a fresh, separately-randomized
  // patient per call, so an unpinned trait breaks the "otherwise identical
  // control" premise assertVersus depends on.
  p.renalReserve = 1; p.pulmonaryReserve = 1;
}

// Run a scenario to a settled baseline, then optionally apply interventions and
// continue. Returns { before, after } patient snapshots.
function probe({ scen = "abdPain", settle = 180, run = 420, apply = [], reapply = 140, mutate = null }) {
  const s = { scen, t: 0, doses: [], given: {}, activePatientId: null };
  let p;
  for (let T = STEP; T <= settle; T += STEP) {
    s.t = T;
    physio(s);
    // Pin per-patient baseline-variability traits (queue item 50) to
    // neutral (1) right after construction, on the very first tick. This
    // suite's whole design (see assertVersus below) is "an otherwise
    // identical control" — comparing two SEPARATELY constructed patients,
    // one probe() call each. Real inter-patient trait randomness broke that
    // premise (two genuinely new failures, croup's compensated-paco2 margin
    // and metoprololOverdose's atropine-sbp-inertness margin, both traced
    // to this — see section 3). Traits are seeded once at construction and
    // never touched again, so pinning them here on tick 1 neutralizes them
    // for the rest of this probe's run without touching the trait mechanism
    // itself, which real gameplay still exercises unpinned.
    pinTraitsNeutral(activePatient(s));
  }
  p = activePatient(s);
  // Some mechanisms only exist against a substrate the stock scenarios don't
  // provide (e.g. pacing needs a bradycardic rhythm). `mutate` imposes that
  // substrate on the settled patient; it is held every tick so the engine's own
  // rhythm machine cannot immediately undo it mid-probe.
  if (mutate) mutate(p);
  const before = snapshot(p);
  for (const id of apply) s.doses.push({ id, at: s.t });
  for (let T = settle + STEP; T <= run; T += STEP) {
    s.t = T;
    // Continuous procedures expire; re-apply so the mechanism stays engaged.
    if (apply.length && (T - settle) % reapply === 0) {
      for (const id of apply) s.doses.push({ id, at: T });
    }
    physio(s);
    if (mutate) mutate(activePatient(s));
  }
  p = activePatient(s);
  return { before, after: snapshot(p), patient: p };
}

function snapshot(p) {
  return {
    // Respiratory mechanism variables
    beta2Airway: p._beta2Airway || 0,
    beta2Tone: p.beta2Tone || 0,
    effectiveBroncho: p.effectiveBroncho || 0,
    intrathoracicP: p.intrathoracicP || 0,
    appliedPEEP: p.appliedPEEP || 0,
    recruitedFraction: p.recruitedFraction || 0,
    ventUnloadFraction: p.ventUnloadFraction || 0,
    workOfBreathing: p.workOfBreathing || 0,
    assistedVent: p.assistedVent ? 1 : 0,
    respDriveSuppression: p.respDriveSuppression || 0,
    intrinsicPEEP: p.intrinsicPEEP || 0,
    trappedVolume: p.trappedVolume || 0,
    pvrWood: p.pvrWood || 0,
    // Queue item V2-25 — RV EDV/ESV/SV/EF, now republished from the same
    // authoritative, PVR-coupled ODE state the LV side already uses.
    rvEdv: p.rvEdv || 0, rvEsv: p.rvEsv || 0, rvSv: p.rvSv || 0, rvEf: p.rvEf || 0,
    // Circulatory mechanism variables
    cprActive: p.cprActive || 0,
    opioidMiosis: p.opioidMiosis || 0,
    assistedVt: p.assistedVent ? p.assistedVent.vt : 0,
    assistedRr: p.assistedVent ? p.assistedVent.rr : 0,
    venousCapacitanceDrug: p.venousCapacitanceDrug ?? 1,
    opioidBlockade: p.opioidBlockade || 0,
    alphaTone: p.alphaTone || 0,
    beta1Tone: p.beta1Tone || 0,
    mapRate: p.mapRate || 0,
    neuralSymp: p.neuralSymp || 0,
    // Renal / endocrine
    // V2-26 (ketamine dual sympathomimetic/direct-depression mechanism):
    // the depletable catecholamine-reserve signal cardiovascular.js already
    // maintains for every patient, reused (not reinvented) as the substrate
    // that decides whether ketamine's indirect pressor support is present.
    adrenalReserve: p.adrenalReserve ?? 1,
    adhs: p.adhs || 0,
    kMass: p.kMass || 0,
    naMass: p.naMass || 0,
    targetBloodVol: p.targetBloodVol || 0,
    // Device / procedure mechanism variables
    artificialAirway: p.artificialAirway || 0,
    artificialAirwayRes: p.artificialAirwayRes ?? 1,
    effectiveDeadSpace: p.effectiveDeadSpace || 0,
    // Queue item 60, part 2 of 3: tracheostomy state. workOfBreathing/vt
    // (this mechanism's own real consequence) are already snapshotted
    // above, not duplicated here.
    tracheostomy: p.tracheostomy ? 1 : 0,
    trachObstruction: p.trachObstruction || 0,
    pacerOutput: p.pacerOutput || 0,
    pacedCapture: p.pacedCapture || 0,
    parasympathetic: p.parasympathetic || 0,
    vagalSurge: p.vagalSurge || 0,
    aorticOcclusion: p.aorticOcclusion || 0,
    externalWarmingW: p.externalWarmingW || 0,
    coreTemp: p.coreTemp || 0,
    activeBleedRate: p.activeBleedRate || 0,
    ptx: p.ptx ? 1 : 0,
    // Torsades belongs here: a polymorphic VT that is pulseless or has
    // degenerated takes an UNSYNCHRONISED shock, and pk.js excluded it from the
    // rhythmFix list entirely until this batch.
    shockable: ["VF", "VT", "torsades"].includes(p.rhythm) ? 1 : 0,
    // Magnesium toxicity limb (queue item 1): the serum pool, its derived
    // toxicity severity, and the two effect handles it drives, plus ionised
    // calcium so the antidote can be checked to move the effect WITHOUT moving
    // the level.
    mg: p.mg ?? 1.0,
    ca: p.ca ?? 2.4,
    glucose: p.glucose ?? 100,
    // Queue item 5's remaining dead-field (this session): endogenous
    // insulin/glucagon secretion levels and tissue insulin sensitivity,
    // now real drivers of glucose disposal/production (renal.js).
    insulin: p.insulin ?? 1,
    glucagon: p.glucagon ?? 1,
    insulinSensitivity: p.insulinSensitivity ?? 1,
    magToxicity: p.magToxicity || 0,
    // Fetal heart rate (queue item V2-28, scoped slice) — only meaningful
    // for an undelivered pregnant patient; 0 for every other patient
    // (obstetric.js never sets pat.fetalHR unless pat._pregnancy exists).
    fetalHR: p.fetalHR || 0,
    neuromuscularBlock: p.neuromuscularBlock || 0,
    sao2: p.sao2 ?? 98,
    avConduction: p.avConduction ?? 1,
    // Hyperkalaemia ECG progression + calcium membrane stabilisation (queue
    // item 2): QRS width and serum potassium itself, so calcium's effect can
    // be checked to narrow the QRS WITHOUT moving the potassium level, the
    // same two-sided shape as the magnesium/calcium pair above.
    qrsWidth: p.qrsWidth ?? 0.08,
    k: p.k ?? 4,
    // AV block cardiac conditions batch (queue item 7): the structural
    // conduction-disease axis and its two graded observables.
    avNodalDisease: p.avNodalDisease ?? 0,
    prInterval: p.prInterval ?? 0.16,
    // Pericardial tamponade (queue item 7): the effusion, and cvp so the
    // clinical JVD sign (rising cvp despite falling co/filling) can be
    // asserted as an emergent consequence, not a scripted flag.
    pericardialEffusion: p.pericardialEffusion ?? 0,
    cvp: p.cvp ?? 5,
    // Takotsubo (stress cardiomyopathy): the global consequences of the
    // catecholamine-driven apical stunning — ejection fraction, the contractility
    // it derives from, and the condition's own stunning/surge states.
    ef: p.ef ?? 0,
    // Valvular regurgitation (queue item 41). sv/edv were never tracked by
    // snapshot() before — the same gap sao2, kExcretion and totalBloodVol each
    // hit when a new assertion first needed them.
    sv: p.sv ?? 0,
    edv: p.edv ?? 0,
    pp: p.pp ?? 0,
    // Phase 6 (queue item 1) -- the shared pericardial restraint pressure.
    pericardialP: p.pericardialP ?? 0,
    mitralRegurgFrac: p.mitralRegurgFrac ?? 0,
    aorticRegurgFrac: p.aorticRegurgFrac ?? 0,
    // Queue item V2-24(b) — the field the authoritative full-loop ODE
    // actually consumes for aortic regurgitant flow (aorticRegurgFrac above
    // is the lumped-model-only composite, never read by derivative()).
    aorticRegurgStructural: p.aorticRegurgStructural ?? 0,
    // Queue item 1's Phase 2 — the same authoritative-solver-consumed field
    // on the mitral side (mitralRegurgFrac above is the lumped-model-only
    // composite, what the older [VALVULAR REGURGITATION] section's own
    // assertions read). Was never snapshotted before this batch; a real
    // prerequisite for this phase's own new assertions below, which need
    // to read the structural field specifically.
    mitralRegurgStructural: p.mitralRegurgStructural ?? 0,
    infarctTerritory: p.infarctTerritory ?? null,
    // HOCM (queue item 7, section 8 Cardiac backlog): the DYNAMIC LVOT
    // obstruction term, composed into the already-tracked aortic-stenosis
    // resistance-in-series handle.
    aorticStenosisSeverity: p.aorticStenosisSeverity ?? 0,
    hocmObstruction: p.hocmObstruction ?? 0,
    // Mitral stenosis (queue item 7's chronic/degenerative valve batch):
    // the inflow-orifice resistance dial, real and live (cardiovascular.js's
    // updateValves + the full-loop ODE's own mvStenR-scaled Rmv).
    mitralStenosisSeverity: p.mitralStenosisSeverity ?? 0,
    co: p.co ?? 0,
    regurgVolPerBeat: p._fullRegurgVol ?? 0,
    contractility: p.contractility ?? 1,
    takotsuboStun: p.takotsuboStun ?? 0,
    // Acute coronary syndrome: the dynamic thrombus (coronaryStenosis), the
    // ischemia signal it drives (atp), the antithrombotic handles that brake
    // propagation, and the permanent-necrosis outputs (contractilityFactor loss,
    // scarBurden) that separate unstable angina from NSTEMI/STEMI.
    coronaryStenosis: p.coronaryStenosis ?? 0,
    atp: p.atp ?? 1,
    antiplatelet: p.antiplatelet ?? 0,
    anticoagulant: p.anticoagulant ?? 0,
    contractilityFactor: p.contractilityFactor ?? 1,
    scarBurden: p.scarBurden ?? 0,
    acsIschemicDose: p._acsIschemicDose ?? 0,
    plasminActivity: p.plasminActivity ?? 0,
    acsStun: p.acsStun ?? 0,
    troponin: p.troponin ?? "negative",
    qtcConditionOffset: p.qtcConditionOffset ?? 0,
    lusitropyFactor: p.lusitropyFactor ?? 1,
    renalClearanceFraction: p.renalClearanceFraction ?? 1,
    renin: p.renin || 0,
    aldosterone: p.aldosterone || 0,
    // Queue item V2-13 (cirrhosis / portal hypertension): angiotensinII and
    // venousCapacitanceFactor were both real, already-live fields (RAAS's
    // own middle term; the capacitance-aware defended-volume target) never
    // previously read through this suite's own before/after snapshot path.
    // portalPressure is the new field this batch adds.
    angiotensinII: p.angiotensinII || 0,
    venousCapacitanceFactor: p.venousCapacitanceFactor ?? 1,
    portalPressure: p.portalPressure || 0,
    splanchnicFrac: p.splanchnicFrac ?? 0.33,
    na: p.na ?? 140,
    afferentConstriction: p.afferentConstriction || 0,
    gfrFraction: p.baseGfr ? (p.gfr || 0) / p.baseGfr : 0,
    organClearance: p._organClearance ?? 1,
    sodiumChannelBlock: p.sodiumChannelBlock || 0,
    potassiumChannelBlock: p.potassiumChannelBlock || 0,
    // Queue item 40, fifth drug (lidocaineOverdose/LAST): the two
    // consequences of drugDef.toxicity's cardiacThreshold branch (pk.js),
    // plus the general drug-toxicity seizure limb and its own suppression
    // term, none of which snapshot() tracked before this batch needed them.
    avSlowingDrug: p.avSlowingDrug || 0,
    drugInotropy: p.drugInotropy ?? 1,
    seizureDrive: p.seizureDrive || 0,
    anticonvulsant: p.anticonvulsant || 0,
    avConduction: p.avConduction ?? 1,
    qt: p.qt || 0,
    sbp: p.sbp || 0,
    dbp: p.dbp || 0,
    pulsePressure: (p.sbp || 0) - (p.dbp || 0),
    map: p.map || 0,
    svr: p.svr || 0,
    // Queue item V2-27 (chronic adaptation): concentric LV hypertrophy,
    // relaxes toward a target driven by sustained afterload elevation.
    lvHypertrophy: p.lvHypertrophy || 0,
    vascularStiffness: p.vascularStiffness || 0,
    arterialComplianceFactor: p.arterialComplianceFactor ?? 1,
    plasmaVol: p.plasmaVol || 0,
    interstitialVol: p.interstitialVol || 0,
    // Added this batch (queue item 7, third batch) — a real, already-live
    // field (p.totalBloodVol, read directly by several assertions above
    // via the raw patient object) that had never been added to snapshot()
    // itself, so it crashed the first assertMoved() call that tried to
    // read it through the normal before/after snapshot path instead of
    // the raw patient — caught and fixed the same tick, not worked around.
    totalBloodVol: p.totalBloodVol || 0,
    hct: p.hct || 0,
    // Queue item V2-10 (nephron segment-level modeling, scoped slice):
    // proximal (SGLT/glucose-sensitive) vs distal (aldosterone-driven)
    // reabsorption efficiency, and their composite.
    proximalReabsorptionEff: p.proximalReabsorptionEff ?? 1,
    distalReabsorptionEff: p.distalReabsorptionEff ?? 1,
    segmentReabsorptionEff: p.segmentReabsorptionEff ?? 1,
    // Queue item 7 (malaria) — real, already-live fields for the
    // hemolysis-vs-hemorrhage two-sided contrast, never previously read
    // through this suite's own snapshot() path.
    rbcMass: p.rbcMass || 0,
    hb: p.hb || 0,
    hemolysisRate: p.hemolysisRate || 0,
    plateletCount: p.plateletCount ?? 250,
    hr: p.hr || 0,
    co: p.co || 0,
    // Hypertensive urgency/emergency (cardiac conditions batch, queue item
    // 7): edema is the emergency variant's real, distinct end-organ-damage
    // marker (flash pulmonary edema from acute afterload mismatch) — absent
    // from urgency by definition.
    edema: p.edema || 0,
    // Airway fluid (queue item 13): the state itself, plus the two downstream
    // observables it is supposed to move (tidal volume down, paco2 up via
    // resistance) and out for context.
    airwayFluid: p.airwayFluid ?? 0,
    vt: p.vt || 0,
    vtPrev: p.vtPrev || 0,
    paco2: p.paco2 || 0,
    rr: p.rr || 0,
    // Uterine atony / uterotonic drive (queue item 9).
    uterineTone: p._pregnancy?.uterineTone ?? 0,
    uterotonicDrive: p.uterotonicDrive || 0,
    // Lactate tissue/serum split + CPP floor (queue item 15).
    lactate: p.lactate ?? 1,
    tissueLactate: p.tissueLactate ?? 1,
    cpp: p.cpp ?? 0,
    icp: p.icp ?? 10,
    // Intrinsic pain (queue item 20). Read the same way vitals() does
    // (floored at 0), not via vitals() itself, to avoid perturbing that
    // method's own jitter state with an extra call per snapshot.
    displayedPain: Math.max(0, p.drugPain || 0),
    intrinsicPain: p.intrinsicPain ?? 0,
    // Pain sensitization cascade (queue item 62, physio/pain.js).
    peripheralSensitization: p.peripheralSensitization ?? 0,
    glialActivation: p.glialActivation ?? 0,
    centralSensitization: p.centralSensitization ?? 0,
    allodyniaLevel: p.allodyniaLevel ?? 0,
    // Sickle cell crisis (queue item 22): the chronic-anemia seed and the
    // acute-chest-syndrome shunt consequence.
    rbcVol: p.rbcVol || 0,
    shuntFraction: p.shuntFraction || 0,
    // V2-6 (scoped slice): the real "100% oxygen test" observables — see
    // respiratory.js's own comment. pao2 itself was already real/live but
    // never snapshotted before this batch needed it.
    pao2: p.pao2 || 0,
    o2TestDelta: p._o2TestDelta ?? null,
    roomAirPao2: p._roomAirPao2 ?? null,
    // Queue item 59 (decompressionIllness): pulmResistFactor predates this
    // session (`pe`'s own mechanical-obstruction mechanism, now given a
    // real patient.js constructor default of 1) but had never been
    // snapshotted before.
    pulmResistFactor: p.pulmResistFactor ?? 1,
    // Heat stroke (queue item 26): the thermal environment/inputs, the
    // thermoregulatory-failure state itself, and the two intervention levers.
    ambientTemp: p.ambientTemp ?? 20,
    inShade: p.inShade ? 1 : 0,
    sweatCapacity: p.sweatCapacity ?? 1,
    externalCoolingW: p.externalCoolingW || 0,
    brainInjury: p.brainInjury || 0,
    seizing: p.seizing ? 1 : 0,
    // Chest seal / hemothorax (queue item 7, Respiratory): the persistent
    // seal flag, and the pleural-space compression handle shared by
    // hemothorax and pleuralEffusion.
    chestSealApplied: p.chestSealApplied ? 1 : 0,
    pleuralEffusion: p.pleuralEffusion || 0,
    // Upper airway obstruction (queue item 7, Respiratory — croup/
    // epiglottitis): the state itself and beta2Tone, so it can be asserted
    // that raising beta2 tone (as albuterol would) does NOT relieve it.
    upperAirwayObstruction: p.upperAirwayObstruction || 0,
    // Outputs, for context only
    effectiveFio2: p.effectiveFio2 || 0,
    // Second cardiac-conditions batch (queue item 7): the ectopy aggregate
    // (previously written, never read — see prematureVentricularContractions)
    // and its two new substrate handles, plus rhythmInstability (feeds
    // vtDrive, the electricalStorm recurrence mechanism) and the ICD-magnet
    // pair (aicdMalfunction).
    pvcFrequency: p.pvcFrequency || 0,
    ectopicFocus: p.ectopicFocus || 0,
    atrialEctopicFocus: p.atrialEctopicFocus || 0,
    rhythmInstability: p.rhythmInstability || 0,
    icdSuppressed: p.icdSuppressed ? 1 : 0,
    icdShockCount: p.icdShockCount || 0,
    // Neuro/endocrine batch (queue items 7, 21, 23, 24, 27).
    epilepticDrive: p.epilepticDrive || 0,
    seizing: p.seizing ? 1 : 0,
    icpMassEffect: p.icpMassEffect || 0,
    icp: p.icp ?? 10,
    cpp: p.cpp ?? 0,
    cushingAlpha: p._cushingAlpha || 0,
    vagalSurge: p.vagalSurge || 0,
    strokeSide: p.strokeSide,
    strokeWeakness: p.strokeWeakness || 0,
    maxStrokeWeakness: p._maxStrokeWeakness || 0,
    respMuscleFatigue: p.respMuscleFatigue || 0,
    vt: p.vt || 0,
    metabolicHeatMultiplier: p.metabolicHeatMultiplier ?? 1,
    coreTemp: p.coreTemp || 0,
    metabolicEncephalopathy: p.metabolicEncephalopathy || 0,
    consciousness: p.consciousness,
    liverInjury: p.liverInjury || 0,
    kidneyInjury: p.kidneyInjury || 0,
    // Queue item V2-12 (this session): real-time hepatic flow now gates
    // lactate clearance directly, not just the slow liverInjury accumulator.
    hepaticDO2: p.hepaticDO2 ?? 1,
    // Queue item 48 (this session): reversible-vs-structural pattern
    // extended to liver/gut — atnProgression's own sibling accumulators.
    hepaticStunning: p.hepaticStunning ?? 0,
    gutMucosalStunning: p.gutMucosalStunning ?? 0,
    atnProgression: p.atnProgression ?? 0,
    kExcretion: p.kExcretion ?? 1,
    autonomicNeuropathy: p.autonomicNeuropathy || 0,
    coronaryStenosis: p.coronaryStenosis || 0,
    adhAutonomous: p.adhAutonomous || 0,
    adhSecretionCapacity: p.adhSecretionCapacity ?? 1,
    adhs: p.adhs || 0,
    thirstDrive: p.thirstDrive || 0,
    na: p.na ?? 140,
    hco3: p.hco3 ?? 24,
    glucose: p.glucose ?? 100,
    k: p.k ?? 4,
    activeBleedRate: p.activeBleedRate || 0,
    airwayFluid: p.airwayFluid || 0,
    baseSVR: p.baseSVR || 0,
    lactate: p.lactate ?? 1,
    // Pediatric/GI batch (queue item 7): incarceratedHernia/intussusception
    // both write this directly (neuro.js also decays it at rest, the
    // "written, read, but fought to a standstill" defect that batch's own
    // comment documents finding and fixing). Was never added to this
    // snapshot when those assertions were written (found during the
    // consolidated full-suite pass — the suite crashed on
    // `.toFixed()` against undefined).
    gutInjury: p.gutInjury ?? 0,
    // Carbon monoxide poisoning (queue item 7, Toxicology): the true COHb
    // fraction and the real oxygen-CONTENT it discounts (caO2, metabolic.js
    // — every organ DO2 signal in this engine already derives from it), plus
    // the DISPLAYED pulse-ox reading (patient.js's own vitals(), not a raw
    // patient field) so the "reads normal, isn't" trap can be asserted
    // directly against the real, player-facing number.
    cohb: p.cohb || 0,
    metHb: p.metHb || 0,
    caO2: p.caO2 ?? 20,
    spo2Displayed: p.vitals().spo2,
    // Inflammation cascade (queue item 46): the source variable, the
    // derived systemic response, and its three consumers. capillaryLeak
    // itself was NOT previously in this snapshot (the pre-existing
    // ENDOTHELIAL BARRIER section reads it off `.patient` directly instead)
    // — added here as a real, previously-missing capability, not assumed.
    pathogenBurden: p.pathogenBurden || 0,
    cytokineLoad: p.cytokineLoad || 0,
    capillaryLeak: p.capillaryLeak || 0,
    // Queue item 56 (thermalBurn): scenario-authored TBSA fraction. Its
    // thermal consequence is read via this snapshot's existing `coreTemp`
    // field (above), its coagulation/hemodynamic one via `co` (below).
    burnTbsaFraction: p.burnTbsaFraction || 0,
    factorII: p.factorII ?? 100,
    factorX: p.factorX ?? 100,
    factorVIII: p.factorVIII ?? 100,
    fibrinogen: p.fibrinogen ?? 3,
    // Agitation / psychiatric-crisis severity (queue items 51/52): the
    // condition-declared source magnitude, the derived real-time severity,
    // and the two independent calming pathways that lower it.
    agitationBurden: p.agitationBurden || 0,
    agitation: p.agitation || 0,
    sedationDepth: p.sedationDepth || 0,
    antipsychoticEffect: p.antipsychoticEffect || 0,
    // Accidental hypothermia (queue item 7): coagPct already derives from
    // coagulation.js's tempEff term (which reads p.coreTemp directly) even
    // for a non-bleeding patient — it had never been added to this snapshot.
    // arrhythmiaHypothermic is the new cold-myocardium VF-substrate term
    // (cardiovascular.js's a.hypothermic).
    coagPct: p.coagPct ?? 100,
    arrhythmiaHypothermic: p.arrhythmia?.hypothermic || 0,
    // Tricyclic overdose (queue item 7): vasodilation is the alpha-1-blockade
    // hypotension contributor, distinct from drugInotropy's direct myocardial
    // depression; vagalBlock is the reused anticholinergic handle
    // atropineOverdose already established; ph gates bicarb's real QRS-
    // narrowing route at cardiovascular.js's qrsWidth calculation.
    vasodilation: p.vasodilation || 0,
    // Queue item 58: isolated cutaneous urticaria/pruritus, real diphenhydramine
    // receptor target (pk.js "urticaria" fx prop).
    urticaria: p.urticaria || 0,
    // Queue item 61: localized angioedema (lips/tongue/pharynx/larynx),
    // distinct from whole-body `edema` below, plus the real airway-mechanics
    // consumer it drives directly (respiratory.js reads upperAirwayObstruction
    // for inspiratory resistance/rr, same route as croup/epiglottitis).
    angioedema: p.angioedema || 0,
    // Queue item 66: acute dystonic reaction (drug-induced, D2-blockade),
    // real diphenhydramine receptor target (pk.js "dystonia" fx prop), same
    // idiom as urticaria/angioedema above.
    dystonia: p.dystonia || 0,
    // Serotonin syndrome (queue item 7, Toxicology backlog): the
    // condition-owned neuromuscular-hyperactivity severity field.
    serotoninClonus: p.serotoninClonus || 0,
    nmsRigidity: p.nmsRigidity || 0,
    upperAirwayObstruction: p.upperAirwayObstruction || 0,
    vagalBlock: p.vagalBlock || 0,
    ph: p.ph ?? 7.4,
    tcaNaBlock: p.tcaNaBlock || 0,
    // Cyanide poisoning (queue item 7): the histotoxic-hypoxia utilization
    // handle, and do2 itself (metabolic.js — real oxygen DELIVERY, computed
    // and thrown away before this batch) so the delivery-vs-utilization
    // contrast that is this condition's whole teaching point can be asserted
    // directly rather than inferred.
    cytochromeBlock: p.cytochromeBlock || 0,
    do2: p.do2 || 0,
    // lithiumToxicity/hydrocarbonAspiration (queue item 7, Toxicology):
    // serum lithium and lung compliance, both real, condition-mutated
    // fields never previously read through this suite's own before/after
    // snapshot path.
    li: p.li ?? 0.8,
    compliance: p.compliance ?? 0.09,
    energyFailure: p.energyFailure || 0,
    // V2-22 (agitation-specific VO2 demand, metabolic.js): a real, already-
    // computed field never previously read through this suite's own
    // before/after path.
    vo2Demand: p.vo2Demand || 0,
    // The anion gap is how the lactic acidosis this lesion produces actually
    // presents at the bedside; read here so it can be asserted rather than
    // inferred from lactate.
    anionGap: p.anionGap ?? 12,
    // organophosphatePoisoning (queue item 67): the condition-owned
    // muscarinic vagal-tone accumulator (see conditions.js's own comment for
    // why this could not just ratchet pat.parasympathetic directly) plus the
    // raw pat.broncho it shares with asthma/anaphylaxis/chlorine, so the
    // bradycardia-vs-bronchospasm distinction (and atropine's real effect on
    // one but not the other) can be asserted directly.
    cholinergicVagalTone: p.cholinergicVagalTone || 0,
    broncho: p.broncho || 0,
    // Per-organ oxygen extraction (queue item V2-2). svO2Composite is the
    // real flow-weighted mixed venous saturation; the two organ-extraction
    // ratios are read directly since they diverge from each other even when
    // svO2Composite alone would not (see this section's own assertions).
    svO2Composite: p.svO2Composite ?? 100,
    kidneyExtraction: (p.organExtraction || {}).kidney ?? 0.10,
    gutExtraction: (p.organExtraction || {}).gut ?? 0.25,
  };
}

// Sampled run: HR is deliberately noisy in afib/flutter/WPW+AFib (the
// irregularity, or its absence, IS the mechanism under test in each case),
// so a single before/after snapshot would be a coin flip. Samples HR every
// 20s of simulated time and returns the mean/stdev alongside the final
// patient — the "measure the distribution, not one point" discipline
// lesson 9 established for stochastic PASS/FAIL assertions, applied here to
// a noisy continuous signal instead. Moved to top-level scope (originally
// declared inside the ATRIAL FIBRILLATION section's own block) because the
// cardiac conditions batch's ATRIAL FLUTTER and WPW+AFIB sections reuse it
// too — a block-scoped function declaration is not visible outside its own
// braces, which crashed the suite the first time this was tried.
function afibRun({ scen = "atrialFibrillationRVR", minutes = 5, doses = [] } = {}) {
  const s = { scen, t: 0, doses: [], given: {}, activePatientId: null };
  const samples = [];
  for (let T = STEP; T <= minutes * 60; T += STEP) {
    s.t = T;
    for (const d of doses) if (d.at === T) s.doses.push({ id: d.id, at: T });
    physio(s);
    pinTraitsNeutral(activePatient(s));
    if (T % 20 === 0) samples.push(activePatient(s).hr);
  }
  const p = activePatient(s);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
  return { patient: p, mean, stdev: Math.sqrt(variance) };
}

let pass = 0, fail = 0;
const failures = [];

// Assert that `key` moved in the expected direction by at least `minDelta`.
function assertMoved(label, res, key, dir, minDelta = 0.01) {
  const d = res.after[key] - res.before[key];
  const ok = dir === "up" ? d >= minDelta : d <= -minDelta;
  ok ? pass++ : fail++;
  if (!ok) failures.push(`${label}: ${key} expected ${dir} by >=${minDelta}, moved ${d.toFixed(4)}`);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(46)} ${key} ${res.before[key].toFixed(3)} -> ${res.after[key].toFixed(3)}`);
}

// Assert that an intervention moved `key` relative to an otherwise identical
// control run — the only valid comparison when the substrate itself (a rhythm,
// a lesion) is being imposed by the probe rather than settled into.
function assertVersus(label, res, control, key, dir, minDelta = 0.01) {
  const d = res.after[key] - control.after[key];
  const ok = dir === "up" ? d >= minDelta : d <= -minDelta;
  ok ? pass++ : fail++;
  if (!ok) failures.push(`${label}: ${key} expected ${dir} vs control by >=${minDelta}, moved ${d.toFixed(4)}`);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(46)} ${key} ${control.after[key].toFixed(3)} (control) -> ${res.after[key].toFixed(3)}`);
}

// Assert that a STOCHASTIC mechanism fires in most of N independent trials.
//
// Some mechanisms succeed probabilistically, and a single draw asserted with
// assertMoved is a coin flip dressed up as a regression. Defibrillation is the
// case that forced this: conversion of VF succeeds about 93% of the time
// (measured 14/15), so the one-shot assertion failed roughly one run in
// fourteen. It reported 50/51 once and 51/51 on a clean re-run of the same tree.
//
// That is worse than a missing assertion. This project's whole verification
// discipline is "diff the failure SET, not the count" against a known-good
// baseline, and an assertion that fails at random trains you to wave failures
// through — the precise habit that lets a real regression ship.
//
// The threshold is a lower bound on successes, not an exact count: at p=0.93 and
// n=10, requiring 7 flakes about 0.1% of the time (a 70x improvement) while still
// catching a genuine collapse in efficacy — if p fell to 0.5 this would fail
// about 83% of runs. Magnitude and efficacy still belong in the Monte Carlo
// suites; this only asks whether the causal link fires reliably.
function assertMostTrials(label, trials, minSuccesses, fn) {
  let ok = 0;
  for (let i = 0; i < trials; i++) if (fn()) ok++;
  const good = ok >= minSuccesses;
  good ? pass++ : fail++;
  if (!good) failures.push(`${label}: converted ${ok}/${trials}, expected >=${minSuccesses}`);
  console.log(`  ${good ? "PASS" : "FAIL"}  ${label.padEnd(46)} ${ok}/${trials} trials (need >=${minSuccesses})`);
}

function assertNonZero(label, res, key, min = 0.01) {
  const v = res.after[key];
  const ok = v >= min;
  ok ? pass++ : fail++;
  if (!ok) failures.push(`${label}: ${key} expected >=${min}, got ${v.toFixed(4)}`);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(46)} ${key} = ${v.toFixed(3)}`);
}

console.log("MECHANISM WIRING SUITE — does each intervention move its own mechanism?\n");

console.log("\n[TRANSCUTANEOUS PACING]");
{
  // Needs a bradycardic substrate: complete heart block, held through the run.
  const chb = (p) => { p.rhythm = "chb"; p.avConduction = 0; };
  const r = probe({ scen: "chestPainM", apply: ["pacing"], mutate: chb });
  const unpaced = probe({ scen: "chestPainM", mutate: chb });
  assertNonZero("pacing -> stimulus delivered", r, "pacerOutput", 10);
  assertNonZero("pacing -> myocardium captures", r, "pacedCapture", 0.5);
  // Compared against the SAME substrate without a pacer, not against the
  // patient's pre-block sinus rate — otherwise the assertion measures the
  // heart block, not the pacemaker.
  assertVersus("pacing -> imposes its rate on a blocked heart", r, unpaced, "hr", "up", 15);
  assertVersus("pacing -> raises perfusing output", r, unpaced, "co", "up", 0.3);
}

console.log("\n[AV BLOCK — cardiac conditions batch, physiology queue item 7]");
{
  // Real scenarios (CARD-028/CARD-029), not a synthetic mutate() substrate —
  // both use the new pat.avNodalDisease axis (cardiovascular.js), which
  // reaches chb/firstDegreeBlock through disease rather than through
  // hyperkalaemia/magnesium/drugs, the three axes already asserted above.
  // NOTE: probe()'s `run` is an ABSOLUTE end tick, not a duration added to
  // `settle` — `run` must exceed `settle` for the post-dose loop to execute
  // at all (settle:60/run:60 queues a dose but never ticks it forward,
  // which silently "passed" the no-effect atropine assertion for the wrong
  // reason and hard-failed the pacing one at exactly 0.0000 moved). All
  // three arms now share the same 60s settle / 240s absolute run so dosed
  // arms get 180s to actually take effect and the untreated control is
  // measured at the same elapsed time, not an earlier one.
  const healthy   = probe({ scen: "abdPain", settle: 60, run: 240 });
  const untreated = probe({ scen: "thirdDegreeAVBlock", settle: 60, run: 240, apply: [] });
  const atropine  = probe({ scen: "thirdDegreeAVBlock", settle: 60, run: 240, apply: ["atropine"] });
  const paced     = probe({ scen: "thirdDegreeAVBlock", settle: 60, run: 240, apply: ["pacing"], reapply: 9999 });

  {
    const ok = untreated.patient.rhythm === "chb";
    ok ? pass++ : fail++;
    if (!ok) failures.push(`thirdDegreeAVBlock did not reach chb: rhythm=${untreated.patient.rhythm}`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${"structural AV disease reaches the engine's chb rhythm".padEnd(46)} rhythm = ${untreated.patient.rhythm}`);
  }
  assertVersus("complete AV block collapses cardiac output", untreated, healthy, "co", "down", 2.0);
  // Atropine is vagolytic; this block is not vagally mediated, so the SAME
  // drug that reverses hyperkalaemic/vagal AV block (asserted above) must do
  // essentially nothing here — the two-sided pair that pins the clinical
  // claim already sitting, previously unenforced, in atropine's own note.
  {
    const d = atropine.patient.co - untreated.patient.co;
    const ok = Math.abs(d) < 0.3;
    ok ? pass++ : fail++;
    if (!ok) failures.push(`atropine moved co by ${d.toFixed(2)} in structural CHB (expected <0.3, i.e. no effect)`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${"atropine does NOT help structural (infranodal) CHB".padEnd(46)} co ${untreated.patient.co.toFixed(2)} (untreated) -> ${atropine.patient.co.toFixed(2)} (atropine)`);
  }
  assertVersus("transcutaneous pacing raises output in CHB", paced, untreated, "co", "up", 0.8);
  assertVersus("pacing captures and imposes its rate on CHB", paced, untreated, "hr", "up", 15);

  // First-degree block: the OTHER end of the same avNodalDisease axis. Real
  // scenario (CARD-029), settled with no treatment (there is none — see the
  // condition's own comment on why treating this is the wrong answer).
  const firstDeg = probe({ scen: "firstDegreeAVBlock", settle: 120, run: 2 });
  const control  = probe({ scen: "abdPain", settle: 120, run: 2 });
  assertVersus("first-degree block prolongs the PR interval", firstDeg, control, "prInterval", "up", 0.03);
  {
    const ok = firstDeg.patient.rhythm === "sinus";
    ok ? pass++ : fail++;
    if (!ok) failures.push(`first-degree block changed the rhythm classification: ${firstDeg.patient.rhythm} (expected sinus — PR-only finding, 1:1 conduction)`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${"first-degree block does NOT change rhythm classification".padEnd(46)} rhythm = ${firstDeg.patient.rhythm}`);
  }
  {
    const ok = firstDeg.patient.avConduction > 0.5;
    ok ? pass++ : fail++;
    if (!ok) failures.push(`first-degree block avConduction too low: ${firstDeg.patient.avConduction.toFixed(3)} (expected >0.5, i.e. nowhere near the chb 0.05 floor)`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${"first-degree block stays far from the chb threshold".padEnd(46)} avConduction = ${firstDeg.patient.avConduction.toFixed(3)}`);
  }
}

console.log("\n[PERICARDIAL CONSTRAINT / VENTRICULAR INTERDEPENDENCE — queue item 1's Phase 6]");
{
  // The three mandatory promoted assertions from the plan
  // (~/.claude/plans/i-was-thinking-about-temporal-wand.md): Vaillant
  // pericardiectomy null test, RV disproportionality, and a simplified
  // Refsum-style transmural-invariance check. All three reuse the
  // already-shipped, already-calibrated pericardialTamponade condition as
  // the real driver of elevated pericardial pressure (no synthetic
  // substrate needed), and pat._pericardiectomy, a test-only override added
  // this phase specifically for this suite (never set by any condition).
  const healthy = probe({ scen: "abdPain", settle: 900, run: 900 });
  const tamp = probe({ scen: "pericardialTamponade", settle: 900, run: 900 });

  // (1) Vaillant et al. 2025 J Physiol — preload-dependent interventricular
  // interaction is abolished by pericardiectomy. Forcing pat._pericardiectomy
  // mid-episode must drive pericardialP to ~0 and substantially RECOVER
  // cardiac output toward the matched healthy control -- confirming the
  // restraint is genuinely pericardium-mediated (removable), not a leak
  // elsewhere in the shared solver.
  const pericardiectomy = probe({
    scen: "pericardialTamponade", settle: 900, run: 1800,
    mutate: (p) => { p._pericardiectomy = true; },
  });
  const periZeroOk = pericardiectomy.after.pericardialP < 1.0;
  console.log(`  ${periZeroOk ? "PASS" : "FAIL"}: pericardiectomy drives pericardialP to ~0 (${pericardiectomy.after.pericardialP.toFixed(2)})`);
  if (periZeroOk) pass++; else { fail++; failures.push("pericardiectomy pericardialP->0"); }
  assertVersus("...and cardiac output substantially recovers", pericardiectomy, tamp, "co", "up", 1.5);

  // (2) RV disproportionality (Borlaug & Reddy, JACC Heart Fail 2019): the
  // thin-walled RV must lose a LARGER fraction of its EDV under the same
  // pericardial restraint than the LV does -- the concrete, chamber-specific
  // form of the alpha_j coupling coefficients (periLV < periRV in
  // cardiovascular.js's buildParams).
  const lvFracLoss = 1 - (tamp.after.edv / healthy.after.edv);
  const rvFracLoss = 1 - (tamp.after.rvEdv / healthy.after.rvEdv);
  console.log(`  ${rvFracLoss > lvFracLoss ? "PASS" : "FAIL"}: RV EDV fraction-loss (${rvFracLoss.toFixed(3)}) exceeds LV's (${lvFracLoss.toFixed(3)})`);
  if (rvFracLoss > lvFracLoss) pass++; else { fail++; failures.push("RV disproportionality"); }

  // (3) Refsum-style transmural-invariance, simplified: a 10-15 mmHg rise in
  // the SAME restraint (pericardialP) that raises reported RA pressure
  // should raise it by a comparable magnitude (Refsum, Junemann, Lipton et
  // al., Circulation 1981 -- the pericardial pressure rise and the
  // intracavitary pressure rise it produces should track together, since
  // both are driven by the identical shared P_peri term, not two
  // independent coefficients that could drift apart). Checked directly
  // against the mechanism's own construction: periRA's coefficient (0.75)
  // applied to the measured pericardialP delta should predict the measured
  // Pra delta to within a real, generous tolerance -- confirming the
  // reported chamber pressure is genuinely DERIVED from pericardialP via the
  // stated alpha, not a second, disagreeing pathway.
  //
  // CORRECTED 2026-10-05: this used to compare ONE instantaneous
  // fourChamberLoop.Pra snapshot per arm. Pra swings about -0.3 to 5.2 mmHg
  // within each beat in the healthy control, so the result depended on the
  // beat phase the run happened to end on: 4.80 (pass) originally, -0.50
  // (fail) after an unrelated baroreflex change moved the control's HR by
  // 1.4 bpm with the tamponade arm byte-identical. It now compares Pra
  // averaged over the last 100 s. MEASURED: mean rise ~3.6 mmHg against
  // 0.75 x periDelta = 7.5. The full alpha is not reached because the
  // restrained atrium also fills less (its own volume term falls), so the
  // assertion is two-sided on a fraction: the rise is in the right direction
  // and between 30% and 100% of the alpha prediction, i.e. the reported
  // pressure carries the shared P_peri term and is not a disagreeing pathway.
  const praMean = (scen) => {
    const s = { scen, t: 0, doses: [], given: {}, activePatientId: null }; const xs = [];
    for (let t = STEP; t <= 1800; t += STEP) { s.t = t; physio(s); const p = activePatient(s); pinTraitsNeutral(p); if (t > 1700) xs.push(p.fourChamberLoop?.Pra ?? 0); }
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  };
  const periDelta = tamp.after.pericardialP - healthy.after.pericardialP;
  const praDelta = praMean("pericardialTamponade") - praMean("abdPain");
  const predictedPraDelta = 0.75 * periDelta;
  const invarianceOk = periDelta > 2 && praDelta > 0.3 * predictedPraDelta && praDelta < predictedPraDelta;
  console.log(`  ${invarianceOk ? "PASS" : "FAIL"}: mean RA pressure rise (${praDelta.toFixed(2)}) is 30-100% of the pericardial-pressure prediction (${predictedPraDelta.toFixed(2)} from periRA's 0.75 coefficient)`);
  if (invarianceOk) pass++; else { fail++; failures.push("Refsum transmural-invariance (simplified)"); }
}

console.log("\n[SYMPTOMATIC BRADYCARDIA — cardiac conditions batch, physiology queue item 7]");
{
  // Real scenario (CARD-032). A pure hrBase-driven chronotropic defect, kept
  // deliberately separate from the AV BLOCK section's avNodalDisease axis —
  // see the condition's own comment for why that distinction is the actual
  // teaching point.
  //
  // TWO BUGS FOUND WRITING THIS SECTION, both self-inflicted and both fixed
  // before shipping. (1) settle:300/run:300 for every arm — the EXACT same
  // probe()-run-is-absolute-not-a-duration mistake the AV BLOCK section's
  // own comment, two sections above this one, already warns about; the
  // post-dose loop never executed, so every "treated" arm was silently
  // identical to untreated. Fixed to run:600 (300s of real post-dose time).
  // (2) A first attempt built a "healthy" control by mutate()-ing hrBase
  // back to 75 on this scenario's own patient — measured IDENTICAL to
  // untreated (co 3.584 -> 3.584) because probe()'s mutate runs AFTER
  // physio(s) each tick, but this condition's own progress() runs INSIDE
  // physio(s) and sets hrBase=38 again before the next tick's cardiovascular
  // update ever sees the mutated 75. mutate() is built for imposing a
  // substrate a scenario does NOT already fight every tick (pacing on a
  // scenario with no bradycardia mechanism of its own); it cannot override
  // an ACTIVE condition's own per-tick write, so it was dropped here in
  // favor of the same plain abdPain reference every other section in this
  // file already uses for "healthy."
  const healthy   = probe({ scen: "abdPain", settle: 300, run: 600 });
  const untreated = probe({ scen: "symptomaticBradycardia", settle: 300, run: 600 });
  const atropine  = probe({ scen: "symptomaticBradycardia", settle: 300, run: 600, apply: ["atropine"] });
  const paced     = probe({ scen: "symptomaticBradycardia", settle: 300, run: 600, apply: ["pacing"], reapply: 9999 });

  {
    const ok = untreated.patient.rhythm === "sinus";
    ok ? pass++ : fail++;
    if (!ok) failures.push(`symptomaticBradycardia changed rhythm classification: ${untreated.patient.rhythm} (expected sinus — a rate defect, not a conduction one)`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${"stays sinus rhythm (rate defect, not conduction)".padEnd(46)} rhythm = ${untreated.patient.rhythm}`);
  }
  assertVersus("symptomatic bradycardia collapses cardiac output", untreated, healthy, "co", "down", 1.5);
  // Atropine is vagolytic and the SA node is still vagally modulated even
  // when diseased — the opposite clinical claim from thirdDegreeAVBlock's
  // "does essentially nothing," and the actual point of building this as a
  // separate condition rather than a milder avNodalDisease.
  assertVersus("atropine gives a real, partial rescue (vs CHB's none)", atropine, untreated, "hr", "up", 8);
  assertVersus("...and cardiac output partially recovers with it", atropine, untreated, "co", "up", 0.2);
  assertVersus("pacing captures and imposes a controlled rate", paced, untreated, "hr", "up", 15);
}

console.log("\n[SECOND-DEGREE AV BLOCK — cardiac conditions batch, physiology queue item 7]");
{
  const healthy = probe({ scen: "abdPain", settle: 300, run: 300 });
  const typeI = probe({ scen: "secondDegreeAVBlockTypeI", settle: 300, run: 300 });
  const typeIAtropine = probe({ scen: "secondDegreeAVBlockTypeI", settle: 300, run: 600, apply: ["atropine"] });
  const typeII = probe({ scen: "secondDegreeAVBlockTypeII", settle: 300, run: 300 });
  const typeIIAtropine = probe({ scen: "secondDegreeAVBlockTypeII", settle: 300, run: 600, apply: ["atropine"] });
  const typeIIPaced = probe({ scen: "secondDegreeAVBlockTypeII", settle: 300, run: 600, apply: ["pacing"], reapply: 9999 });

  for (const [label, r] of [["Type I", typeI], ["Type II", typeII]]) {
    const ok = r.patient.rhythm === "sinus";
    ok ? pass++ : fail++;
    if (!ok) failures.push(`${label} changed rhythm classification: ${r.patient.rhythm} (expected sinus)`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${`${label} stays sinus rhythm (rate defect, not chb)`.padEnd(46)} rhythm = ${r.patient.rhythm}`);
  }
  assertVersus("Type I depresses cardiac output", typeI, healthy, "co", "down", 1.0);
  assertVersus("Type II depresses cardiac output MORE than Type I", typeII, typeI, "co", "down", 0.3);
  // Type I's atropine response must be REAL (the vagal component clears);
  // Type II's own avConduction must NOT improve (the structural deficit is
  // untouched) even though its sinus rate can still rise a little — see the
  // condition's own comment for why that is the correct, subtler finding.
  assertVersus("Type I: atropine gives a real, vagally-mediated improvement", typeIAtropine, typeI, "avConduction", "up", 0.01);
  {
    const d = Math.abs(typeIIAtropine.patient.avConduction - typeII.patient.avConduction);
    const ok = d < 0.01;
    ok ? pass++ : fail++;
    if (!ok) failures.push(`Type II avConduction moved by ${d.toFixed(4)} with atropine (expected <0.01, i.e. the structural deficit itself does not improve)`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${"Type II: atropine does NOT improve the underlying block".padEnd(46)} avConduction ${typeII.patient.avConduction.toFixed(3)} (untreated) -> ${typeIIAtropine.patient.avConduction.toFixed(3)} (atropine)`);
  }
  // PACEMAKER SYNDROME (queue item 1, Phase 3) changed the real answer here,
  // not just the number. This assertion used to require CO to rise by >=0.5
  // with pacing, back when the engine had NO atrial-kick-loss mechanism at
  // all — pacing only ever helped, by construction. Phase 3 added a real,
  // literature-anchored ventricular-compliance-scaled CO penalty for
  // AV-dissociated rhythms (complete heart block AND ventricular pacing
  // without atrial capture both qualify), and this scenario's own patient
  // (74F, real age-driven diastolic stiffness via pat.ageProfile.isElderly())
  // is exactly the population pacemaker syndrome is best documented in.
  // MEASURED (not assumed): HR is captured and imposed correctly (+31.5,
  // unchanged, still asserted below), but CO genuinely does NOT improve
  // (3.14 -> 3.00, a real, small NET LOSS) once the lost atrial kick's
  // compliance-scaled discount is accounted for — a real pacemaker-syndrome
  // finding, not a regression, for a patient whose underlying rate (38.5)
  // was not dangerously slow to begin with (contrast the thirdDegreeAVBlock
  // scenario elsewhere in this file, whose escape rate IS dangerously slow,
  // where pacing still raises CO substantially even with this same new
  // mechanism applied — see that section's own unchanged >=0.8 assertion).
  // The old ">=0.5 up" claim was a property of the OLD, incomplete model;
  // asserting it here now would mean tuning the new mechanism to make a
  // stale expectation pass rather than trusting the more complete physiology
  // (lesson 4). Reframed to what pacing genuinely, reliably does for this
  // patient: captures and controls the rate WITHOUT causing CO to collapse
  // further — the real, defensible claim, rather than an overstated one.
  assertVersus("Type II: pacing captures a controlled rate", typeIIPaced, typeII, "hr", "up", 15);
  {
    const d = typeIIPaced.patient.co - typeII.patient.co;
    const ok = d > -1.0; // does not collapse further, even though it may not clearly improve
    ok ? pass++ : fail++;
    if (!ok) failures.push(`Type II pacing collapsed CO by ${(-d).toFixed(2)} (expected not to fall by more than 1.0)`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${"Type II: pacing does not collapse output further (pacemaker-syndrome-adjacent)".padEnd(46)} co ${typeII.patient.co.toFixed(2)} (untreated) -> ${typeIIPaced.patient.co.toFixed(2)} (paced)`);
  }
}

console.log("\n[HYPERTENSIVE URGENCY / EMERGENCY — cardiac conditions batch, physiology queue item 7]");
{
  const healthy = probe({ scen: "abdPain", settle: 600, run: 600 });
  const urgency = probe({ scen: "hypertensiveUrgency", settle: 600, run: 600 });
  const emergency = probe({ scen: "hypertensiveEmergency", settle: 600, run: 600 });
  assertVersus("hypertensive urgency raises blood pressure", urgency, healthy, "sbp", "up", 20);
  assertVersus("hypertensive emergency raises pressure MORE than urgency", emergency, urgency, "sbp", "up", 5);
  assertNonZero("hypertensive emergency drives real pulmonary edema", emergency, "edema", 0.15);
  {
    const ok = (urgency.patient.edema || 0) < 0.05;
    ok ? pass++ : fail++;
    if (!ok) failures.push(`hypertensive urgency drove edema=${(urgency.patient.edema||0).toFixed(3)} (expected <0.05 — urgency has no end-organ damage by definition)`);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${"...while urgency (no end-organ damage) drives none".padEnd(46)} edema = ${(urgency.patient.edema || 0).toFixed(3)}`);
  }
}

console.log("\n[TAKOTSUBO — stress cardiomyopathy]");
{
  // Baseline: the takotsubo ventricle is stunned — EF is depressed to the
  // registry mean (~40%) versus a matched non-takotsubo chest-pain patient
  // (~50%). This is the whole-chamber consequence of the apical Gi stunning.
  // Control scenario is `acs` (troponin-positive but pre-necrosis chest pain,
  // no valve lesion) — NOT `chest` (that key IS the aorticDissection
  // scenario, which as of queue item V2-24(b) carries a real aortic
  // regurgitation lesion of its own and depresses its own EF to ~0.35,
  // which would make it a confounded control for a stunning-specific
  // comparison).
  const tts = probe({ scen: "takotsubo", settle: 300, run: 300 });
  const ctl = probe({ scen: "acs", settle: 300, run: 300 });
  assertVersus("takotsubo depresses ejection fraction", tts, ctl, "ef", "down", 0.08);
  assertNonZero("takotsubo stunning state is active", tts, "takotsuboStun", 0.5);
  assertNonZero("takotsubo prolongs QTc (torsades substrate)", tts, "qtcConditionOffset", 0.03);

  // THE PARADOX, two-sided. Epinephrine WORSENS the takotsubo ventricle
  // (drives the beta-2 Gi arm) but IMPROVES a non-takotsubo failing heart
  // (normal Gs inotropy). The same drug, opposite sign, decided entirely by
  // whether the takotsubo state is present — no rule, it falls out of the
  // biphasic term. cardiogenicShock is the non-takotsubo low-output control.
  const ttsEpi = probe({ scen: "takotsubo", settle: 240, run: 480, apply: ["pushEpi"], reapply: 200 });
  assertVersus("epinephrine WORSENS takotsubo EF", ttsEpi, tts, "ef", "down", 0.05);

  const shock    = probe({ scen: "cardiogenicShock", settle: 240, run: 480 });
  const shockEpi = probe({ scen: "cardiogenicShock", settle: 240, run: 480, apply: ["pushEpi"], reapply: 200 });
  assertVersus("epinephrine IMPROVES a non-takotsubo failing heart", shockEpi, shock, "contractility", "up", 0.02);

  // Beta-blockade RESCUES an epinephrine-worsened takotsubo ventricle by
  // opposing the exogenous adrenergic drive. (Given alone with no catecholamine
  // to oppose, a beta-blocker's mild intrinsic negative inotropy means its
  // benefit is context-dependent — the clinical evidence for beta-blockers in
  // takotsubo is in fact mixed, InterTAK found no recurrence reduction; the
  // mechanistic rescue asserted here is the acute anti-catecholamine effect.)
  const ttsEpiBB = probe({ scen: "takotsubo", settle: 240, run: 560, apply: ["pushEpi", "metoprolol"], reapply: 200 });
  assertVersus("beta-blockade rescues epi-worsened takotsubo", ttsEpiBB, ttsEpi, "contractility", "up", 0.05);

  // Specificity: the stunning is gated on the takotsubo state. The cardiogenic
  // shock control above already carries a low EF by a DIFFERENT mechanism
  // (contractilityFactor), and it does NOT carry the takotsubo stunning state —
  // so a future edit that made the Gi term fire on any low-output patient would
  // trip this.
  assertVersus("non-takotsubo shock has no stunning state", tts, shock, "takotsuboStun", "up", 0.5);
}

console.log("\n[VAGAL MANEUVER]");
{
  const r = probe({ scen: "svt", apply: ["valsalva"], reapply: 40 });
  assertNonZero("Valsalva -> vagal surge declared", r, "vagalSurge", 0.2);
  assertMoved("Valsalva -> parasympathetic outflow rises", r, "parasympathetic", "up", 0.05);
}

console.log("\n[HEMORRHAGE CONTROL]");
{
  const r = probe({ scen: "abdGSW", apply: ["pack"] });
  assertMoved("wound packing -> bleeding rate falls", r, "activeBleedRate", "down", 0.05);
  const r2 = probe({ scen: "abdGSW", apply: ["tq"] });
  assertMoved("tourniquet -> bleeding stops", r2, "activeBleedRate", "down", 0.05);
}

console.log("\n[LIMB-SPECIFIC HEMORRHAGE CONTROL — queue item 74, Phase 1]");
{
  // "motorcycle" (polytraumaMoto) presents with THREE simultaneously
  // bleeding locations (legL open femur, torso sucking chest wound, head
  // scalp laceration) — exactly the multi-site case a whole-body-only
  // tourniquet mechanism cannot distinguish, and the real regression a
  // located tourniquet must NOT introduce (it must leave torso/head alone).
  function limbProbe(doseExtra) {
    const s = { scen: "motorcycle", t: 0, doses: [], given: {}, activePatientId: null };
    for (let T = STEP; T <= 60; T += STEP) { s.t = T; physio(s); pinTraitsNeutral(activePatient(s)); }
    const before = snapshot(activePatient(s));
    if (doseExtra !== null) s.doses.push({ id: "tq", at: s.t + STEP, ...doseExtra });
    for (let T = 62; T <= 120; T += STEP) { s.t = T; physio(s); }
    return { before, after: snapshot(activePatient(s)) };
  }

  const located = limbProbe({ location: "legL" });
  const legLContribution = 0.12; // laceration major bleed coefficient, wounds.js — measured, not assumed
  const expectedAfter = located.before.activeBleedRate - legLContribution;
  const locatedOk = Math.abs(located.after.activeBleedRate - expectedAfter) < 0.01;
  locatedOk ? pass++ : fail++;
  if (!locatedOk) failures.push(`located tourniquet on legL: expected activeBleedRate ~${expectedAfter.toFixed(3)} (only legL's contribution removed), got ${located.after.activeBleedRate.toFixed(3)}`);
  console.log(`  ${locatedOk ? "PASS" : "FAIL"}  ${"tourniquet on legL -> ONLY legL's bleed stops".padEnd(46)} activeBleedRate ${located.before.activeBleedRate.toFixed(3)} -> ${located.after.activeBleedRate.toFixed(3)}`);

  const stillBleeding = located.after.activeBleedRate > 0.15; // torso (0.08) + head (0.02) should both survive
  stillBleeding ? pass++ : fail++;
  if (!stillBleeding) failures.push(`torso/head wounds should still be bleeding after a legL-only tourniquet, got activeBleedRate=${located.after.activeBleedRate.toFixed(3)}`);
  console.log(`  ${stillBleeding ? "PASS" : "FAIL"}  ${"...while the torso/head wounds keep bleeding".padEnd(46)} activeBleedRate = ${located.after.activeBleedRate.toFixed(3)}`);

  // BACK-COMPAT: a dose with no `location` at all (every existing scenario/
  // test/front-end caller today, including REBOA's own aorticOcclusion
  // use of the SAME stopsBleed flag) must reproduce the OLD whole-body-zero
  // behavior exactly, unchanged.
  const unlocated = limbProbe({});
  const backCompatOk = unlocated.after.activeBleedRate === 0;
  backCompatOk ? pass++ : fail++;
  if (!backCompatOk) failures.push(`an unlocated tourniquet dose must still zero the whole-body activeBleedRate exactly (back-compat), got ${unlocated.after.activeBleedRate}`);
  console.log(`  ${backCompatOk ? "PASS" : "FAIL"}  ${"...but an UNLOCATED tourniquet still stops everything".padEnd(46)} activeBleedRate ${unlocated.before.activeBleedRate.toFixed(3)} -> ${unlocated.after.activeBleedRate}`);
}

console.log("\n[RENIN-ANGIOTENSIN REGULATOR]");
{
  // The regulator must be OFF in a patient who needs no regulating, and must
  // engage when volume is lost. Before the loop was fixed it self-activated:
  // renin sat at 0.67 with 40% afferent constriction in a healthy normotensive
  // patient, holding resting GFR at 59% of baseline.
  const healthy = probe({ scen: "abdPain", settle: 300, run: 900 });
  assertNonZero("healthy patient -> GFR at its own baseline", healthy, "gfrFraction", 0.85);
  const bleeding = probe({ scen: "abdGSW", settle: 120, run: 420 });
  assertVersus("volume loss -> renin secreted", bleeding, healthy, "renin", "up", 0.05);
  assertVersus("renin -> afferent arteriole constricts", bleeding, healthy, "afferentConstriction", "up", 0.02);

  // MACULA DENSA / TUBULOGLOMERULAR FEEDBACK (queue item 14). A salt-depleted
  // but volume-replete/normotensive patient previously could not activate
  // RAAS at all — nothing here read serum sodium. Two-sided: the new term
  // must fire on hyponatremia alone (imposed via mutate — this engine has no
  // stock salt-wasting scenario to settle into), AND must NOT be what fires
  // for ordinary hemorrhage, since bleeding in this engine is isotonic and
  // does not move serum sodium (patient.js's own naMass note) — confirmed by
  // checking the bleeding-control run's sodium barely moved while its renin
  // rise (asserted above) still occurred.
  const hyponatremic = probe({ scen: "abdPain", settle: 30, run: 1230,
    mutate: (p) => { p.na = 122; } });
  assertVersus("hyponatremia alone -> renin secreted", hyponatremic, healthy, "renin", "up", 0.1);
  assertVersus("hyponatremia alone -> aldosterone rises", hyponatremic, healthy, "aldosterone", "up", 0.1);
  const naDrift = Math.abs(bleeding.after.na - 140);
  const naOk = naDrift < 2;
  naOk ? pass++ : fail++;
  if (!naOk) failures.push(`hemorrhage must not move serum sodium (isotonic loss), drifted ${naDrift.toFixed(2)}`);
  console.log(`  ${naOk ? "PASS" : "FAIL"}  ${"hemorrhage does NOT move serum sodium (isotonic)".padEnd(46)} na drift ${naDrift.toFixed(2)}`);
}

console.log("\n[INCREASED ICP / CUSHING REFLEX — queue item 7, Neurologic]");
{
  const icpCond = probe({ scen: "increasedICPHeadacheVomiting", settle: 2, run: 900 });
  assertMoved("increased ICP -> icpMassEffect climbs untreated", icpCond, "icpMassEffect", "up", 0.05);
  assertMoved("increased ICP -> icp itself rises", icpCond, "icp", "up", 2);

  // Cushing reflex: force a severe mass effect directly and confirm the
  // paradoxical alpha (pressor) + vagal (bradycardic) response engages.
  // MEASURED: this is a real, self-correcting NEGATIVE FEEDBACK loop — the
  // reflex raises MAP, which restores CPP, which reduces cushingSeverity,
  // resolving the response within ~10-15s in this probe (icp=49 initially
  // driving cushingAlpha to 1.5/vagalSurge to 0.8, cpp climbing 27->94,
  // response back to 0 by the run's own end). A single before/after
  // snapshot at a fixed late endpoint therefore misses it entirely — this
  // tracks the PEAK response across the transient window instead, which is
  // what actually confirms the mechanism engaged.
  {
    const s = { scen: "abdPain", t: 0, doses: [], given: {}, activePatientId: null };
    for (let T = 2; T <= 6; T += 2) { s.t = T; physio(s); }
    let peakAlpha = 0, peakVagal = 0;
    for (let T = 8; T <= 30; T += 2) {
      s.t = T;
      const p = activePatient(s);
      p.icpMassEffect = 1;
      physio(s);
      const p2 = activePatient(s);
      peakAlpha = Math.max(peakAlpha, p2._cushingAlpha || 0);
      peakVagal = Math.max(peakVagal, p2.vagalSurge || 0);
    }
    const alphaOk = peakAlpha >= 0.3;
    alphaOk ? pass++ : fail++;
    if (!alphaOk) failures.push(`severe ICP should engage a real Cushing pressor response, peak cushingAlpha=${peakAlpha.toFixed(3)}`);
    console.log(`  ${alphaOk ? "PASS" : "FAIL"}  ${"severe ICP -> Cushing pressor response engages (peak)".padEnd(46)} peak cushingAlpha = ${peakAlpha.toFixed(3)}`);
    const vagalOk = peakVagal >= 0.2;
    vagalOk ? pass++ : fail++;
    if (!vagalOk) failures.push(`severe ICP should engage a real Cushing vagal response, peak vagalSurge=${peakVagal.toFixed(3)}`);
    console.log(`  ${vagalOk ? "PASS" : "FAIL"}  ${"severe ICP -> Cushing vagal (bradycardic) response engages (peak)".padEnd(46)} peak vagalSurge = ${peakVagal.toFixed(3)}`);
  }

  // HEAD-OF-BED ELEVATION — queue item 70. Previously a documented no-op:
  // pat.icp existed but nothing modeled elevation reducing it, so a
  // crew-directed "raise the head of the bed" task had nothing to do.
  const headUntreated = probe({ scen: "increasedICPHeadacheVomiting", settle: 2, run: 120 });
  const headElevated = probe({ scen: "increasedICPHeadacheVomiting", settle: 2, run: 120, apply: ["headElevate"] });
  assertVersus("head-of-bed elevation -> real, modest ICP reduction", headElevated, headUntreated, "icp", "down", 2);
  const healthyHeadUntreated = probe({ scen: "abdPain", settle: 2, run: 120 });
  const healthyHeadElevated = probe({ scen: "abdPain", settle: 2, run: 120, apply: ["headElevate"] });
  assertVersus("...same modest reduction in a healthy control (no pathology, no side effect)", healthyHeadElevated, healthyHeadUntreated, "icp", "down", 2);
}

console.log("\n[NOREPINEPHRINE OVERDOSE — queue item 55, seventh drug]");
{
  // Unlike amiodarone, norepi's own receptor coefficients (alpha:1.0,
  // beta1:0.3) WERE found saturated almost immediately at any IV-push-scale
  // dose (see conditions.js's own comment for the 1/5/20/40/80-unit sweep) —
  // the same shape of ceiling diltiazem/metoprolol/atropine already
  // documented, just saturating even harder. Asserted accordingly: presence
  // + specificity + the honest "not a scaling toxidrome" finding, no
  // dose-response claim.
  const nOd = probe({ scen: "norepinephrineOverdose", settle: 30, run: 600 });
  const control = probe({ scen: "abdPain", settle: 30, run: 600 });
  const presentOk = nOd.after.sbp > control.after.sbp + 40 && nOd.after.alphaTone > control.after.alphaTone + 0.3;
  presentOk ? pass++ : fail++;
  if (!presentOk) failures.push(`norepinephrineOverdose should present with a severe hypertensive emergency vs control, got sbp=${nOd.after.sbp} (control ${control.after.sbp}) alphaTone=${nOd.after.alphaTone} (control ${control.after.alphaTone})`);
  console.log(`  ${presentOk ? "PASS" : "FAIL"}  ${"norepinephrineOverdose -> severe hypertensive emergency".padEnd(46)} sbp=${nOd.after.sbp.toFixed(1)} (control ${control.after.sbp.toFixed(1)}) alphaTone=${nOd.after.alphaTone.toFixed(2)}`);

  // Specificity: a condition-less control never reaches this alphaTone/sbp
  // range on its own.
  const specOk = control.after.sbp < 140 && control.after.alphaTone < 0.5;
  specOk ? pass++ : fail++;
  if (!specOk) failures.push(`condition-less control should not show a hypertensive-emergency picture, got sbp=${control.after.sbp} alphaTone=${control.after.alphaTone}`);
  console.log(`  ${specOk ? "PASS" : "FAIL"}  ${"...specificity: condition-less control shows no such picture".padEnd(46)} sbp=${control.after.sbp.toFixed(1)} alphaTone=${control.after.alphaTone.toFixed(2)}`);

  // Severity scales with the infusion rate (norepinephrine now has label
  // clearance and a non-saturating ec50): a 10x smaller pump error (0.1 mg/min), seeded
  // the same way, must give a clearly smaller pressor effect.
  const s30 = { scen: "abdPain", t: 0, doses: [], given: {}, activePatientId: null };
  for (let T = STEP; T <= 180; T += STEP) { s30.t = T; physio(s30); pinTraitsNeutral(activePatient(s30)); }
  {
    const p30 = activePatient(s30);
    for (let m = 0; m < 10; m++) p30.drugInstances.push(seedPastDose(p30, "norepi", 0.1, m));
  }
  for (let T = 182; T <= 600; T += STEP) { s30.t = T; physio(s30); }
  const afterLow = activePatient(s30);
  const scaleOk = nOd.after.sbp > afterLow.sbp + 20;
  scaleOk ? pass++ : fail++;
  if (!scaleOk) failures.push(`norepinephrineOverdose severity should scale with infusion rate, overdose sbp=${nOd.after.sbp} vs 10x lower rate sbp=${afterLow.sbp}`);
  console.log(`  ${scaleOk ? "PASS" : "FAIL"}  ${"...severity scales with the pump-error rate".padEnd(46)} overdose sbp=${nOd.after.sbp.toFixed(1)} vs 10x lower ${afterLow.sbp.toFixed(1)}`);

  // No specific antidote (phentolamine) exists in this formulary
  // (grep-confirmed) — this section is presence/specificity/dose-scaling,
  // the same honest framing amiodaroneOverdose's own section established.
}

console.log("\n[PORTAL HYPERTENSION / CIRRHOSIS — queue item V2-13]");
{
  // Queue item V2-13's real portal-pressure/portal-flow mechanism
  // (renal.js): a real, condition-owned pat.portalPressure (HVPG-
  // equivalent mmHg) drives splanchnic vasodilation and venous-
  // capacitance expansion, which the kidney's already-real capacitance-
  // aware defended-volume mechanism reads as underfilling -> real,
  // measured RAAS/ADH activation. mutate forces the same 12 mmHg
  // (clinically-significant-portal-hypertension-plus-margin) the shipped
  // `cirrhosis` condition itself sets, per this suite's own established
  // idiom of forcing the exact field a condition would set rather than
  // running the condition object (see chronicKidneyDisease/liverInjury/
  // capillaryLeak's own mutate: entries above).
  const healthy = probe({ scen: "abdPain", settle: 180, run: 1980 });
  const portal = probe({ scen: "abdPain", settle: 180, run: 1980,
    mutate: (p) => { p.portalPressure = 12; } });

  // Presence: a real, measurable splanchnic vasodilation and venous-
  // capacitance expansion, absent below the CSPH threshold in a healthy
  // control (specificity guaranteed by construction — see renal.js's own
  // comment: pp<=5 forces the term to exactly zero).
  assertVersus("portalPressure -> real splanchnic vasodilation", portal, healthy, "vasodilation", "up", 0.05);
  assertVersus("...-> real venous-capacitance expansion", portal, healthy, "venousCapacitanceFactor", "up", 0.05);
  const specific = healthy.after.vasodilation === 0 && healthy.after.portalPressure === 0;
  specific ? pass++ : fail++;
  if (!specific) failures.push(`a condition-less control should show exactly zero portalPressure/vasodilation contamination, got portalPressure=${healthy.after.portalPressure}, vasodilation=${healthy.after.vasodilation}`);
  console.log(`  ${specific ? "PASS" : "FAIL"}  ${"...healthy control stays at exactly zero (specificity)".padEnd(46)} vasodilation ${healthy.after.vasodilation}, portalPressure ${healthy.after.portalPressure}`);

  // The actual point of the mechanism: this reaches the ALREADY-REAL RAAS
  // machinery (renal.js's own renin/angiotensinII/aldosterone chain,
  // unmodified by this batch) through the SAME defended-volume pathway
  // hemorrhage/pregnancy already use — not a new, parallel RAAS trigger.
  // Measured over a real 33-minute window (long enough for renin's own
  // ~10-minute relaxation time constant to show real separation from a
  // healthy control, whose own renin is simultaneously DECAYING toward a
  // resting baseline over the same window — a genuine two-sided
  // divergence, not just "portal patient has nonzero renin").
  assertVersus("...reaches real RAAS: renin rises vs a decaying control", portal, healthy, "renin", "up", 0.005);
  assertVersus("...-> real angiotensin II activation", portal, healthy, "angiotensinII", "up", 0.01);
  assertVersus("...-> real aldosterone activation", portal, healthy, "aldosterone", "up", 0.005);

  // Real fluid retention, measured RELATIVELY against a matched control
  // over a real 3-hour window (long enough for the RAAS/ADH activation
  // above to have a real effect on renal water/salt handling) — not an
  // absolute totalBloodVol rise, since this engine has a separate, already
  // -documented baseline downward drift for EVERY patient (queue item 75,
  // an open V2-31 finding unrelated to this mechanism). The honest,
  // measurable claim is that a portal-hypertensive patient loses LESS
  // blood volume than an otherwise-identical control over the same
  // window — real, RAAS-driven relative fluid retention, not an invented
  // absolute-volume claim this engine's own known drift would falsify.
  const healthy3h = probe({ scen: "abdPain", settle: 180, run: 3 * 3600 + 180 });
  const portal3h = probe({ scen: "abdPain", settle: 180, run: 3 * 3600 + 180,
    mutate: (p) => { p.portalPressure = 12; } });
  const healthyLoss = healthy3h.before.totalBloodVol - healthy3h.after.totalBloodVol;
  const portalLoss = portal3h.before.totalBloodVol - portal3h.after.totalBloodVol;
  const retainsMore = portalLoss < healthyLoss - 0.1;
  retainsMore ? pass++ : fail++;
  if (!retainsMore) failures.push(`a portal-hypertensive patient should retain measurably MORE blood volume than a matched control over 3h (real RAAS/ADH-driven fluid retention), got control loss ${healthyLoss.toFixed(3)}L vs portal-patient loss ${portalLoss.toFixed(3)}L`);
  console.log(`  ${retainsMore ? "PASS" : "FAIL"}  ${"...-> real, relative fluid retention over 3h".padEnd(46)} control lost ${healthyLoss.toFixed(3)}L, portal-hypertensive lost only ${portalLoss.toFixed(3)}L`);

  // Hepatic reserve/clearance: `cirrhosis` reuses the ALREADY-REAL
  // organClearanceFactor()/pat.liverInjury mechanism (pk.js) directly —
  // this is a wiring check confirming that reuse, not a new mechanism.
  const cirrhotic = probe({ scen: "abdPain", settle: 180, run: 1980,
    mutate: (p) => { p.liverInjury = Math.max(p.liverInjury || 0, 0.30); } });
  const reserveReduced = cirrhotic.after.liverInjury >= 0.30 && healthy.after.liverInjury === 0;
  reserveReduced ? pass++ : fail++;
  if (!reserveReduced) failures.push(`cirrhosis's reduced hepatic reserve should show as real liverInjury (organClearanceFactor's own already-verified consumer), got cirrhotic=${cirrhotic.after.liverInjury}, healthy control=${healthy.after.liverInjury}`);
  console.log(`  ${reserveReduced ? "PASS" : "FAIL"}  ${"...reduced hepatic reserve reuses real liverInjury/clearance".padEnd(46)} liverInjury: control ${healthy.after.liverInjury}, cirrhotic ${cirrhotic.after.liverInjury}`);

  // Queue item 5's dead-code sweep: pat.splanchnicFrac (patient.js, default
  // 0.33) was written at construction and never read anywhere. Now it's
  // cardiovascular.js's own real mobilization-reserve coefficient for the
  // splanchnic autotransfusion its comment already claimed (see that
  // file's own comment at updateAutonomic), AND this portal-hypertension
  // mechanism narrows it — a chronically dilated splanchnic bed has less
  // venoconstrictor reserve left to mobilize under acute sympathetic
  // drive, a real, documented reason cirrhotics tolerate hemorrhage worse.
  assertVersus("portalPressure -> narrows splanchnicFrac (blunted autotransfusion reserve)", portal, healthy, "splanchnicFrac", "down", 0.005);

  // The actual point: under an IDENTICAL superimposed hemorrhage, a
  // cirrhotic patient's narrower splanchnicFrac means less blood is
  // autotransfused out of the unstressed (splanchnic) pool at a matched
  // alphaTone, so cardiac filling (and therefore pressure) is measurably
  // worse than an otherwise-identical hemorrhaging control — not a
  // decorative field, a real hemodynamic consequence.
  const healthyHem = probe({ scen: "abdPain", settle: 180, run: 900, mutate: (p) => { p.activeBleedRate = 0.2; } });
  const cirrhoticHem = probe({ scen: "abdPain", settle: 180, run: 900, mutate: (p) => { p.activeBleedRate = 0.2; p.portalPressure = 12; } });
  const worseUnderHemorrhage = cirrhoticHem.after.sbp < healthyHem.after.sbp - 0.5;
  worseUnderHemorrhage ? pass++ : fail++;
  if (!worseUnderHemorrhage) failures.push(`a cirrhotic patient should tolerate an identical superimposed hemorrhage measurably WORSE (blunted splanchnic autotransfusion reserve), got healthy-hemorrhage sbp=${healthyHem.after.sbp.toFixed(1)}, cirrhotic-hemorrhage sbp=${cirrhoticHem.after.sbp.toFixed(1)}`);
  console.log(`  ${worseUnderHemorrhage ? "PASS" : "FAIL"}  ${"...-> measurably worse pressure under identical hemorrhage".padEnd(46)} sbp: healthy+bleed ${healthyHem.after.sbp.toFixed(1)}, cirrhotic+bleed ${cirrhoticHem.after.sbp.toFixed(1)}`);

  // QUEUE ITEM V2-13 (this session's own addition) — hepatic SYNTHETIC
  // failure, genuinely distinct from the RAAS/fluid-retention mechanism
  // above: liverInjury reduces the target that coagulation.js's factor
  // regeneration chases (factorII/V/X, fibrinogen), so a cirrhotic patient
  // shows real coagulopathy from reduced PRODUCTION even with zero active
  // consumption/bleeding. Forcing liverInjury directly (not portalPressure)
  // isolates this from the RAAS mechanism above, which is portalPressure-
  // driven and does not touch liverInjury at all.
  const liverFail = probe({ scen: "abdPain", settle: 180, run: 3600,
    mutate: (p) => { p.liverInjury = 0.7; } });
  const liverHealthy = probe({ scen: "abdPain", settle: 180, run: 3600 });
  assertVersus("liverInjury -> real hepatic-synthetic coagulopathy (factorX falls)", liverFail, liverHealthy, "factorX", "down", 1);
  assertVersus("...-> factorII falls too", liverFail, liverHealthy, "factorII", "down", 1);
  assertVersus("...-> real fall in overall clot strength (coagPct)", liverFail, liverHealthy, "coagPct", "down", 1);
  // The real teaching-point divergence: factor VIII is endothelial, not
  // hepatic, synthesis, and is deliberately EXCLUDED from the liverInjury
  // term (coagulation.js's own comment) — a severely liver-failed patient
  // should NOT show a depressed factorVIII from this mechanism alone.
  const viiiSpared = liverFail.after.factorVIII >= liverHealthy.after.factorVIII - 1;
  viiiSpared ? pass++ : fail++;
  if (!viiiSpared) failures.push(`factorVIII should stay essentially unaffected by liverInjury alone (endothelial, not hepatic, synthesis), got healthy=${liverHealthy.after.factorVIII.toFixed(1)}, liver-failed=${liverFail.after.factorVIII.toFixed(1)}`);
  console.log(`  ${viiiSpared ? "PASS" : "FAIL"}  ${"...factorVIII deliberately SPARED (endothelial synthesis)".padEnd(46)} factorVIII: control ${liverHealthy.after.factorVIII.toFixed(1)}, liver-failed ${liverFail.after.factorVIII.toFixed(1)}`);

  // Portal hypertension -> splenic sequestration -> thrombocytopenia, the
  // SECOND real liver-disease coagulation link, mechanistically distinct
  // from synthetic failure above (spleen, not hepatocytes) and from DIC-
  // style consumption elsewhere in this file. Forces portalPressure (not
  // liverInjury), the same field the RAAS mechanism above already uses.
  const csph = probe({ scen: "abdPain", settle: 180, run: 3600,
    mutate: (p) => { p.portalPressure = 12; } });
  assertVersus("portalPressure -> real splenic-sequestration thrombocytopenia", csph, healthy3h, "plateletCount", "down", 5);
  const belowThreshold = probe({ scen: "abdPain", settle: 180, run: 3600,
    mutate: (p) => { p.portalPressure = 4; } });
  const subThresholdSpecific = Math.abs(belowThreshold.after.plateletCount - healthy3h.after.plateletCount) < 1;
  subThresholdSpecific ? pass++ : fail++;
  if (!subThresholdSpecific) failures.push(`portalPressure below the real 5 mmHg portal-hypertension threshold should cause exactly zero sequestration, got control plateletCount=${healthy3h.after.plateletCount.toFixed(1)}, portalPressure=4 plateletCount=${belowThreshold.after.plateletCount.toFixed(1)}`);
  console.log(`  ${subThresholdSpecific ? "PASS" : "FAIL"}  ${"...specificity: below 5 mmHg threshold, exactly zero sequestration".padEnd(46)} plateletCount: control ${healthy3h.after.plateletCount.toFixed(1)}, portalPressure=4 ${belowThreshold.after.plateletCount.toFixed(1)}`);
}

console.log("\n[CATECHOLAMINE RESISTANCE]");
{
  // Norepinephrine infusion (0.25 mcg/kg/min) in septic shock. Adrenergic resistance blunts the pressor
  // response, vasopressin (a non-adrenergic channel) restores it, hydrocortisone partially re-sensitizes.
  const run = ({ doses = [], res = 0, T = 1500 }) => {
    const s = { scen: "septicShock", t: 0, doses: [], given: {}, activePatientId: null, infusions: [{ line: "a", id: "norepi", rate: 0.0185, from: 60, to: null }] };
    for (let t = STEP; t <= T; t += STEP) {
      s.t = t; if (t === 60) for (const d of doses) s.doses.push({ ...d, at: t });
      if (t === STEP) { const p = activePatient(s); pinTraitsNeutral(p); p.alphaResistanceBase = res; p.alphaResistance = res; }
      physio(s);
    }
    const p = activePatient(s); return { map: p.map, res: p.alphaResistance };
  };
  const base = run({}), resist = run({ res: 0.6 }), vaso = run({ res: 0.6, doses: [{ id: "vasopressin" }] });
  const ok1 = resist.map < base.map - 6;
  ok1 ? pass++ : fail++;
  if (!ok1) failures.push(`catecholamine resistance should blunt the norepinephrine MAP response, base ${base.map}, resistant ${resist.map}`);
  console.log(`  ${ok1 ? "PASS" : "FAIL"}  ${"resistance blunts the norepinephrine response".padEnd(46)} base MAP=${base.map.toFixed(0)} resistant=${resist.map.toFixed(0)}`);
  const ok2 = vaso.map > resist.map + 10;
  ok2 ? pass++ : fail++;
  if (!ok2) failures.push(`vasopressin (non-adrenergic) should restore the response despite resistance, resistant ${resist.map}, with vasopressin ${vaso.map}`);
  console.log(`  ${ok2 ? "PASS" : "FAIL"}  ${"vasopressin restores it (immune channel)".padEnd(46)} resistant=${resist.map.toFixed(0)} +vaso=${vaso.map.toFixed(0)}`);
  const angio = run({ res: 0.6, doses: [{ id: "angiotensinII" }] });
  const ok2b = angio.map > resist.map + 8;
  ok2b ? pass++ : fail++;
  if (!ok2b) failures.push(`angiotensin II (AT1, non-adrenergic) should also restore the response, resistant ${resist.map}, with angiotensin II ${angio.map}`);
  console.log(`  ${ok2b ? "PASS" : "FAIL"}  ${"angiotensin II restores it (AT1 channel)".padEnd(46)} resistant=${resist.map.toFixed(0)} +angII=${angio.map.toFixed(0)}`);
  const ctrl = run({ res: 0.6, T: 3000 }), hc = run({ res: 0.6, T: 3000, doses: [{ id: "hydrocortisone" }] });
  const ok3 = hc.res < ctrl.res - 0.04 && hc.map > ctrl.map - 1;
  ok3 ? pass++ : fail++;
  if (!ok3) failures.push(`hydrocortisone should partially re-sensitize, control res ${ctrl.res}, hydrocortisone res ${hc.res}`);
  console.log(`  ${ok3 ? "PASS" : "FAIL"}  ${"hydrocortisone partially re-sensitizes".padEnd(46)} control res=${ctrl.res.toFixed(2)} hydrocortisone res=${hc.res.toFixed(2)}`);
}

console.log("\n[ADENOSINE DOSE-DEPENDENT SVT CONVERSION]");
{
  const conv = (amt) => { let c = 0; for (let i = 0; i < 40; i++) { const s = { scen: "svt", t: 0, doses: [], given: {}, activePatientId: null }; for (let t = STEP; t <= 60; t += STEP) { s.t = t; if (t === 20) s.doses.push({ id: "adenosine", at: t, amount: amt }); physio(s); } if (activePatient(s).rhythm !== "svt") c++; } return c; };
  const c6 = conv(6), c12 = conv(12);
  const ok = c6 >= 14 && c6 <= 34 && c12 > c6 && c12 >= 30;
  ok ? pass++ : fail++;
  if (!ok) failures.push(`adenosine conversion should be ~60% at 6 mg and ~90% at 12 mg, got ${c6}/40 and ${c12}/40`);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${"6 mg converts some SVT, 12 mg converts more".padEnd(46)} 6mg=${c6}/40 12mg=${c12}/40`);
}

console.log("\n[VALSALVA TECHNIQUE]");
{
  // Strain quality scales the vagal surge: a modified (leg-raise) Valsalva converts SVT more often
  // than a standard one, and a weak strain (quality 0.3) almost never does.
  const conv = (quality, legRaise) => { let c = 0; for (let i = 0; i < 30; i++) { const s = { scen: "svt", t: 0, doses: [], given: {}, activePatientId: null }; for (let t = STEP; t <= 60; t += STEP) { s.t = t; if (t === 20) s.doses.push({ id: "valsalva", at: t, quality, legRaise }); physio(s); } if (activePatient(s).rhythm !== "svt") c++; } return c; };
  const weak = conv(0.3, false), mod = conv(1, true);
  const ok = mod > weak + 3 && weak <= 3;
  ok ? pass++ : fail++;
  if (!ok) failures.push(`Valsalva technique should matter: weak ${weak}/30, modified ${mod}/30`);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${"modified Valsalva beats a weak strain".padEnd(46)} weak=${weak}/30 modified=${mod}/30`);
}

console.log("\n[CONTINUOUS INFUSION (pump state, zero-order input)]");
{
  // A pump line in s.infusions drives a zero-order mass input into the
  // central compartment. Checks: plateau at Css = rate/kel, a real pressor
  // effect, washout after the stop, and that a curve-model drug line is
  // ignored instead of crashing or doing something.
  const run = (id, perKgMin, stopAt, total) => {
    const s = { scen: "abdPain", t: 0, doses: [], infusions: [], given: {}, activePatientId: null };
    const out = {};
    for (let T = STEP; T <= total; T += STEP) {
      s.t = T;
      const p0 = activePatient(s);
      if (T === 182) s.infusions.push({ line: "A", id, rate: infusionRateMgPerMin(null, perKgMin, p0.weight ?? 74), from: 182, to: stopAt });
      physio(s);
      const p = activePatient(s);
      if (T === STEP) pinTraitsNeutral(p);
      out[T] = { map: p.map, central: p.drugInstances.filter(d => d.id === id).reduce((a, d) => a + d.central, 0), w: p.weight ?? 74 };
    }
    return out;
  };
  const ne = run("norepi", 0.1, 900, 1200);
  const base = run("norepi", 0, 900, 300);   // rate 0 line: control
  const kelNe = PK_PARAMS.norepi.kel;
  const css = infusionRateMgPerMin(null, 0.1, ne[900].w) / kelNe;
  const cssOk = Math.abs(ne[900].central - css) / css < 0.25;
  cssOk ? pass++ : fail++;
  if (!cssOk) failures.push(`infusion should plateau near Css=rate/kel=${css.toFixed(4)}, got central ${ne[900].central.toFixed(4)}`);
  console.log(`  ${cssOk ? "PASS" : "FAIL"}  ${"norepinephrine infusion plateaus near rate/kel".padEnd(46)} central=${ne[900].central.toFixed(4)} Css=${css.toFixed(4)}`);

  const dMap = ne[900].map - base[180].map;
  const effOk = dMap > 8 && dMap < 25;
  effOk ? pass++ : fail++;
  if (!effOk) failures.push(`0.1 mcg/kg/min norepinephrine should raise MAP about 10-20 mmHg, got ${dMap.toFixed(1)}`);
  console.log(`  ${effOk ? "PASS" : "FAIL"}  ${"...raises MAP by a clinical amount (~10-20 mmHg)".padEnd(46)} dMAP=${dMap.toFixed(1)}`);

  const washOk = ne[1200].central < 0.3 * ne[900].central;
  washOk ? pass++ : fail++;
  if (!washOk) failures.push(`drug should wash out after the pump stops, central ${ne[900].central.toFixed(4)} -> ${ne[1200].central.toFixed(4)}`);
  console.log(`  ${washOk ? "PASS" : "FAIL"}  ${"...washes out after the pump stops (5 min)".padEnd(46)} central ${ne[900].central.toFixed(4)} -> ${ne[1200].central.toFixed(4)}`);

  // A curve-model drug (phenylephrine, 0.54 mcg/kg/min = 40 mcg/min) runs on the pump through its own relaxing effect level
  // (drugs.js `infusion`): it raises pressure steadily where a bolus would fade, and washes out when stopped.
  const curveLine = run("phenylephrine", 0.54, 900, 500), curveCtl = run("phenylephrine", 0, 900, 500);
  const curveOk = Number.isFinite(curveLine[500].map) && curveLine[500].map > curveCtl[500].map + 8;
  curveOk ? pass++ : fail++;
  if (!curveOk) failures.push(`a phenylephrine pump line should raise MAP steadily, with ${curveLine[500].map}, control ${curveCtl[500].map}`);
  console.log(`  ${curveOk ? "PASS" : "FAIL"}  ${"...curve-model drug (phenylephrine) pump raises MAP".padEnd(46)} MAP ${curveCtl[500].map.toFixed(0)} -> ${curveLine[500].map.toFixed(0)}`);
}

console.log("\n[ONE MOLECULE, ONE MECHANISM]");
{
  // Epinephrine is one drug whether it is labeled for arrest, a push-dose pressor or
  // anaphylaxis: the same amount by the same route must do the same thing, and a
  // player's arbitrary draw (half a milligram of morphine) must still act, scaled.
  const at = (scen, doses, T) => {
    const s = { scen, t: 0, doses: [], given: {}, activePatientId: null };
    for (let t = STEP; t <= T; t += STEP) { s.t = t; for (const d of doses) if (d.at === t) s.doses.push({ ...d }); physio(s); if (t === STEP) pinTraitsNeutral(activePatient(s)); }
    const p = activePatient(s); return { sbp: p.sbp, hr: p.hr, pain: p.drugPain ?? p.pain };
  };
  const a = at("abdPain", [{ id: "epiIV", at: 180, amount: 0.1, route: "IV" }], 240);
  const b = at("abdPain", [{ id: "pushEpi", at: 180, amount: 0.1, route: "IV" }], 240);
  const same = Math.abs(a.sbp - b.sbp) < 0.5 && Math.abs(a.hr - b.hr) < 0.5;
  same ? pass++ : fail++;
  if (!same) failures.push(`0.1 mg epinephrine IV should act the same under either label, epiIV sbp ${a.sbp.toFixed(1)} hr ${a.hr.toFixed(1)} vs pushEpi sbp ${b.sbp.toFixed(1)} hr ${b.hr.toFixed(1)}`);
  console.log(`  ${same ? "PASS" : "FAIL"}  ${"0.1 mg epi IV: same effect under either label".padEnd(46)} sbp ${a.sbp.toFixed(1)} vs ${b.sbp.toFixed(1)}`);
  const none = at("abdPain", [], 900), small = at("abdPain", [{ id: "morphine", at: 180, amount: 0.5 }], 900), full = at("abdPain", [{ id: "morphine", at: 180, amount: 4 }], 900);
  const graded = small.pain < none.pain - 0.02 && full.pain < small.pain - 0.2;
  graded ? pass++ : fail++;
  if (!graded) failures.push(`morphine 0.5 mg should relieve some pain and 4 mg more, pain none ${none.pain.toFixed(2)} 0.5 mg ${small.pain.toFixed(2)} 4 mg ${full.pain.toFixed(2)}`);
  console.log(`  ${graded ? "PASS" : "FAIL"}  ${"drawn 0.5 mg morphine acts, less than 4 mg".padEnd(46)} pain ${none.pain.toFixed(2)} -> ${small.pain.toFixed(2)} / ${full.pain.toFixed(2)}`);
}

console.log("\n[DRAWN OVERDOSE ESCALATES]");
{
  // A therapeutic dose keeps its documented effect, but a 10-20x draw must keep
  // going: respiratory/sedative coefficients used to be the drug's ceiling, so
  // 1 mg fentanyl left the patient awake at SpO2 97. pk.js's overdoseTail adds a
  // high-occupancy term that carries the effect toward apnea/unconsciousness.
  const worst = (id, amount) => {
    const s = { scen: "abdPain", t: 0, doses: [], given: {}, activePatientId: null };
    let sup = 0, spo2 = 100, sed = 0, uncon = false;
    for (let t = STEP; t <= 780; t += STEP) {
      s.t = t; if (t === 180) s.doses.push({ id, at: t, amount, route: "IV" }); physio(s);
      const p = activePatient(s); if (t === STEP) pinTraitsNeutral(p);
      if (t > 180) { sup = Math.max(sup, p.respDriveSuppression || 0); spo2 = Math.min(spo2, p.sao2 ?? 100); sed = Math.max(sed, p.sedationDepth || 0); uncon ||= p.consciousness === "unconscious" || p.consciousness === "coma"; }
    }
    return { sup, spo2, sed, uncon };
  };
  const fT = worst("fentanyl", 0.05), fOD = worst("fentanyl", 1);
  const ok1 = fT.sup > 0.08 && fT.sup < 0.16 && fT.spo2 > 95 && fOD.sup > 0.45 && fOD.spo2 < 88;
  ok1 ? pass++ : fail++;
  if (!ok1) failures.push(`fentanyl 50 mcg should stay mild and 1 mg should cause severe hypoventilation, got sup ${fT.sup.toFixed(3)}/spo2 ${fT.spo2.toFixed(0)} vs sup ${fOD.sup.toFixed(3)}/spo2 ${fOD.spo2.toFixed(0)}`);
  console.log(`  ${ok1 ? "PASS" : "FAIL"}  ${"fentanyl 0.05 mg mild, 1 mg severe hypoventilation".padEnd(46)} sup ${fT.sup.toFixed(3)} -> ${fOD.sup.toFixed(3)}, spo2 ${fT.spo2.toFixed(0)} -> ${fOD.spo2.toFixed(0)}`);
  const ok3 = !fT.uncon && fOD.uncon;
  ok3 ? pass++ : fail++;
  if (!ok3) failures.push(`opioid CNS depression: fentanyl 50 mcg should leave the patient conscious and 1 mg should not, got sed ${fT.sed.toFixed(2)} (${fT.uncon}) vs ${fOD.sed.toFixed(2)} (${fOD.uncon})`);
  console.log(`  ${ok3 ? "PASS" : "FAIL"}  ${"fentanyl 0.05 mg conscious, 1 mg unconscious".padEnd(46)} sed ${fT.sed.toFixed(2)} -> ${fOD.sed.toFixed(2)}`);
  const mT = worst("midazolam", 5), mOD = worst("midazolam", 50);
  const ok2 = !mT.uncon && mT.sed < 0.3 && mOD.uncon;
  ok2 ? pass++ : fail++;
  if (!ok2) failures.push(`midazolam 5 mg should not render unconscious and 50 mg should, got sed ${mT.sed.toFixed(2)} (${mT.uncon}) vs ${mOD.sed.toFixed(2)} (${mOD.uncon})`);
  console.log(`  ${ok2 ? "PASS" : "FAIL"}  ${"midazolam 5 mg drowsy at most, 50 mg unconscious".padEnd(46)} sed ${mT.sed.toFixed(2)} -> ${mOD.sed.toFixed(2)}`);
}

console.log("\n" + "=".repeat(74));
console.log(`${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log("\nFAILURES (a mechanism is declared but not wired):");
  for (const f of failures) console.log("  - " + f);
}
process.exitCode = fail > 0 ? 1 : 0;
