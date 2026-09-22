// ECG interpretation questions for the ALS levels (AEMT and Paramedic), drawn
// with the game's own monitor waveforms (src/ecg.js) via graphic.rhythm, see
// EcgStrip.jsx. IDs are aemt-ecg-6000.. and paramedic-ecg-6000..
//
// Authoring rules for this file:
//  - ecg.js draws one schematic beat per rhythm with no absolute rate, so any
//    rate the question depends on is stated in the stem, never left to the
//    strip.
//  - Only rhythms whose drawn shape actually shows the feature being tested
//    are used. AV dissociation, and a truly premature PAC, are not drawn by
//    ecg.js, so no question depends on seeing them.
//  - No em dashes in any player-facing text.

const A = { domain: "Cardiology", level: "AEMT", blueprintCategory: "cardiology", itemType: "multiple_choice", clinicalJudgment: true };
const P = { domain: "Cardiology", level: "Paramedic", blueprintCategory: "cardiology", itemType: "multiple_choice", clinicalJudgment: true };
const ecg = (rhythm) => ({ kind: "ecg", rhythm, alt: "Lead II ECG rhythm strip." });

export const AEMT_ECG_BATCH = [
  {
    ...A,
    id: "aemt-ecg-6000",
    clinicalJudgmentStep: "recognize_cues",
    graphic: ecg("sinus"),
    question:
      "A 72-year-old woman calls for mild dizziness after standing up quickly. She is alert, her pulse is 74 and regular, and her blood pressure is 128/78. The monitor strip is shown. Which rhythm is displayed?",
    choices: ["Normal sinus rhythm", "Atrial fibrillation", "Ventricular tachycardia", "Asystole"],
    answerIndex: 0,
    explanation:
      "Normal sinus rhythm has a P wave before every narrow QRS complex, a regular R-R interval, and a T wave after each QRS. Atrial fibrillation would be irregularly irregular with no distinct P waves, ventricular tachycardia would show wide, rapid, bizarre complexes, and asystole would be a nearly flat line.",
  },
  {
    ...A,
    id: "aemt-ecg-6001",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("sinusBrad"),
    question:
      "A 34-year-old marathon runner is found resting after a race with no complaints. He is alert, his skin is warm and dry, his pulse is 48 and regular, and his blood pressure is 132/82. The monitor shows the rhythm on the strip. What is the most appropriate management?",
    choices: [
      "Begin transcutaneous pacing",
      "Begin chest compressions",
      "Treat as symptomatic bradycardia and request an atropine order",
      "Continue to monitor and reassess, since he is asymptomatic and perfusing well",
    ],
    answerIndex: 3,
    explanation:
      "This is sinus bradycardia: a regular rhythm with a P wave before each narrow QRS and a rate under 60. In a well-conditioned athlete with normal blood pressure, normal mentation, and no symptoms, a slow rate is expected and needs no treatment beyond monitoring and reassessment. Pacing, atropine, and compressions are reserved for a bradycardic patient with hypoperfusion or shock.",
  },
  {
    ...A,
    id: "aemt-ecg-6002",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("sinusTach"),
    question:
      "A 24-year-old man with a fever of 103 F (39.4 C) and vomiting for two days is weak and thirsty. His heart rate is 128 and regular, his blood pressure is 104/66, and the monitor strip is shown. Which is the best approach to this rhythm?",
    choices: [
      "Deliver synchronized cardioversion",
      "Treat the underlying causes such as fever and fluid loss",
      "Deliver an unsynchronized shock",
      "Perform vagal maneuvers to slow the rate",
    ],
    answerIndex: 1,
    explanation:
      "Each QRS is preceded by a P wave and the rhythm is regular, so this is sinus tachycardia, a physiologic response to fever, dehydration, pain, anxiety, or hypoxia. The rate corrects when the cause is corrected, so treat the cause (cool the patient, replace fluids per protocol). Shocks and vagal maneuvers are for abnormal tachydysrhythmias such as ventricular tachycardia or supraventricular tachycardia, not for a compensatory sinus rate.",
  },
  {
    ...A,
    id: "aemt-ecg-6003",
    clinicalJudgmentStep: "recognize_cues",
    graphic: ecg("afib"),
    question:
      "A 71-year-old man reports palpitations and feeling lightheaded. He is alert, his pulse is irregular at about 130, and his blood pressure is 118/72. The monitor strip is shown. Which description best fits this rhythm?",
    choices: [
      "Regular rhythm with a P wave before every QRS",
      "Irregularly irregular rhythm with no distinct P waves",
      "Regular wide complexes at a very rapid rate",
      "Chaotic baseline with no identifiable QRS complexes",
    ],
    answerIndex: 1,
    explanation:
      "Atrial fibrillation is irregularly irregular, with a wavy or fibrillatory baseline in place of distinct P waves. The QRS is usually narrow. A regular rhythm with a P before each QRS is sinus rhythm, regular wide complexes suggest ventricular tachycardia, and a chaotic baseline with no QRS complexes describes ventricular fibrillation.",
  },
  {
    ...A,
    id: "aemt-ecg-6004",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("VT"),
    question:
      "A 60-year-old man collapses in a store. He is unresponsive, apneic, and has no carotid pulse. CPR is under way and the monitor is applied, showing the rhythm on the strip. What is the priority intervention?",
    choices: [
      "Deliver synchronized cardioversion",
      "Pause CPR for a full 12-lead ECG",
      "Deliver an unsynchronized shock as soon as the defibrillator is ready, then resume CPR",
      "Transport immediately and treat en route",
    ],
    answerIndex: 2,
    explanation:
      "Rapid, wide, uniform complexes in a patient with no pulse is pulseless ventricular tachycardia, a shockable rhythm managed like ventricular fibrillation. Early defibrillation with an unsynchronized shock, followed immediately by high-quality compressions, gives the best chance of survival. Synchronized cardioversion is for a patient who still has a pulse, and delaying a shock for a 12-lead or for transport lowers the chance of a successful outcome.",
  },
  {
    ...A,
    id: "aemt-ecg-6005",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("VF"),
    question:
      "A patient in cardiac arrest shows the rhythm on the strip. Why is this rhythm incompatible with life unless it is corrected quickly?",
    choices: [
      "The ventricles quiver in a disorganized way and produce no effective pumping, so there is no cardiac output",
      "The ventricles contract normally but too slowly to maintain blood pressure",
      "The atria are firing regularly and filling the ventricles too quickly",
      "The electrical signal is blocked between the atria and ventricles",
    ],
    answerIndex: 0,
    explanation:
      "The chaotic, irregular baseline is ventricular fibrillation. The heart muscle quivers instead of contracting in a coordinated way, so no blood is ejected and the patient has no pulse. The only definitive treatment is defibrillation, supported by high-quality CPR. The other choices describe bradycardia, a rapid atrial rhythm, and AV block, none of which is what this strip shows.",
  },
  {
    ...A,
    id: "aemt-ecg-6006",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("asystole"),
    question:
      "You find an unresponsive, pulseless, apneic patient and attach the monitor. It shows the nearly flat line on the strip. What should you do before concluding that this is asystole?",
    choices: [
      "Deliver a shock immediately",
      "Stop CPR and declare the patient dead",
      "Check lead connections, gain, and view the rhythm in a second lead, while continuing CPR",
      "Perform synchronized cardioversion at a low energy",
    ],
    answerIndex: 2,
    explanation:
      "A flat line can be caused by a loose lead, a disconnected cable, or gain set too low, and fine ventricular fibrillation can look flat in one lead. Confirm the rhythm by checking connections, increasing gain, and viewing another lead while continuing compressions. True asystole is not shockable, so a shock or cardioversion is inappropriate, and stopping resuscitation is a decision made under protocol and medical direction, not from one unconfirmed strip.",
  },
  {
    ...A,
    id: "aemt-ecg-6007",
    clinicalJudgmentStep: "define_hypothesis",
    graphic: ecg("PEA"),
    question:
      "A patient is unresponsive and apneic with no palpable carotid pulse. The monitor shows organized complexes as on the strip. Which term applies and what is the correct treatment approach?",
    choices: [
      "Normal sinus rhythm, so no treatment is needed",
      "Pulseless electrical activity: continue CPR, obtain access, and look for reversible causes, with no shock",
      "Ventricular fibrillation: defibrillate immediately",
      "Supraventricular tachycardia: perform vagal maneuvers",
    ],
    answerIndex: 1,
    explanation:
      "Organized electrical activity on the monitor with no pulse is pulseless electrical activity (PEA). PEA is a non-shockable rhythm, so treatment is high-quality CPR, epinephrine per protocol, and a search for reversible causes such as hypovolemia, hypoxia, tension pneumothorax, and tamponade. Always treat the patient, not the monitor: a normal-looking trace does not mean the heart is pumping.",
  },
  {
    ...A,
    id: "aemt-ecg-6008",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("stemi"),
    question:
      "A 58-year-old man has had crushing chest pain radiating to his jaw for 40 minutes. He is diaphoretic, his heart rate is 92, and his blood pressure is 146/88. The Lead II strip shows the pattern displayed. What is the most appropriate next step?",
    choices: [
      "Wait for cardiac enzymes before deciding on transport",
      "Treat as anxiety and reassure the patient",
      "Give aspirin if not contraindicated, acquire a 12-lead ECG, and transport promptly to a PCI-capable facility with early notification",
      "Hold all treatment until the patient is evaluated in the emergency department",
    ],
    answerIndex: 2,
    explanation:
      "The strip shows ST-segment elevation, which in a patient with typical ischemic chest pain is concerning for a STEMI. Time to reperfusion matters, so give aspirin (unless contraindicated), obtain a 12-lead ECG early, notify the receiving hospital, and transport to a PCI-capable center. Waiting for enzymes or attributing the symptoms to anxiety delays treatment of an evolving infarct.",
  },
  {
    ...A,
    id: "aemt-ecg-6009",
    clinicalJudgmentStep: "generate_solutions",
    graphic: ecg("svt"),
    question:
      "A 26-year-old woman reports sudden palpitations that began at rest. She is alert and anxious, her pulse is 190 and regular, her blood pressure is 122/80, and she has no chest pain. The monitor shows very fast, narrow complexes as on the strip. Which action is most appropriate at the AEMT level?",
    choices: [
      "Deliver immediate defibrillation",
      "Begin chest compressions",
      "Maintain the airway, apply oxygen if hypoxic, establish IV access, monitor closely, and request ALS or medical direction for rate control",
      "Administer a rapid fluid bolus to slow the heart rate",
    ],
    answerIndex: 2,
    explanation:
      "A sudden onset, regular, narrow-complex tachycardia at this rate is consistent with supraventricular tachycardia. She is stable (alert, good pressure, no chest pain), so the priorities are monitoring, oxygen only if needed, IV access, and early ALS involvement or medical direction for treatment. Defibrillation and compressions are for pulseless patients, and a fluid bolus will not terminate a re-entrant rhythm.",
  },
  {
    ...A,
    id: "aemt-ecg-6010",
    clinicalJudgmentStep: "recognize_cues",
    graphic: ecg("sinusPVC"),
    question:
      "A 45-year-old man reports a fluttering sensation and feeling that his heart is skipping beats. He is alert with a blood pressure of 130/84. The strip shows a normal beat alternating with an early, wide, bizarre beat that has no P wave before it. Which pattern is this?",
    choices: [
      "Atrial fibrillation",
      "Ventricular bigeminy",
      "Sinus arrhythmia",
      "Second-degree AV block",
    ],
    answerIndex: 1,
    explanation:
      "A premature ventricular contraction (PVC) is an early, wide, unusually shaped QRS with no preceding P wave, usually followed by a pause. When every other beat is a PVC the pattern is called ventricular bigeminy. Atrial fibrillation is irregularly irregular with no P waves throughout, sinus arrhythmia varies gently with breathing and has normal narrow beats, and second-degree AV block shows dropped QRS complexes after P waves.",
  },
  {
    ...A,
    id: "aemt-ecg-6011",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("firstDegreeBlock"),
    question:
      "An 80-year-old woman on a beta blocker has an incidental finding on a routine monitor check. She feels well, her pulse is 66 and regular, and her blood pressure is 138/80. Every P wave is followed by a QRS, but the PR interval is longer than normal and constant. What is the best interpretation?",
    choices: [
      "Ventricular tachycardia",
      "Third-degree (complete) heart block requiring immediate pacing",
      "First-degree AV block, which usually needs only monitoring in an asymptomatic patient",
      "Pulseless electrical activity",
    ],
    answerIndex: 2,
    explanation:
      "A constant, prolonged PR interval (over 0.20 seconds) in which every P wave still conducts is first-degree AV block. It is often benign and can be caused by medications such as beta blockers, so an asymptomatic patient is monitored and the finding is reported. Ventricular tachycardia, complete heart block, and PEA all look and behave very differently and would come with abnormal perfusion.",
  },
];

export const PARAMEDIC_ECG_BATCH = [
  {
    ...P,
    id: "paramedic-ecg-6000",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("svt"),
    question:
      "A 34-year-old woman has palpitations that started suddenly one hour ago. She is alert with a blood pressure of 118/74, no chest pain, and a regular, narrow-complex tachycardia at about 196 as shown. Vagal maneuvers have failed and IV access is established in the antecubital fossa. What is the next treatment?",
    choices: [
      "Amiodarone 300 mg IV push",
      "Adenosine 6 mg rapid IV push followed by a saline flush",
      "Atropine 1 mg IV push",
      "Immediate synchronized cardioversion at 200 J",
    ],
    answerIndex: 1,
    explanation:
      "For a stable patient with a regular narrow-complex tachycardia (supraventricular tachycardia) when vagal maneuvers fail, give adenosine 6 mg by rapid IV push followed by a flush, then 12 mg if needed. Use a proximal, large-bore site because of the drug's very short half-life. Cardioversion is reserved for an unstable patient, atropine speeds the rate, and amiodarone is not the first-line drug for this rhythm.",
  },
  {
    ...P,
    id: "paramedic-ecg-6001",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("svt"),
    question:
      "A 46-year-old man has a regular, narrow-complex tachycardia at 210 as on the strip. He is confused and cool and clammy, and his blood pressure is 74/40. What is the best treatment?",
    choices: [
      "Vagal maneuvers only and reassess in 10 minutes",
      "Immediate synchronized cardioversion, with sedation if time allows",
      "Bilateral simultaneous carotid sinus massage",
      "Unsynchronized defibrillation at 200 J",
    ],
    answerIndex: 1,
    explanation:
      "Hypotension and altered mental status make this an unstable tachycardia caused by the rhythm, so treat with synchronized cardioversion (a narrow, regular rhythm often responds at 50 to 100 J), sedating first if it does not delay the shock. Vagal maneuvers alone are too slow, simultaneous bilateral carotid massage is unsafe, and an unsynchronized shock risks delivering energy on the T wave of a patient who still has a pulse.",
  },
  {
    ...P,
    id: "paramedic-ecg-6002",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("afib"),
    question:
      "A 68-year-old man with known atrial fibrillation has an irregularly irregular rhythm with a rate of 168, as shown. He reports chest pain and severe shortness of breath, has crackles at both lung bases, and his blood pressure is 78/48. What is the most appropriate treatment?",
    choices: [
      "Synchronized cardioversion (biphasic 120 to 200 J)",
      "Diltiazem 0.25 mg/kg IV",
      "Adenosine 6 mg rapid IV push",
      "Observe on the monitor and reassess in 30 minutes",
    ],
    answerIndex: 0,
    explanation:
      "Hypotension, chest pain, and pulmonary edema in a patient with a rapid ventricular response show that the rate is causing instability, so synchronized cardioversion is indicated (biphasic 120 to 200 J for atrial fibrillation, with sedation if time allows). Rate-control drugs like diltiazem can worsen hypotension and are for stable patients, adenosine does not terminate atrial fibrillation, and observation delays needed treatment.",
  },
  {
    ...P,
    id: "paramedic-ecg-6003",
    clinicalJudgmentStep: "generate_solutions",
    graphic: ecg("afib"),
    question:
      "A 62-year-old woman with palpitations has the rhythm on the strip at a rate of about 140. She is alert, warm, and dry with a blood pressure of 132/80 and no chest pain or dyspnea. Which medication is appropriate for rate control?",
    choices: [
      "Adenosine 6 mg rapid IV push",
      "Lidocaine 1 mg/kg IV",
      "Sodium bicarbonate 1 mEq/kg IV",
      "Diltiazem 0.25 mg/kg IV over 2 minutes",
    ],
    answerIndex: 3,
    explanation:
      "In a stable patient with atrial fibrillation and a fast ventricular rate, an AV-nodal blocking agent such as diltiazem (or a beta blocker) slows the ventricular response. Adenosine may transiently reveal the rhythm but does not treat it, lidocaine is an antiarrhythmic for ventricular rhythms, and sodium bicarbonate treats acidosis or sodium-channel toxicity. Watch the blood pressure during and after diltiazem.",
  },
  {
    ...P,
    id: "paramedic-ecg-6004",
    clinicalJudgmentStep: "generate_solutions",
    graphic: ecg("VT"),
    question:
      "A 58-year-old man with a prior myocardial infarction has palpitations and a regular wide-complex tachycardia at about 180, as shown. He is alert with a blood pressure of 128/82 and no signs of poor perfusion. Which is the most appropriate medication?",
    choices: [
      "Verapamil 5 mg IV",
      "Amiodarone 150 mg IV over 10 minutes",
      "Atropine 1 mg IV",
      "Unsynchronized defibrillation at 200 J",
    ],
    answerIndex: 1,
    explanation:
      "A regular wide-complex tachycardia in a patient with structural heart disease should be treated as ventricular tachycardia. If the patient is stable, an antiarrhythmic such as amiodarone 150 mg IV over 10 minutes is appropriate. Verapamil can cause hemodynamic collapse when given for ventricular tachycardia, atropine would increase the rate, and unsynchronized defibrillation is for pulseless rhythms.",
  },
  {
    ...P,
    id: "paramedic-ecg-6005",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("VT"),
    question:
      "A 64-year-old man has the regular wide-complex tachycardia shown and a pulse. He is pale, confused, and diaphoretic, and his blood pressure is 70/40. What is the correct initial treatment?",
    choices: [
      "Synchronized cardioversion, starting at about 100 J biphasic",
      "Unsynchronized defibrillation at 200 J",
      "Transcutaneous pacing at 80 per minute",
      "Adenosine 12 mg rapid IV push",
    ],
    answerIndex: 0,
    explanation:
      "Ventricular tachycardia with a pulse and signs of shock is unstable and requires synchronized cardioversion, with an initial energy of about 100 J for a regular wide-complex rhythm, and sedation if it does not delay treatment. Synchronization prevents delivering the shock during the vulnerable T wave. Defibrillation is for pulseless or polymorphic unstable rhythms, pacing treats bradycardia, and adenosine is not appropriate for unstable ventricular tachycardia.",
  },
  {
    ...P,
    id: "paramedic-ecg-6006",
    clinicalJudgmentStep: "generate_solutions",
    graphic: ecg("torsades"),
    question:
      "A 55-year-old woman taking erythromycin and a diuretic has runs of the polymorphic wide-complex rhythm shown, with the amplitude of the complexes rising and falling. Her potassium is low and her QT interval is prolonged. She has a pulse and her blood pressure is 118/72. Which is the best treatment?",
    choices: [
      "Amiodarone 300 mg IV push",
      "Procainamide 20 mg/min IV",
      "Adenosine 6 mg rapid IV push",
      "Magnesium sulfate 1 to 2 g IV, and correct the potassium and stop the offending drug",
    ],
    answerIndex: 3,
    explanation:
      "The twisting, waxing and waning polymorphic pattern with a long QT is torsades de pointes. In a patient with a pulse, magnesium sulfate is the first-line drug, along with correcting electrolytes and removing QT-prolonging medications. Amiodarone and procainamide prolong the QT interval and can worsen torsades, and adenosine does not treat it. If the patient loses the pulse, defibrillate.",
  },
  {
    ...P,
    id: "paramedic-ecg-6007",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("torsades"),
    question:
      "A patient with torsades de pointes as shown loses consciousness and has no pulse. What is the most appropriate first action?",
    choices: [
      "Give magnesium sulfate and observe for a pulse",
      "Perform synchronized cardioversion",
      "Begin CPR and defibrillate as soon as possible with an unsynchronized shock",
      "Give atropine 1 mg IV",
    ],
    answerIndex: 2,
    explanation:
      "Pulseless polymorphic ventricular tachycardia, including torsades de pointes, is treated as ventricular fibrillation: CPR and prompt unsynchronized defibrillation. Magnesium may be added afterward for torsades, but it should not delay the shock. A synchronizing device may fail to find a consistent R wave in a polymorphic rhythm, and atropine has no role.",
  },
  {
    ...P,
    id: "paramedic-ecg-6008",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("peakedT"),
    question:
      "A 52-year-old dialysis patient who missed two sessions is weak, and the monitor shows tall, narrow, peaked T waves as displayed. His potassium is reported at 7.6 mEq/L. Which medication should be given first to counteract the cardiac effects?",
    choices: [
      "Furosemide 40 mg IV",
      "Calcium chloride or calcium gluconate slow IV",
      "Lidocaine 1 mg/kg IV",
      "Atropine 1 mg IV",
    ],
    answerIndex: 1,
    explanation:
      "Peaked T waves indicate hyperkalemia with a risk of progression to a wide QRS, a sine wave, and arrest. Calcium directly stabilizes the myocardial membrane within minutes, so give it first. Albuterol, insulin with dextrose, and sodium bicarbonate then shift potassium into cells, and dialysis removes it. Furosemide is slow and unreliable in renal failure, and lidocaine and atropine do not address membrane excitability.",
  },
  {
    ...P,
    id: "paramedic-ecg-6009",
    clinicalJudgmentStep: "generate_solutions",
    graphic: ecg("wideQRS"),
    question:
      "A 22-year-old woman ingested about 30 of her mother's amitriptyline tablets an hour ago. She is drowsy with a blood pressure of 92/58, and the monitor shows widened QRS complexes as displayed. Which medication is most appropriate to treat the wide QRS?",
    choices: [
      "Procainamide 20 mg/min IV",
      "Physostigmine 2 mg IV",
      "Flumazenil 0.2 mg IV",
      "Sodium bicarbonate 1 mEq/kg IV bolus",
    ],
    answerIndex: 3,
    explanation:
      "Tricyclic antidepressants block cardiac sodium channels, widening the QRS and increasing the risk of seizures and ventricular arrhythmias. Sodium bicarbonate (the sodium load plus alkalinization) narrows the QRS and improves conduction and blood pressure. Procainamide also blocks sodium channels and would worsen the toxicity, and physostigmine and flumazenil can precipitate seizures or arrhythmias in this overdose.",
  },
  {
    ...P,
    id: "paramedic-ecg-6010",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("stemi"),
    question:
      "A 62-year-old man has chest pain and diaphoresis. His blood pressure is 92/58, his lungs are clear, and he has jugular venous distension. The 12-lead shows ST elevation in leads II, III, and aVF, and the Lead II strip is shown. What should you obtain next, and what should you avoid?",
    choices: [
      "Right-sided leads (V4R) for right ventricular involvement, and avoid nitrates",
      "A repeat set of standard leads only, and give nitroglycerin now",
      "Left-sided posterior leads only, and give a large fluid bolus and furosemide",
      "No further ECG, and give morphine in large doses",
    ],
    answerIndex: 0,
    explanation:
      "ST elevation in II, III, and aVF is an inferior STEMI, most often from the right coronary artery, which can also infarct the right ventricle. Hypotension with clear lungs and JVD points to right ventricular involvement, so obtain right-sided leads (V4R) and avoid preload-reducing drugs such as nitroglycerin, which can cause profound hypotension. Cautious fluid may be needed, and diuretics and large morphine doses worsen the problem.",
  },
  {
    ...P,
    id: "paramedic-ecg-6011",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("chb"),
    question:
      "A 78-year-old woman had a syncopal episode. She has a slow, regular, wide-complex rhythm with a rate of 34 as shown, a blood pressure of 72/40, and cool, clammy skin. Atropine has been given to the maximum total dose without improvement. What is the next best intervention?",
    choices: [
      "Synchronized cardioversion",
      "Adenosine 6 mg rapid IV push",
      "Transcutaneous pacing, with sedation or analgesia as needed",
      "Lidocaine 1 mg/kg IV",
    ],
    answerIndex: 2,
    explanation:
      "A slow rhythm with hypotension and poor perfusion is an unstable bradycardia. When atropine fails, the next steps are transcutaneous pacing, or an infusion of dopamine or epinephrine while pacing is prepared. Wide complexes at this slow rate suggest a block below the AV node or a ventricular escape rhythm, which often does not respond to atropine. Cardioversion, adenosine, and lidocaine are for tachyarrhythmias and would be harmful here.",
  },
  {
    ...P,
    id: "paramedic-ecg-6012",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("junctional"),
    question:
      "A 74-year-old woman on digoxin and a diuretic has nausea and blurry, yellow-tinged vision. Her heart rate is 44 and regular, and her blood pressure is 100/64. The strip shows a regular narrow-complex rhythm with no visible P waves. What is the best interpretation?",
    choices: [
      "Sinus tachycardia",
      "Atrial fibrillation with a rapid response",
      "Junctional escape rhythm, with digoxin toxicity as a likely cause",
      "Ventricular fibrillation",
    ],
    answerIndex: 2,
    explanation:
      "A regular, narrow-complex rhythm with no visible P waves at a slow rate is a junctional escape rhythm, where the AV junction takes over as the pacemaker. Digoxin toxicity, hypokalemia from diuretics, and ischemia are common causes, and the visual changes and nausea support digoxin toxicity. Treat symptomatic patients per the bradycardia algorithm and consider the digoxin antidote under medical direction. The other rhythms are fast or chaotic and do not fit.",
  },
  {
    ...P,
    id: "paramedic-ecg-6013",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("PEA"),
    question:
      "A 30-year-old trauma patient is in arrest with organized complexes on the monitor as shown, but no pulse. He has absent breath sounds on the left, tracheal deviation to the right, and distended neck veins. In addition to CPR, what intervention addresses the most likely cause?",
    choices: [
      "Unsynchronized defibrillation at 200 J",
      "Atropine 1 mg IV",
      "Synchronized cardioversion",
      "Needle decompression of the left chest",
    ],
    answerIndex: 3,
    explanation:
      "Organized activity without a pulse is PEA, and the exam (absent breath sounds, tracheal deviation away from the affected side, distended neck veins) points to a left tension pneumothorax as the reversible cause. Needle decompression relieves the obstruction to venous return. PEA is not shockable, so defibrillation and cardioversion do not apply, and atropine is no longer recommended for PEA.",
  },
  {
    ...P,
    id: "paramedic-ecg-6014",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("asystole"),
    question:
      "You confirm the rhythm shown in a second lead in a pulseless, apneic patient. Which treatment is appropriate?",
    choices: [
      "Deliver an unsynchronized shock at 200 J",
      "High-quality CPR, epinephrine 1 mg IV/IO every 3 to 5 minutes, and a search for reversible causes",
      "Synchronized cardioversion at 100 J",
      "Atropine 1 mg IV and transcutaneous pacing",
    ],
    answerIndex: 1,
    explanation:
      "Confirmed asystole is a non-shockable rhythm. Management is high-quality CPR, epinephrine 1 mg IV/IO every 3 to 5 minutes, airway management, and treatment of reversible causes (the Hs and Ts). Shocks and cardioversion do not help a heart with no electrical activity, and atropine and pacing are no longer recommended in asystole.",
  },
  {
    ...P,
    id: "paramedic-ecg-6015",
    clinicalJudgmentStep: "take_action",
    graphic: ecg("VF"),
    question:
      "A patient in ventricular fibrillation has received two shocks and 2 minutes of high-quality CPR between each, and epinephrine has been given. The rhythm check shows the rhythm displayed, and a third shock is delivered. Which medication is added next?",
    choices: [
      "Adenosine 6 mg rapid IV push",
      "Amiodarone 300 mg IV/IO",
      "Calcium chloride 1 g IV/IO",
      "Atropine 1 mg IV/IO",
    ],
    answerIndex: 1,
    explanation:
      "For shock-refractory ventricular fibrillation or pulseless ventricular tachycardia, give an antiarrhythmic after the third shock: amiodarone 300 mg IV/IO (150 mg for a second dose), or lidocaine as an alternative. Adenosine treats supraventricular tachycardia, calcium is for specific causes such as hyperkalemia, and atropine has no role in a shockable rhythm.",
  },
  {
    ...P,
    id: "paramedic-ecg-6016",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("sinusPVC"),
    question:
      "A 60-year-old man with chest discomfort and shortness of breath has an SpO2 of 88% on room air. The strip shows a normal beat alternating with an early, wide beat, and no P wave precedes the wide beats. What is the best approach to this finding?",
    choices: [
      "Give prophylactic lidocaine for the ectopy",
      "Deliver synchronized cardioversion",
      "Begin CPR",
      "Treat the underlying causes such as hypoxia and ischemia, and monitor",
    ],
    answerIndex: 3,
    explanation:
      "The alternating normal and premature wide beats without P waves is ventricular bigeminy from PVCs. Ectopy in this setting is commonly driven by hypoxia, ischemia, electrolyte abnormalities, or stimulants, so treat the cause: give oxygen, obtain a 12-lead, and monitor. Prophylactic antiarrhythmics are not recommended, cardioversion is for unstable tachyarrhythmias, and CPR is for pulselessness.",
  },
  {
    ...P,
    id: "paramedic-ecg-6017",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("firstDegreeBlock"),
    question:
      "A 66-year-old man with an inferior myocardial infarction has the rhythm shown, in which every P wave conducts but the PR interval is prolonged and constant. He is hemodynamically stable. Which statement is most accurate?",
    choices: [
      "It requires immediate transcutaneous pacing",
      "It is a shockable rhythm",
      "It is usually well tolerated, but he should be monitored for progression to higher-degree block",
      "It indicates that the patient is in cardiac arrest",
    ],
    answerIndex: 2,
    explanation:
      "A constant PR interval over 0.20 seconds with every P conducted is first-degree AV block. It generally needs no treatment, but in the setting of an acute inferior MI it can progress to second-degree or complete block, so continuous monitoring with pacing pads readily available is wise. It is not a shockable rhythm and the patient has a pulse and is perfusing.",
  },
  {
    ...P,
    id: "paramedic-ecg-6018",
    clinicalJudgmentStep: "generate_solutions",
    graphic: ecg("stemi"),
    question:
      "A 55-year-old woman has 45 minutes of chest pressure. The strip shows ST elevation and a 12-lead confirms a STEMI. The nearest hospital has no cath lab, and a PCI-capable center is 20 minutes farther. What is the most appropriate plan?",
    choices: [
      "Transport to the nearest facility and wait for a cardiology consult",
      "Transmit the 12-lead ECG, notify the PCI-capable center early, and transport there directly",
      "Remain on scene for serial troponin testing",
      "Treat for anxiety and transport without a 12-lead",
    ],
    answerIndex: 1,
    explanation:
      "For a confirmed STEMI, the goal is rapid reperfusion, so acquire the 12-lead early, transmit it or notify the receiving center, and transport directly to a PCI-capable hospital when the added transport time is reasonable per local protocol. Stopping at a facility without a cath lab, waiting for troponin, or dismissing the symptoms all delay reperfusion.",
  },
  {
    ...P,
    id: "paramedic-ecg-6019",
    clinicalJudgmentStep: "analyze_cues",
    graphic: ecg("osborn"),
    question:
      "A 70-year-old man is found outdoors after a night of subfreezing temperatures. He is unresponsive and shivering has stopped. His core temperature is 28 C (82 F). The strip shows a positive hump immediately after each QRS complex. What is this finding and what is the best handling?",
    choices: [
      "A delta wave; treat as WPW with adenosine",
      "An Osborn (J) wave of hypothermia; handle gently, prevent further heat loss, and rewarm",
      "A peaked T wave; give calcium chloride",
      "Artifact from shivering; ignore it",
    ],
    answerIndex: 1,
    explanation:
      "A positive deflection at the J point after the QRS is an Osborn wave, characteristic of significant hypothermia. The cold myocardium is irritable, so rough handling can trigger ventricular fibrillation. Remove wet clothing, insulate, and begin active external rewarming, and follow protocol for arrest. A delta wave lies before the QRS, peaked T waves point to hyperkalemia, and the finding is not shivering artifact, since shivering has stopped.",
  },
];
