// ============================================================================
// NREMT PRACTICE QUESTION BANK
// ============================================================================
// To add a question, just push another object onto QUESTIONS below. Shape:
//
// {
//   id: "unique-string-id",       // never reuse/change once a card exists,
//                                  // it's the key progress is tracked under
//   domain: "Airway",              // must be one of DOMAINS_BY_LEVEL[level] below
//   level: "EMT",                  // one of LEVELS below: EMR, EMT, AEMT, Paramedic, Other
//   question: "...",
//   choices: ["A answer", "B answer", "C answer", "D answer"],
//   answerIndex: 0,                 // index into choices
//   explanation: "Why the answer is correct, and why the others are wrong.",
// }
//
// The dashboard first asks which certification level (EMR/EMT/AEMT/
// Paramedic/Other) to study, then shows that level's domain buttons (see
// DOMAINS_BY_LEVEL below) and only that level's questions.
// ============================================================================

export const LEVELS = ["EMR", "EMT", "AEMT", "Paramedic", "Other"];

// Which domain buttons show up on the dashboard for a given certification
// level. EMT is split exactly as requested: Airway, Cardiology, Trauma,
// Medical + OBGYN, EMS Operations. Other levels default to the same five
// until level-specific content/splits are added — extend this map (and add
// questions tagged with that `level`) whenever that's wanted.
export const DOMAINS_BY_LEVEL = {
  EMR: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
  EMT: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
  AEMT: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
  Paramedic: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
  Other: ["Airway", "Cardiology", "Trauma", "Medical + OBGYN", "EMS Operations"],
};

// Back-compat flat list (union of every level's domains), still useful for
// anything that wants "every domain that exists" regardless of level.
export const DOMAINS = [...new Set(Object.values(DOMAINS_BY_LEVEL).flat())];

// ----------------------------------------------------------------------------
// TEMPLATE — copy this block, fill it in, and paste it into QUESTIONS below.
// ----------------------------------------------------------------------------
// {
//   id: "domain-prefix-###",        // e.g. "airway-012", "ops-007" — pick the
//                                    // next unused number for that domain's
//                                    // prefix (see the existing entries below
//                                    // for the prefix each domain uses)
//   domain: "Airway",                // must match a value in DOMAINS_BY_LEVEL
//   level: "EMT",                    // EMR, EMT, AEMT, Paramedic, or Other
//   blueprintCategory: "primaryAssessment", // optional — one of the keys in
//                                    // contentBlueprint.js's BLUEPRINT_CATEGORIES
//                                    // (sceneSafety/primaryAssessment/
//                                    // secondaryAssessment/treatmentTransport/
//                                    // operations). Overrides the domain-based
//                                    // heuristic default when the heuristic
//                                    // would miscategorize this specific
//                                    // question (e.g. a Cardiology question
//                                    // that's actually testing scene safety).
//                                    // Omit to fall back to the heuristic.
//   question:
//     "Full text of the question stem goes here.",
//   choices: [
//     "Choice A",
//     "Choice B",
//     "Choice C",
//     "Choice D",
//   ],
//   answerIndex: 0,                  // 0 = Choice A, 1 = Choice B, etc.
//   explanation:
//     "Explain why the correct answer is right and, briefly, why the other " +
//     "choices are wrong. This is shown to the user after they answer.",
// },
// ----------------------------------------------------------------------------

export const QUESTIONS = [
  {
    id: "airway-001",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient is unresponsive with slow, shallow, irregular breathing after a head injury. What is the FIRST action?",
    choices: [
      "Apply a nonrebreather mask at 15 L/min",
      "Open the airway and begin positive-pressure ventilation",
      "Insert a nasopharyngeal airway and reassess",
      "Place the patient in the recovery position",
    ],
    answerIndex: 1,
    explanation:
      "Slow, shallow, irregular respirations are inadequate breathing and need immediate positive-pressure ventilation, not just supplemental oxygen. Airway opening (jaw-thrust for suspected head/spine injury) comes first, but ventilation must follow right away, not be deferred.",
  },
  {
    id: "airway-002",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which finding best indicates that a supraglottic airway (e.g. King LT) has been placed correctly?",
    choices: [
      "Resistance felt on insertion",
      "Bilateral chest rise and clear breath sounds bilaterally with ventilation",
      "The patient gags on insertion",
      "A change in the patient's skin color",
    ],
    answerIndex: 1,
    explanation:
      "Confirmation of any airway device is by chest rise plus bilateral breath sounds (and absent epigastric sounds) with ventilation, ideally supported by waveform capnography. Resistance or gagging are not confirmation of correct placement.",
  },
  {
    id: "airway-003",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A conscious adult is choking, coughing forcefully, and able to speak. What should you do?",
    choices: [
      "Perform abdominal thrusts immediately",
      "Encourage continued coughing and monitor closely",
      "Perform back blows",
      "Sweep the mouth with a finger",
    ],
    answerIndex: 1,
    explanation:
      "A conscious patient with a mild (partial) airway obstruction who can cough forcefully and speak has adequate air exchange. Do not intervene physically; encourage coughing and stay ready to act if the obstruction becomes severe.",
  },
  {
    id: "airway-004",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What is the most reliable way to confirm and continuously monitor correct endotracheal tube placement in the field?",
    choices: [
      "Auscultation of breath sounds alone",
      "Waveform capnography",
      "Pulse oximetry",
      "Direct visualization one time during intubation",
    ],
    answerIndex: 1,
    explanation:
      "Continuous waveform capnography is the gold standard for confirming and continuously monitoring ET tube placement; auscultation and a single visual confirmation can be misleading and don't detect later displacement.",
  },
  {
    id: "airway-005",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A nasopharyngeal airway is contraindicated in which patient?",
    choices: [
      "A conscious patient with an intact gag reflex",
      "A patient with suspected basilar skull fracture",
      "A patient in respiratory distress",
      "A patient with a clenched jaw (trismus)",
    ],
    answerIndex: 1,
    explanation:
      "An NPA is relatively contraindicated with suspected basilar skull/severe facial fracture because of the (rare but serious) risk of intracranial placement. It is actually the preferred airway adjunct for a conscious patient or one with trismus, since it is tolerated with a gag reflex.",
  },

  {
    id: "cardio-001",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "For an adult in cardiac arrest, what is the recommended compression-to-ventilation ratio with a single rescuer and no advanced airway?",
    choices: ["15:2", "30:2", "5:1", "Continuous compressions with no ventilations"],
    answerIndex: 1,
    explanation:
      "Current AHA guidelines use 30:2 for adult CPR with one or two rescuers before an advanced airway is placed. Once an advanced airway is in place, ventilations become asynchronous at 1 breath every 6 seconds with continuous compressions.",
  },
  {
    id: "cardio-002",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An AED analyzes a rhythm and advises 'no shock indicated' in a pulseless, apneic patient. What should you do next?",
    choices: [
      "Assume the patient has a pulse and stop CPR",
      "Immediately resume high-quality CPR starting with compressions",
      "Remove the AED pads and reassess in 5 minutes",
      "Give rescue breaths only, no compressions",
    ],
    answerIndex: 1,
    explanation:
      "'No shock advised' means the rhythm is not a shockable rhythm (e.g. asystole or PEA) — it does NOT mean return of a pulse. CPR should resume immediately, starting with chest compressions.",
  },
  {
    id: "cardio-003",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which chief complaint pairing is most classic for cardiac tamponade?",
    choices: [
      "Muffled heart sounds, JVD, and hypotension (Beck's triad)",
      "Tracheal deviation and unilateral absent breath sounds",
      "Barrel chest and pursed-lip breathing",
      "Crushing substernal chest pain radiating to the jaw only",
    ],
    answerIndex: 0,
    explanation:
      "Beck's triad — muffled/distant heart sounds, jugular venous distension, and hypotension — is the classic presentation of cardiac tamponade. Tracheal deviation with unilateral absent breath sounds instead points to tension pneumothorax.",
  },
  {
    id: "cardio-004",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A 68-year-old with a history of angina reports crushing chest pain. His BP is 82/58. He has taken his own nitroglycerin twice with no relief. Should EMS give another dose of nitroglycerin?",
    choices: [
      "Yes, nitroglycerin is safe regardless of blood pressure",
      "No, his blood pressure is below the threshold to safely administer nitroglycerin",
      "Yes, but only if he denies erectile-dysfunction medication use",
      "No, nitroglycerin is never given for cardiac chest pain",
    ],
    answerIndex: 1,
    explanation:
      "Nitroglycerin is a potent vasodilator and is withheld when systolic BP is below the local protocol threshold (commonly <100-110 mmHg) because it will worsen hypotension. Checking for PDE-5 inhibitor use matters too, but the immediate contraindication here is the low blood pressure itself.",
  },
  {
    id: "cardio-005",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What is the earliest and most reliable sign of inadequate perfusion (compensated shock) in most patients?",
    choices: [
      "Falling blood pressure",
      "Tachycardia and delayed capillary refill",
      "Cyanosis",
      "Absent radial pulses",
    ],
    answerIndex: 1,
    explanation:
      "Blood pressure is a late finding in shock because of compensatory mechanisms. Tachycardia, along with cool/pale/diaphoretic skin and delayed capillary refill, appears earlier as the body tries to compensate for poor perfusion.",
  },

  {
    id: "trauma-001",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient has an open chest wound that makes a sucking sound with each breath. What is the correct immediate treatment?",
    choices: [
      "Cover it with a dry, sterile dressing taped on all four sides",
      "Apply an occlusive dressing sealed on three sides",
      "Leave the wound completely uncovered",
      "Pack the wound tightly with gauze",
    ],
    answerIndex: 1,
    explanation:
      "An open (sucking) chest wound is sealed with an occlusive/vented dressing taped on three sides, creating a one-way valve that lets air escape on exhalation but prevents air from being drawn in on inhalation — reducing the risk of tension pneumothorax.",
  },
  {
    id: "trauma-002",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Signs of a tension pneumothorax include all of the following EXCEPT:",
    choices: [
      "Jugular venous distension",
      "Tracheal deviation away from the affected side",
      "Bradycardia and hypertension",
      "Absent breath sounds on the affected side with severe respiratory distress",
    ],
    answerIndex: 2,
    explanation:
      "Tension pneumothorax causes progressive hypotension and tachycardia (obstructive shock), not bradycardia and hypertension. JVD, tracheal deviation away from the affected side, and unilateral absent breath sounds with severe distress are all classic findings.",
  },
  {
    id: "trauma-003",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "For a patient with life-threatening extremity hemorrhage that direct pressure has not controlled, what should you do next?",
    choices: [
      "Elevate the extremity above the heart and wait",
      "Apply a tourniquet proximal to the wound",
      "Apply ice directly to the wound",
      "Apply a pressure dressing loosely so as not to cut off circulation",
    ],
    answerIndex: 1,
    explanation:
      "When direct pressure fails to control life-threatening extremity hemorrhage, a tourniquet should be applied proximal to the bleeding site without delay. Current guidance no longer relies on elevation as a primary hemorrhage control step.",
  },
  {
    id: "trauma-004",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient fell 20 feet onto concrete and is unresponsive. What is the priority regarding spinal motion restriction?",
    choices: [
      "Spinal motion restriction is not needed unless the patient reports neck pain",
      "Maintain manual in-line spinal motion restriction based on mechanism and presentation",
      "Sit the patient up to assess their spine directly",
      "Spinal motion restriction is only used for penetrating trauma",
    ],
    answerIndex: 1,
    explanation:
      "A significant fall mechanism combined with an unresponsive patient (who cannot reliably report pain) warrants spinal motion restriction. Modern protocols use clinical judgment/selective immobilization criteria rather than immobilizing every trauma patient, but a high-risk mechanism plus an unreliable exam meets the threshold.",
  },
  {
    id: "trauma-005",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "In a multiple-casualty incident using START triage, a patient who is not breathing even after the airway is repositioned is triaged as:",
    choices: ["Immediate (Red)", "Delayed (Yellow)", "Deceased/Expectant (Black)", "Minor (Green)"],
    answerIndex: 2,
    explanation:
      "In START triage, if a patient is apneic even after airway repositioning, they are tagged deceased/expectant (black). If repositioning the airway restores breathing, they are tagged immediate (red).",
  },

  {
    id: "medical-001",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A diabetic patient is confused, diaphoretic, and combative but able to swallow safely. Blood glucose is 42 mg/dL. What is the appropriate treatment?",
    choices: [
      "Administer oral glucose between the cheek and gum",
      "Give nothing by mouth and transport immediately",
      "Administer naloxone",
      "Give an insulin injection to normalize glucose",
    ],
    answerIndex: 0,
    explanation:
      "For symptomatic hypoglycemia in a patient who can protect their airway and swallow, oral glucose is appropriate. Naloxone treats opioid overdose, not hypoglycemia, and insulin would worsen this patient's condition.",
  },
  {
    id: "medical-002",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient with a known bee-sting allergy has hives, wheezing, and a blood pressure of 78/50 after being stung. What is the priority medication?",
    choices: ["Diphenhydramine (Benadryl)", "Epinephrine", "Albuterol only", "Naloxone"],
    answerIndex: 1,
    explanation:
      "Anaphylaxis with hypotension and respiratory compromise is a life threat treated with epinephrine first (IM auto-injector), which reverses vasodilation and bronchospasm. Diphenhydramine and albuterol are adjuncts, not first-line for anaphylactic shock.",
  },
  {
    id: "medical-003",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which stroke assessment tool checks facial droop, arm drift, and speech?",
    choices: ["APGAR score", "Cincinnati Prehospital Stroke Scale", "Glasgow Coma Scale", "SAMPLE history"],
    answerIndex: 1,
    explanation:
      "The Cincinnati Prehospital Stroke Scale (CPSS) checks facial droop, arm drift, and abnormal speech to rapidly screen for stroke. GCS assesses level of consciousness generally; APGAR is a newborn assessment; SAMPLE is a history-taking mnemonic.",
  },
  {
    id: "medical-004",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient having a suspected opioid overdose is breathing 4 times per minute with pinpoint pupils. After giving naloxone, what should you continue to do?",
    choices: [
      "Nothing further is needed once naloxone is given",
      "Continue supporting ventilations and reassess frequently, since naloxone can wear off before the opioid does",
      "Withhold oxygen because naloxone corrects breathing completely",
      "Restrain the patient regardless of response",
    ],
    answerIndex: 1,
    explanation:
      "Naloxone's duration of action is often shorter than that of the opioid, so the patient can re-sedate. Continue supporting ventilation, reassess frequently, and be prepared to redose naloxone or continue BVM support.",
  },
  {
    id: "medical-005",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with a history of seizures is found actively convulsing. What is the EMT's primary role during the seizure itself?",
    choices: [
      "Restrain the patient's limbs to stop the movements",
      "Place a bite block between the teeth",
      "Protect the patient from injury and maintain a patent airway as able; do not restrain",
      "Pour water on the patient to cool them",
    ],
    answerIndex: 2,
    explanation:
      "During active seizure activity, move nearby hazards away, protect the head, and prepare to manage the airway post-ictally. Do not restrain the patient or force anything into the mouth (bite blocks/tongue blades can cause injury and are not recommended).",
  },
  {
    id: "medical-006",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Kussmaul respirations (deep, rapid breathing) in a diabetic patient are most consistent with:",
    choices: [
      "Hypoglycemia",
      "Diabetic ketoacidosis (DKA)",
      "A normal finding in diabetics",
      "Opioid overdose",
    ],
    answerIndex: 1,
    explanation:
      "Kussmaul respirations are a compensatory response to the metabolic acidosis of DKA, as the body tries to blow off CO2. Hypoglycemia and opioid overdose more typically cause altered mental status and slowed/shallow breathing, respectively.",
  },

  {
    id: "obgyn-001",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "During a normal delivery, the newborn's head has just delivered and the umbilical cord is wrapped tightly around the neck. What should you do?",
    choices: [
      "Pull the baby out quickly to relieve the cord",
      "Attempt to slip the cord gently over the head; if it won't slip, clamp and cut it",
      "Cut the cord immediately regardless of tension",
      "Push the head back into the birth canal",
    ],
    answerIndex: 1,
    explanation:
      "A nuchal cord is managed by attempting to gently slip it over the infant's head. If it is too tight to slip, it should be clamped in two places and cut between the clamps before delivery continues.",
  },
  {
    id: "obgyn-002",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A pregnant patient in her third trimester becomes hypotensive when lying supine. What is the likely cause and correction?",
    choices: [
      "Dehydration; give oral fluids",
      "Supine hypotensive syndrome from uterine compression of the vena cava; position her on her left side",
      "Anaphylaxis; give epinephrine",
      "A vasovagal reaction; have her stand up",
    ],
    answerIndex: 1,
    explanation:
      "In late pregnancy, the gravid uterus can compress the inferior vena cava when the patient is supine, reducing venous return and causing hypotension. Positioning the patient on her left side (or tilting the backboard) relieves the compression.",
  },
  {
    id: "obgyn-003",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A pregnant patient in labor has a visible limb presenting from the vagina instead of the head. What should EMS do?",
    choices: [
      "Attempt to push the limb back in and deliver normally",
      "Pull gently on the limb to assist delivery",
      "Do not attempt delivery in the field; position the mother knees-to-chest/hips elevated and transport emergently",
      "Tell the mother to push harder",
    ],
    answerIndex: 2,
    explanation:
      "A limb presentation (a form of malpresentation) cannot be safely delivered in the field. Position the mother with hips elevated (knee-chest or Trendelenburg-type positioning) to reduce pressure on the presenting part and transport immediately without attempting delivery.",
  },

  {
    id: "ops-001",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which of the following best describes an EMT's scope of practice?",
    choices: [
      "Whatever the EMT personally feels comfortable performing",
      "Defined by state law/regulation, medical director's protocols, and the EMT's training and certification",
      "Identical everywhere in the country",
      "Whatever the patient requests",
    ],
    answerIndex: 1,
    explanation:
      "Scope of practice is legally defined at the state level and further shaped by local protocols and medical direction, combined with the individual's certification/training level — it is not a matter of personal comfort or patient preference.",
  },
  {
    id: "ops-002",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "A conscious, alert adult patient refuses transport against medical advice. What must EMS do?",
    choices: [
      "Transport anyway if EMS disagrees with the decision",
      "Ensure the patient has decision-making capacity, inform them of risks, and document the refusal thoroughly (ideally with a witness signature)",
      "Simply leave without any documentation",
      "Call law enforcement to force transport in all cases",
    ],
    answerIndex: 1,
    explanation:
      "A patient with intact decision-making capacity has the right to refuse care/transport. EMS must confirm capacity, clearly explain the risks of refusal, and thoroughly document the encounter, typically with a witnessed refusal form.",
  },
  {
    id: "ops-003",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "At a hazardous materials incident, where should EMS stage and treat contaminated patients who have NOT yet been decontaminated?",
    choices: [
      "In the hot zone",
      "In the warm zone, only after appropriate PPE and decon procedures",
      "Anywhere convenient, decontamination is not necessary before treatment",
      "In the cold zone immediately",
    ],
    answerIndex: 1,
    explanation:
      "Patient decontamination happens in the warm zone by appropriately trained/PPE-equipped personnel. Definitive treatment and transport occur from the cold zone after decontamination — contaminated patients should not be brought directly into the cold zone.",
  },
  {
    id: "ops-004",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which statement about BSI (body substance isolation) / standard precautions is correct?",
    choices: [
      "PPE is only needed if the patient is known to have an infectious disease",
      "Standard precautions should be used with every patient, regardless of known infection status",
      "Gloves alone are sufficient for all calls regardless of exposure risk",
      "BSI is optional if the call seems low-risk",
    ],
    answerIndex: 1,
    explanation:
      "Standard precautions treat all body fluids as potentially infectious and should be applied to every patient contact, since infection status is often unknown at the time of care.",
  },
  {
    id: "ops-005",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is the correct order of triage priority under most MCI (mass casualty incident) systems?",
    choices: [
      "Green, Yellow, Red, Black",
      "Red (immediate), Yellow (delayed), Green (minor), Black (deceased/expectant)",
      "Black, Red, Green, Yellow",
      "Whoever called 911 first is treated first",
    ],
    answerIndex: 1,
    explanation:
      "Standard MCI triage priority for treatment/transport is Red (immediate, life-threatening but survivable) first, then Yellow (delayed), then Green (minor/walking wounded), with Black (deceased/expectant) receiving no active resuscitation given limited resources.",
  },
  {
    id: "ops-006",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You respond to a park for a 15-year-old male with a severe, life-threatening leg injury. Bystanders called 911 because they can't reach his parents. Under what form of consent can you begin treating him?",
    choices: [
      "Implied consent",
      "Revoked consent",
      "Expressed consent",
      "Informed consent",
    ],
    answerIndex: 0,
    explanation:
      "When a parent or legal guardian can't be reached and the patient has a life-threatening condition, care must not be delayed. You proceed under implied consent, which is assumed for an unconscious, mentally altered, or (as here) minor patient with a serious injury whose guardian is unavailable. Expressed consent applies only when a mentally competent adult actually accepts or refuses care themselves.",
  },
  {
    id: "airway-011",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "You arrive to find a patient who fell from a roof and is now apneic. During your primary assessment you determine you need to open the airway. What is the correct technique?",
    choices: [
      "Head-tilt chin-lift maneuver",
      "Jaw-thrust maneuver",
      "Push down on the lower jaw with your fingers at the teeth",
      "Slowly tilt the head back just enough to avoid moving the spine",
    ],
    answerIndex: 1,
    explanation:
      "Whenever trauma raises concern for a spinal injury, use the jaw-thrust maneuver to open the airway, since it moves only the mandible and doesn't extend the neck. The head-tilt chin-lift moves the cervical spine even when done slowly, which is unsafe if spinal injury hasn't been ruled out. If jaw-thrust fails to open the airway adequately, head-tilt chin-lift can be used as a last resort.",
  },
   {
    id: "nremt-emt-cardiology-001",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "A patient is experiencing left-sided heart failure. Which type of edema would you most expect to find?",
    choices: [
      "Pulmonary edema",
      "Systemic edema",
      "Macular edema",
      "Edema of the lower back"
    ],
    answerIndex: 0,
    explanation: "Left-sided heart failure causes blood to back up into the pulmonary circulation because the left ventricle cannot effectively pump blood out of the lungs. This increased pressure causes fluid to move into the lung tissue and alveoli, resulting in pulmonary edema. Pulmonary edema interferes with gas exchange and can cause severe respiratory distress. Systemic peripheral edema is more characteristic of right-sided heart failure."
  },

  {
    id: "nremt-emt-endocrine-001",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "What metabolic process is responsible for the fruity or acetone-like breath that may occur in a patient with type 1 diabetes?",
    choices: [
      "Hyperglycemic hyperosmolar syndrome",
      "Hypoglycemia",
      "Diabetic ketoacidosis (DKA)",
      "Insufficient dietary sugar"
    ],
    answerIndex: 2,
    explanation: "Diabetic ketoacidosis, or DKA, commonly occurs in patients with type 1 diabetes when there is insufficient insulin. Without enough insulin, the body begins breaking down fat for energy, producing acidic substances called ketones. Elevated ketone levels can produce a characteristic fruity or acetone-like odor on the patient's breath. DKA can progress to altered mental status, coma, and death if untreated."
  },

  {
    id: "nremt-emt-trauma-001",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "An injured patient has a large open wound to the neck. Which type of dressing should the EMT apply?",
    choices: [
      "A non-occlusive dressing",
      "An occlusive dressing sealed on all four sides",
      "An occlusive dressing secured on three sides",
      "Gauze pads secured with an adhesive bandage"
    ],
    answerIndex: 1,
    explanation: "A major open wound of the neck should be covered with an occlusive dressing sealed on all four sides to prevent air from entering or escaping through the wound. This differs from an open chest wound, where a three-sided occlusive dressing may be used to allow trapped air to escape during exhalation. Neck wounds require particular attention because air entering the wound can cause serious complications."
  },
  {
    id: "nremt-emt-medical-obgyn-001",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "When a newborn presents with the buttocks or feet appearing first rather than the head, what is this presentation called?",
    choices: [
      "Breech presentation",
      "Placenta previa",
      "Meconium passage",
      "Precipitous delivery"
    ],
    answerIndex: 0,
    explanation: "A breech presentation occurs when the baby's buttocks or feet are positioned to emerge before the head. This abnormal presentation can create complications during delivery and requires appropriate EMS management. Placenta previa involves the placenta covering or approaching the cervical opening. Meconium is a newborn's first stool, while a precipitous delivery is an unusually rapid birth."
  },

  {
    id: "nremt-emt-airway-001",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which structure marks the boundary between the upper and lower portions of the airway?",
    choices: [
      "Pharynx",
      "Oropharynx",
      "Nasopharynx",
      "Laryngopharynx"
    ],
    answerIndex: 3,
    explanation: "The laryngopharynx is considered the transition point between the upper and lower airway. The pharynx as a whole consists of the nasopharynx, oropharynx, and laryngopharynx. Structures below this region include the larynx and trachea."
  },

  {
    id: "nremt-emt-cardiology-002",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which of the following cardiac rhythms is generally considered the most immediately fatal?",
    choices: [
      "Ventricular fibrillation",
      "Pulseless electrical activity (PEA)",
      "Asystole",
      "Ventricular tachycardia"
    ],
    answerIndex: 2,
    explanation: "Asystole represents the absence of meaningful electrical activity in the heart and is associated with no cardiac output. PEA involves organized electrical activity without a palpable pulse. Ventricular fibrillation and pulseless ventricular tachycardia are shockable rhythms and may respond to defibrillation. In actual patient care, all pulseless rhythms require immediate resuscitation."
  },

  {
    id: "nremt-emt-trauma-002",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A 32-year-old man is thrown from his motorcycle after colliding with a car. He is conscious but is oriented only to himself. This altered mental status is most concerning for which condition?",
    choices: [
      "Respiratory arrest",
      "Organ failure",
      "Myocardial infarction",
      "Traumatic brain injury"
    ],
    answerIndex: 3,
    explanation: "A trauma patient who is oriented only to himself has an altered mental status, which can be an important sign of traumatic brain injury. Given the significant mechanism of injury and abnormal mental status, a brain injury should be considered. Other serious conditions may occur after trauma, but the altered level of consciousness is particularly concerning for injury involving the brain."
  },

  {
    id: "nremt-emt-trauma-003",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "What is the initial method an EMT should use to control significant bleeding from a laceration of the hand?",
    choices: [
      "Apply ice to the wound",
      "Place a tourniquet two inches above the injury",
      "Apply a hemostatic dressing",
      "Apply direct pressure"
    ],
    answerIndex: 3,
    explanation: "Direct pressure is the initial method used to control significant external bleeding. Firm, continuous pressure can often stop bleeding from a laceration. A tourniquet may be required when severe bleeding cannot be controlled with other measures or when otherwise indicated, while hemostatic dressings can be useful for certain wounds. Ice is not an appropriate primary method for controlling major external hemorrhage."
  },
  {
  id: "nremt-emt-obgyn-001",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question: "A 36-year-old woman who is 6 months pregnant reports severe abdominal cramping. She has two living children and a history of three miscarriages. What is her GPA?",
  choices: [
    "6/2/3",
    "6/3/2",
    "6/3/3",
    "5/2/3"
  ],
  answerIndex: 0,
  explanation: "Her GPA is 6/2/3. Gravida (G) refers to the total number of pregnancies, including the current pregnancy. She has been pregnant six times: two pregnancies resulting in her children, three miscarriages, and her current pregnancy. Para (P) refers to pregnancies that resulted in a viable birth, giving her a para of 2. Abortus (A) refers to pregnancies that ended in miscarriage or abortion, giving her an abortus of 3."
}
];
