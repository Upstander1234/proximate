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
    id: "airway-006",
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
},
// ----------------------------------------------------------------------------
// INDEPENDENTLY AUTHORED EMT QUESTION SET
// Rewritten from source concepts. Do not preserve source wording.
// ----------------------------------------------------------------------------


// ============================================================================
// AIRWAY / RESPIRATION / VENTILATION
// ============================================================================


{
  id: "airway-007",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A patient with an implanted cardioverter-defibrillator suddenly becomes unresponsive and is not breathing normally. You cannot detect a pulse. What should the EMT do?",
  choices: [
    "Wait to see whether the implanted device delivers a shock",
    "Begin CPR and apply an AED as soon as possible",
    "Contact medical direction before beginning resuscitation",
    "Perform CPR but do not use an AED because the patient has an implanted device",
  ],
  answerIndex: 1,
  explanation:
    "An implanted cardioverter-defibrillator does not replace external resuscitation. Begin CPR and apply an AED when indicated. The AED pad should not be placed directly over the implanted device, but the presence of the device is not a reason to withhold defibrillation.",
},


{
  id: "airway-008",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A 3-year-old suddenly develops severe breathing difficulty after choking on a piece of candy. Which breath sound would most strongly suggest an upper-airway obstruction?",
  choices: [
    "Crackles",
    "Stridor",
    "Snoring",
    "Wheezing",
  ],
  answerIndex: 1,
  explanation:
    "Stridor is a high-pitched sound associated with obstruction of the upper airway. Wheezing generally suggests lower-airway narrowing, while crackles are associated with fluid or other processes in the smaller airways and alveoli. Snoring commonly results from partial obstruction by relaxed soft tissues.",
},


{
  id: "airway-009",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A bronchodilator delivered by a metered-dose inhaler must ultimately reach which part of the respiratory tract to produce its primary effect?",
  choices: [
    "The oral mucosa",
    "The pharynx",
    "The bronchioles",
    "The alveolar sacs",
  ],
  answerIndex: 2,
  explanation:
    "Bronchodilators act primarily on smooth muscle in the lower airways, including the bronchi and bronchioles. The medication is inhaled rather than absorbed through the oral mucosa.",
},


{
  id: "airway-010",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An unresponsive adult has adequate spontaneous breathing but cannot tolerate an oropharyngeal airway because the device causes gagging. Which position is most appropriate while maintaining the airway and monitoring the patient?",
  choices: [
    "Prone",
    "Supine",
    "High Fowler position",
    "Recovery position with the patient lying laterally",
  ],
  answerIndex: 3,
  explanation:
    "A patient with an intact gag reflex should not have an OPA inserted. If there is no suspected spinal injury and the patient is breathing adequately, a lateral recovery position can help maintain airway patency and reduce aspiration risk.",
},


{
  id: "airway-011",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An unresponsive patient is breathing adequately after an apparent generalized seizure. A bystander reports that the patient had stiffened and then experienced rhythmic movements before becoming unresponsive. Which condition is most consistent with this history?",
  choices: [
    "Stroke",
    "Seizure",
    "Acute myocardial infarction",
    "Isolated hypoglycemia",
  ],
  answerIndex: 1,
  explanation:
    "The reported stiffening followed by rhythmic movements and altered consciousness is characteristic of a generalized seizure. The EMT should still evaluate for possible underlying causes, including hypoglycemia and stroke.",
},


{
  id: "airway-012",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A patient with chronic lung disease is sitting upright and breathing rapidly with very shallow chest movement. He is becoming fatigued and can no longer maintain his posture without assistance. Which intervention addresses the most immediate problem?",
  choices: [
    "Obtain a pulse oximetry reading before intervening",
    "Apply oxygen through a Venturi mask",
    "Apply a nonrebreather mask",
    "Assist ventilations with a bag-valve mask",
  ],
  answerIndex: 3,
  explanation:
    "The patient's shallow respirations and fatigue indicate inadequate ventilation. A pulse oximetry reading should not delay treatment of obvious ventilatory failure. BVM-assisted ventilation is appropriate when the patient cannot adequately ventilate on his own.",
},


{
  id: "airway-013",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A patient with predominantly right-sided heart failure is most likely to develop which finding?",
  choices: [
    "Fluid accumulation in the peripheral tissues",
    "Fluid filling the alveoli as the primary finding",
    "Air trapped in the pleural space",
    "Obstruction of the coronary arteries",
  ],
  answerIndex: 0,
  explanation:
    "Right-sided heart failure commonly causes systemic venous congestion, producing peripheral edema and jugular venous distention. Pulmonary edema is more directly associated with left-sided heart failure.",
},


{
  id: "airway-014",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which physical finding would most strongly support a history of emphysema?",
  choices: [
    "A productive cough with purulent sputum",
    "A barrel-shaped chest with an increased anterior-posterior diameter",
    "A sudden onset of pleuritic chest pain",
    "Localized crackles after lying flat",
  ],
  answerIndex: 1,
  explanation:
    "An increased anterior-posterior chest diameter, often described as a barrel chest, can occur with chronic hyperinflation associated with emphysema. The other findings are less specific for emphysema.",
},


{
  id: "airway-015",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A severely injured patient has a palpable carotid pulse but no detectable radial pulses. What does this finding most strongly suggest?",
  choices: [
    "The patient may have significant systemic hypoperfusion",
    "The patient definitely has an aortic arch injury",
    "Both upper extremities must be fractured",
    "The patient must have chronic vascular disease",
  ],
  answerIndex: 0,
  explanation:
    "A central pulse without a palpable peripheral pulse can be a sign of significant hypoperfusion and shock. It does not by itself establish a specific vascular injury or chronic disease.",
},


{
  id: "airway-016",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A trauma patient has no sensation below approximately the level of the nipples. Which spinal cord region is most consistent with this sensory level?",
  choices: [
    "C7",
    "T1",
    "T4",
    "T10",
  ],
  answerIndex: 2,
  explanation:
    "The nipple line is commonly associated with approximately the T4 dermatome. A sensory deficit beginning around this level suggests possible thoracic spinal cord involvement near T4.",
},


{
  id: "airway-017",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Using the adult Rule of Nines, a patient has full-thickness burns involving the entire anterior trunk and the anterior surface of both arms. Approximately what percentage of total body surface area is burned?",
  choices: [
    "18%",
    "27%",
    "36%",
    "45%",
  ],
  answerIndex: 1,
  explanation:
    "The anterior trunk represents approximately 18% TBSA. Each entire arm represents 9%, making both arms 18% if completely burned. However, only the anterior surface of each arm is involved, approximately 4.5% per arm. Therefore the total is 18% + 9% = 27%.",
},


{
  id: "airway-018",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "After blunt trauma, a patient has decreased breath sounds on the left. Which additional finding would favor hemothorax rather than pneumothorax?",
  choices: [
    "Dyspnea",
    "Jugular venous distention",
    "Dullness or decreased resonance to percussion on the injured side",
    "Decreased breath sounds primarily at the lung apex",
  ],
  answerIndex: 2,
  explanation:
    "Blood accumulating in the pleural space tends to produce dullness or decreased resonance to percussion. Pneumothorax more commonly produces hyperresonance. Dyspnea can occur with either condition.",
},


{
  id: "airway-019",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which physiological change can directly contribute to hypotension?",
  choices: [
    "An increase in heart rate",
    "An increase in stroke volume",
    "A decrease in systemic vascular tone",
    "A decrease in parasympathetic activity",
  ],
  answerIndex: 2,
  explanation:
    "Reduced systemic vascular tone causes vasodilation and lowers systemic vascular resistance, which can decrease blood pressure. The other choices generally do not directly explain hypotension in this context.",
},


{
  id: "airway-020",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "You reassess a patient after splinting a lower-leg fracture. A distal pulse that was clearly present before splinting can no longer be detected. What should you do first?",
  choices: [
    "Loosen or adjust the splint and reassess circulation",
    "Forcefully manipulate the leg into a normal position",
    "Wait until arrival at the hospital",
    "Assume swelling is hiding the pulse",
  ],
  answerIndex: 0,
  explanation:
    "A new loss of distal circulation after splinting may indicate that the splint is compromising blood flow. The EMT should reassess and correct the splinting problem according to protocol, then reassess distal circulation.",
},


{
  id: "airway-021",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient with a penetrating chest injury is hypotensive and anxious. Which finding would raise concern for cardiac tamponade?",
  choices: [
    "Distended neck veins",
    "A widened pulse pressure",
    "Absent breath sounds on one side",
    "Unequal radial pulses",
  ],
  answerIndex: 0,
  explanation:
    "Jugular venous distention can occur when blood returning to the heart is obstructed by pressure within the pericardial sac. Cardiac tamponade may also cause hypotension and muffled heart sounds. Absent unilateral breath sounds are more suggestive of a pneumothorax.",
},


{
  id: "airway-022",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An older adult in a nursing facility develops new altered mental status. Staff suspect an infection, but the patient's temperature is normal. Which explanation is most appropriate?",
  choices: [
    "Older adults normally have a higher baseline temperature",
    "Age-related changes can reduce the body's ability to mount a typical fever",
    "Older adults have an exaggerated immune response that prevents fever",
    "Infections in older adults generally do not cause systemic symptoms",
  ],
  answerIndex: 1,
  explanation:
    "Older adults may have impaired thermoregulation and a less pronounced febrile response. Therefore, a normal temperature does not reliably exclude infection in an older patient.",
},


{
  id: "airway-023",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A patient dependent on a home ventilator becomes cyanotic and restless while the ventilator is alarming. The caregiver reports that the patient was recently suctioned. The patient is not being adequately ventilated by the device. What is the most appropriate immediate action?",
  choices: [
    "Wait for the caregiver to troubleshoot the ventilator",
    "Look for a backup ventilator before providing care",
    "Disconnect the ventilator and provide oxygen by itself",
    "Disconnect the ventilator and provide BVM-assisted ventilation",
  ],
  answerIndex: 3,
  explanation:
    "The patient's cyanosis and altered behavior indicate an immediate oxygenation or ventilation problem. If the ventilator is not providing adequate ventilation, the EMT should provide ventilation with a BVM while addressing the equipment problem.",
},


{
  id: "airway-024",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Immediately after an unexpected delivery, a newborn has a heart rate of 52/min and is not breathing effectively. Which intervention should take priority?",
  choices: [
    "Continue warming and observe the newborn",
    "Give blow-by oxygen",
    "Provide positive-pressure ventilation with a neonatal BVM",
    "Immediately begin compressions and ventilation simultaneously",
  ],
  answerIndex: 2,
  explanation:
    "In neonatal resuscitation, effective ventilation is the priority when the newborn is apneic or inadequately breathing and the heart rate is below 100/min. Chest compressions are considered if the heart rate remains below 60/min despite adequate ventilation.",
},


{
  id: "airway-025",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A 2-year-old with respiratory difficulty has poor feeding, appears limp, and is using accessory muscles. Which finding is most concerning for severe illness?",
  choices: [
    "Limp appearance",
    "Expiratory wheezing",
    "Accessory muscle use",
    "A history of using a prescribed inhaler",
  ],
  answerIndex: 0,
  explanation:
    "A limp or markedly lethargic child is a particularly concerning sign because it may indicate severe hypoxia, exhaustion, or impending respiratory failure. Accessory muscle use is also abnormal, but profound altered responsiveness is especially concerning.",
},


{
  id: "airway-026",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A patient who has just injected an unknown substance is difficult to arouse. Which vital-sign abnormality would most strongly suggest opioid poisoning?",
  choices: [
    "Heart rate of 82/min",
    "Irregular heart rate of 180/min",
    "Respiratory rate of 8/min",
    "Respiratory rate of 42/min",
  ],
  answerIndex: 2,
  explanation:
    "Opioids can cause profound respiratory depression, often accompanied by altered mental status and other characteristic findings. A respiratory rate of 8/min in an altered patient is strongly concerning for opioid-induced respiratory depression.",
},


{
  id: "airway-027",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "During a full-term delivery, you see the umbilical cord protruding from the vagina before the baby is delivered. What is the major immediate threat to the fetus?",
  choices: [
    "Fetal hypoxia from compression of the cord",
    "Massive fetal blood loss",
    "Maternal hypoxia",
    "Massive maternal hemorrhage",
  ],
  answerIndex: 0,
  explanation:
    "A prolapsed umbilical cord can become compressed between the fetus and maternal structures, reducing blood flow and oxygen delivery to the fetus. This makes fetal hypoxia the major immediate concern.",
},


{
  id: "airway-028",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which complication is a normal pregnancy complication that EMTs should recognize as potentially life-threatening?",
  choices: [
    "Placental abruption",
    "Normal fetal movement",
    "Mild physiologic dyspnea",
    "Increased urinary frequency",
  ],
  answerIndex: 0,
  explanation:
    "Placental abruption is a potentially life-threatening obstetric emergency involving premature separation of the placenta. The other findings can occur as normal physiologic changes of pregnancy.",
},


{
  id: "airway-029",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A motorcycle crash patient has a severely deformed lower extremity with life-threatening bleeding. Which intervention should take priority?",
  choices: [
    "Apply direct pressure or an appropriate bleeding-control intervention to the wound",
    "Apply pressure over the femoral artery while leaving the wound untreated",
    "Splint the leg before controlling the hemorrhage",
    "Attempt to restore the extremity to its normal position",
  ],
  answerIndex: 0,
  explanation:
    "Life-threatening external hemorrhage must be controlled promptly. Appropriate bleeding-control measures take priority over splinting or attempting to correct the deformity.",
},


{
  id: "airway-030",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "During CPR, a patient suddenly vomits a large amount of fluid. You cannot clear the airway quickly with suction. What should you do?",
  choices: [
    "Continue suctioning indefinitely before resuming ventilation",
    "Stop all CPR until the airway is completely clean",
    "Quickly clear the airway and resume CPR and ventilation as soon as possible",
    "Continue compressions but permanently withhold ventilations",
  ],
  answerIndex: 2,
  explanation:
    "Airway contamination should be cleared rapidly, but prolonged interruptions in CPR should be avoided. Suction should be used efficiently, followed by resumption of compressions and ventilations as soon as possible.",
},


{
  id: "airway-031",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "You are preparing to transport a stable patient in an ambulance. The patient asks to ride on an unsecured bench seat instead of the stretcher. Your partner agrees. What is the best response?",
  choices: [
    "Agree because the patient is stable",
    "Allow the patient to ride there as long as he holds on",
    "Ignore the issue and discuss it after the call",
    "State that the patient needs to be transported in an appropriate secured position according to ambulance safety procedures",
  ],
  answerIndex: 3,
  explanation:
    "Patient and crew safety take priority during ambulance transport. Patients should be secured in an approved position using the ambulance's restraint system rather than transported in an unsafe location merely because they request it.",
},


// ============================================================================
// AIRWAY / RESPIRATION / VENTILATION KNOWLEDGE
// ============================================================================


{
  id: "airway-032",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "What is the primary respiratory exchange that occurs at the alveoli?",
  choices: [
    "Oxygen moves from the air into the blood while carbon dioxide moves from the blood into the alveoli",
    "Oxygen is transported directly from the nose to body tissues",
    "Carbon dioxide is converted into oxygen inside the bronchi",
    "Blood is pumped from the lungs directly into the systemic arteries",
  ],
  answerIndex: 0,
  explanation:
    "Gas exchange occurs across the alveolar-capillary membrane. Oxygen diffuses into the blood and carbon dioxide diffuses from the blood into the alveoli to be exhaled.",
},


{
  id: "airway-033",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which structure is a common cause of upper-airway obstruction in an unconscious patient who has lost normal muscle tone?",
  choices: [
    "The tongue",
    "The alveoli",
    "The diaphragm",
    "The bronchioles",
  ],
  answerIndex: 0,
  explanation:
    "When consciousness is lost, the tongue can relax and fall backward, partially or completely obstructing the upper airway.",
},


{
  id: "airway-034",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Air passing through either the mouth or nose enters which common anatomical region before continuing toward the larynx?",
  choices: [
    "Pharynx",
    "Alveolus",
    "Bronchiole",
    "Pleural cavity",
  ],
  answerIndex: 0,
  explanation:
    "The pharynx is a shared passageway through which air travels from the nose or mouth toward the larynx.",
},


{
  id: "airway-035",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which structure helps prevent food and liquid from entering the trachea during swallowing?",
  choices: [
    "Epiglottis",
    "Diaphragm",
    "Cricoid cartilage",
    "Main bronchus",
  ],
  answerIndex: 0,
  explanation:
    "The epiglottis helps direct swallowed material away from the laryngeal opening during swallowing.",
},


{
  id: "airway-036",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "The vocal cords are located within which structure?",
  choices: [
    "Larynx",
    "Nasopharynx",
    "Trachea",
    "Esophagus",
  ],
  answerIndex: 0,
  explanation:
    "The vocal cords are located in the larynx, which connects the pharynx with the trachea.",
},


{
  id: "airway-037",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which airway structure forms a complete ring of cartilage?",
  choices: [
    "Thyroid cartilage",
    "Cricoid cartilage",
    "Epiglottic cartilage",
    "Hyoid bone",
  ],
  answerIndex: 1,
  explanation:
    "The cricoid cartilage forms a complete ring around the airway. The thyroid cartilage does not form a complete circular ring.",
},


{
  id: "airway-038",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "The trachea divides into which two major structures?",
  choices: [
    "Alveoli",
    "Bronchi",
    "Bronchioles",
    "Pleural sacs",
  ],
  answerIndex: 1,
  explanation:
    "The trachea divides into the right and left main bronchi, which carry air into the lungs.",
},


{
  id: "airway-039",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which muscle is primarily responsible for increasing the vertical dimension of the thoracic cavity during normal inspiration?",
  choices: [
    "Diaphragm",
    "Rectus abdominis",
    "Pectoralis minor",
    "Trapezius",
  ],
  answerIndex: 0,
  explanation:
    "During normal inspiration, the diaphragm contracts and moves downward, increasing thoracic volume and drawing air into the lungs.",
},


{
  id: "airway-040",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "During normal inspiration, which combination occurs?",
  choices: [
    "The diaphragm relaxes and thoracic volume decreases",
    "The diaphragm contracts and thoracic volume increases",
    "The diaphragm relaxes and the lungs actively pull air inward",
    "The diaphragm contracts and thoracic volume decreases",
  ],
  answerIndex: 1,
  explanation:
    "Contraction of the diaphragm increases thoracic volume, lowering intrathoracic pressure and allowing air to enter the lungs.",
},


{
  id: "airway-041",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "What term describes inadequate oxygen delivery to body tissues?",
  choices: [
    "Hypoxia",
    "Cyanosis",
    "Hyperventilation",
    "Dehydration",
  ],
  answerIndex: 0,
  explanation:
    "Hypoxia refers to inadequate oxygen availability at the tissue level. Cyanosis is a physical sign that may occur with inadequate oxygenation but is not synonymous with hypoxia.",
},


{
  id: "airway-042",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which intervention may be appropriate for maintaining the airway of a pediatric patient who cannot maintain airway patency independently?",
  choices: [
    "Use an appropriately sized airway adjunct when indicated",
    "Never use airway adjuncts in children",
    "Place every child in Trendelenburg position",
    "Use forceps to hold the tongue forward",
  ],
  answerIndex: 0,
  explanation:
    "Children may require appropriately sized airway adjuncts. The EMT should select and use the device according to the child's age, anatomy, clinical condition, and scope of practice.",
},


{
  id: "airway-043",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which structure is part of the lower airway?",
  choices: [
    "Pharynx",
    "Nasal cavity",
    "Trachea",
    "Oral cavity",
  ],
  answerIndex: 2,
  explanation:
    "The trachea is part of the lower respiratory tract. The mouth, nose, and pharynx are considered upper-airway structures.",
},


{
  id: "airway-044",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which finding is generally most concerning for respiratory failure rather than simple respiratory distress?",
  choices: [
    "Mildly increased respiratory rate",
    "Ability to speak in complete sentences",
    "Increasing fatigue with altered mental status",
    "Normal skin color and mental status",
  ],
  answerIndex: 2,
  explanation:
    "Respiratory failure occurs when the patient can no longer adequately maintain oxygenation or ventilation. Fatigue and altered mental status are particularly concerning signs of impending or established failure.",
},


{
  id: "airway-045",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which finding is most consistent with an upper-airway obstruction rather than a lower-airway obstruction?",
  choices: [
    "Inspiratory stridor",
    "Expiratory wheezing",
    "Diffuse expiratory wheezing",
    "Prolonged expiration",
  ],
  answerIndex: 0,
  explanation:
    "Inspiratory stridor suggests turbulent airflow through a narrowed upper airway. Wheezing and prolonged expiration are more commonly associated with lower-airway narrowing.",
},


{
  id: "airway-046",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "During ventilation with a BVM, which finding best confirms that air is entering the lungs?",
  choices: [
    "Visible chest rise",
    "Improved capillary refill alone",
    "Movement of the patient's fingers",
    "A change in blood pressure alone",
  ],
  answerIndex: 0,
  explanation:
    "Visible, appropriate chest rise is a direct observable indicator that ventilations are producing chest expansion. The EMT should also monitor the patient's overall clinical response.",
},


{
  id: "airway-047",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A 7-year-old remains pulseless and apneic after a submersion incident. When performing two-rescuer CPR, which compression-to-ventilation ratio is generally used?",
  choices: [
    "30:2",
    "15:2",
    "5:1",
    "10:1",
  ],
  answerIndex: 1,
  explanation:
    "For pediatric patients receiving two-rescuer CPR, a 15:2 compression-to-ventilation ratio is generally used. The clinical context and current resuscitation guidelines should always be followed.",
},


{
  id: "airway-048",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "During CPR on a child, approximately how deep should each chest compression be?",
  choices: [
    "About one quarter of the chest depth",
    "About one third of the anterior-posterior chest diameter",
    "Exactly 1 inch regardless of the child's size",
    "At least one half of the chest depth",
  ],
  answerIndex: 1,
  explanation:
    "Pediatric chest compressions should generally be about one third of the anterior-posterior diameter of the chest, while avoiding excessive depth.",
},


// ============================================================================
// CARDIOLOGY / RESUSCITATION
// ============================================================================


{
  id: "cardiology-001",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which mnemonic is commonly used to characterize important features of a patient's pain?",
  choices: [
    "SAMPLE",
    "AVPU",
    "OPQRST",
    "DCAP-BTLS",
  ],
  answerIndex: 2,
  explanation:
    "OPQRST is commonly used to characterize pain, including onset, provocation or palliation, quality, region or radiation, severity, and timing.",
},


{
  id: "cardiology-002",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "When an EMT asks whether chest discomfort feels crushing, burning, stabbing, or pressure-like, which characteristic is being assessed?",
  choices: [
    "Onset",
    "Quality",
    "Radiation",
    "Severity",
  ],
  answerIndex: 1,
  explanation:
    "Quality describes the character or nature of the patient's pain, such as pressure, burning, stabbing, or crushing.",
},


{
  id: "cardiology-003",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "In OPQRST, what does the letter P primarily address?",
  choices: [
    "Pulse",
    "Provocation and palliation",
    "Perfusion",
    "Pupils",
  ],
  answerIndex: 1,
  explanation:
    "P addresses factors that provoke or relieve the patient's symptoms, such as movement, exertion, position, or rest.",
},


{
  id: "cardiology-004",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Why might an EMT assess a patient with suspected chronic heart failure for peripheral edema?",
  choices: [
    "It can indicate systemic fluid retention associated with heart failure",
    "It proves the patient is experiencing anaphylaxis",
    "It confirms a myocardial infarction",
    "It indicates that the patient is hypoxic",
  ],
  answerIndex: 0,
  explanation:
    "Right-sided or congestive heart failure can produce systemic venous congestion and peripheral edema. Edema is not specific enough to diagnose heart failure by itself.",
},


{
  id: "cardiology-005",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient with chest discomfort is alert and breathing adequately. Assuming no contraindication exists, how should the EMT generally position the patient?",
  choices: [
    "In the position of greatest comfort",
    "Flat with the legs elevated",
    "Trendelenburg position",
    "Prone",
  ],
  answerIndex: 0,
  explanation:
    "Patients with cardiac complaints are generally positioned in a position of comfort, often sitting upright if that improves breathing or discomfort.",
},


{
  id: "cardiology-006",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "What is one important cardiovascular effect of nitroglycerin?",
  choices: [
    "It causes systemic vasoconstriction",
    "It increases cardiac workload",
    "It promotes vasodilation and can reduce cardiac workload",
    "It directly increases oxygen production in the lungs",
  ],
  answerIndex: 2,
  explanation:
    "Nitroglycerin causes vasodilation, particularly venodilation, reducing venous return and cardiac workload. It does not directly increase oxygen production.",
},


{
  id: "cardiology-007",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Before assisting a patient with prescribed nitroglycerin, which finding should make the EMT particularly concerned about administering it?",
  choices: [
    "A low systolic blood pressure",
    "A mild headache",
    "A history of chest pain",
    "A prescription for nitroglycerin",
  ],
  answerIndex: 0,
  explanation:
    "Nitroglycerin can lower blood pressure. A hypotensive patient may deteriorate if nitroglycerin is administered. The exact blood-pressure threshold and medication requirements should follow current local protocol.",
},


{
  id: "cardiology-008",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Before assisting a patient with prescribed nitroglycerin, the EMT should verify which of the following?",
  choices: [
    "That the medication belongs to another family member",
    "That the medication is appropriate, prescribed for the patient, and not expired",
    "That the patient can swallow it with water",
    "That the patient has already taken the maximum number of doses",
  ],
  answerIndex: 1,
  explanation:
    "The EMT should verify that the medication is prescribed for the patient, appropriate for the current situation, and within its expiration date, while following local protocol.",
},


{
  id: "cardiology-009",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient becomes dizzy shortly after taking nitroglycerin. Which vital-sign change should the EMT be particularly alert for?",
  choices: [
    "A sudden increase in blood pressure",
    "A decrease in blood pressure",
    "A sudden increase in temperature",
    "A marked increase in oxygen saturation",
  ],
  answerIndex: 1,
  explanation:
    "Hypotension is an important potential adverse effect of nitroglycerin. The patient's blood pressure and overall clinical condition should be reassessed after administration.",
},


{
  id: "cardiology-010",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which statement best distinguishes stable angina from myocardial infarction?",
  choices: [
    "Chest discomfort from an infarction may persist despite rest or nitroglycerin",
    "Pain from angina never radiates",
    "Myocardial infarction always produces severe pain",
    "Angina never causes sweating or nausea",
  ],
  answerIndex: 0,
  explanation:
    "Myocardial infarction can produce persistent ischemic chest discomfort that does not resolve with rest or prescribed nitroglycerin. Symptoms vary considerably between patients.",
},


{
  id: "cardiology-011",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which statement about an AED is correct?",
  choices: [
    "The EMT must independently interpret the patient's cardiac rhythm before using it",
    "Only paramedics are permitted to operate an AED",
    "An AED analyzes the rhythm and advises the rescuer when a shock is indicated",
    "An AED should not be used during traumatic cardiac arrest",
  ],
  answerIndex: 2,
  explanation:
    "AEDs analyze the cardiac rhythm and determine whether a shock is advised. EMTs do not need to independently interpret complex ECG rhythms to use an AED.",
},


{
  id: "cardiology-012",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which patient would generally NOT be an indication for AED application?",
  choices: [
    "An adult who is pulseless and apneic after a motor vehicle collision",
    "An adult who suddenly collapsed and is pulseless and apneic",
    "An alert adult with a rapid pulse who is breathing normally",
    "A child who is pulseless and apneic after an electrical injury",
  ],
  answerIndex: 2,
  explanation:
    "An AED is used during cardiac arrest when indicated. A conscious, breathing patient with a pulse is not a cardiac-arrest AED candidate.",
},


{
  id: "cardiology-013",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "You confirm that an adult patient is in cardiac arrest. Which combination represents the basic priorities of high-quality CPR?",
  choices: [
    "Obtain a complete SAMPLE history before starting compressions",
    "Start chest compressions and provide appropriate ventilations while rapidly applying an AED",
    "Insert an airway adjunct before beginning compressions",
    "Transport immediately without beginning resuscitation",
  ],
  answerIndex: 1,
  explanation:
    "High-quality CPR should begin promptly, with an AED applied as soon as practical. Airway management and history gathering should not unnecessarily delay chest compressions and defibrillation.",
},


{
  id: "cardiology-014",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "During adult CPR without an advanced airway, which compression-to-ventilation ratio is generally used?",
  choices: [
    "15:2",
    "30:2",
    "5:1",
    "100:2",
  ],
  answerIndex: 1,
  explanation:
    "For adult CPR without an advanced airway, rescuers generally perform 30 compressions followed by 2 ventilations.",
},


{
  id: "cardiology-015",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "What is an important reason to minimize interruptions in chest compressions during CPR?",
  choices: [
    "Interruptions reduce the blood flow generated by CPR",
    "Interruptions increase oxygen saturation immediately",
    "Interruptions prevent the AED from analyzing the rhythm",
    "Interruptions eliminate the need for ventilation",
  ],
  answerIndex: 0,
  explanation:
    "Chest compressions generate the pressure necessary to circulate blood during cardiac arrest. Frequent or prolonged interruptions reduce coronary and cerebral perfusion.",
},


{
  id: "cardiology-016",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which term describes the study of how the body normally functions?",
  choices: [
    "Pathology",
    "Physiology",
    "Microbiology",
    "Kinesiology",
  ],
  answerIndex: 1,
  explanation:
    "Physiology is the study of normal body function. Pathology concerns disease and abnormal processes.",
},


{
  id: "cardiology-017",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which anatomical term means closer to the body's midline?",
  choices: [
    "Lateral",
    "Medial",
    "Posterior",
    "Distal",
  ],
  answerIndex: 1,
  explanation:
    "Medial means toward or closer to the body's midline. Lateral means farther from the midline.",
},


{
  id: "cardiology-018",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which chamber pumps oxygenated blood into the systemic circulation?",
  choices: [
    "Right atrium",
    "Right ventricle",
    "Left atrium",
    "Left ventricle",
  ],
  answerIndex: 3,
  explanation:
    "The left ventricle pumps oxygenated blood through the aorta and into systemic circulation.",
},


{
  id: "cardiology-019",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which pulse point is located on the top of the foot?",
  choices: [
    "Carotid",
    "Femoral",
    "Brachial",
    "Dorsalis pedis",
  ],
  answerIndex: 3,
  explanation:
    "The dorsalis pedis pulse is palpated on the dorsum, or top, of the foot.",
},


{
  id: "cardiology-020",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient with suspected cardiac ischemia reports pressure in the center of the chest that began during exertion and now radiates into the jaw. Which OPQRST component describes the movement of the discomfort?",
  choices: [
    "Onset",
    "Provocation",
    "Radiation",
    "Severity",
  ],
  answerIndex: 2,
  explanation:
    "Radiation describes whether pain or discomfort spreads from its original location to another area, such as the jaw, arm, shoulder, or back.",
},


// ============================================================================
// TRAUMA
// ============================================================================


{
  id: "trauma-006",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "When approaching a trauma patient with visible bleeding, which safety measure should be taken before direct contact with blood?",
  choices: [
    "Apply appropriate body substance isolation precautions",
    "Obtain a complete SAMPLE history",
    "Perform a detailed extremity examination",
    "Wait until the patient reaches the hospital",
  ],
  answerIndex: 0,
  explanation:
    "Appropriate PPE and body substance isolation precautions should be used whenever exposure to blood or other potentially infectious material is possible.",
},


{
  id: "trauma-007",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A trauma patient has a mechanism suggesting possible spinal injury. During the initial assessment, what is an appropriate immediate action?",
  choices: [
    "Maintain manual stabilization of the head and neck when indicated",
    "Obtain a detailed SAMPLE history before assessing the airway",
    "Move immediately to a complete secondary examination",
    "Ignore spinal considerations until after transport begins",
  ],
  answerIndex: 0,
  explanation:
    "When spinal injury is suspected, manual stabilization may be initiated while the airway and other life threats are assessed. Current spinal-motion-restriction protocols should guide subsequent care.",
},


{
  id: "trauma-008",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient has suffered significant facial trauma. Which additional problem should the EMT specifically consider?",
  choices: [
    "Airway compromise",
    "Only an isolated dental injury",
    "Only a lower-extremity fracture",
    "Only hypoglycemia",
  ],
  answerIndex: 0,
  explanation:
    "Facial trauma can cause bleeding, swelling, aspiration, airway obstruction, and associated head or spinal injuries. The airway should be assessed carefully.",
},


{
  id: "trauma-009",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which intervention may be within an EMT's scope for a variety of emergency conditions when clinically indicated and allowed by local protocol?",
  choices: [
    "Administering oxygen when indicated",
    "Performing emergency surgery",
    "Administering general anesthesia",
    "Performing an endotracheal intubation",
  ],
  answerIndex: 0,
  explanation:
    "Oxygen administration is a common EMT intervention when clinically indicated. Exact oxygen indications and delivery methods should follow current protocols.",
},


{
  id: "trauma-010",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which patient is not an appropriate candidate for AED application?",
  choices: [
    "A pulseless trauma patient",
    "A pulseless adult found at home",
    "An alert patient with a pulse and a rapid heart rate",
    "A pulseless patient after an electrical injury",
  ],
  answerIndex: 2,
  explanation:
    "AEDs are intended for patients in cardiac arrest when indicated. A conscious patient with a pulse is not an AED candidate.",
},


{
  id: "trauma-011",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which finding may indicate altered mental status in a trauma patient?",
  choices: [
    "An abnormal respiratory pattern",
    "Normal speech and behavior",
    "Normal pupil response with no other abnormalities",
    "A normal respiratory rate and depth",
  ],
  answerIndex: 0,
  explanation:
    "Changes in respiratory pattern can accompany altered mental status and serious traumatic injury. The EMT should assess the entire clinical picture rather than relying on one sign.",
},


{
  id: "trauma-012",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Why can abdominal trauma during pregnancy be particularly concerning even when the external injury appears minor?",
  choices: [
    "Maternal and fetal injuries may occur despite limited external findings",
    "Pregnancy completely protects the fetus from blunt trauma",
    "Pregnancy prevents internal bleeding",
    "Minor abdominal trauma cannot affect the placenta",
  ],
  answerIndex: 0,
  explanation:
    "Pregnancy changes anatomy and physiology, and significant maternal or placental injury may occur without dramatic external findings. Pregnant trauma patients require careful assessment.",
},


{
  id: "trauma-013",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient has an open penetrating wound to the chest. Which intervention is appropriate?",
  choices: [
    "Cover the wound using an appropriate occlusive chest dressing according to protocol",
    "Probe the wound to determine its depth",
    "Clean the wound deeply with saline before sealing it",
    "Pack the chest wound deeply with gauze",
  ],
  answerIndex: 0,
  explanation:
    "An open chest wound can allow air to enter the pleural space. An appropriate occlusive dressing should be applied according to current protocol, while the patient is monitored closely for respiratory deterioration.",
},


{
  id: "trauma-014",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A trauma patient has abdominal organs protruding through an open wound. Which care is appropriate?",
  choices: [
    "Gently push the organs back inside",
    "Cover the exposed organs with a sterile moist dressing and protect them from further injury",
    "Cover them with dry gauze and apply firm pressure",
    "Have the patient walk to the ambulance",
  ],
  answerIndex: 1,
  explanation:
    "Eviscerated abdominal organs should not be pushed back into the abdomen. They should be covered with an appropriate sterile dressing, generally kept moist according to protocol, and protected during transport.",
},


{
  id: "trauma-015",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which statement correctly describes a sprain?",
  choices: [
    "A ligament injury caused by stretching or tearing",
    "A fracture in which the bone breaks into multiple pieces",
    "A complete separation of muscle from bone",
    "A displacement of an organ into the chest",
  ],
  answerIndex: 0,
  explanation:
    "A sprain is an injury to a ligament. A strain involves muscle or tendon injury, while a fracture involves a break in bone.",
},


{
  id: "trauma-016",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Crepitus associated with a suspected fracture may be described as:",
  choices: [
    "Localized skin discoloration",
    "Abnormal movement of the joint",
    "A grating sensation caused by bone fragments rubbing together",
    "Loss of sensation caused by swelling",
  ],
  answerIndex: 2,
  explanation:
    "Crepitus can be a grating or grinding sensation produced when fractured bone fragments move against each other. It should not be deliberately elicited.",
},


{
  id: "trauma-017",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "What is a primary purpose of splinting a suspected extremity fracture?",
  choices: [
    "Prevent unnecessary movement and reduce the possibility of further injury",
    "Force the bones back into their anatomical position",
    "Replace exposed bone under the skin",
    "Eliminate all swelling",
  ],
  answerIndex: 0,
  explanation:
    "Splinting limits movement, helps reduce pain, and can reduce the risk of further tissue or vascular injury. EMTs should not routinely force exposed or displaced bones back into position.",
},


{
  id: "trauma-018",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Before and after splinting an injured extremity, what should the EMT assess?",
  choices: [
    "Only the patient's pain score",
    "Distal circulation, motor function, and sensation",
    "Only the patient's blood pressure",
    "Only the color of the opposite extremity",
  ],
  answerIndex: 1,
  explanation:
    "Distal pulse or other circulation assessment, motor function, and sensation should be evaluated before and after splinting to identify changes caused by the injury or the splint.",
},


{
  id: "trauma-019",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which physiological change is commonly associated with normal aging?",
  choices: [
    "Improved pulmonary elasticity",
    "An increased tendency toward respiratory infections",
    "A stronger cough reflex",
    "A consistently higher body temperature",
  ],
  answerIndex: 1,
  explanation:
    "Aging can reduce respiratory reserve and cough effectiveness, increasing susceptibility to respiratory complications and infection.",
},


{
  id: "trauma-020",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which cardiovascular change may occur with aging?",
  choices: [
    "Greater arterial elasticity",
    "Widespread stiffening and atherosclerotic changes in arteries",
    "A major increase in the number of cardiac conduction cells",
    "A guaranteed decrease in resting heart rate",
  ],
  answerIndex: 1,
  explanation:
    "Aging is associated with increased arterial stiffness and a greater prevalence of atherosclerotic disease. Individual patients vary, so these are population-level trends rather than absolute findings.",
},


{
  id: "trauma-021",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which age-related respiratory change can make an older adult more vulnerable to respiratory problems?",
  choices: [
    "A more rigid chest wall",
    "Increasing lung elasticity",
    "Improved gas diffusion",
    "An increased ability to clear secretions",
  ],
  answerIndex: 0,
  explanation:
    "Age-related changes include decreased chest-wall compliance, reduced respiratory reserve, and impaired gas exchange. These changes can make respiratory illness more difficult to tolerate.",
},


{
  id: "trauma-022",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which condition involves reduced bone mineral density and increased fracture risk in older adults?",
  choices: [
    "Osteoporosis",
    "Osteoarthritis",
    "Kyphosis",
    "Scoliosis",
  ],
  answerIndex: 0,
  explanation:
    "Osteoporosis involves reduced bone mass and deterioration of bone structure, increasing the risk of fractures.",
},


{
  id: "trauma-023",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which age-related change can affect an older patient's balance and mobility?",
  choices: [
    "Improved proprioception",
    "Reduced ability to perceive body position",
    "Increased nerve-cell regeneration",
    "Improved vestibular function",
  ],
  answerIndex: 1,
  explanation:
    "Age-related changes in the nervous, sensory, and musculoskeletal systems can impair proprioception and balance, increasing fall risk.",
},


{
  id: "trauma-024",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Why can older adults be more susceptible to medication toxicity?",
  choices: [
    "Kidney function commonly declines with age, potentially reducing drug clearance",
    "Their kidneys normally become larger and filter more blood",
    "Older adults always metabolize medications faster",
    "Aging eliminates the need for medication dose adjustments",
  ],
  answerIndex: 0,
  explanation:
    "Renal function commonly declines with age, which can reduce clearance of some medications and increase the risk of accumulation and adverse effects.",
},


{
  id: "trauma-025",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which presentation should make an EMT particularly cautious when assessing an older adult for serious illness?",
  choices: [
    "A serious illness may occur without the classic symptoms seen in younger adults",
    "Older adults always develop high fevers during infection",
    "Older adults always experience severe chest pain during myocardial infarction",
    "A normal respiratory rate completely excludes serious illness",
  ],
  answerIndex: 0,
  explanation:
    "Older adults may have atypical or muted presentations of serious illness. For example, infection or myocardial infarction may occur without a prominent fever or classic chest pain.",
},


{
  id: "trauma-026",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which statement about spinal cord injury is most accurate?",
  choices: [
    "The level of neurological deficit can provide clues about the location of spinal cord injury",
    "Only lumbar injuries can cause loss of sensation",
    "Spinal cord injuries never affect breathing",
    "A patient with a spinal injury will always be unconscious",
  ],
  answerIndex: 0,
  explanation:
    "Patterns of motor and sensory loss can help clinicians estimate the level of spinal cord involvement. Cervical injuries can affect breathing, and patients with spinal cord injury may remain conscious.",
},


{
  id: "trauma-027",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which finding would most strongly suggest neurogenic shock rather than simple blood-loss shock in an appropriate spinal-injury context?",
  choices: [
    "Hypotension accompanied by relative bradycardia and warm, dry skin",
    "Hypotension with marked tachycardia and cool, clammy skin",
    "Hypertension with severe sweating",
    "Normal blood pressure with isolated arm pain",
  ],
  answerIndex: 0,
  explanation:
    "Loss of sympathetic vascular tone after certain spinal cord injuries can produce vasodilation, hypotension, and relative bradycardia, sometimes with warm, dry skin. Hemorrhagic shock more commonly produces tachycardia and cool, clammy skin.",
},


{
  id: "trauma-028",
  domain: "Trauma",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient with a deformed extremity has severe bleeding that is not controlled with initial direct pressure. Which intervention may be indicated for life-threatening extremity hemorrhage?",
  choices: [
    "Apply a tourniquet proximal to the wound according to protocol",
    "Delay bleeding control until after splinting",
    "Attempt to push the fractured bone back into place",
    "Apply heat to the extremity",
  ],
  answerIndex: 0,
  explanation:
    "A properly applied tourniquet is an important intervention for life-threatening extremity hemorrhage that cannot be rapidly controlled with other appropriate measures. It should be placed according to current protocol.",
},


// ----------------------------------------------------------------------------
// ORIGINAL PROXIMATE QUESTIONS
// Source concepts independently rewritten from "The EMT Advantage"
// National Registry Practice Test, 15 Questions Edition.
// These questions are newly authored and should not reproduce the source text.
// ----------------------------------------------------------------------------

{
  id: "resp-adv-001",
  domain: "Respiratory",
  level: "EMT",
  blueprintCategory: "respiratory",
  question:
    "A 27-year-old patient suddenly develops sharp chest discomfort and shortness of breath while resting at home. The patient had knee surgery 10 days ago. You find a respiratory rate of 30/min, pulse of 118/min, blood pressure of 128/84 mmHg, and SpO2 of 91% on room air. Lung sounds are clear bilaterally. Which condition should be highest on your differential?",
  choices: [
    "Acute asthma exacerbation",
    "Pulmonary embolism",
    "Pneumonia",
    "Upper airway obstruction",
  ],
  answerIndex: 1,
  explanation:
    "Pulmonary embolism should be strongly considered because the patient has sudden dyspnea, pleuritic-type chest discomfort, tachycardia, mild hypoxemia, clear lung sounds, and a recent surgery that increases thromboembolic risk. Asthma would more commonly produce wheezing, pneumonia usually has an infectious presentation, and upper airway obstruction would produce upper-airway findings such as stridor.",
},

{
  id: "cardio-adv-001",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "cardiovascular",
  question:
    "A 61-year-old man with a history of poorly controlled hypertension suddenly develops severe chest and upper back pain that he describes as tearing. His left radial pulse is strong, but the right radial pulse is noticeably weaker. He is pale and anxious. Which condition should you suspect?",
  choices: [
    "Acute aortic dissection",
    "Stable angina",
    "Acute asthma",
    "Isolated pulmonary edema",
  ],
  answerIndex: 0,
  explanation:
    "Sudden severe tearing chest or back pain accompanied by unequal peripheral pulses is highly concerning for acute aortic dissection. The dissection can interfere with blood flow through vessels branching from the aorta. This patient requires rapid transport and management according to local EMS protocol and medical direction.",
},

{
  id: "ops-adv-001",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "medicalLegal",
  question:
    "An EMT fails to perform an assessment that a reasonably competent EMT would have performed, and the omission contributes to the patient's injury. Which element of negligence does the EMT's failure most directly represent?",
  choices: [
    "Causation",
    "Breach of duty",
    "Damages",
    "Consent",
  ],
  answerIndex: 1,
  explanation:
    "A breach of duty occurs when a provider fails to act according to the applicable standard of care after a duty to act exists. Causation concerns the connection between the breach and the injury, while damages refer to the harm suffered by the patient.",
},

{
  id: "resp-adv-002",
  domain: "Respiratory",
  level: "EMT",
  blueprintCategory: "respiratory",
  question:
    "A 70-year-old patient with a long history of cigarette smoking becomes short of breath after walking across the house. The patient is sitting upright, leaning forward, and breathing through pursed lips. Respirations are 32/min and lung sounds reveal diffuse expiratory wheezing. Which condition is most consistent with this presentation?",
  choices: [
    "Chronic obstructive pulmonary disease",
    "Foreign-body airway obstruction",
    "Anaphylaxis",
    "Spontaneous pneumothorax",
  ],
  answerIndex: 0,
  explanation:
    "The long smoking history, chronic obstructive pattern, pursed-lip breathing, tripod positioning, and expiratory wheezing are consistent with COPD. Patients with obstructive lung disease commonly have difficulty moving air out of the lungs because of increased airway resistance and air trapping.",
},

{
  id: "cardio-adv-002",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "cardiovascular",
  question:
    "A 64-year-old patient develops unilateral calf swelling and tenderness several days after a prolonged period of immobility. The affected calf is warmer and slightly redder than the other leg. Which condition should you be most concerned about?",
  choices: [
    "Deep vein thrombosis",
    "Acute myocardial infarction",
    "Aortic dissection",
    "Tension pneumothorax",
  ],
  answerIndex: 0,
  explanation:
    "Unilateral swelling, warmth, redness, and tenderness of an extremity, particularly after prolonged immobility, are concerning for deep vein thrombosis. A thrombus in a deep vein can potentially embolize and travel to the pulmonary circulation, causing a pulmonary embolism.",
},

{
  id: "ops-adv-002",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "medicalLegal",
  question:
    "During an EMS call in a crowded public location, a bystander overhears the EMT discussing the patient's diagnosis with the patient's partner. The EMT did not intentionally reveal the information to the bystander. Which principle is most relevant to this situation?",
  choices: [
    "Incidental disclosure",
    "Abandonment",
    "Implied consent",
    "Informed refusal",
  ],
  answerIndex: 0,
  explanation:
    "An incidental disclosure can occur when protected health information is unintentionally overheard or exposed during otherwise appropriate care. EMS personnel should still take reasonable precautions to protect patient privacy, particularly in public environments.",
},

{
  id: "resp-adv-003",
  domain: "Respiratory",
  level: "EMT",
  blueprintCategory: "anaphylaxis",
  question:
    "A 35-year-old patient develops sudden difficulty breathing shortly after eating a meal containing an unknown ingredient. You find widespread hives, facial swelling, wheezing, and increasing respiratory distress. Which condition best explains the patient's presentation?",
  choices: [
    "Emphysema",
    "Pulmonary embolism",
    "Anaphylaxis",
    "Chronic bronchitis",
  ],
  answerIndex: 2,
  explanation:
    "The rapid onset after possible allergen exposure, hives, facial swelling, wheezing, and respiratory distress are classic findings of anaphylaxis. Anaphylaxis can rapidly progress to airway compromise and shock, making prompt recognition and treatment essential.",
},

{
  id: "cardio-adv-003",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "vascular",
  question:
    "Which process is a major cause of arterial blood-flow obstruction?",
  choices: [
    "Atherosclerotic plaque and thromboembolic material",
    "Mild dehydration alone",
    "Hyperventilation",
    "Seasonal allergies",
  ],
  answerIndex: 0,
  explanation:
    "Atherosclerosis can narrow arteries through plaque formation, while thrombi or emboli can obstruct blood flow more abruptly. These mechanisms can contribute to ischemia in tissues supplied by the affected vessel.",
},

{
  id: "ops-adv-003",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "medicalLegal",
  question:
    "A patient involved in a motor-vehicle collision is visibly intoxicated and refuses transport. The patient cannot explain the potential consequences of refusing care and repeatedly gives contradictory answers about what happened. What is the most important issue for the EMT to determine?",
  choices: [
    "Whether the patient is cooperative",
    "Whether the patient has decision-making capacity",
    "Whether the patient has been arrested",
    "Whether the patient has consumed any alcohol at all",
  ],
  answerIndex: 1,
  explanation:
    "The key issue is whether the patient has decision-making capacity to understand the situation, appreciate the relevant risks and benefits, and communicate a choice. Alcohol consumption alone does not automatically eliminate capacity, so the EMT must assess the patient's actual ability to make an informed decision and follow applicable law and local protocol.",
},

{
  id: "resp-adv-004",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "airwayObstruction",
  question:
    "A 48-year-old patient suddenly collapses while eating. A witness reports that the patient was clutching the throat, could not speak, and then became unresponsive. The patient is now apneic. Which problem should you suspect first?",
  choices: [
    "Pulmonary embolism",
    "Severe upper-airway obstruction",
    "Chronic obstructive pulmonary disease",
    "Panic attack",
  ],
  answerIndex: 1,
  explanation:
    "The sudden onset while eating, inability to speak, clutching at the throat, and rapid progression to unconsciousness strongly indicate severe foreign-body airway obstruction. Once the patient becomes unresponsive and is not breathing normally, the EMT must manage the airway and follow the appropriate resuscitation sequence.",
},

{
  id: "cardio-adv-004",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "vascular",
  question:
    "A weakened portion of an arterial wall progressively expands outward and forms a localized bulge. What is this condition called?",
  choices: [
    "Embolus",
    "Aneurysm",
    "Infarction",
    "Occlusion",
  ],
  answerIndex: 1,
  explanation:
    "An aneurysm is a localized abnormal dilation of a blood vessel caused by weakness in the vessel wall. An embolus is material traveling through the bloodstream, an occlusion is an obstruction of blood flow, and an infarction is tissue death caused by inadequate blood supply.",
},

{
  id: "ops-adv-004",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "medicalLegal",
  question:
    "An alert adult with decision-making capacity clearly refuses an examination. The EMT nevertheless intentionally performs a physical examination without permission and without a recognized exception such as an emergency that permits treatment without consent. Which legal concept is most directly involved?",
  choices: [
    "Assault",
    "Battery",
    "Abandonment",
    "Negligence",
  ],
  answerIndex: 1,
  explanation:
    "Battery involves intentional physical contact without consent or legal justification. Assault generally involves creating a reasonable apprehension of imminent harmful or offensive contact. EMS personnel should respect a competent patient's refusal unless a lawful exception applies.",
},

{
  id: "resp-adv-005",
  domain: "Respiratory",
  level: "EMT",
  blueprintCategory: "respiratory",
  question:
    "Which finding is most characteristic of obstructive lung disease such as COPD?",
  choices: [
    "Difficulty fully exhaling with prolonged expiration",
    "Sudden complete absence of airflow from a foreign object",
    "Pink frothy sputum as the defining feature",
    "Respiratory symptoms occurring only during emotional stress",
  ],
  answerIndex: 0,
  explanation:
    "COPD is an obstructive respiratory disorder. Increased airway resistance makes expiration particularly difficult, and patients may develop prolonged expiration and air trapping. Pink frothy sputum is more strongly associated with pulmonary edema, while emotional stress is not required for COPD symptoms.",
},

{
  id: "cardio-adv-005",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "vascular",
  question:
    "A patient with a previous lower-extremity DVT suddenly develops shortness of breath, pleuritic chest pain, and tachycardia. Which complication should be considered?",
  choices: [
    "Pulmonary embolism",
    "Acute appendicitis",
    "Hypoglycemia",
    "Isolated bradycardia",
  ],
  answerIndex: 0,
  explanation:
    "A DVT can break loose and travel through the venous circulation to the pulmonary arteries. This produces a pulmonary embolism, which may present with sudden dyspnea, pleuritic chest pain, tachycardia, and hypoxemia.",
},

{
  id: "ops-adv-005",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "documentation",
  question:
    "During transport, an EMT realizes that the wrong medication was administered to a patient. The patient's condition remains stable. A supervisor tells the EMT to leave the medication error out of the patient care report. What should the EMT do?",
  choices: [
    "Document the medication error accurately and follow the agency's reporting procedure",
    "Omit the error because the patient was not harmed",
    "Document only that the medication was given without identifying the error",
    "Destroy the original report and create a new one",
  ],
  answerIndex: 0,
  explanation:
    "A medication error should be documented accurately and reported through the appropriate clinical and administrative channels, even when no obvious harm has occurred. Falsifying or intentionally omitting relevant information from a patient care record can create ethical, legal, and patient-safety problems. The EMT should follow applicable agency policy and medical direction.",
},
// ----------------------------------------------------------------------------
// ORIGINAL PROXIMATE QUESTIONS
// Independently authored from supplied EMS operations study material.
// Questions are conceptually related to the source material but use new
// wording, scenarios, distractors, and explanations.
// ----------------------------------------------------------------------------

{
  id: "ops-007",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which piece of equipment would generally NOT be considered routine patient-moving equipment for an ambulance crew?",
  choices: [
    "Wheeled ambulance stretcher",
    "Stair chair",
    "Stokes basket",
    "Automated external defibrillator",
  ],
  answerIndex: 3,
  explanation:
    "An AED is primarily a resuscitation device rather than patient-moving equipment. Stretchers, stair chairs, and Stokes baskets are designed to help move patients in different environments.",
},

{
  id: "ops-008",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "A patient must be moved from a steep, uneven area near a cliff. Which device is specifically designed to help secure and move a patient when terrain makes conventional stretcher movement difficult?",
  choices: [
    "Stokes basket",
    "Suction unit",
    "CPR board",
    "Jump kit",
  ],
  answerIndex: 0,
  explanation:
    "A Stokes basket is designed to secure a patient for movement over challenging terrain or during technical rescue operations. The other devices serve different purposes.",
},

{
  id: "ops-009",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What is the primary advantage of carrying a jump kit into a scene?",
  choices: [
    "It contains every piece of equipment needed for the entire call",
    "It allows the crew to immediately address common life threats without carrying the entire ambulance",
    "It replaces the need for a full medical equipment bag",
    "It is used exclusively for cardiac arrest calls",
  ],
  answerIndex: 1,
  explanation:
    "A jump kit contains equipment needed for the initial management of common life threats. Additional equipment can be brought from the ambulance after the crew determines what the patient requires.",
},

{
  id: "ops-010",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "You are responding to an unconscious-patient call. Which information should you confirm first if there is any uncertainty about where the crew needs to go?",
  choices: [
    "The patient's complete medical history",
    "The caller's relationship to the patient",
    "The exact location where the patient can be found",
    "The patient's medication list",
  ],
  answerIndex: 2,
  explanation:
    "The crew cannot provide care if it cannot locate the patient. Confirming the exact location is therefore a critical early dispatch priority. Other information can be obtained as appropriate.",
},

{
  id: "ops-011",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "A dispatcher tells you that a patient is unconscious but does not provide an apartment number. What should you attempt to obtain before beginning your response whenever possible?",
  choices: [
    "The patient's insurance information",
    "The exact location and access information",
    "The patient's complete medication history",
    "The patient's primary physician",
  ],
  answerIndex: 1,
  explanation:
    "Accurate location and access information can prevent delays in reaching a patient. Details such as insurance and physician information are not immediate response priorities.",
},

{
  id: "ops-012",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "While responding to an emergency, which action provides the most direct protection against serious injury to the ambulance crew during a sudden collision?",
  choices: [
    "Wearing seat belts and shoulder restraints",
    "Turning on the siren continuously",
    "Driving faster than surrounding traffic",
    "Keeping the rear doors unlocked",
  ],
  answerIndex: 0,
  explanation:
    "Seat belts and appropriate restraints should be worn whenever the vehicle is moving. Emergency warning devices can improve visibility but do not replace occupant restraints.",
},

{
  id: "ops-013",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You are transporting a patient when the driver suddenly brakes to avoid another vehicle. Which crew member behavior best reduces the chance of injury?",
  choices: [
    "Standing beside the stretcher",
    "Removing the shoulder restraint so the crew member can move quickly",
    "Remaining properly restrained while the ambulance is moving",
    "Holding onto the stretcher with one hand",
  ],
  answerIndex: 2,
  explanation:
    "EMS personnel should remain properly restrained whenever possible while the ambulance is moving. Sudden stops can generate substantial forces, making unrestrained crew members vulnerable to serious injury.",
},

{
  id: "ops-014",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which driving behavior is inappropriate when operating an ambulance?",
  choices: [
    "Maintaining a safety cushion around the ambulance",
    "Adjusting speed for road and weather conditions",
    "Driving aggressively because warning devices are activated",
    "Watching for vehicles that may not yield",
  ],
  answerIndex: 2,
  explanation:
    "Emergency warning devices do not make aggressive driving safe. The driver remains responsible for operating with due regard for roadway conditions and other people.",
},

{
  id: "ops-015",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Why should an ambulance driver use particular caution when approaching an intersection during an emergency response?",
  choices: [
    "Intersections create opportunities for conflicting traffic movements",
    "Ambulances are prohibited from using warning devices at intersections",
    "Emergency vehicles have no visibility problems at intersections",
    "Traffic always stops automatically when an ambulance approaches",
  ],
  answerIndex: 0,
  explanation:
    "Intersections are especially hazardous because vehicles can approach from multiple directions and may fail to recognize or yield to an emergency vehicle. The ambulance operator must reduce risk and proceed cautiously.",
},

{
  id: "ops-016",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which statement about hydroplaning is most accurate?",
  choices: [
    "It can occur only when a vehicle exceeds 50 mph",
    "It occurs when water separates the tires from adequate contact with the roadway",
    "It occurs only when the ambulance's tires are worn",
    "It cannot occur when an ambulance has four-wheel drive",
  ],
  answerIndex: 1,
  explanation:
    "Hydroplaning occurs when water builds between the tires and roadway and reduces tire contact with the pavement. The speed at which it becomes possible varies with factors such as water depth, tire condition, tire pressure, roadway characteristics, and vehicle speed.",
},

{
  id: "ops-017",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which condition increases the likelihood that an ambulance will hydroplane?",
  choices: [
    "Standing water on the roadway",
    "A completely dry road",
    "Reduced vehicle speed",
    "A clean, dry parking lot",
  ],
  answerIndex: 0,
  explanation:
    "Standing water increases the possibility that the tires will lose sufficient contact with the roadway. Drivers should reduce speed and maintain appropriate control in wet conditions.",
},

{
  id: "ops-018",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "When approaching an intersection during an emergency response, which action is most appropriate?",
  choices: [
    "Assume every driver has seen the ambulance",
    "Accelerate through the intersection before cross traffic arrives",
    "Slow appropriately and verify that other traffic has yielded before proceeding",
    "Turn off warning devices to reduce confusion",
  ],
  answerIndex: 2,
  explanation:
    "Other drivers may not see or hear an approaching ambulance. The driver should approach intersections cautiously and ensure that the path is safe before proceeding.",
},

{
  id: "ops-019",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which resource is most appropriate for determining the specific federal requirements and standards applicable to an ambulance design?",
  choices: [
    "The crew's personal preference",
    "Applicable federal and state ambulance standards",
    "A patient's medical history",
    "The ambulance driver's preferred equipment layout",
  ],
  answerIndex: 1,
  explanation:
    "Ambulance design and equipment requirements are governed by applicable standards and regulations rather than individual crew preference. Requirements can also change over time, so current standards should be consulted.",
},

{
  id: "ops-020",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Your ambulance is traveling through an intersection with emergency warning devices activated. A driver approaching from the side does not appear to have noticed you. What is the safest response?",
  choices: [
    "Continue at full speed because the ambulance has priority",
    "Slow or stop as needed to prevent a collision",
    "Turn off the warning devices and continue",
    "Sound the siren once and accelerate",
  ],
  answerIndex: 1,
  explanation:
    "Emergency warning devices do not eliminate collision risk. If another driver has not yielded, the ambulance operator should take whatever safe action is necessary to avoid a crash.",
},

{
  id: "ops-021",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Maintaining space between the ambulance and nearby vehicles gives the driver more time to react to unexpected hazards. This space is commonly called a:",
  choices: [
    "Cushion of safety",
    "Hot zone",
    "Transfer corridor",
    "Safety perimeter",
  ],
  answerIndex: 0,
  explanation:
    "A cushion of safety is the open space maintained around a vehicle so the driver has additional time and room to respond to hazards.",
},

{
  id: "ops-022",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which situation is most likely to reduce an EMT's ability to safely operate an ambulance?",
  choices: [
    "Adequate rest",
    "Regular breaks",
    "Chronic sleep deprivation and stress",
    "Working a predictable schedule",
  ],
  answerIndex: 2,
  explanation:
    "Sleep deprivation and psychological stress can contribute to fatigue and impaired attention. EMS providers should recognize fatigue as a safety issue affecting both patient care and vehicle operation.",
},

{
  id: "ops-023",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "During which phase of an EMS call does the crew typically receive and review information about the nature and location of the call while preparing to respond?",
  choices: [
    "Postrun phase",
    "Dispatch and response phase",
    "Patient transfer phase",
    "Equipment decontamination phase",
  ],
  answerIndex: 1,
  explanation:
    "During dispatch and response, the crew receives information about the call and prepares to reach the scene safely. Specific terminology for call phases may vary by EMS system.",
},

{
  id: "ops-024",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You arrive at a scene that appears to involve multiple injured people after a structural collapse. What should you do before becoming committed to individual patient care?",
  choices: [
    "Immediately begin treating the first patient you see",
    "Determine scene safety and request additional resources as needed",
    "Transport the closest patient immediately",
    "Wait until every patient's identity is known",
  ],
  answerIndex: 1,
  explanation:
    "A mass-casualty scene requires an organized response. The EMT should first consider scene safety, recognize that available resources may be insufficient, and request additional resources early.",
},

{
  id: "ops-025",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "At a suspected mass-casualty incident, why is early notification for additional resources important?",
  choices: [
    "It allows the first crew to avoid performing triage",
    "One ambulance may not have enough personnel and equipment for the number of patients",
    "It guarantees that every patient will immediately receive advanced life support",
    "It eliminates the need for an incident command structure",
  ],
  answerIndex: 1,
  explanation:
    "A large number of patients can quickly overwhelm the personnel and equipment available to the first-arriving unit. Early resource requests help build an adequate response.",
},

{
  id: "ops-026",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "When an ambulance is traveling behind another vehicle, which practice best helps preserve a safety margin?",
  choices: [
    "Following as closely as possible",
    "Maintaining an appropriate following distance",
    "Driving directly beside the vehicle",
    "Using the shoulder whenever traffic slows",
  ],
  answerIndex: 1,
  explanation:
    "A sufficient following distance gives the driver additional time to react if the vehicle ahead brakes or changes direction unexpectedly. The exact distance should account for speed, road conditions, traffic, and visibility.",
},

{
  id: "ops-027",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You arrive near a tanker truck that is releasing an unknown vapor. From a safety perspective, where should the ambulance generally be positioned if conditions permit?",
  choices: [
    "Downwind and downhill from the truck",
    "Upwind and uphill from the suspected release",
    "Directly beside the leaking vehicle",
    "Inside the area where the vapor is visible",
  ],
  answerIndex: 1,
  explanation:
    "For a suspected hazardous-material release, positioning uphill and upwind can reduce the likelihood of exposure to vapors or contaminated runoff. The crew should remain outside the hazardous area and follow the incident command and hazmat team's instructions.",
},

{
  id: "ops-028",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You arrive at a suspected hazardous-material incident before the specialized hazmat team. What is the most appropriate action?",
  choices: [
    "Enter the contaminated area to locate patients",
    "Approach closely enough to identify the chemical by smell",
    "Remain at a safe distance and provide information while awaiting appropriate resources",
    "Begin washing exposed patients without considering contamination control",
  ],
  answerIndex: 2,
  explanation:
    "EMS personnel should not enter a hazardous area without appropriate training and protective equipment. The priority is responder safety, scene isolation, communication, and coordination with appropriately equipped personnel.",
},

{
  id: "ops-029",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which statement about approaching a helicopter is correct?",
  choices: [
    "Approach from whichever direction is shortest",
    "Approach only after receiving permission or a clear signal from the flight crew",
    "Walk toward the tail rotor to get the crew's attention",
    "Approach while the rotors are turning without communicating with the crew",
  ],
  answerIndex: 1,
  explanation:
    "Helicopter operations present significant hazards. EMS personnel should follow the flight crew's instructions and never approach a helicopter independently or enter the rotor area without authorization.",
},

{
  id: "ops-030",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "A helicopter must land on sloped terrain. From which side should personnel generally approach the aircraft if instructed to do so?",
  choices: [
    "The uphill side",
    "The downhill side",
    "Directly from behind",
    "Under the tail boom",
  ],
  answerIndex: 1,
  explanation:
    "When approaching a helicopter on sloped terrain, the downhill side generally provides greater clearance from the rotor system. Personnel must still follow the flight crew's specific instructions.",
},

{
  id: "ops-031",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Why should EMS personnel never walk behind a helicopter with its rotors turning?",
  choices: [
    "The tail rotor can be difficult or impossible to see",
    "The helicopter automatically moves backward",
    "The rear of the aircraft contains the fuel tank",
    "The rear landing gear can collapse",
  ],
  answerIndex: 0,
  explanation:
    "The tail rotor can be extremely dangerous and may be difficult to see while rotating. Personnel should avoid the tail area and follow the flight crew's directions.",
},

{
  id: "ops-032",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which term describes a helicopter or fixed-wing aircraft specifically equipped to provide medical transportation?",
  choices: [
    "First-responder vehicle",
    "Air ambulance",
    "Jump unit",
    "Rescue basket",
  ],
  answerIndex: 1,
  explanation:
    "An air ambulance is an aircraft configured and staffed as appropriate to transport patients while providing medical care.",
},

{
  id: "ops-033",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What does the term 'medevac' most commonly refer to in EMS?",
  choices: [
    "Medical evacuation or transport of a patient",
    "Removal of hazardous materials",
    "Decontamination of an ambulance",
    "Transfer of equipment between stations",
  ],
  answerIndex: 0,
  explanation:
    "Medevac is an abbreviation for medical evacuation. In EMS it commonly refers to moving a patient from one location to an appropriate medical facility, often by air when indicated.",
},

{
  id: "ops-034",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "A crew member stands outside the ambulance while the driver reverses and communicates hazards that the driver cannot see. What is this person commonly called?",
  choices: [
    "Triage officer",
    "Spotter",
    "Extrication officer",
    "Runner",
  ],
  answerIndex: 1,
  explanation:
    "A spotter assists the driver during backing operations by watching areas that may be hidden from the driver's view and communicating hazards.",
},

{
  id: "ops-035",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which term describes areas around a vehicle that the driver cannot directly see through the mirrors or windows?",
  choices: [
    "Blind spots",
    "Cushion zones",
    "Transfer zones",
    "Hot zones",
  ],
  answerIndex: 0,
  explanation:
    "Blind spots are areas that cannot be directly observed from the driver's normal field of view. Drivers and spotters should account for these areas during vehicle operations.",
},

{
  id: "ops-036",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which term refers to the six-pointed symbol commonly associated with emergency medical services?",
  choices: [
    "Red Cross",
    "Star of Life",
    "Emergency Medical Seal",
    "Rescue Star",
  ],
  answerIndex: 1,
  explanation:
    "The Star of Life is the internationally recognized symbol associated with emergency medical services. It features a staff with a serpent surrounded by six arms.",
},

{
  id: "ops-037",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which sequence correctly represents progressively more intensive methods of dealing with contamination?",
  choices: [
    "Cleaning, disinfection, sterilization",
    "Sterilization, cleaning, disinfection",
    "Disinfection, contamination, cleaning",
    "Cleaning, contamination, sterilization",
  ],
  answerIndex: 0,
  explanation:
    "Cleaning removes visible dirt and organic material. Disinfection uses physical or chemical methods to destroy many pathogenic organisms. Sterilization is a higher level of microbial control intended to eliminate all forms of microbial life, including spores.",
},

{
  id: "ops-038",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT wipes visible blood from an ambulance surface before applying an appropriate disinfectant. What process was performed by removing the visible material?",
  choices: [
    "Sterilization",
    "Cleaning",
    "High-level disinfection",
    "Decontamination of personnel",
  ],
  answerIndex: 1,
  explanation:
    "Cleaning is the physical removal of dirt, blood, body fluids, and other visible contamination. Disinfection can then be performed as appropriate for the surface and contamination involved.",
},

{
  id: "ops-039",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which process is intended to destroy or eliminate all forms of microbial life, including highly resistant organisms such as bacterial spores?",
  choices: [
    "Cleaning",
    "Routine disinfection",
    "Sterilization",
    "Handwashing only",
  ],
  answerIndex: 2,
  explanation:
    "Sterilization is the highest level of microbial destruction and is intended to eliminate all forms of microbial life, including spores.",
},

{
  id: "ops-040",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "After a hazardous chemical contaminates an EMT's protective clothing, the EMT follows a procedure designed to remove or neutralize the contaminant. This process is called:",
  choices: [
    "Disinfection",
    "Decontamination",
    "Sterilization",
    "Isolation",
  ],
  answerIndex: 1,
  explanation:
    "Decontamination involves removing or neutralizing hazardous substances from people, clothing, equipment, vehicles, or other surfaces.",
},

{
  id: "ops-041",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which term describes an EMS vehicle specifically equipped to transport personnel and equipment to emergency scenes?",
  choices: [
    "First-responder vehicle",
    "Air ambulance",
    "Stokes basket",
    "Patient compartment",
  ],
  answerIndex: 0,
  explanation:
    "A first-responder vehicle carries EMS personnel and equipment to the scene. It may not itself be configured to transport patients.",
},

{
  id: "ops-042",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Two EMTs need to quickly move an uninjured, unconscious adult out of a very narrow bathroom so they can begin resuscitation. They cannot position themselves side by side for a ground lift. Which technique is most practical?",
  choices: [
    "Extremity lift",
    "Direct ground lift",
    "Long-backboard slide",
    "Standing pivot transfer",
  ],
  answerIndex: 0,
  explanation:
    "An extremity lift can be useful when two rescuers must move a patient through a confined area where they cannot position themselves for a conventional ground lift. The technique should only be used when appropriate for the patient's condition and the rescuers' capabilities.",
},

{
  id: "ops-043",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "A conscious patient with no apparent traumatic injury is found sitting on the floor of a narrow hallway. Two EMTs need to move the patient a short distance to an area where a full assessment can be performed. Which consideration is most important when selecting a movement technique?",
  choices: [
    "Use the technique that is safest and most appropriate for the patient's condition and environment",
    "Always use a long backboard",
    "Always perform a direct ground lift",
    "Choose the technique requiring the greatest amount of equipment",
  ],
  answerIndex: 0,
  explanation:
    "Patient movement should be based on the patient's condition, available personnel, environment, and equipment. The goal is safe and efficient movement while minimizing unnecessary injury to the patient and rescuers.",
},

{
  id: "ops-044",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "You gain access to a patient trapped inside a vehicle after a crash. The patient is semiconscious but there is no fire, explosion, or other immediate environmental threat. What should you do first?",
  choices: [
    "Wait outside until the fire department completes extrication",
    "Perform a primary assessment and treat immediately life-threatening problems",
    "Obtain a complete set of vital signs before touching the patient",
    "Perform a detailed head-to-toe examination",
  ],
  answerIndex: 1,
  explanation:
    "Once access is obtained and the scene is safe, the EMT should begin the primary assessment and address immediate life threats. Waiting for complete extrication before treating a critical problem could unnecessarily delay lifesaving care.",
},

{
  id: "ops-045",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A trapped patient has severe external bleeding from the leg while the rescue team is preparing for extrication. What is the EMT's priority?",
  choices: [
    "Wait until the patient is completely removed from the vehicle",
    "Address the life-threatening bleeding as soon as access and safety permit",
    "Complete the secondary assessment first",
    "Obtain the patient's insurance information",
  ],
  answerIndex: 1,
  explanation:
    "Life-threatening bleeding should be addressed as soon as the EMT can safely access the patient. Critical interventions should not unnecessarily wait until the entire extrication process is complete.",
},

{
  id: "ops-046",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which piece of equipment is specifically intended to provide a firm surface beneath a patient's torso during CPR when the situation calls for one?",
  choices: [
    "CPR board",
    "Stair chair",
    "Jump kit",
    "Stokes basket",
  ],
  answerIndex: 0,
  explanation:
    "A CPR board is designed to provide a firm supporting surface beneath the patient's torso. Whether one is needed depends on the patient, stretcher system, and equipment being used.",
},

{
  id: "ops-047",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which item would be most appropriate to carry into a residence when the crew wants immediate access to a limited set of equipment for initial life-threatening problems?",
  choices: [
    "Jump kit",
    "Stokes basket",
    "CPR board",
    "Long backboard",
  ],
  answerIndex: 0,
  explanation:
    "A jump kit is a portable collection of equipment intended for initial patient care. It allows the crew to begin managing immediate problems without carrying every piece of equipment from the ambulance.",
},

{
  id: "ops-048",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An ambulance crew needs to carry a patient down several flights of stairs. Which equipment is specifically designed to facilitate movement of a patient through stairways?",
  choices: [
    "Stair chair",
    "CPR board",
    "Jump kit",
    "AED",
  ],
  answerIndex: 0,
  explanation:
    "A stair chair is designed to help EMS personnel move patients through stairways and other areas where a conventional wheeled stretcher cannot be easily used.",
},

{
  id: "ops-049",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which action best demonstrates proper preparation before beginning an EMS response?",
  choices: [
    "Reviewing available dispatch information and identifying the destination",
    "Removing the ambulance restraints so equipment can be reached faster",
    "Ignoring weather and roadway conditions",
    "Waiting until arrival to determine whether additional resources are needed",
  ],
  answerIndex: 0,
  explanation:
    "Preparation includes reviewing dispatch information, considering the nature of the call, anticipating equipment needs, and planning a safe response.",
},

{
  id: "ops-050",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "An ambulance is approaching a crash scene at night. Several vehicles are stopped along the roadway. Which action should receive the highest priority?",
  choices: [
    "Position the ambulance so it can be seen and does not create an additional hazard",
    "Park as close to the wreck as physically possible",
    "Turn off all warning lights immediately",
    "Block every lane regardless of traffic conditions",
  ],
  answerIndex: 0,
  explanation:
    "The ambulance should be positioned to protect the scene and responders while maintaining appropriate visibility and access. Poor vehicle placement can create a secondary collision hazard.",
},

{
  id: "ops-051",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You are dispatched to a reported chemical spill. Which observation should make you especially cautious about approaching the scene?",
  choices: [
    "A strong unidentified vapor cloud",
    "A normal residential lawn",
    "A parked bicycle",
    "A dry sidewalk",
  ],
  answerIndex: 0,
  explanation:
    "An unidentified vapor cloud may indicate a hazardous-material release. EMS personnel should not approach unknown substances simply to identify them and should remain at a safe distance until the hazard is characterized and appropriate resources arrive.",
},

{
  id: "ops-052",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which statement best describes an ambulance?",
  choices: [
    "A vehicle designed and equipped to provide emergency medical care and transport patients",
    "Any vehicle used by a police department",
    "A vehicle used exclusively for transporting medical supplies",
    "A vehicle that may transport patients without medical equipment",
  ],
  answerIndex: 0,
  explanation:
    "An ambulance is specifically designed or equipped for emergency medical response and patient transportation. Exact equipment and configuration requirements vary according to applicable standards and regulations.",
},

{
  id: "ops-053",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which term best describes the process of using chemicals or other appropriate methods to reduce pathogenic organisms on an object or surface?",
  choices: [
    "Disinfection",
    "Triage",
    "Extrication",
    "Immobilization",
  ],
  answerIndex: 0,
  explanation:
    "Disinfection is the process of destroying or inactivating many pathogenic microorganisms on inanimate objects and surfaces. It is distinct from cleaning and sterilization.",
},

{
  id: "ops-054",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "A substance capable of causing harm is found on an EMT's uniform after a hazmat incident. What is the appropriate overall goal of decontamination?",
  choices: [
    "Move the contaminant to another surface",
    "Remove or neutralize the hazardous substance",
    "Make the uniform look clean without addressing the chemical",
    "Sterilize the entire incident scene",
  ],
  answerIndex: 1,
  explanation:
    "Decontamination is intended to remove or neutralize hazardous substances so that the contamination no longer presents an unacceptable exposure risk.",
},

{
  id: "ops-055",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which situation best illustrates the difference between cleaning and disinfection?",
  choices: [
    "Removing visible blood from a surface is cleaning; applying an appropriate disinfectant afterward is disinfection",
    "Applying disinfectant to a surface always counts as sterilization",
    "Removing visible dirt is sterilization",
    "Wearing gloves is a form of disinfection",
  ],
  answerIndex: 0,
  explanation:
    "Cleaning physically removes visible contamination. Disinfection then uses an appropriate chemical or physical process to reduce pathogenic microorganisms on the cleaned surface.",
},

{
  id: "ops-056",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "During a helicopter landing-zone operation, which area presents the greatest concern because personnel may not recognize a moving rotor?",
  choices: [
    "The tail rotor area",
    "The patient treatment area well outside the aircraft",
    "The designated approach area approved by the flight crew",
    "The ambulance compartment",
  ],
  answerIndex: 0,
  explanation:
    "The tail rotor is particularly hazardous because it may be difficult to see while rotating. Personnel should never approach the aircraft without authorization and should follow flight crew instructions.",
},

{
  id: "ops-057",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "A helicopter is preparing to land at an EMS scene. Which action should ground personnel take?",
  choices: [
    "Secure loose objects and follow the flight crew's landing-zone instructions",
    "Stand beside the aircraft to guide it without communicating with the crew",
    "Approach the aircraft immediately when it touches down",
    "Allow unsecured blankets and equipment to remain near the landing area",
  ],
  answerIndex: 0,
  explanation:
    "Rotor wash can move loose equipment and debris, creating hazards. Ground personnel should secure the landing area and follow the flight crew's directions.",
},

{
  id: "ops-058",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which piece of equipment is primarily intended to help secure a patient during difficult terrain movement rather than to provide treatment?",
  choices: [
    "Stokes basket",
    "AED",
    "Bag-valve mask",
    "Suction unit",
  ],
  answerIndex: 0,
  explanation:
    "A Stokes basket is a patient-movement device used when terrain or rescue conditions make conventional transport difficult. The other choices are primarily treatment devices.",
},

{
  id: "ops-059",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "An EMT is driving an ambulance and notices that another vehicle is following extremely close behind. What is the best response?",
  choices: [
    "Brake suddenly to force the vehicle to increase its distance",
    "Maintain safe control and, when practical, allow the vehicle to pass",
    "Accelerate dramatically to create distance",
    "Ignore the vehicle and drive onto the shoulder",
  ],
  answerIndex: 1,
  explanation:
    "Tailgating creates an additional hazard. The ambulance operator should avoid aggressive maneuvers and, when practical and safe, allow the following vehicle to pass.",
},

{
  id: "ops-060",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which statement about emergency warning devices is most accurate?",
  choices: [
    "They guarantee that other drivers will yield",
    "They reduce the need for the ambulance driver to watch traffic",
    "They alert other road users but do not eliminate the ambulance driver's responsibility for safe operation",
    "They allow the driver to disregard traffic laws in every jurisdiction",
  ],
  answerIndex: 2,
  explanation:
    "Lights and sirens increase the visibility and audibility of an emergency vehicle, but other drivers may still fail to respond appropriately. The ambulance operator must continue to drive defensively and comply with applicable laws.",
},

{
  id: "ops-061",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which factor should an ambulance driver consider when deciding how much following distance to maintain?",
  choices: [
    "Only the posted speed limit",
    "Speed, weather, roadway conditions, traffic, and visibility",
    "Only the number of patients in the ambulance",
    "Only whether the siren is activated",
  ],
  answerIndex: 1,
  explanation:
    "A safe following distance is not a single universal number. It should increase when speed, traffic, weather, visibility, or roadway conditions increase the time or distance needed to stop safely.",
},

{
  id: "ops-062",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "A crew arrives at a mass-casualty scene and sees numerous injured people. Which action is most appropriate before beginning extensive treatment of one patient?",
  choices: [
    "Perform an organized scene size-up and initiate the appropriate MCI response",
    "Transport the first patient immediately",
    "Treat the most vocal patient first",
    "Wait for every patient to be individually assessed",
  ],
  answerIndex: 0,
  explanation:
    "Mass-casualty incidents require organization and resource management. The crew should establish situational awareness, request resources, and follow the applicable incident command and triage process.",
},

{
  id: "ops-063",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "You reach a severely injured patient who remains trapped in a vehicle. There is no immediate fire or other environmental threat. Which action should occur before a detailed secondary assessment?",
  choices: [
    "Primary assessment and treatment of immediate life threats",
    "Obtaining a complete medical history",
    "Completing a detailed musculoskeletal examination",
    "Waiting for the patient's extrication to be completed",
  ],
  answerIndex: 0,
  explanation:
    "The primary assessment identifies immediate threats to life and guides urgent treatment. Secondary assessment and additional history come after immediate life threats have been addressed as circumstances permit.",
},
{
  id: "ops-064",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which description best matches a 'cushion of safety' when driving an ambulance?",
  choices: [
    "The protective padding around the ambulance stretcher",
    "Open space maintained around the ambulance to provide reaction time",
    "The area immediately behind the ambulance",
    "The distance between the ambulance and the hospital",
  ],
  answerIndex: 1,
  explanation:
    "A cushion of safety is the space maintained around a moving vehicle so the driver has additional time and room to respond to hazards.",
},

{
  id: "ops-065",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which term describes the inability to see an area around a vehicle because it is hidden from the driver's normal view?",
  choices: [
    "Hydroplaning",
    "Blind spot",
    "Buffer zone",
    "Decontamination zone",
  ],
  answerIndex: 1,
  explanation:
    "A blind spot is an area that cannot be directly observed from the driver's normal field of vision or mirrors.",
},

{
  id: "ops-066",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which term refers specifically to a person assisting an ambulance driver while the vehicle is being backed?",
  choices: [
    "Spotter",
    "Triage officer",
    "Dispatcher",
    "Extrication technician",
  ],
  answerIndex: 0,
  explanation:
    "A spotter watches areas that may be hidden from the driver's view and communicates hazards during backing operations.",
},

{
  id: "ops-067",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "A vehicle's tires lose much of their contact with the roadway because water has accumulated underneath them. What phenomenon is occurring?",
  choices: [
    "Hydroplaning",
    "Oversteer",
    "Skidding from ice",
    "Mechanical rollover",
  ],
  answerIndex: 0,
  explanation:
    "Hydroplaning occurs when water reduces the tires' contact with the roadway, potentially causing a significant loss of steering and braking control.",
},

{
  id: "ops-068",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which term describes medical evacuation performed using an aircraft?",
  choices: [
    "Medevac",
    "Decon",
    "Extrication",
    "Triage",
  ],
  answerIndex: 0,
  explanation:
    "Medevac is short for medical evacuation. In many EMS systems it refers to moving a patient by air when that mode of transport is appropriate.",
},

{
  id: "ops-069",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT uses an approved chemical product on a cleaned ambulance surface to reduce pathogenic microorganisms. What process is being performed?",
  choices: [
    "Disinfection",
    "Sterilization",
    "Extrication",
    "Triage",
  ],
  answerIndex: 0,
  explanation:
    "Disinfection uses an appropriate physical or chemical process to destroy or inactivate many pathogenic microorganisms on surfaces.",
},

{
  id: "ops-070",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which process specifically involves removing visible blood and other material from a surface before further processing?",
  choices: [
    "Cleaning",
    "Sterilization",
    "Medevac",
    "Triage",
  ],
  answerIndex: 0,
  explanation:
    "Cleaning physically removes visible dirt, blood, body fluids, and other contaminants. Additional disinfection may then be appropriate.",
},

{
  id: "ops-071",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which process is specifically intended to eliminate all forms of microbial life rather than merely reduce the number of pathogens?",
  choices: [
    "Cleaning",
    "Sterilization",
    "Routine surface cleaning",
    "Hand hygiene",
  ],
  answerIndex: 1,
  explanation:
    "Sterilization is intended to eliminate all forms of microbial life, including resistant organisms such as bacterial spores.",
},

{
  id: "ops-072",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT must remove a hazardous chemical from protective clothing after a contamination event. Which process is required?",
  choices: [
    "Decontamination",
    "Triage",
    "Medevac",
    "Extrication",
  ],
  answerIndex: 0,
  explanation:
    "Decontamination removes or neutralizes hazardous substances from people, clothing, equipment, vehicles, and other contaminated items.",
},

{
  id: "ops-073",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which EMS vehicle is specifically intended to carry personnel and equipment to an emergency scene but may not be configured to transport a patient?",
  choices: [
    "First-responder vehicle",
    "Air ambulance",
    "Wheeled stretcher",
    "Stokes basket",
  ],
  answerIndex: 0,
  explanation:
    "A first-responder vehicle transports EMS personnel and equipment to the scene. Patient transport capability depends on the specific vehicle.",
},

{
  id: "ops-074",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which equipment is specifically designed to help move a patient through a stairway?",
  choices: [
    "Stair chair",
    "CPR board",
    "Jump kit",
    "AED",
  ],
  answerIndex: 0,
  explanation:
    "A stair chair is designed for moving patients through stairways and other confined spaces where a standard wheeled stretcher may not be practical.",
},

{
  id: "ops-075",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which equipment provides a rigid supporting surface beneath a patient's torso during CPR when indicated?",
  choices: [
    "CPR board",
    "Stokes basket",
    "Jump kit",
    "Stair chair",
  ],
  answerIndex: 0,
  explanation:
    "A CPR board provides a firm surface beneath the torso during resuscitation when the patient-support system and circumstances make one appropriate.",
},

{
  id: "ops-076",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which portable equipment package is designed to give an EMS crew rapid access to commonly needed equipment during initial patient care?",
  choices: [
    "Jump kit",
    "Stokes basket",
    "CPR board",
    "Long backboard",
  ],
  answerIndex: 0,
  explanation:
    "A jump kit contains a selection of equipment intended for initial patient care and immediate life threats.",
},
// ----------------------------------------------------------------------------
// Patient Transfer Equipment
// ----------------------------------------------------------------------------
{
  id: "ops-077",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which of the following is NOT typically considered a device used to move or transfer patients?",
  choices: [
    "Stokes basket",
    "Long backboard",
    "Wheeled stair chair",
    "Portable suction unit",
  ],
  answerIndex: 3,
  explanation:
    "A portable suction unit is used to manage the airway, not to move or transfer a patient. Stokes baskets, long backboards, and stair chairs are all equipment that may be used for patient movement.",
},

{
  id: "ops-078",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which piece of equipment is specifically designed to help move a patient through difficult terrain or from a confined or elevated location?",
  choices: [
    "Stokes basket",
    "AED",
    "Portable oxygen cylinder",
    "CPR board",
  ],
  answerIndex: 0,
  explanation:
    "A Stokes basket, also called a rescue basket or litter, is designed to secure and move patients in situations involving difficult terrain, confined spaces, or technical rescue. The other choices are treatment equipment rather than patient-movement devices.",
},

// ----------------------------------------------------------------------------
// Jump Kit
// ----------------------------------------------------------------------------
{
  id: "ops-079",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What is the primary purpose of carrying a jump kit to the patient's side?",
  choices: [
    "To carry every piece of equipment needed for the entire call",
    "To provide immediate access to equipment needed to address life threats",
    "To replace the ambulance stretcher during patient movement",
    "To store equipment that is used only during transport",
  ],
  answerIndex: 1,
  explanation:
    "A jump kit contains essential equipment that allows the crew to begin addressing immediate life threats without having to bring the entire ambulance to the patient. Additional equipment can be retrieved as needed.",
},

{
  id: "ops-080",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "You are first approaching a patient who may have a life-threatening problem. Which item would be most appropriate to have immediately available in a jump kit?",
  choices: [
    "Equipment for airway management",
    "A complete set of splints for every possible injury",
    "A spare stretcher mattress",
    "All equipment stored on the ambulance",
  ],
  answerIndex: 0,
  explanation:
    "A jump kit should contain equipment needed for immediate assessment and treatment of life threats, including airway and breathing emergencies. It is not intended to contain every piece of equipment on the ambulance.",
},

// ----------------------------------------------------------------------------
// Dispatch Information
// ----------------------------------------------------------------------------
{
  id: "ops-081",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You are dispatched to an unconscious patient. Before approaching the scene, which piece of information is most important to confirm so you can locate the patient?",
  choices: [
    "The caller's occupation",
    "The patient's medical history",
    "The exact location of the patient",
    "The patient's insurance information",
  ],
  answerIndex: 2,
  explanation:
    "Knowing the exact location is essential so the crew can reach the patient quickly. Other information may be useful, but location is the immediate operational priority.",
},

{
  id: "ops-082",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "During dispatch, the dispatcher tells you that the patient is unconscious. Which additional information would be especially important for the crew to obtain before arrival?",
  choices: [
    "Whether the patient is breathing",
    "The patient's favorite hospital",
    "The patient's occupation",
    "The patient's insurance carrier",
  ],
  answerIndex: 0,
  explanation:
    "Determining whether an unconscious patient is breathing helps the crew anticipate the need for immediate airway and resuscitation equipment. Dispatch information should also include location and other relevant scene details.",
},

// ----------------------------------------------------------------------------
// Ambulance Occupant Safety
// ----------------------------------------------------------------------------
{
  id: "ops-083",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "While responding to a serious motor vehicle crash, which action provides the most basic protection for you and your partner while the ambulance is moving?",
  choices: [
    "Keeping your seat belts and shoulder restraints secured",
    "Driving with the high beams on continuously",
    "Following another emergency vehicle closely",
    "Turning off all warning devices",
  ],
  answerIndex: 0,
  explanation:
    "Seat belts and shoulder restraints should be used whenever the ambulance is moving, unless a specific operational circumstance makes this impossible. Ambulance occupants are vulnerable to injury during sudden braking or crashes.",
},

{
  id: "ops-084",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Your partner is treating a patient in the back of the ambulance while you are driving. Which action is safest?",
  choices: [
    "Accelerate rapidly so the patient reaches the hospital sooner",
    "Maintain safe driving practices even when the patient's condition is serious",
    "Allow your partner to remain unrestrained throughout transport",
    "Assume other drivers will always yield to the ambulance",
  ],
  answerIndex: 1,
  explanation:
    "Emergency response does not eliminate the need for safe vehicle operation. The driver should use due regard and minimize unnecessary risk while transporting the patient.",
},

// ----------------------------------------------------------------------------
// Ambulance Driving
// ----------------------------------------------------------------------------
{
  id: "ops-085",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which of the following is NOT a generally accepted principle of safe emergency vehicle operation?",
  choices: [
    "Drive with due regard for other road users",
    "Remain alert for unexpected actions by motorists",
    "Use one-way streets whenever possible regardless of traffic conditions",
    "Maintain a safe following distance",
  ],
  answerIndex: 2,
  explanation:
    "Emergency vehicle operators should not blindly choose a particular road type simply because it is one-way. Safe route selection depends on traffic, road conditions, visibility, and applicable laws. Due regard and maintaining adequate space are fundamental safety principles.",
},

{
  id: "ops-086",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "What does driving with 'due regard' mean for an emergency vehicle operator?",
  choices: [
    "Assuming other drivers will immediately yield",
    "Driving as fast as possible to shorten response time",
    "Remaining responsible for the safety of other people while operating the ambulance",
    "Using lights and siren on every EMS call",
  ],
  answerIndex: 2,
  explanation:
    "Due regard means the emergency vehicle operator must consider the safety of other motorists, pedestrians, and property while driving. Emergency status does not eliminate the operator's responsibility to drive safely.",
},

// ----------------------------------------------------------------------------
// Hydroplaning
// ----------------------------------------------------------------------------
{
  id: "ops-087",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which condition increases the likelihood that an ambulance will hydroplane?",
  choices: [
    "Standing water on the roadway combined with higher speed",
    "A dry roadway with good tire traction",
    "A clean windshield",
    "A properly adjusted seat",
  ],
  answerIndex: 0,
  explanation:
    "Hydroplaning occurs when water builds up between the tires and roadway, reducing tire contact with the road. Speed, water depth, tire condition, and roadway conditions all affect the risk.",
},

{
  id: "ops-088",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You are driving an ambulance during heavy rain and encounter standing water. Which action best reduces the risk of losing traction?",
  choices: [
    "Increase speed to pass through the water quickly",
    "Reduce speed and avoid sudden steering or braking",
    "Turn sharply toward the shoulder",
    "Activate the high beams and accelerate",
  ],
  answerIndex: 1,
  explanation:
    "Reducing speed and avoiding sudden steering, braking, or acceleration helps maintain tire contact with the roadway. Standing water can substantially reduce traction.",
},

// ----------------------------------------------------------------------------
// Ambulance Crash Locations
// ----------------------------------------------------------------------------
{
  id: "ops-089",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Why are intersections particularly hazardous for ambulances operating in emergency mode?",
  choices: [
    "They contain no traffic-control devices",
    "Other drivers may not recognize or correctly respond to the ambulance's approach",
    "Ambulances are prohibited from using warning devices there",
    "Emergency vehicles must always stop for several minutes",
  ],
  answerIndex: 1,
  explanation:
    "Intersections create multiple possible paths for conflicting traffic. Even when an ambulance has warning devices activated, other drivers may fail to see, hear, or correctly respond to it.",
},

{
  id: "ops-090",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "As you approach an intersection with the ambulance's warning devices activated, what should you do?",
  choices: [
    "Assume cross traffic will stop",
    "Proceed without slowing because you have the right of way",
    "Slow down and verify that other traffic has yielded before proceeding",
    "Turn off the siren before entering the intersection",
  ],
  answerIndex: 2,
  explanation:
    "Emergency warning devices do not guarantee that other drivers will see or yield to the ambulance. The operator should reduce risk by slowing and confirming that the intersection is safe before proceeding.",
},

// ----------------------------------------------------------------------------
// Helicopter Landing Zone
// ----------------------------------------------------------------------------
{
  id: "ops-091",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "When establishing a helicopter landing zone, which consideration is most important?",
  choices: [
    "Choosing a clear, level area of adequate size that is free of hazards",
    "Parking the ambulance directly beside the helicopter",
    "Placing loose equipment around the perimeter",
    "Standing near the landing area to guide the aircraft",
  ],
  answerIndex: 0,
  explanation:
    "The landing zone should be large enough, clear of obstructions and loose objects, and suitable for the aircraft and crew. The flight crew has final authority regarding whether a landing zone is acceptable.",
},

{
  id: "ops-092",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which item should be removed or secured before a helicopter arrives at an EMS landing zone?",
  choices: [
    "Loose debris that could become airborne",
    "The ambulance's patient stretcher",
    "The landing zone itself",
    "The helicopter crew",
  ],
  answerIndex: 0,
  explanation:
    "Rotor wash can turn loose objects into dangerous projectiles. The landing zone should be inspected and loose debris secured or removed before the aircraft arrives.",
},

// ----------------------------------------------------------------------------
// Helicopter Safety
// ----------------------------------------------------------------------------
{
  id: "ops-093",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which statement about approaching a helicopter is correct?",
  choices: [
    "Approach only after the flight crew has indicated that it is safe",
    "Walk toward the rear of the helicopter whenever possible",
    "Duck underneath the main rotor to cross to the other side",
    "Approach while carrying loose equipment above your head",
  ],
  answerIndex: 0,
  explanation:
    "The flight crew controls aircraft operations and should indicate when it is safe to approach. Personnel should never walk toward the tail rotor or duck under rotor blades.",
},

{
  id: "ops-094",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "A helicopter has landed on a sloped surface. If the flight crew permits you to approach, which direction is generally safer?",
  choices: [
    "From the downhill side",
    "From the uphill side",
    "Directly from the rear",
    "From whichever side has the strongest wind",
  ],
  answerIndex: 0,
  explanation:
    "On sloped terrain, the rotor disk may be closer to the ground on the uphill side. When permitted by the flight crew, personnel should approach from the downhill side and remain aware of rotor hazards.",
},

// ----------------------------------------------------------------------------
// Hazardous Materials Scene Parking
// ----------------------------------------------------------------------------
{
  id: "ops-095",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "When approaching a suspected hazardous-materials incident, where should the ambulance generally be positioned?",
  choices: [
    "Downwind and downhill from the release",
    "Upwind and uphill from the release when feasible",
    "Immediately beside the leaking container",
    "Inside the area where the substance was released",
  ],
  answerIndex: 1,
  explanation:
    "When feasible, EMS vehicles should stage uphill and upwind, outside the contaminated area. This reduces the chance of personnel and equipment being exposed to hazardous substances.",
},

{
  id: "ops-096",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You arrive near a chemical spill and notice that the wind is blowing toward your ambulance. What is the best immediate action?",
  choices: [
    "Remain where you are and begin treating patients",
    "Move the ambulance to a safer location upwind if possible",
    "Open the ambulance doors to improve ventilation",
    "Drive closer to identify the chemical",
  ],
  answerIndex: 1,
  explanation:
    "EMS personnel should avoid entering a potentially contaminated area without appropriate training and protection. Moving upwind and away from the release reduces exposure risk.",
},

// ----------------------------------------------------------------------------
// Ambulance Standards
// ----------------------------------------------------------------------------
{
  id: "ops-097",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which organization historically established federal specifications used in the design of modern ambulances?",
  choices: [
    "National Research Council of the National Academy of Sciences",
    "American Heart Association",
    "Federal Aviation Administration",
    "Occupational Safety and Health Administration",
  ],
  answerIndex: 0,
  explanation:
    "Federal ambulance design specifications have historically been associated with standards developed through the National Research Council of the National Academy of Sciences. Local and state requirements may also apply.",
},

{
  id: "ops-098",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which feature would you expect to find in an ambulance designed for prehospital patient care?",
  choices: [
    "A patient compartment equipped for assessment and treatment",
    "Only passenger seating with no patient-care area",
    "A cargo compartment with no patient restraint system",
    "A cockpit designed exclusively for aircraft operations",
  ],
  answerIndex: 0,
  explanation:
    "An ambulance is a specialized vehicle designed to provide patient care and transport. Its patient compartment contains equipment and systems intended to support assessment, treatment, and safe transportation.",
},

// ----------------------------------------------------------------------------
// Emergency Vehicle Legal Privileges
// ----------------------------------------------------------------------------
{
  id: "ops-099",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "When operating an ambulance in emergency mode, which action may be permitted under applicable law when performed with due regard for safety?",
  choices: [
    "Exceeding the posted speed limit",
    "Ignoring all traffic signals",
    "Driving on sidewalks whenever traffic is heavy",
    "Passing a school bus that has its stop signal activated",
  ],
  answerIndex: 0,
  explanation:
    "Emergency vehicle laws may permit certain exemptions, such as exceeding the posted speed limit, when warning devices are used and the operator acts with due regard for safety. Specific privileges vary by jurisdiction.",
},

{
  id: "ops-100",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which statement about emergency vehicle warning devices is most accurate?",
  choices: [
    "Warning devices guarantee that motorists will yield",
    "Warning devices allow the driver to ignore other traffic",
    "Warning devices alert other road users but do not eliminate the need for due regard",
    "Warning devices make seat belts unnecessary",
  ],
  answerIndex: 2,
  explanation:
    "Lights and sirens are intended to alert other road users, but they do not guarantee that motorists will see or yield to the ambulance. The operator remains responsible for driving safely.",
},

// ----------------------------------------------------------------------------
// Cushion of Safety
// ----------------------------------------------------------------------------
{
  id: "ops-101",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Maintaining space around the ambulance so you have room to react to unexpected hazards is known as maintaining a:",
  choices: [
    "cushion of safety",
    "blind spot",
    "dispatch corridor",
    "treatment zone",
  ],
  answerIndex: 0,
  explanation:
    "A cushion of safety is the space maintained around the ambulance that provides the driver with additional time and distance to react to hazards.",
},

{
  id: "ops-102",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You are driving behind another vehicle during an emergency response. Which action best creates a cushion of safety?",
  choices: [
    "Follow closely so another driver cannot enter the gap",
    "Maintain enough following distance to allow time to react",
    "Drive beside the vehicle in its blind spot",
    "Use the shoulder whenever the vehicle slows",
  ],
  answerIndex: 1,
  explanation:
    "Adequate following distance gives the ambulance operator more time to respond if the vehicle ahead suddenly brakes or changes direction. Maintaining space around the ambulance is a key defensive-driving practice.",
},

// ----------------------------------------------------------------------------
// Fatigue
// ----------------------------------------------------------------------------
{
  id: "ops-103",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which condition can contribute to fatigue in an EMS provider?",
  choices: [
    "Chronic stress",
    "Adequate sleep",
    "Regular rest periods",
    "Appropriate hydration",
  ],
  answerIndex: 0,
  explanation:
    "Stress can contribute to physical and mental fatigue. Adequate sleep, rest, and hydration help reduce fatigue rather than cause it.",
},

{
  id: "ops-104",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT has been working long shifts and sleeping only a few hours each night. Which effect is most likely?",
  choices: [
    "Improved reaction time",
    "Reduced fatigue",
    "Impaired alertness and decision-making",
    "Improved ability to recognize hazards",
  ],
  answerIndex: 2,
  explanation:
    "Sleep deprivation can impair alertness, reaction time, judgment, and decision-making. These effects can create significant safety risks for EMS providers.",
},

// ----------------------------------------------------------------------------
// Phases of an Ambulance Call
// ----------------------------------------------------------------------------
{
  id: "ops-105",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "During which phase of an ambulance call does the crew review dispatch information while traveling toward the scene?",
  choices: [
    "Preparation",
    "Dispatch",
    "En route",
    "Postrun",
  ],
  answerIndex: 2,
  explanation:
    "The en route phase occurs after dispatch and before arrival at the scene. During this period, the crew reviews information about the call, location, hazards, and patient situation while preparing for arrival.",
},

{
  id: "ops-106",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which activity is most appropriate during the preparation phase of an EMS call?",
  choices: [
    "Restocking and checking equipment before the next call",
    "Performing the primary assessment of the patient",
    "Transferring care to hospital staff",
    "Conducting triage at the scene",
  ],
  answerIndex: 0,
  explanation:
    "The preparation phase occurs before a call and includes ensuring that the ambulance, equipment, and crew are ready for the next response.",
},

// ----------------------------------------------------------------------------
// Mass-Casualty Incident: Additional Resources
// ----------------------------------------------------------------------------
{
  id: "ops-107",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "You arrive first at a mass-casualty incident and determine that the number of patients exceeds your available resources. What should you do first?",
  choices: [
    "Request additional resources",
    "Treat the most severely injured patient until transport arrives",
    "Begin transporting patients without notifying anyone",
    "Wait for another ambulance before making any decisions",
  ],
  answerIndex: 0,
  explanation:
    "When resources are insufficient for the number of patients, additional resources should be requested early. MCI operations depend on coordinated resource allocation rather than treating one patient at a time.",
},

{
  id: "ops-108",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "At a large mass-casualty incident, why should an EMT avoid independently leaving an assigned area to help another group?",
  choices: [
    "It may disrupt the incident command structure and leave the original assignment uncovered",
    "EMTs are never allowed to move between areas",
    "Only paramedics may treat MCI patients",
    "The EMT must remain inside the ambulance",
  ],
  answerIndex: 0,
  explanation:
    "MCI operations rely on organized assignments. Leaving an assigned position without authorization can create gaps in care and interfere with the incident command system.",
},

// ----------------------------------------------------------------------------
// MCI Bystanders
// ----------------------------------------------------------------------------
{
  id: "ops-109",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "At a mass-casualty incident, an upset bystander wants to help but is not trained to provide medical care. What is the most appropriate action?",
  choices: [
    "Give the bystander a simple task that does not involve patient care",
    "Allow the bystander to perform advanced medical procedures",
    "Immediately remove the bystander from the entire area",
    "Ignore the bystander regardless of their behavior",
  ],
  answerIndex: 0,
  explanation:
    "A cooperative bystander may be useful when given a simple, nonclinical assignment. This can provide structure while preventing an untrained person from interfering with patient care.",
},

{
  id: "ops-110",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which assignment would be most appropriate for an untrained but cooperative bystander at an MCI?",
  choices: [
    "Establish an IV",
    "Perform triage",
    "Bring supplies to a designated location",
    "Manage an airway",
  ],
  answerIndex: 2,
  explanation:
    "Simple logistical tasks, such as moving supplies under direction, can allow bystanders to help without placing patients at risk. Clinical care should remain with appropriately trained personnel.",
},

// ----------------------------------------------------------------------------
// MCI Treatment Officer
// ----------------------------------------------------------------------------
{
  id: "ops-111",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "You have completed your assignment in the treatment area of an MCI. What should you do next?",
  choices: [
    "Leave the incident without notifying anyone",
    "Find the treatment officer and request your next assignment",
    "Choose another patient and begin treating independently",
    "Drive the ambulance away from the scene",
  ],
  answerIndex: 1,
  explanation:
    "EMS personnel should report back to the person responsible for their assignment after completing it. This maintains organization and prevents freelancing at the MCI.",
},

{
  id: "ops-112",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What is the primary danger of 'freelancing' at a mass-casualty incident?",
  choices: [
    "It may interfere with coordinated resource allocation",
    "It guarantees that every patient receives treatment",
    "It reduces the need for incident command",
    "It allows triage to occur more efficiently",
  ],
  answerIndex: 0,
  explanation:
    "Freelancing means acting outside one's assigned role without authorization. At an MCI, this can leave assignments uncovered and interfere with the organized use of limited resources.",
},

// ----------------------------------------------------------------------------
// Patient Choice and Professionalism
// ----------------------------------------------------------------------------
{
  id: "ops-113",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A competent adult patient requests transport to a particular hospital. The EMT personally dislikes that hospital and tells the patient that its physicians are incompetent. Which description best applies to the EMT's behavior?",
  choices: [
    "Professional and appropriate",
    "Required by EMS protocol",
    "Unprofessional and unethical",
    "Automatically criminal",
  ],
  answerIndex: 2,
  explanation:
    "An EMT should provide objective information and respect a competent patient's choices rather than allowing personal opinions to improperly influence the patient's destination decision. Making disparaging personal comments about physicians is unprofessional and unethical.",
},

{
  id: "ops-114",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient asks which receiving hospital is closest. What is the EMT's best approach?",
  choices: [
    "Provide objective information and follow applicable destination protocols",
    "Tell the patient which physician you personally prefer",
    "Refuse to discuss destination options",
    "Choose a hospital based solely on your personal opinion",
  ],
  answerIndex: 0,
  explanation:
    "EMS providers should provide objective information and follow applicable laws, medical direction, and destination protocols. Personal preferences should not improperly determine the patient's destination.",
},

// ----------------------------------------------------------------------------
// Consent
// ----------------------------------------------------------------------------
{
  id: "ops-115",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "You arrive at the home of an older adult who is awake and appears capable of making decisions. A family member tells you to transport the patient immediately. What should you do first?",
  choices: [
    "Automatically follow the family member's request",
    "Assess the patient and determine whether the patient has decision-making capacity",
    "Transport without speaking to the patient",
    "Tell the family member that age automatically removes the patient's right to decide",
  ],
  answerIndex: 1,
  explanation:
    "A competent adult generally has the right to make decisions about medical care and transport. Age alone does not remove decision-making capacity. The EMT should assess the patient and determine whether the patient can make an informed decision.",
},

{
  id: "ops-116",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which finding would most strongly support that an adult patient may be able to provide valid consent?",
  choices: [
    "The patient is able to understand relevant information and make a rational decision",
    "The patient's family agrees with the treatment",
    "The patient is older than 65 years",
    "The patient is wearing a medical identification bracelet",
  ],
  answerIndex: 0,
  explanation:
    "Decision-making capacity involves the ability to understand relevant information, appreciate the consequences of choices, and communicate a decision. Age or family agreement alone does not establish capacity.",
},

// ----------------------------------------------------------------------------
// Lifting Technique
// ----------------------------------------------------------------------------
{
  id: "ops-117",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "When using a power lift to raise a stretcher, which technique is appropriate?",
  choices: [
    "Bend at the waist while keeping the knees straight",
    "Keep the back straight and lift primarily with the legs",
    "Twist the torso while lifting",
    "Lift with the back muscles while keeping the legs straight",
  ],
  answerIndex: 1,
  explanation:
    "A power lift uses the large muscles of the legs while maintaining a straight, stable back. Bending at the waist and twisting while lifting increase the risk of injury.",
},

{
  id: "ops-118",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which body position places an EMT at the greatest risk of back injury while lifting a stretcher?",
  choices: [
    "Bending at the knees while keeping the back stable",
    "Keeping the load close to the body",
    "Twisting or bending at the waist while lifting",
    "Using the legs to generate lifting force",
  ],
  answerIndex: 2,
  explanation:
    "Twisting or bending at the waist while lifting places excessive stress on the back. Proper lifting uses the legs and maintains a stable back position.",
},

// ----------------------------------------------------------------------------
// Backboard Lifting
// ----------------------------------------------------------------------------
{
  id: "ops-119",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Two EMTs are preparing to lift a secured patient on a long backboard. Which technique is safest?",
  choices: [
    "Lift from the ends while using the legs",
    "Lift from the middle of the sides",
    "Twist while raising the board",
    "Have both EMTs lift primarily with their backs",
  ],
  answerIndex: 0,
  explanation:
    "Lifting from the ends provides better control of the backboard. The EMTs should use proper body mechanics and the large muscles of the legs rather than lifting with their backs.",
},

{
  id: "ops-120",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "When two EMTs lift a loaded backboard, why should they communicate before beginning the lift?",
  choices: [
    "To coordinate the movement and reduce the chance of dropping or shifting the patient",
    "Because the patient must always be lifted head first",
    "Because communication replaces the need for proper lifting technique",
    "Because only one EMT should know when the lift begins",
  ],
  answerIndex: 0,
  explanation:
    "Coordinated movement helps both EMTs lift and lower the patient at the same time. Clear communication reduces unexpected movement and improves safety.",
},

// ----------------------------------------------------------------------------
// Respiratory Protection
// ----------------------------------------------------------------------------
{
  id: "ops-121",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which factor can prevent an N95 or similar tight-fitting respirator from achieving an adequate seal?",
  choices: [
    "Facial hair that interferes with the sealing surface",
    "Wearing protective eyewear",
    "Wearing gloves",
    "Having short hair on the scalp",
  ],
  answerIndex: 0,
  explanation:
    "Tight-fitting respirators depend on an effective seal against the face. Facial hair in the sealing area can interfere with that seal. Fit-testing and employer respiratory-protection procedures should be followed.",
},

{
  id: "ops-122",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which type of respiratory protection is designed to provide a tight facial seal and filter airborne particles?",
  choices: [
    "N95 respirator",
    "Simple surgical cap",
    "Examination gloves",
    "Safety goggles alone",
  ],
  answerIndex: 0,
  explanation:
    "An N95 respirator is designed to filter airborne particles and, when properly fitted, provides respiratory protection. Appropriate respiratory protection depends on the hazard and applicable infection-control procedures.",
},

// ----------------------------------------------------------------------------
// Refusal
// ----------------------------------------------------------------------------
{
  id: "ops-123",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A competent adult involved in a significant motor vehicle crash says she does not want to go to the hospital. What should the EMT do?",
  choices: [
    "Immediately force the patient into the ambulance",
    "Explain the potential risks of refusing evaluation and transport",
    "Tell the patient that refusal is impossible after a crash",
    "Allow the patient to leave without documenting the encounter",
  ],
  answerIndex: 1,
  explanation:
    "A patient with decision-making capacity may have the right to refuse care. The EMT should explain the potential consequences of refusal, ensure the patient understands them, follow local refusal procedures, and document the encounter appropriately.",
},

{
  id: "ops-124",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which action is most appropriate when a competent patient refuses EMS transport?",
  choices: [
    "Explain the risks and benefits, confirm understanding, and follow refusal procedures",
    "Threaten the patient with arrest",
    "Leave without documenting the refusal",
    "Automatically obtain consent from a family member instead",
  ],
  answerIndex: 0,
  explanation:
    "A competent patient should be informed of the potential consequences of refusing care or transport. The EMT should follow applicable refusal and documentation procedures and seek medical direction when required.",
},

// ----------------------------------------------------------------------------
// Triage Officer
// ----------------------------------------------------------------------------
{
  id: "ops-125",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "When selecting an EMT to serve as a triage officer at a mass-casualty incident, which characteristic is most important?",
  choices: [
    "Clinical knowledge and ability to make rapid decisions",
    "Being the youngest provider",
    "Having arrived last",
    "Being the person with the newest equipment",
  ],
  answerIndex: 0,
  explanation:
    "Triage requires rapid assessment, prioritization, and understanding of patient needs in relation to available resources. The most appropriate qualified person should be assigned according to the incident command structure.",
},

{
  id: "ops-126",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Why is clinical judgment important for an MCI triage officer?",
  choices: [
    "The officer must rapidly prioritize patients when resources are limited",
    "The officer personally treats every patient",
    "The officer determines which hospital receives all patients",
    "The officer replaces the incident commander",
  ],
  answerIndex: 0,
  explanation:
    "MCI triage requires rapid prioritization of patients according to severity, survivability, and available resources. The triage officer does not replace other incident command roles.",
},

// ----------------------------------------------------------------------------
// START Triage
// ----------------------------------------------------------------------------
{
  id: "ops-127",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Using the traditional START triage algorithm for an adult patient, you encounter a responsive patient with a respiratory rate of 26/min. What should you assess next?",
  choices: [
    "Radial pulse and peripheral perfusion",
    "Blood glucose",
    "Detailed medical history",
    "Pupil size",
  ],
  answerIndex: 0,
  explanation:
    "In the traditional START algorithm, an adult respiratory rate within the specified range leads to assessment of perfusion, traditionally by checking the radial pulse or capillary refill depending on the version taught. If perfusion is inadequate, the patient receives a higher triage priority.",
},

{
  id: "ops-128",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "In traditional START triage, an adult patient who is breathing but has a respiratory rate above the algorithm's threshold should generally be:",
  choices: [
    "Immediately assigned an immediate/high-priority category",
    "Assigned a delayed category",
    "Left untagged until a full secondary assessment",
    "Given a detailed medical history before triage",
  ],
  answerIndex: 0,
  explanation:
    "Traditional START uses respiratory rate as an early triage discriminator. Markedly abnormal respiratory rates place the patient in the immediate category under the traditional algorithm. Local systems may use modified triage methods.",
},

// ----------------------------------------------------------------------------
// MCI Treatment Priority
// ----------------------------------------------------------------------------
{
  id: "ops-129",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "At an MCI, which patient would generally receive the highest priority for immediate treatment under a system designed to maximize survivable outcomes?",
  choices: [
    "A patient with a correctable airway obstruction and signs of inadequate breathing",
    "A patient with injuries clearly incompatible with survival",
    "A patient who is walking and following commands",
    "A patient with a minor isolated abrasion",
  ],
  answerIndex: 0,
  explanation:
    "MCI triage is intended to prioritize patients who can benefit from limited resources. A potentially correctable life threat such as airway obstruction may receive a higher priority than patients with minor injuries or injuries incompatible with survival.",
},

{
  id: "ops-130",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What is the central goal of mass-casualty triage?",
  choices: [
    "Provide the greatest benefit for the greatest number of patients",
    "Treat the loudest patient first",
    "Provide the most advanced treatment to one patient",
    "Transport patients strictly in order of arrival",
  ],
  answerIndex: 0,
  explanation:
    "MCI triage is designed to use limited resources in a way that maximizes overall survival and patient benefit. This differs from routine single-patient care, where the most critically ill patient normally receives immediate attention.",
},

// ----------------------------------------------------------------------------
// Decontamination
// ----------------------------------------------------------------------------
{
  id: "ops-131",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "What term describes the process of removing or neutralizing hazardous contamination from patients, equipment, or personnel?",
  choices: [
    "Decontamination",
    "Documentation",
    "Sterilization",
    "Triage",
  ],
  answerIndex: 0,
  explanation:
    "Decontamination is the process of removing or neutralizing hazardous substances so that contamination does not continue to pose a threat. It is distinct from routine cleaning and sterilization.",
},

{
  id: "ops-132",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which action is an example of decontamination after a hazardous-materials exposure?",
  choices: [
    "Removing contaminated clothing and appropriately washing exposed skin",
    "Taking a patient's medical history",
    "Performing a secondary assessment before addressing contamination",
    "Transporting contaminated equipment into the ambulance",
  ],
  answerIndex: 0,
  explanation:
    "Removing contaminated clothing and appropriately decontaminating exposed skin can reduce continued exposure. Specific procedures depend on the substance, incident plan, and direction from hazardous-materials personnel.",
},

// ----------------------------------------------------------------------------
// Escort Vehicles
// ----------------------------------------------------------------------------
{
  id: "ops-133",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Why can following an escort vehicle during an emergency response create additional risk?",
  choices: [
    "Other motorists may respond to the escort but fail to recognize the ambulance following it",
    "The escort vehicle always travels slower than the ambulance",
    "Escort vehicles prevent the ambulance from using warning devices",
    "An escort vehicle eliminates the need for due regard",
  ],
  answerIndex: 0,
  explanation:
    "Other motorists may yield to the first vehicle but then unexpectedly enter the path of the ambulance behind it. This can create an intersection or 'wake' collision hazard.",
},

{
  id: "ops-134",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "If an escort vehicle is used because the ambulance crew is unfamiliar with a remote location, how should the ambulance operator drive?",
  choices: [
    "Follow as closely as possible",
    "Maintain an appropriate safety distance",
    "Drive beside the escort",
    "Pass the escort whenever traffic is present",
  ],
  answerIndex: 1,
  explanation:
    "If an escort is necessary, the ambulance should maintain a safe following distance rather than closely following the escort. The exact distance should follow local policy and roadway conditions.",
},

// ----------------------------------------------------------------------------
// DNAR / DNR
// ----------------------------------------------------------------------------
{
  id: "ops-135",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient has a valid out-of-hospital do-not-attempt-resuscitation order. Which statement is most accurate?",
  choices: [
    "The order generally directs EMS not to initiate specified resuscitative measures while still allowing appropriate supportive care",
    "The patient must receive no medical treatment at all",
    "The order automatically requires transport to the hospital",
    "The order allows EMS to ignore all other patient needs",
  ],
  answerIndex: 0,
  explanation:
    "A valid out-of-hospital DNAR/DNR order generally addresses resuscitation and does not necessarily mean 'do not treat.' EMS should continue appropriate supportive and comfort-focused care according to the order, local law, and protocol.",
},

{
  id: "ops-136",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An EMS crew encounters a document that appears to be a DNAR order, but its validity cannot be established. What should the crew do?",
  choices: [
    "Follow local protocol and contact medical control when necessary to determine how to proceed",
    "Automatically ignore every DNAR document",
    "Immediately stop all care regardless of the document's validity",
    "Ask a bystander to decide whether the order is valid",
  ],
  answerIndex: 0,
  explanation:
    "The legal recognition of out-of-hospital DNAR/DNR orders varies by jurisdiction and document type. If validity is uncertain, EMS should follow local protocol and obtain medical direction when required rather than making an unsupported assumption.",
},

// ----------------------------------------------------------------------------
// Highway Emergency Driving
// ----------------------------------------------------------------------------
{
  id: "ops-137",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "When responding on a multilane highway, which lane may provide the safest path for an emergency vehicle when traffic conditions and local policy allow?",
  choices: [
    "The far-left lane",
    "The shoulder at all times",
    "The far-right lane regardless of traffic",
    "The lane occupied by the slowest vehicle",
  ],
  answerIndex: 0,
  explanation:
    "On multilane highways, the far-left lane may provide an emergency vehicle with a predictable path while other traffic yields to the right. The operator must still account for actual traffic conditions and local law.",
},

{
  id: "ops-138",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Why should an ambulance operator avoid passing a vehicle on the right whenever possible during an emergency response?",
  choices: [
    "The driver of the other vehicle may not see the ambulance approaching from that side",
    "Ambulances are never permitted to change lanes",
    "The right side of an ambulance cannot contain warning lights",
    "The ambulance cannot accelerate in the right lane",
  ],
  answerIndex: 0,
  explanation:
    "Passing on the right can place the ambulance in a motorist's blind spot or outside the driver's expected field of view. The operator should wait until the other driver clearly recognizes and yields to the ambulance.",
},

// ----------------------------------------------------------------------------
// Triage Focus
// ----------------------------------------------------------------------------
{
  id: "ops-139",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Why should an EMT performing initial MCI triage avoid spending several minutes treating one critically injured patient?",
  choices: [
    "Other patients may have rapidly correctable life threats that would otherwise go unnoticed",
    "Critical patients are never treated at an MCI",
    "Treatment is prohibited until every patient has left the scene",
    "The triage officer must personally transport every patient",
  ],
  answerIndex: 0,
  explanation:
    "The purpose of initial triage is to rapidly identify and prioritize patients. Spending too much time on one patient can delay recognition of treatable problems in other patients.",
},

{
  id: "ops-140",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which action best demonstrates appropriate MCI triage behavior?",
  choices: [
    "Rapidly assess multiple patients before committing extensive resources to one patient",
    "Provide a complete secondary assessment to the first patient encountered",
    "Treat every patient in the order they are found",
    "Remain with the first critical patient until transport arrives",
  ],
  answerIndex: 0,
  explanation:
    "Initial MCI triage requires rapid assessment of multiple patients so limited resources can be allocated appropriately. Detailed treatment and secondary assessment occur after the initial prioritization process.",
},

// ----------------------------------------------------------------------------
// Communicating With Parents
// ----------------------------------------------------------------------------
{
  id: "ops-141",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "When treating an injured child, which communication approach is most appropriate when speaking with the child's parents?",
  choices: [
    "Keep them informed about what you are doing and explain information in understandable language",
    "Use medical terminology whenever possible",
    "Avoid telling them what is happening",
    "Discuss the child's condition only after arriving at the hospital",
  ],
  answerIndex: 0,
  explanation:
    "Parents or guardians should generally be kept informed about the child's care. Using clear, understandable language promotes communication and helps them participate appropriately in decisions.",
},

{
  id: "ops-142",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which statement is most appropriate when explaining an EMS procedure to a patient's family?",
  choices: [
    "Use clear language and explain what you are doing and why",
    "Use as much technical terminology as possible",
    "Avoid answering reasonable questions",
    "Tell the family that they are not allowed to know what treatment is being provided",
  ],
  answerIndex: 0,
  explanation:
    "Clear communication helps patients and families understand the care being provided. EMS providers should avoid unnecessary jargon and communicate respectfully.",
},

// ----------------------------------------------------------------------------
// Scene Safety: Suspicious Vehicle
// ----------------------------------------------------------------------------
{
  id: "ops-143",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "You arrive at a dark roadside scene where a person is slumped over the steering wheel. Law enforcement arrives simultaneously. What is the safest initial approach?",
  choices: [
    "Coordinate with law enforcement and wait for the scene to be declared safe before approaching",
    "Immediately approach the vehicle alone",
    "Stand directly behind the vehicle",
    "Open the driver's door without assessing the scene",
  ],
  answerIndex: 0,
  explanation:
    "Scene safety takes priority over patient access. When law enforcement is present at a potentially unsafe or suspicious scene, EMS should coordinate with officers and wait for the scene to be secured before approaching.",
},

{
  id: "ops-144",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which finding should make an EMS crew especially cautious before approaching a vehicle at night?",
  choices: [
    "Law enforcement has not yet secured a potentially suspicious scene",
    "The vehicle has its headlights turned on",
    "The road is well lit",
    "The ambulance has arrived with warning lights activated",
  ],
  answerIndex: 0,
  explanation:
    "A potentially suspicious scene may present a threat to EMS personnel. The crew should use available safety resources, including law enforcement, before approaching.",
},

// ----------------------------------------------------------------------------
// DNAR Ambiguity
// ----------------------------------------------------------------------------
{
  id: "ops-145",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An unresponsive cardiac-arrest patient has an unsigned note stating that the patient does not want resuscitation. What is the best EMS action?",
  choices: [
    "Immediately stop resuscitation because the note exists",
    "Follow applicable protocol and obtain medical direction regarding the questionable document",
    "Ask a neighbor whether the note is legitimate",
    "Destroy the note because it has no value",
  ],
  answerIndex: 1,
  explanation:
    "An unsigned or otherwise questionable document may not meet the legal requirements for an out-of-hospital DNAR/DNR order. EMS should follow local protocol and seek medical direction when validity is uncertain rather than independently deciding to withhold resuscitation.",
},

// ----------------------------------------------------------------------------
// Blood Exposure
// ----------------------------------------------------------------------------
{
  id: "ops-146",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Blood from a trauma patient splashes into an EMT's eye. What term best describes what has occurred?",
  choices: [
    "Exposure",
    "Abandonment",
    "Negligence",
    "Triage",
  ],
  answerIndex: 0,
  explanation:
    "Direct contact of potentially infectious blood with the eyes is an occupational exposure. Exposure does not necessarily mean that infection occurred.",
},

{
  id: "ops-147",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which situation represents an occupational exposure to potentially infectious material?",
  choices: [
    "Blood entering an EMT's eye",
    "A patient refusing transport",
    "An ambulance running out of fuel",
    "A patient requesting a different hospital",
  ],
  answerIndex: 0,
  explanation:
    "Blood contacting the mucous membranes of the eye is an example of occupational exposure. Appropriate exposure-control and reporting procedures should be followed after such an incident.",
},

// ----------------------------------------------------------------------------
// Battery
// ----------------------------------------------------------------------------
{
  id: "ops-148",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An EMT takes a patient's blood pressure after the responsive patient clearly refuses assessment. Which legal concept could apply?",
  choices: [
    "Battery",
    "Abandonment",
    "Scope of practice",
    "Duty to act",
  ],
  answerIndex: 0,
  explanation:
    "Battery generally involves intentional physical contact without consent. EMS providers should obtain appropriate consent before performing assessments or treatments on responsive patients who have decision-making capacity. Exact legal definitions vary by jurisdiction.",
},

{
  id: "ops-149",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which situation is most consistent with assault rather than battery?",
  choices: [
    "Threatening a patient with unwanted physical harm without actually touching the patient",
    "Taking a blood pressure without consent",
    "Leaving a patient after accepting responsibility for care",
    "Failing to follow an ambulance protocol",
  ],
  answerIndex: 0,
  explanation:
    "Assault generally involves creating a reasonable fear of imminent unwanted contact or harm, while battery involves the unwanted physical contact itself. Exact legal definitions vary by jurisdiction.",
},

// ----------------------------------------------------------------------------
// Informed Consent
// ----------------------------------------------------------------------------
{
  id: "ops-150",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which situation best demonstrates informed consent?",
  choices: [
    "The EMT explains the proposed treatment and its significant risks and benefits before the patient agrees",
    "The EMT assumes an unconscious patient would want treatment",
    "The EMT asks only whether the patient wants help",
    "The EMT treats the patient after a family member gives permission despite a competent patient's refusal",
  ],
  answerIndex: 0,
  explanation:
    "Informed consent requires that a patient with decision-making capacity receive enough relevant information about the proposed care, including important risks and benefits, to make a meaningful decision.",
},

{
  id: "ops-151",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An EMT explains the major risks and benefits of a proposed treatment before asking the patient whether to proceed. What type of consent is being sought?",
  choices: [
    "Informed consent",
    "Implied consent",
    "Involuntary consent",
    "Administrative consent",
  ],
  answerIndex: 0,
  explanation:
    "Informed consent involves providing relevant information about the proposed care, including important risks and benefits, so a capable patient can make an informed decision.",
},

// ----------------------------------------------------------------------------
// Types of Error
// ----------------------------------------------------------------------------
{
  id: "ops-152",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT gives a medication that is inappropriate for the patient's condition because the EMT does not understand an important contraindication. What type of error is this most consistent with?",
  choices: [
    "Knowledge-based failure",
    "Rules-based failure",
    "Skills-based failure",
    "Mechanical failure",
  ],
  answerIndex: 0,
  explanation:
    "A knowledge-based failure occurs when an error results from inadequate understanding or knowledge. A rules-based failure involves incorrectly following or applying a rule, while a skills-based failure involves incorrect performance of a learned skill.",
},

{
  id: "ops-153",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT knows that a particular intervention is not authorized by the applicable protocol but performs it anyway. Which type of failure does this best represent?",
  choices: [
    "Rules-based failure",
    "Knowledge-based failure",
    "Skills-based failure",
    "Communication failure only",
  ],
  answerIndex: 0,
  explanation:
    "Knowingly performing an intervention that is not permitted by the applicable rules or protocol is an example of a rules-based failure. Knowledge-based failures involve insufficient understanding, while skills-based failures involve improper execution of a skill.",
},

// ----------------------------------------------------------------------------
// Pediatric Implied Consent
// ----------------------------------------------------------------------------
{
  id: "ops-154",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A critically injured child requires immediate transport, but a parent or legal guardian cannot be reached. What principle generally permits emergency treatment?",
  choices: [
    "Implied consent",
    "Abandonment",
    "Confidentiality",
    "Refusal",
  ],
  answerIndex: 0,
  explanation:
    "In an emergency involving a minor, when a parent or legal guardian is unavailable, EMS may generally provide necessary emergency care under implied consent, subject to applicable law and protocol.",
},

{
  id: "ops-155",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A severely injured child needs immediate transport, but the child's parent is not yet at the scene. Which action is most appropriate?",
  choices: [
    "Delay care until the parent arrives",
    "Provide necessary emergency care and transport while attempting to notify the parent",
    "Ask another child to provide consent",
    "Refuse treatment until a written authorization arrives",
  ],
  answerIndex: 1,
  explanation:
    "Emergency care for a critically ill or injured child should not ordinarily be delayed solely because a parent or guardian is unavailable. Implied consent generally permits necessary emergency treatment while efforts are made to notify the parent.",
},

// ----------------------------------------------------------------------------
// Hazmat Zones
// ----------------------------------------------------------------------------
{
  id: "ops-156",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "In the traditional three-zone model of a hazardous-materials incident, where is routine EMS medical treatment generally performed after appropriate decontamination?",
  choices: [
    "Cold zone",
    "Hot zone",
    "Release point",
    "Contamination source",
  ],
  answerIndex: 0,
  explanation:
    "The cold zone is the controlled area where command, staging, and medical support are generally located after appropriate decontamination. The hot zone is the area of highest contamination risk, while the warm zone is commonly used for decontamination.",
},

{
  id: "ops-157",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which zone of a traditional hazardous-materials scene contains the highest contamination hazard?",
  choices: [
    "Hot zone",
    "Cold zone",
    "Treatment zone",
    "Staging zone",
  ],
  answerIndex: 0,
  explanation:
    "The hot zone surrounds the hazardous release and presents the greatest contamination risk. EMS personnel should not enter it unless appropriately trained, equipped, and assigned to do so.",
},

// ----------------------------------------------------------------------------
// Terrorist / Large-Scale Incident
// ----------------------------------------------------------------------------
{
  id: "ops-158",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "During a large-scale intentional mass-casualty incident, EMS personnel should primarily:",
  choices: [
    "Use organized triage and allocate care according to available resources",
    "Search for the person responsible for the incident",
    "Treat only the most severely injured patient",
    "Ignore patients classified as delayed",
  ],
  answerIndex: 0,
  explanation:
    "Large-scale intentional incidents still require organized triage and resource management. EMS providers should focus on patient care and scene safety rather than investigating who caused the incident.",
},

{
  id: "ops-159",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What principle becomes especially important when EMS resources are overwhelmed during a large-scale incident?",
  choices: [
    "Match treatment priorities to available resources",
    "Treat every patient as though unlimited resources are available",
    "Ignore the incident command structure",
    "Transport patients without triage",
  ],
  answerIndex: 0,
  explanation:
    "When resources are limited, treatment and transport priorities must be based on triage and available resources. The goal is to maximize overall patient benefit.",
},

// ----------------------------------------------------------------------------
// Emergency Move
// ----------------------------------------------------------------------------
{
  id: "ops-160",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which situation most clearly requires an emergency move from a vehicle?",
  choices: [
    "The vehicle is leaking fuel and a fire has started",
    "The patient has a stable isolated arm injury",
    "The patient reports mild back pain",
    "The patient is anxious but otherwise stable",
  ],
  answerIndex: 0,
  explanation:
    "An emergency move is indicated when an immediate danger threatens the patient or rescuers, such as fire or another rapidly worsening hazard. Patient movement should otherwise be coordinated with appropriate assessment and extrication procedures.",
},

{
  id: "ops-161",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which finding alone would NOT normally justify an immediate emergency move from a vehicle?",
  choices: [
    "A rapidly spreading fire",
    "A leaking fuel tank with ignition nearby",
    "A dangerous electrical hazard involving the vehicle",
    "A stable patient with no immediate external threat",
  ],
  answerIndex: 3,
  explanation:
    "An emergency move is reserved for situations in which remaining in place creates an immediate danger. A stable patient without an immediate scene threat should not automatically be subjected to an emergency move.",
},

// ----------------------------------------------------------------------------
// Rapid Extrication
// ----------------------------------------------------------------------------
{
  id: "ops-162",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which description best matches the traditional rapid extrication technique?",
  choices: [
    "Manually stabilize the head, apply appropriate spinal protection, and rapidly remove the patient when indicated",
    "Drag the patient by the clothing without attempting to protect the spine",
    "Leave the patient in the vehicle until every secondary assessment is complete",
    "Use a stair chair while the patient remains seated in the vehicle",
  ],
  answerIndex: 0,
  explanation:
    "Rapid extrication is used when a patient must be removed quickly because of serious clinical needs or scene conditions. Spinal protection should be maintained as much as circumstances permit while avoiding unnecessary delay.",
},

{
  id: "ops-163",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which situation would favor rapid extrication rather than a slower, more controlled extrication process?",
  choices: [
    "The patient has an immediate life threat requiring rapid removal for treatment",
    "The patient is stable and the vehicle is completely safe",
    "The crew has unlimited time and resources",
    "The patient has a minor isolated abrasion",
  ],
  answerIndex: 0,
  explanation:
    "Rapid extrication is considered when the patient's condition or the scene creates a need for rapid removal. Stable patients in safe environments may allow a more controlled extrication.",
},

// ----------------------------------------------------------------------------
// Critical Trauma and Organ Donation
// ----------------------------------------------------------------------------
{
  id: "ops-164",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A critically injured trauma patient has catastrophic injuries but still has signs of circulation and breathing. What should the EMT do regarding possible organ donation?",
  choices: [
    "Provide appropriate aggressive lifesaving care and transport",
    "Withhold care because the patient may become an organ donor",
    "Ask the family to remove the patient from care",
    "Stop treatment and wait for an organ procurement organization",
  ],
  answerIndex: 0,
  explanation:
    "Potential organ donation does not change the EMT's responsibility to provide appropriate lifesaving care. Decisions about organ donation occur through the appropriate medical and legal processes after the patient's condition and prognosis are established.",
},

{
  id: "ops-165",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which statement about EMS care of a patient who may eventually become an organ donor is correct?",
  choices: [
    "The patient should receive the same appropriate lifesaving care as any other critically ill patient",
    "EMS should intentionally limit treatment",
    "EMS should determine which organs will be donated",
    "The EMT should delay transport until donation arrangements are made",
  ],
  answerIndex: 0,
  explanation:
    "EMS providers should focus on appropriate patient care and stabilization. Organ donation decisions are handled through appropriate medical and legal processes and should never cause EMS to withhold indicated treatment.",
},

// ----------------------------------------------------------------------------
// Scope of Practice
// ----------------------------------------------------------------------------
{
  id: "ops-166",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What term describes the legally and professionally defined range of procedures and responsibilities an EMT is authorized to perform?",
  choices: [
    "Scope of practice",
    "Duty to act",
    "Confidentiality",
    "Medical consent",
  ],
  answerIndex: 0,
  explanation:
    "Scope of practice describes the procedures, responsibilities, and activities an EMS provider is legally authorized and professionally qualified to perform. It is distinct from duty to act and confidentiality.",
},

{
  id: "ops-167",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT is asked to perform a procedure that is outside the EMT's authorized level of practice. Which concept determines whether the EMT is permitted to perform it?",
  choices: [
    "Scope of practice",
    "Cushion of safety",
    "Informed refusal",
    "Triage category",
  ],
  answerIndex: 0,
  explanation:
    "The EMT's scope of practice establishes the procedures and responsibilities the provider is authorized to perform. An EMT should not perform procedures outside that scope merely because someone requests them.",
},

// ----------------------------------------------------------------------------
// Due Regard
// ----------------------------------------------------------------------------
{
  id: "ops-168",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which characteristic best describes a safe emergency vehicle operator?",
  choices: [
    "Drives with due regard for other road users",
    "Always drives at the maximum possible speed",
    "Assumes motorists will hear the siren",
    "Uses lights and siren on every response",
  ],
  answerIndex: 0,
  explanation:
    "A safe emergency vehicle operator drives with due regard for the safety of other motorists, pedestrians, passengers, and property. Emergency warning devices do not eliminate the need for defensive driving.",
},

{
  id: "ops-169",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which behavior demonstrates poor emergency vehicle operating judgment?",
  choices: [
    "Slowing before entering an intersection",
    "Maintaining a safe following distance",
    "Assuming a motorist will yield because the siren is activated",
    "Watching for vehicles in blind spots",
  ],
  answerIndex: 2,
  explanation:
    "An ambulance operator should never assume that other drivers will see or hear the ambulance or respond correctly. Defensive driving requires anticipating that motorists may make unexpected moves.",
},

// ----------------------------------------------------------------------------
// Nighttime Crash Scene
// ----------------------------------------------------------------------------
{
  id: "ops-170",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Your ambulance is parked facing traffic at a nighttime crash scene. Which lighting practice helps maintain visibility without unnecessarily blinding approaching drivers?",
  choices: [
    "Use emergency warning lights while avoiding unnecessary high-intensity headlights toward traffic",
    "Turn every light on high beam",
    "Turn all warning lights off",
    "Use road flares next to vehicles containing leaking fuel",
  ],
  answerIndex: 0,
  explanation:
    "Emergency scenes must remain visible to approaching traffic, but bright headlights aimed directly at drivers can impair their vision. Appropriate scene lighting should follow agency policy and roadway safety practices.",
},

{
  id: "ops-171",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Why should road flares generally be avoided around a vehicle crash when leaking fuel may be present?",
  choices: [
    "They can provide an ignition source for flammable liquids or vapors",
    "They make the ambulance difficult to locate",
    "They prevent the use of emergency lights",
    "They interfere with radio communication",
  ],
  answerIndex: 0,
  explanation:
    "Flares produce an open flame and can ignite gasoline or other flammable substances. Safer traffic-control devices should be used when appropriate.",
},

// ----------------------------------------------------------------------------
// Patient Movement From Stairs
// ----------------------------------------------------------------------------
{
  id: "ops-172",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An injured patient must be moved down a flight of stairs. Which device may be appropriate when the patient can be safely secured and the device is designed for the situation?",
  choices: [
    "A stair chair",
    "An oxygen regulator",
    "A suction catheter",
    "An AED",
  ],
  answerIndex: 0,
  explanation:
    "A stair chair is specifically designed to help move patients on stairs. The appropriate device depends on the patient's condition, injury, ability to sit, stair configuration, and local protocols.",
},

{
  id: "ops-173",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which factor would make a stair chair less appropriate for moving a patient?",
  choices: [
    "The patient cannot safely tolerate a seated position",
    "The patient is able to sit upright",
    "The stairway is accessible to the device",
    "The patient can be adequately secured",
  ],
  answerIndex: 0,
  explanation:
    "A stair chair requires the patient to tolerate and be secured in a seated position. Patients who cannot safely remain seated may require another movement method based on their condition and available equipment.",
},

// ----------------------------------------------------------------------------
// Radio Reports
// ----------------------------------------------------------------------------
{
  id: "ops-174",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which characteristic should an EMT's radio report to the receiving facility have?",
  choices: [
    "Brief, organized, and factual",
    "Long and speculative",
    "Limited to the patient's name",
    "Focused on unrelated personal information",
  ],
  answerIndex: 0,
  explanation:
    "A useful radio report communicates relevant patient information efficiently and factually. It should generally include the patient's age and sex, chief complaint, important assessment findings, vital signs, treatment, and response.",
},

{
  id: "ops-175",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which information would generally be most appropriate to include in a prehospital radio report?",
  choices: [
    "Chief complaint, important findings, vital signs, treatment, and response",
    "The EMT's personal opinion about the patient's personality",
    "The patient's unrelated financial information",
    "A detailed history unrelated to the current emergency",
  ],
  answerIndex: 0,
  explanation:
    "Radio reports should focus on clinically relevant information needed by the receiving facility to prepare for the patient's arrival. Unnecessary personal or unrelated information should be omitted.",
},

// ----------------------------------------------------------------------------
// Patient Transfer Equipment Variation
// ----------------------------------------------------------------------------
{
  id: "ops-176",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which piece of equipment is primarily intended for patient movement rather than assessment or treatment?",
  choices: [
    "Wheeled ambulance stretcher",
    "Pulse oximeter",
    "Blood pressure cuff",
    "Bag-valve mask",
  ],
  answerIndex: 0,
  explanation:
    "A wheeled ambulance stretcher is designed primarily to move and transport patients. The other devices are used for assessment or treatment.",
},

// ----------------------------------------------------------------------------
// Cleaning, Disinfection, Sterilization
// ----------------------------------------------------------------------------
{
  id: "ops-177",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "What is the first general process used to remove visible dirt, blood, or other contamination from a surface?",
  choices: [
    "Cleaning",
    "Sterilization",
    "Triage",
    "Decontamination of a hazmat victim",
  ],
  answerIndex: 0,
  explanation:
    "Cleaning removes visible dirt, blood, and other contaminants from a surface. Disinfection or sterilization may follow when indicated by the type of equipment and infection-control requirements.",
},

{
  id: "ops-178",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which process is intended to destroy or eliminate all forms of microbial life on an appropriately processed item?",
  choices: [
    "Sterilization",
    "Routine cleaning",
    "Triage",
    "Patient assessment",
  ],
  answerIndex: 0,
  explanation:
    "Sterilization is a process intended to eliminate all forms of microbial life on an appropriately processed item. It is different from routine cleaning and disinfection.",
},

// ----------------------------------------------------------------------------
// Ambulance Terminology
// ----------------------------------------------------------------------------
{
  id: "ops-179",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What term describes a specialized vehicle designed to provide emergency medical care and transport patients?",
  choices: [
    "Ambulance",
    "Spotter",
    "Jump kit",
    "First-responder vehicle",
  ],
  answerIndex: 0,
  explanation:
    "An ambulance is a specialized vehicle equipped and staffed to provide prehospital care and transport patients when indicated.",
},

{
  id: "ops-180",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What is the term for a person who assists an ambulance driver by watching for hazards and blind spots while the vehicle is backing?",
  choices: [
    "Spotter",
    "Triage officer",
    "Treatment officer",
    "Dispatcher",
  ],
  answerIndex: 0,
  explanation:
    "A spotter assists the driver during backing operations by observing areas the driver cannot see and communicating hazards.",
},

// ----------------------------------------------------------------------------
// Blind Spots
// ----------------------------------------------------------------------------
{
  id: "ops-181",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "What are areas around an ambulance that cannot be directly seen by the driver or through the vehicle's mirrors called?",
  choices: [
    "Blind spots",
    "Cushions of safety",
    "Landing zones",
    "Warm zones",
  ],
  answerIndex: 0,
  explanation:
    "Blind spots are areas that cannot be directly observed by the driver or adequately seen through the vehicle's mirrors. Drivers should check carefully and use a spotter when appropriate.",
},

// ----------------------------------------------------------------------------
// Medical Evacuation
// ----------------------------------------------------------------------------
{
  id: "ops-182",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What term describes the evacuation or transport of a patient by helicopter or another medical aircraft?",
  choices: [
    "Medevac",
    "Decontamination",
    "Disinfection",
    "Extrication",
  ],
  answerIndex: 0,
  explanation:
    "Medevac refers to medical evacuation or transport, commonly involving rotary-wing or fixed-wing aircraft when appropriate.",
},

// ----------------------------------------------------------------------------
// CPR Board
// ----------------------------------------------------------------------------
{
  id: "ops-183",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What is the purpose of a CPR board when one is used?",
  choices: [
    "To provide a firm surface beneath a patient during chest compressions",
    "To transport patients down stairs",
    "To measure blood pressure",
    "To protect an EMT from hazardous chemicals",
  ],
  answerIndex: 0,
  explanation:
    "A CPR board can provide a firm surface beneath the patient's torso during resuscitation when appropriate. It is not primarily a patient transport or hazardous-materials device.",
},

// ----------------------------------------------------------------------------
// Air Ambulances
// ----------------------------------------------------------------------------
{
  id: "ops-184",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What term describes aircraft specially equipped to transport patients who require medical evacuation?",
  choices: [
    "Air ambulances",
    "First-responder vehicles",
    "Stair chairs",
    "Rescue baskets",
  ],
  answerIndex: 0,
  explanation:
    "Air ambulances are aircraft configured and staffed for medical transport. They may be fixed-wing or rotary-wing depending on the mission.",
},

// ----------------------------------------------------------------------------
// First-Responder Vehicles
// ----------------------------------------------------------------------------
{
  id: "ops-185",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which vehicle is specifically designed to bring EMS personnel and equipment to the scene without necessarily serving as the primary patient transport vehicle?",
  choices: [
    "First-responder vehicle",
    "Ambulance stretcher",
    "Stokes basket",
    "Air ambulance",
  ],
  answerIndex: 0,
  explanation:
    "First-responder vehicles transport EMS personnel and equipment to emergency scenes. Patient transport may be performed by a separate ambulance.",
},

// ----------------------------------------------------------------------------
// Jump Kit Definition
// ----------------------------------------------------------------------------
{
  id: "ops-186",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Which description best matches a jump kit?",
  choices: [
    "A portable collection of essential equipment used for initial patient care",
    "A device used exclusively for stair movement",
    "A container used only for contaminated clothing",
    "A radio used to communicate with dispatch",
  ],
  answerIndex: 0,
  explanation:
    "A jump kit is a portable collection of essential equipment that allows EMS personnel to begin patient assessment and treatment without carrying the entire ambulance's equipment to the patient.",
},

// ----------------------------------------------------------------------------
// Hydroplaning Definition
// ----------------------------------------------------------------------------
{
  id: "ops-187",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "What is hydroplaning?",
  choices: [
    "Loss of tire contact with the roadway because of water between the tires and road",
    "A failure of the ambulance's electrical system",
    "A loss of radio communication",
    "A sudden change in engine temperature",
  ],
  answerIndex: 0,
  explanation:
    "Hydroplaning occurs when water builds beneath the tires and reduces their contact with the roadway. This can cause substantial loss of steering and braking control.",
},

// ----------------------------------------------------------------------------
// Decontamination Definition
// ----------------------------------------------------------------------------
{
  id: "ops-188",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "What process is specifically intended to remove or neutralize hazardous contamination from a patient or piece of equipment?",
  choices: [
    "Decontamination",
    "Documentation",
    "Triage",
    "Dispatch",
  ],
  answerIndex: 0,
  explanation:
    "Decontamination removes or neutralizes hazardous substances so that contaminated patients, personnel, or equipment no longer pose the same exposure risk.",
},

// ----------------------------------------------------------------------------
// Final Safety Variation
// ----------------------------------------------------------------------------
{
  id: "ops-189",
  domain: "Operations",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Which principle should guide an EMT whenever there is a conflict between reaching a patient quickly and entering an unsafe scene?",
  choices: [
    "Do not enter an unsafe environment until appropriate safety measures are in place",
    "Enter immediately because patient care always overrides provider safety",
    "Send the least experienced EMT into the hazard",
    "Ignore the hazard if the patient appears critically ill",
  ],
  answerIndex: 0,
  explanation:
    "EMS providers must protect themselves from preventable hazards. An injured or contaminated rescuer can no longer provide care and may create additional casualties. Appropriate scene safety measures should be established before entering a hazardous environment.",
},
// ----------------------------------------------------------------------------
// ORIGINAL QUESTIONS + VARIATIONS
// ----------------------------------------------------------------------------

// {
//   id: "ops-201",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "primaryAssessment",
//   question:
//     "During an MCI, which patient should receive the highest priority for immediate care?",
//   choices: [
//     "An unresponsive patient who is pulseless and apneic",
//     "A patient with an isolated femur fracture and a rapid pulse",
//     "A patient with partial-thickness burns but no airway or breathing problem",
//     "A patient with severe bleeding and an altered level of consciousness",
//   ],
//   answerIndex: 3,
//   explanation:
//     "A patient with altered mental status and signs of a potentially correctable airway, breathing, or circulation problem may be salvageable and should receive immediate priority. In an MCI, patients who are pulseless and apneic generally receive lower priority so resources can be directed toward patients with a greater likelihood of survival.",
// },

// {
//   id: "ops-202",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "primaryAssessment",
//   question:
//     "What is the primary purpose of prioritizing patients during mass-casualty triage?",
//   choices: [
//     "To provide definitive treatment to the most severely injured patient first",
//     "To transport every patient as quickly as possible",
//     "To use available resources where they can benefit the greatest number of people",
//     "To identify which patients are most likely to require surgery",
//   ],
//   answerIndex: 2,
//   explanation:
//     "MCI triage is designed to achieve the greatest good for the greatest number. Initial triage emphasizes rapid identification of patients who are most likely to benefit from immediate intervention rather than providing prolonged treatment to one patient.",
// },

// {
//   id: "ops-203",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "A portable oxygen cylinder is being carried into a residence for patient care. Which safety requirement applies to oxygen cylinders throughout the ambulance and during transport?",
//   choices: [
//     "The cylinder must contain at least 1,000 psi",
//     "The cylinder must have a flowmeter attached at all times",
//     "The cylinder must be secured so it cannot become a projectile",
//     "The cylinder must be stored beside an oxygen mask",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Oxygen cylinders must be secured against movement because an unsecured cylinder can cause serious injury if it becomes a projectile. Flowmeters and administration devices may not be attached to every spare cylinder, and minimum residual pressure requirements vary by agency policy.",
// },

// {
//   id: "ops-204",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "Which practice creates a significant safety hazard when storing portable oxygen cylinders in an ambulance?",
//   choices: [
//     "Securing the cylinders in fixed holders",
//     "Inspecting cylinders for damage during vehicle checks",
//     "Keeping spare cylinders secured in an approved compartment",
//     "Leaving a spare cylinder unsecured on the ambulance floor",
//   ],
//   answerIndex: 3,
//   explanation:
//     "An unsecured oxygen cylinder can move violently during sudden braking or a collision and can become a projectile. Cylinders should be restrained using the vehicle's approved securing system.",
// },

// {
//   id: "ops-205",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "treatmentTransport",
//   question:
//     "A 91-year-old patient is alert, understands the situation, and refuses transport despite her family's concerns. What should the EMT do first?",
//   choices: [
//     "Transport her because her family requested it",
//     "Determine her decision-making capacity and explain the risks of refusing care",
//     "Ask a family member to sign the refusal form for her",
//     "Transport her without consent because of her age",
//   ],
//   answerIndex: 1,
//   explanation:
//     "Age alone does not eliminate a patient's ability to make healthcare decisions. An adult with decision-making capacity may refuse care. The EMT should assess capacity, explain the potential consequences of refusal, and follow the applicable refusal and documentation procedures.",
// },

// {
//   id: "ops-206",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "treatmentTransport",
//   question:
//     "A competent adult refuses transport after the EMT explains the potential consequences. The patient's relatives demand that the EMT take the patient anyway. What is the appropriate response?",
//   choices: [
//     "Transport the patient because the relatives are responsible for the patient",
//     "Ask the relatives to sign a refusal instead",
//     "Respect the patient's decision and complete the appropriate refusal process",
//     "Allow the relatives to decide because the patient is elderly",
//   ],
//   answerIndex: 2,
//   explanation:
//     "A competent adult generally has the right to make decisions about their own care. Family members cannot normally override the wishes of a patient who has decision-making capacity. The EMT should document the assessment, risks explained, and refusal according to local protocol.",
// },

// {
//   id: "ops-207",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "An overturned tanker is leaking an unidentified substance. Where should the ambulance initially be positioned when feasible?",
//   choices: [
//     "Downhill and downwind from the tanker",
//     "As close to the tanker as possible for rapid patient access",
//     "Uphill and upwind from the suspected release",
//     "Inside the area where the liquid is accumulating",
//   ],
//   answerIndex: 2,
//   explanation:
//     "For a suspected hazardous-material release, responders should remain at a safe distance and, when feasible, position themselves uphill and upwind. Conditions can change, so responders must continue monitoring the scene and follow hazardous-material incident procedures.",
// },

// {
//   id: "ops-208",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "At a suspected hazardous-material incident, which location presents the greatest immediate concern for an ambulance crew?",
//   choices: [
//     "An area uphill and upwind of the release",
//     "A designated cold-zone staging area",
//     "A low-lying area downhill from the release",
//     "A protected area outside the hazard zone",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Hazardous substances can collect or flow into low areas, while airborne contaminants can travel downwind. Positioning downhill and downwind can expose responders to the substance and should be avoided.",
// },

// {
//   id: "ops-209",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "When should an EMT complete the patient care report for a critically ill patient?",
//   choices: [
//     "Instead of continuing patient care once the primary assessment is complete",
//     "As soon as all necessary patient care activities have been completed",
//     "Before any treatment is initiated",
//     "Only after the ambulance has been completely restocked",
//   ],
//   answerIndex: 1,
//   explanation:
//     "Patient care takes priority over documentation while the patient is critically ill. The EMT should complete the PCR as soon as practical after the necessary care has been provided, following agency procedures.",
// },

// {
//   id: "ops-210",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "An EMT is caring for a patient whose condition suddenly deteriorates. The PCR is only partially completed. What should the EMT do?",
//   choices: [
//     "Finish the PCR before beginning additional treatment",
//     "Ask the patient to wait while the report is completed",
//     "Prioritize patient care and return to the documentation when appropriate",
//     "Leave the ambulance to complete the report immediately",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Patient care takes precedence over documentation. If the patient's condition requires additional assessment or treatment, the EMT should address those needs and complete the PCR when patient care permits.",
// },

// {
//   id: "ops-211",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which situation is commonly subject to mandatory reporting requirements for EMS personnel, depending on state law?",
//   choices: [
//     "A routine adult medical complaint",
//     "A patient who declines transport for a minor injury",
//     "An animal bite with possible rabies exposure",
//     "A patient with a common headache",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Animal bites may trigger mandatory public-health reporting because of the risk of rabies and other communicable disease concerns. Exact reporting requirements vary by jurisdiction, so EMTs should follow applicable state and local rules.",
// },

// {
//   id: "ops-212",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which statement about mandatory EMS reporting requirements is most accurate?",
//   choices: [
//     "Every motor-vehicle crash must automatically be reported by the EMT to the state health department",
//     "All medication overdoses must automatically be reported regardless of circumstances",
//     "Reporting requirements vary by jurisdiction and may include suspected abuse, assault, or certain infectious exposures",
//     "Only injuries involving children are reportable",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Mandatory reporting laws differ among jurisdictions. EMTs should know the requirements that apply to their practice area, including rules involving abuse, assault, communicable diseases, and other specified circumstances.",
// },

// {
//   id: "ops-213",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "primaryAssessment",
//   question:
//     "What PPE provides appropriate minimum protection when suctioning an unresponsive patient's airway?",
//   choices: [
//     "Gloves and eye or face protection",
//     "Gloves only",
//     "A gown and shoe covers only",
//     "A head cover and gloves only",
//   ],
//   answerIndex: 0,
//   explanation:
//     "Airway procedures can expose the EMT to saliva, vomitus, respiratory secretions, and blood. Gloves and appropriate eye or face protection provide essential protection, with additional PPE selected according to the anticipated exposure.",
// },

// {
//   id: "ops-214",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "primaryAssessment",
//   question:
//     "During an airway procedure, which additional PPE would be most appropriate when substantial blood or body-fluid splashing is anticipated?",
//   choices: [
//     "Only a pair of gloves",
//     "Gloves plus appropriate gown and face or eye protection",
//     "Only a surgical cap",
//     "No additional PPE if the patient is unconscious",
//   ],
//   answerIndex: 1,
//   explanation:
//     "PPE should match the anticipated exposure. When substantial splashing of blood or body fluids is possible, protection for the hands, body, eyes, and face may be required.",
// },

// {
//   id: "ops-215",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "You remove clothing heavily contaminated with a patient's blood. How should the clothing generally be handled?",
//   choices: [
//     "Place it in an appropriate biohazard or regulated-medical-waste container according to agency policy",
//     "Place it loose in the ambulance trash compartment",
//     "Leave it beside the patient's residence",
//     "Put it in the clean linen compartment",
//   ],
//   answerIndex: 0,
//   explanation:
//     "Blood-contaminated materials should be handled and disposed of according to applicable biohazard and regulated-medical-waste procedures. They should not be mixed with ordinary trash or clean supplies.",
// },

// {
//   id: "ops-216",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which action would be inappropriate when disposing of clothing heavily contaminated with blood?",
//   choices: [
//     "Following the agency's regulated-medical-waste procedure",
//     "Using an appropriate biohazard container when required",
//     "Placing the contaminated clothing in the clean linen compartment",
//     "Using PPE while handling the material",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Blood-contaminated clothing should never be mixed with clean linens. It should be handled as contaminated material and disposed of according to applicable procedures.",
// },

// {
//   id: "ops-217",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "You arrive at a severely damaged passenger vehicle after a collision. Before attempting to enter the vehicle, what should you do?",
//   choices: [
//     "Break a window immediately to save time",
//     "Disconnect the battery before assessing the patient",
//     "Confirm that the scene and vehicle present no immediate hazards, then attempt the simplest safe access",
//     "Wait for heavy rescue equipment before touching the vehicle",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Scene safety comes first. Once hazards have been identified and controlled as much as possible, the EMT should attempt the simplest safe method of gaining access. Specialized extrication may be necessary if ordinary access is not possible.",
// },

// {
//   id: "ops-218",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "Which action should generally NOT be the EMT's first response when approaching a badly damaged vehicle?",
//   choices: [
//     "Perform a scene-size-up for hazards",
//     "Look for a simple safe access point",
//     "Immediately break a window without first considering scene hazards",
//     "Determine whether additional rescue resources are needed",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Breaking glass or entering a damaged vehicle without considering hazards can place both the patient and rescuers at risk. The EMT should first perform a scene-size-up and then use the safest reasonable access method.",
// },

// {
//   id: "ops-219",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "An EMT arrives at an MCI after the incident command system has been established and begins treating patients without receiving an assignment. What is the primary problem with this action?",
//   choices: [
//     "It may reduce the efficiency and coordination of the overall response",
//     "It guarantees that critical patients will receive care faster",
//     "It allows the EMT to bypass the staging area safely",
//     "It automatically gives the EMT authority over patient transport",
//   ],
//   answerIndex: 0,
//   explanation:
//     "Personnel who work outside the incident command structure can duplicate efforts, overlook patients, interfere with assigned resources, and create confusion. EMTs should report to the appropriate location and accept an assignment.",
// },

// {
//   id: "ops-220",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "What should an EMT do after arriving at an MCI where the incident command system is already operating?",
//   choices: [
//     "Treat whichever patient appears most interesting",
//     "Choose a treatment area independently",
//     "Report to the designated staging or command location and await assignment",
//     "Immediately begin transporting patients in the EMT's personal vehicle",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Established incident command structures coordinate personnel and resources. Incoming responders should report as directed and receive an assignment rather than independently choosing where or how to operate.",
// },

// {
//   id: "ops-221",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which activity is an example of an injury-prevention program rather than a treatment program?",
//   choices: [
//     "Teaching teenagers about the risks of impaired driving",
//     "Performing CPR on a child in cardiac arrest",
//     "Splinting a child's fractured arm",
//     "Treating a patient after a motor-vehicle collision",
//   ],
//   answerIndex: 0,
//   explanation:
//     "Injury-prevention programs attempt to prevent illness or injury before it occurs. Education about impaired driving is preventive, whereas CPR, splinting, and trauma treatment occur after an emergency has developed.",
// },

// {
//   id: "ops-222",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which activity is least consistent with the primary purpose of a community injury-prevention program?",
//   choices: [
//     "Teaching caregivers how to install child safety seats",
//     "Inspecting a home for common child-safety hazards",
//     "Teaching students about impaired-driving risks",
//     "Providing resuscitation to a child after an injury has already occurred",
//   ],
//   answerIndex: 3,
//   explanation:
//     "Injury-prevention programs focus on reducing the likelihood that injuries or illnesses will occur. Resuscitation is an emergency treatment performed after a medical emergency has already developed.",
// },

// {
//   id: "ops-223",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "primaryAssessment",
//   question:
//     "You are responding to a suspected cardiac arrest. If you could initially carry only two pieces of equipment to the patient, which combination would generally be most useful?",
//   choices: [
//     "AED and suction equipment",
//     "Oxygen cylinder and blood-pressure cuff",
//     "Stethoscope and oxygen cylinder",
//     "Trauma bag and cervical collar",
//   ],
//   answerIndex: 0,
//   explanation:
//     "Early defibrillation can be critical in cardiac arrest, and suction may be needed to clear an obstructed airway. Exact equipment priorities should follow agency policy, but an AED is a key piece of equipment for a suspected cardiac arrest.",
// },

// {
//   id: "ops-224",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "primaryAssessment",
//   question:
//     "Which piece of equipment should NOT be considered a substitute for bringing an AED to a patient in suspected cardiac arrest?",
//   choices: [
//     "Suction equipment",
//     "An AED",
//     "A defibrillator",
//     "An automated external defibrillator with appropriate pads",
//   ],
//   answerIndex: 0,
//   explanation:
//     "Suction can help manage the airway, but it does not replace the need for an AED when defibrillation may be indicated. The AED should be brought to the patient as early as possible.",
// },

// {
//   id: "ops-225",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "treatmentTransport",
//   question:
//     "A competent adult living in a skilled nursing facility refuses transport. The facility nurse believes the patient should go to the hospital. Who normally has the authority to make the patient's healthcare decision?",
//   choices: [
//     "The EMT",
//     "The facility nurse",
//     "The patient's competent wishes",
//     "Any family member who arrives first",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Living in a nursing facility does not automatically eliminate an adult patient's decision-making capacity. If the patient is competent to make the decision, the patient's informed choice controls, subject to applicable law and specific legal arrangements.",
// },

// {
//   id: "ops-226",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "treatmentTransport",
//   question:
//     "A patient who is alert and understands your proposed blood-pressure measurement voluntarily holds out an arm. This action is best described as:",
//   choices: [
//     "Expressed or actual consent",
//     "Implied consent",
//     "A court-ordered consent",
//     "Consent provided by a surrogate",
//   ],
//   answerIndex: 0,
//   explanation:
//     "Consent can be expressed verbally or through an appropriate voluntary action. Offering an arm for a blood-pressure measurement is a nonverbal indication that the patient agrees to that assessment.",
// },

// {
//   id: "ops-227",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "secondaryAssessment",
//   question:
//     "An unconscious adult requires emergency care and no authorized decision-maker is immediately available. Which concept generally permits necessary emergency treatment?",
//   choices: [
//     "Expressed consent",
//     "Implied consent",
//     "Informed refusal",
//     "Formal consent",
//   ],
//   answerIndex: 1,
//   explanation:
//     "Implied consent generally applies when an adult cannot provide consent and immediate treatment is necessary. The assumption is that a reasonable person would consent to lifesaving emergency care under the circumstances.",
// },

// {
//   id: "ops-228",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "What is the primary goal of an EMS quality-improvement program?",
//   choices: [
//     "To maximize the number of continuing-education certificates issued",
//     "To identify and discipline every provider who makes a mistake",
//     "To promote consistently high-quality patient care throughout the EMS system",
//     "To ensure that every EMT uses identical treatment techniques in every situation",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Quality improvement is a system-level process intended to improve patient care and outcomes. Education, protocol review, performance monitoring, and corrective actions can all contribute to the broader goal of consistent high-quality care.",
// },

// {
//   id: "ops-229",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which activity best represents the purpose of EMS quality improvement?",
//   choices: [
//     "Finding someone to blame whenever a poor outcome occurs",
//     "Using performance information to identify opportunities to improve patient care",
//     "Reducing the amount of documentation required from EMTs",
//     "Ensuring that only senior EMTs receive additional training",
//   ],
//   answerIndex: 1,
//   explanation:
//     "Quality improvement uses data, case review, education, and system changes to identify and correct opportunities for better care. Its purpose is improvement rather than simply assigning blame.",
// },

// {
//   id: "ops-230",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "You arrive at the emergency department, but the receiving nurse is temporarily occupied with another critical patient. What should you do regarding your patient report?",
//   choices: [
//     "Leave the patient and document that you attempted a report",
//     "Give the report to a visitor",
//     "Wait until an appropriate receiving clinician is available and provide the report",
//     "Call dispatch and ask them to relay the report",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Transfer of care includes communicating relevant patient information to an appropriate receiving clinician. If the receiving nurse is temporarily unavailable, the EMT should wait until the report can be properly received, while continuing to follow hospital and agency procedures.",
// },

// {
//   id: "ops-231",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which action would be inappropriate when transferring a patient to an emergency department?",
//   choices: [
//     "Providing a concise verbal report to the receiving clinician",
//     "Communicating important assessment findings and treatments",
//     "Leaving without ensuring that appropriate transfer communication has occurred",
//     "Reporting significant changes in the patient's condition",
//   ],
//   answerIndex: 2,
//   explanation:
//     "A proper transfer of care requires appropriate communication with the receiving healthcare team. Leaving before the receiving team has received the necessary information can create a dangerous gap in care.",
// },

// {
//   id: "ops-232",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which practice is one of the most effective ways to reduce transmission of infectious disease in EMS?",
//   choices: [
//     "Wearing gloves continuously between patients",
//     "Performing effective hand hygiene between patient contacts",
//     "Wearing a mask for every patient regardless of exposure risk",
//     "Avoiding physical contact with all patients",
//   ],
//   answerIndex: 1,
//   explanation:
//     "Effective hand hygiene is a fundamental infection-control measure and should be performed at appropriate times, including between patient contacts. Gloves do not replace hand hygiene.",
// },

// {
//   id: "ops-233",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "An EMT wears gloves while treating several patients but never changes or cleans their hands between patients. What is the primary problem with this practice?",
//   choices: [
//     "Gloves cannot become contaminated",
//     "Hand hygiene is still necessary and gloves can transfer contaminants",
//     "Gloves are only required for trauma patients",
//     "Hand hygiene is unnecessary when gloves are worn",
//   ],
//   answerIndex: 1,
//   explanation:
//     "Gloves can become contaminated and can transfer microorganisms between patients or surfaces. Appropriate hand hygiene remains an essential part of infection prevention.",
// },

// {
//   id: "ops-234",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which situation most clearly demonstrates gross negligence?",
//   choices: [
//     "An EMT accidentally drops equipment while preparing for a call",
//     "An EMT makes an honest documentation error",
//     "An EMT knowingly documents that the oxygen supply is full when the EMT knows it is empty",
//     "An EMT forgets one item during an equipment check without realizing it",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Gross negligence involves a particularly serious disregard for the safety of others. Knowingly falsifying a critical equipment check despite knowing the equipment is unavailable demonstrates deliberate disregard for patient safety.",
// },

// {
//   id: "ops-235",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which example is most consistent with ordinary negligence rather than gross negligence?",
//   choices: [
//     "Knowingly falsifying the ambulance oxygen check",
//     "Intentionally ignoring a known life-threatening equipment failure",
//     "Accidentally failing to recognize a hazard despite attempting to provide reasonable care",
//     "Deliberately documenting treatment that was never performed",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Ordinary negligence generally involves a failure to exercise reasonable care. Gross negligence involves a much more serious or conscious disregard for safety. Exact legal definitions can vary by jurisdiction.",
// },

// {
//   id: "ops-236",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "Police advise you that an armed suspect remains inside a building where an injured person is located. What should the EMS crew do?",
//   choices: [
//     "Enter immediately because a patient has been confirmed",
//     "Keep the radio at maximum volume so the suspect knows EMS has arrived",
//     "Stage in a location protected from the threat and wait for the appropriate tactical personnel to bring patients to the safe area",
//     "Enter through a rear door while leaving the ambulance lights and siren operating",
//   ],
//   answerIndex: 2,
//   explanation:
//     "EMS personnel should not enter an unsecured tactical scene. They should stage in a protected location as directed by incident command and law enforcement and provide care once patients reach a safe treatment area.",
// },

// {
//   id: "ops-237",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "Which action would be unsafe for an EMS crew responding to an active hostage situation?",
//   choices: [
//     "Following the incident commander's staging instructions",
//     "Remaining outside the threat area until law enforcement makes access safe",
//     "Waiting for tactical personnel to move the patient to a safe location",
//     "Entering the building independently because the crew believes the patient needs help",
//   ],
//   answerIndex: 3,
//   explanation:
//     "EMS personnel should not independently enter an active tactical threat. Entering an unsecured scene can create additional casualties and interfere with law-enforcement operations.",
// },

// {
//   id: "ops-238",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "treatmentTransport",
//   question:
//     "A cardiac-arrest patient's spouse asks you to stop CPR but cannot produce any valid out-of-hospital DNAR documentation. What should you generally do?",
//   choices: [
//     "Stop CPR immediately because the spouse requested it",
//     "Continue resuscitation while determining whether a valid order exists and obtaining medical direction as required",
//     "Provide rescue breathing only",
//     "Stop CPR if the AED advises no shock",
//   ],
//   answerIndex: 1,
//   explanation:
//     "A family member's request alone does not necessarily establish that resuscitation should be withheld. If there is no valid recognized DNAR order or other applicable basis to stop, EMS should generally continue resuscitation while following local protocol and seeking medical direction when appropriate.",
// },

// {
//   id: "ops-239",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "treatmentTransport",
//   question:
//     "Which statement about a valid out-of-hospital DNAR order is most accurate?",
//   choices: [
//     "It means the patient should receive no medical treatment of any kind",
//     "It generally addresses resuscitation decisions and does not automatically mean all supportive care should stop",
//     "It can be ignored whenever a family member requests CPR",
//     "It automatically applies to every patient with a serious chronic disease",
//   ],
//   answerIndex: 1,
//   explanation:
//     "A DNAR order generally addresses whether resuscitative efforts should be initiated or continued. It does not automatically mean that comfort measures, symptom management, or other appropriate treatment should be withheld. EMS should follow applicable law, documentation requirements, and protocol.",
// },

// {
//   id: "ops-240",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "Which practice provides the greatest protection for an EMT riding in an ambulance responding to an emergency call?",
//   choices: [
//     "Driving with lights and siren whenever possible",
//     "Following an escort vehicle through every intersection",
//     "Wearing the seat belt and shoulder restraint whenever seated in the ambulance",
//     "Driving faster than surrounding traffic regardless of conditions",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Seat belts and shoulder restraints substantially reduce injury risk during sudden stops and crashes. Emergency warning devices do not eliminate crash risk, and safe driving with due regard remains essential.",
// },

// {
//   id: "ops-241",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "Which practice would increase the risk of injury during an emergency ambulance response?",
//   choices: [
//     "Wearing the vehicle's restraints",
//     "Maintaining awareness of surrounding traffic",
//     "Assuming other drivers will always yield because the ambulance has its lights and siren activated",
//     "Adjusting speed to road and traffic conditions",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Lights and siren request the right-of-way but do not guarantee that other motorists will see or respond appropriately. Emergency vehicle operators must anticipate that other drivers may fail to yield.",
// },

// {
//   id: "ops-242",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "After a pediatric call involving an unsuccessful resuscitation, your partner becomes unusually anxious and irritable. What is the most appropriate initial response?",
//   choices: [
//     "Tell your partner to stop discussing the call",
//     "Listen and give your partner an opportunity to talk about the experience",
//     "Immediately diagnose the partner with a psychological disorder",
//     "Report the partner to the medical director solely because they are upset",
//   ],
//   answerIndex: 1,
//   explanation:
//     "Difficult calls can produce strong emotional reactions. A supportive first response is to listen and allow the provider to discuss their feelings. If distress persists or becomes severe, additional professional support may be appropriate.",
// },

// {
//   id: "ops-243",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which response is least appropriate when an EMS partner is experiencing significant emotional distress after a difficult call?",
//   choices: [
//     "Listening without judgment",
//     "Encouraging the partner to use available peer or professional support",
//     "Checking in with the partner later",
//     "Telling the partner that needing help means they are unfit to work in EMS",
//   ],
//   answerIndex: 3,
//   explanation:
//     "Stigma can discourage providers from seeking help. EMS organizations should encourage appropriate peer, supervisory, and professional support when a provider is struggling after a difficult event.",
// },

// {
//   id: "ops-244",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "primaryAssessment",
//   question:
//     "Using the JumpSTART triage system, a 4-year-old child is breathing 52 times/min. What triage category should the child receive?",
//   choices: [
//     "Immediate",
//     "Delayed",
//     "Minor",
//     "Expectant",
//   ],
//   answerIndex: 0,
//   explanation:
//     "In the classic JumpSTART system, a respiratory rate above the pediatric threshold is an immediate finding. The exact JumpSTART thresholds should be learned according to the version and protocol used by the responder's system.",
// },

// {
//   id: "ops-245",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "primaryAssessment",
//   question:
//     "In the classic JumpSTART system, a child has a respiratory rate within the acceptable range. What is assessed next?",
//   choices: [
//     "Whether the child can walk independently",
//     "The presence of a palpable peripheral pulse or other perfusion indicator specified by the system",
//     "The child's blood glucose level",
//     "Whether the child has a known medical history",
//   ],
//   answerIndex: 1,
//   explanation:
//     "When the child's respiratory rate is within the JumpSTART range, the next step evaluates perfusion. If perfusion is inadequate, the child receives immediate priority. The exact sequence should follow the triage protocol being used.",
// },

// {
//   id: "ops-246",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "What is a major advantage of a unified incident command system during a large incident involving several agencies?",
//   choices: [
//     "One agency can make every decision without consulting the others",
//     "Each agency can operate independently without coordination",
//     "Participating agencies can share responsibility and coordinate decisions through a common command structure",
//     "Only the agency that arrives first can make operational decisions",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Unified command allows agencies with different authorities or responsibilities to coordinate incident objectives and decisions. It is particularly useful for complex incidents requiring multiple agencies.",
// },

// {
//   id: "ops-247",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "operations",
//   question:
//     "Which situation is most appropriate for using unified command?",
//   choices: [
//     "A routine medical call handled by one EMS crew",
//     "A complex incident involving EMS, fire, law enforcement, and hazardous-material resources",
//     "A single patient with an uncomplicated ankle injury",
//     "A routine hospital transfer with no unusual circumstances",
//   ],
//   answerIndex: 1,
//   explanation:
//     "Unified command is useful when multiple agencies or organizations have significant responsibilities at the same incident. It allows those agencies to coordinate objectives and resources rather than operating independently.",
// },

// {
//   id: "ops-248",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "You arrive at a highway crash and are preparing to exit the ambulance. Which item should receive immediate attention because of the traffic hazard?",
//   choices: [
//     "A reflective safety vest or other high-visibility garment",
//     "A stethoscope",
//     "A blood-pressure cuff",
//     "A cervical collar",
//   ],
//   answerIndex: 0,
//   explanation:
//     "Highway scenes expose responders to moving traffic. A high-visibility garment helps motorists see the responder and is an important early safety measure. Other PPE should then be selected according to the hazards and patient-care needs.",
// },

// {
//   id: "ops-249",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "At a highway crash, which action would be least appropriate before the EMT considers patient contact?",
//   choices: [
//     "Increase responder visibility",
//     "Assess the traffic hazard",
//     "Position the ambulance according to agency traffic-control procedures",
//     "Walk into an active traffic lane without considering approaching vehicles",
//   ],
//   answerIndex: 3,
//   explanation:
//     "Moving traffic is a major hazard at highway scenes. EMTs must establish awareness of traffic and use appropriate visibility and vehicle-positioning procedures before entering exposed areas.",
// },

// {
//   id: "ops-250",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "treatmentTransport",
//   question:
//     "A stable patient has mild, localized chest discomfort after exercise, normal vital signs, and no signs of an immediate life threat. Which transport approach is generally most appropriate?",
//   choices: [
//     "Emergency transport using lights and siren solely because the patient reports chest discomfort",
//     "Nonemergency transport without emergency warning devices, unless the patient's condition changes",
//     "Emergency transport with siren but no warning lights",
//     "Emergency transport with lights but no siren",
//   ],
//   answerIndex: 1,
//   explanation:
//     "The decision to use emergency warning devices should be based on the patient's condition and the risks and benefits of emergency driving. A stable patient without an apparent immediate life threat generally does not require emergency transport solely because of the complaint.",
// },

// {
//   id: "ops-251",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "treatmentTransport",
//   question:
//     "Which factor should carry the most weight when deciding whether to use lights and siren during transport?",
//   choices: [
//     "Whether the patient has any complaint at all",
//     "Whether the crew wants to arrive sooner regardless of risk",
//     "The patient's clinical urgency and the risks and benefits of emergency driving",
//     "Whether family members are impatient to reach the hospital",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Emergency driving increases risk to the patient, crew, and public. The decision should consider the patient's clinical urgency, the expected benefit of faster transport, and applicable law and agency policy.",
// },

// {
//   id: "ops-252",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "You step out of the ambulance at a nighttime highway crash. What should you identify immediately before approaching the patients?",
//   choices: [
//     "The closest emergency department",
//     "The patient's medical history",
//     "The location and movement of nearby traffic",
//     "Whether the patient has health insurance",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Moving traffic can strike rescuers at highway scenes, particularly at night when visibility is reduced. The EMT should first recognize and manage the traffic hazard before approaching patients.",
// },

// {
//   id: "ops-253",
//   domain: "Operations",
//   level: "EMT",
//   blueprintCategory: "sceneSafety",
//   question:
//     "Which action would create an unnecessary hazard at a nighttime highway crash involving possible leaking fuel?",
//   choices: [
//     "Using appropriate high-visibility equipment",
//     "Positioning the ambulance to protect the scene according to agency procedure",
//     "Using open-flame road flares near a suspected fuel leak",
//     "Watching for approaching traffic",
//   ],
//   answerIndex: 2,
//   explanation:
//     "Open flames can ignite flammable vapors or leaked fuel. Modern traffic-control practices generally favor safer visibility devices such as approved reflective or electronic warning equipment when appropriate.",
// },
  {
    id: "ops-190",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "After a high-profile multi-patient crash, a reporter approaches an EMT at the station and asks for details about the victims. What is the EMT's BEST response?",
    choices: [
      "Provide the patients' ages but not their names.",
      "Confirm that the patients were taken to a hospital and refer the reporter to the agency's public information officer.",
      "Describe the most serious injuries but withhold the destination hospital.",
      "Provide information about adult patients but withhold information about minors."
    ],
    answerIndex: 1,
    explanation:
      "EMS personnel should generally refer media inquiries to the agency's public information officer. If an EMT must respond directly, only the minimum authorized information should be provided. Patient names, ages, injuries, and destination facilities should not be disclosed unless specifically authorized."
  },

  {
    id: "ops-191",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is the PRIMARY reason an EMT should avoid giving a reporter specific information about patients involved in an EMS call?",
    choices: [
      "The EMT is not permitted to speak to any member of the public.",
      "Patient information is confidential and media communications should normally be handled by the agency's designated spokesperson.",
      "Only physicians are legally allowed to discuss emergency patients.",
      "Reporters are required to obtain information directly from the receiving hospital."
    ],
    answerIndex: 1,
    explanation:
      "Patient information is confidential, and EMS agencies commonly designate a public information officer or other authorized spokesperson to communicate with the media. EMTs should not independently disclose protected patient information."
  },

  // ============================================================================
  // STRUCTURAL FIRE STANDBY
  // ============================================================================

  {
    id: "ops-192",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Your ambulance is requested to stage near a burning commercial building in case firefighters locate injured occupants. Which action is MOST appropriate?",
    choices: [
      "Park directly beside the building so patients can be loaded immediately.",
      "Enter the building with firefighters to shorten treatment time.",
      "Position the ambulance where it is safe and will not interfere with incoming fire apparatus.",
      "Leave once the flames are controlled, even if the incident commander has not released your unit."
    ],
    answerIndex: 2,
    explanation:
      "EMS crews should remain in a safe location and avoid interfering with fire apparatus. The fire officer or incident commander should determine where EMS should stage. EMTs should not enter a burning structure unless specifically trained, equipped, and operating under appropriate fire-service procedures."
  },

  {
    id: "ops-193",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "At a structure fire, where should the ambulance generally be positioned?",
    choices: [
      "Immediately adjacent to the structure.",
      "In an area designated by the fire officer that is safe and does not obstruct fire apparatus.",
      "Inside the perimeter closest to the victims.",
      "Anywhere behind the first arriving fire engine."
    ],
    answerIndex: 1,
    explanation:
      "The ambulance should be placed in a safe location designated by the fire officer or incident commander. It must not obstruct access for fire apparatus or expose the crew unnecessarily to fire, smoke, collapse, or other hazards."
  },

  // ============================================================================
  // CRIME SCENE / PATIENT ACCESS
  // ============================================================================

  {
    id: "ops-194",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Police are securing a residence where a patient has suffered multiple stab wounds. The unconscious patient is wedged between furniture, making treatment difficult. What should the EMT do?",
    choices: [
      "Wait for police to authorize movement of the furniture.",
      "Move whatever furniture is necessary to reach the patient, provide care, and notify law enforcement about the changes afterward.",
      "Leave the patient in place to avoid disturbing evidence.",
      "Ask police to complete the initial medical assessment."
    ],
    answerIndex: 1,
    explanation:
      "Patient care takes priority once the scene is safe. If an obstacle prevents access to a critically injured patient, the EMT should move it as necessary, provide treatment, and then tell law enforcement what was moved and why. The action should also be documented."
  },

  {
    id: "ops-195",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "An EMT moves a piece of furniture at a crime scene because it prevents access to a critically injured patient. Which action should occur AFTER patient care begins?",
    choices: [
      "Ask police to determine whether treatment should continue.",
      "Return the furniture to its original position.",
      "Inform law enforcement what was moved and document the action.",
      "Collect other objects that may contain evidence."
    ],
    answerIndex: 2,
    explanation:
      "Emergency patient care takes priority over preservation of physical evidence. After moving an obstacle, EMS should notify law enforcement about what was moved and where it was moved. Handling or collecting potential evidence should generally be left to law enforcement."
  },

  // ============================================================================
  // QA / QI
  // ============================================================================

  {
    id: "ops-196",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMS agency discovers that crews consistently spend unusually long periods on scene with critically injured trauma patients, even when there are no extrication or safety delays. What is the MOST appropriate system-level response?",
    choices: [
      "Identify the crews and immediately discipline them.",
      "Require air medical transport for every critical trauma patient.",
      "Develop targeted education addressing rapid recognition and management of critical trauma patients.",
      "Contact hospitals to determine whether the patients survived."
    ],
    answerIndex: 2,
    explanation:
      "A recurring performance problem without an obvious operational explanation should be addressed through quality improvement. Focused training may improve recognition, treatment, and transport decisions. Punitive action alone does not address a system-level performance issue."
  },

  {
    id: "ops-197",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which activity BEST represents a quality-improvement response to repeated excessive scene times during critical trauma calls?",
    choices: [
      "Review the pattern and provide focused education to improve trauma assessment and management.",
      "Automatically terminate the EMTs involved.",
      "Require helicopter transport for every trauma patient.",
      "Wait for hospital outcome data before addressing the scene-time problem."
    ],
    answerIndex: 0,
    explanation:
      "Quality improvement seeks to identify recurring system problems and implement corrective measures. If excessive trauma scene times are occurring without legitimate operational causes, targeted training is an appropriate intervention."
  },

  // ============================================================================
  // PATIENT COMMUNICATION / HONEST REASSURANCE
  // ============================================================================

  {
    id: "ops-198",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with severe chest discomfort looks frightened and asks, 'Am I going to die?' Which response is MOST appropriate?",
    choices: [
      "You will be fine. Try not to worry.",
      "I cannot know exactly what will happen, but I will stay with you and provide the best care I can.",
      "No. Chest pain is rarely life-threatening.",
      "You have nothing to worry about because we are almost at the hospital."
    ],
    answerIndex: 1,
    explanation:
      "The EMT should provide emotional support without making promises about an outcome that cannot be known. An honest response combined with reassurance about the care being provided is appropriate."
  },

  {
    id: "ops-199",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Why should an EMT avoid telling a seriously ill patient, 'Everything will definitely be okay'?",
    choices: [
      "Patients should never receive emotional reassurance.",
      "The EMT cannot guarantee the patient's outcome and should communicate honestly.",
      "Only medical control can reassure patients.",
      "Reassurance interferes with the patient's assessment."
    ],
    answerIndex: 1,
    explanation:
      "An EMT should be compassionate and reassuring while remaining truthful. Promising a specific outcome is inappropriate because the EMT cannot know with certainty what will happen."
  },

  // ============================================================================
  // RESTRAINTS
  // ============================================================================

  {
    id: "ops-200",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A combative patient must be physically restrained because he poses an immediate danger to himself and the crew. Which action is MOST appropriate during and after restraint?",
    choices: [
      "Place the patient face down so the limbs can be secured.",
      "Stop communicating with the patient once the restraints are applied.",
      "Continuously monitor the airway and breathing while maintaining communication with the patient.",
      "Use the maximum amount of force available to prevent further resistance."
    ],
    answerIndex: 2,
    explanation:
      "A restrained patient requires continuous monitoring, especially of airway and breathing. EMS personnel should continue communicating with the patient. Prone restraint can increase the risk of positional asphyxia and should be avoided."
  },

  {
    id: "ops-201",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which concern is MOST important to monitor continuously after a violent patient has been restrained?",
    choices: [
      "Whether the patient is embarrassed.",
      "Whether the patient remains verbally cooperative.",
      "Airway and respiratory status.",
      "Whether the restraints match the patient's clothing."
    ],
    answerIndex: 2,
    explanation:
      "Restraint can contribute to respiratory compromise, particularly when positioning or exhaustion is involved. Airway and breathing must be reassessed continuously while the patient remains restrained."
  },

  // ============================================================================
  // MCI COMPONENTS
  // ============================================================================

  {
    id: "ops-202",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which resource would NOT normally be considered an essential physical component of an organized mass-casualty treatment area?",
    choices: [
      "A designated treatment area.",
      "A nearby supply area.",
      "A reliable communications system.",
      "A physician physically stationed at the treatment area."
    ],
    answerIndex: 3,
    explanation:
      "An MCI requires organized treatment, supplies, and communications. A physician may provide medical oversight through the established command and medical-control system, but a physician does not necessarily need to be physically present at the scene."
  },

  {
    id: "ops-203",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which statement BEST describes the role of a physician in an EMS mass-casualty response?",
    choices: [
      "A physician must always be physically present before treatment can begin.",
      "The physician medical director must personally triage every MCI patient.",
      "Medical oversight can be provided remotely through established communications and command structures.",
      "Only a physician can establish the treatment area."
    ],
    answerIndex: 2,
    explanation:
      "Physician oversight is important, but a physician does not necessarily need to be physically present at the MCI. Medical direction can often be provided through established communications and command systems."
  },

  // ============================================================================
  // FIRST UNIT AT MULTIPLE-PATIENT CRASH
  // ============================================================================

  {
    id: "ops-204",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You are the first EMS unit at a crash involving three injured people. Only you and your partner are available. What should you do FIRST?",
    choices: [
      "Begin treating the most severely injured patient.",
      "Request additional EMS resources.",
      "Transport the closest patient immediately.",
      "Call the trauma center before requesting additional units."
    ],
    answerIndex: 1,
    explanation:
      "The crew must recognize when the number or severity of patients exceeds available resources. Additional units should be requested early so adequate personnel and transportation resources can arrive. Triage and treatment then proceed as resources allow."
  },

  {
    id: "ops-205",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is the FIRST operational priority when two EMTs arrive to find several potentially critically injured patients?",
    choices: [
      "Request additional resources.",
      "Transport the closest patient.",
      "Perform a complete secondary assessment on the first patient found.",
      "Contact the trauma center with a final patient count."
    ],
    answerIndex: 0,
    explanation:
      "When the patient load exceeds the crew's ability to provide appropriate care, additional resources should be requested immediately. This allows the incident to be managed safely and effectively."
  },

  // ============================================================================
  // POLST
  // ============================================================================

  {
    id: "ops-206",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "A seriously ill patient has a valid POLST document. What is the primary purpose of this document?",
    choices: [
      "It gives a family member unrestricted authority over medical decisions.",
      "It specifies medical treatment preferences in the form of authorized medical orders.",
      "It automatically means that CPR must never be attempted.",
      "It limits the patient to basic life support only."
    ],
    answerIndex: 1,
    explanation:
      "A POLST is a medical-order document that communicates a patient's treatment preferences for serious illness. It is broader than simply a DNR order and can specify different levels of treatment."
  },

  {
    id: "ops-207",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which document communicates specific treatment preferences for a seriously ill patient through medical orders that EMS may need to honor according to applicable law and protocol?",
    choices: [
      "A POLST.",
      "A standard employment authorization.",
      "A routine hospital discharge form.",
      "An EMS incident report."
    ],
    answerIndex: 0,
    explanation:
      "A POLST, or similar state-specific medical-order document, communicates treatment preferences through medical orders for patients with serious illness. EMS should follow applicable state law, agency policy, and medical direction."
  },

  // ============================================================================
  // INCIDENT COMMAND
  // ============================================================================

  {
    id: "ops-208",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You arrive at an MCI where the incident command system is already functioning. After completing your assigned task, what should you do?",
    choices: [
      "Choose another task that appears to need attention.",
      "Leave the incident if no patient is immediately nearby.",
      "Report back to the appropriate supervisor for further instructions.",
      "Remain at the treatment area and wait for another crew to find you."
    ],
    answerIndex: 2,
    explanation:
      "ICS relies on a defined chain of command. EMS personnel should complete assigned tasks and report back to their supervisor for additional instructions rather than independently selecting new assignments."
  },

  {
    id: "ops-209",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which behavior would be considered 'freelancing' at an incident operating under ICS?",
    choices: [
      "Returning to a supervisor after completing an assignment.",
      "Following the assignment given by the section supervisor.",
      "Leaving an assigned area to perform a different task without notifying command.",
      "Receiving instructions at the staging area."
    ],
    answerIndex: 2,
    explanation:
      "Freelancing occurs when personnel act independently rather than following the established command structure. It can create confusion, duplicate efforts, and compromise incident safety."
  },

  // ============================================================================
  // ABANDONMENT
  // ============================================================================

  {
    id: "ops-210",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which situation BEST represents abandonment?",
    choices: [
      "An EMT transfers care to a paramedic.",
      "An EMT gives a patient report to an emergency department nurse.",
      "A paramedic transfers a patient to an AEMT despite the patient still requiring paramedic-level care.",
      "An EMT transfers a patient to another EMT at the receiving facility."
    ],
    answerIndex: 2,
    explanation:
      "Abandonment can occur when a provider improperly terminates care or transfers responsibility to a provider who is not appropriately qualified for the patient's needs. A higher-level provider transferring an ongoing patient to a lower-level provider can constitute abandonment."
  },

  {
    id: "ops-211",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What legal concept may apply when a paramedic leaves a patient who still requires advanced care in the custody of a provider with a lower level of certification?",
    choices: [
      "Consent.",
      "Abandonment.",
      "Assault.",
      "Battery."
    ],
    answerIndex: 1,
    explanation:
      "Abandonment involves improperly terminating care or transferring responsibility when the patient still requires care and the receiving provider is not appropriately qualified."
  },

  // ============================================================================
  // STANDARD PRECAUTIONS / MCI
  // ============================================================================

  {
    id: "ops-212",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "During an MCI, an EMT moves rapidly from one patient to another. Which infection-control action is MOST practical between patient contacts?",
    choices: [
      "Perform a full handwashing procedure after every patient.",
      "Change gloves between patients and replace other contaminated PPE as necessary.",
      "Wear the same gloves throughout the entire incident.",
      "Ask every patient whether they have an infectious disease."
    ],
    answerIndex: 1,
    explanation:
      "Changing gloves between patients is an important practical method of reducing cross-contamination during a mass-casualty response. Standard precautions assume that potentially infectious material may be present regardless of known diagnosis."
  },

  {
    id: "ops-213",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which principle is the basis of standard precautions during patient care?",
    choices: [
      "Only patients with known infections require protective measures.",
      "All patients should be treated as though potentially infectious materials may be present.",
      "Gloves only need to be changed when visibly bloody.",
      "Patients should disclose all communicable diseases before treatment."
    ],
    answerIndex: 1,
    explanation:
      "Standard precautions are based on the assumption that potentially infectious material may be present. Therefore, appropriate PPE and infection-control practices should be used regardless of whether an infection is known."
  },

  // ============================================================================
  // GRIEF / DENIAL
  // ============================================================================

  {
    id: "ops-214",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient recently told that he has an advanced terminal illness insists that the diagnosis cannot be serious and refuses to discuss treatment. Which stage of the grieving process does this behavior MOST closely represent?",
    choices: [
      "Acceptance.",
      "Bargaining.",
      "Denial.",
      "Anger."
    ],
    answerIndex: 2,
    explanation:
      "Denial involves difficulty accepting or believing the reality of a serious diagnosis. The stages of grief do not necessarily occur in a fixed order, and patients may move between stages."
  },

  {
    id: "ops-215",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient responds to a terminal diagnosis by insisting, 'The doctors must be wrong. There is nothing seriously wrong with me.' What emotional response is this MOST consistent with?",
    choices: [
      "Denial.",
      "Acceptance.",
      "Bargaining.",
      "Anger."
    ],
    answerIndex: 0,
    explanation:
      "Refusing to acknowledge the seriousness or reality of a diagnosis is characteristic of denial. Grief responses vary from person to person and do not always occur in a predictable sequence."
  },

  // ============================================================================
  // DISPATCH STATUS
  // ============================================================================

  {
    id: "ops-216",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Your ambulance has just left the scene with a patient. Which communication should occur FIRST?",
    choices: [
      "Provide the receiving hospital with the complete patient history.",
      "Notify dispatch that your unit is transporting.",
      "Call medical control for treatment orders.",
      "Complete the full secondary assessment."
    ],
    answerIndex: 1,
    explanation:
      "Once the unit begins transport, dispatch should be updated so the communications system knows the unit's current status and availability. Additional communication and assessment can occur during transport."
  },

  {
    id: "ops-217",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Why should an EMS crew notify dispatch promptly after beginning patient transport?",
    choices: [
      "Dispatch needs to know the unit's current status and availability.",
      "Dispatch is responsible for diagnosing the patient.",
      "The receiving hospital cannot be contacted until dispatch is notified.",
      "Medical control requires dispatch to authorize transport."
    ],
    answerIndex: 0,
    explanation:
      "Dispatch must maintain awareness of unit status so available resources can be assigned to subsequent calls. The crew can then communicate with the receiving facility and medical control as appropriate."
  },

  // ============================================================================
  // MCI STAGING
  // ============================================================================

  {
    id: "ops-218",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You arrive at a large-scale incident where several EMS units are already operating and an incident command structure is established. Where should your crew initially report?",
    choices: [
      "The treatment area.",
      "The location of the most severely injured patient.",
      "The designated staging area.",
      "The receiving hospital."
    ],
    answerIndex: 2,
    explanation:
      "Incoming EMS resources should report to the designated staging area when one has been established. The staging officer or command structure can then assign resources where they are most needed."
  },

  {
    id: "ops-219",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is the PRIMARY purpose of an EMS staging area at a large incident?",
    choices: [
      "To provide definitive treatment to critically injured patients.",
      "To organize incoming personnel and resources before they are assigned.",
      "To replace the incident command post.",
      "To serve as the destination for all transported patients."
    ],
    answerIndex: 1,
    explanation:
      "The staging area allows incoming resources to remain organized and available until command determines where they are needed. This helps prevent uncontrolled deployment and supports the incident command structure."
  },

  // ============================================================================
  // CHEMICAL HAZARDS
  // ============================================================================

  {
    id: "ops-220",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Several people near an industrial release develop coughing, shortness of breath, and airway irritation. A greenish cloud is visible in the area. Which substance should be suspected?",
    choices: [
      "VX.",
      "Chlorine.",
      "Soman.",
      "Anthrax."
    ],
    answerIndex: 1,
    explanation:
      "Chlorine is a pulmonary irritant that can produce a greenish-yellow appearance and causes respiratory irritation, coughing, and breathing difficulty. VX and soman are nerve agents, while anthrax is a biological agent."
  },

  {
    id: "ops-221",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which category of hazardous substance is associated with agents such as VX and soman?",
    choices: [
      "Pulmonary irritants.",
      "Nerve agents.",
      "Radiological agents.",
      "Biological toxins."
    ],
    answerIndex: 1,
    explanation:
      "VX and soman are organophosphate nerve agents. Exposure can cause excessive secretions, gastrointestinal symptoms, pinpoint pupils, bradycardia, and other signs of cholinergic overstimulation."
  },

  // ============================================================================
  // NEGLIGENCE / ABANDONMENT
  // ============================================================================

  {
    id: "ops-222",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMT fails to provide a treatment that a reasonably prudent EMT would have provided, and the patient subsequently suffers harm. The EMT then leaves the emergency department without transferring care to hospital personnel. Which combination of legal concepts is MOST appropriate?",
    choices: [
      "Assault and battery.",
      "Negligence and abandonment.",
      "Battery and consent.",
      "Assault and abandonment."
    ],
    answerIndex: 1,
    explanation:
      "Failure to meet the expected standard of care may constitute negligence when it results in patient harm. Leaving a patient without properly transferring care can constitute abandonment."
  },

  {
    id: "ops-223",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which pair of legal concepts is associated with failing to meet the expected standard of care and then leaving a patient without properly transferring responsibility?",
    choices: [
      "Negligence and abandonment.",
      "Assault and battery.",
      "Consent and battery.",
      "False imprisonment and assault."
    ],
    answerIndex: 0,
    explanation:
      "Negligence involves failure to provide the expected standard of care when that failure causes harm. Abandonment involves improperly ending the provider-patient relationship or transferring care without appropriate handoff."
  },

  // ============================================================================
  // IMMUNIZATION
  // ============================================================================

  {
    id: "ops-224",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which vaccine is NOT part of routine vaccination recommendations for most healthcare personnel in the United States?",
    choices: [
      "Hepatitis B.",
      "Tdap.",
      "MMR.",
      "Smallpox."
    ],
    answerIndex: 3,
    explanation:
      "Routine vaccination recommendations for healthcare personnel include vaccines such as hepatitis B, MMR when indicated, and Tdap. Smallpox vaccination is not routinely given to the general healthcare workforce because routine vaccination ended after eradication, although certain specialized personnel may receive it based on occupational risk."
  },

  {
    id: "ops-225",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which immunization is generally associated with specialized occupational or public-health circumstances rather than routine vaccination of the general EMS workforce?",
    choices: [
      "Hepatitis B.",
      "Tdap.",
      "MMR.",
      "Smallpox."
    ],
    answerIndex: 3,
    explanation:
      "Smallpox vaccination is not routinely administered to the general healthcare workforce. It may be considered for certain personnel with specific occupational or public-health risks."
  },

  // ============================================================================
  // MEDICAL CONTROL / READ-BACK
  // ============================================================================

  {
    id: "ops-226",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Medical control instructs you to administer an oral glucose preparation to an appropriate hypoglycemic patient. What should you do immediately after receiving the order?",
    choices: [
      "Give the medication without repeating the order.",
      "Repeat the order back to the physician to confirm that you heard it correctly.",
      "Ask the physician to document the order.",
      "Transport the patient before carrying out the order."
    ],
    answerIndex: 1,
    explanation:
      "Orders from medical control should be read back to confirm that the EMT correctly heard and understood the instruction. This reduces communication errors."
  },

  {
    id: "ops-227",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What communication technique helps prevent errors when receiving a treatment order from medical control?",
    choices: [
      "Using only radio codes.",
      "Repeating the order back to the physician.",
      "Waiting until after treatment to confirm the order.",
      "Having the patient repeat the order."
    ],
    answerIndex: 1,
    explanation:
      "A verbal read-back allows medical control to confirm that the order was received accurately before the EMT carries it out."
  },

  // ============================================================================
  // PCR DOCUMENTATION
  // ============================================================================

  {
    id: "ops-228",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which statement would be INAPPROPRIATE in an EMT's patient care report because it represents an unsupported clinical or disposition judgment?",
    choices: [
      "The patient stated, 'I want to die.'",
      "The patient's breath had a strong odor of alcohol.",
      "The patient's spouse stated, 'He has been drinking again.'",
      "The patient requires inpatient psychiatric treatment."
    ],
    answerIndex: 3,
    explanation:
      "PCR documentation should be objective and factual. Direct statements from patients or witnesses can be documented as quotations, while objective observations can be recorded as findings. Declaring that a patient requires inpatient psychiatric treatment is a disposition or clinical judgment beyond the EMT's documentation role."
  },

  {
    id: "ops-229",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which characteristic should patient care report documentation have?",
    choices: [
      "It should primarily contain the EMT's opinions.",
      "It should be factual, objective, and distinguish observations from statements made by others.",
      "It should include legal conclusions whenever possible.",
      "It should avoid documenting statements made by patients."
    ],
    answerIndex: 1,
    explanation:
      "PCRs should accurately document objective findings, care provided, and relevant statements. Personal opinions and unsupported conclusions should be avoided."
  },

  // ============================================================================
  // MULTIPLE PATIENT CRASH / RESOURCE REQUEST
  // ============================================================================

  {
    id: "ops-230",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You arrive at a collision involving several vehicles and immediately identify more patients than your two-person crew can safely manage. What should happen FIRST?",
    choices: [
      "Request additional EMS resources.",
      "Perform a complete assessment of the closest patient.",
      "Begin transporting the most severely injured patient.",
      "Wait until all patients have been triaged before requesting help."
    ],
    answerIndex: 0,
    explanation:
      "When the number of patients exceeds the crew's available resources, additional assistance should be requested immediately. Once resources are requested, triage and treatment can proceed according to the incident's needs."
  },

  {
    id: "ops-231",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Why should an EMT request additional ambulances as soon as it becomes clear that the patient count exceeds the crew's capacity?",
    choices: [
      "Additional resources allow the crew to provide appropriate triage, treatment, and transportation.",
      "Additional ambulances eliminate the need for triage.",
      "The first arriving crew is never allowed to treat patients.",
      "The hospital cannot accept multiple patients without advance permission."
    ],
    answerIndex: 0,
    explanation:
      "Early resource requests allow adequate personnel, ambulances, and equipment to be mobilized. Waiting until the crew is overwhelmed can delay care and transportation."
  },

  // ============================================================================
  // CLEANING / DISINFECTION / STERILIZATION
  // ============================================================================

  {
    id: "ops-232",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMT removes visible blood and debris from an ambulance stretcher before applying an appropriate disinfectant. What is the first process called?",
    choices: [
      "Sterilization.",
      "Cleaning.",
      "High-level disinfection.",
      "Decontamination by radiation."
    ],
    answerIndex: 1,
    explanation:
      "Cleaning is the physical removal of dirt, blood, debris, and other visible contaminants. Disinfection is a subsequent process intended to destroy many pathogenic organisms on surfaces."
  },

  {
    id: "ops-233",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What process specifically refers to physically removing visible dirt, blood, or other contaminants from equipment or a surface?",
    choices: [
      "Cleaning.",
      "Sterilization.",
      "Disinfection.",
      "Pasteurization."
    ],
    answerIndex: 0,
    explanation:
      "Cleaning physically removes visible contaminants. Disinfection and sterilization are different processes intended to reduce or eliminate microorganisms."
  },

  // ============================================================================
  // CRIME SCENE EVIDENCE
  // ============================================================================

  {
    id: "ops-234",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "While treating a stabbing victim, an EMT must move a table to gain access. Which action BEST demonstrates appropriate crime-scene awareness?",
    choices: [
      "Leave the patient untreated until police approve the move.",
      "Move the table, provide emergency care, and inform law enforcement afterward.",
      "Collect nearby weapons and place them in the ambulance.",
      "Move the table and then conceal the fact that it was moved."
    ],
    answerIndex: 1,
    explanation:
      "Patient care takes priority once the scene is safe. Necessary changes to the scene should be minimized and reported to law enforcement afterward so investigators know what was disturbed."
  },

  {
    id: "ops-235",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Why should an EMT document and report moving an object at a crime scene during patient care?",
    choices: [
      "To allow law enforcement to account for changes that could affect evidence.",
      "To establish ownership of the object.",
      "To allow EMS personnel to collect the object later.",
      "Because EMTs are responsible for investigating the crime."
    ],
    answerIndex: 0,
    explanation:
      "Objects and their locations may be important evidence. When EMS must disturb the scene to provide care, law enforcement should be informed so investigators understand what changed."
  },

  // ============================================================================
  // HIGHWAY INCIDENT POSITIONING
  // ============================================================================

  {
    id: "ops-236",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "An ambulance arrives at a crash on a multilane highway. Fire apparatus has already established a protective position upstream of the collision. Where should the ambulance generally be positioned?",
    choices: [
      "Immediately beside the damaged vehicle.",
      "Downstream of the crash on the opposite side of the highway.",
      "Downstream of the crash on the same side of the highway, when appropriate for the incident setup.",
      "In the center lane between moving traffic and the crash."
    ],
    answerIndex: 2,
    explanation:
      "When other emergency vehicles have established an upstream protective position, the ambulance may be positioned beyond the crash on the same side of the roadway. Exact positioning depends on the incident and local procedures, but blocking traffic unnecessarily and forcing personnel to cross active lanes should be avoided."
  },

  {
    id: "ops-237",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What is a major safety objective when positioning an ambulance at a highway crash?",
    choices: [
      "Place the ambulance as close as physically possible to the patient.",
      "Avoid blocking other emergency vehicles while helping create a protected work area.",
      "Force all traffic to stop regardless of the incident.",
      "Position the ambulance so responders must cross active lanes."
    ],
    answerIndex: 1,
    explanation:
      "Emergency vehicle positioning should protect responders and patients while preserving access for other emergency apparatus. Local traffic-control and agency procedures should determine the exact position."
  },

  // ============================================================================
  // MASS-CASUALTY INCIDENT DEFINITION
  // ============================================================================

  {
    id: "ops-238",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which situation BEST meets the definition of a mass-casualty incident?",
    choices: [
      "Any event involving at least five patients.",
      "Any collision involving three or more vehicles.",
      "An incident in which the number or severity of patients exceeds the available EMS resources.",
      "Any event in which at least half of the patients require transport."
    ],
    answerIndex: 2,
    explanation:
      "An MCI is defined by the relationship between patient needs and available resources, not by a fixed number of patients or vehicles. A relatively small number of critically injured patients can overwhelm a small EMS crew."
  },

  {
    id: "ops-239",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What factor determines whether an incident is considered a mass-casualty incident?",
    choices: [
      "The number of vehicles involved.",
      "The number of patients alone.",
      "Whether patient needs exceed the resources currently available.",
      "Whether a physician is present."
    ],
    answerIndex: 2,
    explanation:
      "The defining feature of an MCI is that patient care needs exceed the resources immediately available to manage the incident effectively."
  },

  // ============================================================================
  // NERVE AGENT SIGNS
  // ============================================================================

  {
    id: "ops-240",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Several patients exposed to an unknown substance develop pinpoint pupils, excessive salivation, vomiting, tearing, and marked bradycardia. Which type of agent is MOST likely responsible?",
    choices: [
      "A nerve agent.",
      "A vesicant.",
      "A radioactive isotope.",
      "A simple asphyxiant."
    ],
    answerIndex: 0,
    explanation:
      "The combination of miosis, excessive secretions, vomiting, lacrimation, and bradycardia strongly suggests cholinergic toxicity associated with organophosphate nerve agents."
  },

  {
    id: "ops-241",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which exposure would be MOST consistent with a patient who has excessive secretions, pinpoint pupils, vomiting, tearing, and severe bradycardia?",
    choices: [
      "Nerve-agent exposure.",
      "Carbon monoxide exposure.",
      "A thermal burn.",
      "A radiological exposure."
    ],
    answerIndex: 0,
    explanation:
      "These findings are characteristic of cholinergic overstimulation, which can occur after exposure to organophosphate nerve agents."
  },

  // ============================================================================
  // SCHOOL BUS
  // ============================================================================

  {
    id: "ops-242",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "An ambulance responding to an emergency approaches a school bus stopped with its red warning lights activated. What should the ambulance operator do?",
    choices: [
      "Pass the bus slowly on the left.",
      "Pass on the right while using the siren.",
      "Wait until the bus's red warning lights are deactivated and it is safe and lawful to proceed.",
      "Use the PA system to instruct students to remain seated while passing."
    ],
    answerIndex: 2,
    explanation:
      "Emergency vehicle operators must follow applicable laws governing stopped school buses. In general, an emergency response does not automatically authorize passing a school bus displaying its red warning lights."
  },

  {
    id: "ops-243",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What is the key safety concern when an ambulance approaches a school bus displaying flashing red warning lights?",
    choices: [
      "The ambulance's siren may damage the bus.",
      "Children may enter the roadway unexpectedly, so the ambulance should not simply pass the bus.",
      "The ambulance must switch to a different siren tone.",
      "The ambulance must turn off all emergency lighting."
    ],
    answerIndex: 1,
    explanation:
      "Students may be entering or crossing the roadway around a stopped school bus. Emergency vehicle operators must comply with applicable school-bus stopping laws and proceed only when it is safe and legally permitted."
  },

  // ============================================================================
  // SCENE SIZE-UP
  // ============================================================================

  {
    id: "ops-244",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which action is performed BEFORE the formal scene size-up begins?",
    choices: [
      "Determining the mechanism of injury.",
      "Counting the number of patients.",
      "Putting on appropriate personal protective equipment.",
      "Requesting additional resources."
    ],
    answerIndex: 2,
    explanation:
      "Appropriate PPE should be donned before beginning the scene size-up. The size-up itself includes evaluating scene safety, determining the nature of the illness or mechanism of injury, estimating the number of patients, and identifying additional resource needs."
  },

  {
    id: "ops-245",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which group contains typical components of the scene size-up?",
    choices: [
      "Scene safety, nature of illness or mechanism of injury, number of patients, and need for additional resources.",
      "Vital signs, medication administration, transport destination, and PCR completion.",
      "Patient history, SAMPLE, OPQRST, and medication reconciliation.",
      "Secondary assessment, reassessment, treatment response, and hospital handoff."
    ],
    answerIndex: 0,
    explanation:
      "The scene size-up focuses on hazards, the nature of the call or mechanism of injury, the number of patients, and whether additional resources are required. PPE should be donned before entering the scene and beginning the size-up."
  },

  // ============================================================================
  // SAFE REACHING
  // ============================================================================

  {
    id: "ops-246",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which action is NOT consistent with safe reaching techniques for an EMT?",
    choices: [
      "Keeping the back in a stable position.",
      "Avoiding twisting while reaching.",
      "Avoiding excessive backward bending.",
      "Reaching as far forward as possible to avoid moving the patient."
    ],
    answerIndex: 3,
    explanation:
      "Excessive forward reaching increases the risk of back injury. EMTs should keep the back stable, avoid twisting or hyperextension, and limit the distance they reach in front of the body."
  },

  {
    id: "ops-247",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which principle helps reduce the risk of back injury when an EMT must reach for equipment or a patient?",
    choices: [
      "Reach as far forward as possible.",
      "Twist the torso rather than moving the feet.",
      "Keep the back stable and minimize the distance of the reach.",
      "Hyperextend the back to maintain balance."
    ],
    answerIndex: 2,
    explanation:
      "Safe reaching involves maintaining a stable back, avoiding twisting and hyperextension, and limiting how far the EMT reaches forward."
  },

  // ============================================================================
  // MEDICAL DIRECTION COMMUNICATION
  // ============================================================================

  {
    id: "ops-248",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "When contacting medical control about a patient involved in a serious vehicle collision, which communication practice should be AVOIDED?",
    choices: [
      "Using plain language.",
      "Using appropriate medical terminology.",
      "Explaining significant vehicle damage when relevant to the patient's mechanism of injury.",
      "Using local radio codes instead of plain language."
    ],
    answerIndex: 3,
    explanation:
      "Medical control personnel may not understand local radio codes. Plain language reduces ambiguity. The EMT should provide relevant clinical findings, appropriate terminology, and important mechanism-of-injury information."
  },

  {
    id: "ops-249",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Why should an EMT generally use plain language rather than local radio codes when communicating with medical control?",
    choices: [
      "Radio codes are only allowed for fire departments.",
      "Medical control may not know the local meaning of those codes.",
      "Plain language is required only during non-emergency calls.",
      "Radio codes prevent medical control from understanding patient information."
    ],
    answerIndex: 1,
    explanation:
      "Plain language reduces the risk of misunderstanding, especially when communicating with medical personnel who may not be familiar with local agency-specific codes."
  },

  // ============================================================================
  // HAZMAT PLACARDS
  // ============================================================================

  {
    id: "ops-250",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "An EMT arrives at a highway incident involving a tanker displaying an orange hazardous-material placard. What general hazard class does the orange placard indicate?",
    choices: [
      "Radioactive material.",
      "Corrosive material.",
      "Flammable material.",
      "Explosive material."
    ],
    answerIndex: 3,
    explanation:
      "Orange hazardous-material placards indicate explosives or blasting agents. Placard colors identify broad hazard classes, while other markings such as UN identification numbers provide more specific information."
  },

  {
    id: "ops-251",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What type of hazardous material is generally represented by an orange DOT placard?",
    choices: [
      "Explosive material.",
      "Flammable liquid.",
      "Corrosive material.",
      "Radioactive material."
    ],
    answerIndex: 0,
    explanation:
      "Orange placards indicate explosives. Other placard colors identify different hazard classes. Responders should use the appropriate hazardous-material reference resources rather than relying solely on color."
  },

  // ============================================================================
  // TAILGATING AMBULANCE
  // ============================================================================

  {
    id: "ops-252",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "While driving an ambulance in non-emergency mode, you notice a car following dangerously close behind. What is the SAFEST response?",
    choices: [
      "Tap the brakes to warn the driver.",
      "Accelerate to create more distance.",
      "Slow down and, when safe, allow the vehicle to pass.",
      "Stop in the roadway and confront the driver."
    ],
    answerIndex: 2,
    explanation:
      "A tailgating driver creates a collision hazard. Slowing down and allowing the driver to pass safely reduces the risk. Brake-checking, accelerating, or confronting the driver can increase the danger."
  },

  {
    id: "ops-253",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What should an ambulance operator do when another vehicle is following too closely?",
    choices: [
      "Brake suddenly to force the vehicle to back off.",
      "Increase speed so the vehicle cannot keep up.",
      "Slow down and provide an opportunity for the vehicle to pass safely.",
      "Exit the ambulance and speak with the driver."
    ],
    answerIndex: 2,
    explanation:
      "Reducing speed and allowing a tailgating vehicle to pass is safer than brake-checking, accelerating, or engaging the driver directly."
  },

  // ============================================================================
  // CHEMICAL FACILITY / SDS
  // ============================================================================

  {
    id: "ops-254",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "EMS is requested at an industrial facility where a chemical has been released. Which resource maintained by the facility can provide information about a chemical's hazards, composition, and recommended first aid?",
    choices: [
      "The company's employee handbook.",
      "The chemical's Safety Data Sheet.",
      "The ambulance run report.",
      "A highway traffic citation."
    ],
    answerIndex: 1,
    explanation:
      "Safety Data Sheets, formerly commonly called Material Safety Data Sheets, provide information about chemical hazards, handling, exposure response, and other safety information. Responders should obtain this information through the appropriate facility personnel and command structure."
  },

  {
    id: "ops-255",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What document should responders look for at a facility to obtain detailed safety information about a chemical stored or used there?",
    choices: [
      "Safety Data Sheet.",
      "Patient care report.",
      "Vehicle registration.",
      "Incident command organizational chart."
    ],
    answerIndex: 0,
    explanation:
      "A Safety Data Sheet provides important information about a chemical, including hazards, exposure precautions, and response information."
  },

  // ============================================================================
  // REMOTE / ROUGH-TERRAIN PATIENT MOVEMENT
  // ============================================================================

  {
    id: "ops-256",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A hiker falls in a remote area with steep, uneven terrain. The patient may have a spinal injury, and heavy fog and an approaching storm make helicopter operations unsafe. Which method is MOST appropriate for moving the patient?",
    choices: [
      "Have the patient walk out if he can move his legs.",
      "Use a wheeled ambulance stretcher over the rough terrain.",
      "Secure the patient appropriately and use a basket stretcher carried by a sufficient rescue team.",
      "Request a helicopter regardless of the weather."
    ],
    answerIndex: 2,
    explanation:
      "Basket stretchers are designed for difficult terrain. A patient with a significant fall may require spinal motion restriction, and rough terrain may require several rescuers to safely carry the patient. Unsafe helicopter operations should not be attempted simply for convenience."
  },

  {
    id: "ops-257",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which device is particularly useful for carrying a patient across rough or uneven terrain during a wilderness rescue?",
    choices: [
      "A basket stretcher.",
      "A stair chair.",
      "A folding wheelchair.",
      "A standard hospital bed."
    ],
    answerIndex: 0,
    explanation:
      "A basket stretcher, sometimes called a Stokes basket, is designed for patient movement over difficult terrain. Appropriate spinal precautions and sufficient personnel should be used when indicated."
  },

  // ============================================================================
  // EXTRICATION
  // ============================================================================

  {
    id: "ops-258",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An EMT can reach an injured driver inside a heavily damaged vehicle. What should the rescue team be doing while the EMT assesses the patient?",
    choices: [
      "Waiting for the EMT to tell them which extrication technique to use.",
      "Determining the extent of entrapment and developing the safest extrication plan.",
      "Beginning an extrication method without communicating with EMS.",
      "Assuming that access to the patient means no difficult extrication is necessary."
    ],
    answerIndex: 1,
    explanation:
      "EMS focuses on patient assessment and treatment, while the rescue team evaluates the vehicle and determines the safest method of extrication. Both teams should communicate continuously."
  },

  {
    id: "ops-259",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Who is primarily responsible for determining the technical method used to free an entrapped patient from a damaged vehicle?",
    choices: [
      "The EMT performing the patient assessment.",
      "The rescue/extrication team.",
      "The receiving hospital nurse.",
      "The dispatcher."
    ],
    answerIndex: 1,
    explanation:
      "The rescue team is responsible for evaluating the vehicle, determining the degree of entrapment, and selecting an appropriate extrication method. EMS personnel provide patient care and communicate the patient's condition and treatment needs."
  },

  // ============================================================================
  // DISPATCH INFORMATION
  // ============================================================================

  {
    id: "ops-260",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You are dispatched for an unconscious patient. Which piece of information is MOST important to establish immediately so that you can locate the patient?",
    choices: [
      "The patient's approximate age.",
      "The caller's telephone number.",
      "The patient's sex.",
      "The exact location of the patient."
    ],
    answerIndex: 3,
    explanation:
      "The crew must know where the patient is before it can provide care. Once the location is confirmed, additional information such as breathing status, age, and other circumstances can help the crew prepare."
  },

  {
    id: "ops-261",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Why is the patient's exact location the most important initial information for a responding EMS crew?",
    choices: [
      "It determines the patient's diagnosis.",
      "It allows the crew to actually locate and reach the patient.",
      "It tells the crew which hospital will receive the patient.",
      "It establishes whether consent is required."
    ],
    answerIndex: 1,
    explanation:
      "Without an accurate location, responders cannot reach the patient. Other dispatch information is useful, but location is the fundamental requirement for accessing the patient."
  },

  // ============================================================================
  // RED HAZMAT PLACARD
  // ============================================================================

  {
    id: "ops-262",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "A tanker involved in a collision displays a red hazardous-material placard. What general hazard class should the EMT associate with the placard?",
    choices: [
      "Radioactive.",
      "Corrosive.",
      "Explosive.",
      "Flammable."
    ],
    answerIndex: 3,
    explanation:
      "A red placard generally indicates a flammable hazard. Responders should consult the appropriate hazardous-material reference and identification number for more specific information."
  },

  {
    id: "ops-263",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What general hazard classification is represented by a red hazardous-material placard?",
    choices: [
      "Flammable.",
      "Radioactive.",
      "Explosive.",
      "Corrosive."
    ],
    answerIndex: 0,
    explanation:
      "Red placards are associated with flammable materials. The placard's identification number provides additional information about the specific material."
  },

  // ============================================================================
  // PROXIMATE CAUSATION
  // ============================================================================

  {
    id: "ops-264",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which situation BEST demonstrates proximate causation in an EMS negligence case?",
    choices: [
      "A patient experiences an unexpected reaction despite appropriate treatment.",
      "A patient refuses recommended spinal precautions and later receives a spinal diagnosis.",
      "An EMT fails to provide a critical intervention, and the patient's resulting deterioration is directly related to that omission.",
      "A patient develops a complication unrelated to the EMT's treatment."
    ],
    answerIndex: 2,
    explanation:
      "Proximate causation involves a direct connection between the provider's action or failure to act and the patient's injury, illness, or death. The key issue is whether the provider's conduct directly contributed to the outcome."
  },

  {
    id: "ops-265",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "In the context of negligence, what does proximate causation describe?",
    choices: [
      "The patient's right to refuse treatment.",
      "A direct relationship between the provider's conduct and the patient's resulting harm.",
      "The EMT's legal authority to treat.",
      "The requirement to document every patient interaction."
    ],
    answerIndex: 1,
    explanation:
      "Proximate causation refers to the direct relationship between the provider's conduct and the patient's injury, illness, or death. It is one element considered when establishing negligence."
  },

  // ============================================================================
  // AMBULANCE CRASHES / INTERSECTIONS
  // ============================================================================

  {
    id: "ops-266",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which location presents a particularly high risk for ambulance collisions?",
    choices: [
      "Parking lots.",
      "Intersections.",
      "Residential driveways.",
      "Hospital loading docks."
    ],
    answerIndex: 1,
    explanation:
      "Intersections are a major collision hazard for emergency vehicles because of cross traffic, limited visibility, and drivers who may not yield as expected. Emergency lights and sirens do not eliminate the need for caution."
  },

  {
    id: "ops-267",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What should an ambulance operator do when approaching an intersection during an emergency response?",
    choices: [
      "Assume other drivers will automatically yield.",
      "Proceed at full speed because the ambulance has the right of way.",
      "Reduce speed, verify that the intersection is clear, and proceed cautiously.",
      "Turn off the siren before entering the intersection."
    ],
    answerIndex: 2,
    explanation:
      "Intersections are a significant collision risk. Emergency vehicle operators must remain alert, reduce speed as appropriate, verify that other traffic has yielded, and proceed cautiously."
  },

  // ============================================================================
  // MCI GOAL / TRANSPORT
  // ============================================================================

  {
    id: "ops-268",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "During a large mass-casualty incident, what should remain the overall operational goal once triage and immediate lifesaving interventions are underway?",
    choices: [
      "Keep every patient at the scene until all assessments are complete.",
      "Transport patients to appropriate medical facilities as efficiently as possible.",
      "Provide prolonged treatment to every patient before moving anyone.",
      "Begin CPR on every pulseless patient regardless of the incident's triage plan."
    ],
    answerIndex: 1,
    explanation:
      "MCI management emphasizes rapid triage, prioritization, efficient use of resources, and movement of patients to appropriate receiving facilities. Treatment and transport priorities are determined by the incident's triage system and available resources."
  },

  {
    id: "ops-269",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is the primary logistical objective of patient management during an MCI?",
    choices: [
      "Keep patients at the scene until every patient has received a complete assessment.",
      "Move patients efficiently to appropriate definitive medical care while using available resources effectively.",
      "Transport only patients with minor injuries.",
      "Provide the same treatment to every patient regardless of triage category."
    ],
    answerIndex: 1,
    explanation:
      "An MCI requires resource-conscious triage and rapid movement of patients toward appropriate definitive care. Treatment priorities are based on triage rather than providing identical care to every patient."
  },
// Converted and reverse-question versions of the supplied EMT question set.
// The questions below preserve the underlying educational concepts while
// using substantially different wording, scenarios, and distractors.

  // ==========================================================================
  // 1. LAW ENFORCEMENT / SCENE SAFETY
  // ==========================================================================

  {
    id: "ops-270",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Dispatch tells you that police officers are already at the location of an injured patient. What should you conclude before entering the scene?",
    choices: [
      "The patient must have life-threatening injuries.",
      "The scene may still present a safety hazard.",
      "Law enforcement has confirmed that EMS can enter.",
      "A criminal investigation has already been completed."
    ],
    answerIndex: 1,
    explanation:
      "The presence of law enforcement means the scene may involve a safety concern, but it does not automatically mean the scene is safe. Contact officers when possible and determine whether EMS can safely enter. Never assume that police presence guarantees scene safety."
  },

  {
    id: "ops-271",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Before approaching a potentially violent or unsecured scene, which action is most appropriate?",
    choices: [
      "Enter quickly before the situation changes.",
      "Wait for law enforcement to establish that the area is safe.",
      "Have your partner approach while you remain in the ambulance.",
      "Assume the scene is safe if police vehicles are visible."
    ],
    answerIndex: 1,
    explanation:
      "EMS personnel should not enter an unsecured scene. Law enforcement should establish scene safety before you approach. The presence of police vehicles alone does not mean that the hazard has been eliminated."
  },


  // ==========================================================================
  // 2. BLS AMBULANCE STAFFING
  // ==========================================================================

  {
    id: "ops-272",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Under the basic federal staffing guideline for a BLS ambulance, what is the minimum requirement for personnel in the patient compartment?",
    choices: [
      "No EMT is required if the driver is trained in first aid.",
      "At least one EMT must be assigned to the patient compartment.",
      "Two EMTs must always remain in the patient compartment.",
      "The ambulance must have two EMTs in addition to the driver."
    ],
    answerIndex: 1,
    explanation:
      "The federal guideline calls for at least one EMT in the patient compartment of a BLS ambulance. State and local regulations may establish additional staffing requirements. The driver does not necessarily have to be an EMT, although the driver must be qualified to operate the emergency vehicle safely."
  },

  {
    id: "ops-273",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which statement best describes the federal minimum staffing guideline for a BLS ambulance?",
    choices: [
      "There must be an EMT assigned to patient care in the rear compartment.",
      "The driver must always hold an EMT certification.",
      "Two EMTs must accompany every BLS transport.",
      "Only a paramedic may serve as the patient-care provider."
    ],
    answerIndex: 0,
    explanation:
      "The minimum federal guideline requires at least one EMT in the patient compartment. Specific staffing rules can differ between states and EMS systems."
  },


  // ==========================================================================
  // 3. BODY MECHANICS
  // ==========================================================================

  {
    id: "ops-274",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You and your partner are preparing to move a heavy patient from the floor to a stretcher. Which technique will best reduce the risk of injury?",
    choices: [
      "Hold the patient away from your body to improve visibility.",
      "Bend and twist your back while lifting.",
      "Keep the load close to your body while lifting with your legs.",
      "Use your lower back muscles to generate most of the lifting force."
    ],
    answerIndex: 2,
    explanation:
      "Keeping the weight close to your body reduces the mechanical strain placed on your back. EMTs should maintain a stable, relatively straight back, lift primarily with their legs, and avoid twisting while carrying or moving patients."
  },

  {
    id: "ops-275",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which practice is most consistent with proper EMT lifting mechanics?",
    choices: [
      "Keep the object close to your center of gravity.",
      "Rotate your torso while carrying the patient around a corner.",
      "Straighten your legs while keeping your back bent.",
      "Use your lower back as the primary lifting muscle group."
    ],
    answerIndex: 0,
    explanation:
      "Keeping the load close to your body decreases the force placed on the spine. Proper lifting also involves using the legs and avoiding bending, twisting, or reaching unnecessarily."
  },


  // ==========================================================================
  // 4. HAZMAT / TANKER
  // ==========================================================================

  {
    id: "ops-276",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Your crew arrives at a tanker truck crash and observes an unknown liquid leaking from the vehicle. A trapped occupant appears injured. What is the safest initial action?",
    choices: [
      "Approach the tanker wearing standard EMS gloves.",
      "Move the ambulance close to the truck for rapid patient access.",
      "Position yourself in a safe area upwind and uphill and await appropriately equipped responders.",
      "Approach the leaking area to determine the substance by sight."
    ],
    answerIndex: 2,
    explanation:
      "An unknown substance leaking from a tanker should be treated as a potential hazardous-materials incident. Do not enter the contaminated area simply because a patient needs help. Stage from a safe location, preferably upwind and uphill, and request appropriately trained personnel. If identification is possible, it should be performed from a safe distance."
  },

  {
    id: "ops-277",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "At a suspected hazardous-materials scene, where should an ambulance ideally be positioned while awaiting a specialized response team?",
    choices: [
      "Downwind and downhill from the spill",
      "Immediately beside the leaking vehicle",
      "Upwind and uphill from the suspected hazard",
      "Inside the contaminated area so patients can be loaded quickly"
    ],
    answerIndex: 2,
    explanation:
      "Positioning upwind and uphill helps reduce the chance that airborne or flowing hazardous material will reach the ambulance and crew. EMS personnel without appropriate HazMat training and protective equipment should not enter the hazard area."
  },


  // ==========================================================================
  // 5. HELICOPTER LANDING ZONE
  // ==========================================================================

  {
    id: "ops-278",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "When preparing a landing zone for a typical air medical helicopter, which approximate area is commonly recommended?",
    choices: [
      "40 ft × 40 ft",
      "60 ft × 60 ft",
      "100 ft × 100 ft",
      "150 ft × 150 ft"
    ],
    answerIndex: 2,
    explanation:
      "A 100-foot by 100-foot area is commonly recommended for a helicopter landing zone, although requirements vary by aircraft and flight service. The landing area should be level and firm, and the flight crew's specific instructions should always be followed."
  },

  {
    id: "ops-279",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which approximate dimension is commonly used as a target when establishing a helicopter landing zone?",
    choices: [
      "25 ft × 25 ft",
      "50 ft × 50 ft",
      "100 ft × 100 ft",
      "250 ft × 250 ft"
    ],
    answerIndex: 2,
    explanation:
      "A 100-foot by 100-foot landing zone is a commonly recommended target. Actual requirements can vary depending on the helicopter and flight service, so the flight crew's instructions take precedence."
  },


  // ==========================================================================
  // 6. VESICANTS
  // ==========================================================================

  {
    id: "medical-007",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient has been exposed to a chemical blistering agent. Which finding would most strongly suggest exposure to a vesicant?",
    choices: [
      "Progressive skin blister formation",
      "Isolated slow heart rate",
      "Dark blood in the emesis",
      "Severe muscle fasciculations without skin findings"
    ],
    answerIndex: 0,
    explanation:
      "Vesicants are blister-forming chemical agents. Skin irritation and blistering are characteristic findings. Examples include sulfur mustard, Lewisite, and phosgene oxime. Respiratory exposure can also damage moist tissues of the airway."
  },

  {
    id: "medical-008",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which clinical finding would be most characteristic of a patient exposed to a blister agent?",
    choices: [
      "Vesicles and burn-like lesions on exposed skin",
      "Isolated hypertension without skin changes",
      "Sudden painless hematuria",
      "Generalized muscle paralysis without respiratory involvement"
    ],
    answerIndex: 0,
    explanation:
      "Vesicants characteristically damage the skin and can produce burn-like blisters. Exposure can also affect moist tissues, including the respiratory tract."
  },


  // ==========================================================================
  // 7. STANDING ORDERS
  // ==========================================================================

  {
    id: "ops-280",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which situation demonstrates an EMT performing an intervention under a standing order rather than waiting for direct medical-control authorization?",
    choices: [
      "Calling medical control before assisting with a patient's prescribed medication",
      "Calling the patient's physician to ask about care for a chronic condition",
      "Using an AED to analyze and defibrillate a pulseless patient, then continuing CPR",
      "Contacting the base physician to obtain permission before administering a protocol-approved medication"
    ],
    answerIndex: 2,
    explanation:
      "Standing orders authorize certain interventions without first obtaining direct permission from medical control. AED analysis and defibrillation during cardiac arrest are examples of interventions that may be performed under standing orders. Exact authorization depends on local protocols."
  },

  {
    id: "ops-281",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What is the defining feature of an EMS intervention performed under a standing order?",
    choices: [
      "The EMT must obtain permission from medical control immediately beforehand.",
      "The EMT may perform the intervention when protocol criteria are met without first contacting medical control.",
      "Only a physician may perform the intervention.",
      "The intervention is performed only after the patient arrives at the hospital."
    ],
    answerIndex: 1,
    explanation:
      "Standing orders allow EMS clinicians to perform specified interventions when the required criteria are met without first contacting medical control. Local protocols determine which interventions are covered."
  },


  // ==========================================================================
  // 8. BURNOUT
  // ==========================================================================

  {
    id: "ops-282",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An experienced EMT has become increasingly exhausted, irritable, and disengaged from work over a prolonged period. Which condition best explains this pattern?",
    choices: [
      "Burnout",
      "Delirium",
      "Acute stress reaction",
      "Isolated hypoglycemia"
    ],
    answerIndex: 0,
    explanation:
      "Burnout develops from prolonged occupational stress and may involve emotional exhaustion, irritability, frustration, and loss of motivation. Acute stress reactions generally follow a specific sudden event, while delirium involves an acute disturbance in cognition."
  },

  {
    id: "ops-283",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which EMS provider is displaying the clearest signs of occupational burnout?",
    choices: [
      "A provider who becomes briefly anxious immediately after a difficult call",
      "A provider who has been chronically fatigued, frustrated, and increasingly detached from work",
      "A provider who becomes confused after developing severe hypoglycemia",
      "A provider who experiences a brief startle response after a loud noise"
    ],
    answerIndex: 1,
    explanation:
      "Persistent fatigue, frustration, irritability, and emotional disengagement after prolonged occupational stress are characteristic of burnout. The other examples describe acute reactions or altered mental status from another cause."
  },


  // ==========================================================================
  // 9. MCI TRIAGE / HYSTERICAL PATIENT
  // ==========================================================================

  {
    id: "ops-284",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "During a mass-casualty incident, an ambulatory patient with only minor injuries becomes extremely hysterical and is interfering with triage operations. What is the most appropriate disposition?",
    choices: [
      "Immediately classify the patient as delayed and leave him at the scene.",
      "Assign an immediate priority and move him away from the incident area.",
      "Have another patient supervise him while triage continues.",
      "Remain with him until he becomes calm before assigning a triage category."
    ],
    answerIndex: 1,
    explanation:
      "A hysterical or disruptive patient can interfere with the triage and rescue process and may increase panic among other patients. In this circumstance, the patient may need to be treated as an immediate priority and moved away from the scene despite having only minor physical injuries."
  },

  {
    id: "ops-285",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "During MCI triage, which situation may justify moving an otherwise minimally injured patient away from the triage area as an immediate priority?",
    choices: [
      "The patient calmly follows all instructions.",
      "The patient has a minor abrasion but is cooperative.",
      "The patient is highly agitated and is disrupting triage and rescue activities.",
      "The patient has a minor isolated extremity injury and no behavioral concerns."
    ],
    answerIndex: 2,
    explanation:
      "A severely hysterical or disruptive patient can interfere with the overall rescue operation and contribute to panic. Such a patient may be assigned an immediate priority and removed from the main incident area even when the physical injuries are minor."
  },


  // ==========================================================================
  // 10. PRESUMPTIVE VS DEFINITIVE SIGNS OF DEATH
  // ==========================================================================

  {
    id: "cardiology-021",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "You find an elderly patient who is unresponsive, apneic, and pulseless with cyanotic skin. No obvious injury incompatible with life is present. What should you do?",
    choices: [
      "Withhold resuscitation because cyanosis confirms death.",
      "Begin CPR and apply the AED as soon as possible.",
      "Wait for medical control to authorize CPR.",
      "Search for a DNR before beginning any resuscitative care."
    ],
    answerIndex: 1,
    explanation:
      "Unresponsiveness, apnea, pulselessness, and cyanosis are presumptive rather than definitive signs of death. In the absence of definitive signs such as rigor mortis, livor mortis, putrefaction, or injuries incompatible with life, begin resuscitation and use the AED when available. A valid DNR can alter the plan, but treatment should not be unnecessarily delayed while searching for documentation."
  },

  {
    id: "cardiology-022",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which finding would be considered a definitive indication that resuscitation should not be initiated?",
    choices: [
      "Cyanotic skin",
      "Unresponsiveness",
      "Apnea",
      "Rigor mortis"
    ],
    answerIndex: 3,
    explanation:
      "Rigor mortis is a definitive sign of death. Cyanosis, apnea, and unresponsiveness alone are presumptive signs and do not by themselves justify withholding resuscitation."
  },


  // ==========================================================================
  // 11. IMPLIED CONSENT
  // ==========================================================================

  {
    id: "medical-009",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which patient most clearly lacks the ability to provide informed consent and therefore may require treatment under implied consent?",
    choices: [
      "An alert adult with a minor ankle injury",
      "An alert teenager with an isolated arm injury",
      "A confused adult with signs strongly suggesting an acute stroke",
      "An alert adult who refuses transport after understanding the risks"
    ],
    answerIndex: 2,
    explanation:
      "Implied consent applies when a patient cannot provide informed consent, such as an unresponsive or significantly altered patient. A confused patient with suspected stroke may lack decision-making capacity and can generally be treated under the emergency doctrine, following local laws and protocols."
  },

  {
    id: "medical-010",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which situation is the best example of an emergency in which consent for treatment may be presumed?",
    choices: [
      "A competent adult refuses evaluation after hearing the risks.",
      "A confused patient appears to be experiencing a major stroke.",
      "An alert patient requests transportation for a nonemergency complaint.",
      "A competent patient asks EMS to wait before beginning an examination."
    ],
    answerIndex: 1,
    explanation:
      "When a patient lacks decision-making capacity during an apparent emergency, EMS may generally presume that the patient would consent to necessary treatment. This is commonly referred to as implied consent or the emergency doctrine."
  },


  // ==========================================================================
  // 12. MCI MEDICAL AUTHORITY
  // ==========================================================================

  {
    id: "ops-286",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "During a mass-casualty incident, who has ultimate authority over clinical patient-care decisions?",
    choices: [
      "The incident commander",
      "The treatment-area supervisor",
      "The most experienced EMT on scene",
      "The EMS medical director"
    ],
    answerIndex: 3,
    explanation:
      "The EMS medical director has ultimate authority regarding patient-care decisions. The incident commander oversees the overall incident, including logistics and operations, while treatment officers supervise care within their assigned area."
  },

  {
    id: "ops-287",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which role is responsible for the medical direction of patient-care decisions during an MCI?",
    choices: [
      "Incident commander",
      "EMS medical director",
      "Treatment officer",
      "Ambulance staging officer"
    ],
    answerIndex: 1,
    explanation:
      "The EMS medical director retains ultimate authority for clinical patient-care decisions during an MCI. The incident commander manages the broader incident, while operational officers coordinate specific functions under that command structure."
  },


  {
    id: "ops-288",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Following a particularly traumatic EMS call, a formal critical incident stress debriefing should generally be completed within what maximum time frame?",
    choices: [
      "12 hours",
      "24 hours",
      "72 hours",
      "7 days",
    ],
    answerIndex: 2,
    explanation:
      "Critical incident stress debriefing is generally conducted within 72 hours of the incident. The other time frames are either unnecessarily short or extend beyond the usual recommended window.",
  },

  {
    id: "ops-289",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which piece of equipment or intervention is commonly taught across all levels of prehospital emergency care?",
    choices: [
      "12-lead ECG interpretation",
      "Automated external defibrillator use",
      "Intravenous medication administration",
      "Needle thoracostomy",
    ],
    answerIndex: 1,
    explanation:
      "AED use is a foundational resuscitation skill taught throughout prehospital education. The other procedures require training beyond the basic level.",
  },

  {
    id: "ops-290",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMT notices that stress from repeated difficult calls seems to come and go rather than remaining obvious after every shift. Which principle of cumulative stress does this demonstrate?",
    choices: [
      "Stress reactions are always immediately obvious",
      "Cumulative stress symptoms may be intermittent or subtle",
      "Cumulative stress only occurs after one unusually severe call",
      "Stress reactions occur only while an EMT is on duty",
    ],
    answerIndex: 1,
    explanation:
      "Cumulative stress may produce symptoms that are intermittent, subtle, or difficult to recognize. The absence of obvious symptoms at a particular moment does not mean stress is absent.",
  },

  {
    id: "ops-291",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is one of the most important purposes of an accurate patient care report?",
    choices: [
      "To replace the receiving provider's assessment",
      "To establish continuity of patient care",
      "To determine the patient's insurance coverage",
      "To eliminate the need for an oral handoff",
    ],
    answerIndex: 1,
    explanation:
      "The PCR communicates important patient information and interventions between providers, supporting continuity of care. It does not replace an oral handoff or determine insurance coverage.",
  },

  {
    id: "ops-292",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which patient is receiving an intervention that is generally considered basic life support rather than advanced life support?",
    choices: [
      "A patient receiving glucagon for severe hypoglycemia",
      "A patient receiving needle decompression for tension pneumothorax",
      "A cardiac arrest patient being treated with an AED",
      "A patient whose airway is secured with an advanced airway device",
    ],
    answerIndex: 2,
    explanation:
      "AED defibrillation is a BLS intervention and is within the scope of appropriately trained EMTs. Glucagon administration, needle decompression, and advanced airway placement are examples of advanced interventions depending on jurisdiction and scope.",
  },

  {
    id: "ops-293",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Before accepting a patient's decision to decline EMS treatment, an EMT should make sure the patient understands the risks, benefits, and alternatives. This is known as:",
    choices: [
      "implied consent",
      "informed refusal",
      "abandonment",
      "expressed consent",
    ],
    answerIndex: 1,
    explanation:
      "An informed refusal occurs when a patient with decision-making capacity understands the proposed care, the consequences of refusing it, and available alternatives before declining treatment or transport.",
  },

  {
    id: "ops-294",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which situation best describes negligence by an EMS provider?",
    choices: [
      "Following an accepted treatment protocol",
      "Providing care that falls below the expected standard and causes additional harm",
      "Refusing to perform a procedure outside the provider's scope",
      "Documenting a patient's refusal of transport",
    ],
    answerIndex: 1,
    explanation:
      "Negligence involves a failure to provide the level of care reasonably expected under the circumstances, with resulting harm or injury. Following scope and protocol does not constitute negligence by itself.",
  },

  {
    id: "ops-295",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which example most clearly represents abandonment?",
    choices: [
      "A paramedic transfers care to an EMT who is legally authorized to continue caring for the patient",
      "An EMT transfers a patient to hospital staff after giving a complete report",
      "A provider leaves a patient before another qualified provider has assumed responsibility",
      "An EMT requests additional resources for a critically ill patient",
    ],
    answerIndex: 2,
    explanation:
      "Abandonment occurs when a provider terminates the established provider-patient relationship without ensuring that an appropriately qualified provider has assumed responsibility.",
  },

  {
    id: "ops-296",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You accidentally sustain a needlestick while helping an ALS crew. What should you do?",
    choices: [
      "Ignore it if there is no visible bleeding",
      "Wait until symptoms develop before reporting it",
      "Report the exposure through the appropriate occupational-health or supervisory process",
      "Only document it if the patient is known to have an infectious disease",
    ],
    answerIndex: 2,
    explanation:
      "A needlestick is an occupational exposure and should be reported promptly according to agency policy so appropriate evaluation, documentation, and follow-up can occur.",
  },

  {
    id: "ops-297",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "A tuberculin skin test becomes positive several days after an EMT cared for a patient with tuberculosis. What does the result primarily indicate?",
    choices: [
      "The EMT currently has active tuberculosis",
      "The EMT has been exposed to tuberculosis bacteria",
      "The EMT is immune to tuberculosis",
      "The EMT developed tuberculosis during that specific call",
    ],
    answerIndex: 1,
    explanation:
      "A positive tuberculin skin test indicates prior exposure or infection with tuberculosis bacteria. It does not by itself establish active disease or prove when exposure occurred.",
  },

  {
    id: "ops-298",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "When communicating with a patient who has hearing impairment, which approach should generally be avoided?",
    choices: [
      "Maintaining visual contact",
      "Speaking clearly at a normal volume",
      "Using written communication when helpful",
      "Shouting and exaggerating pronunciation",
    ],
    answerIndex: 3,
    explanation:
      "Shouting or dramatically exaggerating pronunciation can make communication more difficult. Clear speech, visual contact, and written communication may be more effective.",
  },

  {
    id: "ops-299",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Effective EMS radio transmissions should generally be:",
    choices: [
      "long and highly detailed",
      "brief, clear, and easy to understand",
      "filled with agency-specific slang",
      "delivered as quickly as possible",
    ],
    answerIndex: 1,
    explanation:
      "Radio communications should be concise and clearly understood so important information can be transmitted efficiently without unnecessary radio traffic.",
  },

  {
    id: "ops-300",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "From a legal documentation standpoint, an intervention that was actually performed but completely omitted from the PCR may be treated as:",
    choices: [
      "automatically authorized",
      "not having been performed",
      "confidential information",
      "a verbal order",
    ],
    answerIndex: 1,
    explanation:
      "If an intervention is not documented, it can be extremely difficult to establish that it occurred. Accurate documentation is therefore an essential part of patient care and legal protection.",
  },

  {
    id: "ops-301",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "While preserving evidence at a crime scene, how should an EMT handle clothing containing a bullet or knife-related hole?",
    choices: [
      "Cut directly through the hole",
      "Remove the damaged section immediately",
      "Avoid cutting through the damaged area",
      "Wash the clothing before transport",
    ],
    answerIndex: 2,
    explanation:
      "Cutting through a damaged portion of clothing can destroy or alter evidence. When possible, the EMT should cut away from holes or other areas that may contain forensic evidence.",
  },

  {
    id: "ops-302",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "When beginning an oral patient report, which combination of information is most appropriate to identify the patient and reason for the encounter?",
    choices: [
      "Age, sex, and chief complaint",
      "Name, insurance provider, and address",
      "Blood type, occupation, and medication list",
      "Weight, height, and past surgical history",
    ],
    answerIndex: 0,
    explanation:
      "The patient's age, sex, and chief complaint or mechanism of injury provide a concise opening description of the encounter.",
  },

  {
    id: "ops-303",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Who provides the medical oversight that authorizes EMTs to perform patient-care procedures in the field?",
    choices: [
      "The hospital charge nurse",
      "The EMS dispatcher",
      "The medical director",
      "The ambulance driver",
    ],
    answerIndex: 2,
    explanation:
      "The medical director provides medical oversight for an EMS system and establishes or authorizes clinical practice within the system.",
  },

  {
    id: "ops-304",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "A radio system in which the user must press a button to transmit and release it to hear incoming communication is called:",
    choices: [
      "duplex",
      "simplex",
      "multiplex",
      "digital relay",
    ],
    answerIndex: 1,
    explanation:
      "Simplex communication uses the same communication path for transmission and reception, so the user transmits by pressing the push-to-talk button and listens after releasing it.",
  },

  {
    id: "ops-305",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "A major purpose of OSHA workplace requirements is to:",
    choices: [
      "determine the medical director's protocols",
      "reduce occupational exposure and workplace hazards",
      "determine ambulance destination",
      "establish patient treatment priorities",
    ],
    answerIndex: 1,
    explanation:
      "OSHA regulations are intended to protect workers by reducing occupational hazards, including exposure to infectious materials and other workplace risks.",
  },

  {
    id: "ops-306",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMT administers a medication incorrectly because the EMT did not understand important information about that medication. This is best classified as:",
    choices: [
      "a knowledge-based error",
      "a communication failure",
      "a mechanical failure",
      "an unavoidable complication",
    ],
    answerIndex: 0,
    explanation:
      "A knowledge-based error occurs when a provider lacks or fails to apply necessary knowledge. Not knowing important information about a medication is an example.",
  },

  {
    id: "ops-307",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which statement about Good Samaritan protections is generally correct?",
    choices: [
      "They guarantee immunity from every lawsuit",
      "They protect providers even when they commit gross negligence",
      "They may not protect a provider who acts with gross negligence",
      "They eliminate the need for reasonable care",
    ],
    answerIndex: 2,
    explanation:
      "Good Samaritan protections generally encourage emergency assistance by offering legal protection under specified circumstances, but they do not ordinarily protect grossly negligent conduct.",
  },

  {
    id: "ops-308",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which circumstance would generally NOT create a legal duty for an off-duty EMT to intervene?",
    choices: [
      "The EMT's agency policy requires off-duty members to assist",
      "The EMT is formally dispatched to an emergency",
      "The EMT voluntarily encounters an emergency while off duty without another duty-creating circumstance",
      "The EMT is assigned to an EMS response",
    ],
    answerIndex: 2,
    explanation:
      "An off-duty EMT does not automatically have a legal duty to act merely because the EMT witnesses an emergency. A duty may arise from employment, agency policy, dispatch, or other circumstances.",
  },

  {
    id: "ops-309",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "When is patient care formally transferred to hospital personnel?",
    choices: [
      "When the ambulance enters the hospital parking lot",
      "When the EMT gives a report to an appropriate receiving provider",
      "When the patient is moved into the emergency department",
      "When the PCR is printed",
    ],
    answerIndex: 1,
    explanation:
      "Transfer of care occurs when responsibility is formally accepted by an appropriately qualified receiving provider, generally accompanied by an oral report.",
  },

  {
    id: "ops-310",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which occupational exposure is a particularly common route for transmission of bloodborne pathogens such as HIV and hepatitis viruses?",
    choices: [
      "Hearing a patient's cough",
      "Touching intact skin",
      "Improper handling of contaminated sharps",
      "Standing near a patient",
    ],
    answerIndex: 2,
    explanation:
      "Improper handling of needles and other contaminated sharps can expose EMS personnel to infected blood and is an important occupational transmission risk.",
  },

  {
    id: "ops-311",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You are treating an unconscious patient in cardiac arrest, but no valid DNR or advance directive can be located. What should you do?",
    choices: [
      "Wait for family members before beginning treatment",
      "Begin resuscitative efforts",
      "Transport without providing treatment",
      "Assume that the patient refuses resuscitation",
    ],
    answerIndex: 1,
    explanation:
      "When no valid limitation on resuscitation can be confirmed, EMS providers generally initiate resuscitative care according to protocol.",
  },

  {
    id: "ops-312",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "You accidentally document a blood pressure incorrectly on a paper PCR. What is the appropriate way to correct the entry?",
    choices: [
      "Erase the original value completely",
      "Cover the original value with correction fluid",
      "Draw a single line through the error, initial it, and enter the correct value",
      "Destroy the PCR and start over",
    ],
    answerIndex: 2,
    explanation:
      "Paper medical records should preserve the original entry. A single line through the error, followed by the correction and appropriate initials, maintains an audit trail.",
  },

  {
    id: "ops-313",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which aspect of HIPAA is especially important to EMS personnel?",
    choices: [
      "Protecting patient health information and privacy",
      "Determining which hospital receives every patient",
      "Establishing ambulance staffing requirements",
      "Replacing state EMS regulations",
    ],
    answerIndex: 0,
    explanation:
      "HIPAA includes requirements for protecting individually identifiable health information. EMS personnel must safeguard patient information and disclose it appropriately.",
  },

  {
    id: "ops-314",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which item would generally NOT be part of a concise routine oral report to the receiving hospital?",
    choices: [
      "The patient's chief complaint",
      "Important medical history",
      "The patient's response to treatment",
      "Every individual vital sign obtained throughout the entire encounter",
    ],
    answerIndex: 3,
    explanation:
      "An oral report should contain clinically relevant information without overwhelming the receiving team with unnecessary details. A concise summary of important findings and trends is preferred.",
  },

  {
    id: "ops-315",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which behavior is most likely to help calm an anxious patient?",
    choices: [
      "Using unexplained medical terminology",
      "Positioning yourself above the patient",
      "Maintaining appropriate eye contact",
      "Avoiding communication about the patient's condition",
    ],
    answerIndex: 2,
    explanation:
      "Appropriate eye contact can demonstrate attention and reassurance. The EMT should also communicate clearly and respectfully rather than using confusing terminology.",
  },

  {
    id: "ops-316",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which radio practice should EMS personnel avoid?",
    choices: [
      "Speaking clearly",
      "Acknowledging important transmissions",
      "Using plain language",
      "Using 10-codes as a substitute for clear communication",
    ],
    answerIndex: 3,
    explanation:
      "Plain language improves interoperability and reduces confusion. Ten-codes can have different meanings between agencies and should not be relied upon to create confidentiality.",
  },

  {
    id: "ops-317",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Why do EMS treatment guidelines change as new evidence becomes available?",
    choices: [
      "Protocols must legally change every five years",
      "Research may show that the effectiveness or risks of an intervention have changed",
      "Every new disease requires completely new protocols",
      "EMS providers are required to change procedures every year",
    ],
    answerIndex: 1,
    explanation:
      "Evidence-based EMS practice evolves as research provides new information about which interventions are effective, ineffective, or potentially harmful.",
  },

  {
    id: "ops-318",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "After a patient's loved one dies, an EMT repeatedly tells the family that the death was 'for the best.' How might this communication be perceived?",
    choices: [
      "As an attempt to minimize the family's grief",
      "As a formal diagnosis of grief",
      "As a required part of bereavement counseling",
      "As evidence that the EMT understands exactly how they feel",
    ],
    answerIndex: 0,
    explanation:
      "Clichés or trite reassurance can unintentionally minimize someone's grief. Active listening and compassionate, honest support are generally more appropriate.",
  },

  {
    id: "ops-319",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMT becomes distracted and unusually anxious at a crash involving a vehicle that resembles one involved in a previous fatal pediatric collision. This is most consistent with:",
    choices: [
      "normal fatigue",
      "a traumatic stress trigger",
      "hypoglycemia",
      "cumulative dehydration",
    ],
    answerIndex: 1,
    explanation:
      "A situation that resembles a previous traumatic event can trigger a strong psychological response. The association with the earlier event is an important clue.",
  },

  // ============================================================================
  // AIRWAY
  // ============================================================================

  {
    id: "airway-049",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with severe respiratory distress is awake, follows commands, and has signs consistent with acute pulmonary edema. Which intervention may be appropriate when available under protocol?",
    choices: [
      "CPAP",
      "Oropharyngeal airway insertion",
      "Blind finger sweep",
      "Immediate oral glucose",
    ],
    answerIndex: 0,
    explanation:
      "CPAP can improve oxygenation and reduce the work of breathing in appropriately selected patients with conditions such as acute pulmonary edema. The patient must be able to protect the airway and cooperate with the treatment.",
  },

  {
    id: "airway-050",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "During severe stress or hypoperfusion, activation of the sympathetic nervous system causes the release of epinephrine. Which cardiovascular response would you expect?",
    choices: [
      "Decreased heart rate",
      "Increased heart rate",
      "Complete cessation of cardiac activity",
      "Profound slowing of conduction",
    ],
    answerIndex: 1,
    explanation:
      "Epinephrine stimulates beta-1 receptors in the heart, increasing heart rate and contractility. This is part of the body's compensatory response to inadequate perfusion.",
  },

  {
    id: "airway-051",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which patient presentation is most consistent with adequate breathing?",
    choices: [
      "Rapid respirations with retractions and cool skin",
      "Normal-rate respirations with equal chest movement and normal skin color",
      "Shallow respirations with cyanosis",
      "Irregular respirations accompanied by altered mental status",
    ],
    answerIndex: 1,
    explanation:
      "Adequate breathing is characterized by effective chest movement, an appropriate rate and pattern, and signs of adequate oxygenation. Retractions, cyanosis, and abnormal mental status suggest respiratory compromise.",
  },

  {
    id: "airway-052",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which approach is most useful when trying to determine the underlying cause of a patient's medical complaint?",
    choices: [
      "Relying exclusively on the dispatch information",
      "Asking focused questions about the chief complaint",
      "Avoiding questions that allow the patient to elaborate",
      "Obtaining only a blood pressure",
    ],
    answerIndex: 1,
    explanation:
      "Focused questioning about the chief complaint helps establish onset, associated symptoms, provoking factors, history, and other information needed to determine the likely nature of illness.",
  },

  {
    id: "airway-053",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "The diaphragm can function automatically without conscious control. Which situation demonstrates this particularly well?",
    choices: [
      "Performing a voluntary breath hold",
      "Sleeping",
      "Speaking loudly",
      "Blowing up a balloon",
    ],
    answerIndex: 1,
    explanation:
      "During sleep, breathing continues automatically through neural control of the respiratory muscles, including the diaphragm.",
  },

  {
    id: "airway-054",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which structure is a leaf-shaped flap that helps prevent food and liquid from entering the larynx during swallowing?",
    choices: [
      "Uvula",
      "Epiglottis",
      "Vocal cord",
      "Hard palate",
    ],
    answerIndex: 1,
    explanation:
      "The epiglottis is a leaf-shaped structure associated with protecting the airway during swallowing.",
  },

  {
    id: "airway-055",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "For many medical emergencies, prehospital treatment is primarily directed toward:",
    choices: [
      "Definitively curing the underlying disease",
      "Treating immediate symptoms and physiologic problems",
      "Replacing hospital-based diagnostic testing",
      "Determining the patient's long-term prognosis",
    ],
    answerIndex: 1,
    explanation:
      "EMS generally provides stabilization and treatment of immediate threats and symptoms rather than definitive treatment of the underlying disease.",
  },

  {
    id: "airway-056",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An EMT's awareness that a patient may have a serious condition that is not immediately obvious is known as:",
    choices: [
      "scene size-up",
      "index of suspicion",
      "expressed consent",
      "transfer of care",
    ],
    answerIndex: 1,
    explanation:
      "An index of suspicion is the provider's awareness that a potentially serious underlying injury or illness may exist even when obvious signs are absent.",
  },

  {
    id: "airway-057",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which structure belongs to the upper airway rather than the lower airway?",
    choices: [
      "Alveoli",
      "Bronchioles",
      "Epiglottis",
      "Trachea",
    ],
    answerIndex: 2,
    explanation:
      "The epiglottis is associated with the upper airway. The trachea, bronchioles, and alveoli are part of the lower respiratory tract.",
  },

  {
    id: "airway-058",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "The jaw-thrust maneuver is particularly useful when an EMT needs to open the airway of a patient with suspected:",
    choices: [
      "isolated abdominal trauma",
      "cervical spine injury",
      "hypoglycemia",
      "pulmonary edema",
    ],
    answerIndex: 1,
    explanation:
      "The jaw-thrust maneuver can open the airway while minimizing movement of the cervical spine, making it useful when spinal injury is suspected.",
  },

  {
    id: "airway-059",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "When cells lack sufficient oxygen, which metabolic change occurs?",
    choices: [
      "Glucose is completely converted with no byproducts",
      "Anaerobic metabolism increases and lactate accumulates",
      "Carbon dioxide production immediately stops",
      "ATP production becomes unlimited",
    ],
    answerIndex: 1,
    explanation:
      "Insufficient oxygen causes cells to rely more heavily on anaerobic metabolism, which produces less usable energy and contributes to lactate accumulation.",
  },

  {
    id: "airway-060",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An unresponsive patient begins to gag forcefully immediately after an oropharyngeal airway is inserted. What should you do?",
    choices: [
      "Push the airway farther into the mouth",
      "Leave it in place and ignore the gagging",
      "Remove the airway and prepare to suction if needed",
      "Immediately insert a second OPA",
    ],
    answerIndex: 2,
    explanation:
      "Gagging indicates that the patient may have an intact gag reflex and is not an appropriate candidate for an OPA. Remove it and be prepared to manage secretions or use an appropriate alternative airway adjunct.",
  },

  {
    id: "airway-061",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "During normal inhalation, contraction of the diaphragm and intercostal muscles causes:",
    choices: [
      "an increase in intrathoracic pressure",
      "a decrease in intrathoracic pressure",
      "the lungs to collapse",
      "air to leave the lungs",
    ],
    answerIndex: 1,
    explanation:
      "Contraction of the diaphragm and other inspiratory muscles expands the thoracic cavity, lowering intrathoracic pressure and drawing air into the lungs.",
  },

  {
    id: "airway-062",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient tells you, 'I feel like I cannot get enough air.' Which term best describes this symptom?",
    choices: [
      "Apnea",
      "Dyspnea",
      "Bradypnea",
      "Hemoptysis",
    ],
    answerIndex: 1,
    explanation:
      "Dyspnea is the subjective sensation of difficult or uncomfortable breathing, commonly described as shortness of breath.",
  },

  {
    id: "airway-063",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which condition would be least likely to produce hyperventilation?",
    choices: [
      "Anxiety",
      "Aspirin toxicity",
      "Metabolic disturbance associated with severe hyperglycemia",
      "Opioid overdose",
    ],
    answerIndex: 3,
    explanation:
      "Opioids commonly cause respiratory depression and hypoventilation rather than hyperventilation. Anxiety, salicylate toxicity, and certain metabolic disturbances can increase respiratory drive.",
  },

  {
    id: "airway-064",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "You find an unconscious patient lying prone with no witnesses available to explain what happened. What should be done first?",
    choices: [
      "Leave the patient prone and obtain a history",
      "Move the patient as a unit into a position that allows assessment and airway management",
      "Immediately administer oral glucose",
      "Begin a secondary assessment before repositioning",
    ],
    answerIndex: 1,
    explanation:
      "An unconscious patient must be positioned so the airway and breathing can be assessed and managed. When trauma is possible, the patient should be moved using appropriate spinal precautions and coordinated movement.",
  },

  {
    id: "airway-065",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "The primary site of pulmonary gas exchange is the:",
    choices: [
      "larynx",
      "trachea",
      "alveoli",
      "pharynx",
    ],
    answerIndex: 2,
    explanation:
      "Oxygen and carbon dioxide are exchanged across the thin alveolar-capillary membrane in the alveoli.",
  },

  {
    id: "airway-066",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A harsh, high-pitched sound heard primarily during inspiration is called:",
    choices: [
      "rales",
      "stridor",
      "rhonchi",
      "pleural rub",
    ],
    answerIndex: 1,
    explanation:
      "Stridor is a harsh, high-pitched sound usually associated with upper-airway narrowing and is especially concerning when heard during inspiration.",
  },

  {
    id: "airway-067",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which structure is part of the lower respiratory tract?",
    choices: [
      "Oropharynx",
      "Pharynx",
      "Bronchus",
      "Epiglottis",
    ],
    answerIndex: 2,
    explanation:
      "The bronchi are part of the lower respiratory tract. The pharynx, oropharynx, and epiglottis are associated with the upper airway.",
  },

  {
    id: "airway-068",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "In a child, a capillary refill time significantly longer than approximately 2 seconds may indicate:",
    choices: [
      "excellent peripheral perfusion",
      "poor peripheral perfusion",
      "hyperglycemia",
      "normal dehydration",
    ],
    answerIndex: 1,
    explanation:
      "A prolonged capillary refill time can be a sign of decreased peripheral perfusion, although it should be interpreted along with the patient's overall clinical presentation.",
  },

  {
    id: "airway-069",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient's positive tuberculosis screening test shortly after caring for someone with TB does not necessarily prove that the recent EMS call caused the result because:",
    choices: [
      "TB testing cannot detect exposure",
      "the infection may have been acquired during an earlier exposure",
      "TB can only be transmitted by food",
      "a positive test proves active disease",
    ],
    answerIndex: 1,
    explanation:
      "A positive TB screening test can reflect an earlier exposure. The timing of the test does not establish when the exposure occurred.",
  },

  // ============================================================================
  // CARDIOLOGY
  // ============================================================================

  {
    id: "cardiology-023",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient develops shock because widespread vascular dilation causes blood to collect in peripheral vascular beds. What type of shock is this?",
    choices: [
      "Cardiogenic",
      "Distributive",
      "Obstructive",
      "Hemorrhagic",
    ],
    answerIndex: 1,
    explanation:
      "Distributive shock involves abnormal vasodilation and maldistribution of circulating blood volume. Septic, anaphylactic, and neurogenic shock are examples.",
  },

  {
    id: "cardiology-024",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which two phases make up the basic mechanical process of breathing?",
    choices: [
      "Perfusion and diffusion",
      "Inspiration and expiration",
      "Systole and diastole",
      "Ventilation and circulation",
    ],
    answerIndex: 1,
    explanation:
      "Ventilation consists of inspiration, when air enters the lungs, and expiration, when air leaves them.",
  },

  {
    id: "cardiology-025",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which statement best describes the hypoxic drive?",
    choices: [
      "It is the primary breathing stimulus in healthy adults",
      "It stimulates ventilation in response to low oxygen levels",
      "It means oxygen should never be given to patients with chronic lung disease",
      "It is triggered by elevated blood glucose",
    ],
    answerIndex: 1,
    explanation:
      "The hypoxic drive refers to respiratory stimulation associated with low arterial oxygen levels. It is not the primary respiratory stimulus in healthy people, and it does not mean supplemental oxygen should be withheld from hypoxemic patients.",
  },

  {
    id: "cardiology-026",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "For oxygen and carbon dioxide to cross efficiently between alveolar air and pulmonary capillary blood, the gases must be able to:",
    choices: [
      "diffuse across the alveolar-capillary membrane",
      "remain inside the bronchi",
      "pass through the pleural space",
      "bypass the pulmonary circulation",
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary gas exchange depends on diffusion across the thin alveolar-capillary membrane. Damage, fluid, or thickening of this membrane can impair exchange.",
  },

  {
    id: "cardiology-027",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which statement about MRSA is most accurate?",
    choices: [
      "It is a virus that primarily attacks the lungs",
      "It is a bacterium that can be resistant to multiple antibiotics",
      "It is transmitted exclusively by needlesticks",
      "It is always eliminated by routine antibiotics",
    ],
    answerIndex: 1,
    explanation:
      "MRSA stands for methicillin-resistant Staphylococcus aureus. It is a bacterium capable of causing infection and resistance to multiple antibiotics is a defining concern.",
  },

  {
    id: "cardiology-028",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Hypoxia refers to:",
    choices: [
      "excess oxygen in the bloodstream",
      "inadequate oxygen availability to tissues and cells",
      "elevated carbon dioxide without any oxygen abnormality",
      "complete absence of ventilation",
    ],
    answerIndex: 1,
    explanation:
      "Hypoxia means inadequate oxygen at the tissue or cellular level. It can result from problems with oxygenation, ventilation, circulation, or cellular utilization.",
  },

  {
    id: "cardiology-029",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "When you first approach a patient who appears unconscious, which action should generally occur before painful stimulation?",
    choices: [
      "Check the patient's insurance information",
      "Attempt to obtain a verbal response",
      "Immediately administer medication",
      "Perform a complete secondary assessment",
    ],
    answerIndex: 1,
    explanation:
      "The initial assessment of responsiveness begins with verbal stimulation. If the patient does not respond, the EMT proceeds according to the primary assessment and local protocol.",
  },

  {
    id: "cardiology-030",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which condition would be least likely to cause tissue hypoxia?",
    choices: [
      "Pulmonary edema",
      "Pleural effusion",
      "Prolonged seizure activity",
      "Severe anxiety without another significant physiologic problem",
    ],
    answerIndex: 3,
    explanation:
      "Pulmonary edema, pleural effusion, and prolonged seizures can impair oxygen delivery or utilization. Anxiety alone generally does not cause significant tissue hypoxia.",
  },

  {
    id: "cardiology-031",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient develops low blood pressure and wheezing shortly after exposure to a known allergen. Which finding is particularly suggestive of anaphylactic shock?",
    choices: [
      "Wheezing",
      "Pallor",
      "Mild dizziness",
      "Hypotension alone",
    ],
    answerIndex: 0,
    explanation:
      "Wheezing reflects bronchospasm and is an important respiratory manifestation of anaphylaxis. Hypotension and dizziness are not unique to anaphylaxis.",
  },

  {
    id: "cardiology-032",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which injury would be most likely to produce hemorrhagic shock?",
    choices: [
      "A large liver laceration",
      "Mild sunburn",
      "A brief anxiety attack",
      "Simple vomiting without bleeding",
    ],
    answerIndex: 0,
    explanation:
      "A liver laceration can result in significant internal hemorrhage and loss of circulating blood volume, potentially causing hemorrhagic shock.",
  },

  {
    id: "cardiology-033",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A person briefly loses consciousness after an unexpected emotional event because of a sudden, temporary decrease in vascular tone. This is most consistent with:",
    choices: [
      "cardiogenic shock",
      "psychogenic shock",
      "hemorrhagic shock",
      "obstructive shock",
    ],
    answerIndex: 1,
    explanation:
      "Psychogenic or vasovagal syncope can involve a transient autonomic response causing vasodilation, reduced venous return, and temporary loss of consciousness.",
  },

  {
    id: "cardiology-034",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which statement about occupational HIV exposure is correct?",
    choices: [
      "HIV readily passes through intact skin",
      "The greatest concern is exposure through mucous membranes or direct bloodstream access",
      "HIV is more easily transmitted than hepatitis B through casual contact",
      "Any contact between blood and intact skin causes infection",
    ],
    answerIndex: 1,
    explanation:
      "HIV transmission requires exposure to infected body fluids through routes such as mucous membranes, damaged tissue, or direct bloodstream access. Intact skin is an effective barrier.",
  },

  {
    id: "cardiology-035",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which substance helps maintain the surface properties of the alveoli and supports effective gas exchange?",
    choices: [
      "Surfactant",
      "Fibrin",
      "Bile",
      "Insulin",
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary surfactant reduces alveolar surface tension and helps prevent alveolar collapse, supporting effective ventilation and gas exchange.",
  },

  {
    id: "cardiology-036",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which finding is generally considered a late and serious sign of inadequate oxygenation?",
    choices: [
      "Anxiety",
      "Restlessness",
      "Mild tachycardia",
      "Cyanosis",
    ],
    answerIndex: 3,
    explanation:
      "Cyanosis is a late sign of hypoxia and should be treated as a serious finding. Earlier signs may include anxiety, restlessness, and changes in heart rate.",
  },

  {
    id: "cardiology-037",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which description best defines an infectious disease?",
    choices: [
      "A condition caused only by bacteria resistant to antibiotics",
      "A disease resulting from harmful microorganisms invading or multiplying within a host",
      "Any illness transmitted exclusively through blood",
      "A condition that always produces fever",
    ],
    answerIndex: 1,
    explanation:
      "Infectious diseases result from microorganisms such as bacteria, viruses, fungi, or parasites invading or multiplying within a host.",
  },

  {
    id: "cardiology-038",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Pulmonary edema associated with impaired cardiac pumping function is most characteristic of:",
    choices: [
      "cardiogenic shock",
      "neurogenic shock",
      "hemorrhagic shock",
      "psychogenic shock",
    ],
    answerIndex: 0,
    explanation:
      "Cardiogenic shock occurs when the heart cannot effectively pump blood. Increased pressure can back up into the pulmonary circulation and contribute to pulmonary edema.",
  },

  {
    id: "cardiology-039",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "When reassessing a patient with an ongoing medical complaint, the EMT should first:",
    choices: [
      "repeat the primary assessment",
      "repeat the patient's entire medical history",
      "immediately obtain a new SAMPLE history",
      "complete the PCR",
    ],
    answerIndex: 0,
    explanation:
      "Reassessment begins by repeating the primary assessment to identify any deterioration or newly developing life threats.",
  },

  {
    id: "cardiology-040",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which physiologic condition can help limit cellular damage during reduced perfusion by decreasing metabolic demand?",
    choices: [
      "Mildly reduced body temperature",
      "Severe hyperthermia",
      "Markedly increased metabolic rate",
      "Persistent high fever",
    ],
    answerIndex: 0,
    explanation:
      "Lower body temperature can reduce cellular metabolic demand and oxygen consumption, which is one reason controlled hypothermia has applications in certain medical contexts.",
  },

  {
    id: "cardiology-041",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "The normal electrical impulse that initiates each heartbeat originates in the:",
    choices: [
      "atrioventricular node",
      "sinoatrial node",
      "bundle branches",
      "Purkinje fibers",
    ],
    answerIndex: 1,
    explanation:
      "The sinoatrial node normally serves as the heart's primary pacemaker and initiates the electrical impulse that begins each cardiac cycle.",
  },

  {
    id: "cardiology-042",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "How does aspirin affect platelet-related clot formation?",
    choices: [
      "It generally makes platelet aggregation less effective",
      "It immediately dissolves every existing clot",
      "It increases fibrin production",
      "It causes red blood cells to stop carrying oxygen",
    ],
    answerIndex: 0,
    explanation:
      "Aspirin inhibits platelet function, reducing platelet aggregation and therefore impairing part of the normal clot-forming process.",
  },

  // ============================================================================
  // MEDICAL + OBGYN
  // ============================================================================

  {
    id: "medical-011",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which presentation is most consistent with hypoglycemia?",
    choices: [
      "Warm, dry skin with slow pulse",
      "Cool, clammy skin with weakness and tachycardia",
      "Hot, flushed skin with profound bradycardia",
      "Dry skin with isolated hypertension",
    ],
    answerIndex: 1,
    explanation:
      "Hypoglycemia commonly produces adrenergic and neurologic symptoms such as sweating, cool or clammy skin, weakness, altered behavior, and tachycardia.",
  },

  {
    id: "medical-012",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An EMT carries oral glucose for use in appropriately selected patients. What is the actual active substance being provided?",
    choices: [
      "Insulin",
      "Glucose",
      "Glucagon",
      "Epinephrine",
    ],
    answerIndex: 1,
    explanation:
      "Oral glucose provides glucose directly to the patient and may be used for suspected hypoglycemia when the patient can safely swallow and meets protocol requirements.",
  },

  {
    id: "medical-013",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which organ is located in the retroperitoneal space?",
    choices: [
      "Kidney",
      "Spleen",
      "Stomach",
      "Transverse colon",
    ],
    answerIndex: 0,
    explanation:
      "The kidneys are retroperitoneal organs. Several other structures have intraperitoneal locations, while some portions of the gastrointestinal tract are secondarily retroperitoneal.",
  },

  {
    id: "medical-014",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which condition would be least likely to be classified primarily as a psychiatric disorder?",
    choices: [
      "Schizophrenia",
      "Major depression",
      "Substance use disorder",
      "Alzheimer disease",
    ],
    answerIndex: 3,
    explanation:
      "Alzheimer disease is a neurodegenerative disorder that causes progressive cognitive decline. The other choices are commonly classified within behavioral health or psychiatric categories.",
  },

  {
    id: "medical-015",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with hemophilia may be at increased risk for:",
    choices: [
      "spontaneous or prolonged bleeding",
      "excessive clot formation",
      "permanent immunity to infection",
      "rapid red blood cell production",
    ],
    answerIndex: 0,
    explanation:
      "Hemophilia involves impaired coagulation and can result in prolonged or spontaneous bleeding, including bleeding into joints or tissues.",
  },

  {
    id: "medical-016",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "During formation of a stable blood clot, which substance forms strands that reinforce the developing platelet plug?",
    choices: [
      "Fibrin",
      "Insulin",
      "Surfactant",
      "Bile",
    ],
    answerIndex: 0,
    explanation:
      "Fibrin forms a mesh that stabilizes the platelet plug and strengthens the developing blood clot.",
  },

  {
    id: "medical-017",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "During a stroke assessment, a patient is asked to hold both arms out in front. One arm gradually drifts downward. What does this finding suggest?",
    choices: [
      "Possible unilateral neurologic weakness",
      "Normal motor function",
      "Isolated respiratory distress",
      "A normal response to fatigue",
    ],
    answerIndex: 0,
    explanation:
      "Pronator drift or downward arm drift can indicate unilateral weakness and is a potentially important sign of a neurologic deficit such as stroke.",
  },

  {
    id: "medical-018",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Hypoperfusion is another term commonly used to describe:",
    choices: [
      "shock",
      "hyperglycemia",
      "hypertension",
      "hyperventilation",
    ],
    answerIndex: 0,
    explanation:
      "Shock is a state of inadequate tissue perfusion. Hypoperfusion describes insufficient blood flow and oxygen delivery to tissues.",
  },

  {
    id: "medical-019",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An adult who suddenly loses approximately one-fifth of their circulating blood volume is at significant risk for:",
    choices: [
      "hemodynamic changes and developing hypovolemia",
      "immediate pulmonary edema from fluid overload",
      "severe hyperglycemia",
      "increased circulating blood volume",
    ],
    answerIndex: 0,
    explanation:
      "An acute loss of roughly 20% of circulating blood volume can produce significant physiologic changes and may progress toward hemorrhagic shock depending on the patient's condition.",
  },

  // ============================================================================
  // REVERSE QUESTIONS
  // ============================================================================

  // The reverse questions deliberately change the direction of recall.
  // Instead of asking "What is X?", they provide X's defining feature
  // and ask the learner to identify the concept.

  {
    id: "ops-320",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMS system recommends completing a formal stress debriefing within 72 hours after a traumatic incident. What intervention is being described?",
    choices: [
      "Critical incident stress debriefing",
      "Routine patient reassessment",
      "Quality assurance review",
      "Scene size-up",
    ],
    answerIndex: 0,
    explanation:
      "Critical incident stress debriefing is the formal process being described. The 72-hour period is the key clue.",
  },

  {
    id: "ops-321",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMS provider uses a device that analyzes a cardiac rhythm and delivers a shock when indicated without requiring manual defibrillator operation. What skill is this?",
    choices: [
      "Suctioning",
      "AED operation",
      "12-lead interpretation",
      "Manual synchronized cardioversion",
    ],
    answerIndex: 1,
    explanation:
      "The description refers to operation of an automated external defibrillator, a foundational resuscitation skill.",
  },

  {
    id: "ops-322",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "A patient's refusal of EMS care is accepted only after the patient demonstrates understanding of the risks and consequences of refusing. What principle is being demonstrated?",
    choices: [
      "Abandonment",
      "Informed refusal",
      "Implied consent",
      "Negligence",
    ],
    answerIndex: 1,
    explanation:
      "The patient is making an informed refusal because the patient understands the proposed care and consequences of declining it.",
  },

  {
    id: "ops-323",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "A provider leaves a patient before another appropriately qualified provider assumes responsibility for the patient's care. What legal concept does this describe?",
    choices: [
      "Consent",
      "Negligence",
      "Abandonment",
      "Confidentiality",
    ],
    answerIndex: 2,
    explanation:
      "Leaving a patient without ensuring continued care by an appropriate provider is characteristic of abandonment.",
  },

  {
    id: "ops-324",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "A communication system requires a user to press a button while transmitting and release it before receiving the other person's message. What type of communication is this?",
    choices: [
      "Simplex",
      "Duplex",
      "Satellite",
      "Continuous broadcast",
    ],
    answerIndex: 0,
    explanation:
      "This push-to-talk, release-to-listen arrangement describes simplex communication.",
  },

  {
    id: "airway-070",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient is breathing adequately but complains of difficulty breathing or 'shortness of breath.' Which clinical term describes this complaint?",
    choices: [
      "Apnea",
      "Dyspnea",
      "Stridor",
      "Cyanosis",
    ],
    answerIndex: 1,
    explanation:
      "Dyspnea is the patient's subjective sensation of difficult or uncomfortable breathing.",
  },

  {
    id: "airway-071",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Oxygen and carbon dioxide move between alveolar air and pulmonary blood by crossing a thin membrane. What process is responsible?",
    choices: [
      "Conduction",
      "Diffusion",
      "Filtration",
      "Peristalsis",
    ],
    answerIndex: 1,
    explanation:
      "Pulmonary gas exchange occurs by diffusion across the alveolar-capillary membrane.",
  },

  {
    id: "airway-072",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An EMT hears a harsh, high-pitched inspiratory sound caused by narrowing of the upper airway. What is the sound called?",
    choices: [
      "Rhonchus",
      "Stridor",
      "Wheeze",
      "Crackle",
    ],
    answerIndex: 1,
    explanation:
      "Stridor is a high-pitched sound associated with upper-airway obstruction or narrowing, particularly during inspiration.",
  },

  {
    id: "airway-073",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient has inadequate oxygen delivery at the cellular level, resulting in impaired aerobic metabolism. What condition is being described?",
    choices: [
      "Hypoxia",
      "Hyperglycemia",
      "Hypertension",
      "Hyperthermia",
    ],
    answerIndex: 0,
    explanation:
      "Hypoxia means inadequate oxygen availability at the tissue or cellular level.",
  },

  {
    id: "cardiology-043",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient's shock results from widespread vasodilation and abnormal pooling of blood in peripheral vascular beds. Which type of shock is present?",
    choices: [
      "Distributive shock",
      "Cardiogenic shock",
      "Hemorrhagic shock",
      "Obstructive shock",
    ],
    answerIndex: 0,
    explanation:
      "Widespread vasodilation with maldistribution of circulating blood volume characterizes distributive shock.",
  },

  {
    id: "cardiology-044",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An EMT identifies the heart's normal primary pacemaker, which spontaneously generates the electrical impulse that initiates cardiac contraction. What structure is this?",
    choices: [
      "AV node",
      "SA node",
      "Bundle of His",
      "Purkinje network",
    ],
    answerIndex: 1,
    explanation:
      "The sinoatrial node, or SA node, normally initiates the heart's electrical activity.",
  },

  {
    id: "cardiology-045",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient develops severe hypotension after a major liver injury. The patient's shock is caused by loss of circulating blood volume. What type of shock is this?",
    choices: [
      "Psychogenic",
      "Distributive",
      "Hemorrhagic",
      "Cardiogenic",
    ],
    answerIndex: 2,
    explanation:
      "Major internal bleeding causes loss of circulating blood volume and can produce hemorrhagic shock.",
  },

  {
    id: "cardiology-046",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient has a late-stage oxygenation problem characterized by bluish discoloration of the skin and mucous membranes. What finding is this?",
    choices: [
      "Pallor",
      "Cyanosis",
      "Flushing",
      "Diaphoresis",
    ],
    answerIndex: 1,
    explanation:
      "Cyanosis is a bluish discoloration that can occur with significant hypoxemia and is generally considered a late sign of inadequate oxygenation.",
  },

  {
    id: "medical-020",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with a coagulation disorder experiences spontaneous bleeding because the normal clotting process is impaired. Which disorder is most consistent with this presentation?",
    choices: [
      "Hemophilia",
      "Asthma",
      "Diabetes mellitus",
      "Epilepsy",
    ],
    answerIndex: 0,
    explanation:
      "Hemophilia is an inherited coagulation disorder that can cause prolonged or spontaneous bleeding.",
  },

  {
    id: "medical-021",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A blood clot becomes stronger when a protein mesh forms around the platelet plug. Which substance creates this mesh?",
    choices: [
      "Fibrin",
      "Glucose",
      "Surfactant",
      "Hemoglobin",
    ],
    answerIndex: 0,
    explanation:
      "Fibrin forms the structural mesh that reinforces and stabilizes a developing blood clot.",
  },

  {
    id: "medical-022",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An EMT identifies a neurologic deficit when one patient's outstretched arm gradually drifts downward. What assessment finding is being demonstrated?",
    choices: [
      "Pronator drift",
      "Pursed-lip breathing",
      "Capillary refill",
      "Jugular venous distention",
    ],
    answerIndex: 0,
    explanation:
      "Downward drift of one outstretched arm is commonly described as pronator drift and may indicate unilateral neurologic weakness.",
  },

  {
    id: "medical-023",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient becomes cool, clammy, weak, and tachycardic because the blood glucose level has fallen too low. What condition is most likely responsible?",
    choices: [
      "Hyperglycemia",
      "Hypoglycemia",
      "Hypertension",
      "Hyperthermia",
    ],
    answerIndex: 1,
    explanation:
      "The combination of adrenergic symptoms and weakness is consistent with hypoglycemia, particularly when the patient has a known risk for low blood glucose.",
  },

  {
    id: "medical-024",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An EMT describes inadequate tissue blood flow as 'hypoperfusion.' Which broader clinical condition is being referenced?",
    choices: [
      "Shock",
      "Hyperventilation",
      "Hypertension",
      "Fever",
    ],
    answerIndex: 0,
    explanation:
      "Shock is fundamentally a state of inadequate tissue perfusion, making hypoperfusion an important descriptor of the condition.",
  },
  {
    id: "medical-025",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "For which ingestion should an EMT avoid administering activated charcoal because of the risk of additional tissue injury?",
    choices: [
      "A strong acid or alkali",
      "Acetaminophen",
      "A small amount of ethanol",
      "Aspirin"
    ],
    answerIndex: 0,
    explanation:
      "Activated charcoal is generally avoided after caustic acid or alkali ingestion because the charcoal does not neutralize the substance and may complicate evaluation or cause additional injury."
  },

  {
    id: "medical-026",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient has swallowed a corrosive household cleaner. Which common poisoning intervention should generally be avoided?",
    choices: [
      "Activated charcoal",
      "Rapid transport",
      "Airway monitoring",
      "Assessment for burns"
    ],
    answerIndex: 0,
    explanation:
      "Caustic acids and alkalis are an important contraindication to activated charcoal. Management should focus on airway assessment, supportive care, and prompt transport."
  },

  {
    id: "medical-027",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which description best matches anaphylaxis?",
    choices: [
      "A localized skin reaction to an irritant",
      "A severe systemic allergic reaction involving potentially multiple organ systems",
      "A mild reaction limited to nasal congestion",
      "A delayed immune response occurring several days after exposure"
    ],
    answerIndex: 1,
    explanation:
      "Anaphylaxis is a severe, potentially life-threatening allergic reaction that can affect several body systems."
  },

  {
    id: "medical-028",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient develops hives, wheezing, and hypotension shortly after exposure to an allergen. What type of reaction is most consistent with these findings?",
    choices: [
      "Anaphylaxis",
      "Simple contact dermatitis",
      "A localized infection",
      "A vasovagal episode"
    ],
    answerIndex: 0,
    explanation:
      "Rapid involvement of the respiratory and cardiovascular systems after allergen exposure is characteristic of anaphylaxis."
  },

  {
    id: "medical-029",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which finding is NOT evaluated by the Cincinnati Prehospital Stroke Scale?",
    choices: [
      "Facial symmetry",
      "Arm drift",
      "Speech abnormalities",
      "Short-term memory"
    ],
    answerIndex: 3,
    explanation:
      "The Cincinnati scale evaluates facial droop, arm drift, and speech. Memory is not one of its standard assessment components."
  },

  {
    id: "medical-030",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT is performing a Cincinnati stroke assessment. Which neurological function falls outside the three standard components of the tool?",
    choices: [
      "Facial movement",
      "Arm strength",
      "Speech",
      "Memory"
    ],
    answerIndex: 3,
    explanation:
      "The Cincinnati Prehospital Stroke Scale focuses on facial droop, arm drift, and speech abnormalities."
  },

  {
    id: "medical-031",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which action is NOT normally associated with sympathetic nervous system activation?",
    choices: [
      "Increasing heart rate",
      "Dilating the bronchioles",
      "Constriction of many digestive-system blood vessels",
      "Increasing gastrointestinal activity"
    ],
    answerIndex: 3,
    explanation:
      "Sympathetic activation generally decreases gastrointestinal activity. Increased heart rate, bronchodilation, and vasoconstriction in many vascular beds are associated with sympathetic activation."
  },

  {
    id: "medical-032",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient is experiencing increased gastrointestinal activity rather than the expected fight-or-flight response. Which autonomic effect would this finding be least consistent with?",
    choices: [
      "Sympathetic activation",
      "Parasympathetic activity",
      "Rest-and-digest physiology",
      "Gastrointestinal stimulation"
    ],
    answerIndex: 0,
    explanation:
      "Sympathetic activation generally suppresses gastrointestinal activity, whereas parasympathetic activity promotes it."
  },

  {
    id: "medical-033",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An absence seizure is also known by which historical term?",
    choices: [
      "Petit mal seizure",
      "Grand mal seizure",
      "Jacksonian seizure",
      "Febrile seizure"
    ],
    answerIndex: 0,
    explanation:
      "Absence seizures were historically called petit mal seizures. The modern term is preferred."
  },

  {
    id: "medical-034",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has brief episodes of impaired awareness with little or no major motor activity. Which historical seizure classification corresponds to this presentation?",
    choices: [
      "Petit mal",
      "Grand mal",
      "Status epilepticus",
      "Tonic-clonic"
    ],
    answerIndex: 0,
    explanation:
      "The historical term petit mal refers to what is now called an absence seizure."
  },

  {
    id: "medical-035",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which condition can produce a seizure because of a metabolic or toxic disturbance?",
    choices: [
      "Poisoning",
      "Simple ankle sprain",
      "Isolated sunburn",
      "Stable femur fracture"
    ],
    answerIndex: 0,
    explanation:
      "Toxic exposures and metabolic disturbances can alter brain function enough to produce seizures."
  },

  {
    id: "medical-036",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT is looking for a nonstructural cause of a seizure. Which patient problem could directly precipitate one?",
    choices: [
      "Poisoning",
      "A superficial abrasion",
      "An isolated wrist sprain",
      "A healed fracture"
    ],
    answerIndex: 0,
    explanation:
      "Poisoning is a potential toxic or metabolic trigger for seizures."
  },

  {
    id: "medical-037",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "What term describes a raised, clearly defined area of skin that commonly develops after an insect bite or sting?",
    choices: [
      "Wheal",
      "Pustule",
      "Vesicle",
      "Eschar"
    ],
    answerIndex: 0,
    explanation:
      "A wheal is a raised, well-demarcated area of skin commonly associated with allergic reactions and insect bites or stings."
  },

  {
    id: "medical-038",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "After an insect sting, a patient develops a raised, localized area of swelling with distinct borders. What is this skin finding called?",
    choices: [
      "Wheal",
      "Eschar",
      "Cyanosis",
      "Petechia"
    ],
    answerIndex: 0,
    explanation:
      "A wheal is a raised, localized area of skin swelling often associated with histamine release."
  },

  {
    id: "medical-039",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which finding is most characteristic of status epilepticus?",
    choices: [
      "A brief seizure followed by rapid recovery",
      "Repeated or prolonged seizure activity without adequate recovery of consciousness",
      "A seizure lasting less than five seconds",
      "A seizure occurring only during sleep"
    ],
    answerIndex: 1,
    explanation:
      "Status epilepticus involves prolonged or recurrent seizure activity without adequate return to baseline consciousness and requires immediate treatment."
  },

  {
    id: "medical-040",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has ongoing or repeatedly recurring seizure activity without regaining normal consciousness between episodes. What emergency should the EMT suspect?",
    choices: [
      "Status epilepticus",
      "Syncope",
      "A simple absence seizure",
      "A transient ischemic attack"
    ],
    answerIndex: 0,
    explanation:
      "Persistent or recurrent seizures without adequate recovery are concerning for status epilepticus."
  },

  {
    id: "medical-041",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A transient ischemic attack occurs when a temporary interruption of cerebral blood flow causes neurological symptoms that resolve. What usually causes this interruption?",
    choices: [
      "A transient blockage of a cerebral artery",
      "Permanent destruction of brain tissue",
      "A fractured skull",
      "Excessive oxygen in the blood"
    ],
    answerIndex: 0,
    explanation:
      "A TIA results from temporary cerebral ischemia, commonly caused by a transient arterial blockage, without permanent infarction."
  },

  {
    id: "medical-042",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient experiences temporary neurological deficits caused by a brief interruption of blood flow through a cerebral artery, followed by resolution. What condition does this describe?",
    choices: [
      "Transient ischemic attack",
      "Hemorrhagic stroke",
      "Status epilepticus",
      "Hypoglycemia"
    ],
    answerIndex: 0,
    explanation:
      "A transient ischemic attack produces temporary neurological dysfunction from transient cerebral ischemia."
  },

  {
    id: "medical-043",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "As a woman approaches menopause, which menstrual change is commonly expected?",
    choices: [
      "Periods may become irregular and vary in flow",
      "Menstruation becomes permanently heavier in every patient",
      "Menstrual cycles become exactly 28 days long",
      "Ovulation becomes more predictable"
    ],
    answerIndex: 0,
    explanation:
      "During perimenopause, menstrual cycles commonly become irregular and the amount and duration of bleeding may change."
  },

  {
    id: "medical-044",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A woman in the perimenopausal period reports increasingly unpredictable menstrual cycles with changes in bleeding amount. What physiologic transition best explains this?",
    choices: [
      "The approach of menopause",
      "The onset of puberty",
      "A normal pregnancy",
      "An isolated urinary infection"
    ],
    answerIndex: 0,
    explanation:
      "Irregularity and changing flow are common during the transition toward menopause."
  },

  // ============================================================================
  // TRAUMA
  // ============================================================================

  {
    id: "trauma-029",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "After your partner establishes airway management for a patient with a penetrating abdominal injury, which action should you perform next?",
    choices: [
      "Control obvious external hemorrhage and then look for an exit wound",
      "Give the patient food and water",
      "Apply a cervical collar before addressing bleeding",
      "Place the patient in a sitting position"
    ],
    answerIndex: 0,
    explanation:
      "After immediate airway priorities, obvious life-threatening hemorrhage should be controlled. With a penetrating injury, inspect for an exit wound as part of the trauma assessment."
  },

  {
    id: "trauma-030",
    domain: "Trauma",
    level: "EMT",
    question:
      "A patient has a gunshot wound to the abdomen. After airway management is underway and obvious bleeding is controlled, what additional wound should the EMT specifically search for?",
    choices: [
      "An exit wound",
      "A pressure ulcer",
      "A venous stasis ulcer",
      "A diabetic foot ulcer"
    ],
    answerIndex: 0,
    explanation:
      "Penetrating trauma may create both an entrance and exit wound, so the patient should be assessed for both."
  },

  {
    id: "trauma-031",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which factor is considered one of the most important modifiable risk factors for hemorrhagic stroke?",
    choices: [
      "Hypertension",
      "Hypoglycemia",
      "Seasonal allergies",
      "Low body temperature"
    ],
    answerIndex: 0,
    explanation:
      "Chronic hypertension is a major risk factor for intracerebral hemorrhage and other forms of stroke."
  },

  {
    id: "trauma-032",
    domain: "Trauma",
    level: "EMT",
    question:
      "An EMT is reviewing a patient's risk factors for intracranial hemorrhage. Which condition is particularly important?",
    choices: [
      "Chronic hypertension",
      "Mild seasonal allergies",
      "A remote ankle sprain",
      "Low dietary sodium for one day"
    ],
    answerIndex: 0,
    explanation:
      "Long-standing hypertension substantially increases the risk of hemorrhagic stroke."
  },

  {
    id: "trauma-033",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Why can an excessively rapid heart rate reduce cardiac output?",
    choices: [
      "The ventricles have less time to fill between contractions",
      "The heart stops receiving oxygen",
      "The aorta immediately closes",
      "The blood becomes thicker"
    ],
    answerIndex: 0,
    explanation:
      "Very rapid rates shorten diastolic filling time. Reduced ventricular filling can decrease stroke volume and therefore cardiac output."
  },

  {
    id: "trauma-034",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient develops a very rapid tachycardia and hypotension. What physiologic problem can explain the reduced cardiac output?",
    choices: [
      "Insufficient ventricular filling time",
      "Excessive ventricular filling",
      "Complete absence of venous return",
      "Increased blood viscosity"
    ],
    answerIndex: 0,
    explanation:
      "At very rapid heart rates, shortened diastole can reduce ventricular filling and stroke volume."
  },

  {
    id: "trauma-035",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Why should a honeybee stinger be removed promptly after a sting?",
    choices: [
      "The attached venom sac can continue releasing venom",
      "The stinger causes immediate hypoglycemia",
      "The stinger prevents circulation to the entire limb",
      "The stinger always causes infection within seconds"
    ],
    answerIndex: 0,
    explanation:
      "A honeybee can leave its barbed stinger and attached venom apparatus behind. Prompt removal limits continued venom delivery."
  },

  {
    id: "trauma-036",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT finds a honeybee stinger still embedded in a patient's skin. What is the primary reason for removing it promptly?",
    choices: [
      "The venom apparatus may continue delivering venom",
      "The stinger will cause immediate arterial occlusion",
      "The patient will otherwise develop hypothermia",
      "The stinger prevents oxygen from reaching the skin"
    ],
    answerIndex: 0,
    explanation:
      "The venom sac can continue releasing venom after the bee has departed, so the stinger should be removed promptly."
  },

  {
    id: "trauma-037",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient is responsive only to painful stimuli and has slow, shallow respirations. Which complication should concern the EMT most immediately?",
    choices: [
      "Aspiration of vomitus",
      "Mild dehydration",
      "Muscle soreness",
      "Hypertension"
    ],
    answerIndex: 0,
    explanation:
      "A patient with significantly decreased responsiveness and inadequate respirations is at high risk for losing airway protective reflexes and aspirating."
  },

  {
    id: "trauma-038",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A severely altered patient has shallow respirations and cannot reliably protect the airway. Which complication is the EMT particularly concerned about?",
    choices: [
      "Aspiration",
      "Hypertension",
      "Constipation",
      "Joint instability"
    ],
    answerIndex: 0,
    explanation:
      "Decreased consciousness can impair protective airway reflexes, increasing the risk of aspiration."
  },

  {
    id: "trauma-039",
    domain: "Trauma",
    level: "EMT",
    question:
      "The primary purpose of an automobile airbag is to:",
    choices: [
      "Reduce the severity of injuries caused by rapid deceleration",
      "Prevent every occupant from moving",
      "Replace the need for seat belts",
      "Prevent all penetrating injuries"
    ],
    answerIndex: 0,
    explanation:
      "Airbags reduce the forces and contact involved in rapid deceleration, thereby decreasing injury severity."
  },

  {
    id: "trauma-040",
    domain: "Trauma",
    level: "EMT",
    question:
      "A vehicle's airbag deploys during a collision. What mechanism of injury is the device primarily intended to reduce?",
    choices: [
      "Rapid deceleration injury",
      "Chemical burns",
      "Electrical burns",
      "Radiation injury"
    ],
    answerIndex: 0,
    explanation:
      "Airbags are designed to reduce the forces transmitted to occupants during rapid deceleration."
  },

  {
    id: "trauma-041",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which is an important function of the liver?",
    choices: [
      "Producing substances involved in blood clotting",
      "Producing insulin",
      "Generating all red blood cells in adults",
      "Pumping blood into the pulmonary artery"
    ],
    answerIndex: 0,
    explanation:
      "The liver synthesizes many clotting factors and therefore plays a major role in hemostasis."
  },

  {
    id: "trauma-042",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An organ produces many of the proteins needed for normal coagulation. Which organ is responsible for this function?",
    choices: [
      "Liver",
      "Pancreas",
      "Spleen",
      "Thyroid"
    ],
    answerIndex: 0,
    explanation:
      "The liver synthesizes most circulating clotting factors."
  },

  {
    id: "trauma-043",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which blood glucose range is a reasonable approximation of a normal fasting glucose level for many adults?",
    choices: [
      "80 to 120 mg/dL",
      "10 to 30 mg/dL",
      "250 to 350 mg/dL",
      "400 to 500 mg/dL"
    ],
    answerIndex: 0,
    explanation:
      "Traditional EMS teaching commonly uses approximately 80 to 120 mg/dL as a normal reference range, although modern laboratory reference ranges vary."
  },

  {
    id: "trauma-044",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An otherwise healthy adult has a glucose reading around 100 mg/dL. How should this value generally be interpreted?",
    choices: [
      "Within a commonly taught normal range",
      "Severe hypoglycemia",
      "Severe hyperglycemia",
      "A diagnostic value for diabetic ketoacidosis"
    ],
    answerIndex: 0,
    explanation:
      "A glucose level around 100 mg/dL is generally considered normal in a typical adult."
  },

  // ============================================================================
  // ALLERGY / CARDIOLOGY
  // ============================================================================

  {
    id: "cardiology-047",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which finding would most strongly support administration of epinephrine for a severe allergic reaction?",
    choices: [
      "Wheezing accompanied by hypotension",
      "A single small area of itching",
      "Mild nasal congestion",
      "A healed skin rash"
    ],
    answerIndex: 0,
    explanation:
      "Respiratory compromise and cardiovascular involvement are signs of a severe systemic allergic reaction requiring prompt epinephrine when indicated."
  },

  {
    id: "cardiology-048",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient with an allergic exposure develops wheezing and low blood pressure. Which medication is most directly indicated for anaphylaxis?",
    choices: [
      "Epinephrine",
      "Acetaminophen",
      "Nitroglycerin",
      "Aspirin"
    ],
    answerIndex: 0,
    explanation:
      "Epinephrine is the first-line medication for anaphylaxis and addresses airway, respiratory, and circulatory compromise."
  },

  {
    id: "cardiology-049",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which rhythm is a common cause of sudden cardiac death following an acute myocardial infarction?",
    choices: [
      "Ventricular fibrillation",
      "Sinus bradycardia",
      "First-degree AV block",
      "Sinus arrhythmia"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation is a life-threatening ventricular dysrhythmia and a major cause of sudden death after acute myocardial infarction."
  },

  {
    id: "cardiology-050",
    domain: "Cardiology",
    level: "EMT",
    question:
      "After an acute myocardial infarction, a patient suddenly becomes pulseless because of a chaotic ventricular rhythm. Which rhythm is most likely?",
    choices: [
      "Ventricular fibrillation",
      "Sinus rhythm",
      "First-degree AV block",
      "Sinus bradycardia"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation produces ineffective, chaotic ventricular activity and causes cardiac arrest."
  },

  {
    id: "cardiology-051",
    domain: "Cardiology",
    level: "EMT",
    question:
      "The brain normally receives oxygenated arterial blood primarily through branches of which vessels?",
    choices: [
      "Carotid and vertebral arteries",
      "Pulmonary arteries",
      "Renal arteries",
      "Femoral arteries"
    ],
    answerIndex: 0,
    explanation:
      "The brain receives arterial blood through the internal carotid and vertebrobasilar systems."
  },

  {
    id: "cardiology-052",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which arterial systems provide most of the brain's blood supply?",
    choices: [
      "Carotid and vertebral systems",
      "Pulmonary arteries",
      "Femoral arteries",
      "Renal arteries"
    ],
    answerIndex: 0,
    explanation:
      "The internal carotid and vertebral arteries provide the principal arterial supply to the brain."
  },

  {
    id: "cardiology-053",
    domain: "Cardiology",
    level: "EMT",
    question:
      "What is the fundamental purpose of defibrillation during ventricular fibrillation?",
    choices: [
      "To terminate the disorganized electrical activity so an organized rhythm can resume",
      "To permanently slow the heart rate",
      "To increase blood glucose",
      "To increase circulating blood volume"
    ],
    answerIndex: 0,
    explanation:
      "Defibrillation delivers an electrical shock intended to stop ventricular fibrillation and allow an organized rhythm to resume."
  },

  {
    id: "cardiology-054",
    domain: "Cardiology",
    level: "EMT",
    question:
      "An AED identifies ventricular fibrillation and recommends a shock. What is the intended physiologic result?",
    choices: [
      "Termination of the chaotic ventricular rhythm",
      "Permanent cardiac standstill",
      "Immediate restoration of blood volume",
      "Direct correction of hypoglycemia"
    ],
    answerIndex: 0,
    explanation:
      "Defibrillation interrupts the chaotic electrical activity of ventricular fibrillation, giving the heart an opportunity to resume an organized rhythm."
  },

  {
    id: "cardiology-055",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient receives atropine for symptomatic bradycardia. Which effect is commonly associated with atropine?",
    choices: [
      "Drying of mucous membranes",
      "Profuse salivation",
      "Severe bronchoconstriction",
      "Increased gastrointestinal secretions"
    ],
    answerIndex: 0,
    explanation:
      "Atropine blocks muscarinic receptors. Common anticholinergic effects include dry mouth and other reduced secretions."
  },

  {
    id: "cardiology-056",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which anticholinergic effect might appear after atropine administration?",
    choices: [
      "Dry mouth",
      "Excessive salivation",
      "Increased bowel motility",
      "Increased bronchial secretions"
    ],
    answerIndex: 0,
    explanation:
      "Atropine reduces parasympathetic muscarinic activity, commonly producing dry mucous membranes."
  },

  {
    id: "trauma-045",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which solid abdominal organ is particularly vascular and can produce severe internal hemorrhage when injured?",
    choices: [
      "Liver",
      "Bladder",
      "Gallbladder",
      "Appendix"
    ],
    answerIndex: 0,
    explanation:
      "The liver is highly vascular and can cause substantial internal hemorrhage after significant trauma."
  },

  {
    id: "trauma-046",
    domain: "Trauma",
    level: "EMT",
    question:
      "An abdominal trauma patient has severe internal bleeding from an injured solid organ. Which organ is especially capable of producing major hemorrhage?",
    choices: [
      "Liver",
      "Appendix",
      "Urinary bladder",
      "Gallbladder"
    ],
    answerIndex: 0,
    explanation:
      "The liver contains extensive blood supply and can bleed heavily when injured."
  },

  {
    id: "ops-325",
    domain: "EMS Operations",
    level: "EMT",
    question:
      "Compared with a Level III trauma center, which capability is characteristic of a Level I trauma center?",
    choices: [
      "A comprehensive trauma system with specialists and resources available around the clock",
      "No surgical capability",
      "Care limited exclusively to minor injuries",
      "No requirement for trauma specialists"
    ],
    answerIndex: 0,
    explanation:
      "Level I centers provide the highest level of comprehensive trauma care, including continuous availability of specialized personnel and resources."
  },

  {
    id: "ops-326",
    domain: "EMS Operations",
    level: "EMT",
    question:
      "A trauma facility provides comprehensive specialty coverage and advanced resources continuously for severely injured patients. Which trauma-center designation best fits?",
    choices: [
      "Level I",
      "Level IV",
      "Level V",
      "Non-trauma facility"
    ],
    answerIndex: 0,
    explanation:
      "Level I trauma centers provide the most comprehensive level of trauma care."
  },

  // ============================================================================
  // ALLERGY / GI / AIRWAY
  // ============================================================================

  {
    id: "medical-045",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient develops widespread hives and a sensation of throat tightness after eating peanuts. Which question should the EMT ask early in the assessment?",
    choices: [
      "Does the patient have a prescribed epinephrine auto-injector?",
      "When was the patient's last tetanus shot?",
      "What is the patient's favorite food?",
      "Has the patient recently exercised?"
    ],
    answerIndex: 0,
    explanation:
      "The patient's symptoms suggest a potentially serious allergic reaction. Determining whether prescribed epinephrine is available is an important early step."
  },

  {
    id: "medical-046",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient with a known food allergy develops generalized urticaria and throat tightness. Which piece of information is especially important to determine immediately?",
    choices: [
      "Whether the patient has prescribed epinephrine",
      "The patient's favorite meal",
      "The patient's usual bedtime",
      "Whether the patient owns a pet"
    ],
    answerIndex: 0,
    explanation:
      "Determining whether the patient has a prescribed epinephrine auto-injector can directly affect immediate treatment."
  },

  {
    id: "medical-047",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Esophageal varices are particularly associated with which condition?",
    choices: [
      "Chronic liver disease and portal hypertension",
      "A simple ankle fracture",
      "Seasonal allergies",
      "Isolated hypertension without liver disease"
    ],
    answerIndex: 0,
    explanation:
      "Portal hypertension, commonly resulting from chronic liver disease, can cause enlarged esophageal veins known as varices."
  },

  {
    id: "medical-048",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMS patient has a history of chronic liver disease and now presents with massive upper gastrointestinal bleeding. Which vascular complication should be considered?",
    choices: [
      "Esophageal varices",
      "Pulmonary embolism",
      "Deep vein thrombosis",
      "Aortic dissection"
    ],
    answerIndex: 0,
    explanation:
      "Portal hypertension associated with chronic liver disease can produce fragile esophageal varices that may bleed severely."
  },

  {
    id: "medical-049",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Urticaria is another medical term for:",
    choices: [
      "Hives",
      "Jaundice",
      "Cyanosis",
      "Edema"
    ],
    answerIndex: 0,
    explanation:
      "Urticaria refers to hives, typically raised and itchy areas of skin caused by histamine-mediated reactions."
  },

  {
    id: "medical-050",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has raised, itchy skin lesions consistent with hives. What medical term describes this finding?",
    choices: [
      "Urticaria",
      "Cyanosis",
      "Jaundice",
      "Petechiae"
    ],
    answerIndex: 0,
    explanation:
      "Urticaria is the medical term for hives."
  },

  {
    id: "medical-051",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which statement best describes altered mental status?",
    choices: [
      "A change in a patient's normal level of awareness, cognition, or behavior",
      "Any patient who reports pain",
      "Only complete unconsciousness",
      "Only a psychiatric disorder"
    ],
    answerIndex: 0,
    explanation:
      "Altered mental status is a broad clinical description for abnormal awareness, cognition, behavior, or responsiveness."
  },

  {
    id: "medical-052",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient who normally interacts appropriately is now confused and responds abnormally to questions. How should this finding be described?",
    choices: [
      "Altered mental status",
      "Normal cognition",
      "Isolated hypertension",
      "Musculoskeletal pain"
    ],
    answerIndex: 0,
    explanation:
      "A significant departure from the patient's normal cognition or responsiveness is considered altered mental status."
  },

  {
    id: "medical-053",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Why can children with diabetes be particularly vulnerable to hypoglycemia?",
    choices: [
      "They may have difficulty maintaining regular food intake and medication timing",
      "Children cannot produce glucose",
      "Children do not require carbohydrates",
      "Children are immune to hyperglycemia"
    ],
    answerIndex: 0,
    explanation:
      "Children may have irregular eating patterns, and insulin or other diabetes management can create a mismatch between glucose availability and medication effect."
  },

  {
    id: "medical-054",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A diabetic child develops recurrent low blood glucose partly because meals and diabetes medications are difficult to keep on schedule. What factor is contributing?",
    choices: [
      "Irregular food intake and medication timing",
      "Excessive oxygen delivery",
      "A lack of circulating red blood cells",
      "Increased bone density"
    ],
    answerIndex: 0,
    explanation:
      "Irregular eating and medication timing can contribute to hypoglycemic episodes in children with diabetes."
  },

  // ============================================================================
  // SEIZURE / ABDOMINAL EMERGENCIES
  // ============================================================================

  {
    id: "airway-074",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient is actively seizing and has vomitus collecting near the mouth. After protecting the patient from injury, which priority is most appropriate?",
    choices: [
      "Position and suction as needed while maintaining the airway and supporting oxygenation",
      "Force oral medication into the patient's mouth",
      "Restrain the patient's arms and legs",
      "Give the patient food"
    ],
    answerIndex: 0,
    explanation:
      "During a seizure, the EMT should protect the patient from injury, maintain airway patency, suction secretions or vomitus as needed, and support oxygenation."
  },

  {
    id: "airway-075",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A seizing patient has vomitus in the mouth. Which intervention should be prioritized once the patient has been protected from environmental injury?",
    choices: [
      "Clear and protect the airway",
      "Place an object between the teeth",
      "Force the mouth closed",
      "Give oral fluids"
    ],
    answerIndex: 0,
    explanation:
      "Airway protection and clearing secretions or vomitus are priorities because aspiration and airway obstruction can occur."
  },

  {
    id: "medical-055",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "What is an important supportive intervention for a patient experiencing severe abdominal pain?",
    choices: [
      "Provide reassurance and emotional support while arranging appropriate transport",
      "Encourage a large meal",
      "Give unlimited oral fluids",
      "Delay transport until the pain completely resolves"
    ],
    answerIndex: 0,
    explanation:
      "Supportive care, reassurance, frequent reassessment, and timely transport are important for patients with potentially serious abdominal conditions."
  },

  {
    id: "medical-056",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An anxious patient with severe abdominal pain is awaiting transport. Which supportive action is appropriate?",
    choices: [
      "Provide reassurance while continuing assessment and preparing for transport",
      "Give a large meal",
      "Delay transport indefinitely",
      "Encourage strenuous activity"
    ],
    answerIndex: 0,
    explanation:
      "Reassurance and calm supportive care can help the patient while the EMT continues assessment and arranges appropriate transport."
  },

  {
    id: "medical-057",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Severe pain involving the lower back or abdomen should raise concern for which potentially life-threatening vascular condition?",
    choices: [
      "Abdominal aortic aneurysm",
      "Otitis media",
      "Simple gastritis",
      "Tension headache"
    ],
    answerIndex: 0,
    explanation:
      "An abdominal aortic aneurysm can cause abdominal, flank, or back pain and may become rapidly life-threatening if it ruptures."
  },

  {
    id: "medical-058",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient suddenly develops severe abdominal and back pain with signs of shock. Which vascular emergency should be considered?",
    choices: [
      "Abdominal aortic aneurysm",
      "Otitis media",
      "Sinusitis",
      "An uncomplicated skin infection"
    ],
    answerIndex: 0,
    explanation:
      "A ruptured abdominal aortic aneurysm can produce severe abdominal or back pain accompanied by hemorrhagic shock."
  },

  {
    id: "medical-059",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which presentation is strongly suggestive of an upper gastrointestinal bleed?",
    choices: [
      "Vomiting blood",
      "Clear nasal drainage",
      "Painful urination",
      "A dry cough"
    ],
    answerIndex: 0,
    explanation:
      "Hematemesis, or vomiting blood, is a classic sign of upper gastrointestinal bleeding."
  },

  {
    id: "medical-060",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT observes blood being vomited by a patient. Which emergency should be considered?",
    choices: [
      "Upper gastrointestinal bleeding",
      "Simple allergic rhinitis",
      "Isolated asthma",
      "A urinary tract infection"
    ],
    answerIndex: 0,
    explanation:
      "Vomiting blood, called hematemesis, strongly suggests an upper gastrointestinal source."
  },

  {
    id: "medical-061",
    domain: "Cardiology",
    level: "EMT",
    question:
      "The inferior vena cava returns venous blood from all of the following areas EXCEPT:",
    choices: [
      "The brain",
      "The lower extremities",
      "The abdomen",
      "The kidneys"
    ],
    answerIndex: 0,
    explanation:
      "The inferior vena cava drains most structures below the diaphragm. Blood from the brain returns through the superior vena cava."
  },

  {
    id: "medical-062",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Blood from which location returns to the heart through the superior vena cava rather than the inferior vena cava?",
    choices: [
      "Brain",
      "Legs",
      "Kidneys",
      "Abdominal organs"
    ],
    answerIndex: 0,
    explanation:
      "The brain and other structures above the diaphragm primarily drain through the superior vena cava."
  },

  {
    id: "trauma-047",
    domain: "Trauma",
    level: "EMT",
    question:
      "A significant portion of traumatic aortic injuries is associated with which type of vehicle collision?",
    choices: [
      "Lateral-impact collisions",
      "Low-speed bicycle falls only",
      "Minor rear-end collisions",
      "Standing falls from ground level only"
    ],
    answerIndex: 0,
    explanation:
      "Significant deceleration and shearing forces, including those generated in side-impact collisions, can produce traumatic aortic injury."
  },

  {
    id: "trauma-048",
    domain: "Trauma",
    level: "EMT",
    question:
      "An EMT is evaluating a high-energy motor vehicle crash for possible blunt aortic injury. Which collision mechanism should raise concern?",
    choices: [
      "A high-energy lateral impact",
      "A slow walk into a wall",
      "A paper cut",
      "A low-energy hand injury"
    ],
    answerIndex: 0,
    explanation:
      "High-energy mechanisms that generate substantial deceleration or shearing forces can injure the thoracic aorta."
  },

  {
    id: "trauma-049",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which may be an early sign of internal bleeding in a trauma patient who initially appears stable?",
    choices: [
      "Weakness or dizziness, especially with standing",
      "Improved exercise tolerance",
      "Increased appetite",
      "Warm dry skin with normal vital signs"
    ],
    answerIndex: 0,
    explanation:
      "Early blood loss may produce weakness, dizziness, or orthostatic symptoms before obvious hypotension develops."
  },

  {
    id: "trauma-050",
    domain: "Trauma",
    level: "EMT",
    question:
      "A patient with possible internal hemorrhage becomes dizzy when standing. What should this finding make the EMT consider?",
    choices: [
      "Early volume loss",
      "Improved perfusion",
      "Hyperoxygenation",
      "Normal hydration"
    ],
    answerIndex: 0,
    explanation:
      "Orthostatic dizziness can occur when circulating volume is reduced and should increase concern for blood loss."
  },

  // ============================================================================
  // CIRCULATION / HEMORRHAGE / MEDICATIONS
  // ============================================================================

  {
    id: "cardiology-057",
    domain: "Cardiology",
    level: "EMT",
    question:
      "What is the primary role of the systemic veins?",
    choices: [
      "Return deoxygenated blood to the heart",
      "Carry oxygenated blood from the left ventricle",
      "Exchange oxygen directly with the alveoli",
      "Produce red blood cells"
    ],
    answerIndex: 0,
    explanation:
      "Systemic veins return deoxygenated blood from body tissues toward the right side of the heart."
  },

  {
    id: "cardiology-058",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A vessel carries oxygen-poor blood from body tissues back toward the right side of the heart. What type of vessel is performing this role?",
    choices: [
      "Systemic vein",
      "Pulmonary artery",
      "Systemic artery",
      "Pulmonary vein"
    ],
    answerIndex: 0,
    explanation:
      "Systemic veins return deoxygenated blood from the body to the right atrium."
  },

  {
    id: "trauma-051",
    domain: "Trauma",
    level: "EMT",
    question:
      "If firm direct pressure does not control life-threatening extremity bleeding, what should an EMT generally apply?",
    choices: [
      "A tourniquet proximal to the wound",
      "An ice pack alone",
      "A loose gauze pad without pressure",
      "A sling without hemorrhage control"
    ],
    answerIndex: 0,
    explanation:
      "A properly applied tourniquet is indicated for severe extremity hemorrhage that cannot be controlled with direct pressure."
  },

  {
    id: "trauma-052",
    domain: "Trauma",
    level: "EMT",
    question:
      "An extremity wound continues to produce life-threatening bleeding despite appropriate direct pressure. What device should be considered?",
    choices: [
      "Tourniquet",
      "Ice pack",
      "Cervical collar",
      "Pulse oximeter"
    ],
    answerIndex: 0,
    explanation:
      "When severe extremity hemorrhage cannot be controlled with direct pressure, a tourniquet should be applied according to protocol."
  },

  {
    id: "medical-063",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "When an EMT encounters a patient behaving in a bizarre or unusual manner, what should be considered?",
    choices: [
      "An underlying medical condition may be causing the behavior",
      "The patient definitely has a psychiatric disorder",
      "The behavior can always be ignored",
      "The patient should automatically be restrained"
    ],
    answerIndex: 0,
    explanation:
      "Behavioral changes can result from hypoglycemia, hypoxia, intoxication, infection, head injury, or other medical conditions."
  },

  {
    id: "medical-064",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A previously normal patient suddenly becomes confused and aggressive. What principle should guide the EMT's assessment?",
    choices: [
      "Look for an underlying medical cause",
      "Assume a psychiatric diagnosis immediately",
      "Ignore vital signs",
      "Assume intoxication without assessment"
    ],
    answerIndex: 0,
    explanation:
      "New behavioral changes can be manifestations of serious medical illness, so medical causes must be considered."
  },

  {
    id: "cardiology-059",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which feature helps distinguish stable angina from an acute myocardial infarction?",
    choices: [
      "Stable angina commonly improves with rest or prescribed antianginal therapy",
      "An MI always improves with rest",
      "Stable angina always causes cardiac arrest",
      "An MI never produces dyspnea"
    ],
    answerIndex: 0,
    explanation:
      "Stable angina is generally predictable and often improves with rest or prescribed nitroglycerin. An MI represents myocardial injury and may persist despite rest."
  },

  {
    id: "cardiology-060",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient's predictable exertional chest discomfort consistently resolves after stopping activity. Which condition is most consistent with this pattern?",
    choices: [
      "Stable angina",
      "Ventricular fibrillation",
      "Cardiac arrest",
      "Hemorrhagic stroke"
    ],
    answerIndex: 0,
    explanation:
      "Stable angina commonly occurs with predictable exertion and improves when myocardial oxygen demand decreases."
  },

  {
    id: "medical-065",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Why should a patient with acute abdominal pain generally not be given food or drink unless specifically indicated?",
    choices: [
      "Oral intake may increase aspiration risk and may interfere with certain emergency procedures",
      "Food always causes internal bleeding",
      "Water causes hypertension",
      "Eating immediately cures abdominal pain"
    ],
    answerIndex: 0,
    explanation:
      "Patients with serious abdominal conditions may require procedures or surgery, and altered condition or vomiting can increase aspiration risk."
  },

  {
    id: "medical-066",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An abdominal emergency patient asks for a drink while awaiting transport. Why might the EMT withhold oral intake?",
    choices: [
      "Aspiration risk and possible need for further intervention",
      "Water permanently damages the stomach",
      "Fluids always cause shock",
      "Drinking causes an MI"
    ],
    answerIndex: 0,
    explanation:
      "Oral intake can increase aspiration risk and may be inappropriate if the patient requires emergency procedures."
  },

  {
    id: "medical-067",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "What position do many patients with severe abdominal discomfort naturally find most comfortable?",
    choices: [
      "On their side with the knees flexed",
      "Flat with both legs fully extended",
      "Standing upright",
      "Prone with the arms overhead"
    ],
    answerIndex: 0,
    explanation:
      "Some patients with abdominal pain find a side-lying position with the knees drawn toward the chest more comfortable."
  },

  {
    id: "medical-068",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient with severe abdominal pain instinctively lies on the side with the knees drawn upward. What does this position commonly indicate?",
    choices: [
      "A position of comfort for abdominal pain",
      "A required treatment for shock",
      "A sign of cardiac arrest",
      "A treatment for airway obstruction"
    ],
    answerIndex: 0,
    explanation:
      "Patients with abdominal pain may naturally assume a side-lying position with flexed hips and knees because it can reduce discomfort."
  },

  {
    id: "trauma-053",
    domain: "Trauma",
    level: "EMT",
    question:
      "Blood begins soaking through a pressure dressing that is already in place. What should the EMT do?",
    choices: [
      "Add additional dressings over the existing material and continue pressure",
      "Remove the original dressing and inspect repeatedly",
      "Stop all pressure",
      "Pour water over the wound"
    ],
    answerIndex: 0,
    explanation:
      "When a dressing becomes saturated, additional dressings should be placed over it while maintaining pressure rather than removing the original dressing."
  },

  {
    id: "trauma-054",
    domain: "Trauma",
    level: "EMT",
    question:
      "A wound dressing becomes saturated with blood but bleeding is not yet life-threatening enough to require a tourniquet. What is the appropriate next step?",
    choices: [
      "Place more dressing material over the existing dressing",
      "Remove the original dressing",
      "Stop applying pressure",
      "Leave the wound completely uncovered"
    ],
    answerIndex: 0,
    explanation:
      "Adding dressing material over the existing dressing allows continued pressure without disrupting clot formation."
  },

  {
    id: "cardiology-061",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Before assisting a patient with prescribed nitroglycerin, an EMT should:",
    choices: [
      "Confirm that the medication is prescribed to the patient and follow applicable medical direction or protocol",
      "Give it to every patient with chest pain",
      "Administer several doses at once",
      "Give it to patients with severe hypotension"
    ],
    answerIndex: 0,
    explanation:
      "EMS administration of prescribed nitroglycerin requires assessment for contraindications and compliance with local protocol or medical direction."
  },

  {
    id: "cardiology-062",
    domain: "Cardiology",
    level: "EMT",
    question:
      "An EMT is asked to help a patient take their prescribed nitroglycerin. What must occur before administration?",
    choices: [
      "The EMT must assess the patient and ensure administration is permitted by protocol or medical direction",
      "The EMT should administer it regardless of blood pressure",
      "The EMT should give it to anyone with a headache",
      "The EMT should double the prescribed dose"
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin has important contraindications, including hypotension, and EMS administration must follow applicable protocol."
  },

  {
    id: "medical-069",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which finding is commonly associated with hypoglycemia?",
    choices: [
      "Altered behavior or combativeness",
      "Warm, dry skin in every case",
      "Slow painless breathing with no mental changes",
      "Persistent hypertension as the only finding"
    ],
    answerIndex: 0,
    explanation:
      "Hypoglycemia can produce altered mental status, confusion, unusual behavior, combativeness, diaphoresis, and other adrenergic or neurologic signs."
  },

  {
    id: "medical-070",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A diabetic patient becomes sweaty, confused, and combative. Which metabolic emergency should be high on the differential?",
    choices: [
      "Hypoglycemia",
      "Hypercalcemia",
      "Dehydration only",
      "Hypertension"
    ],
    answerIndex: 0,
    explanation:
      "Sweating and altered behavior are classic findings that should prompt assessment for low blood glucose."
  },

  // ============================================================================
  // BEHAVIORAL / AIRWAY / SHOCK
  // ============================================================================

  {
    id: "medical-071",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "When communicating with a patient experiencing a behavioral crisis, which approach is generally best?",
    choices: [
      "Use clear, direct communication and explain what you intend to do",
      "Argue with the patient",
      "Make vague threats",
      "Avoid explaining anything"
    ],
    answerIndex: 0,
    explanation:
      "Calm, direct communication can reduce confusion and help establish cooperation while maintaining scene safety."
  },

  {
    id: "medical-072",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An agitated patient is uncertain about what EMS personnel are doing. Which communication strategy can help reduce escalation?",
    choices: [
      "Clearly explain your intentions",
      "Argue about the patient's beliefs",
      "Use confusing medical terminology",
      "Refuse to communicate"
    ],
    answerIndex: 0,
    explanation:
      "Clear, calm explanations help establish trust and reduce uncertainty."
  },

  {
    id: "airway-076",
    domain: "Airway",
    level: "EMT",
    question:
      "Which breath sound is particularly associated with narrowing or swelling of the upper airway?",
    choices: [
      "Stridor",
      "Crackles",
      "Rhonchi",
      "Pleural friction rub"
    ],
    answerIndex: 0,
    explanation:
      "Stridor is a harsh, often high-pitched sound associated with upper-airway obstruction or narrowing."
  },

  {
    id: "airway-077",
    domain: "Airway",
    level: "EMT",
    question:
      "An EMT hears a harsh, high-pitched sound during inspiration in a patient with suspected upper-airway swelling. What is this sound called?",
    choices: [
      "Stridor",
      "Crackles",
      "Wheezing",
      "Rhonchi"
    ],
    answerIndex: 0,
    explanation:
      "Stridor is associated with upper-airway narrowing and is a potentially serious airway finding."
  },

  {
    id: "medical-073",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Diabetes mellitus is fundamentally a disorder involving which metabolic process?",
    choices: [
      "Glucose and carbohydrate metabolism",
      "Bone mineralization only",
      "Lung ventilation only",
      "Skin pigmentation"
    ],
    answerIndex: 0,
    explanation:
      "Diabetes mellitus is characterized by abnormal glucose regulation resulting from impaired insulin secretion, insulin action, or both."
  },

  {
    id: "medical-074",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A chronic disease causes abnormal regulation of blood glucose because of problems involving insulin production or action. What disease is being described?",
    choices: [
      "Diabetes mellitus",
      "Asthma",
      "Osteoporosis",
      "Appendicitis"
    ],
    answerIndex: 0,
    explanation:
      "Diabetes mellitus involves impaired regulation of glucose metabolism related to insulin secretion or insulin action."
  },

  {
    id: "medical-075",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Hypovolemic shock develops when:",
    choices: [
      "Circulating volume becomes insufficient to maintain adequate tissue perfusion",
      "The patient has too much circulating blood",
      "The lungs produce excess oxygen",
      "The heart beats only once per minute in every case"
    ],
    answerIndex: 0,
    explanation:
      "Hypovolemic shock occurs when blood or fluid loss reduces circulating volume enough to impair tissue perfusion."
  },

  {
    id: "medical-076",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient loses a large amount of blood and can no longer maintain adequate tissue perfusion. What type of shock is occurring?",
    choices: [
      "Hypovolemic shock",
      "Neurogenic shock",
      "Obstructive shock",
      "Anaphylactic shock"
    ],
    answerIndex: 0,
    explanation:
      "Major loss of circulating blood volume produces hypovolemic shock."
  },

  {
    id: "medical-077",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Following administration of intramuscular epinephrine for anaphylaxis, effects on symptoms may begin within approximately:",
    choices: [
      "Minutes",
      "Several days",
      "Several weeks",
      "One month"
    ],
    answerIndex: 0,
    explanation:
      "Intramuscular epinephrine can begin producing clinically relevant effects within minutes, which is why it should not be delayed in anaphylaxis."
  },

  {
    id: "medical-078",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Anaphylaxis is treated with an appropriate intramuscular dose of epinephrine. When should the EMT expect effects to begin?",
    choices: [
      "Within minutes",
      "After several days",
      "After several weeks",
      "Only after transport is complete"
    ],
    answerIndex: 0,
    explanation:
      "IM epinephrine has a rapid onset, with effects generally beginning within minutes."
  },

  // ============================================================================
  // TRAUMA / RENAL / SEIZURES
  // ============================================================================

  {
    id: "trauma-055",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which finding by itself is least specific for high-energy trauma?",
    choices: [
      "Airbag deployment",
      "Major vehicle intrusion",
      "A high-speed collision",
      "Significant occupant displacement"
    ],
    answerIndex: 0,
    explanation:
      "Airbag deployment alone does not establish the magnitude of energy involved. It must be interpreted with the complete mechanism."
  },

  {
    id: "trauma-056",
    domain: "Trauma",
    level: "EMT",
    question:
      "An airbag has deployed, but there is no major intrusion, occupant displacement, or other evidence of a high-energy crash. Which finding is least specific for major trauma by itself?",
    choices: [
      "Airbag deployment",
      "Extensive vehicle intrusion",
      "Major occupant displacement",
      "High-speed collision"
    ],
    answerIndex: 0,
    explanation:
      "Airbag deployment can occur in crashes of varying severity, so it should not be used alone to determine injury severity."
  },

  {
    id: "medical-079",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Chronic renal failure is commonly associated with long-term:",
    choices: [
      "Hypertension or diabetes",
      "Seasonal allergies",
      "Minor skin abrasions",
      "Low oxygen exposure alone"
    ],
    answerIndex: 0,
    explanation:
      "Diabetes and hypertension are among the leading causes of chronic kidney disease."
  },

  {
    id: "medical-080",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has progressive chronic kidney disease. Which two common underlying conditions should the EMT recognize as major causes?",
    choices: [
      "Diabetes and hypertension",
      "Asthma and eczema",
      "Migraine and appendicitis",
      "Seasonal allergies and influenza"
    ],
    answerIndex: 0,
    explanation:
      "Long-standing diabetes and hypertension are major contributors to chronic kidney disease."
  },

  {
    id: "medical-081",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A generalized tonic-clonic seizure typically involves:",
    choices: [
      "Bilateral abnormal motor activity involving much of the body",
      "Only movement of one finger",
      "No alteration in brain activity",
      "Only abdominal muscle contractions"
    ],
    answerIndex: 0,
    explanation:
      "Generalized tonic-clonic seizures involve widespread bilateral motor activity, usually progressing through tonic and clonic phases."
  },

  {
    id: "medical-082",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient suddenly develops widespread stiffening followed by rhythmic jerking of the limbs. What type of seizure pattern does this suggest?",
    choices: [
      "Generalized tonic-clonic seizure",
      "Simple absence seizure",
      "Focal sensory seizure only",
      "Syncope"
    ],
    answerIndex: 0,
    explanation:
      "Generalized tonic-clonic seizures characteristically involve widespread tonic stiffening followed by rhythmic clonic movements."
  },

  {
    id: "medical-083",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Pelvic inflammatory disease primarily affects which structures rather than the urinary bladder?",
    choices: [
      "The female reproductive organs",
      "The lungs",
      "The brain",
      "The thyroid"
    ],
    answerIndex: 0,
    explanation:
      "PID is an infection involving the upper female reproductive tract, including structures such as the uterus, fallopian tubes, and ovaries."
  },

  {
    id: "medical-084",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An infection involves the uterus and fallopian tubes rather than the urinary bladder. Which condition best fits this pattern?",
    choices: [
      "Pelvic inflammatory disease",
      "Pneumonia",
      "Cystitis",
      "Appendicitis"
    ],
    answerIndex: 0,
    explanation:
      "PID involves infection of the upper female reproductive tract."
  },

  {
    id: "medical-085",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Delirium tremens is a severe withdrawal syndrome associated with cessation of heavy use of:",
    choices: [
      "Alcohol",
      "Acetaminophen",
      "Insulin",
      "Oxygen"
    ],
    answerIndex: 0,
    explanation:
      "Delirium tremens can occur during severe alcohol withdrawal and may involve agitation, confusion, hallucinations, autonomic instability, and seizures."
  },

  {
    id: "medical-086",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient who abruptly stopped heavy alcohol use develops confusion, agitation, hallucinations, and autonomic instability. What condition should be suspected?",
    choices: [
      "Delirium tremens",
      "Hypothermia",
      "Stable angina",
      "Simple dehydration"
    ],
    answerIndex: 0,
    explanation:
      "Delirium tremens is a potentially life-threatening manifestation of severe alcohol withdrawal."
  },

  // ============================================================================
  // ALLERGIC REACTIONS / ORTHOPEDIC TRAUMA / TOXICOLOGY
  // ============================================================================

  {
    id: "medical-087",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which finding would be least consistent with a typical allergic reaction?",
    choices: [
      "Dry eyes",
      "Hives",
      "Flushing",
      "Abdominal cramping"
    ],
    answerIndex: 0,
    explanation:
      "Allergic reactions commonly cause urticaria, flushing, respiratory symptoms, gastrointestinal symptoms, and other histamine-mediated effects. Dry eyes are not a classic feature."
  },

  {
    id: "medical-088",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has flushing, hives, and abdominal cramping after allergen exposure. Which finding would be least characteristic of the same reaction?",
    choices: [
      "Dry eyes",
      "Urticaria",
      "Flushing",
      "Abdominal cramping"
    ],
    answerIndex: 0,
    explanation:
      "Dry eyes are not a typical manifestation of an acute allergic reaction, whereas hives, flushing, and GI symptoms may occur."
  },

  {
    id: "trauma-057",
    domain: "Trauma",
    level: "EMT",
    question:
      "A fractured femur can cause substantial hidden blood loss. Approximately how much blood may be lost into the thigh?",
    choices: [
      "About 1 to 2 liters",
      "About 50 mL",
      "About 100 mL",
      "About 10 mL"
    ],
    answerIndex: 0,
    explanation:
      "A femur fracture can result in approximately 1 to 2 liters of internal blood loss, although actual blood loss varies."
  },

  {
    id: "trauma-058",
    domain: "Trauma",
    level: "EMT",
    question:
      "An adult with a major femoral fracture develops signs of hypovolemia despite little external bleeding. What magnitude of hidden blood loss is possible?",
    choices: [
      "Approximately 1 to 2 liters",
      "Only a few milliliters",
      "Less than 10 mL",
      "Exactly 25 mL"
    ],
    answerIndex: 0,
    explanation:
      "The thigh can accommodate a large volume of blood, and femoral fractures can result in approximately 1 to 2 liters of blood loss."
  },

  {
    id: "medical-089",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A significant acetaminophen overdose can cause severe injury to which organ?",
    choices: [
      "Liver",
      "Spleen",
      "Bladder",
      "Thyroid"
    ],
    answerIndex: 0,
    explanation:
      "Acetaminophen overdose can cause severe hepatotoxicity and, in serious cases, acute liver failure."
  },

  {
    id: "medical-090",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has taken a potentially toxic amount of acetaminophen. Which organ is at greatest risk for serious toxicity?",
    choices: [
      "Liver",
      "Spleen",
      "Lung",
      "Bladder"
    ],
    answerIndex: 0,
    explanation:
      "Acetaminophen overdose is particularly dangerous because of its potential to cause severe liver injury."
  },

  {
    id: "cardiology-063",
    domain: "Cardiology",
    level: "EMT",
    question:
      "What term describes the ability of cardiac muscle cells to generate electrical impulses without an external nerve stimulus?",
    choices: [
      "Automaticity",
      "Contractility",
      "Afterload",
      "Preload"
    ],
    answerIndex: 0,
    explanation:
      "Automaticity is the ability of certain cardiac cells to spontaneously generate electrical impulses."
  },

  {
    id: "cardiology-064",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Cardiac cells can spontaneously generate electrical impulses without receiving a command from a nerve. What property allows this?",
    choices: [
      "Automaticity",
      "Afterload",
      "Preload",
      "Compliance"
    ],
    answerIndex: 0,
    explanation:
      "Automaticity allows cardiac pacemaker cells to generate impulses spontaneously."
  },

  {
    id: "medical-091",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Heroin belongs to which drug class?",
    choices: [
      "Opioid",
      "Stimulant",
      "Benzodiazepine",
      "Antipsychotic"
    ],
    answerIndex: 0,
    explanation:
      "Heroin is a potent opioid that can cause respiratory depression and altered mental status."
  },

  {
    id: "medical-092",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has respiratory depression after using heroin. Which pharmacologic class does heroin belong to?",
    choices: [
      "Opioid",
      "Stimulant",
      "Antihistamine",
      "Beta blocker"
    ],
    answerIndex: 0,
    explanation:
      "Heroin is an opioid and can cause profound central nervous system and respiratory depression."
  },

  {
    id: "cardiology-065",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which finding is NOT a typical effect of nitroglycerin?",
    choices: [
      "Hypertension",
      "Headache",
      "Hypotension",
      "Lightheadedness"
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin is a vasodilator and can cause hypotension, headache, and dizziness. Hypertension is not a typical effect."
  },

  {
    id: "cardiology-066",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient takes nitroglycerin. Which finding would be least expected from the medication's usual vasodilatory effects?",
    choices: [
      "Hypertension",
      "Headache",
      "Hypotension",
      "Lightheadedness"
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin can lower blood pressure and commonly causes headache. Hypertension is not a typical effect."
  },

  // ============================================================================
  // CARDIAC ANATOMY / PERFUSION / ARREST
  // ============================================================================

  {
    id: "cardiology-067",
    domain: "Cardiology",
    level: "EMT",
    question:
      "What is the primary function of the left atrium?",
    choices: [
      "Receive oxygenated blood returning from the lungs",
      "Pump blood directly into the aorta",
      "Receive blood from the vena cava",
      "Pump blood into the pulmonary artery"
    ],
    answerIndex: 0,
    explanation:
      "The left atrium receives oxygenated blood from the pulmonary veins and passes it to the left ventricle."
  },

  {
    id: "cardiology-068",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Oxygen-rich blood arriving from the lungs enters which chamber of the heart first?",
    choices: [
      "Left atrium",
      "Right atrium",
      "Left ventricle",
      "Right ventricle"
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary veins carry oxygenated blood into the left atrium."
  },

  {
    id: "cardiology-069",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Perfusion is best defined as:",
    choices: [
      "Adequate blood flow through tissues to meet their metabolic needs",
      "The amount of oxygen in the atmosphere",
      "The movement of air into the lungs",
      "The total amount of blood in the body"
    ],
    answerIndex: 0,
    explanation:
      "Perfusion refers to blood flow through tissues sufficient to deliver oxygen and nutrients and remove metabolic waste."
  },

  {
    id: "cardiology-070",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A tissue receives enough blood flow to meet its oxygen and metabolic requirements. What physiologic process is being described?",
    choices: [
      "Perfusion",
      "Ventilation",
      "Diffusion",
      "Filtration"
    ],
    answerIndex: 0,
    explanation:
      "Perfusion is the delivery of blood through tissues in amounts sufficient to meet metabolic needs."
  },

  {
    id: "cardiology-071",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Why can ventricular tachycardia produce hypotension?",
    choices: [
      "The rapid ventricular rate can reduce effective ventricular filling and stroke volume",
      "It always causes increased blood volume",
      "It increases the amount of oxygen in the stomach",
      "It causes the atria to stop producing blood"
    ],
    answerIndex: 0,
    explanation:
      "Very rapid ventricular rates can reduce filling time and impair effective cardiac output."
  },

  {
    id: "cardiology-072",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient with ventricular tachycardia becomes hypotensive. Which mechanism can account for the loss of blood pressure?",
    choices: [
      "Reduced ventricular filling and effective stroke volume",
      "Increased circulating volume",
      "Increased gastric pressure",
      "Increased red blood cell production"
    ],
    answerIndex: 0,
    explanation:
      "VT can severely reduce ventricular filling and coordinated contraction, decreasing cardiac output."
  },

  {
    id: "cardiology-073",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "You arrive to find an adult who is unresponsive, apneic, and pulseless. Bystanders have not started CPR. What should you do?",
    choices: [
      "Begin high-quality CPR immediately and use the AED as soon as available",
      "Wait for a paramedic before starting care",
      "Give oral glucose",
      "Place the patient in a recovery position"
    ],
    answerIndex: 0,
    explanation:
      "An unresponsive, apneic, pulseless adult requires immediate CPR and rapid defibrillation when indicated."
  },

  {
    id: "cardiology-074",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An adult is found pulseless and not breathing normally. What is the EMT's immediate priority?",
    choices: [
      "Start CPR and rapidly obtain/use an AED",
      "Perform a detailed secondary assessment first",
      "Give oral fluids",
      "Wait for the patient to regain consciousness"
    ],
    answerIndex: 0,
    explanation:
      "Cardiac arrest requires immediate CPR and rapid access to an AED or defibrillator."
  },

  {
    id: "trauma-059",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which combination is concerning for early intra-abdominal bleeding?",
    choices: [
      "Abdominal pain with increasing distention",
      "Isolated itchy eyes",
      "A mild sore throat",
      "Localized finger pain"
    ],
    answerIndex: 0,
    explanation:
      "Pain and abdominal distention can occur as blood accumulates inside the abdominal cavity."
  },

  {
    id: "trauma-060",
    domain: "Trauma",
    level: "EMT",
    question:
      "A trauma patient develops worsening abdominal pain and progressive distention. Which complication should be suspected?",
    choices: [
      "Intra-abdominal hemorrhage",
      "Simple allergic rhinitis",
      "Isolated ear infection",
      "Minor hand trauma"
    ],
    answerIndex: 0,
    explanation:
      "Abdominal pain and distention can be early findings of significant internal bleeding."
  },

  {
    id: "medical-093",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which medication blocks histamine receptors and is commonly used for allergic symptoms?",
    choices: [
      "Diphenhydramine",
      "Albuterol",
      "Acetaminophen",
      "Epinephrine"
    ],
    answerIndex: 0,
    explanation:
      "Diphenhydramine is an H1 antihistamine that blocks histamine-mediated effects. Epinephrine remains first-line treatment for anaphylaxis."
  },

  {
    id: "medical-094",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An antihistamine is needed to block H1 histamine receptors. Which medication fits this description?",
    choices: [
      "Diphenhydramine",
      "Albuterol",
      "Acetaminophen",
      "Nitroglycerin"
    ],
    answerIndex: 0,
    explanation:
      "Diphenhydramine is an H1 antihistamine that blocks histamine receptors."
  },

  {
    id: "medical-095",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Among the major routes of toxic exposure, which is often particularly difficult to treat because the substance has already entered the circulation?",
    choices: [
      "Injection",
      "Ingestion",
      "Inhalation",
      "Skin contact"
    ],
    answerIndex: 0,
    explanation:
      "Injected poisons can enter the bloodstream directly, making removal or decontamination difficult."
  },

  {
    id: "medical-096",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A toxin has been delivered directly into a patient's tissues or bloodstream, leaving little opportunity for external decontamination. Which exposure route occurred?",
    choices: [
      "Injection",
      "Ingestion",
      "Dermal exposure",
      "Inhalation"
    ],
    answerIndex: 0,
    explanation:
      "Injection introduces a substance directly into the body and can make treatment particularly challenging."
  },

  // ============================================================================
  // OBGYN / DIABETES / RESPIRATORY
  // ============================================================================

  {
    id: "medical-097",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "When caring for a patient with a gynecologic emergency, the EMT's primary priorities are to:",
    choices: [
      "Maintain the ABCs, manage life threats, and arrange appropriate transport",
      "Perform a complete pelvic examination in the field",
      "Delay transport until all pain resolves",
      "Focus only on obtaining a medical history"
    ],
    answerIndex: 0,
    explanation:
      "EMS care focuses on life threats, ABC management, appropriate assessment, supportive care, and timely transport."
  },

  {
    id: "medical-098",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has a potentially serious gynecologic emergency. What should remain the EMT's primary focus?",
    choices: [
      "Life threats, ABCs, supportive care, and timely transport",
      "A complete invasive examination",
      "Delaying transport for laboratory testing",
      "Treating pain before assessing vital signs"
    ],
    answerIndex: 0,
    explanation:
      "The EMT should prioritize life-threatening problems, maintain the ABCs, and transport without unnecessary delay."
  },

  {
    id: "medical-099",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A confused diabetic patient is sweaty, tachycardic, and breathing rapidly. If hypoglycemia is suspected and the patient cannot safely take oral glucose, what assessment is essential?",
    choices: [
      "Obtain a blood glucose measurement if available",
      "Assume the patient has hyperglycemia",
      "Give insulin immediately",
      "Ignore the patient's mental status"
    ],
    answerIndex: 0,
    explanation:
      "Blood glucose measurement helps distinguish hypoglycemia from other causes of altered mental status when a glucometer is available."
  },

  {
    id: "medical-100",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An altered diabetic patient has diaphoresis and abnormal behavior. Which objective measurement can rapidly help identify hypoglycemia?",
    choices: [
      "Blood glucose",
      "Body weight",
      "Visual acuity",
      "Grip strength"
    ],
    answerIndex: 0,
    explanation:
      "A point-of-care blood glucose measurement can rapidly identify or exclude hypoglycemia."
  },

  {
    id: "trauma-061",
    domain: "Trauma",
    level: "EMT",
    question:
      "When evaluating a vehicle-versus-pedestrian collision, which mechanism detail is particularly important?",
    choices: [
      "The estimated speed of the vehicle",
      "The patient's favorite color",
      "The weather from the previous week",
      "The patient's shoe brand"
    ],
    answerIndex: 0,
    explanation:
      "Vehicle speed, point of impact, patient trajectory, and secondary impacts help determine the energy transferred to the patient."
  },

  {
    id: "trauma-062",
    domain: "Trauma",
    level: "EMT",
    question:
      "A pedestrian was struck by a vehicle. Which piece of information is especially useful when estimating the energy involved?",
    choices: [
      "Approximate vehicle speed",
      "The patient's favorite food",
      "The patient's occupation",
      "The color of the vehicle"
    ],
    answerIndex: 0,
    explanation:
      "Vehicle speed is an important component of the mechanism of injury and helps estimate the energy involved."
  },

  {
    id: "medical-101",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "When administering an epinephrine auto-injector, where is the preferred injection site?",
    choices: [
      "The lateral thigh",
      "The abdomen",
      "The wrist",
      "The palm"
    ],
    answerIndex: 0,
    explanation:
      "Epinephrine auto-injectors are designed for intramuscular administration into the lateral thigh."
  },

  {
    id: "medical-102",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT is preparing to administer a prescribed epinephrine auto-injector. Which anatomical location is the intended site?",
    choices: [
      "Lateral thigh",
      "Forearm",
      "Abdomen",
      "Hand"
    ],
    answerIndex: 0,
    explanation:
      "The lateral thigh is the recommended site for epinephrine auto-injector administration."
  },

  {
    id: "trauma-063",
    domain: "Trauma",
    level: "EMT",
    question:
      "A dissecting aortic aneurysm occurs when:",
    choices: [
      "Blood enters a tear in the aortic wall and separates its layers",
      "The pulmonary artery becomes infected",
      "The aorta completely disappears",
      "The heart stops contracting"
    ],
    answerIndex: 0,
    explanation:
      "In an aortic dissection, blood enters through a tear in the intimal layer and tracks between layers of the aortic wall."
  },

  {
    id: "trauma-064",
    domain: "Trauma",
    level: "EMT",
    question:
      "Blood forces its way between layers of the aortic wall after a tear develops. What vascular emergency is being described?",
    choices: [
      "Aortic dissection",
      "Pulmonary embolism",
      "Deep vein thrombosis",
      "Cardiac tamponade"
    ],
    answerIndex: 0,
    explanation:
      "An aortic dissection occurs when blood enters the wall through an intimal tear and separates its layers."
  },

  {
    id: "trauma-065",
    domain: "Trauma",
    level: "EMT",
    question:
      "Why can a seemingly minor fall cause a serious fracture in an older adult?",
    choices: [
      "Age-related bone loss such as osteoporosis can weaken bones",
      "Older adults have stronger bones than younger adults",
      "Falls cannot fracture bones in older adults",
      "Bone density always increases with age"
    ],
    answerIndex: 0,
    explanation:
      "Osteoporosis and other age-related changes can reduce bone strength, allowing relatively low-energy falls to produce fractures."
  },

  {
    id: "trauma-066",
    domain: "Trauma",
    level: "EMT",
    question:
      "An older patient sustains a fracture after a relatively low-energy fall. Which underlying condition could explain the injury severity?",
    choices: [
      "Osteoporosis",
      "Increased bone density",
      "Hyperoxygenation",
      "Improved joint stability"
    ],
    answerIndex: 0,
    explanation:
      "Osteoporosis weakens bone and increases fracture risk from relatively minor mechanisms."
  },

  // ============================================================================
  // SEXUAL ASSAULT / STI / PREGNANCY
  // ============================================================================

  {
    id: "medical-103",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "When assessing a patient after a sexual assault, the field physical examination should primarily:",
    choices: [
      "Identify and treat immediate life threats while avoiding unnecessary examination",
      "Include a complete forensic examination by the EMT",
      "Focus exclusively on collecting evidence",
      "Delay all medical treatment until police arrive"
    ],
    answerIndex: 0,
    explanation:
      "EMS should address life threats and provide appropriate medical care while preserving evidence and avoiding unnecessary examination."
  },

  {
    id: "medical-104",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A sexual-assault patient has no obvious life-threatening injury. What should the EMT avoid doing in the field?",
    choices: [
      "Performing an unnecessary extensive physical examination",
      "Assessing for immediate threats",
      "Providing reassurance",
      "Arranging appropriate transport"
    ],
    answerIndex: 0,
    explanation:
      "EMS should limit examination to what is medically necessary while preserving forensic evidence and patient dignity."
  },

  {
    id: "medical-105",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which symptom can occur in both men and women with gonorrhea?",
    choices: [
      "Painful urination",
      "Complete loss of hearing",
      "Persistent jaundice",
      "Severe hypothermia"
    ],
    answerIndex: 0,
    explanation:
      "Dysuria, or painful urination, can occur in both men and women with gonorrhea."
  },

  {
    id: "medical-106",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient with a sexually transmitted infection reports burning or pain while urinating. Which infection can produce this symptom in both sexes?",
    choices: [
      "Gonorrhea",
      "Tetanus",
      "Influenza",
      "Measles"
    ],
    answerIndex: 0,
    explanation:
      "Gonorrhea can cause dysuria in both men and women."
  },

  {
    id: "airway-078",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with altered mental status has a history of chest pain the previous day and now has rapid, shallow breathing. What is the immediate respiratory priority?",
    choices: [
      "Assist ventilations if the patient's breathing is inadequate",
      "Give oral fluids",
      "Have the patient walk around",
      "Delay respiratory care until transport begins"
    ],
    answerIndex: 0,
    explanation:
      "Rapid, shallow respirations may be inadequate. If ventilation is insufficient, assisted ventilation is the priority."
  },

  {
    id: "airway-079",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An altered patient is breathing rapidly but with very shallow tidal volumes. What intervention should the EMT prioritize if ventilation is inadequate?",
    choices: [
      "Assisted ventilation",
      "Oral fluids",
      "A walking assessment",
      "A detailed secondary exam first"
    ],
    answerIndex: 0,
    explanation:
      "Respiratory rate alone does not guarantee adequate ventilation. Shallow, ineffective breathing requires ventilatory support."
  },

  {
    id: "medical-107",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Type 1 diabetes is characterized by:",
    choices: [
      "Little or no endogenous insulin production",
      "Excessive insulin production in every patient",
      "A complete inability to absorb oxygen",
      "Permanent high blood pressure"
    ],
    answerIndex: 0,
    explanation:
      "Type 1 diabetes results from autoimmune destruction of pancreatic beta cells, leading to an absolute insulin deficiency."
  },

  {
    id: "medical-108",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient's pancreas produces little or no endogenous insulin because of beta-cell destruction. Which type of diabetes is this?",
    choices: [
      "Type 1 diabetes",
      "Type 2 diabetes",
      "Gestational diabetes only",
      "Diabetes insipidus"
    ],
    answerIndex: 0,
    explanation:
      "Type 1 diabetes involves an absolute deficiency of insulin caused by destruction of pancreatic beta cells."
  },

  {
    id: "medical-109",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Menarche, the first menstrual period, most commonly occurs during which approximate age range?",
    choices: [
      "11 to 16 years",
      "2 to 5 years",
      "18 to 25 years",
      "30 to 40 years"
    ],
    answerIndex: 0,
    explanation:
      "Menarche typically occurs during adolescence, often between approximately 11 and 16 years, although individual variation is normal."
  },

  {
    id: "medical-110",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A healthy adolescent experiences her first menstrual period. Which age range is generally consistent with normal menarche?",
    choices: [
      "11 to 16 years",
      "2 to 5 years",
      "25 to 30 years",
      "35 to 45 years"
    ],
    answerIndex: 0,
    explanation:
      "Menarche generally occurs during adolescence, commonly around ages 11 to 16."
  },

  // ============================================================================
  // BALLISTICS / EXPLOSIONS / MULTIPLE PATIENTS
  // ============================================================================

  {
    id: "trauma-067",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which characteristic of a bullet has a major influence on the amount of kinetic energy delivered to tissue?",
    choices: [
      "Velocity",
      "Color",
      "Manufacturer's logo",
      "Shape of the cartridge box"
    ],
    answerIndex: 0,
    explanation:
      "Kinetic energy increases with the square of velocity, making projectile velocity a major determinant of tissue injury."
  },

  {
    id: "trauma-068",
    domain: "Trauma",
    level: "EMT",
    question:
      "Two projectiles have similar masses, but one is traveling substantially faster. Which projectile generally has greater kinetic energy and therefore greater potential for tissue damage?",
    choices: [
      "The faster projectile",
      "The slower projectile",
      "Both always have identical energy",
      "Neither can cause tissue injury"
    ],
    answerIndex: 0,
    explanation:
      "Kinetic energy is proportional to the square of velocity, so increased projectile velocity can greatly increase energy transfer."
  },

  {
    id: "medical-111",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has a blood glucose level of 300 mg/dL and altered mental status. Which statement is most appropriate?",
    choices: [
      "The patient has significant hyperglycemia and requires assessment for a hyperglycemic emergency",
      "Insulin should automatically be administered by every EMT",
      "The patient definitely has hypoglycemia",
      "The glucose level is normal"
    ],
    answerIndex: 0,
    explanation:
      "A glucose level of 300 mg/dL is significantly elevated. EMS should assess for hyperglycemic emergencies and provide supportive care and transport according to protocol."
  },

  {
    id: "medical-112",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has altered mental status and a glucose reading of 300 mg/dL. What problem should the EMT consider?",
    choices: [
      "A hyperglycemic emergency",
      "Severe hypoglycemia",
      "Normal glucose physiology",
      "A guaranteed insulin overdose"
    ],
    answerIndex: 0,
    explanation:
      "A glucose of 300 mg/dL represents significant hyperglycemia and warrants evaluation for conditions such as diabetic ketoacidosis or hyperosmolar illness."
  },

  {
    id: "ops-327",
    domain: "EMS Operations",
    level: "EMT",
    question:
      "In physics, what term describes a force acting through a distance?",
    choices: [
      "Work",
      "Pressure",
      "Density",
      "Frequency"
    ],
    answerIndex: 0,
    explanation:
      "Mechanical work occurs when a force causes displacement through a distance."
  },

  {
    id: "ops-328",
    domain: "EMS Operations",
    level: "EMT",
    question:
      "An object is moved through a distance because a force acts on it. What physical quantity is being described?",
    choices: [
      "Work",
      "Density",
      "Pressure",
      "Temperature"
    ],
    answerIndex: 0,
    explanation:
      "Work is the transfer of energy that occurs when a force produces displacement."
  },

  {
    id: "cardiology-075",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which finding would be least typical of acute myocardial infarction?",
    choices: [
      "Chest pain that is clearly worsened by breathing",
      "Unexplained diaphoresis",
      "Dyspnea",
      "Pressure-like chest discomfort"
    ],
    answerIndex: 0,
    explanation:
      "Pleuritic pain that changes significantly with breathing is less characteristic of myocardial ischemia, although atypical presentations can occur."
  },

  {
    id: "cardiology-076",
    domain: "Cardiology",
    level: "EMT",
    question:
      "An EMT is evaluating possible acute coronary syndrome. Which symptom pattern is least characteristic of myocardial ischemia?",
    choices: [
      "Pain that is strongly pleuritic",
      "Unexplained sweating",
      "Dyspnea",
      "Pressure-like chest discomfort"
    ],
    answerIndex: 0,
    explanation:
      "Pain that is clearly affected by respiration is less typical of myocardial ischemia than pressure-like or squeezing discomfort."
  },

  {
    id: "trauma-069",
    domain: "Trauma",
    level: "EMT",
    question:
      "Fire ants typically injure their victims by:",
    choices: [
      "Biting repeatedly",
      "Stinging exactly once",
      "Injecting venom through a single large barb",
      "Biting only after becoming unconscious"
    ],
    answerIndex: 0,
    explanation:
      "Fire ants can bite repeatedly and then sting multiple times."
  },

  {
    id: "trauma-070",
    domain: "Trauma",
    level: "EMT",
    question:
      "A patient reports several painful fire-ant injuries clustered in one area. What mechanism is typical of fire-ant attacks?",
    choices: [
      "Repeated biting and stinging",
      "One single sting only",
      "A single large puncture wound",
      "A chemical burn"
    ],
    answerIndex: 0,
    explanation:
      "Fire ants commonly bite and sting repeatedly, producing multiple painful lesions."
  },

  {
    id: "trauma-071",
    domain: "Trauma",
    level: "EMT",
    question:
      "A person's ability to compensate for blood loss is strongly influenced by:",
    choices: [
      "How quickly the blood is lost",
      "The patient's hair color",
      "The ambient noise level",
      "The patient's height alone"
    ],
    answerIndex: 0,
    explanation:
      "Rapid blood loss overwhelms compensatory mechanisms more quickly than a comparable volume lost gradually."
  },

  {
    id: "trauma-072",
    domain: "Trauma",
    level: "EMT",
    question:
      "Two patients each lose the same volume of blood, but one loses it within minutes and the other over many hours. What factor explains why the first patient is generally more unstable?",
    choices: [
      "Rate of blood loss",
      "Hair color",
      "Ambient temperature alone",
      "Height"
    ],
    answerIndex: 0,
    explanation:
      "The rate of hemorrhage strongly affects how quickly the cardiovascular system becomes unable to compensate."
  },

  {
    id: "trauma-073",
    domain: "Trauma",
    level: "EMT",
    question:
      "A person is standing near a large explosion. Which injury can result from blast overpressure?",
    choices: [
      "Rupture of gas-containing organs such as the lungs or gastrointestinal tract",
      "Only superficial sunburn",
      "Only broken fingernails",
      "Hypoglycemia in every case"
    ],
    answerIndex: 0,
    explanation:
      "Primary blast injuries result from pressure waves and can damage gas-filled structures, including the lungs and gastrointestinal tract."
  },

  {
    id: "trauma-074",
    domain: "Trauma",
    level: "EMT",
    question:
      "A blast wave causes injury to a patient's gas-filled organs without direct impact from debris. What type of blast injury is this?",
    choices: [
      "Primary blast injury",
      "Secondary blast injury",
      "Tertiary blast injury",
      "Thermal injury"
    ],
    answerIndex: 0,
    explanation:
      "Primary blast injuries result directly from the pressure wave and commonly affect gas-containing structures."
  },

  {
    id: "trauma-075",
    domain: "Trauma",
    level: "EMT",
    question:
      "If one occupant of a severely damaged vehicle is found dead after a major collision, the EMT should:",
    choices: [
      "Consider the possibility that other occupants sustained significant trauma",
      "Assume the remaining occupants are uninjured",
      "Transport only the deceased occupant",
      "Ignore the crash mechanism"
    ],
    answerIndex: 0,
    explanation:
      "The severity of injuries to one occupant provides important information about the energy involved and raises concern for other occupants."
  },

  {
    id: "trauma-076",
    domain: "Trauma",
    level: "EMT",
    question:
      "One passenger dies during a high-energy collision while other occupants survive. What should the EMT infer about the surviving occupants?",
    choices: [
      "They may have significant occult trauma and require careful assessment",
      "They are automatically uninjured",
      "They require no vital signs",
      "The crash mechanism is irrelevant"
    ],
    answerIndex: 0,
    explanation:
      "A fatality in the same vehicle indicates substantial energy transfer and should increase suspicion for serious injuries among survivors."
  },

  // ============================================================================
  // BEHAVIORAL / SEXUAL ASSAULT / AIRWAY
  // ============================================================================

  {
    id: "medical-113",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which combination can be seen in a severely agitated patient with a medical or toxicologic emergency?",
    choices: [
      "Diaphoresis, tachycardia, and hallucinations",
      "Normal mental status with no autonomic findings",
      "Isolated ankle pain",
      "Only a mild headache"
    ],
    answerIndex: 0,
    explanation:
      "Severe agitation accompanied by autonomic activation and hallucinations can occur in serious medical, psychiatric, or toxicologic emergencies and requires careful assessment."
  },

  {
    id: "medical-114",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An extremely agitated patient is sweating heavily, has a rapid pulse, and is hallucinating. Which finding pattern is present?",
    choices: [
      "Autonomic activation with altered behavior",
      "Normal physiologic behavior",
      "Simple musculoskeletal injury",
      "Isolated dermatologic disease"
    ],
    answerIndex: 0,
    explanation:
      "Diaphoresis and tachycardia indicate autonomic activation, while hallucinations indicate altered mental status."
  },

  {
    id: "medical-115",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "When practical and requested, a sexual-assault patient should be offered:",
    choices: [
      "The option of being cared for by a provider of the patient's preferred gender",
      "No medical care",
      "A complete forensic examination by EMS",
      "Immediate discharge without assessment"
    ],
    answerIndex: 0,
    explanation:
      "Respecting patient preferences can improve comfort and cooperation. EMS should provide appropriate medical care while preserving evidence."
  },

  {
    id: "medical-116",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A sexual-assault survivor requests a provider of a particular gender when one is reasonably available. What should EMS do?",
    choices: [
      "Accommodate the request when feasible",
      "Ignore the request automatically",
      "Refuse transport",
      "Perform an unnecessary examination instead"
    ],
    answerIndex: 0,
    explanation:
      "Patient dignity and comfort are important, and reasonable requests should be accommodated when operationally feasible."
  },

  {
    id: "trauma-077",
    domain: "Trauma",
    level: "EMT",
    question:
      "Following significant head trauma, blood or clear fluid coming from the nose may indicate:",
    choices: [
      "A possible skull or facial fracture",
      "Simple seasonal allergies in every case",
      "Normal nasal drainage",
      "Hypoglycemia"
    ],
    answerIndex: 0,
    explanation:
      "Bleeding or cerebrospinal-fluid-like drainage from the nose after significant head trauma can indicate a skull or facial fracture."
  },

  {
    id: "trauma-078",
    domain: "Trauma",
    level: "EMT",
    question:
      "A patient develops bloody nasal drainage after significant blunt head trauma. What injury should the EMT consider?",
    choices: [
      "Skull or facial fracture",
      "Simple dehydration",
      "Hypoglycemia",
      "An uncomplicated ankle sprain"
    ],
    answerIndex: 0,
    explanation:
      "Nasal bleeding after significant head trauma can be associated with facial or skull fractures and warrants careful assessment."
  },

  {
    id: "medical-117",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which finding is NOT a common side effect of epinephrine?",
    choices: [
      "Drowsiness",
      "Tremor",
      "Tachycardia",
      "Anxiety or nervousness"
    ],
    answerIndex: 0,
    explanation:
      "Epinephrine commonly causes tachycardia, tremor, anxiety, and palpitations. Drowsiness is not a typical expected effect."
  },

  {
    id: "medical-118",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient receives epinephrine for anaphylaxis. Which reaction would be least expected from the medication?",
    choices: [
      "Drowsiness",
      "Tremor",
      "Rapid pulse",
      "Anxiety"
    ],
    answerIndex: 0,
    explanation:
      "Epinephrine commonly produces sympathetic effects such as tachycardia, tremor, and nervousness rather than drowsiness."
  },

  {
    id: "medical-119",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Severe diabetic decompensation can produce coma because of a combination of:",
    choices: [
      "Severe hyperglycemia, dehydration, and metabolic disturbance",
      "Low body temperature alone",
      "Excessive oxygen only",
      "Minor hypoglycemia in every case"
    ],
    answerIndex: 0,
    explanation:
      "Severe hyperglycemic emergencies can cause profound dehydration, electrolyte abnormalities, and metabolic disturbances leading to altered mental status or coma."
  },

  {
    id: "medical-120",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A diabetic patient becomes profoundly dehydrated and develops severe hyperglycemia with altered consciousness. What physiologic process is most concerning?",
    choices: [
      "A hyperglycemic metabolic emergency",
      "Simple allergic rhinitis",
      "A minor orthopedic injury",
      "Normal glucose regulation"
    ],
    answerIndex: 0,
    explanation:
      "Severe hyperglycemic emergencies can cause dehydration, electrolyte abnormalities, and altered consciousness."
  },

  {
    id: "medical-121",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Kussmaul respirations are a compensatory response intended to:",
    choices: [
      "Remove carbon dioxide and help reduce metabolic acidosis",
      "Increase carbon dioxide levels",
      "Stop oxygen from entering the lungs",
      "Lower blood glucose directly"
    ],
    answerIndex: 0,
    explanation:
      "Deep, rapid Kussmaul respirations increase ventilation and help remove CO2, partially compensating for metabolic acidosis."
  },

  {
    id: "medical-122",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient develops deep, rapid respirations as the body attempts to compensate for severe metabolic acidosis. What respiratory pattern is this?",
    choices: [
      "Kussmaul respirations",
      "Cheyne-Stokes respirations",
      "Agonal respirations",
      "Ataxic respirations"
    ],
    answerIndex: 0,
    explanation:
      "Kussmaul respirations are deep and rapid and represent respiratory compensation for metabolic acidosis."
  },

  // ============================================================================
  // CARDIOLOGY / ALLERGY / BLEEDING
  // ============================================================================

  {
    id: "cardiology-077",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Angina pectoris occurs when:",
    choices: [
      "Myocardial oxygen demand exceeds the available oxygen supply",
      "The brain receives too much oxygen",
      "The lungs stop exchanging nitrogen",
      "The stomach becomes distended"
    ],
    answerIndex: 0,
    explanation:
      "Angina results from myocardial ischemia when oxygen demand exceeds coronary oxygen supply."
  },

  {
    id: "cardiology-078",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient's heart muscle becomes ischemic because its oxygen requirements exceed coronary oxygen delivery. What condition does this mechanism describe?",
    choices: [
      "Angina pectoris",
      "Pneumothorax",
      "Hypoglycemia",
      "Sepsis"
    ],
    answerIndex: 0,
    explanation:
      "Angina is myocardial ischemia caused by an imbalance between myocardial oxygen supply and demand."
  },

  {
    id: "cardiology-079",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Why is the left ventricle more muscular than the right ventricle?",
    choices: [
      "It must generate enough pressure to pump blood through the systemic circulation",
      "It pumps blood only to the lungs",
      "It receives blood directly from the vena cava",
      "It has no valves"
    ],
    answerIndex: 0,
    explanation:
      "The left ventricle pumps against the higher resistance of the systemic circulation, requiring a thicker muscular wall."
  },

  {
    id: "cardiology-080",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which chamber has the thickest muscular wall because it must generate pressure for systemic circulation?",
    choices: [
      "Left ventricle",
      "Right atrium",
      "Left atrium",
      "Right ventricle"
    ],
    answerIndex: 0,
    explanation:
      "The left ventricle must generate high pressure to propel blood throughout the systemic circulation."
  },

  {
    id: "medical-123",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which pair of findings is especially concerning for anaphylaxis?",
    choices: [
      "Wheezing with widespread urticaria",
      "A single bruise with no other symptoms",
      "Mild thirst and hunger",
      "Isolated knee pain"
    ],
    answerIndex: 0,
    explanation:
      "Respiratory compromise combined with widespread hives is strongly concerning for a systemic allergic reaction."
  },

  {
    id: "medical-124",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient develops widespread hives and wheezing shortly after allergen exposure. What emergency should the EMT suspect?",
    choices: [
      "Anaphylaxis",
      "Simple dehydration",
      "A minor orthopedic injury",
      "Stable angina"
    ],
    answerIndex: 0,
    explanation:
      "Widespread urticaria plus respiratory compromise after allergen exposure is highly concerning for anaphylaxis."
  },

  {
    id: "cardiology-081",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which condition is NOT considered a major traditional risk factor for acute myocardial infarction?",
    choices: [
      "Hypoglycemia",
      "Smoking",
      "Hypertension",
      "Diabetes"
    ],
    answerIndex: 0,
    explanation:
      "Smoking, hypertension, diabetes, dyslipidemia, age, and other factors increase cardiovascular risk. Hypoglycemia is not a traditional major risk factor for MI."
  },

  {
    id: "cardiology-082",
    domain: "Cardiology",
    level: "EMT",
    question:
      "An EMT is reviewing common cardiovascular risk factors. Which finding is least relevant as a traditional MI risk factor?",
    choices: [
      "Hypoglycemia",
      "Smoking",
      "Hypertension",
      "Diabetes"
    ],
    answerIndex: 0,
    explanation:
      "Hypoglycemia is not considered a major traditional risk factor for acute myocardial infarction."
  },

  {
    id: "medical-125",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which definition best describes a behavioral crisis?",
    choices: [
      "Behavior that significantly interferes with normal functioning or creates an immediate safety concern",
      "Any patient who is sad",
      "Only a diagnosed psychiatric disorder",
      "Any patient who refuses transport"
    ],
    answerIndex: 0,
    explanation:
      "A behavioral crisis involves behavior that disrupts normal functioning, creates significant concern, or may pose a danger to the patient or others."
  },

  {
    id: "medical-126",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient is behaving in a way that severely disrupts normal functioning and creates a safety concern. How should this situation be classified?",
    choices: [
      "Behavioral crisis",
      "Normal behavior",
      "Simple orthopedic injury",
      "Isolated respiratory distress"
    ],
    answerIndex: 0,
    explanation:
      "A behavioral crisis is characterized by behavior that significantly interferes with functioning or creates safety concerns."
  },

  {
    id: "trauma-079",
    domain: "Trauma",
    level: "EMT",
    question:
      "What is an appropriate way to remove a honeybee stinger?",
    choices: [
      "Remove it promptly by scraping or another appropriate method without squeezing the venom sac",
      "Leave it embedded indefinitely",
      "Push it farther into the skin",
      "Cut the entire limb off"
    ],
    answerIndex: 0,
    explanation:
      "The stinger should be removed promptly. Scraping can be used, and squeezing the venom apparatus should be avoided."
  },

  {
    id: "trauma-080",
    domain: "Trauma",
    level: "EMT",
    question:
      "A honeybee stinger remains embedded in a patient's skin. Which technique is appropriate?",
    choices: [
      "Promptly scrape or otherwise remove the stinger without squeezing the venom sac",
      "Leave it in place",
      "Push it deeper",
      "Apply a tourniquet to the entire limb"
    ],
    answerIndex: 0,
    explanation:
      "Prompt removal limits continued venom delivery. Scraping is an accepted technique."
  },

  {
    id: "medical-127",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "After a typical generalized seizure, a patient's mental status will often:",
    choices: [
      "Gradually improve during the postictal period",
      "Immediately return to baseline in every case",
      "Always remain permanently unconscious",
      "Become normal only after several days"
    ],
    answerIndex: 0,
    explanation:
      "Patients commonly experience a postictal period of confusion, fatigue, or altered awareness that gradually improves."
  },

  {
    id: "medical-128",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient is confused and sleepy immediately after a generalized seizure but gradually becomes more alert. What phase is the patient experiencing?",
    choices: [
      "Postictal period",
      "Anaphylactic phase",
      "Cardiac arrest",
      "Hyperventilation syndrome"
    ],
    answerIndex: 0,
    explanation:
      "The postictal period follows a seizure and commonly includes temporary confusion, fatigue, and altered awareness."
  },

  {
    id: "trauma-081",
    domain: "Trauma",
    level: "EMT",
    question:
      "Most uncomplicated external extremity bleeding can initially be controlled with:",
    choices: [
      "Firm direct pressure",
      "Oral fluids",
      "Heat application",
      "A cervical collar"
    ],
    answerIndex: 0,
    explanation:
      "Direct pressure is the fundamental first-line method for controlling most external hemorrhage."
  },

  {
    id: "trauma-082",
    domain: "Trauma",
    level: "EMT",
    question:
      "An EMT encounters significant external bleeding from an extremity. What is generally the first hemorrhage-control technique?",
    choices: [
      "Direct pressure",
      "Oral glucose",
      "Heat",
      "Spinal traction"
    ],
    answerIndex: 0,
    explanation:
      "Firm direct pressure is the initial method for controlling most external bleeding."
  },

  // ============================================================================
  // ANATOMY / MEDICATION DELIVERY
  // ============================================================================

  {
    id: "airway-080",
    domain: "Airway",
    level: "EMT",
    question:
      "A mucosal atomizer device is designed to deliver medication through which route?",
    choices: [
      "Intranasal",
      "Intravenous",
      "Intraosseous",
      "Intramuscular"
    ],
    answerIndex: 0,
    explanation:
      "A mucosal atomizer device sprays medication onto nasal mucosa for intranasal administration."
  },

  {
    id: "airway-081",
    domain: "Airway",
    level: "EMT",
    question:
      "An EMT uses a mucosal atomizer to spray medication onto the nasal mucosa. Which route is being used?",
    choices: [
      "Intranasal",
      "Intravenous",
      "Subcutaneous",
      "Intraosseous"
    ],
    answerIndex: 0,
    explanation:
      "A MAD is used for intranasal medication delivery."
  },

  {
    id: "cardiology-083",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Oxygenated blood returning from the lungs enters the heart through the:",
    choices: [
      "Pulmonary veins",
      "Pulmonary arteries",
      "Superior vena cava",
      "Inferior vena cava"
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary veins carry oxygenated blood from the lungs to the left atrium."
  },

  {
    id: "cardiology-084",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which vessels carry oxygen-rich blood from the lungs to the left atrium?",
    choices: [
      "Pulmonary veins",
      "Pulmonary arteries",
      "Superior vena cava",
      "Inferior vena cava"
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary veins return oxygenated blood from the lungs to the left atrium."
  },

  {
    id: "trauma-083",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which sequence correctly lists the major regions of the vertebral column from superior to inferior?",
    choices: [
      "Cervical, thoracic, lumbar, sacral, coccygeal",
      "Thoracic, cervical, lumbar, coccygeal, sacral",
      "Lumbar, cervical, thoracic, sacral, coccygeal",
      "Cervical, lumbar, thoracic, coccygeal, sacral"
    ],
    answerIndex: 0,
    explanation:
      "The vertebral column is organized from top to bottom as cervical, thoracic, lumbar, sacral, and coccygeal regions."
  },

  {
    id: "trauma-084",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which region comes immediately after the thoracic spine when moving downward through the vertebral column?",
    choices: [
      "Lumbar",
      "Cervical",
      "Coccygeal",
      "Sacral"
    ],
    answerIndex: 0,
    explanation:
      "The vertebral sequence is cervical, thoracic, lumbar, sacral, and coccygeal."
  },

  {
    id: "trauma-085",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which bone is located on the anterior aspect of the knee?",
    choices: [
      "Patella",
      "Fibula",
      "Tibia",
      "Talus"
    ],
    answerIndex: 0,
    explanation:
      "The patella is the sesamoid bone located anterior to the knee joint."
  },

  {
    id: "trauma-086",
    domain: "Trauma",
    level: "EMT",
    question:
      "An EMT palpates the prominent bone on the front of the knee. Which bone is being assessed?",
    choices: [
      "Patella",
      "Femur",
      "Fibula",
      "Talus"
    ],
    answerIndex: 0,
    explanation:
      "The patella sits anterior to the knee joint."
  },

  {
    id: "cardiology-085",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Which artery carries deoxygenated blood away from the heart?",
    choices: [
      "Pulmonary artery",
      "Aorta",
      "Coronary artery",
      "Carotid artery"
    ],
    answerIndex: 0,
    explanation:
      "The pulmonary arteries carry deoxygenated blood from the right ventricle to the lungs."
  },

  {
    id: "cardiology-086",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Deoxygenated blood is leaving the right ventricle on its way to the lungs. Which vessel carries it?",
    choices: [
      "Pulmonary artery",
      "Aorta",
      "Pulmonary vein",
      "Carotid artery"
    ],
    answerIndex: 0,
    explanation:
      "The pulmonary arteries are the arteries that carry deoxygenated blood."
  },

  {
    id: "trauma-087",
    domain: "Trauma",
    level: "EMT",
    question:
      "The elbow is classified anatomically as primarily what type of synovial joint?",
    choices: [
      "Hinge",
      "Ball-and-socket",
      "Pivot",
      "Saddle"
    ],
    answerIndex: 0,
    explanation:
      "The elbow primarily functions as a hinge joint, allowing flexion and extension."
  },

  {
    id: "trauma-088",
    domain: "Trauma",
    level: "EMT",
    question:
      "A joint primarily permitting flexion and extension connects the arm and forearm. What type of joint is the elbow?",
    choices: [
      "Hinge",
      "Ball-and-socket",
      "Saddle",
      "Plane"
    ],
    answerIndex: 0,
    explanation:
      "The elbow is primarily a hinge joint."
  },

  {
    id: "cardiology-087",
    domain: "Cardiology",
    level: "EMT",
    question:
      "When circulating blood volume falls, which compensatory response normally occurs early?",
    choices: [
      "Peripheral vasoconstriction",
      "Widespread vasodilation",
      "Immediate cessation of sympathetic activity",
      "Complete loss of vascular tone"
    ],
    answerIndex: 0,
    explanation:
      "The sympathetic nervous system causes vasoconstriction, helping maintain vascular resistance and blood pressure during volume loss."
  },

  {
    id: "cardiology-088",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient begins losing significant blood volume. Which early compensatory mechanism helps preserve blood pressure?",
    choices: [
      "Peripheral vasoconstriction",
      "Systemic vasodilation",
      "Reduced sympathetic activity",
      "Loss of vascular tone"
    ],
    answerIndex: 0,
    explanation:
      "Sympathetic vasoconstriction helps maintain systemic vascular resistance during hemorrhage."
  },

  // ============================================================================
  // PEDIATRICS / ASSESSMENT / ANATOMY
  // ============================================================================

  {
    id: "trauma-089",
    domain: "Trauma",
    level: "EMT",
    question:
      "The anterior fontanelle normally closes during approximately which period?",
    choices: [
      "9 to 18 months",
      "Birth to 1 month",
      "3 to 5 years",
      "8 to 10 years"
    ],
    answerIndex: 0,
    explanation:
      "The anterior fontanelle commonly closes between approximately 9 and 18 months, with normal variation."
  },

  {
    id: "trauma-090",
    domain: "Trauma",
    level: "EMT",
    question:
      "A pediatric assessment reveals an anterior fontanelle that is normally closing during infancy. Which age range is expected?",
    choices: [
      "Approximately 9 to 18 months",
      "Immediately at birth",
      "3 to 5 years",
      "8 to 10 years"
    ],
    answerIndex: 0,
    explanation:
      "The anterior fontanelle usually closes during the second year of life, commonly around 9 to 18 months."
  },

  {
    id: "medical-129",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which physical change is characteristic of normal adolescence?",
    choices: [
      "Development of secondary sexual characteristics",
      "Permanent loss of all growth",
      "Immediate menopause",
      "Complete cessation of hormone production"
    ],
    answerIndex: 0,
    explanation:
      "Puberty involves hormonal changes and development of secondary sexual characteristics."
  },

  {
    id: "medical-130",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An adolescent develops changes such as breast development, voice changes, or increased body hair. What developmental process is occurring?",
    choices: [
      "Development of secondary sexual characteristics",
      "Menopause",
      "Aging",
      "Senescence"
    ],
    answerIndex: 0,
    explanation:
      "Secondary sexual characteristics develop as part of normal puberty."
  },

  {
    id: "medical-131",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which organ is primarily responsible for producing insulin and regulating blood glucose?",
    choices: [
      "Pancreas",
      "Liver",
      "Spleen",
      "Gallbladder"
    ],
    answerIndex: 0,
    explanation:
      "The pancreas produces insulin and glucagon, which play central roles in glucose regulation."
  },

  {
    id: "medical-132",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An organ produces insulin and glucagon to regulate blood glucose. Which organ is being described?",
    choices: [
      "Pancreas",
      "Liver",
      "Spleen",
      "Kidney"
    ],
    answerIndex: 0,
    explanation:
      "The pancreas contains endocrine cells that produce insulin and glucagon."
  },

  {
    id: "ops-329",
    domain: "EMS Operations",
    level: "EMT",
    question:
      "A blood pressure cuff that is too small for the patient's arm may produce what type of reading?",
    choices: [
      "Falsely high blood pressure",
      "Falsely low blood pressure",
      "No change at all",
      "Only an inaccurate pulse rate"
    ],
    answerIndex: 0,
    explanation:
      "A cuff that is too small can overestimate blood pressure. Correct cuff sizing is important for accurate measurement."
  },

  {
    id: "ops-330",
    domain: "EMS Operations",
    level: "EMT",
    question:
      "An EMT uses a blood pressure cuff that is too narrow for a patient's arm. What error should be expected?",
    choices: [
      "The blood pressure may read falsely high",
      "The blood pressure will always read falsely low",
      "The pulse disappears permanently",
      "The oxygen saturation becomes inaccurate"
    ],
    answerIndex: 0,
    explanation:
      "An undersized blood pressure cuff can produce falsely elevated readings."
  },

  {
    id: "medical-133",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which statement about middle adulthood is most accurate?",
    choices: [
      "Cardiovascular disease and cancer become increasingly important health concerns",
      "Chronic disease risk disappears",
      "Bone density always increases",
      "Cancer risk becomes zero"
    ],
    answerIndex: 0,
    explanation:
      "As adults age, cardiovascular disease, cancer, and other chronic conditions become increasingly important causes of morbidity and mortality."
  },

  {
    id: "medical-134",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT is assessing an adult in middle age. Which health concerns become increasingly important during this period?",
    choices: [
      "Cardiovascular disease and cancer",
      "Only childhood infections",
      "Only congenital diseases",
      "No chronic diseases"
    ],
    answerIndex: 0,
    explanation:
      "The prevalence and importance of cardiovascular disease and cancer increase with age."
  },

  {
    id: "trauma-091",
    domain: "Trauma",
    level: "EMT",
    question:
      "Relative to the wrist, the elbow is:",
    choices: [
      "Proximal",
      "Distal",
      "Medial",
      "Inferior"
    ],
    answerIndex: 0,
    explanation:
      "Proximal means closer to the point of attachment or trunk. The elbow is closer to the shoulder than the wrist is."
  },

  {
    id: "trauma-092",
    domain: "Trauma",
    level: "EMT",
    question:
      "Which anatomical term describes the elbow's position relative to the wrist?",
    choices: [
      "Proximal",
      "Distal",
      "Lateral",
      "Posterior"
    ],
    answerIndex: 0,
    explanation:
      "The elbow is proximal to the wrist because it is closer to the body's point of attachment."
  },

  {
    id: "cardiology-089",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A sudden decrease in blood pressure may indicate:",
    choices: [
      "Reduced vascular tone or inadequate circulating volume",
      "Improved perfusion in every case",
      "Increased blood volume",
      "Guaranteed hypertension"
    ],
    answerIndex: 0,
    explanation:
      "Hypotension can result from inadequate circulating volume, reduced vascular tone, impaired cardiac output, or other causes."
  },

  {
    id: "cardiology-090",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient's blood pressure suddenly falls because systemic vascular resistance has decreased. Which physiologic change is involved?",
    choices: [
      "Loss of vascular tone",
      "Increased vascular resistance",
      "Increased blood volume",
      "Increased afterload"
    ],
    answerIndex: 0,
    explanation:
      "Loss of vascular tone causes vasodilation, reducing systemic vascular resistance and potentially lowering blood pressure."
  },

  {
    id: "medical-135",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which common medication route generally has the slowest onset of absorption?",
    choices: [
      "Oral",
      "Intravenous",
      "Intraosseous",
      "Intramuscular"
    ],
    answerIndex: 0,
    explanation:
      "Oral medications must pass through the gastrointestinal tract before absorption, generally making onset slower than parenteral routes."
  },

  {
    id: "medical-136",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A medication must pass through the gastrointestinal tract before entering systemic circulation. Which route is being used?",
    choices: [
      "Oral",
      "Intravenous",
      "Intraosseous",
      "Intramuscular"
    ],
    answerIndex: 0,
    explanation:
      "Oral medications are absorbed through the gastrointestinal tract and generally have a slower onset than IV administration."
  },

  {
    id: "cardiology-091",
    domain: "Cardiology",
    level: "EMT",
    question:
      "What is the primary function of the right atrium?",
    choices: [
      "Receive systemic venous blood",
      "Pump oxygenated blood into the aorta",
      "Receive blood from the pulmonary veins",
      "Pump blood into the systemic circulation"
    ],
    answerIndex: 0,
    explanation:
      "The right atrium receives deoxygenated blood returning from the body through the superior and inferior venae cavae."
  },

  {
    id: "cardiology-092",
    domain: "Cardiology",
    level: "EMT",
    question:
      "Blood returning from the body through the venae cavae first enters which chamber?",
    choices: [
      "Right atrium",
      "Left atrium",
      "Left ventricle",
      "Right ventricle"
    ],
    answerIndex: 0,
    explanation:
      "The superior and inferior venae cavae empty into the right atrium."
  },

  {
    id: "airway-082",
    domain: "Airway",
    level: "EMT",
    question:
      "Where are the vocal cords located?",
    choices: [
      "Larynx",
      "Trachea",
      "Esophagus",
      "Nasal cavity"
    ],
    answerIndex: 0,
    explanation:
      "The vocal cords are located within the larynx."
  },

  {
    id: "airway-083",
    domain: "Airway",
    level: "EMT",
    question:
      "An EMT is reviewing upper-airway anatomy. In which structure are the vocal cords found?",
    choices: [
      "Larynx",
      "Esophagus",
      "Bronchi",
      "Alveoli"
    ],
    answerIndex: 0,
    explanation:
      "The vocal cords are located within the larynx."
  },

  // ============================================================================
  // AGE / ABDOMINAL QUADRANTS
  // ============================================================================

  {
    id: "medical-137",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "During which approximate age range is the human body generally considered to be at or near peak physical development?",
    choices: [
      "Late teens through the mid-20s",
      "Early childhood only",
      "After age 70",
      "During infancy"
    ],
    answerIndex: 0,
    explanation:
      "Many aspects of physical performance and development peak during late adolescence and early adulthood, although the exact age varies by trait."
  },

  {
    id: "medical-138",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT is considering the period when many measures of physical development and performance are near their peak. Which age range is most appropriate?",
    choices: [
      "Late teens through the mid-20s",
      "Infancy",
      "Early childhood",
      "Late old age"
    ],
    answerIndex: 0,
    explanation:
      "Many physical characteristics reach peak levels during late adolescence and early adulthood."
  },

  {
    id: "medical-139",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which organs or structures are commonly located in the left upper quadrant of the abdomen?",
    choices: [
      "Spleen, stomach, and part of the colon",
      "Liver, gallbladder, and appendix",
      "Appendix and right ovary only",
      "Urinary bladder and rectum only"
    ],
    answerIndex: 0,
    explanation:
      "The left upper quadrant contains the spleen, much of the stomach, and portions of the pancreas and colon."
  },

  {
    id: "medical-140",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT localizes abdominal tenderness to the left upper quadrant. Which structure is most consistent with this location?",
    choices: [
      "Spleen",
      "Appendix",
      "Gallbladder",
      "Cecum only"
    ],
    answerIndex: 0,
    explanation:
      "The spleen is located in the left upper quadrant."
  },

  {
    id: "medical-141",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which structures are commonly found in the right upper quadrant of the abdomen?",
    choices: [
      "Liver, gallbladder, and part of the colon",
      "Spleen and descending colon",
      "Appendix and sigmoid colon",
      "Urinary bladder and rectum"
    ],
    answerIndex: 0,
    explanation:
      "The right upper quadrant contains most of the liver, the gallbladder, and portions of the duodenum and colon."
  },

  {
    id: "medical-142",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has right upper quadrant abdominal pain. Which organ is located in this quadrant and may be involved?",
    choices: [
      "Liver",
      "Spleen",
      "Sigmoid colon",
      "Appendix"
    ],
    answerIndex: 0,
    explanation:
      "The liver occupies much of the right upper quadrant, with the gallbladder located beneath it."
  },

  {
    id: "medical-143",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which structures are commonly associated with the right lower quadrant of the abdomen?",
    choices: [
      "Appendix and portions of the small and large intestines",
      "Spleen and stomach",
      "Liver and gallbladder",
      "Descending and sigmoid colon only"
    ],
    answerIndex: 0,
    explanation:
      "The right lower quadrant contains the appendix, cecum, and portions of the small intestine and ascending colon."
  },

  {
    id: "medical-144",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT is evaluating right lower quadrant abdominal pain. Which structure is particularly important to consider?",
    choices: [
      "Appendix",
      "Spleen",
      "Gallbladder",
      "Stomach"
    ],
    answerIndex: 0,
    explanation:
      "The appendix is located in the right lower quadrant and inflammation there can produce appendicitis."
  },

  {
    id: "medical-145",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "Which structures are commonly associated with the left lower quadrant of the abdomen?",
    choices: [
      "Descending and sigmoid colon",
      "Liver and gallbladder",
      "Spleen and stomach",
      "Appendix and cecum"
    ],
    answerIndex: 0,
    explanation:
      "The descending and sigmoid portions of the colon are major structures located in the left lower quadrant."
  },

  {
    id: "medical-146",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "An EMT is evaluating pain in the left lower quadrant. Which portion of the gastrointestinal tract is particularly associated with this area?",
    choices: [
      "Descending and sigmoid colon",
      "Gallbladder",
      "Appendix",
      "Spleen"
    ],
    answerIndex: 0,
    explanation:
      "The descending and sigmoid colon are located primarily in the left lower quadrant."
  },

  // ============================================================================
  // EXTRA HIGH-VALUE REVERSE / APPLICATION ITEMS
  // These intentionally change the cognitive direction rather than simply
  // reversing the wording.
  // ============================================================================

  {
    id: "airway-084",
    domain: "Airway",
    level: "EMT",
    question:
      "A patient with suspected anaphylaxis suddenly develops a harsh inspiratory sound caused by upper-airway narrowing. Which finding is present?",
    choices: [
      "Stridor",
      "Crackles",
      "Rhonchi",
      "Pleural rub"
    ],
    answerIndex: 0,
    explanation:
      "Stridor is associated with upper-airway narrowing and is a potentially life-threatening finding."
  },

  {
    id: "airway-085",
    domain: "Airway",
    level: "EMT",
    question:
      "A patient has decreased consciousness, slow shallow breathing, and vomitus in the mouth. Which two immediate concerns should dominate the EMT's assessment?",
    choices: [
      "Inadequate ventilation and aspiration",
      "Hypertension and fever",
      "Dehydration and constipation",
      "Bone fracture and rash"
    ],
    answerIndex: 0,
    explanation:
      "Depressed consciousness combined with shallow respirations creates immediate airway and ventilation concerns, including aspiration."
  },

  {
    id: "cardiology-093",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient's ventricular rate becomes extremely rapid and blood pressure falls. Which change in cardiac physiology is most likely contributing?",
    choices: [
      "Reduced diastolic filling time",
      "Increased ventricular filling time",
      "Increased circulating blood volume",
      "Improved stroke volume"
    ],
    answerIndex: 0,
    explanation:
      "A very rapid heart rate shortens diastole, reducing ventricular filling and potentially lowering stroke volume."
  },

  {
    id: "trauma-093",
    domain: "Trauma",
    level: "EMT",
    question:
      "A patient has severe extremity hemorrhage that continues despite direct pressure. The bleeding is from a location where a tourniquet can be applied. What is the priority intervention?",
    choices: [
      "Apply a tourniquet proximal to the wound",
      "Apply heat",
      "Give oral fluids first",
      "Remove all existing dressings"
    ],
    answerIndex: 0,
    explanation:
      "A tourniquet is appropriate for life-threatening extremity hemorrhage that cannot be controlled with direct pressure."
  },

  {
    id: "medical-147",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient develops widespread hives, wheezing, and hypotension after an allergen exposure. Which pathophysiologic process best explains the presentation?",
    choices: [
      "A severe systemic allergic reaction",
      "A localized musculoskeletal injury",
      "A simple isolated skin infection",
      "A normal stress response"
    ],
    answerIndex: 0,
    explanation:
      "The combination of skin, respiratory, and cardiovascular findings strongly indicates anaphylaxis."
  },

  {
    id: "medical-148",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has an upper gastrointestinal hemorrhage and begins vomiting large amounts of blood. What term describes the observed finding?",
    choices: [
      "Hematemesis",
      "Hematuria",
      "Hemoptysis",
      "Epistaxis"
    ],
    answerIndex: 0,
    explanation:
      "Hematemesis is vomiting blood and commonly indicates an upper GI source."
  },

  {
    id: "cardiology-094",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient is pulseless and the AED identifies a shockable chaotic ventricular rhythm. Which rhythm has most likely been identified?",
    choices: [
      "Ventricular fibrillation",
      "Sinus rhythm",
      "Sinus bradycardia",
      "First-degree AV block"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation is a shockable rhythm characterized by chaotic ventricular electrical activity and no effective pulse."
  },

  {
    id: "medical-149",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient with diabetes is confused, sweaty, and combative. Which immediate test can distinguish one important metabolic cause of these findings?",
    choices: [
      "Point-of-care blood glucose",
      "Visual acuity",
      "Hearing test",
      "Peak flow measurement"
    ],
    answerIndex: 0,
    explanation:
      "A glucose measurement can rapidly identify hypoglycemia, an important reversible cause of altered mental status."
  },

  {
    id: "trauma-094",
    domain: "Trauma",
    level: "EMT",
    question:
      "An older patient sustains a hip fracture after falling from standing height. What explains why a relatively low-energy mechanism can still produce a major fracture?",
    choices: [
      "Reduced bone density such as osteoporosis",
      "Increased bone density",
      "Increased muscle mass",
      "Greater joint flexibility"
    ],
    answerIndex: 0,
    explanation:
      "Osteoporosis weakens bone and makes fractures more likely after relatively minor mechanisms."
  },

  {
    id: "medical-150",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient abruptly stops heavy alcohol consumption and develops agitation, hallucinations, tremors, and autonomic instability. Which diagnosis is most concerning?",
    choices: [
      "Delirium tremens",
      "Stable angina",
      "Simple dehydration",
      "Isolated hypoglycemia"
    ],
    answerIndex: 0,
    explanation:
      "Delirium tremens is a severe form of alcohol withdrawal that can become life-threatening."
  },

  {
    id: "medical-151",
    domain: "Medical + OBGYN",
    level: "EMT",
    question:
      "A patient has severe abdominal pain and lies curled on the side with the knees flexed because it decreases discomfort. What does this position represent?",
    choices: [
      "A position of comfort",
      "A required shock position",
      "A seizure position",
      "A definitive treatment"
    ],
    answerIndex: 0,
    explanation:
      "Patients with abdominal pain may assume positions that reduce stretching or movement of painful structures."
  },

  {
    id: "cardiology-095",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient's blood pressure is unexpectedly high. The EMT realizes the cuff is too small for the patient's arm. What likely caused the abnormal reading?",
    choices: [
      "An undersized cuff",
      "A falsely low pulse",
      "Excess oxygen",
      "A normal physiologic response"
    ],
    answerIndex: 0,
    explanation:
      "Using a cuff that is too small can produce falsely elevated blood pressure measurements."
  },

  {
    id: "anatomy-001",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A vessel carries oxygenated blood from the lungs directly into the chamber that pumps blood into systemic circulation. Which chamber receives this blood first?",
    choices: [
      "Left atrium",
      "Right atrium",
      "Right ventricle",
      "Superior vena cava"
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary veins deliver oxygenated blood to the left atrium, which passes it to the left ventricle."
  },

  {
    id: "anatomy-002",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A vessel carries deoxygenated blood from the body into the heart. Which chamber receives that blood first?",
    choices: [
      "Right atrium",
      "Left atrium",
      "Left ventricle",
      "Aorta"
    ],
    answerIndex: 0,
    explanation:
      "Systemic venous blood enters the right atrium through the superior and inferior venae cavae."
  },

  {
    id: "anatomy-003",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A patient has ischemic chest discomfort because the heart's oxygen requirement is greater than the oxygen supplied by the coronary circulation. What condition does this describe?",
    choices: [
      "Angina",
      "Anaphylaxis",
      "Hypoglycemia",
      "Hemorrhagic shock"
    ],
    answerIndex: 0,
    explanation:
      "Angina is myocardial ischemia caused by an imbalance between myocardial oxygen demand and supply."
  },

  {
    id: "anatomy-004",
    domain: "Cardiology",
    level: "EMT",
    question:
      "A chamber must generate high pressure to move blood through the entire systemic circulation. Which chamber performs this job?",
    choices: [
      "Left ventricle",
      "Right atrium",
      "Left atrium",
      "Right ventricle"
    ],
    answerIndex: 0,
    explanation:
      "The left ventricle pumps oxygenated blood into the aorta and systemic circulation."
  },

  {
    id: "anatomy-005",
    domain: "Trauma",
    level: "EMT",
    question:
      "A patient has pain over the bone located directly in front of the knee joint. Which bone is involved?",
    choices: [
      "Patella",
      "Fibula",
      "Talus",
      "Ulna"
    ],
    answerIndex: 0,
    explanation:
      "The patella is positioned anterior to the knee joint."
  },

  {
    id: "anatomy-006",
    domain: "Trauma",
    level: "EMT",
    question:
      "An injury is described as occurring proximal to the wrist but distal to the shoulder. Which joint is being referenced?",
    choices: [
      "Elbow",
      "Ankle",
      "Knee",
      "Hip"
    ],
    answerIndex: 0,
    explanation:
      "The elbow lies between the shoulder and wrist and is therefore proximal to the wrist."
  },
// ============================================================================
// CARDIOLOGY QUESTION BANK
// Rewritten from supplied study material with independently generated
// reverse/concept questions.
//
// "Standard" questions test recognition/application of the concept.
// "Reverse" questions start with the concept/answer and ask the learner
// to identify the corresponding term or situation.
// ============================================================================
  {
    id: "cardiology-096",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A 44-year-old patient is dizzy and pale. His blood pressure is 88/26 mm Hg, and his heart rate is 190/min with weak pulses. Which mechanism best explains his hypotension?",
    choices: [
      "The extremely rapid rate is reducing ventricular filling time",
      "The ventricles are ejecting blood for an unusually long period",
      "The coronary arteries are receiving excessive blood flow",
      "The atria are filling the ventricles more effectively than normal"
    ],
    answerIndex: 0,
    explanation:
      "At an extremely rapid heart rate, there is less time for the ventricles to fill during diastole. Reduced filling lowers stroke volume and can cause hypotension. The other choices do not explain the patient's poor perfusion."
  },

  {
    id: "cardiology-097",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with a very rapid heart rhythm develops weakness and a falling blood pressure. What is the most important reason the rapid rate can reduce cardiac output?",
    choices: [
      "The heart has less time to fill between contractions",
      "The heart permanently loses its ability to contract",
      "The lungs stop exchanging oxygen immediately",
      "The arteries become completely obstructed"
    ],
    answerIndex: 0,
    explanation:
      "Very rapid rates shorten diastole, leaving less time for ventricular filling. Lower ventricular filling can reduce stroke volume and cardiac output."
  },

  {
    id: "cardiology-098",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient develops an abnormally fast heart rate while experiencing a cardiac problem. Which effect is particularly concerning because it increases the heart's workload?",
    choices: [
      "Increased myocardial oxygen demand",
      "Decreased myocardial oxygen consumption",
      "Complete cessation of ventricular activity",
      "Increased ventricular filling time"
    ],
    answerIndex: 0,
    explanation:
      "Tachycardia makes the myocardium work harder and generally increases its oxygen requirement. It can also shorten filling time and worsen cardiac output."
  },

  {
    id: "cardiology-099",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which term describes the heart's ability to generate its own electrical impulses without requiring direct stimulation from the nervous system?",
    choices: [
      "Automaticity",
      "Contractility",
      "Perfusion",
      "Repolarization"
    ],
    answerIndex: 0,
    explanation:
      "Automaticity is the ability of cardiac cells to generate electrical impulses spontaneously. Contractility refers to the force of contraction."
  },

  {
    id: "cardiology-100",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What does cardiac automaticity allow certain cardiac cells to do?",
    choices: [
      "Generate electrical impulses spontaneously",
      "Prevent all ventricular contractions",
      "Carry oxygen directly to myocardial cells",
      "Open the aortic valve without electrical activity"
    ],
    answerIndex: 0,
    explanation:
      "Automaticity allows specialized cardiac cells to generate electrical impulses without requiring a nerve signal."
  },

  // --------------------------------------------------------------------------
  // CPR / AED
  // --------------------------------------------------------------------------

  {
    id: "cardiology-101",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "During two-rescuer adult CPR, when should the rescuers generally switch compressor roles to reduce fatigue and maintain effective compressions?",
    choices: [
      "About every 2 minutes",
      "After every 10 compressions",
      "Only after the AED delivers a shock",
      "Every 10 minutes"
    ],
    answerIndex: 0,
    explanation:
      "Rescuers generally switch compressor roles about every 2 minutes, usually during a rhythm or pulse check when appropriate, to minimize interruptions and maintain compression quality."
  },

  {
    id: "cardiology-102",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "During CPR, the chest is allowed to return completely to its normal position between compressions. What is the primary benefit of this recoil?",
    choices: [
      "It promotes venous return to the heart",
      "It prevents the ventricles from contracting",
      "It eliminates the need for compressions",
      "It directly delivers oxygen to the myocardium"
    ],
    answerIndex: 0,
    explanation:
      "Complete chest recoil lowers pressure within the thorax and helps blood return to the heart. Incomplete recoil can reduce venous return and compromise CPR effectiveness."
  },

  {
    id: "cardiology-103",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An AED is analyzing a cardiac arrest patient's rhythm and subsequently begins charging for a shock. What should the rescuer generally do while the AED is charging?",
    choices: [
      "Continue chest compressions until told to stop for the shock",
      "Remove all pads from the patient's chest",
      "Stop CPR and wait silently for several minutes",
      "Begin checking the patient's blood pressure"
    ],
    answerIndex: 0,
    explanation:
      "Modern resuscitation practice emphasizes minimizing pauses in compressions. Continue CPR while the AED charges unless the device instructs otherwise, then clear the patient when directed."
  },

  {
    id: "cardiology-104",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Why should unnecessary interruptions in chest compressions be avoided during cardiac arrest care?",
    choices: [
      "Interruptions reduce blood flow generated by CPR",
      "Interruptions make the AED deliver a stronger shock",
      "Interruptions cause the patient to become hypertensive",
      "Interruptions prevent the airway from being opened"
    ],
    answerIndex: 0,
    explanation:
      "Chest compressions generate blood flow to vital organs. Unnecessary pauses reduce coronary and cerebral perfusion and can worsen resuscitation outcomes."
  },

  {
    id: "cardiology-105",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "The appropriate energy level for a biphasic AED shock is primarily determined by:",
    choices: [
      "The AED manufacturer's specifications",
      "The patient's age alone",
      "The patient's systolic blood pressure",
      "A fixed 360-joule setting for every device"
    ],
    answerIndex: 0,
    explanation:
      "Biphasic AEDs use manufacturer-specific energy settings and algorithms. EMTs should follow the instructions for the device being used."
  },

  {
    id: "cardiology-106",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Approximately how much can the chance of survival decrease for each minute defibrillation is delayed in a patient with a shockable cardiac arrest rhythm?",
    choices: [
      "As much as about 10 percent",
      "Less than 1 percent",
      "Exactly 50 percent",
      "There is no relationship between time and survival"
    ],
    answerIndex: 0,
    explanation:
      "The chance of successful resuscitation generally declines rapidly as defibrillation is delayed. The commonly taught estimate is up to roughly 10 percent per minute in certain untreated shockable arrests."
  },

  // --------------------------------------------------------------------------
  // ANGina / ACS / MI
  // --------------------------------------------------------------------------

  {
    id: "cardiology-107",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient experiences predictable chest pressure whenever he climbs several flights of stairs. The discomfort resolves after resting. Which condition best matches this presentation?",
    choices: [
      "Stable angina",
      "Ventricular fibrillation",
      "Cardiac arrest",
      "Pulmonary embolism"
    ],
    answerIndex: 0,
    explanation:
      "Stable angina typically occurs predictably with exertion or stress when myocardial oxygen demand exceeds available supply and improves with rest."
  },

  {
    id: "cardiology-108",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient reports new chest discomfort that began while he was sitting quietly and has no obvious exertional trigger. Which condition is most concerning?",
    choices: [
      "Unstable angina",
      "Stable angina",
      "Dependent edema",
      "Bradycardia"
    ],
    answerIndex: 0,
    explanation:
      "Unstable angina can occur at rest or with minimal exertion and represents an acute coronary syndrome requiring prompt evaluation."
  },

  {
    id: "cardiology-109",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which group of conditions is included under the term acute coronary syndrome?",
    choices: [
      "Unstable angina and acute myocardial infarction",
      "Only chronic hypertension",
      "Only congestive heart failure",
      "Only ventricular fibrillation"
    ],
    answerIndex: 0,
    explanation:
      "Acute coronary syndrome encompasses acute myocardial ischemia caused by impaired coronary blood flow, including unstable angina and myocardial infarction."
  },

  {
    id: "cardiology-110",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which term describes death or injury of heart muscle caused by prolonged interruption of its blood supply?",
    choices: [
      "Acute myocardial infarction",
      "Stable angina",
      "Dilation",
      "Dysrhythmia"
    ],
    answerIndex: 0,
    explanation:
      "An acute myocardial infarction occurs when prolonged inadequate coronary blood flow results in myocardial injury or death."
  },

  {
    id: "cardiology-111",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient experiences temporary myocardial ischemia that causes chest discomfort but does not result in permanent myocardial cell death. What is this commonly called?",
    choices: [
      "Angina pectoris",
      "Cardiac arrest",
      "Ventricular tachycardia",
      "Aortic dissection"
    ],
    answerIndex: 0,
    explanation:
      "Angina pectoris is chest discomfort caused by temporary myocardial ischemia. Unlike an infarction, it does not by definition involve permanent myocardial cell death."
  },

  {
    id: "cardiology-112",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with diabetes and hypertension complains of unusual weakness and nausea. She is alert, cool, and clammy, with a normal-looking pulse and blood pressure. Which cardiac condition should remain high on the differential?",
    choices: [
      "Acute myocardial infarction",
      "Stable bradycardia",
      "Dependent edema",
      "Simple dehydration"
    ],
    answerIndex: 0,
    explanation:
      "Myocardial infarction can present with atypical symptoms, especially in some patients with diabetes. Weakness, nausea, diaphoresis, and other nonspecific symptoms should not be dismissed."
  },

  {
    id: "cardiology-113",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient has chest pressure and generalized weakness but has not taken aspirin. Assuming there are no contraindications, which medication may be appropriate according to local protocol?",
    choices: [
      "Aspirin",
      "Nitroglycerin from another patient's prescription",
      "A beta blocker without medical direction",
      "A diuretic"
    ],
    answerIndex: 0,
    explanation:
      "Aspirin is commonly indicated for suspected acute coronary syndrome when the patient has no relevant contraindication and local protocol permits administration. EMTs should follow their medical direction."
  },

  {
    id: "cardiology-114",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which patient history would make an EMT particularly cautious about administering aspirin for suspected ACS?",
    choices: [
      "A history of significant gastrointestinal bleeding or aspirin allergy",
      "A history of seasonal allergies",
      "A previous ankle sprain",
      "Wearing corrective eyeglasses"
    ],
    answerIndex: 0,
    explanation:
      "Significant bleeding risk and aspirin allergy are important contraindications or precautions. The EMT should follow local protocol and medical direction."
  },

  {
    id: "cardiology-115",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which underlying disease process is a major cause of acute coronary syndrome?",
    choices: [
      "Atherosclerotic coronary artery disease",
      "Simple venous dilation",
      "Isolated bradycardia",
      "Chest wall muscle strain"
    ],
    answerIndex: 0,
    explanation:
      "Atherosclerotic disease can narrow or destabilize coronary arteries and contribute to acute coronary syndrome."
  },

  {
    id: "cardiology-116",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What is atherosclerosis?",
    choices: [
      "Accumulation of fatty and fibrous material within arterial walls",
      "A temporary increase in heart rate",
      "Complete absence of cardiac electrical activity",
      "Fluid accumulation in the alveoli"
    ],
    answerIndex: 0,
    explanation:
      "Atherosclerosis involves the development of plaques within arterial walls. These plaques can narrow vessels or become unstable and contribute to acute coronary events."
  },

  {
    id: "cardiology-117",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which combination is particularly suggestive of an acute coronary syndrome in a patient with chest discomfort?",
    choices: [
      "Diaphoresis, pale or ashen skin, and anxiety",
      "Warm dry skin and isolated itching",
      "Slow breathing and pinpoint pupils",
      "Localized ankle swelling after an injury"
    ],
    answerIndex: 0,
    explanation:
      "ACS can produce autonomic symptoms such as diaphoresis, pallor or ashen appearance, anxiety, nausea, and weakness. These findings should be considered along with the patient's history."
  },

  // --------------------------------------------------------------------------
  // NITROGLYCERIN
  // --------------------------------------------------------------------------

  {
    id: "cardiology-118",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What is the primary cardiovascular effect of nitroglycerin that can help reduce myocardial oxygen demand?",
    choices: [
      "Vasodilation that decreases venous return and cardiac workload",
      "Severe systemic vasoconstriction",
      "A direct increase in ventricular filling",
      "An increase in blood pressure caused by arterial constriction"
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin causes vascular smooth muscle relaxation, particularly venodilation. Reduced preload decreases cardiac workload and myocardial oxygen demand. It can also dilate coronary vessels."
  },

  {
    id: "cardiology-119",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient takes prescribed nitroglycerin for chest discomfort and subsequently develops a headache. What is the most appropriate interpretation?",
    choices: [
      "Headache is a common effect of nitroglycerin",
      "The medication proves that the patient is having a stroke",
      "The medication always causes ventricular fibrillation",
      "The headache means the patient's coronary arteries are completely blocked"
    ],
    answerIndex: 0,
    explanation:
      "Headache is a common effect of nitroglycerin because of its vasodilatory action. The patient's ongoing chest pain must still be assessed as possible cardiac ischemia."
  },

  {
    id: "cardiology-120",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient receives nitroglycerin and develops a faster pulse shortly afterward. Which mechanism can explain the increased heart rate?",
    choices: [
      "A drop in blood pressure can trigger reflex tachycardia",
      "Nitroglycerin directly paralyzes the myocardium",
      "Nitroglycerin always causes ventricular fibrillation",
      "The heart stops receiving venous blood permanently"
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin can lower blood pressure through vasodilation. The body may respond with reflex sympathetic activation and an increased heart rate."
  },

  // --------------------------------------------------------------------------
  // CARDIAC ANATOMY / BLOOD FLOW
  // --------------------------------------------------------------------------

  {
    id: "cardiology-121",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which layer of the heart is primarily composed of cardiac muscle?",
    choices: [
      "Myocardium",
      "Endocardium",
      "Pericardium",
      "Epicardium"
    ],
    answerIndex: 0,
    explanation:
      "The myocardium is the muscular layer of the heart responsible for contraction."
  },

  {
    id: "cardiology-122",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which structures supply oxygenated blood directly to the heart muscle?",
    choices: [
      "Coronary arteries",
      "Pulmonary arteries",
      "Venae cavae",
      "Pulmonary veins"
    ],
    answerIndex: 0,
    explanation:
      "The coronary arteries branch from the aorta and supply oxygenated blood to the myocardium."
  },

  {
    id: "cardiology-123",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Freshly oxygenated blood returning from the lungs enters the left atrium through the:",
    choices: [
      "Pulmonary veins",
      "Pulmonary arteries",
      "Superior vena cava",
      "Aorta"
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary veins carry oxygen-rich blood from the lungs to the left atrium."
  },

  {
    id: "cardiology-124",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which blood vessels carry blood away from the heart?",
    choices: [
      "Arteries",
      "Veins",
      "Capillaries only",
      "Venules"
    ],
    answerIndex: 0,
    explanation:
      "Arteries carry blood away from the heart. This definition is based on direction of flow, not oxygen content."
  },

  {
    id: "cardiology-125",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which vessels return blood toward the heart?",
    choices: [
      "Veins",
      "Arteries",
      "Coronary arteries only",
      "Pulmonary arterioles only"
    ],
    answerIndex: 0,
    explanation:
      "Veins carry blood toward the heart. Pulmonary veins are an important exception to the usual oxygen-content pattern because they carry oxygenated blood."
  },

  {
    id: "cardiology-126",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which statement correctly describes the pulmonary arteries?",
    choices: [
      "They carry deoxygenated blood from the right ventricle toward the lungs",
      "They carry oxygenated blood from the lungs to the left atrium",
      "They carry oxygenated blood from the left ventricle to the body",
      "They return systemic blood directly to the right atrium"
    ],
    answerIndex: 0,
    explanation:
      "The pulmonary arteries carry deoxygenated blood from the right ventricle to the lungs for gas exchange."
  },

  {
    id: "cardiology-127",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which valve prevents blood ejected from the left ventricle from flowing back into that ventricle?",
    choices: [
      "Aortic valve",
      "Tricuspid valve",
      "Pulmonic valve",
      "Mitral valve"
    ],
    answerIndex: 0,
    explanation:
      "The aortic valve lies between the left ventricle and aorta and helps prevent backflow into the ventricle after ejection."
  },

  {
    id: "cardiology-128",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "The inner diameter of a tubular structure such as a blood vessel is called its:",
    choices: [
      "Lumen",
      "Myocardium",
      "Septum",
      "Pericardium"
    ],
    answerIndex: 0,
    explanation:
      "The lumen is the internal passageway through a hollow structure such as a blood vessel."
  },

  {
    id: "cardiology-129",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What term describes widening of a tubular structure such as a blood vessel?",
    choices: [
      "Dilation",
      "Occlusion",
      "Infarction",
      "Embolization"
    ],
    answerIndex: 0,
    explanation:
      "Dilation means an enlargement or widening of a tubular structure, including a blood vessel."
  },

  {
    id: "cardiology-130",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What term describes a blockage within a hollow structure such as a blood vessel?",
    choices: [
      "Occlusion",
      "Dilation",
      "Automaticity",
      "Recoil"
    ],
    answerIndex: 0,
    explanation:
      "An occlusion is a blockage that prevents or restricts flow through a vessel or other tubular structure."
  },

  // --------------------------------------------------------------------------
  // ELECTRICAL SYSTEM / RHYTHMS
  // --------------------------------------------------------------------------

  {
    id: "cardiology-131",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What happens when the electrical impulse reaches the AV node under normal circumstances?",
    choices: [
      "The impulse is briefly delayed, allowing additional ventricular filling",
      "The impulse is permanently blocked",
      "The ventricles immediately stop contracting",
      "The aortic valve is forced open mechanically"
    ],
    answerIndex: 0,
    explanation:
      "The AV node briefly delays conduction. This gives the atria time to contribute to ventricular filling before ventricular contraction."
  },

  {
    id: "cardiology-132",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which portion of the cardiac conduction system rapidly distributes the electrical impulse through the ventricles and contributes to ventricular contraction?",
    choices: [
      "Purkinje fibers",
      "Coronary arteries",
      "Pulmonary veins",
      "Chordae tendineae"
    ],
    answerIndex: 0,
    explanation:
      "Purkinje fibers rapidly conduct electrical impulses through the ventricular myocardium, coordinating ventricular contraction."
  },

  {
    id: "cardiology-133",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which term describes an abnormal or irregular heart rhythm?",
    choices: [
      "Dysrhythmia",
      "Infarction",
      "Edema",
      "Dilation"
    ],
    answerIndex: 0,
    explanation:
      "Dysrhythmia refers to an abnormal heart rhythm."
  },

  {
    id: "cardiology-134",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which term describes an abnormally slow heart rate?",
    choices: [
      "Bradycardia",
      "Tachycardia",
      "Fibrillation",
      "Automaticity"
    ],
    answerIndex: 0,
    explanation:
      "Bradycardia refers to an abnormally slow heart rate."
  },

  {
    id: "cardiology-135",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which rhythm consists of chaotic ventricular electrical activity that produces ineffective contractions and no useful cardiac output?",
    choices: [
      "Ventricular fibrillation",
      "Normal sinus rhythm",
      "Stable sinus bradycardia",
      "First-degree AV block"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation causes disorganized ventricular activity and ineffective mechanical contraction. It is a shockable cardiac arrest rhythm."
  },

  {
    id: "cardiology-136",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A pulseless patient is found to have ventricular fibrillation. Which treatment is specifically indicated for this shockable rhythm?",
    choices: [
      "Defibrillation",
      "Nitroglycerin",
      "Aspirin alone",
      "Synchronized cardioversion while the patient is pulseless"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation is a shockable cardiac arrest rhythm. Defibrillation is used to attempt to terminate the chaotic rhythm and allow an organized rhythm to resume."
  },

  {
    id: "cardiology-137",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which rhythm is characterized by a rapid ventricular rate originating from the ventricles and may deteriorate into ventricular fibrillation?",
    choices: [
      "Ventricular tachycardia",
      "Sinus bradycardia",
      "Asystole",
      "Normal sinus rhythm"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular tachycardia originates in the ventricles. It can reduce cardiac output and may deteriorate into ventricular fibrillation."
  },

  {
    id: "cardiology-138",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which finding best describes asystole?",
    choices: [
      "Absence of meaningful cardiac electrical activity",
      "Chaotic ventricular activity with ineffective contractions",
      "A rapid organized ventricular rhythm",
      "A predictable increase in heart rate during exercise"
    ],
    answerIndex: 0,
    explanation:
      "Asystole represents the absence of detectable cardiac electrical activity. It is a nonshockable cardiac arrest rhythm."
  },

  {
    id: "cardiology-139",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient has no palpable pulse despite continued electrical or mechanical cardiac activity that is insufficient to generate effective circulation. Which condition does this describe?",
    choices: [
      "Cardiac arrest",
      "Stable angina",
      "Hypertension",
      "Dependent edema"
    ],
    answerIndex: 0,
    explanation:
      "Cardiac arrest occurs when the heart fails to generate effective circulation. Electrical activity can sometimes continue despite the absence of a palpable pulse."
  },

  {
    id: "cardiology-140",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which rhythm is characterized by rapid, disorganized ventricular activity rather than coordinated ventricular contractions?",
    choices: [
      "Ventricular fibrillation",
      "Sinus rhythm",
      "Sinus bradycardia",
      "Stable angina"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation consists of chaotic ventricular electrical activity that prevents effective mechanical contraction."
  },

  // --------------------------------------------------------------------------
  // CHF / PULMONARY EDEMA / CARDIOGENIC SHOCK
  // --------------------------------------------------------------------------

  {
    id: "cardiology-141",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which condition occurs when the heart cannot pump effectively enough to meet the body's needs and fluid may accumulate in the lungs or peripheral tissues?",
    choices: [
      "Congestive heart failure",
      "Stable angina",
      "Ventricular fibrillation",
      "Aortic dilation"
    ],
    answerIndex: 0,
    explanation:
      "Congestive heart failure occurs when cardiac pumping is inadequate and congestion can develop in the pulmonary or systemic circulation."
  },

  {
    id: "cardiology-142",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with heart failure has swelling in both ankles that is worse after standing for long periods. What is this finding called?",
    choices: [
      "Dependent edema",
      "Pulmonary embolism",
      "Cyanosis",
      "Dilation"
    ],
    answerIndex: 0,
    explanation:
      "Dependent edema is fluid accumulation in body areas affected by gravity, commonly the lower legs and ankles."
  },

  {
    id: "cardiology-143",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with severe left-sided heart failure develops fluid accumulation within the pulmonary air spaces and severe respiratory distress. Which condition is most consistent with this finding?",
    choices: [
      "Pulmonary edema",
      "Dependent edema",
      "Stable angina",
      "Aortic aneurysm"
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary edema occurs when fluid accumulates in the lung interstitium and/or alveoli. It can cause severe respiratory distress and is commonly associated with acute left-sided heart failure."
  },

  {
    id: "cardiology-144",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with pulmonary congestion reports that breathing becomes significantly more difficult when lying flat. What is this symptom called?",
    choices: [
      "Orthopnea",
      "Apnea",
      "Tachycardia",
      "Syncope"
    ],
    answerIndex: 0,
    explanation:
      "Orthopnea is difficulty breathing while lying flat. It can occur with pulmonary congestion and heart failure."
  },

  {
    id: "cardiology-145",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which combination is most consistent with cardiogenic shock?",
    choices: [
      "Hypotension, weak rapid pulse, cool clammy skin, and poor perfusion",
      "Hypertension, warm dry skin, and bounding pulses",
      "Normal perfusion with isolated ankle pain",
      "Slow pulse with warm flushed skin in every case"
    ],
    answerIndex: 0,
    explanation:
      "Cardiogenic shock occurs when the heart cannot generate sufficient cardiac output to adequately perfuse tissues. Findings may include hypotension, weak pulses, cool clammy skin, altered mental status, and respiratory distress."
  },

  {
    id: "cardiology-146",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient develops severe hypotension because the heart is unable to pump enough blood to meet tissue demands. What type of shock is most consistent with this mechanism?",
    choices: [
      "Cardiogenic shock",
      "Neurogenic shock",
      "Hypovolemic shock",
      "Anaphylactic shock"
    ],
    answerIndex: 0,
    explanation:
      "Cardiogenic shock results from inadequate cardiac pumping and therefore inadequate tissue perfusion."
  },

  {
    id: "cardiology-147",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with chronic heart failure develops worsening shortness of breath and fluid accumulation in the lungs. What underlying problem is primarily responsible?",
    choices: [
      "The heart is unable to pump efficiently",
      "The pulmonary arteries are carrying oxygenated blood",
      "The myocardium is receiving excessive oxygen",
      "The patient's veins have stopped carrying blood"
    ],
    answerIndex: 0,
    explanation:
      "Heart failure involves inadequate cardiac pumping. Increased pressures can cause blood and fluid to back up into the pulmonary circulation, producing pulmonary congestion."
  },

  // --------------------------------------------------------------------------
  // DYSPNEA / APNEA / SYNCOPE
  // --------------------------------------------------------------------------

  {
    id: "cardiology-148",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which term means difficult or labored breathing?",
    choices: [
      "Dyspnea",
      "Apnea",
      "Syncope",
      "Bradycardia"
    ],
    answerIndex: 0,
    explanation:
      "Dyspnea is the subjective sensation or clinical experience of difficult or uncomfortable breathing."
  },

  {
    id: "cardiology-149",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient has temporarily stopped breathing. Which term describes this condition?",
    choices: [
      "Apnea",
      "Dyspnea",
      "Tachycardia",
      "Orthopnea"
    ],
    answerIndex: 0,
    explanation:
      "Apnea means the absence of breathing. It can occur temporarily or persist depending on the underlying cause."
  },

  {
    id: "cardiology-150",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient suddenly loses consciousness but regains consciousness spontaneously after a brief period. Which term best describes this event?",
    choices: [
      "Syncope",
      "Cardiac arrest",
      "Dyspnea",
      "Edema"
    ],
    answerIndex: 0,
    explanation:
      "Syncope is a temporary loss of consciousness caused by transient inadequate cerebral perfusion. Cardiac causes should be considered because some dysrhythmias can produce syncope."
  },

  // --------------------------------------------------------------------------
  // AORTIC DISEASE
  // --------------------------------------------------------------------------

  {
    id: "cardiology-151",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient suddenly develops severe chest or back pain described as tearing. You also notice unequal pulses between the extremities. Which condition should be strongly suspected?",
    choices: [
      "Acute aortic dissection",
      "Stable angina",
      "Dependent edema",
      "Sinus bradycardia"
    ],
    answerIndex: 0,
    explanation:
      "Acute aortic dissection can produce sudden severe tearing chest or back pain. Differences in pulse strength or blood pressure between extremities can occur when branches of the aorta become compromised."
  },

  {
    id: "cardiology-152",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A weakened section of the aortic wall becomes abnormally enlarged and is at risk of rupture. What is this condition called?",
    choices: [
      "Aortic aneurysm",
      "Aortic valve stenosis",
      "Pulmonary edema",
      "Coronary occlusion"
    ],
    answerIndex: 0,
    explanation:
      "An aortic aneurysm is an abnormal dilation caused by weakening of the aortic wall. Rupture can cause catastrophic internal bleeding."
  },

  {
    id: "cardiology-153",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Blood begins separating the layers of the aortic wall and tracks between them. What process does this describe?",
    choices: [
      "Aortic dissection",
      "Stable angina",
      "Myocardial infarction",
      "Dependent edema"
    ],
    answerIndex: 0,
    explanation:
      "An aortic dissection occurs when blood enters a tear in the aortic wall and separates its layers."
  },

  // --------------------------------------------------------------------------
  // INFARCTION / THROMBOEMBOLISM
  // --------------------------------------------------------------------------

  {
    id: "cardiology-154",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What term describes tissue death caused by an interruption of its blood supply?",
    choices: [
      "Infarction",
      "Dilation",
      "Automaticity",
      "Perfusion"
    ],
    answerIndex: 0,
    explanation:
      "Infarction refers to tissue death resulting from inadequate blood supply. A myocardial infarction is infarction of heart muscle."
  },

  {
    id: "cardiology-155",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A clot forms within a blood vessel, breaks loose, and travels through the bloodstream before obstructing another vessel. Which term best describes this event?",
    choices: [
      "Thromboembolism",
      "Dilation",
      "Automaticity",
      "Dependent edema"
    ],
    answerIndex: 0,
    explanation:
      "A thromboembolism involves a thrombus or portion of a thrombus that travels through the circulation and obstructs another vessel."
  },

  // --------------------------------------------------------------------------
  // LVAD
  // --------------------------------------------------------------------------

  {
    id: "cardiology-156",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient has an implanted device that mechanically assists the left ventricle in moving blood into systemic circulation. What is this device?",
    choices: [
      "Left ventricular assist device",
      "Implantable defibrillator only",
      "Pacemaker lead",
      "Aortic valve prosthesis"
    ],
    answerIndex: 0,
    explanation:
      "A left ventricular assist device, or LVAD, mechanically assists the left ventricle in pumping blood into the systemic circulation."
  },

  {
    id: "cardiology-157",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "When assessing a patient with a continuous-flow LVAD, an EMT may have difficulty obtaining a conventional pulse or automated blood pressure. What is the best explanation?",
    choices: [
      "Continuous-flow support can produce little or no palpable pulse pressure",
      "The patient necessarily has no circulation",
      "The LVAD permanently stops the patient's heart",
      "The device prevents oxygen from reaching the blood"
    ],
    answerIndex: 0,
    explanation:
      "Continuous-flow LVADs can produce minimal pulse pressure, making conventional pulse and automated blood pressure measurements difficult or unobtainable. Patients should not automatically be considered pulseless solely because a pulse cannot be palpated."
  },

  // --------------------------------------------------------------------------
  // AGING
  // --------------------------------------------------------------------------

  {
    id: "cardiology-158",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An older patient's body suddenly requires increased cardiac output during illness. Why may the heart have more difficulty meeting this demand than a younger person's heart?",
    choices: [
      "Cardiac reserve generally decreases with age",
      "The heart completely stops responding to stress with age",
      "Older adults have no coronary circulation",
      "Aging causes every adult to develop ventricular fibrillation"
    ],
    answerIndex: 0,
    explanation:
      "Cardiac reserve, or the ability to increase cardiac performance above resting levels, generally decreases with aging. This can make physiologic stress more difficult to tolerate."
  },

  // --------------------------------------------------------------------------
  // ECG ARTIFACT
  // --------------------------------------------------------------------------

  {
    id: "cardiology-159",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An ECG tracing contains irregular deflections caused by the patient moving and tightening muscles rather than by the heart's electrical activity. What is this called?",
    choices: [
      "Artifact",
      "Asystole",
      "Ventricular fibrillation",
      "Automaticity"
    ],
    answerIndex: 0,
    explanation:
      "Artifact is interference on an ECG that does not represent the patient's actual cardiac electrical activity. Patient movement, muscle activity, and poor electrode contact are common causes."
  },

  // ==========================================================================
  // REVERSE QUESTIONS
  // ==========================================================================
  // These deliberately approach the same concepts from the opposite direction.
  // Instead of asking "What is X?", they provide X's definition/effect and ask
  // the learner to identify X.
  // ==========================================================================

  {
    id: "cardiology-reverse-001",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A very rapid heart rate leaves insufficient time for the ventricles to fill, reducing stroke volume and potentially causing hypotension. What mechanism is being described?",
    choices: [
      "Reduced ventricular filling time",
      "Increased ventricular filling time",
      "Increased venous return",
      "Increased myocardial relaxation"
    ],
    answerIndex: 0,
    explanation:
      "Tachycardia shortens diastole and therefore reduces the time available for ventricular filling."
  },

  {
    id: "cardiology-reverse-002",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Rescuers periodically exchange the person performing compressions during a prolonged two-rescuer adult cardiac arrest. What interval is generally recommended?",
    choices: [
      "About every 2 minutes",
      "Every 15 minutes",
      "After every five compressions",
      "Only after ROSC"
    ],
    answerIndex: 0,
    explanation:
      "Switching compressors about every 2 minutes helps reduce rescuer fatigue and maintain high-quality compressions."
  },

  {
    id: "cardiology-reverse-003",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Predictable chest discomfort brought on by exertion and relieved by rest is characteristic of which condition?",
    choices: [
      "Stable angina",
      "Unstable angina",
      "Ventricular fibrillation",
      "Cardiac arrest"
    ],
    answerIndex: 0,
    explanation:
      "Stable angina is typically predictable and associated with exertion or increased myocardial oxygen demand."
  },

  {
    id: "cardiology-reverse-004",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Chest discomfort that occurs at rest or with minimal exertion and represents a change from a patient's usual pattern is most concerning for what condition?",
    choices: [
      "Unstable angina",
      "Stable angina",
      "Dependent edema",
      "Bradycardia"
    ],
    answerIndex: 0,
    explanation:
      "Unstable angina can occur at rest or with minimal exertion and is considered part of acute coronary syndrome."
  },

  {
    id: "cardiology-reverse-005",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Complete upward movement of the chest between CPR compressions promotes blood returning to the heart. What CPR principle is being described?",
    choices: [
      "Full chest recoil",
      "Overventilation",
      "Compression stacking",
      "Passive defibrillation"
    ],
    answerIndex: 0,
    explanation:
      "Full chest recoil helps create the pressure conditions necessary for venous return during CPR."
  },

  {
    id: "cardiology-reverse-006",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A collection of acute conditions caused by inadequate coronary blood flow, including myocardial infarction and unstable angina, is called:",
    choices: [
      "Acute coronary syndrome",
      "Congestive heart failure",
      "Cardiac arrest",
      "Cardiogenic shock"
    ],
    answerIndex: 0,
    explanation:
      "Acute coronary syndrome describes acute myocardial ischemia and includes unstable angina and myocardial infarction."
  },

  {
    id: "cardiology-reverse-007",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Permanent injury or death of myocardial cells caused by prolonged inadequate coronary blood flow is called:",
    choices: [
      "Acute myocardial infarction",
      "Stable angina",
      "Dilation",
      "Artifact"
    ],
    answerIndex: 0,
    explanation:
      "An acute myocardial infarction occurs when prolonged ischemia causes myocardial injury or cell death."
  },

  {
    id: "cardiology-reverse-008",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Temporary myocardial ischemia producing chest discomfort without permanent myocardial cell death is known as:",
    choices: [
      "Angina pectoris",
      "Myocardial infarction",
      "Cardiac arrest",
      "Asystole"
    ],
    answerIndex: 0,
    explanation:
      "Angina pectoris refers to chest discomfort caused by myocardial ischemia without myocardial infarction."
  },

  {
    id: "cardiology-reverse-009",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A weakened and abnormally enlarged portion of the aortic wall that may eventually rupture is called:",
    choices: [
      "An aortic aneurysm",
      "Aortic stenosis",
      "Aortic dissection",
      "Coronary occlusion"
    ],
    answerIndex: 0,
    explanation:
      "An aortic aneurysm is an abnormal dilation caused by weakness in the aortic wall."
  },

  {
    id: "cardiology-reverse-010",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "The valve between the left ventricle and the aorta prevents blood from returning to the ventricle after ejection. Which valve is this?",
    choices: [
      "Aortic valve",
      "Mitral valve",
      "Tricuspid valve",
      "Pulmonic valve"
    ],
    answerIndex: 0,
    explanation:
      "The aortic valve separates the left ventricle from the aorta and prevents backflow after ventricular contraction."
  },

  {
    id: "cardiology-reverse-011",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "ECG abnormalities produced by movement, muscle activity, or poor electrode contact rather than the patient's actual cardiac electrical activity are called:",
    choices: [
      "Artifact",
      "Asystole",
      "Ventricular tachycardia",
      "Automaticity"
    ],
    answerIndex: 0,
    explanation:
      "Artifact is unwanted interference that appears on an ECG but does not represent actual cardiac electrical activity."
  },

  {
    id: "cardiology-reverse-012",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A cardiac rhythm characterized by the complete absence of detectable electrical activity is called:",
    choices: [
      "Asystole",
      "Ventricular fibrillation",
      "Ventricular tachycardia",
      "Sinus tachycardia"
    ],
    answerIndex: 0,
    explanation:
      "Asystole is the absence of detectable cardiac electrical activity and is treated as a nonshockable cardiac arrest rhythm."
  },

  {
    id: "cardiology-reverse-013",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "The ability of specialized cardiac cells to spontaneously generate electrical impulses is called:",
    choices: [
      "Automaticity",
      "Dilation",
      "Contracture",
      "Perfusion"
    ],
    answerIndex: 0,
    explanation:
      "Automaticity is the ability of certain cardiac cells to generate impulses without an external nerve stimulus."
  },

  {
    id: "cardiology-reverse-014",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A condition in which the heart fails to generate effective circulation, resulting in an absent palpable pulse, is called:",
    choices: [
      "Cardiac arrest",
      "Stable angina",
      "Heart failure",
      "Hypertension"
    ],
    answerIndex: 0,
    explanation:
      "Cardiac arrest occurs when effective circulation ceases. Electrical activity may sometimes continue despite the lack of effective mechanical output."
  },

  {
    id: "cardiology-reverse-015",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A chronic condition in which inadequate cardiac pumping causes blood and fluid to back up into the pulmonary or systemic circulation is called:",
    choices: [
      "Congestive heart failure",
      "Acute coronary syndrome",
      "Stable angina",
      "Ventricular fibrillation"
    ],
    answerIndex: 0,
    explanation:
      "Congestive heart failure involves inadequate cardiac function with resulting congestion in the pulmonary and/or systemic circulation."
  },

  {
    id: "cardiology-reverse-016",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "The blood vessels that directly supply oxygenated blood to the myocardium are the:",
    choices: [
      "Coronary arteries",
      "Pulmonary veins",
      "Venae cavae",
      "Pulmonary arteries"
    ],
    answerIndex: 0,
    explanation:
      "The coronary arteries supply the myocardium with oxygenated blood."
  },

  {
    id: "cardiology-reverse-017",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Applying an electrical shock to a patient with a shockable ventricular rhythm in an attempt to restore an organized rhythm is called:",
    choices: [
      "Defibrillation",
      "Vasodilation",
      "Perfusion",
      "Pacing"
    ],
    answerIndex: 0,
    explanation:
      "Defibrillation delivers an unsynchronized electrical shock to treat shockable cardiac arrest rhythms such as ventricular fibrillation."
  },

  {
    id: "cardiology-reverse-018",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Fluid accumulation in gravity-dependent areas such as the ankles and lower legs is called:",
    choices: [
      "Dependent edema",
      "Pulmonary edema",
      "Cerebral edema",
      "Angina"
    ],
    answerIndex: 0,
    explanation:
      "Dependent edema occurs when fluid accumulates in areas affected by gravity, commonly the lower extremities."
  },

  {
    id: "cardiology-reverse-019",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A widening or enlargement of a tubular structure such as a blood vessel is known as:",
    choices: [
      "Dilation",
      "Occlusion",
      "Infarction",
      "Thromboembolism"
    ],
    answerIndex: 0,
    explanation:
      "Dilation means widening or enlargement of a tubular structure."
  },

  {
    id: "cardiology-reverse-020",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Blood enters a tear in the aortic wall and separates the layers of the vessel. What condition does this describe?",
    choices: [
      "Aortic dissection",
      "Aortic aneurysm",
      "Stable angina",
      "Myocardial infarction"
    ],
    answerIndex: 0,
    explanation:
      "Aortic dissection occurs when blood enters a damaged portion of the aortic wall and separates its layers."
  },

  {
    id: "cardiology-reverse-021",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An abnormal heart rhythm, whether too fast, too slow, or irregular, can be described by which general term?",
    choices: [
      "Dysrhythmia",
      "Infarction",
      "Edema",
      "Occlusion"
    ],
    answerIndex: 0,
    explanation:
      "Dysrhythmia is a general term for an abnormal cardiac rhythm."
  },

  {
    id: "cardiology-reverse-022",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A dangerously elevated blood pressure associated with acute or impending end-organ injury is called:",
    choices: [
      "Hypertensive emergency",
      "Stable angina",
      "Cardiogenic shock",
      "Bradycardia"
    ],
    answerIndex: 0,
    explanation:
      "A hypertensive emergency involves severely elevated blood pressure with acute target-organ injury and requires urgent medical management."
  },

  {
    id: "cardiology-reverse-023",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Death of tissue resulting from inadequate or interrupted blood supply is called:",
    choices: [
      "Infarction",
      "Dilation",
      "Automaticity",
      "Artifact"
    ],
    answerIndex: 0,
    explanation:
      "Infarction refers to tissue death caused by interruption of its blood supply."
  },

  {
    id: "cardiology-reverse-024",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "The open internal passageway through an artery is called the:",
    choices: [
      "Lumen",
      "Myocardium",
      "Pericardium",
      "Septum"
    ],
    answerIndex: 0,
    explanation:
      "The lumen is the hollow interior through which blood or another substance flows."
  },

  {
    id: "cardiology-reverse-025",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "The muscular tissue responsible for contracting and pumping blood is the:",
    choices: [
      "Myocardium",
      "Endocardium",
      "Pericardium",
      "Epicardium"
    ],
    answerIndex: 0,
    explanation:
      "The myocardium is the muscular layer of the heart and produces the force of cardiac contraction."
  },

  {
    id: "cardiology-reverse-026",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A blockage that prevents or significantly restricts flow through a blood vessel is called an:",
    choices: [
      "Occlusion",
      "Dilation",
      "Infarction",
      "Artifact"
    ],
    answerIndex: 0,
    explanation:
      "An occlusion is a blockage of a vessel or other hollow structure."
  },

  {
    id: "cardiology-reverse-027",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A clot or portion of a clot travels through the bloodstream and obstructs a distant vessel. This is called:",
    choices: [
      "Thromboembolism",
      "Dilation",
      "Automaticity",
      "Angina"
    ],
    answerIndex: 0,
    explanation:
      "A thromboembolism occurs when a thrombus or fragment travels through the circulation and becomes lodged elsewhere."
  },

  {
    id: "cardiology-reverse-028",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Chaotic, ineffective ventricular electrical activity that produces no useful cardiac output is known as:",
    choices: [
      "Ventricular fibrillation",
      "Ventricular tachycardia",
      "Sinus bradycardia",
      "Normal sinus rhythm"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation produces disorganized ventricular activity and ineffective mechanical contraction. It is a shockable rhythm."
  },

  {
    id: "cardiology-reverse-029",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A rapid cardiac rhythm originating in the ventricles that can compromise cardiac output and deteriorate into ventricular fibrillation is called:",
    choices: [
      "Ventricular tachycardia",
      "Sinus bradycardia",
      "Asystole",
      "Stable angina"
    ],
    answerIndex: 0,
    explanation:
      "Ventricular tachycardia originates in the ventricles and can range from tolerated to immediately life-threatening."
  },

  {
    id: "cardiology-reverse-030",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A medication causes venous and other vascular smooth muscle relaxation, reducing preload and myocardial oxygen demand. Which medication is being described?",
    choices: [
      "Nitroglycerin",
      "Aspirin",
      "Epinephrine",
      "Atropine"
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin produces vasodilation, particularly venodilation, which can reduce preload and myocardial oxygen demand."
  },

  {
    id: "cardiology-reverse-031",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Fluid accumulation within the lungs that can cause severe respiratory distress, crackles, and difficulty breathing is called:",
    choices: [
      "Pulmonary edema",
      "Dependent edema",
      "Angina",
      "Aortic dissection"
    ],
    answerIndex: 0,
    explanation:
      "Pulmonary edema involves abnormal fluid accumulation in the lungs and can cause significant respiratory distress."
  },

  {
    id: "cardiology-reverse-032",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Difficulty breathing that becomes worse when a patient lies flat is called:",
    choices: [
      "Orthopnea",
      "Apnea",
      "Syncope",
      "Tachycardia"
    ],
    answerIndex: 0,
    explanation:
      "Orthopnea is difficulty breathing when lying flat and is commonly associated with heart failure."
  },

  {
    id: "cardiology-reverse-033",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A condition in which inadequate cardiac output causes insufficient oxygen delivery to body tissues is known as:",
    choices: [
      "Cardiogenic shock",
      "Stable angina",
      "Dependent edema",
      "Hypertensive emergency"
    ],
    answerIndex: 0,
    explanation:
      "Cardiogenic shock occurs when cardiac function is inadequate to maintain sufficient tissue perfusion."
  },

  {
    id: "cardiology-reverse-034",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "The medical term for difficult or uncomfortable breathing is:",
    choices: [
      "Dyspnea",
      "Apnea",
      "Syncope",
      "Bradycardia"
    ],
    answerIndex: 0,
    explanation:
      "Dyspnea refers to difficult or uncomfortable breathing."
  },

  {
    id: "cardiology-reverse-035",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A temporary loss of consciousness caused by transient inadequate cerebral perfusion is called:",
    choices: [
      "Syncope",
      "Cardiac arrest",
      "Dyspnea",
      "Edema"
    ],
    answerIndex: 0,
    explanation:
      "Syncope is a transient loss of consciousness resulting from inadequate cerebral perfusion. Cardiac dysrhythmias are one possible cause."
  },

  {
    id: "cardiology-reverse-036",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A device implanted to mechanically assist the left ventricle in circulating blood is called a:",
    choices: [
      "Left ventricular assist device",
      "Pulmonary artery catheter",
      "Aortic valve",
      "Pacemaker electrode"
    ],
    answerIndex: 0,
    explanation:
      "An LVAD mechanically assists the left ventricle in pumping blood into the systemic circulation."
  },

  {
    id: "cardiology-reverse-037",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A condition in which the heart has less ability to increase its performance when the body suddenly demands more blood flow is associated with:",
    choices: [
      "Reduced cardiac reserve with aging",
      "Increased coronary reserve",
      "Acute automaticity",
      "Pulmonary embolism"
    ],
    answerIndex: 0,
    explanation:
      "Cardiac reserve generally decreases with age, limiting the heart's ability to increase output during physiologic stress."
  },

  {
    id: "cardiology-reverse-038",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with a very high blood pressure develops acute injury to a target organ. Which condition best describes this situation?",
    choices: [
      "Hypertensive emergency",
      "Stable angina",
      "Cardiogenic shock",
      "Dependent edema"
    ],
    answerIndex: 0,
    explanation:
      "A hypertensive emergency is severe hypertension accompanied by acute target-organ damage."
  },

  {
    id: "cardiology-reverse-039",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with a continuous-flow LVAD has no easily palpable peripheral pulse, but the device is functioning and the patient shows signs of circulation. Which explanation is most appropriate?",
    choices: [
      "Continuous-flow support may produce minimal pulse pressure",
      "The patient is automatically in cardiac arrest",
      "The LVAD has stopped all blood movement",
      "The patient cannot have a blood pressure"
    ],
    answerIndex: 0,
    explanation:
      "Continuous-flow LVADs can produce little pulse pressure. Assessment should therefore include device function, perfusion, mental status, skin signs, and other appropriate measures rather than relying solely on a palpable pulse."
  },

  {
    id: "cardiology-reverse-040",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An ECG shows interference caused by patient movement rather than genuine cardiac electrical activity. Which term should the EMT use?",
    choices: [
      "Artifact",
      "Asystole",
      "Ventricular fibrillation",
      "Dysrhythmia"
    ],
    answerIndex: 0,
    explanation:
      "Artifact is an ECG tracing disturbance caused by factors other than the patient's cardiac electrical activity."
  },

  {
    id: "cardiology-160",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which combination of actions has the greatest potential to improve survival in a patient experiencing cardiac arrest?",
    choices: [
      "Early CPR and rapid defibrillation when indicated",
      "Obtaining a complete medical history before treatment",
      "Providing oral fluids and positioning the patient upright",
      "Waiting for ALS before beginning resuscitation",
    ],
    answerIndex: 0,
    explanation:
      "High-quality CPR and early defibrillation for a shockable rhythm are two of the most important interventions in cardiac arrest. Treatment should not be delayed while waiting for additional information or ALS.",
  },

  {
    id: "cardiology-161",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An AED analyzes an unresponsive, pulseless patient and announces that no shock is advised. What should you do next?",
    choices: [
      "Immediately remove the AED pads",
      "Resume chest compressions",
      "Wait two minutes before touching the patient",
      "Deliver a shock manually",
    ],
    answerIndex: 1,
    explanation:
      "A no-shock-advised message means the AED did not identify a shockable rhythm. Resume high-quality CPR immediately and follow the AED's subsequent prompts.",
  },

  {
    id: "cardiology-162",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "When assessing an unresponsive child, how long should an EMS provider spend checking for normal breathing before moving on with the assessment?",
    choices: [
      "No more than about 10 seconds",
      "Approximately 30 seconds",
      "At least one full minute",
      "Until spontaneous breathing is definitely observed",
    ],
    answerIndex: 0,
    explanation:
      "The breathing assessment should be brief. In an unresponsive patient, prolonged assessment delays CPR and other lifesaving interventions.",
  },

  {
    id: "cardiology-163",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which adult CPR technique is consistent with current high-quality CPR recommendations?",
    choices: [
      "Compress approximately 2 inches deep at a rate of 100 to 120/min",
      "Compress 1 inch deep at a rate of 60 to 80/min",
      "Compress 3 inches deep at a rate of 140 to 160/min",
      "Compress approximately 1.5 inches deep at a rate of 80 to 100/min",
    ],
    answerIndex: 0,
    explanation:
      "For adults, chest compressions should generally be at least 2 inches deep while avoiding excessive depth, with a rate of 100 to 120 compressions per minute.",
  },

  {
    id: "cardiology-164",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "During two-rescuer CPR on an adult, what compression-to-ventilation ratio should be used when an advanced airway is not in place?",
    choices: [
      "15:2",
      "30:2",
      "5:1",
      "30:1",
    ],
    answerIndex: 1,
    explanation:
      "Adult CPR uses a 30:2 compression-to-ventilation ratio when no advanced airway is in place, regardless of whether one or two rescuers are performing CPR.",
  },

  {
    id: "cardiology-165",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which pulse is normally assessed in an infant during an initial pulse check?",
    choices: [
      "Radial",
      "Carotid",
      "Brachial",
      "Femoral",
    ],
    answerIndex: 2,
    explanation:
      "The brachial pulse is commonly assessed in infants because it is accessible and reliable during pediatric resuscitation.",
  },

  {
    id: "cardiology-166",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "During CPR, approximately how often should the patient be reassessed for signs of circulation and breathing?",
    choices: [
      "Every 30 seconds",
      "Every 2 minutes",
      "Every 5 minutes",
      "Only after transport begins",
    ],
    answerIndex: 1,
    explanation:
      "CPR cycles generally last about 2 minutes. At that point, the rhythm and patient should be reassessed according to the applicable resuscitation algorithm.",
  },

  {
    id: "cardiology-167",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An unresponsive child has a suspected severe airway obstruction. Which action is used as part of CPR to help relieve the obstruction?",
    choices: [
      "Repeated blind finger sweeps",
      "Chest compressions",
      "Giving the child water",
      "Placing the child in a standing position",
    ],
    answerIndex: 1,
    explanation:
      "For an unresponsive patient with severe foreign-body airway obstruction, CPR is initiated. Each time the airway is opened, the mouth is checked for a visible object before attempting ventilation.",
  },

  // ============================================================
  // SHOCK / CARDIAC FUNCTION
  // ============================================================

  {
    id: "cardiology-168",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which mechanism best describes cardiogenic shock?",
    choices: [
      "The heart cannot pump effectively enough to maintain adequate circulation",
      "The blood vessels suddenly become excessively dilated because of an allergic reaction",
      "The patient loses blood volume through external hemorrhage",
      "The heart receives too much oxygenated blood",
    ],
    answerIndex: 0,
    explanation:
      "Cardiogenic shock occurs when the heart's pumping ability is severely impaired, resulting in inadequate tissue perfusion. Acute myocardial infarction is a common cause.",
  },

  {
    id: "cardiology-169",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What is a pericardial effusion?",
    choices: [
      "Fluid accumulating within the pericardial space",
      "Air accumulating inside the pleural cavity",
      "Blood accumulating inside the pulmonary arteries",
      "Fluid accumulating inside the ventricles",
    ],
    answerIndex: 0,
    explanation:
      "A pericardial effusion is an abnormal accumulation of fluid in the space surrounding the heart. If pressure becomes significant, cardiac tamponade can result.",
  },

  {
    id: "cardiology-170",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Cardiac tamponade develops when accumulated fluid or blood around the heart:",
    choices: [
      "Prevents the heart from filling adequately",
      "Causes the lungs to produce excessive surfactant",
      "Increases oxygen delivery to the myocardium",
      "Causes the ventricles to contract continuously",
    ],
    answerIndex: 0,
    explanation:
      "Cardiac tamponade occurs when pressure within the pericardial space interferes with cardiac filling. This can significantly reduce cardiac output.",
  },

  {
    id: "cardiology-171",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which combination is classically associated with cardiac tamponade?",
    choices: [
      "JVD, muffled heart sounds, and hypotension",
      "Wheezing, hypertension, and bradycardia",
      "Fever, unilateral leg swelling, and hypertension",
      "Crackles, bounding pulses, and severe hypertension",
    ],
    answerIndex: 0,
    explanation:
      "Beck's triad consists of hypotension, muffled heart sounds, and jugular venous distention. The complete triad may not always be present in the field.",
  },

  {
    id: "cardiology-172",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which assessment finding would be most concerning for cardiogenic shock?",
    choices: [
      "Warm, dry skin with a strong regular pulse",
      "Cool, clammy skin with hypotension and signs of poor perfusion",
      "Mild hypertension with a normal respiratory rate",
      "Bradycardia with normal mental status and normal skin findings",
    ],
    answerIndex: 1,
    explanation:
      "Cardiogenic shock can produce poor tissue perfusion, hypotension, cool clammy skin, altered mental status, and respiratory distress. Pulmonary edema may occur when left-sided cardiac function is impaired.",
  },

  {
    id: "cardiology-173",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A 58-year-old patient has severe chest discomfort, dyspnea, cool clammy skin, hypotension, crackles throughout both lungs, and an irregular rapid pulse. Which condition should be high on your differential?",
    choices: [
      "Cardiogenic shock",
      "Simple anxiety",
      "Isolated dehydration without cardiac involvement",
      "Uncomplicated hypertension",
    ],
    answerIndex: 0,
    explanation:
      "The combination of chest pain, hypotension, pulmonary crackles, and signs of poor perfusion is concerning for severe cardiac dysfunction and cardiogenic shock.",
  },

  // ============================================================
  // ANATOMY / PHYSIOLOGY
  // ============================================================

  {
    id: "cardiology-174",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which structure separates the left and right sides of the heart?",
    choices: [
      "Septum",
      "Pericardium",
      "Aorta",
      "Vena cava",
    ],
    answerIndex: 0,
    explanation:
      "The cardiac septum separates the left and right sides of the heart and helps prevent oxygenated and deoxygenated blood from mixing under normal conditions.",
  },

  {
    id: "cardiology-175",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Deoxygenated systemic venous blood first enters which chamber of the heart?",
    choices: [
      "Left atrium",
      "Left ventricle",
      "Right atrium",
      "Right ventricle",
    ],
    answerIndex: 2,
    explanation:
      "The superior and inferior venae cavae return systemic venous blood to the right atrium.",
  },

  {
    id: "cardiology-176",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which chamber pumps oxygen-rich blood into the systemic circulation?",
    choices: [
      "Right atrium",
      "Right ventricle",
      "Left atrium",
      "Left ventricle",
    ],
    answerIndex: 3,
    explanation:
      "The left ventricle ejects oxygenated blood through the aorta into the systemic circulation.",
  },

  {
    id: "cardiology-177",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Under normal conditions, where does the electrical impulse that initiates each heartbeat originate?",
    choices: [
      "AV node",
      "SA node",
      "Bundle branches",
      "Purkinje fibers",
    ],
    answerIndex: 1,
    explanation:
      "The sinoatrial node normally serves as the heart's primary pacemaker and initiates the electrical impulse that begins each cardiac cycle.",
  },

  {
    id: "cardiology-178",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What term describes the ability of cardiac cells, particularly pacemaker cells, to generate electrical impulses without an external stimulus?",
    choices: [
      "Automaticity",
      "Contractility",
      "Perfusion",
      "Compliance",
    ],
    answerIndex: 0,
    explanation:
      "Automaticity refers to the ability of certain cardiac cells to spontaneously generate electrical impulses.",
  },

  {
    id: "cardiology-179",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What is a primary cardiovascular effect of sympathetic nervous system activation?",
    choices: [
      "Decreased heart rate and cardiac output",
      "Increased heart rate and contractility with peripheral vasoconstriction",
      "Complete relaxation of systemic blood vessels",
      "Suppression of cardiac electrical activity",
    ],
    answerIndex: 1,
    explanation:
      "Sympathetic activation generally increases heart rate and contractility and promotes vasoconstriction, helping support blood pressure and perfusion during stress.",
  },

  {
    id: "cardiology-180",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which response is most consistent with parasympathetic stimulation of the cardiovascular system?",
    choices: [
      "Increased heart rate",
      "Decreased heart rate",
      "Marked systemic vasoconstriction",
      "Increased ventricular contractility",
    ],
    answerIndex: 1,
    explanation:
      "Parasympathetic activity, particularly through the vagus nerve, slows the heart rate. Its effects on systemic vascular tone are much more limited than those of the sympathetic system.",
  },

  {
    id: "cardiology-181",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "When myocardial oxygen demand increases in a healthy person, coronary blood flow can increase primarily through:",
    choices: [
      "Coronary vasodilation",
      "Closure of the coronary arteries",
      "Reduced myocardial metabolism",
      "Constriction of all coronary vessels",
    ],
    answerIndex: 0,
    explanation:
      "The coronary circulation can dilate in response to increased metabolic demand, allowing greater blood flow and oxygen delivery to the myocardium.",
  },

  {
    id: "cardiology-182",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which vessels supply the myocardium itself with oxygenated blood?",
    choices: [
      "Pulmonary veins",
      "Coronary arteries",
      "Venae cavae",
      "Carotid arteries",
    ],
    answerIndex: 1,
    explanation:
      "The coronary arteries branch from the aorta and supply blood to the heart muscle.",
  },

  {
    id: "cardiology-183",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "The external iliac arteries continue into which major arteries of the lower extremities?",
    choices: [
      "Radial arteries",
      "Femoral arteries",
      "Carotid arteries",
      "Brachial arteries",
    ],
    answerIndex: 1,
    explanation:
      "The external iliac arteries become the femoral arteries as they pass into the lower extremities.",
  },

  {
    id: "cardiology-184",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which major veins return systemic blood directly to the right atrium?",
    choices: [
      "Pulmonary veins",
      "Coronary arteries",
      "Superior and inferior venae cavae",
      "Femoral arteries",
    ],
    answerIndex: 2,
    explanation:
      "The superior and inferior venae cavae return deoxygenated systemic blood to the right atrium.",
  },

  {
    id: "cardiology-185",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What does systolic blood pressure represent?",
    choices: [
      "The lowest arterial pressure during ventricular relaxation",
      "The highest arterial pressure generated during ventricular contraction",
      "The pressure inside the atria during filling",
      "The pressure inside the pulmonary veins",
    ],
    answerIndex: 1,
    explanation:
      "Systolic pressure is the peak arterial pressure produced primarily by ventricular contraction and ejection of blood.",
  },

  {
    id: "cardiology-186",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What are pulses such as radial and dorsalis pedis pulses generally classified as?",
    choices: [
      "Central pulses",
      "Peripheral pulses",
      "Apical pulses",
      "Pulmonary pulses",
    ],
    answerIndex: 1,
    explanation:
      "Pulses palpated in the extremities are considered peripheral pulses.",
  },

  {
    id: "cardiology-187",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What term describes pulses palpated at locations close to the body's central circulation, such as the carotid or femoral artery?",
    choices: [
      "Peripheral pulses",
      "Central pulses",
      "Venous pulses",
      "Capillary pulses",
    ],
    answerIndex: 1,
    explanation:
      "Carotid and femoral pulses are examples of central pulses that are useful when assessing circulation in critically ill patients.",
  },

  // ============================================================
  // ACS / ISCHEMIA
  // ============================================================

  {
    id: "cardiology-188",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What is the medical term for inadequate blood flow and oxygen delivery to the myocardium?",
    choices: [
      "Ischemia",
      "Embolism",
      "Aneurysm",
      "Tamponade",
    ],
    answerIndex: 0,
    explanation:
      "Myocardial ischemia occurs when the heart muscle does not receive enough oxygenated blood to meet its metabolic needs.",
  },

  {
    id: "cardiology-189",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What disease process involves lipid and other material accumulating within arterial walls and forming atherosclerotic plaques?",
    choices: [
      "Atherosclerosis",
      "Tamponade",
      "Tachycardia",
      "Pericarditis",
    ],
    answerIndex: 0,
    explanation:
      "Atherosclerosis involves plaque formation within arterial walls. It can narrow coronary arteries and contribute to acute coronary syndromes.",
  },

  {
    id: "cardiology-190",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which term describes a complete blockage of a blood vessel?",
    choices: [
      "Occlusion",
      "Perfusion",
      "Dilation",
      "Automaticity",
    ],
    answerIndex: 0,
    explanation:
      "An occlusion is a blockage that prevents or severely restricts blood flow through a vessel.",
  },

  {
    id: "cardiology-191",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What is a thromboembolism?",
    choices: [
      "A blood clot that travels through the circulation and obstructs a vessel",
      "A normal opening between the atria",
      "A temporary increase in coronary blood flow",
      "Fluid accumulation around the heart",
    ],
    answerIndex: 0,
    explanation:
      "A thromboembolism occurs when a thrombus or part of it becomes mobile and travels through the bloodstream until it lodges in a vessel too small to allow it to pass.",
  },

  {
    id: "cardiology-192",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What is the term for myocardial tissue injury caused by prolonged interruption of coronary blood flow?",
    choices: [
      "Acute myocardial infarction",
      "Stable angina",
      "Sinus bradycardia",
      "Cardiac tamponade",
    ],
    answerIndex: 0,
    explanation:
      "An acute myocardial infarction occurs when prolonged inadequate coronary blood flow causes myocardial injury and cell death.",
  },

  {
    id: "cardiology-193",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Acute coronary syndrome refers to a group of conditions caused by:",
    choices: [
      "Acute reduction in coronary blood flow",
      "Excessive blood flow through the pulmonary circulation",
      "Isolated abnormalities of the respiratory muscles",
      "Fluid accumulation in the pericardial sac only",
    ],
    answerIndex: 0,
    explanation:
      "ACS describes acute myocardial ischemia resulting from impaired coronary blood flow. It includes unstable angina and myocardial infarction.",
  },

  {
    id: "cardiology-194",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which conditions are included within the acute coronary syndrome spectrum?",
    choices: [
      "Stable angina and hypertension",
      "Unstable angina and myocardial infarction",
      "Cardiac tamponade and CHF",
      "Aortic aneurysm and bradycardia",
    ],
    answerIndex: 1,
    explanation:
      "ACS includes unstable angina, NSTEMI, and STEMI. Stable angina is generally considered chronic coronary disease rather than an acute coronary syndrome.",
  },

  {
    id: "cardiology-195",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What is the most common underlying cause of angina related to coronary artery disease?",
    choices: [
      "Atherosclerotic coronary artery disease",
      "Cardiac tamponade",
      "Pulmonary infection",
      "Aortic valve rupture",
    ],
    answerIndex: 0,
    explanation:
      "Atherosclerotic narrowing of the coronary arteries is a common cause of myocardial ischemia and angina.",
  },

  {
    id: "cardiology-196",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Why does myocardial ischemic pain occur during an episode of angina?",
    choices: [
      "The myocardium requires more oxygen than the coronary circulation can supply",
      "The lungs stop exchanging carbon dioxide",
      "The atria stop receiving venous blood",
      "The pericardium fills with air",
    ],
    answerIndex: 0,
    explanation:
      "Angina results from an imbalance between myocardial oxygen demand and coronary oxygen supply, producing ischemia and discomfort.",
  },

  {
    id: "cardiology-197",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which presentation is most characteristic of typical anginal discomfort?",
    choices: [
      "Pressure or squeezing in the chest that may radiate to the arm, jaw, back, or epigastrium",
      "Sharp pain that always improves with exertion",
      "Isolated pain in one finger",
      "A rash without any cardiovascular symptoms",
    ],
    answerIndex: 0,
    explanation:
      "Cardiac ischemic discomfort is often described as pressure, heaviness, squeezing, or tightness. It may radiate to the arm, jaw, back, neck, or epigastrium and can be accompanied by dyspnea, nausea, or diaphoresis.",
  },

  {
    id: "cardiology-198",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which situation is most consistent with stable angina?",
    choices: [
      "Predictable chest discomfort triggered by exertion that improves with rest",
      "New severe chest pain occurring at rest and lasting despite treatment",
      "Sudden tearing chest pain radiating between the shoulder blades",
      "Chest pain accompanied by pulselessness",
    ],
    answerIndex: 0,
    explanation:
      "Stable angina typically occurs predictably with exertion or stress and improves with rest or prescribed antianginal therapy. New, worsening, or rest pain is concerning for ACS.",
  },

  {
    id: "cardiology-199",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which finding would make chest discomfort more concerning for unstable angina or another acute coronary syndrome?",
    choices: [
      "Pain that is new, worsening, or occurs at rest",
      "Pain that occurs predictably during strenuous exercise and resolves with rest",
      "Pain that lasts only a few seconds after touching the chest wall",
      "Pain that occurs only after eating spicy food",
    ],
    answerIndex: 0,
    explanation:
      "New, worsening, prolonged, or rest-related ischemic symptoms are concerning for ACS and require prompt evaluation.",
  },

  {
    id: "cardiology-200",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which presentation should increase your suspicion for acute myocardial infarction?",
    choices: [
      "Persistent pressure-like chest discomfort with diaphoresis, nausea, or dyspnea",
      "Brief pain that occurs only when the chest is touched",
      "Mild itching with no cardiovascular symptoms",
      "A chronic ankle injury",
    ],
    answerIndex: 0,
    explanation:
      "AMI can produce persistent pressure, squeezing, or discomfort accompanied by diaphoresis, nausea, dyspnea, weakness, or radiation to the arm, jaw, back, neck, or upper abdomen. Some patients may have atypical or minimal pain.",
  },

  // ============================================================
  // DYSRHYTHMIAS / AED
  // ============================================================

  {
    id: "cardiology-201",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What does the term dysrhythmia describe?",
    choices: [
      "An abnormal cardiac rhythm",
      "An infection of the myocardium",
      "A blockage in the airway",
      "A buildup of fluid in the lungs",
    ],
    answerIndex: 0,
    explanation:
      "Dysrhythmia is commonly used to describe an abnormal heart rhythm or rate.",
  },

  {
    id: "cardiology-202",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "In an adult, which heart rate meets the usual definition of tachycardia?",
    choices: [
      "Less than 40 beats/min",
      "Less than 60 beats/min",
      "Greater than 100 beats/min",
      "Exactly 80 beats/min",
    ],
    answerIndex: 2,
    explanation:
      "Tachycardia generally refers to a heart rate greater than 100 beats/min in an adult, although clinical significance depends on the patient and rhythm.",
  },

  {
    id: "cardiology-203",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which adult heart rate is generally classified as bradycardia?",
    choices: [
      "Less than 60 beats/min",
      "Greater than 100 beats/min",
      "Greater than 140 beats/min",
      "Exactly 100 beats/min",
    ],
    answerIndex: 0,
    explanation:
      "In adults, a heart rate below 60 beats/min is generally described as bradycardia. Whether it is clinically significant depends on the patient.",
  },

  {
    id: "cardiology-204",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which dysrhythmia is characterized by a rapid ventricular rhythm that can occur at approximately 150 to 250 beats/min?",
    choices: [
      "Ventricular tachycardia",
      "Sinus bradycardia",
      "Asystole",
      "Atrial standstill",
    ],
    answerIndex: 0,
    explanation:
      "Ventricular tachycardia originates in the ventricles and may produce a rapid, often wide-complex rhythm. It can be pulseless and life-threatening.",
  },

  {
    id: "cardiology-205",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which rhythm consists of chaotic electrical activity that causes the ventricles to quiver rather than contract effectively?",
    choices: [
      "Ventricular fibrillation",
      "Sinus tachycardia",
      "First-degree AV block",
      "Sinus bradycardia",
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation is a chaotic ventricular rhythm that produces no effective mechanical contraction and therefore results in cardiac arrest.",
  },

  {
    id: "cardiology-206",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "You arrive at a cardiac arrest and find ventricular fibrillation, but an AED is not yet available. What should you do?",
    choices: [
      "Begin high-quality CPR while the AED is obtained",
      "Wait without touching the patient",
      "Give the patient oral medication",
      "Transport immediately without performing CPR",
    ],
    answerIndex: 0,
    explanation:
      "When defibrillation is not immediately available, high-quality CPR should be initiated while another rescuer retrieves the AED.",
  },

  {
    id: "cardiology-207",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A prolonged period of untreated ventricular fibrillation or pulseless ventricular tachycardia may eventually deteriorate into:",
    choices: [
      "Asystole",
      "Normal sinus rhythm",
      "Stable angina",
      "Sinus tachycardia",
    ],
    answerIndex: 0,
    explanation:
      "Without effective resuscitation, prolonged VF or pulseless VT can deteriorate to asystole, a non-shockable rhythm.",
  },

  {
    id: "cardiology-208",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which patient is an appropriate candidate for AED analysis?",
    choices: [
      "An alert patient with mild chest discomfort",
      "A responsive patient with a normal pulse",
      "An unresponsive patient who is not breathing normally and has no pulse",
      "A patient with stable angina who is speaking normally",
    ],
    answerIndex: 2,
    explanation:
      "An AED is used for a patient in cardiac arrest who is unresponsive and has no signs of effective circulation. The device analyzes the rhythm and advises whether a shock is indicated.",
  },

  {
    id: "cardiology-209",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What should rescuers generally do immediately after an AED delivers a shock?",
    choices: [
      "Resume CPR beginning with chest compressions",
      "Remove the AED pads",
      "Check the patient's blood pressure for one full minute",
      "Immediately transport without further resuscitation",
    ],
    answerIndex: 0,
    explanation:
      "After a shock, CPR should be resumed immediately, beginning with compressions, unless the AED directs otherwise. Rhythm analysis is repeated after another CPR cycle.",
  },

  // ============================================================
  // HEART FAILURE / PULMONARY EDEMA
  // ============================================================

  {
    id: "cardiology-210",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which description best fits congestive heart failure?",
    choices: [
      "The heart cannot pump or fill effectively enough to meet the body's needs, often resulting in fluid congestion",
      "A complete absence of electrical activity in the heart",
      "A temporary increase in coronary blood flow",
      "An isolated infection of the airway",
    ],
    answerIndex: 0,
    explanation:
      "Heart failure occurs when the heart cannot adequately pump or fill. Elevated pressures can cause fluid to accumulate in the lungs or peripheral tissues.",
  },

  {
    id: "cardiology-211",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which finding is particularly associated with right-sided heart failure?",
    choices: [
      "Jugular venous distention and dependent peripheral edema",
      "Isolated wheezing after exercise",
      "Sudden unilateral loss of vision",
      "Dry mucous membranes with no other findings",
    ],
    answerIndex: 0,
    explanation:
      "Right-sided heart failure commonly causes systemic venous congestion, which can produce JVD and dependent peripheral edema.",
  },

  {
    id: "cardiology-212",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which finding is particularly suggestive of pulmonary congestion from left-sided heart failure?",
    choices: [
      "Bilateral crackles and increasing respiratory distress",
      "Isolated ankle pain",
      "A normal respiratory examination",
      "Dry skin with no respiratory symptoms",
    ],
    answerIndex: 0,
    explanation:
      "Left-sided heart failure can increase pulmonary venous pressure and cause pulmonary edema, producing dyspnea, crackles, and hypoxemia.",
  },

  {
    id: "cardiology-213",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with heart failure has dyspnea and crackles caused by fluid backing up into the pulmonary circulation. Where is the excess fluid affecting gas exchange?",
    choices: [
      "The lungs",
      "The spleen",
      "The femoral arteries",
      "The pericardial cavity",
    ],
    answerIndex: 0,
    explanation:
      "Left-sided heart failure can cause pulmonary venous congestion and fluid accumulation in the lungs, interfering with normal gas exchange.",
  },

  {
    id: "cardiology-214",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient with acute cardiogenic pulmonary edema is conscious, breathing spontaneously, and has significant respiratory distress. Which noninvasive therapy may improve oxygenation and reduce the work of breathing when allowed by protocol?",
    choices: [
      "CPAP",
      "A rigid cervical collar",
      "Oral fluids",
      "A blind finger sweep",
    ],
    answerIndex: 0,
    explanation:
      "CPAP can improve oxygenation and reduce the work of breathing in appropriately selected patients with cardiogenic pulmonary edema. It should be used according to local protocol and contraindications.",
  },

  // ============================================================
  // HYPERTENSION / AORTIC EMERGENCIES
  // ============================================================

  {
    id: "cardiology-215",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which symptom in a severely hypertensive patient should raise concern for a hypertensive emergency?",
    choices: [
      "Sudden severe headache accompanied by possible neurologic symptoms",
      "Mild hunger",
      "A chronic bruise",
      "Brief hiccups",
    ],
    answerIndex: 0,
    explanation:
      "Severe hypertension accompanied by acute symptoms or evidence of target-organ injury can represent a hypertensive emergency. Severe headache, neurologic changes, chest pain, or dyspnea may be concerning.",
  },

  {
    id: "cardiology-216",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which combination could be associated with a hypertensive emergency?",
    choices: [
      "Severe hypertension with headache, nausea, neurologic changes, or visual symptoms",
      "Normal blood pressure with an isolated paper cut",
      "Mild hypotension with no symptoms",
      "A normal pulse after exercise",
    ],
    answerIndex: 0,
    explanation:
      "A hypertensive emergency involves severe hypertension with acute target-organ injury. Neurologic, cardiovascular, renal, or visual symptoms may be present.",
  },

  {
    id: "cardiology-217",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Why is an untreated hypertensive emergency potentially life-threatening?",
    choices: [
      "It can cause acute damage to organs such as the brain, heart, kidneys, or aorta",
      "It always causes immediate cardiac arrest",
      "It permanently lowers blood pressure",
      "It prevents the heart from receiving any venous blood",
    ],
    answerIndex: 0,
    explanation:
      "Severe hypertension with acute target-organ injury can result in stroke, heart failure, myocardial ischemia, kidney injury, or aortic dissection.",
  },

  {
    id: "cardiology-218",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What is an aortic aneurysm?",
    choices: [
      "An abnormal enlargement or weakening of a portion of the aortic wall",
      "A clot inside a coronary artery",
      "A complete absence of ventricular electrical activity",
      "Fluid accumulation inside the lungs",
    ],
    answerIndex: 0,
    explanation:
      "An aortic aneurysm is an abnormal dilation or weakening of the aortic wall. Rupture or dissection can be life-threatening emergencies.",
  },

  {
    id: "cardiology-219",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What happens during an aortic dissection?",
    choices: [
      "Blood enters a tear in the aortic wall and separates its layers",
      "The ventricles stop generating any electrical activity",
      "The coronary arteries permanently dilate",
      "Fluid enters the alveoli because of infection",
    ],
    answerIndex: 0,
    explanation:
      "An aortic dissection begins with a tear in the aortic wall that allows blood to track between layers of the vessel wall. It is a life-threatening emergency.",
  },

  {
    id: "cardiology-220",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which condition is a major risk factor for aortic dissection?",
    choices: [
      "Long-standing or uncontrolled hypertension",
      "Occasional mild motion sickness",
      "Low dietary sodium intake",
      "A normal resting heart rate",
    ],
    answerIndex: 0,
    explanation:
      "Chronic hypertension places substantial stress on the aortic wall and is an important risk factor for aortic dissection.",
  },

  {
    id: "cardiology-221",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which presentation is particularly concerning for an acute aortic dissection?",
    choices: [
      "Sudden severe chest or back pain, sometimes described as tearing or ripping",
      "Gradual mild chest discomfort only after eating",
      "Chronic ankle swelling without pain",
      "Brief dizziness after standing with no other symptoms",
    ],
    answerIndex: 0,
    explanation:
      "Aortic dissection often presents with abrupt, severe chest or back pain. The pain may be described as tearing, ripping, or migrating, although presentations can vary.",
  },

  // ============================================================
  // NITROGLYCERIN / ASPIRIN
  // ============================================================

  {
    id: "cardiology-222",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What is the primary cardiovascular effect of nitroglycerin?",
    choices: [
      "It promotes vascular smooth-muscle relaxation and vasodilation",
      "It directly increases blood clot formation",
      "It causes widespread vasoconstriction",
      "It permanently increases the heart rate",
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin is a vasodilator. It reduces cardiac workload and myocardial oxygen demand and can improve coronary blood flow. Its hemodynamic effects can also lower blood pressure.",
  },

  {
    id: "cardiology-223",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which patient factor would make administration of nitroglycerin potentially unsafe?",
    choices: [
      "Significant hypotension",
      "A normal blood pressure",
      "A history of prescribed nitroglycerin use",
      "Mild anxiety accompanying chest discomfort",
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin can lower blood pressure and may be contraindicated in hypotension. Recent use of phosphodiesterase-5 inhibitors is another important contraindication or precaution. Follow local protocol and medical direction.",
  },

  {
    id: "cardiology-224",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient with chest pain has a blood pressure of 88/54 mmHg. Why should the EMT be concerned about administering nitroglycerin?",
    choices: [
      "Nitroglycerin can further lower blood pressure",
      "Nitroglycerin always causes severe hypertension",
      "Nitroglycerin prevents oxygen from entering the lungs",
      "Nitroglycerin causes ventricular fibrillation in every patient",
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin causes vasodilation and can reduce blood pressure. It should generally be withheld in hypotensive patients when contraindicated by protocol.",
  },

  {
    id: "cardiology-225",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Why is aspirin commonly administered to an appropriate patient with suspected acute coronary syndrome?",
    choices: [
      "It inhibits platelet aggregation and can reduce further clot formation",
      "It directly dissolves every coronary clot immediately",
      "It increases blood pressure by causing vasoconstriction",
      "It acts as a bronchodilator",
    ],
    answerIndex: 0,
    explanation:
      "Aspirin inhibits platelet aggregation, reducing the tendency for thrombus growth. It is commonly used early in suspected ACS when no contraindication exists.",
  },

  {
    id: "cardiology-226",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient with suspected ACS is alert and has no known aspirin allergy or other contraindication. Which medication may the EMT administer according to protocol?",
    choices: [
      "Aspirin",
      "Insulin",
      "Furosemide in every case",
      "An antibiotic",
    ],
    answerIndex: 0,
    explanation:
      "Chewable aspirin is commonly indicated for suspected ACS when the patient meets protocol criteria and has no contraindications.",
  },

  // ============================================================
  // CLINICAL APPLICATION
  // ============================================================

  {
    id: "cardiology-227",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A 63-year-old patient has a pulse of 140/min, an irregular rhythm, respirations of 28/min, blood pressure of 90/50 mmHg, and chest pain. Which finding most directly explains why nitroglycerin is unsafe?",
    choices: [
      "The patient's blood pressure is too low",
      "The patient is tachycardic",
      "The patient has chest pain",
      "The patient is breathing 28 times/min",
    ],
    answerIndex: 0,
    explanation:
      "The patient's hypotension is the key concern because nitroglycerin can further reduce blood pressure.",
  },

  {
    id: "cardiology-228",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An ambulance is transporting a patient with chest pain when the patient suddenly becomes unresponsive and pulseless. What should the crew do first?",
    choices: [
      "Have the driver stop the ambulance so resuscitation can begin safely",
      "Continue driving while waiting for the patient to wake up",
      "Give the patient nitroglycerin",
      "Obtain a 12-lead ECG before beginning CPR",
    ],
    answerIndex: 0,
    explanation:
      "A pulseless patient requires immediate resuscitation. Stopping the vehicle allows the crew to perform CPR and use the AED safely and effectively.",
  },

  {
    id: "cardiology-229",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A 50-year-old patient develops sudden crushing chest discomfort radiating into the left arm with nausea and heavy diaphoresis. What should you suspect?",
    choices: [
      "Acute coronary syndrome",
      "Simple muscle fatigue",
      "Isolated dehydration",
      "Uncomplicated anxiety without further assessment",
    ],
    answerIndex: 0,
    explanation:
      "Sudden pressure-like chest discomfort with radiation, nausea, and diaphoresis is concerning for ACS. Exercise or other circumstances should not be used to dismiss potentially serious cardiac symptoms.",
  },

  {
    id: "cardiology-230",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which cardiac rhythm is a major cause of sudden cardiac death and is treated with defibrillation when the patient is pulseless?",
    choices: [
      "Ventricular fibrillation",
      "Sinus bradycardia",
      "First-degree AV block",
      "Stable sinus tachycardia",
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation is a lethal shockable rhythm. Rapid CPR and defibrillation are essential when it occurs in cardiac arrest.",
  },

  {
    id: "cardiology-231",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with shortness of breath has JVD, bilateral crackles, and swelling of both lower legs. What underlying problem could explain these findings?",
    choices: [
      "Heart failure with impaired cardiac function and systemic/pulmonary congestion",
      "An isolated finger injury",
      "Simple hyperventilation with no cardiovascular involvement",
      "A minor allergic reaction",
    ],
    answerIndex: 0,
    explanation:
      "JVD and peripheral edema indicate systemic venous congestion, while bilateral crackles suggest pulmonary congestion. Together these findings can indicate significant heart failure.",
  },

  // ============================================================
  // REVERSE QUESTIONS
  // The answer/concept becomes the basis of the question.
  // ============================================================

  {
    id: "cardiology-232",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which two interventions are especially important early in cardiac arrest because they can directly improve survival when performed promptly?",
    choices: [
      "CPR and defibrillation when indicated",
      "Oral fluids and patient ambulation",
      "Nitroglycerin and aspirin during pulselessness",
      "History-taking and transport preparation",
    ],
    answerIndex: 0,
    explanation:
      "High-quality CPR maintains circulation while defibrillation can terminate a shockable rhythm.",
  },

  {
    id: "cardiology-233",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What structure divides the heart into its left and right sides?",
    choices: [
      "Septum",
      "Aorta",
      "Pericardium",
      "Vena cava",
    ],
    answerIndex: 0,
    explanation:
      "The septum separates the left and right sides of the heart.",
  },

  {
    id: "cardiology-234",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which cardiac structure normally acts as the heart's primary pacemaker?",
    choices: [
      "SA node",
      "AV node",
      "Bundle of His",
      "Purkinje network",
    ],
    answerIndex: 0,
    explanation:
      "The sinoatrial node normally initiates the electrical impulse that starts each heartbeat.",
  },

  {
    id: "cardiology-235",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What term describes the spontaneous generation of electrical impulses by specialized cardiac cells?",
    choices: [
      "Automaticity",
      "Ischemia",
      "Occlusion",
      "Perfusion",
    ],
    answerIndex: 0,
    explanation:
      "Automaticity is the ability of certain cardiac cells to generate impulses without requiring an external stimulus.",
  },

  {
    id: "cardiology-236",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What term describes inadequate oxygenated blood flow to the myocardium?",
    choices: [
      "Myocardial ischemia",
      "Aortic aneurysm",
      "Cardiac tamponade",
      "Ventricular fibrillation",
    ],
    answerIndex: 0,
    explanation:
      "Myocardial ischemia occurs when coronary oxygen supply is insufficient for myocardial demand.",
  },

  {
    id: "cardiology-237",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What condition results from prolonged interruption of coronary blood flow that causes myocardial tissue death?",
    choices: [
      "Acute myocardial infarction",
      "Stable angina",
      "Sinus bradycardia",
      "Pericardial effusion",
    ],
    answerIndex: 0,
    explanation:
      "An acute myocardial infarction results from prolonged ischemia that causes myocardial injury and cell death.",
  },

  {
    id: "cardiology-238",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What condition is characterized by an abnormal accumulation of fluid in the pericardial space?",
    choices: [
      "Pericardial effusion",
      "Pulmonary edema",
      "Atherosclerosis",
      "Aortic dissection",
    ],
    answerIndex: 0,
    explanation:
      "Pericardial effusion is fluid accumulation within the pericardial space.",
  },

  {
    id: "cardiology-239",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What condition occurs when pressure from fluid or blood around the heart prevents adequate cardiac filling?",
    choices: [
      "Cardiac tamponade",
      "Stable angina",
      "Ventricular tachycardia",
      "Atherosclerosis",
    ],
    answerIndex: 0,
    explanation:
      "Cardiac tamponade occurs when increased pericardial pressure interferes with cardiac filling and reduces cardiac output.",
  },

  {
    id: "cardiology-240",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which classic group of findings is associated with cardiac tamponade?",
    choices: [
      "JVD, muffled heart sounds, and hypotension",
      "Hypertension, wheezing, and fever",
      "Bradycardia, dry skin, and hypertension",
      "Crackles, bounding pulses, and fever",
    ],
    answerIndex: 0,
    explanation:
      "Beck's triad is hypotension, muffled heart sounds, and JVD, although all three findings may not be present.",
  },

  {
    id: "cardiology-241",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which vessels return systemic venous blood to the right atrium?",
    choices: [
      "Superior and inferior venae cavae",
      "Pulmonary arteries",
      "Coronary arteries",
      "Pulmonary veins",
    ],
    answerIndex: 0,
    explanation:
      "The superior and inferior venae cavae return systemic venous blood to the right atrium.",
  },

  {
    id: "cardiology-242",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which chamber ejects oxygenated blood into the aorta?",
    choices: [
      "Left ventricle",
      "Right ventricle",
      "Left atrium",
      "Right atrium",
    ],
    answerIndex: 0,
    explanation:
      "The left ventricle pumps oxygenated blood through the aortic valve into the aorta.",
  },

  {
    id: "cardiology-243",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What term describes the highest arterial pressure reached during ventricular contraction?",
    choices: [
      "Systolic pressure",
      "Diastolic pressure",
      "Central venous pressure",
      "Pulmonary wedge pressure",
    ],
    answerIndex: 0,
    explanation:
      "Systolic pressure is the peak arterial pressure generated during ventricular systole.",
  },

  {
    id: "cardiology-244",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What term describes a complete blockage within a blood vessel?",
    choices: [
      "Occlusion",
      "Dilation",
      "Automaticity",
      "Perfusion",
    ],
    answerIndex: 0,
    explanation:
      "An occlusion is a blockage that prevents or substantially restricts blood flow through a vessel.",
  },

  {
    id: "cardiology-245",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What term describes a clot or portion of a clot that travels through the bloodstream and eventually obstructs a smaller vessel?",
    choices: [
      "Thromboembolism",
      "Aneurysm",
      "Tamponade",
      "Ischemia",
    ],
    answerIndex: 0,
    explanation:
      "A thromboembolism occurs when thrombotic material travels through the circulation and obstructs another vessel.",
  },

  {
    id: "cardiology-246",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which rhythm is characterized by chaotic ventricular electrical activity and ineffective ventricular contraction?",
    choices: [
      "Ventricular fibrillation",
      "Sinus rhythm",
      "Sinus bradycardia",
      "First-degree AV block",
    ],
    answerIndex: 0,
    explanation:
      "Ventricular fibrillation produces chaotic electrical activity and no effective ventricular contraction, resulting in cardiac arrest.",
  },

  {
    id: "cardiology-247",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which rhythm is generally considered a rapid ventricular rhythm and may be either pulsed or pulseless?",
    choices: [
      "Ventricular tachycardia",
      "Asystole",
      "Sinus bradycardia",
      "Atrial standstill",
    ],
    answerIndex: 0,
    explanation:
      "Ventricular tachycardia originates in the ventricles and can produce either a pulse or cardiac arrest depending on its effect on cardiac output.",
  },

  {
    id: "cardiology-248",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which condition involves inadequate cardiac pumping that can result in pulmonary and systemic fluid congestion?",
    choices: [
      "Heart failure",
      "Stable angina",
      "Aortic aneurysm",
      "Sinus tachycardia",
    ],
    answerIndex: 0,
    explanation:
      "Heart failure occurs when cardiac function is inadequate to meet the body's demands and can result in congestion.",
  },

  {
    id: "cardiology-249",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What condition is characterized by abnormal dilation or weakening of a portion of the aortic wall?",
    choices: [
      "Aortic aneurysm",
      "Cardiac tamponade",
      "Myocardial infarction",
      "Ventricular fibrillation",
    ],
    answerIndex: 0,
    explanation:
      "An aortic aneurysm is an abnormal enlargement or weakening of part of the aorta.",
  },

  {
    id: "cardiology-250",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What vascular emergency occurs when blood enters a tear in the aortic wall and separates its layers?",
    choices: [
      "Aortic dissection",
      "Stable angina",
      "Cardiogenic shock",
      "Pericardial effusion",
    ],
    answerIndex: 0,
    explanation:
      "An aortic dissection occurs when blood tracks between layers of the aortic wall after an intimal tear.",
  },

  {
    id: "cardiology-251",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which medication inhibits platelet aggregation and is commonly used early in suspected ACS when appropriate?",
    choices: [
      "Aspirin",
      "Nitroglycerin",
      "Furosemide",
      "Epinephrine",
    ],
    answerIndex: 0,
    explanation:
      "Aspirin inhibits platelet aggregation and is commonly given in suspected ACS when the patient has no contraindication.",
  },

  {
    id: "cardiology-252",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which medication is a vasodilator commonly used for appropriate patients experiencing ischemic chest discomfort?",
    choices: [
      "Nitroglycerin",
      "Aspirin",
      "Glucose",
      "Naloxone",
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin causes vascular smooth-muscle relaxation and can reduce myocardial oxygen demand and relieve ischemic chest discomfort in appropriate patients.",
  },

  {
    id: "cardiology-253",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which noninvasive respiratory support method can be particularly useful for an appropriately selected patient with cardiogenic pulmonary edema?",
    choices: [
      "CPAP",
      "Oral fluids",
      "A blind finger sweep",
      "A nasal airway in every case",
    ],
    answerIndex: 0,
    explanation:
      "CPAP can improve oxygenation and decrease the work of breathing in selected patients with cardiogenic pulmonary edema.",
  },

  {
    id: "cardiology-254",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What should an EMT do while waiting for an AED to arrive at a cardiac arrest?",
    choices: [
      "Perform high-quality CPR",
      "Wait without touching the patient",
      "Give oral medication",
      "Place the patient in a sitting position",
    ],
    answerIndex: 0,
    explanation:
      "CPR should begin immediately when indicated and continue until the AED is ready to analyze the rhythm.",
  },

  {
    id: "cardiology-255",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which cardiac arrest rhythms are classified as non-shockable by an AED?",
    choices: [
      "Asystole and pulseless electrical activity",
      "Ventricular fibrillation and pulseless ventricular tachycardia",
      "Atrial fibrillation and sinus tachycardia",
      "Sinus bradycardia and sinus tachycardia",
    ],
    answerIndex: 0,
    explanation:
      "Asystole and PEA are non-shockable rhythms. Treatment centers on high-quality CPR, identifying reversible causes, and following the appropriate resuscitation algorithm.",
  },

  {
    id: "cardiology-256",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What condition is suggested by a patient with dyspnea, JVD, peripheral edema, and bilateral pulmonary crackles?",
    choices: [
      "Heart failure with both systemic and pulmonary congestion",
      "Isolated stable angina",
      "Uncomplicated sinus bradycardia",
      "Aortic aneurysm without complications",
    ],
    answerIndex: 0,
    explanation:
      "JVD and edema indicate systemic venous congestion, while crackles suggest pulmonary congestion. Together they are strongly concerning for heart failure.",
  },

  // ============================================================
  // ADDITIONAL REVERSE CLINICAL QUESTIONS
  // ============================================================

  {
    id: "cardiology-257",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient has sudden severe chest or upper-back pain and appears critically ill. Which diagnosis should be considered because it involves separation of the aortic wall layers?",
    choices: [
      "Aortic dissection",
      "Stable angina",
      "Sinus tachycardia",
      "Pericardial effusion",
    ],
    answerIndex: 0,
    explanation:
      "Aortic dissection occurs when blood enters a tear in the aortic wall and separates its layers.",
  },

  {
    id: "cardiology-258",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient has cool clammy skin, hypotension, pulmonary crackles, chest discomfort, and evidence of inadequate perfusion. Which form of shock should be considered?",
    choices: [
      "Cardiogenic shock",
      "Neurogenic shock",
      "Simple anxiety",
      "Heat exhaustion without cardiovascular compromise",
    ],
    answerIndex: 0,
    explanation:
      "Cardiogenic shock results from inadequate cardiac pumping and can produce hypotension, poor perfusion, and pulmonary congestion.",
  },

  {
    id: "cardiology-259",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient experiences predictable pressure-like chest discomfort during exertion that resolves after resting. Which condition best fits this pattern?",
    choices: [
      "Stable angina",
      "Cardiac tamponade",
      "Ventricular fibrillation",
      "Aortic dissection",
    ],
    answerIndex: 0,
    explanation:
      "Stable angina generally follows a predictable pattern with exertion or stress and improves with rest or prescribed treatment.",
  },

  {
    id: "medical-152",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient reports that she suddenly lost consciousness for several seconds and then woke up without confusion. Which finding best describes this event?",
    choices: [
      "Syncope",
      "Seizure",
      "Stroke",
      "Hypoglycemia"
    ],
    answerIndex: 0,
    explanation:
      "Syncope is a brief loss of consciousness caused by temporary cerebral hypoperfusion, typically followed by spontaneous recovery. A generalized seizure commonly has motor activity and a postictal period."
  },

  {
    id: "medical-153",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "As part of a stroke assessment, you ask a patient to extend both arms straight ahead with the palms facing upward and then close their eyes. What are you evaluating?",
    choices: [
      "Arm drift",
      "Grip strength",
      "Coordination",
      "Pupil response"
    ],
    answerIndex: 0,
    explanation:
      "The arm-drift test can reveal unilateral weakness associated with a stroke. The patient holds both arms out with palms up and closes the eyes."
  },

  {
    id: "medical-154",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient has new garbled speech but otherwise appears alert. Which assessment is most appropriate for evaluating abnormal speech?",
    choices: [
      "Have the patient repeat a simple, familiar phrase",
      "Ask the patient to close both eyes",
      "Have the patient squeeze your fingers",
      "Ask the patient to take several deep breaths"
    ],
    answerIndex: 0,
    explanation:
      "Having the patient repeat a familiar phrase can reveal slurred or abnormal speech and is part of a rapid stroke assessment."
  },

  {
    id: "medical-155",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "During a rapid neurologic examination, which instruction is most useful for evaluating facial symmetry?",
    choices: [
      "Smile and show your teeth",
      "Close your eyes tightly",
      "Turn your head from side to side",
      "Open your mouth and take a deep breath"
    ],
    answerIndex: 0,
    explanation:
      "Asking the patient to smile or show their teeth allows you to compare movement on both sides of the face and identify facial droop."
  },

  {
    id: "medical-156",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A diabetic older adult has blurred vision, weak hand grips, and difficulty identifying the day of the week. Which additional finding should you specifically check for as part of a stroke screen?",
    choices: [
      "Facial asymmetry",
      "Bilateral pedal edema",
      "Abdominal distention",
      "Jugular venous distention"
    ],
    answerIndex: 0,
    explanation:
      "Facial droop is one of the major findings assessed during a rapid stroke evaluation. Other causes of altered mental status, especially abnormal glucose, should also be considered."
  },

  {
    id: "medical-157",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An alert patient suddenly develops a severe headache and weakness affecting the left arm. Which condition should be considered immediately?",
    choices: [
      "Stroke",
      "Gastroenteritis",
      "Kidney stone",
      "Anemia"
    ],
    answerIndex: 0,
    explanation:
      "Sudden neurologic deficits such as unilateral weakness are concerning for stroke and require rapid assessment and transport."
  },

  {
    id: "medical-158",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient experienced slurred speech and unilateral arm weakness that completely resolved before EMS arrived. Which condition best fits this history?",
    choices: [
      "Transient ischemic attack",
      "Generalized seizure",
      "Anaphylaxis",
      "Hyperglycemia"
    ],
    answerIndex: 0,
    explanation:
      "A transient ischemic attack produces temporary neurologic dysfunction caused by cerebral ischemia without persistent deficits. A resolved episode still requires urgent evaluation."
  },

  {
    id: "medical-159",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which description is most characteristic of a transient ischemic attack?",
    choices: [
      "Neurologic deficits that resolve",
      "Permanent paralysis after trauma",
      "Loss of consciousness lasting several hours",
      "Continuous generalized seizure activity"
    ],
    answerIndex: 0,
    explanation:
      "A TIA causes temporary focal neurologic dysfunction that resolves. It is an important warning sign for a possible future stroke."
  },

  {
    id: "medical-160",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which finding would most strongly support the possibility of a stroke during a rapid Cincinnati-style assessment?",
    choices: [
      "One arm drifts downward",
      "Both pupils constrict normally",
      "The patient has equal hand grips",
      "The patient reports thirst"
    ],
    answerIndex: 0,
    explanation:
      "Unilateral arm drift is one of the classic findings assessed for possible stroke. Facial droop and abnormal speech are also important findings."
  },

  {
    id: "medical-161",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An elderly patient suddenly develops right-sided weakness and difficulty speaking. His oxygen saturation is normal. Which additional bedside measurement should you obtain promptly?",
    choices: [
      "Blood glucose level",
      "Peak expiratory flow",
      "Urine output",
      "Body mass index"
    ],
    answerIndex: 0,
    explanation:
      "Hypoglycemia can mimic stroke, so blood glucose should be checked promptly in a patient with altered neurologic function."
  },

  // ============================================================================
  // CARDIOLOGY / SHOCK
  // ============================================================================

  {
    id: "cardiology-260",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient who recently underwent dialysis has severe bleeding from the vascular access site. How should you classify this problem?",
    choices: [
      "A potentially life-threatening hemorrhage requiring immediate control",
      "A minor wound that can wait until arrival at the hospital",
      "A normal finding after dialysis",
      "A problem requiring oral glucose"
    ],
    answerIndex: 0,
    explanation:
      "Bleeding from a dialysis access site can become rapidly life-threatening. Immediate hemorrhage control and rapid transport are priorities."
  },

  {
    id: "cardiology-261",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which cardiovascular effect is primarily produced by epinephrine's alpha-adrenergic activity?",
    choices: [
      "Peripheral vasoconstriction",
      "Severe peripheral vasodilation",
      "Complete suppression of cardiac activity",
      "Decreased vascular tone"
    ],
    answerIndex: 0,
    explanation:
      "Alpha-adrenergic stimulation by epinephrine causes vasoconstriction, increasing vascular resistance and helping support blood pressure during severe anaphylaxis."
  },

  {
    id: "cardiology-262",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient has profound hypotension, tachycardia, pale cool skin, and suspected internal blood loss. Which type of shock is most consistent with these findings?",
    choices: [
      "Hypovolemic shock",
      "Neurogenic shock",
      "Psychogenic shock",
      "Obstructive shock"
    ],
    answerIndex: 0,
    explanation:
      "Loss of circulating blood volume can produce hypovolemic shock, characterized by findings such as tachycardia, hypotension, and poor peripheral perfusion."
  },

  // ============================================================================
  // RESPIRATORY / AIRWAY
  // ============================================================================

  {
    id: "airway-086",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient develops coughing, eye irritation, and difficulty breathing immediately after mixing cleaning chemicals in a poorly ventilated bathroom. What should you do first?",
    choices: [
      "Move the patient into a safe, well-ventilated area",
      "Have the patient continue cleaning the room",
      "Give the patient something to drink",
      "Place the patient back into the contaminated area"
    ],
    answerIndex: 0,
    explanation:
      "The first priority is to remove the patient from the hazardous environment without exposing yourself or your partner. Further assessment and treatment can then occur in a safe area."
  },

  {
    id: "airway-087",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with a neurologic emergency is drooling and has gurgling respirations. What intervention should take priority?",
    choices: [
      "Suction the airway",
      "Give oral glucose",
      "Obtain a blood pressure before intervening",
      "Place the patient in a standing position"
    ],
    answerIndex: 0,
    explanation:
      "Gurgling respirations indicate fluid or secretions in the airway. Suctioning should be performed promptly to maintain airway patency."
  },

  {
    id: "airway-088",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient was submerged underwater and is now unconscious with a pulse but only agonal respirations. What is the most appropriate immediate respiratory intervention?",
    choices: [
      "Provide ventilations with a BVM",
      "Wait for spontaneous breathing to return",
      "Give oral glucose",
      "Have the patient walk around"
    ],
    answerIndex: 0,
    explanation:
      "An unconscious drowning patient with a pulse but inadequate or agonal breathing requires assisted ventilations. A BVM with appropriate oxygen should be used."
  },

  // ============================================================================
  // ALLERGIC / TOXICOLOGIC
  // ============================================================================

  {
    id: "medical-162",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "At an outdoor event on a hot day, a patient suddenly develops wheezing, widespread hives, pallor, and difficulty breathing after an insect sting. What condition should you suspect?",
    choices: [
      "Anaphylaxis",
      "Simple heat exhaustion",
      "Hypoglycemia",
      "Migraine"
    ],
    answerIndex: 0,
    explanation:
      "Wheezing and widespread urticaria following an exposure strongly suggest anaphylaxis. Respiratory or cardiovascular involvement makes this a medical emergency."
  },

  {
    id: "medical-163",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient develops tongue swelling, hives, wheezing, tachycardia, and hypotension after eating. Which medication should an EMT expect to administer according to protocol?",
    choices: [
      "IM epinephrine",
      "Oral glucose",
      "Aspirin",
      "Activated charcoal"
    ],
    answerIndex: 0,
    explanation:
      "IM epinephrine is the first-line medication for anaphylaxis. Hypotension, airway swelling, and wheezing indicate severe systemic allergic reaction."
  },

  {
    id: "medical-164",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient receives epinephrine for severe anaphylaxis. Which vascular effect helps restore blood pressure?",
    choices: [
      "Vasoconstriction",
      "Massive venodilation",
      "Reduced vascular resistance",
      "Complete loss of sympathetic tone"
    ],
    answerIndex: 0,
    explanation:
      "Epinephrine activates alpha receptors and produces vasoconstriction, helping increase vascular resistance and blood pressure."
  },

  {
    id: "medical-165",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A farm worker develops excessive salivation, difficulty breathing, and lightheadedness after pesticide exposure. Which medication is commonly associated with treating the cholinergic effects of organophosphate poisoning?",
    choices: [
      "Atropine",
      "Insulin",
      "Epinephrine only",
      "Nitroglycerin"
    ],
    answerIndex: 0,
    explanation:
      "Organophosphate poisoning can produce excessive acetylcholine activity with findings such as salivation and respiratory difficulty. Atropine blocks muscarinic effects and is used in treatment."
  },

  {
    id: "medical-166",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A chemical powder containing a strong alkaline substance has spilled onto a worker's clothing and skin. What should be done before beginning decontamination of the affected area?",
    choices: [
      "Remove or brush away dry chemical when appropriate before irrigation",
      "Apply an ointment immediately",
      "Cover the chemical with a wet towel",
      "Have the patient rub the chemical into the skin"
    ],
    answerIndex: 0,
    explanation:
      "Dry caustic chemicals should be carefully removed from the patient and clothing before copious irrigation when appropriate. Avoid contaminating yourself or spreading the substance."
  },

  {
    id: "medical-167",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A vehicle battery ruptures and electrolyte contacts a patient's face. The patient denies respiratory distress. What treatment should begin for chemical exposure to the eyes?",
    choices: [
      "Immediately irrigate the eyes with clean water",
      "Patch both eyes and wait for transport",
      "Apply an ice pack directly to the eyes",
      "Give the patient oral glucose"
    ],
    answerIndex: 0,
    explanation:
      "Chemical eye exposures require immediate, continuous irrigation with clean water or appropriate irrigation fluid. Do not delay irrigation while waiting for transport."
  },

  {
    id: "medical-168",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient is unconscious after intentionally ingesting a large amount of a sedative medication several hours earlier. Which general treatment is appropriate when the patient is hypoxic or breathing inadequately?",
    choices: [
      "Support the airway and provide oxygen or ventilations as indicated",
      "Give oral glucose immediately",
      "Force the patient to drink water",
      "Induce vomiting"
    ],
    answerIndex: 0,
    explanation:
      "In a poisoning or overdose, airway, breathing, and circulation remain the immediate priorities. Oxygen is appropriate for hypoxia, while inadequate breathing requires ventilatory support."
  },

  // ============================================================================
  // GLUCOSE / ENDOCRINE
  // ============================================================================

  {
    id: "medical-169",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A family member reports that a diabetic patient's blood glucose measurement was 57 mg/dL. How should this value be interpreted?",
    choices: [
      "Hypoglycemia",
      "Hyperglycemia",
      "Normal blood glucose",
      "Severe hypernatremia"
    ],
    answerIndex: 0,
    explanation:
      "A glucose value of 57 mg/dL is below the normal range and represents hypoglycemia."
  },

  {
    id: "medical-170",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What does the term hyperglycemia mean?",
    choices: [
      "An abnormally elevated blood glucose level",
      "An abnormally low blood glucose level",
      "Low blood oxygen",
      "Excessive blood loss"
    ],
    answerIndex: 0,
    explanation:
      "Hyperglycemia means that the concentration of glucose in the blood is abnormally high."
  },

  {
    id: "medical-171",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which hormone helps move glucose from the bloodstream into body cells?",
    choices: [
      "Insulin",
      "Epinephrine",
      "Atropine",
      "Histamine"
    ],
    answerIndex: 0,
    explanation:
      "Insulin promotes cellular uptake and utilization of glucose, lowering blood glucose levels."
  },

  {
    id: "medical-172",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which finding is commonly associated with hypoglycemia?",
    choices: [
      "Cool, clammy skin",
      "Hot, dry skin",
      "Slow bounding pulse with hypertension",
      "Isolated unilateral leg swelling"
    ],
    answerIndex: 0,
    explanation:
      "Hypoglycemia commonly causes sympathetic activation, producing findings such as sweating, cool clammy skin, tachycardia, anxiety, and altered mental status."
  },

  {
    id: "medical-173",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which patient would generally be inappropriate for administration of oral glucose?",
    choices: [
      "An unconscious patient who cannot protect their airway",
      "An alert diabetic patient who can swallow",
      "A conscious patient with suspected hypoglycemia",
      "A patient who can follow commands and swallow normally"
    ],
    answerIndex: 0,
    explanation:
      "Oral glucose should not be given to a patient who cannot protect the airway because of the risk of aspiration."
  },

  {
    id: "medical-174",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A diabetic patient is unconscious and breathing deeply after developing diabetic ketoacidosis. Which metabolic problem is most likely present?",
    choices: [
      "Hyperglycemia",
      "Hypoglycemia",
      "Hypothermia",
      "Anaphylaxis"
    ],
    answerIndex: 0,
    explanation:
      "DKA is associated with significant hyperglycemia and metabolic acidosis. Deep, rapid respirations can occur as the body attempts to compensate for the acidosis."
  },

  // ============================================================================
  // GI
  // ============================================================================

  {
    id: "medical-175",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An older patient reports abdominal discomfort, vomiting, poor appetite, and several episodes of black, tar-like stool. What condition should be suspected?",
    choices: [
      "Upper gastrointestinal bleeding",
      "Kidney stone",
      "Appendicitis",
      "Migraine"
    ],
    answerIndex: 0,
    explanation:
      "Black, tarry stool, or melena, is strongly associated with bleeding in the upper gastrointestinal tract."
  },

  {
    id: "medical-176",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which finding would be concerning for gastrointestinal hemorrhage?",
    choices: [
      "Blood coming from the rectum",
      "Clear urine",
      "Normal skin temperature",
      "A mild sore throat"
    ],
    answerIndex: 0,
    explanation:
      "Visible blood from the rectum can indicate gastrointestinal bleeding. The appearance of the blood can help suggest the location and severity of the bleeding."
  },

  {
    id: "medical-177",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with abdominal pain begins vomiting large amounts of bright-red blood. What should be your immediate treatment priority?",
    choices: [
      "Protect and manage the airway",
      "Give oral glucose",
      "Have the patient walk",
      "Apply a cold pack to the abdomen"
    ],
    answerIndex: 0,
    explanation:
      "Large-volume hematemesis creates a significant aspiration risk. Airway protection and management take priority while the patient is rapidly transported."
  },

  {
    id: "medical-178",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient reports upper abdominal pain that tends to improve temporarily after eating. Which condition is most consistent with this presentation?",
    choices: [
      "Peptic ulcer disease",
      "Appendicitis",
      "Kidney stone",
      "Heat stroke"
    ],
    answerIndex: 0,
    explanation:
      "Epigastric discomfort associated with meals can occur with peptic ulcer disease, although the exact relationship between food and pain varies by ulcer location."
  },

  {
    id: "medical-179",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient develops abdominal pain that initially began near the umbilicus and later localized to the right lower quadrant. What condition should you suspect?",
    choices: [
      "Appendicitis",
      "Migraine",
      "Pneumonia",
      "Kidney failure"
    ],
    answerIndex: 0,
    explanation:
      "Pain that begins near the umbilicus and migrates toward the right lower quadrant is a classic presentation of appendicitis."
  },

  {
    id: "medical-180",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A febrile patient develops worsening right lower abdominal pain with increasing tenderness and signs of shock. Which complication should concern you?",
    choices: [
      "Ruptured appendix",
      "Simple migraine",
      "Uncomplicated kidney stone",
      "Mild anemia"
    ],
    answerIndex: 0,
    explanation:
      "Severe abdominal pain, fever, tenderness, and shock can occur with a ruptured appendix and resulting intra-abdominal infection."
  },

  {
    id: "medical-181",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Where is pain classically located when appendicitis has progressed to its typical localized presentation?",
    choices: [
      "Right lower quadrant",
      "Left upper quadrant",
      "Right shoulder only",
      "Lower back only"
    ],
    answerIndex: 0,
    explanation:
      "Appendicitis commonly progresses to localized right lower quadrant abdominal pain."
  },

  {
    id: "medical-182",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient reports severe abdominal pain that radiates directly into the back. Which immediately life-threatening condition should be considered?",
    choices: [
      "Abdominal aortic aneurysm",
      "Migraine",
      "Anemia",
      "Simple allergic reaction"
    ],
    answerIndex: 0,
    explanation:
      "An abdominal aortic aneurysm can produce severe abdominal or back pain and may rapidly progress to life-threatening hemorrhagic shock if it ruptures."
  },

  // ============================================================================
  // RENAL
  // ============================================================================

  {
    id: "medical-183",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient has severe flank pain that radiates toward the groin and is unable to find a comfortable position. Which condition is most likely?",
    choices: [
      "Renal calculus",
      "Stroke",
      "Pneumonia",
      "Hypoglycemia"
    ],
    answerIndex: 0,
    explanation:
      "Kidney stones commonly produce severe colicky flank pain that can radiate toward the groin and cause marked restlessness."
  },

  {
    id: "medical-184",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Flank pain accompanied by painful urination and marked diaphoresis, without fever, is most suggestive of what condition?",
    choices: [
      "Kidney stone",
      "Migraine",
      "Heat stroke",
      "Anaphylaxis"
    ],
    answerIndex: 0,
    explanation:
      "Severe flank pain with urinary symptoms and restlessness or diaphoresis is consistent with renal colic from a kidney stone."
  },

  // ============================================================================
  // SEIZURES
  // ============================================================================

  {
    id: "medical-185",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient suddenly develops a metallic taste and reports that this has happened shortly before previous seizures. What should you consider?",
    choices: [
      "A seizure may be about to occur",
      "The patient definitely has appendicitis",
      "The patient is experiencing heat stroke",
      "The patient has a kidney stone"
    ],
    answerIndex: 0,
    explanation:
      "An unusual taste can be an aura or focal seizure symptom that precedes a generalized seizure in some patients."
  },

  {
    id: "medical-186",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "During a generalized tonic-clonic seizure, the patient is experiencing violent involuntary movements. What is the EMT's priority?",
    choices: [
      "Protect the patient from injury",
      "Force the patient's mouth open",
      "Hold the patient's limbs still",
      "Give oral medication"
    ],
    answerIndex: 0,
    explanation:
      "During the convulsive phase, protect the patient from environmental hazards and injury. Do not restrain the patient or place objects in the mouth."
  },

  {
    id: "medical-187",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An unresponsive patient has rhythmic, forceful jerking of both arms and legs. Which seizure phase does this most closely represent?",
    choices: [
      "Clonic phase",
      "Postictal phase",
      "Recovery phase",
      "Prodromal phase"
    ],
    answerIndex: 0,
    explanation:
      "The clonic phase is characterized by rhythmic muscle contractions and relaxation. The tonic phase is dominated by sustained muscle rigidity."
  },

  {
    id: "medical-188",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "After a generalized seizure ends, a patient remains drowsy and has adequate but slow respirations. What is an appropriate priority?",
    choices: [
      "Maintain the airway and provide oxygen as indicated",
      "Force the patient to stand",
      "Give oral glucose regardless of blood glucose",
      "Restrain the patient"
    ],
    answerIndex: 0,
    explanation:
      "The postictal patient may have impaired airway protection or inadequate oxygenation. Airway management, positioning, oxygen when indicated, and continued assessment are priorities."
  },

  // ============================================================================
  // BEHAVIORAL / PSYCHIATRIC
  // ============================================================================

  {
    id: "ops-331",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Law enforcement is already present when EMS arrives for a behavioral emergency. Before approaching the patient, what should you prioritize?",
    choices: [
      "Confirm that the scene is safe for EMS personnel",
      "Immediately restrain the patient",
      "Ignore law enforcement instructions",
      "Enter the scene alone"
    ],
    answerIndex: 0,
    explanation:
      "Scene safety is the first priority. EMS should coordinate with law enforcement and should not enter an unsafe environment."
  },

  {
    id: "ops-332",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "A behavioral emergency patient is becoming increasingly agitated. Which approach is generally most appropriate?",
    choices: [
      "Remain calm, establish rapport, and assess for medical causes",
      "Immediately threaten the patient",
      "Argue with the patient's beliefs",
      "Ignore the patient completely"
    ],
    answerIndex: 0,
    explanation:
      "Calm communication and a nonconfrontational approach can reduce agitation. Medical causes of altered behavior must also be considered."
  },

  {
    id: "medical-189",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A teenager tells you, 'I don't know if I can keep going like this.' What should you do next?",
    choices: [
      "Directly ask whether the patient is thinking about suicide",
      "Change the subject",
      "Tell the patient to calm down",
      "Leave the patient alone"
    ],
    answerIndex: 0,
    explanation:
      "Statements suggesting hopelessness should prompt a direct suicide-risk assessment. Asking about suicidal thoughts does not create suicidal intent."
  },

  {
    id: "medical-190",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient is pacing, agitated, and behaving unusually. What principle should guide the EMT's assessment?",
    choices: [
      "Consider possible medical causes of the behavior",
      "Assume the patient has a psychiatric disorder",
      "Assume the patient is intoxicated",
      "Skip the physical assessment"
    ],
    answerIndex: 0,
    explanation:
      "Altered behavior can result from hypoglycemia, hypoxia, intoxication, infection, neurologic disease, trauma, and many other medical conditions."
  },

  {
    id: "medical-191",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An 18-year-old believes government radio waves are targeting him and has covered the windows with aluminum foil. Which psychiatric presentation is most consistent with this behavior?",
    choices: [
      "Paranoid psychosis",
      "Simple phobia",
      "Normal adolescent behavior",
      "Syncope"
    ],
    answerIndex: 0,
    explanation:
      "Fixed persecutory beliefs and behavior organized around those beliefs are characteristic of a paranoid psychotic presentation. EMS should still evaluate for medical or substance-related causes."
  },

  // ============================================================================
  // ABUSE / NEGLECT
  // ============================================================================

  {
    id: "ops-333",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An elderly patient has bruises of different ages on the face, neck, and torso. The caregiver gives an explanation that does not seem consistent with the injuries. What should you do?",
    choices: [
      "Report the suspected abuse through the appropriate authorities and medical channels",
      "Ignore the findings because the caregiver provided an explanation",
      "Confront the caregiver aggressively",
      "Tell the patient to handle the situation independently"
    ],
    answerIndex: 0,
    explanation:
      "EMS personnel are mandated reporters in many jurisdictions. Suspicious injuries or circumstances should be reported according to applicable law and agency policy."
  },

  {
    id: "ops-334",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An elderly patient is malnourished, poorly clothed for the weather, living in unsanitary conditions, and reportedly not receiving prescribed medications. What should you suspect?",
    choices: [
      "Neglect",
      "Migraine",
      "Appendicitis",
      "Anaphylaxis"
    ],
    answerIndex: 0,
    explanation:
      "Failure to provide adequate food, shelter, hygiene, medication, or other basic needs can indicate neglect. EMS should follow local reporting requirements."
  },

  // ============================================================================
  // HEAT / COLD
  // ============================================================================

  {
    id: "medical-192",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An older patient is confused, has hot dry skin, hypotension, and lives in a very hot environment. Which condition should be suspected?",
    choices: [
      "Heat stroke",
      "Mild hypothermia",
      "Kidney stone",
      "Migraine"
    ],
    answerIndex: 0,
    explanation:
      "Altered mental status with severe heat exposure and abnormal thermoregulation is concerning for heat stroke, a life-threatening emergency requiring rapid cooling and transport."
  },

  {
    id: "medical-193",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A young athlete becomes confused and semiconscious after prolonged activity in extreme heat. What should you do?",
    choices: [
      "Remove the patient from the hot environment and begin active cooling",
      "Have the patient continue exercising",
      "Wrap the patient in heavy blankets",
      "Delay cooling until arrival at the hospital"
    ],
    answerIndex: 0,
    explanation:
      "Suspected heat stroke requires immediate removal from the heat and aggressive cooling while arranging rapid transport."
  },

  {
    id: "medical-194",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient has been working outdoors in extreme heat for several hours and is now unconscious. Which intervention is appropriate?",
    choices: [
      "Move to a cooler environment, remove excess clothing, and begin active cooling",
      "Place the patient under several blankets",
      "Have the patient drink water while unconscious",
      "Delay treatment until a complete history is obtained"
    ],
    answerIndex: 0,
    explanation:
      "Heat emergencies require rapid environmental cooling. An unconscious patient should not be given anything by mouth, and airway and breathing must also be assessed."
  },

  {
    id: "medical-195",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A person is found unconscious outdoors during extremely cold weather. You cannot immediately detect a pulse. What is an important consideration?",
    choices: [
      "Check for a pulse for up to 60 seconds because severe hypothermia can make the pulse extremely slow",
      "Assume cardiac arrest after exactly 10 seconds",
      "Give oral glucose",
      "Have the patient walk to warm up"
    ],
    answerIndex: 0,
    explanation:
      "Severe hypothermia can produce profound bradycardia and very slow respirations. Pulse assessment may need to continue for up to 60 seconds before determining pulselessness."
  },

  // ============================================================================
  // INFECTIOUS DISEASE / RESPIRATORY
  // ============================================================================

  {
    id: "medical-196",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Several employees in the same workplace develop dizziness and respiratory symptoms around the same time. What should this pattern make you consider?",
    choices: [
      "A shared environmental or toxic exposure",
      "A single patient's migraine",
      "Appendicitis",
      "Kidney stones"
    ],
    answerIndex: 0,
    explanation:
      "Multiple people becoming ill in the same environment suggests a possible shared exposure. EMS should consider scene safety and hazardous-material concerns."
  },

  {
    id: "medical-197",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "A patient outside a shelter is coughing severely and producing pink, frothy sputum. Which precaution may be appropriate if an airborne infectious disease is suspected?",
    choices: [
      "Use an appropriate respiratory protective device such as an N95",
      "Remove all PPE",
      "Place your face directly next to the patient's mouth",
      "Ignore respiratory precautions"
    ],
    answerIndex: 0,
    explanation:
      "Respiratory symptoms can warrant appropriate PPE based on the suspected disease and agency infection-control procedures. An N95 or equivalent may be indicated for certain airborne pathogens."
  },

  {
    id: "medical-198",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient has fever, headache, muscle aches, congestion, pallor, tachycardia, and another person in the same household has similar symptoms. Which condition is most consistent with this presentation?",
    choices: [
      "Influenza",
      "Kidney stone",
      "Appendicitis",
      "Black widow envenomation"
    ],
    answerIndex: 0,
    explanation:
      "Fever, myalgias, headache, respiratory symptoms, and similar illness among close contacts are compatible with influenza or another viral respiratory infection."
  },

  {
    id: "medical-199",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An older adult has had a productive cough for several days, fever, confusion, and abnormal breath sounds localized to one lung. Which condition should be suspected?",
    choices: [
      "Pneumonia",
      "Migraine",
      "Hypoglycemia",
      "Renal calculus"
    ],
    answerIndex: 0,
    explanation:
      "Fever, productive cough, abnormal localized lung sounds, and altered mental status in an older adult are concerning for pneumonia."
  },

  // ============================================================================
  // HEADACHE / NEUROLOGIC
  // ============================================================================

  {
    id: "medical-200",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient with a known history of migraine reports severe headache, sensitivity to light, and vomiting. Which condition is most consistent with these symptoms?",
    choices: [
      "Migraine headache",
      "Kidney stone",
      "Appendicitis",
      "Hypoglycemia"
    ],
    answerIndex: 0,
    explanation:
      "Photophobia, nausea or vomiting, and severe headache are common features of migraine."
  },

  {
    id: "medical-201",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient says the headache began after seeing flashing or unusual visual symptoms. Which finding would support migraine?",
    choices: [
      "An aura preceding the headache",
      "Black tarry stool",
      "Severe flank pain",
      "Localized right lower quadrant tenderness"
    ],
    answerIndex: 0,
    explanation:
      "Some patients experience an aura involving visual, sensory, or other neurologic symptoms shortly before a migraine headache."
  },

  {
    id: "medical-202",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient reports a sudden, unusually severe headache described as the worst headache of their life, accompanied by vomiting. What should the EMT do?",
    choices: [
      "Treat the presentation as a potentially serious neurologic emergency",
      "Assume it is a routine migraine",
      "Give the patient food",
      "Delay transport until the pain resolves"
    ],
    answerIndex: 0,
    explanation:
      "A sudden severe 'worst headache' can indicate a life-threatening intracranial process such as subarachnoid hemorrhage. Do not automatically assume migraine."
  },

  {
    id: "medical-203",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "An unconscious patient has one pupil substantially larger than the other and that pupil does not react normally to light. What does this finding raise concern for?",
    choices: [
      "A serious intracranial or neurologic problem",
      "Simple dehydration",
      "Kidney stones",
      "Mild anemia"
    ],
    answerIndex: 0,
    explanation:
      "A fixed, markedly unequal pupil can indicate serious neurologic pathology, including increased intracranial pressure or brain injury, and requires immediate assessment."
  },

  // ============================================================================
  // ANEMIA / OXYGENATION
  // ============================================================================

  {
    id: "medical-204",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient reports a history of significant anemia. Which physical finding may be associated with reduced red blood cell mass?",
    choices: [
      "Pallor",
      "Generalized hives",
      "Localized facial swelling",
      "Pinpoint pupils"
    ],
    answerIndex: 0,
    explanation:
      "Pallor can occur with anemia because of reduced hemoglobin and altered skin coloration, although pallor has many possible causes."
  },

  {
    id: "medical-205",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient has bluish discoloration of the mucous membranes. What does this finding suggest?",
    choices: [
      "Possible inadequate oxygenation",
      "High blood glucose",
      "Excessive insulin",
      "Kidney stones"
    ],
    answerIndex: 0,
    explanation:
      "Cyanosis can indicate inadequate oxygenation, although it is a late and imperfect indicator of hypoxemia."
  },

  // ============================================================================
  // TOXICOLOGY / OPIOIDS
  // ============================================================================

  {
    id: "medical-206",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An unconscious patient is found with very small pupils and slow, shallow respirations. Which condition should be strongly suspected?",
    choices: [
      "Opioid poisoning",
      "Heat stroke",
      "Appendicitis",
      "Migraine"
    ],
    answerIndex: 0,
    explanation:
      "The combination of depressed mental status, respiratory depression, and pinpoint pupils is strongly suggestive of opioid poisoning."
  },

  {
    id: "medical-207",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An adolescent at a party becomes progressively lethargic with a respiratory rate of 4 breaths/min. Which type of poisoning should be considered?",
    choices: [
      "Opioid or other respiratory-depressant overdose",
      "Mild dehydration",
      "Simple migraine",
      "Appendicitis"
    ],
    answerIndex: 0,
    explanation:
      "Severe respiratory depression with altered mental status is concerning for opioid or another CNS-depressant overdose. Ventilatory support takes priority."
  },

  {
    id: "medical-208",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient reports seeing and hearing things that are not actually present after taking a substance. Which drug effect is being described?",
    choices: [
      "Hallucinogenic effect",
      "Anticoagulant effect",
      "Hypoglycemic effect",
      "Diuretic effect"
    ],
    answerIndex: 0,
    explanation:
      "Hallucinogens can produce altered sensory perception, including visual or auditory hallucinations."
  },

  // ============================================================================
  // TRAUMA / POSITIONING
  // ============================================================================

  {
    id: "airway-089",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An unconscious patient is found lying face down and is not breathing normally. What should you do first?",
    choices: [
      "Move the patient to a supine position while protecting the spine as indicated and assess the airway",
      "Leave the patient prone until the ambulance arrives",
      "Give oral glucose",
      "Ask the patient to stand"
    ],
    answerIndex: 0,
    explanation:
      "An apneic patient requires immediate airway and breathing assessment. The patient must be positioned appropriately so the airway can be assessed and ventilations provided."
  },

  // ============================================================================
  // OB/GYN
  // ============================================================================

  {
    id: "medical-209",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A 16-year-old patient has severe sudden abdominal pain, has missed two menstrual periods, and is pale, cool, tachycardic, and hypotensive. What emergency should be considered?",
    choices: [
      "A ruptured ectopic pregnancy with internal hemorrhage",
      "Simple indigestion",
      "Migraine",
      "Kidney infection"
    ],
    answerIndex: 0,
    explanation:
      "A missed period followed by sudden severe abdominal pain and signs of shock in a patient of childbearing potential is highly concerning for ruptured ectopic pregnancy."
  },

  // ============================================================================
  // SPIDER ENVENOMATION
  // ============================================================================

  {
    id: "medical-210",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A patient develops significant muscle pain and cramping involving the chest, shoulders, and abdomen after feeling a small spider-like bite. Which envenomation should be considered?",
    choices: [
      "Black widow spider bite",
      "Bee sting",
      "Tick bite",
      "Mosquito bite"
    ],
    answerIndex: 0,
    explanation:
      "Black widow envenomation can cause significant muscle cramping and pain, including abdominal, chest, and back symptoms."
  },

  {
    id: "medical-211",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which finding is most characteristic of systemic black widow envenomation?",
    choices: [
      "Painful muscle cramping and spasms",
      "Isolated painless numbness of one finger",
      "Immediate severe hypoglycemia",
      "Black tarry stool"
    ],
    answerIndex: 0,
    explanation:
      "Black widow venom can produce neurotoxic symptoms including painful muscle cramping, abdominal pain, sweating, and hypertension."
  },

  // ============================================================================
  // EMS / GENERAL ASSESSMENT
  // ============================================================================

  {
    id: "ops-335",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "You arrive for an unresponsive medical patient. Before completing a detailed history, what should guide your immediate assessment?",
    choices: [
      "The patient's immediate life threats and primary assessment",
      "The patient's insurance information",
      "The complete medication history",
      "The patient's occupation"
    ],
    answerIndex: 0,
    explanation:
      "An unresponsive patient requires an immediate primary assessment focused on airway, breathing, circulation, and other life threats before a detailed secondary assessment."
  },

  {
    id: "ops-336",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A confused patient is found at a concert with no reliable history available. Which item may help identify an important medical condition or medication need?",
    choices: [
      "A medical identification bracelet or necklace",
      "The patient's favorite music",
      "The patient's shoe size",
      "A concert ticket"
    ],
    answerIndex: 0,
    explanation:
      "Medical identification jewelry can provide important information about conditions such as diabetes, epilepsy, allergies, or other medical problems."
  },

  {
    id: "ops-337",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which principle should guide the EMT when evaluating a patient whose behavior appears psychiatric?",
    choices: [
      "Rule out potentially serious medical causes while maintaining scene safety",
      "Assume psychiatric illness is the only explanation",
      "Avoid checking vital signs",
      "Refuse to speak with the patient"
    ],
    answerIndex: 0,
    explanation:
      "Medical conditions, intoxication, hypoxia, hypoglycemia, infection, trauma, and neurologic disease can all produce abnormal behavior."
  },

  // ============================================================================
  // REVERSE QUESTIONS
  // These intentionally approach the same concepts from the answer side.
  // ============================================================================

  {
    id: "reverse-001",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What term describes a brief loss of consciousness followed by spontaneous recovery, usually without a prolonged postictal period?",
    choices: [
      "Syncope",
      "Stroke",
      "Seizure",
      "Delirium"
    ],
    answerIndex: 0,
    explanation:
      "Syncope is a transient loss of consciousness caused by temporary cerebral hypoperfusion."
  },

  {
    id: "reverse-002",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What bedside test involves having the patient extend both arms with palms upward and close their eyes?",
    choices: [
      "Arm-drift assessment",
      "Blood glucose assessment",
      "Pupil assessment",
      "Lung-sound assessment"
    ],
    answerIndex: 0,
    explanation:
      "The arm-drift test is used to identify unilateral weakness that may occur with stroke."
  },

  {
    id: "reverse-003",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which condition should be considered when a patient has transient neurologic deficits that completely resolve?",
    choices: [
      "Transient ischemic attack",
      "Appendicitis",
      "Pneumonia",
      "Anaphylaxis"
    ],
    answerIndex: 0,
    explanation:
      "A transient ischemic attack causes temporary neurologic dysfunction and is an important warning sign for future stroke."
  },

  {
    id: "reverse-004",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What medication promotes movement of glucose from the bloodstream into cells?",
    choices: [
      "Insulin",
      "Atropine",
      "Epinephrine",
      "Aspirin"
    ],
    answerIndex: 0,
    explanation:
      "Insulin facilitates cellular glucose uptake and helps lower blood glucose."
  },

  {
    id: "reverse-005",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "A blood glucose measurement of 57 mg/dL represents which condition?",
    choices: [
      "Hypoglycemia",
      "Hyperglycemia",
      "Normal glucose",
      "Hyperthermia"
    ],
    answerIndex: 0,
    explanation:
      "A glucose level of 57 mg/dL is abnormally low and represents hypoglycemia."
  },

  {
    id: "reverse-006",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What condition is characterized by black, tarry stool caused by digested blood?",
    choices: [
      "Upper gastrointestinal bleeding",
      "Kidney stone",
      "Appendicitis",
      "Migraine"
    ],
    answerIndex: 0,
    explanation:
      "Melena, or black tarry stool, is commonly associated with upper gastrointestinal bleeding."
  },

  {
    id: "reverse-007",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which abdominal condition classically causes pain that migrates from the area around the umbilicus to the right lower quadrant?",
    choices: [
      "Appendicitis",
      "Pneumonia",
      "Migraine",
      "Anaphylaxis"
    ],
    answerIndex: 0,
    explanation:
      "Migration of abdominal pain toward the right lower quadrant is a classic presentation of appendicitis."
  },

  {
    id: "reverse-008",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which condition commonly produces severe flank pain that radiates toward the groin and causes the patient to be unable to sit still?",
    choices: [
      "Renal calculus",
      "Stroke",
      "Pneumonia",
      "Anemia"
    ],
    answerIndex: 0,
    explanation:
      "Renal calculi commonly cause severe colicky flank pain radiating toward the groin."
  },

  {
    id: "reverse-009",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which condition may cause painful muscle cramping involving the abdomen, chest, or back after a spider bite?",
    choices: [
      "Black widow envenomation",
      "Appendicitis",
      "Migraine",
      "Heat exhaustion"
    ],
    answerIndex: 0,
    explanation:
      "Black widow venom can produce systemic neurotoxic effects, particularly painful muscle cramping."
  },

  {
    id: "reverse-010",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which medication is the first-line treatment for severe anaphylaxis?",
    choices: [
      "Intramuscular epinephrine",
      "Oral glucose",
      "Aspirin",
      "Atropine"
    ],
    answerIndex: 0,
    explanation:
      "IM epinephrine is the first-line medication for anaphylaxis."
  },

  {
    id: "reverse-011",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which medication is used to counteract the muscarinic effects of organophosphate poisoning?",
    choices: [
      "Atropine",
      "Insulin",
      "Aspirin",
      "Glucose"
    ],
    answerIndex: 0,
    explanation:
      "Atropine blocks muscarinic acetylcholine receptors and is used to treat the cholinergic manifestations of organophosphate poisoning."
  },

  {
    id: "reverse-012",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What immediate intervention is appropriate after a chemical substance splashes into a patient's eyes?",
    choices: [
      "Continuous irrigation with clean water or appropriate irrigation fluid",
      "Cover both eyes and wait",
      "Apply an ice pack",
      "Give oral medication"
    ],
    answerIndex: 0,
    explanation:
      "Chemical eye exposures require prompt and prolonged irrigation."
  },

  {
    id: "reverse-013",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What airway intervention is indicated when an unresponsive patient has gurgling respirations from secretions?",
    choices: [
      "Suction",
      "Oral glucose",
      "Aspirin",
      "Walking the patient"
    ],
    answerIndex: 0,
    explanation:
      "Gurgling indicates fluid or secretions in the airway. Suction is used to clear them."
  },

  {
    id: "reverse-014",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What ventilation device is appropriate for an unconscious drowning patient who has a pulse but inadequate breathing?",
    choices: [
      "Bag-valve mask",
      "Nasal cannula only",
      "Nonrebreather without assisted ventilation",
      "Nebulizer"
    ],
    answerIndex: 0,
    explanation:
      "A patient with a pulse but inadequate breathing requires assisted ventilations, commonly delivered with a BVM."
  },

  {
    id: "reverse-015",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What type of finding is suggested by blue discoloration of the lips or mucous membranes?",
    choices: [
      "Possible inadequate oxygenation",
      "Hyperglycemia",
      "Anemia only",
      "Hypertension"
    ],
    answerIndex: 0,
    explanation:
      "Cyanosis can indicate inadequate oxygenation, although it is not a sensitive early indicator of hypoxemia."
  },

  {
    id: "reverse-016",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What condition requires rapid removal from the heat and aggressive cooling when altered mental status is present?",
    choices: [
      "Heat stroke",
      "Simple dehydration",
      "Kidney stone",
      "Migraine"
    ],
    answerIndex: 0,
    explanation:
      "Heat stroke is a life-threatening hyperthermic emergency requiring immediate cooling and rapid transport."
  },

  {
    id: "reverse-017",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What condition should be suspected when an elderly patient has fever, productive cough, localized abnormal lung sounds, and new confusion?",
    choices: [
      "Pneumonia",
      "Renal calculus",
      "Migraine",
      "Syncope"
    ],
    answerIndex: 0,
    explanation:
      "Pneumonia can cause respiratory symptoms, fever, abnormal lung sounds, and altered mental status, particularly in older adults."
  },

  {
    id: "reverse-018",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which condition is suggested by a sudden severe headache described as the worst headache of the patient's life?",
    choices: [
      "A potentially serious intracranial emergency",
      "Simple dehydration",
      "Kidney stone",
      "Mild anemia"
    ],
    answerIndex: 0,
    explanation:
      "A sudden severe headache can indicate a serious intracranial event such as subarachnoid hemorrhage and should not automatically be attributed to migraine."
  },

  {
    id: "reverse-019",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What finding is commonly associated with anemia?",
    choices: [
      "Pallor",
      "Urticaria",
      "Pinpoint pupils",
      "Wheezing"
    ],
    answerIndex: 0,
    explanation:
      "Pallor may occur with anemia because of reduced hemoglobin and red blood cell mass."
  },

  {
    id: "reverse-020",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which combination most strongly suggests opioid poisoning?",
    choices: [
      "Depressed mental status, respiratory depression, and pinpoint pupils",
      "Fever, hives, and wheezing",
      "Abdominal pain and black stool",
      "Hot skin and severe hypertension"
    ],
    answerIndex: 0,
    explanation:
      "Opioid poisoning classically produces CNS depression, respiratory depression, and miosis."
  },

  {
    id: "reverse-021",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which condition is characterized by temporary neurologic deficits that resolve completely?",
    choices: [
      "Transient ischemic attack",
      "Permanent stroke",
      "Appendicitis",
      "Anaphylaxis"
    ],
    answerIndex: 0,
    explanation:
      "A TIA produces transient focal neurologic symptoms that resolve."
  },

  {
    id: "reverse-022",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What type of exposure should be suspected when several people in the same workplace develop similar respiratory and neurologic symptoms at approximately the same time?",
    choices: [
      "A shared toxic or environmental exposure",
      "A single patient's migraine",
      "Appendicitis",
      "Renal colic"
    ],
    answerIndex: 0,
    explanation:
      "Multiple patients with similar symptoms in the same location should raise concern for an environmental or hazardous exposure."
  },

  {
    id: "reverse-023",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What psychiatric presentation involves fixed persecutory beliefs, such as believing that a government agency is targeting the patient?",
    choices: [
      "Paranoid psychosis",
      "Syncope",
      "Delirium from dehydration",
      "Migraine"
    ],
    answerIndex: 0,
    explanation:
      "Fixed persecutory beliefs can occur in paranoid psychotic disorders, although EMS should also consider medical and substance-related causes."
  },

  {
    id: "reverse-024",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What should be the EMT's first priority when responding to a potentially violent behavioral emergency?",
    choices: [
      "Ensure the safety of EMS personnel and the scene",
      "Immediately restrain the patient",
      "Enter without law-enforcement coordination",
      "Begin a detailed medical history"
    ],
    answerIndex: 0,
    explanation:
      "EMS cannot effectively treat a patient if the scene is unsafe. Coordination with law enforcement and attention to scene safety come first."
  },

  {
    id: "reverse-025",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "What should an EMT do when an elderly patient's injuries are suspicious for abuse or neglect?",
    choices: [
      "Follow mandatory reporting and agency procedures",
      "Ignore the findings if a caregiver offers an explanation",
      "Destroy the documentation",
      "Ask the patient to resolve it privately"
    ],
    answerIndex: 0,
    explanation:
      "Suspected abuse and neglect should be documented and reported according to applicable laws and agency procedures."
  },
// ============================================================================
// MEDICAL + OBGYN / EMT
// Rewritten + reverse-question set
// ============================================================================

// Original concept: sudden headache + unilateral weakness = stroke
{
  id: "med-001",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A 56-year-old woman suddenly develops an intense headache and weakness affecting her left arm. Her blood pressure is 188/92 mmHg, pulse is 106/min, and respirations are 14/min. Which condition should the EMT suspect?",
  choices: [
    "Acute stroke",
    "Hypoglycemia",
    "Panic attack",
    "Gastrointestinal hemorrhage",
  ],
  answerIndex: 0,
  explanation:
    "The sudden onset of a severe headache with one-sided weakness is highly concerning for an acute stroke. Hypoglycemia can mimic stroke but should be evaluated separately with a blood glucose check.",
},

// Reverse: answer = stroke, presented through another presentation
{
  id: "med-002",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An older patient suddenly develops difficulty speaking and weakness on one side of the body. Which emergency best explains this combination of neurologic findings?",
  choices: [
    "Acute stroke",
    "Appendicitis",
    "Asthma exacerbation",
    "Gastroesophageal reflux",
  ],
  answerIndex: 0,
  explanation:
    "Sudden focal neurologic deficits such as unilateral weakness and speech difficulty are classic warning signs of an acute stroke.",
},

// Original concept: diabetic patient with neurologic symptoms, facial droop
{
  id: "med-003",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A 72-year-old man with type 2 diabetes has blurred vision, weak hand grips, and difficulty identifying the current day. During your neurologic assessment, which finding would be especially important to evaluate for?",
  choices: [
    "Facial asymmetry",
    "Abdominal tenderness",
    "Bilateral ankle swelling",
    "Jugular vein distention",
  ],
  answerIndex: 0,
  explanation:
    "Facial asymmetry or drooping can indicate a focal neurologic deficit and is one of the findings evaluated when screening a patient for possible stroke.",
},

// Reverse: answer = facial droop
{
  id: "med-004",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "During a neurologic screening exam, one side of the patient's mouth does not move normally when the patient smiles. What abnormal finding does this represent?",
  choices: [
    "Facial droop",
    "Nystagmus",
    "Ataxia",
    "Cyanosis",
  ],
  answerIndex: 0,
  explanation:
    "Unequal movement of the face during smiling is described as a facial droop and may indicate a neurologic deficit.",
},

// Original concept: anaphylaxis + EpiPen
{
  id: "med-005",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient with a known bee-sting allergy develops throat itching and swelling of the lips shortly after being stung. The patient has a prescribed epinephrine auto-injector. What is the most appropriate EMT action?",
  choices: [
    "Assist the patient with the epinephrine auto-injector",
    "Have the patient drink several glasses of water",
    "Wait for the swelling to resolve before treating",
    "Administer oral glucose",
  ],
  answerIndex: 0,
  explanation:
    "Throat symptoms and swelling after an allergen exposure are concerning for anaphylaxis. Epinephrine is the first-line treatment, and an EMT should assist the patient with their prescribed auto-injector according to protocol.",
},

// Reverse: answer = epinephrine
{
  id: "med-006",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient develops wheezing, facial swelling, and difficulty breathing shortly after an insect sting. Which medication is the priority treatment for suspected anaphylaxis?",
  choices: [
    "Epinephrine",
    "Aspirin",
    "Oral glucose",
    "Activated charcoal",
  ],
  answerIndex: 0,
  explanation:
    "Epinephrine is the priority medication for anaphylaxis because it counteracts airway swelling, bronchoconstriction, and circulatory effects of the reaction.",
},

// GI bleed
{
  id: "med-007",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which patient finding would most strongly suggest that a patient may be experiencing gastrointestinal bleeding?",
  choices: [
    "Blood passed through the rectum",
    "Clear urine",
    "A dry cough",
    "Swelling of both ankles",
  ],
  answerIndex: 0,
  explanation:
    "Blood from the rectum can indicate gastrointestinal bleeding. The appearance of the blood can help identify the likely location and severity of the bleeding.",
},

// Reverse: answer = bright red rectal blood
{
  id: "med-008",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which finding is particularly concerning for lower gastrointestinal bleeding?",
  choices: [
    "Bright-red blood associated with a bowel movement",
    "Clear nasal drainage",
    "Yellow sputum",
    "Dark urine without blood",
  ],
  answerIndex: 0,
  explanation:
    "Bright-red blood passed from the rectum is a classic finding that can indicate bleeding in the lower gastrointestinal tract.",
},

// RUQ organs
{
  id: "med-009",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which pair of organs is located primarily in the patient's right upper abdominal quadrant?",
  choices: [
    "Liver and gallbladder",
    "Appendix and urinary bladder",
    "Spleen and pancreas",
    "Sigmoid colon and rectum",
  ],
  answerIndex: 0,
  explanation:
    "The liver occupies much of the right upper quadrant, and the gallbladder lies beneath the liver.",
},

// Reverse: answer = liver and gallbladder
{
  id: "med-010",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An EMT is assessing abdominal pain in the right upper quadrant. Which organs are most closely associated with this region?",
  choices: [
    "Liver and gallbladder",
    "Appendix and bladder",
    "Rectum and sigmoid colon",
    "Left kidney and spleen",
  ],
  answerIndex: 0,
  explanation:
    "The liver and gallbladder are major structures located in or associated with the right upper quadrant of the abdomen.",
},

// RLQ
{
  id: "med-011",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Pain localized to the lower-right portion of the abdomen may involve which organ?",
  choices: [
    "Appendix",
    "Gallbladder",
    "Spleen",
    "Esophagus",
  ],
  answerIndex: 0,
  explanation:
    "The appendix is located in the right lower quadrant of the abdomen and inflammation of the appendix commonly produces pain in this region.",
},

// Reverse: appendix
{
  id: "med-012",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient has progressively worsening abdominal pain that becomes concentrated in the right lower quadrant. Which structure should be considered when evaluating this presentation?",
  choices: [
    "Appendix",
    "Gallbladder",
    "Liver",
    "Diaphragm",
  ],
  answerIndex: 0,
  explanation:
    "The appendix is located in the right lower quadrant, making appendicitis an important consideration with compatible symptoms.",
},

// DKA treatment
{
  id: "med-013",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A diabetic patient is excessively thirsty, urinating frequently, behaving abnormally, and has a fruity odor to the breath. Which supportive treatment may be appropriate while arranging transport, assuming no contraindication and according to local protocol?",
  choices: [
    "Administer an appropriate amount of isotonic fluid",
    "Give oral glucose regardless of blood glucose level",
    "Give aspirin immediately",
    "Restrict all fluids",
  ],
  answerIndex: 0,
  explanation:
    "The findings are concerning for diabetic ketoacidosis. Fluid replacement is an important component of supportive prehospital care when permitted by the patient's condition and local protocol. EMT treatment should focus on supportive care and prompt transport.",
},

// Reverse: fluid
{
  id: "med-014",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient with suspected diabetic ketoacidosis shows signs of significant dehydration. Which type of supportive intervention may be indicated in the prehospital setting when permitted by protocol?",
  choices: [
    "Isotonic IV fluid",
    "A concentrated glucose solution for every patient",
    "Aspirin",
    "A sedative medication",
  ],
  answerIndex: 0,
  explanation:
    "Patients with diabetic ketoacidosis can become significantly dehydrated. Isotonic fluid replacement may be appropriate when within the provider's scope and local protocol.",
},

// Urticaria
{
  id: "med-015",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "The medical term 'urticaria' refers to which skin finding?",
  choices: [
    "Hives",
    "Jaundice",
    "Cyanosis",
    "Petechiae",
  ],
  answerIndex: 0,
  explanation:
    "Urticaria is the medical term for hives, which are raised, often itchy areas of the skin commonly associated with allergic reactions.",
},

// Reverse: hives -> urticaria
{
  id: "med-016",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient develops multiple raised, itchy welts across the skin after exposure to an allergen. What is the medical term for this finding?",
  choices: [
    "Urticaria",
    "Hematemesis",
    "Hematuria",
    "Cyanosis",
  ],
  answerIndex: 0,
  explanation:
    "Urticaria is the medical term for hives, which appear as raised and usually itchy skin lesions.",
},

// Bell's palsy
{
  id: "med-017",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient suddenly develops weakness involving one side of the face without other obvious neurologic deficits. Which condition can produce this type of facial paralysis and may resemble a stroke?",
  choices: [
    "Bell's palsy",
    "Appendicitis",
    "Pneumonia",
    "Gastroenteritis",
  ],
  answerIndex: 0,
  explanation:
    "Bell's palsy causes weakness or paralysis of one side of the face and can resemble a stroke. However, stroke must still be considered when acute neurologic symptoms are present.",
},

// Reverse: Bell's palsy
{
  id: "med-018",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which condition is characterized by acute weakness or paralysis of muscles on one side of the face?",
  choices: [
    "Bell's palsy",
    "Diabetic ketoacidosis",
    "Appendicitis",
    "Gastrointestinal hemorrhage",
  ],
  answerIndex: 0,
  explanation:
    "Bell's palsy affects the facial nerve and can cause sudden weakness or paralysis on one side of the face.",
},

// Kidney function
{
  id: "med-019",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which organ filters waste products from the blood and plays a major role in producing urine?",
  choices: [
    "Kidney",
    "Gallbladder",
    "Pancreas",
    "Appendix",
  ],
  answerIndex: 0,
  explanation:
    "The kidneys filter the blood and remove metabolic waste and excess substances through the formation of urine.",
},

// Reverse: kidney
{
  id: "med-020",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An EMT is reviewing the organs of the urinary system. Which organ is primarily responsible for filtering the blood and forming urine?",
  choices: [
    "Kidney",
    "Gallbladder",
    "Liver",
    "Spleen",
  ],
  answerIndex: 0,
  explanation:
    "The kidneys filter the blood and produce urine as part of the body's waste-removal and fluid-regulation processes.",
},

// Gallbladder function
{
  id: "med-021",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which organ stores bile made by the liver and releases it to assist with fat digestion?",
  choices: [
    "Gallbladder",
    "Appendix",
    "Kidney",
    "Urinary bladder",
  ],
  answerIndex: 0,
  explanation:
    "The gallbladder stores and concentrates bile produced by the liver and releases it into the digestive tract.",
},

// Reverse: gallbladder
{
  id: "med-022",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "The liver produces a digestive substance that is stored and concentrated in another nearby organ before being released into the intestine. Which organ performs this storage function?",
  choices: [
    "Gallbladder",
    "Kidney",
    "Appendix",
    "Pancreas",
  ],
  answerIndex: 0,
  explanation:
    "The gallbladder stores and concentrates bile produced by the liver and releases it during digestion.",
},

// Syncope
{
  id: "med-023",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which patient history most strongly supports a recent episode of syncope?",
  choices: [
    "A brief loss of consciousness followed by spontaneous recovery",
    "Several days of localized abdominal pain",
    "A persistent productive cough",
    "A gradual onset of itchy skin",
  ],
  answerIndex: 0,
  explanation:
    "Syncope is a temporary loss of consciousness caused by transient inadequate cerebral perfusion, typically followed by spontaneous recovery.",
},

// Reverse: syncope
{
  id: "med-024",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A patient briefly loses consciousness, then awakens without intervention and returns toward their normal mental status. What is this episode most consistent with?",
  choices: [
    "Syncope",
    "Anaphylaxis",
    "Appendicitis",
    "Gastrointestinal bleeding",
  ],
  answerIndex: 0,
  explanation:
    "A brief, transient loss of consciousness with spontaneous recovery is characteristic of syncope, although the underlying cause still needs to be determined.",
},

// TIA
{
  id: "med-025",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which condition is particularly important because it can precede or warn of a future major ischemic stroke?",
  choices: [
    "Transient ischemic attack",
    "Seasonal allergies",
    "Gastroesophageal reflux",
    "Simple dehydration",
  ],
  answerIndex: 0,
  explanation:
    "A transient ischemic attack, or TIA, causes temporary neurologic dysfunction from cerebral ischemia and is an important warning sign for future stroke.",
},

// Reverse: TIA
{
  id: "med-026",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient experiences sudden weakness and difficulty speaking that completely resolve before EMS arrives. Which condition should remain a significant concern despite the patient's symptoms improving?",
  choices: [
    "Transient ischemic attack",
    "Appendicitis",
    "Pneumonia",
    "Gastrointestinal reflux",
  ],
  answerIndex: 0,
  explanation:
    "A TIA can cause sudden focal neurologic symptoms that resolve, but it remains an important warning sign for possible future stroke and requires medical evaluation.",
},

// Stroke scale speech
{
  id: "med-027",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "When evaluating a patient for abnormal speech as part of a prehospital stroke assessment, which action is most appropriate?",
  choices: [
    "Have the patient repeat a simple, familiar sentence",
    "Ask the patient to hold their breath for 30 seconds",
    "Have the patient identify several medication bottles",
    "Ask the patient to perform a deep squat",
  ],
  answerIndex: 0,
  explanation:
    "Having the patient repeat a simple, familiar phrase allows the EMT to assess speech clarity and identify abnormalities such as slurring or inappropriate words.",
},

// Reverse: speech assessment
{
  id: "med-028",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which assessment technique can help an EMT identify abnormal speech during a stroke screening?",
  choices: [
    "Ask the patient to repeat a familiar phrase",
    "Ask the patient to walk backward",
    "Ask the patient to hold their breath",
    "Ask the patient to palpate their own abdomen",
  ],
  answerIndex: 0,
  explanation:
    "Repeating a familiar phrase provides a quick way to evaluate whether the patient's speech is clear and appropriate.",
},

// Facial droop assessment
{
  id: "med-029",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "What should an EMT ask a patient to do when specifically assessing for facial asymmetry during a stroke screen?",
  choices: [
    "Smile or show their teeth",
    "Take several deep breaths",
    "Stand on one foot",
    "Touch their toes",
  ],
  answerIndex: 0,
  explanation:
    "Asking the patient to smile or show their teeth allows the EMT to compare movement on both sides of the face.",
},

// Reverse: smile
{
  id: "med-030",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "During a suspected stroke evaluation, which patient instruction is useful for evaluating facial movement?",
  choices: [
    "“Smile and show me your teeth.”",
    "“Take a deep breath and hold it.”",
    "“Bend forward and touch your toes.”",
    "“Raise your knees as high as possible.”",
  ],
  answerIndex: 0,
  explanation:
    "Having the patient smile or show their teeth helps the EMT identify asymmetrical facial movement.",
},

// Arm drift
{
  id: "med-031",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which instruction would best evaluate for arm drift during a stroke assessment?",
  choices: [
    "“Close your eyes, extend both arms in front of you, and hold them there.”",
    "“Take a deep breath and cough.”",
    "“Open and close your hands as quickly as possible.”",
    "“Touch your toes and stand back up.”",
  ],
  answerIndex: 0,
  explanation:
    "Having the patient close their eyes and hold both arms extended allows the EMT to observe whether one arm drifts downward.",
},

// Reverse: arm drift
{
  id: "med-032",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "During a stroke screening, an EMT asks the patient to close their eyes and hold both arms straight out. Why is this being done?",
  choices: [
    "To identify an arm drift",
    "To measure respiratory rate",
    "To assess blood glucose",
    "To determine pupil size",
  ],
  answerIndex: 0,
  explanation:
    "The arm-drift assessment can reveal subtle unilateral weakness that may indicate a neurologic deficit.",
},

// Last known well
{
  id: "med-033",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient with suspected stroke cannot provide a reliable history. Which question should the EMT ask family or witnesses?",
  choices: [
    "“When was the patient last known to be normal?”",
    "“What did the patient eat for breakfast?”",
    "“How many television shows did the patient watch today?”",
    "“What is the patient's favorite color?”",
  ],
  answerIndex: 0,
  explanation:
    "Determining the patient's last known well or normal time is critical because stroke treatment decisions can depend on the timing of symptom onset.",
},

// Reverse: last known well
{
  id: "med-034",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Why is determining the time a stroke patient's symptoms began, or the last time they were known to be normal, so important?",
  choices: [
    "It helps determine eligibility for time-sensitive stroke treatment",
    "It determines the patient's blood type",
    "It identifies the patient's medication allergies",
    "It tells the EMT which quadrant of the abdomen is affected",
  ],
  answerIndex: 0,
  explanation:
    "Stroke treatment options can be highly time dependent, so the patient's last known normal time is an essential piece of information.",
},

// Stroke + diabetes = glucose
{
  id: "med-035",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An elderly patient has sudden garbled speech and weakness on the right side. The patient's vital signs and oxygen saturation are normal, and the family reports a history of diabetes. Which assessment should be performed promptly because it can identify a common stroke mimic?",
  choices: [
    "Blood glucose measurement",
    "Abdominal circumference",
    "Hearing test",
    "Skin allergy testing",
  ],
  answerIndex: 0,
  explanation:
    "Hypoglycemia can produce altered mental status and focal neurologic findings that resemble a stroke. Blood glucose should therefore be checked promptly when appropriate.",
},

// Reverse: hypoglycemia
{
  id: "med-036",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient has altered mental status and focal neurologic findings that resemble a stroke. Which metabolic problem should the EMT specifically consider and evaluate for?",
  choices: [
    "Hypoglycemia",
    "Hypercalcemia",
    "Mild dehydration",
    "High cholesterol",
  ],
  answerIndex: 0,
  explanation:
    "Hypoglycemia can mimic an acute stroke, so obtaining a blood glucose level is an important part of evaluating compatible patients.",
},

// Cincinnati stroke scale
{
  id: "med-037",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which finding is included in the Cincinnati Prehospital Stroke Scale?",
  choices: [
    "Facial droop",
    "Abdominal rigidity",
    "Jugular venous pressure",
    "Pedal edema",
  ],
  answerIndex: 0,
  explanation:
    "The Cincinnati Prehospital Stroke Scale evaluates facial droop, arm drift, and abnormal speech.",
},

// Reverse: Cincinnati scale
{
  id: "med-038",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An EMT wants to rapidly screen a patient for possible stroke using a tool that evaluates facial movement, arm movement, and speech. Which assessment is being described?",
  choices: [
    "Cincinnati Prehospital Stroke Scale",
    "Glasgow Coma Scale",
    "APGAR score",
    "Trauma score",
  ],
  answerIndex: 0,
  explanation:
    "The Cincinnati Prehospital Stroke Scale is a rapid stroke screening tool based on facial droop, arm drift, and speech abnormalities.",
},

// Stroke presentation
{
  id: "med-039",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A patient develops sudden confusion along with loss of movement on one side of the body. Which condition should be high on the EMT's differential?",
  choices: [
    "Stroke",
    "Simple indigestion",
    "Seasonal rhinitis",
    "Minor muscle strain",
  ],
  answerIndex: 0,
  explanation:
    "Sudden altered mental status accompanied by a focal motor deficit is highly concerning for an acute neurologic event such as stroke.",
},

// Reverse: stroke from neurologic deficit
{
  id: "med-040",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which emergency condition should an EMT suspect when a patient develops a sudden focal neurologic deficit such as unilateral weakness or speech difficulty?",
  choices: [
    "Stroke",
    "Appendicitis",
    "Urticaria",
    "Gastroesophageal reflux",
  ],
  answerIndex: 0,
  explanation:
    "Sudden focal neurologic deficits are hallmark warning signs of stroke and require rapid assessment and transport.",
},

// Stroke mimic
{
  id: "med-041",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A patient has sudden weakness on one side and difficulty speaking. In addition to stroke, which condition should the EMT consider because it can produce similar neurologic findings?",
  choices: [
    "Hypoglycemia",
    "Otitis externa",
    "Mild sunburn",
    "Uncomplicated constipation",
  ],
  answerIndex: 0,
  explanation:
    "Hypoglycemia can cause altered mental status and focal neurologic deficits that mimic stroke, making a blood glucose assessment important.",
},

// Oxygenation
{
  id: "med-042",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A confused and combative patient has a pulse of 88/min, respirations of 16/min, blood pressure of 144/68 mmHg, and an SpO2 of 93% on room air. Which intervention may be appropriate to address the patient's oxygenation, depending on local protocol?",
  choices: [
    "Provide supplemental oxygen by nasal cannula",
    "Withhold oxygen because the patient is conscious",
    "Administer oral glucose solely because the patient is confused",
    "Place the patient on a nonrebreather at maximum flow regardless of condition",
  ],
  answerIndex: 0,
  explanation:
    "An SpO2 of 93% may warrant supplemental oxygen under many EMS protocols, particularly when the patient has altered mental status. Oxygen should be titrated appropriately rather than given automatically at maximum flow.",
},

// Reverse: nasal cannula oxygen
{
  id: "med-043",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient has mildly reduced oxygen saturation and does not require high-flow oxygen. Which device is commonly appropriate for delivering a low concentration of supplemental oxygen?",
  choices: [
    "Nasal cannula",
    "Bag-valve mask",
    "Supraglottic airway",
    "Noninvasive ventilator",
  ],
  answerIndex: 0,
  explanation:
    "A nasal cannula is commonly used to provide relatively low-flow supplemental oxygen to patients who are breathing adequately on their own.",
},
];
