// Auto-generated batch of original EMR-level Medical + OBGYN practice
// questions for Proximate. See src/education/itemTypes.js and
// src/education/questions.js's header comment for the schema reference.
// This file is a staging batch (src/education/_genbatch/) and is not wired
// into the live question bank until reviewed and merged.
//
// Scope note: EMR is the most basic certification level. Every question here
// is limited to real EMR competencies: recognition, basic supportive care,
// and knowing when/how urgently to call for more resources. No IV
// medications, no broad pharmacology, no advanced OB complication
// management.

export const BATCH = [
  // ---------------------------------------------------------------------
  // ALTERED MENTAL STATUS / DIABETIC EMERGENCIES
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5000",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "You find a patient who is confused and not answering questions appropriately. Which of the following is the best description of this patient's presentation?",
    choices: [
      "Altered mental status",
      "Normal mentation",
      "Isolated hearing loss",
      "Expected behavior for the patient's age",
    ],
    answerIndex: 0,
    explanation:
      "Confusion and inappropriate responses to questions are signs of altered mental status, which requires prompt assessment for a cause. This is not normal mentation, and nothing here suggests hearing loss or that the behavior is simply age-appropriate.",
  },
  {
    id: "emr-medical-5001",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A family member tells you their diabetic relative 'suddenly became sweaty, shaky, and confused.' The patient is conscious and able to swallow. What is the most appropriate EMR action, if within your local protocols?",
    choices: [
      "Withhold any sugar and wait for ALS",
      "Assist the patient in taking oral glucose or a sugary substance if they can safely swallow",
      "Give the patient's own insulin",
      "Have the patient perform vigorous exercise to raise blood sugar",
    ],
    answerIndex: 1,
    explanation:
      "Sweaty, shaky, and confused in a known diabetic is a classic presentation of hypoglycemia. A conscious patient who can protect their airway and swallow may be given oral glucose or sugar per local protocol. Insulin would lower blood sugar further and is dangerous here; withholding treatment or having the patient exercise does not address the emergency.",
  },
  {
    id: "emr-medical-5002",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are assessing a known diabetic patient who is unconscious and unresponsive to voice. Which action is appropriate for an EMR?",
    choices: [
      "Place oral glucose gel directly onto the tongue of the unconscious patient",
      "Ensure an open airway, provide supportive care and oxygen as needed, and request ALS transport",
      "Pour sugar water into the patient's mouth",
      "Wait outside until the patient wakes up on their own",
    ],
    answerIndex: 1,
    explanation:
      "An unconscious patient cannot safely swallow, so nothing should be placed in the mouth. The correct EMR action is airway management, supportive care, and escalating to ALS, since this patient needs treatment beyond EMR scope. Oral glucose or sugar water risks aspiration in an unresponsive patient.",
  },
  {
    id: "emr-medical-5003",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is a common cause of altered mental status that an EMR should always consider?",
    choices: [
      "Low blood sugar (hypoglycemia)",
      "A recent haircut",
      "Wearing new shoes",
      "Mild sunburn",
    ],
    answerIndex: 0,
    explanation:
      "Hypoglycemia is a common, rapidly reversible cause of altered mental status and should always be considered. The other options have no established relationship to mental status changes.",
  },
  {
    id: "emr-medical-5004",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A responsive but confused patient with a medical alert bracelet reading 'DIABETIC' is able to follow simple commands and swallow safely. According to general EMR guidance, what should you do?",
    choices: [
      "Assist with oral glucose per local protocol and reassess frequently",
      "Restrain the patient until ALS arrives",
      "Ignore the bracelet since it may not be current",
      "Give the patient water only, since sugar is dangerous in all cases",
    ],
    answerIndex: 0,
    explanation:
      "A conscious diabetic patient who can swallow safely is an appropriate candidate for assisted oral glucose administration per local protocol, with frequent reassessment. Restraint is not indicated for a cooperative confused patient, ignoring reliable medical information is unsafe, and plain water does not treat hypoglycemia.",
  },
  {
    id: "emr-medical-5005",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You give oral glucose to a conscious hypoglycemic patient per protocol. Two minutes later the patient becomes drowsy and less responsive. What should you do?",
    choices: [
      "Give a second dose of oral glucose immediately, regardless of the patient's ability to swallow",
      "Stop giving anything by mouth, protect the airway, provide supportive care, and upgrade to ALS",
      "Assume the treatment worked and end your assessment",
      "Have the patient stand up and walk around",
    ],
    answerIndex: 1,
    explanation:
      "A patient becoming less responsive after starting oral glucose can no longer safely swallow, so nothing further should be given by mouth. The priority becomes airway protection, supportive care, and requesting a higher level of care. Assuming improvement or having the patient walk ignores a worsening presentation.",
  },
  {
    id: "emr-medical-5006",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following findings would make an EMR MOST hesitant to assist a patient with oral glucose?",
    choices: [
      "The patient is alert and answering questions appropriately",
      "The patient is unable to swallow or protect their own airway",
      "The patient's skin is pale and diaphoretic",
      "The patient reports feeling shaky",
    ],
    answerIndex: 1,
    explanation:
      "The ability to swallow and protect the airway is the key safety requirement before giving anything by mouth. An alert patient, diaphoresis, and shakiness are all consistent with hypoglycemia and do not by themselves prevent oral glucose administration.",
  },
  {
    id: "emr-medical-5007",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "An EMR is assessing an elderly patient found confused at home. The family states this confusion is new since this morning. What is the most appropriate action?",
    choices: [
      "Assume it is normal aging and take no further action",
      "Treat this as a potentially serious new problem requiring further assessment and transport",
      "Tell the family to monitor the patient overnight without EMS involvement",
      "Give the patient food only, without further assessment",
    ],
    answerIndex: 1,
    explanation:
      "A new onset of confusion is not a normal or expected finding at any age and should be treated as a potentially serious medical emergency requiring assessment and transport. Assuming it is 'just aging,' deferring to the family alone, or giving food without assessment could all delay recognition of a serious condition.",
  },
  // ---------------------------------------------------------------------
  // STROKE
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5008",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which basic assessment can an EMR use to quickly screen for a possible stroke?",
    choices: [
      "Checking blood pressure only",
      "A facial droop, arm weakness, and speech difficulty check (a FAST-style exam)",
      "Asking the patient to touch their toes",
      "Measuring the patient's temperature",
    ],
    answerIndex: 1,
    explanation:
      "A basic facial-droop/arm-weakness/speech-difficulty screen (the FAST concept) is within EMR scope and quickly identifies common stroke signs. Blood pressure and temperature alone do not screen for stroke, and touching toes is unrelated.",
  },
  {
    id: "emr-medical-5009",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "During your basic stroke screen, you ask the patient to smile. One side of the face does not move as much as the other. What does this finding suggest?",
    choices: [
      "A normal variation with no significance",
      "Possible facial droop consistent with stroke",
      "A dental problem only",
      "The patient is being uncooperative",
    ],
    answerIndex: 1,
    explanation:
      "Asymmetric facial movement on a smile check is a classic sign of possible facial droop associated with stroke. It should not be dismissed as normal variation, a dental issue, or a behavior problem.",
  },
  {
    id: "emr-medical-5010",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "You ask a patient to raise both arms and hold them up. One arm drifts downward while the other stays raised. What does this finding suggest?",
    choices: [
      "Possible arm weakness or drift consistent with stroke",
      "The patient is simply tired",
      "A normal finding requiring no further action",
      "The patient has a broken arm",
    ],
    answerIndex: 0,
    explanation:
      "Unilateral arm drift is a recognized sign of possible stroke-related weakness and should prompt continued stroke assessment and rapid transport. It should not be attributed to fatigue or dismissed as normal, and nothing suggests a fracture.",
  },
  {
    id: "emr-medical-5011",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient's speech is suddenly slurred and difficult to understand, though they were speaking normally 20 minutes ago. What is the most appropriate EMR interpretation?",
    choices: [
      "This is a normal finding and requires no action",
      "This is a possible sign of stroke and should prompt urgent assessment and transport",
      "The patient is likely just tired from the day",
      "This only matters if the patient also has a headache",
    ],
    answerIndex: 1,
    explanation:
      "Sudden new slurred speech is a recognized stroke warning sign and should be treated as a time-sensitive emergency requiring urgent transport, regardless of other symptoms. It is not a normal or benign finding.",
  },
  {
    id: "emr-medical-5012",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "Why is it especially important for an EMR to note the exact time a patient was last seen acting normally when a stroke is suspected?",
    choices: [
      "It has no real importance and is just paperwork",
      "Hospital treatment decisions for stroke are often time-dependent, so this information can affect the patient's care options",
      "It is only needed for insurance purposes",
      "It determines which family member should ride in the ambulance",
    ],
    answerIndex: 1,
    explanation:
      "Many stroke treatments are time-sensitive, so the 'last known well' time is critical information that can directly affect what treatment options the hospital is able to offer. This information is clinically important, not just administrative, and has nothing to do with who rides along.",
  },
  {
    id: "emr-medical-5013",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient with sudden facial droop, arm weakness, and slurred speech also has a patent airway and adequate breathing. What is the most appropriate EMR priority?",
    choices: [
      "Delay transport until all symptoms fully resolve",
      "Provide supportive care, keep the patient calm, and arrange prompt transport while noting time of onset",
      "Encourage the patient to walk to prove the symptoms are not serious",
      "Give the patient something to eat before transport",
    ],
    answerIndex: 1,
    explanation:
      "With a patent airway and adequate breathing, the priority for a suspected stroke patient is supportive care, keeping the patient calm and still, and prompt transport with accurate onset-time documentation. Delaying transport, testing ambulation, or giving food could worsen outcomes or create aspiration risk.",
  },
  {
    id: "emr-medical-5014",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following patients has signs MOST consistent with a possible stroke?",
    choices: [
      "A patient with a stubbed toe and normal speech",
      "A patient with sudden onset of facial droop, one-sided weakness, and difficulty speaking",
      "A patient with a mild headache after reading for two hours",
      "A patient who is tired after a long work shift",
    ],
    answerIndex: 1,
    explanation:
      "Sudden facial droop, one-sided weakness, and speech difficulty together are the classic constellation of stroke signs. The other scenarios describe common, benign complaints unrelated to stroke.",
  },
  // ---------------------------------------------------------------------
  // SEIZURES
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5015",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "You arrive to find a patient actively having a generalized seizure with jerking movements of all extremities. What is the MOST appropriate initial EMR action?",
    choices: [
      "Restrain the patient's arms and legs firmly to stop the movements",
      "Protect the patient from injury by moving nearby objects away and cushioning the head",
      "Place a bite block or other object firmly in the patient's mouth",
      "Give the patient water to drink",
    ],
    answerIndex: 1,
    explanation:
      "During an active seizure, the priority is protecting the patient from injury by clearing the area and cushioning the head, without restraining the movements. Restraint can cause injury, placing objects in the mouth can cause airway obstruction or dental/oral trauma, and nothing should be given by mouth during a seizure.",
  },
  {
    id: "emr-medical-5016",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why should an EMR never attempt to place an object between a seizing patient's teeth?",
    choices: [
      "It is unnecessary and can cause airway obstruction or injury to the teeth and mouth",
      "It is required by all EMS protocols",
      "It helps the seizure end faster",
      "Patients cannot bite their tongue during a seizure",
    ],
    answerIndex: 0,
    explanation:
      "Placing anything in the mouth during a seizure risks airway obstruction, broken teeth, and injury to the responder, and does not shorten the seizure. This is a longstanding, well-established EMS teaching point, not a protocol requirement.",
  },
  {
    id: "emr-medical-5017",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "The seizure activity has stopped and the patient is now unresponsive with noisy, snoring respirations (the postictal period). What should the EMR do?",
    choices: [
      "Leave the patient exactly as found without repositioning",
      "Position the patient to help maintain an open airway and monitor breathing closely",
      "Immediately give oral glucose regardless of consciousness",
      "Perform chest compressions since the patient is unresponsive",
    ],
    answerIndex: 1,
    explanation:
      "Noisy, snoring respirations in a postictal patient suggest a partially obstructed airway from relaxed tissue, so positioning to maintain an open airway (such as the recovery position, if no trauma is suspected) and close monitoring is appropriate. Nothing should be given by mouth to an unresponsive patient, and chest compressions are not indicated when the patient is breathing.",
  },
  {
    id: "emr-medical-5018",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient has one seizure that stops after about a minute, then begins seizing again a few minutes later without regaining full consciousness in between. Why is this presentation especially concerning?",
    choices: [
      "It is not concerning; repeated seizures are always benign",
      "This pattern may represent status epilepticus, a life-threatening condition requiring urgent transport",
      "It means the patient is faking the seizures",
      "It only matters if the patient is a child",
    ],
    answerIndex: 1,
    explanation:
      "Seizures that recur without the patient regaining consciousness in between can indicate status epilepticus, a true emergency that requires urgent transport and escalation of care. This pattern is not benign, is not evidence of malingering, and the concern applies to patients of any age.",
  },
  {
    id: "emr-medical-5019",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is an appropriate EMR action for a patient found seizing on the ground near hard furniture?",
    choices: [
      "Try to hold the patient completely still against the ground",
      "Move nearby objects away from the patient and, if possible, place something soft under the head",
      "Pick the patient up and carry them to a different room",
      "Pour water on the patient's face to stop the seizure",
    ],
    answerIndex: 1,
    explanation:
      "Clearing hazards from the area and cushioning the head reduces injury risk without restraining the seizure. Holding a patient still, moving them mid-seizure, or pouring water on them can all cause additional injury and do not stop a seizure.",
  },
  {
    id: "emr-medical-5020",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A seizure has just ended and the patient is now awake, confused, and drowsy. This period is best described as:",
    choices: [
      "Preictal",
      "Postictal",
      "Full recovery with no further monitoring needed",
      "A new, separate seizure",
    ],
    answerIndex: 1,
    explanation:
      "The confused, drowsy state after a seizure ends is called the postictal period and the patient should continue to be monitored closely. It is not the period before a seizure (preictal), full recovery, or a new seizure.",
  },
  {
    id: "emr-medical-5021",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "You are caring for a postictal patient (confused after a seizure has ended). Which of the following is an appropriate step?",
    choices: [
      "Ask detailed rapid-fire questions to test orientation immediately",
      "Speak calmly, reassure the patient, and continue to monitor airway and breathing",
      "Leave the patient alone to rest without observation",
      "Encourage the patient to get up and walk immediately",
    ],
    answerIndex: 1,
    explanation:
      "A postictal patient benefits from calm reassurance and continued monitoring of the airway and breathing, since confusion and drowsiness are expected and the patient remains vulnerable. Aggressive questioning, leaving them unobserved, or rushing them to stand can all worsen the situation or lead to injury.",
  },
  // ---------------------------------------------------------------------
  // ANAPHYLAXIS / ALLERGIC REACTION
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5022",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which combination of findings is MOST concerning for anaphylaxis rather than a mild, localized allergic reaction?",
    choices: [
      "Slight redness only at a bee sting site",
      "Widespread hives, swelling of the lips and tongue, and difficulty breathing",
      "A mild itch on one arm with no other symptoms",
      "A patient who says they feel 'a little warm'",
    ],
    answerIndex: 1,
    explanation:
      "Widespread hives combined with airway swelling and breathing difficulty indicate a systemic, potentially life-threatening reaction (anaphylaxis), not a mild localized one. Isolated local redness, a mild itch, or feeling warm alone do not meet this pattern.",
  },
  {
    id: "emr-medical-5023",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient in anaphylaxis has their own prescribed epinephrine auto-injector. If within EMR scope and local protocol, what is the appropriate action?",
    choices: [
      "Assist the patient with using their prescribed auto-injector",
      "Withhold the auto-injector and wait for ALS no matter how long it takes",
      "Use the auto-injector on a different patient who seems to need it more",
      "Inject the medication into the patient's ear",
    ],
    answerIndex: 0,
    explanation:
      "When permitted by local protocol, an EMR may assist a patient with anaphylaxis in using their own prescribed epinephrine auto-injector, since this is a rapidly progressive, life-threatening emergency. Withholding a life-saving treatment while waiting, giving it to someone else, or an incorrect injection site are all inappropriate.",
  },
  {
    id: "emr-medical-5024",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "An auto-injector is designed to be used on which part of the body?",
    choices: [
      "The outer thigh",
      "The palm of the hand",
      "The scalp",
      "The bottom of the foot",
    ],
    answerIndex: 0,
    explanation:
      "Epinephrine auto-injectors are designed for use on the outer thigh, which has a large muscle mass and is a standard, well-studied injection site. The hand, scalp, and foot are not appropriate or intended sites.",
  },
  {
    id: "emr-medical-5025",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "After assisting a patient with their epinephrine auto-injector for anaphylaxis, the patient's breathing does not improve and their condition appears to be worsening. What should the EMR do?",
    choices: [
      "Assume nothing more can be done and simply wait",
      "Reassess frequently, continue supportive care and oxygen as needed, and urgently request or continue ALS transport",
      "Tell the patient they are fine since medication was already given",
      "Remove the patient's airway adjuncts since they already received treatment",
    ],
    answerIndex: 1,
    explanation:
      "A patient who is not improving after epinephrine needs continued reassessment, supportive care, and urgent escalation to a higher level of care, since anaphylaxis can be life-threatening and may require repeat dosing or advanced interventions beyond EMR scope. Assuming nothing more can be done or downplaying a worsening presentation is unsafe.",
  },
  {
    id: "emr-medical-5026",
    domain: "Medical + OBGYN",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: true,
    question:
      "Which of the following findings in a patient with a known allergen exposure suggest anaphylaxis rather than a mild allergic reaction? (Select 2.)",
    choices: [
      "Swelling of the tongue and throat with difficulty breathing",
      "A single small area of redness at the exposure site with no other symptoms",
      "A drop in blood pressure with dizziness and a rapid, weak pulse",
      "Mild itching at the site that resolves within a few minutes",
      "Normal vital signs and no other complaints",
    ],
    correctIndices: [0, 2],
    explanation:
      "Airway/throat swelling with breathing difficulty and signs of shock (low blood pressure, dizziness, a rapid weak pulse) both indicate a systemic, life-threatening reaction consistent with anaphylaxis. A single small area of local redness, brief mild itching, and normal vital signs all describe a mild, localized reaction rather than anaphylaxis.",
  },
  {
    id: "emr-medical-5027",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient with a known peanut allergy has hives on their arms after eating a snack, but they are speaking normally, breathing without difficulty, and have stable vital signs. What is the most appropriate EMR approach?",
    choices: [
      "Immediately assist with an epinephrine auto-injector regardless of symptoms",
      "Monitor the patient closely for any signs of progression while providing reassurance and preparing to act if the reaction worsens",
      "Tell the patient the reaction is not real",
      "Discharge the patient from EMS care without any assessment",
    ],
    answerIndex: 1,
    explanation:
      "Hives without airway, breathing, or circulatory compromise represent a mild reaction that should be closely monitored, since allergic reactions can progress quickly. Reflexively giving epinephrine for a mild, stable presentation, dismissing the patient's symptoms, or leaving without assessment are all inappropriate.",
  },
  {
    id: "emr-medical-5028",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is a common trigger for anaphylaxis that an EMR should ask about during history-taking?",
    choices: [
      "Recent exposure to a known food, medication, or insect sting allergen",
      "Watching television",
      "Drinking plain water",
      "Sitting in a quiet room",
    ],
    answerIndex: 0,
    explanation:
      "Foods, medications, and insect stings are common, well-recognized triggers for anaphylaxis, and asking about recent exposure helps confirm the likely cause. The other options are not recognized anaphylaxis triggers.",
  },
  // ---------------------------------------------------------------------
  // POISONING / OVERDOSE
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5029",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "You arrive at a scene for a suspected overdose. What is the FIRST priority before approaching the patient?",
    choices: [
      "Scene safety, since drug paraphernalia or hazards may be present",
      "Immediately giving the patient any medication found nearby",
      "Asking bystanders to leave before assessing anything",
      "Searching the patient's belongings before assessment",
    ],
    answerIndex: 0,
    explanation:
      "Scene safety is always the first priority in EMS response, and suspected overdose scenes can involve hazards such as needles, unknown substances, or unpredictable patient behavior. Giving unknown medications, dismissing bystanders before assessment, or searching belongings before ensuring safety are all inappropriate first steps.",
  },
  {
    id: "emr-medical-5030",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "You find an unresponsive patient with slow, shallow breathing and pinpoint pupils near empty pill bottles. This presentation is MOST consistent with:",
    choices: [
      "A normal sleeping pattern",
      "A possible opioid overdose",
      "A severe allergic reaction",
      "A simple fainting episode",
    ],
    answerIndex: 1,
    explanation:
      "Pinpoint pupils, slow shallow breathing, and unresponsiveness near medication containers is a classic presentation of opioid overdose. This is not a normal sleep pattern, an allergic reaction, or a simple faint, all of which have different characteristic findings.",
  },
  {
    id: "emr-medical-5031",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For a suspected opioid overdose patient who is breathing inadequately, what is the EMR's most important immediate action?",
    choices: [
      "Support the airway and assist ventilations as needed",
      "Wait for the patient to wake up on their own",
      "Give the patient food to help them recover",
      "Ask the patient to walk around to stay awake",
    ],
    answerIndex: 0,
    explanation:
      "Inadequate breathing is an immediate life threat regardless of the cause, so airway support and assisted ventilation take priority. Waiting, giving food, or having a poorly responsive patient walk are all inappropriate and can worsen the outcome.",
  },
  {
    id: "emr-medical-5032",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "If within EMR scope and local protocol, an EMR may assist a patient who is exhibiting signs of a suspected opioid overdose with which medication?",
    choices: [
      "Naloxone",
      "Insulin",
      "Albuterol",
      "Epinephrine auto-injector only",
    ],
    answerIndex: 0,
    explanation:
      "Naloxone is a medication that many EMR-level protocols and community programs allow trained responders to administer for suspected opioid overdose, since it can reverse life-threatening respiratory depression. Insulin and albuterol are not related to opioid overdose, and an epinephrine auto-injector is used for anaphylaxis, not opioid overdose.",
  },
  {
    id: "emr-medical-5033",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "After naloxone is given to a suspected opioid overdose patient per protocol, the patient becomes more alert but is agitated and tries to leave. What is an important safety consideration?",
    choices: [
      "The effects of naloxone can wear off before the opioid does, so the patient may become sedated again and needs continued monitoring and transport",
      "Once naloxone is given, the patient no longer needs any further monitoring",
      "The patient should be allowed to leave immediately since they woke up",
      "Naloxone permanently cures opioid overdose with no risk of relapse",
    ],
    answerIndex: 0,
    explanation:
      "Naloxone's effects can wear off sooner than the opioid's effects, so a patient can become sedated or stop breathing again after initially waking up. This means continued monitoring and transport are essential even if the patient appears improved or wants to leave.",
  },
  {
    id: "emr-medical-5034",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Bystanders tell you a patient ingested an unknown substance and is now vomiting and confused. What information is MOST important for the EMR to try to gather, if safely possible?",
    choices: [
      "What substance was taken, how much, and when",
      "The patient's favorite color",
      "The patient's employer",
      "What the patient had for breakfast three days ago",
    ],
    answerIndex: 0,
    explanation:
      "For a suspected poisoning, knowing what substance was taken, the approximate amount, and the time of ingestion is critical information that helps guide care and should be relayed to responding or receiving providers. The other details have no bearing on this emergency.",
  },
  {
    id: "emr-medical-5035",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A conscious patient reports swallowing an unknown quantity of pills in a suicide attempt and is now alert and talking. What is the most appropriate EMR action?",
    choices: [
      "Induce vomiting immediately regardless of the substance",
      "Provide supportive care, monitor closely, and arrange prompt transport while gathering history if safely possible",
      "Leave the patient alone since they are currently talking normally",
      "Give the patient large amounts of water to dilute the pills",
    ],
    answerIndex: 1,
    explanation:
      "Supportive care, close monitoring, and prompt transport are appropriate for a poisoning patient, with continued reassessment since deterioration can occur even after an initially stable presentation. Inducing vomiting or giving fluids without medical direction can be harmful depending on the substance, and leaving the patient unmonitored is unsafe.",
  },
  {
    id: "emr-medical-5036",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which finding in a patient with a suspected overdose would be MOST concerning to an EMR?",
    choices: [
      "The patient is alert and answering questions clearly",
      "The patient's breathing is slow, shallow, and irregular",
      "The patient reports mild nausea",
      "The patient is sitting comfortably in a chair",
    ],
    answerIndex: 1,
    explanation:
      "Slow, shallow, irregular breathing represents inadequate ventilation and is an immediate life threat requiring urgent airway support. An alert patient, mild nausea, and comfortable positioning are far less concerning findings by comparison.",
  },
  // ---------------------------------------------------------------------
  // CHILDBIRTH / OB
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5037",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A pregnant patient reports contractions that are close together and states she feels the urge to push. What finding would MOST strongly suggest delivery is imminent?",
    choices: [
      "Crowning, where the baby's head is visible at the vaginal opening",
      "The patient reports mild nausea",
      "The patient is thirsty",
      "The patient's contractions are 20 minutes apart",
    ],
    answerIndex: 0,
    explanation:
      "Crowning, the visible presentation of the baby's head at the vaginal opening, is a definitive sign that delivery is imminent and transport should generally not be attempted before delivery. Nausea, thirst, and widely spaced contractions do not indicate imminent delivery.",
  },
  {
    id: "emr-medical-5038",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You determine that delivery is imminent based on crowning. What is the most appropriate EMR decision?",
    choices: [
      "Rush the patient to the ambulance and drive rapidly to the hospital regardless of the stage of labor",
      "Prepare to assist with delivery on scene rather than attempting to transport during crowning",
      "Tell the patient to cross her legs and wait",
      "Leave the patient and call for a different type of emergency service",
    ],
    answerIndex: 1,
    explanation:
      "When crowning is present, delivery is imminent and the safer course is generally to prepare to assist delivery on scene rather than risk delivering en route in a moving vehicle. Attempting to physically delay delivery or abandoning the patient are inappropriate and unsafe.",
  },
  {
    id: "emr-medical-5039",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "When preparing to assist with an imminent field delivery, which of the following is an appropriate basic supportive action?",
    choices: [
      "Support the baby's head as it delivers and avoid pulling on the baby",
      "Pull firmly on the baby as soon as any part is visible",
      "Insert fingers into the birth canal to speed delivery",
      "Have the mother stand and walk during active pushing",
    ],
    answerIndex: 0,
    explanation:
      "Supporting the baby's head as it emerges, without pulling, is basic supportive care during delivery. Pulling on the baby, inserting fingers into the birth canal, or having the mother walk during active delivery are inappropriate and potentially harmful actions outside EMR scope.",
  },
  {
    id: "emr-medical-5040",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Immediately after a newborn delivers, which action is a basic EMR priority?",
    choices: [
      "Dry, warm, and stimulate the newborn while assessing breathing and color",
      "Submerge the newborn in cold water",
      "Immediately separate the newborn from any warming source",
      "Delay any assessment of the newborn for several minutes",
    ],
    answerIndex: 0,
    explanation:
      "Drying, warming, and stimulating the newborn while assessing breathing effort and color are basic, immediate priorities after delivery, since newborns lose heat rapidly and may need stimulation to establish good respirations. Cold water, withholding warmth, or delaying assessment are all harmful.",
  },
  {
    id: "emr-medical-5041",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A newborn is delivered and is not breathing after initial drying and stimulation. What is the appropriate EMR action?",
    choices: [
      "Begin positive-pressure ventilation for the newborn per basic newborn resuscitation guidance",
      "Wait several minutes before taking any action",
      "Assume the newborn will start breathing on its own with no intervention",
      "Focus only on the mother and ignore the newborn's breathing status",
    ],
    answerIndex: 0,
    explanation:
      "A newborn who remains apneic after drying and stimulation needs prompt positive-pressure ventilation, which is a recognized part of basic newborn resuscitation. Waiting, assuming spontaneous improvement, or ignoring the newborn are inappropriate when the newborn is not breathing.",
  },
  {
    id: "emr-medical-5042",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "After a normal, uncomplicated delivery, what should the EMR do with the placenta if it has not yet delivered by the time of transport?",
    choices: [
      "Forcefully pull on the umbilical cord to remove the placenta before transport",
      "Do not pull on the cord; transport the mother and newborn and allow the placenta to deliver on its own or at the hospital",
      "Leave the placenta and mother behind and transport only the newborn",
      "Cut the umbilical cord as close to the newborn as possible before any other care",
    ],
    answerIndex: 1,
    explanation:
      "The placenta should never be forcibly pulled out; it is generally allowed to deliver spontaneously, and if it has not delivered, the mother and newborn are transported together. Separating the mother from the newborn, or forceful cord traction, are inappropriate and can cause harm.",
  },
  {
    id: "emr-medical-5043",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A woman in labor tells you this is her fourth pregnancy and her labors have historically progressed very quickly. How should this history affect your planning?",
    choices: [
      "It should not affect planning at all",
      "It should increase your suspicion that delivery may occur rapidly and prompt earlier preparation for field delivery",
      "It means delivery will definitely take several hours",
      "It means transport should always be delayed regardless of her symptoms",
    ],
    answerIndex: 1,
    explanation:
      "A history of rapid prior labors is relevant information that should increase suspicion for a fast-progressing labor and prompt earlier preparation for a possible field delivery. It does not guarantee a specific timeline in either direction, and should not automatically delay transport if delivery is not otherwise imminent.",
  },
  {
    id: "emr-medical-5044",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which basic supportive care measure is appropriate for a woman in active labor who is being transported before delivery is imminent?",
    choices: [
      "Position her comfortably, often left side or with knees bent, and offer reassurance while monitoring closely",
      "Have her lie flat on her back with legs straight for the entire transport",
      "Encourage her to hold her breath continuously",
      "Discourage any communication during transport",
    ],
    answerIndex: 0,
    explanation:
      "Comfortable positioning and ongoing reassurance and monitoring are appropriate supportive measures during transport of a laboring patient. Forcing a flat supine position for the entire ride, telling her to hold her breath continuously, or discouraging communication are not appropriate.",
  },
  {
    id: "emr-medical-5045",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "During delivery, the umbilical cord is visible in the birth canal before the baby (a prolapsed cord) is suspected based on what the patient describes. What is the most appropriate EMR response?",
    choices: [
      "This is a low-priority finding requiring no urgency",
      "This is a potential emergency requiring immediate positioning changes and urgent transport with ALS notification",
      "Pull on the cord to reposition it",
      "Delay any action since it will likely resolve on its own",
    ],
    answerIndex: 1,
    explanation:
      "A suspected prolapsed cord is a true obstetric emergency because it can compress and cut off the baby's oxygen supply, requiring urgent positioning (such as knee-chest position, per protocol) and immediate escalation to a higher level of care. Pulling on the cord or delaying action would be dangerous.",
  },
  {
    id: "emr-medical-5046",
    domain: "Medical + OBGYN",
    level: "EMR",
    itemType: "build_list",
    clinicalJudgment: false,
    question:
      "Place the following basic EMR actions for an imminent field delivery in the correct order.",
    steps: [
      "Confirm crowning and prepare a clean delivery area",
      "Support the baby's head and body as they deliver, without pulling",
      "Dry, warm, and stimulate the newborn while assessing breathing",
      "Keep the mother and newborn warm and monitor both closely during transport",
    ],
    correctOrder: [0, 1, 2, 3],
    explanation:
      "Delivery preparation begins once crowning confirms imminent birth, followed by supporting (not pulling) the baby as it delivers, then immediately drying/warming/stimulating the newborn and assessing breathing, and finally maintaining warmth and ongoing monitoring of both patients during transport.",
  },
  // ---------------------------------------------------------------------
  // BEHAVIORAL EMERGENCIES
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5047",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Before approaching a patient experiencing a behavioral emergency, what should the EMR prioritize?",
    choices: [
      "Personal and scene safety, including identifying possible exit routes and any weapons",
      "Immediately physically restraining the patient",
      "Arguing with the patient to prove a point",
      "Ignoring any signs of agitation",
    ],
    answerIndex: 0,
    explanation:
      "Scene and personal safety, including awareness of exits and potential weapons, is always the first priority when approaching a patient with a behavioral emergency, since unpredictable behavior can pose a real risk. Immediate restraint, arguing, or ignoring agitation are all inappropriate and can escalate the situation.",
  },
  {
    id: "emr-medical-5048",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which communication approach is generally most effective when trying to de-escalate an agitated patient?",
    choices: [
      "Speaking in a calm, non-threatening tone and using simple, clear language",
      "Yelling louder than the patient",
      "Standing very close and blocking the patient's exit",
      "Arguing about whether the patient's concerns are valid",
    ],
    answerIndex: 0,
    explanation:
      "A calm tone, simple language, and a non-threatening approach are core de-escalation techniques that help reduce a patient's agitation. Yelling, crowding the patient's space, or arguing tend to increase agitation rather than calm it.",
  },
  {
    id: "emr-medical-5049",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Maintaining a safe distance and having a clear path to an exit when dealing with an agitated patient is an example of:",
    choices: [
      "Unnecessary caution that wastes time",
      "Basic scene safety and situational awareness",
      "A sign of disrespect toward the patient",
      "A step that should only be done after the call is complete",
    ],
    answerIndex: 1,
    explanation:
      "Maintaining safe distance and a clear exit path is basic situational awareness and scene safety practice, not disrespect or unnecessary caution, and it should be maintained throughout patient contact, not only afterward.",
  },
  {
    id: "emr-medical-5050",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient having a behavioral emergency suddenly picks up an object that could be used as a weapon. What should the EMR do?",
    choices: [
      "Continue standing close and attempt to grab the object",
      "Retreat to a safe distance and request law enforcement assistance before any further patient contact",
      "Ignore the object and continue the assessment as planned",
      "Try to physically overpower the patient alone",
    ],
    answerIndex: 1,
    explanation:
      "When a patient displays a potential weapon, the EMR's own safety comes first; retreating to a safe distance and requesting law enforcement support is the appropriate response before resuming any patient care. Approaching, ignoring the threat, or attempting to physically overpower the patient alone all put the responder at serious risk.",
  },
  {
    id: "emr-medical-5051",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient expresses thoughts of wanting to harm themselves. How should the EMR respond?",
    choices: [
      "Dismiss the statement as an exaggeration",
      "Take the statement seriously, remain calm and supportive, and ensure appropriate resources and transport are arranged",
      "Leave the patient alone immediately to give them space",
      "Argue with the patient about why they should not feel that way",
    ],
    answerIndex: 1,
    explanation:
      "Any statement about self-harm should be taken seriously; the EMR should respond calmly and supportively while ensuring the patient is not left unmonitored and that appropriate transport and resources are arranged. Dismissing the statement, leaving the patient alone, or arguing can all worsen an already dangerous situation.",
  },
  {
    id: "emr-medical-5052",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is an appropriate general principle when caring for a patient experiencing a behavioral or psychiatric emergency?",
    choices: [
      "Treat the patient with the same dignity, respect, and thorough assessment given to any other medical patient",
      "Assume the underlying cause is never medical",
      "Automatically restrain every behavioral emergency patient before assessment",
      "Avoid speaking directly to the patient at all",
    ],
    answerIndex: 0,
    explanation:
      "Patients with behavioral or psychiatric emergencies deserve the same dignity, respect, and careful assessment as any other patient, and underlying medical causes (such as hypoglycemia or hypoxia) should always be considered. Automatic restraint or refusing to speak with the patient are not appropriate general principles.",
  },
  {
    id: "emr-medical-5053",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A confused, agitated patient is found wandering outside in cold weather with slurred speech. What should the EMR consider before assuming this is purely a behavioral emergency?",
    choices: [
      "That the confusion could have a medical cause, such as hypoglycemia, hypothermia, or a stroke",
      "That confusion always means the patient is intoxicated and nothing else needs to be considered",
      "That vital signs and basic assessment are unnecessary since the patient appears agitated",
      "That the weather has no possible relevance to the patient's condition",
    ],
    answerIndex: 0,
    explanation:
      "Confusion and agitation can have serious underlying medical causes, including hypoglycemia, hypothermia, and stroke, so a behavioral presentation should never replace a basic medical assessment. Assuming intoxication, skipping assessment, or ignoring environmental exposure could miss a life-threatening cause.",
  },
  {
    id: "emr-medical-5054",
    domain: "Medical + OBGYN",
    level: "EMR",
    itemType: "drag_drop",
    clinicalJudgment: true,
    question:
      "Place each action into the correct category for managing a behavioral emergency.",
    categories: [
      { id: "appropriate", label: "Appropriate De-escalation" },
      { id: "inappropriate", label: "Inappropriate / Unsafe" },
    ],
    items: [
      { id: "bm1", label: "Speaking calmly and using simple language", correctCategory: "appropriate" },
      { id: "bm2", label: "Maintaining a safe distance and a clear exit path", correctCategory: "appropriate" },
      { id: "bm3", label: "Yelling at the patient to comply", correctCategory: "inappropriate" },
      { id: "bm4", label: "Physically blocking the patient's only exit", correctCategory: "inappropriate" },
      { id: "bm5", label: "Acknowledging the patient's feelings without arguing", correctCategory: "appropriate" },
    ],
    explanation:
      "Calm communication, safe positioning with a clear exit, and non-confrontational acknowledgment of feelings are effective, safe de-escalation techniques. Yelling and blocking a patient's exit both increase risk of escalation and are unsafe practices.",
  },
  // ---------------------------------------------------------------------
  // ENVIRONMENTAL EMERGENCIES: HEAT
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5055",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient who has been working outside in high heat presents with heavy sweating, weakness, dizziness, and cool, clammy skin. This is most consistent with:",
    choices: [
      "Heat exhaustion",
      "Frostbite",
      "A normal response with no medical significance",
      "Hypoglycemia unrelated to heat",
    ],
    answerIndex: 0,
    explanation:
      "Heavy sweating, weakness, dizziness, and cool/clammy skin after heat exposure are classic signs of heat exhaustion, a heat-related illness that requires prompt supportive care. This is not frostbite (a cold injury), a normal finding, or unrelated to the heat exposure.",
  },
  {
    id: "emr-medical-5056",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the most appropriate basic EMR care for a conscious patient with suspected heat exhaustion?",
    choices: [
      "Move the patient to a cooler environment, remove excess clothing, and provide fluids if they are alert and able to swallow",
      "Have the patient continue physical activity to sweat out the heat",
      "Wrap the patient in extra blankets",
      "Give the patient ice water to drink as fast as possible in large amounts",
    ],
    answerIndex: 0,
    explanation:
      "Moving the patient to a cooler area, removing excess clothing, and giving fluids if the patient is alert and can safely swallow are appropriate basic measures for heat exhaustion. Continued activity or extra insulation would worsen the condition, and rapidly forcing large amounts of fluid is not appropriate basic care.",
  },
  {
    id: "emr-medical-5057",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient exposed to extreme heat has hot, dry (or minimally sweating) skin and is confused. This presentation should raise concern for:",
    choices: [
      "A mild sunburn only",
      "Heat stroke, a life-threatening emergency",
      "Normal exertion with no significant concern",
      "A minor headache from bright sunlight",
    ],
    answerIndex: 1,
    explanation:
      "Hot, dry or minimally sweating skin combined with altered mental status after heat exposure is a hallmark of heat stroke, a true medical emergency requiring aggressive cooling and urgent transport. This presentation is far more serious than a sunburn or ordinary exertion.",
  },
  {
    id: "emr-medical-5058",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient with suspected heat stroke is altered and has hot skin. What is the EMR priority?",
    choices: [
      "Begin aggressive cooling measures and arrange urgent transport",
      "Wait to see if the patient improves on their own before doing anything",
      "Give the patient hot tea to help them sweat",
      "Cover the patient with heavy blankets",
    ],
    answerIndex: 0,
    explanation:
      "Heat stroke with altered mental status is a life-threatening emergency requiring immediate, aggressive cooling (such as moving to a cool environment and removing clothing, applying cool water or ice packs as available per local protocol) and urgent transport. Waiting, giving hot beverages, or adding insulation would all worsen the patient's condition.",
  },
  {
    id: "emr-medical-5059",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A conscious patient with heat exhaustion is unable to keep down oral fluids and is vomiting. What should the EMR do?",
    choices: [
      "Continue forcing oral fluids regardless of vomiting",
      "Stop oral fluids, position to protect the airway, cool the patient, and arrange transport",
      "Assume the patient is fine and end the assessment",
      "Ignore the vomiting and focus only on temperature",
    ],
    answerIndex: 1,
    explanation:
      "If a patient cannot tolerate oral fluids, they should be stopped to avoid aspiration risk, and the EMR should focus on airway protection, cooling, and transport. Continuing to force fluids or ignoring the vomiting could lead to aspiration or an incomplete assessment.",
  },
  {
    id: "emr-medical-5060",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which population is generally at higher risk for heat-related illness?",
    choices: [
      "Young, healthy athletes exercising in the shade with adequate hydration",
      "Elderly patients, young children, and those with chronic illness in hot environments",
      "Patients who remain indoors in air conditioning all day",
      "No group has a higher risk than any other",
    ],
    answerIndex: 1,
    explanation:
      "Elderly patients, young children, and those with chronic illness have reduced ability to regulate body temperature and are at higher risk for heat-related illness, especially in hot environments. Well-hydrated, healthy individuals exercising in shade, or people who remain in air conditioning, are at comparatively lower risk.",
  },
  // ---------------------------------------------------------------------
  // ENVIRONMENTAL EMERGENCIES: COLD
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5061",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient who has been outside in freezing temperatures for several hours is shivering, has cool skin, and is slightly confused. This presentation is most consistent with:",
    choices: [
      "Hypothermia",
      "Heat exhaustion",
      "A normal reaction to cold with no concern",
      "Anaphylaxis",
    ],
    answerIndex: 0,
    explanation:
      "Shivering, cool skin, and confusion after prolonged cold exposure are consistent with hypothermia, a condition that requires warming and careful handling. This is the opposite presentation from heat exhaustion and is unrelated to anaphylaxis.",
  },
  {
    id: "emr-medical-5062",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is an appropriate basic EMR action for a conscious patient with mild hypothermia?",
    choices: [
      "Move the patient to a warm environment, remove wet clothing, and cover with dry blankets",
      "Vigorously rub the patient's arms and legs to warm them quickly",
      "Give the patient alcohol to drink to warm them up",
      "Leave wet clothing in place to conserve time",
    ],
    answerIndex: 0,
    explanation:
      "Moving to warmth, removing wet clothing, and covering with dry insulation are appropriate basic measures for hypothermia. Vigorous rubbing can be harmful in more significant hypothermia, alcohol is inappropriate and can worsen heat loss, and leaving wet clothing in place continues heat loss.",
  },
  {
    id: "emr-medical-5063",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient with suspected moderate to severe hypothermia is found unresponsive with very slow, weak breathing. What is an important principle of care?",
    choices: [
      "Handle the patient gently, since rough movement can trigger dangerous heart rhythms in significant hypothermia",
      "It is safe to move and handle the patient roughly since they are unresponsive",
      "Warming is not necessary if the patient is unresponsive",
      "Vigorous exercise should be encouraged once the patient wakes up",
    ],
    answerIndex: 0,
    explanation:
      "In moderate to severe hypothermia, the heart can be very sensitive to rough handling, which may trigger dangerous arrhythmias, so patients should be moved and handled gently. Warming is still important, and rough handling or vigorous exercise are both inappropriate and potentially dangerous in this condition.",
  },
  {
    id: "emr-medical-5064",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient with frostbite has a pale, hard, numb area on their fingers. What is an appropriate basic EMR action?",
    choices: [
      "Protect the area from further injury and cold exposure, and avoid rubbing or massaging the affected tissue",
      "Vigorously rub the fingers to restore circulation",
      "Break any blisters that are present",
      "Apply direct high heat, such as a heating pad set on high",
    ],
    answerIndex: 0,
    explanation:
      "Frostbitten tissue should be protected from further cold exposure and physical trauma; rubbing, massaging, breaking blisters, or applying direct high heat can all cause additional tissue damage. Gentle protection and prompt transport for further care are the appropriate basic measures.",
  },
  {
    id: "emr-medical-5065",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why should wet clothing be removed and replaced with dry coverings as soon as reasonably possible in a cold-exposed patient?",
    choices: [
      "Wet clothing significantly increases the rate of heat loss from the body",
      "Wet clothing has no effect on body temperature",
      "It is only a comfort issue, not a medical concern",
      "Dry clothing is never necessary in cold environments",
    ],
    answerIndex: 0,
    explanation:
      "Wet clothing dramatically increases heat loss through evaporation and conduction, so removing wet clothing and replacing it with dry coverings is an important step in managing cold exposure, not merely a comfort measure.",
  },
  {
    id: "emr-medical-5066",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is a recognized risk factor for hypothermia that an EMR should consider?",
    choices: [
      "Prolonged outdoor exposure, wet clothing, and extremes of age",
      "Being indoors in a heated home",
      "Recent moderate exercise in a warm gym",
      "Wearing dry, weather-appropriate winter clothing",
    ],
    answerIndex: 0,
    explanation:
      "Prolonged outdoor exposure, wet clothing, and extremes of age (very young or elderly) are all recognized risk factors for hypothermia. Being warm indoors, exercising in a warm environment, or wearing appropriate dry winter clothing are protective, not risk factors.",
  },
  // ---------------------------------------------------------------------
  // GENERAL MEDICAL ASSESSMENT / MISCELLANEOUS MEDICAL TOPICS
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5067",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is part of a basic EMR primary assessment for any medical patient?",
    choices: [
      "Checking for a life-threatening problem with airway, breathing, and circulation",
      "Asking only about the patient's insurance information",
      "Only assessing the patient's clothing",
      "Skipping assessment if the patient appears calm",
    ],
    answerIndex: 0,
    explanation:
      "A basic primary assessment always includes checking for immediate life threats involving the airway, breathing, and circulation, regardless of how calm the patient may appear. Insurance information and clothing are not part of a primary assessment.",
  },
  {
    id: "emr-medical-5068",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient complains of chest pain. Which basic EMR action is appropriate while awaiting further care?",
    choices: [
      "Keep the patient calm, position for comfort, monitor closely, and provide supportive care within EMR scope",
      "Have the patient perform strenuous exercise to see if the pain worsens",
      "Ignore the complaint if the patient looks otherwise well",
      "Tell the patient it is probably nothing serious",
    ],
    answerIndex: 0,
    explanation:
      "Keeping a patient with chest pain calm, positioned comfortably, and closely monitored while providing supportive care appropriate to EMR scope is the correct approach, since chest pain can indicate a serious underlying problem. Exercising the patient, ignoring the complaint, or reassuring without assessment are all inappropriate.",
  },
  {
    id: "emr-medical-5069",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient reports sudden, severe abdominal pain and appears pale and sweaty. What is the most appropriate EMR approach?",
    choices: [
      "Treat this as a potentially serious condition, monitor for signs of shock, and arrange prompt transport",
      "Assume it is simple indigestion and take no further action",
      "Have the patient eat something to see if the pain improves",
      "Discharge the patient from EMS care since abdominal pain is rarely serious",
    ],
    answerIndex: 0,
    explanation:
      "Sudden severe abdominal pain with pallor and diaphoresis can indicate a serious internal problem, so the appropriate response is to monitor for shock and arrange prompt transport. Assuming it is minor, giving food, or dismissing the complaint could delay recognition of a life-threatening condition.",
  },
  {
    id: "emr-medical-5070",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient suddenly faints (syncope) but quickly regains consciousness and appears alert. What is an appropriate EMR action?",
    choices: [
      "Assume nothing further needs to be done since the patient woke up quickly",
      "Assess for injury from the fall, evaluate for a possible underlying cause, and monitor closely",
      "Immediately have the patient stand up and walk to prove they are fine",
      "Skip vital signs since the patient regained consciousness",
    ],
    answerIndex: 1,
    explanation:
      "Even a brief episode of unconsciousness warrants assessment for injury from the fall, consideration of possible underlying causes, and continued monitoring, since syncope can be a sign of a serious medical problem. Quickly having the patient stand, or skipping assessment, could miss injury or a dangerous cause.",
  },
  {
    id: "emr-medical-5071",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which vital sign finding would be MOST concerning in a patient reporting weakness and dizziness?",
    choices: [
      "A blood pressure and pulse both within normal limits",
      "A rapid, weak pulse with a low blood pressure",
      "A normal respiratory rate",
      "Normal skin color and temperature",
    ],
    answerIndex: 1,
    explanation:
      "A rapid, weak pulse combined with low blood pressure can indicate shock and is the most concerning finding among these options. Normal vital signs and normal skin findings are reassuring rather than concerning.",
  },
  {
    id: "emr-medical-5072",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "An EMR is caring for a patient with nausea and vomiting who is otherwise alert with stable vital signs. What is an appropriate action?",
    choices: [
      "Position the patient to protect the airway if vomiting occurs, monitor closely, and provide reassurance",
      "Force the patient to eat solid food immediately",
      "Give the patient any available medication to stop vomiting",
      "Ignore the complaint since it seems minor",
    ],
    answerIndex: 0,
    explanation:
      "Positioning to protect the airway during vomiting, close monitoring, and reassurance are appropriate EMR-level actions. Forcing food, giving medications outside EMR scope, or ignoring the complaint are all inappropriate.",
  },
  {
    id: "emr-medical-5073",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the appropriate EMR role when a patient's condition is beyond EMR scope of practice?",
    choices: [
      "Attempt any intervention regardless of training level",
      "Provide basic supportive care within scope and request a higher level of care as soon as possible",
      "Do nothing and wait silently for help to arrive",
      "Tell the patient there is nothing that can be done",
    ],
    answerIndex: 1,
    explanation:
      "When a patient's needs exceed EMR scope of practice, the correct action is to provide basic supportive care within scope and request a higher level of care promptly. Attempting interventions outside of training, doing nothing, or telling the patient nothing can be done are all inappropriate.",
  },
  {
    id: "emr-medical-5074",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient reports a sudden, severe headache described as 'the worst headache of my life.' What should the EMR do?",
    choices: [
      "Dismiss it as a routine headache and take no action",
      "Treat this as a potentially serious condition, monitor closely, and arrange prompt transport",
      "Give the patient any available pain medication",
      "Tell the patient to lie down alone in a dark room without further assessment",
    ],
    answerIndex: 1,
    explanation:
      "A sudden, severe 'worst headache of my life' can be a warning sign of a serious neurological emergency and should be treated seriously with close monitoring and prompt transport. Dismissing it, giving medication outside EMR scope, or leaving the patient without assessment are inappropriate.",
  },
  {
    id: "emr-medical-5075",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why is ongoing reassessment important for any medical patient in EMR care?",
    choices: [
      "A patient's condition can change over time, and reassessment helps detect improvement or deterioration",
      "Reassessment is not necessary once initial vital signs are obtained",
      "Reassessment only matters for trauma patients",
      "Reassessment is only needed if the patient requests it",
    ],
    answerIndex: 0,
    explanation:
      "Patient conditions can change quickly, so ongoing reassessment is essential to detect improvement or deterioration and adjust care accordingly. This applies to medical patients as much as trauma patients, and should not depend on patient request.",
  },
  {
    id: "emr-medical-5076",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is an appropriate general principle for EMR history-taking (SAMPLE-style history)?",
    choices: [
      "Ask about signs/symptoms, allergies, medications, pertinent history, last oral intake, and events leading up to the emergency",
      "Only ask about the patient's name",
      "Avoid asking about medications since it is not relevant",
      "Skip history-taking entirely if the patient looks stable",
    ],
    answerIndex: 0,
    explanation:
      "A structured history covering signs/symptoms, allergies, medications, pertinent medical history, last oral intake, and events leading to the emergency (the SAMPLE approach) provides important information that guides care. Skipping history-taking or omitting medications and allergies can miss critical information.",
  },
  {
    id: "emr-medical-5077",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient tells you they have a known seizure disorder and take medication for it daily but missed their last dose. How is this history relevant?",
    choices: [
      "It has no relevance to the current presentation",
      "Missed anti-seizure medication can increase the risk of a breakthrough seizure and is important information to relay to further care providers",
      "It means the patient is lying about having a seizure disorder",
      "It only matters if the patient is a child",
    ],
    answerIndex: 1,
    explanation:
      "Missing a dose of anti-seizure medication is a recognized risk factor for breakthrough seizures and is important information to gather and pass along to other providers. This history is relevant regardless of the patient's age.",
  },
  {
    id: "emr-medical-5078",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "An unresponsive patient has no medical alert jewelry or identification. Why should the EMR still ask bystanders about medical history?",
    choices: [
      "Bystanders never have useful information",
      "Bystanders may provide important information about the patient's medical history, medications, or events leading up to the emergency",
      "It is only useful for legal documentation, not patient care",
      "This step should be skipped to save time",
    ],
    answerIndex: 1,
    explanation:
      "Bystanders can often provide valuable information about the patient's medical history, medications, allergies, or the events leading up to the emergency, which can meaningfully affect care even when the patient cannot communicate. This information is directly useful for patient care, not just documentation, and should not be skipped.",
  },
  {
    id: "emr-medical-5079",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which is the most appropriate basic action for an EMR encountering a conscious patient complaining of general weakness and no other specific complaint?",
    choices: [
      "Perform a thorough assessment including vital signs and history, since general weakness can have many possible causes",
      "Assume it is not a real complaint and move on",
      "Only ask about the weather",
      "Refuse to assess the patient without a more specific complaint",
    ],
    answerIndex: 0,
    explanation:
      "General weakness can be a sign of many underlying conditions, from hypoglycemia to cardiac problems to infection, so a thorough assessment including vital signs and history is appropriate even without a more specific complaint. Dismissing the complaint or refusing assessment could miss a serious problem.",
  },
  {
    id: "emr-medical-5080",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient with a known seizure disorder has a single brief seizure that stops on its own, and the patient is now returning to their normal baseline. What is an appropriate EMR consideration?",
    choices: [
      "This always requires no further evaluation or transport",
      "Continue to monitor the patient, gather history, and follow local protocol regarding transport, since patients with known seizure disorders can still have complications",
      "Assume the patient is fully recovered and leave immediately",
      "Restrain the patient during the postictal period",
    ],
    answerIndex: 1,
    explanation:
      "Even a patient with a known seizure disorder returning to baseline should continue to be monitored, have a history gathered, and be managed per local protocol, since complications or injury can still occur. Assuming no further care is needed, leaving immediately, or restraining a calm postictal patient are all inappropriate.",
  },
  // ---------------------------------------------------------------------
  // MULTIPLE-CONDITION / MIXED SCENARIO ITEMS
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5081",
    domain: "Medical + OBGYN",
    level: "EMR",
    itemType: "options_table",
    clinicalJudgment: true,
    question:
      "For each finding, identify whether it is more consistent with a diabetic emergency (hypoglycemia) or an allergic reaction (anaphylaxis).",
    options: ["Diabetic emergency (hypoglycemia)", "Allergic reaction (anaphylaxis)"],
    rows: [
      { id: "row1", finding: "Sudden confusion, shakiness, and diaphoresis in a known diabetic with no rash", correctOptionIndex: 0 },
      { id: "row2", finding: "Widespread hives, tongue swelling, and wheezing after a bee sting", correctOptionIndex: 1 },
      { id: "row3", finding: "Rapidly improving mental status after oral glucose administration", correctOptionIndex: 0 },
      { id: "row4", finding: "Low blood pressure with throat tightness after eating a new food", correctOptionIndex: 1 },
    ],
    explanation:
      "Sudden confusion with shakiness and sweating (no rash) and improvement after oral glucose are classic for hypoglycemia. Hives, tongue swelling, wheezing, and throat tightness with low blood pressure after a known trigger (sting or food) are classic for anaphylaxis.",
  },
  {
    id: "emr-medical-5082",
    domain: "Medical + OBGYN",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: true,
    question:
      "Which of the following findings should prompt an EMR to strongly suspect a stroke? (Select 3.)",
    choices: [
      "Sudden facial droop on one side",
      "Sudden slurred or difficult speech",
      "A mild cough that started an hour ago",
      "Sudden weakness or drift of one arm",
      "A patient who reports being generally tired after a full workday",
      "Slight thirst after exercising",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "Sudden facial droop, sudden slurred or difficult speech, and sudden one-sided arm weakness or drift are the classic components of a basic stroke screen and should prompt urgent evaluation and transport. A mild cough, ordinary post-workday tiredness, and mild thirst after exercise are unrelated, common findings that do not suggest stroke.",
  },
  {
    id: "emr-medical-5083",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient outside on a very hot day begins seizing. Bystanders say the patient has no known seizure history and has been complaining of a headache and not sweating despite the heat. What should the EMR consider?",
    choices: [
      "This is unrelated to the heat and should be treated as a routine seizure with no other concerns",
      "The seizure could be related to severe heat stroke, and cooling along with seizure precautions and urgent transport should both be prioritized",
      "The patient must be faking the seizure",
      "No treatment is needed since the seizure will resolve on its own with no consequences",
    ],
    answerIndex: 1,
    explanation:
      "A new seizure with no seizure history, occurring alongside signs of severe heat exposure such as hot, dry skin and headache, should raise concern for heat stroke as a possible cause. The EMR should protect the patient during the seizure, begin cooling measures, and arrange urgent transport rather than treating it as an isolated, unrelated event.",
  },
  {
    id: "emr-medical-5084",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A pregnant patient in active labor reports feeling dizzy and short of breath while lying flat on her back in the ambulance. What is a likely explanation and appropriate action?",
    choices: [
      "This is unrelated to her position and no change is needed",
      "Lying flat may cause the uterus to compress major blood vessels; repositioning her onto her side may help improve her symptoms",
      "She should be encouraged to sit up and walk immediately",
      "This means delivery is imminent regardless of other findings",
    ],
    answerIndex: 1,
    explanation:
      "In later pregnancy, lying flat on the back can allow the uterus to compress major blood vessels, reducing blood return to the heart and causing dizziness and shortness of breath; repositioning onto the side (commonly the left side) is a basic, well-recognized measure that can relieve these symptoms. This is unrelated to whether delivery is imminent, and having her walk during active labor with these symptoms would not be appropriate.",
  },
  {
    id: "emr-medical-5085",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "An EMR is caring for a patient with a suspected overdose who becomes combative and confused after initially being calm. What should the EMR prioritize?",
    choices: [
      "Personal safety while continuing to monitor the patient's airway and breathing as closely as safely possible",
      "Physically restraining the patient alone regardless of safety",
      "Leaving the scene entirely without notifying anyone",
      "Ignoring the behavior change since it is expected in overdose patients",
    ],
    answerIndex: 0,
    explanation:
      "A combative, confused patient can pose a safety risk, so the EMR should prioritize personal safety while continuing to monitor the airway and breathing as safely as possible, requesting additional resources such as law enforcement if needed. Attempting solo physical restraint, abandoning the patient without notification, or ignoring a dangerous behavior change are all inappropriate.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL AMS / DIABETIC
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5086",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of these is a common early sign of hypoglycemia in a conscious patient?",
    choices: [
      "Sudden irritability, sweating, and trembling",
      "Slow, deep breathing with a fruity odor",
      "Complete loss of consciousness with no warning signs",
      "A rash spreading across the whole body",
    ],
    answerIndex: 0,
    explanation:
      "Irritability, sweating, and trembling are common early warning signs of hypoglycemia before more severe symptoms develop. A fruity breath odor is more classically associated with diabetic ketoacidosis (high blood sugar), not hypoglycemia, and a body-wide rash is unrelated.",
  },
  {
    id: "emr-medical-5087",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient with altered mental status has a medical bracelet indicating diabetes but cannot reliably swallow safely. What is the appropriate EMR action regarding oral glucose?",
    choices: [
      "Give oral glucose anyway since the bracelet confirms diabetes",
      "Do not give anything by mouth; focus on airway management, supportive care, and requesting a higher level of care",
      "Force the patient to swallow water first to test their ability",
      "Give the oral glucose but only a very small amount",
    ],
    answerIndex: 1,
    explanation:
      "Regardless of a known diabetic history, a patient who cannot reliably swallow safely should not be given anything by mouth due to aspiration risk. The priority becomes airway management, supportive care, and escalating to a higher level of care. Testing swallowing with water or giving a reduced amount of glucose does not resolve the aspiration risk.",
  },
  {
    id: "emr-medical-5088",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is NOT an appropriate reason to withhold oral glucose from a hypoglycemic patient?",
    choices: [
      "The patient is unconscious and cannot protect their airway",
      "The patient is actively vomiting",
      "The patient is alert, cooperative, and able to swallow safely",
      "The patient is unable to follow simple commands",
    ],
    answerIndex: 2,
    explanation:
      "An alert, cooperative patient who can swallow safely is an appropriate candidate for oral glucose, so this is not a reason to withhold it. Unconsciousness, active vomiting, and inability to follow commands are all legitimate reasons to withhold anything by mouth due to aspiration risk.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL STROKE
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5089",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A stroke screen finding resolves completely within a few minutes, and the patient returns to baseline before you finish your assessment. What should the EMR do?",
    choices: [
      "Assume nothing further is needed since symptoms resolved",
      "Still treat this seriously, document the timeline, and arrange transport, since resolved symptoms can represent a transient event that may recur or indicate ongoing risk",
      "Refuse transport since the patient looks normal now",
      "Tell the patient it was definitely not a medical event",
    ],
    answerIndex: 1,
    explanation:
      "Even if stroke-like symptoms resolve, this can represent a transient event and the patient remains at risk for a future, potentially more serious event, so it should still be treated seriously with careful documentation and transport. Assuming no further action is needed, refusing transport, or reassuring the patient that nothing occurred are all inappropriate.",
  },
  {
    id: "emr-medical-5090",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is an appropriate basic supportive measure for a patient with suspected stroke who has an intact gag reflex and is not in immediate distress?",
    choices: [
      "Keep the patient positioned comfortably, monitor the airway, and avoid giving anything by mouth if swallowing is impaired",
      "Immediately give the patient food to keep their strength up",
      "Have the patient try to walk to prove their strength is normal",
      "Ignore airway monitoring since the patient is currently breathing",
    ],
    answerIndex: 0,
    explanation:
      "Comfortable positioning, ongoing airway monitoring, and avoiding oral intake when swallowing may be impaired are appropriate basic measures for a suspected stroke patient. Giving food, testing ambulation, or neglecting airway monitoring could all worsen outcomes.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL SEIZURE
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5091",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A child has a seizure during a high fever (a febrile seizure). What is an appropriate basic EMR action?",
    choices: [
      "Protect the child from injury during the seizure and support the airway afterward, then arrange evaluation",
      "Immerse the child in an ice bath immediately during the seizure",
      "Restrain the child's movements firmly",
      "Give the child oral medication during the active seizure",
    ],
    answerIndex: 0,
    explanation:
      "Protecting the child from injury during the seizure and supporting the airway afterward, followed by appropriate evaluation, is the correct basic approach for a febrile seizure. Ice baths, restraining movements, and giving anything by mouth during an active seizure are all inappropriate and potentially harmful.",
  },
  {
    id: "emr-medical-5092",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Bystanders describe a patient's seizure as lasting 'several minutes and still going' when EMS arrives. Why is this duration significant?",
    choices: [
      "It is not significant and requires no change in urgency",
      "A prolonged, ongoing seizure is more likely to represent status epilepticus, a true emergency requiring urgent transport",
      "It means the patient is definitely faking",
      "It only matters if the seizure involves just one limb",
    ],
    answerIndex: 1,
    explanation:
      "A seizure that continues for several minutes without stopping raises concern for status epilepticus, a life-threatening condition that requires urgent transport and escalation of care. This duration is clinically significant, not something to be dismissed, and the concern applies regardless of which limbs are involved.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL ANAPHYLAXIS
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5093",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "After administering epinephrine to a patient with anaphylaxis, which side effect might the EMR expect and should not be mistaken for worsening of the allergic reaction itself?",
    choices: [
      "A temporary increase in heart rate and feeling shaky",
      "Permanent hearing loss",
      "Immediate loss of consciousness as a direct medication effect",
      "Complete resolution of all symptoms within seconds with no monitoring needed",
    ],
    answerIndex: 0,
    explanation:
      "Epinephrine commonly causes a temporary increase in heart rate and a shaky feeling as an expected medication effect, which should not be mistaken for the allergic reaction worsening. It does not cause hearing loss or direct loss of consciousness, and the patient still requires continued monitoring even after treatment.",
  },
  {
    id: "emr-medical-5094",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which route of exposure is a recognized cause of anaphylaxis that an EMR should ask about during history-taking?",
    choices: [
      "Insect stings, foods, and medications",
      "Reading a book",
      "Listening to loud music",
      "Wearing sunglasses",
    ],
    answerIndex: 0,
    explanation:
      "Insect stings, foods, and medications are all well-recognized routes of exposure that can trigger anaphylaxis and are important to ask about during history-taking. The other options are not recognized triggers.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL POISONING/OVERDOSE
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5095",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "You arrive at a scene where a patient is found down near an open container of household chemicals with a strong odor in the air. What should the EMR do BEFORE entering the immediate area?",
    choices: [
      "Assess the scene for hazards and consider whether specialized hazardous materials resources are needed before approaching",
      "Rush in immediately without any assessment of the fumes",
      "Open all windows and doors before assessing anything else",
      "Remove the chemical container yourself before assessing the patient",
    ],
    answerIndex: 0,
    explanation:
      "A strong chemical odor and a patient found down suggests a possible hazardous atmosphere, so the scene should be assessed for hazards, with specialized hazardous materials resources called if needed, before entering. Rushing in, focusing on ventilation before hazard assessment, or personally handling unknown chemicals could put the responder at serious risk.",
  },
  {
    id: "emr-medical-5096",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient who took an unknown substance is now awake, alert, and denies any symptoms, but bystanders are worried. What is the most appropriate EMR action?",
    choices: [
      "Take the bystander concerns seriously, perform a thorough assessment, and encourage transport for evaluation even if the patient currently feels well",
      "Dismiss bystander concerns entirely since the patient denies symptoms",
      "Leave without any assessment since the patient looks fine",
      "Assume bystanders are always wrong",
    ],
    answerIndex: 0,
    explanation:
      "Some poisonings can have delayed effects, so bystander concerns should be taken seriously with a thorough assessment and encouragement toward evaluation, even if the patient currently feels well and denies symptoms. Dismissing concerns or leaving without assessment could miss a delayed but serious effect.",
  },
  {
    id: "emr-medical-5097",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which finding in a suspected overdose patient would most strongly indicate the need for immediate airway intervention?",
    choices: [
      "The patient is snoring loudly and has minimal chest rise with each breath",
      "The patient is speaking clearly in full sentences",
      "The patient's pupils are of normal size",
      "The patient's skin is warm and dry",
    ],
    answerIndex: 0,
    explanation:
      "Loud snoring respirations with minimal chest rise suggest inadequate airway patency and ventilation, requiring immediate airway intervention. Clear speech, normal pupil size, and warm dry skin do not indicate an airway emergency.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL CHILDBIRTH / OB
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5098",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is an appropriate basic EMR action once a newborn has delivered and is breathing well, pink, and active?",
    choices: [
      "Dry and keep the newborn warm, and place skin-to-skin with the mother if possible while continuing to monitor both",
      "Immediately separate the newborn from the mother for an extended period",
      "Submerge the newborn briefly in cool water to stimulate breathing further",
      "Withhold warming since the newborn already appears well",
    ],
    answerIndex: 0,
    explanation:
      "For a newborn who is breathing well, pink, and active, drying, keeping warm, and placing skin-to-skin with the mother (if practical) while continuing to monitor both patients is appropriate basic care. Prolonged separation, cool-water submersion, or withholding warmth are all inappropriate.",
  },
  {
    id: "emr-medical-5099",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "After delivery, the mother has heavy, ongoing vaginal bleeding. What is an appropriate basic EMR action?",
    choices: [
      "Monitor for shock, provide supportive care within scope, and arrange urgent transport",
      "Assume postpartum bleeding is never a concern",
      "Delay any transport since bleeding after delivery is always minor",
      "Focus only on the newborn and ignore the mother's bleeding",
    ],
    answerIndex: 0,
    explanation:
      "Heavy, ongoing postpartum bleeding can lead to shock and is a true emergency requiring close monitoring, supportive care within EMR scope, and urgent transport. It should never be assumed to be minor or ignored, and both the mother and newborn need ongoing attention.",
  },
  {
    id: "emr-medical-5100",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A pregnant patient in her third trimester is involved in a minor fall and reports no pain but is worried about the baby. What is an appropriate EMR action?",
    choices: [
      "Perform a thorough assessment of the mother, monitor for any signs of complication, and arrange transport for further evaluation",
      "Tell her not to worry and leave without any assessment",
      "Only assess for injuries to her extremities and nothing else",
      "Assume the baby cannot be affected by any fall",
    ],
    answerIndex: 0,
    explanation:
      "Even a minor fall in pregnancy warrants a thorough assessment and transport for further evaluation, since complications are not always immediately apparent. Dismissing her concerns, limiting the assessment, or assuming the pregnancy cannot be affected are all inappropriate.",
  },
  {
    id: "emr-medical-5101",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient states she is 'about 7 months pregnant' and is having occasional, mild, irregular contractions but no other symptoms. What is the most appropriate EMR interpretation?",
    choices: [
      "This clearly means delivery is imminent and field delivery should be prepared for immediately",
      "This may represent normal Braxton-Hicks-type contractions or early labor; continued assessment and transport for evaluation is appropriate",
      "This requires no assessment at all since it is 'probably nothing'",
      "This means the pregnancy is not real",
    ],
    answerIndex: 1,
    explanation:
      "Occasional, mild, irregular contractions without other concerning findings may represent normal Braxton-Hicks contractions or early labor rather than imminent delivery, but continued assessment and transport for proper evaluation is still appropriate, since only a thorough exam (typically not performed by EMR) can fully clarify the stage of labor. Assuming imminent delivery or skipping assessment are both inappropriate extremes.",
  },
  {
    id: "emr-medical-5102",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which basic supplies would an EMR typically want readily available when preparing for an imminent field delivery?",
    choices: [
      "Clean towels or sheets, gloves, and supplies to keep the newborn warm",
      "A stethoscope only",
      "A blood pressure cuff and nothing else",
      "No supplies are needed for a field delivery",
    ],
    answerIndex: 0,
    explanation:
      "Clean towels or sheets, gloves for standard precautions, and supplies to dry and warm the newborn are basic essentials for an imminent field delivery. A stethoscope or blood pressure cuff alone would not be sufficient, and having no supplies prepared would not be appropriate given the urgency.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL BEHAVIORAL
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5103",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which is an appropriate general strategy when a patient with a behavioral emergency refuses to answer questions but is not posing an immediate danger?",
    choices: [
      "Remain patient, continue to build rapport calmly, and avoid rushing or pressuring the patient",
      "Immediately restrain the patient for refusing to talk",
      "Leave the scene entirely without further attempts",
      "Raise your voice to demand answers",
    ],
    answerIndex: 0,
    explanation:
      "Remaining patient, calmly building rapport, and avoiding pressure are appropriate strategies for a patient who is not posing immediate danger but is reluctant to communicate. Restraint, abandoning the scene, or raising your voice are all inappropriate responses to simple reluctance.",
  },
  {
    id: "emr-medical-5104",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why should an EMR avoid making sudden movements around a patient experiencing a behavioral emergency?",
    choices: [
      "Sudden movements can startle or provoke the patient and increase the risk of an aggressive response",
      "Sudden movements have no effect on patient behavior",
      "It is only a concern for pediatric patients",
      "It is only relevant when law enforcement is present",
    ],
    answerIndex: 0,
    explanation:
      "Sudden movements can startle or provoke an already agitated patient and increase the risk of an aggressive reaction, so calm, deliberate movement is a basic safety and de-escalation principle. This applies to patients of any age and regardless of whether law enforcement is present.",
  },
  {
    id: "emr-medical-5105",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient experiencing a behavioral emergency asks repeatedly what is going to happen to them. What is an appropriate EMR response?",
    choices: [
      "Provide clear, honest, simple information about what is happening in a calm tone",
      "Refuse to answer any questions at all",
      "Make up false information to end the conversation quickly",
      "Ignore the patient's questions entirely",
    ],
    answerIndex: 0,
    explanation:
      "Providing clear, honest, simple information in a calm tone helps build trust and can reduce anxiety during a behavioral emergency. Refusing to answer, providing false information, or ignoring the patient can increase distress and mistrust.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL HEAT / COLD
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5106",
    domain: "Medical + OBGYN",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: false,
    question:
      "Which of the following findings are consistent with heat exhaustion rather than heat stroke? (Select 2.)",
    choices: [
      "Heavy sweating with cool, clammy skin",
      "The patient remains alert and oriented",
      "Hot, dry skin with severe confusion",
      "Complete unresponsiveness with no sweating",
      "The patient is not producing any urine at all for days",
    ],
    correctIndices: [0, 1],
    explanation:
      "Heavy sweating with cool, clammy skin and a patient who remains alert and oriented are consistent with heat exhaustion, a less severe heat illness. Hot, dry skin with severe confusion and complete unresponsiveness are more consistent with heat stroke, a more severe and life-threatening condition; lack of urine output over days is unrelated to this basic distinction.",
  },
  {
    id: "emr-medical-5107",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "An EMR is caring for a patient with suspected frostbite to the toes. The patient wants to walk to the ambulance. What is an appropriate consideration?",
    choices: [
      "Walking on a frostbitten area may cause further tissue damage, so carrying or otherwise limiting weight-bearing on the affected area, when possible, may be preferable",
      "Walking has no effect on frostbitten tissue",
      "The patient should run to keep warm",
      "It does not matter how the patient is moved",
    ],
    answerIndex: 0,
    explanation:
      "Walking on frostbitten tissue can worsen the injury, so limiting weight-bearing on the affected area when possible is a reasonable basic consideration. Running or disregarding how the patient is moved could increase tissue damage.",
  },
  {
    id: "emr-medical-5108",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best describes an appropriate approach to rewarming a patient with mild hypothermia?",
    choices: [
      "Passive rewarming with dry blankets and a warm environment, avoiding direct high heat sources",
      "Immersing the patient immediately in very hot water",
      "Applying a heating pad directly to bare skin on its highest setting",
      "Rewarming is unnecessary in mild hypothermia",
    ],
    answerIndex: 0,
    explanation:
      "Passive rewarming with dry blankets and a warm environment is appropriate for mild hypothermia, while very hot water immersion or direct high-heat sources on bare skin can cause burns or other complications. Rewarming is still an important part of care, even in mild cases.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL GENERAL MEDICAL
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5109",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient reports feeling their heart 'racing' and appears anxious, with a rapid but regular pulse and normal blood pressure. What is an appropriate initial EMR action?",
    choices: [
      "Perform a basic assessment, monitor vital signs closely, and provide reassurance while arranging transport for evaluation",
      "Assume this is always simple anxiety with no need for assessment",
      "Have the patient perform vigorous exercise to see if symptoms worsen",
      "Discharge the patient from care without any evaluation",
    ],
    answerIndex: 0,
    explanation:
      "A rapid heart rate can have many causes, some benign and some serious, so a basic assessment, close monitoring, reassurance, and transport for further evaluation is appropriate. Assuming it is only anxiety without assessment, provoking exercise, or discharging without evaluation could all miss a more serious cause.",
  },
  {
    id: "emr-medical-5110",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is an appropriate reason to request additional or advanced EMS resources for a medical patient?",
    choices: [
      "The patient's condition appears to be beyond basic EMR scope of practice or is deteriorating",
      "The EMR feels bored on scene",
      "The patient asks the EMR to call for a specific ambulance company",
      "The weather is pleasant outside",
    ],
    answerIndex: 0,
    explanation:
      "Requesting additional or advanced resources is appropriate whenever a patient's condition is beyond EMR scope or appears to be worsening, since timely escalation can be critical to patient outcomes. Boredom, a specific company request, or pleasant weather are not clinical reasons to escalate care.",
  },
  {
    id: "emr-medical-5111",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient with a known heart condition reports chest discomfort that improved after resting for a few minutes. What is an appropriate EMR action?",
    choices: [
      "Assume the problem is fully resolved and take no further action",
      "Still perform a thorough assessment, monitor closely, and encourage transport for evaluation, since resolved symptoms can still indicate a serious underlying problem",
      "Tell the patient it was definitely not their heart",
      "Have the patient resume strenuous activity to confirm the symptoms are gone",
    ],
    answerIndex: 1,
    explanation:
      "Even if chest discomfort resolves with rest, this can still represent a serious underlying cardiac problem, so a thorough assessment, close monitoring, and encouragement toward transport for evaluation remain appropriate. Assuming full resolution, reassuring the patient it was not cardiac, or having them resume strenuous activity are all inappropriate.",
  },
  {
    id: "emr-medical-5112",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best reflects appropriate EMR documentation and hand-off practice for a medical patient?",
    choices: [
      "Provide an accurate, organized summary of findings, history, and care given to the next level of care",
      "Provide no information at hand-off to save time",
      "Only share information the EMR feels is important, regardless of accuracy",
      "Guess at vital signs rather than reporting what was actually measured",
    ],
    answerIndex: 0,
    explanation:
      "Accurate, organized hand-off communication of findings, history, and care given is essential for continuity of patient care. Withholding information, selectively sharing based on personal judgment without regard to accuracy, or guessing at vital signs can all compromise patient safety.",
  },
  {
    id: "emr-medical-5113",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient with a suspected medical emergency initially refuses care and transport but then becomes confused and unable to make decisions. What should the EMR consider?",
    choices: [
      "A confused patient may no longer be able to give informed refusal, and local protocol regarding implied consent and further care should be followed",
      "Once refused, care can never be provided again regardless of changes in condition",
      "Confusion has no bearing on a patient's ability to refuse care",
      "The EMR should simply leave once any refusal has occurred, regardless of later changes",
    ],
    answerIndex: 0,
    explanation:
      "A patient's ability to make an informed refusal depends on their mental status; if they become confused and unable to understand their situation, they may no longer be able to validly refuse care, and local protocols regarding implied consent typically apply. Refusals are not necessarily permanent if the patient's condition changes, and confusion is directly relevant to decision-making capacity.",
  },
  {
    id: "emr-medical-5114",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which basic principle applies to standard precautions (such as gloves) when caring for any medical patient?",
    choices: [
      "Standard precautions should be used consistently to protect both the patient and the EMR from potential exposure",
      "Standard precautions are only necessary for visibly bloody wounds",
      "Standard precautions are optional and depend on how the EMR feels that day",
      "Standard precautions are unnecessary for medical (non-trauma) patients",
    ],
    answerIndex: 0,
    explanation:
      "Standard precautions, such as gloves, should be used consistently for all patient contact, not only for visibly bloody injuries, to protect both the patient and the responder from potential exposure to bodily fluids. This applies to medical and trauma patients alike, and is not optional or dependent on personal preference.",
  },
  {
    id: "emr-medical-5115",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "An EMR is on scene with a single patient who has multiple complaints: confusion, sweating, and a rapid pulse, with a history of both diabetes and a seizure disorder. What is the best approach?",
    choices: [
      "Assess broadly, consider multiple possible causes (such as hypoglycemia or a postictal state), gather history, and provide supportive care while arranging transport",
      "Assume it is only related to the seizure disorder and ignore the possibility of a diabetic cause",
      "Randomly pick one diagnosis without further assessment",
      "Refuse to assess since the patient has more than one medical history",
    ],
    answerIndex: 0,
    explanation:
      "When a patient has overlapping symptoms and multiple relevant medical histories, the EMR should assess broadly, consider several possible causes, gather a thorough history, and provide supportive care rather than fixating on a single cause or refusing to assess. Assuming only one cause or picking randomly without assessment could miss a treatable emergency such as hypoglycemia.",
  },
  {
    id: "emr-medical-5116",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the primary EMR role in most medical emergencies beyond basic scope?",
    choices: [
      "Recognize the problem, provide basic supportive care and treatment within scope, and ensure timely access to a higher level of care",
      "Diagnose the exact underlying disease process",
      "Perform advanced procedures regardless of training",
      "Avoid calling for additional resources whenever possible",
    ],
    answerIndex: 0,
    explanation:
      "The EMR's core role is recognizing a problem, providing supportive care and treatment within scope, and ensuring the patient reaches a higher level of care in a timely way, rather than diagnosing specific disease processes or performing procedures outside their training. Avoiding calls for additional resources when they are needed would be inappropriate and potentially dangerous.",
  },
  {
    id: "emr-medical-5117",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient's condition appears stable at first assessment. Which action best reflects good EMR practice for the remainder of the call?",
    choices: [
      "Continue periodic reassessment throughout care, since a patient's condition can change",
      "Perform only one assessment and assume nothing will change",
      "Stop monitoring once the patient states they feel fine",
      "Only reassess if the patient specifically requests it",
    ],
    answerIndex: 0,
    explanation:
      "Good EMR practice includes ongoing, periodic reassessment throughout the call, since a patient's condition can change even after an initially stable assessment. Assuming no change, stopping monitoring based on the patient's subjective report alone, or only reassessing on request could all miss deterioration.",
  },
  {
    id: "emr-medical-5118",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which combination of findings would MOST strongly suggest a medical patient is developing shock?",
    choices: [
      "Warm, dry skin with a normal, strong pulse",
      "Pale, cool, clammy skin with a rapid, weak pulse and altered mental status",
      "Normal color skin with a slow, strong pulse and full alertness",
      "Flushed skin with a normal pulse and full alertness",
    ],
    answerIndex: 1,
    explanation:
      "Pale, cool, clammy skin combined with a rapid, weak pulse and altered mental status is a classic pattern of shock and should be treated as a serious emergency. Warm dry skin with a strong normal pulse, or a fully alert patient with normal findings, do not suggest shock.",
  },
  {
    id: "emr-medical-5119",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the most appropriate general EMR action for ANY patient found in shock, regardless of the underlying cause?",
    choices: [
      "Provide basic supportive care (positioning, keeping the patient warm, oxygen as indicated), monitor closely, and arrange urgent transport",
      "Wait to determine the exact cause before providing any care",
      "Give the patient food and water to restore strength",
      "Have the patient stand and walk to assess how severe the shock is",
    ],
    answerIndex: 0,
    explanation:
      "Regardless of the underlying cause, basic supportive care such as appropriate positioning, keeping the patient warm, oxygen when indicated, close monitoring, and urgent transport are appropriate for any patient in shock. Delaying care to determine an exact cause, giving food or water, or having the patient exert themselves could worsen the outcome.",
  },
  {
    id: "emr-medical-5120",
    domain: "Medical + OBGYN",
    level: "EMR",
    itemType: "drag_drop",
    clinicalJudgment: true,
    question:
      "Place each finding into the correct category: Life-Threatening (requires immediate action) or Non-Immediate (can be addressed after life threats).",
    categories: [
      { id: "immediate", label: "Life-Threatening" },
      { id: "nonImmediate", label: "Non-Immediate" },
    ],
    items: [
      { id: "d1", label: "Inadequate breathing with slow, shallow respirations", correctCategory: "immediate" },
      { id: "d2", label: "Unresponsive with no gag reflex and an unprotected airway", correctCategory: "immediate" },
      { id: "d3", label: "A small, well-healed scar from an old injury", correctCategory: "nonImmediate" },
      { id: "d4", label: "Mild, stable itching on one arm with no other symptoms", correctCategory: "nonImmediate" },
      { id: "d5", label: "Signs of shock, including pale, cool, clammy skin and a weak rapid pulse", correctCategory: "immediate" },
    ],
    explanation:
      "Inadequate breathing, an unprotected airway in an unresponsive patient, and signs of shock are all immediate life threats requiring urgent action. An old healed scar and mild, stable, isolated itching are non-immediate findings that can be addressed after life threats are managed.",
  },
  // ---------------------------------------------------------------------
  // MORE STROKE / SEIZURE / ANAPHYLAXIS DEPTH
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5121",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "You perform a basic stroke screen and find all three signs (facial droop, arm drift, and slurred speech) are absent, but the patient still reports sudden vision loss in one eye. What should the EMR do?",
    choices: [
      "Assume there is no stroke since the basic screen was negative and take no further action",
      "Still treat this seriously and arrange transport, since sudden vision changes can also indicate a stroke even with a negative basic screen",
      "Tell the patient it is only eye strain",
      "Delay transport until the vision returns on its own",
    ],
    answerIndex: 1,
    explanation:
      "A basic stroke screen does not test every possible stroke symptom, and sudden vision loss can itself be a sign of stroke, so this should still be treated seriously with prompt transport even if the standard facial/arm/speech screen is negative. Assuming no stroke, dismissing the symptom, or delaying transport could all be dangerous.",
  },
  {
    id: "emr-medical-5122",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient having a seizure has vomit in their mouth once the active jerking movements stop. What is the appropriate EMR action?",
    choices: [
      "Position the patient to allow drainage and clear the airway as needed, per basic airway management principles",
      "Give the patient water to wash it down",
      "Ignore it since the seizure has stopped",
      "Have the patient sit fully upright immediately regardless of consciousness level",
    ],
    answerIndex: 0,
    explanation:
      "Positioning to allow drainage and clearing the airway as needed are basic airway management principles that apply when vomit is present after a seizure. Giving water, ignoring the vomit, or sitting an altered patient fully upright without airway control could all lead to aspiration.",
  },
  {
    id: "emr-medical-5123",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which statement about epinephrine auto-injectors is accurate for EMR-level care?",
    choices: [
      "An EMR may only assist with a patient's own prescribed auto-injector if permitted by local protocol and scope of practice",
      "Any EMR can carry and use any auto-injector on any patient with no restrictions",
      "Auto-injectors are never appropriate in the prehospital setting",
      "Auto-injectors should always be given regardless of the patient's symptoms",
    ],
    answerIndex: 0,
    explanation:
      "EMR use of epinephrine auto-injectors is generally limited to assisting a patient with their own prescribed device, and only when permitted by local protocol and within scope of practice. Using any device without restriction, refusing to use them at all, or giving them regardless of symptoms are all inaccurate statements.",
  },
  // ---------------------------------------------------------------------
  // FINAL MIXED / ASSESSMENT ITEMS
  // ---------------------------------------------------------------------
  {
    id: "emr-medical-5124",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient with a documented allergy to a medication is found unresponsive after apparently taking that exact medication by mistake, with swelling of the face and difficulty breathing. Which condition should the EMR strongly suspect?",
    choices: [
      "Anaphylaxis",
      "A simple headache",
      "Mild seasonal allergies",
      "Normal fatigue",
    ],
    answerIndex: 0,
    explanation:
      "Facial swelling and difficulty breathing after exposure to a known allergen strongly suggest anaphylaxis, a life-threatening emergency requiring urgent care. This presentation goes well beyond a headache, mild seasonal allergies, or ordinary fatigue.",
  },
  {
    id: "emr-medical-5125",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which action best reflects appropriate basic supportive care for a patient with suspected anaphylaxis who has already received epinephrine and remains conscious?",
    choices: [
      "Continue to monitor airway, breathing, and circulation closely, position for comfort, and prepare for possible further deterioration during transport",
      "Assume the medication has completely cured the reaction and stop all monitoring",
      "Leave the patient unattended to gather more history from bystanders",
      "Encourage the patient to walk to the ambulance quickly on their own",
    ],
    answerIndex: 0,
    explanation:
      "Even after epinephrine is given, continued close monitoring of the airway, breathing, and circulation, along with comfortable positioning, is essential because anaphylaxis can recur or worsen. Stopping monitoring, leaving the patient unattended, or having them exert themselves by walking are all inappropriate.",
  },
  {
    id: "emr-medical-5126",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient is found unresponsive outdoors in very cold weather with no obvious trauma. Bystanders are unsure how long the patient has been there. What is an appropriate EMR consideration?",
    choices: [
      "Consider hypothermia as a possible cause and handle the patient gently while assessing breathing and pulse carefully, since severe hypothermia can slow vital signs significantly",
      "Assume the patient is deceased without careful assessment",
      "Move the patient roughly and quickly regardless of suspected hypothermia",
      "Ignore the environmental conditions entirely",
    ],
    answerIndex: 0,
    explanation:
      "In severe hypothermia, pulse and breathing can be extremely slow and difficult to detect, so careful, extended assessment and gentle handling are important before assuming the worst. Assuming death without careful assessment, handling the patient roughly, or ignoring the cold environment could all be harmful or lead to an incorrect conclusion.",
  },
  {
    id: "emr-medical-5127",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A patient in active labor tells you she feels the baby is 'coming right now' and you can see the baby's head crowning. What should the EMR generally avoid doing?",
    choices: [
      "Avoid attempting to delay delivery by holding the baby's head back or telling her to cross her legs",
      "Avoid supporting the baby's head as it delivers",
      "Avoid keeping the newborn warm after delivery",
      "Avoid monitoring the mother after delivery",
    ],
    answerIndex: 0,
    explanation:
      "Once crowning is present, delivery should not be delayed by holding the head back or having the mother physically try to prevent delivery, since this is unsafe. Supporting the baby's head appropriately, keeping the newborn warm, and monitoring the mother afterward are all things the EMR SHOULD do, not avoid.",
  },
  {
    id: "emr-medical-5128",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A behavioral emergency patient calms down significantly after the EMR uses de-escalation techniques, but law enforcement has already been requested due to an earlier weapon concern. What should the EMR do?",
    choices: [
      "Cancel the law enforcement request immediately once the patient calms down",
      "Continue to monitor the situation calmly and let law enforcement arrive as planned, since the earlier safety concern still warrants their presence",
      "Ignore the patient completely once calm",
      "Confront the patient about the earlier weapon to make a point",
    ],
    answerIndex: 1,
    explanation:
      "Even if a patient calms down, an earlier legitimate safety concern (such as a weapon) generally still warrants having law enforcement arrive as planned, since the situation could change again. Canceling the request prematurely, ignoring the patient, or confronting them about the earlier incident are all inappropriate.",
  },
  {
    id: "emr-medical-5129",
    domain: "Medical + OBGYN",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best summarizes the EMR's overall approach to any unfamiliar or complex medical emergency?",
    choices: [
      "Ensure scene safety, assess for and manage life threats, provide supportive care within scope, and arrange appropriate transport or a higher level of care",
      "Attempt to perform advanced procedures outside of training to help as much as possible",
      "Avoid engaging with the patient until specialized units arrive",
      "Focus only on paperwork and skip patient care entirely",
    ],
    answerIndex: 0,
    explanation:
      "Regardless of how unfamiliar or complex a medical emergency seems, the core EMR approach remains ensuring scene safety, identifying and managing life threats, providing supportive care within scope, and arranging appropriate transport or escalation of care. Performing procedures beyond training, avoiding the patient, or neglecting care in favor of paperwork are all inappropriate.",
  },
  {
    id: "emr-medical-5130",
    domain: "Medical + OBGYN",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: true,
    question:
      "Which of the following are appropriate EMR actions for a patient with an active generalized seizure? (Select 3.)",
    choices: [
      "Protect the patient from nearby hazards",
      "Cushion the patient's head",
      "Place a spoon or other object in the patient's mouth",
      "Time the duration of the seizure if possible",
      "Firmly hold down the patient's arms and legs to stop the movements",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "Protecting the patient from hazards, cushioning the head, and timing the seizure duration are all appropriate and important EMR actions during an active seizure. Placing any object in the mouth and forcibly restraining the patient's movements are both inappropriate and can cause injury.",
  },
];
