// customScenario.js — builds a SCEN-shaped scenario on the fly for Sandbox
// mode's "build your own" option, out of nothing but one or more condition
// keys + age + gender. Unlike the hand-authored entries in scenarios.js,
// this has no bespoke probe dialogue or MICN call — the body only reports
// what the underlying physiology (physio/conditions.js) already knows: its
// wounds, its vitals, and whether the patient lives or dies. That's read
// generically by the same `probes`/`resolve` contract every other scenario
// uses, so it drops into the existing game loop without changes there.
//
// COVERAGE: every key in physio/conditions.js's CONDITIONS table has an
// entry below — this is Medical Simulation mode's full condition roster,
// organized by conditionTaxonomy.js's Emergent/Chronic hierarchy for the
// picker UI (App.jsx). Verified against the real CONDITIONS export by a
// throwaway script, not just by eye (126/126, zero missing/extra).
//
// MULTI-CONDITION: physiology.js's buildPatient() already composes an array
// of condition keys onto one Patient (initial/wounds merge, sync/progress
// all run) — this file only needs to pass the whole selected array through
// as `condition`, unchanged from how a single key already worked.
import { SCEN } from "./scenarios.js";
import { CONDITIONS } from "../physio/conditions.js";
import { CONDITION_INFO } from "../medicle.js";
import { CONDITION_TAXONOMY } from "./conditionTaxonomy.js";

// Reverse index: conditionKey -> {imps, clothing} pulled from the first
// curated scenario that names it as a single (non-array, non-`patients:`)
// condition. Backfills those two fields for every condition that already
// has a dedicated hand-authored scenario, instead of duplicating that
// scenario's own data here (this project's "reuse existing... instead of
// creating duplicates" rule). `dispatch` is NOT backfilled this way —
// scenarios.js's own dispatch[0] lines are inconsistently demographic-
// prefixed ("45F. Chest pressure...") vs. bare ("Difficulty breathing..."),
// so reusing them verbatim risks a doubled/garbled prefix once this file's
// own age/gender template is applied; every condition below gets its own
// short, bare dispatch phrase instead.
const SCENARIO_FIELDS_BY_CONDITION = {};
for (const k of Object.keys(SCEN)) {
  const scen = SCEN[k];
  if (typeof scen.condition !== "string") continue;   // skip array/patients: scenarios
  if (SCENARIO_FIELDS_BY_CONDITION[scen.condition]) continue;   // first match wins
  SCENARIO_FIELDS_BY_CONDITION[scen.condition] = {imps: scen.imps, clothing: scen.clothing};
}

const DEFAULT_CLOTHING = {top: "short", bottom: "pants", shoes: true};

// name: reused verbatim from doctordle.js's CONDITION_INFO where it exists
// (that file's own comment already promises "kept identical where both
// exist, so a patient never gets two different display names for the same
// condition depending on which screen you're on") — authored fresh
// otherwise. correct: the PI impression code (src/gear.js) a candidate
// SHOULD call this presentation, chosen from the existing vocabulary (no
// new codes invented). For the tier==="chronic" entries this is a much
// weaker signal — a comorbidity alone rarely IS the presenting complaint —
// and buildCustomScenario() below only scores against tier==="emergent"
// selections when at least one is picked; see its own comment.
// imps/clothing are given explicitly only for the ~14 conditions with no
// dedicated scenario to backfill them from (see SCENARIO_FIELDS_BY_CONDITION
// above) — everything else derives them automatically.
const HAND = {
  aorticDissection: {name: "Aortic dissection", correct: "CPSC", dispatch: "Chest/back pain, breathlessness."},
  chf: {name: "CHF / pulmonary edema", correct: "CHFF", dispatch: "Difficulty breathing."},
  ami: {name: "Acute myocardial infarction", correct: "CPMI", dispatch: "Chest pain, possible cardiac."},
  healthyPregnancy: {name: "Healthy pregnancy", correct: "OBEM", dispatch: "Pregnant patient, wellness check / normal labor.",
    imps: ["OBEM", "ALOC"], clothing: {dress: true, shoes: true}},
  copd: {name: "COPD", correct: "SOBB", dispatch: "Known COPD, increasing shortness of breath."},
  copdExacerbation: {name: "COPD exacerbation", correct: "SOBB", dispatch: "COPD patient, worse breathing than usual."},
  chronicKidneyDisease: {name: "Chronic kidney disease", correct: "ALOC", dispatch: "Generalized weakness, known dialysis patient.",
    imps: ["ALOC", "SHOK", "CPSC"], clothing: DEFAULT_CLOTHING},
  // Found missing from this table (a genuine pre-existing gap, unrelated to
  // the map-expansion batch) while verifying that batch in a real browser:
  // CONDITIONS has this key (physio/conditions.js) but HAND never gained an
  // entry for it, so CONDITION_META's own Object.keys(CONDITIONS).map(...)
  // (below) threw `hand.name` on undefined at MODULE LOAD — crashing the
  // entire app before the title screen could even render, not just the
  // Sandbox custom-scenario builder. Fixed with the same pattern
  // chronicKidneyDisease (immediately above) already uses for the same
  // real disease category.
  hyperkalemiaMissedDialysis: {name: "Hyperkalemia from missed dialysis", correct: "ALOC", dispatch: "ESRD patient, missed dialysis, generalized weakness.",
    imps: ["ALOC", "CPSC", "SHOK"], clothing: DEFAULT_CLOTHING},
  // Same class of gap as hyperkalemiaMissedDialysis above, found the same
  // way (this table crashing the whole app at module load) — added by a
  // concurrent session between when this file was first checked and when
  // this batch's own live-browser verification ran. Not this batch's
  // condition; fixed anyway since it blocks EVERY save, not just the
  // Sandbox custom-scenario builder.
  rocuroniumOverdose: {name: "Rocuronium overdose (inadvertent/malicious paralytic)", correct: "RARF", dispatch: "Total paralysis, no sedation given, patient reportedly alert.",
    imps: ["RARF", "ALOC"], clothing: DEFAULT_CLOTHING},
  diabetesT2: {name: "Type 2 diabetes", correct: "DIAB", dispatch: "Diabetic patient, not feeling well.",
    imps: ["DIAB", "ALOC"], clothing: DEFAULT_CLOTHING},
  hypertension: {name: "Hypertension (chronic)", correct: "CPSC", dispatch: "History of high blood pressure, headache.",
    imps: ["CPSC", "ALOC"], clothing: DEFAULT_CLOTHING},
  hyperlipidemia: {name: "Hyperlipidemia", correct: "CPSC", dispatch: "Known high cholesterol, cardiac risk factor screen.",
    imps: ["CPSC", "ALOC"], clothing: DEFAULT_CLOTHING},
  diabeticVasculopathy: {name: "Diabetic vasculopathy / autonomic neuropathy", correct: "DIAB", dispatch: "Long-standing diabetic, poor circulation.",
    imps: ["DIAB", "CPSC", "ALOC"], clothing: DEFAULT_CLOTHING},
  chronicHeartFailure: {name: "Chronic heart failure (compensated baseline)", correct: "CHFF", dispatch: "Known heart failure, baseline check.",
    imps: ["CHFF", "SOBB"], clothing: DEFAULT_CLOTHING},
  takotsubo: {name: "Takotsubo (stress) cardiomyopathy", correct: "CPSC", dispatch: "Sudden chest pain after severe emotional stress."},
  acquiredLongQT: {name: "Acquired long QT syndrome", correct: "DYSR", dispatch: "Palpitations, near-syncope, on multiple medications."},
  thirdDegreeAVBlock: {name: "Third-degree (complete) AV block", correct: "DYSR", dispatch: "Weak, dizzy, very slow pulse."},
  firstDegreeAVBlock: {name: "First-degree AV block", correct: "DYSR", dispatch: "Fatigue, incidental slow-ish pulse found."},
  secondDegreeAVBlockTypeI: {name: "Second-degree AV block, Type I (Wenckebach)", correct: "DYSR", dispatch: "Lightheaded, irregular pulse."},
  secondDegreeAVBlockTypeII: {name: "Second-degree AV block, Type II (Mobitz II)", correct: "DYSR", dispatch: "Dizzy spells, dropped-beat sensation."},
  atrialFibrillation: {name: "Atrial fibrillation", correct: "DYSR", dispatch: "Racing, irregular heartbeat."},
  atrialFlutter: {name: "Atrial flutter", correct: "DYSR", dispatch: "Racing heartbeat, palpitations."},
  monomorphicVT: {name: "Monomorphic ventricular tachycardia", correct: "DYSR", dispatch: "Racing heart, lightheaded."},
  wpw: {name: "Wolff-Parkinson-White (accessory pathway)", correct: "DYSR", dispatch: "Known WPW, palpitations.",
    imps: ["DYSR", "CPSC"], clothing: DEFAULT_CLOTHING},
  pericardialTamponade: {name: "Pericardial tamponade", correct: "SHOK", dispatch: "Weak, short of breath, distended neck veins."},
  symptomaticBradycardia: {name: "Symptomatic bradycardia", correct: "DYSR", dispatch: "Dizzy, very slow pulse, near-syncope."},
  digoxinToxicity: {name: "Digoxin toxicity", correct: "ODPO", dispatch: "Nausea, visual changes, irregular pulse, on digoxin."},
  pericarditis: {name: "Pericarditis", correct: "CPSC", dispatch: "Sharp chest pain, worse lying flat."},
  myocarditis: {name: "Myocarditis", correct: "CPSC", dispatch: "Chest pain and weakness after a recent viral illness."},
  hypertensiveUrgency: {name: "Hypertensive urgency", correct: "CPSC", dispatch: "Severe headache, very high blood pressure at home."},
  hypertensiveEmergency: {name: "Hypertensive emergency", correct: "CHFF", dispatch: "Severe headache, breathlessness, dangerously high blood pressure."},
  prematureVentricularContractions: {name: "Premature ventricular contractions (PVCs)", correct: "DYSR", dispatch: "Occasional skipped-beat sensation."},
  prematureAtrialContractions: {name: "Premature atrial contractions (PACs)", correct: "DYSR", dispatch: "Occasional fluttering sensation in the chest."},
  sickSinusSyndrome: {name: "Sick sinus syndrome (tachy-brady)", correct: "DYSR", dispatch: "Alternating dizzy spells and racing heart."},
  electricalStorm: {name: "Electrical storm (recurrent VT/VF)", correct: "CANT", dispatch: "ICD firing repeatedly, patient in distress."},
  aicdMalfunction: {name: "ICD malfunction (inappropriate shocks)", correct: "DYSR", dispatch: "Implanted defibrillator shocking repeatedly."},
  increasedICP: {name: "Increased intracranial pressure", correct: "ALOC", dispatch: "Worsening headache, vomiting, declining mental status."},
  ischemicStroke: {name: "Ischemic stroke", correct: "STRK", dispatch: "Sudden weakness, facial droop, slurred speech."},
  tia: {name: "Transient ischemic attack", correct: "STRK", dispatch: "Weakness and slurred speech, now resolving."},
  intracerebralHemorrhage: {name: "Intracerebral hemorrhage", correct: "STRK", dispatch: "Sudden severe headache, collapse, one-sided weakness."},
  subarachnoidHemorrhage: {name: "Subarachnoid hemorrhage", correct: "STRK", dispatch: "Sudden 'worst headache of my life', collapse."},
  coronaryArteryDisease: {name: "Coronary artery disease", correct: "CPSC", dispatch: "Known coronary artery disease, cardiac risk factor.",
    imps: ["CPSC", "CPMI"], clothing: DEFAULT_CLOTHING},
  acs: {name: "Acute coronary syndrome", correct: "CPSC", dispatch: "Chest pressure, cardiac history."},
  stableAngina: {name: "Stable angina", correct: "CPSC", dispatch: "Chest discomfort with exertion, relieved by rest."},
  unstableAngina: {name: "Unstable angina", correct: "CPSC", dispatch: "New chest pain at rest."},
  nstemi: {name: "NSTEMI", correct: "CPSC", dispatch: "Chest pain, cardiac history, worse than usual."},
  cardiogenicShock: {name: "Cardiogenic shock", correct: "SHOK", dispatch: "Weak, short of breath, looks gray."},
  svt: {name: "Supraventricular tachycardia", correct: "DYSR", dispatch: "Racing heart, palpitations."},
  pe: {name: "Pulmonary embolism", correct: "RDOT", dispatch: "Sudden chest pain and breathlessness."},
  fbao: {name: "Foreign body airway obstruction", correct: "CHOK", dispatch: "Choking, possible airway obstruction."},
  crushSyndrome: {name: "Crush syndrome", correct: "TRMA", dispatch: "Entrapment, prolonged."},
  opioidOD: {name: "Opioid overdose", correct: "ODPO", dispatch: "Unresponsive, possible overdose."},
  anaphylaxis: {name: "Anaphylaxis", correct: "ANPH", dispatch: "Allergic reaction, difficulty breathing."},
  vasovagalSyncope: {name: "Vasovagal syncope", correct: "ALOC", dispatch: "Brief fainting spell, now awake."},
  minorSprain: {name: "Minor sprain", correct: "TRMA", dispatch: "Twisted ankle, pain, can't bear weight."},
  chronicBackPain: {name: "Chronic mechanical back pain", correct: "PMGT", dispatch: "Ongoing low back pain flare-up.",
    imps: ["PMGT", "TRMA"], clothing: DEFAULT_CLOTHING},
  excitedDelirium: {name: "Excited delirium syndrome", correct: "ALOC", dispatch: "Combative, agitated, incoherent, extremely hot to the touch."},
  esophagealVaricealHemorrhage: {name: "Esophageal variceal hemorrhage", correct: "ABDP", dispatch: "Vomiting blood, known liver disease."},
  allergicReactionModerate: {name: "Allergic reaction (moderate, non-anaphylactic)", correct: "ALRX", dispatch: "Hives and itching after a known exposure."},
  asthma: {name: "Asthma exacerbation / bronchospasm", correct: "SOBB", dispatch: "Difficulty breathing, wheezing."},
  appendicitis: {name: "Acute appendicitis", correct: "ABDP", dispatch: "Severe abdominal pain."},
  pneumoniaSepsis: {name: "Pneumonia with sepsis / respiratory arrest", correct: "RARF", dispatch: "Unresponsive, barely breathing, days of fever."},
  seizurePostictal: {name: "Seizure (post-ictal)", correct: "SEIZ", dispatch: "Seizure, now post-ictal."},
  activeSeizureGTC: {name: "Active generalized tonic-clonic seizure", correct: "SEIZ", dispatch: "Actively seizing, whole body shaking."},
  statusEpilepticus: {name: "Status epilepticus", correct: "SEIZ", dispatch: "Continuous seizure activity, several minutes now."},
  epilepsy: {name: "Epilepsy (seizure disorder)", correct: "SEIZ", dispatch: "Known seizure disorder, baseline check.",
    imps: ["SEIZ", "ALOC"], clothing: DEFAULT_CLOTHING},
  febrileSeizure: {name: "Febrile seizure", correct: "SEIZ", dispatch: "Child seized, high fever."},
  simplePartialSeizure: {name: "Simple partial (focal aware) seizure", correct: "SEIZ", dispatch: "One limb twitching, fully alert throughout."},
  complexPartialSeizure: {name: "Complex partial (focal impaired-awareness) seizure", correct: "SEIZ", dispatch: "Staring, lip-smacking, unresponsive to voice."},
  migraine: {name: "Migraine", correct: "PMGT", dispatch: "Severe one-sided headache, light sensitivity."},
  clusterHeadache: {name: "Cluster headache", correct: "PMGT", dispatch: "Sudden severe one-sided headache around the eye."},
  tensionHeadache: {name: "Tension headache", correct: "PMGT", dispatch: "Dull, band-like headache."},
  trigeminalNeuralgia: {name: "Trigeminal neuralgia", correct: "PMGT", dispatch: "Sudden electric-shock facial pain."},
  meningitis: {name: "Meningitis", correct: "FEVR", dispatch: "Fever, severe headache, stiff neck."},
  encephalitis: {name: "Encephalitis", correct: "ALOC", dispatch: "Fever and confusion, worsening over hours."},
  toxicMetabolicEncephalopathy: {name: "Toxic-metabolic encephalopathy", correct: "ALOC", dispatch: "Confused, altered mental status, unclear cause."},
  delirium: {name: "Delirium", correct: "ALOC", dispatch: "Sudden confusion, fluctuating, in an elderly patient."},
  refeedingSyndrome: {name: "Refeeding syndrome", correct: "ALOC", dispatch: "Weak, malnourished, recently started eating again."},
  hyperammonemia: {name: "Hyperammonemia / hepatic encephalopathy", correct: "ALOC", dispatch: "Confused, known liver disease."},
  siadh: {name: "SIADH (hyponatremia)", correct: "ALOC", dispatch: "Confused, nauseated, low sodium on record."},
  diabetesInsipidus: {name: "Diabetes insipidus", correct: "ALOC", dispatch: "Extreme thirst and urination, now weak and confused."},
  addisonianCrisis: {name: "Addisonian (adrenal) crisis", correct: "SHOK", dispatch: "Weak, vomiting, collapsed, known adrenal insufficiency."},
  cushingSyndrome: {name: "Cushing syndrome", correct: "ALOC", dispatch: "Chronic steroid use, weakness.",
    imps: ["ALOC", "CPSC"], clothing: DEFAULT_CLOTHING},
  hyperthyroidism: {name: "Hyperthyroidism", correct: "DYSR", dispatch: "Racing heart, tremor, heat intolerance.",
    imps: ["DYSR", "ALOC"], clothing: DEFAULT_CLOTHING},
  thyroidStorm: {name: "Thyroid storm", correct: "DYSR", dispatch: "Racing heart, high fever, confusion."},
  hypothyroidism: {name: "Hypothyroidism", correct: "ALOC", dispatch: "Fatigue, cold intolerance, sluggish.",
    imps: ["ALOC"], clothing: DEFAULT_CLOTHING},
  myxedemaComa: {name: "Myxedema coma", correct: "ALOC", dispatch: "Unresponsive, very cold, very slow pulse."},
  diabeticKetoacidosis: {name: "Diabetic ketoacidosis (DKA)", correct: "DIAB", dispatch: "Diabetic, vomiting, breathing fast and deep."},
  hyperosmolarHyperglycemicState: {name: "Hyperosmolar hyperglycemic state (HHS)", correct: "DIAB", dispatch: "Diabetic, profoundly confused, very high blood sugar."},
  severeHypoglycemia: {name: "Severe hypoglycemia", correct: "DIAB", dispatch: "Diabetic, found unresponsive."},
  typeIDiabetes: {name: "Type 1 diabetes", correct: "DIAB", dispatch: "Insulin-dependent diabetic, not feeling well.",
    imps: ["DIAB", "ALOC"], clothing: DEFAULT_CLOTHING},
  alcoholicKetoacidosis: {name: "Alcoholic ketoacidosis", correct: "ALOC", dispatch: "Vomiting, heavy recent drinking, poor oral intake."},
  starvationKetosis: {name: "Starvation ketosis", correct: "ALOC", dispatch: "Weak, prolonged poor oral intake."},
  hypoxicBrainInjury: {name: "Hypoxic-ischemic brain injury (post-arrest)", correct: "ALOC", dispatch: "Unresponsive following a resuscitated cardiac arrest."},
  bellsPalsy: {name: "Bell's palsy", correct: "STRK", dispatch: "Sudden one-sided facial droop."},
  dementia: {name: "Dementia", correct: "ALOC", dispatch: "Known dementia, altered baseline mentation.",
    imps: ["ALOC"], clothing: DEFAULT_CLOTHING},
  guillainBarre: {name: "Guillain-Barré syndrome", correct: "RARF", dispatch: "Ascending weakness, now trouble breathing."},
  myastheniaGravisCrisis: {name: "Myasthenic crisis", correct: "RARF", dispatch: "Progressive weakness, drooping eyelids, trouble breathing."},
  peripheralVertigo: {name: "Peripheral vertigo", correct: "ALOC", dispatch: "Room spinning, nausea, no other complaints."},
  centralVertigo: {name: "Central vertigo (posterior circulation stroke)", correct: "STRK", dispatch: "Room spinning, plus new imbalance and slurred speech."},
  absenceSeizure: {name: "Absence seizure", correct: "SEIZ", dispatch: "Brief blank staring spells."},
  hypoglycemiaMaskedBleed: {name: "Hypoglycemia with a masked intracranial bleed", correct: "DIAB", dispatch: "Found down, low blood sugar, unwitnessed fall nearby."},
  polytraumaFall: {name: "Polytrauma — fall", correct: "TRMA", dispatch: "Significant fall, multiple injuries."},
  traumaPregnant: {name: "Trauma in pregnancy", correct: "TRMA", dispatch: "Pregnant patient, traumatic mechanism."},
  polytraumaMoto: {name: "Polytrauma — motorcycle collision", correct: "TRMA", dispatch: "Motorcycle collision, multiple injuries."},
  pediatricDrowning: {name: "Pediatric drowning", correct: "RARF", dispatch: "Child pulled from the water, not breathing."},
  abdominalGSW: {name: "Penetrating abdominal trauma (GSW)", correct: "TRMA", dispatch: "Gunshot wound to the abdomen."},
  stabChestTension: {name: "Penetrating chest trauma / tension pneumothorax", correct: "TRMA", dispatch: "Stabbing, difficulty breathing."},
  // Age handling caveat: this is the engine's newborn/first-minutes-of-life
  // condition, selected here through the same 1-105 age picker every other
  // condition uses. Selecting it composes correctly (physiology.js applies
  // it the same as any other condition), but a player should pick a low age
  // — the game does not force one, matching this file's existing "generic,
  // no bespoke guardrails" scope.
  neonatalTransition: {name: "Neonatal transition (newborn resuscitation)", correct: "RARF", dispatch: "Newborn, first minutes of life.",
    imps: ["RARF", "CANT"], clothing: {top: "short", bottom: "pants", shoes: false}},
  preeclampsia: {name: "Preeclampsia / eclampsia", correct: "OBEM", dispatch: "Pregnant, severe headache, very high blood pressure."},
  uterineAtony: {name: "Uterine atony (postpartum hemorrhage)", correct: "OBEM", dispatch: "Just delivered, heavy ongoing vaginal bleeding."},
  sickleCellCrisis: {name: "Sickle cell (vaso-occlusive) crisis", correct: "PMGT", dispatch: "Severe diffuse pain, known sickle cell disease."},
  heatStroke: {name: "Heat stroke", correct: "HEAT", dispatch: "Collapsed outdoors, hot to the touch, confused."},
  spontaneousPneumothorax: {name: "Spontaneous pneumothorax", correct: "RDOT", dispatch: "Sudden sharp chest pain and breathlessness, no trauma."},
  openPneumothorax: {name: "Open (sucking chest wound) pneumothorax", correct: "TRMA", dispatch: "Penetrating chest wound, sucking sound with breathing."},
  hemothorax: {name: "Hemothorax", correct: "TRMA", dispatch: "Penetrating chest trauma, worsening breathlessness."},
  pleuralEffusion: {name: "Pleural effusion", correct: "RDOT", dispatch: "Gradually worsening breathlessness, known cancer/heart failure."},
  ards: {name: "Acute respiratory distress syndrome (ARDS)", correct: "RARF", dispatch: "Severe breathlessness, low oxygen despite treatment, recent illness."},
  aspirationPneumonitis: {name: "Aspiration pneumonitis", correct: "RDOT", dispatch: "Vomited then breathing worsened, decreased consciousness."},
  bronchitis: {name: "Acute bronchitis", correct: "SOBB", dispatch: "Cough and mild breathlessness, several days."},
  bronchiolitis: {name: "Bronchiolitis (infant)", correct: "SOBB", dispatch: "Infant, wheezing, working hard to breathe."},
  pertussis: {name: "Pertussis (whooping cough)", correct: "SOBB", dispatch: "Infant, severe coughing fits, brief apnea."},
  influenzaPneumonia: {name: "Influenza pneumonia", correct: "RDOT", dispatch: "Fever, cough, worsening breathlessness."},
  covidPneumonia: {name: "COVID-19 pneumonia", correct: "RDOT", dispatch: "Fever, cough, progressive breathlessness, low oxygen."},
  croup: {name: "Croup", correct: "UAWI", dispatch: "Child, barking cough, harsh breathing sound."},
  epiglottitis: {name: "Epiglottitis", correct: "UAWI", dispatch: "Child, fever, drooling, harsh breathing sound."},
  cysticFibrosisExacerbation: {name: "Cystic fibrosis exacerbation", correct: "SOBB", dispatch: "Known cystic fibrosis, worse cough and breathlessness."},
  tuberculosisHemoptysis: {name: "Tuberculosis with hemoptysis", correct: "RDOT", dispatch: "Chronic cough, coughing up blood, weight loss."},
  // Same class of gap as hyperkalemiaMissedDialysis/rocuroniumOverdose above
  // (this table crashing the whole app at module load — `hand.name` thrown
  // on `undefined` for any CONDITIONS key with no matching HAND entry) —
  // found live-browser-testing an unrelated batch. Not this batch's
  // conditions (the Electrolyte category's own ELEC-001..008 scenarios,
  // condition.js/scenarios.js — added by a concurrent session); fixed
  // anyway since it blocks every save, not just Sandbox's custom-scenario
  // builder. imps/clothing left unset for all 8 — each has its own real,
  // dedicated ELEC-00x scenario in scenarios.js, so SCENARIO_FIELDS_BY_
  // CONDITION's reverse index backfills both automatically.
  hypokalemia: {name: "Hypokalemia", correct: "DYSR", dispatch: "Generalized weakness, palpitations, known diuretic use."},
  hypercalcemia: {name: "Hypercalcemia", correct: "ALOC", dispatch: "Progressive confusion, constipation, generalized weakness."},
  hypocalcemia: {name: "Hypocalcemia", correct: "ABDP", dispatch: "Severe epigastric pain, hand tingling and cramping."},
  hypermagnesemia: {name: "Hypermagnesemia", correct: "DYSR", dispatch: "Generalized weakness, dialysis patient, magnesium laxative use."},
  hypomagnesemia: {name: "Hypomagnesemia", correct: "DYSR", dispatch: "Syncopal episode, tremor, chronic alcohol use."},
  hyponatremia: {name: "Hyponatremia", correct: "ALOC", dispatch: "Confusion after endurance exercise, excessive water intake."},
  hypernatremia: {name: "Hypernatremia", correct: "ALOC", dispatch: "Found weak and confused, hot apartment, poor oral intake."},
  severeMetabolicAcidosis: {name: "Severe metabolic acidosis", correct: "RDOT", dispatch: "Days of severe diarrhea, rapid/deep breathing."},
  // Same class of gap again — the second cardiac-conditions-adjacent shock/
  // GI/vascular/psychiatric batch (TRMA-041/ABD-027..030/VASC-001..002/
  // PSYC-001, scenarios.js) landed with no matching HAND entries, crashing
  // the whole app at module load the same way. Not this batch's conditions;
  // fixed anyway per this table's own standing rule (see the comment above
  // hypokalemia). imps/clothing left unset — each has its own dedicated
  // scenario, backfilled automatically the same way.
  neurogenicShock: {name: "Neurogenic shock", correct: "SHOK", dispatch: "Diving accident, cannot move legs, warm dry skin."},
  acuteMesentericIschemia: {name: "Acute mesenteric ischemia", correct: "ABDP", dispatch: "Severe abdominal pain out of proportion to exam."},
  acuteCholecystitis: {name: "Acute cholecystitis", correct: "ABDP", dispatch: "Right upper quadrant pain and fever."},
  lowerGIBleed: {name: "Lower GI bleed", correct: "HOTN", dispatch: "Passing large amounts of blood per rectum, no pain."},
  upperGIBleed: {name: "Upper GI bleed", correct: "HOTN", dispatch: "Vomiting blood, epigastric pain."},
  acuteLimbIschemia: {name: "Acute limb ischemia", correct: "DYSR", dispatch: "Sudden severe limb pain, pale and cold, pulseless."},
  deepVeinThrombosis: {name: "Deep vein thrombosis", correct: "DYSR", dispatch: "Swollen, painful calf, recent travel or surgery."},
  panicAttackHyperventilation: {name: "Panic attack with hyperventilation", correct: "ANXY", dispatch: "Rapid breathing, hand tingling, emotional trigger."},
  // Same class of gap again — a 4th recurrence of the exact defect this
  // table's own comments already document 3 times above (module-load crash
  // on `hand.name` for any CONDITIONS key with no matching HAND entry).
  // A concurrent session's Obstetric/Vascular/GI batch (OBGY-044..048,
  // VASC-003, ABD-031/032, scenarios.js) landed with no matching HAND
  // entries — not this batch's conditions; fixed anyway per this table's
  // own standing rule (see the comment above hypokalemia), since this
  // blocks every save, not just Sandbox's custom-scenario builder.
  // imps/clothing left unset for all 8 — each has its own dedicated
  // scenario (OBGY-044..048/VASC-003/ABD-031/032), backfilled automatically
  // by SCENARIO_FIELDS_BY_CONDITION the same way.
  ectopicPregnancyRuptured: {name: "Ruptured ectopic pregnancy", correct: "HOTN", dispatch: "Sudden severe pelvic pain, near-syncope."},
  placentalAbruption: {name: "Placental abruption", correct: "OBEM", dispatch: "36 weeks pregnant, sudden abdominal pain and vaginal bleeding."},
  placentaPrevia: {name: "Placenta previa", correct: "OBEM", dispatch: "34 weeks pregnant, painless vaginal bleeding."},
  ovarianTorsion: {name: "Ovarian torsion", correct: "ABDP", dispatch: "Sudden severe one-sided pelvic pain."},
  rupturedOvarianCyst: {name: "Ruptured ovarian cyst", correct: "ABDP", dispatch: "Sudden pelvic pain, lightheaded."},
  abdominalAorticAneurysm: {name: "Abdominal aortic aneurysm (ruptured/leaking)", correct: "HOTN", dispatch: "Sudden severe abdominal and back pain."},
  acutePancreatitis: {name: "Acute pancreatitis", correct: "ABDP", dispatch: "Severe abdominal pain radiating to the back."},
  bowelObstruction: {name: "Bowel obstruction", correct: "ABDP", dispatch: "Crampy abdominal pain, vomiting, no bowel movement."},
  // Same recurring gap, a 5th time: found while unblocking an unrelated
  // batch (this crash blocks the whole app at module load, not just
  // Sandbox's custom-scenario builder) — queue item 40's diltiazem/
  // metoprolol overdose conditions (TOX-002/TOX-003, scenarios.js) landed
  // with no matching HAND entries. Real content, not placeholders, matching
  // each scenario's own dispatch/imps.
  diltiazemOverdose: {name: "Calcium channel blocker (diltiazem) overdose", correct: "DYSR", dispatch: "Found down, very slow pulse, took a heart pill."},
  metoprololOverdose: {name: "Beta blocker (metoprolol) overdose", correct: "DYSR", dispatch: "Slow and weak, empty beta-blocker bottle found."},
  // Same recurring gap, a 6th time: TOX-004 (scenarios.js) landed with no
  // matching HAND entry, crashing the whole app at module load again.
  // imps/correct match that scenario's own declared values verbatim.
  atropineOverdose: {name: "Anticholinergic toxidrome (atropine/plant alkaloid overdose)", correct: "ODPO", dispatch: "Agitated, confused, flushed and burning hot."},
  // Same recurring gap, a 7th time: RESP-037 (scenarios.js, queue item 28's
  // chlorine hazmat scenario) landed with no matching HAND entry.
  toxicInhalationChlorine: {name: "Toxic gas inhalation (chlorine/irritant gas exposure)", correct: "SOBB", dispatch: "Coughing hard, eyes watering, can't catch his breath."},
};

// Merge: hand-authored name/correct/dispatch (always) + imps/clothing (hand
// value if given, else backfilled from a matching curated scenario, else a
// plain generic default). Covers every key in CONDITIONS — verified by a
// throwaway script (144/144).
// A missing HAND entry has crashed the WHOLE APP at module load seven times
// now (see the comments above), always because a condition landed here
// before its HAND entry did — usually a concurrent session's edit this file
// never saw. That is a real content gap worth fixing at the source, but it
// should never be allowed to take down every save in the game while it's
// unfixed — so a missing entry degrades to a generic placeholder (loudly,
// via console.warn, so it's still visible) instead of throwing.
export const CONDITION_META = Object.fromEntries(Object.keys(CONDITIONS).map((k) => {
  const hand = HAND[k];
  if (!hand) console.warn(`customScenario.js: no HAND entry for condition "${k}" — falls back to a generic placeholder. Add one to HAND.`);
  const auto = SCENARIO_FIELDS_BY_CONDITION[k];
  return [k, {
    name: CONDITION_INFO[k]?.name || hand?.name || k,
    correct: hand?.correct || auto?.imps?.[0] || "ALOC",
    dispatch: hand?.dispatch || "Unspecified presentation — no dispatch text authored yet.",
    imps: hand?.imps || auto?.imps || [hand?.correct || "ALOC"],
    clothing: hand?.clothing || auto?.clothing || DEFAULT_CLOTHING,
  }];
}));

export const CONDITION_LIST = Object.keys(CONDITION_META);

const GENDER_NOUN = {male: "Male", female: "Female", other: "Patient"};

// `conditions`: an array of one or more CONDITION_LIST keys — physiology.js's
// buildPatient() already composes an array of condition keys onto a single
// Patient (see its own header comment), so this just passes the whole
// selection through as `condition` instead of a single string, unchanged
// from how the single-condition case already worked.
export function buildCustomScenario({conditions, age, gender}) {
  const keys = (Array.isArray(conditions) ? conditions : [conditions]).filter((k) => CONDITION_META[k]);
  if (!keys.length) return null;
  const metas = keys.map((k) => ({key: k, ...CONDITION_META[k], tier: CONDITION_TAXONOMY[k]?.tier}));
  // The "primary" condition drives the dispatch text/title/clothing: the
  // first selected EMERGENT condition (a chronic comorbidity like diabetes
  // or hypertension is real background, not the reason dispatch was called),
  // falling back to the first selection if only chronic conditions were
  // picked (an unusual but not-forbidden combination).
  const emergentMetas = metas.filter((m) => m.tier === "emergent");
  const primary = emergentMetas[0] || metas[0];
  const who = GENDER_NOUN[gender] || "Patient";
  const a = Math.max(1, Math.min(105, Number(age) || 40));
  const genderLetter = gender === "male" ? "M" : gender === "female" ? "F" : "";
  const imps = [...new Set(metas.flatMap((m) => m.imps))];
  // Scored against every selected EMERGENT condition's correct code (any one
  // is an acceptable "the" presenting impression); if only chronic
  // conditions were selected, fall back to scoring against all of them —
  // there's no better signal available for that edge case.
  const correctCodes = new Set((emergentMetas.length ? emergentMetas : metas).map((m) => m.correct));
  return {
    cat: "sandbox", id: `CUSTOM-${keys.map((k) => k.toUpperCase()).join("_")}`,
    pronouns: gender === "male" ? "he" : gender === "female" ? "she" : "they",
    title: `${who}, ${a}. ${primary.dispatch}`,
    limit: 1200, transport: 480,
    bystanders: "A bystander flagged you down and is standing back now, watching.",
    units: [],
    dispatch: [`${a}${genderLetter}. ${primary.dispatch}`,
      "Details limited — dispatch is working off a single caller."],
    update: [],
    impression: "You'll have to work this one from scratch — nobody wrote you a script for this presentation.",
    imps,
    condition: keys,
    patient: {age: a, gender},
    // No safe way to merge clothing rules across several conditions (one
    // might imply a dress, another pants+shoes) — the primary condition's
    // own clothing wins, same as everything else primary-driven above.
    clothing: primary.clothing,
    seed: () => ({}),
    probes: {},
    // Generic outcome: died iff the physio engine's own mortality criteria
    // fired (`arr`), correct iff the declared impression matches any
    // selected emergent condition's expected code. No bespoke teaching
    // notes — those only exist for hand-authored scenarios.
    resolve: (s, v, arr) => {
      const died = !!arr, cause = arr?.story || "";
      const notes = [];
      if (!died && s.evidence.length === 0) notes.push("No findings recorded before you committed to a plan. Custom cases grade on the same standard as everything else — a reason has to exist before the action does.");
      const truth = metas.map((m) => m.key === primary.key ? m.name : `${m.name} (comorbidity)`).join("; ");
      return {died, cause, notes, correct: correctCodes.has(s.pi), truth};
    },
  };
}
