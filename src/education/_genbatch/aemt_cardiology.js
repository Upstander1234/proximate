// AEMT Cardiology practice question batch — originally authored for
// Proximate. See src/education/questions.js header for the base schema and
// src/education/itemTypes.js for itemType-specific fields. IDs run
// cardiology-2000 through cardiology-2179, sequential, no gaps.

export const BATCH = [
  {
    id: "aemt-cardiology-2000",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the primary indication for establishing IV access in a stable patient with cardiac-related chest pain?",
    choices: [
      "To administer routine antibiotics",
      "To provide a route for medications and fluids if the patient deteriorates",
      "To replace the need for oxygen administration",
      "To obtain a blood sample for on-scene cholesterol testing",
    ],
    answerIndex: 1,
    explanation:
      "IV access in a cardiac patient is established prophylactically to provide a route for medication administration and fluid therapy should the patient's condition worsen. Antibiotics are not an AEMT field intervention for chest pain, IV access does not replace oxygen therapy, and cholesterol testing is not performed in the field.",
  },
  {
    id: "aemt-cardiology-2001",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT is unable to obtain peripheral IV access on an unresponsive patient in cardiac arrest after two attempts. What is the most appropriate next step?",
    choices: [
      "Continue attempting peripheral IV access until successful",
      "Establish intraosseous (IO) access",
      "Withhold all vascular access and continue CPR only",
      "Attempt central line placement in the subclavian vein",
    ],
    answerIndex: 1,
    explanation:
      "IO access is an AEMT-scope alternative when peripheral IV access fails or is delayed in a critical patient such as cardiac arrest, and it should not be delayed by repeated failed peripheral attempts. Central line placement is outside AEMT scope, and abandoning vascular access altogether would prevent medication administration during resuscitation.",
  },
  {
    id: "aemt-cardiology-2002",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which anatomical landmark is most commonly used for proximal tibial IO insertion in an adult?",
    choices:
      ["The medial malleolus", "The greater trochanter", "The tibial tuberosity", "The olecranon process"],
    answerIndex: 2,
    explanation:
      "The proximal tibial IO site is located approximately 1-2 cm medial to and below the tibial tuberosity. The medial malleolus is used for the distal tibial site, the greater trochanter is not an IO site, and the olecranon is a landmark for elbow assessment, not IO placement.",
  },
  {
    id: "aemt-cardiology-2003",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "After IO needle placement, which finding best confirms correct placement before infusion begins?",
    choices: [
      "The patient reports mild discomfort at the insertion site",
      "The needle stands firmly upright without support and aspirates marrow or flushes easily without infiltration",
      "Blood return is absent through the needle",
      "The needle can be freely rotated 360 degrees",
    ],
    answerIndex: 1,
    explanation:
      "Correct IO placement is confirmed by a needle that stands firmly, aspirates marrow contents (not always present but supportive), and flushes without signs of infiltration such as swelling. A free-rotating needle suggests improper seating, and absent blood return alone does not rule out correct placement, but easy flush without infiltration is the key confirmatory sign.",
  },
  {
    id: "aemt-cardiology-2004",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A 62-year-old male presents with crushing substernal chest pain radiating to the left arm, diaphoresis, and nausea. His blood pressure is 132/84 mmHg. Which AEMT-level medication is appropriate if local protocol allows and no contraindications exist?",
    choices: ["Nitroglycerin", "Amiodarone", "Atropine", "Furosemide"],
    answerIndex: 0,
    explanation:
      "Nitroglycerin is within AEMT scope for suspected cardiac chest pain when blood pressure is adequate and no contraindications (e.g., recent PDE-5 inhibitor use, hypotension, right ventricular infarct) are present. Amiodarone and atropine are Paramedic-level rhythm medications, and furosemide is not an AEMT field medication for acute chest pain.",
  },
  {
    id: "aemt-cardiology-2005",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Before administering nitroglycerin to a chest pain patient, which finding should make the AEMT withhold the medication?",
    choices: [
      "Blood pressure of 92/60 mmHg",
      "Blood pressure of 138/88 mmHg",
      "Pain rated 8 out of 10",
      "Patient anxiety",
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin is a vasodilator and can cause a significant, dangerous drop in blood pressure. A systolic pressure below the protocol threshold (commonly under 100-110 mmHg) is a contraindication. An adequate blood pressure, high pain severity, and anxiety alone are not contraindications.",
  },
  {
    id: "aemt-cardiology-2006",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the typical mechanism of action of nitroglycerin in the treatment of cardiac chest pain?",
    choices: [
      "It increases myocardial contractility",
      "It causes vasodilation, reducing preload and myocardial oxygen demand",
      "It slows the heart rate by blocking AV node conduction",
      "It increases systemic vascular resistance",
    ],
    answerIndex: 1,
    explanation:
      "Nitroglycerin dilates blood vessels, particularly veins, reducing venous return (preload) and myocardial oxygen demand, which helps relieve ischemic chest pain. It does not increase contractility, does not block AV conduction, and decreases rather than increases systemic vascular resistance.",
  },
  {
    id: "aemt-cardiology-2007",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following is a standard contraindication to nitroglycerin administration?",
    choices: [
      "Use of a phosphodiesterase-5 inhibitor (e.g., sildenafil) within the past 24-48 hours",
      "History of hypertension controlled with medication",
      "Mild anxiety about the pain",
      "Prior nitroglycerin use earlier the same day with relief",
    ],
    answerIndex: 0,
    explanation:
      "PDE-5 inhibitors combined with nitrates can cause severe, refractory hypotension and are an absolute contraindication. Controlled hypertension, anxiety, and prior effective nitroglycerin use are not contraindications.",
  },
  {
    id: "aemt-cardiology-2008",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Aspirin is administered to patients with suspected acute coronary syndrome primarily because it:",
    choices: [
      "Dissolves existing coronary artery clots",
      "Inhibits platelet aggregation, limiting clot growth",
      "Reduces myocardial oxygen demand by slowing heart rate",
      "Provides direct analgesia for chest pain",
    ],
    answerIndex: 1,
    explanation:
      "Aspirin is an antiplatelet agent that inhibits further platelet aggregation, helping to limit clot propagation. It is not a thrombolytic and does not dissolve existing clots, does not act on heart rate, and is not primarily an analgesic.",
  },
  {
    id: "aemt-cardiology-2009",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with suspected ACS reports a documented allergy to aspirin with prior anaphylaxis. What is the most appropriate action?",
    choices: [
      "Administer a half dose of aspirin to minimize reaction risk",
      "Withhold aspirin and continue other appropriate care",
      "Administer aspirin rectally instead of orally",
      "Substitute ibuprofen for the aspirin dose",
    ],
    answerIndex: 1,
    explanation:
      "A true aspirin allergy with anaphylaxis is an absolute contraindication; aspirin should be withheld regardless of route or dose. Substituting another NSAID is inappropriate and not part of AEMT protocol, and reducing the dose does not eliminate the allergic risk.",
  },
  {
    id: "aemt-cardiology-2010",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "The standard adult chewable aspirin dose given for suspected acute coronary syndrome is typically:",
    choices: ["81 mg", "162-324 mg", "650 mg", "1000 mg"],
    answerIndex: 1,
    explanation:
      "Protocols commonly call for 162-324 mg (two to four 81 mg chewable tablets) for suspected ACS. 81 mg alone is a subtherapeutic single low-dose tablet for this acute indication, and 650 mg or 1000 mg exceed standard field dosing.",
  },
  {
    id: "aemt-cardiology-2011",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A cardiac monitor shows a regular rhythm at 48 beats per minute with a normal P wave before each QRS complex. The patient is asymptomatic. This rhythm is best described as:",
    choices: ["Sinus bradycardia", "Sinus tachycardia", "Second-degree AV block", "Atrial fibrillation"],
    answerIndex: 0,
    explanation:
      "A regular rhythm under 60 bpm with a normal P wave preceding each QRS is sinus bradycardia. Sinus tachycardia is over 100 bpm, second-degree block shows dropped or irregular P-QRS relationships, and atrial fibrillation is irregularly irregular without discrete P waves.",
  },
  {
    id: "aemt-cardiology-2012",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A patient in sinus bradycardia at 42 beats per minute is confused, hypotensive, and diaphoretic. This presentation is best classified as:",
    choices: [
      "Stable bradycardia requiring only observation",
      "Symptomatic (unstable) bradycardia requiring intervention",
      "A normal finding in a well-conditioned athlete",
      "An artifact from a loose monitor lead",
    ],
    answerIndex: 1,
    explanation:
      "Altered mental status, hypotension, and diaphoresis in the setting of bradycardia indicate poor perfusion and define symptomatic bradycardia requiring prompt intervention, not simple observation. This is not consistent with athletic conditioning bradycardia, which is asymptomatic, and the multiple corroborating signs argue against artifact.",
  },
  {
    id: "aemt-cardiology-2013",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A rhythm strip shows a regular narrow-complex rhythm at 118 beats per minute with a normal P wave preceding every QRS. This rhythm is most consistent with:",
    choices: ["Sinus tachycardia", "Atrial fibrillation", "Ventricular tachycardia", "Third-degree AV block"],
    answerIndex: 0,
    explanation:
      "A regular narrow-complex rhythm with a normal P wave before each QRS at a rate over 100 bpm is sinus tachycardia. Atrial fibrillation lacks discrete P waves and is irregular, ventricular tachycardia is wide-complex, and third-degree block shows AV dissociation.",
  },
  {
    id: "aemt-cardiology-2014",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A patient is found in sinus tachycardia at 128 bpm with signs of dehydration and no chest pain. What is the most appropriate initial AEMT treatment approach?",
    choices: [
      "Immediate synchronized cardioversion",
      "Administer isotonic IV fluid and treat the underlying cause",
      "Administer amiodarone",
      "Perform vagal maneuvers to slow the rate",
    ],
    answerIndex: 1,
    explanation:
      "Sinus tachycardia is usually a compensatory response to an underlying cause such as dehydration, pain, or fever; treatment targets the cause, and IV fluids are appropriate here. Cardioversion, amiodarone, and vagal maneuvers are directed at reentrant tachydysrhythmias like SVT, not sinus tachycardia, and cardioversion/amiodarone are outside or inappropriate for this scenario.",
  },
  {
    id: "aemt-cardiology-2015",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "The cardiac monitor shows a regular narrow-complex rhythm at 182 beats per minute with no visible P waves and an abrupt onset described by the patient. This is most consistent with:",
    choices: [
      "Supraventricular tachycardia",
      "Sinus tachycardia",
      "Atrial fibrillation with rapid ventricular response",
      "Ventricular fibrillation",
    ],
    answerIndex: 0,
    explanation:
      "SVT typically presents as a regular, narrow-complex rhythm well above 150 bpm with absent P waves and abrupt onset/offset. Sinus tachycardia rarely exceeds 160-180 and has visible P waves, atrial fibrillation is irregularly irregular, and ventricular fibrillation has no organized QRS complexes at all.",
  },
  {
    id: "aemt-cardiology-2016",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Atrial fibrillation on a cardiac monitor is best characterized by which finding?",
    choices: [
      "A regular rhythm with wide QRS complexes",
      "An irregularly irregular rhythm with no discernible P waves",
      "A regular rhythm with a prolonged PR interval",
      "A sawtooth pattern with a constant ventricular rate",
    ],
    answerIndex: 1,
    explanation:
      "Atrial fibrillation shows chaotic atrial activity with no discrete P waves and an irregularly irregular ventricular response. A wide-complex regular rhythm suggests VT, a prolonged PR interval suggests first-degree block, and a sawtooth pattern with constant rate describes atrial flutter, not fibrillation.",
  },
  {
    id: "aemt-cardiology-2017",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient in atrial fibrillation with a heart rate of 150 bpm is alert but reports lightheadedness and mild shortness of breath, with a blood pressure of 96/58 mmHg. The most appropriate AEMT-level management is:",
    choices: [
      "Immediate defibrillation",
      "Supportive care, IV access, oxygen as needed, and prompt transport",
      "Synchronized cardioversion by the AEMT",
      "Administration of amiodarone by the AEMT",
    ],
    answerIndex: 1,
    explanation:
      "This patient shows borderline instability but remains alert with a perfusing pressure; AEMT scope for atrial fibrillation is supportive care, IV access, and transport, with escalation to ALS if truly unstable. Defibrillation is not indicated for a perfusing rhythm, and synchronized cardioversion and amiodarone are outside AEMT scope.",
  },
  {
    id: "aemt-cardiology-2018",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which rhythm is characterized by a wide, regular QRS complex tachycardia typically over 120 beats per minute without discernible P waves?",
    choices: ["Ventricular tachycardia", "Sinus tachycardia", "First-degree AV block", "Sinus arrhythmia"],
    answerIndex: 0,
    explanation:
      "Ventricular tachycardia produces a wide, regular QRS tachycardia without normal P waves because the rhythm originates in the ventricles. Sinus tachycardia and sinus arrhythmia are narrow-complex with P waves, and first-degree block is a PR interval abnormality, not a wide-complex tachycardia.",
  },
  {
    id: "aemt-cardiology-2019",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient is found unresponsive, pulseless, and apneic. The monitor shows a wide, chaotic, irregular waveform with no organized complexes. This rhythm is:",
    choices: ["Ventricular fibrillation", "Ventricular tachycardia with a pulse", "Asystole", "Sinus arrhythmia"],
    answerIndex: 0,
    explanation:
      "Chaotic, disorganized electrical activity with no identifiable complexes in a pulseless patient is ventricular fibrillation. Pulseless VT would show organized wide complexes, asystole shows a flat line, and sinus arrhythmia is a normal variant seen in perfusing patients, not cardiac arrest.",
  },
  {
    id: "aemt-cardiology-2020",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which cardiac arrest rhythm is described as a flat line with no electrical activity?",
    choices: ["Asystole", "Pulseless electrical activity", "Ventricular fibrillation", "Torsades de pointes"],
    answerIndex: 0,
    explanation:
      "Asystole is the complete absence of detectable electrical cardiac activity, appearing as a flat line. Pulseless electrical activity shows organized electrical activity without a pulse, ventricular fibrillation shows chaotic waveforms, and torsades de pointes is a distinct polymorphic VT pattern.",
  },
  {
    id: "aemt-cardiology-2021",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A cardiac arrest patient's monitor shows an organized narrow-complex rhythm at 70 bpm, but no pulse is palpable despite high-quality CPR checks. This is most consistent with:",
    choices: [
      "Pulseless electrical activity",
      "Sinus rhythm with a weak pulse",
      "Ventricular fibrillation",
      "Artifact from CPR compressions",
    ],
    answerIndex: 0,
    explanation:
      "Organized electrical activity on the monitor without a corresponding palpable pulse defines pulseless electrical activity, which requires searching for and treating reversible causes. A weak but present pulse would not be described as pulseless, ventricular fibrillation is chaotic rather than organized, and dismissing it as CPR artifact would be an unsafe assumption without confirming a pulse.",
  },
  {
    id: "aemt-cardiology-2022",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A patient collapses in front of the AEMT crew and is found unresponsive, apneic, and pulseless. What is the correct first action per current resuscitation guidelines?",
    choices: [
      "Immediately begin high-quality chest compressions",
      "Obtain IV access before starting compressions",
      "Apply the AED and wait for it to analyze before touching the patient",
      "Perform a full secondary assessment first",
    ],
    answerIndex: 0,
    explanation:
      "Current guidelines emphasize immediate initiation of high-quality chest compressions with minimal delay in a confirmed cardiac arrest. IV access and AED application are important but should not delay the start of compressions, and a full secondary assessment is inappropriate in cardiac arrest.",
  },
  {
    id: "aemt-cardiology-2023",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the recommended compression-to-ventilation ratio for adult single-rescuer CPR without an advanced airway in place?",
    choices: ["15:2", "30:2", "5:1", "10:1"],
    answerIndex: 1,
    explanation:
      "The standard adult single-rescuer compression-to-ventilation ratio without an advanced airway is 30 compressions to 2 ventilations. 15:2 is used for two-rescuer pediatric CPR, and 5:1 and 10:1 are not standard adult ratios.",
  },
  {
    id: "aemt-cardiology-2024",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Once an advanced airway (such as a supraglottic airway) is in place during adult cardiac arrest, ventilations should be delivered:",
    choices: [
      "Continuously at 1 breath every 6 seconds, asynchronous with compressions",
      "In a strict 30:2 ratio with pauses for ventilation",
      "Only after compressions are stopped every 2 minutes",
      "At 1 breath every 2 seconds continuously",
    ],
    answerIndex: 0,
    explanation:
      "With an advanced airway in place, compressions continue uninterrupted while ventilations are delivered asynchronously at approximately 1 breath every 6 seconds (about 10/minute). The 30:2 ratio applies before an advanced airway is placed, and breaths every 2 seconds would cause hyperventilation.",
  },
  {
    id: "aemt-cardiology-2025",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of an automated external defibrillator (AED) in cardiac arrest management?",
    choices: [
      "To analyze the rhythm and deliver a shock for shockable rhythms like VF or pulseless VT",
      "To continuously monitor blood pressure during CPR",
      "To deliver synchronized cardioversion for unstable tachycardia",
      "To pace the heart in symptomatic bradycardia",
    ],
    answerIndex: 0,
    explanation:
      "An AED analyzes the cardiac rhythm and delivers an unsynchronized shock when it detects a shockable rhythm such as ventricular fibrillation or pulseless ventricular tachycardia. AEDs do not monitor blood pressure, do not perform synchronized cardioversion, and do not provide transcutaneous pacing.",
  },
  {
    id: "aemt-cardiology-2026",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "During CPR, the AED advises 'shock advised.' What is the correct sequence of actions?",
    choices: [
      "Continue compressions while the shock is delivered",
      "Ensure everyone is clear of the patient, deliver the shock, then immediately resume compressions",
      "Deliver the shock, then check for a pulse before resuming compressions",
      "Deliver the shock, then wait two minutes before any further action",
    ],
    answerIndex: 1,
    explanation:
      "Before shock delivery, all rescuers must be clear of the patient to avoid accidental shock, and CPR should resume immediately after the shock without a pulse check, since post-shock rhythms are frequently still non-perfusing. Compressions must stop during the actual shock delivery, and delaying compression resumption to check a pulse or waiting two minutes wastes critical perfusion time.",
  },
  {
    id: "aemt-cardiology-2027",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "How long should chest compressions be paused to allow AED rhythm analysis and shock delivery?",
    choices: [
      "As briefly as possible, ideally under 10 seconds",
      "At least 60 seconds to ensure accurate analysis",
      "Compressions should never be paused for the AED",
      "Exactly 5 minutes per protocol",
    ],
    answerIndex: 0,
    explanation:
      "Compression pauses for rhythm analysis and shock delivery should be minimized, ideally to less than 10 seconds, to preserve coronary perfusion pressure. A 60-second pause or a fixed 5-minute pause would be far too long, and some pause is unavoidable since compressions can interfere with rhythm analysis.",
  },
  {
    id: "aemt-cardiology-2028",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Manual defibrillation differs from AED use primarily in that manual defibrillation:",
    choices: [
      "Requires the operator to interpret the rhythm and select energy settings",
      "Cannot be used for ventricular fibrillation",
      "Does not require pad or paddle placement on the chest",
      "Is only used for synchronized cardioversion",
    ],
    answerIndex: 0,
    explanation:
      "Manual defibrillation requires the operator to interpret the cardiac rhythm and select the appropriate energy level themselves, unlike an AED which automates rhythm analysis. Manual defibrillation is used for VF/pulseless VT, still requires pad/paddle placement, and is distinct from (not limited to) synchronized cardioversion, which is a separate ALS skill.",
  },
  {
    id: "aemt-cardiology-2029",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Before applying AED pads, which action is most important if the patient's chest is soaked with water or heavily diaphoretic?",
    choices: [
      "Apply the pads directly over the wet skin without modification",
      "Quickly dry the chest before pad placement",
      "Cancel defibrillation entirely",
      "Apply pads to the back only",
    ],
    answerIndex: 1,
    explanation:
      "Excess moisture can cause arcing of current across the skin instead of through the chest, reducing shock effectiveness; the chest should be quickly dried before pad placement. Applying pads to wet skin unmodified is unsafe, canceling defibrillation is inappropriate when it may be lifesaving, and placing pads on the back only is not standard positioning for this problem.",
  },
  {
    id: "aemt-cardiology-2030",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "An AED pad placement site has a small transdermal medication patch. What should the AEMT do before applying the pad?",
    choices: [
      "Apply the pad directly over the patch",
      "Remove the patch, wipe the area, and place the pad on clean skin",
      "Cancel AED use because of the patch",
      "Move the AED elsewhere in the room without addressing the patch",
    ],
    answerIndex: 1,
    explanation:
      "A transdermal patch can block electrical transfer and cause skin burns during shock delivery; it should be removed and the site wiped before pad placement. Placing the pad directly over the patch is unsafe, and canceling AED use is unnecessary once the patch is removed.",
  },
  {
    id: "aemt-cardiology-2031",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with an implanted pacemaker requires AED pad placement. What is the correct approach?",
    choices: [
      "Place the pad directly over the pacemaker generator",
      "Place the pad at least one inch away from the visible pacemaker generator",
      "Avoid using the AED entirely because a pacemaker is present",
      "Place both pads on the same side of the chest",
    ],
    answerIndex: 1,
    explanation:
      "Pads should be placed at least one inch away from a visible or palpable implanted device to avoid interference and reduce shock energy blocked by the device. Placing the pad directly over the device is discouraged, avoiding AED use entirely is incorrect since defibrillation is still indicated for shockable rhythms, and placing both pads on the same side is not correct anterior-lateral placement.",
  },
  {
    id: "aemt-cardiology-2032",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "During two-rescuer adult CPR, chest compressions should be delivered at a rate of:",
    choices: ["60-80 per minute", "100-120 per minute", "140-160 per minute", "40-60 per minute"],
    answerIndex: 1,
    explanation:
      "Current adult CPR guidelines recommend a compression rate of 100-120 per minute. Rates below 100 or above 120 are associated with reduced effectiveness and are outside recommended guidelines.",
  },
  {
    id: "aemt-cardiology-2033",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "The recommended compression depth for adult CPR is:",
    choices: [
      "At least 2 inches (5 cm), not exceeding 2.4 inches (6 cm)",
      "At least 1 inch (2.5 cm)",
      "At least 3.5 inches (9 cm)",
      "Depth does not matter as long as the rate is correct",
    ],
    answerIndex: 0,
    explanation:
      "Adult compressions should be at least 2 inches deep but not exceed 2.4 inches to maintain effectiveness while minimizing injury. 1 inch is too shallow to generate adequate perfusion, 3.5 inches exceeds recommendations and risks injury, and depth is a critical component of compression quality.",
  },
  {
    id: "aemt-cardiology-2034",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "During ongoing CPR, the AEMT notes rescuers are becoming fatigued and compression depth appears to be decreasing. What should be done?",
    choices: [
      "Continue with the same rescuer performing compressions to avoid interrupting the rhythm",
      "Rotate compressors approximately every 2 minutes to maintain compression quality",
      "Stop CPR until a fresh rescuer becomes available",
      "Switch to compression-only CPR at a slower rate",
    ],
    answerIndex: 1,
    explanation:
      "Rescuer fatigue reduces compression quality; rotating compressors approximately every 2 minutes (coinciding with rhythm checks) with minimal interruption helps maintain adequate depth and rate. Continuing with a fatigued rescuer degrades CPR quality, stopping CPR entirely is harmful, and slowing the rate is not an appropriate fix for fatigue.",
  },
  {
    id: "aemt-cardiology-2035",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following is considered a reversible cause of cardiac arrest that AEMT/ALS providers should consider (one of the 'Hs and Ts')?",
    choices: ["Hypovolemia", "Osteoporosis", "Chronic bronchitis", "Seasonal allergies"],
    answerIndex: 0,
    explanation:
      "Hypovolemia is one of the classic reversible causes of cardiac arrest (the 'Hs and Ts'), along with hypoxia, hydrogen ion (acidosis), hypo/hyperkalemia, hypothermia, tension pneumothorax, tamponade, toxins, and thrombosis. Osteoporosis, chronic bronchitis, and seasonal allergies are not recognized reversible arrest causes.",
  },
  {
    id: "aemt-cardiology-2036",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A cardiac arrest patient found in a house fire has a monitor showing PEA. The AEMT should have a high index of suspicion for which reversible cause?",
    choices: ["Hypoxia", "Hyperkalemia", "Cardiac tamponade", "Tension pneumothorax"],
    answerIndex: 0,
    explanation:
      "A fire scene strongly raises suspicion for hypoxia from smoke inhalation and carbon monoxide exposure as a cause of arrest. Hyperkalemia, tamponade, and tension pneumothorax are not specifically suggested by this fire scenario, while hypoxia is directly indicated by the mechanism.",
  },
  {
    id: "aemt-cardiology-2037",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "According to the National EMS Scope of Practice Model, which cardiac arrest medication is generally within AEMT scope where local protocol and medical direction allow?",
    choices: ["Epinephrine (per protocol/formulary)", "Amiodarone", "Lidocaine for VT", "Calcium channel blockers"],
    answerIndex: 0,
    explanation:
      "Some AEMT formularies, under medical direction, include epinephrine administration during cardiac arrest per protocol. Amiodarone, lidocaine for ventricular dysrhythmias, and calcium channel blockers are Paramedic-level medications in the National EMS Scope of Practice Model.",
  },
  {
    id: "aemt-cardiology-2038",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which skill is explicitly outside AEMT scope of practice and reserved for Paramedic level under the National EMS Scope of Practice Model?",
    choices: ["Peripheral IV access", "Manual (non-AED) rhythm interpretation and synchronized cardioversion", "Oral glucose administration", "AED use"],
    answerIndex: 1,
    explanation:
      "Manual 12-lead/rhythm interpretation for treatment decisions and synchronized cardioversion are Paramedic-level skills, not AEMT scope. Peripheral IV access, oral glucose, and AED use are all within AEMT (or lower) scope of practice.",
  },
  {
    id: "aemt-cardiology-2039",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Transcutaneous pacing for symptomatic bradycardia is best classified as:",
    choices: ["An AEMT-scope skill", "A Paramedic-level skill", "An EMT-scope skill", "An EMR-scope skill"],
    answerIndex: 1,
    explanation:
      "Transcutaneous pacing requires advanced rhythm interpretation and is a Paramedic-level skill, not within AEMT, EMT, or EMR scope of practice.",
  },
  {
    id: "aemt-cardiology-2040",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT encounters a patient in symptomatic bradycardia with hypotension and altered mental status. ALS is not immediately available. What is the most appropriate AEMT action?",
    choices: [
      "Attempt transcutaneous pacing independently",
      "Provide supportive care, establish IV access, administer oxygen as needed, and arrange rapid transport or ALS intercept",
      "Administer atropine independently without medical direction",
      "Withhold all treatment until ALS arrives on scene",
    ],
    answerIndex: 1,
    explanation:
      "Within AEMT scope, the appropriate response to symptomatic bradycardia is supportive care, IV access, oxygen if indicated, and expedited transport or ALS intercept rather than performing procedures or administering medications outside AEMT scope. Pacing and unauthorized atropine administration are Paramedic-level actions, and withholding all care is inappropriate.",
  },
  {
    id: "aemt-cardiology-2041",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A trauma patient has a rapid, thready pulse, pale and diaphoretic skin, and a blood pressure of 84/60 mmHg. These findings are most consistent with which type of shock?",
    choices: ["Hypovolemic shock", "Anaphylactic shock", "Cardiogenic shock", "Neurogenic shock"],
    answerIndex: 0,
    explanation:
      "In trauma, a rapid thready pulse with pale, diaphoretic skin and hypotension reflects the body's compensatory response to blood loss, consistent with hypovolemic shock. Anaphylactic shock typically presents with hives/wheezing, cardiogenic shock with pulmonary edema/JVD from pump failure, and neurogenic shock with warm, dry skin and bradycardia from spinal injury, none of which match this presentation.",
  },
  {
    id: "aemt-cardiology-2042",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A patient with acute chest pain develops hypotension, jugular venous distention, and bilateral crackles on lung auscultation. This presentation most strongly suggests:",
    choices: ["Cardiogenic shock", "Hypovolemic shock", "Septic shock", "Neurogenic shock"],
    answerIndex: 0,
    explanation:
      "JVD and pulmonary crackles with hypotension following cardiac chest pain suggest pump failure causing backward fluid congestion, consistent with cardiogenic shock. Hypovolemic shock would show flat neck veins, septic shock typically presents with fever/infection signs, and neurogenic shock presents with warm dry skin, not pulmonary edema.",
  },
  {
    id: "aemt-cardiology-2043",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT suspects cardiogenic shock in a patient with pulmonary edema and hypotension. Which fluid administration approach is most appropriate?",
    choices: [
      "Administer a large, rapid fluid bolus to raise blood pressure quickly",
      "Administer fluids cautiously in small increments while closely monitoring lung sounds, per protocol/medical direction",
      "Withhold all IV fluids regardless of presentation",
      "Administer only hypertonic saline in large volumes",
    ],
    answerIndex: 1,
    explanation:
      "In suspected cardiogenic shock, the failing heart cannot handle a large fluid load, so fluids (if given at all) should be administered cautiously in small amounts with close reassessment of lung sounds, ideally per medical direction. A large rapid bolus risks worsening pulmonary edema, completely withholding IV access is not appropriate since access may still be needed, and hypertonic saline in large volumes is not indicated here.",
  },
  {
    id: "aemt-cardiology-2044",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A trauma patient in hypovolemic shock has a blood pressure of 78/50 mmHg and cool, pale skin. What is the most appropriate AEMT fluid therapy approach?",
    choices: [
      "Administer isotonic crystalloid boluses per protocol while controlling external hemorrhage and expediting transport",
      "Administer D5W as the primary resuscitation fluid",
      "Withhold IV fluids until arrival at the hospital",
      "Administer a single large bolus targeting a systolic pressure over 160 mmHg",
    ],
    answerIndex: 0,
    explanation:
      "Isotonic crystalloids (such as normal saline) given per protocol, combined with hemorrhage control and rapid transport, are the standard AEMT approach to hypovolemic shock from trauma. D5W is not an appropriate resuscitation fluid, withholding fluids delays needed treatment, and targeting an excessively high pressure can worsen bleeding (permissive hypotension is generally preferred in uncontrolled hemorrhage).",
  },
  {
    id: "aemt-cardiology-2045",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which vital sign trend is an early compensatory sign of shock before hypotension typically develops?",
    choices: ["Tachycardia", "Bradycardia", "Widened pulse pressure", "Decreased respiratory rate"],
    answerIndex: 0,
    explanation:
      "Tachycardia is an early compensatory mechanism as the body attempts to maintain cardiac output before blood pressure drops. Bradycardia, widened pulse pressure, and decreased respiratory rate are not typical early compensatory findings in shock (bradycardia and widened pulse pressure are more associated with rising intracranial pressure).",
  },
  {
    id: "aemt-cardiology-2046",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Narrowing pulse pressure (systolic and diastolic pressures moving closer together) in a shock patient most often indicates:",
    choices: [
      "Progressive compensation and worsening shock",
      "Improving cardiac output",
      "Resolution of the underlying condition",
      "A normal finding requiring no further attention",
    ],
    answerIndex: 0,
    explanation:
      "Narrowing pulse pressure reflects increasing peripheral vascular resistance as the body compensates for falling stroke volume, and is a sign of worsening shock, not improvement. It is not a normal finding and should prompt continued aggressive management and reassessment.",
  },
  {
    id: "aemt-cardiology-2047",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which type of IV catheter gauge is generally preferred for rapid fluid resuscitation in a hypovolemic shock patient?",
    choices: ["24-gauge (small)", "18-gauge or larger (large-bore)", "27-gauge (small)", "The gauge does not affect flow rate"],
    answerIndex: 1,
    explanation:
      "Larger-bore catheters (18-gauge or larger) allow faster fluid administration due to lower resistance to flow, which is important in shock resuscitation. Small-gauge catheters like 24 or 27 gauge significantly limit flow rate, and catheter gauge directly affects flow rate according to fluid dynamics principles.",
  },
  {
    id: "aemt-cardiology-2048",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient presents with a severe headache, blurred vision, and a blood pressure of 224/128 mmHg without focal neurological deficits. This presentation is most consistent with:",
    choices: ["A hypertensive emergency", "Normal age-related blood pressure elevation", "Orthostatic hypotension", "Vasovagal syncope"],
    answerIndex: 0,
    explanation:
      "A markedly elevated blood pressure with severe symptoms such as headache and visual changes indicates a hypertensive emergency with likely end-organ involvement. This is not a normal finding, and orthostatic hypotension and vasovagal syncope both involve low, not extremely high, blood pressure.",
  },
  {
    id: "aemt-cardiology-2049",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT is caring for a patient in a hypertensive emergency with a severe headache. Which action is most appropriate within AEMT scope?",
    choices: [
      "Administer a rapid-acting oral antihypertensive to sharply lower the pressure immediately",
      "Provide supportive care, position of comfort, oxygen if indicated, minimize stimulation, and transport promptly for physician-directed management",
      "Administer nitroglycerin at a high dose to aggressively lower blood pressure",
      "Delay transport until the blood pressure normalizes on scene",
    ],
    answerIndex: 1,
    explanation:
      "AEMT management of a hypertensive emergency focuses on supportive care and prompt transport, since aggressive field blood pressure reduction (which can cause dangerous drops in cerebral perfusion) is not within AEMT scope. Administering antihypertensives to sharply lower pressure or high-dose nitroglycerin for this purpose is inappropriate and outside scope, and delaying transport is harmful.",
  },
  {
    id: "aemt-cardiology-2050",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A hypertensive urgency differs from a hypertensive emergency primarily by:",
    choices: [
      "The presence or absence of acute end-organ damage",
      "The absolute blood pressure number alone, regardless of symptoms",
      "Whether the patient is taking blood pressure medication",
      "The patient's age",
    ],
    answerIndex: 0,
    explanation:
      "Hypertensive emergency is defined by severely elevated blood pressure WITH evidence of acute end-organ damage (e.g., neurological deficits, pulmonary edema, chest pain), while hypertensive urgency involves severe elevation WITHOUT such damage. The number alone, medication use, and age do not define the distinction.",
  },
  {
    id: "aemt-cardiology-2051",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient with severely elevated blood pressure also has slurred speech and left-sided facial droop. In addition to standard hypertensive emergency care, the AEMT should also treat this as a suspected:",
    choices: ["Stroke, with rapid transport to an appropriate stroke-capable facility", "Simple panic attack", "Muscle strain", "Dental abscess"],
    answerIndex: 0,
    explanation:
      "Facial droop and slurred speech alongside severe hypertension are classic stroke findings and warrant treatment as a time-critical stroke with rapid transport to an appropriate facility. A panic attack, muscle strain, and dental abscess do not explain these focal neurological findings.",
  },
  {
    id: "aemt-cardiology-2052",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which patient population is most likely to present with atypical chest pain symptoms such as fatigue, indigestion, or shortness of breath without classic chest pain?",
    choices: ["Diabetic and elderly patients", "Young healthy athletes", "Pediatric patients under age 5", "Patients with no medical history"],
    answerIndex: 0,
    explanation:
      "Diabetic patients (due to autonomic neuropathy) and elderly patients often present with atypical or 'silent' cardiac symptoms rather than classic chest pain. Young healthy athletes, pediatric patients under 5, and patients with no history are not the populations classically associated with atypical ACS presentation.",
  },
  {
    id: "aemt-cardiology-2053",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A 68-year-old diabetic female reports only nausea, fatigue, and mild shortness of breath with no chest pain. Her skin is cool and diaphoretic. The AEMT should:",
    choices: [
      "Rule out a cardiac cause because chest pain is absent",
      "Maintain a high suspicion for an atypical cardiac event and perform a full cardiac-focused assessment",
      "Assume the symptoms are due to a viral illness without further assessment",
      "Withhold oxygen since chest pain is absent",
    ],
    answerIndex: 1,
    explanation:
      "Atypical presentations are common in diabetic and elderly patients, so a cardiac cause must remain high on the differential despite the absence of chest pain, warranting a full cardiac assessment. Ruling out cardiac causes or assuming a viral illness without assessment could miss a life-threatening event, and oxygen should be considered based on the patient's overall presentation, not withheld solely because chest pain is absent.",
  },
  {
    id: "aemt-cardiology-2054",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "The OPQRST mnemonic used in chest pain assessment stands for:",
    choices: [
      "Onset, Provocation/Palliation, Quality, Radiation, Severity, Time",
      "Onset, Pulse, Quality, Rhythm, Skin, Temperature",
      "Oxygen, Pressure, Quantity, Rate, Sound, Type",
      "Onset, Position, Quality, Reaction, Signs, Treatment",
    ],
    answerIndex: 0,
    explanation:
      "OPQRST stands for Onset, Provocation/Palliation, Quality, Radiation, Severity, and Time, a standard tool for characterizing pain. The other options are not the accepted meaning of this mnemonic.",
  },
  {
    id: "aemt-cardiology-2055",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "The SAMPLE history mnemonic includes which of the following elements?",
    choices: [
      "Signs/symptoms, Allergies, Medications, Past history, Last oral intake, Events leading up",
      "Signs/symptoms, Airway, Motion, Pulse, Lungs, Extremities",
      "Sensation, Activity, Medications, Perfusion, Level of consciousness, Effort",
      "Skin, Airway, Mental status, Pulse, Lungs, Exam",
    ],
    answerIndex: 0,
    explanation:
      "SAMPLE stands for Signs/symptoms, Allergies, Medications, Pertinent past medical history, Last oral intake, and Events leading up to the incident, used to gather a focused patient history. The other options do not correctly expand this mnemonic.",
  },
  {
    id: "aemt-cardiology-2056",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient in cardiac arrest is found with obvious rigor mortis and dependent lividity. What is the most appropriate action?",
    choices: [
      "Begin resuscitation efforts immediately per standard protocol",
      "Withhold resuscitation, as these are obvious signs of death, and follow local protocol for such determinations",
      "Apply the AED regardless of these findings",
      "Perform chest compressions only, without ventilation",
    ],
    answerIndex: 1,
    explanation:
      "Rigor mortis and dependent lividity are obvious signs of death, and resuscitation is withheld per protocol when these are present. Beginning resuscitation, applying the AED, or performing compressions-only CPR would all be inappropriate once obvious death is confirmed.",
  },
  {
    id: "aemt-cardiology-2057",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "During ongoing resuscitation, the patient's end-tidal CO2 (if monitored) abruptly rises along with a palpable pulse and spontaneous respiratory effort. This most likely indicates:",
    choices: [
      "Return of spontaneous circulation (ROSC)",
      "Worsening cardiac arrest",
      "Equipment malfunction requiring immediate replacement",
      "The patient has entered a deeper state of arrest",
    ],
    answerIndex: 0,
    explanation:
      "A sudden rise in end-tidal CO2 along with a palpable pulse and spontaneous breathing are classic indicators of return of spontaneous circulation. These findings do not suggest worsening arrest, equipment malfunction, or a deeper arrest state; a rising perfusion-linked capnography value is a physiologic sign of improving circulation.",
  },
  {
    id: "aemt-cardiology-2058",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A cardiac arrest patient achieves ROSC during transport. What is the most appropriate immediate next step?",
    choices: [
      "Stop all monitoring since the emergency is resolved",
      "Continue frequent reassessment of airway, breathing, circulation, and vital signs, and be prepared to resume resuscitation if the patient deteriorates",
      "Immediately discontinue IV access",
      "Remove all airway adjuncts regardless of the patient's respiratory status",
    ],
    answerIndex: 1,
    explanation:
      "After ROSC, the patient remains critical and requires close, continuous reassessment with readiness to resume resuscitation if they re-arrest. Stopping monitoring, discontinuing IV access, or removing airway adjuncts without reassessing respiratory status would all be unsafe.",
  },
  {
    id: "aemt-cardiology-2059",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the role of high-flow oxygen administration in a patient with suspected acute coronary syndrome and a normal oxygen saturation?",
    choices: [
      "Routine high-flow oxygen is administered to all ACS patients regardless of saturation",
      "Oxygen is generally titrated to maintain adequate saturation rather than given routinely at high-flow to normoxic patients",
      "Oxygen should never be given to a chest pain patient",
      "Oxygen replaces the need for aspirin",
    ],
    answerIndex: 1,
    explanation:
      "Current evidence-based guidance favors titrating oxygen to maintain adequate saturation rather than routinely administering high-flow oxygen to patients who are already normoxic, since hyperoxia may be harmful in ACS. Withholding oxygen entirely is incorrect if the patient becomes hypoxic, and oxygen does not replace aspirin's antiplatelet effect.",
  },
  {
    id: "aemt-cardiology-2060",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient with chest pain has an oxygen saturation of 96% on room air and no respiratory distress. What is the most appropriate oxygen management?",
    choices: [
      "Apply a non-rebreather mask at 15 lpm regardless of saturation",
      "No supplemental oxygen is required at this time; continue monitoring saturation",
      "Withhold all future oxygen therapy even if saturation drops",
      "Apply a nasal cannula at 6 lpm as a precaution",
    ],
    answerIndex: 1,
    explanation:
      "With an adequate saturation of 96% and no distress, supplemental oxygen is not indicated; continued monitoring allows oxygen to be added if the patient desaturates. Routine high-flow oxygen for a normoxic patient is not evidence-based, and refusing to ever give oxygen if the patient later desaturates would be inappropriate.",
  },
  {
    id: "aemt-cardiology-2061",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'preload' in cardiac physiology?",
    choices: [
      "The volume of blood returning to the heart and filling the ventricles before contraction",
      "The resistance the heart must pump against to eject blood",
      "The heart's intrinsic electrical rate",
      "The oxygen content of arterial blood",
    ],
    answerIndex: 0,
    explanation:
      "Preload refers to the volume of venous blood returning to and filling the heart before systole. Afterload describes the resistance against which the heart pumps, intrinsic rate is a separate electrophysiological property, and oxygen content is unrelated to preload.",
  },
  {
    id: "aemt-cardiology-2062",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'afterload' in cardiac physiology?",
    choices: [
      "The resistance the left ventricle must overcome to eject blood into the aorta",
      "The volume of blood filling the ventricle before contraction",
      "The rate of the SA node",
      "The amount of blood ejected per beat",
    ],
    answerIndex: 0,
    explanation:
      "Afterload is the resistance (largely systemic vascular resistance) the ventricle must overcome to eject blood. Preload is filling volume before contraction, SA node rate is a separate electrical property, and blood ejected per beat describes stroke volume, not afterload.",
  },
  {
    id: "aemt-cardiology-2063",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Cardiac output is best defined as:",
    choices: [
      "Heart rate multiplied by stroke volume",
      "Blood pressure divided by heart rate",
      "The total blood volume in the body",
      "The resistance in the pulmonary vasculature",
    ],
    answerIndex: 0,
    explanation:
      "Cardiac output equals heart rate multiplied by stroke volume, representing the volume of blood pumped per minute. Blood pressure divided by heart rate is not a recognized physiologic formula, total blood volume is a separate concept, and pulmonary vascular resistance is unrelated to this definition.",
  },
  {
    id: "aemt-cardiology-2064",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient's heart rate drops from 130 to 40 bpm while blood pressure falls from 110/70 to 70/40 mmHg. Based on the cardiac output relationship, this drop in rate most likely explains the hypotension because:",
    choices: [
      "Cardiac output fell because heart rate decreased sharply while stroke volume could not fully compensate",
      "Stroke volume alone determines blood pressure, independent of heart rate",
      "Heart rate has no effect on cardiac output",
      "The blood pressure drop is unrelated to the heart rate change",
    ],
    answerIndex: 0,
    explanation:
      "Since cardiac output equals heart rate times stroke volume, a severe drop in heart rate lowers cardiac output (and thus blood pressure) unless stroke volume increases enough to compensate, which often does not fully occur acutely. The other options incorrectly deny the relationship between heart rate, stroke volume, and cardiac output that explains this scenario.",
  },
  {
    id: "aemt-cardiology-2065",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which vessel carries deoxygenated blood from the right ventricle to the lungs?",
    choices: ["Pulmonary artery", "Pulmonary vein", "Aorta", "Inferior vena cava"],
    answerIndex: 0,
    explanation:
      "The pulmonary artery carries deoxygenated blood from the right ventricle to the lungs for oxygenation. The pulmonary vein returns oxygenated blood to the left atrium, the aorta carries oxygenated blood from the left ventricle to the body, and the inferior vena cava returns deoxygenated blood to the right atrium.",
  },
  {
    id: "aemt-cardiology-2066",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "The SA node is normally considered the heart's primary pacemaker because it:",
    choices: [
      "Has the fastest intrinsic rate of spontaneous depolarization",
      "Is located in the ventricles",
      "Only fires when the AV node fails",
      "Has the slowest intrinsic rate of any pacemaker site",
    ],
    answerIndex: 0,
    explanation:
      "The SA node has the fastest intrinsic firing rate of the heart's pacemaker tissues, which is why it normally sets the heart rate. It is located in the right atrium, not the ventricles, does not only fire when the AV node fails, and does not have the slowest rate — it has the fastest.",
  },
  {
    id: "aemt-cardiology-2067",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "If the SA node fails, which structure typically serves as the next backup pacemaker, generally at a slower intrinsic rate?",
    choices: ["The AV node/junctional tissue", "The right atrium wall", "The tricuspid valve", "The vena cava"],
    answerIndex: 0,
    explanation:
      "The AV node/junctional tissue serves as the heart's secondary pacemaker with a slower intrinsic rate than the SA node if the SA node fails. The atrial wall, tricuspid valve, and vena cava are not pacemaker tissues.",
  },
  {
    id: "aemt-cardiology-2068",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient reports crushing chest pressure that began at rest, lasting over 30 minutes, unrelieved by resting further. This duration and pattern is most concerning for:",
    choices: [
      "Stable angina",
      "Acute myocardial infarction",
      "Simple muscle strain",
      "Acid reflux that will resolve on its own",
    ],
    answerIndex: 1,
    explanation:
      "Prolonged chest pain lasting more than 20-30 minutes at rest, unrelieved by rest, is concerning for acute myocardial infarction rather than stable angina, which typically resolves with rest within minutes. Muscle strain and reflux do not typically produce this pattern of prolonged pressure-type pain at rest.",
  },
  {
    id: "aemt-cardiology-2069",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Stable angina is typically distinguished from unstable angina/ACS by which characteristic?",
    choices: [
      "Stable angina occurs predictably with exertion and resolves with rest or nitroglycerin",
      "Stable angina always requires hospitalization",
      "Stable angina causes permanent heart muscle damage",
      "Stable angina is unrelated to coronary artery disease",
    ],
    answerIndex: 0,
    explanation:
      "Stable angina follows a predictable pattern, typically provoked by exertion and relieved by rest or nitroglycerin, unlike unstable angina which occurs unpredictably or at rest. Stable angina does not typically require hospitalization on its own, does not cause permanent damage (unlike MI), and is in fact related to underlying coronary artery disease.",
  },
  {
    id: "aemt-cardiology-2070",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "multiple_response",
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Which of the following findings in a chest pain patient increase concern for a cardiac origin rather than a musculoskeletal cause? (Select all that apply.)",
    choices: [
      "Pain radiating to the jaw or left arm",
      "Pain reproduced by palpating the chest wall",
      "Associated diaphoresis and nausea",
      "Pain that worsens with deep inspiration only",
      "Pain associated with exertion and relieved by rest",
    ],
    correctIndices: [0, 2, 4],
    explanation:
      "Radiation to the jaw/arm, diaphoresis with nausea, and exertional pain relieved by rest are classic cardiac indicators. Pain reproduced by chest wall palpation and pain that worsens specifically with deep inspiration are more suggestive of a musculoskeletal or pleuritic cause, not cardiac origin.",
  },
  {
    id: "aemt-cardiology-2071",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "multiple_response",
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Which findings would be expected in a patient experiencing symptomatic (unstable) bradycardia? (Select all that apply.)",
    choices: [
      "Altered mental status",
      "Chest pain",
      "Hypertension well above baseline",
      "Signs of hypoperfusion such as pale, cool skin",
      "Hypotension",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "Symptomatic bradycardia is characterized by evidence of poor perfusion such as altered mental status, chest pain, pale/cool skin, and hypotension. Hypertension above baseline is not a typical feature of symptomatic bradycardia, which is associated with inadequate, not elevated, perfusion pressure.",
  },
  {
    id: "aemt-cardiology-2072",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    itemType: "multiple_response",
    question:
      "Which of the following are appropriate AEMT-scope interventions for a stable patient with suspected acute coronary syndrome? (Select all that apply.)",
    choices: [
      "Administer chewable aspirin if no contraindication exists",
      "Establish IV access",
      "Administer nitroglycerin if protocol criteria are met",
      "Perform synchronized cardioversion",
      "Administer amiodarone",
      "Apply the cardiac monitor and obtain vital signs",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "Aspirin, IV access, protocol-guided nitroglycerin, and cardiac monitoring/vital signs are all within AEMT scope for suspected ACS. Synchronized cardioversion and amiodarone administration are Paramedic-level interventions outside AEMT scope.",
  },
  {
    id: "aemt-cardiology-2073",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "build_list",
    clinicalJudgmentStep: "take_action",
    question:
      "Place the following actions in the correct order for managing a witnessed adult cardiac arrest with an AED immediately available.",
    steps: [
      "Confirm unresponsiveness and absence of normal breathing/pulse",
      "Begin high-quality chest compressions",
      "Apply AED pads and allow analysis as soon as available",
      "Deliver shock if advised, then immediately resume compressions",
      "Continue CPR cycles and reassess per protocol",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "Resuscitation begins with confirming arrest, then immediate compressions, followed by applying the AED as soon as it is available, delivering a shock if advised, and resuming compressions immediately without delay, then continuing cycles with reassessment. Reordering these steps (e.g., applying the AED before starting compressions, or checking a pulse after a shock before resuming CPR) delays perfusion and is not consistent with current guidelines.",
  },
  {
    id: "aemt-cardiology-2074",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "build_list",
    clinicalJudgmentStep: "take_action",
    question:
      "Place the following steps for establishing a peripheral IV in the correct sequential order.",
    steps: [
      "Select and prepare the IV fluid and administration set, flushing air from the tubing",
      "Apply a tourniquet and select an appropriate vein",
      "Cleanse the insertion site with an antiseptic",
      "Insert the catheter and confirm blood flashback",
      "Release the tourniquet, connect tubing, and secure the catheter",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "The IV setup is prepared and flushed first, then a vein is selected with tourniquet application, the site is cleansed, the catheter is inserted with flashback confirmed, and finally the tourniquet is released and tubing secured. Performing steps out of order, such as cleansing after insertion or releasing the tourniquet before insertion, risks infection or a failed line.",
  },
  {
    id: "aemt-cardiology-2075",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "drag_drop",
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Place each cardiac rhythm finding into the correct category based on whether it is typically a shockable or non-shockable rhythm in cardiac arrest.",
    categories: [
      { id: "shockable", label: "Shockable Rhythm" },
      { id: "nonshockable", label: "Non-Shockable Rhythm" },
    ],
    items: [
      { id: "vf", label: "Ventricular fibrillation", correctCategory: "shockable" },
      { id: "pulseless-vt", label: "Pulseless ventricular tachycardia", correctCategory: "shockable" },
      { id: "asystole", label: "Asystole", correctCategory: "nonshockable" },
      { id: "pea", label: "Pulseless electrical activity", correctCategory: "nonshockable" },
    ],
    explanation:
      "Ventricular fibrillation and pulseless ventricular tachycardia are shockable rhythms because they have chaotic or organized electrical activity that can be reset by defibrillation. Asystole and PEA are non-shockable because there is either no organized activity to reset (asystole) or the rhythm is already organized but not producing a pulse due to a separate mechanical/metabolic problem (PEA), so a shock would not help.",
  },
  {
    id: "aemt-cardiology-2076",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "drag_drop",
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "Place each presentation into the shock category it best represents.",
    categories: [
      { id: "hypovolemic", label: "Hypovolemic Shock" },
      { id: "cardiogenic", label: "Cardiogenic Shock" },
      { id: "distributive", label: "Distributive Shock" },
    ],
    items: [
      { id: "trauma-bleed", label: "Trauma patient with uncontrolled external hemorrhage and pale, cool skin", correctCategory: "hypovolemic" },
      { id: "mi-jvd", label: "Chest pain patient with pulmonary crackles, JVD, and hypotension", correctCategory: "cardiogenic" },
      { id: "anaphylaxis", label: "Patient with hives, wheezing, and hypotension after a bee sting", correctCategory: "distributive" },
      { id: "sepsis", label: "Febrile patient with warm, flushed skin and hypotension", correctCategory: "distributive" },
      { id: "burns", label: "Burn patient with significant fluid loss and tachycardia", correctCategory: "hypovolemic" },
    ],
    explanation:
      "Hemorrhage and burns causing significant fluid loss represent hypovolemic shock; pump failure with pulmonary congestion and JVD represents cardiogenic shock; and anaphylaxis and sepsis, which both cause pathological vasodilation and vascular leak, represent distributive shock. Correctly categorizing shock etiology guides appropriate field management, particularly around fluid administration decisions.",
  },
  {
    id: "aemt-cardiology-2077",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "options_table",
    clinicalJudgmentStep: "analyze_cues",
    question:
      "For each rhythm finding, select whether the most likely rhythm is Sinus Tachycardia, Atrial Fibrillation, or Ventricular Tachycardia.",
    rows: [
      { id: "row1", finding: "Irregularly irregular rhythm, no discernible P waves, rate 140", options: ["Sinus Tachycardia", "Atrial Fibrillation", "Ventricular Tachycardia"], correctOptionIndex: 1 },
      { id: "row2", finding: "Regular narrow-complex rhythm, visible P wave before each QRS, rate 112", options: ["Sinus Tachycardia", "Atrial Fibrillation", "Ventricular Tachycardia"], correctOptionIndex: 0 },
      { id: "row3", finding: "Regular wide-complex rhythm, no visible P waves, rate 170, patient pulseless", options: ["Sinus Tachycardia", "Atrial Fibrillation", "Ventricular Tachycardia"], correctOptionIndex: 2 },
    ],
    explanation:
      "An irregularly irregular rhythm without P waves is atrial fibrillation; a regular narrow-complex rhythm with visible P waves is sinus tachycardia; and a regular wide-complex tachycardia, especially with loss of pulse, is ventricular tachycardia. Distinguishing these patterns at the recognition level is core AEMT cardiac monitoring competency.",
  },
  {
    id: "aemt-cardiology-2078",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "options_table",
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "For each clinical presentation, select the most likely shock etiology.",
    rows: [
      { id: "row1", finding: "Warm, flushed skin, fever, hypotension, tachycardia in a patient with a known infection", options: ["Hypovolemic", "Cardiogenic", "Septic (distributive)"], correctOptionIndex: 2 },
      { id: "row2", finding: "Cool, pale, diaphoretic skin, JVD, pulmonary crackles, chest pain history", options: ["Hypovolemic", "Cardiogenic", "Septic (distributive)"], correctOptionIndex: 1 },
      { id: "row3", finding: "Cool, pale skin, flat neck veins, history of significant GI bleeding", options: ["Hypovolemic", "Cardiogenic", "Septic (distributive)"], correctOptionIndex: 0 },
    ],
    explanation:
      "Warm skin with fever and infection points to septic (distributive) shock; JVD with pulmonary crackles and cardiac history points to cardiogenic shock; and flat neck veins with a bleeding source point to hypovolemic shock. Correctly distinguishing these etiologies is essential because management, especially fluid administration, differs significantly between them.",
  },
  {
    id: "aemt-cardiology-2079",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the pathophysiology of atrial fibrillation?",
    choices: [
      "Multiple chaotic electrical impulses in the atria prevent organized atrial contraction",
      "A single ectopic ventricular focus fires repetitively",
      "Complete absence of any electrical activity in the heart",
      "A structural blockage in the coronary arteries",
    ],
    answerIndex: 0,
    explanation:
      "Atrial fibrillation results from multiple chaotic reentrant electrical impulses in the atria, preventing organized atrial contraction and producing an irregular ventricular response. A single ventricular ectopic focus describes some ventricular dysrhythmias, absence of electrical activity describes asystole, and a coronary blockage describes ischemic disease, not the mechanism of AFib.",
  },
  {
    id: "aemt-cardiology-2080",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient with a history of atrial fibrillation reports sudden onset of slurred speech and right-sided weakness. This combination should raise concern for:",
    choices: [
      "An embolic stroke related to a clot originating in the fibrillating atria",
      "A simple case of fatigue",
      "A normal effect of the irregular heart rhythm alone",
      "Dehydration",
    ],
    answerIndex: 0,
    explanation:
      "Atrial fibrillation predisposes patients to clot formation in the atria, which can embolize and cause an ischemic stroke, explaining sudden focal neurological deficits. Fatigue, a normal rhythm effect, and dehydration do not explain sudden slurred speech and unilateral weakness, which are focal stroke findings.",
  },
  {
    id: "aemt-cardiology-2081",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which lead placement is standard for a basic 3-lead cardiac monitor used for rhythm recognition?",
    choices: [
      "Right arm, left arm, and left leg (or their torso equivalents)",
      "Only on the abdomen",
      "Only on the back",
      "Both wrists and both ankles simultaneously",
    ],
    answerIndex: 0,
    explanation:
      "A standard 3-lead monitor uses right arm, left arm, and left leg placement (or their torso equivalents) to generate a basic rhythm strip. Abdominal-only or back-only placement is not standard, and simultaneous wrist/ankle placement describes a different, more complex limb-lead configuration, not the basic 3-lead setup.",
  },
  {
    id: "aemt-cardiology-2082",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the most common cause of artifact on a cardiac monitor during patient movement or transport?",
    choices: [
      "Patient motion or loose electrode contact",
      "A true underlying cardiac dysrhythmia",
      "Excessively low ambient temperature",
      "Use of a 12-lead instead of 3-lead monitor",
    ],
    answerIndex: 0,
    explanation:
      "Patient motion, muscle tremor, or poor electrode contact are the most common causes of monitor artifact, especially during transport. A true dysrhythmia would not typically appear and disappear with movement alone, ambient temperature is not a primary cause, and lead configuration alone does not explain motion artifact.",
  },
  {
    id: "aemt-cardiology-2083",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "The cardiac monitor shows what appears to be an irregular, bizarre rhythm, but the patient is awake, talking, and has a strong radial pulse. What is the most appropriate initial action?",
    choices: [
      "Assess the patient directly and check lead/electrode contact before assuming a true dysrhythmia",
      "Immediately apply AED pads and prepare to shock",
      "Begin chest compressions immediately",
      "Disregard the patient assessment entirely and trust the monitor exclusively",
    ],
    answerIndex: 0,
    explanation:
      "Always treat the patient, not the monitor — an alert patient with a strong pulse contradicts a life-threatening dysrhythmia, so artifact or lead issues should be checked first. Applying AED pads or starting compressions on an alert, perfusing patient is inappropriate and potentially dangerous, and monitor findings should never override direct patient assessment.",
  },
  {
    id: "aemt-cardiology-2084",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following medications is commonly carried by patients for self-administration in known coronary artery disease and may be relevant to gather in a SAMPLE history?",
    choices: ["Prescribed sublingual nitroglycerin", "Inhaled albuterol", "Oral antibiotics", "Topical antifungal cream"],
    answerIndex: 0,
    explanation:
      "Patients with known coronary artery disease are often prescribed their own sublingual nitroglycerin for self-administered chest pain relief, which is relevant history to gather. Albuterol relates to respiratory conditions, antibiotics to infection, and antifungal cream to skin conditions, none of which are specific to cardiac history.",
  },
  {
    id: "aemt-cardiology-2085",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient took their own prescribed nitroglycerin twice with no relief before EMS arrival. If AEMT protocol allows up to 3 total doses including patient-administered doses, what should the AEMT do?",
    choices: [
      "Administer no further nitroglycerin since the maximum has effectively been reached, and reassess blood pressure and pain per protocol",
      "Administer 3 additional doses regardless of the prior doses taken",
      "Automatically call for cardioversion",
      "Ignore the patient's prior medication history entirely",
    ],
    answerIndex: 0,
    explanation:
      "If the protocol's total dose limit includes patient-administered doses, the AEMT should account for those already taken rather than exceeding the maximum, while still reassessing the patient's status and blood pressure. Administering additional doses without regard to the prior count could exceed safe limits, cardioversion is unrelated and outside AEMT scope, and disregarding prior medication history is unsafe practice.",
  },
  {
    id: "aemt-cardiology-2086",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following is the correct route of administration for standard field nitroglycerin tablets or spray?",
    choices: ["Sublingual", "Intramuscular", "Intraosseous", "Oral (swallowed)"],
    answerIndex: 0,
    explanation:
      "Field nitroglycerin is administered sublingually (tablet or spray) for rapid absorption through the oral mucosa. It is not given intramuscularly, intraosseously, or swallowed, as those routes would not provide the same rapid onset needed for acute chest pain relief.",
  },
  {
    id: "aemt-cardiology-2087",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A patient with suspected right ventricular infarction (inferior MI with right-sided involvement) is at increased risk of which complication if given nitroglycerin?",
    choices: [
      "Severe hypotension due to preload dependence",
      "Hypertensive crisis",
      "Immediate resolution of all symptoms",
      "Bradycardia is impossible in this population",
    ],
    answerIndex: 0,
    explanation:
      "Right ventricular infarctions are highly preload-dependent, so nitroglycerin's preload-reducing effect can cause severe, profound hypotension in these patients. It does not cause a hypertensive crisis, does not guarantee symptom resolution, and bradycardia can still occur in this population from other mechanisms such as vagal stimulation.",
  },
  {
    id: "aemt-cardiology-2088",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A patient presents with chest pain and a heart rate of 45 bpm on the monitor along with hypotension. Considering this bradycardia, which additional caution applies to nitroglycerin administration?",
    choices: [
      "Nitroglycerin should be used cautiously or withheld, as it may worsen hypotension in the setting of bradycardia",
      "Nitroglycerin is safe to give without any additional considerations",
      "Nitroglycerin will correct the bradycardia",
      "Bradycardia has no bearing on nitroglycerin safety",
    ],
    answerIndex: 0,
    explanation:
      "Nitroglycerin's hypotensive effect can be compounded by bradycardia-related low cardiac output, so caution or withholding is warranted per protocol in this setting. It does not correct bradycardia, and stating there are no additional considerations or no bearing ignores this important interaction.",
  },
  {
    id: "aemt-cardiology-2089",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "After administering sublingual nitroglycerin, what should the AEMT reassess before considering an additional dose?",
    choices: [
      "Blood pressure and pain level",
      "Only the patient's skin color",
      "Only the respiratory rate",
      "No reassessment is needed before repeat dosing",
    ],
    answerIndex: 0,
    explanation:
      "Blood pressure must be reassessed before each additional nitroglycerin dose to ensure the patient remains within safe parameters, along with reassessing pain relief. Skin color and respiratory rate alone are insufficient without a blood pressure check, and skipping reassessment before repeat dosing is unsafe practice.",
  },
  {
    id: "aemt-cardiology-2090",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the maximum number of nitroglycerin doses typically allowed under standard field protocols (absent specific medical direction otherwise)?",
    choices: ["1 dose only", "Up to 3 doses total, reassessing blood pressure between each", "Unlimited doses as needed", "10 doses"],
    answerIndex: 1,
    explanation:
      "Most standard protocols allow up to 3 total doses of nitroglycerin, with blood pressure reassessment between each dose. A single dose limit is too restrictive for typical protocols, and unlimited or 10 doses would risk dangerous hypotension without appropriate limits.",
  },
  {
    id: "aemt-cardiology-2091",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient reports sudden 'tearing' or 'ripping' chest and back pain radiating between the shoulder blades, with unequal blood pressures in each arm. This presentation raises concern for:",
    choices: [
      "Aortic dissection",
      "Simple muscle strain",
      "Stable angina",
      "Panic attack",
    ],
    answerIndex: 0,
    explanation:
      "Tearing/ripping pain radiating to the back with unequal bilateral blood pressures is a classic presentation of aortic dissection, a critical emergency requiring rapid transport. Muscle strain, stable angina, and panic attack do not typically produce this specific combination of tearing pain and unequal limb pressures.",
  },
  {
    id: "aemt-cardiology-2092",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT strongly suspects aortic dissection based on the patient's presentation. Which treatment consideration is most important?",
    choices: [
      "Aspirin and nitroglycerin should be used cautiously or avoided per protocol/medical direction, given the different underlying pathology from typical ACS",
      "Administer standard-dose aspirin and nitroglycerin exactly as for typical ACS with no special consideration",
      "Perform immediate defibrillation",
      "No special treatment considerations are needed",
    ],
    answerIndex: 0,
    explanation:
      "Because aortic dissection has a different underlying mechanism (a tear in the aortic wall) than typical coronary ACS, standard ACS therapies like aspirin may not be appropriate and should be guided cautiously by protocol/medical direction rather than reflexively applied. Defibrillation is not indicated for a perfusing patient with pain, and asserting no special considerations are needed ignores the distinct risk profile of dissection.",
  },
  {
    id: "aemt-cardiology-2093",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes pulsus paradoxus and its clinical significance?",
    choices: [
      "An exaggerated drop in systolic blood pressure during inspiration, associated with conditions like cardiac tamponade",
      "A normal finding with no clinical significance",
      "An increase in heart rate during exhalation only",
      "A sign specific to hypertensive emergencies",
    ],
    answerIndex: 0,
    explanation:
      "Pulsus paradoxus is an exaggerated drop in systolic blood pressure (typically greater than 10 mmHg) during inspiration and is associated with conditions such as cardiac tamponade or severe asthma. It is not a normal, insignificant finding, is not simply a heart rate change with exhalation, and is not specific to hypertensive emergencies.",
  },
  {
    id: "aemt-cardiology-2094",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Beck's triad, associated with cardiac tamponade, includes which combination of findings?",
    choices: [
      "Jugular venous distention, muffled heart sounds, and hypotension",
      "Fever, cough, and wheezing",
      "Bradycardia, hypertension, and irregular respirations",
      "Chest pain, diaphoresis, and nausea",
    ],
    answerIndex: 0,
    explanation:
      "Beck's triad classically consists of jugular venous distention, muffled/distant heart sounds, and hypotension, suggesting cardiac tamponade. Fever/cough/wheezing suggests a respiratory infection process, bradycardia/hypertension/irregular respirations describes Cushing's triad (elevated intracranial pressure), and chest pain/diaphoresis/nausea are general ACS symptoms, not the specific tamponade triad.",
  },
  {
    id: "aemt-cardiology-2095",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A trauma patient has jugular venous distention, muffled heart sounds, and a narrowing pulse pressure after blunt chest trauma. This is most consistent with:",
    choices: ["Cardiac tamponade", "Simple hypovolemic shock from external bleeding", "Uncomplicated rib fracture", "Anxiety reaction"],
    answerIndex: 0,
    explanation:
      "JVD, muffled heart sounds, and narrowing pulse pressure following blunt chest trauma are classic for cardiac tamponade, a reversible cause of shock/arrest requiring rapid recognition and transport. Simple hypovolemic shock typically shows flat neck veins, an uncomplicated rib fracture would not cause this triad, and anxiety does not explain these objective findings.",
  },
  {
    id: "aemt-cardiology-2096",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A patient's radial pulse is palpable but their carotid pulse feels stronger and more regular. What is the most likely explanation for assessing both sites in a hypotensive patient?",
    choices: [
      "Central pulses (like carotid) may remain palpable after peripheral pulses are lost as blood pressure drops",
      "The radial pulse is always more reliable than the carotid",
      "Checking multiple pulse sites provides no additional information",
      "Peripheral pulses always disappear before central pulses regardless of blood pressure",
    ],
    answerIndex: 0,
    explanation:
      "As blood pressure and perfusion drop, peripheral pulses (radial) tend to become weak or disappear before central pulses (carotid, femoral), so central pulses can remain palpable longer. This makes checking both informative, not useless, and shows the general rule (not an absolute) that peripheral pulses weaken first, which is the opposite of the incorrect option stated.",
  },
  {
    id: "aemt-cardiology-2097",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT is preparing to transport a stable chest pain patient. Which position is generally most comfortable and appropriate for a conscious cardiac patient without respiratory distress?",
    choices: [
      "Position of comfort, often semi-Fowler's, unless contraindicated",
      "Strict supine position regardless of comfort",
      "Trendelenburg position with legs elevated above the head",
      "Prone position",
    ],
    answerIndex: 0,
    explanation:
      "A conscious cardiac patient is generally transported in a position of comfort, often semi-Fowler's, which can ease cardiac workload and breathing. Forcing a strict supine or prone position may increase discomfort, and Trendelenburg (legs elevated above the head) is not appropriate for a cardiac patient and can worsen cardiac workload.",
  },
  {
    id: "aemt-cardiology-2098",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A hypotensive shock patient with no signs of pulmonary edema or cardiac cause is being transported. Which positioning consideration is generally appropriate if protocol allows and no contraindications exist?",
    choices: [
      "Passive leg raise or supine positioning to support venous return, avoiding full Trendelenburg",
      "Sitting fully upright at 90 degrees",
      "Prone positioning",
      "Position has no effect on venous return or perfusion",
    ],
    answerIndex: 0,
    explanation:
      "For non-cardiogenic shock without contraindication, supine positioning or a passive leg raise can support venous return, though full Trendelenburg is generally discouraged due to limited benefit and potential complications. Sitting fully upright would reduce venous return in a hypotensive patient, prone positioning is not appropriate, and position does affect venous return and perfusion.",
  },
  {
    id: "aemt-cardiology-2099",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best defines 'pulse pressure'?",
    choices: [
      "The difference between systolic and diastolic blood pressure",
      "The sum of systolic and diastolic blood pressure",
      "The heart rate multiplied by two",
      "The average of three consecutive blood pressure readings",
    ],
    answerIndex: 0,
    explanation:
      "Pulse pressure is calculated as systolic blood pressure minus diastolic blood pressure. It is not the sum of the two values, unrelated to heart rate multiplication, and not defined as an average of repeated readings.",
  },
  {
    id: "aemt-cardiology-2100",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient's blood pressure is 100/86 mmHg. This narrow pulse pressure of 14 mmHg is most consistent with:",
    choices: [
      "Poor stroke volume/early or compensating shock",
      "A widened pulse pressure suggesting rising intracranial pressure",
      "A completely normal finding requiring no further evaluation",
      "Severe hypertension",
    ],
    answerIndex: 0,
    explanation:
      "A narrow pulse pressure like 14 mmHg suggests reduced stroke volume and vasoconstriction, often seen in compensating shock states. This is the opposite of a widened pulse pressure (associated with rising intracranial pressure), is not simply normal given the narrow value, and the blood pressure shown is not consistent with severe hypertension.",
  },
  {
    id: "aemt-cardiology-2101",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What does capillary refill time assess in a patient assessment?",
    choices: [
      "Peripheral perfusion status",
      "Blood glucose level",
      "Level of consciousness",
      "Airway patency",
    ],
    answerIndex: 0,
    explanation:
      "Capillary refill time is a quick assessment of peripheral perfusion, with delayed refill suggesting poor perfusion such as in shock. It does not measure blood glucose, level of consciousness, or airway patency, which are assessed through other specific means.",
  },
  {
    id: "aemt-cardiology-2102",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient's capillary refill time is greater than 4 seconds with cool, mottled extremities. This finding suggests:",
    choices: [
      "Adequate peripheral perfusion",
      "Poor peripheral perfusion, consistent with shock",
      "A normal finding in all adult patients",
      "Hyperthermia",
    ],
    answerIndex: 1,
    explanation:
      "Delayed capillary refill (over 2-3 seconds) with cool, mottled skin indicates poor peripheral perfusion, a finding associated with shock states. This is not adequate perfusion, is not a universally normal finding, and mottled cool skin is inconsistent with hyperthermia, which typically presents with warm skin.",
  },
  {
    id: "aemt-cardiology-2103",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "In infants and young children, capillary refill and skin findings are especially important because:",
    choices: [
      "Children can maintain a normal blood pressure until late in shock due to strong compensatory mechanisms",
      "Children never develop shock",
      "Blood pressure is the earliest and most reliable indicator of shock in children",
      "Capillary refill is not useful in pediatric assessment",
    ],
    answerIndex: 0,
    explanation:
      "Pediatric patients have strong compensatory mechanisms and can maintain a normal blood pressure until shock is far advanced, so other signs like capillary refill and skin condition are critical early indicators. Children absolutely can develop shock, blood pressure is a late (not early) indicator in children, and capillary refill remains a useful pediatric assessment tool.",
  },
  {
    id: "aemt-cardiology-2104",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following IV fluids is isotonic and most commonly used for volume resuscitation in the prehospital setting?",
    choices: ["0.9% Normal Saline", "0.45% Half-Normal Saline", "5% Dextrose in Water (D5W)", "3% Hypertonic Saline"],
    answerIndex: 0,
    explanation:
      "0.9% Normal Saline is isotonic and the standard prehospital crystalloid for volume resuscitation. Half-normal saline is hypotonic, D5W behaves as hypotonic once the dextrose is metabolized, and hypertonic saline is a concentrated solution reserved for specific indications, not routine resuscitation.",
  },
  {
    id: "aemt-cardiology-2105",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Lactated Ringer's solution is an isotonic crystalloid sometimes used in the prehospital setting. Compared to normal saline, it:",
    choices: [
      "Contains additional electrolytes such as potassium, calcium, and lactate",
      "Contains only sterile water with no electrolytes",
      "Is a hypertonic solution used for cerebral edema",
      "Cannot be used for volume resuscitation",
    ],
    answerIndex: 0,
    explanation:
      "Lactated Ringer's is an isotonic crystalloid that, unlike plain normal saline, contains additional electrolytes such as potassium, calcium, and lactate that more closely resemble plasma composition. It is not simply sterile water, is not a hypertonic solution for cerebral edema, and is used for volume resuscitation much like normal saline.",
  },
  {
    id: "aemt-cardiology-2106",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT must choose an IV administration set for rapid fluid resuscitation of a hypotensive trauma patient. Which set is most appropriate?",
    choices: [
      "A macrodrip administration set",
      "A microdrip (60 gtt/mL) administration set",
      "A blood administration set is required for all crystalloid fluids",
      "The type of administration set makes no difference for flow rate",
    ],
    answerIndex: 0,
    explanation:
      "A macrodrip set delivers larger drops per mL and allows faster fluid delivery, making it appropriate for rapid resuscitation. A microdrip set is used for more precise, slower infusions (e.g., medication drips), a blood administration set is not required for plain crystalloid, and administration set type does affect achievable flow rate.",
  },
  {
    id: "aemt-cardiology-2107",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A macrodrip IV administration set commonly delivers how many drops per milliliter?",
    choices: ["10, 15, or 20 gtt/mL depending on the set", "60 gtt/mL", "100 gtt/mL", "1 gtt/mL"],
    answerIndex: 0,
    explanation:
      "Macrodrip sets commonly come in 10, 15, or 20 gtt/mL calibrations depending on the manufacturer. 60 gtt/mL describes a microdrip set, and 100 or 1 gtt/mL are not standard macrodrip calibrations.",
  },
  {
    id: "aemt-cardiology-2108",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT needs to deliver 500 mL of normal saline over 30 minutes using a 15 gtt/mL administration set. What is the approximate drip rate in drops per minute?",
    choices: ["25 gtt/min", "250 gtt/min", "15 gtt/min", "500 gtt/min"],
    answerIndex: 0,
    explanation:
      "Using the formula (volume x drop factor) / time in minutes: (500 mL x 15 gtt/mL) / 30 min = 250/30 ≈ 25 gtt/min. The other values do not correctly apply this standard drip rate calculation to the given volume, drop factor, and time.",
  },
  {
    id: "aemt-cardiology-2109",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "After starting an IV, the AEMT notices localized swelling, coolness, and pain at the insertion site with no free flow of fluid. This is most consistent with:",
    choices: [
      "Infiltration of the IV into surrounding tissue",
      "Successful IV placement with normal function",
      "A normal expected finding after IV insertion",
      "Phlebitis from long-term catheter use",
    ],
    answerIndex: 0,
    explanation:
      "Swelling, coolness, pain, and lack of free flow at the site are classic signs of infiltration, where fluid is leaking into surrounding tissue instead of the vein. This is not a sign of successful placement or a normal finding, and phlebitis (vein inflammation, typically with redness/warmth along the vein) presents differently and is more associated with prolonged catheter dwell time, not acute insertion findings.",
  },
  {
    id: "aemt-cardiology-2110",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT identifies signs of IV infiltration during an infusion. What is the most appropriate action?",
    choices: [
      "Stop the infusion, remove the catheter, and apply pressure/dressing, then reattempt at a different site",
      "Increase the flow rate to flush the infiltration",
      "Leave the IV running and reassess again in one hour",
      "Elevate the extremity and continue infusing at the same rate",
    ],
    answerIndex: 0,
    explanation:
      "Infiltration requires stopping the infusion, removing the catheter, and attempting a new site elsewhere to avoid worsening tissue injury. Increasing the flow rate would worsen the infiltration, and continuing the infusion at the same site (with or without elevation) allows further fluid to leak into the tissue.",
  },
  {
    id: "aemt-cardiology-2111",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which sign at an IV site suggests a possible air embolism has occurred during infusion, requiring immediate attention?",
    choices: [
      "Sudden shortness of breath, chest pain, and hypotension during infusion",
      "Mild bruising at the site",
      "Slow but steady fluid flow",
      "A properly secured catheter with no complaints",
    ],
    answerIndex: 0,
    explanation:
      "Sudden respiratory distress, chest pain, and hypotension during or after infusion can indicate an air embolism, a rare but serious complication requiring immediate intervention. Mild bruising, normal steady flow, and a properly secured catheter without complaints are not concerning findings for this complication.",
  },
  {
    id: "aemt-cardiology-2112",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following is a contraindication to IO needle insertion at a specific site?",
    choices: [
      "A fracture at or proximal to the intended insertion site",
      "Patient age over 65",
      "The presence of a peripheral IV elsewhere on the body",
      "Mild patient anxiety",
    ],
    answerIndex: 0,
    explanation:
      "A fracture at or proximal to the intended IO site is a contraindication because fluid could extravasate into surrounding tissue through the fracture. Advanced age, having a separate peripheral IV, and mild anxiety are not contraindications to IO placement at an otherwise appropriate site.",
  },
  {
    id: "aemt-cardiology-2113",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following is also a contraindication to IO insertion at a given site?",
    choices: [
      "Prior IO attempt or infection at that same site within the last 24-48 hours",
      "The patient being in cardiac arrest",
      "The patient being unresponsive",
      "The patient having intact skin at the site",
    ],
    answerIndex: 0,
    explanation:
      "A recent IO attempt or infection at the same site is a contraindication due to risk of extravasation or spreading infection, so an alternate site should be chosen. Being in cardiac arrest or unresponsive does not contraindicate IO use (these are often indications), and intact skin at the site is actually a requirement, not a contraindication.",
  },
  {
    id: "aemt-cardiology-2114",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An IO line has been established in a conscious patient. Prior to infusing fluid, many protocols recommend administering which medication through the line to reduce infusion pain?",
    choices: [
      "A slow lidocaine flush per protocol, if the patient is responsive to pain",
      "Additional epinephrine",
      "A second dose of nitroglycerin",
      "Atropine",
    ],
    answerIndex: 0,
    explanation:
      "In a responsive patient, a slow preservative-free lidocaine flush through the IO is commonly used per protocol to reduce the significant pain associated with IO infusion before fluids are run. Epinephrine, nitroglycerin, and atropine are not used for this purpose and are unrelated to reducing IO infusion discomfort.",
  },
  {
    id: "aemt-cardiology-2115",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Compared to gravity alone, why is a pressure infusion bag or pump often used for IO fluid administration?",
    choices: [
      "The intraosseous space has higher resistance to flow than a vein, requiring added pressure for adequate flow rates",
      "IO needles are wider than standard IV catheters",
      "Gravity cannot flow fluid through any IO device under any circumstance",
      "Pressure bags are required by law for every IV as well",
    ],
    answerIndex: 0,
    explanation:
      "The bone marrow space has more resistance to flow than a vein, so pressure (via a pressure bag, syringe push, or pump) is often needed to achieve adequate infusion rates through an IO. IO needles are not necessarily wider than IV catheters, gravity can still provide some flow (just often inadequate), and pressure bags are not a legal requirement for standard peripheral IVs.",
  },
  {
    id: "aemt-cardiology-2116",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "After IO fluid administration begins, the AEMT notices the calf is becoming increasingly swollen, tense, and firm compared to baseline. This is most concerning for:",
    choices: [
      "Extravasation of fluid into the surrounding tissue, with risk of compartment syndrome",
      "A normal and expected finding with IO use",
      "Successful, uncomplicated IO infusion",
      "An allergic reaction to the IO device",
    ],
    answerIndex: 0,
    explanation:
      "Progressive swelling, tension, and firmness after IO fluid administration suggests extravasation into the surrounding soft tissue, which can progress to compartment syndrome if unrecognized and untreated. This is not a normal or successful finding, and it does not represent an allergic reaction, which would present differently (e.g., hives, angioedema).",
  },
  {
    id: "aemt-cardiology-2117",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which patient population commonly uses the proximal humerus as an alternative IO insertion site?",
    choices: [
      "Adult patients when tibial access is not feasible or a faster flow rate is needed",
      "Only infants under 1 year of age",
      "Only patients with lower extremity amputations",
      "The proximal humerus is never used for IO access",
    ],
    answerIndex: 0,
    explanation:
      "The proximal humerus is a commonly used adult IO site, particularly useful when faster flow rates are needed or tibial sites are not accessible. It is not restricted to infants, is not exclusive to amputees, and is a well-established, frequently used site, not one that is never used.",
  },
  {
    id: "aemt-cardiology-2118",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A patient needs rapid fluid resuscitation during active resuscitation, and peripheral veins are inaccessible due to severe hypovolemia. Which access route is generally preferred at the AEMT level?",
    choices: [
      "Intraosseous access",
      "Awaiting hospital arrival with no vascular access attempted",
      "Subcutaneous injection of fluids",
      "Intramuscular fluid administration",
    ],
    answerIndex: 0,
    explanation:
      "IO access is the preferred AEMT-scope alternative when peripheral IV access is not feasible due to severe hypovolemia or difficult veins, allowing rapid fluid and medication delivery. Withholding all access delays critical treatment, and subcutaneous or intramuscular routes are not appropriate for rapid volume resuscitation.",
  },
  {
    id: "aemt-cardiology-2119",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "During cardiac arrest management, what is the primary purpose of administering IV or IO fluids if the patient shows signs of hypovolemia as a suspected cause?",
    choices: [
      "To address a reversible cause (hypovolemia) contributing to the arrest",
      "To directly restart the heart's electrical activity",
      "To replace the need for chest compressions",
      "To treat suspected infection",
    ],
    answerIndex: 0,
    explanation:
      "Fluid administration in arrest targets treatable/reversible causes such as hypovolemia, which may improve the chance of ROSC. Fluids do not directly restart electrical activity (that's the role of defibrillation for shockable rhythms), cannot replace compressions, and are not intended to treat infection acutely in the field.",
  },
  {
    id: "aemt-cardiology-2120",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A cardiac arrest patient's IO line is being used to administer medications, but the AEMT observes no blood or marrow on aspiration and fluid flushes with visible subcutaneous swelling. What should the AEMT conclude?",
    choices: [
      "The IO is likely dislodged or malpositioned and should not be used further",
      "The IO is functioning normally and should continue to be used",
      "This is an expected finding and no action is needed",
      "The swelling indicates successful medullary infusion",
    ],
    answerIndex: 0,
    explanation:
      "Visible subcutaneous swelling with flushing strongly suggests the needle has become dislodged from the medullary space and is infiltrating into soft tissue; it should not be used further. This is not normal functioning, not an expected benign finding, and swelling indicates extravasation, not successful medullary infusion.",
  },
  {
    id: "aemt-cardiology-2121",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "In the 'Hs and Ts' of reversible cardiac arrest causes, what does the 'T' for 'Tamponade' refer to?",
    choices: [
      "Cardiac tamponade, in which fluid or blood compresses the heart and prevents adequate filling",
      "A tension pneumothorax collapsing the lung",
      "Toxic exposure to a medication overdose",
      "Thrombosis of a coronary artery",
    ],
    answerIndex: 0,
    explanation:
      "Cardiac tamponade refers to fluid or blood accumulating in the pericardial sac, compressing the heart and preventing adequate ventricular filling, which can cause PEA or arrest. Tension pneumothorax, toxins, and thrombosis are separate distinct items within the Hs and Ts list, not what 'Tamponade' specifically refers to.",
  },
  {
    id: "aemt-cardiology-2122",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient in cardiac arrest has a history of opioid overdose reported by bystanders. Which reversible cause from the Hs and Ts should be strongly considered?",
    choices: ["Toxins", "Tension pneumothorax", "Tamponade", "Thrombosis (pulmonary)"],
    answerIndex: 0,
    explanation:
      "A reported opioid overdose points directly to toxins as the likely reversible cause of the arrest, which may prompt consideration of naloxone if within scope/protocol alongside standard resuscitation. Tension pneumothorax, tamponade, and pulmonary thrombosis are not suggested by this specific history of overdose.",
  },
  {
    id: "aemt-cardiology-2123",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'hyperkalemia' as a reversible cause of cardiac arrest?",
    choices: [
      "Elevated blood potassium levels that can cause life-threatening dysrhythmias",
      "Elevated blood glucose levels",
      "Low blood oxygen levels",
      "Elevated body temperature",
    ],
    answerIndex: 0,
    explanation:
      "Hyperkalemia refers to elevated blood potassium, which can cause dangerous cardiac dysrhythmias and arrest, particularly in dialysis or renal failure patients. Elevated glucose, low oxygen, and elevated temperature describe different conditions entirely (hyperglycemia, hypoxia, and hyperthermia, respectively), not hyperkalemia.",
  },
  {
    id: "aemt-cardiology-2124",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A dialysis patient who missed their last scheduled treatment goes into cardiac arrest. Which reversible cause should be strongly suspected given this history?",
    choices: ["Hyperkalemia", "Hypoglycemia", "Hypothermia", "Tension pneumothorax"],
    answerIndex: 0,
    explanation:
      "Missed dialysis is strongly associated with dangerous potassium buildup (hyperkalemia), a well-recognized cause of cardiac arrest in this population. Hypoglycemia, hypothermia, and tension pneumothorax are not specifically suggested by a missed dialysis history.",
  },
  {
    id: "aemt-cardiology-2125",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A patient found in cold water for an extended period and now in cardiac arrest should raise suspicion for which reversible cause, which may also affect resuscitation duration decisions?",
    choices: ["Hypothermia", "Hyperthermia", "Hyperkalemia", "Tamponade"],
    answerIndex: 0,
    explanation:
      "Prolonged cold water exposure raises strong suspicion for hypothermia as a contributing or causative factor in the arrest, and severe hypothermia can also affect prognosis and resuscitation decisions (e.g., 'not dead until warm and dead'). Hyperthermia, hyperkalemia, and tamponade are not suggested by this cold-water exposure history.",
  },
  {
    id: "aemt-cardiology-2126",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A patient in cardiac arrest is found to be severely hypothermic. How should resuscitation efforts typically be modified, per general guidance?",
    choices: [
      "Continue resuscitation efforts longer than usual, since hypothermia can be protective and resuscitation should not be stopped based on standard criteria alone",
      "Stop resuscitation immediately since hypothermia is always fatal",
      "Withhold CPR entirely because hypothermia makes CPR ineffective",
      "Treat exactly the same as a normothermic arrest with no modifications",
    ],
    answerIndex: 0,
    explanation:
      "Severe hypothermia can have a protective, metabolism-slowing effect on the brain and other organs, so resuscitation is often continued longer than usual, following the principle that a patient is not considered dead until warmed (per medical direction/protocol). Stopping immediately or withholding CPR is inappropriate, and treating it identically to a normothermic arrest ignores important modifications like gentle handling and rewarming considerations.",
  },
  {
    id: "aemt-cardiology-2127",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Rough handling of a severely hypothermic cardiac arrest patient is discouraged primarily because it can:",
    choices: [
      "Trigger a lethal dysrhythmia such as ventricular fibrillation",
      "Cause immediate return of spontaneous circulation",
      "Improve peripheral circulation",
      "Have no clinical significance",
    ],
    answerIndex: 0,
    explanation:
      "A hypothermic, irritable myocardium is prone to triggering ventricular fibrillation with rough handling or excessive movement, so gentle handling is emphasized. Rough handling does not cause ROSC or improve circulation, and it is clinically significant, not insignificant.",
  },
  {
    id: "aemt-cardiology-2128",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "In the Hs and Ts, 'Hydrogen ion' most directly refers to which underlying problem?",
    choices: ["Acidosis", "Alkalosis", "Hyperglycemia", "Hypoglycemia"],
    answerIndex: 0,
    explanation:
      "'Hydrogen ion' refers to acidosis (excess hydrogen ions lowering blood pH), which can impair cardiac function and contribute to arrest. Alkalosis is the opposite condition, and hyperglycemia/hypoglycemia refer to blood glucose abnormalities, not hydrogen ion/pH disturbances.",
  },
  {
    id: "aemt-cardiology-2129",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A trauma patient develops sudden hypotension, absent breath sounds on one side, jugular venous distention, and tracheal deviation. This presentation is most consistent with:",
    choices: ["Tension pneumothorax", "Simple pneumothorax", "Cardiac tamponade", "Uncomplicated hemothorax"],
    answerIndex: 0,
    explanation:
      "Absent unilateral breath sounds with JVD and tracheal deviation in a hypotensive trauma patient is the classic presentation of tension pneumothorax, a reversible/treatable cause of shock and arrest. A simple pneumothorax and uncomplicated hemothorax do not typically cause tracheal deviation or this degree of hemodynamic compromise, and cardiac tamponade would not cause absent unilateral breath sounds.",
  },
  {
    id: "aemt-cardiology-2130",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A patient with a suspected tension pneumothorax is in cardiac arrest. Which action is most important to recognize as needed, even if performing it may be outside strict AEMT scope in some jurisdictions?",
    choices: [
      "Needle decompression, which may require rapid ALS intercept if outside local AEMT scope",
      "Immediate defibrillation regardless of the underlying rhythm",
      "Administration of nitroglycerin",
      "Withholding all further intervention since nothing can be done",
    ],
    answerIndex: 0,
    explanation:
      "Tension pneumothorax causing arrest is reversible with needle decompression, a skill that in many systems is Paramedic-level; recognizing the need and expediting ALS intercept or transport is a key AEMT action. Defibrillation is not indicated unless the rhythm is shockable, nitroglycerin is not indicated for this mechanism, and assuming nothing can be done ignores the reversible nature of this cause.",
  },
  {
    id: "aemt-cardiology-2131",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Pediatric cardiac arrest most commonly results from which underlying process, in contrast to adult cardiac arrest which is more often primarily cardiac?",
    choices: [
      "Respiratory failure or hypoxia progressing to arrest",
      "Primary coronary artery disease",
      "Atrial fibrillation with rapid ventricular response",
      "Chronic hypertension",
    ],
    answerIndex: 0,
    explanation:
      "Pediatric arrest is most commonly secondary to respiratory failure/hypoxia rather than a primary cardiac event, which is why early, aggressive airway and ventilation management is emphasized in children. Coronary artery disease, atrial fibrillation, and chronic hypertension are adult cardiac conditions and not the typical pediatric arrest etiology.",
  },
  {
    id: "aemt-cardiology-2132",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "Given that pediatric arrest is often respiratory in origin, what is a key priority in managing a pediatric cardiac arrest?",
    choices: [
      "Early and effective oxygenation/ventilation alongside high-quality compressions",
      "Skipping ventilations entirely and performing compression-only CPR",
      "Prioritizing IV access before any airway management",
      "Delaying compressions until an advanced airway is placed",
    ],
    answerIndex: 0,
    explanation:
      "Because pediatric arrest often stems from a respiratory cause, effective oxygenation and ventilation alongside high-quality compressions are prioritized, unlike compression-only approaches sometimes used in bystander adult CPR. Skipping ventilations, prioritizing IV access over airway, or delaying compressions for an advanced airway would all be inappropriate in this population.",
  },
  {
    id: "aemt-cardiology-2133",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "For infant CPR (under 1 year), two-rescuer chest compressions are typically performed using which technique?",
    choices: [
      "Two-thumb encircling hands technique",
      "One-handed compressions over the sternum with full force",
      "Compressions over the abdomen",
      "Using an adult-sized AED pad placement identical to adults with no modification",
    ],
    answerIndex: 0,
    explanation:
      "The two-thumb encircling hands technique is recommended for two-rescuer infant CPR, providing effective depth and control. One-handed full-force adult-style compressions and abdominal compressions are inappropriate and dangerous for infants, and infant/pediatric AED pad placement (and sometimes an attenuator) differs from standard adult placement when available.",
  },
  {
    id: "aemt-cardiology-2134",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "When using an AED on a child under 8 years old or under 55 lbs (25 kg), what is preferred if available?",
    choices: [
      "Pediatric-specific pads or an attenuator system, if available",
      "Adult pads applied without any modification is always preferred over pediatric pads",
      "AEDs should never be used on children under any circumstances",
      "Only manual defibrillation may ever be used, never an AED, in this age group",
    ],
    answerIndex: 0,
    explanation:
      "Pediatric pads or an attenuator (dose-reducing) system are preferred for young children when available, to deliver an appropriately reduced energy dose. If pediatric pads are unavailable, adult pads may still be used per protocol, but they are not preferred over pediatric-specific equipment, AEDs can and should be used on children in arrest with a shockable rhythm, and manual-only defibrillation is not an absolute requirement in this age group.",
  },
  {
    id: "aemt-cardiology-2135",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "Pediatric AED pads are not available for a 4-year-old child in cardiac arrest with a shockable rhythm identified by the AED. What should the AEMT do?",
    choices: [
      "Use adult pads, ensuring they do not touch each other, positioned appropriately (e.g., anterior-posterior if needed for a small chest)",
      "Withhold defibrillation entirely since pediatric pads are unavailable",
      "Wait for ALS to arrive before applying any pads",
      "Cut the adult pads in half to create makeshift pediatric pads",
    ],
    answerIndex: 0,
    explanation:
      "When pediatric pads or an attenuator are unavailable, adult pads should still be used (ensuring the pads themselves do not contact each other, using anterior-posterior placement on a small chest if needed) rather than withholding a potentially life-saving shock. Withholding defibrillation or waiting for ALS delays critical care for a shockable rhythm, and cutting pads is not a recommended or safe practice.",
  },
  {
    id: "aemt-cardiology-2136",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'orthostatic hypotension' and its typical assessment?",
    choices: [
      "A significant drop in blood pressure with a positional change from lying/sitting to standing",
      "A permanently elevated blood pressure regardless of position",
      "An irregular heart rhythm unrelated to position",
      "A finding only relevant in cardiac arrest patients",
    ],
    answerIndex: 0,
    explanation:
      "Orthostatic hypotension refers to a significant blood pressure drop (and often symptoms like dizziness) when moving from a lying or sitting position to standing, useful in assessing volume status. It is not a permanently elevated pressure, not primarily about rhythm, and it is assessed in conscious ambulatory patients, not cardiac arrest patients.",
  },
  {
    id: "aemt-cardiology-2137",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient reports feeling lightheaded and dizzy only when standing up, with a notable heart rate increase and blood pressure drop upon standing compared to sitting. This finding suggests:",
    choices: [
      "Possible volume depletion or dehydration causing orthostatic changes",
      "A normal finding with no clinical significance",
      "An acute myocardial infarction confirmed by this finding alone",
      "Cardiac tamponade",
    ],
    answerIndex: 0,
    explanation:
      "A significant heart rate increase and blood pressure drop specifically with standing suggests orthostatic changes often related to volume depletion or dehydration. This is not a clinically insignificant finding, does not confirm an MI on its own, and does not specifically indicate cardiac tamponade, which has a different, distinct symptom pattern.",
  },
  {
    id: "aemt-cardiology-2138",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following is a common cause of syncope (transient loss of consciousness) related to a cardiac cause?",
    choices: [
      "A significant dysrhythmia causing temporarily inadequate cerebral perfusion",
      "A simple ankle sprain",
      "Mild seasonal allergies",
      "A superficial laceration",
    ],
    answerIndex: 0,
    explanation:
      "Cardiac syncope often results from a dysrhythmia (very fast, very slow, or otherwise inadequate rhythm) causing a temporary drop in cerebral perfusion and loss of consciousness. An ankle sprain, allergies, and a superficial laceration are unrelated to cardiac syncope.",
  },
  {
    id: "aemt-cardiology-2139",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient reports a brief episode of loss of consciousness while exercising, with full recovery within seconds. This description should raise concern for:",
    choices: [
      "A possible cardiac dysrhythmia or structural cardiac cause requiring further evaluation",
      "Normal fatigue from exercise requiring no further evaluation",
      "A guaranteed diagnosis of a seizure disorder",
      "Dehydration as the only possible cause, ruling out cardiac causes entirely",
    ],
    answerIndex: 0,
    explanation:
      "Exertional syncope is a red flag for an underlying cardiac cause (dysrhythmia or structural heart disease) and warrants thorough evaluation rather than being dismissed. It should not be assumed to be simple fatigue, should not be presumed to be a seizure without other supporting findings, and dehydration should not be assumed as the sole cause while ignoring the cardiac risk this presentation carries.",
  },
  {
    id: "aemt-cardiology-2140",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A 'silent' myocardial infarction refers to:",
    choices: [
      "An MI occurring with minimal or atypical symptoms, sometimes going unrecognized by the patient",
      "An MI that produces no changes on a cardiac monitor",
      "An MI that only occurs in patients under age 30",
      "An MI that resolves completely without any treatment or consequence",
    ],
    answerIndex: 0,
    explanation:
      "A silent MI presents with minimal or atypical symptoms, sometimes going completely unnoticed by the patient at the time it occurs, particularly common in diabetics and the elderly. It is not defined by absent monitor changes, is not restricted to younger patients, and still carries the risks and consequences of any MI despite the lack of obvious symptoms.",
  },
  {
    id: "aemt-cardiology-2141",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the general purpose of prehospital 12-lead ECG acquisition when performed by a Paramedic or transmitted to a receiving facility?",
    choices: [
      "To help identify ST-elevation myocardial infarction and guide early activation of cardiac catheterization resources",
      "To replace the need for any further hospital evaluation",
      "To determine the patient's blood type",
      "To diagnose diabetes",
    ],
    answerIndex: 0,
    explanation:
      "A 12-lead ECG helps identify ST-elevation MI, allowing early notification and activation of cardiac catheterization lab resources to reduce time to treatment; 12-lead interpretation for this purpose is a Paramedic-level skill, not AEMT scope. It does not replace hospital evaluation, does not determine blood type, and is unrelated to diagnosing diabetes.",
  },
  {
    id: "aemt-cardiology-2142",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Under the National EMS Scope of Practice Model, interpretation of ST-segment changes on a 12-lead ECG for treatment decisions is generally considered:",
    choices: ["AEMT-level scope", "Paramedic-level scope", "EMR-level scope", "EMT-level scope"],
    answerIndex: 1,
    explanation:
      "ST-segment interpretation for clinical decision-making is a Paramedic-level skill requiring advanced training in 12-lead ECG interpretation, and is not within AEMT, EMT, or EMR scope of practice.",
  },
  {
    id: "aemt-cardiology-2143",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT applies a cardiac monitor and sees a rhythm they cannot confidently identify, though the patient is stable and asymptomatic. What is the most appropriate action?",
    choices: [
      "Document the rhythm strip, continue monitoring, and treat based on the patient's clinical presentation rather than assumptions about the exact rhythm",
      "Immediately defibrillate as a precaution",
      "Administer nitroglycerin as a general precaution regardless of presentation",
      "Refuse to document the rhythm since it cannot be identified",
    ],
    answerIndex: 0,
    explanation:
      "Treating the patient rather than the monitor is key; an asymptomatic, stable patient does not require aggressive intervention based on an uncertain rhythm interpretation, but the strip should still be documented and monitoring continued, with escalation if the patient's condition changes. Defibrillating or administering nitroglycerin without clinical indication would be inappropriate and potentially harmful, and failing to document available data is poor practice.",
  },
  {
    id: "aemt-cardiology-2144",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the general treatment priority order in managing a stable patient with chest pain of suspected cardiac origin?",
    choices: [
      "Scene safety and primary assessment, then oxygen if indicated, IV access, aspirin, and nitroglycerin per protocol, with ongoing reassessment",
      "Nitroglycerin first, before any assessment of vital signs",
      "IV access before assessing airway, breathing, and circulation",
      "Transport decisions made before any patient assessment",
    ],
    answerIndex: 0,
    explanation:
      "Standard prioritization begins with scene safety and primary assessment (ABCs), followed by appropriate oxygen, IV access, and protocol-guided medications like aspirin and nitroglycerin, with continuous reassessment throughout care. Administering nitroglycerin before assessing vitals, obtaining IV access before the primary assessment, or making transport decisions before assessing the patient would all violate standard prioritization.",
  },
  {
    id: "aemt-cardiology-2145",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "Multiple patients are found after a mass-casualty incident. One patient is in cardiac arrest with no immediate ROSC likely given the resources available, others have treatable, survivable injuries requiring immediate attention. Under standard triage principles, the arrest patient in this scenario would most likely be triaged as:",
    choices: [
      "Deceased/expectant, so resources can be directed to salvageable patients",
      "Immediate priority, ahead of all other patients regardless of resource constraints",
      "Delayed priority",
      "Minor priority",
    ],
    answerIndex: 0,
    explanation:
      "In mass-casualty triage, patients in cardiac arrest are generally classified as deceased/expectant when resources are limited, because attempting prolonged single-patient resuscitation diverts limited resources from salvageable patients with survivable injuries. Assigning immediate priority above all others in this resource-limited MCI context, delayed, or minor priority does not reflect standard triage principles for a non-viable arrest in this setting.",
  },
  {
    id: "aemt-cardiology-2146",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'perfusion' as it relates to shock assessment?",
    choices: [
      "The delivery of oxygenated blood to body tissues and organs",
      "The rate of respiration only",
      "The level of consciousness only",
      "The color of the patient's skin regardless of blood flow",
    ],
    answerIndex: 0,
    explanation:
      "Perfusion refers to the adequate delivery of oxygenated blood to tissues and organs, which is assessed through multiple findings including skin signs, mental status, and vital signs together, not any single isolated factor. Respiratory rate alone, level of consciousness alone, and skin color considered without context of blood flow do not individually define perfusion.",
  },
  {
    id: "aemt-cardiology-2147",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient has cool, pale, diaphoretic skin, a weak rapid pulse, and confusion. Taken together, these findings indicate:",
    choices: [
      "Inadequate perfusion (shock)",
      "Normal perfusion status",
      "A localized skin infection only",
      "A finding limited only to the respiratory system",
    ],
    answerIndex: 0,
    explanation:
      "The combination of cool, pale, diaphoretic skin, a weak rapid pulse, and confusion together indicates inadequate systemic perfusion, consistent with shock, rather than any single isolated system finding. This is not normal perfusion, not a localized skin infection, and not limited only to the respiratory system, since it reflects a systemic perfusion problem.",
  },
  {
    id: "aemt-cardiology-2148",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A stable chest pain patient's condition suddenly deteriorates en route, becoming unresponsive with no palpable pulse. The monitor shows an organized rhythm. What should the AEMT do immediately?",
    choices: [
      "Begin high-quality CPR and manage as pulseless electrical activity per protocol",
      "Continue transport without changing management since the monitor shows an organized rhythm",
      "Apply the AED only, without starting CPR, since the rhythm looks organized",
      "Wait for hospital arrival to begin any resuscitation",
    ],
    answerIndex: 0,
    explanation:
      "An organized rhythm without a pulse defines PEA, requiring immediate initiation of CPR and treatment of underlying reversible causes, not continued routine transport. Withholding CPR because the monitor looks organized, applying only the AED without CPR (PEA is non-shockable), and delaying resuscitation until hospital arrival are all inappropriate responses to sudden pulselessness.",
  },
  {
    id: "aemt-cardiology-2149",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "The term 'pulseless electrical activity' (PEA) specifically describes a situation where:",
    choices: [
      "Organized electrical activity is present on the monitor, but no palpable pulse is generated",
      "There is complete absence of electrical activity",
      "The rhythm is ventricular fibrillation",
      "The patient has a normal, strong pulse with an abnormal rhythm",
    ],
    answerIndex: 0,
    explanation:
      "PEA describes organized electrical activity on the monitor without a corresponding effective mechanical contraction to produce a palpable pulse. Complete absence of activity describes asystole, ventricular fibrillation is a distinct chaotic rhythm, and by definition PEA involves an absent, not strong, pulse.",
  },
  {
    id: "aemt-cardiology-2150",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "multiple_response",
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Which of the following are recognized reversible causes of cardiac arrest under the 'Hs and Ts' framework? (Select all that apply.)",
    choices: [
      "Hypoxia",
      "Tension pneumothorax",
      "Chronic osteoarthritis",
      "Hypothermia",
      "Tamponade (cardiac)",
      "Seasonal allergies",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "Hypoxia, tension pneumothorax, hypothermia, and cardiac tamponade are all recognized reversible causes within the Hs and Ts framework. Chronic osteoarthritis and seasonal allergies are not part of this recognized list of reversible arrest causes.",
  },
  {
    id: "aemt-cardiology-2151",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the difference between defibrillation and synchronized cardioversion?",
    choices: [
      "Defibrillation delivers an unsynchronized shock for chaotic rhythms, while cardioversion is timed to the QRS complex for organized but unstable tachycardias",
      "They are identical procedures with no meaningful difference",
      "Cardioversion is used only for asystole",
      "Defibrillation requires timing to the T wave specifically",
    ],
    answerIndex: 0,
    explanation:
      "Defibrillation delivers an unsynchronized shock appropriate for chaotic rhythms like VF, while synchronized cardioversion is timed to avoid the vulnerable T wave and is used for organized but unstable tachycardias. These are not identical procedures, cardioversion is not used for asystole (a non-shockable rhythm), and it is defibrillation, not cardioversion, that is unsynchronized and not specifically timed to any wave.",
  },
  {
    id: "aemt-cardiology-2152",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Synchronized cardioversion, as opposed to defibrillation, is generally reserved for which provider level and rhythm type?",
    choices: [
      "Paramedic-level providers managing unstable but organized tachydysrhythmias with a pulse",
      "AEMT-level providers managing any bradycardia",
      "AEMT-level providers managing pulseless arrest",
      "EMT-level providers managing chest pain",
    ],
    answerIndex: 0,
    explanation:
      "Synchronized cardioversion is a Paramedic-level skill used for unstable but organized tachydysrhythmias in a patient who still has a pulse. It is not used for bradycardia, is not appropriate for pulseless arrest (where defibrillation or CPR/PEA management applies instead), and is not within EMT-level scope for chest pain management.",
  },
  {
    id: "aemt-cardiology-2153",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT is caring for a stable but symptomatic patient in SVT with a blood pressure of 108/70 mmHg who is alert. ALS is 10 minutes away. What is the most appropriate AEMT-level action while awaiting ALS?",
    choices: [
      "Provide supportive care, IV access, oxygen if indicated, continuous monitoring, and prepare for rapid ALS intercept or transport",
      "Perform synchronized cardioversion independently",
      "Administer adenosine independently",
      "Withhold all care until ALS arrives",
    ],
    answerIndex: 0,
    explanation:
      "For a stable SVT patient, AEMT-appropriate management is supportive care, IV access, oxygen if needed, continuous monitoring, and facilitating ALS intercept or transport, since vagal maneuvers, cardioversion, and adenosine are typically outside strict AEMT scope (cardioversion and adenosine are Paramedic-level). Independently performing cardioversion or administering adenosine is outside AEMT scope, and withholding all supportive care is inappropriate.",
  },
  {
    id: "aemt-cardiology-2154",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'torsades de pointes,' a distinct ventricular dysrhythmia often mentioned at an awareness level?",
    choices: [
      "A polymorphic ventricular tachycardia with a QRS complex that appears to twist around the baseline",
      "A completely normal sinus rhythm variant",
      "A supraventricular rhythm with narrow complexes",
      "Synonymous with asystole",
    ],
    answerIndex: 0,
    explanation:
      "Torsades de pointes is a distinctive polymorphic ventricular tachycardia in which the QRS complexes appear to twist around the isoelectric baseline, often associated with a prolonged QT interval. It is not a normal sinus variant, is not a narrow-complex supraventricular rhythm, and is not synonymous with asystole, which is a flat-line absence of activity.",
  },
  {
    id: "aemt-cardiology-2155",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which class of medication, if a patient reports taking it, might predispose them to torsades de pointes and is relevant history to gather?",
    choices: [
      "Certain medications known to prolong the QT interval",
      "Topical antifungal creams",
      "Over-the-counter vitamin supplements at standard doses",
      "Standard multivitamins",
    ],
    answerIndex: 0,
    explanation:
      "Certain medications (including some antiarrhythmics, antipsychotics, and antibiotics) are known to prolong the QT interval and predispose to torsades de pointes, making this relevant history. Topical antifungals, standard-dose vitamins, and multivitamins are not typically associated with this risk.",
  },
  {
    id: "aemt-cardiology-2156",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient describes palpitations described as their 'heart racing and fluttering' that started suddenly while at rest and stopped just as suddenly before EMS arrival. This pattern of abrupt onset and offset is most typical of:",
    choices: [
      "A paroxysmal dysrhythmia such as SVT",
      "Chronic, ongoing sinus tachycardia",
      "A normal physiological response to rest",
      "A musculoskeletal chest wall issue",
    ],
    answerIndex: 0,
    explanation:
      "Sudden, abrupt onset and offset of palpitations at rest is characteristic of paroxysmal dysrhythmias such as SVT, which start and stop suddenly due to reentrant circuits. Sinus tachycardia typically has a gradual onset/offset related to a trigger, this pattern is not a normal resting physiological response, and a musculoskeletal issue would not explain a racing/fluttering sensation with abrupt onset and offset.",
  },
  {
    id: "aemt-cardiology-2157",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best distinguishes cardiac chest pain from pleuritic chest pain on history alone?",
    choices: [
      "Pleuritic pain typically worsens with deep breathing or coughing, while classic cardiac pain does not vary significantly with respiration",
      "Cardiac pain always worsens specifically with deep breathing",
      "Pleuritic pain always radiates to the jaw",
      "There is no meaningful difference between the two",
    ],
    answerIndex: 0,
    explanation:
      "Pleuritic pain classically worsens with deep inspiration or coughing due to irritation of the pleura, while classic cardiac pain tends to remain fairly constant regardless of respiration. Cardiac pain does not classically worsen specifically with breathing, pleuritic pain does not classically radiate to the jaw (a cardiac feature), and there is a meaningful clinical difference between the two presentations.",
  },
  {
    id: "aemt-cardiology-2158",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient reports sharp chest pain that worsens when lying flat and improves when leaning forward, along with a recent viral illness. This presentation is most suggestive of:",
    choices: [
      "Pericarditis",
      "Classic exertional angina",
      "Tension pneumothorax",
      "Simple hyperventilation syndrome",
    ],
    answerIndex: 0,
    explanation:
      "Sharp pain that worsens lying flat, improves leaning forward, and follows a recent viral illness is a classic description of pericarditis (inflammation of the pericardium). Classic exertional angina is related to exertion and relieved by rest, not positional changes; tension pneumothorax presents with respiratory distress and absent breath sounds, not this positional pattern; and hyperventilation syndrome does not typically follow this positional and infectious pattern.",
  },
  {
    id: "aemt-cardiology-2159",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A pericardial friction rub, if noted in patient history/documentation from a prior evaluation, is most associated with which condition?",
    choices: ["Pericarditis", "Simple asthma", "Uncomplicated urinary tract infection", "Tension headache"],
    answerIndex: 0,
    explanation:
      "A pericardial friction rub is a classic auscultatory finding associated with pericarditis, caused by inflamed pericardial layers rubbing together. It is not associated with asthma, a urinary tract infection, or a tension headache, which are unrelated conditions.",
  },
  {
    id: "aemt-cardiology-2160",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An unresponsive patient in respiratory arrest but with a palpable pulse requires ventilatory support. What is the appropriate ventilation rate for an adult with a pulse but inadequate/absent breathing?",
    choices: [
      "1 breath every 6 seconds (approximately 10 breaths per minute)",
      "1 breath every 1 second (60 breaths per minute)",
      "1 breath every 30 seconds",
      "Ventilation rate does not matter as long as compressions continue",
    ],
    answerIndex: 0,
    explanation:
      "For an adult with a pulse but inadequate breathing, rescue breaths are given at approximately 1 every 6 seconds (about 10/minute), avoiding hyperventilation. 1 breath per second would cause dangerous hyperventilation, 1 breath every 30 seconds is far too infrequent, and since a pulse is present, compressions are not indicated at all in this scenario, making ventilation rate the primary concern.",
  },
  {
    id: "aemt-cardiology-2161",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Excessive ventilation rate or volume during resuscitation is discouraged primarily because it can:",
    choices: [
      "Increase intrathoracic pressure and reduce venous return, lowering cardiac output",
      "Always improve oxygenation with no downside",
      "Have no effect on hemodynamics",
      "Prevent gastric insufflation entirely",
    ],
    answerIndex: 0,
    explanation:
      "Excessive ventilation increases intrathoracic pressure, which reduces venous return to the heart and can lower cardiac output during resuscitation, making it harmful rather than beneficial. It does not universally improve oxygenation without downside, it does have significant hemodynamic effects, and it actually increases (not prevents) the risk of gastric insufflation.",
  },
  {
    id: "aemt-cardiology-2162",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "During prolonged resuscitation, the AEMT team is preparing to rotate compressors and reassess the rhythm. What is the most efficient way to minimize interruption to compressions during this transition?",
    choices: [
      "Plan the rotation and rhythm check to occur simultaneously, with the new compressor ready to take over immediately",
      "Stop compressions for several minutes to fully discuss the plan before rotating",
      "Have all rescuers step away from the patient during the discussion",
      "Perform the rotation only after compressions have already been paused for an unrelated reason",
    ],
    answerIndex: 0,
    explanation:
      "Coordinating compressor rotation with the scheduled rhythm check and having the next compressor ready minimizes total interruption time and maintains high compression fraction. Stopping for several minutes or having all rescuers step away wastes critical perfusion time, and waiting for an unrelated pause is not an efficient, deliberate strategy.",
  },
  {
    id: "aemt-cardiology-2163",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the primary reason for minimizing interruptions in chest compressions during CPR?",
    choices: [
      "Interruptions rapidly reduce coronary and cerebral perfusion pressure built up during compressions",
      "Interruptions have no effect on outcomes",
      "Interruptions are only a concern in pediatric patients",
      "Interruptions improve the accuracy of rhythm analysis with no downside",
    ],
    answerIndex: 0,
    explanation:
      "Perfusion pressure built up during compressions drops rapidly once compressions stop, so minimizing interruptions is critical to maintaining coronary and cerebral perfusion. Interruptions do meaningfully affect outcomes, this concern applies across age groups (not just pediatric), and while brief pauses are sometimes necessary for rhythm analysis, this does not mean interruptions have no downside.",
  },
  {
    id: "aemt-cardiology-2164",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "During a pulse check pause in CPR, the AEMT is uncertain whether a pulse is present after several seconds of palpation. What is the most appropriate action?",
    choices: [
      "Resume compressions promptly rather than prolonging the pulse check beyond about 10 seconds",
      "Continue checking for up to 2 full minutes to be certain",
      "Assume a pulse is present and stop all further CPR",
      "Call off resuscitation entirely due to the uncertainty",
    ],
    answerIndex: 0,
    explanation:
      "Pulse checks should not exceed about 10 seconds; if uncertain, the rescuer should resume compressions rather than prolong the pause and further delay perfusion. Checking for up to 2 minutes wastes critical time, assuming a pulse is present without confirmation could inappropriately halt needed CPR, and calling off resuscitation due to uncertainty about a single pulse check is not appropriate.",
  },
  {
    id: "aemt-cardiology-2165",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Agonal respirations in a newly found unresponsive patient with no palpable pulse should be interpreted as:",
    choices: [
      "A sign of cardiac arrest requiring CPR, not effective breathing",
      "Adequate, effective breathing requiring no intervention",
      "A sign the patient will spontaneously recover without treatment",
      "An indication to withhold compressions",
    ],
    answerIndex: 0,
    explanation:
      "Agonal respirations (occasional gasping breaths) in a pulseless patient are a sign of cardiac arrest, not effective breathing, and should prompt immediate initiation of CPR rather than being mistaken for adequate respiration. This finding does not indicate the patient will recover without treatment, and it should not lead to withholding compressions.",
  },
  {
    id: "aemt-cardiology-2166",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Bystanders report a patient collapsed and is now making occasional gasping sounds every 20-30 seconds with no other movement. The AEMT should recognize this as:",
    choices: [
      "Likely agonal respirations in cardiac arrest, warranting immediate assessment for pulse and initiation of CPR if pulseless",
      "Normal snoring that requires no action",
      "Clear evidence the patient does not need CPR",
      "A sign of a simple seizure with no cardiac significance",
    ],
    answerIndex: 0,
    explanation:
      "Occasional gasping sounds after sudden collapse are classic for agonal respirations associated with cardiac arrest and should prompt immediate pulse assessment and CPR if no pulse is found. This should not be mistaken for normal snoring, does not indicate CPR is unnecessary, and is not consistent with a simple seizure presentation.",
  },
  {
    id: "aemt-cardiology-2167",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best describes appropriate documentation after a cardiac arrest resuscitation attempt?",
    choices: [
      "Times of key interventions (CPR start, shocks, medications, ROSC or termination) along with rhythms observed and patient response",
      "Only the final outcome, with no intervening details",
      "No documentation is required for cardiac arrest calls",
      "Only the crew's personal opinions about the likely cause",
    ],
    answerIndex: 0,
    explanation:
      "Thorough documentation of times, interventions, rhythms, and patient responses is essential for quality review, medical-legal purposes, and continuity of care. Recording only the final outcome, omitting documentation entirely, or documenting only subjective opinions without objective findings and times would all be inadequate and inappropriate.",
  },
  {
    id: "aemt-cardiology-2168",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A family member at the scene of a cardiac arrest presents a valid, signed physician-ordered DNR (do-not-resuscitate) document consistent with local protocol requirements. What is the most appropriate action?",
    choices: [
      "Honor the valid DNR per local protocol, withholding resuscitative efforts, and provide comfort/support to the family",
      "Ignore the document and begin full resuscitation regardless",
      "Begin resuscitation and stop only once at the hospital",
      "Refuse to assess the patient at all",
    ],
    answerIndex: 0,
    explanation:
      "A valid, properly executed DNR consistent with local protocol should be honored, with resuscitative efforts withheld and supportive/comfort care provided to the family. Ignoring the valid document, starting resuscitation with the intent to only stop at the hospital, or entirely refusing to assess the patient would all be inappropriate responses.",
  },
  {
    id: "aemt-cardiology-2169",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "At the scene of a cardiac arrest, family members provide conflicting information: one states the patient has a DNR, but no written document can be located or verified. What is the most appropriate approach absent a valid, verifiable order?",
    choices: [
      "Begin resuscitation per standard protocol, since an unverifiable/unlocatable DNR generally cannot be honored",
      "Withhold resuscitation entirely based on verbal report alone",
      "Flip a coin to decide",
      "Delay any action indefinitely until the document is found",
    ],
    answerIndex: 0,
    explanation:
      "Without a valid, verifiable DNR document meeting local legal/protocol requirements, standard practice is to proceed with resuscitation, since an unverifiable verbal report generally cannot be honored in place of a proper order. Withholding care based on an unverified verbal claim, making an arbitrary decision, or delaying necessary intervention indefinitely are not appropriate approaches in a time-critical arrest.",
  },
  {
    id: "aemt-cardiology-2170",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following is an appropriate general principle when communicating with family members during an ongoing cardiac arrest resuscitation?",
    choices: [
      "Communicate honestly and compassionately about the situation and interventions being performed",
      "Avoid any communication with family members at all times",
      "Provide false reassurance that the patient will definitely survive",
      "Discuss the case loudly with other crew members in a way the family can overhear inappropriate details",
    ],
    answerIndex: 0,
    explanation:
      "Honest, compassionate communication with family, appropriate to the situation, is a core professional principle during a resuscitation. Avoiding all communication, offering false guarantees of survival, and discussing sensitive details inappropriately in front of family are all poor practices.",
  },
  {
    id: "aemt-cardiology-2171",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT is transporting a post-ROSC patient with an unsecured airway who begins to have irregular, shallow respirations. What is the most appropriate priority action?",
    choices: [
      "Support ventilation as needed and closely monitor airway and breathing status throughout transport",
      "Ignore the change since ROSC has already been achieved",
      "Immediately stop all monitoring to save time",
      "Discontinue oxygen therapy since the patient has a pulse",
    ],
    answerIndex: 0,
    explanation:
      "Post-ROSC patients remain unstable and require continued close monitoring and ventilatory support as needed, since achieving ROSC does not mean the patient is stable or safe from deterioration. Ignoring the respiratory change, stopping monitoring, or discontinuing oxygen simply because a pulse is present would all risk further deterioration or re-arrest.",
  },
  {
    id: "aemt-cardiology-2172",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Post-cardiac-arrest care generally emphasizes which of the following priorities?",
    choices: [
      "Optimizing oxygenation, ventilation, and perfusion while closely monitoring for rearrest",
      "Discontinuing all monitoring once a pulse returns",
      "Immediately discharging the patient from care if they are conscious",
      "Avoiding any further reassessment since the emergency has passed",
    ],
    answerIndex: 0,
    explanation:
      "Post-arrest care focuses on optimizing oxygenation, ventilation, and perfusion, along with vigilant monitoring for re-arrest, since the immediate post-ROSC period carries a high risk of deterioration. Discontinuing monitoring, considering the emergency over, or avoiding further reassessment would all neglect an unstable patient's ongoing needs.",
  },
  {
    id: "aemt-cardiology-2173",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "An elderly patient with a history of heart failure presents with progressive shortness of breath, bilateral leg swelling, and crackles in both lung bases over several days. This presentation is most consistent with:",
    choices: [
      "Decompensated congestive heart failure with fluid overload",
      "Acute anaphylaxis",
      "Simple viral upper respiratory infection",
      "Acute hypovolemic shock from bleeding",
    ],
    answerIndex: 0,
    explanation:
      "Progressive dyspnea, bilateral leg edema, and bibasilar crackles in a patient with known heart failure over several days is classic for decompensated congestive heart failure with fluid overload. Anaphylaxis has an acute allergic trigger and different presentation, a simple viral infection would not typically cause bilateral leg swelling, and hypovolemic shock from bleeding would present with signs of volume depletion, not fluid overload.",
  },
  {
    id: "aemt-cardiology-2174",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A patient in decompensated heart failure with pulmonary edema and adequate blood pressure needs supportive care during transport. Which position and oxygen approach is most appropriate?",
    choices: [
      "Upright/semi-Fowler's position with oxygen titrated to maintain adequate saturation",
      "Full Trendelenburg position with high-flow oxygen",
      "Supine flat position with oxygen withheld entirely",
      "Prone position with no oxygen support",
    ],
    answerIndex: 0,
    explanation:
      "An upright or semi-Fowler's position eases the work of breathing in pulmonary edema, combined with oxygen titrated to the patient's needs. Trendelenburg or fully supine positioning would worsen pulmonary congestion and breathing difficulty in this condition, and withholding oxygen entirely in a patient with likely hypoxia from pulmonary edema would be inappropriate; prone positioning is also not standard for this presentation.",
  },
  {
    id: "aemt-cardiology-2175",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A patient with decompensated heart failure and pulmonary edema also has a blood pressure of 92/58 mmHg. Which fluid administration approach is most appropriate?",
    choices: [
      "Extreme caution with IV fluids, given the risk of worsening pulmonary edema despite the lower blood pressure; follow protocol/medical direction closely",
      "A large, rapid isotonic fluid bolus to address the low blood pressure",
      "Administering hypertonic saline in large volumes",
      "No IV access should ever be established in this patient",
    ],
    answerIndex: 0,
    explanation:
      "Even with borderline low blood pressure, aggressive fluid administration risks worsening pulmonary edema in decompensated heart failure, so extreme caution and close adherence to protocol/medical direction is warranted rather than a large bolus. A large rapid bolus or hypertonic saline could worsen fluid overload, while establishing IV access itself is still appropriate for potential medication administration even if large-volume fluids are avoided.",
  },
  {
    id: "aemt-cardiology-2176",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Jugular venous distention (JVD) when a patient is positioned at approximately 45 degrees is generally associated with:",
    choices: [
      "Elevated central venous pressure, such as from heart failure or tamponade",
      "Dehydration",
      "A completely normal finding in all patients regardless of position",
      "Hypovolemic shock exclusively",
    ],
    answerIndex: 0,
    explanation:
      "JVD at 45 degrees suggests elevated central venous pressure, seen in conditions like heart failure, tamponade, or tension pneumothorax. It is not associated with dehydration, is not a universally normal finding at this position, and is not exclusive to hypovolemic shock (which typically causes flat, not distended, neck veins).",
  },
  {
    id: "aemt-cardiology-2177",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient with flat neck veins, dry mucous membranes, poor skin turgor, and hypotension most likely has which underlying volume status?",
    choices: [
      "Hypovolemia",
      "Volume overload",
      "Normal volume status",
      "Isolated cardiac pump failure with normal volume",
    ],
    answerIndex: 0,
    explanation:
      "Flat neck veins, dry mucous membranes, poor skin turgor, and hypotension together indicate volume depletion (hypovolemia) rather than fluid overload. This is not consistent with volume overload (which would show JVD and edema) or normal volume status, and isolated cardiac pump failure with normal volume would more typically present with JVD and pulmonary congestion, not these dehydration-related signs.",
  },
  {
    id: "aemt-cardiology-2178",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which of the following best summarizes the AEMT's overall role in cardiac emergencies relative to a Paramedic?",
    choices: [
      "AEMTs provide foundational interventions such as IV/IO access, fluids, AED use, aspirin, and nitroglycerin, while advanced rhythm interpretation, cardioversion, pacing, and expanded drug therapy remain Paramedic-level",
      "AEMTs and Paramedics have identical scopes of practice for all cardiac interventions",
      "AEMTs perform 12-lead interpretation and cardioversion independently",
      "AEMTs have no role in cardiac emergency care",
    ],
    answerIndex: 0,
    explanation:
      "AEMTs provide important foundational cardiac care including IV/IO access, fluid therapy, AED use, and protocol-guided aspirin/nitroglycerin, while more advanced skills like 12-lead interpretation, cardioversion, pacing, and an expanded medication formulary remain within Paramedic scope. AEMT and Paramedic scopes are not identical, AEMTs do not independently perform 12-lead interpretation or cardioversion, and AEMTs clearly do have a significant role in cardiac emergency care.",
  },
  {
    id: "aemt-cardiology-2179",
    domain: "Cardiology",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "After administering aspirin and nitroglycerin to a chest pain patient per protocol, the AEMT should reassess which of the following to evaluate treatment effectiveness and safety?",
    choices: [
      "Pain level, blood pressure, and overall clinical status",
      "Only the color of the patient's shoes",
      "Nothing further needs to be reassessed once medications are given",
      "Only the ambient room temperature",
    ],
    answerIndex: 0,
    explanation:
      "After medication administration, reassessing pain level, blood pressure, and overall clinical status is essential to evaluate effectiveness and detect any adverse effects such as hypotension. The patient's shoe color and ambient room temperature are irrelevant to clinical reassessment, and failing to reassess after treatment would be inappropriate and unsafe practice.",
  },
];
