// ============================================================================
// GENERATED BATCH — Paramedic / EMS Operations
// Original NREMT-aligned practice items. See src/education/questions.js and
// src/education/itemTypes.js for the field reference this batch conforms to.
// ============================================================================

export const BATCH = [
  {
    id:"paramedic-ops-4000",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "Two agencies with overlapping jurisdiction respond to a large apartment fire with multiple trapped occupants. Fire, EMS, and police all have independent statutory authority at the scene. Which incident command structure best fits this situation?",
    choices: [
      "Single command, with the fire chief directing all agencies",
      "Unified command, with incident commanders from each agency jointly setting objectives under one incident action plan",
      "Each agency operates its own separate command post and incident action plan",
      "Command defaults automatically to whichever agency arrived first, regardless of jurisdiction",
    ],
    answerIndex: 1,
    explanation:
      "Unified command allows agencies with overlapping jurisdiction and legal authority to jointly determine objectives, priorities, and strategy while still working from a single incident action plan. Single command under one chief ignores the other agencies' independent authority; separate command posts fragment the response and risk conflicting objectives; and command is not simply assigned to 'first arriving' when multiple agencies have statutory jurisdiction.",
  },
  {
    id:"paramedic-ops-4001",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "In the Incident Command System, which organizational level is used to group several divisions or groups together when a span of control becomes too large for a single Operations Section Chief to manage directly?",
    choices: [
      "Branch",
      "Strike team",
      "Task force",
      "Staging area",
    ],
    answerIndex: 0,
    explanation:
      "A branch sits between the Operations Section Chief and divisions/groups, used specifically to maintain manageable span of control when the number of divisions or groups grows too large. A strike team is a set of similar resources with a leader; a task force is a mix of different resource types with a leader; staging is a location holding resources awaiting assignment, not an organizational level.",
  },
  {
    id:"paramedic-ops-4002",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "In ICS terminology, a 'division' is best described as an organizational unit that supervises resources based on which of the following?",
    choices: [
      "A geographic area of the incident",
      "A specific kind of task, regardless of location",
      "A single specialty resource type only",
      "The chain of command for logistics only",
    ],
    answerIndex: 0,
    explanation:
      "Divisions divide the incident geographically (e.g., Division A on the north side of a building). Groups, by contrast, are organized functionally by task type rather than location. Neither term is restricted to one resource type, and neither is specific to logistics.",
  },
  {
    id:"paramedic-ops-4003",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    itemType: "build_list",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "You are the first paramedic unit on scene at a multi-vehicle crash with several patients and no command established. Place the following initial actions in the correct order.",
    steps: [
      "Perform a scene size-up and establish scene safety",
      "Announce arrival and establish yourself as Incident Commander over radio",
      "Conduct a rapid overview to estimate the number of patients and hazards",
      "Request additional resources based on the scope of the incident",
      "Begin triage or delegate triage to an arriving resource",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "The first arriving unit must first ensure the scene itself is safe to approach, then formally establish command so a clear organizational structure exists, then size up the incident's true scope, request resources that match that scope, and only then move into triage (personally or by delegation) once command and resource requests are underway. Beginning triage before establishing command and requesting adequate resources risks an under-resourced, uncoordinated scene.",
  },
  {
    id:"paramedic-ops-4004",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "As the initial Incident Commander at a growing hazmat incident, you find that you are simultaneously trying to manage tactical operations, talk to the media, and track incoming supplies. What is the most appropriate next action?",
    choices: [
      "Continue managing all functions yourself to avoid confusing the chain of command",
      "Begin delegating command staff and general staff positions (such as Public Information Officer, Operations Section Chief, and Logistics Section Chief) as the incident grows",
      "Transfer command to the next arriving unit regardless of their experience level",
      "Request that dispatch handle media inquiries instead of assigning a Public Information Officer",
    ],
    answerIndex: 1,
    explanation:
      "ICS is designed to expand modularly — as complexity grows, the IC should delegate command staff (like a PIO) and general staff (section chiefs) rather than remain overloaded, which risks errors and delayed decisions. Continuing to do everything alone violates manageable span of control. Command should transfer only when appropriate (e.g., a more qualified or higher-authority officer arrives), not automatically to whoever shows up next. Dispatch is not a substitute for an on-scene PIO who can speak to the specific incident.",
  },
  {
    id:"paramedic-ops-4005",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which ICS position is responsible for ensuring that responder safety practices are followed at an incident, including the authority to stop or prevent unsafe acts?",
    choices: [
      "Safety Officer",
      "Liaison Officer",
      "Logistics Section Chief",
      "Finance/Administration Section Chief",
    ],
    answerIndex: 0,
    explanation:
      "The Safety Officer monitors incident operations and has the authority to stop or prevent unsafe acts. The Liaison Officer serves as the point of contact for assisting/cooperating agencies; the Logistics Chief provides resources, facilities, and services; the Finance/Administration Chief tracks incident costs and administrative needs — none of these carry the Safety Officer's direct safety-authority role.",
  },
  {
    id:"paramedic-ops-4006",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "A 'task force' in ICS terminology refers to which of the following?",
    choices: [
      "A combination of mixed resource types with a common communications capability and a leader",
      "A group of identical resource types operating under a single leader",
      "A temporary holding area for uncommitted resources",
      "The section responsible for incident planning documents",
    ],
    answerIndex: 0,
    explanation:
      "A task force is a combination of mixed resources (e.g., an engine, an ALS ambulance, and a rescue unit) assembled for a particular need, with common communications and a leader. A group of identical resources under one leader is a strike team, not a task force. A holding area for resources is staging, and incident planning documents are produced by the Planning Section.",
  },
  {
    id:"paramedic-ops-4007",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "At a building collapse, the EMS Branch Director reports that the transport rate from the casualty collection point exceeds the number of ambulances currently staged. What is the most appropriate action?",
    choices: [
      "Instruct crews to begin transporting two patients per ambulance regardless of acuity to keep pace",
      "Notify the Operations Section Chief and request additional transport resources through the standard resource-request process",
      "Have the EMS Branch Director personally drive to the hospital to expedite transport",
      "Suspend further triage until more ambulances arrive on scene",
    ],
    answerIndex: 1,
    explanation:
      "Resource shortfalls are addressed by escalating the request through the chain of command (to the Operations Section Chief, who can request additional resources), preserving the ICS resource ordering process. Doubling up patients regardless of acuity risks deterioration of unstable patients during transport; having the Branch Director abandon their supervisory role removes needed oversight; and suspending triage would leave patients unassessed and unprioritized, worsening outcomes.",
  },
  {
    id:"paramedic-ops-4008",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Which term describes the predetermined location where responding resources report and wait for assignment, helping prevent freelancing at a large incident?",
    choices: [
      "Staging area",
      "Casualty collection point",
      "Rehabilitation (rehab) area",
      "Command post",
    ],
    answerIndex: 0,
    explanation:
      "The staging area is where uncommitted resources wait, ready for immediate assignment, which prevents units from self-dispatching into the incident (freelancing). The casualty collection point is where patients are gathered after triage; rehab is where responders recover physiologically during extended operations; the command post is where the Incident Commander and command staff are located.",
  },
  {
    id:"paramedic-ops-4009",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "During a large-scale flooding response involving EMS, fire, public works, and the Red Cross over several days, which document would the Planning Section develop to formally guide operations for each operational period?",
    choices: [
      "The Incident Action Plan (IAP)",
      "The after-action report",
      "The mutual aid agreement",
      "The mass casualty triage tag log",
    ],
    answerIndex: 0,
    explanation:
      "The Incident Action Plan, developed each operational period, states the objectives and strategies for that period and is the core planning tool in ICS. The after-action report is produced after the incident concludes; a mutual aid agreement is a pre-existing legal arrangement between agencies, not an operational-period plan; and a triage tag log tracks individual patients, not overall incident strategy.",
  },
  {
    id:"paramedic-ops-4010",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of establishing 'unity of command' within ICS?",
    choices: [
      "Every individual reports to only one designated supervisor, avoiding conflicting instructions",
      "Only one agency may participate in the incident response",
      "Only the Incident Commander may communicate by radio",
      "All resources must be dispatched from a single 911 center",
    ],
    answerIndex: 0,
    explanation:
      "Unity of command means each person answers to only one supervisor, which prevents conflicting orders and confusion. It does not restrict participation to a single agency (multiple agencies routinely operate together under ICS), does not limit radio use to the IC alone, and has nothing to do with which dispatch center resources originate from.",
  },
  {
    id:"paramedic-ops-4011",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A paramedic supervisor arriving at a bus crash with 22 patients finds an EMT already triaging without having established command or requested a mass-casualty response. What should the supervisor do first?",
    choices: [
      "Take over triage from the EMT immediately without comment",
      "Establish command, confirm resource requests match the incident's true scope, and allow triage to continue while integrating it into the command structure",
      "Order all units already en route to stage several miles away until a full command structure is built",
      "Wait for a chief officer to arrive before taking any action",
    ],
    answerIndex: 1,
    explanation:
      "The priority is to formalize command and validate that the resource request reflects 22 patients, then fold the EMT's ongoing triage into the structure rather than stopping it — triage that is already underway should continue since it directly benefits patients. Silently taking over triage abandons the command function that's actually missing; staging units unnecessarily far away delays care; and waiting passively for a higher-ranking officer delays essential actions the on-scene supervisor is qualified to take now.",
  },
  {
    id:"paramedic-ops-4012",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "In ICS, which section is responsible for obtaining, tracking, and providing personnel, equipment, supplies, and facilities needed to support incident operations?",
    choices: [
      "Logistics Section",
      "Operations Section",
      "Planning Section",
      "Finance/Administration Section",
    ],
    answerIndex: 0,
    explanation:
      "Logistics provides the resources and services (supplies, facilities, communications, medical support for responders) that sustain the operation. Operations carries out the tactical work itself; Planning collects and analyzes information to build the incident action plan; Finance/Administration tracks costs, procurement documentation, and compensation/claims.",
  },
  {
    id:"paramedic-ops-4013",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "At a prolonged wildland-urban interface fire, EMS crews have been operating for over 10 hours. Which ICS function should the EMS Branch Director coordinate with to ensure responders receive rehydration, rest, and medical monitoring?",
    choices: [
      "Rehabilitation (rehab) operations under Logistics/Medical",
      "The Finance/Administration Section",
      "The Public Information Officer",
      "The Liaison Officer",
    ],
    answerIndex: 0,
    explanation:
      "Rehab is specifically tasked with responder rest, rehydration, nutrition, and medical monitoring during extended operations, typically coordinated through logistics/medical support. Finance/Administration handles cost tracking, the PIO manages public and media messaging, and the Liaison Officer coordinates with outside agencies — none manage responder physiological recovery.",
  },
  {
    id:"paramedic-ops-4014",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the concept of 'manageable span of control' in ICS?",
    choices: [
      "One supervisor should oversee a limited number of subordinates, typically in the range of three to seven",
      "Every unit must be supervised directly by the Incident Commander",
      "Span of control refers only to the geographic size of the incident",
      "Span of control applies only to law enforcement resources",
    ],
    answerIndex: 0,
    explanation:
      "Manageable span of control keeps a supervisor's number of direct reports within an effective range (commonly cited as roughly three to seven, with five as an optimal target), preserving effective oversight. It does not require the IC to supervise every unit directly (that's what the organizational structure of sections/branches/divisions is for), it is unrelated to geographic size specifically, and it applies to every discipline, not just law enforcement.",
  },
  {
    id:"paramedic-ops-4015",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A regional EMS system, a hospital system, and a county emergency management agency all want to jointly manage a widespread severe weather event affecting multiple towns over several days. Which command-level structure is best suited to coordinate resource priorities across these jurisdictions without directly managing tactical operations at each individual scene?",
    choices: [
      "An Area Command",
      "A single Division Supervisor",
      "A Strike Team leader",
      "A Task Force leader",
    ],
    answerIndex: 0,
    explanation:
      "Area Command is used to oversee the management of multiple incidents that are each being handled by a separate ICS organization, or to oversee the management of a very large incident with multiple IC teams — it sets overall strategy and resource priorities without directly managing tactics at each site. A Division Supervisor, Strike Team leader, Task Force leader, and Staging Area Manager are all tactical-level positions embedded within a single incident's ICS structure, not multi-incident coordination roles.",
  },
  {
    id:"paramedic-ops-4016",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the purpose of a 'common terminology' requirement within the National Incident Management System (NIMS)?",
    choices: [
      "To ensure responders from different agencies use the same terms for resources, positions, and facilities so communication is not confused by agency-specific jargon",
      "To require that every responder speak a single designated language",
      "To limit radio traffic to only pre-scripted phrases",
      "To standardize patient care protocols across every agency nationwide",
    ],
    answerIndex: 0,
    explanation:
      "Common terminology prevents the confusion that arises when different agencies use different names for the same resource, position, or facility, which is critical when multiple agencies converge on an incident. It is not about spoken language, does not restrict radio traffic to scripted phrases, and does not standardize clinical treatment protocols (which remain locally determined).",
  },
  {
    id:"paramedic-ops-4017",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "You are assigned as a Division Supervisor at a large-scale incident. A crew in your division reports to you that they are being told to perform a task by a chief officer from another division who has no supervisory role over your division. What is the correct action?",
    choices: [
      "Have the crew comply since any chief officer outranks a line crew member",
      "Remind the crew that they should follow the chain of command and direct the outside officer's request through you or the appropriate channel, preserving unity of command",
      "Report the chief officer's conduct to the media",
      "Instruct the crew to ignore all future orders from any chief officer",
    ],
    answerIndex: 1,
    explanation:
      "Unity of command means personnel take direction from their assigned supervisor; a request from someone outside that chain, even a higher-ranking officer, should be routed through the proper channel (in this case, through the Division Supervisor) rather than followed directly, to avoid conflicting or duplicated orders. Blind compliance based on rank alone undermines the ICS structure; involving the media is irrelevant and inappropriate; and blanket refusal of all future orders is an overcorrection that isn't warranted by a single incident.",
  },
  {
    id:"paramedic-ops-4018",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following is a defining feature of the modular organization principle in ICS?",
    choices: [
      "The ICS structure expands or contracts based on the size and complexity of the incident",
      "Every incident must use every ICS position from the start, regardless of size",
      "The organizational structure is fixed and cannot change once established",
      "Only fire agencies may expand the ICS structure",
    ],
    answerIndex: 0,
    explanation:
      "Modular organization means ICS builds out only the positions actually needed, expanding as complexity grows and contracting as an incident winds down. It does not require filling every position for a small incident, the structure is explicitly meant to be flexible rather than fixed, and any agency with jurisdiction, not only fire, can expand the organization.",
  },
  {
    id:"paramedic-ops-4019",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    itemType: "multiple_response",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "Which of the following situations appropriately call for transitioning from single command to unified command? (Select 3.)",
    choices: [
      "A structure fire with trapped occupants where fire, EMS, and law enforcement each have independent legal authority and responsibility",
      "A hazardous materials release affecting a state highway, requiring fire/hazmat, EMS, and the department of transportation to jointly set objectives",
      "A single-patient diabetic emergency handled entirely by one ambulance crew",
      "A cross-jurisdictional wildfire burning across two counties with separate fire agencies each having authority in their own county",
      "A routine interfacility transfer of a stable patient between two hospitals",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "Unified command is appropriate when multiple agencies or jurisdictions with independent legal authority must jointly manage a single incident — as with a multi-agency structure fire, a multi-agency hazmat release on a roadway, or a wildfire spanning two counties' jurisdictions. A single-crew diabetic call and a routine interfacility transfer involve only one agency/unit and do not require any command structure beyond normal operations.",
  },
  {
    id:"paramedic-ops-4020",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "During a multi-casualty incident using the START triage system, which patient should be tagged Immediate (Red)?",
    choices: [
      "A patient who is walking and following commands with a minor laceration",
      "A patient with a respiratory rate of 34/min after airway repositioning",
      "A patient who is not breathing even after repositioning the airway, with no pulse",
      "A patient with a capillary refill under 2 seconds and a respiratory rate of 18/min who can follow simple commands",
    ],
    answerIndex: 1,
    explanation:
      "In START, a respiratory rate over 30/min automatically places a patient in the Immediate category. The walking patient is Minor (Green); a patient with normal perfusion, adequate respirations, and the ability to follow commands is Delayed (Yellow); a patient who remains apneic after repositioning the airway with no pulse is tagged Deceased/Expectant (Black), not Immediate.",
  },
  {
    id:"paramedic-ops-4021",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    itemType: "build_list",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "Place the following START triage assessment steps in the correct order for a non-ambulatory patient.",
    steps: [
      "Assess respirations; if absent, reposition the airway once",
      "If breathing is present, assess the respiratory rate",
      "If respirations are under 30/min, assess perfusion (radial pulse or capillary refill)",
      "If perfusion is adequate, assess mental status by giving a simple command",
      "Assign the triage category based on the worst abnormal finding identified",
    ],
    correctOrder: [0, 1, 2, 3, 4],
    explanation:
      "START proceeds systematically: check breathing first (repositioning the airway once if absent), then respiratory rate if breathing is present, then perfusion if the rate is under 30/min, then mental status if perfusion is adequate, tagging the patient Immediate as soon as any one parameter fails and otherwise continuing down the sequence to determine Delayed versus Minor.",
  },
  {
    id:"paramedic-ops-4022",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "Using the SALT triage system, a patient who is not breathing has their airway repositioned and remains apneic with no palpable pulse. What is the correct SALT category?",
    choices: [
      "Immediate",
      "Expectant",
      "Delayed",
      "Minimal",
    ],
    answerIndex: 1,
    explanation:
      "In SALT, a patient who remains apneic after airway positioning and has no pulse is categorized Expectant (or Dead, per some protocol variants), reflecting that resuscitation is not attempted in a resource-limited mass casualty setting. Immediate is for salvageable patients with life-threatening but treatable problems; Delayed is for patients whose treatment can wait; Minimal describes ambulatory, minor-injury patients.",
  },
  {
    id:"paramedic-ops-4023",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Which feature distinguishes the SALT triage method from the START method as a first step?",
    choices: [
      "SALT begins with a global sorting step in which responders direct patients to walk, wave, or are individually assessed if they cannot do either",
      "SALT does not assess respirations at any point",
      "SALT only applies to pediatric patients",
      "SALT eliminates the Expectant/Deceased category entirely",
    ],
    answerIndex: 0,
    explanation:
      "SALT begins with global sorting: patients are asked to walk to a safe area (likely Minimal), then to wave or make purposeful movement (assessed next), with those unable to do either assessed individually first because they are the most likely to be critically injured. SALT does assess respirations during individual assessment, it applies across all ages, and it retains an Expectant category for patients unlikely to survive given available resources.",
  },
  {
    id:"paramedic-ops-4024",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    itemType: "drag_drop",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "Using START triage principles, place each patient finding into the correct triage category.",
    categories: [
      { id: "immediate", label: "Immediate (Red)" },
      { id: "delayed", label: "Delayed (Yellow)" },
      { id: "minor", label: "Minor (Green)" },
      { id: "deceased", label: "Deceased/Expectant (Black)" },
    ],
    items: [
      { id: "item1", label: "Walking, alert, minor abrasions on forearm", correctCategory: "minor" },
      { id: "item2", label: "Respiratory rate 36/min, radial pulse present", correctCategory: "immediate" },
      { id: "item3", label: "Apneic despite airway repositioning, no pulse", correctCategory: "deceased" },
      { id: "item4", label: "Respiratory rate 20/min, capillary refill 2 seconds, follows commands, cannot walk due to a fractured femur", correctCategory: "delayed" },
      { id: "item5", label: "No spontaneous respirations, but breathing resumes after one airway repositioning", correctCategory: "immediate" },
    ],
    explanation:
      "A walking patient with minor injuries is Minor. A respiratory rate above 30/min is automatically Immediate. A patient who remains apneic after one airway reposition with no pulse is Deceased/Expectant. A non-ambulatory patient with normal respiratory rate, adequate perfusion, and intact mental status (here, limited only by an isolated fracture preventing walking) is Delayed. A patient who resumes breathing after airway repositioning is Immediate because they required an intervention to breathe.",
  },
  {
    id:"paramedic-ops-4025",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "At a mass casualty incident, the Triage Officer identifies 8 Immediate, 15 Delayed, and 20 Minor patients, with only 4 ALS-capable ambulances currently on scene. What is the most appropriate allocation strategy for these initial ALS resources?",
    choices: [
      "Assign all 4 ALS units to transport Minor patients first since they are the quickest to load and clear",
      "Assign ALS units to transport the most critical Immediate patients first, while BLS units and other available resources are used for ongoing treatment and Delayed/Minor transport",
      "Hold all ALS units in staging until every patient has been triaged, regardless of the Immediate patients' status",
      "Split ALS units evenly across all three triage categories regardless of clinical need",
    ],
    answerIndex: 1,
    explanation:
      "The core principle of MCI resource allocation is doing the greatest good for the greatest number — ALS resources, the highest level of care, should be matched to the patients with the most time-sensitive, life-threatening needs (Immediate), while BLS and other resources manage lower-acuity patients. Sending scarce ALS assets to Minor patients first, holding them back entirely while critical patients wait, or splitting them evenly without regard to acuity all fail to prioritize resources according to need.",
  },
  {
    id:"paramedic-ops-4026",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A paramedic serving as Transport Officer at an MCI is contacted by online medical direction, who asks for a full clinical report on every patient before authorizing any transport. Transport is being significantly delayed as a result. What is the most appropriate next step?",
    choices: [
      "Continue providing detailed reports on each patient as requested, even though it delays transport",
      "Politely explain that MCI destination and load decisions are being made using the established MCI plan and triage categories, and request that detailed reporting be deferred until patients are en route or arrived",
      "Stop communicating with medical direction entirely for the remainder of the incident",
      "Transport all patients to a single hospital to simplify communication",
    ],
    answerIndex: 1,
    explanation:
      "MCI operations rely on a predetermined mass casualty plan that distributes patients by triage category and hospital capacity rather than individual real-time physician sign-off for each patient, since that approach does not scale and delays care system-wide; the Transport Officer should clarify this and keep transport moving while remaining appropriately available to medical direction. Complying with delaying detailed reports harms the whole incident; cutting off communication with medical direction entirely is inappropriate; and sending every patient to one hospital overwhelms that facility and violates load-balancing principles.",
  },
  {
    id:"paramedic-ops-4027",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of a 'medical branch director' or 'EMS Branch Director' role at a large MCI?",
    choices: [
      "To oversee all EMS-specific functions (triage, treatment, transport, staging of medical resources) under the Operations Section",
      "To serve as the sole point of contact for media inquiries",
      "To manage the incident's financial reimbursement claims",
      "To directly perform hands-on patient care for every casualty",
    ],
    answerIndex: 0,
    explanation:
      "The EMS/Medical Branch Director organizes and oversees the medical-specific functions of a large incident (often further divided into Triage, Treatment, and Transport groups) within the Operations Section. Media relations belong to the Public Information Officer, financial claims belong to Finance/Administration, and the Branch Director's role is supervisory/coordinating rather than hands-on patient care for every casualty.",
  },
  {
    id:"paramedic-ops-4028",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "During an MCI after-action review, the team notes that several Immediate patients were transported to the same trauma center, exceeding its surge capacity, while a comparable facility 10 minutes further away received almost no patients. Which function most likely failed during the incident?",
    choices: [
      "Triage",
      "Load balancing / hospital notification and destination coordination by the Transport Officer or Medical Communications",
      "Scene safety assessment",
      "Personal protective equipment selection",
    ],
    answerIndex: 1,
    explanation:
      "Distributing patients evenly across available receiving facilities according to their real-time capacity is the job of the Transport Officer working with medical communications/hospital coordination — a failure here produces exactly this pattern of one hospital being overwhelmed while another is underused. Triage failure would show as misclassified acuity, not maldistribution; scene safety and PPE selection are unrelated to how patients were distributed among hospitals.",
  },
  {
    id:"paramedic-ops-4029",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "At a train derailment MCI, a paramedic re-triaging patients at the treatment area finds a previously Delayed (Yellow) patient now has labored breathing and a respiratory rate of 32/min. What is the most appropriate action?",
    choices: [
      "Leave the patient's original tag in place since re-triage is unnecessary once a tag is assigned",
      "Upgrade the patient's triage category to Immediate and communicate the change to the Transport Officer",
      "Downgrade the patient because they have already received some care",
      "Discharge the patient from the treatment area to make room for others",
    ],
    answerIndex: 1,
    explanation:
      "Triage is a continuous, dynamic process; a patient who deteriorates must be re-categorized to reflect their current status (here, meeting Immediate criteria by respiratory rate) and that change must be communicated so transport priority is updated. Leaving an outdated tag in place risks a fatal delay, downgrading a deteriorating patient based on having 'received care' is not a valid triage principle, and discharging a deteriorating patient is unsafe.",
  },
  {
    id:"paramedic-ops-4030",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which statement about the 'Expectant' or 'Deceased' triage category in a resource-limited mass casualty incident is correct?",
    choices: [
      "It is used for patients whose injuries are so severe that survival is unlikely given available resources, so care is redirected to patients more likely to benefit",
      "It is used only for patients who are already clinically dead with rigor mortis",
      "It means the patient will never receive any care for the remainder of the incident regardless of resource availability",
      "It is assigned only by a physician on scene, never by a paramedic",
    ],
    answerIndex: 0,
    explanation:
      "Expectant reflects a resource-allocation decision under scarcity: given the severity of injury and the resources available, effort is redirected toward patients more likely to survive — it is not the same as being already deceased, and as more resources become available these patients may be re-triaged and treated. Paramedics, not only physicians, routinely make and apply these triage determinations under an MCI plan.",
  },
  {
    id:"paramedic-ops-4031",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "In hazardous materials operations, which zone is designated as the area where actual contamination or the greatest hazard exists, requiring the highest level of PPE for entry?",
    choices: [
      "Hot zone (exclusion zone)",
      "Warm zone (contamination reduction zone)",
      "Cold zone (support zone)",
      "Staging zone",
    ],
    answerIndex: 0,
    explanation:
      "The hot zone is the area of highest contamination/hazard, restricted to properly trained and equipped personnel wearing the appropriate level of PPE. The warm zone is where decontamination occurs and is a lower-hazard transition area; the cold zone is the clean support area where command posts and treatment areas are typically located; 'staging zone' is not a standard hazmat zone designation.",
  },
  {
    id:"paramedic-ops-4032",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "At a hazmat incident, where should EMS typically establish patient treatment areas and provide definitive medical care?",
    choices: [
      "In the cold zone, after patients have been decontaminated",
      "In the hot zone, to minimize transport time for critical patients",
      "In the warm zone, before decontamination begins",
      "Anywhere convenient, since contamination status does not affect where care is given",
    ],
    answerIndex: 0,
    explanation:
      "EMS providers without hazmat entry-level training and PPE should not enter the hot or warm zones; treatment is provided in the cold zone after patients have passed through decontamination in the warm zone, protecting both providers and receiving facilities from secondary contamination. Providing care in the hot or warm zone risks provider exposure and cross-contamination, and contamination status is directly relevant to where and how care can safely be delivered.",
  },
  {
    id:"paramedic-ops-4033",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Which level of personal protective equipment (per OSHA/EPA classification) provides the highest level of respiratory and skin protection, including a fully encapsulating, vapor-tight suit with a self-contained breathing apparatus worn inside the suit?",
    choices: [
      "Level A",
      "Level B",
      "Level C",
      "Level D",
    ],
    answerIndex: 0,
    explanation:
      "Level A provides the greatest protection, used when the highest level of respiratory and skin protection is needed — a fully encapsulating, vapor-tight suit with SCBA worn inside. Level B has a lower skin-protection standard than Level A but the same respiratory protection (SCBA). Level C uses an air-purifying respirator instead of SCBA, and Level D is essentially a standard work uniform offering minimal chemical protection.",
  },
  {
    id:"paramedic-ops-4034",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "EMS is dispatched to a chemical plant for reported dizziness in several workers, with an unidentified odor still present. No hazmat team has yet arrived. What is the most appropriate initial action?",
    choices: [
      "Enter the building in standard uniform to begin patient assessment immediately",
      "Stage a safe distance upwind and uphill, avoid entry, and request a hazmat response while gathering information on the substance involved",
      "Send one paramedic in alone to make contact while the rest of the crew stays outside",
      "Wait exactly 10 minutes before making any decision about scene approach",
    ],
    answerIndex: 1,
    explanation:
      "Without identification of the hazard and without proper PPE or hazmat-trained personnel, EMS should stage at a safe distance (upwind/uphill when possible), avoid entry, and request the appropriate specialized response while trying to identify the substance (placards, SDS, witness reports) — entering without that information risks becoming additional victims. Sending anyone in, even briefly or alone, in standard uniform is unsafe, and there is no fixed universal waiting period; the decision is driven by hazard information and resource arrival, not the clock alone.",
  },
  {
    id:"paramedic-ops-4035",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of gross decontamination for a hazmat patient prior to EMS treatment?",
    choices: [
      "To rapidly remove the bulk of the contaminant from the patient's skin/clothing to reduce ongoing exposure and secondary contamination risk",
      "To fully sterilize the patient before any assessment can begin",
      "To replace the need for any further medical treatment",
      "To identify the specific chemical agent involved through visual inspection",
    ],
    answerIndex: 0,
    explanation:
      "Gross decontamination (typically removing contaminated clothing and a bulk water rinse) aims to quickly reduce the contaminant load on the patient, limiting continued absorption/exposure and the risk of contaminating responders and equipment downstream. It is not sterilization, it does not replace subsequent medical treatment (which still follows), and it does not identify the chemical — identification comes from other sources like placards, SDS sheets, or hazmat technicians.",
  },
  {
    id:"paramedic-ops-4036",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A patient exposed to an unknown industrial vapor has undergone decontamination and is now in the cold zone. He remains hypoxic and tachypneic. Which action reflects correct EMS operational practice?",
    choices: [
      "Treat and transport the patient as a standard respiratory emergency now that decontamination is complete, notifying the receiving hospital of the exposure",
      "Refuse to treat the patient until the exact chemical name is confirmed",
      "Return the patient to the warm zone for further decontamination before any treatment",
      "Transport the patient without notifying the receiving hospital to avoid causing alarm",
    ],
    answerIndex: 0,
    explanation:
      "Once effective decontamination has occurred, the patient can be treated using standard EMS assessment and treatment principles for the presenting problem, and the receiving hospital should be notified of the chemical exposure so they can prepare appropriately (including their own decon capability if needed). Withholding treatment pending exact chemical identification can be fatal in a time-sensitive presentation; sending a decontaminated patient back to the warm zone is unnecessary and exposes them to contamination again; and withholding exposure information from the hospital compromises their ability to protect staff and prepare care.",
  },
  {
    id:"paramedic-ops-4037",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: false,
    question:
      "Which resource would provide the most reliable initial information about the specific chemical hazards, health effects, and recommended PPE for a placarded hazardous material at a transportation incident?",
    choices: [
      "The Emergency Response Guidebook (ERG), cross-referenced with the placard or shipping papers",
      "Asking a bystander to describe the smell",
      "Estimating the hazard based on the color of the container alone",
      "Calling the patient's primary care physician",
    ],
    answerIndex: 0,
    explanation:
      "The Emergency Response Guidebook, used with the UN/DOT placard number or shipping papers, gives responders an initial hazard identification, isolation distances, and protective action guidance. A bystander's description of an odor is unreliable and potentially dangerous to rely on, container color alone is not a validated hazard indicator, and a patient's physician has no role in identifying an industrial or transportation chemical hazard.",
  },
  {
    id:"paramedic-ops-4038",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "During a cardiac arrest resuscitation with a full crew present, the code appears disorganized: multiple people are calling out conflicting instructions and compressions are frequently paused. Which crew resource management (CRM) principle would most directly address this problem?",
    choices: [
      "Establishing a single clear team leader who assigns roles and closes the communication loop",
      "Adding more personnel to the room to increase the number of hands available",
      "Switching to a completely silent resuscitation with no verbal communication",
      "Rotating the team leader role every two minutes to distribute responsibility",
    ],
    answerIndex: 0,
    explanation:
      "A defined team leader who assigns specific roles, gives clear directed communication, and confirms orders were received (closed-loop communication) is a core CRM principle that resolves exactly this kind of chaotic, conflicting-instruction scenario. Simply adding more people without structure often worsens chaos; eliminating verbal communication entirely removes necessary coordination; and rotating leadership every two minutes undermines the continuity and situational awareness a leader needs to run an effective resuscitation.",
  },
  {
    id:"paramedic-ops-4039",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "During a pediatric resuscitation, a newer EMT calculates a medication dose that seems unusually high compared to the paramedic's mental estimate. Under a crew resource management approach, what should the EMT do?",
    choices: [
      "Say nothing, assuming the paramedic already checked the math",
      "Speak up and voice the concern directly to the team leader using a clear, respectful statement, even though they are junior in experience",
      "Administer the dose as calculated without comment to avoid disrupting the resuscitation",
      "Wait until after the call to mention the discrepancy during the debrief",
    ],
    answerIndex: 1,
    explanation:
      "CRM specifically encourages graded assertiveness — every team member, regardless of rank or experience, is expected to voice safety concerns in real time, because catching an error before it reaches the patient is the entire point of a flattened communication hierarchy. Staying silent, administering an unverified high dose, or waiting until after the call to mention a live medication safety concern all allow a potentially serious error to reach the patient.",
  },
  {
    id:"paramedic-ops-4040",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does 'closed-loop communication' refer to in the context of crew resource management during a resuscitation?",
    choices: [
      "The person receiving an order repeats it back, and the person giving the order confirms it was understood correctly",
      "Only the team leader is permitted to speak during the resuscitation",
      "Communication that occurs exclusively through written notes",
      "A debrief held only after the incident, with no communication during the event",
    ],
    answerIndex: 0,
    explanation:
      "Closed-loop communication is the practice of the receiver repeating back an order so the sender can confirm it was heard and understood correctly, reducing the risk of missed or misunderstood instructions during high-stress care. It does not restrict speech to the leader alone, it is not conducted through written notes during a live resuscitation, and it happens in real time, not only afterward.",
  },
  {
    id:"paramedic-ops-4041",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A paramedic team leader running a difficult resuscitation begins to fixate on a single failed IV attempt, repeatedly trying the same site while other tasks (airway management, compressions) go unmonitored. This describes which human factors phenomenon?",
    choices: [
      "Cognitive tunneling (fixation error)",
      "Graded assertiveness",
      "Situational awareness",
      "Closed-loop communication",
    ],
    answerIndex: 0,
    explanation:
      "Cognitive tunneling, or fixation error, occurs when a provider becomes so focused on one task or problem that they lose awareness of everything else happening around them — exactly what's described here. Graded assertiveness is the practice of appropriately escalating a safety concern; situational awareness is the (here, lost) broader perception of what's happening; closed-loop communication is a verification technique for orders, not the phenomenon being described.",
  },
  {
    id:"paramedic-ops-4042",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "As team leader during a cardiac arrest, you notice you are becoming fixated on IV access and losing track of the compression/ventilation cycle. What is the best immediate corrective action?",
    choices: [
      "Step back mentally, delegate the IV attempt to another qualified provider, and refocus on overall resuscitation oversight",
      "Continue the IV attempt personally since interrupting it wastes time already invested",
      "Stop the resuscitation entirely until you regain focus",
      "Hand full leadership of the code to the newest team member without explanation",
    ],
    answerIndex: 0,
    explanation:
      "Recognizing fixation in oneself and deliberately stepping back to delegate the narrow task while resuming a broader oversight role is a core CRM self-monitoring skill that restores situational awareness. Continuing to personally chase a difficult IV worsens the tunneling; stopping the resuscitation entirely is unnecessary and harmful; and abruptly handing leadership to the least experienced member without explanation creates confusion rather than resolving it.",
  },
  {
    id:"paramedic-ops-4043",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'situational awareness' as used in crew resource management?",
    choices: [
      "The ongoing perception of what is happening around you, understanding what it means, and anticipating what may happen next",
      "The ability to recite protocols from memory without error",
      "Physical fitness sufficient to perform prolonged CPR",
      "Knowledge of a single patient's past medical history only",
    ],
    answerIndex: 0,
    explanation:
      "Situational awareness is the perception of elements in the environment, comprehension of their meaning, and projection of their status into the near future — essential for anticipating problems before they escalate. It is distinct from rote protocol memorization, physical endurance for CPR, and knowledge limited to one patient's history.",
  },
  {
    id:"paramedic-ops-4044",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    itemType: "multiple_response",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "Which of the following are recognized crew resource management strategies that improve team performance during a high-stress resuscitation? (Select 3.)",
    choices: [
      "Assigning clear individual roles before or at the start of the resuscitation",
      "Using closed-loop communication to confirm orders",
      "Encouraging every team member to voice safety concerns regardless of rank",
      "Discouraging questions from junior crew members during the code",
      "Allowing multiple people to give simultaneous, unrelated instructions",
    ],
    correctIndices: [0, 1, 2],
    explanation:
      "Effective CRM relies on clear role assignment, closed-loop communication, and a flattened hierarchy where any team member can speak up about a safety concern. Discouraging junior members from asking questions suppresses exactly the kind of error-catching CRM is designed to enable, and allowing simultaneous conflicting instructions creates the chaotic communication pattern CRM is meant to prevent.",
  },
  {
    id:"paramedic-ops-4045",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "After a difficult pediatric resuscitation that ended in death, the crew is visibly shaken but says nothing to each other before responding to the next call. Which action best reflects sound CRM/human factors practice for the department?",
    choices: [
      "Conduct a brief, structured post-event debrief addressing both clinical performance and the emotional impact on the crew before they resume full duty",
      "Assign the crew to the next call immediately with no discussion, since debriefing wastes valuable response time",
      "Require the crew to write a formal incident report and consider the matter closed",
      "Reassign only the paramedic, since the EMT's presence during the code is not clinically relevant",
    ],
    answerIndex: 0,
    explanation:
      "A structured debrief addressing both the clinical/operational aspects and the human impact of a difficult call helps identify improvement opportunities and supports crew wellbeing, and is a recognized best practice after high-stress events, especially pediatric deaths. Immediately returning to service with no acknowledgment risks both missed learning opportunities and unaddressed psychological impact; a written report alone does not substitute for a team debrief; and the EMT was an active participant in the resuscitation and their perspective and wellbeing matter as much as the paramedic's.",
  },
  {
    id:"paramedic-ops-4046",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Under most EMS legal frameworks, which of the following best describes the relationship between a paramedic and their medical director regarding standing orders?",
    choices: [
      "Standing orders are pre-authorized treatments the paramedic may perform without contacting a physician in real time, but they still originate from and are governed by the medical director's authority",
      "Standing orders allow a paramedic to perform any procedure they personally believe is indicated, without any protocol basis",
      "Standing orders require the paramedic to call online medical control before performing any of them",
      "Standing orders apply only to controlled substances",
    ],
    answerIndex: 0,
    explanation:
      "Standing orders are protocols pre-approved by the medical director that a paramedic may carry out without real-time physician contact, but they remain an extension of the medical director's delegated authority, not an independent scope the paramedic defines. They do not require a call for every use (that's the defining feature versus online orders), and they are not limited to controlled substances.",
  },
  {
    id:"paramedic-ops-4047",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A paramedic believes a patient needs a medication that falls outside current protocol and outside the paramedic's standing orders. What is the appropriate action?",
    choices: [
      "Administer the medication anyway since the paramedic's clinical judgment should override protocol in an emergency",
      "Contact online medical control to request explicit authorization before administering the medication",
      "Withhold all treatment until the patient can be seen by a physician in the emergency department",
      "Ask a bystander with medical training to authorize the treatment instead",
    ],
    answerIndex: 1,
    explanation:
      "When a needed intervention falls outside standing orders, the correct path is to contact online medical control and obtain explicit physician authorization — this preserves both patient safety and the legal framework under which paramedics practice. Administering it unilaterally is a protocol deviation that exposes the patient and provider to unnecessary risk; withholding all treatment pending ED arrival may harm the patient when other indicated care remains available; and a bystander, even one with medical training, has no authority to authorize EMS treatment.",
  },
  {
    id:"paramedic-ops-4048",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "A paramedic deviates from protocol during a call because contacting medical control was not possible (radio failure) and the patient was rapidly deteriorating. Which statement about this situation is most accurate?",
    choices: [
      "The deviation is automatically illegal and cannot be justified under any circumstances",
      "Deviation may be justifiable when contact is genuinely impossible and delay would harm the patient, but it should be clearly documented with the rationale and reported per agency policy",
      "The paramedic should have refused to treat the patient at all rather than deviate",
      "No documentation of the deviation is necessary as long as the patient survived",
    ],
    answerIndex: 1,
    explanation:
      "Most EMS systems recognize that in a genuine emergency where contact is impossible and the patient's condition demands immediate action, a documented, good-faith deviation from protocol may be defensible — but it must be clearly documented with the reasoning and typically reported to the medical director per agency policy for review. Treating every deviation as automatically illegal ignores this recognized exception; refusing to treat at all would abandon a deteriorating patient; and outcome (survival) does not eliminate the documentation requirement.",
  },
  {
    id:"paramedic-ops-4049",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A conscious, alert adult patient with a suspected but non-life-threatening injury refuses a recommended treatment after the paramedic explains the risks, benefits, and alternatives, and the patient demonstrates clear understanding. What must be true for this refusal to be legally valid (informed refusal)?",
    choices: [
      "The patient must be a competent adult capable of understanding the information provided and the consequences of refusing",
      "The patient must sign a refusal form, and no other criteria matter",
      "A family member must also consent to the refusal",
      "The refusal is automatically invalid if the patient has any chronic medical condition",
    ],
    answerIndex: 0,
    explanation:
      "A valid informed refusal requires that the patient has decision-making capacity (is a competent adult, or an appropriately emancipated/legally authorized minor) and demonstrates understanding of the risks of refusing, the recommended treatment, and alternatives — documentation like a signed form supports but does not by itself establish validity. Family consent is not required for a competent adult's own refusal, and having a chronic medical condition does not automatically strip a patient of decision-making capacity.",
  },
  {
    id:"paramedic-ops-4050",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "A patient involved in a motor vehicle crash smells strongly of alcohol, is slurring speech, and refuses transport despite a visible head laceration and a brief period of confusion reported by bystanders. What is the most appropriate approach to consent in this situation?",
    choices: [
      "Accept the refusal at face value since the patient is verbally communicating",
      "Recognize that alcohol intoxication and a possible head injury raise significant doubt about decision-making capacity, and treat/transport under implied consent while involving law enforcement or medical control as needed",
      "Require the patient to complete a written refusal form and then leave regardless of capacity concerns",
      "Contact only the patient's family to make the decision on the patient's behalf",
    ],
    answerIndex: 1,
    explanation:
      "Evidence of intoxication combined with a possible head injury and reported confusion raises legitimate doubt about the patient's capacity to give an informed refusal; in that setting, providers generally proceed under implied consent (the presumption a reasonable person would want treatment for a serious injury) and involve law enforcement or medical control to support the decision. A signature on a form does not establish valid capacity if capacity itself is in doubt, and contacting family does not substitute for the patient's own capacity assessment or override the emergency doctrine when the patient cannot make an informed choice.",
  },
  {
    id:"paramedic-ops-4051",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "EMS arrives at a private residence for a patient in cardiac arrest. A family member produces a document titled 'POLST' (Physician Orders for Life-Sustaining Treatment) indicating the patient wishes 'Do Not Attempt Resuscitation,' and the document appears properly signed by the patient and a physician. What is the most appropriate action?",
    choices: [
      "Begin full resuscitation regardless of the POLST, since only a notarized will can direct EMS care",
      "Honor the valid POLST by withholding resuscitative efforts, consistent with local protocol for recognizing POLST/DNR documentation",
      "Ignore the document because family members are never permitted to present it on a patient's behalf",
      "Begin resuscitation until a hospital physician confirms the POLST over the phone",
    ],
    answerIndex: 1,
    explanation:
      "A properly executed POLST form signed by both the patient (or authorized surrogate) and a physician is a valid medical order that EMS should honor according to local protocol, generally withholding resuscitation when it specifies DNR. It does not require a notarized will, a family member presenting the document on the patient's behalf is expected and appropriate, and a valid POLST does not require additional real-time physician confirmation before being honored.",
  },
  {
    id:"paramedic-ops-4052",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "EMS responds to a cardiac arrest and finds a DNR order, but it is expired, unsigned, or its validity cannot be confirmed on scene. What is the most appropriate action?",
    choices: [
      "Begin resuscitation per standard protocol, since an invalid or unverifiable DNR order does not meet the legal threshold to withhold care",
      "Withhold resuscitation because a document referencing a DNR was found, regardless of its validity",
      "Ask a neighbor to verify the patient's wishes and honor whatever they say",
      "Delay any action for 15 minutes to see if a valid document can be located",
    ],
    answerIndex: 0,
    explanation:
      "When a DNR/POLST document cannot be verified as currently valid (missing signatures, expired, unclear authenticity), most EMS systems require resuscitation to proceed per standard protocol, since withholding care requires a clearly valid order. Withholding care based on an unverifiable document risks an unjustified withholding of life-saving treatment; a neighbor's account does not meet the standard for a valid medical order; and pausing resuscitative efforts to search for documentation sacrifices time-critical intervention in an arrest.",
  },
  {
    id:"paramedic-ops-4053",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "During a home visit for a medical complaint, a paramedic notices unexplained bruising in various stages of healing on an elderly patient who lives with a caregiver, along with signs of poor hygiene and possible neglect. The patient seems reluctant to speak in front of the caregiver. What is the paramedic's legal and ethical obligation?",
    choices: [
      "Say nothing since it is not the paramedic's place to get involved in family matters",
      "Report the suspected abuse/neglect to the appropriate authority (e.g., adult protective services or law enforcement) as a mandatory reporter, and document objective findings",
      "Confront the caregiver directly and accuse them of abuse on scene",
      "Wait until the patient explicitly asks for help before taking any action",
    ],
    answerIndex: 1,
    explanation:
      "Paramedics are mandatory reporters for suspected abuse or neglect of vulnerable populations (children, elderly, dependent adults) and are legally and ethically obligated to report reasonable suspicion to the appropriate agency, along with objective documentation of findings. Staying silent violates this legal duty; confronting the caregiver on scene can escalate danger to the patient and provider without addressing the underlying issue through proper channels; and waiting for the patient to explicitly ask for help ignores that fear, cognitive impairment, or the caregiver's presence may prevent them from doing so.",
  },
  {
    id:"paramedic-ops-4054",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following populations are typically covered under mandatory reporting laws that apply to EMS providers?",
    choices: [
      "Suspected abuse or neglect of children, elderly persons, and dependent/vulnerable adults",
      "Only cases involving firearms injuries",
      "Only patients who are uninsured",
      "Only patients who explicitly request that a report be made",
    ],
    answerIndex: 0,
    explanation:
      "Mandatory reporting statutes for EMS providers typically cover suspected abuse or neglect of children, elders, and dependent/vulnerable adults, requiring a report based on reasonable suspicion regardless of the patient's wishes. These laws are not limited to firearm injuries, are unrelated to insurance status, and do not require the patient's request — the duty exists independent of what the patient wants.",
  },
  {
    id:"paramedic-ops-4055",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A 16-year-old patient with an emancipated minor status sustains a minor laceration and requests treatment and transport, but her parents (present on scene) demand that EMS not treat her. How should the paramedic proceed?",
    choices: [
      "Defer entirely to the parents since any minor requires parental consent",
      "Recognize the patient's emancipated status as generally granting her the legal right to consent to her own care, and proceed with treatment consistent with her wishes and local law",
      "Refuse to treat until a judge can be reached to resolve the dispute",
      "Treat the patient only if the parents eventually change their mind",
    ],
    answerIndex: 1,
    explanation:
      "An emancipated minor is generally treated as having the legal capacity to consent to (or refuse) their own medical care, independent of parental wishes, under most state laws — so the patient's own informed decision should generally control. Automatically deferring to the parents ignores the entire purpose of emancipated status, waiting for a judge is impractical and unnecessary for routine care, and conditioning treatment on the parents' agreement defeats the patient's legal right to decide.",
  },
  {
    id:"paramedic-ops-4056",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "In the context of EMS legal exposure, what does the term 'abandonment' refer to?",
    choices: [
      "Terminating care of a patient without their consent and without transferring care to a provider of equal or higher training level",
      "Refusing to respond to a call that is outside the unit's coverage area",
      "Declining to transport a patient who explicitly and validly refuses care",
      "Requesting additional resources before beginning treatment",
    ],
    answerIndex: 0,
    explanation:
      "Abandonment occurs when a provider who has begun a duty to act terminates care without the patient's consent and without transferring that care to someone of equal or higher training — for example, leaving a patient with a lower-trained provider without justification. Declining a call outside a unit's coverage area, honoring a valid informed refusal, and requesting more resources before initiating care do not meet this definition.",
  },
  {
    id:"paramedic-ops-4057",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A paramedic transfers care of a critical patient to an ED nurse who appears overwhelmed and does not acknowledge the handoff report or take over monitoring immediately. What should the paramedic do to avoid a claim of abandonment?",
    choices: [
      "Leave immediately once inside the hospital doors, since the transfer is presumed complete",
      "Ensure a clear, acknowledged verbal handoff occurs and that a qualified staff member has actually assumed responsibility for ongoing care before leaving",
      "Wait exactly five minutes by the clock regardless of whether anyone has taken over care",
      "Leave the patient monitor running and depart without speaking to any staff",
    ],
    answerIndex: 1,
    explanation:
      "To avoid abandonment liability, care must be affirmatively transferred to someone who acknowledges and assumes responsibility, not simply presumed complete because the patient is now inside the hospital — the paramedic should confirm a staff member has actually taken over before leaving. Assuming transfer is automatic upon arrival, applying an arbitrary fixed wait time regardless of actual handoff, and departing without any confirmation from staff all risk leaving the patient without continuity of care.",
  },
  {
    id:"paramedic-ops-4058",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What four elements must generally be proven to establish a claim of negligence against an EMS provider?",
    choices: [
      "Duty to act, breach of that duty, damages, and causation linking the breach to the damages",
      "Intent to harm, breach of duty, damages, and a witness statement",
      "Duty to act, breach of duty, and damages only — causation is not required",
      "A signed refusal form, breach of duty, damages, and causation",
    ],
    answerIndex: 0,
    explanation:
      "Negligence requires all four elements: a duty existed, that duty was breached, the patient suffered actual damages, and the breach was the proximate cause of those damages. Intent to harm is not an element of negligence (it would describe an intentional tort instead); causation is a required element, not optional; and a signed refusal form is unrelated to establishing negligence.",
  },
  {
    id:"paramedic-ops-4059",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "A paramedic is later named in a lawsuit alleging a delayed diagnosis contributed to a poor outcome. The paramedic's patient care report from the call is thorough, timely, and objectively documents assessment findings, treatments, and the patient's response. What is the most accurate statement about this documentation's legal value?",
    choices: [
      "Thorough, contemporaneous documentation is one of the strongest tools for demonstrating that the standard of care was met, since it establishes what was actually assessed and done at the time",
      "Documentation created after the call has no legal value regardless of accuracy",
      "Only the presence of a patient signature on the report matters for legal protection",
      "Detailed documentation increases legal liability by giving the plaintiff more information",
    ],
    answerIndex: 0,
    explanation:
      "Complete, accurate, contemporaneous documentation is one of the best protections a provider has in litigation because it demonstrates what was actually assessed, considered, and done, and supports that the standard of care was met. Documentation is not valueless just because it was completed after the call as long as it's accurate and timely; a patient signature alone (e.g., on a refusal) is only one small piece, not the sole determinant of legal protection; and thorough documentation generally protects rather than increases liability, since gaps and vagueness are what typically create legal vulnerability.",
  },
  {
    id:"paramedic-ops-4060",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A patient who has decision-making capacity for a high-risk, invasive procedure (e.g., needle decompression) asks detailed questions about risks and alternatives before consenting. Which principle is the paramedic upholding by thoroughly answering these questions before proceeding?",
    choices: [
      "Informed consent, which requires disclosure of the nature of the procedure, risks, benefits, and alternatives so the patient can make a voluntary, informed decision",
      "Implied consent, which applies automatically to all invasive procedures",
      "Substituted judgment, which applies only when the patient lacks capacity",
      "Standing orders, which eliminate the need for any patient consent",
    ],
    answerIndex: 0,
    explanation:
      "Informed consent for a high-risk procedure requires explaining the nature of the procedure, its risks and benefits, and reasonable alternatives, allowing a capable patient to make a voluntary decision — exactly what's described here. Implied consent applies when a patient cannot express wishes (e.g., unconscious) and a reasonable person would want treatment, which doesn't apply to a capable, questioning patient; substituted judgment applies to surrogate decision-making for incapacitated patients; and standing orders govern what a paramedic may do without physician contact, not whether patient consent is required.",
  },
  {
    id:"paramedic-ops-4061",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A paramedic responding to their third pediatric traumatic death of the month finds themselves feeling emotionally numb, having trouble sleeping, and increasingly irritable with coworkers and family. This constellation of symptoms is most consistent with which condition?",
    choices: [
      "Cumulative critical incident stress / early signs of burnout or traumatic stress",
      "A normal, expected reaction requiring no attention or intervention",
      "A sign of malingering to avoid work duties",
      "An isolated, one-time reaction unrelated to repeated exposure to traumatic calls",
    ],
    answerIndex: 0,
    explanation:
      "Emotional numbing, sleep disturbance, and irritability following repeated exposure to traumatic calls are recognized signs of cumulative critical incident stress and can progress toward burnout or traumatic stress if unaddressed, warranting support and intervention. This pattern is not something to dismiss as requiring no attention, it is not evidence of malingering, and it reflects the cumulative effect of repeated exposures rather than an isolated, unrelated event.",
  },
  {
    id:"paramedic-ops-4062",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of a Critical Incident Stress Management (CISM) program in EMS?",
    choices: [
      "To provide structured peer support, education, and resources to help responders process and cope with the psychological impact of traumatic calls",
      "To formally evaluate whether a provider should be terminated after a difficult call",
      "To replace the need for a formal quality assurance review of clinical care",
      "To provide legal defense for the agency in the event of a lawsuit",
    ],
    answerIndex: 0,
    explanation:
      "CISM programs exist to provide peer support, education, and referral resources that help responders cope with the psychological toll of critical incidents, aiming to mitigate long-term harm like PTSD and burnout. They are not disciplinary/termination processes, they do not substitute for clinical QA review of the care provided, and their purpose is provider wellbeing, not agency legal defense.",
  },
  {
    id:"paramedic-ops-4063",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A paramedic supervisor notices a normally reliable medic has become withdrawn, is making uncharacteristic errors, and has mentioned feeling 'done with this job' after several difficult calls. What is the most appropriate supervisory response?",
    choices: [
      "Privately check in with the medic, express concern, and connect them with available support resources (peer support, EAP, CISM) while monitoring for safety",
      "Ignore the comments since venting is normal in EMS and requires no follow-up",
      "Publicly discuss the medic's comments at the next shift meeting to raise awareness among the team",
      "Immediately terminate the medic's employment to protect patient safety",
    ],
    answerIndex: 0,
    explanation:
      "A private, supportive conversation connecting the provider with appropriate resources (peer support teams, Employee Assistance Programs, CISM) while monitoring for safety concerns is the appropriate supervisory response to signs of significant distress and burnout. Dismissing clear warning signs as ordinary venting risks missing a genuine crisis; publicly discussing a colleague's personal struggles breaches confidentiality and trust; and immediate termination is a punitive overreaction to what are signs of distress, not necessarily incompetence or danger, and bypasses appropriate support and evaluation processes.",
  },
  {
    id:"paramedic-ops-4064",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following statements about provider wellness and shift scheduling in EMS is best supported by current understanding of fatigue and human factors?",
    choices: [
      "Extended shift lengths and chronic sleep deprivation are associated with increased risk of clinical errors and motor vehicle crashes among EMS providers",
      "EMS providers are immune to fatigue-related performance decline due to their training",
      "Fatigue only affects providers who work night shifts",
      "There is no relationship between shift length and patient safety outcomes in EMS",
    ],
    answerIndex: 0,
    explanation:
      "A substantial body of evidence links long shifts and chronic sleep deprivation in EMS to increased clinical errors, near-misses, and ambulance crashes, which is why fatigue mitigation strategies are increasingly emphasized in the field. Training does not confer immunity to the physiological effects of fatigue, fatigue can affect providers on any shift pattern (not only nights), and shift length has a well-documented relationship to safety outcomes.",
  },
  {
    id:"paramedic-ops-4065",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A paramedic reports recurring intrusive memories of a mass casualty incident from several months ago, along with avoidance of driving past the scene and hypervigilance while on duty. These symptoms, if persistent and impairing, are most consistent with which condition?",
    choices: [
      "Post-traumatic stress disorder (PTSD)",
      "A normal, transient stress response requiring no further evaluation",
      "Situational depression unrelated to work exposure",
      "Simple physical fatigue from long shifts",
    ],
    answerIndex: 0,
    explanation:
      "Persistent intrusive memories, avoidance behavior, and hypervigilance following a traumatic exposure are hallmark features of PTSD and warrant referral for professional evaluation and treatment. This pattern exceeds what is considered a normal, self-limited stress response; it is specifically trauma-related rather than general situational depression; and it reflects a psychological response, not simple physical fatigue.",
  },
  {
    id:"paramedic-ops-4066",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the purpose of a formal quality assurance/performance improvement (QA/PI) program within an EMS agency?",
    choices: [
      "To systematically review patient care and operational data to identify trends, improve clinical outcomes, and support education, using it primarily as a learning tool rather than punishment",
      "To punish individual providers for every documented deviation from ideal care",
      "To eliminate the need for continuing education",
      "To exclusively track agency finances and billing accuracy",
    ],
    answerIndex: 0,
    explanation:
      "QA/PI programs exist to systematically review data (chart audits, outcome tracking, skill performance) to find trends and improvement opportunities, functioning primarily as a non-punitive learning and system-improvement process. They are not designed as automatic punishment for every deviation (which would suppress honest reporting), they do not replace continuing education (they often inform it), and they are clinically/operationally focused rather than a billing function.",
  },
  {
    id:"paramedic-ops-4067",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "A QA review finds that a specific error (a wrong medication concentration) has occurred three times over six months by three different providers. What does this pattern most strongly suggest?",
    choices: [
      "A likely systems-level issue (e.g., similar drug packaging, unclear protocol, or supply stocking problem) rather than three unrelated individual failures",
      "That all three providers should be immediately terminated",
      "That the error is purely coincidental and does not warrant further investigation",
      "That the medication should simply be removed from the formulary permanently",
    ],
    answerIndex: 0,
    explanation:
      "A recurring error pattern across multiple, otherwise competent providers strongly suggests a systems-level contributing factor (look-alike packaging, ambiguous protocol wording, storage/stocking issues) rather than three coincidentally similar individual mistakes — this is the core insight of a systems-based, non-punitive QA approach (similar to root cause analysis). Jumping to termination ignores the systemic pattern and punishes individuals for a likely system flaw; dismissing a repeated pattern as coincidence misses a real safety signal; and removing the medication outright, without first investigating the cause, may not solve the underlying issue and could remove a needed treatment.",
  },
  {
    id:"paramedic-ops-4068",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is a 'sentinel event' in the context of EMS quality assurance?",
    choices: [
      "A serious, unexpected occurrence involving death or significant harm that triggers immediate investigation to identify contributing causes and prevent recurrence",
      "A routine, minor documentation error found during a random chart audit",
      "Any call that requires more than one unit to respond",
      "A scheduled, periodic review of an agency's overall call volume",
    ],
    answerIndex: 0,
    explanation:
      "A sentinel event is a serious, typically unexpected occurrence involving death, serious harm, or significant risk thereof, that signals a need for immediate investigation and response to identify root causes and prevent recurrence. It is not a minor documentation issue, it is not defined by the number of responding units, and it is not simply a routine periodic volume review.",
  },
  {
    id:"paramedic-ops-4069",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An EMS medical director wants to evaluate whether a new chest pain protocol is improving time-to-cath-lab-activation. Which QA/PI approach would best measure this?",
    choices: [
      "Comparing aggregate time-to-activation data before and after protocol implementation using a defined set of chart audits or a registry",
      "Asking individual paramedics informally whether they feel the new protocol is faster",
      "Reviewing only the single worst-outcome case from the past year",
      "Relying solely on patient satisfaction survey scores",
    ],
    answerIndex: 0,
    explanation:
      "A structured before-and-after comparison using objective data (such as chart audits or a STEMI/cath lab registry) is the appropriate QA/PI method to measure a specific, quantifiable process metric like time-to-activation. Informal subjective impressions from individual providers are prone to bias and lack objective measurement; reviewing only the single worst case does not represent overall system performance; and patient satisfaction surveys do not measure this specific clinical timing metric.",
  },
  {
    id:"paramedic-ops-4070",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A patient with a suspected large-vessel occlusion stroke is located in a rural area 90 minutes by ground from the nearest comprehensive stroke center, but a helicopter with a 15-minute flight time to that same center is available. According to typical air medical utilization criteria, what is the most appropriate transport decision?",
    choices: [
      "Transport by ground regardless of time, since helicopters should never be used for stroke patients",
      "Request air medical transport, since it offers a substantial time savings to definitive care for a time-critical condition where ground transport time is excessive",
      "Delay any transport decision until the patient's symptoms fully resolve",
      "Transport to the nearest hospital regardless of its stroke center capability",
    ],
    answerIndex: 1,
    explanation:
      "Air medical transport is appropriately utilized when it offers a clinically meaningful time savings to definitive, time-critical care that ground transport cannot match — a large-vessel occlusion stroke needing a comprehensive stroke center is a classic example where a large time differential (90 minutes versus 15) justifies activation. Air transport is a well-established option for time-critical stroke care, not something to categorically avoid; delaying transport to see if symptoms resolve wastes critical time in a time-dependent condition; and bypassing to the nearest hospital regardless of capability ignores that this patient needs a comprehensive stroke center specifically.",
  },
  {
    id:"paramedic-ops-4071",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following is a recognized contraindication or limiting factor for helicopter EMS (HEMS) transport?",
    choices: [
      "Weather conditions below safe flight minimums (e.g., low ceiling, poor visibility, high winds/icing)",
      "The patient being older than 65 years",
      "The patient having a known penicillin allergy",
      "The call occurring during daytime hours",
    ],
    answerIndex: 0,
    explanation:
      "Weather minimums (ceiling, visibility, wind, icing) are a hard operational limit on HEMS flight safety, and flights are declined or aborted when conditions fall below them, regardless of patient acuity. Patient age alone, a penicillin allergy, and time of day (many programs fly both day and night, weather permitting) are not themselves contraindications to air transport.",
  },
  {
    id:"paramedic-ops-4072",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A patient with a critical traumatic injury is 8 minutes by ground from a Level II trauma center. A helicopter is available but would take 12 minutes just to arrive on scene, then require loading and flight time. What is the most appropriate transport decision?",
    choices: [
      "Transport by ground immediately, since it will reach definitive care faster than waiting for and using the helicopter",
      "Wait for the helicopter regardless of the time comparison, since air transport is always faster overall",
      "Cancel EMS transport entirely and wait for the patient to arrange private transport",
      "Request the helicopter to fly the crew only, without the patient, to save time",
    ],
    answerIndex: 0,
    explanation:
      "When ground transport time to an appropriate facility is shorter than the total time air transport would add (helicopter response, patient loading, and flight), ground transport is the correct choice — this scenario is a textbook example where waiting for the helicopter would only delay definitive care. Assuming air is always faster ignores the actual time math in this scenario; canceling transport for private arrangement abandons a critical patient; and flying the crew without the patient makes no operational sense.",
  },
  {
    id:"paramedic-ops-4073",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What physiological consideration is uniquely important when managing a patient with a closed pneumothorax or recent scuba diving exposure during air medical transport at altitude?",
    choices: [
      "Gas expansion at altitude (per Boyle's Law) can worsen a pneumothorax or cause decompression complications, requiring altitude restriction or pressurization consideration",
      "Altitude has no physiological effect on trapped gas within the body",
      "Only fixed-wing aircraft are affected by altitude-related gas expansion, not helicopters",
      "Gas volume decreases with decreasing atmospheric pressure at altitude",
    ],
    answerIndex: 0,
    explanation:
      "Per Boyle's Law, gas volume increases as atmospheric pressure decreases with altitude, which can worsen a pneumothorax or exacerbate decompression sickness in a recent diver — flight planning may require low-altitude flight or a pressurized cabin. Altitude very much affects trapped gas physiologically, this effect applies to any aircraft gaining altitude (not fixed-wing exclusively), and gas volume increases, not decreases, as pressure drops.",
  },
  {
    id:"paramedic-ops-4074",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Ground EMS arrives on scene of a rollover crash with a critically injured patient and requests air medical transport. The flight crew, upon receiving the request details, declines the mission due to deteriorating weather along the flight path. What is the most appropriate response by the ground crew?",
    choices: [
      "Argue with the flight crew and insist they fly anyway given the patient's critical condition",
      "Accept the weather-based decline, since flight safety decisions are final, and proceed with the most appropriate ground transport option",
      "Wait on scene indefinitely for the weather to clear before making any transport decision",
      "Attempt to contact a different aircraft repeatedly until one agrees to fly regardless of the weather",
    ],
    answerIndex: 1,
    explanation:
      "Flight crews and pilots have final authority over flight safety decisions, including weather-based declines, and this decision should not be challenged or pressured — the ground crew should pivot immediately to the best available ground transport option for the patient. Pressuring a flight crew to fly in unsafe conditions endangers the aircraft, crew, and patient; waiting indefinitely on scene delays needed care; and shopping for another aircraft willing to accept unsafe conditions defeats the purpose of the safety-based decline and risks the same outcome with a different crew.",
  },
  {
    id:"paramedic-ops-4075",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following is a standard safety practice for ground EMS personnel when approaching a landed helicopter?",
    choices: [
      "Approach only from the front or side within the pilot's clear view, and never approach from the rear near the tail rotor",
      "Approach from any direction, since modern helicopters have no blind spots",
      "Run toward the aircraft to minimize scene time",
      "Approach with IV poles or equipment held upright overhead",
    ],
    answerIndex: 0,
    explanation:
      "Personnel should approach a helicopter only within the pilot's field of view (typically front/side, per that program's guidance) and must never approach from the rear due to the tail rotor hazard, which is difficult to see and can be lethal. Helicopters do have blind spots and hazards, so unrestricted approach direction is unsafe; running near rotor wash increases fall and debris risk; and holding equipment upright overhead risks contact with the main rotor system.",
  },
  {
    id:"paramedic-ops-4076",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    itemType: "options_table",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "For each transport scenario, determine whether air medical transport is generally the more appropriate choice or ground transport is generally the more appropriate choice.",
    rows: [
      { id: "row1", finding: "Critical trauma patient, ground transport time to nearest appropriate trauma center is 75 minutes; helicopter total time to same facility is 20 minutes", options: ["Air transport", "Ground transport"], correctOptionIndex: 0 },
      { id: "row2", finding: "Stable patient with an isolated ankle fracture, hospital 10 minutes away by ground", options: ["Air transport", "Ground transport"], correctOptionIndex: 1 },
      { id: "row3", finding: "Critical patient with a landing zone available, but current conditions are below the aircraft's weather minimums", options: ["Air transport", "Ground transport"], correctOptionIndex: 1 },
      { id: "row4", finding: "Multi-system trauma patient at a scene 8 minutes by ground from an appropriate trauma center, helicopter would take 25 minutes to arrive and load", options: ["Air transport", "Ground transport"], correctOptionIndex: 1 },
    ],
    explanation:
      "Air transport is favored when it offers a substantial time advantage to definitive care for a time-critical patient and conditions are safe to fly (row 1). Ground is favored for stable, non-time-critical patients close to an appropriate facility (row 2), whenever weather makes flight unsafe regardless of patient acuity (row 3), and whenever the total air transport time would actually exceed ground transport time to an appropriate facility (row 4).",
  },
  {
    id:"paramedic-ops-4077",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the general goal of community paramedicine (also called mobile integrated healthcare) programs?",
    choices: [
      "To use specially trained paramedics to provide proactive, non-emergency services (chronic disease management, follow-up visits, preventive care, connection to social services) aimed at reducing unnecessary ED visits and readmissions",
      "To replace 911 emergency response entirely with scheduled home visits",
      "To eliminate the need for primary care physicians",
      "To exclusively focus on billing optimization for the EMS agency",
    ],
    answerIndex: 0,
    explanation:
      "Community paramedicine/mobile integrated healthcare programs expand the paramedic's role into proactive, non-emergency care — chronic disease management, post-discharge follow-up, preventive services, and connecting patients with community resources — with a goal of reducing avoidable ED visits, readmissions, and 911 utilization for non-emergent needs. These programs supplement rather than replace 911 response, they work alongside (not instead of) primary care physicians, and their purpose is patient-centered care coordination, not billing optimization.",
  },
  {
    id:"paramedic-ops-4078",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A community paramedicine program identifies a patient with heart failure who has been readmitted to the hospital three times in two months for volume overload, largely due to medication non-adherence and lack of transportation to follow-up appointments. Which intervention best fits the community paramedicine model?",
    choices: [
      "Scheduled home visits by a community paramedic to reconcile medications, assess for early decompensation, and coordinate transportation/follow-up resources",
      "Instructing the patient to call 911 immediately whenever symptoms worsen, with no other intervention",
      "Discharging the patient from all EMS-related services since community paramedicine does not address chronic disease",
      "Referring the case exclusively to law enforcement",
    ],
    answerIndex: 0,
    explanation:
      "This scenario is a canonical community paramedicine use case: proactive home visits to address medication adherence, catch early decompensation, and connect the patient with transportation/follow-up resources directly target the root causes of the readmissions. Relying solely on 911 for worsening symptoms does nothing to prevent the underlying readmission cycle; community paramedicine specifically does address chronic disease management, so declining to help is a misapplication of the program's purpose; and this is a medical/social needs issue, not a law enforcement matter.",
  },
  {
    id:"paramedic-ops-4079",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Community paramedics typically operate under which of the following?",
    choices: [
      "An expanded scope defined by specific medical director-approved protocols and additional training beyond standard paramedic certification",
      "No medical oversight at all, since the visits are non-emergency",
      "The exact same protocols used for 911 emergency response, with no additional training",
      "Independent authority to prescribe any medication without physician involvement",
    ],
    answerIndex: 0,
    explanation:
      "Community paramedicine requires additional specialized training and operates under medical director-approved protocols specific to that expanded, non-emergency scope of practice. It still requires medical oversight (not none at all), the protocols differ from standard 911 response protocols because the clinical context and goals differ, and community paramedics do not have independent prescribing authority separate from physician oversight.",
  },
  {
    id:"paramedic-ops-4080",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "During an interfacility transport, a paramedic reviews the sending facility's orders and finds a continuous vasoactive infusion running that is outside their standing scope of practice to manage independently. What is the most appropriate action before accepting the transfer?",
    choices: [
      "Accept the transfer anyway and manage the infusion as best as possible without additional support",
      "Decline to transport until either an appropriately trained provider (e.g., a critical care paramedic or nurse) accompanies the patient, or online medical direction authorizes and supports the specific management needed",
      "Turn off the infusion for the duration of transport to simplify care",
      "Transport the patient without the infusion documentation to avoid the issue",
    ],
    answerIndex: 1,
    explanation:
      "When a transfer requires managing a medication or intervention outside the transporting paramedic's scope, the appropriate step is to arrange for a qualified accompanying provider (such as a critical care paramedic or RN) or obtain explicit medical direction support, rather than proceeding beyond one's scope. Managing it anyway without support exceeds scope and risks patient harm; stopping a vasoactive infusion (often supporting blood pressure or perfusion) without orders can be dangerous; and omitting documentation to avoid addressing the issue is dishonest and does not solve the underlying safety problem.",
  },
  {
    id:"paramedic-ops-4081",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary purpose of a thorough sending-facility report and chart review before beginning an interfacility transport?",
    choices: [
      "To understand the patient's current condition, treatments, pending results, and potential for deterioration so the transporting crew can anticipate and prepare for problems en route",
      "To determine how to bill the transport",
      "To decide which radio channel to use during transport",
      "To satisfy a requirement with no clinical relevance to the transport itself",
    ],
    answerIndex: 0,
    explanation:
      "A thorough handoff and chart review gives the transporting crew the clinical picture needed to anticipate potential complications, prepare appropriate equipment/medications, and plan for deterioration during transport — this is directly relevant to patient safety. It is not primarily a billing exercise, it has nothing to do with radio channel selection, and it is clinically essential rather than a mere administrative formality.",
  },
  {
    id:"paramedic-ops-4082",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A stable patient requires interfacility transfer for a specialist consultation that is not time-critical, with no ongoing advanced monitoring or intervention needs anticipated during transport. What level of transport is generally most appropriate?",
    choices: [
      "BLS interfacility transport, since the patient's needs do not exceed basic-level care and monitoring",
      "Critical care transport with a specialized team, regardless of the patient's actual needs",
      "Air medical transport by default for all interfacility transfers",
      "No transport is needed since specialist consultations do not require transfer",
    ],
    answerIndex: 0,
    explanation:
      "Transport level should match the patient's actual anticipated clinical needs during the transfer — a stable patient with no advanced monitoring or intervention needs is appropriately transported at the BLS level, reserving ALS/critical care resources for patients who need them. Defaulting to critical care or air transport for a stable, non-time-critical transfer wastes scarce specialized resources without clinical benefit, and the scenario explicitly requires transport since the consultation is at another facility.",
  },
  {
    id:"paramedic-ops-4083",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "During a long-distance interfacility transport of a ventilated patient, the paramedic notices the ventilator's oxygen supply is lower than expected for the transport duration based on their pre-trip calculation. What is the most appropriate action?",
    choices: [
      "Continue the transport as planned and hope the supply is sufficient",
      "Recalculate oxygen needs, arrange for additional oxygen supply or a rendezvous/refill point before departure, and delay departure if the safety margin cannot be assured",
      "Switch the patient to room air for part of the trip to conserve oxygen",
      "Increase the patient's respiratory rate on the ventilator to finish the trip faster",
    ],
    answerIndex: 1,
    explanation:
      "Identifying an oxygen supply shortfall before departure requires recalculating actual needs (including a safety margin for delays) and arranging additional supply or a refill point, delaying departure if adequate supply cannot be assured — this is a critical pre-transport safety check for any ventilated interfacility transfer. Proceeding and hoping is an unacceptable risk for a ventilator-dependent patient; switching to room air for a ventilated patient is dangerous and inappropriate; and increasing respiratory rate to 'finish faster' does not address the oxygen supply problem and could cause iatrogenic harm (e.g., respiratory alkalosis, barotrauma risk) unrelated to the actual issue.",
  },
  {
    id:"paramedic-ops-4084",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "The Emergency Medical Treatment and Labor Act (EMTALA) most directly affects interfacility transfers by requiring which of the following?",
    choices: [
      "That a transferring hospital stabilize a patient's emergency medical condition to the extent possible and ensure the receiving facility has agreed to accept the patient and has the capability to provide needed care before transfer",
      "That all patients be transferred only by helicopter",
      "That EMS agencies handle all billing disputes between hospitals",
      "That patients pay for transport before it can be arranged",
    ],
    answerIndex: 0,
    explanation:
      "EMTALA requires a transferring hospital to stabilize an emergency medical condition to the extent of its capability and to obtain an accepting physician/facility with the capacity to manage the patient's condition before an appropriate transfer occurs. It says nothing about mandating helicopter transport, does not make EMS responsible for hospital billing disputes, and prohibits, rather than requires, conditioning emergency care/transfer on the patient's ability to pay.",
  },
  {
    id:"paramedic-ops-4085",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    itemType: "multiple_response",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "Which of the following findings should prompt a paramedic to seriously question whether a patient's on-scene refusal of care is truly valid (informed)? (Select 3.)",
    choices: [
      "The patient sustained a head injury with a witnessed period of altered mental status",
      "The patient's speech is slurred and there is a strong odor of alcohol on their breath",
      "The patient calmly explains, without any distress, that they understand the risks and still prefer to be seen by their own physician tomorrow",
      "The patient is acutely suicidal and refusing transport after a self-harm attempt",
      "The patient has a stable chronic illness that has been well controlled for years",
    ],
    correctIndices: [0, 1, 3],
    explanation:
      "A witnessed altered mental status after head injury, signs of significant intoxication, and active suicidality after self-harm all raise serious, legitimate doubt about a patient's decision-making capacity and should prompt further evaluation before accepting a refusal. A patient who calmly and clearly demonstrates understanding of risks while making a reasoned preference, and a patient with a stable, well-controlled chronic illness, do not by themselves suggest impaired capacity.",
  },
  {
    id:"paramedic-ops-4086",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "In ICS, which term refers to the process of officially assuming or transferring the role of Incident Commander, typically communicated over the radio and documented?",
    choices: [
      "Transfer of command",
      "Mutual aid activation",
      "Demobilization",
      "Resource typing",
    ],
    answerIndex: 0,
    explanation:
      "Transfer of command is the formal process (with a briefing and clear radio announcement) by which incident command responsibility passes from one person to another, ensuring everyone knows who is currently in charge. Mutual aid activation refers to requesting resources from another agency under a pre-existing agreement; demobilization is the orderly release of resources as an incident winds down; resource typing categorizes resources by capability, none of which describe a change in command authority.",
  },
  {
    id:"paramedic-ops-4087",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A battalion chief arrives at a working structure fire where a paramedic captain has been serving as Incident Commander for 10 minutes. The battalion chief intends to assume command. What must occur for this to be done correctly?",
    choices: [
      "The battalion chief should simply begin issuing orders without any formal announcement, since rank alone establishes authority",
      "A face-to-face or radio transfer-of-command briefing should occur, followed by a clear announcement so all responders know command has changed",
      "Command cannot be transferred once established, regardless of who arrives",
      "The paramedic captain must leave the scene immediately once a chief officer arrives",
    ],
    answerIndex: 1,
    explanation:
      "Proper transfer of command requires a briefing (face-to-face or by radio) covering the incident's current status, and a clear announcement so every responder knows who now holds command — rank alone does not silently establish this. Command absolutely can and often does transfer as more qualified personnel arrive; and the outgoing IC does not need to leave the scene, and often continues in another role (e.g., Operations Section Chief) using their situational knowledge.",
  },
  {
    id:"paramedic-ops-4088",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What does 'demobilization' refer to in ICS operations?",
    choices: [
      "The orderly, planned release and return of resources no longer needed as an incident winds down",
      "The initial dispatch of resources to an incident",
      "The process of triaging patients at an MCI",
      "The formal request for mutual aid resources",
    ],
    answerIndex: 0,
    explanation:
      "Demobilization is the planned process for releasing resources that are no longer needed, ensuring an orderly return to service or home agency, often guided by a demobilization plan for larger incidents. It is distinct from initial dispatch (the opposite end of the resource lifecycle), from patient triage, and from the mutual aid request process itself.",
  },
  {
    id:"paramedic-ops-4089",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "At a large-scale incident lasting several days, the Planning Section notes that several units have been operating continuously without documented rest periods, raising safety concerns. Which ICS planning tool is specifically intended to track and address responder work/rest cycles across operational periods?",
    choices: [
      "Personnel accountability and work/rest guidelines built into the Incident Action Plan by the Planning Section, often supported by Logistics",
      "The Finance Section's cost summary",
      "The Public Information Officer's media log",
      "The hazardous materials placard reference guide",
    ],
    answerIndex: 0,
    explanation:
      "Tracking personnel work/rest cycles and building appropriate rotation into each operational period's Incident Action Plan is a Planning Section responsibility, generally supported by Logistics for rehab and lodging — directly addressing responder fatigue and safety over a multi-day incident. A cost summary, a media log, and a hazmat placard guide are unrelated tools serving entirely different functions.",
  },
  {
    id:"paramedic-ops-4090",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "A rural county with 3 ambulances is overwhelmed by a 40-patient bus crash. The county's mutual aid plan allows automatic requests to two neighboring counties. What is the most appropriate early action by the Incident Commander?",
    choices: [
      "Activate the mutual aid plan immediately based on the estimated patient count, rather than waiting until all local resources are exhausted",
      "Wait until all 3 local ambulances have completed at least one transport before requesting mutual aid",
      "Handle the incident using only local resources to avoid mutual aid costs",
      "Request mutual aid only after every patient has been fully triaged",
    ],
    answerIndex: 0,
    explanation:
      "Given an obvious, large resource mismatch (40 patients against 3 local ambulances), the IC should request mutual aid early based on the incident's estimated scope, since delaying the request until local resources are exhausted only prolongs the time until adequate help arrives. Waiting for transports to be completed, avoiding mutual aid to save costs, or waiting for triage to fully finish before requesting help all needlessly delay a request that should be driven by the incident's evident scale, not by exhausting local capacity first.",
  },
  {
    id:"paramedic-ops-4091",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "sceneSafety",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "EMS is called to a residence for a patient with vague flu-like symptoms whose family reports several other household members are also newly ill after recent international travel. Which operational consideration is most important before entering?",
    choices: [
      "Consider possible infectious disease exposure and don appropriate PPE (e.g., mask, eye protection) and notify dispatch/receiving facility as indicated by local protocol, before close patient contact",
      "Enter and assess the patient immediately without any additional precautions, since flu-like symptoms are rarely serious",
      "Refuse to respond to the call entirely",
      "Wait for law enforcement before any EMS contact, regardless of the nature of the complaint",
    ],
    answerIndex: 0,
    explanation:
      "A cluster of new illness after international travel raises reasonable suspicion for a communicable disease requiring standard/droplet precautions and early notification per local protocol, protecting the crew and downstream facility staff. Entering without any additional precautions ignores a real infection-control signal; outright refusing to respond abandons the call; and requiring law enforcement presence is not indicated for a medical complaint with no reported violence or scene threat.",
  },
  {
    id:"paramedic-ops-4092",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "After treating a patient with a suspected highly communicable respiratory illness, the paramedic must decontaminate the ambulance before the next call. Which action is most appropriate?",
    choices: [
      "Perform terminal cleaning/disinfection of all patient-contact surfaces and equipment per agency infection control protocol before placing the unit back in service",
      "Wipe down only the stretcher and immediately return to service",
      "Skip cleaning since the patient was masked during transport",
      "Spray air freshener throughout the cabin and return to service",
    ],
    answerIndex: 0,
    explanation:
      "Proper terminal cleaning of all patient-contact surfaces and reusable equipment, per agency infection control protocol, is required before a unit is returned to service after transporting a patient with a suspected communicable disease, protecting the next patient and crew. Cleaning only the stretcher is incomplete since other surfaces are also contaminated; skipping cleaning because the patient wore a mask ignores that masking reduces but does not eliminate transmission risk from surfaces/aerosols; and air freshener has no disinfecting effect and does not address contamination.",
  },
  {
    id:"paramedic-ops-4093",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the main purpose of an after-action review (AAR) or hotwash following a major incident?",
    choices: [
      "To gather participants shortly after the incident to identify what went well, what didn't, and lessons learned to improve future responses",
      "To assign individual blame for every mistake made during the incident",
      "To finalize billing for the incident",
      "To replace the need for any formal incident documentation",
    ],
    answerIndex: 0,
    explanation:
      "An after-action review/hotwash is a structured, typically non-punitive discussion held soon after an incident to capture what worked, what didn't, and actionable lessons for future responses. Its purpose is organizational learning, not assigning individual blame; it is unrelated to billing; and it supplements rather than replaces formal incident documentation (like the IAP archive or patient care reports).",
  },
  {
    id:"paramedic-ops-4094",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "A patient with a valid, signed advance directive states 'no CPR, no intubation, no mechanical ventilation' but does allow for supplemental oxygen and comfort medications. The patient is now in respiratory distress but has a pulse. What is the most appropriate approach?",
    choices: [
      "Provide supportive/comfort measures consistent with the directive (e.g., positioning, supplemental oxygen, comfort medications per protocol) while withholding intubation and ventilation as specified",
      "Intubate and ventilate immediately since the patient is in distress and still has a pulse",
      "Withhold all treatment, including oxygen, because a DNR/advance directive was found",
      "Disregard the directive since the patient is not yet in cardiac arrest",
    ],
    answerIndex: 0,
    explanation:
      "A DNR/advance directive that specifies which interventions are and are not wanted should be followed precisely — here, comfort measures and oxygen are explicitly permitted while intubation/ventilation are explicitly declined, and the patient still has a pulse so this is not a cardiac arrest scenario at all. Intubating despite the clear directive violates the patient's documented wishes; withholding all care including oxygen goes beyond what the directive actually restricts; and disregarding a valid directive because the patient hasn't yet arrested misunderstands that many directives (and POLST forms in particular) apply to treatment decisions before arrest as well.",
  },
  {
    id:"paramedic-ops-4095",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A patient in cardiac arrest is found with an implanted mechanical device bracelet indicating a Left Ventricular Assist Device (LVAD) but no audible pump hum and no palpable pulse, with family reporting the device alarm has been sounding. What should the paramedic recognize as a priority in this resuscitation?",
    choices: [
      "Standard pulse checks may be unreliable with an LVAD, and device-specific assessment (auscultating for pump hum, checking device power/alarms) along with contacting the LVAD coordinator/medical control is a priority alongside standard arrest management",
      "LVAD patients cannot go into cardiac arrest, so this presentation must be a different condition entirely",
      "The device should be immediately removed before any resuscitation efforts begin",
      "Chest compressions are contraindicated in all LVAD patients under any circumstance",
    ],
    answerIndex: 0,
    explanation:
      "LVAD patients require specialized assessment because standard pulse checks are often unreliable (a functioning LVAD can produce continuous, non-pulsatile flow) — absence of pump hum and device alarms are important abnormal findings, and early contact with the device coordinator/medical control for device-specific guidance is a priority alongside standard resuscitative care. LVAD patients absolutely can experience true cardiac arrest or device failure; the device should never be removed in the field; and compressions are not universally contraindicated — guidance is more nuanced and depends on device status and local protocol, but they are not simply always forbidden.",
  },
  {
    id:"paramedic-ops-4096",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which principle describes the ethical obligation of a paramedic to act in the patient's best interest, distinct from simply avoiding harm?",
    choices: [
      "Beneficence",
      "Nonmaleficence",
      "Autonomy",
      "Justice",
    ],
    answerIndex: 0,
    explanation:
      "Beneficence is the ethical duty to act affirmatively for the patient's benefit/best interest. Nonmaleficence is the related but distinct duty to avoid causing harm ('first, do no harm'); autonomy is respecting the patient's right to make their own informed decisions; justice concerns the fair distribution of resources and treatment — none of which is the specific principle of actively promoting the patient's wellbeing being described here.",
  },
  {
    id:"paramedic-ops-4097",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "During an MCI with far more patients than available resources, the medical command decision to triage some critically injured patients as Expectant rather than treating them immediately, in order to direct limited resources to more salvageable patients, is best justified by which ethical principle?",
    choices: [
      "Utilitarian justice — doing the greatest good for the greatest number given genuinely limited resources",
      "Individual patient autonomy, since the patient consented to this categorization",
      "Nonmaleficence alone, since it avoids harming the Expectant patient",
      "Fidelity to a single patient at the expense of population outcomes",
    ],
    answerIndex: 0,
    explanation:
      "MCI triage that reallocates limited resources toward the greatest number of salvageable patients reflects utilitarian/distributive justice reasoning specific to disaster ethics, which differs from normal one-patient-at-a-time care. This decision is not based on patient consent/autonomy (the patient is not choosing this category); it is not fundamentally about avoiding harm to that individual patient (indeed, the decision withholds resources from them); and it explicitly departs from a single-patient-focused fidelity model in favor of population-level outcomes, which is the entire ethical basis for disaster triage.",
  },
  {
    id:"paramedic-ops-4098",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A paramedic is dispatched to a scene where a patient has died under circumstances suggestive of a crime. Which action best preserves both patient care obligations and the integrity of a potential crime scene?",
    choices: [
      "Provide necessary care/assessment while disturbing the scene as little as possible, documenting anything moved and why, and coordinating with law enforcement",
      "Avoid approaching the patient at all to preserve the scene, even if there is any possibility of survivability",
      "Move the body to a different location to make photography easier for investigators",
      "Remove and discard any medical equipment used at the scene once care is complete",
    ],
    answerIndex: 0,
    explanation:
      "EMS must still assess and provide care as needed (survivability is not always obvious at first glance) while minimizing disturbance of the scene, documenting anything necessarily moved, and coordinating with law enforcement — balancing patient care duty with evidence preservation. Refusing to approach at all risks missing a viable patient; moving the body for photography purposes actively destroys scene integrity and is not EMS's role; and discarding used equipment can destroy evidence relevant to the investigation.",
  },
  {
    id:"paramedic-ops-4099",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the primary legal purpose of obtaining online medical control authorization for certain paramedic interventions?",
    choices: [
      "To ensure a physician reviews and authorizes an action that falls outside standing orders, extending the physician's license and clinical judgment to the field situation",
      "To slow down patient care in every situation as a safety buffer",
      "To transfer all legal liability from the paramedic to the physician",
      "To satisfy billing requirements only",
    ],
    answerIndex: 0,
    explanation:
      "Online medical control exists so a physician can review a specific situation in real time and authorize an intervention beyond standing orders, extending their medical license/judgment to that field decision. It is not intended to slow care unnecessarily (it's reserved for situations requiring specific authorization); it does not eliminate the paramedic's own professional and legal accountability for their actions; and its purpose is clinical/legal oversight, not billing.",
  },
  {
    id:"paramedic-ops-4100",
    domain: "EMS Operations",
    level: "Paramedic",
    scenarioId: "scn-mci-overpass-01",
    scenarioStage: "en_route",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "You are the first paramedic unit dispatched to a reported multi-vehicle crash on an interstate overpass during rush hour, with dispatch relaying 'multiple people down, at least one vehicle on fire.' While still en route, what is the most appropriate initial action?",
    choices: [
      "Request additional resources (fire suppression, additional ALS/BLS units, and law enforcement for traffic control) based on the dispatch information, before arrival",
      "Wait until arrival on scene to request any additional resources, to avoid over-committing based on incomplete information",
      "Request only a single additional ambulance regardless of the described scope",
      "Cancel all additional resources until you can personally confirm the fire has been extinguished",
    ],
    answerIndex: 0,
    explanation:
      "Dispatch information describing multiple patients and a vehicle fire on a high-traffic overpass is sufficient to justify requesting additional fire, ALS/BLS, and traffic-control law enforcement resources proactively while en route — early over-requesting is far less costly than a delayed response to an actually large incident. Waiting until arrival to request help delays resources that take time to respond; requesting only one additional ambulance almost certainly under-resources a 'multiple people down' scene; and waiting for personal confirmation the fire is out before requesting any help ignores the immediate danger described and delays a response that may already be urgently needed.",
  },
  {
    id:"paramedic-ops-4101",
    domain: "EMS Operations",
    level: "Paramedic",
    scenarioId: "scn-mci-overpass-01",
    scenarioStage: "scene",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "On arrival, you find 6 patients from a 3-vehicle crash, one vehicle with a small engine fire being knocked down by a bystander's extinguisher, and no command yet established. What should you do first?",
    choices: [
      "Establish yourself as Incident Commander, communicate scene conditions and resource needs, and begin/delegate triage",
      "Immediately begin full treatment on the most severely injured patient you can see, before establishing command",
      "Wait for a fire officer to arrive before taking any action",
      "Direct all patients to walk toward your ambulance regardless of injury severity",
    ],
    answerIndex: 0,
    explanation:
      "With no command established, the first-arriving paramedic must establish command, relay an accurate scene size-up (patient count, hazards, resource needs) and begin or delegate triage — this creates the organizational structure the rest of the response depends on. Immediately committing to treating one patient before command is established leaves the whole incident unmanaged; waiting passively for a fire officer delays essential early actions within your authority; and directing all patients to walk toward the ambulance ignores that some patients may be unable to walk and bypasses proper triage.",
  },
  {
    id:"paramedic-ops-4102",
    domain: "EMS Operations",
    level: "Paramedic",
    scenarioId: "scn-mci-overpass-01",
    scenarioStage: "scene",
    blueprintCategory: "operations",
    itemType: "drag_drop",
    clinicalJudgment: true,
    clinicalJudgmentStep: "define_hypothesis",
    question:
      "Using START triage, categorize each of the 6 patients found at the crash.",
    categories: [
      { id: "immediate", label: "Immediate (Red)" },
      { id: "delayed", label: "Delayed (Yellow)" },
      { id: "minor", label: "Minor (Green)" },
      { id: "deceased", label: "Deceased/Expectant (Black)" },
    ],
    items: [
      { id: "p1", label: "Walking around, crying, minor cuts to hands", correctCategory: "minor" },
      { id: "p2", label: "Respiratory rate 40/min, weak radial pulse", correctCategory: "immediate" },
      { id: "p3", label: "Not breathing, no pulse, airway repositioning does not restore breathing", correctCategory: "deceased" },
      { id: "p4", label: "Respiratory rate 16/min, brisk capillary refill, unable to follow commands (confused)", correctCategory: "immediate" },
      { id: "p5", label: "Respiratory rate 18/min, capillary refill 2 seconds, follows commands, unable to walk due to obvious lower leg deformity", correctCategory: "delayed" },
      { id: "p6", label: "Not breathing initially, resumes spontaneous breathing after one airway repositioning maneuver", correctCategory: "immediate" },
    ],
    explanation:
      "P1, walking with minor injuries, is Minor. P2's respiratory rate over 30/min makes them Immediate. P3 remains apneic and pulseless after repositioning, so Deceased/Expectant. P4 has normal breathing and perfusion but fails the mental status check (cannot follow commands), which makes them Immediate. P5 passes breathing, perfusion, and mental status checks but cannot walk due to an isolated injury, making them Delayed. P6 required an intervention (airway repositioning) to breathe at all, which makes them Immediate regardless of the current rate.",
  },
  {
    id:"paramedic-ops-4103",
    domain: "EMS Operations",
    level: "Paramedic",
    scenarioId: "scn-mci-overpass-01",
    scenarioStage: "post_scene",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "With 2 Immediate, 1 Delayed, and 3 Minor patients identified, and only 2 ALS ambulances currently on scene (with 2 more BLS units staged 4 minutes out), what is the most appropriate transport sequencing plan?",
    choices: [
      "Transport both Immediate patients first via the 2 ALS units, then use arriving BLS units for the Delayed and Minor patients",
      "Transport the 3 Minor patients first since they can be loaded and cleared quickly, freeing units sooner",
      "Wait until all 4 units are on scene before transporting anyone",
      "Transport the Delayed patient first because they have been waiting the longest for a triage decision",
    ],
    answerIndex: 0,
    explanation:
      "The two highest-acuity (Immediate) patients should receive the highest level of care and be transported first via the ALS units already on scene, while the arriving BLS units handle the lower-acuity Delayed and Minor patients — this matches resource capability to clinical need and doesn't delay the most time-critical patients. Prioritizing Minor patients for speed abandons patients with life-threatening conditions; waiting for all four units unnecessarily delays the Immediate patients who are already ready for transport; transporting the Delayed patient first based on wait time ignores acuity-based prioritization; and combining an Immediate and a Minor patient in one ALS unit divides that crew's attention away from the critical patient.",
  },
  {
    id:"paramedic-ops-4104",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "analyze_cues",
    question:
      "During a large public event, EMS notices a sudden cluster of over a dozen patients reporting simultaneous eye irritation, coughing, and difficulty breathing in one area of a crowd, with no obvious environmental cause visible. What should this pattern most strongly prompt?",
    choices: [
      "Considering a possible chemical or hazardous exposure event, initiating hazmat-informed precautions (isolate/evacuate upwind, request hazmat resources) rather than treating this as isolated individual medical complaints",
      "Treating each patient individually as an unrelated asthma exacerbation with no further investigation",
      "Assuming mass psychogenic illness immediately without any further assessment",
      "Ignoring the pattern since large crowds commonly report similar symptoms",
    ],
    answerIndex: 0,
    explanation:
      "A sudden cluster of similar respiratory/irritant symptoms in one crowd location, without an obvious cause, should raise strong suspicion for a chemical or hazardous exposure and prompt evacuation upwind and a hazmat-informed response, since assuming otherwise risks additional casualties including responders. Treating each patient as an isolated unrelated asthma case misses the pattern entirely; jumping to a psychogenic illness diagnosis without ruling out an actual exposure is premature and potentially dangerous; and dismissing a genuine symptom cluster as common crowd behavior ignores a legitimate mass-casualty warning sign.",
  },
  {
    id:"paramedic-ops-4105",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes the National Incident Management System (NIMS) in relation to ICS?",
    choices: [
      "NIMS is a broader nationwide framework for emergency management that incorporates ICS as its standardized on-scene incident management component",
      "NIMS and ICS are unrelated systems used by different countries",
      "NIMS applies only to federal agencies and never to local EMS",
      "NIMS replaced ICS and ICS is no longer used",
    ],
    answerIndex: 0,
    explanation:
      "NIMS is the comprehensive national framework for emergency management, and ICS is the standardized command structure NIMS uses for managing on-scene operations at incidents of any size or type. NIMS and ICS are directly related, not separate systems for different countries; NIMS applies broadly across federal, state, local, tribal, and private-sector responders, including local EMS; and ICS remains actively used as NIMS's core operational component, not something it replaced.",
  },
  {
    id:"paramedic-ops-4106",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A paramedic is asked by hospital administration to alter a patient care report after the fact to make a delayed response time look more favorable in the record. What is the correct response?",
    choices: [
      "Refuse the request, since falsifying a medical/legal document is illegal and unethical, and report the request per agency policy if appropriate",
      "Comply with the request since it was made by administration",
      "Make the change only if the patient outcome was ultimately good",
      "Delete the original report entirely and start over without documenting the change",
    ],
    answerIndex: 0,
    explanation:
      "A patient care report is a legal medical document; knowingly falsifying it, including altering timestamps to misrepresent response times, is both illegal and a serious ethical violation, regardless of who requests it, and the paramedic should refuse and report the request through appropriate channels. Complying simply because administration asked does not make falsification acceptable; a good outcome does not justify falsifying the record; and deleting/recreating the report without documentation compounds the problem by destroying the original record entirely.",
  },
  {
    id:"paramedic-ops-4107",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes 'substituted judgment' as applied to surrogate decision-making for an incapacitated patient?",
    choices: [
      "The surrogate makes the decision they believe the patient would have made based on the patient's known values and previously expressed wishes",
      "The surrogate makes whatever decision benefits themselves financially",
      "The surrogate is legally required to choose the most aggressive treatment available regardless of the patient's wishes",
      "The surrogate's decision is always overridden by EMS clinical judgment",
    ],
    answerIndex: 0,
    explanation:
      "Substituted judgment means a surrogate decision-maker attempts to decide as the incapacitated patient would have decided for themselves, based on the patient's known values, beliefs, and previously expressed wishes — not what the surrogate personally would prefer. It is not about the surrogate's own financial interest, it does not require choosing maximal aggressive treatment regardless of the patient's actual wishes, and a properly authorized surrogate's decision is not simply overridden by EMS at will.",
  },
  {
    id:"paramedic-ops-4108",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A paramedic is treating a critical patient when a family member on scene becomes verbally aggressive and physically blocks access to the patient. What is the most appropriate operational response?",
    choices: [
      "Request law enforcement assistance to manage the scene safety threat while continuing patient care as safely as possible",
      "Attempt to physically remove the family member without law enforcement support",
      "Leave the scene entirely without providing any care to avoid the conflict",
      "Argue with the family member to de-escalate through confrontation",
    ],
    answerIndex: 0,
    explanation:
      "When a bystander's behavior becomes a physical safety threat that blocks patient access, requesting law enforcement support is the appropriate operational response, allowing EMS to continue focusing on patient care as safely as the situation allows. Physically removing the family member without law enforcement risks injury and legal exposure for the paramedic; abandoning the scene entirely leaves a critical patient without care unnecessarily; and engaging in confrontational arguing is more likely to escalate than de-escalate the situation.",
  },
  {
    id:"paramedic-ops-4109",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Under most state EMS regulations, what is generally required for a paramedic to legally practice under a specific EMS agency or system?",
    choices: [
      "The paramedic must be affiliated with, and practicing under, a licensed physician medical director for that agency/system",
      "State certification alone, with no requirement for physician oversight",
      "A separate license for every single call type they might encounter",
      "Approval from the receiving hospital before every shift",
    ],
    answerIndex: 0,
    explanation:
      "Paramedic practice is delegated medical practice; a paramedic must be affiliated with a licensed physician medical director for the specific agency/system under whose protocols and authority they are practicing. State certification alone, without an agency medical director relationship, does not authorize practice; there is no requirement for a separate license per call type; and hospitals do not grant per-shift approval for paramedics to practice.",
  },
  {
    id:"paramedic-ops-4110",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "evaluation",
    question:
      "A paramedic is being credentialed to independently perform a new high-risk skill (surgical cricothyrotomy) recently added to their scope. Which quality process best ensures this skill is being performed safely and competently before full independent authorization?",
    choices: [
      "A structured skills verification/competency assessment process (supervised practice, skills testing, case review) determined by the medical director before granting independent authorization",
      "Allowing the paramedic to perform the skill on the next appropriate live patient with no prior verification",
      "Assuming competency automatically because the paramedic attended a lecture on the topic",
      "Requiring no additional verification since the paramedic is already certified at the paramedic level",
    ],
    answerIndex: 0,
    explanation:
      "For a new high-risk skill, medical directors typically require a structured competency verification process (supervised skill practice, testing, and ongoing case review) before granting independent authorization, ensuring genuine proficiency rather than assumed knowledge. Allowing unverified performance on a live patient risks patient harm from an unproven skill; a single lecture does not establish hands-on competency; and base-level paramedic certification does not automatically confer competency in every advanced skill an agency might add to scope.",
  },
  {
    id:"paramedic-ops-4111",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the role of the Public Information Officer (PIO) at a large-scale incident?",
    choices: [
      "To serve as the official point of contact for media and public information, ensuring accurate and coordinated messaging about the incident",
      "To provide medical treatment to media personnel on scene",
      "To manage the resource ordering process for the incident",
      "To determine the incident's overall tactical strategy",
    ],
    answerIndex: 0,
    explanation:
      "The PIO is the official conduit for media and public information, coordinating accurate, consistent messaging and protecting the operation from inaccurate or conflicting information reaching the public. Providing medical treatment is a separate operational/medical function, resource ordering is a Logistics function, and tactical strategy is determined by the Incident Commander and Operations Section.",
  },
  {
    id:"paramedic-ops-4112",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "A local news crew arrives on scene of a fatal MCI and attempts to interview responding paramedics directly for details about specific patients. What is the most appropriate response by crew members on scene?",
    choices: [
      "Politely decline to comment and direct the media to the Public Information Officer or established media point of contact",
      "Freely share detailed patient information since the incident is already public knowledge",
      "Physically block the camera crew and confiscate their equipment",
      "Provide only the patients' names but withhold their conditions",
    ],
    answerIndex: 0,
    explanation:
      "Individual responders should decline to give interviews or patient details and direct media inquiries to the PIO or designated point of contact, both to protect patient privacy/HIPAA obligations and to ensure consistent, accurate incident information. Freely sharing patient details violates patient privacy protections regardless of public interest in the incident; confiscating media equipment is an inappropriate and likely illegal response; and providing patient names, even without condition details, still violates patient confidentiality.",
  },
  {
    id:"paramedic-ops-4113",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best describes a 'strike team' in ICS resource terminology?",
    choices: [
      "A set of the same kind and type of resources, with common communications and a leader",
      "A single unit operating independently with no leader",
      "A group of mixed resource types assembled for a specific task",
      "The command post's administrative support staff",
    ],
    answerIndex: 0,
    explanation:
      "A strike team consists of a specified number of the same kind and type of resource (e.g., five ALS ambulances) with common communications and a designated leader. A single independent unit with no leader does not meet this definition; mixed resource types under one leader describes a task force instead; and administrative support staff at a command post is an unrelated concept.",
  },
  {
    id:"paramedic-ops-4114",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "generate_solutions",
    question:
      "An EMS system is developing its mass casualty incident plan and must decide how patients will be distributed among five receiving hospitals of varying size and capability. Which approach best reflects sound MCI destination planning?",
    choices: [
      "Pre-establish hospital capacity/capability data and a load-balancing protocol so patients are distributed according to real-time bed/resource availability and the severity/type of injury, coordinated through medical communications",
      "Send all patients to the single closest hospital regardless of its size or specialty capability",
      "Let each ambulance crew independently choose a hospital with no coordination or communication with other units",
      "Divide patients equally among the five hospitals regardless of severity or hospital capability",
    ],
    answerIndex: 0,
    explanation:
      "Effective MCI destination planning relies on pre-established knowledge of each hospital's capacity/capability along with real-time coordination (often through a medical communications/resource hospital) so patients are matched to appropriate facilities and no single hospital is overwhelmed. Sending everyone to the closest hospital risks overwhelming it while other capable facilities are underused; uncoordinated independent choices by each crew risk exactly that same maldistribution; and simple equal division ignores both patient severity/needs and each hospital's actual capability and capacity.",
  },
  {
    id:"paramedic-ops-4115",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A paramedic is dispatched to assist at a scene involving a school shooting with an active threat reportedly still present in the building. Law enforcement has not yet cleared the scene. What is the most appropriate initial action for arriving EMS?",
    choices: [
      "Stage at a safe distance until law enforcement declares the scene secure or establishes a warm zone with law enforcement escort, per active-threat/rescue task force protocols",
      "Enter the building immediately to begin treating victims as quickly as possible",
      "Wait indefinitely outside the perimeter with no communication with law enforcement",
      "Send an unarmed, unescorted EMT alone into the building to assess victims",
    ],
    answerIndex: 0,
    explanation:
      "In an active-threat incident, EMS should stage until law enforcement confirms the scene is secure or establishes a coordinated warm zone with law enforcement escort/rescue task force protocols, balancing the urgency of casualty care against provider safety in an unsecured hostile environment. Entering immediately without law enforcement clearance risks EMS becoming additional victims; staging with no communication at all wastes the coordination opportunity that active-threat protocols are built around; and sending any single provider in alone and unescorted, regardless of role, is contrary to established rescue task force safety principles.",
  },
  {
    id:"paramedic-ops-4116",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "What is the concept of a 'rescue task force' (RTF) in the context of active-threat incidents?",
    choices: [
      "A coordinated team pairing law enforcement force protection with EMS providers to enter a warm zone and provide care to victims before the scene is fully secured",
      "A law enforcement-only unit with no EMS involvement",
      "An EMS-only unit that enters hot zones without any law enforcement escort",
      "A dedicated unit solely responsible for building searches, not patient care",
    ],
    answerIndex: 0,
    explanation:
      "A rescue task force pairs armed law enforcement providing force protection with EMS personnel who enter the warm zone together to render care and begin extraction of victims before the entire scene is fully cleared, balancing speed of care against the residual threat. It is not law enforcement acting alone, EMS is never expected to enter a hot zone without law enforcement protection, and its explicit purpose includes patient care, not solely building searches.",
  },
  {
    id:"paramedic-ops-4117",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "take_action",
    question:
      "During a rescue task force operation, a paramedic identifies a victim with a life-threatening extremity hemorrhage in the warm zone. What is the most appropriate immediate action?",
    choices: [
      "Apply a tourniquet immediately using rapid hemorrhage control techniques, then move the patient to a casualty collection point for further care once feasible",
      "Perform a full, detailed secondary assessment before any intervention",
      "Delay all care until the patient can be moved to the cold zone",
      "Focus only on airway management and ignore the hemorrhage",
    ],
    answerIndex: 0,
    explanation:
      "In an active-threat/warm-zone environment, care follows a rapid, threat-focused approach (often based on frameworks like TCCC/MARCH) prioritizing immediate life-threatening hemorrhage control (e.g., tourniquet application) before moving to a safer area for further care — speed and simplicity are prioritized due to the ongoing threat. A full detailed secondary assessment in the warm zone delays critical hemorrhage control and prolongs exposure to danger; delaying all care until reaching the cold zone risks the patient exsanguinating; and ignoring an active life-threatening hemorrhage to focus solely on airway misprioritizes care in a trauma patient with catastrophic bleeding.",
  },
  {
    id:"paramedic-ops-4118",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following best distinguishes 'operations-level' hazmat training (as typically required for paramedics) from 'technician-level' training?",
    choices: [
      "Operations-level responders are trained to take defensive actions (isolate, deny entry, decontaminate patients in the warm/cold zone) without entering the hot zone, while technicians are trained for offensive, hot-zone entry and mitigation",
      "Operations-level responders are trained to enter the hot zone and stop the source of a leak, while technicians only observe from a distance",
      "There is no meaningful difference between the two training levels",
      "Operations-level training only applies to law enforcement, not EMS",
    ],
    answerIndex: 0,
    explanation:
      "Operations-level hazmat training (the typical standard for paramedics) prepares responders for defensive actions — isolating the area, denying entry, and performing patient decontamination in warm/cold zones — without hot-zone entry, while technician-level training prepares for offensive actions including hot-zone entry to control or stop the release itself. The choices reversing these roles, denying any meaningful distinction, or limiting operations-level training to law enforcement all misstate this well-established hazmat training hierarchy (which actually applies broadly, including to EMS).",
  },
  {
    id:"paramedic-ops-4119",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: true,
    clinicalJudgmentStep: "recognize_cues",
    question:
      "A paramedic notices that several colleagues at their agency openly joke in a dismissive way about a coworker who took extended leave after a difficult pediatric call, discouraging others from seeking similar support. What organizational factor does this behavior most directly reflect?",
    choices: [
      "Stigma around mental health/help-seeking within EMS culture, which is a known barrier to providers accessing needed support",
      "An appropriate and harmless expression of normal workplace humor with no meaningful impact",
      "Evidence that the coworker's leave was unjustified",
      "A sign that the agency's CISM program is functioning correctly",
    ],
    answerIndex: 0,
    explanation:
      "Dismissive joking about a colleague seeking mental health support reflects the well-documented stigma in EMS/first-responder culture that discourages help-seeking and contributes to underreported burnout, PTSD, and even increased suicide risk within the profession — it is a recognized organizational problem, not harmless banter. It says nothing about whether the coworker's leave was justified (an unrelated and inappropriate inference), and this behavior is the opposite of, not evidence for, a functioning CISM program.",
  },
  {
    id:"paramedic-ops-4120",
    domain: "EMS Operations",
    level: "Paramedic",
    blueprintCategory: "operations",
    clinicalJudgment: false,
    question:
      "Which of the following is a recognized evidence-based strategy for reducing burnout and improving long-term provider wellness in EMS agencies?",
    choices: [
      "Structured peer support programs, adequate staffing/rest between shifts, and normalized access to confidential mental health resources",
      "Encouraging providers to work as many overtime shifts as possible to increase income and reduce financial stress",
      "Discouraging any discussion of difficult calls to help providers 'move on' quickly",
      "Rotating providers to a new partner and unit every single shift with no continuity",
    ],
    answerIndex: 0,
    explanation:
      "Peer support programs, adequate rest/staffing, and normalized, confidential access to mental health resources are established, evidence-informed strategies for reducing burnout and supporting long-term wellness. Excessive overtime tends to worsen fatigue and burnout rather than help it despite the short-term financial benefit; suppressing discussion of difficult calls is associated with worse outcomes, not better coping; and constant partner/unit rotation removes the team continuity and trust that support effective peer relationships and CRM.",
  },
];
