// AEMT-level questions, split out of questions.js. See questions.js's own
// header comment for the shared question-object shape and rules for adding one.
// This file holds only level: "AEMT" entries.
//
// ID numbering note: these start at 500 within each domain prefix to avoid
// collisions with EMR/EMT content without needing to audit every existing
// file's max id first. Renumber down when doing a final consolidation pass.

import { BATCH as AEMT_CARDIOLOGY_BATCH } from "./_genbatch/aemt_cardiology.js";
import { BATCH as AEMT_AIRWAY_BATCH } from "./_genbatch/aemt_airway.js";
import { BATCH as AEMT_TRAUMA_BATCH } from "./_genbatch/aemt_trauma.js";
import { BATCH as AEMT_MEDICAL_BATCH } from "./_genbatch/aemt_medical.js";
import { BATCH as AEMT_OPS_BATCH } from "./_genbatch/aemt_ops.js";

export const AEMT_QUESTIONS = [
  {
    id: "aemt-airway-500",
    domain: "Airway",
    level: "AEMT",
    blueprintCategory: "treatmentTransport",
    clinicalJudgment: false,
    question:
      "Which supraglottic airway device is within the AEMT scope of practice under the National EMS Scope of Practice Model?",
    choices: [
      "Endotracheal tube placed via direct laryngoscopy",
      "King LT or i-gel supraglottic airway",
      "Surgical cricothyrotomy",
      "Retrograde intubation",
    ],
    answerIndex: 1,
    explanation:
      "Supraglottic airways (King LT, i-gel, Combitube) are AEMT-scope advanced airway adjuncts that do not require visualization of the cords. Endotracheal intubation via direct laryngoscopy, surgical cricothyrotomy, and retrograde intubation are all Paramedic-level (or higher) skills.",
  },
  {
    id: "aemt-airway-501",
    domain: "Airway",
    level: "AEMT",
    blueprintCategory: "treatmentTransport",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT has placed a supraglottic airway in an unresponsive apneic patient. After three ventilations, the chest is not rising and gastric distention is worsening. What is the most appropriate next action?",
    choices: [
      "Increase ventilation rate and force",
      "Remove the device, reposition, and reattempt insertion",
      "Insert a second supraglottic airway alongside the first",
      "Attach a colorimetric capnometer and continue ventilating unchanged",
    ],
    answerIndex: 1,
    explanation:
      "Absent chest rise with worsening gastric distention indicates the airway is not properly seated (esophageal placement or malposition). The correct response is to remove and reattempt, not to force air past an obstruction, stack a second device, or continue ventilating a misplaced airway while merely monitoring it.",
  },
  {
    id: "aemt-cardiology-500",
    domain: "Cardiology",
    level: "AEMT",
    blueprintCategory: "treatmentTransport",
    clinicalJudgment: false,
    question:
      "An AEMT is establishing peripheral IV access on a normotensive medical patient for fluid maintenance. Which IV fluid is most appropriate?",
    choices: [
      "Dextrose 50% in water (D50W)",
      "0.9% Normal Saline",
      "3% Hypertonic Saline",
      "Sterile water for injection",
    ],
    answerIndex: 1,
    explanation:
      "0.9% Normal Saline is the standard isotonic crystalloid used for routine IV maintenance and volume replacement. D50W is a concentrated dextrose solution for symptomatic hypoglycemia, not routine maintenance. Hypertonic saline is reserved for specific indications like severe hyponatremia or cerebral edema. Sterile water is hypotonic and would cause hemolysis if infused IV.",
  },
  {
    id: "aemt-cardiology-501",
    domain: "Cardiology",
    level: "AEMT",
    blueprintCategory: "secondaryAssessment",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "While attaching a cardiac monitor, the AEMT notes a regular narrow-complex rhythm at 160 beats per minute with no discernible P waves. Which rhythm is most consistent with this finding?",
    choices: [
      "Sinus tachycardia",
      "Supraventricular tachycardia",
      "Ventricular tachycardia",
      "Atrial fibrillation",
    ],
    answerIndex: 1,
    explanation:
      "A regular, narrow-complex rhythm with absent P waves and a rate this high is classic for supraventricular tachycardia (SVT). Sinus tachycardia typically shows identifiable P waves and rarely exceeds 160-180 bpm without a clear cause. Ventricular tachycardia is wide-complex. Atrial fibrillation is irregularly irregular, not regular.",
  },
  {
    id: "aemt-trauma-500",
    domain: "Trauma",
    level: "AEMT",
    blueprintCategory: "treatmentTransport",
    itemType: "multiple_response",
    clinicalJudgment: false,
    question:
      "Which of the following are appropriate indications for AEMT-initiated IV fluid therapy in a trauma patient? (Select all that apply.)",
    choices: [
      "Signs of hypovolemic shock with a mechanism consistent with significant blood loss",
      "An isolated, non-displaced ankle fracture with normal vital signs",
      "Penetrating torso trauma with hypotension prior to a long transport",
      "A conscious, alert patient with a minor laceration and stable vitals",
      "Suspected internal hemorrhage with tachycardia and delayed capillary refill",
    ],
    correctIndices: [0, 2, 4],
    explanation:
      "IV access and fluid therapy are indicated when there is evidence of hypoperfusion or significant blood loss risk (hypovolemic shock signs, hypotensive penetrating trauma, tachycardia with delayed capillary refill suggesting internal hemorrhage). An isolated stable ankle fracture or a minor laceration with normal vitals does not require IV fluid resuscitation.",
  },
  {
    id: "aemt-trauma-501",
    domain: "Trauma",
    level: "AEMT",
    blueprintCategory: "treatmentTransport",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A trauma patient with signs of hemorrhagic shock has a systolic blood pressure of 78 mmHg. Local protocol calls for permissive hypotension. What is the most appropriate fluid resuscitation target?",
    choices: [
      "Infuse crystalloid rapidly until systolic blood pressure reaches 120 mmHg",
      "Withhold all IV fluids until arrival at the trauma center",
      "Titrate crystalloid to maintain a palpable radial pulse or a systolic pressure around 80-90 mmHg",
      "Give a single 2-liter bolus regardless of the resulting blood pressure",
    ],
    answerIndex: 2,
    explanation:
      "Permissive hypotension titrates fluid to maintain adequate perfusion (a palpable radial pulse, systolic pressure roughly 80-90 mmHg) without normalizing blood pressure, since aggressive crystalloid resuscitation can dilute clotting factors and dislodge early clots, worsening hemorrhage. Withholding all fluid ignores real perfusion needs; an uncontrolled large bolus risks over-resuscitation.",
  },
  {
    id: "aemt-medical-500",
    domain: "Medical + OBGYN",
    level: "AEMT",
    blueprintCategory: "treatmentTransport",
    clinicalJudgment: false,
    question:
      "An AEMT is treating a patient with symptomatic hypoglycemia who has a patent IV line and is unable to swallow safely. Which medication and route is most appropriate?",
    choices: [
      "Oral glucose gel administered buccally",
      "Dextrose 10% or 50% administered IV",
      "Glucagon administered via nebulizer",
      "Naloxone administered IV",
    ],
    answerIndex: 1,
    explanation:
      "With a patent IV and an unsafe swallow, IV dextrose (D10W or D50W per protocol) is the appropriate route for a symptomatic hypoglycemic patient. Oral glucose requires the ability to safely swallow. Glucagon is not nebulized. Naloxone treats opioid-induced respiratory depression, not hypoglycemia.",
  },
  {
    id: "aemt-medical-501",
    domain: "Medical + OBGYN",
    level: "AEMT",
    blueprintCategory: "secondaryAssessment",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient with a known history of anaphylaxis to bee stings presents with hives, audible wheezing, and a blood pressure of 82/50 mmHg after a sting 10 minutes ago. Which finding most strongly supports immediate epinephrine administration over antihistamine alone?",
    choices: [
      "The presence of hives on the arms",
      "The hypotension and wheezing indicating systemic, multi-system involvement",
      "The patient's stated allergy history",
      "The 10-minute time interval since the sting",
    ],
    answerIndex: 1,
    explanation:
      "Anaphylaxis is defined by multi-system involvement (here, respiratory compromise plus hypotension), which is the indication for immediate epinephrine — the only medication that reverses the underlying pathophysiology. Hives alone, a known allergy history, or elapsed time do not by themselves indicate systemic anaphylaxis requiring epinephrine.",
  },
  {
    id: "aemt-ops-500",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Under most EMS scope-of-practice models, which of the following best describes the AEMT's role relative to the EMT and the Paramedic?",
    choices:
      ["AEMTs may perform every skill within Paramedic scope except drug administration",
      "AEMTs provide a limited set of advanced skills, including IV/IO access and a restricted medication list, beyond EMT scope but short of full Paramedic scope",
      "AEMTs are limited to exactly the same scope of practice as an EMT",
      "AEMTs may independently establish standing orders without medical direction",
    ],
    answerIndex: 1,
    explanation:
      "The AEMT level sits between EMT and Paramedic: it adds skills such as IV/IO access, a limited formulary, and supraglottic airway placement, but does not include the full Paramedic scope (e.g., endotracheal intubation, cardiac pacing, broader pharmacology). All EMS providers, including AEMTs, function under medical direction/protocols, not independent authority to create standing orders.",
  },
  {
    id: "aemt-ops-501",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    itemType: "build_list",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "Place the following steps for AEMT-initiated peripheral IV access in the correct order.",
    steps: [
      "Select an appropriate vein and apply a tourniquet",
      "Cleanse the site with an appropriate antiseptic",
      "Insert the catheter at the correct angle and confirm blood return",
      "Advance the catheter, release the tourniquet, and connect the administration set",
      "Secure the catheter and document the date, time, site, and gauge",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "IV access follows a set sequence: select the site and apply the tourniquet, cleanse the site, insert and confirm flashback, advance the catheter while releasing the tourniquet and connecting the line, then secure and document. Skipping or reordering these steps (e.g., cleansing after insertion) increases infection risk and reduces first-attempt success.",
  },
  ...AEMT_CARDIOLOGY_BATCH,
  ...AEMT_AIRWAY_BATCH,
  ...AEMT_TRAUMA_BATCH,
  ...AEMT_MEDICAL_BATCH,
  ...AEMT_OPS_BATCH,
];
