// EMT-level questions, split out of questions.js. See questions.js's own
// header comment for the shared question-object shape and rules for adding one.
// This file holds only level: "EMT" entries.

import { BATCH as EMT_AIRWAY_BATCH } from "./_genbatch/emt_airway.js";
import { BATCH as EMT_CARDIOLOGY_BATCH } from "./_genbatch/emt_cardiology.js";
import { BATCH as EMT_MEDICAL_BATCH } from "./_genbatch/emt_medical.js";
import { BATCH as EMT_OPS_BATCH } from "./_genbatch/emt_ops.js";
import { BATCH as EMT_TRAUMA_BATCH } from "./_genbatch/emt_trauma.js";

export const EMT_QUESTIONS = [
  {
    id: "emt-airway-001",
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
    id: "emt-airway-002",
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
    id: "emt-airway-003",
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
    id: "emt-airway-004",
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
    id: "emt-airway-005",
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
    id: "emt-cardiology-001",
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
    id: "emt-cardiology-002",
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
    id: "emt-cardiology-003",
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
    id: "emt-cardiology-004",
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
    id: "emt-cardiology-005",
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
    id: "emt-trauma-001",
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
    id: "emt-trauma-002",
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
    id: "emt-trauma-003",
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
    id: "emt-trauma-004",
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
    id: "emt-trauma-005",
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
    id: "emt-medical-001",
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
    id: "emt-medical-002",
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
    id: "emt-medical-003",
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
    id: "emt-medical-004",
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
    id: "emt-medical-005",
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
    id: "emt-medical-006",
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
    id: "emt-medical-007",
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
    id: "emt-medical-008",
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
    id: "emt-medical-009",
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
    id: "emt-ops-001",
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
    id: "emt-ops-002",
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
    id: "emt-ops-003",
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
    id: "emt-ops-004",
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
    id: "emt-ops-005",
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
    id: "emt-ops-006",
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
    id: "emt-airway-006",
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
    id: "emt-cardiology-006",
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
    id: "emt-medical-010",
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
    id: "emt-trauma-006",
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
    id: "emt-medical-011",
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
    id: "emt-airway-007",
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
    id: "emt-cardiology-007",
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
    id: "emt-trauma-007",
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
    id: "emt-trauma-008",
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
  id: "emt-medical-012",
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

  {
  id: "emt-airway-008",
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
  id: "emt-airway-009",
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
  id: "emt-airway-010",
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
  id: "emt-airway-011",
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
  id: "emt-airway-012",
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
  id: "emt-airway-013",
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
  id: "emt-airway-014",
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
  id: "emt-airway-015",
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
  id: "emt-airway-016",
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
  id: "emt-airway-017",
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
  id: "emt-airway-018",
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
  id: "emt-airway-019",
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
  id: "emt-airway-020",
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
  id: "emt-airway-021",
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
  id: "emt-airway-022",
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
  id: "emt-airway-023",
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
  id: "emt-airway-024",
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
  id: "emt-airway-025",
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
  id: "emt-airway-026",
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
  id: "emt-airway-027",
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
  id: "emt-airway-028",
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
  id: "emt-airway-029",
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
  id: "emt-airway-030",
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
  id: "emt-airway-031",
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
  id: "emt-airway-032",
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

  {
  id: "emt-airway-033",
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
  id: "emt-airway-034",
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
  id: "emt-airway-035",
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
  id: "emt-airway-036",
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
  id: "emt-airway-037",
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
  id: "emt-airway-038",
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
  id: "emt-airway-039",
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
  id: "emt-airway-040",
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
  id: "emt-airway-041",
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
  id: "emt-airway-042",
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
  id: "emt-airway-043",
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
  id: "emt-airway-044",
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
  id: "emt-airway-045",
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
  id: "emt-airway-046",
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
  id: "emt-airway-047",
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
  id: "emt-airway-048",
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
  id: "emt-airway-049",
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

  {
  id: "emt-cardiology-008",
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
  id: "emt-cardiology-009",
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
  id: "emt-cardiology-010",
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
  id: "emt-cardiology-011",
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
  id: "emt-cardiology-012",
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
  id: "emt-cardiology-013",
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
  id: "emt-cardiology-014",
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
  id: "emt-cardiology-015",
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
  id: "emt-cardiology-016",
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
  id: "emt-cardiology-017",
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
  id: "emt-cardiology-018",
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
  id: "emt-cardiology-019",
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
  id: "emt-cardiology-020",
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
  id: "emt-cardiology-021",
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
  id: "emt-cardiology-022",
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
  id: "emt-cardiology-023",
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
  id: "emt-cardiology-024",
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
  id: "emt-cardiology-025",
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
  id: "emt-cardiology-026",
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
  id: "emt-cardiology-027",
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

  {
  id: "emt-trauma-009",
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
  id: "emt-trauma-010",
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
  id: "emt-trauma-011",
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
  id: "emt-trauma-012",
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
  id: "emt-trauma-013",
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
  id: "emt-trauma-014",
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
  id: "emt-trauma-015",
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
  id: "emt-trauma-016",
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
  id: "emt-trauma-017",
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
  id: "emt-trauma-018",
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
  id: "emt-trauma-019",
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
  id: "emt-trauma-020",
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
  id: "emt-trauma-021",
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
  id: "emt-trauma-022",
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
  id: "emt-trauma-023",
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
  id: "emt-trauma-024",
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
  id: "emt-trauma-025",
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
  id: "emt-trauma-026",
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
  id: "emt-trauma-027",
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
  id: "emt-trauma-028",
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
  id: "emt-trauma-029",
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
  id: "emt-trauma-030",
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
  id: "emt-trauma-031",
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

  {
  id: "emt-airway-050",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-cardiology-028",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-ops-007",
  domain: "EMS Operations",
  level: "EMT",
  blueprintCategory: "operations",
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
  id: "emt-airway-051",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-cardiology-029",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-ops-008",
  domain: "EMS Operations",
  level: "EMT",
  blueprintCategory: "operations",
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
  id: "emt-airway-052",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-cardiology-030",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-ops-009",
  domain: "EMS Operations",
  level: "EMT",
  blueprintCategory: "operations",
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
  id: "emt-airway-053",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
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
  id: "emt-cardiology-031",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-ops-010",
  domain: "EMS Operations",
  level: "EMT",
  blueprintCategory: "operations",
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
  id: "emt-airway-054",
  domain: "Airway",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-cardiology-032",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
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
  id: "emt-ops-011",
  domain: "EMS Operations",
  level: "EMT",
  blueprintCategory: "operations",
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

  {
  id: "emt-ops-012",
  domain: "EMS Operations",
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
  id: "emt-ops-013",
  domain: "EMS Operations",
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
  id: "emt-ops-014",
  domain: "EMS Operations",
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
  id: "emt-ops-015",
  domain: "EMS Operations",
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
  id: "emt-ops-016",
  domain: "EMS Operations",
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
  id: "emt-ops-017",
  domain: "EMS Operations",
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
  id: "emt-ops-018",
  domain: "EMS Operations",
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
  id: "emt-ops-019",
  domain: "EMS Operations",
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
  id: "emt-ops-020",
  domain: "EMS Operations",
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
  id: "emt-ops-021",
  domain: "EMS Operations",
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
  id: "emt-ops-022",
  domain: "EMS Operations",
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
  id: "emt-ops-023",
  domain: "EMS Operations",
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
  id: "emt-ops-024",
  domain: "EMS Operations",
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
  id: "emt-ops-025",
  domain: "EMS Operations",
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
  id: "emt-ops-026",
  domain: "EMS Operations",
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
  id: "emt-ops-027",
  domain: "EMS Operations",
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
  id: "emt-ops-028",
  domain: "EMS Operations",
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
  id: "emt-ops-029",
  domain: "EMS Operations",
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
  id: "emt-ops-030",
  domain: "EMS Operations",
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
  id: "emt-ops-031",
  domain: "EMS Operations",
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
  id: "emt-ops-032",
  domain: "EMS Operations",
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
  id: "emt-ops-033",
  domain: "EMS Operations",
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
  id: "emt-ops-034",
  domain: "EMS Operations",
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
  id: "emt-ops-035",
  domain: "EMS Operations",
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
  id: "emt-ops-036",
  domain: "EMS Operations",
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
  id: "emt-ops-037",
  domain: "EMS Operations",
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
  id: "emt-ops-038",
  domain: "EMS Operations",
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
  id: "emt-ops-039",
  domain: "EMS Operations",
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
  id: "emt-ops-040",
  domain: "EMS Operations",
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
  id: "emt-ops-041",
  domain: "EMS Operations",
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
  id: "emt-ops-042",
  domain: "EMS Operations",
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
  id: "emt-ops-043",
  domain: "EMS Operations",
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
  id: "emt-ops-044",
  domain: "EMS Operations",
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
  id: "emt-ops-045",
  domain: "EMS Operations",
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
  id: "emt-ops-046",
  domain: "EMS Operations",
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
  id: "emt-ops-047",
  domain: "EMS Operations",
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
  id: "emt-ops-048",
  domain: "EMS Operations",
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
  id: "emt-ops-049",
  domain: "EMS Operations",
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
  id: "emt-ops-050",
  domain: "EMS Operations",
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
  id: "emt-ops-051",
  domain: "EMS Operations",
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
  id: "emt-ops-052",
  domain: "EMS Operations",
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
  id: "emt-ops-053",
  domain: "EMS Operations",
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
  id: "emt-ops-054",
  domain: "EMS Operations",
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
  id: "emt-ops-055",
  domain: "EMS Operations",
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
  id: "emt-ops-056",
  domain: "EMS Operations",
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
  id: "emt-ops-057",
  domain: "EMS Operations",
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
  id: "emt-ops-058",
  domain: "EMS Operations",
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
  id: "emt-ops-059",
  domain: "EMS Operations",
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
  id: "emt-ops-060",
  domain: "EMS Operations",
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
  id: "emt-ops-061",
  domain: "EMS Operations",
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
  id: "emt-ops-062",
  domain: "EMS Operations",
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
  id: "emt-ops-063",
  domain: "EMS Operations",
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
  id: "emt-ops-064",
  domain: "EMS Operations",
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
  id: "emt-ops-065",
  domain: "EMS Operations",
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
  id: "emt-ops-066",
  domain: "EMS Operations",
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
  id: "emt-ops-067",
  domain: "EMS Operations",
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
  id: "emt-ops-068",
  domain: "EMS Operations",
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
  id: "emt-ops-069",
  domain: "EMS Operations",
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
  id: "emt-ops-070",
  domain: "EMS Operations",
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
  id: "emt-ops-071",
  domain: "EMS Operations",
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
  id: "emt-ops-072",
  domain: "EMS Operations",
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
  id: "emt-ops-073",
  domain: "EMS Operations",
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
  id: "emt-ops-074",
  domain: "EMS Operations",
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
  id: "emt-ops-075",
  domain: "EMS Operations",
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
  id: "emt-ops-076",
  domain: "EMS Operations",
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
  id: "emt-ops-077",
  domain: "EMS Operations",
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
  id: "emt-ops-078",
  domain: "EMS Operations",
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
  id: "emt-ops-079",
  domain: "EMS Operations",
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
  id: "emt-ops-080",
  domain: "EMS Operations",
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
  id: "emt-ops-081",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-082",
  domain: "EMS Operations",
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
  id: "emt-ops-083",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-084",
  domain: "EMS Operations",
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
  id: "emt-ops-085",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-086",
  domain: "EMS Operations",
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
  id: "emt-ops-087",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-088",
  domain: "EMS Operations",
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
  id: "emt-ops-089",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-090",
  domain: "EMS Operations",
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
  id: "emt-ops-091",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-092",
  domain: "EMS Operations",
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
  id: "emt-ops-093",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-094",
  domain: "EMS Operations",
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
  id: "emt-ops-095",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-096",
  domain: "EMS Operations",
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
  id: "emt-ops-097",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-098",
  domain: "EMS Operations",
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
  id: "emt-ops-099",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-100",
  domain: "EMS Operations",
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
  id: "emt-ops-101",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-102",
  domain: "EMS Operations",
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
  id: "emt-ops-103",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-104",
  domain: "EMS Operations",
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
  id: "emt-ops-105",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-106",
  domain: "EMS Operations",
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
  id: "emt-ops-107",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-108",
  domain: "EMS Operations",
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
  id: "emt-ops-109",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-110",
  domain: "EMS Operations",
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
  id: "emt-ops-111",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-112",
  domain: "EMS Operations",
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
  id: "emt-ops-113",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-114",
  domain: "EMS Operations",
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
  id: "emt-ops-115",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-116",
  domain: "EMS Operations",
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
  id: "emt-ops-117",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-118",
  domain: "EMS Operations",
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
  id: "emt-ops-119",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-120",
  domain: "EMS Operations",
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
  id: "emt-ops-121",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-122",
  domain: "EMS Operations",
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
  id: "emt-ops-123",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-124",
  domain: "EMS Operations",
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
  id: "emt-ops-125",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-126",
  domain: "EMS Operations",
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
  id: "emt-ops-127",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-128",
  domain: "EMS Operations",
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
  id: "emt-ops-129",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-130",
  domain: "EMS Operations",
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
  id: "emt-ops-131",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-132",
  domain: "EMS Operations",
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
  id: "emt-ops-133",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-134",
  domain: "EMS Operations",
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
  id: "emt-ops-135",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-136",
  domain: "EMS Operations",
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
  id: "emt-ops-137",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-138",
  domain: "EMS Operations",
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
  id: "emt-ops-139",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-140",
  domain: "EMS Operations",
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
  id: "emt-ops-141",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-142",
  domain: "EMS Operations",
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
  id: "emt-ops-143",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-144",
  domain: "EMS Operations",
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
  id: "emt-ops-145",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-146",
  domain: "EMS Operations",
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
  id: "emt-ops-147",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-148",
  domain: "EMS Operations",
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
  id: "emt-ops-149",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-150",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-151",
  domain: "EMS Operations",
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
  id: "emt-ops-152",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-153",
  domain: "EMS Operations",
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
  id: "emt-ops-154",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-155",
  domain: "EMS Operations",
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
  id: "emt-ops-156",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-157",
  domain: "EMS Operations",
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
  id: "emt-ops-158",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-159",
  domain: "EMS Operations",
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
  id: "emt-ops-160",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-161",
  domain: "EMS Operations",
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
  id: "emt-ops-162",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-163",
  domain: "EMS Operations",
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
  id: "emt-ops-164",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-165",
  domain: "EMS Operations",
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
  id: "emt-ops-166",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-167",
  domain: "EMS Operations",
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
  id: "emt-ops-168",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-169",
  domain: "EMS Operations",
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
  id: "emt-ops-170",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-171",
  domain: "EMS Operations",
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
  id: "emt-ops-172",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-173",
  domain: "EMS Operations",
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
  id: "emt-ops-174",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-175",
  domain: "EMS Operations",
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
  id: "emt-ops-176",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-177",
  domain: "EMS Operations",
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
  id: "emt-ops-178",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-179",
  domain: "EMS Operations",
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
  id: "emt-ops-180",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-181",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-182",
  domain: "EMS Operations",
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
  id: "emt-ops-183",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-184",
  domain: "EMS Operations",
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
  id: "emt-ops-185",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-186",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-187",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-188",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-189",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-190",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-191",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-192",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-193",
  domain: "EMS Operations",
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

  {
  id: "emt-ops-194",
  domain: "EMS Operations",
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

  {
    id: "emt-ops-195",
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
    id: "emt-ops-196",
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

  {
    id: "emt-ops-197",
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
    id: "emt-ops-198",
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

  {
    id: "emt-ops-199",
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
    id: "emt-ops-200",
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

  {
    id: "emt-ops-201",
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
    id: "emt-ops-202",
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

  {
    id: "emt-ops-203",
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
    id: "emt-ops-204",
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

  {
    id: "emt-ops-205",
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
    id: "emt-ops-206",
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

  {
    id: "emt-ops-207",
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
    id: "emt-ops-208",
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

  {
    id: "emt-ops-209",
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
    id: "emt-ops-210",
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

  {
    id: "emt-ops-211",
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
    id: "emt-ops-212",
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

  {
    id: "emt-ops-213",
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
    id: "emt-ops-214",
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

  {
    id: "emt-ops-215",
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
    id: "emt-ops-216",
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

  {
    id: "emt-ops-217",
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
    id: "emt-ops-218",
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

  {
    id: "emt-ops-219",
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
    id: "emt-ops-220",
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

  {
    id: "emt-ops-221",
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
    id: "emt-ops-222",
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

  {
    id: "emt-ops-223",
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
    id: "emt-ops-224",
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

  {
    id: "emt-ops-225",
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
    id: "emt-ops-226",
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

  {
    id: "emt-ops-227",
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
    id: "emt-ops-228",
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

  {
    id: "emt-ops-229",
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
    id: "emt-ops-230",
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

  {
    id: "emt-ops-231",
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
    id: "emt-ops-232",
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

  {
    id: "emt-ops-233",
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
    id: "emt-ops-234",
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

  {
    id: "emt-ops-235",
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
    id: "emt-ops-236",
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

  {
    id: "emt-ops-237",
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
    id: "emt-ops-238",
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

  {
    id: "emt-ops-239",
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
    id: "emt-ops-240",
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

  {
    id: "emt-ops-241",
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
    id: "emt-ops-242",
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

  {
    id: "emt-ops-243",
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
    id: "emt-ops-244",
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

  {
    id: "emt-ops-245",
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
    id: "emt-ops-246",
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

  {
    id: "emt-ops-247",
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
    id: "emt-ops-248",
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

  {
    id: "emt-ops-249",
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
    id: "emt-ops-250",
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

  {
    id: "emt-ops-251",
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
    id: "emt-ops-252",
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

  {
    id: "emt-ops-253",
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
    id: "emt-ops-254",
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

  {
    id: "emt-ops-255",
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
    id: "emt-ops-256",
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

  {
    id: "emt-ops-257",
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
    id: "emt-ops-258",
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

  {
    id: "emt-ops-259",
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
    id: "emt-ops-260",
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

  {
    id: "emt-ops-261",
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
    id: "emt-ops-262",
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

  {
    id: "emt-ops-263",
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
    id: "emt-ops-264",
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

  {
    id: "emt-ops-265",
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
    id: "emt-ops-266",
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

  {
    id: "emt-ops-267",
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
    id: "emt-ops-268",
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

  {
    id: "emt-ops-269",
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
    id: "emt-ops-270",
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

  {
    id: "emt-ops-271",
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
    id: "emt-ops-272",
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

  {
    id: "emt-ops-273",
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
    id: "emt-ops-274",
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
  },

  {
    id: "emt-ops-275",
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
    id: "emt-ops-276",
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

  {
    id: "emt-ops-277",
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
    id: "emt-ops-278",
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

  {
    id: "emt-ops-279",
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
    id: "emt-ops-280",
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

  {
    id: "emt-ops-281",
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
    id: "emt-ops-282",
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

  {
    id: "emt-ops-283",
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
    id: "emt-ops-284",
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

  {
    id: "emt-medical-013",
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
    id: "emt-medical-014",
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

  {
    id: "emt-ops-285",
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
    id: "emt-ops-286",
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

  {
    id: "emt-ops-287",
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
    id: "emt-ops-288",
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

  {
    id: "emt-ops-289",
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
    id: "emt-ops-290",
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

  {
    id: "emt-cardiology-033",
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
    id: "emt-cardiology-034",
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

  {
    id: "emt-medical-015",
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
    id: "emt-medical-016",
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

  {
    id: "emt-ops-291",
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
    id: "emt-ops-292",
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
  },

  {
    id: "emt-ops-293",
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
    id: "emt-ops-294",
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
    id: "emt-ops-295",
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
    id: "emt-ops-296",
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
    id: "emt-ops-297",
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
    id: "emt-ops-298",
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
    id: "emt-ops-299",
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
    id: "emt-ops-300",
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
    id: "emt-ops-301",
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
    id: "emt-ops-302",
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
    id: "emt-ops-303",
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
    id: "emt-ops-304",
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
    id: "emt-ops-305",
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
    id: "emt-ops-306",
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
    id: "emt-ops-307",
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
    id: "emt-ops-308",
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
    id: "emt-ops-309",
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
    id: "emt-ops-310",
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
    id: "emt-ops-311",
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
    id: "emt-ops-312",
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
    id: "emt-ops-313",
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
    id: "emt-ops-314",
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
    id: "emt-ops-315",
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
    id: "emt-ops-316",
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
    id: "emt-ops-317",
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
    id: "emt-ops-318",
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
    id: "emt-ops-319",
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
    id: "emt-ops-320",
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
    id: "emt-ops-321",
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
    id: "emt-ops-322",
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
    id: "emt-ops-323",
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
    id: "emt-ops-324",
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

  {
    id: "emt-airway-055",
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
    id: "emt-airway-056",
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
    id: "emt-airway-057",
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
    id: "emt-airway-058",
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
    id: "emt-airway-059",
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
    id: "emt-airway-060",
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
    id: "emt-airway-061",
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
    id: "emt-airway-062",
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
    id: "emt-airway-063",
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
    id: "emt-airway-064",
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
    id: "emt-airway-065",
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
    id: "emt-airway-066",
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
    id: "emt-airway-067",
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
    id: "emt-airway-068",
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
    id: "emt-airway-069",
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
    id: "emt-airway-070",
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
    id: "emt-airway-071",
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
    id: "emt-airway-072",
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
    id: "emt-airway-073",
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
    id: "emt-airway-074",
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
    id: "emt-airway-075",
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

  {
    id: "emt-cardiology-035",
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
    id: "emt-cardiology-036",
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
    id: "emt-cardiology-037",
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
    id: "emt-cardiology-038",
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
    id: "emt-cardiology-039",
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
    id: "emt-cardiology-040",
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
    id: "emt-cardiology-041",
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
    id: "emt-cardiology-042",
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
    id: "emt-cardiology-043",
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
    id: "emt-cardiology-044",
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
    id: "emt-cardiology-045",
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
    id: "emt-cardiology-046",
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
    id: "emt-cardiology-047",
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
    id: "emt-cardiology-048",
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
    id: "emt-cardiology-049",
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
    id: "emt-cardiology-050",
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
    id: "emt-cardiology-051",
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
    id: "emt-cardiology-052",
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
    id: "emt-cardiology-053",
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
    id: "emt-cardiology-054",
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

  {
    id: "emt-medical-017",
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
    id: "emt-medical-018",
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
    id: "emt-medical-019",
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
    id: "emt-medical-020",
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
    id: "emt-medical-021",
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
    id: "emt-medical-022",
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
    id: "emt-medical-023",
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
    id: "emt-medical-024",
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
    id: "emt-medical-025",
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

  {
    id: "emt-ops-325",
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
    id: "emt-ops-326",
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
    id: "emt-ops-327",
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
    id: "emt-ops-328",
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
    id: "emt-ops-329",
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
    id: "emt-airway-076",
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
    id: "emt-airway-077",
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
    id: "emt-airway-078",
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
    id: "emt-airway-079",
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
    id: "emt-cardiology-055",
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
    id: "emt-cardiology-056",
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
    id: "emt-cardiology-057",
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
    id: "emt-cardiology-058",
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
    id: "emt-medical-026",
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
    id: "emt-medical-027",
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
    id: "emt-medical-028",
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
    id: "emt-medical-029",
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
    id: "emt-medical-030",
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
    id: "emt-medical-031",
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
    id: "emt-medical-032",
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
    id: "emt-medical-033",
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
    id: "emt-medical-034",
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
    id: "emt-medical-035",
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
    id: "emt-medical-036",
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
    id: "emt-medical-037",
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
    id: "emt-medical-038",
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
    id: "emt-medical-039",
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
    id: "emt-medical-040",
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
    id: "emt-medical-041",
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
    id: "emt-medical-042",
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
    id: "emt-medical-043",
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
    id: "emt-medical-044",
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
    id: "emt-medical-045",
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
    id: "emt-medical-046",
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
    id: "emt-medical-047",
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
    id: "emt-medical-048",
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
    id: "emt-medical-049",
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
    id: "emt-medical-050",
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

  {
    id: "emt-trauma-032",
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
    id: "emt-trauma-033",
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
    id: "emt-trauma-034",
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
    id: "emt-trauma-035",
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
    id: "emt-cardiology-059",
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
    id: "emt-cardiology-060",
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
    id: "emt-medical-051",
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
    id: "emt-medical-052",
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
    id: "emt-airway-080",
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
    id: "emt-airway-081",
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
    id: "emt-trauma-036",
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
    id: "emt-trauma-037",
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
    id: "emt-medical-053",
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
    id: "emt-medical-054",
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
    id: "emt-medical-055",
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
    id: "emt-medical-056",
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

  {
    id: "emt-medical-057",
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
    id: "emt-medical-058",
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
    id: "emt-cardiology-061",
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
    id: "emt-cardiology-062",
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
    id: "emt-cardiology-063",
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
    id: "emt-cardiology-064",
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
    id: "emt-cardiology-065",
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
    id: "emt-cardiology-066",
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
    id: "emt-cardiology-067",
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
    id: "emt-cardiology-068",
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
    id: "emt-trauma-038",
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
    id: "emt-trauma-039",
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
    id: "emt-ops-330",
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
    id: "emt-ops-331",
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

  {
    id: "emt-medical-059",
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
    id: "emt-medical-060",
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
    id: "emt-medical-061",
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
    id: "emt-medical-062",
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
    id: "emt-medical-063",
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
    id: "emt-medical-064",
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
    id: "emt-medical-065",
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
    id: "emt-medical-066",
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
    id: "emt-medical-067",
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
    id: "emt-medical-068",
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

  {
    id: "emt-airway-082",
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
    id: "emt-airway-083",
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
    id: "emt-medical-069",
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
    id: "emt-medical-070",
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
    id: "emt-medical-071",
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
    id: "emt-medical-072",
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
    id: "emt-medical-073",
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
    id: "emt-medical-074",
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
    id: "emt-cardiology-069",
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
    id: "emt-cardiology-070",
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
    id: "emt-trauma-040",
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
    id: "emt-trauma-041",
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
    id: "emt-trauma-042",
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
    id: "emt-trauma-043",
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

  {
    id: "emt-cardiology-071",
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
    id: "emt-cardiology-072",
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
    id: "emt-trauma-044",
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
    id: "emt-trauma-045",
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
    id: "emt-medical-075",
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
    id: "emt-medical-076",
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
    id: "emt-cardiology-073",
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
    id: "emt-cardiology-074",
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
    id: "emt-medical-077",
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
    id: "emt-medical-078",
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
    id: "emt-medical-079",
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
    id: "emt-medical-080",
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
    id: "emt-trauma-046",
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
    id: "emt-trauma-047",
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
    id: "emt-cardiology-075",
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
    id: "emt-cardiology-076",
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
    id: "emt-medical-081",
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
    id: "emt-medical-082",
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

  {
    id: "emt-medical-083",
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
    id: "emt-medical-084",
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
    id: "emt-airway-084",
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
    id: "emt-airway-085",
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
    id: "emt-medical-085",
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
    id: "emt-medical-086",
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
    id: "emt-medical-087",
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
    id: "emt-medical-088",
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
    id: "emt-medical-089",
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
    id: "emt-medical-090",
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

  {
    id: "emt-trauma-048",
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
    id: "emt-trauma-049",
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
    id: "emt-medical-091",
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
    id: "emt-medical-092",
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
    id: "emt-medical-093",
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
    id: "emt-medical-094",
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
    id: "emt-medical-095",
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
    id: "emt-medical-096",
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
    id: "emt-medical-097",
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
    id: "emt-medical-098",
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

  {
    id: "emt-medical-099",
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
    id: "emt-medical-100",
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
    id: "emt-trauma-050",
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
    id: "emt-trauma-051",
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
    id: "emt-medical-101",
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
    id: "emt-medical-102",
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
    id: "emt-cardiology-077",
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
    id: "emt-cardiology-078",
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
    id: "emt-medical-103",
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
    id: "emt-medical-104",
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
    id: "emt-cardiology-079",
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
    id: "emt-cardiology-080",
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

  {
    id: "emt-cardiology-081",
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
    id: "emt-cardiology-082",
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
    id: "emt-cardiology-083",
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
    id: "emt-cardiology-084",
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
    id: "emt-cardiology-085",
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
    id: "emt-cardiology-086",
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
    id: "emt-cardiology-087",
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
    id: "emt-cardiology-088",
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
    id: "emt-trauma-052",
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
    id: "emt-trauma-053",
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
    id: "emt-medical-105",
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
    id: "emt-medical-106",
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
    id: "emt-medical-107",
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
    id: "emt-medical-108",
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

  {
    id: "emt-medical-109",
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
    id: "emt-medical-110",
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
    id: "emt-medical-111",
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
    id: "emt-medical-112",
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
    id: "emt-trauma-054",
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
    id: "emt-trauma-055",
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
    id: "emt-medical-113",
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
    id: "emt-medical-114",
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
    id: "emt-trauma-056",
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
    id: "emt-trauma-057",
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
    id: "emt-trauma-058",
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
    id: "emt-trauma-059",
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

  {
    id: "emt-medical-115",
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
    id: "emt-medical-116",
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
    id: "emt-medical-117",
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
    id: "emt-medical-118",
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
    id: "emt-airway-086",
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
    id: "emt-airway-087",
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
    id: "emt-medical-119",
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
    id: "emt-medical-120",
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
    id: "emt-medical-121",
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
    id: "emt-medical-122",
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

  {
    id: "emt-trauma-060",
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
    id: "emt-trauma-061",
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
    id: "emt-medical-123",
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
    id: "emt-medical-124",
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
    id: "emt-ops-332",
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
    id: "emt-ops-333",
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
    id: "emt-cardiology-089",
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
    id: "emt-cardiology-090",
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
    id: "emt-trauma-062",
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
    id: "emt-trauma-063",
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
    id: "emt-trauma-064",
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
    id: "emt-trauma-065",
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
    id: "emt-trauma-066",
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
    id: "emt-trauma-067",
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
    id: "emt-trauma-068",
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
    id: "emt-trauma-069",
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

  {
    id: "emt-medical-125",
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
    id: "emt-medical-126",
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
    id: "emt-medical-127",
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
    id: "emt-medical-128",
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
    id: "emt-trauma-070",
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
    id: "emt-trauma-071",
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
    id: "emt-medical-129",
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
    id: "emt-medical-130",
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
    id: "emt-medical-131",
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
    id: "emt-medical-132",
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
    id: "emt-medical-133",
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
    id: "emt-medical-134",
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

  {
    id: "emt-cardiology-091",
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
    id: "emt-cardiology-092",
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
    id: "emt-cardiology-093",
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
    id: "emt-cardiology-094",
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
    id: "emt-medical-135",
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
    id: "emt-medical-136",
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
    id: "emt-cardiology-095",
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
    id: "emt-cardiology-096",
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
    id: "emt-medical-137",
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
    id: "emt-medical-138",
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
    id: "emt-trauma-072",
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
    id: "emt-trauma-073",
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
    id: "emt-medical-139",
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
    id: "emt-medical-140",
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
    id: "emt-trauma-074",
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
    id: "emt-trauma-075",
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

  {
    id: "emt-airway-088",
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
    id: "emt-airway-089",
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
    id: "emt-cardiology-097",
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
    id: "emt-cardiology-098",
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
    id: "emt-trauma-076",
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
    id: "emt-trauma-077",
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
    id: "emt-trauma-078",
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
    id: "emt-trauma-079",
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
    id: "emt-cardiology-099",
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
    id: "emt-cardiology-100",
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
    id: "emt-trauma-080",
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
    id: "emt-trauma-081",
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
    id: "emt-cardiology-101",
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
    id: "emt-cardiology-102",
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

  {
    id: "emt-trauma-082",
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
    id: "emt-trauma-083",
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
    id: "emt-medical-141",
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
    id: "emt-medical-142",
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
    id: "emt-medical-143",
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
    id: "emt-medical-144",
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
    id: "emt-ops-334",
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
    id: "emt-ops-335",
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
    id: "emt-medical-145",
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
    id: "emt-medical-146",
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
    id: "emt-trauma-084",
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
    id: "emt-trauma-085",
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
    id: "emt-cardiology-103",
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
    id: "emt-cardiology-104",
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
    id: "emt-medical-147",
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
    id: "emt-medical-148",
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
    id: "emt-cardiology-105",
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
    id: "emt-cardiology-106",
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
    id: "emt-airway-090",
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
    id: "emt-airway-091",
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

  {
    id: "emt-medical-149",
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
    id: "emt-medical-150",
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
    id: "emt-medical-151",
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
    id: "emt-medical-152",
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
    id: "emt-medical-153",
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
    id: "emt-medical-154",
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
    id: "emt-medical-155",
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
    id: "emt-medical-156",
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
    id: "emt-medical-157",
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
    id: "emt-medical-158",
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

  {
    id: "emt-airway-092",
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
    id: "emt-airway-093",
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
    id: "emt-cardiology-107",
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
    id: "emt-trauma-086",
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
    id: "emt-medical-159",
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
    id: "emt-medical-160",
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
    id: "emt-cardiology-108",
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
    id: "emt-medical-161",
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
    id: "emt-trauma-087",
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
    id: "emt-medical-162",
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
    id: "emt-medical-163",
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
    id: "emt-cardiology-109",
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
    id: "emt-cardiology-110",
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
    id: "emt-cardiology-111",
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
    id: "emt-cardiology-112",
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
    id: "emt-cardiology-113",
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
    id: "emt-trauma-088",
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
    id: "emt-trauma-089",
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
  },

  {
    id: "emt-cardiology-114",
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
    id: "emt-cardiology-115",
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
    id: "emt-cardiology-116",
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
    id: "emt-cardiology-117",
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
    id: "emt-cardiology-118",
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

  {
    id: "emt-cardiology-119",
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
    id: "emt-cardiology-120",
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
    id: "emt-cardiology-121",
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
    id: "emt-cardiology-122",
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
    id: "emt-cardiology-123",
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
    id: "emt-cardiology-124",
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

  {
    id: "emt-cardiology-125",
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
    id: "emt-cardiology-126",
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
    id: "emt-cardiology-127",
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
    id: "emt-cardiology-128",
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
    id: "emt-cardiology-129",
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
    id: "emt-cardiology-130",
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
    id: "emt-cardiology-131",
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
    id: "emt-cardiology-132",
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
    id: "emt-cardiology-133",
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
    id: "emt-cardiology-134",
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
    id: "emt-cardiology-135",
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

  {
    id: "emt-cardiology-136",
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
    id: "emt-cardiology-137",
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
    id: "emt-cardiology-138",
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

  {
    id: "emt-cardiology-139",
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
    id: "emt-cardiology-140",
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
    id: "emt-cardiology-141",
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
    id: "emt-cardiology-142",
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
    id: "emt-cardiology-143",
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
    id: "emt-cardiology-144",
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
    id: "emt-cardiology-145",
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
    id: "emt-cardiology-146",
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
    id: "emt-cardiology-147",
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
    id: "emt-cardiology-148",
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

  {
    id: "emt-cardiology-149",
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
    id: "emt-cardiology-150",
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
    id: "emt-cardiology-151",
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
    id: "emt-cardiology-152",
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
    id: "emt-cardiology-153",
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
    id: "emt-cardiology-154",
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
    id: "emt-cardiology-155",
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
    id: "emt-cardiology-156",
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
    id: "emt-cardiology-157",
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
    id: "emt-cardiology-158",
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

  {
    id: "emt-cardiology-159",
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
    id: "emt-cardiology-160",
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
    id: "emt-cardiology-161",
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
    id: "emt-cardiology-162",
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
    id: "emt-cardiology-163",
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
    id: "emt-cardiology-164",
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
    id: "emt-cardiology-165",
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

  {
    id: "emt-cardiology-166",
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
    id: "emt-cardiology-167",
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
    id: "emt-cardiology-168",
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

  {
    id: "emt-cardiology-169",
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
    id: "emt-cardiology-170",
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
    id: "emt-cardiology-171",
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

  {
    id: "emt-cardiology-172",
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
    id: "emt-cardiology-173",
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

  {
    id: "emt-cardiology-174",
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
    id: "emt-cardiology-175",
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

  {
    id: "emt-cardiology-176",
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

  {
    id: "emt-cardiology-177",
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

  {
    id: "emt-cardiology-178",
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
    id: "emt-cardiology-179",
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
    id: "emt-cardiology-180",
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
    id: "emt-cardiology-181",
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
    id: "emt-cardiology-182",
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
    id: "emt-cardiology-183",
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
    id: "emt-cardiology-184",
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
    id: "emt-cardiology-185",
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
    id: "emt-cardiology-186",
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
    id: "emt-cardiology-187",
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
    id: "emt-cardiology-188",
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
    id: "emt-cardiology-189",
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
    id: "emt-cardiology-190",
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
    id: "emt-cardiology-191",
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
    id: "emt-cardiology-192",
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
    id: "emt-cardiology-193",
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
    id: "emt-cardiology-194",
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
    id: "emt-cardiology-195",
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
    id: "emt-cardiology-196",
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
    id: "emt-cardiology-197",
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
    id: "emt-cardiology-198",
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
    id: "emt-cardiology-199",
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
    id: "emt-cardiology-200",
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
    id: "emt-cardiology-201",
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
    id: "emt-cardiology-202",
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
    id: "emt-cardiology-203",
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
    id: "emt-cardiology-204",
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
    id: "emt-cardiology-205",
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
    id: "emt-cardiology-206",
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
    id: "emt-cardiology-207",
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
    id: "emt-cardiology-208",
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
    id: "emt-cardiology-209",
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
    id: "emt-cardiology-210",
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
    id: "emt-cardiology-211",
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
    id: "emt-cardiology-212",
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
    id: "emt-cardiology-213",
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
    id: "emt-cardiology-214",
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
    id: "emt-cardiology-215",
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
    id: "emt-cardiology-216",
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
    id: "emt-cardiology-217",
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
  },

  {
    id: "emt-cardiology-218",
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
    id: "emt-cardiology-219",
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
    id: "emt-cardiology-220",
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
    id: "emt-cardiology-221",
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
    id: "emt-cardiology-222",
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
    id: "emt-cardiology-223",
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
    id: "emt-cardiology-224",
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
    id: "emt-cardiology-225",
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

  {
    id: "emt-cardiology-226",
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
    id: "emt-cardiology-227",
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
    id: "emt-cardiology-228",
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
    id: "emt-cardiology-229",
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
    id: "emt-cardiology-230",
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
    id: "emt-cardiology-231",
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

  {
    id: "emt-cardiology-232",
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
    id: "emt-cardiology-233",
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
    id: "emt-cardiology-234",
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
    id: "emt-cardiology-235",
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
    id: "emt-cardiology-236",
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
    id: "emt-cardiology-237",
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
    id: "emt-cardiology-238",
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
    id: "emt-cardiology-239",
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
    id: "emt-cardiology-240",
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
    id: "emt-cardiology-241",
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
    id: "emt-cardiology-242",
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
    id: "emt-cardiology-243",
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
    id: "emt-cardiology-244",
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
    id: "emt-cardiology-245",
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

  {
    id: "emt-cardiology-246",
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
    id: "emt-cardiology-247",
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
    id: "emt-cardiology-248",
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
    id: "emt-cardiology-249",
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
    id: "emt-cardiology-250",
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
    id: "emt-cardiology-251",
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
    id: "emt-cardiology-252",
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
    id: "emt-cardiology-253",
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
    id: "emt-cardiology-254",
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
    id: "emt-cardiology-255",
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
    id: "emt-cardiology-256",
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
    id: "emt-cardiology-257",
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
    id: "emt-cardiology-258",
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

  {
    id: "emt-cardiology-259",
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
    id: "emt-cardiology-260",
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
    id: "emt-cardiology-261",
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
    id: "emt-cardiology-262",
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
    id: "emt-cardiology-263",
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
    id: "emt-cardiology-264",
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
    id: "emt-cardiology-265",
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
    id: "emt-cardiology-266",
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
    id: "emt-cardiology-267",
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

  {
    id: "emt-cardiology-268",
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
    id: "emt-cardiology-269",
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
    id: "emt-cardiology-270",
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
    id: "emt-cardiology-271",
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
    id: "emt-cardiology-272",
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

  {
    id: "emt-cardiology-273",
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
    id: "emt-cardiology-274",
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
    id: "emt-cardiology-275",
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
    id: "emt-cardiology-276",
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
    id: "emt-cardiology-277",
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
    id: "emt-cardiology-278",
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
    id: "emt-cardiology-279",
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

  {
    id: "emt-cardiology-280",
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
    id: "emt-cardiology-281",
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
    id: "emt-cardiology-282",
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
    id: "emt-cardiology-283",
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
    id: "emt-cardiology-284",
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

  {
    id: "emt-cardiology-285",
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
    id: "emt-cardiology-286",
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
    id: "emt-cardiology-287",
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
    id: "emt-cardiology-288",
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
    id: "emt-cardiology-289",
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

  {
    id: "emt-cardiology-290",
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
    id: "emt-cardiology-291",
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
    id: "emt-cardiology-292",
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
    id: "emt-cardiology-293",
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
    id: "emt-cardiology-294",
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
    id: "emt-cardiology-295",
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
    id: "emt-cardiology-296",
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
    id: "emt-cardiology-297",
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
    id: "emt-cardiology-298",
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
    id: "emt-cardiology-299",
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
    id: "emt-cardiology-300",
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
    id: "emt-cardiology-301",
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
    id: "emt-cardiology-302",
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
    id: "emt-cardiology-303",
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
    id: "emt-cardiology-304",
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
    id: "emt-cardiology-305",
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
    id: "emt-cardiology-306",
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
    id: "emt-cardiology-307",
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
    id: "emt-cardiology-308",
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
    id: "emt-cardiology-309",
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
    id: "emt-cardiology-310",
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
    id: "emt-cardiology-311",
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
    id: "emt-cardiology-312",
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
    id: "emt-cardiology-313",
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
    id: "emt-cardiology-314",
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

  {
    id: "emt-cardiology-315",
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
    id: "emt-cardiology-316",
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
    id: "emt-cardiology-317",
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
    id: "emt-medical-164",
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
    id: "emt-medical-165",
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
    id: "emt-medical-166",
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
    id: "emt-medical-167",
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
    id: "emt-medical-168",
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
    id: "emt-medical-169",
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
    id: "emt-medical-170",
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
    id: "emt-medical-171",
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
    id: "emt-medical-172",
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
    id: "emt-medical-173",
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

  {
    id: "emt-cardiology-318",
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
    id: "emt-cardiology-319",
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
    id: "emt-cardiology-320",
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

  {
    id: "emt-airway-094",
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
    id: "emt-airway-095",
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
    id: "emt-airway-096",
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

  {
    id: "emt-medical-174",
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
    id: "emt-medical-175",
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
    id: "emt-medical-176",
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
    id: "emt-medical-177",
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
    id: "emt-medical-178",
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
    id: "emt-medical-179",
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
    id: "emt-medical-180",
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

  {
    id: "emt-medical-181",
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
    id: "emt-medical-182",
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
    id: "emt-medical-183",
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
    id: "emt-medical-184",
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
    id: "emt-medical-185",
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
    id: "emt-medical-186",
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

  {
    id: "emt-medical-187",
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
    id: "emt-medical-188",
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
    id: "emt-medical-189",
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
    id: "emt-medical-190",
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
    id: "emt-medical-191",
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
    id: "emt-medical-192",
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
    id: "emt-medical-193",
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
    id: "emt-medical-194",
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

  {
    id: "emt-medical-195",
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
    id: "emt-medical-196",
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

  {
    id: "emt-medical-197",
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
    id: "emt-medical-198",
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
    id: "emt-medical-199",
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
    id: "emt-airway-097",
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

  {
    id: "emt-ops-336",
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
    id: "emt-ops-337",
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
    id: "emt-medical-200",
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
    id: "emt-medical-201",
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
    id: "emt-medical-202",
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

  {
    id: "emt-ops-338",
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
    id: "emt-ops-339",
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

  {
    id: "emt-medical-203",
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
    id: "emt-medical-204",
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
    id: "emt-medical-205",
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
    id: "emt-medical-206",
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

  {
    id: "emt-medical-207",
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
    id: "emt-airway-098",
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
    id: "emt-medical-208",
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
    id: "emt-medical-209",
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

  {
    id: "emt-medical-210",
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
    id: "emt-medical-211",
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
    id: "emt-medical-212",
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
    id: "emt-medical-213",
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

  {
    id: "emt-medical-214",
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
    id: "emt-airway-099",
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

  {
    id: "emt-airway-100",
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
    id: "emt-airway-101",
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
    id: "emt-medical-215",
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

  {
    id: "emt-airway-102",
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

  {
    id: "emt-medical-216",
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

  {
    id: "emt-medical-217",
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
    id: "emt-medical-218",
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

  {
    id: "emt-ops-340",
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
    id: "emt-ops-341",
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
    id: "emt-ops-342",
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

  {
    id: "emt-medical-219",
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
    id: "emt-medical-220",
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
    id: "emt-medical-221",
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
    id: "emt-medical-222",
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
    id: "emt-medical-223",
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
    id: "emt-medical-224",
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
    id: "emt-medical-225",
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
    id: "emt-medical-226",
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
    id: "emt-medical-227",
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
    id: "emt-medical-228",
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
    id: "emt-medical-229",
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
    id: "emt-medical-230",
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
    id: "emt-airway-103",
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
    id: "emt-airway-104",
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
    id: "emt-airway-105",
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
    id: "emt-medical-231",
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
    id: "emt-medical-232",
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
    id: "emt-medical-233",
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
    id: "emt-medical-234",
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
    id: "emt-airway-106",
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
    id: "emt-medical-235",
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
    id: "emt-medical-236",
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
    id: "emt-medical-237",
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
    id: "emt-ops-343",
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
    id: "emt-ops-344",
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
  },

  {
  id: "emt-medical-238",
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

  {
  id: "emt-medical-239",
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

  {
  id: "emt-medical-240",
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

  {
  id: "emt-medical-241",
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

  {
  id: "emt-medical-242",
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

  {
  id: "emt-medical-243",
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

  {
  id: "emt-medical-244",
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

  {
  id: "emt-medical-245",
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

  {
  id: "emt-medical-246",
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

  {
  id: "emt-medical-247",
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

  {
  id: "emt-medical-248",
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

  {
  id: "emt-medical-249",
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

  {
  id: "emt-medical-250",
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

  {
  id: "emt-medical-251",
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

  {
  id: "emt-medical-252",
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

  {
  id: "emt-medical-253",
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

  {
  id: "emt-medical-254",
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

  {
  id: "emt-medical-255",
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

  {
  id: "emt-medical-256",
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

  {
  id: "emt-medical-257",
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

  {
  id: "emt-medical-258",
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

  {
  id: "emt-medical-259",
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

  {
  id: "emt-medical-260",
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

  {
  id: "emt-medical-261",
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

  {
  id: "emt-medical-262",
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

  {
  id: "emt-medical-263",
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

  {
  id: "emt-medical-264",
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

  {
  id: "emt-medical-265",
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

  {
  id: "emt-medical-266",
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

  {
  id: "emt-medical-267",
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

  {
  id: "emt-medical-268",
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

  {
  id: "emt-medical-269",
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

  {
  id: "emt-medical-270",
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

  {
  id: "emt-medical-271",
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

  {
  id: "emt-medical-272",
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

  {
  id: "emt-medical-273",
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

  {
  id: "emt-medical-274",
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

  {
  id: "emt-medical-275",
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

  {
  id: "emt-medical-276",
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

  {
  id: "emt-medical-277",
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

  {
  id: "emt-medical-278",
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

  {
  id: "emt-medical-279",
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

  {
  id: "emt-medical-280",
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

  {
    id: "emt-ops-345",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which federal organization has played the primary federal role in funding the development of the National EMS Education Standards and the National EMS Scope of Practice Model?",
    choices: [
      "Federal Emergency Management Agency (FEMA)",
      "National Highway Traffic Safety Administration (NHTSA)",
      "Centers for Disease Control and Prevention (CDC)",
      "Department of Homeland Security (DHS)",
    ],
    answerIndex: 1,
    explanation:
      "NHTSA, through its Office of EMS within the U.S. Department of Transportation, has supported the development of major national EMS education and scope-of-practice documents. These documents establish national guidance, while states determine actual licensure and practice requirements."
  },

  {
    id: "emt-ops-346",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which organization administers the national cognitive certification examination for entry-level EMTs?",
    choices: [
      "American Heart Association",
      "National Association of EMS Educators",
      "National Registry of Emergency Medical Technicians",
      "Commission on Accreditation of Allied Health Education Programs",
    ],
    answerIndex: 2,
    explanation:
      "The National Registry of Emergency Medical Technicians, or NREMT, administers national EMS certification examinations. State licensure is a separate matter and is governed by individual states."
  },

  {
    id: "emt-ops-347",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "How many clinician levels are identified in the 2019 National EMS Scope of Practice Model?",
    choices: [
      "Two",
      "Three",
      "Four",
      "Five",
    ],
    answerIndex: 2,
    explanation:
      "The model identifies four levels: Emergency Medical Responder, Emergency Medical Technician, Advanced EMT, and Paramedic."
  },

  {
    id: "emt-ops-348",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Your crew arrives at a busy intersection after a collision involving several vehicles. Before approaching injured occupants, what should you do?",
    choices: [
      "Immediately begin triage",
      "Confirm that the scene is safe for responders and patients",
      "Call the receiving hospital",
      "Begin assigning patients to ambulances",
    ],
    answerIndex: 1,
    explanation:
      "Scene safety takes priority over patient contact. The crew should identify hazards such as traffic, unstable vehicles, fire, hazardous materials, and violence before entering the scene."
  },

  {
    id: "emt-ops-349",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "For an ordinary patient contact in which no significant splash or spray is expected, which PPE is generally the minimum requirement?",
    choices: [
      "Gloves",
      "Gloves and gown",
      "Gloves, gown, mask, and eye protection",
      "A full-body protective suit",
    ],
    answerIndex: 0,
    explanation:
      "Gloves are appropriate for routine patient contact when exposure to blood or body fluids is possible. Additional PPE should be selected according to the anticipated exposure."
  },

  {
    id: "emt-ops-350",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which lifting technique best reduces the risk of an EMS provider sustaining a back injury?",
    choices: [
      "Hold the patient away from the body to improve visibility",
      "Keep the load close and use the legs rather than bending through the back",
      "Rotate the torso while lifting",
      "Lift as quickly as possible",
    ],
    answerIndex: 1,
    explanation:
      "Safe lifting involves maintaining a stable posture, keeping the load close to the body, avoiding twisting, and using the legs to generate force."
  },

  {
    id: "emt-ops-351",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "An EMT develops persistent sleep problems, irritability, withdrawal, and other trauma-related symptoms several weeks after a particularly disturbing pediatric call. Which condition should be considered?",
    choices: [
      "A brief acute stress response",
      "Ordinary fatigue",
      "Post-traumatic stress disorder",
      "A normal response that requires no follow-up",
    ],
    answerIndex: 2,
    explanation:
      "Persistent trauma-related symptoms that continue beyond the immediate aftermath of an event can indicate PTSD. EMS personnel should seek appropriate professional assessment rather than simply ignoring these symptoms."
  },

  {
    id: "emt-ops-352",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "During START triage, a patient is able to walk to the designated ambulatory-patient area and follows instructions. What initial triage category is appropriate?",
    choices: [
      "Immediate",
      "Delayed",
      "Minor",
      "Expectant/deceased",
    ],
    answerIndex: 2,
    explanation:
      "In START, patients who can walk when instructed are initially categorized as green, or minor. They should subsequently be reassessed because their condition can change."
  },

  {
    id: "emt-ops-353",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Within the Incident Command System, who is ultimately responsible for overall incident management?",
    choices: [
      "The first EMT to arrive",
      "The Incident Commander",
      "The senior law-enforcement officer",
      "The EMS medical director",
    ],
    answerIndex: 1,
    explanation:
      "The Incident Commander has overall responsibility for managing the incident under ICS. Command may later be transferred according to established procedures."
  },

  {
    id: "emt-ops-354",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is the primary purpose of a continuous quality-improvement program within an EMS agency?",
    choices: [
      "Identify individual employees to punish for mistakes",
      "Systematically identify opportunities to improve care and operations",
      "Replace medical oversight",
      "Perform only an annual state inspection",
    ],
    answerIndex: 1,
    explanation:
      "Quality improvement is an ongoing process used to identify patterns, evaluate performance, and improve patient care and system operations. It is generally intended to be improvement-oriented rather than punitive."
  },

  {
    id: "emt-ops-355",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Who normally provides physician-level medical oversight for an EMS agency?",
    choices: [
      "The senior field EMT",
      "The agency's physician medical director",
      "The state EMS communications center",
      "The emergency department charge nurse",
    ],
    answerIndex: 1,
    explanation:
      "An EMS medical director is a physician who provides medical oversight, including development or approval of protocols and, when applicable, online medical direction."
  },

  {
    id: "emt-ops-356",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMT wants to determine whether a particular intervention is legally permitted during a call. Which sources are most directly relevant?",
    choices: [
      "The national education standards alone",
      "State law/licensure requirements and applicable medical-director-approved protocols",
      "A commercial EMT textbook",
      "An AHA textbook alone",
    ],
    answerIndex: 1,
    explanation:
      "National models provide guidance, but actual legal scope is determined through state law and regulation. EMS clinicians must also follow applicable agency protocols and medical direction."
  },

  {
    id: "emt-ops-357",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which group of capabilities was added to the EMT level through the 2021 change notices associated with the National EMS Scope of Practice Model?",
    choices: [
      "Endotracheal intubation and 12-lead interpretation",
      "IM medication administration, certain emergency vaccination activities, and nasopharyngeal specimen collection",
      "IV catheter placement and blood transfusion",
      "Surgical airway procedures",
    ],
    answerIndex: 1,
    explanation:
      "The 2021 change notices expanded the model's EMT scope in several areas, including IM medication administration, vaccination during declared public-health emergencies, and nasopharyngeal specimen collection. Actual authorization remains dependent on state and system rules."
  },

  {
    id: "emt-ops-358",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which statement best describes the purpose of a patient care report?",
    choices: [
      "It is primarily a private training worksheet",
      "It serves as a clinical, legal, continuity-of-care, and potentially billing record",
      "It is optional if the patient is transported",
      "It cannot be used in legal proceedings",
    ],
    answerIndex: 1,
    explanation:
      "The PCR documents the encounter and supports continuity of care, quality review, billing, and legal processes. It should therefore be accurate, complete, objective, and timely."
  },

  {
    id: "emt-ops-359",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which ambulance configuration uses a van chassis with the patient compartment incorporated into the van body?",
    choices: [
      "Type I",
      "Type II",
      "Type III",
      "Type IV",
    ],
    answerIndex: 1,
    explanation:
      "A Type II ambulance is based on a van-style chassis with an integrated patient compartment. Type I and Type III configurations use a separate modular patient compartment."
  },

  {
    id: "emt-ops-360",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is one important tradeoff associated with emergency ambulance response using lights and siren?",
    choices: [
      "It routinely saves more than 15 minutes",
      "It may save a relatively small amount of time while increasing crash risk",
      "It eliminates the need for traffic awareness",
      "It is federally required for every EMS response",
    ],
    answerIndex: 1,
    explanation:
      "Research has generally found that lights-and-siren response provides relatively modest time savings while increasing the risk associated with emergency vehicle operation. Agencies therefore use policies to determine when emergency response is justified."
  },

  {
    id: "emt-ops-361",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which patient would generally be the strongest candidate for consideration of helicopter EMS?",
    choices: [
      "A stable patient located a few minutes from an appropriate hospital",
      "A critically ill or injured patient for whom ground transport would create a substantial delay to definitive care",
      "A stable patient whose family simply prefers an aircraft",
      "Every patient involved in a collision",
    ],
    answerIndex: 1,
    explanation:
      "HEMS can be appropriate when the patient's condition and geography make the time or capabilities of air transport clinically advantageous. Availability of a safe landing zone and other operational factors must also be considered."
  },

  {
    id: "emt-ops-362",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Your crew encounters a vehicle collision with a downed electrical wire. What should you do?",
    choices: [
      "Push the wire away with a dry wooden object",
      "Approach once visible arcing stops",
      "Establish an appropriate safety perimeter and wait for qualified utility personnel to declare the area safe",
      "Ask the patient to exit the vehicle",
    ],
    answerIndex: 2,
    explanation:
      "A downed electrical wire should be presumed energized until qualified utility personnel establish that it is safe. EMS should maintain an appropriate exclusion area and avoid contact with the vehicle or wire."
  },

  {
    id: "emt-ops-363",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "When an EMT suspects a patient may be experiencing human trafficking, which approach is most appropriate when circumstances permit?",
    choices: [
      "Confront the suspected trafficker",
      "Ignore the concern and document nothing",
      "Attempt to speak privately with the patient and follow applicable reporting procedures",
      "Refuse to transport the patient",
    ],
    answerIndex: 2,
    explanation:
      "When safe and feasible, obtaining an opportunity to speak privately with the patient can help identify concerns. EMS personnel should document objective findings and follow applicable agency and state reporting requirements."
  },

  {
    id: "emt-ops-364",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "A vehicle involved in a crash is unstable and leaking fuel. What is the safest initial EMS action?",
    choices: [
      "Enter immediately before the vehicle catches fire",
      "Remain at a safe location and request appropriate fire/rescue resources to control the hazards",
      "Begin treatment inside the vehicle regardless of the hazard",
      "Move the vehicle yourself",
    ],
    answerIndex: 1,
    explanation:
      "An unstable vehicle and fuel leak can create significant hazards. EMS should stage at a safe location and allow appropriately trained rescue personnel to stabilize the scene before patient access."
  },

  {
    id: "emt-ops-365",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "In the SBAR communication format, what does the letter R represent?",
    choices: [
      "Reassessment",
      "Response",
      "Recommendation",
      "Resuscitation",
    ],
    answerIndex: 2,
    explanation:
      "SBAR stands for Situation, Background, Assessment, and Recommendation. It provides a structured framework for communicating important patient information."
  },

  {
    id: "emt-ops-366",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which practice is an example of effective crew resource management in EMS?",
    choices: [
      "The highest-ranking provider makes every decision without input",
      "Crew members use closed-loop communication and speak up about safety concerns",
      "Providers avoid questioning one another",
      "Only the driver is allowed to identify hazards",
    ],
    answerIndex: 1,
    explanation:
      "CRM emphasizes communication, teamwork, situational awareness, leadership, followership, and recognition of human factors. Closed-loop communication and speaking up about safety concerns can reduce preventable errors."
  },

  {
    id: "emt-ops-367",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Following a particularly difficult call, the crew participates in a peer-support discussion focused on their emotional responses and coping. What is the primary purpose of this activity?",
    choices: [
      "Determine which provider made a clinical error",
      "Support responder well-being and coping",
      "Replace the patient care report",
      "Assign blame for the incident",
    ],
    answerIndex: 1,
    explanation:
      "Peer-support and responder wellness activities are intended to help personnel process difficult experiences and identify when additional support may be needed. They are distinct from clinical case review or an operational after-action review."
  },

  {
    id: "emt-ops-368",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "An EMT accidentally sustains a needlestick injury. What should happen immediately?",
    choices: [
      "Finish the shift before reporting it",
      "Clean the exposure site promptly and report the exposure according to agency procedure",
      "Apply a tourniquet above the injury",
      "Recap and save the needle",
    ],
    answerIndex: 1,
    explanation:
      "The exposed area should be washed promptly with soap and water. Mucous-membrane exposures should be flushed. The exposure should then be reported and managed according to the agency's occupational-exposure protocol."
  },

  {
    id: "emt-ops-369",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What is the fundamental assumption behind standard precautions?",
    choices: [
      "Only visibly ill patients can transmit infection",
      "Patients with known infections are the only ones requiring PPE",
      "Blood and relevant body fluids from any patient may contain infectious material",
      "Vaccination eliminates the need for PPE",
    ],
    answerIndex: 2,
    explanation:
      "Standard precautions are based on treating potentially infectious blood and body fluids appropriately regardless of whether an infection has been identified in the patient."
  },

  {
    id: "emt-ops-370",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "An EMS crew is transporting a patient with suspected active pulmonary tuberculosis. Which respiratory protection is appropriate for the EMT?",
    choices: [
      "No respiratory protection",
      "A fit-tested N95 or higher-level respirator",
      "A cloth face covering",
      "A surgical mask worn by the EMT only",
    ],
    answerIndex: 1,
    explanation:
      "Suspected pulmonary TB requires airborne precautions. EMS personnel should use an appropriate fit-tested N95 or higher-level respirator according to infection-control policy. A source-control mask may also be placed on the patient when tolerated."
  },

  {
    id: "emt-ops-371",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "At a hazardous-materials incident, what is the name of the area where contamination may be present and access is restricted to appropriately trained personnel?",
    choices: [
      "Cold zone",
      "Warm zone",
      "Hot zone",
      "Support zone",
    ],
    answerIndex: 2,
    explanation:
      "The hot zone, also called the exclusion zone, is the area where the hazardous substance is known or suspected to be present. Entry is restricted to appropriately trained and equipped personnel."
  },

  {
    id: "emt-ops-372",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Where should EMS normally receive and treat patients who have completed appropriate decontamination at a hazardous-materials scene?",
    choices: [
      "Inside the hot zone",
      "In the warm zone before decontamination",
      "In the cold zone after appropriate decontamination",
      "Inside the ambulance before decontamination",
    ],
    answerIndex: 2,
    explanation:
      "After appropriate decontamination, patients can be transferred into the cold zone for medical evaluation and treatment. Moving contaminated patients into ambulances prematurely can spread contamination."
  },

  {
    id: "emt-ops-373",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What is a primary purpose of the U.S. Department of Transportation Emergency Response Guidebook at a hazardous-materials incident?",
    choices: [
      "Determine ambulance medication dosages",
      "Identify hazardous materials and provide initial response guidance and isolation information",
      "Assign START triage colors",
      "Calculate ambulance fuel requirements",
    ],
    answerIndex: 1,
    explanation:
      "The ERG helps first responders identify hazardous materials using information such as UN/NA identification numbers and placards and provides initial guidance regarding hazards, isolation, and protective actions."
  },

  {
    id: "emt-ops-374",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What span of control is generally recommended within ICS?",
    choices: [
      "One supervisor for 1 to 2 subordinates",
      "Approximately 3 to 7 subordinates per supervisor",
      "At least 10 subordinates per supervisor",
      "There is no recommended limit",
    ],
    answerIndex: 1,
    explanation:
      "ICS generally recommends a span of control of approximately three to seven subordinates, with five often considered an effective target."
  },

  {
    id: "emt-ops-375",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "During adult START triage, a patient remains apneic after the airway is repositioned. How is the patient initially categorized?",
    choices: [
      "Immediate",
      "Delayed",
      "Minor",
      "Expectant/deceased",
    ],
    answerIndex: 3,
    explanation:
      "In the traditional adult START algorithm, an apneic patient who does not begin breathing after airway repositioning is categorized as black. Local triage protocols should always be followed."
  },

  {
    id: "emt-ops-376",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which pediatric mass-casualty triage system modifies START to account for children?",
    choices: [
      "JumpSTART",
      "RPM-Junior",
      "SALT-Peds",
      "Pediatric START-Plus",
    ],
    answerIndex: 0,
    explanation:
      "JumpSTART is a pediatric adaptation of START. It accounts for pediatric physiology and includes modifications such as giving rescue breaths to certain apneic children before assigning a triage category."
  },

  {
    id: "emt-ops-377",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which style is most appropriate for a routine EMS radio report?",
    choices: [
      "Long and highly technical",
      "Brief, organized, and stated in clear language",
      "Limited to the patient's name",
      "Composed entirely of ten-codes",
    ],
    answerIndex: 1,
    explanation:
      "Radio reports should communicate the most important information efficiently. A structured report may include the unit identifier, patient's age and sex, chief complaint, pertinent history, assessment findings, treatment, and ETA."
  },

  {
    id: "emt-ops-378",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "How should the narrative section of an EMS patient care report generally be written?",
    choices: [
      "As personal opinions and assumptions",
      "Chronologically and objectively, distinguishing patient statements from provider observations",
      "Only as a list of vital signs",
      "With as little detail as possible",
    ],
    answerIndex: 1,
    explanation:
      "PCR narratives should accurately describe what happened in a logical sequence. Objective findings should be distinguished from patient statements, and unsupported assumptions should be avoided."
  },

  {
    id: "emt-ops-379",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "After submitting a PCR, an EMT discovers that one vital sign was entered incorrectly. What is the appropriate approach?",
    choices: [
      "Silently overwrite the original value",
      "Delete the entire report",
      "Follow the agency's amendment procedure and document the correction without concealing the original entry",
      "Ignore the mistake",
    ],
    answerIndex: 2,
    explanation:
      "Once a report has been finalized, corrections should be made through the approved amendment or addendum process. The original documentation should remain identifiable so the record maintains its integrity."
  },

  {
    id: "emt-ops-380",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which practice best represents family-centered EMS care?",
    choices: [
      "Automatically exclude family members from every patient encounter",
      "Respect patient and family perspectives while involving them appropriately in communication and decisions",
      "Allow family wishes to override all clinical considerations",
      "Avoid discussing care with family under all circumstances",
    ],
    answerIndex: 1,
    explanation:
      "Family-centered care emphasizes respectful communication, collaboration, and consideration of patient and family perspectives while maintaining appropriate clinical judgment and patient autonomy."
  },

  {
    id: "emt-ops-381",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "An EMT is caring for a patient whose cultural practices differ from the EMT's own. Which response demonstrates cultural humility?",
    choices: [
      "Assume the patient's beliefs based on their appearance",
      "Respectfully ask about relevant preferences and avoid making assumptions",
      "Refuse care when cultural practices are unfamiliar",
      "Replace standard medical care with the patient's preferred practices",
    ],
    answerIndex: 1,
    explanation:
      "Cultural humility involves recognizing personal assumptions, listening to the patient, and communicating respectfully. It does not require abandoning clinical standards or appropriate medical care."
  },

  {
    id: "emt-ops-382",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is one major goal of Mobile Integrated Health and Community Paramedicine programs?",
    choices: [
      "Eliminate the need for emergency ambulances",
      "Reduce avoidable emergency utilization through appropriate community-based care and coordination",
      "Provide unrestricted hospital-level intensive care in homes",
      "Replace all primary-care providers",
    ],
    answerIndex: 1,
    explanation:
      "MIH/CP programs can extend EMS capabilities into community settings through activities such as follow-up visits, care coordination, health assessment, and navigation to appropriate resources."
  },

  {
    id: "emt-ops-383",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which EMS action best supports rapid, coordinated care for a suspected acute stroke?",
    choices: [
      "Transport to any hospital without advance notification",
      "Recognize stroke symptoms, determine the last-known-well time, perform an appropriate stroke assessment, and provide early notification",
      "Delay transport until all possible history is obtained",
      "Wait until hospital arrival to mention the suspected stroke",
    ],
    answerIndex: 1,
    explanation:
      "EMS can improve stroke care by identifying possible stroke early, establishing the last-known-well time, performing an appropriate assessment, selecting an appropriate destination according to local protocols, and notifying the receiving facility."
  },

  {
    id: "emt-ops-384",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "In traditional trauma terminology, what does the phrase 'platinum ten minutes' refer to?",
    choices: [
      "Ten minutes of mandatory documentation",
      "A goal of keeping on-scene time for critical trauma patients very short",
      "Ten minutes of CPR before transport",
      "A required ten-minute reassessment interval",
    ],
    answerIndex: 1,
    explanation:
      "The 'platinum ten minutes' concept emphasizes minimizing scene time for critically injured patients when rapid transport to definitive care is appropriate. It is a guiding concept rather than an absolute rule for every trauma call."
  },

  {
    id: "emt-ops-385",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "When approaching a helicopter on the ground, which practice is safest?",
    choices: [
      "Approach from the rear where the crew cannot see you",
      "Approach only after receiving the crew's signal and remain within the pilot's field of view as directed",
      "Run toward the aircraft to reduce exposure time",
      "Walk beneath the rotor whenever convenient",
    ],
    answerIndex: 1,
    explanation:
      "Personnel should never approach a helicopter until directed by the flight crew. They should remain visible to the crew and follow the specific aircraft and landing-zone safety instructions. The tail rotor is especially hazardous."
  },

  {
    id: "emt-ops-386",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which sequence most closely represents the normal progression of an EMS ambulance call?",
    choices: [
      "Preparation → dispatch → response → scene → transport → hospital → post-run",
      "Dispatch → billing → patient contact → sleep",
      "Preparation → transport → dispatch → documentation",
      "Scene → dispatch → preparation → hospital → transport",
    ],
    answerIndex: 0,
    explanation:
      "An EMS call typically progresses from preparation and dispatch through response, arrival and patient care, transport and hospital handoff, followed by post-run activities such as cleaning, restocking, and documentation."
  },

  {
    id: "emt-ops-387",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What does 'due regard' mean when operating an ambulance during an emergency response?",
    choices: [
      "Traffic laws no longer matter",
      "Other drivers are entirely responsible for avoiding the ambulance",
      "The ambulance operator must still operate with reasonable care and attention to foreseeable hazards",
      "The ambulance may travel through intersections without slowing",
    ],
    answerIndex: 2,
    explanation:
      "Emergency vehicle privileges do not eliminate the driver's responsibility to operate safely. Drivers must account for traffic, intersections, pedestrians, visibility, road conditions, and other hazards."
  },

  {
    id: "emt-ops-388",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Why should the patient compartment be cleaned and appropriately disinfected between patient contacts?",
    choices: [
      "Primarily to protect the upholstery",
      "To reduce the possibility of transmitting infectious organisms between patients and crew",
      "To prevent battery discharge",
      "Only to satisfy billing requirements",
    ],
    answerIndex: 1,
    explanation:
      "Cleaning and disinfection help interrupt transmission of infectious organisms through contaminated surfaces. The level of cleaning should match the type and extent of contamination."
  },

  {
    id: "emt-ops-389",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which combination represents reasonable strategies for reducing fatigue-related EMS errors?",
    choices: [
      "Longer shifts combined with stimulant use",
      "Ignoring fatigue unless a mistake occurs",
      "Appropriate scheduling, fatigue awareness, opportunities for sleep or napping when feasible, and structured handoffs",
      "Requiring every EMS employee to work the same shift pattern",
    ],
    answerIndex: 2,
    explanation:
      "Fatigue mitigation includes appropriate scheduling, sleep education, fatigue recognition, opportunities for rest when feasible, and structured handoffs. No single schedule is appropriate for every EMS system."
  },

  {
    id: "emt-ops-390",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which federal organization is associated with development and funding support for major national EMS education and scope-of-practice guidance?",
    choices: [
      "NHTSA",
      "FEMA",
      "CDC",
      "DHS",
    ],
    answerIndex: 0,
    explanation:
      "NHTSA, through its Office of EMS, has played a major federal role in supporting national EMS education and scope-of-practice documents."
  },

  {
    id: "emt-ops-391",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which organization is responsible for administering the national EMT certification examination?",
    choices: [
      "AHA",
      "NREMT",
      "NAEMSE",
      "CAAHEP",
    ],
    answerIndex: 1,
    explanation:
      "The National Registry of Emergency Medical Technicians administers national EMS certification examinations, including the EMT cognitive examination."
  },

  {
    id: "emt-ops-392",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which set correctly lists the four clinician levels in the National EMS Scope of Practice Model?",
    choices: [
      "EMR, EMT, AEMT, Paramedic",
      "EMT, Paramedic, Nurse, Physician",
      "EMR, EMT, Critical Care, Physician",
      "First Responder, EMT, AEMT, Physician",
    ],
    answerIndex: 0,
    explanation:
      "The model identifies Emergency Medical Responder, Emergency Medical Technician, Advanced EMT, and Paramedic as its four EMS clinician levels."
  },

  {
    id: "emt-ops-393",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What must be established before an EMT enters a potentially hazardous scene to begin patient care?",
    choices: [
      "Hospital destination",
      "Scene safety",
      "Patient billing information",
      "A complete patient history",
    ],
    answerIndex: 1,
    explanation:
      "Scene safety must be assessed before patient contact. An injured or contaminated responder cannot effectively provide patient care."
  },

  {
    id: "emt-ops-394",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What is generally the minimum PPE for routine patient contact when no major splash or spray is anticipated?",
    choices: [
      "Gloves",
      "Gown only",
      "N95 respirator and eye protection",
      "Full-body protective suit",
    ],
    answerIndex: 0,
    explanation:
      "Gloves are generally used for routine patient contact when exposure to potentially infectious material is possible. Additional PPE is selected based on anticipated exposure."
  },

  {
    id: "emt-ops-395",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which technique is most appropriate when lifting a patient?",
    choices: [
      "Keep the load close and use the legs",
      "Twist while lifting",
      "Hold the load far from the body",
      "Lift with the back",
    ],
    answerIndex: 0,
    explanation:
      "Keeping the load close, avoiding twisting, and using the legs helps reduce mechanical stress and the risk of injury."
  },

  {
    id: "emt-ops-396",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "A responder continues to experience significant trauma-related symptoms weeks after a disturbing call. What condition should prompt consideration of professional evaluation?",
    choices: [
      "PTSD",
      "Normal transient fatigue",
      "Dehydration",
      "Motion sickness",
    ],
    answerIndex: 0,
    explanation:
      "Persistent symptoms following a traumatic event can be associated with PTSD and warrant appropriate professional assessment."
  },

  {
    id: "emt-ops-397",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Under START, what initial category is assigned to an ambulatory patient who can walk when directed?",
    choices: [
      "Green",
      "Red",
      "Yellow",
      "Black",
    ],
    answerIndex: 0,
    explanation:
      "START initially directs ambulatory patients to the designated walking-wounded area and assigns them a green category."
  },

  {
    id: "emt-ops-398",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Who has overall command responsibility for an incident under ICS?",
    choices: [
      "The Incident Commander",
      "The first EMT to reach a patient",
      "The receiving physician",
      "The senior paramedic",
    ],
    answerIndex: 0,
    explanation:
      "The Incident Commander is responsible for overall incident management under the Incident Command System."
  },

  {
    id: "emt-ops-399",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What type of EMS activity continuously examines system performance and patient-care processes to identify improvements?",
    choices: [
      "Quality improvement",
      "Criminal investigation",
      "Credentialing",
      "Dispatch prioritization",
    ],
    answerIndex: 0,
    explanation:
      "Quality improvement is an ongoing process designed to identify opportunities to improve care and system performance."
  },

  {
    id: "emt-ops-400",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What role is normally filled by the physician who provides clinical oversight for an EMS agency?",
    choices: [
      "Medical director",
      "Incident Commander",
      "Field training officer",
      "Dispatch supervisor",
    ],
    answerIndex: 0,
    explanation:
      "The EMS medical director provides physician-level medical oversight and is involved in protocols, quality systems, and medical direction."
  },

  {
    id: "emt-ops-401",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Where should an EMT look to determine the legally authorized scope and applicable clinical protocols for practice?",
    choices: [
      "State requirements and applicable medical-director-approved protocols",
      "A national textbook alone",
      "A private study website",
      "The EMT's personal preference",
    ],
    answerIndex: 0,
    explanation:
      "Actual EMS scope is governed by state law and regulation, with system-specific practice governed by applicable medical direction and protocols."
  },

  {
    id: "emt-ops-402",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which three areas were among the capabilities added to the EMT scope model through the 2021 change notices?",
    choices: [
      "IM medication administration, certain emergency vaccination activities, and nasopharyngeal specimen collection",
      "Endotracheal intubation, cricothyrotomy, and blood transfusion",
      "12-lead interpretation, pacing, and cardioversion",
      "Central-line placement, ultrasound, and chest tube insertion",
    ],
    answerIndex: 0,
    explanation:
      "The 2021 change notices expanded the EMT model to include capabilities such as IM medication administration, certain vaccination activities during public-health emergencies, and nasopharyngeal specimen collection."
  },

  {
    id: "emt-ops-403",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What document records the patient's EMS encounter and can serve clinical, legal, continuity-of-care, and billing functions?",
    choices: [
      "Patient care report",
      "Shift checklist",
      "Vehicle inspection form",
      "Dispatch log",
    ],
    answerIndex: 0,
    explanation:
      "The patient care report documents the clinical encounter and can have clinical, operational, legal, and billing significance."
  },

  {
    id: "emt-ops-404",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which ambulance type is characterized by an integrated patient compartment built into a van-style chassis?",
    choices: [
      "Type II",
      "Type I",
      "Type III",
      "Type IV",
    ],
    answerIndex: 0,
    explanation:
      "Type II ambulances use a van-style chassis with an integrated patient compartment."
  },

  {
    id: "emt-ops-405",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is a major disadvantage of routine lights-and-siren ambulance response?",
    choices: [
      "It increases crash risk while generally providing only modest time savings",
      "It prevents communication with dispatch",
      "It is slower than walking",
      "It is prohibited for trauma calls",
    ],
    answerIndex: 0,
    explanation:
      "Emergency driving can increase collision risk. Evidence generally shows that the time saved is relatively modest, so emergency response should be used appropriately."
  },

  {
    id: "emt-ops-406",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "When is helicopter EMS most likely to provide a meaningful advantage?",
    choices: [
      "When it can substantially reduce time to appropriate definitive care for a patient who needs it",
      "Whenever a family requests it",
      "For every stable patient",
      "Only when the destination is within five minutes",
    ],
    answerIndex: 0,
    explanation:
      "HEMS should be considered when patient condition, distance, transport times, available capabilities, and operational safety make air transport beneficial."
  },

  {
    id: "emt-ops-407",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What should EMS personnel do when a downed electrical wire is present at a crash scene?",
    choices: [
      "Maintain an appropriate safety perimeter and wait for qualified utility personnel",
      "Touch the wire with a nonmetallic object",
      "Approach once sparks disappear",
      "Enter the vehicle immediately",
    ],
    answerIndex: 0,
    explanation:
      "The wire should be considered energized until qualified utility personnel establish that the area is safe."
  },

  {
    id: "emt-ops-408",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "When trafficking is suspected, what action can help EMS assess the patient's situation safely when feasible?",
    choices: [
      "Speak with the patient privately when possible",
      "Confront the suspected trafficker",
      "Refuse treatment",
      "Allow an accompanying person to answer every question",
    ],
    answerIndex: 0,
    explanation:
      "A private conversation may allow the patient to communicate concerns without coercion. EMS should also follow applicable reporting and safeguarding procedures."
  },

  {
    id: "emt-ops-409",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What should EMS do when a crash vehicle is unstable and leaking fuel?",
    choices: [
      "Stage safely and request appropriate fire/rescue resources",
      "Immediately enter the vehicle",
      "Move the vehicle without specialized assistance",
      "Ignore the leak",
    ],
    answerIndex: 0,
    explanation:
      "Fuel leaks and unstable vehicles create hazards that require appropriate scene stabilization before routine patient access."
  },

  {
    id: "emt-ops-410",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "In SBAR, what does the abbreviation stand for?",
    choices: [
      "Situation, Background, Assessment, Recommendation",
      "Scene, Breathing, Airway, Response",
      "Symptoms, Background, Airway, Reassessment",
      "Subjective, Bystanders, Assessment, Response",
    ],
    answerIndex: 0,
    explanation:
      "SBAR stands for Situation, Background, Assessment, and Recommendation."
  },

  {
    id: "emt-ops-411",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What EMS teamwork approach emphasizes communication, situational awareness, and shared decision-making?",
    choices: [
      "Crew resource management",
      "Quality assurance only",
      "Incident billing",
      "Vehicle maintenance management",
    ],
    answerIndex: 0,
    explanation:
      "Crew resource management applies human-factors principles to EMS teamwork and emphasizes communication, situational awareness, leadership, and error prevention."
  },

  {
    id: "emt-ops-412",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What is the primary purpose of a peer-support discussion after a psychologically difficult EMS call?",
    choices: [
      "Support responder coping and well-being",
      "Determine which provider should be disciplined",
      "Replace the PCR",
      "Determine the patient's diagnosis",
    ],
    answerIndex: 0,
    explanation:
      "Peer support focuses on responder well-being and coping. It is different from an operational after-action review or formal clinical case review."
  },

  {
    id: "emt-ops-413",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What should an EMT do first after sustaining a needlestick exposure?",
    choices: [
      "Clean the exposed area promptly and report the exposure",
      "Wait until the end of the shift",
      "Recap the needle",
      "Apply a tourniquet",
    ],
    answerIndex: 0,
    explanation:
      "Prompt cleansing and reporting are important steps following an occupational exposure. Further evaluation should follow the agency's exposure-control process."
  },

  {
    id: "emt-ops-414",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What infection-control principle forms the foundation of standard precautions?",
    choices: [
      "Potentially infectious material should be anticipated even when infection is not known",
      "Only patients with diagnosed infections require precautions",
      "Vaccinated providers need no PPE",
      "Only respiratory symptoms require PPE",
    ],
    answerIndex: 0,
    explanation:
      "Standard precautions are based on the assumption that potentially infectious material may be present even when the patient's infection status is unknown."
  },

  {
    id: "emt-ops-415",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What respiratory protection is appropriate for an EMT caring for a patient with suspected airborne pulmonary TB?",
    choices: [
      "A fit-tested N95 or higher-level respirator",
      "A cloth mask",
      "No mask",
      "Eye protection alone",
    ],
    answerIndex: 0,
    explanation:
      "Airborne precautions for suspected TB call for an appropriate fit-tested N95 or higher-level respirator for the provider."
  },

  {
    id: "emt-ops-416",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What is the hazardous-materials zone called where contamination is present or suspected and entry is restricted?",
    choices: [
      "Hot zone",
      "Warm zone",
      "Cold zone",
      "Staging zone",
    ],
    answerIndex: 0,
    explanation:
      "The hot zone is the exclusion area containing or potentially containing the hazardous substance."
  },

  {
    id: "emt-ops-417",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "After appropriate decontamination at a Haz-Mat incident, where does EMS normally receive the patient?",
    choices: [
      "Cold zone",
      "Hot zone",
      "Inside the contaminated ambulance",
      "Before decontamination in the warm zone",
    ],
    answerIndex: 0,
    explanation:
      "Decontaminated patients are transferred to the cold zone for medical care, helping prevent contamination of EMS equipment and personnel."
  },

  {
    id: "emt-ops-418",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which resource helps first responders identify hazardous materials and determine initial isolation and protective-action guidance?",
    choices: [
      "Emergency Response Guidebook",
      "NREMT test plan",
      "PCR software",
      "Ambulance maintenance manual",
    ],
    answerIndex: 0,
    explanation:
      "The DOT Emergency Response Guidebook provides initial response guidance for hazardous-materials incidents, including identification and isolation information."
  },

  {
    id: "emt-ops-419",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What span of control is generally recommended for an ICS supervisor?",
    choices: [
      "Approximately 3 to 7 subordinates",
      "One subordinate only",
      "At least 15 subordinates",
      "No limit",
    ],
    answerIndex: 0,
    explanation:
      "ICS generally recommends a manageable span of control of about three to seven subordinates, with five often used as a target."
  },

  {
    id: "emt-ops-420",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "In traditional adult START triage, what category is assigned to an apneic patient who does not begin breathing after airway repositioning?",
    choices: [
      "Black",
      "Red",
      "Yellow",
      "Green",
    ],
    answerIndex: 0,
    explanation:
      "Under traditional START, an adult who remains apneic after an airway-opening maneuver is initially categorized black."
  },

  {
    id: "emt-ops-421",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What pediatric triage system is specifically designed as an adaptation of START?",
    choices: [
      "JumpSTART",
      "SALT-Peds",
      "RPM-Junior",
      "Pediatric RPM",
    ],
    answerIndex: 0,
    explanation:
      "JumpSTART modifies START for pediatric patients and accounts for differences in pediatric physiology and respiratory arrest."
  },

  {
    id: "emt-ops-422",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What characteristics should an effective EMS radio report have?",
    choices: [
      "Brief, organized, clear, and focused on relevant patient information",
      "Long and filled with unnecessary jargon",
      "Limited to the patient's name",
      "Entirely composed of ten-codes",
    ],
    answerIndex: 0,
    explanation:
      "A structured, concise radio report allows receiving personnel to understand the patient's condition and prepare for arrival."
  },

  {
    id: "emt-ops-423",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What writing style is most appropriate for an EMS PCR narrative?",
    choices: [
      "Objective and chronological",
      "Opinionated and speculative",
      "Extremely abbreviated",
      "Written entirely from memory several days later",
    ],
    answerIndex: 0,
    explanation:
      "PCR narratives should document events objectively and in a logical sequence, distinguishing patient statements from provider observations."
  },

  {
    id: "emt-ops-424",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "How should a finalized PCR generally be corrected when an error is discovered?",
    choices: [
      "Use the agency's authorized amendment or addendum process",
      "Secretly overwrite the original entry",
      "Delete the report",
      "Leave the error uncorrected",
    ],
    answerIndex: 0,
    explanation:
      "Corrections to finalized documentation should preserve the integrity of the original record and follow the agency's established amendment procedure."
  },

  {
    id: "emt-ops-425",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What concept emphasizes respect, collaboration, and appropriate involvement of patients and families in care?",
    choices: [
      "Family-centered care",
      "Command-and-control medicine",
      "Isolation-based care",
      "Administrative triage",
    ],
    answerIndex: 0,
    explanation:
      "Family-centered care recognizes the role of patients and families while maintaining patient autonomy, clinical judgment, and appropriate boundaries."
  },

  {
    id: "emt-ops-426",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What communication approach involves recognizing personal assumptions and respectfully adapting communication to the patient's cultural context?",
    choices: [
      "Cultural humility",
      "Cultural avoidance",
      "Provider-centered communication",
      "Clinical isolation",
    ],
    answerIndex: 0,
    explanation:
      "Cultural humility involves self-awareness, listening, avoiding assumptions, and communicating respectfully across cultural differences."
  },

  {
    id: "emt-ops-427",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "Which EMS model uses community-based clinicians for activities such as follow-up, assessment, care coordination, and navigation to appropriate services?",
    choices: [
      "Mobile Integrated Health / Community Paramedicine",
      "Traditional emergency dispatch",
      "Emergency department triage",
      "Hazardous-materials response",
    ],
    answerIndex: 0,
    explanation:
      "MIH/CP programs use EMS resources in expanded community roles that can include follow-up care, assessments, referrals, and coordination with other health services."
  },

  {
    id: "emt-ops-428",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which information is particularly important for EMS to establish and communicate when stroke is suspected?",
    choices: [
      "Last-known-well time",
      "The patient's preferred ambulance color",
      "The crew's meal break",
      "The patient's insurance company alone",
    ],
    answerIndex: 0,
    explanation:
      "The last-known-well time is critical in evaluating suspected stroke because treatment decisions are often strongly influenced by the timing of symptom onset."
  },

  {
    id: "emt-ops-429",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "What does the traditional trauma concept of the 'platinum ten' emphasize?",
    choices: [
      "Minimizing unnecessary on-scene time for critically injured patients",
      "Performing ten minutes of documentation",
      "Waiting ten minutes before transport",
      "Repeating vital signs every ten minutes",
    ],
    answerIndex: 0,
    explanation:
      "The platinum-ten concept emphasizes rapid scene management and minimizing unnecessary delays before transport when definitive trauma care is needed."
  },

  {
    id: "emt-ops-430",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What should occur before EMS personnel approach a landed helicopter?",
    choices: [
      "The flight crew should signal that the approach is safe",
      "The EMT should approach from the rear",
      "The EMT should run toward the aircraft",
      "The EMT should walk beneath the rotor disk",
    ],
    answerIndex: 0,
    explanation:
      "EMS personnel should wait for instructions from the flight crew and follow aircraft-specific approach procedures. Rotor and tail-rotor hazards require strict compliance."
  },

  {
    id: "emt-ops-431",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question:
      "What sequence best represents the major phases of an ambulance response?",
    choices: [
      "Preparation, dispatch, response, scene, transport, hospital, post-run",
      "Dispatch, billing, sleep, transport",
      "Scene, preparation, dispatch, billing",
      "Transport, dispatch, scene, preparation",
    ],
    answerIndex: 0,
    explanation:
      "The ambulance call cycle progresses through preparation, dispatch, response, patient contact and scene operations, transport, hospital handoff, and post-run activities."
  },

  {
    id: "emt-ops-432",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What principle requires an ambulance operator to continue operating safely even when emergency-vehicle privileges apply?",
    choices: [
      "Due regard",
      "Automatic right-of-way",
      "Unrestricted emergency privilege",
      "Priority driving",
    ],
    answerIndex: 0,
    explanation:
      "Due regard means the emergency vehicle operator remains responsible for operating with reasonable care and accounting for foreseeable hazards."
  },

  {
    id: "emt-ops-433",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "What is the primary infection-control reason for cleaning the ambulance patient compartment between calls?",
    choices: [
      "Reduce cross-contamination and pathogen transmission",
      "Prevent upholstery damage",
      "Improve fuel efficiency",
      "Reduce paperwork",
    ],
    answerIndex: 0,
    explanation:
      "Cleaning and appropriate disinfection reduce the risk that organisms from one patient or exposure will be transmitted to subsequent patients or crew members."
  },

  {
    id: "emt-ops-434",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which combination best describes an EMS fatigue-mitigation strategy?",
    choices: [
      "Appropriate scheduling, fatigue recognition, rest opportunities, and structured handoffs",
      "Long shifts combined with stimulant use",
      "Ignoring fatigue unless an error occurs",
      "Using one identical schedule for every EMS system",
    ],
    answerIndex: 0,
    explanation:
      "Fatigue management uses multiple strategies, including appropriate scheduling, recognition of fatigue, opportunities for rest, and structured handoffs that reduce communication errors."
  },

  {
  id: "emt-medical-281",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An adult patient is unconscious and has a condition that requires immediate emergency treatment. No family member or legal representative is available. Which type of consent allows the EMT to provide necessary emergency care?",
  choices: [
    "Expressed consent",
    "Implied consent",
    "Informed consent",
    "Written consent",
  ],
  answerIndex: 1,
  explanation:
    "Implied consent allows emergency treatment when a patient is unable to make or communicate a decision and a reasonable person would be expected to consent to necessary life-saving care. Expressed and written consent require the patient or an authorized representative to communicate permission.",
},

  {
  id: "emt-medical-282",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT is transferring a patient's medical information to the hospital that will continue treating the patient. Under HIPAA, which circumstance generally permits this disclosure without obtaining separate authorization from the patient?",
  choices: [
    "The EMT wants to discuss an interesting call with friends",
    "The disclosure is being made for treatment, payment, or health care operations",
    "The patient's name is removed from the discussion",
    "A family member says they want to know what happened",
  ],
  answerIndex: 1,
  explanation:
    "HIPAA permits certain disclosures of protected health information for treatment, payment, and health care operations. A clinical handoff to the receiving facility is part of treatment. Simply removing a patient's name does not automatically make every disclosure permissible.",
},

  {
  id: "emt-medical-283",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A competent adult with chest discomfort refuses ambulance transport after the EMT explains the potential consequences. Which action is most appropriate before the crew leaves?",
  choices: [
    "Ask the patient's spouse to authorize the refusal",
    "Accept the refusal without further documentation",
    "Verify that the patient understands the risks and document the refusal according to protocol",
    "Transport the patient despite the refusal because chest pain can be serious",
  ],
  answerIndex: 2,
  explanation:
    "A competent adult generally has the right to refuse care. The EMT should assess decision-making capacity, explain the relevant risks and benefits, encourage appropriate care, and document the refusal according to local protocol. A family member cannot override the decision of a competent adult.",
},

  {
  id: "emt-medical-284",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "You are caring for a patient who has a valid, applicable out-of-hospital DNR or POLST indicating that resuscitation should not be performed. The patient subsequently becomes pulseless. What should the EMT do?",
  choices: [
    "Start CPR until a family member arrives",
    "Begin chest compressions but withhold ventilations",
    "Follow the valid order, provide appropriate comfort-focused care, and follow medical-control or local protocol requirements",
    "Ignore the document because an EMT must always begin CPR on a pulseless patient",
  ],
  answerIndex: 2,
  explanation:
    "A valid out-of-hospital DNR or POLST should generally be honored when it meets applicable requirements. The EMT should follow local procedures for verification, provide appropriate comfort care, and involve medical direction when required. Exact requirements vary by jurisdiction and protocol.",
},

  {
  id: "emt-medical-285",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "An EMT leaves a patient's care before another appropriately qualified provider has accepted responsibility for the patient. Which legal concept best describes this situation?",
  choices: [
    "Informed consent",
    "Abandonment",
    "Implied consent",
    "Negligence per se",
  ],
  answerIndex: 1,
  explanation:
    "Abandonment can occur when an EMS provider terminates an established patient-provider relationship without ensuring an appropriate transfer of care. The EMT should complete a proper handoff to an appropriately qualified provider before ending care.",
},

  {
  id: "emt-medical-286",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which consent doctrine is based on the assumption that an incapacitated patient would agree to necessary emergency treatment if they were capable of making the decision?",
  choices: [
    "Expressed consent",
    "Implied consent",
    "Informed consent",
    "Administrative consent",
  ],
  answerIndex: 1,
  explanation:
    "Implied consent is the doctrine used in appropriate emergencies when the patient cannot provide consent and immediate treatment is necessary. The assumption is that a reasonable person would consent to care needed to prevent death or serious harm.",
},

  {
  id: "emt-medical-287",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "Treatment, payment, and health care operations are commonly grouped under which HIPAA concept when discussing permitted uses or disclosures of protected health information?",
  choices: [
    "TPO",
    "DNR",
    "AMA",
    "POLST",
  ],
  answerIndex: 0,
  explanation:
    "TPO stands for treatment, payment, and health care operations. HIPAA permits certain disclosures for these purposes without requiring a separate patient authorization in every circumstance. EMS-to-hospital clinical communication commonly falls under treatment.",
},

  {
  id: "emt-medical-288",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An adult patient has decision-making capacity but declines recommended ambulance transport after the EMT explains the potential consequences. What type of EMS process is being described?",
  choices: [
    "Involuntary treatment",
    "Abandonment",
    "Refusal of care",
    "Implied consent",
  ],
  answerIndex: 2,
  explanation:
    "This is a refusal of care. A competent adult generally may decline EMS assessment, treatment, or transportation. The EMT should ensure the patient understands the relevant risks, follow applicable protocol, and thoroughly document the encounter.",
},

  {
  id: "emt-medical-289",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "What document or medical order may direct EMS personnel to withhold resuscitative efforts from an eligible patient when it is valid and applicable under local law and protocol?",
  choices: [
    "A standard patient care report",
    "A valid DNR or POLST",
    "An EMS refusal form signed by a bystander",
    "A hospital discharge summary",
  ],
  answerIndex: 1,
  explanation:
    "A valid DNR or POLST may communicate a patient's wishes regarding resuscitation and other medical interventions. EMS personnel must follow the verification and treatment procedures established by their jurisdiction and medical direction.",
},

  {
  id: "emt-medical-290",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "operations",
  question:
    "What legal term describes ending an established patient-care relationship without making sure that another appropriately qualified provider has assumed responsibility for the patient?",
  choices: [
    "Abandonment",
    "Battery",
    "Implied consent",
    "Assault",
  ],
  answerIndex: 0,
  explanation:
    "Abandonment involves an inappropriate termination of patient care without an adequate transfer of responsibility. Once an EMS provider has established a patient-provider relationship, care should continue until the patient is appropriately transferred, released according to protocol, or otherwise handled through an authorized process.",
},

  {
  id: "emt-medical-291",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which description correctly represents the reference position used when describing anatomical locations?",
  choices: [
    "Standing upright and facing forward, with the arms alongside the body and palms facing forward",
    "Standing upright with the palms facing backward and the feet together",
    "Lying flat on the back with the arms resting beside the body",
    "Standing upright while facing away from the examiner with the arms raised"
  ],
  answerIndex: 0,
  explanation:
    "The standard anatomical position has the person standing upright and facing forward, with the arms at the sides and palms facing forward. This position provides the reference for directional anatomical terms. The other positions do not represent the standard anatomical reference position."
},

  {
  id: "emt-medical-292",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An injury is located on the patient's chest between the sternum and the spine, closer to the front surface of the body. Which directional term should the EMT use?",
  choices: [
    "Posterior",
    "Medial",
    "Anterior",
    "Lateral"
  ],
  answerIndex: 2,
  explanation:
    "Anterior refers to the front or toward the front of the body. Posterior refers to the back, medial means toward the body's midline, and lateral means farther from the midline."
},

  {
  id: "emt-medical-293",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "When comparing the locations of the wrist and elbow, which statement is anatomically correct?",
  choices: [
    "The wrist is proximal to the elbow",
    "The wrist is distal to the elbow",
    "The wrist is medial to the elbow",
    "The wrist is superior to the elbow"
  ],
  answerIndex: 1,
  explanation:
    "Distal describes a location farther from the trunk or point of attachment. Because the wrist is farther from the shoulder and trunk than the elbow, the wrist is distal to the elbow. Proximal means closer to the trunk or point of attachment."
},

  {
  id: "emt-medical-294",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "During an assessment, an EMT documents that an unconscious patient's body is resting on the back with the face directed upward. How should this position be recorded?",
  choices: [
    "Prone",
    "Fowler's",
    "Supine",
    "Lateral recumbent"
  ],
  answerIndex: 2,
  explanation:
    "Supine describes a person lying on the back with the face upward. Prone describes lying face-down. Fowler's refers to a seated or semi-seated position, while lateral recumbent describes lying on the side."
},

  {
  id: "emt-medical-295",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An unconscious patient is breathing normally and has no indication of a spinal injury. Which position is commonly used to help maintain the airway while reducing the likelihood of aspiration?",
  choices: [
    "Left lateral recumbent",
    "Supine",
    "Prone",
    "High Fowler's"
  ],
  answerIndex: 0,
  explanation:
    "A lateral recovery position, commonly performed on the left side, can help maintain airway patency and allow secretions to drain while reducing aspiration risk in an appropriate patient. Supine positioning can allow secretions or vomit to obstruct the airway, while prone and upright positions are not the standard recovery position."
},

  {
  id: "emt-medical-296",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An EMT uses a standardized body orientation in which the patient is upright, facing forward, arms resting at the sides, and palms turned forward. What is this position called?",
  choices: [
    "Anatomical position",
    "Supine position",
    "Fowler's position",
    "Prone position"
  ],
  answerIndex: 0,
  explanation:
    "This is the standard anatomical position. It serves as the reference orientation for describing locations and relationships between structures of the body. Supine and prone describe lying positions, while Fowler's describes an upright or semi-upright position."
},

  {
  id: "emt-medical-297",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which anatomical directional term means 'toward the front of the body'?",
  choices: [
    "Lateral",
    "Posterior",
    "Anterior",
    "Medial"
  ],
  answerIndex: 2,
  explanation:
    "Anterior means toward the front of the body. Posterior means toward the back, medial means toward the body's midline, and lateral means away from the midline."
},

  {
  id: "emt-medical-298",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "What anatomical term describes a structure that is farther from the trunk or point where a limb attaches?",
  choices: [
    "Superior",
    "Proximal",
    "Distal",
    "Medial"
  ],
  answerIndex: 2,
  explanation:
    "Distal means farther from the trunk or point of attachment. Proximal has the opposite relationship and describes a structure closer to the trunk or point of attachment."
},

  {
  id: "emt-medical-299",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which patient position places the person on their back with the face directed upward?",
  choices: [
    "Prone",
    "Supine",
    "Left lateral recumbent",
    "Fowler's"
  ],
  answerIndex: 1,
  explanation:
    "Supine means lying on the back with the face upward. Prone means lying face-down. Lateral recumbent means lying on one side, while Fowler's describes an upright or semi-upright position."
},

  {
  id: "emt-medical-300",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An appropriate unconscious, normally breathing patient without suspected spinal trauma is placed on their side to help protect the airway. What is this commonly called?",
  choices: [
    "Trendelenburg position",
    "Recovery position",
    "Supine position",
    "Fowler's position"
  ],
  answerIndex: 1,
  explanation:
    "The recovery position places an appropriate unconscious but normally breathing patient laterally to help maintain airway patency and reduce aspiration risk. It should not replace appropriate spinal precautions when spinal injury is suspected."
},

  {
  id: "emt-medical-301",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "During an EMS assessment, which age range is generally classified as the infant stage?",
  choices: [
    "Birth through approximately 12 months",
    "Birth through approximately 30 days",
    "1 through 3 years",
    "3 through 6 years",
  ],
  answerIndex: 0,
  explanation:
    "For EMS developmental assessment, an infant is generally considered to be from birth through 1 year of age. The neonatal period is limited to roughly the first month of life, while the toddler period begins around 1 year. The other choices describe neonatal, toddler, or preschool age ranges."
},

  {
  id: "emt-medical-302",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "You are assessing a healthy 6-month-old who is resting comfortably. Which pulse rate would be most consistent with a normal resting heart rate for this patient?",
  choices: [
    "72 beats/min",
    "118 beats/min",
    "168 beats/min",
    "42 beats/min",
  ],
  answerIndex: 1,
  explanation:
    "A resting infant commonly has a heart rate of about 100 to 160 beats/min. A rate of 118 beats/min falls within that expected range. The other values are more consistent with rates outside the typical resting infant range."
},

  {
  id: "emt-medical-303",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "While evaluating a calm 4-month-old, you count the child's respirations for a full minute. Which finding is within the expected resting range?",
  choices: [
    "14 breaths/min",
    "22 breaths/min",
    "36 breaths/min",
    "68 breaths/min",
  ],
  answerIndex: 2,
  explanation:
    "A resting infant normally breathes approximately 25 to 50 times per minute. A respiratory rate of 36 breaths/min is therefore within the expected range. The other rates are either below or substantially above the usual infant range."
},

  {
  id: "emt-medical-304",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "A parent asks when the larger soft spot on the front of an infant's skull normally disappears. Which response is most appropriate?",
  choices: [
    "Usually during the first 2 to 3 months",
    "Usually around 6 months",
    "Usually by roughly 12 to 18 months",
    "Usually sometime between 4 and 6 years",
  ],
  answerIndex: 2,
  explanation:
    "The anterior fontanelle generally closes during the second year of life, commonly around 12 to 18 months. The posterior fontanelle closes much earlier. Abnormal bulging or depression of a fontanelle can be clinically significant and should be considered along with the rest of the patient's assessment."
},

  {
  id: "emt-medical-305",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which behavior would be most typical of a child in the toddler stage?",
  choices: [
    "Playing beside other children without consistently interacting with them",
    "Using sophisticated abstract reasoning",
    "Managing painful procedures with the same coping skills as an adult",
    "Consistently understanding complex cause-and-effect relationships",
  ],
  answerIndex: 0,
  explanation:
    "Toddlers commonly engage in parallel play, in which they play alongside other children without extensive cooperative interaction. Stranger anxiety and limited communication skills are also common. Toddlers generally benefit from simple explanations and the presence of a trusted caregiver during assessment."
},

  {
  id: "emt-medical-306",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An EMS provider is reviewing pediatric age classifications. A patient who is 10 months old should be categorized as which developmental group?",
  choices: [
    "Neonate",
    "Infant",
    "Toddler",
    "Preschooler",
  ],
  answerIndex: 1,
  explanation:
    "A 10-month-old is an infant because the infant period extends from birth through approximately 1 year. Neonates are limited to the first several weeks, while the toddler period begins at about 1 year."
},

  {
  id: "emt-medical-307",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which resting heart rate would be considered an expected finding in a healthy 8-month-old infant?",
  choices: [
    "48 beats/min",
    "82 beats/min",
    "132 beats/min",
    "196 beats/min",
  ],
  answerIndex: 2,
  explanation:
    "Resting infants commonly have heart rates around 100 to 160 beats/min. A pulse of 132 beats/min is therefore within the expected range. The other values are outside the typical resting range for an infant."
},

  {
  id: "emt-medical-308",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "During assessment of a resting infant, which respiratory rate would most strongly suggest a normal finding?",
  choices: [
    "10 breaths/min",
    "18 breaths/min",
    "40 breaths/min",
    "75 breaths/min",
  ],
  answerIndex: 2,
  explanation:
    "A resting infant generally has a respiratory rate of approximately 25 to 50 breaths/min. A rate of 40 breaths/min falls within this expected range."
},

  {
  id: "emt-medical-309",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "During a routine assessment, an EMT explains that the anterior fontanelle generally closes during which period?",
  choices: [
    "Within the first month",
    "Around 3 to 6 months",
    "Approximately 12 to 18 months",
    "After the child's fifth birthday",
  ],
  answerIndex: 2,
  explanation:
    "The anterior fontanelle normally closes at approximately 12 to 18 months of age. The posterior fontanelle closes substantially earlier, generally within the first few months."
},

  {
  id: "emt-medical-310",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An EMT is assessing a 2-year-old who becomes upset around unfamiliar providers and plays next to, rather than cooperatively with, another child. Which developmental stage best explains these behaviors?",
  choices: [
    "Neonate",
    "Infant",
    "Toddler",
    "School-age child",
  ],
  answerIndex: 2,
  explanation:
    "The patient is a toddler. Stranger anxiety and parallel play are characteristic behaviors during this developmental stage. Toddlers also tend to have limited communication abilities and benefit from simple, concrete explanations."
},

  {
  id: "emt-medical-311",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which medication administration route became part of the national EMT scope through the 2021 scope-of-practice change notices?",
  choices: [
    "Intramuscular injection",
    "Intravenous injection",
    "Intraosseous infusion",
    "Subcutaneous injection",
  ],
  answerIndex: 0,
  explanation:
    "Intramuscular (IM) administration was added to the EMT level through Change Notice 1.0 to the 2019 National EMS Scope of Practice Model. The change expanded EMT authority for certain IM medications and public-health activities. IV and IO administration remain outside the general national EMT scope, while subcutaneous administration is not the route added by that change."
},

  {
  id: "emt-medical-312",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An EMT is preparing to administer a medication. Which action is NOT normally considered one of the traditional six medication-administration rights?",
  choices: [
    "Confirming the correct patient",
    "Confirming the correct medication",
    "Confirming the correct route",
    "Confirming the manufacturer's brand name",
  ],
  answerIndex: 3,
  explanation:
    "The traditional six rights are commonly taught as the right patient, medication, dose, route, time, and documentation. Confirming a manufacturer's brand name is not one of those traditional six rights. Medication-safety practices can include additional checks beyond these six."
},

  {
  id: "emt-medical-313",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A medication used to reverse opioid-induced respiratory depression is commonly marketed under which brand name?",
  choices: [
    "Narcan",
    "EpiPen",
    "Ventolin",
    "Glucagon",
  ],
  answerIndex: 0,
  explanation:
    "Narcan is a commonly recognized brand name for naloxone, an opioid antagonist used to reverse opioid-induced respiratory depression. EpiPen is associated with epinephrine, Ventolin is a brand of albuterol, and glucagon is the generic name of a different medication."
},

  {
  id: "emt-medical-314",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An alert adult has chest discomfort that is concerning for acute coronary syndrome. Which medication would an EMT commonly administer when indicated and when no contraindication is present?",
  choices: [
    "Chewable aspirin",
    "Warfarin",
    "Furosemide",
    "Heparin",
  ],
  answerIndex: 0,
  explanation:
    "Chewable aspirin is a standard EMT medication for suspected ischemic cardiac chest pain when indicated and when contraindications are absent. Warfarin, furosemide, and heparin are not routine EMT medications for this presentation. The exact aspirin dose and administration requirements should follow the applicable EMS protocol."
},

  {
  id: "emt-medical-315",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Before assisting a patient with prescribed sublingual nitroglycerin for suspected cardiac chest pain, which assessment is especially important because nitroglycerin can lower blood pressure?",
  choices: [
    "Blood pressure",
    "Blood glucose only",
    "Pupil size",
    "Skin temperature only",
  ],
  answerIndex: 0,
  explanation:
    "Blood pressure should be assessed before assisting with nitroglycerin because the medication can produce vasodilation and hypotension. The EMT should also assess for other contraindications, including relevant medication use such as phosphodiesterase-5 inhibitors, and follow the applicable local or state protocol. There is not one universal NREMT-mandated systolic blood pressure cutoff for every EMS system."
},

  {
  id: "emt-medical-316",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An EMT needs to administer a medication by injecting it directly into muscle tissue. Which route is being used?",
  choices: [
    "Intramuscular",
    "Intravenous",
    "Intraosseous",
    "Intranasal",
  ],
  answerIndex: 0,
  explanation:
    "An injection delivered into muscle tissue is administered by the intramuscular, or IM, route. The IV route delivers medication into a vein, the IO route delivers it into the vascular space through bone, and the intranasal route delivers medication through the nasal mucosa."
},

  {
  id: "emt-medical-317",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An EMT verifies the patient, medication, dose, route, time, and documentation before and after giving a medication. What medication-safety framework do these checks represent?",
  choices: [
    "The traditional six rights",
    "The SAMPLE history",
    "The OPQRST assessment",
    "The pediatric assessment triangle",
  ],
  answerIndex: 0,
  explanation:
    "Patient, medication, dose, route, time, and documentation correspond to the traditional six rights of medication administration. EMS systems and educational programs may teach additional medication-safety checks as well."
},

  {
  id: "emt-medical-318",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which medication is the generic drug name associated with the brand name Narcan?",
  choices: [
    "Naloxone",
    "Epinephrine",
    "Albuterol",
    "Glucagon",
  ],
  answerIndex: 0,
  explanation:
    "Naloxone is the generic medication associated with the brand name Narcan. Naloxone is an opioid antagonist used to reverse opioid-induced respiratory depression."
},

  {
  id: "emt-medical-319",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which medication is an antiplatelet drug commonly used by EMTs for suspected ischemic chest pain when indicated?",
  choices: [
    "Aspirin",
    "Warfarin",
    "Furosemide",
    "Heparin",
  ],
  answerIndex: 0,
  explanation:
    "Aspirin is an antiplatelet medication commonly administered by EMTs for suspected ischemic cardiac chest pain when indicated and not contraindicated. The other medications are not routine EMT treatments for this presentation."
},

  {
  id: "emt-medical-320",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An EMT is considering whether a patient can safely receive prescribed nitroglycerin. Which finding should be checked because nitroglycerin may cause hypotension?",
  choices: [
    "The patient's blood pressure",
    "The patient's hair color",
    "The patient's dominant hand",
    "The patient's visual acuity",
  ],
  answerIndex: 0,
  explanation:
    "Blood pressure is an important assessment before nitroglycerin because the medication can lower blood pressure. The EMT should also assess for other contraindications and follow the applicable EMS protocol rather than relying on a single universal blood-pressure cutoff."
},

  {
    id: "emt-airway-107",
    domain: "Airway",
    level: "EMT",
    question:
      "During swallowing, which structure helps keep material from entering the trachea?",
    choices: [
      "Hyoid bone",
      "Epiglottis",
      "Cricoid cartilage",
      "Thyroid cartilage",
    ],
    answerIndex: 1,
    explanation:
      "The epiglottis helps protect the laryngeal inlet during swallowing, directing food and liquid toward the esophagus rather than the airway. The hyoid and laryngeal cartilages provide structural support but do not perform this same protective function.",
  },

  {
    id: "emt-airway-108",
    domain: "Airway",
    level: "EMT",
    question:
      "Which structure forms a complete ring around the airway and is located immediately inferior to the thyroid cartilage?",
    choices: [
      "Cricoid cartilage",
      "Epiglottis",
      "Hyoid bone",
      "Arytenoid cartilage",
    ],
    answerIndex: 0,
    explanation:
      "The cricoid cartilage forms a complete ring around the airway and lies inferior to the thyroid cartilage. This distinguishes it from the C-shaped cartilaginous rings of the trachea.",
  },

  {
    id: "emt-airway-109",
    domain: "Airway",
    level: "EMT",
    question:
      "An unresponsive trauma patient may have a cervical spine injury. Which technique should an EMT initially use to open the patient's airway?",
    choices: [
      "Head-tilt/chin-lift",
      "Jaw thrust without head extension",
      "Neck hyperextension",
      "Flexion of the cervical spine",
    ],
    answerIndex: 1,
    explanation:
      "When cervical spine injury is suspected, a trained rescuer should initially attempt a jaw thrust without head extension to minimize movement of the cervical spine. However, maintaining a patent airway takes priority. If the airway cannot be opened with a jaw thrust and appropriate adjuncts, head-tilt/chin-lift may be necessary.",
  },

  {
    id: "emt-airway-110",
    domain: "Airway",
    level: "EMT",
    question:
      "When selecting the appropriate length of an oropharyngeal airway, the EMT should generally measure from the:",
    choices: [
      "Tip of the nose to the earlobe",
      "Corner of the mouth to the angle of the jaw",
      "Chin to the sternal notch",
      "Bridge of the nose to the chin",
    ],
    answerIndex: 1,
    explanation:
      "An OPA is commonly sized by measuring from the corner of the mouth to the angle of the jaw. This provides an estimate of the appropriate airway length. Measuring from the nose to the earlobe is associated with sizing an NPA.",
  },

  {
    id: "emt-airway-111",
    domain: "Airway",
    level: "EMT",
    question:
      "Which finding would make placement of an oropharyngeal airway inappropriate in an otherwise unresponsive patient?",
    choices: [
      "Snoring respirations",
      "An intact gag reflex",
      "Absent spontaneous respirations",
      "Poor tongue tone",
    ],
    answerIndex: 1,
    explanation:
      "An OPA should not be inserted in a patient with an intact gag reflex because stimulation of the oropharynx can cause gagging and vomiting. An OPA is intended for an unresponsive patient who lacks an effective gag reflex.",
  },

  {
    id: "emt-airway-112",
    domain: "Airway",
    level: "EMT",
    question:
      "Which airway structure acts as a protective flap over the laryngeal opening during swallowing?",
    choices: [
      "Cricoid cartilage",
      "Epiglottis",
      "Hyoid bone",
      "Vocal cords",
    ],
    answerIndex: 1,
    explanation:
      "The epiglottis is a leaf-shaped structure that helps protect the airway during swallowing by covering the laryngeal inlet. The other structures contribute to airway anatomy but do not serve this primary protective role.",
  },

  {
    id: "emt-airway-113",
    domain: "Airway",
    level: "EMT",
    question:
      "An EMT is reviewing the laryngeal cartilages and wants to identify the structure that forms a complete circular ring. Which structure should the EMT select?",
    choices: [
      "Thyroid cartilage",
      "Cricoid cartilage",
      "Epiglottis",
      "Hyoid bone",
    ],
    answerIndex: 1,
    explanation:
      "The cricoid cartilage is the only complete ring of cartilage in the larynx. The thyroid cartilage does not form a complete ring, and the hyoid is a bone rather than cartilage.",
  },

  {
    id: "emt-airway-114",
    domain: "Airway",
    level: "EMT",
    question:
      "Which airway-opening technique is specifically intended to minimize cervical movement when a trained rescuer suspects head or neck trauma?",
    choices: [
      "Jaw thrust without head extension",
      "Head-tilt/chin-lift with neck extension",
      "Forced cervical flexion",
      "Rapid neck rotation",
    ],
    answerIndex: 0,
    explanation:
      "A jaw thrust without head extension is the preferred initial airway-opening technique when head or neck trauma raises concern for cervical spine injury. If this does not establish a patent airway, airway management takes priority and head-tilt/chin-lift may be required.",
  },

  {
    id: "emt-airway-115",
    domain: "Airway",
    level: "EMT",
    question:
      "An EMT measures from the corner of a patient's mouth toward the angle of the jaw before selecting an airway adjunct. Which device is being sized?",
    choices: [
      "Nasopharyngeal airway",
      "Oropharyngeal airway",
      "Supraglottic airway",
      "Bag-mask device",
    ],
    answerIndex: 1,
    explanation:
      "The corner of the mouth to the angle of the jaw is a common measurement used when selecting the appropriate size OPA. NPA sizing is generally based on external nasal measurements.",
  },

  {
    id: "emt-airway-116",
    domain: "Airway",
    level: "EMT",
    question:
      "An unresponsive patient has no effective gag reflex and is experiencing upper-airway obstruction from loss of tongue tone. Which adjunct may be appropriate if there is no contraindication?",
    choices: [
      "Oropharyngeal airway",
      "Nothing because the patient is unresponsive",
      "A tongue depressor placed over the tongue",
      "Routine cricoid pressure",
    ],
    answerIndex: 0,
    explanation:
      "An OPA can help maintain airway patency in an unresponsive patient who lacks an effective gag reflex. It should not be used when an intact gag reflex is present. Routine cricoid pressure is not recommended during adult cardiac arrest.",
  },

  {
  id: "emt-medical-321",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "Before approaching a patient at an emergency scene, an EMT should first:",
  choices: [
    "Obtain the patient's blood pressure",
    "Determine whether the scene is safe and identify hazards",
    "Ask the patient about their medical history",
    "Begin documenting the patient care report"
  ],
  answerIndex: 1,
  explanation:
    "Scene safety comes before patient contact. The EMT should identify hazards, use appropriate PPE, determine the nature of the call and mechanism of injury when applicable, and determine whether additional resources are needed. Patient assessment and treatment begin after the scene has been evaluated for safety."
},

  {
  id: "emt-medical-322",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "During the initial assessment of a sick or injured patient, which sequence best represents the EMT's priorities?",
  choices: [
    "Medical history → vital signs → secondary assessment → airway",
    "General impression → mental status → airway → breathing → circulation",
    "Blood pressure → pulse → SAMPLE history → airway",
    "Secondary examination → treatment → general impression → vital signs"
  ],
  answerIndex: 1,
  explanation:
    "The primary assessment rapidly identifies immediate threats to life. The EMT forms a general impression, evaluates mental status, assesses the airway, evaluates breathing, and assesses circulation while identifying and treating life threats as appropriate. A complete history and detailed secondary assessment follow when the patient's condition permits."
},

  {
  id: "emt-medical-323",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An EMT asks a patient to respond to a spoken question. The patient does not respond, but opens their eyes and follows a command when the EMT applies an appropriate painful stimulus. Which AVPU category best describes the patient's level of consciousness?",
  choices: [
    "Alert",
    "Verbal",
    "Pain",
    "Unresponsive"
  ],
  answerIndex: 2,
  explanation:
    "In the AVPU system, a patient classified as 'P' responds only to painful stimulus. The patient is not alert and does not respond to verbal stimulation, but does respond to pain. AVPU provides a rapid assessment of level of consciousness."
},

  {
  id: "emt-medical-324",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An EMT determines that a patient knows who they are, where they are, the approximate date or time, and what happened to them. Which finding does this most closely describe?",
  choices: [
    "Orientation to person, place, time, and event",
    "A patient who is responsive only to verbal stimuli",
    "A patient with a Glasgow Coma Scale of 8",
    "An assessment of the patient's motor strength"
  ],
  answerIndex: 0,
  explanation:
    "Orientation questions commonly evaluate person, place, time, and event or situation. This is one way of assessing mental status during patient assessment. It should not be confused with AVPU or the more detailed Glasgow Coma Scale."
},

  {
  id: "emt-medical-325",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which statement about the adult Glasgow Coma Scale is accurate?",
  choices: [
    "It ranges from 0 to 10 and evaluates only verbal response",
    "It ranges from 3 to 15 and evaluates eye, verbal, and motor responses",
    "It ranges from 1 to 20 and evaluates pupil size and reaction",
    "It ranges from 5 to 25 and replaces the primary assessment"
  ],
  answerIndex: 1,
  explanation:
    "The adult Glasgow Coma Scale ranges from 3 to 15. It combines scores for eye opening, verbal response, and motor response. GCS is a more detailed assessment of neurologic function than AVPU, but it does not replace the primary assessment or the EMT's evaluation of airway, breathing, and circulation."
},

  {
  id: "emt-medical-326",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "sceneSafety",
  question:
    "An EMT evaluates hazards, determines the nature of the call, considers the mechanism of injury, estimates the number of patients, and decides whether additional resources are necessary before making patient contact. What part of EMS assessment is being performed?",
  choices: [
    "Secondary assessment",
    "Scene size-up",
    "SAMPLE history",
    "Reassessment"
  ],
  answerIndex: 1,
  explanation:
    "These actions are components of scene size-up. Scene size-up occurs before or as the crew approaches the patient and is intended to identify hazards, determine the nature of the emergency, estimate resource needs, and establish an initial understanding of the situation."
},

  {
  id: "emt-medical-327",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An EMT rapidly evaluates a patient's general appearance, level of consciousness, airway, breathing, and circulation while looking for immediately life-threatening problems. What assessment is this?",
  choices: [
    "Primary assessment",
    "Secondary assessment",
    "Past medical history",
    "Focused physical examination"
  ],
  answerIndex: 0,
  explanation:
    "This describes the primary assessment. Its purpose is to rapidly identify life threats and determine the patient's immediate treatment and transport priorities."
},

  {
  id: "emt-medical-328",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A rapid mental-status scale categorizes a patient according to whether they are awake and appropriately responsive, respond to verbal stimulation, respond only to painful stimulation, or fail to respond. What assessment tool is being described?",
  choices: [
    "SAMPLE",
    "AVPU",
    "OPQRST",
    "Glasgow Coma Scale"
  ],
  answerIndex: 1,
  explanation:
    "AVPU is a rapid method of describing level of consciousness: Alert, responds to Verbal stimulus, responds to Painful stimulus, or Unresponsive. The Glasgow Coma Scale provides a more detailed numerical assessment."
},

  {
  id: "emt-medical-329",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An assessment determines whether a patient knows their identity, location, the approximate time, and the circumstances surrounding the emergency. Which aspect of patient assessment is being evaluated?",
  choices: [
    "Orientation and mental status",
    "Airway patency",
    "Peripheral circulation",
    "Mechanism of injury"
  ],
  answerIndex: 0,
  explanation:
    "Questions about identity, location, time, and the circumstances of the event are used to evaluate orientation and mental status. Altered orientation can be an important finding during the primary or secondary assessment depending on the situation."
},

  {
  id: "emt-medical-330",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "An EMS provider wants a numerical neurologic assessment that separately scores eye opening, verbal response, and motor response, with a combined adult score ranging from 3 to 15. Which tool should be used?",
  choices: [
    "AVPU",
    "SAMPLE",
    "Glasgow Coma Scale",
    "OPQRST"
  ],
  answerIndex: 2,
  explanation:
    "The Glasgow Coma Scale evaluates eye opening, verbal response, and motor response and produces an adult total from 3 to 15. AVPU is a faster categorical assessment of responsiveness rather than a numerical scale."
},

  {    id: "emt-medical-331",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which statement best describes shock in a prehospital patient?",
    choices: [
      "It is any temporary loss of consciousness.",
      "It occurs when tissue perfusion is insufficient to meet the body's metabolic needs.",
      "It is present whenever a patient's blood pressure falls below 120 mmHg systolic.",
      "It is primarily a psychological reaction to a stressful event."
    ],
    answerIndex: 1,
    explanation:
      "Shock is a state of inadequate tissue perfusion in which oxygen and nutrient delivery cannot adequately meet cellular metabolic demands. A patient can be in shock before hypotension develops, so the EMT should consider the entire clinical presentation rather than using blood pressure alone."
  },

  {
    id: "emt-medical-332",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An EMT is assessing a patient whose circulation is no longer adequately supplying tissues with oxygen and nutrients. What condition does this describe?",
    choices: [
      "Shock",
      "Isolated hypertension",
      "Syncope",
      "Hyperventilation syndrome"
    ],
    answerIndex: 0,
    explanation:
      "The condition described is shock, which involves inadequate tissue perfusion relative to metabolic demand. Hypotension may occur as shock progresses, but it is not required for shock to be present."
  },

  {
    id: "emt-medical-333",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which group correctly matches the major mechanisms of shock with representative examples?",
    choices: [
      "Cardiogenic: pump failure; hypovolemic: inadequate circulating volume; distributive: abnormal vasodilation; obstructive: physical obstruction to circulation",
      "Cardiogenic: blood loss; hypovolemic: allergic reaction; distributive: myocardial infarction; obstructive: dehydration",
      "Hypovolemic: vasodilation; distributive: blood loss; cardiogenic: tension pneumothorax; obstructive: sepsis",
      "All forms of shock result from the same mechanism and differ only in severity"
    ],
    answerIndex: 0,
    explanation:
      "Major shock mechanisms include cardiogenic, hypovolemic, distributive, and obstructive shock. Examples include pump failure for cardiogenic shock, loss of circulating volume for hypovolemic shock, abnormal vasodilation in distributive shock, and conditions such as tension pneumothorax or cardiac tamponade in obstructive shock."
  },

  {
    id: "emt-medical-334",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient develops severe vasodilation during an anaphylactic reaction. Which broad mechanism of shock does this represent?",
    choices: [
      "Cardiogenic",
      "Obstructive",
      "Distributive",
      "Hypovolemic"
    ],
    answerIndex: 2,
    explanation:
      "Anaphylaxis can produce distributive shock because widespread vasodilation and increased vascular permeability impair effective circulation. Distributive shock also includes mechanisms such as septic and neurogenic shock."
  },

  {
    id: "emt-medical-335",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which finding would be most consistent with compensated shock in an adult?",
    choices: [
      "Normal blood pressure accompanied by tachycardia, cool pale skin, and anxiety",
      "Cardiac arrest with no palpable pulse",
      "Severe hypotension with complete loss of consciousness in every case",
      "Warm, dry skin with a slow pulse as the expected presentation"
    ],
    answerIndex: 0,
    explanation:
      "During compensated shock, the body can temporarily maintain blood pressure through compensatory mechanisms such as increased sympathetic activity and vasoconstriction. Tachycardia, cool or pale skin, anxiety or restlessness, and other signs of poor perfusion may appear before obvious hypotension."
  },

  {
    id: "emt-medical-336",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An adult has a near-normal blood pressure but is tachycardic, pale, cool, and increasingly restless. Which physiologic state should the EMT be concerned about?",
    choices: [
      "Compensated shock",
      "Normal physiologic response with no concern for perfusion",
      "Cardiac arrest",
      "Isolated hypertension"
    ],
    answerIndex: 0,
    explanation:
      "This combination can indicate compensated shock. The cardiovascular system may maintain blood pressure temporarily despite inadequate tissue perfusion. The EMT should recognize these early findings rather than waiting for hypotension."
  },

  {
    id: "emt-medical-337",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which finding would most strongly suggest that compensatory mechanisms are failing in a patient with shock?",
    choices: [
      "Persistent signs of poor perfusion accompanied by hypotension",
      "A normal blood pressure with no other abnormal findings",
      "A temporary increase in heart rate with otherwise normal perfusion",
      "A mildly elevated blood pressure with warm skin"
    ],
    answerIndex: 0,
    explanation:
      "Hypotension in a patient with other signs of poor perfusion is concerning for progression to decompensated shock. The important point is that shock should not be ruled out simply because the blood pressure has not yet fallen below a particular numerical threshold."
  },

  {
    id: "emt-medical-338",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An adult with suspected shock now has worsening signs of poor perfusion and a falling blood pressure. What does this most likely indicate?",
    choices: [
      "Compensatory mechanisms are becoming insufficient to maintain adequate circulation.",
      "The patient has automatically recovered from shock.",
      "The patient has isolated hypertension.",
      "The findings rule out circulatory compromise."
    ],
    answerIndex: 0,
    explanation:
      "A falling blood pressure together with worsening signs of poor perfusion suggests that compensatory mechanisms are failing. Hypotension is an important late finding, but there is no single blood pressure value that should be used by itself to diagnose or exclude shock."
  },

  {
    id: "emt-trauma-090",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An EMT encounters life-threatening bleeding from an extremity. Which intervention is appropriate?",
    choices: [
      "Apply a manufactured tourniquet when appropriate and tighten it until the life-threatening bleeding stops.",
      "Apply ice and elevate the extremity as the primary treatment.",
      "Apply a loose bandage and avoid further pressure.",
      "Wait for hypotension before attempting hemorrhage control."
    ],
    answerIndex: 0,
    explanation:
      "Life-threatening extremity hemorrhage requires immediate hemorrhage control. A manufactured tourniquet is appropriate when indicated and should be tightened until the bleeding stops. Direct pressure remains an important hemorrhage-control technique, particularly when a tourniquet cannot be used or is unavailable."
  },

  {
    id: "emt-trauma-091",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "Which intervention is specifically appropriate for uncontrolled, life-threatening bleeding from an extremity when a tourniquet can be applied?",
    choices: [
      "Apply a properly positioned tourniquet and tighten it until the bleeding stops.",
      "Elevate the extremity and apply an ice pack.",
      "Apply pressure only to a distant pressure point.",
      "Delay treatment until signs of shock appear."
    ],
    answerIndex: 0,
    explanation:
      "For life-threatening extremity bleeding, a properly applied tourniquet is an appropriate hemorrhage-control intervention. Current first-aid guidance supports prompt tourniquet use for life-threatening extremity bleeding, while direct pressure remains the mainstay of hemorrhage control when a tourniquet is not applicable or available."
  },

  {
  id: "emt-medical-339",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A 62-year-old patient reports new pressure in the center of the chest that began while walking. The discomfort extends toward the left arm, and the patient is pale, sweaty, and nauseated. Which condition should be considered a major concern?",
  choices: [
    "Acute coronary syndrome",
    "Spontaneous pneumothorax",
    "Isolated musculoskeletal chest pain",
    "Uncomplicated gastroesophageal reflux"
  ],
  answerIndex: 0,
  explanation:
    "Acute coronary syndrome should be strongly considered because new central chest pressure accompanied by diaphoresis, nausea, and radiation to the arm is concerning for myocardial ischemia. Pneumothorax more commonly produces sudden pleuritic pain and respiratory findings, while musculoskeletal and reflux symptoms have different typical patterns. ACS can also occur without the classic presentation, so the absence of every listed symptom would not exclude it."
},

  {
  id: "emt-medical-340",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which patient with possible acute coronary syndrome deserves particular attention even if significant chest discomfort is absent?",
  choices: [
    "A healthy 20-year-old with a brief episode of anxiety",
    "An older adult reporting unexplained shortness of breath and unusual fatigue",
    "A teenager with isolated ankle pain",
    "A young athlete with predictable muscle soreness after exercise"
  ],
  answerIndex: 1,
  explanation:
    "Older adults may have less typical ACS presentations, including dyspnea, weakness, fatigue, nausea, or other nonspecific symptoms. The absence of prominent chest pain does not rule out ACS. The other presentations are less suggestive of an acute coronary syndrome based on the information given."
},

  {
  id: "emt-cardiology-321",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An alert adult has symptoms concerning for acute coronary syndrome. After completing the assessment, the EMT should follow local protocol regarding aspirin and assistance with prescribed nitroglycerin. Which additional approach is most appropriate?",
  choices: [
    "Provide oxygen automatically regardless of the patient's oxygenation",
    "Keep the patient comfortable, reassess frequently, and arrange appropriate transport",
    "Delay transport until the chest discomfort completely resolves",
    "Have the patient walk to the ambulance to assess exercise tolerance"
  ],
  answerIndex: 1,
  explanation:
    "An EMT should continue assessment and reassessment, keep the patient in a position of comfort, provide indicated treatment within scope and protocol, and arrange appropriate transport. Transport should not be delayed simply because symptoms temporarily improve. Routine oxygen is not indicated solely because ACS is suspected when the patient is adequately oxygenated."
},

  {
  id: "emt-cardiology-322",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "A patient with suspected ACS has an SpO₂ of 96% and no signs of respiratory distress. Which statement about supplemental oxygen is most consistent with current ACS guidance?",
  choices: [
    "Oxygen should routinely be applied to prevent myocardial ischemia",
    "Oxygen is unnecessary solely because ACS is suspected when the patient is not hypoxic",
    "A nonrebreather mask should always be used for chest pain",
    "Oxygen should be withheld from every patient with ACS, regardless of oxygenation"
  ],
  answerIndex: 1,
  explanation:
    "Current ACS guidance does not recommend routine supplemental oxygen for patients who are not hypoxic. Oxygen is indicated when hypoxemia is present or when clinically necessary. The specific oxygen delivery method should be based on the patient's condition and applicable EMS protocol."
},

  {
  id: "emt-cardiology-323",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "A patient with a history of heart failure is sitting upright and struggling to breathe. You hear widespread crackles, and the patient has jugular venous distention and peripheral edema. Which condition best explains this presentation?",
  choices: [
    "Acute decompensated heart failure with pulmonary congestion",
    "Isolated upper-airway obstruction",
    "Simple dehydration",
    "Uncomplicated allergic rhinitis"
  ],
  answerIndex: 0,
  explanation:
    "Crackles, dyspnea, jugular venous distention, and peripheral edema are consistent with acute decompensated heart failure and pulmonary congestion. The patient should be assessed and treated according to the severity of respiratory compromise and local protocol. Positioning, oxygen when indicated, and positive-pressure ventilation such as CPAP when authorized may be appropriate."
},

  {
  id: "emt-cardiology-324",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "An EMT is evaluating a patient for possible ACS. Which combination of findings would make myocardial ischemia particularly concerning?",
  choices: [
    "Central chest pressure with diaphoresis and radiation toward an arm",
    "Localized rib tenderness after lifting a heavy object",
    "Sharp pain that occurs only with deep inspiration and coughing",
    "Itchy skin with isolated nasal congestion"
  ],
  answerIndex: 0,
  explanation:
    "Central chest pressure accompanied by autonomic symptoms such as diaphoresis and possible radiation to an arm is concerning for ACS. The other findings point toward alternative causes of chest or respiratory symptoms."
},

  {
  id: "emt-medical-341",
  domain: "Medical + OBGYN",
  level: "EMT",
  blueprintCategory: "secondaryAssessment",
  question:
    "Which patient could have ACS despite not describing the classic complaint of crushing chest pain?",
  choices: [
    "An older patient with unexplained dyspnea, nausea, and unusual fatigue",
    "A healthy adolescent with a superficial abrasion",
    "A patient with chronic knee pain after exercise",
    "A patient with isolated itching after changing laundry detergent"
  ],
  answerIndex: 0,
  explanation:
    "ACS can present with nonspecific symptoms, particularly in some older adults and other populations at increased cardiovascular risk. Dyspnea, nausea, weakness, fatigue, or other atypical symptoms should not automatically be dismissed as noncardiac."
},

  {
  id: "emt-cardiology-325",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "An EMT suspects ACS in an alert adult. Which approach best reflects appropriate BLS management?",
  choices: [
    "Perform ongoing assessment, follow local protocol for indicated medications, keep the patient comfortable, and arrange appropriate transport",
    "Wait for the patient's symptoms to disappear before beginning transport",
    "Administer an advanced cardiac medication outside the EMT's authorized scope",
    "Require the patient to walk to the ambulance before treatment begins"
  ],
  answerIndex: 0,
  explanation:
    "BLS management focuses on assessment, appropriate supportive care, authorized interventions according to protocol, reassessment, and timely transport. EMTs should not independently perform interventions outside their scope or local medical direction."
},

  {
  id: "emt-cardiology-326",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "treatmentTransport",
  question:
    "Which ACS patient most clearly has an indication for supplemental oxygen based on oxygen saturation alone?",
  choices: [
    "A patient with an SpO₂ of 98% and no respiratory distress",
    "A patient with an SpO₂ of 95% and no respiratory distress",
    "A patient with an SpO₂ of 88%",
    "A patient with an SpO₂ of 97% who reports anxiety"
  ],
  answerIndex: 2,
  explanation:
    "The 2025 ACS guideline recommends supplemental oxygen for patients with ACS and confirmed hypoxia, defined as an oxygen saturation below 90%. Routine oxygen is not recommended for ACS patients with oxygen saturation at or above 90% in the absence of another indication."
},

  {
  id: "emt-cardiology-327",
  domain: "Cardiology",
  level: "EMT",
  blueprintCategory: "primaryAssessment",
  question:
    "Which combination is most suggestive of acute decompensated heart failure with pulmonary congestion?",
  choices: [
    "Dyspnea, crackles, jugular venous distention, and peripheral edema",
    "Fever, isolated sore throat, and enlarged tonsils",
    "Abdominal tenderness with localized right lower-quadrant pain",
    "Unilateral ear pain with normal respiratory findings"
  ],
  answerIndex: 0,
  explanation:
    "Dyspnea accompanied by pulmonary crackles and signs of systemic venous congestion such as jugular venous distention and peripheral edema is consistent with acute decompensated heart failure. Treatment depends on the patient's respiratory status and local EMS protocols and may include oxygen when indicated and CPAP when appropriate and authorized."
},

  {
    id: "emt-trauma-092",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which situation would generally be considered the LEAST concerning mechanism of injury for an otherwise healthy adult?",
    choices: [
      "An adult falls from a second-story balcony and lands on the ground",
      "A restrained driver is involved in a high-speed collision with major passenger-compartment intrusion",
      "A pedestrian is struck by a moving vehicle and thrown several feet",
      "An adult trips on a level surface and lands on their hands and knees"
    ],
    answerIndex: 3,
    explanation:
      "A simple ground-level trip and fall in a healthy adult is generally a lower-risk mechanism when there are no other concerning findings. Falls from significant height, high-energy vehicle collisions with major intrusion, and pedestrian-versus-vehicle impacts can indicate substantial energy transfer and should prompt careful assessment. Mechanism of injury is only one part of determining the patient's risk; the patient's age, presentation, and physical findings must also be considered."
  },

  {
    id: "emt-trauma-093",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question:
      "Which finding would most strongly suggest that an apparently minor fall could involve a significant traumatic injury?",
    choices: [
      "The patient is a healthy adult who stumbled while walking",
      "The patient fell from a substantial height and landed directly on the head and neck",
      "The patient sat down after tripping but did not strike anything",
      "The patient slipped while walking slowly and immediately stood up"
    ],
    answerIndex: 1,
    explanation:
      "A fall from substantial height with direct impact to the head and neck represents a potentially significant mechanism and warrants careful assessment for traumatic injury. The apparent simplicity of the event does not eliminate concern when substantial energy or a vulnerable body region is involved."
  },

  {
    id: "emt-trauma-094",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "An alert patient has a penetrating wound to the chest that produces an audible sucking sound with each breath. What is the most appropriate initial treatment?",
    choices: [
      "Pack the wound deeply with gauze",
      "Apply a vented chest seal and monitor closely for worsening respiratory distress",
      "Cover the wound with dry gauze and leave it completely uncovered",
      "Apply a bulky pressure dressing tightly around the entire chest"
    ],
    answerIndex: 1,
    explanation:
      "An open chest wound can allow air to enter the pleural space. A vented chest seal is an appropriate initial treatment when available. The patient must be continuously reassessed for signs of worsening respiratory distress or tension physiology. Local protocols should guide the specific dressing and management technique."
  },

  {
    id: "emt-trauma-095",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question:
      "A patient with a penetrating chest injury has an occlusive dressing over the wound. Shortly afterward, the patient develops increasing respiratory distress and signs of obstructive shock. What complication should the EMT be most concerned about?",
    choices: [
      "Simple rib fracture",
      "Tension pneumothorax",
      "Isolated pulmonary contusion",
      "Cardiac dysrhythmia caused by hypothermia"
    ],
    answerIndex: 1,
    explanation:
      "Increasing respiratory distress and obstructive-shock findings after treatment of an open chest wound should raise concern for tension pneumothorax. An occlusive dressing can interfere with air leaving the pleural space if a one-way valve effect develops. The EMT should follow local protocol for managing the dressing while providing appropriate supportive care and rapid transport."
  },

  {
    id: "emt-trauma-096",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "After a high-energy chest injury, an EMT notices that a section of the patient's chest wall moves inward during inspiration and outward during expiration. What does this finding most strongly suggest?",
    choices: [
      "Flail chest",
      "Simple pneumothorax",
      "Cardiac tamponade",
      "Isolated clavicle fracture"
    ],
    answerIndex: 0,
    explanation:
      "Paradoxical movement of a free segment of the chest wall is characteristic of flail chest. The injury is commonly associated with significant blunt chest trauma and may occur along with pulmonary contusion. The patient's respiratory status is more clinically important than simply identifying the chest-wall injury."
  },

  {
    id: "emt-trauma-097",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "What term describes a traumatic chest-wall injury in which multiple adjacent ribs are fractured sufficiently to create a segment that is no longer mechanically stable with the rest of the chest wall?",
    choices: [
      "Hemothorax",
      "Flail chest",
      "Tension pneumothorax",
      "Pericardial tamponade"
    ],
    answerIndex: 1,
    explanation:
      "A flail chest occurs when multiple adjacent ribs are fractured in a pattern that creates a mechanically unstable segment of the chest wall. Paradoxical movement may occur, although it is not necessary for the EMT to wait for obvious paradoxical motion before recognizing serious chest trauma. Associated pulmonary injury can significantly impair ventilation and oxygenation."
  },

  {
    id: "emt-trauma-098",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A patient with penetrating chest trauma is hypotensive and has distended neck veins and unusually muffled heart sounds. Which condition best explains this combination of findings?",
    choices: [
      "Cardiac tamponade",
      "Simple pneumothorax",
      "Isolated femur fracture",
      "Pulmonary edema from congestive heart failure"
    ],
    answerIndex: 0,
    explanation:
      "Hypotension, muffled heart sounds, and jugular venous distention are classically associated with Beck's triad and suggest cardiac tamponade in the appropriate clinical setting. However, the complete triad is not always present. The EMT should recognize the possibility of obstructive shock, provide appropriate supportive care within scope, and arrange rapid transport."
  },

  {
    id: "emt-trauma-099",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question:
      "Which combination of findings is classically associated with cardiac tamponade?",
    choices: [
      "Hypertension, bradycardia, and warm skin",
      "Hypotension, muffled heart sounds, and jugular venous distention",
      "Fever, productive cough, and bilateral crackles",
      "Hypertension, unilateral absent breath sounds, and cyanosis"
    ],
    answerIndex: 1,
    explanation:
      "The classic Beck's triad consists of hypotension, muffled heart sounds, and jugular venous distention. Cardiac tamponade can impair cardiac filling and produce obstructive shock. The triad is not perfectly sensitive, so its absence does not rule out tamponade."
  },

  {
    id: "emt-trauma-100",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which assessment finding would be LEAST consistent with a tension pneumothorax?",
    choices: [
      "Severe respiratory distress with worsening oxygenation",
      "Markedly decreased breath sounds on one side",
      "Hypotension with other findings suggesting obstructive shock",
      "Clear, equal breath sounds with stable vital signs"
    ],
    answerIndex: 3,
    explanation:
      "A tension pneumothorax generally produces significant respiratory and cardiovascular compromise. Unilateral markedly decreased or absent breath sounds may be present, and hypotension can occur as intrathoracic pressure interferes with venous return. Clear, equal breath sounds with stable vital signs would be much less consistent with a tension pneumothorax."
  },

  {
    id: "emt-trauma-101",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An injured patient develops severe respiratory distress, rapidly worsening hypotension, and markedly decreased breath sounds on one side of the chest. Which life threat should the EMT suspect?",
    choices: [
      "Tension pneumothorax",
      "Isolated rib fracture",
      "Cardiac tamponade without respiratory compromise",
      "Simple ankle fracture"
    ],
    answerIndex: 0,
    explanation:
      "Severe respiratory distress combined with unilateral markedly decreased breath sounds and signs of shock is highly concerning for tension pneumothorax. Tracheal deviation can occur but is a late and unreliable finding, so its absence should not reassure the EMT. Immediate management should follow the EMT's scope and local medical direction, with rapid transport when indicated."
  },

  {
    id: "emt-medical-342",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "You observe a toddler from several feet away before beginning a hands-on examination. Which three areas should you rapidly evaluate as part of the Pediatric Assessment Triangle?",
    choices: [
      "General appearance, work of breathing, and circulation to the skin",
      "Airway patency, blood pressure, and capillary refill",
      "Mental status, pulse rate, and respiratory rate",
      "Level of consciousness, oxygen saturation, and skin temperature",
    ],
    answerIndex: 0,
    explanation:
      "The Pediatric Assessment Triangle is a rapid visual assessment consisting of appearance, work of breathing, and circulation to the skin. It can be performed immediately on seeing the child and helps determine whether the child appears critically ill before a hands-on assessment begins. The other choices contain useful clinical findings but are not the three components of the PAT.",
  },

  {
    id: "emt-medical-343",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A 2-year-old is unusually limp, barely interacts with the crew, and has a weak cry. What is the most appropriate interpretation of these findings during an initial visual assessment?",
    choices: [
      "The child is probably tired and can be reassessed after obtaining a full set of vital signs",
      "The findings are concerning for significant illness and warrant prompt assessment and appropriate supportive care",
      "The findings primarily indicate that the child is hungry",
      "The findings are expected in a child who is anxious around EMS personnel",
    ],
    answerIndex: 1,
    explanation:
      "Poor tone and reduced interaction are abnormal findings in the appearance component of the Pediatric Assessment Triangle. An abnormal appearance can indicate significant illness and should prompt immediate attention to airway, breathing, circulation, and other life threats rather than delaying care until a complete set of vital signs is obtained.",
  },

  {
    id: "emt-medical-344",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "You arrive for an infant who is becoming unresponsive after a prolonged respiratory illness. Which statement best describes the usual mechanism of pediatric cardiac arrest?",
    choices: [
      "It is most commonly caused by an isolated coronary artery event",
      "It commonly develops secondary to respiratory failure or circulatory shock",
      "It is usually caused by a primary ventricular dysrhythmia",
      "It is almost always caused by traumatic injury",
    ],
    answerIndex: 1,
    explanation:
      "Pediatric cardiac arrest commonly develops from respiratory failure and/or shock rather than the primary cardiac causes that are more typical of adult sudden cardiac arrest. Recognizing and treating respiratory compromise and shock early is therefore especially important in pediatric patients.",
  },

  {
    id: "emt-cardiology-328",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "An EMT and a second trained rescuer are performing CPR on a child with no advanced airway in place. Which compression-to-ventilation ratio should they use?",
    choices: [
      "30 compressions to 2 ventilations",
      "15 compressions to 2 ventilations",
      "15 compressions to 1 ventilation",
      "3 compressions to 1 ventilation",
    ],
    answerIndex: 1,
    explanation:
      "For an infant or child in cardiac arrest without an advanced airway, two rescuers should use a 15:2 compression-to-ventilation ratio. A single rescuer uses 30:2. The 3:1 ratio is used for neonatal resuscitation, not routine pediatric CPR.",
  },

  {
    id: "emt-cardiology-329",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A single EMT is performing conventional CPR on an infant in cardiac arrest before another rescuer arrives. Which CPR pattern is appropriate when no advanced airway is present?",
    choices: [
      "15 compressions followed by 2 ventilations",
      "30 compressions followed by 2 ventilations",
      "3 compressions followed by 1 ventilation",
      "Continuous compressions with no ventilations",
    ],
    answerIndex: 1,
    explanation:
      "A single rescuer should use a 30:2 compression-to-ventilation ratio for an infant or child when no advanced airway is present. Once a second trained rescuer is available, the ratio changes to 15:2. Pediatric cardiac arrest generally benefits from ventilation as well as chest compressions.",
  },

  {
    id: "emt-medical-345",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Immediately after birth, a newborn is apneic and has a heart rate of 80/min despite initial drying, warming, stimulation, and appropriate airway positioning. What intervention should be initiated?",
    choices: [
      "Begin positive-pressure ventilation",
      "Begin chest compressions immediately",
      "Administer aspirin",
      "Place the newborn in cold water to stimulate respirations",
    ],
    answerIndex: 0,
    explanation:
      "A newborn who remains apneic or has a heart rate below 100/min after initial steps requires positive-pressure ventilation. Chest compressions are indicated if the heart rate remains below 60/min despite effective ventilation. Neonatal resuscitation differs from routine infant and child CPR, including its use of a 3:1 compression-to-ventilation ratio when compressions are required.",
  },

  {
    id: "emt-medical-346",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A rapid pediatric visual assessment specifically examines appearance, work of breathing, and circulation to the skin. What assessment tool is being described?",
    choices: [
      "Pediatric Assessment Triangle",
      "SAMPLE history",
      "AVPU assessment",
      "OPQRST assessment",
    ],
    answerIndex: 0,
    explanation:
      "The Pediatric Assessment Triangle is the rapid visual assessment that evaluates appearance, work of breathing, and circulation to the skin. SAMPLE and OPQRST are history-taking frameworks, while AVPU is a method of describing responsiveness.",
  },

  {
    id: "emt-medical-347",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A child with poor tone, limited interaction, and an abnormal cry should be treated as potentially seriously ill rather than assumed to be tired or hungry. Which PAT component is primarily represented by these findings?",
    choices: [
      "Appearance",
      "Work of breathing",
      "Circulation to the skin",
      "Blood pressure",
    ],
    answerIndex: 0,
    explanation:
      "Tone, interactiveness, consolability, gaze, and the quality of a child's cry or speech are part of the appearance component of the Pediatric Assessment Triangle. Abnormal appearance is concerning and should prompt rapid assessment for potentially serious illness.",
  },

  {
    id: "emt-cardiology-330",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A pediatric cardiac arrest develops after severe respiratory compromise and shock rather than from a primary cardiac event. What general pattern of pediatric arrest does this represent?",
    choices: [
      "A secondary arrest associated with respiratory failure and/or shock",
      "A typical adult-style primary coronary arrest",
      "An arrest caused exclusively by trauma",
      "A benign pediatric syncopal event",
    ],
    answerIndex: 0,
    explanation:
      "Pediatric cardiac arrest commonly occurs secondary to respiratory failure and/or shock. This differs from the classic adult pattern in which sudden primary cardiac arrest is more common. Early recognition and treatment of respiratory and circulatory deterioration are therefore critical.",
  },

  {
    id: "emt-cardiology-331",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "Which CPR ratio is associated with two rescuers performing conventional CPR on an infant or child when there is no advanced airway?",
    choices: [
      "30:2",
      "15:2",
      "3:1",
      "10:1",
    ],
    answerIndex: 1,
    explanation:
      "Two rescuers performing CPR on an infant or child without an advanced airway use a 15:2 compression-to-ventilation ratio. The 30:2 ratio applies when there is only one rescuer. A 3:1 ratio is associated with neonatal resuscitation when chest compressions are required.",
  },

  {
    id: "emt-medical-348",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question:
      "A newborn remains apneic after the initial newborn-care steps, and the heart rate is below 100/min. Which intervention is the appropriate next step in neonatal resuscitation?",
    choices: [
      "Positive-pressure ventilation",
      "Immediate chest compressions",
      "Routine deep suctioning",
      "Adult-dose aspirin",
    ],
    answerIndex: 0,
    explanation:
      "Persistent apnea or a heart rate below 100/min after the initial steps calls for positive-pressure ventilation. Chest compressions are considered when the heart rate remains below 60/min despite effective ventilation. Routine suctioning is not the default intervention for every newborn.",
  },

  {
    id: "emt-airway-117",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "You are preparing an airway adjunct for an unresponsive adult with no gag reflex. Which measurement is most appropriate when selecting an oropharyngeal airway?",
    choices: [
      "From the nostril to the earlobe",
      "From the corner of the mouth to the angle of the jaw",
      "From the chin to the sternum",
      "From the forehead to the tip of the nose"
    ],
    answerIndex: 1,
    explanation: "An OPA is generally sized from the corner of the mouth to the angle of the jaw. A properly sized device helps keep the tongue from obstructing the pharynx without extending too deeply. Measuring from the nose to the earlobe is associated with NPA sizing."
  },

  {
    id: "emt-airway-118",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An unconscious patient immediately gags when you begin inserting an OPA. What is the best interpretation of this finding?",
    choices: [
      "The OPA is too short and should be replaced with a larger one",
      "The patient's gag reflex is intact, so an OPA should not be used",
      "The patient requires a supraglottic airway immediately",
      "The patient should receive an OPA while being placed supine"
    ],
    answerIndex: 1,
    explanation: "An intact gag reflex is a contraindication to OPA placement because stimulation can cause vomiting and aspiration. An NPA may be appropriate when tolerated and not otherwise contraindicated. Airway management should remain within the EMT's scope and local protocol."
  },

  {
    id: "emt-airway-119",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which patient is the best candidate for an oropharyngeal airway?",
    choices: [
      "An alert patient with a strong gag reflex",
      "A semiconscious patient who repeatedly coughs when the airway is touched",
      "An unresponsive patient without a gag reflex",
      "A patient who is awake and vomiting"
    ],
    answerIndex: 2,
    explanation: "An OPA is intended for an unconscious or deeply unresponsive patient who lacks an intact gag reflex. Patients who are conscious or have an active gag reflex may vomit or aspirate when an OPA is inserted."
  },

  {
    id: "emt-airway-120",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient with depressed consciousness has a patent airway but cannot tolerate an OPA because of a gag reflex. Which adjunct may be considered instead?",
    choices: [
      "Nasopharyngeal airway",
      "Larger OPA",
      "Smaller OPA",
      "Bite block"
    ],
    answerIndex: 0,
    explanation: "An NPA is generally better tolerated by patients who retain a gag reflex. It should only be used when there is no contraindication, such as significant nasal trauma or certain suspected skull-base injuries."
  },

  {
    id: "emt-airway-121",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "During suctioning of an adult patient's airway, the patient becomes increasingly cyanotic. What is the most appropriate immediate response?",
    choices: [
      "Continue suctioning until all secretions are removed",
      "Increase suction pressure and continue",
      "Stop suctioning and provide oxygenation or ventilation as indicated",
      "Place the patient prone and resume suctioning"
    ],
    answerIndex: 2,
    explanation: "Suctioning can remove oxygen and should be performed for limited periods. If hypoxia develops, stop the procedure and restore oxygenation or ventilation. Removing every secretion is less important than maintaining adequate oxygenation."
  },

  {
    id: "emt-airway-122",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An adult with a pulse is apneic but has a palpable carotid pulse. At what approximate rate should an EMT provide rescue breaths with a BVM?",
    choices: [
      "One breath every 2 seconds",
      "One breath every 4 seconds",
      "One breath every 6 seconds",
      "One breath every 12 seconds"
    ],
    answerIndex: 2,
    explanation: "For an adult who is not breathing normally but has a pulse, current AHA guidance supports approximately one breath every 6 seconds. Each breath should be delivered over about 1 second and should produce visible chest rise. Excessive ventilation can increase intrathoracic pressure and reduce venous return."
  },

  {
    id: "emt-airway-123",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "You are ventilating an apneic adult with a BVM. Which observation provides the strongest evidence that air is reaching the lungs?",
    choices: [
      "The reservoir bag remains completely full",
      "The abdomen visibly expands",
      "The chest visibly rises with the ventilation",
      "The pop-off valve opens with every breath"
    ],
    answerIndex: 2,
    explanation: "Visible chest rise is the primary bedside indicator that a BVM ventilation is producing effective lung expansion. Abdominal distention suggests gastric insufflation, while excessive pressure or valve activation does not demonstrate effective ventilation."
  },

  {
    id: "emt-airway-124",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Which patient would be least appropriate for CPAP?",
    choices: [
      "An alert patient with acute pulmonary edema who is breathing adequately",
      "An alert patient with severe respiratory distress who can follow commands",
      "A patient who is apneic and requires assisted ventilation",
      "An alert patient with severe bronchospasm who can cooperate with treatment"
    ],
    answerIndex: 2,
    explanation: "CPAP supports a patient's spontaneous breathing and therefore is not a substitute for ventilation in an apneic patient. A patient who cannot maintain adequate spontaneous ventilation requires assisted ventilation with a BVM or another appropriate intervention."
  },

  {
    id: "emt-airway-125",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with severe respiratory distress is alert, cooperative, breathing spontaneously, and has adequate tidal volume. Which feature makes CPAP potentially appropriate when permitted by protocol?",
    choices: [
      "The patient is unable to protect the airway",
      "The patient can cooperate with the mask and continue spontaneous breathing",
      "The patient is apneic",
      "The patient has no respiratory effort"
    ],
    answerIndex: 1,
    explanation: "CPAP requires a patient who can cooperate with the device and generate spontaneous respirations. It can improve oxygenation and reduce the work of breathing in selected patients with respiratory distress."
  },

  {
    id: "emt-airway-126",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A trauma patient is unresponsive after a high-speed collision. Which airway-opening maneuver should initially be considered when spinal injury is suspected?",
    choices: [
      "Jaw thrust",
      "Head-tilt, chin-lift only",
      "Blind finger sweep",
      "Abdominal thrusts"
    ],
    answerIndex: 0,
    explanation: "A jaw-thrust maneuver can open the airway while minimizing movement of the cervical spine. However, airway patency takes priority, and if a jaw thrust does not adequately open the airway, an appropriately performed head-tilt, chin-lift may be necessary."
  },

  {
    id: "emt-airway-127",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An unresponsive adult has occasional irregular gasps but no normal breathing. How should you interpret these respirations?",
    choices: [
      "Adequate spontaneous ventilation",
      "Agonal respirations that should not be considered normal breathing",
      "Hyperventilation caused by anxiety",
      "A mild partial airway obstruction"
    ],
    answerIndex: 1,
    explanation: "Gasping or agonal respirations are not normal breathing. In an unresponsive adult, they should prompt an immediate pulse assessment and preparation for resuscitation rather than reassurance that the patient is ventilating adequately."
  },

  {
    id: "emt-airway-128",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A child with suspected upper-airway swelling produces a harsh, high-pitched sound primarily during inspiration. What does this finding suggest?",
    choices: [
      "Lower-airway bronchospasm",
      "Upper-airway narrowing",
      "Fluid in the alveoli",
      "Normal turbulent airflow"
    ],
    answerIndex: 1,
    explanation: "Stridor is generally caused by turbulent airflow through a narrowed upper airway. It can occur with conditions such as croup, upper-airway swelling, foreign bodies, or other causes of obstruction. It should be treated as a potentially serious airway finding."
  },

  {
    id: "emt-airway-129",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which assessment finding is most consistent with lower-airway narrowing rather than upper-airway obstruction?",
    choices: [
      "Inspiratory stridor",
      "Expiratory wheezing",
      "Snoring respirations",
      "Gurgling secretions"
    ],
    answerIndex: 1,
    explanation: "Wheezing is commonly associated with narrowed lower airways, such as in asthma or bronchospasm. Stridor suggests upper-airway narrowing, while snoring often indicates partial obstruction from the tongue and gurgling suggests fluid or secretions."
  },

  {
    id: "emt-airway-130",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An unresponsive overdose patient is breathing adequately and has no evidence of trauma. Which position can help protect the airway while awaiting transport?",
    choices: [
      "Lateral recovery position",
      "Prone with the head straight ahead",
      "Supine with both legs elevated",
      "Standing with assistance"
    ],
    answerIndex: 0,
    explanation: "A lateral recovery position can help maintain airway patency and allow secretions or vomitus to drain from the mouth in an unresponsive patient who is breathing adequately and has no reason to remain supine."
  },

  {
    id: "emt-airway-131",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient with suspected spinal trauma becomes apneic after a failed jaw-thrust maneuver. What principle should guide your next airway intervention?",
    choices: [
      "Never move the head under any circumstances",
      "Airway and ventilation take priority, so an effective airway-opening maneuver should be performed",
      "Wait for a cervical collar before ventilating",
      "Place the patient prone before attempting ventilation"
    ],
    answerIndex: 1,
    explanation: "Maintaining a patent airway and adequate ventilation is immediately life-saving. Spinal precautions are important, but they should not prevent an EMT from correcting a life-threatening airway or ventilation problem."


  },

  {
    id: "emt-cardiology-332",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "During adult CPR, which compression rate should an EMT target?",
    choices: [
      "60 to 80 per minute",
      "80 to 100 per minute",
      "100 to 120 per minute",
      "140 to 160 per minute"
    ],
    answerIndex: 2,
    explanation: "Current AHA guidance recommends a compression rate of 100 to 120 per minute for adult cardiac arrest. Slower rates may provide inadequate perfusion, while excessively rapid compressions can reduce depth and recoil."
  },

  {
    id: "emt-cardiology-333",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "What compression depth is appropriate for an average adult during CPR?",
    choices: [
      "At least 1 inch but less than 1.5 inches",
      "At least 2 inches while avoiding depths greater than 2.4 inches",
      "Approximately 3 inches",
      "About one-half the anterior-posterior chest diameter"
    ],
    answerIndex: 1,
    explanation: "For an average adult, AHA guidance recommends a depth of at least 2 inches (5 cm) while avoiding excessive depths greater than 2.4 inches (6 cm). Adequate depth is necessary for effective blood flow."
  },

  {
    id: "emt-cardiology-334",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Where should an EMT position the hands when performing adult chest compressions?",
    choices: [
      "Over the left lateral chest",
      "Over the xiphoid process",
      "On the lower half of the sternum in the center of the chest",
      "On the upper third of the sternum"
    ],
    answerIndex: 2,
    explanation: "Adult compressions are performed in the center of the chest on the lower half of the sternum. This allows the rescuer to generate effective compression of the heart while avoiding direct pressure on the xiphoid process."
  },

  {
    id: "emt-cardiology-335",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Why should the chest be allowed to fully recoil between adult compressions?",
    choices: [
      "It allows the rescuer to rest between compressions",
      "It promotes venous return and cardiac filling",
      "It prevents all rib fractures",
      "It increases the patient's blood oxygen concentration"
    ],
    answerIndex: 1,
    explanation: "Complete chest recoil lowers intrathoracic pressure and allows blood to return to the heart. Leaning on the chest can impair venous return and reduce coronary and cerebral perfusion."
  },

  {
    id: "emt-cardiology-336",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "During adult CPR without an advanced airway, which compression-to-ventilation ratio should be used by a trained EMS provider?",
    choices: [
      "15:2",
      "30:2",
      "5:1",
      "Continuous compressions with one breath every 6 seconds"
    ],
    answerIndex: 1,
    explanation: "For adult CPR without an advanced airway, trained rescuers use 30 compressions followed by 2 ventilations. Continuous compressions with asynchronous ventilations apply when an advanced airway is in place."
  },

  {
    id: "emt-cardiology-337",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "You arrive while another EMT is performing CPR on an adult. What should you do with an AED that has just arrived?",
    choices: [
      "Turn on the AED and follow its prompts",
      "Stop CPR and perform a pulse check before touching the AED",
      "Wait until two minutes of CPR have passed",
      "Analyze the rhythm manually before turning on the AED"
    ],
    answerIndex: 0,
    explanation: "The AED should be turned on promptly and its prompts followed. The team should minimize interruptions in compressions while the pads are applied and prepare for rhythm analysis."
  },

  {
    id: "emt-cardiology-338",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An AED announces that it is analyzing the patient's rhythm. What should the resuscitation team do?",
    choices: [
      "Continue compressions during the analysis",
      "Ventilate while holding the patient's shoulders",
      "Ensure nobody is touching the patient",
      "Perform a carotid pulse check throughout the analysis"
    ],
    answerIndex: 2,
    explanation: "The patient must not be touched during AED rhythm analysis because movement can create electrical artifact and interfere with rhythm interpretation. This is one of the necessary brief interruptions in CPR."
  },

  {
    id: "emt-cardiology-339",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "The AED delivers a shock for a shockable rhythm. What is the next priority?",
    choices: [
      "Immediately resume chest compressions",
      "Wait for the AED to announce the next rhythm",
      "Check the carotid pulse for 20 seconds",
      "Perform a complete secondary assessment"
    ],
    answerIndex: 0,
    explanation: "After a shock, CPR should resume immediately, beginning with chest compressions. The AED will prompt another rhythm analysis after the next CPR interval."
  },

  {
    id: "emt-cardiology-340",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Two EMTs are performing CPR on a 4-year-old child without an advanced airway. Which ratio should they use?",
    choices: [
      "30:2",
      "15:2",
      "5:1",
      "3:1"
    ],
    answerIndex: 1,
    explanation: "For two-rescuer CPR on an infant or child without an advanced airway, the compression-to-ventilation ratio is 15:2. A lone rescuer generally uses 30:2."
  },

  {
    id: "emt-cardiology-341",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Approximately how deep should compressions be delivered to an infant during CPR?",
    choices: [
      "About 0.5 inch",
      "About 1 inch",
      "At least one-third of the chest depth, approximately 1.5 inches",
      "At least 2.5 inches"
    ],
    answerIndex: 2,
    explanation: "Infant compressions should be approximately one-third of the anterior-posterior chest diameter, which is roughly 1.5 inches (4 cm). The depth should be sufficient to produce effective circulation without using adult-sized compression depth."
  },

  {
    id: "emt-cardiology-342",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Two rescuers are performing CPR on an infant. Which technique is preferred for the rescuer providing compressions?",
    choices: [
      "Two-finger compressions with the other hand behind the head",
      "Two-thumb encircling-hands technique",
      "Two adult-style hands stacked over the sternum",
      "One-hand compressions over the left chest"
    ],
    answerIndex: 1,
    explanation: "When two rescuers are present, the two-thumb encircling-hands technique is preferred for infant CPR. The rescuer's hands encircle the chest while the thumbs compress the lower half of the sternum."
  },

  {
    id: "emt-cardiology-343",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "During a prolonged resuscitation, when should two rescuers generally consider switching the compressor?",
    choices: [
      "Every 15 seconds",
      "Approximately every 2 minutes",
      "Only after the compressor becomes unable to continue",
      "Every 10 minutes"
    ],
    answerIndex: 1,
    explanation: "Compression quality can decline with rescuer fatigue. Switching approximately every 2 minutes, preferably during a planned rhythm-analysis pause, helps maintain effective compressions without creating an unnecessary interruption."
  },

  {
    id: "emt-cardiology-344",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with suspected acute coronary syndrome has a known severe aspirin allergy. Medical direction asks whether aspirin should be given. What should you report?",
    choices: [
      "The aspirin should be given because allergy is irrelevant during ACS",
      "The known aspirin allergy is a contraindication that must be reported",
      "Only the heart rate matters before administration",
      "Aspirin should be replaced with oral glucose"
    ],
    answerIndex: 1,
    explanation: "A known aspirin allergy is an important contraindication to aspirin administration. EMTs should verify allergies and follow their authorized protocol or medical direction."
  },

  {
    id: "emt-cardiology-345",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with prescribed nitroglycerin has chest discomfort and a systolic blood pressure of 86 mm Hg. What is the most appropriate action?",
    choices: [
      "Assist with nitroglycerin because the pain is severe",
      "Withhold nitroglycerin and follow medical direction or protocol",
      "Give two doses simultaneously",
      "Have the patient stand before administering it"
    ],
    answerIndex: 1,
    explanation: "Nitroglycerin can lower blood pressure. Significant hypotension is a reason to withhold it and seek appropriate medical direction or follow the applicable protocol. The exact blood-pressure threshold can vary by authorized protocol."
  },

  {
    id: "emt-cardiology-346",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which patient has a higher likelihood of presenting with ACS without classic crushing chest pain?",
    choices: [
      "A healthy 19-year-old with no risk factors",
      "An older adult with diabetes",
      "A healthy 30-year-old athlete",
      "A teenager with an isolated ankle injury"
    ],
    answerIndex: 1,
    explanation: "Older adults and people with diabetes are among those who may have atypical or less obvious ACS presentations. Symptoms can include dyspnea, weakness, nausea, fatigue, or epigastric discomfort rather than classic chest pain."
  },

  {
    id: "emt-cardiology-347",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which change during CPR would most directly indicate that the rescuer is allowing appropriate chest recoil?",
    choices: [
      "The rescuer's hands remain continuously pressed against the sternum",
      "The chest returns to its normal position between compressions",
      "The compression rate increases above 140 per minute",
      "The rescuer stops ventilating"
    ],
    answerIndex: 1,
    explanation: "Complete recoil means the chest returns to its normal position after each compression. This helps maintain venous return and cardiac filling."
  },

  {
    id: "emt-cardiology-348",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An AED pad would otherwise be positioned directly over a visible implanted pacemaker below the clavicle. What should the EMT do?",
    choices: [
      "Place the pad directly over the device",
      "Do not use the AED",
      "Position the pad so it is not directly over the implanted device",
      "Wait for a physician before applying the pads"
    ],
    answerIndex: 2,
    explanation: "An implanted pacemaker or defibrillator is not a reason to withhold defibrillation. The AED pad should not be placed directly over the implanted device. Move the pad to an appropriate nearby position while maintaining effective pad placement."
  },

  {
    id: "emt-cardiology-349",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which action is most likely to reduce coronary perfusion during CPR?",
    choices: [
      "Allowing full recoil",
      "Maintaining a rate of 100 to 120 compressions per minute",
      "Leaning on the patient's chest between compressions",
      "Minimizing pauses"
    ],
    answerIndex: 2,
    explanation: "Leaning on the chest prevents full recoil and can increase intrathoracic pressure, reducing venous return and coronary perfusion. Full recoil is therefore an important component of high-quality CPR."
  },

  {
    id: "emt-cardiology-350",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An adult in cardiac arrest has a shock advised by the AED. Which action would be inappropriate immediately after the shock?",
    choices: [
      "Resuming chest compressions",
      "Continuing CPR according to the AED prompts",
      "Pausing for an extended pulse check before restarting CPR",
      "Maintaining attention to the AED's next instruction"
    ],
    answerIndex: 2,
    explanation: "An extended pulse check after a shock unnecessarily interrupts CPR. Compressions should resume promptly, and the AED will guide the next rhythm analysis."
  },

  {
    id: "emt-cardiology-351",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which situation best demonstrates the importance of minimizing interruptions during adult CPR?",
    choices: [
      "Stopping compressions for an extended period to reposition equipment",
      "Performing a brief pause only when the AED requires rhythm analysis",
      "Stopping CPR whenever a rescuer becomes curious about the rhythm",
      "Checking the pulse every 30 seconds"
    ],
    answerIndex: 1,
    explanation: "Interruptions should be limited to actions that are necessary and supported by resuscitation guidance. AED rhythm analysis is one of the brief interruptions that cannot be performed safely while compressions continue."


  },

  {
    id: "emt-trauma-102",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient has a deep thigh laceration with severe bleeding that continues despite firm direct pressure. What is the most appropriate next hemorrhage-control intervention?",
    choices: [
      "Apply an extremity tourniquet",
      "Apply ice and elevate the limb",
      "Wait several minutes before reassessing",
      "Apply a loose dressing and continue the secondary assessment"
    ],
    answerIndex: 0,
    explanation: "Life-threatening extremity hemorrhage that cannot be controlled with direct pressure should be treated with a tourniquet when available and appropriate. Rapid hemorrhage control takes priority over completing a routine assessment."
  },

  {
    id: "emt-trauma-103",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Where should an extremity tourniquet generally be positioned when the wound location is clearly identifiable?",
    choices: [
      "Directly over the wound",
      "Distal to the wound",
      "Proximal to the wound and not directly over a joint",
      "Around the wrist regardless of wound location"
    ],
    answerIndex: 2,
    explanation: "A tourniquet is positioned proximal to the wound so it can occlude arterial blood flow to the injured area. It should not be placed directly over a joint. Commercial tourniquets should be used according to their instructions."
  },

  {
    id: "emt-trauma-104",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "After applying a tourniquet to life-threatening extremity bleeding, which finding indicates that the intervention is working?",
    choices: [
      "The patient reports increasing pain",
      "Bleeding from the wound has stopped",
      "The extremity becomes warmer",
      "The patient's heart rate immediately returns to normal"
    ],
    answerIndex: 1,
    explanation: "The primary objective of a tourniquet is to stop life-threatening hemorrhage. The tourniquet should be tightened sufficiently to control bleeding, and its application time should be documented."
  },

  {
    id: "emt-trauma-105",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient has a penetrating chest wound with air moving through the wound during inspiration. Which intervention is most appropriate?",
    choices: [
      "Pack the wound deeply with gauze",
      "Apply an appropriate occlusive chest dressing",
      "Leave the wound completely uncovered",
      "Apply a tourniquet around the chest"
    ],
    answerIndex: 1,
    explanation: "An open chest wound should be covered with an appropriate occlusive dressing or commercially available chest seal according to training and protocol. The goal is to limit air entering the pleural space through the wound while monitoring for worsening respiratory compromise."
  },

  {
    id: "emt-trauma-106",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "After an open chest wound is sealed, the patient develops worsening respiratory distress and increasing difficulty with ventilation. What complication should you suspect?",
    choices: [
      "Simple ankle fracture",
      "Tension pneumothorax",
      "Isolated abdominal contusion",
      "Hypoglycemia"
    ],
    answerIndex: 1,
    explanation: "Worsening respiratory distress after sealing an open chest wound can indicate increasing intrathoracic pressure and development of tension physiology. The patient requires immediate reassessment and management according to the EMT's authorized scope and protocol."
  },

  {
    id: "emt-trauma-107",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient has a knife embedded in the abdomen. Which action is generally appropriate?",
    choices: [
      "Remove the knife to inspect the wound",
      "Stabilize the object and transport the patient",
      "Push the object farther into the abdomen to stop bleeding",
      "Cut the object out immediately regardless of transport concerns"
    ],
    answerIndex: 1,
    explanation: "An impaled object should generally be stabilized in place rather than removed because it may be limiting bleeding. Removal can cause catastrophic hemorrhage or further tissue injury. Exceptions depend on whether the object interferes with essential care or transport."
  },

  {
    id: "emt-trauma-108",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A trauma patient is anxious, pale, cool, and tachycardic, but still has a measurable blood pressure. What does this combination most strongly suggest?",
    choices: [
      "Compensated shock",
      "Normal physiologic response to exercise",
      "Complete cardiovascular collapse",
      "Isolated hypothermia"
    ],
    answerIndex: 0,
    explanation: "Tachycardia, peripheral vasoconstriction, and anxiety or restlessness can be early manifestations of compensated shock. Blood pressure may remain normal until compensatory mechanisms begin to fail."
  },

  {
    id: "emt-trauma-109",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which finding is generally more concerning for progressing hemorrhagic shock?",
    choices: [
      "Normal mental status with warm skin",
      "Increasing confusion accompanied by weak peripheral pulses",
      "Mild thirst after a long day",
      "A normal pulse rate with normal skin color"
    ],
    answerIndex: 1,
    explanation: "Progressive altered mental status and weak peripheral pulses can indicate worsening tissue hypoperfusion. EMTs should recognize shock early rather than waiting for severe hypotension."
  },

  {
    id: "emt-trauma-110",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient has abdominal organs protruding through a traumatic wound. Which intervention is appropriate?",
    choices: [
      "Push the organs back into the abdomen",
      "Cover the exposed organs with an appropriate sterile dressing and protect them from drying",
      "Scrub the organs with antiseptic solution",
      "Apply firm direct pressure directly onto the organs"
    ],
    answerIndex: 1,
    explanation: "Eviscerated abdominal organs should not be pushed back into the abdominal cavity in the field. They should be protected with an appropriate sterile dressing, commonly kept moist according to EMS teaching and protocol, and the patient should be transported promptly."
  },

  {
    id: "emt-trauma-111",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "An adult sustains a fall from a height greater than 10 feet. Which statement is most accurate?",
    choices: [
      "The mechanism alone proves the patient has a major injury",
      "The mechanism should increase suspicion for significant trauma",
      "A normal initial pulse eliminates the need for trauma assessment",
      "The patient can be discharged if there is no visible bleeding"
    ],
    answerIndex: 1,
    explanation: "Current field-triage guidance uses mechanisms such as falls from significant height as factors that can increase concern for serious injury. Mechanism alone does not establish an injury diagnosis, so the patient's actual findings and overall presentation remain important."
  },

  {
    id: "emt-trauma-112",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "After blunt chest trauma, a segment of the chest wall moves inward during inspiration while the remainder of the chest moves outward. What does this finding represent?",
    choices: [
      "Flail chest",
      "Cardiac tamponade",
      "Simple abdominal trauma",
      "Isolated clavicle fracture"
    ],
    answerIndex: 0,
    explanation: "Paradoxical movement of a chest-wall segment is characteristic of a flail segment. Significant underlying pulmonary injury may accompany the rib fractures, so respiratory status must be closely monitored."
  },

  {
    id: "emt-trauma-113",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "An adult has partial-thickness burns involving one entire arm and the anterior trunk. Approximately what percentage of body surface area is burned using the adult rule of nines?",
    choices: [
      "9%",
      "18%",
      "27%",
      "36%"
    ],
    answerIndex: 2,
    explanation: "Using the adult rule of nines, one entire arm represents approximately 9% and the anterior trunk approximately 18%. Together they represent about 27% of total body surface area."


  },

  {
    id: "emt-medical-349",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which three findings are assessed by the Cincinnati Prehospital Stroke Scale?",
    choices: [
      "Pupil size, blood pressure, and pulse",
      "Facial symmetry, arm drift, and speech",
      "Gait, grip strength, and memory",
      "Headache, nausea, and blood glucose"
    ],
    answerIndex: 1,
    explanation: "The Cincinnati stroke assessment evaluates facial droop, arm drift, and abnormal speech. An abnormal finding can indicate a possible stroke and should prompt rapid evaluation and transport."
  },

  {
    id: "emt-medical-350",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "A patient suddenly develops facial weakness and difficulty speaking. Which historical detail is especially important to determine?",
    choices: [
      "The patient's favorite food",
      "The last time the patient was known to be at their normal neurologic baseline",
      "The patient's blood type",
      "Whether the patient exercised that morning"
    ],
    answerIndex: 1,
    explanation: "The last-known-well time is critical in suspected stroke because hospital treatment decisions depend heavily on when the patient was last known to be neurologically normal. EMS should obtain the most precise time available."
  },

  {
    id: "emt-medical-351",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A confused patient has no known medical history. Which simple diagnostic assessment can identify a rapidly reversible cause of altered mental status?",
    choices: [
      "Blood glucose measurement",
      "Carotid auscultation",
      "Abdominal percussion",
      "Visual acuity testing"
    ],
    answerIndex: 0,
    explanation: "Hypoglycemia can cause altered mental status and can mimic neurologic emergencies. Blood glucose assessment is therefore an important early component of evaluating altered mental status when available within the provider's scope."
  },

  {
    id: "emt-medical-352",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient took their usual insulin but did not eat afterward. Which presentation would most strongly suggest hypoglycemia?",
    choices: [
      "Gradual thirst and frequent urination",
      "Rapid confusion with diaphoresis and cool skin",
      "Several days of deep respirations and fruity breath",
      "Slowly developing ankle swelling"
    ],
    answerIndex: 1,
    explanation: "Insulin can lower blood glucose rapidly when food is not consumed. Hypoglycemia commonly produces altered behavior or mental status along with sympathetic findings such as sweating, pallor, and tachycardia."
  },

  {
    id: "emt-medical-353",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Which patient should not receive oral glucose because airway protection is inadequate?",
    choices: [
      "An alert patient who can swallow normally",
      "A confused patient who follows commands and can swallow",
      "An unresponsive patient who cannot protect the airway",
      "A patient who is sweating but fully alert"
    ],
    answerIndex: 2,
    explanation: "Oral glucose requires adequate consciousness and the ability to swallow safely. Giving material by mouth to a patient who cannot protect the airway creates an aspiration risk."
  },

  {
    id: "emt-medical-354",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "A patient with diabetes reports several days of excessive thirst and urination and now has vomiting, deep rapid respirations, and fruity-smelling breath. Which condition is most consistent with this presentation?",
    choices: [
      "Hypoglycemia",
      "Diabetic ketoacidosis",
      "Isolated opioid intoxication",
      "Simple anxiety"
    ],
    answerIndex: 1,
    explanation: "The combination of prolonged hyperglycemic symptoms, vomiting, deep rapid respirations, and fruity breath is characteristic of diabetic ketoacidosis. The deep respirations represent respiratory compensation for metabolic acidosis."
  },

  {
    id: "emt-medical-355",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with a severe allergic reaction develops wheezing and a sensation of throat tightness. What should the EMT recognize?",
    choices: [
      "A mild localized reaction",
      "A potentially life-threatening anaphylactic reaction",
      "A normal response to anxiety",
      "An isolated dermatologic condition"
    ],
    answerIndex: 1,
    explanation: "Airway or breathing involvement after an allergen exposure is concerning for anaphylaxis. Epinephrine is the first-line treatment for anaphylaxis when indicated and authorized."
  },

  {
    id: "emt-medical-356",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Where should an epinephrine auto-injector generally be administered?",
    choices: [
      "Lateral thigh",
      "Forearm",
      "Abdomen",
      "Upper back"
    ],
    answerIndex: 0,
    explanation: "Epinephrine auto-injectors are designed for intramuscular administration into the lateral thigh. The device's instructions should be followed, and administration through clothing may be possible with many auto-injectors."
  },

  {
    id: "emt-medical-357",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "You arrive while a patient is actively experiencing a generalized seizure. What should you do first?",
    choices: [
      "Force a bite block between the teeth",
      "Restrain the patient's limbs",
      "Protect the patient from nearby hazards and injury",
      "Immediately give the patient oral medication"
    ],
    answerIndex: 2,
    explanation: "During an active seizure, the priority is preventing injury. Clear dangerous objects, protect the patient's head, and monitor the airway and duration of the seizure. Do not restrain the patient or place objects in the mouth."
  },

  {
    id: "emt-medical-358",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A generalized seizure continues for more than 5 minutes. Why is this especially concerning?",
    choices: [
      "It is always caused by hypoglycemia",
      "It meets a common clinical definition of status epilepticus and requires urgent treatment",
      "It means the seizure is almost certainly psychogenic",
      "It is expected and can safely be observed indefinitely"
    ],
    answerIndex: 1,
    explanation: "A seizure lasting 5 minutes or longer is commonly treated as status epilepticus, a medical emergency requiring rapid intervention. EMT priorities include airway and breathing support, monitoring, rapid transport, and early ALS involvement when appropriate."
  },

  {
    id: "emt-medical-359",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An unresponsive patient has pinpoint pupils and respirations of 6 per minute. Drug paraphernalia is nearby. What is the immediate priority?",
    choices: [
      "Perform a detailed medication history",
      "Provide effective ventilation and support the airway",
      "Place the patient in a recovery position without intervention",
      "Wait for naloxone to work before ventilating"
    ],
    answerIndex: 1,
    explanation: "Severe respiratory depression is immediately life-threatening. In suspected opioid poisoning, ventilation and oxygenation take priority because naloxone does not replace the need for effective ventilation while the patient remains hypoventilating."
  },

  {
    id: "emt-medical-360",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A pregnant patient in late gestation becomes pale and hypotensive while lying supine. What mechanism should you suspect?",
    choices: [
      "Compression of the inferior vena cava by the gravid uterus",
      "A sudden increase in cerebral blood flow",
      "Compression of the carotid arteries",
      "An isolated upper-airway obstruction"
    ],
    answerIndex: 0,
    explanation: "In late pregnancy, the gravid uterus can compress major abdominal vessels when the patient lies supine, reducing venous return and cardiac output. Repositioning to reduce this compression can improve maternal circulation."


  },

  {
    id: "emt-medical-361",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A woman at term has contractions every two minutes and the baby's head is visible at the vaginal opening. What does the visible presenting part indicate?",
    choices: [
      "Delivery is likely imminent",
      "The first stage of labor has just begun",
      "The patient should always be transported before delivery",
      "The contractions are not productive"
    ],
    answerIndex: 0,
    explanation: "Visible crowning indicates that delivery is imminent. The EMT should prepare for an on-scene delivery rather than attempting to delay or unnecessarily transport a delivery that is already occurring."
  },

  {
    id: "emt-medical-362",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which sequence correctly describes the three stages of labor?",
    choices: [
      "Contractions to cervical dilation, delivery of the infant, delivery of the placenta",
      "Delivery of the placenta, cervical dilation, delivery of the infant",
      "Crowning, contractions, delivery of the placenta",
      "Rupture of membranes, delivery of the placenta, cervical dilation"
    ],
    answerIndex: 0,
    explanation: "The first stage involves cervical dilation from the onset of regular labor. The second stage extends from complete dilation through delivery of the infant. The third stage ends with delivery of the placenta."
  },

  {
    id: "emt-medical-363",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "During delivery, you notice that the umbilical cord is loosely wrapped around the newborn's neck. What should you attempt first?",
    choices: [
      "Push the baby's head back into the birth canal",
      "Gently slip the cord over the baby's head",
      "Immediately pull on the cord",
      "Clamp and cut the cord before attempting anything else"
    ],
    answerIndex: 1,
    explanation: "If the cord is loose enough, it can generally be gently slipped over the newborn's head. If it cannot be reduced and is compromising delivery, management should follow obstetric emergency protocols."
  },

  {
    id: "emt-medical-364",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A newborn remains apneic after being dried, warmed, and stimulated. What is the next major resuscitation priority?",
    choices: [
      "Wait several more minutes for spontaneous breathing",
      "Begin appropriate positive-pressure ventilation",
      "Immediately begin adult-style chest compressions",
      "Give oral glucose"
    ],
    answerIndex: 1,
    explanation: "Effective ventilation is the central intervention for a newborn who remains apneic after initial steps. Positive-pressure ventilation should be initiated according to neonatal resuscitation guidance, with escalation based on the newborn's heart rate and response."
  },


  {
    id: "emt-ops-435",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question: "You are dispatched to a reported overdose. As you approach the location, you hear shouting and breaking glass inside. What should you do?",
    choices: [
      "Enter immediately because the patient may be critically ill",
      "Enter through a different door without notifying anyone",
      "Stage at a safe location and request appropriate law-enforcement assistance",
      "Send one EMT inside alone to assess the patient"
    ],
    answerIndex: 2,
    explanation: "Scene safety takes priority over patient contact. An active or potentially violent scene should be secured before EMS personnel enter. An injured EMS provider cannot provide care and creates an additional emergency."
  },

  {
    id: "emt-ops-436",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question: "At a multiple-casualty incident, you direct all patients who can walk to a designated location. In START triage, these patients are initially categorized as:",
    choices: [
      "Immediate",
      "Delayed",
      "Minor",
      "Expectant"
    ],
    answerIndex: 2,
    explanation: "START begins by identifying ambulatory patients and directing them to a designated area. They are initially categorized as minor or green, although they still require reassessment because their conditions can change."
  },

  {
    id: "emt-ops-437",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question: "During START triage, an adult patient is breathing 34 times per minute. How should the patient initially be categorized?",
    choices: [
      "Minor",
      "Delayed",
      "Immediate",
      "Expectant"
    ],
    answerIndex: 2,
    explanation: "Traditional START triage classifies an adult respiratory rate greater than 30 per minute as immediate. This is part of the rapid RPM approach used to identify patients requiring priority treatment."
  },

  {
    id: "emt-ops-438",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "An unconscious patient has no family present and cannot provide consent. Which principle generally permits emergency treatment when immediate care is necessary?",
    choices: [
      "Expressed consent",
      "Implied consent",
      "Good Samaritan protection",
      "A witness signature"
    ],
    answerIndex: 1,
    explanation: "Implied consent allows EMS providers to provide necessary emergency care when a patient is unable to provide informed consent and circumstances indicate that a reasonable person would generally want treatment. Good Samaritan laws address liability protection rather than serving as the source of consent."
  },

  {
    id: "emt-ops-439",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "A competent adult with chest pain refuses transport after you explain the potential consequences. What is the most important consideration before accepting the refusal?",
    choices: [
      "Whether the patient's neighbor approves",
      "Whether the patient has decision-making capacity and understands the risks",
      "Whether a police officer signs the refusal",
      "Whether the patient promises to call a family member"
    ],
    answerIndex: 1,
    explanation: "A competent adult generally has the right to refuse care or transport. EMS must determine whether the patient has decision-making capacity, provide appropriate information about risks and alternatives, follow applicable protocol, and document the refusal."
  },

  {
    id: "emt-ops-440",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "An EMT begins treating a patient and then leaves without obtaining a valid refusal or transferring care to an appropriate provider. Which legal concept is most directly involved?",
    choices: [
      "Abandonment",
      "Libel",
      "Battery",
      "False imprisonment"
    ],
    answerIndex: 0,
    explanation: "Abandonment occurs when an EMS provider terminates an established duty of care without appropriate transfer, refusal, or another legally recognized basis. Once care begins, the provider must ensure an appropriate disposition."
  },

  {
    id: "emt-ops-441",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "Which combination represents the traditional four elements that must be established for a negligence claim?",
    choices: [
      "Duty, breach of duty, damages, and proximate cause",
      "Consent, transport, diagnosis, and treatment",
      "Licensure, medical direction, certification, and documentation",
      "Intent, arrest, restraint, and injury"
    ],
    answerIndex: 0,
    explanation: "Negligence generally requires a duty, a breach of the applicable standard of care, damages, and a causal connection between the breach and damages. Exact legal standards vary by jurisdiction, but these are the classic four elements taught in EMS education."
  },

  {
    id: "emt-ops-442",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "While lifting a loaded stretcher, which technique best reduces the risk of back injury?",
    choices: [
      "Bend primarily at the waist",
      "Keep the load far away from the body",
      "Use the legs while maintaining a stable, neutral back position",
      "Twist while lifting to turn toward the stretcher"
    ],
    answerIndex: 2,
    explanation: "Safe lifting involves a stable stance, maintaining the load close to the body, using the legs, and avoiding twisting while lifting. Coordinating the movement with the partner is also important."
  },

  {
    id: "emt-ops-443",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "An EMT discovers an error in a paper patient care report. What is the appropriate way to correct the documentation?",
    choices: [
      "Erase the original entry completely",
      "Use correction fluid to cover the error",
      "Preserve the original entry and make the correction according to agency documentation policy",
      "Destroy the original report and create a replacement"
    ],
    answerIndex: 2,
    explanation: "Legal medical documentation should preserve the original information and maintain a clear audit trail. For paper records, agencies commonly require a single line through the error with the correction and initials or other required notation. Electronic systems generally use formal correction or addendum functions."
  },

  {
    id: "emt-ops-444",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "Which person would generally be an appropriate recipient of a patient's protected medical information after transport?",
    choices: [
      "A reporter who heard about the call",
      "A curious neighbor",
      "The receiving emergency department team involved in the patient's care",
      "The EMT's friends"
    ],
    answerIndex: 2,
    explanation: "Patient information may be shared with appropriate members of the healthcare team for legitimate care purposes. EMS providers should not disclose patient information to curious bystanders, friends, or media simply because they are interested in the incident."
  },

  {
    id: "emt-ops-445",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question: "At a mass-casualty incident, an adult patient remains apneic after one airway-opening attempt. Under traditional START methodology, how is the patient categorized?",
    choices: [
      "Immediate",
      "Delayed",
      "Minor",
      "Expectant"
    ],
    answerIndex: 3,
    explanation: "Traditional START uses a single airway-opening attempt for an apneic adult. If the patient remains apneic, the patient is categorized as expectant under the traditional system, allowing responders to move on to patients who may benefit more immediately from limited resources."
  },

  {
    id: "emt-ops-446",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question: "Which action best demonstrates appropriate scene-size-up practice at an unknown hazardous scene?",
    choices: [
      "Begin patient contact before identifying hazards",
      "Determine hazards, use appropriate PPE, identify the number of patients, and request resources as needed",
      "Ignore bystanders because they cannot provide useful information",
      "Assume the scene is safe once the ambulance is parked"
    ],
    answerIndex: 1,
    explanation: "Scene size-up involves identifying hazards, selecting appropriate PPE, determining the number of patients, considering mechanism or nature of illness, and requesting additional resources when necessary. Scene safety must be reassessed throughout the call."
  },

  {
    id: "emt-ops-447",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "Which statement best describes the purpose of the National Registry's EMT examination blueprint?",
    choices: [
      "It establishes the exact treatment protocol used in every state",
      "It identifies the major domains and job-related content used to construct the certification examination",
      "It replaces all state EMS protocols",
      "It determines the medications every EMT may administer regardless of jurisdiction"
    ],
    answerIndex: 1,
    explanation: "The National Registry test plan identifies the content domains and job-related knowledge and skills assessed on the certification examination. State and local authorities remain responsible for scope and protocols within their jurisdictions."
  },

  {
    id: "emt-airway-132",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient is breathing 6 times per minute with shallow chest movement and has a pulse. Which intervention addresses the immediate physiologic problem?",
    choices: [
      "Apply a nasal cannula and reassess in 15 minutes",
      "Provide assisted ventilations with a BVM",
      "Place the patient in a recovery position and wait",
      "Encourage the patient to breathe faster"
    ],
    answerIndex: 1,
    explanation: "The problem is inadequate ventilation, not simply low oxygen concentration. A patient with severe hypoventilation requires assisted ventilation. Supplemental oxygen alone does not adequately correct insufficient alveolar ventilation."
  },

  {
    id: "emt-airway-133",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient receiving BVM ventilation develops obvious abdominal distention. Which change may reduce this complication?",
    choices: [
      "Ventilate more rapidly",
      "Use excessive ventilation pressure",
      "Deliver controlled ventilations that produce visible chest rise without excessive volume or force",
      "Stop monitoring the chest and focus only on the oxygen cylinder"
    ],
    answerIndex: 2,
    explanation: "Excessive ventilation pressure or volume can force air into the stomach. Controlled ventilations that produce visible chest rise while avoiding unnecessary pressure reduce the likelihood of gastric insufflation."
  },

  {
    id: "emt-cardiology-352",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient is unresponsive and has only occasional gasping respirations. You cannot definitely palpate a pulse within the initial assessment period. What should you do?",
    choices: [
      "Treat the gasps as normal breathing",
      "Begin CPR and use the AED as soon as available",
      "Place the patient in a recovery position",
      "Give oral glucose"
    ],
    answerIndex: 1,
    explanation: "Agonal gasps are not effective normal breathing. When an adult is unresponsive and not breathing normally and a definite pulse cannot be identified promptly, the patient should be treated as being in cardiac arrest and resuscitation should begin."
  },

  {
    id: "emt-cardiology-353",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which action should be avoided during AED rhythm analysis?",
    choices: [
      "Standing clear of the patient",
      "Following the AED's verbal instructions",
      "Continuing chest compressions",
      "Preparing to resume CPR"
    ],
    answerIndex: 2,
    explanation: "The patient must remain motionless during AED rhythm analysis. Compressions and other physical contact can introduce artifact and interfere with rhythm interpretation."
  },

  {
    id: "emt-trauma-114",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A trauma patient becomes increasingly restless and pale while the blood pressure remains within the normal range. Why should the EMT remain concerned?",
    choices: [
      "Shock always causes hypertension",
      "Compensated shock can initially preserve blood pressure",
      "Normal blood pressure rules out internal bleeding",
      "Restlessness proves the patient has a psychiatric disorder"
    ],
    answerIndex: 1,
    explanation: "The body can maintain blood pressure temporarily through vasoconstriction and increased heart rate. Restlessness, pallor, cool skin, and tachycardia may therefore provide earlier evidence of shock than hypotension."
  },

  {
    id: "emt-trauma-115",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with a severe extremity hemorrhage has a commercial tourniquet applied, but bleeding continues. What should the EMT consider?",
    choices: [
      "Loosen the tourniquet repeatedly",
      "Ensure the tourniquet is appropriately tightened and consider additional tourniquet application according to training and protocol",
      "Remove the tourniquet and use ice",
      "Cover the tourniquet with a loose dressing without reassessing bleeding"
    ],
    answerIndex: 1,
    explanation: "Persistent life-threatening bleeding indicates inadequate hemorrhage control. The EMT should reassess tourniquet placement and tension and follow current hemorrhage-control training, which may include adding a second tourniquet when appropriate."
  },

  {
    id: "emt-medical-365",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient with a suspected opioid overdose is breathing adequately after initial assessment. Which finding would indicate deterioration requiring immediate ventilatory support?",
    choices: [
      "Respiratory rate falls to 6 per minute with shallow respirations",
      "The patient becomes more alert",
      "The patient begins speaking clearly",
      "The patient maintains normal chest movement"
    ],
    answerIndex: 0,
    explanation: "A respiratory rate of 6 with shallow respirations represents inadequate ventilation. If respiratory effort is insufficient, the EMT must support ventilation rather than relying on positioning or supplemental oxygen alone."
  },

  {
    id: "emt-medical-366",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which finding would favor hypoglycemia over diabetic ketoacidosis?",
    choices: [
      "Several days of excessive thirst",
      "Deep rapid respirations",
      "Rapid onset of sweating, confusion, and altered behavior",
      "Fruity breath odor"
    ],
    answerIndex: 2,
    explanation: "Hypoglycemia often develops rapidly and can produce sweating, altered behavior, confusion, and other sympathetic findings. DKA generally develops over a longer period and is associated with hyperglycemia, dehydration, metabolic acidosis, and compensatory deep respirations."
  },

  {
    id: "emt-medical-367",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient develops hives after a bee sting but has normal breathing, normal blood pressure, and no airway swelling. Which finding would most clearly indicate progression to anaphylaxis?",
    choices: [
      "Localized redness around the sting",
      "Mild itching confined to the arm",
      "Wheezing and respiratory distress",
      "A heart rate of 84 per minute"
    ],
    answerIndex: 2,
    explanation: "Anaphylaxis is concerning when systemic allergic involvement produces airway, breathing, or circulatory compromise. Wheezing and respiratory distress indicate lower-airway involvement and require urgent treatment."
  },

  {
    id: "emt-medical-368",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient has just stopped having generalized convulsions and is unresponsive with noisy respirations. What should the EMT prioritize?",
    choices: [
      "Detailed questioning about the patient's diet",
      "Airway assessment and support",
      "Immediate oral medication",
      "Forcing the patient to sit upright"
    ],
    answerIndex: 1,
    explanation: "The postictal patient may have reduced airway protective reflexes and retained secretions. Airway assessment, positioning, suction as indicated, oxygenation, and ventilation support take priority after the seizure."
  },

  {
    id: "emt-medical-369",
    domain: "Medical + OBGYN",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A newborn's heart rate remains below 100/min after initial warming, drying, and stimulation. What intervention should be prioritized?",
    choices: [
      "Positive-pressure ventilation",
      "Immediate oral feeding",
      "Adult-dose epinephrine",
      "Waiting another five minutes"
    ],
    answerIndex: 0,
    explanation: "A newborn with apnea, gasping, or a heart rate below 100/min after initial steps generally requires positive-pressure ventilation. Effective ventilation is the key intervention in neonatal resuscitation."
  },

  {
    id: "emt-ops-448",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "sceneSafety",
    question: "At a hazardous scene, a bystander tells you that there may be a second patient inside a damaged vehicle. What should you do?",
    choices: [
      "Enter immediately regardless of hazards",
      "Assess the hazards and request the appropriate specialized resources before entering when necessary",
      "Ignore the information because the first patient is already being treated",
      "Send an unprotected bystander into the vehicle"
    ],
    answerIndex: 1,
    explanation: "Scene size-up includes identifying hazards, determining the number of patients, and requesting resources appropriate to the situation. EMS providers should not enter a hazardous environment without appropriate protection and resources."
  },

  {
    id: "emt-ops-449",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "Which action best protects patient confidentiality after an EMS call?",
    choices: [
      "Discuss the call with friends without using the patient's name",
      "Post an unusual case on social media without identifying the patient",
      "Share relevant patient information with the receiving healthcare team",
      "Tell curious bystanders the patient's diagnosis"
    ],
    answerIndex: 2,
    explanation: "Patient information should be disclosed only for legitimate purposes, such as continuity of care or another legally authorized reason. Removing a name does not necessarily make a case impossible to identify."
  },

  {
    id: "emt-cardiology-354",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "You arrive to find a 6-year-old in cardiac arrest. Your AED has only standard adult pads and no pediatric dose attenuator. What is the most appropriate action?",
    choices: [
      "Do not use the AED because adult pads are contraindicated in children",
      "Cut the adult pads into smaller pieces before applying them",
      "Apply the adult pads even if they overlap on the child's chest",
      "Use the adult pads, positioning them so they do not touch each other"
    ],
    answerIndex: 3,
    explanation: "When pediatric pads or an attenuator are unavailable, an AED with adult pads should still be used for a child in cardiac arrest. The pads must not overlap or touch. If necessary because of the child's size, an anterior-posterior configuration can help keep the pads separated. Pads should never be cut or modified."
  },

  {
    id: "emt-cardiology-355",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "An AED arrives while CPR is being performed on a small child. Which consideration is most important when selecting pad placement?",
    choices: [
      "The pads should be placed directly over the sternum and spine",
      "The pads should be positioned so they do not touch or overlap",
      "The pads should always be placed on the abdomen and upper chest",
      "The pads should be cut to match the child's chest size"
    ],
    answerIndex: 1,
    explanation: "Defibrillation pads must be positioned so the electrical current can pass through the heart without the pads touching or overlapping. Pediatric pads or an attenuator are preferred when available, but adult pads should be used rather than delaying defibrillation when pediatric equipment is unavailable."
  },

  {
    id: "emt-cardiology-356",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "You assess an unresponsive infant who is not breathing normally. Which pulse site should an EMT use to assess circulation?",
    choices: [
      "Radial artery",
      "Carotid artery",
      "Brachial artery",
      "Dorsalis pedis artery"
    ],
    answerIndex: 2,
    explanation: "For an infant, the brachial pulse is the recommended pulse site for healthcare-provider assessment. The carotid pulse is used for older children and adults. Peripheral pulses such as the radial or dorsalis pedis pulse may be difficult to detect during poor perfusion."
  },

  {
    id: "emt-cardiology-357",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Why is the brachial artery commonly used when assessing the pulse of an infant?",
    choices: [
      "It is normally the strongest pulse in every infant",
      "It can be located relatively easily on the medial upper arm",
      "The carotid artery is never palpable in infants",
      "Peripheral pulses cannot exist in infants"
    ],
    answerIndex: 1,
    explanation: "The brachial artery on the medial upper arm provides a practical central pulse location in infants. The neck is small and the carotid pulse can be more difficult to locate reliably."
  },

  {
    id: "emt-cardiology-358",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An unresponsive adult is not breathing normally. You cannot immediately determine whether a carotid pulse is present. How long should you spend checking before beginning CPR?",
    choices: [
      "No more than 10 seconds",
      "Approximately 20 seconds",
      "Approximately 30 seconds",
      "As long as necessary to be completely certain"
    ],
    answerIndex: 0,
    explanation: "A healthcare provider should check for a pulse for no more than 10 seconds. If a definite pulse is not felt within that period, CPR should begin. Prolonged pulse checks delay chest compressions."
  },

  {
    id: "emt-cardiology-359",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "During a cardiac arrest assessment, the EMT spends 25 seconds trying to determine whether a carotid pulse is present. What is the primary problem with this action?",
    choices: [
      "The EMT may cause a carotid artery injury",
      "The patient may become hypertensive",
      "Chest compressions are being unnecessarily delayed",
      "A pulse check longer than 10 seconds causes ventricular fibrillation"
    ],
    answerIndex: 2,
    explanation: "The major concern is delay in CPR. Current resuscitation guidance emphasizes rapid recognition of cardiac arrest and minimizing interruptions in chest compressions."
  },

  {
    id: "emt-cardiology-360",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An unresponsive adult has occasional irregular gasps separated by long pauses. How should the EMT interpret this breathing pattern?",
    choices: [
      "Normal breathing",
      "Adequate hypoventilation",
      "Agonal respirations",
      "A mild airway obstruction"
    ],
    answerIndex: 2,
    explanation: "Gasping, irregular, ineffective respirations in an unresponsive patient are agonal respirations and should not be mistaken for normal breathing. An unresponsive patient with abnormal breathing should be evaluated promptly for cardiac arrest."
  },

  {
    id: "emt-cardiology-361",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Why can agonal respirations be especially dangerous if an EMT mistakes them for normal breathing?",
    choices: [
      "They indicate severe asthma but usually preserve circulation",
      "They can cause the EMT to delay CPR for a patient in cardiac arrest",
      "They indicate that the patient has regained a pulse",
      "They are evidence of adequate oxygenation"
    ],
    answerIndex: 1,
    explanation: "Agonal gasps can occur during the early minutes of cardiac arrest. Treating them as normal breathing can delay recognition of arrest and initiation of CPR."
  },

  {
    id: "emt-cardiology-362",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which patient presentation should cause an EMT to maintain the highest suspicion for acute coronary syndrome?",
    choices: [
      "Sharp pain reproducible by palpation after lifting a heavy object",
      "Substernal pressure accompanied by diaphoresis and nausea",
      "Localized rib pain after a direct blow to the chest",
      "Brief pain occurring only when taking a deep breath"
    ],
    answerIndex: 1,
    explanation: "Pressure, squeezing, heaviness, or discomfort in the chest accompanied by symptoms such as diaphoresis, nausea, dyspnea, or radiation is concerning for ACS. Other presentations can have different causes, although no single symptom completely excludes ACS."
  },

  {
    id: "emt-cardiology-363",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "A patient reports vague nausea, unusual fatigue, and shortness of breath without chest pain. Which history would most increase your concern for an atypical myocardial infarction?",
    choices: [
      "Age 22 with no medical history",
      "History of seasonal allergies",
      "Older age and diabetes mellitus",
      "History of an uncomplicated ankle fracture"
    ],
    answerIndex: 2,
    explanation: "Older adults and patients with diabetes can experience atypical or less painful myocardial ischemia. Women also have a higher likelihood of atypical ACS presentations. Absence of classic chest pain does not exclude ACS."
  },

  {
    id: "emt-cardiology-364",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which symptom combination could represent an atypical acute coronary syndrome presentation even without chest pressure?",
    choices: [
      "Sudden unusual fatigue, nausea, and dyspnea",
      "Itching after exposure to poison ivy",
      "Localized pain after twisting an ankle",
      "Nasal congestion and seasonal sneezing"
    ],
    answerIndex: 0,
    explanation: "ACS can present with dyspnea, nausea, weakness, fatigue, syncope, or other nonspecific symptoms, particularly in older adults, women, and people with diabetes. EMTs should maintain clinical suspicion rather than relying exclusively on classic chest pain."
  },

  {
    id: "emt-cardiology-365",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with suspected ACS has no aspirin allergy or active bleeding, and your local protocol permits aspirin administration. Which dose is generally recommended?",
    choices: [
      "40 mg swallowed whole",
      "81 mg placed under the tongue",
      "160 to 325 mg chewed",
      "650 mg swallowed whole"
    ],
    answerIndex: 2,
    explanation: "Aspirin for suspected ACS is commonly administered at 160 to 325 mg and should be chewed when appropriate to facilitate absorption. Exact EMS protocols should be followed."
  },

  {
    id: "emt-cardiology-366",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Why is aspirin given to a patient with suspected acute coronary syndrome?",
    choices: [
      "It rapidly dissolves the coronary clot",
      "It reduces platelet aggregation and limits thrombus growth",
      "It directly increases myocardial contractility",
      "It lowers blood glucose"
    ],
    answerIndex: 1,
    explanation: "Aspirin inhibits platelet aggregation, helping limit progression of a coronary thrombus. It does not directly dissolve an established clot or function as a positive inotrope."
  },

  {
    id: "emt-cardiology-367",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Which finding is a clear reason to withhold aspirin when evaluating a patient for suspected ACS?",
    choices: [
      "A history of coronary artery disease",
      "A previous coronary stent",
      "A true aspirin allergy",
      "Daily use of low-dose aspirin"
    ],
    answerIndex: 2,
    explanation: "A known aspirin allergy is a contraindication. Active significant bleeding may also preclude administration. A history of coronary disease or prior stenting is not itself a reason to withhold aspirin."
  },

  {
    id: "emt-cardiology-368",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with suspected ACS reports that he takes aspirin 81 mg every morning. Your protocol permits an ACS aspirin dose and no contraindications are present. Which statement is most accurate?",
    choices: [
      "The patient's daily aspirin automatically prohibits another dose",
      "Aspirin should be given only after nitroglycerin",
      "The patient's existing aspirin use does not automatically preclude the protocol dose",
      "Aspirin should never be given to patients with coronary disease"
    ],
    answerIndex: 2,
    explanation: "Daily low-dose aspirin use does not automatically contraindicate administration of the protocol-directed ACS dose. The EMT should follow local protocol and assess for allergy, active bleeding, and other contraindications."
  },

  {
    id: "emt-cardiology-369",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with chest pressure has prescribed nitroglycerin. His systolic blood pressure is 82 mmHg. What is the most appropriate action?",
    choices: [
      "Assist with nitroglycerin because chest pain is severe",
      "Double the nitroglycerin dose",
      "Withhold the nitroglycerin and follow medical direction or protocol",
      "Have the patient stand to improve circulation before taking it"
    ],
    answerIndex: 2,
    explanation: "Nitroglycerin causes vasodilation and can further lower blood pressure. A systolic pressure of 82 mmHg is clearly too low for routine nitroglycerin administration. The exact protocol threshold varies by EMS system."
  },

  {
    id: "emt-cardiology-370",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Which medication history is most important to identify before assisting a patient with prescribed nitroglycerin?",
    choices: [
      "Recent use of a phosphodiesterase-5 inhibitor",
      "Use of an over-the-counter multivitamin",
      "Use of topical antibiotic ointment",
      "A remote history of seasonal allergies"
    ],
    answerIndex: 0,
    explanation: "PDE-5 inhibitors such as sildenafil and tadalafil can significantly potentiate the hypotensive effects of nitrates. The appropriate withholding interval depends on the medication and local protocol."
  },

  {
    id: "emt-cardiology-371",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with suspected ACS reports taking tadalafil recently. His blood pressure is currently adequate. What should the EMT do regarding nitroglycerin?",
    choices: [
      "Give nitroglycerin at half the usual dose",
      "Give nitroglycerin because his blood pressure is normal",
      "Withhold nitroglycerin and follow protocol or contact medical direction",
      "Give two doses simultaneously to overcome the interaction"
    ],
    answerIndex: 2,
    explanation: "PDE-5 inhibitors can produce dangerous hypotension when combined with nitrates. The EMT should not attempt to compensate by giving a reduced nitrate dose. The appropriate withholding interval depends on the specific drug and protocol."
  },

  {
    id: "emt-cardiology-372",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "What cardiovascular effect is most directly responsible for nitroglycerin's ability to reduce myocardial oxygen demand?",
    choices: [
      "Increased venous return",
      "Reduced preload through venodilation",
      "Increased ventricular contractility",
      "Activation of the vagus nerve"
    ],
    answerIndex: 1,
    explanation: "Nitroglycerin causes vascular smooth-muscle relaxation, with prominent venodilation that reduces venous return and preload. This lowers cardiac workload and myocardial oxygen demand."
  },

  {
    id: "emt-cardiology-373",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient develops a headache shortly after receiving prescribed nitroglycerin. Which explanation is most appropriate?",
    choices: [
      "Nitroglycerin commonly causes vasodilation that can produce headache",
      "The headache proves that the patient is having a stroke",
      "Nitroglycerin causes severe hypoglycemia",
      "The headache indicates that the medication has failed"
    ],
    answerIndex: 0,
    explanation: "Headache is a common effect of nitrate-induced vasodilation. The EMT should still monitor blood pressure and the patient's overall condition."
  },

  {
    id: "emt-cardiology-374",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient receives a dose of nitroglycerin for suspected ACS. Which assessment should be repeated before another dose if additional dosing is permitted?",
    choices: [
      "Blood pressure",
      "Visual acuity only",
      "Body temperature only",
      "Pupil size only"
    ],
    answerIndex: 0,
    explanation: "Nitroglycerin can lower blood pressure, so blood pressure must be reassessed before additional doses according to local protocol. The exact dosing schedule and maximum number of doses are protocol-dependent."
  },

  {
    id: "emt-cardiology-375",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which finding provides the strongest evidence that a patient in cardiac arrest has achieved ROSC?",
    choices: [
      "The AED displays a normal rhythm but no pulse is checked",
      "The patient has a definite pulse and begins breathing spontaneously",
      "The patient's pupils become smaller",
      "The chest rises during BVM ventilation"
    ],
    answerIndex: 1,
    explanation: "ROSC means that spontaneous circulation has returned. A definite pulse together with spontaneous breathing or other signs of life strongly supports ROSC. Chest rise during BVM ventilation only demonstrates that ventilation is occurring."
  },

  {
    id: "emt-cardiology-376",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A cardiac arrest patient regains a definite pulse but remains unresponsive. What is the priority during continued care?",
    choices: [
      "Immediately remove all monitoring equipment",
      "Perform a lengthy secondary assessment before transport",
      "Continue close monitoring and support airway, breathing, and circulation",
      "Hyperventilate the patient to eliminate carbon dioxide as quickly as possible"
    ],
    answerIndex: 2,
    explanation: "Patients immediately after ROSC remain unstable and can deteriorate or re-arrest. The EMT should support airway and breathing, monitor circulation and vital signs, avoid excessive ventilation, and transport appropriately."
  },

  {
    id: "emt-cardiology-377",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Why should an AED generally remain available after a patient achieves ROSC in the field?",
    choices: [
      "ROSC guarantees that the patient cannot arrest again",
      "The patient may experience recurrent cardiac arrest",
      "The AED is needed to measure blood glucose",
      "The AED must remain attached for aspirin administration"
    ],
    answerIndex: 1,
    explanation: "Post-cardiac-arrest patients remain unstable and may re-arrest. Monitoring and readiness to resume resuscitation are therefore important."
  },

  {
    id: "emt-cardiology-378",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "An adult cardiac arrest patient has an advanced airway placed by an appropriately trained provider. Which CPR pattern is generally used?",
    choices: [
      "30 compressions followed by 2 ventilations with a pause",
      "Continuous chest compressions with asynchronous ventilations",
      "Two minutes of ventilation followed by two minutes of compressions",
      "Ventilations only until a pulse returns"
    ],
    answerIndex: 1,
    explanation: "With an advanced airway in place during adult cardiac arrest, chest compressions continue without pauses for ventilation. Ventilations are delivered asynchronously at the guideline-recommended rate. Exact advanced-airway procedures depend on provider level and system protocol."
  },

  {
    id: "emt-cardiology-379",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "What is the primary reason excessive ventilation should be avoided during cardiac arrest?",
    choices: [
      "It increases venous return and improves circulation too much",
      "It can increase intrathoracic pressure and reduce venous return",
      "It guarantees gastric distention in every patient",
      "It causes the AED to malfunction"
    ],
    answerIndex: 1,
    explanation: "Excessive ventilation raises intrathoracic pressure, which can impede venous return to the heart and reduce cardiac output during CPR. High-quality CPR therefore emphasizes controlled ventilation."
  },

  {
    id: "emt-cardiology-380",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which action is part of the early response to a suspected out-of-hospital cardiac arrest?",
    choices: [
      "Delay activation of EMS until a full medical history is obtained",
      "Recognize the arrest and activate the emergency response system",
      "Transport the patient before beginning CPR",
      "Wait for an AED before determining whether the patient is responsive"
    ],
    answerIndex: 1,
    explanation: "Early recognition of cardiac arrest and activation of the emergency response system are essential components of the chain of survival. Current 2025 AHA guidance uses a unified Chain of Survival across adult and pediatric cardiac arrest rather than relying on the older separate chain terminology."
  },

  {
    id: "emt-cardiology-381",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient is unresponsive and gasping but has no definite pulse after a rapid pulse check. What should happen next?",
    choices: [
      "Provide only supplemental oxygen and reassess in five minutes",
      "Begin CPR",
      "Place the patient in the recovery position",
      "Give oral fluids"
    ],
    answerIndex: 1,
    explanation: "Gasping is abnormal breathing and can occur during cardiac arrest. If the patient is unresponsive, has abnormal breathing, and no definite pulse is detected within the appropriate assessment period, CPR should begin."
  },

  // ============================================================
  // AIRWAY
  // ============================================================

  {
    id: "emt-airway-134",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A 9-month-old suddenly becomes unable to cry or cough after choking on food. What should the EMT do?",
    choices: [
      "Perform abdominal thrusts",
      "Alternate 5 back blows with 5 chest thrusts",
      "Perform blind finger sweeps",
      "Give water to help move the food"
    ],
    answerIndex: 1,
    explanation: "For a responsive infant with severe foreign-body airway obstruction, current guidance recommends repeated cycles of 5 back blows followed by 5 chest thrusts. Abdominal thrusts are not used in infants, and blind finger sweeps should be avoided."
  },

  {
    id: "emt-airway-135",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Why are abdominal thrusts avoided in infants with severe foreign-body airway obstruction?",
    choices: [
      "Infants have no diaphragm",
      "Abdominal thrusts can cause significant internal injury in an infant",
      "Abdominal thrusts are ineffective in all age groups",
      "Infants cannot develop complete airway obstruction"
    ],
    answerIndex: 1,
    explanation: "Because of an infant's anatomy, abdominal thrusts carry a significant risk of internal injury. Current pediatric guidance recommends back blows and chest thrusts instead."
  },

  {
    id: "emt-airway-136",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A responsive adult suddenly cannot speak or produce an effective cough after choking. According to current AHA guidance, which intervention sequence is appropriate?",
    choices: [
      "Five abdominal thrusts followed by five back blows",
      "Five back blows followed by five abdominal thrusts",
      "Blind finger sweeps followed by water",
      "Chest compressions while the patient remains standing"
    ],
    answerIndex: 1,
    explanation: "The 2025 AHA guidelines recommend alternating 5 back blows with 5 abdominal thrusts for a conscious adult with severe foreign-body airway obstruction, beginning with back blows."
  },

  {
    id: "emt-airway-137",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A restaurant patron is coughing forcefully and can speak in complete sentences after choking on food. What is the best initial action?",
    choices: [
      "Immediately perform abdominal thrusts",
      "Encourage continued coughing and monitor for deterioration",
      "Perform five back blows",
      "Give the patient water"
    ],
    answerIndex: 1,
    explanation: "An effective cough and ability to speak indicate that air is still moving. The patient should be encouraged to continue coughing while being closely observed. Interventions are indicated if the obstruction becomes severe."
  },

  {
    id: "emt-airway-138",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which finding most strongly indicates a severe foreign-body airway obstruction in a conscious adult?",
    choices: [
      "Forceful coughing with a strong voice",
      "Ability to speak normally",
      "Inability to speak or produce an effective cough",
      "Mild throat irritation"
    ],
    answerIndex: 2,
    explanation: "Severe airway obstruction is characterized by ineffective or absent air movement, inability to speak, and inability to produce an effective cough. A forceful cough indicates that air is still moving."
  },

  {
    id: "emt-airway-139",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A conscious adult with severe airway obstruction becomes unresponsive. What should the EMT do next?",
    choices: [
      "Continue abdominal thrusts while the patient lies supine",
      "Begin CPR, starting with chest compressions",
      "Perform repeated blind finger sweeps",
      "Wait for an advanced airway provider"
    ],
    answerIndex: 1,
    explanation: "When a choking patient becomes unresponsive, CPR should be initiated beginning with chest compressions. When the airway is opened for ventilation, a visible foreign body may be removed, but blind finger sweeps should not be performed."
  },

  {
    id: "emt-airway-140",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "During CPR for an unresponsive choking patient, when should an EMT remove a foreign body from the mouth?",
    choices: [
      "Whenever the EMT suspects one is present",
      "Only when the object is visible and can be removed safely",
      "Before every compression cycle regardless of whether it is visible",
      "By sweeping the mouth with a finger"
    ],
    answerIndex: 1,
    explanation: "A visible foreign body should be removed when encountered. Blind finger sweeps are avoided because they can push an object farther into the airway."
  },

  // ============================================================
  // TRAUMA
  // ============================================================

  {
    id: "emt-trauma-116",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "An adult has bright red blood spurting from a deep thigh wound. Firm direct pressure has not controlled the hemorrhage. What is the most appropriate next intervention?",
    choices: [
      "Elevate the leg and reassess",
      "Apply a commercial tourniquet proximal to the wound",
      "Apply ice over the wound",
      "Wait for the bleeding to slow before treating it"
    ],
    answerIndex: 1,
    explanation: "Life-threatening extremity hemorrhage that is not rapidly controlled with direct pressure should be treated with a commercial tourniquet when appropriate. Elevation and pressure-point techniques should not delay definitive hemorrhage control."
  },

  {
    id: "emt-trauma-117",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Where should a tourniquet generally be positioned on an extremity when the wound location permits?",
    choices: [
      "Directly over the nearest joint",
      "Distal to the wound",
      "Proximal to the wound and not over a joint",
      "Around the patient's abdomen"
    ],
    answerIndex: 2,
    explanation: "A tourniquet should be placed proximal to the life-threatening extremity wound and not over a joint. The device is tightened until the hemorrhage is controlled."
  },

  {
    id: "emt-trauma-118",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A properly applied tourniquet has stopped the bleeding from a traumatic leg wound. Which action is appropriate?",
    choices: [
      "Loosen it every 10 minutes",
      "Remove it once the patient becomes comfortable",
      "Record the application time and leave it in place",
      "Cover it completely so the receiving team cannot see it"
    ],
    answerIndex: 2,
    explanation: "Once a tourniquet has been properly applied for life-threatening hemorrhage, it should not be routinely loosened or removed in the field. The application time should be documented and communicated to the receiving team."
  },

  {
    id: "emt-trauma-119",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Severe bleeding continues despite a correctly tightened tourniquet. What is the most appropriate next step?",
    choices: [
      "Loosen the first tourniquet",
      "Remove the first tourniquet and restart direct pressure",
      "Apply a second tourniquet adjacent to the first",
      "Apply ice to the extremity"
    ],
    answerIndex: 2,
    explanation: "If significant bleeding continues despite a properly applied tourniquet, a second tourniquet can be placed adjacent to the first, as appropriate to the device and bleeding-control guidance. The first tourniquet should not be loosened."
  },

  {
    id: "emt-trauma-120",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient has life-threatening hemorrhage from a deep groin wound where a tourniquet cannot be effectively applied. What is the most appropriate treatment?",
    choices: [
      "Pack the wound and apply firm, sustained pressure",
      "Place an occlusive dressing without pressure",
      "Apply an ice pack directly to the wound",
      "Wait for a surgical team before treating the wound"
    ],
    answerIndex: 0,
    explanation: "Junctional hemorrhage in areas such as the groin requires wound packing and firm direct pressure. Hemostatic gauze may be used when available and appropriate, with plain gauze as an alternative."
  },

  {
    id: "emt-trauma-121",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Which wound is most appropriate for wound packing rather than tourniquet application?",
    choices: [
      "Deep axillary wound",
      "Bleeding wound on the mid-forearm",
      "Bleeding wound on the lower leg",
      "Bleeding wound on the upper arm"
    ],
    answerIndex: 0,
    explanation: "The axilla is a junctional area where a standard extremity tourniquet may not be effective. The wound should be packed and firm pressure applied."
  },

  {
    id: "emt-trauma-122",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A trauma patient is pale, cool, anxious, tachycardic, and tachypneic after significant blood loss. His blood pressure remains 118/76 mmHg. What does this presentation most strongly suggest?",
    choices: [
      "Compensated shock",
      "Irreversible shock",
      "Neurogenic shock",
      "No shock because the blood pressure is normal"
    ],
    answerIndex: 0,
    explanation: "Tachycardia, tachypnea, anxiety, and cool pale skin can occur during compensated shock while the body maintains blood pressure through vasoconstriction and increased cardiac activity. Normal blood pressure does not rule out serious shock."
  },

  {
    id: "emt-trauma-123",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which change would most strongly indicate worsening hemorrhagic shock?",
    choices: [
      "Persistent mild anxiety",
      "Cool skin",
      "A progressively falling systolic blood pressure",
      "Heart rate of 108 beats/minute"
    ],
    answerIndex: 2,
    explanation: "Hypotension is a late and concerning sign of shock because compensatory mechanisms may maintain blood pressure until significant physiologic deterioration has occurred."
  },

  {
    id: "emt-trauma-124",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A child with significant traumatic blood loss has a normal blood pressure but is tachycardic and pale. What should the EMT conclude?",
    choices: [
      "The child cannot be in shock because the blood pressure is normal",
      "The normal blood pressure may reflect effective compensation",
      "The child has definitely developed neurogenic shock",
      "The tachycardia rules out hemorrhage"
    ],
    answerIndex: 1,
    explanation: "Children can compensate for significant blood loss through tachycardia and vasoconstriction and may maintain a normal blood pressure until late deterioration. A normal pediatric blood pressure therefore does not exclude serious hemorrhage."
  },

  {
    id: "emt-trauma-125",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A trauma patient has had significant external bleeding controlled and remains in shock. Which intervention is appropriate during transport?",
    choices: [
      "Give the patient water by mouth",
      "Place the patient in Trendelenburg position",
      "Prevent heat loss and transport promptly",
      "Delay transport for a complete secondary examination"
    ],
    answerIndex: 2,
    explanation: "Hemorrhagic shock requires continued monitoring, hemorrhage control, prevention of hypothermia, appropriate oxygenation and ventilation support, and timely transport. Oral fluids are inappropriate for an unstable trauma patient."
  },

  {
    id: "emt-trauma-126",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient with blunt chest trauma has a section of the chest wall that moves inward during inspiration and outward during expiration. What injury should the EMT suspect?",
    choices: [
      "Flail chest",
      "Simple pneumothorax",
      "Cardiac tamponade",
      "Hemothorax"
    ],
    answerIndex: 0,
    explanation: "Paradoxical movement of a chest-wall segment is characteristic of flail chest, which results from multiple rib fractures creating a free segment of the chest wall. Significant underlying pulmonary injury may also be present."
  },

  {
    id: "emt-trauma-127",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Why is a patient with a flail chest at increased risk for respiratory compromise?",
    choices: [
      "The injury can interfere with effective chest-wall mechanics and may be associated with pulmonary contusion",
      "The ribs become stronger and prevent lung expansion",
      "The injury always causes cardiac tamponade",
      "Flail chest prevents blood from reaching the brain"
    ],
    answerIndex: 0,
    explanation: "A flail segment disrupts normal chest-wall mechanics, and the force that caused the fractures may also produce pulmonary contusion. The patient's respiratory status must therefore be monitored closely."
  },

  {
    id: "emt-trauma-128",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "An EMT applies a nonvented occlusive dressing to an open chest wound. The patient's respiratory distress and hypotension rapidly worsen. What should the EMT consider doing immediately?",
    choices: [
      "Reinforce the seal more tightly",
      "Lift an edge of the dressing to allow air to escape",
      "Apply a second dressing over the first",
      "Give the patient oral fluids"
    ],
    answerIndex: 1,
    explanation: "Worsening respiratory distress and shock after sealing an open chest wound may indicate tension physiology. Temporarily lifting an edge of the dressing can allow trapped air to escape. The patient requires urgent reassessment and rapid transport."
  },

  {
    id: "emt-trauma-129",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "What is the primary purpose of an occlusive dressing over an open chest wound?",
    choices: [
      "To prevent air from entering the pleural space through the wound",
      "To absorb all blood from the chest cavity",
      "To immobilize the cervical spine",
      "To reduce internal bleeding from the heart"
    ],
    answerIndex: 0,
    explanation: "An open chest wound can allow air to enter the pleural space. An occlusive dressing helps seal the wound. A vented dressing can allow air to escape while limiting additional air entry."
  },

  {
    id: "emt-trauma-130",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which finding is generally considered a late sign of tension pneumothorax rather than an early finding?",
    choices: [
      "Increasing respiratory distress",
      "Tachycardia",
      "Unilateral diminished breath sounds",
      "Tracheal deviation"
    ],
    answerIndex: 3,
    explanation: "Tracheal deviation is a late and unreliable finding of tension pneumothorax. EMTs should act on the overall clinical picture rather than waiting for tracheal deviation."
  },

  {
    id: "emt-trauma-131",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A trauma patient develops severe respiratory distress, tachycardia, hypotension, and markedly diminished breath sounds on one side. What condition should be strongly suspected?",
    choices: [
      "Tension pneumothorax",
      "Isolated rib fracture",
      "Hypoglycemia",
      "Simple ankle fracture"
    ],
    answerIndex: 0,
    explanation: "The combination of severe respiratory distress, unilateral diminished breath sounds, and hemodynamic deterioration is highly concerning for tension pneumothorax."
  },

  {
    id: "emt-trauma-132",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which trauma patient most clearly meets a common indication for spinal motion restriction?",
    choices: [
      "Alert patient with isolated paraspinal muscle soreness and a normal neurologic exam",
      "Alert patient with midline cervical tenderness after a significant fall",
      "Alert patient with no neck pain and a normal examination after a minor incident",
      "Alert patient with a superficial forearm abrasion"
    ],
    answerIndex: 1,
    explanation: "Midline spinal tenderness is a major indication for spinal motion restriction in commonly used national criteria. Exact implementation depends on the EMS system and protocol."
  },

  {
    id: "emt-trauma-133",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which finding would increase concern for spinal injury after trauma?",
    choices: [
      "Focal neurologic deficit",
      "Normal sensation and strength",
      "No spinal tenderness",
      "No distracting injuries and a completely reliable examination"
    ],
    answerIndex: 0,
    explanation: "A focal neurologic deficit is a major concerning finding after trauma and supports spinal motion restriction and further evaluation."
  },

  {
    id: "emt-trauma-134",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient meets criteria for spinal motion restriction. Which statement about the long backboard is most consistent with modern EMS practice?",
    choices: [
      "It should routinely remain under the patient throughout transport",
      "It is primarily a device for extrication and movement rather than routine transport",
      "It eliminates the need for ongoing neurologic assessment",
      "It should be used for every patient with back pain"
    ],
    answerIndex: 1,
    explanation: "Modern EMS practice generally treats the long backboard primarily as an extrication and movement tool. Patients requiring spinal motion restriction can generally be secured to the ambulance stretcher using appropriate methods."
  },

  {
    id: "emt-trauma-135",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "A trauma patient opens her eyes when spoken to, speaks in confused sentences, and obeys commands. What is her GCS score?",
    choices: [
      "11",
      "12",
      "13",
      "14"
    ],
    answerIndex: 2,
    explanation: "Eye opening to voice is 3, confused verbal response is 4, and obeying commands is 6. The total is 13."
  },

  {
    id: "emt-trauma-136",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which GCS component receives a score of 6?",
    choices: [
      "Spontaneous eye opening",
      "Confused verbal response",
      "Obeys commands",
      "Withdraws from pain"
    ],
    answerIndex: 2,
    explanation: "The maximum motor score is 6 for obeying commands. Spontaneous eye opening is 4 and confused verbal response is 4."
  },

  {
    id: "emt-trauma-137",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A severely injured patient has hypertension, bradycardia, and irregular respirations. What does this combination suggest?",
    choices: [
      "Hypovolemic shock",
      "Elevated intracranial pressure",
      "Simple dehydration",
      "Isolated femur fracture"
    ],
    answerIndex: 1,
    explanation: "Hypertension, bradycardia, and abnormal respirations are classically associated with Cushing's response and markedly increased intracranial pressure. This is an ominous finding that may indicate impending herniation."
  },

  {
    id: "emt-trauma-138",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which change would be most concerning in a patient with a severe head injury?",
    choices: [
      "Increasing level of alertness",
      "Improved orientation",
      "Progressive decline in mental status",
      "Decreased pain after splinting"
    ],
    answerIndex: 2,
    explanation: "A declining level of consciousness after head trauma may indicate worsening intracranial pathology and requires prompt reassessment and appropriate transport."
  },

  {
    id: "emt-trauma-139",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "An adult has burns involving the entire right arm and the entire anterior trunk. Approximately what percentage of total body surface area is burned using the adult rule of nines?",
    choices: [
      "18%",
      "27%",
      "36%",
      "45%"
    ],
    answerIndex: 1,
    explanation: "Using the adult rule of nines, one entire arm represents 9% and the anterior trunk represents 18%, producing an estimated total of 27% TBSA."
  },

  {
    id: "emt-trauma-140",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which burn location is particularly concerning even when the total burned surface area is relatively small?",
    choices: [
      "Small superficial burn on the thigh",
      "Full-thickness burn involving the hand",
      "Small superficial burn on the abdomen",
      "Minor partial-thickness burn on the calf"
    ],
    answerIndex: 1,
    explanation: "Burns involving functionally important areas such as the hands can require specialized evaluation even when the total TBSA is small. Burn-center referral criteria should be followed when applicable."
  },

  {
    id: "emt-trauma-141",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient has extensive thermal burns after the burning process has been stopped. Which field treatment is most appropriate?",
    choices: [
      "Apply ice directly to all burned areas",
      "Cover the burns appropriately and actively prevent hypothermia",
      "Keep the patient continuously soaked in cold water during transport",
      "Apply a thick layer of ointment to all burns"
    ],
    answerIndex: 1,
    explanation: "Extensive burns can cause major heat loss. Appropriate covering and prevention of hypothermia are important. Ice can worsen tissue injury, prolonged wet dressings can promote hypothermia, and ointments are generally not part of initial field management of extensive burns."
  },

  {
    id: "emt-trauma-142",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Why is preventing hypothermia especially important in a patient with extensive burns?",
    choices: [
      "Burned skin loses its normal ability to regulate heat and extensive exposure increases heat loss",
      "Hypothermia immediately causes all burns to become full thickness",
      "Warmth increases the depth of every burn",
      "Burn patients cannot develop hypothermia"
    ],
    answerIndex: 0,
    explanation: "Extensive burns disrupt the skin's barrier and thermoregulatory functions, increasing heat loss. Hypothermia is therefore an important secondary complication to prevent."
  },

  {
    id: "emt-trauma-143",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "What should an EMT assess before and after splinting a fractured extremity?",
    choices: [
      "Distal circulation, sensation, and motor function",
      "Only the patient's blood pressure",
      "Only the pulse proximal to the injury",
      "The patient's ability to actively move the injured joint"
    ],
    answerIndex: 0,
    explanation: "Distal pulse or perfusion, sensation, and motor function should be assessed before and after splinting. This helps identify neurovascular compromise caused by the injury or the splint."
  },

  {
    id: "emt-trauma-144",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A forearm fracture is splinted. The hand was warm and had normal sensation before splinting but is now pale and numb. What should the EMT suspect?",
    choices: [
      "Improved circulation",
      "Neurovascular compromise related to the injury or splint",
      "Normal post-splinting physiology",
      "A resolved fracture"
    ],
    answerIndex: 1,
    explanation: "New changes in distal perfusion or sensation after splinting indicate possible neurovascular compromise. The splint should be reassessed and adjusted according to protocol while maintaining fracture support."
  },

  {
    id: "emt-trauma-145",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Which injury is the classic indication for a traction splint when no contraindications are present?",
    choices: [
      "Isolated midshaft femur fracture",
      "Isolated ankle fracture",
      "Hip dislocation",
      "Unstable pelvic fracture"
    ],
    answerIndex: 0,
    explanation: "Traction splints are designed primarily for isolated midshaft femur fractures. Associated injuries to the pelvis, hip, knee, or lower leg can contraindicate their use."
  },

  {
    id: "emt-trauma-146",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "Which finding would make a traction splint inappropriate for a suspected femur fracture?",
    choices: [
      "Isolated midshaft femur deformity",
      "Significant knee injury on the same extremity",
      "Pain and swelling in the mid-thigh",
      "Closed midshaft femur fracture without other lower-extremity injury"
    ],
    answerIndex: 1,
    explanation: "Traction splints may be contraindicated when there is an injury involving the knee or other structures used to support or apply traction. Local protocols should be followed."
  },

  {
    id: "emt-trauma-147",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A severely angulated forearm fracture is associated with a pulseless, pale hand. What is the priority concern?",
    choices: [
      "Cosmetic appearance of the limb",
      "Restoring and preserving distal circulation",
      "Determining whether the patient can walk",
      "Applying a traction splint"
    ],
    answerIndex: 1,
    explanation: "A pulseless, poorly perfused extremity represents a limb-threatening neurovascular emergency. EMS management should follow current local protocols for gentle realignment when indicated, followed by splinting and reassessment."
  },

  {
    id: "emt-trauma-148",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "When is gentle realignment of a severely deformed extremity most strongly considered during EMT care?",
    choices: [
      "Whenever the deformity looks unusual",
      "When distal circulation is absent and protocol permits an attempt to restore perfusion",
      "Only after the patient reaches the hospital",
      "To make every fracture look anatomically normal"
    ],
    answerIndex: 1,
    explanation: "If a severely deformed extremity has absent distal circulation, current EMS education commonly teaches gentle realignment when permitted by protocol, followed by splinting and reassessment. The goal is restoration of perfusion, not cosmetic correction."
  },

  // ============================================================
  // EMS OPERATIONS
  // ============================================================

  {
    id: "emt-ops-450",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "During START triage, an adult casualty is not walking and has a respiratory rate of 34/min after the airway is opened. Which triage category is appropriate?",
    choices: [
      "Minor",
      "Delayed",
      "Immediate",
      "Expectant"
    ],
    answerIndex: 2,
    explanation: "Under the traditional START adult algorithm, a respiratory rate greater than 30/min is an Immediate finding. START is a mass-casualty triage system designed to rapidly prioritize patients."
  },

  {
    id: "emt-ops-451",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "In traditional START triage, an adult who is not breathing remains apneic after the airway is repositioned. What category is assigned?",
    choices: [
      "Minor",
      "Delayed",
      "Immediate",
      "Expectant"
    ],
    answerIndex: 3,
    explanation: "In the traditional START algorithm, an adult who remains apneic after airway repositioning is categorized as Expectant/deceased. Pediatric triage systems such as JumpSTART use different considerations."
  },

  {
    id: "emt-ops-452",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "A nonambulatory adult in a START triage situation has a respiratory rate of 24/min but no palpable radial pulse. What category is assigned?",
    choices: [
      "Minor",
      "Delayed",
      "Immediate",
      "Expectant"
    ],
    answerIndex: 2,
    explanation: "The patient passes the respiratory-rate criterion but fails the perfusion assessment because the radial pulse is absent. In traditional START, failure at any major assessment step results in an Immediate category."
  },

  {
    id: "emt-ops-453",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "In the traditional START system, which sequence best describes the major assessment priorities?",
    choices: [
      "Pain, temperature, blood glucose",
      "Respirations, perfusion, mental status",
      "Blood pressure, ECG, temperature",
      "History, medications, allergies"
    ],
    answerIndex: 1,
    explanation: "START is commonly remembered using RPM: respirations, perfusion, and mental status. It is designed for rapid triage rather than comprehensive individual assessment."
  },

  {
    id: "emt-ops-454",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "During traditional START triage, an adult can walk to a designated safe area after a mass-casualty incident. What initial category is assigned?",
    choices: [
      "Immediate",
      "Delayed",
      "Minor",
      "Expectant"
    ],
    answerIndex: 2,
    explanation: "Ambulatory patients are initially directed to a designated area and categorized as Minor in traditional START. They may still require reassessment because triage status can change."
  },

  {
    id: "emt-ops-455",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "A START-triaged adult has a respiratory rate below the traditional threshold and an adequate radial pulse but cannot follow simple commands. What category should be assigned?",
    choices: [
      "Minor",
      "Delayed",
      "Immediate",
      "Expectant"
    ],
    answerIndex: 2,
    explanation: "Failure of the mental-status portion of the traditional START assessment results in an Immediate category. START prioritizes patients based on rapid identification of physiologic compromise."
  },

  {
    id: "emt-ops-456",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "Why is mass-casualty triage different from a routine patient assessment?",
    choices: [
      "It attempts to identify the most comfortable patients first",
      "It prioritizes limited resources toward patients who are most likely to benefit from immediate intervention",
      "It eliminates the need to reassess patients",
      "It is intended to provide definitive hospital diagnoses"
    ],
    answerIndex: 1,
    explanation: "Mass-casualty triage is designed to prioritize limited resources when the number of patients exceeds available resources. Patients must be reassessed because their condition can change."
  },

  {
    id: "emt-ops-457",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "Which statement best describes the purpose of the NREMT-oriented EMS education standards?",
    choices: [
      "They replace every state's EMS protocol",
      "They establish national educational expectations for EMS provider preparation",
      "They prescribe the exact treatment protocol for every EMS agency",
      "They eliminate the need for medical direction"
    ],
    answerIndex: 1,
    explanation: "National EMS Education Standards establish educational expectations for EMS provider preparation. They do not replace state scope-of-practice rules, local protocols, or medical direction."
  },

  {
    id: "emt-ops-458",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "An EMT encounters a treatment decision whose exact medication dose is determined by the local EMS medical director. Which approach is most appropriate?",
    choices: [
      "Assume every EMS system uses the same dose",
      "Follow the applicable local protocol and medical direction",
      "Use a dose found on an unrelated online question bank",
      "Choose whichever dose produces the strongest effect"
    ],
    answerIndex: 1,
    explanation: "National education standards describe core knowledge, but many operational details are determined by state scope, local protocol, and medical direction. EMTs must practice within their authorized system."
  },

  // ============================================================
  // ADDITIONAL CROSS-CONCEPT QUESTIONS
  // ============================================================

  {
    id: "emt-cardiology-382",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which statement best distinguishes cardiac arrest from myocardial infarction?",
    choices: [
      "Cardiac arrest is a failure of effective circulation, while myocardial infarction involves myocardial tissue injury from inadequate blood flow",
      "Cardiac arrest and myocardial infarction are two names for the same condition",
      "Myocardial infarction always causes immediate cardiac arrest",
      "Cardiac arrest is caused only by coronary artery blockage"
    ],
    answerIndex: 0,
    explanation: "Cardiac arrest is a state in which the heart is not producing effective circulation. Myocardial infarction results from inadequate coronary blood flow causing myocardial injury and can lead to cardiac arrest but does not always do so."
  },

  {
    id: "emt-cardiology-383",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which finding would make an EMT most concerned that chest discomfort is potentially cardiac rather than simply musculoskeletal?",
    choices: [
      "Pain that is completely reproducible by pressing one small area of the chest",
      "Substernal pressure accompanied by diaphoresis and dyspnea",
      "Pain that occurs only when turning the torso",
      "Pain immediately following a direct blow to a rib"
    ],
    answerIndex: 1,
    explanation: "Substernal pressure accompanied by autonomic or respiratory symptoms is concerning for ACS. Although reproducible or movement-related pain may suggest a musculoskeletal cause, no single feature completely rules ACS in or out."
  },

  {
    id: "emt-cardiology-384",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with suspected ACS has a normal oxygen saturation and no signs of respiratory distress. Which statement is most appropriate regarding oxygen?",
    choices: [
      "Oxygen must always be given to every patient with chest pain",
      "Oxygen should be given routinely regardless of saturation",
      "Oxygen should be administered when indicated by hypoxemia or respiratory compromise and according to protocol",
      "Oxygen should never be given to a cardiac patient"
    ],
    answerIndex: 2,
    explanation: "Routine oxygen for every ACS patient is not recommended when oxygenation is adequate. Oxygen is appropriate when hypoxemia or respiratory compromise is present, consistent with current guidance and local protocol."
  },

  {
    id: "emt-cardiology-385",
    domain: "Cardiology",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with suspected ACS has an oxygen saturation of 98%, normal work of breathing, and no respiratory distress. What should guide the EMT's oxygen decision?",
    choices: [
      "Chest pain alone automatically requires high-flow oxygen",
      "The patient's oxygenation and clinical condition",
      "The patient's age alone",
      "Whether the patient requests oxygen"
    ],
    answerIndex: 1,
    explanation: "Oxygen therapy should be guided by oxygenation and clinical need rather than chest pain alone. Unnecessary oxygen can expose patients to treatment without a clear indication."
  },

  {
    id: "emt-airway-141",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which action should an EMT avoid when treating a conscious infant with severe foreign-body airway obstruction?",
    choices: [
      "Supporting the infant's head and neck",
      "Delivering back blows",
      "Delivering chest thrusts",
      "Performing a blind finger sweep"
    ],
    answerIndex: 3,
    explanation: "Blind finger sweeps should not be performed because they can push the foreign body deeper into the airway. Current pediatric guidance recommends repeated cycles of back blows and chest thrusts for severe infant FBAO."
  },

  {
    id: "emt-airway-142",
    domain: "Airway",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "An infant with severe choking becomes unresponsive. Which statement is correct?",
    choices: [
      "Continue only back blows until the object comes out",
      "Begin CPR, starting with chest compressions",
      "Perform abdominal thrusts while the infant is supine",
      "Perform a blind finger sweep before every compression"
    ],
    answerIndex: 1,
    explanation: "When an infant with severe FBAO becomes unresponsive, CPR is initiated beginning with chest compressions. A visible foreign body may be removed when encountered, but blind sweeps are avoided."
  },

  {
    id: "emt-trauma-149",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "A patient with major hemorrhage is initially alert and anxious with a normal blood pressure. Which interpretation is most appropriate?",
    choices: [
      "The patient cannot be seriously injured because the blood pressure is normal",
      "Compensatory mechanisms may temporarily preserve blood pressure",
      "The patient definitely has neurogenic shock",
      "The patient has irreversible shock"
    ],
    answerIndex: 1,
    explanation: "Early hemorrhagic shock may be compensated by tachycardia and vasoconstriction, allowing blood pressure to remain normal. Normal blood pressure should not falsely reassure the EMT."
  },

  {
    id: "emt-trauma-150",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "primaryAssessment",
    question: "Which finding would be least reassuring in a child after significant blood loss?",
    choices: [
      "Normal blood pressure with persistent tachycardia",
      "Normal mental status and normal skin findings",
      "Improving heart rate after hemorrhage control",
      "Warm skin with normal perfusion and improving vital signs"
    ],
    answerIndex: 0,
    explanation: "A child can maintain blood pressure despite significant blood loss. Persistent tachycardia, especially with other signs of poor perfusion, can indicate compensated shock despite a normal blood pressure."
  },

  {
    id: "emt-trauma-151",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "treatmentTransport",
    question: "A patient with an open chest wound is being transported after an occlusive dressing has been applied. Which change should prompt immediate reassessment of the dressing and chest condition?",
    choices: [
      "Improved respiratory effort",
      "Improved skin color",
      "Sudden worsening respiratory distress and hypotension",
      "A decrease in anxiety"
    ],
    answerIndex: 2,
    explanation: "Sudden deterioration after sealing an open chest wound raises concern for tension physiology. The dressing should be reassessed and appropriate emergency measures taken according to protocol."
  },

  {
    id: "emt-trauma-152",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "A trauma patient has eye opening to pain, inappropriate words, and localizes painful stimuli. What is the GCS score?",
    choices: [
      "8",
      "9",
      "10",
      "11"
    ],
    answerIndex: 2,
    explanation: "Eye opening to pain is 2, inappropriate words are 3, and localizing pain is 5. The total is 10."
  },

  {
    id: "emt-trauma-153",
    domain: "Trauma",
    level: "EMT",
    blueprintCategory: "secondaryAssessment",
    question: "Which GCS finding represents the best possible motor response?",
    choices: [
      "Withdraws from pain",
      "Localizes pain",
      "Obeys commands",
      "Abnormal flexion"
    ],
    answerIndex: 2,
    explanation: "Obeying commands is the maximum motor response and receives a score of 6."
  },

  {
    id: "emt-ops-459",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "Why should a mass-casualty triage category not be considered permanent?",
    choices: [
      "Triage categories are based on a patient's condition at a particular point in time",
      "Patients are reassigned randomly",
      "Triage categories are determined only by age",
      "The first category is always incorrect"
    ],
    answerIndex: 0,
    explanation: "Triage is dynamic. A patient's condition can improve or deteriorate, so reassessment is necessary as resources and circumstances permit."
  },

  {
    id: "emt-ops-460",
    domain: "EMS Operations",
    level: "EMT",
    blueprintCategory: "operations",
    question: "Which statement best describes why an EMT should distinguish national EMS education from local protocol?",
    choices: [
      "National education standards are irrelevant after certification",
      "Local protocols may specify treatments and operational details that vary between EMS systems",
      "Local protocols can authorize any procedure regardless of scope",
      "National standards require every EMS agency to use identical medication doses"
    ],
    answerIndex: 1,
    explanation: "National education establishes core expectations, while state scope, agency protocols, and medical direction determine what a provider may actually perform in a particular system."
  },
  ...EMT_AIRWAY_BATCH,
  ...EMT_CARDIOLOGY_BATCH,
  ...EMT_MEDICAL_BATCH,
  ...EMT_OPS_BATCH,
  ...EMT_TRAUMA_BATCH,
];
