// ORIGINAL EMR Cardiology practice questions. Generated batch.
// IDs emr-cardiology-5000 through emr-cardiology-5159, sequential, no gaps.
// level: "EMR", domain: "Cardiology". Scope strictly limited to EMR-level
// cardiac competencies: recognition of cardiac emergencies, high-quality
// CPR, AED use, shock recognition, basic vital signs, and chain of survival.

export const BATCH = [
  // ---------------------------------------------------------------------
  // CPR: rate, depth, recoil, hand placement, compression-only, fatigue
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5000",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For an adult in cardiac arrest, what is the recommended chest compression rate?",
    choices: [
      "60 to 80 compressions per minute",
      "100 to 120 compressions per minute",
      "140 to 160 compressions per minute",
      "As fast as the rescuer can physically compress",
    ],
    answerIndex: 1,
    explanation:
      "Current guidelines call for a compression rate of 100 to 120 per minute for adults. Slower rates (60-80) under-perfuse the brain and heart, and rates faster than 120 do not allow adequate chest recoil and coronary filling.",
  },
  {
    id: "emr-cardiology-5001",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the recommended chest compression depth for an average adult?",
    choices: [
      "At least 1 inch (2.5 cm)",
      "At least 2 inches (5 cm), not exceeding 2.4 inches (6 cm)",
      "At least 3 inches (7.5 cm)",
      "Only as deep as feels comfortable for the rescuer",
    ],
    answerIndex: 1,
    explanation:
      "Adult compressions should be at least 2 inches deep but not more than 2.4 inches, to generate adequate blood flow without causing excessive injury. Shallower compressions (choice A) under-perfuse vital organs, and depths beyond 2.4 inches increase injury risk without added benefit.",
  },
  {
    id: "emr-cardiology-5002",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why is allowing full chest recoil between compressions important during CPR?",
    choices: [
      "It lets the rescuer rest between compressions",
      "It allows the heart to refill with blood before the next compression",
      "It reduces the chance the AED will need to be used",
      "It is not important as long as the rate is correct",
    ],
    answerIndex: 1,
    explanation:
      "Full recoil allows venous blood to return to the heart between compressions, which is necessary for the next compression to generate forward blood flow. Leaning on the chest between compressions reduces cardiac filling and lowers perfusion, regardless of rate.",
  },
  {
    id: "emr-cardiology-5003",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are performing chest compressions alone and begin to feel fatigued, causing your compression depth to become shallow. What should you do?",
    choices: [
      "Continue at the same depth since switching would interrupt compressions",
      "Stop CPR entirely until you feel rested",
      "Switch with another rescuer, or briefly rotate compressors, to maintain compression quality",
      "Decrease the compression rate to conserve energy",
    ],
    answerIndex: 2,
    explanation:
      "Rescuer fatigue causes compression quality to degrade within about two minutes, even if the rescuer does not feel tired. Rotating compressors (ideally every two minutes) with minimal interruption maintains adequate depth and rate. Stopping CPR or accepting shallow compressions both reduce survival chances.",
  },
  {
    id: "emr-cardiology-5004",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Where should hand placement be for adult chest compressions?",
    choices: [
      "On the upper third of the sternum",
      "On the lower half of the sternum, between the nipples",
      "Directly over the xiphoid process",
      "On the left side of the chest over the apex of the heart",
    ],
    answerIndex: 1,
    explanation:
      "Compressions should be delivered on the lower half of the sternum. Compressing over the xiphoid process risks lacerating the liver, and the upper sternum or lateral chest wall does not effectively compress the heart between the sternum and spine.",
  },
  {
    id: "emr-cardiology-5005",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For a single rescuer performing CPR on an adult, what is the correct compression-to-ventilation ratio?",
    choices: ["15:2", "30:2", "5:1", "10:1"],
    answerIndex: 1,
    explanation:
      "For one or two rescuers with an unprotected airway on an adult, the compression-to-ventilation ratio is 30:2. A 15:2 ratio applies to two-rescuer pediatric CPR, not adult CPR.",
  },
  {
    id: "emr-cardiology-5006",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "How should minimizing interruptions in chest compressions be prioritized during adult CPR?",
    choices: [
      "Interruptions should be kept as short as possible and limited to under 10 seconds when feasible",
      "Interruptions of up to 2 minutes are acceptable at any time",
      "Compressions should be paused for a full patient reassessment every 30 seconds",
      "It does not matter how long compressions are paused as long as an AED is being used",
    ],
    answerIndex: 0,
    explanation:
      "Pauses in compressions (for rhythm checks, ventilations, or other tasks) should be minimized and kept under 10 seconds whenever possible, because coronary and cerebral perfusion pressure drop quickly once compressions stop and take time to rebuild.",
  },
  {
    id: "emr-cardiology-5007",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A bystander untrained in rescue breathing witnesses an adult suddenly collapse and become unresponsive with no normal breathing. What should the EMR advise this bystander to do while waiting for EMS?",
    choices: [
      "Do nothing until trained help arrives",
      "Perform continuous chest compressions without pauses for breaths (compression-only CPR)",
      "Only check the pulse every few minutes",
      "Attempt rescue breaths only, without compressions",
    ],
    answerIndex: 1,
    explanation:
      "For an untrained bystander witnessing a sudden adult collapse, compression-only (hands-only) CPR is recommended. It is simpler to perform correctly and has been shown to improve survival compared to no CPR at all, without the added complexity of rescue breathing.",
  },
  {
    id: "emr-cardiology-5008",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "During two-rescuer adult CPR with an unprotected airway, how often should rescuers switch roles?",
    choices: [
      "Every 30 seconds",
      "About every 2 minutes, or sooner if the compressor is fatigued",
      "Only after the AED delivers a shock",
      "They should never switch to avoid interrupting compressions",
    ],
    answerIndex: 1,
    explanation:
      "Switching compressors approximately every 2 minutes (roughly 5 cycles of 30:2) helps maintain high-quality compressions, since fatigue reduces compression depth even before the rescuer feels tired. The switch should be done quickly to minimize interruption.",
  },
  {
    id: "emr-cardiology-5009",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are alone with an unresponsive adult who is not breathing normally. You have already called for help and retrieved an AED. What should you do first upon returning to the patient?",
    choices: [
      "Begin chest compressions immediately while the AED is being turned on and attached",
      "Wait to start compressions until the AED pads are fully attached",
      "Check the patient's blood pressure before doing anything else",
      "Perform a full head-to-toe physical exam",
    ],
    answerIndex: 0,
    explanation:
      "Chest compressions should begin (or resume) immediately, and can continue while another rescuer or the same rescuer applies AED pads, since every second without compressions decreases the chance of survival. A blood pressure or full exam has no role in the initial management of cardiac arrest.",
  },
  // ---------------------------------------------------------------------
  // CPR: child (1 year to puberty)
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5010",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For a child (age 1 year to puberty) in cardiac arrest, what is the recommended chest compression depth?",
    choices: [
      "About 1/4 the depth of the chest",
      "About 1/3 the depth of the chest",
      "At least 3 inches regardless of the child's size",
      "The same as an adult, exactly 2 inches",
    ],
    answerIndex: 1,
    explanation:
      "For infants and children, compression depth is generally about one-third the anterior-posterior depth of the chest, which corresponds to roughly 2 inches for most children but scales to body size, rather than a fixed adult number.",
  },
  {
    id: "emr-cardiology-5011",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For two-rescuer CPR on a child, what is the correct compression-to-ventilation ratio?",
    choices: ["30:2", "15:2", "5:1", "3:1"],
    answerIndex: 1,
    explanation:
      "Two-rescuer child (and infant) CPR uses a 15:2 compression-to-ventilation ratio. A 30:2 ratio is used for single-rescuer pediatric CPR or for adult CPR with one or two rescuers.",
  },
  {
    id: "emr-cardiology-5012",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For a single rescuer performing CPR on a child, what is the correct compression-to-ventilation ratio?",
    choices: ["30:2", "15:2", "5:1", "1:1"],
    answerIndex: 0,
    explanation:
      "A single rescuer performing CPR on a child (or infant) uses a 30:2 ratio, the same as for adults. The 15:2 ratio is reserved for two-rescuer pediatric CPR.",
  },
  {
    id: "emr-cardiology-5013",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What compression rate should be used for a child in cardiac arrest?",
    choices: [
      "60 to 80 per minute",
      "100 to 120 per minute",
      "150 to 180 per minute",
      "Rate does not matter for children",
    ],
    answerIndex: 1,
    explanation:
      "The recommended compression rate of 100 to 120 per minute applies to adults, children, and infants alike. Only the depth and hand technique differ by age group, not the rate.",
  },
  {
    id: "emr-cardiology-5014",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "How many hands should be used to perform chest compressions on a child, depending on the child's size?",
    choices: [
      "Always two hands, regardless of size",
      "Always one hand, regardless of size",
      "One or two hands, whichever allows achieving adequate depth for that child's size",
      "Two fingers only, as with an infant",
    ],
    answerIndex: 2,
    explanation:
      "For a child, the rescuer may use one or two hands depending on the size of the child, using whichever technique achieves the recommended compression depth (about one-third the chest depth) most effectively.",
  },
  {
    id: "emr-cardiology-5015",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A 6-year-old child suddenly collapses in front of you and is unresponsive with no normal breathing. No AED is immediately available. What is the correct sequence of your first actions?",
    choices: [
      "Call for help and an AED, then begin CPR while waiting",
      "Begin CPR for 2 minutes first, then activate emergency response if you are alone",
      "Wait for the child to start breathing on their own",
      "Immediately begin rescue breaths only, without compressions",
    ],
    answerIndex: 1,
    explanation:
      "For an unwitnessed collapse or when found down (as in this scenario, without a clear indication help is already available), a lone rescuer with a child should generally perform about 2 minutes of CPR before leaving to call for help and retrieve an AED, since the arrest is more likely due to a respiratory cause. If a phone is readily available, activating EMS while continuing care (e.g., via speakerphone) is also appropriate.",
  },
  {
    id: "emr-cardiology-5016",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why is respiratory failure a more common cause of cardiac arrest in children than in adults?",
    choices: [
      "Children's hearts are structurally identical to adult hearts and this is not true",
      "Pediatric cardiac arrest is more often caused by a primary respiratory problem leading to hypoxia, rather than a primary cardiac event",
      "Children never experience cardiac arrest",
      "Children's arrests are always caused by congenital heart defects",
    ],
    answerIndex: 1,
    explanation:
      "Unlike adults, where cardiac arrest is often due to a primary cardiac event such as a lethal arrhythmia, pediatric cardiac arrest is more commonly the end result of respiratory failure or shock leading to hypoxia and bradycardia, which is why effective ventilation is especially critical in pediatric resuscitation.",
  },
  // ---------------------------------------------------------------------
  // CPR: infant
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5017",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What technique should a single rescuer use to perform chest compressions on an infant (under 1 year)?",
    choices: [
      "Two hands, as with an adult",
      "Two fingers placed just below the nipple line on the sternum",
      "The heel of one hand over the xiphoid process",
      "A closed fist over the center of the chest",
    ],
    answerIndex: 1,
    explanation:
      "A single rescuer should use two fingers placed on the lower half of the sternum, just below the nipple line, to compress an infant's chest. The two-thumb-encircling-hands technique is preferred when two rescuers are present.",
  },
  {
    id: "emr-cardiology-5018",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For two-rescuer infant CPR, which compression technique is preferred over the two-finger technique?",
    choices: [
      "One-handed compressions using the heel of the hand",
      "Two thumb-encircling hands technique",
      "Standard adult two-hand technique",
      "Abdominal thrusts instead of chest compressions",
    ],
    answerIndex: 1,
    explanation:
      "When two rescuers are available, the two thumb-encircling hands technique is preferred for infant CPR because it produces more consistent compression depth and better coronary perfusion pressure than the two-finger technique.",
  },
  {
    id: "emr-cardiology-5019",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the recommended compression depth for infant CPR?",
    choices: [
      "About 1/3 the depth of the infant's chest, roughly 1.5 inches (4 cm)",
      "At least 2 inches, the same as an adult",
      "Just enough to feel a pulse return",
      "As shallow as possible to avoid injury",
    ],
    answerIndex: 0,
    explanation:
      "Infant compressions should be about one-third the anterior-posterior depth of the chest, which is approximately 1.5 inches (4 cm) for most infants. This is shallower than the adult target of at least 2 inches.",
  },
  {
    id: "emr-cardiology-5020",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Where should you check for a pulse in an unresponsive infant before beginning CPR?",
    choices: [
      "The radial artery at the wrist",
      "The brachial artery on the inside of the upper arm",
      "The carotid artery in the neck",
      "The femoral artery in the groin, exclusively",
    ],
    answerIndex: 1,
    explanation:
      "In an infant, the brachial artery (on the inside of the upper arm) is the preferred site for a pulse check, since the infant's short, chubby neck makes carotid palpation unreliable.",
  },
  {
    id: "emr-cardiology-5021",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For infant CPR performed by a single rescuer, what is the compression-to-ventilation ratio?",
    choices: ["30:2", "15:2", "3:1", "5:1"],
    answerIndex: 0,
    explanation:
      "A single rescuer performing CPR on an infant uses a 30:2 ratio, the same as for a single rescuer performing child or adult CPR. Only two-rescuer pediatric CPR uses 15:2.",
  },
  {
    id: "emr-cardiology-5022",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You find an unresponsive infant with no normal breathing and no pulse after 10 seconds of checking. Two rescuers are present. What compression technique and ratio should be used?",
    choices: [
      "Two-finger technique with a 30:2 ratio",
      "Two thumb-encircling hands technique with a 15:2 ratio",
      "One-handed compressions with a 30:2 ratio",
      "Abdominal thrusts with rescue breaths only",
    ],
    answerIndex: 1,
    explanation:
      "With two rescuers present for infant CPR, the two thumb-encircling hands technique and a 15:2 compression-to-ventilation ratio are used. This differs from the single-rescuer approach, which uses the two-finger technique and a 30:2 ratio.",
  },
  // ---------------------------------------------------------------------
  // AED use: general, pad placement, analysis, safety, special situations
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5023",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the correct standard placement for AED pads on an adult?",
    choices: [
      "Both pads on the left side of the chest",
      "One pad on the upper right chest below the collarbone, and one pad on the lower left side of the chest",
      "Both pads directly over the sternum",
      "One pad on the forehead and one pad on the chest",
    ],
    answerIndex: 1,
    explanation:
      "The standard (anterolateral) AED pad placement is one pad on the upper right chest, below the clavicle, and the other pad on the lower left side of the chest, lateral to the left breast. This places the pads so the electrical current passes through the heart.",
  },
  {
    id: "emr-cardiology-5024",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why must all rescuers avoid touching the patient while an AED is analyzing the heart rhythm?",
    choices: [
      "Touching the patient could shock the rescuer",
      "Motion or muscle artifact can interfere with the AED's ability to accurately interpret the rhythm",
      "It is not actually necessary, but is a traditional precaution",
      "The AED will not turn on if someone is touching the patient",
    ],
    answerIndex: 1,
    explanation:
      "Movement or contact during rhythm analysis can create artifact that prevents the AED from correctly identifying a shockable rhythm, potentially delaying or preventing an indicated shock. Rescuers should say 'clear' and ensure no one is touching the patient during analysis.",
  },
  {
    id: "emr-cardiology-5025",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are attaching AED pads to a patient's chest and notice it is wet from rain. What should you do before applying the pads?",
    choices: [
      "Apply the pads directly over the wet skin without delay",
      "Quickly dry the patient's chest before applying the pads",
      "Do not use the AED at all if the chest is wet",
      "Pour additional water on the chest to improve conductivity",
    ],
    answerIndex: 1,
    explanation:
      "Excess water on the chest can cause the electrical current to travel across the skin surface rather than through the heart, reducing shock effectiveness and creating a safety hazard. The chest should be quickly wiped dry before pad placement.",
  },
  {
    id: "emr-cardiology-5026",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are preparing to apply AED pads and notice the patient has a visible medication patch on the area where a pad needs to be placed. What should you do?",
    choices: [
      "Place the pad directly on top of the medication patch",
      "Remove the patch, wipe the area if needed, and then apply the pad",
      "Do not use the AED because a medication patch is present",
      "Move the pad only slightly to the edge of the patch without full removal",
    ],
    answerIndex: 1,
    explanation:
      "A transdermal medication patch can block delivery of the shock and can also cause burns. It should be removed (with gloves on, to avoid transferring the medication to the rescuer) and the area wiped before placing the AED pad.",
  },
  {
    id: "emr-cardiology-5027",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You notice a patient in cardiac arrest has an implanted pacemaker with a visible bulge under the skin near the typical AED pad placement site. What should you do?",
    choices: [
      "Avoid using an AED entirely because a pacemaker is present",
      "Place the pad directly over the implanted device",
      "Place the pad at least 1 inch away from the implanted device if possible, and proceed with the AED",
      "Remove the implanted device before applying the pad",
    ],
    answerIndex: 2,
    explanation:
      "An implanted pacemaker or defibrillator is not a contraindication to AED use. The pad should be placed at least 1 inch away from the device if possible to avoid interference and reduced shock effectiveness, but the AED should still be used without delay.",
  },
  {
    id: "emr-cardiology-5028",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient in cardiac arrest has a very hairy chest that is preventing the AED pads from adhering well. What is the correct action?",
    choices: [
      "Apply the pads over the hair regardless of poor adhesion",
      "Quickly shave the area or use a second set of pads to remove hair, then reapply",
      "Skip AED use entirely and continue CPR only",
      "Wet the chest hair down with water to improve pad contact",
    ],
    answerIndex: 1,
    explanation:
      "Excess chest hair can prevent proper pad adhesion and skin contact, reducing shock delivery and risking arcing. A razor (often included in AED kits) should be used to quickly shave the pad placement sites, or a spare set of pads can be used to pull hair away, before reapplying fresh pads.",
  },
  {
    id: "emr-cardiology-5029",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What should be done for a pediatric patient (under 8 years or under about 55 lbs) when only adult AED pads are available?",
    choices: [
      "Do not use the AED at all",
      "Use the adult pads, ensuring they do not touch each other, using an anterior-posterior placement if needed",
      "Cut the adult pads in half to make them smaller",
      "Wait for pediatric pads to arrive before doing anything",
    ],
    answerIndex: 1,
    explanation:
      "If pediatric (child) AED pads or a pediatric attenuator system are not available, adult pads should be used rather than withholding defibrillation. Anterior-posterior placement (one pad on the chest, one on the back) can help ensure the pads do not touch each other on a small child.",
  },
  {
    id: "emr-cardiology-5030",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For an infant in cardiac arrest, what is the preferred order of AED options if available?",
    choices: [
      "Adult pads only, never pediatric equipment",
      "A manual defibrillator with pediatric settings first, then an AED with a pediatric dose attenuator, then an AED with adult pads as a last resort",
      "Always withhold defibrillation on infants regardless of equipment",
      "Pediatric pads placed only on the abdomen",
    ],
    answerIndex: 1,
    explanation:
      "For infants, the preferred equipment order is a manual defibrillator (if available and the operator is trained), followed by an AED with a pediatric dose-attenuating system, followed by a standard AED with adult pads if nothing else is available. Defibrillation should not be withheld due to lack of pediatric-specific equipment.",
  },
  {
    id: "emr-cardiology-5031",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "After an AED delivers a shock, what should the rescuer do immediately?",
    choices: [
      "Check for a pulse for a full 2 minutes before resuming any action",
      "Immediately resume chest compressions, starting with compressions rather than checking for a pulse first",
      "Wait for the patient to wake up before doing anything further",
      "Turn off the AED and remove the pads",
    ],
    answerIndex: 1,
    explanation:
      "After a shock is delivered, CPR should resume immediately, beginning with chest compressions, rather than pausing to check for a pulse or rhythm change. The AED will prompt another analysis after about 2 minutes of CPR.",
  },
  {
    id: "emr-cardiology-5032",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "The AED analyzes the rhythm and states 'no shock advised.' What should the rescuer do next?",
    choices: [
      "Stop all resuscitation efforts immediately",
      "Immediately resume high-quality CPR, starting with chest compressions",
      "Manually deliver a shock anyway",
      "Wait several minutes before doing anything further",
    ],
    answerIndex: 1,
    explanation:
      "A 'no shock advised' message means the AED did not detect a shockable rhythm, but this does not mean the patient does not need continued care. CPR should resume immediately, since the patient remains in cardiac arrest (for example, in asystole or PEA) unless other signs of life return.",
  },
  {
    id: "emr-cardiology-5033",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why should AED pads not be placed on a patient who is actively seizing?",
    choices: [
      "An AED should never be applied during any patient movement, so wait until the seizure stops before assessing or applying the AED",
      "Seizures make an AED unsafe to use under any circumstance permanently",
      "AED pads cannot physically stick to a moving patient",
      "Seizure activity always indicates the patient has a pulse, so an AED is never needed",
    ],
    answerIndex: 0,
    explanation:
      "Active seizure movement (like any patient movement) can interfere with the AED's ability to analyze the rhythm accurately and safely. If a patient in suspected cardiac arrest is seizing (this can occur from hypoxia), it is reasonable to briefly wait for the seizure activity to pass before applying and analyzing with the AED, unless the movement is clearly purposeful and indicates a pulse is present.",
  },
  {
    id: "emr-cardiology-5034",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is a required safety step before an AED delivers a shock?",
    choices: [
      "Ensuring the patient is on a metal surface",
      "Ensuring no one, including the rescuer, is touching the patient and stating 'clear' loudly",
      "Removing all of the patient's clothing above the waist only if a woman",
      "Placing a wet towel under the patient",
    ],
    answerIndex: 1,
    explanation:
      "Before delivering a shock, the rescuer must visually confirm and verbally announce that no one is touching the patient to prevent inadvertent shock to a bystander or rescuer. Standing on a metal surface or use of a wet towel are safety hazards, not requirements.",
  },
  {
    id: "emr-cardiology-5035",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient in cardiac arrest is lying on a metal surface, such as a metal deck or bleacher. Is it safe to use an AED?",
    choices: [
      "No, the AED can never be used if the patient is on any metal surface",
      "Yes, it is safe to use the AED as long as the patient is not touching another person or puddled water, and rescuers are not touching the patient during the shock",
      "Only if the metal surface is first covered completely in a rubber mat",
      "Only if the patient is moved to a wooden surface first, delaying the shock",
    ],
    answerIndex: 1,
    explanation:
      "A dry metal surface alone is not a contraindication to AED use. The key safety concern is ensuring no one is in contact with the patient during the shock and that the patient is not lying in a puddle of water or other conductive liquid that could carry current to bystanders.",
  },
  {
    id: "emr-cardiology-5036",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "An AED is defined as which type of device?",
    choices: [
      "A device that only measures heart rate without treatment capability",
      "A device that analyzes cardiac rhythm and delivers an electrical shock to certain lethal rhythms if indicated",
      "A device used only to measure blood pressure",
      "A device that manually paces the heart continuously",
    ],
    answerIndex: 1,
    explanation:
      "An automated external defibrillator (AED) analyzes the patient's cardiac rhythm and, if it detects a shockable rhythm (such as ventricular fibrillation or pulseless ventricular tachycardia), prompts the rescuer to deliver an electrical shock intended to allow the heart's normal pacemaker to resume an organized rhythm.",
  },
  {
    id: "emr-cardiology-5037",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which rhythm is the AED specifically designed to detect and treat with a shock?",
    choices: [
      "Normal sinus rhythm",
      "Ventricular fibrillation",
      "First-degree AV block",
      "Sinus bradycardia with a strong pulse",
    ],
    answerIndex: 1,
    explanation:
      "Ventricular fibrillation (and pulseless ventricular tachycardia) are the shockable rhythms an AED is designed to detect and treat. A normal sinus rhythm, first-degree block, or a rhythm generating a strong pulse would not be shocked.",
  },
  // ---------------------------------------------------------------------
  // Chain of survival / early recognition / activation
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5038",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the first link in the adult out-of-hospital chain of survival?",
    choices: [
      "Early defibrillation",
      "Early recognition of cardiac arrest and activation of the emergency response system",
      "Advanced life support care",
      "Post-cardiac-arrest care in the hospital",
    ],
    answerIndex: 1,
    explanation:
      "The first link in the chain of survival is immediate recognition of cardiac arrest and prompt activation of the emergency response system, since every subsequent link (CPR, defibrillation, advanced care) depends on the emergency response being started as early as possible.",
  },
  {
    id: "emr-cardiology-5039",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which factor most significantly improves survival from sudden cardiac arrest caused by ventricular fibrillation?",
    choices: [
      "Waiting for advanced life support providers to arrive before doing anything",
      "Early CPR combined with early defibrillation",
      "Administering oxygen alone, without CPR or defibrillation",
      "Placing the patient in the recovery position",
    ],
    answerIndex: 1,
    explanation:
      "For cardiac arrest caused by ventricular fibrillation, early bystander CPR combined with early defibrillation dramatically improves the chance of survival. Chances of successful defibrillation decrease significantly for every minute that passes without CPR and defibrillation.",
  },
  {
    id: "emr-cardiology-5040",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "For every minute that passes without CPR or defibrillation after a witnessed cardiac arrest caused by ventricular fibrillation, what generally happens to the chance of survival?",
    choices: [
      "It stays the same regardless of time",
      "It decreases significantly, often cited as roughly 7 to 10 percent per minute without intervention",
      "It increases as the body compensates",
      "It only decreases after 30 minutes have passed",
    ],
    answerIndex: 1,
    explanation:
      "Survival from ventricular fibrillation cardiac arrest decreases substantially with each minute of delay before CPR and defibrillation, commonly cited as approximately a 7 to 10 percent decrease per minute without bystander intervention, which is why early recognition and action are emphasized.",
  },
  {
    id: "emr-cardiology-5041",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What term describes the abnormal, gasping breathing pattern that may be present immediately after cardiac arrest and should not be mistaken for normal breathing?",
    choices: ["Tachypnea", "Agonal breathing", "Kussmaul breathing", "Cheyne-Stokes breathing"],
    answerIndex: 1,
    explanation:
      "Agonal breathing is an abnormal, gasping, irregular breathing pattern that can occur in the first minutes after cardiac arrest. It is not effective breathing and should prompt the rescuer to begin CPR, not be mistaken for a sign that the patient is breathing adequately.",
  },
  {
    id: "emr-cardiology-5042",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You find an unresponsive adult who is making occasional, irregular gasping sounds roughly every 20 seconds. There is no other movement. What should you do?",
    choices: [
      "Assume the patient is breathing adequately and monitor only",
      "Recognize this as agonal breathing, check for a pulse, and begin CPR if no pulse is present",
      "Place the patient in the recovery position and wait",
      "Give the patient water to help them recover",
    ],
    answerIndex: 1,
    explanation:
      "Occasional gasping in an unresponsive patient is agonal breathing, a sign of cardiac arrest, not effective breathing. The rescuer should quickly check for a pulse and begin CPR if no pulse is found, rather than assuming the gasps represent adequate breathing.",
  },
  {
    id: "emr-cardiology-5043",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For an adult found unresponsive and not breathing normally, how long should a rescuer take to check for a pulse before starting CPR?",
    choices: [
      "No more than 10 seconds",
      "At least 1 full minute",
      "30 to 45 seconds",
      "Pulse checks should never be performed by an EMR",
    ],
    answerIndex: 0,
    explanation:
      "A pulse check should take no longer than 10 seconds. If a pulse is not definitely felt within that time, the rescuer should begin chest compressions without further delay, since prolonged pulse checks delay lifesaving CPR.",
  },
  // ---------------------------------------------------------------------
  // Chest pain / cardiac emergency recognition (EMR scope)
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5044",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A 55-year-old man reports crushing chest pressure that radiates to his left arm, along with sweating and nausea. What is the EMR's highest priority action?",
    choices: [
      "Have the patient walk to a more comfortable location before doing anything else",
      "Have the patient rest, activate the EMS system, and monitor for any change in condition",
      "Give the patient a large glass of water and reassess in 30 minutes",
      "Assume this is indigestion and no further action is needed",
    ],
    answerIndex: 1,
    explanation:
      "Chest pressure radiating to the arm with associated sweating and nausea is a classic presentation of a possible heart attack. The EMR should keep the patient at rest, ensure EMS has been activated, and closely monitor for signs of deterioration such as loss of responsiveness.",
  },
  {
    id: "emr-cardiology-5045",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is a classic symptom associated with a heart attack (acute myocardial infarction)?",
    choices: [
      "Pain that is sharp, worsens with deep breathing, and improves when leaning forward",
      "A sensation of pressure, tightness, or squeezing in the chest",
      "Pain only in one knee with no other symptoms",
      "A rash that appears suddenly on the chest",
    ],
    answerIndex: 1,
    explanation:
      "A sensation of pressure, tightness, squeezing, or heaviness in the chest is a classic cardiac symptom. Sharp, positional, pleuritic pain is more typical of a non-cardiac cause such as pericarditis or a musculoskeletal issue.",
  },
  {
    id: "emr-cardiology-5046",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "An elderly diabetic woman calls for help because she 'just doesn't feel right,' reporting only fatigue and mild nausea, with no chest pain. What should the EMR keep in mind?",
    choices: [
      "Cardiac problems are unlikely since there is no chest pain",
      "Older adults, women, and people with diabetes often present with atypical symptoms of a cardiac event, so this complaint should still be taken seriously",
      "This presentation can only be caused by a stomach virus",
      "No assessment is necessary since she is able to speak in full sentences",
    ],
    answerIndex: 1,
    explanation:
      "Cardiac emergencies, including heart attacks, can present atypically in women, older adults, and people with diabetes, sometimes with only fatigue, weakness, or nausea and no chest pain at all. These vague complaints should still prompt a full assessment and consideration of a cardiac cause.",
  },
  {
    id: "emr-cardiology-5047",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient with known cardiac history suddenly becomes unresponsive, stops breathing normally, and you cannot find a pulse. What is your immediate priority?",
    choices: [
      "Obtain a detailed medical history from family before acting",
      "Begin CPR immediately and ensure the AED is retrieved as soon as possible",
      "Wait to see if the patient regains consciousness on their own",
      "Only monitor breathing without starting compressions",
    ],
    answerIndex: 1,
    explanation:
      "Once a patient is unresponsive, not breathing normally, and pulseless, the priority is immediate initiation of high-quality CPR and rapid application of an AED. History-taking can happen from bystanders while another rescuer manages the arrest, but must never delay starting CPR.",
  },
  {
    id: "emr-cardiology-5048",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient describes chest discomfort that started 20 minutes ago while at rest and has not gone away. The patient has a history of a prior heart attack and takes nitroglycerin as prescribed. According to many EMS protocols, what may an EMR be able to assist with regarding this patient's own prescribed nitroglycerin?",
    choices: [
      "The EMR should never assist with any prescribed medication under any circumstance",
      "Depending on local protocol and medical direction, the EMR may assist the patient in taking their own prescribed nitroglycerin if criteria such as adequate blood pressure are met",
      "The EMR should take the nitroglycerin from the patient and administer it to themselves as a demonstration",
      "The EMR must administer a full bottle of nitroglycerin regardless of the patient's blood pressure",
    ],
    answerIndex: 1,
    explanation:
      "Under many EMS systems and with appropriate protocols or medical direction, an EMR may assist a patient with chest pain in taking their own prescribed nitroglycerin, generally only if the patient meets criteria such as an adequate blood pressure and has not already taken the maximum prescribed dose. This is assisting the patient with their own medication, not administering medication the EMR carries.",
  },
  {
    id: "emr-cardiology-5049",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient with chest pain has a systolic blood pressure of 88 mmHg. He has his own prescribed nitroglycerin and asks for help taking it. What should the EMR do?",
    choices: [
      "Assist him with the nitroglycerin as requested regardless of blood pressure",
      "Withhold nitroglycerin due to the low blood pressure and continue to monitor and support the patient while arranging transport",
      "Give him twice the prescribed dose to raise his blood pressure",
      "Ignore the blood pressure reading since he is asking for the medication",
    ],
    answerIndex: 1,
    explanation:
      "Nitroglycerin is a vasodilator and can further lower blood pressure, which is dangerous in a patient who is already hypotensive. Most protocols require a minimum systolic blood pressure (commonly around 100 to 110 mmHg) before assisting with nitroglycerin. With a pressure of 88 mmHg, the EMR should withhold it and closely monitor the patient.",
  },
  {
    id: "emr-cardiology-5050",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why might an EMR assist a patient with chest pain in taking their own prescribed aspirin, according to many local protocols?",
    choices: [
      "Aspirin cures the underlying cause of a heart attack",
      "Aspirin has antiplatelet properties that may help reduce clot formation during a suspected heart attack",
      "Aspirin is given to raise the patient's blood pressure",
      "Aspirin eliminates the need for further hospital care",
    ],
    answerIndex: 1,
    explanation:
      "Aspirin has an antiplatelet effect that can help limit the growth of a clot that may be blocking a coronary artery during a heart attack. It does not cure the underlying blockage and does not replace the need for further evaluation and treatment, but assisting with it (per protocol) is a recognized EMR-level action for suspected cardiac chest pain.",
  },
  {
    id: "emr-cardiology-5051",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient reports chest pain and states they are allergic to aspirin. What should the EMR do regarding assisting with aspirin?",
    choices: [
      "Give the aspirin anyway since it is beneficial for the heart",
      "Withhold aspirin due to the reported allergy and continue other appropriate care",
      "Give a double dose of a different medication instead",
      "Ignore the allergy statement since it may not be accurate",
    ],
    answerIndex: 1,
    explanation:
      "A reported allergy to aspirin is a contraindication to assisting with it. The EMR should withhold aspirin in this situation and continue with other appropriate assessment and care, such as positioning, oxygen if indicated, and prompt transport.",
  },
  // ---------------------------------------------------------------------
  // Shock recognition
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5052",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is an early sign of shock (hypoperfusion) that an EMR should recognize?",
    choices: [
      "Slow, bounding pulse and warm, dry skin",
      "Rapid, weak pulse and pale, cool, clammy skin",
      "Normal blood pressure with flushed, dry skin",
      "Slow respiratory rate with deep, regular breaths",
    ],
    answerIndex: 1,
    explanation:
      "Early signs of shock include a rapid, weak (thready) pulse and pale, cool, clammy skin, reflecting the body's attempt to shunt blood away from the skin to vital organs. Warm, dry, or flushed skin is not consistent with early shock.",
  },
  {
    id: "emr-cardiology-5053",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A trauma patient has a rapid, weak pulse; pale, cool, moist skin; and appears anxious and restless. What should the EMR suspect?",
    choices: [
      "The patient is likely experiencing shock and needs prompt supportive care and transport",
      "These are normal findings and no action is needed",
      "The patient is simply cold from the environment and requires no other assessment",
      "The patient's vital signs are within normal limits for their age",
    ],
    answerIndex: 0,
    explanation:
      "Rapid weak pulse, pale cool moist skin, and anxiety or restlessness are classic signs of shock (hypoperfusion). The EMR should recognize this constellation, keep the patient calm and lying down if not contraindicated, maintain body temperature, and ensure prompt transport.",
  },
  {
    id: "emr-cardiology-5054",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why does a patient in shock often become anxious or restless before other, more obvious signs appear?",
    choices: [
      "Anxiety causes shock, rather than the other way around",
      "Reduced blood flow to the brain can produce early changes in mental status such as anxiety or restlessness",
      "Restlessness is unrelated to perfusion status",
      "This only happens in pediatric patients, never adults",
    ],
    answerIndex: 1,
    explanation:
      "As perfusion to the brain decreases, altered mental status can develop, often first appearing as anxiety, restlessness, or irritability before progressing to confusion or unresponsiveness as shock worsens. This makes changes in mental status an important early clue to shock.",
  },
  {
    id: "emr-cardiology-5055",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the general positioning recommendation for a patient in shock without suspected spinal injury?",
    choices: [
      "Sitting fully upright at all times",
      "Lying flat, with legs elevated per local protocol if there are no contraindications such as suspected leg fractures or severe respiratory distress",
      "Standing to promote circulation",
      "Lying on the stomach (prone position)",
    ],
    answerIndex: 1,
    explanation:
      "In the absence of contraindications (such as suspected spinal injury, leg fractures, or severe respiratory distress), a patient in shock may benefit from lying flat with the legs elevated slightly, per local protocol, to help promote venous return. Positioning must always be adjusted to the specific patient's injuries and condition.",
  },
  {
    id: "emr-cardiology-5056",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient with signs of shock is shivering and the ambient temperature is cold. What EMR-level action helps address this?",
    choices: [
      "Cooling the patient further to reduce metabolic demand",
      "Keeping the patient warm with blankets to help prevent worsening of shock from hypothermia",
      "Removing all of the patient's clothing to assess for injuries and leaving them uncovered",
      "Ignoring temperature since it does not affect shock",
    ],
    answerIndex: 1,
    explanation:
      "Maintaining normal body temperature is an important part of managing a patient in shock, since hypothermia can worsen coagulopathy and overall outcomes. Keeping the patient warm with blankets while still allowing necessary assessment is appropriate EMR-level care.",
  },
  {
    id: "emr-cardiology-5057",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which pulse quality description is most consistent with a patient in significant shock?",
    choices: [
      "Strong and bounding",
      "Weak and thready",
      "Slow and regular with strong force",
      "Absent only at the carotid artery, present everywhere else",
    ],
    answerIndex: 1,
    explanation:
      "A weak, thready pulse reflects reduced stroke volume and vasoconstriction typical of shock. A strong, bounding pulse is not typically associated with hypoperfusion.",
  },
  {
    id: "emr-cardiology-5058",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are assessing a patient after a motor vehicle collision. Their radial pulse is no longer palpable, but a carotid pulse is present and rapid. What does the absence of a radial pulse generally suggest about the patient's blood pressure?",
    choices: [
      "The patient's blood pressure is likely dangerously low, since the radial pulse tends to become impalpable at a lower systolic blood pressure than the carotid pulse",
      "The patient's blood pressure must be completely normal",
      "This finding has no clinical significance",
      "The radial pulse is simply harder to feel and this indicates nothing about perfusion",
    ],
    answerIndex: 0,
    explanation:
      "As blood pressure drops, more peripheral pulses (such as the radial pulse) tend to become impalpable before more central pulses (such as the carotid). A palpable carotid pulse without a palpable radial pulse suggests significant hypotension, and this patient should be treated as being in shock.",
  },
  // ---------------------------------------------------------------------
  // Basic vital signs: pulse, BP palpation/auscultation
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5059",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is a normal resting pulse rate range for a healthy adult?",
    choices: [
      "20 to 40 beats per minute",
      "60 to 100 beats per minute",
      "150 to 180 beats per minute",
      "10 to 20 beats per minute",
    ],
    answerIndex: 1,
    explanation:
      "A normal adult resting pulse rate generally falls between 60 and 100 beats per minute. Rates outside this range may indicate bradycardia (too slow) or tachycardia (too fast) and should prompt further assessment.",
  },
  {
    id: "emr-cardiology-5060",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "When assessing a patient's pulse, which three characteristics should the EMR evaluate?",
    choices: [
      "Rate, rhythm, and quality (strength)",
      "Color, size, and temperature of the extremity only",
      "Only the rate, since rhythm and quality are not important",
      "Blood type and oxygen saturation",
    ],
    answerIndex: 0,
    explanation:
      "A complete pulse assessment includes the rate (beats per minute), rhythm (regular or irregular), and quality or strength (strong/bounding, weak/thready). Each of these provides different clinical information.",
  },
  {
    id: "emr-cardiology-5061",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which artery is most commonly used to check a conscious adult patient's pulse during a routine assessment?",
    choices: [
      "The radial artery at the wrist",
      "The femoral artery in the groin, exclusively",
      "The temporal artery on the forehead, exclusively",
      "The popliteal artery behind the knee, exclusively",
    ],
    answerIndex: 0,
    explanation:
      "The radial artery at the wrist is the most commonly used site to assess pulse in a conscious adult patient, since it is easily accessible. Other sites, such as the carotid, are used in specific situations such as checking for a pulse during a cardiac arrest assessment.",
  },
  {
    id: "emr-cardiology-5062",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "How should a systolic blood pressure be estimated using only palpation, without a stethoscope?",
    choices: [
      "Inflate the cuff, then slowly deflate while palpating a distal pulse; the pressure at which the pulse first returns is recorded as the palpated systolic pressure",
      "Listen with a stethoscope over the brachial artery while inflating the cuff",
      "Measure the diastolic pressure and add 40",
      "Estimate blood pressure based only on skin color",
    ],
    answerIndex: 0,
    explanation:
      "A palpated blood pressure is obtained by inflating the cuff, then slowly deflating it while feeling for the return of a distal pulse (commonly radial). The pressure at which the pulse is first felt again is recorded as the systolic blood pressure by palpation; a diastolic reading cannot be obtained this way.",
  },
  {
    id: "emr-cardiology-5063",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "When obtaining a blood pressure by auscultation, over which artery is the stethoscope typically placed?",
    choices: ["Radial artery", "Brachial artery", "Femoral artery", "Carotid artery"],
    answerIndex: 1,
    explanation:
      "The stethoscope is placed over the brachial artery, at the antecubital fossa (inside of the elbow), when auscultating a blood pressure using a standard arm cuff.",
  },
  {
    id: "emr-cardiology-5064",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "In an auscultated blood pressure, what does the first sound heard as the cuff is slowly deflated represent?",
    choices: [
      "The diastolic pressure",
      "The systolic pressure",
      "The pulse rate",
      "The mean arterial pressure",
    ],
    answerIndex: 1,
    explanation:
      "The first sound heard while slowly deflating the cuff corresponds to the systolic blood pressure, the pressure at which blood begins to flow through the artery again. The point at which the sounds disappear corresponds to the diastolic pressure.",
  },
  {
    id: "emr-cardiology-5065",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "A blood pressure cuff that is too small for a patient's arm will most likely produce what kind of error?",
    choices: [
      "A falsely low blood pressure reading",
      "A falsely high blood pressure reading",
      "No effect on accuracy",
      "An inability to obtain a pulse rate",
    ],
    answerIndex: 1,
    explanation:
      "A cuff that is too small for the patient's arm circumference tends to produce a falsely elevated (high) blood pressure reading, since more pressure is required to compress the artery through the tissue. Using an appropriately sized cuff is important for accurate readings.",
  },
  {
    id: "emr-cardiology-5066",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is considered a normal approximate systolic blood pressure range for a healthy adult at rest?",
    choices: ["60 to 80 mmHg", "90 to 140 mmHg", "180 to 220 mmHg", "40 to 60 mmHg"],
    answerIndex: 1,
    explanation:
      "A normal adult resting systolic blood pressure is generally considered to be roughly in the range of 90 to 140 mmHg, though normal values can vary by individual and by guideline. Values well below or above this range warrant further evaluation.",
  },
  {
    id: "emr-cardiology-5067",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "An EMR is unable to auscultate a blood pressure in a very noisy environment, such as a busy roadway during a motor vehicle collision response. What alternative can be used to estimate blood pressure?",
    choices: [
      "Skip the blood pressure entirely with no alternative attempted",
      "Palpate a systolic blood pressure instead, since it does not require hearing sounds",
      "Guess a value based on the patient's appearance alone",
      "Use the pulse rate as a direct substitute for blood pressure",
    ],
    answerIndex: 1,
    explanation:
      "When auscultation is not practical, such as in a loud environment, a palpated systolic blood pressure can be obtained instead by feeling for the return of a distal pulse as the cuff deflates. This does not provide a diastolic value but still gives useful clinical information.",
  },
  {
    id: "emr-cardiology-5068",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What does an irregular pulse rhythm most likely indicate?",
    choices: [
      "The patient is perfectly healthy",
      "A possible underlying cardiac arrhythmia that warrants further evaluation",
      "The EMR is checking the pulse incorrectly and should never document irregularity",
      "The patient is definitely in cardiac arrest",
    ],
    answerIndex: 1,
    explanation:
      "An irregular pulse rhythm can indicate an underlying cardiac arrhythmia and should be noted and communicated as part of the patient assessment. It does not by itself mean the patient is in cardiac arrest, since an irregular but present pulse still indicates the heart is beating.",
  },
  // ---------------------------------------------------------------------
  // Special situations: hypothermia, drowning, pregnancy, traumatic arrest
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5069",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You find an unresponsive patient pulled from icy water with a very low body temperature. You cannot definitively feel a pulse after checking carefully. What should guide your decision to begin CPR?",
    choices: [
      "Assume the patient cannot be resuscitated and do not attempt CPR",
      "Begin CPR, since hypothermic patients may have very slow, hard-to-detect pulses and can sometimes be successfully resuscitated even after prolonged submersion in cold water",
      "Wait exactly 5 minutes before checking again, then leave the scene",
      "Only perform rescue breathing, never chest compressions, in hypothermic patients",
    ],
    answerIndex: 1,
    explanation:
      "Severe hypothermia can slow metabolic demand and heart rate dramatically, sometimes making a pulse very difficult to detect even when one is present, and cold water submersion can have a protective effect on the brain. Because of this, resuscitation efforts, including CPR, should generally be attempted in hypothermic cardiac arrest, following local protocol, rather than assumed futile.",
  },
  {
    id: "emr-cardiology-5070",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A pregnant patient in the third trimester goes into cardiac arrest. What positioning modification should be considered during resuscitation, if feasible?",
    choices: [
      "No modification is ever needed for a pregnant patient",
      "Manually displacing the uterus to the left, or slightly tilting the patient, to relieve pressure on the major blood vessels while continuing high-quality compressions",
      "Placing the patient face down for all compressions",
      "Performing compressions only on the lower abdomen instead of the chest",
    ],
    answerIndex: 1,
    explanation:
      "In late pregnancy, the enlarged uterus can compress the inferior vena cava when the patient is supine, reducing blood return to the heart and the effectiveness of compressions. Manual left uterine displacement (or a slight left tilt, depending on local protocol and equipment) can be used to relieve this compression while chest compressions continue on a firm surface.",
  },
  {
    id: "emr-cardiology-5071",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient in cardiac arrest following blunt trauma from a fall is found with severe, obvious external bleeding. What should the EMR prioritize alongside standard CPR, if trained and equipped to do so?",
    choices: [
      "Bleeding control has no role in traumatic cardiac arrest",
      "Controlling severe external hemorrhage, since uncorrected massive blood loss can be a reversible cause of traumatic cardiac arrest",
      "Ignoring the bleeding entirely until compressions are complete",
      "Applying a tourniquet only after transport has already begun",
    ],
    answerIndex: 1,
    explanation:
      "In traumatic cardiac arrest, severe uncontrolled hemorrhage can be a primary, reversible cause of the arrest. Controlling life-threatening external bleeding (such as with direct pressure or a tourniquet, per training and protocol) is an important priority alongside chest compressions and ventilation.",
  },
  {
    id: "emr-cardiology-5072",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A submersion (drowning) patient is pulled from the water, unresponsive and not breathing normally, but has a palpable pulse. What is the EMR's priority action?",
    choices: [
      "Begin chest compressions immediately even though a pulse is present",
      "Provide rescue breaths/ventilations, since the arrest in drowning is typically due to a respiratory cause and a pulse is present",
      "Wait for the patient to spontaneously resume breathing without intervention",
      "Perform abdominal thrusts to remove water from the lungs before any ventilation",
    ],
    answerIndex: 1,
    explanation:
      "Drowning generally causes cardiac arrest through a primary respiratory problem (hypoxia). If a pulse is present but breathing is absent or inadequate, the priority is providing rescue breaths/ventilations rather than chest compressions. Attempting to expel water from the lungs with abdominal thrusts is not recommended and can delay ventilation.",
  },
  {
    id: "emr-cardiology-5073",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why might CPR be modified to begin with a short period of rescue breaths before compressions in a drowning-associated cardiac arrest, according to many guidelines?",
    choices: [
      "Because drowning arrests are typically caused by hypoxia from a respiratory problem, so restoring oxygenation early is especially important",
      "Because compressions are never needed in a drowning victim",
      "Because water in the lungs makes compressions impossible",
      "Because drowning patients cannot develop cardiac arrest",
    ],
    answerIndex: 0,
    explanation:
      "Because drowning-related cardiac arrest is usually caused by hypoxia (a respiratory problem) rather than a primary cardiac event, some guidelines recommend an initial period of rescue breaths before beginning the standard compression cycle, to help correct the underlying oxygen deficit.",
  },
  // ---------------------------------------------------------------------
  // More CPR mechanics / recovery position / patient positioning
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5074",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the correct compression-to-ventilation ratio when an advanced airway (such as an endotracheal tube or supraglottic airway) is in place during two-rescuer CPR?",
    choices: [
      "Compressions and ventilations continue in a 30:2 cycle with pauses for breaths",
      "Compressions are delivered continuously at 100 to 120 per minute while ventilations are given asynchronously, roughly one breath every 6 seconds, without pausing compressions",
      "Compressions stop completely once an advanced airway is placed",
      "The ratio becomes 15:2 regardless of rescuer number",
    ],
    answerIndex: 1,
    explanation:
      "Once an advanced airway is in place, compressions and ventilations are no longer synchronized in cycles. Compressions continue continuously at the normal rate, while one breath is delivered approximately every 6 seconds (about 10 breaths per minute) without pausing compressions for the breath.",
  },
  {
    id: "emr-cardiology-5075",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Once return of spontaneous circulation (ROSC) occurs and the patient has adequate breathing, what position should generally be used if no spinal injury is suspected?",
    choices: [
      "Supine with legs elevated at all times",
      "The recovery position (lateral recumbent), to help protect the airway",
      "Sitting fully upright with no support",
      "Prone (face down) on a firm surface",
    ],
    answerIndex: 1,
    explanation:
      "If a patient regains a pulse and adequate spontaneous breathing after resuscitation and spinal injury is not suspected, placing them in the recovery (lateral recumbent) position helps protect the airway from aspiration while continuing close monitoring.",
  },
  {
    id: "emr-cardiology-5076",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What surface should be used for performing chest compressions whenever possible?",
    choices: [
      "A soft mattress, without any modification",
      "A firm, flat surface",
      "A surface tilted at a steep angle",
      "The surface does not matter for compression effectiveness",
    ],
    answerIndex: 1,
    explanation:
      "A firm, flat surface allows compressions to more effectively compress the heart between the sternum and the spine. A soft surface, like a mattress, absorbs much of the compression force and reduces effectiveness unless a backboard or similar firm support is used.",
  },
  {
    id: "emr-cardiology-5077",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are performing CPR on a patient found in bed on a soft mattress. What should you do to improve compression effectiveness, if feasible without significant delay?",
    choices: [
      "Continue exactly as is, since mattress firmness does not matter",
      "Move the patient to the floor or place a rigid board under the torso before continuing compressions",
      "Stop CPR entirely until a hospital bed is available",
      "Perform compressions more slowly to compensate for the soft surface",
    ],
    answerIndex: 1,
    explanation:
      "Moving the patient to the floor or placing a rigid backboard under the torso helps compressions effectively compress the heart, since a soft mattress absorbs much of the compression force. This should be done quickly, minimizing interruption to compressions.",
  },
  {
    id: "emr-cardiology-5078",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What does 'return of spontaneous circulation' (ROSC) mean?",
    choices: [
      "The patient has fully recovered neurologically",
      "A pulse and effective heartbeat have returned, restoring circulation, even if the patient is not yet fully conscious",
      "The AED has finished analyzing the rhythm",
      "CPR should be stopped forever once this occurs",
    ],
    answerIndex: 1,
    explanation:
      "ROSC means a pulse and organized cardiac activity have returned, restoring circulation, though the patient may still be unconscious, require ventilatory support, or need continued close monitoring, since re-arrest can occur.",
  },
  {
    id: "emr-cardiology-5079",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "During ongoing CPR, the patient begins to move, open their eyes, and resist care. What should the rescuer do?",
    choices: [
      "Continue chest compressions regardless of these signs",
      "Stop compressions, reassess breathing and pulse, and provide care based on the patient's current condition",
      "Immediately leave the patient unattended",
      "Shock the patient again with the AED without reassessment",
    ],
    answerIndex: 1,
    explanation:
      "Signs of movement, eye opening, or resistance during CPR suggest the patient may have regained circulation. The rescuer should stop compressions to reassess breathing and pulse, then provide care appropriate to the reassessed condition, rather than continuing compressions on a patient who no longer needs them.",
  },
  // ---------------------------------------------------------------------
  // AED maintenance / readiness / special populations
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5080",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What routine check helps ensure an AED is ready for use in an emergency?",
    choices: [
      "Checking the battery status and expiration dates of the pads on a regular schedule",
      "Only checking the AED the moment it is needed",
      "AEDs never require any maintenance",
      "Replacing the entire AED unit every week regardless of condition",
    ],
    answerIndex: 0,
    explanation:
      "Routine readiness checks, including verifying battery status and pad expiration dates, help ensure an AED will function correctly when needed. Many AEDs have indicator lights that show operational status, but manual periodic checks remain an important responsibility.",
  },
  {
    id: "emr-cardiology-5081",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You retrieve an AED and its indicator light shows a fault or low-battery warning. What should you do?",
    choices: [
      "Use the AED anyway without checking further, since something is always better than nothing",
      "Quickly check for a backup AED if immediately available, while continuing high-quality CPR without significant interruption",
      "Stop all resuscitation efforts because the AED is not working",
      "Ignore the warning light completely and proceed as normal",
    ],
    answerIndex: 1,
    explanation:
      "If an AED shows a fault or low-battery indicator, the rescuer should attempt to use it if still functional, but should also check for a backup device if one is readily available, all while ensuring high-quality CPR continues with minimal interruption. CPR should never be stopped solely because of an AED equipment issue.",
  },
  {
    id: "emr-cardiology-5082",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What action should be taken with AED pads that are visibly expired?",
    choices: [
      "Use them anyway since expiration does not matter",
      "Replace them with pads that are within their expiration date as part of routine AED maintenance",
      "Cut them in half to extend their usable life",
      "Store them separately but never replace them",
    ],
    answerIndex: 1,
    explanation:
      "Expired AED pads may not adhere properly or deliver the shock effectively due to degraded gel and adhesive. Routine maintenance includes checking and replacing pads before their expiration date to ensure the AED functions correctly when needed.",
  },
  // ---------------------------------------------------------------------
  // Advanced format items: multiple_response, build_list, drag_drop
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5083",
    domain: "Cardiology",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: false,
    question:
      "Which of the following are signs and symptoms commonly associated with shock (hypoperfusion)? (Select all that apply.)",
    choices: [
      "Rapid, weak pulse",
      "Pale, cool, clammy skin",
      "Slow, bounding pulse",
      "Anxiety or restlessness",
      "Warm, flushed, dry skin",
      "Delayed capillary refill",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "Shock typically presents with a rapid weak pulse, pale cool clammy skin, anxiety or restlessness from reduced cerebral perfusion, and delayed capillary refill. A slow bounding pulse and warm, flushed, dry skin are not typical findings of shock and instead suggest another process.",
  },
  {
    id: "emr-cardiology-5084",
    domain: "Cardiology",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: false,
    question:
      "Which of the following are components of high-quality CPR that the EMR should focus on? (Select all that apply.)",
    choices: [
      "Allowing full chest recoil between compressions",
      "Minimizing interruptions in chest compressions",
      "Compressing at a rate of 100 to 120 per minute",
      "Leaning on the chest between compressions to save energy",
      "Compressing to an adequate depth for the patient's age",
      "Pausing compressions for at least 30 seconds after every rhythm check",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "High-quality CPR includes full chest recoil, minimal interruptions, an adequate rate (100-120/min), and adequate depth appropriate to the patient's age. Leaning on the chest reduces cardiac filling and is incorrect, and pauses should be kept under 10 seconds whenever possible, not extended to 30 seconds.",
  },
  {
    id: "emr-cardiology-5085",
    domain: "Cardiology",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: true,
    question:
      "Before applying AED pads to a patient's chest, which of the following situations require the EMR to take an additional preparatory step before pad placement? (Select 2 or 3 that apply.)",
    choices: [
      "The patient's chest is wet from sweat or water",
      "The patient has excessive chest hair preventing pad adhesion",
      "The patient's skin appears mildly pale",
      "A visible transdermal medication patch is on the pad placement site",
      "The patient is wearing a shirt with a small logo",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "A wet chest should be dried, excessive chest hair should be quickly removed, and a medication patch should be removed and the area wiped, all before applying AED pads. Mildly pale skin and clothing with a logo (once removed to expose the chest) do not require any special preparatory step for pad placement.",
  },
  {
    id: "emr-cardiology-5086",
    domain: "Cardiology",
    level: "EMR",
    itemType: "build_list",
    clinicalJudgment: false,
    question:
      "Place the following steps for using an AED on an adult patient in cardiac arrest in the correct order.",
    steps: [
      "Turn on the AED and follow the voice prompts",
      "Attach the AED pads to the patient's bare, dry chest in the correct positions",
      "Ensure no one is touching the patient and allow the AED to analyze the rhythm",
      "If a shock is advised, ensure everyone is clear and press the shock button",
      "Immediately resume chest compressions after the shock (or after a 'no shock advised' message)",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "The correct sequence is: turn on the AED and follow its prompts, attach pads to the bare dry chest, clear the patient and allow rhythm analysis, deliver the shock if advised while everyone is clear, and immediately resume compressions afterward rather than pausing to check a pulse or rhythm.",
  },
  {
    id: "emr-cardiology-5087",
    domain: "Cardiology",
    level: "EMR",
    itemType: "build_list",
    clinicalJudgment: false,
    question:
      "Place the following steps in the correct order for a single rescuer starting CPR on an unresponsive adult found not breathing normally.",
    steps: [
      "Check for responsiveness and normal breathing",
      "Call for help and activate the emergency response system (get an AED if possible)",
      "Check for a pulse for no more than 10 seconds",
      "Begin chest compressions if no pulse is found",
      "Continue cycles of 30 compressions and 2 ventilations",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "The correct sequence is: check responsiveness and breathing, activate EMS and obtain an AED, check for a pulse (no more than 10 seconds), begin compressions if no pulse is found, and continue cycles of 30 compressions to 2 ventilations while awaiting further help.",
  },
  {
    id: "emr-cardiology-5088",
    domain: "Cardiology",
    level: "EMR",
    itemType: "build_list",
    clinicalJudgment: false,
    question:
      "Place the links of the adult out-of-hospital chain of survival in the correct order.",
    steps: [
      "Recognition of cardiac arrest and activation of the emergency response system",
      "Immediate high-quality CPR",
      "Rapid defibrillation",
      "Basic and advanced EMS care",
      "Post-cardiac-arrest care",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "The chain of survival begins with early recognition and activation, followed by immediate CPR, rapid defibrillation, basic and advanced EMS care, and finally post-cardiac-arrest care in the hospital. Each link depends on the one before it happening quickly and correctly.",
  },
  {
    id: "emr-cardiology-5089",
    domain: "Cardiology",
    level: "EMR",
    itemType: "drag_drop",
    clinicalJudgment: false,
    question:
      "Place each CPR-related finding into the correct category: Adult, Child, or Infant.",
    categories: [
      { id: "adult", label: "Adult" },
      { id: "child", label: "Child" },
      { id: "infant", label: "Infant" },
    ],
    items: [
      { id: "i1", label: "Two-finger compression technique used by a single rescuer", correctCategory: "infant" },
      { id: "i2", label: "Compression depth of at least 2 inches (5 cm), not exceeding 2.4 inches", correctCategory: "adult" },
      { id: "i3", label: "Brachial artery is the preferred pulse-check site", correctCategory: "infant" },
      { id: "i4", label: "One or two hands may be used for compressions depending on body size", correctCategory: "child" },
      { id: "i5", label: "Two thumb-encircling hands technique preferred for two-rescuer CPR", correctCategory: "infant" },
      { id: "i6", label: "15:2 ratio applies only when two rescuers are present", correctCategory: "child" },
    ],
    explanation:
      "The two-finger technique and brachial pulse check are infant-specific. Adult compressions target at least 2 inches deep. Children may use one or two hands depending on size, and both child and infant two-rescuer CPR use a 15:2 ratio, but the specific compression technique differs by age group as shown.",
  },
  {
    id: "emr-cardiology-5090",
    domain: "Cardiology",
    level: "EMR",
    itemType: "drag_drop",
    clinicalJudgment: false,
    question:
      "Place each AED-related situation into the correct category: Safe to Proceed As-Is, or Requires an Extra Step First.",
    categories: [
      { id: "safe", label: "Safe to Proceed As-Is" },
      { id: "extra", label: "Requires an Extra Step First" },
    ],
    items: [
      { id: "a1", label: "Patient's chest is completely dry", correctCategory: "safe" },
      { id: "a2", label: "Patient has a visible medication patch on the pad site", correctCategory: "extra" },
      { id: "a3", label: "Patient's chest is soaked with sweat", correctCategory: "extra" },
      { id: "a4", label: "Patient is lying on a dry wooden floor", correctCategory: "safe" },
      { id: "a5", label: "Patient has an implanted pacemaker away from the pad site", correctCategory: "safe" },
      { id: "a6", label: "Patient has thick chest hair preventing pad adhesion", correctCategory: "extra" },
    ],
    explanation:
      "A dry chest, a dry wooden floor, and a pacemaker located away from the pad site do not require any additional step before AED use. A medication patch must be removed, a wet chest must be dried, and excessive chest hair must be cleared before pads will adhere and function properly.",
  },
  {
    id: "emr-cardiology-5091",
    domain: "Cardiology",
    level: "EMR",
    itemType: "options_table",
    clinicalJudgment: true,
    question:
      "For each patient finding, classify the pulse quality as Strong/Normal or Weak/Thready.",
    rows: [
      {
        id: "r1",
        finding: "Radial pulse easily palpable, regular, full",
        options: ["Strong/Normal", "Weak/Thready"],
        correctOptionIndex: 0,
      },
      {
        id: "r2",
        finding: "Radial pulse barely palpable, patient pale and diaphoretic",
        options: ["Strong/Normal", "Weak/Thready"],
        correctOptionIndex: 1,
      },
      {
        id: "r3",
        finding: "Carotid pulse present, radial pulse absent, patient anxious",
        options: ["Strong/Normal", "Weak/Thready"],
        correctOptionIndex: 1,
      },
      {
        id: "r4",
        finding: "Pulse rate 78, regular, skin warm and dry, patient alert",
        options: ["Strong/Normal", "Weak/Thready"],
        correctOptionIndex: 0,
      },
    ],
    explanation:
      "A strong, easily felt pulse with warm, dry skin and normal mental status suggests adequate perfusion. A barely palpable pulse, loss of a peripheral pulse with a central pulse still present, and pale, diaphoretic skin or anxiety all suggest a weak, thready pulse consistent with poor perfusion or shock.",
  },
  {
    id: "emr-cardiology-5092",
    domain: "Cardiology",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: false,
    question:
      "Which of the following statements about AED use in special situations are correct? (Select 2 or 3 that apply.)",
    choices: [
      "An implanted pacemaker means an AED should never be used",
      "Pads should be placed at least 1 inch away from an implanted device if possible",
      "Excess chest hair should be cleared before applying pads to ensure adhesion",
      "A wet chest should be dried before applying AED pads",
      "AED pads can be placed directly on top of a transdermal medication patch",
    ],
    correctIndices: [1, 2, 3],
    explanation:
      "A pacemaker is not a contraindication to AED use, but pads should be placed at least 1 inch away from the device if possible. Chest hair should be cleared for adhesion, and a wet chest should be dried. A medication patch should be removed, not placed under a pad, since it can block the shock or cause burns.",
  },
  // ---------------------------------------------------------------------
  // More recognition and reasoning items
  // ---------------------------------------------------------------------
  {
    id: "emr-cardiology-5093",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A conscious patient with chest pain suddenly becomes unresponsive while you are talking to them. You check and find no normal breathing and no pulse. What is your immediate next action?",
    choices: [
      "Call the patient's family for more history first",
      "Begin CPR and ensure the AED is applied as soon as possible",
      "Wait one minute to see if the patient recovers on their own",
      "Elevate the patient's legs and monitor only",
    ],
    answerIndex: 1,
    explanation:
      "A witnessed arrest with absent breathing and pulse requires immediate initiation of CPR and rapid AED application. There is no role for delaying resuscitation to gather history or for a wait-and-see approach in confirmed cardiac arrest.",
  },
  {
    id: "emr-cardiology-5094",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which statement about compression-only (hands-only) CPR is correct?",
    choices: [
      "It is only appropriate for infants",
      "It is a reasonable alternative for an untrained bystander performing CPR on an adult with a sudden witnessed collapse",
      "It should always replace CPR with rescue breaths, even for trained rescuers and pediatric patients",
      "It requires the use of a bag-valve mask",
    ],
    answerIndex: 1,
    explanation:
      "Compression-only CPR is recommended as a reasonable option for untrained bystanders responding to a sudden witnessed adult collapse. Trained rescuers, especially for pediatric patients where a respiratory cause is more likely, should still provide ventilations along with compressions when able.",
  },
  {
    id: "emr-cardiology-5095",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What does the term 'defibrillation' refer to?",
    choices: [
      "Manually compressing the chest to circulate blood",
      "Delivering an electrical shock through the heart to try to stop a lethal chaotic rhythm and allow an organized rhythm to resume",
      "Administering medication to slow the heart rate",
      "Listening to heart sounds with a stethoscope",
    ],
    answerIndex: 1,
    explanation:
      "Defibrillation is the delivery of an electrical shock through the heart, intended to momentarily stop the chaotic electrical activity of a lethal rhythm such as ventricular fibrillation, allowing the heart's natural pacemaker to potentially resume an organized rhythm.",
  },
  {
    id: "emr-cardiology-5096",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are treating a patient in cardiac arrest in a moving ambulance. Should compressions be paused while the vehicle is in motion?",
    choices: [
      "Compressions should continue during transport per local protocol and safety practices, since stopping compressions reduces perfusion",
      "Compressions must always stop completely during any vehicle movement",
      "The AED should be used continuously while the vehicle is moving without pausing",
      "CPR is never performed during transport",
    ],
    answerIndex: 0,
    explanation:
      "High-quality CPR should continue during transport whenever safely possible, since interrupting compressions reduces coronary and cerebral perfusion. However, AED analysis and shock delivery should generally be paused (with the vehicle stopped if possible) to avoid movement artifact and for safety.",
  },
  {
    id: "emr-cardiology-5097",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A responsive patient reports chest pain and appears very anxious. Which basic, non-pharmacological action can the EMR take to help while awaiting further care?",
    choices: [
      "Encourage the patient to walk around to distract from the pain",
      "Help the patient rest in a position of comfort and provide calm reassurance while continuing to monitor",
      "Leave the patient alone to reduce their anxiety",
      "Tell the patient there is nothing seriously wrong",
    ],
    answerIndex: 1,
    explanation:
      "Helping a patient with suspected cardiac chest pain rest in a position of comfort and providing calm, honest reassurance can help reduce anxiety and myocardial oxygen demand, while the EMR continues to monitor the patient closely. Encouraging exertion or offering false reassurance is inappropriate.",
  },
  {
    id: "emr-cardiology-5098",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why is it important for the EMR to minimize the time between stopping compressions and delivering a shock with the AED?",
    choices: [
      "It is not actually important and has no effect on outcomes",
      "Coronary perfusion pressure built up during compressions drops quickly once they stop, reducing the shock's effectiveness the longer the delay",
      "The AED battery drains faster if compressions continue",
      "It only matters for pediatric patients",
    ],
    answerIndex: 1,
    explanation:
      "Coronary perfusion pressure, built up through chest compressions, falls rapidly once compressions stop. Minimizing the pre-shock pause helps preserve this pressure, which may improve the likelihood that a shock will successfully restore an organized rhythm.",
  },
  {
    id: "emr-cardiology-5099",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A family member insists on continuing to perform CPR on their loved one even though the family member appears completely exhausted and is barely compressing the chest. What is the most appropriate EMR action?",
    choices: [
      "Allow the exhausted family member to continue without interruption",
      "Gently take over compressions or arrange to rotate with another rescuer to maintain compression quality",
      "Tell the family member to stop and do nothing further",
      "Ignore the quality of compressions since any compressions are equally effective",
    ],
    answerIndex: 1,
    explanation:
      "Since fatigue reduces compression quality, the EMR should take over or coordinate a rotation with another available rescuer to maintain adequate rate and depth, while being respectful and supportive of the family member's efforts.",
  },
  {
    id: "emr-cardiology-5100",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What should the EMR do immediately before using an AED on a patient who is lying in a small puddle of water on the ground?",
    choices: [
      "Move the patient to a dry area if it can be done quickly and safely, or otherwise ensure the patient is not in standing water before shocking",
      "Add more water to help conduct the shock",
      "Use the AED directly in the puddle without any modification",
      "Cancel the response and leave the scene",
    ],
    answerIndex: 0,
    explanation:
      "Standing water can conduct electrical current away from the intended pathway and pose a safety hazard to rescuers. The patient should be moved to a dry area if this can be done quickly, or otherwise positioned so they are not lying directly in the water, before AED use.",
  },
  {
    id: "emr-cardiology-5101",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the purpose of high-quality bystander CPR before an AED or advanced care arrives?",
    choices: [
      "To cure the underlying heart problem",
      "To maintain some blood flow to the brain and heart until defibrillation or advanced care can be provided",
      "To wake the patient up immediately",
      "To replace the need for any further medical care",
    ],
    answerIndex: 1,
    explanation:
      "CPR does not cure the underlying cause of cardiac arrest, but it helps maintain some circulation to vital organs, particularly the brain and heart, buying time until defibrillation and advanced care can be provided.",
  },
  {
    id: "emr-cardiology-5102",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "An unresponsive 4-year-old child is found not breathing normally with no pulse, and you are alone with a cell phone available. What is the recommended sequence of actions?",
    choices: [
      "Call 911 first before starting any care, exactly as with an adult",
      "If alone with a phone, you may activate EMS (for example, using speakerphone) while beginning CPR, or perform about 2 minutes of CPR first if unable to call while providing care",
      "Leave the child to find a landline before starting any care",
      "Skip calling entirely and only perform compressions",
    ],
    answerIndex: 1,
    explanation:
      "For a child (in contrast to a witnessed sudden adult collapse), a lone rescuer with a mobile phone can activate EMS via speakerphone while beginning CPR immediately, or if unable to do both simultaneously, should generally provide about 2 minutes of CPR before leaving to call for help, since the arrest is more likely due to a respiratory cause.",
  },
  {
    id: "emr-cardiology-5103",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which finding on initial assessment would most strongly suggest a patient is NOT in cardiac arrest and does NOT need CPR?",
    choices: [
      "No response to voice or painful stimuli",
      "Normal, regular breathing with a clearly palpable pulse",
      "Occasional gasping breaths with no other movement",
      "No pulse palpable after a careful 10-second check",
    ],
    answerIndex: 1,
    explanation:
      "Normal, regular breathing along with a clearly palpable pulse indicates the patient is not in cardiac arrest, and CPR is not indicated. Unresponsiveness, agonal gasping, or an absent pulse are all findings consistent with cardiac arrest requiring CPR.",
  },
  {
    id: "emr-cardiology-5104",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the primary reason compressions should not be delayed while waiting for an AED to arrive?",
    choices: [
      "AEDs are rarely effective and compressions are the only useful intervention",
      "Continuous, high-quality compressions help maintain circulation and improve the chance defibrillation will be successful once the AED is available",
      "Compressions must always be performed for exactly 2 minutes before any AED use is allowed",
      "There is no reason; waiting for the AED before starting compressions is preferred",
    ],
    answerIndex: 1,
    explanation:
      "Starting compressions immediately, rather than waiting for the AED, helps maintain circulation to vital organs and can improve the likelihood that defibrillation will successfully restore an organized rhythm once the AED becomes available.",
  },
  {
    id: "emr-cardiology-5105",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "During a cardiac arrest resuscitation, you notice the patient's chest is not visibly rising during ventilations, though compressions are being delivered correctly. What should you check first?",
    choices: [
      "Assume the ventilations are adequate and continue without change",
      "Reassess the airway for obstruction and ensure a proper mask seal, adjusting technique as needed",
      "Stop all compressions and ventilations permanently",
      "Increase compression rate to compensate for poor ventilation",
    ],
    answerIndex: 1,
    explanation:
      "If the chest is not rising with ventilations, the airway should be reassessed for obstruction (such as tongue or foreign body) and mask seal technique should be checked and corrected, since effective ventilation is a key part of resuscitation, particularly in arrests with a respiratory component.",
  },
  {
    id: "emr-cardiology-5106",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Approximately how long can the brain typically tolerate a complete absence of blood flow before permanent injury becomes likely, underscoring the importance of prompt CPR?",
    choices: [
      "About 4 to 6 minutes",
      "About 45 minutes",
      "About 2 hours",
      "There is no time limit",
    ],
    answerIndex: 0,
    explanation:
      "Brain tissue is highly sensitive to oxygen deprivation, and permanent injury becomes increasingly likely after roughly 4 to 6 minutes without blood flow, which is why immediate CPR and rapid defibrillation are so critical to improving outcomes after cardiac arrest.",
  },
  {
    id: "emr-cardiology-5107",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A bystander begins CPR before you arrive and tells you they have been compressing for about 8 minutes without stopping. What should you do?",
    choices: [
      "Assume their technique has been perfect this whole time and make no changes",
      "Take over compressions (or arrange a smooth rotation) to ensure continued high-quality CPR, since prolonged compressions by one rescuer often become fatigued and less effective",
      "Tell them to stop entirely and do nothing until the AED analyzes",
      "Wait several more minutes before doing anything",
    ],
    answerIndex: 1,
    explanation:
      "A single rescuer performing compressions for 8 minutes is very likely fatigued, which degrades compression quality even if not obviously apparent. The EMR should smoothly take over or coordinate rotation to maintain effective compressions with minimal interruption.",
  },
  {
    id: "emr-cardiology-5108",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the general recommendation regarding oxygen administration for a responsive patient with chest pain and a normal oxygen saturation?",
    choices: [
      "High-flow oxygen should always be given to every chest pain patient regardless of saturation",
      "Oxygen should be given based on clinical need (such as evidence of hypoxemia or respiratory distress), rather than routinely to every patient with a normal saturation",
      "Oxygen should never be given to any cardiac patient",
      "Oxygen administration is unrelated to the patient's oxygen saturation",
    ],
    answerIndex: 1,
    explanation:
      "Current guidance favors giving supplemental oxygen based on clinical indication, such as a low oxygen saturation or overt signs of hypoxemia or respiratory distress, rather than routinely administering high-flow oxygen to every patient with chest pain regardless of their saturation.",
  },
  {
    id: "emr-cardiology-5109",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which term describes an abnormally fast heart rate?",
    choices: ["Bradycardia", "Tachycardia", "Asystole", "Apnea"],
    answerIndex: 1,
    explanation:
      "Tachycardia refers to an abnormally fast heart rate, generally above 100 beats per minute in an adult at rest. Bradycardia refers to an abnormally slow rate, asystole means no cardiac electrical activity, and apnea refers to absent breathing.",
  },
  {
    id: "emr-cardiology-5110",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which term describes an abnormally slow heart rate?",
    choices: ["Tachycardia", "Bradycardia", "Fibrillation", "Hypertension"],
    answerIndex: 1,
    explanation:
      "Bradycardia refers to an abnormally slow heart rate, generally below 60 beats per minute in an adult at rest, though this can be normal in some well-conditioned individuals. Tachycardia is the opposite (too fast), and fibrillation refers to chaotic, disorganized electrical activity rather than rate alone.",
  },
  {
    id: "emr-cardiology-5111",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What does 'asystole' mean?",
    choices: [
      "A very fast, regular heart rhythm",
      "The complete absence of detectable cardiac electrical activity",
      "A normal healthy heart rhythm",
      "A slightly irregular but otherwise normal rhythm",
    ],
    answerIndex: 1,
    explanation:
      "Asystole refers to the complete absence of cardiac electrical activity, often described as a 'flatline.' It is not a shockable rhythm, since there is no electrical activity for a shock to organize; the priority remains high-quality CPR.",
  },
  {
    id: "emr-cardiology-5112",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "The AED analyzes an unresponsive, pulseless patient and states 'no shock advised.' What should the EMR understand about this result?",
    choices: [
      "The patient's heart is definitely beating normally and needs no further care",
      "The rhythm detected (such as asystole or a non-shockable organized rhythm without a pulse) does not require a shock, but the patient still needs continued CPR",
      "The AED has malfunctioned and should be discarded",
      "The patient is dead and further resuscitation efforts should stop immediately",
    ],
    answerIndex: 1,
    explanation:
      "'No shock advised' simply means the detected rhythm is not one the AED is designed to shock (such as asystole or pulseless electrical activity). The patient remains in cardiac arrest and still requires immediate resumption of high-quality CPR and continued care per protocol.",
  },
  {
    id: "emr-cardiology-5113",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is the correct general order of assessment priority when approaching an unresponsive patient found down?",
    choices: [
      "Obtain a blood pressure, then check responsiveness",
      "Check responsiveness, then assess breathing and circulation (pulse)",
      "Apply the AED before checking responsiveness",
      "Begin CPR before confirming the patient is unresponsive",
    ],
    answerIndex: 1,
    explanation:
      "The general approach is to first check for responsiveness, then assess breathing and check for a pulse, using these findings to determine whether CPR and AED use are indicated. Assessment must precede intervention to ensure the correct care is provided.",
  },
  {
    id: "emr-cardiology-5114",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are the first EMR on scene at a suspected cardiac arrest in a public building with a nearby public-access AED. What should be one of your earliest actions after confirming the patient is unresponsive with abnormal or absent breathing?",
    choices: [
      "Immediately begin a detailed physical exam before doing anything else",
      "Direct a bystander to retrieve the nearby AED while you check for a pulse and prepare to begin CPR",
      "Wait for advanced EMS providers to arrive before taking any action",
      "Leave the patient to search for the AED yourself, no matter how far away it is",
    ],
    answerIndex: 1,
    explanation:
      "Delegating a bystander to retrieve a nearby AED while the EMR checks for a pulse and prepares to begin CPR allows both tasks to happen efficiently and minimizes delay to both compressions and defibrillation, which are the highest priorities in this situation.",
  },
  {
    id: "emr-cardiology-5115",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the main goal of chest compressions during CPR?",
    choices: [
      "To wake the patient up through physical stimulation",
      "To create artificial circulation, delivering oxygenated blood to the brain and other vital organs",
      "To restart the heart's electrical activity directly",
      "To clear an airway obstruction",
    ],
    answerIndex: 1,
    explanation:
      "Chest compressions create artificial circulation by mechanically pumping blood, helping deliver oxygen to the brain and other vital organs during cardiac arrest. Compressions alone do not restart the heart's electrical activity; that is the role of defibrillation for shockable rhythms.",
  },
  {
    id: "emr-cardiology-5116",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Ventilations (rescue breaths) during CPR are primarily intended to accomplish what?",
    choices: [
      "Provide oxygen and help remove carbon dioxide, supporting gas exchange in the lungs",
      "Physically restart the heartbeat",
      "Replace the need for chest compressions",
      "Warm the patient's body temperature",
    ],
    answerIndex: 0,
    explanation:
      "Ventilations deliver oxygen to the lungs and help facilitate removal of carbon dioxide, supporting gas exchange, which becomes especially important the longer resuscitation continues, particularly in arrests with a respiratory cause such as drowning or pediatric arrest.",
  },
  {
    id: "emr-cardiology-5117",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A 30-year-old patient collapses suddenly while playing basketball, witnessed by teammates. He is unresponsive, not breathing normally, and pulseless. What is the most likely underlying cause, and what is the priority action?",
    choices: [
      "Likely a sudden cardiac arrhythmia (such as ventricular fibrillation); the priority is immediate CPR and rapid defibrillation",
      "Likely simple exhaustion; the priority is to let him rest",
      "Likely a stomach issue; the priority is to give him water",
      "Likely a broken bone; the priority is to splint the leg first",
    ],
    answerIndex: 0,
    explanation:
      "A sudden witnessed collapse during exertion in an otherwise young, active person is classically associated with a sudden cardiac arrhythmia such as ventricular fibrillation. This scenario calls for immediate high-quality CPR and rapid AED use, which offers the best chance of survival.",
  },
  {
    id: "emr-cardiology-5118",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient with a documented 'Do Not Resuscitate' (DNR) order is found in cardiac arrest, and a valid order is immediately available and verified per local protocol. What should the EMR generally do?",
    choices: [
      "Begin full CPR and AED use regardless of the DNR order",
      "Follow local protocol regarding the valid DNR order, which may mean withholding resuscitative efforts while still providing comfort measures",
      "Ignore the DNR order because EMRs are never permitted to honor them",
      "Perform CPR only if family members are present and disagree with the order",
    ],
    answerIndex: 1,
    explanation:
      "When a valid DNR order is immediately available and verified according to local protocol, the EMR generally follows that protocol, which may mean withholding resuscitative efforts such as CPR and defibrillation while still providing comfort and support to the patient and family. Specific requirements for verifying validity vary by jurisdiction and must be followed carefully.",
  },
  {
    id: "emr-cardiology-5119",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are unsure whether a DNR order presented to you at the scene is valid or meets local requirements. What is the safest general approach?",
    choices: [
      "Assume it is valid and withhold all care",
      "When in doubt about the validity of a DNR order, begin resuscitation and continue while seeking clarification per local protocol and medical direction",
      "Flip a coin to decide",
      "Ask the family to make the final decision instead of following protocol",
    ],
    answerIndex: 1,
    explanation:
      "When there is genuine doubt about the validity or applicability of a DNR order, the generally accepted safe approach is to begin resuscitation efforts and continue while seeking clarification through local protocol and medical direction, since resuscitation can be stopped later but cannot be undone once withheld inappropriately.",
  },
  {
    id: "emr-cardiology-5120",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the general concept of 'perfusion'?",
    choices: [
      "The rate at which the heart beats",
      "The circulation of blood delivering oxygen and nutrients to, and removing waste from, the body's cells and tissues",
      "The process of clot formation",
      "The measurement of blood pressure only",
    ],
    answerIndex: 1,
    explanation:
      "Perfusion refers to the adequate circulation of blood through tissues, delivering oxygen and nutrients while removing metabolic waste products. Shock is fundamentally a state of inadequate perfusion, which is why recognizing signs of poor perfusion is central to EMR assessment.",
  },
  {
    id: "emr-cardiology-5121",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Capillary refill time is checked by pressing on a nail bed or skin and observing how quickly color returns. What does a delayed capillary refill (generally longer than about 2 seconds) suggest?",
    choices: [
      "Normal perfusion",
      "Possible poor perfusion, such as from shock",
      "The patient has a fever",
      "The patient is definitely in cardiac arrest",
    ],
    answerIndex: 1,
    explanation:
      "Delayed capillary refill (typically defined as longer than about 2 seconds) is a sign that may suggest poor peripheral perfusion, such as occurs in shock. It is one of several findings used together with pulse and skin assessment, not a stand-alone diagnostic sign of cardiac arrest.",
  },
  {
    id: "emr-cardiology-5122",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A toddler has a capillary refill time of about 4 seconds, along with a rapid pulse and pale skin. What should the EMR suspect?",
    choices: [
      "This is entirely normal for a toddler and requires no further concern",
      "These findings together suggest possible shock, and the child should be closely monitored and promptly transported",
      "The child definitely has a broken bone",
      "The findings indicate the child is overheated only",
    ],
    answerIndex: 1,
    explanation:
      "A delayed capillary refill combined with a rapid pulse and pale skin are concerning together for shock in a pediatric patient, who can compensate for blood loss or poor perfusion for a period of time before showing a drop in blood pressure. This combination should prompt close monitoring and prompt transport.",
  },
  {
    id: "emr-cardiology-5123",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why can children often maintain a relatively normal blood pressure for longer than adults despite significant blood loss or shock?",
    choices: [
      "Children have larger blood volumes than adults",
      "Children have a strong ability to compensate through increased heart rate and vasoconstriction before blood pressure drops",
      "Children's hearts pump less forcefully than adults, masking shock",
      "Blood pressure is not a useful measurement in children",
    ],
    answerIndex: 1,
    explanation:
      "Children have strong compensatory mechanisms, particularly the ability to significantly increase heart rate and constrict peripheral blood vessels, which can maintain blood pressure within a normal range even with significant blood loss, until they suddenly and rapidly decompensate. This makes early signs like tachycardia and pale skin especially important to recognize in pediatric shock.",
  },
  {
    id: "emr-cardiology-5124",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A pediatric trauma patient has a normal blood pressure but a persistently elevated heart rate and pale, cool skin. What should the EMR conclude?",
    choices: [
      "The normal blood pressure means the child is not in shock",
      "The child may be in compensated shock despite the normal blood pressure, and should be closely monitored for signs of decompensation",
      "Heart rate and skin findings are irrelevant if blood pressure is normal",
      "No further action or monitoring is needed",
    ],
    answerIndex: 1,
    explanation:
      "Because children compensate well, a normal blood pressure does not rule out shock. Persistent tachycardia and pale, cool skin suggest the child may be in compensated shock and requires close ongoing monitoring, since decompensation (a drop in blood pressure) can occur suddenly.",
  },
  {
    id: "emr-cardiology-5125",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is meant by 'compensated shock'?",
    choices: [
      "A state where the body's compensatory mechanisms are maintaining a relatively normal blood pressure despite ongoing hypoperfusion",
      "A state where the patient has already fully recovered from shock",
      "A stage of shock only seen in elderly patients",
      "A condition unrelated to perfusion",
    ],
    answerIndex: 0,
    explanation:
      "Compensated shock describes an early stage in which the body's compensatory mechanisms (increased heart rate, vasoconstriction) are still able to maintain a relatively normal blood pressure, even though tissue perfusion is already inadequate. Recognizing early signs like tachycardia and pale, cool skin is essential before decompensation occurs.",
  },
  {
    id: "emr-cardiology-5126",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is meant by 'decompensated shock'?",
    choices: [
      "A late stage of shock in which the body's compensatory mechanisms have failed, and blood pressure begins to drop",
      "The very first stage of shock, before any symptoms appear",
      "A stage of shock that only occurs in cardiac arrest",
      "A condition with no relationship to blood pressure",
    ],
    answerIndex: 0,
    explanation:
      "Decompensated shock is a later, more dangerous stage in which the body's compensatory mechanisms are overwhelmed and can no longer maintain blood pressure, so hypotension develops. This represents a significant deterioration and indicates a need for urgent care.",
  },
  {
    id: "emr-cardiology-5127",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient in shock suddenly develops a drop in blood pressure after previously having a normal reading. What does this change most likely indicate?",
    choices: [
      "The patient is now fully recovered",
      "The patient may be progressing from compensated to decompensated shock, a serious deterioration",
      "This finding is unrelated to the patient's condition",
      "The patient's condition has definitely stabilized",
    ],
    answerIndex: 1,
    explanation:
      "A drop in blood pressure in a patient who was previously compensating suggests the patient is transitioning into decompensated shock, a serious sign of deterioration that requires prompt recognition, supportive care, and rapid transport.",
  },
  {
    id: "emr-cardiology-5128",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following body positions is generally avoided for a patient with suspected shock who also has significant difficulty breathing?",
    choices: [
      "A fully supine position with legs elevated, since this can worsen breathing difficulty for some patients",
      "A position of comfort that supports both perfusion and breathing needs as much as possible",
      "Sitting fully upright is never appropriate for any shock patient regardless of breathing status",
      "Any position is equally appropriate regardless of the patient's breathing status",
    ],
    answerIndex: 0,
    explanation:
      "For a patient with both shock and significant respiratory distress, fully elevating the legs while supine can worsen breathing difficulty for some patients by increasing pressure on the diaphragm. Positioning should be individualized, balancing perfusion and respiratory needs, per assessment and local protocol.",
  },
  {
    id: "emr-cardiology-5129",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "During ongoing patient care, how often should vital signs generally be reassessed in an unstable patient, such as one showing signs of shock?",
    choices: [
      "Only once, at the very beginning of care",
      "Frequently, such as approximately every 5 minutes or sooner if the condition changes",
      "Only after the patient arrives at the hospital",
      "Vital signs do not need to be reassessed once initially obtained",
    ],
    answerIndex: 1,
    explanation:
      "Unstable patients, including those with signs of shock, should have vital signs reassessed frequently, commonly cited as approximately every 5 minutes (compared to roughly every 15 minutes for a stable patient), or sooner if the patient's condition appears to be changing.",
  },
  {
    id: "emr-cardiology-5130",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "For a stable patient with no acute complaints, approximately how often should vital signs generally be reassessed?",
    choices: [
      "Every 1 minute",
      "Approximately every 15 minutes",
      "Only once per hour",
      "Vital signs are unnecessary for stable patients",
    ],
    answerIndex: 1,
    explanation:
      "For a stable patient, vital sign reassessment approximately every 15 minutes is a commonly used general guideline, compared to more frequent reassessment (around every 5 minutes) for an unstable patient, though this should always be adjusted based on the patient's specific condition.",
  },
  {
    id: "emr-cardiology-5131",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You obtain an initial set of vital signs on a trauma patient: pulse 110, respirations 22, blood pressure 108/70, skin pale and slightly cool. Five minutes later, the pulse is 128 and blood pressure is 92/60. What does this trend suggest?",
    choices: [
      "The patient's condition is improving and no further concern is needed",
      "The patient's condition is likely worsening, possibly progressing toward decompensated shock, and requires prompt reassessment and action",
      "The change is simply due to normal measurement variation and can be ignored",
      "The trend has no clinical significance",
    ],
    answerIndex: 1,
    explanation:
      "A rising pulse rate combined with a falling blood pressure over a short period suggests worsening perfusion, indicating the patient may be progressing toward decompensated shock. Trends in vital signs over time are often more clinically meaningful than a single isolated reading.",
  },
  {
    id: "emr-cardiology-5132",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why is it important to document and communicate trends in vital signs, rather than only a single reading, when handing off a patient?",
    choices: [
      "Trends are not actually useful information",
      "Trends over time can reveal whether a patient is improving, stable, or deteriorating, which a single isolated reading cannot show",
      "Only the very first vital sign reading ever matters",
      "Trends should never be shared with receiving providers",
    ],
    answerIndex: 1,
    explanation:
      "Serial vital signs, tracked over time, allow rescuers and receiving providers to identify whether a patient's condition is trending toward improvement or deterioration, which a single isolated measurement cannot reveal on its own. This information should be clearly communicated during handoff.",
  },
  {
    id: "emr-cardiology-5133",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the general term for the assessment technique of using the sense of touch to assess a patient, such as feeling a pulse?",
    choices: ["Auscultation", "Palpation", "Percussion", "Inspection"],
    answerIndex: 1,
    explanation:
      "Palpation refers to using the sense of touch during assessment, such as feeling for a pulse or checking skin temperature. Auscultation refers to listening (such as with a stethoscope), and inspection refers to visual observation.",
  },
  {
    id: "emr-cardiology-5134",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is the general term for the assessment technique of listening, often with a stethoscope, such as when obtaining a blood pressure?",
    choices: ["Palpation", "Auscultation", "Inspection", "Percussion"],
    answerIndex: 1,
    explanation:
      "Auscultation refers to listening, typically with a stethoscope, as is done when obtaining an auscultated blood pressure or listening to lung or heart sounds. Palpation refers to touch, and inspection refers to visual observation.",
  },
  {
    id: "emr-cardiology-5135",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "An EMR is assessing skin as part of a perfusion assessment. Which combination of skin findings is most consistent with adequate perfusion?",
    choices: [
      "Pale, cool, clammy",
      "Warm, pink, dry",
      "Cyanotic and cold",
      "Mottled and diaphoretic",
    ],
    answerIndex: 1,
    explanation:
      "Warm, pink (normal color for the patient), and dry skin is generally consistent with adequate perfusion. Pale, cool, clammy skin; cyanosis with coldness; and mottled, diaphoretic skin are all findings more consistent with poor perfusion or shock.",
  },
  {
    id: "emr-cardiology-5136",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What does 'cyanosis' refer to?",
    choices: [
      "A bluish discoloration of the skin or mucous membranes, often associated with inadequate oxygenation",
      "A reddish flushing of the skin from fever",
      "Excessive sweating",
      "A yellowish discoloration of the skin from liver disease",
    ],
    answerIndex: 0,
    explanation:
      "Cyanosis refers to a bluish discoloration of the skin or mucous membranes, most often seen around the lips, fingertips, or nail beds, and is generally associated with inadequate oxygenation of the blood.",
  },
  {
    id: "emr-cardiology-5137",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You notice a patient's lips and fingertips appear slightly blue while they are also breathing rapidly and appear anxious. What should this combination of findings prompt you to consider?",
    choices: [
      "This is a completely normal finding that requires no action",
      "Possible inadequate oxygenation, warranting further assessment and appropriate supportive care",
      "The patient is simply cold and no other action is needed",
      "The patient's condition is unrelated to their breathing",
    ],
    answerIndex: 1,
    explanation:
      "Cyanosis (bluish discoloration) around the lips and fingertips, combined with rapid breathing and anxiety, suggests possible inadequate oxygenation and should prompt further assessment for the underlying cause and appropriate supportive care, such as airway management and oxygen if indicated.",
  },
  {
    id: "emr-cardiology-5138",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'diaphoresis'?",
    choices: [
      "Excessive or abnormal sweating",
      "A slow heart rate",
      "Difficulty breathing",
      "A rash on the skin",
    ],
    answerIndex: 0,
    explanation:
      "Diaphoresis refers to excessive or abnormal sweating and is a common associated finding in cardiac emergencies, shock, and other significant physiologic stress states.",
  },
  {
    id: "emr-cardiology-5139",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A middle-aged patient reports sudden chest tightness with profuse diaphoresis, even though the room is cool. What should the EMR consider about this combination of findings?",
    choices: [
      "Diaphoresis in a cool room is not clinically significant",
      "Unexplained diaphoresis, especially paired with chest discomfort, raises concern for a cardiac cause such as a heart attack",
      "This combination only occurs with anxiety and never a cardiac cause",
      "This is a normal response to a stressful call and no action is needed",
    ],
    answerIndex: 1,
    explanation:
      "Diaphoresis that is unexplained by the environment (such as sweating heavily in a cool room), especially in combination with chest discomfort, raises concern for a serious cardiac cause such as a heart attack and should prompt continued careful assessment and prompt care.",
  },
  {
    id: "emr-cardiology-5140",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why should an EMR avoid giving a patient with suspected cardiac chest pain anything to eat or drink?",
    choices: [
      "Food and drink have no relevance to cardiac patients",
      "The patient may need an urgent procedure that requires an empty stomach, and there is also a risk of vomiting and aspiration",
      "Eating always cures chest pain",
      "It is only a concern for pediatric patients",
    ],
    answerIndex: 1,
    explanation:
      "A patient with suspected cardiac chest pain may need an urgent procedure that requires an empty stomach, and there is also a risk of nausea, vomiting, and aspiration, particularly if the patient's condition worsens. For these reasons, oral intake should generally be withheld.",
  },
  {
    id: "emr-cardiology-5141",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You are caring for a conscious patient with chest pain who begins to feel like they might vomit. What is an appropriate EMR action, assuming no spinal injury is suspected?",
    choices: [
      "Have the patient lie flat on their back regardless of the risk",
      "Be prepared to reposition the patient (such as turning to the side) and have suction ready if vomiting occurs, to protect the airway",
      "Give the patient food to settle their stomach",
      "Ignore the complaint since it is unrelated to cardiac care",
    ],
    answerIndex: 1,
    explanation:
      "Nausea can precede vomiting, and if the patient vomits while supine, there is a risk of aspiration. The EMR should be prepared to reposition the patient (such as turning to the side, if no spinal injury is suspected) and have suction available to protect the airway if vomiting occurs.",
  },
  {
    id: "emr-cardiology-5142",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What is a general benefit of keeping a patient with suspected cardiac chest pain as calm and at rest as possible?",
    choices: [
      "It has no physiologic benefit at all",
      "Reducing physical exertion and anxiety can help lower the heart's oxygen demand during a time when oxygen supply may already be compromised",
      "It guarantees the chest pain will resolve completely",
      "It eliminates the need for any further assessment",
    ],
    answerIndex: 1,
    explanation:
      "Physical exertion and anxiety both increase the heart's workload and oxygen demand. Keeping a patient with suspected cardiac chest pain calm and at rest can help reduce this demand at a time when the oxygen supply to the heart muscle may already be compromised, though it does not eliminate the need for continued assessment and care.",
  },
  {
    id: "emr-cardiology-5143",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A 62-year-old man reports his chest pain has completely resolved after several minutes of rest, and he now feels fine and wants to refuse further care. What should the EMR keep in mind?",
    choices: [
      "Resolution of pain definitively rules out a serious cardiac event, and no further concern is warranted",
      "Resolution of pain does not rule out a serious underlying cardiac problem, and the patient should still be strongly encouraged to be further evaluated",
      "The patient should be left alone with no further discussion",
      "Chest pain that resolves on its own is never significant",
    ],
    answerIndex: 1,
    explanation:
      "Chest pain that resolves does not rule out a serious underlying cardiac event, since ischemia can be intermittent or a serious event may still be evolving. The EMR should still strongly encourage the patient to accept further evaluation, while respecting the patient's right to make an informed decision if they ultimately refuse.",
  },
  {
    id: "emr-cardiology-5144",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is generally considered a risk factor for coronary artery disease and heart attack?",
    choices: [
      "Regular moderate physical activity",
      "A history of smoking",
      "A diet high in fruits and vegetables",
      "Younger age",
    ],
    answerIndex: 1,
    explanation:
      "A history of smoking is a well-established risk factor for coronary artery disease and heart attack. Regular physical activity and a healthy diet are generally protective, and increasing age (not younger age) is a recognized risk factor.",
  },
  {
    id: "emr-cardiology-5145",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following is generally considered a non-modifiable risk factor for coronary artery disease (one the patient cannot change)?",
    choices: [
      "Smoking status",
      "Family history of early heart disease",
      "Physical activity level",
      "Diet",
    ],
    answerIndex: 1,
    explanation:
      "Family history of early heart disease is a non-modifiable risk factor, meaning it cannot be changed by the patient. Smoking status, physical activity level, and diet are all modifiable risk factors that a patient can potentially change to reduce their risk.",
  },
  {
    id: "emr-cardiology-5146",
    domain: "Cardiology",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: false,
    question:
      "Which of the following are recognized risk factors for coronary artery disease? (Select 2 or 3 that apply.)",
    choices: [
      "History of smoking",
      "Regular aerobic exercise",
      "Family history of early heart disease",
      "Diabetes mellitus",
      "A diet low in saturated fat",
    ],
    correctIndices: [0, 2, 3],
    explanation:
      "Smoking, a family history of early heart disease, and diabetes are all recognized risk factors for coronary artery disease. Regular aerobic exercise and a diet low in saturated fat are generally protective factors, not risk factors.",
  },
  {
    id: "emr-cardiology-5147",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient with a history of heart failure reports increasing shortness of breath, swelling in the legs, and difficulty breathing while lying flat. What should the EMR recognize about this presentation?",
    choices: [
      "These findings are unrelated to the patient's heart failure",
      "These are common signs and symptoms of worsening heart failure, and the patient should be positioned upright if it improves breathing, with prompt transport arranged",
      "The patient should be forced to lie completely flat regardless of symptoms",
      "No further action is needed since the patient is still conscious",
    ],
    answerIndex: 1,
    explanation:
      "Worsening shortness of breath, leg swelling, and difficulty breathing while lying flat (orthopnea) are classic signs of worsening heart failure due to fluid buildup. The EMR should generally allow the patient to sit upright if that improves breathing, and arrange for prompt transport and further evaluation.",
  },
  {
    id: "emr-cardiology-5148",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Why might a patient with heart failure and fluid buildup in the lungs benefit from sitting upright rather than lying flat?",
    choices: [
      "Sitting upright has no physiologic benefit in this situation",
      "Sitting upright can help reduce the work of breathing and improve comfort by using gravity to reduce fluid pressure on the lungs",
      "Sitting upright always cures heart failure",
      "It only matters for pediatric patients",
    ],
    answerIndex: 1,
    explanation:
      "For a patient with fluid buildup in the lungs from heart failure, sitting upright can help reduce the work of breathing and improve comfort, since gravity helps redistribute some of the fluid and reduces pressure on the lungs compared to lying flat.",
  },
  {
    id: "emr-cardiology-5149",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "An elderly patient with a history of heart disease reports feeling lightheaded and states their pulse feels 'fluttery and irregular.' Vital signs show a pulse that is difficult to count accurately due to irregularity. What should the EMR do?",
    choices: [
      "Ignore the irregularity since the patient is still conscious",
      "Recognize this may indicate a cardiac arrhythmia, continue monitoring closely, and arrange prompt transport for further evaluation",
      "Assume the patient is simply anxious and needs no further care",
      "Tell the patient irregular pulses are always normal",
    ],
    answerIndex: 1,
    explanation:
      "A pulse described as fluttery and irregular, especially with associated lightheadedness in a patient with known heart disease, may indicate a cardiac arrhythmia. The EMR should continue close monitoring, be prepared to intervene if the patient's condition worsens, and arrange prompt transport for further evaluation.",
  },
  {
    id: "emr-cardiology-5150",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which best describes the general EMR-level priority when caring for any patient with a suspected cardiac emergency?",
    choices: [
      "Diagnose the specific underlying cardiac condition before providing any care",
      "Recognize the emergency, provide supportive basic care within scope (such as positioning, reassurance, oxygen if indicated, and assisting with the patient's own prescribed medications per protocol), and ensure prompt activation of EMS and transport",
      "Administer advanced cardiac medications the EMR does not carry",
      "Wait for family members to make all care decisions",
    ],
    answerIndex: 1,
    explanation:
      "EMR-level care for a suspected cardiac emergency focuses on recognition, supportive basic care within scope of practice (positioning, reassurance, oxygen when indicated, and assisting with a patient's own prescribed medications per local protocol), and ensuring the emergency response system is activated for prompt transport, rather than attempting to diagnose the exact condition or provide advanced interventions beyond scope.",
  },
  {
    id: "emr-cardiology-5151",
    domain: "Cardiology",
    level: "EMR",
    itemType: "multiple_response",
    clinicalJudgment: true,
    question:
      "Which of the following EMR-level actions are generally appropriate for a conscious, responsive patient reporting classic cardiac chest pain with a systolic blood pressure of 120 mmHg? (Select 2 or 3 that apply.)",
    choices: [
      "Help the patient rest in a position of comfort",
      "Assist with the patient's own prescribed nitroglycerin per protocol, if criteria are met",
      "Encourage the patient to walk briskly to reduce anxiety",
      "Ensure prompt activation of EMS and arrange transport",
      "Give the patient a large meal to keep their strength up",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "Appropriate actions include helping the patient rest in a position of comfort, assisting with their own prescribed nitroglycerin per protocol if criteria such as adequate blood pressure are met, and ensuring prompt EMS activation and transport. Encouraging exertion and giving food are both inappropriate for a patient with suspected cardiac chest pain.",
  },
  {
    id: "emr-cardiology-5152",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "In two-rescuer adult CPR, what should the rescuer providing ventilations do while the other rescuer performs compressions?",
    choices: [
      "Deliver each ventilation over about 1 second, watching for visible chest rise, timed appropriately with the compression cycle",
      "Deliver ventilations continuously without regard to the compression cycle or chest rise",
      "Only ventilate once every 5 minutes",
      "Deliver ventilations as forcefully and quickly as possible regardless of chest rise",
    ],
    answerIndex: 0,
    explanation:
      "Each ventilation should be delivered over about 1 second with enough volume to produce visible chest rise, given during the pause after 30 compressions (or asynchronously if an advanced airway is in place). Overly forceful or rapid ventilation can cause gastric distention and reduce effectiveness.",
  },
  {
    id: "emr-cardiology-5153",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "What complication can result from ventilating a patient too forcefully or too quickly during CPR?",
    choices: [
      "Improved oxygenation with no downside",
      "Gastric distention, which can increase the risk of vomiting and aspiration, and can also impede lung expansion",
      "A guaranteed improvement in chest compression quality",
      "No complications are possible from ventilation technique",
    ],
    answerIndex: 1,
    explanation:
      "Ventilating too forcefully or too quickly can push air into the stomach rather than the lungs, causing gastric distention. This increases the risk of vomiting and aspiration and can also impede effective lung expansion, which is why each breath should be delivered slowly enough to just produce visible chest rise.",
  },
  {
    id: "emr-cardiology-5154",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "While performing rescue breaths during CPR, you notice the patient's stomach appears to be distending rather than the chest rising. What should you do?",
    choices: [
      "Continue exactly as before, since this is not a concern",
      "Reassess head positioning and airway patency, and adjust ventilation technique (such as reducing the volume or rate of each breath) to achieve visible chest rise instead",
      "Immediately push down forcefully on the stomach to relieve distention",
      "Stop all further ventilations permanently",
    ],
    answerIndex: 1,
    explanation:
      "Gastric distention during ventilation suggests air is entering the stomach rather than the lungs, often due to airway positioning issues or breaths given too forcefully or too quickly. The rescuer should reassess airway positioning and adjust technique to achieve visible chest rise, rather than pressing on the stomach, which risks causing vomiting and aspiration.",
  },
  {
    id: "emr-cardiology-5155",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which of the following best distinguishes a heart attack from cardiac arrest in general terms an EMR should understand?",
    choices: [
      "They are exactly the same condition and the terms can be used interchangeably in every case",
      "A heart attack involves reduced or blocked blood flow to part of the heart muscle, while cardiac arrest is the sudden cessation of effective heart function and circulation; a heart attack can lead to cardiac arrest but does not always do so",
      "A heart attack only occurs in older adults, while cardiac arrest only occurs in younger adults",
      "Cardiac arrest always resolves on its own without any intervention",
    ],
    answerIndex: 1,
    explanation:
      "A heart attack (myocardial infarction) involves reduced or blocked blood flow to part of the heart muscle, potentially causing muscle damage, while cardiac arrest is the sudden loss of effective heart function and circulation. A heart attack can trigger a cardiac arrest, but a patient can have one without the other, so the EMR should understand they are related but distinct conditions.",
  },
  {
    id: "emr-cardiology-5156",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "A patient having a heart attack remains conscious with a strong pulse and normal breathing. Does this patient need chest compressions?",
    choices: [
      "Yes, chest compressions should be started immediately regardless of the patient's pulse status",
      "No, chest compressions are only indicated for a patient who is unresponsive, not breathing normally, and pulseless; this conscious patient with a pulse needs supportive care and prompt transport instead",
      "Yes, but only compressions without any other care",
      "It depends solely on the patient's age",
    ],
    answerIndex: 1,
    explanation:
      "Chest compressions are indicated only for a patient in cardiac arrest (unresponsive, not breathing normally, and pulseless). A conscious patient having a heart attack who still has a pulse and normal breathing needs supportive care, monitoring, and prompt transport, not chest compressions, though the EMR should be prepared to begin CPR immediately if the patient's condition changes.",
  },
  {
    id: "emr-cardiology-5157",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: false,
    question:
      "Which statement best reflects appropriate EMR scope of practice regarding cardiac emergencies?",
    choices: [
      "EMRs should perform advanced cardiac procedures such as starting intravenous medications whenever a cardiac emergency is suspected",
      "EMRs focus on recognition, basic supportive care, high-quality CPR, AED use, and ensuring prompt activation and handoff to more advanced EMS resources",
      "EMRs should never activate the emergency response system for a suspected cardiac emergency",
      "EMRs are trained to interpret detailed 12-lead ECG waveforms as their primary role",
    ],
    answerIndex: 1,
    explanation:
      "EMR scope of practice for cardiac emergencies centers on recognition, basic supportive care, high-quality CPR, AED use, and ensuring prompt activation of the emergency response system with a smooth handoff to more advanced providers, rather than advanced procedures such as IV medication administration or 12-lead ECG interpretation, which are outside EMR scope.",
  },
  {
    id: "emr-cardiology-5158",
    domain: "Cardiology",
    level: "EMR",
    clinicalJudgment: true,
    question:
      "You have just completed a 2-minute cycle of CPR on an adult patient and the AED prompts another rhythm analysis. What should you do?",
    choices: [
      "Continue compressions without pause during the analysis",
      "Stop compressions, ensure no one is touching the patient, and allow the AED to analyze the rhythm",
      "Turn off the AED since analysis is not needed again",
      "Immediately begin ventilations only during the analysis period",
    ],
    answerIndex: 1,
    explanation:
      "When the AED prompts a rhythm analysis, compressions must stop and no one should be touching the patient so the AED can accurately assess the rhythm. This pause should be as brief as possible, with compressions resuming immediately after the analysis and any indicated shock.",
  },
  {
    id: "emr-cardiology-5159",
    domain: "Cardiology",
    level: "EMR",
    itemType: "build_list",
    clinicalJudgment: false,
    question:
      "Place the following actions for an EMR responding to a witnessed adult cardiac arrest with an AED nearby in the correct order.",
    steps: [
      "Confirm the scene is safe and check responsiveness",
      "Check breathing and pulse for no more than 10 seconds",
      "Activate the emergency response system and send someone to retrieve the AED",
      "Begin high-quality chest compressions",
      "Attach the AED and follow its prompts as soon as it arrives",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "The correct sequence is: ensure scene safety and check responsiveness, assess breathing and pulse briefly, activate EMS and get the AED moving toward the patient, begin compressions immediately while waiting, and attach the AED as soon as it arrives, following its prompts without delaying compressions unnecessarily.",
  },
];
