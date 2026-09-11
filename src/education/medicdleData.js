// Education Medicdle case bank — independent of the simulation Medicdle
// (src/medicle.js), which guesses the ground-truth condition of a live
// physiology-engine patient. This is a standalone diagnostic-reasoning
// game: a clinical scenario is revealed progressively, and the player
// guesses the working diagnosis with as little information as possible.
//
// `clues` are ordered vague-to-specific (the same convention medicle.js
// already uses). `aliases` are additional accepted guess strings. Matching
// is exact-after-normalization, mirroring medicle.js's own `matchesCondition`.
export const MEDICDLE_CASES = [
  {
    id: "md-001",
    diagnosis: "Diabetic ketoacidosis",
    aliases: ["dka", "diabetic ketoacidosis"],
    clues: [
      "A 19-year-old found confused and breathing very deeply and fast.",
      "History of Type 1 diabetes; hasn't taken insulin in three days because they 'felt fine.'",
      "Breath has a fruity, acetone-like odor.",
      "Blood glucose reads 'HIGH' — off the top of the glucometer's scale.",
      "Kussmaul respirations, dry mucous membranes, and a serum pH of 7.05.",
    ],
    explanation:
      "Insulin deficiency prevents cells from using glucose, so the body burns fat instead, producing ketone acids. The resulting metabolic acidosis drives deep, rapid Kussmaul breathing as the body tries to blow off CO2 and compensate, and glucose spills into the urine, pulling water with it and causing severe dehydration.",
  },
  {
    id: "md-002",
    diagnosis: "Tension pneumothorax",
    aliases: ["tension pneumo"],
    clues: [
      "A patient with a single stab wound to the chest is becoming increasingly short of breath.",
      "Breath sounds are absent on the injured side.",
      "Jugular veins are distended despite the patient being hypotensive.",
      "The trachea is deviating away from the injured side.",
      "Blood pressure is falling and the patient is becoming tachycardic and anxious.",
    ],
    explanation:
      "Air enters the pleural space through the wound with every breath but has no way out, so pressure builds and collapses the lung. As pressure rises further it pushes the mediastinum toward the opposite side, kinking the great vessels and dropping cardiac output — a true immediately life-threatening emergency treated with needle decompression.",
  },
  {
    id: "md-003",
    diagnosis: "Anaphylaxis",
    aliases: ["anaphylactic shock", "severe allergic reaction"],
    clues: [
      "A patient develops hives and itching minutes after eating at a restaurant.",
      "They report their throat 'feels tight' and their voice is hoarse.",
      "Widespread wheezing is audible without a stethoscope.",
      "Blood pressure is dropping and the patient is becoming lightheaded.",
      "Facial and lip swelling is now visible, and skin is flushed and warm.",
    ],
    explanation:
      "A severe allergic reaction releases histamine and other mediators throughout the body at once, causing airway swelling (angioedema), bronchospasm (wheezing), and widespread vasodilation (distributive shock) simultaneously. Epinephrine is the only drug that reverses all three mechanisms together.",
  },
  {
    id: "md-004",
    diagnosis: "Opioid overdose",
    aliases: ["opioid od", "heroin overdose", "fentanyl overdose"],
    clues: [
      "A 28-year-old found unresponsive in a gas station bathroom.",
      "Respiratory rate is 4 breaths per minute and shallow.",
      "A used needle is found near the patient.",
      "Pupils are pinpoint bilaterally.",
      "One dose of a specific antagonist rapidly restores adequate breathing.",
    ],
    explanation:
      "Opioids bind mu-opioid receptors in the brainstem's respiratory centers, blunting the drive to breathe. Naloxone competitively displaces the opioid from those same receptors, temporarily reversing the respiratory depression — though it wears off faster than many opioids, so re-narcotization is a real risk.",
  },
  {
    id: "md-005",
    diagnosis: "Acute myocardial infarction",
    aliases: ["heart attack", "mi", "stemi", "myocardial infarction"],
    clues: [
      "A 58-year-old male with crushing substernal chest pressure that started while raking leaves.",
      "Pain radiates to the left arm and jaw.",
      "Diaphoretic, nauseated, and anxious.",
      "12-lead ECG shows ST-segment elevation in the inferior leads.",
      "History of high cholesterol, smoking, and a father who had a heart attack at 50.",
    ],
    explanation:
      "A coronary artery has become completely blocked, usually by a ruptured atherosclerotic plaque and clot, cutting off blood flow to a section of heart muscle. Without rapid reperfusion, that muscle begins to die — the ST elevation on the ECG corresponds to the injured myocardial territory.",
  },
  {
    id: "md-006",
    diagnosis: "Hyperkalemia",
    aliases: ["high potassium", "elevated potassium"],
    clues: [
      "A dialysis patient who missed their last two sessions feels weak and 'off.'",
      "Muscle weakness and generalized fatigue, no chest pain.",
      "ECG shows tall, peaked T waves.",
      "As the QRS widens further, it begins to resemble a sine wave.",
      "Calcium chloride is given, and the ECG changes visibly improve within minutes.",
    ],
    explanation:
      "Without dialysis, potassium accumulates in the blood because failing kidneys can no longer excrete it. Elevated extracellular potassium disrupts the normal resting membrane potential of cardiac cells, producing a predictable ECG progression from peaked T waves toward a lethal sine-wave pattern. Calcium doesn't lower potassium — it stabilizes the cardiac membrane against its effects, buying time.",
  },
  {
    id: "md-007",
    diagnosis: "Ectopic pregnancy",
    aliases: ["ruptured ectopic", "tubal pregnancy"],
    clues: [
      "A 26-year-old with sudden, severe one-sided lower abdominal pain.",
      "Last menstrual period was about 7 weeks ago.",
      "Pale, diaphoretic, and reports feeling like she might pass out.",
      "Referred shoulder pain is noted, unrelated to any injury.",
      "Blood pressure is falling and heart rate is climbing despite no external bleeding visible.",
    ],
    explanation:
      "A fertilized egg implanted outside the uterus, usually in a fallopian tube, has outgrown the space and ruptured, causing internal hemorrhage into the abdominal cavity. Blood irritating the diaphragm causes the classic referred shoulder pain, and the falling blood pressure with rising heart rate reflects compensated hemorrhagic shock from bleeding no dressing can reach.",
  },
  {
    id: "md-008",
    diagnosis: "Status epilepticus",
    aliases: ["prolonged seizure", "continuous seizure"],
    clues: [
      "A patient has been actively convulsing for over 10 minutes without stopping.",
      "No known seizure history, and bystanders say this started suddenly.",
      "Jaw is clenched, breathing is irregular between convulsive movements.",
      "A benzodiazepine is given but the seizure continues.",
      "The prolonged, unrelenting seizure activity itself is now the primary threat to the brain, independent of its cause.",
    ],
    explanation:
      "A seizure lasting more than 5 minutes, or repeated seizures without full recovery between them, is a true emergency in its own right: the brain's oxygen and glucose demand during continuous seizure activity outpaces supply, and prolonged seizures become progressively harder to terminate the longer they continue, regardless of the underlying cause.",
  },
];

const norm = (s) => (s || "").toLowerCase().trim().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");

export function matchesDiagnosis(guess, caseObj) {
  const g = norm(guess);
  if (!g) return false;
  return norm(caseObj.diagnosis) === g || caseObj.aliases.some((a) => norm(a) === g);
}

// Deterministic day-of-year-ish index so every player sees the SAME case
// on the same calendar day (no per-user randomness), the same convention
// a daily puzzle needs.
export function caseForDate(date = new Date()) {
  const dayNumber = Math.floor(date.getTime() / 86400000);
  const idx = dayNumber % MEDICDLE_CASES.length;
  return MEDICDLE_CASES[idx];
}

export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
