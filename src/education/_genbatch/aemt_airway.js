// AEMT Airway practice question batch — originally authored for
// Proximate. See src/education/questions.js header for the base schema and
// src/education/itemTypes.js for itemType-specific fields. IDs run
// aemt-airway-5000 through aemt-airway-5163, sequential, no gaps.

export const BATCH = [
  {
    id: "aemt-airway-5000",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which structure separates the oropharynx from the nasopharynx?",
    choices: ["The epiglottis", "The soft palate", "The vallecula", "The cricoid cartilage"],
    answerIndex: 1,
    explanation:
      "The soft palate is the muscular structure that divides the nasopharynx above from the oropharynx below. The epiglottis protects the laryngeal inlet during swallowing, the vallecula is the space between the base of the tongue and the epiglottis, and the cricoid cartilage is the only complete cartilaginous ring in the airway, located below the larynx.",
  },
  {
    id: "aemt-airway-5001",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "The vallecula is the anatomical space located between which two structures?",
    choices: [
      "The base of the tongue and the epiglottis",
      "The vocal cords and the trachea",
      "The soft palate and the hard palate",
      "The cricoid cartilage and the thyroid cartilage",
    ],
    answerIndex: 0,
    explanation:
      "The vallecula is the space between the base of the tongue and the epiglottis, and it is the landmark a curved (Macintosh-style) laryngoscope blade tip is placed into to indirectly lift the epiglottis. The other listed pairs describe different, unrelated airway landmarks.",
  },
  {
    id: "aemt-airway-5002",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which cartilage is the only complete (fully circumferential) ring in the airway?",
    choices: ["Thyroid cartilage", "Arytenoid cartilage", "Cricoid cartilage", "Epiglottic cartilage"],
    answerIndex: 2,
    explanation:
      "The cricoid cartilage is the only airway cartilage that forms a complete ring, which is why cricoid pressure (Sellick maneuver) can occlude the esophagus against it. The thyroid cartilage is C-shaped and open posteriorly, the arytenoid cartilages are paired and small, and the epiglottis is a leaf-shaped flap, not a ring.",
  },
  {
    id: "aemt-airway-5003",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "An adult patient makes high-pitched inspiratory noise that is audible without a stethoscope. This finding is best described as:",
    choices: ["Wheezing", "Stridor", "Rhonchi", "Crackles"],
    answerIndex: 1,
    explanation:
      "Stridor is a high-pitched, predominantly inspiratory sound caused by upper airway narrowing (larynx or trachea) and is audible without auscultation, indicating a potentially life-threatening obstruction. Wheezing is typically expiratory and from lower airway bronchospasm; rhonchi and crackles are lower airway sounds heard on auscultation, not upper airway obstruction findings.",
  },
  {
    id: "aemt-airway-5004",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "In infants and young children compared to adults, the airway anatomy is characterized by:",
    choices: [
      "A larger, more rigid trachea and a lower, more posterior tongue",
      "A proportionally larger tongue, a higher and more anterior larynx, and a floppier epiglottis",
      "A smaller tongue relative to the mouth and a lower larynx positioned at C6",
      "An airway that is widest at the vocal cords, identical to adult anatomy",
    ],
    answerIndex: 1,
    explanation:
      "Pediatric airways have a proportionally larger tongue that can more easily obstruct the airway, a larynx positioned higher and more anterior (around C3-C4 versus C5-C6 in adults), and a floppier, more omega-shaped epiglottis. In infants, the airway is narrowest at the cricoid ring rather than at the vocal cords as in adults.",
  },
  {
    id: "aemt-airway-5005",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "In infants, the narrowest portion of the airway is located at the:",
    choices: ["Vocal cords", "Cricoid cartilage", "Thyroid cartilage", "Carina"],
    answerIndex: 1,
    explanation:
      "In infants and young children, the airway is funnel-shaped and narrowest at the cricoid cartilage (the only complete ring), unlike adults where the narrowest point is at the vocal cords. This has implications for uncuffed pediatric endotracheal tube sizing, though uncuffed tubes are largely paramedic-scope, not AEMT-scope equipment.",
  },
  {
    id: "aemt-airway-5006",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An unresponsive trauma patient with suspected cervical spine injury requires a manual airway maneuver. Which technique should the AEMT use to open the airway while minimizing cervical spine movement?",
    choices: ["Head-tilt chin-lift", "Jaw-thrust maneuver", "Sniffing position", "Sellick maneuver"],
    answerIndex: 1,
    explanation:
      "The jaw-thrust maneuver opens the airway by displacing the mandible forward without extending or flexing the cervical spine, making it the appropriate technique for a patient with suspected spinal injury. The head-tilt chin-lift and sniffing position both involve neck extension, and the Sellick maneuver (cricoid pressure) is used during ventilation to reduce aspiration risk, not to open the airway.",
  },
  {
    id: "aemt-airway-5007",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which airway opening maneuver is appropriate for a medical (non-trauma) patient with no suspected spinal injury?",
    choices: ["Jaw-thrust only", "Head-tilt chin-lift", "Log-roll positioning", "In-line stabilization"],
    answerIndex: 1,
    explanation:
      "The head-tilt chin-lift is the preferred method for opening the airway in a patient without suspected trauma, as it is simple and effective. Jaw-thrust is reserved for trauma patients where cervical spine movement must be minimized; log-rolling and in-line stabilization are spinal motion restriction techniques, not airway-opening maneuvers.",
  },
  {
    id: "aemt-airway-5008",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "An AEMT is selecting an oropharyngeal airway (OPA) size for an adult patient. Which sizing method is correct?",
    choices: [
      "Measure from the corner of the mouth to the tragus of the ear",
      "Measure from the tip of the nose to the earlobe",
      "Measure from the corner of the mouth to the angle of the jaw",
      "Measure from the xiphoid process to the earlobe",
    ],
    answerIndex: 0,
    explanation:
      "An OPA is correctly sized by measuring from the corner of the patient's mouth to the tragus of the ear (or the angle of the jaw, a commonly accepted equivalent landmark). Measuring from the nose to the earlobe is the sizing method for a nasopharyngeal airway (NPA), not an OPA.",
  },
  {
    id: "aemt-airway-5009",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which sizing method is correct for a nasopharyngeal airway (NPA)?",
    choices: [
      "Corner of the mouth to the tragus of the ear",
      "Tip of the nose to the earlobe (or angle of the jaw)",
      "Xiphoid process to the umbilicus",
      "Corner of the mouth to the sternal notch",
    ],
    answerIndex: 1,
    explanation:
      "A nasopharyngeal airway is sized by measuring from the tip of the patient's nose to the earlobe or angle of the jaw, and its diameter is typically matched to the size of the patient's nostril or little finger. The other listed measurements are used for OPA sizing or are not airway-sizing landmarks at all.",
  },
  {
    id: "aemt-airway-5010",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question: "An oropharyngeal airway is contraindicated in which patient?",
    choices: [
      "An unresponsive patient with no gag reflex",
      "A patient in cardiac arrest",
      "A responsive patient with an intact gag reflex",
      "A deeply sedated post-ictal patient with no gag reflex",
    ],
    answerIndex: 2,
    explanation:
      "An OPA is contraindicated in a responsive patient with an intact gag reflex because it will trigger vomiting and possible aspiration. It is appropriate for unresponsive patients without a gag reflex, including cardiac arrest and deeply obtunded post-ictal patients.",
  },
  {
    id: "aemt-airway-5011",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A nasopharyngeal airway is inserted, and the patient develops significant epistaxis (nosebleed). This is a known complication most associated with which patient risk factor?",
    choices: [
      "History of well-controlled hypertension",
      "Suspected basilar skull fracture or coagulopathy",
      "History of seasonal allergies",
      "Recent dental work",
    ],
    answerIndex: 1,
    explanation:
      "Basilar skull fracture is a relative contraindication to NPA placement due to risk of intracranial placement through a fracture in the cribriform plate, and coagulopathy increases bleeding risk from the vascular nasal mucosa. Hypertension, seasonal allergies, and dental work are not the primary risk factors for this complication.",
  },
  {
    id: "aemt-airway-5012",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    itemType: "multiple_response",
    question:
      "Which of the following are appropriate indications for oropharyngeal suctioning? (Select 2.)",
    choices: [
      "Visible vomitus in the airway of an unresponsive patient",
      "A responsive, alert patient with clear lung sounds",
      "Excessive secretions obstructing effective ventilation",
      "Routine prophylactic suctioning of every intubated patient every 2 minutes",
      "A patient who is talking normally with no airway compromise",
    ],
    correctIndices: [0, 2],
    explanation:
      "Suctioning is indicated when there is visible vomitus, blood, or secretions obstructing the airway or interfering with ventilation. It is not indicated in an alert, clear-lung-sounds patient with no compromise, and routine timed prophylactic suctioning without a clinical indication is not appropriate practice and can cause hypoxia and airway trauma.",
  },
  {
    id: "aemt-airway-5013",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "What is the maximum recommended duration for a single suctioning attempt in an adult patient?",
    choices: ["5 seconds", "15 seconds", "30 seconds", "60 seconds"],
    answerIndex: 1,
    explanation:
      "Suctioning should be limited to no more than 15 seconds per attempt in an adult to minimize the risk of hypoxia, since suctioning removes oxygen along with secretions and interrupts ventilation. If more suctioning is needed, the patient should be reoxygenated between attempts.",
  },
  {
    id: "aemt-airway-5014",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "A rigid (Yankauer) suction catheter is preferred over a soft, flexible catheter for which clinical situation?",
    choices: [
      "Suctioning a tracheostomy tube",
      "Suctioning thick vomitus or large particulate matter from the oropharynx",
      "Suctioning an endotracheal tube in an intubated patient",
      "Suctioning the nasal passages",
    ],
    answerIndex: 1,
    explanation:
      "The rigid Yankauer catheter has a wide bore and is best suited for suctioning the oropharynx of thick vomitus, blood clots, and large particulate matter. Soft flexible catheters are preferred for suctioning through an endotracheal or tracheostomy tube, or through the nose, where a rigid tip could cause trauma.",
  },
  {
    id: "aemt-airway-5015",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "While suctioning a patient, the AEMT notes the cardiac monitor shows a new bradycardia developing. What is the most appropriate action?",
    choices: [
      "Continue suctioning until the airway is completely clear",
      "Stop suctioning, reoxygenate the patient, and monitor the heart rate",
      "Increase suction pressure to finish more quickly",
      "Switch to a rigid catheter and continue",
    ],
    answerIndex: 1,
    explanation:
      "Suctioning can stimulate the vagus nerve and cause bradycardia, particularly in pediatric patients. Developing bradycardia during suctioning is a sign to stop immediately, reoxygenate, and reassess rather than continuing or increasing suction pressure, which would worsen vagal stimulation and hypoxia.",
  },
  {
    id: "aemt-airway-5016",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which oxygen delivery device can provide the highest concentration of supplemental oxygen without positive pressure ventilation?",
    choices: [
      "Nasal cannula",
      "Simple face mask",
      "Non-rebreather mask",
      "Venturi mask",
    ],
    answerIndex: 2,
    explanation:
      "A non-rebreather mask with a properly inflated reservoir bag and a tight seal can deliver an FiO2 of approximately 80-95% at 10-15 L/min, the highest concentration achievable without positive pressure ventilation. A nasal cannula delivers roughly 24-44%, a simple face mask roughly 40-60%, and a Venturi mask provides precisely titrated lower concentrations.",
  },
  {
    id: "aemt-airway-5017",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "A nasal cannula at a flow rate of 2-6 L/min delivers approximately what FiO2 range?",
    choices: ["10-15%", "24-44%", "60-80%", "90-100%"],
    answerIndex: 1,
    explanation:
      "A nasal cannula delivers a variable FiO2 of approximately 24-44%, increasing roughly 4% for each liter per minute of flow above room air. Flow rates above 6 L/min are generally not used with a standard cannula because they dry and irritate the nasal mucosa without meaningfully increasing delivered FiO2.",
  },
  {
    id: "aemt-airway-5018",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A non-rebreather mask is applied to a hypoxic patient, but the reservoir bag remains flat and does not inflate. What should the AEMT do first?",
    choices: [
      "Apply the mask anyway; the flat bag will not affect oxygen delivery",
      "Increase the oxygen flow rate until the reservoir bag inflates before applying the mask",
      "Switch immediately to bag-valve-mask ventilation",
      "Remove the mask and use a nasal cannula instead",
    ],
    answerIndex: 1,
    explanation:
      "Before applying a non-rebreather mask, the flow rate should be increased (typically to 10-15 L/min) until the reservoir bag is fully inflated, ensuring the patient receives a high FiO2 rather than rebreathing exhaled air from an empty bag. Applying the mask with a flat bag would significantly reduce the delivered oxygen concentration.",
  },
  {
    id: "aemt-airway-5019",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a chronic history of severe COPD is found with an SpO2 of 88% and is mildly confused but breathing adequately. Which consideration is most important when deciding on the oxygen delivery method?",
    choices: [
      "COPD patients should never receive supplemental oxygen under any circumstances",
      "Titrate oxygen to an appropriate target saturation rather than immediately placing a non-rebreather mask, since some COPD patients rely partially on a hypoxic drive",
      "Always apply a non-rebreather mask at 15 L/min regardless of the patient's baseline status",
      "Withhold oxygen until the patient becomes unresponsive",
    ],
    answerIndex: 1,
    explanation:
      "While the hypoxic drive theory is more nuanced than once taught, the safest practice in a chronic COPD patient who is hypoxic but breathing adequately is to titrate oxygen to an appropriate target saturation (commonly around 88-92%) rather than immediately applying maximal high-flow oxygen, since aggressive oxygenation can occasionally worsen ventilation-perfusion mismatch and hypercapnia in some patients. A patient who is confused or deteriorating should never have oxygen withheld.",
  },
  {
    id: "aemt-airway-5020",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which of the following is a correct indication for bag-valve-mask (BVM) ventilation?",
    choices: [
      "A patient with a respiratory rate of 16 and adequate tidal volume",
      "A patient in respiratory arrest or with severely inadequate respiratory effort",
      "A fully alert patient complaining of mild shortness of breath",
      "A patient who requires only supplemental oxygen via nasal cannula",
    ],
    answerIndex: 1,
    explanation:
      "BVM ventilation is indicated for patients in respiratory arrest or those with severely inadequate ventilation (too slow, too shallow, or absent) who cannot maintain adequate oxygenation and ventilation on their own. A patient breathing adequately at a normal rate does not require positive pressure ventilation.",
  },
  {
    id: "aemt-airway-5021",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "When performing two-person BVM ventilation on an adult, what is the recommended ventilation rate for a patient who is not in cardiac arrest but requires assisted ventilation?",
    choices: ["4-6 breaths per minute", "10-12 breaths per minute", "20-24 breaths per minute", "30-36 breaths per minute"],
    answerIndex: 1,
    explanation:
      "For an adult patient requiring assisted ventilation (not in cardiac arrest), the recommended rate is 10-12 breaths per minute, or approximately one breath every 5-6 seconds. Rates significantly lower risk inadequate minute ventilation, and rates significantly higher risk hyperventilation, gastric insufflation, and decreased venous return.",
  },
  {
    id: "aemt-airway-5022",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "Which finding best indicates that bag-valve-mask ventilation is being performed effectively?",
    choices: [
      "The reservoir bag stays fully inflated throughout every breath",
      "Visible, symmetric chest rise with each ventilation and improving or maintained SpO2",
      "The patient's jaw is relaxed and the mask makes a hissing sound",
      "Ventilations are delivered as fast as possible to maximize oxygen delivery",
    ],
    answerIndex: 1,
    explanation:
      "Effective BVM ventilation is confirmed by visible, symmetric chest rise with each breath and maintenance or improvement of oxygen saturation. A hissing sound indicates a mask seal leak, and ventilating as fast as possible causes hyperventilation, gastric distension, and increased aspiration risk rather than better oxygenation.",
  },
  {
    id: "aemt-airway-5023",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "During BVM ventilation, the AEMT notes increasing resistance to bagging, absent chest rise, and a rapidly distending abdomen. What is the most likely cause?",
    choices: [
      "Correct tracheal ventilation with normal lung compliance",
      "Gastric insufflation from air entering the esophagus rather than the trachea",
      "A properly seated supraglottic airway",
      "Bronchodilation from excessive ventilation rate",
    ],
    answerIndex: 1,
    explanation:
      "Increasing bag resistance, absent chest rise, and abdominal distension during BVM ventilation are classic signs of gastric insufflation, where air is being forced into the esophagus and stomach rather than the trachea, often due to excessive ventilation pressure, rate, or an inadequate airway-opening maneuver. This increases aspiration risk and should prompt reassessment of airway positioning and technique.",
  },
  {
    id: "aemt-airway-5024",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of using an appropriately sized mask during BVM ventilation?",
    choices: [
      "To increase the tidal volume delivered",
      "To create an adequate seal over the mouth and nose, minimizing air leak",
      "To reduce the need for supplemental oxygen",
      "To eliminate the need for an airway adjunct",
    ],
    answerIndex: 1,
    explanation:
      "A correctly sized mask creates an adequate seal covering the bridge of the nose to the cleft of the chin, minimizing air leak so that delivered ventilations actually reach the lungs. Mask size does not directly affect tidal volume delivered by the bag itself, and airway adjuncts such as an OPA or NPA are still often needed to maintain airway patency even with a good mask seal.",
  },
  {
    id: "aemt-airway-5025",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A single AEMT is attempting BVM ventilation on an unresponsive patient and is struggling to maintain an adequate mask seal with the one-handed E-C clamp technique. What should the AEMT do?",
    choices: [
      "Continue with the one-handed technique regardless of leak",
      "Call for an additional provider to use a two-handed, two-person technique",
      "Abandon ventilation attempts entirely",
      "Switch to mouth-to-mask ventilation without any adjunct",
    ],
    answerIndex: 1,
    explanation:
      "A two-person BVM technique, with one provider using both hands to maintain a jaw-thrust and mask seal while a second provider squeezes the bag, produces a significantly better seal and more effective ventilation than a single-provider one-handed technique. When additional help is available, it should be used rather than persisting with a technique that is not achieving an adequate seal.",
  },
  {
    id: "aemt-airway-5026",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which supraglottic airway device is within AEMT scope of practice?",
    choices: ["Endotracheal tube via direct laryngoscopy", "King LT airway", "Surgical cricothyrotomy", "Nasotracheal intubation"],
    answerIndex: 1,
    explanation:
      "Supraglottic airway devices such as the King LT, i-gel, and Combitube are within AEMT scope of practice as blind insertion airway devices that do not require direct visualization of the vocal cords. Endotracheal intubation, surgical airways, and nasotracheal intubation are advanced airway skills reserved for paramedic-level practice.",
  },
  {
    id: "aemt-airway-5027",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    itemType: "multiple_response",
    question: "Which of the following are supraglottic airway devices used in AEMT practice? (Select 3.)",
    choices: ["King LT", "i-gel", "Combitube", "Endotracheal tube", "Surgical cricothyrotomy tube"],
    correctIndices: [0, 1, 2],
    explanation:
      "The King LT, i-gel, and Combitube are all supraglottic (extraglottic) airway devices placed blindly above the vocal cords and are within AEMT scope. The endotracheal tube requires direct visualization and placement through the vocal cords, and a surgical cricothyrotomy tube is placed via an invasive procedure, both of which are paramedic-level or higher skills.",
  },
  {
    id: "aemt-airway-5028",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Supraglottic airway devices are generally classified as which type of airway management?",
    choices: [
      "Definitive airway management requiring direct cord visualization",
      "Blind insertion advanced airway devices placed above the level of the vocal cords",
      "Surgical airway management",
      "Basic airway adjuncts equivalent to an oropharyngeal airway",
    ],
    answerIndex: 1,
    explanation:
      "Supraglottic airways are blind insertion advanced airway devices that seat in the hypopharynx above the vocal cords without requiring direct laryngoscopic visualization, making them appropriate for AEMT scope. They provide better airway protection and ventilation than basic adjuncts like an OPA, but they are not considered a truly \"definitive\" airway the way a cuffed endotracheal tube placed through the cords is.",
  },
  {
    id: "aemt-airway-5029",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT is treating a patient in cardiac arrest with ongoing high-quality CPR. Bag-valve-mask ventilation is becoming difficult to maintain effectively between compressions. What is an appropriate next step within AEMT scope?",
    choices: [
      "Perform endotracheal intubation",
      "Insert a supraglottic airway device such as a King LT or i-gel",
      "Perform a surgical cricothyrotomy",
      "Continue BVM only and never consider an advanced airway",
    ],
    answerIndex: 1,
    explanation:
      "When BVM ventilation is difficult to sustain effectively during CPR, inserting a supraglottic airway is an appropriate AEMT-scope intervention that can improve ventilation and free a rescuer's hands for other tasks. Endotracheal intubation and cricothyrotomy exceed AEMT scope of practice.",
  },
  {
    id: "aemt-airway-5030",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Before inserting a King LT airway, the AEMT should routinely do which of the following?",
    choices: [
      "Inflate the cuffs fully before insertion to make the device more visible",
      "Test the cuff integrity by inflating and deflating the cuffs, then deflate completely and lubricate the distal tip",
      "Insert the device without any preparation to save time",
      "Attach it to a bag-valve mask before insertion",
    ],
    answerIndex: 1,
    explanation:
      "Standard preparation for a King LT (and similar cuffed supraglottic devices) includes testing cuff integrity by inflating and then fully deflating the cuffs before insertion, and lubricating the distal tip to ease passage. Inserting with inflated cuffs or with no preparation increases the risk of device malfunction or insertion trauma.",
  },
  {
    id: "aemt-airway-5031",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    itemType: "build_list",
    question: "Place the following steps for inserting a King LT airway in the correct order.",
    steps: [
      "Test and then fully deflate both cuffs, and lubricate the distal tip",
      "Open the airway and insert the device midline, rotating around the tongue into the hypopharynx",
      "Advance the device until the base of the connector is aligned with the teeth or gums",
      "Inflate the cuffs with the recommended volume of air",
      "Attach a bag-valve mask and confirm placement with chest rise, breath sounds, and capnography",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "Correct King LT insertion begins with preparing and deflating the cuffs and lubricating the tip, then inserting the device to the appropriate depth, inflating the cuffs to seat the device, and finally confirming placement with ventilation and objective findings including capnography. Skipping preparation or confirming placement before inflating the cuffs would not reflect proper technique.",
  },
  {
    id: "aemt-airway-5032",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which supraglottic airway device is typically inserted without any cuff inflation because it uses a soft, gel-like seal that conforms to the patient's anatomy?",
    choices: ["King LT", "Combitube", "i-gel", "Endotracheal tube"],
    answerIndex: 2,
    explanation:
      "The i-gel is a supraglottic airway with a non-inflatable, gel-like cuff that conforms to the patient's laryngeal anatomy through body heat and pressure, eliminating the need for cuff inflation, unlike the King LT or Combitube, which both require inflating cuffs to seat the device.",
  },
  {
    id: "aemt-airway-5033",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "One advantage of the i-gel supraglottic airway over cuffed devices like the King LT is:",
    choices: [
      "It requires direct visualization of the vocal cords for placement",
      "It has no inflatable cuffs, simplifying insertion and reducing the risk of cuff-related complications",
      "It can only be used in pediatric patients",
      "It provides a lower seal pressure than any other airway device",
    ],
    answerIndex: 1,
    explanation:
      "The i-gel's lack of inflatable cuffs simplifies insertion (no need to manage inflation volumes) and eliminates cuff-related complications such as overinflation trauma or cuff leak. It does not require direct cord visualization (that is its advantage as a blind insertion device), and it is available in adult and pediatric sizes, not pediatric-only.",
  },
  {
    id: "aemt-airway-5034",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The Combitube (esophageal-tracheal Combitube) has two lumens because:",
    choices: [
      "One lumen ventilates through the pharyngeal openings while the other can pass into either the esophagus or trachea, and either placement can be used to ventilate the patient",
      "One lumen is used for suctioning gastric contents while the other is decorative",
      "Both lumens must always be used simultaneously to ventilate",
      "One lumen is for oxygen and the other is for medication administration",
    ],
    answerIndex: 0,
    explanation:
      "The Combitube's dual-lumen design allows it to function correctly regardless of whether it is blindly inserted into the esophagus (the more common outcome, ventilated through the pharyngeal lumen with openings above the laryngeal inlet) or into the trachea (ventilated directly through the tracheal lumen), making it usable without needing to confirm which structure it entered before beginning ventilation attempts on the appropriate lumen.",
  },
  {
    id: "aemt-airway-5035",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A Combitube has been inserted and, after inflating both cuffs, the AEMT ventilates through the longer (blue, pharyngeal) lumen first. Breath sounds are absent and the abdomen distends. What should the AEMT do?",
    choices: [
      "Immediately remove the entire device and start over from scratch",
      "Stop ventilating that lumen, and instead ventilate through the shorter (clear, tracheal) lumen, then reassess",
      "Continue ventilating the same lumen at a faster rate",
      "Deflate both cuffs and leave the device in place unventilated",
    ],
    answerIndex: 1,
    explanation:
      "Absent breath sounds and abdominal distension when ventilating through the pharyngeal (blue) lumen indicate the tube has been placed tracheally rather than esophageally, so ventilation should be switched to the tracheal (clear) lumen and reassessed for chest rise and breath sounds. This is a normal, expected troubleshooting step for the Combitube's dual-lumen design, not a failure requiring complete removal.",
  },
  {
    id: "aemt-airway-5036",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "A relative contraindication to Combitube placement includes:",
    choices: [
      "Cardiac arrest with no gag reflex",
      "A patient with known esophageal disease, caustic ingestion, or who is shorter than the minimum height requirement",
      "An unresponsive patient with an absent gag reflex requiring airway management",
      "A patient over 16 years old",
    ],
    answerIndex: 1,
    explanation:
      "The Combitube is contraindicated in patients with known esophageal disease or recent caustic ingestion (due to esophageal cuff inflation risk) and in patients below the device's minimum height requirement, since it is sized for larger adolescents and adults. Absent gag reflex and cardiac arrest are indications for supraglottic airway use, not contraindications.",
  },
  {
    id: "aemt-airway-5037",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question: "Which patient is an appropriate candidate for supraglottic airway insertion?",
    choices: [
      "An unresponsive cardiac arrest patient with no gag reflex",
      "An awake, alert patient who is talking and has an intact gag reflex",
      "A conscious patient with a strong cough reflex",
      "A patient actively vomiting with an intact gag reflex",
    ],
    answerIndex: 0,
    explanation:
      "Supraglottic airways require the absence of a gag reflex, which is typically found in unresponsive patients such as those in cardiac arrest, deep coma, or without airway-protective reflexes. Placing one in an awake patient, or a patient with an intact gag or cough reflex, would provoke vomiting and is contraindicated.",
  },
  {
    id: "aemt-airway-5038",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    itemType: "multiple_response",
    question: "Which of the following are general contraindications to supraglottic airway placement? (Select 3.)",
    choices: [
      "Intact gag reflex",
      "Known or suspected esophageal disease",
      "Patient shorter than the device's minimum height requirement",
      "Cardiac arrest with absent airway reflexes",
      "Unresponsiveness with no gag reflex",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "Supraglottic airways are contraindicated when the patient has an intact gag reflex (risk of vomiting/laryngospasm), known esophageal disease (risk of injury from cuff inflation), or is below the device's sizing range. Cardiac arrest with absent airway reflexes and general unresponsiveness without a gag reflex are appropriate indications, not contraindications.",
  },
  {
    id: "aemt-airway-5039",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question: "After inserting and inflating a supraglottic airway, the FIRST step to confirm proper placement is:",
    choices: [
      "Obtain a chest X-ray",
      "Ventilate and observe for bilateral chest rise, auscultate breath sounds, and attach waveform capnography",
      "Assume placement is correct because insertion felt smooth",
      "Wait 10 minutes before assessing placement",
    ],
    answerIndex: 1,
    explanation:
      "Placement of any advanced airway device, including a supraglottic airway, must be confirmed immediately using multiple methods: visualizing bilateral chest rise, auscultating breath sounds bilaterally and over the epigastrium, and attaching waveform capnography, which is considered the gold standard confirmation tool available in the field. A chest X-ray is not available prehospitally, and placement should never be assumed based on insertion feel alone.",
  },
  {
    id: "aemt-airway-5040",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "After insertion of a supraglottic airway, the AEMT notes gurgling sounds and a rising capnography waveform baseline with a poorly defined alveolar plateau. This most likely indicates:",
    choices: [
      "A well-secured airway with excellent ventilation",
      "Secretions or airway obstruction affecting ventilation, requiring suction and reassessment",
      "Normal expected capnography for any advanced airway",
      "Correct tracheal placement requiring no further action",
    ],
    answerIndex: 1,
    explanation:
      "Gurgling sounds suggest secretions or fluid in the airway, and a rising baseline with a poorly defined alveolar plateau on capnography suggests inadequate ventilation or partial obstruction, both of which require suctioning and reassessment of the airway rather than being accepted as normal findings.",
  },
  {
    id: "aemt-airway-5041",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What is the primary purpose of the pilot balloon on a cuffed airway device?",
    choices: [
      "It indicates the presence and approximate pressure of air in the cuff without needing to visualize the cuff directly",
      "It delivers supplemental oxygen to the patient",
      "It is used to suction secretions from the airway",
      "It measures the patient's end-tidal CO2",
    ],
    answerIndex: 0,
    explanation:
      "The pilot balloon is connected to the cuff via a small tube and inflates in parallel with it, giving the provider a way to gauge that the cuff is inflated and to estimate whether pressure seems appropriate, without being able to directly see the cuff itself once the device is inserted.",
  },
  {
    id: "aemt-airway-5042",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A patient with a properly placed and secured King LT airway needs to be transported down several flights of stairs and then in the ambulance. What should the AEMT do regarding the airway during movement?",
    choices: [
      "Remove the device before moving the patient to prevent dislodgement",
      "Continue to monitor placement and ventilation closely throughout movement and transport, reassessing after any repositioning",
      "Deflate the cuffs during movement to make the device more flexible",
      "Ignore the airway device since it is already secured and requires no further monitoring",
    ],
    answerIndex: 1,
    explanation:
      "Any advanced airway device should be continuously monitored throughout patient movement and transport, since repositioning increases the risk of dislodgement or migration, and placement should be reassessed after any significant movement. Removing the device or deflating the cuffs during transport would compromise the airway unnecessarily.",
  },
  {
    id: "aemt-airway-5043",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What does waveform capnography primarily measure?",
    choices: [
      "The percentage of oxygen saturated hemoglobin in arterial blood",
      "The partial pressure of exhaled carbon dioxide over time, displayed as a waveform",
      "The patient's respiratory rate only, with no other information",
      "The concentration of oxygen being delivered to the patient",
    ],
    answerIndex: 1,
    explanation:
      "Waveform capnography measures the partial pressure of carbon dioxide in exhaled breath (EtCO2) over time and displays it as a continuous waveform (capnogram), providing information about ventilation, perfusion, and metabolism. Pulse oximetry, not capnography, measures oxygen saturation of hemoglobin.",
  },
  {
    id: "aemt-airway-5044",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The normal range for end-tidal CO2 (EtCO2) in a healthy, adequately ventilated patient is approximately:",
    choices: ["5-10 mmHg", "15-20 mmHg", "35-45 mmHg", "60-80 mmHg"],
    answerIndex: 2,
    explanation:
      "Normal EtCO2 in a healthy, well-perfused patient with adequate ventilation is approximately 35-45 mmHg, closely paralleling arterial PaCO2 in patients without significant cardiopulmonary disease. Values well below or above this range suggest hyperventilation/hypoperfusion or hypoventilation/hypermetabolism, respectively.",
  },
  {
    id: "aemt-airway-5045",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient in cardiac arrest is receiving high-quality CPR with an advanced airway in place. The waveform capnography suddenly reads 45 mmHg, up from a baseline of 12 mmHg during CPR, with a well-formed waveform. This finding most likely indicates:",
    choices: [
      "The airway has become dislodged",
      "Return of spontaneous circulation (ROSC)",
      "Hyperventilation by the rescuer",
      "A capnography sensor malfunction requiring replacement",
    ],
    answerIndex: 1,
    explanation:
      "A sudden, sustained rise in EtCO2 during CPR (often to a normal or near-normal range) is a well-established sign of return of spontaneous circulation, because restored cardiac output delivers accumulated metabolic CO2 to the lungs for exhalation much more efficiently than chest compressions alone. This is one of the earliest indicators of ROSC available at the bedside.",
  },
  {
    id: "aemt-airway-5046",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "During CPR with continuous waveform capnography attached to an advanced airway, the EtCO2 reading abruptly drops to near zero with a flat waveform, though CPR is ongoing and unchanged. This most likely indicates:",
    choices: [
      "Excellent chest compressions producing normal cardiac output",
      "Airway dislodgement, esophageal placement, or complete obstruction",
      "Normal expected fluctuation during cardiac arrest",
      "The patient has achieved ROSC",
    ],
    answerIndex: 1,
    explanation:
      "An abrupt drop to near-zero EtCO2 with a flat waveform during ongoing, unchanged CPR strongly suggests the advanced airway has become dislodged, was placed in the esophagus, or is completely obstructed, since CO2 would no longer be reaching the sensor from the lungs. This requires immediate airway reassessment.",
  },
  {
    id: "aemt-airway-5047",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient in septic shock has a persistently low EtCO2 (around 18 mmHg) despite an adequate respiratory rate and depth. This finding is most consistent with:",
    choices: [
      "Excellent perfusion and cardiac output",
      "Poor perfusion/low cardiac output limiting CO2 delivery to the lungs, or hyperventilation as a compensatory response",
      "Airway obstruction",
      "Normal physiology requiring no further evaluation",
    ],
    answerIndex: 1,
    explanation:
      "In shock states, EtCO2 can be low even with adequate ventilation because poor perfusion limits the delivery of metabolically produced CO2 to the lungs for exhalation, and patients often hyperventilate as a compensatory response to metabolic acidosis, further lowering EtCO2. A persistently low EtCO2 in a shock patient is a useful, non-invasive marker correlating with severity of perfusion deficit and can trend with resuscitation efforts.",
  },
  {
    id: "aemt-airway-5048",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "On a capnography waveform, the flat portion at the beginning of exhalation (phase I) represents:",
    choices: [
      "Alveolar gas exchange",
      "Dead space air from the conducting airways, which contains no CO2",
      "The peak of expired CO2",
      "Inspiration",
    ],
    answerIndex: 1,
    explanation:
      "Phase I of the capnogram represents exhalation of dead space air from the conducting airways (trachea, bronchi), which contains essentially no CO2 since gas exchange has not yet occurred there, producing a flat baseline at the start of exhalation before the waveform rises as alveolar gas begins to reach the sensor.",
  },
  {
    id: "aemt-airway-5049",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient having an acute severe asthma exacerbation is placed on continuous waveform capnography. The waveform shows a characteristic \"shark fin\" shape with a sloped upstroke instead of a sharp rise. This waveform pattern is classically associated with:",
    choices: [
      "Normal ventilation with no bronchospasm",
      "Bronchospasm causing uneven emptying of alveoli during exhalation",
      "Esophageal intubation",
      "Hyperventilation",
    ],
    answerIndex: 1,
    explanation:
      "The \"shark fin\" capnogram, with a sloped rather than sharp upstroke and loss of a clear alveolar plateau, is a classic finding in bronchospasm (asthma or COPD exacerbation), reflecting uneven, delayed emptying of alveoli with varying time constants during exhalation. It is a useful visual cue for recognizing and trending bronchospasm severity and response to treatment.",
  },
  {
    id: "aemt-airway-5050",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "options_table",
    clinicalJudgmentStep: "analyze_cues",
    question: "For each capnography finding, select the most likely underlying cause.",
    rows: [
      { id: "row1", finding: "Sudden EtCO2 rise to near-normal during ongoing CPR", options: ["Esophageal placement", "Return of spontaneous circulation", "Bronchospasm", "Hyperventilation"], correctOptionIndex: 1 },
      { id: "row2", finding: "Persistently near-zero, flat waveform after intubation attempt", options: ["Correct tracheal placement", "Esophageal placement", "Excellent perfusion", "Normal variant"], correctOptionIndex: 1 },
      { id: "row3", finding: "Sloped upstroke, poorly defined plateau (\"shark fin\")", options: ["Bronchospasm", "ROSC", "Hyperventilation", "Excellent chest compressions"], correctOptionIndex: 0 },
      { id: "row4", finding: "Progressive downward trend in EtCO2 over several minutes in a shock patient with unchanged ventilation", options: ["Improving perfusion", "Worsening perfusion or hyperventilation", "Airway obstruction", "Device malfunction only"], correctOptionIndex: 1 },
    ],
    explanation:
      "Each capnography pattern has a distinct clinical meaning: sudden near-normal EtCO2 during CPR suggests ROSC; a persistently flat, near-zero waveform after intubation indicates esophageal placement; a sloped shark-fin waveform indicates bronchospasm; and a progressive downward EtCO2 trend with unchanged ventilation in a shock patient suggests worsening perfusion or a developing compensatory hyperventilation. Recognizing these patterns is a core AEMT competency for capnography interpretation.",
  },
  {
    id: "aemt-airway-5051",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What does pulse oximetry (SpO2) actually measure?",
    choices: [
      "The partial pressure of dissolved oxygen in arterial plasma",
      "The percentage of hemoglobin molecules bound to oxygen (oxygen saturation)",
      "The total oxygen content of the blood, including dissolved oxygen",
      "The partial pressure of carbon dioxide in exhaled air",
    ],
    answerIndex: 1,
    explanation:
      "Pulse oximetry measures the percentage of hemoglobin molecules that are saturated with oxygen (SpO2), using the differential absorption of light by oxygenated versus deoxygenated hemoglobin. It does not directly measure dissolved oxygen (PaO2), total oxygen content, or CO2, which is measured by capnography.",
  },
  {
    id: "aemt-airway-5052",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient rescued from a house fire has a pulse oximetry reading of 98% but appears cyanotic, confused, and has a headache with nausea. This scenario is a classic example of why pulse oximetry is unreliable in which condition?",
    choices: [
      "Hypothermia",
      "Carbon monoxide poisoning, because standard pulse oximetry cannot distinguish carboxyhemoglobin from oxyhemoglobin",
      "Hyperventilation",
      "Anemia",
    ],
    answerIndex: 1,
    explanation:
      "Standard pulse oximeters cannot distinguish carboxyhemoglobin (CO bound to hemoglobin) from oxyhemoglobin because they absorb light similarly, so a patient with significant carbon monoxide poisoning can show a falsely normal or near-normal SpO2 despite severe functional hypoxia. Specialized co-oximetry is required to accurately detect carboxyhemoglobin levels.",
  },
  {
    id: "aemt-airway-5053",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question: "Which of the following can cause a falsely low or inaccurate pulse oximetry reading?",
    choices: [
      "Warm, well-perfused extremities",
      "Poor peripheral perfusion, nail polish, patient motion, or severe anemia",
      "A patient breathing room air with normal perfusion",
      "Correct probe placement on a clean, dry finger",
    ],
    answerIndex: 1,
    explanation:
      "Poor peripheral perfusion (from hypothermia, shock, or vasoconstriction), dark nail polish, excessive patient motion, and severe anemia can all interfere with accurate pulse oximetry readings by reducing the pulsatile signal the device relies on or altering the light absorption pattern. Warm, well-perfused extremities and correct probe placement support accurate readings.",
  },
  {
    id: "aemt-airway-5054",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A pulse oximeter attached to a patient's finger displays no waveform and an error message, despite the AEMT believing the patient is adequately perfused. What is the most appropriate next step?",
    choices: [
      "Trust the numeric reading that was last displayed and take no further action",
      "Reposition or relocate the probe (such as to an earlobe), check for interfering factors, and correlate with clinical assessment",
      "Immediately assume the patient is in cardiac arrest",
      "Disregard pulse oximetry entirely for the rest of the call",
    ],
    answerIndex: 1,
    explanation:
      "When pulse oximetry fails to obtain a reliable signal, the appropriate response is to troubleshoot: reposition or relocate the probe, check for interfering factors like nail polish or poor perfusion, and rely on clinical assessment (skin color, respiratory effort, mental status, auscultation) rather than trusting an unreliable or absent reading, or abandoning the assessment tool entirely for the rest of the encounter.",
  },
  {
    id: "aemt-airway-5055",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Continuous positive airway pressure (CPAP) is primarily indicated for which type of patient?",
    choices: [
      "A patient in complete respiratory arrest with no spontaneous breathing effort",
      "An awake, alert patient with moderate to severe respiratory distress from conditions like CHF/pulmonary edema or COPD exacerbation who has adequate spontaneous respiratory effort",
      "A patient with a suspected pneumothorax",
      "A patient with isolated facial trauma and no respiratory distress",
    ],
    answerIndex: 1,
    explanation:
      "CPAP is indicated for an awake, alert patient with moderate to severe respiratory distress and adequate spontaneous respiratory effort, most classically from congestive heart failure/pulmonary edema or COPD exacerbation, where it helps recruit alveoli, reduce work of breathing, and improve oxygenation. It requires the patient to be breathing spontaneously and able to protect their airway, ruling out patients in respiratory arrest.",
  },
  {
    id: "aemt-airway-5056",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    itemType: "multiple_response",
    question: "Which of the following are contraindications to CPAP use? (Select 3.)",
    choices: [
      "Suspected pneumothorax",
      "Vomiting or an inability to protect the airway",
      "Unresponsiveness or inadequate respiratory effort",
      "Moderate respiratory distress from CHF with an intact airway",
      "Alert patient with COPD exacerbation who can follow commands",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "CPAP is contraindicated in suspected pneumothorax (positive pressure can worsen a tension pneumothorax), vomiting or inability to protect the airway (aspiration risk with a sealed mask), and unresponsiveness or inadequate respiratory effort (the patient must be able to initiate spontaneous breaths for CPAP to work). Moderate CHF distress with an intact airway and an alert, cooperative COPD patient are appropriate candidates, not contraindications.",
  },
  {
    id: "aemt-airway-5057",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient on CPAP for pulmonary edema suddenly becomes hypotensive shortly after the mask is applied and pressure is increased. What is the most likely explanation?",
    choices: [
      "CPAP always causes hypertension, so this is expected",
      "Increased intrathoracic pressure from CPAP reducing venous return and preload, thereby lowering cardiac output and blood pressure",
      "The patient is having an allergic reaction to the mask material",
      "CPAP has no effect on blood pressure under any circumstances",
    ],
    answerIndex: 1,
    explanation:
      "Positive airway pressure from CPAP increases intrathoracic pressure, which can reduce venous return to the heart (preload), and in a volume-depleted or borderline hypotensive patient this can lower cardiac output and blood pressure. This is a recognized hemodynamic effect that must be monitored for during CPAP use, particularly in patients with marginal blood pressure at baseline.",
  },
  {
    id: "aemt-airway-5058",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "A patient using CPAP for severe respiratory distress becomes progressively less responsive and unable to maintain the mask seal or follow commands. What is the appropriate action?",
    choices: [
      "Continue CPAP unchanged since it is already working",
      "Remove CPAP and prepare to support ventilation with a bag-valve-mask, since the patient can no longer protect their airway or actively participate",
      "Increase the CPAP pressure further to compensate",
      "Switch to a nasal cannula only",
    ],
    answerIndex: 1,
    explanation:
      "CPAP requires an awake, cooperative patient who can protect their own airway and actively participate in the therapy. A patient becoming less responsive and unable to maintain the mask seal is a sign that CPAP is failing or the patient's condition is deteriorating, requiring removal of CPAP and transition to more aggressive airway support such as BVM ventilation, potentially with an advanced airway.",
  },
  {
    id: "aemt-airway-5059",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the primary physiologic mechanism by which CPAP improves oxygenation in a patient with pulmonary edema?",
    choices: [
      "It directly reduces blood pressure to decrease cardiac workload",
      "It provides continuous positive pressure that recruits collapsed alveoli, improves functional residual capacity, and helps push fluid out of the alveoli back into the pulmonary capillaries",
      "It delivers a paralytic medication to relax the airway muscles",
      "It functions identically to a simple nasal cannula but at a higher flow rate",
    ],
    answerIndex: 1,
    explanation:
      "CPAP works primarily by providing continuous positive pressure throughout the respiratory cycle, which recruits and keeps open collapsed or fluid-filled alveoli, improves functional residual capacity, and helps redistribute fluid from the alveolar spaces back into the pulmonary capillaries in cases of pulmonary edema, improving gas exchange and reducing work of breathing.",
  },
  {
    id: "aemt-airway-5060",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A conscious adult suddenly clutches their throat, cannot speak, and has a forceful but ineffective cough. What is the most appropriate immediate management?",
    choices: [
      "Perform a blind finger sweep of the mouth",
      "Perform abdominal thrusts (or chest thrusts if pregnant/obese) until the object is expelled or the patient becomes unresponsive",
      "Immediately begin CPR",
      "Insert an oropharyngeal airway",
    ],
    answerIndex: 1,
    explanation:
      "A conscious adult with a complete foreign body airway obstruction (unable to speak, ineffective cough, clutching the throat, the universal choking sign) should receive abdominal thrusts (or chest thrusts in pregnant or significantly obese patients) until the object is expelled or the patient becomes unresponsive. A blind finger sweep is not recommended because it can push the object further into the airway; CPR is initiated only once the patient becomes unresponsive; an OPA would not clear an obstructing foreign body.",
  },
  {
    id: "aemt-airway-5061",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A choking adult with a complete airway obstruction becomes unresponsive. What is the correct next step in management?",
    choices: [
      "Continue abdominal thrusts while the patient is on the ground",
      "Begin CPR starting with chest compressions, and check the airway for a visible foreign body before delivering each set of ventilations",
      "Immediately perform an emergency surgical airway",
      "Place the patient in the recovery position and wait for the object to be coughed out",
    ],
    answerIndex: 1,
    explanation:
      "When a choking patient becomes unresponsive, standard practice shifts to CPR beginning with chest compressions (which can help dislodge the object by increasing intrathoracic pressure), with a visual check of the airway before ventilations to remove any visible foreign body, rather than continuing abdominal thrusts on a patient now lying supine and unresponsive.",
  },
  {
    id: "aemt-airway-5062",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Direct laryngoscopy to visualize and remove a foreign body with Magill forceps is within which provider's scope of practice?",
    choices: ["Emergency Medical Responder (EMR)", "EMT-Basic", "AEMT", "Layperson bystander"],
    answerIndex: 2,
    explanation:
      "The use of Magill forceps under direct laryngoscopy to visualize and remove an upper airway foreign body is an AEMT-level (and above) skill, since it involves laryngoscopy equipment. EMR, EMT-Basic, and layperson bystanders are limited to basic airway maneuvers, back blows/abdominal thrusts, and BLS airway techniques.",
  },
  {
    id: "aemt-airway-5063",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A 3-year-old presents with sudden-onset drooling, high fever, stridor, and a tripod (sniffing) positioning, appearing anxious and refusing to lie down. The AEMT should suspect which condition and avoid which action?",
    choices: [
      "Suspect a simple upper respiratory infection and encourage the child to lie flat for examination",
      "Suspect epiglottitis and avoid agitating the child, examining the oropharynx with a tongue depressor, or attempting supine positioning",
      "Suspect croup and immediately attempt oral intubation",
      "Suspect asthma and administer high-dose corticosteroids immediately without further assessment",
    ],
    answerIndex: 1,
    explanation:
      "This presentation (drooling, high fever, stridor, tripod positioning, anxious appearance, and refusal to lie flat) is classic for epiglottitis, a life-threatening supraglottic swelling. Management should focus on avoiding agitation, never examining the oropharynx with a tongue depressor or attempting to visualize/instrument the airway (which can precipitate complete obstruction), and allowing the child to remain in their position of comfort during rapid transport.",
  },
  {
    id: "aemt-airway-5064",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A 2-year-old has a barking (seal-like) cough, inspiratory stridor, and a low-grade fever that developed gradually over a day, following several days of cold-like symptoms. This presentation is most consistent with:",
    choices: ["Epiglottitis", "Croup (laryngotracheobronchitis)", "Foreign body aspiration", "Anaphylaxis"],
    answerIndex: 1,
    explanation:
      "A barking, seal-like cough with inspiratory stridor, low-grade fever, and a gradual onset following upper respiratory symptoms is the classic presentation of croup (viral laryngotracheobronchitis), which typically has a more gradual onset and milder toxic appearance than the abrupt, high-fever, drooling presentation of epiglottitis.",
  },
  {
    id: "aemt-airway-5065",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A toddler was playing with small toys and suddenly developed a coughing fit followed by unilateral wheezing on auscultation, with no fever and no preceding illness. This presentation is most suspicious for:",
    choices: ["Croup", "Epiglottitis", "Foreign body aspiration", "Asthma exacerbation"],
    answerIndex: 2,
    explanation:
      "A sudden onset of coughing, choking, or unilateral wheezing in a young child, especially with a history of playing with small objects and no preceding illness or fever, is highly suspicious for foreign body aspiration, which classically produces asymmetric (unilateral) breath sound findings rather than the diffuse, bilateral wheezing typical of asthma.",
  },
  {
    id: "aemt-airway-5066",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Compared to an adult BVM, ventilating a pediatric patient requires which key adjustment?",
    choices: [
      "Using significantly higher tidal volumes than an adult",
      "Using a pediatric-sized mask and bag, and delivering just enough volume to produce visible chest rise, avoiding excessive volume or pressure",
      "Using the exact same adult bag and mask for all pediatric patients regardless of age",
      "Ventilating at half the recommended rate for the patient's age",
    ],
    answerIndex: 1,
    explanation:
      "Pediatric ventilation requires an appropriately sized pediatric mask and bag, delivering only enough volume to achieve visible chest rise, since pediatric lungs are more susceptible to barotrauma and gastric insufflation from excessive volume or pressure. Using an adult bag or excessive volumes risks significant lung injury in a smaller patient.",
  },
  {
    id: "aemt-airway-5067",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What is the recommended assisted ventilation rate for an infant or child (not in cardiac arrest) requiring respiratory support?",
    choices: ["4-6 breaths per minute", "12-20 breaths per minute", "40-50 breaths per minute", "60-80 breaths per minute"],
    answerIndex: 1,
    explanation:
      "For infants and children requiring assisted ventilation who are not in cardiac arrest, the recommended rate is approximately 12-20 breaths per minute (roughly one breath every 3-5 seconds), which is faster than the adult rate to match the higher normal pediatric respiratory rate and metabolic demand.",
  },
  {
    id: "aemt-airway-5068",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "When positioning an infant's airway for BVM ventilation, the AEMT should typically:",
    choices: [
      "Hyperextend the neck as far as possible, identical to adult positioning",
      "Place a small towel or padding under the shoulders to compensate for the infant's proportionally large occiput and avoid neck flexion",
      "Flex the neck sharply forward",
      "Avoid any positioning adjustment since infant anatomy is identical to adult anatomy",
    ],
    answerIndex: 1,
    explanation:
      "Infants have a proportionally large occiput that causes passive neck flexion when lying flat, which can obstruct the airway. Placing padding under the shoulders (not the head) helps achieve a neutral, \"sniffing\" position appropriate for the infant airway, rather than the more extended positioning used in adults.",
  },
  {
    id: "aemt-airway-5069",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT is selecting a King LT-D (pediatric-capable) airway size for a child based on the manufacturer's sizing guide. Sizing for pediatric supraglottic airways is most commonly based on:",
    choices: [
      "The patient's age only, with weight and height ignored",
      "The patient's weight or height, per the manufacturer's specific sizing chart",
      "A fixed universal size used for all pediatric patients",
      "The size of the patient's little finger",
    ],
    answerIndex: 1,
    explanation:
      "Pediatric supraglottic airway sizing (such as for pediatric King LT or i-gel devices) is based on the patient's weight or height according to the specific manufacturer's sizing chart, since a fixed or age-only approach would not reliably account for the wide variation in pediatric body size at a given age.",
  },
  {
    id: "aemt-airway-5070",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What is the purpose of the pop-off (pressure relief) valve found on many pediatric bag-valve-mask devices?",
    choices: [
      "To increase the delivered tidal volume automatically",
      "To vent excess pressure and reduce the risk of barotrauma from overly forceful ventilation",
      "To filter bacteria from exhaled air",
      "To measure the patient's end-tidal CO2",
    ],
    answerIndex: 1,
    explanation:
      "The pop-off (pressure relief) valve on pediatric BVM devices is designed to vent excess pressure once a preset threshold is reached, reducing the risk of barotrauma (such as pneumothorax) from overly forceful or excessive ventilation in the more fragile pediatric lung. In some critical situations requiring higher pressures, it can be manually occluded, but this should be done cautiously.",
  },
  {
    id: "aemt-airway-5071",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "An adult patient presents with acute onset of tongue and lip swelling, difficulty swallowing, and a muffled \"hot potato\" voice after starting a new ACE inhibitor medication. The AEMT should be most concerned about:",
    choices: [
      "A simple allergic skin reaction with no airway involvement",
      "Angioedema causing progressive upper airway obstruction, a time-critical airway emergency",
      "A routine dental infection",
      "Normal medication side effects requiring no airway monitoring",
    ],
    answerIndex: 1,
    explanation:
      "ACE inhibitor-induced angioedema causing tongue/lip swelling, dysphagia, and a muffled voice represents a potentially rapidly progressive upper airway obstruction and is a true airway emergency requiring close monitoring, early advanced airway consideration if deterioration occurs, and rapid transport, since the airway can become completely obstructed with little warning.",
  },
  {
    id: "aemt-airway-5072",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A patient with severe anaphylaxis is developing audible stridor and increasing work of breathing. In addition to epinephrine administration, which airway-related consideration is most important?",
    choices: [
      "Delay airway management indefinitely since epinephrine alone always resolves the airway swelling immediately",
      "Anticipate that airway swelling may progress rapidly and be prepared to manage a difficult or worsening airway, including early consideration of a supraglottic airway if the patient deteriorates and loses protective reflexes",
      "Avoid administering epinephrine because of the airway swelling",
      "Withhold oxygen until the epinephrine takes effect",
    ],
    answerIndex: 1,
    explanation:
      "In anaphylaxis with developing stridor, epinephrine is the priority treatment, but the airway can continue to deteriorate rapidly even after treatment, so the AEMT must anticipate potential progression and be prepared to manage the airway aggressively, including early consideration of a supraglottic airway if the patient loses protective airway reflexes, since a progressively swollen airway becomes harder to manage the longer intervention is delayed.",
  },
  {
    id: "aemt-airway-5073",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which of the following best describes the mechanism of hypoxic drive as it relates to airway/breathing physiology?",
    choices: [
      "The primary stimulus for breathing in all patients is a rise in arterial oxygen levels",
      "In some patients with chronic hypercapnia (such as severe COPD), the normal CO2-driven respiratory stimulus may be blunted, and a fall in oxygen levels becomes a more significant driver of respiratory effort",
      "Hypoxic drive has no clinical relevance to prehospital oxygen therapy",
      "Hypoxic drive causes increased CO2 sensitivity in all patients",
    ],
    answerIndex: 1,
    explanation:
      "In patients with chronic, severe hypercapnia (some advanced COPD patients), chronic elevation of CO2 can blunt the normal central chemoreceptor response to CO2, making hypoxemia a relatively more significant respiratory drive stimulus in that subset of patients. This concept, while more nuanced and less universal than once taught, is still relevant to thoughtful oxygen titration in this specific population.",
  },
  {
    id: "aemt-airway-5074",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT successfully inserts a King LT airway in a cardiac arrest patient. The device is inflated and secured. What is the appropriate ventilation strategy for this patient during ongoing CPR?",
    choices: [
      "Pause compressions for every ventilation, delivering a breath every 2 compressions",
      "Deliver asynchronous ventilations at approximately 10 breaths per minute without pausing compressions",
      "Stop ventilating entirely once an advanced airway is placed",
      "Ventilate at 30 breaths per minute continuously",
    ],
    answerIndex: 1,
    explanation:
      "Once an advanced airway (including a supraglottic device) is in place during cardiac arrest, compressions should be continuous and asynchronous with ventilations, which are delivered at approximately one breath every 6 seconds (about 10 breaths per minute), rather than pausing compressions for each breath as is done before an advanced airway is placed.",
  },
  {
    id: "aemt-airway-5075",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What complication can result from overinflating the cuffs of a supraglottic airway device?",
    choices: [
      "Improved seal with no downside",
      "Tissue ischemia, mucosal injury, or nerve injury (such as to the tongue or laryngeal structures) from excessive cuff pressure",
      "Automatically improved oxygenation",
      "Reduced risk of aspiration with no other effects",
    ],
    answerIndex: 1,
    explanation:
      "Overinflating the cuffs of a supraglottic airway beyond the manufacturer's recommended volume/pressure can cause tissue ischemia, mucosal injury, or nerve injury (such as lingual or hypoglossal nerve injury from excessive pressure on surrounding structures), so cuffs should be inflated only to the recommended volume, not maximally.",
  },
  {
    id: "aemt-airway-5076",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    itemType: "build_list",
    question: "Place the following steps for confirming and securing an advanced airway device after insertion in the correct order.",
    steps: [
      "Ventilate and observe for bilateral chest rise",
      "Auscultate breath sounds bilaterally and over the epigastrium",
      "Attach and confirm a consistent waveform on continuous capnography",
      "Secure the device in place and document the depth/position",
      "Reassess placement after any patient movement or repositioning",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "After insertion, placement is confirmed through visual chest rise, bilateral and epigastric auscultation, and continuous waveform capnography before the device is secured and its position documented, and reassessment continues after any movement. Securing the device before confirming placement risks locking in an incorrectly placed airway.",
  },
  {
    id: "aemt-airway-5077",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which airway management skill is generally OUTSIDE the AEMT scope of practice, per national scope-of-practice standards?",
    choices: [
      "Insertion of a King LT supraglottic airway",
      "Orotracheal intubation using direct laryngoscopy",
      "Bag-valve-mask ventilation",
      "Oropharyngeal and nasopharyngeal airway insertion",
    ],
    answerIndex: 1,
    explanation:
      "Orotracheal intubation with direct laryngoscopy is a Paramedic-level skill in the National EMS Scope of Practice Model, not AEMT scope. AEMTs are trained in supraglottic airway insertion, BVM ventilation, and basic airway adjuncts (OPA/NPA), all of which do not require direct visualization of the vocal cords.",
  },
  {
    id: "aemt-airway-5078",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Surgical cricothyrotomy for a completely obstructed airway that cannot be managed by other means is generally:",
    choices: [
      "Within AEMT scope of practice nationally",
      "Outside AEMT scope of practice, reserved for paramedic or higher-level providers",
      "A basic EMT skill",
      "Performed routinely on every cardiac arrest patient",
    ],
    answerIndex: 1,
    explanation:
      "Surgical cricothyrotomy is an invasive procedure generally reserved for paramedic-level or higher providers under the National EMS Scope of Practice Model, and is outside AEMT (and EMT) scope of practice. It is reserved for rare, truly \"cannot intubate, cannot ventilate\" scenarios.",
  },
  {
    id: "aemt-airway-5079",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a tracheostomy tube in place develops sudden respiratory distress, and the AEMT is unable to pass a suction catheter through the tube. This finding most likely indicates:",
    choices: [
      "Normal tracheostomy function requiring no intervention",
      "A completely obstructed tracheostomy tube, requiring removal and replacement or alternative ventilation via the stoma or upper airway if appropriate",
      "The tracheostomy tube is functioning perfectly",
      "The patient needs a higher flow rate on the nasal cannula only",
    ],
    answerIndex: 1,
    explanation:
      "Inability to pass a suction catheter through a tracheostomy tube strongly suggests the tube is obstructed (mucus plug, dried secretions, or displacement), requiring the AEMT to attempt removal and replacement of the tube (if trained and equipped) or to provide alternative oxygenation/ventilation via the stoma directly or, if the upper airway is patent and the stoma can be occluded, via the mouth and nose, depending on local protocol and the reason the tracheostomy was originally placed.",
  },
  {
    id: "aemt-airway-5080",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "When bag-valve-mask ventilating a patient with a tracheostomy stoma, the AEMT should generally:",
    choices: [
      "Ventilate through the mouth and nose only, ignoring the stoma completely",
      "Use a properly sized mask sealed directly over the stoma (a pediatric mask often works well for this) while occluding the mouth and nose if air escapes upward",
      "Never attempt to ventilate a tracheostomy patient under any circumstances",
      "Insert an oropharyngeal airway to bypass the stoma",
    ],
    answerIndex: 1,
    explanation:
      "A patient with a tracheostomy (especially one with a total laryngectomy, whose only airway route is the stoma) is ventilated using an appropriately sized mask (often a pediatric-sized mask fits the stoma opening well) sealed directly over the stoma, and if air escapes upward through the mouth/nose in a patient who still has an intact upper airway connection, those should be manually occluded to direct ventilation through the stoma.",
  },
  {
    id: "aemt-airway-5081",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient in respiratory distress has a respiratory rate of 6 breaths per minute with shallow, irregular breathing after taking a large dose of an opioid medication. What is the most appropriate initial airway/breathing management?",
    choices: [
      "Administer high-flow oxygen via nasal cannula only and reassess in 10 minutes",
      "Assist ventilations with a bag-valve mask while preparing to administer naloxone per protocol",
      "Withhold all airway intervention until naloxone is given and takes effect",
      "Immediately attempt a surgical airway",
    ],
    answerIndex: 1,
    explanation:
      "A respiratory rate of 6 with shallow, irregular breathing represents inadequate ventilation requiring immediate assisted ventilation with a bag-valve mask; this should not be delayed while waiting for naloxone to take effect, since naloxone's onset is not instantaneous and the patient needs ventilatory support now. Naloxone can be given per protocol alongside continued ventilatory support, not as a substitute for it.",
  },
  {
    id: "aemt-airway-5082",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient's chest rises with bag-valve-mask ventilation, but auscultation reveals breath sounds are present on the right side and absent on the left, and the trachea appears deviated to the right. This presentation is most concerning for:",
    choices: [
      "Normal bilateral ventilation",
      "A left-sided tension pneumothorax or significant hemothorax",
      "Gastric insufflation only",
      "Correct BVM technique with no abnormal findings",
    ],
    answerIndex: 1,
    explanation:
      "Unilateral absent breath sounds with tracheal deviation away from the affected side (deviated toward the side with breath sounds, meaning deviated away from the abnormal left side) is a classic finding of tension pneumothorax or significant hemothorax on the affected (left) side, a time-critical condition requiring prompt recognition and, per protocol, potential decompression or rapid transport, in addition to continued ventilatory support.",
  },
  {
    id: "aemt-airway-5083",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The primary purpose of applying cricoid pressure (Sellick maneuver) during ventilation is to:",
    choices: [
      "Improve visualization of the vocal cords during direct laryngoscopy",
      "Occlude the esophagus against the cricoid cartilage to reduce the risk of gastric insufflation and passive regurgitation/aspiration",
      "Increase tidal volume delivered to the lungs",
      "Reduce the patient's heart rate",
    ],
    answerIndex: 1,
    explanation:
      "Cricoid pressure is intended to compress the esophagus against the cricoid cartilage (the only complete tracheal ring), theoretically reducing the risk of gastric insufflation during positive pressure ventilation and passive regurgitation with aspiration. Its efficacy and continued routine use have been debated in more recent literature and it can distort anatomy if applied incorrectly, but understanding its intended mechanism remains relevant.",
  },
  {
    id: "aemt-airway-5084",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT is ventilating a patient with a bag-valve mask connected to high-flow oxygen and a reservoir. What FiO2 can be delivered with this properly configured setup?",
    choices: ["Approximately 21% (room air only)", "Approximately 40-50%", "Approximately 90-100%", "Approximately 5-10%"],
    answerIndex: 2,
    explanation:
      "A bag-valve mask connected to a properly functioning reservoir with high-flow oxygen (typically 15 L/min) can deliver an FiO2 approaching 90-100%, which is why reservoir attachment is standard practice for BVM ventilation whenever supplemental oxygen is available, rather than bagging on room air alone (approximately 21%).",
  },
  {
    id: "aemt-airway-5085",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which statement about nasopharyngeal airway (NPA) sizing and insertion is correct?",
    choices: [
      "The NPA should be inserted with the bevel facing toward the septum, aimed straight upward toward the top of the head",
      "The NPA should be lubricated with a water-soluble lubricant and inserted along the floor of the nasal passage, following the natural curve of the airway",
      "The NPA never requires lubrication",
      "The NPA should always be forced through resistance to ensure proper placement",
    ],
    answerIndex: 1,
    explanation:
      "An NPA should be lubricated with a water-soluble lubricant and gently inserted along the floor of the nasal passage (not angled upward toward the top of the head), following the natural anatomic curve of the nasal passage into the pharynx. If resistance is met, the device should be gently rotated or an attempt made in the other nostril rather than forced, which can cause significant trauma and bleeding.",
  },
  {
    id: "aemt-airway-5086",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "An AEMT inserts an oropharyngeal airway in a patient believed to be deeply unresponsive. Immediately after insertion, the patient gags and begins to retch. What does this indicate, and what should the AEMT do?",
    choices: [
      "This is a normal expected response; leave the OPA in place",
      "The patient has an intact gag reflex, and the OPA should be removed immediately to prevent vomiting and aspiration",
      "The OPA is too small and should be replaced with a larger size",
      "This indicates correct placement and no action is needed",
    ],
    answerIndex: 1,
    explanation:
      "Gagging or retching immediately after OPA insertion indicates the patient has an intact gag reflex, meaning the OPA was contraindicated in the first place and should be removed immediately to prevent vomiting and aspiration; an NPA or other airway adjunct better tolerated by a patient with intact reflexes should be considered instead if an adjunct is still needed.",
  },
  {
    id: "aemt-airway-5087",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    itemType: "drag_drop",
    clinicalJudgmentStep: "analyze_cues",
    question: "Place each airway device or technique into the category of AEMT scope of practice it belongs to.",
    categories: [
      { id: "aemt", label: "Within AEMT Scope" },
      { id: "paramedic", label: "Paramedic or Higher Scope Only" },
    ],
    items: [
      { id: "king", label: "King LT supraglottic airway insertion", correctCategory: "aemt" },
      { id: "ett", label: "Orotracheal intubation via direct laryngoscopy", correctCategory: "paramedic" },
      { id: "cric", label: "Surgical cricothyrotomy", correctCategory: "paramedic" },
      { id: "opa", label: "Oropharyngeal airway insertion", correctCategory: "aemt" },
      { id: "bvm", label: "Bag-valve-mask ventilation", correctCategory: "aemt" },
      { id: "rsi", label: "Rapid sequence induction with paralytics", correctCategory: "paramedic" },
    ],
    explanation:
      "AEMTs are trained in basic-to-intermediate airway skills including OPA/NPA, BVM ventilation, and supraglottic airway insertion (King LT, i-gel, Combitube), none of which require visualizing the vocal cords. Orotracheal intubation, surgical cricothyrotomy, and rapid sequence induction with paralytic medications are advanced procedures reserved for paramedic or higher-level scope of practice.",
  },
  {
    id: "aemt-airway-5088",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A patient presents with a hoarse voice, inspiratory stridor, and audible \"seal bark\" cough that developed over 24 hours, with a low-grade fever. The parent reports the child seemed to improve somewhat with cool night air on the way to the ambulance. This history is most consistent with:",
    choices: ["Bacterial tracheitis", "Croup, which classically may transiently improve with cool or humidified air", "Epiglottitis", "Foreign body aspiration"],
    answerIndex: 1,
    explanation:
      "Croup classically presents with a gradual onset over roughly a day, a barking cough, stridor, and low-grade fever, and symptoms often transiently improve with exposure to cool or humidified air, a feature not typical of epiglottitis (which is more acute, toxic-appearing, and does not improve with cool air) or foreign body aspiration (typically abrupt onset with no preceding illness).",
  },
  {
    id: "aemt-airway-5089",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the primary reason the AEMT should avoid using a tongue depressor or attempting to visualize the oropharynx in a child with suspected epiglottitis?",
    choices: [
      "It is painful for the child but has no other risk",
      "Stimulation of the airway in a child with epiglottitis can trigger laryngospasm or complete airway obstruction",
      "It has no clinical significance either way",
      "Tongue depressors are not available in the prehospital setting",
    ],
    answerIndex: 1,
    explanation:
      "In a child with suspected epiglottitis, the swollen epiglottis and surrounding tissue are extremely sensitive, and any instrumentation or agitation (including attempts to visualize the airway with a tongue depressor) can trigger laryngospasm or precipitate complete airway obstruction, so these actions should be strictly avoided in favor of keeping the child calm in their position of comfort during rapid transport.",
  },
  {
    id: "aemt-airway-5090",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient is being ventilated with a bag-valve mask through a properly placed supraglottic airway. The AEMT notices the capnography waveform has a normal shape but the numeric EtCO2 value is trending steadily downward from 40 to 25 mmHg over several minutes with no change in ventilation rate or volume. This trend most likely suggests:",
    choices: [
      "Airway dislodgement",
      "A developing perfusion problem (such as worsening shock) reducing CO2 delivery to the lungs",
      "Normal expected variation with no clinical significance",
      "The device has become completely obstructed",
    ],
    answerIndex: 1,
    explanation:
      "A gradually downward-trending EtCO2 with an otherwise normal waveform shape and unchanged ventilation suggests a perfusion-related process (such as worsening shock or declining cardiac output) reducing the delivery of metabolic CO2 to the lungs, rather than an airway or ventilation problem, which would more typically show an abrupt change or an abnormal waveform shape.",
  },
  {
    id: "aemt-airway-5091",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which of the following best describes the difference between the King LTS-D and the standard King LT airway?",
    choices: [
      "The King LTS-D has no functional difference from the King LT",
      "The King LTS-D includes an additional gastric access lumen allowing passage of a gastric tube to decompress the stomach",
      "The King LTS-D can only be used in pediatric patients",
      "The King LTS-D does not require cuff inflation",
    ],
    answerIndex: 1,
    explanation:
      "The King LTS-D (Laryngeal Tube Suction-Disposable) includes an additional gastric access lumen that allows passage of a gastric tube to decompress the stomach and drain gastric contents, a feature the standard King LT does not have, which can help reduce the risk of vomiting/aspiration around the device and relieve gastric distension.",
  },
  {
    id: "aemt-airway-5092",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A patient with a King LTS-D airway in place develops significant gastric distension visible on exam. What is the appropriate action, given the device's design?",
    choices: [
      "Remove the entire airway device immediately",
      "Pass a gastric tube through the dedicated gastric access lumen to decompress the stomach",
      "Increase ventilation rate to compensate",
      "Ignore the finding since it has no clinical significance",
    ],
    answerIndex: 1,
    explanation:
      "The King LTS-D's dedicated gastric access lumen exists specifically to allow gastric decompression when distension develops, by passing a gastric tube through that lumen rather than needing to remove the entire airway device or ignore a finding that increases aspiration risk and can impair ventilation.",
  },
  {
    id: "aemt-airway-5093",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "An AEMT successfully places a supraglottic airway in a cardiac arrest patient. Two minutes later, the SpO2 reading remains unobtainable and there is no capnography waveform, though the AEMT believes chest rise is occurring. What is the most appropriate interpretation and action?",
    choices: [
      "Trust that placement is correct because chest rise appears present, and continue without further checks",
      "Recognize that absent capnography waveform is a significant red flag for misplacement or complete obstruction despite apparent chest rise, and reassess/reposition the device immediately",
      "Assume the capnography device is broken and disregard it entirely",
      "Assume the patient has achieved ROSC",
    ],
    answerIndex: 1,
    explanation:
      "An absent capnography waveform is a serious red flag that should prompt immediate reassessment of airway placement, even if chest rise appears present, since chest rise can be misleading (from gastric insufflation, for example) while capnography reflects actual gas exchange at the alveolar level. Waveform capnography is considered the most reliable confirmation tool and should never be dismissed as broken without ruling out a true airway problem first.",
  },
  {
    id: "aemt-airway-5094",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    itemType: "multiple_response",
    question: "Which of the following are appropriate methods to confirm and continuously monitor advanced airway placement? (Select 3.)",
    choices: [
      "Continuous waveform capnography",
      "Visualizing bilateral chest rise with ventilation",
      "Auscultating breath sounds bilaterally and over the epigastrium",
      "Assuming placement based solely on how the insertion felt",
      "Checking placement only once at the start of the call with no further reassessment",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "Confirming advanced airway placement requires multiple objective methods used together and continuously: waveform capnography, visible chest rise, and auscultation bilaterally plus over the epigastrium. Relying on insertion \"feel\" alone or checking only once without ongoing reassessment are both inadequate and unsafe practices.",
  },
  {
    id: "aemt-airway-5095",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with severe facial trauma has significant bleeding into the oropharynx, making visualization and ventilation extremely difficult despite frequent suctioning. This scenario represents which category of airway management challenge?",
    choices: [
      "A routine, low-difficulty airway",
      "A difficult airway, where standard techniques may be significantly hampered and backup plans should be anticipated",
      "A situation requiring no airway intervention",
      "A scenario best managed by withholding all suction",
    ],
    answerIndex: 1,
    explanation:
      "Significant airway bleeding from facial trauma represents a difficult airway scenario, where blood and secretions can obscure visualization, complicate supraglottic device seating, and increase aspiration risk, requiring aggressive, frequent suctioning, anticipation of airway deterioration, and consideration of backup airway strategies and rapid transport to definitive care.",
  },
  {
    id: "aemt-airway-5096",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The Combitube is generally contraindicated in patients under what approximate height?",
    choices: ["4 feet (122 cm)", "5 feet (152 cm)", "6 feet (183 cm)", "3 feet (91 cm)"],
    answerIndex: 1,
    explanation:
      "The standard adult Combitube is generally contraindicated in patients under approximately 5 feet (152 cm) tall, since the device is sized for larger adolescents and adults and can cause airway trauma if used in a patient too small for its dimensions.",
  },
  {
    id: "aemt-airway-5097",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT attempts to insert a King LT airway in a cardiac arrest patient but is unsuccessful after two attempts due to anatomic difficulty. What should the AEMT do next?",
    choices: [
      "Continue attempting the same technique indefinitely until successful",
      "Return to bag-valve-mask ventilation with an OPA/NPA while considering an alternative airway strategy or provider, and continue high-quality CPR without significant interruption",
      "Abandon all airway management and ventilation attempts",
      "Attempt endotracheal intubation instead",
    ],
    answerIndex: 1,
    explanation:
      "After failed supraglottic airway attempts, the appropriate fallback is to return to effective BVM ventilation with basic airway adjuncts while considering alternative strategies (a different device size, a different provider attempting, or accepting BVM ventilation as adequate), all without significantly interrupting chest compressions. Endotracheal intubation exceeds AEMT scope of practice.",
  },
  {
    id: "aemt-airway-5098",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which statement about oxygen humidification is correct in the prehospital setting?",
    choices: [
      "Humidified oxygen is required for all patients receiving any supplemental oxygen",
      "Humidification may be beneficial for patients requiring prolonged high-flow oxygen therapy to prevent drying of mucous membranes, but is not always available or required for short transports",
      "Humidification eliminates the need for suctioning",
      "Humidified oxygen delivers a higher FiO2 than non-humidified oxygen at the same flow rate",
    ],
    answerIndex: 1,
    explanation:
      "Humidified oxygen can help prevent drying and irritation of mucous membranes, which is particularly relevant for patients requiring prolonged high-flow oxygen therapy, but is not universally required for short prehospital transports and does not by itself change the delivered FiO2 or eliminate the need for suctioning secretions.",
  },
  {
    id: "aemt-airway-5099",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a suspected cervical spine injury requires airway management. Which technique allows for airway opening while a second provider maintains manual in-line spinal stabilization?",
    choices: [
      "Head-tilt chin-lift performed by a single provider",
      "Jaw-thrust maneuver performed by one provider while a second provider maintains manual in-line stabilization of the cervical spine",
      "Full neck extension with no stabilization",
      "Placing the patient prone",
    ],
    answerIndex: 1,
    explanation:
      "In a patient with suspected cervical spine injury, the jaw-thrust maneuver is performed to open the airway while a second provider simultaneously maintains manual in-line spinal stabilization, avoiding any neck extension or flexion that head-tilt chin-lift would require.",
  },
  {
    id: "aemt-airway-5100",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What does the term \"apneic oxygenation\" refer to in airway management?",
    choices: [
      "Providing supplemental oxygen (often via nasal cannula) to a patient during periods of apnea or paralysis, such as during airway management attempts, to extend the time before desaturation occurs",
      "A technique that requires no oxygen delivery at all",
      "Ventilating a patient with room air only",
      "A method used exclusively for conscious, breathing patients",
    ],
    answerIndex: 0,
    explanation:
      "Apneic oxygenation refers to providing passive supplemental oxygen (commonly via nasal cannula) to a patient during periods when they are not actively breathing, such as during airway management attempts or paralysis, which can extend the safe apnea time before oxygen desaturation occurs by taking advantage of ongoing passive oxygen diffusion into the alveoli.",
  },
  {
    id: "aemt-airway-5101",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT is preparing to insert a supraglottic airway in a patient during cardiac arrest. What should be done regarding oxygenation immediately prior to insertion, if feasible?",
    choices: [
      "No pre-oxygenation is necessary or beneficial",
      "Preoxygenate the patient with high-flow oxygen via BVM before the insertion attempt to maximize reserve oxygen stores",
      "Withhold oxygen until after the device is confirmed in place",
      "Hyperventilate the patient aggressively before insertion",
    ],
    answerIndex: 1,
    explanation:
      "Preoxygenating a patient with high-flow oxygen via BVM prior to an airway insertion attempt helps maximize oxygen reserves in the lungs and bloodstream, extending the safe time available for the insertion attempt before significant desaturation occurs, rather than withholding oxygen until after placement is confirmed.",
  },
  {
    id: "aemt-airway-5102",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which finding on physical exam would suggest an anticipated \"difficult airway\" before any intervention is attempted?",
    choices: [
      "A normal, unobstructed view of the oropharynx with good mouth opening",
      "Limited mouth opening, a short/thick neck, significant facial trauma, or morbid obesity",
      "A calm, cooperative patient with no distress",
      "Normal dentition with no facial abnormalities",
    ],
    answerIndex: 1,
    explanation:
      "Predictors of a difficult airway include limited mouth opening, a short or thick neck, significant facial trauma or swelling, and morbid obesity, all of which can complicate visualization, device seating, or maintenance of an adequate mask seal, prompting the AEMT to anticipate potential difficulty and prepare backup strategies.",
  },
  {
    id: "aemt-airway-5103",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A near-drowning patient is pulled from the water unresponsive, with pink frothy secretions in the airway and crackles heard bilaterally. What is the priority airway/breathing management concern?",
    choices: [
      "No airway management is needed since the patient was already removed from the water",
      "Suction the airway as needed, provide ventilatory support with high-flow oxygen and BVM as indicated, and anticipate pulmonary edema/aspiration complicating oxygenation",
      "Withhold suctioning because it could worsen the drowning injury",
      "Delay all airway intervention until arrival at the hospital",
    ],
    answerIndex: 1,
    explanation:
      "A near-drowning patient with pink frothy secretions and bilateral crackles has evidence of pulmonary edema/aspiration, requiring prompt suctioning of the airway as needed, ventilatory support (including BVM if breathing is inadequate) with high-flow oxygen, and ongoing anticipation that pulmonary complications may worsen oxygenation over time, requiring close monitoring during transport.",
  },
  {
    id: "aemt-airway-5104",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which of the following is a true statement regarding the use of a bag-valve mask without supplemental oxygen attached?",
    choices: [
      "It delivers approximately 21% FiO2, the same as room air, which may be inadequate for a critically hypoxic patient",
      "It always delivers 100% oxygen regardless of oxygen source",
      "It is the preferred method for all patients requiring assisted ventilation",
      "It automatically increases FiO2 above room air without any oxygen source",
    ],
    answerIndex: 0,
    explanation:
      "A bag-valve mask used without a supplemental oxygen source and reservoir delivers approximately 21% FiO2, equivalent to room air, which is typically inadequate for a critically hypoxic patient. Whenever available, supplemental oxygen and a reservoir should be connected to maximize the delivered FiO2 during BVM ventilation.",
  },
  {
    id: "aemt-airway-5105",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient develops audible upper airway noise, drooling, and difficulty managing secretions after a large tonsillar/peritonsillar abscess has progressively worsened over several days, now with trismus (inability to open the mouth fully). This presentation should raise the AEMT's concern for:",
    choices: [
      "A benign dental issue requiring no urgency",
      "Impending upper airway obstruction from a deep space neck infection, warranting close airway monitoring and rapid transport",
      "A routine sore throat requiring only oral hydration advice",
      "Simple anxiety with no airway relevance",
    ],
    answerIndex: 1,
    explanation:
      "Progressive peritonsillar or deep space neck infection with trismus, drooling, and difficulty managing secretions represents a real risk of impending upper airway obstruction as swelling progresses, and requires close airway monitoring, minimizing agitation, and rapid transport, similar in urgency to other progressive upper airway swelling conditions.",
  },
  {
    id: "aemt-airway-5106",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What is the general purpose of a bite block or airway securing device used with a supraglottic airway?",
    choices: [
      "To increase the tidal volume delivered",
      "To prevent the patient from biting down on and occluding the device, and to help secure it in the correct position",
      "To measure oxygen saturation",
      "To deliver medications directly into the airway",
    ],
    answerIndex: 1,
    explanation:
      "A bite block (often integrated into the device itself, as with the King LT and i-gel) prevents the patient from biting down and occluding the airway lumen if muscle tone or consciousness returns, and securing devices/tape help maintain the device at the correct insertion depth throughout transport.",
  },
  {
    id: "aemt-airway-5107",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a supraglottic airway in place during transport begins to bite down on the device and show purposeful movement. What does this most likely indicate, and what should the AEMT anticipate?",
    choices: [
      "The device has failed completely and must be removed immediately regardless of the patient's condition",
      "Improving level of consciousness, which may require removal of the device if the patient develops an intact gag reflex and adequate spontaneous ventilation, following appropriate protocol",
      "This is abnormal and always indicates a life-threatening complication",
      "No action is needed since the device cannot be affected by patient movement",
    ],
    answerIndex: 1,
    explanation:
      "Purposeful movement and biting down on a supraglottic airway suggests an improving level of consciousness, and the AEMT should anticipate the possible need to remove the device if the patient develops an intact gag reflex and can maintain their own airway with adequate spontaneous ventilation, following local protocol for airway device removal.",
  },
  {
    id: "aemt-airway-5108",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The term \"desaturation\" in the context of airway management refers to:",
    choices: [
      "A rise in the patient's SpO2 above normal levels",
      "A drop in the patient's oxygen saturation (SpO2), often occurring during prolonged airway management attempts without adequate ventilation",
      "An increase in end-tidal CO2 only",
      "A normal, expected finding requiring no concern",
    ],
    answerIndex: 1,
    explanation:
      "Desaturation refers to a drop in the patient's oxygen saturation (SpO2), which can occur during prolonged airway management attempts without interspersed ventilation, apnea, or airway obstruction, and is a critical sign that the current management approach needs to be paused, reassessed, or adjusted.",
  },
  {
    id: "aemt-airway-5109",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "During an attempted supraglottic airway insertion, the patient's SpO2 drops from 96% to 84% before the device is fully placed. What is the appropriate action?",
    choices: [
      "Continue the insertion attempt as quickly as possible without stopping",
      "Stop the insertion attempt, remove the device, and resume BVM ventilation with high-flow oxygen until saturation improves before attempting again",
      "Ignore the saturation drop since it will resolve on its own",
      "Increase suction pressure to speed up the process",
    ],
    answerIndex: 1,
    explanation:
      "A significant drop in SpO2 during an airway insertion attempt is a signal to stop the attempt, remove the device if not yet successfully placed, and resume effective BVM ventilation with high-flow oxygen to allow the patient's saturation to recover before making another attempt, rather than persisting through a desaturating patient.",
  },
  {
    id: "aemt-airway-5110",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which statement about the relationship between ventilation rate and cardiac output during CPR is correct?",
    choices: [
      "Faster ventilation rates always improve cardiac output during CPR",
      "Excessive ventilation rates during CPR can increase intrathoracic pressure, decreasing venous return and reducing cardiac output",
      "Ventilation rate has no effect on cardiac output during CPR",
      "Ventilation should always be delivered as fast as physically possible during cardiac arrest",
    ],
    answerIndex: 1,
    explanation:
      "Excessive ventilation rates during CPR increase intrathoracic pressure, which decreases venous return to the heart and reduces cardiac output generated by chest compressions, which is why guideline-recommended ventilation rates (approximately 10 breaths per minute with an advanced airway) are specifically chosen to avoid hyperventilation during resuscitation.",
  },
  {
    id: "aemt-airway-5111",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient presents with new-onset facial droop, slurred speech, and drooling from one side of the mouth. The airway concern most relevant to this presentation is:",
    choices: [
      "No airway concern exists in this scenario",
      "Potential for impaired airway protective reflexes and aspiration risk due to weakness affecting the oropharyngeal muscles",
      "The patient definitely requires immediate supraglottic airway placement regardless of mental status",
      "This presentation has no relationship to airway management at all",
    ],
    answerIndex: 1,
    explanation:
      "Facial droop, slurred speech, and drooling suggestive of a stroke can indicate weakness affecting the muscles involved in swallowing and airway protection, raising concern for impaired gag reflex and aspiration risk, which should be monitored closely (including positioning to protect the airway) even if the patient does not require an advanced airway at this time.",
  },
  {
    id: "aemt-airway-5112",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Positioning an unresponsive patient with intact breathing and no suspected spinal injury in the recovery (lateral recumbent) position primarily serves to:",
    choices: [
      "Increase the risk of aspiration",
      "Help protect the airway by allowing secretions, blood, or vomitus to drain from the mouth rather than pool in the pharynx",
      "Replace the need for any airway assessment",
      "Improve venous return to the heart",
    ],
    answerIndex: 1,
    explanation:
      "The recovery position uses gravity to help secretions, blood, or vomitus drain out of the mouth rather than pool in the posterior pharynx and potentially be aspirated, which is a simple and effective airway protection strategy for an unresponsive but adequately breathing patient without suspected spinal injury.",
  },
  {
    id: "aemt-airway-5113",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    itemType: "options_table",
    question: "For each pediatric presentation, select the most likely diagnosis.",
    rows: [
      { id: "row1", finding: "2-year-old with sudden coughing fit and unilateral wheeze after playing with small toys, no fever", options: ["Croup", "Epiglottitis", "Foreign body aspiration", "Asthma"], correctOptionIndex: 2 },
      { id: "row2", finding: "3-year-old with high fever, drooling, tripod positioning, muffled voice, onset over hours", options: ["Croup", "Epiglottitis", "Foreign body aspiration", "Bronchiolitis"], correctOptionIndex: 1 },
      { id: "row3", finding: "18-month-old with barking cough, stridor, low-grade fever, onset over a day following cold symptoms", options: ["Croup", "Epiglottitis", "Foreign body aspiration", "Pertussis"], correctOptionIndex: 0 },
    ],
    explanation:
      "Foreign body aspiration presents with sudden, unexplained coughing/unilateral wheeze and no preceding illness; epiglottitis presents acutely with high fever, drooling, and toxic appearance; and croup presents with a more gradual onset barking cough and stridor following viral prodrome symptoms. Distinguishing these presentations directly changes management, particularly regarding avoiding airway instrumentation in suspected epiglottitis.",
  },
  {
    id: "aemt-airway-5114",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "A properly sized oropharyngeal airway that is too large for the patient can cause which complication?",
    choices: [
      "Improved airway patency with no risk",
      "Laryngospasm or trauma to the epiglottis/vocal cords from the tip extending too far into the pharynx",
      "Automatic prevention of vomiting",
      "No possible complications",
    ],
    answerIndex: 1,
    explanation:
      "An OPA that is too large can extend too far into the pharynx, potentially contacting and irritating the epiglottis or vocal cords, which can trigger laryngospasm or cause direct trauma, which is why correct sizing (measured from the corner of the mouth to the tragus of the ear or angle of the jaw) is important before insertion.",
  },
  {
    id: "aemt-airway-5115",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "An oropharyngeal airway that is too small for the patient can cause which complication?",
    choices: [
      "It can push the tongue posteriorly, worsening airway obstruction rather than relieving it",
      "It will automatically fall out and cause no harm",
      "It always improves airway patency regardless of size",
      "It has no effect on tongue position",
    ],
    answerIndex: 0,
    explanation:
      "An OPA that is too small may fail to adequately displace the tongue, or in some cases can actually push the tongue further posteriorly into the pharynx, worsening rather than relieving airway obstruction, which reinforces the importance of correct sizing before insertion.",
  },
  {
    id: "aemt-airway-5116",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT is inserting an OPA in an adult patient using the standard technique. What is the correct initial orientation of the device during insertion into the mouth?",
    choices: [
      "Inserted with the tip pointing toward the tongue, following the curve of the tongue from the start",
      "Inserted upside down (tip pointing toward the roof of the mouth/palate), then rotated 180 degrees as it passes the soft palate",
      "Inserted sideways along the cheek at all times",
      "Inserted with excessive force regardless of resistance encountered",
    ],
    answerIndex: 1,
    explanation:
      "The standard adult OPA insertion technique involves inserting the device upside down (tip toward the roof of the mouth) and rotating it 180 degrees once it passes the soft palate, which helps avoid pushing the tongue posteriorly during insertion; this technique is not typically used in pediatric patients, where a tongue depressor is often used instead to directly guide the device along the tongue's natural curve.",
  },
  {
    id: "aemt-airway-5117",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "In pediatric patients, the standard technique for OPA insertion typically differs from the adult technique in which way?",
    choices: [
      "It is identical to the adult technique in every respect",
      "It is inserted right-side up (following the natural curve of the tongue), often using a tongue depressor to guide it, rather than being inserted upside down and rotated",
      "It is never inserted with any adjunct assistance",
      "It requires no sizing measurement at all",
    ],
    answerIndex: 1,
    explanation:
      "In pediatric patients, the OPA is typically inserted right-side up, following the natural curve of the tongue directly, often with the assistance of a tongue depressor to hold the tongue down and guide the device, rather than using the adult rotation technique, due to the risk of soft tissue trauma from rotating a device in a smaller, more delicate pediatric oropharynx.",
  },
  {
    id: "aemt-airway-5118",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient receiving BVM ventilation has copious secretions that continue to accumulate faster than suctioning can clear them, causing repeated interruptions in effective ventilation. What should the AEMT consider next?",
    choices: [
      "Stop all suctioning attempts permanently",
      "Continue alternating suctioning and ventilation as needed, and consider that a definitive airway may ultimately be needed to protect against ongoing aspiration if available within scope, while maintaining oxygenation as the priority",
      "Ignore the secretions entirely and continue ventilating without pause",
      "Immediately cease all airway management",
    ],
    answerIndex: 1,
    explanation:
      "When secretions continue to interfere with effective ventilation despite repeated suctioning, the AEMT should continue to alternate suctioning with ventilation as needed to maintain oxygenation, while recognizing that a more protective airway strategy within scope (such as a supraglottic airway with gastric decompression capability, where copious secretions permit adequate seating) may ultimately be needed, always prioritizing maintained oxygenation over any single technique.",
  },
  {
    id: "aemt-airway-5119",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What is the primary risk of prolonged, repeated suctioning attempts without interspersed ventilation/oxygenation?",
    choices: [
      "Improved oxygenation with no downside",
      "Hypoxia, since suctioning removes both secretions and available oxygen from the airway while interrupting ventilation",
      "No risk exists with prolonged suctioning",
      "Increased blood pressure with no other effects",
    ],
    answerIndex: 1,
    explanation:
      "Prolonged or repeated suctioning without interspersed ventilation and oxygenation risks causing or worsening hypoxia, since the suction catheter removes air (and available oxygen) from the airway along with secretions while simultaneously interrupting the delivery of ventilations, which is why suction attempts are time-limited and alternated with ventilation/oxygenation.",
  },
  {
    id: "aemt-airway-5120",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    itemType: "multiple_response",
    question:
      "Which of the following findings, if present after supraglottic airway placement, should prompt the AEMT to suspect the device may be misplaced or dislodged? (Select 3.)",
    choices: [
      "Absent or inconsistent waveform capnography",
      "Absent breath sounds bilaterally despite ventilation attempts",
      "Progressive gastric distension with ventilation",
      "Bilateral, equal chest rise with each ventilation",
      "A steady, well-formed capnography waveform with normal EtCO2 values",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "Absent or inconsistent capnography waveform, absent bilateral breath sounds, and progressive gastric distension are all red flags suggesting the supraglottic airway is misplaced, dislodged, or otherwise not adequately ventilating the lungs. Bilateral equal chest rise and a well-formed, normal capnography waveform are both reassuring signs of correct placement and effective ventilation, not red flags.",
  },
  {
    id: "aemt-airway-5121",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The Sellick maneuver (cricoid pressure) should generally NOT be applied in which situation?",
    choices: [
      "During routine BVM ventilation of any patient with no complications",
      "If active vomiting is occurring, since applying pressure during active vomiting can increase the risk of esophageal rupture",
      "During every single airway management scenario without exception",
      "In a patient with a suspected cervical spine injury only",
    ],
    answerIndex: 1,
    explanation:
      "Cricoid pressure should generally be released or avoided if active vomiting is occurring, because maintaining pressure against a forcefully vomiting esophagus increases the theoretical risk of esophageal rupture; it is also a technique with debated efficacy and evolving recommendations in modern airway management, so it should not be applied reflexively without consideration of the clinical situation.",
  },
  {
    id: "aemt-airway-5122",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a known history of severe obstructive sleep apnea and morbid obesity requires BVM ventilation. What airway management challenge is most anticipated in this patient?",
    choices: [
      "No additional challenges compared to an average adult patient",
      "Difficulty achieving an adequate mask seal and maintaining airway patency due to excess soft tissue, often requiring a two-person technique and airway adjuncts",
      "This patient will always be easier to ventilate than an average adult",
      "This patient should never receive BVM ventilation under any circumstances",
    ],
    answerIndex: 1,
    explanation:
      "Patients with morbid obesity and severe sleep apnea often have excess soft tissue in the airway and neck, making it more difficult to achieve an adequate mask seal and maintain airway patency during BVM ventilation, often requiring a two-person technique, airway adjuncts (OPA/NPA), and sometimes additional positioning strategies (such as elevating the head and torso, a \"ramped\" position) to improve airway alignment.",
  },
  {
    id: "aemt-airway-5123",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Elevating the head and upper torso of a morbidly obese patient into a \"ramped\" position before airway management is intended to:",
    choices: [
      "Worsen airway alignment and make ventilation more difficult",
      "Align the external auditory meatus with the sternal notch, improving airway alignment and often easing ventilation and visualization compared to a flat, supine position",
      "Have no effect on airway management",
      "Replace the need for any airway adjunct",
    ],
    answerIndex: 1,
    explanation:
      "The \"ramped\" position elevates the head, neck, and upper torso to align the external auditory meatus with the sternal notch, counteracting the excess soft tissue of morbid obesity that tends to obstruct the airway when the patient lies flat, and generally improves ease of ventilation and airway alignment compared to a standard supine position in this patient population.",
  },
  {
    id: "aemt-airway-5124",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A patient in profound respiratory distress from a severe asthma exacerbation has diminished breath sounds bilaterally with minimal air movement, a silent chest, and is becoming increasingly lethargic. What is the priority airway/breathing intervention?",
    choices: [
      "Wait for bronchodilator medications to take full effect before any ventilatory support",
      "Begin assisted or full ventilatory support with a bag-valve mask and high-flow oxygen while continuing to treat the underlying bronchospasm per protocol",
      "Withhold oxygen because the patient has asthma",
      "Perform a surgical airway immediately",
    ],
    answerIndex: 1,
    explanation:
      "A \"silent chest\" with minimal air movement and lethargy in severe asthma indicates impending respiratory failure and requires immediate ventilatory support with BVM and high-flow oxygen, given concurrently with pharmacologic bronchodilator treatment rather than waiting for medications to work first, since the patient cannot maintain adequate gas exchange on their own at this point.",
  },
  {
    id: "aemt-airway-5125",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "A \"silent chest\" in a patient with severe asthma is a concerning finding because it indicates:",
    choices: [
      "The bronchospasm has fully resolved",
      "Airflow is so severely reduced that wheezing (which requires airflow to be generated) can no longer be heard, representing impending respiratory failure",
      "The patient has a normal, healthy respiratory status",
      "The patient no longer requires any monitoring",
    ],
    answerIndex: 1,
    explanation:
      "Wheezing requires airflow through narrowed airways to be generated; a \"silent chest\" in severe asthma indicates airflow has become so severely restricted that even wheezing cannot be heard, which is a paradoxically ominous sign of impending respiratory failure rather than improvement, requiring immediate aggressive intervention.",
  },
  {
    id: "aemt-airway-5126",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The mnemonic \"look, listen, and feel\" for assessing breathing primarily evaluates:",
    choices: [
      "Only the patient's pulse rate",
      "Chest rise/fall (look), breath sounds/air movement (listen), and air movement against the rescuer's cheek or hand (feel)",
      "Only the patient's level of consciousness",
      "Only the patient's skin color",
    ],
    answerIndex: 1,
    explanation:
      "The \"look, listen, and feel\" technique assesses for visible chest rise and fall (look), audible breath sounds or air movement (listen), and air movement felt against the rescuer's cheek or hand near the patient's nose and mouth (feel), providing a quick initial assessment of breathing adequacy.",
  },
  {
    id: "aemt-airway-5127",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient has a respiratory rate of 28 with shallow, minimal chest rise, use of accessory muscles, and nasal flaring. This clinical picture represents:",
    choices: [
      "Normal, adequate breathing requiring no intervention",
      "Inadequate breathing (tachypnea with reduced tidal volume and increased work of breathing), warranting close monitoring and likely ventilatory assistance",
      "A finding with no clinical significance",
      "Bradypnea requiring atropine administration",
    ],
    answerIndex: 1,
    explanation:
      "A rapid respiratory rate combined with shallow tidal volume, accessory muscle use, and nasal flaring indicates significantly increased work of breathing and inadequate ventilation despite the rate itself not being slow, warranting close monitoring and likely assisted ventilation, since respiratory rate alone does not determine adequacy of breathing.",
  },
  {
    id: "aemt-airway-5128",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Accessory muscle use during breathing (such as sternocleidomastoid or intercostal muscle use) indicates:",
    choices: [
      "Completely normal breathing with no distress",
      "Increased work of breathing, as the body recruits additional muscles beyond the diaphragm and intercostals to help move air",
      "That the patient is deliberately overacting",
      "A guaranteed sign of cardiac arrest",
    ],
    answerIndex: 1,
    explanation:
      "Accessory muscle use (sternocleidomastoid, scalene, and intercostal retractions, for example) indicates increased work of breathing, as the body recruits additional muscles beyond the primary muscles of respiration (diaphragm and intercostals) to compensate for increased airway resistance or reduced lung compliance, and is a sign of significant respiratory distress requiring close monitoring.",
  },
  {
    id: "aemt-airway-5129",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "After administering albuterol via nebulizer for an asthma exacerbation, the AEMT reassesses the patient. Which finding would best indicate the treatment has been effective?",
    choices: [
      "No change in breath sounds, respiratory rate, or SpO2",
      "Improved air movement/decreased wheezing, decreased work of breathing, decreased respiratory rate toward normal, and improved SpO2",
      "Worsening wheezing and increased respiratory distress",
      "Development of a silent chest",
    ],
    answerIndex: 1,
    explanation:
      "Effective bronchodilator treatment should produce improved air movement (often with initially increased then decreased wheezing as airflow improves), decreased work of breathing, a respiratory rate trending toward normal, and improved oxygen saturation, all of which should be reassessed after treatment to guide further management decisions.",
  },
  {
    id: "aemt-airway-5130",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Nebulized albuterol works primarily through which mechanism to improve airflow in bronchospasm?",
    choices: [
      "Beta-2 adrenergic receptor stimulation causing bronchial smooth muscle relaxation",
      "Direct paralysis of the diaphragm",
      "Vasoconstriction of pulmonary blood vessels",
      "Sedation of the central nervous system",
    ],
    answerIndex: 0,
    explanation:
      "Albuterol is a beta-2 adrenergic agonist that causes relaxation of bronchial smooth muscle, reducing bronchospasm and improving airflow, which is why it is a first-line treatment for conditions like asthma and COPD exacerbations that involve significant bronchoconstriction.",
  },
  {
    id: "aemt-airway-5131",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An unresponsive patient in a supine position begins to vomit. What is the immediate priority action?",
    choices: [
      "Leave the patient supine and continue with the current assessment",
      "Immediately position the patient's head to the side (or log-roll the whole patient if spinal injury is suspected) and suction the airway as needed",
      "Wait until the vomiting has fully stopped before doing anything",
      "Insert an OPA immediately without addressing the vomitus first",
    ],
    answerIndex: 1,
    explanation:
      "When an unresponsive supine patient vomits, the immediate priority is to protect the airway from aspiration by positioning the patient's head to the side (or log-rolling the entire patient as a unit if spinal injury is suspected) and suctioning as needed, rather than continuing an unrelated assessment or inserting an airway adjunct into a mouth full of vomitus.",
  },
  {
    id: "aemt-airway-5132",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which of the following best describes the purpose of the epiglottis?",
    choices: [
      "It separates the nasopharynx from the oropharynx",
      "It is a leaf-shaped cartilaginous flap that covers the laryngeal inlet during swallowing to prevent aspiration into the trachea",
      "It is the only complete cartilaginous ring in the airway",
      "It regulates the diameter of the trachea",
    ],
    answerIndex: 1,
    explanation:
      "The epiglottis is a flexible, leaf-shaped cartilaginous structure that folds down to cover the laryngeal inlet during swallowing, directing food and liquid into the esophagus and preventing aspiration into the trachea. It is not a complete ring (that is the cricoid cartilage) and does not separate the naso- and oropharynx (that is the soft palate).",
  },
  {
    id: "aemt-airway-5133",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a known seizure disorder has just finished an active generalized tonic-clonic seizure and is now in the postictal period, breathing shallowly with copious oral secretions. What is the priority airway management?",
    choices: [
      "Insert an OPA immediately while the patient is still actively seizing",
      "Once the active seizure activity has stopped, position the patient to protect the airway (such as recovery position if no spinal injury), suction secretions as needed, and support ventilation if inadequate",
      "Restrain the patient's jaw forcefully to insert an airway adjunct during active convulsions",
      "Withhold all airway intervention throughout the postictal period",
    ],
    answerIndex: 1,
    explanation:
      "Airway adjuncts should not be forced into a patient's mouth during active seizure activity, both due to risk of injury and difficulty of insertion during clenched jaw/convulsions. Once active convulsions stop, the priority becomes positioning to protect the airway, suctioning secretions, and supporting ventilation if the postictal respiratory effort is inadequate.",
  },
  {
    id: "aemt-airway-5134",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Why should airway adjuncts generally NOT be forced into the mouth of a patient during an active generalized seizure?",
    choices: [
      "It is always perfectly safe and effective",
      "The clenched jaw and violent movement during a seizure make insertion difficult and risk injury to the patient's teeth, oral tissue, or the rescuer's fingers",
      "Airway adjuncts are never needed in seizure patients",
      "It has no bearing on patient safety",
    ],
    answerIndex: 1,
    explanation:
      "During an active generalized seizure, the patient's jaw is often clenched and body movements are violent and uncontrolled, making it difficult and potentially dangerous to force an airway adjunct into the mouth, risking dental trauma, oral injury, or injury to the rescuer's fingers; management should instead focus on protecting the patient from injury and preparing for airway management once convulsions subside.",
  },
  {
    id: "aemt-airway-5135",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient presents with a barrel chest, pursed-lip breathing, prolonged expiratory phase, and diminished breath sounds throughout, with a chronic smoking history. This presentation is most consistent with:",
    choices: [
      "Acute pulmonary embolism",
      "Chronic obstructive pulmonary disease (COPD)",
      "Acute pneumothorax",
      "Simple upper respiratory infection",
    ],
    answerIndex: 1,
    explanation:
      "A barrel chest, pursed-lip breathing, prolonged expiratory phase, diminished breath sounds throughout, and a significant chronic smoking history are classic chronic findings of COPD (emphysema-predominant), reflecting long-standing air trapping and loss of lung elastic recoil, distinct from the more acute presentations of pulmonary embolism or pneumothorax.",
  },
  {
    id: "aemt-airway-5136",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Pursed-lip breathing, often seen in COPD patients, primarily serves to:",
    choices: [
      "Worsen airway collapse during exhalation",
      "Create back-pressure that helps keep small airways open longer during exhalation, reducing air trapping",
      "Increase the respiratory rate",
      "Have no physiologic benefit and is simply a habit",
    ],
    answerIndex: 1,
    explanation:
      "Pursed-lip breathing creates positive back-pressure in the airways during exhalation, which helps keep smaller, more collapsible airways open longer and allows for more complete exhalation, reducing air trapping and dynamic hyperinflation, which is why many COPD patients adopt this breathing pattern naturally or are taught to use it.",
  },
  {
    id: "aemt-airway-5137",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT is assisting ventilations on a patient with a bag-valve mask and notes the patient begins to cough and gag forcefully, suggesting return of protective reflexes. What should the AEMT do?",
    choices: [
      "Continue forcing the mask onto the face regardless of the patient's response",
      "Stop forcing ventilations, reassess the patient's spontaneous respiratory effort and level of consciousness, and adjust the management plan accordingly",
      "Immediately administer a paralytic medication",
      "Ignore the gagging and increase ventilation rate",
    ],
    answerIndex: 1,
    explanation:
      "Coughing and forceful gagging during BVM ventilation suggest the patient's protective airway reflexes are returning, which should prompt the AEMT to stop forcing ventilations, reassess the patient's spontaneous respiratory effort and mental status, and adjust management (potentially to a less invasive support level) rather than continuing to force positive pressure ventilation on a patient who may now be able to breathe adequately on their own. Administering a paralytic is outside AEMT scope.",
  },
  {
    id: "aemt-airway-5138",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The term \"minute ventilation\" refers to:",
    choices: [
      "The total volume of air moved in and out of the lungs in one minute (respiratory rate multiplied by tidal volume)",
      "The volume of a single breath only",
      "The time it takes to complete one full breath",
      "The percentage of oxygen in inhaled air",
    ],
    answerIndex: 0,
    explanation:
      "Minute ventilation is calculated as respiratory rate multiplied by tidal volume, representing the total volume of air moved in and out of the lungs over one minute, and is a more complete measure of ventilatory adequacy than respiratory rate alone, since a normal rate with very shallow tidal volumes can still represent inadequate minute ventilation.",
  },
  {
    id: "aemt-airway-5139",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient has a respiratory rate of 24 breaths per minute but very shallow tidal volumes, resulting in a low overall minute ventilation despite the seemingly normal rate. What does this scenario illustrate?",
    choices: [
      "That respiratory rate alone is always sufficient to assess ventilatory adequacy",
      "That tidal volume must be considered along with respiratory rate, since a normal or even elevated rate with inadequate tidal volume can still represent inadequate overall ventilation",
      "That this patient definitely has excellent ventilation",
      "That respiratory rate has no relationship to minute ventilation",
    ],
    answerIndex: 1,
    explanation:
      "This scenario illustrates why both respiratory rate and tidal volume must be assessed together, since a seemingly normal respiratory rate combined with shallow tidal volumes can still produce inadequate minute ventilation, potentially requiring assisted ventilation despite the rate alone appearing unremarkable.",
  },
  {
    id: "aemt-airway-5140",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which of the following is the correct definition of tidal volume?",
    choices: [
      "The total lung capacity",
      "The volume of air moved into or out of the lungs during a single, normal breath",
      "The maximum volume of air that can be forcibly exhaled after maximal inhalation",
      "The volume of air remaining in the lungs after maximal exhalation",
    ],
    answerIndex: 1,
    explanation:
      "Tidal volume is the volume of air moved into or out of the lungs during a single, normal (unforced) breath, typically estimated at approximately 6-8 mL/kg of ideal body weight, and is one of the two components (along with respiratory rate) used to calculate minute ventilation.",
  },
  {
    id: "aemt-airway-5141",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a supraglottic airway in place shows a capnography waveform with a normal shape and a value of 40 mmHg, but the AEMT notices the patient's chest is not visibly rising with each ventilation. What is the most appropriate interpretation?",
    choices: [
      "This combination is impossible and the capnography reading should be disregarded entirely without further thought",
      "A normal capnography waveform with a normal value strongly suggests the device is correctly placed and ventilation is occurring, so the chest rise assessment should be rechecked (such as by exposing the chest fully or checking positioning) rather than assuming the capnography is wrong",
      "The airway must be misplaced regardless of the capnography finding",
      "Chest rise assessment is never useful and should always be ignored",
    ],
    answerIndex: 1,
    explanation:
      "A normal, well-formed capnography waveform with a normal value is strong objective evidence of correct airway placement and effective ventilation, so if chest rise appears absent, the AEMT should recheck the chest rise assessment itself (adequate exposure, lighting, patient body habitus) rather than assuming the reliable capnography data is inaccurate, since capnography is considered the most objective confirmation method available in the field.",
  },
  {
    id: "aemt-airway-5142",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which of the following statements about oxygen toxicity is most accurate for prehospital care?",
    choices: [
      "Oxygen toxicity is a significant, immediate concern during any brief prehospital transport and oxygen should routinely be withheld",
      "Oxygen toxicity from high-concentration oxygen is primarily a concern with prolonged, high-FiO2 exposure over many hours, and should not lead to withholding indicated oxygen therapy during typical short prehospital transports for a hypoxic patient",
      "Oxygen toxicity occurs instantly with any oxygen administration at any concentration",
      "There is no such thing as oxygen toxicity",
    ],
    answerIndex: 1,
    explanation:
      "Oxygen toxicity is primarily a concern with prolonged, high-concentration oxygen exposure over many hours (such as in an ICU setting), and is not a reason to withhold indicated, appropriately titrated oxygen therapy from a hypoxic patient during a typical, relatively brief prehospital transport; the priority remains treating hypoxia when present.",
  },
  {
    id: "aemt-airway-5143",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A pregnant patient in the third trimester is in respiratory distress and requires airway positioning. What special consideration should the AEMT keep in mind?",
    choices: [
      "No special positioning consideration is needed for pregnant patients",
      "Positioning the patient with slight left lateral tilt (or manually displacing the uterus) can help reduce aortocaval compression from the gravid uterus, improving venous return and potentially aiding oxygenation/perfusion",
      "Pregnant patients should always be placed flat on their back regardless of gestational age",
      "Pregnant patients should never receive supplemental oxygen",
    ],
    answerIndex: 1,
    explanation:
      "In later pregnancy, the gravid uterus can compress the inferior vena cava and aorta when the patient lies supine, reducing venous return and cardiac output (supine hypotensive syndrome); positioning with slight left lateral tilt or manual uterine displacement helps relieve this compression, which can be an important adjunct to airway and breathing management in a distressed pregnant patient.",
  },
  {
    id: "aemt-airway-5144",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "What is the general purpose of a flowmeter used with a portable oxygen cylinder?",
    choices: [
      "To measure the patient's oxygen saturation",
      "To regulate and display the rate of oxygen flow (in liters per minute) being delivered from the cylinder to the patient",
      "To humidify the oxygen automatically",
      "To measure end-tidal CO2",
    ],
    answerIndex: 1,
    explanation:
      "A flowmeter is attached to an oxygen cylinder's regulator and allows the provider to set and visually confirm the rate of oxygen flow (in liters per minute) being delivered to the patient through whatever delivery device is attached, such as a nasal cannula or non-rebreather mask.",
  },
  {
    id: "aemt-airway-5145",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT arrives to find an oxygen cylinder reading near-empty (below the safe residual pressure) while actively in use on a critical patient. What should the AEMT do?",
    choices: [
      "Continue using the same cylinder until it is completely empty before taking any action",
      "Promptly switch to a full replacement cylinder to avoid interrupting oxygen delivery to the patient",
      "Turn off the oxygen flow entirely and wait for hospital arrival",
      "Disregard the pressure gauge reading entirely",
    ],
    answerIndex: 1,
    explanation:
      "When an oxygen cylinder in active use approaches empty (typically defined by a safe residual pressure threshold, often cited around 200-500 psi depending on cylinder size and local policy), the AEMT should promptly switch to a full replacement cylinder to avoid an interruption in oxygen delivery to a patient who needs it, rather than running the cylinder completely dry or stopping oxygen therapy altogether.",
  },
  {
    id: "aemt-airway-5146",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    itemType: "multiple_response",
    question: "Which of the following are appropriate safety precautions when handling and storing compressed oxygen cylinders? (Select 3.)",
    choices: [
      "Keeping oxygen equipment away from open flame and sources of ignition",
      "Securing cylinders to prevent them from falling or rolling, since a damaged valve can turn the cylinder into a dangerous projectile",
      "Avoiding the use of oil- or grease-based lubricants on oxygen equipment fittings",
      "Storing loose, unsecured cylinders in the front passenger seat with no restraint",
      "Smoking near an active oxygen delivery setup",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "Oxygen cylinders should be kept away from ignition sources and open flame, secured to prevent falling (a damaged valve on a falling cylinder can cause it to become a dangerous projectile due to the high pressure inside), and oil- or grease-based lubricants should never be used on oxygen fittings since oxygen can cause them to combust. Leaving cylinders unsecured and smoking near oxygen equipment are both significant safety hazards, not acceptable practices.",
  },
  {
    id: "aemt-airway-5147",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a chronic tracheostomy for long-term ventilator dependence is found by family in respiratory distress, with the tracheostomy tube appearing to be partially dislodged from the stoma. What should the AEMT prioritize?",
    choices: [
      "Ignore the tracheostomy entirely and focus only on obtaining vital signs",
      "Assess the position and patency of the tracheostomy tube, and be prepared to reposition, suction, or replace it (if trained/equipped) while supporting oxygenation and ventilation as needed",
      "Immediately remove the tracheostomy tube permanently with no plan to replace or otherwise manage the stoma",
      "Cover the stoma completely and rely solely on mouth-to-mouth ventilation for a patient with an intact upper airway connection",
    ],
    answerIndex: 1,
    explanation:
      "A partially dislodged tracheostomy tube in a ventilator-dependent patient in distress requires prompt assessment of tube position and patency, with readiness to reposition, suction, or replace the tube if trained and equipped to do so, while supporting oxygenation and ventilation throughout, since this patient's airway may be entirely dependent on the tracheostomy functioning correctly.",
  },
  {
    id: "aemt-airway-5148",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "Which finding on lung auscultation is described as high-pitched, musical, and typically heard during expiration, associated with narrowed lower airways?",
    choices: ["Stridor", "Wheezing", "Rhonchi", "Pleural friction rub"],
    answerIndex: 1,
    explanation:
      "Wheezing is a high-pitched, musical sound typically heard during expiration (though it can be biphasic in severe cases), caused by air moving through narrowed lower airways, classically associated with asthma and COPD exacerbations. Stridor is an upper airway finding, rhonchi are lower-pitched and often clear with coughing (secretions), and a pleural friction rub is a grating sound from inflamed pleural surfaces.",
  },
  {
    id: "aemt-airway-5149",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Rhonchi (coarse, low-pitched, rattling lung sounds) are most commonly associated with:",
    choices: [
      "Upper airway obstruction from a foreign body",
      "Secretions or mucus in the larger airways, often clearing or changing with coughing",
      "Pneumothorax",
      "Normal, clear lung sounds",
    ],
    answerIndex: 1,
    explanation:
      "Rhonchi are coarse, low-pitched, rattling sounds most commonly caused by secretions or mucus in the larger airways (bronchi), and characteristically may change or partially clear after the patient coughs, distinguishing them from other adventitious lung sounds that persist despite coughing.",
  },
  {
    id: "aemt-airway-5150",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient presents with fine, crackling lung sounds heard at the lung bases bilaterally on inspiration, along with bilateral lower extremity edema and a history of congestive heart failure. These findings are most consistent with:",
    choices: [
      "Pulmonary edema from fluid overload/heart failure",
      "Upper airway obstruction",
      "Foreign body aspiration",
      "Pneumothorax",
    ],
    answerIndex: 0,
    explanation:
      "Fine, crackling inspiratory lung sounds (crackles/rales) at the lung bases, combined with peripheral edema and a heart failure history, are classic findings of pulmonary edema from fluid overload, reflecting fluid accumulation in the alveoli, which is also a classic indication for CPAP therapy if the patient meets other CPAP criteria.",
  },
  {
    id: "aemt-airway-5151",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    itemType: "build_list",
    question:
      "Place the following steps for managing a conscious adult with a complete foreign body airway obstruction in the correct sequence.",
    steps: [
      "Recognize the universal choking sign and confirm the patient cannot speak, cough effectively, or breathe",
      "Ask the patient if they are choking and if they want help",
      "Deliver a series of abdominal thrusts (or chest thrusts if pregnant/obese)",
      "Continue thrusts until the object is expelled or the patient becomes unresponsive",
      "If the patient becomes unresponsive, lower them to the ground and begin CPR, checking the airway for a visible object before ventilations",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "Management of a conscious adult with complete FBAO follows a clear sequence: recognize the obstruction, obtain consent to help, deliver abdominal (or chest) thrusts, continue until the object is expelled or the patient becomes unresponsive, and if unresponsiveness occurs, transition to CPR with visual airway checks before ventilations. Skipping consent or jumping directly to CPR on a still-conscious patient would be incorrect.",
  },
  {
    id: "aemt-airway-5152",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "For a conscious, choking infant (under 1 year old) with a complete airway obstruction, the recommended technique is:",
    choices: [
      "Abdominal thrusts identical to the adult technique",
      "Alternating back blows and chest thrusts",
      "A blind finger sweep of the mouth",
      "The Heimlich maneuver performed exactly as in an adult",
    ],
    answerIndex: 1,
    explanation:
      "For a conscious infant with complete airway obstruction, the recommended technique is alternating 5 back blows and 5 chest thrusts (not abdominal thrusts, which risk organ injury in an infant), repeated until the object is expelled or the infant becomes unresponsive. Blind finger sweeps are not recommended in infants or adults due to the risk of pushing the object further into the airway.",
  },
  {
    id: "aemt-airway-5153",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient with a partial (not complete) foreign body airway obstruction is coughing forcefully, able to speak in short phrases, and moving air, though with some stridor. What is the appropriate management approach?",
    choices: [
      "Immediately perform abdominal thrusts as if this were a complete obstruction",
      "Encourage continued coughing, closely monitor for deterioration to complete obstruction, provide supplemental oxygen, and arrange prompt transport without unnecessary intervention that could convert a partial obstruction to a complete one",
      "Ignore the patient entirely since the obstruction is only partial",
      "Immediately attempt to remove the object with fingers",
    ],
    answerIndex: 1,
    explanation:
      "A patient with a partial airway obstruction who can still cough forcefully and move air (a \"good\" cough) should be encouraged to continue coughing to attempt to clear the obstruction on their own, while the AEMT closely monitors for signs of deterioration to a complete obstruction, provides supportive care such as oxygen, and arranges prompt transport; aggressive intervention such as abdominal thrusts or blind attempts to remove the object risk converting a partial obstruction into a complete one.",
  },
  {
    id: "aemt-airway-5154",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which statement about the differences between a \"good\" cough and a \"poor\" (ineffective) cough in an airway obstruction is correct?",
    choices: [
      "A good cough is forceful and can move air, indicating a partial obstruction that may resolve with continued coughing, while a poor cough is weak, high-pitched, or absent, indicating a complete or severe obstruction requiring intervention",
      "There is no meaningful clinical difference between the two",
      "A poor cough always indicates the airway is completely clear",
      "A good cough indicates the airway is completely obstructed and requires immediate abdominal thrusts",
    ],
    answerIndex: 0,
    explanation:
      "A \"good\" (effective) cough is forceful and can still move air, generally indicating a partial obstruction that may resolve on its own with continued coughing, whereas a \"poor\" (ineffective) cough is weak, high-pitched, or the patient cannot cough at all, indicating a more severe or complete obstruction that requires active intervention such as abdominal thrusts.",
  },
  {
    id: "aemt-airway-5155",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT is treating a patient with a supraglottic airway in place who requires transport over a bumpy road. What precaution should be taken to prevent airway complications during transport?",
    choices: [
      "No precautions are needed once the device is inserted",
      "Continuously monitor airway placement, ensure the device remains securely fastened, and be prepared to reassess or adjust ventilation if displacement is suspected during transport",
      "Deflate the cuffs during transport to reduce discomfort",
      "Disconnect the ventilation source during bumpy portions of transport",
    ],
    answerIndex: 1,
    explanation:
      "Movement and vibration during transport, especially over rough terrain, increase the risk of advanced airway displacement, so the device must remain securely fastened and continuously monitored, with the AEMT prepared to reassess placement (chest rise, breath sounds, capnography) and adjust ventilation if any signs of displacement are noted, rather than assuming a securely placed device requires no further attention.",
  },
  {
    id: "aemt-airway-5156",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "What is the general reason a Venturi mask is used when precise FiO2 delivery is clinically important?",
    choices: [
      "It delivers a fixed, precise FiO2 regardless of the patient's inspiratory flow rate, using color-coded adapters or dials corresponding to specific oxygen concentrations",
      "It always delivers 100% oxygen regardless of the setting used",
      "It cannot deliver oxygen concentrations below 60%",
      "It functions identically to a simple nasal cannula",
    ],
    answerIndex: 0,
    explanation:
      "A Venturi mask uses specifically sized color-coded adapters or an adjustable dial to entrain a precise, fixed ratio of room air with oxygen flow, allowing it to deliver a consistent, predictable FiO2 (commonly ranging from around 24% to 60%) regardless of variations in the patient's own inspiratory flow rate, which is valuable when precise oxygen titration is clinically important, such as in certain COPD patients.",
  },
  {
    id: "aemt-airway-5157",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient status-post recent tonsillectomy presents with active bright red bleeding from the oropharynx and increasing difficulty swallowing blood. The AEMT's primary airway concern is:",
    choices: [
      "No airway concern exists since this is expected post-surgical bleeding",
      "Risk of aspiration of blood and potential airway compromise from ongoing hemorrhage, requiring close airway monitoring, suctioning as needed, and prompt transport",
      "This finding requires no monitoring or intervention",
      "The patient should be placed supine with the head extended and left unmonitored",
    ],
    answerIndex: 1,
    explanation:
      "Active post-tonsillectomy bleeding poses a real risk of aspiration and airway compromise as blood accumulates in the oropharynx, requiring close airway monitoring, suctioning of blood as needed to maintain a patent airway, positioning to help protect the airway, and prompt transport, since ongoing significant bleeding in this location can progress to a serious airway emergency.",
  },
  {
    id: "aemt-airway-5158",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "The primary reason capnography is considered superior to pulse oximetry for confirming advanced airway placement is that:",
    choices: [
      "Pulse oximetry directly confirms tracheal versus esophageal placement, while capnography does not",
      "Capnography reflects real-time exhaled CO2 from the lungs breath-to-breath, providing an immediate signal if an airway is misplaced or dislodged, while pulse oximetry can lag significantly and does not distinguish airway placement location",
      "Capnography and pulse oximetry measure exactly the same physiologic parameter",
      "Pulse oximetry is faster to respond to a misplaced airway than capnography",
    ],
    answerIndex: 1,
    explanation:
      "Capnography provides an immediate, breath-to-breath signal reflecting whether CO2 is actually being exhaled from the lungs, making it highly sensitive to airway misplacement or dislodgement in real time, whereas pulse oximetry reflects blood oxygen saturation, which can take significant time to change (or may remain falsely reassuring for a period even after airway loss, especially after preoxygenation) and does not directly indicate where the airway device is located.",
  },
  {
    id: "aemt-airway-5159",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    itemType: "multiple_response",
    question:
      "A patient with a King LT airway in place during transport suddenly desaturates. Which of the following should the AEMT consider as possible causes? (Select 3.)",
    choices: [
      "Device dislodgement or migration",
      "Mucus plugging or secretions obstructing the airway",
      "A developing pneumothorax unrelated to the airway device",
      "Normal, expected fluctuation requiring no evaluation",
      "The device functioning exactly as intended with no issue",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "A sudden desaturation with an advanced airway in place should prompt consideration of multiple possible causes, including device dislodgement, mucus plugging/obstruction, or an unrelated developing problem such as a pneumothorax, following a systematic approach (similar to the DOPE mnemonic used for advanced airways: Displacement, Obstruction, Pneumothorax, Equipment failure). It should never be dismissed as normal fluctuation without evaluation.",
  },
  {
    id: "aemt-airway-5160",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question:
      "The mnemonic DOPE, used to troubleshoot sudden deterioration in a ventilated patient with an advanced airway, stands for:",
    choices: [
      "Displacement, Obstruction, Pneumothorax, Equipment failure",
      "Diagnosis, Oxygenation, Perfusion, Evaluation",
      "Dosage, Overdose, Prescription, Emergency",
      "Depth, Orientation, Position, Extraction",
    ],
    answerIndex: 0,
    explanation:
      "DOPE is a widely used mnemonic for systematically troubleshooting sudden deterioration in a patient with an advanced airway in place: Displacement (has the device moved or dislodged), Obstruction (secretions, kinking, biting), Pneumothorax (has one developed), and Equipment failure (oxygen source, bag, tubing, connections).",
  },
  {
    id: "aemt-airway-5161",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Using the DOPE mnemonic, a ventilated patient with a supraglottic airway suddenly becomes very difficult to bag, with high resistance felt on the bag, though breath sounds were previously equal and capnography was normal moments earlier. What should the AEMT suspect FIRST, based on this specific change?",
    choices: [
      "The oxygen tank has run out entirely",
      "Obstruction of the airway device or tubing (such as from secretions, kinking, or biting down)",
      "The patient has achieved a completely normal respiratory status",
      "Nothing is wrong and no evaluation is needed",
    ],
    answerIndex: 1,
    explanation:
      "A sudden increase in bagging resistance, especially when breath sounds and capnography were previously normal, most classically suggests an obstruction (secretions, kinking of the tubing, or the patient biting down on the device), which should be checked and addressed (suctioning, repositioning, inserting a bite block) as the first troubleshooting step in this specific scenario, following the DOPE approach.",
  },
  {
    id: "aemt-airway-5162",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: false,
    question: "Which of the following is an appropriate general principle for oxygen administration in a critically ill or injured patient?",
    choices: [
      "Oxygen should never be given to any patient regardless of condition",
      "Supplemental oxygen should be provided as clinically indicated and titrated to an appropriate target saturation based on the patient's condition, rather than either withheld inappropriately or given at maximal concentration to every patient regardless of need",
      "Every patient should always receive a non-rebreather mask at 15 L/min regardless of their oxygen saturation",
      "Oxygen administration decisions should be made without any patient assessment",
    ],
    answerIndex: 1,
    explanation:
      "Modern EMS practice emphasizes titrating supplemental oxygen to an appropriate target saturation based on the patient's clinical condition, rather than either withholding needed oxygen or providing maximal-concentration oxygen indiscriminately to every patient regardless of their actual oxygenation status, since both under-oxygenation and unnecessary hyperoxia have been associated with worse outcomes in some patient populations.",
  },
  {
    id: "aemt-airway-5163",
    domain: "Airway",
    level: "AEMT",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "An AEMT has placed an i-gel airway in a cardiac arrest patient. Two minutes into ventilation, capnography shows a consistent, well-formed waveform at 38 mmHg, breath sounds are equal bilaterally, chest rise is visible and symmetric, and there is no gastric distension. Based on these findings, the AEMT should conclude:",
    choices: [
      "The airway is likely misplaced and should be immediately removed",
      "The airway placement is well-confirmed by multiple consistent objective findings, and the AEMT should continue to monitor these parameters throughout ongoing resuscitation and transport",
      "No further monitoring of the airway is needed for the rest of the call",
      "The patient has achieved ROSC based solely on this capnography value",
    ],
    answerIndex: 1,
    explanation:
      "A consistent, well-formed capnography waveform with a normal value, equal bilateral breath sounds, symmetric visible chest rise, and absence of gastric distension together provide strong, multi-method confirmation of correct airway placement and effective ventilation. This does not by itself indicate ROSC (a sudden RISE in EtCO2 during ongoing CPR is the ROSC indicator, not simply a normal value); continuous monitoring of these parameters should still continue throughout the remainder of the call, since placement can change with movement.",
  },
];
