// One worked example per NEW NREMT item type (queue: broaden the question
// system beyond multiple choice). Deliberately kept OUT of questionsEMT.js
// (1509 questions, recently repaired — see that file's own header) rather
// than appended there, so this new-format content can be reviewed,
// imported, and iterated on independently of the existing bank. A future
// importer pass can fold these into questionsEMT.js once real content
// volume justifies it; nothing currently reads this file automatically.
//
// Every entry uses the base schema fields (id/domain/level/
// blueprintCategory/clinicalJudgment/explanation) unchanged — see
// questions.js's template comment — plus the itemType-specific fields
// documented in itemTypes.js.

export const EXAMPLE_ITEM_TYPE_QUESTIONS = [
  // multiple_response — "select all that apply," 5-6 choices, 2-3 correct.
  {
    id: "itemtype-mr-001",
    domain: "Airway",
    level: "EMT",
    itemType: "multiple_response",
    blueprintCategory: "primaryAssessment",
    question: "Which findings on primary assessment require immediate intervention before moving on to a secondary assessment?",
    choices: [
      "Absent radial pulses with a palpable carotid pulse",
      "A capillary refill time of 2 seconds",
      "Gurgling respirations",
      "A single 2 cm abrasion on the forearm",
      "Paradoxical chest wall movement",
      "Pink, warm, dry skin",
    ],
    correctIndices: [0, 2, 4],
    explanation:
      "Absent radial pulses signal decompensating shock, gurgling respirations mean the airway needs to be cleared immediately, and paradoxical chest wall movement (flail segment) threatens ventilation. A normal cap refill, a minor abrasion, and normal skin signs are reassuring findings that do not require an immediate intervention.",
  },

  // build_list — ordering/sequencing, exact sequence required.
  {
    id: "itemtype-bl-001",
    domain: "Cardiology",
    level: "EMT",
    itemType: "build_list",
    blueprintCategory: "primaryAssessment",
    question: "Place the following actions in the order they should be performed during the initial approach to an unresponsive adult patient found down.",
    steps: [
      "Confirm scene safety",
      "Check responsiveness",
      "Open the airway and check for breathing",
      "Check for a pulse",
      "Begin chest compressions if pulseless",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "Scene safety always comes first. Once safe to approach, check responsiveness, then open the airway and assess breathing, then check for a pulse, and only then begin compressions if no pulse is found. Skipping ahead to compressions before confirming pulselessness risks compressing a patient who has a perfusing rhythm.",
  },

  // drag_drop — categorization/classification.
  {
    id: "itemtype-dd-001",
    domain: "Trauma",
    level: "EMT",
    itemType: "drag_drop",
    blueprintCategory: "secondaryAssessment",
    question: "Place each finding into the category of immediate life threat or non-immediate finding.",
    categories: [
      { id: "immediate", label: "Immediate Life Threat" },
      { id: "nonImmediate", label: "Non-Immediate Finding" },
    ],
    items: [
      { id: "tension-pneumo", label: "Absent breath sounds on one side with tracheal deviation", correctCategory: "immediate" },
      { id: "open-fracture", label: "An open fracture of the tibia with distal pulses intact", correctCategory: "nonImmediate" },
      { id: "flail-chest", label: "Paradoxical movement of a segment of the chest wall", correctCategory: "immediate" },
      { id: "abrasion", label: "A superficial abrasion to the elbow", correctCategory: "nonImmediate" },
    ],
    explanation:
      "Absent breath sounds with tracheal deviation suggests tension pneumothorax, and a flail segment threatens ventilation — both are immediate life threats needing rapid intervention. A distally-perfused open fracture and a superficial abrasion, while real injuries, are not immediately life-threatening and can be addressed during the secondary assessment.",
  },

  // options_table — per-row classification.
  {
    id: "itemtype-ot-001",
    domain: "Medical + OBGYN",
    level: "EMT",
    itemType: "options_table",
    blueprintCategory: "secondaryAssessment",
    question: "For each finding, identify whether it is an expected finding or an abnormal finding for a patient with a simple febrile illness.",
    options: ["Expected", "Abnormal"],
    rows: [
      { id: "row-hr", finding: "Heart rate mildly elevated proportional to fever", correctOptionIndex: 0 },
      { id: "row-neck", finding: "Nuchal rigidity with photophobia", correctOptionIndex: 1 },
      { id: "row-skin", finding: "Warm, flushed skin", correctOptionIndex: 0 },
      { id: "row-loc", finding: "New confusion and lethargy", correctOptionIndex: 1 },
    ],
    explanation:
      "A proportionally elevated heart rate and warm, flushed skin are expected with fever. Nuchal rigidity with photophobia and new altered mental status are abnormal findings that suggest a more serious process, such as meningitis, and should not be attributed to a simple fever without further evaluation.",
  },

  // graphical, composed with multiple_choice — waveform interpretation.
  {
    id: "itemtype-graphic-001",
    domain: "Cardiology",
    level: "AEMT",
    itemType: "multiple_choice",
    blueprintCategory: "cardiology",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    graphic: {
      kind: "capnography",
      src: "/assets/education/graphics/capnography-shark-fin.svg",
      alt: "Capnography waveform showing a rounded, sloping upstroke without a sharp plateau, resembling a shark fin.",
    },
    question: "This capnography waveform is most consistent with which condition?",
    choices: ["Severe bronchospasm", "Hyperventilation", "Esophageal intubation", "Pulmonary embolism"],
    answerIndex: 0,
    explanation:
      "A rounded, sloping 'shark fin' waveform reflects delayed, uneven alveolar emptying from bronchoconstriction, classic for severe bronchospasm (asthma/COPD exacerbation). Hyperventilation lowers the EtCO2 value but keeps a normal square waveform shape. Esophageal intubation produces a flat or rapidly decaying waveform with no real CO2 return. Pulmonary embolism classically produces a normal-shaped waveform with an abruptly LOW EtCO2 value from dead-space ventilation, not this shape change.",
  },

  // scenario-based — two linked stages sharing one case, different item
  // types per stage, per section 9's own "not every question is identical
  // in structure" instruction.
  {
    id: "itemtype-scn-001a",
    domain: "Airway",
    level: "EMT",
    itemType: "multiple_choice",
    blueprintCategory: "primaryAssessment",
    scenarioId: "scenario-dyspnea-001",
    scenarioStage: "en_route",
    question:
      "Dispatch: 68-year-old male, difficulty breathing, history of COPD. En route, you are told the patient is sitting upright and speaking in short, 2-3 word phrases. What is your immediate priority on arrival?",
    choices: [
      "Obtain a full set of vital signs before any intervention",
      "Perform a rapid primary assessment and address airway/breathing first",
      "Ask the patient's family for a complete medication list",
      "Apply a 12-lead ECG before assessing the airway",
    ],
    answerIndex: 1,
    explanation:
      "Two-to-three-word dyspnea is a red flag for significant respiratory distress. The immediate priority on any patient contact is a rapid primary assessment addressing airway and breathing before moving to vitals, history-taking, or diagnostics that do not treat an unstable airway/breathing problem.",
  },
  {
    id: "itemtype-scn-001b",
    domain: "Airway",
    level: "EMT",
    itemType: "multiple_response",
    blueprintCategory: "primaryAssessment",
    scenarioId: "scenario-dyspnea-001",
    scenarioStage: "scene",
    question:
      "On scene, the same patient has diffuse expiratory wheezing, an SpO2 of 89% on room air, and accessory muscle use. Which findings support administering a bronchodilator?",
    choices: [
      "Diffuse expiratory wheezing",
      "SpO2 of 89% on room air",
      "Accessory muscle use",
      "History of COPD",
      "The patient is sitting upright",
    ],
    correctIndices: [0, 2, 3],
    explanation:
      "Wheezing, accessory muscle use, and a known history of COPD all support bronchospasm as the driver of this patient's distress and a bronchodilator as an appropriate treatment. Low SpO2 supports giving oxygen but is not itself a bronchodilator indication, and sitting upright is a positioning finding, not a pharmacologic indication.",
  },
];
