// doctordle.js — data for the end-of-call diagnosis-guessing game shown on
// the debrief screen (App.jsx). Every key here is a real key from
// src/physio/conditions.js's CONDITIONS table — this is a pure display/
// content layer over the engine's own condition vocabulary, not a new
// mechanism, so it belongs in the front-end track, not the physiology one.
//
// Names largely match the existing CONDITION_META in customScenario.js
// (kept identical where both exist, so a patient never gets two different
// display names for the same condition depending on which screen you're
// on). `aliases` are additional accepted guess strings (abbreviations,
// lay terms) — matching is exact-after-normalization, not fuzzy, since the
// vocabulary is fixed and small. `hints` are 3 clinical clues per
// condition, ordered vague-to-specific, phrased to teach the presentation
// without just repeating the name.
export const CONDITION_INFO = {
  aorticDissection: {name: "Aortic dissection", aliases: ["dissecting aneurysm", "dissection"],
    hints: ["Tearing pain that migrated from the chest toward the back.",
      "A blood-pressure or pulse difference between the two arms.",
      "The inner layer of the aorta has split — a plumbing failure, not a pump failure."]},
  chf: {name: "CHF / pulmonary edema", aliases: ["congestive heart failure", "heart failure", "pulmonary edema"],
    hints: ["Wet lung sounds and a patient who can't tolerate lying flat.",
      "The left ventricle can't keep up with venous return, so fluid backs up into the lungs.",
      "Frothy, pink-tinged sputum."]},
  ami: {name: "Acute myocardial infarction", aliases: ["heart attack", "myocardial infarction", "mi", "stemi"],
    hints: ["Crushing substernal chest pressure, possibly radiating to the arm or jaw.",
      "A coronary artery is completely blocked and heart muscle is dying.",
      "The ECG shows ST-segment elevation."]},
  healthyPregnancy: {name: "Healthy pregnancy", aliases: ["normal pregnancy", "labor", "nothing wrong"],
    hints: ["Nothing is actually wrong here — this is normal for the stage of pregnancy.",
      "Cardiac output and blood volume are both physiologically elevated, not pathologically.",
      "This is the baseline every other obstetric condition gets compared against."]},
  copd: {name: "COPD", aliases: ["chronic obstructive pulmonary disease", "emphysema", "chronic bronchitis"],
    hints: ["A long smoking history and a resting baseline you'd call abnormal on anyone else.",
      "Chronically elevated CO2 that the body has already compensated for.",
      "Barrel chest, pursed-lip breathing, home oxygen."]},
  chronicKidneyDisease: {name: "Chronic kidney disease", aliases: ["ckd", "renal failure", "kidney failure"],
    hints: ["A baseline anemia and an electrolyte panel that's already abnormal at rest.",
      "The kidneys can no longer clear what they used to.",
      "A dialysis history, or an arteriovenous fistula on exam."]},
  diabetesT2: {name: "Type 2 diabetes", aliases: ["diabetes", "t2dm", "diabetic"],
    hints: ["An elevated baseline blood glucose that isn't the acute problem by itself.",
      "A chronic metabolic condition sitting underneath whatever brought this patient to your attention.",
      "Check the glucose reading even when nothing else looks abnormal."]},
  chronicHeartFailure: {name: "Chronic heart failure", aliases: ["cardiomyopathy", "chronic chf"],
    hints: ["A ventricle that was already weak before today.",
      "Reduced baseline reserve — this patient decompensates faster than a healthy heart would.",
      "A history of prior heart failure, not a new pump injury."]},
  coronaryArteryDisease: {name: "Coronary artery disease", aliases: ["cad", "atherosclerosis"],
    hints: ["Narrowed coronary arteries as a standing risk factor, not the acute event itself.",
      "This heart has less reserve to draw on when demand spikes.",
      "Usually found paired with another acute cardiac process, not alone."]},
  takotsubo: {name: "Takotsubo (stress) cardiomyopathy", aliases: ["stress cardiomyopathy", "broken heart syndrome"],
    hints: ["A sudden, severe emotional or physical stressor right before symptoms began.",
      "The ventricle balloons out at the apex — not from a blocked artery.",
      "Mimics a heart attack on the monitor, but the coronary arteries are clean."]},
  acquiredLongQT: {name: "Acquired long QT syndrome", aliases: ["long qt", "qt prolongation"],
    hints: ["A prolonged QT interval, often drug-induced.",
      "The substrate for a specific, twisting lethal rhythm, not yet the rhythm itself.",
      "Check the medication list for QT-prolonging drugs."]},
  acs: {name: "Acute coronary syndrome", aliases: ["acs"],
    hints: ["A growing clot in a coronary artery — not yet a completed blockage.",
      "The danger is the trajectory, not just the current snapshot.",
      "What's reversible right now may not be in twenty minutes."]},
  stableAngina: {name: "Stable angina", aliases: ["angina"],
    hints: ["Chest discomfort that shows up with exertion and resolves with rest.",
      "A fixed narrowing that simply can't keep up with demand.",
      "No new muscle damage is occurring — this is a supply-and-demand mismatch."]},
  unstableAngina: {name: "Unstable angina", aliases: [],
    hints: ["Chest pain at rest now, unlike before.",
      "Ischemia without any measurable muscle death — yet.",
      "The pattern has changed from predictable to unpredictable."]},
  nstemi: {name: "NSTEMI", aliases: ["non-stemi", "non-st elevation mi", "subendocardial infarct"],
    hints: ["Troponin would be positive, but the ECG won't show the big ST-elevation pattern.",
      "Only the inner layer of heart muscle is dying, not the full thickness.",
      "The clot is partial, not a complete blockage."]},
  cardiogenicShock: {name: "Cardiogenic shock", aliases: ["pump failure"],
    hints: ["Cold, gray, and hypotensive — the pump itself has failed.",
      "Not enough volume loss to explain the shock; the problem is the pump, not the tank.",
      "Often follows a large heart attack."]},
  svt: {name: "Supraventricular tachycardia", aliases: ["svt", "paroxysmal svt"],
    hints: ["A very fast, very regular narrow-complex rhythm that came on suddenly.",
      "The problem is electrical — a re-entrant circuit above the ventricles.",
      "Often terminates abruptly with a vagal maneuver."]},
  pe: {name: "Pulmonary embolism", aliases: ["pe", "blood clot in the lung"],
    hints: ["Sudden pleuritic chest pain and breathlessness, often with a clear chest on auscultation.",
      "A clot has lodged in the pulmonary circulation, not the coronary one.",
      "Recent immobility, surgery, or a long flight."]},
  fbao: {name: "Foreign body airway obstruction", aliases: ["choking", "airway obstruction", "foreign body"],
    hints: ["Started eating, then suddenly couldn't make a sound.",
      "The obstruction is mechanical, not physiological — no drug fixes this.",
      "The universal choking sign."]},
  crushSyndrome: {name: "Crush syndrome", aliases: ["crush injury"],
    hints: ["A prolonged entrapment under heavy weight.",
      "The danger isn't the injury itself — it's what floods the bloodstream the moment the weight comes off.",
      "Watch potassium and myoglobin once the limb is freed."]},
  opioidOD: {name: "Opioid overdose", aliases: ["opioid od", "heroin overdose", "fentanyl overdose"],
    hints: ["Pinpoint pupils and a respiratory rate you can count on one hand.",
      "A single antagonist reverses this almost completely, briefly.",
      "Track marks or drug paraphernalia nearby."]},
  anaphylaxis: {name: "Anaphylaxis", aliases: ["allergic reaction", "anaphylactic shock"],
    hints: ["A known allergen exposure minutes before symptoms began.",
      "Airway swelling and a distributive drop in vascular tone, both at once.",
      "One drug reverses both the airway and the blood pressure problem."]},
  asthma: {name: "Asthma / bronchospasm", aliases: ["asthma attack", "bronchospasm"],
    hints: ["Wheezing that gets quieter, not louder, as the patient tires — a bad sign, not a good one.",
      "The airways themselves are constricting, trapping air behind them.",
      "A bronchodilator directly targets the mechanism."]},
  appendicitis: {name: "Acute appendicitis", aliases: ["appendix"],
    hints: ["Pain that started around the navel and migrated to the lower right.",
      "Guarding and rebound tenderness over one specific quadrant.",
      "Fever plus a surgical abdomen."]},
  pneumoniaSepsis: {name: "Pneumonia with sepsis / respiratory arrest", aliases: ["pneumonia", "sepsis", "septic shock"],
    hints: ["Days of fever before anyone called — this didn't happen suddenly.",
      "A lung infection has spilled over into the bloodstream.",
      "The two-hit picture: respiratory failure AND circulatory collapse."]},
  seizurePostictal: {name: "Seizure (post-ictal)", aliases: ["seizure", "post-ictal", "postictal"],
    hints: ["Confused, drowsy, and slow to answer, well after any shaking has stopped.",
      "The active electrical storm is already over — you're seeing the aftermath.",
      "Consider what caused it: glucose, sodium, or something intrinsic."]},
  hypoglycemiaMaskedBleed: {name: "Hypoglycemia with a masked bleed", aliases: ["hypoglycemia", "low blood sugar", "masked bleed", "subdural hematoma"],
    hints: ["Correcting the obvious, reversible problem doesn't fully wake the patient up.",
      "Two clocks are running here, and only one of them responds to treatment.",
      "An unwitnessed fall underneath a real metabolic emergency."]},
  polytraumaFall: {name: "Polytrauma — fall", aliases: ["fall", "multi-system trauma"],
    hints: ["A significant fall with more than one injured body system.",
      "No single wound explains the whole picture — several do, together.",
      "The mechanism alone should raise your index of suspicion."]},
  traumaPregnant: {name: "Trauma in pregnancy", aliases: ["pregnant trauma", "maternal trauma"],
    hints: ["Two patients from one event — and the second one has no voice.",
      "Positioning matters here in a way it wouldn't for a non-pregnant patient.",
      "A mechanism that could shear the placenta away from the uterine wall."]},
  polytraumaMoto: {name: "Polytrauma — motorcycle collision", aliases: ["motorcycle crash", "motorcycle accident"],
    hints: ["A high-speed mechanism with minimal protective equipment.",
      "Multiple injured systems from a single violent deceleration.",
      "Road rash is the least of what should worry you."]},
  pediatricDrowning: {name: "Pediatric drowning", aliases: ["drowning", "near drowning", "submersion injury"],
    hints: ["Pulled from the water, not breathing on their own.",
      "The lungs are full of water, not air — think oxygenation before circulation.",
      "A young patient with a submersion history."]},
  abdominalGSW: {name: "Penetrating abdominal trauma (GSW)", aliases: ["gunshot wound", "gsw", "abdominal gunshot"],
    hints: ["A rigid, distended abdomen after a penetrating mechanism.",
      "Internal bleeding you can't see and can't apply direct pressure to.",
      "A wound track that could have hit almost anything in that cavity."]},
  stabChestTension: {name: "Penetrating chest trauma / tension pneumothorax", aliases: ["stabbing", "tension pneumothorax", "stab wound"],
    hints: ["A single puncture wound to the chest, and breathing is getting worse by the minute.",
      "Air trapped in the pleural space with nowhere to go, pushing everything else out of the way.",
      "Tracheal deviation and absent breath sounds on one side."]},
  neonatalTransition: {name: "Neonatal transition", aliases: ["newborn resuscitation", "newborn"],
    hints: ["A baby who hasn't yet made the switch from placental to lung-based breathing.",
      "The first minutes of life are the whole emergency here.",
      "Warm, dry, stimulate — before anything more invasive."]},
  preeclampsia: {name: "Preeclampsia / eclampsia", aliases: ["eclampsia", "pregnancy-induced hypertension", "toxemia"],
    hints: ["New-onset high blood pressure in the second half of pregnancy.",
      "Headache, visual changes, and swelling beyond normal pregnancy edema.",
      "The definitive treatment is delivery — everything else is a bridge to it."]},
};

const norm = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");

// The ground-truth condition keys for a scenario/customParams pair — the
// same shape `SC.condition` (App.jsx) already carries: absent, a bare
// string, or an array. Returns [] for the content-only scenarios (doa,
// prankCall, benignFaint, minorSprain, chronicBackPain) that declare no
// condition at all — there's nothing to guess, so the game should not
// appear rather than being built around a fake single "well patient" entry.
export function groundTruthConditions(SC) {
  if (!SC || !SC.condition) return [];
  const keys = Array.isArray(SC.condition) ? SC.condition : [SC.condition];
  return [...new Set(keys)].filter((k) => CONDITION_INFO[k]);
}

// True if `guess` matches condKey's name or any alias, after normalizing
// both sides (lowercase, punctuation stripped, whitespace collapsed).
export function matchesCondition(guess, condKey) {
  const info = CONDITION_INFO[condKey];
  if (!info) return false;
  const g = norm(guess);
  if (!g) return false;
  return norm(info.name) === g || info.aliases.some((a) => norm(a) === g);
}
