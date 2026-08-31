// conditionTaxonomy.js — classifies every key in src/physio/conditions.js's
// CONDITIONS table into the Emergent/Chronic hierarchy Medical Simulation
// mode's "BUILD YOUR OWN" case builder uses to organize its condition picker
// (src/data/customScenario.js consumes this; src/App.jsx renders it).
//
// This is a pure display/organization layer over the engine's own condition
// vocabulary, not a new mechanism — same category of file as doctordle.js.
//
// Classification rule: a condition modeling a BASELINE, ONGOING disease state
// (present before and after the call, not itself the acute complaint) is
// "chronic" — this matches CLAUDE.md's own informal
// "===== CHRONIC / PRE-EXISTING CONDITIONS =====" section header in
// conditions.js and the conditions already commented "(comorbidity)" there.
// A condition modeling an ACUTE presentation is "emergent", categorized by
// its dominant mechanism. Judgment calls (e.g. `stableAngina` chronic vs.
// `unstableAngina`/`nstemi` emergent, matching standard clinical teaching;
// `wpw` chronic — the accessory pathway itself is a standing anatomic
// finding, distinct from the emergent `atrialFibrillation` rhythm it can
// combine with; `sickSinusSyndrome` emergent — its own scenario presents the
// tachy-brady alternation as the acute complaint, not a silent baseline) are
// called out inline rather than guessed at silently.
export const TAXONOMY = {
  emergent: ["Diseases", "Injuries", "Cardiac Rhythms", "Physiologic States",
    "Toxicologic", "Environmental", "Obstetric", "Psychiatric"],
  chronic: ["Diseases", "Cardiac Rhythms", "Disabilities / Neurologic Conditions",
    "Other Chronic Conditions"],
};

const E = "emergent", C = "chronic";

export const CONDITION_TAXONOMY = {
  // ===== EMERGENT — Diseases =====
  aorticDissection: {tier: E, category: "Diseases"},
  chf: {tier: E, category: "Diseases"},
  ami: {tier: E, category: "Diseases"},
  copdExacerbation: {tier: E, category: "Diseases"},
  takotsubo: {tier: E, category: "Diseases"},
  pericardialTamponade: {tier: E, category: "Diseases"},
  pericarditis: {tier: E, category: "Diseases"},
  myocarditis: {tier: E, category: "Diseases"},
  hypertensiveUrgency: {tier: E, category: "Diseases"},
  hypertensiveEmergency: {tier: E, category: "Diseases"},
  ischemicStroke: {tier: E, category: "Diseases"},
  tia: {tier: E, category: "Diseases"},
  intracerebralHemorrhage: {tier: E, category: "Diseases"},
  subarachnoidHemorrhage: {tier: E, category: "Diseases"},
  acs: {tier: E, category: "Diseases"},
  unstableAngina: {tier: E, category: "Diseases"},
  nstemi: {tier: E, category: "Diseases"},
  cardiogenicShock: {tier: E, category: "Diseases"},
  pe: {tier: E, category: "Diseases"},
  anaphylaxis: {tier: E, category: "Diseases"},
  esophagealVaricealHemorrhage: {tier: E, category: "Diseases"},
  allergicReactionModerate: {tier: E, category: "Diseases"},
  asthma: {tier: E, category: "Diseases"},
  appendicitis: {tier: E, category: "Diseases"},
  pneumoniaSepsis: {tier: E, category: "Diseases"},
  meningitis: {tier: E, category: "Diseases"},
  encephalitis: {tier: E, category: "Diseases"},
  bellsPalsy: {tier: E, category: "Diseases"},
  guillainBarre: {tier: E, category: "Diseases"},
  myastheniaGravisCrisis: {tier: E, category: "Diseases"},
  centralVertigo: {tier: E, category: "Diseases"},
  sickleCellCrisis: {tier: E, category: "Diseases"},
  spontaneousPneumothorax: {tier: E, category: "Diseases"},
  pleuralEffusion: {tier: E, category: "Diseases"},
  ards: {tier: E, category: "Diseases"},
  aspirationPneumonitis: {tier: E, category: "Diseases"},
  bronchitis: {tier: E, category: "Diseases"},
  bronchiolitis: {tier: E, category: "Diseases"},
  pertussis: {tier: E, category: "Diseases"},
  influenzaPneumonia: {tier: E, category: "Diseases"},
  covidPneumonia: {tier: E, category: "Diseases"},
  croup: {tier: E, category: "Diseases"},
  epiglottitis: {tier: E, category: "Diseases"},
  cysticFibrosisExacerbation: {tier: E, category: "Diseases"},
  tuberculosisHemoptysis: {tier: E, category: "Diseases"},

  // ===== EMERGENT — Injuries =====
  crushSyndrome: {tier: E, category: "Injuries"},
  minorSprain: {tier: E, category: "Injuries"},
  polytraumaFall: {tier: E, category: "Injuries"},
  traumaPregnant: {tier: E, category: "Injuries"},
  polytraumaMoto: {tier: E, category: "Injuries"},
  abdominalGSW: {tier: E, category: "Injuries"},
  stabChestTension: {tier: E, category: "Injuries"},
  openPneumothorax: {tier: E, category: "Injuries"},
  hemothorax: {tier: E, category: "Injuries"},
  hypoglycemiaMaskedBleed: {tier: E, category: "Injuries"},

  // ===== EMERGENT — Cardiac Rhythms =====
  acquiredLongQT: {tier: E, category: "Cardiac Rhythms"},
  thirdDegreeAVBlock: {tier: E, category: "Cardiac Rhythms"},
  firstDegreeAVBlock: {tier: E, category: "Cardiac Rhythms"},
  secondDegreeAVBlockTypeI: {tier: E, category: "Cardiac Rhythms"},
  secondDegreeAVBlockTypeII: {tier: E, category: "Cardiac Rhythms"},
  atrialFibrillation: {tier: E, category: "Cardiac Rhythms"},
  atrialFlutter: {tier: E, category: "Cardiac Rhythms"},
  monomorphicVT: {tier: E, category: "Cardiac Rhythms"},
  symptomaticBradycardia: {tier: E, category: "Cardiac Rhythms"},
  prematureVentricularContractions: {tier: E, category: "Cardiac Rhythms"},
  prematureAtrialContractions: {tier: E, category: "Cardiac Rhythms"},
  sickSinusSyndrome: {tier: E, category: "Cardiac Rhythms"},
  electricalStorm: {tier: E, category: "Cardiac Rhythms"},
  aicdMalfunction: {tier: E, category: "Cardiac Rhythms"},
  svt: {tier: E, category: "Cardiac Rhythms"},

  // ===== EMERGENT — Physiologic States =====
  increasedICP: {tier: E, category: "Physiologic States"},
  fbao: {tier: E, category: "Physiologic States"},
  vasovagalSyncope: {tier: E, category: "Physiologic States"},
  seizurePostictal: {tier: E, category: "Physiologic States"},
  activeSeizureGTC: {tier: E, category: "Physiologic States"},
  statusEpilepticus: {tier: E, category: "Physiologic States"},
  febrileSeizure: {tier: E, category: "Physiologic States"},
  simplePartialSeizure: {tier: E, category: "Physiologic States"},
  complexPartialSeizure: {tier: E, category: "Physiologic States"},
  absenceSeizure: {tier: E, category: "Physiologic States"},
  migraine: {tier: E, category: "Physiologic States"},
  clusterHeadache: {tier: E, category: "Physiologic States"},
  tensionHeadache: {tier: E, category: "Physiologic States"},
  trigeminalNeuralgia: {tier: E, category: "Physiologic States"},
  toxicMetabolicEncephalopathy: {tier: E, category: "Physiologic States"},
  delirium: {tier: E, category: "Physiologic States"},
  refeedingSyndrome: {tier: E, category: "Physiologic States"},
  hyperammonemia: {tier: E, category: "Physiologic States"},
  siadh: {tier: E, category: "Physiologic States"},
  diabetesInsipidus: {tier: E, category: "Physiologic States"},
  addisonianCrisis: {tier: E, category: "Physiologic States"},
  thyroidStorm: {tier: E, category: "Physiologic States"},
  myxedemaComa: {tier: E, category: "Physiologic States"},
  diabeticKetoacidosis: {tier: E, category: "Physiologic States"},
  hyperosmolarHyperglycemicState: {tier: E, category: "Physiologic States"},
  severeHypoglycemia: {tier: E, category: "Physiologic States"},
  starvationKetosis: {tier: E, category: "Physiologic States"},
  hypoxicBrainInjury: {tier: E, category: "Physiologic States"},
  peripheralVertigo: {tier: E, category: "Physiologic States"},
  neonatalTransition: {tier: E, category: "Physiologic States"},

  // ===== EMERGENT — Toxicologic =====
  digoxinToxicity: {tier: E, category: "Toxicologic"},
  opioidOD: {tier: E, category: "Toxicologic"},
  alcoholicKetoacidosis: {tier: E, category: "Toxicologic"},

  // ===== EMERGENT — Environmental =====
  pediatricDrowning: {tier: E, category: "Environmental"},
  heatStroke: {tier: E, category: "Environmental"},

  // ===== EMERGENT — Obstetric =====
  preeclampsia: {tier: E, category: "Obstetric"},
  uterineAtony: {tier: E, category: "Obstetric"},

  // ===== EMERGENT — Psychiatric =====
  excitedDelirium: {tier: E, category: "Psychiatric"},

  // ===== CHRONIC — Diseases =====
  copd: {tier: C, category: "Diseases"},
  chronicKidneyDisease: {tier: C, category: "Diseases"},
  diabetesT2: {tier: C, category: "Diseases"},
  hypertension: {tier: C, category: "Diseases"},
  hyperlipidemia: {tier: C, category: "Diseases"},
  diabeticVasculopathy: {tier: C, category: "Diseases"},
  chronicHeartFailure: {tier: C, category: "Diseases"},
  coronaryArteryDisease: {tier: C, category: "Diseases"},
  stableAngina: {tier: C, category: "Diseases"},
  cushingSyndrome: {tier: C, category: "Diseases"},
  hyperthyroidism: {tier: C, category: "Diseases"},
  hypothyroidism: {tier: C, category: "Diseases"},
  typeIDiabetes: {tier: C, category: "Diseases"},

  // ===== CHRONIC — Cardiac Rhythms =====
  wpw: {tier: C, category: "Cardiac Rhythms"},

  // ===== CHRONIC — Disabilities / Neurologic Conditions =====
  epilepsy: {tier: C, category: "Disabilities / Neurologic Conditions"},
  dementia: {tier: C, category: "Disabilities / Neurologic Conditions"},

  // ===== CHRONIC — Other Chronic Conditions =====
  healthyPregnancy: {tier: C, category: "Other Chronic Conditions"},
  chronicBackPain: {tier: C, category: "Other Chronic Conditions"},
};
