// Education Medicdle case bank.
//
// Per the Education Mode spec: every Medicdle case must reference a REAL
// condition already represented in src/physio/conditions.js — the same
// condition vocabulary the physiology-engine simulation and the existing
// post-call "doctordle" minigame (src/medicle.js) already use. This file
// must never invent a second, unrelated condition database.
//
// CONDITION_LOOKUP below is built by re-using src/medicle.js's own
// CONDITION_INFO (name + aliases, keyed by the same condition ids that
// appear in physio/conditions.js's CONDITIONS table) and extending it with
// a small number of additional conditions that already exist in
// physio/conditions.js but aren't yet in medicle.js's own smaller subset.
// Extending here does not duplicate medicle.js's data — it composes with it.
import { CONDITION_INFO as SIM_CONDITION_INFO } from "../medicle.js";

// Conditions used by Education Medicdle cases that exist in
// src/physio/conditions.js (confirmed keys: diabeticKetoacidosis,
// hyperkalemiaMissedDialysis, ectopicPregnancyRuptured, statusEpilepticus)
// but are not yet part of medicle.js's own smaller CONDITION_INFO subset.
const EXTRA_CONDITION_INFO = {
  diabeticKetoacidosis: { name: "Diabetic ketoacidosis", aliases: ["dka", "diabetic ketoacidosis"] },
  hyperkalemiaMissedDialysis: { name: "Hyperkalemia", aliases: ["high potassium", "elevated potassium", "hyperkalaemia"] },
  ectopicPregnancyRuptured: { name: "Ectopic pregnancy", aliases: ["ruptured ectopic", "tubal pregnancy"] },
  statusEpilepticus: { name: "Status epilepticus", aliases: ["prolonged seizure", "continuous seizure"] },
};

// The full pool of real condition ids this Medicdle bank can reference,
// each with a real display name — the dropdown guess list is built from
// this pool (plus, per case, the correct condition), never from free text.
export const CONDITION_LOOKUP = { ...SIM_CONDITION_INFO, ...EXTRA_CONDITION_INFO };

export function conditionName(conditionKey) {
  return CONDITION_LOOKUP[conditionKey]?.name || conditionKey;
}

// A sorted list of {key,name} for every condition this bank knows about —
// the base option set every case's dropdown draws its distractors from.
export const ALL_CONDITION_OPTIONS = Object.keys(CONDITION_LOOKUP)
  .map((key) => ({ key, name: CONDITION_LOOKUP[key].name }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Stage labels, in fixed order. Every case supplies exactly one clue string
// per stage. A stage's clue is only ever revealed after the player submits
// a guess for the previous stage.
export const STAGES = [
  "Scene Size-Up",
  "Primary Assessment",
  "Secondary Assessment",
  "In-Field Treatment",
  "In-Hospital Treatment",
];

export const MEDICDLE_CASES = [
  {
    id: "md-001",
    conditionKey: "diabeticKetoacidosis",
    stageClues: [
      "Dispatched for 'unresponsive person.' Apartment, third floor, no elevator. Bystander (roommate) says the patient has seemed 'off' since yesterday and has been in the bathroom a lot.",
      "General impression: a 19-year-old, thin build, sitting slumped against the tub, eyes closed but rousable to voice. Airway patent. Breathing is deep, rapid, and regular — no accessory muscle use. Radial pulse present, rapid. Skin warm and very dry. Initial vitals: RR 32 and deep, HR 118, BP 102/64, SpO2 97%.",
      "SAMPLE: Type 1 diabetes since age 9, hasn't taken insulin in three days ('felt fine, didn't want to deal with it'). No other meds, no allergies. Last oral intake yesterday morning. OPQRST for the 'off' feeling: gradual onset over ~36 hours, worsening. On closer exam: breath has a fruity, acetone-like odor. Mucous membranes dry. Blood glucose reads 'HIGH' — off the top of the glucometer's scale.",
      "En route: high-flow oxygen and a 500 mL normal saline bolus given for suspected severe dehydration; a second line established for a repeat bolus. Cardiac monitor shows sinus tachycardia, no ectopy. Point-of-care blood gas (if carried) or clinical impression suggests significant acidosis given the Kussmaul respirations.",
      "ED workup: venous pH 7.05, bicarbonate 8 mEq/L, glucose 612 mg/dL, large serum ketones, anion gap 28. Started on an insulin infusion and aggressive IV fluid replacement with potassium repletion once renal function and initial potassium are confirmed adequate.",
    ],
    explanation:
      "Insulin deficiency prevents cells from using glucose, so the body burns fat instead, producing ketone acids. The resulting metabolic acidosis drives deep, rapid Kussmaul breathing as the body tries to blow off CO2 and compensate, and glucose spills into the urine, pulling water with it and causing severe dehydration.",
  },
  {
    id: "md-002",
    conditionKey: "stabChestTension",
    stageClues: [
      "Dispatched for 'stabbing, one patient down.' Bar parking lot, scene secured by PD on arrival. Single stab wound reported to the left chest.",
      "General impression: a young adult male, anxious and increasingly short of breath, sitting upright and leaning forward. Airway open, speaking in short sentences. A single puncture wound visible left of the sternum. Breath sounds absent on the left side. Radial pulse present but weak and fast. Initial vitals: RR 28, HR 128, BP 96/70, SpO2 91% on room air.",
      "SAMPLE/secondary: no significant PMHx offered, patient increasingly anxious and restless. On exam: jugular veins are distended despite the falling blood pressure, and the trachea is now palpably deviated away from the injured side. Breathing is worsening by the minute.",
      "Field treatment: an occlusive/vented chest seal applied over the wound, high-flow oxygen given, and needle decompression performed at the second intercostal space, midclavicular line, on the affected side. A rush of air is heard on decompression, and breath sounds and blood pressure improve within a minute of the procedure.",
      "ED workup: chest X-ray confirms a resolving pneumothorax with the needle decompression catheter in place; a chest tube (tube thoracostomy) is placed for definitive management. CT chest rules out major vascular injury.",
    ],
    explanation:
      "Air enters the pleural space through the wound with every breath but has no way out, so pressure builds and collapses the lung. As pressure rises further it pushes the mediastinum toward the opposite side, kinking the great vessels and dropping cardiac output — a true immediately life-threatening emergency treated with needle decompression.",
  },
  {
    id: "md-003",
    conditionKey: "anaphylaxis",
    stageClues: [
      "Dispatched for 'allergic reaction' at a restaurant. Bystanders report the patient ate something with peanuts by mistake about ten minutes ago and started developing hives shortly after.",
      "General impression: an adult female, visibly anxious, scratching at her arms and neck. Airway patent for now, but her voice sounds hoarse. Breathing is rapid with audible wheezing without a stethoscope. Radial pulse present, rapid. Skin flushed, warm, with widespread hives. Initial vitals: RR 26 with wheeze, HR 122, BP 100/62, SpO2 94%.",
      "SAMPLE: known peanut allergy, carries an epinephrine auto-injector but hasn't used it yet. No other significant history. On exam: throat feels 'tight' to the patient, facial and lip swelling now visible, and blood pressure is trending down with the patient becoming lightheaded.",
      "Field treatment: intramuscular epinephrine given, followed by high-flow oxygen, an albuterol nebulizer for the wheeze, and diphenhydramine. Within minutes, wheezing improves and blood pressure begins to recover, though a second epinephrine dose is given en route for a partial rebound in symptoms.",
      "ED workup: observed for biphasic reaction risk, given IV corticosteroids and H1/H2 blockers, and discharged several hours later with a new epinephrine auto-injector prescription and an allergy referral.",
    ],
    explanation:
      "A severe allergic reaction releases histamine and other mediators throughout the body at once, causing airway swelling (angioedema), bronchospasm (wheezing), and widespread vasodilation (distributive shock) simultaneously. Epinephrine is the only drug that reverses all three mechanisms together.",
  },
  {
    id: "md-004",
    conditionKey: "opioidOD",
    stageClues: [
      "Dispatched for 'unconscious person' in a gas station restroom. A patron called after knocking repeatedly with no response.",
      "General impression: a 28-year-old male, unresponsive, slumped against the wall. Airway patent but breathing is very shallow and slow. A used needle and a spoon are visible nearby. Radial pulse present, slow. Initial vitals: RR 4 and shallow, HR 58, BP 96/58, SpO2 82% on room air.",
      "Secondary assessment: pupils are pinpoint bilaterally. Skin is cool and slightly cyanotic around the lips. No visible trauma. No medical alert jewelry. Track marks noted on both forearms.",
      "Field treatment: bag-valve-mask ventilation started immediately, followed by intranasal/IM naloxone. Within two minutes, respiratory rate and level of consciousness improve dramatically, though the patient remains groggy and is monitored closely for re-narcotization en route, since naloxone's effect can wear off before some opioids do.",
      "ED workup: observed for several hours for recurrence of respiratory depression, given supportive care, and offered a take-home naloxone kit and a referral to a substance-use treatment program at discharge.",
    ],
    explanation:
      "Opioids bind mu-opioid receptors in the brainstem's respiratory centers, blunting the drive to breathe. Naloxone competitively displaces the opioid from those same receptors, temporarily reversing the respiratory depression — though it wears off faster than many opioids, so re-narcotization is a real risk.",
  },
  {
    id: "md-005",
    conditionKey: "ami",
    stageClues: [
      "Dispatched for 'chest pain' at a residence. Patient's spouse called 911 after he suddenly stopped raking leaves and sat down, clutching his chest.",
      "General impression: a 58-year-old male, pale and visibly uncomfortable, one hand pressed flat against his sternum (Levine's sign). Airway patent, breathing slightly labored. Radial pulse present, strong but irregular-feeling. Initial vitals: RR 20, HR 96, BP 148/92, SpO2 96%.",
      "OPQRST: sudden onset ~20 minutes ago, crushing/pressure quality, radiating to the left arm and jaw, severity 8/10, nothing makes it better or worse. SAMPLE: history of high cholesterol, smoking, father had a heart attack at 50. Diaphoretic and nauseated. 12-lead ECG shows ST-segment elevation in the inferior leads (II, III, aVF).",
      "Field treatment: aspirin given, nitroglycerin administered after confirming an adequate blood pressure, high-flow oxygen if hypoxic, and the 12-lead transmitted ahead to activate the cardiac catheterization lab. IV access established en route.",
      "Hospital course: emergent cardiac catheterization identifies a completely occluded right coronary artery; a stent is placed, restoring flow. Troponin peaks several hours later, confirming a completed inferior STEMI.",
    ],
    explanation:
      "A coronary artery has become completely blocked, usually by a ruptured atherosclerotic plaque and clot, cutting off blood flow to a section of heart muscle. Without rapid reperfusion, that muscle begins to die — the ST elevation on the ECG corresponds to the injured myocardial territory.",
  },
  {
    id: "md-006",
    conditionKey: "hyperkalemiaMissedDialysis",
    stageClues: [
      "Dispatched for 'weakness' at a residence. Patient tells the family they've felt weak and 'off' since yesterday. Family mentions he's on dialysis and missed his last two sessions.",
      "General impression: an adult male, alert but visibly fatigued, generalized muscle weakness, no distress with breathing. Airway patent. Radial pulse present, somewhat irregular. Initial vitals: RR 18, HR 52 and irregular, BP 138/84, SpO2 98%.",
      "SAMPLE: end-stage renal disease, hemodialysis three times weekly, missed his last two sessions ('didn't have a ride'). No chest pain. On the monitor: ECG shows tall, peaked T waves, and the QRS complex looks slightly wider than normal.",
      "Field treatment: calcium chloride given to stabilize the cardiac membrane, followed by albuterol and sodium bicarbonate to temporarily shift potassium into cells. Within a few minutes, the ECG's peaked T waves and QRS widening visibly improve, though the underlying potassium level is unchanged by these treatments.",
      "ED workup: serum potassium returns at 7.2 mEq/L. Emergent hemodialysis is arranged to actually remove the excess potassium, since the field treatments only temporized the cardiac membrane effects rather than correcting the underlying level.",
    ],
    explanation:
      "Without dialysis, potassium accumulates in the blood because failing kidneys can no longer excrete it. Elevated extracellular potassium disrupts the normal resting membrane potential of cardiac cells, producing a predictable ECG progression from peaked T waves toward a lethal sine-wave pattern. Calcium doesn't lower potassium — it stabilizes the cardiac membrane against its effects, buying time.",
  },
  {
    id: "md-007",
    conditionKey: "ectopicPregnancyRuptured",
    stageClues: [
      "Dispatched for 'abdominal pain' at a workplace. A coworker called after the patient suddenly doubled over with severe one-sided lower abdominal pain and looked like she might pass out.",
      "General impression: a 26-year-old female, pale, diaphoretic, guarding her lower abdomen. Airway patent, breathing rapid. Radial pulse present, rapid and thready. Initial vitals: RR 24, HR 128, BP 88/60, SpO2 97%.",
      "SAMPLE/OPQRST: sudden, severe onset of one-sided lower abdominal pain roughly an hour ago. Last menstrual period was about seven weeks ago; she wasn't aware she might be pregnant. She also reports pain in her left shoulder, unrelated to any injury. No external bleeding is visible.",
      "Field treatment: high-flow oxygen, two large-bore IV lines established with a fluid bolus for suspected internal hemorrhage and hypovolemic shock, patient positioned supine with legs elevated, and rapid transport initiated to a facility capable of emergency surgery, with early notification given en route.",
      "Hospital course: bedside ultrasound and a positive pregnancy test confirm a ruptured ectopic pregnancy with free fluid in the abdomen. Emergent surgery is performed to control the hemorrhage and remove the ruptured tube.",
    ],
    explanation:
      "A fertilized egg implanted outside the uterus, usually in a fallopian tube, has outgrown the space and ruptured, causing internal hemorrhage into the abdominal cavity. Blood irritating the diaphragm causes the classic referred shoulder pain, and the falling blood pressure with rising heart rate reflects compensated hemorrhagic shock from bleeding no dressing can reach.",
  },
  {
    id: "md-008",
    conditionKey: "statusEpilepticus",
    stageClues: [
      "Dispatched for 'seizure' at a residence. Bystanders report the patient has been actively convulsing for over ten minutes without stopping, with no known seizure history.",
      "General impression: an adult, actively convulsing with generalized tonic-clonic movements, cyanotic around the lips. Airway compromised by clenched jaw and irregular breathing between convulsive movements. Radial pulse present, rapid. Initial vitals (limited by ongoing convulsions): RR irregular, HR 128, SpO2 84%.",
      "Secondary assessment is limited by ongoing seizure activity. No medical alert jewelry. No obvious trauma from a fall reported by bystanders. Blood glucose checked and found to be normal, ruling out hypoglycemia as the cause.",
      "Field treatment: airway positioning and high-flow oxygen, followed by a benzodiazepine given per weight-based dosing. The seizure continues despite this first dose; a second dose is given per protocol, with preparations made for advanced airway management if it continues further.",
      "ED workup: a second-line anticonvulsant (such as a load of levetiracetam or fosphenytoin) is given to finally terminate the seizure. Workup for an underlying cause (imaging, labs, EEG) begins once the patient is stabilized, since the prolonged seizure itself was now the primary threat to the brain, independent of whatever caused it.",
    ],
    explanation:
      "A seizure lasting more than 5 minutes, or repeated seizures without full recovery between them, is a true emergency in its own right: the brain's oxygen and glucose demand during continuous seizure activity outpaces supply, and prolonged seizures become progressively harder to terminate the longer they continue, regardless of the underlying cause.",
  },
];

// Build a per-case dropdown option list: the correct condition plus a fixed
// set of plausible distractors drawn from the shared pool, deterministically
// shuffled per case (not per render) so the option order doesn't change
// while a player is mid-case, but still isn't alphabetical-by-answer.
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function dropdownOptionsFor(caseObj) {
  const correct = { key: caseObj.conditionKey, name: conditionName(caseObj.conditionKey) };
  const distractorPool = ALL_CONDITION_OPTIONS.filter((o) => o.key !== caseObj.conditionKey);
  const seed = caseObj.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const shuffledDistractors = seededShuffle(distractorPool, seed).slice(0, 7);
  return seededShuffle([correct, ...shuffledDistractors], seed + 1);
}

export function matchesCondition(guessKey, caseObj) {
  return !!guessKey && guessKey === caseObj.conditionKey;
}

// Deterministic day-of-year-ish index so every player sees the SAME case
// on the same calendar day (no per-user randomness), the same convention
// a daily puzzle needs.
//
// `extraCases` is the approved community pool (medicdleSubmissions.js's
// fetchApprovedMedicdleCases), appended to the built-in bank. It is
// optional and defaults to empty, so this stays the same pure, synchronous
// function it always was. The pool is sorted by id before being appended so
// its order can't depend on Firestore's document order — the day's case
// changes only when the pool's CONTENTS change, never on a rebuild of the
// same data.
export function caseForDate(date = new Date(), extraCases = []) {
  const community = [...(extraCases || [])].filter(Boolean).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const bank = [...MEDICDLE_CASES, ...community];
  const dayNumber = Math.floor(date.getTime() / 86400000);
  const idx = dayNumber % bank.length;
  return bank[idx];
}

export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
