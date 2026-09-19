// Original AEMT-level "EMS Operations" practice questions. Generated batch —
// not yet merged into questionsAEMT.js. See src/education/questions.js header
// for the field reference and src/education/itemTypes.js for non-MC shapes.
// IDs run aemt-ops-5000 through aemt-ops-5169, sequential, no gaps.

export const BATCH = [
  // ---------------------------------------------------------------------
  // SCENE SAFETY AND SIZE-UP
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5000",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "As the AEMT crew leader arriving first at a multi-vehicle crash on a highway, what is your priority before any patient contact?",
    choices: [
      "Begin triage on the most critically injured patient",
      "Establish scene safety, including traffic control and hazard identification",
      "Contact medical control for treatment orders",
      "Assign a triage tag to every visible patient",
    ],
    answerIndex: 1,
    explanation:
      "Scene safety, including protecting the scene from oncoming traffic and identifying hazards, must be established before any patient care begins. Triage, medical control contact, and tagging all come after the scene is confirmed safe for responders.",
  },
  {
    id: "aemt-ops-5001",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "You are dispatched to an unresponsive patient at a residence. On approach, you notice the front door ajar and no lights on despite it being evening, with no response to your knock. What should you do?",
    choices: [
      "Enter immediately since the patient may be dying",
      "Stage at a safe distance and request law enforcement before entry",
      "Force entry through a window to reach the patient faster",
      "Call out loudly and enter if there is still no answer",
    ],
    answerIndex: 1,
    explanation:
      "Unusual scene indicators (an open door, no lights, no response) are cues of a potentially unsafe scene, warranting staging and law enforcement response before entry. Forcing entry or entering blind risks provider safety without confirming the scene is secure.",
  },
  {
    id: "aemt-ops-5002",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the purpose of the 'index of suspicion' developed during scene size-up?",
    choices: [
      "A formal legal document filed after every call",
      "A mental framework anticipating likely injuries or illness based on scene and patient clues",
      "A checklist used only for hazmat incidents",
      "A score used exclusively for pediatric patients",
    ],
    answerIndex: 1,
    explanation:
      "Index of suspicion is a clinical mental framework built from scene clues, mechanism, and patient presentation that helps anticipate injuries or conditions that may not yet be obvious. It is not a legal document, a hazmat-only tool, or age-restricted.",
  },
  {
    id: "aemt-ops-5003",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "At a residential call for 'chest pain,' you notice drug paraphernalia and an agitated bystander pacing near the door as you approach. What is the most appropriate action?",
    choices: [
      "Continue toward the patient since chest pain is time-critical",
      "Retreat to a safe position and reassess scene safety before proceeding",
      "Confront the bystander directly about the paraphernalia",
      "Radio dispatch only after patient contact is made",
    ],
    answerIndex: 1,
    explanation:
      "Signs of potential danger (agitated bystander, drug paraphernalia) warrant retreating and reassessing before further approach, even for a time-critical complaint, since provider safety takes priority over immediate patient contact. Confronting the bystander or proceeding without reassessment increases risk.",
  },
  {
    id: "aemt-ops-5004",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "During size-up of a structure fire scene, what does 'accountability' refer to in an incident command context?",
    choices: [
      "Tracking financial costs of the incident",
      "A system for tracking the location and status of every responder on scene",
      "Assigning blame for the cause of the fire",
      "Recording patient billing information",
    ],
    answerIndex: 1,
    explanation:
      "Accountability in incident command refers to a personnel tracking system that ensures command knows the location and status of every responder at all times, critical for responder safety. It is unrelated to financial cost tracking, blame assignment, or billing.",
  },
  {
    id: "aemt-ops-5005",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "You arrive at an overturned tanker truck leaking an unknown liquid. Placards are visible but obscured by damage. What is the AEMT's correct scope of action?",
    choices: [
      "Approach and read the placard directly to identify the substance",
      "Stage uphill and upwind, and use binoculars or request hazmat resources to identify placards from a distance",
      "Don standard PPE and begin patient extrication",
      "Wait exactly 10 minutes before making any decision",
    ],
    answerIndex: 1,
    explanation:
      "AEMTs should never approach an unknown hazardous materials scene to read placards directly; identification should occur from a safe distance using binoculars, and specialized hazmat resources should be requested. Standard PPE does not protect against unknown chemical hazards, and there is no fixed universal wait time.",
  },
  {
    id: "aemt-ops-5006",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Which zone at a hazardous materials incident is where decontamination occurs and only appropriately protected personnel operate?",
    choices: ["Hot zone", "Warm zone", "Cold zone", "Support zone"],
    answerIndex: 1,
    explanation:
      "The warm zone is the decontamination corridor between the hot zone (highest contamination) and the cold zone (safe staging/treatment area), and requires appropriate PPE for personnel working there. 'Support zone' is not a standard designated hazmat zone term.",
  },
  {
    id: "aemt-ops-5007",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "In the hazmat zone model, patient treatment by EMS typically occurs in which zone?",
    choices: ["Hot zone", "Warm zone", "Cold zone", "Exclusion zone"],
    answerIndex: 2,
    explanation:
      "The cold zone is the safe area where decontaminated patients are treated and transported; EMS providers without specialized hazmat training and PPE should not enter the hot or warm zones. 'Exclusion zone' is another term sometimes used for the hot zone, not the treatment area.",
  },
  {
    id: "aemt-ops-5008",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "You and your partner arrive at a domestic violence call where law enforcement has secured the scene, but the aggressor's family member is still visibly upset in the driveway. What is the best approach?",
    choices: [
      "Ignore the family member and proceed directly to the patient",
      "Ask law enforcement to manage the upset individual while you maintain situational awareness and proceed to the patient with an escape route in mind",
      "Refuse to treat the patient until the family member leaves entirely",
      "Engage the family member in conversation to calm them yourself",
    ],
    answerIndex: 1,
    explanation:
      "With law enforcement present, AEMTs should let police manage bystanders while maintaining situational awareness and a clear route of egress, allowing patient care to proceed safely. Ignoring the person, refusing care, or personally engaging an upset bystander all increase risk unnecessarily.",
  },
  {
    id: "aemt-ops-5009",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Why should an AEMT approach a vehicle involved in a crash from a position slightly behind the driver's door rather than directly in front of the door?",
    choices: [
      "It is faster to reach the patient this way",
      "It reduces the provider's exposure if the vehicle is thrown into gear or the door is suddenly opened outward",
      "It is required by law in every jurisdiction",
      "It allows better radio reception",
    ],
    answerIndex: 1,
    explanation:
      "Approaching from behind the door line reduces exposure risk if the vehicle unexpectedly moves or the driver opens the door suddenly. This is a safety practice, not primarily about speed, legal mandate, or radio signal.",
  },
  // ---------------------------------------------------------------------
  // TRIAGE — START / JumpSTART / MCI
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5010",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Using START triage, a patient is not breathing after you reposition the airway. What triage category is assigned?",
    choices: ["Immediate (Red)", "Delayed (Yellow)", "Minor (Green)", "Deceased/Expectant (Black)"],
    answerIndex: 3,
    explanation:
      "In START triage, if repositioning the airway does not restore spontaneous respirations, the patient is tagged deceased/expectant, since resources are not available for resuscitation in a mass casualty setting. This differs from single-patient care, where resuscitation would be attempted.",
  },
  {
    id: "aemt-ops-5011",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Using START triage, a patient is breathing at 34 breaths per minute. What is the triage category?",
    choices: ["Immediate (Red)", "Delayed (Yellow)", "Minor (Green)", "Deceased/Expectant (Black)"],
    answerIndex: 0,
    explanation:
      "A respiratory rate greater than 30 breaths per minute in START triage automatically categorizes the patient as immediate (red), regardless of other findings, since this indicates significant respiratory compromise.",
  },
  {
    id: "aemt-ops-5012",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "In START triage, a patient's respiratory rate is 20, radial pulse is present, and the patient follows simple commands correctly. What is the triage category?",
    choices: ["Immediate (Red)", "Delayed (Yellow)", "Minor (Green)", "Deceased/Expectant (Black)"],
    answerIndex: 1,
    explanation:
      "A patient with respirations under 30, a palpable radial pulse, and the ability to follow commands does not meet immediate criteria; unless they can walk (minor/green), they are categorized delayed (yellow). Nothing in this scenario indicates the patient can ambulate.",
  },
  {
    id: "aemt-ops-5013",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "In START triage, what is the first step performed for every patient encountered?",
    choices: [
      "Check radial pulse",
      "Direct all patients who can walk to a designated area",
      "Assess mental status",
      "Assess respiratory rate",
    ],
    answerIndex: 1,
    explanation:
      "START triage begins by directing all patients able to walk to a designated area; these 'walking wounded' are categorized minor (green) without further individual assessment at this stage. The remaining steps (respirations, perfusion, mental status) are performed on patients who cannot walk.",
  },
  {
    id: "aemt-ops-5014",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Using JumpSTART pediatric triage, an infant is not breathing despite airway repositioning, and no palpable pulse is present. What is the correct action?",
    choices: [
      "Tag the infant deceased/expectant immediately, as with adult START",
      "Give 5 rescue breaths before reassessing; if breathing returns, tag immediate; if not, tag deceased",
      "Tag the infant delayed and reassess in 15 minutes",
      "Begin full CPR and transport regardless of other patients",
    ],
    answerIndex: 1,
    explanation:
      "JumpSTART differs from adult START specifically because children more often suffer respiratory arrest with a reversible cause; 5 rescue breaths are given before determining deceased/expectant status, unlike the adult protocol. Immediately tagging deceased or beginning full resuscitation regardless of the MCI context are both incorrect under JumpSTART.",
  },
  {
    id: "aemt-ops-5015",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "build_list",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "Place the following START triage assessment steps in the correct sequential order for a non-ambulatory patient.",
    steps: [
      "Assess respiratory status; open airway if needed",
      "Assess perfusion (radial pulse or capillary refill)",
      "Assess mental status (ability to follow simple commands)",
      "Assign triage category based on findings",
    ],
    correctOrder: [0, 1, 2, 3],
    explanation:
      "START triage proceeds in a fixed sequence: respirations first (with airway repositioning if absent), then perfusion, then mental status, with the triage category assigned based on the first abnormal finding encountered in that order.",
  },
  {
    id: "aemt-ops-5016",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "drag_drop",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Sort each patient finding into the correct START triage category.",
    categories: [
      { id: "immediate", label: "Immediate (Red)" },
      { id: "delayed", label: "Delayed (Yellow)" },
      { id: "minor", label: "Minor (Green)" },
      { id: "expectant", label: "Deceased/Expectant (Black)" },
    ],
    items: [
      { id: "i1", label: "Respiratory rate 36/min", correctCategory: "immediate" },
      { id: "i2", label: "Walking wounded, minor laceration to forearm", correctCategory: "minor" },
      { id: "i3", label: "No respirations after airway repositioning", correctCategory: "expectant" },
      { id: "i4", label: "Respirations 18/min, radial pulse present, follows commands", correctCategory: "delayed" },
      { id: "i5", label: "Capillary refill greater than 2 seconds, respirations 24/min", correctCategory: "immediate" },
    ],
    explanation:
      "START triage sorts patients using respiratory rate, perfusion, and mental status thresholds: RR>30 or delayed capillary refill/absent radial pulse indicates immediate; RR<30 with intact perfusion and mentation indicates delayed; ambulatory patients are minor; and apnea unresponsive to airway repositioning indicates expectant.",
  },
  {
    id: "aemt-ops-5017",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of triage tags in a mass casualty incident?",
    choices: [
      "To provide legal documentation for billing purposes",
      "To rapidly and visibly communicate patient priority to all responders",
      "To identify which hospital each patient should be transported to",
      "To record the patient's full medical history",
    ],
    answerIndex: 1,
    explanation:
      "Triage tags provide a rapid, visible, standardized way to communicate a patient's priority level to every responder working the incident, which is essential when resources are limited. They are not primarily for billing, hospital assignment, or full medical history documentation.",
  },
  {
    id: "aemt-ops-5018",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "During a mass casualty incident, why might a patient with a severe but survivable single injury be tagged 'immediate' while another patient with catastrophic, likely non-survivable injuries is tagged 'expectant'?",
    choices: [
      "Expectant patients are always older than immediate patients",
      "MCI triage allocates limited resources to patients most likely to benefit from immediate intervention, given the resources available",
      "Expectant tagging is based solely on the patient's insurance status",
      "The order of arrival on scene determines the tag",
    ],
    answerIndex: 1,
    explanation:
      "MCI triage philosophy is 'the greatest good for the greatest number' — resources are allocated to patients most likely to survive with intervention, meaning some critically injured patients unlikely to survive even with maximal resources may be tagged expectant so resources go to salvageable patients. Age, insurance, and arrival order are not triage criteria.",
  },
  {
    id: "aemt-ops-5019",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which triage tag color designates a patient with a non-life-threatening injury who can wait for treatment?",
    choices: ["Red", "Yellow", "Green", "Black"],
    answerIndex: 1,
    explanation:
      "Yellow designates delayed patients — those with significant injuries that are not immediately life-threatening and can tolerate a delay in treatment. Red is immediate, green is minor, and black is deceased/expectant.",
  },
  {
    id: "aemt-ops-5020",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "multiple_response",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following are functional roles typically established under the ICS Operations Section at a large-scale EMS incident? (Select 3.)",
    choices: [
      "Triage Group Supervisor",
      "Treatment Group Supervisor",
      "Transportation Group Supervisor",
      "Public Information Officer",
      "Finance/Administration Section Chief",
      "Staging Manager",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "Triage, Treatment, and Transportation Group Supervisors are standard subordinate roles under the Operations Section at a medical branch. The Public Information Officer and Finance/Administration Section Chief report directly to the Incident Commander outside Operations, and Staging is typically a function under Logistics or directly under Operations depending on the ICS structure used, not one of these three core medical branch roles.",
  },
  // ---------------------------------------------------------------------
  // INCIDENT COMMAND / NIMS
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5021",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does the acronym NIMS stand for?",
    choices: [
      "National Incident Management System",
      "National Injury Mitigation Service",
      "National Interagency Medical Standard",
      "National Institute of Medical Simulation",
    ],
    answerIndex: 0,
    explanation:
      "NIMS stands for National Incident Management System, a standardized approach to incident management used across all levels of government and response disciplines in the United States.",
  },
  {
    id: "aemt-ops-5022",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Under the Incident Command System, who has overall authority and responsibility for managing the incident?",
    choices: ["The Safety Officer", "The Incident Commander", "The Public Information Officer", "The Logistics Section Chief"],
    answerIndex: 1,
    explanation:
      "The Incident Commander holds overall authority and responsibility for the incident. The Safety Officer, Public Information Officer, and Logistics Section Chief all support the Incident Commander but do not hold overall command authority.",
  },
  {
    id: "aemt-ops-5023",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is 'unity of command' in the Incident Command System?",
    choices: [
      "Every responder reports only to one designated supervisor",
      "All agencies must use the same radio frequency",
      "Only one agency may respond to any incident",
      "The Incident Commander must personally supervise every responder",
    ],
    answerIndex: 0,
    explanation:
      "Unity of command means each individual reports to only one designated supervisor, preventing conflicting instructions and confusion. It does not require a single radio frequency, restrict which agencies respond, or require the IC to personally supervise every person.",
  },
  {
    id: "aemt-ops-5024",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "An AEMT arrives second at a growing multi-agency incident and observes that command has not yet been formally established. What should they do?",
    choices: [
      "Wait for a chief officer to arrive before establishing any command structure",
      "Establish command themselves if no one else has, and be prepared to transfer it to a more qualified/senior officer upon arrival",
      "Refuse to operate until command is established by someone else",
      "Establish a parallel command structure separate from other agencies",
    ],
    answerIndex: 1,
    explanation:
      "ICS requires that command be established as early as possible; the first appropriately trained responder on scene should establish command and can transfer it formally to a more senior or qualified officer as they arrive, using a proper transfer-of-command process. Waiting indefinitely, refusing to operate, or creating a parallel structure all violate ICS principles.",
  },
  {
    id: "aemt-ops-5025",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "In ICS, what is the recommended optimal span of control for one supervisor?",
    choices: ["1-2 subordinates", "3-7 subordinates, with 5 as optimal", "10-15 subordinates", "Unlimited, based on need"],
    answerIndex: 1,
    explanation:
      "ICS recommends an optimal span of control of 3 to 7 subordinates per supervisor, with 5 considered ideal, to maintain effective management and communication. Exceeding this range degrades a supervisor's ability to manage personnel effectively.",
  },
  {
    id: "aemt-ops-5026",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of a 'unified command' structure?",
    choices: [
      "To allow multiple agencies with jurisdiction to jointly establish incident objectives and strategies without giving up individual agency authority",
      "To eliminate the need for an Incident Commander entirely",
      "To place a single federal agency in charge of all incidents",
      "To combine all responding units into one radio channel only",
    ],
    answerIndex: 0,
    explanation:
      "Unified command allows agencies with jurisdictional or functional responsibility to jointly establish common objectives and strategies while each retains its own authority, accountability, and responsibility. It does not eliminate command, mandate federal control, or refer to radio channel consolidation.",
  },
  {
    id: "aemt-ops-5027",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which ICS section is responsible for acquiring resources such as additional ambulances, supplies, and equipment during an incident?",
    choices: ["Operations", "Planning", "Logistics", "Finance/Administration"],
    answerIndex: 2,
    explanation:
      "The Logistics Section is responsible for providing resources, services, and support needed to meet incident objectives, including acquiring additional units and supplies. Operations executes tactical objectives, Planning tracks resources and develops the incident action plan, and Finance/Administration tracks costs.",
  },
  {
    id: "aemt-ops-5028",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is a 'staging area' in ICS terminology?",
    choices: [
      "The location where the Incident Commander sets up the command post",
      "A temporary location where resources are held available for assignment, awaiting deployment",
      "The area where deceased patients are placed",
      "The morgue location established by the medical examiner",
    ],
    answerIndex: 1,
    explanation:
      "A staging area is a temporary location where personnel and equipment await assignment, allowing resources to be organized and readily available without cluttering the immediate incident scene. It is distinct from the command post and is not related to deceased patient handling.",
  },
  {
    id: "aemt-ops-5029",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "As an AEMT arriving to stage for a large incident, you are directed to a staging area but see a critically injured patient nearby who was not yet triaged. What is the most appropriate action?",
    choices: [
      "Ignore the patient and proceed directly to staging as instructed",
      "Notify the Staging Manager or Triage Group of the untriaged patient while proceeding to your assigned location, or briefly assess if directed to do so by command",
      "Abandon your assignment and begin treating the patient independently",
      "Transport the patient immediately without notifying command",
    ],
    answerIndex: 1,
    explanation:
      "Maintaining the chain of command and accountability is essential in large incidents; the AEMT should report the finding through the appropriate channel (Staging Manager or Triage Group) rather than freelancing outside their assignment, which could create accountability gaps and resource confusion. Ignoring the patient, abandoning assignment, or transporting without notification all undermine incident management.",
  },
  // ---------------------------------------------------------------------
  // COMMUNICATIONS
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5030",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary benefit of using standardized 'clear text' radio communication instead of 10-codes across multi-agency incidents?",
    choices: [
      "It sounds more professional on recordings",
      "It reduces confusion since 10-codes vary between agencies and jurisdictions",
      "It is required by federal law for every radio transmission",
      "It uses less radio bandwidth",
    ],
    answerIndex: 1,
    explanation:
      "Clear text communication is recommended by NIMS/ICS because 10-codes and similar systems vary significantly between agencies and jurisdictions, creating confusion during multi-agency operations. It is a best-practice recommendation for interoperability, not primarily about professionalism, a blanket federal mandate, or bandwidth.",
  },
  {
    id: "aemt-ops-5031",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "When giving a radio report to the receiving hospital, which format best ensures a concise, organized handoff?",
    choices: [
      "A verbatim reading of the entire patient care report",
      "A structured format including unit ID, patient age/sex, chief complaint, pertinent history, vital signs, treatment given, and ETA",
      "Only the patient's name and room number request",
      "A lengthy narrative of the entire call from dispatch to current time",
    ],
    answerIndex: 1,
    explanation:
      "A structured radio report (unit ID, age/sex, chief complaint, pertinent history, vitals, treatment, ETA) ensures the receiving facility gets essential information efficiently. Reading the entire PCR verbatim or giving an unstructured narrative wastes radio time and buries key information; naming and room requests alone omit clinical content.",
  },
  {
    id: "aemt-ops-5032",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does the term 'interoperability' refer to in EMS communications?",
    choices: [
      "The ability of different agencies and systems to communicate and work together effectively",
      "The requirement that all agencies use identical vehicles",
      "A specific brand of radio equipment",
      "The process of billing multiple insurance companies",
    ],
    answerIndex: 0,
    explanation:
      "Interoperability refers to the ability of different agencies, jurisdictions, and disciplines to communicate and operate together effectively, particularly important during multi-agency incidents. It is not about vehicle uniformity, a specific equipment brand, or billing.",
  },
  {
    id: "aemt-ops-5033",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which practice best reduces the risk of miscommunication when receiving an order from online medical control?",
    choices: [
      "Assume the order was heard correctly and proceed",
      "Repeat the order back to the physician verbatim before administering it",
      "Only write the order down after the call ends",
      "Administer half the ordered dose to be safe",
    ],
    answerIndex: 1,
    explanation:
      "Repeating an order back verbatim (a 'read-back' or 'echo' technique) confirms accurate understanding between the AEMT and physician before an intervention is performed, reducing medication and treatment errors. Assuming correctness, delaying documentation, or unilaterally altering a dose all increase risk.",
  },
  {
    id: "aemt-ops-5034",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Radio communication should generally avoid using patients' full names over open channels primarily because of concerns related to:",
    choices: [
      "Radio bandwidth limitations",
      "HIPAA and patient privacy protections",
      "FCC regulations on profanity",
      "Battery conservation on portable radios",
    ],
    answerIndex: 1,
    explanation:
      "Avoiding patient names over open, often publicly monitored radio channels protects patient confidentiality under HIPAA and general privacy principles. This is not primarily a bandwidth, profanity regulation, or battery issue.",
  },
  // ---------------------------------------------------------------------
  // DOCUMENTATION
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5035",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary legal principle behind the saying 'if it wasn't documented, it wasn't done'?",
    choices: [
      "Documentation is only needed for billing purposes",
      "In a legal or quality review context, care that is not documented may be presumed not to have been performed",
      "Only physician orders need to be documented",
      "Verbal reports to the hospital replace the need for written documentation",
    ],
    answerIndex: 1,
    explanation:
      "This principle reflects that a patient care report serves as the legal record of care; assessments and interventions not documented may be presumed, in legal or quality review, to not have occurred, regardless of whether they were actually performed. It applies to all care, not just billing or physician orders, and a verbal report does not substitute for written documentation.",
  },
  {
    id: "aemt-ops-5036",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "When correcting an error on a written patient care report, what is the correct procedure?",
    choices: [
      "Use correction fluid to completely obscure the error",
      "Draw a single line through the error, initial it, and write the correction nearby",
      "Discard the report and start over on a new form without noting the change",
      "Erase the error completely and rewrite it",
    ],
    answerIndex: 1,
    explanation:
      "Proper correction technique involves a single line through the error (so it remains legible), initialing it, and writing the correction, preserving the integrity and legal defensibility of the record. Obscuring, erasing, or discarding a record without explanation can appear as an attempt to alter or hide information.",
  },
  {
    id: "aemt-ops-5037",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following is considered subjective information in a patient care report?",
    choices: [
      "A blood pressure reading of 128/82 mmHg",
      "The patient's statement, 'The pain feels like an elephant sitting on my chest'",
      "A 12-lead ECG showing ST elevation",
      "A pulse oximetry reading of 96%",
    ],
    answerIndex: 1,
    explanation:
      "Subjective information reflects what the patient reports or describes, such as a description of pain. Vital signs, ECG findings, and pulse oximetry readings are objective, measurable data.",
  },
  {
    id: "aemt-ops-5038",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "A competent adult patient refuses transport after a thorough assessment reveals no immediate life threats. What must the AEMT document to reduce liability?",
    choices: [
      "Only the patient's name and the fact that they refused",
      "That the patient was informed of risks of refusal, was assessed as having decision-making capacity, and understood the information, including any signature obtained",
      "Nothing further is required once a refusal form is signed",
      "The AEMT's personal opinion about why the patient is making a poor decision",
    ],
    answerIndex: 1,
    explanation:
      "Thorough refusal documentation should include the assessment findings, evidence of decision-making capacity, that risks/benefits were explained and understood, and any signatures obtained, since refusals carry significant liability if the patient later deteriorates. A signature alone or minimal documentation is insufficient, and personal opinions are not appropriate documentation content.",
  },
  {
    id: "aemt-ops-5039",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does the 'A' in the SOAP documentation format stand for?",
    choices: ["Airway", "Assessment", "Allergies", "Ambulance"],
    answerIndex: 1,
    explanation:
      "SOAP stands for Subjective, Objective, Assessment, Plan. The 'Assessment' section contains the provider's clinical impression based on the subjective and objective findings.",
  },
  {
    id: "aemt-ops-5040",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why should a patient care report avoid using unapproved or non-standard abbreviations?",
    choices: [
      "It saves the AEMT time when writing the report",
      "Unapproved abbreviations can be misinterpreted, creating patient safety and legal risks",
      "Non-standard abbreviations are prohibited only in pediatric reports",
      "Only physicians are permitted to use abbreviations",
    ],
    answerIndex: 1,
    explanation:
      "Non-standard or unapproved abbreviations can be misread or misinterpreted by other providers, creating both patient safety risks and legal vulnerability if the report is later reviewed. This restriction applies to all patient care reports, not just pediatric ones, and is not about who is 'permitted' to abbreviate.",
  },
  // ---------------------------------------------------------------------
  // LEGAL / ETHICAL
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5041",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A patient with a valid, properly executed DNR (Do Not Resuscitate) order goes into cardiac arrest in front of the AEMT. What is the correct action?",
    choices: [
      "Begin full resuscitation regardless of the DNR order",
      "Withhold resuscitative efforts consistent with the valid DNR order, while still providing comfort measures as appropriate",
      "Contact family to get verbal permission before deciding",
      "Perform resuscitation only if bystanders insist",
    ],
    answerIndex: 1,
    explanation:
      "A valid, properly executed DNR order should be honored, meaning resuscitative efforts are withheld while comfort care continues. Family verbal permission is not required to honor a valid legal document, and bystander insistence does not override a legitimate DNR.",
  },
  {
    id: "aemt-ops-5042",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the legal concept of 'duty to act' as it applies to an on-duty AEMT?",
    choices: [
      "The obligation to respond to and treat patients within their scope once a call is accepted or a patient contact is initiated",
      "The requirement to volunteer at every off-duty emergency encountered",
      "A rule that only applies to physicians",
      "The obligation to always transport every patient regardless of refusal",
    ],
    answerIndex: 0,
    explanation:
      "Duty to act refers to the legal obligation an on-duty AEMT has to respond to and provide care once dispatched or once patient contact begins, within their scope of practice. It generally does not extend to off-duty situations unless state law or a Good Samaritan-adjacent statute creates one, is not physician-only, and does not override a competent patient's right to refuse.",
  },
  {
    id: "aemt-ops-5043",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best defines 'negligence' in an EMS legal context?",
    choices: [
      "Any adverse patient outcome regardless of the care provided",
      "A failure to act as a reasonably prudent AEMT would under similar circumstances, resulting in harm",
      "Refusing to transport a patient who wants to go to the hospital",
      "Documenting a call incorrectly",
    ],
    answerIndex: 1,
    explanation:
      "Negligence requires a breach of the standard of care (failing to act as a reasonably prudent provider would) that directly causes harm to the patient, not simply a bad outcome. An adverse outcome alone, without a breach of standard of care, does not constitute negligence.",
  },
  {
    id: "aemt-ops-5044",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What four elements must generally be proven for a negligence claim against an EMS provider to succeed?",
    choices: [
      "Duty, breach of duty, causation, and damages",
      "Motive, opportunity, intent, and action",
      "Scene safety, patient consent, transport, and documentation",
      "Dispatch time, response time, on-scene time, and transport time",
    ],
    answerIndex: 0,
    explanation:
      "A successful negligence claim requires proof of duty (the provider owed a duty of care), breach (the duty was breached), causation (the breach caused harm), and damages (actual harm resulted). The other listed sets are unrelated legal concepts or operational metrics, not negligence elements.",
  },
  {
    id: "aemt-ops-5045",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "An intoxicated but otherwise alert and oriented adult patient refuses treatment after a minor fall with no apparent injury. Does this patient have the legal capacity to refuse care?",
    choices: [
      "Yes, alertness alone is always sufficient for capacity",
      "It depends; significant intoxication can impair the ability to understand risks/benefits and may negate decision-making capacity, requiring careful assessment",
      "No patient who has consumed any alcohol can ever refuse care",
      "Capacity is irrelevant as long as the patient signs a form",
    ],
    answerIndex: 1,
    explanation:
      "Decision-making capacity requires the patient to understand the situation, risks, and consequences of their decision; significant intoxication can impair this even if the patient appears alert, requiring the AEMT to carefully assess capacity rather than assuming it based on alertness alone or a signature.",
  },
  {
    id: "aemt-ops-5046",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is 'implied consent' as applied to an unresponsive trauma patient found alone?",
    choices: [
      "Consent given verbally by a bystander on the patient's behalf",
      "The legal assumption that a reasonable person would consent to emergency treatment if able to communicate",
      "Consent that must be obtained from next of kin before any treatment",
      "A form the patient must sign upon regaining consciousness",
    ],
    answerIndex: 1,
    explanation:
      "Implied consent is the legal doctrine that assumes a reasonable person would consent to necessary emergency treatment if they were able to communicate, allowing treatment of unresponsive or incapacitated patients without a signed form or bystander proxy.",
  },
  {
    id: "aemt-ops-5047",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'abandonment' in an EMS legal context?",
    choices: [
      "Terminating care of a patient without ensuring an equal or higher level of care continues, without the patient's consent",
      "Transferring a patient to a physician at the emergency department",
      "Refusing to transport a patient who has decision-making capacity and refuses care",
      "Calling for a higher level of ALS backup",
    ],
    answerIndex: 0,
    explanation:
      "Abandonment occurs when a provider terminates care without ensuring continuity by an equal or higher level of care, without the patient's consent. Transferring care to a physician, honoring a competent refusal, or requesting ALS backup are all appropriate actions, not abandonment.",
  },
  {
    id: "aemt-ops-5048",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "An AEMT suspects child abuse during a call but the injuries are not immediately life-threatening. What is the correct action regarding mandatory reporting?",
    choices: [
      "Ignore the suspicion since the child is not in immediate danger",
      "Report the suspicion to the appropriate child protective services or law enforcement agency as required by mandatory reporter laws",
      "Confront the caregiver directly about the suspected abuse",
      "Only report if the child explicitly states they were abused",
    ],
    answerIndex: 1,
    explanation:
      "AEMTs are mandatory reporters in most jurisdictions and are legally required to report suspected child abuse to the appropriate agency, regardless of whether the current injury is immediately life-threatening or whether the child discloses abuse verbally. Confronting the caregiver directly could compromise safety and the investigation.",
  },
  {
    id: "aemt-ops-5049",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does HIPAA primarily regulate in the context of EMS operations?",
    choices: [
      "Vehicle maintenance schedules",
      "The privacy and security of patients' protected health information",
      "The number of personnel required on an ambulance",
      "Controlled substance storage requirements only",
    ],
    answerIndex: 1,
    explanation:
      "HIPAA (Health Insurance Portability and Accountability Act) governs the privacy and security of patients' protected health information, restricting how it can be shared and accessed. It does not regulate vehicle maintenance, staffing minimums, or exclusively controlled substances (though it does intersect with health information generally).",
  },
  {
    id: "aemt-ops-5050",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A patient with a documented history of psychiatric illness is refusing transport after a suicide attempt, and is currently making statements about wanting to die. What is the most appropriate AEMT action?",
    choices: [
      "Honor the refusal since the patient is verbal and ambulatory",
      "Treat the patient under the principle that an immediate danger to self overrides the ability to refuse care, and involve law enforcement/appropriate holds as needed per local protocol",
      "Leave the scene and let family decide what to do",
      "Physically restrain the patient without any additional resources or authority",
    ],
    answerIndex: 1,
    explanation:
      "A patient expressing active suicidal intent presents an immediate danger to self, which generally overrides the right to refuse care; local protocols typically require law enforcement involvement and may allow an involuntary psychiatric hold. Simply honoring the refusal, leaving the decision to family, or restraining without proper authority/backup are all inappropriate and potentially unsafe.",
  },
  // ---------------------------------------------------------------------
  // AMBULANCE OPERATIONS
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5051",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "According to research on ambulance crash statistics, when do the majority of ambulance collisions with other vehicles occur?",
    choices: [
      "While the ambulance is stationary at a hospital",
      "While responding with lights and sirens, particularly at intersections",
      "During routine, non-emergency transport",
      "While the ambulance is being refueled",
    ],
    answerIndex: 1,
    explanation:
      "Most ambulance collisions occur during emergency response with lights and sirens, especially at intersections, where other drivers may not yield appropriately or may not hear/see the emergency vehicle in time. Stationary, routine transport, and refueling scenarios are not the predominant collision settings.",
  },
  {
    id: "aemt-ops-5052",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "When approaching a controlled intersection with a red light during an emergency response, what is the correct practice?",
    choices: [
      "Proceed through at normal speed since lights and sirens are active",
      "Come to a complete or near-complete stop, ensure all lanes have yielded, and proceed only when safe",
      "Only slow down if another emergency vehicle is also present",
      "Sound the siren continuously and proceed without stopping, since sirens grant automatic right of way",
    ],
    answerIndex: 1,
    explanation:
      "Emergency vehicle operators must come to a controlled/complete stop at red lights or stop signs and confirm that all lanes of traffic have yielded before proceeding, since lights and sirens request the right of way but do not guarantee it. Proceeding through at normal speed or assuming automatic right of way significantly increases collision risk.",
  },
  {
    id: "aemt-ops-5053",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is 'due regard' as it relates to emergency vehicle operations?",
    choices: [
      "The legal standard requiring emergency vehicle operators to drive with reasonable caution and consideration for the safety of others, even when exempt from certain traffic laws",
      "A requirement to always use lights and sirens",
      "The maximum speed limit exemption granted during any emergency response",
      "A rule that only applies to ambulances, not fire or police vehicles",
    ],
    answerIndex: 0,
    explanation:
      "'Due regard' is the legal standard requiring emergency vehicle operators to operate with reasonable caution for the safety of others, even when statutory exemptions (such as exceeding speed limits or proceeding through red lights) apply. It does not mandate lights/sirens use at all times, does not grant unlimited speed exemption, and applies broadly to emergency vehicle operators, not just ambulances.",
  },
  {
    id: "aemt-ops-5054",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "While driving code 3 (lights and sirens) to a call, your partner in the passenger seat notices a vehicle ahead is not yielding despite the siren. What is the most appropriate action for the driver?",
    choices: [
      "Continue at the same speed, assuming the vehicle will eventually move",
      "Slow down, be prepared to stop, and proceed with caution around the non-yielding vehicle only when it is safe to do so",
      "Use the horn continuously and accelerate to pass quickly",
      "Turn off the siren so the vehicle is not startled",
    ],
    answerIndex: 1,
    explanation:
      "Not all drivers will hear, see, or yield to an emergency vehicle; the correct response is to slow down, be prepared to stop, and proceed cautiously only once it is safe, rather than assuming compliance or accelerating. Turning off the siren removes an important warning device and is inappropriate.",
  },
  {
    id: "aemt-ops-5055",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which factor is most associated with reduced ambulance crash risk during emergency response?",
    choices: [
      "Increasing speed to reduce total response time",
      "Complete stops at all negative right-of-way intersections and controlled, defensive driving",
      "Using only visual warning devices without audible sirens",
      "Following other emergency vehicles as closely as possible to reduce convoy length",
    ],
    answerIndex: 1,
    explanation:
      "Coming to controlled/complete stops at intersections where the ambulance does not have the right of way, combined with defensive driving practices, is strongly associated with reduced crash risk. Increased speed, relying on only one type of warning device, and close following distance in a convoy all increase risk.",
  },
  {
    id: "aemt-ops-5056",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why should ambulance personnel remain seated and belted in the patient compartment whenever possible during transport?",
    choices: [
      "It is only a suggestion with no real safety benefit",
      "Unrestrained providers are at significantly higher risk of severe injury or death in a crash, and this also improves the ability to safely deliver care",
      "It is required only for pediatric transports",
      "It has no bearing on patient care quality",
    ],
    answerIndex: 1,
    explanation:
      "Unrestrained EMS providers in the patient compartment face significantly elevated risk of severe injury or death during a crash; remaining seated and belted whenever clinically feasible reduces this risk while still allowing patient care to be delivered safely. This applies to all patients, not just pediatric transports.",
  },
  {
    id: "aemt-ops-5057",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of a pre-shift vehicle and equipment check?",
    choices: [
      "To satisfy a purely administrative requirement with no operational value",
      "To identify equipment failures or missing supplies before they affect patient care during an emergency",
      "To reduce the ambulance's resale value assessment",
      "To determine crew assignments for the shift",
    ],
    answerIndex: 1,
    explanation:
      "Pre-shift checks identify malfunctioning equipment, low supplies, or vehicle issues before they can compromise patient care during an actual emergency response, when there is no time to troubleshoot. It is not merely administrative, unrelated to resale value, and does not determine crew assignments.",
  },
  {
    id: "aemt-ops-5058",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "During transport, a stable patient's condition suddenly deteriorates and requires an intervention beyond what can be safely performed while the vehicle is moving. What should the AEMT do?",
    choices: [
      "Continue at current speed and attempt the intervention while moving regardless of difficulty",
      "Request the driver safely pull over to a secure location to perform the intervention, if patient condition and time allow",
      "Ignore the deterioration until arrival at the hospital",
      "Instruct the driver to increase speed significantly instead of stopping",
    ],
    answerIndex: 1,
    explanation:
      "When an intervention cannot be safely performed with the vehicle in motion, requesting a brief, safe stop allows the AEMT to deliver effective care without compromising vehicle safety, when patient condition and time permit. Attempting risky interventions while moving, ignoring deterioration, or simply increasing speed do not address the immediate clinical need safely.",
  },
  {
    id: "aemt-ops-5059",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the recommended action when an ambulance approaches a school bus with flashing red lights and an extended stop arm?",
    choices: [
      "Pass immediately since the ambulance has lights and sirens active",
      "Stop as required by law in most jurisdictions, since children may be crossing unpredictably, unless specific state law provides an emergency vehicle exception that still requires extreme caution",
      "Sound the air horn to make the bus driver retract the stop arm",
      "Drive around using the opposite lane at normal speed",
    ],
    answerIndex: 1,
    explanation:
      "School bus stop-arm laws exist because children may cross unpredictably; even with lights and sirens, extreme caution is warranted, and in most jurisdictions the ambulance must still stop or proceed with extraordinary caution as governed by state law. Passing at normal speed or in the opposing lane risks striking a child.",
  },
  {
    id: "aemt-ops-5060",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which statement about backing an ambulance is correct?",
    choices: [
      "Backing should always be done without a spotter to save time",
      "A spotter should be used whenever possible, and mirrors alone should not be relied upon due to blind spots",
      "Backing cameras eliminate the need for any additional precautions",
      "Backing is only risky in commercial parking lots",
    ],
    answerIndex: 1,
    explanation:
      "Because ambulances have significant blind spots, a ground spotter should be used whenever possible during backing maneuvers, even when backing cameras are present, since cameras have limitations too. Backing without precautions or assuming risk is limited to certain locations increases collision risk.",
  },
  // ---------------------------------------------------------------------
  // HAZMAT AWARENESS
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5061",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "At the awareness level of hazmat training, what is the primary role of an AEMT arriving at a suspected hazmat incident?",
    choices: [
      "Enter the hot zone to begin patient extrication",
      "Recognize the presence of hazardous materials, isolate the area, deny entry, and notify appropriate specialized resources",
      "Attempt to neutralize the hazardous substance",
      "Perform decontamination on all exposed patients personally",
    ],
    answerIndex: 1,
    explanation:
      "At the awareness level, the AEMT's role is to recognize a potential hazmat situation, isolate the area, deny entry to unprotected personnel, and notify specialized hazmat resources, not to enter the hot zone, neutralize substances, or perform decontamination without proper training and PPE.",
  },
  {
    id: "aemt-ops-5062",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "What information does the Emergency Response Guidebook (ERG) primarily provide to responders?",
    choices: [
      "Detailed patient treatment protocols for every toxic exposure",
      "Initial guidance on identifying hazardous materials by placard/ID number and recommended initial isolation and protective action distances",
      "State-by-state EMS licensure requirements",
      "Billing codes for hazmat-related transports",
    ],
    answerIndex: 1,
    explanation:
      "The ERG helps first responders quickly identify a hazardous material based on placards, UN/NA numbers, or names, and provides initial isolation/protective action distance guidance and general hazard information. It is not a clinical treatment manual, licensure reference, or billing resource.",
  },
  {
    id: "aemt-ops-5063",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "You respond to an industrial facility for 'multiple patients with respiratory distress' and notice a strong chemical odor as you exit the ambulance, along with a visible vapor cloud near the building. What is the correct initial action?",
    choices: [
      "Enter the building immediately to begin triage",
      "Retreat upwind and uphill to a safe distance, establish a perimeter, and request hazmat resources before any patient contact",
      "Put on standard N95 masks and proceed inside",
      "Open all ambulance windows and proceed cautiously",
    ],
    answerIndex: 1,
    explanation:
      "A visible vapor cloud and strong chemical odor are clear indicators of an active hazardous materials release; the correct action is to retreat to a safe upwind/uphill position, establish a perimeter, and request specialized hazmat resources before any further action. Standard masks do not provide adequate chemical protection, and proceeding inside risks provider exposure.",
  },
  {
    id: "aemt-ops-5064",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "What is the significance of a diamond-shaped NFPA 704 placard on a fixed facility?",
    choices: [
      "It indicates the facility's fire insurance rating",
      "It provides a quick visual indication of health, flammability, and reactivity hazards, along with special hazard notations, using a numeric scale",
      "It indicates the number of employees at the facility",
      "It is used exclusively for radioactive material storage",
    ],
    answerIndex: 1,
    explanation:
      "The NFPA 704 placard uses a color-coded diamond (blue for health, red for flammability, yellow for reactivity, white for special hazards) with a 0-4 numeric scale to give responders a quick visual assessment of hazards present at a fixed facility. It is not an insurance rating, employee count, or radiation-exclusive marking.",
  },
  {
    id: "aemt-ops-5065",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Why is it important to approach a suspected hazmat scene from an uphill, upwind direction whenever possible?",
    choices: [
      "It provides better radio reception",
      "Many hazardous vapors and gases are heavier than air and travel downhill, and wind can carry airborne contaminants toward responders positioned downwind",
      "It is required only for daytime incidents",
      "It has no real safety benefit, only tactical convenience",
    ],
    answerIndex: 1,
    explanation:
      "Approaching from uphill and upwind reduces the likelihood of exposure, since many hazardous vapors are denser than air and settle in low areas, and wind direction can carry airborne contaminants toward anyone positioned downwind. This is a genuine safety practice, not merely about radio reception or convenience, and applies regardless of time of day.",
  },
  {
    id: "aemt-ops-5066",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "options_table",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "For each scenario, identify whether the AEMT's described action is Appropriate or Inappropriate at the awareness level of hazmat response.",
    options: ["Appropriate", "Inappropriate"],
    rows: [
      { id: "r1", finding: "Retreating to a safe distance and calling for a hazmat team after noting an unusual placard", correctOptionIndex: 0 },
      { id: "r2", finding: "Entering a warehouse with an unidentified chemical spill wearing only a surgical mask to assess patients", correctOptionIndex: 1 },
      { id: "r3", finding: "Using binoculars from a safe distance to read a placard before approaching further", correctOptionIndex: 0 },
      { id: "r4", finding: "Attempting to physically move a leaking drum away from patients to speed up treatment", correctOptionIndex: 1 },
    ],
    explanation:
      "At the awareness level, appropriate actions are limited to recognition, isolation, and notification from a safe distance (retreating and calling for hazmat, using binoculars to identify placards). Entering an unknown chemical environment with inadequate protection or physically handling hazardous materials both exceed the awareness-level scope and place the provider at serious risk.",
  },
  {
    id: "aemt-ops-5067",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "In hazmat terminology, what does 'decontamination' refer to?",
    choices: [
      "Cleaning the ambulance after every call",
      "The process of removing or neutralizing hazardous substances from a person, equipment, or environment to prevent further exposure or spread",
      "Sterilizing medical equipment between patients",
      "Disposing of expired medications",
    ],
    answerIndex: 1,
    explanation:
      "Decontamination is the process of removing or neutralizing hazardous substances from people, equipment, or the environment to prevent further exposure and prevent secondary contamination of responders or facilities. General ambulance cleaning, equipment sterilization, and medication disposal are separate processes.",
  },
  {
    id: "aemt-ops-5068",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Why should AEMTs generally avoid transporting a contaminated patient to the hospital before decontamination is performed?",
    choices: [
      "It slows down response times for other calls",
      "It risks contaminating the ambulance, crew, and receiving hospital, potentially spreading the hazard and taking the ED out of service",
      "It is a billing issue only",
      "There is no real concern; decontamination can always happen at the hospital instead",
    ],
    answerIndex: 1,
    explanation:
      "Transporting a contaminated patient without decontamination risks spreading hazardous material to the ambulance, crew, and hospital, potentially contaminating the emergency department and taking it out of service. This is a genuine patient/responder safety and public health concern, not primarily about response times or billing.",
  },
  {
    id: "aemt-ops-5069",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "What color placard on a transport vehicle typically indicates a flammable liquid hazard under the U.S. DOT placarding system?",
    choices: ["White", "Red", "Green", "Yellow"],
    answerIndex: 1,
    explanation:
      "Red placards under the DOT system generally indicate flammable liquid or flammable gas hazards. White is often used for poison/toxic materials, green for non-flammable gas, and yellow for oxidizers or certain organic peroxides, though specific classes vary by hazard class number.",
  },
  {
    id: "aemt-ops-5070",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "What is a Safety Data Sheet (SDS) used for in a hazmat incident?",
    choices: [
      "It documents crew payroll information",
      "It provides detailed information about a specific chemical's hazards, handling, first aid measures, and protective equipment requirements",
      "It is a form used only for OSHA workplace inspections unrelated to emergencies",
      "It replaces the need for the ERG entirely",
    ],
    answerIndex: 1,
    explanation:
      "A Safety Data Sheet provides detailed, chemical-specific information including hazards, handling precautions, first aid measures, and required protective equipment, useful when a specific chemical has been identified. It is unrelated to payroll and does not replace the ERG, which serves a different, more general initial-response purpose.",
  },
  // ---------------------------------------------------------------------
  // MCI OPERATIONS (further)
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5071",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What officially defines an incident as a 'mass casualty incident' (MCI) for a given EMS system?",
    choices: [
      "Any incident involving more than 5 patients regardless of local resources",
      "An incident in which the number of patients exceeds the resources readily available to that system, requiring a shift from individual to resource-based patient care",
      "Any incident involving a natural disaster",
      "Any incident lasting longer than one hour",
    ],
    answerIndex: 1,
    explanation:
      "An MCI is defined relative to available resources — it is any incident where patient needs exceed immediately available resources, requiring the system to shift from individualized care to a resource-allocation, greatest-good approach. A fixed patient count, natural disaster classification, or duration alone does not define an MCI, since a small system may be overwhelmed by relatively few patients.",
  },
  {
    id: "aemt-ops-5072",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "In an MCI, what is the primary function of the Treatment Group during patient management?",
    choices: [
      "To perform initial triage tagging of every patient",
      "To provide definitive stabilizing care to patients after triage, organized by triage category, before transport",
      "To transport patients directly from the point of injury",
      "To manage scene safety and traffic control",
    ],
    answerIndex: 1,
    explanation:
      "The Treatment Group provides stabilizing care to patients who have already been triaged, typically organized into red/yellow/green treatment areas, before patients are moved to transportation. Initial triage tagging is done by the Triage Group, direct transport is coordinated by the Transportation Group, and scene safety/traffic is typically a separate function.",
  },
  {
    id: "aemt-ops-5073",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "During an MCI, the Transportation Group Supervisor's primary responsibility includes:",
    choices: [
      "Performing patient triage",
      "Tracking which patients are sent to which receiving facilities and coordinating with hospitals to avoid overwhelming any single facility",
      "Administering medications to critical patients",
      "Establishing the incident command post location",
    ],
    answerIndex: 1,
    explanation:
      "The Transportation Group Supervisor coordinates patient distribution among receiving facilities, tracking which patients go where to prevent any single hospital from being overwhelmed, and communicates with hospitals about incoming patient loads. Triage, medication administration, and command post establishment are functions of other roles.",
  },
  {
    id: "aemt-ops-5074",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "During a large-scale MCI, local hospital capacity is limited. What is the most appropriate strategy for distributing patients among receiving facilities?",
    choices: [
      "Send all critical patients to the single closest hospital regardless of its capacity",
      "Distribute patients across multiple appropriate facilities based on patient acuity, facility capability, and current capacity, coordinated through the Transportation Group",
      "Allow each individual ambulance crew to independently choose a hospital with no coordination",
      "Transport all patients to the regional trauma center only, regardless of injury severity",
    ],
    answerIndex: 1,
    explanation:
      "Effective MCI transportation strategy distributes patients across multiple appropriate facilities based on acuity, capability, and real-time capacity, coordinated centrally through the Transportation Group to prevent any one facility from being overwhelmed. Sending everyone to one hospital, uncoordinated independent choices, or overloading only the trauma center all risk facility overload and delayed care.",
  },
  {
    id: "aemt-ops-5075",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of a 'morgue' or deceased holding area at an MCI?",
    choices: [
      "To provide additional treatment space for delayed patients",
      "To provide a designated, respectful location for deceased patients, separate from active treatment and triage areas, and to preserve evidence when applicable",
      "To serve as the incident command post",
      "To house extra medical supplies",
    ],
    answerIndex: 1,
    explanation:
      "A designated deceased holding area keeps deceased patients separate from active treatment areas for both operational and dignity reasons, and can help preserve the scene for investigative purposes when the incident may involve criminal activity. It is not used as additional treatment space, a command post, or supply storage.",
  },
  {
    id: "aemt-ops-5076",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why is periodic retriage important during a prolonged mass casualty incident?",
    choices: [
      "It is not necessary once initial triage is complete",
      "Patient conditions can change over time; a patient initially tagged delayed may deteriorate and require reclassification as immediate",
      "It is only done to satisfy documentation requirements",
      "Retriage is performed only on patients tagged minor",
    ],
    answerIndex: 1,
    explanation:
      "Patient conditions can evolve during a prolonged incident; periodic retriage ensures that a patient who deteriorates (for example, from delayed to immediate) is identified and reprioritized for care and transport. It is a clinical necessity, not merely documentation, and applies to patients across triage categories, not just minor.",
  },
  {
    id: "aemt-ops-5077",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does 'surge capacity' refer to in the context of an MCI response?",
    choices: [
      "The maximum speed an ambulance can safely travel",
      "The ability of a healthcare system to rapidly expand beyond normal operations to manage a significant increase in patient volume",
      "The electrical power capacity of an ambulance's onboard systems",
      "The number of radios available on scene",
    ],
    answerIndex: 1,
    explanation:
      "Surge capacity describes a healthcare system's ability to expand and manage a sudden, significant increase in patient volume beyond normal operating levels, which is critical during MCIs and disasters. It is unrelated to vehicle speed, electrical systems, or radio inventory.",
  },
  {
    id: "aemt-ops-5078",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "Following the conclusion of a major MCI, the department holds a formal review meeting to discuss what worked well and what could be improved. What is this process called?",
    choices: [
      "Critical incident stress debriefing",
      "After-action review (or post-incident critique/debrief)",
      "Morbidity and mortality conference",
      "Peer review board",
    ],
    answerIndex: 1,
    explanation:
      "An after-action review (also called a post-incident critique or debrief) systematically examines the operational response to identify successes and areas for improvement. Critical incident stress debriefing addresses emotional/psychological impact on responders, morbidity and mortality conferences focus on clinical case review, and peer review boards address individual provider performance issues.",
  },
  // ---------------------------------------------------------------------
  // AEMT SCOPE OF PRACTICE
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5079",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "According to the National EMS Scope of Practice Model, which of the following skills is within the AEMT scope of practice but generally NOT within the EMT scope?",
    choices: [
      "Oxygen administration",
      "Peripheral IV and IO access with administration of a limited set of medications and fluids",
      "Spinal motion restriction",
      "Automated external defibrillation",
    ],
    answerIndex: 1,
    explanation:
      "The AEMT scope includes peripheral IV and IO access and administration of certain medications and fluids, which exceeds the EMT scope. Oxygen administration, spinal motion restriction, and AED use are within the EMT scope of practice as well.",
  },
  {
    id: "aemt-ops-5080",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "Which of the following is generally OUTSIDE the AEMT scope of practice, requiring paramedic-level training?",
    choices: [
      "Endotracheal intubation using paralytic medications (rapid sequence induction)",
      "Peripheral IV access",
      "Administration of albuterol via nebulizer",
      "Supraglottic airway insertion",
    ],
    answerIndex: 0,
    explanation:
      "Rapid sequence induction/intubation using paralytic and sedative medications is a paramedic-level skill requiring extensive additional training and is outside the AEMT scope of practice. Peripheral IV access, nebulized albuterol administration, and supraglottic airway insertion are all generally within AEMT scope.",
  },
  {
    id: "aemt-ops-5081",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "An AEMT is asked by a family member to interpret a 12-lead ECG and make a definitive diagnosis of the patient's cardiac condition. What is the most appropriate response?",
    choices: [
      "Provide a definitive diagnosis since the AEMT can read the ECG waveform",
      "Explain that while certain patterns are being monitored and communicated to receiving facility/medical control, a definitive diagnosis is outside the AEMT's scope and role",
      "Refuse to discuss the ECG at all",
      "Tell the family the patient is fine to avoid alarming them",
    ],
    answerIndex: 1,
    explanation:
      "While AEMTs can recognize certain ECG patterns and communicate findings appropriately to medical control or the receiving facility, providing a definitive diagnosis is outside their scope and role. Refusing all communication or providing false reassurance are also inappropriate.",
  },
  {
    id: "aemt-ops-5082",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the relationship between an AEMT's scope of practice and their state's EMS regulations/local medical director protocols?",
    choices: [
      "The National EMS Scope of Practice Model is legally binding in every state with no variation permitted",
      "State regulations and local medical director protocols define the actual legal scope of practice, which may be narrower or, in some cases, expanded relative to the national model",
      "AEMTs may perform any skill they feel competent to perform regardless of state law",
      "Scope of practice is determined solely by the individual AEMT's personal experience level",
    ],
    answerIndex: 1,
    explanation:
      "The National EMS Scope of Practice Model serves as a guideline, but actual legal scope of practice is defined by state regulations and further refined by local medical director protocols, which can vary and may be narrower (or in limited cases broader with additional training/authorization) than the national model. Personal comfort level alone does not establish legal scope.",
  },
  {
    id: "aemt-ops-5083",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "An AEMT is directed by online medical control to perform a skill that the AEMT believes exceeds their local scope of practice. What is the most appropriate response?",
    choices: [
      "Perform the skill immediately since a physician gave the order",
      "Respectfully inform medical control of the scope concern and decline to perform the skill if it is indeed outside legal scope, while offering to perform any appropriate alternative",
      "Perform the skill but do not document it",
      "Ignore the order entirely without any communication",
    ],
    answerIndex: 1,
    explanation:
      "A physician order does not expand an AEMT's legal scope of practice; the AEMT should respectfully communicate the concern to medical control and decline to perform a skill outside their legal scope, offering appropriate alternatives within their training. Performing an out-of-scope skill (documented or not) or ignoring the order without communication are both inappropriate responses.",
  },
  {
    id: "aemt-ops-5084",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Standing orders (protocols) differ from online medical control orders in that standing orders:",
    choices: [
      "Require real-time physician communication before every action",
      "Are pre-approved treatment guidelines that allow the AEMT to act without contacting a physician in real time, within defined parameters",
      "Only apply to BLS-level interventions",
      "Cannot be used under any circumstances by AEMTs",
    ],
    answerIndex: 1,
    explanation:
      "Standing orders are pre-established protocols approved by the medical director that allow the AEMT to perform certain assessments and interventions without needing real-time physician contact, within specified parameters. They can apply to ALS-level interventions within AEMT scope, not just BLS, and are commonly used by AEMTs.",
  },
  {
    id: "aemt-ops-5085",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A local protocol allows AEMTs to administer a certain medication under standing order, but the AEMT is unsure whether the specific patient's presentation meets the protocol's criteria. What is the best course of action?",
    choices: [
      "Administer the medication anyway since it is generally within scope",
      "Contact online medical control for guidance before proceeding if there is genuine uncertainty about whether protocol criteria are met",
      "Withhold all treatment and wait for a paramedic unit regardless of patient need",
      "Ask a bystander for their opinion on whether to proceed",
    ],
    answerIndex: 1,
    explanation:
      "When there is genuine uncertainty about whether a specific patient's presentation meets standing order criteria, contacting online medical control for guidance is the appropriate step, ensuring safe and protocol-compliant care. Proceeding despite uncertainty, withholding all care unnecessarily, or consulting a bystander are all inappropriate.",
  },
  // ---------------------------------------------------------------------
  // MULTI-RESPONSE / DRAG-DROP / OPTIONS-TABLE (advanced formats continued)
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5086",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "multiple_response",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following are generally required elements of a legally valid refusal of care/transport by a competent adult patient? (Select 3.)",
    choices: [
      "The patient has decision-making capacity",
      "The patient was informed of the risks, benefits, and alternatives of refusing care",
      "The AEMT personally agrees with the patient's decision",
      "The refusal and the information provided are properly documented",
      "A family member must co-sign the refusal in every case",
      "The patient understands the information provided",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "A valid refusal requires the patient to have decision-making capacity, be informed of risks/benefits/alternatives, understand that information, and have the encounter properly documented. The AEMT's personal agreement with the decision is irrelevant to validity, and a family co-signature is not universally required for a competent adult's own refusal.",
  },
  {
    id: "aemt-ops-5087",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "multiple_response",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Which of the following scene findings should prompt an AEMT to stage and await law enforcement before approaching a patient? (Select 3.)",
    choices: [
      "Visible weapons on scene",
      "Reports of an ongoing physical altercation",
      "A patient with a known history of diabetes",
      "Aggressive, threatening bystanders",
      "A patient complaining of a headache",
      "Signs the scene is not yet secured, such as active shouting or fighting audible on arrival",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "Visible weapons, an ongoing altercation, aggressive/threatening bystanders, and audible evidence the scene is not yet secured are all clear indicators of an unsafe scene requiring staging until law enforcement secures it. A known diabetes history or a headache complaint alone are patient care factors unrelated to scene safety and do not by themselves indicate danger.",
  },
  {
    id: "aemt-ops-5088",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "drag_drop",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Sort each role into the correct ICS section it typically falls under at a large EMS incident.",
    categories: [
      { id: "operations", label: "Operations Section" },
      { id: "logistics", label: "Logistics Section" },
      { id: "planning", label: "Planning Section" },
      { id: "finance", label: "Finance/Administration Section" },
    ],
    items: [
      { id: "d1", label: "Triage Group Supervisor", correctCategory: "operations" },
      { id: "d2", label: "Supply Unit Leader", correctCategory: "logistics" },
      { id: "d3", label: "Resources Unit Leader", correctCategory: "planning" },
      { id: "d4", label: "Cost Unit Leader", correctCategory: "finance" },
      { id: "d5", label: "Transportation Group Supervisor", correctCategory: "operations" },
    ],
    explanation:
      "Operations executes tactical objectives (Triage and Transportation Group Supervisors); Logistics provides resources and supplies (Supply Unit Leader); Planning tracks resource status and develops incident action plans (Resources Unit Leader); Finance/Administration tracks incident costs (Cost Unit Leader).",
  },
  {
    id: "aemt-ops-5089",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "build_list",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "Place the following actions in the correct order for an AEMT responding to a report of an active violent scene where dispatch information is unclear.",
    steps: [
      "Stage at a safe distance away from the scene, out of sight/sound if possible",
      "Maintain radio contact with dispatch and await confirmation the scene is secure",
      "Approach the scene once law enforcement confirms it is safe",
      "Begin patient assessment and treatment",
    ],
    correctOrder: [0, 1, 2, 3],
    explanation:
      "For an unclear or potentially violent scene, the correct sequence is to stage at a safe distance, maintain communication awaiting confirmation of scene security, approach only once cleared, and then begin patient care — never reversing this order regardless of the patient's apparent time-critical needs.",
  },
  {
    id: "aemt-ops-5090",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "options_table",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "For each patient finding in a mass casualty incident, classify the correct START triage category.",
    options: ["Immediate (Red)", "Delayed (Yellow)", "Minor (Green)"],
    rows: [
      { id: "s1", finding: "Ambulatory patient with a laceration to the hand, no other complaints", correctOptionIndex: 2 },
      { id: "s2", finding: "Non-ambulatory, respirations 26/min, radial pulse present, follows commands", correctOptionIndex: 1 },
      { id: "s3", finding: "Non-ambulatory, respirations 32/min", correctOptionIndex: 0 },
      { id: "s4", finding: "Non-ambulatory, respirations 18/min, absent radial pulse", correctOptionIndex: 0 },
    ],
    explanation:
      "Ambulatory patients are minor (green). Non-ambulatory patients with RR under 30, intact perfusion, and normal mentation are delayed (yellow). Non-ambulatory patients with RR over 30, OR with RR under 30 but absent radial pulse/delayed capillary refill, are immediate (red), since perfusion failure independently triggers immediate regardless of respiratory rate.",
  },
  {
    id: "aemt-ops-5091",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of a Critical Incident Stress Management (CISM) program in EMS?",
    choices: [
      "To evaluate clinical performance for disciplinary purposes",
      "To provide peer support and structured interventions to help responders process the psychological impact of critical incidents",
      "To determine eligibility for workers' compensation claims",
      "To replace the need for professional mental health treatment entirely",
    ],
    answerIndex: 1,
    explanation:
      "CISM programs are designed to provide peer support and structured interventions to help responders cope with the psychological impact of critical incidents, promoting resilience and early identification of those who may need further support. They are not disciplinary tools, workers' compensation determinations, or replacements for professional mental health care when needed.",
  },
  {
    id: "aemt-ops-5092",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "An AEMT who responded to a particularly traumatic pediatric cardiac arrest call is having trouble sleeping and experiencing intrusive thoughts about the call days later. What is the most appropriate action?",
    choices: [
      "Ignore the symptoms since they are a normal part of the job",
      "Recognize this as a potential sign of critical incident stress and seek support through CISM resources, a supervisor, or a mental health professional",
      "Avoid discussing it with anyone to appear resilient",
      "Request an immediate transfer to a non-EMS position",
    ],
    answerIndex: 1,
    explanation:
      "Sleep disturbance and intrusive thoughts following a traumatic call are recognized signs of critical incident stress and should prompt the AEMT to seek appropriate support (CISM, supervisor, or mental health professional) rather than dismissing symptoms or avoiding support out of a desire to appear resilient. An immediate job transfer is an extreme and premature response before seeking support.",
  },
  {
    id: "aemt-ops-5093",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which body substance isolation (BSI) precaution should be used for a routine patient contact with no known specific infection risk beyond standard exposure potential?",
    choices: [
      "No precautions are needed for any patient contact",
      "Standard precautions, including gloves and, as indicated, eye/face protection",
      "Full hazmat-level PPE for every patient",
      "Precautions are only needed if the patient is bleeding visibly",
    ],
    answerIndex: 1,
    explanation:
      "Standard precautions (including gloves, and eye/face protection as indicated by the potential for splash exposure) should be used for essentially all patient contacts, since infection status is often unknown. Full hazmat PPE is excessive for routine calls, and precautions should not be reserved only for visible bleeding, since many pathogens are transmitted without visible blood.",
  },
  {
    id: "aemt-ops-5094",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the correct sequence for donning personal protective equipment when airborne precautions are indicated in addition to standard precautions?",
    choices: [
      "Gloves first, then everything else in any order",
      "Hand hygiene, gown, mask/respirator, eye protection, gloves (general recommended CDC sequence)",
      "Gloves, then hand hygiene, then all other equipment",
      "Order does not matter as long as all equipment is eventually worn",
    ],
    answerIndex: 1,
    explanation:
      "The generally recommended donning sequence is hand hygiene, gown, mask/respirator, eye protection, then gloves last, which helps minimize contamination risk during the donning process. Order does matter for infection control effectiveness, and gloves should not be donned before hand hygiene or other PPE.",
  },
  {
    id: "aemt-ops-5095",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT sustains a needlestick injury while starting an IV on a patient with unknown infectious disease status. What is the correct immediate action?",
    choices: [
      "Ignore it since most needlesticks are not serious",
      "Wash the area with soap and water, report the exposure per agency protocol, and seek medical evaluation/follow-up as indicated",
      "Wait until the end of shift to report it",
      "Only report it if symptoms develop later",
    ],
    answerIndex: 1,
    explanation:
      "A needlestick injury should be immediately washed with soap and water, reported per agency exposure control protocol, and followed by prompt medical evaluation, since post-exposure prophylaxis for certain pathogens is time-sensitive. Ignoring the injury, delaying the report, or waiting for symptoms to appear all risk missing time-sensitive treatment windows.",
  },
  {
    id: "aemt-ops-5096",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of an exposure control plan required under OSHA bloodborne pathogens standards?",
    choices: [
      "To outline procedures for minimizing occupational exposure to bloodborne pathogens and the response process if exposure occurs",
      "To determine which employees receive raises",
      "To schedule vehicle maintenance",
      "To track patient billing disputes",
    ],
    answerIndex: 0,
    explanation:
      "An exposure control plan outlines an agency's procedures for minimizing employee exposure to bloodborne pathogens and defines the response process (reporting, evaluation, follow-up) if an exposure occurs, as required by OSHA. It is unrelated to compensation decisions, vehicle maintenance, or billing.",
  },
  {
    id: "aemt-ops-5097",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'triage' as a general EMS concept?",
    choices: [
      "The process of sorting patients based on the severity of their condition to determine priority of care and transport",
      "The process of billing patients for services rendered",
      "A form filled out only during hospital admission",
      "The process of cleaning equipment after a call",
    ],
    answerIndex: 0,
    explanation:
      "Triage is the process of sorting and prioritizing patients based on the severity of their condition and likelihood of benefiting from intervention, to determine the order and level of care/transport provided, particularly critical when resources are limited.",
  },
  {
    id: "aemt-ops-5098",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "During quality improvement review, a pattern is identified where AEMTs frequently fail to document pain reassessment after analgesic administration. What is the most appropriate systemic response?",
    choices: [
      "Discipline every individual AEMT involved without further investigation",
      "Investigate the root cause (such as unclear protocol, form design, or training gaps) and implement a systemic improvement, such as revised documentation prompts or targeted training",
      "Ignore the pattern since it is a minor documentation issue",
      "Eliminate the reassessment requirement entirely to reduce documentation burden",
    ],
    answerIndex: 1,
    explanation:
      "A quality improvement approach investigates the root cause of a systemic pattern (protocol clarity, form design, training) and implements a targeted improvement, rather than assuming individual fault or ignoring a documentation gap that has real clinical and legal significance. Eliminating the requirement removes an important clinical safety practice rather than addressing the underlying issue.",
  },
  {
    id: "aemt-ops-5099",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of continuous quality improvement (CQI) programs in EMS systems?",
    choices: [
      "To identify individual providers for termination",
      "To systematically review patient care and operational data to identify opportunities to improve system performance and patient outcomes",
      "To increase call volume",
      "To reduce the number of AEMTs employed by an agency",
    ],
    answerIndex: 1,
    explanation:
      "CQI programs systematically review patient care and operational data to identify trends, gaps, and opportunities for improving system performance and patient outcomes, using a constructive, systems-based approach rather than a punitive one. It is not designed as a termination mechanism, a call-volume tool, or a staffing reduction tool.",
  },
  {
    id: "aemt-ops-5100",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the concept of 'evidence-based practice' in EMS protocol development?",
    choices: [
      "Protocols developed solely based on tradition and personal preference of the medical director",
      "Clinical protocols and practices developed and updated based on the best available scientific research and outcome data",
      "A practice that never changes once established",
      "A practice used only in hospital settings, not prehospital care",
    ],
    answerIndex: 1,
    explanation:
      "Evidence-based practice involves developing and updating clinical protocols based on the best available scientific research and outcome data, rather than tradition alone, and is increasingly applied in prehospital EMS protocol development. Protocols based on evidence are expected to evolve as new research emerges, not remain static.",
  },
  // ---------------------------------------------------------------------
  // SCENARIO-LINKED ITEMS
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5101",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    scenarioId: "highway-mvc-001",
    scenarioStage: "en_route",
    question:
      "Dispatch advises you are responding to a two-vehicle crash on the interstate with reports of a person trapped. As you head en route, what should you begin doing to prepare for scene arrival?",
    choices: [
      "Wait until arrival to think about scene safety at all",
      "Mentally rehearse scene size-up priorities, including traffic control needs, hazard potential, and required additional resources (fire/rescue, law enforcement) based on dispatch information",
      "Assume the scene will already be fully secured by the time you arrive",
      "Focus solely on planning your medication doses for the entrapped patient before arrival",
    ],
    answerIndex: 1,
    explanation:
      "Effective size-up begins with dispatch information; en route, the AEMT should anticipate hazards (traffic, extrication needs) and confirm appropriate additional resources have been requested, rather than waiting until arrival or assuming safety. Focusing only on medication planning before assessing safety and resource needs is premature.",
  },
  {
    id: "aemt-ops-5102",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    scenarioId: "highway-mvc-001",
    scenarioStage: "scene",
    question:
      "On arrival, you find a vehicle on its side partially blocking a traffic lane, with fire department already establishing traffic control and beginning extrication. What is the AEMT's correct action?",
    choices: [
      "Immediately enter the vehicle to begin patient care before extrication is complete, disregarding fire department direction",
      "Coordinate with the fire department/incident command, position the ambulance appropriately, and prepare to provide care once extrication personnel indicate it is safe to do so",
      "Leave the scene since fire department is already present",
      "Begin directing traffic yourself instead of patient care preparation",
    ],
    answerIndex: 1,
    explanation:
      "When other specialized resources (fire/extrication) are already managing a specific hazard, the AEMT should coordinate with them and incident command, position appropriately, and prepare for patient care once it is safe to proceed, rather than entering a hazardous extrication scene prematurely or abandoning the scene. Directing traffic is generally outside the AEMT's role when trained personnel are already doing so.",
  },
  {
    id: "aemt-ops-5103",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    scenarioId: "highway-mvc-001",
    scenarioStage: "post_scene",
    question:
      "After the patient is extricated, treated, and transported, what documentation elements should the AEMT ensure are included in the patient care report regarding the extrication process?",
    choices: [
      "No documentation of extrication details is necessary",
      "Mechanism of injury, extrication time/method, and any relevant scene findings that inform the patient's clinical picture",
      "Only the patient's final vital signs at the hospital",
      "The names of every bystander present at the scene",
    ],
    answerIndex: 1,
    explanation:
      "Documentation should include mechanism of injury, extrication details (method and approximate time), and relevant scene findings, since these inform the receiving facility's understanding of injury patterns and potential complications (such as prolonged extrication and crush injury risk). Bystander names are not typically required documentation elements, and omitting extrication details would leave out clinically relevant information.",
  },
  {
    id: "aemt-ops-5104",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    scenarioId: "mci-factory-002",
    scenarioStage: "en_route",
    question:
      "Dispatch reports an explosion at an industrial facility with 'multiple patients, unknown number.' As the first arriving AEMT unit, what should you plan to establish immediately upon arrival, before patient contact?",
    choices: [
      "Immediately begin treating the first patient encountered",
      "A brief scene size-up including hazard assessment, an initial patient count estimate, and early establishment of incident command",
      "Wait in the ambulance until a supervisor arrives",
      "Call for additional units only after fully assessing every patient individually",
    ],
    answerIndex: 1,
    explanation:
      "As a first-arriving unit at a potential MCI, the priority is a brief size-up (hazards, approximate patient count) and early establishment of command, which allows for appropriate resource requests and a coordinated response, rather than immediately fixating on one patient or waiting passively. Delaying additional resource requests until every patient is individually assessed would slow the overall response.",
  },
  {
    id: "aemt-ops-5105",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "build_list",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    scenarioId: "mci-factory-002",
    scenarioStage: "scene",
    question:
      "Place the following actions in the correct order for the first-arriving AEMT unit establishing initial command at this developing MCI.",
    steps: [
      "Perform a brief scene size-up and estimate approximate patient count",
      "Establish initial incident command and request additional resources based on the estimated need",
      "Begin or delegate triage of patients using START/JumpSTART",
      "Establish treatment, transportation, and staging areas as resources arrive",
    ],
    correctOrder: [0, 1, 2, 3],
    explanation:
      "The correct initial sequence is size-up and patient count estimation, establishing command and requesting resources based on that estimate, beginning triage, and then establishing treatment/transportation/staging areas as additional resources arrive to support the expanding operation.",
  },
  {
    id: "aemt-ops-5106",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    scenarioId: "mci-factory-002",
    scenarioStage: "post_scene",
    question:
      "Following this MCI, command debriefs the crews and notes that transportation destinations were poorly coordinated, resulting in one hospital receiving far more patients than others. What improvement should be prioritized going forward?",
    choices: [
      "Assign no formal Transportation Group role in future incidents",
      "Strengthen the Transportation Group function, including real-time hospital capacity communication and centralized tracking of patient destinations",
      "Always transport every patient to the same single hospital regardless of capacity",
      "Eliminate the Treatment Group role instead",
    ],
    answerIndex: 1,
    explanation:
      "The identified gap points to a need for a stronger, better-coordinated Transportation Group function with real-time hospital capacity communication and centralized destination tracking, preventing overload of any single facility in future incidents. Eliminating the role entirely, defaulting to one hospital, or removing an unrelated function (Treatment Group) would not address the actual identified problem.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL SCENE SAFETY / OPERATIONS QUESTIONS
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5107",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "What is the correct action if an AEMT arrives on scene and observes downed electrical wires across the roadway near the patient's vehicle?",
    choices: [
      "Drive over the wires carefully to reach the patient faster",
      "Treat all downed wires as energized until the utility company confirms otherwise, and maintain a safe distance",
      "Have a bystander move the wires with a dry wooden stick",
      "Touch the wires briefly to check if they are live",
    ],
    answerIndex: 1,
    explanation:
      "All downed power lines should be treated as energized and dangerous until the utility company confirms de-energization, regardless of appearance. Driving over wires, having bystanders move them, or testing them directly all pose serious electrocution risk.",
  },
  {
    id: "aemt-ops-5108",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "During size-up of a structure fire scene, why should AEMTs generally avoid parking the ambulance directly in front of the involved structure?",
    choices: [
      "It blocks the view for photographs",
      "It may obstruct fire apparatus access and places the ambulance at risk from structural collapse, falling debris, or explosion",
      "It uses more fuel to park close",
      "There is no operational reason for this practice",
    ],
    answerIndex: 1,
    explanation:
      "Parking directly in front of an involved structure can obstruct fire apparatus access and places the ambulance and crew at risk from collapse, falling debris, or explosion; staging at a safe distance designated by command is the correct practice.",
  },
  {
    id: "aemt-ops-5109",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "While assessing a patient in their home, the AEMT notices an aggressive dog approaching from another room. What is the most appropriate action?",
    choices: [
      "Continue the assessment and hope the dog stays away",
      "Request the family secure the animal in a separate room before continuing, retreating to a safe position if needed until this is done",
      "Attempt to physically restrain the dog",
      "Use a chemical spray on the dog to keep it away",
    ],
    answerIndex: 1,
    explanation:
      "Requesting the family secure an aggressive animal in a separate room, and retreating to safety if necessary until this occurs, addresses the hazard without unnecessary risk. Continuing to work around an approaching aggressive animal, physically restraining it, or using chemical deterrents all increase injury risk to the crew and the animal.",
  },
  {
    id: "aemt-ops-5110",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'situational awareness' as it applies to EMS operations?",
    choices: [
      "Focusing exclusively on the patient's condition and nothing else",
      "Continuously perceiving and understanding the surrounding environment, hazards, and changes throughout a call to maintain personal and patient safety",
      "A skill only needed by law enforcement, not EMS",
      "A one-time assessment performed only at dispatch",
    ],
    answerIndex: 1,
    explanation:
      "Situational awareness is the continuous process of perceiving and understanding the surrounding environment and any changes throughout a call, essential for maintaining safety. It is not exclusive to law enforcement, is not limited to patient assessment alone, and must be maintained throughout the call, not just at dispatch.",
  },
  {
    id: "aemt-ops-5111",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT crew is assessing a patient inside a residence when a verbal argument breaks out between family members nearby, escalating in intensity. What should the crew do?",
    choices: [
      "Continue the assessment and ignore the escalating argument",
      "Reassess scene safety, consider moving the patient to a safer location if feasible, and request law enforcement if the situation continues to escalate",
      "Join the argument to try to mediate it themselves",
      "Immediately abandon the patient without any communication",
    ],
    answerIndex: 1,
    explanation:
      "An escalating situation nearby warrants ongoing reassessment of scene safety; moving the patient if feasible and requesting law enforcement support if needed are appropriate responses. Ignoring the escalation, mediating the argument personally, or abandoning the patient without communication are all inappropriate.",
  },
  {
    id: "aemt-ops-5112",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "What is the purpose of designating a rehabilitation ('rehab') area at a prolonged incident such as a large structure fire?",
    choices: [
      "To provide a location for media interviews",
      "To provide responders a place for rest, rehydration, and medical monitoring to prevent exhaustion, dehydration, or heat/cold injury",
      "To store extra apparatus equipment only",
      "To house the incident command post",
    ],
    answerIndex: 1,
    explanation:
      "A rehabilitation area allows responders working a prolonged, physically demanding incident to rest, rehydrate, and be medically monitored, helping prevent exhaustion, dehydration, and environmental injury. It is not intended for media interviews, equipment storage, or as the command post location.",
  },
  {
    id: "aemt-ops-5113",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Why is it important for AEMTs to maintain a clear route of egress when entering any scene, particularly one with uncertain safety?",
    choices: [
      "To make it easier to find parking",
      "To ensure a rapid, unobstructed retreat is possible if the scene suddenly becomes unsafe",
      "It is only relevant for structure fires",
      "It has no real safety purpose",
    ],
    answerIndex: 1,
    explanation:
      "Maintaining a clear route of egress ensures that if a scene rapidly becomes unsafe, responders can retreat quickly without obstruction, a fundamental personal safety principle applicable to any scene type, not just structure fires.",
  },
  {
    id: "aemt-ops-5114",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the significance of the 'Golden Hour' concept in trauma care, and how does it relate to EMS operational decision-making?",
    choices: [
      "It refers to the hour immediately following hospital discharge",
      "It refers to the concept that definitive trauma care within approximately one hour of injury improves outcomes, influencing decisions like scene time minimization and transport destination",
      "It refers to the first hour of an AEMT's shift",
      "It is a billing term with no clinical significance",
    ],
    answerIndex: 1,
    explanation:
      "The 'Golden Hour' concept holds that definitive care for major trauma within roughly one hour of injury is associated with improved outcomes, which influences operational decisions such as minimizing scene time for critical trauma patients and selecting an appropriate trauma-capable destination facility. It is unrelated to shift timing, discharge, or billing.",
  },
  {
    id: "aemt-ops-5115",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A critically injured trauma patient is 10 minutes from a Level I trauma center by ground but 35 minutes to a local community hospital with no trauma designation, and no air medical resource is available. What is generally the most appropriate transport decision?",
    choices: [
      "Transport to the closer community hospital because it is faster to reach any facility",
      "Transport to the appropriate trauma center, even with a longer transport time, since definitive trauma capability outweighs facility proximity when the patient can tolerate the transport",
      "Wait on scene indefinitely for an available air medical unit",
      "Transport to whichever hospital family requests",
    ],
    answerIndex: 1,
    explanation:
      "For a critically injured trauma patient, transporting to an appropriate trauma center is generally prioritized over transporting to the closest, non-trauma-capable facility, since definitive capability significantly impacts outcomes, provided the patient's condition can tolerate the additional transport time and local protocols support this decision. Waiting indefinitely for an unavailable resource or deferring to family preference over clinical trauma triage criteria are both inappropriate.",
  },
  {
    id: "aemt-ops-5116",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following is a standard field trauma triage criterion that would typically warrant transport to a trauma center under most trauma triage guidelines?",
    choices: [
      "Glasgow Coma Scale of 15 with an isolated minor abrasion",
      "Systolic blood pressure less than 90 mmHg in an adult trauma patient",
      "A patient with a stable vital sign profile and an isolated sprained ankle",
      "A patient requesting to go to their preferred hospital for a minor complaint",
    ],
    answerIndex: 1,
    explanation:
      "Hypotension (systolic BP under 90 mmHg) in an adult trauma patient is a physiologic criterion in standard field trauma triage guidelines (such as the CDC Field Triage Guidelines) that warrants transport to the highest level trauma center within the transport time. A normal GCS with a minor injury, a stable isolated ankle sprain, or a patient preference for a minor complaint do not meet trauma center triage criteria.",
  },
  {
    id: "aemt-ops-5117",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is a 'stroke center' or 'STEMI receiving center' designation intended to indicate to EMS providers?",
    choices: [
      "A facility with no special capability, marketing only",
      "A facility that has met specific criteria and resources for rapid, specialized treatment of stroke or heart attack patients, influencing destination decisions",
      "A facility exclusively for pediatric patients",
      "A facility that does not accept ambulance transports",
    ],
    answerIndex: 1,
    explanation:
      "Stroke center and STEMI receiving center designations indicate a facility has met specific criteria and maintains resources for rapid, specialized treatment of these time-critical conditions, and EMS destination protocols often direct appropriate patients to these designated facilities when feasible. These are not purely marketing designations, not pediatric-exclusive, and such facilities do accept ambulance transports.",
  },
  {
    id: "aemt-ops-5118",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A patient meets criteria for transport to a designated stroke center, but the nearest hospital (not a stroke center) is significantly closer. Per most regional stroke destination protocols, what should generally guide the AEMT's decision?",
    choices: [
      "Always transport to the closest hospital regardless of designation",
      "Follow the regional stroke destination protocol, which often directs transport to the nearest appropriate stroke center within a defined additional transport time, given the time-sensitive nature of stroke treatment",
      "Let the patient decide with no clinical input",
      "Transport to the farthest hospital regardless of stroke designation",
    ],
    answerIndex: 1,
    explanation:
      "Regional stroke destination protocols typically direct transport to the nearest appropriate stroke center, even if it means bypassing a closer non-designated facility, within a defined acceptable additional transport time, given how significantly time-to-treatment affects stroke outcomes. Defaulting purely to the closest facility regardless of capability, deferring entirely to patient preference, or an arbitrary farthest-facility approach are not appropriate destination decision processes.",
  },
  {
    id: "aemt-ops-5119",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does 'medical direction' refer to in EMS systems?",
    choices: [
      "GPS navigation guidance provided to ambulance crews",
      "Physician oversight and guidance of an EMS system's clinical practices, protocols, and quality assurance",
      "The physical direction an ambulance travels to a call",
      "A billing category for insurance claims",
    ],
    answerIndex: 1,
    explanation:
      "Medical direction refers to physician oversight of an EMS system, including protocol development, quality assurance, education, and both online (real-time) and offline (standing orders/protocols) guidance for providers. It has no relationship to GPS navigation, travel direction, or insurance billing categories.",
  },
  {
    id: "aemt-ops-5120",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the difference between 'online' (direct) and 'offline' (indirect) medical direction?",
    choices: [
      "Online medical direction involves real-time communication with a physician during a call, while offline medical direction includes pre-established protocols, training, and quality review",
      "There is no meaningful difference between the two terms",
      "Online medical direction only applies to internet-based communication systems",
      "Offline medical direction means no physician oversight exists",
    ],
    answerIndex: 0,
    explanation:
      "Online (direct) medical direction involves real-time communication with a physician (typically by radio or phone) during a call, while offline (indirect) medical direction encompasses pre-established protocols, standing orders, training, and quality assurance activities that occur outside of real-time patient contact.",
  },
  {
    id: "aemt-ops-5121",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the role of the EMS Medical Director in relation to an AEMT's scope of practice at the local level?",
    choices: [
      "The Medical Director has no authority over protocols",
      "The Medical Director establishes and approves local protocols, standing orders, and may authorize or restrict specific skills within the bounds of state regulation",
      "The Medical Director only handles billing disputes",
      "The Medical Director's role ends once protocols are written and never changes",
    ],
    answerIndex: 1,
    explanation:
      "The EMS Medical Director establishes and approves local protocols and standing orders, and can authorize or restrict specific skills or medications within the bounds of state regulation and the AEMT's certification level, playing an ongoing role in clinical oversight, not a one-time task. Billing disputes are not the Medical Director's primary function.",
  },
  // ---------------------------------------------------------------------
  // MORE TRIAGE / MCI SCENARIO ITEMS AND MULTI-RESPONSE
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5122",
    domain: "EMS Operations",
    level: "AEMT",
    itemType: "multiple_response",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Using JumpSTART pediatric triage, which of the following are assessment differences from adult START triage? (Select 2.)",
    choices: [
      "A respiratory rate threshold that differs from the adult 30/min cutoff at the upper and lower ends",
      "Rescue breaths are given for apneic children before determining deceased/expectant status",
      "Children are never assigned the minor/green category",
      "Children who can walk are still individually assessed using the full physiologic criteria before being tagged minor",
      "Capillary refill is never used as a perfusion criterion in JumpSTART",
    ],
    correctIndices: [0, 1],
    explanation:
      "JumpSTART uses an age-appropriate respiratory rate range (rather than a single 30/min threshold) and gives 5 rescue breaths to apneic children before determining deceased/expectant status, reflecting that pediatric arrests are more often respiratory in origin and potentially reversible. Children can be assigned minor/green if ambulatory, and ambulatory children are not required to undergo full physiologic assessment first, mirroring the adult approach for the walking wounded.",
  },
  {
    id: "aemt-ops-5123",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "In JumpSTART triage, an ambulatory 6-year-old with a minor laceration but who appears alert and interactive is best categorized as:",
    choices: ["Immediate (Red)", "Delayed (Yellow)", "Minor (Green)", "Deceased/Expectant (Black)"],
    answerIndex: 2,
    explanation:
      "An ambulatory child with only a minor injury and normal mental status is categorized minor (green), the same principle applied to ambulatory adults in standard START triage.",
  },
  {
    id: "aemt-ops-5124",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why might a single EMS system use a different triage system (such as SALT) instead of START in an MCI?",
    choices: [
      "SALT and similar systems are identical to START in every respect",
      "Different triage systems (such as SALT) may incorporate additional steps like global sorting and individual assessment refinements, and system choice depends on local protocol and training",
      "There is a federal mandate requiring every system to use SALT exclusively",
      "Triage system choice has no operational significance",
    ],
    answerIndex: 1,
    explanation:
      "Several validated triage systems exist (START, JumpSTART, SALT, and others), each with somewhat different approaches such as global sorting steps or additional assessment criteria; the specific system used depends on local protocol, training, and medical director preference, not a single federal mandate. Understanding the locally used system is operationally significant for consistent, effective triage.",
  },
  {
    id: "aemt-ops-5125",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "During MCI triage, an AEMT encounters a patient who is ambulatory but reports severe chest pain and appears pale and diaphoretic. How should this patient be categorized?",
    choices: [
      "Automatically minor (green) because they are ambulatory",
      "The AEMT should further assess this patient rather than automatically tagging minor, since severe symptoms despite ambulation may warrant reclassification per local triage protocol",
      "Automatically deceased/expectant",
      "Ignore the patient since ambulatory patients are always lowest priority",
    ],
    answerIndex: 1,
    explanation:
      "While ambulatory status is the initial sorting criterion in START, a patient with concerning symptoms (severe chest pain, pallor, diaphoresis) despite being able to walk should prompt further assessment, since some triage protocols and clinical judgment allow for reclassification of an ambulatory patient with serious findings rather than rigidly applying the ambulatory-equals-minor rule without exception. Automatically tagging minor or expectant without consideration, or ignoring the patient, are inappropriate.",
  },
  {
    id: "aemt-ops-5126",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of a unified triage tag numbering system used across a multi-agency MCI response?",
    choices: [
      "To assign billing account numbers",
      "To allow tracking of individual patients across triage, treatment, transport, and hospital arrival, maintaining accountability throughout the incident",
      "To determine crew pay differentials",
      "To rank responders by seniority",
    ],
    answerIndex: 1,
    explanation:
      "A unified triage tag numbering system allows patients to be tracked consistently across triage, treatment, transportation, and hospital arrival, maintaining accountability for every patient throughout a complex, multi-agency incident. It is unrelated to billing, crew pay, or responder seniority.",
  },
  {
    id: "aemt-ops-5127",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT assigned to the Triage Group in an MCI encounters a deceased patient with obvious mortal injuries. What is the correct action?",
    choices: [
      "Attempt full resuscitation regardless of the MCI context",
      "Tag the patient deceased/expectant per triage protocol and move to the next patient without delay, continuing rapid triage",
      "Stop all triage activities to notify the family immediately",
      "Transport the deceased patient before any other patients",
    ],
    answerIndex: 1,
    explanation:
      "In the Triage Group role during an MCI, the AEMT should tag the patient per protocol and continue rapidly triaging remaining patients without delay, since spending time on already-deceased patients diverts resources from salvageable patients. Attempting full resuscitation in an MCI context, stopping triage to notify family, or prioritizing transport of the deceased all contradict appropriate MCI triage principles.",
  },
  // ---------------------------------------------------------------------
  // ADDITIONAL COMMUNICATIONS / DOCUMENTATION
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5128",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of a 'CAD' (Computer-Aided Dispatch) system in modern EMS operations?",
    choices: [
      "It provides patient clinical decision support only",
      "It assists dispatchers in receiving, prioritizing, and tracking calls, as well as recommending and tracking unit assignments and response times",
      "It is used solely for billing purposes",
      "It replaces the need for radio communication entirely",
    ],
    answerIndex: 1,
    explanation:
      "A CAD system assists dispatchers in receiving, prioritizing, and tracking calls, recommending appropriate unit assignments, and recording response time data used for operational analysis. It does not provide clinical decision support to field providers, is not solely for billing, and does not eliminate the need for radio communication.",
  },
  {
    id: "aemt-ops-5129",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why is it important to document the exact time of key clinical events (such as medication administration or a change in patient condition) on the patient care report?",
    choices: [
      "It is only necessary for cardiac arrest calls",
      "Accurate timestamps support continuity of care, allow evaluation of treatment timing, and are important for legal and quality review purposes",
      "It has no bearing on patient care quality",
      "Timestamps are only relevant to dispatch, not patient care documentation",
    ],
    answerIndex: 1,
    explanation:
      "Accurate timestamps for key clinical events support continuity of care as the patient moves through the system, allow evaluation of the timing and appropriateness of interventions, and hold significant legal and quality review value, applicable to all call types, not just cardiac arrests.",
  },
  {
    id: "aemt-ops-5130",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does the 'O' represent in the CHART documentation method sometimes used in EMS?",
    choices: ["Onset", "Objective (physical exam findings)", "Outcome", "Ongoing complaints"],
    answerIndex: 1,
    explanation:
      "CHART stands for Chief complaint, History, Assessment, Rx (treatment), and Transport, with the Assessment component including objective physical exam findings; more specifically, some CHART variants explicitly separate 'Objective' findings. The Objective/exam findings section documents measurable physical exam data, not onset, outcome, or ongoing complaints as separate CHART components.",
  },
  {
    id: "aemt-ops-5131",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT gives a verbal patient handoff report to hospital staff but later realizes they forgot to mention a key medication administered en route. What should the AEMT do?",
    choices: [
      "Do nothing since the written report will eventually be reviewed",
      "Immediately return to inform the receiving staff of the omitted information and ensure it is also clearly documented in the written report",
      "Only mention it if directly asked by hospital staff later",
      "Wait until the next shift to mention it",
    ],
    answerIndex: 1,
    explanation:
      "Realizing an omission in a verbal handoff should prompt the AEMT to immediately inform receiving staff, since this information may be clinically time-sensitive, and ensure it is documented in the written report as well. Waiting for the written report to be reviewed, waiting to be asked, or delaying until the next shift all risk a clinically important delay in the information reaching the treating team.",
  },
  {
    id: "aemt-ops-5132",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following statements about electronic patient care reporting (ePCR) systems is accurate?",
    choices: [
      "ePCR systems eliminate all need for narrative documentation",
      "ePCR systems facilitate structured data collection, can improve legibility, and often support quality improvement and research efforts, but still require thorough, accurate entry by the provider",
      "ePCR data is never reviewed by anyone after submission",
      "ePCR systems are optional and rarely used in modern EMS",
    ],
    answerIndex: 1,
    explanation:
      "ePCR systems support structured data collection, improve legibility over handwritten reports, and facilitate quality improvement and research, but the quality of the record still depends on thorough and accurate provider entry, including narrative sections. ePCR data is commonly reviewed for quality assurance and other purposes, and ePCR systems are now standard in most modern EMS agencies.",
  },
  // ---------------------------------------------------------------------
  // FINAL SET — MIXED TOPICS / SCOPE / OPERATIONS
  // ---------------------------------------------------------------------
  {
    id: "aemt-ops-5133",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "An AEMT is considering initiating IV access on a stable pediatric patient with a minor complaint per general protocol allowance. What should guide this decision?",
    choices: [
      "IV access should be attempted on every patient regardless of clinical need",
      "The decision should be guided by clinical necessity, weighing the benefit of vascular access against the risk and discomfort of an invasive procedure for a stable, minor complaint",
      "IV access is never appropriate for pediatric patients under any circumstances",
      "The AEMT should always defer entirely to parental preference with no clinical assessment",
    ],
    answerIndex: 1,
    explanation:
      "Vascular access decisions should be guided by clinical necessity, weighing the benefit against the risk, discomfort, and psychological impact of an invasive procedure, particularly in a stable pediatric patient with a minor complaint where the benefit may not outweigh the risk. IV access can be appropriate in pediatric patients when clinically indicated, and while parental input is valuable, the decision should be grounded in clinical assessment, not preference alone.",
  },
  {
    id: "aemt-ops-5134",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of a 'fall-back' or 'downgrade' protocol allowing an AEMT to cancel a responding ALS unit after further assessment?",
    choices: [
      "To reduce system resource utilization when further assessment confirms the patient does not require ALS-level intervention beyond AEMT scope",
      "To avoid paying for additional resources",
      "It is never appropriate to cancel a responding unit under any circumstances",
      "To punish paramedics for slow response times",
    ],
    answerIndex: 0,
    explanation:
      "Downgrade or cancellation protocols allow an AEMT, after further assessment, to appropriately cancel a responding higher-level unit when the patient's needs are confirmed to be within the AEMT's own scope, preserving system resources for calls that truly require ALS-level care. This is a legitimate operational practice grounded in patient assessment, not a cost-avoidance or punitive measure, and cancellation should never occur without appropriate assessment confirming it is safe to do so.",
  },
  {
    id: "aemt-ops-5135",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT crew requests ALS intercept for a deteriorating patient, but the paramedic unit is delayed by 15 minutes and the hospital is only 8 minutes away. What is generally the most appropriate decision?",
    choices: [
      "Wait on scene for the delayed ALS unit regardless of transport time to the hospital",
      "Begin transport toward the appropriate facility while continuing to coordinate intercept options en route, since a shorter transport time to definitive care may outweigh waiting for a delayed resource",
      "Cancel all care and wait passively with no further action",
      "Refuse to transport until ALS arrives under any circumstances",
    ],
    answerIndex: 1,
    explanation:
      "When a needed ALS resource is significantly delayed and definitive care is closer via direct transport, initiating transport while continuing to coordinate a possible en route intercept is often the most appropriate strategy, balancing the benefit of ALS intervention against the value of not delaying arrival at definitive care. Rigidly waiting on scene, taking no action, or refusing to transport in a deteriorating patient's best interest are all inappropriate approaches.",
  },
  {
    id: "aemt-ops-5136",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does 'system status management' (SSM) refer to in EMS operations?",
    choices: [
      "A method of dynamically positioning ambulances throughout a coverage area based on predicted call volume and location to optimize response times",
      "A patient monitoring system used in the back of the ambulance",
      "A billing software platform",
      "A system exclusively for tracking controlled substance inventory",
    ],
    answerIndex: 0,
    explanation:
      "System status management is an operational strategy that dynamically positions ambulances throughout a coverage area based on predicted call volume and historical/real-time data, aiming to optimize response times and resource utilization. It is unrelated to patient monitoring equipment, billing software, or controlled substance tracking.",
  },
  {
    id: "aemt-ops-5137",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why might an EMS agency use 'posting' (positioning units at strategic locations rather than at a fixed station) as part of its operational strategy?",
    choices: [
      "To reduce crew comfort intentionally",
      "To reduce response times to anticipated call locations based on historical demand patterns",
      "It has no operational rationale and is purely arbitrary",
      "To avoid vehicle maintenance requirements",
    ],
    answerIndex: 1,
    explanation:
      "Posting units at strategic locations based on historical call demand patterns is intended to reduce response times to anticipated call locations, a core principle of system status management. It is a deliberate operational strategy, not an arbitrary practice, crew discomfort measure, or maintenance avoidance tactic.",
  },
  {
    id: "aemt-ops-5138",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary concern with prolonged, unmitigated shift fatigue among EMS providers?",
    choices: [
      "There is no significant concern; fatigue does not affect performance",
      "Fatigue impairs clinical judgment, reaction time, and increases the risk of errors and accidents, including vehicle collisions",
      "Fatigue only affects administrative tasks, not clinical care",
      "Fatigue is a normal expectation with no mitigation possible",
    ],
    answerIndex: 1,
    explanation:
      "Fatigue impairs clinical judgment, reaction time, and decision-making, increasing the risk of medical errors and vehicle collisions; EMS agencies are increasingly focused on fatigue mitigation strategies (adequate rest periods, shift length limits) to address this well-documented safety concern.",
  },
  {
    id: "aemt-ops-5139",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "An AEMT nearing the end of a 24-hour shift feels significantly fatigued and recognizes their reaction time and concentration are impaired. What is the most appropriate action?",
    choices: [
      "Push through and continue working at full operational tempo without disclosure",
      "Communicate the fatigue to a supervisor per agency policy and take appropriate action (such as a rest break or being relieved) to ensure safe patient care and vehicle operation",
      "Consume large amounts of caffeine and continue as normal with no other action",
      "Quit the job immediately without any communication",
    ],
    answerIndex: 1,
    explanation:
      "Recognizing and communicating fatigue to a supervisor, and taking appropriate action such as a rest break or being relieved per agency fatigue policy, is the safest and most professionally appropriate response, protecting both patient safety and provider safety. Pushing through without disclosure, relying solely on caffeine, or an extreme unrelated response like quitting do not appropriately address the safety concern.",
  },
  {
    id: "aemt-ops-5140",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of controlled substance security and documentation protocols (such as narcotic counts at shift change) in EMS agencies?",
    choices: [
      "To satisfy purely bureaucratic requirements with no real purpose",
      "To prevent diversion, ensure accountability, and comply with legal/regulatory requirements for controlled substances",
      "To track vehicle mileage",
      "To determine crew scheduling",
    ],
    answerIndex: 1,
    explanation:
      "Controlled substance security and documentation protocols, including shift-change counts, exist to prevent diversion, maintain accountability for every dose, and comply with DEA and state regulatory requirements governing controlled substances. They are not related to vehicle mileage tracking or crew scheduling.",
  },
  {
    id: "aemt-ops-5141",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT discovers a discrepancy during a controlled substance count at the start of shift, with one fewer dose of a scheduled medication than documented. What is the correct action?",
    choices: [
      "Ignore the discrepancy and proceed with the shift as normal",
      "Immediately report the discrepancy to a supervisor per agency policy and complete required documentation, without assuming or accusing a specific cause",
      "Quietly adjust the documentation to match the count without reporting it",
      "Confront the previous shift's crew directly and accuse them of theft",
    ],
    answerIndex: 1,
    explanation:
      "A controlled substance discrepancy must be immediately reported to a supervisor per agency policy, with appropriate documentation completed, without the AEMT assuming or making accusations about the cause, since there could be many explanations (documentation error, wastage not properly recorded, etc.) requiring proper investigation. Ignoring it, altering documentation to hide the discrepancy, or making direct accusations are all inappropriate and potentially serious violations.",
  },
  {
    id: "aemt-ops-5142",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the significance of maintaining medication expiration date checks as part of routine EMS operations?",
    choices: [
      "Expired medications may have reduced or unpredictable efficacy and could pose safety risks; regular checks ensure medications administered are effective and safe",
      "Expiration dates on EMS medications are purely a manufacturer formality with no real significance",
      "Only controlled substances require expiration monitoring",
      "Expired medications are always safe to use as long as they look normal",
    ],
    answerIndex: 0,
    explanation:
      "Expired medications may have reduced potency or altered chemical stability, posing safety and efficacy risks; routine expiration checks ensure that medications administered to patients are within their effective and safe use period. This applies to all carried medications, not only controlled substances, and visual appearance alone is not a reliable indicator of medication integrity.",
  },
  {
    id: "aemt-ops-5143",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the purpose of a mutual aid agreement between neighboring EMS agencies?",
    choices: [
      "A pre-arranged agreement allowing agencies to request and provide assistance to one another during incidents that exceed local resource capacity",
      "A requirement that agencies merge into a single organization",
      "An agreement solely concerning employee salary negotiations",
      "A rule preventing any inter-agency cooperation",
    ],
    answerIndex: 0,
    explanation:
      "Mutual aid agreements are pre-arranged formal agreements that allow neighboring agencies to request and provide assistance to one another when an incident exceeds local resource capacity, a critical tool for MCI and disaster response. They do not require agency mergers, are unrelated to salary negotiation, and facilitate rather than prevent cooperation.",
  },
  {
    id: "aemt-ops-5144",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is an Emergency Operations Plan (EOP) at the community/regional level intended to accomplish?",
    choices: [
      "It outlines the coordinated response strategy, roles, and resources for managing large-scale emergencies and disasters within a jurisdiction",
      "It is solely a financial budget document",
      "It applies only to law enforcement agencies",
      "It replaces the need for any agency-specific protocols",
    ],
    answerIndex: 0,
    explanation:
      "An Emergency Operations Plan outlines the coordinated response strategy, roles, responsibilities, and resource allocation for managing large-scale emergencies and disasters within a jurisdiction, involving multiple agencies and disciplines, not law enforcement alone. It is not primarily a budget document and does not replace individual agency protocols, but rather provides the overarching coordination framework.",
  },
  {
    id: "aemt-ops-5145",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "While responding to a routine call, an AEMT notices smoke and flames visible from a nearby residential structure unrelated to the assigned call. What is the most appropriate action?",
    choices: [
      "Ignore it since it is not the assigned call",
      "Notify dispatch of the observed fire so appropriate resources can be sent, while continuing to the assigned call unless directed otherwise",
      "Stop and attempt to fight the fire personally",
      "Abandon the assigned call without any notification to investigate the fire",
    ],
    answerIndex: 1,
    explanation:
      "Observing an unrelated emergency such as a structure fire should be reported to dispatch so appropriate resources can be sent, while the AEMT generally continues to their assigned call unless directed otherwise by dispatch or supervisors. Ignoring the hazard, personally attempting to fight a structure fire without proper training/equipment, or abandoning the assigned call without notification are all inappropriate.",
  },
  {
    id: "aemt-ops-5146",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Under most EMS regulatory frameworks, what is required for an AEMT to maintain active certification/licensure?",
    choices: [
      "No ongoing requirements exist once initial certification is achieved",
      "Completion of continuing education requirements and periodic recertification/renewal per state and national standards",
      "Certification never expires under any system",
      "Only physicians are required to maintain ongoing certification",
    ],
    answerIndex: 1,
    explanation:
      "AEMTs are generally required to complete continuing education and periodically renew/recertify per state EMS regulatory requirements and, where applicable, National Registry standards, to maintain active certification. Certification is not permanent without ongoing requirements, and this obligation applies to AEMTs themselves, not only physicians.",
  },
  {
    id: "aemt-ops-5147",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of skills competency verification/proficiency checks for AEMTs on procedures like IV/IO access?",
    choices: [
      "To satisfy an arbitrary bureaucratic requirement with no clinical purpose",
      "To ensure ongoing proficiency in infrequently performed but critical skills, maintaining patient safety",
      "To determine promotion eligibility only",
      "To reduce the number of certified AEMTs in a system",
    ],
    answerIndex: 1,
    explanation:
      "Skills competency verification ensures AEMTs maintain proficiency in critical but sometimes infrequently performed procedures, which is essential for patient safety, since skill decay can occur without regular practice or verification. It is not primarily a promotion tool or a mechanism to reduce certified personnel.",
  },
  {
    id: "aemt-ops-5148",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "An AEMT realizes mid-call that they are unfamiliar with a specific piece of new equipment issued to their unit. What is the most appropriate action in that moment, if the equipment is not immediately essential to the current patient's care?",
    choices: [
      "Attempt to use the unfamiliar equipment anyway without any review",
      "Use familiar, proven equipment/techniques for the current patient, and seek proper training on the new equipment before its next use",
      "Refuse to treat the patient at all",
      "Ignore the equipment permanently and never learn to use it",
    ],
    answerIndex: 1,
    explanation:
      "If unfamiliar equipment is not immediately essential, using familiar and proven equipment/techniques for the current patient is safer, and the AEMT should seek proper training on the new equipment afterward before it is needed. Attempting unfamiliar equipment without training risks patient harm, while refusing to treat the patient at all or permanently avoiding necessary training are inappropriate responses.",
  },
  {
    id: "aemt-ops-5149",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why is equipment and supply restocking after every call an important operational practice?",
    choices: [
      "It has no real impact on patient care",
      "It ensures the unit is fully prepared with necessary supplies and functioning equipment for the next call, which may be time-critical",
      "It is only necessary once per week",
      "It is solely an inventory control exercise unrelated to patient care",
    ],
    answerIndex: 1,
    explanation:
      "Restocking supplies and verifying equipment function after every call ensures the unit is fully prepared for the next call, which could be time-critical and require immediate access to specific supplies or working equipment; delays or shortages discovered during an emergency response can directly compromise patient care.",
  },
  {
    id: "aemt-ops-5150",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary reason AEMTs should be familiar with their region's specific resource capabilities (such as burn centers, pediatric specialty centers, and poison control)?",
    choices: [
      "It has no bearing on patient outcomes",
      "Knowing regional specialty resource capabilities allows for appropriate destination decisions and resource requests that can significantly affect patient outcomes",
      "It is only relevant for administrative staff, not field providers",
      "Regional resources never vary and are identical everywhere",
    ],
    answerIndex: 1,
    explanation:
      "Familiarity with regional specialty resources (burn centers, pediatric specialty centers, poison control, and others) allows AEMTs to make appropriate destination decisions and resource requests, which can significantly affect patient outcomes, particularly for time-critical or specialized conditions. This knowledge is directly relevant to field providers, and resource availability varies meaningfully by region.",
  },
  {
    id: "aemt-ops-5151",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An AEMT is treating a pediatric patient with an unusual toxic ingestion and is uncertain about the appropriate management approach. What resource should be contacted for guidance?",
    choices: [
      "A family member with no medical training",
      "Poison control, in addition to or per direction from online medical control per local protocol",
      "A random internet search performed on scene",
      "No resource is needed; proceed based on best guess",
    ],
    answerIndex: 1,
    explanation:
      "Poison control centers provide specialized, evidence-based guidance for toxic ingestions and exposures, and contacting them (often in coordination with online medical control per local protocol) is the appropriate resource for uncertain toxicological management. Relying on untrained family members, unverified internet searches, or proceeding on a guess all risk inappropriate or unsafe management.",
  },
  {
    id: "aemt-ops-5152",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the general purpose of interfacility transport (IFT) protocols in EMS operations?",
    choices: [
      "They apply only to 911 emergency responses",
      "They establish guidelines for the safe and appropriate transfer of patients between healthcare facilities, including required equipment, monitoring, and provider level",
      "They are identical in every respect to 911 response protocols with no distinct considerations",
      "They apply only to patients being discharged home",
    ],
    answerIndex: 1,
    explanation:
      "Interfacility transport protocols establish guidelines specific to transferring patients between healthcare facilities, including appropriate required equipment, ongoing monitoring, and the necessary provider level for the patient's acuity, which can differ meaningfully from 911 emergency response protocols. They do not apply to 911 responses exclusively, nor to home discharge transport specifically.",
  },
  {
    id: "aemt-ops-5153",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "An AEMT is asked to perform an interfacility transport of a patient with an infusion pump delivering a medication outside the AEMT's scope to manage or troubleshoot independently. What must be arranged for this transport to proceed safely?",
    choices: [
      "The AEMT should proceed alone and figure out the infusion if problems arise",
      "Appropriate accompanying personnel (such as a nurse or paramedic) qualified to manage the infusion, or confirmation the infusion falls within a scope the transporting crew can safely manage, per protocol",
      "The infusion pump should simply be turned off for the duration of transport",
      "No special arrangement is needed since the pump manages itself automatically",
    ],
    answerIndex: 1,
    explanation:
      "When a patient requires ongoing management of a medication or device outside the transporting AEMT's scope of practice, appropriate accompanying personnel qualified to manage it (or confirmation the specific situation is within an allowable scope per protocol) must be arranged before transport, ensuring patient safety throughout. Proceeding alone without appropriate support, turning off a therapeutic infusion, or assuming a device requires no oversight are all unsafe.",
  },
  {
    id: "aemt-ops-5154",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best represents an appropriate use of an AEMT's professional judgment within their defined scope of practice?",
    choices: [
      "Deciding to perform a paramedic-only skill because the AEMT feels confident in their ability",
      "Selecting an appropriate treatment pathway among several protocol-authorized options based on the specific patient's presentation",
      "Ignoring a written protocol whenever the AEMT personally disagrees with it",
      "Performing any assessment or intervention regardless of training as long as it seems helpful",
    ],
    answerIndex: 1,
    explanation:
      "Appropriate professional judgment operates within the AEMT's defined scope and protocol framework, such as selecting among several protocol-authorized treatment options based on the specific patient presentation. Performing an out-of-scope skill due to personal confidence, disregarding protocols based on personal disagreement, or acting outside training because it 'seems helpful' are all inappropriate and outside legitimate professional judgment.",
  },
  {
    id: "aemt-ops-5155",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of a formal incident action plan (IAP) at a complex, extended-duration incident?",
    choices: [
      "It documents objectives, strategies, tactics, and resource assignments for a defined operational period, ensuring coordinated action",
      "It is a form used only after the incident concludes",
      "It replaces the need for an Incident Commander",
      "It applies only to wildland fire incidents",
    ],
    answerIndex: 0,
    explanation:
      "An incident action plan documents the objectives, strategies, tactics, and resource assignments for a defined operational period, ensuring all responders are working toward coordinated goals during a complex or extended-duration incident. It is developed and used during the incident (not only afterward), does not replace command authority, and applies broadly across incident types, not only wildland fire.",
  },
  {
    id: "aemt-ops-5156",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "During a lengthy MCI, command periodically calls for an 'operational period briefing' to update all responders. What is the primary purpose of this briefing?",
    choices: [
      "To assign new radio call signs to every unit",
      "To communicate updated objectives, safety concerns, and resource status as the incident evolves, keeping all responders coordinated",
      "To conduct performance evaluations of individual responders in real time",
      "To formally end the incident response",
    ],
    answerIndex: 1,
    explanation:
      "Operational period briefings communicate updated objectives, safety concerns, and resource status as an incident evolves, ensuring all responders remain coordinated and informed, particularly important during long or complex incidents where conditions change. They are not for assigning call signs, conducting real-time individual performance evaluations, or formally ending a response.",
  },
  {
    id: "aemt-ops-5157",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of demobilization planning at the conclusion of a large-scale incident?",
    choices: [
      "To ensure resources are released, tracked, and returned to service in an organized and accountable manner",
      "It has no operational purpose and is skipped in most incidents",
      "To immediately release all responders with no accountability process",
      "It applies only to law enforcement resources",
    ],
    answerIndex: 0,
    explanation:
      "Demobilization planning ensures resources are released from an incident, tracked, and returned to service (or their home agency) in an organized, accountable manner, preventing confusion and ensuring proper documentation of the incident's conclusion. It is a genuine ICS function applicable across all response disciplines, not skipped or law enforcement-specific.",
  },
  {
    id: "aemt-ops-5158",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT unit is released from a large-scale incident and instructed to return to service. What should the crew do before considering themselves fully back in service?",
    choices: [
      "Immediately respond to the next dispatched call with no further action",
      "Restock and check all used supplies/equipment, complete required incident documentation, and ensure the unit and crew are ready for normal operations",
      "Take the rest of the shift off without notifying dispatch",
      "Discard any used supplies without restocking",
    ],
    answerIndex: 1,
    explanation:
      "Before returning to full service after a large incident, the crew should restock and check equipment/supplies used, complete required documentation, and confirm readiness for normal operations, ensuring the next call can be handled safely and effectively. Responding immediately without these checks, taking unauthorized time off, or failing to restock all compromise operational readiness.",
  },
  {
    id: "aemt-ops-5159",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why is community paramedicine/mobile integrated healthcare increasingly relevant to modern EMS operations?",
    choices: [
      "It has no relevance to traditional EMS operations",
      "It represents an expanded EMS role focused on preventive care, chronic disease management support, and reducing unnecessary emergency department utilization, often within an expanded scope",
      "It exclusively replaces 911 emergency response",
      "It is limited strictly to billing administration",
    ],
    answerIndex: 1,
    explanation:
      "Community paramedicine/mobile integrated healthcare programs represent an expanding EMS role focused on preventive care, chronic disease management support, follow-up visits, and reducing unnecessary emergency department utilization, often operating under an expanded scope of practice with additional training. It does not replace 911 response but functions alongside it, and is a clinical/operational model, not merely a billing function.",
  },
  {
    id: "aemt-ops-5160",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the general concept behind 'treat and release' or 'treat, no transport' protocols in some EMS systems?",
    choices: [
      "Allowing appropriately trained providers to treat certain low-acuity conditions on scene without transport, under defined protocol criteria",
      "A rule requiring every patient to be transported regardless of condition",
      "A billing avoidance strategy with no clinical basis",
      "A practice used only for deceased patients",
    ],
    answerIndex: 0,
    explanation:
      "Treat-and-release or treat-no-transport protocols allow appropriately trained providers to manage certain defined low-acuity conditions (such as hypoglycemia resolved after treatment, in some systems) on scene without transport, under specific protocol criteria and often requiring careful documentation and patient agreement, rather than mandating transport for every patient. It is a clinically grounded, protocol-driven practice, not a billing avoidance tactic or something applied to deceased patients.",
  },
  {
    id: "aemt-ops-5161",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A diabetic patient's blood glucose is corrected in the field per protocol, and the patient now appears fully alert, oriented, and wishes to refuse transport. Per most 'treat, no transport' protocols, what additional considerations must the AEMT address before honoring this refusal?",
    choices: [
      "None; the patient can simply be left with no further discussion once glucose is corrected",
      "Confirming ongoing decision-making capacity, ensuring a support person or food source is available, providing clear instructions and risk explanation, and thorough documentation per protocol criteria",
      "The AEMT should transport regardless of the specific protocol criteria",
      "Only a verbal refusal is needed with no other steps",
    ],
    answerIndex: 1,
    explanation:
      "Protocols allowing a treat-no-transport pathway after glucose correction typically require confirming the patient has regained full decision-making capacity, ensuring appropriate follow-up support (a person present, access to food), providing clear risk information, and thorough documentation, since hypoglycemia can recur. Simply leaving with no further discussion, transporting regardless of protocol, or relying on verbal refusal alone all fall short of the necessary safeguards.",
  },
  {
    id: "aemt-ops-5162",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of a jurisdictional 'protocol deviation' or 'variance' reporting process?",
    choices: [
      "To document and review instances where care deviated from established protocol, supporting quality improvement and provider accountability",
      "To punish AEMTs automatically for any deviation regardless of clinical justification",
      "It has no real operational purpose",
      "It applies only to dispatch errors, not clinical care",
    ],
    answerIndex: 0,
    explanation:
      "A protocol deviation/variance reporting process documents and reviews instances where clinical care deviated from established protocol, whether due to a clinical judgment call in an unusual situation or an error, supporting quality improvement and appropriate accountability rather than automatic punishment. It applies specifically to clinical care deviations, not dispatch errors.",
  },
  {
    id: "aemt-ops-5163",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "An AEMT deviates from standard protocol during a call because the specific patient presentation did not fit any listed protocol criteria, and the AEMT used sound clinical reasoning to act in the patient's best interest after consulting online medical control. What should follow this call?",
    choices: [
      "No further action is needed since the deviation was justified",
      "Thorough documentation of the rationale, the medical control consultation, and completion of any required protocol deviation report per agency policy",
      "The AEMT should avoid mentioning the deviation in documentation to prevent scrutiny",
      "The call should be reported to law enforcement instead of quality assurance",
    ],
    answerIndex: 1,
    explanation:
      "Even a well-justified protocol deviation, especially one made in consultation with online medical control, should be thoroughly documented with the clinical rationale and any required deviation report completed per agency policy, supporting transparency and quality review. Omitting the deviation from documentation to avoid scrutiny is inappropriate and potentially a documentation integrity violation, and this is a quality assurance matter, not a law enforcement one.",
  },
  {
    id: "aemt-ops-5164",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the concept of 'scope creep' as a risk management concern in EMS?",
    choices: [
      "The gradual, informal expansion of practice beyond an individual's or agency's authorized scope without formal training, protocol authorization, or oversight",
      "A term describing normal, approved expansion of EMS scope through legitimate protocol updates",
      "A billing term unrelated to clinical practice",
      "A term describing appropriate delegation of tasks to a higher-level provider",
    ],
    answerIndex: 0,
    explanation:
      "Scope creep refers to the gradual, informal expansion of practice beyond an individual's or agency's formally authorized scope, occurring without proper training, protocol authorization, or oversight, and represents a significant patient safety and legal risk. This differs from legitimate, formally authorized scope expansion through proper protocol updates and training, which is a distinct, appropriate process.",
  },
  {
    id: "aemt-ops-5165",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "An AEMT notices a colleague routinely performing a skill that is outside both their individual certification level and the agency's approved protocols, seemingly without consequence so far. What is the most appropriate action?",
    choices: [
      "Ignore it since it has not caused a problem yet",
      "Report the concern through appropriate agency channels (such as a supervisor or quality assurance process), since this represents a genuine patient safety and liability risk",
      "Confront the colleague publicly in front of patients",
      "Begin performing the same out-of-scope skill personally since it seems accepted",
    ],
    answerIndex: 1,
    explanation:
      "Recognizing a colleague consistently practicing outside their scope should prompt a report through appropriate agency channels (supervisor, quality assurance), since this represents a genuine ongoing patient safety and legal liability risk, regardless of whether a problem has occurred yet. Ignoring it, confronting the colleague inappropriately in front of patients, or adopting the same unsafe practice are all inappropriate responses.",
  },
  {
    id: "aemt-ops-5166",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the general purpose of a formal 'time out' or safety checklist prior to certain high-risk EMS procedures (such as IO insertion in a critical patient)?",
    choices: [
      "It has no real safety benefit and only slows down care",
      "It provides a brief, structured pause to confirm correct patient, procedure, site, and readiness, reducing the risk of error before a high-risk intervention",
      "It is required only in hospital settings, never prehospital",
      "It replaces the need for proper training",
    ],
    answerIndex: 1,
    explanation:
      "A brief structured 'time out' before a high-risk procedure confirms correct patient, procedure, site, and readiness, which is a recognized patient safety practice that reduces the risk of error, adapted from hospital safety practices into some EMS protocols for high-risk interventions. It provides genuine safety benefit despite the brief pause, and does not replace the need for proper training.",
  },
  {
    id: "aemt-ops-5167",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Why do many EMS agencies implement a formal 'near miss' reporting system, encouraging providers to report close calls that did not result in actual harm?",
    choices: [
      "Near misses are not useful information and should not be tracked",
      "Analyzing near misses helps identify systemic vulnerabilities before they result in actual patient or provider harm, supporting proactive safety improvement",
      "Near miss reports are used exclusively for individual employee discipline",
      "Near miss reporting is required only after a lawsuit has been filed",
    ],
    answerIndex: 1,
    explanation:
      "Near miss reporting systems encourage providers to report close calls that did not result in harm, since analyzing these events helps identify systemic vulnerabilities and supports proactive safety improvements before actual harm occurs, a well-established principle in high-reliability organizations. Effective near miss systems are typically non-punitive to encourage honest reporting, and are used proactively, not only in response to litigation.",
  },
  {
    id: "aemt-ops-5168",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "During a debrief following a challenging call, the AEMT crew identifies that a delay in requesting ALS backup may have affected patient outcome, though no formal rule was violated. What is the most constructive response?",
    choices: [
      "Dismiss the discussion since no rule was technically violated",
      "Openly discuss the decision-making process, identify what led to the delay, and consider what could improve recognition and response time in similar future situations",
      "Assign blame to a single crew member without further analysis",
      "Avoid ever discussing the call again to prevent discomfort",
    ],
    answerIndex: 1,
    explanation:
      "A constructive debrief openly examines the decision-making process and contributing factors, even when no formal rule was violated, to identify opportunities for improved recognition and response in similar future situations, consistent with a systems-based, non-punitive quality improvement culture. Dismissing the discussion, assigning blame without analysis, or avoiding the topic entirely all forfeit valuable learning opportunities.",
  },
  {
    id: "aemt-ops-5169",
    domain: "EMS Operations",
    level: "AEMT",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the overarching goal of integrating operational safety practices (scene safety, vehicle operations, PPE, documentation, and legal compliance) into everyday AEMT practice?",
    choices: [
      "To create unnecessary administrative burden",
      "To protect the safety of providers and patients while ensuring effective, legally sound, and high-quality emergency medical care",
      "To satisfy insurance company requirements exclusively",
      "To reduce the number of calls an AEMT can respond to",
    ],
    answerIndex: 1,
    explanation:
      "The overarching goal of integrating operational safety practices throughout everyday AEMT practice is to protect both provider and patient safety while ensuring effective, legally sound, and high-quality emergency medical care is consistently delivered. This is not merely administrative burden, an insurance-driven exercise, or a means of limiting call volume.",
  },
];
