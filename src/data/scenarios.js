// scenarios.js — plug-and-play scenario definitions.
//
// Each scenario names ONE `condition` from physio/conditions.js. That
// condition owns the starting vitals and the untreated disease course; you
// do not script vitals or their decay here. What you write per scenario:
//   dispatchNote   — one short line, becomes the dispatch call
//   condition      — key into CONDITIONS (physio/conditions.js)
//   patient        — optional overrides (age, weight, riskFactors, ptx...)
//   probes/micn/resolve — the teaching content, now free to read the live
//                          patient (s.patient.lactate, .coagPct, .consciousness,
//                          .brainInjury...) instead of guessing from flat vitals.
//   destSpecialty  — optional ("trauma" | "cardiac"): the specialty receiving
//                     center this presentation actually needs. See
//                     data/hospitals.js — every scenario gets the destination
//                     PICKER regardless; this only adds a debrief note when the
//                     chosen destination doesn't match. Unset means no opinion.
//   patients       — optional array (see physiology.js's roster/MCI support):
//                     [{id,role,name,condition,patient}], one entry per
//                     casualty instead of the single condition/patient pair.
export const SCEN = {

chest: {cat: "medical", id: "CHEST-002", pronouns: "she", title: "Female, 45. Chest pressure, breathlessness, back pain.",
  limit: 1700, transport: 600,
  bystanders: "Her husband is in the doorway, saying her name over and over.",
  units: [{at: 420, level: "emt", name: "Engine 51"}],
  dispatch: ["45F. Chest pressure and difficulty breathing.", "Conscious, speaking. Husband called.", "No cardiac history on file."],
  update: ["Husband now reports back pain as well."],
  impression: "Gray. Diaphoretic. Sitting bolt upright, both hands flat on her chest. She looks sick and she knows it.",
  imps: ["CPMI", "CPSC", "CPNC", "HOTN"],
  condition: "aorticDissection",
  patient: {age: 45},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It hit all at once — worst at the very first second, not building. Tearing, like something ripped. Right here" — she presses her sternum — "and it went straight THROUGH to my back. Ten out of ten. Twenty minutes ago. I was just sitting."', kind: "pt",
      evid: "OPQRST — sudden, maximal at onset, tearing, radiating to the back (dissection pattern).", find: "OPQRST: sudden, tearing, radiates to back, 10/10."}),
    sample: () => ({say: '"No allergies. I take a blood-pressure pill — I\'ll admit I skip it. High blood pressure, that\'s the only thing. Ate lunch a couple hours ago. I was just sitting on the couch when it started."', kind: "pt",
      evid: "SAMPLE — hypertensive, poorly controlled; a risk substrate for dissection.", find: "SAMPLE: NKDA, antihypertensive (poor adherence), HTN, last ate ~2h ago."}),
    history: () => ({say: '"It just hit. All at once. Like something tore."" She reaches behind her, between her shoulder blades. "It went straight through to HERE."', kind: "pt",
      evid: "OPQRST — sudden, maximal at onset, tearing, RADIATES to the back.", find: "Pain: sudden, tearing, radiating to back."}),
    heart: () => ({say: "A soft blowing murmur in diastole. Her husband says nobody has ever mentioned a murmur.", kind: "warn",
      evid: "New diastolic murmur — aortic regurgitation.", find: "Diastolic murmur, LSB."}),
    radL: () => ({say: "Nothing. You reposition your fingers. Still nothing.", kind: "warn",
      evid: "Absent left radial — pulse deficit.", find: "Pulse deficit: left radial absent."}),
  },
  micn: () => ({order: '"Copy. Forty-five, chest pressure — treat it as cardiac. Aspirin and nitro, Code 3. Anything else?"',
    correct: false, refuteKeys: ["differential", "tearing", "pulse deficit", "murmur"],
    onAccept: (n) => {n.doses = [...n.doses, {id: "nitro", at: n.t}]; n.given = {...n.given, nitro: 1}; n.badOrder = 1;
      return "You give the nitro. Because a doctor told you to.";},
    onRefuseYes: '"...Say again? A pressure differential? HOLD the nitro. Hold it. Fentanyl for the pain and take her to vascular — I want a CT the second she is through the door. Good catch."',
    onRefuseNo: '"Based on what, exactly? You have given me nothing but chest pain. If you have a finding, say what it is. Otherwise: nitro, and go."',
    onQuestion: '"I am going off what you gave me. If you have something that changes my mind, say it now."'}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const pat = s.patient;
    if (s.given.nitro) {died = 1; cause = "Nitroglycerin, into an aortic dissection. Her pressure was already falling from the tear and you took more off it. Fentanyl or morphine is preferred — lower the rate by treating the pain. Do not vasodilate them.";
      if (s.badOrder) notes.push("You gave it because a physician told you to. She was working from the report YOU gave her — and she never heard about a pressure differential, because you never took one. Base Contact is a consultation, not an abdication.");}
    else if (s.pi === "CPMI") {died = 1; cause = "You called a STEMI. She goes to a cath lab, where they will heparinise a dissecting aorta on arrival.";}
    if (!died && pat && pat.lactate > 4) notes.push(`Lactate climbing — ${pat.lactate.toFixed(1)}. That's the occult bleed catching up with her, whether or not the monitor is telling a dramatic story yet.`);
    if (s.refused) notes.push("You refused a physician's order and you were RIGHT — because you had a finding to refuse WITH. That is what the exam was for. Not for you. For this.");
    return {died, cause, notes, correct: s.pi === "CPSC", truth: "Acute aortic dissection"};},
},

resp: {cat: "medical", id: "RESP-007", pronouns: "they", title: "Patient, 70s. Short of breath. Cannot finish a sentence.",
  limit: 1200, transport: 480,
  bystanders: "A neighbour with a key let you in. She is hovering and she is not helping.",
  units: [{at: 360, level: "emr", name: "PD unit"}],
  dispatch: ["Difficulty breathing. Elderly patient.", "Caller says it's been getting worse all day."],
  update: ["Caller says the patient can barely talk now."],
  impression: "Tripoding at the edge of a chair. Working hard. Speaking in three-word bursts, and each burst costs something.",
  imps: ["SOBB", "CHFF", "RDOT", "RARF", "FEVR"],
  condition: "chf",
  patient: {age: 74},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    // F12: this scenario had only an informal "history" line and fell back
    // to the shared generic SAMPLE boilerplate — the exact "shared/generic
    // dialogue" the queue item asks to replace. opqrst/sample below are
    // unique to this patient (orthopnea/PND, cardiac med list, salt/fluid
    // non-compliance as the precipitant).
    opqrst: () => ({say: '"It\'s been building for two days, but tonight I had to sit up — three pillows, and I still woke up gasping. It\'s not a pain, it\'s just... I can\'t get air in. Sitting up like this is the only thing that helps even a little."', kind: "pt",
      evid: "OPQRST — gradual-onset dyspnea, orthopnea/PND, relieved only by sitting upright — left heart failure pattern.", find: "OPQRST: 2-day progressive dyspnea, 3-pillow orthopnea, PND, relieved by sitting up."}),
    sample: () => ({say: '"No allergies. Water pill, a blood pressure pill, and one for my heart — I think I missed a few doses this week. Heart failure, a stent years ago. I had Chinese takeout last night, lots of salt. Been so swollen the last few days I could barely get my shoes on."', kind: "pt",
      evid: "SAMPLE — diuretic/antihypertensive non-compliance plus a high-sodium meal, known CHF/CAD — classic decompensation trigger.", find: "SAMPLE: NKDA, diuretic+antihypertensive+cardiac med (partial non-compliance), CHF/CAD history, high-sodium meal, worsening edema."}),
    lungs: () => ({say: "Crackles. From the bases and climbing. Wet, all the way up.", kind: "warn",
      evid: "Bibasilar crackles ascending — pulmonary edema.", find: "Lungs: crackles to mid-zones."}),
    history: () => ({say: '"Three pillows... last night. Woke up... couldn\'t breathe."', kind: "pt",
      evid: "Orthopnea, three-pillow, PND — left heart failure.", find: "Hx: orthopnea, PND, CHF."}),
    skin: () => ({say: "Cool. Gray around the mouth.", find: "Skin cool, dusky."}),
    // pat.cvp is already live and read by the shared jvd default (actions.js)
    // — this override was frozen text on top of it. Nitro's real venodilation
    // (drugs.js's venousToneModifier -> cardiovascular.js's stressed volume)
    // genuinely lowers preload and CVP, and a wrong-move saline bolus (the
    // resolve() note below already calls this out) genuinely raises it —
    // measured against the real engine: untreated cvp ~12.8 (already
    // distended), one nitro dose brings it to ~5.8 (no JVD) by minute 10,
    // two salines push it to ~21.7 (markedly distended). Same >8/>12
    // thresholds the shared default uses.
    jvd: (s) => {const cvp = s.patient?.cvp ?? 4;
      if (cvp > 12) return {say: "Distended, standing out even sitting up.", kind: "warn", evid: "JVD present — right-sided backward failure.", find: `JVD present, markedly elevated (CVP ~${Math.round(cvp)}).`};
      if (cvp > 8) return {say: "Mildly full — visible but not the striking distension you'd expect from how hard she's working.", kind: "obs", evid: "Filling pressure elevated but not severely — improving or early.", find: `Mild JVD (CVP ~${Math.round(cvp)}).`};
      return {say: "No distension — the neck looks flat, whatever you did brought the filling pressure down.", find: `No JVD (CVP ~${Math.round(cvp)}).`};},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (s.doses.some(d => d.id === "cpap")) notes.push("CPAP. First line in pulmonary edema, and it decreases the risk of intubation.");
    else notes.push("No CPAP. It is first line in pulmonary edema and it keeps people off a ventilator.");
    if (s.given.albuterol && !s.doses.some(d => d.id === "cpap")) notes.push("You heard a wheeze and reached for albuterol. Wheeze CAN be pulmonary edema. Cardiac asthma. She did not need a bronchodilator, she needed her preload dropped.");
    if (s.given.saline >= 2) notes.push(`${(s.given.saline || 0) * 500} mL of fluid into a failing left ventricle. You added volume to a heart that could not move what it already had.`);
    if (!died && v.spo2 < 88 && s.committedAt > 500) notes.push(`You transported at ${v.spo2}%. She was hypoxic the whole way and you did not fix it.`);
    return {died, cause, notes, correct: s.pi === "CHFF", truth: "Acute pulmonary edema (CHF)"};},
},

pe: {cat: "medical", id: "PE-008", pronouns: "she", title: "Female, 75. Sudden right-sided chest pain and breathlessness.",
  limit: 1100, transport: 480,
  bystanders: "Her daughter is here. She has the discharge paperwork in her hand and she does not know it matters.",
  units: [],
  dispatch: ["75F. Chest pain and difficulty breathing.", "Sudden onset, per the daughter."],
  update: ["Daughter says she had surgery a few weeks ago."],
  impression: "Sitting forward, one hand on her right ribs. Every breath is short and it is short on purpose — it hurts to fill.",
  imps: ["RDOT", "CPSC", "CPNC", "SOBB", "RARF", "SHOK"],
  condition: "pe",
  patient: {age: 75},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    // F12: previously only an informal "history" line, so SAMPLE fell back to
    // the shared generic boilerplate. Unique to her: the surgical/immobility
    // history belongs in OPQRST's onset context here (it's WHY it started
    // suddenly), and SAMPLE carries the anticoagulation-compliance detail
    // that is the actual teaching point (a PE despite prophylaxis, because
    // she didn't take it).
    opqrst: () => ({say: '"It came on all at once, maybe an hour ago — sharp, right here" (points to the right ribs) "and it catches when I breathe in. Ten out of ten when I try to take a real breath. Nothing brings it on, nothing helps." Her daughter: "She had her hip done three weeks ago. She was supposed to be up walking and she just... wasn\'t."', kind: "pt",
      evid: "OPQRST — sudden-onset pleuritic chest pain, no exertional trigger, recent major orthopedic surgery with immobility (Virchow's triad).", find: "OPQRST: sudden onset ~1hr ago, sharp/pleuritic right-sided pain, 10/10, no relieving factor; recent hip arthroplasty + immobility."}),
    sample: () => ({say: '"No allergies. I have a blood thinner I\'m supposed to take since the surgery — I\'ll admit, I haven\'t always remembered it. No other real medical problems. I ate breakfast fine. It just started."', kind: "pt",
      evid: "SAMPLE — prescribed post-surgical anticoagulation with admitted non-compliance: the mechanism for a PE despite prophylaxis being ordered.", find: "SAMPLE: NKDA, prescribed post-op anticoagulant (inconsistent compliance), no other PMH, tolerating oral intake."}),
    lungs: () => ({say: "Clear. Both sides. Equal. Which is not what you expected, and it should bother you.",
      evid: "Lungs CLEAR bilaterally — with an SpO₂ that low. Ventilation is fine. Perfusion is not.", find: "Lungs clear."}),
    history: () => ({say: '"Hip replacement. Three weeks ago. I have been in the chair mostly." Her daughter says: "She was supposed to walk. She didn\'t walk."', kind: "pt",
      evid: "Recent hip surgery + immobility — Virchow's triad. Sudden pleuritic pain and hypoxia.", find: "Hx: hip arthroplasty 3/52, immobile."}),
    pedL: () => ({say: "That calf is bigger than the other one. Warm. Tender when you press it.", kind: "warn",
      evid: "Unilateral calf swelling and tenderness — DVT.", find: "L calf swollen, tender."}),
    etco2: () => ({say: "EtCO₂ is low. Much lower than the respiratory rate should allow.", kind: "warn",
      evid: "Low EtCO₂ despite tachypnea — dead-space ventilation. She is blowing off CO₂ into lung that has no blood in it.", find: "Low EtCO₂ with high RR."}),
  },
  micn: () => ({order: '"Chest pain in a 75-year-old — treat it as cardiac. Aspirin, nitro, and I want a 12-lead transmitted."',
    correct: false, refuteKeys: ["hip", "DVT", "calf", "clear", "dead-space", "Virchow"],
    onAccept: (n) => {n.badOrder = 1; return "Nitro. In a patient whose pressure is already low.";},
    onRefuseYes: '"Post-op hip, immobile, clear lungs, low EtCO₂ with a rate of thirty? That is a PE, not a coronary. Forget the nitro — she needs oxygen, volume, and a hospital that can lyse or thrombectomise. Go."',
    onRefuseNo: '"She is 75 with chest pain. Aspirin and nitro. Unless you have something."',
    onQuestion: '"Chest pain in the elderly is cardiac until proven otherwise. Prove otherwise."'}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (s.given.nitro || s.given.nitroOwn) notes.push("Nitroglycerin in a PE. She is preload-dependent — her right ventricle is straining against a clot and the only thing keeping her perfused is filling pressure. You took it away.");
    if (s.doses.some(d => d.id === "o2nrb")) notes.push("High-flow oxygen. It will not fix a shunt, but it is the only thing you have that touches it, and it buys her the transport.");
    if (s.refused) notes.push("You refused a physician's order, correctly, and you had the surgical history and the clear lung fields to refuse with. This is what the history was FOR.");
    if (s.badOrder) notes.push("You accepted nitro for a pulmonary embolism because a doctor said cardiac. The doctor could not hear her lungs. You could.");
    return {died, cause, notes, correct: s.pi === "RDOT", truth: "Pulmonary embolism"};},
},

fbao: {cat: "medical", id: "CHOKE-009", pronouns: "she", title: "Female, 56. Choking at a restaurant table.",
  limit: 600, transport: 300,
  bystanders: "Half the restaurant is standing. A man says he is a dentist and he keeps trying to reach into her mouth.",
  units: [{at: 200, level: "emt", name: "Engine 9"}],
  dispatch: ["Choking. Female, conscious on dispatch.", "Restaurant. Bystanders present."],
  update: ["Caller says she has stopped making any noise."],
  impression: "She is clutching her throat and she is not making a sound. Her lips are going. She looks straight at you, and then her eyes roll back and she goes down.",
  imps: ["CHOK", "RARF", "CANT"],
  condition: "fbao",
  patient: {age: 56},
  clothing: {dress: true, shoes: true},
  seed: () => ({cleared: 0, pushedDeeper: 0}),
  probes: {
    airwayLook: (s) => s.cleared ? {say: "Clear."} : {say: "You can see it. A pale wedge, right at the cords. You cannot reach it with a finger and you should not try.", kind: "crit",
      evid: "Visualised foreign body at the glottis — complete obstruction.", find: "FBAO, complete."},
    opqrst: () => ({say: "The dentist who tried to help: \"She was mid-bite, laughing at something, and then she just grabbed her throat. Couldn't make a sound. Went down maybe a minute ago.\"", kind: "pt",
      evid: "Witnessed sudden-onset choking on food, rapid progression to silent obstruction and collapse — the classic complete FBAO timeline, even with no personal history available.", find: "OPQRST (witnessed): sudden choking on food, <1 min to silent collapse."}),
    sample: () => ({say: "Nobody at the table is family — a stranger from a nearby booth speaks up: \"I don't know her. She was eating alone, I think. I never saw her take anything, no pills, nothing.\"", kind: "pt",
      evid: "No reliable collateral history for an unidentified patient — allergies and medications are unknown, not negative.", find: "SAMPLE: unobtainable — unidentified patient, no reliable collateral."}),
  },
  extra: [
    {id: "fingerSweep", region: "head", tab: "airway", label: "Blind finger sweep", gerund: "Sweeping the airway", cost: 20, lvl: 0, once: 1,
      run: (s) => {s.pushedDeeper = 1; return {say: "You put a finger in blind and you drive it further down. It is now past the cords and completely impacted. Never do that again.", kind: "crit"};}},
    {id: "clearFB", region: "head", tab: "airway", label: "Remove visualised obstruction (Magill)", gerund: "Laryngoscopy and extraction", cost: 60, lvl: 4, bag: "airway", once: 1,
      run: (s) => {if (s.pushedDeeper) return {say: "You can see it. It is past the cords now, wedged. The forceps will not reach.", kind: "crit"};
        s.cleared = 1; return {say: "Blade in, you see it, and the forceps take it out whole. Her chest rises on the first breath.", kind: "good"};}},
  ],
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const didCPR = s.doses.some(d => d.id === "cpr");
    if (!s.cleared && !died) {died = 1; cause = "You never cleared the airway. Nothing else you did could reach her.";}
    if (didCPR) notes.push("Compressions. NREMT 14898: when a completely obstructed patient goes unconscious, you START CHEST COMPRESSIONS. Not back blows. Not a finger sweep. They generate the airway pressure — they are the Heimlich, done properly, on someone who cannot stand up.");
    else notes.push("You did not do compressions. In a complete obstruction that goes unconscious, compressions ARE the maneuver — they raise intrathoracic pressure and they are the only thing that will move that bolus.");
    if (s.pushedDeeper) notes.push("You performed a blind finger sweep. It is contraindicated in every adult guideline on earth, for exactly the reason you just discovered.");
    return {died, cause, notes, correct: s.pi === "CHOK", truth: "Complete foreign body airway obstruction"};},
},

crush: {cat: "trauma", id: "CRUSH-001", pronouns: "he", injuries: ["legL", "legR"], title: "Male, 40s. Both legs pinned under a steel girder, five hours.",
  limit: 1600, transport: 540,
  bystanders: "Two of his workmates are standing at the edge of the light. Neither of them has said anything.",
  units: [{at: 300, level: "paramedic", name: "Medic 4"}],
  dispatch: ["Industrial site. Male trapped under a fallen steel girder.", "Fire on scene. Patient conscious."],
  update: ["Rescue says they can have it off him whenever you're ready."],
  impression: "Upright against a pallet, awake, tracking you. A girder across both thighs. He looks — and this is the problem — fine.",
  imps: ["TRMA", "HOTN", "SHOK", "DYSR"],
  condition: "crushSyndrome",
  patient: {age: 40},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({lifted: 0}),
  probes: {
    history: () => ({say: '"Since about three. Three in the morning." He checks your face when he says it. "I can\'t feel my legs. Haven\'t been able to for hours. I\'m really thirsty."', kind: "pt",
      evid: "Entrapped ~5 h, large muscle group — crush syndrome.", find: "Entrapped 5 h."}),
    sample: () => ({say: '"No allergies. No regular meds, no health problems that I know of. I ate before my shift started, hours ago now." He tries to shift his weight and cannot.', kind: "pt",
      evid: "SAMPLE — no antiplatelet/anticoagulant medication and no complicating comorbidity; a straightforward crush mechanism with nothing else muddying the picture.", find: "SAMPLE: NKDA, no medications, no prior history, last meal hours before entrapment."}),
  },
  micn: () => ({order: '"Crush syndrome, five hours — good. Two liters of saline wide open and get him out. I want him moving."',
    correct: false, refuteKeys: ["peaked T", "hyperkal", "Entrapped"],
    onAccept: (n) => {n.badOrder = 1; return "Two liters in, and they lift.";},
    onRefuseYes: '"Peaked T waves? Then STOP. Calcium first, one gram, slow. Then bicarb — and FLUSH between them. Albuterol continuous. THEN fluids. And nobody touches that girder until you tell me the calcium is in. I got ahead of myself. Thank you."',
    onRefuseNo: '"On what basis? You have not sent me an ECG. Fluids and extricate."',
    onQuestion: '"He needs volume before reperfusion. That is standard. What are you seeing that I am not?"'}),
  extra: [{id: "lift", region: "legL", tab: "procedures", label: "▲ Tell rescue to LIFT the girder", gerund: "They are lifting",
    cost: 45, lvl: 0, once: 1, commit: 1, run: (s) => {s.lifted = 1; s.liftedAt = s.t;
      return {say: "The girder comes up. He is talking to you. Color is coming back into his legs.", kind: "beat"};}}],
  resolve: (s, v, arr) => {const notes = [];
    if (!s.lifted) return {died: 1, notes, correct: 0, truth: "Crush syndrome", cause: "He was still under the girder when your scene time ran out."};
    let died = !!arr, cause = "";
    if (died) cause = `The rhythm went wide and sine-shaped after the lift, and then to nothing.\n\n${arr.story}\n\nThe drugs go in BEFORE release of the compressive force. Calcium first — it doesn't lower the potassium, it protects the heart from it.`;
    if (s.badOrder) notes.push("The physician told you to run fluids and extricate, and she was WRONG — and you did it anyway. She had no ECG because you never sent her one.");
    if (s.refused) notes.push("You pushed back on a physician and you were right. You had peaked T waves to push back WITH.");
    if (s.calcium && s.given.bicarb && !s.flushed) notes.push("Calcium and bicarb with no flush — they precipitate in the line.");
    if ((s.given.saline || 0) >= 4) notes.push(`${(s.given.saline || 0) * 500} mL of saline. His pH ended at ${v.ph}/1500 — hyperchloraemic acidosis. Plasma-Lyte costs almost none of that.`);
    return {died, cause, notes, correct: s.pi === "TRMA", truth: "Crush syndrome — hyperkalaemia on reperfusion"};},
},

od: {cat: "medical", id: "OD-003", pronouns: "he", hazard: "Uncapped needle on the tile beside him — sharps risk. Watch your hands.", title: "Male, 20s. Unresponsive, shallow breathing, cyanotic.",
  limit: 900, transport: 420, crimeSuspected: true,
  bystanders: "His friend is in the hallway. He called it in and now he cannot look at him.",
  units: [{at: 180, level: "emr", name: "PD"}],
  dispatch: ["Unresponsive male, possible overdose.", "Barely breathing per caller."],
  update: ["Caller says he is turning blue."],
  impression: "On the bathroom floor. Gray-blue at the mouth. Chest barely moving. A needle on the tile.",
  imps: ["ODPO", "RARF", "ALOC", "CANT"],
  condition: "opioidOD",
  patient: {age: 24},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({vomited: 0, aspirated: 0}),
  probes: {
    // Deliberately left static, not a miss: naloxone's real antagonist
    // mechanism (pk.js) only ever competes against an actual opioid drug
    // instance in pat.drugInstances, and this condition's overdose is a
    // scripted rrBase/hrBase baseline (conditions.js's opioidOD), not a real
    // opioid PK instance — so pat.opioidBlockade never rises here regardless
    // of treatment. Instrumented directly: rr/sao2/hr/opioidBlockade are
    // bit-for-bit identical with and without a naloxone dose. Reading a
    // field that provably never moves would be the exact "written, read,
    // and still inert" trap CLAUDE.md section 1 warns about — filed as
    // physiology queue item 37 instead of building a decorative probe
    // around it.
    pupils: () => ({say: "Pinpoint. Both.", kind: "warn", evid: "Pinpoint pupils.", find: "Pupils pinpoint."}),
    opqrst: () => ({say: 'You cannot get OPQRST from him — he is unresponsive. His friend: "He was fine an hour ago. I found him like this, blue, not really breathing."', kind: "pt",
      evid: "Unwitnessed onset within the last hour; found unresponsive and hypoventilating.", find: "OPQRST unobtainable (unresponsive); found down <1h, hypoventilating."}),
    sample: () => ({say: 'His friend: "He uses. He\'s got no allergies I know of, doesn\'t take any regular meds. I don\'t know when he last ate. There were pills on the table too."', kind: "pt",
      evid: "SAMPLE (collateral) — opioid use, possible co-ingestant (pills).", find: "SAMPLE: opioid use, NKDA, no meds, possible co-ingestant."}),
    history: () => ({say: 'His friend, from the doorway: "He took something. I don\'t know. There were pills too, not just — I don\'t know."', kind: "pt",
      evid: "POLYSUBSTANCE suspected — not opioid alone.", find: "Hx: multiple agents."}),
  },
  events: [{at: 150, fire: () => ({kind: "crit", set: {vomited: 1},
    text: "He vomits. It is coming up around whatever you have put in his mouth, and he is not protecting anything."})}],
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (s.aspirated) {died = 1; cause = "He aspirated. He vomited and you did not roll him first — you reached for the suction, or the airway, or the bag, and you drove it into his lungs.\n\nTHE AIRWAY MUST BE CLEAR BEFORE IT CAN BE MANAGED. Roll. Then suction. Then adjunct. Then ventilate. That order is not a preference.";}
    if (s.given.naloxone_in || s.given.naloxone_im || s.given.naloxone_iv) notes.push(s.bvm
      ? "Ventilations first, then naloxone — titrated to his breathing, not his eyes."
      : "Naloxone with no ventilation first. It worked, this time. VENTILATE FIRST.");
    if (!died && s.patient && s.patient.consciousness !== "awake") notes.push("He never came back up mentally the way his breathing did — hypoxic time has a cost even after you fix the airway.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "RARF", truth: "Polysubstance overdose with respiratory failure"};},
},

anaph: {cat: "medical", id: "ALLERGY-006", pronouns: "she", title: "Female, 20s. Ate something at a party. Cannot get a breath.",
  limit: 800, transport: 360,
  bystanders: "Four of her friends. One of them is holding her handbag and has not thought to look inside it.",
  units: [{at: 240, level: "emt", name: "Engine 9"}],
  dispatch: ["Allergic reaction. Female, difficulty breathing.", "Friends say she ate something with peanuts."],
  update: ["Caller says her face is swelling."],
  impression: "Bolt upright on a stool, hands on her knees, pulling for air. Her lips are thick. Hives across her chest, and she is scratching without noticing.",
  imps: ["ANPH", "ALRX", "RARF", "SHOK", "SOBB"],
  condition: "anaphylaxis",
  locWeights: {house: 5, business: 3, school: 1, park: 1},
  patient: {age: 22},
  clothing: {top: "short", bottom: "shorts", shoes: true},
  seed: () => ({}),
  probes: {
    // QUEUE ITEM 61: was a fixed, always-identical line regardless of
    // treatment — reads pat.angioedema live now, the same "live instrument
    // reading" pattern the lungs probe just below already established, so
    // a real (epi-treated) improvement is visible on re-exam instead of the
    // patient looking permanently swollen even after the drug worked.
    airwayLook: (s) => {
      const ae = s.patient?.angioedema ?? 0.35;
      if (ae > 0.5) return {say: "Her tongue is too big for her mouth. You can see the swelling from across the room.", kind: "crit",
        evid: "ANGIOEDEMA — airway involvement.", find: "Angioedema, tongue and lips, severe."};
      if (ae > 0.2) return {say: "Her lips and tongue are still visibly swollen, but less than before.", kind: "warn",
        evid: "Angioedema present, improving.", find: "Angioedema, tongue and lips, improving."};
      return {say: "The swelling in her lips and tongue has largely settled.", kind: "obs",
        evid: "Angioedema resolving with treatment.", find: "Angioedema resolving."};
    },
    // MEASURED, not scripted (see conditions.js anaphylaxis: pat.broncho
    // climbs 0.55->0.95 untreated). Reads pat.effectiveBroncho live so a
    // worsening or albuterol/epi-treated patient reads differently, matching
    // the toxicInhalationChlorine precedent (queue item F7).
    lungs: (s) => {
      const eb = s.patient?.effectiveBroncho ?? 0.55;
      if (eb > 0.75) return {say: "Wheeze everywhere — and it is getting quieter. A quiet chest is not improvement.", kind: "warn",
        evid: "Diffuse wheeze with falling air movement.", find: "Wheeze, poor entry."};
      if (eb > 0.4) return {say: "Diffuse wheeze, both sides, but air is still moving.", kind: "warn",
        evid: "Diffuse wheeze, air entry still present.", find: "Wheeze, fair air entry."};
      return {say: "Wheeze easing, air movement improving.", kind: "obs",
        evid: "Bronchospasm responding to treatment.", find: "Wheeze improving."};
    },
    opqrst: () => ({say: '"Started — minutes ago. Ate something. Throat — closing. Getting — worse — fast." She grabs at her neck.', kind: "pt",
      evid: "OPQRST — acute onset within minutes of ingestion, rapidly worsening airway/throat involvement.", find: "OPQRST: onset minutes post-ingestion, rapidly progressive, throat tightness."}),
    sample: () => ({say: '"Peanuts. Allergic. I have — a pen —" She points at her bag. Someone says she took nothing yet; she ate at the party a few minutes ago.', kind: "pt",
      evid: "SAMPLE — known peanut anaphylaxis, carries epinephrine auto-injector, exposure just now.", find: "SAMPLE: peanut allergy, epi auto-injector, ate at party min ago."}),
    history: () => ({say: '"Peanuts. I have — I have a pen —" She cannot finish it.', kind: "pt",
      evid: "Known anaphylaxis, prescribed auto-injector.", find: "Hx: anaphylaxis."}),
  },
  micn: () => ({order: '"Anaphylaxis — Benadryl and a steroid, and let us see where she is in ten minutes."',
    // "ANGIEDEMA" was a typo (missing the second O) that happened to match
    // an identical typo in the airwayLook probe's own evid string below —
    // both fixed to the correct spelling together (queue item 61), since
    // App.jsx's hasK() does a case-insensitive substring match against
    // collected evidence text and would otherwise silently stop matching.
    correct: false, refuteKeys: ["ANGIOEDEMA", "wheeze", "anaphylaxis"],
    onAccept: (n) => {n.badOrder = 1; return "You draw up diphenhydramine.";},
    onRefuseYes: '"Angioedema? Then epi. IM. Now. I should have led with that. Point five in the lateral thigh, repeat in ten. Benadryl and dex can follow. GO."',
    onRefuseNo: '"Benadryl and dexamethasone. That is the order."',
    onQuestion: '"Epi if she deteriorates. Antihistamine first."'}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const epi = s.given.epiIM || s.given.epiAuto || s.given.epiIV;
    if (!epi && !died && s.committedAt > 260) {died = 1; cause = "You transported an anaphylaxis with no epinephrine. Epinephrine IM is THE DRUG OF CHOICE. Nothing else is.";}
    if (s.given.diphen && !epi) notes.push("Diphenhydramine and no epinephrine. DIPHENHYDRAMINE DOES NOT TREAT ANAPHYLAXIS.");
    if (epi) notes.push("Epinephrine IM. Everything else on this call is a footnote to it.");
    if (s.badOrder) notes.push("A physician told you antihistamine and a steroid and ten minutes. You knew better. Base Contact is a consultation — the patient never becomes theirs.");
    if (s.refused) notes.push("You refused, correctly, and you had the angiedema to refuse with.");
    return {died, cause, notes, correct: s.pi === "ANPH", truth: "Anaphylaxis with airway involvement"};},
},

ami: {cat: "medical", id: "CARDIAC-010", pronouns: "he", title: "Male, 58. Crushing chest pain while shoveling snow.",
  limit: 1300, transport: 480,
  bystanders: "His wife made the call over his objections. She is standing behind him with her arms crossed.",
  units: [{at: 300, level: "emt", name: "Engine 22"}],
  dispatch: ["58M. Chest pain, onset with exertion.", "Wife reports he looks unwell — he insists it's nothing."],
  update: ["Wife says the pain hasn't let up at all."],
  impression: "Gray, sweating through his shirt in the cold. One fist pressed flat to his sternum. \"I'm fine. She overreacts.\"",
  imps: ["CPMI", "CPSC", "CPNC", "DYSR"],
  condition: "ami",
  // Queue item 93: infarctTerritory now set per scenario, feeding the real
  // 12-lead synthesis (twelveLead.js) and ECG readout (ecg.js) — without
  // this, every STEMI drew inferior by twelveLead.js's own fallback
  // default, regardless of the scenario's own presentation. Anterior is the
  // classic, most common, and most severe LAD-territory infarct, matching
  // this scenario's own crushing exertional pain radiating to the left arm
  // and jaw and its own comment above about backward heart-failure risk
  // once the infarct is large.
  patient: {age: 58, infarctTerritory: "anterior"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"Started shoveling — hit me like an elephant sat on my chest. Crushing. Goes down my left arm and into my jaw. Eight out of ten. Came on with the work, won\'t let up — maybe thirty minutes now."', kind: "pt",
      evid: "OPQRST — exertional, crushing substernal, radiates to left arm/jaw, ~30 min, unrelieved.", find: "OPQRST: exertional, crushing, radiates L arm/jaw, 8/10, ~30 min."}),
    sample: () => ({say: '"No allergies. Blood-pressure pill, a cholesterol pill, a baby aspirin. High blood pressure and cholesterol. Had breakfast. I was out shoveling when it started." His wife: "He gets short of breath on the stairs."', kind: "pt",
      evid: "SAMPLE — cardiac risk factors (HTN, hyperlipidaemia), exertional angina history.", find: "SAMPLE: NKDA, antihypertensive/statin/ASA, HTN + high cholesterol, exertional SOB."}),
    history: () => ({say: '"Started shoveling — hit me like an elephant sat on my chest. Goes down my left arm. Never had this before." His wife: "He gets short of breath on the stairs. He never mentioned it."', kind: "pt",
      evid: "OPQRST — exertional onset, crushing, radiates to left arm, new — classic cardiac pattern.", find: "Pain: crushing substernal, radiates L arm, exertional onset."}),
    skin: () => ({say: "Cool. Diaphoretic. Pale, despite the cold — this isn't just the weather.", kind: "warn",
      evid: "Diaphoresis out of proportion to ambient temperature — sympathetic surge.", find: "Skin cool, diaphoretic."}),
    heart: (s, v) => ({say: `Rate is ${v.hr}. Regular. No obvious murmur, but he won't sit still long enough for a clean listen.`, find: `Heart: regular, rate ${v.hr}, no murmur appreciated.`}),
  },
  micn: () => ({order: '"Fifty-eight, crushing exertional chest pain radiating to the arm — that\'s cardiac until proven otherwise. Aspirin, nitro if his pressure holds, and transmit that twelve-lead to the STEMI center. Minimize scene time."',
    correct: true, refuteKeys: [],
    onAccept: (n) => {n.given = {...n.given, nitro: 1}; return "Copy. Aspirin, nitro, twelve-lead transmitted — you're already moving.";},
    onRefuseYes: '"Refuse THIS? On what finding? Everything you\'ve given me says STEMI. Go."',
    onRefuseNo: '"Then go. Every minute on scene is muscle."',
    onQuestion: '"You have a textbook presentation and a hot twelve-lead. This isn\'t the call to slow down on."'}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const aspirin = s.given.aspirin, nitro = s.given.nitro || s.given.nitroOwn;
    if (!aspirin && !died) notes.push("No aspirin. 324 mg chewed, first-line, nearly free, and it changes outcomes.");
    if (!s.done?.ecgAcquire && !died) notes.push("No twelve-lead acquired. This diagnosis lives on the monitor — the history alone doesn't confirm it.");
    if (s.committedAt && s.committedAt > 700) notes.push("Long scene time for a STEMI — this is a 'load and go, treat en route' presentation, not a 'work it up on scene' one.");
    if (aspirin) notes.push("Aspirin given. Simple, fast, and it belongs on every cardiac chest pain that isn't actively bleeding.");
    // Other ACS-family scenarios in this file (nstemi, stableAngina, etc.)
    // also gate this on a nitroLow/systolic-under-100 death penalty. NOT
    // added here: this scenario's own MICN order's onAccept credits
    // n.given.nitro unconditionally on acceptance (see above), without
    // checking the patient's actual pressure at that moment, unlike those
    // other scenarios where nitro only ever comes from the player's own
    // independent drug-box action — reusing that penalty here would risk
    // killing a player for correctly accepting the standard order.
    if (nitro && !died) notes.push("Nitro given for the ischemia — lowers preload and wall stress, buying the myocardium time. Titrate to the pressure.");
    return {died, cause, notes, correct: s.pi === "CPMI", truth: "Acute myocardial infarction (STEMI)"};},
},

cardiogenicShock: {cat: "medical", id: "SHOCK-011", pronouns: "he", title: "Male, 68. Two days of worsening breathlessness, now weak and gray.",
  limit: 1300, transport: 480,
  bystanders: "His daughter found him like this on a wellness check. She's on the phone with the rest of the family, pacing.",
  units: [{at: 320, level: "emt", name: "Medic 14"}],
  dispatch: ["68M. Weak, short of breath, found by family.", "Daughter says he's been declining for two days."],
  update: ["Daughter says he had 'some kind of heart thing' a few years back."],
  impression: "Slumped in his recliner. Gray-blue lips, skin mottled at the knees. Answers slowly, like the words cost him something.",
  imps: ["SHOK", "HOTN", "CHFF", "CPMI"],
  // Ischemic cardiogenic shock: the pump-failure SYNDROME composed with the
  // coronary lesion that caused it. A non-ischemic cardiomyopathy or myocarditis
  // scenario would name cardiogenicShock alone (or with a different etiology).
  condition: ["cardiogenicShock", "coronaryArteryDisease"],
  patient: {age: 68},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    skin: () => ({say: "Cool from the knees down. Mottled, lace-like. Cap refill past four seconds.", kind: "crit",
      evid: "Peripheral mottling with delayed cap refill — poor peripheral perfusion, not just deconditioning.", find: "Skin cool, mottled, cap refill >4s."}),
    lungs: () => ({say: "Crackles, both bases, climbing.", kind: "warn",
      evid: "Bibasilar crackles — backward failure alongside the forward failure.", find: "Lungs: bibasilar crackles."}),
    // pat.cvp is already live and read by the shared jvd default (actions.js)
    // — this override was frozen text on top of it. This patient is
    // hypotensive (nitro's hold() blocks it below sbp 100, so it should not
    // reverse the finding here), but the wrong-move fluid bolus this
    // scenario's own micn() bad order pushes DOES raise it further, which
    // reinforces rather than undermines the teaching point (refuteKeys
    // already names "JVD" as the evidence against that order). Measured
    // against the real engine: untreated cvp ~21.6 (already severely
    // distended), two salines (the bad order) push it to ~28 (the ceiling).
    jvd: (s) => {const cvp = s.patient?.cvp ?? 4, fluidGiven = (s.given?.saline || 0) > 0;
      if (cvp > 12) return {say: fluidGiven ? "Distended right up to the jaw — worse than it was before that fluid went in." : "Distended, even sitting up.",
        kind: cvp > 18 ? "crit" : "warn", evid: "JVD despite upright positioning — a failing pump, not an empty tank.", find: `JVD present, ${cvp > 18 ? "severely" : ""} elevated (CVP ~${Math.round(cvp)}).`};
      return {say: "Mildly full, visible with him upright.", kind: "obs", evid: "Filling pressure elevated but not severely.", find: `Mild JVD (CVP ~${Math.round(cvp)}).`};},
    history: () => ({say: '"Chest pain, two days back. I figured it\'d pass." His daughter: "He never told any of us that."', kind: "pt",
      evid: "Unreported chest pain 2 days prior — likely the untreated infarct behind this.", find: "Hx: chest pain 48h ago, never reported."}),
    sample: () => ({say: "His daughter: \"He's on some kind of blood pressure pill and something for his cholesterol — I don't know the names. No allergies that I know of. He's barely eaten the last two days.\"", kind: "pt",
      evid: "SAMPLE — cardiac-adjacent medications and two days of poor intake alongside the unreported chest pain fit a slowly decompensating ischemic pump, not a sudden new insult.", find: "SAMPLE: BP/cholesterol medication (names unknown), NKDA, poor oral intake x2 days."}),
  },
  micn: () => ({order: '"Hypotensive and short of breath — that\'s volume down. Bolus a liter of normal saline and reassess."',
    correct: false, refuteKeys: ["crackles", "JVD", "mottled", "cardiogenic"],
    onAccept: (n) => {n.given = {...n.given, saline: (n.given.saline||0)+2}; n.badOrder = 1;
      return "A liter runs in. His lungs get louder while you watch.";},
    onRefuseYes: '"JVD and crackles with a hypotensive patient — that\'s a wet, failing pump, not an empty tank. Hold the fluid. Small pressor if you\'ve got one, CPAP if he tolerates it, and get him to a cath-capable center. Good catch."',
    onRefuseNo: '"He\'s hypotensive. That\'s volume. Bolus and reassess — those are your instructions."',
    onQuestion: '"Tell me what you\'re seeing that says otherwise, or the bolus stands."'}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const fluidMl = (s.given.saline || 0) * 500;
    if (fluidMl >= 1000 && !died) notes.push(`${fluidMl} mL into a pump that was already failing to empty — JVD and crackles were telling you the tank wasn't empty, the pump was. Volume made the pulmonary edema worse.`);
    if (s.refused) notes.push("You refused the fluid bolus, correctly, and you had the JVD and crackles to refuse with — cardiogenic, not hypovolaemic.");
    if (s.badOrder) notes.push("A physician called it volume-down from the pressure alone. You had the exam findings that said otherwise; Base Contact is a consultation, not an instruction to stop looking.");
    if (!died && v.spo2 < 90 && !s.doses.some(d => d.id === "cpap")) notes.push("No CPAP, and he stayed hypoxic. It's first-line in pulmonary edema, cardiogenic or not.");
    return {died, cause, notes, correct: s.pi === "SHOK", truth: "Cardiogenic shock (post-MI pump failure)"};},
},

// Septic shock as its own primary presentation (queue item 7's own
// suggested first-batch entity), distinct from pneumoniaSepsis (this file's
// existing sepsis condition, which is a respiratory-arrest call with septic
// shock as a secondary complication under days of illness). This patient
// presents mid-course: several hours of untreated urosepsis, already past
// the Sepsis-3 shock threshold, still in the hyperdynamic "warm shock" phase
// — the teaching point is recognizing distributive shock from fever +
// tachycardia + hypotension + WARM, FLUSHED skin (the opposite exam finding
// from the cool, clammy skin hypovolemic/cardiogenic shock produce), not a
// cold-shock arrest.
septicShock: {cat: "medical", id: "SHOCK-012", pronouns: "she", title: "Female, 61. Fever and confusion, found weak on the bathroom floor.",
  limit: 1300, transport: 480,
  bystanders: "Her husband found her like this and is standing in the doorway, badly frightened.",
  units: [{at: 340, level: "paramedic", name: "Medic 9"}],
  dispatch: ["61F. Fever, confusion, found on the floor.", "Husband says she's had flank pain and fever for two days."],
  update: ["Husband: \"She was fine yesterday evening, just tired. This morning she wasn't making sense.\""],
  impression: "On the bathroom floor, flushed and sweating, breathing fast. She answers but drifts off mid-sentence. Her skin is hot and surprisingly warm to the touch, not cool or clammy.",
  imps: ["SEPS", "FEVR", "SHOK", "HOTN", "ALOC"],
  condition: "septicShock",
  patient: {age: 61, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Husband: \"Two days of fever and pain in her right side, low back. She said it burned when she went to the bathroom. This morning I couldn't wake her up right.\"", kind: "pt",
      evid: "Two days of fever with flank pain and dysuria is a classic pyelonephritis history, the kind of untreated urinary source that progresses to septic shock over hours to days — and the new confusion this morning is the shock itself arriving.", find: "Hx (collateral): 2 days fever + flank pain/dysuria, new confusion this morning."}),
    sample: () => ({say: "Husband: \"No allergies. She takes a pill for her thyroid, nothing else. No other health problems — she's never been sick like this.\"", kind: "pt",
      evid: "No prior chronic illness to explain the presentation any other way, and no medications that would cause this — an untreated infection is the whole story.", find: "SAMPLE: NKDA, levothyroxine only, no other history."}),
    skin: (s, v) => ({say: `Hot and flushed, sweating. ${v.sbp < 100 ? "Cap refill is actually fairly brisk despite how low that pressure is." : "Cap refill brisk."}`, kind: "crit",
      evid: "WARM, flushed skin with a low pressure is the specific sign that separates distributive (septic) shock from hypovolemic or cardiogenic shock, where the skin would be cool and clammy from peripheral vasoconstriction — here the vessels are pathologically DILATED, not clamped down.", find: "Skin hot, flushed, diaphoretic; brisk cap refill despite hypotension."}),
    heart: (s, v) => ({say: `Fast and bounding. Pressure reads ${v.sbp}/${v.dbp}, pulse pressure wide.`, find: `Heart: tachycardic, bounding pulses. BP ${v.sbp}/${v.dbp}.`}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const fluidL = (s.given.saline || 0) * 0.5 + (s.given.plasmalyte || 0) * 0.5;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Untreated septic shock: the vasodilation and capillary leak this process drives keep eroding pressure faster than the field can keep up with, and nothing here holds it back on its own.";
    notes.push("Fever, new confusion, and hypotension with WARM, flushed skin (not the cool, clammy skin of hypovolemic or cardiogenic shock) is the pattern to recognize: distributive shock from an infection, not an empty tank or a failing pump.");
    if (fluidL >= 1) notes.push("Aggressive crystalloid was the right first move — early fluid resuscitation is the single highest-yield field intervention in septic shock, matching how this call actually responds to it.");
    else notes.push("No meaningful fluid resuscitation given. Septic shock is a fluid-responsive process, at least early on, and this call needed volume as the first move, not just rapid transport.");
    if (s.given.norepi) notes.push("A pressor is the correct SECOND-line move here (this box's own norepi is labeled first-line for septic shock) once fluids alone aren't holding a MAP — good escalation, not a substitute for the fluid.");
    notes.push("There is no field antibiotic and no field source control in this box — the fever, the confusion and the falling pressure all trace back to an infection nothing here can cure. The job is recognizing it fast, running volume, considering a pressor if trained and equipped for one, and getting her to a facility that can give antibiotics and find the source.");
    return {died, cause, notes, correct: s.pi === "SEPS" || s.pi === "SHOK", truth: "Septic shock (urosepsis source), hyperdynamic/warm phase"};},
},

takotsubo: {cat: "medical", id: "STRS-011B", pronouns: "she", title: "Female, 68. Crushing chest pain and breathlessness an hour after her husband's funeral.",
  limit: 1500, transport: 540,
  bystanders: "Her son is beside her, still in a dark suit. 'She collapsed at the reception. She keeps saying it's just grief.'",
  units: [{at: 360, level: "emt", name: "Medic 9"}],
  dispatch: ["68F. Chest pain, short of breath, at a funeral reception.", "Son reports she went pale and clutched her chest."],
  update: ["Son says she has no heart history — 'she's never been sick a day.'"],
  impression: "Sitting bolt upright, gray and sweating, a hand pressed flat to her sternum. She apologizes for the fuss between breaths.",
  imps: ["CPMI", "CHFF", "HOTN", "ANXY"],
  // Takotsubo alone: clean coronaries, so NO coronaryArteryDisease etiology is
  // composed. That absence is the whole point — the ECG and troponin will look
  // like an anterior STEMI, but the pump failure here is catecholamine stunning,
  // and the standard cardiogenic-shock inotrope makes it WORSE.
  condition: ["takotsubo"],
  patient: {age: 68, sex: "F"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    history: () => ({say: '"No heart problems, no. My husband\u2019s funeral was this morning." Her son: "Fifty-one years. She found him."', kind: "pt",
      evid: "Intense emotional trigger and no cardiac history \u2014 the classic takotsubo setup, though it cannot be distinguished from ACS in the field.", find: "Hx: no cardiac history; acute severe emotional stressor."}),
    sample: () => ({say: '"No medications \u2014 I\u2019ve never needed any. No allergies. I had a little toast this morning, before... before the service." Her son: "She really hasn\u2019t been sick a day in her life."', kind: "pt",
      evid: "SAMPLE \u2014 no prior cardiac medication and a clean history reinforce the absence of underlying coronary disease; the trigger here is emotional, not pharmacologic or dietary.", find: "SAMPLE: NKDA, no medications, light oral intake this morning, no prior medical history."}),
    ecg: () => ({say: "ST elevation across the anterior leads. Looks like a big anterior STEMI.", kind: "crit",
      evid: "Anterior ST elevation \u2014 indistinguishable from STEMI prehospital. Takotsubo mimics it exactly; the diagnosis is made at angiography, not on scene.", find: "ECG: anterior ST elevation."}),
    lungs: () => ({say: "Crackles creeping up from both bases.", kind: "warn",
      evid: "Pulmonary congestion from the acute drop in LV function.", find: "Lungs: bibasilar crackles."}),
  },
  // The trap: a physician, hearing 'hypotensive STEMI-pattern pump failure,'
  // reaches for the standard inotrope. In takotsubo that deepens the stunning.
  micn: () => ({order: '"STEMI pattern, hypotensive, poor output \u2014 start an epinephrine infusion to hold her pressure until the cath lab."',
    correct: false, refuteKeys: ["takotsubo", "stress", "catecholamine", "grief", "emotional", "no history"],
    onAccept: (n) => {n.given = {...n.given, pushEpi: (n.given.pushEpi||0)+1}; n.badOrder = 1;
      return "The epinephrine runs in. Her pressure flickers up, then her output sags further and the crackles climb.";},
    onRefuseYes: '"Good \u2014 in stress cardiomyopathy the catecholamines are the problem, not the fix. An inotrope feeds the same surge that stunned the ventricle. Support gently, avoid the pressor if you can, and get her to a cath-capable center to rule in the diagnosis."',
    onRefuseNo: '"She\u2019s hypotensive with a failing pump. Epinephrine buys pressure. Start it \u2014 those are your instructions."',
    onQuestion: '"If you think a catecholamine is the wrong call here, tell me why, or the order stands."'}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveCatechol = s.doses.some(d => ["pushEpi", "epi", "dobutamine", "norepi"].includes(d.id));
    if (gaveCatechol) notes.push("You gave a catecholamine to a takotsubo ventricle. Exogenous adrenergic drive deepens the same Gs\u2192Gi stunning that caused the syndrome \u2014 the one class of drug that reliably makes it worse. It could not be diagnosed on scene, but recognizing the emotional trigger and clean history should raise the possibility and stay your hand.");
    if (s.badOrder) notes.push("A physician ordered epinephrine from the STEMI pattern. You had the trigger and the absent history to push back with; Base Contact is a consultation, not a reason to stop thinking.");
    if (!died && s.refused) notes.push("You held the catecholamine, correctly. Takotsubo can't be confirmed prehospital, but 'clean history plus a devastating emotional trigger' is exactly when to be cautious with adrenergic support.");
    return {died, cause, notes, correct: s.pi === "CPMI", truth: "Takotsubo (stress) cardiomyopathy"};},
},

svt: {cat: "medical", id: "SVT-012", pronouns: "she", title: "Female, 24. Sudden racing heartbeat, otherwise feels healthy.",
  limit: 1100, transport: 420,
  bystanders: "Her roommate is more panicked than she is, hovering with a phone in each hand.",
  units: [],
  dispatch: ["24F. Palpitations, sudden onset.", "Conscious, alert, talking on the phone with dispatch herself."],
  update: ["Caller states it has not let up in twenty minutes."],
  impression: "Sitting upright on the couch, one hand pressed to her chest. Alert, anxious, talking in full sentences — scared, not sick-looking.",
  imps: ["DYSR", "CPNC", "SOBB"],
  condition: "svt",
  patient: {age: 24},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    history: () => ({say: '"It just started. I was just sitting here. No pain, just — I can feel my heart going way too fast. This happened once before, years ago, it stopped on its own." No chest pain, no cardiac history, no medications.', kind: "pt",
      evid: "Sudden-onset regular palpitations, prior self-terminating episode, no structural heart disease reported — classic reentrant SVT.", find: "Hx: sudden palpitations, prior similar episode, no cardiac hx."}),
    sample: () => ({say: '"No allergies. I don\'t take anything regularly — maybe a multivitamin. No health problems. I had lunch about an hour ago. I was just getting up from my desk when it started."', kind: "pt",
      evid: "SAMPLE — no stimulant or medication trigger, no structural heart disease, well otherwise; supports a primary reentrant arrhythmia over a secondary cause.", find: "SAMPLE: NKDA, no regular medications, well otherwise, recent meal, no clear trigger."}),
    // Vagal maneuvers/adenosine/cardioversion all set pat.rhythm back to
    // "sinus" for real (pk.js rhythmFix "svt"/"cardiovert") — reading it
    // live means a re-probe after a successful conversion shows the actual
    // converted rhythm instead of "still racing" forever.
    heart: (s, v) => v.rhythm === "svt"
      ? {say: "Fast. Very fast. Regular as a metronome — no irregularity to it at all.", find: "Heart: rapid, regular, no ectopy appreciated."}
      : {say: `Regular now, rate ${v.hr} — whatever you did converted it.`, kind: "obs", find: `Heart: converted to sinus rhythm, rate ${v.hr}.`},
    skin: () => ({say: "Warm, dry, well perfused. She looks anxious, not shocky.", find: "Skin warm, dry, normal perfusion."}),
  },
  micn: () => ({order: '"Rate that high, go straight to synchronised cardioversion."',
    correct: false, refuteKeys: ["stable", "alert", "warm", "vagal", "adenosine"],
    onAccept: (n) => {n.badOrder = 1; return "You reach for the pads on an awake, talking patient.";},
    onRefuseYes: '"She\'s stable? Alert, warm, talking? Then you have time — Valsalva first, adenosine if that fails. Cardioversion is for when she isn\'t stable anymore, not before you\'ve tried anything else. Good call."',
    onRefuseNo: '"Rate like that, I want it converted. Pads on."',
    onQuestion: '"Tell me her pressure and mental status, or the order stands."'}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const shocked = s.doses.some(d => ["cardiovert","defib"].includes(d.id));
    const triedVagal = s.doses.some(d => d.id === "valsalva");
    const triedAdenosine = s.given.adenosine;
    if (shocked && !triedVagal && !triedAdenosine && !died) notes.push("Straight to a synchronised shock on an awake, stable patient, with nothing tried first. Vagal maneuvers, then adenosine, are the stepwise approach for STABLE SVT. Cardioversion is for when that stability is gone.");
    if (triedVagal) notes.push("Valsalva attempted first — free, fast, and exactly where stable SVT starts.");
    if (triedAdenosine) notes.push("Adenosine given. Correct next step when vagal maneuvers don't break it.");
    if (s.badOrder) notes.push("A physician jumped straight to cardioversion. You had a stable, awake patient to refuse that order with.");
    if (s.refused) notes.push("You refused, correctly, and you had her stability to refuse it with.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Supraventricular tachycardia (stable)"};},
},

fall: {cat: "trauma", id: "TRMA-011", pronouns: "he", title: "Male, 24. Fall from a roof. Not moving.",
  limit: 1200, transport: 480, destSpecialty: "trauma",
  bystanders: "A co-worker is shouting from the scaffolding that he 'just dropped — three storeys, maybe more.'",
  units: [{at: 300, level: "paramedic", name: "Medic 8"}],
  dispatch: ["24M, fall from a roof — approximately three storeys.", "Not moving. Co-workers with him.", "Scene reported safe; ladder crew staged."],
  update: ["Co-worker now says he 'was breathing funny, and now he's barely breathing at all.'"],
  impression: "Crumpled on the concrete. A widening pool under the right thigh. His chest is barely moving and what movement there is looks one-sided. He does not respond to you.",
  imps: ["TRMA", "SHOK", "HOTN", "RARF", "ALOC"],
  condition: "polytraumaFall",
  // Hard constraint, not a soft weight: a scaffolding/roof fall onto a
  // construction site is flatly not a house/park/school placement, however
  // small the fallback weight — src/mapGraph.js's pickIncidentBuilding
  // filters the candidate set down to this list before drawing.
  locConstraints: ["business"],
  patient: {age: 24},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    history: () => ({say: "No history to be had from him. A co-worker: \"He was up fixing flashing. He just... came off. Landed on the rebar stack and then the slab.\"", kind: "pt",
      evid: "High-energy fall onto rebar — penetrating chest + blunt polytrauma.", find: "~3-storey fall onto rebar."}),
    sample: () => ({say: "The co-worker, still shaking: \"I don't know if he's on anything. I don't even know his last name, we just started on this crew together.\"", kind: "pt",
      evid: "No reliable SAMPLE history available from an unresponsive patient with no meaningful collateral — treat allergies and medications as unknown, not negative.", find: "SAMPLE: unobtainable — unresponsive, no reliable collateral."}),
    lungs: () => ({say: "Right chest silent. Left, some air movement. The right side is hyperresonant and the trachea is not quite midline.", kind: "crit",
      evid: "Unilateral absent breath sounds, hyperresonance, tracheal shift — tension pneumothorax.", find: "Tension pneumothorax (R)."}),
    // Was a static "already blown" finding regardless of treatment — the
    // shared default pupils action (F9's first batch) reads pat.icp>25 for
    // exactly this reason. polytraumaFall's own icp genuinely crosses 25
    // by ~minute 4 untreated (measured: 25.1 at t=240s, climbing to 33.7 by
    // t=780s) and holds flat at ~23.9 for the whole call when decompressed +
    // ventilated + hemorrhage-controlled within the first minute — a real,
    // two-sided, treatment-responsive signal, not a fixed severity.
    pupils: (s) => (s.patient?.icp || 10) > 25
      ? {say: "Left pupil blown and sluggish. Right reactive.", kind: "crit",
        evid: "Unequal pupils — rising ICP / TBI.", find: "Anisocoria — TBI."}
      : {say: "Equal, but a touch sluggish to react. Nothing dramatic yet.", kind: "warn",
        evid: "Early TBI sign on a still-untreated apnoeic head injury — the trend is up, not down, if the airway and breathing aren't addressed.", find: "Pupils sluggish, equal — not yet anisocoric."},
    skin: () => ({say: "Gray. Cold. The pool under his leg is still spreading.", kind: "crit",
      evid: "Class III–IV hemorrhagic shock from the femoral wound.", find: "Uncontrolled arterial bleeding, R thigh."}),
  },
  micn: () => ({order: "\"Roof fall, unresponsive — load and go. Two large-bore IVs en route, and let's get some fluid running. What's the pressure?\"",
    correct: false, refuteKeys: ["tension", "hyperresonance", "tracheal", "decompress", "tourniquet", "hemorrhage", "bleeding"],
    onAccept: (n) => {n.badOrder = 1; return "Copy — you package for a fast transport.";},
    onRefuseYes: "\"A tension? Then decompress it before you move him — needle the second intercostal or let the medics do it on contact. And that thigh gets a tourniquet NOW, not en route. Go.\"",
    onRefuseNo: "\"Then what am I missing? Give me a finding, not a mechanism.\"",
    onQuestion: "\"Fluids don't fix a hole in the chest or a bleeding artery. If you've found either, say so.\""}),
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    const tq = (s.doses.some(d=>d.id==="tq")?1:0) + (s.done.pack || 0) + (s.done.directPressure || 0) + (s.done.reboa || 0);
    const decompressed = (s.done.needleD || 0) + (s.done.chestTube || 0);
    const ventilated = (s.done.bvm || 0) + (s.done.ett || 0) + (s.done.sga || 0) + (s.done.vent || 0) + (s.done.mouthMask || 0);
    let died = !!arr, cause = arr?.story || "";
    if (arr) {
      cause = `${arr.story}\n\n` + (!decompressed
        ? "The tension pneumothorax was never decompressed. It obstructed his venous return until his output failed — a needle in the right hand of a paramedic reverses this in seconds."
        : !tq
        ? "The chest came up but the thigh kept bleeding. Hemorrhage control and decompression are BOTH the priority — one without the other still loses him."
        : "Even with the chest and the thigh addressed, the blood already lost and the head injury carried him past the point of return. Faster is the whole game here.");
    }
    if (!died && !decompressed && (pat?.ptx === "tptx")) notes.push("He is alive but his chest is still under tension. That is a paramedic skill — if it is out of your scope, your job was to recognize it out loud and get ALS to his side fast.");
    if (tq) notes.push("Tourniquet on the arterial bleed, and it is in every scope, EMR included. High and tight, and note the time.");
    else notes.push("No tourniquet. The single most survivable thing on this scene was the artery in his leg, and it went uncontrolled.");
    if (decompressed) notes.push("Needle decompression — you (or the medics) took the tension off. That is the intervention that bought his pressure back.");
    if (ventilated) notes.push("You supported his breathing. A head-injured apnoeic patient dies of hypoxia and hypercarbia long before anything else — you took that off the table.");
    else notes.push("He was barely breathing and nobody bagged him. Hypoxia and rising CO2 widen every brain injury there is.");
    if (s.given.naloxone_in || s.given.naloxone_im || s.given.naloxone_iv) notes.push("Naloxone. This is a fall from a roof, not an overdose — the apnea is a crushed chest and a broken brain, and naloxone does nothing for either.");
    return {died, cause, notes, correct: s.pi === "TRMA", truth: "Polytrauma — tension pneumothorax, arterial hemorrhage, TBI"};},
},

childbirth: {cat: "trauma", id: "OBGY-004", pronouns: "she", title: "Female, 30. Struck as a pedestrian. Pregnant, and crowning.",
  limit: 1500, transport: 540,
  bystanders: "A bystander is on her knees beside the woman, holding her hand, telling her the baby is coming.",
  units: [{at: 360, level: "paramedic", name: "Medic 3"}],
  dispatch: ["30F, pedestrian struck at low speed.", "Reportedly ~36 weeks pregnant.", "Bystander says she is 'having the baby right now.'"],
  update: ["Bystander: \"I can see the head. It's coming!\""],
  impression: "On her back on the sidewalk, gravid to term, in obvious pain. Bruising across the abdomen from the impact. She is pale and tachycardic — and the perineum is crowning.",
  imps: ["TRMA", "SHOK", "HOTN", "ALOC"],
  condition: "traumaPregnant",
  locOnStreet: true,
  patient: {age: 30},
  clothing: {top: "long", bottom: "skirt", shoes: false},
  seed: () => ({leftLateralTilt: 0, neoDelivered: 0}),
  probes: {
    history: () => ({say: "\"Thirty-six weeks... the car clipped me... please, the baby—\" She grips the ground. Another contraction.", kind: "pt",
      evid: "Term pregnancy + blunt trauma + active labor. Two patients.", find: "36 wks, blunt trauma, active labor."}),
    sample: () => ({say: '"No allergies. Just my prenatal vitamins. I\'m healthy, this is my first baby." Another contraction hits before she can say more.', kind: "pt",
      evid: "SAMPLE — no medications beyond prenatal vitamins and no reported pregnancy complications; the trauma is superimposed on an otherwise unremarkable pregnancy.", find: "SAMPLE: NKDA, prenatal vitamins only, primigravida, 36 weeks."}),
    skin: () => ({say: "Pale, cool, sweating. Heart running fast.", kind: "warn",
      evid: "Supine hypotension of pregnancy — the uterus is on the vena cava.", find: "Pale, tachycardic — supine hypotension."}),
    abdo: () => ({say: "Term uterus, firm, tender where the bumper caught her. Tightening with the contractions.", kind: "warn",
      evid: "Gravid uterus + seat-of-impact bruising; abruption risk.", find: "Gravid, tender uterus; contracting."}),
  },
  micn: () => ({order: "\"Trauma in a term pregnancy — get her flat and immobilised on the board and transport. Fluids wide open.\"",
    correct: false, refuteKeys: ["tilt", "left lateral", "vena cava", "supine", "displace", "delivering", "crowning"],
    onAccept: (n) => {n.badOrder = 1; return "You start to strap her flat to the board.";},
    onRefuseYes: "\"You're right — flat on her back drops a term uterus onto the cava. Tilt the board left, or displace the uterus manually, and be ready to catch this baby. Good.\"",
    onRefuseNo: "\"Standard trauma packaging is flat. Tell me why you'd deviate.\"",
    onQuestion: "\"If there's a reason not to lay her flat, name it — otherwise board her and go.\""}),
  extra: [
    {id: "tilt", region: "abdo", tab: "procedures", label: "◧ Left-lateral tilt / manual uterine displacement", gerund: "Displacing the uterus left",
      cost: 15, lvl: 0, once: 1, run: (s) => {s.leftLateralTilt = 1;
        return {say: "You wedge her left, off the great vessels. Her color improves almost at once — the pressure came off the vena cava.", kind: "beat"};}},
    {id: "nbDry", region: "torso", tab: "procedures", label: "🍼 Dry & stimulate the newborn", gerund: "Drying and stimulating the newborn",
      cost: 15, lvl: 0, run: (s) => {const nb = s._roster?.find(e => e.id === "newborn")?.patient;
        if (!nb) return {say: "No baby yet — she hasn't delivered.", kind: "obs"};
        nb._neo = nb._neo || {}; nb._neo.stimulated = true;
        const hr = Math.round(nb.hr || 0);
        return {say: `You dry the baby vigorously and flick the soles. Newborn heart rate ${hr}. ${hr < 100 ? "Still slow, still floppy — this baby is not responding to stimulation alone." : "Color and tone improving."}`, kind: hr < 100 ? "warn" : "beat"};}},
    {id: "nbBag", region: "torso", tab: "procedures", label: "🫁 Bag the newborn (PPV, room air→O2)", gerund: "Bagging the newborn",
      cost: 20, lvl: 0, run: (s) => {const nb = s._roster?.find(e => e.id === "newborn")?.patient;
        if (!nb) return {say: "No baby yet.", kind: "obs"};
        nb._neo = nb._neo || {}; nb._neo.ppv = true;
        return {say: "You seal the mask and deliver positive-pressure breaths at about 40 a minute. This — ventilation — is the single intervention a depressed newborn needs.", kind: "beat"};}},
    {id: "nbComp", region: "torso", tab: "procedures", label: "🤲 Newborn chest compressions (3:1 with PPV)", gerund: "Compressing the newborn",
      cost: 20, lvl: 0, run: (s) => {const nb = s._roster?.find(e => e.id === "newborn")?.patient;
        if (!nb) return {say: "No baby yet.", kind: "obs"};
        nb._neo = nb._neo || {};
        if (!nb._neo.ppv) return {say: "Compressions without ventilation, in a newborn? Their arrests are hypoxic. Ventilate FIRST — compressions are only added if the heart rate stays under 60 DESPITE good PPV.", kind: "crit"};
        nb._neo.compressions = true;
        return {say: "3:1 compressions coordinated with the bag.", kind: "beat"};}},
    // Queue item 65 — real NRP epinephrine indication, weight-scaled
    // against the newborn's own weight (App.jsx's t.neoAction==="epi"
    // shares this exact mechanism, gated the same way).
    {id: "nbEpi", region: "torso", tab: "procedures", label: "💉 Newborn epinephrine (weight-scaled IV/IO)", gerund: "Giving newborn epinephrine",
      cost: 20, lvl: 4, run: (s) => {const nb = s._roster?.find(e => e.id === "newborn")?.patient;
        if (!nb) return {say: "No baby yet.", kind: "obs"};
        nb._neo = nb._neo || {};
        if (!nb._neo.compressions) return {say: "Not yet — this needs effective PPV and compressions first. Epinephrine is for a heart rate still under 60 DESPITE that.", kind: "crit"};
        const wt = nb.weight || 3.3, mg = Math.round(wt * 0.01 * 1000) / 1000;
        nb._neo.epi = true;
        return {say: `${mg} mg IV/IO — 0.01 mg/kg against a ${wt} kg newborn, not a flat adult dose.`, kind: "beat"};}},
  ],
  resolve: (s, v, arr) => {const notes = [];
    const nb = s._roster?.find(e => e.id === "newborn")?.patient;
    let died = !!arr, cause = arr?.story || "";
    // Mother scoring
    if (s.leftLateralTilt) notes.push("Left-lateral tilt / uterine displacement — you took the uterus off the vena cava and her pressure answered. In a term pregnant trauma patient this comes BEFORE you accept the low blood pressure as blood loss.");
    else notes.push("She was left flat. A term uterus on the vena cava can drop cardiac output by a third — the fix is free, and it is position.");
    // Newborn scoring
    if (nb) {
      const nbHr = Math.round(nb.hr || 0);
      const vig = nb._neo?.vigor ?? 0;
      if (!nb._neo?.ppv && vig < 0.5) {
        notes.push(`The newborn delivered depressed — apnoeic, heart rate under 100 — and was never ventilated. Final newborn heart rate ${nbHr}. A depressed newborn needs PPV within the first minute; drying alone will not do it.`);
        if (!died) { died = 0; } // mother may survive; newborn outcome noted
        notes.push("NEWBORN OUTCOME: poor. This was a savable baby lost to a missing bag-mask.");
      } else if (nb._neo?.ppv && nbHr >= 100) {
        notes.push(`You resuscitated the newborn — PPV brought the heart rate up to ${nbHr}, pink and moving. That is the NRP inverted pyramid working exactly as intended: warm, dry, stimulate, and when that isn't enough, ventilate.`);
      } else if (nb._neo?.ppv) {
        notes.push(`Newborn heart rate ${nbHr} — coming up on PPV but not there yet; keep bagging and reassess every 30 seconds.`);
      }
    } else {
      notes.push("She never delivered within your scene time — reassess whether crowning meant delivery was imminent and you should have been set up to catch.");
    }
    if (arr) cause = `${arr.story}\n\nEven with two patients, the mother is the newborn's life support — her position, her pressure, and rapid transport are the priority that also saves the baby.`;
    return {died, cause, notes, correct: s.pi === "TRMA", truth: "Trauma in pregnancy with precipitous delivery of a depressed newborn"};},
},

motorcycle: {cat: "trauma", id: "TRMA-014", pronouns: "he", title: "Male, 30. Motorcycle versus car. Thrown.",
  limit: 1080, transport: 420, destSpecialty: "trauma",
  bystanders: "A driver stands at the roadside with both hands on his head, repeating that the bike 'came out of nowhere.'",
  units: [{at: 240, level: "paramedic", name: "Medic 12"}],
  dispatch: ["30M, motorcycle vs car, rider thrown.", "Helmet on. Not moving.", "Heavy bleeding reported from one leg."],
  update: ["First responder: \"His breathing's getting worse and I can hear air sucking at his chest.\""],
  impression: "Face-down and then logrolled: an open, deformed thigh in a spreading pool, a chest wound that sucks with every shallow breath, and a scalp laid open. He responds only to pain, and he is slipping.",
  imps: ["TRMA", "SHOK", "HOTN", "RARF", "CANT"],
  condition: "polytraumaMoto",
  // "Motorcycle versus car" cannot plausibly happen inside a building —
  // placed at a random point along a real street edge (weighted toward
  // arterial/highway) instead of at a building's node.
  locOnStreet: true,
  patient: {age: 30},
  clothing: {top: "jacket", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    history: () => ({say: "Nothing from him — he groans to a sternal rub and no more. The bystander: \"He flew off and hit the guardrail, then the road.\"", kind: "pt",
      evid: "High-energy ejection — assume multi-system trauma.", find: "Ejected rider, GCS low."}),
    sample: () => ({say: "The driver who hit him doesn't know him at all — no collateral history to be had. \"I have no idea who he is. I just saw the bike go down.\"", kind: "pt",
      evid: "No collateral SAMPLE history available — an unresponsive, unidentified rider with no known allergies or medications.", find: "SAMPLE: unobtainable — unresponsive, no reliable collateral."}),
    lungs: () => ({say: "Air moving through the wound itself on the right with every breath — a sucking chest wound. Breath sounds down on that side.", kind: "crit",
      evid: "Open pneumothorax ('sucking chest wound') — needs an occlusive/vented seal.", find: "Open chest wound (R)."}),
    skin: () => ({say: "Gray, cold, soaked. The thigh is still pumping.", kind: "crit",
      evid: "Decompensated hemorrhagic shock.", find: "Arterial thigh bleed; Class IV shock."}),
    // polytraumaMoto does NOT share polytraumaFall's icp dynamics (F9 —
    // measured separately, not assumed): its brainInjury baseline is lower
    // and paco2 trends toward hyperventilation rather than apnea/hypercapnia,
    // so untreated icp never reaches the shared >25 default's threshold —
    // it climbs only to ~23.8 by t=1080s (the scenario's own scene limit),
    // vs. holding flat at ~13-14 when decompressed/ventilated/hemorrhage-
    // controlled early. Reusing the >25 threshold verbatim would have made
    // this scenario's exam ALWAYS report "no TBI" — wired to a lower,
    // measured threshold (>18) that actually separates the two trajectories
    // instead (untreated crosses it around t=780-900s; treated never does).
    pupils: (s) => (s.patient?.icp || 10) > 18
      ? {say: "Sluggish, and now clearly unequal — worse than it was a few minutes ago.", kind: "crit",
        evid: "Rising ICP on top of the shock, worsening rather than static.", find: "Anisocoria, worsening — TBI."}
      : {say: "Sluggish, and a touch unequal.", kind: "warn", evid: "TBI on top of the shock.", find: "TBI features."},
  },
  micn: () => ({order: "\"Sounds like a bad one. If he arrests, work the code — epi and compressions. Transport when you have a rhythm.\"",
    correct: false, refuteKeys: ["hemorrhage", "bleeding", "tourniquet", "hypovol", "volume", "seal", "sucking", "transport now", "blood"],
    onAccept: (n) => {n.badOrder = 1; return "Copy — you set up for a standard arrest algorithm.";},
    onRefuseYes: "\"You're right — if he codes here it's from blood loss, not a heart problem. This is a traumatic arrest: stop the bleeding, seal the chest, ventilate, and move — epinephrine and standing on a lifeless PEA won't fix an empty tank. Go.\"",
    onRefuseNo: "\"An arrest is an arrest. What would you do differently?\"",
    onQuestion: "\"If you think this arrest is different from a medical one, tell me why.\""}),
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    const tq = (s.doses.some(d=>d.id==="tq")?1:0) + (s.done.pack || 0) + (s.done.directPressure || 0) + (s.done.reboa || 0);
    const seal = (s.done.chestSeal || 0) + (s.done.needleD || 0) + (s.done.chestTube || 0);
    const ventilated = (s.done.bvm || 0) + (s.done.ett || 0) + (s.done.sga || 0) + (s.done.vent || 0);
    const epiOnly = s.given.epiIV && !tq;
    let died = !!arr, cause = arr?.story || "";
    if (!arr && pat && ["PEA", "asystole"].includes(pat.rhythm)) { died = 1; }
    if (died) {
      cause = (arr?.story ? arr.story + "\n\n" : "") + (!tq
        ? "He arrested from exsanguination and the artery was never controlled. In a traumatic arrest, hemorrhage control IS the resuscitation — a tourniquet does more than any drug in the box."
        : "You controlled the bleeding, but too late, or without the chest and the breathing — a traumatic PEA needs volume, decompression and ventilation together, and above all speed to a surgeon.");
      if (epiOnly) cause += "\n\nEpinephrine went in but the tank was empty. You cannot pressurise a circuit with no fluid in it.";
    }
    if (tq) notes.push("Tourniquet — the highest-yield thing on this call, and in every scope.");
    else notes.push("No tourniquet on a pumping arterial bleed. This is where the patient was lost or saved.");
    if (seal) notes.push("You addressed the open chest — a vented seal (or decompression) keeps the sucking wound from becoming a tension.");
    else notes.push("The sucking chest wound went unsealed; open, it impairs ventilation, and sealed wrong, it tensions.");
    if (ventilated) notes.push("Ventilatory support given — appropriate for his depressed GCS and the chest injury.");
    if (s.pi === "CANT") notes.push("You called this a non-traumatic cardiac arrest. It is the opposite: the heart is fine, the tank is empty. The label changes the whole algorithm.");
    return {died, cause, notes, correct: s.pi === "TRMA" || s.pi === "SHOK", truth: "Hypovolaemic (traumatic) arrest — hemorrhage, open chest, TBI"};},
},

drowning: {cat: "trauma", id: "PEDS-006", pronouns: "they", title: "Child, 3. Pulled from a pool. Not breathing.",
  limit: 900, transport: 420,
  bystanders: "The mother is screaming. A neighbour who pulled the child out is doing nothing, frozen, dripping wet.",
  units: [{at: 240, level: "paramedic", name: "Medic 5"}],
  dispatch: ["3-year-old, pulled from a backyard pool.", "Not breathing, per caller.", "Unknown submersion time."],
  update: ["Caller: \"She's blue around the lips and she won't wake up.\""],
  impression: "Limp and dusky on the pool deck, water on her lips, a slow gasp every so often that moves no air. Cool to the touch. Her heart, when you feel for it, is there — but slow.",
  imps: ["RARF", "ALOC", "CHOK", "SHOK", "CANT"],
  condition: "pediatricDrowning",
  // "Backyard pool" — hard constraint, not just a bias: a private
  // backyard-pool submersion is flatly a house placement.
  locConstraints: ["house"],
  patient: {age: 3, weight: 15},
  clothing: {top: "short", bottom: "shorts", shoes: false},
  seed: () => ({}),
  probes: {
    history: () => ({say: "The mother, between sobs: \"She was by the pool — I turned around for a minute — I don't know how long she was under.\"", kind: "pt",
      evid: "Pediatric submersion; hypoxic (asphyxial) mechanism.", find: "Unwitnessed submersion, 3 yo."}),
    sample: () => ({say: "The mother, still sobbing: \"No allergies, no medicines, she's never been sick a day. She had lunch not long before this — maybe an hour ago.\"", kind: "pt",
      evid: "SAMPLE (collateral) — a healthy child on no medications with recent oral intake; a pure asphyxial submersion with nothing else complicating it.", find: "SAMPLE: NKDA, no medications, well otherwise, last meal ~1h prior."}),
    lungs: () => ({say: "Wet crackles throughout. Poor air movement even when you look for it.", kind: "crit",
      evid: "Aspiration / pulmonary edema of submersion — a shunt.", find: "Diffuse crackles; poor air entry."}),
    cyan: () => ({say: "Dusky lips and nail beds. Central cyanosis.", kind: "crit", evid: "Central cyanosis — profound hypoxemia.", find: "Central cyanosis."}),
    skin: () => ({say: "Cool and mottled. She came out of cold water.", kind: "warn", evid: "Hypothermia — but oxygen comes first.", find: "Cool, mottled; hypothermic."}),
  },
  micn: () => ({order: "\"Peds submersion, unresponsive — if that heart rate keeps dropping, start compressions and give epi. Transport Code 3.\"",
    correct: false, refuteKeys: ["ventilate", "bag", "oxygen", "breaths", "airway", "hypoxic", "PPV", "PALS"],
    onAccept: (n) => {n.badOrder = 1; return "Copy — you get ready to work it as an arrest.";},
    onRefuseYes: "\"You're right — in a child, the heart is slow BECAUSE she's hypoxic. Open the airway and BAG her. Ventilation is the treatment; the bradycardia follows the oxygen back up. If it stays under 60 after good breaths, then compressions.\"",
    onRefuseNo: "\"Her rate is dropping. Why wouldn't we compress?\"",
    onQuestion: "\"Tell me the pediatric arrest sequence and where you'd start.\""}),
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    const ventilated = (s.done.bvm || 0) + (s.done.ett || 0) + (s.done.sga || 0) + (s.done.mouthMask || 0) + (s.done.mouthMouth || 0) + (s.done.vent || 0) + (s.done.cpap || 0);
    let died = !!arr, cause = arr?.story || "";
    if (!arr && pat && ((pat.sao2 || 100) < 60 || ["PEA", "asystole"].includes(pat.rhythm))) died = 1;
    if (died) {
      cause = (arr?.story ? arr.story + "\n\n" : "") + (!ventilated
        ? "She was never effectively ventilated. A drowning child arrests from hypoxia — the heart slows because the blood has no oxygen in it. Bag-mask ventilation is THE intervention; without it nothing else matters."
        : "Ventilation started too late — the hypoxic bradycardia had already deepened toward arrest. In pediatric submersion, the bag comes out first, fast.");
    }
    if (ventilated) notes.push("You ventilated her. That is the whole ball game in a pediatric drowning — oxygen in, and the heart rate climbs back on its own.");
    else notes.push("No effective ventilation. Everything downstream — the bradycardia, the arrest — flows from that one missing thing.");
    if (s.done.suction && ventilated) notes.push("Suction then ventilate — reasonable when there's water and vomit in the airway.");
    if ((s.given.epiIV || s.doses?.some?.(d => d.id === "cpr")) && !ventilated) notes.push("Compressions and epinephrine before ventilation, in a hypoxic child. PALS is explicit: this arrest is respiratory in origin — restore oxygen first.");
    if (s.pi === "CANT") notes.push("Labeled a cardiac arrest. It's a respiratory one — the distinction is the entire treatment plan.");
    if (!died && pat && pat.coreTemp < 35) notes.push("She's hypothermic from the cold water. Keep resuscitating and rewarm — cold-water submersion in children can have strikingly good outcomes even after long downtimes. Don't stop early.");
    return {died, cause, notes, correct: s.pi === "RARF", truth: "Pediatric submersion — hypoxic respiratory arrest"};},
},


// ─── Added scenarios (NREMT-style medical & trauma) ───────────────────────

bikeVsCar: {cat: "trauma", id: "TRMA-020", pronouns: "he", title: "Male, 25. Bicycle versus car, thrown, unhelmeted.",
  limit: 1080, transport: 420, destSpecialty: "trauma",
  bystanders: "A bystander is kneeling by the bike, waving you over. 'He got thrown — he was talking, now he's not.'",
  units: [{at: 300, level: "paramedic", name: "Medic 2"}],
  dispatch: ["25M, bicycle vs car ~25 mph, patient thrown.", "No helmet. Bleeding from a leg and the chest.", "Now reported unresponsive."],
  update: ["Engine 4 first responder: \"His breathing's gone shallow and there's a wound on his chest.\""],
  impression: "Supine in the roadway. An obvious right femur deformity with bright red pooling under the thigh, a penetrating wound to the left chest that bubbles, and shallow breathing. He responds to pain only, and he is fading.",
  imps: ["TRMA", "SHOK", "HOTN", "RARF", "CANT"],
  condition: "polytraumaFall",
  locOnStreet: true,
  patient: {age: 25, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "You can't get OPQRST — he's barely responsive. Bystander: \"Car clipped him, maybe twenty-five miles an hour, threw him a good ways. No helmet.\"", kind: "pt",
      evid: "High-energy mechanism, unhelmeted, now obtunded — assume multi-system trauma + TBI.", find: "OPQRST unobtainable; high-energy ejection, unhelmeted."}),
    sample: () => ({say: "Bystander: \"I don't know him. No medic-alert I can see, no idea about allergies or meds.\"", kind: "pt",
      evid: "No collateral history available — treat empirically.", find: "SAMPLE: unknown; no medical ID."}),
    lungs: () => ({say: "Left chest wound draws air on inspiration; breath sounds fading on the left and going hyperresonant. Trachea starting to pull to the right.", kind: "crit",
      evid: "Penetrating chest → developing tension pneumothorax. Needs a seal and decompression.", find: "Penetrating chest wound, tensioning (L)."}),
    skin: () => ({say: "Cool, pale, soaked. The thigh is still pumping bright red.", kind: "crit",
      evid: "Decompensated hemorrhagic shock from an arterial thigh bleed.", find: "Arterial femoral bleed; Class III–IV shock."}),
    // Same shared polytraumaFall icp mechanism the `fall` scenario's own
    // pupils probe now reads live (F9) — see that scenario's comment for
    // the measured numbers (untreated crosses 25 by ~minute 4; holds ~23.9
    // when decompressed/ventilated/hemorrhage-controlled early).
    pupils: (s) => (s.patient?.icp || 10) > 25
      ? {say: "Unequal, one blown and sluggish now.", kind: "crit",
        evid: "Unequal pupils — rising ICP / TBI.", find: "Anisocoria — TBI."}
      : {say: "Sluggish, but still equal and round for now.", kind: "warn",
        evid: "Early TBI sign layered on the shock — the trend is up if the tension chest and the bleed aren't addressed.", find: "Pupils sluggish, equal — not yet anisocoric."},
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    const bleedCtrl = (s.doses.some(d=>d.id==="tq")?1:0) + (s.done.pack || 0) + (s.done.directPressure || 0);
    const chest = (s.done.chestSeal || 0) + (s.done.needleD || 0) + (s.done.chestTube || 0);
    const vent = (s.done.bvm || 0) + (s.done.ett || 0) + (s.done.sga || 0) + (s.done.mouthMask || 0);
    let died = !!arr, cause = arr?.story || "";
    if (!arr && pat && ["PEA", "asystole"].includes(pat.rhythm)) died = 1;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + (!bleedCtrl
      ? "He bled out from an uncontrolled arterial thigh bleed. In a traumatic arrest, hemorrhage control IS the resuscitation — a tourniquet outranks anything in the drug box."
      : "Bleeding was addressed, but the tension chest and the breathing weren't handled together, or not in time. A traumatic PEA needs decompression, ventilation, volume and speed to a surgeon.");
    notes.push(bleedCtrl ? "Tourniquet / direct pressure on the arterial bleed — the single highest-yield action here." : "The pumping arterial bleed was never controlled. This is where he was lost or saved.");
    notes.push(chest ? "You addressed the penetrating chest — a vented seal, then decompression as it tensions." : "The penetrating chest wound went unmanaged; it seals itself into a tension pneumothorax.");
    if (vent) notes.push("Ventilatory support given for the shallow breathing and depressed GCS — appropriate.");
    if (s.pi === "CANT") notes.push("You called a non-traumatic cardiac arrest. It's the opposite — empty tank and a tension chest, not a primary cardiac event.");
    return {died, cause, notes, correct: s.pi === "TRMA" || s.pi === "SHOK", truth: "Multi-system trauma — arterial hemorrhage, tension pneumothorax, TBI"};},
},

chestPainM: {cat: "medical", id: "CARD-021", pronouns: "he", title: "Male, 54. Chest tightness and shortness of breath.",
  limit: 1500, transport: 600, destSpecialty: "cardiac",
  bystanders: "His wife hovers in the kitchen doorway. \"He had a heart attack two years ago. He won't sit still.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 7"}],
  dispatch: ["54M, chest tightness and trouble breathing, 20 minutes.", "Started while watching TV.", "Prior cardiac history."],
  update: ["Wife: \"He's sweating through his shirt now.\""],
  impression: "Sitting upright, anxious, one hand on his chest. Pale and diaphoretic. He looks unwell and he knows it.",
  imps: ["CPMI", "CPSC", "CPNC", "DYSR"],
  condition: "ami",
  // Queue item 93: this scenario's own resolve() text already teaches the
  // classic "preload-dependent infarct (think inferior/RV)" nitro-caution
  // point — infarctTerritory:"inferior" makes the real 12-lead synthesis
  // (twelveLead.js) agree with that already-authored teaching text instead
  // of drawing an unrelated territory.
  patient: {age: 54, gender: "male", infarctTerritory: "inferior"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Came on while I was just sitting there. Pressure — right here — going into my left arm. Six out of ten, maybe more now. Twenty minutes, and it won't quit.\"", kind: "pt",
      evid: "OPQRST — substernal pressure, radiates to left arm, unrelieved, ~20 min.", find: "OPQRST: substernal pressure, radiates L arm, 6/10, 20 min."}),
    sample: () => ({say: "\"No allergies. Nitro, aspirin, a blood-pressure pill, a statin. Heart attack two years ago. Ate a while ago. I was just watching TV.\" Last nitro over a day ago.", kind: "pt",
      evid: "SAMPLE — prior MI, on nitrate/ASA/antihypertensive/statin; classic cardiac risk.", find: "SAMPLE: NKDA, cardiac meds, prior MI, last nitro >24h."}),
    heart: (s, v) => ({say: `Regular. You count it at ${v.hr}. No murmur you can hear over his breathing.`, find: `Heart: regular, rate ${v.hr}, no murmur appreciated.`}),
    lungs: () => ({say: "Clear, bilaterally — for now.", kind: "obs", evid: "No pulmonary edema yet — a large infarct hasn't dropped the EF yet.", find: "Lungs clear."}),
    skin: () => ({say: "Cool, pale, wet.", kind: "warn", evid: "Sympathetic surge / early pump strain.", find: "Cool, diaphoretic."}),
  },
  micn: () => ({order: "\"Fifty-four, chest pressure, cardiac history — aspirin, oxygen if he's hypoxic, and assist his nitro if his pressure holds. Twelve-lead and transmit. ALS intercept.\"",
    correct: true,
    onAccept: () => "Copy — aspirin, careful nitro, twelve-lead, ALS.",
    onQuestion: "\"Aspirin, twelve-lead, and nitro only if the pressure tolerates it. What's his pressure?\""}),
  resolve: (s, v, arr) => {const notes = [];
    let died = !!arr, cause = arr?.story || "";
    const nitroLow = s.given.nitro && (v.sbp < 100);
    if (nitroLow) {died = 1; cause = "You gave nitroglycerin with a systolic under 100. In a preload-dependent infarct (think inferior/RV), nitro drops an already marginal filling pressure and the pressure collapses. Confirm the pressure — and the rhythm — before the nitro.";}
    if (died && !nitroLow) cause = (arr?.story ? arr.story + "\n\n" : "") + "He arrested — likely a lethal dysrhythmia off the ischemic myocardium. Early aspirin, oxygen only if hypoxic, a twelve-lead transmitted, and a fast ALS handoff are the wins here.";
    if (s.given.aspirin) notes.push("Aspirin — the single highest-yield drug in ACS. Chewed, early."); else notes.push("No aspirin given. It's the highest-yield ACS intervention and it was indicated.");
    if (s.given.nitro && !nitroLow) notes.push("Nitro assisted with an adequate pressure — reasonable for ongoing ischemic pain.");
    if (s.done.ecgAcquire) notes.push("Twelve-lead obtained — the difference between a STEMI going to a cath lab and one that doesn't."); else notes.push("No twelve-lead. Acquisition (and transmission) is how this patient reaches the right destination.");
    return {died, cause, notes, correct: s.pi === "CPMI" || s.pi === "CPSC", truth: "Acute coronary syndrome (STEMI)"};},
},

chestPainF: {cat: "medical", id: "CARD-022", pronouns: "she", title: "Female, 54. Chest tightness and shortness of breath.",
  limit: 1500, transport: 600, destSpecialty: "cardiac",
  bystanders: "Her spouse met you at the door. \"She said her chest felt tight and she couldn't catch her breath.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 7"}],
  dispatch: ["54F, chest tightness and difficulty breathing.", "Spouse called. Scene is safe."],
  update: ["Spouse: \"She's gone quiet and sweaty.\""],
  impression: "Upright, anxious, working to breathe. Pale and diaphoretic. Women often describe it as pressure, fatigue, or breathlessness rather than crushing pain — take it just as seriously.",
  imps: ["CPMI", "CPSC", "CPNC", "DYSR"],
  condition: "ami",
  // Queue item 93: a lateral-territory infarct, deliberately DIFFERENT from
  // chestPainM's own inferior one — both share the `ami` condition, so
  // without a per-scenario override every STEMI in this game would draw
  // identically (twelveLead.js's own inferior fallback). This also gives a
  // real teaching contrast: lateral STEMI is not the preload-dependent,
  // nitro-caution territory chestPainM's own resolve() text warns about.
  patient: {age: 54, gender: "female", infarctTerritory: "lateral"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's more tightness than pain. And I just can't get a full breath. It goes up into my jaw a bit. It won't ease off.\"", kind: "pt",
      evid: "OPQRST — atypical/anginal-equivalent presentation (tightness, dyspnea, jaw); do not under-triage.", find: "OPQRST: chest tightness, dyspnea, radiates to jaw, unrelieved."}),
    sample: () => ({say: "\"No allergies. Blood-pressure pill and a statin. High blood pressure and high cholesterol. I ate lunch. I was just doing dishes.\"", kind: "pt",
      evid: "SAMPLE — hypertension, hyperlipidemia; cardiac risk despite atypical presentation.", find: "SAMPLE: NKDA, antihypertensive/statin, HTN + high cholesterol."}),
    heart: (s, v) => ({say: `Regular. You count it at ${v.hr}.`, find: `Heart: regular, rate ${v.hr}.`}),
    lungs: () => ({say: "Clear for now.", kind: "obs", find: "Lungs clear."}),
    skin: () => ({say: "Cool, pale, damp.", kind: "warn", find: "Cool, diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const nitroLow = s.given.nitro && (v.sbp < 100);
    if (nitroLow) {died = 1; cause = "Nitro with a systolic under 100 — you took the preload out from under a marginal pressure and it collapsed. Confirm the pressure first.";}
    if (died && !nitroLow) cause = (arr?.story ? arr.story + "\n\n" : "") + "She arrested off the ischemic myocardium. Atypical presentations in women are frequently under-treated — the aspirin, twelve-lead and fast handoff matter just as much here.";
    if (s.given.aspirin) notes.push("Aspirin given — highest-yield in ACS, and easy to miss when the presentation is 'atypical.'"); else notes.push("No aspirin. The atypical presentation doesn't lower the indication — it raises the risk of under-treating it.");
    if (s.done.ecgAcquire) notes.push("Twelve-lead obtained — essential; women's ACS is under-diagnosed partly because the ECG isn't done early.");
    return {died, cause, notes, correct: s.pi === "CPMI" || s.pi === "CPSC", truth: "Acute coronary syndrome (atypical presentation)"};},
},

acs: {cat: "medical", id: "CARD-023", pronouns: "he", title: "Male, 61. Chest pressure on and off for two days, now constant at rest.",
  limit: 1500, transport: 600, destSpecialty: "cardiac",
  bystanders: "His daughter drove over when he called her. \"He kept saying it was heartburn. Two days of this.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 4"}],
  dispatch: ["61M. Chest pressure, now constant.", "Two-day history per family. Awake, talking."],
  update: ["Daughter: \"It used to go away if he sat down. Now it won't.\""],
  impression: "Sitting at the kitchen table, one hand rubbing his sternum, a little gray. Not dramatic — but he's stopped making light of it, and that itself is a flag.",
  imps: ["CPMI", "CPSC", "CPNC", "DYSR"],
  // The genuine NSTE-ACS substrate: a subtotal, DYNAMIC culprit lesion. The
  // 12-lead is NOT a STEMI (ST depression / T-wave inversion), so the trap is
  // under-triage — 'no ST-elevation, must not be a real MI.' It is: rest angina
  // that has crescendoed, an unstable plaque that can propagate to occlusion, and
  // the management (aspirin + anticoagulation, anti-ischemic nitro, and timely
  // transport to a PCI-capable center) works on the same mechanisms the acs
  // condition models. Left untreated the thrombus climbs the lesion over the call.
  condition: "acs",
  patient: {age: 61},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Pressure, right here. Comes in waves — used to ease if I rested, last few hours it just stays. Goes into my left shoulder. Maybe a six, but it won't quit.\"", kind: "pt",
      evid: "OPQRST — crescendo angina now occurring AT REST and unrelieved: the definition of unstable angina / NSTE-ACS.", find: "OPQRST: crescendo pressure, now at rest, radiates L shoulder, ~6/10, constant."}),
    sample: () => ({say: "\"No allergies. Water pill, a cholesterol pill. Blood pressure, cholesterol, my dad had a heart attack at sixty. I had a sandwich a while ago.\"", kind: "pt",
      evid: "SAMPLE — multiple cardiac risk factors (HTN, hyperlipidemia, family history).", find: "SAMPLE: NKDA, diuretic/statin, HTN + hyperlipidemia + FHx MI."}),
    ecg: () => ({say: "Down-sloping ST depression in the lateral leads and some flipped T waves. No ST elevation.", kind: "crit",
      evid: "ST depression and T-wave inversion WITHOUT ST-elevation — NSTE-ACS. The absence of a STEMI does not lower the urgency; the plaque is unstable and can occlude.", find: "ECG: lateral ST depression + TWI, no STE (NSTE-ACS)."}),
    skin: () => ({say: "Cool and a little damp. Not soaked, but not right.", kind: "warn", find: "Skin cool, mildly diaphoretic."}),
    heart: (s, v) => ({say: `Regular. You count it at ${v.hr}. No murmur.`, find: `Heart: regular, rate ${v.hr}.`}),
  },
  // Base contact under-triages on the absent ST-elevation. The medic has the rest
  // pain and the dynamic ST depression to push back with: NSTE-ACS still gets
  // aspirin and a cardiac-capable destination, and it can evolve en route.
  micn: () => ({order: "\"No ST-elevation on that strip? Sounds like it could be reflux or stable angina. Aspirin's reasonable, but you can take him to the community ED, no need to activate anyone.\"",
    correct: false, refuteKeys: ["rest", "unstable", "crescendo", "depression", "NSTEMI", "NSTE", "dynamic", "unrelieved", "PCI"],
    onAccept: (n) => {n.given = {...n.given, aspirin: (n.given.aspirin||0)+1}; n.badOrder = 1;
      return "Aspirin goes in. You divert to the community ED. His pressure is holding for now, but the pressure in his chest is not letting up.";},
    onRefuseYes: "\"Fair — rest pain with dynamic ST depression is unstable, STEMI or not. Aspirin, treat the ischemia, and take him somewhere that can cath him. Good catch.\"",
    onRefuseNo: "\"There's no STEMI to activate for. Aspirin and the nearest ED is fine — go.\"",
    onQuestion: "\"If you think this needs a cath-capable center without an ST-elevation, make the case, or the order stands.\""}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const aspirin = s.given.aspirin, nitro = s.given.nitro || s.given.nitroOwn, heparin = s.given.heparin;
    const nitroLow = nitro && v.sbp < 100;
    if (nitroLow) {died = 1; cause = "Nitro on a systolic under 100 — you pulled the preload out from under a marginal pressure. Confirm the pressure before every dose.";}
    if (died && !nitroLow) cause = (arr?.story ? arr.story + "\n\n" : "") + "The culprit thrombus finished occluding the vessel and the territory infarcted. NSTE-ACS is not the benign end of the spectrum — it is an occlusion in progress.";
    if (!aspirin && !died) notes.push("No aspirin. It is the single highest-yield drug in ACS and the ST-segment does not change the indication.");
    if (aspirin) notes.push("Aspirin given — antiplatelet action slows the propagating thrombus, which is exactly the lesion here.");
    if (nitro && !nitroLow) notes.push("Nitro given for the ischemia — lowers preload and wall stress, buying the myocardium time. Titrate to the pressure.");
    if (heparin) notes.push("Anticoagulation added — the fibrin arm of the same clot. Aspirin plus heparin suppress the two pathways a coronary thrombus propagates through.");
    if (s.badOrder) notes.push("You accepted a downgrade on 'no ST-elevation.' NSTE-ACS still needs a cardiac-capable destination — the absence of a STEMI is not the absence of an emergency.");
    if (!died && s.refused) notes.push("You pushed back on the under-triage, correctly. Rest angina with dynamic ST depression is unstable regardless of the ST-segment.");
    return {died, cause, notes, correct: s.pi === "CPMI" || s.pi === "CPSC", truth: "Acute coronary syndrome (NSTE-ACS)"};},
},

stableAngina: {cat: "medical", id: "CARD-024", pronouns: "she", title: "Female, 67. Chest tightness climbing the stairs, easing now that she's sitting.",
  limit: 1300, transport: 540, destSpecialty: "cardiac",
  bystanders: "Her husband is calm about it. \"She gets this when she overdoes it. The doctor gave her those little pills.\"",
  units: [{at: 360, level: "emt", name: "BLS 6"}],
  dispatch: ["67F. Chest tightness on exertion, now resting.", "Husband reports a known heart history."],
  update: ["Husband: \"She took one of her nitro and she's already better.\""],
  impression: "Sitting on the second-floor landing, catching her breath, a hand on her chest. Already looking better than the call made it sound — but she's had this before, and that history is the thing to nail down.",
  imps: ["CPSC", "CPMI", "CPNC", "DYSR"],
  // Stable angina: a FIXED lesion causing demand ischemia that RESOLVES with rest.
  // The teaching is the triage distinction from acs — same chest pain, opposite
  // trajectory. The correct read is 'suspected cardiac, not an MI': treat (aspirin,
  // nitro, rest, 12-lead) and transport for evaluation, because you cannot fully
  // exclude ACS in the field and a CHANGE in the pattern (rest pain, longer,
  // worse) is exactly when stable angina becomes unstable. The trap runs both
  // ways: dismissing it as nothing, or over-calling a STEMI that isn't there.
  condition: "stableAngina",
  patient: {age: 67, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It came on partway up the stairs — a tightness, like a band. Same as always. It eases off if I stop and rest, and the little pill helps. Maybe a three now, it was a five.\"", kind: "pt",
      evid: "OPQRST — EXERTIONAL onset, RELIEVED BY REST and nitro, reproducible and unchanged: the classic STABLE angina pattern (contrast unstable/rest pain).", find: "OPQRST: exertional, relieved by rest + SL nitro, reproducible, improving."}),
    sample: () => ({say: "\"Angina, they call it. I take a water pill, a statin, and the nitro when I need it. This is how it always goes — comes with the stairs, settles when I sit.\"", kind: "pt",
      evid: "SAMPLE — known stable angina on nitro PRN; today's episode fits her usual pattern (no change = still stable).", find: "SAMPLE: known angina, statin/diuretic/PRN nitro, pattern unchanged."}),
    ecg: () => ({say: "Sinus rhythm. No ST elevation, and the ST segments look about back to baseline now that she's resting.", kind: "obs",
      evid: "Non-diagnostic 12-lead — as demand ischemia resolves the ST changes normalize. A single normal ECG does NOT exclude ACS; it fits a resolving demand episode.", find: "ECG: sinus, no STE, ST near baseline (resolving)."}),
    skin: () => ({say: "Warm and dry now. A little pale earlier, her husband says.", kind: "obs", find: "Skin warm, dry."}),
    // Was a hardcoded "coming down into the 70s" — true for the untreated/
    // rest-resolves case (measured 96->73 by minute 5) but measurably wrong
    // once nitro is given: nitro's real preload drop triggers genuine reflex
    // tachycardia (measured 96->115 at minute 2, still ~94 by minute 7, only
    // settling to ~70s well past minute 9). Reading v.hr live instead of a
    // fixed range shows that response instead of hiding it.
    heart: (s, v) => ({say: `Regular. You count it at ${v.hr}.`, find: `Heart: regular, rate ${v.hr}.`}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const aspirin = s.given.aspirin, nitro = s.given.nitro || s.given.nitroOwn;
    const nitroLow = nitro && v.sbp < 100;
    if (nitroLow) {died = 1; cause = "Nitro with a systolic under 100 — even in a stable-angina patient, stacking nitrates onto a falling pressure drops the preload out from under her. Check the pressure before every dose.";}
    if (nitro && !nitroLow) notes.push("Nitro given — appropriate: it relieves the demand ischemia by dropping preload and wall stress, the same mechanism rest is using.");
    if (aspirin) notes.push("Aspirin given — reasonable; you cannot exclude ACS in the field, and it is low-risk. Do not let 'it's just her angina' talk you out of the standard cardiac workup.");
    if (!s.done?.ecgAcquire && !died) notes.push("No twelve-lead. Even a resolving episode gets one — it is how you catch the stable pattern that has quietly become unstable.");
    if (!died) notes.push("This fit stable angina: exertional, relieved by rest and nitro, pattern unchanged, resolving on scene. The right disposition is treat-and-transport for evaluation, not a lights-and-siren STEMI activation — but the moment the story changes (pain at rest, longer, worse), it is ACS until proven otherwise.");
    return {died, cause, notes, correct: s.pi === "CPSC" || s.pi === "CPMI", truth: "Stable angina (exertional, rest-relieved)"};},
},

unstableAngina: {cat: "medical", id: "CARD-025", pronouns: "he", title: "Male, 59. Chest pressure that started at rest and won't let up.",
  limit: 1400, transport: 540, destSpecialty: "cardiac",
  bystanders: "His wife is worried in a way he clearly isn't used to. \"He's had angina for years, but never like this — sitting still, watching TV.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 11"}],
  dispatch: ["59M. Chest pressure at rest, not improving.", "Known angina, but this episode is different per family."],
  update: ["Wife: \"His pills usually fix it in a few minutes. Not today.\""],
  impression: "Sitting very still on the edge of the couch, jaw set, a hand on his chest. He's trying to talk himself out of it — and the fact that resting and his nitro haven't touched it is the whole story.",
  imps: ["CPMI", "CPSC", "CPNC", "DYSR"],
  // Unstable angina: rest ischemia that does NOT resolve with rest, but
  // troponin-negative. The teaching is the two-front distinction — it is NOT
  // stable angina (his usual exertional, rest-relieved pattern has CHANGED: rest
  // pain, unrelieved by rest or his own nitro = crescendo/unstable), and it is
  // full ACS-spectrum even without an infarct on the strip. Correct management is
  // the ACS bundle: aspirin, nitro, antithrombotic where in scope, 12-lead,
  // monitor, and transport to a cardiac-capable center to prevent the tip into
  // NSTEMI/STEMI. The trap is 'it's just his angina.'
  condition: "unstableAngina",
  patient: {age: 59},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It came on while I was sitting down — that's new. Pressure, into my left arm. I took two of my nitro, rested twenty minutes, nothing. It usually only bothers me on the hills, and it always quits when I stop.\"", kind: "pt",
      evid: "OPQRST — REST onset, unrelieved by rest AND by his own nitro, a clear CHANGE from his stable exertional pattern: crescendo/unstable angina (ACS-spectrum).", find: "OPQRST: rest onset, unrelieved by rest or SL nitro, changed from usual pattern."}),
    sample: () => ({say: "\"Angina, yeah — for years. Aspirin, a beta blocker, a statin, the nitro when I need it. Family history's terrible, my brother had a stent at fifty-five.\"", kind: "pt",
      evid: "SAMPLE — known CAD with a CHANGED anginal pattern; strong family history. The change is the red flag.", find: "SAMPLE: known angina, ASA/beta-blocker/statin/PRN nitro, strong FHx."}),
    ecg: () => ({say: "Sinus rhythm with some ST depression and T-wave flattening in the inferior leads. No ST elevation.", kind: "warn",
      evid: "ST depression / T-wave changes without ST-elevation — ischemia on the strip, NSTE picture. Fits unstable angina; a single non-elevated ECG does not exclude ACS.", find: "ECG: inferior ST depression + T-wave changes, no STE."}),
    skin: () => ({say: "Cool, a little clammy. He keeps wiping his palms on his jeans.", kind: "warn", find: "Skin cool, mildly diaphoretic."}),
    heart: (s, v) => ({say: `Regular. You count it at ${v.hr}. No murmur.`, find: `Heart: regular, rate ${v.hr}.`}),
  },
  micn: () => ({order: "\"Known angina, chest pain — sounds like his usual. Have him take his own nitro, and if it settles you can downgrade and take him to the community ED.\"",
    correct: false, refuteKeys: ["rest", "unstable", "crescendo", "changed", "unrelieved", "new", "different", "nstemi", "nste", "depression"],
    onAccept: (n) => {n.given = {...n.given, nitroOwn: (n.given.nitroOwn||0)+1}; n.badOrder = 1;
      return "He takes his nitro again. It doesn't touch it — because this isn't his usual angina. You've framed an unstable presentation as a stable one.";},
    onRefuseYes: "\"You're right — rest pain that his own nitro won't fix is a changed, unstable pattern. That's ACS: aspirin, treat the ischemia, monitor, and a cardiac-capable destination. Good.\"",
    onRefuseNo: "\"He's got known angina and it's chest pain. His own nitro is reasonable — try it and reassess.\"",
    onQuestion: "\"If you think this is more than his stable angina, tell me what changed, or the order stands.\""}),
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const aspirin = s.given.aspirin, nitro = s.given.nitro || s.given.nitroOwn, heparin = s.given.heparin;
    const nitroLow = nitro && v.sbp < 100;
    if (nitroLow) {died = 1; cause = "Nitro on a systolic under 100 dropped the preload out from under a marginal pressure. Confirm the pressure before every dose.";}
    if (died && !nitroLow) cause = (arr?.story ? arr.story + "\n\n" : "") + "The unstable plaque occluded and the territory began to infarct. Unstable angina is the warning shot — the whole point of recognizing it is to treat before this happens.";
    if (!aspirin && !died) notes.push("No aspirin. Rest pain that has changed from a stable pattern is ACS until proven otherwise — aspirin is first-line and the ST-segment does not change that.");
    if (aspirin) notes.push("Aspirin given — antiplatelet therapy stabilizes the unstable plaque, which is the actual pathology here even without an infarct yet.");
    if (nitro && !nitroLow) notes.push("Nitro for the ischemia — appropriate; it unloads demand. Note his own nitro already failed, which is itself the red flag.");
    if (heparin) notes.push("Anticoagulation added — the fibrin arm of plaque stabilization, reasonable in a clear unstable presentation within scope.");
    if (s.badOrder) notes.push("You accepted 'it's his usual angina.' The change in pattern — rest pain, unrelieved by rest or his nitro — is exactly what makes it UNSTABLE. Treat it as ACS.");
    if (!died && s.refused) notes.push("You pushed back on the 'stable angina' framing, correctly. A changed pattern is unstable angina, and unstable angina is ACS.");
    return {died, cause, notes, correct: s.pi === "CPMI" || s.pi === "CPSC", truth: "Unstable angina (rest pain, troponin-negative ACS)"};},
},

nstemi: {cat: "medical", id: "CARD-026", pronouns: "she", title: "Female, 66. Two hours of chest pressure, sweaty and nauseated.",
  limit: 1400, transport: 540, destSpecialty: "cardiac",
  bystanders: "Her son found her pale at the kitchen table. \"She said it was indigestion for a while. It's been a couple of hours.\"",
  units: [{at: 300, level: "paramedic", name: "Medic 7"}],
  dispatch: ["66F. Chest pressure two hours, diaphoretic, nauseated.", "Pale per family, still talking."],
  update: ["Son: \"She almost passed out standing up a minute ago.\""],
  impression: "Gray, sweaty, a sick look to her. This has been going for hours, not minutes — and that duration, with how she looks, is the tell that muscle is already being lost.",
  imps: ["CPMI", "CPSC", "CPNC", "DYSR"],
  // Established NSTEMI: subtotal occlusion, no ST-elevation, but an infarct is
  // ALREADY underway (troponin-positive). The teaching is that this is not the
  // 'prevent it' window (that is UA/early ACS) — the muscle is being lost NOW, so
  // the goal is to LIMIT the infarct (aspirin + anticoagulation + nitro + oxygen
  // if hypoxic) and get her to a cath-capable center promptly. The absence of
  // ST-elevation does not make it not-an-MI, and the hours-long duration + sick
  // appearance are the clues that separate it from an anginal episode.
  condition: "nstemi",
  patient: {age: 66, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's a heaviness, right in the middle, going into my jaw. Two hours now. I thought it was something I ate. It's not going away, and I feel like I might be sick.\"", kind: "pt",
      evid: "OPQRST — prolonged (hours) rest pressure with jaw radiation, diaphoresis and nausea: a sustained ischemic event, not a transient anginal episode. Duration this long means infarction, not just ischemia.", find: "OPQRST: 2h constant central pressure, jaw radiation, nausea/diaphoresis."}),
    sample: () => ({say: "\"High blood pressure and diabetes. I take a few pills, I don't remember the names. My father died of a heart attack.\"", kind: "pt",
      evid: "SAMPLE — diabetes (blunts/atypical presentation), HTN, family history: high cardiac risk, and diabetics infarct with vague symptoms.", find: "SAMPLE: HTN + diabetes + FHx MI; atypical/vague presentation."}),
    ecg: () => ({say: "ST depression across the lateral leads with deep T-wave inversions. No ST elevation anywhere.", kind: "crit",
      evid: "Marked ST depression + deep TWI without ST-elevation — an NSTE picture with ongoing subendocardial ischemia/infarction. Troponin would be positive; you cannot get it in the field, so treat on the whole picture.", find: "ECG: lateral ST depression + deep TWI, no STE."}),
    skin: () => ({say: "Cold, gray, soaked with sweat.", kind: "crit", find: "Skin cold, gray, diaphoretic."}),
    heart: (s, v) => ({say: `Regular, rate ${v.hr}. You think you hear a soft extra sound — maybe an S4.`, find: `Heart: regular, rate ${v.hr}, possible S4.`}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const aspirin = s.given.aspirin, nitro = s.given.nitro || s.given.nitroOwn, heparin = s.given.heparin;
    const nitroLow = nitro && v.sbp < 100;
    if (nitroLow) {died = 1; cause = "Nitro on a systolic under 100 — she was already marginal and you dropped the preload out from under her. Confirm the pressure before every dose.";}
    if (died && !nitroLow) cause = (arr?.story ? arr.story + "\n\n" : "") + "The subendocardial infarct extended and the pump failed. NSTEMI is a real infarct — the ST-segment being flat does not make it benign.";
    if (!aspirin && !died) notes.push("No aspirin. This is an infarct in progress — aspirin is first-line and the absent ST-elevation does not change that.");
    if (aspirin) notes.push("Aspirin given — antiplatelet therapy limits thrombus extension, which limits how much muscle is lost.");
    if (nitro && !nitroLow) notes.push("Nitro for the ischemia — it unloads demand and shrinks the infarct, but watch her pressure closely; she is marginal.");
    if (heparin) notes.push("Anticoagulation added — reasonable in a clear NSTEMI within scope.");
    if (!died) notes.push("The teaching here is LIMIT, not prevent: the infarct has already declared (hours of pain, sick appearance, dynamic ST depression). Treat the ischemia and get her to a cath-capable center promptly — every minute of ongoing ischemia is more muscle lost.");
    return {died, cause, notes, correct: s.pi === "CPMI" || s.pi === "CPSC", truth: "NSTEMI (subendocardial infarct, no ST-elevation)"};},
},

// Physiology queue item 3's scenario half: a patient whose OWN electrolyte/
// medication/rate substrate can cross the engine's real torsades-initiation
// threshold (arrhythmia.repol > 0.6, updateRhythm) instead of the rhythm
// only being reachable by a test harness imposing it. Nothing about her
// presenting vitals looks dramatic — that is the point: the danger is a
// prolonged QT and a low potassium/magnesium that only show up on a monitor
// and labs neither of which this exam alone reveals, not on how sick she
// looks standing in the kitchen.
acquiredLongQT: {cat: "medical", id: "CARD-027", pronouns: "she", title: "Female, 58. Brief loss of consciousness, now awake and talking.",
  limit: 1500, transport: 540,
  bystanders: "Her husband is hovering, phone still in his hand from the 911 call.",
  units: [{at: 420, level: "emt", name: "BLS 12"}],
  dispatch: ["58F. Syncopal episode, witnessed by spouse.", "Conscious and talking per caller.", "No mechanism of injury reported."],
  update: ["Husband: \"Her heart was doing something funny right before she went down — she said it felt like it was racing, then fluttering.\""],
  impression: "Sitting on the kitchen floor where she fell, pale, her husband's hand on her shoulder. Alert and talking, a little shaken. Nothing about how she looks tells you this was more than a faint.",
  imps: ["DYSR", "ALOC", "ANXY"],
  condition: "acquiredLongQT",
  patient: {age: 58, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It wasn't like fainting before — no warning, no going hot or queasy first. My heart just took off racing, then it felt like it was fluttering, and the next thing I knew I was on the floor. I feel okay now, just rattled.\"", kind: "pt",
      evid: "Sudden LOC preceded by palpitations, with NO vasovagal prodrome (no warmth, nausea, graying-out, situational trigger) — that absence is what should point away from a simple faint and toward an arrhythmic cause, even though she looks fine sitting here.", find: "OPQRST: syncope preceded by racing/fluttering palpitations, no vasovagal prodrome."}),
    sample: () => ({say: "Her husband answers: \"She's been sick all week, throwing up, barely keeping anything down. And she's been on the same pill for her nerves for years — I couldn't tell you the name of it.\"", kind: "pt",
      evid: "A week of vomiting (a real source of ongoing potassium/magnesium loss) plus a long-standing psychiatric medication — the two most common contributors to acquired QT prolongation, present together, though neither is visible without labs or a 12-lead.", find: "SAMPLE: several days of vomiting; chronic unnamed psychiatric medication."}),
    // Measured (8 untreated trials): torsades fires in 7/8, and 3/8 of
    // those degenerate to VF — during either, "regular... mid-50s" is not
    // just stale, it's flatly wrong. Same v.rhythm live-read pattern
    // electricalStorm/aicdMalfunction already established, falling back to
    // the baseline bradycardia text otherwise.
    heart: (s, v) => (v.rhythm === "torsades" || v.rhythm === "VF")
      ? {say: `Nothing you can count cleanly — a chaotic, rapid, wide-complex rhythm on the monitor right now, and her pulse is ${v.rhythm === "VF" ? "gone" : "barely there"}.`, kind: "crit",
        evid: "Torsades/VF on the monitor is the substrate degenerating in real time — the 'regular, mid-50s' baseline she walked in with is gone.", find: `Heart: ${v.rhythm} — chaotic wide-complex, ${v.rhythm === "VF" ? "pulseless" : "barely perfusing"}.`}
      : {say: "Regular, but slower than you'd expect for someone who just came around from a faint — you count it in the mid-50s.", find: "Heart: regular, relatively bradycardic (~mid-50s) for a post-syncopal patient."},
    skin: () => ({say: "Pale, but warm and dry. Not the picture of shock.", find: "Skin pale, warm, dry."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveMag = s.given.magnesium;
    const wentTorsades = v.rhythm === "torsades" || !!s.patient?._everTorsades;
    if (died && (v.rhythm === "torsades" || v.rhythm === "VF")) {
      cause = (arr?.story ? arr.story + "\n\n" : "") + "A polymorphic wide-complex tachycardia with no atrial kick and a rate too fast to fill between beats — the underlying prolonged QT and electrolyte substrate were never addressed.";
    }
    if (wentTorsades && !gaveMag && !died) notes.push("The rhythm degenerated into a polymorphic wide-complex tachycardia and magnesium was never given. Magnesium sulfate is first-line for torsades regardless of the measured level — it abolishes the trigger, not the QT interval itself.");
    if (wentTorsades && gaveMag) notes.push("Magnesium given for the polymorphic wide-complex rhythm — the correct first-line move, and it acts on the trigger whether or not you ever see a serum level.");
    if (wentTorsades && s.doses.some(d => d.id === "cardiovert")) notes.push("Synchronized cardioversion was tried on a polymorphic rhythm with no consistent R-wave to sync to. Treat sustained polymorphic VT/torsades as you would a pulseless shockable rhythm — unsynchronized defibrillation — not a synchronized cardioversion.");
    if (!wentTorsades) notes.push("Nothing dramatic happened on this call — which is exactly why the risk factors mattered more than the vitals. A recent week of vomiting and a long-standing psychiatric medication are the two most common contributors to acquired QT prolongation, and they were only findable by asking, not by looking at her.");
    notes.push("Getting leads on early and staying on the monitor for a syncope-with-palpitations story is the move, whether or not anything happens on scene — a first, brief, self-terminating run of torsades is exactly the kind of thing that is easy to miss between checks.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Acquired long QT syndrome (hypokalemia + hypomagnesemia + a QT-prolonging medication) with torsades de pointes risk"};},
},

thirdDegreeAVBlock: {cat: "medical", id: "CARD-028", pronouns: "he", title: "Male, 71. Two fainting spells this morning.",
  limit: 1500, transport: 540,
  bystanders: "His daughter found him on the kitchen floor the second time and called immediately.",
  units: [{at: 420, level: "emt", name: "BLS 14"}],
  dispatch: ["71M. Syncope x2 this morning per family.", "Currently conscious, answering questions.", "History of hypertension, no known cardiac history."],
  update: ["Daughter: \"He looks so pale, and his pulse feels so slow and heavy.\""],
  impression: "Sitting propped against the cabinets where he fell, gray and diaphoretic, blinking slowly. He answers questions but a beat behind, like he's underwater. His radial pulse is slow, regular, and unusually strong.",
  imps: ["DYSR", "ALOC", "HOTN"],
  condition: "thirdDegreeAVBlock",
  patient: {age: 71, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"The first time I just felt woozy and sat down fast. This time I guess I really went out — Emma says I was gone maybe ten, fifteen seconds. No warning either time. No chest pain, nothing."', kind: "pt",
      evid: "Two syncopal episodes in one morning, no prodrome, no chest pain — abrupt LOC without warning is the Stokes-Adams pattern, not a vasovagal one.", find: "OPQRST: two unheralded syncopal episodes this morning, no prodrome, no chest pain."}),
    sample: () => ({say: "Daughter: \"He's on lisinopril for his pressure, that's it. No heart attacks, no pacemaker. He's just been more tired than usual the last couple weeks, but he's 71, I figured that was normal.\"", kind: "pt",
      evid: "Weeks of vague fatigue preceding today's syncope — a slowly progressive conduction problem, not a sudden event, matches degenerative disease of the conduction system rather than an acute ischemic block.", find: "SAMPLE: lisinopril only; several weeks of increasing fatigue before today."}),
    // Complete block's escape rhythm has no vagal input for atropine to
    // block (resolve() below documents that it "does essentially
    // nothing" here) — only pacing capture actually raises the rate, so
    // reading v.hr/pacedCapture live proves that teaching point on
    // re-exam instead of asserting it only in the debrief text.
    heart: (s, v) => (s.patient?.pacedCapture || 0) > 0.5
      ? {say: `Regular, faster now, at a paced rate of ${v.hr} — captured.`, kind: "obs", find: `Heart: transcutaneous pacing capturing, rate ${v.hr}.`}
      : {say: `Slow and regular — you count it at ${v.hr} — and unusually forceful, like every beat is working harder than it should to move the same volume.`, find: `Heart: slow (~${v.hr}), regular, forceful.`},
    skin: () => ({say: "Pale, cool, diaphoretic.", find: "Skin pale, cool, diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const paced = s.doses.some(d => d.id === "pacing") && (s.patient?.pacedCapture || 0) > 0.5;
    const gaveAtropine = s.given.atropine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Complete AV block with a ventricular escape rate too slow, and too dyssynchronous, to sustain output — nothing was done to impose a faster rate on the ventricle once the block itself proved fixed.";
    if (gaveAtropine && !paced) notes.push("Atropine was given and, as expected for a block this complete, did essentially nothing — it blocks vagal input to the AV node, and an escape focus below a complete block has no vagal input to block. That is exactly why the protocol says not to delay pacing for it.");
    if (paced) notes.push("Transcutaneous pacing captured and imposed a faster, more organized rate — the correct field treatment for a fixed structural block, and the one intervention here that actually raises cardiac output rather than just hoping the native rhythm improves.");
    if (!gaveAtropine && !paced) notes.push("Neither atropine nor pacing was tried. A ventricular escape rhythm in the 30s is not a rate a real patient tolerates indefinitely — this needed an intervention, not just transport.");
    notes.push("P waves and QRS complexes marching to their own independent rates on the strip is the finding — the atria and ventricles are no longer talking to each other at all, which is what makes this complete, not first- or second-degree, block.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Complete (third-degree) AV block, likely degenerative conduction system disease (Lenegre-Lev), with a marginal ventricular escape rhythm"};},
},

firstDegreeAVBlock: {cat: "medical", id: "CARD-029", pronouns: "she", title: "Female, 76. Found on the floor after a fall.",
  limit: 1200, transport: 480,
  bystanders: "Her home health aide is waiting by the door with a folder of medication lists.",
  units: [{at: 360, level: "emt", name: "BLS 6"}],
  dispatch: ["76F. Mechanical fall, unwitnessed.", "Conscious, alert, minor complaint.", "Aide on scene, patient is her regular client."],
  update: [],
  impression: "Sitting in her armchair where the aide helped her up, a little embarrassed about the whole thing. Alert, talking normally, more annoyed than hurt.",
  imps: ["TRMA", "DYSR"],
  condition: "firstDegreeAVBlock",
  patient: {age: 76, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I just caught my slipper on the rug edge and went down slow — more of a stumble, really. Nothing hurts except my pride and maybe my hip a little."', kind: "pt",
      evid: "A simple mechanical trip with no LOC, no palpitations, no chest pain, and a slow controlled fall — nothing here suggests a cardiac cause for the fall itself.", find: "OPQRST: mechanical trip, no LOC, minor hip discomfort."}),
    sample: () => ({say: "The aide hands over a printed medication list: nothing new in months, all routine — a statin, a multivitamin, an occasional stool softener. \"She's sharp as a tack, this was just a bad rug. Her cardiologist did mention something about a 'slow electrical signal' at her checkup last month, but said it wasn't anything to treat.\"", kind: "pt",
      evid: "No AV-nodal-slowing medication on the list (no beta-blocker, no calcium channel blocker, no digoxin), and a cardiologist already characterized this as a known, untreated finding — not a new drug effect and not today's problem.", find: "SAMPLE: routine medication list, nothing AV-nodal-active; a known, previously-worked-up conduction finding, no recent changes."}),
    heart: () => ({say: "Regular, unremarkable rate. On the monitor, a prolonged but constant PR interval — every P wave is followed by a QRS, just later than it should be. Nothing else on the strip is abnormal.", kind: "crit",
      evid: "First-degree AV block: PR prolonged beyond 0.20 s with 1:1 conduction preserved — the mildest, most common, and least urgent point on the AV-block spectrum, and one already known to her cardiologist. An incidental finding, not the cause of today's fall.", find: "Heart: regular. Monitor: PR interval prolonged (~0.23 s), 1:1 conduction, otherwise unremarkable."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const treatedBlock = s.given.atropine || s.doses.some(d => d.id === "pacing");
    if (treatedBlock) notes.push("Atropine or pacing was used on a first-degree AV block — a benign, usually asymptomatic finding that does not need field treatment. First-degree block does not progress to hemodynamic compromise the way second- or third-degree block can; treating it here is treating a number on a monitor, not the patient in front of you.");
    else notes.push("The prolonged PR interval was correctly left alone. First-degree AV block gets no field intervention — the job today was the fall workup, and the incidental finding is exactly that: incidental.");
    notes.push("The actual call was a mechanical fall in a 76-year-old — a full fall workup (orthostatics, a look at the hip, a home-safety read on that rug) is what this visit needed, whether or not the monitor showed anything unusual.");
    return {died, cause, notes, correct: s.pi === "TRMA", truth: "Isolated first-degree AV block (incidental) in a patient with an unrelated mechanical fall"};},
},

atrialFibrillationRVR: {cat: "medical", id: "CARD-030", pronouns: "he", title: "Male, 63. Sudden palpitations, feels awful.",
  limit: 1400, transport: 540,
  bystanders: "His wife is pacing the living room, refilling a water glass he isn't drinking.",
  units: [{at: 400, level: "emt", name: "BLS 9"}],
  dispatch: ["63M. Palpitations, feels like his heart is racing.", "Conscious, anxious, sitting up.", "History of AFib per wife."],
  update: ["Wife: \"He missed his heart pills again this week, I just know it.\""],
  impression: "Sitting on the couch, one hand pressed to his chest, breathing fast and shallow. He looks anxious and unwell but is talking in full sentences.",
  imps: ["DYSR", "SOBB", "ANXY"],
  condition: "atrialFibrillation",
  patient: {age: 63, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It just started, maybe twenty minutes ago — no warning. My heart is going crazy, fluttering and pounding at the same time, and I feel short of breath and lightheaded. This has happened before but never felt this bad."', kind: "pt",
      evid: "Sudden-onset palpitations with dyspnea and presyncope, in a patient with a KNOWN prior history of the same rhythm — recurrence, not a new diagnosis, is the working assumption until proven otherwise.", find: "OPQRST: sudden palpitations ~20 min ago, dyspnea, lightheadedness, prior similar episodes."}),
    sample: () => ({say: "Wife: \"He's supposed to take a pill for his heart rhythm and a blood thinner, every day. He's been forgetting the rhythm one — I found three left in last week's pillbox.\"", kind: "pt",
      evid: "A missed rate/rhythm-control medication is a common, specific trigger for a known AFib patient's recurrence — this is very likely his baseline arrhythmia breaking through, not a new problem.", find: "SAMPLE: known AFib on a rate/rhythm-control drug and an anticoagulant; several recent missed doses of the rhythm medication."}),
    // Diltiazem only slows the ventricular RATE (rhythm stays "afib");
    // cardioversion actually converts the rhythm to sinus. Reading both
    // live means the exam reflects rate control vs. true conversion, not
    // just a fixed "still chaotic" line for the whole call.
    // MEASURED (throwaway probe, real physio() run, 600s): untreated afib
    // RVR's per-tick jitter samples ~123-175 (median 149); after diltiazem
    // it samples ~101-149 (median 123) — the two distributions overlap
    // (rate control lowers the MEAN, it doesn't eliminate the jitter), so
    // no threshold perfectly separates a single spot-check. 140 catches
    // ~90% of treated ticks as "improved" against ~30% false positives on
    // untreated ticks — the best single-read discriminator available,
    // and an occasional "still chaotic" read on a rate-controlled patient
    // is itself realistic (rate control isn't regularity).
    heart: (s, v) => v.rhythm !== "afib"
      ? {say: `Regular now, rate ${v.hr} — converted out of the fibrillation.`, kind: "obs", find: `Heart: sinus rhythm, rate ${v.hr}.`}
      : v.hr < 140
        ? {say: `Irregularly irregular, but the rate's come down — you can almost get a count now, around ${v.hr}.`, kind: "obs", find: `Heart: irregularly irregular, rate-controlled (~${v.hr}).`}
        : {say: "Fast and completely irregular — no pattern to it at all, just chaotic. You can't get a clean count by feel.", find: "Heart: rapid, irregularly irregular, uncountable by palpation alone."},
    skin: () => ({say: "Slightly diaphoretic, warm.", find: "Skin warm, mildly diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const rateControlled = s.given.diltiazem;
    const cardioverted = s.doses.some(d => d.id === "cardiovert");
    const gaveAdenosine = s.given.adenosine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A sustained rapid, irregular ventricular response that was never rate-controlled or terminated, in a call where something else in his management went wrong along the way.";
    if (gaveAdenosine) notes.push("Adenosine was tried on AFib. It only breaks a single reentrant circuit (true SVT) — chaotic, multi-focal atrial activity has no single circuit for it to interrupt, so it did essentially nothing here, exactly as its own note warns.");
    if (rateControlled) notes.push("Diltiazem given for rate control — the correct first move in a stable-but-symptomatic RVR patient: slow the ventricular response, let filling time recover, without needing to terminate the rhythm itself.");
    if (cardioverted) notes.push("Synchronised cardioversion was used. Appropriate if he was truly unstable (hypotensive, altered, in shock) from the rate — a lower-acuity presentation should try rate control first, since cardioversion carries its own risks (embolic stroke if this has been running longer than it looks, sedation).");
    if (!rateControlled && !cardioverted && !died) notes.push("Neither rate control nor cardioversion was tried. A sustained rate in this range, in a symptomatic patient, does not reliably slow down on its own — this needed an intervention, not just monitoring.");
    notes.push("Irregularly irregular on palpation, with no discernible P waves and a chaotic baseline on the strip, is the AFib signature — the SAME chaos that makes the pulse uncountable by feel is what you're seeing organized (or not) on the monitor.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Atrial fibrillation with rapid ventricular response, likely precipitated by missed rate/rhythm-control medication"};},
},

pericardialTamponade: {cat: "medical", id: "CARD-031", pronouns: "he", title: "Male, 55. Progressively short of breath, missed dialysis.",
  limit: 1500, transport: 540,
  bystanders: "His roommate found him slumped in his recliner and called right away.",
  units: [{at: 420, level: "emt", name: "BLS 11"}],
  dispatch: ["55M. Progressive shortness of breath, on dialysis.", "Conscious, weak.", "Roommate reports he missed his last two dialysis sessions."],
  update: ["He's getting harder to arouse and his breathing looks more labored than five minutes ago."],
  impression: "Slumped in his recliner, pale and diaphoretic, breathing fast and shallow. The veins in his neck stand out even sitting upright. He tracks you with his eyes but is slow to answer.",
  imps: ["HOTN", "SHOK", "SOBB"],
  condition: "pericardialTamponade",
  patient: {age: 55, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"Been getting worse for... I don\'t know, a few days? Today I just couldn\'t catch my breath getting out of the chair. It hurts a little right here" — he gestures vaguely at his chest — "but the breathing is the real problem."', kind: "pt",
      evid: "Days of progressive dyspnea culminating in today's acute decompensation fits a slowly accumulating effusion finally reaching the tipping point where compensation fails, not a sudden event.", find: "OPQRST: days of progressive dyspnea, acutely worse today, mild chest discomfort."}),
    sample: () => ({say: "Roommate: \"He's supposed to do dialysis three times a week. He missed Tuesday and Thursday — said he didn't have a ride. That's not like him.\"", kind: "pt",
      evid: "End-stage renal disease with two missed hemodialysis sessions — uremia is a leading medical cause of pericardial effusion and tamponade, and missed dialysis is exactly the kind of precipitant that lets one accumulate unchecked.", find: "SAMPLE: hemodialysis-dependent ESRD, two missed sessions this week."}),
    heart: () => ({say: "Heart sounds are distant and muffled, hard to make out clearly even in a quiet room. Fast, regular.", kind: "crit",
      evid: "Muffled heart sounds plus the jugular distension you already noticed plus his low pressure is Beck's triad — the classic (though not always complete) tamponade picture.", find: "Heart: muffled/distant heart sounds, fast, regular. Beck's triad: JVD, muffled tones, hypotension."}),
    skin: () => ({say: "Pale, cool, diaphoretic.", find: "Skin pale, cool, diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveFluid = s.given.saline;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A large pericardial effusion progressively compressed the heart until it could no longer fill between beats — nothing was done to support preload against the rising pressure, and this drug box has no way to drain the effusion itself.";
    if (gaveFluid) notes.push("IV crystalloid was given — the correct, if temporizing, field move: raising preload pressure partially pushes back against the external pressure the effusion is putting on the heart. It buys time; it does not fix the underlying problem, which needs a needle in the pericardial sac, not the field bag.");
    else if (!died) notes.push("No fluid was given. A preload-dependent obstructive picture like this one benefits from volume even though the real fix is drainage — an easy, low-risk temporizing move that was available and wasn't used.");
    notes.push("Distant heart sounds, jugular distension, and a falling pressure together (Beck's triad) is the pattern to recognize — and a patient who has missed dialysis is a patient whose uremia has had nowhere to go, which is exactly the setup for a large effusion to accumulate silently over days before decompensating fast.");
    notes.push("Nothing in a BLS or ALS drug box drains a pericardial effusion. The job here is recognition, temporizing support, and getting him to a facility that can put a needle in his pericardium — minimizing scene time matters as much as anything you do on it.");
    return {died, cause, notes, correct: s.pi === "SHOK", truth: "Pericardial tamponade from a large uremic pericardial effusion, precipitated by missed hemodialysis"};},
},

symptomaticBradycardia: {cat: "medical", id: "CARD-032", pronouns: "she", title: "Female, 82. Two days of feeling 'off' and dizzy.",
  limit: 1400, transport: 480,
  bystanders: "Her home health aide called after taking a routine pulse check.",
  units: [{at: 400, level: "emt", name: "BLS 8"}],
  dispatch: ["82F. Dizziness, generalized weakness x2 days.", "Conscious, alert.", "Aide reports a very slow pulse on a routine check."],
  update: [],
  impression: "Sitting in bed propped on pillows, pale, moving slowly and deliberately. Alert and able to answer questions, but clearly worn down.",
  imps: ["DYSR", "HOTN", "ALOC"],
  condition: "symptomaticBradycardia",
  patient: {age: 82, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I\'ve just felt so tired and dizzy the last two days, like everything is in slow motion. No chest pain, no palpitations — if anything my heart feels slow and heavy, not racing."', kind: "pt",
      evid: "A gradually WORSENING two-day course of fatigue and dizziness, with a heart that feels slow rather than fast, points toward a progressive rate problem rather than a sudden arrhythmic event.", find: "OPQRST: two days of progressive fatigue and dizziness, no chest pain, no palpitations, no syncope."}),
    sample: () => ({say: "The aide hands over her medication list: a baby aspirin and a vitamin D supplement, nothing else. \"She's never been on anything for her heart or her pressure. That's what made me check her pulse in the first place — it just felt wrong.\"", kind: "pt",
      evid: "No beta-blocker, calcium channel blocker, digoxin, or any other AV-nodal/rate-slowing medication on the list — this rules out a drug effect as the cause, pointing toward primary sinus node disease instead.", find: "SAMPLE: no cardiac or rate-controlling medications; otherwise unremarkable history."}),
    // Atropine gives a real, measured PARTIAL rise here (sinus node
    // disease is still vagally responsive); pacing captures a full,
    // faster rate. Reading v.hr/pacedCapture live lets a re-exam show the
    // actual, honest partial-vs-full response instead of a frozen "high
    // 30s to low 40s" forever.
    heart: (s, v) => {
      const paced = (s.patient?.pacedCapture || 0) > 0.5;
      if (paced) return {say: `Regular, at a paced rate now — ${v.hr}, and holding.`, kind: "obs", find: `Heart: transcutaneous pacing capturing, rate ${v.hr}.`};
      if (v.hr >= 55) return {say: `Slow, regular, but up out of the 30s now — around ${v.hr} — every beat still normal in character. On the monitor, a normal P wave before every QRS, just a bit closer together than it was.`, kind: "obs", find: `Heart: sinus bradycardia improved to ~${v.hr}, regular, normal P-QRS relationship.`};
      return {say: `Slow, regular, around ${v.hr} — and every beat feels normal in character, not the unusually forceful thump of a big escape complex. On the monitor, a normal P wave before every QRS, just far apart.`, kind: "crit",
        evid: "A P wave marching normally into every QRS, just at a very slow rate, is sinus bradycardia — the SA node itself firing too slowly, not a failure of the P wave to reach the ventricle. That distinction is what separates this from complete heart block.", find: `Heart: sinus bradycardia (~${v.hr}), regular, normal P-QRS relationship on the monitor.`};
    },
    skin: () => ({say: "Pale, cool, dry.", find: "Skin pale, cool, dry."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const paced = s.doses.some(d => d.id === "pacing") && (s.patient?.pacedCapture || 0) > 0.5;
    const gaveAtropine = s.given.atropine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A sinus rate too slow to sustain adequate output, never meaningfully raised — atropine alone (if tried) only partially corrects sinus node disease, and nothing here fully imposed a faster rate.";
    if (gaveAtropine && !paced) notes.push("Atropine helped — a real, measurable rise in rate — but not all the way to normal. Sinus node disease, unlike a complete block below the AV node, is still partly under vagal influence, so atropine buys a genuine partial improvement here, just not a full fix.");
    if (paced) notes.push("Transcutaneous pacing captured and imposed a faster rate, the most complete correction available in the field for a sinus node that will not speed up on its own.");
    if (!gaveAtropine && !paced) notes.push("Neither atropine nor pacing was tried. A sustained rate in the high 30s in a symptomatic, hypotensive patient is not something to just transport and hope improves.");
    notes.push("A normal P wave marching into every QRS at a very slow rate — not a P wave and QRS running independently — is the finding that separates sinus node disease from complete heart block, even though both can present as 'a very slow, forceful pulse.'");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Symptomatic sinus bradycardia from degenerative sinus node disease"};},
},

atrialFlutter: {cat: "medical", id: "CARD-033", pronouns: "he", title: "Male, 68. Racing heart, perfectly regular.",
  limit: 1400, transport: 540,
  bystanders: "His son is here for a weekly visit and noticed something was off.",
  units: [{at: 400, level: "emt", name: "BLS 9"}],
  dispatch: ["68M. Palpitations, feels fast and 'fluttery'.", "Conscious, mildly anxious.", "History of COPD."],
  update: [],
  impression: "Sitting on the edge of his couch, one hand on his chest, breathing a little fast. Alert and talking, more curious than distressed about how his heart feels.",
  imps: ["DYSR", "SOBB", "ANXY"],
  condition: "atrialFlutter",
  patient: {age: 68, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It came on maybe half an hour ago, just started fluttering fast in my chest. It doesn\'t feel chaotic, more like a fast, steady drumbeat. A little short of breath, but no real chest pain."', kind: "pt",
      evid: "Sudden-onset rapid palpitations described as a steady, even drumbeat rather than chaotic fluttering is worth listening to closely — regularity is the whole clinical distinction here.", find: "OPQRST: sudden rapid palpitations ~30 min ago, described as fast but steady; mild dyspnea, no chest pain."}),
    sample: () => ({say: "His son: \"He's got COPD, uses an inhaler. No heart pills that I know of. This has never happened before.\"", kind: "pt",
      evid: "COPD and structural lung disease are common substrates for atrial flutter — the same right-atrial stretch that predisposes to other atrial arrhythmias.", find: "SAMPLE: COPD on an inhaler, no cardiac medications, first episode."}),
    // Flutter is unusually cardioversion-responsive (its own resolve()
    // note below); diltiazem only steps the conduction ratio down (still
    // "flutter", lower rate). Reading v.rhythm/v.hr live proves both real
    // responses instead of describing a rate of 150 for the whole call.
    // MEASURED (throwaway probe, real physio() run, 600s): flutter's
    // conduction-ratio stepping is clean, not jittered like afib —
    // untreated holds ~149-150 (fixed 2:1), diltiazem-treated holds
    // ~123-129 (stepped to a higher ratio). A first draft used <120,
    // which the treated range NEVER reaches — a dead branch. 140 cleanly
    // separates the two.
    heart: (s, v) => v.rhythm !== "flutter"
      ? {say: `Regular now, rate ${v.hr} — no more sawtooth on the strip, it converted.`, kind: "obs", find: `Heart: converted to sinus rhythm, rate ${v.hr}.`}
      : v.hr < 140
        ? {say: `Still perfectly regular, but slower now — around ${v.hr}. The sawtooth flutter waves are still there between complexes.`, kind: "obs", find: `Heart: regular, rate-controlled flutter (~${v.hr}). Monitor: sawtooth flutter waves persist.`}
        : {say: "Fast — right around 150 — and, when you actually count it, perfectly regular. Not a single irregular beat in a full 30-second count.", kind: "crit",
          evid: "A rapid, perfectly REGULAR rate around 150 is the classic atrial flutter signature (a 2:1 conduction ratio off a ~300/min atrial rate) — the regularity is what separates it from atrial fibrillation's chaos, even at a similar rate.", find: "Heart: rapid (~150), perfectly regular. Monitor: sawtooth flutter waves between QRS complexes."},
    skin: () => ({say: "Warm, mildly diaphoretic.", find: "Skin warm, mildly diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const rateControlled = s.given.diltiazem;
    const cardioverted = s.doses.some(d => d.id === "cardiovert");
    const gaveAdenosine = s.given.adenosine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A sustained rapid ventricular response that was never rate-controlled or terminated.";
    if (gaveAdenosine) notes.push("Adenosine was tried. It can transiently slow AV conduction enough to unmask the flutter waves on the strip, but it does not terminate the atrial re-entrant circuit driving this rhythm — it did essentially nothing lasting here.");
    if (rateControlled) notes.push("Diltiazem given for rate control — a reasonable first move in a stable patient, slowing the ventricular response by pushing the AV conduction ratio higher (toward 3:1 or 4:1).");
    if (cardioverted) notes.push("Synchronised cardioversion was used. Atrial flutter is unusually responsive to this — it often converts at surprisingly low energy, more reliably than atrial fibrillation does.");
    if (!rateControlled && !cardioverted && !died) notes.push("Neither rate control nor cardioversion was tried. A sustained rate of 150 does not reliably resolve on its own.");
    notes.push("Perfectly regular at a rapid rate, with sawtooth flutter waves visible between QRS complexes on the strip, is the atrial flutter signature — regular is the key word, the opposite of atrial fibrillation's chaos even at a comparable rate.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Atrial flutter with 2:1 AV conduction, likely related to underlying COPD/right-atrial strain"};},
},

secondDegreeAVBlockTypeI: {cat: "medical", id: "CARD-034", pronouns: "he", title: "Male, 59. Lightheaded, well-conditioned runner.",
  limit: 1300, transport: 480,
  bystanders: "His running club teammate is with him, more curious than worried.",
  units: [{at: 380, level: "emt", name: "BLS 7"}],
  dispatch: ["59M. Lightheadedness after a long run.", "Conscious, alert.", "Says this has happened before after hard workouts."],
  update: [],
  impression: "Sitting on the curb with a water bottle, breathing easy, more annoyed than alarmed. Alert and talking normally.",
  imps: ["DYSR", "ALOC"],
  condition: "secondDegreeAVBlockTypeI",
  patient: {age: 59, gender: "male"},
  clothing: {top: "short", bottom: "shorts", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I run 40 miles a week, this happens sometimes right after a hard effort — a wave of lightheadedness that passes in a minute or two. No chest pain, no real palpitations, just feels like my heart skips every so often."', kind: "pt",
      evid: "A well-conditioned endurance athlete with transient lightheadedness tied to exertion and recovery, and a subjective sense of occasional skipped beats, fits a vagotonic conduction issue rather than a primary cardiac event.", find: "OPQRST: brief lightheadedness after hard exertion, occasional sense of skipped beats, no chest pain."}),
    sample: () => ({say: "Teammate: \"He's the fittest guy in the club, this isn't new for him. No meds, no health problems that I know of.\"", kind: "pt",
      evid: "No AV-nodal-slowing medication and a description consistent with athletic vagotonia — a well-trained heart with high resting vagal tone is a classic, usually benign substrate for this exact finding.", find: "SAMPLE: no medications, high-level endurance athlete, no other history."}),
    // Mobitz I is vagotonic — atropine's effective-parasympathetic-tone
    // term can genuinely pull the conduction ratio back toward 1:1 (the
    // resolve() note below calls it "occasionally genuinely helpful"), so
    // reading v.hr live lets a resolved block show up as a re-exam finding.
    heart: (s, v) => v.hr >= 60
      ? {say: `Regular now, up around ${v.hr} — no dropped beats on this run of the strip.`, kind: "obs", find: `Heart: rate normalized to ${v.hr}, conduction ratio restored, no dropped beats appreciated.`}
      : {say: "Mildly slow, and on the monitor the PR interval is stretching a little more each beat before one QRS just doesn't show up at all — then it resets and the pattern starts over.", kind: "crit",
        evid: "Progressively lengthening PR interval culminating in a dropped QRS, then resetting, is the Wenckebach (Mobitz I) pattern — the group-beating signature that distinguishes it from Mobitz II's sudden, unwarned dropped beat.", find: "Heart: mildly slow. Monitor: progressive PR prolongation with a periodically dropped QRS (Wenckebach pattern)."},
    skin: () => ({say: "Warm, dry, well-perfused.", find: "Skin warm, dry, well-perfused."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveAtropine = s.given.atropine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A conduction ratio that was never actually this dangerous on its own — something else in the call's management went wrong along the way.";
    if (gaveAtropine) notes.push("Atropine was given. Type I second-degree block is often vagotonic, so this is a reasonable, occasionally genuinely helpful move — but this is also the most benign point on the AV-block spectrum, and most cases like this one resolve on their own without needing it.");
    else notes.push("No atropine was given, which is defensible here: Mobitz I is usually benign, especially in a well-conditioned athlete, and often needs nothing more than monitoring and transport.");
    notes.push("Progressively lengthening PR intervals culminating in one dropped beat, then resetting — the 'group beating' pattern — is Wenckebach. Recognizing this pattern, and NOT Mobitz II's sudden unwarned drop, is what tells you this is the benign end of the second-degree spectrum.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Second-degree AV block, Mobitz Type I (Wenckebach), likely vagotonic in a well-conditioned athlete"};},
},

secondDegreeAVBlockTypeII: {cat: "medical", id: "CARD-035", pronouns: "she", title: "Female, 74. Intermittent dizzy spells, feels her heart 'pause'.",
  limit: 1400, transport: 480,
  bystanders: "Her husband called after she nearly went down in the kitchen.",
  units: [{at: 400, level: "emt", name: "BLS 8"}],
  dispatch: ["74F. Intermittent dizziness, near-fall.", "Conscious, alert.", "History of hypertension."],
  update: ["Husband: \"There it goes again — she just went pale for a second.\""],
  impression: "Standing by the counter, gripping it, pale for a moment before color returns. Alert throughout, unsettled by how sudden it feels each time.",
  imps: ["DYSR", "ALOC", "HOTN"],
  condition: "secondDegreeAVBlockTypeII",
  patient: {age: 74, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It just happens out of nowhere — no warning at all, my heart seems to pause and then I go lightheaded for a few seconds. It\'s been happening more the last few days."', kind: "pt",
      evid: "Sudden, unwarned episodes with no build-up — no gradual worsening feeling beforehand — is the key contrast with the Wenckebach pattern, where patients often notice a crescendo before the drop.", find: "OPQRST: sudden unwarned dizzy spells over several days, no prodrome, worsening frequency."}),
    sample: () => ({say: "Her husband: \"Just her blood pressure pill, that's it. Nothing new. Her doctor never mentioned anything about her heart.\"", kind: "pt",
      evid: "No AV-nodal-slowing medication and no known prior conduction disease — this reads as new, progressive conduction system disease rather than a drug effect or an old, stable finding.", find: "SAMPLE: lisinopril only, no known cardiac history, symptoms progressive over days."}),
    // Mobitz II is infranodal — atropine only nudges the rate a little
    // (per resolve()'s own honest note) and never fixes the dropped-beat
    // pattern itself; pacing capture is the one thing that does. Reading
    // pacedCapture live is the real teaching point: rate alone (atropine)
    // isn't the same as actually correcting the block.
    heart: (s, v) => (s.patient?.pacedCapture || 0) > 0.5
      ? {say: `Regular, paced now at ${v.hr} — captured, no more dropped beats.`, kind: "obs", find: `Heart: transcutaneous pacing capturing, rate ${v.hr}.`}
      : {say: "On the monitor, the PR interval looks the same beat to beat — no build-up, no warning — and then a QRS is simply missing, out of nowhere.", kind: "crit",
        evid: "A CONSTANT PR interval with a sudden, unwarned dropped QRS — no progressive lengthening beforehand — is the Mobitz II signature, and it carries a real risk of sudden progression to complete heart block that Type I does not.", find: "Heart: monitor shows a fixed PR interval with an intermittent, unwarned dropped QRS (Mobitz II pattern)."},
    skin: () => ({say: "Pale during episodes, otherwise unremarkable.", find: "Skin pale during episodes, otherwise unremarkable."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const paced = s.doses.some(d => d.id === "pacing") && (s.patient?.pacedCapture || 0) > 0.5;
    const gaveAtropine = s.given.atropine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Progressive infranodal conduction disease with a real risk of sudden complete block, and nothing was done to be ready to impose a rate if it progressed.";
    if (gaveAtropine && !paced) notes.push("Atropine was given. It may have nudged the rate up a little, but it did not fix the actual conduction problem — Mobitz II is infranodal disease, not meaningfully vagally mediated, and this drug's own note says exactly that: useless in 2° type II or 3° block. Pacing pads should have gone on regardless of whether atropine was tried.");
    if (paced) notes.push("Pacing pads were applied and ready — the correct move for Mobitz II, which can progress to complete heart block with no warning at all.");
    if (!gaveAtropine && !paced) notes.push("Neither atropine nor pacing readiness was addressed. Mobitz II is exactly the rhythm ACLS teaches you not to sit on — the risk is sudden progression, not gradual decline.");
    notes.push("A fixed PR interval with a sudden, unwarned dropped beat — no progressive lengthening first — is Mobitz II, and that distinction from Wenckebach matters clinically: this one can become complete heart block without any further warning sign.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Second-degree AV block, Mobitz Type II, infranodal conduction disease with risk of progression to complete heart block"};},
},

monomorphicVT: {cat: "medical", id: "CARD-036", pronouns: "he", title: "Male, 61. Racing heart, surprisingly comfortable.",
  limit: 1400, transport: 540,
  bystanders: "His wife is watching closely but he's waved off her worry twice already.",
  units: [{at: 400, level: "emt", name: "BLS 9"}],
  dispatch: ["61M. Palpitations, heart racing per patient.", "Conscious, talking normally.", "History of a heart attack four years ago."],
  update: [],
  impression: "Sitting comfortably on the couch, one hand loosely over his chest, talking in full sentences and mostly annoyed at being fussed over.",
  imps: ["DYSR", "CPNC"],
  condition: "monomorphicVT",
  patient: {age: 61, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It just kicked in about ten minutes ago, out of nowhere. Racing, but honestly I feel mostly fine — a little off, not like last time." His wife interjects: "Last time was his heart attack. He was gray. He doesn\'t look like that now."', kind: "pt",
      evid: "A sudden regular racing sensation in a patient with a KNOWN prior MI, who still looks and feels well — talking in full sentences, comfortable — is the key finding: this rhythm has a pulse, and looks nothing like his last cardiac event.", find: "OPQRST: sudden racing sensation ~10 min ago, patient looks and feels comfortable, prior MI four years ago."}),
    sample: () => ({say: "Wife: \"He takes a baby aspirin and a statin, that's it. The cardiologist said his heart 'has some scar tissue' from before but otherwise he's doing well.\"", kind: "pt",
      evid: "Known old scar tissue from a prior MI is exactly the substrate for a re-entrant monomorphic VT — chronic and structural, not a new acute event.", find: "SAMPLE: aspirin and a statin only; known old MI scar per cardiology."}),
    // Cardioversion (and defib, less cleanly) sets pat.rhythm to "sinus"
    // for real (pk.js rhythmFix "cardiovert" includes "VT") — a re-exam
    // after conversion should show it, not the same 180 forever.
    heart: (s, v) => v.rhythm !== "VT"
      ? {say: `Regular now, rate ${v.hr} — no more wide-complex on the strip, it converted.`, kind: "obs", find: `Heart: converted to sinus rhythm, rate ${v.hr}.`}
      : {say: `Fast and regular, right around ${v.hr}. He's talking to you in full sentences the whole time you're counting it.`, kind: "crit",
        evid: "A regular, rapid, wide-complex rhythm in a patient who is talking normally and clearly perfusing is a STABLE VT — the assessment that matters here is the pulse and mentation, not the rhythm name alone, since the same rhythm can be immediately lethal in a sicker patient.", find: `Heart: rapid (~${v.hr}), regular, wide-complex on the monitor. Patient alert, talking, radial pulse present and strong.`},
    skin: () => ({say: "Warm, dry, well-perfused, good color.", find: "Skin warm, dry, well-perfused."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const cardioverted = s.doses.some(d => d.id === "cardiovert");
    const defibbed = s.doses.some(d => d.id === "defib");
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A sustained wide-complex tachycardia that was never terminated, and eventually outlasted his ability to compensate.";
    if (defibbed && !died) notes.push("Unsynchronised defibrillation was used on a patient who still had a pulse. It can still work, but shocking on the T-wave in a perfusing patient risks inducing a genuinely lethal rhythm — synchronised cardioversion is the correct tool once you've confirmed there's a pulse to synchronise to.");
    if (cardioverted) notes.push("Synchronised cardioversion was used — the correct field treatment for stable, pulsed VT: it terminates the rhythm without the T-wave-timing risk unsynchronised defibrillation carries in a perfusing patient.");
    if (!cardioverted && !defibbed && !died) notes.push("Neither cardioversion nor an antiarrhythmic was tried. A sustained rate of 180 in VT does not reliably resolve on its own, even in a patient who currently looks well.");
    notes.push("The single most important assessment on this call was checking for a pulse before reaching for the defibrillator — the exact same rhythm name (VT) is managed completely differently depending on whether the patient in front of you is perfusing or not.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Monomorphic ventricular tachycardia with a pulse, from an old post-MI scar re-entrant circuit"};},
},

wpwAfib: {cat: "medical", id: "CARD-037", pronouns: "she", title: "Female, 29. Sudden extreme racing heart, known 'odd heart rhythm.'",
  limit: 1400, transport: 540,
  bystanders: "Her roommate is scared and already has the door propped open for you.",
  units: [{at: 380, level: "emt", name: "BLS 8"}],
  dispatch: ["29F. Sudden severe palpitations, near-syncope.", "Conscious, distressed.", "Roommate says she has 'some kind of extra heart wire' per a cardiologist."],
  update: ["Roommate: \"She's getting more confused, this doesn't look right at all.\""],
  impression: "Sitting hunched on the bathroom floor where her roommate found her, pale, breathing hard, gripping the sink. Answers questions slowly and seems more confused than a moment ago.",
  imps: ["DYSR", "ALOC", "SOBB"],
  condition: ["atrialFibrillation", "wpw"],
  patient: {age: 29, gender: "female", hr: 220},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It just exploded — one second I was fine, the next my heart was slamming impossibly fast. I feel like I\'m going to pass out." (Getting harder to rouse as you talk to her.)', kind: "pt",
      evid: "An extremely fast onset with rapid mentation decline, in a young patient with a known accessory pathway, is the exact combination that makes this specific arrhythmia genuinely lethal — this is not a routine AFib call.", find: "OPQRST: sudden extreme racing heart, rapidly worsening mentation."}),
    sample: () => ({say: "Roommate: \"Her cardiologist told her years ago she has an extra electrical pathway in her heart, Wolff-something. She was supposed to get a procedure to fix it but kept putting it off.\"", kind: "pt",
      evid: "A known, undertreated accessory pathway (Wolff-Parkinson-White) combined with a new atrial fibrillation is the single most dangerous rhythm combination in this differential — the bypass tract does not protect the ventricle from the atria's chaotic rate the way the AV node normally does.", find: "SAMPLE: known Wolff-Parkinson-White syndrome, never definitively treated."}),
    // Cardioversion converts for real; an AV-nodal blocker is relatively
    // contraindicated here and can shunt MORE conduction down the
    // accessory pathway (resolve() below) — reading v.rhythm/v.hr live
    // lets a wrong drug choice show up as a genuinely FASTER rate, not
    // just a debrief note after the fact.
    heart: (s, v) => v.rhythm !== "afib"
      ? {say: `Regular now, rate ${v.hr} — converted, no more bizarre wide-complex tracing.`, kind: "obs", find: `Heart: converted to sinus rhythm, rate ${v.hr}.`}
      : {say: `Extremely fast — ${v.hr} — and completely irregular, no pattern to it at all. The monitor shows a chaotic, bizarre-looking wide-complex tracing.`, kind: "crit",
        evid: "An irregularly irregular rate this extreme, with a bizarre wide-complex morphology, is the WPW-plus-AFib signature — conduction is reaching the ventricle through the accessory pathway instead of the normal, rate-limiting AV node.", find: `Heart: extremely rapid (${v.hr}), irregularly irregular, bizarre wide-complex morphology on the monitor.`},
    skin: () => ({say: "Pale, diaphoretic, cool.", find: "Skin pale, diaphoretic, cool."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveBlocker = s.given.diltiazem || s.given.adenosine;
    const cardioverted = s.doses.some(d => d.id === "cardiovert");
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "An extreme, unchecked ventricular rate conducting down the accessory pathway, made worse rather than better by the drugs given for it.";
    if (gaveBlocker) notes.push("An AV-nodal blocker (diltiazem/adenosine) was given. In WPW with AFib this is relatively contraindicated: blocking the AV node does not slow conduction down the accessory pathway, and can shunt MORE of the chaotic atrial activity that way — this did not help, and may have made things worse.");
    if (cardioverted) notes.push("Synchronised cardioversion was used — appropriate for an unstable patient in this specific dangerous combination, and the correct move regardless of which drugs were or weren't tried first.");
    if (!gaveBlocker && !cardioverted && !died) notes.push("Nothing was tried to address the rate or terminate the rhythm. This particular combination does not reliably slow down on its own, and the patient's mentation was already declining.");
    notes.push("A known accessory pathway (WPW) plus new atrial fibrillation is a specific, teachable exception to the usual 'give an AV-nodal blocker for a fast irregular rhythm' reflex — recognizing the history (a known extra electrical pathway) is what should have changed the drug choice here.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Atrial fibrillation with Wolff-Parkinson-White syndrome (pre-excited AFib), a dangerous combination given AV-nodal blockade rather than cardioversion or procainamide"};},
},

digoxinToxicity: {cat: "medical", id: "CARD-038", pronouns: "she", title: "Female, 79. Nausea, confusion, seeing 'yellow halos'.",
  limit: 1400, transport: 480,
  bystanders: "Her daughter is going through the pill organizer, counting.",
  units: [{at: 400, level: "emt", name: "BLS 8"}],
  dispatch: ["79F. Nausea, confusion x1 day.", "Conscious, alert but slow.", "History of atrial fibrillation on digoxin."],
  update: [],
  impression: "Sitting in a recliner, pale and a little green-looking, holding a basin. Answers slowly, mentions the room looks 'off' when you ask how she's feeling.",
  imps: ["DYSR", "ALOC", "ODPO"],
  condition: "digoxinToxicity",
  patient: {age: 79, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I\'ve been queasy and off since yesterday, and everything has this yellow-green tinge to it, like looking through a dirty window. My stomach\'s the worst part, honestly."', kind: "pt",
      evid: "Nausea plus a visual disturbance described as a yellow-green tinge is a classic, specific digoxin toxicity symptom (xanthopsia) — not a generic \"feels sick\" complaint.", find: "OPQRST: one day of nausea and a yellow-green visual halo, no chest pain."}),
    sample: () => ({say: "Daughter (counting the pill organizer): \"She's on digoxin for her irregular heartbeat, plus a water pill. Wait — Tuesday and Wednesday's digoxin are still in here, she must have doubled up thinking she missed them.\"", kind: "pt",
      evid: "A documented digoxin prescription plus an accidental double-dosing pattern is a specific, identifiable cause — not a mystery poisoning.", find: "SAMPLE: digoxin and a diuretic; recent accidental double-dosing of digoxin found in the pill organizer."}),
    // Atropine gives a real, partial rate improvement here (resolve()
    // below); the ectopy itself doesn't clear in the field (the real
    // antidote isn't in this drug box) — reading v.hr live lets that
    // partial response show without pretending the toxicity resolved.
    heart: (s, v) => ({say: `Slow and a little irregular-feeling, around ${v.hr}. Monitor shows a prolonged PR interval and occasional extra beats scattered through an otherwise organized rhythm.`, kind: "crit",
      evid: "Bradycardia with a prolonged PR interval AND ectopy together — a slow rhythm that is ALSO irritable — is the classic combined picture of digoxin toxicity, not just a plain bradycardia.", find: `Heart: bradycardic (~${v.hr}), monitor shows PR prolongation with intermittent ectopic beats.`}),
    skin: () => ({say: "Pale, cool, clammy.", find: "Skin pale, cool, clammy."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveAtropine = s.given.atropine;
    const gaveCalcium = s.given.calcium;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Digoxin toxicity with a combination of AV block and ventricular irritability that was never addressed, in a patient whose actual antidote (digoxin-specific antibody fragments) isn't in this drug box.";
    if (gaveCalcium) notes.push("Calcium was given — worth flagging even though it wasn't clearly harmful here: calcium is the reflex treatment for hyperkalaemia, but in DIGOXIN-toxic hyperkalaemia specifically, many protocols urge caution (the classically-taught, if debated, 'stone heart' concern), since digoxin's own calcium-overload mechanism is part of what's already destabilizing this heart.");
    if (gaveAtropine) notes.push("Atropine was given and produced a real, if partial, improvement — digoxin's bradycardic effect is partly vagally mediated, so this is a reasonable supportive move even though it doesn't address the underlying toxicity.");
    notes.push("The actual antidote here — digoxin-specific antibody fragments — is not something a field drug box carries. The job on this call is recognition (the specific nausea/visual-disturbance/bradycardia-with-ectopy triad), supportive care, and getting her to a facility that can give the real treatment.");
    notes.push("A slow rhythm that is ALSO throwing extra beats is the tell: digoxin toxicity uniquely combines AV block with increased ventricular irritability, rather than being purely one or the other.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Digoxin toxicity from accidental double-dosing, with AV nodal slowing, mild hyperkalaemia, and ventricular ectopy"};},
},

pericarditis: {cat: "medical", id: "CARD-039", pronouns: "he", title: "Male, 34. Sharp chest pain, worse lying down.",
  limit: 1200, transport: 480,
  bystanders: "His girlfriend drove him most of the way before pulling over to call.",
  units: [{at: 360, level: "emt", name: "BLS 7"}],
  dispatch: ["34M. Chest pain.", "Conscious, uncomfortable but talking.", "Had a 'cold' last week per patient."],
  update: [],
  impression: "Sitting bolt upright, leaning forward with his elbows on his knees. Uncomfortable but breathing fine, alert and conversational.",
  imps: ["CPNC", "CPMI", "ANXY"],
  condition: "pericarditis",
  patient: {age: 34, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It\'s sharp, right in the middle of my chest, and it\'s so much worse when I lie flat — leaning forward like this actually helps a lot. Gets worse when I take a deep breath too. Had a nasty cold last week, this started a couple days after."', kind: "pt",
      evid: "Sharp, pleuritic (worse with breathing) chest pain that is POSITIONAL — worse lying flat, better leaning forward — following a recent viral illness is the classic pericarditis presentation, and that positional quality is not something ACS produces.", find: "OPQRST: sharp, pleuritic, positional chest pain (worse supine, better leaning forward), following a viral illness last week."}),
    sample: () => ({say: "\"No meds, no health problems, I'm 34 and I run half-marathons. This just came out of nowhere after that cold.\"", kind: "pt",
      evid: "A young, healthy patient with no cardiac risk factors and a clear preceding viral illness makes a primary ischemic event far less likely and a post-viral inflammatory cause far more likely.", find: "SAMPLE: no medications, no cardiac risk factors, recent viral prodrome, otherwise healthy."}),
    heart: () => ({say: "Regular, mildly fast. Listening closely between heartbeats you can just make out a faint scratching sound.", kind: "crit",
      evid: "A pericardial friction rub — a faint scratching sound timed with the heartbeat, best heard leaning forward — is a specific, if not always present, sign of pericardial inflammation.", find: "Heart: regular, mildly tachycardic. A faint pericardial friction rub is audible."}),
    skin: () => ({say: "Warm, dry, good color.", find: "Skin warm, dry, good color."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something else in this call's management went wrong — uncomplicated pericarditis on its own does not kill a patient in the span of a single call.";
    notes.push("Positional, pleuritic chest pain — worse flat, better leaning forward — following a recent viral illness, in a young patient with no cardiac risk factors, points to pericarditis rather than ACS. Recognizing this pattern (and not reflexively treating every chest pain as a possible MI) is the actual skill this call is testing.");
    notes.push("A pericardial friction rub, when you can hear it, is a genuinely specific finding — but its absence doesn't rule pericarditis out. The history (positional, pleuritic, post-viral) carries most of the diagnostic weight here.");
    notes.push("There is no field-treatable emergency here beyond supportive care and appropriate transport; the real workup (ECG, echo, inflammatory markers, NSAIDs) happens at the hospital.");
    return {died, cause, notes, correct: s.pi === "CPNC", truth: "Acute pericarditis, likely post-viral, without hemodynamically significant effusion"};},
},

myocarditis: {cat: "medical", id: "CARD-040", pronouns: "she", title: "Female, 24. Chest discomfort and fatigue after a bad flu.",
  limit: 1400, transport: 540,
  bystanders: "Her roommate drove her partway before deciding to call instead.",
  units: [{at: 400, level: "emt", name: "BLS 9"}],
  dispatch: ["24F. Chest discomfort, fatigue.", "Conscious, tired-appearing.", "Recovering from a bad flu per roommate."],
  update: ["Roommate: \"She keeps saying she just can't catch her breath right, even sitting still.\""],
  impression: "Sitting propped against the couch arm, pale and visibly winded even at rest. Alert, but clearly working harder to breathe than the room temperature explains.",
  imps: ["CPMI", "CHFF", "SOBB"],
  condition: "myocarditis",
  patient: {age: 24, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I had a really bad flu about a week ago, fevers and everything. I thought I was getting better, but the last couple days I\'ve just felt wrecked — some chest discomfort, and I get winded doing basically nothing."', kind: "pt",
      evid: "New exertional dyspnea and chest discomfort emerging IN THE WAKE of a viral illness, in a young patient, is the classic myocarditis pattern — the heart failure symptoms are trailing the infection, not appearing out of nowhere.", find: "OPQRST: chest discomfort and dyspnea on minimal exertion, following a severe flu about a week ago."}),
    sample: () => ({say: "\"I'm 24, I was totally healthy before this. No meds, no heart problems ever.\"", kind: "pt",
      evid: "A young, previously healthy patient developing heart-failure-like symptoms shortly after a viral illness, with no other explanation, points strongly at inflammatory (viral) myocarditis rather than a primary cardiac disease.", find: "SAMPLE: no medications, no prior cardiac history, recent severe viral illness."}),
    heart: () => ({say: "Fast, and the sounds are a little distant and soft, like the pump behind them isn't working quite as hard as it should.", find: "Heart: tachycardic, heart sounds somewhat distant/soft."}),
    skin: () => ({say: "Pale, cool, mildly diaphoretic.", find: "Skin pale, cool, mildly diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Progressive inflammatory myocardial injury depressing cardiac function, in a call where nothing was done to support a failing pump other than transport.";
    notes.push("A young, previously healthy patient with new heart-failure-like symptoms trailing a viral illness by about a week is the pattern to recognize — myocarditis doesn't look like a typical cardiac patient, which is exactly why it gets missed.");
    notes.push("There is no field cure for viral myocarditis. The job here is recognition, supportive care (positioning, oxygen if needed, gentle handling — a stressed, inflamed heart tolerates exertion poorly), and prompt transport to a facility that can confirm it and manage the failing pump.");
    return {died, cause, notes, correct: s.pi === "CPMI", truth: "Acute (likely viral) myocarditis with early depressed cardiac contractility, following a recent flu-like illness"};},
},

hypertensiveUrgency: {cat: "medical", id: "CARD-041", pronouns: "he", title: "Male, 57. Severe headache, sky-high pressure at the pharmacy.",
  limit: 1200, transport: 480,
  bystanders: "The pharmacist walked him out and stayed until you arrived.",
  units: [{at: 360, level: "emt", name: "BLS 7"}],
  dispatch: ["57M. Severe headache, blood pressure reading extremely high per pharmacy staff.", "Conscious, alert.", "Ran out of blood pressure medication two weeks ago."],
  update: [],
  impression: "Sitting in a chair near the pharmacy counter, holding his head, uncomfortable but alert and answering clearly.",
  imps: ["HOTN", "ALOC"],
  condition: "hypertensiveUrgency",
  patient: {age: 57, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"Just a bad headache the last day or so, and the pharmacy machine said my pressure was through the roof so they made me sit down. No chest pain, no trouble breathing, no weakness anywhere, vision\'s fine."', kind: "pt",
      evid: "A severe headache with an alarmingly high blood pressure reading, but NO chest pain, NO focal weakness, NO visual changes, and NO breathing difficulty, is the key negative finding — there is no evidence yet of acute end-organ damage.", find: "OPQRST: severe headache ~1 day, no chest pain, no focal deficits, no visual changes, no dyspnea."}),
    sample: () => ({say: "\"I take two pills for my blood pressure, but I ran out about two weeks ago and kept meaning to get to the doctor. Guess I should've done that sooner.\"", kind: "pt",
      evid: "A known hypertensive patient who ran out of medication two weeks ago is a specific, identifiable, common cause of a severe but uncomplicated pressure elevation.", find: "SAMPLE: two antihypertensives, both stopped ~2 weeks ago; otherwise unremarkable."}),
    // Nitro (venodilation/arteriolarDilation, drugs.js) genuinely lowers
    // baseSVR-driven pressure over the call — reading v.sbp/v.dbp live
    // means the number itself moves if it's given, instead of a fixed
    // "severely elevated" description regardless of treatment.
    heart: (s, v) => ({say: `Regular, unremarkable rate. Blood pressure reads ${v.sbp}/${v.dbp} on both arms.`, find: `Heart: regular, rate ${v.hr}. BP ${v.sbp}/${v.dbp} bilaterally, no other cardiac findings.`}),
    skin: () => ({say: "Warm, dry, normal color.", find: "Skin warm, dry, normal color."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something else in this call's management went wrong — uncomplicated hypertensive urgency does not kill a patient over the span of a single call.";
    notes.push("The whole job on this call was recognizing that this is urgency, not emergency — severe hypertension WITHOUT chest pain, focal weakness, visual changes, or breathing trouble means there is no evidence of acute end-organ damage.");
    notes.push("There is no field drug in this box appropriate for aggressively lowering blood pressure in the field for a call like this, and there shouldn't be one reached for: dropping severely elevated pressure too fast risks watershed cerebral or myocardial ischemia. The correct move is a thorough exam to rule out emergency features, then transport for a controlled, gradual outpatient-style correction.");
    return {died, cause, notes, correct: s.pi === "HOTN", truth: "Hypertensive urgency (severe, asymptomatic-for-end-organ-damage hypertension) from medication non-adherence"};},
},

hypertensiveEmergency: {cat: "medical", id: "CARD-042", pronouns: "she", title: "Female, 61. Severe headache and sudden trouble breathing.",
  limit: 1400, transport: 480,
  bystanders: "Her husband is pacing, phone still in hand from the 911 call.",
  units: [{at: 400, level: "emt", name: "BLS 9"}],
  dispatch: ["61F. Severe headache, acute shortness of breath.", "Conscious, distressed.", "History of poorly controlled hypertension."],
  update: ["Husband: \"Her breathing is getting worse by the minute.\""],
  impression: "Sitting bolt upright on the edge of the bed, working hard to breathe, pale and sweating. Alert but clearly frightened and struggling.",
  imps: ["HOTN", "CHFF", "SOBB"],
  condition: "hypertensiveEmergency",
  patient: {age: 61, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"My head is pounding and all of a sudden I can\'t catch my breath at all, it just hit me in the last twenty minutes or so." (Coughing, working visibly hard to breathe.)', kind: "pt",
      evid: "A severe headache combined with SUDDEN, acute shortness of breath is the key difference from an uncomplicated pressure elevation — this is real, acute end-organ involvement (the heart backing up into the lungs), not just an alarming number.", find: "OPQRST: severe headache, sudden acute dyspnea over ~20 minutes."}),
    sample: () => ({say: "Husband: \"Her blood pressure's always been bad, she doesn't take her pills like she should. I've never seen her like this though.\"", kind: "pt",
      evid: "Longstanding poorly controlled hypertension culminating in a sudden new symptom (acute dyspnea) is exactly the pattern for a hypertensive emergency — chronic disease, acute decompensation.", find: "SAMPLE: chronic poorly-controlled hypertension, medication non-adherent, first time this severe."}),
    // Live sbp/dbp (nitro genuinely lowers them) and v.edema (the same
    // >0.3 crackles threshold the default heart action already uses) —
    // if respiratory support/nitro actually improve the edema over the
    // call, the crackles finding should reflect that instead of always
    // reporting them.
    heart: (s, v) => ({say: `Fast — rate ${v.hr}. Blood pressure reads ${v.sbp}/${v.dbp} on both arms.` + (v.edema > 0.3 ? " You can hear crackles at both lung bases." : " Lungs are clearer than you'd expect for a pressure this high — the edema seems to be settling."), kind: "crit",
      evid: "Severely elevated blood pressure WITH crackles at the lung bases (flash pulmonary edema) together confirm this is a true hypertensive emergency — real acute end-organ damage from the pressure itself, not just an alarming number on the cuff.", find: `Heart: tachycardic (${v.hr}). BP ${v.sbp}/${v.dbp}.` + (v.edema > 0.3 ? " Lungs: bibasilar crackles." : " Lungs currently clear.")}),
    skin: () => ({say: "Pale, cool, diaphoretic.", find: "Skin pale, cool, diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Acutely elevated afterload the heart could not keep up with, backing up into the lungs, with nothing done to support her breathing or reduce the workload on a failing pump.";
    notes.push("Crackles at the lung bases plus a dangerously high pressure together is what separates this from hypertensive urgency — this is real, acute end-organ damage (flash pulmonary edema from a sudden afterload mismatch), not just an alarming number.");
    notes.push("Supportive respiratory care (positioning, oxygen, CPAP if available and tolerated) is the field-appropriate move — definitive, carefully controlled blood pressure reduction happens at the hospital, not with a rapid field drop that risks watershed ischemia.");
    return {died, cause, notes, correct: s.pi === "CHFF", truth: "Hypertensive emergency with acute flash pulmonary edema from a sudden afterload mismatch"};},
},

prematureVentricularContractions: {cat: "medical", id: "CARD-043", pronouns: "she", title: "Female, 42. Feels her heart 'skipping beats.'",
  limit: 1200, transport: 480,
  bystanders: "A coworker walked her outside for air and is waiting nearby.",
  units: [{at: 360, level: "emt", name: "BLS 7"}],
  dispatch: ["42F. Palpitations, feels heart 'skipping'.", "Conscious, alert, anxious.", "No chest pain per patient."],
  update: [],
  impression: "Sitting on a curb outside her office, one hand on her chest, clearly unsettled but breathing comfortably and talking in full sentences.",
  imps: ["DYSR", "CPMI", "ANXY"],
  condition: "prematureVentricularContractions",
  patient: {age: 42, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It feels like my heart flip-flops, then there\'s a weird pause, and then it just carries on like nothing happened. No pain anywhere, doesn\'t happen when I\'m walking around, just comes and goes. I\'ve had about six cups of coffee today, we have a huge deadline."', kind: "pt",
      evid: "Isolated flip-flop-then-pause sensations, with no chest pain and no exertional pattern, in the setting of heavy caffeine and acute stress, is the classic presentation of benign ectopy rather than a dangerous rhythm.", find: "OPQRST: intermittent skipped-beat sensations, no chest pain, heavy caffeine intake today, no exertional trigger."}),
    sample: () => ({say: '"No medications, no heart problems ever, I run three times a week. This has honestly never happened before today."', kind: "pt",
      evid: "No cardiac history and no medications in an otherwise healthy, active patient makes a structural or ischemic cause unlikely and a benign, situational trigger (caffeine, stress, sleep deprivation) far more likely.", find: "SAMPLE: no medications, no cardiac history, physically active, no prior similar episodes."}),
    heart: () => ({say: "Mostly regular, but more than once a minute you feel an early beat followed by a brief pause before the next normal one. Monitor confirms — frequent, uniform-looking extra beats scattered through an otherwise normal strip.", kind: "crit",
      evid: "Ectopic beats occurring more than once a minute, all the same shape (unifocal), on an otherwise completely normal-looking strip, is the frequent-but-benign pattern — not the multiform or clustered ectopy that would actually be concerning.", find: "Heart: regular underlying rhythm with frequent (>1/min), uniform, isolated extra beats (PVCs) on the monitor."}),
    skin: () => ({say: "Warm, dry, normal color.", find: "Skin warm, dry, normal color."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveAntiarrhythmic = s.given.amiodarone || s.given.lidocaine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something else in this call's management went wrong — isolated, unifocal PVCs in a structurally normal heart do not kill a patient over the span of a single call.";
    if (gaveAntiarrhythmic) notes.push("An antiarrhythmic was given here. It wasn't dangerous, but it also wasn't indicated: frequent, uniform, isolated PVCs in a young patient with no chest pain, no structural heart disease, and an obvious benign trigger (caffeine, stress) do not need field antiarrhythmic treatment — that exposes her to a real drug's real side effects for no benefit.");
    else notes.push("No antiarrhythmic was given — correctly. Benign, unifocal PVCs with an identifiable trigger and no other red flags are a recognize-and-reassure finding in the field, not a treat-and-suppress one.");
    notes.push("The skill on this call is telling BENIGN ectopy from DANGEROUS ectopy: uniform shape, an identifiable non-cardiac trigger, no chest pain, no structural heart disease, and no other red flags all point the same direction here.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Frequent, unifocal, idiopathic premature ventricular contractions with an identifiable caffeine/stress trigger, in a structurally normal heart"};},
},

prematureAtrialContractions: {cat: "medical", id: "CARD-044", pronouns: "he", title: "Male, 58. Occasional heart 'flutter,' otherwise fine.",
  limit: 1200, transport: 480,
  bystanders: "His neighbor, a retired nurse, is the one who insisted he get checked.",
  units: [{at: 360, level: "emt", name: "BLS 7"}],
  dispatch: ["58M. Intermittent palpitations.", "Conscious, alert, mildly anxious.", "No chest pain, no syncope."],
  update: [],
  impression: "Standing on his porch, a little sheepish about the call, but pointing to his chest when you ask what's going on.",
  imps: ["DYSR", "ANXY", "CPMI"],
  condition: "prematureAtrialContractions",
  patient: {age: 58, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"Every so often I get this little flutter in my chest, like a hiccup, and it\'s gone before I can even really notice it. No pain, no dizziness, I feel totally normal in between. My neighbor made me call."', kind: "pt",
      evid: "Brief, isolated flutter sensations with a completely normal in-between period, no pain, and no dizziness, is a mild presentation consistent with isolated atrial ectopy rather than a sustained or dangerous rhythm.", find: "OPQRST: brief, isolated flutter sensations, asymptomatic between episodes, no chest pain, no dizziness."}),
    sample: () => ({say: '"Just a statin, that\'s it. No heart problems that I know of. I did have two pots of coffee already today, if that matters."', kind: "pt",
      evid: "Minimal medical history and an identifiable stimulant trigger, with no other complaints, supports a benign cause over a dangerous new arrhythmia.", find: "SAMPLE: statin only, no cardiac history, heavy caffeine intake today."}),
    heart: () => ({say: "Regular rate and rhythm on exam and on the monitor — but every so often you catch a single early beat interrupting an otherwise clean, regular strip, then it settles right back.", kind: "crit",
      evid: "Isolated, occasional early beats interrupting an otherwise perfectly regular strip — never sustained, never continuously irregular — is the PAC pattern, clearly distinct from atrial fibrillation's continuous irregularity.", find: "Heart: regular rate and rhythm with occasional isolated premature beats (PACs); no sustained irregularity."}),
    skin: () => ({say: "Warm, dry, normal color.", find: "Skin warm, dry, normal color."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something else in this call's management went wrong — isolated, occasional PACs do not kill a patient over the span of a single call.";
    notes.push("Isolated early beats on an otherwise regular strip, with a normal in-between period and an identifiable stimulant trigger, is PACs — a common, usually benign finding, not sustained atrial fibrillation.");
    notes.push("There is no field treatment indicated here. PACs are worth documenting and mentioning at handoff (they can be an early marker for future atrial fibrillation), but they do not call for an antiarrhythmic, a vagal maneuver, or anything beyond a thorough exam and appropriate transport.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Frequent, isolated premature atrial contractions with an identifiable caffeine trigger, no structural heart disease"};},
},

sickSinusSyndrome: {cat: "medical", id: "CARD-045", pronouns: "she", title: "Female, 80. Alternating spells of dizziness and racing heart.",
  limit: 1500, transport: 540,
  bystanders: "Her daughter, visiting for the week, is the one who called.",
  units: [{at: 420, level: "emt", name: "BLS 11"}],
  dispatch: ["80F. Alternating episodes of dizziness and a racing heart sensation.", "Conscious, alert between episodes.", "History of an unspecified 'heart rhythm problem'."],
  update: ["Daughter: \"She just went from looking gray and out of it to saying her heart's pounding, back and forth, twice now since you got the call.\""],
  impression: "Sitting in her armchair, alert but visibly fatigued, describing a pattern that has repeated itself several times this morning.",
  imps: ["DYSR", "ALOC"],
  condition: "sickSinusSyndrome",
  patient: {age: 80, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It\'s the strangest thing — I\'ll feel so dizzy and slow I can barely keep my eyes open, and then a few minutes later my heart is just racing and I feel jittery, and then it goes right back to the dizzy, foggy feeling again. It\'s been doing that back and forth all morning."', kind: "pt",
      evid: "A patient ALTERNATING between distinct dizzy/bradycardic spells and distinct racing/tachycardic spells over the same morning, rather than one fixed pattern, is the specific tachy-brady presentation of sick sinus syndrome.", find: "OPQRST: alternating episodes of profound dizziness/fatigue and heart racing, repeating over several hours."}),
    sample: () => ({say: "Daughter: \"She's had some kind of 'rhythm problem' for a couple years, on a low dose of a heart medication, but I don't remember exactly what it's for.\"", kind: "pt",
      evid: "A known, vaguely-described chronic rhythm disorder is consistent with sick sinus syndrome — often diagnosed incidentally and managed conservatively until it becomes symptomatic like this.", find: "SAMPLE: known chronic 'heart rhythm problem', on an unspecified low-dose cardiac medication."}),
    // The condition's own _sssPhase state machine actually alternates
    // sinus-brady <-> afib-RVR on a real timer — reading v.rhythm/v.hr
    // live means a re-probe genuinely catches whichever phase it's
    // currently in, instead of narrating "it'll change" without ever
    // showing the change.
    heart: (s, v) => v.rhythm === "afib"
      ? {say: `Racing right now — fast and irregular, around ${v.hr}. A few minutes ago it was the opposite.`, kind: "crit",
        evid: "Catching the SAME patient's monitor shift from a profound sinus bradycardia to a rapid irregular rhythm (and back) within one continuous observation is the direct confirmation of tachy-brady syndrome, rather than two separate diagnoses.", find: `Heart: currently in the tachycardic phase — irregular, rate ${v.hr} (afib).`}
      : {say: `Slow right now, around ${v.hr}. Stay on the monitor a few minutes and you'll likely see it change — this rhythm doesn't sit still.`, kind: "crit",
        evid: "Catching the SAME patient's monitor shift from a profound sinus bradycardia to a rapid irregular rhythm (and back) within one continuous observation is the direct confirmation of tachy-brady syndrome, rather than two separate diagnoses.", find: `Heart: currently in the bradycardic phase — regular, rate ${v.hr} (sinus).`},
    skin: () => ({say: "Pale, cool during the slow spells; flushed, mildly diaphoretic during the fast ones.", find: "Skin: pale/cool during bradycardic spells, flushed/diaphoretic during tachycardic spells."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveAVBlocker = s.given.diltiazem;
    const paced = s.doses.some(d => d.id === "pacing");
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A failing sinus node alternating between profound bradycardia and rapid atrial fibrillation, with nothing done to support the slow phases.";
    if (gaveAVBlocker) notes.push("An AV-nodal blocker (diltiazem) was given during a fast phase. It IS the correct drug for that phase's rate — but in tachy-brady syndrome specifically, AV-nodal blockade carries a real, documented risk of worsening the NEXT bradycardic phase, because its negative-chronotropic effect doesn't stop working the instant the rhythm changes back. Worth weighing that against the benefit of rate control, not reaching for it automatically.");
    if (paced) notes.push("Transcutaneous pacing was used — the correct, definitive field treatment for the bradycardic phase of this disease. It does nothing for the tachycardic phase, which is expected: pacing paces the ventricle, it doesn't treat an atrial tachyarrhythmia.");
    notes.push("The pattern to recognize here is the ALTERNATION itself — a monitor strip that looks like two completely different diseases from the same patient within the same call is the actual sick sinus syndrome finding, not either extreme alone.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Sick sinus syndrome (tachy-brady syndrome) — sinus node dysfunction alternating between profound bradycardia and paroxysmal atrial fibrillation"};},
},

electricalStorm: {cat: "medical", id: "CARD-046", pronouns: "he", title: "Male, 64. Known heart condition, repeatedly losing and regaining a pulse.",
  limit: 1500, transport: 540,
  bystanders: "His son started CPR on the first collapse and hasn't left his side.",
  units: [{at: 300, level: "emt", name: "BLS 10"}],
  dispatch: ["64M. Collapsed twice, bystander CPR in progress at first call, now breathing again.", "History of a prior heart attack.", "Collapsed a third time as you arrive."],
  update: ["Son: \"This is the third time, it keeps happening!\""],
  impression: "Down on the living room floor, his son mid-compression as you walk in. He gasps and starts moving as the monitor is attached — pulse back, but he's clearly not stable.",
  imps: ["DYSR", "CANT", "SHOK"],
  condition: "electricalStorm",
  patient: {age: 64, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: 'He is too altered to answer clearly. Son: "He grabbed his chest, went down, came right back after a few seconds of my dad doing compressions on him — then it happened again. And again just now."', kind: "pt",
      evid: "MULTIPLE separate collapse-and-recovery cycles within a short window, each requiring CPR or resolving on its own, is the defining pattern of electrical storm — not one arrest, but recurring ones.", find: "OPQRST: three witnessed collapses in a short period, each with brief CPR/recovery, patient altered between episodes."}),
    sample: () => ({say: "Son: \"He had a heart attack four years ago, has a defibrillator in his chest for it. Takes a handful of heart pills, I don't know all the names.\"", kind: "pt",
      evid: "A prior MI with an implanted defibrillator is exactly the chronic structural substrate (ischemic cardiomyopathy) that electrical storm arises from — this is a recurrence of known disease, not a new one.", find: "SAMPLE: prior MI four years ago, implanted ICD, multiple unspecified cardiac medications."}),
    // The substrate (scarBurden/rhythmInstability) keeps re-crossing
    // vtDrive's threshold after every conversion — reading v.rhythm live
    // shows whichever side of that cycle the patient is on RIGHT NOW
    // (actively in VT/VF vs. converted-but-still-recurring) instead of
    // one frozen "currently unstable" line for the whole call.
    heart: (s, v) => (v.rhythm === "VT" || v.rhythm === "VF")
      ? {say: "Rapid, wide-complex, and unstable on the monitor right now — and the crew that arrived with you says this is the same rhythm they saw twice already in the last few minutes, each time requiring a shock to break it.", kind: "crit",
        evid: "The SAME dangerous rhythm recurring multiple times despite being terminated each time is the specific finding that distinguishes electrical storm from a single VT/VF episode — recurrence despite treatment is the diagnosis.", find: "Heart: currently in recurrent monomorphic VT/VF."}
      : {say: `Regular for the moment, rate ${v.hr} — converted again. The crew says this is the same rhythm they've already had to shock twice.`, kind: "crit",
        evid: "A rhythm that keeps re-forming after every successful conversion is electrical storm's defining feature — the substrate producing it doesn't go away just because this particular episode did.", find: `Heart: currently converted to sinus (rate ${v.hr}), but recurrent VT/VF — 2+ episodes each requiring defibrillation/cardioversion.`},
    skin: () => ({say: "Pale, cool, diaphoretic.", find: "Skin pale, cool, diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const shockCount = s.doses.filter(d => d.id === "defib" || d.id === "cardiovert").length;
    const gaveAntiarrhythmic = s.given.amiodarone || s.given.lidocaine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Recurrent ventricular tachycardia/fibrillation on a severe chronic ischemic substrate, refractory to the treatment given, each episode further starving an already-damaged heart of the oxygen it needed to stop reigniting.";
    if (shockCount === 0 && !died) notes.push("No shock was delivered during a witnessed unstable/pulseless episode. Every recurrence of this rhythm needs its own defibrillation or cardioversion — the substrate producing it doesn't go away between episodes, but each individual episode still needs its own electrical treatment.");
    if (gaveAntiarrhythmic) notes.push("An antiarrhythmic (amiodarone/lidocaine) was given — the correct adjunct here. It reduces, but on a substrate this severe does not reliably eliminate, recurrence; electrical therapy is still needed for every episode that breaks through.");
    else if (!died) notes.push("No antiarrhythmic was given. On a substrate this unstable, amiodarone or lidocaine alongside repeated defibrillation/cardioversion is the standard of care — shocking alone treats each episode but does nothing to reduce how often the next one fires.");
    notes.push("The teaching point is recognizing electrical storm AS ITS OWN entity, distinct from a single VT/VF arrest: recurrence despite correct treatment of each episode is itself the diagnosis, and it means this patient needs rapid transport to a facility that can address the underlying substrate (repeat ICD interrogation, possible ablation), not just another round of ACLS on scene.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Electrical storm — recurrent monomorphic VT/VF on a severe chronic ischemic cardiomyopathy substrate, refractory to isolated defibrillation"};},
},

aicdMalfunction: {cat: "medical", id: "CARD-047", pronouns: "he", title: "Male, 70. Implanted defibrillator shocking him repeatedly, feels fine otherwise.",
  limit: 1400, transport: 480,
  bystanders: "His wife counted each shock out loud as it happened.",
  units: [{at: 400, level: "emt", name: "BLS 9"}],
  dispatch: ["70M. Reports his implanted defibrillator has shocked him multiple times in the last several minutes.", "Conscious, alert, frightened.", "History of prior heart attack with ICD placement."],
  update: ["Wife: \"That's the second one since you walked in!\""],
  impression: "Sitting rigid on the edge of the couch, wincing and gripping the armrest, clearly bracing for it to happen again. Alert, talking, visibly shaken.",
  imps: ["DYSR", "ANXY", "CPMI"],
  condition: "aicdMalfunction",
  patient: {age: 70, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It just HITS me, out of nowhere — like getting kicked in the chest. No warning at all. I don\'t feel my heart racing or anything funny before it happens, it just goes off. This is the third one since my wife called you."', kind: "pt",
      evid: "Sudden, unprovoked shocks with NO preceding sensation of a fast or abnormal heartbeat beforehand is the key finding — a device firing on a rhythm the patient can't even feel building suggests the device, not the heart, is the problem.", find: "OPQRST: multiple sudden ICD shocks, no preceding palpitations or racing sensation before each one, patient otherwise feels well between shocks."}),
    sample: () => ({say: "Wife: \"He had a heart attack a few years back, got the defibrillator put in after that. Takes his heart pills every day, never missed one shock like this before today.\"", kind: "pt",
      evid: "A known ICD placed for prior structural heart disease, now firing in a new and unprecedented pattern, points toward device malfunction (lead fracture, oversensing) rather than a new dangerous rhythm the device is correctly treating.", find: "SAMPLE: ICD placed after prior MI, medication-adherent, no similar episodes before today."}),
    // Left unaddressed long enough, the repeated inappropriate shocks on
    // scarred myocardium genuinely provoke real VT (conditions.js's own
    // measurement: untreated trials reliably cross vtDrive's threshold by
    // minute 15) — reading v.rhythm live lets that real escalation show up
    // on re-exam, distinct from the device malfunctioning on a rhythm that
    // never needed treatment in the first place.
    heart: (s, v) => (v.rhythm === "VT" || v.rhythm === "VF")
      ? {say: "Rapid, wide-complex, and genuinely unstable now — this is not what it looked like a few minutes ago.", kind: "crit",
        evid: "The device's repeated inappropriate shocks on already-scarred myocardium have now provoked the real dangerous rhythm it was implanted to prevent — the exact risk of letting the pattern continue unaddressed.", find: `Heart: rapid, wide-complex ${v.rhythm} now present — a genuine malignant rhythm, not a false-positive shock.`}
      : {say: `Regular, mildly fast — rate ${v.hr} — nothing on the monitor suggests he was ever in a shockable rhythm right before, during, or after the jolt you just watched happen.`, kind: "crit",
        evid: "A regular, unremarkable underlying rhythm immediately before AND after a witnessed shock is strong evidence the shock was inappropriate — a device firing on a rhythm that never needed treatment.", find: `Heart: regular, mildly tachycardic (~${v.hr}, anxiety); no shockable rhythm on the monitor before, during, or after a witnessed ICD discharge.`},
    skin: () => ({say: "Warm, diaphoretic from fright, normal color.", find: "Skin warm, diaphoretic, normal color."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const magnetApplied = s.doses.some(d => d.id === "icdMagnet");
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Repeated inappropriate shocks from a malfunctioning device, delivered without sedation or synchronisation to a conscious patient, on a heart that already had real structural disease — and nothing was done to stop them.";
    if (magnetApplied) notes.push("A magnet was applied over the device — the correct field intervention for suspected inappropriate ICD shocks. This does not touch the patient's actual rhythm; it only suspends the device's shock therapy, which is exactly the point: the problem here was the device, not his heart.");
    else if (!died) notes.push("No magnet was applied. Recognizing a PATTERN of shocks with no preceding rhythm change is the cue to suspend the device with a magnet — every additional shock is real, unsynchronised, awake pain for no benefit, and repeated shocks on a heart that already has scar tissue carry a genuine, real risk of provoking the actual dangerous rhythm this device was implanted to prevent. This is not a rare edge case: letting the pattern continue unaddressed is a time-sensitive mistake, not just an uncomfortable one.");
    notes.push("The core distinction on this call is between a device correctly treating a real dangerous rhythm and a device malfunctioning on a rhythm that needed no treatment at all — the second is what a magnet is for, and reaching for it requires recognizing the pattern, not just reacting to each individual shock.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Inappropriate ICD shocks from device malfunction (oversensing), on a genuine prior structural heart disease substrate, with no true underlying malignant rhythm"};},
},

aorticStenosis: {cat: "medical", id: "CARD-048", pronouns: "he", title: "Male, 78. Chest tightness and near-fainting while gardening.",
  limit: 1300, transport: 480,
  bystanders: "His neighbor saw him go pale and grab the fence, and called it in.",
  units: [{at: 380, level: "emt", name: "BLS 12"}],
  dispatch: ["78M. Chest tightness and nearly passed out while doing yard work.", "Conscious, sitting on the ground now.", "Known 'heart murmur' per neighbor."],
  update: ["Neighbor: \"He said his chest felt tight and everything went gray right before he grabbed the fence.\""],
  impression: "Sitting against the fence where he caught himself, pale and diaphoretic, breathing carefully. Alert but clearly shaken.",
  // "SYNC" is not a real PI code (gear.js has no such key — confirmed by
  // direct grep against the registry, lesson 16) so choosing this entry
  // would have thrown when the impression picker read PI[k].n; the closest
  // real code for "near-syncope" is ALOC. Same crash class the ANXY fix
  // (gear.js's own comment) documents for a different scenario batch.
  imps: ["CPMI", "ALOC", "SHOK"],
  condition: "aorticStenosis",
  patient: {age: 78, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It was tight, right here in the middle of my chest, and then everything just went gray and I had to grab the fence before I went down. It\'s happened once before, walking up the stairs a few months back — I never told anyone."', kind: "pt",
      evid: "Angina and near-syncope brought on specifically by EXERTION, in an older patient, is the classic aortic stenosis triad pattern — a fixed valve orifice that cannot increase forward output to meet the demand exercise creates.", find: "OPQRST: exertional chest tightness with near-syncope, a prior similar episode months ago, never evaluated."}),
    sample: () => ({say: "Neighbor: \"He's mentioned a heart murmur his doctor found a couple years ago, said it wasn't urgent at the time. Otherwise pretty healthy, takes something for his cholesterol.\"", kind: "pt",
      evid: "A previously known murmur, now producing exertional symptoms, is the real progression pattern of degenerative calcific aortic stenosis — asymptomatic for years, then a real turning point once angina, syncope or heart failure appears.", find: "SAMPLE: known heart murmur (undiagnosed further), statin only, no other cardiac history."}),
    heart: (s, v) => ({say: `Regular rhythm, rate ${v.hr}, and a firm, harsh murmur you can feel almost as a vibration over the right side of his chest. Pulse pressure feels narrow.`, kind: "crit",
      evid: "A harsh systolic murmur with a narrow pulse pressure and a slow-rising pulse is the direct bedside signature of a fixed, calcified aortic valve forcing the ventricle to generate very high pressure for a limited forward flow.", find: `Heart: harsh systolic murmur, narrow pulse pressure (${v.sbp}/${v.dbp}), regular rate ${v.hr}.`}),
    skin: () => ({say: "Pale, diaphoretic, cool.", find: "Skin pale, diaphoretic, cool."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveNitro = s.given.nitro || s.given.nitroOwn;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe aortic stenosis with a fixed forward output the heart could not increase, worsened rather than helped along the way.";
    if (gaveNitro) notes.push("Nitroglycerin was given. In severe aortic stenosis this is relatively CONTRAINDICATED: the chest tightness here is from a fixed valve orifice, not primarily coronary vasospasm, and this patient has no reserve SVR to shed the way a normal angina patient does — dropping preload/afterload further can produce a sharp, poorly-compensated drop in pressure without relieving the actual obstruction. Worth recognizing the murmur and narrow pulse pressure BEFORE reaching for nitro on a chest-pain call.");
    else if (!died) notes.push("Nitro was correctly withheld. A harsh systolic murmur with a narrow, slow-rising pulse should raise real suspicion for aortic stenosis before administering a preload/afterload-reducing drug that this fixed-output physiology tolerates poorly.");
    notes.push("The core recognition here is the exertional angina/near-syncope pattern plus the exam findings (murmur, narrow pulse pressure) pointing to a fixed structural obstruction — supportive care and prompt transport, not a drug that targets vascular tone the valve itself doesn't respond to.");
    return {died, cause, notes, correct: s.pi === "CPMI", truth: "Severe aortic stenosis — exertional angina and near-syncope from a fixed, calcified aortic valve orifice"};},
},

mitralStenosis: {cat: "medical", id: "CARD-052", pronouns: "she", title: "Female, 71. Progressive shortness of breath, worse lying flat.",
  limit: 1300, transport: 480,
  bystanders: "Her daughter, visiting for the week, called when she couldn't catch her breath climbing the stairs.",
  units: [{at: 400, level: "emt", name: "BLS 9"}],
  dispatch: ["71F. Progressive shortness of breath over several weeks, worse today.", "Known 'heart murmur' as a child, rheumatic fever history per daughter.", "Sitting upright, working to breathe."],
  update: ["Daughter: \"She's been getting more short of breath for weeks, but today her heart started racing and she could barely make it up the stairs.\""],
  impression: "Sitting bolt upright at the edge of a chair, breathing carefully, a faint flush across both cheeks. Tired but alert.",
  imps: ["RESP", "CPMI", "ALOC"],
  condition: "mitralStenosis",
  patient: {age: 71, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I\'ve been getting more winded for weeks now, especially lying down at night. Today my heart just started racing and I got so short of breath climbing the stairs I had to stop."', kind: "pt",
      evid: "Progressive exertional/orthopneic dyspnea, then an acute worsening coinciding with a sudden fast heartbeat, is the classic mitral stenosis decompensation pattern — new atrial fibrillation losing the atrial kick right when diastolic filling time is already the bottleneck.", find: "OPQRST: weeks of progressive dyspnea/orthopnea, acutely worse today with a new sensation of a racing heart."}),
    sample: () => ({say: "Daughter: \"She had rheumatic fever as a little girl in another country, and a doctor told her years ago she had a heart murmur, but she never really followed up on it.\"", kind: "pt",
      evid: "A childhood rheumatic fever history is the classic, most common real-world cause of chronic mitral stenosis — decades of slow fibrotic scarring of the valve before it becomes symptomatic.", find: "SAMPLE: childhood rheumatic fever, known untreated heart murmur, no cardiac follow-up."}),
    heart: (s, v) => ({say: `Irregularly irregular, rate ${v.hr}, and a low-pitched rumbling sound you can just make out right after the normal heart sounds, best heard leaning her forward.`, kind: "crit",
      evid: "An irregularly irregular rhythm (new atrial fibrillation, common in a chronically stretched left atrium) on top of a low-pitched diastolic rumble is the direct bedside signature of mitral stenosis with a new rapid ventricular response.", find: `Heart: irregularly irregular at ${v.hr}, low-pitched diastolic rumble.`}),
    lungs: () => ({say: "Fine crackles at both bases, worse than a normal breath sounds exam.", kind: "crit",
      evid: "Bibasilar crackles reflect the pulmonary venous congestion backing up behind a stenotic mitral valve — elevated left atrial pressure transmitted directly into the pulmonary circulation.", find: "Lungs: bibasilar fine crackles, pulmonary venous congestion."}),
    skin: () => ({say: "A faint dusky-pink flush across both cheeks.", find: "Skin: mitral facies, a faint malar flush."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe mitral stenosis with a new rapid ventricular response, diastolic filling time collapsing faster than forward output could be supported.";
    notes.push("The core recognition here is progressive exertional dyspnea/orthopnea in a patient with a childhood rheumatic-fever history, decompensating acutely once a fast heart rate (new atrial fibrillation) further shortened the one phase of the cycle — diastole — this fixed, narrowed valve depends on entirely for filling.");
    notes.push("Unlike most tachycardia, a faster rate here does not raise output; it worsens it, since the stenotic valve can only pass blood during diastole and a shorter diastole gives less time to fill through an already-narrow orifice. Supportive care and prompt transport, not a drug that targets vascular tone the valve itself doesn't respond to.");
    return {died, cause, notes, correct: s.pi === "RESP", truth: "Chronic mitral stenosis (rheumatic), decompensated by new rapid atrial fibrillation shortening diastolic filling time"};},
},

mitralRegurgitationAcute: {cat: "medical", id: "CARD-049", pronouns: "she", title: "Female, 68. Sudden shortness of breath, four days after a heart attack.",
  limit: 1300, transport: 480,
  bystanders: "Her son, who has been staying with her since her hospital discharge, called 911.",
  units: [{at: 360, level: "paramedic", name: "Medic 6"}],
  dispatch: ["68F. Sudden severe shortness of breath.", "Discharged from the hospital 4 days ago after a heart attack.", "Sitting upright, struggling to breathe."],
  update: ["Son: \"She was fine ten minutes ago, then all of a sudden she couldn't catch her breath at all!\""],
  impression: "Sitting bolt upright on the edge of the bed, working hard to breathe, pink frothy secretions visible at her lips. Frightened, tiring.",
  imps: ["RESP", "SHOK", "CPMI"],
  condition: "mitralRegurgitationAcute",
  patient: {age: 68, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I was fine, just sitting here, and then all of a sudden I couldn\'t get a breath in at all — like someone turned a switch. I had a heart attack four days ago, they said I was doing okay."', kind: "pt",
      evid: "SUDDEN, severe pulmonary edema days after a myocardial infarction — not a gradual worsening — is the classic presentation of a mechanical complication like papillary muscle rupture, not ordinary post-MI heart failure.", find: "OPQRST: abrupt-onset severe dyspnea, four days post-MI, no gradual build-up."}),
    sample: () => ({say: "Son: \"She had a heart attack last week, they put a stent in. She's been on her new heart medications since she got home two days ago.\"", kind: "pt",
      evid: "A recent MI (the classic 2-7 day window for papillary muscle rupture, most often after an inferior infarct) sets up exactly the substrate for an acute mechanical complication like this.", find: "SAMPLE: MI 4 days ago with stent placement, recently started cardiac medications."}),
    heart: (s, v) => ({say: `Rapid, rate ${v.hr}, and there's a new loud, harsh murmur you didn't expect on a routine listen — you can hear it clearly at the apex.`, kind: "crit",
      evid: "A NEW loud holosystolic murmur appearing suddenly, days after an MI, together with flash pulmonary edema, is the specific bedside signature of acute mitral regurgitation from papillary muscle or chordal rupture.", find: `Heart: new loud apical systolic murmur, tachycardic at ${v.hr}, signs of acute pulmonary edema.`}),
    skin: () => ({say: "Pale, cool, diaphoretic.", find: "Skin pale, cool, diaphoretic."}),
    lungs: () => ({say: "Coarse crackles throughout both lung fields, worse at the bases, with visible pink frothy sputum.", kind: "crit",
      evid: "Bilateral crackles with pink frothy sputum appearing this suddenly, days post-MI, is flash pulmonary edema from a new, severe backward leak overwhelming the left atrium and pulmonary circulation almost immediately.", find: "Lungs: diffuse coarse crackles, pink frothy sputum, acute flash pulmonary edema."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveNitro = s.given.nitro || s.given.nitroOwn;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Acute severe mitral regurgitation from a ruptured papillary muscle, days after her infarct, with forward output collapsing faster than it could be supported.";
    if (gaveNitro) notes.push("Nitroglycerin was given. In hospital, afterload reduction with a balanced arterial/venous agent (nitroprusside) is a real, guideline treatment for acute severe MR. Sublingual nitroglycerin is not that drug, though — it is dominantly a VENODILATOR, and this patient's forward output depends heavily on preload; dropping it further did not help, and risks worsening perfusion in a patient who is already borderline.");
    else if (!died) notes.push("Afterload reduction has a real role in acute severe MR in the hospital, with the right drug (nitroprusside). This box only carries nitroglycerin, which is preload- rather than afterload-dominant here — withholding it and prioritizing rapid transport for definitive management was reasonable.");
    notes.push("The recognition point is the SUDDENNESS of severe pulmonary edema days after an MI with a new murmur — a mechanical complication (papillary muscle rupture), not a routine post-MI heart-failure decline, and one that needs rapid transport for surgical evaluation.");
    return {died, cause, notes, correct: s.pi === "RESP", truth: "Acute severe mitral regurgitation from post-MI papillary muscle rupture, causing flash pulmonary edema and cardiogenic shock"};},
},

infectiveEndocarditis: {cat: "medical", id: "CARD-050", pronouns: "he", title: "Male, 54. Fever and a new weakness on one side for a week.",
  limit: 1300, transport: 480,
  bystanders: "His roommate, worried he's been getting sicker for days, called today when his arm suddenly stopped working right.",
  units: [{at: 400, level: "emt", name: "BLS 13"}],
  dispatch: ["54M. Fever for a week, now sudden weakness on one side.", "History of IV drug use per roommate.", "Conscious, alert."],
  update: ["Roommate: \"His arm just went weak all of a sudden a few minutes ago, and he's been running a fever for days!\""],
  impression: "Lying on the couch, flushed and diaphoretic, visibly unwell. Alert but uncomfortable, favoring one arm.",
  imps: ["SEPS", "FEVR", "DYSR"],
  condition: "infectiveEndocarditis",
  patient: {age: 54, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I\'ve been running a fever, chills, feeling wiped out for about a week now. I figured it was the flu. Then just now my arm went weak, out of nowhere."', kind: "pt",
      evid: "A week-long unexplained fever culminating in a sudden new focal weakness is the real, two-part infective endocarditis pattern — subacute bacteremia with a valve source, followed by a septic embolus.", find: "OPQRST: one week of fever/chills/fatigue, sudden new arm weakness just before your arrival."}),
    sample: () => ({say: "Roommate: \"He's used IV drugs on and off, on his arm, hasn't been to a doctor about the fever. Otherwise no health problems I know of.\"", kind: "pt",
      evid: "IV drug use is a well-documented major risk factor for infective endocarditis (introducing bacteria directly into the bloodstream, seeding a heart valve), and a week of untreated fever is exactly the subacute time course this disease follows.", find: "SAMPLE: history of IV drug use, no other significant history, no prior evaluation for the fever."}),
    heart: (s, v) => ({say: `Rapid, rate ${v.hr}, with a new soft murmur you can pick up on the left side of his chest.`, kind: "crit",
      evid: "A new murmur in a febrile patient with an IV-drug-use history is the direct valve-involvement finding of infective endocarditis, distinct from an isolated fever with no cardiac source.", find: `Heart: tachycardic (${v.hr}), new soft murmur.`}),
    skin: () => ({say: "Hot, flushed, diaphoretic.", find: "Skin hot, flushed, diaphoretic."}),
    neuro: (s, v) => (v.strokeWeakness > 0.3
      ? {say: "Left-sided weakness, noticeably weaker grip on that side, mild facial droop.", kind: "crit",
        evid: "A sudden new focal neuro deficit in a patient with days of untreated bacteremia and a new murmur is a septic embolus breaking off an infected valve and lodging in a cerebral vessel — a real, documented complication of infective endocarditis, not a coincidental separate stroke.", find: "Neuro: new left-sided weakness and mild facial droop, consistent with an embolic event."}
      : {say: "Moves all extremities normally, no focal deficit right now.", find: "Neuro: no focal deficit currently — reassess, this patient's presentation has already been shifting."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Untreated infective endocarditis — ongoing bacteremia and a septic embolic event, with nothing done to support perfusion or expedite transport for source-control and valve evaluation.";
    notes.push("A week of unexplained fever plus a new heart murmur plus a sudden new focal neuro deficit is the classic infective endocarditis triad — days-old bacteremia seeding a heart valve, followed by a piece of the infected vegetation breaking off as a septic embolus. There is no field antibiotic or definitive treatment here; the job is recognizing the pattern (especially in a patient with IV drug use risk), supporting perfusion, and getting him to a facility that can treat both the infection and, likely, the valve itself.");
    return {died, cause, notes, correct: s.pi === "SEPS", truth: "Infective endocarditis (IV-drug-use risk) with fever/bacteremia and a septic embolic stroke"};},
},

hocmObstructive: {cat: "medical", id: "CARD-051", pronouns: "he", title: "Male, 34. Chest tightness during a pickup basketball game.",
  limit: 1300, transport: 480,
  bystanders: "A teammate who knows he has a heart condition ('some kind of thick heart muscle thing') and made him sit down and called it in.",
  units: [{at: 380, level: "emt", name: "BLS 14"}],
  dispatch: ["34M. Chest tightness and lightheadedness during a basketball game.", "Known history of hypertrophic cardiomyopathy per teammate.", "Sitting on the sideline, conscious."],
  update: ["Teammate: \"He gets checked by a cardiologist every year for this, he's never gone down like this before!\""],
  impression: "Sitting on the bleachers, sweaty from the game, one hand on his chest, breathing carefully. Alert, anxious, tries to wave you off as \"just needing a minute.\"",
  // "SYNC" is not a real PI code (gear.js has no such key — confirmed by
  // direct grep against the registry, lesson 16); the closest real code
  // for "near-syncope" is ALOC, same fix already applied to aorticStenosis
  // above for the identical typo/defect.
  imps: ["CPMI", "ALOC", "SHOK"],
  condition: "hocmObstructive",
  patient: {age: 34, gender: "male"},
  clothing: {top: "short", bottom: "shorts", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It just got tight in my chest and everything went a little gray, so I sat down. I have HCM, hypertrophic cardiomyopathy, my heart muscle is thick — my cardiologist has told me a hundred times to stop the second I feel like this."', kind: "pt",
      evid: "Exertional chest tightness with near-syncope in a young patient with a KNOWN diagnosis of hypertrophic cardiomyopathy is the textbook presentation of dynamic left-ventricular outflow obstruction worsening under exercise — a fixed-orifice-adjacent physiology that gets WORSE, not better, with the usual chest-pain toolkit.", find: "OPQRST: exertional chest tightness and near-syncope, known HCM diagnosis, stopped activity as instructed."}),
    sample: () => ({say: "Teammate: \"He takes a beta blocker for it, I know that much. Otherwise he's in great shape, plays every week.\"", kind: "pt",
      evid: "A beta blocker is the correct standing outpatient therapy for obstructive HCM (it reduces contractility, which relaxes the dynamic outflow obstruction) — this patient is already on the right medication, which makes today's decompensation a real acute-on-chronic event worth taking seriously, not routine.", find: "SAMPLE: HCM diagnosis, takes a beta blocker daily, otherwise healthy, active."}),
    heart: (s, v) => ({say: `Rate ${v.hr}, blood pressure ${v.sbp}/${v.dbp}, with a harsh systolic murmur that gets LOUDER when he stands or you have him do a quick Valsalva, and softer when he squats back down.`, kind: "crit",
      evid: "A murmur that intensifies with standing/Valsalva (both REDUCE venous return/preload) and softens with squatting (which INCREASES preload and afterload together) is the specific bedside maneuver that distinguishes HOCM's dynamic outflow murmur from a fixed aortic stenosis murmur, which does the opposite.", find: `Heart: harsh systolic murmur, dynamic with position/Valsalva, rate ${v.hr}, BP ${v.sbp}/${v.dbp}.`}),
    skin: () => ({say: "Diaphoretic from exertion, otherwise warm.", find: "Skin diaphoretic (exertional), warm."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveNitro = s.given.nitro || s.given.nitroOwn;
    const gaveVolume = s.given.saline || s.given.plasmalyte;
    const gavePhenyl = s.given.phenylephrine;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Dynamic left-ventricular outflow obstruction from hypertrophic cardiomyopathy, worsened rather than relieved along the way.";
    if (gaveNitro) notes.push("Nitroglycerin was given. In HOCM this is genuinely dangerous, not just unhelpful: dropping preload AND afterload both make the dynamic outflow obstruction WORSE, the exact opposite of ordinary anginal chest pain, and this patient has no compensatory reserve to fall back on the way a typical chest-pain patient does.");
    if (gaveVolume || gavePhenyl) notes.push("The right field instinct here runs backwards from ordinary shock: volume (raising preload) and a pure alpha agent like phenylephrine (raising afterload without adding contractility) both RELIEVE dynamic outflow obstruction in HOCM — avoid inotropes, diuretics, and vasodilators, which all worsen it.");
    else if (!died) notes.push("Nitro was correctly withheld. A young patient with known HCM and an exertional near-syncope presentation calls for the opposite toolkit from ordinary cardiac chest pain: support preload, avoid vasodilation, and get him transported.");
    notes.push("The core recognition here is a KNOWN HCM diagnosis plus exertional chest tightness/near-syncope plus a position-dynamic murmur — this is a young-athlete sudden-cardiac-death risk presentation, and it decompensates from the exact treatments that help an ordinary cardiac chest-pain patient.");
    return {died, cause, notes, correct: s.pi === "CPMI", truth: "Hypertrophic obstructive cardiomyopathy — dynamic LVOT obstruction worsened by preload/afterload loss during exertion"};},
},

asthmaAttack: {cat: "medical", id: "RESP-023", pronouns: "she", title: "Female, 54. Wheezing, cleaning with chemicals.",
  limit: 1200, transport: 480,
  bystanders: "A window is open now. The room still smells strongly of bleach.",
  units: [{at: 360, level: "emt", name: "BLS 9"}],
  dispatch: ["54F, trouble breathing, wheezing.", "Was cleaning a basement with strong chemicals.", "Has an inhaler, minimal relief."],
  update: ["She can only get out three or four words at a time now."],
  impression: "Sitting bolt upright, shoulders working, wheezing you can hear across the room. Three-to-four-word sentences. Anxious and tiring.",
  imps: ["SOBB", "RDOT", "RARF", "ALRX"],
  condition: "asthma",
  patient: {age: 54, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Started — cleaning the basement. Bleach. Half an hour. Getting — worse. Puffer — didn't help.\"", kind: "pt",
      evid: "OPQRST — gradual onset with irritant exposure, progressive, poorly relieved by her own SABA.", find: "OPQRST: gradual, irritant-triggered, progressive, SABA-refractory."}),
    sample: () => ({say: "\"Asthma. Allergic — penicillin. Albuterol, a blood-pressure pill. Two puffs — ten minutes ago. Barely touched it.\"", kind: "pt",
      evid: "SAMPLE — known asthmatic, PCN allergy, SABA already tried with minimal relief.", find: "SAMPLE: asthma, PCN allergy, albuterol (minimal relief), HTN."}),
    // MEASURED, not scripted (see conditions.js asthma: pat.broncho climbs
    // 0.55->0.96 untreated). Reads pat.effectiveBroncho live, same pattern
    // as toxicInhalationChlorine (queue item F7).
    lungs: (s) => {
      const eb = s.patient?.effectiveBroncho ?? 0.55;
      if (eb > 0.8) return {say: "Wheeze is quieter now, and air movement is worse, not better. A quiet chest is a bad sign here.", kind: "crit",
        evid: "Falling air movement with fading wheeze — severe, near-silent bronchospasm.", find: "Diminishing wheeze, poor air movement — ominous."};
      if (eb > 0.5) return {say: "Diffuse expiratory wheeze, both sides, with a long expiratory phase. Air movement is poor.", kind: "warn",
        evid: "Diffuse expiratory wheeze, poor air movement — severe bronchospasm; a quiet chest would be worse.", find: "Diffuse expiratory wheeze; poor air movement."};
      return {say: "Wheeze easing, air movement improving with treatment.", kind: "obs",
        evid: "Bronchospasm responding to bronchodilator.", find: "Wheeze improving, air entry better."};
    },
    skin: () => ({say: "Cool, a little pale, mildly sweaty.", find: "Cool, mildly diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const bronchodil = (s.given.albuterol || 0) + (s.given.ipratropium || 0) + (s.given.epiIM || 0);
    const o2 = (s.done.o2nrb || 0) + (s.done.o2nc || 0) + (s.done.cpap || 0) + (s.done.bvm || 0);
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "She tired into a respiratory arrest. Severe bronchospasm that isn't reversed marches to a silent chest and then apnea — bronchodilators, oxygen, and being ready to assist ventilations are the whole game.";
    if (bronchodil) notes.push("Bronchodilator given — the definitive treatment for the bronchospasm. Albuterol ± ipratropium; IM epinephrine if she were crashing."); else notes.push("No bronchodilator. That's the treatment for this problem — the airways are constricted and nothing else opens them.");
    if (o2) notes.push("Oxygen / ventilatory support for the hypoxia and work of breathing — appropriate."); else notes.push("Hypoxia went unsupported. She needed oxygen, and a hand on the BVM if she tired.");
    if (s.done.cpap) notes.push("CPAP can buy a tiring asthmatic time — reasonable if she tolerates it.");
    return {died, cause, notes, correct: s.pi === "SOBB", truth: "Severe asthma exacerbation (irritant-triggered bronchospasm)"};},
},

abdGSW: {cat: "trauma", id: "TRMA-024", pronouns: "he", title: "Male, 29. Gunshot wound to the abdomen.",
  limit: 900, transport: 360, destSpecialty: "trauma",
  bystanders: "Scene is secured by police. One patient. A weapon has been accounted for.",
  units: [{at: 300, level: "paramedic", name: "Medic 3"}],
  dispatch: ["29M, single gunshot wound to the abdomen.", "Scene now secured by PD.", "Patient conscious, in pain."],
  update: ["\"He's getting pale and his belly's getting tight.\""],
  impression: "A single wound to the left lower quadrant with only a trickle at the skin — but the abdomen is distending and rigid, and he is going gray. The bleeding is inside, where your hands can't reach it.",
  imps: ["TRMA", "SHOK", "HOTN"],
  condition: "abdominalGSW",
  patient: {age: 29, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's — everywhere in my gut. Deep. Bad. Getting worse.\" He's guarding hard.", kind: "pt",
      evid: "Diffuse, worsening abdominal pain with guarding — peritoneal irritation from intra-abdominal hemorrhage.", find: "OPQRST: diffuse abd pain, worsening, guarding."}),
    sample: () => ({say: "\"No allergies. Don't take anything. Healthy. Ate earlier.\"", kind: "pt",
      evid: "No mitigating history — this is time-critical surgical hemorrhage.", find: "SAMPLE: NKDA, no meds, healthy."}),
    abdo: () => ({say: "Rigid, distended, exquisitely tender. Single entry wound LLQ; you look for an exit and note whatever you find without probing it.", kind: "crit",
      evid: "Rigid distended abdomen = intra-abdominal hemorrhage. Non-compressible — no field control exists.", find: "Rigid distended abdomen; non-compressible truncal hemorrhage."}),
    skin: () => ({say: "Pale, cool, clammy, and getting worse as you watch.", kind: "crit", evid: "Progressing hemorrhagic shock.", find: "Class III→IV shock."}),
  },
  micn: () => ({order: "\"Penetrating abdo — this is a load-and-go. Don't sit on scene. Permissive hypotension, TXA if you carry it, and drive to the trauma center. Big lines en route, not on the floor.\"",
    correct: true,
    onAccept: () => "Copy — rapid transport, permissive hypotension, TXA, lines en route.",
    onQuestion: "\"Nothing in the field fixes this belly. Minimize scene time and get to a surgeon.\""}),
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    let died = !!arr, cause = arr?.story || "";
    if (!arr && pat && ["PEA", "asystole"].includes(pat.rhythm)) died = 1;
    const overResus = (s.given.saline || 0) >= 2 && v.sbp > 110;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Non-compressible truncal hemorrhage that outran you. Nothing in the field stops it — the only interventions that matter are permissive hypotension, TXA, and minimal scene time to a surgeon.";
    if (s.committedAt) notes.push("You committed to transport — correct. This patient is a surgeon's problem and every minute on scene is blood on the floor."); else notes.push("Scene time is the enemy here. There is no field procedure that controls intra-abdominal bleeding — the treatment is a fast trip to an operating room.");
    if (s.given.txa) notes.push("TXA given — reasonable early in traumatic hemorrhage (best within the first hours).");
    if (overResus) notes.push("Aggressive crystalloid pushed the pressure high and popped fresh clot. Permissive hypotension (a radial pulse / SBP ~80–90) is the target until surgical control.");
    if ((s.doses.some(d=>d.id==="tq") || s.done.pack)) notes.push("A tourniquet/packing can't reach an intra-abdominal bleed — this hemorrhage is non-compressible.");
    return {died, cause, notes, correct: s.pi === "TRMA" || s.pi === "SHOK", truth: "Penetrating abdominal trauma with hemorrhagic shock"};},
},

abdPain: {cat: "medical", id: "ABD-025", pronouns: "he", title: "Male, 19. Severe abdominal pain, lower right.",
  limit: 1500, transport: 600,
  bystanders: "His roommate let you in. \"He's been curled up for hours. It started around his belly button.\"",
  units: [{at: 480, level: "emt", name: "BLS 4"}],
  dispatch: ["19M, severe abdominal pain.", "Several hours, getting worse.", "No trauma."],
  update: ["He's reluctant to move and keeps his right knee drawn up."],
  impression: "Lying still, knees up, guarding the right lower abdomen. Flushed and a little warm. He does not want to move.",
  imps: ["ABDP", "SEPS", "FEVR"],
  condition: "appendicitis",
  patient: {age: 19, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Started around my belly button this morning — dull. Now it's all down here on the right and it's sharp. Seven, eight out of ten. Moving makes it worse.\"", kind: "pt",
      evid: "OPQRST — classic periumbilical→RLQ migration, worse with movement: appendicitis until proven otherwise.", find: "OPQRST: periumbilical→RLQ migration, sharp, 8/10, worse with movement."}),
    sample: () => ({say: "\"No allergies. Don't take anything. Never had surgery. Haven't been able to eat since last night — feel sick. Low fever, I think.\"", kind: "pt",
      evid: "SAMPLE — anorexia, nausea, low-grade fever with RLQ pain: appendicitis picture.", find: "SAMPLE: NKDA, no meds, anorexia/nausea, low-grade fever."}),
    abdo: () => ({say: "Tender and guarded in the right lower quadrant. He winces when you release — rebound. Localized, not rigid all over.", kind: "warn",
      evid: "Focal RLQ tenderness with rebound — localized peritonitis (appendicitis).", find: "RLQ tenderness + rebound; focal peritonitis."}),
    skin: () => ({say: "Warm, flushed, dry. Feels feverish.", kind: "obs", evid: "Low-grade fever with the inflammatory process.", find: "Warm, febrile."}),
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "It would take a grossly delayed, perforated appendix drifting into septic shock to lose this patient in the field — recognize it, keep him comfortable and NPO, and get him to a surgeon.";
    notes.push("This is a recognize-and-transport call: nothing in the field fixes the appendix. The wins are a good assessment, analgesia, keeping him NPO, and transport.");
    if ((s.given.fentanyl || s.given.morphine || s.given.ketamine || s.given.acetaminophenIV)) notes.push("Analgesia given — humane and appropriate; it does not mask the surgeon's exam the way older teaching claimed.");
    if (s.given.ondansetron) notes.push("Antiemetic — reasonable for the nausea.");
    if (s.given.oralGlucose) notes.push("He should be kept NPO for a probable OR — avoid anything by mouth.");
    if (pat && pat.coreTemp > 38.8) notes.push("The fever is climbing toward a septic picture — this one sat too long. Earlier transport is better.");
    return {died, cause, notes, correct: s.pi === "ABDP", truth: "Acute appendicitis"};},
},

severePreeclampsia: {cat: "medical", id: "OBGY-027", pronouns: "she", title: "Female, 32. 34 weeks pregnant, worst headache of her life.",
  limit: 1500, transport: 660,
  bystanders: "Her husband met you at the door. \"She's been saying her head is splitting since this morning and now she's seeing spots. She's 34 weeks.\"",
  units: [{at: 420, level: "paramedic", name: "Medic 7"}],
  dispatch: ["32F, 34 weeks pregnant.", "Severe headache and visual disturbance.", "Husband reports she is not herself."],
  update: ["Husband: \"Her face and hands have been puffy for about a week. The midwife said her pressure was up.\""],
  impression: "Sitting propped up, gravid, obviously uncomfortable and holding her head. Her face and hands are visibly puffy. She is guarding her right upper abdomen. She is hypertensive, and she is 34 weeks pregnant — those two facts together are the whole call.",
  imps: ["OBEM", "SEIZ", "ALOC", "ABDP"],
  condition: "preeclampsia",
  patient: {age: 32, gender: "female"},
  clothing: {top: "long", bottom: "skirt", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's a band right across the front. Since this morning, getting worse. Nothing touches it. And there are spots — like flashbulbs — in the corners of my eyes.\"", kind: "pt",
      evid: "Frontal headache with visual scotomata in a 34-week pregnancy — cerebral involvement of preeclampsia, a severe feature.", find: "Frontal headache, visual scotomata, progressive."}),
    sample: () => ({say: "\"No allergies. Just prenatal vitamins. First baby. My midwife checked me last week and said my pressure was up and there was protein in my urine — she wanted me seen this week.\"", kind: "pt",
      evid: "Documented hypertension and proteinuria before 34 weeks: this is established preeclampsia, not new hypertension.", find: "SAMPLE: G1, known raised BP + proteinuria at last check."}),
    abdo: () => ({say: "Tender under the right costal margin. The uterus is soft and non-tender, fundus at about 34 weeks. No contractions.", kind: "warn",
      evid: "RUQ tenderness is hepatic capsular stretch — a severe feature, and the H and EL of HELLP. Soft uterus argues against abruption.", find: "RUQ tenderness; soft non-tender uterus."}),
    neuro: () => ({say: "She is oriented but slow and irritable. Reflexes are brisk — you get several beats of clonus at the ankle.", kind: "warn",
      evid: "Hyperreflexia with clonus marks cortical irritability — the pre-eclamptic brain on the edge of seizing.", find: "Hyperreflexia with ankle clonus."}),
    skin: () => ({say: "Puffy face, pitting edema over both hands and shins. Warm and dry otherwise.", kind: "obs",
      evid: "Generalized edema WITH a contracted plasma volume — she is waterlogged and intravascularly dry at the same time.", find: "Facial and peripheral pitting edema."}),
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Eclampsia and its complications kill through the seizure, the stroke and the abruption. Magnesium, a calm dark ambulance and a rapid trip to an obstetric unit are the whole prehospital treatment.";
    notes.push("Severe preeclampsia. The definitive treatment is delivery of the placenta, which you cannot do — so this is recognize, prophylax, and transport to an obstetric receiving unit.");
    if (s.given.magnesium) notes.push("Magnesium sulfate — correct, and it is SEIZURE PROPHYLAXIS, not an antihypertensive. Expect the pressure to stay up; that is not treatment failure.");
    else notes.push("No magnesium. It is the single drug that changes outcome here: it roughly halves progression to eclampsia against any alternative anticonvulsant.");
    if (pat && pat.seizing) notes.push("She seized — eclampsia. Protect the airway, left lateral, oxygen, magnesium.");
    // a previous item in the queue: this formulary has no lactatedRingers/lorazepam entry — only
    // saline/plasmalyte for crystalloid and midazolam for benzodiazepines
    // exist in drugs.js. These checks previously ORed in the nonexistent
    // drug ids, which could never be true; fixed to the real formulary
    // (plasmalyte was the actual missing crystalloid, not a cosmetic dead
    // reference — a plasmalyte-only fluid strategy was silently exempt
    // from this volume-caution note before this fix).
    const fluids = (s.given.saline || 0) + (s.given.plasmalyte || 0);
    if (fluids >= 2) notes.push("Careful with volume. Her plasma is contracted but her capillaries leak and her albumin is low — aggressive crystalloid fills the lungs rather than the vessels. Preeclampsia is one of the few shocked-looking patients you do NOT flood.");
    if (s.given.midazolam) notes.push("A benzodiazepine will stop the fitting, but magnesium is first-line for the eclamptic mechanism specifically and prevents recurrence better.");
    return {died, cause, notes, correct: s.pi === "OBEM", truth: "Severe preeclampsia (34 weeks), with cerebral and hepatic features"};},
},

pph: {cat: "medical", id: "OBGY-043", pronouns: "she", title: "Female, 34. Just delivered at home, bleeding heavily.",
  limit: 1200, transport: 480,
  bystanders: "Her partner is on the floor next to her, one hand under the newborn, the other pressing a towel that's already soaked through.",
  units: [{at: 360, level: "paramedic", name: "Medic 9"}],
  dispatch: ["34F, home delivery in progress, caller says the baby is out.", "Now reports heavy bleeding.", "Unplanned home birth — no midwife present."],
  update: ["Partner: \"It won't stop. It was fine right after, now it's just — it's a lot.\""],
  impression: "On the bathroom floor, a healthy-looking newborn already on her chest, and a spreading pool of dark blood beneath her. She is pale, sweating, and asks you twice if she's going to be okay.",
  imps: ["OBEM", "SHOK", "HOTN"],
  condition: "uterineAtony",
  patient: {age: 34, gender: "female"},
  clothing: {top: "long", bottom: "skirt", shoes: false},
  seed: () => ({}),
  probes: {
    history: () => ({say: "\"This is my fifth. Labor was fast — maybe three hours start to finish. He was almost ten pounds.\"", kind: "pt",
      evid: "Grand multiparity + precipitous labor + a macrosomic infant — all documented risk factors for uterine atony.", find: "G5, precipitous labor, ~10 lb infant."}),
    sample: () => ({say: "\"No allergies. Just my prenatal vitamins — I never even made it to a hospital for this one, my midwife was supposed to be here.\" She glances at the newborn on her chest, then back at the blood.", kind: "pt",
      evid: "SAMPLE — no anticoagulant or antiplatelet medication complicating the bleed; an unplanned, unmonitored home delivery with no clotting risk factor beyond the atony itself.", find: "SAMPLE: NKDA, prenatal vitamins only, unplanned home birth, no midwife present at delivery."}),
    abdo: (s) => {
      const preg = s.patient._pregnancy;
      const tone = preg?.uterineTone ?? 0;
      if (!preg?.delivered) return {say: "Still contracting — she hasn't delivered the placenta yet.", kind: "pt", find: "Third stage in progress."};
      if (tone < 0.35) return {say: "The fundus is soft and boggy — you can barely feel it as a firm mass, and it does not tighten under your hand.", kind: "crit",
        evid: "A boggy, poorly-contracted fundus IS the diagnosis: uterine atony.", find: "Boggy, atonic uterus."};
      if (tone < 0.75) return {say: "The fundus firms partially as you massage it, but softens again as soon as you ease off.", kind: "warn",
        evid: "Partial, incomplete response to treatment so far — keep going, and/or escalate.", find: "Partially responsive uterine tone."};
      return {say: "The fundus is firm, well-contracted, right where you'd expect it — about the level of the umbilicus.", kind: "good",
        evid: "Good uterine tone. The bleeding this produces is the normal, self-limiting kind.", find: "Firm, well-contracted uterus."};
    },
    skin: () => ({say: "Pale, cool, sweating. She is tachycardic and asking the same question twice.", kind: "warn",
      evid: "Early hemorrhagic shock — do not wait for a blood pressure to fall before treating this as bleeding.", find: "Pale, diaphoretic, tachycardic."}),
  },
  micn: () => ({order: "\"Postpartum bleed — package her and transport, we'll sort it at the hospital.\"",
    correct: false, refuteKeys: ["massage", "fundal", "oxytocin", "uterotonic", "atony", "boggy"],
    onAccept: (n) => {n.badOrder = 1; return "You start packaging her without treating the uterus.";},
    onRefuseYes: "\"Good — fundal massage first, oxytocin if you're carrying it. Both act on the SAME problem: the uterus isn't clamping down on those vessels. Treat it, don't just drive fast.\"",
    onRefuseNo: "\"A postpartum hemorrhage has a specific, field-treatable cause most of the time. Name it.\"",
    onQuestion: "\"What makes a boggy uterus different from any other bleed you'd just pack and go with?\""}),
  resolve: (s, v, arr) => {const notes = []; const mother = s._roster?.find(e => e.role !== "newborn")?.patient || s.patient;
    const nb = s._roster?.find(e => e.id === "newborn")?.patient;
    let died = !!arr, cause = arr?.story || "";
    const massaged = !!s.done.fundalMassage;
    const oxy = !!s.given.oxytocin;
    const tone = mother?._pregnancy?.uterineTone ?? 0;
    if (massaged && oxy) notes.push("Fundal massage AND oxytocin — correct escalation. The two act on the same muscle through different routes (mechanical/reflex vs. pharmacologic) and compose: this is real combination therapy for atony, not redundant treatment.");
    else if (massaged) notes.push("Fundal massage given — a real, effective first-line response. If the fundus was still boggy afterward, oxytocin was the next step, not just more massage.");
    else if (oxy) notes.push("Oxytocin given without ever massaging the fundus first — it still works (it's the definitive pharmacologic treatment), but massage is free, immediate, and the taught first move.");
    else notes.push("Neither fundal massage nor oxytocin given. This is a boggy, atonic uterus — the single most correctable cause of postpartum hemorrhage — and it was never treated.");
    notes.push(`Final uterine tone: ${(tone * 100).toFixed(0)}% of normal. ${tone > 0.7 ? "Well-contracted — treatment controlled the bleeding." : tone > 0.35 ? "Partially controlled." : "Still atonic."}`);
    if ((s.given.saline || 0) + (s.given.plasmalyte || 0) + (s.given.blood || 0) > 0) notes.push("Volume replacement alongside uterine treatment — correct; fluids buy time, they do not fix the atony itself.");
    if (nb) {
      const nbHr = Math.round(nb.hr || 0);
      notes.push(`The newborn is a background second patient this call — heart rate ${nbHr}, delivered without the distress the mother's course brings on herself. Do not lose track of the baby while managing the mother's bleed.`);
    }
    if (arr) cause = `${arr.story}\n\nUterine atony is the most common, most correctable cause of postpartum hemorrhage. Fundal massage and oxytocin both work on the SAME mechanism — a uterus that will not clamp down on the vessels the placenta left open — and most cases respond to one or both in the field.`;
    return {died, cause, notes, correct: s.pi === "OBEM", truth: "Postpartum hemorrhage from uterine atony"};},
},

respArrest: {cat: "medical", id: "RESP-026", pronouns: "she", title: "Female, 24. Barely breathing, days of fever.",
  limit: 900, transport: 420,
  bystanders: "Her family is frightened. \"She's had a high fever for days and now we can't wake her up.\"",
  units: [{at: 300, level: "paramedic", name: "Medic 5"}],
  dispatch: ["24F, unresponsive, barely breathing.", "High fever and difficulty breathing for days.", "Family present."],
  update: ["Her breathing is occasional and gasping."],
  impression: "In bed, unresponsive, pale and dusky. Occasional agonal gasps — not real breathing. A carotid pulse is present, fast. This is a respiratory arrest, and oxygen is the whole treatment.",
  imps: ["RARF", "RDOT", "SEPS", "FEVR", "SHOK"],
  condition: "pneumoniaSepsis",
  patient: {age: 24, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "You can't get a history from her — she's unresponsive. Family: \"Fever for days, coughing, breathing got worse and worse, and now this.\"", kind: "pt",
      evid: "Days of fever and progressive respiratory decline → hypoxic respiratory failure/arrest, likely pneumonia + sepsis.", find: "Collateral: days of fever/cough → respiratory failure."}),
    sample: () => ({say: "Family: \"Allergic to Augmentin. No regular medicines. No real medical history. She barely ate today.\"", kind: "pt",
      evid: "SAMPLE (collateral) — febrile illness, no chronic disease; septic source likely pulmonary.", find: "SAMPLE: Augmentin allergy, no meds, days of febrile illness."}),
    lungs: () => ({say: "Coarse crackles through the right chest; poor air movement overall.", kind: "warn",
      evid: "Focal crackles — pneumonia as the septic source and the cause of the shunt.", find: "Coarse right-sided crackles; poor air movement."}),
    skin: () => ({say: "Hot and dry, then pale and dusky at the lips.", kind: "crit", evid: "Fever + central cyanosis: septic and profoundly hypoxic.", find: "Febrile; central cyanosis."}),
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    const vent = (s.done.bvm || 0) + (s.done.ett || 0) + (s.done.sga || 0) + (s.done.mouthMask || 0) + (s.done.mouthMouth || 0);
    let died = !!arr, cause = arr?.story || "";
    if (!arr && pat && ["PEA", "asystole"].includes(pat.rhythm)) died = 1;
    // Agonal + never ventilated = asphyxial death. A non-rebreather on a
    // barely-breathing patient is not ventilation; only positive pressure counts.
    if (!died && !vent) died = 1;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Agonal breathing is not breathing. Without positive-pressure ventilation the hypoxia deepened into an asphyxial arrest. Recognizing the agonal pattern and bagging her — with an adjunct and high-flow oxygen — is the intervention that saves her.";
    if (vent) notes.push("You recognized the agonal breathing and ventilated — the single action that reverses this arc. Add an airway adjunct and high-flow oxygen."); else notes.push("The agonal gasps were mistaken for breathing. She needed positive-pressure ventilation immediately — a non-rebreather on a barely-breathing patient does almost nothing.");
    if (s.done.opa || s.done.npa) notes.push("Airway adjunct placed — helps you deliver effective ventilations.");
    if (s.given.saline || s.given.plasmalyte) notes.push("A fluid bolus is reasonable for the septic hypotension once oxygenation is being handled — airway first.");
    if (s.pi === "CANT") notes.push("This is a respiratory (hypoxic) arrest with a septic source, not a primary cardiac arrest — the label sets the priorities.");
    return {died, cause, notes, correct: s.pi === "RARF", truth: "Severe pneumonia with sepsis → hypoxic respiratory arrest"};},
},

seizure: {cat: "medical", id: "NEUR-027", pronouns: "he", title: "Male, 25. Post-seizure, confused.",
  limit: 1200, transport: 480,
  bystanders: "His family lowered him to the floor. \"He seized about two minutes, then went to sleep. He has seizures — he doesn't always take his medicine.\"",
  units: [{at: 420, level: "emt", name: "BLS 6"}],
  dispatch: ["25M, seizure.", "Now post-ictal, breathing.", "History of seizures."],
  update: ["He's rousing but doesn't know where he is."],
  impression: "On the floor, awake but disoriented, slow to answer. Breathing on his own. Warm, a little pale. The seizure is over; this is the post-ictal state.",
  imps: ["SEIZ", "ALOC"],
  condition: "seizurePostictal",
  patient: {age: 25, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "He can't give you much — he's post-ictal. Family: \"He stiffened and shook maybe two minutes, then stopped and went limp. No warning we saw.\"", kind: "pt",
      evid: "Witnessed generalized seizure ~2 min, now post-ictal — a typical breakthrough seizure.", find: "Witnessed generalized seizure ~2 min; post-ictal."}),
    sample: () => ({say: "Family: \"No allergies. He's on Tegretol but he's not good about taking it. Seizures. Ate breakfast, skipped lunch. Nothing unusual today.\"", kind: "pt",
      evid: "SAMPLE — known seizure disorder, subtherapeutic anticonvulsant (non-compliant): breakthrough seizure.", find: "SAMPLE: NKDA, Tegretol (non-adherent), seizure d/o, skipped lunch."}),
    glucometer: () => ({say: "Blood glucose is normal.", kind: "obs", evid: "Hypoglycemia excluded — a key reversible seizure trigger. Normal here.", find: "BGL normal — hypoglycemia excluded."}),
    skin: () => ({say: "Warm, slightly pale, dry.", find: "Warm, dry."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A simple post-ictal patient should not be lost — the ways to harm him are an unprotected airway or missing a reversible cause.";
    notes.push("Post-ictal care is protective, not aggressive: position for airway protection/recovery, oxygen, check the glucose, and monitor for another seizure.");
    if (s.done.recovery || s.done.opa || s.done.npa || s.done.suction) notes.push("Airway protected during the post-ictal period — the main risk in a drowsy patient.");
    if (s.done.o2nrb || s.done.o2nc) notes.push("Oxygen given — reasonable while he reoxygenates from the seizure.");
    if (s.done.gluc) notes.push("Glucose checked — hypoglycemia is the classic reversible trigger and must be excluded."); else notes.push("No glucose check. Hypoglycemia mimics and triggers seizures — always check it.");
    if (s.given.midazolam) notes.push("Benzodiazepines are for an ACTIVE seizure (or status), not the post-ictal state — he's already stopped. Giving them now mostly deepens his sedation and his airway risk.");
    return {died, cause, notes, correct: s.pi === "SEIZ" || s.pi === "ALOC", truth: "Breakthrough generalized seizure, now post-ictal"};},
},

// A second scenario on the SAME condition as `seizure` above, reusing its
// mechanism wholesale (no new physiology) — the difference is entirely
// narrative/behavioral: post-ictal confusion presenting as combative
// agitation rather than drowsy cooperation, which is a real and common
// presentation and its own teaching point (scene safety, not personalizing
// aggression, protecting the airway anyway) distinct from the sleepy version.
seizureCombative: {cat: "medical", id: "NEUR-035", pronouns: "he", title: "Male, 34. Post-seizure, confused and combative.",
  limit: 1200, transport: 480,
  bystanders: "Two bystanders are keeping their distance. \"He was seizing on the sidewalk, and now he's swinging at anyone who gets close. We didn't know what else to do.\"",
  units: [{at: 300, level: "emr", name: "PD (scene safety)"}],
  dispatch: ["34M, seizure, now combative per caller.", "PD requested for scene safety.", "History unknown."],
  update: ["PD reports he's still swinging at anyone who approaches, but hasn't left the sidewalk."],
  impression: "Sitting up now, sweaty, disoriented, and taking a swing at anything that moves into his space. He isn't answering questions — he's not really tracking you as a person yet, just as something coming toward him.",
  imps: ["SEIZ", "ALOC"],
  condition: "seizurePostictal",
  patient: {age: 34, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "He can't answer — he's post-ictal and combative, not cooperative. A bystander who knows him a little: \"He just started shaking on the ground, maybe two minutes, then came up swinging. He does this, I think — he's not usually like this otherwise.\"", kind: "pt",
      evid: "Witnessed generalized seizure followed by post-ictal agitation/combativeness — a recognized presentation, not a psychiatric or intoxication event by itself, though those can't be excluded from the sidewalk.", find: "Witnessed generalized seizure ~2 min; post-ictal AGITATION rather than the usual drowsy confusion."}),
    sample: () => ({say: "No history available from him directly — he's too confused to answer, and nobody on scene knows his medications or allergies.", kind: "pt", find: "SAMPLE: unobtainable from patient; no bystander with reliable history."}),
    glucometer: () => ({say: "He fights the stick but you get a drop. Blood glucose is normal.", kind: "obs", evid: "Hypoglycemia excluded — the most important reversible cause of both a seizure AND confused/combative behavior. Normal here.", find: "BGL normal — hypoglycemia excluded."}),
    skin: () => ({say: "Warm, sweaty, flushed — consistent with the exertion of both the seizure and the struggling.", find: "Warm, diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A post-ictal patient, even a combative one, is not a threat to be subdued — he's a confused, disoriented person having a medical event. Losing him here usually means an airway problem missed because everyone was focused on the struggle instead of the patient.";
    notes.push("Post-ictal agitation is a recognized part of the seizure recovery period, not defiance — he isn't refusing to cooperate, he genuinely isn't oriented enough to understand what's happening to him yet.");
    notes.push("Scene safety first: give him space, keep bystanders back, and let PD manage physical safety while you stay ready to assess — approaching too fast or trying to physically control him usually prolongs the agitation, not shortens it.");
    if (s.done.gluc) notes.push("Glucose checked despite the combativeness — worth the fight, since hypoglycemia can look exactly like this and is immediately reversible."); else notes.push("No glucose check attempted. It's harder to get on a combative patient, but hypoglycemia can present as agitation just as easily as drowsiness, and it's the one thing here you can fix in the field.");
    if (s.done.recovery || s.done.opa || s.done.npa || s.done.suction) notes.push("Airway considered even though he was fighting you — the right instinct; combativeness doesn't make the airway risk go away, it just makes it harder to manage.");
    if (s.given.midazolam) notes.push("A benzodiazepine here would need real justification (recurrent/status seizure, not simple post-ictal agitation) — sedating a confused-but-breathing patient to make the scene easier is a safety call, not a treatment, and should be named as such if it's the reason.");
    return {died, cause, notes, correct: s.pi === "SEIZ" || s.pi === "ALOC", truth: "Breakthrough generalized seizure with post-ictal agitation/combativeness"};},
},

stabChest: {cat: "trauma", id: "TRMA-028", pronouns: "he", title: "Male, 32. Stab wound to the chest, struggling to breathe.",
  limit: 720, transport: 300, destSpecialty: "trauma",
  bystanders: "Scene is being secured. A witness is agitated and not making much sense.",
  units: [{at: 300, level: "paramedic", name: "Medic 1"}],
  dispatch: ["32M, stabbed in the chest.", "Struggling to breathe, gurgling.", "Scene being secured by PD."],
  update: ["\"His neck veins are standing up and he's fighting for air.\""],
  impression: "Supine, semi-conscious, gurgling. A bleeding stab wound to the left chest that bubbles. Breath sounds are gone on the left, the neck veins are up, and the trachea is drifting to the right.",
  imps: ["TRMA", "RDOT", "SHOK", "RARF"],
  condition: "stabChestTension",
  patient: {age: 32, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "You can't get OPQRST — he's barely responsive and gurgling. Mechanism is a single stab to the left chest.", kind: "pt",
      evid: "Penetrating chest trauma with obstructive + hemorrhagic shock — time-critical.", find: "Single stab, left chest; obtunded, gurgling."}),
    sample: () => ({say: "No usable history on scene. Treat empirically.", kind: "pt", evid: "No collateral — proceed on exam findings.", find: "SAMPLE: unknown."}),
    lungs: () => ({say: "Absent breath sounds on the left, hyperresonant to percussion. The chest wound bubbles with each breath.", kind: "crit",
      evid: "Tension pneumothorax (absent sounds + hyperresonance + tracheal shift + JVD): needs decompression NOW.", find: "Tension pneumothorax (L) — decompress."}),
    jvd: () => ({say: "Neck veins distended; trachea shifted to the right.", kind: "crit", evid: "JVD + tracheal deviation confirm the tension physiology.", find: "JVD + tracheal deviation (R)."}),
    skin: () => ({say: "Pale, clammy, cool. Weak, thready radial pulse.", kind: "crit", evid: "Obstructive + hemorrhagic shock.", find: "Weak thready pulses; shock."}),
  },
  micn: () => ({order: "\"Absent sounds, hyperresonant, trachea shifted, JVD — that's a tension. Decompress it now, seal the wound, support the volume with permissive hypotension, and transport Code 3 to trauma.\"",
    correct: true,
    onAccept: () => "Copy — needle decompression, seal, permissive hypotension, rapid transport.",
    onQuestion: "\"This is a tension pneumothorax. Decompress the left chest before anything else.\""}),
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    const decomp = (s.done.needleD || 0) + (s.done.chestTube || 0);
    const seal = (s.done.chestSeal || 0);
    let died = !!arr, cause = arr?.story || "";
    if (!arr && pat && ["PEA", "asystole"].includes(pat.rhythm)) died = 1;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + (!decomp
      ? "The tension pneumothorax was never decompressed. Rising intrathoracic pressure choked off venous return until the heart couldn't fill — a needle in the correct space reverses it in seconds."
      : "You decompressed, but the hemorrhagic shock underneath wasn't supported, or it was too late. Decompress AND support volume AND move — all at once.");
    if (decomp) notes.push("Needle/finger decompression — the life-saving action here; a tension pneumothorax kills by obstructing venous return."); else notes.push("The tension pneumothorax went undecompressed. This is THE intervention on this call.");
    if (seal) notes.push("The open wound was sealed — pair a vented seal with decompression so it doesn't re-tension.");
    if (s.given.saline || s.given.blood || s.given.plasma) notes.push("Volume support for the hemorrhagic component — target permissive hypotension, not a normal pressure.");
    return {died, cause, notes, correct: s.pi === "TRMA" || s.pi === "RDOT", truth: "Penetrating chest trauma with tension pneumothorax + hemorrhagic shock"};},
},

choking40: {cat: "medical", id: "CHOKE-029", pronouns: "she", title: "Female, 40. Choking at a restaurant, now unresponsive.",
  limit: 600, transport: 300,
  bystanders: "Diners are crowded around, one still trying back blows. A plate of food sits half-eaten.",
  units: [{at: 300, level: "emt", name: "BLS 2"}],
  dispatch: ["40F, choking at a restaurant.", "Bystanders attempting to help.", "Now reported unresponsive."],
  update: ["She's gone limp; nobody can clear it."],
  impression: "On the floor, unresponsive, dusky. No air moving. A carotid pulse is present. Something is lodged in the airway and nothing is getting past it.",
  imps: ["CHOK", "RARF", "CANT"],
  condition: "fbao",
  patient: {age: 40, gender: "female"},
  clothing: {dress: true, shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "No history to be had — she's unresponsive. Bystanders: \"She was eating, grabbed her throat, couldn't talk, then went down.\"", kind: "pt",
      evid: "Witnessed foreign-body airway obstruction progressing to unresponsiveness.", find: "Witnessed FBAO → unresponsive."}),
    sample: () => ({say: "A companion: \"She's got a nut allergy but she was just eating normally — she choked on the food.\" Airway is mechanically blocked, not swollen.", kind: "pt",
      evid: "Mechanical obstruction (food), not anaphylactic edema — the fix is removing the object.", find: "SAMPLE: mechanical FBAO (food); nut allergy noted."}),
    airwayLook: () => ({say: "Nothing moves on a breath. With a laryngoscope you can see the object at the cords — reachable with Magill forceps.", kind: "crit",
      evid: "Visualized foreign body at the glottis — direct laryngoscopy + Magill removal (or continue CPR/compressions).", find: "Foreign body visualized at the cords."}),
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    const cleared = !!s.cleared;
    let died = !!arr, cause = arr?.story || "";
    if (!arr && pat && ["PEA", "asystole"].includes(pat.rhythm)) died = 1;
    if (died && !cleared) cause = (arr?.story ? arr.story + "\n\n" : "") + "The airway was never cleared. In an unresponsive choking patient, CPR (the compressions generate airway pressure) and direct removal of the object are the treatment — you can't ventilate past an object.";
    if (cleared) notes.push("You cleared the obstruction — the entire problem. Compressions in the unresponsive choking patient, then a look with the laryngoscope and Magill forceps.");
    else notes.push("The object stayed in. Nothing you give works until the airway is mechanically cleared — that's the whole call.");
    if ((s.done.bvm || s.done.mouthMask) && !cleared) notes.push("You can't bag air past a lodged object — clear it first, then ventilate.");
    if (s.done.clearFB) notes.push("Direct laryngoscopy to remove the object under vision — the definitive move once BLS maneuvers fail.");
    return {died, cause, notes, correct: s.pi === "CHOK", truth: "Foreign body airway obstruction (unresponsive)"};},
},

// F8 batch — three low-mechanism-risk scenarios (no new physiology, no
// touched conditions): content-only, per the "avoid large-scale refactors"
// principle. Each uses either no `condition` key (a direct patient override,
// same pattern the engine already supports per physiology.js's buildPatient)
// or reuses an existing shipped condition — none of the heavier F8 asks
// (MCI/active-shooter, sickle cell crisis, the stabbing pair) are attempted
// here; they need new mechanics (mass-casualty triage flow, a new condition)
// and are better scoped as their own batch. See the queue note filed for them.
doa: {cat: "medical", id: "DOA-030", pronouns: "he", title: "Male, 70s. Found unresponsive by a neighbor doing a welfare check.",
  limit: 600, transport: 300,
  bystanders: "The neighbor is on the porch, refusing to go back inside. \"I knew something was wrong when I hadn't seen him in days.\"",
  units: [{at: 240, level: "emt", name: "BLS 3"}],
  dispatch: ["70M, unresponsive, welfare check.", "Neighbor called after mail piled up for several days."],
  update: ["Neighbor: \"The smell hit me before I even opened the door.\""],
  impression: "Supine on the living room floor. Skin mottled and discolored along the down side of the body. The joints do not move when tested. No chest rise, ever.",
  imps: ["CANT"],
  patient: {age: 74, hr: 0, sbp: 0, dbp: 0, rhythm: "asystole"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    skin: () => ({say: "Fixed, dependent lividity along the back and buttocks — pooled blood that does not blanch. The skin is cool throughout, not just the extremities.", kind: "crit",
      evid: "Dependent lividity, fixed and non-blanching — an obvious-death sign, not a resuscitation candidate.", find: "Dependent lividity present, fixed."}),
    airwayLook: () => ({say: "Jaw and neck are rigid — rigor mortis is established. This did not happen minutes ago.", kind: "crit",
      evid: "Rigor mortis established — obvious death.", find: "Rigor mortis present."}),
    opqrst: () => ({say: "No history from the patient — unresponsive, and has been for some time per the neighbor.", kind: "pt", find: "No history obtainable."}),
    sample: () => ({say: "Neighbor: \"He lived alone. Bad heart, I think. I don't know the last time anyone actually saw him — could be a few days.\"", kind: "pt",
      evid: "Unwitnessed, down an unknown but clearly extended interval — consistent with the exam findings.", find: "SAMPLE: unwitnessed, unknown down-time, lives alone, reported cardiac history."}),
  },
  resolve: (s) => {const attempted = (s.doses||[]).some(d => ["cpr","bvm","mouthMask","aedAnalyze","aedShock","defib","epiIV","epiIM"].includes(d.id));
    const recognized = s.findings.some(f => /lividity|rigor/i.test(f));
    let cause = "Dependent lividity and established rigor mortis — obvious death. No resuscitation attempt is indicated or expected once these signs are confirmed, at any provider level.";
    const notesOut = [];
    if (!attempted && recognized) notesOut.push("Obvious death signs (lividity, rigor) identified and resuscitation correctly withheld — this does not require online medical control once the signs are clear and documented.");
    else if (!attempted) notesOut.push("Resuscitation correctly withheld, though the exam findings that justify it (lividity, rigor) were never explicitly documented — find and state them, not just the outcome.");
    else notesOut.push("A resuscitation attempt was started on a patient with established obvious-death signs. Lividity and rigor are absolute — no drug or shock reaches someone this far gone, and starting only delays notifying the family and the medical examiner.");
    return {died: true, cause, notes: notesOut, correct: !attempted, truth: "Obvious death (dependent lividity, rigor mortis) — not a resuscitation"};},
},

prankCall: {cat: "medical", id: "PRANK-031", pronouns: "he", title: "Male, teens (reported). \"Unresponsive, not breathing\" per the caller.",
  limit: 600, transport: 300,
  bystanders: "A group of teenagers is filming on their phones from across the street, laughing.",
  units: [],
  dispatch: ["Teenage male, reportedly unresponsive and not breathing.", "Caller hung up before further questions."],
  update: ["Dispatch: no callback number, no further information."],
  impression: "Standing up and laughing the moment you make the porch. Nobody here is unresponsive, and nobody was.",
  imps: ["ALOC", "RARF"],
  patient: {age: 16, hr: 88, sbp: 118, rr: 16},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    loc: () => ({say: "Awake, oriented, and visibly annoyed you're still checking on him.", kind: "obs"}),
    opqrst: () => ({say: "\"Yeah, that was us, it's a joke, chill out.\" He is fully alert, oriented, and visibly annoyed you don't think it's funny.", kind: "pt",
      evid: "Alert, oriented, no complaint, no history consistent with the dispatch information — the call itself was fabricated.", find: "Patient alert and well; dispatch information did not match scene reality."}),
    sample: () => ({say: "\"I'm not sick. Nobody called an ambulance for anything real.\" No allergies, no medications, no complaint.", kind: "pt", find: "SAMPLE: no complaint, no history — well patient."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A full assessment on a well patient is still the correct move — dispatch information can be wrong OR fabricated, and you don't know which until you're standing there. The only mistake would have been assuming and leaving without checking.",
      "Document the hoax call for dispatch/PD — a false report ties up a unit that a real call might have needed."],
    correct: true, truth: "Hoax / prank call — no patient, no emergency"}),
},

// Test patient: a well adult at textbook baseline (no condition, so nothing
// deteriorates), for exercising every treatment, assessment and minigame
// against a normal patient.
baseline: {cat: "medical", id: "TEST-000", pronouns: "they", title: "Test patient, 35. Healthy, baseline vitals.",
  limit: 1800, transport: 300,
  bystanders: "Nobody else is here. It is a quiet, well-lit room.",
  units: [],
  dispatch: ["Test patient, adult. No complaint.", "Baseline vitals, no history."],
  update: [],
  impression: "Sitting comfortably, alert, pink and dry. Nothing is wrong. Use them to test your kit.",
  imps: ["ALOC", "RARF"],
  patient: {age: 35, hr: 72, sbp: 120, rr: 14},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I feel fine. No pain, nothing hurts."', kind: "pt", find: "OPQRST: no complaint."}),
    sample: () => ({say: '"No allergies, no medications, no history. Ate a couple of hours ago."', kind: "pt", find: "SAMPLE: NKDA, no meds, no PMH, last ate ~2h ago."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A baseline patient: every finding should read normal, and any drug given has a clean, unmasked effect."],
    correct: true, truth: "Healthy test patient, no pathology"}),
},

benignFaint: {cat: "medical", id: "SYNC-032", pronouns: "he", title: "Male, 19. Passed out, per roommate, \"mid-scream.\"",
  limit: 900, transport: 420,
  bystanders: "His roommate is still holding a game controller. \"We were in the middle of a match and he just went down.\"",
  units: [],
  dispatch: ["19M, syncope, now conscious per caller.", "Roommate states he 'just dropped' and came right back around."],
  update: ["Roommate: \"He's talking now, he's just embarrassed.\""],
  impression: "Sitting on the floor, leaning against the couch, sheepish. Alert and oriented, mildly pale, already looking better than the roommate's description suggested.",
  imps: ["ALOC", "SEIZ"],
  // Queue item 24 (neuro batch): this scenario has been condition-LESS
  // (static vitals only) since it shipped — vasovagalSyncope is the
  // condition it was always waiting for.
  condition: "vasovagalSyncope",
  patient: {age: 19, hr: 78, sbp: 112, rr: 14},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    loc: () => ({say: "Awake, oriented, and sheepish about the whole thing.", kind: "obs"}),
    opqrst: () => ({say: "\"We were down to the final round, everyone was screaming, and then — I don't even remember hitting the floor. I feel fine now, just embarrassed.\" No prior episodes, no chest pain, no post-ictal confusion.", kind: "pt",
      evid: "Brief loss of consciousness with rapid, full spontaneous recovery, triggered by acute emotional/postural stress (breath-holding/Valsalva during shouting) — classic vasovagal syncope, not seizure.", find: "OPQRST: sudden LOC, rapid full recovery, situational trigger (shouting/straining), no post-ictal state."}),
    sample: () => ({say: "\"No allergies, no meds, nothing wrong with me. Haven't eaten much today though, and it's hot in here.\"", kind: "pt",
      evid: "Situational contributors present (dehydration/skipped meals, heat) — reinforces a vasovagal mechanism over a cardiac or neurologic cause.", find: "SAMPLE: well otherwise, poor oral intake today, warm room."}),
    heart: () => ({say: "Regular, unremarkable.", find: "Heart: regular rate and rhythm, no murmur appreciated."}),
    skin: () => ({say: "Mildly pale, but warming and drying as you watch — not the picture of ongoing shock.", find: "Skin pale but improving; not diaphoretic or cool."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A single, brief, situational syncope with full and rapid recovery in a young, otherwise well patient is low-risk — but 'it was probably just a faint' is a conclusion you reach by ruling things out, not by assuming them. A resting 12-lead and orthostatic vitals are still reasonable before signing him off.",
      "Transport should be offered even though he'll likely refuse — first-time syncope in anyone deserves the option of an ECG and physician eval, and a refusal needs to be informed and documented."],
    correct: true, truth: "Vasovagal (situational) syncope"}),
},

// Low-acuity, content-only calls (same shape as doa/prankCall/benignFaint —
// static vitals, no physio condition). Per the player-feedback notes: "not
// every call is a thriller," and a run of these is also what makes the
// genuinely sneaky high-acuity calls (aorticDissection presenting as back
// pain, the sepsis dressed as a fever) actually sneaky, instead of the
// player pattern-matching "scenario exists therefore something is wrong."
minorSprain: {cat: "trauma", id: "TRMA-033", pronouns: "she", title: "Female, 22. Twisted her ankle playing pickup basketball.",
  limit: 600, transport: 300,
  bystanders: "A few teammates are standing around, more annoyed the game stopped than worried about her.",
  units: [],
  dispatch: ["22F, ankle injury, playing basketball.", "Conscious, alert, able to talk."],
  update: ["She's sitting on the sideline, ankle propped up, still holding the ball."],
  impression: "Sitting on the court, holding her right ankle, wincing when she tries to put weight on it. Alert, talking normally, mildly annoyed at herself.",
  imps: ["TRMA"],
  // Queue item 24: condition-LESS since it shipped — minorSprain is the
  // condition it was always waiting for (see section 8's Trauma category).
  condition: "minorSprain",
  patient: {age: 22, hr: 82, sbp: 116, rr: 16},
  clothing: {top: "short", bottom: "short", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I planted funny going for a rebound and it just rolled. Heard a pop, maybe? Hurts on the outside, worse when I try to stand on it.\" No other complaints — head, back, neck all fine.", kind: "pt",
      evid: "Isolated inversion ankle injury, immediate pain, no other complaint — no mechanism suggesting anything beyond the ankle itself.", find: "OPQRST: isolated inversion injury to the right ankle; no other complaint."}),
    sample: () => ({say: "\"No allergies, no meds, healthy otherwise. Just want to know if it's broken.\"", kind: "pt", find: "SAMPLE: well otherwise, no history."}),
    pedL: () => ({say: "Present, but she flinches — do the right side instead.", find: "Left pedal pulse present (control limb)."}),
    pedR: () => ({say: "Present and equal. Toes warm, sensation and movement intact distal to the injury — swelling and tenderness are confined to the lateral ankle, no deformity.", kind: "obs",
      evid: "Distal pulse, motor and sensation intact — no neurovascular compromise despite the deformity-free swelling.", find: "Pedal pulse present; PMS intact distal to injury; no gross deformity."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A working diagnosis in the field is 'ankle injury,' not 'sprain vs. fracture' — you cannot tell those apart without an X-ray, so splint/immobilize and treat the pain as if either is possible.",
      "The exam that actually matters here is neurovascular: pulse, motor, sensation distal to the injury, checked and rechecked. That's what tells you whether this is a same-day ortho visit or something more urgent.",
      "Not every call needs lights and sirens. Recognizing a genuinely low-acuity patient — and still doing a complete, unhurried exam — is its own skill."],
    correct: true, truth: "Isolated ankle inversion injury (sprain vs. non-displaced fracture — indistinguishable in the field)"}),
},

// Both of the following are two of the three "frequent flyer" variants
// (campaign.js's FREQUENT_FLYER_SCENARIOS — the third is minorSprain,
// above) — a recurring named patient who can turn up in any Career-mode
// shift, in any save, almost always for something this unremarkable. The
// mechanism (name/gender persistence, encounter counting, the rare
// opioid-overdose escalation) lives in App.jsx's kit→response transition
// and campaign.js; these are content-only, no `condition:` key, same
// shape as minorSprain/benignFaint/doa — genuinely nothing here for the
// physiology engine to model beyond static, stable vitals.
frequentFlyerIntoxicated: {cat: "medical", id: "FF-001", pronouns: "he", title: "Male, 20s. Found sitting against a wall, unsteady, smells strongly of alcohol.",
  limit: 600, transport: 300,
  bystanders: "A friend hovers nearby, embarrassed. \"He does this. He'll be fine, he just needs to sleep it off.\"",
  units: [],
  dispatch: ["Report of a man sitting against the wall outside the campus store, unsteady, strong odor of alcohol.",
    "Caller states — quote — \"he's been like this before.\""],
  update: ["He's slid further down the wall, eyes half-closed, muttering something about the game."],
  impression: "Sitting against the wall, clothes disheveled, strong odor of alcohol. Rousable to voice, slurred but coherent, mildly nauseous. Nothing about this looks new.",
  imps: ["ODPO"],
  patient: {age: 24, gender: "male", hr: 96, sbp: 108, rr: 16},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    loc: () => ({say: "Rousable to voice, slurred, oriented to person but fuzzy on the rest. Nothing acutely alarming — this is what he apparently always looks like.", kind: "obs"}),
    opqrst: () => ({say: "\"'M fine. Jus' had a few. Lemme sleep.\" No complaint of pain, no injury reported, no loss of consciousness — just drunk and irritated at being bothered.", kind: "pt",
      find: "No pain complaint, no reported LOC, no injury — presentation consistent with acute alcohol intoxication."}),
    sample: () => ({say: "\"No allergies, no meds. Ate somethin' earlier I think.\" Friend adds he's been drinking most of the afternoon, nothing else on board that they know of.", kind: "pt",
      find: "SAMPLE: NKDA, no regular meds, drinking since afternoon per friend, no reported co-ingestants."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Acute intoxication is a real working impression, not a shrug — but it's also a diagnosis of exclusion. A rousable, protecting-his-own-airway patient with stable vitals and a friend who can vouch for the story is genuinely low-acuity tonight.",
      "The habit worth building here is the one that matters on a night this ISN'T just that: check a set of vitals, actually look for trauma before writing off every complaint as 'he's drunk,' and reassess before you sign off."],
    correct: true, truth: "Acute alcohol intoxication"}),
},

frequentFlyerCannabis: {cat: "medical", id: "FF-002", pronouns: "he", title: "Male, 20s. Agitated, pacing, tells bystanders his heart is racing.",
  limit: 600, transport: 300,
  bystanders: "A couple of onlookers, more annoyed than concerned. \"He's just having a moment. Give him some air.\"",
  units: [],
  dispatch: ["Young adult, agitated, pacing near the quad benches, tells bystanders his heart is racing.",
    "No trauma reported. Caller sounds more annoyed than worried."],
  update: ["He's stopped pacing but still won't sit still, checking his own pulse every few seconds."],
  impression: "Pacing, visibly anxious, checking his own wrist for a pulse. Talking rapidly, insists something is 'seriously wrong' with his heart. No distress with breathing, skin warm and dry.",
  imps: ["ANXY"],
  patient: {age: 21, gender: "male", hr: 112, sbp: 128, rr: 20},
  clothing: {top: "short", bottom: "short", shoes: true},
  seed: () => ({}),
  probes: {
    loc: () => ({say: "Alert, oriented, talking fast — anxious, not confused.", kind: "obs"}),
    opqrst: () => ({say: "\"I smoked like twenty minutes ago and now my heart's going crazy, I think something's really wrong.\" No chest pain beyond the racing sensation itself, no shortness of breath, first time it's felt this bad.", kind: "pt",
      find: "OPQRST: onset ~20min after cannabis use, isolated palpitations/anxiety, no chest pain or dyspnea."}),
    sample: () => ({say: "\"No allergies, no meds, I'm healthy, I swear. Just smoked with some friends, that's it.\"", kind: "pt",
      find: "SAMPLE: well otherwise, no other substances reported, recent cannabis use."}),
    heart: () => ({say: "Tachycardic but regular. No murmur, nothing irregular about the rhythm itself — just fast.", find: "Heart: regular rate and rhythm, tachycardic, no murmur."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Cannabis-induced anxiety with sinus tachycardia is common and genuinely self-limited — reassurance, a calm environment, and time are the actual treatment, not a rush to the hospital.",
      "The reason this is still worth a real exam rather than a knowing shrug: 'anxious after smoking' and 'a real cardiac event that happens to have a nervous patient' can look identical for the first few minutes. Rule it out, don't assume it."],
    correct: true, truth: "Cannabis-induced anxiety / sinus tachycardia"}),
},

chronicBackPain: {cat: "medical", id: "MISC-034", pronouns: "he", title: "Male, 58. Chronic low back pain, worse today.",
  limit: 720, transport: 300,
  bystanders: "His wife is nearby, more resigned than worried. \"He gets like this a couple times a year.\"",
  units: [],
  dispatch: ["58M, back pain, ambulatory.", "History of chronic back pain per caller."],
  update: ["He's on the couch, shifting position every few seconds trying to get comfortable."],
  impression: "Sitting on the edge of the couch, guarding his lower back, moving slowly and deliberately. Alert, oriented, irritated more than distressed.",
  imps: ["TRMA"],
  // Queue item 24: condition-LESS since it shipped — chronicBackPain is the
  // condition it was always waiting for (section 8's Chronic category).
  condition: "chronicBackPain",
  patient: {age: 58, hr: 84, sbp: 138, rr: 16},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Same lower back pain I've had for years — degenerative disc, the doctor calls it. It's worse today, started after I moved some boxes yesterday. No new numbness, no tingling, nothing running down my legs. I can still feel and move everything fine — I just hurt.\"", kind: "pt",
      evid: "Chronic mechanical low back pain, acutely worsened by a clear lifting mechanism, with NO red-flag features (no leg numbness/weakness, no saddle anesthesia, no bowel/bladder change) volunteered on direct questioning — the findings that would rule cauda equina or cord compromise back IN, and their absence is what makes this safe to treat conservatively.", find: "OPQRST: chronic mechanical back pain, acute flare after lifting; denies leg numbness, weakness, or bowel/bladder change."}),
    sample: () => ({say: "\"No allergies. I take ibuprofen for this, took some this morning and it barely touched it. No fever, no weight loss, nothing like that. Just old and stubborn, like the doctor says.\"", kind: "pt",
      evid: "No fever, no unexplained weight loss, no history suggesting infection or malignancy — the other class of back-pain red flag, and also absent.", find: "SAMPLE: chronic back pain on NSAIDs, no fever, no red-flag history."}),
    pedL: () => ({say: "Present. Moves his toes and foot on command without hesitation.", find: "Left pedal pulse present; motor intact."}),
    pedR: () => ({say: "Present. Moves his toes and foot on command without hesitation. Strength and sensation symmetric both legs.", find: "Right pedal pulse present; motor and sensation intact and symmetric — no focal deficit."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Chronic back pain calls are exactly where the job is the negative exam: ask specifically about leg numbness, weakness, saddle anesthesia, and bowel/bladder changes (cauda equina), and about fever or unexplained weight loss (infection/malignancy). He has none of them — that's the finding, not a formality.",
      "Position of comfort and analgesia within scope is the whole prehospital treatment here. There is no procedure that fixes degenerative disc disease in the field.",
      "A low-acuity presentation is still a real patient. The skill this call tests is asking the red-flag questions even when nothing about the scene suggests you'll need the answer."],
    correct: true, truth: "Chronic mechanical low back pain, acute flare (no red-flag features)"}),
},

// A distracting-injury / masked-second-problem worked example: the sugar is
// real, low, and fixable — and fixing it is NOT the whole call. See
// conditions.js's hypoglycemiaMaskedBleed for the mechanism (glucose drives
// the existing generic seizure-risk pathway; brainInjury climbs on its own
// independent clock for the unwitnessed fall underneath it).
maskedBleed: {cat: "medical", id: "NEUR-036", pronouns: "he", title: "Male, 71. Found unresponsive on the kitchen floor.",
  limit: 1200, transport: 480,
  bystanders: "His daughter let herself in when he didn't answer the phone. \"He's diabetic — takes insulin. I don't know how long he's been down.\"",
  units: [{at: 420, level: "paramedic", name: "Medic 5"}],
  dispatch: ["71M, unresponsive.", "Diabetic, insulin-dependent, per daughter.", "Down time unknown."],
  update: ["Daughter: \"There's a chair knocked over by the counter. I don't know if that means anything.\""],
  impression: "Supine on the kitchen floor, unresponsive to voice, diaphoretic and cool. A chair lies knocked over nearby — nobody saw him go down.",
  imps: ["ALOC", "TRMA", "SEIZ"],
  condition: "hypoglycemiaMaskedBleed",
  patient: {age: 71, gender: "male"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  injuries: ["head"],
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"He was fine on the phone this morning. I couldn't reach him for a few hours after that — I don't know if he fell or when.\"", kind: "pt",
      evid: "Unwitnessed down time of unknown duration — a real gap the glucose reading alone does not close.", find: "OPQRST: unwitnessed, down time unknown."}),
    sample: () => ({say: "\"Insulin for his diabetes, blood pressure pills. No allergies. I don't know when he last ate — he lives alone.\"", kind: "pt",
      evid: "Insulin-dependent diabetic with an uncertain last meal — a textbook hypoglycemia setup, and also exactly the kind of clean explanation that stops a reassessment early.", find: "SAMPLE: insulin-dependent diabetic, last intake unknown."}),
    skin: () => ({say: "Diaphoretic, cool, pale — classic for a low sugar.", kind: "warn", find: "Diaphoretic, cool, pale."}),
    pupils: (s, v) => (v._cons !== "awake")
      ? {say: "The left pupil is now larger than the right and slow to react — that was not there a few minutes ago.", kind: "crit",
        evid: "New, evolving anisocoria after the glucose is already corrected — an intracranial process, not a sugar problem.", find: "New anisocoria, left > right, sluggish."}
      : {say: "Equal, reactive.", find: "PERRL."},
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    let died = !!arr, cause = arr?.story || "";
    const sugarFixed = !!(s.given.d10 || s.given.glucagon || s.given.oralGlucose);
    if (sugarFixed) notes.push("The glucose itself was corrected — real, reversible, and worth doing immediately. It was never the whole call.");
    else notes.push("The glucose was never corrected. Whatever else is going on, a sugar in the 20s is an immediate, treatable threat on its own.");
    if (sugarFixed && (v._cons !== "awake" || (pat && pat.brainInjury > 0.3)))
      notes.push("Sugar's fixed and he still isn't waking up the way a simple hypoglycemic should. That gap is the finding — a second, untreatable-in-the-field process is running on its own clock underneath the one you already solved. Recognizing it (not stopping at the first good explanation) is what this call is actually testing.");
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "The sugar was the distractor, not the threat — an unwitnessed fall with a slowly expanding intracranial bleed needed rapid recognition and transport once the glucose stopped explaining the exam.";
    notes.push("There is no field fix for an expanding intracranial bleed — the lever here is recognizing that the picture no longer fits 'just hypoglycemia' and transporting accordingly, the same way an unresolving TBI is handled elsewhere in this job.");
    return {died, cause, notes, correct: s.pi === "ALOC" || s.pi === "TRMA", truth: "Hypoglycemia (corrected) with a concurrent, unwitnessed traumatic intracranial hemorrhage"};},
},

// First real MCI scenario — exercises the `patients` array / roster/triage
// machinery physiology.js has carried since the childbirth (mother+newborn)
// batch but that no scenario had actually used from the start of a call
// (childbirth spawns its second patient mid-call via the obstetric model's
// spawn queue; this is the first scenario with more than one patient AT
// DISPATCH). Every condition below already ships elsewhere — reuse, not new
// mechanism, per this project's own standing rule. Honest limitation, stated
// rather than hidden: you have ONE transport unit. The other two patients'
// fates are read off their own live vitals/deathCause at the moment you
// commit to transport (or the scene clock runs out) — the other units on
// scene are narrated as loading and transporting them, but nothing actually
// simulates a second ambulance's run to the hospital. A real "several
// simultaneous transports" system is a bigger, separate build (see the F22
// queue entry on multi-unit/multi-patient systems) — this is the first
// playable step toward it: real triage, real simultaneous deterioration,
// real prioritization under a single scene time limit.
mciPileup: {cat: "trauma", id: "MCI-001", pronouns: "they", title: "Three-vehicle pileup. Three patients, one of them critical.",
  limit: 1500, transport: 480, destSpecialty: "trauma",
  bystanders: "Two more drivers are on their feet in the road, waving you toward the car with the worst damage. \"There's three of them — get to him first!\"",
  units: [{at: 360, level: "paramedic", name: "Medic 9"}],
  dispatch: ["Multi-vehicle collision, reported 3 patients.", "PD requesting a second ambulance.", "At least one patient trapped/pinned."],
  update: ["Fire confirms extrication is complete on the pinned patient — free to assess and move."],
  impression: "Three patients spread across a short stretch of road. One — driver of the lead car — was pinned until fire just freed him and looks the worst by far. A second, pulled from the back seat, is awake but wincing, a fender having come to rest across both legs before fire lifted it off. A third, the second car's driver, is up and walking, arguing with a bystander about whose fault this was.",
  imps: ["TRMA", "SHOK", "HOTN"],
  locOnStreet: true,
  patients: [
    {id: "red", role: "red", name: "the pinned driver", condition: "polytraumaMoto", patient: {age: 34}},
    {id: "yellow", role: "yellow", name: "the back-seat passenger", condition: "crushSyndrome", patient: {age: 45}},
    {id: "green", role: "green", name: "the second car's driver", patient: {age: 26, hr: 96, sbp: 126, rr: 18}},
  ],
  clothing: {top: "jacket", bottom: "pants", shoes: true},
  seed: () => ({}),
  // Written to branch on WHICH patient is active — s.activePatientId, set by
  // the Triage panel's patient switcher — rather than one fixed narrative,
  // since the same probe button is shared across all three roster entries.
  probes: {
    history: (s) => ({
      red: {say: "Nothing from him — he groans to a sternal rub and no more. Fire: \"Steering wheel deformed, maybe 20 minutes pinned before we got him out.\"", kind: "pt",
        evid: "Prolonged entrapment plus high-energy frontal impact — assume multi-system trauma.", find: "20+ min entrapment, GCS low."},
      yellow: {say: "\"It's my legs — I can feel them, it just aches everywhere, worse than it should.\" Fire: \"Fender was across both thighs maybe ten minutes.\"", kind: "pt",
        evid: "Ten-minute lower-extremity compression — a real crush/reperfusion risk even though she's talking to you.", find: "~10 min bilateral thigh compression, patient alert."},
      green: {say: "\"I'm fine, I'm FINE, tell them it wasn't my fault.\" No complaints when asked directly — neck, chest, belly, all clear.", kind: "pt",
        evid: "Ambulatory, no complaints on direct questioning — the lowest-priority patient, but still worth a real exam before you believe that.", find: "Denies all complaints; ambulatory at scene."},
    }[s.activePatientId] || {say: "Nothing new.", kind: "obs"}),
    sample: (s) => ({
      red: {say: "Fire, going through his wallet for ID: \"Nothing on him for a medical alert. No idea about allergies or meds — we don't know this guy.\"", kind: "pt",
        evid: "No reliable collateral SAMPLE history — an unidentified, unresponsive patient; treat allergies and medications as unknown, not negative.", find: "SAMPLE: unobtainable — unresponsive, unidentified."},
      yellow: {say: "\"No allergies. I take something for my blood pressure, I don't remember the name. No other problems. I ate maybe two hours ago.\"", kind: "pt",
        evid: "SAMPLE — an antihypertensive only, no anticoagulant; nothing here worsens the compression injury beyond the mechanism itself.", find: "SAMPLE: BP medication (unnamed), NKDA, meal ~2h prior."},
      green: {say: "\"I'm FINE. No allergies, no meds, nothing wrong with me — can we talk about HIS insurance instead of mine?\"", kind: "pt",
        evid: "SAMPLE — well otherwise, no injury-relevant history; consistent with the low-acuity, ambulatory presentation.", find: "SAMPLE: NKDA, no medications, well otherwise."},
    }[s.activePatientId] || {say: "Nothing new.", kind: "obs"}),
    skin: (s) => ({
      red: {say: "Gray, cold, diaphoretic.", kind: "crit", evid: "Decompensated shock.", find: "Gray, cold, diaphoretic skin."},
      yellow: {say: "Pale, clammy. Both thighs firm and tense to palpation, mottled where the fender sat.", kind: "warn",
        evid: "Firm, tense compartments after a compression mechanism — crush syndrome until proven otherwise.", find: "Bilateral thigh firmness/mottling post-compression."},
      green: {say: "Warm, dry, normal color. A seatbelt bruise across the chest, nothing else.", kind: "obs", find: "Warm/dry/pink; seatbelt sign only."},
    }[s.activePatientId] || {say: "Normal.", kind: "obs"}),
  },
  // No micn() — this call's teaching point is triage and prioritization
  // under one scene clock, not a base-contact order to refuse.
  resolve: (s, v, arr) => {
    const notes = [];
    const roster = s._roster || [];
    const at = (id) => roster.find(e => e.id === id)?.patient || null;
    const red = at("red"), yellow = at("yellow"), green = at("green");
    // Whichever roster entry the player was NOT actively caring for when the
    // call ended is scored off its own live vitals/deathCause — the engine
    // keeps stepping every roster member every tick (physiology.js), so this
    // is a real reading, not a guess, even though no transport was simulated
    // for them individually.
    const line = (label, id, pat) => {
      if (!pat) return `${label}: never reached.`;
      if (pat.deathCause) return `${label}: died on scene — ${pat.deathStory || pat.deathCause}`;
      if (id === s.activePatientId && arr) return `${label}: arrested in your care — ${arr.story}`;
      const pv = pat.vitals();
      return `${label}: last vitals HR ${Math.round(pv.hr)}, BP ${Math.round(pv.sbp)}/${Math.round(pv.dbp)}, SpO2 ${Math.round(pv.spo2)} — handed to the second unit on scene.`;
    };
    notes.push(line("Patient 1 (RED — pinned driver, polytrauma)", "red", red));
    notes.push(line("Patient 2 (YELLOW — passenger, crush injury)", "yellow", yellow));
    notes.push(line("Patient 3 (GREEN — walking wounded)", "green", green));
    notes.push("Real MCI triage means the sickest patient doesn't automatically get every minute you have — a 10-minute bilateral lower-extremity compression needs fluids and monitoring started BEFORE the fender is even off, or the reperfusion load hits all at once once it's lifted. Treating red to the total exclusion of yellow is its own failure mode, not caution.");
    const died = !!arr;
    const cause = arr?.story || "";
    return {died, cause, notes, correct: s.pi === "TRMA", truth: "Multi-casualty collision: severe polytrauma (red), bilateral crush injury (yellow), and an uninjured ambulatory patient (green)"};
  },
},

// F2/F8b — an assault victim on a scene that is not yet secured (F7's real
// hazard mechanic), paired with the medication-allergy mechanism (App.jsx's
// SC.allergy hook, F6/F3) — which shipped with zero scenarios ever
// declaring it, until this one. Reuses polytraumaFall's wound set
// UNCHANGED, the same reuse bikeVsCar already established (the mechanism
// doesn't literally match a fall, but the wound combination — open femur
// fracture with arterial bleeding, a tensioning penetrating chest wound, a
// head laceration with unequal pupils — is a defensible severe-polytrauma
// pattern for "beaten badly, one of them may have had a knife," not a new
// condition invented for this scenario).
unsafeSceneAssault: {cat: "trauma", id: "TRMA-037", pronouns: "he", title: "Male, 30s. Beaten in a parking lot. Scene not yet secure.",
  limit: 1400, transport: 540, destSpecialty: "trauma",
  hazard: "Bystanders say two men jumped him and left on foot less than five minutes ago — one of them may have had a knife. They could still be close. Stage until PD confirms the lot is clear.",
  bystanders: "A bar patron flags you down from the sidewalk, keeping her distance from the man on the ground. \"They just took off — I don't know where.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 5"}],
  dispatch: ["Assault, male down in a parking lot.", "PD en route, not yet on scene.", "Caller reports he's not moving much."],
  update: ["PD reports the lot is clear — no sign of the assailants. Safe to approach."],
  impression: "Supine between two parked cars. An obviously deformed right thigh with bright red blood pooling beneath it, a penetrating wound to the left chest, and a scalp laceration. He responds only to pain.",
  imps: ["TRMA", "SHOK", "ALOC"],
  condition: "polytraumaFall",
  // A parking lot is a business-adjacent placement.
  locConstraints: ["business"],
  patient: {age: 33, gender: "male"},
  // The whole point of this pairing: nobody on scene can tell you he's
  // allergic to fentanyl, because nobody on scene knows him at all.
  allergy: "fentanyl",
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "No usable history from him — he's responding to pain only. The bystander who called it in: \"I heard yelling, then saw two guys running off. He was already down when I got here.\"", kind: "pt",
      evid: "Unwitnessed assault, patient obtunded on arrival — assume the worst mechanism, not the best case.", find: "OPQRST unobtainable; witnessed only the aftermath."}),
    sample: () => ({say: "Nobody on scene knows him. No wallet found nearby, no medic-alert jewelry. \"I've never seen him before tonight,\" the bystander says.", kind: "pt",
      evid: "No collateral history available at all — allergies, medications, and history are all genuinely UNKNOWN, not just unasked. Treat empirically, and watch what you give him as closely as what you find on exam.", find: "SAMPLE: completely unobtainable; unknown patient, no ID, no bystander who knows him."}),
    lungs: () => ({say: "The chest wound draws air with each breath. Breath sounds fading on the left, going hyperresonant; trachea starting to shift.", kind: "crit",
      evid: "Penetrating chest wound tensioning — needs a vented seal, then decompression.", find: "Penetrating L chest wound, tensioning."}),
    skin: () => ({say: "Cool, pale, sweating. The thigh wound is still pumping bright red.", kind: "crit",
      evid: "Decompensated hemorrhagic shock — an arterial thigh bleed.", find: "Arterial thigh bleed; decompensated shock."}),
    // Same shared polytraumaFall icp mechanism `fall`/`bikeVsCar`'s own
    // pupils probes now read live (F9) — see `fall`'s comment for the
    // measured numbers.
    pupils: (s) => (s.patient?.icp || 10) > 25
      ? {say: "Unequal, one blown and sluggish now.", kind: "crit",
        evid: "Unequal pupils — rising ICP / TBI.", find: "Anisocoria — TBI."}
      : {say: "Sluggish, but still equal for now.", kind: "warn",
        evid: "Early TBI sign layered on the shock — the trend is up if the tension chest and the bleed aren't addressed.", find: "Pupils sluggish, equal — not yet anisocoric."},
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient;
    const bleedCtrl = (s.doses.some(d=>d.id==="tq")?1:0) + (s.done.pack || 0) + (s.done.directPressure || 0);
    const chest = (s.done.chestSeal || 0) + (s.done.needleD || 0) + (s.done.chestTube || 0);
    const allergicReaction = (s.evidence || []).some(e => e.startsWith("Allergic reaction"));
    let died = !!arr, cause = arr?.story || "";
    if (!arr && pat && ["PEA", "asystole"].includes(pat.rhythm)) died = 1;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + (!bleedCtrl
      ? "He bled out from an uncontrolled arterial thigh bleed. The unsecured scene was a real hazard, but it doesn't change the resuscitation once you're at his side — hemorrhage control comes first."
      : "Bleeding was addressed, but the tension chest went unmanaged, or wasn't managed in time.");
    notes.push(bleedCtrl ? "Tourniquet / direct pressure on the arterial thigh bleed — the correct priority." : "The pumping arterial thigh bleed was never controlled.");
    notes.push(chest ? "The penetrating chest was sealed and decompressed as it tensioned." : "The penetrating chest wound went unmanaged and tensioned.");
    if (allergicReaction) notes.push("A real teaching point: 'no known allergies' on an unidentified, unresponsive patient means allergies are UNKNOWN, not absent. The fentanyl triggered a real reaction the chart never had any way to warn you about — recognizing and managing it (stop the drug, support the airway) matters as much as recognizing it in a patient who could have told you himself.");
    notes.push("The scene wasn't secure when this call started. Staging until PD confirmed it was clear wasn't overcaution — it's what let you reach him at all.");
    return {died, cause, notes, correct: s.pi === "TRMA" || s.pi === "SHOK", truth: "Multi-system blunt and penetrating assault trauma — arterial hemorrhage, tension pneumothorax, TBI"};},
},

// F2/F8b — two patients from one altercation, reusing the multi-patient
// roster (physiology.js, first exercised by mciPileup) rather than
// inventing a new mechanic. The victim reuses stabChestTension UNCHANGED —
// a second real consumer of that condition. The second patient is
// content-only, like mciPileup's own "green" entry: no systemic physiology
// to model for a minor laceration and a lot of adrenaline. Also exercises
// the F7 hazard mechanic: the second man is still on scene, agitated, and
// the knife hasn't been located.
stabbingPair: {cat: "trauma", id: "TRMA-038", pronouns: "they", title: "Two patients, one stabbing. Knife not yet located.",
  limit: 1300, transport: 480, destSpecialty: "trauma",
  hazard: "The second man involved is still on scene, agitated, insisting it was self-defense — PD isn't here yet and the knife hasn't been found. Keep your exit clear.",
  bystanders: "A small crowd has gathered outside the bar, more filming than helping. \"He stabbed him! He's still right there!\"",
  units: [{at: 300, level: "paramedic", name: "Medic 3"}],
  dispatch: ["Stabbing, one patient down outside a bar.", "PD en route.", "Caller says the other party involved is still on scene."],
  update: ["PD arrives and separates the second man from the patient — scene now controlled."],
  impression: "One man is down on the sidewalk, a hand pressed weakly to his own chest, breathing fast and shallow. A second man stands a few feet off, breathing hard, a shallow cut across his forearm, insisting it was self-defense.",
  imps: ["TRMA", "SHOK", "HOTN"],
  // "Outside a bar" — business-adjacent placement.
  locConstraints: ["business"],
  patients: [
    {id: "vic", role: "red", name: "the stabbing victim", condition: "stabChestTension", patient: {age: 26}},
    {id: "other", role: "green", name: "the second man", patient: {age: 29, hr: 108, sbp: 132, rr: 20}},
  ],
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  // Branches on s.activePatientId, same pattern as mciPileup — one probe
  // definition shared across both roster entries.
  probes: {
    history: (s) => ({
      vic: {say: "He can barely get words out between breaths. \"Can't — breathe —\"", kind: "pt",
        evid: "A patient this dyspneic this fast after a single stab wound is tensioning — don't wait for a full history to act.", find: "Minimal history obtainable; severe dyspnea, single stab wound."},
      other: {say: "\"He came at me first, I swear, I just wanted him off me!\" No complaints when asked directly about his own injury beyond the cut.", kind: "pt",
        evid: "Agitated but coherent, one superficial forearm laceration — the lower-acuity patient, but still worth a real exam.", find: "Denies other injury; superficial forearm laceration only."},
    }[s.activePatientId] || {say: "Nothing new.", kind: "obs"}),
    sample: (s) => ({
      vic: {say: "He can't manage more than a word at a time. \"No — meds — I don't — know—\" A bystander: \"I don't know him, I just called it in.\"", kind: "pt",
        evid: "No reliable SAMPLE history obtainable from a patient this dyspneic with no known collateral — treat allergies and medications as unknown.", find: "SAMPLE: unobtainable — severe dyspnea, no reliable collateral."},
      other: {say: "\"No allergies, no meds, I'm not the one who's hurt here! Ask HIM, not me!\"", kind: "pt",
        evid: "SAMPLE — well otherwise, agitated but coherent; nothing here changes the priority away from the tensioning chest wound.", find: "SAMPLE: NKDA, no medications, well otherwise, agitated."},
    }[s.activePatientId] || {say: "Nothing new.", kind: "obs"}),
    skin: (s) => ({
      vic: {say: "Pale, cool, sweating. The stab wound bubbles with each breath.", kind: "crit",
        evid: "Sucking chest wound with early tension physiology.", find: "Sucking chest wound; pale/cool/diaphoretic."},
      other: {say: "Warm, flushed — adrenaline, not shock. The laceration is shallow and has mostly stopped.", kind: "obs", find: "Superficial forearm laceration, minimal ongoing bleeding."},
    }[s.activePatientId] || {say: "Normal.", kind: "obs"}),
  },
  resolve: (s, v, arr) => {
    const notes = [];
    const roster = s._roster || [];
    const at = (id) => roster.find(e => e.id === id)?.patient || null;
    const vic = at("vic"), other = at("other");
    const line = (label, id, pat) => {
      if (!pat) return `${label}: never reached.`;
      if (pat.deathCause) return `${label}: died on scene — ${pat.deathStory || pat.deathCause}`;
      if (id === s.activePatientId && arr) return `${label}: arrested in your care — ${arr.story}`;
      const pv = pat.vitals();
      return `${label}: last vitals HR ${Math.round(pv.hr)}, BP ${Math.round(pv.sbp)}/${Math.round(pv.dbp)}, SpO2 ${Math.round(pv.spo2)} — handed to the second unit/PD on scene.`;
    };
    notes.push(line("Patient 1 (stabbing victim, tensioning chest wound)", "vic", vic));
    notes.push(line("Patient 2 (second man, superficial laceration)", "other", other));
    notes.push("The second man being agitated and still on scene is a real safety problem, not a second patient to ignore — he needed both a real exam and to be kept where PD could reach him. Neither cancels the other out.");
    const died = !!arr;
    const cause = arr?.story || "";
    return {died, cause, notes, correct: s.pi === "TRMA" || s.pi === "SHOK", truth: "Assault: a tensioning stab wound to the chest (victim) and a superficial defensive laceration (second party)"};
  },
},

// F2/F8b — testicular torsion, built content-only (no `condition:` key),
// per physiology queue item 24's own established pattern for presentations
// whose "physiology" is almost entirely local (minorSprain/benignFaint):
// torsion's systemic footprint is a mild pain-driven tachycardia, not a
// real hemodynamic/respiratory mechanism worth a physio() condition. The
// actual teaching point — recognizing a time-critical surgical emergency
// (~4-6h testicular salvage window) that LOOKS almost benign on vitals
// alone, and not delaying transport to "wait and see" — doesn't need one
// either. No PI code for a genitourinary emergency exists in gear.js's
// registry (section 8's Renal/Genitourinary category has nothing built at
// all yet); rather than invent one on an unconfirmed NEMSIS protocol
// number, this reuses ABDP (Abdominal Pain, tp 1206) — real overlap, since
// prehospital protocols generally route acute genital/pelvic pain through
// an abdominal/pain-management protocol absent imaging.
testicularTorsion: {cat: "medical", id: "MISC-035", pronouns: "he", title: "Male, 16. Sudden, severe groin pain.",
  limit: 900, transport: 420,
  bystanders: "His mother is pacing the hallway outside his room. \"He won't tell me what's wrong, he just says it hurts and he's scared.\"",
  units: [],
  dispatch: ["16M, severe abdominal/groin pain, sudden onset.", "Patient reluctant to describe the complaint to his mother."],
  update: ["He asks to speak to you without his mother in the room."],
  impression: "Curled on his side on the bed, guarding, sweating, clearly in severe pain. Alert, oriented, embarrassed more than confused — he's been putting off saying exactly where it hurts.",
  imps: ["ABDP", "TRMA"],
  patient: {age: 16, hr: 112, sbp: 128, rr: 20},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Once his mother steps out: \"It's — down there. It just started, maybe forty-five minutes ago, no warning. It's the worst pain I've ever felt, and it's not really moving anywhere else — it's right there.\" He's nauseated and vomited once.", kind: "pt",
      evid: "Sudden-onset, severe, unilateral scrotal/groin pain in a teenage male, with nausea/vomiting — the classic testicular torsion presentation. Time-critical: testicular salvage drops sharply past about 4-6 hours from onset.", find: "OPQRST: sudden severe unilateral groin pain, ~45 min, nausea/vomiting, no trauma."}),
    sample: () => ({say: "\"No allergies, no meds. Never had anything like this before. I didn't get hit or hurt myself — it just started.\"", kind: "pt",
      evid: "No trauma mechanism volunteered — spontaneous onset fits torsion better than a straddle injury or epididymitis (which usually builds more gradually).", find: "SAMPLE: NKDA, no meds, no trauma history, first episode."}),
    abdo: () => ({say: "Abdomen itself is soft, non-tender in all four quadrants — the pain is lower, and he won't let you examine further without more privacy.", kind: "obs",
      evid: "A benign abdominal exam with severe reported pain 'down there' should point you AWAY from an abdominal cause, not reassure you — the source is genital, not abdominal.", find: "Abdomen soft, non-tender; pain source is genital, not abdominal."}),
    skin: () => ({say: "Pale, sweating through the discomfort. No fever to the touch.", kind: "obs", evid: "No fever — argues somewhat against epididymo-orchitis, though it doesn't rule it out.", find: "Diaphoretic, afebrile."}),
  },
  resolve: (s) => ({died: false, cause: "",
    notes: ["Testicular torsion is a true surgical time-critical emergency — the testicle itself can die from ischemia in as little as 4-6 hours, and every minute spent hesitating to ask the right question or delaying transport is minutes off that clock.",
      "The exam that matters here is the history, not the vitals — his heart rate and pressure look almost unremarkable for '10 out of 10 pain.' A patient minimizing, or a provider not asking specifically, is how this gets missed until it's too late.",
      "A teenage patient may be too embarrassed to volunteer this complaint in front of a parent. Asking directly, privately, and without judgment is part of getting the history right.",
      "There is no field procedure that fixes this. The prehospital job is recognizing it, treating the pain within scope, and getting him to a facility that can operate — without delay."],
    correct: s.pi === "ABDP", truth: "Testicular torsion — a time-critical surgical emergency with a benign-looking vital-sign picture"}),
},

sickleCellCrisis: {cat: "medical", id: "MISC-036", pronouns: "he", title: "Male, 22. Severe pain, known sickle cell disease.",
  limit: 1200, transport: 480,
  bystanders: "His girlfriend called it in. \"He gets these sometimes, but this one's worse than usual.\"",
  units: [],
  dispatch: ["22M, known sickle cell disease, severe generalized pain.", "Conscious, alert, in obvious distress.", "Girlfriend reports a mild cold the last two days."],
  update: ["He says the breathing is starting to feel tight, on top of the pain."],
  impression: "Curled on the couch, guarding his back and both legs, grimacing with every breath. Alert and cooperative but clearly in severe pain, breathing a little fast.",
  imps: ["PMGT", "RDOT", "SEPS"],
  condition: "sickleCellCrisis",
  patient: {age: 22, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It\'s everywhere — my back, both legs, it\'s throbbing, like nothing I can do makes it better. This is a nine, maybe a ten. I\'ve had crises before but not like this one. It started yesterday and it\'s just gotten worse."', kind: "pt",
      evid: "Diffuse, severe, deep bone/joint pain in a patient with known sickle cell disease is the textbook vaso-occlusive crisis presentation — there is no single tender point because the sickling is happening in small vessels all over, not at one site.", find: "OPQRST: diffuse severe bone/back/leg pain, ~24h, known SCD, worse than his usual crises."}),
    sample: () => ({say: "\"I have sickle cell — the disease, not just the trait. I've had a cold the last couple days, haven't been drinking much water because it hurts to move. No allergies. I take folic acid and hydroxyurea.\"", kind: "pt",
      evid: "A viral illness plus poor oral intake are two of the classic VOC triggers — dehydration and any process that drops local oxygen tension both promote sickling. Hydroxyurea is a real SCD-modifying medication, and this history rules a first presentation out.", find: "SAMPLE: known homozygous SCD, recent viral illness, poor fluid intake, on hydroxyurea."}),
    lungs: () => ({say: "Breath sounds are equal, a little diminished at the bases from how shallow he's breathing around the pain — he says a deep breath makes his back hurt worse.", kind: "obs",
      evid: "Splinting from pain alone can look like this — but in SCD, any new respiratory symptom during a crisis has to be taken seriously, because acute chest syndrome (pulmonary vaso-occlusion) is the leading cause of death in this disease and can look like nothing more than pain-limited breathing at first.", find: "Lungs: equal, mildly diminished at bases, guarded/shallow breathing pattern."}),
    skin: () => ({say: "Pale for his complexion, no jaundice grossly visible tonight, warm, sweating with the pain.", kind: "obs",
      evid: "Chronic pallor fits the baseline hemolytic anemia of sickle cell disease — this is not a new, acute pallor from bleeding.", find: "Skin pale (chronic baseline), warm, diaphoretic with pain."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveO2 = s.done.o2nc || s.done.o2nrb || s.done.bvm || s.done.cpap;
    const gaveFluid = s.given.saline;
    const gaveAnalgesia = s.given.fentanyl || s.given.morphine || s.given.ketorolac;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Progressive hypoxemia let the sickling cycle run unchecked — the vaso-occlusion causing the hypoxia and the hypoxia driving more vaso-occlusion, until his lungs could no longer keep up on room air.";
    if (gaveO2) notes.push("Supplemental oxygen was given — the single most important intervention here. It does not fix the sickling directly; it removes the hypoxemia that is DRIVING the sickling, which is the whole difference between a crisis that stabilizes and one that spirals into acute chest syndrome.");
    else notes.push("No supplemental oxygen was given. Even a patient who is not yet profoundly hypoxic benefits from oxygen here — it interrupts the hypoxia-sickling feedback loop before it starts, not just after it is obvious.");
    if (gaveFluid) notes.push("IV fluids were given — appropriate. Dehydration is one of the documented crisis triggers, and rehydration is standard supportive care alongside analgesia.");
    if (gaveAnalgesia) notes.push("Analgesia was given. There is no field cure for a vaso-occlusive crisis — pain control and supportive care (oxygen, fluids) ARE the treatment, and undertreating sickle cell pain is a well-documented, real bias in prehospital and emergency care worth naming directly.");
    else notes.push("No analgesia was given for a patient in severe pain with a well-documented, chronic diagnosis. Sickle cell pain is real and severe; undertreating it is a recognized equity problem in EMS, not a reason for caution.");
    notes.push("There is no field intervention that reverses sickling directly — oxygen, fluids and analgesia all work by removing what is driving the crisis forward (hypoxia, dehydration, pain-driven stress), not by treating the disease itself.");
    return {died, cause, notes, correct: s.pi === "PMGT", truth: "Sickle cell vaso-occlusive crisis, triggered by a viral illness and dehydration, with early acute chest syndrome"};},
},

heatStroke: {cat: "medical", id: "HEAT-001", pronouns: "he", title: "Male, 20. Collapsed running in full sun, confused.",
  limit: 1200, transport: 480,
  bystanders: "His teammates flagged you down. \"He said he felt fine twenty minutes ago — then he just went down.\"",
  units: [],
  dispatch: ["20M, collapsed during outdoor practice, extreme heat advisory in effect.", "Confused, teammates report he stopped sweating."],
  update: ["He's getting harder to rouse and starting to twitch."],
  impression: "Down on the pavement in full sun, skin hot and dry to the touch — no sweat anywhere, despite the heat. Confused, mumbling, not oriented to where he is.",
  imps: ["HEAT", "ALOC", "SEIZ"],
  condition: "heatStroke",
  patient: {age: 20, gender: "male"},
  clothing: {top: "short", bottom: "shorts", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "He can't give a reliable history — confused, answering questions with the wrong ones back. A teammate: \"We've been running conditioning drills for like ninety minutes, full sun, it's got to be past a hundred out here. He said he felt fine right up until he just collapsed.\"", kind: "pt",
      evid: "Sudden collapse with altered mental status after prolonged exertion in extreme heat is the exertional heat stroke picture — young and previously healthy is typical, not reassuring.", find: "OPQRST: collapse after ~90 min of exertion in extreme heat, sudden AMS onset, per teammates."}),
    sample: () => ({say: "Teammate: \"He's healthy, no meds, no allergies that I know of. He hadn't been drinking much water — none of us really had, honestly.\"", kind: "pt",
      evid: "Poor hydration during prolonged exertional heat exposure is exactly the setup that overwhelms sweating capacity and precipitates heat stroke.", find: "SAMPLE: no medical history volunteered, poor fluid intake during exertion, previously healthy."}),
    skin: () => ({say: "Hot to the touch, and completely dry — no sweat anywhere, even at the hairline, despite the heat and how hard he'd been working.", kind: "crit",
      evid: "Hot, DRY skin is the clinical discriminator between heat exhaustion (still sweating, still compensating) and heat stroke (thermoregulation has failed). This is not 'very sweaty' — it is the opposite, and it is the sign that changes the whole management.", find: "Skin: hot, dry — no sweating. Thermoregulatory failure."}),
    loc: () => ({say: "Confused, disoriented to place and time, slow to answer, drifting off mid-sentence.", kind: "obs",
      evid: "Altered mental status is a defining feature of heat stroke, not an incidental finding — hyperthermic encephalopathy is real, direct cellular injury, not simple exertional fatigue.", find: "LOC: confused, disoriented, slow to respond."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const shaded = s.done.moveToShade;
    const activeCooled = s.done.activeCooling;
    const fluid = s.given.saline;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "His own thermoregulation had already failed — with sweating stopped and nothing done to actively remove heat, his core temperature kept climbing until it cost him.";
    if (shaded) notes.push("Moving him out of direct sun was the right first move — free, immediate, and it removes real radiant heat load. It is not a cure: the air itself is still dangerously hot, which is exactly why it has to be paired with active cooling, not substituted for it.");
    else notes.push("He was never moved out of direct sun. Even while everything else is being set up, getting him out of direct radiant heat costs nothing and helps immediately.");
    if (activeCooled) notes.push("Active cooling (ice packs, misting and fanning) was applied — the actual treatment. His own sweat mechanism has failed, so external cooling is the only way heat is coming off him now.");
    else notes.push("No active cooling was applied. His sweat glands have already failed — oxygen and fluids alone do not lower a core temperature this high; the body has no way left to cool itself without help.");
    if (fluid) notes.push("IV fluids were given — appropriate supportive care for a dehydrated, hyperthermic patient, though fluids alone do not substitute for actually cooling him.");
    notes.push("Hot, dry skin is the sign to teach from here: heat EXHAUSTION still sweats and still compensates; heat STROKE means thermoregulation has failed outright, and that failure feeds on itself — the hotter he gets, the less his own body can do about it, which is why external cooling cannot wait for the hospital.");
    return {died, cause, notes, correct: s.pi === "HEAT", truth: "Exertional heat stroke — thermoregulatory failure from prolonged exertion in extreme heat with inadequate hydration"};},
},

accidentalHypothermia: {cat: "medical", id: "ENV-002", pronouns: "he", title: "Male, 58. Found down outside, cold to the touch.",
  limit: 1200, transport: 600,
  bystanders: "A neighbor found him on the ground near his truck. \"He was out here for hours, I think — I don't know how long. He's barely moving.\"",
  units: [],
  dispatch: ["58M, found down outdoors, overnight low well below freezing.", "Barely responsive, skin cold."],
  update: ["He's more sluggish than he was — slower to respond every time you check."],
  impression: "Curled on the ground next to a stalled truck, skin cold and pale, barely rousable, shivering has stopped. No obvious trauma.",
  imps: ["HYTH", "ALOC"],
  condition: "accidentalHypothermia",
  patient: {age: 58, gender: "male"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "He can barely speak in full sentences — slow, slurred, mostly just moaning. A neighbor: \"His truck wouldn't start last night, he must have been out here trying to fix it. I don't know when he actually went down.\"", kind: "pt",
      evid: "An unknown, likely prolonged cold-exposure duration with no shivering left and a barely responsive patient is the moderate-to-severe hypothermia picture — the real danger is that nobody knows how long he's actually been out here.", find: "OPQRST: unknown duration of overnight cold exposure, minimally responsive."}),
    sample: () => ({say: "Neighbor: \"He lives alone, has some heart trouble I think, takes pills for his blood pressure. No allergies that I know of.\"", kind: "pt",
      evid: "Prehospital hypothermia is disproportionately a problem for people who live alone with a mechanism (a stalled vehicle, a fall, intoxication) that keeps them from getting back inside — the history matters as much as the number on the thermometer.", find: "SAMPLE: hypertension, lives alone, unknown last-seen-normal time."}),
    skin: () => ({say: "Cold to the touch everywhere you check, pale, and completely dry — no shivering, no goosebumps response, nothing.", kind: "crit",
      evid: "Shivering stopping is not a reassuring sign — it means the body has exhausted its ability to generate heat on its own, the same 'thermoregulation has failed outright' turning point heat stroke's own hot-dry-skin sign marks in the opposite direction.", find: "Skin: cold throughout, pale, no shivering."}),
    // Reads pat.metabolicEncephalopathy live (this condition's own,
    // temperature-driven consciousness handle — not a scripted snapshot), so
    // a re-check after real rewarming shows genuine improvement, and a
    // re-check with no treatment (or a still-cold environment) shows him
    // getting WORSE, not the same line twice.
    loc: (s) => {
      const enc = s.patient?.metabolicEncephalopathy ?? 0;
      return enc >= 0.8
        ? {say: "Unresponsive to voice or pain. Barely a gag response.", kind: "crit", find: "LOC: unresponsive, minimal response to painful stimulus."}
        : enc >= 0.5
        ? {say: "Responds only to a firm sternal rub, and only with a moan — no words, no eye opening to voice.", kind: "obs", find: "LOC: responsive to pain only."}
        : {say: "Sluggish but answering — slow, slurred, but he's tracking your questions.", find: "LOC: alert but sluggish, slurred speech."};
    },
    // Reads v.rhythm/v.hr live — a real, generic bradycardia (cardiovascular.js's
    // own coreTemp<35 term) and, below 32 C, the Osborn/J-wave ECG finding
    // (ecg.js/patient.js) are BOTH genuinely emergent from current pat.coreTemp,
    // not scripted here — a re-check after real rewarming shows the rate and
    // the strip both changing for real.
    heart: (s, v) => (v.ecg === "osborn" || v.ecg === "firstDegreeBlock")
      ? {say: `Slow — you count ${v.hr}. The monitor shows something odd right after each QRS, a little hump you don't usually see.`, kind: "crit", find: `Heart: bradycardic (${v.hr}), Osborn (J) wave on the strip.`}
      : {say: `Slow, regular. You count ${v.hr}.`, kind: "obs", find: `Heart: bradycardic (${v.hr}), regular.`},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const warmed = s.done.warm;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "His core temperature kept falling with nothing done to actively reverse it — a cold enough heart is an irritable heart, and eventually it found a rhythm that couldn't be shocked back.";
    if (warmed) notes.push("Active rewarming was started — the actual treatment. It will not fix this in the field (real rewarming runs about 1 C an hour), but it is the only thing that turns the trajectory around instead of letting exposure keep winning.");
    else notes.push("No active rewarming was given. He was left to keep losing heat to the same cold environment that put him down — this does not get better on its own once shivering has stopped.");
    notes.push("A cold enough heart is a genuinely irritable one — the same reason this patient is handled gently, not just kept warm: rough movement in severe hypothermia is a documented trigger for a rhythm that will not tolerate it.");
    notes.push("\"Not dead until warm and dead\" is the real teaching point here — a severely hypothermic patient can present looking clinically dead (fixed pupils, unrecordable pulse) and still be viable; resuscitation efforts are not abandoned on cold-exposure patients the way they might be otherwise.");
    return {died, cause, notes, correct: s.pi === "HYTH", truth: "Accidental (environmental) hypothermia from prolonged, unwitnessed overnight cold exposure"};},
},

spontaneousPneumothorax: {cat: "medical", id: "RESP-027", pronouns: "he", title: "Male, 23. Sudden chest pain and shortness of breath.",
  limit: 1000, transport: 480,
  bystanders: "His roommate called after he came out of his room pale and breathing oddly.",
  units: [],
  dispatch: ["23M, sudden onset chest pain and dyspnea, no injury reported.", "Conscious, alert, tall and thin build."],
  update: [],
  impression: "Sitting bolt upright, tall and thin, breathing shallow and fast, guarding his right side. No visible injury anywhere.",
  imps: ["RDOT", "CPNC"],
  condition: "spontaneousPneumothorax",
  patient: {age: 23, gender: "male"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It just started — sharp pain on my right side, worse when I breathe in. No warning at all, I was just sitting on the couch. It\'s about a six out of ten."', kind: "pt",
      evid: "Sudden-onset pleuritic chest pain at rest, no trauma, in a young thin patient is the classic primary spontaneous pneumothorax presentation.", find: "OPQRST: sudden sharp right-sided pleuritic pain at rest, ~20 min, no mechanism."}),
    sample: () => ({say: '"No injury, nobody hit me, I didn\'t fall. I\'m a smoker, if that matters. No other medical history."', kind: "pt",
      evid: "No trauma mechanism at all rules out a traumatic cause — this has to be spontaneous. Smoking is a real, documented risk factor for primary spontaneous pneumothorax.", find: "SAMPLE: no trauma, smoker, otherwise unremarkable history."}),
    lungs: () => ({say: "Breath sounds absent on the right, normal on the left. Hyperresonant to percussion on the right.", kind: "crit",
      evid: "Unilateral absent breath sounds with hyperresonance, no injury mechanism at all — a closed pneumothorax with no external wound to seal.", find: "Lungs: absent breath sounds (R), hyperresonant, no visible chest wall injury."}),
    skin: () => ({say: "Pale, mildly diaphoretic, no cyanosis yet.", find: "Skin pale, mildly diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const decompressed = s.done.needleD;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "The pneumothorax progressed to tension — rising intrathoracic pressure obstructed venous return until his heart could no longer fill.";
    if (decompressed) notes.push("Needle decompression was performed — the correct move once this progressed toward tension. There is no external wound here, so a chest seal was never the answer; this is a closed pneumothorax, and only decompression relieves it.");
    else notes.push("No decompression was performed. There is no wound to seal on this patient — recognizing a closed pneumothorax and being ready to decompress if it tensions is the whole skill being tested.");
    notes.push("A young, tall, thin patient with sudden pleuritic chest pain and NO trauma mechanism at all is the textbook primary spontaneous pneumothorax — it happens from a ruptured lung bleb, not an injury, and there is nothing to see on the outside of the chest.");
    return {died, cause, notes, correct: s.pi === "RDOT", truth: "Primary spontaneous pneumothorax in a young, thin patient — no external wound, no trauma"};},
},

openPneumothorax: {cat: "trauma", id: "TRMA-039", pronouns: "she", title: "Female, 27. Stabbed once in the chest.",
  limit: 1000, transport: 420,
  bystanders: "A bystander is holding a t-shirt against the wound and waving you down.",
  units: [],
  dispatch: ["27F, single stab wound to the chest.", "Conscious, alert, bystander applying pressure.", "Attacker fled; scene reported secure by PD."],
  update: ["The wound is making a wet sucking sound with every breath — the bystander backed off it when it started."],
  impression: "Sitting against a wall, breathing fast and shallow, a single stab wound to the left chest audibly sucking air with each breath.",
  imps: ["TRMA", "RDOT"],
  condition: "openPneumothorax",
  patient: {age: 27, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"He came out of nowhere, stabbed me once and ran. It hurts to breathe — feels like the air is going somewhere it shouldn\'t."', kind: "pt",
      evid: "A patient describing air moving somewhere it shouldn't with a penetrating chest wound is a strong subjective clue toward an open pneumothorax before you even look.", find: "OPQRST: single stab, immediate onset, sensation of air movement at the wound."}),
    sample: () => ({say: '"No allergies, no medications, healthy otherwise. This has never happened to me before, obviously."', kind: "pt", evid: "Unremarkable baseline health — nothing complicating the trauma itself.", find: "SAMPLE: NKDA, no meds, no prior history, otherwise healthy."}),
    lungs: () => ({say: "Air audibly moving through the wound itself with every breath — a sucking chest wound. Breath sounds diminished on the left.", kind: "crit",
      evid: "The audible sucking sound through the wound IS the open pneumothorax — the wound itself is the hole air is moving through, which is exactly what a vented chest seal is designed to fix.", find: "Lungs: sucking chest wound (L), diminished breath sounds."}),
    skin: () => ({say: "Pale, cool, mildly diaphoretic.", find: "Skin pale, cool, diaphoretic."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const sealed = s.done.chestSeal;
    const decompressed = s.done.needleD;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "The open wound was never sealed, and it tensioned — rising intrathoracic pressure choked off venous return until her heart couldn't fill.";
    if (sealed) notes.push("A vented chest seal was applied — the correct, specific fix for an open communicating wound. It lets air escape on exhalation while blocking it from being drawn in on inhalation, which is exactly what stops this from progressing to tension.");
    else notes.push("The wound was never sealed. Left open, this is exactly the wound that tensions — every minute without a seal is a minute closer to the heart losing its ability to fill.");
    if (decompressed) notes.push("Needle decompression was also performed — appropriate once tension physiology set in, but it does not substitute for sealing the wound in the first place.");
    notes.push("A vented seal, not an occlusive one, is the correct choice: fully occluding the wound with no vent can itself convert an open pneumothorax into a tension one by trapping air with nowhere to go.");
    return {died, cause, notes, correct: s.pi === "TRMA", truth: "Isolated open (sucking) chest wound — pneumothorax with no other injuries"};},
},

hemothorax: {cat: "trauma", id: "TRMA-040", pronouns: "he", title: "Male, 34. Stabbed in the back, struggling to breathe.",
  limit: 1100, transport: 480,
  bystanders: "A coworker called it in and is standing well clear.",
  units: [{at: 380, level: "emt", name: "BLS 6"}],
  dispatch: ["34M, single stab wound to the back.", "Conscious, weak, pale.", "PD reports scene secure, suspect in custody."],
  update: ["He's getting paler and harder to keep talking to you."],
  impression: "Slumped against a loading dock, pale and diaphoretic, breathing fast and shallow. A single stab wound visible on his right posterior chest.",
  imps: ["SHOK", "RDOT", "TRMA"],
  condition: "hemothorax",
  patient: {age: 34, gender: "male"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"He got me from behind — one hit, I think. It hurts to breathe, and I feel really weak, like I might pass out."', kind: "pt",
      evid: "A single posterior penetrating wound with progressive weakness and dyspnea, no air audibly sucking through the wound, points toward blood rather than air filling the pleural space.", find: "OPQRST: single posterior stab, progressive weakness, dyspnea, no audible air movement at the wound."}),
    sample: () => ({say: '"No allergies, no meds, I\'m healthy. I just need you to help me, I feel like I\'m fading."', kind: "pt", evid: "No complicating history — the picture is purely from the injury itself.", find: "SAMPLE: NKDA, no meds, otherwise healthy, feels like he is deteriorating."}),
    lungs: () => ({say: "Breath sounds markedly decreased on the right — and DULL, not hyperresonant, to percussion on that side.", kind: "crit",
      evid: "Dullness to percussion, not hyperresonance, is the finding that separates a hemothorax from a pneumothorax — fluid (blood) is denser than air and does not resonate. This is the finding that should stop you from reaching for a needle.", find: "Lungs: decreased breath sounds (R), DULL to percussion — fluid, not air."}),
    skin: () => ({say: "Pale, cool, clammy, delayed capillary refill.", kind: "obs", evid: "Signs of ongoing hemorrhagic shock, not just respiratory distress.", find: "Skin pale, cool, clammy, delayed cap refill — hemorrhagic shock."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const needled = s.done.needleD;
    const tubed = s.done.chestTube;
    const fluid = s.given.saline || s.given.blood;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Ongoing intrathoracic hemorrhage, compounded by a progressively compressed lung, was never controlled or drained — he bled and suffocated at the same time.";
    if (needled && !tubed) notes.push("Needle decompression was tried here. It relieves trapped AIR under tension — it does nothing for blood pooling in the chest, and the dullness to percussion (not hyperresonance) was the clue that this was never going to work.");
    if (tubed) notes.push("A chest tube was placed — the only field procedure that actually drains a hemothorax. This is genuinely paramedic-scope; a lower-scope crew's job here is recognizing it and getting him to a trauma center fast, not attempting a fix they don't carry.");
    else notes.push("No chest tube was placed. Needle decompression alone was never going to fix this — a hemothorax needs drainage, and if that isn't in scope, rapid transport is the actual treatment.");
    if (fluid) notes.push("Volume was given for the ongoing blood loss — appropriate, permissive-hypotension-targeted support while this heads to surgery.");
    notes.push("Dullness to percussion versus hyperresonance is the exam finding that separates this from a simple or tension pneumothorax — blood, not air, and it changes what actually helps him.");
    return {died, cause, notes, correct: s.pi === "SHOK" || s.pi === "TRMA", truth: "Hemothorax from a penetrating posterior chest wound — hemorrhagic shock plus a progressively compressed lung"};},
},

pleuralEffusionCall: {cat: "medical", id: "RESP-028", pronouns: "she", title: "Female, 68. Weeks of worsening breathlessness.",
  limit: 1300, transport: 540,
  bystanders: "Her daughter called after she couldn't finish a sentence without stopping to breathe.",
  units: [],
  dispatch: ["68F, known cancer diagnosis, progressive shortness of breath over weeks, acutely worse today.", "Conscious, alert, tripoding."],
  update: [],
  impression: "Sitting forward on the edge of her bed, hands on her knees, breathing fast and shallow. Alert and able to answer in short phrases.",
  imps: ["RDOT", "CPNC"],
  condition: "pleuralEffusion",
  patient: {age: 68, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"It\'s been building for weeks — I just thought I was out of shape. Today I couldn\'t even walk to the bathroom without stopping. No real pain, just... I can\'t get a full breath."', kind: "pt",
      evid: "A GRADUAL, WEEKS-LONG course culminating in an acute worsening fits a slowly accumulating pleural effusion reaching the point where compensation fails — not a sudden event like a pneumothorax or PE.", find: "OPQRST: weeks of gradually worsening dyspnea, acutely worse today, minimal pain."}),
    sample: () => ({say: '"I have lung cancer — stage four, diagnosed eight months ago. I had fluid drained from around my lung once before, a few months back."', kind: "pt",
      evid: "A known malignancy with a prior drained effusion, now recurring, is exactly the expected course of a malignant pleural effusion — they reaccumulate, often repeatedly.", find: "SAMPLE: known stage IV lung cancer, prior thoracentesis, recurrent symptoms."}),
    lungs: () => ({say: "Breath sounds absent at the right base, decreased partway up the right side. DULL to percussion over the same area.", kind: "crit",
      evid: "Absent breath sounds and dullness at a lung BASE, in a gradual course with a known malignancy, is the effusion picture — fluid layers with gravity, so it is worst at the bottom, unlike a pneumothorax which is worst at the top.", find: "Lungs: absent/decreased breath sounds and dullness at the right base."}),
    skin: () => ({say: "Pale, no diaphoresis, no fever to the touch.", find: "Skin pale, dry, afebrile."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const drained = s.done.chestTube;
    const oxygenated = s.done.o2nc || s.done.o2nrb || s.done.bvm || s.done.cpap;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A large, slowly accumulating pleural effusion finally compressed enough lung that oxygenation failed — nothing in the field beyond oxygen and positioning addressed the fluid itself.";
    if (drained) notes.push("A chest tube was placed and the effusion drained — a real, if unusually invasive, field option most crews carrying this drug box will not have (paramedic scope), and more than this patient strictly needed compared to the thoracentesis she'll get at the hospital.");
    else notes.push("No field drainage was attempted — reasonable. Most crews do not carry paramedic-level tube thoracostomy, and the actual job here is oxygen, positioning, and getting her to a facility that can perform a thoracentesis.");
    if (oxygenated) notes.push("Supplemental oxygen was given — appropriate supportive care while the underlying fluid accumulation is addressed at the hospital.");
    notes.push("Findings AT THE BASE of the lung, not the apex, plus a gradual weeks-long course in a patient with a known cause for fluid to accumulate, is what separates an effusion from an acute pneumothorax — gravity, not sudden air, is doing this.");
    return {died, cause, notes, correct: s.pi === "RDOT", truth: "Large recurrent malignant pleural effusion compressing the right lung"};},
},

ardsTransfer: {cat: "medical", id: "RESP-029", pronouns: "he", title: "Male, 52. Interfacility transfer, ventilated, worsening oxygenation.",
  limit: 1300, transport: 900,
  bystanders: "The sending nurse gives report at the bedside before you move him.",
  units: [],
  dispatch: ["52M, day 4 of severe sepsis/pneumonia, now ARDS, ventilated.", "Sending facility requesting transfer to a tertiary ICU.", "Sedated, ventilated, on high FiO2."],
  update: ["The receiving nurse warns you his oxygen saturation has been sagging despite the vent settings all shift."],
  impression: "Sedated and ventilated in the hospital bed, high-FiO2 alarms audible, chest rising with the machine, not fighting it.",
  imps: ["RDOT", "RARF"],
  condition: "ards",
  patient: {age: 52, gender: "male", assistedVent: {rr: 16, vt: 0.42}},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Sending nurse: \"Four days ago it was just pneumonia. Yesterday his oxygen requirement climbed no matter what we did to the vent. This is ARDS now — diffuse, both lungs on the chest film.\"", kind: "pt",
      evid: "A progressive, days-long course from a single-lung pneumonia to bilateral diffuse involvement despite escalating ventilator support is the defining ARDS trajectory — not a sudden event.", find: "OPQRST: 4-day progression from pneumonia to bilateral ARDS, worsening despite ventilator escalation."}),
    sample: () => ({say: "Nurse: \"No allergies on file. He's on broad-spectrum antibiotics and sedation, nothing you need to manage differently in transport beyond keeping the vent settings as ordered.\"", kind: "pt",
      evid: "Nothing here changes prehospital management — the job is maintaining exactly what is already working reasonably well, not intervening further.", find: "SAMPLE: on antibiotics and sedation, nothing prehospital-actionable in the history."}),
    lungs: () => ({say: "Diminished breath sounds bilaterally, equally — not one-sided. Ventilator is delivering the set breath; he is not fighting it.", kind: "crit",
      evid: "BILATERAL, roughly symmetric findings are the ARDS signature — a unilateral pneumonia does not look like this. Both lungs are diffusely, similarly involved.", find: "Lungs: bilateral, symmetric diminished breath sounds; synchronous with the ventilator."}),
    skin: () => ({say: "Warm, a little dusky at the lips despite the ventilator and high FiO2.", kind: "obs", evid: "Residual cyanosis DESPITE maximal supplemental oxygen is the FiO2-refractory hypoxemia that defines ARDS's severity — raising the oxygen percentage further has diminishing returns once shunt is this severe.", find: "Skin warm, mild perioral duskiness despite high FiO2 on the vent."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "His shunt was severe enough that no achievable FiO2 or field intervention could keep pace — the diffuse alveolar damage itself needed days to resolve, which transport time did not allow.";
    notes.push("The critical skill on an ARDS transfer is NOT fixing the underlying disease — nothing in a field or transport drug box reverses days of diffuse alveolar damage. It is maintaining exactly what the sending facility already had working: the same vent settings, the same sedation, minimizing disconnects and disruptions during the move.");
    notes.push("Refractory hypoxemia despite high FiO2 is the teaching point: once shunt is this severe, more inspired oxygen barely helps the fraction of blood that never contacts ventilated alveolar gas at all. Chasing the number with FiO2 alone has a ceiling this patient has already reached.");
    notes.push("Bilateral, symmetric findings distinguish this from a unilateral pneumonia or a pneumothorax — both lungs are diffusely and similarly involved, which is the actual definition of ARDS.");
    return {died, cause, notes, correct: s.pi === "RDOT" || s.pi === "RARF", truth: "ARDS secondary to severe pneumonia/sepsis — bilateral diffuse alveolar damage, FiO2-refractory hypoxemia"};},
},

aspirationPneumonitis: {cat: "medical", id: "RESP-030", pronouns: "she", title: "Female, 45. Vomited during a seizure, now coughing and short of breath.",
  limit: 1100, transport: 480,
  bystanders: "Her husband saw the whole thing and is shaken but able to talk.",
  units: [],
  dispatch: ["45F, witnessed generalized seizure, vomited during the event.", "Post-ictal, now coughing, breathing appears labored.", "No prior seizure history per husband."],
  update: ["Her cough is getting wetter and she's starting to look more short of breath than five minutes ago."],
  impression: "Sitting up, coughing frequently, breath sounds audibly wet. Post-ictal but increasingly alert, visibly working to breathe.",
  imps: ["RDOT", "SOBB"],
  condition: "aspirationPneumonitis",
  patient: {age: 45, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: 'Husband: "She was seizing for maybe a minute, and right as it was ending she vomited — I saw it happen, some of it clearly went down before I could turn her. She started coughing almost right away and it\'s gotten worse since."', kind: "pt",
      evid: "A WITNESSED aspiration event during/after a seizure, with cough beginning almost immediately afterward, is the classic setup for chemical aspiration pneumonitis — rapid onset (minutes), not the days-long course of an infectious pneumonia.", find: "OPQRST: witnessed vomiting/aspiration during a seizure, cough onset within minutes."}),
    sample: () => ({say: 'Husband: "No seizure history, ever — this is completely new. No allergies, no medications she takes regularly, as far as I know."', kind: "pt",
      evid: "A genuinely new-onset seizure needs its own workup, but the immediate prehospital priority is what happened right after it — the aspiration, not the seizure cause.", find: "SAMPLE: no seizure history, NKDA, no regular medications, first event."}),
    lungs: () => ({say: "Coarse, wet breath sounds, worse on the right, with a productive-sounding cough.", kind: "crit",
      evid: "Rapid-onset coarse/wet sounds specifically on the side that was down during the aspiration event fits chemical injury from aspirated gastric content, not a pre-existing infection.", find: "Lungs: coarse, wet, right-sided predominance, productive cough."}),
    skin: () => ({say: "Slightly pale, mild diaphoresis, no cyanosis yet.", find: "Skin pale, mild diaphoresis."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const suctioned = s.done.suction;
    const bronchodilator = s.given.albuterol;
    const oxygenated = s.done.o2nc || s.done.o2nrb || s.done.bvm || s.done.cpap;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Aspirated gastric content in the airway and the chemical injury it caused were never adequately managed — the airway stayed compromised while the resulting inflammation worsened her oxygenation.";
    if (suctioned) notes.push("The airway was suctioned — the correct, specific first move for a WITNESSED aspiration. Clearing what is actually sitting in the airway matters more here than almost anything else available in the field.");
    else notes.push("The airway was never suctioned despite a witnessed aspiration event. This is the one intervention that directly addresses what actually happened — everything else is supportive.");
    if (bronchodilator) notes.push("A bronchodilator was given — a reasonable response to the reflex bronchospasm acidic aspirate can trigger, the same mechanism a nebulizer treats in asthma.");
    if (oxygenated) notes.push("Supplemental oxygen was given for the chemical injury's real effect on oxygenation — appropriate.");
    notes.push("This is a chemical injury, not an infection — nothing in a field drug box (certainly not an antibiotic, which isn't even carried) reverses it directly. Airway clearance, bronchodilation if wheezing, oxygen, and rapid transport are the actual field treatment.");
    return {died, cause, notes, correct: s.pi === "RDOT" || s.pi === "SOBB", truth: "Aspiration pneumonitis from witnessed vomiting during a seizure — chemical airway/lung injury"};},
},

acuteBronchitis: {cat: "medical", id: "RESP-031", pronouns: "he", title: "Male, 34. Cough and mild wheeze for a week.",
  limit: 800, transport: 420,
  bystanders: "His coworker insisted he get checked out after a coughing fit at work.",
  units: [],
  dispatch: ["34M, week-long cough, mild wheeze reported by coworker.", "Conscious, alert, ambulatory."],
  update: [],
  impression: "Sitting comfortably, occasional productive cough, talking in full sentences without difficulty.",
  imps: ["SOBB", "RDOT"],
  condition: "bronchitis",
  patient: {age: 34, gender: "male"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I\'ve had this cough for about a week — started as just a tickle, now it\'s productive. I get a little wheezy when I cough hard, but I\'m not really short of breath otherwise. Low fever the last couple days."', kind: "pt",
      evid: "A week-long, gradually developing productive cough with only mild wheeze and no significant dyspnea is a benign course, not an acute emergency.", find: "OPQRST: 1-week productive cough, mild wheeze, low-grade fever, no significant dyspnea."}),
    sample: () => ({say: '"No allergies, no meds, no asthma or COPD, never smoked. This just feels like a bad cold that won\'t go away."', kind: "pt", evid: "No underlying respiratory disease — this is a self-limited process in an otherwise healthy adult, not an exacerbation of something chronic.", find: "SAMPLE: NKDA, no meds, no respiratory history, non-smoker."}),
    lungs: () => ({say: "Scattered mild wheeze, most notable with a forced cough. No focal crackles, no diminished areas.", kind: "obs", evid: "Scattered, mild, diffuse wheeze without focal findings argues against pneumonia or a focal process — this is diffuse airway irritation, consistent with bronchitis.", find: "Lungs: scattered mild wheeze, no focal findings."}),
    skin: () => ({say: "Warm, dry, normal color.", find: "Skin warm, dry, normal color — no distress signs."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["This is a genuinely low-acuity call — not every dispatch for 'respiratory distress' is a crisis. The skill here is a complete exam that RULES OUT the dangerous mimics (pneumonia, PE, early asthma exacerbation, CHF) rather than assuming the worst from the dispatch text.",
      "Acute bronchitis in an otherwise healthy adult is typically self-limited. There is no field cure for a viral bronchitis — supportive care, comfort, and appropriate transport decision-making are the actual skill being tested.",
      "A patient talking in full sentences with only mild, scattered wheeze and no significant hypoxia is not in extremis — recognizing the difference between 'sick' and 'has a respiratory complaint' matters for scene time and transport priority."],
    correct: true, truth: "Acute bronchitis — mild, self-limited, no significant systemic involvement"}),
},

bronchiolitisInfant: {cat: "medical", id: "PEDS-007", pronouns: "she", title: "Infant, 9 months. Wheezing, working hard to breathe.",
  limit: 900, transport: 420,
  bystanders: "Her mother is holding her, clearly frightened, watching every breath.",
  units: [],
  dispatch: ["9-month-old female, 2 days of cold symptoms, now wheezing and breathing fast.", "Conscious, alert, in mother's arms."],
  update: ["Mother reports she's had less wet diapers today than usual."],
  impression: "In her mother's arms, visibly working to breathe — nasal flaring, rib retractions with each breath, audible wheeze.",
  imps: ["SOBB", "RDOT"],
  condition: "bronchiolitis",
  patient: {age: 0.75, gender: "female"},
  clothing: {top: "short", bottom: "diaper", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: 'Mother: "She had a runny nose and a little cough starting two days ago, like any cold. Today she started breathing fast and I can hear her wheezing. She\'s never had anything like this before."', kind: "pt",
      evid: "A viral upper-respiratory prodrome followed by wheeze and increased work of breathing in an infant under 12 months, first episode, is the classic bronchiolitis presentation (most commonly RSV).", find: "OPQRST: 2 days of URI symptoms progressing to wheeze and respiratory distress, first episode."}),
    sample: () => ({say: 'Mother: "No allergies, no medications, full-term healthy baby, up to date on everything. She\'s had fewer wet diapers today — I noticed that this morning."', kind: "pt",
      evid: "Decreased urine output in an infant with increased work of breathing is a real sign of reduced oral intake/dehydration accompanying the respiratory illness — worth flagging, not just the breathing itself.", find: "SAMPLE: healthy, full-term, up to date on vaccines, decreased wet diapers today (possible dehydration)."}),
    // MEASURED, not scripted (see conditions.js bronchiolitis: pat.broncho
    // climbs 0.4->0.75 untreated, capped below asthma's own ceiling). Reads
    // pat.effectiveBroncho live, same pattern as toxicInhalationChlorine
    // (queue item F7). The retraction/flaring description stays fixed since
    // it is a real, objective sign of work of breathing, not a severity word.
    lungs: (s) => {
      const eb = s.patient?.effectiveBroncho ?? 0.4;
      const suffix = eb > 0.6 ? " Getting worse." : eb < 0.35 ? " Easing a little." : "";
      return {say: `Diffuse wheeze and fine crackles bilaterally, nasal flaring, subcostal and intercostal retractions visible with every breath.${suffix}`, kind: "crit",
        evid: "Retractions and nasal flaring are objective signs of significantly increased work of breathing in an infant — a much more reliable severity marker than how upset or calm the baby appears.", find: "Lungs: diffuse wheeze/crackles, nasal flaring, retractions — significant work of breathing."};
    },
    skin: () => ({say: "Warm, pink centrally, no cyanosis currently visible.", find: "Skin warm, pink, no cyanosis at this time."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const oxygenated = s.done.o2nc || s.done.o2nrb || s.done.bvm;
    const suctioned = s.done.suction;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Progressive small-airway obstruction and fatigue in a small infant with little reserve went unsupported until her own effort could no longer keep up.";
    if (oxygenated) notes.push("Supplemental oxygen was given for a hypoxic, working-hard infant — appropriate supportive care.");
    if (suctioned) notes.push("Nasal/airway suctioning was performed — genuinely useful in bronchiolitis, since infants are obligate nose-breathers and upper-airway secretions alone can meaningfully worsen the work of breathing.");
    notes.push("Bronchiolitis is largely a supportive-care diagnosis — there is no field cure, and (unlike asthma) the evidence for bronchodilators in bronchiolitis is weak; recognizing the work-of-breathing signs (retractions, flaring, grunting) and supporting oxygenation/hydration while transporting is the real skill.");
    notes.push("A small infant has very little physiologic reserve — retractions and nasal flaring are the objective signs to trust over how distressed the baby looks or sounds, since a tiring infant can look deceptively calmer right before decompensating.");
    return {died, cause, notes, correct: s.pi === "SOBB" || s.pi === "RDOT", truth: "Bronchiolitis (likely RSV) in a previously healthy infant, first episode"};},
},

pertussisInfant: {cat: "medical", id: "PEDS-008", pronouns: "he", title: "Infant, 2 months. Coughing fits, briefly turns blue.",
  limit: 900, transport: 420,
  bystanders: "His parents are frantic — they just watched him stop breathing for several seconds.",
  units: [],
  dispatch: ["2-month-old male, paroxysmal coughing fits, one witnessed brief color change.", "Conscious, alert between episodes.", "Unvaccinated per parents — too young for the pertussis series."],
  update: ["Another coughing fit is starting — you can hear it building."],
  impression: "Alert and pink between episodes, but parents describe violent coughing fits followed by a brief pause in breathing and color change.",
  imps: ["SOBB", "RDOT"],
  condition: "pertussis",
  patient: {age: 0.17, gender: "male"},
  clothing: {top: "short", bottom: "diaper", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: 'Mother: "He\'s had a cough for almost two weeks, we thought it was just a cold. The last two days it turned into these awful fits — he coughs so hard and so many times in a row that he can\'t catch a breath, and twice now he\'s gone a little blue and just... stopped, for a few seconds, before he starts breathing again."', kind: "pt",
      evid: "A prolonged (nearly 2-week) cough evolving into paroxysmal coughing fits with post-tussive apnea and cyanosis, in an infant too young for the pertussis vaccine series, is the classic (and genuinely dangerous) pertussis presentation.", find: "OPQRST: ~2 weeks of cough, now paroxysmal fits with witnessed post-tussive apnea/cyanosis."}),
    sample: () => ({say: 'Mother: "He\'s too young for his first pertussis shot — that\'s not until 2 months, which is right about now, we just haven\'t had the appointment yet. No other medical problems, born full term."', kind: "pt",
      evid: "An unvaccinated infant in the classic pertussis-susceptible window (too young for the series, and infants get almost no protection from maternal antibodies against pertussis specifically) is exactly the highest-risk population for this disease's dangerous complications.", find: "SAMPLE: unvaccinated (too young for the pertussis series), full-term, no other history."}),
    lungs: () => ({say: "Clear between fits — no wheeze, no crackles, completely unremarkable when he is not actively coughing.", kind: "obs",
      evid: "A CLEAR chest between episodes, contrasted with the dramatic fits themselves, is an important finding — this is not a continuous obstructive process like bronchiolitis or asthma; it is intermittent, paroxysmal, and can look deceptively fine in between.", find: "Lungs: clear between paroxysms — no baseline wheeze or crackles."}),
    skin: () => ({say: "Pink and warm right now, between episodes — but the parents insist he went dusky/blue during the fits.", find: "Skin currently pink; witnessed cyanosis during paroxysms per parents."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const monitored = s.done.pulseox || s.given.monitor;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A paroxysm produced apnea prolonged enough, in an infant with almost no physiologic reserve, that hypoxia was not corrected in time.";
    notes.push("The key danger here is not what the chest sounds like between fits — it is clear — it is the apnea DURING a paroxysm. This infant needs continuous monitoring through transport, not a one-time assessment, because the next fit can happen at any moment.");
    if (monitored) notes.push("Continuous monitoring was maintained — the correct call for a patient whose danger is intermittent and can appear with no warning.");
    else notes.push("Continuous monitoring was not clearly maintained. An infant with witnessed apneic/cyanotic spells needs to be watched continuously, not spot-checked, all the way to the hospital.");
    notes.push("An unvaccinated infant too young for the pertussis series is exactly the population pertussis is most dangerous for — this is also a reportable disease and a real public health concern for everyone else in the household and this crew.");
    return {died, cause, notes, correct: s.pi === "SOBB" || s.pi === "RDOT", truth: "Pertussis with paroxysmal cough and post-tussive apnea in an unvaccinated infant"};},
},

influenzaPneumonia: {cat: "medical", id: "RESP-032", pronouns: "he", title: "Male, 58. High fever, cough, getting harder to breathe.",
  limit: 1100, transport: 480,
  bystanders: "His wife called after his fever spiked and his breathing started looking labored.",
  units: [],
  dispatch: ["58M, 3 days of flu-like symptoms, high fever, now increasingly short of breath.", "Conscious, alert, appears unwell."],
  update: ["His breathing looks more labored than when you arrived."],
  impression: "In bed, flushed and sweating, breathing fast and visibly working at it. Alert, answering in short sentences.",
  imps: ["RDOT", "FEVR"],
  condition: "influenzaPneumonia",
  patient: {age: 58, gender: "male"},
  clothing: {top: "short", bottom: "shorts", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"Three days ago it was just body aches and a fever, felt like the flu. Today the breathing got bad — every breath feels like work now, and I\'m coughing up more than before."', kind: "pt",
      evid: "A several-day flu-like prodrome (fever, myalgias) progressing to real respiratory distress is the pattern of a viral pneumonia complicating influenza, not a sudden event.", find: "OPQRST: 3-day flu-like prodrome progressing to acute respiratory distress."}),
    sample: () => ({say: '"No allergies, no regular medications, I skipped my flu shot this year — figured I\'d be fine. No other health problems."', kind: "pt", evid: "Declined vaccination is a real, relevant risk factor here, though not something to belabor in the field beyond noting it.", find: "SAMPLE: NKDA, no meds, unvaccinated against influenza this season, otherwise healthy."}),
    lungs: () => ({say: "Diffuse fine crackles bilaterally, worse at the bases, with a productive cough.", kind: "obs", evid: "Bilateral, diffuse crackles rather than one focal area fits a viral pneumonia pattern more than a single-lobe bacterial consolidation.", find: "Lungs: bilateral fine crackles, worse at bases, productive cough."}),
    skin: () => ({say: "Hot, flushed, diaphoretic.", find: "Skin hot, flushed, diaphoretic — febrile."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const oxygenated = s.done.o2nc || s.done.o2nrb || s.done.bvm || s.done.cpap;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Progressive viral pneumonia drove his oxygenation down faster than anything in the field could keep pace with — supportive ventilation was needed and either wasn't given or wasn't enough.";
    if (oxygenated) notes.push("Supplemental oxygen (and escalation to positive pressure if needed) was provided — the actual treatment available in the field for viral pneumonia; there is no field antiviral or antibiotic to give.");
    else notes.push("No supplemental oxygen was given to a febrile, tachypneic, working-hard patient. Supportive oxygenation is the entire field treatment available here — there is nothing else in this drug box that treats a viral pneumonia directly.");
    notes.push("This can progress fast in an unvaccinated adult with comorbidity risk — a several-day flu prodrome that suddenly turns into real respiratory distress is exactly the pattern that can precede rapid deterioration, and it deserves an aggressive transport decision, not a wait-and-see one.");
    return {died, cause, notes, correct: s.pi === "RDOT" || s.pi === "FEVR", truth: "Influenza complicated by viral pneumonia, progressing toward respiratory failure"};},
},

covidPneumonia: {cat: "medical", id: "RESP-033", pronouns: "she", title: "Female, 61. Low oxygen reading, insists she feels fine.",
  limit: 1100, transport: 480,
  bystanders: "Her son called after a home pulse oximeter (his own idea) read alarmingly low.",
  units: [],
  dispatch: ["61F, known recent COVID-19 diagnosis, home pulse ox reading in the low 80s.", "Conscious, alert, per son 'doesn't seem that sick.'"],
  update: [],
  impression: "Sitting up in a chair, talking normally, in no apparent distress — the monitor reads a saturation well below what her appearance would suggest.",
  imps: ["RDOT", "FEVR"],
  condition: "covidPneumonia",
  patient: {age: 61, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"Honestly, I feel okay — a little tired, maybe. My son bought one of those little finger clip things and it keeps reading in the 80s, which scared him, but I don\'t feel short of breath at all."', kind: "pt",
      evid: "A patient reporting minimal subjective dyspnea despite an objectively low measured saturation is the well-documented \"silent\" or \"happy\" hypoxia seen with COVID-19 pneumonia — the pulse oximeter is telling the truth here even though the patient does not feel sick enough to match it.", find: "OPQRST: minimal subjective dyspnea despite objectively low SpO2 — a real mismatch, not a bad reading."}),
    sample: () => ({say: '"I tested positive for COVID five days ago. No allergies, I take a blood pressure pill, otherwise healthy. I really didn\'t think I needed anyone called."', kind: "pt",
      evid: "A confirmed COVID-19 diagnosis roughly five days prior is exactly the typical timeline for the pneumonia phase of the illness to develop, often with this same disconnect between how a patient feels and how hypoxic they actually are.", find: "SAMPLE: COVID-19 positive x5 days, on an antihypertensive, otherwise healthy."}),
    lungs: () => ({say: "Mild bibasilar crackles, no significant wheeze, no obvious increased work of breathing to look at.", kind: "crit",
      evid: "Relatively unremarkable-LOOKING lung findings and breathing pattern, paired with a genuinely low objective saturation, is exactly the trap here — trust the number, not how comfortable she appears.", find: "Lungs: mild bibasilar crackles, no visible respiratory distress despite hypoxemia."}),
    skin: () => ({say: "Warm, normal color, no obvious cyanosis to the naked eye despite the pulse ox reading.", find: "Skin warm, normal-appearing color — cyanosis not obviously visible despite measured hypoxemia."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const oxygenated = s.done.o2nc || s.done.o2nrb || s.done.bvm || s.done.cpap;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "The gap between how she felt and how hypoxic she actually was closed the wrong way — real oxygenation failure that her own perception never warned her about in time.";
    if (oxygenated) notes.push("Supplemental oxygen was given despite her denying significant symptoms — the correct call. Trusting the pulse oximeter over a patient's self-assessment is exactly the skill this call is testing.");
    else notes.push("No supplemental oxygen was given to a patient with a clearly abnormal SpO2, because she 'didn't seem that sick.' That is precisely the trap 'silent hypoxia' sets — treat the number, not just the appearance.");
    notes.push("'Happy' or 'silent' hypoxia is real and well documented with COVID-19 pneumonia: patients can have objectively dangerous oxygen saturations with minimal subjective distress. A normal-looking patient with an abnormal pulse oximeter reading needs to be taken seriously, not talked out of transport.");
    return {died, cause, notes, correct: s.pi === "RDOT" || s.pi === "FEVR", truth: "COVID-19 pneumonia with silent (asymptomatic) hypoxemia"};},
},

croupToddler: {cat: "medical", id: "PEDS-009", pronouns: "he", title: "Toddler, 2. Barky cough, noisy breathing, worse at night.",
  limit: 900, transport: 420,
  bystanders: "His mother is holding him upright, trying to keep him calm.",
  units: [],
  dispatch: ["2-year-old male, barky cough and noisy breathing, worse overnight.", "Conscious, alert, in mother's arms."],
  update: [],
  impression: "In his mother's lap, an unmistakable seal-bark cough, audible harsh sound with each inhale. Fussy but not frantic as long as his mother holds him.",
  imps: ["UAWI", "SOBB"],
  condition: "croup",
  patient: {age: 2, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: 'Mother: "He had a stuffy nose and a little cough yesterday, but tonight it turned into this — this barking, seal-like cough, and I can hear him breathing in. It\'s scarier at night, it seems better when I sit him up."', kind: "pt",
      evid: "A barky (\"seal-like\") cough with inspiratory noise, worse at night, following a mild cold, in a toddler is the classic croup presentation — a viral upper airway infection, not a foreign body or a lower-airway process.", find: "OPQRST: barky cough, inspiratory stridor, worse overnight, preceded by mild URI symptoms."}),
    sample: () => ({say: 'Mother: "No allergies, no medications, up to date on his shots, never had anything like this. He didn\'t choke on anything — I was right there, he just started sounding like this."', kind: "pt",
      evid: "No choking event witnessed and vaccines up to date — this rules out a foreign body aspiration and makes epiglottitis (largely a disease of unvaccinated or under-vaccinated children now) less likely, though not impossible.", find: "SAMPLE: no choking event, vaccines current, otherwise healthy."}),
    // MEASURED, not scripted (see conditions.js croup: pat.upperAirwayObstruction
    // climbs 0.35->0.65 over the call, no field pharmacologic fix). Reads
    // it live so a longer scene time shows real worsening (queue item F7).
    lungs: (s) => {
      const uao = s.patient?.upperAirwayObstruction ?? 0.35;
      const suffix = uao > 0.5 ? " It's getting harder to hear a gap between breaths." : "";
      return {say: `Harsh inspiratory stridor audible without a stethoscope, mild subcostal retractions when upset, improves noticeably when calm in his mother's arms.${suffix}`, kind: "crit",
        evid: "Stridor that improves with calm and worsens with agitation/crying is a real, useful sign in croup — it is also why keeping this child calm is itself a genuine part of the treatment, not just a comfort measure.", find: "Lungs: inspiratory stridor, mild retractions when agitated, improves when calm."};
    },
    skin: () => ({say: "Warm, pink, no cyanosis.", find: "Skin warm, pink, no cyanosis at this time."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["There is no field drug that fixes croup directly — a nebulized bronchodilator (albuterol) is NOT indicated here, because this is upper airway edema, not lower-airway bronchospasm; giving one anyway is a real, teachable mistake.",
      "Keeping this child CALM is a genuine part of the treatment, not just bedside manner — crying and agitation measurably worsen upper airway obstruction in croup. Letting a parent hold the child in a position of comfort, rather than forcing an exam or separating them, is the correct field approach.",
      "The barky, seal-like cough with inspiratory stridor is the pattern to recognize — and distinguishing it from a foreign body airway obstruction (no choking event, gradual viral prodrome) matters, because the treatment (calm, transport, oxygen if tolerated) is completely different from FBAO management.",
      "Most croup is mild and self-limited; the field skill is recognizing the minority that is severe enough to need closer monitoring and rapid transport, without escalating unnecessary interventions on a mild case."],
    correct: true, truth: "Croup (viral laryngotracheobronchitis) — moderate, upper airway inspiratory obstruction"}),
},

epiglottitisChild: {cat: "medical", id: "PEDS-010", pronouns: "she", title: "Child, 4. High fever, drooling, refusing to lie down.",
  limit: 900, transport: 360,
  bystanders: "Her father is terrified — she won't let anyone near her mouth and won't lie back.",
  units: [{at: 300, level: "emt", name: "BLS 9"}],
  dispatch: ["4-year-old female, sudden high fever, drooling, sitting rigidly upright, muffled voice.", "Conscious, alert, extremely anxious.", "Father reports she is not up to date on vaccinations."],
  update: ["She's getting more anxious and her breathing sounds worse than a few minutes ago."],
  impression: "Sitting bolt upright in a tripod position, chin thrust forward, drooling, refusing to lie down or open her mouth. Muffled 'hot potato' voice. Visibly frightened.",
  imps: ["UAWI", "RARF"],
  condition: "epiglottitis",
  patient: {age: 4, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: 'Father: "She was completely fine this morning. By this afternoon she had a huge fever, wouldn\'t eat or drink, and now she won\'t lie down, she keeps sitting forward like that and drooling — she won\'t even let me look in her mouth."', kind: "pt",
      evid: "Sudden onset (hours, not days) of high fever, drooling, refusal to lie flat, and a self-selected tripod/sniffing position is the classic — and genuinely dangerous — epiglottitis triad. This is a fast-moving airway emergency, not a routine febrile illness.", find: "OPQRST: sudden high fever, drooling, tripod positioning, muffled voice — onset over hours."}),
    sample: () => ({say: 'Father: "She\'s behind on her shots — we moved around a lot last year and missed some appointments. No allergies that we know of. She was completely well until today."', kind: "pt",
      evid: "Incomplete vaccination (specifically the Hib vaccine) is the single biggest risk factor for epiglottitis in this era — this history should raise, not lower, your concern.", find: "SAMPLE: incomplete vaccination history, no known allergies, previously well."}),
    // MEASURED, not scripted (see conditions.js epiglottitis:
    // pat.upperAirwayObstruction climbs 0.3->2.0, real crisis by ~min 10, no
    // field pharmacologic fix). Reads it live so scene-time delay shows real
    // worsening (queue item F7).
    lungs: (s) => {
      const uao = s.patient?.upperAirwayObstruction ?? 0.3;
      const suffix = uao > 1.0 ? " Every breath is a visible struggle now, and the muffled quality is worse than it was." : "";
      return {say: `You do NOT attempt to visualize her airway or lay her back — from across the room, breathing is audibly effortful with a soft, muffled quality, not a harsh bark.${suffix}`, kind: "crit",
        evid: "Deliberately NOT examining the airway directly is itself the correct action here — instrumenting or agitating a swollen epiglottis in the field is a well-documented way to precipitate complete obstruction. Assess from a distance, let her stay in the position SHE chose.", find: "Airway assessed from a distance only — muffled breath sounds, drooling, tripod position, NOT examined directly."};
    },
    skin: () => ({say: "Hot, flushed, visibly frightened and anxious — agitation itself is a bad sign here, not just discomfort.", find: "Skin hot, flushed; visibly anxious."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Progressive supraglottic swelling closed her airway — a true airway emergency that a field drug box has no way to fix directly, and every minute of scene time or agitation narrowed her margin further.";
    notes.push("The single most important action on this call is what you DO NOT do: no forced airway exam, no tongue depressor, no forcing her to lie back, no separating her from her father if that keeps her calmer. Agitating a child with a swollen epiglottis can precipitate complete obstruction in seconds.");
    notes.push("Let the child assume whatever position she chooses (tripod/sniffing) — she is unconsciously optimizing her own airway, and fighting that is actively harmful, not helpful.");
    notes.push("There is no field drug that reduces epiglottic swelling fast enough to matter here — the actual treatment is a controlled, often surgical airway at a hospital equipped for a difficult pediatric airway. The field job is recognition, avoiding agitation, gentle oxygen if she tolerates it without a fight, and the fastest safe transport to the right facility.");
    notes.push("Incomplete vaccination (the Hib vaccine specifically) is the key risk-factor history here — this disease has become rare where vaccination rates are high, which is itself worth recognizing as the reason it's still worth knowing.");
    return {died, cause, notes, correct: s.pi === "UAWI" || s.pi === "RARF", truth: "Acute epiglottitis — a true pediatric airway emergency, unvaccinated/under-vaccinated child"};},
},

cysticFibrosisExacerbation: {cat: "medical", id: "RESP-034", pronouns: "she", title: "Female, 24. Known cystic fibrosis, worse cough and breathing this week.",
  limit: 1000, transport: 480,
  bystanders: "Her roommate, who knows her CF routine well, called when her usual airway clearance stopped helping.",
  units: [],
  dispatch: ["24F, known cystic fibrosis, worsening cough/dyspnea over a week, not responding to her usual home routine.", "Conscious, alert, chronically ill-appearing."],
  update: [],
  impression: "Sitting forward, thin build, a deep wet productive cough every minute or so, visibly more short of breath than her roommate says is normal for her.",
  imps: ["RDOT", "FEVR"],
  condition: "cysticFibrosisExacerbation",
  patient: {age: 24, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I have CF — I know my baseline, and this isn\'t it. My airway clearance vest and my usual treatments aren\'t cutting it this week, I\'m coughing up more and thicker than usual, and I\'m more short of breath than I\'ve been in a long time."', kind: "pt",
      evid: "A patient with known CF who recognizes she is OFF her own baseline, unresponsive to her usual home airway-clearance routine, is describing a genuine acute pulmonary exacerbation — the actual reason a CF patient calls 911.", find: "OPQRST: known CF, ~1 week worsening cough/dyspnea, not responding to usual home routine."}),
    sample: () => ({say: '"CF, diagnosed at birth. I\'m on a whole list of chronic meds and I do airway clearance twice a day normally. No new allergies. This has happened before — usually means I need IV antibiotics, which I can\'t get from you."', kind: "pt",
      evid: "Correctly identifying that the definitive treatment (IV antibiotics for the underlying infection) is a hospital-level intervention, not a field one, is exactly the right framing — the field job is supportive care and transport, not chasing a cure.", find: "SAMPLE: known CF since birth, multiple chronic medications, prior similar exacerbations requiring IV antibiotics."}),
    lungs: () => ({say: "Coarse, wet-sounding throughout, thick productive cough with each episode, mild wheeze layered on top.", kind: "obs",
      evid: "Both mucus plugging (coarse, wet sounds) AND bronchospasm (wheeze) are real, simultaneous features of a CF exacerbation — this is not purely one mechanism.", find: "Lungs: coarse/wet bilaterally, mild wheeze, thick productive cough."}),
    skin: () => ({say: "Warm, thin build, mild digital clubbing visible on her fingers.", kind: "obs", evid: "Digital clubbing is a real, chronic sign of long-standing hypoxemic lung disease — consistent with her known CF, not a new finding tonight.", find: "Skin warm; digital clubbing (chronic finding)."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const oxygenated = s.done.o2nc || s.done.o2nrb || s.done.bvm;
    const bronchodilator = s.given.albuterol;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Thick, poorly-cleared secretions and bronchospasm together outpaced what supportive field care could manage — the definitive treatment (IV antibiotics, inpatient airway clearance) was never reached in time.";
    if (bronchodilator) notes.push("A bronchodilator was given — appropriate here, unlike croup/epiglottitis: CF airway disease genuinely does have a real bronchospastic component alongside the mucus plugging.");
    if (oxygenated) notes.push("Supplemental oxygen was given for a chronically hypoxemic patient acutely worse than her own baseline — appropriate.");
    notes.push("Trust the patient's own sense of her baseline — she knows her disease better than a single field assessment can. 'Worse than usual and not responding to my normal routine' from a chronic CF patient is a genuine red flag, not just a complaint to reassure away.");
    notes.push("There is no field cure for a CF exacerbation — the definitive treatment (IV antibiotics, inpatient airway clearance) is hospital-level. Supportive oxygen, bronchodilation for the reversible component, and transport are the actual field skill.");
    return {died, cause, notes, correct: s.pi === "RDOT" || s.pi === "FEVR", truth: "Acute pulmonary exacerbation of cystic fibrosis"};},
},

tuberculosisHemoptysis: {cat: "medical", id: "RESP-035", pronouns: "he", title: "Male, 54. Coughing up blood, known TB history.",
  limit: 1100, transport: 480,
  bystanders: "His neighbor called after seeing blood in a tissue and hearing him coughing for several minutes straight.",
  units: [],
  dispatch: ["54M, coughing up blood, chronic cough and weight loss reported over months.", "Conscious, alert, appears chronically ill.", "History of incarceration and homelessness per neighbor."],
  update: ["He coughs up another mouthful of blood-streaked sputum in front of you."],
  impression: "Thin, chronically ill-appearing, coughing frequently with blood-streaked sputum. Alert, cooperative, night-sweats visibly soaking his shirt despite the cool room.",
  imps: ["RDOT", "SEPS"],
  condition: "tuberculosisHemoptysis",
  patient: {age: 54, gender: "male"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I\'ve had this cough for months, and I\'ve been losing weight without trying. Tonight there was blood in it for the first time — a good amount, not just streaks."', kind: "pt",
      evid: "A chronic (months-long) cough with weight loss, night sweats, and NEW hemoptysis is the classic presentation of active pulmonary tuberculosis with vascular erosion — a genuine, sometimes life-threatening complication, not incidental.", find: "OPQRST: months of chronic cough and weight loss, new hemoptysis tonight."}),
    sample: () => ({say: '"I was diagnosed with TB a while back but never finished the treatment — I was in and out of shelters, hard to keep up with. No allergies, no other regular medications."', kind: "pt",
      evid: "Known TB with INCOMPLETE treatment, plus a history of homelessness/incarceration (both real risk factors for TB transmission and reactivation), strongly supports active, potentially infectious disease right now.", find: "SAMPLE: known TB diagnosis, incomplete treatment, homelessness/incarceration history."}),
    lungs: () => ({say: "Coarse crackles at the right apex, decreased breath sounds in the same area.", kind: "obs",
      evid: "Apical (upper-lobe) findings are the classic location for reactivation pulmonary TB — different from the basilar pattern most pneumonias and effusions produce.", find: "Lungs: coarse crackles/decreased sounds at the right apex."}),
    skin: () => ({say: "Thin, pale, drenched in sweat despite a cool environment.", kind: "obs", evid: "Night sweats and cachexia are classic constitutional TB symptoms, consistent with active, ongoing disease.", find: "Skin pale, cachectic, diaphoretic (night sweats)."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const donnedPPE = !!s.ppe;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Ongoing pulmonary hemorrhage from eroded vasculature was never controlled — there is no field procedure that stops bleeding inside the lung itself, and blood loss and airway compromise progressed together.";
    if (donnedPPE) notes.push("PPE was donned before contact — good practice on any call, and especially this one: known or suspected active TB with a productive cough is an AIRBORNE precaution. A real N95 respirator (not a surgical mask) is what's actually indicated for TB specifically, beyond the standard gloves/eye protection this box models.");
    else notes.push("No PPE was noted before contact with a patient coughing blood and reporting an incomplete TB treatment history. Known or suspected active TB with a productive cough is an AIRBORNE precaution — a real N95 respirator for the crew, beyond standard gloves/eye protection, is genuinely indicated here.");
    notes.push("There is no field procedure that stops bleeding happening inside the lung itself — unlike an external wound, this can't be packed or tourniqueted. The field job is airway management (positioning to protect the unaffected lung, suction as needed), oxygen, and rapid transport to a facility that can manage massive hemoptysis definitively.");
    notes.push("A history of incomplete TB treatment plus homelessness/incarceration are real, documented risk factors for both TB transmission and drug-resistant disease — worth flagging in the handoff report, not just noted in passing.");
    return {died, cause, notes, correct: s.pi === "RDOT" || s.pi === "SEPS", truth: "Active pulmonary tuberculosis with hemoptysis from vascular erosion, incomplete prior treatment"};},
},

upperRespiratoryInfection: {cat: "medical", id: "MISC-041", pronouns: "she", title: "Female, 29. Cold symptoms, requested a check-up.",
  limit: 700, transport: 420,
  bystanders: "She called herself, mostly for reassurance after a coworker suggested it.",
  units: [],
  dispatch: ["29F, cold symptoms for 3 days, requesting evaluation.", "Conscious, alert, ambulatory, talking normally on scene arrival."],
  update: [],
  impression: "Sitting comfortably, occasional sniffle and mild cough, talking easily, no distress of any kind.",
  imps: ["FEVR", "RDOT"],
  patient: {age: 29, hr: 78, sbp: 118, rr: 16, temp: 37.6},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: '"I\'ve just had a cold the last few days — stuffy nose, mild cough, felt a little run down. A coworker thought I should get checked, but honestly I feel basically fine, just annoyed by it."', kind: "pt",
      evid: "Mild, gradually improving cold symptoms with no red flags (no significant fever, no dyspnea, no chest pain) is a genuinely benign upper respiratory infection.", find: "OPQRST: 3 days of mild cold symptoms, no red flags, patient feels well overall."}),
    sample: () => ({say: '"No allergies, no medications besides an occasional decongestant, no other health problems. I really didn\'t think I needed an ambulance, for what it\'s worth."', kind: "pt", evid: "No underlying disease and the patient's own accurate self-assessment both support a low-acuity call.", find: "SAMPLE: NKDA, occasional OTC decongestant only, no other history, patient self-assesses as well."}),
    lungs: () => ({say: "Clear bilaterally, no wheeze, no crackles, normal work of breathing.", kind: "obs", evid: "A completely clear chest exam rules out pneumonia, bronchitis, or any lower-respiratory process — this is confined to the upper airway.", find: "Lungs: clear bilaterally, no adventitious sounds."}),
    skin: () => ({say: "Normal color, warm, dry, no distress.", find: "Skin normal, warm, dry."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Not every dispatch is a crisis — a complete, efficient exam that correctly identifies a benign self-limited illness and avoids over-treating it is itself a real EMS skill, not a non-event.",
      "There is no field treatment needed here beyond reassurance and appropriate guidance — the actual job is a clean exam that RULES OUT the more serious mimics (pneumonia, early sepsis, cardiac causes of fatigue) rather than assuming the dispatch complaint at face value.",
      "Respecting a patient's own accurate self-assessment, once a real exam backs it up, is part of good judgment — not every call needs an aggressive intervention to be handled well."],
    correct: true, truth: "Uncomplicated viral upper respiratory infection (common cold) — benign, self-limited"}),
},

// ===== NEURO/ENDOCRINE BATCH (queue items 7, 21, 23, 24, 27) =====
// Comorbidity conditions built this batch (hypertension, hyperlipidemia,
// diabeticVasculopathy, epilepsy, dementia, cushingSyndrome, typeIDiabetes)
// deliberately have NO standalone scenario here, matching diabetesT2's own
// precedent — they exist to COMPOSE onto a presenting condition
// (["heatStroke","epilepsy"], ["ami","hypertension"], etc.), not to stand
// alone.

activeSeizureGTC: {cat: "medical", id: "NEUR-042", pronouns: "he", title: "Male, 34. Actively seizing, per caller.",
  limit: 900, transport: 420,
  bystanders: "His brother is timing the seizure on his phone.",
  units: [{at: 300, level: "emt", name: "BLS 6"}],
  dispatch: ["34M, actively seizing.", "No known seizure history per brother."],
  update: ["Brother: \"It's been going almost three minutes now.\""],
  impression: "On the floor, rhythmic tonic-clonic movement of all four extremities, cyanotic lips, teeth clenched.",
  imps: ["SEIZ", "DYSR"],
  condition: "activeSeizureGTC",
  patient: {age: 34, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Brother: \"He just started shaking, no warning, been going a few minutes.\"", kind: "pt",
      evid: "Witnessed sudden-onset generalized convulsive activity with no prior history.", find: "OPQRST: witnessed onset, ongoing, no seizure history."}),
    sample: () => ({say: "Brother: \"No medications, no medical history I know of, no drugs.\"", kind: "pt", find: "SAMPLE: no known history, no medications."}),
    airwayLook: () => ({say: "Clenched jaw, cyanotic, secretions pooling. Positioning and suction are the priority, not a bite block.", kind: "crit",
      evid: "Active convulsive seizure compromises airway protection directly — positioning/suction, not forcing anything into the mouth.", find: "Airway compromised by ongoing convulsive activity; cyanosis present."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const benzoDoses = s.doses.filter(d => d.id === "midazolam").length; // a previous item in the queue: only midazolam exists in this formulary
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Ongoing convulsive activity was never terminated, with progressive hypoxia and rising metabolic demand the airway could not keep up with.";
    if (benzoDoses >= 2) notes.push("A repeat benzodiazepine dose was given after the first didn't fully terminate the seizure — the correct move. A single dose does not reliably stop every seizure, and reassessing rather than waiting is what separates this from status epilepticus.");
    else if (benzoDoses === 1) notes.push("A benzodiazepine was given — the correct first-line field treatment. If it doesn't fully terminate the seizure within a few minutes, that's a real, common outcome (not every seizure stops on one dose) — reassess and consider a repeat dose rather than assuming it failed to work at all.");
    else notes.push("No benzodiazepine was given. A seizure running several minutes with no sign of stopping needs one — waiting for it to resolve on its own risks status epilepticus.");
    notes.push("Airway management here means positioning (recovery position once tonic-clonic activity allows) and suction, not forcing anything between the teeth.");
    return {died, cause, notes, correct: s.pi === "SEIZ", truth: "Active generalized tonic-clonic seizure, cause undetermined"};},
},

statusEpilepticus: {cat: "medical", id: "NEUR-043", pronouns: "she", title: "Female, 41. Seizing for over ten minutes, per caller.",
  limit: 1100, transport: 480,
  bystanders: "Her husband called 911 and has been on the line the whole time, increasingly panicked.",
  units: [{at: 360, level: "paramedic", name: "Medic 4"}],
  dispatch: ["41F, seizing continuously per husband, over ten minutes.", "Known epileptic, ran out of medication per husband."],
  update: ["Husband: \"She just keeps going, it's not stopping like it usually does.\""],
  impression: "Ongoing generalized convulsive activity, cyanotic, hot to the touch, no interval of recovery between jerks.",
  imps: ["SEIZ", "DYSR"],
  condition: "statusEpilepticus",
  patient: {age: 41, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Husband: \"She's epileptic, this has never gone this long before. We ran out of her medication last week.\"", kind: "pt",
      evid: "A known epileptic with a documented medication lapse, now seizing continuously past the 5-minute status-epilepticus threshold, is the specific, teachable setup.", find: "OPQRST: known epilepsy, medication non-adherence, continuous seizure activity >10 min."}),
    sample: () => ({say: "Husband: \"Levetiracetam, but we couldn't refill it. No allergies.\"", kind: "pt", find: "SAMPLE: levetiracetam (lapsed), no allergies."}),
    skin: () => ({say: "Hot, flushed, diaphoretic — she's been generating heat from continuous muscle activity for a while now.", kind: "crit",
      evid: "Real hyperthermia from sustained convulsive muscular activity, not incidental.", find: "Skin hot, flushed, diaphoretic; temperature elevated."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const doses = s.doses.filter(d => d.id === "midazolam").length; // a previous item in the queue: only midazolam exists in this formulary
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "True status epilepticus, refractory to the treatment given, with progressive hyperthermia and hypoxia the seizure itself never stopped causing.";
    if (doses >= 2) notes.push("Repeat benzodiazepine dosing was given — appropriate here. Status epilepticus is frequently refractory to a single dose, unlike an ordinary brief seizure.");
    else if (doses === 1) notes.push("One dose of benzodiazepine was given without clear termination. True status epilepticus often needs repeat dosing or a second-line agent — reassess and consider another dose rather than waiting.");
    else notes.push("No benzodiazepine was given for a patient seizing continuously past ten minutes — this is the definition of a true emergency needing immediate treatment, not a seizure to just observe.");
    notes.push("Medication non-adherence in a known epileptic is a common, specific, identifiable trigger — worth flagging clearly at handoff.");
    return {died, cause, notes, correct: s.pi === "SEIZ", truth: "Status epilepticus from anticonvulsant non-adherence"};},
},

febrileSeizureToddler: {cat: "medical", id: "PEDS-011", pronouns: "he", title: "Male, 2. Seizing, hot to the touch, per mother.",
  limit: 900, transport: 420,
  bystanders: "His mother is holding him, terrified, saying he's never done this before.",
  units: [{at: 300, level: "emt", name: "BLS 6"}],
  dispatch: ["2M, seizure activity, febrile per mother.", "Had a cold the last two days."],
  update: [],
  impression: "A toddler on the living room floor, jerking movements now largely stopped, hot and flushed, mother visibly frightened.",
  imps: ["SEIZ", "FEVR"],
  condition: "febrileSeizure",
  patient: {age: 2, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Mother: \"He's had a cold for two days, felt really hot this morning, and then he just started shaking. It lasted maybe a minute.\"", kind: "pt",
      evid: "A brief generalized seizure in a young child with a documented preceding fever is the classic febrile seizure pattern.", find: "OPQRST: brief seizure, preceding fever, upper respiratory illness x2 days."}),
    sample: () => ({say: "Mother: \"No medications, no seizures ever before, no other health problems. He's never been sick like this.\"", kind: "pt", find: "SAMPLE: no history, first seizure, previously healthy."}),
    skin: () => ({say: "Hot, flushed. Otherwise pink, well-perfused, moving all extremities normally now.", kind: "obs", find: "Skin hot/flushed; otherwise well-perfused, post-ictal period brief."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    // NOTE (physiology queue, see CLAUDE.md section 6): a real, pre-existing
    // engine instability in pediatric respiratory fatigue feedback means this
    // scenario can rarely deteriorate on its own even with correct
    // management — stated honestly here rather than a cause line that
    // wrongly implies mismanagement in every case.
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "This deteriorated well beyond what a simple febrile seizure should — if nothing was missed in the management, this reflects a known, filed physiology-engine issue rather than a real clinical teaching point.";
    notes.push("A brief seizure with a clear preceding fever, in a toddler in the classic 6-month-to-5-year age range, is a simple febrile seizure — generally benign, though it is still a first seizure and still deserves an evaluation to rule out meningitis or another cause of the fever.");
    notes.push("The actual field treatment is fever control (an antipyretic, undressing/cooling as tolerated) and reassurance, not an aggressive anticonvulsant response — this is a fundamentally different risk profile from status epilepticus.");
    return {died, cause, notes, correct: s.pi === "SEIZ" || s.pi === "FEVR", truth: "Simple febrile seizure"};},
},

simplePartialSeizure: {cat: "medical", id: "NEUR-044", pronouns: "she", title: "Female, 45. Rhythmic jerking of one hand, fully alert.",
  limit: 700, transport: 360,
  bystanders: "A coworker is with her, more curious than alarmed since she's talking normally.",
  units: [],
  dispatch: ["45F, one hand jerking uncontrollably.", "Alert and talking per coworker."],
  update: [],
  impression: "Sitting calmly, right hand rhythmically twitching, otherwise completely normal and conversational.",
  imps: ["SEIZ", "ALOC"],
  condition: "simplePartialSeizure",
  patient: {age: 45, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"My hand just started doing this on its own about ten minutes ago. I can feel and see everything perfectly, it's just... not listening to me.\"", kind: "pt",
      evid: "Focal rhythmic motor activity with FULLY PRESERVED awareness is the defining feature of a simple partial seizure — the patient can narrate the whole event.", find: "OPQRST: focal right-hand jerking x10 min, patient fully alert and able to describe it throughout."}),
    sample: () => ({say: "\"No seizure history, no medications. I did have a bad concussion a couple years ago, if that matters.\"", kind: "pt",
      evid: "A prior head injury is a real, documented risk factor for a subsequent focal seizure focus.", find: "SAMPLE: no meds, remote head injury."}),
    loc: () => ({say: "Fully alert, oriented, able to hold a normal conversation throughout the exam.", kind: "obs", find: "LOC: alert and oriented x4, unimpaired."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Fully preserved awareness during focal motor activity is the key distinction from a complex partial seizure or a generalized one — this patient can tell you exactly what's happening as it happens.",
      "There's no field procedure that stops this, and it usually resolves on its own — the job is a calm, complete neuro exam, protecting the affected limb from injury, and transport for workup of the underlying cause."],
    correct: true, truth: "Simple partial (focal) seizure, awareness preserved"}),
},

complexPartialSeizure: {cat: "medical", id: "NEUR-045", pronouns: "he", title: "Male, 29. Wandering, picking at his shirt, not answering questions.",
  limit: 800, transport: 400,
  bystanders: "A store employee called after he wandered into the stockroom, unresponsive to being spoken to.",
  units: [],
  dispatch: ["29M, altered behavior, not responding appropriately.", "Wandering, repetitive movements per caller."],
  update: [],
  impression: "Standing near a shelf, repeatedly picking at his shirt buttons, staring blankly, not answering when spoken to.",
  imps: ["ALOC", "SEIZ"],
  condition: "complexPartialSeizure",
  patient: {age: 29, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Employee: \"He just wandered in here a few minutes ago, kept fumbling with his shirt, didn't answer when I talked to him.\"", kind: "pt",
      evid: "Automatisms (repetitive, purposeless movements like picking at clothing) plus impaired responsiveness without a full convulsion is the classic complex partial seizure picture.", find: "OPQRST: automatisms, unresponsive to questions, no convulsive movement, duration several minutes."}),
    sample: () => ({say: "No ID or bystander history available — he cannot answer questions right now.", kind: "pt", find: "SAMPLE: unobtainable, patient unable to respond."}),
    loc: () => ({say: "Not following commands, not answering, but moving all extremities and maintaining his own airway.", kind: "obs",
      evid: "Impaired awareness without full convulsive activity or airway compromise fits complex partial seizure rather than a generalized event or a purely medical ALOC.", find: "LOC: unresponsive to voice, no convulsive activity, airway intact."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Automatisms plus impaired awareness without a full-body convulsion is a real, distinct seizure presentation, easily mistaken for intoxication or a primary psychiatric event — recognizing the pattern is the actual skill here.",
      "There is no field-reversible cause to chase (unlike hypoglycemia or opioid overdose) — the job is protecting the patient during the episode and transporting for a full neuro workup once it resolves."],
    correct: true, truth: "Complex partial seizure with automatisms"}),
},

absenceSeizureChild: {cat: "medical", id: "PEDS-012", pronouns: "she", title: "Female, 8. Teacher reports repeated brief 'zoning out' episodes.",
  limit: 600, transport: 300,
  bystanders: "Her teacher walked her to the school nurse after noticing it happen twice more this morning.",
  units: [],
  dispatch: ["8F, brief episodes of unresponsiveness at school per teacher.", "No injury, fully recovered each time."],
  update: [],
  impression: "Sitting quietly, alert, a little embarrassed about the attention. Completely normal on exam right now.",
  imps: ["SEIZ", "ALOC"],
  condition: "absenceSeizure",
  patient: {age: 8, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Teacher: \"She just goes blank for a few seconds, staring, doesn't answer me, and then she's right back to normal like nothing happened. It's happened a few times this week.\"", kind: "pt",
      evid: "Brief, recurrent staring spells with abrupt onset and offset, no confusion afterward, is the classic absence seizure pattern — easily mistaken for daydreaming.", find: "OPQRST: recurrent brief staring episodes, seconds long, no post-episode confusion."}),
    sample: () => ({say: "Teacher: \"No known medical problems that I'm aware of — you'd have to ask her parents.\"", kind: "pt", find: "SAMPLE: unknown, parents not present."}),
    loc: () => ({say: "Fully alert and oriented right now, no confusion, no fatigue.", kind: "obs",
      evid: "A completely normal exam between episodes, with no postictal state, is consistent with absence seizures rather than a convulsive seizure disorder.", find: "LOC: alert, oriented, no postictal state."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Brief, recurrent lapses in awareness with instant recovery and no confusion afterward is easy to dismiss as inattention — recognizing it as a possible seizure disorder, not a discipline problem, is the actual point of this call.",
      "There is no acute field treatment needed. The job is a good history from bystanders (frequency, duration, triggers) and a referral for outpatient neurology evaluation."],
    correct: true, truth: "Absence seizures (new-onset), recurrent"}),
},

migraineHeadache: {cat: "medical", id: "NEUR-046", pronouns: "she", title: "Female, 27. Severe one-sided headache with nausea.",
  limit: 700, transport: 360,
  bystanders: "Her roommate turned off the lights before you arrived, since light was making it worse.",
  units: [],
  dispatch: ["27F, severe headache, nausea.", "Conscious, alert, photophobic per roommate."],
  update: [],
  impression: "Lying on the couch in a dark room, one arm over her eyes, speaking quietly, visibly nauseated.",
  imps: ["PMGT", "ALOC"],
  condition: "migraine",
  patient: {age: 27, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Throbbing, right side, started gradually a couple hours ago. Light and sound make it so much worse. I get these sometimes, but this one's bad.\"", kind: "pt",
      evid: "Gradual-onset unilateral throbbing headache with photophobia/phonophobia and a personal history of similar episodes is the classic migraine pattern — not the sudden, 'worst of my life' onset that would suggest a bleed.", find: "OPQRST: gradual unilateral throbbing headache, photophobia, known history of migraines."}),
    sample: () => ({say: "\"Sumatriptan when it's really bad, but I hadn't taken any yet. No other health problems.\"", kind: "pt", find: "SAMPLE: known migraine history, has an abortive medication but hadn't taken it."}),
    loc: () => ({say: "Alert and oriented, no focal weakness, no neck stiffness, no fever.", kind: "obs",
      evid: "A normal focused neuro exam and absence of fever/neck stiffness argue against a more dangerous cause of headache.", find: "LOC: alert, oriented, no focal deficit, no meningismus, afebrile."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Gradual onset, a known migraine history, and a completely normal focused neuro exam together support a benign primary headache disorder — the job is still to actively rule out red flags (sudden 'thunderclap' onset, fever, neck stiffness, focal deficit) rather than assume it.",
      "A dark, quiet environment and antiemetic/analgesic support within scope is appropriate field care; there's no field abortive-migraine drug in most BLS/ALS boxes."],
    correct: true, truth: "Migraine headache with photophobia, known history"}),
},

clusterHeadacheAttack: {cat: "medical", id: "NEUR-047", pronouns: "he", title: "Male, 38. Sudden severe pain around one eye, tearing.",
  limit: 600, transport: 360,
  bystanders: "His wife says he's had these before but never called 911 for one.",
  units: [],
  dispatch: ["38M, severe eye/facial pain, sudden onset.", "Conscious, alert, pacing per wife."],
  update: [],
  impression: "Pacing the room, unable to sit still, hand pressed over his right eye, which is red and tearing.",
  imps: ["PMGT", "CPNC"],
  condition: "clusterHeadache",
  patient: {age: 38, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's like a hot poker behind my right eye, came on in minutes, worst pain there is. I can't sit still with it — walking around actually helps a little.\"", kind: "pt",
      evid: "Excruciating unilateral periorbital pain with restlessness (pacing, unable to stay still) — the opposite behavior of a migraine patient, who wants to lie still in the dark — is characteristic of cluster headache.", find: "OPQRST: sudden severe unilateral periorbital pain, restlessness, known prior episodes."}),
    sample: () => ({say: "Wife: \"He gets these in clusters, a few weeks at a time, then nothing for months. This is worse than usual though.\"", kind: "pt", find: "SAMPLE: known cluster headache pattern, episodic."}),
    eyes: () => ({say: "Right eye red and tearing, mild ptosis on that side. Left eye normal.", kind: "obs",
      evid: "Ipsilateral autonomic features — tearing, redness, drooping eyelid — accompanying the pain are the diagnostic hallmark of cluster headache (trigeminal-autonomic activation).", find: "Right eye: conjunctival injection, tearing, mild ptosis. Left eye normal."}),
  },
  resolve: (s) => {const notes = []; const gaveO2 = s.done.o2nrb || s.given.o2;
    notes.push("High-flow oxygen is a real, documented abortive treatment for an acute cluster headache attack — worth using if available, unlike most other headache types." + (gaveO2 ? " It was given here." : " It was not given here — a real, low-risk option that was available."));
    notes.push("The ipsilateral autonomic signs (tearing, redness, ptosis) alongside the pain are what confirm this as cluster headache rather than a more generic severe headache — a real, teachable exam finding.");
    return {died: false, cause: "", notes, correct: s.pi === "PMGT" || s.pi === "CPNC", truth: "Cluster headache, acute attack"};},
},

tensionHeadacheCall: {cat: "medical", id: "NEUR-048", pronouns: "she", title: "Female, 34. Mild band-like headache, requested evaluation.",
  limit: 500, transport: 300,
  bystanders: "She called herself after a stressful work week left her with a persistent headache.",
  units: [],
  dispatch: ["34F, headache, mild.", "Conscious, alert, ambulatory."],
  update: [],
  impression: "Sitting at her kitchen table, rubbing her temples, otherwise unremarkable and conversational.",
  imps: ["PMGT"],
  condition: "tensionHeadache",
  patient: {age: 34, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's a dull, tight band around my whole head, not throbbing, not one-sided. Stressful week, haven't been sleeping great. No nausea, light doesn't bother me.\"", kind: "pt",
      evid: "Bilateral, band-like, non-throbbing pain without photophobia or nausea, in the setting of stress and poor sleep, is the classic tension headache pattern — the mildest and most common headache type.", find: "OPQRST: bilateral band-like headache, no photophobia/nausea, stress-associated."}),
    sample: () => ({say: "\"No medications, no allergies, no other health problems. I probably didn't need to call, honestly.\"", kind: "pt", find: "SAMPLE: no history, no medications, patient self-assesses as mild."}),
    loc: () => ({say: "Alert, oriented, no focal deficit, no fever, no neck stiffness.", kind: "obs", find: "LOC: normal focused neuro exam, afebrile."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A complete exam that rules out red flags is still the job even on the mildest-looking headache call — the reassurance you give afterward is only worth something because you actually checked.",
      "Tension headache is the most benign entity in this whole headache category — supportive care and simple analgesia (within scope) is appropriate, with no aggressive workup needed."],
    correct: true, truth: "Tension-type headache, stress-associated"}),
},

trigeminalNeuralgiaAttack: {cat: "medical", id: "NEUR-049", pronouns: "he", title: "Male, 62. Sudden electric-shock facial pain, brief episodes.",
  limit: 600, transport: 360,
  bystanders: "His daughter called after watching him wince repeatedly while eating.",
  units: [],
  dispatch: ["62M, facial pain, brief severe episodes per daughter.", "Conscious, alert."],
  update: [],
  impression: "Sitting stiffly, occasionally flinching and gasping, then relaxing completely seconds later, otherwise unremarkable.",
  imps: ["PMGT", "CPNC"],
  condition: "trigeminalNeuralgia",
  patient: {age: 62, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's like being stabbed with a live wire, right side of my face, comes out of nowhere and lasts a couple seconds, then it's completely gone until it happens again. Chewing sets it off.\"", kind: "pt",
      evid: "Brief, severe, electric-shock-like unilateral facial pain triggered by a specific stimulus (chewing, touch), with complete pain-free intervals between attacks, is the specific, diagnostic pattern of trigeminal neuralgia.", find: "OPQRST: brief severe electric-shock facial pain, seconds-long, chewing-triggered, pain-free between episodes."}),
    sample: () => ({say: "\"No medications for it yet, haven't seen a doctor about this. No other health problems.\"", kind: "pt", find: "SAMPLE: no medications, no prior workup."}),
    loc: () => ({say: "Alert, oriented, no facial weakness or droop — the pain is the only finding.", kind: "obs",
      evid: "A completely normal motor facial exam (no weakness) alongside the paroxysmal pain distinguishes this from Bell's palsy or a stroke.", find: "LOC/CN: normal facial strength bilaterally, no other focal deficit."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["The paroxysmal, trigger-specific, electric-shock quality with completely pain-free intervals is what separates trigeminal neuralgia from every other facial/head pain call — recognizing that pattern is the point.",
      "There is no field-abortive treatment for this; the real treatment (anticonvulsant medications, and eventually possible surgical options) is outpatient. The field job is analgesia within scope and appropriate referral."],
    correct: true, truth: "Trigeminal neuralgia"}),
},

peripheralVertigoAttack: {cat: "medical", id: "NEUR-050", pronouns: "she", title: "Female, 52. Sudden room-spinning, vomiting.",
  limit: 700, transport: 360,
  bystanders: "Her husband found her unable to stand without the room spinning.",
  units: [],
  dispatch: ["52F, sudden dizziness, vomiting.", "Conscious, alert, lying still per husband."],
  update: [],
  impression: "Lying very still on the bed, eyes closed, says any movement makes the spinning and nausea much worse.",
  imps: ["ALOC", "SHOK"],
  condition: "peripheralVertigo",
  patient: {age: 52, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"The room just started spinning out of nowhere, I've thrown up twice. It's SO much worse if I move my head at all. No ringing, no hearing change though.\"", kind: "pt",
      evid: "Severe, movement-provoked spinning vertigo with nausea/vomiting and NO additional neuro symptoms is the classic peripheral (vestibular) pattern.", find: "OPQRST: sudden severe positional vertigo, nausea/vomiting, no hearing change, no other neuro complaint."}),
    sample: () => ({say: "\"No medications, no history of stroke or heart problems. Had a cold last week.\"", kind: "pt", find: "SAMPLE: no cardiovascular risk factors, recent viral illness (vestibular neuritis-consistent)."}),
    loc: () => ({say: "Alert, oriented, speech clear, no facial droop, equal grip strength both hands, can walk with assistance though unsteady.", kind: "obs",
      evid: "A completely NORMAL focused neuro exam apart from the vertigo itself — no dysarthria, no facial droop, no limb weakness — is what makes this peripheral rather than central.", find: "Neuro exam otherwise normal: no dysarthria, no facial droop, no focal weakness."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A completely normal neuro exam apart from the vertigo itself — no slurred speech, no facial droop, no limb weakness — is the actual finding that makes this a benign peripheral cause rather than a posterior circulation stroke.",
      "Supportive care (antiemetic within scope, position of comfort) and transport for further evaluation is appropriate; there's no field cure for vestibular neuritis/BPPV."],
    correct: true, truth: "Peripheral vertigo (vestibular neuritis), benign"}),
},

centralVertigoStroke: {cat: "medical", id: "NEUR-051", pronouns: "he", title: "Male, 67. Sudden dizziness, slurred speech noted by wife.",
  limit: 900, transport: 420,
  bystanders: "His wife insisted on calling when she noticed he sounded 'off' on top of the dizziness.",
  units: [{at: 360, level: "paramedic", name: "Medic 7"}],
  dispatch: ["67M, sudden dizziness.", "Wife reports his speech 'sounds different.'"],
  update: [],
  impression: "Lying down, reports the room is spinning — but his speech is subtly slurred and his wife says his walking looked 'off' before he lay down.",
  imps: ["STRK", "ALOC"],
  condition: "centralVertigo",
  patient: {age: 67, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Room's spinning, came on all at once. My words feel funny too, I don't know why.\"", kind: "pt",
      evid: "Sudden vertigo PLUS a second neuro symptom (dysarthria) together is the red flag — vertigo alone is usually benign, vertigo WITH an additional focal finding needs to be treated as a possible stroke until proven otherwise.", find: "OPQRST: sudden vertigo with subjectively slurred speech, wife noted gait unsteadiness beforehand."}),
    sample: () => ({say: "Wife: \"High blood pressure, a heart attack five years ago, on blood thinners.\"", kind: "pt",
      evid: "Significant cardiovascular risk factors, including anticoagulation, raise real concern for a posterior circulation (cerebellar/brainstem) stroke.", find: "SAMPLE: hypertension, prior MI, anticoagulant use."}),
    loc: () => ({say: "Mildly dysarthric speech, and his left hand grip is subtly weaker than his right.", kind: "crit",
      evid: "A subtle, ADDITIONAL focal finding (dysarthria plus mild asymmetric weakness) accompanying vertigo — not just the vertigo alone — is exactly the HINTS-exam-style red flag distinguishing a dangerous central cause from a benign peripheral one.", find: "Neuro exam: mild dysarthria, subtle left-hand grip weakness — additional findings beyond the vertigo itself."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A posterior circulation stroke presenting as vertigo was not recognized as a stroke in time for the transport decision to matter.";
    notes.push("Vertigo WITH an additional focal finding — however subtle (mild slurred speech, slight weakness) — is the pattern that should trigger a stroke workup, not a reassuring 'probably just vertigo' conclusion.");
    notes.push("This patient's real risk factors (anticoagulation, prior cardiac event, hypertension) raise the stakes further — time-critical transport to a stroke-capable facility is the correct move, not supportive care in place.");
    return {died, cause, notes, correct: s.pi === "STRK", truth: "Posterior circulation (cerebellar) ischemic stroke presenting as vertigo"};},
},

guillainBarreProgressive: {cat: "medical", id: "NEUR-052", pronouns: "she", title: "Female, 36. Progressive weakness starting in the feet.",
  limit: 1200, transport: 480,
  bystanders: "Her roommate has watched the weakness climb from her feet to her hands over two days.",
  units: [{at: 420, level: "paramedic", name: "Medic 9"}],
  dispatch: ["36F, progressive weakness, ascending per roommate.", "Started in feet two days ago, now affecting hands."],
  update: ["Roommate: \"She says it's getting harder to take a deep breath.\""],
  impression: "Sitting upright, visibly working a little harder to breathe, reports numbness and weakness climbing up both legs and now into her hands.",
  imps: ["RDOT", "ALOC"],
  condition: "guillainBarre",
  patient: {age: 36, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It started as tingling in my feet two days ago, then real weakness, and now it's in my hands too. I had a bad stomach bug about two weeks before this started.\"", kind: "pt",
      evid: "Progressive, ASCENDING, symmetric weakness over days, with a preceding gastrointestinal illness (a classic Campylobacter-associated trigger), is the specific pattern of Guillain-Barre syndrome.", find: "OPQRST: symmetric ascending weakness over 2 days, preceded by a GI illness ~2 weeks prior."}),
    sample: () => ({say: "\"No medications, no prior neurologic problems. This has never happened before.\"", kind: "pt", find: "SAMPLE: no history, first episode."}),
    lungs: () => ({say: "Shallow breaths, weaker than they should be for her effort. Ask her to take a deep breath and count — she can't get past 15.", kind: "crit",
      evid: "A falling single-breath count is a real, simple bedside proxy for declining respiratory muscle strength — the actual danger in GBS, not the limb weakness itself.", find: "Respiratory: shallow, reduced single-breath count, real early respiratory muscle involvement."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Progressive neuromuscular respiratory failure was not recognized and supported in time.";
    notes.push("The real danger in Guillain-Barre is not the limb weakness — it's the SAME weakness reaching the respiratory muscles. Trending respiratory effort (not just the limb exam) is what should drive the urgency here.");
    notes.push("There is no field-reversible treatment (IVIG/plasmapheresis are hospital-level) — the job is recognizing the trend early and being ready to support ventilation before it fails outright, plus rapid transport.");
    return {died, cause, notes, correct: s.pi === "RDOT" || s.pi === "ALOC", truth: "Guillain-Barre syndrome with early respiratory muscle involvement"};},
},

myastheniaGravisCrisisCall: {cat: "medical", id: "NEUR-053", pronouns: "he", title: "Male, 58. Known myasthenia gravis, worsening weakness and drooping eyelids.",
  limit: 1100, transport: 480,
  bystanders: "His wife says he's had a fever the last two days and today his weakness is much worse than usual.",
  units: [{at: 400, level: "paramedic", name: "Medic 8"}],
  dispatch: ["58M, known myasthenia gravis, acute worsening weakness.", "Fever x2 days per wife."],
  update: ["Wife: \"His voice is getting weaker too, he's slurring more.\""],
  impression: "Sitting slumped, both eyelids drooping, visibly struggling to hold his head up, voice notably weak and nasal-sounding.",
  imps: ["RDOT", "ALOC"],
  condition: "myastheniaGravisCrisis",
  patient: {age: 58, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I have myasthenia gravis, usually managed fine — but I've had a fever for two days and today everything got so much weaker, so fast.\"", kind: "pt",
      evid: "Acute worsening of known myasthenic weakness with a preceding infectious trigger (fever) is the classic myasthenic crisis pattern — a real, time-sensitive decompensation, not a routine flare.", find: "OPQRST: known myasthenia gravis, acute worsening over hours, preceding fever/infection."}),
    sample: () => ({say: "Wife: \"Pyridostigmine, but it barely seems to be working today.\"", kind: "pt",
      evid: "A known myasthenic on his usual medication with an infectious trigger and a poor response today is exactly the crisis setup.", find: "SAMPLE: pyridostigmine (reduced effect today), fever x2 days."}),
    lungs: () => ({say: "Weak cough, shallow breathing, notable difficulty holding his neck up against gravity.", kind: "crit",
      evid: "Neck-flexor weakness and a weak cough are real, simple bedside signs of significant respiratory muscle involvement in myasthenic crisis.", find: "Respiratory: weak cough, shallow effort, prominent neck-flexor weakness."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Myasthenic crisis progressed to respiratory failure without recognition or ventilatory support.";
    notes.push("An infection triggering acute decompensation in a known myasthenic is the specific pattern of myasthenic crisis — a real, time-critical emergency, not just 'his usual weakness.'");
    notes.push("Field adjustment of his own pyridostigmine is not something to attempt — the job is recognizing the trend toward respiratory failure and being ready to support ventilation, plus rapid transport for definitive care (which may include treating the underlying infection).");
    return {died, cause, notes, correct: s.pi === "RDOT" || s.pi === "ALOC", truth: "Myasthenic crisis triggered by an intercurrent infection"};},
},

bellsPalsyOnset: {cat: "medical", id: "NEUR-054", pronouns: "she", title: "Female, 44. Sudden facial droop, worried it's a stroke.",
  limit: 700, transport: 400,
  bystanders: "She called 911 herself, frightened it might be a stroke.",
  units: [{at: 360, level: "emt", name: "BLS 8"}],
  dispatch: ["44F, sudden facial drooping.", "Conscious, alert, ambulatory, speaking clearly."],
  update: [],
  impression: "Sitting upright, alert and articulate, with an obvious right-sided facial droop involving the whole side of her face, including the forehead.",
  imps: ["STRK", "ANXY"],
  condition: "bellsPalsy",
  patient: {age: 44, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I woke up this morning and the whole right side of my face just doesn't move. I can talk fine, my arms and legs are totally normal. I'm terrified this is a stroke.\"", kind: "pt",
      evid: "Isolated facial weakness with completely normal speech and limb strength narrows this significantly — the key exam finding still needed is whether the FOREHEAD is involved.", find: "OPQRST: isolated facial droop on waking, no limb weakness, no speech difficulty."}),
    sample: () => ({say: "\"No medications, no health problems, no stroke risk factors that I know of. I'm only 44.\"", kind: "pt", find: "SAMPLE: no cardiovascular risk factors, otherwise healthy."}),
    face: () => ({say: "Ask her to raise both eyebrows — she CAN raise the right side along with the left, even though the lower face droops.", kind: "crit",
      evid: "Forehead sparing is impossible in Bell's palsy — cranial nerve VII palsy (Bell's) affects the WHOLE side including the forehead, because it is a lower-motor-neuron lesion. If the forehead moves normally, the deficit MUST be central (a stroke sparing the forehead via bilateral cortical innervation) rather than peripheral — but here the whole face, forehead included, is affected, which IS consistent with Bell's, not a stroke.", find: "Face: forehead involved along with lower face — full unilateral CN VII distribution, consistent with a peripheral (Bell's palsy) lesion, not a cortical stroke."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["The single most important exam finding on any facial droop call is the FOREHEAD: a stroke (a central, upper-motor-neuron lesion) spares forehead movement because of bilateral cortical innervation, while Bell's palsy (a peripheral, lower-motor-neuron CN VII lesion) does not — the whole side, forehead included, is affected.",
      "Normal speech and normal limb strength alongside a full, forehead-involving facial droop support Bell's palsy over a stroke — but this is still an appropriate transport for evaluation, both to confirm the diagnosis and because early steroid treatment improves Bell's palsy outcomes."],
    correct: false, truth: "Bell's palsy (idiopathic peripheral CN VII palsy) — not a stroke"}),
},

meningitisFeverNeck: {cat: "medical", id: "NEUR-055", pronouns: "he", title: "Male, 20. Fever, severe headache, neck stiffness.",
  limit: 1000, transport: 480,
  bystanders: "His roommate says he's been getting worse all day and now can barely stand the light on.",
  units: [{at: 360, level: "paramedic", name: "Medic 3"}],
  dispatch: ["20M, fever and severe headache, college dorm.", "Neck stiffness per roommate."],
  update: ["Roommate: \"He just threw up and said the light is killing him.\""],
  impression: "Lying curled on his side in a dark room, guarding his neck, wincing at the light from your flashlight.",
  imps: ["SEPS", "FEVR"],
  condition: "meningitis",
  patient: {age: 20, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Fever since yesterday, headache's the worst I've ever had, and my neck is so stiff I can barely move it. Light is unbearable.\"", kind: "pt",
      evid: "Fever, severe headache, neck stiffness (meningismus), and photophobia together is the classic meningitis triad-plus, especially concerning in a college dorm setting (bacterial meningitis outbreak risk).", find: "OPQRST: fever, severe headache, neck stiffness, photophobia, classic meningitis presentation."}),
    sample: () => ({say: "Roommate: \"No medications that I know of, no allergies. He seemed totally fine yesterday morning.\"", kind: "pt", find: "SAMPLE: no known history, rapid onset over ~36 hours."}),
    neck: () => ({say: "Resists any attempt to flex his neck forward — real, painful, involuntary guarding, not just stiffness from lying still.", kind: "crit",
      evid: "True nuchal rigidity (painful resistance to passive neck flexion) is a specific meningeal irritation sign, not simply muscular stiffness.", find: "Neck: true nuchal rigidity, resists passive flexion."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Bacterial meningitis with rising intracranial pressure progressed without recognition and rapid transport.";
    notes.push("Fever, severe headache, true nuchal rigidity, and photophobia together in a young adult — especially in a congregate setting like a dorm — is a high-concern meningitis presentation that needs rapid transport, not observation.");
    notes.push("There is no field antibiotic or definitive treatment here; the job is recognition, supportive care, and minimizing scene time to get him to a facility that can start treatment and manage rising intracranial pressure if it develops.");
    return {died, cause, notes, correct: s.pi === "SEPS" || s.pi === "FEVR", truth: "Bacterial meningitis"};},
},

encephalitisConfused: {cat: "medical", id: "NEUR-056", pronouns: "she", title: "Female, 31. Fever with new confusion and a seizure at home.",
  limit: 1100, transport: 480,
  bystanders: "Her husband called after she had a seizure and hasn't been making sense since.",
  units: [{at: 360, level: "paramedic", name: "Medic 5"}],
  dispatch: ["31F, fever with new confusion, witnessed seizure.", "Husband reports personality change over the last day."],
  update: ["Husband: \"She's been saying strange things, not like herself at all.\""],
  impression: "Awake but confused, answering questions inappropriately, febrile, husband describing a witnessed seizure twenty minutes ago.",
  imps: ["ALOC", "SEIZ", "FEVR"],
  condition: "encephalitis",
  patient: {age: 31, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Husband: \"She had a fever yesterday, today she started saying really strange things, not making sense, and then twenty minutes ago she had a full seizure.\"", kind: "pt",
      evid: "Fever with a rapidly evolving personality/behavior change AND a new seizure together points at the brain PARENCHYMA itself being inflamed (encephalitis), not just the meninges — mentation is affected early here, unlike typical meningitis.", find: "OPQRST: fever, acute personality change, new-onset seizure — encephalitis pattern."}),
    sample: () => ({say: "Husband: \"No medications, no seizure history ever. She was totally normal three days ago.\"", kind: "pt", find: "SAMPLE: no prior history, rapid new-onset over days."}),
    loc: () => ({say: "Awake, but disoriented and answering questions with unrelated, strange responses.", kind: "crit",
      evid: "Altered mentation THIS early and THIS prominently, combined with fever and a new seizure, is the real distinguishing feature from meningitis, where mentation is typically preserved until much later.", find: "LOC: awake but significantly disoriented, inappropriate responses."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Viral encephalitis with ongoing seizure risk and rising cerebral involvement progressed without rapid recognition and transport.";
    notes.push("Fever plus EARLY, prominent altered mentation plus a new seizure — not just a headache and neck stiffness — is the pattern that should make you think encephalitis (brain tissue inflammation) rather than meningitis (meningeal inflammation), even though the field management is similarly urgent for both.");
    notes.push("No field antiviral exists for this (empiric acyclovir for suspected HSV encephalitis is hospital-level) — the job is airway/seizure precautions and rapid transport.");
    return {died, cause, notes, correct: s.pi === "ALOC" || s.pi === "SEIZ", truth: "Acute (likely viral) encephalitis"};},
},

toxicMetabolicConfusion: {cat: "medical", id: "NEUR-057", pronouns: "he", title: "Male, 74. New confusion, history of liver disease.",
  limit: 900, transport: 420,
  bystanders: "His daughter noticed he wasn't making sense on the phone and drove over to check.",
  units: [{at: 360, level: "paramedic", name: "Medic 6"}],
  dispatch: ["74M, new confusion.", "History of cirrhosis per daughter."],
  update: [],
  impression: "Sitting in his recliner, awake but disoriented, slow to answer, with a faint sweetish odor on his breath.",
  imps: ["ALOC"],
  condition: "toxicMetabolicEncephalopathy",
  patient: {age: 74, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Daughter: \"He was totally fine yesterday, today he's just not making sense, forgetting things, slow to answer.\"", kind: "pt",
      evid: "New, global confusion with NO focal weakness or speech deficit, in a patient with known liver disease, points toward a metabolic/toxic cause (hepatic encephalopathy) rather than a focal stroke.", find: "OPQRST: acute global confusion, no focal complaint, known cirrhosis."}),
    sample: () => ({say: "Daughter: \"Cirrhosis from years ago, lactulose he's supposed to take but sometimes skips. No new medications.\"", kind: "pt",
      evid: "A known cirrhotic who has been missing his lactulose (the actual treatment that lowers ammonia) is a specific, identifiable, common cause of hepatic encephalopathy.", find: "SAMPLE: cirrhosis, inconsistent lactulose use."}),
    loc: () => ({say: "Awake, globally slow and disoriented, but NO facial droop, NO arm drift, NO speech slurring — the confusion is diffuse, not one-sided.", kind: "obs",
      evid: "A GLOBAL, symmetric confusion with a completely normal focal stroke exam (no droop, no drift, no dysarthria) argues strongly for a metabolic/toxic cause over a stroke.", find: "Neuro exam: globally confused, no focal deficit on stroke screen."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A GLOBAL confusion with a clean focal stroke exam — no facial droop, no arm drift, no slurred speech — in a patient with a known cause (missed lactulose in a cirrhotic) points at hepatic encephalopathy rather than a stroke, though both need transport and workup.",
      "There's no field reversal for this (lactulose/rifaximin are the real hospital-level treatments) — the job is recognition, supportive care, and giving an accurate history at handoff so the receiving facility doesn't have to re-discover the missed medication."],
    correct: true, truth: "Hepatic (toxic-metabolic) encephalopathy from missed lactulose in known cirrhosis"}),
},

deliriumFluctuating: {cat: "medical", id: "NEUR-058", pronouns: "she", title: "Female, 81. Fluctuating confusion, per nursing home staff.",
  limit: 900, transport: 420,
  bystanders: "A nursing home aide says she was fine this morning, then confused an hour later, then seemed fine again briefly.",
  units: [{at: 360, level: "emt", name: "BLS 9"}],
  dispatch: ["81F, fluctuating confusion, nursing home.", "Baseline mental status normal per staff."],
  update: ["Aide: \"She was answering us fine five minutes ago, now she's confused again.\""],
  impression: "Sitting in a wheelchair, alert but disoriented right now, staff noting this comes and goes rather than staying constant.",
  imps: ["ALOC", "SEPS"],
  condition: "delirium",
  patient: {age: 81, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Aide: \"This is NOT how she normally is — she's usually sharp. It comes and goes, confused one minute, almost normal the next.\"", kind: "pt",
      evid: "A FLUCTUATING course — waxing and waning over the same encounter — in a patient with a documented normal baseline, is the hallmark of delirium, distinct from dementia's stable chronic impairment or a stroke's fixed deficit.", find: "OPQRST: new, fluctuating confusion against a documented normal baseline."}),
    sample: () => ({say: "Aide: \"She has a UTI they were treating with antibiotics, started a couple days ago.\"", kind: "pt",
      evid: "An active infection (UTI) is one of the most common identifiable triggers for delirium in an elderly patient — the real underlying problem is often not neurologic at all.", find: "SAMPLE: active UTI on antibiotics, otherwise baseline healthy for her age."}),
    loc: () => ({say: "Confused and disoriented right now — but staff confirm this state itself is not constant, alternating with lucid periods.", kind: "obs",
      evid: "Observing (or reliably hearing about) the fluctuation itself, not just a single confused snapshot, is what actually makes the delirium diagnosis rather than dementia or a fixed deficit.", find: "Mental status fluctuating between confused and near-baseline within the same encounter."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["The fluctuating COURSE is the diagnosis here — a new, waxing-and-waning confusion against a documented normal baseline is delirium until proven otherwise, and it always has an underlying cause (here, a real infection) that needs to be found and treated, not just 'her being old.'",
      "There's no field treatment for delirium itself — the job is recognizing it as abnormal (not baseline dementia), identifying the likely trigger from history, and transporting for workup and treatment of the underlying cause."],
    correct: true, truth: "Delirium secondary to a urinary tract infection"}),
},

hypoxicBrainInjuryPostArrest: {cat: "medical", id: "NEUR-059", pronouns: "he", title: "Male, 52. Resuscitated from cardiac arrest, remains unresponsive.",
  limit: 1000, transport: 480,
  bystanders: "His coworkers performed CPR and used the office AED before you arrived.",
  units: [{at: 360, level: "paramedic", name: "Medic 2"}],
  dispatch: ["52M, ROSC after witnessed arrest and AED use.", "Currently breathing, pulse present, unresponsive."],
  update: [],
  impression: "Supine, breathing on his own with a pulse present, but completely unresponsive to voice or painful stimulus.",
  imps: ["ALOC", "CANT"],
  condition: "hypoxicBrainInjury",
  patient: {age: 52, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Coworker: \"He just collapsed at his desk, we started CPR right away and the AED shocked him once, he's had a pulse back for a few minutes now.\"", kind: "pt",
      evid: "Prompt bystander CPR and early defibrillation are the best-case scenario for a witnessed arrest, but persistent unresponsiveness after ROSC still means real anoxic brain injury occurred during the down time.", find: "OPQRST: witnessed arrest, immediate bystander CPR, early AED shock, ROSC achieved, remains unresponsive."}),
    sample: () => ({say: "Coworker: \"No idea about his medical history, we don't know him that well.\"", kind: "pt", find: "SAMPLE: unknown, no history available."}),
    loc: () => ({say: "No response to voice. Withdraws weakly from painful stimulus, no purposeful movement, pupils sluggish.", kind: "crit",
      evid: "Persistent unresponsiveness with only withdrawal to pain after ROSC is consistent with real anoxic injury from the arrest — the neurologic outcome is not yet determined and depends heavily on post-arrest care.", find: "Neuro: unresponsive to voice, withdraws to pain only, sluggish pupils."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Good bystander CPR and early defibrillation gave this patient the best possible chance, but persistent unresponsiveness after ROSC means real hypoxic brain injury happened during the arrest — the neurologic outcome is not decided in the field.",
      "The field job now is protecting that outcome: avoiding hypoxia and hypotension, careful airway management, and rapid transport to a facility that can provide targeted temperature management and post-arrest critical care — the same principles that already apply to any post-ROSC patient."],
    correct: true, truth: "Hypoxic-ischemic brain injury following cardiac arrest, post-ROSC"}),
},

increasedICPHeadacheVomiting: {cat: "medical", id: "NEUR-060", pronouns: "she", title: "Female, 49. Worsening headache and vomiting over a week, known brain tumor.",
  limit: 1200, transport: 480,
  bystanders: "Her husband says her headaches have been getting steadily worse since her last oncology visit.",
  units: [{at: 400, level: "paramedic", name: "Medic 4"}],
  dispatch: ["49F, worsening headache and vomiting.", "Known brain tumor per husband."],
  update: ["Husband: \"She threw up again and seems more out of it than an hour ago.\""],
  impression: "Lying still, holding her head, intermittently vomiting, slower to respond than her husband says is normal for her.",
  imps: ["ALOC", "PMGT"],
  condition: "increasedICP",
  patient: {age: 49, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Husband: \"She has a brain tumor, being followed by oncology. The headaches have been getting worse all week, and now she can't stop throwing up.\"", kind: "pt",
      evid: "A known intracranial mass with a progressively worsening headache and new vomiting is the classic triad of rising intracranial pressure — this is a real, progressive process, not a routine headache.", find: "OPQRST: known brain tumor, progressively worsening headache over a week, new vomiting."}),
    sample: () => ({say: "Husband: \"Dexamethasone that oncology started her on, but her dose ran low.\"", kind: "pt",
      evid: "Dexamethasone reduces peritumoral edema — a lapse in that medication is a specific, identifiable reason for acute worsening.", find: "SAMPLE: known brain tumor, dexamethasone (recently lapsed)."}),
    loc: () => ({say: "Slower to respond than her husband describes as normal, and her heart rate is notably slow for how uncomfortable she looks.", kind: "crit",
      evid: "A slowing heart rate alongside worsening headache/vomiting and declining mentation is an early warning of the Cushing reflex — rising ICP compensating with a paradoxical bradycardia rather than the tachycardia ordinary pain or shock would produce.", find: "Vitals: relative bradycardia given her distress, declining mentation — early Cushing-pattern warning."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Rising intracranial pressure progressed to herniation without recognition and rapid transport.";
    notes.push("A slowing heart rate in a patient who is CLEARLY getting worse — not the tachycardia pain or shock would normally produce — is a real, teachable warning sign of rising intracranial pressure (the early edge of the Cushing reflex), not a reassuring finding.");
    notes.push("There is no field drug in this box that lowers intracranial pressure directly (mannitol/hypertonic saline are hospital-level) — the job is recognition, avoiding anything that worsens it (hypoventilation raises CO2 and ICP together), and minimizing scene time.");
    return {died, cause, notes, correct: s.pi === "ALOC", truth: "Rising intracranial pressure from a known intracranial mass, early Cushing physiology"};},
},

ischemicStrokeSudden: {cat: "medical", id: "NEUR-061", pronouns: "he", title: "Male, 71. Sudden right-sided weakness and slurred speech.",
  limit: 1100, transport: 480,
  bystanders: "His wife saw it happen and immediately noted the time.",
  units: [{at: 360, level: "paramedic", name: "Medic 1"}],
  dispatch: ["71M, sudden right-sided weakness, slurred speech.", "Wife has exact time of onset."],
  update: [],
  impression: "Sitting in a chair, right arm drifting downward when he tries to hold it up, speech clearly slurred, alert and frustrated.",
  imps: ["STRK", "ALOC"],
  condition: "ischemicStroke",
  patient: {age: 71, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Wife: \"He was talking to me completely normally, and then all of a sudden his words came out wrong and his arm just dropped. That was exactly 22 minutes ago.\"", kind: "pt",
      evid: "SUDDEN onset with an exact witnessed time is the single most valuable piece of information on a stroke call — it directly determines eligibility for time-sensitive hospital interventions.", find: "OPQRST: sudden-onset right arm weakness and dysarthria, exact last-known-well time available."}),
    sample: () => ({say: "Wife: \"Blood pressure medication, a baby aspirin daily. No allergies.\"", kind: "pt", find: "SAMPLE: hypertension on medication, daily aspirin, no allergies."}),
    // Was a static "already positive" finding regardless of when in the
    // call it's checked — F9 audit: reads pat.strokeWeakness/strokeSide/
    // strokeAphasia live, the same fields the strokeScreen action (actions.js)
    // already reads, instead of narrating a fixed picture. ischemicStroke's
    // own mechanism holds weakness at a constant 0.8 for the whole call (no
    // resolution), so this reads the same as before in practice — but now
    // driven by the real mechanism rather than duplicated scripted text that
    // could silently drift from it.
    loc: (s) => {const pat = s.patient, w = pat?.strokeWeakness || 0;
      if (w < 0.15) return {say: "Arm holds steady, speech clear, face symmetric.", kind: "obs", find: "Stroke screen negative — no drift, dysarthria, or droop."};
      const side = pat?.strokeSide || "right";
      return {say: `${side === "right" ? "Right" : "Left"} arm drifts and cannot hold position against gravity; speech clearly slurred; face droops slightly on the ${side}, sparing the forehead.`, kind: "crit",
        evid: "Unilateral arm drift, dysarthria, and a forehead-SPARING facial droop together are a positive stroke screen (Cincinnati/FAST) and localize to a cortical (central) lesion, not a peripheral one like Bell's palsy.",
        find: `Stroke screen positive: ${side} arm drift, dysarthria, ${side} facial droop sparing the forehead.`};},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A time-critical ischemic stroke was not recognized and transported rapidly enough to a stroke-capable facility.";
    notes.push("An exact, witnessed last-known-well time is the single most important piece of information you can hand off on this call — it directly determines what treatments the receiving hospital can offer.");
    notes.push("There is no field-reversal for an ischemic stroke (thrombolytics/thrombectomy are hospital-level and time-limited) — the entire field job is a fast, accurate stroke screen, an accurate time, and minimizing scene time to a stroke-capable facility.");
    return {died, cause, notes, correct: s.pi === "STRK", truth: "Acute ischemic stroke (embolic), right MCA territory"};},
},

transientIschemicAttack: {cat: "medical", id: "NEUR-062", pronouns: "she", title: "Female, 68. Weakness that already resolved by the time you arrive.",
  limit: 900, transport: 420,
  bystanders: "Her neighbor watched her right hand go weak and her words slur, then watched it resolve over the next twenty minutes.",
  units: [{at: 360, level: "paramedic", name: "Medic 6"}],
  dispatch: ["68F, weakness and slurred speech, reportedly resolved.", "Neighbor witnessed onset and resolution."],
  update: [],
  impression: "Sitting comfortably, speaking clearly, moving all extremities normally — completely unremarkable on exam right now.",
  imps: ["STRK", "ALOC"],
  condition: "tia",
  patient: {age: 68, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Neighbor: \"About twenty-five minutes ago her hand went weak and her speech got slurred, out of nowhere. It's completely gone now, she seems totally fine.\"", kind: "pt",
      evid: "A focal deficit that resolved completely within an hour is the definition of a TIA — and the fact that it resolved is NOT reassuring, it is itself the red flag for an impending stroke.", find: "OPQRST: witnessed focal weakness/dysarthria, fully resolved within ~25 minutes."}),
    sample: () => ({say: "\"Blood pressure pills and a statin. This has never happened to me before.\"", kind: "pt", find: "SAMPLE: hypertension, hyperlipidemia, first episode."}),
    // The confirmed-real instance of the F9 audit's "static probes.loc"
    // finding: this used to say "completely normal" unconditionally, even
    // though tia's own mechanism (physio/conditions.js) genuinely decays
    // strokeWeakness from 0.7 to 0 over the first 20 sim-minutes — a player
    // checking LOC early in the call (before it resolves) was told the exam
    // was normal when the real deficit was still present. Now reads live,
    // the same pat.strokeWeakness/strokeSide/strokeAphasia fields the
    // strokeScreen action (actions.js) already reads.
    loc: (s) => {const pat = s.patient, w = pat?.strokeWeakness || 0;
      if (w < 0.15) return {say: "Completely normal right now — full strength, clear speech, no drift, no droop.", kind: "obs",
        evid: "A fully resolved neuro exam does NOT rule out significant risk — a TIA carries a real, documented short-term stroke risk (up to 10-15% within 90 days) that this normal-looking exam does not capture.", find: "Neuro exam: completely normal, no residual deficit."};
      const side = pat?.strokeSide || "right";
      const armPart = w >= 0.5 ? `${side} arm drifts and cannot hold position against gravity` : `${side} arm drifts, weaker than the other side but not yet collapsed`;
      const speechPart = pat?.strokeAphasia ? " Speech is still slurred." : "";
      return {say: `Still weak right now — ${armPart}.${speechPart} Hasn't resolved yet.`, kind: "crit",
        evid: "A focal deficit that is STILL PRESENT hasn't technically met the definition of a TIA yet (that requires resolution) — but the field response is identical either way: treat it as an active stroke until it proves otherwise.",
        find: `Neuro exam: residual ${side}-sided weakness (${Math.round(w * 100)}%)${pat?.strokeAphasia ? ", dysarthria" : ""} — not yet resolved.`};},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A resolved deficit was treated as reassurance rather than the warning sign a TIA actually is, and a subsequent stroke was not caught in time.";
    notes.push("A RESOLVED deficit is not reassurance — it is the actual finding. A TIA carries a real, elevated short-term risk of a completed stroke (up to 10-15% within 90 days), which is why urgent transport and workup matters even though the patient looks completely normal right now.");
    notes.push("The field job is the same as for an active stroke: a complete history with an accurate timeline, a full stroke screen even though it's currently negative, and transport — not a refusal, however good the patient currently feels.");
    return {died, cause, notes, correct: s.pi === "STRK", truth: "Transient ischemic attack, resolved"};},
},

intracerebralHemorrhageCollapse: {cat: "medical", id: "NEUR-063", pronouns: "he", title: "Male, 59. Sudden severe headache, then collapsed with left-sided weakness.",
  limit: 1200, transport: 480,
  bystanders: "His son watched him grab his head, say it was the worst pain of his life, and then go weak on one side.",
  units: [{at: 360, level: "paramedic", name: "Medic 3"}],
  dispatch: ["59M, sudden severe headache, now left-sided weakness.", "History of poorly controlled hypertension per son."],
  update: ["Son: \"He's getting harder to wake up.\""],
  impression: "Lying on the floor, difficult to arouse, left arm and leg flaccid, right pupil sluggish.",
  imps: ["STRK", "ALOC"],
  condition: "intracerebralHemorrhage",
  patient: {age: 59, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Son: \"He grabbed his head, said it was the worst pain of his life, and then just went weak on his left side and started fading out.\"", kind: "pt",
      evid: "A sudden, severe headache immediately PRECEDING a focal deficit and declining consciousness — not the deficit alone — is the pattern that points toward a hemorrhage rather than an ischemic event.", find: "OPQRST: sudden severe headache, then left-sided weakness, then declining LOC."}),
    sample: () => ({say: "Son: \"His blood pressure's been bad for years, he doesn't take his pills like he should. No blood thinners that I know of.\"", kind: "pt", find: "SAMPLE: longstanding poorly controlled hypertension, non-adherent, no anticoagulants."}),
    // Same F9 live-physiology treatment as ischemicStroke/tia's own loc
    // probes — reads pat.strokeWeakness/strokeSide live instead of a fixed
    // string. intracerebralHemorrhage's own mechanism holds weakness at a
    // constant 0.6 (no resolution, only icpMassEffect climbs over time), so
    // this reads the same as before in practice — driven by the mechanism
    // now, not duplicated text. Pupil finding is left as its own static
    // observation: this engine doesn't model which side a mass-effect pupil
    // shows up on separately from strokeSide, so parametrizing it would be
    // inventing precision the mechanism doesn't actually have.
    loc: (s) => {const pat = s.patient, w = pat?.strokeWeakness || 0;
      if (w < 0.15) return {say: "Arousable, moving all extremities, pupils equal and reactive.", kind: "obs", find: "Neuro exam currently unremarkable."};
      const side = pat?.strokeSide || "left";
      return {say: `Difficult to arouse, ${side} arm and leg completely flaccid, right pupil sluggish and slightly larger than the left.`, kind: "crit",
        evid: "Declining consciousness with an asymmetric, sluggish pupil is a real, worrying sign of rising intracranial pressure from an expanding hematoma — not just the focal deficit itself.",
        find: `Neuro: obtunded, dense ${side} hemiparesis, early right pupillary asymmetry.`};},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveAntiplatelet = s.given.aspirin;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "An expanding intracerebral hemorrhage progressed to herniation without rapid recognition and transport.";
    if (gaveAntiplatelet) notes.push("Aspirin was given here. In a SUSPECTED hemorrhagic stroke this is a real mistake, not a neutral one — an antiplatelet agent can worsen hematoma expansion. Chest-pain-reflex dosing does not belong on every call with a headache and weakness.");
    else notes.push("No antiplatelet/anticoagulant was given — correct, given the sudden severe headache preceding the deficit strongly suggests hemorrhage, where those drugs would be actively harmful rather than neutral.");
    notes.push("A sudden, severe headache immediately before a focal deficit, in a patient with longstanding poorly controlled hypertension, is the pattern to recognize as a probable bleed rather than a clot — the field management (rapid transport, avoiding antiplatelet/anticoagulant drugs) differs from an ischemic stroke for exactly this reason.");
    return {died, cause, notes, correct: s.pi === "STRK", truth: "Intracerebral hemorrhage from chronic hypertension"};},
},

subarachnoidHemorrhageThunderclap: {cat: "medical", id: "NEUR-064", pronouns: "she", title: "Female, 46. \"Worst headache of my life,\" sudden onset.",
  limit: 1100, transport: 480,
  bystanders: "Her sister was on the phone with her when it happened and heard her scream in pain.",
  units: [{at: 360, level: "paramedic", name: "Medic 7"}],
  dispatch: ["46F, sudden severe headache, described as worst ever.", "No prior history of headaches per sister."],
  update: [],
  impression: "Lying on the bathroom floor, holding her head, moaning, guarding her neck, vomited once already.",
  imps: ["STRK", "PMGT"],
  condition: "subarachnoidHemorrhage",
  patient: {age: 46, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It hit like a thunderclap, worst pain I've ever felt in my life, instantly, out of nowhere. I've never had a headache like this before, ever.\"", kind: "pt",
      evid: "A SUDDEN, maximal-at-onset ('thunderclap') headache described as the worst of the patient's life, with no prior headache history, is the specific, teachable history for subarachnoid hemorrhage — not a gradual-onset migraine pattern.", find: "OPQRST: sudden thunderclap headache, maximal at onset, no prior headache history."}),
    sample: () => ({say: "\"No medications, no health problems, I never even get headaches normally.\"", kind: "pt", find: "SAMPLE: no history, no prior headaches — a genuinely new and different presentation."}),
    loc: () => ({say: "Alert and oriented, but her neck is stiff and she flinches hard at light — and her exam is otherwise completely normal, no weakness on either side.", kind: "crit",
      evid: "A severe, sudden headache with meningismus and photophobia but a NORMAL focused motor exam is a real, teachable negative — a catastrophic bleed does not require a focal deficit to be present.", find: "Neuro: alert, oriented, meningismus and photophobia present, no focal motor deficit."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A subarachnoid hemorrhage was not recognized in time — the absence of a focal deficit was mistaken for a benign headache.";
    notes.push("\"Worst headache of my life,\" sudden thunderclap onset, in a patient with NO prior headache history, is the specific pattern that should trigger real concern for subarachnoid hemorrhage — this history matters more than any single exam finding.");
    notes.push("A NORMAL focused neuro exam does not rule this out — a severe, sudden, unprecedented headache with a normal motor exam is still a positive finding, not a reassuring one, and needs the same urgent transport as a patient with an obvious deficit.");
    return {died, cause, notes, correct: s.pi === "STRK" || s.pi === "PMGT", truth: "Subarachnoid hemorrhage (aneurysmal)"};},
},

// ===== ENDOCRINE/METABOLIC BATCH (queue item 7) =====
// cushingSyndrome and typeIDiabetes (comorbidities) deliberately have no
// standalone scenario, same diabetesT2 precedent as the neuro batch above.

diabeticKetoacidosisCall: {cat: "medical", id: "ENDO-101", pronouns: "he", title: "Male, 24. Days of vomiting and deep, rapid breathing.",
  limit: 1100, transport: 480,
  bystanders: "His roommate says he's been sick for days and stopped taking his insulin because he couldn't keep food down.",
  units: [{at: 360, level: "paramedic", name: "Medic 5"}],
  dispatch: ["24M, vomiting, unusual breathing pattern.", "Type 1 diabetic per roommate."],
  update: [],
  impression: "Sitting hunched forward, breathing deep and fast, a fruity odor on his breath, clearly dehydrated.",
  imps: ["DIAB", "RDOT"],
  condition: "diabeticKetoacidosis",
  patient: {age: 24, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I've been throwing up for two days and couldn't keep my insulin down, so I stopped taking it. I feel awful and I can't stop breathing like this.\"", kind: "pt",
      evid: "A type 1 diabetic with insulin lapse during an illness, now breathing deep and rapid (Kussmaul respirations) with a fruity (ketotic) breath odor, is the classic DKA presentation.", find: "OPQRST: insulin lapse during illness, days of vomiting, deep rapid breathing, fruity breath odor."}),
    sample: () => ({say: "\"Insulin, but I stopped two days ago. No allergies.\"", kind: "pt", find: "SAMPLE: type 1 diabetic, insulin lapsed 2 days."}),
    glucometer: () => ({say: `Glucometer reads "HIGH" — off the top of the scale.`, kind: "crit",
      evid: "A glucose reading beyond the meter's range, combined with Kussmaul breathing and a fruity odor, confirms diabetic ketoacidosis rather than a simple GI illness.", find: `Glucose: "HIGH" (unreadable, off-scale).`}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveFluid = s.given.saline;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe diabetic ketoacidosis with profound dehydration and acidosis progressed without correction — the real treatment (insulin, careful fluid and potassium management) is hospital-level, and nothing was done to support him in the meantime.";
    if (gaveFluid) notes.push("IV fluids were given — the correct field intervention. DKA patients are often severely volume-depleted from osmotic diuresis, and fluid resuscitation is genuinely field-appropriate even though insulin (the definitive fix) is not in this box.");
    else notes.push("No IV fluid was given to a patient with days of vomiting, osmotic diuresis, and visible dehydration — volume support is a real, low-risk, field-appropriate intervention here.");
    notes.push("The deep, rapid breathing is not primarily a respiratory problem — it's the body's own compensation for a severe metabolic acidosis (Kussmaul respirations). Assisting ventilation to 'slow it down' would be exactly the wrong move.");
    return {died, cause, notes, correct: s.pi === "DIAB", truth: "Diabetic ketoacidosis from insulin non-adherence during illness"};},
},

hyperosmolarHyperglycemicCall: {cat: "medical", id: "ENDO-102", pronouns: "she", title: "Female, 70. Days of confusion and not drinking fluids, type 2 diabetic.",
  limit: 1100, transport: 480,
  bystanders: "Her son found her confused and unable to tell him how long she'd been like this.",
  units: [{at: 360, level: "paramedic", name: "Medic 8"}],
  dispatch: ["70F, altered mental status, poor oral intake for days.", "Type 2 diabetic per son."],
  update: [],
  impression: "Lying in bed, profoundly dehydrated-appearing, confused, slow to respond, skin tenting when pinched.",
  imps: ["DIAB", "ALOC"],
  condition: "hyperosmolarHyperglycemicState",
  patient: {age: 70, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Son: \"She hasn't been drinking much the last few days, and today I can't get her to make sense at all.\"", kind: "pt",
      evid: "A type 2 diabetic with days of poor intake, profound dehydration and confusion (rather than Kussmaul breathing) points toward HHS rather than DKA — the residual insulin in type 2 diabetes usually prevents significant ketosis.", find: "OPQRST: days of poor oral intake, progressive confusion, no reported vomiting or breathing changes."}),
    sample: () => ({say: "Son: \"Metformin for her diabetes, blood pressure pills. She lives alone, I only check on her every few days.\"", kind: "pt", find: "SAMPLE: type 2 diabetic on metformin, lives alone, limited monitoring."}),
    skin: () => ({say: "Tents when pinched and takes several seconds to flatten — profound dehydration.", kind: "crit",
      evid: "Severe skin tenting reflects the massive free-water deficit HHS produces — often even more severe dehydration than a comparable DKA presentation.", find: "Skin: severe tenting, profound dehydration."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveFluid = s.given.saline;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Profound hyperosmolar dehydration and altered mentation progressed without volume support.";
    if (gaveFluid) notes.push("IV fluids were given — the correct, urgent field priority here. HHS patients are often even more severely dehydrated than DKA patients, and volume support matters immediately.");
    else notes.push("No IV fluid was given to a profoundly dehydrated, confused patient — volume resuscitation is the single most important field intervention available for this presentation.");
    notes.push("The altered mentation here is a direct, real consequence of the blood being that concentrated (hyperosmolarity), not a separate stroke or infection — though ruling those out is still part of a complete exam.");
    return {died, cause, notes, correct: s.pi === "DIAB" || s.pi === "ALOC", truth: "Hyperosmolar hyperglycemic state"};},
},

severeHypoglycemiaFound: {cat: "medical", id: "ENDO-103", pronouns: "he", title: "Male, 45. Found unresponsive, diabetic, insulin pen nearby.",
  limit: 700, transport: 360,
  bystanders: "His girlfriend found him unresponsive on the couch with his insulin pen still in hand.",
  units: [],
  dispatch: ["45M, unresponsive, diabetic.", "Insulin pen found nearby per girlfriend."],
  update: [],
  impression: "Slumped on the couch, unresponsive to voice, diaphoretic and pale, insulin pen on the floor beside him.",
  imps: ["DIAB", "ALOC"],
  condition: "severeHypoglycemia",
  patient: {age: 45, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Girlfriend: \"He took his insulin before dinner but never actually ate — I found him like this maybe twenty minutes later.\"", kind: "pt",
      evid: "Insulin taken without the matching food intake is a textbook, identifiable cause of severe hypoglycemia — this is exactly what 'insulin shock' historically described.", find: "OPQRST: insulin dosed, meal skipped, found unresponsive ~20 min later."}),
    sample: () => ({say: "Girlfriend: \"Insulin for his diabetes, that's it. No other health problems.\"", kind: "pt", find: "SAMPLE: insulin-dependent diabetic, no other history."}),
    glucometer: () => ({say: "Glucometer reads 28 mg/dL.", kind: "crit",
      evid: "A profoundly low glucose confirms severe hypoglycemia as the cause of his unresponsiveness — a real, reversible, immediately treatable emergency.", find: "Glucose: 28 mg/dL."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const treated = s.given.d10 || s.given.glucagon || s.given.oralGlucose;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Profound, unreversed hypoglycemia — one of the most reliably reversible field emergencies there is — was never corrected.";
    if (treated) notes.push("Glucose was corrected — the right move, and one of the most satisfying, reliable saves in this job when caught in time.");
    else notes.push("Glucose was never corrected in a patient with a confirmed reading of 28 — this is an immediately treatable cause of unresponsiveness, and it should have been.");
    notes.push("A glucometer check belongs on essentially every altered-mental-status call — it takes seconds and can turn a mysterious unresponsive patient into an obvious, fixable one, exactly as it did here.");
    return {died, cause, notes, correct: s.pi === "DIAB" || s.pi === "ALOC", truth: "Severe hypoglycemia (insulin shock) from a mismatched insulin dose"};},
},

alcoholicKetoacidosisCall: {cat: "medical", id: "ENDO-104", pronouns: "she", title: "Female, 38. Days of heavy drinking, now vomiting with fast breathing.",
  limit: 1000, transport: 420,
  bystanders: "Her brother says she's been on a multi-day binge and hasn't eaten much of anything.",
  units: [{at: 360, level: "emt", name: "BLS 8"}],
  dispatch: ["38F, vomiting, breathing fast.", "Days of heavy alcohol use, poor intake per brother."],
  update: [],
  impression: "Sitting on the bathroom floor, breathing deep and fast, abdominal pain, smells strongly of alcohol but is arousable and answering questions.",
  imps: ["DIAB", "ABDP"],
  condition: "alcoholicKetoacidosis",
  patient: {age: 38, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I've been drinking for days and barely eating anything. My stomach hurts and I can't stop throwing up. I can't catch my breath right, either.\"", kind: "pt",
      evid: "Days of heavy alcohol use with minimal food intake, vomiting, abdominal pain, and rapid breathing is the classic alcoholic ketoacidosis pattern — a real anion-gap acidosis from starvation ketosis, distinct from simple alcohol intoxication.", find: "OPQRST: multi-day alcohol binge, poor intake, vomiting, tachypnea."}),
    sample: () => ({say: "\"No medications, no diabetes. Just haven't eaten in a few days, honestly.\"", kind: "pt", find: "SAMPLE: no diabetes, poor nutritional intake for days."}),
    glucometer: () => ({say: "Glucometer reads 92 mg/dL — unremarkable.", kind: "obs",
      evid: "A NORMAL glucose in a ketoacidotic, Kussmaul-breathing patient is the actual teaching trap here — the diagnosis has to come from the history and breathing pattern, not the glucometer, since this isn't diabetic ketoacidosis.", find: "Glucose: 92 mg/dL, normal."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A normal glucose reading does NOT rule out ketoacidosis — this patient's deep, rapid breathing and history of prolonged poor intake during a drinking binge point at alcoholic ketoacidosis, a real anion-gap acidosis with an unremarkable glucometer.",
      "IV fluids (with dextrose, since these patients are often also glycogen-depleted) and thiamine are the real field-appropriate supportive measures — recognition and volume support are the job, not writing this off as 'just drunk.'"],
    correct: true, truth: "Alcoholic ketoacidosis"}),
},

starvationKetosisCall: {cat: "medical", id: "ENDO-105", pronouns: "he", title: "Male, 26. Lightheaded after days of an extreme diet, mild rapid breathing.",
  limit: 700, transport: 360,
  bystanders: "His roommate is concerned after he mentioned barely eating anything for several days.",
  units: [],
  dispatch: ["26M, lightheaded, several days of minimal food intake.", "Conscious, alert, ambulatory."],
  update: [],
  impression: "Sitting on the couch, mildly breathing faster than normal, otherwise alert and talking normally, a little embarrassed.",
  imps: ["DIAB"],
  condition: "starvationKetosis",
  patient: {age: 26, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I've been doing an extreme fast for a few days, barely any food. Just felt lightheaded and a little short of breath, figured I should get checked.\"", kind: "pt",
      evid: "A mild, self-limited ketosis from prolonged fasting — not dangerous the way DKA or alcoholic ketoacidosis are, but a real, mild metabolic acidosis nonetheless.", find: "OPQRST: several days of extreme caloric restriction, mild lightheadedness and tachypnea, otherwise well."}),
    sample: () => ({say: "\"No medications, no diabetes, no health problems. Just an aggressive diet, in hindsight maybe not a great idea.\"", kind: "pt", find: "SAMPLE: no underlying disease, self-inflicted caloric restriction."}),
    glucometer: () => ({say: "Glucometer reads 78 mg/dL — normal-low, unremarkable.", kind: "obs", find: "Glucose: 78 mg/dL."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["This is the mild, benign end of the ketosis spectrum — real, but self-correcting with resumption of normal eating, and it does not need the aggressive workup a DKA or alcoholic ketoacidosis presentation would.",
      "The field job is a complete exam to confirm this really is benign (rule out an eating disorder or another underlying cause worth flagging) and appropriate guidance, not an emergency intervention."],
    correct: true, truth: "Starvation ketosis from extreme caloric restriction"}),
},

hyperthyroidRacing: {cat: "medical", id: "ENDO-106", pronouns: "she", title: "Female, 33. Racing heart, heat intolerance, weight loss.",
  limit: 700, transport: 360,
  bystanders: "She called herself, worried about her racing heart.",
  units: [],
  dispatch: ["33F, palpitations, feels overheated.", "Conscious, alert."],
  update: [],
  impression: "Sitting by an open window despite the mild weather, visibly warm, hands trembling slightly, talking quickly.",
  imps: ["DYSR", "ANXY"],
  condition: "hyperthyroidism",
  patient: {age: 33, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"My heart's been racing for weeks, I can't tolerate any heat, and I've lost weight without trying. My hands won't stop shaking.\"", kind: "pt",
      evid: "Chronic tachycardia, heat intolerance, unintentional weight loss, and tremor together is the classic hyperthyroid picture — a real hormonal cause, not simple anxiety.", find: "OPQRST: weeks of palpitations, heat intolerance, unintentional weight loss, tremor."}),
    sample: () => ({say: "\"No medications yet, haven't seen a doctor about it. No other health problems.\"", kind: "pt", find: "SAMPLE: no medications, no prior diagnosis, symptoms present for weeks."}),
    // No antithyroid drug in this box (resolve() below says so), but a
    // beta-blocker genuinely lowers her rate through the same beta1 receptor
    // mechanism every other tachycardic patient responds to (drugs.js) — a
    // frozen "persistently fast" would misreport a real, measured response.
    // Measured against the real engine: untreated hr holds ~104, metoprolol
    // at 60s brings it to ~84 by minute 10 — 95 cleanly separates the two.
    heart: (s, v) => v.hr > 95
      ? {say: `Regular, persistently fast even at rest — ${v.hr}.`, find: `Heart: regular, sustained resting tachycardia (${v.hr}).`}
      : {say: `Regular, rate ${v.hr} — slower than it was, though she still says she feels wired.`, kind: "obs", find: `Heart: regular, rate ${v.hr}, improved from her baseline tachycardia.`},
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Sustained tachycardia with heat intolerance, weight loss, and tremor together points at a real endocrine cause (hyperthyroidism) rather than anxiety — the history is what separates the two, not the heart rate alone.",
      "There's no field antithyroid drug in this box; the job is recognition and appropriate referral, plus watching for the more dangerous decompensated form (thyroid storm) if she's ever more acutely unwell."],
    correct: true, truth: "Hyperthyroidism (undiagnosed)"}),
},

thyroidStormCrisis: {cat: "medical", id: "ENDO-107", pronouns: "he", title: "Male, 41. Known hyperthyroid, now feverish with a dangerously fast heart rate.",
  limit: 1100, transport: 480,
  bystanders: "His wife says his usual hyperthyroid symptoms got dramatically worse after he had a bad cold.",
  units: [{at: 360, level: "paramedic", name: "Medic 4"}],
  dispatch: ["41M, known hyperthyroidism, acute worsening with fever.", "Recent infection per wife."],
  update: ["Wife: \"His heart is pounding so fast I can see his chest moving.\""],
  impression: "Agitated, drenched in sweat, visibly tachycardic, febrile, tremulous, and confused when questioned.",
  imps: ["DYSR", "FEVR"],
  condition: "thyroidStorm",
  patient: {age: 41, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Wife: \"He has hyperthyroidism, usually manageable, but he had a bad cold this week and today he's suddenly SO much worse — fever, racing heart, confused.\"", kind: "pt",
      evid: "A known hyperthyroid patient with an infectious trigger and acute severe decompensation (fever, extreme tachycardia, confusion) is the classic thyroid storm precipitant and presentation.", find: "OPQRST: known hyperthyroidism, recent infection, acute severe decompensation."}),
    sample: () => ({say: "Wife: \"Methimazole, but I don't think he's been taking it consistently.\"", kind: "pt", find: "SAMPLE: methimazole (inconsistent use), recent infection."}),
    // No field antithyroid/beta-blocker protocol touches this condition
    // (resolve() below says so directly) — so this doesn't need a
    // treatment-response branch, but reading v.hr/v.temp live still beats
    // a hardcoded ">160"/generic "hot" for a condition whose whole point
    // is the hypermetabolic numbers actually climbing over the call.
    heart: (s, v) => ({say: `Extremely fast — ${v.hr} — and he's hot to the touch (${v.temp}°C) and visibly agitated.`, kind: "crit",
      evid: "Extreme tachycardia with fever and altered mentation together, in a known hyperthyroid patient, is the life-threatening thyroid storm picture — real risk of a lethal arrhythmia from the hypermetabolic, catecholamine-sensitized state.", find: `Heart: severe tachycardia (${v.hr}), febrile (${v.temp}°C), agitated/confused.`}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Thyroid storm, with its real risk of lethal arrhythmia from the hypermetabolic state, progressed without recognition and rapid transport.";
    notes.push("A known hyperthyroid patient with an infectious trigger and this degree of decompensation — extreme tachycardia, fever, confusion — is a real emergency (thyroid storm), not just 'his usual condition acting up.'");
    notes.push("There is no field antithyroid drug or beta-blocker protocol specific to storm in most boxes — the job is aggressive cooling support, cardiac monitoring for the real arrhythmia risk, and rapid transport.");
    return {died, cause, notes, correct: s.pi === "DYSR" || s.pi === "FEVR", truth: "Thyroid storm precipitated by an intercurrent infection"};},
},

hypothyroidSluggish: {cat: "medical", id: "ENDO-108", pronouns: "she", title: "Female, 62. Fatigue, cold intolerance, slow heart rate.",
  limit: 700, transport: 360,
  bystanders: "Her daughter thought she seemed unusually sluggish and cold all the time lately.",
  units: [],
  dispatch: ["62F, fatigue, feels cold constantly.", "Conscious, alert, slow to respond."],
  update: [],
  impression: "Sitting wrapped in a blanket despite a warm room, speaking slowly, movements deliberate and unhurried.",
  imps: ["ALOC"],
  condition: "hypothyroidism",
  patient: {age: 62, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I've just been so tired and cold all the time lately, even when it's warm out. Everything feels like it takes more effort than it should.\"", kind: "pt",
      evid: "Chronic fatigue, cold intolerance, and a generalized slowing (of speech, movement, and heart rate) together is the classic hypothyroid picture.", find: "OPQRST: weeks of fatigue, cold intolerance, generalized slowing."}),
    sample: () => ({say: "\"No medications, haven't seen a doctor in a while. No other health problems that I know of.\"", kind: "pt", find: "SAMPLE: no medications, no recent medical care."}),
    // resolve() below says this bradycardia shouldn't be treated — but if it
    // IS (atropine, same direct vagal-block hr-bump term every other
    // bradycardic patient responds to), the exam should show the real
    // effect, not a frozen "slow" regardless. Measured against the real
    // engine: untreated hr holds ~62, atropine at 60s brings it to ~74 by
    // minute 10 — 68 cleanly separates the two.
    heart: (s, v) => v.hr < 68
      ? {say: `Slow, regular, unremarkable otherwise — rate ${v.hr}.`, find: `Heart: bradycardic, regular (${v.hr}).`}
      : {say: `Regular, and faster than it was — rate ${v.hr} now, though she's just as slow to answer.`, kind: "obs", find: `Heart: regular, rate ${v.hr} — risen from her baseline bradycardia.`},
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A slow heart rate alongside fatigue, cold intolerance, and generalized slowing points at hypothyroidism rather than a primary cardiac conduction problem — the history and the whole-body pattern matter as much as the rate itself.",
      "This is a chronic, outpatient-manageable condition, not a field emergency — the job is recognition and referral, not aggressive treatment of an isolated bradycardia that isn't causing hemodynamic compromise."],
    correct: true, truth: "Hypothyroidism (undiagnosed)"}),
},

myxedemaComaCold: {cat: "medical", id: "ENDO-109", pronouns: "he", title: "Male, 79. Found profoundly cold and unresponsive, known thyroid disease.",
  limit: 1200, transport: 480,
  bystanders: "His neighbor found him unresponsive after not seeing him for two days.",
  units: [{at: 400, level: "paramedic", name: "Medic 6"}],
  dispatch: ["79M, unresponsive, found cold.", "Known thyroid disease per neighbor, lives alone."],
  update: [],
  impression: "Unresponsive, profoundly cold to the touch, breathing slow and shallow, heart rate strikingly slow.",
  imps: ["ALOC", "HEAT"],
  condition: "myxedemaComa",
  patient: {age: 79, gender: "male"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Neighbor: \"I hadn't seen him in a couple days, found him like this. I know he's had thyroid problems for years.\"", kind: "pt",
      evid: "An elderly patient with known thyroid disease, found profoundly hypothermic and unresponsive with a slow heart rate, is the classic (and often missed) myxedema coma presentation.", find: "OPQRST: known thyroid disease, found unresponsive and profoundly cold, unknown down time."}),
    sample: () => ({say: "Neighbor: \"He takes a thyroid pill, but I don't know if he's been taking it. Lives alone, no family nearby.\"", kind: "pt", find: "SAMPLE: levothyroxine (adherence unknown), lives alone, limited social support."}),
    skin: () => ({say: "Profoundly cold, dry — not the wet, pale skin of hypovolemic shock.", kind: "crit",
      evid: "Profound hypothermia with dry (not diaphoretic) skin, in a patient with known thyroid disease, points at a metabolic cause (myxedema coma) rather than environmental exposure or sepsis alone.", find: "Skin: profoundly cold, dry, poor perfusion."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const warmed = s.done.warm;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe, decompensated hypothyroidism with profound hypothermia and depressed consciousness progressed without recognition and active rewarming.";
    if (warmed) notes.push("Active warming was given — appropriate here, and a genuine, if partial, help against the real hypometabolic heat-production failure driving this cold.");
    else notes.push("No active warming was given to a profoundly hypothermic patient — real, if partial, help against a metabolic rate that has genuinely collapsed, not just ordinary environmental cold.");
    notes.push("A known thyroid history plus profound, unexplained hypothermia in an elderly patient found down should raise real concern for myxedema coma, not just environmental exposure — the underlying metabolic failure needs to be recognized, not just the cold treated.");
    return {died, cause, notes, correct: s.pi === "ALOC" || s.pi === "HEAT", truth: "Myxedema coma (severe decompensated hypothyroidism)"};},
},

addisonianCrisisCollapse: {cat: "medical", id: "ENDO-110", pronouns: "she", title: "Female, 47. Weakness and collapse, known adrenal insufficiency.",
  limit: 1000, transport: 420,
  bystanders: "Her husband says she's had a stomach bug and has been unable to keep her steroid pills down.",
  units: [{at: 360, level: "paramedic", name: "Medic 9"}],
  dispatch: ["47F, weakness, near-collapse.", "Known adrenal insufficiency (Addison's) per husband."],
  update: [],
  impression: "Lying on the couch, profoundly weak, hypotensive-appearing, nauseated, skin notably darker in creases and scars than her husband says is normal.",
  imps: ["SHOK", "HOTN"],
  condition: "addisonianCrisis",
  patient: {age: 47, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Husband: \"She has Addison's disease, takes steroids for it every day. She's had a stomach bug for two days and hasn't been able to keep her pills down.\"", kind: "pt",
      evid: "A known Addisonian patient unable to take her steroid replacement during an illness is the specific, classic trigger for adrenal crisis — the body cannot mount the extra cortisol an illness normally demands.", find: "OPQRST: known adrenal insufficiency, steroid doses missed due to vomiting illness."}),
    sample: () => ({say: "Husband: \"Hydrocortisone daily, that's her main one. No other health problems.\"", kind: "pt", find: "SAMPLE: daily hydrocortisone (missed doses), otherwise healthy."}),
    skin: () => ({say: "Notably darker pigmentation in her skin folds and old scars than would be expected.", kind: "obs",
      evid: "Hyperpigmentation from chronically elevated ACTH is a real, specific finding in primary adrenal insufficiency (Addison's disease), distinct from other causes of shock.", find: "Skin: hyperpigmented creases and scars, consistent with chronic primary adrenal insufficiency."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveFluid = s.given.saline;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Adrenal crisis, with its real, fluid-refractory hypotension from cortisol deficiency, progressed without recognition — the definitive treatment (IV steroids) is not in this drug box, but nothing was done to support her in the meantime either.";
    if (gaveFluid) notes.push("IV fluids were given — appropriate, though worth knowing this shock is real but PARTIALLY fluid-refractory: cortisol deficiency itself blunts the blood vessels' response to fluid and pressors, so this patient may not fully respond the way a typical hypovolemic patient would.");
    else notes.push("No IV fluid was given to a hypotensive, profoundly weak patient — volume support is still worth giving even though it will only partially help here.");
    notes.push("The real, definitive treatment — IV hydrocortisone — is not in this drug box. The field job is recognizing the specific trigger (missed steroids during illness), supporting what you can, and getting her to a facility that can give the actual antidote fast.");
    return {died, cause, notes, correct: s.pi === "SHOK" || s.pi === "HOTN", truth: "Addisonian (adrenal) crisis from missed steroid replacement during illness"};},
},

siadhConfusedHyponatremia: {cat: "medical", id: "ENDO-111", pronouns: "he", title: "Male, 68. Confusion, recently started a new medication.",
  limit: 900, transport: 420,
  bystanders: "His wife says he started a new antidepressant a couple weeks ago and has seemed off since.",
  units: [{at: 360, level: "paramedic", name: "Medic 2"}],
  dispatch: ["68M, new confusion.", "Recently started a new medication per wife."],
  update: [],
  impression: "Sitting in a chair, mildly confused, slow to answer, otherwise looks well — no fever, no distress.",
  imps: ["ALOC"],
  condition: "siadh",
  patient: {age: 68, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Wife: \"He started a new antidepressant about two weeks ago, and the last few days he's just seemed foggy and off.\"", kind: "pt",
      evid: "A gradual, non-focal confusion starting after a new medication (SSRIs are a well-documented SIADH cause) fits a dilutional hyponatremia picture rather than a stroke or infection.", find: "OPQRST: gradual confusion over days, new medication started ~2 weeks ago, no fever."}),
    sample: () => ({say: "Wife: \"Sertraline, started recently for his mood. Otherwise healthy.\"", kind: "pt",
      evid: "SSRIs are a well-documented, common cause of SIADH, especially in older adults.", find: "SAMPLE: sertraline (recently started), otherwise healthy."}),
    loc: () => ({say: "Awake, mildly confused, no focal weakness, no fever, no meningismus.", kind: "obs", find: "Neuro: mild global confusion, no focal deficit, afebrile."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["A new medication (especially an SSRI) preceding a gradual, non-focal confusion in an older adult is a real, common, identifiable pattern for SIADH-driven hyponatremia — worth flagging specifically at handoff since the fix (fluid restriction, addressing the cause) is very different from a stroke workup.",
      "There's no field lab to confirm sodium here — the job is recognition from the history and a clean exam that rules out the more dangerous mimics (stroke, infection), then transport for lab confirmation and correction."],
    correct: true, truth: "SIADH-induced hyponatremia from a new SSRI"}),
},

diabetesInsipidusThirsty: {cat: "medical", id: "ENDO-112", pronouns: "she", title: "Female, 35. Extreme thirst and urination since a recent head injury.",
  limit: 900, transport: 420,
  bystanders: "Her husband says she's been drinking constantly and running to the bathroom every twenty minutes since her fall last week.",
  units: [{at: 360, level: "paramedic", name: "Medic 5"}],
  dispatch: ["35F, extreme thirst and urination.", "Recent head injury (fall) per husband."],
  update: [],
  impression: "Sitting with a large water bottle in hand, appears dehydrated despite constant drinking, mildly fatigued.",
  imps: ["ALOC", "HOTN"],
  condition: "diabetesInsipidus",
  patient: {age: 35, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I fell and hit my head pretty hard about a week ago. Since then I'm SO thirsty all the time, and I can't stop peeing — like every twenty minutes, huge amounts.\"", kind: "pt",
      evid: "Extreme thirst and massive urine output beginning after a head injury is the classic setup for central diabetes insipidus — the pituitary stalk is a real, documented site of post-traumatic injury.", find: "OPQRST: extreme thirst and polyuria beginning after a head injury ~1 week ago."}),
    sample: () => ({say: "\"No medications, no diabetes — my sugar's always been normal. Just this thirst and the bathroom trips since the fall.\"", kind: "pt",
      evid: "A normal glucose rules out diabetes mellitus as the cause of the polyuria/polydipsia, pointing instead at diabetes INSIPIDUS — a completely different mechanism despite the similar name.", find: "SAMPLE: no diabetes mellitus history, recent head trauma."}),
    glucometer: () => ({say: "Glucometer reads 94 mg/dL — normal.", kind: "obs", find: "Glucose: 94 mg/dL, normal."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Extreme thirst and massive urination with a NORMAL glucose, starting after a head injury, points at central diabetes insipidus (a pituitary/ADH problem) rather than diabetes mellitus — the names sound similar but the mechanisms are completely different.",
      "The real risk here is dehydration and the resulting electrolyte derangement (hypernatremia) if fluid intake can't keep pace — IV fluids and prompt transport for hormone replacement (desmopressin) matter."],
    correct: true, truth: "Central diabetes insipidus following traumatic brain injury"}),
},

refeedingSyndromeCall: {cat: "medical", id: "ENDO-113", pronouns: "he", title: "Male, 31. Weakness after resuming eating following prolonged starvation.",
  limit: 900, transport: 420,
  bystanders: "His sister, who has been helping him recover from a prolonged illness with poor intake, is worried about new weakness.",
  units: [{at: 360, level: "paramedic", name: "Medic 3"}],
  dispatch: ["31M, new weakness, recently started eating again after a prolonged illness.", "Poor nutritional intake for weeks per sister."],
  update: [],
  impression: "Lying on the couch, generally weak, mildly short of breath, sister mentioning he'd barely eaten in weeks until a few days ago.",
  imps: ["DYSR", "RDOT"],
  condition: "refeedingSyndrome",
  patient: {age: 31, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Sister: \"He barely ate anything for weeks while he was sick, and a few days ago he finally started eating normally again. Now he's suddenly weak, more than before.\"", kind: "pt",
      evid: "New weakness appearing specifically AFTER nutrition resumes in a previously starved patient — not during the starvation itself — is the classic refeeding syndrome timeline.", find: "OPQRST: prolonged poor intake, weakness beginning after nutrition resumed."}),
    sample: () => ({say: "Sister: \"No medications, no other health problems, just weeks of barely eating during his illness.\"", kind: "pt", find: "SAMPLE: no prior history, prolonged malnutrition preceding presentation."}),
    heart: () => ({say: "Irregular in a way that concerns you — worth getting him on the monitor.", kind: "crit",
      evid: "Real, dangerous electrolyte shifts (potassium and magnesium moving sharply intracellular as insulin surges with refeeding) can produce genuine cardiac irritability and arrhythmia.", find: "Heart: irregular rhythm noted, monitor placement warranted."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Refeeding-syndrome electrolyte shifts (potassium and magnesium driven sharply intracellular) produced a lethal arrhythmia that was never recognized or monitored for.";
    notes.push("Weakness appearing specifically AFTER nutrition resumes in a previously starved patient is the pattern to recognize — the timing is the diagnosis, not just 'he's still recovering.'");
    notes.push("Cardiac monitoring matters here: the real danger is a genuine arrhythmia from potassium and magnesium shifting sharply into cells as refeeding triggers an insulin surge — recognition and monitoring, not a specific field drug, is the job.");
    return {died, cause, notes, correct: s.pi === "DYSR" || s.pi === "RDOT", truth: "Refeeding syndrome following prolonged malnutrition"};},
},

hyperammonemiaConfused: {cat: "medical", id: "ENDO-114", pronouns: "she", title: "Female, 55. Progressive confusion and rapid breathing, history of cirrhosis.",
  limit: 900, transport: 420,
  bystanders: "Her husband noticed her getting more confused and breathing faster over the last few hours.",
  units: [{at: 360, level: "paramedic", name: "Medic 7"}],
  dispatch: ["55F, progressive confusion.", "History of liver cirrhosis per husband."],
  update: [],
  impression: "Sitting up, confused and slow to answer, breathing noticeably faster than expected, husband describing a steady decline over hours.",
  imps: ["ALOC", "RDOT"],
  condition: "hyperammonemia",
  patient: {age: 55, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Husband: \"She's had liver problems for years, but she's gotten steadily more confused over the last several hours, and her breathing looks different too.\"", kind: "pt",
      evid: "Progressive confusion with tachypnea in a known liver-disease patient is consistent with ammonia toxicity — the tachypnea reflects real central respiratory drive from the associated cerebral effects, not a primary lung problem.", find: "OPQRST: known liver disease, hours of progressive confusion, new tachypnea."}),
    sample: () => ({say: "Husband: \"She's supposed to take lactulose but it upsets her stomach so she skips it a lot.\"", kind: "pt",
      evid: "Inconsistent lactulose use — the actual medication that lowers ammonia — is a specific, identifiable driver of this presentation.", find: "SAMPLE: known liver disease, inconsistent lactulose adherence."}),
    loc: () => ({say: "Awake but globally slow and confused, no focal weakness, no fever.", kind: "obs", find: "Neuro: global confusion, no focal deficit, afebrile."}),
  },
  resolve: () => ({died: false, cause: "",
    notes: ["Progressive, GLOBAL confusion with new tachypnea in a patient with known liver disease and inconsistent lactulose use points at ammonia toxicity — a real, reversible metabolic cause, not a stroke or primary respiratory illness.",
      "There's no field ammonia-lowering treatment — the job is recognition, an accurate history (especially the missed lactulose), and transport for the real treatment."],
    correct: true, truth: "Hyperammonemia from hepatic failure, worsened by inconsistent lactulose use"}),
},

copdExacerbationCall: {cat: "medical", id: "RESP-036", pronouns: "he", title: "Male, 66. Worsening cough and shortness of breath, known COPD.",
  limit: 1000, transport: 420,
  bystanders: "His wife says his cough has gotten much worse and thicker over the last three days.",
  units: [{at: 360, level: "emt", name: "BLS 9"}],
  dispatch: ["66M, worsening shortness of breath, known COPD.", "Increased sputum production per wife."],
  update: [],
  impression: "Sitting forward on the edge of his chair, working harder to breathe than his baseline per his wife, coughing up thick yellow sputum.",
  imps: ["SOBB", "RDOT"],
  condition: ["copd", "copdExacerbation"],
  patient: {age: 66, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"My breathing's been bad for years, but the last three days it's been so much worse, and I'm coughing up thick yellow gunk I haven't had before.\"", kind: "pt",
      evid: "An increase in sputum volume and purulence (thick, discolored) on top of known COPD is the specific, guideline-defined pattern of an infective acute exacerbation, not just ordinary chronic symptoms.", find: "OPQRST: known COPD, acute worsening over 3 days, increased purulent sputum."}),
    sample: () => ({say: "\"Albuterol and a steroid inhaler, home oxygen at night. No allergies.\"", kind: "pt", find: "SAMPLE: known COPD on inhalers and home O2, no allergies."}),
    // MEASURED, not scripted (see conditions.js copdExacerbation:
    // pat.broncho climbs to a 0.55 ceiling, real but partial bronchodilator
    // response — see this scenario's own resolve() note). Reads
    // pat.effectiveBroncho live (queue item F7).
    lungs: (s) => {
      const eb = s.patient?.effectiveBroncho ?? 0.25;
      if (eb < 0.2) return {say: "Wheeze easing, working a little less hard.", kind: "warn", find: "Lungs: wheeze improving, less accessory muscle use."};
      return {say: "Diffuse wheeze, prolonged expiratory phase, using accessory muscles to breathe.", kind: "crit", find: "Lungs: diffuse wheeze, prolonged expiration, accessory muscle use."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveAlbuterol = s.given.albuterol;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "An acute COPD exacerbation progressed to respiratory failure without adequate bronchodilator support and ventilatory assistance.";
    if (gaveAlbuterol) notes.push("Albuterol was given — appropriate, even though this exacerbation is more infection/secretion-driven than a pure asthma-style bronchospasm; some reversible component still responds.");
    else notes.push("No bronchodilator was given to a wheezing, working-hard COPD patient — even in an infective exacerbation, there's a real reversible bronchospastic component worth treating.");
    notes.push("The increase in sputum VOLUME and PURULENCE (not just the breathing difficulty) is what marks this as an infective exacerbation specifically — worth including in the handoff, since it points toward antibiotics being part of the hospital treatment plan.");
    return {died, cause, notes, correct: s.pi === "SOBB" || s.pi === "RDOT", truth: "Acute infective exacerbation of COPD"};},
},

toxicInhalationChlorine: {cat: "medical", id: "RESP-037", pronouns: "he", title: "Male, 34. Pool-chemical accident, coughing, can't catch his breath.",
  limit: 900, transport: 420,
  bystanders: "The pool manager, keeping his distance. \"He mixed the wrong chemicals cleaning the equipment room — there was a cloud of greenish-yellow gas. We got him out and opened everything up, but he was in there a couple minutes before anyone noticed.\"",
  units: [{at: 300, level: "paramedic", name: "Medic 4"}],
  dispatch: ["34M, chemical exposure at a pool equipment room.", "Patient self-extricated, coughing, short of breath."],
  update: ["\"His breathing sounds worse than when we first got here.\""],
  impression: "Coughing hard, eyes red and watering, sitting forward working to breathe. You can hear him wheeze from across the room.",
  imps: ["SOBB", "RDOT"],
  condition: "toxicInhalationChlorine",
  patient: {age: 34, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Mixed... bleach and something else, I think... couple minutes before I got out... it burns, my chest, my eyes...\"", kind: "pt",
      evid: "A pool-chemical mixing accident (bleach/acid combinations release chlorine gas) with a several-minute exposure before extrication fits a real, dose-dependent irritant-gas inhalation injury.", find: "OPQRST: sudden onset during a chemical mixing accident, several minutes of exposure, burning chest/eye pain, progressively worse breathing."}),
    sample: () => ({say: "\"No asthma, no breathing problems before this. I feel like I'm breathing through a straw.\"", kind: "pt",
      find: "SAMPLE: no prior respiratory history — this is a new, acute irritant-gas exposure, not a baseline condition flaring."}),
    // MEASURED, not scripted (see conditions.js): reads v.spo2/v.rr live.
    // Real, moderate-severe bronchospasm with real desaturation, matching
    // this condition's own honest, measured trajectory.
    lungs: (s, v) => {
      if (v.spo2 < 94) return {say: `Diffuse wheeze everywhere, both sides, working hard — sat's reading ${v.spo2}%.`, kind: "crit",
        find: `Lungs: diffuse wheeze, poor air movement, SpO2 ${v.spo2}%.`, evid: "Diffuse wheeze with real, measurable desaturation after a witnessed irritant-gas exposure is a severe chemical bronchospasm, not routine anxiety-driven hyperventilation."};
      return {say: `Wheeze both sides, sat ${v.spo2}%.`, kind: "warn", find: `Lungs: wheeze, SpO2 ${v.spo2}%.`};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const bronchodil = (s.given.albuterol || 0) + (s.given.ipratropium || 0);
    const o2 = (s.done.o2nrb || 0) + (s.done.o2nc || 0) + (s.done.cpap || 0) + (s.done.bvm || 0);
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Untreated irritant-gas bronchospasm progressed to respiratory failure.";
    if (bronchodil) notes.push("Bronchodilator given — the real, reachable treatment here. Chlorine gas causes a genuine, acute bronchospasm through the same airway pathway ordinary asthma does, and it responds the same way.");
    else notes.push("No bronchodilator given. This isn't just irritation — the airway smooth muscle is genuinely constricted, and that responds to the same treatment any other bronchospasm does.");
    if (o2) notes.push("Oxygen given for the real, measured desaturation — appropriate.");
    else notes.push("Oxygen was never given despite a real, measured drop in SpO2 — this patient needed supplemental O2.");
    notes.push("Chlorine's chemical reaction with airway water can also cause a DELAYED, non-cardiogenic pulmonary edema over the following hours, well past this call — worth flagging clearly in the handoff even though it isn't yet visible on scene.");
    return {died, cause, notes, correct: s.pi === "SOBB" || s.pi === "RDOT", truth: "Chlorine gas inhalation — irritant-gas bronchospasm, treated the same as any other bronchospasm, with a real risk of delayed pulmonary edema"};},
},

excitedDeliriumAgitated: {cat: "medical", id: "MISC-042", pronouns: "he", title: "Male, 28. Combative, hyperthermic, superhuman strength reported by police.",
  limit: 900, transport: 360,
  bystanders: "Police are already on scene; they report he's been running through traffic, shouting incoherently, and required several officers to control.",
  units: [{at: 300, level: "paramedic", name: "Medic 1"}],
  dispatch: ["28M, combative, agitated, police on scene.", "Reportedly ripped his own shirt off despite cold weather."],
  update: ["Officer: \"He's still fighting the cuffs, and he feels like he's burning up.\""],
  impression: "Restrained, still struggling, shirtless despite the cold, drenched in sweat, incoherent, breathing hard and fast.",
  imps: ["ODPO", "DYSR"],
  condition: "excitedDelirium",
  patient: {age: 28, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Officer: \"He was running through traffic yelling, tore his own shirt off in this weather, and it took several of us to get him restrained. He's incoherent, not responding to anything we say.\"", kind: "pt",
      evid: "Profound agitation, inappropriate undressing despite cold weather, incoherence, and a prolonged physical struggle together are the specific presentation this syndrome is named for — a real, severe sympathomimetic/catecholamine crisis, not simple non-compliance.", find: "OPQRST: severe agitation, inappropriate disrobing, incoherent, prolonged physical struggle."}),
    sample: () => ({say: "No history available — the patient cannot participate in a SAMPLE history right now.", kind: "pt", find: "SAMPLE: unobtainable."}),
    skin: () => ({say: "Hot, profusely diaphoretic, heart racing even now that he's restrained.", kind: "crit",
      evid: "Genuine hyperthermia and a persistently extreme heart rate reflect a real, dangerous hypermetabolic/catecholamine state — this patient has a genuine, measurable risk of sudden cardiac arrest from the physiology itself, not from the restraint.", find: "Skin hot, profusely diaphoretic; heart rate remains extreme despite restraint."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const cooled = s.done.activeCooling || s.done.moveToShade;
    const sedated = s.given.midazolam || s.given.ketamine; // a previous item in the queue: lorazepam/diazepam do not exist in this formulary
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe catecholamine-driven hyperthermia and cardiac irritability progressed to a fatal arrhythmia — a real, physiologic risk this presentation carries independent of the restraint itself.";
    if (sedated) notes.push("Sedation was given — the correct priority once this is recognized as a medical emergency: lowering the catecholamine drive is the actual treatment, not further physical struggle.");
    else notes.push("No sedation was given to a patient in a severe, prolonged catecholaminergic crisis — chemical sedation (once safely possible) is the real treatment lever here, more than continued physical restraint alone.");
    if (cooled) notes.push("Active cooling was attempted — appropriate, since the hyperthermia here is genuinely dangerous and driven by real, sustained muscular hyperactivity.");
    notes.push("This is a genuine medical emergency (a severe sympathomimetic/catecholamine crisis with real hyperthermia and cardiac irritability) that happens to present as combative behavior — the underlying physiology, not the restraint, is what carries the real risk of sudden death, and treating it as a medical crisis rather than purely a safety problem is the actual point.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "DYSR", truth: "Excited delirium syndrome (severe catecholamine/sympathomimetic crisis)"};},
},

esophagealVaricesBleed: {cat: "medical", id: "ABD-026", pronouns: "he", title: "Male, 54. Vomiting large amounts of blood, known liver disease.",
  limit: 900, transport: 420,
  bystanders: "His wife called immediately after he vomited a large amount of blood.",
  units: [{at: 300, level: "paramedic", name: "Medic 2"}],
  dispatch: ["54M, vomiting blood.", "Known liver cirrhosis per wife."],
  update: ["Wife: \"He just did it again, there's so much blood.\""],
  impression: "Pale, diaphoretic, actively vomiting bright red blood into a basin, visibly frightened.",
  imps: ["SHOK", "ABDP"],
  condition: "esophagealVaricealHemorrhage",
  patient: {age: 54, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It just came on suddenly, I threw up a huge amount of blood, bright red, twice now.\"", kind: "pt",
      evid: "Sudden, large-volume bright-red hematemesis in a known cirrhotic is the classic, dangerous presentation of a bleeding esophageal varix — portal hypertension driving rapid, high-volume hemorrhage.", find: "OPQRST: sudden, large-volume hematemesis, known liver cirrhosis, recurrent."}),
    sample: () => ({say: "Wife: \"Cirrhosis from years of drinking. He takes a water pill for it, that's all.\"", kind: "pt", find: "SAMPLE: known cirrhosis (portal hypertension), on a diuretic, no anticoagulants."}),
    airwayLook: () => ({say: "He's vomiting again right now — positioning him to protect his airway is the immediate priority.", kind: "crit",
      evid: "Active hematemesis is a genuine airway threat from aspiration, not just a circulation problem — this is the real, distinct danger of this bleed source compared to other GI hemorrhage.", find: "Active hematemesis in progress — real aspiration risk, airway management is time-critical."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Massive variceal hemorrhage with airway compromise from active hematemesis progressed without airway protection or adequate volume support — there is no field hemostasis for a bleed inside the esophagus.";
    notes.push("Active hematemesis is an airway problem as much as a circulation one — positioning (recovery position/lateral) and suction to protect the airway from aspiration matters just as much as treating the shock.");
    notes.push("There's no field procedure that stops this bleeding — no tourniquet, no packing reaches inside the esophagus. IV volume support and minimizing scene time to a facility that can perform emergency endoscopy is the entire field job.");
    return {died, cause, notes, correct: s.pi === "SHOK" || s.pi === "ABDP", truth: "Bleeding esophageal varices from portal hypertension (cirrhosis)"};},
},

allergicReactionModerateCall: {cat: "medical", id: "ALLERGY-013", pronouns: "she", title: "Female, 26. Hives and mild wheeze after a bee sting.",
  limit: 700, transport: 360,
  bystanders: "Her friend saw the sting happen about fifteen minutes ago.",
  units: [],
  dispatch: ["26F, allergic reaction after a bee sting.", "Conscious, alert, breathing without severe distress."],
  update: [],
  impression: "Sitting on a park bench, visible hives spreading across her arms, mild audible wheeze, alert and anxious but talking in full sentences.",
  imps: ["ALRX", "SOBB"],
  condition: "allergicReactionModerate",
  // Real dispatch-location bias (src/data/maps.js/mapGraph.js): a bee
  // sting is likelier outdoors, but not exclusively — soft weight, not a
  // hard constraint, since a sting can happen anywhere (a bee that got
  // inside a house, a business's loading dock, etc.).
  locWeights: {park: 6, house: 2, business: 1, school: 1},
  patient: {age: 26, gender: "female"},
  clothing: {top: "short", bottom: "short", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"A bee stung me maybe fifteen minutes ago, and now I've got these hives everywhere and my chest feels a little tight.\"", kind: "pt",
      evid: "Hives and mild wheeze after a known sting, with NO hypotension and no severe respiratory distress, is a moderate (Grade 2) allergic reaction — real and needing treatment, but not yet anaphylaxis.", find: "OPQRST: bee sting ~15 min ago, diffuse hives, mild chest tightness/wheeze, talking in full sentences."}),
    sample: () => ({say: "\"No known allergies before this, no medications. First time this has happened.\"", kind: "pt", find: "SAMPLE: no known prior allergy history, no medications."}),
    lungs: () => ({say: "Mild expiratory wheeze, good air movement, no accessory muscle use, speaking in full sentences.", kind: "obs",
      evid: "Mild wheeze with preserved air movement and no accessory muscle use or hemodynamic compromise is the real, mechanistic distinction from anaphylaxis — this patient is not in shock or severe respiratory failure.", find: "Lungs: mild wheeze, good air movement, no distress; vitals hemodynamically stable."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveEpi = s.given.epiIM || s.given.epiAuto;
    const gaveAntihistamine = s.given.diphen;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something else in this call's management went wrong — a moderate allergic reaction without hypotension or severe respiratory compromise does not kill a patient over the span of a single call.";
    if (gaveEpi) notes.push("Epinephrine was given here. Worth a second look: this patient is hemodynamically stable with only mild wheeze and full sentences — not the hypotension/severe-hypoxia picture epinephrine's real risk profile is worth accepting for. An antihistamine (and close monitoring for progression) fits this severity better.");
    else if (gaveAntihistamine) notes.push("An antihistamine was given — a reasonable, proportionate treatment for this severity of reaction, reserving epinephrine for if/when this progresses toward true anaphylaxis.");
    else notes.push("No treatment was given for a real, symptomatic allergic reaction — even a moderate one benefits from an antihistamine and close monitoring for progression.");
    notes.push("The skill on this call is grading severity correctly: hives and mild wheeze WITHOUT hypotension or severe respiratory distress is real but not yet anaphylaxis — matching the treatment to the actual severity, not the worst-case reflex, is the point.");
    return {died, cause, notes, correct: s.pi === "ALRX", truth: "Moderate (Grade 2) allergic reaction to a bee sting — not yet anaphylaxis"};},
},

// Queue item 58. Grade 1 (skin/mucosal only) — no wheeze, no swelling, no
// hemodynamic change, matching allergicReactionMild's own real mechanism
// (conditions.js: pat.urticaria, a small histamine-driven vasodilation
// term). The real teaching point is the OTHER direction from anaph/
// allergicReactionModerateCall: this patient does not need epinephrine OR
// close monitoring for progression toward anaphylaxis, just an antihistamine
// and reassurance, and treating it as more than it is is itself a miss.
allergicReactionMildCall: {cat: "medical", id: "ALLERGY-014", pronouns: "he", title: "Male, 31. Itchy hives after a new laundry detergent.",
  limit: 600, transport: 300,
  bystanders: "His roommate, who switched detergents this week and feels awful about it.",
  units: [],
  dispatch: ["31M, itchy rash, called it in himself.", "Conscious, alert, talking normally."],
  update: [],
  impression: "Sitting up on the couch, scratching his forearms, raised red welts scattered across both arms and his neck. Breathing easily, talking in full sentences, no distress.",
  imps: ["ALRX"],
  condition: "allergicReactionMild",
  locWeights: {house: 8, business: 1},
  patient: {age: 31, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Started about half an hour ago, right after I put on a shirt from the wash. It just itches, that's it. No trouble breathing, nothing.\"", kind: "pt",
      evid: "Isolated pruritus/urticaria with no respiratory or hemodynamic involvement is a Grade 1 (skin/mucosal only) allergic reaction — real, but not progressing toward anaphylaxis.", find: "OPQRST: hives/itching ~30 min after new detergent exposure, no breathing complaint."}),
    sample: () => ({say: "\"No allergies I know of. No medications.\"", kind: "pt", find: "SAMPLE: no known prior allergy history, no medications."}),
    lungs: () => ({say: "Clear and equal, no wheeze, easy and unlabored.", kind: "obs",
      evid: "Clear lungs and no work of breathing rule out any bronchospasm component — skin/mucosal only.", find: "Lungs: clear, no wheeze, no distress."}),
    skin: () => ({say: "Raised, red, well-demarcated welts across both forearms and the neck — classic urticaria. Warm, dry, no swelling of the lips, tongue or airway.", kind: "obs",
      evid: "Urticaria with no angioedema, confirming skin/mucosal-only involvement.", find: "Skin: diffuse urticaria, no angioedema."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveEpi = s.given.epiIM || s.given.epiAuto;
    const gaveAntihistamine = s.given.diphen;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something else in this call's management went wrong — isolated urticaria with no respiratory or hemodynamic compromise does not kill a patient over the span of a single call.";
    if (gaveEpi) notes.push("Epinephrine was given for isolated hives with clear lungs, no swelling and stable vitals — real, but real overtreatment. Epinephrine's own risk profile (tachyarrhythmia, hypertension) is only worth accepting once there's actual systemic or airway involvement to justify it.");
    else if (gaveAntihistamine) notes.push("An antihistamine was given — the correct, proportionate treatment for isolated urticaria/pruritus with no other finding.");
    else notes.push("No treatment given for a real, symptomatic (if minor) allergic reaction. An antihistamine is indicated even for a mild, isolated reaction.");
    notes.push("The skill on this call is recognizing when NOT to escalate: hives alone, with clear lungs, no angioedema and stable vitals, is Grade 1 — the antihistamine is the whole job, not a bridge to epinephrine.");
    return {died, cause, notes, correct: s.pi === "ALRX", truth: "Mild (Grade 1) allergic reaction — isolated urticaria/pruritus, skin/mucosal only"};},
},

// Queue item 66. TP 1239/1239-P (Dystonic Reaction) — real acute dystonic
// reaction, previously undetectable (no condition existed at all). Patient
// presents WITH an already-established reaction from an antiemetic dose
// given before EMS arrival (matching TP 1239's own framing and this queue
// item's original filing: the protocol's own base-contact-to-confirm step
// keeps the diagnosis human, not automatic). The teaching point is the real
// stroke-mimic differential (actions.js's strokeScreen exam) and the real
// diphenhydramine mechanism, not a scripted "give Benadryl" prompt.
acuteDystonicReactionCall: {cat: "medical", id: "NEURO-014", pronouns: "she", title: "Female, 24. Neck twisted to one side, won't straighten.",
  limit: 900, transport: 420,
  bystanders: "Her mother, who says she was given \"a shot for nausea\" at urgent care about an hour ago.",
  units: [],
  dispatch: ["24F, neck spasm, family worried it's a stroke.", "Conscious, alert, in obvious distress."],
  update: [],
  impression: "Sitting rigidly upright, neck twisted hard to the left and won't release, jaw forced open, eyes rolled upward. Speaking in a strained, dysarthric voice but making sense.",
  imps: ["DYST"],
  condition: "acuteDystonicReaction",
  locWeights: {house: 8, business: 1},
  patient: {age: 24, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It started right after we got home from urgent care, maybe forty minutes ago. My neck just... locked. It won't turn back and my jaw hurts.\"", kind: "pt",
      evid: "Onset within an hour of a dopamine-antagonist antiemetic dose is the classic timing for an acute dystonic reaction — this is a real, recognizable drug adverse effect, not a mystery presentation.", find: "OPQRST: sustained neck/jaw spasm began ~40 min after an antiemetic injection at urgent care."}),
    sample: () => ({say: "\"They gave me a shot for nausea. I don't know the name. No other medications, no allergies.\"", kind: "pt", find: "SAMPLE: antiemetic injection ~1 hour prior for nausea, no known drug allergy."}),
    loc: () => ({say: "Alert and oriented, answering questions appropriately despite the spasm.", kind: "obs", find: "AVPU: alert, oriented x4."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveDiphen = s.given.diphen;
    const gaveStrokeWorkup = s.done.strokeScreen;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something else in this call's management went wrong — an isolated dystonic reaction, with no airway or hemodynamic compromise, does not kill a patient over the span of a single call.";
    if (gaveDiphen) notes.push("Diphenhydramine was given — the correct, real first-line field treatment. Its anticholinergic activity restores the striatal dopamine-acetylcholine balance the antiemetic's D2 blockade disrupted.");
    else notes.push("No diphenhydramine was given for a real, symptomatic dystonic reaction. It is indicated here and TP 1239 requires base contact to confirm, but the treatment itself is not optional once confirmed.");
    if (gaveStrokeWorkup) notes.push("A stroke screen was run — the right call. A negative FAST with a sustained, involuntary head/neck spasm is exactly the pattern that separates a dystonic reaction from a true CVA.");
    notes.push("The skill on this call is the differential: sustained involuntary spasm with a NEGATIVE FAST screen and a recent dopamine-antagonist dose is a dystonic reaction, not a stroke — recognizing that avoids an unnecessary stroke-center activation.");
    return {died, cause, notes, correct: s.pi === "DYST", truth: "Acute dystonic reaction — drug-induced (dopamine D2-receptor blockade), a real stroke mimic"};},
},

// Queue item 57. TP 1224/1224-P (Stings/Venomous Bites) — real crotaline
// envenomation, previously undetectable (no condition existed at all). The
// teaching point is deliberately NOT a drug: TP 1224's own text carries no
// field antivenom step, so the correct field job is limb immobilization at
// heart level, marking/timing the swelling margin, and rapid transport
// without agitating the limb (exertion accelerates systemic venom
// absorption) — matching this scenario's own resolve() below.
copperheadBite: {cat: "medical", id: "ENV-014", pronouns: "he", title: "Male, 44. Snakebite while gardening.",
  limit: 900, transport: 420,
  bystanders: "His wife, who saw the snake and got a photo of it on her phone before it left.",
  units: [{at: 300, level: "emt", name: "Engine 14"}],
  dispatch: ["44M, snakebite to the leg.", "Conscious, alert, in pain.", "Wife says it happened in the garden a few minutes ago."],
  update: [],
  impression: "Sitting on the porch steps, gripping his lower right leg. Two puncture marks above the ankle, already swelling, skin darkening around the bite. He is in obvious pain but breathing easily.",
  imps: ["ENVN", "TRMA"],
  condition: "envenomation",
  locWeights: {house: 6, park: 3, business: 1},
  patient: {age: 44, gender: "male"},
  clothing: {top: "short", bottom: "shorts", shoes: true},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I reached into the mulch and it got me right on the ankle. Maybe five minutes ago. Hurts a lot worse than a bug bite, and it's already swelling.\"", kind: "pt",
      evid: "Rapid-onset, disproportionate local pain and swelling within minutes of a bite is the classic crotaline (pit viper) envenomation presentation.", find: "OPQRST: snakebite to ankle ~5 min ago, rapidly worsening local pain and swelling."}),
    sample: () => ({say: "\"No allergies, no meds. My wife got a picture of it — she says it was a copperhead.\"", kind: "pt",
      evid: "A photographed, identified pit viper plus the local findings on exam is enough to treat this as a real envenomation rather than a dry bite.", find: "SAMPLE: no allergies/meds, snake photographed and identified as a copperhead (crotaline)."}),
    skin: () => ({say: "Two puncture wounds above the right lateral malleolus, surrounding tissue swollen and darkening, tense to the touch. No active bleeding.", kind: "warn",
      evid: "Progressive local swelling and ecchymosis around the puncture site is the expected early local-tissue effect of crotaline venom.", find: "Skin: two puncture marks, right ankle, progressive local swelling/ecchymosis."}),
    // Reads v.coag live — the real, progressive venom-driven consumptive
    // coagulopathy this condition's own conditions.js progress() produces,
    // not scripted text (same "live instrument reading" pattern the
    // anaph scenario's lungs/airwayLook probes already established).
    heart: (s, v) => {
      if (v.coag < 85) return {say: "Regular, but there's a fresh bruise spreading at the old IV stick site from earlier — his blood isn't clotting the way it should.", kind: "warn",
        evid: "A falling coagulation reading with new spontaneous bruising is real, developing venom-induced consumptive coagulopathy — the systemic half of this bite, not just the local swelling.", find: "Heart: regular rhythm; new bruising, falling coagulation panel."};
      return {say: `Regular, rate ${v.hr}.`, kind: "obs", find: `Heart: sinus rhythm, rate ${v.hr}.`};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const immobilized = s.done.splint;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A single extremity envenomation, immobilized and transported promptly, does not kill a patient over the span of one call. Something else in this call's management went wrong.";
    if (immobilized) notes.push("The limb was immobilized at heart level, the actual field intervention that matters here — it slows lymphatic/venous spread of venom without a tourniquet's own well-documented harm.");
    else notes.push("The bitten limb was never immobilized. There is no field antivenom to give; splinting the extremity and keeping it still is the one concrete thing this call's treatment could have done.");
    notes.push("There is no field-administrable antivenom for this call to reach for; the real job is recognition, limb immobilization, marking the advancing swelling margin for the receiving hospital, and prompt transport without letting the patient walk on or exert the bitten limb.");
    return {died, cause, notes, correct: s.pi === "ENVN" || s.pi === "TRMA", truth: "Crotaline (pit viper) envenomation — local tissue injury with a real, developing consumptive coagulopathy"};},
},

hyperkalemiaMissedDialysis: {cat: "medical", id: "RENL-001", pronouns: "he", title: "Male, 58. Generalized weakness, on dialysis.",
  limit: 1200, transport: 480,
  bystanders: "His son let you in — says his father missed his dialysis appointment Friday and it's now Monday.",
  units: [{at: 420, level: "paramedic", name: "Medic 11"}],
  dispatch: ["58M, generalized weakness.", "Son reports he's on dialysis, missed his last session.", "Conscious, alert, talking."],
  update: [],
  impression: "Sitting in a recliner, generally weak but alert and answering questions normally — nothing about how he looks explains the son's worry, which is exactly the trap.",
  imps: ["DYSR"],
  condition: "hyperkalemiaMissedDialysis",
  patient: {age: 58, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I've just felt weak and tired since yesterday, that's really it. No pain anywhere.\"", kind: "pt",
      evid: "Vague, nonspecific weakness with no pain is a genuinely unremarkable complaint on its own — the danger here is entirely in the history and the monitor, not in how sick this patient LOOKS.", find: "OPQRST: generalized weakness and fatigue since yesterday, no pain, no other complaint."}),
    sample: () => ({say: "Son: \"He's been on dialysis three days a week for years — kidney failure. He was supposed to go in Friday and just... didn't. Says he felt fine so he skipped it. Today's Monday.\"", kind: "pt",
      evid: "A hemodialysis-dependent patient missing a scheduled session is THE classic, specific, field-identifiable cause of dangerous hyperkalemia — dialysis patients have essentially no other way to clear potassium.", find: "SAMPLE: end-stage renal disease on hemodialysis, missed Friday's session, three days without clearance."}),
    // Reads v.rhythm live — the real peakedT -> wideQRS -> VT progression
    // this condition's own cardiovascular.js state machine already
    // produces, matching ecg.js's own readout text for each state rather
    // than inventing separate narrative for the same finding.
    heart: (s, v) => {
      if (v.rhythm === "VT") return {say: "Wide-complex and very fast on the monitor — this does not look like a stable rhythm anymore.", kind: "crit",
        evid: "Sustained severe hyperkalaemia has degenerated into ventricular tachycardia — the cardiac danger this whole call has been building toward.", find: "Heart: wide-complex tachycardia (VT) on the monitor."};
      if (v.rhythm === "wideQRS") return {say: "The monitor shows a widened QRS complex now — this has gotten worse since you first hooked him up.", kind: "crit",
        evid: "QRS widening is the next step past peaked T waves in the hyperkalaemic ECG progression — the membrane is failing further, and this patient is now at real risk of a lethal rhythm.", find: "Heart: widened QRS complex, progression from the earlier peaked T waves."};
      if (v.rhythm === "peakedT") return {say: "Regular, but the monitor shows tall, peaked, narrow T waves — that's not a normal-looking strip.", kind: "obs",
        evid: "Peaked T waves are the earliest, most reliable bedside sign of clinically significant hyperkalaemia — visible before this patient has any symptom that would otherwise raise suspicion.", find: "Heart: regular rhythm, but peaked T waves on the monitor consistent with hyperkalaemia."};
      return {say: `Regular, rate ${v.hr} — a normal-looking strip now.`, kind: "obs", find: `Heart: sinus rhythm, rate ${v.hr}, ECG changes resolved.`};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const gaveCalcium = s.given.calcium;
    const gaveShiftAgent = s.given.bicarb || s.given.albuterol;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Missed-dialysis hyperkalaemia, silent in how the patient felt but visible on the monitor the entire time, progressed to a lethal rhythm.";
    if (gaveCalcium && gaveShiftAgent) notes.push("Both calcium AND a potassium-shifting agent (bicarb/albuterol) were given — the correct field combination: calcium buys time by stabilising the cardiac membrane (it does NOT lower potassium), while the shifting agent actually starts moving potassium back into cells.");
    else if (gaveCalcium) notes.push("Calcium was given, which was right to give FIRST — but calcium alone does not lower serum potassium, only protects the heart from it temporarily. A shifting agent (bicarb or nebulized albuterol) should follow to actually start bringing the level down.");
    else if (gaveShiftAgent) notes.push("A potassium-shifting agent was given, but calcium was not — in an unstable-looking rhythm, calcium should come FIRST to protect the heart immediately, since the shifting agents take longer to act.");
    else notes.push("Nothing was given for a real, monitor-confirmed hyperkalaemic picture — the weakness alone looked unremarkable, but this patient's ECG was telling a different, urgent story the whole time.");
    notes.push("The real, definitive treatment — dialysis — is not something a field drug box carries. The job here is recognizing a dialysis-dependent patient who missed a session as a specific, high-risk hyperkalaemia cause, treating the monitor rather than how well the patient seems to be talking, and getting him to a facility that can actually dialyze him.");
    notes.push("This patient never looked as sick as his ECG was — hyperkalaemia is a classic case where the monitor, not the patient's affect, is what actually tells you the danger.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Hyperkalemia from a missed hemodialysis session, with a real, monitor-visible cardiac conduction danger despite deceptively mild symptoms"};},
},

// Queue item 40 — the first entry in the standing overdose-condition
// workstream. First Toxicology-category scenario (TOX-001). See
// conditions.js's own rocuroniumOverdose comment for the full mechanism/
// calibration writeup — this scenario's own job is to make the real,
// measured distinguishing findings (conscious but immobile; PERRL despite
// total paralysis, via the default pupils action's own v._cons branch;
// absent reflexes from NMJ blockade, not magnesium) reachable and correctly
// narrated, and to reward fast recognition and ventilation over reaching
// for naloxone.
rocuroniumOverdose: {cat: "medical", id: "TOX-001", pronouns: "he", title: "Male, 34. Given the wrong injection — not breathing, wide awake.",
  limit: 900, transport: 420,
  bystanders: "The clinic's nurse, ashen, still holding the empty vial. \"I grabbed the wrong one. I grabbed the wrong one, oh god.\"",
  units: [{at: 300, level: "paramedic", name: "Medic 7"}],
  dispatch: ["Medical emergency at an outpatient clinic — not breathing.", "Staff report a medication error, just happened."],
  update: [],
  impression: "Flat on the exam table. His eyes are open and tracking you across the room — nothing else about him is moving. No chest rise. No effort. Nothing.",
  imps: ["ODPO", "RARF", "ALOC", "CANT"],
  condition: "rocuroniumOverdose",
  patient: {age: 34, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    // The single most important, most easily missed finding in this whole
    // call: this patient is CONSCIOUS. The default loc action's own
    // v.rr<8 branch would call this "Unresponsive" — clinically wrong here,
    // and the exact trap this condition exists to teach. Reads live off
    // pat.neuromuscularBlock and v._cons rather than the default's rr-only
    // heuristic, since "can't respond" and "isn't conscious" are two
    // entirely different things for this patient.
    loc: (s, v) => {
      const pat = s.patient;
      if (v._cons && v._cons !== "awake") return {say: "No response — eyes closed now, nothing to voice, nothing to pain.", kind: "crit",
        find: "Unresponsive — hypoxic.", evid: "Now genuinely unresponsive, not just paralyzed — the hypoxic window has been open too long."};
      if ((pat?.neuromuscularBlock || 0) > 0.5) return {say: "He doesn't move. Doesn't respond to voice, doesn't respond to pain, can't make a sound. But his eyes are open, and they are locked on yours, following you across the room.", kind: "crit",
        find: "Eyes open and tracking; no voluntary movement, no verbal response, no response to painful stimulus.",
        evid: "Awake and tracking with zero motor response is not a coma picture — this is paralysis with intact consciousness, not altered mental status."};
      return {say: "Awake and oriented, terrified.", kind: "obs"};
    },
    // Deep tendon reflexes — the default action (actions.js) only reads
    // pat.magToxicity, which is 0 here (no magnesium involved). This
    // condition's real cause of absent reflexes is the same neuromuscular-
    // junction mechanism, just a different drug — reading
    // pat.neuromuscularBlock directly instead of leaving the default's
    // "2+ symmetric" fire on a completely flaccid patient.
    neuro: (s) => {const nmb = s.patient?.neuromuscularBlock || 0;
      if (nmb > 0.5) return {say: "Nothing. No patellar reflex, no muscle tone at all — completely flaccid.", kind: "crit",
        find: "DTRs absent, flaccid tone throughout.", evid: "Total flaccid paralysis with absent reflexes and an otherwise normal, reactive pupil is a neuromuscular-blockade picture, not a stroke and not a sedative overdose."};
      return {say: "Reflexes 2+, symmetric. No clonus.", kind: "obs", find: "DTRs 2+ symmetric."};},
    heart: (s, v) => {
      if (v.rhythm === "VT") return {say: "Wide-complex and very fast — this rhythm is not stable.", kind: "crit",
        find: "Heart: wide-complex tachycardia (VT).", evid: "Prolonged hypoxia has provoked a real, dangerous rhythm — this did not have to happen if the airway had been secured sooner."};
      if (v.rhythm === "VF" || v.rhythm === "asystole") return {say: "Nothing you can make out — no organized sound at all.", kind: "crit",
        find: `Heart: no perfusing rhythm (${v.rhythm}).`, evid: "Cardiac arrest from prolonged, unmanaged hypoxia."};
      return {say: `Regular, rate ${v.hr}.`, kind: "obs", find: `Heart: sinus rhythm, rate ${v.hr}.`};
    },
    opqrst: () => ({say: "He cannot answer you. He cannot do anything at all.", kind: "pt",
      evid: "OPQRST unobtainable — total paralysis, not unconsciousness.", find: "OPQRST unobtainable (paralyzed, not unresponsive)."}),
    sample: () => ({say: "The nurse: \"He was here for a joint injection. I meant to give him the sedative — I grabbed the wrong vial off the tray, it was rocuronium, it was RIGHT THERE next to it, I didn't check. This was maybe a minute ago, I called the second I realized.\"", kind: "pt",
      evid: "Witnessed medication error — a paralytic (rocuronium) given in place of a sedative, roughly one minute before EMS contact.", find: "SAMPLE (collateral): witnessed wrong-drug error, rocuronium given ~1 minute ago, NKDA, NPO for the procedure, no other regular medications reported."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A witnessed paralytic overdose with no airway support in time — he was awake for all of it.";
    const bvmDose = (s.doses || []).find(d => ["bvm", "ett", "sga", "vent"].includes(d.id));
    if (bvmDose && bvmDose.at <= 40) notes.push("Ventilatory support within the first 30-40 seconds — recognized fast, and it showed: no real hypoxic dip, no complications.");
    else if (bvmDose && bvmDose.at <= 90) notes.push("Ventilatory support came a little late — there was a real hypoxic dip before you caught up to it, though it recovered.");
    else if (bvmDose) notes.push("Ventilatory support came very late. By the time it started, this patient had been apneic for well over a minute — the kind of delay that can provoke a real, dangerous rhythm on its own, on top of the original problem.");
    else if (!died) notes.push("He was never ventilated. Whatever kept him alive to this point was not you.");
    if (s.given.naloxone_in || s.given.naloxone_im || s.given.naloxone_iv) notes.push("Naloxone was given. It does nothing here — this is not an opioid. Rocuronium is a paralytic; nothing in a naloxone vial touches it. The only treatment for total flaccid paralysis is airway control and ventilation.");
    if (s.given.midazolam) notes.push("Midazolam was given — it will not reverse the paralysis, but it is a genuinely humane, correct move: he was awake and aware through this entire event, and anxiolysis/amnesia is the one real thing the drug box could do for him beyond securing his airway.");
    notes.push("There is no reversal agent for rocuronium in this drug box, and the paralysis will not wear off during this call. The correct endpoint here is a secured, ventilated airway and transport — not a resolved patient.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "RARF", truth: "Rocuronium given in place of a sedative — a witnessed medication error causing total flaccid paralysis with fully intact consciousness"};},
},

// Queue item 40, second and third drugs in the standing overdose-condition
// workstream. See conditions.js's own diltiazemOverdose/metoprololOverdose
// comments for the full mechanism/receptor-antidote writeup and the real,
// measured finding that corrected this scenario's own first draft: at full
// receptor saturation (reached well before the seeded dose's own ceiling),
// this engine produces a real but MODERATE bradycardia/hypotension, not a
// "profound"/barely-palpable one — and atropine is NOT inert, it measurably
// raises rate (an unconditional vagalBlock mechanism) while leaving blood
// pressure essentially untouched. Both probes below teach the real,
// measured trap: atropine helps the rate a little but does nothing for the
// pressure, because it isn't treating the receptor that's actually blocked
// — calcium/glucagon move BOTH.
diltiazemOverdose: {cat: "medical", id: "TOX-002", pronouns: "she", title: "Female, 58. Found down at home, slow pulse.",
  limit: 900, transport: 480,
  bystanders: "Her husband, panicked. \"She said she felt dizzy after breakfast and just... went down. She takes a heart pill, I don't know what.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 12"}],
  dispatch: ["58F, found down, family reports she takes heart medication.", "Slow pulse reported by first responders."],
  update: [],
  impression: "Pale, diaphoretic, lying on the kitchen floor. Slow to respond, mumbling. Radial pulse is present but weak and slow.",
  imps: ["DYSR", "HOTN", "ODPO"],
  condition: "diltiazemOverdose",
  patient: {age: 58, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Husband: \"She has a heart rhythm thing, takes a pill for it every day — diltiazem, I think? I found the bottle almost empty on the counter, it should have had a lot more left. She's been really stressed lately.\"", kind: "pt",
      evid: "A found-empty diltiazem bottle in a patient with a known dysrhythmia history is a strong, specific signal for an intentional or accidental calcium-channel-blocker overdose, not routine rate-control dosing.", find: "SAMPLE (collateral): takes diltiazem daily for a heart rhythm condition; bottle found nearly empty, more pills unaccounted for than a normal day's dose."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "\"Dizzy... everything's so slow...\" She can barely get the words out." : "She doesn't respond to your voice.", kind: "pt",
      find: "OPQRST: gradual onset over the last hour, no chest pain volunteered, associated dizziness and weakness.", evid: "A gradual, hour-scale onset of bradycardia and weakness in a patient on a rate-controlling agent fits an overdose time course, not a sudden cardiac event."}),
    // MEASURED, not scripted (see conditions.js): reads v.hr/v.sbp live.
    // Atropine (given via App.jsx's default heart action or here) raises hr
    // but this probe deliberately reads BOTH numbers so a player watching
    // sbp sees the real gap — rate improves, pressure does not, because
    // atropine has no vascular mechanism at all.
    heart: (s, v) => {
      if (v.hr < 55) return {say: `Slow and weak, rate around ${v.hr}, pressure still reading low at ${v.sbp}.`, kind: "crit",
        find: `Heart: bradycardia, rate ${v.hr}, sbp ${v.sbp}.`, evid: "Bradycardia with a persistently low pressure despite any rate improvement points toward a receptor-level (calcium-channel) cause, not an ordinary vagal bradycardia."};
      if (v.hr < 70) return {say: `Slow, rate around ${v.hr}, pressure ${v.sbp}.`, kind: "obs", find: `Heart: bradycardia, rate ${v.hr}, sbp ${v.sbp}.`};
      return {say: `Rate ${v.hr}, pressure ${v.sbp}.`, kind: "obs", find: `Heart: rate ${v.hr}, sbp ${v.sbp}.`};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Calcium-channel-blocker overdose, with progressive AV-nodal blockade and vasodilation unanswered.";
    if (s.given.atropine && !s.given.calcium) notes.push("Atropine was given — it does raise the rate somewhat (vagal blockade always does, regardless of cause), but it does nothing for the blood pressure. This bradycardia is calcium-channel-blockade at the AV node, and atropine simply isn't treating that mechanism.");
    if (s.given.calcium) notes.push("Calcium chloride was given — the correct first move. It's a real, if partial, antidote here: it competes back some of the blocked calcium channels, improving BOTH rate and blood pressure, which atropine alone cannot do — though it will not fully reverse a large overdose on its own.");
    else if (!died) notes.push("Calcium was never given — the real first-line antidote for a calcium-channel-blocker overdose, and this patient could have used it.");
    notes.push("Definitive care for a serious CCB overdose (high-dose insulin/euglycemia therapy, lipid emulsion) is hospital-level, not a field intervention — the job here is recognizing the overdose (a found-empty bottle, a bradycardia that doesn't fully respond to standard measures) and buying time with calcium and supportive care en route.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "DYSR", truth: "Diltiazem (calcium-channel blocker) overdose — bradycardia and hypotension that atropine only partially treats (rate, not pressure), calcium treats both"};},
},

metoprololOverdose: {cat: "medical", id: "TOX-003", pronouns: "he", title: "Male, 61. Slow, weak, family found empty pill bottles.",
  limit: 900, transport: 480,
  bystanders: "His daughter, on the phone with dispatch the whole time. \"He's been really down since Mom passed. I found his beta-blocker bottle and his aspirin bottle both empty on the nightstand.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 9"}],
  dispatch: ["61M, altered, family found multiple empty pill bottles.", "Possible intentional overdose."],
  update: [],
  impression: "Slumped in a recliner, pale, breathing slow and shallow. Slow to rouse to voice.",
  imps: ["DYSR", "HOTN", "ODPO"],
  condition: "metoprololOverdose",
  patient: {age: 61, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Daughter: \"His metoprolol bottle is empty — it shouldn't be for another two weeks. I don't know how many he took or when, I just found him like this.\"", kind: "pt",
      evid: "An empty beta-blocker bottle found well ahead of its expected refill date, in a patient with a stated recent stressor, is a strong signal for an intentional overdose rather than routine dosing.", find: "SAMPLE (collateral): metoprolol bottle empty ahead of schedule, exact time/amount unknown, recent bereavement and low mood reported by family."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "He mumbles something you can't make out and closes his eyes again." : "No response to your voice.", kind: "pt",
      find: "OPQRST unobtainable/unreliable — depressed level of consciousness.", evid: "An unobtainable history in a found-down patient with an empty beta-blocker bottle is itself part of the picture, not a dead end."}),
    // Same measured hr-vs-sbp contrast as diltiazemOverdose, mirrored for
    // beta-blockade — reads v.hr/v.sbp live.
    heart: (s, v) => {
      if (v.hr < 55) return {say: `Slow, rate around ${v.hr}, weak and thready, pressure still ${v.sbp}.`, kind: "crit",
        find: `Heart: bradycardia, rate ${v.hr}, sbp ${v.sbp}.`, evid: "Bradycardia with a persistently low pressure despite any rate improvement points toward beta-receptor blockade, not ordinary vagal tone."};
      if (v.hr < 70) return {say: `Slow, rate around ${v.hr}, pressure ${v.sbp}.`, kind: "obs", find: `Heart: bradycardia, rate ${v.hr}, sbp ${v.sbp}.`};
      return {say: `Rate ${v.hr}, pressure ${v.sbp}.`, kind: "obs", find: `Heart: rate ${v.hr}, sbp ${v.sbp}.`};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Beta-blocker overdose, with progressive bradycardia and hypotension unanswered.";
    if (s.given.atropine && !s.given.glucagon) notes.push("Atropine was given — it raises the rate somewhat, but does nothing for the blood pressure. Beta-blocker-overdose bradycardia is receptor-mediated, and atropine's vagal-blockade mechanism simply isn't treating that.");
    if (s.given.glucagon) notes.push("Glucagon was given — the correct, textbook antidote. It bypasses the blocked beta receptor entirely through its own separate pathway, producing a real improvement in BOTH rate and blood pressure that atropine alone cannot match — though it is partial and temporary, not curative.");
    else if (!died) notes.push("Glucagon was never given — the real, specific antidote for a beta-blocker overdose, and this patient could have used it.");
    notes.push("A large beta-blocker overdose can ultimately need hospital-level care (high-dose insulin/euglycemia therapy, pacing) beyond what a field drug box provides — the job here is recognizing the overdose from the history (empty bottle, recent stressor, a bradycardia that doesn't fully respond to standard measures) and buying time with glucagon and supportive care en route.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "DYSR", truth: "Metoprolol (beta blocker) overdose — bradycardia and hypotension that atropine only partially treats (rate, not pressure), glucagon treats both"};},
},

atropineOverdose: {cat: "medical", id: "TOX-004", pronouns: "she", title: "Female, 22. Found agitated and confused, flushed and burning hot.",
  limit: 900, transport: 480,
  bystanders: "Her roommate, badly shaken. \"She and some friends were drinking tea they made from a plant in the yard — she said it tasted awful. An hour later she was pulling at her clothes and talking to people who aren't there.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 6"}],
  dispatch: ["22F, altered mental status, agitated.", "Roommate reports a homemade plant tea ingestion about an hour ago."],
  update: [],
  impression: "Flushed, hot, dry skin. Picking at the air and her clothes, mumbling to herself. Not oriented to place or time.",
  imps: ["ODPO", "ALOC", "DYSR"],
  condition: "atropineOverdose",
  patient: {age: 22, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Roommate: \"It was some kind of homemade tea from a plant growing by the fence — tall, with big white trumpet-shaped flowers. She's never done anything like this before, no drugs that I know of.\"", kind: "pt",
      evid: "A homemade tea from a large white-trumpet-flowered plant, an hour before an agitated-delirium presentation with hot, dry, flushed skin, is a classic description of jimsonweed (Datura) — a real anticholinergic-toxidrome ingestion, not a stimulant.", find: "SAMPLE (collateral): ingested a homemade tea from an unidentified flowering plant roughly one hour prior to onset; no other reported drug use."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "She won't answer a direct question, just mutters and swats at something that isn't there." : "She doesn't respond to your voice.", kind: "pt",
      find: "OPQRST unobtainable — patient is delirious, not oriented, and cannot give a reliable history.", evid: "An unobtainable history from an agitated, disoriented patient roughly an hour after an unknown plant ingestion is itself part of the anticholinergic picture."}),
    // No pupil-diameter mechanism exists anywhere in this engine (the same
    // documented limitation already on record for AAA's pulsatile mass /
    // limb ischemia's 6 P's) — mydriasis is narrated here, not modeled.
    pupils: () => ({say: "Both pupils are widely dilated and barely react to light.", kind: "obs",
      find: "Pupils: bilaterally dilated (mydriasis), sluggish light response.", evid: "Fixed, dilated pupils fit the anticholinergic toxidrome (\"blind as a bat\") — distinct from an opioid's pinpoint pupils or a sympathomimetic's reactive ones."}),
    // MEASURED, not scripted (see conditions.js): reads v.hr/pat.metabolicEncephalopathy
    // live. hr is a real but MODEST tachycardia (atropine's own declared
    // vagalBlock coefficient is the ceiling, reached almost immediately —
    // not a dramatic number) — this probe reports it honestly rather than
    // narrating a dramatic one.
    heart: (s, v) => {
      const enceph = s.patient?.metabolicEncephalopathy || 0;
      const skinNote = enceph > 0.3 ? " Skin is hot and bone-dry — no sweat anywhere, despite how flushed and warm she is." : " Skin is warm and flushed.";
      return {say: `Rate ${v.hr}, regular.${skinNote}`, kind: v.hr >= 95 ? "obs" : "pt",
        find: `Heart: rate ${v.hr}, sinus.${enceph > 0.3 ? " Hot, dry (anhidrotic) skin." : ""}`,
        evid: "A tachycardic patient with hot, DRY skin (no sweating despite fever) points toward an anticholinergic cause, not a sympathomimetic one — sympathomimetic toxidromes classically sweat heavily."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Anticholinergic (Datura/atropine-type) poisoning, with progressive hyperthermia and delirium unanswered.";
    notes.push("This is anticholinergic toxicity — \"mad as a hatter, blind as a bat, red as a beet, hot as a hare, dry as a bone, full as a flask.\" The real, distinguishing bedside sign is hot, flushed skin that is completely DRY — no sweating — despite the fever, which separates it from a sympathomimetic (stimulant) overdose, where a patient sweats heavily.");
    notes.push("Physostigmine is the real, specific antidote for this toxidrome — it is not carried in this drug box. The field job here is recognition (the plant ingestion history, dilated pupils, hot-dry-flushed skin, delirium) and supportive care: aggressive external cooling for the hyperthermia, a calm/low-stimulation environment for the agitation, and transport — not a curative field drug.");
    notes.push("Naloxone does nothing here — this isn't an opioid, and nothing in this presentation involves opioid receptors.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "ALOC", truth: "Anticholinergic (Datura/jimsonweed) poisoning — delirium, mydriasis, hot/dry/flushed skin, and a modest tachycardia; no field antidote carried, supportive care and cooling are the real interventions"};},
},

// Lidocaine overdose / local anesthetic systemic toxicity (queue item 40's
// standing overdose-condition workstream, fifth drug — TOX-006). A dental-
// office presentation: an extensive procedure's cumulative local-anesthetic
// dose delivered as an inadvertent intravascular bolus rather than the
// intended slow tissue infiltration — see conditions.js's own comment for
// the full mechanism/measurement writeup (this is the first drug in the
// item-40 workstream whose overdose severity genuinely scales with dose,
// rather than saturating almost immediately the way diltiazem/metoprolol/
// atropine's receptor terms do).
lidocaineOverdose: {cat: "medical", id: "TOX-006", pronouns: "he", title: "Male, 52. Seizing in the dental chair.",
  limit: 900, transport: 480,
  bystanders: "The dentist, badly shaken, still in scrubs. \"We were about halfway through — I'd given him several blocks for the extractions. He said his mouth felt funny, then his lips went numb, and thirty seconds later he was seizing. I've never seen this happen before.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 14"}],
  dispatch: ["52M, seizure at a dental office.", "Onset during a procedure, per staff on scene."],
  update: [],
  impression: "Actively convulsing in the reclined dental chair, staff holding suction nearby. Pale, and the monitor the office had already placed shows a fast, weak pulse.",
  imps: ["SEIZ", "ODPO", "DYSR"],
  condition: "lidocaineOverdose",
  patient: {age: 52, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Dentist: \"He's healthy, no seizure history, no allergies I had on file. This was an extensive case — several nerve blocks over about forty minutes. I think one of the later injections may have gone into a vessel instead of the tissue — that happens sometimes, you can't always tell.\"", kind: "pt",
      evid: "A seizure with no seizure history, beginning within a minute of a local-anesthetic injection during an extensive dental procedure, is the classic presentation of local anesthetic systemic toxicity (LAST) from an inadvertent intravascular injection — not a primary neurologic event.", find: "SAMPLE (collateral): no seizure history, no known allergies; onset within ~1 minute of the most recent local-anesthetic injection during a lengthy multi-block procedure."}),
    opqrst: () => ({say: "He can't answer — he's actively seizing.", kind: "crit",
      find: "OPQRST unobtainable — active generalized convulsive activity.", evid: "An unobtainable history from an actively seizing patient, immediately following a large cumulative local-anesthetic dose, is itself consistent with LAST rather than an unrelated seizure disorder."}),
    // A real, live seizure-activity finding, not the default AVPU text —
    // s.patient.seizing is the same real, engine-driven flag ClinicalEventAlert
    // already edge-detects for the on-screen banner; this probe gives a
    // continuous, re-checkable finding on top of that one-shot alert.
    loc: (s) => (s.patient?.seizing
      ? {say: "Actively convulsing — rhythmic, whole-body movement, not purposeful.", kind: "crit",
         find: "LOC: not assessable, active generalized convulsive seizure activity.", evid: "Ongoing seizure activity in this context is the CNS half of local anesthetic systemic toxicity — a real, mechanism-driven finding, not a one-time event to just wait out."}
      : {say: "Postictal — drowsy, slow to track your voice, but rousable.", kind: "obs",
         find: "LOC: postictal, rousable to voice.", evid: "A postictal patient after a seizure that has genuinely stopped, rather than one still actively convulsing, changes the immediate airway/positioning priority."}),
    // MEASURED, not scripted (see conditions.js): reads v.hr/v.sbp live. The
    // real, two-sided teaching point this probe surfaces on its own: a
    // benzodiazepine (see resolve()) changes nothing about hr/sbp here,
    // because the cardiotoxic component is a completely separate mechanism
    // from the seizure.
    heart: (s, v) => {
      if (v.sbp < 90) return {say: `Fast and weak, rate ${v.hr}, pressure only ${v.sbp} — he looks shocky.`, kind: "crit",
        find: `Heart: rate ${v.hr}, sbp ${v.sbp}, hypotensive.`, evid: "Hypotension this soon after a large local-anesthetic dose, alongside a seizure from the same event, points toward local anesthetic systemic toxicity (LAST) — direct myocardial and conduction-system toxicity, not a separate cardiac event."};
      if (v.hr < 70) return {say: `Rate ${v.hr}, a little slow, pressure ${v.sbp}.`, kind: "obs", find: `Heart: rate ${v.hr}, sbp ${v.sbp}.`};
      return {say: `Rate ${v.hr}, pressure ${v.sbp}.`, kind: "obs", find: `Heart: rate ${v.hr}, sbp ${v.sbp}.`};
    },
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Local anesthetic systemic toxicity, with unmanaged seizure activity and direct cardiotoxicity unanswered.";
    notes.push("This is local anesthetic systemic toxicity (LAST) — an inadvertent intravascular local-anesthetic bolus produces CNS excitation (seizures) and, at a large enough dose, direct myocardial and conduction-system depression, sometimes together rather than one after the other.");
    if (s.given.midazolam) notes.push("Midazolam was given — it genuinely blunts seizure drive through the real anticonvulsant mechanism, but at this dose it will not necessarily stop the seizure outright, and it does nothing at all for the cardiotoxicity. Those are two separate mechanisms with two separate answers.");
    else if (pat && pat.seizing) notes.push("No benzodiazepine was given for an actively seizing patient — midazolam is the correct supportive move here, even knowing it may only blunt, not fully stop, a seizure this severe.");
    notes.push("The real, definitive antidote for severe LAST — IV lipid emulsion (\"intralipid\") — is not carried in this drug box. The field job is airway/seizure management and supportive care en route, not a curative field drug: the cardiotoxicity genuinely does improve on its own over several minutes as the drug redistributes away from the effect site, provided the airway and breathing are protected through the crisis.");
    notes.push("Naloxone does nothing here — this is not an opioid.");
    return {died, cause, notes, correct: s.pi === "SEIZ" || s.pi === "ODPO", truth: "Local anesthetic systemic toxicity (lidocaine overdose) from an inadvertent intravascular dental block — seizure and direct cardiotoxicity from the same event, no curative field antidote carried"};},
},

// Tricyclic antidepressant overdose (queue item 7's own suggested-batch
// list — "tricyclic ... overdose"). Unlike the item-40 workstream this is
// condition-authored (no TCA entry exists in drugs.js/PK_PARAMS — confirmed
// by grep), wired directly through pat.sodiumChannelBlock (the same generic
// handle lidocaine/amiodarone's PK already write, now also read by
// cardiovascular.js's qrsWidth calculation for the first time — see that
// comment and conditions.js's tricyclicOverdose entry for the full
// mechanism/measurement writeup). TOX-007.
tricyclicOverdose: {cat: "medical", id: "TOX-007", pronouns: "she", title: "Female, 29. Empty pill bottle, found slow to respond.",
  limit: 900, transport: 480,
  bystanders: "Her sister, panicked. \"She's been really depressed since the breakup. I found her like this about an hour ago with an empty bottle of her antidepressant next to her — I don't know how many were in it.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 9"}],
  dispatch: ["29F, unresponsive, possible overdose.", "Empty prescription bottle found at scene, per family."],
  update: [],
  impression: "Drowsy, mumbling, slow to track. Skin looks dry and flushed. An empty amber pill bottle is on the nightstand.",
  imps: ["ODPO", "ALOC", "DYSR"],
  condition: "tricyclicOverdose",
  patient: {age: 29, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Sister: \"It's amitriptyline, for her depression. The bottle was full a few days ago — I don't know exactly how many she took, but it's mostly empty now. I think she took them about an hour before I found her.\"", kind: "pt",
      evid: "A large tricyclic antidepressant ingestion roughly an hour prior, with a patient now drowsy and anticholinergic-appearing, is the classic setup for TCA overdose — a real, time-critical toxidrome, not a benign ingestion.", find: "SAMPLE (collateral): amitriptyline (TCA) overdose, quantity unknown, ingested approximately one hour prior to EMS contact."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "She mumbles a word or two but can't really answer you." : "She doesn't respond to your voice.", kind: "pt",
      find: "OPQRST unobtainable — patient is too drowsy/altered to give a reliable history.", evid: "A deteriorating level of consciousness this soon after a large TCA ingestion is itself part of the toxidrome — sedation progressing toward coma is a real, expected part of this course, not a separate problem."}),
    pupils: () => ({say: "Both pupils are dilated and sluggish.", kind: "obs",
      find: "Pupils: bilaterally dilated (mydriasis), sluggish light response.", evid: "Mydriasis fits the anticholinergic component of TCA toxicity (no pupil-diameter mechanism is modeled here — narrated, consistent with atropineOverdose's own documented limitation)."}),
    // MEASURED, not scripted (see conditions.js/cardiovascular.js): reads
    // v.hr/v.sbp/pat.qrsWidth live. QRS width is the real, single most
    // predictive finding here (Boehnert & Lovejoy, NEJM 1985) — this probe
    // reports the actual, currently-modeled value rather than a fixed line.
    heart: (s, v) => {
      const qrs = Math.round((s.patient?.qrsWidth ?? 0.08) * 1000);
      const wide = qrs > 100;
      return {say: `Rate ${v.hr}, pressure ${v.sbp}.${wide ? " The monitor shows a wide, bizarre-looking QRS complex." : ""}`,
        kind: wide ? "crit" : "obs",
        find: `Heart: rate ${v.hr}, sbp ${v.sbp}, QRS ${qrs} ms${wide ? " (widened — sodium channel blockade)" : ""}.`,
        evid: wide
          ? "QRS widening past 100ms in a TCA overdose predicts seizure risk, and past 160ms predicts ventricular arrhythmia — this is the single most useful bedside number in this toxidrome, and it is trending the wrong way."
          : "A QRS still near normal width is a real, reassuring finding at this point in a TCA ingestion — but it can still widen further as absorption continues, so it is not a reason to stop watching the monitor."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Tricyclic antidepressant overdose, with progressive sodium-channel blockade (wide-complex arrhythmia) and refractory hypotension unanswered.";
    notes.push("This is tricyclic antidepressant (TCA) overdose — fast sodium-channel blockade widens the QRS, which is the real bedside predictor of seizure (QRS>100ms) and ventricular arrhythmia (QRS>160ms) risk. Refractory hypotension (direct myocardial depression plus alpha-1-blockade vasodilation) and wide-complex arrhythmia are the actual killers here, not the anticholinergic symptoms.");
    if (s.given.bicarb) notes.push("Sodium bicarbonate is the real antidote-equivalent for this toxidrome — it works by raising serum pH, which lowers the drug's affinity for the sodium channel (it binds more avidly to its protonated form at low pH), genuinely narrowing the QRS. It does not remove the drug from the body; it buys time.");
    else notes.push("Sodium bicarbonate was not given — it is the single most important treatment for a widening QRS in TCA overdose, and should be pushed early rather than waited on.");
    if (pat && pat.seizing) notes.push("She is seizing — a real, well-documented TCA complication once sodium-channel blockade is severe enough (the same QRS-width threshold that predicts arrhythmia also predicts this). Benzodiazepines treat the seizure; they do nothing for the underlying conduction block.");
    notes.push("The real onset pattern here is fast: TCA overdose can look deceptively stable for the first hour, then deteriorate suddenly into seizures or a wide-complex arrhythmia as absorption continues (anticholinergic effects slow the patient's own gut motility, so the drug keeps being absorbed well past ingestion) — frequent reassessment of the QRS, not a single snapshot, is the actual field skill.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "DYSR", truth: "Tricyclic antidepressant overdose — sodium-channel blockade with QRS widening, anticholinergic toxidrome, and a real risk of sudden seizure/arrhythmia; sodium bicarbonate is the field antidote-equivalent"};},
},

// Amiodarone overdose (queue item 40's standing workstream, sixth drug —
// TOX-017). See conditions.js's amiodaroneOverdose comment for the full
// mechanism/measurement writeup: a nursing-home medication-error framing
// (a full week's oral maintenance supply given as a single IV push) rather
// than an intentional ingestion, since amiodarone is not typically a
// self-harm drug of choice but IV-push dosing errors with this exact drug
// are a real, documented medication-safety issue. Reuses the SAME
// receptor/PK mechanism the therapeutic `amiodarone`/`amiodarone2` entries
// already use (sodiumBlock/potassiumBlock/avSlowing/arteriolarDilation) —
// no new engine mechanism, per this item's own explicit discipline. NOTE,
// measured (not assumed — an earlier draft of this scenario wrongly
// claimed bradycardia before checking): this presentation is real
// hypotension + QT prolongation, NOT bradycardia — amiodarone's own
// drugs.js entry declares no direct chronotropic receptor, so hr here is
// statistically indistinguishable from a condition-less control.
amiodaroneOverdose: {cat: "medical", id: "TOX-017", pronouns: "she", title: "Female, 74. Found weak and lightheaded by her home health aide.",
  limit: 900, transport: 480,
  bystanders: "Her home health aide, upset. \"I set up her medications every week, but this morning a new agency nurse gave her the whole week's pill organizer through her IV port instead of by mouth. I didn't realize until I found the empty organizer next to the pump.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 11"}],
  dispatch: ["74F, weak and lightheaded, possible medication error.", "Home health aide reports an IV medication error about 20 minutes ago."],
  update: [],
  impression: "Pale, diaphoretic, lying still on the couch. Says she feels like she is going to pass out.",
  imps: ["ODPO", "DYSR", "SHOK"],
  condition: "amiodaroneOverdose",
  patient: {age: 74, gender: "female"},
  clothing: {top: "long", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Aide: \"She takes amiodarone for her heart, 200 milligrams a day, seven pills in her weekly organizer. The new nurse pushed the whole week's worth into her IV line by mistake, right around the time I got here.\"", kind: "pt",
      evid: "A week's worth of oral amiodarone given as one IV push, about 20 minutes prior to a presentation of hypotension, is a real, documented medication-error toxidrome — amiodarone's own slow clearance means the effect will not simply wear off over the call.", find: "SAMPLE (collateral): amiodarone 200mg daily maintenance dose; approximately one week's supply given as a single inadvertent IV push roughly 20 minutes prior to EMS contact."}),
    opqrst: () => ({say: "\"I just feel so weak and dizzy, like I might pass out. It came on fast, right after they gave me my medicine in my IV.\"", kind: "pt",
      evid: "Weakness and presyncope beginning within minutes of an IV medication push points at the medication itself, not a separate new cardiac event.", find: "OPQRST: sudden-onset weakness/presyncope, temporally tied to an IV medication administration roughly 20 minutes ago."}),
    // MEASURED, not scripted (see conditions.js): reads v.hr/v.sbp/pat.qt
    // live. potassiumChannelBlock's own already-calibrated 0.15 coefficient
    // (cardiovascular.js) is the real QT mechanism here, not a narrated
    // number. Threshold set against the engine's OWN measured range
    // (lesson 20) — a condition-less control at this hr reads ~0.318s,
    // this condition reads ~0.348s, so 335ms cleanly separates them; real
    // clinical QTc-prolongation cutoffs (~450-470ms) are absolute values
    // this engine's internal qt scale is not calibrated to.
    heart: (s, v) => {
      const qt = s.patient?.qt ?? 0.32;
      const qtMs = Math.round(qt * 1000);
      const wide = qtMs > 335;
      return {say: `Rate ${v.hr}, pressure ${v.sbp}.${wide ? " The monitor flags a prolonged QT interval." : ""}`, kind: v.sbp < 100 ? "obs" : "pt",
        find: `Heart: rate ${v.hr}, sbp ${v.sbp}, QT ${qtMs}ms${wide ? " (prolonged)" : ""}.`,
        evid: wide
          ? "Amiodarone's potassium-channel blockade prolongs the QT interval, raising torsades risk, at the same time its arteriolar-dilating effect is causing the hypotension you're seeing right now — a real trade-off this drug carries even at therapeutic doses, magnified here. Rate is not particularly affected; this drug's overdose picture here is pressure and rhythm risk, not rate."
          : "QT not yet flagged as prolonged, but amiodarone's potassium-channel effect can take time to fully manifest and should keep being watched on the monitor."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Amiodarone overdose, with refractory hypotension and QT prolongation unanswered.";
    notes.push("This is amiodarone overdose — a real, if uncommon, IV medication-error toxidrome. Potassium-channel blockade prolongs the QT (raising torsades risk) while the drug's own vasodilating effect drops blood pressure — the actual picture here is pressure and rhythm risk, not a slowed heart rate; amiodarone has no strong direct chronotropic effect of its own.");
    notes.push("Amiodarone's clearance is unusually slow — this is a LOAD/DURATION problem, not a brief spike that resolves on its own the way a single therapeutic dose's short peak does. Supportive care (fluids for the hypotension and close monitoring for torsades given the prolonged QT) is the real field job; there is no specific reversal agent for amiodarone toxicity carried in this drug box.");
    notes.push("A same-drug repeat dose or another antiarrhythmic would only deepen the same sodium/potassium-channel blockade already causing this presentation — the wrong move here.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "DYSR", truth: "Amiodarone overdose (IV medication error) — hypotension and QT prolongation from the same potassium-channel/sodium-channel/vasodilating mechanisms therapeutic amiodarone uses, without a significant rate effect; no specific field antidote, supportive care and monitoring for torsades are the real interventions"};},
},

// Cocaine toxicity (queue item 7, Toxicology backlog — TOX-016). A young
// patient with a sympathomimetic toxidrome and real cocaine-associated
// chest pain from coronary vasospasm — see conditions.js's cocaineToxicity
// comment for the full mechanism/literature writeup. Deliberately written
// so the nitro/beta-blocker reflex a "chest pain" presentation invites is
// the real, teachable field trap: the actual first-line treatment here is
// benzodiazepines, not the cardiac-chest-pain protocol reflex.
cocaineToxicity: {cat: "medical", id: "TOX-016", pronouns: "he", title: "Male, 29. Agitated, sweating, chest pain — bar bathroom, friends worried.",
  limit: 900, transport: 480,
  bystanders: "His friend, sweating himself, talking fast. \"We were at the bar, he went to the bathroom and came back all wound up, saying his chest hurts and his heart's racing. He's done this before but never looked this bad. I think he did a bunch of coke tonight.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 9"}],
  dispatch: ["29M, chest pain, agitated.", "Bystander reports recent cocaine use.", "Conscious, diaphoretic."],
  update: [],
  impression: "Pacing then sitting then pacing again, sweating heavily, picking at his shirt, jaw clenched, pupils wide.",
  imps: ["ODPO", "CPMI", "ALOC"],
  condition: "cocaineToxicity",
  patient: {age: 29, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Friend: \"He's used before, recreationally, never like this. Tonight he did a lot more than usual. No other meds, no allergies that I know of. He said his chest started hurting maybe twenty minutes ago.\"", kind: "pt",
      evid: "Recent, heavy cocaine use with chest pain onset within the last half hour matches cocaine's own rapid peak effect and its real, documented coronary-vasospasm chest-pain complication.", find: "SAMPLE (collateral): recent heavy cocaine use, chest pain onset ~20 minutes prior, no other reported substances."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "\"It's tight, right here, and my heart won't slow down.\" He can't sit still long enough to finish a sentence." : "He isn't answering clearly.", kind: "pt",
      find: "OPQRST: substernal chest tightness, onset ~20 min after heavy cocaine use, associated palpitations and agitation.", evid: "Chest pain this soon after cocaine use, in a young patient with no prior cardiac history, is the real cocaine-associated-chest-pain presentation — coronary vasospasm on otherwise normal arteries, not necessarily atherosclerotic ACS."}),
    // Reads live physiology (conditions.js/cardiovascular.js): the heart
    // exam reports the real hr/sbp/dbp this condition drives, and the real,
    // condition-owned coronary vasospasm term rather than a scripted line.
    heart: (s, v) => {
      const spasm = s.patient?.coronaryStenosis || 0;
      return {say: `Rate ${v.hr}, pressure ${v.sbp}/${v.dbp ?? "?"}. Diaphoretic, tremulous.${spasm > 0.2 ? " He keeps grabbing at his chest, says it's getting worse." : ""}`, kind: v.hr > 150 || v.sbp > 190 ? "crit" : "obs",
        find: `Heart: rate ${v.hr}, sbp ${v.sbp}/${v.dbp ?? "?"}.`,
        evid: "Severe tachycardia and hypertension together with real chest pain, in a young cocaine-intoxicated patient, is the combined sympathomimetic-toxicity-plus-coronary-vasospasm picture — treat the toxidrome, not a presumed atherosclerotic MI."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Cocaine toxicity, unmanaged, progressed to malignant hypertension and coronary vasospasm severe enough to cause myocardial ischemia.";
    notes.push("This is cocaine toxicity: a potent sympathomimetic from blocked presynaptic reuptake of norepinephrine, dopamine, and serotonin. Severe tachycardia, severe hypertension, agitation, and hyperthermia are the core presentation. His chest pain is real and comes from coronary VASOSPASM — direct alpha-adrenergic-mediated coronary vasoconstriction that causes ischemia even in young patients with completely normal coronary arteries (Lange & Hillis, NEJM 2001).");
    notes.push("BENZODIAZEPINES ARE FIRST-LINE HERE, not the cardiac-chest-pain reflex. Midazolam genuinely reduces the sympathetic drive underneath this presentation, through the same central GABA-A mechanism that treats agitation elsewhere — a real, measurable improvement in the heart rate and blood pressure, not just a calmer-looking patient.");
    notes.push("Beta-blockers (metoprolol) are RELATIVELY CONTRAINDICATED in cocaine toxicity — the real 'unopposed alpha' phenomenon. Pure beta-blockade removes the beta-2-mediated vasodilation that partially offsets cocaine's alpha-mediated vasoconstriction, and can worsen coronary vasospasm and hypertension rather than helping. Treat the underlying sympathomimetic crisis with a benzodiazepine, not a beta-blocker reflex borrowed from an ordinary cardiac chest-pain call.");
    notes.push("Nitroglycerin can have a role for the chest pain itself in some protocols, but it does not treat the underlying catecholamine excess the way a benzodiazepine does — recognizing this as a toxidrome, not a straightforward ACS, is the actual field skill being tested here.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "CPMI", truth: "Cocaine toxicity — severe sympathomimetic tachycardia/hypertension/agitation/hyperthermia with real coronary-vasospasm chest pain; benzodiazepines are first-line, beta-blockers are relatively contraindicated (unopposed alpha)"};},
},

// Cyanide poisoning (queue item 7, Toxicology — TOX-008). An INDUSTRIAL
// exposure, deliberately not a house fire — see conditions.js's own
// cyanidePoisoning comment for the full reasoning (a clean, isolated
// histotoxic lesion, so the normal-SpO2-with-profound-coma contrast is
// unambiguous rather than tangled with CO and thermal airway injury).
// The whole teaching point is a monitor that reads reassuringly normal.
cyanidePoisoning: {cat: "medical", id: "TOX-008", pronouns: "he", title: "Male, 38. Collapsed at a metal-plating shop.",
  limit: 900, transport: 540,
  bystanders: "His shift supervisor, shaken and keeping his distance from the tank room. \"He was rinsing out the plating bath. Something splashed and there was a smell, kind of bitter. He got maybe ten steps and just went down. We dragged him out to the loading dock. That tank is sodium cyanide.\"",
  units: [{at: 300, level: "paramedic", name: "Medic 12"}],
  dispatch: ["38M, collapsed at an industrial site, possible chemical exposure.", "Caller reports a cyanide plating tank. Fire is en route for the hazmat assessment; patient has been moved outside."],
  update: ["Fire advises the tank room is isolated and the loading dock is clear. Your patient is the only one exposed."],
  impression: "Unresponsive on the loading dock. Breathing fast and deep, almost sighing. Skin is warm and dry, no cyanosis at all. The monitor comes up reading 98 percent.",
  imps: ["ODPO", "ALOC", "SEIZ"],
  condition: "cyanidePoisoning",
  patient: {age: 38, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Supervisor: \"No health problems I know of, he's 38 and fit. No medications. This was maybe five, six minutes before you got here.\"", kind: "pt",
      evid: "A witnessed, near-instant collapse seconds after a splash from a known cyanide bath is the history. There is no lab that will confirm cyanide in time, so the exposure history plus the clinical picture IS the diagnosis.", find: "SAMPLE (collateral): previously well, no medications. Acute sodium cyanide exposure approximately 5-6 minutes prior, with immediate collapse."}),
    opqrst: () => ({say: "He doesn't respond to you at all.", kind: "pt",
      find: "OPQRST unobtainable — patient is unresponsive.", evid: "Rapid loss of consciousness with no preceding respiratory distress is characteristic: the brain is the most oxidative-phosphorylation-dependent tissue in the body, so it fails first when cellular respiration is blocked."}),
    // MEASURED, not scripted: reads live sao2/spo2 and the real cellular
    // energy failure the engine is computing, so the contrast a crew is
    // supposed to notice is the actual modeled state, not a fixed line.
    skin: (s, v) => ({say: `Warm and dry. No cyanosis anywhere. Saturation is reading ${v.spo2} percent on room air.`, kind: "obs",
      find: `Skin: warm, dry, no cyanosis. SpO2 ${v.spo2}% on room air.`,
      evid: "This is the finding that should stop you. A patient this profoundly obtunded with a normal saturation and no cyanosis is not failing to GET oxygen. Oxygen delivery is intact; something is stopping the cells from using it."}),
    heart: (s, v) => {
      const pat = s.patient;
      const atp = pat?.atp ?? 1;
      const failing = atp < 0.6;
      return {say: `Rate ${v.hr}, pressure ${v.sbp}/${v.dbp}.${failing ? " The pressure is noticeably lower than it was a few minutes ago." : ""}`,
        kind: failing ? "crit" : "obs",
        find: `Heart: rate ${v.hr}, BP ${v.sbp}/${v.dbp}.`,
        evid: failing
          ? "The blood pressure is falling, and not from blood loss or vasodilation. The myocardium runs on oxidative phosphorylation like everything else, and it is running out of ATP. This is the phase that ends in bradycardia and arrest."
          : "The pressure is holding for now. In cyanide toxicity that is a window, not a reassurance: cardiovascular collapse follows once myocardial ATP is exhausted."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Cyanide poisoning — histotoxic hypoxia from cytochrome c oxidase inhibition, with unreversed cellular energy failure progressing to myocardial ATP exhaustion and cardiovascular collapse.";
    notes.push("This is cyanide poisoning. Cyanide binds cytochrome c oxidase and shuts down the last step of the electron transport chain, so the cells cannot use oxygen even though delivery is completely normal. That is histotoxic hypoxia, and it is a different category of problem from every other hypoxic patient you will see.");
    notes.push("The reason the monitor lied to you is that there was nothing wrong with the oxygen. PaO2, hemoglobin and saturation are all normal, so the pulse oximeter reads normal, and it is not malfunctioning. The tell is the mismatch: profound coma and a severe lactic acidosis in a patient with a completely unremarkable saturation and no cyanosis. Compare carbon monoxide, where the oximeter also reads normal but for the opposite reason, because it cannot tell carboxyhemoglobin from oxyhemoglobin.");
    notes.push("The lactate is the closest thing to a field cyanide level. Cells forced onto anaerobic glycolysis pour out lactic acid, and plasma lactate correlates tightly enough with blood cyanide that it is the practical surrogate for a level nobody can obtain in time.");
    if (s.given.hydroxo) notes.push("Hydroxocobalamin was given, and it is the right drug. The cobalt in the molecule binds free cyanide directly, forming cyanocobalamin, which is simply vitamin B12 and is excreted in the urine. It is not fast and it is not magic: it is an infusion, its effect follows the infusion, and a severe exposure can need the second 5 gram dose. Expect the skin and urine to turn deep red, and warn the receiving facility that it interferes with co-oximetry.");
    else notes.push("Hydroxocobalamin was not given. It is the field antidote for this, it is carried, and it is the only thing in the bag that treats the actual lesion. High-flow oxygen is still correct supportive care, but understand its limit here: the problem was never that this patient could not get oxygen.");
    if (pat && pat.seizing) notes.push("He is seizing. In this toxidrome that is cerebral energy failure, not a primary seizure disorder. A benzodiazepine will treat the convulsion; it does nothing to the cytochrome block underneath it.");
    notes.push("On scene safety: a patient soaked in a cyanide solution is a contamination risk to you and to the receiving hospital, so decontamination and fire's hazmat assessment are part of this call, not an afterthought.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "ALOC", truth: "Cyanide poisoning — histotoxic hypoxia from cytochrome c oxidase inhibition, presenting as coma and severe lactic acidosis with a normal SpO2; hydroxocobalamin is the field antidote"};},
},

// Acquired methemoglobinemia (queue item V2-30 — clinical measurement and
// monitoring physiology). A benzocaine topical-anesthetic exposure during an
// attempted awake nasal intubation at a skilled-nursing facility, the real,
// well-documented most-common EMS-relevant trigger for this toxidrome (Guay,
// Anesth Analg 2009). Deliberately paired with carbonMonoxidePoisoning
// (TOX-005) as the OPPOSITE pulse-ox artifact — CO reads falsely NORMAL, this
// reads falsely LOW-but-STUCK near 85% — the actual monitoring/measurement
// teaching point queue item V2-30 is scoped to close.
methemoglobinemia: {cat: "medical", id: "TOX-013", pronouns: "she", title: "Female, 58. Cyanotic after a failed intubation attempt, SpO2 stuck at 85.",
  limit: 900, transport: 540,
  bystanders: "The facility nurse, holding the chart. \"We had the traveling ENT doc try an awake nasal scope on her this morning, sprayed a bunch of that numbing spray up her nose first. Ten minutes later she went blue around the lips. We put her on oxygen right away but the number on the monitor hasn't moved at all.\"",
  units: [{at: 300, level: "paramedic", name: "Medic 9"}],
  dispatch: ["58F at a skilled-nursing facility, cyanosis after a procedure, oxygen not helping."],
  update: ["Facility staff confirm no prior cardiac or respiratory history, and lungs sound clear on their own exam."],
  impression: "Awake, anxious, visibly cyanotic around the lips and fingertips despite a non-rebreather already in place. Lungs clear. The monitor reads 85 percent and will not climb no matter how much oxygen goes on.",
  imps: ["ODPO", "ALOC"],
  condition: "acquiredMethemoglobinemia",
  patient: {age: 58, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Nurse: \"No heart or lung history that I know of. She got a benzocaine spray to the back of the throat and nose about twenty minutes ago for the procedure, then went blue.\"", kind: "pt",
      evid: "Cyanosis with a normal chest exam, beginning shortly after a topical benzocaine exposure, is the classic trigger history for methemoglobinemia — benzocaine directly oxidizes hemoglobin's iron from the ferrous to the ferric form, which cannot carry oxygen.",
      find: "SAMPLE (collateral): no prior cardiopulmonary disease. Topical benzocaine spray ~20 min prior, cyanosis followed shortly after."}),
    opqrst: () => ({say: "\"I feel short of breath, but it's not like anything hurts.\"", kind: "pt",
      find: "OPQRST: dyspnea without pain, onset shortly after the procedure."}),
    // MEASURED, not scripted: reads the real, live displayed spo2 — the
    // whole point is that this number is genuinely stuck, not narrated as
    // stuck, and a treated vs. untreated re-check shows it staying put.
    skin: (s, v) => ({say: `Visible cyanosis of the lips and fingertips, a slightly grayish-blue color that doesn't look like ordinary hypoxic cyanosis. Saturation reads ${v.spo2} percent and hasn't moved since the oxygen went on.`, kind: "obs",
      find: `Skin: cyanotic, ${v.spo2}% SpO2, unresponsive to supplemental O2.`,
      evid: "This is the tell. Ordinary hypoxic cyanosis climbs with FiO2. A reading pinned near 85 percent that will not budge, in a patient with a completely clear chest exam, points at a hemoglobin problem the pulse oximeter cannot correctly read, not a lung problem."}),
    lungs: () => ({say: "Clear and equal bilaterally, good air movement.", kind: "obs",
      find: "Lungs: clear bilaterally.",
      evid: "A clear chest exam in a visibly cyanotic, hypoxia-reading patient argues against a primary respiratory cause — the lesion is upstream of the lungs, in the hemoglobin itself."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Acquired methemoglobinemia from topical benzocaine, with a real oxygen-carrying deficit unrecognized because the pulse oximeter reading was trusted at face value.";
    notes.push("This is acquired methemoglobinemia. Benzocaine oxidizes the iron in hemoglobin from its normal ferrous (Fe2+) state to the ferric (Fe3+) methemoglobin state, and methemoglobin cannot bind oxygen at all — a real, if partial, functional anemia.");
    notes.push("The monitor is not lying the way it does with carbon monoxide poisoning, where the reading is falsely NORMAL. Here it is doing the opposite: methemoglobin's absorbance sits between reduced and oxygenated hemoglobin, so a standard two-wavelength pulse oximeter reads a value that gets stuck near 85 percent, low but not falling, almost independent of how much oxygen you give.");
    notes.push("High-flow oxygen is still the correct field action — it maximizes what the remaining, unaffected hemoglobin and dissolved oxygen can deliver — but it will not move the number on the monitor and it will not fix the underlying lesion. The real antidote is methylene blue, which is not carried on this unit; recognition and prompt transport for the definitive treatment is the field job here.");
    notes.push("If you ever see a cyanotic, dyspneic patient whose SpO2 will not respond to oxygen despite a clear chest exam, think methemoglobinemia and ask about a recent topical anesthetic, dapsone, or nitrite exposure.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "ALOC", truth: "Acquired methemoglobinemia from topical benzocaine — a real oxygen-carrying deficit under a pulse-ox reading stuck near 85%, unresponsive to supplemental oxygen"};},
},

// Organophosphate (cholinergic) poisoning (queue item 67 — found while
// implementing TP 1240/1240-P's HAZMAT nerve-agent algorithm, whose own
// SEVERE tier already had real signals but whose MILD/MODERATE tier had
// none). A pesticide-applicator exposure, deliberately NOT a nerve-agent/
// mass-casualty framing — the same "one real, well-scoped mechanism" choice
// item 67 itself makes, and a real, ordinary EMS dispatch type this engine
// otherwise had no way to present at all. See conditions.js's
// organophosphatePoisoning entry for the full muscarinic mechanism/
// measurement writeup.
organophosphatePoisoning: {cat: "medical", id: "TOX-009", pronouns: "he", title: "Male, 47. Crop-duster spill, soaked in pesticide, weak and short of breath.",
  limit: 900, transport: 480,
  bystanders: "A coworker, keeping his distance and still in a respirator. \"A hose blew loose while he was loading the sprayer, and it soaked him head to toe. He was fine for a few minutes, then started drooling and said he couldn't get a breath. That's organophosphate concentrate, the label's right there on the drum.\"",
  units: [{at: 300, level: "paramedic", name: "Medic 21"}],
  dispatch: ["47M, possible chemical exposure at an agricultural site.", "Coworker reports an organophosphate pesticide spill, patient symptomatic and worsening."],
  update: ["Fire advises the patient has been moved upwind and gross-decontaminated; the spill itself is contained."],
  impression: "Slumped against a truck tire, drenched, drooling steadily down his chin. Breathing is wet and labored, and his hands won't stop shaking.",
  imps: ["ODPO", "RARF", "SOBB"],
  condition: "organophosphatePoisoning",
  locWeights: {business: 4, house: 1},
  patient: {age: 47, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Coworker: \"He's healthy as far as I know, no meds, no allergies. This started maybe five minutes after the spill, and it's been getting worse since, not better.\"", kind: "pt",
      evid: "A witnessed organophosphate concentrate spill with symptom onset within minutes, worsening rather than resolving, is the real setup for cholinergic toxidrome from acetylcholinesterase inhibition — not a benign chemical splash.", find: "SAMPLE (collateral): previously well, no medications. Organophosphate pesticide concentrate exposure approximately 5 minutes prior, symptoms progressive."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "He can barely get a sentence out between coughs and gasps." : "He doesn't respond to your voice.", kind: "pt",
      find: "OPQRST unobtainable — patient too dyspneic/altered to give a reliable history.", evid: "Progressive respiratory distress this soon after a documented organophosphate exposure is itself part of the toxidrome, not a separate complaint."}),
    // MEASURED, not scripted (see conditions.js): reads pat.effectiveBroncho
    // live, the same "live instrument reading" pattern anaphylaxis's/
    // toxicInhalationChlorine's own lungs probes already established — but a
    // genuinely different underlying cause (glandular hypersecretion PLUS
    // bronchospasm, folded into the same broncho handle, versus a purely
    // allergic or irritant one) and a distinct secretions finding no other
    // toxidrome in this engine narrates.
    lungs: (s) => {
      const eb = s.patient?.effectiveBroncho ?? 0.25;
      if (eb > 0.6) return {say: "Wet, coarse breath sounds everywhere, and secretions are pooling faster than he can clear them.", kind: "crit",
        evid: "Severe bronchorrhea and bronchospasm together are the real cause of death in cholinergic crisis — the airway drowns from within.", find: "Lungs: diffuse coarse/wet breath sounds, copious secretions, severe bronchospasm."};
      if (eb > 0.3) return {say: "Wheezy and wet-sounding, with visible drooling and tearing.", kind: "warn",
        evid: "Bronchorrhea plus bronchospasm, worsening — muscarinic excess from acetylcholinesterase inhibition.", find: "Lungs: bronchospasm with excess secretions."};
      return {say: "Breath sounds clearer, secretions drying up.", kind: "obs",
        evid: "Secretions/bronchospasm improving — the real, treatable half of this toxidrome responding to atropine.", find: "Lungs: improving, secretions drying."};
    },
    // MEASURED, not scripted: reads v.hr live. pat.parasympathetic (see
    // conditions.js) drives real, atropine-responsive bradycardia through
    // the SAME vagalBlock mechanism atropineOverdose/secondDegreeAVBlockTypeI
    // already exercise for other causes.
    heart: (s, v) => ({say: `Rate ${v.hr}, and he is soaked in his own sweat on top of the chemical.`, kind: v.hr < 60 ? "crit" : "obs",
      find: `Heart: rate ${v.hr}, sinus.${v.hr < 60 ? " Bradycardic." : ""}`,
      evid: v.hr < 60
        ? "Bradycardia from unopposed muscarinic (vagal) tone is a real, dangerous part of this toxidrome, and it is exactly what atropine is first-line for."
        : "Heart rate not yet critically slow, but a cholinergic crisis this early can still worsen quickly without treatment."}),
  },
  resolve: (s, v, arr) => {const notes = []; const pat = s.patient; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Organophosphate (cholinergic) poisoning, with unmanaged bronchorrhea/bronchospasm and bradycardia progressing to respiratory failure.";
    notes.push("This is organophosphate (cholinergic) poisoning. Acetylcholinesterase inhibition lets acetylcholine accumulate at muscarinic synapses — the SLUDGE/killer-B's picture: salivation, lacrimation, urination, defecation, GI distress, bradycardia, bronchorrhea, and bronchospasm. Bronchorrhea plus bronchospasm together, not the bradycardia alone, is the real cause of death — the airway drowns from within.");
    if (s.given.atropine || s.given.duodote) notes.push("Atropine (or DuoDote's own atropine component) was given — the correct, specific move. It works by blocking muscarinic acetylcholine receptors, drying secretions, relieving bronchospasm, and reversing the bradycardia — the real endpoint is titrating repeat doses to dry secretions and an improving heart rate (\"atropinization\"), not one fixed dose.");
    else notes.push("No atropine or DuoDote was given. Atropine is the specific, first-line antidote here, dosed and repeated until secretions dry and the bradycardia resolves — supportive airway care alone does not fix the underlying muscarinic excess driving it.");
    notes.push("Pralidoxime (2-PAM), which reactivates the enzyme itself rather than just blocking its downstream effect, is the other real antidote for this toxidrome — it is not carried in this drug box, so recognition, atropine, and rapid transport are the field job.");
    if (pat) notes.push("Both pupils were pinpoint on exam — miosis fits the muscarinic picture, the opposite finding from an anticholinergic or opioid overdose.");
    notes.push("Decontamination matters for your own safety too — a patient still soaked in concentrate is an ongoing exposure risk to responders, not just a historical detail.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "RARF", truth: "Organophosphate (cholinergic) poisoning — muscarinic excess (bronchorrhea/bronchospasm, bradycardia, miosis) from acetylcholinesterase inhibition; atropine is the field antidote"};},
},

// Carbon monoxide poisoning (queue item 7, Toxicology — TOX-005). A power-
// outage generator-in-the-garage exposure, deliberately NOT a house fire —
// see conditions.js's own comment for why (a clean, isolated CO exposure,
// distinct from the still-unbuilt Smoke Inhalation Injury/Cyanide Poisoning
// entries this same COHb/caO2 mechanism would need to be reused for later).
carbonMonoxidePoisoning: {cat: "medical", id: "TOX-005", pronouns: "he", title: "Male, 41. Found confused in the garage during a power outage.",
  limit: 900, transport: 480,
  bystanders: "His wife, holding a coat around herself outside. \"The power's been out since last night, so he ran the generator in the garage to keep the fridge going. I found him an hour ago just... slumped against the wall, barely making sense. I feel sick too — headache, dizzy — but he's so much worse than me.\"",
  units: [{at: 420, level: "paramedic", name: "Medic 7"}],
  dispatch: ["41M, altered mental status, possible carbon monoxide exposure.", "Portable generator running in an attached garage overnight, power outage.", "Wife also reports headache/dizziness — she is being checked by a second crew."],
  update: [],
  impression: "Slumped against the garage wall, eyes open but slow and confused, headache clearly bothering him. Skin looks flushed, not pale. The generator is still running a few feet away — get him out into fresh air.",
  imps: ["ODPO", "ALOC"],
  condition: "carbonMonoxidePoisoning",
  patient: {age: 41, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Wife: \"We ran the generator in the garage — I know now that was wrong, the door was even open a crack, I thought that was enough. He's never had anything like this happen before. No other drugs, no drinking.\"", kind: "pt",
      evid: "A portable generator run in an enclosed or semi-enclosed space (a garage, even with the door cracked) during a power outage is the single most common real-world source of accidental CO poisoning — a specific, checkable exposure history, not a guess.", find: "SAMPLE (collateral): generator run in an attached garage overnight during a power outage; no other ingestion or drug history."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "\"My head is pounding... I feel sick... how long was I in there...\"" : "He doesn't respond to your voice.", kind: "pt",
      evid: "A throbbing headache, nausea, and confusion after an overnight enclosed-space combustion-engine exposure is the textbook moderate-to-severe carbon monoxide poisoning presentation, not a stroke or a simple intoxication.", find: "OPQRST: severe headache and nausea on waking, unclear how long he was exposed overnight."}),
    // THE ACTUAL TEACHING POINT, read live off the real mechanism (see
    // patient.js's vitals()/metabolic.js's caO2 — not scripted): the
    // DISPLAYED pulse-ox reading is genuinely reassuring (pulse oximetry
    // cannot distinguish carboxyhemoglobin from oxyhemoglobin) while the
    // patient is measurably altered. This probe deliberately narrates BOTH
    // numbers so the contrast itself is the finding, not a hidden trap the
    // player has no way to notice.
    lungs: (s, v) => ({
      say: `Sat's reading ${v.spo2}% on the monitor — looks fine. Lungs are clear, no wheeze, he's just breathing a little fast. Skin's flushed, almost pink, not the gray or blue you'd expect if that number meant what it usually means.`,
      kind: "warn",
      find: `Lungs clear, RR ${v.rr}. SpO2 ${v.spo2}% — reads reassuringly normal.`,
      evid: "A normal or near-normal pulse-ox reading does NOT rule out carbon monoxide poisoning. Standard two-wavelength pulse oximetry reads carboxyhemoglobin as if it were oxygenated hemoglobin — the number on the monitor is not measuring what you think it's measuring here. Skin color 'cherry red' is a real but late, unreliable, and often-absent sign — most patients just look flushed or entirely normal.",
    }),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const o2 = (s.done.o2nrb || 0) + (s.done.bvm || 0) + (s.done.cpap || 0);
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Untreated carbon monoxide poisoning — real tissue oxygen delivery collapsed while the pulse ox kept reading normal.";
    if (o2) notes.push("High-flow oxygen given — the correct, and only real field, move. It doesn't just support breathing here: raising FiO2 competitively displaces CO off hemoglobin and genuinely speeds recovery, the same mechanism hyperbaric oxygen uses at a hospital, just slower.");
    else if (!died) notes.push("High-flow oxygen was never given. Room air clears carboxyhemoglobin over several hours; 100% oxygen cuts that time to roughly an hour — a real, meaningful difference this patient needed.");
    notes.push("The single most important thing this call teaches: the SpO2 number on the monitor reads normal in carbon monoxide poisoning, because a standard pulse oximeter cannot tell carboxyhemoglobin from oxyhemoglobin. Trust the history and the exam — an enclosed-space combustion exposure with headache and confusion — over a reassuring number.");
    notes.push("Hyperbaric oxygen (for severe exposure, pregnancy, or loss of consciousness) is a hospital-level decision, not a field one — the field job is recognition, high-flow O2, and getting everyone out of the source, including anyone else still in that garage.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "ALOC", truth: "Carbon monoxide poisoning from a generator run in an attached garage — a falsely normal-reading pulse ox masking real hypoxic tissue injury, treated with high-flow oxygen"};},
},

// ============================================================
// ELECTROLYTE BATCH (queue item 7's standing workstream, physiology
// batch). First scenarios in a new "Electrolyte" body-system category
// (App.jsx's SCEN_BODY_SYSTEM/order/BUILDING_SYSTEM_POOL) — see
// conditions.js's own matching comment block for the full mechanism
// writeup; each of these conditions reuses cardiovascular.js's already-
// verified k/mg/ca-driven QTc/torsades/rhythm-instability machinery with
// zero new engine code.
// ============================================================

hypokalemia: {cat: "medical", id: "ELEC-001", pronouns: "she", title: "Female, 67. Generalized weakness, palpitations.",
  limit: 1200, transport: 480,
  bystanders: "Her daughter called — says her mother has seemed 'off' for two days and mentioned her heart 'skipping.'",
  units: [{at: 480, level: "emt", name: "BLS 14"}],
  dispatch: ["67F, generalized weakness.", "Reports palpitations.", "Conscious, alert."],
  update: [],
  impression: "Sitting upright on the couch, pale and visibly fatigued but alert and tracking you as you walk in.",
  imps: ["DYSR"],
  condition: "hypokalemia",
  patient: {age: 67, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I just feel weak all over, and my heart keeps doing this fluttery thing. It's been two days now.\"", kind: "pt",
      evid: "Generalized weakness with palpitations, no chest pain, over a couple of days — nonspecific on its own, which is exactly why the history matters more than how she looks.", find: "OPQRST: two days of generalized weakness with intermittent palpitations, no pain."}),
    sample: () => ({say: "\"I take a water pill for my blood pressure — have for years. Honestly I haven't been eating much this week, stomach's been off.\"", kind: "pt",
      evid: "A chronic diuretic plus several days of poor oral intake is the classic combination for clinically significant hypokalemia — real potassium loss with nothing coming in to replace it.", find: "SAMPLE: chronic thiazide/loop diuretic use, poor oral intake for several days, no other complaint."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "A prolonged, severely low serum potassium destabilized her heart's repolarization until it degenerated into a lethal rhythm.";
    notes.push("There is no field potassium replacement in this drug box — real IV potassium correction is a hospital-level intervention, given slowly under monitoring because pushing it too fast is its own cardiac-arrest risk. The correct field move is recognition (a chronic diuretic plus poor intake, in a patient with vague weakness and palpitations), monitoring, and a fast, gentle transport.");
    notes.push("A low serum potassium prolongs the QT interval and can trigger a life-threatening polymorphic ventricular rhythm (torsades) with no warning — the same mechanism a directly hypomagnesemic or drug-toxic patient can reach, just a different cause.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Severe hypokalemia (chronic diuretic use with poor oral intake) with real torsades risk"};},
},

hypercalcemia: {cat: "medical", id: "ELEC-002", pronouns: "he", title: "Male, 61. Confusion, constipation, generalized weakness.",
  limit: 1200, transport: 540,
  bystanders: "His wife called — says he's been increasingly confused and constipated for about a week, and today he seems worse.",
  units: [{at: 480, level: "paramedic", name: "Medic 9"}],
  dispatch: ["61M, altered mental status.", "Wife reports days of confusion, constipation.", "Conscious but not himself, per caller."],
  update: [],
  impression: "Sitting in a recliner, lethargic and slow to answer, oriented to person but not to day or place. Nothing acutely dramatic — just a man who is clearly not himself.",
  imps: ["ALOC"],
  condition: "hypercalcemia",
  patient: {age: 61, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "He answers slowly, sometimes not quite tracking the question. \"I don't... I've just been so tired. And my stomach's been terrible.\"", kind: "pt",
      evid: "Slow, foggy answers with a week-long history of constipation and fatigue — 'stones, bones, groans, and psychiatric overtones' is the classic mnemonic for exactly this picture.", find: "OPQRST: days of progressive lethargy/confusion with constipation, generalized weakness."}),
    sample: () => ({say: "His wife: \"He finished treatment for lung cancer about a year ago. He was doing okay, but this week he's just... gone downhill. Confused, barely eating, constipated the whole time.\"", kind: "pt",
      evid: "A recent history of malignancy is the single most important clue here — cancer (via bone metastases or PTHrP secretion) is the most common cause of severe, symptomatic hypercalcemia in adults.", find: "SAMPLE: history of lung cancer (treated), week-long progressive confusion/constipation/weakness."}),
    loc: (s) => {const enc = s.patient?.metabolicEncephalopathy || 0;
      if (enc > 0.4) return {say: "Slow to respond, drifts off mid-sentence, doesn't seem to track well.", kind: "obs",
        find: "Lethargic, waxing mental status; oriented to person only.", evid: "The confusion is genuinely progressing, not just his baseline — a real metabolic encephalopathy, not simple dementia."};
      return {say: "Answers questions, a little slow, but tracking.", kind: "obs", find: "Alert, mildly slowed, oriented to person and place."};},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe hypercalcemia, untreated, progressed to a lethal cardiac rhythm and coma.";
    const gaveFluids = s.given.saline || s.given.plasmalyte;
    if (gaveFluids) notes.push("IV normal saline was given — the correct field move for suspected severe hypercalcemia. Volume expansion promotes renal calcium excretion; it will not fix this on scene, but it is the right direction, and hypercalcemia itself impairs the kidney's ability to concentrate urine, so this patient is genuinely volume-depleted on top of everything else.");
    else if (!died) notes.push("No IV fluids were given. Aggressive isotonic fluid resuscitation is the mainstay of field/ED treatment for severe hypercalcemia — it promotes renal calcium clearance and corrects the volume depletion hypercalcemia itself causes (it blunts the kidney's response to ADH).");
    notes.push("The history — recent malignancy, days of progressive confusion, constipation, and weakness — was the actual diagnostic lever here; nothing about how he looked on first impression screamed emergency.");
    return {died, cause, notes, correct: s.pi === "ALOC", truth: "Severe hypercalcemia of malignancy (lung cancer) with progressive metabolic encephalopathy"};},
},

hypocalcemia: {cat: "medical", id: "ELEC-003", pronouns: "she", title: "Female, 52. Severe epigastric pain, tingling in her hands.",
  limit: 1200, transport: 480,
  bystanders: "Her husband is with her — says the pain started suddenly after dinner and has been getting worse.",
  units: [{at: 480, level: "paramedic", name: "Medic 6"}],
  dispatch: ["52F, severe abdominal pain.", "Onset after eating.", "Conscious, in obvious distress."],
  update: ["Patient: \"My hands feel weird, like they're tingling and cramping up.\""],
  impression: "Curled forward on the couch, holding her upper abdomen, breathing shallowly through the pain.",
  imps: ["ABDP"],
  condition: "hypocalcemia",
  patient: {age: 52, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's right here, like a band across my upper stomach, going straight through to my back. It came on fast, maybe an hour ago, right after dinner. It's a 9. And now my hands are cramping up, it's scary.\"", kind: "pt",
      evid: "Sudden, severe epigastric pain radiating straight through to the back, with new hand tingling/cramping, is the combination that should point toward pancreatitis with real, symptomatic hypocalcemia — not just a bad stomachache.", find: "OPQRST: sudden severe epigastric pain radiating to the back, onset ~1hr after eating, 9/10, plus new perioral/hand paresthesias."}),
    sample: () => ({say: "Her husband: \"She's had gallstones before but never anything like this. She had a big, fatty dinner tonight — we both did.\"", kind: "pt",
      evid: "A large, fatty meal is a classic precipitant of acute pancreatitis, and the tingling/cramping in her hands is the tetany that severe, acute hypocalcemia causes as calcium binds up in the inflamed, fat-necrotic pancreatic bed.", find: "SAMPLE: known gallstones, large fatty meal tonight, no other history."}),
    neuro: (s) => {const ca = s.patient?.ca ?? 2.4;
      if (ca < 1.9) return {say: "Tapping just in front of her ear makes the corner of her mouth twitch.", kind: "obs",
        find: "Chvostek's sign positive.", evid: "A positive Chvostek's sign (facial twitch on tapping the facial nerve) is a real, classic bedside sign of significant hypocalcemia — the neuromuscular irritability driving her hand cramping."};
      return {say: "Reflexes 2+, symmetric. No obvious tetany.", kind: "obs", find: "DTRs 2+ symmetric, Chvostek's negative."};},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe hypocalcemia depressed her cardiac contractility and prolonged repolarization until the rhythm failed.";
    const gaveCa = s.given.calcium;
    if (gaveCa) notes.push("Calcium chloride was given — the correct, definitive field treatment. It directly reverses both the depressed cardiac contractility and the prolonged repolarization severe hypocalcemia causes, and it should resolve the tetany as well.");
    else if (!died) notes.push("Calcium chloride was never given. Severe, symptomatic hypocalcemia (tetany, a positive Chvostek's sign) genuinely depresses cardiac contractility and prolongs the QT interval — this is a real cardiac risk, not just an uncomfortable symptom, and calcium is the direct, already-available field treatment.");
    notes.push("Acute pancreatitis is the cause here — fat necrosis in the inflamed pancreas binds up free serum calcium ('saponification'), which is why a severe abdominal pain call can also be a real electrolyte emergency.");
    return {died, cause, notes, correct: s.pi === "ABDP", truth: "Acute pancreatitis with severe hypocalcemia (saponification) and tetany"};},
},

hypermagnesemia: {cat: "medical", id: "ELEC-004", pronouns: "he", title: "Male, 64. Generalized weakness, sluggish.",
  limit: 1200, transport: 480,
  bystanders: "His son found him unusually weak and slow to respond this afternoon.",
  units: [{at: 480, level: "paramedic", name: "Medic 4"}],
  dispatch: ["64M, generalized weakness.", "Son reports he seems 'out of it.'", "Conscious, on kidney dialysis per family."],
  update: [],
  impression: "Sitting slumped in a kitchen chair, generally weak and slow to respond, breathing unremarkably at rest.",
  imps: ["DYSR"],
  condition: "hypermagnesemia",
  patient: {age: 64, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "He answers slowly, voice a little slurred. \"I just feel... weak. Real weak. Everywhere.\"", kind: "pt",
      evid: "Diffuse weakness with a slowed, sluggish affect in a dialysis-dependent patient is the real presentation of hypermagnesemia — nonspecific enough to be easy to write off as \"just weak.\"", find: "OPQRST: generalized weakness, sluggish affect, onset today."}),
    sample: () => ({say: "His son: \"He's on dialysis for his kidneys, three times a week. And I know he's been taking milk of magnesia for his constipation — a lot of it, honestly, every day for weeks.\"", kind: "pt",
      evid: "A dialysis-dependent (essentially anuric) patient taking a magnesium-containing laxative daily is the textbook combination for dangerous hypermagnesemia — the one organ that could clear the excess magnesium isn't working.", find: "SAMPLE: end-stage renal disease on hemodialysis, daily magnesium-containing laxative use for weeks."}),
    neuro: (s) => {const mg = s.patient?.mg ?? 1.0;
      if (mg > 4.0) return {say: "No patellar reflex at all on either side — completely absent.", kind: "obs",
        find: "DTRs absent bilaterally.", evid: "Absent deep tendon reflexes are the earliest reliable clinical sign of hypermagnesemia (patellar reflex lost 4.0-5.0 mmol/L) — well before this becomes a respiratory or cardiac emergency."};
      return {say: "Reflexes 2+, symmetric.", kind: "obs", find: "DTRs 2+ symmetric."};},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Untreated hypermagnesemia progressed through respiratory depression, AV-conduction block, and cardiac arrest.";
    const gaveCa = s.given.calcium;
    const gaveMag = s.given.magnesium;
    if (gaveMag) notes.push("Magnesium sulfate was given — this is exactly the wrong direction for a patient who is already hypermagnesemic. Giving more magnesium to a patient with absent reflexes and a dialysis history makes this worse, not better.");
    if (gaveCa) notes.push("Calcium chloride was given — the correct, specific antidote for magnesium toxicity, whatever the cause. It physiologically antagonizes magnesium at the neuromuscular junction and in cardiac conduction tissue and works within minutes, even though the serum magnesium level itself only falls with renal clearance (which this patient effectively doesn't have without dialysis).");
    else if (!died) notes.push("Calcium chloride was never given. It is the correct, already-available field treatment for symptomatic magnesium toxicity — it will not lower the serum magnesium level (only dialysis will), but it reverses the dangerous neuromuscular and cardiac-conduction effects within minutes.");
    notes.push("A dialysis-dependent patient taking a magnesium-containing antacid or laxative has essentially no way to clear the excess — real, dangerous, non-iatrogenic hypermagnesemia, distinct from over-infusing magnesium sulfate for preeclampsia.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Hypermagnesemia (end-stage renal disease plus chronic magnesium-containing laxative use)"};},
},

hypomagnesemia: {cat: "medical", id: "ELEC-005", pronouns: "he", title: "Male, 48. Tremor, brief loss of consciousness.",
  limit: 1200, transport: 480,
  bystanders: "A bartender called after he passed out briefly at the bar — he's awake now.",
  units: [{at: 420, level: "emt", name: "BLS 9"}],
  dispatch: ["48M, syncopal episode at a bar.", "Awake now per caller.", "Bystander reports a visible tremor."],
  update: [],
  impression: "Sitting on a barstool, hands visibly shaking, a little sweaty. Alert and talking, embarrassed more than anything.",
  imps: ["DYSR"],
  condition: "hypomagnesemia",
  patient: {age: 48, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I just got real dizzy and the next thing I know people are telling me I was out for a second. I've had the shakes the last couple days too — figured it was just needing a drink.\"", kind: "pt",
      evid: "Brief syncope plus a tremor he's attributing to alcohol withdrawal — the actual mechanism, chronic alcohol-related magnesium depletion, is a genuine cardiac risk he has no way to recognize himself.", find: "OPQRST: brief syncope, several days of hand tremor."}),
    sample: () => ({say: "\"I drink a lot, not gonna lie about that. Haven't eaten much the last few days either.\"", kind: "pt",
      evid: "Heavy chronic alcohol use with poor oral intake is the most common cause of clinically significant hypomagnesemia in adults — GI malabsorption, renal wasting, and nothing coming in to replace it, all at once.", find: "SAMPLE: chronic heavy alcohol use, poor oral intake for several days, no other medical history offered."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe hypomagnesemia prolonged repolarization until it triggered a lethal polymorphic ventricular rhythm.";
    const gaveMag = s.given.magnesium;
    if (gaveMag) notes.push("Magnesium sulfate was given — the correct field treatment here, and it is genuinely different from a coincidental \"just in case\" push: chronic alcohol use with poor intake is a real, common, prehospital-recognizable cause of dangerous hypomagnesemia.");
    else if (!died) notes.push("Magnesium sulfate was never given. A brief syncopal episode plus a tremor in a patient with heavy chronic alcohol use and poor intake is a real substrate for a prolonged QT interval and torsades — magnesium is the correct, already-available field treatment.");
    notes.push("The tremor and the syncope looked like ordinary alcohol withdrawal — the real danger, a prolonged QT interval from chronic magnesium depletion, was only findable by asking about intake, not by looking at him.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Severe hypomagnesemia (chronic alcohol use disorder) with real torsades risk"};},
},

hyponatremia: {cat: "medical", id: "ELEC-006", pronouns: "she", title: "Female, 29. Confusion and nausea after a marathon.",
  limit: 1200, transport: 480,
  bystanders: "A race volunteer flagged you down — she finished the marathon confused and kept asking the same questions.",
  units: [{at: 420, level: "paramedic", name: "Medic 2"}],
  dispatch: ["29F, altered mental status at the marathon finish line.", "Confused, repeating questions per volunteer.", "Conscious."],
  update: ["Volunteer: \"She said she drank a LOT of water on the course, wanted to make sure she didn't get dehydrated.\""],
  impression: "Sitting on the curb wrapped in a foil blanket, glassy-eyed and slow to answer, nauseated.",
  imps: ["ALOC"],
  condition: "hyponatremia",
  patient: {age: 29, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "She answers slowly, sometimes repeating the same thing. \"I feel... sick. My head hurts. I drank so much water, I thought that was the safe thing to do.\"", kind: "pt",
      evid: "Confusion and nausea in an endurance athlete who describes drinking heavily throughout the race is the real presentation of exercise-associated hyponatremia — a real, acute, dilutional drop in serum sodium from taking in more free water than the body can excrete.", find: "OPQRST: progressive confusion, headache, nausea developing over the marathon."}),
    sample: () => ({say: "\"I didn't want to get dehydrated so I drank at every single water station, the whole 26 miles. No medical history, I'm healthy, I train for these.\"", kind: "pt",
      evid: "Drinking at every aid station across a full marathon, well beyond thirst, is exactly the pattern behind exercise-associated hyponatremia — a real, well-documented risk of over-hydrating during endurance events.", find: "SAMPLE: no significant medical history, drank free water at every aid station throughout the race."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe, acute hyponatremia caused cerebral edema and seizure, progressing untreated.";
    if (s.given.saline || s.given.plasmalyte) notes.push("IV fluid was given here — worth stating plainly: this patient is NOT volume-depleted, she is water-intoxicated. More isotonic fluid does not correct a dilutional hyponatremia and is not the priority; monitoring for seizure and rapid transport for definitive (hypertonic saline) correction is.");
    notes.push("This is not heat illness or ordinary dehydration — it's the opposite. Severe, acute hyponatremia from drinking too much free water during endurance exercise is a real, documented cause of confusion, seizure, and death in marathon runners, and it is easy to mistake for simple exhaustion at a finish line.");
    notes.push("Definitive treatment (hypertonic saline) is a hospital-level intervention — the field priority is recognizing it, protecting her airway if she seizes, and getting her transported.");
    return {died, cause, notes, correct: s.pi === "ALOC", truth: "Severe, acute exercise-associated hyponatremia from free-water overload during a marathon"};},
},

hypernatremia: {cat: "medical", id: "ELEC-007", pronouns: "she", title: "Female, 78. Found weak and confused, hot apartment.",
  limit: 1200, transport: 540,
  bystanders: "A neighbor hadn't seen her in two days and let herself in — found her weak and confused in a stifling-hot apartment.",
  units: [{at: 480, level: "emt", name: "BLS 7"}],
  dispatch: ["78F, found weak and confused.", "Apartment reported very hot, no A/C.", "Conscious per caller."],
  update: [],
  impression: "Sitting in a recliner in a hot, stuffy apartment, mucous membranes visibly dry, slow to track your questions.",
  imps: ["ALOC"],
  condition: "hypernatremia",
  patient: {age: 78, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "She answers slowly, tongue visibly dry. \"I'm... fine. Just tired. Haven't felt like getting up for water.\"", kind: "pt",
      evid: "Days of reduced mobility and reduced thirst drive, in a hot apartment with no air conditioning, is the classic setup for severe hypernatremic dehydration in an elderly patient — a slow, easy-to-miss decline rather than a dramatic collapse.", find: "OPQRST: several days of reduced activity and reduced oral intake, progressive confusion."}),
    sample: () => ({say: "Her neighbor: \"I hadn't seen her in two days, that's not like her. It's an oven in here, her A/C must be broken. She lives alone, no family nearby that I know of.\"", kind: "pt",
      evid: "An elderly patient living alone, with reduced mobility and no working air conditioning, has real, compounding risk for both heat stress and simple free-water deficit — an easy-to-overlook, purely environmental cause of a genuine electrolyte emergency.", find: "SAMPLE: lives alone, reduced mobility, no working air conditioning, ~2 days without contact."}),
    loc: (s) => {const enc = s.patient?.metabolicEncephalopathy || 0;
      if (enc > 0.3) return {say: "Slow, foggy, has to be re-asked most questions.", kind: "obs",
        find: "Lethargic, waxing mental status.", evid: "The confusion is a real, progressive metabolic encephalopathy from cellular dehydration — not just \"she's old and confused.\""};
      return {say: "Answers slowly but appropriately.", kind: "obs", find: "Alert, mildly slowed."};},
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe, progressive hypernatremic dehydration was never corrected.";
    const gaveFluids = s.given.saline || s.given.plasmalyte;
    if (gaveFluids) notes.push("IV isotonic fluid was given — the right general direction for real volume depletion, though definitive correction of severe hypernatremia has to happen slowly (in a monitored hospital setting) to avoid causing cerebral edema from correcting it too fast. Recognizing this and starting fluids in the field is still the correct move.");
    else if (!died) notes.push("No IV fluids were given for a patient with days of reduced intake, dry mucous membranes, and a genuinely progressive confusion — real volume depletion on top of the electrolyte problem, and field fluid resuscitation is appropriate here.");
    notes.push("There was nothing dramatic about how she presented — an elderly patient found weak and a little confused after a couple of quiet days is an extremely common, easy-to-underestimate call. The environment (a hot apartment, no A/C, no one checking in) was the actual diagnostic clue.");
    return {died, cause, notes, correct: s.pi === "ALOC", truth: "Severe hypernatremic dehydration (elderly, reduced intake, environmental heat exposure)"};},
},

severeMetabolicAcidosis: {cat: "medical", id: "ELEC-008", pronouns: "he", title: "Male, 34. Days of severe diarrhea, breathing fast.",
  limit: 1200, transport: 480,
  bystanders: "His roommate called — says he's had severe diarrhea for four days and can barely keep fluids down.",
  units: [{at: 480, level: "paramedic", name: "Medic 3"}],
  dispatch: ["34M, several days of severe diarrhea.", "Roommate reports he looks weak and is breathing fast.", "Conscious."],
  update: [],
  impression: "Lying on the bathroom floor, pale, breathing rapidly and deeply. Alert but clearly exhausted.",
  imps: ["RDOT"],
  condition: "severeMetabolicAcidosis",
  patient: {age: 34, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "He speaks between deep, rapid breaths. \"I can't stop... going to the bathroom. Four days now. I feel awful, and I can't seem to catch my breath right, even just lying here.\"", kind: "pt",
      evid: "Deep, rapid breathing at rest with no lung findings, after days of severe diarrhea, is the body's own compensation for a severe metabolic acidosis — real bicarbonate lost directly in the stool, not a primary lung problem.", find: "OPQRST: 4 days of severe watery diarrhea, poor fluid tolerance, deep/rapid breathing at rest."}),
    sample: () => ({say: "His roommate: \"He's been sick for days, can't keep anything down, barely eating or drinking. No real medical history that I know of.\"", kind: "pt",
      evid: "Prolonged, severe diarrhea with poor oral intake is a real, common, non-toxic, non-diabetic cause of severe metabolic acidosis — bicarbonate lost in the stool rather than consumed buffering ketoacids, the reason this looks different from a diabetic or alcoholic ketoacidosis.", find: "SAMPLE: no significant medical history, 4 days of severe diarrhea, minimal oral intake."}),
    // A real, secondary consequence of the acidemia itself (renal.js's own
    // H+/K+ exchange term), not scripted onto this condition — see
    // conditions.js's own comment. Reads v.rhythm live, same idiom
    // hyperkalemiaMissedDialysis's own heart probe already established.
    heart: (s, v) => {
      if (v.rhythm === "peakedT") return {say: "Regular, but the monitor shows tall, peaked T waves — not what you'd expect from a diarrhea call.", kind: "crit",
        evid: "Severe acidemia drives potassium out of cells and into the blood — this patient's profound acidosis has produced a real, secondary hyperkalemia, visible on the monitor before any lab would ever confirm it.", find: "Heart: regular rhythm, peaked T waves consistent with hyperkalemia."};
      return {say: `Regular, rate ${v.hr}, no ectopy.`, kind: "obs", find: `Heart: sinus rhythm, rate ${v.hr}.`};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe, uncorrected metabolic acidosis with ongoing volume depletion progressed to circulatory collapse.";
    const gaveFluids = s.given.saline || s.given.plasmalyte;
    if (gaveFluids) notes.push("IV isotonic fluid was given — the correct field move. This patient is genuinely volume-depleted from days of diarrheal losses on top of the acidosis itself, and fluid resuscitation is the real, available field intervention (there is no field bicarbonate protocol for this).");
    else if (!died) notes.push("No IV fluids were given for a patient with four days of severe diarrhea and real hemodynamic compromise. Volume resuscitation is the correct, already-available field treatment; there is no field-level way to directly correct the bicarbonate deficit itself.");
    if (v.rhythm === "peakedT") notes.push("Peaked T waves showed up on the monitor over the course of this call — a real secondary hyperkalemia from the acidosis itself (severe acidemia pushes potassium out of cells), not a separate diagnosis. Calcium chloride is a reasonable field move if you caught this, the same membrane-stabilizing effect it has in primary hyperkalemia.");
    notes.push("The deep, rapid breathing here is Kussmaul respiration — the body's own compensatory hyperventilation for a severe metabolic acidosis, the same mechanism a diabetic ketoacidosis patient shows, but from a completely different, non-diabetic cause (bicarbonate lost directly in stool from prolonged diarrhea, not ketoacids from unregulated glucose).");
    return {died, cause, notes, correct: s.pi === "RDOT", truth: "Severe non-anion-gap metabolic acidosis from prolonged diarrheal bicarbonate loss, with real volume depletion"};},
},

// ============================================================
// SECOND BATCH (queue item 7, continued in the same session) — see
// conditions.js's own matching comment block for the full mechanism
// writeup: shock states / GI / vascular / psychiatric, each reusing
// already-verified engine handles.
// ============================================================

neurogenicShock: {cat: "trauma", id: "TRMA-041", pronouns: "he", title: "Male, 24. Dove into a shallow pool, can't move his legs.",
  limit: 1200, transport: 480,
  bystanders: "Friends pulled him out of the pool — he's conscious but can't feel or move his legs.",
  units: [{at: 480, level: "paramedic", name: "Medic 5"}],
  dispatch: ["24M, diving accident, shallow pool.", "Friends report he cannot move his legs.", "Conscious, breathing on his own."],
  update: [],
  impression: "Lying supine at the poolside where his friends pulled him out, conscious and talking, but his skin is warm and dry — not what you'd expect from a hypotensive patient.",
  imps: ["SHOK"],
  condition: "neurogenicShock",
  patient: {age: 24, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"I dove in and hit the bottom — I heard something crack in my neck. I can't feel my legs at all, and I can't move them.\"", kind: "pt",
      evid: "A shallow-water diving mechanism with an audible/felt neck injury and bilateral leg paralysis is a high cervical spinal cord injury until proven otherwise.", find: "OPQRST: shallow-water diving injury, bilateral lower extremity paralysis and anesthesia."}),
    skin: () => ({say: "Warm and dry, even though his pressure is low.", kind: "obs",
      evid: "Warm, dry skin in a hypotensive patient is the real, teachable opposite of ordinary hemorrhagic/hypovolemic shock — no reflex vasoconstriction because the sympathetic nervous system below the injury is disconnected.", find: "Skin: warm, dry, well-perfused — inconsistent with hypovolemic shock."}),
    sample: () => ({say: "\"No other injuries that I can feel — I just can't feel or move anything below my chest.\"", kind: "pt",
      evid: "A sensory level at the chest with no other apparent injury points toward a mid-to-high thoracic or cervical cord lesion, not a limb injury or a simple faint.", find: "SAMPLE: no other complaint, sensory/motor loss below roughly nipple line."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Neurogenic shock from a high spinal cord injury, uncorrected, progressed to cardiovascular collapse.";
    const gaveFluids = s.given.saline || s.given.plasmalyte;
    if (gaveFluids) notes.push("IV fluid was given — a reasonable first step, though this is a distributive (vasodilatory) shock, not a volume-depleted one. If pressure doesn't respond to a reasonable fluid challenge, this patient needs a vasopressor to restore vascular tone, not more volume.");
    notes.push("The real trap on this call is treating this like ordinary hypovolemic shock — cool, clammy skin and a compensatory tachycardia. This patient is warm, dry, and relatively bradycardic despite being hypotensive, because the injury has disconnected his own sympathetic nervous system below the level of the lesion. Full spinal motion restriction and rapid transport are the priority.");
    return {died, cause, notes, correct: s.pi === "SHOK", truth: "Neurogenic shock from a high spinal cord injury (shallow-water diving mechanism)"};},
},

acuteMesentericIschemia: {cat: "medical", id: "ABD-027", pronouns: "she", title: "Female, 74. Severe abdominal pain, out of proportion to exam.",
  limit: 1200, transport: 480,
  bystanders: "Her son called — says her pain came on suddenly about an hour ago and is unbearable.",
  units: [{at: 480, level: "paramedic", name: "Medic 8"}],
  dispatch: ["74F, sudden severe abdominal pain.", "Known history of atrial fibrillation per son.", "Conscious, in severe distress."],
  update: [],
  impression: "Writhing on the bed, clutching her abdomen, in obvious severe pain — but when you press on her belly, it's soft, not the rigid board you'd expect from how much pain she's in.",
  imps: ["ABDP"],
  condition: "acuteMesentericIschemia",
  patient: {age: 74, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's a 10, it came on all at once about an hour ago, out of nowhere. It's everywhere in my belly, constant, nothing makes it better.\"", kind: "pt",
      evid: "Sudden-onset, severe, diffuse abdominal pain that is disproportionate to a soft, non-rigid exam is the single classic red flag for acute mesenteric ischemia — the exam looks far better than the patient feels.", find: "OPQRST: sudden onset ~1hr ago, severe, diffuse, constant pain, 10/10."}),
    sample: () => ({say: "Her son: \"She's had irregular heartbeat problems for years, atrial fibrillation, takes a blood thinner for it — or she's supposed to, she's not always great about it.\"", kind: "pt",
      evid: "A history of atrial fibrillation is the classic embolic source for acute mesenteric ischemia — a clot breaks off and lodges in the mesenteric circulation, cutting off blood flow to a segment of bowel.", find: "SAMPLE: chronic atrial fibrillation, inconsistent anticoagulant compliance."}),
    abdo: () => ({say: "Soft, only mildly tender to palpation in all four quadrants — no rigidity, no rebound.", kind: "obs",
      evid: "A soft, unimpressive abdominal exam in a patient reporting 10/10 pain is exactly the mismatch that should raise suspicion, not reassure you — 'pain out of proportion to exam' is the actual diagnostic phrase for this disease.", find: "Abdomen soft, mildly tender, non-rigid, no rebound — pain out of proportion to exam findings."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Acute mesenteric ischemia, unrecognized, progressed to bowel infarction and severe lactic acidosis.";
    notes.push("There is no field treatment that reverses this — the real skill on this call was recognition. Severe, sudden abdominal pain with a soft, benign-looking exam in a patient with atrial fibrillation should raise real suspicion for mesenteric ischemia, not reassurance that 'the belly doesn't feel that bad.'");
    if (s.given.saline || s.given.plasmalyte) notes.push("IV fluids were given — reasonable supportive care while this patient is transported for definitive (surgical/interventional) treatment.");
    notes.push("Rapid transport matters enormously here: this is a race against irreversible bowel infarction, and every extra minute on scene is bowel tissue dying.");
    return {died, cause, notes, correct: s.pi === "ABDP", truth: "Acute mesenteric ischemia (embolic, from atrial fibrillation) — pain out of proportion to exam"};},
},

acuteCholecystitis: {cat: "medical", id: "ABD-028", pronouns: "she", title: "Female, 46. Right upper quadrant pain and fever.",
  limit: 1200, transport: 480,
  bystanders: "Her husband called — says the pain started after dinner and has been getting worse for hours.",
  units: [{at: 480, level: "emt", name: "BLS 11"}],
  dispatch: ["46F, abdominal pain, right upper quadrant.", "Reports fever.", "Conscious, in pain."],
  update: [],
  impression: "Lying on her side on the couch, guarding her right upper abdomen, uncomfortable but able to talk in full sentences.",
  imps: ["ABDP"],
  condition: "acuteCholecystitis",
  patient: {age: 46, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's right up under my ribs on the right, started a few hours ago after we had a big, fatty dinner. It's a steady ache, maybe a 6, and it's kind of moved around to under my shoulder blade too.\"", kind: "pt",
      evid: "RUQ pain radiating to the right shoulder blade after a fatty meal is the classic biliary colic pattern — gallbladder contraction against an obstructing stone.", find: "OPQRST: RUQ pain onset after a fatty meal, radiating to the right scapula, 6/10, several hours duration."}),
    sample: () => ({say: "\"I've had gallstones before on an ultrasound, years ago, never had them taken out. I've had a fever since this afternoon too.\"", kind: "pt",
      evid: "Known gallstones plus a new fever alongside RUQ pain is the real distinguishing feature between simple biliary colic (pain alone) and acute cholecystitis (pain plus inflammation/infection).", find: "SAMPLE: known cholelithiasis, subjective fever since this afternoon."}),
    abdo: () => ({say: "Tender to palpation in the right upper quadrant — she winces and stops breathing in when you push there.", kind: "obs",
      evid: "A positive Murphy's sign (inspiratory arrest on RUQ palpation) is a real, classic bedside finding for acute cholecystitis.", find: "Abdomen: RUQ tenderness with a positive Murphy's sign, no diffuse rigidity."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Untreated acute cholecystitis progressed toward gangrenous cholecystitis and sepsis.";
    notes.push("There is no field treatment that resolves this — antiemetics and analgesia for comfort, and transport for the real fix (imaging and, usually, surgery).");
    notes.push("The fever plus RUQ pain is the tell here: simple biliary colic (a stone temporarily blocking the duct) causes pain alone; the fever means real gallbladder wall inflammation and infection, a step up in urgency.");
    return {died, cause, notes, correct: s.pi === "ABDP", truth: "Acute cholecystitis (RUQ pain, fever, positive Murphy's sign)"};},
},

lowerGIBleed: {cat: "medical", id: "ABD-029", pronouns: "he", title: "Male, 71. Passing large amounts of blood, no pain.",
  limit: 1200, transport: 480,
  bystanders: "His wife found blood in the toilet and called immediately — he says he feels lightheaded but has no pain.",
  units: [{at: 480, level: "paramedic", name: "Medic 7"}],
  dispatch: ["71M, rectal bleeding.", "Large amount of blood reported, no pain.", "Conscious, lightheaded per patient."],
  update: [],
  impression: "Sitting on the edge of the bathtub, pale, a little unsteady, but calm and in no apparent pain.",
  imps: ["HOTN"],
  condition: "lowerGIBleed",
  patient: {age: 71, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"There's no pain at all, that's the strange part. I just went to the bathroom and there was a huge amount of blood — really scared me.\"", kind: "pt",
      evid: "A sudden, painless, brisk lower GI bleed in an older adult is the classic presentation of diverticular hemorrhage — the absence of pain is itself a real, teachable feature, not a reassuring sign.", find: "OPQRST: sudden painless passage of a large volume of blood per rectum."}),
    sample: () => ({say: "\"No real stomach problems before this, no ulcers that I know of. I do take a daily aspirin for my heart.\"", kind: "pt",
      evid: "No prior peptic ulcer history and a painless presentation both point away from a bleeding ulcer and toward a lower GI source (most commonly diverticular) — daily aspirin is a real, if modest, contributing risk factor either way.", find: "SAMPLE: no prior GI disease, daily aspirin use, no other complaint."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Ongoing lower GI hemorrhage, uncorrected, progressed to hemorrhagic shock.";
    if (s.given.saline || s.given.plasmalyte || s.given.blood) notes.push("Volume support was given — the correct move for real, ongoing hemorrhage, even without an external wound to point at.");
    else if (!died) notes.push("No volume support was given for a patient with a real, large-volume internal hemorrhage — the absence of a visible external wound doesn't mean the bleeding isn't real or dangerous.");
    notes.push("Painless bleeding is the actual teaching point here — it's easy to under-triage a comfortable-looking patient with a scary story, but a brisk diverticular bleed can cause real hemorrhagic shock just as fast as a traumatic one.");
    return {died, cause, notes, correct: s.pi === "HOTN", truth: "Lower GI hemorrhage (diverticular bleed) — painless, brisk"};},
},

upperGIBleed: {cat: "medical", id: "ABD-030", pronouns: "he", title: "Male, 58. Vomiting blood, epigastric pain.",
  limit: 1200, transport: 480,
  bystanders: "His coworker called after he vomited a large amount of blood at work.",
  units: [{at: 480, level: "paramedic", name: "Medic 12"}],
  dispatch: ["58M, vomiting blood.", "Coworker reports a large amount.", "Conscious, complaining of stomach pain."],
  update: [],
  impression: "Sitting in a break-room chair, pale and sweaty, an emesis basin with obvious blood beside him.",
  imps: ["HOTN"],
  condition: "upperGIBleed",
  patient: {age: 58, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"My stomach's been burning for weeks, figured it was just stress. Then I threw up and there was blood in it, a lot of it.\"", kind: "pt",
      evid: "Weeks of epigastric burning pain followed by hematemesis is the classic peptic ulcer disease bleed pattern — chronic ulcer pain that finally eroded into a vessel.", find: "OPQRST: weeks of epigastric burning pain, acute hematemesis today."}),
    sample: () => ({say: "\"I take ibuprofen almost every day for my back. Never seen a doctor about the stomach pain, just figured it'd go away.\"", kind: "pt",
      evid: "Daily NSAID use is one of the most common real-world causes of peptic ulcer disease — chronic irritation of the gastric/duodenal lining leading to ulceration and, eventually, bleeding.", find: "SAMPLE: daily NSAID (ibuprofen) use, no prior GI workup."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Ongoing upper GI hemorrhage from a bleeding peptic ulcer, uncorrected, progressed to hemorrhagic shock and airway compromise.";
    if (s.given.saline || s.given.plasmalyte || s.given.blood) notes.push("Volume support was given — the correct move for a real, ongoing GI hemorrhage.");
    notes.push("Active hematemesis is an airway problem as much as a circulation one — positioning to protect the airway and having suction ready matters here, the same way it does for a variceal bleed, even though this is a slower, less catastrophic source than a ruptured varix.");
    notes.push("Chronic daily NSAID use without any prior GI evaluation is the real risk factor here — a common, easy-to-miss cause of a genuinely dangerous bleed.");
    return {died, cause, notes, correct: s.pi === "HOTN", truth: "Upper GI hemorrhage from a bleeding peptic ulcer (chronic NSAID use)"};},
},

acuteLimbIschemia: {cat: "medical", id: "VASC-001", pronouns: "he", title: "Male, 68. Sudden severe pain in his left leg, can't feel it.",
  limit: 1200, transport: 540,
  bystanders: "His wife called — says his leg suddenly became painful, pale, and cold about 40 minutes ago.",
  units: [{at: 480, level: "paramedic", name: "Medic 10"}],
  dispatch: ["68M, sudden severe leg pain.", "Wife reports the leg looks pale and feels cold.", "Conscious, known atrial fibrillation."],
  update: [],
  impression: "Sitting in a recliner, gripping his left leg, in obvious severe pain. The leg is visibly pale compared to the other.",
  imps: ["DYSR"],
  condition: "acuteLimbIschemia",
  patient: {age: 68, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It just started, all of a sudden, maybe 40 minutes ago — this awful pain in my leg, and now it's gone numb and I can't move my toes right.\"", kind: "pt",
      evid: "Sudden-onset severe leg pain with pallor, coldness, numbness, and now weakness is the classic '6 P's' progression of acute arterial occlusion — a real, time-critical limb-threatening emergency.", find: "OPQRST: sudden onset ~40 min ago, severe pain, now numbness and weakness."}),
    sample: () => ({say: "\"I've got that irregular heartbeat thing, atrial fibrillation. I'm supposed to take a blood thinner for it but I run out sometimes.\"", kind: "pt",
      evid: "Atrial fibrillation with inconsistent anticoagulation is the classic embolic source for acute limb ischemia, the same mechanism as an embolic stroke or mesenteric ischemia, just a different final destination for the clot.", find: "SAMPLE: chronic atrial fibrillation, inconsistent anticoagulant compliance."}),
    pedL: () => ({say: "No pulse at all in the left foot — pale, cold to the touch compared to the right.", kind: "crit",
      find: "Left pedal pulse absent; foot pale and cold. Right pedal pulse normal.", evid: "An absent pulse with a cold, pale foot confirms complete arterial occlusion — the clock is running on limb viability."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Prolonged, untreated acute limb ischemia progressed to irreversible tissue loss and systemic reperfusion complications.";
    notes.push("There is no field treatment that restores the blood flow itself — this is a genuine surgical/interventional emergency (embolectomy or thrombolysis). The field priority is rapid recognition and fast transport to a facility that can intervene; every extra minute is muscle and nerve tissue dying.");
    notes.push("The '6 P's' — pain, pallor, pulselessness, paresthesia, paralysis, poikilothermia (coldness) — are the real, teachable progression here, and paralysis is a late, ominous sign that the window for saving the limb is closing.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Acute limb ischemia (embolic, from atrial fibrillation)"};},
},

deepVeinThrombosis: {cat: "medical", id: "VASC-002", pronouns: "she", title: "Female, 63. Swollen, painful right calf.",
  limit: 1200, transport: 600,
  bystanders: "Her daughter called after noticing her mother limping and complaining of leg pain for two days.",
  units: [{at: 480, level: "emt", name: "BLS 6"}],
  dispatch: ["63F, leg pain and swelling.", "Two days duration per daughter.", "Conscious, ambulatory but limping."],
  update: [],
  impression: "Sitting on the couch with her right leg elevated, visibly swollen compared to the left, uncomfortable but in no acute distress.",
  imps: ["DYSR"],
  condition: "deepVeinThrombosis",
  patient: {age: 63, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"My right calf's been aching and swollen for a couple of days now, it's warm to the touch. I just got back from a long flight last week.\"", kind: "pt",
      evid: "Unilateral calf pain, swelling, and warmth after a recent long flight (venous stasis from prolonged immobility) is the classic presentation of a deep vein thrombosis.", find: "OPQRST: 2 days of unilateral calf pain/swelling/warmth, recent long-haul travel."}),
    sample: () => ({say: "\"I had knee surgery about a month ago too, if that matters. No chest pain, no trouble breathing, I feel fine otherwise.\"", kind: "pt",
      evid: "Recent surgery is a second, independent DVT risk factor stacking on top of recent travel — and the ABSENCE of chest pain or shortness of breath is itself worth noting, since it means this hasn't (yet) embolized to the lungs.", find: "SAMPLE: recent knee surgery (~1 month ago), no chest pain or dyspnea currently."}),
    pedL: () => ({say: "Pulse present and strong, foot warm and well-perfused despite the calf swelling.", kind: "obs",
      find: "Left pedal pulse present and strong; foot warm, well-perfused.", evid: "A strong distal pulse with a warm foot confirms this is a VENOUS problem (outflow obstruction), not an arterial one — the real, teachable contrast against acute limb ischemia's absent pulse and cold foot."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "An undiagnosed deep vein thrombosis embolized to the lungs.";
    notes.push("There is no field drug that treats this directly — the real skill here is recognition and NOT provoking embolization: don't aggressively palpate, massage, or manipulate the swollen leg any more than necessary, and keep her calm and still for transport.");
    notes.push("The actual danger of a DVT isn't the leg itself — it's the possibility of a piece breaking off and traveling to the lungs as a pulmonary embolism. Watching for any new chest pain or shortness of breath en route is a real, ongoing part of managing this call, not a formality.");
    return {died, cause, notes, correct: s.pi === "DYSR", truth: "Deep vein thrombosis (recent travel and surgery as risk factors), not yet embolized"};},
},

panicAttackHyperventilation: {cat: "medical", id: "PSYC-001", pronouns: "she", title: "Female, 27. Rapid breathing, tingling in her hands.",
  limit: 900, transport: 420,
  bystanders: "Her roommate called — says she's been breathing very fast since an argument with her ex on the phone.",
  units: [{at: 420, level: "emt", name: "BLS 3"}],
  dispatch: ["27F, hyperventilating.", "Roommate reports an emotionally upsetting phone call just before onset.", "Conscious, anxious."],
  update: ["Patient: \"My hands feel weird, like they're tingling and curling up, and I feel dizzy.\""],
  impression: "Sitting on the edge of her bed, breathing rapidly and visibly, hands drawn up and tense, clearly frightened.",
  imps: ["ANXY"],
  condition: "panicAttackHyperventilation",
  patient: {age: 27, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "She speaks in short, breathless bursts. \"I can't — I can't catch my breath. My hands are cramping up, I feel like I'm dying.\"", kind: "pt",
      evid: "Rapid breathing with hand/perioral tingling and carpopedal spasm, triggered by acute emotional distress, is the classic hyperventilation syndrome picture — real respiratory alkalosis from over-breathing, not a primary cardiac or respiratory emergency, but genuinely frightening and genuinely physiological.", find: "OPQRST: acute onset after an emotionally distressing phone call, rapid breathing, bilateral hand paresthesias/cramping."}),
    sample: () => ({say: "\"I get panic attacks sometimes, this feels like the worst one I've had. No asthma, no heart problems, nothing like that.\"", kind: "pt",
      evid: "A known history of panic attacks with a clear emotional trigger, and no cardiac/respiratory/endocrine history, supports hyperventilation syndrome — but this diagnosis should still be made by ruling things out, not assumed on first impression.", find: "SAMPLE: known history of panic attacks, no cardiac/respiratory/diabetic history, no medications."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something other than simple hyperventilation syndrome was actually happening and was missed.";
    const gaveO2 = s.doses.some(d => ["o2nrb", "o2nc", "bvm"].includes(d.id));
    if (gaveO2) notes.push("Supplemental oxygen was given here — worth a second look: this patient is hyperventilating, not hypoxic, and high-flow oxygen doesn't treat the actual mechanism (a low CO2 from over-breathing, not a low O2). It's not dangerous, but it isn't the lever that helps her, either.");
    notes.push("The real move on this call is calm, coached breathing and reassurance — slowing her rate down lets her PaCO2 normalize and the tingling/cramping resolve on its own. This is a real, self-limited physiological state, not a progressive disease.");
    notes.push("The actual skill being tested is recognition through exclusion, not treatment: a clear emotional trigger and a benign history support this diagnosis, but a pulmonary embolism, DKA, or a cardiac event can all present with rapid breathing too, and a good crew keeps that differential open rather than closing it on first impression.");
    return {died, cause, notes, correct: s.pi === "ANXY", truth: "Panic attack with hyperventilation syndrome — a real, self-limited physiological state, not a progressive disease"};},
},

ectopicPregnancyRuptured: {cat: "medical", id: "OBGY-044", pronouns: "she", title: "Female, 26. Sudden severe pelvic pain, near-syncope.",
  limit: 1200, transport: 480,
  bystanders: "Her roommate called — says she collapsed in the bathroom and is pale and clammy.",
  units: [{at: 480, level: "paramedic", name: "Medic 4"}],
  dispatch: ["26F, sudden severe abdominal/pelvic pain.", "Near-syncope reported.", "Conscious, in severe distress."],
  update: [],
  impression: "Curled on her side on the bathroom floor, pale, sweaty, guarding her lower abdomen.",
  imps: ["HOTN"],
  condition: "ectopicPregnancyRuptured",
  patient: {age: 26, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It hit all at once, maybe twenty minutes ago — this sharp, tearing pain low on my right side. Then I felt like I was going to pass out.\"", kind: "pt",
      evid: "Sudden, severe, unilateral lower abdominal pain with near-syncope in a woman of reproductive age is the classic presentation of a ruptured ectopic pregnancy — hemoperitoneum from a tubal rupture.", find: "OPQRST: sudden-onset severe right lower quadrant pain ~20 min ago, near-syncope."}),
    sample: () => ({say: "\"My last period was... actually, I think I missed it. I hadn't thought much of it. I'm not on birth control.\"", kind: "pt",
      evid: "A missed period in a sexually active woman with sudden unilateral pelvic pain and signs of hemorrhage should raise ectopic pregnancy until proven otherwise — a positive pregnancy test plus hemorrhagic shock IS the diagnosis in the field.", find: "SAMPLE: last menstrual period overdue, no contraception, otherwise healthy."}),
    abdo: () => ({say: "Tender and guarded in the lower abdomen, worse on the right, with rebound.", kind: "warn",
      evid: "Peritoneal signs (rebound tenderness) alongside a missed period and hemorrhagic shock strongly support intraperitoneal hemorrhage from a ruptured ectopic pregnancy.", find: "Abdomen: lower quadrant tenderness with rebound, worse right side."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Ruptured ectopic pregnancy, uncorrected, progressed to fatal hemorrhagic shock.";
    if (s.given.saline || s.given.plasmalyte || s.given.blood) notes.push("Volume support was given — the right supportive move while she's transported for the real, definitive fix (emergency surgery).");
    else if (!died) notes.push("No volume support was given for a patient in real, ongoing hemorrhagic shock from internal bleeding.");
    notes.push("There is no field treatment that stops this bleeding — a ruptured ectopic pregnancy is a surgical emergency. Rapid recognition (missed period plus sudden unilateral pain plus shock) and rapid transport are the actual interventions that save her.");
    return {died, cause, notes, correct: s.pi === "HOTN", truth: "Ruptured ectopic pregnancy — hemoperitoneum from a tubal rupture"};},
},

placentalAbruption: {cat: "medical", id: "OBGY-045", pronouns: "she", title: "Female, 29. 36 weeks pregnant, sudden abdominal pain and bleeding.",
  limit: 1200, transport: 480,
  bystanders: "Her husband called — says she suddenly doubled over in pain and there's dark vaginal bleeding.",
  units: [{at: 480, level: "paramedic", name: "Medic 9"}],
  dispatch: ["29F, 36 weeks pregnant, sudden abdominal pain.", "Vaginal bleeding reported.", "Conscious, in severe pain."],
  update: [],
  impression: "Lying on her side, visibly pregnant, rigid and tender abdomen, dark blood staining her clothing.",
  imps: ["OBEM"],
  condition: "placentalAbruption",
  patient: {age: 29, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It came on all at once, this constant, tearing pain — it's not like a contraction, it doesn't come and go. And there's dark blood, not bright red.\"", kind: "pt",
      evid: "Sudden-onset, CONSTANT (non-crampy) abdominal pain with dark vaginal bleeding in a third-trimester pregnancy is the classic placental abruption picture — the placenta has torn away from the uterine wall.", find: "OPQRST: sudden constant abdominal pain, dark vaginal bleeding, no history of trauma."}),
    sample: () => ({say: "\"I have high blood pressure, been on medication for it since early in the pregnancy. No falls, no trauma, nothing like that.\"", kind: "pt",
      evid: "Chronic hypertension is one of the strongest documented risk factors for placental abruption — the elevated pressure damages the placental vasculature over time.", find: "SAMPLE: chronic hypertension in pregnancy, no trauma."}),
    abdo: () => ({say: "Rigid and tender throughout, tense to palpation — the uterus itself feels board-like.", kind: "crit",
      evid: "A rigid, tender ('woody') uterus is a classic abruption finding — it reflects concealed hemorrhage and blood tracking into the myometrium, and means the true blood loss is likely far worse than the visible vaginal bleeding alone suggests.", find: "Uterus rigid, tender, board-like — concealed hemorrhage likely exceeds visible bleeding."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Placental abruption, uncorrected, progressed to fatal maternal hemorrhagic shock.";
    notes.push("Positioning her tilted to the left (not flat on her back) relieves aortocaval compression from the gravid uterus and genuinely improves her venous return — a real, mechanism-based intervention, not just comfort.");
    if (s.given.saline || s.given.plasmalyte || s.given.blood) notes.push("Volume support was given — appropriate here, since a real, large fraction of this hemorrhage is CONCEALED behind the placenta and not visible as external bleeding.");
    else if (!died) notes.push("No volume support was given — a rigid, board-like uterus means significant concealed hemorrhage even if the visible vaginal bleeding looks modest.");
    notes.push("There is no field treatment that stops the separation itself — rapid transport for emergency delivery is the definitive fix, for both mother and baby.");
    return {died, cause, notes, correct: s.pi === "OBEM", truth: "Placental abruption — painful, dark bleeding, rigid uterus, concealed hemorrhage"};},
},

placentaPrevia: {cat: "medical", id: "OBGY-046", pronouns: "she", title: "Female, 31. 34 weeks pregnant, painless vaginal bleeding.",
  limit: 1200, transport: 480,
  bystanders: "Her mother called — says there's a lot of bright red blood but she isn't in pain.",
  units: [{at: 480, level: "paramedic", name: "Medic 6"}],
  dispatch: ["31F, 34 weeks pregnant, vaginal bleeding.", "Patient denies pain.", "Conscious, anxious but comfortable."],
  update: [],
  impression: "Sitting up on the couch, visibly pregnant, bright red blood on a towel beside her, calm and in no apparent pain.",
  imps: ["OBEM"],
  condition: "placentaPrevia",
  patient: {age: 31, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"There's no pain at all, that's what's so scary about it — I just noticed bright red blood, no cramping, nothing.\"", kind: "pt",
      evid: "PAINLESS bright-red vaginal bleeding in the third trimester is the classic placenta previa presentation — a placenta implanted over or near the cervix bleeding as it thins, without the uterine irritability abruption produces.", find: "OPQRST: painless bright-red vaginal bleeding, no contractions, no trauma."}),
    sample: () => ({say: "\"My ultrasound a few weeks ago showed the placenta was low-lying, close to my cervix. My doctor said we'd keep an eye on it.\"", kind: "pt",
      evid: "A known low-lying/previa placenta on prior ultrasound, now bleeding, confirms the diagnosis rather than leaving it a guess — and it is the reason a digital vaginal exam must never be performed in the field or the ED before imaging.", find: "SAMPLE: known low-lying placenta on recent ultrasound, no prior bleeding episodes."}),
    abdo: () => ({say: "Soft, non-tender, no rigidity — the uterus is relaxed between contractions, and she reports none.", kind: "obs",
      evid: "A soft, non-tender, non-contracting uterus alongside painless bleeding is the real contrast with placental abruption's rigid, tender exam — the same bleeding symptom, a genuinely different mechanism.", find: "Uterus soft, non-tender, no palpable contractions."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Placenta previa hemorrhage, uncorrected, progressed to fatal maternal hemorrhagic shock.";
    notes.push("No digital vaginal exam should ever be performed on suspected previa in the field — probing near a placenta covering the cervix can trigger catastrophic hemorrhage.");
    if (s.given.saline || s.given.plasmalyte || s.given.blood) notes.push("Volume support was given for real, ongoing blood loss — reasonable, even though this bleed is typically slower and more self-limited than an abruption's.");
    notes.push("The painless-versus-painful distinction is the actual field teaching point here: painless bright bleeding suggests previa, painful dark bleeding with a rigid uterus suggests abruption — the same complaint, two different diseases, two different (though both surgical) endpoints.");
    return {died, cause, notes, correct: s.pi === "OBEM", truth: "Placenta previa — painless bright-red vaginal bleeding, soft non-tender uterus"};},
},

ovarianTorsion: {cat: "medical", id: "OBGY-047", pronouns: "she", title: "Female, 24. Sudden severe one-sided pelvic pain.",
  limit: 1200, transport: 480,
  bystanders: "Her girlfriend called — says the pain came on suddenly during exercise and hasn't let up.",
  units: [{at: 480, level: "emt", name: "BLS 5"}],
  dispatch: ["24F, sudden severe pelvic pain.", "Nausea reported.", "Conscious, in severe distress."],
  update: [],
  impression: "Curled on her side on the gym floor, one hand pressed to her lower right abdomen, wincing with every movement.",
  imps: ["ABDP"],
  condition: "ovarianTorsion",
  patient: {age: 24, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It hit out of nowhere, like a 10, sharp and constant on my lower right side. I threw up once from how bad it is.\"", kind: "pt",
      evid: "Sudden-onset, severe, unilateral pelvic pain with nausea/vomiting — often during exercise or a sudden movement — is the classic ovarian torsion presentation, from the ovary twisting on its own vascular pedicle.", find: "OPQRST: sudden severe unilateral pelvic pain during exercise, associated vomiting."}),
    sample: () => ({say: "\"I've had an ovarian cyst before, they told me on an ultrasound a couple years ago. Nothing since then though.\"", kind: "pt",
      evid: "A known ovarian cyst is a real risk factor for torsion — an enlarged ovary is more likely to twist on its pedicle.", find: "SAMPLE: known ovarian cyst history, otherwise unremarkable."}),
    abdo: () => ({say: "Tender in the right lower quadrant, no rigidity, no rebound — she guards but the exam is otherwise unremarkable.", kind: "warn",
      evid: "A focal, unilateral tender exam without peritoneal signs is consistent with torsion — the pedicle is twisted, not torn, so there's real severe pain without the rigidity a rupture or hemorrhage would produce.", find: "Abdomen: right lower quadrant tenderness, no rigidity, no rebound."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Something other than simple ovarian torsion was actually happening and was missed.";
    notes.push("There is no field treatment that untwists an ovary — analgesia for comfort and prompt transport for surgical evaluation are the correct moves. Time matters: a torsed ovary can lose viability the longer it stays twisted.");
    notes.push("The exam here — severe pain but no rigidity or rebound — is the real teaching point: this is NOT an acute abdomen from rupture or hemorrhage, but it is still a genuine surgical time-critical emergency.");
    return {died, cause, notes, correct: s.pi === "ABDP", truth: "Ovarian torsion — sudden severe unilateral pain, no peritoneal signs"};},
},

rupturedOvarianCyst: {cat: "medical", id: "OBGY-048", pronouns: "she", title: "Female, 27. Sudden pelvic pain, lightheaded.",
  limit: 1200, transport: 480,
  bystanders: "Her roommate called — says she suddenly cried out in pain and now seems a little woozy.",
  units: [{at: 480, level: "emt", name: "BLS 3"}],
  dispatch: ["27F, sudden pelvic pain.", "Lightheadedness reported.", "Conscious, in pain."],
  update: [],
  impression: "Sitting on the edge of the couch, one arm braced across her lower abdomen, a little pale.",
  imps: ["ABDP"],
  condition: "rupturedOvarianCyst",
  patient: {age: 27, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It was sudden, sharp, on my lower left side, maybe a 20 minutes ago. It's easing off a little now but I still feel woozy when I stand.\"", kind: "pt",
      evid: "Sudden-onset unilateral pelvic pain that eases somewhat over time, with lightheadedness, is consistent with a ruptured ovarian cyst — real but usually self-limited bleeding into the peritoneal cavity.", find: "OPQRST: sudden unilateral pelvic pain ~20 min ago, easing, associated lightheadedness."}),
    sample: () => ({say: "\"I'm right in the middle of my cycle, actually. No known cysts that I'm aware of, though I haven't had an ultrasound in a while.\"", kind: "pt",
      evid: "Mid-cycle timing fits a ruptured corpus luteum cyst — the structure that forms after ovulation and is a common, benign cause of this presentation.", find: "SAMPLE: mid-menstrual-cycle timing, no known prior cyst diagnosis."}),
    abdo: () => ({say: "Mildly tender in the lower left quadrant, no rigidity — some free fluid feel to the exam but nothing dramatic.", kind: "obs",
      evid: "A mild, non-rigid exam with a real hemodynamic signal (lightheadedness) fits a self-limited hemoperitoneum from a ruptured cyst — real bleeding, but usually not enough to cause hemorrhagic shock outright.", find: "Abdomen: mild left lower quadrant tenderness, no rigidity, no rebound."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Ongoing hemorrhage from a ruptured ovarian cyst, uncorrected, progressed to hemorrhagic shock.";
    if (s.given.saline || s.given.plasmalyte) notes.push("IV fluids were given for her lightheadedness — reasonable supportive care while she's transported for evaluation.");
    notes.push("Most ruptured ovarian cysts tamponade on their own and don't need surgery — but the field cannot reliably distinguish a self-limited bleed from one that will keep going, which is why transport and monitoring (not reassurance alone) is the correct call.");
    notes.push("The contrast with ovarian torsion is the real lesson here: torsion is severe pain WITHOUT bleeding, a ruptured cyst is pain WITH a real, if usually modest, hemoperitoneum — the same complaint, genuinely different mechanisms.");
    return {died, cause, notes, correct: s.pi === "ABDP", truth: "Ruptured ovarian cyst — unilateral pain, modest hemoperitoneum, usually self-limited"};},
},

abdominalAorticAneurysm: {cat: "medical", id: "VASC-003", pronouns: "he", title: "Male, 71. Sudden severe abdominal and back pain.",
  limit: 1200, transport: 480,
  bystanders: "His wife called — says he suddenly grabbed his back and abdomen and went pale.",
  units: [{at: 480, level: "paramedic", name: "Medic 2"}],
  dispatch: ["71M, sudden severe abdominal/back pain.", "Near-syncope reported.", "Conscious, in severe distress."],
  update: [],
  impression: "Lying on the kitchen floor, pale and diaphoretic, both hands pressed to his abdomen.",
  imps: ["HOTN"],
  condition: "abdominalAorticAneurysm",
  patient: {age: 71, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "He grimaces, speaking through gritted teeth. \"It's tearing — my belly and straight through to my back, all at once, worst pain of my life.\"", kind: "pt",
      evid: "Sudden, severe, tearing abdominal pain radiating to the back in an older adult is the classic presentation of a ruptured abdominal aortic aneurysm — a real vascular catastrophe, not simple abdominal pain.", find: "OPQRST: sudden severe tearing abdominal pain radiating to the back."}),
    sample: () => ({say: "His wife: \"He's had high blood pressure for years, and he's a longtime smoker. He was told he had an 'aneurysm' on a scan a while back but never followed up on it.\"", kind: "pt",
      evid: "Known chronic hypertension, a smoking history, and a documented but unaddressed aneurysm are the real, textbook risk factors and clinical setup for AAA rupture.", find: "SAMPLE: chronic hypertension, smoking history, known but unmanaged AAA."}),
    abdo: () => ({say: "A tender, pulsatile mass is palpable in the mid-abdomen.", kind: "crit",
      evid: "A pulsatile abdominal mass alongside tearing pain and hypotension is the classic triad for ruptured AAA — a real, if not always present, exam finding when it is there.", find: "Abdomen: pulsatile, tender mid-abdominal mass."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Ruptured abdominal aortic aneurysm, uncorrected, progressed to fatal hemorrhagic shock.";
    notes.push("There is no field treatment that repairs this — only emergency surgery does. The field skill is rapid recognition and rapid transport to a facility capable of vascular intervention, not delay for procedures that don't change the outcome.");
    if (s.given.saline || s.given.plasmalyte || s.given.blood) notes.push("Some volume support was given — reasonable for hypotension, but aggressive fluid resuscitation before surgical control can worsen an unstable retroperitoneal bleed by raising pressure against a leaking vessel; permissive hypotension (treat toward adequate mentation/perfusion, not a normal number) is the taught approach here.");
    notes.push("He can look transiently stable — 'in extremis but talking' — before decompensating suddenly once the retroperitoneal space can no longer tamponade the bleed. That trajectory, not a single vitals snapshot, is the actual danger.");
    return {died, cause, notes, correct: s.pi === "HOTN", truth: "Ruptured abdominal aortic aneurysm — tearing pain, pulsatile mass, retroperitoneal hemorrhage"};},
},

acutePancreatitis: {cat: "medical", id: "ABD-031", pronouns: "he", title: "Male, 52. Severe abdominal pain radiating to the back.",
  limit: 1200, transport: 480,
  bystanders: "His son called — says the pain started after a night of heavy drinking and has been getting worse.",
  units: [{at: 480, level: "emt", name: "BLS 9"}],
  dispatch: ["52M, severe abdominal pain.", "Vomiting reported.", "Conscious, in severe distress."],
  update: [],
  impression: "Leaning forward on the edge of the bed, knees drawn up, an emesis basin beside him, in obvious distress.",
  imps: ["ABDP"],
  condition: "acutePancreatitis",
  patient: {age: 52, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It's a constant, boring pain, right in the middle of my belly, going straight through to my back. Leaning forward is the only thing that helps at all. I've thrown up a few times.\"", kind: "pt",
      evid: "Constant epigastric pain radiating straight through to the back, relieved by leaning forward, with associated vomiting, is the classic acute pancreatitis presentation.", find: "OPQRST: constant epigastric pain radiating to the back, relieved by leaning forward, repeated vomiting."}),
    sample: () => ({say: "His son: \"He was out drinking pretty heavily last night with some buddies, more than usual. He's had stomach trouble before but nothing like this.\"", kind: "pt",
      evid: "A recent heavy alcohol binge is one of the two most common causes of acute pancreatitis (alongside gallstones) — real, direct toxic injury to the pancreas from the alcohol load.", find: "SAMPLE: heavy alcohol intake the night before onset, no other significant history offered."}),
    abdo: () => ({say: "Tender in the epigastrium, some voluntary guarding, no rigidity or rebound.", kind: "warn",
      evid: "Epigastric tenderness without frank rigidity or rebound fits pancreatitis — the inflammation is real and severe, but this is not typically a peritonitic, board-like abdomen the way a perforation would be.", find: "Abdomen: epigastric tenderness, voluntary guarding, no rigidity or rebound."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Severe acute pancreatitis, uncorrected, progressed to systemic capillary leak and shock.";
    if (s.given.saline || s.given.plasmalyte) notes.push("IV fluids were given — genuinely the correct move here: pancreatitis causes real fluid loss into the tissues around the inflamed pancreas ('third-spacing'), not just from vomiting, and this patient needs real volume replacement.");
    else if (!died) notes.push("No IV fluids were given — this patient is losing real intravascular volume into the inflamed retroperitoneum, not just from vomiting, and needs volume support even without visible blood loss.");
    notes.push("There is no field treatment that reverses pancreatic inflammation — supportive care (fluids, antiemetics, analgesia) and transport for monitoring and, if severe, ICU-level care are the correct moves.");
    return {died, cause, notes, correct: s.pi === "ABDP", truth: "Acute pancreatitis (alcohol-induced) — epigastric pain radiating to the back, third-spacing"};},
},

bowelObstruction: {cat: "medical", id: "ABD-032", pronouns: "she", title: "Female, 67. Crampy abdominal pain, vomiting, no bowel movement.",
  limit: 1200, transport: 480,
  bystanders: "Her daughter called — says she's had crampy pain and vomiting for a day and hasn't had a bowel movement in three days.",
  units: [{at: 480, level: "emt", name: "BLS 7"}],
  dispatch: ["67F, abdominal pain and vomiting.", "No bowel movement in several days.", "Conscious, uncomfortable."],
  update: [],
  impression: "Lying on the couch, visibly uncomfortable, abdomen looks distended, an emesis basin nearby.",
  imps: ["ABDP"],
  condition: "bowelObstruction",
  patient: {age: 67, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"It comes in waves, this cramping pain, gets bad then eases off for a bit then comes right back. I've thrown up a few times and haven't been able to go to the bathroom in three days.\"", kind: "pt",
      evid: "Crampy, waxing-and-waning ('colicky') abdominal pain with vomiting and no bowel movement/gas passage is the classic bowel obstruction triad — mechanical blockage of GI transit.", find: "OPQRST: colicky abdominal pain, repeated vomiting, no bowel movement in 3 days."}),
    sample: () => ({say: "Her daughter: \"She had abdominal surgery a few years back, gallbladder removal. Nothing since then.\"", kind: "pt",
      evid: "Prior abdominal surgery is the single most common cause of bowel obstruction in adults — scar tissue (adhesions) from the old surgery can kink or trap a loop of bowel.", find: "SAMPLE: prior abdominal surgery (cholecystectomy), no other significant history."}),
    abdo: () => ({say: "Visibly distended, tympanic to percussion, diffusely tender but soft, high-pitched bowel sounds.", kind: "warn",
      evid: "Distension, tympany, and high-pitched ('tinkling') bowel sounds are the classic exam findings for mechanical bowel obstruction — the bowel proximal to the blockage is dilated and full of gas and fluid.", find: "Abdomen: distended, tympanic, diffusely tender, high-pitched bowel sounds."}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Bowel obstruction, uncorrected, progressed to bowel ischemia and shock.";
    if (s.given.saline || s.given.plasmalyte) notes.push("IV fluids were given — appropriate here: significant volume is sequestered into the obstructed, distended bowel and lost through vomiting, and this patient is genuinely volume-depleted even without any visible external fluid loss.");
    else if (!died) notes.push("No IV fluids were given — this patient has real, ongoing volume loss into the obstructed bowel and from vomiting, even without any visible external fluid loss.");
    notes.push("There is no field fix for a mechanical obstruction — supportive care (fluids, antiemetics) and transport for imaging and, often, surgery are the correct moves. Colicky, wave-like pain with distension and a surgical history is the pattern to recognize.");
    return {died, cause, notes, correct: s.pi === "ABDP", truth: "Small bowel obstruction (adhesions) — colicky pain, distension, high-pitched bowel sounds"};},
},

// Lithium toxicity (queue item 7, Toxicology — TOX-010). An elderly
// maintenance-lithium patient, dehydrated after a stomach bug, presenting
// acute-on-chronic — see conditions.js for the full mechanism.
lithiumToxicity: {cat: "medical", id: "TOX-010", pronouns: "she", title: "Female, 71. Confused, hands shaking, on lithium for bipolar disorder.",
  limit: 900, transport: 480,
  bystanders: "Her son, who says she's had a stomach bug for three days and hasn't been keeping fluids down.",
  units: [{at: 420, level: "emt", name: "BLS 4"}],
  dispatch: ["71F, altered mental status.", "Son reports she's on lithium for bipolar disorder.", "Hands shaking, confused."],
  update: [],
  impression: "Sitting in a kitchen chair, hands trembling visibly, slow to answer questions and repeating herself.",
  imps: ["ODPO", "ALOC"],
  condition: "lithiumToxicity",
  patient: {age: 71, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Her son: \"She's been on lithium for years for her bipolar disorder, same dose the whole time. She's had a stomach bug since Sunday, throwing up, barely drinking anything. She started slurring her words and shaking this morning.\"", kind: "pt",
      evid: "A stable maintenance lithium dose plus a new dehydrating illness is the classic real-world mechanism for acute-on-chronic lithium toxicity — the drug is cleared by the kidney and reabsorbed alongside sodium, so volume depletion raises the level even without any change in dose.", find: "SAMPLE: chronic lithium for bipolar disorder, several days of vomiting/poor intake, new tremor and confusion."}),
    opqrst: () => ({say: "\"My hands... they won't... stop...\" She trails off mid-sentence and has to be redirected.", kind: "pt",
      evid: "A coarse tremor progressing alongside altered mentation, in a patient on chronic lithium with a clear precipitant for toxicity, is the real neurotoxic picture — not a psychiatric symptom to write off.", find: "OPQRST unobtainable — patient too confused to give a reliable history; coarse tremor noted throughout."}),
    // Reads pat.metabolicEncephalopathy live — the real, graded confusion
    // this condition's own conditions.js progress() derives directly from
    // the serum level, not scripted text.
    loc: (s) => {
      const enc = s.patient?.metabolicEncephalopathy ?? 0;
      if (enc > 0.6) return {say: "Barely rousable to voice, mumbling incoherently between episodes of coarse, jerking tremor.", kind: "crit",
        evid: "Severe lithium neurotoxicity progresses from tremor through confusion to stupor and seizure as the level climbs — this is real, worsening CNS toxicity, not baseline dementia.", find: "LOC: severely altered, minimally responsive, coarse tremor."};
      if (enc > 0.3) return {say: "Confused, slow to answer, repeats the same question twice.", kind: "warn",
        evid: "Progressive confusion on top of a known toxic lithium exposure is the expected trajectory of this toxidrome.", find: "LOC: confused, disoriented, slow verbal responses."};
      return {say: "Alert but noticeably slow, hands trembling.", kind: "obs",
        evid: "Early lithium neurotoxicity — tremor with only mild cognitive slowing.", find: "LOC: alert, mildly slowed, tremor present."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Lithium neurotoxicity, unmanaged, progressed to seizure and airway compromise.";
    if (s.given.saline || s.given.plasmalyte) notes.push("IV isotonic fluid was given — the right field move: volume expansion raises GFR and reduces proximal-tubule reabsorption of lithium (which is reabsorbed alongside sodium), genuinely helping the kidney clear it. It will not normalize a severe level on scene, but it is the correct direction.");
    else notes.push("No IV fluid was given. Isotonic saline is the real field intervention here — volume expansion promotes renal lithium clearance, even though it cannot fix a severe level within this call.");
    notes.push("There is no field-administrable antidote for lithium toxicity. Hemodialysis is the actual definitive treatment for a level this high, and it is not something this crew can deliver — recognition, supportive care, seizure precautions, and prompt transport are the complete field job.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "ALOC", truth: "Acute-on-chronic lithium toxicity — dehydration-driven reduced renal clearance in a chronic maintenance patient, producing tremor progressing to altered mentation and seizure risk"};},
},

// Iron overdose (queue item 7, Toxicology — TOX-011). A toddler's
// accidental ingestion of adult prenatal iron tablets — the real,
// classic pediatric iron-overdose presentation. See conditions.js for the
// full mechanism, including the honest statement of the delayed
// mitochondrial/metabolic-acidosis phase this call's own window cannot
// reach.
ironOverdose: {cat: "medical", id: "TOX-011", pronouns: "she", title: "Female, 2. Found with an open bottle of her mother's prenatal vitamins.",
  limit: 900, transport: 480,
  bystanders: "Her mother, holding the empty pill bottle, badly shaken. \"I don't know how many she got into. Maybe twenty minutes ago. She's thrown up twice already.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 9"}],
  dispatch: ["2F, possible medication ingestion.", "Mother reports prenatal vitamins, unknown quantity.", "Vomiting."],
  update: [],
  impression: "A toddler on her mother's lap, fussy and pale, an emesis basin with dark, blood-tinged vomit beside her.",
  imps: ["ODPO", "ABDP"],
  condition: "ironOverdose",
  locWeights: {house: 8, apartment: 2},
  patient: {age: 2, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Her mother: \"They're prenatal iron tablets, the big pink ones. The bottle was almost full yesterday. She's never had anything like this before, no allergies, nothing.\"", kind: "pt",
      evid: "A young child with access to an adult iron supplement, an unknown but potentially large ingested quantity, and rapid-onset vomiting is the classic setup for pediatric iron overdose — a leading cause of fatal pediatric poisoning historically, specifically because prenatal iron looks and tastes like candy to a toddler.", find: "SAMPLE: prenatal iron tablet ingestion approximately 20 minutes ago, quantity unknown, no prior medical history."}),
    opqrst: () => ({say: "She won't settle, crying and clutching at her stomach, and keeps retching.", kind: "pt",
      evid: "Iron is directly corrosive to the GI mucosa on contact — this early abdominal pain and repeated vomiting is real, direct chemical injury, not just anxiety from the scene.", find: "OPQRST: abdominal pain and repeated vomiting since the ingestion, no other complaint (limited by patient's age)."}),
    // Reads pat.activeBleedRate live — the real, direct-corrosive GI
    // hemorrhage this condition's own conditions.js progress() derives,
    // not scripted text.
    abdo: (s, v) => {
      const bleeding = (s.patient?.activeBleedRate ?? 0) > 0.02;
      return {say: bleeding ? "Soft but diffusely tender, and the vomit in the basin is clearly blood-streaked." : "Soft, diffusely tender to palpation, no rigidity yet.",
        kind: v.hr > 150 ? "warn" : "obs",
        evid: "Direct corrosive injury from ingested iron causes real gastric and small-bowel mucosal damage — hematemesis and abdominal tenderness in this window are the expected, mechanistic early findings, not incidental.",
        find: "Abdomen: soft, diffusely tender, no peritoneal signs."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Iron overdose, unmanaged, progressed with ongoing GI hemorrhage and hypovolemic shock.";
    notes.push("This is early-phase iron overdose — direct corrosive GI injury (vomiting, abdominal pain, GI bleeding) from the ingested tablets themselves. There is no field antidote (deferoxamine chelation is a hospital-administered infusion, not a field drug) — supportive care for the GI bleed/shock and prompt transport for chelation and monitoring are the complete field job.");
    notes.push("A real, delayed second phase — severe mitochondrial toxicity and metabolic acidosis as iron overwhelms the body's binding capacity — typically develops 6-24 hours after ingestion, well beyond this call's own window. That does not make it any less real; it is the reason this child needs hospital observation regardless of how she looks by the time you hand off, even if the vomiting settles.");
    if (s.given.saline || s.given.plasmalyte) notes.push("IV fluid was given for the GI losses and evolving hypovolemia — the correct supportive move for the phase this call can actually reach.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "ABDP", truth: "Pediatric iron overdose — direct corrosive GI injury (vomiting, abdominal pain, GI hemorrhage); the delayed mitochondrial/metabolic-acidosis phase is real but occurs 6-24h post-ingestion, beyond this call's window"};},
},

// Hydrocarbon aspiration (queue item 7, Toxicology — TOX-012). A toddler's
// accidental ingestion/aspiration of lighter fluid — the real, classic
// pediatric hydrocarbon-aspiration presentation. See conditions.js for the
// full mechanism (surfactant-disrupting chemical pneumonitis, mechanistically
// distinct from toxicInhalationChlorine's gas-phase airway injury).
hydrocarbonAspiration: {cat: "medical", id: "TOX-012", pronouns: "he", title: "Male, 3. Found coughing after drinking from a lighter-fluid bottle.",
  limit: 1200, transport: 480,
  bystanders: "His father, who found him with the bottle. \"It was in the garage, he must have gotten into it while I was grilling. He coughed hard right away and it kept getting worse.\"",
  units: [{at: 420, level: "emt", name: "BLS 12"}],
  dispatch: ["3M, possible ingestion, coughing.", "Father reports lighter fluid, small amount swallowed.", "Conscious, coughing."],
  update: [],
  impression: "A young boy on his father's lap, coughing repeatedly, breathing looks a little labored, no obvious distress at rest yet.",
  imps: ["ODPO", "SOBB"],
  condition: "hydrocarbonAspiration",
  locWeights: {house: 7, apartment: 3},
  patient: {age: 3, gender: "male"},
  clothing: {top: "short", bottom: "shorts", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "His father: \"Charcoal lighter fluid, the can was open next to him. He coughed and gagged right when it happened, maybe 15 minutes ago. He's never been sick before.\"", kind: "pt",
      evid: "A witnessed hydrocarbon ingestion with immediate coughing/gagging is the classic setup for aspiration — the coughing itself is often how a low-viscosity hydrocarbon like lighter fluid gets into the airway in the first place, not from the swallow.", find: "SAMPLE: lighter-fluid ingestion approximately 15 minutes ago with immediate coughing, no prior medical history."}),
    opqrst: () => ({say: "He keeps coughing in short bursts and won't stop fussing.", kind: "pt",
      evid: "Persistent coughing this soon after a witnessed hydrocarbon aspiration is the expected early airway-irritant response, before the real chemical pneumonitis has had time to fully develop.", find: "OPQRST: persistent coughing since the ingestion, no other complaint (limited by patient's age)."}),
    // Reads pat.compliance live — the real, worsening chemical pneumonitis
    // this condition's own conditions.js progress() derives directly, over
    // hours-scale onset rather than an instant step.
    lungs: (s) => {
      const c = s.patient?.compliance ?? 0.09;
      if (c < 0.06) return {say: "Crackles throughout both lung fields now, and he's working noticeably harder to breathe than he was a few minutes ago.", kind: "crit",
        evid: "Progressive crackles and increased work of breathing over the course of the call is the real, worsening chemical pneumonitis from surfactant disruption — this genuinely gets worse over hours, and you are watching the early part of it happen.", find: "Lungs: diffuse crackles, increased work of breathing, worsening since initial exam."};
      if (c < 0.08) return {say: "Faint crackles at the bases, a little more effort with each breath.", kind: "warn",
        evid: "Early, mild crackles developing over the encounter are the real, direct consequence of aspirated hydrocarbon stripping pulmonary surfactant — a genuinely different mechanism from a gas-phase airway burn.", find: "Lungs: faint bibasilar crackles, mild increased work of breathing."};
      return {say: "Clear right now, just coughing intermittently.", kind: "obs",
        evid: "Early aspiration pneumonitis can present with a clear initial exam — the chemical injury and resulting crackles genuinely take time to develop, this is not yet the worst of it.", find: "Lungs: clear to auscultation, occasional cough."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Hydrocarbon aspiration pneumonitis, unmanaged, progressed to respiratory failure.";
    notes.push("This is hydrocarbon aspiration pneumonitis — a genuinely different mechanism from chlorine gas's direct airway/mucosal burn: aspirated hydrocarbon directly disrupts pulmonary surfactant, dropping lung compliance and causing real, progressive chemical pneumonitis that worsens over hours, not seconds.");
    notes.push("There is no field antidote. Do NOT induce vomiting — a low-viscosity hydrocarbon like lighter fluid is far more dangerous aspirated on the way back up than it was swallowed. Supportive respiratory care and monitoring for worsening respiratory distress, plus transport for observation, are the complete field job — this can genuinely deteriorate well after your exam looks reassuring.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "SOBB", truth: "Pediatric hydrocarbon aspiration — direct surfactant disruption causing progressive chemical pneumonitis over hours, distinct from a gas-phase airway injury"};},
},

// Serotonin syndrome (queue item 7, Toxicology backlog — TOX-014). The
// classic drug-combination trigger: an SSRI patient who added tramadol
// (a real, well-documented serotonergic interaction — tramadol has its own
// independent serotonin-reuptake-inhibition activity on top of its opioid
// action) rather than a single massive overdose. See conditions.js for the
// full mechanism/literature writeup.
serotoninSyndrome: {cat: "medical", id: "TOX-014", pronouns: "she", title: "Female, 41. Agitated, shaking, burning up — back pain flared, took something new.",
  limit: 900, transport: 480,
  bystanders: "Her husband, pacing. \"She's been on Zoloft for years, fine on it. Her back's been killing her since Tuesday so her sister gave her some tramadol left over from a surgery. She took it a few times today. Now she's confused, shaking all over, and she's burning up.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 9"}],
  dispatch: ["41F, altered mental status, tremor.", "Husband reports fever and agitation, onset over the last few hours.", "Conscious, distressed."],
  update: [],
  impression: "Restless and agitated on the couch, shivering despite being visibly sweaty and flushed, legs twitching rhythmically when they touch the floor.",
  imps: ["ODPO", "ALOC", "SEIZ"],
  condition: "serotoninSyndrome",
  patient: {age: 41, gender: "female"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "Her husband: \"Sertraline, every morning, for maybe three years. Her sister gave her tramadol for the back pain, she said she's taken four or five over today. Nothing else. This all started a few hours ago and it's just gotten worse.\"", kind: "pt",
      evid: "A stable SSRI (sertraline) patient who added tramadol — a second, independently serotonergic drug — over the course of a day is the classic serotonin-syndrome trigger, not a single overdose.", find: "SAMPLE: chronic sertraline (SSRI), tramadol added today for back pain (several doses), symptom onset several hours ago and progressively worsening."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "She's talking but not making full sense, keeps repeating that she feels wrong and can't get comfortable." : "She isn't answering questions clearly.", kind: "pt",
      find: "OPQRST: onset several hours after adding tramadol to her regular sertraline, progressively worsening confusion/agitation/tremor.", evid: "A progressively worsening picture over hours after starting a second serotonergic drug on top of a chronic SSRI, rather than an instant reaction, matches serotonin syndrome's real, hours-scale time course."}),
    // Reads live physiology (conditions.js): the heart exam reports the real
    // hr/sbp/temp this condition drives, not scripted numbers.
    heart: (s, v) => {
      const clonus = s.patient?.serotoninClonus || 0;
      return {say: `Rate ${v.hr}, sbp ${v.sbp}/${v.dbp ?? "?"}. Temp ${v.temp}. Diaphoretic, flushed.${clonus >= 0.7 ? " Whole-body tremor, legs shaking more than her arms." : ""}`, kind: v.temp >= 39.5 ? "crit" : "obs",
        find: `Heart: rate ${v.hr}, sbp ${v.sbp}, temp ${v.temp}. Diaphoretic.`,
        evid: "Tachycardia, hypertension, fever, and diaphoresis together, on a patient who just added a second serotonergic drug to a chronic SSRI, is the autonomic-instability limb of serotonin syndrome — not a simple anxiety reaction."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Serotonin syndrome, unmanaged, progressed to refractory hyperthermia and multi-organ failure.";
    notes.push("This is serotonin syndrome (Hunter Criteria — Boyer & Shannon, NEJM 2005): the triad of neuromuscular hyperactivity (clonus/hyperreflexia, worse in the legs than the arms — check deep tendon reflexes), autonomic instability (hyperthermia, tachycardia, hypertension, diaphoresis), and altered mental status (agitation, confusion). It followed a real, classic trigger: adding tramadol (independently serotonergic on top of its opioid action) to a chronic SSRI.");
    notes.push("There is no field antidote — cyproheptadine, the real 5-HT2A-antagonist definitive treatment, is an oral drug and is not carried on this unit. The real field job is benzodiazepines for agitation and seizure risk, and active cooling for the hyperthermia — cooling only partially offsets the ongoing heat production, it does not reverse the underlying process. Restraining her does nothing for the serotonergic crisis itself, and fighting against a restraint only drives her temperature higher from continued muscle activity — it is not a treatment.");
    notes.push("Naloxone does nothing here — this is not primarily an opioid toxidrome, even though tramadol has opioid activity; the serotonergic mechanism driving this presentation has nothing to do with opioid receptors.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "ALOC", truth: "Serotonin syndrome from an SSRI + tramadol interaction — clonus worse in the legs, hyperthermia, tachycardia, hypertension, agitation; no field antidote, benzodiazepines + cooling are the real interventions"};},
},

// Malaria (queue item 7, Infectious-disease backlog — INF-001). Real
// prehospital-relevant trigger: recent travel to an endemic region plus a
// febrile paroxysm. See conditions.js for the full mechanism/literature
// writeup (the hemolysis mechanism, metabolic.js's updateHemolysis, is
// genuinely new to this engine — see that file's own header comment).
malaria: {cat: "medical", id: "INF-001", pronouns: "he", title: "Male, 29. Fever, chills, fatigue — back from Nigeria two weeks ago.",
  limit: 900, transport: 480,
  bystanders: "His roommate, worried. \"He got back from visiting family in Nigeria about two weeks ago. He's been saying he felt off the last couple days, but tonight he just started shaking uncontrollably, then burning up. He's never been sick like this before.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 6"}],
  dispatch: ["29M, fever, chills, recent international travel.", "Roommate reports rigors then high fever, onset over the past two days.", "Conscious, uncomfortable."],
  update: [],
  impression: "Curled up on the couch under a blanket despite the room being warm, shivering, skin hot and dry to the touch, visibly exhausted.",
  imps: ["FEVR", "SEPS", "ALOC"],
  condition: "malaria",
  patient: {age: 29, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "His roommate: \"No medications, no allergies he's ever mentioned. He got back from Lagos, Nigeria about two weeks ago, was there visiting family for a month. He mentioned feeling tired and achy the last day or two but shrugged it off as jet lag. Tonight he had this awful shaking chill, then he was burning up.\"", kind: "pt",
      evid: "Recent travel to a malaria-endemic region (sub-Saharan Africa), combined with a rigor-then-fever paroxysm two weeks after return, is the real, textbook trigger pattern for falciparum malaria — travel history is the key clue, not the vitals alone.", find: "SAMPLE: no meds/allergies, returned from a month in Nigeria two weeks ago, onset of fatigue/malaise 1-2 days ago, rigors then high fever tonight."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "He says the shaking chills came on suddenly about an hour ago, then the fever hit right after. Says he's had headaches and body aches the last day or two." : "He's too exhausted to answer clearly.", kind: "pt",
      find: "OPQRST: sudden rigor followed by high fever tonight, preceded by 1-2 days of malaise/headache/myalgia, no prior episodes.", evid: "The classic malarial paroxysm sequence — cold/rigor stage, then hot/fever stage — layered on a several-day febrile prodrome after travel."}),
    // Reads live physiology (conditions.js/metabolic.js): the heart exam
    // reports the real hr/sbp/temp this condition drives, not scripted
    // numbers, and the reassessment reflects real hemolysis/fever if
    // re-checked later in the call.
    heart: (s, v) => {
      const sev = s.patient?._malariaSeverity ?? 0;
      return {say: `Rate ${v.hr}, sbp ${v.sbp}/${v.dbp ?? "?"}. Temp ${v.temp}. Skin hot, dry.${sev > 0.55 ? " Slow to respond, harder to keep his attention." : ""}`, kind: v.temp >= 39.5 ? "crit" : "obs",
        find: `Heart: rate ${v.hr}, sbp ${v.sbp}, temp ${v.temp}.`,
        evid: "A high, sustained fever with tachycardia in a patient with a confirmed endemic-region travel history is the real bedside picture of a malarial paroxysm — the travel history is what makes this diagnosable, not the vitals alone, which overlap with many other febrile illnesses."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Malaria, unrecognized, progressed to cerebral involvement and multi-organ dysfunction.";
    notes.push("This is malaria, most likely P. falciparum given the sub-Saharan African travel history and the severity of the presentation. The real trigger to catch is the travel history plus the febrile paroxysm (rigor, then high fever) — vitals alone overlap with many febrile illnesses. P. falciparum classically cycles fever every 48-72 hours, but a patient calling 911 is almost always caught mid-paroxysm, which is what this call shows.");
    notes.push("Two real mechanisms are driving this: (1) hemolytic anemia — parasitized red cells are destroyed IN the vascular space, a genuinely different process from bleeding, since the plasma itself is not lost, only the red cells suspended in it (WHO severe-malaria criteria define severe malarial anemia as Hb under 5 g/dL, though that level of anemia develops over days, not over this one call); (2) hypermetabolic fever from the febrile paroxysm itself. Severe, prolonged, untreated cases can progress to cerebral malaria (altered consciousness, seizures) and multi-organ dysfunction.");
    notes.push("No field antimalarial exists on this unit — artesunate, quinine, and doxycycline are all hospital-pharmacy drugs, never carried in the field. The real field job is recognizing the travel-history-plus-fever pattern, treating supportively (active cooling for the fever, fluids for perfusion), and transporting promptly so a hospital lab can confirm the diagnosis and start real antimalarial therapy.");
    return {died, cause, notes, correct: s.pi === "FEVR" || s.pi === "SEPS", truth: "Malaria (likely P. falciparum) after travel to a sub-Saharan African endemic region — rigor-then-fever paroxysm, real hemolytic anemia, no field antimalarial, recognize and transport"};},
},

// Neuroleptic malignant syndrome (queue item 7, Toxicology backlog —
// TOX-015). A real, clinically distinct contrast to serotoninSyndrome
// above: dopamine-antagonist trigger, sustained lead-pipe rigidity instead
// of clonus, a days-scale (not hours-scale) time course, and often more
// severe hyperthermia. See conditions.js for the full mechanism/literature
// writeup.
neurolepticMalignantSyndrome: {cat: "medical", id: "TOX-015", pronouns: "he", title: "Male, 47. Rigid and febrile, found by family, on a psych med recently increased.",
  limit: 900, transport: 480,
  bystanders: "His sister, badly shaken. \"He's been on haloperidol for years, they just raised his dose about three days ago after he had a rough stretch. Today I let myself in and he's just lying there, stiff as a board, burning up, barely talking. This isn't him.\"",
  units: [{at: 360, level: "paramedic", name: "Medic 11"}],
  dispatch: ["47M, altered mental status, found rigid.", "Sister reports a psychiatric medication dose increase three days ago.", "Conscious, minimally responsive."],
  update: [],
  impression: "Lying stiff on the couch, whole body rigid, sweating heavily, barely tracking, mouth working slowly but not forming words.",
  imps: ["ODPO", "ALOC"],
  condition: "neurolepticMalignantSyndrome",
  patient: {age: 47, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: true},
  seed: () => ({}),
  probes: {
    sample: () => ({say: "His sister: \"Haloperidol, for years, for his schizophrenia. His psychiatrist raised the dose three days ago. No other medications that I know of. He was fine until yesterday, then he started getting stiff and quiet, and today he's like this. Burning up since last night.\"", kind: "pt",
      evid: "A chronic antipsychotic patient whose dose was increased days ago, developing rigidity and fever over the following days, is the classic neuroleptic malignant syndrome trigger and time course, not a sudden reaction.", find: "SAMPLE: chronic haloperidol, dose increased three days ago, progressive rigidity and fever over the last day."}),
    opqrst: (s, v) => ({say: v._cons === "awake" ? "He's minimally responsive, mumbling, not forming clear words." : "He isn't answering questions.", kind: "pt",
      find: "OPQRST: onset over three days following a haloperidol dose increase, progressive rigidity, fever, and decreasing responsiveness.", evid: "A slow, multi-day progression after a dopamine-antagonist dose increase, rather than a rapid hours-scale onset, matches neuroleptic malignant syndrome's real time course, distinct from serotonin syndrome's faster onset."}),
    // Reads live physiology (conditions.js): the heart exam reports the real
    // hr/sbp/temp this condition drives, not scripted numbers.
    heart: (s, v) => {
      const rigidity = s.patient?.nmsRigidity || 0;
      return {say: `Rate ${v.hr}, sbp ${v.sbp}/${v.dbp ?? "?"}. Temp ${v.temp}. Diaphoretic.${rigidity >= 0.7 ? " His whole body is board stiff, doesn't relax with anything you do." : ""}`, kind: v.temp >= 39.5 ? "crit" : "obs",
        find: `Heart: rate ${v.hr}, sbp ${v.sbp}, temp ${v.temp}. Diaphoretic.`,
        evid: "Tachycardia, labile blood pressure, and severe fever on a patient recently started or increased on an antipsychotic, together with sustained rigidity, is the autonomic-instability limb of neuroleptic malignant syndrome."};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Neuroleptic malignant syndrome, unmanaged, progressed to refractory hyperthermia and multi-organ failure.";
    notes.push("This is neuroleptic malignant syndrome (Caroff & Mann): the classic tetrad of severe, sustained lead-pipe rigidity (check for uniform tone through the full range of passive motion, no clonus), hyperthermia, autonomic instability (tachycardia, labile blood pressure, diaphoresis), and altered mental status. It followed a real, classic trigger, a haloperidol dose increase, over a genuine multi-day time course rather than an hours-scale onset.");
    notes.push("There is no field antidote. Dantrolene and bromocriptine, the real definitive treatments, are hospital-only agents not carried on this unit. The real field job is benzodiazepines for agitation and active cooling for the hyperthermia, and cooling here is even more clearly partial than for other hyperthermic toxidromes, because his rigidity is itself continuing to generate heat the whole time.");
    notes.push("Check for clonus specifically. He does not have any. That sustained, uniform rigidity with no clonus, on a patient recently started or increased on an antipsychotic, is the real bedside sign that separates this from serotonin syndrome, not the fever or the tachycardia alone.");
    return {died, cause, notes, correct: s.pi === "ODPO" || s.pi === "ALOC", truth: "Neuroleptic malignant syndrome from a haloperidol dose increase, developing over days, sustained lead-pipe rigidity, hyperthermia, autonomic instability, altered mental status; no field antidote, benzodiazepines + cooling are the real interventions"};},
},

// Box jellyfish envenomation (queue item 7, Toxicology/Environmental —
// ENV-015). Genuinely distinct from the already-shipped `envenomation`
// (crotaline/pit-viper coagulopathy) — a cardiotoxic venom, not a
// hemotoxic one. See conditions.js for the full mechanism.
boxJellyfishSting: {cat: "medical", id: "ENV-015", pronouns: "he", title: "Male, 27. Screaming in pain after a swim, welts across his torso.",
  limit: 900, transport: 420,
  bystanders: "Two other swimmers who pulled him out of the water and are pouring vinegar from a beach-stand bottle over the welts.",
  units: [{at: 360, level: "emt", name: "Lifeguard Unit 2"}],
  dispatch: ["27M, marine sting, severe pain.", "Bystanders report jellyfish, welts visible.", "Conscious, in severe distress."],
  update: [],
  impression: "Writhing on the sand, long whip-like red welts crossing his chest and both arms, breathing fast, clutching his chest.",
  imps: ["ENVN"],
  condition: "boxJellyfishSting",
  locWeights: {beach: 10},
  patient: {age: 27, gender: "male"},
  clothing: {top: "none", bottom: "shorts", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "\"Something wrapped around me in the water — felt like being whipped with fire. It's not letting up at all.\"", kind: "pt",
      evid: "Immediate, severe, whip-like linear pain on contact is the classic box jellyfish presentation — the nematocyst venom causes both intense local injury and, in a significant envenomation, real cardiotoxicity.", find: "OPQRST: sudden severe linear stinging pain on contact with a marine organism in the water, ongoing."}),
    sample: () => ({say: "\"No allergies, no meds. I've never been stung by anything like this before.\"", kind: "pt",
      evid: "No prior sting history rules out a pure allergic/anaphylactic reaction as the explanation for this presentation — this is direct venom toxicity, not hypersensitivity.", find: "SAMPLE: no allergies/meds, no prior envenomation history."}),
    skin: () => ({say: "Long, red, whip-like linear welts crossing the chest and both arms, already blistering in places.", kind: "warn",
      evid: "Linear tentacle-contact welts are the visible fingerprint of a cnidarian sting, distinct from a puncture-wound bite.", find: "Skin: linear whip-like welts, chest and bilateral arms, early blistering."}),
    // Reads v.rhythm/v.hr live — the real, developing cardiotoxic substrate
    // this condition's own conditions.js progress() writes directly to
    // pat.rhythmInstability, not scripted text.
    heart: (s, v) => {
      if (v.rhythm === "VT" || v.rhythm === "torsades") return {say: "Wide-complex and fast on the monitor — this is not a stable rhythm.", kind: "crit",
        evid: "Box jellyfish venom is genuinely cardiotoxic — this is the real, most dangerous consequence of a significant envenomation, not an incidental finding.", find: "Heart: wide-complex tachyarrhythmia on the monitor."};
      return {say: `Regular, rate ${v.hr}, but he's clearly in agony.`, kind: v.hr > 130 ? "warn" : "obs", find: `Heart: sinus rhythm, rate ${v.hr}.`};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Box jellyfish envenomation, unmanaged, progressed to a lethal cardiotoxic arrhythmia.";
    notes.push("The bystanders on scene had already started pouring vinegar over the sting sites before you arrived — the correct first move, and worth confirming/continuing: vinegar deactivates any unfired nematocysts still stuck to the skin, preventing further envenomation, though it does nothing for venom already injected. It should be done before any attempt to remove tentacle fragments, which can otherwise trigger more stings.");
    notes.push("Australian box jellyfish antivenom exists, but it is a hospital-administered product and is not carried on this unit — the field job is vinegar decontamination, supportive care, and monitoring for the real cardiotoxic arrhythmia risk on the monitor, with prompt transport.");
    return {died, cause, notes, correct: s.pi === "ENVN", truth: "Box jellyfish (cardiotoxic) envenomation — real risk of a lethal arrhythmia; vinegar deactivates unfired nematocysts, no field antivenom is carried"};},
},

// Necrotizing fasciitis (queue item 7, section 8's Infectious-disease
// backlog). No existing Infectious-disease-adjacent scenario prefix
// exists in this file (grep-confirmed before picking one) — a new INFX
// prefix is started here.
necrotizingFasciitisCall: {cat: "medical", id: "INFX-001", pronouns: "he", title: "Male, 58. Diabetic, worsening leg pain for two days, now confused and hot.",
  limit: 1200, transport: 420,
  bystanders: "His daughter, on the phone with dispatch until you arrive. \"He cut his leg on a fence two days ago, it was nothing. Today he can't even stand me touching it and he's talking strange.\"",
  units: [{at: 320, level: "paramedic", name: "Medic 7"}],
  dispatch: ["58M diabetic, worsening leg pain two days after a minor laceration.", "Daughter reports fever and new confusion this morning."],
  update: ["Daughter: \"It's spreading. This morning the skin above his knee looks bruised and it wasn't like that an hour ago.\""],
  impression: "On the couch, flushed and sweating, breathing fast. He answers slowly, drifting off mid-sentence. His left lower leg has a small, unremarkable-looking laceration below the knee, but he screams when you touch skin two inches away from it, well outside where the wound itself would explain it.",
  imps: ["SEPS", "FEVR", "SHOK", "HOTN", "ALOC"],
  condition: "necrotizingFasciitis",
  patient: {age: 58, gender: "male"},
  clothing: {top: "short", bottom: "pants", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Daughter: \"Two days ago, a fence, just a scratch. Yesterday he said his leg hurt more than it looked like it should. This morning he could barely let me near it, and now he's talking strange.\"", kind: "pt",
      evid: "Pain that has grown rapidly, disproportionately, and far beyond what a minor laceration would explain — over only two days — is the single most cited early teaching point for necrotizing fasciitis: pain out of proportion to visible findings.", find: "Hx (collateral): minor leg laceration 2 days ago, rapidly worsening disproportionate pain, new confusion this morning."}),
    sample: () => ({say: "Daughter: \"He's diabetic, takes metformin and insulin. No allergies. He hasn't been eating much the last day, said he felt too sick.\"", kind: "pt",
      evid: "Diabetes is the single most common comorbidity in real necrotizing fasciitis — impaired local tissue immunity lets a minor wound become a fulminant deep soft-tissue infection.", find: "SAMPLE: diabetic (metformin, insulin), NKDA, poor oral intake x1 day."}),
    skin: (s, v) => ({say: `Hot and flushed, sweating. ${v.sbp < 100 ? "Cap refill is actually fairly brisk despite how low that pressure is." : "Cap refill brisk."} The leg itself looks far less alarming than the pain would suggest — a small, clean laceration, some dusky discoloration spreading above and below it.`, kind: "crit",
      evid: "Warm, flushed, vasodilated skin with a disproportionately unimpressive local wound and severe, spreading pain is the exact combination this condition exists to teach — the exam does not match the pain, and that mismatch IS the diagnosis.", find: "Skin: hot, flushed, diaphoretic; small laceration legL with early dusky discoloration spreading beyond the wound margin; pain grossly out of proportion to visible findings."}),
    heart: (s, v) => ({say: `Fast and bounding. Pressure reads ${v.sbp}/${v.dbp}.`, find: `Heart: tachycardic, bounding pulses. BP ${v.sbp}/${v.dbp}.`}),
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const fluidL = (s.given.saline || 0) * 0.5 + (s.given.plasmalyte || 0) * 0.5;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Untreated necrotizing fasciitis: the tissue destruction and the septic cascade it drives outrun what field resuscitation alone can hold back, and nothing here can stop the process itself — only surgery can.";
    notes.push("Pain grossly out of proportion to a small, unremarkable-looking wound, in a diabetic patient, progressing over hours to days into fever and confusion, is the pattern to recognize: necrotizing fasciitis, a true surgical emergency that a field exam alone can miss if the wound itself is judged on looks.");
    if (fluidL >= 1) notes.push("Aggressive crystalloid was the right first move for the septic-shock physiology this is now driving — early fluid resuscitation genuinely helps the hemodynamics here, the same way it does in any other septic-shock picture.");
    else notes.push("No meaningful fluid resuscitation given. This patient is septic on top of the local infection, and needed volume as a first move.");
    notes.push("There is no field antibiotic, and there is no field surgery — emergent debridement is the only definitive treatment for necrotizing fasciitis, and it does not exist in this box. Fluids will support his blood pressure, but they will not touch the pain or the tissue destruction driving it; both need a scalpel, not a bag of saline. The job here is recognizing it fast and getting him to a facility that can operate, not managing it on scene.");
    return {died, cause, notes, correct: s.pi === "SEPS" || s.pi === "SHOK", truth: "Necrotizing fasciitis — fulminant soft-tissue infection progressing to septic shock, no field cure, rapid transport for emergent surgical debridement"};},
},

// Dengue Fever (queue item 7, section 8's Infectious-disease backlog).
// Second entry in the INFX-* prefix started by necrotizingFasciitisCall.
// A travel-history-triggered presentation, the same framing precedent as
// this session's own malaria condition — a returning traveler from a
// dengue-endemic region, now several days into the illness and presenting
// exactly at the defervescence/critical-phase transition this condition's
// own comment describes.
dengueFeverCall: {cat: "medical", id: "INFX-002", pronouns: "she", title: "Female, 24. Returned from Southeast Asia 5 days ago, fever finally breaking, now feels worse.",
  limit: 1200, transport: 420,
  bystanders: "Her roommate, pacing the hallway. \"She got back from Thailand five days ago and has had this awful fever since two days after she landed. Today the fever finally started coming down and I thought she was getting better, but she just looks worse. She said her stomach hurts and I saw blood when she was brushing her teeth.\"",
  units: [{at: 320, level: "paramedic", name: "Medic 4"}],
  dispatch: ["24F, returning traveler from Southeast Asia, days of high fever now defervescing.", "Roommate reports gum bleeding and abdominal pain."],
  update: ["Roommate: \"Her legs, look at her legs, there's this rash and bruising that wasn't there this morning.\""],
  impression: "On the couch under a blanket despite the room being warm, pale and sweaty, holding her abdomen. She's alert but slow to answer, wincing when you touch behind her eyes or move her joints. Faint pinpoint bruising is visible on both lower legs, and there's a thin line of blood at her gumline.",
  imps: ["FEVR", "SHOK", "HOTN", "PMGT"],
  condition: "dengueFever",
  patient: {age: 24, gender: "female"},
  clothing: {top: "short", bottom: "shorts", shoes: false},
  seed: () => ({}),
  probes: {
    opqrst: () => ({say: "Roommate: \"High fever started about two days after she got back from Thailand, five days ago now. Terrible headache, pain behind her eyes, aching all over, she called it 'breakbone.' The fever was finally breaking this morning and I thought that meant she was over it.\"", kind: "pt",
      evid: "A febrile illness beginning days after return from a dengue-endemic region (Southeast Asia), with severe headache, retro-orbital pain and myalgia/arthralgia — the classic 'breakbone fever' triad — matching the febrile phase of dengue, days 1-3 of a typical course (WHO 2009 Dengue guidelines).", find: "OPQRST (collateral): fever + severe headache/retro-orbital pain/myalgia beginning 2 days post-travel-return to Southeast Asia, now day 5, fever recently defervescing."}),
    sample: () => ({say: "Roommate: \"No medications, no allergies she's told me about. She hasn't been able to eat much, mostly just sipping water. This is her first time back to Asia in years.\"", kind: "pt",
      evid: "Travel history to a dengue-endemic region is the single most important epidemiologic clue for this presentation — without it, a defervescing fever with new bleeding and abdominal pain has a much wider, less specific differential.", find: "SAMPLE: no meds/allergies known, poor oral intake, recent travel to Southeast Asia (dengue-endemic region)."}),
    skin: (s) => {
      const p = s.patient;
      const plt = p?.plateletCount ?? 250;
      const bleeding = plt < 100;
      return {say: bleeding
        ? "Pale, sweaty. Faint pinpoint red-purple spots on both lower legs, and a thin line of blood along her gumline that wasn't wiped away."
        : "Pale, sweaty, a few faint bruise-like marks on the shins.", kind: bleeding ? "warn" : "obs",
        evid: bleeding ? "Petechiae and mucosal bleeding (gums) alongside a real, falling platelet count are the bleeding-tendency half of severe dengue — a genuine coagulopathy, not just a rash." : "",
        find: `Skin: pale, diaphoretic${bleeding ? "; scattered petechiae bilateral lower legs, gingival bleeding" : "; mild bruising"}.`};
    },
    heart: (s, v) => {
      const p = s.patient;
      const leak = p?.capillaryLeak || 0;
      const plt = p?.plateletCount ?? 250;
      if (leak >= 0.15) return {say: `Rate ${v.hr}, pressure ${v.sbp}/${v.dbp} — narrowing pulse pressure. Her fever's coming down, but she looks worse than she did on approach, not better.`, kind: "crit",
        evid: "A narrowing pulse pressure with a falling temperature, in a patient several days into a dengue-consistent illness, is the real, counterintuitive warning sign of dengue's critical phase (plasma leakage into the extravascular space) — the patient appears to be improving by temperature alone while actually decompensating.", find: `Heart: tachycardic, narrowing pulse pressure (${v.sbp}/${v.dbp}). Temperature trending down while perfusion trends the wrong way.`};
      return {say: `Rate ${v.hr}, pressure ${v.sbp}/${v.dbp}.`, find: `Heart: tachycardic, BP ${v.sbp}/${v.dbp}.`,
        evid: plt < 100 ? "Platelet count already below the WHO warning-sign threshold, even before the hemodynamics show it." : ""};
    },
  },
  resolve: (s, v, arr) => {const notes = []; let died = !!arr, cause = arr?.story || "";
    const fluidL = (s.given.saline || 0) * 0.5 + (s.given.plasmalyte || 0) * 0.5;
    if (died) cause = (arr?.story ? arr.story + "\n\n" : "") + "Untreated severe dengue: unchecked plasma leakage into the extravascular space, on top of real thrombocytopenia, progressed to dengue shock syndrome.";
    notes.push("The fever breaking is not the same as getting better. In dengue, defervescence (typically days 3-7 of illness) is exactly when the real, dangerous process — plasma leakage from increased capillary permeability, plus real thrombocytopenia — takes over. A patient who looks like she's improving by temperature alone can be entering the highest-risk window of the whole illness.");
    if (fluidL > 0) notes.push("Cautious IV fluids are genuinely the right field-relevant move here, unlike several other toxidromes: dengue's plasma leakage responds to volume replacement the same way any other capillary-leak state does. Two real cautions are worth knowing, even if only one shows up on the monitor tonight: aggressive, repeated fluid dosing genuinely dilutes an already-low platelet count further (watch it happen on reassessment, not just in the textbook), and over-aggressive resuscitation can also cause harm once the leak eventually resolves (fluid overload) — the reason hospital management titrates carefully rather than simply running fluids wide open.");
    else notes.push("No fluids given. This patient's own falling pulse pressure and rising heart rate, even as her fever comes down, are the real, measurable signature of ongoing plasma leakage — cautious fluid resuscitation is the one genuinely field-actionable intervention here.");
    notes.push("There is no field antiviral for dengue. The job on scene is recognizing the real warning signs (bleeding, abdominal pain, a falling platelet count, narrowing pulse pressure as the fever breaks), supportive care, and prompt transport — not a cure.");
    return {died, cause, notes, correct: s.pi === "FEVR" || s.pi === "SHOK", truth: "Dengue fever entering its critical (defervescence) phase — real plasma leakage and thrombocytopenia, no field antiviral, cautious fluids and transport"};},
},
};
